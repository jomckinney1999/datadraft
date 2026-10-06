/**
 * The question bank — LeetCode for football data.
 *
 * A question is a standalone problem: a situation, a table or two, and a
 * result you have to produce. No lesson around it, no drive to lose, no
 * timeout spent. You can solve one on a bus.
 *
 * Every question runs against the same pinned database the lessons use
 * (`lib/fantasy-data.ts`), which is real nflverse weekly scoring from 2022
 * through the newest completed week, plus a league built from real Sleeper
 * data. Numbers a prompt quotes come from lib/lesson-facts.generated.ts.
 * That matters twice over: the answers are checkable against any box score,
 * and one seeded database means a learner's mental model of the tables
 * carries from a lesson straight into a question.
 *
 * **Grading is by value, not by text** (`lib/sql-grade.ts`). The learner's
 * SQL and `expected` both run, and the result grids are compared. So there is
 * no single "right" phrasing — a CTE and a subquery both pass.
 *
 * `returns` is not decoration. Because grading compares grids, a prompt that
 * does not say which columns in which order is unfair: the learner can have
 * the right idea and still fail on a column they were never asked for. Say it
 * explicitly, every time.
 *
 * **Four languages, one bank.** SQL runs against that database. Python and R
 * run in Pyodide / WebR (`lib/runtimes.ts`) against a `setup` prelude that
 * builds the same real 2024 season out of a literal, and are graded on what
 * the code *prints* — same as the lesson player's `code` drills. Excel
 * evaluates a real formula against the workbook in `lib/excel-data.ts` and is
 * graded on the value produced, so any correct spelling passes.
 *
 * **Run `node scripts/verify-answer-keys.mjs` after touching any question.**
 * It executes every SQL key against the real database, every Python key in
 * Pyodide, and every Excel key through the shipped engine, and fails on a key
 * that errors, returns or prints nothing, or sits on an untied-LIMIT trap. R
 * keys are skipped — there is no supported Node build of WebR — and the
 * script says so rather than passing them silently, which is why the R
 * questions here stay deliberately short.
 */

import { SCHEMA } from "@/lib/league-schema";
import { FACTS } from "@/lib/lesson-facts.generated";
import { WEEKLY_2024 } from "@/lib/question-frames.generated";
import { EXTRA_SCHEMA, isLeagueOnly } from "@/lib/practice-schemas";

// Labels, prices and the two unions live in a small module so cards can use
// them without importing the bank; re-exported here so nothing else changes.
import {
  DIFFICULTY_XP,
  LANG_LABEL,
  LANG_WEIGHT,
  type QuestionDifficulty,
  type QuestionLang,
} from "@/lib/question-meta";
export { DIFFICULTY_XP, LANG_LABEL, LANG_WEIGHT };
export type { QuestionDifficulty, QuestionLang };

/**
 * Which drawn scene sits on the card. One per idea in a title, and the
 * rule is literal: a quarterback question shows a quarterback, a burger
 * question shows a burger. See components/question-art.tsx.
 */
export type QuestionArt =
  | "binoculars"
  | "boom"
  | "broom"
  | "burger"
  | "calendar"
  | "chalkboard"
  | "clicker"
  | "cliff"
  | "crown"
  | "dome"
  | "double-flame"
  | "film"
  | "floor-ceiling"
  | "foam-finger"
  | "hammer"
  | "huddle"
  | "jersey"
  | "magnifier"
  | "mask"
  | "medals"
  | "medkit"
  | "money-bag"
  | "night-game"
  | "peak"
  | "pie"
  | "podium"
  | "positions"
  | "ppg"
  | "quarterback"
  | "receiver"
  | "rocket"
  | "scale"
  | "shield"
  | "spotlight"
  | "stairs"
  | "storm"
  | "ticket"
  | "tight-end"
  | "velvet-rope"
  | "wave"
  | "weather"
  | "years"
  | "zzz"
  | "turkey"
  | "gift"
  | "hourglass"
  | "leaf-snow"
  | "high-jump"
  | "mirror"
  | "milk-carton"
  | "donut"
  | "thermometer"
  | "fiddle"
  | "record-book"
  | "goose"
  | "necktie"
  | "photo-finish"
  | "can-opener"
  | "letter-j"
  | "lawnmower"
  | "house"
  | "party-blower"
  | "fireworks"
  | "road-sign"
  | "snowball"
  | "buckets"
  | "boxing-gloves"
  | "chef-hat"
  | "train"
  | "gone-fishing"
  | "ladder"
  | "high-five"
  | "framed-jersey"
  | "milestone"
  | "sandwich-board"
  | "ice-cube"
  | "slide"
  | "clipboard"
  | "fingerprint"
  | "balloon"
  | "colander"
  | "magic-hat"
  | "tug-of-war"
  | "sweater"
  | "suitcase"
  | "starting-blocks"
  | "tier-cake"
  | "castle"
  | "seesaw"
  | "boomerang"
  | "spring"
  | "speedometer"
  | "elevator"
  | "spirit-level"
  | "trash-can"
  | "crunch-clock"
  | "mug"
  | "draft-board"
  | "beach-umbrella"
  | "winged-shoes"
  | "shelf"
  | "spare-tire"
  | "vinyl"
  | "growth-chart"
  | "face-off"
  | "pile"
  | "pillow"
  | "u-turn"
  | "tackle-dummy"
  | "robin"
  | "road-trip"
  | "halfway"
  | "desk-fan"
  | "empty-seats"
  | "first-look"
  | "game-of-the-year"
  | "ten-big-weeks"
  | "hands-in"
  | "form-line"
  | "moving-box"
  | "qb-grid"
  | "steady-hands"
  | "where-was"
  | "race-to-200"
  | "four-spots"
  | "name-tags"
  | "tally-marks"
  | "per-game"
  | "tall-bar"
  | "steady-streaky"
  | "game-tags"
  | "stacked-blocks"
  | "leap"
  | "pennants"
  | "above-line"
  | "adding-machine"
  | "middle-ball"
  | "stamp"
  | "silver-medal"
  | "backfield"
  | "crowned-receiver"
  | "rank-board"
  | "blank-cell"
  | "empty-weeks"
  | "twenty-cells"
  | "crosshairs"
  | "which-week"
  | "not-on-sheet"
  | "shopping-bag"
  | "rush-cart"
  | "cash-register"
  | "shop-window"
  | "basket"
  | "welcome-mat"
  | "return-box"
  | "price-tag"
  | "coupon"
  | "wallet-crown"
  | "two-dates"
  | "blank-form"
  | "free-truck"
  | "heart-jersey"
  | "coin-steps"
  | "signup-hourglass"
  | "fourth-down-sign"
  | "go-chart"
  | "third-down-chains"
  | "red-zone-flag"
  | "chunk-ruler"
  | "script-card"
  | "deep-bomb"
  | "target-bullseye"
  | "long-kick"
  | "ep-gauge"
  | "turnover-scale"
  | "comeback-scoreboard"
  | "hot-hand-flame"
  | "dome-sun"
  | "yard-cow"
  | "sack-qb"
  | "marathon-chain"
  | "phone-sunday"
  | "dau-counter"
  | "peak-mountain"
  | "glue-phone"
  | "seven-calendar"
  | "funnel-steps"
  | "empty-lineup"
  | "channel-signs"
  | "stopwatch-thirty"
  | "first-footprint"
  | "double-tap"
  | "phone-laptop"
  | "join-hourglass"
  | "piggy-repeat"
  | "rolling-wheel"
  | "kickoff-clock"
  | "power-battery"
  | "name-initial"
  | "two-jerseys"
  | "composite-key"
  | "floor-ten"
  | "above-usual"
  | "torn-name"
  | "september-page"
  | "no-shootout";

export type Question = {
  id: string;
  title: string;
  difficulty: QuestionDifficulty;
  lang: QuestionLang;
  /** Short concept labels for the filter chips. */
  tags: string[];
  /** The situation, in plain English. Two or three sentences at most. */
  prompt: string;
  /** Exactly which columns, in which order. Required — see the file note. */
  returns: string;
  /** SQL only: tables this question touches, so the panel shows only those. */
  tables: string[];
  /**
   * Python / R only: code run before the learner's, building the data they
   * work on. The answer key runs against the identical prelude, so grading
   * compares two programs that saw the same world.
   */
  setup?: string;
  /** Excel only: which sheet of lib/excel-data.ts the formula is graded on. */
  sheet?: string;
  /** Optional first line in the editor. Keep it a nudge, not a skeleton. */
  starter?: string;
  expected: string;
  orderMatters?: boolean;
  hint: string;
  /** Shown after a correct answer — the idea, not a restatement. */
  explain: string;
  art: QuestionArt;
  /**
   * The first day this question can be a Question of the Day (YYYY-MM-DD).
   * The daily rotation is computed over the pool, so adding questions
   * re-deals every future day — and, without this, today's too, swapping the
   * question people are already sharing ("same question for everyone
   * today"). New questions appear in the bank at once and join the rotation
   * from the day after they ship.
   */
  added?: string;
  /**
   * The players this question is about, for the faces on its card. Names
   * must be lesson players (the verifier checks). Leave it off and the card
   * picks by the position the prompt mentions, then by a stable slice of the
   * roster — see lib/question-players.ts.
   */
  players?: string[];
};

export const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};


/**
 * The 2024 season, as a literal, for the Python and R questions.
 *
 * Same twenty players and the same real totals the SQL questions aggregate
 * out of `week_results` — read out of the database, not typed from memory.
 * Inlined rather than fetched: Pyodide has no network without a shim, and a
 * question that fails because a CDN blinked teaches nothing.
 *
 * Built as a dict-of-lists rather than a parsed CSV so the prelude reads the
 * way a learner's own scratch file would, and so nothing here depends on
 * which string-quoting survives a build step.
 */
const PLAYERS = [
  "Lamar Jackson",
  "Ja'Marr Chase",
  "Josh Allen",
  "Jahmyr Gibbs",
  "Saquon Barkley",
  "Bijan Robinson",
  "Derrick Henry",
  "Justin Jefferson",
  "Amon-Ra St. Brown",
  "Jalen Hurts",
  "Patrick Mahomes",
  "CeeDee Lamb",
  "Davante Adams",
  "George Kittle",
  "Tyreek Hill",
  "A.J. Brown",
  "Puka Nacua",
  "Travis Kelce",
  "Sam LaPorta",
  "Christian McCaffrey",
];
const POSITIONS = [
  "QB", "WR", "QB", "RB", "RB", "RB", "RB", "WR", "WR", "QB",
  "QB", "WR", "WR", "TE", "WR", "WR", "WR", "TE", "TE", "RB",
];
const TEAMS = [
  "BAL", "CIN", "BUF", "DET", "PHI", "ATL", "BAL", "MIN", "DET", "PHI",
  "KC", "DAL", "NYJ", "SF", "MIA", "PHI", "LA", "KC", "DET", "SF",
];
const GAMES = [17, 17, 16, 17, 16, 17, 17, 17, 17, 15, 16, 15, 14, 15, 17, 13, 11, 16, 16, 4];
const POINTS = [
  430.4, 403.0, 379.1, 362.9, 355.3, 341.7, 336.4, 317.5, 316.2, 315.0,
  282.9, 263.4, 241.3, 236.6, 218.2, 216.9, 206.6, 195.4, 174.6, 47.8,
];
const BEST = [
  36.1, 55.4, 51.9, 46.0, 46.2, 31.3, 35.9, 36.4, 38.7, 35.1,
  28.8, 39.6, 42.8, 24.8, 28.1, 25.0, 41.8, 25.0, 18.4, 16.7,
];

const pyList = (xs: (string | number)[]) =>
  xs.map((x) => (typeof x === "number" ? String(x) : JSON.stringify(x))).join(", ");

/** Python prelude: pandas, one DataFrame called `df`. */
export const PY_SETUP = `import pandas as pd

df = pd.DataFrame({
    "player": [${pyList(PLAYERS)}],
    "position": [${pyList(POSITIONS)}],
    "team": [${pyList(TEAMS)}],
    "games": [${pyList(GAMES)}],
    "points": [${pyList(POINTS)}],
    "best": [${pyList(BEST)}],
})
`;

const rVec = (xs: (string | number)[]) =>
  `c(${xs.map((x) => (typeof x === "number" ? String(x) : JSON.stringify(x))).join(", ")})`;

/** R prelude: dplyr, one data frame called `df`. */
export const R_SETUP = `suppressMessages(library(dplyr))

df <- data.frame(
  player = ${rVec(PLAYERS)},
  position = ${rVec(POSITIONS)},
  team = ${rVec(TEAMS)},
  games = ${rVec(GAMES)},
  points = ${rVec(POINTS)},
  best = ${rVec(BEST)},
  stringsAsFactors = FALSE
)
`;

/**
 * The same preludes plus `weekly`: one row per game of the 2024 season
 * (player, position, team, week, points), from lib/question-frames.generated.ts.
 * A season-totals table only supports one-liners; real pandas and dplyr work
 * happens on the long table, where rolling averages, running totals, pivots
 * and missing weeks live. The rows are the database's, so `weekly` sums to
 * `df` to the tenth, and the verifier checks it.
 */
const WEEKLY_COLS = ["player", "position", "team", "week", "points"] as const;

export const PY_WEEKLY_SETUP = `${PY_SETUP}
weekly = pd.DataFrame(
    [
${WEEKLY_2024.map((r) => `        [${pyList(r)}],`).join("\n")}
    ],
    columns=[${pyList([...WEEKLY_COLS])}],
)
`;

export const R_WEEKLY_SETUP = `${R_SETUP}
weekly <- data.frame(
${WEEKLY_COLS.map((c, i) => `  ${c} = ${rVec(WEEKLY_2024.map((r) => r[i]))}`).join(",\n")},
  stringsAsFactors = FALSE
)
`;


