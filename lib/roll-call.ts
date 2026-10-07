/**
 * Roll Call (/questions/roll-call; decided 2026-10-06, reworked the same
 * night): the daily "name every player on the list" game, where every list
 * comes with the query that makes it, in SQL, pandas, dplyr and Excel.
 *
 * It's a trivia game, not a memory test of one week's box score, so the
 * lists come in eight kinds, one a day in rotation:
 *
 *   leaders       the 10 players with the most rushing yards (so far)
 *   week          every WR who caught a TD in the newest week
 *   team-leaders  every AFC team's leading receiver
 *   threshold     every QB who has run for a TD (the bar scales with the season)
 *   opponent      everyone who has scored against the Chiefs
 *   big-game      every player with a 150-yard receiving game
 *   streak        every player who has scored in 3 straight games
 *   first-td      every WR who scored his first TD of the season this week
 *
 * Each tile carries a clue that narrows it down (a rank, a week, an
 * opponent, a position), and three clue tokens a board reveal initials, so
 * a fan can work answers out rather than only recall them.
 *
 * Things to keep true:
 *   - **Every list is a query.** The verifier runs each day's SQL against the
 *     rows the browser loads and fails if it isn't the board, in order, and
 *     runs the pandas version in Pyodide.
 *   - **Same board all day.** Everything counts weeks up to W, the newest
 *     week that has been "open" for two days (lib/roll-call-data's week ends
 *     + 2), so the morning data refresh that lands a new week can't change
 *     today's list. The kind rotates by the daily number; within a kind the
 *     variants cycle, so the same list doesn't come back for weeks.
 *   - **Thresholds scale with the season.** "WRs with 3+ receiving TDs" is a
 *     good list in October and a useless one in December, so a threshold
 *     list picks the bar from a ladder that gives about a dozen answers.
 *   - Board order is code-unit order (never localeCompare): it's what
 *     SQLite, pandas and dplyr all sort by.
 */

import { dailyNumber } from "./daily-share";
import { SITE_URL } from "./site";
import { teamName } from "./team-colors";
import {
  ROLL_CALL_PLAYERS,
  ROLL_CALL_ROWS,
  ROLL_CALL_SEASON,
  ROLL_CALL_WEEK_ENDS,
  type RollCallRow,
} from "./roll-call-data.generated";
import {
  PLAYER_WEEKS_CSV,
  type RollCallAnswer,
  type RollCallCode,
  type RollCallPuzzle,
} from "./roll-call-meta";

export { PLAYER_WEEKS_CSV, ROLL_CALL_CLUES, ROLL_CALL_STRIKES, seedSql } from "./roll-call-meta";
export type { RollCallAnswer, RollCallCode, RollCallPuzzle } from "./roll-call-meta";

export const MIN_ANSWERS = 5;
export const MAX_ANSWERS = 32;

const S = ROLL_CALL_SEASON;

// ── The rows ────────────────────────────────────────────────────────────

type Stat =
  | "passing_yards"
  | "passing_tds"
  | "rushing_yards"
  | "rushing_tds"
  | "receptions"
  | "receiving_yards"
  | "receiving_tds"
  | "fantasy_points_ppr"
  /** rushing_tds + receiving_tds */
  | "touchdowns";

const COL: Record<Exclude<Stat, "touchdowns">, number> = {
  passing_yards: 4,
  passing_tds: 5,
  rushing_yards: 6,
  rushing_tds: 7,
  receptions: 8,
  receiving_yards: 9,
  receiving_tds: 10,
  fantasy_points_ppr: 11,
};

const val = (r: RollCallRow, s: Stat): number => (s === "touchdowns" ? r[7] + r[10] : (r[COL[s]] as number));
const nameOf = (id: string) => ROLL_CALL_PLAYERS[id]?.[0] ?? id;
const posOf = (id: string) => ROLL_CALL_PLAYERS[id]?.[1] ?? "";
const shotOf = (id: string) => ROLL_CALL_PLAYERS[id]?.[2] ?? "";

/** Sum in whole tenths, so fantasy points add up exactly as SQLite's ROUND does. */
const sumOf = (rows: RollCallRow[], s: Stat) =>
  s === "fantasy_points_ppr" ? rows.reduce((a, r) => a + Math.round(val(r, s) * 10), 0) / 10 : rows.reduce((a, r) => a + val(r, s), 0);

/** Code-unit order, which is what SQLite's ORDER BY and dplyr's arrange use. */
const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function rowsThrough(week: number): RollCallRow[] {
  return ROLL_CALL_ROWS.filter((r) => r[3] <= week);
}

function byPlayer(rows: RollCallRow[]): Map<string, RollCallRow[]> {
  const m = new Map<string, RollCallRow[]>();
  for (const r of rows) {
    const list = m.get(r[0]);
    if (list) list.push(r);
    else m.set(r[0], [r]);
  }
  for (const list of Array.from(m.values())) list.sort((a, b) => a[3] - b[3]);
  return m;
}

/** A player's team as of his latest game in range. */
const latestTeam = (games: RollCallRow[]) => games[games.length - 1][1];

const td = (v: number) => (v === 1 ? "TD" : "TDs");
const weeksLabel = (weeks: number[]) => `Wk ${weeks.join(", ")}`;

// ── Dates and seeds ─────────────────────────────────────────────────────

const DAY_MS = 864e5;
const toUtc = (day: string) => Date.parse(`${day}T00:00:00Z`);
export const addDays = (day: string, n: number) => new Date(toUtc(day) + n * DAY_MS).toISOString().slice(0, 10);

