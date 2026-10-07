/**
 * Roll Call (/questions/roll-call; decided 2026-10-06): the daily "name every
 * player on the list" game. "Name every WR who caught a touchdown in Week 4",
 * a board of tiles showing each answer's team and number, three strikes, and
 * when it's over, the query that makes the list: SQL you can run on the page,
 * and the same answer in pandas, dplyr and Excel.
 *
 * Things to keep true:
 *   - **Every list is a query.** The board is computed from the real weekly
 *     rows (lib/roll-call-data.generated.ts, nflverse), and the verifier runs
 *     each day's SQL against the same rows the browser loads and fails if it
 *     disagrees with the board, in order.
 *   - **Same board for everyone, all day.** The day is leagueDay() and a week
 *     joins the rotation two days after its last game, so the data refresh
 *     that lands it (the morning after Monday night) is in before the first
 *     day that uses it. The newest week's lists come first, one a day, in a
 *     seeded order; once they're used up, the older weeks are walked with a
 *     stride.
 *   - Lists are kept between MIN_ANSWERS and MAX_ANSWERS long: a board of
 *     three is a guess, a board of fifty is homework.
 */

import { dailyNumber } from "./daily-share";
import { SITE_URL } from "./site";
import {
  ROLL_CALL_PLAYERS,
  ROLL_CALL_ROWS,
  ROLL_CALL_SEASON,
  ROLL_CALL_WEEK_ENDS,
  type RollCallRow,
} from "./roll-call-data.generated";

export const ROLL_CALL_STRIKES = 3;
export const MIN_ANSWERS = 6;
export const MAX_ANSWERS = 32;
/** Where the table is published, for the pandas, R and Excel versions. */
export const PLAYER_WEEKS_CSV = (season: number) => `/data/player_weeks_${season}.csv`;

type Stat =
  | "passing_yards"
  | "passing_tds"
  | "rushing_yards"
  | "rushing_tds"
  | "receptions"
  | "receiving_yards"
  | "receiving_tds"
  | "fantasy_points_ppr";

/** A row's number in a stat column (the first four columns are id, team, opponent, week). */
const statOf = (r: RollCallRow, stat: Stat) => r[COL[stat]] as number;

const COL: Record<Stat, number> = {
  passing_yards: 4,
  passing_tds: 5,
  rushing_yards: 6,
  rushing_tds: 7,
  receptions: 8,
  receiving_yards: 9,
  receiving_tds: 10,
  fantasy_points_ppr: 11,
};

type Template = {
  id: string;
  /** "caught a touchdown", completing "Name every WR who … in Week 4". */
  ask: (week: number) => string;
  position: "QB" | "RB" | "WR" | "TE" | null;
  stat: Stat;
  /** At least this much of the stat; 1 reads as "> 0" in the code. */
  min: number;
  /** Small label under a tile's number. */
  unit: (v: number) => string;
  /** A tile at or above this shows no team: the big games are the hard ones. */
  mysteryAt: number;
  mysteryNote: string;
};

const td = (v: number) => (v === 1 ? "TD" : "TDs");

export const TEMPLATES: Template[] = [
  { id: "wr-td", position: "WR", stat: "receiving_tds", min: 1, unit: td, mysteryAt: 2, mysteryNote: "No team shown for a multi-TD game.", ask: (w) => `Name every WR who caught a touchdown in Week ${w}.` },
  { id: "te-td", position: "TE", stat: "receiving_tds", min: 1, unit: td, mysteryAt: 2, mysteryNote: "No team shown for a multi-TD game.", ask: (w) => `Name every TE who caught a touchdown in Week ${w}.` },
  { id: "rb-td", position: "RB", stat: "rushing_tds", min: 1, unit: td, mysteryAt: 2, mysteryNote: "No team shown for a multi-TD game.", ask: (w) => `Name every RB who ran for a touchdown in Week ${w}.` },
  { id: "qb-2td", position: "QB", stat: "passing_tds", min: 2, unit: td, mysteryAt: 4, mysteryNote: "No team shown for four or more.", ask: (w) => `Name every QB who threw two or more touchdown passes in Week ${w}.` },
  { id: "rec-100", position: null, stat: "receiving_yards", min: 100, unit: () => "yds", mysteryAt: 150, mysteryNote: "No team shown for 150 or more.", ask: (w) => `Name every player with 100 or more receiving yards in Week ${w}.` },
  { id: "ppr-25", position: null, stat: "fantasy_points_ppr", min: 25, unit: () => "pts", mysteryAt: 35, mysteryNote: "No team shown for 35 or more.", ask: (w) => `Name every player who scored 25 or more PPR fantasy points in Week ${w}.` },
  { id: "catches-8", position: null, stat: "receptions", min: 8, unit: () => "rec", mysteryAt: 11, mysteryNote: "No team shown for 11 or more.", ask: (w) => `Name every player who caught eight or more passes in Week ${w}.` },
  { id: "rush-100", position: null, stat: "rushing_yards", min: 100, unit: () => "yds", mysteryAt: 150, mysteryNote: "No team shown for 150 or more.", ask: (w) => `Name every player with 100 or more rushing yards in Week ${w}.` },
  { id: "pass-300", position: "QB", stat: "passing_yards", min: 300, unit: () => "yds", mysteryAt: 400, mysteryNote: "No team shown for 400 or more.", ask: (w) => `Name every QB who threw for 300 or more yards in Week ${w}.` },
];