export const QUESTIONS: Question[] = [
  // ── Easy ──────────────────────────────────────────────────────
  {
    id: "week-3-hammer",
    players: ["Saquon Barkley", "Josh Allen", "Derrick Henry"],
    title: "Week 3 Hammer",
    difficulty: "easy",
    lang: "sql",
    tags: ["ORDER BY", "LIMIT", "WHERE"],
    prompt:
      "Your league chat is arguing about who had the biggest week 3 of the 2024 season. Settle it.",
    returns: "One row: player, team, fantasy_pts.",
    tables: ["week_results"],
    starter: "SELECT player, team, fantasy_pts\nFROM week_results\n",
    expected: `SELECT player, team, fantasy_pts
FROM week_results
WHERE season = 2024 AND week = 3
ORDER BY fantasy_pts DESC
LIMIT 1;`,
    orderMatters: true,
    hint: "Filter to the one week first, then sort biggest-to-smallest and stop after one row.",
    explain:
      "ORDER BY decides what 'top' means and LIMIT decides how much of it you keep. Without the sort, LIMIT 1 just hands you whichever row the database happened to reach first.",
    art: "hammer",
  },
  {
    id: "the-quarterbacks",
    title: "Name the Quarterbacks",
    difficulty: "easy",
    lang: "sql",
    tags: ["DISTINCT", "WHERE"],
    prompt:
      "You've been handed a table with thousands of weekly stat lines and you want to know which quarterbacks are even in it. Each one should appear once.",
    returns: "player and team, one row per quarterback, ordered by player A–Z.",
    tables: ["week_results"],
    expected: `SELECT DISTINCT player, team
FROM week_results
WHERE position = 'QB'
ORDER BY player;`,
    orderMatters: true,
    hint: "One row per game played means the same name repeats. DISTINCT collapses the repeats.",
    explain:
      "DISTINCT works across every column you selected, not just the first one. Add a column and you can get more rows back, not fewer.",
    art: "quarterback",
  },
  {
    id: "thirty-burger",
    title: "Thirty Burger",
    difficulty: "easy",
    lang: "sql",
    tags: ["WHERE", "ORDER BY"],
    prompt:
      "A 30-point game wins you the week on its own. Find every one of them from the 2024 season.",
    returns: "player, week, fantasy_pts — highest score first.",
    tables: ["week_results"],
    expected: `SELECT player, week, fantasy_pts
FROM week_results
WHERE season = 2024 AND fantasy_pts >= 30
ORDER BY fantasy_pts DESC;`,
    orderMatters: true,
    hint: "Two conditions on the same WHERE, joined with AND.",
    explain:
      "Filtering and sorting are separate jobs. WHERE decides which rows survive; ORDER BY decides what order the survivors come back in.",
    art: "burger",
  },
  {
    id: "games-actually-played",
    players: ["Christian McCaffrey", "Jahmyr Gibbs"],
    title: "Games Actually Played",
    difficulty: "easy",
    lang: "sql",
    tags: ["COUNT", "GROUP BY"],
    prompt:
      `The table runs from ${FACTS.seasons[0]} through week ${FACTS.latest.week} of ${FACTS.latest.season} — ${FACTS.possibleGames} games if you never miss one. Nobody does. Count how many games each running back actually shows up for across the whole table.`,
    returns: "player and the count as games, most games first.",
    tables: ["week_results"],
    expected: `SELECT player, COUNT(*) AS games
FROM week_results
WHERE position = 'RB'
GROUP BY player
ORDER BY games DESC;`,
    orderMatters: true,
    hint: "GROUP BY player turns thousands of rows into one row per player. COUNT(*) counts the rows inside each group.",
    explain:
      `A missed game is an absent row, not a zero — which is exactly why COUNT(*) is the injury story. Christian McCaffrey comes back with ${FACTS.gamesPlayed["Christian McCaffrey"]}, not ${FACTS.possibleGames}.`,
    art: "calendar",
  },
  {
    id: "rough-afternoon",
    title: "Rough Afternoon",
    difficulty: "easy",
    lang: "sql",
    tags: ["ORDER BY", "LIMIT"],
    prompt:
      "Somebody started these guys. Find the five worst single-game scores in the table.",
    returns: "player, season, week, fantasy_pts — worst first, ties broken by player A–Z.",
    tables: ["week_results"],
    expected: `SELECT player, season, week, fantasy_pts
FROM week_results
ORDER BY fantasy_pts ASC, player
LIMIT 5;`,
    orderMatters: true,
    hint: "Same shape as finding the best — sort the other way, then by player so two identical scores always land in the same order.",
    explain:
      "ASC and DESC are the whole difference between a leaderboard and a blooper reel. ASC is the default, so writing it out is a favour to whoever reads the query next.",
    art: "storm",
  },
  {
    id: "whos-on-my-team",
    players: ["Christian McCaffrey", "Jahmyr Gibbs"],
    title: "Who's On My Team",
    difficulty: "easy",
    lang: "sql",
    tags: ["JOIN"],
    prompt:
      "The rosters table is a five-team league drafted on real 2024 Sleeper ADP. Pull the Blitz Brothers roster with each player's 2024 NFL team and position.",
    returns: "player, team, position — one row per rostered player, player A–Z.",
    tables: ["rosters", "week_results"],
    expected: `SELECT DISTINCT r.player, w.team, w.position
FROM rosters r
JOIN week_results w ON w.player = r.player
WHERE r.team_name = 'Blitz Brothers' AND w.season = 2024
ORDER BY r.player;`,
    orderMatters: true,
    hint: "week_results has a row per game, so joining straight to it repeats each player. DISTINCT tidies that up.",
    explain:
      "Joining a one-row-per-thing table to a many-rows-per-thing table gives you the many. That is usually a bug, and DISTINCT is the quickest tell that you have hit it.",
    art: "jersey",
  },
  {
    id: "waiver-risers",
    title: "Waiver Risers",
    difficulty: "easy",
    lang: "sql",
    tags: ["WHERE", "ORDER BY"],
    prompt:
      "waiver_wire is Sleeper's real waiver wire: the share of Sleeper leagues rostering each player, and how many points that share moved in a week. Find the players trending up.",
    returns: "player, position, pct_rostered, trend — biggest riser first.",
    tables: ["waiver_wire"],
    expected: `SELECT player, position, pct_rostered, trend
FROM waiver_wire
WHERE trend > 0
ORDER BY trend DESC;`,
    orderMatters: true,
    hint: "Trending up means a trend above zero.",
    explain:
      `This is Sleeper's real wire going into week ${FACTS.league.wireWeek} of ${FACTS.league.season}. ${FACTS.league.topRiser.player}'s share jumped ${FACTS.league.topRiser.trend} points in a single week — that is what a waiver run looks like in data.`,
    art: "rocket",
  },
  {
    id: "the-slate",
    title: "The Slate",
    difficulty: "easy",
    lang: "sql",
    tags: ["COUNT", "GROUP BY"],
    prompt:
      "The games table is the real NFL schedule. Count how many games each season holds.",
    returns: "season and the count as games, earliest season first.",
    tables: ["games"],
    expected: `SELECT season, COUNT(*) AS games
FROM games
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "One group per season, count the rows in each.",
    explain:
      "Counting rows per group is the fastest sanity check on any new table. If a season came back with 40 games you would know something was wrong before you built anything on top of it.",
    art: "chalkboard",
  },
  {
    id: "indoor-football",
    title: "Indoor Football",
    difficulty: "easy",
    lang: "sql",
    tags: ["IN", "COUNT"],
    prompt:
      "Roof tells you whether the weather was a factor. Count the 2024 games played under a roof — that's 'dome' or 'closed'.",
    returns: "One row, one column, named indoor_games.",
    tables: ["games"],
    expected: `SELECT COUNT(*) AS indoor_games
FROM games
WHERE season = 2024 AND roof IN ('dome', 'closed');`,
    hint: "IN ('a', 'b') is shorter than writing the same column twice with OR.",
    explain:
      "'dome' is a stadium that is always closed; 'closed' is a retractable roof they shut that day. Different facts, same consequence for the players — which is why the filter has to take both.",
    art: "dome",
  },
  {
    id: "tight-end-premium",
    title: "Tight End Premium",
    difficulty: "easy",
    lang: "sql",
    tags: ["AVG", "GROUP BY", "ROUND"],
    prompt:
      "People say tight end is a wasteland and quarterback is a cheat code. Get the average score per game for each position in 2024 and see.",
    returns: "position and avg_pts rounded to one decimal, highest average first.",
    tables: ["week_results"],
    expected: `SELECT position, ROUND(AVG(fantasy_pts), 1) AS avg_pts
FROM week_results
WHERE season = 2024
GROUP BY position
ORDER BY avg_pts DESC;`,
    orderMatters: true,
    hint: "AVG over the group, ROUND on the outside of it.",
    explain:
      "An average across a whole position hides the shape of it. Quarterbacks win here because every one of them plays every snap, not because the position is deeper.",
    art: "tight-end",
  },

  // ── Medium ────────────────────────────────────────────────────
  {
    id: "points-per-game",
    title: "Points Per Game",
    difficulty: "medium",
    lang: "sql",
    tags: ["GROUP BY", "HAVING", "AVG"],
    prompt:
      "Season totals reward players who stayed healthy. Per-game scoring is the fairer comparison. Rank the 2024 season by points per game, but only for players with at least 10 games — a two-game sample is noise.",
    returns: "player, games, ppg rounded to one decimal — best ppg first.",
    tables: ["week_results"],
    expected: `SELECT player, COUNT(*) AS games, ROUND(AVG(fantasy_pts), 1) AS ppg
FROM week_results
WHERE season = 2024
GROUP BY player
HAVING COUNT(*) >= 10
ORDER BY ppg DESC;`,
    orderMatters: true,
    hint: "WHERE filters rows before grouping. The 10-game rule is about the group, so it needs HAVING.",
    explain:
      "WHERE runs before GROUP BY and HAVING runs after. That ordering is the whole reason you cannot put COUNT(*) in a WHERE — at that point the groups do not exist yet.",
    art: "ppg",
  },
  {
    id: "boom-games",
    title: "Boom Games",
    difficulty: "medium",
    lang: "sql",
    tags: ["CASE", "SUM", "GROUP BY"],
    prompt:
      "A ceiling matters more than an average in a head-to-head league. For 2024, count how many 20-point games each player had — including the players who had none.",
    returns: "player and boom_games, most first, then player A–Z.",
    tables: ["week_results"],
    expected: `SELECT player,
       SUM(CASE WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END) AS boom_games
FROM week_results
WHERE season = 2024
GROUP BY player
ORDER BY boom_games DESC, player;`,
    orderMatters: true,
    hint: "Filtering to 20+ in the WHERE would drop the players who never got there. Count conditionally instead.",
    explain:
      "SUM(CASE WHEN … THEN 1 ELSE 0 END) counts a subset without throwing away the rest of the group. It is the standard move any time 'including the zeroes' is part of the question.",
    art: "boom",
  },
  {
    id: "floor-and-ceiling",
    title: "Floor and Ceiling",
    difficulty: "medium",
    lang: "sql",
    tags: ["MIN", "MAX", "HAVING"],
    prompt:
      "Two backs can average the same and feel completely different to own. Show each running back's worst game, best game and average for 2024, with at least 8 games played.",
    returns: "player, floor, ceiling, avg_pts rounded to one decimal — widest spread (ceiling minus floor) first.",
    tables: ["week_results"],
    expected: `SELECT player,
       MIN(fantasy_pts) AS floor,
       MAX(fantasy_pts) AS ceiling,
       ROUND(AVG(fantasy_pts), 1) AS avg_pts
FROM week_results
WHERE season = 2024 AND position = 'RB'
GROUP BY player
HAVING COUNT(*) >= 8
ORDER BY MAX(fantasy_pts) - MIN(fantasy_pts) DESC;`,
    orderMatters: true,
    hint: "You can ORDER BY an expression built from aggregates, even one you did not select.",
    explain:
      "Spread is the number nobody puts on a leaderboard and everybody feels. The widest one here is a player you would have started every week and cursed half of them.",
    art: "floor-ceiling",
  },
  {
    id: "year-over-year",
    players: ["Amon-Ra St. Brown"],
    title: "Year Over Year",
    difficulty: "medium",
    lang: "sql",
    tags: ["GROUP BY", "Multiple grains"],
    prompt:
      "Amon-Ra St. Brown's owners want to know whether he is still climbing. Show his per-game scoring for each season in the table.",
    returns: "season, games, ppg rounded to one decimal — earliest season first.",
    tables: ["week_results"],
    expected: `SELECT season, COUNT(*) AS games, ROUND(AVG(fantasy_pts), 1) AS ppg
FROM week_results
WHERE player = 'Amon-Ra St. Brown'
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "One row per season means GROUP BY season, even though you are looking at one player.",
    explain:
      "The grain of your answer is whatever you put in the GROUP BY. Same table, same filter — group by season and you get a career arc, group by week and you get a heartbeat.",
    art: "years",
  },
  {
    id: "league-standings",
    players: ["Ja'Marr Chase", "Bijan Robinson", "Saquon Barkley"],
    title: "League Standings",
    difficulty: "medium",
    lang: "sql",
    tags: ["JOIN", "SUM", "GROUP BY"],
    prompt:
      "Five teams, two draft picks each, one season. Add up what each team's roster scored in 2024 and post the standings.",
    returns: "team_name and total_pts rounded to one decimal — highest total first.",
    tables: ["rosters", "week_results"],
    expected: `SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total_pts
FROM rosters r
JOIN week_results w ON w.player = r.player
WHERE w.season = 2024
GROUP BY r.team_name
ORDER BY total_pts DESC;`,
    orderMatters: true,
    hint: "Join first so every stat line knows which team owns it, then group by the owner.",
    explain:
      "Join, then aggregate. Aggregating first and joining after is a real technique, but it is the wrong instinct here and it is how double-counted totals get shipped.",
    art: "podium",
  },
  {
    id: "thursday-night",
    title: "Thursday Night",
    difficulty: "medium",
    lang: "sql",
    tags: ["JOIN", "AVG"],
    prompt:
      "Thursday games have a reputation for being ugly. week_results has no date on it, but games does — join them and compare average scoring by day of week in 2024.",
    returns: "weekday and avg_pts rounded to one decimal — highest average first.",
    tables: ["week_results", "games"],
    expected: `SELECT g.weekday, ROUND(AVG(w.fantasy_pts), 1) AS avg_pts
FROM week_results w
JOIN games g
  ON g.season = w.season
 AND g.week = w.week
 AND (g.home_team = w.team OR g.away_team = w.team)
WHERE w.season = 2024
GROUP BY g.weekday
ORDER BY avg_pts DESC;`,
    orderMatters: true,
    hint: "A stat line belongs to the one game where that player's team appears — on either side of it.",
    explain:
      "The join key is season, week and 'this team played in it', which is two columns OR'd together. Getting that condition wrong is how one stat line silently becomes two.",
    art: "night-game",
  },
  {
    id: "weather-report",
    title: "Weather Report",
    difficulty: "medium",
    lang: "sql",
    tags: ["JOIN", "CASE", "GROUP BY"],
    prompt:
      "Indoor football is supposed to be easier football. Join the schedule and compare average scoring indoors ('dome' or 'closed') against outdoors, for 2024.",
    returns: "setting ('Indoors' or 'Outdoors') and avg_pts rounded to one decimal — highest average first.",
    tables: ["week_results", "games"],
    expected: `SELECT CASE WHEN g.roof IN ('dome', 'closed') THEN 'Indoors' ELSE 'Outdoors' END AS setting,
       ROUND(AVG(w.fantasy_pts), 1) AS avg_pts
FROM week_results w
JOIN games g
  ON g.season = w.season
 AND g.week = w.week
 AND (g.home_team = w.team OR g.away_team = w.team)
WHERE w.season = 2024
GROUP BY setting
ORDER BY avg_pts DESC;`,
    orderMatters: true,
    hint: "Build the two buckets with CASE, then group by the bucket you just built.",
    explain:
      "You can GROUP BY the alias of something you computed in the SELECT. That is how four messy roof values become the two categories anyone actually cares about.",
    art: "weather",
  },
  {
    id: "the-untouchables",
    title: "The Untouchables",
    difficulty: "medium",
    lang: "sql",
    tags: ["HAVING", "MIN"],
    prompt:
      "A dud week costs you the matchup. Find the 2024 players who never had one — nobody below 5 points all season, minimum 10 games.",
    returns: "player, games, floor — lowest games first, then player A–Z.",
    tables: ["week_results"],
    expected: `SELECT player, COUNT(*) AS games, MIN(fantasy_pts) AS floor
FROM week_results
WHERE season = 2024
GROUP BY player
HAVING COUNT(*) >= 10 AND MIN(fantasy_pts) >= 5
ORDER BY games, player;`,
    orderMatters: true,
    hint: "'Never below 5' is a fact about the whole group, which makes it a MIN inside a HAVING.",
    explain:
      "Any 'never' or 'always' question is a MIN or MAX in disguise. Never below 5 is exactly MIN(fantasy_pts) >= 5, and it is one condition instead of a subquery.",
    art: "shield",
  },
  {
    id: "top-of-each-week",
    title: "Top of Each Week",
    difficulty: "medium",
    lang: "sql",
    tags: ["Subquery", "GROUP BY"],
    prompt:
      "Who owned each week? For the first six weeks of 2024, find the single highest-scoring player in each one.",
    returns: "week, player, fantasy_pts — week 1 first.",
    tables: ["week_results"],
    expected: `SELECT w.week, w.player, w.fantasy_pts
FROM week_results w
WHERE w.season = 2024
  AND w.week <= 6
  AND w.fantasy_pts = (
    SELECT MAX(x.fantasy_pts)
    FROM week_results x
    WHERE x.season = w.season AND x.week = w.week
  )
ORDER BY w.week;`,
    orderMatters: true,
    hint: "Find each week's maximum first, then keep only the rows that match it.",
    explain:
      "Grouping gives you the maximum but loses the name attached to it. Matching rows back against the per-group maximum is how you keep both — and it is the problem window functions were invented to make easier.",
    art: "crown",
  },
  {
    id: "who-improved",
    players: ["Ja'Marr Chase", "Saquon Barkley", "Bijan Robinson"],
    title: "Who Improved",
    difficulty: "medium",
    lang: "sql",
    tags: ["CASE", "HAVING", "AVG"],
    prompt:
      "Draft boards are built on last year. Find the players whose 2024 points per game beat their 2023 — counting only players who actually played in both seasons.",
    returns: "player, ppg_2023, ppg_2024 each rounded to one decimal — biggest jump first.",
    tables: ["week_results"],
    expected: `SELECT player,
       ROUND(AVG(CASE WHEN season = 2023 THEN fantasy_pts END), 1) AS ppg_2023,
       ROUND(AVG(CASE WHEN season = 2024 THEN fantasy_pts END), 1) AS ppg_2024
FROM week_results
WHERE season IN (2023, 2024)
GROUP BY player
HAVING ppg_2024 > ppg_2023
ORDER BY ppg_2024 - ppg_2023 DESC;`,
    orderMatters: true,
    hint: "One row per player with a column per season. AVG ignores NULLs, so a CASE with no ELSE gives you each season's average cleanly.",
    explain:
      "AVG skipping NULLs is the whole trick. CASE WHEN season = 2023 leaves every 2024 row NULL, so the average is over 2023 alone without a second pass through the table.",
    art: "stairs",
  },
  {
    id: "opponent-unmasked",
    players: ["Ja'Marr Chase"],
    title: "Opponent Unmasked",
    difficulty: "medium",
    lang: "sql",
    tags: ["JOIN", "CASE"],
    prompt:
      "week_results never says who the player was up against. The schedule does. Work out Ja'Marr Chase's 2024 opponent, week by week.",
    returns: "week, opponent, fantasy_pts — week 1 first.",
    tables: ["week_results", "games"],
    expected: `SELECT w.week,
       CASE WHEN g.home_team = w.team THEN g.away_team ELSE g.home_team END AS opponent,
       w.fantasy_pts
FROM week_results w
JOIN games g
  ON g.season = w.season
 AND g.week = w.week
 AND (g.home_team = w.team OR g.away_team = w.team)
WHERE w.season = 2024 AND w.player = 'Ja''Marr Chase'
ORDER BY w.week;`,
    orderMatters: true,
    hint: "The opponent is whichever side of the game isn't your team — a CASE picks it.",
    explain:
      "A schedule stores a game once, with a home side and an away side. Turning that into 'who did this team play' always costs you a CASE, in every sport and every schema.",
    art: "mask",
  },

  // ── Hard ──────────────────────────────────────────────────────
  {
    id: "rank-your-position",
    title: "Rank Your Position",
    difficulty: "hard",
    lang: "sql",
    tags: ["Window", "RANK", "PARTITION BY"],
    prompt:
      "Overall totals flatter quarterbacks. Rank every 2024 player against their own position by total points instead.",
    returns: "position, player, total_pts rounded to one decimal, pos_rank — position A–Z, then rank.",
    tables: ["week_results"],
    expected: `SELECT position,
       player,
       ROUND(SUM(fantasy_pts), 1) AS total_pts,
       RANK() OVER (PARTITION BY position ORDER BY SUM(fantasy_pts) DESC) AS pos_rank
FROM week_results
WHERE season = 2024
GROUP BY position, player
ORDER BY position, pos_rank;`,
    orderMatters: true,
    hint: "The window runs after the grouping, so it can rank on SUM(fantasy_pts) directly.",
    explain:
      "PARTITION BY restarts the ranking for each position, so you get four number ones instead of one. It is the difference between a leaderboard and a set of leaderboards.",
    art: "medals",
  },
  {
    id: "rolling-form",
    players: ["Lamar Jackson"],
    title: "Rolling Form",
    difficulty: "hard",
    lang: "sql",
    tags: ["Window", "Frame", "AVG"],
    prompt:
      "One huge week can carry a season average for a month. Smooth Lamar Jackson's 2024 out with a three-week rolling average — this week and the two before it.",
    returns: "week, fantasy_pts, rolling_3 rounded to one decimal — week 1 first.",
    tables: ["week_results"],
    expected: `SELECT week,
       fantasy_pts,
       ROUND(AVG(fantasy_pts) OVER (ORDER BY week ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS rolling_3
FROM week_results
WHERE season = 2024 AND player = 'Lamar Jackson'
ORDER BY week;`,
    orderMatters: true,
    hint: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW is the window frame you want.",
    explain:
      "Without a frame, a windowed AVG runs over everything up to the current row and keeps growing. The frame is what makes it rolling rather than cumulative — and the first two rows average fewer than three weeks, which is correct, not a bug.",
    art: "wave",
  },
  {
    id: "back-to-back",
    players: ["Jahmyr Gibbs", "Lamar Jackson"],
    title: "Back to Back",
    difficulty: "hard",
    lang: "sql",
    tags: ["Window", "LAG"],
    prompt:
      "Two monster weeks in a row is when a manager starts believing. Find every time a player went 25+ in 2024 immediately after another 25+ week.",
    returns: "player, week, prev_pts, fantasy_pts — player A–Z, then week.",
    tables: ["week_results"],
    expected: `SELECT player, week, prev_pts, fantasy_pts
FROM (
  SELECT player,
         week,
         fantasy_pts,
         LAG(fantasy_pts) OVER (PARTITION BY player ORDER BY week) AS prev_pts,
         LAG(week) OVER (PARTITION BY player ORDER BY week) AS prev_week
  FROM week_results
  WHERE season = 2024
)
WHERE fantasy_pts >= 25
  AND prev_pts >= 25
  AND week = prev_week + 1
ORDER BY player, week;`,
    orderMatters: true,
    hint: "LAG gives you the previous row's value. Check the previous week number too — a bye week makes 'the row before' and 'last week' two different things.",
    explain:
      "LAG reaches back a row, not back a week, and those come apart the moment a player misses a game. Carrying the previous week number along is the cheap guard against calling a week 4 and week 9 pair back-to-back.",
    art: "double-flame",
  },
  {
    id: "share-of-the-load",
    players: ["Patrick Mahomes", "Ja'Marr Chase"],
    title: "Share of the Load",
    difficulty: "hard",
    lang: "sql",
    tags: ["Window", "Ratio", "JOIN"],
    prompt:
      "Every fantasy team has a guy carrying it. For 2024, work out what share of each example-league team's points came from each of its two players.",
    returns: "team_name, player, total_pts rounded to one decimal, pct_of_team rounded to one decimal — team A–Z, biggest share first.",
    tables: ["rosters", "week_results"],
    expected: `SELECT team_name,
       player,
       ROUND(total_pts, 1) AS total_pts,
       ROUND(100.0 * total_pts / SUM(total_pts) OVER (PARTITION BY team_name), 1) AS pct_of_team
FROM (
  SELECT r.team_name, r.player, SUM(w.fantasy_pts) AS total_pts
  FROM rosters r
  JOIN week_results w ON w.player = r.player
  WHERE w.season = 2024
  GROUP BY r.team_name, r.player
)
ORDER BY team_name, pct_of_team DESC;`,
    orderMatters: true,
    hint: "Aggregate to one row per player first. Then a window SUM over the team gives you the denominator without a second query.",
    explain:
      "A percent-of-total needs two grains at once: the row and the group it sits in. A window function is how you get the group total onto the row without joining the table back to itself.",
    art: "pie",
  },
  {
    id: "best-of-each-season",
    players: ["Ja'Marr Chase", "Josh Allen", "Justin Jefferson"],
    title: "Best of Each Season",
    difficulty: "hard",
    lang: "sql",
    tags: ["Window", "ROW_NUMBER", "Top-N"],
    prompt:
      "Give the highlight reel: the three biggest single games of each season, with the week they happened.",
    returns: "season, player, week, fantasy_pts — earliest season first, biggest score first within it.",
    tables: ["week_results"],
    expected: `SELECT season, player, week, fantasy_pts
FROM (
  SELECT season,
         player,
         week,
         fantasy_pts,
         ROW_NUMBER() OVER (PARTITION BY season ORDER BY fantasy_pts DESC) AS rn
  FROM week_results
)
WHERE rn <= 3
ORDER BY season, fantasy_pts DESC;`,
    orderMatters: true,
    hint: "Number the rows within each season, then keep the first three.",
    explain:
      "Top-N-per-group is the single most common thing window functions get used for in real analytics work. ROW_NUMBER over a partition, filter on the number, done.",
    art: "film",
  },
  {
    id: "the-drop-off",
    title: "The Drop-Off",
    difficulty: "hard",
    lang: "sql",
    tags: ["Window", "LEAD", "Gap"],
    prompt:
      "Draft strategy lives in the cliffs — the spot where the next guy at your position is a lot worse. For 2024 running backs, show each one's total and how far the next back down the list sits behind them.",
    returns: "player, total_pts rounded to one decimal, gap_to_next rounded to one decimal (NULL for the last back) — highest total first.",
    tables: ["week_results"],
    expected: `SELECT player,
       ROUND(total_pts, 1) AS total_pts,
       ROUND(total_pts - LEAD(total_pts) OVER (ORDER BY total_pts DESC), 1) AS gap_to_next
FROM (
  SELECT player, SUM(fantasy_pts) AS total_pts
  FROM week_results
  WHERE season = 2024 AND position = 'RB'
  GROUP BY player
)
ORDER BY total_pts DESC;`,
    orderMatters: true,
    hint: "LEAD is LAG pointing the other way — it reads the next row in the window's order.",
    explain:
      "The last row has no next row, so its gap is NULL rather than zero. That distinction is the point: NULL means 'there is nothing here', and a zero would have claimed the cliff was flat.",
    art: "cliff",
  },
  {
    id: "quiet-weeks",
    players: ["Puka Nacua"],
    title: "The Quiet Weeks",
    difficulty: "hard",
    lang: "sql",
    tags: ["LEFT JOIN", "NULL", "Anti-join"],
    prompt:
      "Puka Nacua missed time in 2024 and the table just has no row for those weeks. List every week 1–17 of 2024 where he has no stat line at all.",
    returns: "One column named missing_week, earliest first.",
    tables: ["week_results"],
    starter:
      "-- The weeks themselves aren't a table. You can build one:\n-- SELECT DISTINCT week FROM week_results WHERE season = 2024\n",
    expected: `SELECT wk.week AS missing_week
FROM (SELECT DISTINCT week FROM week_results WHERE season = 2024 AND week <= 17) wk
LEFT JOIN week_results w
  ON w.season = 2024 AND w.week = wk.week AND w.player = 'Puka Nacua'
WHERE w.player IS NULL
ORDER BY wk.week;`,
    orderMatters: true,
    hint: "You can only find a missing row by starting from a list of what should be there and LEFT JOINing onto it.",
    explain:
      "This is an anti-join: keep everything on the left, then keep only the rows where the right side came back empty. Absence is never findable from the table that is missing the rows — you always have to bring a list of what should exist.",
    art: "zzz",
  },
  {
    id: "streak-finder",
    players: ["Bijan Robinson", "Jalen Hurts"],
    title: "Streak Finder",
    difficulty: "hard",
    lang: "sql",
    tags: ["Window", "Gaps and islands"],
    prompt:
      "A player is 'hot' when they clear 20 points several weeks running. For 2024, find the longest such streak for each player who ever managed two in a row.",
    returns: "player and streak_weeks — longest streak first, then player A–Z.",
    tables: ["week_results"],
    expected: `SELECT player, MAX(run_len) AS streak_weeks
FROM (
  SELECT player, grp, COUNT(*) AS run_len
  FROM (
    SELECT player,
           week,
           week - ROW_NUMBER() OVER (PARTITION BY player ORDER BY week) AS grp
    FROM week_results
    WHERE season = 2024 AND fantasy_pts >= 20
  )
  GROUP BY player, grp
)
GROUP BY player
HAVING MAX(run_len) >= 2
ORDER BY streak_weeks DESC, player;`,
    orderMatters: true,
    hint: "Keep only the 20-point weeks, then subtract a row number from the week number. Consecutive weeks all land on the same value.",
    explain:
      "Gaps and islands: for a run of consecutive weeks, week minus row-number is constant, so that difference becomes a group key for the run. It looks like a trick the first time and like a tool every time after.",
    art: "magnifier",
  },
  // ── Python ────────────────────────────────────────────────────
  //
  // `df` is already in scope — the prelude builds it. Grading compares what
  // your code prints, so the answer has to come out of print().
  {
    id: "py-top-scorer",
    players: ["Lamar Jackson"],
    title: "Name the Leader",
    difficulty: "easy",
    lang: "python",
    tags: ["idxmax", "Indexing"],
    prompt:
      "The 2024 season is in a DataFrame called df. Print the name of the player who scored the most total points.",
    returns: "One line: the player's name and nothing else.",
    tables: [],
    setup: PY_SETUP,
    starter: "# df is already loaded. Columns: player, position, team, games, points, best\n",
    expected: 'print(df.loc[df["points"].idxmax(), "player"])',
    hint: "idxmax() gives you the index label of the biggest value, and .loc looks a row up by it.",
    explain:
      "max() gives you the number; idxmax() gives you the row it came from. Almost every 'who' question in pandas is the second one.",
    art: "foam-finger",
  },
  {
    id: "py-count-by-position",
    title: "Count the Room",
    difficulty: "easy",
    lang: "python",
    tags: ["value_counts", "Dict"],
    prompt:
      "Before you analyse anything, find out what is in front of you. Print how many players there are at each position.",
    returns: "A dict, e.g. {'WR': 7, 'RB': 5, ...} — print it with print().",
    tables: [],
    setup: PY_SETUP,
    starter: "# how many players per position?\n",
    expected: 'print(df["position"].value_counts().to_dict())',
    hint: "value_counts() counts each distinct value. to_dict() turns the result into a plain dict.",
    explain:
      "value_counts() is the first thing to reach for on any new column. It tells you the shape of the data before you build anything on top of it.",
    art: "clicker",
  },
  {
    id: "py-points-per-game",
    players: ["Christian McCaffrey", "Lamar Jackson"],
    title: "Per Game, Not Per Season",
    difficulty: "medium",
    lang: "python",
    tags: ["New column", "round", "sort_values"],
    prompt:
      "Season totals reward whoever stayed healthy. Work out points per game for every player, then print the top five names.",
    returns: "A list of five names, best points-per-game first.",
    tables: [],
    setup: PY_SETUP,
    starter: '# add a ppg column, then print the top five players as a list\n',
    expected:
      'df["ppg"] = df["points"] / df["games"]\nprint(df.sort_values("ppg", ascending=False)["player"].head(5).tolist())',
    hint: "Dividing two columns gives you a new column. Assign it, sort by it, then take the player column.",
    explain:
      "Christian McCaffrey played four games and is nowhere near the season leaderboard — but he is not bottom of this one. Which number you divide by decides who looks good.",
    art: "ticket",
  },
  {
    id: "py-filter-threshold",
    title: "The Three Hundred Club",
    difficulty: "medium",
    lang: "python",
    tags: ["Boolean mask", "Filtering"],
    prompt:
      "Print the names of every player who cleared 300 points, highest scorer first.",
    returns: "A list of names, highest points first.",
    tables: [],
    setup: PY_SETUP,
    starter: "# filter to 300+ points, sort high to low, print the names\n",
    expected:
      'print(df[df["points"] >= 300].sort_values("points", ascending=False)["player"].tolist())',
    hint: 'df["points"] >= 300 gives you True/False per row. Put that inside df[...] to keep only the Trues.',
    explain:
      "A boolean mask is the pandas version of WHERE. Everything else — filtering, sorting, selecting a column — chains off it.",
    art: "velvet-rope",
  },
  {
    id: "py-group-mean",
    title: "Which Position Scores",
    difficulty: "medium",
    lang: "python",
    tags: ["groupby", "mean", "round"],
    prompt:
      "Print the average total points for each position, rounded to one decimal.",
    returns: "A dict of position to average, e.g. {'QB': 340.7, ...}.",
    tables: [],
    setup: PY_SETUP,
    starter: "# average points per position, rounded to 1dp, as a dict\n",
    expected:
      'print(df.groupby("position")["points"].mean().round(1).to_dict())',
    hint: "groupby the position, pick the points column, take the mean, round it, then to_dict().",
    explain:
      "groupby → pick a column → aggregate is the pandas shape of GROUP BY. If you can read the SQL version you can read this one.",
    art: "positions",
  },
  {
    id: "py-two-stats",
    title: "Floor and Ceiling",
    difficulty: "hard",
    lang: "python",
    tags: ["agg", "Multiple aggregates"],
    prompt:
      "For each position, print the number of players, their average total points and their best single game — all in one pass.",
    returns:
      "Print the resulting DataFrame with columns in this order: players, avg_points, top_game, indexed by position and rounded to one decimal.",
    tables: [],
    setup: PY_SETUP,
    starter:
      '# one groupby, three aggregates, named players / avg_points / top_game\n',
    expected:
      'out = df.groupby("position").agg(\n    players=("player", "count"),\n    avg_points=("points", "mean"),\n    top_game=("best", "max"),\n).round(1)\nprint(out)',
    hint: "agg() takes keyword arguments: new_name=(column, function). That names the output columns for you.",
    explain:
      "Named aggregation is how you get three summaries out of one pass instead of three merges. The names are yours, so the result is readable without a legend.",
    art: "floor-ceiling",
  },
  {
    id: "py-availability",
    players: ["Christian McCaffrey", "Puka Nacua", "A.J. Brown"],
    title: "The Availability Tax",
    difficulty: "hard",
    lang: "python",
    tags: ["Filtering", "Sorting", "Derived column"],
    prompt:
      "A player who scores well but misses games is a different asset from one who does not. Find everyone who played fewer than 16 of 17 games and show what they averaged when they did play.",
    returns:
      "Print the resulting DataFrame with columns player, games, ppg (rounded to one decimal), highest ppg first, with the default index reset away.",
    tables: [],
    setup: PY_SETUP,
    starter: "# who missed time, and what did they do when available?\n",
    expected:
      'out = df[df["games"] < 16].copy()\nout["ppg"] = (out["points"] / out["games"]).round(1)\nout = out.sort_values("ppg", ascending=False)[["player", "games", "ppg"]].reset_index(drop=True)\nprint(out)',
    hint: "Filter first, .copy() so pandas does not warn you, then build the column on the filtered frame.",
    explain:
      "The .copy() is not superstition. Assigning a column to a slice of another frame is the SettingWithCopyWarning, and the fix is to decide up front whether you are making a new frame.",
    art: "medkit",
  },
  // ── Python, the long table (added 2026-10-05) ─────────────────
  //
  // These load `weekly` too (PY_WEEKLY_SETUP): one row per 2024 game. Season
  // totals only support one-liners; rolling averages, running totals,
  // pivots and missing weeks need the long table.
  {
    id: "py-first-look",
    title: "First Look",
    difficulty: "easy",
    lang: "python",
    added: "2026-10-06",
    tags: ["shape", "Exploring"],
    prompt:
      "Someone hands you a DataFrame called weekly: one row per game of the 2024 season. Before you analyse anything, find out how big it is. Print its number of rows and columns.",
    returns: "One line: the (rows, columns) tuple pandas gives you.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# weekly has one row per game: player, position, team, week, points\n",
    expected: "print(weekly.shape)",
    hint: "Every DataFrame has a .shape attribute. No brackets: it isn't a method.",
    explain:
      "Rows, then columns. It's the first thing to check on any new table: divide the rows by twenty players and you already know most of them missed some weeks.",
    art: "first-look",
  },
  {
    id: "py-game-of-the-year",
    players: ["Ja'Marr Chase"],
    title: "Game of the Year",
    difficulty: "easy",
    lang: "python",
    added: "2026-10-06",
    tags: ["idxmax", "loc"],
    prompt:
      "Find the single biggest game of the 2024 season in weekly. Print who had it, which week, and how many points.",
    returns: "One line: player, week and points separated by spaces, e.g. Name 3 21.4.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# the biggest single game in weekly\n",
    expected: 'row = weekly.loc[weekly["points"].idxmax()]\nprint(row["player"], row["week"], row["points"])',
    hint: "idxmax() gives the row label of the biggest value; .loc[label] gives you that whole row.",
    explain:
      "One idxmax, then read three fields off the row. Printing several values with print(a, b, c) separates them with spaces, which is why the Return line asks for exactly that.",
    art: "game-of-the-year",
  },
  {
    id: "py-ten-big-weeks",
    title: "Ten Big Weeks",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["Boolean mask", "groupby", "size"],
    prompt:
      "A 20-point game wins most weeks on its own. Find the players who had at least ten of them in 2024.",
    returns: "A list of names, A–Z.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# who had ten or more 20-point games?\n",
    expected: 'big = weekly[weekly["points"] >= 20].groupby("player").size()\nprint(sorted(big[big >= 10].index.tolist()))',
    hint: "Filter to the 20-point games first, then groupby player and count with size(). Filter that result again for 10 or more.",
    explain:
      "Two filters, one before the groupby and one after it: the pandas version of WHERE and then HAVING. Sorting the names makes the answer the same however you got there.",
    art: "ten-big-weeks",
  },
  {
    id: "py-team-effort",
    title: "Team Effort",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["groupby", "sum", "nlargest"],
    prompt:
      "Which NFL teams got the most fantasy points out of the players in weekly? Use the team on each game's row, so a player who moved mid-season counts for both teams.",
    returns: "A dict of the top three teams to their total points, rounded to one decimal, biggest first.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# total points by team, top three\n",
    expected: 'print(weekly.groupby("team")["points"].sum().round(1).nlargest(3).to_dict())',
    hint: "groupby the team, sum the points, round, then nlargest(3) keeps the top three in order.",
    explain:
      "nlargest(3) is sort_values(ascending=False).head(3) in one call. Philadelphia tops it with three players in the table, which says more about who's in the table than about the Eagles.",
    art: "hands-in",
  },
  {
    id: "py-three-game-form",
    players: ["Lamar Jackson"],
    title: "Three-Game Form",
    difficulty: "hard",
    lang: "python",
    added: "2026-10-06",
    tags: ["rolling", "sort_values", "Window"],
    prompt:
      "One game is noise; three in a row is form. Work out Lamar Jackson's three-game rolling average through 2024 and print the last five values.",
    returns: "A list of five numbers, each rounded to one decimal, in week order.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# Lamar's 3-game rolling average, last five values\n",
    expected: 'lamar = weekly[weekly["player"] == "Lamar Jackson"].sort_values("week")\nprint(lamar["points"].rolling(3).mean().round(1).tail(5).tolist())',
    hint: "Filter to Lamar and sort by week first: rolling() works down the rows in the order they're in. Then .rolling(3).mean().",
    explain:
      "rolling(3) averages each row with the two before it, so it only means 'the last three games' if the rows are in week order. weekly isn't sorted by player, so sort first. That's the bug this question exists to catch.",
    art: "form-line",
  },
  {
    id: "py-change-of-address",
    players: ["Davante Adams"],
    title: "Change of Address",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["merge", "Boolean mask", "unique"],
    prompt:
      "df lists each player's team at the end of the season; weekly has his team on every game. Merge them and find the players who played a game for a team other than their final one.",
    returns: "A list of names, A–Z.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# merge weekly with df's team, then compare\n",
    expected: 'm = weekly.merge(df[["player", "team"]], on="player", suffixes=("_game", "_season"))\nprint(sorted(m.loc[m["team_game"] != m["team_season"], "player"].unique()))',
    hint: 'merge on "player". Both frames have a team column, so pass suffixes=("_game", "_season") to tell them apart.',
    explain:
      "When both sides of a merge have a column with the same name, pandas renames them with suffixes. Choosing the suffixes yourself is what keeps the next line readable.",
    art: "moving-box",
  },
  {
    id: "py-quarterback-grid",
    title: "Quarterback Grid",
    difficulty: "hard",
    lang: "python",
    added: "2026-10-06",
    tags: ["pivot", "loc", "Reshaping"],
    prompt:
      "Your league wants the quarterbacks side by side, week by week. Reshape weekly so each quarterback is a row and each week a column, then show weeks 1 to 4.",
    returns: "Print the pivoted DataFrame: one row per QB (A–Z), columns for weeks 1–4, points as values.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# pivot the QBs: rows = player, columns = week\n",
    expected: 'qbs = weekly[weekly["position"] == "QB"]\nprint(qbs.pivot(index="player", columns="week", values="points").loc[:, 1:4])',
    hint: "pivot(index=..., columns=..., values=...) turns long rows into a grid. Then .loc[:, 1:4] keeps weeks 1 to 4 (label slices include both ends).",
    explain:
      "Long to wide is the reshape every chart and every spreadsheet person asks for. A week a player missed would come back as NaN, which is honest: no game isn't zero points.",
    art: "qb-grid",
  },
  {
    id: "py-steady-hands",
    players: ["Patrick Mahomes", "Sam LaPorta", "Lamar Jackson"],
    title: "Steady Hands",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["groupby", "std", "Filtering"],
    prompt:
      "Some players score about the same every week. Among players with at least 12 games, find the three with the smallest standard deviation of weekly points.",
    returns: "A dict of player to standard deviation, rounded to one decimal, smallest first.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# smallest spread of weekly points, 12+ games\n",
    expected: 'g = weekly.groupby("player")["points"]\nsd = g.std()[g.size() >= 12].round(1).sort_values()\nprint(sd.head(3).to_dict())',
    hint: "One groupby gives you both: .std() for the spread and .size() for the games. Use the second as a mask on the first.",
    explain:
      "Standard deviation measures how far a typical week lands from the player's own average. Low isn't the same as good, though: a steady 15 loses to a streaky 22 most Sundays.",
    art: "steady-hands",
  },
  {
    id: "py-bust-solid-boom",
    title: "Bust, Solid, Boom (pandas)",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["pd.cut", "value_counts", "Binning"],
    prompt:
      "Sort every game in weekly into three buckets: a bust is under 10 points, solid is 10 up to 20, and a boom is 20 or more. Count each bucket.",
    returns: "A dict of label to count, most common first, e.g. {'solid': 0, ...}.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# pd.cut into bust / solid / boom, then count\n",
    expected: 'labels = pd.cut(weekly["points"], bins=[0, 10, 20, float("inf")], right=False, labels=["bust", "solid", "boom"])\nprint(labels.value_counts().to_dict())',
    hint: "pd.cut takes the edges in bins=. right=False makes each bucket include its left edge, so exactly 20 counts as a boom.",
    explain:
      "pd.cut is CASE WHEN for numbers. The right=False detail matters: by default the edges belong to the bucket below, and a 20-point game would quietly land in 'solid'.",
    art: "buckets",
  },
  {
    id: "py-where-was-aj",
    players: ["A.J. Brown"],
    title: "Where Was A.J.?",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["set", "Missing rows"],
    prompt:
      "A.J. Brown missed time in 2024. A missed game isn't a zero in weekly, it's a row that isn't there. Find the weeks from 1 to 18 he has no row for.",
    returns: "A sorted list of week numbers.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# which weeks 1-18 have no row for A.J. Brown?\n",
    expected: 'played = set(weekly.loc[weekly["player"] == "A.J. Brown", "week"])\nprint(sorted(set(range(1, 19)) - played))',
    hint: "Make a set of the weeks he played and a set of every week, range(1, 19). Subtracting sets leaves what's missing.",
    explain:
      "You can't filter for rows that don't exist, so you build what should be there and take away what is. The table can't tell you why a week is empty: a bye, an injury and a rest day all look the same.",
    art: "where-was",
  },
  {
    id: "py-race-to-200",
    players: ["Josh Allen"],
    title: "Race to 200",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["cumsum", "sort_values", "Running total"],
    prompt:
      "Follow Josh Allen's 2024 season as a running total. In which week did it first reach 200 points?",
    returns: "One number: the week.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# Josh Allen's running total; first week at 200+\n",
    expected: 'allen = weekly[weekly["player"] == "Josh Allen"].sort_values("week").copy()\nallen["total"] = allen["points"].cumsum()\nprint(allen.loc[allen["total"] >= 200, "week"].iloc[0])',
    hint: "Sort by week, then cumsum() the points. Filter to totals of 200 or more and take the first week with .iloc[0].",
    explain:
      "cumsum() is SUM() OVER (ORDER BY week) in one word, and it has the same catch: it adds in whatever order the rows are in. Sort first.",
    art: "race-to-200",
  },
  {
    id: "py-best-at-each-spot",
    title: "Best at Each Spot",
    difficulty: "medium",
    lang: "python",
    added: "2026-10-06",
    tags: ["groupby", "idxmax", "loc"],
    prompt:
      "Using df, the season totals, find the top scorer at each position.",
    returns: "A dict of position to player name, positions A–Z.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# top scorer per position, from df\n",
    expected: 'best = df.loc[df.groupby("position")["points"].idxmax()]\nprint(best.set_index("position")["player"].to_dict())',
    hint: "groupby('position')['points'].idxmax() gives the row label of each position's best. Hand those labels to df.loc.",
    explain:
      "groupby + idxmax is the pandas answer to 'the top row in each group'. In SQL it takes a window function; here it's one line, because idxmax hands back the row instead of the number.",
    art: "four-spots",
  },
  {
    id: "py-same-last-name",
    players: ["A.J. Brown", "Amon-Ra St. Brown"],
    title: "Same Last Name",
    difficulty: "easy",
    lang: "python",
    added: "2026-10-06",
    tags: ["str", "duplicated", "Strings"],
    prompt:
      "Your league's draft board goes by last names, and two cards got mixed up. Find every last name shared by more than one player in df.",
    returns: "A list of last names.",
    tables: [],
    setup: PY_WEEKLY_SETUP,
    starter: "# last names that appear more than once\n",
    expected: 'last = df["player"].str.split().str[-1]\nprint(last[last.duplicated(keep=False)].unique().tolist())',
    hint: '.str.split() splits each name on spaces, and .str[-1] takes the last piece. duplicated(keep=False) marks every repeat, not just the second.',
    explain:
      "The .str accessor runs a string method on every row at once. It's also why joining on names is risky: two different people can share one.",
    art: "name-tags",
  },

  // ── R ─────────────────────────────────────────────────────────
  //
  // Deliberately short. There is no supported Node build of WebR, so the
  // verifier cannot execute these keys the way it does the SQL and Python
  // ones — which means every R question here has to be simple enough to be
  // obviously right on reading.
  {
    id: "r-top-scorer",
    players: ["Lamar Jackson"],
    title: "Name the Leader (R)",
    difficulty: "easy",
    lang: "r",
    tags: ["Indexing", "which.max"],
    prompt:
      "The same 2024 season, this time as a data frame called df. Print the name of the player who scored the most total points.",
    returns: "One line: the player's name.",
    tables: [],
    setup: R_SETUP,
    starter: "# df is loaded. Columns: player, position, team, games, points, best\n",
    expected: 'print(df$player[which.max(df$points)])',
    hint: "which.max() gives you the position of the largest value, and you can index a column with it.",
    explain:
      "max() gives the value, which.max() gives where it is. Same distinction as pandas' max and idxmax.",
    art: "foam-finger",
  },
  {
    id: "r-filter-arrange",
    title: "Receivers Only",
    difficulty: "easy",
    lang: "r",
    tags: ["dplyr", "filter", "arrange"],
    prompt:
      "Print every wide receiver who scored 250 or more points, highest first, showing just the name and the points.",
    returns: "The filtered data frame, printed, with player and points only.",
    tables: [],
    setup: R_SETUP,
    starter: "# dplyr is loaded\n",
    expected:
      'df %>%\n  filter(position == "WR", points >= 250) %>%\n  arrange(desc(points)) %>%\n  select(player, points) %>%\n  print()',
    hint: "filter() takes several conditions separated by commas, and they are ANDed together.",
    explain:
      "The pipe reads as a sentence: take the data, keep these rows, sort them, keep these columns. That readability is most of why dplyr won.",
    art: "receiver",
  },
  {
    id: "r-group-summarise",
    title: "Group and Summarise",
    difficulty: "medium",
    lang: "r",
    tags: ["dplyr", "group_by", "summarise"],
    prompt:
      "Print the number of players and their average total points for each position, rounded to one decimal, best average first.",
    returns:
      "A data frame with position, n and avg_points, sorted by avg_points descending.",
    tables: [],
    setup: R_SETUP,
    starter: "# group, summarise, arrange\n",
    expected:
      'df %>%\n  group_by(position) %>%\n  summarise(n = n(), avg_points = round(mean(points), 1)) %>%\n  arrange(desc(avg_points)) %>%\n  as.data.frame() %>%\n  print()',
    hint: "n() counts the rows in each group and does not take an argument.",
    explain:
      "group_by() does nothing on its own — it tags the frame, and summarise() is what collapses it. Forgetting the second half is the most common dplyr mistake there is.",
    art: "huddle",
  },
  // ── R, the long table (added 2026-10-05) ──────────────────────
  //
  // Still no Node build of WebR for the verifier, so each of these keys was
  // run in R 4.4 with dplyr 1.2 before it shipped (scratch script, output
  // checked by eye, no ties at a cutoff). They load `weekly` too
  // (R_WEEKLY_SETUP). Keep new ones short enough to be obviously right.
  {
    id: "r-position-count",
    title: "Position Count",
    difficulty: "easy",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "count"],
    prompt:
      "Before you analyse a new data frame, see what's in it. Count how many players in df play each position.",
    returns: "The data frame count() gives you: position and n, positions A–Z.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# df (season totals) and weekly (one row per game) are loaded\n",
    expected: "df %>% count(position) %>% print()",
    hint: "count(column) is group_by(column) plus summarise(n = n()) in one step.",
    explain:
      "count() is the first thing to run on any category column. It's also the fastest way to spot a typo: a stray 'Wr' shows up as its own row.",
    art: "tally-marks",
  },
  {
    id: "r-rate-not-total",
    players: ["Lamar Jackson", "Ja'Marr Chase"],
    title: "Rate, Not Total",
    difficulty: "medium",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "mutate", "arrange", "pull"],
    prompt:
      "Season totals reward whoever stayed healthy. Add points per game to df and print the five best players by it.",
    returns: "A character vector of five names, best points per game first.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# mutate a ppg column, arrange, take five names\n",
    expected:
      "df %>%\n  mutate(ppg = points / games) %>%\n  arrange(desc(ppg)) %>%\n  head(5) %>%\n  pull(player) %>%\n  print()",
    hint: "mutate() adds the column, arrange(desc(ppg)) sorts it, and pull(player) turns the column into a plain vector.",
    explain:
      "pull() is the step people forget. Without it you print a one-column data frame, which is a different output from a vector of names.",
    art: "per-game",
  },
  {
    id: "r-single-game-high",
    players: ["Ja'Marr Chase"],
    title: "Single-Game High",
    difficulty: "easy",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "slice_max"],
    prompt:
      "weekly has one row per game of 2024. Print the row with the biggest single game.",
    returns: "The whole row: player, position, team, week, points.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# the biggest row in weekly\n",
    expected: "weekly %>% slice_max(points, n = 1) %>% print()",
    hint: "slice_max(column, n = 1) keeps the row with the largest value.",
    explain:
      "slice_max keeps whole rows, which is usually what you want: the number alone doesn't tell you who or when.",
    art: "tall-bar",
  },
  {
    id: "r-steady-or-streaky",
    players: ["Patrick Mahomes", "Sam LaPorta", "Lamar Jackson"],
    title: "Steady or Streaky",
    difficulty: "hard",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "group_by", "filter", "sd"],
    prompt:
      "Among players with at least 12 games in weekly, find the three whose weekly points varied least.",
    returns: "A data frame with player and sd (rounded to one decimal), smallest sd first, three rows.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# group, keep 12+ games, summarise sd, take three\n",
    expected:
      "weekly %>%\n  group_by(player) %>%\n  filter(n() >= 12) %>%\n  summarise(sd = round(sd(points), 1)) %>%\n  arrange(sd) %>%\n  head(3) %>%\n  as.data.frame() %>%\n  print()",
    hint: "A filter() after group_by() works per group, so filter(n() >= 12) keeps the players with enough games.",
    explain:
      "A grouped filter is dplyr's HAVING: it keeps or drops whole groups. as.data.frame() before print() keeps the output plain, since tibbles print with extra decoration.",
    art: "steady-streaky",
  },
  {
    id: "r-label-every-game",
    title: "Label Every Game",
    difficulty: "medium",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "case_when", "count"],
    prompt:
      "Label every game in weekly: boom for 20 points or more, solid for 10 up to 20, bust for anything under 10. Count each label.",
    returns: "The data frame count() gives you: label and n, labels A–Z.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# case_when inside mutate, then count\n",
    expected:
      'weekly %>%\n  mutate(label = case_when(points >= 20 ~ "boom", points >= 10 ~ "solid", TRUE ~ "bust")) %>%\n  count(label) %>%\n  print()',
    hint: "case_when checks its conditions in order and stops at the first true one, so put the highest bar first.",
    explain:
      "Order is the whole trick: a 25-point game also clears 10, and case_when gives it the first label it matches. TRUE at the end is the 'everything else'.",
    art: "game-tags",
  },
  {
    id: "r-first-to-300",
    players: ["Lamar Jackson"],
    title: "First to 300",
    difficulty: "hard",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "cumsum", "Running total"],
    prompt:
      "Follow Lamar Jackson's 2024 as a running total. In which week did it first reach 300 points?",
    returns: "One number: the week.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# Lamar's running total; first week at 300+\n",
    expected:
      'weekly %>%\n  filter(player == "Lamar Jackson") %>%\n  arrange(week) %>%\n  mutate(total = cumsum(points)) %>%\n  filter(total >= 300) %>%\n  head(1) %>%\n  pull(week) %>%\n  print()',
    hint: "arrange(week) before cumsum(): a running total adds in row order. Then keep the rows at 300 or more and take the first.",
    explain:
      "weekly is ordered by week and then by points, so within one player it happens to be in week order already. Sorting anyway is the habit that saves you on the table that isn't.",
    art: "stacked-blocks",
  },
  {
    id: "r-biggest-jump",
    players: ["Ja'Marr Chase"],
    title: "Biggest Jump",
    difficulty: "hard",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "lag", "group_by"],
    prompt:
      "Find the three biggest jumps in weekly: a player's points in one game minus his points in the game before it.",
    returns: "A data frame with player, week and jump, biggest jump first, three rows.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# lag() within each player, in week order\n",
    expected:
      "weekly %>%\n  group_by(player) %>%\n  arrange(week, .by_group = TRUE) %>%\n  mutate(jump = points - lag(points)) %>%\n  ungroup() %>%\n  slice_max(jump, n = 3) %>%\n  select(player, week, jump) %>%\n  as.data.frame() %>%\n  print()",
    hint: "group_by(player), arrange(week, .by_group = TRUE), then lag(points) is the previous game's points for the same player.",
    explain:
      "Without group_by, lag() would compare one player's game with a different player's row. ungroup() before slice_max matters too: grouped, it would keep the top three for every player.",
    art: "leap",
  },
  {
    id: "r-team-totals",
    title: "Team Totals",
    difficulty: "medium",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "group_by", "summarise"],
    prompt:
      "Which NFL teams got the most fantasy points out of the players in weekly? Use the team on each game's row.",
    returns: "A data frame with team and total (rounded to one decimal), biggest first, three rows.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# total points by team, top three\n",
    expected:
      "weekly %>%\n  group_by(team) %>%\n  summarise(total = round(sum(points), 1)) %>%\n  arrange(desc(total)) %>%\n  head(3) %>%\n  as.data.frame() %>%\n  print()",
    hint: "group_by(team), then summarise(total = sum(points)). Round inside summarise, sort, keep three.",
    explain:
      "A player who changed teams adds to both, because each row carries the team he played for that week. Grouping by the season-end team would give a different answer.",
    art: "pennants",
  },
  {
    id: "r-above-his-average",
    players: ["Bijan Robinson"],
    title: "Above His Average",
    difficulty: "hard",
    lang: "r",
    added: "2026-10-06",
    tags: ["dplyr", "left_join", "summarise"],
    prompt:
      "How often does a player beat his own season average? Join each game in weekly to the player's points per game from df, and count the games above it.",
    returns: "A data frame with player and beat, most first, ties by player A–Z, three rows.",
    tables: [],
    setup: R_WEEKLY_SETUP,
    starter: "# join df's points per game onto weekly, then count games above it\n",
    expected:
      'weekly %>%\n  left_join(df %>% transmute(player, ppg = points / games), by = "player") %>%\n  group_by(player) %>%\n  summarise(beat = sum(points > ppg)) %>%\n  arrange(desc(beat), player) %>%\n  head(3) %>%\n  as.data.frame() %>%\n  print()',
    hint: "transmute(player, ppg = points / games) makes a two-column lookup. left_join it on player, then sum(points > ppg) counts the TRUEs.",
    explain:
      "sum() of a logical vector counts its TRUEs, the R version of SUM(condition) in SQL. Beating your own average about half the time is normal; the interesting players are the ones far from half.",
    art: "above-line",
  },

  // ── Excel ─────────────────────────────────────────────────────
  //
  // Graded on the value the formula produces, not on the text, so any
  // correct spelling passes. A formula that references no cell is rejected
  // even when the number is right — reading the answer off the grid is not
  // the skill.
  {
    id: "xl-best-season",
    title: "Highest on the Sheet",
    difficulty: "easy",
    lang: "excel",
    tags: ["MAX", "Ranges"],
    prompt:
      "The Roster sheet has one row per player, with season points in column E. Return the highest points total on the sheet.",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: "=MAX(E2:E17)",
    hint: "Give MAX the range of the points column, not the whole column.",
    explain:
      "A range is two corners with a colon between them. Getting the last row wrong is how a formula quietly stops seeing your newest data.",
    art: "peak",
  },
  {
    id: "xl-count-receivers",
    title: "How Many Receivers",
    difficulty: "easy",
    lang: "excel",
    tags: ["COUNTIFS", "Criteria"],
    prompt:
      "Position is in column C. Count how many players on the Roster sheet are wide receivers.",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=COUNTIFS(C2:C17,"WR")',
    hint: "COUNTIFS takes a range and then what to match in it.",
    explain:
      'The criteria goes in quotes because it is text. Excel will not tell you off for leaving them out — it will just return 0, which looks like an answer.',
    art: "receiver",
  },
  {
    id: "xl-owner-total",
    players: ["Lamar Jackson", "Jahmyr Gibbs", "Derrick Henry"],
    title: "One Manager's Haul",
    difficulty: "medium",
    lang: "excel",
    tags: ["SUMIFS", "Conditional totals"],
    prompt:
      "Owner is in column G and points are in column E. Total up every point Jordan's players scored.",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=SUMIFS(E2:E17,G2:G17,"Jordan")',
    hint: "SUMIFS puts the range you are adding up first, then the range you are testing, then the test.",
    explain:
      "SUMIF and SUMIFS take their arguments in opposite orders, which is the single most reliable way to waste ten minutes in a spreadsheet. SUMIFS first, always.",
    art: "money-bag",
  },
  {
    id: "xl-lookup-team",
    players: ["Davante Adams"],
    title: "Look Somebody Up",
    difficulty: "medium",
    lang: "excel",
    tags: ["XLOOKUP", "Lookup"],
    prompt:
      "Player names are in column A and NFL teams in column B. Return the team Davante Adams played for.",
    returns: "A three-letter team code.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=XLOOKUP("Davante Adams",A2:A17,B2:B17)',
    hint: "XLOOKUP takes what you are looking for, where to look for it, and what to bring back.",
    explain:
      "XLOOKUP replaced VLOOKUP because you say what to search and what to return, rather than counting columns — inserting a column no longer breaks it. NYJ, by the way: this sheet is the 2024 season, and he was not on the Raiders for most of it.",
    art: "binoculars",
  },
  {
    id: "xl-per-game-average",
    title: "Average Per Game",
    difficulty: "medium",
    lang: "excel",
    tags: ["AVERAGEIFS", "ROUND"],
    prompt:
      "Games are in column D and points in column E. Find the average points per season for quarterbacks only (position in column C), rounded to one decimal.",
    returns: "A single number to one decimal place.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=ROUND(AVERAGEIFS(E2:E17,C2:C17,"QB"),1)',
    hint: "AVERAGEIFS has the same argument order as SUMIFS. Wrap the whole thing in ROUND.",
    explain:
      "Rounding on the outside, not the inside. Round each value first and you get the average of rounded numbers, which is not the same thing and quietly drifts.",
    art: "scale",
  },
  {
    id: "xl-who-scored-most",
    players: ["Lamar Jackson"],
    title: "Who, Not How Much",
    difficulty: "hard",
    lang: "excel",
    tags: ["INDEX", "MATCH", "MAX"],
    prompt:
      "MAX tells you the biggest number. Return the name of the player it belongs to — names in column A, points in column E.",
    returns: "A player's name.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: "=INDEX(A2:A17,MATCH(MAX(E2:E17),E2:E17,0))",
    hint: "MATCH finds which position a value sits at. INDEX pulls the value at that position out of another range.",
    explain:
      "INDEX and MATCH split the job in two: find where, then fetch what. It is the same move as pandas' idxmax and SQL's 'match back against the group maximum' — every tool has this problem and this shape of answer.",
    art: "spotlight",
  },
  {
    id: "xl-clean-the-import",
    title: "Clean the Export",
    difficulty: "hard",
    lang: "excel",
    tags: ["TRIM", "VALUE", "Dirty data"],
    prompt:
      "The Import sheet is the same league as a bad export: names padded with spaces in column A and points stored as text in column B. Return the total of the points column as an actual number.",
    returns: "A single number.",
    tables: [],
    sheet: "Import",
    starter: "=",
    expected:
      "=VALUE(TRIM(B2))+VALUE(TRIM(B3))+VALUE(TRIM(B4))+VALUE(TRIM(B5))+VALUE(TRIM(B7))",
    hint: "SUM ignores text entirely, so it returns 0 here. Convert each value, and notice that one row is blank.",
    explain:
      "SUM over text returns 0 rather than an error, which is the dangerous part — nothing goes red, the number is just wrong. Row 6 is empty too, and VALUE on a blank is an error, so it has to be left out.",
    art: "broom",
  },
  // ── Excel, with the Weeks sheet (added 2026-10-05) ────────────
  //
  // Weeks is the Roster's players by week, W1–W18 in columns B–S, blank
  // where there was no game (lib/question-frames.generated.ts). Row 2 is the
  // same player on both tabs.
  {
    id: "xl-add-it-up",
    title: "Add It Up",
    difficulty: "easy",
    lang: "excel",
    added: "2026-10-06",
    tags: ["SUM", "Ranges"],
    prompt:
      "The Roster sheet has season points in column E, rows 2 to 17. What did the whole sheet score between them?",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: "=SUM(E2:E17)",
    hint: "SUM takes a range: the first cell, a colon, the last cell.",
    explain:
      "E2:E17 is every player and not the header. Start at E1 and SUM quietly skips the word 'Points', which works here and hides the mistake until a header turns out to be a number.",
    art: "adding-machine",
  },
  {
    id: "xl-middle-of-the-pack",
    title: "Middle of the Pack",
    difficulty: "easy",
    lang: "excel",
    added: "2026-10-06",
    tags: ["MEDIAN", "Averages"],
    prompt:
      "One huge season drags an average up. Find the middle value of the points column instead (column E, rows 2 to 17).",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: "=MEDIAN(E2:E17)",
    hint: "MEDIAN sorts the values and takes the middle one, or the average of the middle two when there's an even count.",
    explain:
      "With sixteen players there's no single middle, so MEDIAN averages the 8th and 9th. Compare it with AVERAGE on the same range: when the two disagree, a few big numbers are doing the pulling.",
    art: "middle-ball",
  },
  {
    id: "xl-elite-or-not",
    players: ["Jahmyr Gibbs"],
    title: "Elite or Not",
    difficulty: "easy",
    lang: "excel",
    added: "2026-10-06",
    tags: ["IF", "Logic"],
    prompt:
      "Your league calls a 350-point season elite. Jahmyr Gibbs is in row 5 of the Roster sheet, points in column E. Return Elite if he cleared 350, or Starter if he didn't.",
    returns: "The word Elite or Starter.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=IF(E5>=350,"Elite","Starter")',
    hint: "IF takes a test, what to return when it's true, and what to return when it's false. Text goes in quotes.",
    explain:
      ">= includes exactly 350; > would not. Fill a formula like this down a column and every row gets its own label, which is the spreadsheet version of CASE WHEN.",
    art: "stamp",
  },
  {
    id: "xl-silver-medal",
    players: ["Ja'Marr Chase"],
    title: "Silver Medal",
    difficulty: "medium",
    lang: "excel",
    added: "2026-10-06",
    tags: ["LARGE", "Top-N"],
    prompt:
      "MAX gives you the top season on the Roster sheet. Return the second-highest points total instead (column E).",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: "=LARGE(E2:E17,2)",
    hint: "LARGE(range, k) returns the k-th biggest value. MAX is LARGE with k = 1.",
    explain:
      "LARGE and SMALL turn 'top N' into a formula you can fill down: LARGE(range, 1), LARGE(range, 2), LARGE(range, 3) and you have a podium.",
    art: "silver-medal",
  },
  {
    id: "xl-rileys-backfield",
    players: ["Saquon Barkley"],
    title: "Riley's Backfield",
    difficulty: "medium",
    lang: "excel",
    added: "2026-10-06",
    tags: ["SUMIFS", "Multiple criteria"],
    prompt:
      "Owner is in column G, position in column C and points in column E. Total the points Riley got from running backs.",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=SUMIFS(E2:E17,G2:G17,"Riley",C2:C17,"RB")',
    hint: "SUMIFS takes the range to add first, then as many range-and-test pairs as you like. Every pair has to be true.",
    explain:
      "Each extra pair is another AND. It's the formula behind most league spreadsheets: points by owner, by position, by week.",
    art: "backfield",
  },
  {
    id: "xl-top-receiver",
    players: ["Ja'Marr Chase"],
    title: "Top Receiver",
    difficulty: "medium",
    lang: "excel",
    added: "2026-10-06",
    tags: ["MAXIFS", "Criteria"],
    prompt:
      "What's the highest points total among the wide receivers on the Roster sheet? Position is in column C, points in column E.",
    returns: "A single number.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=MAXIFS(E2:E17,C2:C17,"WR")',
    hint: "MAXIFS works like SUMIFS: the range to take the max of first, then range-and-test pairs.",
    explain:
      "MAXIFS and MINIFS replaced the old array-formula trick of MAX(IF(...)). Same argument order as SUMIFS, so once you know one you know all of them.",
    art: "crowned-receiver",
  },
  {
    id: "xl-where-he-ranks",
    players: ["Amon-Ra St. Brown"],
    title: "Where He Ranks",
    difficulty: "medium",
    lang: "excel",
    added: "2026-10-06",
    tags: ["RANK", "Ranking"],
    prompt:
      "Amon-Ra St. Brown is in row 10 of the Roster sheet. Where does his points total rank among everyone's in column E, highest first?",
    returns: "A single number: 1 is the top.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: "=RANK(E10,E2:E17)",
    hint: "RANK(value, range) counts from the top by default. A third argument of 1 would count from the bottom.",
    explain:
      "RANK gives tied values the same rank and then skips, like RANK() in SQL. In a sheet you'd usually lock the range with $ (E$2:E$17) so it stays put when you fill the formula down.",
    art: "rank-board",
  },
  {
    id: "xl-blanks-arent-zeros",
    players: ["Lamar Jackson"],
    title: "Blanks Aren't Zeros",
    difficulty: "medium",
    lang: "excel",
    added: "2026-10-06",
    tags: ["AVERAGE", "ROUND", "Blank cells"],
    prompt:
      "The Weeks sheet has each player's points by week in columns B to S, blank when he had no game. Lamar Jackson is row 2. Find his average per game played, rounded to one decimal.",
    returns: "A single number to one decimal place.",
    tables: [],
    sheet: "Weeks",
    starter: "=",
    expected: "=ROUND(AVERAGE(B2:S2),1)",
    hint: "AVERAGE skips blank cells, so it already divides by the games he played, not by 18.",
    explain:
      "That's the behaviour you want here, and the reason blanks must stay blank. Type a 0 into his bye week and his average drops, because now he 'played' a zero-point game.",
    art: "blank-cell",
  },
  {
    id: "xl-empty-weeks",
    players: ["Davante Adams"],
    title: "Empty Weeks",
    difficulty: "easy",
    lang: "excel",
    added: "2026-10-06",
    tags: ["COUNTBLANK", "Blank cells"],
    prompt:
      "On the Weeks sheet, Davante Adams is row 14, weeks in columns B to S. How many weeks did he have no game?",
    returns: "A single number.",
    tables: [],
    sheet: "Weeks",
    starter: "=",
    expected: "=COUNTBLANK(B14:S14)",
    hint: "COUNTBLANK counts the empty cells in a range.",
    explain:
      "A blank can be a bye, an injury or a benching. The sheet can tell you how many, not why, which is worth remembering before you call anyone injury-prone.",
    art: "empty-weeks",
  },
  {
    id: "xl-twenty-point-weeks",
    players: ["Ja'Marr Chase"],
    title: "Twenty-Point Weeks",
    difficulty: "easy",
    lang: "excel",
    added: "2026-10-06",
    tags: ["COUNTIF", "Criteria"],
    prompt:
      "On the Weeks sheet, Ja'Marr Chase is row 3, weeks in columns B to S. Count the weeks he scored 20 or more.",
    returns: "A single number.",
    tables: [],
    sheet: "Weeks",
    starter: "=",
    expected: '=COUNTIF(B3:S3,">=20")',
    hint: 'COUNTIF takes a range and a test. A comparison goes in quotes: ">=20".',
    explain:
      "The test is text with the operator inside it, which looks odd until you need it: \">=\"&C1 builds it from a cell, so the threshold can live on the sheet instead of in the formula.",
    art: "twenty-cells",
  },
  {
    id: "xl-crosshairs",
    players: ["Saquon Barkley"],
    title: "Crosshairs",
    difficulty: "hard",
    lang: "excel",
    added: "2026-10-06",
    tags: ["INDEX", "MATCH", "Two-way lookup"],
    prompt:
      "On the Weeks sheet, names are in column A and the week headers (W1 to W18) in row 1. Return Saquon Barkley's points in week 10 with a formula that would still work if the rows were in a different order.",
    returns: "A single number.",
    tables: [],
    sheet: "Weeks",
    starter: "=",
    expected: '=INDEX(B2:S17,MATCH("Saquon Barkley",A2:A17,0),MATCH("W10",B1:S1,0))',
    hint: "INDEX(grid, row, column). One MATCH finds his row in column A, another finds W10's column in row 1.",
    explain:
      "Two MATCHes aim INDEX at one cell, like crosshairs. Nothing is counted by hand, so sorting the sheet or adding a week column doesn't break it.",
    art: "crosshairs",
  },
  {
    id: "xl-which-week",
    players: ["Lamar Jackson"],
    title: "Which Week?",
    difficulty: "hard",
    lang: "excel",
    added: "2026-10-06",
    tags: ["INDEX", "MATCH", "MAX"],
    prompt:
      "Lamar Jackson is row 2 of the Weeks sheet, with week headers in row 1. Return the header of the week he scored his most points.",
    returns: "A week header, like W7.",
    tables: [],
    sheet: "Weeks",
    starter: "=",
    expected: "=INDEX(B1:S1,MATCH(MAX(B2:S2),B2:S2,0))",
    hint: "MAX finds his best score, MATCH finds which column it's in, and INDEX reads the header from that same column.",
    explain:
      "The 'who, not how much' pattern again, turned sideways. MATCH returns the first hit, so if he'd tied his best week you'd get the earlier one.",
    art: "which-week",
  },
  {
    id: "xl-not-on-the-sheet",
    players: ["Puka Nacua"],
    title: "Not on the Sheet",
    difficulty: "medium",
    lang: "excel",
    added: "2026-10-06",
    tags: ["XLOOKUP", "Errors"],
    prompt:
      "Look up Puka Nacua's points on the Roster sheet (names in column A, points in column E). He isn't on it, so return the text Not on the sheet instead of an error.",
    returns: "The text Not on the sheet.",
    tables: [],
    sheet: "Roster",
    starter: "=",
    expected: '=XLOOKUP("Puka Nacua",A2:A17,E2:E17,"Not on the sheet")',
    hint: "XLOOKUP's fourth argument is what to return when nothing matches. IFERROR around a lookup works too.",
    explain:
      "#N/A in a report reads as broken; a plain message reads as handled. The fourth argument is better than IFERROR here, because IFERROR would also hide a typo in the formula.",
    art: "not-on-sheet",
  },
  // ── Interview patterns (added 2026-10-02) ─────────────────────
  // Written to fill the patterns analyst screens test that the bank had
  // fewest of: dates, subqueries and CTEs, ranking within groups, and NULLs.
  // lib/interview-patterns.ts counts them; the verifier wants four of each.
  {
    id: "christmas-football",
    title: "Christmas Football",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Dates", "strftime", "GROUP BY"],
    prompt:
      "The league has started owning Christmas Day too, whatever day of the week it lands on. For each season, how many games were played on December 25th, and what day of the week was it?",
    returns: "season, weekday, games — one row per season, oldest first.",
    tables: ["games"],
    expected: `SELECT season, weekday, COUNT(*) AS games
FROM games
WHERE strftime('%m-%d', gameday) = '12-25'
GROUP BY season, weekday
ORDER BY season;`,
    orderMatters: true,
    hint: "strftime('%m-%d', gameday) turns a date into just its month and day, so you can compare it with '12-25'.",
    explain:
      "Matching on '%m-%d' ignores the year, which is exactly what a holiday needs. Grouping by season and weekday gives one row per Christmas.",
    art: "gift",
  },
  {
    id: "temperature-unknown",
    title: "Temperature Unknown",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["NULL", "GROUP BY", "COUNT"],
    prompt:
      "The temp column is blank for a lot of games. Before you average it, find out whether the blanks are random or mean something: for each roof type, count the games and how many have no temperature.",
    returns: "roof, games, missing_temp — most missing_temp first.",
    tables: ["games"],
    expected: `SELECT roof,
       COUNT(*) AS games,
       SUM(temp IS NULL) AS missing_temp
FROM games
GROUP BY roof
ORDER BY missing_temp DESC;`,
    orderMatters: true,
    hint: "COUNT(*) counts every row. SUM(temp IS NULL) counts the rows where temp is missing, because a true comparison is 1.",
    explain:
      "NULL isn't one thing. Indoors it means 'doesn't apply': nobody records the weather under a dome. Outdoors it means 'wasn't recorded'. Checking where the blanks live before you average a column is half of real data work.",
    art: "thermometer",
  },
  {
    id: "thanksgiving-triple-header",
    title: "Thanksgiving Triple-Header",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Dates", "strftime", "WHERE"],
    prompt:
      "Thanksgiving means three NFL games before dessert. It falls on the fourth Thursday of November, and the schedule has plenty of other November Thursdays to trip over. List every Thanksgiving game in the table.",
    returns: "season, gameday, home_team, away_team — by gameday, then home_team A–Z.",
    tables: ["games"],
    expected: `SELECT season, gameday, home_team, away_team
FROM games
WHERE strftime('%m', gameday) = '11'
  AND weekday = 'Thursday'
  AND CAST(strftime('%d', gameday) AS INTEGER) BETWEEN 22 AND 28
ORDER BY gameday, home_team;`,
    orderMatters: true,
    hint: "The fourth Thursday of a month always lands between the 22nd and the 28th. strftime('%d', gameday) gives you the day of the month.",
    explain:
      "Dates in SQLite are text shaped YYYY-MM-DD, and strftime pulls a piece out of them. 'Fourth Thursday' becomes two plain conditions: it's a Thursday, and the day of the month is 22 to 28.",
    art: "turkey",
  },
  {
    id: "fall-into-winter",
    title: "Fall Into Winter",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Dates", "strftime", "GROUP BY", "AVG"],
    prompt:
      "Does scoring change as the season goes from September sun to January cold? For 2024, take every game and work out the average combined score, both teams together, for each calendar month.",
    returns: "month (as '09', '10', …), games, avg_points rounded to 1 decimal — highest average first.",
    tables: ["games"],
    expected: `SELECT strftime('%m', gameday) AS month,
       COUNT(*) AS games,
       ROUND(AVG(home_score + away_score), 1) AS avg_points
FROM games
WHERE season = 2024
GROUP BY month
ORDER BY avg_points DESC;`,
    orderMatters: true,
    hint: "strftime('%m', gameday) gives the month as '09', '10' and so on. Group by it, and add the two scores together before you average.",
    explain:
      "You can group by something you compute, not just a column that exists. The 2024 season runs into January, which is why a 'season' and a calendar year are different things.",
    art: "leaf-snow",
  },
  {
    id: "above-the-line",
    title: "Above the Line",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Subquery", "CTE", "AVG"],
    prompt:
      "Your league says a player is only 'good' if he beats the average at his position. Using each player's 2024 points per game, find everyone whose PPG is higher than the average PPG of the players at his position.",
    returns: "player, position, ppg rounded to 1 decimal — by position A–Z, then ppg highest first.",
    tables: ["week_results"],
    expected: `WITH ppg AS (
  SELECT player, position, AVG(fantasy_pts) AS ppg
  FROM week_results
  WHERE season = 2024
  GROUP BY player, position
)
SELECT player, position, ROUND(ppg, 1) AS ppg
FROM ppg p
WHERE ppg > (SELECT AVG(ppg) FROM ppg x WHERE x.position = p.position)
ORDER BY position, ppg DESC;`,
    orderMatters: true,
    hint: "Work out each player's PPG first (a CTE is the tidy way). Then compare each row with a subquery that averages the PPGs at the same position.",
    explain:
      "This is an answer about an answer: you need every player's average before you can average them by position. The CTE names the first step so the second can read it, and the subquery works out the position average for each row.",
    art: "high-jump",
  },
  {
    id: "beating-yourself",
    title: "Beating Yourself",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CTE", "JOIN", "SUM"],
    prompt:
      "A consistency question: how often does a player beat his own average? For each player in 2024, count his games and how many of them scored more than his own 2024 average.",
    returns: "player, games, above_own_avg — most above_own_avg first, then player A–Z.",
    tables: ["week_results"],
    expected: `WITH avgs AS (
  SELECT player, AVG(fantasy_pts) AS avg_pts
  FROM week_results
  WHERE season = 2024
  GROUP BY player
)
SELECT w.player,
       COUNT(*) AS games,
       SUM(w.fantasy_pts > a.avg_pts) AS above_own_avg
FROM week_results w
JOIN avgs a ON a.player = w.player
WHERE w.season = 2024
GROUP BY w.player
ORDER BY above_own_avg DESC, w.player;`,
    orderMatters: true,
    hint: "A CTE of each player's 2024 average, joined back onto his weekly rows. Then count the rows where fantasy_pts is bigger than the average.",
    explain:
      "Joining an aggregate back onto the rows it came from is one of the most-used moves in analytics: every row gets to see its own group's number. In SQLite a comparison is 1 or 0, so SUM(condition) counts where it's true.",
    art: "mirror",
  },
  {
    id: "donut-week",
    players: ["Christian McCaffrey", "Saquon Barkley"],
    title: "Donut Week",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["LEFT JOIN", "COALESCE", "NULL"],
    prompt:
      "Your league's week 1 recap should list every rostered player and what he scored in week 1 of 2024. A player who didn't play still belongs on the list, with a zero next to his name.",
    returns: "team_name, player, week1_pts (0 if he didn't play) — highest week1_pts first, then player A–Z.",
    tables: ["rosters", "week_results"],
    expected: `SELECT r.team_name, r.player,
       COALESCE(w.fantasy_pts, 0) AS week1_pts
FROM rosters r
LEFT JOIN week_results w
  ON w.player = r.player AND w.season = 2024 AND w.week = 1
ORDER BY week1_pts DESC, r.player;`,
    orderMatters: true,
    hint: "A LEFT JOIN from rosters keeps every rostered player. COALESCE(x, 0) turns the NULL from a missing game into a 0.",
    explain:
      "LEFT JOIN keeps the row and fills the gap with NULL; COALESCE swaps the NULL for a value you choose. Put the season and week conditions in the ON clause: in WHERE they would throw the NULL rows away again — the classic LEFT JOIN trap.",
    art: "donut",
  },
  {
    id: "have-you-seen-this-running-back",
    players: ["Christian McCaffrey"],
    title: "Have You Seen This Running Back?",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CTE", "LEFT JOIN", "NULL", "Anti-join"],
    prompt:
      "Christian McCaffrey's 2024 had more empty weeks than full ones. List every week of the 2024 season where he has no row in the table. The table has no row for a game a player missed, so you'll need a list of the weeks to compare against.",
    returns: "week — in order, one row per week he has no game.",
    tables: ["week_results"],
    expected: `SELECT wk.week
FROM (SELECT DISTINCT week FROM week_results WHERE season = 2024) wk
LEFT JOIN week_results w
  ON w.week = wk.week
 AND w.season = 2024
 AND w.player = 'Christian McCaffrey'
WHERE w.player IS NULL
ORDER BY wk.week;`,
    orderMatters: true,
    hint: "Build the list of 2024 weeks (SELECT DISTINCT week …), LEFT JOIN his rows onto it, and keep the weeks where nothing matched: IS NULL.",
    explain:
      "You can't find missing rows by looking at rows that exist. Make the full list of what should be there, LEFT JOIN what is there, and the NULLs are the gaps. It's the same move as finding customers with no orders.",
    art: "milk-carton",
  },
  {
    id: "short-week",
    title: "Short Week",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Dates", "julianday", "LAG", "CTE"],
    prompt:
      "Sunday then Thursday is the shortest rest in football: four days. In 2024, which teams played on four days' rest or less at least twice? Every game has a home team and an away team, so a team's schedule is spread across two columns.",
    returns: "team, short_weeks — most short weeks first, then team A–Z.",
    tables: ["games"],
    expected: `WITH team_games AS (
  SELECT home_team AS team, gameday FROM games WHERE season = 2024
  UNION ALL
  SELECT away_team AS team, gameday FROM games WHERE season = 2024
),
rest AS (
  SELECT team,
         julianday(gameday) - julianday(LAG(gameday) OVER (PARTITION BY team ORDER BY gameday)) AS days
  FROM team_games
)
SELECT team, COUNT(*) AS short_weeks
FROM rest
WHERE days <= 4
GROUP BY team
HAVING COUNT(*) >= 2
ORDER BY short_weeks DESC, team;`,
    orderMatters: true,
    hint: "Stack home and away into one column with UNION ALL. Then LAG(gameday) over each team's games gives the game before, and julianday() turns dates into numbers you can subtract.",
    explain:
      "Two moves analysts use constantly: UNION ALL to turn two columns into one, and LAG to compare each row with the one before it. julianday makes the gap between dates a plain subtraction.",
    art: "hourglass",
  },
  {
    id: "second-fiddle",
    players: ["Derrick Henry", "Amon-Ra St. Brown", "Travis Kelce"],
    title: "Second Fiddle",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["ROW_NUMBER", "PARTITION BY", "CTE"],
    prompt:
      "Every team has a star. Who's the second-best? For each NFL team with at least two players in the table, find the player with the second-highest point total in 2024.",
    returns: "team, player, total_pts rounded to 1 decimal — by team A–Z.",
    tables: ["week_results"],
    expected: `WITH totals AS (
  SELECT team, player, SUM(fantasy_pts) AS total_pts
  FROM week_results
  WHERE season = 2024
  GROUP BY team, player
),
ranked AS (
  SELECT team, player, total_pts,
         ROW_NUMBER() OVER (PARTITION BY team ORDER BY total_pts DESC) AS rn
  FROM totals
)
SELECT team, player, ROUND(total_pts, 1) AS total_pts
FROM ranked
WHERE rn = 2
ORDER BY team;`,
    orderMatters: true,
    hint: "Total each player's 2024 points per team, number them within each team with ROW_NUMBER() OVER (PARTITION BY team ORDER BY the total DESC), and keep number 2.",
    explain:
      "ROW_NUMBER starts again at 1 in every partition, so 'the Nth best in each group' is one window and a WHERE. A team with only one player never gets a 2, so it drops out on its own.",
    art: "fiddle",
  },
  {
    id: "team-record-book",
    players: ["Ja'Marr Chase", "Josh Allen", "Saquon Barkley"],
    title: "Team Record Book",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["ROW_NUMBER", "PARTITION BY", "Top-N"],
    prompt:
      "For every team in the 2024 data, find the single best fantasy game anyone had while playing for it: who, which week, and the score.",
    returns: "team, player, week, fantasy_pts — best score first, then team A–Z.",
    tables: ["week_results"],
    expected: `WITH ranked AS (
  SELECT team, player, week, fantasy_pts,
         ROW_NUMBER() OVER (PARTITION BY team ORDER BY fantasy_pts DESC) AS rn
  FROM week_results
  WHERE season = 2024
)
SELECT team, player, week, fantasy_pts
FROM ranked
WHERE rn = 1
ORDER BY fantasy_pts DESC, team;`,
    orderMatters: true,
    hint: "ROW_NUMBER() OVER (PARTITION BY team ORDER BY fantasy_pts DESC) puts each team's best game at 1. Filter for 1 in an outer query: a window can't go in WHERE.",
    explain:
      "Top-1 per group is the most common window question in analyst screens. GROUP BY can give you the best score per team but not who scored it; a window keeps the whole row.",
    art: "record-book",
  },
  // ── Bank growth, batch 1 (added 2026-10-02) ───────────────────
  // Team results from `games`: records, margins, streaks, byes — the table
  // the bank had barely used, and the shape of most real analyst work.
  {
    id: "goose-egg",
    title: "Goose Egg",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["WHERE", "OR"],
    prompt: "A goose egg is a zero on the scoreboard. Find every game in the table where one team didn't score at all.",
    returns: "season, week, home_team, away_team, home_score, away_score — by season, then week, then home_team A–Z.",
    tables: ["games"],
    expected: `SELECT season, week, home_team, away_team, home_score, away_score
FROM games
WHERE home_score = 0 OR away_score = 0
ORDER BY season, week, home_team;`,
    orderMatters: true,
    hint: "Either side can be the one with zero, so the WHERE needs OR.",
    explain:
      "OR keeps a row when either condition is true. Two conditions on two different columns is the usual way to say 'either side'.",
    art: "goose",
  },
  {
    id: "tied-up",
    title: "Tied Up",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["WHERE", "Alias"],
    prompt: "Ties are rare in the NFL — overtime usually settles it. Find every game in the table that still ended level.",
    returns: "season, week, home_team, away_team, and the score both teams finished on as final_score — oldest first.",
    tables: ["games"],
    expected: `SELECT season, week, home_team, away_team, home_score AS final_score
FROM games
WHERE home_score = away_score
ORDER BY season, week;`,
    orderMatters: true,
    hint: "Compare the two score columns with each other. When they're equal, either one is the final score: rename it with AS.",
    explain:
      "A WHERE can compare two columns of the same row, not just a column and a value. AS renames a column in your result without touching the table.",
    art: "necktie",
  },
  {
    id: "photo-finish",
    title: "Photo Finish",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["ABS", "BETWEEN", "GROUP BY"],
    prompt: "A game decided by a field goal or less is a photo finish. For each season, count the games won by 1, 2 or 3 points.",
    returns: "season, close_games — oldest season first.",
    tables: ["games"],
    expected: `SELECT season, COUNT(*) AS close_games
FROM games
WHERE ABS(home_score - away_score) BETWEEN 1 AND 3
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "ABS(home_score - away_score) is the margin whoever won. BETWEEN 1 AND 3 keeps out ties, which are a margin of 0.",
    explain: "ABS turns 'who won by how much' into one number. BETWEEN includes both ends, so 1 and 3 both count.",
    art: "photo-finish",
  },
  {
    id: "season-opener",
    title: "Season Opener",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["MIN", "GROUP BY"],
    prompt: "When did each season kick off? Find the date of the first game of every season in the table.",
    returns: "season, opener (the earliest gameday) — oldest first.",
    tables: ["games"],
    expected: `SELECT season, MIN(gameday) AS opener
FROM games
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "MIN works on dates: text shaped YYYY-MM-DD sorts in date order.",
    explain:
      "MIN and MAX work on anything that sorts, not just numbers. Dates stored as YYYY-MM-DD sort correctly as plain text, which is why so many databases store them that way.",
    art: "can-opener",
  },
  {
    id: "the-j-team",
    title: "The J Team",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["LIKE", "DISTINCT"],
    prompt: "Your league is drafting an all-J lineup. List every player in the table whose name starts with J, once each.",
    returns: "player — A–Z.",
    tables: ["week_results"],
    expected: `SELECT DISTINCT player
FROM week_results
WHERE player LIKE 'J%'
ORDER BY player;`,
    orderMatters: true,
    hint: "LIKE 'J%' matches anything that starts with J. The % stands for any run of characters.",
    explain: "LIKE uses % for any run of characters and _ for exactly one. DISTINCT stops each name repeating once per game played.",
    art: "letter-j",
  },
  {
    id: "grass-is-greener",
    title: "Grass Is Greener",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["COUNT", "GROUP BY", "ORDER BY"],
    prompt: "Some players swear they're faster on turf. Before anyone argues, count the 2024 games played on each kind of surface.",
    returns: "surface, games — most games first, then surface A–Z.",
    tables: ["games"],
    expected: `SELECT surface, COUNT(*) AS games
FROM games
WHERE season = 2024
GROUP BY surface
ORDER BY games DESC, surface;`,
    orderMatters: true,
    hint: "GROUP BY surface, COUNT(*) in each group, then sort by the count. Two surfaces tie, so sort by name second.",
    explain:
      "Look at what comes back: 'unknown' is a value someone typed, not a NULL, so it gets counted like any other surface. Grouping is the quickest way to see how a column is really spelled.",
    art: "lawnmower",
  },
  {
    id: "home-sweet-home",
    title: "Home Sweet Home",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["SUM", "Conditional aggregation", "GROUP BY"],
    prompt: "Is home-field advantage real? For each season, count how many games the home team won and how many the away team won.",
    returns: "season, home_wins, away_wins — oldest first. Ties count for neither.",
    tables: ["games"],
    expected: `SELECT season,
       SUM(home_score > away_score) AS home_wins,
       SUM(away_score > home_score) AS away_wins
FROM games
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "In SQLite a comparison is 1 when it's true, so SUM(home_score > away_score) counts home wins.",
    explain:
      "Counting with SUM(condition) is conditional aggregation: several counts side by side from one pass over the table, instead of one query per count.",
    art: "house",
  },
  {
    id: "blowout",
    title: "Blowout",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CASE", "ABS", "LIMIT"],
    prompt: "Find the five most lopsided games of the 2024 season: who won, who lost, and by how much.",
    returns: "gameday, winner, loser, margin — biggest margin first, earliest gameday first when margins tie.",
    tables: ["games"],
    expected: `SELECT gameday,
       CASE WHEN home_score > away_score THEN home_team ELSE away_team END AS winner,
       CASE WHEN home_score > away_score THEN away_team ELSE home_team END AS loser,
       ABS(home_score - away_score) AS margin
FROM games
WHERE season = 2024
ORDER BY margin DESC, gameday
LIMIT 5;`,
    orderMatters: true,
    hint: "CASE WHEN home_score > away_score THEN home_team ELSE away_team END picks the winner. Flip it round for the loser.",
    explain:
      "The table stores home and away, not winner and loser. CASE relabels each row by what happened. And the tie-break isn't decoration: two games share a margin right at the cutoff, so without it the fifth row is a coin toss.",
    art: "party-blower",
  },
  {
    id: "fireworks-show",
    title: "Fireworks Show",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["WHERE", "ORDER BY", "Expression"],
    prompt: "Both offenses showed up. Find every 2024 game where both teams scored 30 or more.",
    returns: "week, home_team, away_team, home_score, away_score — most combined points first, then week.",
    tables: ["games"],
    expected: `SELECT week, home_team, away_team, home_score, away_score
FROM games
WHERE season = 2024 AND home_score >= 30 AND away_score >= 30
ORDER BY home_score + away_score DESC, week;`,
    orderMatters: true,
    hint: "Both scores need their own condition. You can ORDER BY a calculation — home_score + away_score — without selecting it.",
    explain: "ORDER BY isn't limited to columns you selected: it can sort by any expression over the row.",
    art: "fireworks",
  },
  {
    id: "road-warriors",
    title: "Road Warriors",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["GROUP BY", "HAVING"],
    prompt: "Winning away from home is the hard part. Which teams won at least six road games in 2024?",
    returns: "team, road_wins — most road wins first, then team A–Z.",
    tables: ["games"],
    expected: `SELECT away_team AS team, COUNT(*) AS road_wins
FROM games
WHERE season = 2024 AND away_score > home_score
GROUP BY away_team
HAVING COUNT(*) >= 6
ORDER BY road_wins DESC, team;`,
    orderMatters: true,
    hint: "A road win is a row where the away team outscored the home team. Group by away_team, then HAVING keeps teams with six or more.",
    explain:
      "WHERE filters rows before grouping (only road wins); HAVING filters groups after (only teams with enough of them). Most 'at least N' questions need both.",
    art: "road-sign",
  },
  {
    id: "snowball",
    players: ["Josh Allen"],
    title: "Snowball",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Running total", "Window", "SUM"],
    prompt: "Watch Josh Allen's 2024 season build. For each week he played, show his points and his running total so far.",
    returns: "week, fantasy_pts, running_total rounded to 1 decimal — in week order.",
    tables: ["week_results"],
    expected: `SELECT week, fantasy_pts,
       ROUND(SUM(fantasy_pts) OVER (ORDER BY week), 1) AS running_total
FROM week_results
WHERE player = 'Josh Allen' AND season = 2024
ORDER BY week;`,
    orderMatters: true,
    hint: "SUM(fantasy_pts) OVER (ORDER BY week) adds up every row up to and including the current one.",
    explain: "A window with ORDER BY becomes a running calculation: each row sees the rows before it. Unlike GROUP BY, every week keeps its own row.",
    art: "snowball",
  },
  {
    id: "bust-solid-boom",
    title: "Bust, Solid, Boom",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CASE", "Pivot", "Conditional aggregation"],
    prompt:
      "Sort every 2024 game into three buckets: a bust is under 10 points, solid is 10 up to 20, and a boom is 20 or more. Count each bucket for each position.",
    returns: "position, busts, solid, booms — positions A–Z.",
    tables: ["week_results"],
    expected: `SELECT position,
       SUM(fantasy_pts < 10) AS busts,
       SUM(fantasy_pts >= 10 AND fantasy_pts < 20) AS solid,
       SUM(fantasy_pts >= 20) AS booms
FROM week_results
WHERE season = 2024
GROUP BY position
ORDER BY position;`,
    orderMatters: true,
    hint: "One SUM per bucket, each with its own condition: SUM(fantasy_pts < 10) and so on.",
    explain: "Turning categories into columns like this is a pivot. Mind the edges: 10 is solid, not a bust, and 20 is a boom.",
    art: "buckets",
  },
  {
    id: "rematch",
    title: "Rematch",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CASE", "GROUP BY", "HAVING"],
    prompt: "Division rivals meet twice a season. Which teams did KC play twice in 2024?",
    returns: "opponent, games — opponents A–Z.",
    tables: ["games"],
    expected: `SELECT CASE WHEN home_team = 'KC' THEN away_team ELSE home_team END AS opponent,
       COUNT(*) AS games
FROM games
WHERE season = 2024 AND 'KC' IN (home_team, away_team)
GROUP BY opponent
HAVING COUNT(*) = 2
ORDER BY opponent;`,
    orderMatters: true,
    hint: "KC can be home or away. A CASE picks whichever team isn't KC; group by that and keep the counts of 2.",
    explain:
      "When what you care about can sit in either of two columns, CASE pulls it into one. 'KC' IN (home_team, away_team) is a tidy way to say 'on either side'.",
    art: "boxing-gloves",
  },
  {
    id: "home-cooking",
    title: "Home Cooking",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["JOIN", "CASE", "Pivot"],
    prompt:
      "Do players score more at home? For 2024, compare each player's points per game at home and on the road. Only count players with at least 10 games. week_results doesn't say who was at home — games does.",
    returns: "player, home_ppg, away_ppg (both rounded to 1 decimal) — biggest home advantage (home_ppg minus away_ppg) first, then player A–Z.",
    tables: ["week_results", "games"],
    expected: `SELECT w.player,
       ROUND(AVG(CASE WHEN g.home_team = w.team THEN w.fantasy_pts END), 1) AS home_ppg,
       ROUND(AVG(CASE WHEN g.away_team = w.team THEN w.fantasy_pts END), 1) AS away_ppg
FROM week_results w
JOIN games g
  ON g.season = w.season AND g.week = w.week AND w.team IN (g.home_team, g.away_team)
WHERE w.season = 2024
GROUP BY w.player
HAVING COUNT(*) >= 10
ORDER BY home_ppg - away_ppg DESC, w.player;`,
    orderMatters: true,
    hint: "Join each stat line to its game on season, week and team (the team is either the home or the away team). Then AVG(CASE WHEN home THEN points END) — AVG skips the NULLs the CASE leaves for away games.",
    explain:
      "AVG ignores NULL, so a CASE with no ELSE averages only the rows that match. That's how one GROUP BY gives you a home average and a road average side by side.",
    art: "chef-hat",
  },
  {
    id: "winning-streak",
    title: "Winning Streak",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Gaps and islands", "ROW_NUMBER", "CTE", "UNION ALL"],
    prompt:
      "Hot teams string wins together. For every team that won at least seven in a row during the 2024 season, find its longest winning streak.",
    returns: "team, longest_streak — longest first, then team A–Z.",
    tables: ["games"],
    expected: `WITH team_games AS (
  SELECT home_team AS team, gameday, home_score > away_score AS won FROM games WHERE season = 2024
  UNION ALL
  SELECT away_team, gameday, away_score > home_score FROM games WHERE season = 2024
),
grouped AS (
  SELECT team, won,
         ROW_NUMBER() OVER (PARTITION BY team ORDER BY gameday)
       - ROW_NUMBER() OVER (PARTITION BY team, won ORDER BY gameday) AS grp
  FROM team_games
),
streaks AS (
  SELECT team, COUNT(*) AS streak
  FROM grouped
  WHERE won = 1
  GROUP BY team, grp
)
SELECT team, MAX(streak) AS longest_streak
FROM streaks
GROUP BY team
HAVING MAX(streak) >= 7
ORDER BY longest_streak DESC, team;`,
    orderMatters: true,
    hint:
      "Put each team's games in one list with UNION ALL. Number all of a team's games, and separately number its wins: across a run of wins the difference between the two numbers stays the same. Group by that difference and count.",
    explain:
      "This is gaps and islands. The two ROW_NUMBERs drift apart by one at every loss, so the wins that share a difference belong to the same streak.",
    art: "train",
  },
  {
    id: "gone-fishing",
    title: "Gone Fishing",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CROSS JOIN", "Anti-join", "CTE"],
    prompt: "Every team gets one week off. Find each team's 2024 bye week: the week it has no game at all.",
    returns: "team, bye_week — by bye_week, then team A–Z.",
    tables: ["games"],
    expected: `WITH teams AS (SELECT DISTINCT home_team AS team FROM games WHERE season = 2024),
weeks AS (SELECT DISTINCT week FROM games WHERE season = 2024),
played AS (
  SELECT home_team AS team, week FROM games WHERE season = 2024
  UNION
  SELECT away_team, week FROM games WHERE season = 2024
)
SELECT t.team, w.week AS bye_week
FROM teams t
CROSS JOIN weeks w
LEFT JOIN played p ON p.team = t.team AND p.week = w.week
WHERE p.team IS NULL
ORDER BY bye_week, t.team;`,
    orderMatters: true,
    hint: "Build every team-week pair with a CROSS JOIN of teams and weeks, LEFT JOIN the games that happened, and keep the pairs where nothing matched.",
    explain:
      "To find what's missing, build everything that could exist, then take away what does. CROSS JOIN builds the grid; LEFT JOIN … IS NULL does the taking away.",
    art: "gone-fishing",
  },
  {
    id: "power-rankings",
    title: "Power Rankings",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["DENSE_RANK", "UNION ALL", "CTE"],
    prompt:
      "Point differential (points scored minus points allowed) is the stat-head's power ranking. Rank the 2024 teams by it, giving tied teams the same rank with no gap after them, and show the top ten.",
    returns: "team, point_diff, power_rank — by power_rank, then team A–Z. Ten rows.",
    tables: ["games"],
    expected: `WITH team_games AS (
  SELECT home_team AS team, home_score - away_score AS diff FROM games WHERE season = 2024
  UNION ALL
  SELECT away_team, away_score - home_score FROM games WHERE season = 2024
)
SELECT team, SUM(diff) AS point_diff,
       DENSE_RANK() OVER (ORDER BY SUM(diff) DESC) AS power_rank
FROM team_games
GROUP BY team
ORDER BY power_rank, team
LIMIT 10;`,
    orderMatters: true,
    hint: "Stack home and away into one list per team with UNION ALL, sum the differential, then DENSE_RANK() OVER (ORDER BY that sum DESC).",
    explain:
      "RANK skips a number after a tie (1, 2, 3, 3, 5); DENSE_RANK doesn't (1, 2, 3, 3, 4). Which you want depends on the question. Two teams tie at third here, so it shows.",
    art: "ladder",
  },
  {
    id: "high-five",
    title: "High Five",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Self-join", "JOIN"],
    prompt: "Two teammates both going off in the same week is a fantasy dream. Find every 2024 week where two players on the same NFL team both scored 20 or more.",
    returns: "week, team, player_a, player_b — player_a before player_b alphabetically; in week order, then team, then player_a, then player_b.",
    tables: ["week_results"],
    expected: `SELECT a.week, a.team, a.player AS player_a, b.player AS player_b
FROM week_results a
JOIN week_results b
  ON b.season = a.season AND b.week = a.week AND b.team = a.team AND a.player < b.player
WHERE a.season = 2024 AND a.fantasy_pts >= 20 AND b.fantasy_pts >= 20
ORDER BY a.week, a.team, a.player, b.player;`,
    orderMatters: true,
    hint: "Join week_results to itself on season, week and team. a.player < b.player keeps each pair once and stops a player pairing with himself.",
    explain:
      "A self-join compares rows of one table with each other. The < is the trick: = would pair everyone with themselves, and != would list every pair twice.",
    art: "high-five",
  },
  {
    id: "career-year",
    title: "Career Year",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["ROW_NUMBER", "PARTITION BY", "Top-N", "HAVING"],
    prompt: "Every player has a season he'd frame. For each player, find his best season by points per game, counting only seasons with at least 8 games.",
    returns: "player, season, ppg rounded to 1 decimal — best ppg first, then player A–Z.",
    tables: ["week_results"],
    expected: `WITH seasons AS (
  SELECT player, season, AVG(fantasy_pts) AS ppg
  FROM week_results
  GROUP BY player, season
  HAVING COUNT(*) >= 8
),
ranked AS (
  SELECT player, season, ppg,
         ROW_NUMBER() OVER (PARTITION BY player ORDER BY ppg DESC) AS rn
  FROM seasons
)
SELECT player, season, ROUND(ppg, 1) AS ppg
FROM ranked
WHERE rn = 1
ORDER BY ppg DESC, player;`,
    orderMatters: true,
    hint: "PPG per player per season with HAVING COUNT(*) >= 8, then ROW_NUMBER() OVER (PARTITION BY player ORDER BY ppg DESC), and keep 1.",
    explain: "The HAVING runs before the window, so short seasons never get to compete. Filter first, rank second, and a four-game hot streak can't be anyone's career year.",
    art: "framed-jersey",
  },
  {
    id: "milestone-game",
    title: "Milestone Game",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["ROW_NUMBER", "PARTITION BY", "CTE"],
    prompt: "Thirty points is a milestone. For each player, find the first game in the table where he reached 30.",
    returns: "player, season, week, fantasy_pts — earliest first (season, then week), then player A–Z.",
    tables: ["week_results"],
    expected: `WITH ranked AS (
  SELECT player, season, week, fantasy_pts,
         ROW_NUMBER() OVER (PARTITION BY player ORDER BY season, week) AS rn
  FROM week_results
  WHERE fantasy_pts >= 30
)
SELECT player, season, week, fantasy_pts
FROM ranked
WHERE rn = 1
ORDER BY season, week, player;`,
    orderMatters: true,
    hint: "Keep only the 30-point games, then ROW_NUMBER() OVER (PARTITION BY player ORDER BY season, week), and keep 1.",
    explain: "'First' needs an order that spans seasons: season, then week. Sorting by week alone would put a week-2 game from 2025 ahead of a week-9 game from 2022.",
    art: "milestone",
  },
  // ── Bank growth, batch 2 (added 2026-10-02) ───────────────────
  // The rest of the schema (temperature, surface, the waiver wire) and the
  // asks that turn up in analyst screens: a median, tiers, variance, a
  // uniqueness check, a window over a window.
  {
    id: "saturday-special",
    title: "Saturday Special",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["WHERE", "COUNT", "GROUP BY"],
    prompt: "Late in the season the NFL starts borrowing college football's Saturdays. Count the Saturday games in each season.",
    returns: "season, saturday_games — oldest first. Seasons with no Saturday games don't appear.",
    tables: ["games"],
    expected: `SELECT season, COUNT(*) AS saturday_games
FROM games
WHERE weekday = 'Saturday'
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "Filter to Saturday first, then group what's left by season.",
    explain: "WHERE runs before GROUP BY, so a season with no Saturday games has no rows left to group — it vanishes rather than showing a 0.",
    art: "sandwich-board",
  },
  {
    id: "cold-one",
    title: "Cold One",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["ORDER BY", "LIMIT", "NULL"],
    prompt: "Find the three coldest games in the table, by kickoff temperature.",
    returns: "gameday, home_team, away_team, temp — coldest first.",
    tables: ["games"],
    expected: `SELECT gameday, home_team, away_team, temp
FROM games
WHERE temp IS NOT NULL
ORDER BY temp, gameday
LIMIT 3;`,
    orderMatters: true,
    hint: "Indoor games have no temperature, and SQLite sorts NULL before every number. Keep them out with IS NOT NULL.",
    explain:
      "Sort a column with blanks in it and the blanks go first in SQLite. Without the IS NOT NULL your 'coldest games' would be three dome games with no temperature at all.",
    art: "ice-cube",
  },
  {
    id: "sliding-down",
    title: "Sliding Down",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["WHERE", "ORDER BY"],
    prompt: "The waiver wire shows who's rising and who's falling. Find the players whose rostered share went down.",
    returns: "player, team, pct_rostered, trend — biggest drop first, then player A–Z.",
    tables: ["waiver_wire"],
    expected: `SELECT player, team, pct_rostered, trend
FROM waiver_wire
WHERE trend < 0
ORDER BY trend, player;`,
    orderMatters: true,
    hint: "A falling player has a negative trend. The biggest drop is the most negative number, which sorts first in plain ascending order.",
    explain: "'Biggest drop first' is ascending order on a negative number. And the two fallers here moved by exactly the same amount, which is why the tie-break is in the question.",
    art: "slide",
  },
  {
    id: "roll-call",
    title: "Roll Call",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["COUNT DISTINCT", "GROUP BY"],
    prompt: "The twenty players in week_results get traded and signed around. How many different NFL teams do they cover in each season?",
    returns: "season, teams — oldest first.",
    tables: ["week_results"],
    expected: `SELECT season, COUNT(DISTINCT team) AS teams
FROM week_results
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "COUNT(DISTINCT team) counts each team once, however many rows it has.",
    explain: "COUNT(*) counts rows; COUNT(DISTINCT x) counts different values of x. Mixing them up is one of the most common ways a number in a report ends up quietly wrong.",
    art: "clipboard",
  },
  {
    id: "fingerprints",
    title: "Fingerprints",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["COUNT DISTINCT", "Dedup", "Data quality"],
    prompt:
      "Before you join anything on game_id, check it really identifies one game: count the rows in games and the number of different game_id values.",
    returns: "total_rows, distinct_ids — one row.",
    tables: ["games"],
    expected: `SELECT COUNT(*) AS total_rows,
       COUNT(DISTINCT game_id) AS distinct_ids
FROM games;`,
    orderMatters: true,
    hint: "Two aggregates, no GROUP BY: one counts rows, the other counts distinct ids.",
    explain:
      "If the two numbers match, game_id is unique and safe to join on. If they don't, every join on it multiplies rows. Analysts run this check before trusting a key, not after a total comes out wrong.",
    art: "fingerprint",
  },
  {
    id: "inflation",
    title: "Inflation",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-03",
    tags: ["AVG", "GROUP BY", "ROUND"],
    prompt: "Is scoring going up? Find the average combined score of a game (both teams together) for each season.",
    returns: "season, avg_points rounded to 1 decimal — oldest first.",
    tables: ["games"],
    expected: `SELECT season, ROUND(AVG(home_score + away_score), 1) AS avg_points
FROM games
GROUP BY season
ORDER BY season;`,
    orderMatters: true,
    hint: "Add the two scores inside the AVG: AVG(home_score + away_score).",
    explain: "An aggregate can wrap an expression, not just a column. Adding first and averaging second gives the average game, which is what the question asked.",
    art: "balloon",
  },
  {
    id: "leaky-defense",
    title: "Leaky Defense",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["UNION ALL", "AVG", "LIMIT"],
    prompt:
      "Which defenses gave up the most? Find the three 2024 teams that allowed the most points per game. Each game lists the home team's points allowed in one column and the away team's in another.",
    returns: "team, allowed_pg rounded to 1 decimal — most allowed first. Three rows.",
    tables: ["games"],
    expected: `WITH allowed AS (
  SELECT home_team AS team, away_score AS pa FROM games WHERE season = 2024
  UNION ALL
  SELECT away_team, home_score FROM games WHERE season = 2024
)
SELECT team, ROUND(AVG(pa), 1) AS allowed_pg
FROM allowed
GROUP BY team
ORDER BY allowed_pg DESC
LIMIT 3;`,
    orderMatters: true,
    hint: "Points allowed by the home team are the away team's score, and the other way round. UNION ALL the two into one list of team and points allowed, then average per team.",
    explain:
      "UNION ALL stacks two queries with the same columns. Keep the ALL: plain UNION removes duplicate rows, and two games where a team allowed 24 are two rows, not one.",
    art: "colander",
  },
  {
    id: "magic-number",
    title: "Magic Number",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["UNION ALL", "GROUP BY", "LIMIT"],
    prompt: "Some scores come up again and again. Across every team's score in every 2024 game, which three final scores happened most often?",
    returns: "score, times — most common first. Three rows.",
    tables: ["games"],
    expected: `WITH scores AS (
  SELECT home_score AS score FROM games WHERE season = 2024
  UNION ALL
  SELECT away_score FROM games WHERE season = 2024
)
SELECT score, COUNT(*) AS times
FROM scores
GROUP BY score
ORDER BY times DESC
LIMIT 3;`,
    orderMatters: true,
    hint: "Every game has two scores, so stack home_score and away_score into one column with UNION ALL, then count each value.",
    explain:
      "The most common value is the mode. Football scores come in 3s and 7s, so a handful of totals turn up far more than the rest — counting is how you find which.",
    art: "magic-hat",
  },
  {
    id: "turf-war",
    title: "Turf War",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CASE", "LIKE", "GROUP BY"],
    prompt:
      "The surface column has seven different values, but the argument is grass against artificial turf. Group every game as 'grass', 'turf' (any surface with turf in its name) or 'unknown', and compare the scoring.",
    returns: "kind, games, avg_points (combined score, rounded to 1 decimal) — most games first.",
    tables: ["games"],
    expected: `SELECT CASE WHEN surface = 'grass' THEN 'grass'
            WHEN surface LIKE '%turf%' THEN 'turf'
            ELSE 'unknown' END AS kind,
       COUNT(*) AS games,
       ROUND(AVG(home_score + away_score), 1) AS avg_points
FROM games
GROUP BY kind
ORDER BY games DESC;`,
    orderMatters: true,
    hint: "CASE WHEN surface = 'grass' … WHEN surface LIKE '%turf%' … ELSE 'unknown' END, then GROUP BY that CASE.",
    explain:
      "Grouping by a CASE turns seven messy labels into the three categories the question is about. CASE stops at the first WHEN that's true, so put the specific cases first.",
    art: "tug-of-war",
  },
  {
    id: "sweater-weather",
    title: "Sweater Weather",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Dates", "NULL", "AVG"],
    prompt:
      "How fast does it get cold? For the 2024 outdoor games, find the average kickoff temperature in each calendar month, and how many games in that month actually have a temperature.",
    returns: "month (as '09', '10', …), measured (games with a temp), avg_temp rounded to 1 decimal — warmest first.",
    tables: ["games"],
    expected: `SELECT strftime('%m', gameday) AS month,
       COUNT(temp) AS measured,
       ROUND(AVG(temp), 1) AS avg_temp
FROM games
WHERE season = 2024 AND roof = 'outdoors'
GROUP BY month
ORDER BY avg_temp DESC;`,
    orderMatters: true,
    hint: "COUNT(temp) counts only the games with a temperature; COUNT(*) would count them all. AVG skips the blanks on its own.",
    explain:
      "COUNT(column) and AVG(column) both ignore NULLs, so they agree with each other about which games count. Showing that count beside an average is how you tell a reader how much data is behind it.",
    art: "sweater",
  },
  {
    id: "journeyman",
    title: "Journeyman",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["COUNT DISTINCT", "HAVING"],
    prompt: "Some players don't stay put. Find every player who appears for more than one NFL team in the table.",
    returns: "player, teams — most teams first, then player A–Z.",
    tables: ["week_results"],
    expected: `SELECT player, COUNT(DISTINCT team) AS teams
FROM week_results
GROUP BY player
HAVING COUNT(DISTINCT team) > 1
ORDER BY teams DESC, player;`,
    orderMatters: true,
    hint: "Group by player, count the distinct teams, and keep the groups with more than one.",
    explain:
      "A player's team lives on every row, so it can change from one row to the next. That's why 'what team is he on?' needs a date to answer, and why a player table keyed only on name goes wrong after a trade.",
    art: "suitcase",
  },
  {
    id: "fast-start",
    title: "Fast Start",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["CASE", "Pivot", "HAVING"],
    prompt:
      "Who came out flying? For 2024, compare each player's points per game in weeks 1–4 with the rest of his season, and keep the players who were better early.",
    returns: "player, first4_ppg, rest_ppg (both rounded to 1 decimal) — player A–Z.",
    tables: ["week_results"],
    expected: `SELECT player,
       ROUND(AVG(CASE WHEN week <= 4 THEN fantasy_pts END), 1) AS first4_ppg,
       ROUND(AVG(CASE WHEN week > 4 THEN fantasy_pts END), 1) AS rest_ppg
FROM week_results
WHERE season = 2024
GROUP BY player
HAVING AVG(CASE WHEN week <= 4 THEN fantasy_pts END) > AVG(CASE WHEN week > 4 THEN fantasy_pts END)
ORDER BY player;`,
    orderMatters: true,
    hint: "AVG(CASE WHEN week <= 4 THEN fantasy_pts END) averages only the early weeks. Compare the two averages in HAVING, before rounding.",
    explain:
      "Compare the unrounded averages in HAVING and round only what you display. Rounding first can turn 'slightly better' into 'equal' and drop a row that belongs.",
    art: "starting-blocks",
  },
  {
    id: "tier-list",
    title: "Tier List",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["NTILE", "Window", "Ranking"],
    prompt:
      "Every fantasy podcast does a tier list. Split the 2024 players with at least 8 games into four tiers by points per game, tier 1 being the best.",
    returns: "player, ppg rounded to 1 decimal, tier — by tier, then ppg highest first, then player A–Z.",
    tables: ["week_results"],
    expected: `WITH ppg AS (
  SELECT player, AVG(fantasy_pts) AS ppg
  FROM week_results
  WHERE season = 2024
  GROUP BY player
  HAVING COUNT(*) >= 8
)
SELECT player, ROUND(ppg, 1) AS ppg,
       NTILE(4) OVER (ORDER BY ppg DESC) AS tier
FROM ppg
ORDER BY tier, ppg DESC, player;`,
    orderMatters: true,
    hint: "NTILE(4) OVER (ORDER BY ppg DESC) deals the rows into four groups as evenly as it can, best first.",
    explain:
      "NTILE splits rows into equal-sized groups by position, not by value: 19 players become tiers of 5, 5, 5 and 4. Equal-width tiers (every 5 points) would need a CASE instead.",
    art: "tier-cake",
  },
  {
    id: "fortress",
    title: "Fortress",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-03",
    tags: ["SUM", "Conditional aggregation", "HAVING"],
    prompt: "Some stadiums are hard to win in. Find the 2024 teams that lost at most one home game.",
    returns: "team, home_wins, home_losses — fewest losses first, then most wins, then team A–Z.",
    tables: ["games"],
    expected: `SELECT home_team AS team,
       SUM(home_score > away_score) AS home_wins,
       SUM(home_score < away_score) AS home_losses
FROM games
WHERE season = 2024
GROUP BY home_team
HAVING SUM(home_score < away_score) <= 1
ORDER BY home_losses, home_wins DESC, team;`,
    orderMatters: true,
    hint: "Only home games matter, so group by home_team. Count wins and losses with SUM(condition), and filter the losses in HAVING.",
    explain: "The same SUM(condition) can be a column you show and a filter in HAVING. Grouping by home_team is what makes these home records rather than overall ones.",
    art: "castle",
  },
  {
    id: "median-game",
    players: ["Patrick Mahomes"],
    title: "The Median Game",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Median", "ROW_NUMBER", "Window"],
    prompt:
      "Averages get dragged around by a couple of huge games. Find Patrick Mahomes's median game in 2024 — the middle one when they're sorted — and his average next to it.",
    returns: "median_pts, avg_pts — both rounded to 1 decimal. One row.",
    tables: ["week_results"],
    expected: `WITH g AS (
  SELECT fantasy_pts,
         ROW_NUMBER() OVER (ORDER BY fantasy_pts) AS rn,
         COUNT(*) OVER () AS n
  FROM week_results
  WHERE player = 'Patrick Mahomes' AND season = 2024
)
SELECT ROUND(AVG(fantasy_pts), 1) AS median_pts,
       (SELECT ROUND(AVG(fantasy_pts), 1)
        FROM week_results
        WHERE player = 'Patrick Mahomes' AND season = 2024) AS avg_pts
FROM g
WHERE rn IN ((n + 1) / 2, (n + 2) / 2);`,
    orderMatters: true,
    hint:
      "SQLite has no MEDIAN. Number the games in order with ROW_NUMBER and count them with COUNT(*) OVER (). With an even count the median is the average of the two middle rows: (n + 1) / 2 and (n + 2) / 2 in whole-number division.",
    explain:
      "With an odd count both expressions point at the same middle row; with an even count they point at the two middle rows, and AVG splits the difference. The median sitting below the average means a few big games pulled the average up.",
    art: "seesaw",
  },
  {
    id: "revenge-game",
    title: "Revenge Game",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["ROW_NUMBER", "Self-join", "CTE"],
    prompt:
      "Division rivals meet twice. In 2024, find every pair of teams that met twice where the loser of the first game won the second.",
    returns: "team_a, team_b (alphabetical within the pair), first_winner, revenge_by — by team_a, then team_b.",
    tables: ["games"],
    expected: `WITH meetings AS (
  SELECT MIN(home_team, away_team) AS team_a,
         MAX(home_team, away_team) AS team_b,
         CASE WHEN home_score > away_score THEN home_team ELSE away_team END AS winner,
         ROW_NUMBER() OVER (
           PARTITION BY MIN(home_team, away_team), MAX(home_team, away_team)
           ORDER BY gameday
         ) AS meeting
  FROM games
  WHERE season = 2024 AND home_score <> away_score
)
SELECT f.team_a, f.team_b, f.winner AS first_winner, s.winner AS revenge_by
FROM meetings f
JOIN meetings s
  ON s.team_a = f.team_a AND s.team_b = f.team_b
WHERE f.meeting = 1 AND s.meeting = 2 AND f.winner <> s.winner
ORDER BY f.team_a, f.team_b;`,
    orderMatters: true,
    hint:
      "Name each pair the same way whoever was at home: MIN(home_team, away_team) and MAX(home_team, away_team). Number each pair's meetings by date, then join meeting 1 to meeting 2.",
    explain:
      "In SQLite, MIN and MAX with two arguments compare those two values on one row. Putting the pair in alphabetical order makes 'KC at DEN' and 'DEN at KC' the same pair, which is what lets the two meetings find each other.",
    art: "boomerang",
  },
  {
    id: "bounce-back",
    title: "Bounce Back",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["LAG", "Window", "CTE"],
    prompt: "A bad week, then a monster one. Find every 2024 game where a player scored 25 or more straight after a game under 10.",
    returns: "player, week, prev_pts, fantasy_pts — in week order, then player A–Z.",
    tables: ["week_results"],
    expected: `WITH seq AS (
  SELECT player, week, fantasy_pts,
         LAG(fantasy_pts) OVER (PARTITION BY player ORDER BY week) AS prev_pts
  FROM week_results
  WHERE season = 2024
)
SELECT player, week, prev_pts, fantasy_pts
FROM seq
WHERE prev_pts < 10 AND fantasy_pts >= 25
ORDER BY week, player;`,
    orderMatters: true,
    hint: "LAG(fantasy_pts) OVER (PARTITION BY player ORDER BY week) gives each row the player's previous game. Filter on it in an outer query.",
    explain:
      "'Previous game' means previous row for that player, which skips bye weeks and injuries automatically. You can't filter on a window in the same SELECT's WHERE, hence the CTE.",
    art: "spring",
  },
  {
    id: "first-to-100",
    title: "First to 100",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Running total", "Window", "GROUP BY"],
    prompt: "Race to a hundred. For each player, in which week of 2024 did his season total first reach 100 points?",
    returns: "player, week_reached — earliest first, then player A–Z.",
    tables: ["week_results"],
    expected: `WITH run AS (
  SELECT player, week,
         SUM(fantasy_pts) OVER (PARTITION BY player ORDER BY week) AS total
  FROM week_results
  WHERE season = 2024
)
SELECT player, MIN(week) AS week_reached
FROM run
WHERE total >= 100
GROUP BY player
ORDER BY week_reached, player;`,
    orderMatters: true,
    hint: "A running total per player (SUM … OVER PARTITION BY player ORDER BY week), then the smallest week where it's at least 100.",
    explain: "Windows and GROUP BY work in layers: the window builds the running total on every row, then a normal aggregate picks the first week past the line.",
    art: "speedometer",
  },
  {
    id: "elevator",
    title: "Elevator",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["RANK", "LAG", "Window"],
    prompt:
      "Each week of 2024, rank the players who played by points (1 is the week's best). Then find the five biggest climbs: a player's rank in one game against his rank in his game before.",
    returns: "player, week, prev_rank, wk_rank, climb (prev_rank minus wk_rank) — biggest climb first, then week, then player A–Z. Five rows.",
    tables: ["week_results"],
    expected: `WITH ranked AS (
  SELECT player, week,
         RANK() OVER (PARTITION BY week ORDER BY fantasy_pts DESC) AS wk_rank
  FROM week_results
  WHERE season = 2024
),
moves AS (
  SELECT player, week, wk_rank,
         LAG(wk_rank) OVER (PARTITION BY player ORDER BY week) AS prev_rank
  FROM ranked
)
SELECT player, week, prev_rank, wk_rank, prev_rank - wk_rank AS climb
FROM moves
WHERE prev_rank IS NOT NULL
ORDER BY climb DESC, week, player
LIMIT 5;`,
    orderMatters: true,
    hint: "Two windows in two steps: RANK within each week first, then LAG over each player's ranks. A window can't contain another window, so they need separate CTEs.",
    explain:
      "Each window answers a question about one grouping: the rank compares players within a week, the LAG compares weeks within a player. Stacking CTEs lets you ask one about the other.",
    art: "elevator",
  },
  {
    id: "mr-steady",
    title: "Mr. Steady",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-03",
    tags: ["Variance", "AVG", "HAVING", "LIMIT"],
    prompt:
      "Some players score the same every week; others swing wildly. Among 2024 players with at least 12 games, find the five with the lowest variance in weekly points. SQLite has no VARIANCE function, so you'll build it.",
    returns: "player, games, ppg, variance (both rounded to 1 decimal) — lowest variance first. Five rows.",
    tables: ["week_results"],
    expected: `SELECT player,
       COUNT(*) AS games,
       ROUND(AVG(fantasy_pts), 1) AS ppg,
       ROUND(AVG(fantasy_pts * fantasy_pts) - AVG(fantasy_pts) * AVG(fantasy_pts), 1) AS variance
FROM week_results
WHERE season = 2024
GROUP BY player
HAVING COUNT(*) >= 12
ORDER BY variance
LIMIT 5;`,
    orderMatters: true,
    hint: "Variance is the average of the squares minus the square of the average: AVG(x * x) - AVG(x) * AVG(x).",
    explain:
      "That formula is the population variance, and its square root is the standard deviation. A low variance means a player's floor and ceiling are close together — steady, whatever his average.",
    art: "spirit-level",
  },
  // ── Batch 3 (2026-10-05): joins across rosters, games and week_results,
  // date gaps, gaps and islands, and longer CTE chains. ─────────────────
  {
    id: "garbage-time",
    title: "Garbage Time",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "CASE", "Conditional aggregation", "HAVING"],
    prompt:
      "Garbage time is the end of a game that's already decided, when the losing team keeps throwing and the stat sheet keeps filling up. For 2025, find the players who averaged more points in their team's losses than in its wins, counting players with at least three of each.",
    returns: "player, win_ppg, loss_ppg (both rounded to 1 decimal) — biggest gap (loss_ppg minus win_ppg) first, then player A–Z.",
    tables: ["week_results", "games"],
    expected: `WITH pg AS (
  SELECT w.player, w.fantasy_pts,
         CASE WHEN (w.team = g.home_team AND g.home_score > g.away_score)
                OR (w.team = g.away_team AND g.away_score > g.home_score)
              THEN 'win' ELSE 'loss' END AS result
  FROM week_results w
  JOIN games g ON g.season = w.season AND g.week = w.week
              AND w.team IN (g.home_team, g.away_team)
  WHERE w.season = 2025
)
SELECT player,
       ROUND(AVG(CASE WHEN result = 'win' THEN fantasy_pts END), 1) AS win_ppg,
       ROUND(AVG(CASE WHEN result = 'loss' THEN fantasy_pts END), 1) AS loss_ppg
FROM pg
GROUP BY player
HAVING SUM(result = 'win') >= 3 AND SUM(result = 'loss') >= 3
   AND AVG(CASE WHEN result = 'loss' THEN fantasy_pts END) > AVG(CASE WHEN result = 'win' THEN fantasy_pts END)
ORDER BY loss_ppg - win_ppg DESC, player;`,
    orderMatters: true,
    hint: "Join each stat line to its game on season, week and team. His team won if it was home and home_score > away_score, or away and away_score > home_score, so a CASE can label every row 'win' or 'loss'. Average with a CASE inside AVG, and compare the two averages in HAVING.",
    explain:
      "A condition on an aggregate belongs in HAVING, because WHERE runs before the groups exist. This one carries three: enough wins, enough losses, and the comparison itself. Sam LaPorta tops it by a distance: his best days came when his team was losing.",
    art: "trash-can",
  },
  {
    id: "crunch-time",
    title: "Crunch Time",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "WHERE", "ABS", "HAVING"],
    prompt:
      "A one-score game is one decided by eight points or fewer, either way. Who keeps producing when it's tight? For 2025, find each player's points per game in one-score games, counting players with at least four of them.",
    returns: "player, close_games, close_ppg (rounded to 1 decimal) — best close_ppg first, then player A–Z. Five rows.",
    tables: ["week_results", "games"],
    expected: `SELECT w.player,
       COUNT(*) AS close_games,
       ROUND(AVG(w.fantasy_pts), 1) AS close_ppg
FROM week_results w
JOIN games g ON g.season = w.season AND g.week = w.week
            AND w.team IN (g.home_team, g.away_team)
WHERE w.season = 2025 AND ABS(g.home_score - g.away_score) <= 8
GROUP BY w.player
HAVING COUNT(*) >= 4
ORDER BY close_ppg DESC, w.player
LIMIT 5;`,
    orderMatters: true,
    hint: "The margin is home_score - away_score, and it's negative when the away team won. ABS(home_score - away_score) <= 8 keeps the close games whichever side won them.",
    explain:
      "ABS turns a signed difference into a size. Filter on home_score - away_score <= 8 without it and every road blowout sneaks in, because those margins are negative.",
    art: "crunch-clock",
  },
  {
    id: "manager-of-the-week",
    title: "Manager of the Week",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "CTE", "RANK", "PARTITION BY"],
    prompt:
      "Every week the league chat crowns whoever put up the most points. Using the 2024 rosters, total each fantasy team's points for every week, crown the top team each week (a tie would crown both), and count the crowns. A team that never topped a week doesn't appear.",
    returns: "team_name, weeks_on_top — most first, then team_name A–Z.",
    tables: ["rosters", "week_results"],
    expected: `WITH weekly AS (
  SELECT r.team_name, w.week, SUM(w.fantasy_pts) AS team_pts
  FROM rosters r
  JOIN week_results w ON w.player = r.player AND w.season = 2024
  GROUP BY r.team_name, w.week
),
ranked AS (
  SELECT team_name, week,
         RANK() OVER (PARTITION BY week ORDER BY team_pts DESC) AS rk
  FROM weekly
)
SELECT team_name, COUNT(*) AS weeks_on_top
FROM ranked
WHERE rk = 1
GROUP BY team_name
ORDER BY weeks_on_top DESC, team_name;`,
    orderMatters: true,
    hint: "Build it in steps. A CTE of weekly team totals, then RANK() OVER (PARTITION BY week ORDER BY team_pts DESC), then count the rows where the rank is 1.",
    explain:
      "PARTITION BY restarts the ranking every week, so each week gets its own number one. RANK rather than ROW_NUMBER means a tied week crowns both teams instead of picking one arbitrarily.",
    art: "mug",
  },
  {
    id: "left-on-the-board",
    title: "Left on the Board",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["LEFT JOIN", "Anti-join", "GROUP BY"],
    prompt: `The 2024 league drafted ${FACTS.players - FACTS.league.undrafted} of the ${FACTS.players} players in the table. Which of the ${FACTS.league.undrafted} nobody picked would have been worth a roster spot? List every undrafted player with his 2024 total.`,
    returns: "player, position, total_pts (rounded to 1 decimal) — most points first, then player A–Z.",
    tables: ["week_results", "rosters"],
    expected: `SELECT w.player, w.position, ROUND(SUM(w.fantasy_pts), 1) AS total_pts
FROM week_results w
LEFT JOIN rosters r ON r.player = w.player
WHERE w.season = 2024 AND r.player IS NULL
GROUP BY w.player, w.position
ORDER BY total_pts DESC, w.player;`,
    orderMatters: true,
    hint: "LEFT JOIN rosters on player and keep the rows where r.player IS NULL: those are the players with no match. Then total 2024 the usual way.",
    explain:
      "That's an anti-join: a LEFT JOIN that keeps only the rows that found nothing. NOT IN and NOT EXISTS give the same answer here. Quarterbacks lead the list because the draft spent every pick on running backs and receivers.",
    art: "draft-board",
  },
  {
    id: "two-weeks-off",
    title: "Two Weeks Off",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["UNION ALL", "LAG", "Dates", "julianday"],
    prompt:
      "A bye usually means 14 days between games: Sunday to Sunday. A few 2025 teams waited longer. Find every gap of 15 days or more between one team's games.",
    returns: "team, last_game, back_on, days_off — team A–Z.",
    tables: ["games"],
    expected: `WITH team_games AS (
  SELECT home_team AS team, gameday FROM games WHERE season = 2025
  UNION ALL
  SELECT away_team, gameday FROM games WHERE season = 2025
),
gaps AS (
  SELECT team,
         LAG(gameday) OVER (PARTITION BY team ORDER BY gameday) AS last_game,
         gameday AS back_on
  FROM team_games
)
SELECT team, last_game, back_on,
       julianday(back_on) - julianday(last_game) AS days_off
FROM gaps
WHERE julianday(back_on) - julianday(last_game) >= 15
ORDER BY team;`,
    orderMatters: true,
    hint: "Every game has two teams, so stack them into one list first: SELECT home_team AS team, gameday … UNION ALL SELECT away_team, gameday …. Then LAG(gameday) OVER (PARTITION BY team ORDER BY gameday) gives each game the one before it, and julianday() turns two dates into a number of days.",
    explain:
      "Every one of them came back on a Monday night after a Sunday game. julianday() is how SQLite does date arithmetic: it turns a date into a day number, and subtracting two gives the days between them.",
    art: "beach-umbrella",
  },
  {
    id: "fresh-legs",
    title: "Fresh Legs",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "LAG", "JOIN", "UNION ALL"],
    prompt:
      "Coaches say the bye week recharges a player. Look at 2025. A team's bye is the week it didn't play, so its first game back is two weeks after the game before it. For each player's first game back, compare what he scored with his 2025 average.",
    returns: "player, week, after_bye_pts, season_ppg, diff (season_ppg and diff rounded to 1 decimal; diff is after_bye_pts minus season_ppg) — biggest diff first, then player A–Z. Five rows.",
    tables: ["week_results", "games"],
    expected: `WITH team_games AS (
  SELECT home_team AS team, week FROM games WHERE season = 2025
  UNION ALL
  SELECT away_team, week FROM games WHERE season = 2025
),
back AS (
  SELECT team, week
  FROM (
    SELECT team, week,
           LAG(week) OVER (PARTITION BY team ORDER BY week) AS prev_week
    FROM team_games
  )
  WHERE week - prev_week >= 2
),
ppg AS (
  SELECT player, AVG(fantasy_pts) AS season_ppg
  FROM week_results
  WHERE season = 2025
  GROUP BY player
)
SELECT w.player, w.week, w.fantasy_pts AS after_bye_pts,
       ROUND(p.season_ppg, 1) AS season_ppg,
       ROUND(w.fantasy_pts - p.season_ppg, 1) AS diff
FROM week_results w
JOIN back b ON b.team = w.team AND b.week = w.week
JOIN ppg p ON p.player = w.player
WHERE w.season = 2025
ORDER BY diff DESC, w.player
LIMIT 5;`,
    orderMatters: true,
    hint: "Stack home and away teams into one list of (team, week), then LAG(week) OVER (PARTITION BY team ORDER BY week): where the week jumps by 2, that's a first game back. Join those team-weeks to week_results, and join a CTE of each player's 2025 average.",
    explain:
      "Events joined to baselines: one CTE finds the moments, another the normal level, and the join measures the difference. Only half the players beat their average coming off the bye, so these five are a list, not proof.",
    art: "winged-shoes",
  },
  {
    id: "on-the-shelf",
    title: "On the Shelf",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["LAG", "Gaps and islands", "WHERE"],
    prompt:
      "Missed games aren't zeros in week_results, they're missing rows, so an injury shows up as a gap. Across the full seasons, 2022 to 2025, find the longest gaps between a player's games within one season.",
    returns: "player, season, last_game_week, back_week, weeks_between (back_week minus last_game_week) — biggest gap first, then player A–Z, then season. Five rows.",
    tables: ["week_results"],
    expected: `WITH seq AS (
  SELECT player, season, week,
         LAG(week) OVER (PARTITION BY player, season ORDER BY week) AS prev_week
  FROM week_results
  WHERE season <= 2025
)
SELECT player, season, prev_week AS last_game_week, week AS back_week,
       week - prev_week AS weeks_between
FROM seq
WHERE prev_week IS NOT NULL
ORDER BY weeks_between DESC, player, season
LIMIT 5;`,
    orderMatters: true,
    hint: "LAG(week) OVER (PARTITION BY player, season ORDER BY week) puts each game next to the player's previous one that season. A season's first game has no previous one, so drop the NULLs.",
    explain:
      "This is gaps and islands: a run of rows with holes in it. A gap of 2 is just a bye; the big ones are injuries. A player whose season ended early never came back within it, so he has no gap here at all.",
    art: "shelf",
  },
  {
    id: "above-replacement",
    title: "Above Replacement",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "Window", "PARTITION BY", "MIN"],
    prompt:
      "A player's value isn't his points, it's his points over whoever you'd start instead. Call the lowest 2025 total at each position in the table replacement level, and work out how far above it every player finished.",
    returns: "player, position, total_pts, above_replacement (both rounded to 1 decimal) — most above_replacement first, then player A–Z. Five rows.",
    tables: ["week_results"],
    expected: `WITH totals AS (
  SELECT player, position, SUM(fantasy_pts) AS total_pts
  FROM week_results
  WHERE season = 2025
  GROUP BY player, position
)
SELECT player, position, ROUND(total_pts, 1) AS total_pts,
       ROUND(total_pts - MIN(total_pts) OVER (PARTITION BY position), 1) AS above_replacement
FROM totals
ORDER BY above_replacement DESC, player
LIMIT 5;`,
    orderMatters: true,
    hint: "Total each player's 2025 points in a CTE. Then MIN(total_pts) OVER (PARTITION BY position) puts his position's lowest total on every row, and you subtract.",
    explain:
      "A window function puts a group's figure beside every row without collapsing them, which GROUP BY can't do. Receivers top this list because the lowest receiver total in the table is far below the lowest running back's: the floor you measure from decides the ranking.",
    art: "spare-tire",
  },
  {
    id: "one-hit-wonder",
    title: "One-Hit Wonder",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["GROUP BY", "MAX", "SUM", "HAVING"],
    prompt:
      "Some season totals lean on one monster game. For 2025 players with at least ten games, what share of the season came from the single best one?",
    returns: "player, best_game, season_total, best_share (season_total rounded to 1 decimal; best_share is a percentage, rounded to 1 decimal) — highest best_share first, then player A–Z. Five rows.",
    tables: ["week_results"],
    expected: `SELECT player,
       MAX(fantasy_pts) AS best_game,
       ROUND(SUM(fantasy_pts), 1) AS season_total,
       ROUND(100.0 * MAX(fantasy_pts) / SUM(fantasy_pts), 1) AS best_share
FROM week_results
WHERE season = 2025
GROUP BY player
HAVING COUNT(*) >= 10
ORDER BY best_share DESC, player
LIMIT 5;`,
    orderMatters: true,
    hint: "MAX and SUM can sit in the same SELECT over the same group: 100.0 * MAX(fantasy_pts) / SUM(fantasy_pts) is the share. The ten-game rule goes in HAVING.",
    explain:
      "Take Derrick Henry's best game away and his 2025 loses about a sixth of its points. A total that leans on one week is fragile, which is why analysts check medians and floors next to totals.",
    art: "vinyl",
  },
  {
    id: "growth-chart",
    title: "Growth Chart",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "LAG", "HAVING"],
    prompt:
      "Who's still getting better? Using the full seasons, 2022 to 2025, find the players whose points per game went up every season they played, with at least three seasons to show for it.",
    returns: "player, seasons, first_ppg, last_ppg (both rounded to 1 decimal: his earliest season's PPG and his latest) — player A–Z.",
    tables: ["week_results"],
    expected: `WITH ppg AS (
  SELECT player, season, AVG(fantasy_pts) AS ppg
  FROM week_results
  WHERE season BETWEEN 2022 AND 2025
  GROUP BY player, season
),
steps AS (
  SELECT player, season, ppg,
         LAG(ppg) OVER (PARTITION BY player ORDER BY season) AS prev_ppg
  FROM ppg
)
SELECT player, COUNT(*) AS seasons,
       ROUND(MIN(ppg), 1) AS first_ppg, ROUND(MAX(ppg), 1) AS last_ppg
FROM steps
GROUP BY player
HAVING COUNT(*) >= 3 AND SUM(prev_ppg IS NOT NULL AND ppg <= prev_ppg) = 0
ORDER BY player;`,
    orderMatters: true,
    hint: "PPG per player and season in a CTE, then LAG(ppg) OVER (PARTITION BY player ORDER BY season) puts last season beside this one. A player qualifies when no season fails to beat the one before: count the failures with SUM(...) in HAVING and keep the zeros.",
    explain:
      "'Every season' is a claim about all the rows, and SQL proves it by counting exceptions: SUM(condition) = 0. Because these players only went up, the lowest season is the first and the highest is the last, so MIN and MAX give you the endpoints.",
    art: "growth-chart",
  },
  {
    id: "face-off",
    title: "Face-Off",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "Self-join", "JOIN"],
    prompt:
      "Sometimes two players from the table are in the same 2025 game, on opposite teams. Call each of those pairings a face-off, won by whoever scored more. Count each player's face-offs and how many he won. Two opponents in one game are two face-offs.",
    returns: "player, faceoffs, won (a tie isn't a win) — most wins first, then fewest faceoffs, then player A–Z. Five rows.",
    tables: ["week_results", "games"],
    expected: `WITH pg AS (
  SELECT w.player, w.fantasy_pts, g.game_id,
         w.team = g.home_team AS is_home
  FROM week_results w
  JOIN games g ON g.season = w.season AND g.week = w.week
              AND w.team IN (g.home_team, g.away_team)
  WHERE w.season = 2025
)
SELECT a.player, COUNT(*) AS faceoffs,
       SUM(a.fantasy_pts > b.fantasy_pts) AS won
FROM pg a
JOIN pg b ON b.game_id = a.game_id AND b.is_home <> a.is_home
GROUP BY a.player
ORDER BY won DESC, faceoffs, a.player
LIMIT 5;`,
    orderMatters: true,
    hint: "Give every player-game its game_id and whether he was the home side, in a CTE. Join that CTE to itself on the same game_id with opposite home flags. SUM(a.fantasy_pts > b.fantasy_pts) counts the wins.",
    explain:
      "A self-join pairs a table's rows with each other, and the ON clause is the pairing rule: same game, other side. Four of the top five are quarterbacks, which says more about fantasy scoring than about football. A fair fight would match positions.",
    art: "face-off",
  },
  {
    id: "pile-up",
    title: "Pile-Up",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["GROUP BY", "SUM", "ORDER BY", "LIMIT"],
    prompt:
      "Which single day of the 2025 season put the most points on the board, counting every game played that day?",
    returns: "gameday, weekday, games, total_points (both teams' scores, every game that day) — one row.",
    tables: ["games"],
    expected: `SELECT gameday, weekday, COUNT(*) AS games,
       SUM(home_score + away_score) AS total_points
FROM games
WHERE season = 2025
GROUP BY gameday, weekday
ORDER BY total_points DESC
LIMIT 1;`,
    orderMatters: true,
    hint: "GROUP BY gameday. SUM(home_score + away_score) gives the points and COUNT(*) the games; then ORDER BY the total, biggest first, and LIMIT 1.",
    explain:
      "Grouping by a date turns a list of games into a list of days. A Sunday wins easily because that's when most games are played; divide by the number of games if you wanted the best day per game instead.",
    art: "pile",
  },
  {
    id: "snooze-fest",
    title: "Snooze Fest",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["ORDER BY", "LIMIT"],
    prompt:
      "Not every game is a shootout. Find the three lowest-scoring games of 2025, counting both teams' points together.",
    returns: "week, away_team, home_team, away_score, home_score, total_points — lowest total first, then week, then home_team A–Z. Three rows.",
    tables: ["games"],
    expected: `SELECT week, away_team, home_team, away_score, home_score,
       away_score + home_score AS total_points
FROM games
WHERE season = 2025
ORDER BY total_points, week, home_team
LIMIT 3;`,
    orderMatters: true,
    hint: "Add the two scores in SELECT and name it total_points. ORDER BY it, smallest first, then by week and home_team for the tie-break, and LIMIT 3.",
    explain:
      "Two of these games finished on the same total in the same week, so without a tie-break their order is up to the database. Writing the tie-break into ORDER BY makes the answer the same every time.",
    art: "pillow",
  },
  {
    id: "turnaround",
    title: "Turnaround",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["UNION ALL", "CTE", "Self-join"],
    prompt:
      "Which offenses got better from 2024 to 2025? Compare each team's points scored per game across the two seasons.",
    returns: "team, ppg_2024, ppg_2025, change (all rounded to 1 decimal; change is 2025 minus 2024) — biggest change first, then team A–Z. Five rows.",
    tables: ["games"],
    expected: `WITH tg AS (
  SELECT season, home_team AS team, home_score AS pts FROM games WHERE season IN (2024, 2025)
  UNION ALL
  SELECT season, away_team, away_score FROM games WHERE season IN (2024, 2025)
),
ppg AS (
  SELECT team, season, AVG(pts) AS ppg FROM tg GROUP BY team, season
)
SELECT a.team, ROUND(a.ppg, 1) AS ppg_2024, ROUND(b.ppg, 1) AS ppg_2025,
       ROUND(b.ppg - a.ppg, 1) AS change
FROM ppg a
JOIN ppg b ON b.team = a.team AND b.season = 2025
WHERE a.season = 2024
ORDER BY change DESC, a.team
LIMIT 5;`,
    orderMatters: true,
    hint: "A team's points are home_score when it's home and away_score when it's away, so stack them with UNION ALL. Average per team and season, then join the 2024 rows to the 2025 rows on team.",
    explain:
      "Stacking is the move whenever a table keeps one thing in two columns. After that, two seasons side by side is a self-join: the same CTE twice, once for each year.",
    art: "u-turn",
  },
  {
    id: "pushover",
    title: "Pushover",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "CASE", "GROUP BY", "HAVING"],
    prompt:
      "Before you start a running back, you check who he's facing. Which 2025 defenses gave up the most fantasy points to the running backs in the table? A player's opponent is whichever team in his game isn't his own. Only count defenses that faced at least three of these backs' games.",
    returns: "defense, rb_games, rb_ppg_allowed (rounded to 1 decimal) — most allowed first, then defense A–Z. Five rows.",
    tables: ["week_results", "games"],
    expected: `SELECT CASE WHEN w.team = g.home_team THEN g.away_team ELSE g.home_team END AS defense,
       COUNT(*) AS rb_games,
       ROUND(AVG(w.fantasy_pts), 1) AS rb_ppg_allowed
FROM week_results w
JOIN games g ON g.season = w.season AND g.week = w.week
            AND w.team IN (g.home_team, g.away_team)
WHERE w.season = 2025 AND w.position = 'RB'
GROUP BY defense
HAVING COUNT(*) >= 3
ORDER BY rb_ppg_allowed DESC, defense
LIMIT 5;`,
    orderMatters: true,
    hint: "Join each stat line to its game. CASE WHEN w.team = g.home_team THEN g.away_team ELSE g.home_team END is the opponent. Keep the RBs in WHERE and group by that CASE.",
    explain:
      "You can group by an expression, not just a column: here, the CASE that names the opponent. That's how a matchup chart is built. With three or four games per defense, treat it as a lead, not a verdict.",
    art: "tackle-dummy",
  },
  {
    id: "round-robin",
    title: "Round Robin",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "CROSS JOIN", "LEFT JOIN", "COALESCE", "Self-join"],
    prompt:
      "Head-to-head luck decides fantasy leagues. An all-play record takes the luck out: every week, each team plays every other team. Run it on the 2024 league. A team whose players all sat out a week still plays that week, on zero points.",
    returns: "team_name, wins, losses, ties — most wins first, then team_name A–Z.",
    tables: ["rosters", "week_results", "games"],
    expected: `WITH weeks AS (
  SELECT DISTINCT week FROM games WHERE season = 2024
),
teams AS (
  SELECT DISTINCT team_name FROM rosters
),
weekly AS (
  SELECT t.team_name, k.week, COALESCE(SUM(w.fantasy_pts), 0) AS pts
  FROM teams t
  CROSS JOIN weeks k
  JOIN rosters r ON r.team_name = t.team_name
  LEFT JOIN week_results w ON w.player = r.player AND w.season = 2024 AND w.week = k.week
  GROUP BY t.team_name, k.week
)
SELECT a.team_name,
       SUM(a.pts > b.pts) AS wins,
       SUM(a.pts < b.pts) AS losses,
       SUM(a.pts = b.pts) AS ties
FROM weekly a
JOIN weekly b ON b.week = a.week AND b.team_name <> a.team_name
GROUP BY a.team_name
ORDER BY wins DESC, a.team_name;`,
    orderMatters: true,
    hint: "Build a grid first: every team CROSS JOIN every 2024 week (from games), then LEFT JOIN the team's players' stat lines and COALESCE the sum to 0. Join that grid to itself on week with a different team_name, and SUM the comparisons.",
    explain:
      "Some 2024 weeks a team had nobody play: no rows, so no score. Skip the grid and those weeks vanish instead of counting as losses, and the records come out wrong with no error to warn you. All-play is the 'Who's actually good?' chart in the League Scorecard project.",
    art: "robin",
  },
  {
    id: "road-trip",
    title: "Road Trip",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["UNION ALL", "ROW_NUMBER", "Gaps and islands", "CTE"],
    prompt:
      "Three road games in a row is a long time living out of a suitcase. Find every run of three or more consecutive road games a team played in 2025. A bye in the middle doesn't break a run: it's games in a row, not weeks.",
    returns: "team, first_game, last_game, road_games (the gamedays the trip started and ended) — most road_games first, then first_game, then team A–Z.",
    tables: ["games"],
    expected: `WITH team_games AS (
  SELECT home_team AS team, gameday, 'home' AS side FROM games WHERE season = 2025
  UNION ALL
  SELECT away_team, gameday, 'away' FROM games WHERE season = 2025
),
numbered AS (
  SELECT team, gameday, side,
         ROW_NUMBER() OVER (PARTITION BY team ORDER BY gameday)
       - ROW_NUMBER() OVER (PARTITION BY team, side ORDER BY gameday) AS grp
  FROM team_games
)
SELECT team, MIN(gameday) AS first_game, MAX(gameday) AS last_game, COUNT(*) AS road_games
FROM numbered
WHERE side = 'away'
GROUP BY team, grp
HAVING COUNT(*) >= 3
ORDER BY road_games DESC, first_game, team;`,
    orderMatters: true,
    hint: "Stack home and away into (team, gameday, side). Then the gaps-and-islands trick: ROW_NUMBER() OVER (PARTITION BY team ORDER BY gameday) minus ROW_NUMBER() OVER (PARTITION BY team, side ORDER BY gameday) stays the same along an unbroken run. Group the road games by team and that difference.",
    explain:
      "The difference of two row numbers holds steady while a run continues and jumps when it breaks, so it labels each island. It's the standard way to find streaks in SQL: winning runs, login streaks, anything in a row.",
    art: "road-trip",
  },
  {
    id: "halfway-there",
    title: "Halfway There",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Running total", "Window", "PARTITION BY", "CTE"],
    prompt:
      "Some seasons are front-loaded and some arrive late. For each 2025 player with at least ten games, find the week his running total first reached half of his season total.",
    returns: "player, season_total (rounded to 1 decimal), halfway_week — latest halfway_week first, then player A–Z. Five rows.",
    tables: ["week_results"],
    expected: `WITH run AS (
  SELECT player, week,
         SUM(fantasy_pts) OVER (PARTITION BY player ORDER BY week) AS so_far,
         SUM(fantasy_pts) OVER (PARTITION BY player) AS season_total,
         COUNT(*) OVER (PARTITION BY player) AS games
  FROM week_results
  WHERE season = 2025
)
SELECT player, ROUND(season_total, 1) AS season_total, MIN(week) AS halfway_week
FROM run
WHERE games >= 10 AND so_far >= season_total / 2
GROUP BY player, season_total
ORDER BY halfway_week DESC, player
LIMIT 5;`,
    orderMatters: true,
    hint: "Two windows on the same rows. SUM(fantasy_pts) OVER (PARTITION BY player ORDER BY week) is the running total; SUM(fantasy_pts) OVER (PARTITION BY player), with no ORDER BY, is the whole season. Keep the rows where the first is at least half the second, then take MIN(week) per player.",
    explain:
      "ORDER BY inside OVER is what makes a sum run; leave it out and the window is the whole partition. A late halfway week means a back-loaded season or games missed early, so check which before you call it a hot finish.",
    art: "halfway",
  },
  {
    id: "cool-down",
    title: "Cool Down",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["LEAD", "Window", "Subquery"],
    prompt:
      "After a 30-point game, everyone wants to start him again. What does he do next? Across the full seasons, 2022 to 2025, take every 30-point game that has a next game in the same season, and compare it with that next game.",
    returns: "big_games, avg_big_game, avg_next_game, avg_any_game (the average of every game 2022–2025) — averages rounded to 1 decimal. One row.",
    tables: ["week_results"],
    expected: `WITH nxt AS (
  SELECT fantasy_pts,
         LEAD(fantasy_pts) OVER (PARTITION BY player, season ORDER BY week) AS next_pts
  FROM week_results
  WHERE season BETWEEN 2022 AND 2025
)
SELECT COUNT(*) AS big_games,
       ROUND(AVG(fantasy_pts), 1) AS avg_big_game,
       ROUND(AVG(next_pts), 1) AS avg_next_game,
       (SELECT ROUND(AVG(fantasy_pts), 1) FROM week_results WHERE season BETWEEN 2022 AND 2025) AS avg_any_game
FROM nxt
WHERE fantasy_pts >= 30 AND next_pts IS NOT NULL;`,
    orderMatters: true,
    hint: "LEAD(fantasy_pts) OVER (PARTITION BY player, season ORDER BY week) is the next game's points. Filter to the 30-point games that have one, and get avg_any_game from a subquery in SELECT.",
    explain:
      "The game after a big one averages what any game averages. That's regression to the mean: a 30-point week is mostly a good player on a lucky day, and the luck doesn't come with him to the next one.",
    art: "desk-fan",
  },
  {
    id: "empty-seats",
    title: "Empty Seats",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CROSS JOIN", "LEFT JOIN", "Anti-join", "NULL"],
    prompt:
      "A fantasy roster spot sits empty in any week its player has no game: a bye, an injury, a benching. For the 2024 league, count each team's empty player-weeks across the weeks of the 2024 schedule.",
    returns: "team_name, empty_weeks (one per player per week with no stat line) — most first, then team_name A–Z.",
    tables: ["rosters", "week_results", "games"],
    expected: `WITH weeks AS (
  SELECT DISTINCT week FROM games WHERE season = 2024
)
SELECT r.team_name, COUNT(*) AS empty_weeks
FROM rosters r
CROSS JOIN weeks k
LEFT JOIN week_results w ON w.player = r.player AND w.season = 2024 AND w.week = k.week
WHERE w.player IS NULL
GROUP BY r.team_name
ORDER BY empty_weeks DESC, r.team_name;`,
    orderMatters: true,
    hint: "There are no rows to count, so make them: every rostered player CROSS JOIN every 2024 week from games. LEFT JOIN week_results on player, season and week, and count the rows where the stat line IS NULL.",
    explain:
      "You can't count missing rows directly, so you build every row that should exist and LEFT JOIN what does. Whatever comes back NULL is what's missing. It's the same move as a calendar of every day with the sales filled in.",
    art: "empty-seats",
  },
  // ── Gridiron Goods: a schema that isn't the league (added 2026-10-05) ──
  //
  // An INVENTED online fan store (lib/practice-schemas.ts), because a real
  // screen hands you tables you've never seen. Revenue counts delivered and
  // shipped orders; a cancelled order never shipped. unit_price is what was
  // charged that day, and jerseys went up on 2025-08-01.
  {
    id: "best-sellers",
    title: "Best Sellers",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "GROUP BY", "SUM", "LIMIT"],
    prompt:
      "You've just joined Gridiron Goods, an online fan store, and the first thing the buyer asks is what actually sells. Find the five products that sold the most units, not counting cancelled orders.",
    returns: "name, units — most units first, then name A–Z. Five rows.",
    tables: ["order_items", "orders", "products"],
    expected: `SELECT p.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.product_id, p.name
ORDER BY units DESC, p.name
LIMIT 5;`,
    orderMatters: true,
    hint: "Units live on order_items (quantity), names on products, and status on orders. Join all three, drop the cancelled ones, then SUM the quantity per product.",
    explain:
      "A new schema starts with one question: what is one row? Here an order_items row is one product on one order, so units are SUM(quantity), not COUNT(*): an order of two caps is one row and two units.",
    art: "shopping-bag",
  },
  {
    id: "rush-season",
    title: "Rush Season",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dates", "strftime", "GROUP BY"],
    prompt:
      "The warehouse wants to know when to hire extra help. Using every order Gridiron Goods took in 2025, find the three busiest months by number of orders.",
    returns: "month (two digits, like 09), orders — most orders first, then month. Three rows.",
    tables: ["orders"],
    expected: `SELECT strftime('%m', order_date) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month
ORDER BY orders DESC, month
LIMIT 3;`,
    orderMatters: true,
    hint: "strftime('%m', order_date) gives the month as two digits. Group by it and count.",
    explain:
      "Every order counts here, cancelled ones too: the warehouse handled them. Whether a row belongs in the count depends on the question, which is why you read the question twice before writing WHERE.",
    art: "rush-cart",
  },
  {
    id: "where-the-money-is",
    title: "Where the Money Is",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "GROUP BY", "SUM", "ROUND"],
    prompt:
      "Finance wants 2025 revenue by product category. Revenue is quantity times the price charged on the order line, for orders that were delivered or shipped.",
    returns: "category, revenue (rounded to 2 decimals) — most revenue first, then category A–Z.",
    tables: ["order_items", "orders", "products"],
    expected: `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status IN ('delivered', 'shipped')
GROUP BY p.category
ORDER BY revenue DESC, p.category;`,
    orderMatters: true,
    hint: "Multiply quantity by unit_price on each line, then SUM by category. Keep only delivered and shipped orders.",
    explain:
      "Two decisions make a revenue number: which price (the one charged, on the line) and which orders (not cancelled, not returned). Write both down; a finance team will ask.",
    art: "cash-register",
  },
  {
    id: "window-shoppers",
    title: "Window Shoppers",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["LEFT JOIN", "Anti-join", "NULL"],
    prompt:
      "Marketing wants to email everyone who made an account and never bought anything. How many customers have no orders at all?",
    returns: "never_ordered — one number.",
    tables: ["customers", "orders"],
    expected: `SELECT COUNT(*) AS never_ordered
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;`,
    orderMatters: true,
    hint: "LEFT JOIN orders onto customers, then keep the rows where the order side IS NULL.",
    explain:
      "The anti-join: keep every customer, keep only the ones that matched nothing. NOT EXISTS gives the same count, and both beat NOT IN, which breaks the moment the list holds a NULL.",
    art: "shop-window",
  },
  {
    id: "basket-size",
    title: "Basket Size",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "GROUP BY", "AVG", "JOIN"],
    prompt:
      "The app team thinks app shoppers spend more per order than web shoppers. For delivered and shipped orders, work out each order's total, then the average order value on each channel.",
    returns: "channel, orders, avg_order_value (rounded to 2 decimals) — channel A–Z.",
    tables: ["orders", "order_items"],
    expected: `WITH totals AS (
  SELECT o.order_id, o.channel, SUM(oi.quantity * oi.unit_price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status IN ('delivered', 'shipped')
  GROUP BY o.order_id, o.channel
)
SELECT channel, COUNT(*) AS orders, ROUND(AVG(total), 2) AS avg_order_value
FROM totals
GROUP BY channel
ORDER BY channel;`,
    orderMatters: true,
    hint: "Two steps. First one row per order with its total (a CTE grouped by order). Then average those totals by channel.",
    explain:
      "Averaging the order lines directly would give the average line, not the average order. Building the right grain first (one row per order) is the whole move.",
    art: "basket",
  },
  {
    id: "come-back-soon",
    title: "Come Back Soon",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "Conditional aggregation", "GROUP BY"],
    prompt:
      "Repeat buyers are the store's best customers. Among customers with at least one order that wasn't cancelled, how many ordered twice or more, and what percentage is that?",
    returns: "buyers, repeat_buyers, repeat_pct (rounded to 1 decimal) — one row.",
    tables: ["orders"],
    expected: `WITH per_customer AS (
  SELECT customer_id, COUNT(*) AS n
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY customer_id
)
SELECT COUNT(*) AS buyers,
       SUM(n >= 2) AS repeat_buyers,
       ROUND(100.0 * SUM(n >= 2) / COUNT(*), 1) AS repeat_pct
FROM per_customer;`,
    orderMatters: true,
    hint: "Count orders per customer in a CTE, then count the customers and SUM(n >= 2) over it.",
    explain:
      "SUM of a condition counts the rows where it's true. The denominator matters too: buyers, not every account, or the window shoppers drag the rate down.",
    art: "welcome-mat",
  },
  {
    id: "return-to-sender",
    title: "Return to Sender",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "COUNT DISTINCT", "Conditional aggregation", "CASE"],
    prompt:
      "Returns cost money twice. For each product category, how many orders included it, and what percentage of those orders came back? Ignore cancelled orders.",
    returns: "category, orders, return_pct (rounded to 1 decimal) — highest return_pct first, then category A–Z.",
    tables: ["orders", "order_items", "products"],
    expected: `SELECT p.category,
       COUNT(DISTINCT o.order_id) AS orders,
       ROUND(100.0 * COUNT(DISTINCT CASE WHEN o.status = 'returned' THEN o.order_id END)
             / COUNT(DISTINCT o.order_id), 1) AS return_pct
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.category
ORDER BY return_pct DESC, p.category;`,
    orderMatters: true,
    hint: "An order with two jerseys has two lines, so count orders with COUNT(DISTINCT order_id). For the returned ones, COUNT(DISTINCT CASE WHEN status = 'returned' THEN order_id END).",
    explain:
      "Joining orders to their lines multiplies each order by its line count. COUNT(DISTINCT) undoes the fan-out, and the CASE inside it counts only the orders that match.",
    art: "return-box",
  },
  {
    id: "price-tag-trap",
    title: "Price Tag Trap",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "SUM", "Data quality"],
    prompt:
      "Someone's dashboard multiplies quantity by products.price to get jersey revenue. Jerseys went up on 2025-08-01. For delivered and shipped orders, show jersey revenue the right way (the price charged on the line) beside the dashboard's way.",
    returns: "actual_revenue, at_todays_price (both rounded to 2 decimals) — one row.",
    tables: ["order_items", "orders", "products"],
    expected: `SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS actual_revenue,
       ROUND(SUM(oi.quantity * p.price), 2) AS at_todays_price
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status IN ('delivered', 'shipped') AND p.category = 'jersey';`,
    orderMatters: true,
    hint: "Same rows, two sums: one with oi.unit_price, one with p.price. Filter to category 'jersey'.",
    explain:
      "products.price is today's price; order_items.unit_price is history. Any time a price can change, revenue comes from the line, or every sale before the change is overstated.",
    art: "price-tag",
  },
  {
    id: "promo-codes",
    title: "Promo Codes",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["COALESCE", "NULL", "GROUP BY"],
    prompt:
      "Which discount codes earned their keep? For delivered and shipped orders, show each code's orders and revenue, with orders that used no code grouped as 'none'.",
    returns: "code, orders, revenue (rounded to 2 decimals) — most revenue first, then code A–Z.",
    tables: ["orders", "order_items"],
    expected: `SELECT COALESCE(o.discount_code, 'none') AS code,
       COUNT(DISTINCT o.order_id) AS orders,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status IN ('delivered', 'shipped')
GROUP BY code
ORDER BY revenue DESC, code;`,
    orderMatters: true,
    hint: "COALESCE(discount_code, 'none') turns the NULLs into a label you can group by. Count orders with COUNT(DISTINCT order_id), because the join repeats each order once per line.",
    explain:
      "GROUP BY would put the NULLs in a group of their own anyway, but a blank label reads as missing data in a report. COALESCE says what the blank means.",
    art: "coupon",
  },
  {
    id: "big-spenders",
    title: "Big Spenders",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "ROW_NUMBER", "PARTITION BY", "JOIN"],
    prompt:
      "Marketing wants to thank the top customer in each of the four biggest states: CA, TX, FL and NY. Find each state's biggest spender on delivered and shipped orders.",
    returns: "state, name, spent (rounded to 2 decimals) — state A–Z. If two customers tie, the lower customer_id wins.",
    tables: ["customers", "orders", "order_items"],
    expected: `WITH spend AS (
  SELECT c.state, c.name, c.customer_id, SUM(oi.quantity * oi.unit_price) AS spent
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status IN ('delivered', 'shipped') AND c.state IN ('CA', 'TX', 'FL', 'NY')
  GROUP BY c.state, c.name, c.customer_id
),
ranked AS (
  SELECT state, name, spent,
         ROW_NUMBER() OVER (PARTITION BY state ORDER BY spent DESC, customer_id) AS rn
  FROM spend
)
SELECT state, name, ROUND(spent, 2) AS spent
FROM ranked
WHERE rn = 1
ORDER BY state;`,
    orderMatters: true,
    hint: "Total spend per customer in a CTE, then ROW_NUMBER() OVER (PARTITION BY state ORDER BY spent DESC, customer_id) and keep row 1.",
    explain:
      "Top-one-per-group is the window function interview staple. Group by customer_id, not just name: two customers can share a name, and here some do.",
    art: "wallet-crown",
  },
  {
    id: "second-visit",
    title: "Second Visit",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "ROW_NUMBER", "Self-join", "julianday", "Dates"],
    prompt:
      "How long does it take a customer to come back? For customers with at least two orders that weren't cancelled, find the average number of days between their first and second order.",
    returns: "customers, avg_days (rounded to 1 decimal) — one row.",
    tables: ["orders"],
    expected: `WITH numbered AS (
  SELECT customer_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS n
  FROM orders
  WHERE status <> 'cancelled'
)
SELECT COUNT(*) AS customers,
       ROUND(AVG(julianday(b.order_date) - julianday(a.order_date)), 1) AS avg_days
FROM numbered a
JOIN numbered b ON b.customer_id = a.customer_id AND b.n = 2
WHERE a.n = 1;`,
    orderMatters: true,
    hint: "Number each customer's orders with ROW_NUMBER (ties broken by order_id), then join order 1 to order 2 of the same customer and average the julianday difference.",
    explain:
      "Numbering rows and joining number 1 to number 2 turns 'first' and 'second' into columns. LAG does the same job: LAG(order_date) on the second order is the first.",
    art: "two-dates",
  },
  {
    id: "blank-fields",
    title: "Blank Fields",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["NULL", "COUNT", "SUM"],
    prompt:
      "Before you segment customers by state or favourite team, check how complete those fields are. Count the customers, and how many are missing a state and a favourite team.",
    returns: "customers, missing_state, missing_team — one row.",
    tables: ["customers"],
    expected: `SELECT COUNT(*) AS customers,
       SUM(state IS NULL) AS missing_state,
       SUM(favorite_team IS NULL) AS missing_team
FROM customers;`,
    orderMatters: true,
    hint: "COUNT(*) counts every row. SUM(state IS NULL) counts the missing ones, because a true test is 1.",
    explain:
      "Check the blanks before you group by a column, or a chart of customers by state quietly loses a few percent of them into an unlabelled bar.",
    art: "blank-form",
  },
  {
    id: "free-shipping",
    title: "Free Shipping",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["SUM", "Conditional aggregation", "WHERE"],
    prompt:
      "Shipping is free on orders over $75. How many orders that weren't cancelled shipped free, and what share is that?",
    returns: "orders, free_shipping, free_pct (rounded to 1 decimal) — one row.",
    tables: ["orders"],
    expected: `SELECT COUNT(*) AS orders,
       SUM(shipping = 0) AS free_shipping,
       ROUND(100.0 * SUM(shipping = 0) / COUNT(*), 1) AS free_pct
FROM orders
WHERE status <> 'cancelled';`,
    orderMatters: true,
    hint: "shipping = 0 marks a free order. SUM(shipping = 0) counts them; multiply by 100.0 before dividing.",
    explain:
      "100.0 rather than 100 keeps the division decimal. In SQLite, integer divided by integer stays an integer, and a share comes out as 0.",
    art: "free-truck",
  },
  {
    id: "home-team-loyalty",
    title: "Home Team Loyalty",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "Conditional aggregation", "HAVING", "NULL"],
    prompt:
      "Do fans buy their own team's gear? For customers with a favourite team, look at the team items they bought (orders not cancelled) and find what share was their own team's. Only count teams with at least 30 such items.",
    returns: "team, items, own_team_pct (rounded to 1 decimal) — highest own_team_pct first, then team A–Z. Five rows.",
    tables: ["customers", "orders", "order_items", "products"],
    expected: `SELECT c.favorite_team AS team,
       COUNT(*) AS items,
       ROUND(100.0 * SUM(p.team = c.favorite_team) / COUNT(*), 1) AS own_team_pct
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE c.favorite_team IS NOT NULL AND p.team IS NOT NULL AND o.status <> 'cancelled'
GROUP BY c.favorite_team
HAVING COUNT(*) >= 30
ORDER BY own_team_pct DESC, team
LIMIT 5;`,
    orderMatters: true,
    hint: "Four tables, two NULL filters (no favourite team, no product team), then SUM(p.team = c.favorite_team) over COUNT(*) per favourite team.",
    explain:
      "Both NULL filters matter. A gift card has no team, so it isn't a vote for or against loyalty; leave it in and every percentage drops for a reason that has nothing to do with fans.",
    art: "heart-jersey",
  },
  {
    id: "running-revenue",
    title: "Running Revenue",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "Running total", "Window", "strftime"],
    prompt:
      "Finance wants 2025 revenue month by month, with a running total beside it. Revenue is delivered and shipped orders, quantity times the price charged.",
    returns: "month (two digits), revenue, running_total (both rounded to 2 decimals) — month order.",
    tables: ["orders", "order_items"],
    expected: `WITH monthly AS (
  SELECT strftime('%m', o.order_date) AS month, SUM(oi.quantity * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status IN ('delivered', 'shipped')
  GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       ROUND(SUM(revenue) OVER (ORDER BY month), 2) AS running_total
FROM monthly
ORDER BY month;`,
    orderMatters: true,
    hint: "Monthly totals in a CTE, then SUM(revenue) OVER (ORDER BY month) for the running total.",
    explain:
      "Round at the end, not in the CTE: rounding each month first and then adding them can leave the running total a cent off the real one.",
    art: "coin-steps",
  },
  {
    id: "signup-to-sale",
    title: "Signup to Sale",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "julianday", "Dates", "JOIN", "NULL"],
    prompt:
      "Which marketing channel brings customers who buy fastest? For customers who have ordered, average the days from signing up to their first order, by how they heard about the store. Leave out customers with no referral recorded.",
    returns: "source, customers, avg_days_to_first_order (rounded to 1 decimal) — fastest first, then source A–Z.",
    tables: ["customers", "orders"],
    expected: `WITH first_order AS (
  SELECT customer_id, MIN(order_date) AS first_date
  FROM orders
  GROUP BY customer_id
)
SELECT c.referral AS source,
       COUNT(*) AS customers,
       ROUND(AVG(julianday(f.first_date) - julianday(c.signup_date)), 1) AS avg_days_to_first_order
FROM customers c
JOIN first_order f ON f.customer_id = c.customer_id
WHERE c.referral IS NOT NULL
GROUP BY c.referral
ORDER BY avg_days_to_first_order, source;`,
    orderMatters: true,
    hint: "MIN(order_date) per customer in a CTE is the first order. Join it to customers and average julianday(first_date) - julianday(signup_date) by referral.",
    explain:
      "The inner JOIN quietly drops customers who never ordered, which is what you want here: there's no 'days to first order' for someone with no first order. Say so when you report it.",
    art: "signup-hourglass",
  },
  // ── Play by play: the 2025 season, one row per snap (added 2026-10-05) ──
  //
  // REAL nflverse play-by-play (lib/plays-dataset.ts): every pass, run, punt
  // and field goal of the 2025 regular season. Names are as the play-by-play
  // writes them (J.Goff). first_down includes touchdowns. epa is nflverse's
  // expected points model, and the questions that use it say so.
  {
    id: "fourth-and-short",
    title: "Fourth and Short",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Conditional aggregation", "GROUP BY", "WHERE"],
    prompt:
      "Your league chat is arguing about which coaches are brave. On every 4th down with 2 yards or less to go, a team either went for it (a pass or a run) or kicked (a punt or a field goal). Find the five teams that went for it on the biggest share of those chances.",
    returns: "team, chances, went_for_it, go_pct (rounded to 1 decimal) — highest go_pct first, then team A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT posteam AS team,
       COUNT(*) AS chances,
       SUM(play_type IN ('pass', 'run')) AS went_for_it,
       ROUND(100.0 * SUM(play_type IN ('pass', 'run')) / COUNT(*), 1) AS go_pct
FROM plays
WHERE down = 4 AND ydstogo <= 2
GROUP BY posteam
ORDER BY go_pct DESC, team
LIMIT 5;`,
    orderMatters: true,
    hint: "Filter to down = 4 AND ydstogo <= 2. Each team's chances are COUNT(*); a comparison like play_type IN ('pass', 'run') is 1 or 0, so SUM it to count the go-for-its.",
    explain:
      "Summing a true/false test is conditional aggregation: one pass over the rows gives the total and the subset side by side, without a second query or a join.",
    art: "fourth-down-sign",
  },
  {
    id: "go-for-it",
    title: "Go For It",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CASE", "GROUP BY", "Conditional aggregation"],
    prompt:
      "A coach wants a 4th-down cheat sheet. Take every 4th-down pass or run of 2025, put the distance to go in a bucket (1, 2-3, 4-6 or 7+ yards), and show how often each bucket was converted. A conversion is a first down, and first_down already counts touchdowns.",
    returns: "distance (the labels '1', '2-3', '4-6', '7+'), attempts, converted, conv_pct (1 decimal) — shortest distance first. Four rows.",
    tables: ["plays"],
    expected: `SELECT CASE
         WHEN ydstogo = 1 THEN '1'
         WHEN ydstogo <= 3 THEN '2-3'
         WHEN ydstogo <= 6 THEN '4-6'
         ELSE '7+'
       END AS distance,
       COUNT(*) AS attempts,
       SUM(first_down) AS converted,
       ROUND(100.0 * SUM(first_down) / COUNT(*), 1) AS conv_pct
FROM plays
WHERE down = 4 AND play_type IN ('pass', 'run')
GROUP BY distance
ORDER BY MIN(ydstogo);`,
    orderMatters: true,
    hint: "A CASE expression makes the bucket label; GROUP BY that label. first_down is 1 or 0, so SUM(first_down) counts the conversions.",
    explain:
      "CASE turns a number into a category, and grouping by the category builds the table a coach can actually read. Order by MIN(ydstogo) per bucket, because sorting text labels only works when they happen to sort the way the numbers do.",
    art: "go-chart",
  },
  {
    id: "third-down-kings",
    title: "Third Down Kings",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["WHERE", "GROUP BY", "SUM"],
    prompt:
      "Third down is where drives live or die. On every 3rd-down pass or run of 2025, find the five offenses that picked up a first down most often. first_down is 1 when a play got one, touchdowns included.",
    returns: "team, third_downs, converted, conv_pct (1 decimal) — highest conv_pct first, then team A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT posteam AS team,
       COUNT(*) AS third_downs,
       SUM(first_down) AS converted,
       ROUND(100.0 * SUM(first_down) / COUNT(*), 1) AS conv_pct
FROM plays
WHERE down = 3 AND play_type IN ('pass', 'run')
GROUP BY posteam
ORDER BY conv_pct DESC, team
LIMIT 5;`,
    orderMatters: true,
    hint: "posteam is the offense. Filter to down = 3 and passes or runs, then COUNT(*) and SUM(first_down) per team.",
    explain:
      "Multiply by 100.0, not 100, before dividing: two whole numbers divide as whole numbers in SQLite, and every rate would come out 0.",
    art: "third-down-chains",
  },
  {
    id: "red-zone-trips",
    title: "Red Zone Trips",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "GROUP BY", "Conditional aggregation"],
    prompt:
      "A drive is every play with the same game_id, posteam and drive number. A drive is a red-zone trip if any of its plays started at the opponent's 20 or closer (yardline_100 <= 20). Find the five teams that turned the biggest share of their trips into touchdowns. Only the offense's touchdowns count (td_team = posteam): a pick-six is not a trip that scored.",
    returns: "team, trips, touchdowns, td_pct (1 decimal) — highest td_pct first, then team A–Z. Five rows.",
    tables: ["plays"],
    expected: `WITH drives AS (
  SELECT game_id, posteam, drive,
         MIN(yardline_100) AS deepest,
         MAX(touchdown = 1 AND td_team = posteam) AS scored
  FROM plays
  GROUP BY game_id, posteam, drive
)
SELECT posteam AS team,
       COUNT(*) AS trips,
       SUM(scored) AS touchdowns,
       ROUND(100.0 * SUM(scored) / COUNT(*), 1) AS td_pct
FROM drives
WHERE deepest <= 20
GROUP BY posteam
ORDER BY td_pct DESC, team
LIMIT 5;`,
    orderMatters: true,
    hint: "First roll plays up to one row per drive: the deepest yardline_100 it reached and whether it scored (MAX of a true/false test). Then keep drives that reached 20 or closer and group by team.",
    explain:
      "The question is about drives, but the table is plays, so the first step is changing the grain. Count plays instead of drives and a team that ran twelve red-zone snaps on one drive gets twelve trips.",
    art: "red-zone-flag",
  },
  {
    id: "chunk-plays",
    title: "Chunk Plays",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["WHERE", "GROUP BY", "COUNT", "LIMIT"],
    prompt:
      "Big plays win games. Count every pass or run of 2025 that gained 20 yards or more, by offense, and find the five teams with the most.",
    returns: "team, plays_20_plus — most first, then team A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT posteam AS team, COUNT(*) AS plays_20_plus
FROM plays
WHERE play_type IN ('pass', 'run') AND yards_gained >= 20
GROUP BY posteam
ORDER BY plays_20_plus DESC, team
LIMIT 5;`,
    orderMatters: true,
    hint: "WHERE keeps passes and runs of 20+ yards_gained; GROUP BY posteam and COUNT(*).",
    explain:
      "Filter first, then count: WHERE throws out the short plays before GROUP BY ever sees them, so COUNT(*) is already counting only the chunk plays.",
    art: "chunk-ruler",
  },
  {
    id: "neutral-script",
    title: "Neutral Script",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["WHERE", "GROUP BY", "Conditional aggregation"],
    prompt:
      "Pass rate gets skewed by the scoreboard: a team down 20 throws every snap. Analysts strip that out by looking only at neutral plays: 1st and 2nd down, quarters 1 to 3, with the score within 7 either way (score_differential is from the offense's side). On those passes and runs, find the five teams that passed the most. A sack counts as a pass, which it already is here.",
    returns: "team, plays, pass_pct (1 decimal) — highest pass_pct first, then team A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT posteam AS team,
       COUNT(*) AS plays,
       ROUND(100.0 * SUM(play_type = 'pass') / COUNT(*), 1) AS pass_pct
FROM plays
WHERE play_type IN ('pass', 'run')
  AND down IN (1, 2)
  AND qtr <= 3
  AND ABS(score_differential) <= 7
GROUP BY posteam
ORDER BY pass_pct DESC, team
LIMIT 5;`,
    orderMatters: true,
    hint: "Four conditions in WHERE: passes or runs, down IN (1, 2), qtr <= 3 and ABS(score_differential) <= 7. Then SUM(play_type = 'pass') over COUNT(*).",
    explain:
      "Most of the work in a real analysis is deciding which rows are a fair comparison. The SQL is a GROUP BY; the judgement is the WHERE.",
    art: "script-card",
  },
  {
    id: "deep-shots",
    title: "Deep Shots",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["WHERE", "GROUP BY", "HAVING"],
    prompt:
      "A deep shot is a pass thrown 20 or more yards in the air (air_yards >= 20). Among passers with at least 40 deep attempts in 2025, who completed the highest share? Names are written the way the play-by-play writes them, like M.Stafford.",
    returns: "passer, deep_attempts, completions, comp_pct (1 decimal) — highest comp_pct first, then passer A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT passer,
       COUNT(*) AS deep_attempts,
       SUM(complete_pass) AS completions,
       ROUND(100.0 * SUM(complete_pass) / COUNT(*), 1) AS comp_pct
FROM plays
WHERE play_type = 'pass' AND air_yards >= 20
GROUP BY passer
HAVING COUNT(*) >= 40
ORDER BY comp_pct DESC, passer
LIMIT 5;`,
    orderMatters: true,
    hint: "WHERE picks the deep passes, GROUP BY passer, and HAVING COUNT(*) >= 40 drops the passers with too few to judge.",
    explain:
      "WHERE filters rows before grouping; HAVING filters groups after. A minimum like 40 attempts is a condition on the group, so it has to be HAVING.",
    art: "deep-bomb",
  },
  {
    id: "target-hogs",
    title: "Target Hogs",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["WHERE", "GROUP BY", "COUNT", "LIMIT"],
    prompt:
      "In PPR, targets are opportunity. A target is any pass thrown to a receiver (receiver isn't NULL). Find the five most-targeted players of 2025.",
    returns: "receiver, targets — most first, then receiver A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT receiver, COUNT(*) AS targets
FROM plays
WHERE play_type = 'pass' AND receiver IS NOT NULL
GROUP BY receiver
ORDER BY targets DESC, receiver
LIMIT 5;`,
    orderMatters: true,
    hint: "Sacks and throwaways have no receiver, so receiver IS NOT NULL keeps only real targets. Then GROUP BY receiver and COUNT(*).",
    explain:
      "Test for a missing value with IS NULL or IS NOT NULL. receiver != NULL is never true, not even for the rows that have one.",
    art: "target-bullseye",
  },
  {
    id: "from-way-out",
    title: "From Way Out",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CASE", "GROUP BY", "Conditional aggregation"],
    prompt:
      "How automatic are kickers now? Put every field goal attempt of 2025 in a bucket by kick_distance (under 40, 40-49, 50+) and show how many were made. A blocked kick is an attempt that wasn't made.",
    returns: "distance (the labels 'under 40', '40-49', '50+'), attempts, made, made_pct (1 decimal) — shortest bucket first. Three rows.",
    tables: ["plays"],
    expected: `SELECT CASE
         WHEN kick_distance < 40 THEN 'under 40'
         WHEN kick_distance < 50 THEN '40-49'
         ELSE '50+'
       END AS distance,
       COUNT(*) AS attempts,
       SUM(field_goal_result = 'made') AS made,
       ROUND(100.0 * SUM(field_goal_result = 'made') / COUNT(*), 1) AS made_pct
FROM plays
WHERE play_type = 'field_goal'
GROUP BY distance
ORDER BY MIN(kick_distance);`,
    orderMatters: true,
    hint: "CASE on kick_distance makes the label. field_goal_result is 'made', 'missed' or 'blocked', so SUM(field_goal_result = 'made') counts the good ones.",
    explain:
      "These labels don't sort the way the distances do ('under 40' comes last alphabetically), so order by something numeric per group, like MIN(kick_distance).",
    art: "long-kick",
  },
  {
    id: "expected-points",
    title: "Expected Points",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["WHERE", "GROUP BY", "AVG"],
    prompt:
      "epa is expected points added: nflverse's model of how many points a play was worth, from the down, distance and field position before and after it. It's a model's estimate, not something anyone wrote down, but it's the number analysts rank offenses by. Find the five offenses with the best average EPA per pass or run in 2025.",
    returns: "team, plays, epa_per_play (rounded to 3 decimals) — best first, then team A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT posteam AS team,
       COUNT(*) AS plays,
       ROUND(AVG(epa), 3) AS epa_per_play
FROM plays
WHERE play_type IN ('pass', 'run')
GROUP BY posteam
ORDER BY epa_per_play DESC, team
LIMIT 5;`,
    orderMatters: true,
    hint: "Average epa per posteam over passes and runs, rounded to 3 places.",
    explain:
      "Yards treat 3rd-and-1 and 3rd-and-15 the same; EPA doesn't. A 4-yard gain on 3rd-and-3 is worth far more than one on 3rd-and-10, which is why per-play EPA ranks offenses better than yards do.",
    art: "ep-gauge",
  },
  {
    id: "turnover-margin",
    title: "Turnover Margin",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "JOIN", "GROUP BY"],
    prompt:
      "On passes and runs, a turnover is an interception or a lost fumble (interception and fumble_lost are 1 or 0). A team's giveaways are the ones it committed on offense (posteam); its takeaways are the ones it forced on defense (defteam). Find the five best turnover margins, takeaways minus giveaways.",
    returns: "team, takeaways, giveaways, margin — biggest margin first, then team A–Z. Five rows.",
    tables: ["plays"],
    expected: `WITH giveaways AS (
  SELECT posteam AS team, SUM(interception + fumble_lost) AS n
  FROM plays
  WHERE play_type IN ('pass', 'run')
  GROUP BY posteam
),
takeaways AS (
  SELECT defteam AS team, SUM(interception + fumble_lost) AS n
  FROM plays
  WHERE play_type IN ('pass', 'run')
  GROUP BY defteam
)
SELECT g.team, t.n AS takeaways, g.n AS giveaways, t.n - g.n AS margin
FROM giveaways g
JOIN takeaways t ON t.team = g.team
ORDER BY margin DESC, g.team
LIMIT 5;`,
    orderMatters: true,
    hint: "The same plays count twice: once grouped by posteam (giveaways), once by defteam (takeaways). Build each in its own CTE and join them on team.",
    explain:
      "When one row means something different to each side (a giveaway for one team is a takeaway for the other), aggregate it once per side and join the results. Grouping by both columns at once would give you team pairs instead.",
    art: "turnover-scale",
  },
  {
    id: "the-comeback",
    title: "The Comeback",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "JOIN", "MIN"],
    prompt:
      "Find the five biggest comebacks of 2025: games a team won after trailing by the most. score_differential is the offense's score minus the defense's before the snap, so a team's lowest score_differential on its own plays is the deepest hole it was in. The games table has the final score.",
    returns: "game_id, team, down_by (as a positive number) — biggest first, then game_id. Five rows.",
    tables: ["plays", "games"],
    expected: `WITH worst AS (
  SELECT game_id, posteam AS team, MIN(score_differential) AS low
  FROM plays
  GROUP BY game_id, posteam
)
SELECT w.game_id, w.team, -w.low AS down_by
FROM worst w
JOIN games g ON g.game_id = w.game_id
WHERE (w.team = g.home_team AND g.home_score > g.away_score)
   OR (w.team = g.away_team AND g.away_score > g.home_score)
ORDER BY down_by DESC, w.game_id
LIMIT 5;`,
    orderMatters: true,
    hint: "Step one: MIN(score_differential) per game_id and posteam. Step two: join to games and keep the rows where that team's score beat the other team's.",
    explain:
      "plays knows how a game went; games knows how it ended. Neither table can answer this alone, and game_id is the key the two databases share.",
    art: "comeback-scoreboard",
  },
  {
    id: "hot-hand",
    title: "Hot Hand",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Gaps and islands", "ROW_NUMBER", "CTE"],
    prompt:
      "Find the three longest runs of consecutive completions by one passer in 2025, counting across games in the order he threw them (game_id, then play_id). Count real pass attempts only, so leave out sacks (sack = 1). An incompletion or an interception ends the run.",
    returns: "passer, streak — longest first, then passer A–Z. Three rows.",
    tables: ["plays"],
    expected: `WITH throws AS (
  SELECT passer, complete_pass,
         ROW_NUMBER() OVER (PARTITION BY passer ORDER BY game_id, play_id)
       - ROW_NUMBER() OVER (PARTITION BY passer, complete_pass ORDER BY game_id, play_id) AS grp
  FROM plays
  WHERE play_type = 'pass' AND passer IS NOT NULL AND sack = 0
)
SELECT passer, COUNT(*) AS streak
FROM throws
WHERE complete_pass = 1
GROUP BY passer, grp
ORDER BY streak DESC, passer
LIMIT 3;`,
    orderMatters: true,
    hint: "Gaps and islands: number each passer's throws, and separately number his completions. Within an unbroken run the two numbers rise together, so their difference stays the same. Group by passer and that difference.",
    explain:
      "Subtracting two ROW_NUMBERs gives every unbroken run its own label, which turns a question about order into an ordinary GROUP BY.",
    art: "hot-hand-flame",
  },
  {
    id: "inside-or-out",
    title: "Inside or Out",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["JOIN", "CASE", "GROUP BY"],
    prompt:
      "Do offenses play better under a roof? Join plays to games on game_id. Call a game indoors if its roof is 'dome' or 'closed', and outdoors otherwise, then compare average EPA per pass or run (epa is nflverse's expected points model).",
    returns: "setting ('indoors' or 'outdoors'), plays, epa_per_play (3 decimals) — indoors first. Two rows.",
    tables: ["plays", "games"],
    expected: `SELECT CASE WHEN g.roof IN ('dome', 'closed') THEN 'indoors' ELSE 'outdoors' END AS setting,
       COUNT(*) AS plays,
       ROUND(AVG(p.epa), 3) AS epa_per_play
FROM plays p
JOIN games g ON g.game_id = p.game_id
WHERE p.play_type IN ('pass', 'run')
GROUP BY setting
ORDER BY setting;`,
    orderMatters: true,
    hint: "The roof is on games, not plays. JOIN on game_id, then GROUP BY a CASE on g.roof.",
    explain:
      "The answer goes against the hunch (outdoors comes out ahead in 2025), and a hunch is exactly what a query like this is for checking. It's one season, though, so it's evidence, not a law.",
    art: "dome-sun",
  },
  {
    id: "bell-cows",
    title: "Bell Cows",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["GROUP BY", "HAVING", "AVG"],
    prompt:
      "Yards per carry flatters a back with ten carries. Among rushers with at least 150 carries in 2025, find the five with the best average gain. Quarterback runs count as runs too, but none reach 150.",
    returns: "rusher, carries, yards_per_carry (2 decimals) — best first, then rusher A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT rusher,
       COUNT(*) AS carries,
       ROUND(AVG(yards_gained), 2) AS yards_per_carry
FROM plays
WHERE play_type = 'run' AND rusher IS NOT NULL
GROUP BY rusher
HAVING COUNT(*) >= 150
ORDER BY yards_per_carry DESC, rusher
LIMIT 5;`,
    orderMatters: true,
    hint: "GROUP BY rusher on run plays, keep groups with HAVING COUNT(*) >= 150, and order by AVG(yards_gained).",
    explain:
      "An average over a handful of rows is mostly luck. A minimum sample in HAVING is how every leaderboard you've ever trusted was built.",
    art: "yard-cow",
  },
  {
    id: "sack-watch",
    title: "Sack Watch",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["WHERE", "GROUP BY", "SUM"],
    prompt:
      "Which quarterbacks spent the most time on the turf? On a sack, play_type is 'pass', sack is 1, and passer is the player who went down. Find the five passers sacked most in 2025.",
    returns: "passer, sacks — most first, then passer A–Z. Five rows.",
    tables: ["plays"],
    expected: `SELECT passer, SUM(sack) AS sacks
FROM plays
WHERE play_type = 'pass' AND passer IS NOT NULL
GROUP BY passer
ORDER BY sacks DESC, passer
LIMIT 5;`,
    orderMatters: true,
    hint: "sack is 1 or 0, so SUM(sack) per passer counts them. (WHERE sack = 1 with COUNT(*) works too.)",
    explain:
      "Two players are tied at the top, which is why the tie-break is in the question: without it, two correct queries could list them in either order.",
    art: "sack-qb",
  },
  {
    id: "marathon-drives",
    title: "Marathon Drives",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "GROUP BY", "COUNT"],
    prompt:
      "A drive is every play with the same game_id, posteam and drive number (punts and field goals count as plays). Count each team's drives of 15 plays or more in 2025, and find the three teams with the most.",
    returns: "team, long_drives — most first, then team A–Z. Three rows.",
    tables: ["plays"],
    expected: `WITH drives AS (
  SELECT game_id, posteam, drive, COUNT(*) AS plays
  FROM plays
  GROUP BY game_id, posteam, drive
)
SELECT posteam AS team, COUNT(*) AS long_drives
FROM drives
WHERE plays >= 15
GROUP BY posteam
ORDER BY long_drives DESC, team
LIMIT 3;`,
    orderMatters: true,
    hint: "Count twice. First COUNT(*) plays per drive, then keep drives of 15+ and COUNT(*) them per team.",
    explain:
      "Aggregating an aggregate needs two steps, because GROUP BY can only roll up once. A CTE (or a subquery in FROM) is the first roll-up, and the outer query is the second.",
    art: "marathon-chain",
  },
  // ── Benchwarmer: product analytics on an app's event log (added 2026-10-05) ──
  //
  // An INVENTED fantasy football app (lib/app-dataset.ts): users, events and
  // subscriptions, the schema behind every "DAU, retention, funnel" screen.
  // About 1% of events arrive twice, exactly, the way a retrying client logs
  // them; the questions say when to count rows as logged.
  {
    id: "game-day-traffic",
    title: "Game Day Traffic",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dates", "strftime", "GROUP BY"],
    prompt:
      "You've just joined Benchwarmer, a fantasy football app, and the on-call engineer wants to know which day the servers get hit hardest. Count the app_open events for each day of the week, rows as logged.",
    returns: "weekday (strftime('%w'): '0' is Sunday … '6' is Saturday), opens — weekday order. Seven rows.",
    tables: ["events"],
    expected: `SELECT strftime('%w', event_time) AS weekday, COUNT(*) AS opens
FROM events
WHERE event_name = 'app_open'
GROUP BY weekday
ORDER BY weekday;`,
    orderMatters: true,
    hint: "strftime('%w', event_time) turns a timestamp into its day of the week, '0' to '6'. Filter to app_open, group by it and count.",
    explain:
      "Sunday is games and Wednesday is waivers, and the log shows both. Grouping timestamps by a part of the date is the first thing anyone does with an event log.",
    art: "phone-sunday",
  },
  {
    id: "daily-actives",
    title: "Daily Actives",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dates", "COUNT", "DISTINCT"],
    prompt:
      "Daily active users (DAU) is the number every app dashboard opens on: how many different people did anything that day. Work it out for each day from Sunday 2 November to Saturday 8 November 2025.",
    returns: "day (YYYY-MM-DD), dau — in date order. Seven rows.",
    tables: ["events"],
    expected: `SELECT date(event_time) AS day, COUNT(DISTINCT user_id) AS dau
FROM events
WHERE date(event_time) BETWEEN '2025-11-02' AND '2025-11-08'
GROUP BY day
ORDER BY day;`,
    orderMatters: true,
    hint: "date(event_time) drops the time of day. Group by that and count DISTINCT user_id, because one user makes many events.",
    explain:
      "COUNT(*) would count events, and an active user opens the app and taps around a dozen times. Active users is COUNT(DISTINCT user_id), which is why duplicates in the log can't inflate it.",
    art: "dau-counter",
  },
  {
    id: "peak-week",
    title: "Peak Week",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dates", "strftime", "GROUP BY", "LIMIT"],
    prompt:
      "Marketing wants to know when Benchwarmer peaked. Using strftime('%W', event_time) as the week number, find the three weeks with the most weekly active users (different users with any event that week).",
    returns: "week (two digits, from strftime('%W')), wau — most first, then week. Three rows.",
    tables: ["events"],
    expected: `SELECT strftime('%W', event_time) AS week, COUNT(DISTINCT user_id) AS wau
FROM events
GROUP BY week
ORDER BY wau DESC, week
LIMIT 3;`,
    orderMatters: true,
    hint: "Same as DAU, a week at a time: group by strftime('%W', event_time) and count distinct users.",
    explain:
      "The peak is early September, the week the draft-season signups were still new. Any active-user number depends on the window: the same app has a DAU, a WAU and a MAU, and they answer different questions.",
    art: "peak-mountain",
  },
  {
    id: "stickiness",
    title: "Stickiness",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "Subquery", "Dates", "AVG"],
    prompt:
      "Stickiness is average DAU divided by MAU: of everyone who used the app this month, what share shows up on a typical day. Work it out for November 2025: the average DAU across November's days, the month's distinct active users, and the ratio.",
    returns: "avg_dau (1 decimal), mau, stickiness_pct (100 × the unrounded average ÷ mau, 1 decimal). One row.",
    tables: ["events"],
    expected: `WITH daily AS (
  SELECT date(event_time) AS day, COUNT(DISTINCT user_id) AS dau
  FROM events
  WHERE event_time >= '2025-11-01' AND event_time < '2025-12-01'
  GROUP BY day
),
monthly AS (
  SELECT COUNT(DISTINCT user_id) AS mau
  FROM events
  WHERE event_time >= '2025-11-01' AND event_time < '2025-12-01'
)
SELECT ROUND(AVG(d.dau), 1) AS avg_dau,
       m.mau,
       ROUND(100.0 * AVG(d.dau) / m.mau, 1) AS stickiness_pct
FROM daily d
CROSS JOIN monthly m
GROUP BY m.mau;`,
    orderMatters: true,
    hint: "Two numbers at two grains: DAU per day (then averaged) and one distinct count for the whole month. Build each in its own CTE and put them side by side.",
    explain:
      "You can't get MAU by adding up DAU: someone active on twenty days would be counted twenty times. Distinct counts don't add, which is why each window is counted on its own.",
    art: "glue-phone",
  },
  {
    id: "day-seven",
    title: "Day Seven",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "Subquery", "Dates", "Conditional aggregation"],
    prompt:
      "Day-7 retention: of the people who signed up, what share did anything in the app exactly seven days after their signup date? Break it down by signup month.",
    returns: "signup_month (two digits), signups, active_day_7, d7_pct (1 decimal) — month order. Four rows.",
    tables: ["users", "events"],
    expected: `WITH d7 AS (
  SELECT u.user_id, u.signup_date,
         EXISTS (
           SELECT 1 FROM events e
           WHERE e.user_id = u.user_id
             AND date(e.event_time) = date(u.signup_date, '+7 days')
         ) AS active
  FROM users u
)
SELECT strftime('%m', signup_date) AS signup_month,
       COUNT(*) AS signups,
       SUM(active) AS active_day_7,
       ROUND(100.0 * SUM(active) / COUNT(*), 1) AS d7_pct
FROM d7
GROUP BY signup_month
ORDER BY signup_month;`,
    orderMatters: true,
    hint: "For each user, check whether any event falls on date(signup_date, '+7 days'). EXISTS gives 1 or 0; then group by signup month and sum it.",
    explain:
      "A JOIN to events would return one row per event that day and inflate the count; EXISTS asks only whether there's at least one. August's cohort retains worst: people who sign up before the season starts have less reason to come back a week later.",
    art: "seven-calendar",
  },
  {
    id: "the-funnel",
    title: "The Funnel",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Conditional aggregation", "CASE", "COUNT"],
    prompt:
      "The product lead wants the funnel on one line: how many different users signed up, joined a league, set a lineup and upgraded (event_name 'signup', 'join_league', 'set_lineup', 'upgrade').",
    returns: "signed_up, joined_league, set_lineup, upgraded. One row.",
    tables: ["events"],
    expected: `SELECT COUNT(DISTINCT CASE WHEN event_name = 'signup' THEN user_id END) AS signed_up,
       COUNT(DISTINCT CASE WHEN event_name = 'join_league' THEN user_id END) AS joined_league,
       COUNT(DISTINCT CASE WHEN event_name = 'set_lineup' THEN user_id END) AS set_lineup,
       COUNT(DISTINCT CASE WHEN event_name = 'upgrade' THEN user_id END) AS upgraded
FROM events;`,
    orderMatters: true,
    hint: "A CASE inside COUNT(DISTINCT …) returns the user_id only for the event you want and NULL otherwise, and COUNT ignores NULLs.",
    explain:
      "This is a pivot: four counts that would be four rows from a GROUP BY become four columns, which is the shape a funnel chart wants. DISTINCT matters, because someone sets a lineup every week.",
    art: "funnel-steps",
  },
  {
    id: "empty-lineups",
    title: "Empty Lineups",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Anti-join", "Subquery", "NOT EXISTS"],
    prompt:
      "Some people join a league and then never set a lineup, which is the leak the product team most wants to fix. How many different users have a join_league event but no set_lineup event at all?",
    returns: "joined_never_set. One row.",
    tables: ["events"],
    expected: `SELECT COUNT(DISTINCT j.user_id) AS joined_never_set
FROM events j
WHERE j.event_name = 'join_league'
  AND NOT EXISTS (
    SELECT 1 FROM events s
    WHERE s.user_id = j.user_id AND s.event_name = 'set_lineup'
  );`,
    orderMatters: true,
    hint: "Start from the join_league events and keep the users for whom NOT EXISTS finds a set_lineup event. Count distinct users, since a join can be logged twice.",
    explain:
      "\"Has A but never B\" is an anti-join. NOT EXISTS reads the way the question does, and unlike NOT IN it can't be broken by a NULL in the subquery.",
    art: "empty-lineup",
  },
  {
    id: "channel-check",
    title: "Channel Check",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["LEFT JOIN", "GROUP BY", "COUNT"],
    prompt:
      "Benchwarmer pays for paid_social signups and wants to know if they're worth it. For each acquisition channel, how many users signed up and how many upgraded to Pro (a row in subscriptions)?",
    returns: "channel, users, upgraded, upgrade_pct (1 decimal) — highest upgrade_pct first, then channel A–Z. Five rows.",
    tables: ["users", "subscriptions"],
    expected: `SELECT u.channel,
       COUNT(*) AS users,
       COUNT(s.user_id) AS upgraded,
       ROUND(100.0 * COUNT(s.user_id) / COUNT(*), 1) AS upgrade_pct
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.user_id
GROUP BY u.channel
ORDER BY upgrade_pct DESC, u.channel;`,
    orderMatters: true,
    hint: "LEFT JOIN users to subscriptions so the people who never upgraded stay in. COUNT(*) counts everyone; COUNT(s.user_id) counts only the rows that matched.",
    explain:
      "An inner join would drop everyone who didn't upgrade and every channel would show 100%. COUNT(column) skipping NULLs is what turns a LEFT JOIN into a rate.",
    art: "channel-signs",
  },
  {
    id: "thirty-minute-rule",
    title: "Thirty-Minute Rule",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["LAG", "Gaps and islands", "Dedup", "CTE"],
    prompt:
      "The log has events, not sessions. The usual rule: a new session starts with a user's first event, or with any event more than 30 minutes after their previous one. Remove exact duplicate rows first, then count the sessions and the events, and work out events per session.",
    returns: "sessions, events, events_per_session (2 decimals). One row.",
    tables: ["events"],
    expected: `WITH clean AS (
  SELECT DISTINCT user_id, event_time, event_name, platform
  FROM events
),
gaps AS (
  SELECT user_id, event_time,
         LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) AS prev_time
  FROM clean
)
SELECT SUM(prev_time IS NULL OR (julianday(event_time) - julianday(prev_time)) * 24 * 60 > 30) AS sessions,
       COUNT(*) AS events,
       ROUND(1.0 * COUNT(*) / SUM(prev_time IS NULL OR (julianday(event_time) - julianday(prev_time)) * 24 * 60 > 30), 2) AS events_per_session
FROM gaps;`,
    orderMatters: true,
    hint: "SELECT DISTINCT * removes the duplicates. LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) gives each event the one before it; julianday differences are in days, so × 24 × 60 for minutes. Each event that starts a session counts 1.",
    explain:
      "Sessionising is gaps and islands on time: LAG finds the gaps, and every gap over the threshold starts a new island. Leave the duplicates in and every retried event looks like a zero-second gap, which inflates events per session.",
    art: "stopwatch-thirty",
  },
  {
    id: "first-move",
    title: "First Move",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["ROW_NUMBER", "PARTITION BY", "CTE"],
    prompt:
      "Every user's log starts with signup. What do people do right after? Find each user's second event (by event_time) and count how many users made each one.",
    returns: "event_name, users — most first, then event_name A–Z. Two rows.",
    tables: ["events"],
    expected: `WITH ranked AS (
  SELECT user_id, event_name,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time) AS n
  FROM events
)
SELECT event_name, COUNT(*) AS users
FROM ranked
WHERE n = 2
GROUP BY event_name
ORDER BY users DESC, event_name;`,
    orderMatters: true,
    hint: "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time) numbers each user's events from 1. Keep n = 2 and count by event_name.",
    explain:
      "\"The Nth thing per group\" is ROW_NUMBER inside a CTE, filtered outside it: a window function can't go in WHERE directly, because WHERE runs before the windows are computed.",
    art: "first-footprint",
  },
  {
    id: "double-taps",
    title: "Double Taps",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dedup", "DISTINCT", "Subquery"],
    prompt:
      "The app retries a request when the network blips, and sometimes the first one got through too, so a few events are logged twice: same user, same time, same event, same platform. How many rows are in events, how many are left once exact duplicates are removed, and how many duplicates is that?",
    returns: "total_rows, distinct_rows, duplicates. One row.",
    tables: ["events"],
    expected: `SELECT COUNT(*) AS total_rows,
       (SELECT COUNT(*) FROM (SELECT DISTINCT user_id, event_time, event_name, platform FROM events)) AS distinct_rows,
       COUNT(*) - (SELECT COUNT(*) FROM (SELECT DISTINCT user_id, event_time, event_name, platform FROM events)) AS duplicates
