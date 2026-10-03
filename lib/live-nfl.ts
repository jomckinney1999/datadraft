/**
 * Live NFL data, straight from nflverse. Server-side only — it is imported by
 * a server component and parses megabytes of CSV, which must never reach a
 * browser.
 *
 * Everything else in the product runs on a pinned dataset, deliberately:
 * docs/DATA-PIPELINE.md's first rule is that lesson tables never auto-refresh,
 * because a silent swap breaks answer keys and lesson prose (it has, once).
 * This module is the other side of that rule — the parts of the site that
 * *should* be live: what happened in the league this week.
 *
 * Fetched on the server and never shipped to the browser as raw CSV; the page
 * renders a small summary. Caching is done by the page's `revalidate` rather
 * than Next's data cache, because games.csv is over the 2MB per-entry cache
 * limit and would silently refetch on every request.
 *
 * Betting columns are never read. games.csv ships moneylines, spreads and
 * totals; this product doesn't touch them (docs/PLAN.md, no gambling content).
 *
 * Source: nflverse-data, CC BY 4.0 — attribution is required wherever this is
 * shown (lib/data-source.ts holds the credit string).
 */

import { parse } from "csv-parse/sync";

const SCHEDULES =
  "https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv";
const WEEKLY = (season: number) =>
  `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_${season}.csv`;

export type LiveGame = {
  id: string;
  week: number;
  day: string;
  kickoff: string;
  away: string;
  awayScore: number | null;
  home: string;
  homeScore: number | null;
  final: boolean;
  roof: string;
  temp: number | null;
};

export type LivePerformer = {
  player: string;
  team: string;
  position: string;
  opponent: string;
  /** The number this board ranks by. */
  value: number;
  line: string;
  headshot: string | null;
};

export type LiveBoard = {
  id: string;
  label: string;
  /** Decimal places for the ranked number. Yards stay whole; points don't. */
  decimals: number;
  rows: LivePerformer[];
};

export type LiveWeek = {
  season: number;
  week: number;
  games: LiveGame[];
  /** Fantasy board, kept so older readers still have a list. */
  performers: LivePerformer[];
  /** Ranked lists the dashboard cycles through. */
  boards: LiveBoard[];
  /**
   * How much of the week has been played. The week shown is the newest one
   * with any final score, so on a Friday it's Thursday night alone: one game,
   * and leaders drawn from two teams. Say so wherever the week is shown.
   */
  progress: WeekProgress;
  fetchedAt: string;
};

export type WeekProgress = {
  played: number;
  total: number;
  /** Days with a final score, in calendar order ("Thursday"). */
  playedDays: string[];
  /** Days still to come ("Sunday", "Monday"). */
  pendingDays: string[];
  partial: boolean;
};

const DAY_ORDER = ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
const byDay = (a: string, b: string) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);

function progressOf(games: LiveGame[]): WeekProgress {
  const played = games.filter((g) => g.final);
  const playedDays = Array.from(new Set(played.map((g) => g.day).filter(Boolean))).sort(byDay);
  const pendingDays = Array.from(new Set(games.filter((g) => !g.final).map((g) => g.day).filter(Boolean))).sort(byDay);
  return { played: played.length, total: games.length, playedDays, pendingDays, partial: played.length < games.length };
}

const listOf = (days: string[]) =>
  days.length <= 1 ? days.join("") : `${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}`;

/**
 * The plain-English caveat for a week still being played, or null once every
 * game is in: "Week 4 so far is Thursday only: 1 of 16 games. Leaders will
 * change once Sunday and Monday are played."
 */
export function weekCaveat(live: Pick<LiveWeek, "week" | "progress">): string | null {
  const p = live.progress;
  if (!p.partial) return null;
  const so = p.playedDays.length ? `Week ${live.week} so far is ${listOf(p.playedDays)} only` : `Week ${live.week} is under way`;
  const pending = p.pendingDays.length ? ` once ${listOf(p.pendingDays)} ${p.pendingDays.length === 1 ? "is" : "are"} played` : " as the rest of the week is played";
  return `${so}: ${p.played} of ${p.total} games. These leaders will change${pending}.`;
}

async function getCsv(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`nflverse ${res.status} for ${url}`);
  return parse(await res.text(), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];
}