export type RollCallAnswer = {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent: string;
  value: number;
  unit: string;
  /** Team hidden on the board. */
  mystery: boolean;
  headshot: string;
};

export type RollCallCode = { sql: string; python: string; r: string; excel: string };

export type RollCallPuzzle = {
  /** Which list this is; a saved game for a different key starts fresh. */
  key: string;
  day: string;
  number: number;
  season: number;
  week: number;
  template: string;
  prompt: string;
  note: string;
  answers: RollCallAnswer[];
  code: RollCallCode;
};

// ── Dates and seeds ─────────────────────────────────────────────────────

const DAY_MS = 864e5;
const toUtc = (day: string) => Date.parse(`${day}T00:00:00Z`);
export const addDays = (day: string, n: number) => new Date(toUtc(day) + n * DAY_MS).toISOString().slice(0, 10);
const daysBetween = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / DAY_MS);

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

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Code-unit order, which is what SQLite's ORDER BY and dplyr's arrange use. */
const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

// ── The lists ───────────────────────────────────────────────────────────

/** The day a week's lists join the rotation: two days after its last game. */
export function weekOpens(week: number): string | null {
  const end = ROLL_CALL_WEEK_ENDS[week];
  return end ? addDays(end, 2) : null;
}

function weeksOpenOn(day: string): number[] {
  return Object.keys(ROLL_CALL_WEEK_ENDS)
    .map(Number)
    .filter((w) => (weekOpens(w) ?? "9999") <= day)
    .sort((a, b) => a - b);
}

function rowsFor(template: Template, week: number): RollCallRow[] {
  const s = template.stat;
  return ROLL_CALL_ROWS.filter((r) => {
    if (r[3] !== week || statOf(r, s) < template.min) return false;
    return !template.position || ROLL_CALL_PLAYERS[r[0]]?.[1] === template.position;
  }).sort((a, b) => statOf(b, s) - statOf(a, s) || byText(a[1], b[1]) || byText(ROLL_CALL_PLAYERS[a[0]][0], ROLL_CALL_PLAYERS[b[0]][0]));
}

/** The lists a week supports, in that week's seeded order. */
export function listsForWeek(week: number): Template[] {
  const ok = TEMPLATES.filter((t) => {
    const n = rowsFor(t, week).length;
    return n >= MIN_ANSWERS && n <= MAX_ANSWERS;
  });
  return seededOrder(ok, `roll-call:${ROLL_CALL_SEASON}:${week}`);
}

/** Today's list, or null before the season's first week is in. */
export function rollCallFor(day: string): RollCallPuzzle | null {
  const weeks = weeksOpenOn(day);
  if (!weeks.length) return null;
  const newest = weeks[weeks.length - 1];
  const fresh = listsForWeek(newest);
  const k = daysBetween(weekOpens(newest)!, day);
  if (k < fresh.length) return build(fresh[k], newest, day);
  const older = weeks.slice(0, -1).flatMap((w) => listsForWeek(w).map((t) => ({ t, w })));
  if (!older.length) return fresh.length ? build(fresh[k % fresh.length], newest, day) : null;
  let stride = Math.max(1, Math.floor(older.length * 0.618));
  while (gcd(stride, older.length) !== 1) stride++;
  const pick = older[(((dailyNumber(day) * stride) % older.length) + older.length) % older.length];
  return build(pick.t, pick.w, day);
}

