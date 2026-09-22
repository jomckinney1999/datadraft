/**
 * The workbook every Excel lesson runs against.
 *
 * Two sheets, on purpose:
 *   Roster — clean, numeric, the sheet formulas are taught on.
 *   Import — the same league exported badly: numbers stored as text, names
 *            with stray spaces, blank cells. The data-cleaning lessons need
 *            genuinely dirty input, and mixing it into Roster would break
 *            every SUM in the rest of the course.
 *
 * WHAT IS REAL: Player, Team, Pos, Games and Points are real 2024 NFL regular
 * season results (PPR scoring) from nflverse-data — the same source the SQL
 * lessons use. See lib/data-source.ts for attribution, and
 * public/data/season_totals.csv for the full download.
 *
 * WHAT IS NOT: Salary and Owner are the invented fantasy-league layer. There
 * is no real source for what one private league paid for a player. They are
 * set to plausible *preseason* auction values, which is also why they don't
 * track final points — Derrick Henry returned 336 points on a cheap bid while
 * Tyreek Hill returned 218 on an expensive one. That spread is what makes the
 * cost-per-point lesson worth doing; a salary computed from points would make
 * every answer identical.
 *
 * Values are fixed, not generated. The answer keys are graded by evaluating
 * them against this exact grid, so a shifting dataset would silently change
 * what "correct" means.
 */

export type CellValue = string | number | null;
export type Sheet = CellValue[][];
export type Workbook = Record<string, Sheet>;

export const MAIN_SHEET = "Roster";
export const IMPORT_SHEET = "Import";
/** Empty sheet learners type into — like a blank workbook tab. */
export const PRACTICE_SHEET = "Practice";

/**
 * A1 = "Player" … G1 = "Owner"; data runs rows 2–17, ordered by points.
 *
 * Games varies from 13 to 17 because these are real seasons with real missed
 * time — which is exactly what makes the per-game lessons in unit 15 mean
 * something.
 */
const ROSTER: Sheet = [
  ["Player", "Team", "Pos", "Games", "Points", "Salary", "Owner"],
  ["Lamar Jackson", "BAL", "QB", 17, 430.4, 38000, "Jordan"],
  ["Ja'Marr Chase", "CIN", "WR", 17, 403.0, 44000, "Riley"],
  ["Josh Allen", "BUF", "QB", 16, 379.1, 40000, "Sam"],
  ["Jahmyr Gibbs", "DET", "RB", 17, 362.9, 33000, "Jordan"],
  ["Saquon Barkley", "PHI", "RB", 16, 355.3, 30000, "Riley"],
  ["Bijan Robinson", "ATL", "RB", 17, 341.7, 36000, "Sam"],
  ["Derrick Henry", "BAL", "RB", 17, 336.4, 24000, "Jordan"],
  ["Justin Jefferson", "MIN", "WR", 17, 317.5, 45000, "Riley"],
  ["Amon-Ra St. Brown", "DET", "WR", 17, 316.2, 34000, "Sam"],
  ["Jalen Hurts", "PHI", "QB", 15, 315.0, 37000, "Jordan"],
  ["Patrick Mahomes", "KC", "QB", 16, 282.9, 39000, "Riley"],
  ["CeeDee Lamb", "DAL", "WR", 15, 263.4, 46000, "Sam"],
  ["Davante Adams", "NYJ", "WR", 14, 241.3, 32000, "Jordan"],
  ["George Kittle", "SF", "TE", 15, 236.6, 21000, "Riley"],
  ["Tyreek Hill", "MIA", "WR", 17, 218.2, 43000, "Sam"],
  ["A.J. Brown", "PHI", "WR", 13, 216.9, 35000, "Jordan"],
];

/**
 * The same league as a bad export. Points arrive as text (note the leading and
 * trailing spaces), one player is missing a value entirely, and the names have
 * not been trimmed — which is exactly why VLOOKUP against this sheet fails
 * until it is cleaned. The underlying numbers are still the real ones.
 */
const IMPORT: Sheet = [
  ["Raw Name", "Raw Points", "Raw Team"],
  ["  Lamar Jackson", " 430.4", "bal"],
  ["Ja'Marr Chase  ", "403.0 ", "CIN "],
  [" Josh Allen ", " 379.1", " buf"],
  ["Jahmyr Gibbs", "362.9", "DET"],
  ["Saquon Barkley ", "", "phi"],
  [" Bijan Robinson", "341.7 ", "ATL "],
];

export const WORKBOOK: Workbook = {
  [MAIN_SHEET]: ROSTER,
  [IMPORT_SHEET]: IMPORT,
  [PRACTICE_SHEET]: emptySheet(24, 8),
};

/** Build an empty grid (null cells) for the Practice tab. */
export function emptySheet(rows: number, cols: number): Sheet {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null),
  );
}

/** 0-based column index → spreadsheet letter. 0 → A, 26 → AA. */
export function columnLetter(index: number): string {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/** "A1" → { col: 0, row: 0 } (0-based). */
export function parseA1(ref: string): { col: number; row: number } | null {
  const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(ref.trim());
  if (!m) return null;
  const letters = m[1].toUpperCase();
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  const row = Number(m[2]);
  if (row < 1 || col < 1) return null;
  return { col: col - 1, row: row - 1 };
}

/** 0-based → "A1". */
export function toA1(col: number, row: number): string {
  return `${columnLetter(col)}${row + 1}`;
}

/** Widest row in a sheet — sheets are ragged, the grid header is not. */
export function sheetWidth(sheet: Sheet): number {
  return sheet.reduce((max, row) => Math.max(max, row.length), 0);
}
