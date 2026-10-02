/**
 * A learner's own fantasy league, loaded into the browser as the same three
 * tables the League Scorecard notebook builds — `managers`, `weekly_scores`,
 * `starter_points`, same columns, same order — so a query written on the
 * project page runs unchanged in Colab, and the other way round.
 *
 * Two ways in, matching the notebook: a Sleeper username (the API is public
 * and answers the browser directly), or a CSV of weekly scores for anyone on
 * ESPN or Yahoo. Nothing is sent to DataDraft and nothing is stored.
 *
 * Only completed regular-season weeks count. A week still being played, or a
 * future week (Sleeper returns those with rosters but zero points), would read
 * as a 0–0 game and wreck every luck number; playoffs are a different
 * competition and skew a season's all-play record.
 */

import {
  getLeague,
  getLeagueMatchups,
  getLeagueRosters,
  getLeagueUsers,
  getNflState,
  getUserByUsername,
  getUserLeagues,
  type SleeperLeague,
} from "@/lib/data/sleeper";

export type LeagueData = {
  source: "sleeper" | "csv";
  name: string;
  season: string;
  weeks: number[];
  managers: { roster_id: number; manager: string; league: string; season: string }[];
  weekly: {
    week: number;
    roster_id: number;
    matchup_id: number | null;
    points_for: number;
    points_against: number | null;
    win: number | null;
    manager: string;
  }[];
  starters: {
    week: number;
    roster_id: number;
    starter_points: number;
    roster_points: number;
    bench_left: number;
    manager: string;
  }[];
};

const r2 = (v: number) => Math.round(v * 100) / 100;

export async function findLeagues(username: string, season: string): Promise<SleeperLeague[]> {
  const name = username.trim();
  if (!name) throw new Error("Type your Sleeper username first.");
  // Sleeper answers an unknown username with `null`, not a 404.
  const user = await getUserByUsername(name).catch(() => null);
  if (!user) throw new Error(`Sleeper doesn't know a user called “${name}”. Check the spelling.`);
  const leagues = (await getUserLeagues(user.user_id, season)) ?? [];
  if (!leagues.length) throw new Error(`No ${season} NFL leagues for ${user.display_name || name}. Try another season.`);
  return leagues;
}

export async function loadSleeperLeague(leagueId: string): Promise<LeagueData> {
  const [league, users, rosters, state] = await Promise.all([
    getLeague(leagueId),
    getLeagueUsers(leagueId),
    getLeagueRosters(leagueId),
    getNflState(),
  ]);
  const nameByUser = new Map(users.map((u) => [u.user_id, u.display_name || u.username]));
  const managers = rosters.map((r) => ({
    roster_id: r.roster_id,
    manager: nameByUser.get(r.owner_id ?? "") ?? `Roster ${r.roster_id}`,
    league: league.name,
    season: league.season,
  }));
  const managerOf = new Map(managers.map((m) => [m.roster_id, m.manager]));

  let last = (league.settings?.playoff_week_start || 15) - 1;
  if (league.season === state.season) {
    if (state.season_type === "regular") last = Math.min(last, state.week - 1);
    else if (state.season_type !== "post") last = 0;
  }
  const weekNums = Array.from({ length: Math.max(0, last) }, (_, i) => i + 1);
  const weeks = await Promise.all(
    weekNums.map((w) => getLeagueMatchups(leagueId, w).then((m) => [w, m ?? []] as const)),
  );

  const weekly: LeagueData["weekly"] = [];
  const starters: LeagueData["starters"] = [];
  const played: number[] = [];
  for (const [week, matchups] of weeks) {
    if (!matchups.length || matchups.every((m) => !m.points)) continue;
    played.push(week);
    const byMatchup = new Map<number, typeof matchups>();
    for (const m of matchups) {
      if (m.matchup_id === null || m.matchup_id === undefined) continue;
      byMatchup.set(m.matchup_id, [...(byMatchup.get(m.matchup_id) ?? []), m]);
    }
    byMatchup.forEach((pair, mid) => {
      for (const m of pair) {
        const opp = pair.find((o) => o.roster_id !== m.roster_id);
        const pf = r2(Number(m.points) || 0);
        const pa = opp ? r2(Number(opp.points) || 0) : null;
        const manager = managerOf.get(m.roster_id) ?? `Roster ${m.roster_id}`;
        weekly.push({
          week,
          roster_id: m.roster_id,
          matchup_id: mid,
          points_for: pf,
          points_against: pa,
          win: pa === null ? null : pf > pa ? 1 : 0,
          manager,
        });
        const pp = m.players_points ?? {};
        const starterPts = (m.starters ?? [])
          .filter((id) => id && id !== "0")
          .reduce((s, id) => s + (Number(pp[id]) || 0), 0);
        const rosterPts = Object.values(pp).reduce((s, v) => s + (Number(v) || 0), 0);
        starters.push({
          week,
          roster_id: m.roster_id,
          starter_points: r2(starterPts),
          roster_points: r2(rosterPts),
          bench_left: r2(rosterPts - starterPts),
          manager,
        });
      }
    });
  }

  if (!weekly.length) {
    throw new Error(
      league.season === state.season
        ? `«${league.name}» has no completed weeks yet this season. Pick last season to see a full year.`
        : `No scored weeks found for «${league.name}».`,
    );
  }
  return { source: "sleeper", name: league.name, season: league.season, weeks: played, managers, weekly, starters };
}