const num = (v: string | undefined): number | null => {
  if (v === undefined || v === "" || v === "NA") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function performer(
  r: Record<string, string>,
  value: number,
  line: string,
): LivePerformer {
  const shot = (r.headshot_url ?? "").trim();
  return {
    player: r.player_display_name || r.player_name || "",
    team: r.team || "",
    position: r.position || "",
    opponent: r.opponent_team || "",
    value,
    line,
    headshot: shot.startsWith("http") ? shot : null,
  };
}

function topBoard(
  rows: Record<string, string>[],
  id: string,
  label: string,
  decimals: number,
  pick: (r: Record<string, string>) => number | null,
  line: (r: Record<string, string>) => string,
): LiveBoard | null {
  const ranked = rows
    .map((r) => {
      const value = pick(r);
      return value === null || value <= 0 ? null : performer(r, value, line(r));
    })
    .filter((r): r is LivePerformer => Boolean(r))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  if (ranked.length < 3) return null;
  return { id, label, decimals, rows: ranked };
}

/** A one-line stat line, so a score means something without clicking through. */
function statLine(r: Record<string, string>): string {
  const bits: string[] = [];
  const py = num(r.passing_yards);
  const pt = num(r.passing_tds);
  const ry = num(r.rushing_yards);
  const rt = num(r.rushing_tds);
  const rec = num(r.receptions);
  const recy = num(r.receiving_yards);
  const rect = num(r.receiving_tds);
  if (py) bits.push(`${py} pass yds${pt ? `, ${pt} TD` : ""}`);
  if (ry) bits.push(`${ry} rush yds${rt ? `, ${rt} TD` : ""}`);
  if (rec) bits.push(`${rec} rec, ${recy ?? 0} yds${rect ? `, ${rect} TD` : ""}`);
  return bits.join(" · ") || "—";
}

/**
 * The most recent week with completed games, and what happened in it.
 * Returns null on any failure — this is a nice-to-have panel and must never
 * take a page down with it.
 */
export async function getLiveWeek(): Promise<LiveWeek | null> {
  try {
    const schedule = await getCsv(SCHEDULES);
    const season = Math.max(...schedule.map((g) => Number(g.season) || 0));
    const thisSeason = schedule.filter(
      (g) => Number(g.season) === season && g.game_type === "REG",
    );
    const done = thisSeason.filter((g) => (g.result ?? "").trim() !== "");
    if (done.length === 0) return null;
    const week = Math.max(...done.map((g) => Number(g.week) || 0));

    const games: LiveGame[] = thisSeason
      .filter((g) => Number(g.week) === week)
      .map((g) => ({
        id: g.game_id,
        week,
        day: g.weekday ?? "",
        kickoff: g.gametime ?? "",
        away: g.away_team,
        awayScore: num(g.away_score),
        home: g.home_team,
        homeScore: num(g.home_score),
        final: (g.result ?? "").trim() !== "",
        roof: g.roof ?? "",
        temp: num(g.temp),
      }))
      .sort((a, b) => Number(b.final) - Number(a.final));

    const weekly = await getCsv(WEEKLY(season));
    const weekRows = weekly.filter(
      (r) =>
        Number(r.week) === week &&
        (r.season_type ?? "REG") === "REG",
    );
    const boards = [
      topBoard(
        weekRows,
        "fantasy",
        "Top fantasy scorers",
        1,
        (r) => num(r.fantasy_points_ppr),
        statLine,
      ),
      topBoard(
        weekRows,
        "pass",
        "Passing yards",
        0,
        (r) => num(r.passing_yards),
        (r) => {
          const tds = num(r.passing_tds);
          const ints = num(r.passing_interceptions);
          return `${tds ?? 0} TD${ints ? ` · ${ints} INT` : ""}`;
        },
      ),
      topBoard(
        weekRows,
        "rush",
        "Rushing yards",
        0,
        (r) => num(r.rushing_yards),
        (r) => {
          const tds = num(r.rushing_tds);
          const att = num(r.carries);
          return `${att ?? 0} att${tds ? ` · ${tds} TD` : ""}`;
        },
      ),
      topBoard(
        weekRows,
        "rec",
        "Receiving yards",
        0,
        (r) => num(r.receiving_yards),
        (r) => {
          const rec = num(r.receptions);
          const tds = num(r.receiving_tds);
          return `${rec ?? 0} rec${tds ? ` · ${tds} TD` : ""}`;
        },
      ),
    ].filter((b): b is LiveBoard => Boolean(b));

    return {
      season,
      week,
      games,
      performers: boards[0]?.rows ?? [],
      boards,
      progress: progressOf(games),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