FROM events;`,
    orderMatters: true,
    hint: "SELECT DISTINCT over every column keeps one copy of each row. Count that in a subquery and compare it with COUNT(*).",
    explain:
      "Check for duplicates before trusting any count from a log. Distinct users are safe from them; event counts, revenue and averages are not.",
    art: "double-tap",
  },
  {
    id: "two-screens",
    title: "Two Screens",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "JOIN", "COUNT", "DISTINCT"],
    prompt:
      "Some people sign up on their phone and also use the website. For each signup platform (users.platform), how many users are there, and how many have events on more than one platform?",
    returns: "signup_platform, users, multi_platform — platform A–Z. Three rows.",
    tables: ["users", "events"],
    expected: `WITH per_user AS (
  SELECT user_id, COUNT(DISTINCT platform) AS platforms
  FROM events
  GROUP BY user_id
)
SELECT u.platform AS signup_platform,
       COUNT(*) AS users,
       SUM(p.platforms > 1) AS multi_platform
FROM users u
JOIN per_user p ON p.user_id = u.user_id
GROUP BY u.platform
ORDER BY u.platform;`,
    orderMatters: true,
    hint: "First COUNT(DISTINCT platform) per user from events. Then join to users and sum the users whose count is over 1.",
    explain:
      "Two grains again: platforms per user first, then users per signup platform. Nobody who signed up on the web uses the phone apps here, which is the kind of thing that only shows up once you split it.",
    art: "phone-laptop",
  },
  {
    id: "time-to-join",
    title: "Time to Join",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dates", "julianday", "CTE", "JOIN"],
    prompt:
      "How long does it take a new user to join their first league? For the users who joined one, take the date of their first join_league event, measure the days from their signup_date, and average it by acquisition channel.",
    returns: "channel, joined, avg_days (2 decimals) — fastest first, then channel A–Z. Five rows.",
    tables: ["users", "events"],
    expected: `WITH first_join AS (
  SELECT user_id, MIN(event_time) AS joined_at
  FROM events
  WHERE event_name = 'join_league'
  GROUP BY user_id
)
SELECT u.channel,
       COUNT(*) AS joined,
       ROUND(AVG(julianday(date(j.joined_at)) - julianday(u.signup_date)), 2) AS avg_days
