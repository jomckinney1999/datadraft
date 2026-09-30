/**
 * The question bank — LeetCode for football data.
 *
 * A question is a standalone problem: a situation, a table or two, and a
 * result you have to produce. No lesson around it, no drive to lose, no
 * timeout spent. You can solve one on a bus.
 *
 * Every question runs against the same pinned database the lessons use
 * (`lib/fantasy-data.ts`), which is real nflverse weekly scoring, 2022–2024.
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

import { SCHEMA } from "@/lib/fantasy-data";

export type QuestionDifficulty = "easy" | "medium" | "hard";

/**
 * Which runtime grades this question.
 *
 * `sql` and `excel` run locally with no download. `python` pulls ~12 MB of
 * Pyodide and `r` ~30 MB of WebR, on first use only — which is why the
 * landing page's Question of the Day is pinned to SQL.
 */
export type QuestionLang = "sql" | "python" | "r" | "excel";

/** Which drawn scene sits on the card. See components/question-art.tsx. */
export type QuestionArt =
  | "trophy"
  | "scoreboard"
  | "clipboard"
  | "stopwatch"
  | "routes"
  | "weather"
  | "depth"
  | "heat";

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

export const LANG_LABEL: Record<QuestionLang, string> = {
  sql: "SQL",
  python: "Python",
  r: "R",
  excel: "Excel",
};

/** Shown before a cold start, so a 30 MB download is never a surprise. */
export const LANG_WEIGHT: Partial<Record<QuestionLang, string>> = {
  python: "~12 MB first run",
  r: "~30 MB first run",
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

export const DIFFICULTY_XP: Record<QuestionDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
};

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
    art: "trophy",
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
    art: "clipboard",
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
    art: "heat",
  },
  {
    id: "games-actually-played",
    players: ["Christian McCaffrey", "Jahmyr Gibbs"],
    title: "Games Actually Played",
    difficulty: "easy",
    lang: "sql",
    tags: ["COUNT", "GROUP BY"],
    prompt:
      "Three seasons is 50-odd games if you never miss one. Nobody does. Count how many games each running back actually shows up for across the whole table.",
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
      "A missed game is an absent row, not a zero — which is exactly why COUNT(*) is the injury story. Christian McCaffrey comes back with 37, not 50.",
    art: "depth",
  },
  {
    id: "rough-afternoon",
    title: "Rough Afternoon",
    difficulty: "easy",
    lang: "sql",
    tags: ["ORDER BY", "LIMIT"],
    prompt:
      "Somebody started these guys. Find the five worst single-game scores in the table.",
    returns: "player, season, week, fantasy_pts — worst first.",
    tables: ["week_results"],
    expected: `SELECT player, season, week, fantasy_pts
FROM week_results
ORDER BY fantasy_pts ASC
LIMIT 5;`,
    orderMatters: true,
    hint: "Same shape as finding the best — just sort the other way.",
    explain:
      "ASC and DESC are the whole difference between a leaderboard and a blooper reel. ASC is the default, so writing it out is a favour to whoever reads the query next.",
    art: "scoreboard",
  },
  {
    id: "whos-on-my-team",
    players: ["Josh Allen", "Travis Kelce"],
    title: "Who's On My Team",
    difficulty: "easy",
    lang: "sql",
    tags: ["JOIN"],
    prompt:
      "The rosters table says who owns whom in an example 5-team league. Pull the Blitz Brothers roster with each player's real NFL team and position.",
    returns: "player, team, position — one row per rostered player, player A–Z.",
    tables: ["rosters", "week_results"],
    expected: `SELECT DISTINCT r.player, w.team, w.position
FROM rosters r
JOIN week_results w ON w.player = r.player
WHERE r.team_name = 'Blitz Brothers'
ORDER BY r.player;`,
    orderMatters: true,
    hint: "week_results has a row per game, so joining straight to it repeats each player. DISTINCT tidies that up.",
    explain:
      "Joining a one-row-per-thing table to a many-rows-per-thing table gives you the many. That is usually a bug, and DISTINCT is the quickest tell that you have hit it.",
    art: "clipboard",
  },
  {
    id: "waiver-risers",
    title: "Waiver Risers",
    difficulty: "easy",
    lang: "sql",
    tags: ["WHERE", "ORDER BY"],
    prompt:
      "The waiver table tracks how many leagues have each player rostered and which way that number is moving. Find the players trending up.",
    returns: "player, position, pct_rostered, trend — biggest riser first.",
    tables: ["waiver_wire"],
    expected: `SELECT player, position, pct_rostered, trend
FROM waiver_wire
WHERE trend > 0
ORDER BY trend DESC;`,
    orderMatters: true,
    hint: "Trending up means a trend above zero.",
    explain:
      "waiver_wire is an invented example league, not NFL fact — who owns a player is private to one league. The /data page marks which tables are real and which are examples.",
    art: "routes",
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
    art: "scoreboard",
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
    art: "weather",
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
    art: "depth",
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
    art: "trophy",
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
    art: "heat",
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
    art: "scoreboard",
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
    art: "routes",
  },
  {
    id: "league-standings",
    players: ["Josh Allen", "Travis Kelce", "Patrick Mahomes"],
    title: "League Standings",
    difficulty: "medium",
    lang: "sql",
    tags: ["JOIN", "SUM", "GROUP BY"],
    prompt:
      "Five teams, two players each, one season. Add up what each example-league team's roster scored in 2024 and post the standings.",
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
    art: "trophy",
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
    art: "weather",
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
    art: "depth",
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
    art: "trophy",
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
    art: "routes",
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
    art: "clipboard",
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
    art: "depth",
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
    art: "heat",
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
    art: "heat",
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
    art: "scoreboard",
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
    art: "trophy",
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
    art: "depth",
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
    art: "clipboard",
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
    art: "heat",
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
    art: "trophy",
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
    art: "depth",
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
    art: "stopwatch",
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
    art: "heat",
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
    art: "scoreboard",
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
    art: "clipboard",
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
    art: "routes",
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
    art: "trophy",
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
    art: "routes",
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
    art: "depth",
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
    art: "scoreboard",
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
    art: "clipboard",
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
    art: "trophy",
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
    art: "routes",
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
    art: "stopwatch",
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
    art: "trophy",
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
    art: "weather",
  },
];

export const QUESTION_COUNT = QUESTIONS.length;

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

/** Only the tables a question touches, so the schema panel stays short. */
export function schemaFor(q: Question) {
  return SCHEMA.filter((t) => q.tables.includes(t.table));
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

const LEAGUE_TZ = "America/New_York";
const MS_PER_DAY = 86_400_000;

/** Today's date in the league's timezone, as YYYY-MM-DD. */
export function leagueDay(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, which saves reassembling the parts by hand.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LEAGUE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

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

export function questionOfTheDay(
  day: string = leagueDay(),
  lang: QuestionLang = "sql",
): Question {
  const pool = questionsIn(lang);
  // Never throws on an empty pool: a language with no questions yet falls
  // back to SQL rather than crashing a server render.
  if (pool.length === 0) return questionsIn("sql")[0];
  const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / MS_PER_DAY);
  const n = pool.length;
  const index = (((dayNumber * dailyStride(n)) % n) + n) % n;
  return pool[index];
}

/**
 * Is this the daily for its own language? Solving any language's daily
 * advances the same streak, which is the point of splitting them.
 */
export function isDailyQuestion(day: string, q: Question): boolean {
  return questionOfTheDay(day, q.lang).id === q.id;
}
