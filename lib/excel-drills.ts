/**
 * Ungraded Excel Practice drills — same idea as the SQL Practice Field book.
 */

export type ExcelDrill = {
  id: string;
  title: string;
  prompt: string;
  /** Suggested formula (peekable). */
  solution: string;
  tip?: string;
};

export const EXCEL_DRILLS: ExcelDrill[] = [
  {
    id: "sum-points",
    title: "Season total",
    prompt:
      "On the Practice sheet, put the league’s total fantasy points in A1. Hint: points live in Roster column E, rows 2–17.",
    solution: "=SUM(Roster!E2:E17)",
    tip: "Sheet-qualify the range: Roster!E2:E17 — just like Excel.",
  },
  {
    id: "avg-points",
    title: "Average score",
    prompt: "In A2, average every player’s points on Roster.",
    solution: "=AVERAGE(Roster!E2:E17)",
  },
  {
    id: "lamar",
    title: "Look up Lamar",
    prompt:
      "In A3, pull Lamar Jackson’s points with XLOOKUP (or VLOOKUP) from Roster.",
    solution: '=XLOOKUP("Lamar Jackson",Roster!A2:A17,Roster!E2:E17)',
    tip: "Name in A, points in E — same sheet, two columns.",
  },
  {
    id: "per-game",
    title: "Points per game",
    prompt:
      "In A4, compute Lamar’s points per game: points ÷ games (columns E and D).",
    solution: "=Roster!E2/Roster!D2",
  },
  {
    id: "count-rb",
    title: "How many RBs?",
    prompt: "In A5, count how many Roster players are RBs (column C).",
    solution: '=COUNTIF(Roster!C2:C17,"RB")',
  },
  {
    id: "clean-trim",
    title: "Clean a dirty name",
    prompt:
      "Import!A2 has leading spaces. In Practice A6, TRIM that name so it would match a clean lookup.",
    solution: "=TRIM(Import!A2)",
  },
  {
    id: "swing",
    title: "How swingy is he?",
    prompt:
      "Weeks row 4 is Josh Allen's 2024, one column per week (B to S). In A7, measure how much his score swings week to week: the sample standard deviation.",
    solution: "=STDEV.S(Weeks!B4:S4)",
    tip: "STDEV.S skips the blank weeks. STDEV.P treats the games as everything there is and comes out a little smaller.",
  },
  {
    id: "ceiling",
    title: "His ceiling",
    prompt:
      "In A8, find Lamar Jackson's 90th percentile game (Weeks row 2): the score only one game in ten beats.",
    solution: "=PERCENTILE.INC(Weeks!B2:S2,0.9)",
  },
  {
    id: "qb-total",
    title: "Quarterbacks' total, one formula",
    prompt:
      "In A9, add up the quarterbacks' points on Roster without SUMIF: multiply a TRUE/FALSE test by the points and SUMPRODUCT the result.",
    solution: '=SUMPRODUCT((Roster!C2:C17="QB")*Roster!E2:E17)',
    tip: "The comparison makes a column of TRUE/FALSE; multiplying turns them into 1/0. It should match SUMIF(Roster!C2:C17,\"QB\",Roster!E2:E17).",
  },
];