FROM users u
JOIN first_join j ON j.user_id = u.user_id
GROUP BY u.channel
ORDER BY avg_days, u.channel;`,
    orderMatters: true,
    hint: "MIN(event_time) per user gives the first join. julianday(date(...)) - julianday(signup_date) is the gap in whole days.",
    explain:
      "Compare dates with dates: signup_date has no time of day, so take date() of the timestamp first, or a 9pm join on the signup day counts as most of a day.",
    art: "join-hourglass",
  },
  {
    id: "recurring-revenue",
    title: "Recurring Revenue",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["CTE", "LEFT JOIN", "NULL", "COALESCE"],
    prompt:
      "Monthly recurring revenue (MRR) is what every active subscription pays per month. A subscription is active on a day if it started on or before that day and either hasn't ended (ended is NULL) or ended after it. Work out the subscribers and MRR on the last day of September, October, November and December 2025.",
    returns: "month_end (YYYY-MM-DD), subscribers, mrr (2 decimals) — in date order. Four rows.",
    tables: ["subscriptions"],
    expected: `WITH months AS (
  SELECT '2025-09-30' AS month_end
  UNION ALL SELECT '2025-10-31'
  UNION ALL SELECT '2025-11-30'
  UNION ALL SELECT '2025-12-31'
)
SELECT m.month_end,
       COUNT(s.user_id) AS subscribers,
       ROUND(COALESCE(SUM(s.monthly_price), 0), 2) AS mrr
