/**
 * The small, browser-safe half of Roll Call: the rules' numbers, the shapes
 * the server hands the game, and the table's schema. lib/roll-call.ts (which
 * reads the season's rows) is server-only and imports these; the game
 * component imports only this file, so the rows never ship to the browser.
 */

export const ROLL_CALL_STRIKES = 3;
/** Clue tokens per board: each reveals one tile's initials. */
export const ROLL_CALL_CLUES = 3;
/** Where the table is published, for the pandas, R and Excel versions. */
export const PLAYER_WEEKS_CSV = (season: number) => `/data/player_weeks_${season}.csv`;

export type RollCallAnswer = {
  id: string;
  name: string;
  position: string;
  team: string;
  value: number;
  unit: string;
  /** A short line on the tile that narrows it down: "#3", "Wk 2", "Wk 2–4". */
  clue: string;
  /** Team hidden on the board: the biggest numbers are the hard ones. */
  mystery: boolean;
  headshot: string;
};

export type RollCallCode = {
  sql: string;
  python: string;
  r: string;
  /** Null when a list has no honest one-cell Excel answer (streaks, per-team leaders). */
  excel: string | null;
  /** What to do first, or what to do instead, in Excel. */
  excelNote: string;
};

export type RollCallPuzzle = {
  /** Which list this is; a saved game for a different key starts fresh. */
  key: string;
  day: string;
  number: number;
  season: number;
  /** The last week the list counts. */
  week: number;
  /** The kind of list, and its label on the board ("Season leaders"). */
  kind: string;
  label: string;
  prompt: string;
  /** How to read a tile on this board. */
  note: string;
  /** Tiles show the team's code beside its crest (when the team is the clue). */
  teamCodes: boolean;
  answers: RollCallAnswer[];
  code: RollCallCode;
};

/** "Ja'Marr Chase" → "J. C.", "Amon-Ra St. Brown" → "A. S. B." */
export function initials(name: string): string {
  return name
    .replace(/\b(Jr|Sr|II|III|IV|V)\.?$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w[0].toUpperCase()}.`)
    .join(" ");
}

/** The table's shape: text for names and codes, numbers for the rest. */
export function seedSql(columns: string[]): string {
  const text = new Set(["player_id", "player", "position", "team", "opponent"]);
  const real = new Set(["fantasy_points_ppr"]);
  return `CREATE TABLE player_weeks (${columns
    .map((c) => `${c} ${text.has(c) ? "TEXT" : real.has(c) ? "REAL" : "INTEGER"}`)
    .join(", ")});`;
}
