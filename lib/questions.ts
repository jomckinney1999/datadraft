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

import { SCHEMA } from "@/lib/fantasy-data";
import { FACTS } from "@/lib/lesson-facts.generated";

export type QuestionDifficulty = "easy" | "medium" | "hard";

/**
 * Which runtime grades this question.
 *
 * `sql` and `excel` run locally with no download. `python` pulls ~12 MB of
 * Pyodide and `r` ~30 MB of WebR, on first use only — which is why the
 * landing page's Question of the Day is pinned to SQL.
 */
export type QuestionLang = "sql" | "python" | "r" | "excel";

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
  | "spirit-level";

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
  const pool = questionsIn(lang).filter((q) => !q.added || q.added <= day);
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