/** One CSV line, honouring quotes. */
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const CSV_COLUMNS = ["manager", "week", "points_for", "points_against", "win"] as const;

/** The notebook's ESPN/Yahoo path: one row per manager per week. */
export function parseLeagueCsv(text: string, name = "My league"): LeagueData {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("That file has no rows under the header.");
  const header = splitCsv(lines[0]).map((h) => h.toLowerCase());
  const missing = CSV_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) throw new Error(`The CSV is missing: ${missing.join(", ")}.`);
  const at = Object.fromEntries(CSV_COLUMNS.map((c) => [c, header.indexOf(c)])) as Record<(typeof CSV_COLUMNS)[number], number>;

  const managers: LeagueData["managers"] = [];
  const idOf = new Map<string, number>();
  const weekly: LeagueData["weekly"] = [];
  lines.slice(1).forEach((line, i) => {
    const cells = splitCsv(line);
    const manager = cells[at.manager];
    const week = Number(cells[at.week]);
    const pf = Number(cells[at.points_for]);
    if (!manager || !Number.isFinite(week) || !Number.isFinite(pf)) {
      throw new Error(`Row ${i + 2} needs a manager, a week number and points_for.`);
    }
    if (!idOf.has(manager)) {
      idOf.set(manager, idOf.size + 1);
      managers.push({ roster_id: idOf.size, manager, league: name, season: "csv" });
    }
    const pa = cells[at.points_against] === "" ? null : Number(cells[at.points_against]);
    const win = cells[at.win] === "" ? null : Number(cells[at.win]);
    weekly.push({
      week,
      roster_id: idOf.get(manager)!,
      matchup_id: null,
      points_for: r2(pf),
      points_against: pa === null || !Number.isFinite(pa) ? null : r2(pa),
      win: win === null || !Number.isFinite(win) ? null : win ? 1 : 0,
      manager,
    });
  });
  const weeks = Array.from(new Set(weekly.map((w) => w.week))).sort((a, b) => a - b);
  return { source: "csv", name, season: "csv", weeks, managers, weekly, starters: [] };
}

const q = (v: string | number | null) =>
  v === null ? "NULL" : typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`;

/** The notebook's tables, column for column. */
export function leagueSeedSql(d: LeagueData): string {
  const rows = <T extends Record<string, string | number | null>>(table: string, items: T[], cols: (keyof T)[]) =>
    items.length
      ? `INSERT INTO ${table} VALUES ${items.map((it) => `(${cols.map((c) => q(it[c])).join(",")})`).join(",")};`
      : "";
  return [
    "CREATE TABLE managers (roster_id INTEGER, manager TEXT, league TEXT, season TEXT);",
    rows("managers", d.managers, ["roster_id", "manager", "league", "season"]),
    "CREATE TABLE weekly_scores (week INTEGER, roster_id INTEGER, matchup_id INTEGER, points_for REAL, points_against REAL, win INTEGER, manager TEXT);",
    rows("weekly_scores", d.weekly, ["week", "roster_id", "matchup_id", "points_for", "points_against", "win", "manager"]),
    "CREATE TABLE starter_points (week INTEGER, roster_id INTEGER, starter_points REAL, roster_points REAL, bench_left REAL, manager TEXT);",
    rows("starter_points", d.starters, ["week", "roster_id", "starter_points", "roster_points", "bench_left", "manager"]),
  ].join("\n");
}