FROM months m
LEFT JOIN subscriptions s
  ON s.started <= m.month_end
 AND (s.ended IS NULL OR s.ended > m.month_end)
GROUP BY m.month_end
ORDER BY m.month_end;`,
    orderMatters: true,
    hint: "Make a little table of the four month-ends (UNION ALL works), then LEFT JOIN subscriptions with the active-on-that-day condition in ON, and sum monthly_price.",
    explain:
      "The condition lives in ON, not WHERE, so a month with no subscribers would still get a row of zeros. And Pro went from 4.99 to 5.99 for new subscribers on 1 October, so MRR has to add up what each row actually pays, not count times a price.",
    art: "piggy-repeat",
  },
  {
    id: "rolling-seven",
    title: "Rolling Seven",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dates", "CTE", "JOIN", "Moving average"],
    prompt:
      "Daily actives jump around with the game schedule, so dashboards show a rolling 7-day count instead: for each day, the distinct users active on that day or the six before it. Work it out for 1 to 7 December 2025.",
    returns: "day (YYYY-MM-DD), active_7d — in date order. Seven rows.",
    tables: ["events"],
    expected: `WITH days AS (
  SELECT DISTINCT date(event_time) AS day
  FROM events
  WHERE date(event_time) BETWEEN '2025-12-01' AND '2025-12-07'
)
SELECT d.day, COUNT(DISTINCT e.user_id) AS active_7d
FROM days d
JOIN events e
  ON date(e.event_time) BETWEEN date(d.day, '-6 days') AND d.day