function build(t: Template, week: number, day: string): RollCallPuzzle {
  const answers = rowsFor(t, week).map((r): RollCallAnswer => {
    const [name, position, headshot] = ROLL_CALL_PLAYERS[r[0]];
    const value = statOf(r, t.stat);
    return { id: r[0], name, position, team: r[1], opponent: r[2], value, unit: t.unit(value), mystery: value >= t.mysteryAt, headshot };
  });
  return {
    key: `${ROLL_CALL_SEASON}-w${week}-${t.id}`,
    day,
    number: dailyNumber(day),
    season: ROLL_CALL_SEASON,
    week,
    template: t.id,
    prompt: t.ask(week).replace(/\.$/, ` of the ${ROLL_CALL_SEASON} season.`),
    note: t.mysteryNote,
    answers,
    code: codeFor(t, week),
  };
}

// ── The same list, four ways ────────────────────────────────────────────

function codeFor(t: Template, week: number): RollCallCode {
  const season = ROLL_CALL_SEASON;
  const gt = t.min === 1 ? "> 0" : `>= ${t.min}`;
  const csv = `${SITE_URL}${PLAYER_WEEKS_CSV(season)}`;
  const pos = t.position;

  const sql = [
    `SELECT player, team, ${t.stat}`,
    "FROM player_weeks",
    `WHERE season = ${season}`,
    `  AND week = ${week}`,
    ...(pos ? [`  AND position = '${pos}'`] : []),
    `  AND ${t.stat} ${gt}`,
    `ORDER BY ${t.stat} DESC, team, player;`,
  ].join("\n");

  const python = [
    "import pandas as pd",
    "",
    `player_weeks = pd.read_csv("${csv}")`,
    "",
    `wk = player_weeks[(player_weeks.season == ${season}) & (player_weeks.week == ${week})]`,
    `answer = wk[${pos ? `(wk.position == "${pos}") & ` : ""}(wk.${t.stat} ${gt})]`,
    `answer = answer.sort_values(["${t.stat}", "team", "player"], ascending=[False, True, True])`,
    `print(answer[["player", "team", "${t.stat}"]].to_string(index=False))`,
  ].join("\n");

  const r = [
    "library(dplyr)",
    "",
    `player_weeks <- read.csv("${csv}")`,
    "",
    "player_weeks |>",
    `  filter(season == ${season}, week == ${week}${pos ? `, position == "${pos}"` : ""}, ${t.stat} ${gt}) |>`,
    `  arrange(desc(${t.stat}), team, player) |>`,
    `  select(player, team, ${t.stat})`,
  ].join("\n");

  const cond = [
    `(PlayerWeeks[season]=${season})`,
    `(PlayerWeeks[week]=${week})`,
    ...(pos ? [`(PlayerWeeks[position]="${pos}")`] : []),
    `(PlayerWeeks[${t.stat}]${t.min === 1 ? ">0" : `>=${t.min}`})`,
  ].join(" * ");
  const excel = [
    "=LET(",
    `  keep, ${cond},`,
    `  SORTBY(FILTER(PlayerWeeks[player], keep), FILTER(PlayerWeeks[${t.stat}], keep), -1)`,
    ")",
  ].join("\n");

  return { sql, python, r, excel };
}

/** Everyone who played this season, for the search box (never just the answers). */
export function rollCallRoster(): [id: string, name: string, position: string][] {
  return Object.entries(ROLL_CALL_PLAYERS)
    .map(([id, [name, position]]) => [id, name, position] as [string, string, string])
    .sort((a, b) => byText(a[1], b[1]));
}

/** The table's shape: text for names and codes, numbers for the rest. */
export function seedSql(columns: string[]): string {
  const text = new Set(["player_id", "player", "position", "team", "opponent"]);
  const real = new Set(["fantasy_points_ppr"]);
  return `CREATE TABLE player_weeks (${columns
    .map((c) => `${c} ${text.has(c) ? "TEXT" : real.has(c) ? "REAL" : "INTEGER"}`)
    .join(", ")});`;
}