function seedOf(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededOrder<T>(items: T[], seed: string): T[] {
  return items
    .map((item, i) => ({ item, k: seedOf(`${seed}:${i}`) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.item);
}

/** The day a week's lists join the rotation: two days after its last game. */
export function weekOpens(week: number): string | null {
  const end = ROLL_CALL_WEEK_ENDS[week];
  return end ? addDays(end, 2) : null;
}

/** The newest week whose lists are open on `day`, or null before Week 1. */
export function cutoffWeek(day: string): number | null {
  const open = Object.keys(ROLL_CALL_WEEK_ENDS)
    .map(Number)
    .filter((w) => (weekOpens(w) ?? "9999") <= day);
  return open.length ? Math.max(...open) : null;
}

// ── The code, written once per shape ────────────────────────────────────

const expr = (s: Stat) => (s === "touchdowns" ? "rushing_tds + receiving_tds" : s);
const sqlSum = (s: Stat) => (s === "fantasy_points_ppr" ? "ROUND(SUM(fantasy_points_ppr), 1)" : `SUM(${expr(s)})`);
const csvUrl = `${SITE_URL}${PLAYER_WEEKS_CSV(S)}`;
const pyHead = ["import pandas as pd", "", `player_weeks = pd.read_csv("${csvUrl}")`, ""];
const rHead = ["library(dplyr)", "", `player_weeks <- read.csv("${csvUrl}")`, ""];
const pySoFar = (w: number) => `so_far = player_weeks[(player_weeks.season == ${S}) & (player_weeks.week <= ${w})].copy()`;
const pyTds = "so_far[\"touchdowns\"] = so_far.rushing_tds + so_far.receiving_tds";
const rTds = "  mutate(touchdowns = rushing_tds + receiving_tds) |>";
const xlKeep = (w: number, extra = "") => `(PlayerWeeks[season]=${S}) * (PlayerWeeks[week]<=${w})${extra}`;
const xlValues = (s: Stat) => (s === "touchdowns" ? "PlayerWeeks[rushing_tds] + PlayerWeeks[receiving_tds]" : `PlayerWeeks[${s}]`);

/** Season totals per player, filtered or cut: leaders and thresholds. */
function totalsCode(o: { w: number; stat: Stat; pos: string | null; top?: number; min?: number }): RollCallCode {
  const { w, stat, pos, top, min } = o;
  const sql = [
    `SELECT player, ${sqlSum(stat)} AS ${stat}`,
    "FROM player_weeks",
    `WHERE season = ${S}`,
    `  AND week <= ${w}`,
    ...(pos ? [`  AND position = '${pos}'`] : []),
    "GROUP BY player_id, player",
    ...(min !== undefined ? [`HAVING ${sqlSum(stat)} >= ${min}`] : []),
    `ORDER BY ${stat} DESC, player${top ? `\nLIMIT ${top}` : ""};`,
  ].join("\n");
  const python = [
    ...pyHead,
    pySoFar(w),
    ...(pos ? [`so_far = so_far[so_far.position == "${pos}"]`] : []),
    ...(stat === "touchdowns" ? [pyTds] : []),
    `totals = so_far.groupby(["player_id", "player"], as_index=False)["${stat}"].sum()`,
    ...(stat === "fantasy_points_ppr" ? [`totals["${stat}"] = totals["${stat}"].round(1)`] : []),
    ...(min !== undefined ? [`totals = totals[totals.${stat} >= ${min}]`] : []),
    `answer = totals.sort_values(["${stat}", "player"], ascending=[False, True])${top ? `.head(${top})` : ""}`,
    `print(answer[["player", "${stat}"]].to_string(index=False))`,
  ].join("\n");
  const r = [
    ...rHead,
    "player_weeks |>",
    `  filter(season == ${S}, week <= ${w}${pos ? `, position == "${pos}"` : ""}) |>`,
    ...(stat === "touchdowns" ? [rTds] : []),
    "  group_by(player_id, player) |>",
    `  summarise(${stat} = ${stat === "fantasy_points_ppr" ? `round(sum(${stat}), 1)` : `sum(${stat})`}, .groups = "drop") |>`,
    ...(min !== undefined ? [`  filter(${stat} >= ${min}) |>`] : []),
    `  arrange(desc(${stat}), player) |>`,
    ...(top ? [`  slice_head(n = ${top}) |>`] : []),
    `  select(player, ${stat})`,
  ].join("\n");
  const excel = [
    "=LET(",
    `  keep, ${xlKeep(w, pos ? ` * (PlayerWeeks[position]="${pos}")` : "")},`,
    `  totals, GROUPBY(FILTER(PlayerWeeks[player], keep), FILTER(${xlValues(stat)}, keep), SUM, 0, 0, -2),`,
    top ? `  TAKE(totals, ${top})` : `  FILTER(totals, INDEX(totals, , 2) >= ${min})`,
    ")",
  ].join("\n");
  return { sql, python, r, excel, excelNote: "Excel 365 (GROUPBY). Make the CSV a table named PlayerWeeks first (Ctrl+T)." };
}

// ── The kinds of list ───────────────────────────────────────────────────

type Candidate = {
  key: string;
  kind: string;
  label: string;
  prompt: string;
  note: string;
  teamCodes?: boolean;
  answers: RollCallAnswer[];
  code: RollCallCode;
};

const inRange = (n: number, lo = MIN_ANSWERS, hi = MAX_ANSWERS) => n >= lo && n <= hi;
const through = (w: number) => `in ${S}, through Week ${w}`;

/** The bar from a ladder whose list is closest to `aim` long (the higher bar on a tie). */
function pickBar(ladder: number[], count: (n: number) => number, lo: number, hi: number, aim = 12): number | null {
  let best: number | null = null;
  let bestGap = Infinity;
  for (const n of ladder) {
    const c = count(n);
    if (c < lo || c > hi) continue;
    const gap = Math.abs(c - aim);
    if (gap < bestGap || (gap === bestGap && best !== null && n > best)) {
      best = n;
      bestGap = gap;
    }
  }
  return best;
}

// leaders ──────────────────────────────────────────────────────────────

const LEADERS: { stat: Stat; what: string; unit: string }[] = [
  { stat: "rushing_yards", what: "rushing yards", unit: "yds" },
  { stat: "receiving_yards", what: "receiving yards", unit: "yds" },
  { stat: "passing_yards", what: "passing yards", unit: "yds" },
  { stat: "receptions", what: "catches", unit: "rec" },
  { stat: "fantasy_points_ppr", what: "PPR fantasy points", unit: "pts" },
  { stat: "touchdowns", what: "rushing and receiving touchdowns", unit: "TDs" },
];

function leaders(w: number): Candidate[] {
  const games = byPlayer(rowsThrough(w));
  return LEADERS.flatMap(({ stat, what, unit }) => {
    const totals = Array.from(games.entries())
      .map(([id, g]) => ({ id, g, v: sumOf(g, stat) }))
      .sort((a, b) => b.v - a.v || byText(nameOf(a.id), nameOf(b.id)));
    const top = [10, 9, 11, 8, 12].find((n) => totals.length > n && totals[n - 1].v > 0 && totals[n - 1].v !== totals[n].v);
    if (!top) return [];
    const board = totals.slice(0, top);
    const answers = board.map(({ id, g, v }): RollCallAnswer => {
      const rank = 1 + totals.filter((t) => t.v > v).length;
      return { id, name: nameOf(id), position: posOf(id), team: latestTeam(g), value: v, unit, clue: `#${rank}`, mystery: rank <= 2, headshot: shotOf(id) };
    });
    return [
      {
        key: `leaders-${stat}`,
        kind: "leaders",
        label: "Season leaders",
        prompt: `Name the ${top} players with the most ${what} ${through(w)}.`,
        note: `Each tile is a rank, with the player's position, his team as of Week ${w} and his total. No team shown for the top two.`,
        answers,
        code: totalsCode({ w, stat, pos: null, top }),
      },
    ];
  });
}

// team leaders ───────────────────────────────────────────────────────────

const AFC = ["BAL", "BUF", "CIN", "CLE", "DEN", "HOU", "IND", "JAX", "KC", "LAC", "LV", "MIA", "NE", "NYJ", "PIT", "TEN"];
const NFC = ["ARI", "ATL", "CAR", "CHI", "DAL", "DET", "GB", "LA", "MIN", "NO", "NYG", "PHI", "SEA", "SF", "TB", "WAS"];

const TEAM_LEADERS: { stat: Stat; who: string; by: string; unit: string }[] = [
  { stat: "receiving_yards", who: "leading receiver", by: "receiving yards", unit: "yds" },
  { stat: "rushing_yards", who: "leading rusher", by: "rushing yards", unit: "yds" },
  { stat: "passing_yards", who: "leading passer", by: "passing yards", unit: "yds" },
  { stat: "fantasy_points_ppr", who: "top fantasy scorer", by: "PPR points", unit: "pts" },
];

function teamLeaders(w: number): Candidate[] {
  const rows = rowsThrough(w);
  const out: Candidate[] = [];
  for (const [conf, teams] of [["AFC", AFC], ["NFC", NFC]] as const) {
    for (const { stat, who, by, unit } of TEAM_LEADERS) {
      const answers: RollCallAnswer[] = [];
      let ok = true;
      for (const team of teams) {
        const per = new Map<string, RollCallRow[]>();
        for (const r of rows) if (r[1] === team) per.set(r[0], [...(per.get(r[0]) ?? []), r]);
        const ranked = Array.from(per.entries()).map(([id, g]) => ({ id, v: sumOf(g, stat) })).sort((a, b) => b.v - a.v);
        if (!ranked.length || ranked[0].v <= 0 || (ranked[1] && ranked[1].v === ranked[0].v)) {
          ok = false;
          break;
        }
        const { id, v } = ranked[0];
        answers.push({ id, name: nameOf(id), position: posOf(id), team, value: v, unit, clue: team, mystery: false, headshot: shotOf(id) });
      }
      // A player traded inside the conference could lead two teams; that
      // board would fill two tiles with one name, so leave it out.
      if (!ok || new Set(answers.map((a) => a.id)).size !== answers.length) continue;
      const list = teams.map((t) => `'${t}'`).join(", ");
      const sum = sqlSum(stat);
      const sql = [
        "WITH totals AS (",
        `  SELECT team, player, ${sum} AS ${stat}`,
        "  FROM player_weeks",
        `  WHERE season = ${S} AND week <= ${w}`,
        "  GROUP BY team, player_id, player",
        "),",
        "ranked AS (",
        `  SELECT team, player, ${stat},`,
        `         RANK() OVER (PARTITION BY team ORDER BY ${stat} DESC) AS rk`,
        "  FROM totals",
        ")",
        `SELECT team, player, ${stat}`,
        "FROM ranked",
        "WHERE rk = 1",
        `  AND team IN (${list})`,
        "ORDER BY team;",
      ].join("\n");
      const pyList = teams.map((t) => `"${t}"`).join(", ");
      const python = [
        ...pyHead,
        `${conf.toLowerCase()} = [${pyList}]`,
        pySoFar(w),
        `totals = so_far.groupby(["team", "player_id", "player"], as_index=False)["${stat}"].sum()`,
        ...(stat === "fantasy_points_ppr" ? [`totals["${stat}"] = totals["${stat}"].round(1)`] : []),
        `leaders = totals.sort_values("${stat}", ascending=False).drop_duplicates("team")`,
        `answer = leaders[leaders.team.isin(${conf.toLowerCase()})].sort_values("team")`,
        `print(answer[["team", "player", "${stat}"]].to_string(index=False))`,
      ].join("\n");
      const r = [
        ...rHead,
        `${conf.toLowerCase()} <- c(${pyList})`,
        "",
        "player_weeks |>",
        `  filter(season == ${S}, week <= ${w}, team %in% ${conf.toLowerCase()}) |>`,
        "  group_by(team, player_id, player) |>",
        `  summarise(${stat} = ${stat === "fantasy_points_ppr" ? `round(sum(${stat}), 1)` : `sum(${stat})`}, .groups = "drop") |>`,
        "  group_by(team) |>",
        `  slice_max(${stat}, n = 1) |>`,
        "  ungroup() |>",
        "  arrange(team) |>",
        `  select(team, player, ${stat})`,
      ].join("\n");
      out.push({
        key: `team-leaders-${conf}-${stat}`,
        kind: "team-leaders",
        label: "Team leaders",
        prompt: `Name every ${conf} team's ${who} ${through(w)}, by ${by}.`,
        note: `Each tile is a team: name the player with the most ${by} for it so far. Each tile also shows his position and total.`,
        teamCodes: true,
        answers,
        code: {
          sql,
          python,
          r,
          excel: null,
          excelNote: `Per-team leaders are a PivotTable job in Excel: filter season ${S} and week up to ${w}, put team then player in Rows and Sum of ${stat} in Values, sort largest to smallest, and read the first player under each ${conf} team.`,
        },
      });
    }
  }
  return out;
}

// thresholds ─────────────────────────────────────────────────────────────

const THRESHOLDS: { id: string; pos: string; stat: Stat; ladder: number[]; unit: (v: number) => string; ask: (n: number) => string }[] = [
  { id: "wr-rec-td", pos: "WR", stat: "receiving_tds", ladder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14], unit: td, ask: (n) => (n === 1 ? "every WR who has caught a touchdown" : `every WR with ${n} or more receiving touchdowns`) },
  { id: "te-rec-td", pos: "TE", stat: "receiving_tds", ladder: [1, 2, 3, 4, 5, 6, 8, 10], unit: td, ask: (n) => (n === 1 ? "every TE who has caught a touchdown" : `every TE with ${n} or more receiving touchdowns`) },
  { id: "rb-rush-td", pos: "RB", stat: "rushing_tds", ladder: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15], unit: td, ask: (n) => (n === 1 ? "every RB who has run for a touchdown" : `every RB with ${n} or more rushing touchdowns`) },
  { id: "qb-rush-td", pos: "QB", stat: "rushing_tds", ladder: [1, 2, 3, 4, 5, 6, 8], unit: td, ask: (n) => (n === 1 ? "every QB who has run for a touchdown" : `every QB with ${n} or more rushing touchdowns`) },
  { id: "rb-rec-yds", pos: "RB", stat: "receiving_yards", ladder: [100, 150, 200, 250, 300, 400, 500, 600, 800], unit: () => "yds", ask: (n) => `every RB with ${n} or more receiving yards` },
  { id: "qb-pass-td", pos: "QB", stat: "passing_tds", ladder: [3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 35], unit: td, ask: (n) => `every QB with ${n} or more touchdown passes` },
  { id: "wr-rec", pos: "WR", stat: "receptions", ladder: [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110], unit: () => "rec", ask: (n) => `every WR with ${n} or more catches` },
  { id: "te-rec-yds", pos: "TE", stat: "receiving_yards", ladder: [100, 150, 200, 250, 300, 400, 500, 600, 800, 1000], unit: () => "yds", ask: (n) => `every TE with ${n} or more receiving yards` },
];

function thresholds(w: number): Candidate[] {
  const games = byPlayer(rowsThrough(w));
  return THRESHOLDS.flatMap((t) => {
    const totals = Array.from(games.entries()).filter(([id]) => posOf(id) === t.pos).map(([id, g]) => ({ id, g, v: sumOf(g, t.stat) }));
    const bar = pickBar(t.ladder, (n) => totals.filter((x) => x.v >= n).length, 6, 24);
    if (bar === null) return [];
    const board = totals.filter((x) => x.v >= bar).sort((a, b) => b.v - a.v || byText(nameOf(a.id), nameOf(b.id)));
    const max = board[0].v;
    return [
      {
        key: `threshold-${t.id}`,
        kind: "threshold",
        label: "Season milestones",
        prompt: `Name ${t.ask(bar)} ${through(w)}.`,
        note: `Each tile: the player's team as of Week ${w} and his total. No team shown for the leader.`,
        answers: board.map(({ id, g, v }) => ({ id, name: nameOf(id), position: posOf(id), team: latestTeam(g), value: v, unit: t.unit(v), clue: t.pos, mystery: v === max, headshot: shotOf(id) })),
        code: totalsCode({ w, stat: t.stat, pos: t.pos, min: bar }),
      },
    ];
  });
}

// opponent ───────────────────────────────────────────────────────────────

function opponent(w: number): Candidate[] {
  const rows = rowsThrough(w).filter((r) => val(r, "touchdowns") > 0);
  const opps = Array.from(new Set(rows.map((r) => r[2]))).sort(byText);
  return opps.flatMap((opp) => {
    const per = new Map<string, RollCallRow[]>();
    for (const r of rows) if (r[2] === opp) per.set(`${r[0]}|${r[1]}`, [...(per.get(`${r[0]}|${r[1]}`) ?? []), r]);
    if (!inRange(per.size, 5, 16)) return [];
    const answers = Array.from(per.values())
      .map((g): RollCallAnswer => {
        const v = sumOf(g, "touchdowns");
        return { id: g[0][0], name: nameOf(g[0][0]), position: posOf(g[0][0]), team: g[0][1], value: v, unit: td(v), clue: weeksLabel(g.map((r) => r[3])), mystery: false, headshot: shotOf(g[0][0]) };
      })
      .sort((a, b) => b.value - a.value || byText(a.team, b.team) || byText(a.name, b.name));
    if (new Set(answers.map((a) => a.id)).size !== answers.length) return [];
    const sql = [
      "SELECT player, team, SUM(rushing_tds + receiving_tds) AS touchdowns",
      "FROM player_weeks",
      `WHERE season = ${S}`,
      `  AND week <= ${w}`,
      `  AND opponent = '${opp}'`,
      "  AND rushing_tds + receiving_tds > 0",
      "GROUP BY player_id, player, team",
      "ORDER BY touchdowns DESC, team, player;",
    ].join("\n");
    const python = [
      ...pyHead,
      pySoFar(w),
      pyTds,
      `vs = so_far[(so_far.opponent == "${opp}") & (so_far.touchdowns > 0)]`,
      `answer = vs.groupby(["player_id", "player", "team"], as_index=False)["touchdowns"].sum()`,
      `answer = answer.sort_values(["touchdowns", "team", "player"], ascending=[False, True, True])`,
      `print(answer[["player", "team", "touchdowns"]].to_string(index=False))`,
    ].join("\n");
    const r = [
      ...rHead,
      "player_weeks |>",
      `  filter(season == ${S}, week <= ${w}, opponent == "${opp}") |>`,
      rTds,
      "  filter(touchdowns > 0) |>",
      "  group_by(player_id, player, team) |>",
      '  summarise(touchdowns = sum(touchdowns), .groups = "drop") |>',
      "  arrange(desc(touchdowns), team, player) |>",
      "  select(player, team, touchdowns)",
    ].join("\n");
    const excel = [
      "=LET(",
      "  td, PlayerWeeks[rushing_tds] + PlayerWeeks[receiving_tds],",
      `  keep, ${xlKeep(w, ` * (PlayerWeeks[opponent]="${opp}") * (td>0)`)},`,
      "  GROUPBY(FILTER(PlayerWeeks[player], keep), FILTER(td, keep), SUM, 0, 0, -2)",
      ")",
    ].join("\n");
    return [
      {
        key: `opponent-${opp}`,
        kind: "opponent",
        label: "Scored against them",
        prompt: `Name everyone who has scored a rushing or receiving touchdown against the ${teamName(opp)} ${through(w)}.`,
        note: "Each tile: the scorer's team, how many he scored against them, and the weeks he did it.",
        answers,
        code: { sql, python, r, excel, excelNote: "Excel 365 (GROUPBY). Make the CSV a table named PlayerWeeks first (Ctrl+T)." },
      },
    ];
  });
}

// big games ──────────────────────────────────────────────────────────────

const BIG_GAMES: { id: string; stat: Stat; ladder: number[]; unit: (v: number) => string; ask: (n: number) => string }[] = [
  { id: "ppr", stat: "fantasy_points_ppr", ladder: [25, 30, 35, 40, 45, 50], unit: () => "pts", ask: (n) => `every player who has had a ${n}-point PPR game` },
  { id: "rec-yds", stat: "receiving_yards", ladder: [100, 125, 150, 175, 200], unit: () => "yds", ask: (n) => `every player with a ${n}-yard receiving game` },
  { id: "rush-yds", stat: "rushing_yards", ladder: [100, 125, 150, 175, 200], unit: () => "yds", ask: (n) => `every player with a ${n}-yard rushing game` },
  { id: "pass-yds", stat: "passing_yards", ladder: [300, 325, 350, 375, 400, 450], unit: () => "yds", ask: (n) => `every QB with a ${n}-yard passing game` },
  { id: "td", stat: "touchdowns", ladder: [2, 3, 4], unit: td, ask: (n) => `every player who has scored ${n} or more touchdowns in one game` },
];

function bigGames(w: number): Candidate[] {
  const games = byPlayer(rowsThrough(w));
  return BIG_GAMES.flatMap((b) => {
    const bests = Array.from(games.entries()).map(([id, g]) => {
      const v = Math.max(...g.map((r) => val(r, b.stat)));
      const game = g.find((r) => val(r, b.stat) === v)!;
      return { id, v, game };
    });
    const bar = pickBar(b.ladder, (n) => bests.filter((x) => x.v >= n).length, 5, 20, 10);
    if (bar === null) return [];
    const board = bests.filter((x) => x.v >= bar).sort((a, b2) => b2.v - a.v || byText(nameOf(a.id), nameOf(b2.id)));
    const max = board[0].v;
    const e = expr(b.stat);
    const alias = b.stat === "touchdowns" ? "touchdowns" : `best_${b.stat}`;
    const sql = [
      `SELECT player, MAX(${e}) AS ${alias}`,
      "FROM player_weeks",
      `WHERE season = ${S}`,
      `  AND week <= ${w}`,
      "GROUP BY player_id, player",
      `HAVING MAX(${e}) >= ${bar}`,
      `ORDER BY ${alias} DESC, player;`,
    ].join("\n");
    const python = [
      ...pyHead,
      pySoFar(w),
      ...(b.stat === "touchdowns" ? [pyTds] : []),
      `best = so_far.groupby(["player_id", "player"], as_index=False)["${b.stat}"].max()`,
      `answer = best[best.${b.stat} >= ${bar}].sort_values(["${b.stat}", "player"], ascending=[False, True])`,
      `print(answer[["player", "${b.stat}"]].to_string(index=False))`,
    ].join("\n");
    const r = [
      ...rHead,
      "player_weeks |>",
      `  filter(season == ${S}, week <= ${w}) |>`,
      ...(b.stat === "touchdowns" ? [rTds] : []),
      "  group_by(player_id, player) |>",
      `  summarise(${alias} = max(${b.stat}), .groups = "drop") |>`,
      `  filter(${alias} >= ${bar}) |>`,
      `  arrange(desc(${alias}), player) |>`,
      `  select(player, ${alias})`,
    ].join("\n");
    const excel = [
      "=LET(",
      `  keep, ${xlKeep(w)},`,
      `  best, GROUPBY(FILTER(PlayerWeeks[player], keep), FILTER(${xlValues(b.stat)}, keep), MAX, 0, 0, -2),`,
      `  FILTER(best, INDEX(best, , 2) >= ${bar})`,
      ")",
    ].join("\n");
    return [
      {
        key: `big-game-${b.id}`,
        kind: "big-game",
        label: "Big games",
        prompt: `Name ${b.ask(bar)} ${through(w)}.`,
        note: "Each tile: the player's team in that game, his best game and the week it came. No team shown for the biggest.",
        answers: board.map(({ id, v, game }) => ({ id, name: nameOf(id), position: posOf(id), team: game[1], value: v, unit: b.unit(v), clue: `Wk ${game[3]}`, mystery: v === max, headshot: shotOf(id) })),
        code: { sql, python, r, excel, excelNote: "Excel 365 (GROUPBY). Make the CSV a table named PlayerWeeks first (Ctrl+T)." },
      },
    ];
  });
}

// streaks ────────────────────────────────────────────────────────────────

const STREAKS: { id: string; test: (r: RollCallRow) => boolean; sql: string; py: string; r: string; ask: string; note: string }[] = [
  {
    id: "td",
    test: (r) => val(r, "touchdowns") > 0,
    sql: "rushing_tds + receiving_tds > 0",
    py: "(so_far.rushing_tds + so_far.receiving_tds) > 0",
    r: "rushing_tds + receiving_tds > 0",
    ask: "scored a touchdown",
    note: "Rushing or receiving touchdowns, in games he played, so a bye doesn't break a streak.",
  },
  {
    id: "ppr15",
    test: (r) => val(r, "fantasy_points_ppr") >= 15,
    sql: "fantasy_points_ppr >= 15",
    py: "so_far.fantasy_points_ppr >= 15",
    r: "fantasy_points_ppr >= 15",
    ask: "scored 15 or more PPR points",
    note: "In games he played, so a bye doesn't break a streak.",
  },
];

function streaks(w: number): Candidate[] {
  const games = byPlayer(rowsThrough(w));
  return STREAKS.flatMap((k) => {
    const longest = Array.from(games.entries()).map(([id, g]) => {
      let best = 0;
      let run = 0;
      let endIdx = -1;
      g.forEach((r, i) => {
        run = k.test(r) ? run + 1 : 0;
        if (run > best) {
          best = run;
          endIdx = i;
        }
      });
      return { id, g, v: best, from: best ? g[endIdx - best + 1][3] : 0, to: best ? g[endIdx][3] : 0 };
    });
    const bar = pickBar([2, 3, 4, 5, 6, 7, 8, 10], (n) => longest.filter((x) => x.v >= n).length, 6, 20);
    if (bar === null) return [];
    const board = longest.filter((x) => x.v >= bar).sort((a, b) => b.v - a.v || byText(nameOf(a.id), nameOf(b.id)));
    const sql = [
      "WITH games AS (",
      "  SELECT player_id, player, week,",
      `         ${k.sql} AS hit,`,
      "         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY week) AS game_no",
      "  FROM player_weeks",
      `  WHERE season = ${S} AND week <= ${w}`,
      "),",
      "runs AS (",
      "  -- through a run of hits, game_no minus this row number stays the same",
      "  SELECT player_id, player,",
      "         game_no - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY week) AS island",
      "  FROM games",
      "  WHERE hit",
      "),",
      "streaks AS (",
      "  SELECT player_id, player, COUNT(*) AS streak",
      "  FROM runs",
      "  GROUP BY player_id, player, island",
      ")",
      "SELECT player, MAX(streak) AS longest_streak",
      "FROM streaks",
      "GROUP BY player_id, player",
      `HAVING MAX(streak) >= ${bar}`,
      "ORDER BY longest_streak DESC, player;",
    ].join("\n");
    const python = [
      ...pyHead,
      pySoFar(w),
      'so_far = so_far.sort_values(["player_id", "week"])',
      `so_far["hit"] = ${k.py}`,
      "# a new run starts wherever \"hit\" changes within a player's games",
      'so_far["run"] = (so_far.hit != so_far.groupby("player_id").hit.shift()).cumsum()',
      'runs = so_far[so_far.hit].groupby(["player_id", "player", "run"]).size().reset_index(name="streak")',
      'best = runs.groupby(["player_id", "player"], as_index=False)["streak"].max()',
      `answer = best[best.streak >= ${bar}].sort_values(["streak", "player"], ascending=[False, True])`,
      'print(answer[["player", "streak"]].to_string(index=False))',
    ].join("\n");
    const r = [
      ...rHead,
      "player_weeks |>",
      `  filter(season == ${S}, week <= ${w}) |>`,
      "  arrange(player_id, week) |>",
      "  group_by(player_id, player) |>",
      "  summarise(longest_streak = {",
      `    runs <- rle(${k.r})`,
      "    max(c(0, runs$lengths[runs$values]))",
      '  }, .groups = "drop") |>',
      `  filter(longest_streak >= ${bar}) |>`,
      "  arrange(desc(longest_streak), player) |>",
      "  select(player, longest_streak)",
    ].join("\n");
    return [
      {
        key: `streak-${k.id}`,
        kind: "streak",
        label: "Hot streaks",
        prompt: `Name every player who has ${k.ask} in ${bar} straight games ${through(w)}.`,
        note: `${k.note} Each tile: his team, his longest streak and the weeks it ran.`,
        answers: board.map(({ id, g, v, from, to }) => ({ id, name: nameOf(id), position: posOf(id), team: latestTeam(g), value: v, unit: "straight", clue: from === to ? `Wk ${from}` : `Wk ${from}–${to}`, mystery: false, headshot: shotOf(id) })),
        code: {
          sql,
          python,
          r,
          excel: null,
          excelNote: "Runs like this are where SQL and pandas earn their keep: Excel has no clean formula for \"the longest run of TRUEs per player\". Run the SQL on the page, or the pandas version in Colab.",
        },
      },
    ];
  });
}

// first touchdowns ───────────────────────────────────────────────────────

function firstTds(w: number): Candidate[] {
  if (w < 2) return [];
  const rows = rowsThrough(w);
  const earlier = new Set(rows.filter((r) => r[3] < w && val(r, "touchdowns") > 0).map((r) => r[0]));
  const fresh = rows.filter((r) => r[3] === w && val(r, "touchdowns") > 0 && !earlier.has(r[0]));
  return ([null, "WR", "RB", "TE"] as const).flatMap((pos) => {
    const board = fresh
      .filter((r) => !pos || posOf(r[0]) === pos)
      .map((r): RollCallAnswer => {
        const v = val(r, "touchdowns");
        return { id: r[0], name: nameOf(r[0]), position: posOf(r[0]), team: r[1], value: v, unit: td(v), clue: `vs ${r[2]}`, mystery: false, headshot: shotOf(r[0]) };
      })
      .sort((a, b) => b.value - a.value || byText(a.team, b.team) || byText(a.name, b.name));
    if (!inRange(board.length, 6, 24)) return [];
    const who = pos ?? "player";
    const sql = [
      "SELECT p.player, p.team, p.rushing_tds + p.receiving_tds AS touchdowns",
      "FROM player_weeks p",
      `WHERE p.season = ${S}`,
      `  AND p.week = ${w}`,
      ...(pos ? [`  AND p.position = '${pos}'`] : []),
      "  AND p.rushing_tds + p.receiving_tds > 0",
      "  AND NOT EXISTS (",
      "    SELECT 1",
      "    FROM player_weeks e",
      "    WHERE e.player_id = p.player_id",
      `      AND e.season = ${S}`,
      `      AND e.week < ${w}`,
      "      AND e.rushing_tds + e.receiving_tds > 0",
      "  )",
      "ORDER BY touchdowns DESC, p.team, p.player;",
    ].join("\n");
    const python = [
      ...pyHead,
      pySoFar(w),
      pyTds,
      `earlier = so_far[(so_far.week < ${w}) & (so_far.touchdowns > 0)].player_id`,
      `answer = so_far[(so_far.week == ${w}) & (so_far.touchdowns > 0) & ~so_far.player_id.isin(earlier)${pos ? ` & (so_far.position == "${pos}")` : ""}]`,
      'answer = answer.sort_values(["touchdowns", "team", "player"], ascending=[False, True, True])',
      'print(answer[["player", "team", "touchdowns"]].to_string(index=False))',
    ].join("\n");
    const r = [
      ...rHead,
      "so_far <- player_weeks |>",
      `  filter(season == ${S}, week <= ${w}) |>`,
      "  mutate(touchdowns = rushing_tds + receiving_tds)",
      `earlier <- so_far |> filter(week < ${w}, touchdowns > 0)`,
      "",
      "so_far |>",
      `  filter(week == ${w}, touchdowns > 0${pos ? `, position == "${pos}"` : ""}) |>`,
      '  anti_join(earlier, by = "player_id") |>',
      "  arrange(desc(touchdowns), team, player) |>",
      "  select(player, team, touchdowns)",
    ].join("\n");
    const excel = [
      "=FILTER(PlayerWeeks[player],",
      `  (PlayerWeeks[season]=${S}) * (PlayerWeeks[week]=${w}) * (PlayerWeeks[td]>0)${pos ? ` * (PlayerWeeks[position]="${pos}")` : ""}`,
      `  * (COUNTIFS(PlayerWeeks[player_id], PlayerWeeks[player_id], PlayerWeeks[week], "<${w}", PlayerWeeks[td], ">0") = 0))`,
    ].join("\n");
    return [
      {
        key: `first-td-${pos ?? "all"}`,
        kind: "first-td",
        label: "First touchdowns",
        prompt: `Name every ${who} who scored his first touchdown of ${S} in Week ${w}.`,
        note: "Rushing or receiving touchdowns. Each tile: his team, how many he scored that week and who it was against.",
        answers: board,
        code: {
          sql,
          python,
          r,
          excel,
          excelNote: "Excel 365. Make the CSV a table named PlayerWeeks (Ctrl+T) and add a column td = [@rushing_tds] + [@receiving_tds] first.",
        },
      },
    ];
  });
}

// the newest week ────────────────────────────────────────────────────────

const WEEK_LISTS: { id: string; pos: string | null; stat: Stat; min: number; unit: (v: number) => string; mysteryAt: number; hidden: string; ask: (w: number) => string }[] = [
  { id: "wr-td", pos: "WR", stat: "receiving_tds", min: 1, unit: td, mysteryAt: 2, hidden: "a multi-TD game", ask: (w) => `every WR who caught a touchdown in Week ${w}` },
  { id: "te-td", pos: "TE", stat: "receiving_tds", min: 1, unit: td, mysteryAt: 2, hidden: "a multi-TD game", ask: (w) => `every TE who caught a touchdown in Week ${w}` },
  { id: "rb-td", pos: "RB", stat: "rushing_tds", min: 1, unit: td, mysteryAt: 2, hidden: "a multi-TD game", ask: (w) => `every RB who ran for a touchdown in Week ${w}` },
  { id: "qb-2td", pos: "QB", stat: "passing_tds", min: 2, unit: td, mysteryAt: 4, hidden: "four or more", ask: (w) => `every QB who threw two or more touchdown passes in Week ${w}` },
  { id: "rec-100", pos: null, stat: "receiving_yards", min: 100, unit: () => "yds", mysteryAt: 150, hidden: "150 or more", ask: (w) => `every player with 100 or more receiving yards in Week ${w}` },
  { id: "catches-8", pos: null, stat: "receptions", min: 8, unit: () => "rec", mysteryAt: 11, hidden: "11 or more", ask: (w) => `every player who caught eight or more passes in Week ${w}` },
  { id: "ppr-25", pos: null, stat: "fantasy_points_ppr", min: 25, unit: () => "pts", mysteryAt: 35, hidden: "35 or more", ask: (w) => `every player who scored 25 or more PPR points in Week ${w}` },
];

function weekLists(w: number): Candidate[] {
  const rows = ROLL_CALL_ROWS.filter((r) => r[3] === w);
  return WEEK_LISTS.flatMap((t) => {
    const board = rows
      .filter((r) => val(r, t.stat) >= t.min && (!t.pos || posOf(r[0]) === t.pos))
      .sort((a, b) => val(b, t.stat) - val(a, t.stat) || byText(a[1], b[1]) || byText(nameOf(a[0]), nameOf(b[0])));
    if (!inRange(board.length, 6, MAX_ANSWERS)) return [];
    const gt = t.min === 1 ? "> 0" : `>= ${t.min}`;
    const sql = [
      `SELECT player, team, ${t.stat}`,
      "FROM player_weeks",
      `WHERE season = ${S}`,
      `  AND week = ${w}`,
      ...(t.pos ? [`  AND position = '${t.pos}'`] : []),
      `  AND ${t.stat} ${gt}`,
      `ORDER BY ${t.stat} DESC, team, player;`,
    ].join("\n");
    const python = [
      ...pyHead,
      `wk = player_weeks[(player_weeks.season == ${S}) & (player_weeks.week == ${w})]`,
      `answer = wk[${t.pos ? `(wk.position == "${t.pos}") & ` : ""}(wk.${t.stat} ${gt})]`,
      `answer = answer.sort_values(["${t.stat}", "team", "player"], ascending=[False, True, True])`,
      `print(answer[["player", "team", "${t.stat}"]].to_string(index=False))`,
    ].join("\n");
    const r = [
      ...rHead,
      "player_weeks |>",
      `  filter(season == ${S}, week == ${w}${t.pos ? `, position == "${t.pos}"` : ""}, ${t.stat} ${gt}) |>`,
      `  arrange(desc(${t.stat}), team, player) |>`,
      `  select(player, team, ${t.stat})`,
    ].join("\n");
    const cond = [
      `(PlayerWeeks[season]=${S})`,
      `(PlayerWeeks[week]=${w})`,
      ...(t.pos ? [`(PlayerWeeks[position]="${t.pos}")`] : []),
      `(PlayerWeeks[${t.stat}]${t.min === 1 ? ">0" : `>=${t.min}`})`,
    ].join(" * ");
    const excel = ["=LET(", `  keep, ${cond},`, `  SORTBY(FILTER(PlayerWeeks[player], keep), FILTER(PlayerWeeks[${t.stat}], keep), -1)`, ")"].join("\n");
    return [
      {
        key: `week-${t.id}`,
        kind: "week",
        label: `Week ${w}`,
        prompt: `Name ${t.ask(w)} of ${S}.`,
        note: `Each tile: the player's team that week, his number and who he played. No team shown for ${t.hidden}.`,
        answers: board.map((row) => {
          const v = val(row, t.stat);
          return { id: row[0], name: nameOf(row[0]), position: posOf(row[0]), team: row[1], value: v, unit: t.unit(v), clue: `vs ${row[2]}`, mystery: v >= t.mysteryAt, headshot: shotOf(row[0]) };
        }),
        code: { sql, python, r, excel, excelNote: "Excel 365 (LET, FILTER, SORTBY). Make the CSV a table named PlayerWeeks first (Ctrl+T)." },
      },
    ];
  });
}

// ── The day's list ──────────────────────────────────────────────────────

/** One kind a day, in this order, so neighbouring days feel different. */
export const KINDS: { id: string; build: (w: number) => Candidate[] }[] = [
  { id: "leaders", build: leaders },
  { id: "week", build: weekLists },
  { id: "team-leaders", build: teamLeaders },
  { id: "opponent", build: opponent },
  { id: "threshold", build: thresholds },
  { id: "big-game", build: bigGames },
  { id: "first-td", build: firstTds },
  { id: "streak", build: streaks },
];

/** Every list a kind offers at cutoff week `w`, in its seeded order. */
export function listsFor(kind: string, w: number): Candidate[] {
  const k = KINDS.find((x) => x.id === kind);
  return k ? seededOrder(k.build(w), `roll-call:${S}:${kind}`) : [];
}

/** Today's list, or null before the season's first week is in. */
export function rollCallFor(day: string): RollCallPuzzle | null {
  const w = cutoffWeek(day);
  if (w === null) return null;
  const n = dailyNumber(day);
  for (let step = 0; step < KINDS.length; step++) {
    const kind = KINDS[(((n + step) % KINDS.length) + KINDS.length) % KINDS.length];
    const lists = listsFor(kind.id, w);
    if (!lists.length) continue;
    // Each visit to a kind takes its next list, so a kind comes back with a
    // different list rather than the same one.
    const visit = Math.floor(n / KINDS.length);
    const pick = lists[((visit % lists.length) + lists.length) % lists.length];
    return {
      key: `${S}-w${w}-${pick.key}`,
      day,
      number: n,
      season: S,
      week: w,
      kind: pick.kind,
      label: pick.label,
      prompt: pick.prompt,
      note: pick.note,
      teamCodes: !!pick.teamCodes,
      answers: pick.answers,
      code: pick.code,
    };
  }
  return null;
}

/** Everyone who played this season, for the search box (never just the answers). */
export function rollCallRoster(): [id: string, name: string, position: string][] {
  return Object.entries(ROLL_CALL_PLAYERS)
    .map(([id, [name, position]]) => [id, name, position] as [string, string, string])
    .sort((a, b) => byText(a[1], b[1]));
}