GROUP BY d.day
ORDER BY d.day;`,
    orderMatters: true,
    hint: "List the seven days, then join each one to every event in its 7-day window (date(day, '-6 days') to day) and count distinct users per day.",
    explain:
      "A window frame (ROWS 6 PRECEDING) can roll up a sum, but not a distinct count: the same user active on Monday and Friday must count once. Joining each day to its window is how you get a rolling distinct.",
    art: "rolling-wheel",
  },
  {
    id: "kickoff-rush",
    title: "Kickoff Rush",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-06",
    tags: ["Dates", "strftime", "GROUP BY", "LIMIT"],
    prompt:
      "When do people set their lineups on a Sunday? Count the set_lineup events on Sundays (strftime('%w') is '0') by hour of the day, rows as logged, and find the three busiest hours.",
    returns: "hour (two digits, '00' to '23'), lineups — most first, then hour. Three rows.",
    tables: ["events"],
    expected: `SELECT strftime('%H', event_time) AS hour, COUNT(*) AS lineups
FROM events
WHERE event_name = 'set_lineup' AND strftime('%w', event_time) = '0'
GROUP BY hour
ORDER BY lineups DESC, hour
LIMIT 3;`,
    orderMatters: true,
    hint: "Two strftime calls: '%w' in WHERE to keep Sundays, '%H' to group by the hour.",
    explain:
      "strftime returns text, so compare it with '0', not 0. Noon is the rush before the early games kick off.",
    art: "kickoff-clock",
  },
  {
    id: "power-users",
    title: "Power Users",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-06",
    tags: ["HAVING", "Subquery", "Dates", "DISTINCT"],
    prompt:
      "Call someone a power user if they were active on at least 15 different days in November 2025. How many power users does Benchwarmer have?",
    returns: "power_users. One row.",
    tables: ["events"],
    expected: `SELECT COUNT(*) AS power_users
