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
 * Values are hand-authored and fixed. Nothing here is generated, because the
 * answer keys are graded by evaluating them against this exact grid — a
 * shifting dataset would silently change what "correct" means.
 *
 * Player names match lib/fantasy-data.ts so a learner moving between the SQL
 * and Excel courses sees the same league.
 */

export type CellValue = string | number | null;
export type Sheet = CellValue[][];
export type Workbook = Record<string, Sheet>;

export const MAIN_SHEET = "Roster";
export const IMPORT_SHEET = "Import";

/**
 * A1 = "Player" … G1 = "Owner"; data runs rows 2–17.
 *
 * Salary is in dollars so the currency-formatting and absolute-reference
 * lessons have something to point at. Owner repeats across rows so COUNTIF /
 * SUMIF have a real grouping column.
 */
const ROSTER: Sheet = [
  ["Player", "Team", "Pos", "Games", "Points", "Salary", "Owner"],
  ["Josh Allen", "BUF", "QB", 17, 402.5, 41000, "Jordan"],
  ["Patrick Mahomes", "KC", "QB", 16, 361.2, 38500, "Riley"],
  ["Christian McCaffrey", "SF", "RB", 14, 318.7, 44000, "Jordan"],
  ["Derrick Henry", "BAL", "RB", 17, 279.4, 33000, "Sam"],
  ["Jaylen Warren", "PIT", "RB", 15, 162.3, 14500, "Riley"],
  ["Ray Davis", "BUF", "RB", 16, 141.8, 11000, "Sam"],
  ["Tyler Allgeier", "ATL", "RB", 17, 128.6, 9500, "Jordan"],
  ["Tyreek Hill", "MIA", "WR", 16, 301.9, 39000, "Riley"],
  ["CeeDee Lamb", "DAL", "WR", 17, 288.4, 37500, "Sam"],
  ["Amon-Ra St. Brown", "DET", "WR", 16, 264.1, 32000, "Jordan"],
  ["A.J. Brown", "PHI", "WR", 15, 241.6, 30500, "Riley"],
  ["Puka Nacua", "LAR", "WR", 14, 208.3, 26000, "Sam"],
  ["Tank Dell", "HOU", "WR", 12, 138.9, 12500, "Jordan"],
  ["Rome Odunze", "CHI", "WR", 16, 119.4, 8000, "Riley"],
  ["Travis Kelce", "KC", "TE", 16, 212.8, 28000, "Sam"],
  ["George Kittle", "SF", "TE", 15, 189.5, 24500, "Jordan"],
];

/**
 * The same league as a bad export. Points arrive as text (note the leading and
 * trailing spaces), one player is missing a value entirely, and the names have
 * not been trimmed — which is exactly why VLOOKUP against this sheet fails
 * until it is cleaned.
 */
const IMPORT: Sheet = [
  ["Raw Name", "Raw Points", "Raw Team"],
  ["  Josh Allen", " 402.5", "buf"],
  ["Patrick Mahomes  ", "361.2 ", "KC "],
  [" Christian McCaffrey ", " 318.7", " sf"],
  ["Derrick Henry", "279.4", "BAL"],
  ["Tyreek Hill ", "", "mia"],
  [" CeeDee Lamb", "288.4 ", "DAL "],
];

export const WORKBOOK: Workbook = {
  [MAIN_SHEET]: ROSTER,
  [IMPORT_SHEET]: IMPORT,
};

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

/** Widest row in a sheet — sheets are ragged, the grid header is not. */
export function sheetWidth(sheet: Sheet): number {
  return sheet.reduce((max, row) => Math.max(max, row.length), 0);
}
