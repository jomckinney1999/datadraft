/**
 * The hands-on drills for the Tableau and Power BI courses (2026-10-05).
 *
 * Those courses used to be multiple choice and fill-the-blank only, because
 * neither tool runs in a browser. Each lesson now ends with one play in the
 * real-enough thing: a view built in the Tableau-style builder (`viz`,
 * lib/viz.ts) or a measure written in the Power BI-style one (`dax`,
 * lib/dax.ts), over the same real week_results rows as everything else.
 * lib/curriculum-bi.ts appends these to each lesson by id, so the lesson text
 * stays where it was and the drills stay in one place.
 *
 * Graded on what the learner made, not how: a viz drill on the view's data
 * and mark, a DAX drill on every cell of the matrix including the Total.
 * scripts/verify-answer-keys.mjs runs every key, fails one that errors or
 * comes back empty, and checks a Top N for a tie at its cutoff.
 */

import type { DaxExercise, Exercise, VizExercise } from "./curriculum";
import { emptySpec, type VizSpec } from "./viz";

const view = (patch: Partial<VizSpec>): VizSpec => ({ ...emptySpec(patch.source), ...patch });

function viz(prompt: string, expected: Partial<VizSpec>, hint: string, explain: string): VizExercise {
  return { type: "viz", prompt, expected: view(expected), hint, explain };
}

/** The model's starting measures, for drills that build on them. */
const BASE = { "Total Points": "SUM(Results[Points])", Games: "COUNTROWS(Results)" };
const BY_POSITION_2024 = { rows: "position" as const, slicers: { season: 2024 } };

function dax(
  prompt: string,
  expected: string,
  visual: DaxExercise["visual"],
  hint: string,
  explain: string,
  measures?: Record<string, string>,
): DaxExercise {
  return { type: "dax", prompt, starter: "", expected, visual, measures, hint, explain };
}