FROM (
  SELECT user_id
  FROM events
  WHERE event_time >= '2025-11-01' AND event_time < '2025-12-01'
  GROUP BY user_id
  HAVING COUNT(DISTINCT date(event_time)) >= 15
);`,
    orderMatters: true,
    hint: "Group November's events by user, keep users with HAVING COUNT(DISTINCT date(event_time)) >= 15, and count the users that are left in an outer query.",
    explain:
      "Active days, not events: COUNT(DISTINCT date(event_time)) counts each day once however much someone did on it. Counting the groups needs a second query around the first.",
    art: "power-battery",
  },
  // ── Batch 4: strings, EXISTS and dates (added 2026-10-06) ──────────
  //
  // Names are where two sources disagree: the box score writes "Ja'Marr
  // Chase", the play-by-play "J.Chase", and two different men can both be
  // "T.Hill". Plus NOT EXISTS for "never" questions, a correlated subquery
  // and a month that has to come from the schedule.
  {
    id: "initial-here",
    title: "Initial Here",
    difficulty: "easy",
    lang: "sql",
    added: "2026-10-07",
    tags: ["SUBSTR", "INSTR", "Strings"],
    prompt:
      "Play-by-play data doesn't write a player's full name, it writes the first initial, a full stop and the surname. Build that version of each of the twenty players' names: the first letter, a full stop, then everything after the first space.",
    returns: "player, pbp_name — player A–Z. Twenty rows, one per player.",
    tables: ["week_results"],
    expected: `SELECT DISTINCT player,
       SUBSTR(player, 1, 1) || '.' || SUBSTR(player, INSTR(player, ' ') + 1) AS pbp_name
FROM week_results
ORDER BY player;`,
    orderMatters: true,
    hint: "SUBSTR(text, start, length) cuts a piece out, INSTR(text, ' ') finds the first space, and || glues text together.",
    explain:
      "INSTR finds where the first name ends, and everything after it is the rest of the name however many words it has, so Amon-Ra St. Brown becomes A.St. Brown, exactly as the play-by-play writes him.",
    art: "name-initial",
  },
  {
    id: "two-t-hills",
    title: "Two T.Hills",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-07",
    tags: ["UNION", "Strings", "HAVING"],
    prompt:
      "Before you join two sources on a name you built, check the name is unique. Build each player's play-by-play name (first letter, a full stop, then everything after the first space) and find the ones that show up as a passer, rusher or receiver for more than one offense in the 2025 plays.",
    returns: "player, pbp_name, teams (how many different posteam values) — player A–Z. Two rows.",
    tables: ["week_results", "plays"],
    expected: `WITH cast_names AS (
  SELECT DISTINCT player,
         SUBSTR(player, 1, 1) || '.' || SUBSTR(player, INSTR(player, ' ') + 1) AS pbp_name
  FROM week_results
),
seen AS (
  SELECT passer AS name, posteam FROM plays WHERE passer IS NOT NULL
  UNION
  SELECT rusher, posteam FROM plays WHERE rusher IS NOT NULL
  UNION
  SELECT receiver, posteam FROM plays WHERE receiver IS NOT NULL
)
SELECT c.player, c.pbp_name, COUNT(DISTINCT s.posteam) AS teams
FROM cast_names c
JOIN seen s ON s.name = c.pbp_name
GROUP BY c.player, c.pbp_name
HAVING COUNT(DISTINCT s.posteam) > 1
ORDER BY c.player;`,
    orderMatters: true,
    hint: "Stack the three name columns into one list with UNION (each with its posteam), join the twenty built names to it, and keep the names with COUNT(DISTINCT posteam) > 1.",
    explain:
      "T.Hill is Tyreek Hill in Miami and Taysom Hill in New Orleans; B.Robinson is Bijan Robinson in Atlanta and Brian Robinson in San Francisco. Two people, one key, so a join on the name alone would hand Bijan another back's carries. (A trade would show up here too, which is just as worth knowing.)",
    art: "two-jerseys",
    // The title names him; Bijan, the other collision, is half the answer.
    players: ["Tyreek Hill"],
  },
  {
    id: "same-name-right-team",
    title: "Right Name, Right Team",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-07",
    tags: ["JOIN", "CTE", "Strings", "Conditional aggregation"],
    prompt:
      "Count each player's 2025 touches from the play-by-play without picking up a namesake. Match a play to a player only when his built name (first letter, a full stop, the rest of the name) is the rusher or the receiver AND the play's posteam and week match the team and week on his 2025 row in week_results. A carry is a run where he's the rusher; a target is a pass where he's the receiver.",
    returns: "player, carries, targets, touches (carries plus targets) — most touches first, then player A–Z. Ten rows.",
    tables: ["week_results", "plays"],
    expected: `WITH cast_weeks AS (
  SELECT player, team, week,
         SUBSTR(player, 1, 1) || '.' || SUBSTR(player, INSTR(player, ' ') + 1) AS pbp_name
  FROM week_results
  WHERE season = 2025
)
SELECT c.player,
       SUM(CASE WHEN p.rusher = c.pbp_name THEN 1 ELSE 0 END) AS carries,
       SUM(CASE WHEN p.receiver = c.pbp_name THEN 1 ELSE 0 END) AS targets,
       COUNT(*) AS touches
FROM cast_weeks c
JOIN plays p
  ON p.week = c.week
 AND p.posteam = c.team
 AND (p.rusher = c.pbp_name OR p.receiver = c.pbp_name)
WHERE p.play_type IN ('pass', 'run')
GROUP BY c.player
ORDER BY touches DESC, c.player
LIMIT 10;`,
    orderMatters: true,
    hint: "Build the name on each 2025 row of week_results (player, team, week), then join plays ON week, posteam = team, and the name matching rusher or receiver. SUM a CASE for carries and another for targets; COUNT(*) is touches.",
    explain:
      "The team and the week are what make the key unique. Bijan's 390 touches are all Atlanta's, while matching on the name alone gives him 494, over a hundred of them Brian Robinson's in San Francisco. A composite key is how you join two sources that never agreed on an id.",
    art: "composite-key",
  },
  {
    id: "never-below-ten",
    title: "Never Below Ten",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-07",
    tags: ["Subquery", "NOT EXISTS"],
    prompt:
      "In a must-win week a floor matters more than a ceiling. Which players went the whole 2024 season without a single game under 10 points?",
    returns: "player — A–Z. Four rows.",
    tables: ["week_results"],
    expected: `SELECT DISTINCT w.player
FROM week_results w
WHERE w.season = 2024
  AND NOT EXISTS (
    SELECT 1 FROM week_results x
    WHERE x.player = w.player AND x.season = 2024 AND x.fantasy_pts < 10
  )
ORDER BY w.player;`,
    orderMatters: true,
    hint: "Keep a player with 2024 games when NOT EXISTS finds a 2024 game of his under 10 points.",
    explain:
      "NOT EXISTS asks it the way it's worded: is there any game that breaks the rule? GROUP BY player HAVING MIN(fantasy_pts) >= 10 gets the same four, and both say 'every game' as 'no game below', which is easier to get right.",
    art: "floor-ten",
  },
  {
    id: "better-than-usual",
    title: "Better Than Usual",
    difficulty: "hard",
    lang: "sql",
    added: "2026-10-07",
    tags: ["Subquery", "Correlated subquery", "GROUP BY"],
    prompt:
      "Some averages rest on a few huge games. In 2024, count each player's games that beat his own 2024 average, and find the three players who did it most often.",
    returns: "player, games_above_own_avg — most first, then player A–Z. Three rows.",
    tables: ["week_results"],
    expected: `SELECT w.player, COUNT(*) AS games_above_own_avg
FROM week_results w
WHERE w.season = 2024
  AND w.fantasy_pts > (
    SELECT AVG(x.fantasy_pts) FROM week_results x
    WHERE x.player = w.player AND x.season = 2024
  )
GROUP BY w.player
ORDER BY games_above_own_avg DESC, w.player
LIMIT 3;`,
    orderMatters: true,
    hint: "A correlated subquery in WHERE works out the player's own average for each row: (SELECT AVG(x.fantasy_pts) FROM week_results x WHERE x.player = w.player AND x.season = 2024).",
    explain:
      "The subquery runs for each outer row with that row's player plugged in, which is exactly what 'his own average' means. AVG(fantasy_pts) OVER (PARTITION BY player) in a CTE does the same job as a window.",
    art: "above-usual",
  },
  {
    id: "names-that-break",
    title: "Names That Break",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-07",
    tags: ["LIKE", "REPLACE", "Strings"],
    prompt:
      "Names with an apostrophe, a full stop or a hyphen are the ones that break a match between two sources. List the players whose names have any of the three, and a clean version of each: lowercase, apostrophes and full stops removed, hyphens turned into spaces.",
    returns: "player, clean_name — player A–Z. Three rows.",
    tables: ["week_results"],
    expected: `SELECT DISTINCT player,
       LOWER(REPLACE(REPLACE(REPLACE(player, '''', ''), '.', ''), '-', ' ')) AS clean_name
FROM week_results
WHERE player LIKE '%''%' OR player LIKE '%.%' OR player LIKE '%-%'
ORDER BY player;`,
    orderMatters: true,
    hint: "Inside a SQL string, an apostrophe is written as two single quotes: LIKE '%''%'. Nest REPLACE three times, then wrap the lot in LOWER.",
    explain:
      "Doubling the quote is the bit that trips people up. Cleaning both sides the same way (lowercase, no punctuation) is the usual first move before matching names from two sources.",
    art: "torn-name",
  },
  {
    id: "september-stars",
    title: "September Stars",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-07",
    tags: ["JOIN", "Dates", "strftime"],
    prompt:
      "Who starts fast? week_results has no dates, but games does. For 2024, join each player's games to the schedule (same season and week, his team at home or away) and find the five best points-per-game in September.",
    returns: "player, september_ppg (1 decimal) — highest first, then player A–Z. Five rows.",
    tables: ["week_results", "games"],
    expected: `SELECT w.player, ROUND(AVG(w.fantasy_pts), 1) AS september_ppg
FROM week_results w
JOIN games g
  ON g.season = w.season
 AND g.week = w.week
 AND (g.home_team = w.team OR g.away_team = w.team)
WHERE w.season = 2024 AND strftime('%m', g.gameday) = '09'
GROUP BY w.player
ORDER BY september_ppg DESC, w.player
LIMIT 5;`,
    orderMatters: true,
    hint: "JOIN games ON season, week and (home_team = team OR away_team = team), then keep strftime('%m', gameday) = '09'.",
    explain:
      "A calendar month isn't an NFL week, so the date has to come from somewhere, here the schedule. strftime returns text, so the month is '09', not 9.",
    art: "september-page",
  },
  {
    id: "never-in-a-shootout",
    title: "Never in a Shootout",
    difficulty: "medium",
    lang: "sql",
    added: "2026-10-07",
    tags: ["Subquery", "NOT EXISTS", "JOIN"],
    prompt:
      "Call a game a shootout when the two teams scored 60 or more between them. Which players were never in one in 2024, in any game they played?",
    returns: "player — A–Z. Five rows.",
    tables: ["week_results", "games"],
    expected: `SELECT DISTINCT w.player
FROM week_results w
WHERE w.season = 2024
  AND NOT EXISTS (
    SELECT 1
    FROM week_results x
    JOIN games g
      ON g.season = x.season
     AND g.week = x.week
     AND (g.home_team = x.team OR g.away_team = x.team)
    WHERE x.player = w.player
      AND x.season = 2024
      AND g.home_score + g.away_score >= 60
  )
ORDER BY w.player;`,
    orderMatters: true,
    hint: "Inside NOT EXISTS, join the player's 2024 games to games (same season and week, his team home or away) and look for a combined score of 60 or more.",
    explain:
      "Some of these are about the schedule and some about health: Christian McCaffrey played four games in 2024, so he had few chances. A 'never' question is a NOT EXISTS question.",
    art: "no-shootout",
  },
];

export const QUESTION_COUNT = QUESTIONS.length;

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

/** Only the tables a question touches, so the schema panel stays short. */
export function schemaFor(q: Question) {
  return [...SCHEMA, ...EXTRA_SCHEMA].filter((t) => q.tables.includes(t.table));
}

// ── Question of the Day ────────────────────────────────────────
//
// Everyone gets the same question on the same day, and that day is the NFL's
// day — America/New_York — not the viewer's. Two reasons. A shared question is
// the thing you can argue about with someone in another timezone, and a
// server-rendered date has to agree with the client's or React hydration
// tears the card in half.
//
// **There is a daily per language, not one daily overall.** A single rotation
// across the whole bank would hand a SQL learner an R question on a Tuesday
// and break a streak they had done nothing to lose. So each language has its
// own rotation, and solving any of them counts for the day.
//
// The landing page and the dashboard both show the SQL one. That is not a
// judgement about SQL — it is that Python costs ~12 MB of Pyodide and R ~30 MB
// of WebR on first run, and a landing page does not get to spend that before
// anyone has asked for anything.

const MS_PER_DAY = 86_400_000;

// The day itself lives in lib/league-day.ts (small, so clients can import it).
export { leagueDay } from "@/lib/league-day";
import { leagueDay } from "@/lib/league-day";

/**
 * A stride co-prime with the pool size, so stepping by it visits every
 * question before repeating any. Near the golden ratio of the pool, which
 * keeps consecutive days far apart in the list rather than marching through
 * easy-to-hard in order.
 */
function dailyStride(n: number): number {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  for (let s = Math.max(1, Math.round(n * 0.618)); s < n + 1; s++) {
    if (gcd(s, n) === 1) return s;
  }
  return 1;
}

export function questionsIn(lang: QuestionLang): Question[] {
  return QUESTIONS.filter((q) => q.lang === lang);
}

/** The day's pick from a pool, walked by a co-prime stride (see dailyStride). */
function pickForDay(pool: Question[], day: string): Question {
  const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / MS_PER_DAY);
  const n = pool.length;
  const index = (((dayNumber * dailyStride(n)) % n) + n) % n;
  return pool[index];
}

export function questionOfTheDay(
  day: string = leagueDay(),
  lang: QuestionLang = "sql",
): Question {
  const pool = questionsIn(lang).filter((q) => !q.added || q.added <= day);
  // Never throws on an empty pool: a language with no questions yet falls
  // back to SQL rather than crashing a server render.
  if (pool.length === 0) return questionsIn("sql")[0];
  return pickForDay(pool, day);
}

/**
 * The home page's question, which is always an easy SQL one (decided
 * 2026-10-05). The daily runs easy to hard, and on about three days in four
 * it was a medium or a hard one: a visitor who clicked "90 seconds, no
 * signup" from the front page met a CTE with ROW_NUMBER and left.
 *
 * When today's SQL daily is easy, it is the daily (`isDaily`), so a visitor
 * who solves it has done the same question as everyone else that day.
 * Otherwise it's the day's pick from the easy SQL questions, walked the same
 * way, so everyone who lands on the home page still gets the same one. It is
 * free on its day once the Season Pass gate is on (lib/pass-gates.ts).
 */
export function frontDoorQuestion(day: string = leagueDay()): { question: Question; isDaily: boolean } {
  // League data only: the home page's panel boots the lesson database, and
  // a first visit should meet the football, not the practice store.
  const daily = questionOfTheDay(day, "sql");
  if (daily.difficulty === "easy" && isLeagueOnly(daily.tables)) return { question: daily, isDaily: true };
  const pool = questionsIn("sql").filter(
    (q) => q.difficulty === "easy" && isLeagueOnly(q.tables) && (!q.added || q.added <= day),
  );
  return { question: pickForDay(pool, day), isDaily: false };
}

/**
 * Is this the daily for its own language? Solving any language's daily
 * advances the same streak, which is the point of splitting them.
 */
export function isDailyQuestion(day: string, q: Question): boolean {
  return questionOfTheDay(day, q.lang).id === q.id;
}