export const BI_DRILLS: Record<string, Exercise[]> = {
  // ── Tableau ──────────────────────────────────────────────────────
  "tb-start-l1": [
    viz(
      "Your first view. How many games does the table hold for each season? Put season on Columns and count the games on Rows.",
      { columns: [{ field: "season" }], rows: [{ field: "fantasy_pts", agg: "COUNT" }], mark: "bar" },
      "Click season and add it to Columns. Click fantasy_pts, add it to Rows, then change its SUM to COUNT: each row is one game.",
      "COUNT of any measure counts rows, and here a row is a player-game. The newest season is short because it's still being played.",
    ),
  ],
  "tb-start-l2": [
    viz(
      "The first chart anyone asks for is a leaderboard. Show the ten highest scorers of 2024 as bars, best first.",
      {
        columns: [{ field: "player" }],
        rows: [{ field: "fantasy_pts", agg: "SUM" }],
        filters: [{ field: "season", values: [2024] }],
        mark: "bar",
        sort: "desc",
        top: 10,
      },
      "player is blue: it slices. fantasy_pts is green: it adds up. Filter season to 2024, sort highest first and keep the Top 10.",
      "A dimension decides how many bars there are; a measure decides how tall they are. Everything else in Tableau is a variation on that split.",
    ),
  ],
  "tb-marks-l1": [
    viz(
      "A season told week by week is a line. Show Lamar Jackson's 2024 points for every week he played.",
      {
        columns: [{ field: "week" }],
        rows: [{ field: "fantasy_pts", agg: "SUM" }],
        filters: [
          { field: "player", values: ["Lamar Jackson"] },
          { field: "season", values: [2024] },
        ],
        mark: "line",
      },
      "week on Columns, SUM(fantasy_pts) on Rows, two filters (player and season), and the Line mark.",
      "A line says the order matters: week 5 comes after week 4. The same numbers as bars would read as a ranking, which isn't the question.",
    ),
  ],
  "tb-marks-l2": [
    viz(
      "Someone built total 2024 points by position as a pie, and nobody can tell the slices apart. Rebuild it as bars, biggest first.",
      {
        columns: [{ field: "position" }],
        rows: [{ field: "fantasy_pts", agg: "SUM" }],
        filters: [{ field: "season", values: [2024] }],
        mark: "bar",
        sort: "desc",
      },
      "position on Columns, SUM(fantasy_pts) on Rows, filter to 2024, Bar mark, sort highest first.",
      "Bars put every value on one baseline, so a small gap is still visible. Angles don't, which is why a pie of four similar slices hides the answer.",
    ),
  ],
  "tb-calc-l1": [
    viz(
      "Season totals reward whoever stayed healthy. Show points per game for the 2024 running backs, best first.",
      {
        columns: [{ field: "player" }],
        rows: [{ field: "fantasy_pts", agg: "AVG" }],
        filters: [
          { field: "season", values: [2024] },
          { field: "position", values: ["RB"] },
        ],
        mark: "bar",
        sort: "desc",
      },
      "Each row is one game, so the average of fantasy_pts per player is his points per game. Change SUM to AVG.",
      "AVG over game rows is SUM(points) / COUNT(games), the season rate. Averaging per-game rates that were already averaged would be the wrong order.",
    ),
  ],
  "tb-calc-l2": [
    viz(
      "Change the grain: instead of players, show total 2024 points by NFL team, highest first.",
      {
        columns: [{ field: "team" }],
        rows: [{ field: "fantasy_pts", agg: "SUM" }],
        filters: [{ field: "season", values: [2024] }],
        mark: "bar",
        sort: "desc",
      },
      "Swap player for team on Columns. Same measure, same filter, new grain.",
      "The dimensions in the view set the grain: one bar per team means every player-game on that team is added into one bar. Name the grain before you trust a total.",
    ),
  ],
  "tb-filters-l1": [
    viz(
      "They want the receivers page. Show 2024 total points for wide receivers only, highest first.",
      {
        columns: [{ field: "player" }],
        rows: [{ field: "fantasy_pts", agg: "SUM" }],
        filters: [
          { field: "season", values: [2024] },
          { field: "position", values: ["WR"] },
        ],
        mark: "bar",
        sort: "desc",
      },
      "Add position as a filter and tick WR. A filter drops the other rows before anything is added up.",
      "A filter removes rows, so the receivers are compared only with each other. That's different from colouring by position, which keeps everyone and labels them.",
    ),
  ],
  "tb-filters-l2": [
    viz(
      "Build the view a click on the Lions would leave behind: Detroit's 2024 players by total points, highest first.",
      {
        columns: [{ field: "player" }],
        rows: [{ field: "fantasy_pts", agg: "SUM" }],
        filters: [
          { field: "season", values: [2024] },
          { field: "team", values: ["DET"] },
        ],
        mark: "bar",
        sort: "desc",
      },
      "Filter team to DET and season to 2024. On a dashboard, an action on a team mark applies exactly this filter for you.",
      "A filter action is a filter someone sets by clicking. Building the filtered sheet first is how you check the action will show the right thing.",
    ),
  ],
  "tb-dash-l1": [
    viz(
      "One question for the page: has scoring per game changed over the seasons, and at which positions? Draw it as lines, one per position.",
      {
        columns: [{ field: "season" }],
        rows: [{ field: "fantasy_pts", agg: "AVG" }],
        color: [{ field: "position" }],
        mark: "line",
      },
      "season on Columns, AVG(fantasy_pts) on Rows, position on Color, Line mark.",
      "A dimension on Color splits the marks into one line per value. The newest season is still being played, so its point is the one to read with care.",
    ),
  ],
  "tb-dash-l2": [
    viz(
      "Before you publish, build the chart the page leads with: the five highest scorers of 2025, best first.",
      {
        columns: [{ field: "player" }],
        rows: [{ field: "fantasy_pts", agg: "SUM" }],
        filters: [{ field: "season", values: [2025] }],
        mark: "bar",
        sort: "desc",
        top: 5,
      },
      "Same leaderboard shape as before: player, SUM(fantasy_pts), filter 2025, sort, Top 5.",
      "The chart a page leads with should answer its question with nothing else on screen. Five bars do; fifty make the reader do the work.",
    ),
  ],
  "tb-job-l1": [
    viz(
      "Switch to the games table. Do home teams score more under a roof? Show the average home score for each roof type.",
      {
        source: "games",
        columns: [{ field: "roof" }],
        rows: [{ field: "home_score", agg: "AVG" }],
        mark: "bar",
      },
      "This drill's data pane is the games table: one row per game. roof on Columns, AVG(home_score) on Rows.",
      "A different table means a different grain: here a row is a game, not a player-game. Knowing what one row is comes before every chart.",
    ),
  ],
  "tb-job-l2": [
    viz(
      "A take-home asks for a plain table: how many games were played on each surface, by season. Build it as a text table.",
      {
        source: "games",
        rows: [{ field: "season" }],
        columns: [{ field: "surface" }],
        detail: [{ field: "home_score", agg: "COUNT" }],
        mark: "text",
      },
      "Text mark. season and surface as dimensions, and COUNT of any game measure to count the games.",
      "A crosstab is the honest choice when the reader needs exact numbers. Saying why you chose it is half of walking someone through a dashboard.",
    ),
  ],

  // ── Power BI ─────────────────────────────────────────────────────
  "pb-start-l1": [
    dax(
      "Your first measure. Add up the points, and watch the matrix split it by position for 2024 without being told how.",
      "Total Points = SUM(Results[Points])",
      BY_POSITION_2024,
      "SUM takes a column: SUM(Results[Points]). Name it first: Total Points = …",
      "You wrote one formula and the visual ran it five times: once per position and once for the Total. That's filter context, and it's the whole idea of DAX.",
    ),
  ],
  "pb-start-l2": [
    dax(
      "Each row of Results is one game a player played. Write a measure that counts games, and see it per season.",
      "Games = COUNTROWS(Results)",
      { rows: "season" },
      "COUNTROWS counts the rows of a table: COUNTROWS(Results).",
      "COUNTROWS counts what's left after the filters, so the same measure gives a different number on every row of the visual.",
    ),
  ],
  "pb-query-l1": [
    dax(
      "After cleaning, check the grain: how many different players are in each season?",
      "Players = DISTINCTCOUNT(Results[Player])",
      { rows: "season" },
      "DISTINCTCOUNT counts different values: DISTINCTCOUNT(Results[Player]).",
      "Rows and distinct players are different numbers, and comparing them is how you find out what one row is. The Total isn't the sum of the rows: it's the players in the whole table.",
    ),
  ],
  "pb-query-l2": [
    dax(
      "Once the data is long (one row per game), points per game is one measure. Write it, by position, for 2024.",
      "Points per Game = AVERAGE(Results[Points])",
      BY_POSITION_2024,
      "Every row is a game, so AVERAGE(Results[Points]) is points per game.",
      "In the wide file with a column per week, this needed a formula per column. Unpivoting first is what makes one measure enough.",
    ),
  ],
  "pb-model-l1": [
    dax(
      "The model already has [Total Points] and [Games]. Build points per game on top of them, safely.",
      "Points per Game = DIVIDE([Total Points], [Games])",
      BY_POSITION_2024,
      "Measures go in square brackets. DIVIDE(numerator, denominator) returns BLANK instead of an error when the denominator is zero.",
      "Measures built from measures keep one definition of 'points' and one of 'games'. Change [Games] and every ratio that uses it follows.",
      BASE,
    ),
  ],
  "pb-model-l2": [
    dax(
      "No date table here, but weeks work the same way. Total each position's 2024 points from weeks 1 to 9 only.",
      "First Half Points = CALCULATE([Total Points], Results[Week] <= 9)",
      BY_POSITION_2024,
      "CALCULATE(expression, filter): the filter is Results[Week] <= 9.",
      "A time filter inside CALCULATE is how year-to-date and first-half measures work. A real date table makes the same move with dates.",
      BASE,
    ),
  ],
  "pb-dax-l1": [
    dax(
      "Write a measure for the best single game, and see it per position for 2024. Then look at the Total row.",
      "Best Game = MAX(Results[Points])",
      BY_POSITION_2024,
      "MAX(Results[Points]) returns the largest value the filters leave.",
      "The Total row isn't the sum of the rows: it's MAX over every row the visual can see, so it's the best game of all. A measure always recomputes; it never adds up what's above it.",
    ),
  ],
  "pb-dax-l2": [
    dax(
      "What share of 2024's points came from each position? The Total should read 1.",
      "Share = DIVIDE([Total Points], CALCULATE([Total Points], ALL(Results[Position])))",
      BY_POSITION_2024,
      "The denominator is [Total Points] with the position filter removed: CALCULATE([Total Points], ALL(Results[Position])).",
      "ALL removes the filter the row puts on Position, so the denominator is every position's total while the season slicer still applies. That's the % of total pattern.",
      BASE,
    ),
  ],
  "pb-report-l1": [
    dax(
      "The page's slicer is set to 2024. Count each position's 30-point games under it.",
      "Big Games = CALCULATE(COUNTROWS(Results), Results[Points] >= 30)",
      BY_POSITION_2024,
      "CALCULATE(COUNTROWS(Results), Results[Points] >= 30). The slicer's filter stays; yours is added.",
      "The slicer, the row and your CALCULATE filter all apply at once. A filter on a different column adds to the others; only a filter on the same column replaces one.",
    ),
  ],
  "pb-report-l2": [
    dax(
      "A report shouldn't show 18.62068. Write points per game rounded to one decimal, from the model's measures.",
      "PPG = ROUND(DIVIDE([Total Points], [Games]), 1)",
      BY_POSITION_2024,
      "Wrap the DIVIDE in ROUND(…, 1).",
      "In Power BI you'd usually set the format instead of rounding, so sums stay exact. ROUND is for when the rounded number is the one you want to use downstream.",
      BASE,
    ),
  ],
  "pb-job-l1": [
    dax(
      "A Detroit-only role should only ever see Lions numbers. Write a measure that totals Detroit's points, by season.",
      'Lions Points = CALCULATE([Total Points], Results[Team] = "DET")',
      { rows: "season" },
      'CALCULATE([Total Points], Results[Team] = "DET").',
      "Row-level security uses the same kind of filter, Results[Team] = \"DET\", applied to the table for everyone in the role. Writing it as a measure first is how you check what they'll see.",
      BASE,
    ),
  ],
  "pb-job-l2": [
    dax(
      "What does a typical player total at each position in 2024? Average the players' totals, not the games.",
      "Avg Player Total = AVERAGEX(VALUES(Results[Player]), [Total Points])",
      BY_POSITION_2024,
      "AVERAGEX(VALUES(Results[Player]), [Total Points]) visits each player and averages their totals.",
      "An iterator with a measure inside does context transition: [Total Points] is worked out for one player at a time. In Tableau you'd reach for an LOD, {FIXED player : SUM(points)}, to say the same thing.",
      BASE,
    ),
  ],
};
