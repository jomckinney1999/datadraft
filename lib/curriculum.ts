// Course content for the gamified /learn MVP.
// Units 1–4 (SQL) mirror docs/CURRICULUM.md phases: Select & Filter → Sorting
// → Aggregations, with Joins and Window Functions visible as coming-soon.
// Units 7–11 cover the non-SQL half of the promise on the landing page:
// Python, statistics, visualization, Git, and R.
//
// Exercise types:
//   `query` — SQL-only; compares result sets in sql.js (lib/fantasy-data.ts).
//   `code`  — live Python / R / SQL via lib/runtimes.ts (Pyodide / WebR /
//             sql.js); grades by comparing printed output.
//   `mc` / `fill` — plain JS; used for concepts (and still fine for any lang).
// Modules (MODULES below) let learners take SQL, Python, R, etc. on their own
// or follow the all-in-one pathway.

import { FINAL_UNITS } from "./finals";
// Redesigned Foundations modules (docs/SQL-REDESIGN.md). Kept in their own
// file so the rewrite can land module by module without churning this one.
import { SQL_FOUNDATION_UNITS } from "./curriculum-foundations";
import { SQL_MORE_UNITS } from "./curriculum-sql-more";
import { SQL_NEXT_UNITS } from "./curriculum-sql-next";
import {
  ANALYTICS_UNIT_IDS,
  FOUNDATIONS_UNIT_IDS,
  SQL_SHELLS,
} from "./sql-outline";

export type MCExercise = {
  type: "mc";
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
};

export type FillExercise = {
  type: "fill";
  prompt: string;
  // Code rendered in order (SQL, Python, R, or shell); null marks a blank the
  // learner fills from the bank. Graded by exact token match in JS — no engine
  // involved, which is why non-SQL units can use this type but not `query`.
  parts: (string | null)[];
  bank: string[];
  answer: string[];
  explain: string;
};

export type QueryExercise = {
  type: "query";
  prompt: string;
  starter: string;
  expected: string;
  // false = row order doesn't matter when grading (no ORDER BY required)
  orderMatters: boolean;
  hint: string;
  explain: string;
};

/**
 * Live-coding exercise for any language. The learner's code and the reference
 * solution both run in the real runtime (Pyodide / WebR / sql.js) and their
 * printed output is compared — so the learner must print the answer, same as
 * they would in a real console.
 *
 * `query` (SQL-only, compares result sets) still exists and is the better fit
 * for pure SELECT drills. Use `code` when the point is writing and running a
 * program rather than shaping a result set.
 */
export type CodeExercise = {
  type: "code";
  lang: "python" | "r" | "sql";
  prompt: string;
  starter: string;
  /** Reference solution, executed in the same runtime to produce the target output. */
  expected: string;
  hint: string;
  explain: string;
};

/**
 * Live Excel formula exercise, graded on the value it produces.
 *
 * The learner writes a real formula against the real workbook
 * (lib/excel-data.ts) and it is evaluated by lib/excel-engine.ts — the same
 * "run it for real" contract the SQL and Python courses use, rather than
 * string-matching formula text (which would fail `=SUM(E2:E17)` against
 * `=SUM(E2:E17) ` and reject every equivalent-but-different correct answer).
 *
 * `sheet` picks which tab the grid shows and which sheet bare references
 * resolve against; it defaults to Roster. Cross-sheet references
 * (`Import!A2`) work regardless and are taught on purpose.
 */
export type FormulaExercise = {
  type: "formula";
  prompt: string;
  starter: string;
  /** Reference formula, evaluated against the same grid to get the target value. */
  expected: string;
  sheet?: string;
  /**
   * Set when the answer is a literal that legitimately references no cell
   * (there is only one such drill: typing a value into a cell). Everywhere
   * else a hardcoded number is rejected even when it equals the right answer,
   * because reading it off the screen isn't the skill being taught.
   */
  allowLiteral?: boolean;
  hint: string;
  explain: string;
};

export type Exercise =
  | MCExercise
  | FillExercise
  | QueryExercise
  | CodeExercise
  | FormulaExercise;

export type TheoryCard = { title: string; text: string; code?: string };

/**
 * The grounding step shown before the first drill.
 *
 * `goal` is what you'll be able to do; `setup` is the minimum context needed to
 * attempt drill #1. `previewSql` (SQL units only) runs live against the seeded
 * database so the learner literally sees the rows before being asked about
 * them — reading real data is the whole point of the lesson.
 */
/**
 * One beat of the brief, shown on its own before the next one appears.
 *
 * The brief used to be a single `setup` paragraph. On lesson 1 that meant a
 * beginner's first contact with the product was a dense block opening "A
 * database is a set of tables" — a definition, not an on-ramp. Splitting it
 * into steps lets a lesson introduce one idea at a time and lets the learner
 * set the pace, which is the whole point of an intro.
 */
export type BriefStep = {
  /** Short headline for the beat. */
  title: string;
  body: string;
  /** Optional illustration — a snippet, a shape, a worked example. */
  code?: string;
  /** Optional aside, rendered as a quiet callout under the body. */
  note?: string;
  /**
   * Show the thing this beat is talking about, right underneath it.
   *
   * Naming a table and not showing it asks the learner to hold a picture in
   * their head that they have never actually seen. A beat that mentions
   * week_results should be able to put week_results on the screen.
   */
  previewSql?: string;
  /** Excel equivalent — which workbook tab this beat is referring to. */
  previewSheet?: string;
  /** Caption for whichever preview the beat shows. */
  previewCaption?: string;
};

export type LessonBrief = {
  goal: string;
  /**
   * Fallback one-paragraph setup, used when `steps` is absent.
   * Prefer `steps` for anything a beginner meets early.
   */
  setup: string;
  /** Paced walk-in. When present the player shows these before the preview. */
  steps?: BriefStep[];
  previewSql?: string;
  /** Excel units: which workbook tab to show in the brief. Same job as previewSql. */
  previewSheet?: string;
  previewCaption?: string;
};

export type Lesson = {
  id: string;
  title: string;
  blurb: string;
  /** Grounding step before drilling. See LessonBrief. */
  brief: LessonBrief;
  intro: TheoryCard;
  /** Extra chalkboard cards after `intro` (deeper examples). */
  film?: TheoryCard[];
  exercises: Exercise[];
};

export type Unit = {
  id: string;
  number: number;
  title: string;
  drive: string;
  description: string;
  skills: string[];
  status: "live" | "coming-soon";
  lessons: Lesson[];
};

export const COURSE = {
  title: "Analyst Fundamentals",
  tagline:
    "SQL first, then Python, stats, charts, Git, and R — the skills on a data analyst job post, one short lesson at a time.",
  units: [
    {
      id: "u1",
      number: 1,
      title: "Read the Stat Sheet",
      drive: "1st Drive · Own 20",
      description:
        "What this course is, what SQL is, then the sheet you'll practice on.",
      skills: ["SELECT", "FROM", "LIMIT"],
      status: "live",
      lessons: [
        {
          id: "u1-l1",
          title: "Meet the Stat Sheet",
          blurb: "What this course is, then the list of games you'll practice on.",
          brief: {
            goal: "Know what you're learning, and what the list of games in front of you is.",
          steps: [
            {
              title: "What you're here to do",
              body: "You picked a job that works with information. This course teaches you to ask that information a question, instead of scrolling a giant list by hand. We practice on football games because a game is easy to picture. You don't have to follow the sport.",
            },
            {
              title: "What to expect",
              body: "Lessons are a few minutes each. You read a little, then you type the question yourself. If you miss, you see the right answer and why, and you can try again. Nothing to install. No account. Your progress stays in this browser.",
            },
            {
              title: "Where this course sits",
              body: "This is the first course on every job path, including Data Analyst. The tool is called SQL. You use it to pull information out of a list. Courses after this one, like Excel and Python, start from information you can already pull.",
            },
            {
              title: "Picture a printed list",
              body: "Imagine a page of football games. Across the top are labels: who played, which team, what position, which year, which week, how many points. Down the page, each line is one player's one game. That whole page is the sheet this course uses.",
            },
            {
              title: "A line on that page has a name",
              body: "One line is called a row. It is one player in one game, not their whole career. The labels across the top are called columns. The whole sheet is called a table. We'll use those three words from here on, and they mean exactly that.",
            },
            {
              title: "This sheet is real games",
              body: "The sheet is named week_results. It holds games that were actually played, from 2022 through 2024, for 20 well-known players. Read the one line below. Left to right: the player, their team, position, year, week, and points.",
              previewSql: "SELECT * FROM week_results LIMIT 1;",
              previewCaption: "One line from the game sheet. That line is one row.",
            },
            {
              title: "How you ask the sheet a question",
              body: "SQL is the wording you type. SELECT means show me. FROM names which sheet. A star means every label across the top. The line below means: show me the game sheet, and stop after five lines so we can look.",
              code: "SELECT * FROM week_results LIMIT 5;",
              previewSql: "SELECT * FROM week_results LIMIT 5;",
              previewCaption: "Five games from week_results",
            },
            {
              title: "Two other sheets are made up",
              body: "week_results is real. The other two are an example fantasy league we wrote so you have people and free agents to combine later. rosters says which made-up team owns a player. waiver_wire is players nobody in that example league has picked. Who owns a player is not an NFL fact.",
              previewSql: "SELECT * FROM rosters;",
              previewCaption: "rosters · the example league, five of its lines",
            },
          ],
          setup:
            "This course teaches you to ask a list of real football games a question. One line on that list is one player in one game. That line is a row. The whole list is a sheet named week_results.",
            previewSql: "SELECT * FROM week_results LIMIT 5;",
            previewCaption: "week_results · first 5 rows",
          },
          intro: {
            title: "One row is one game",
            text: "week_results is that sheet: player, team, position, season, week, points. SELECT * reads every column. You'll name the columns yourself in the next module.",
            code: "SELECT * FROM week_results LIMIT 5;",
          },
          film: [
            {
              title: "Why not just scroll a spreadsheet?",
              text: "Finding “who scored most in week 3 of 2023” by hand is miserable. A database lets you ask that in one line. SQL is how you ask.",
            },
            {
              title: "A table is a grid you already know",
              text: "Rows and columns — same as a spreadsheet tab. A database is a few of those tabs living together.",
            },
            {
              title: "Row = record. Column = field.",
              text: "One row of week_results is one player's week. One column like fantasy_pts is that category on every row. Pros say row/record and column/field — both are fine.",
              code: "player          week   fantasy_pts   <- fields (columns)\n--------------------------------------\nJosh Allen      1      31.2          <- one record (row)\nJosh Allen      2      9.8           <- another record",
            },
            {
              title: "SELECT = what. FROM = where.",
              text: "SELECT lists the columns you want. FROM names the table. A star after SELECT means “every column.”",
              code: "SELECT *            -- every column, please\nFROM week_results   -- from this table",
            },
            {
              title: "End with a semicolon",
              text: "A semicolon tells SQL “this query is done.” Build the habit now — you'll need it when you run more than one query.",
              code: "SELECT * FROM week_results;\n--                          ^ the full stop",
            },
            {
              title: "Three tables, three jobs",
              text: "week_results = game log. rosters = who owns whom. waiver_wire = free agents. Before you write SQL, always ask: what does one row mean? Pros call that the grain.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You're handed a table you've never seen. What should you figure out first?",
              options: [
                "How many rows does it have?",
                "What does one row represent?",
                "Which columns are numbers?",
                "Who built it?",
              ],
              answer: 1,
              explain:
                "What one row means is the grain. Get it wrong and every COUNT is counting the wrong thing.",
            },
            {
              type: "mc",
              prompt: "One row in week_results represents…",
              options: [
                "One player's points in one week of one season",
                "A player's whole career",
                "A team's full season",
                "One column of stats",
              ],
              answer: 0,
              explain:
                "That's the grain: one row per player-week. Pros check this before anything else.",
            },
            {
              type: "fill",
              prompt:
                "Grab every column and every row from the weekly stat sheet.",
              parts: ["SELECT ", null, " FROM ", null, ";"],
              bank: ["*", "week_results", "everything", "rosters"],
              answer: ["*", "week_results"],
              explain:
                "* means every column. SELECT * FROM week_results returns the whole table.",
            },
            {
              type: "query",
              prompt:
                "Pull the entire waiver wire — every column, every row.",
              starter: "SELECT ",
              expected: "SELECT * FROM waiver_wire;",
              orderMatters: false,
              hint: "SELECT * FROM table_name; — the table is called waiver_wire.",
              explain:
                "SELECT * FROM waiver_wire; reads the whole free-agent board. Five rows — a quick look.",
            },
            {
              type: "query",
              prompt:
                "Same idea for rosters: every column, every row.",
              starter: "SELECT ",
              expected: "SELECT * FROM rosters;",
              orderMatters: false,
              hint: "Same shape as the last one — SELECT * FROM rosters;",
              explain:
                "Three tables, one pattern. Once SELECT * FROM <table> sticks, everything else builds on it.",
            },
            {
              type: "mc",
              prompt: "You run this. What comes back?",
              code: "SELECT * FROM rosters;",
              options: [
                "Every column and every row of rosters",
                "Only the first row",
                "Just the column names",
                "Every table in the database",
              ],
              answer: 0,
              explain:
                "SELECT * with nothing else returns the full table — all columns, all rows.",
            },
          ],
        },
        {
          id: "u1-l2",
          title: "Pick Your Columns",
          blurb: "Select only the columns you need.",
          brief: {
            goal: "Pull only the columns you actually need.",
      steps: [
        {
          title: "Everything at once gets noisy",
          body: "SELECT * is fine on a small sheet. Real tables are wide — thirty columns, sometimes hundreds. Ask for everything and the answer gets buried. You end up scrolling sideways for one number.",
        },
        {
          title: "Name the columns you want",
          body: "Skip the star. List the columns, separated by commas. Same rows — way less to read.",
          code: "SELECT player, fantasy_pts FROM week_results;",
          note: "Order matters. List fantasy_pts first and it shows up first. You shape the answer — not the table.",
        },
      ],
            setup:
              "SELECT * dumps everything. Naming columns keeps the answer clean. Same rows, fewer columns.",
            previewSql: "SELECT player, position, fantasy_pts FROM week_results LIMIT 5;",
            previewCaption: "three columns instead of six",
          },
          intro: {
            title: "Ask for what you need",
            text: "List column names after SELECT, separated by commas. You get only those — in the order you wrote them.",
            code: "SELECT player, team FROM week_results;",
          },
          film: [
            {
              title: "Commas between column names",
              text: "After SELECT, list the columns you want with commas between them. Miss a comma and SQL gets confused — so skim the list before you run it.",
              code: "SELECT player, team\nFROM week_results;",
            },
            {
              title: "Your order wins",
              text: "The table has its own column order. Your SELECT list overrides it. Put fantasy_pts before player and that's how they come back.",
              code: "SELECT fantasy_pts, player\nFROM week_results; -- points first, name second",
            },
            {
              title: "Rename with AS",
              text: "AS gives a column a friendlier name in the results — without changing the table. fantasy_pts can show up as points.",
              code: "SELECT player AS name, fantasy_pts AS points\nFROM week_results;",
            },
            {
              title: "SELECT can do math too",
              text: "You're not stuck with column names. Try fantasy_pts * 2 — SQL runs it once per row and returns a new column.",
              code: "SELECT player, fantasy_pts, fantasy_pts * 2 AS double_pts\nFROM week_results;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You only want each player's name and team from week_results. Which query?",
              options: [
                "SELECT player, team FROM week_results;",
                "SELECT * FROM week_results;",
                "SELECT player team FROM week_results;",
                "SELECT FROM week_results player, team;",
              ],
              answer: 0,
              explain:
                "Name the columns after SELECT, commas between them. Skip the comma and SQL treats `team` as a nickname for `player`.",
            },
            {
              type: "fill",
              prompt:
                "Pull the player's name and how widely they're rostered.",
              parts: ["SELECT ", null, ", ", null, " FROM waiver_wire;"],
              bank: ["player", "pct_rostered", "rosters", "*"],
              answer: ["player", "pct_rostered"],
              explain:
                "Columns by name, comma-separated. pct_rostered is the percent of leagues where that player is taken.",
            },
            {
              type: "query",
              prompt:
                "From waiver_wire, pull just player and position.",
              starter: "SELECT ",
              expected: "SELECT player, position FROM waiver_wire;",
              orderMatters: false,
              hint: "Two column names after SELECT, separated by a comma.",
              explain:
                "Fewer columns = easier to read — and faster on real databases.",
            },
            {
              type: "mc",
              prompt:
                "You ask for three columns and they come back in a different order than the table stores them. What happened?",
              options: [
                "The database sorted them alphabetically",
                "You got the order you asked for — the query decides",
                "The table definition changed",
                "Nothing — column order is random",
              ],
              answer: 1,
              explain:
                "The SELECT list describes the result you want. The order you name columns is the order you get them.",
            },
            {
              type: "query",
              prompt:
                "From rosters, show team_name and player.",
              starter: "SELECT ",
              expected: "SELECT team_name, player FROM rosters;",
              orderMatters: false,
              hint: "The table is rosters; the columns are team_name and player.",
              explain:
                "Ten rows, five fantasy teams, two starters each. You'll join this to the scoring log later.",
            },
          ],
        },
        {
          id: "u1-l3",
          title: "Just a Quick Look",
          blurb: "LIMIT: peek without loading the whole table.",
          brief: {
            goal: "Cap how many rows come back with LIMIT.",
      steps: [
        {
          title: "You don't need every row",
          body: "week_results has 876 rows — and that's small. Real tables hit millions. Nobody opens a table by reading all of it. You peek at a handful, then ask a real question.",
        },
        {
          title: "LIMIT stops early",
          body: "Put LIMIT and a number at the end. The database stops once it has that many rows. It's the first thing most people type on a new table.",
          code: "SELECT * FROM week_results LIMIT 3;",
          note: "LIMIT goes last. It's about how much you get back — so it's the final word.",
        },
      ],
            setup:
              "Real tables can be huge. LIMIT gives you a quick peek — usually the first thing you type on a new table. This one returns 3 rows.",
            previewSql: "SELECT player, week, fantasy_pts FROM week_results LIMIT 3;",
            previewCaption: "LIMIT 3 · a quick peek",
          },
          intro: {
            title: "Peek with LIMIT",
            text: "week_results has 876 rows. Want a feel for the data? Add LIMIT n at the very end to cap how many rows come back.",
            code: "SELECT * FROM week_results LIMIT 10;",
          },
          film: [
            {
              title: "First move on a new table",
              text: "Try SELECT * … LIMIT 10. You see the columns and typical values without hauling millions of rows.",
              code: "-- opening move on any new table\nSELECT * FROM rosters LIMIT 10;",
            },
            {
              title: "LIMIT cuts rows, not columns",
              text: "SELECT * … LIMIT 3 still returns every column — just three rows. Want fewer columns? That's your SELECT list, not LIMIT.",
              code: "SELECT * FROM week_results LIMIT 3; -- every column, only 3 rows",
            },
            {
              title: "LIMIT isn't “the best”",
              text: "LIMIT 5 grabs the first 5 rows the database hands back — not the top scorers. Sorting comes next with ORDER BY. For now: LIMIT alone never means “best.”",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You open a table with millions of rows. What do you run first?",
              options: [
                "SELECT * with no limit, then scroll",
                "SELECT * with a small LIMIT",
                "A COUNT of every row",
                "Nothing until someone sends you the docs",
              ],
              answer: 1,
              explain:
                "A small LIMIT is a free look at the shape. Pulling millions of rows to glance at five is slow — and rude on a shared database.",
            },
            {
              type: "fill",
              prompt: "Stop after 10 rows.",
              parts: ["SELECT * FROM week_results ", null, " ", null, ";"],
              bank: ["LIMIT", "10", "CAP", "TEN"],
              answer: ["LIMIT", "10"],
              explain: "LIMIT 10 — the keyword, then the number.",
            },
            {
              type: "query",
              prompt:
                "Grab player and fantasy_pts from week_results — but only the first 5 rows.",
              starter: "SELECT ",
              expected: "SELECT player, fantasy_pts FROM week_results LIMIT 5;",
              orderMatters: true,
              hint: "Two columns, then LIMIT 5 at the end.",
              explain:
                "LIMIT goes after FROM (and any other clauses). Always last.",
            },
            {
              type: "mc",
              prompt: "Where does LIMIT go in a query?",
              options: [
                "At the very end",
                "Right after SELECT",
                "Before FROM",
                "Anywhere you like",
              ],
              answer: 0,
              explain:
                "LIMIT is always last. SQL clauses have a fixed order.",
            },
            {
              type: "query",
              prompt: "Show the first 3 rows of rosters — every column.",
              starter: "SELECT ",
              expected: "SELECT * FROM rosters LIMIT 3;",
              orderMatters: true,
              hint: "SELECT * plus LIMIT 3.",
              explain:
                "Heads up: without ORDER BY, “first 3” just means whatever the database reaches first — not the best 3.",
            },
          ],
        },
      ],
    },
    {
      id: "u2",
      number: 2,
      title: "Filter with WHERE",
      drive: "2nd Drive · Own 40",
      description:
        "You rarely want every row. WHERE keeps the ones that pass a test.",
      skills: ["WHERE", "= > <", "AND / OR", "IN", "BETWEEN"],
      status: "live",
      lessons: [
        {
          id: "u2-l1",
          title: "One Player",
          blurb: "WHERE + equals. Text needs quotes.",
          brief: {
            goal: "Keep only the rows you care about with WHERE.",
          steps: [
            {
              title: "You don't want all 876 games",
              body: "You want Josh Allen's. The rest of the sheet is noise until you say so.",
            },
            {
              title: "WHERE keeps the rows that pass",
              body: "It sits after the table name. Text goes in single quotes. Numbers don't. One equals sign, not two.",
              code: "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE player = 'Josh Allen';",
              previewSql: "SELECT player, week, fantasy_pts FROM week_results WHERE player = 'Josh Allen' LIMIT 5;",
              previewCaption: "Just Josh Allen",
            },
          ],
          setup:
            "WHERE player = 'Josh Allen' throws out every other name. Quotes around text. No quotes around a number.",
            previewSql: "SELECT player, week, fantasy_pts FROM week_results WHERE player = 'Josh Allen' LIMIT 5;",
            previewCaption: "WHERE player = 'Josh Allen'",
          },
          intro: {
            title: "WHERE is the test on each row",
            text: "Put it after FROM. 'Josh Allen' needs quotes. week = 5 doesn't. Miss the quotes and SQL looks for a column named Josh.",
            code: "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE player = 'Josh Allen';",
          },
          film: [
            {
              title: "Text needs quotes, numbers don't",
              text: "Quote text like 'Josh Allen'; skip the quotes and SQL looks for a column named Josh. Numbers stay bare (week = 5), and spelling plus caps must match the data exactly.",
              code: "WHERE player = 'Josh Allen'  -- text: quoted, exact\nWHERE week = 5               -- number: bare",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You need one player's games out of a huge table. You could pull everything and scroll, or filter in the query. Beyond convenience, why does filtering matter?",
              options: [
                "It makes the query easier to read",
                "The database does the work and sends back only what you asked for",
                "Filtered queries are always more accurate",
                "It permanently removes the other rows",
              ],
              answer: 1,
              explain:
                "The database filters where the data lives, so you only get the rows you asked for — not a million you throw away.",
            },
            {
              type: "fill",
              prompt:
                "Pull Josh Allen's full game log. Text values need single quotes.",
              parts: [
                "SELECT * FROM week_results\nWHERE ",
                null,
                " = ",
                null,
                ";",
              ],
              bank: ["player", "'Josh Allen'", "Josh Allen", "week"],
              answer: ["player", "'Josh Allen'"],
              explain:
                "Without quotes, SQL reads Josh Allen as column names and errors. Text always gets single quotes.",
            },
            {
              type: "mc",
              prompt: "Why does the first query fail while the second works?",
              code: "WHERE team = MIA    -- ✗ error\nWHERE team = 'MIA'  -- ✓ works",
              options: [
                "Text values must be in single quotes",
                "MIA isn't a real team",
                "WHERE needs parentheses",
                "The second has a typo",
              ],
              answer: 0,
              explain:
                "Bare MIA looks like a column name. Quoted 'MIA' is a text value.",
            },
            {
              type: "query",
              prompt:
                "Pull every column of Patrick Mahomes' game log from week_results.",
              starter: "SELECT * FROM week_results\nWHERE ",
              expected:
                "SELECT * FROM week_results WHERE player = 'Patrick Mahomes';",
              orderMatters: false,
              hint: "WHERE player = '…' — mind the quotes and spelling.",
              explain:
                "One filter took you from 876 rows down to every game Mahomes played.",
            },
            {
              type: "query",
              prompt:
                "From the waiver wire, keep only running backs — rows where position is 'RB'. All columns.",
              starter: "SELECT * FROM waiver_wire\nWHERE ",
              expected: "SELECT * FROM waiver_wire WHERE position = 'RB';",
              orderMatters: false,
              hint: "position = 'RB' — text value, single quotes.",
              explain:
                "Same pattern works for any column: team = 'BUF', week = 1, and so on.",
            },
          ],
        },
        {
          id: "u2-l2",
          title: "Compare and Combine",
          blurb: ">, <, and AND: thresholds and combos.",
          brief: {
            goal: "Filter on numbers and combine tests with AND.",
      steps: [
        {
          title: "Equals only gets you so far",
          body: "You can already pull every game one player played. Most real questions aren't exact matches — they're thresholds. Big games. Quiet games. Anything over a number. For those you compare, not match.",
        },
        {
          title: "Compare with the usual symbols",
          body: "Greater than, less than, and their or-equal cousins work how they look. Numbers go in bare — no quotes — because you're comparing quantities, not matching text.",
          code: "WHERE fantasy_pts > 25",
          note: "Pick thresholds from the data, not a hunch. Nothing here clears 30 in a game, so 25 is what a big afternoon looks like.",
        },
        {
          title: "AND means both must be true",
          body: "Chain two tests with AND and a row only survives if it passes both. Big game, this season — one line instead of two queries you compare by eye.",
          code: "WHERE fantasy_pts > 25 AND season = 2024",
        },
      ],
            setup:
              "Beyond equals you get >, <, >=, <=. AND needs both sides true — how you say “big game, this season” in one line. Nothing here clears 30, so 25 is a real big game.",
            previewSql:
              "SELECT player, season, week, fantasy_pts FROM week_results WHERE fantasy_pts > 25 ORDER BY fantasy_pts DESC LIMIT 5;",
            previewCaption: "only rows scoring over 25",
          },
          intro: {
            title: "Numbers and AND",
            text: "Numbers compare with > < >= <= — no quotes. Chain tests with AND when every one must pass.",
            code: "SELECT * FROM week_results\nWHERE season = 2024\n  AND fantasy_pts > 20;",
          },
          film: [
            {
              title: "AND, OR, and parentheses",
              text: "AND binds tighter than OR — like math order of operations. Without parentheses, season = 2024 AND week = 1 OR week = 2 returns every week-2 row from every season.",
              code: "-- what you meant:\nWHERE season = 2024 AND (week = 1 OR week = 2)",
            },
            {
              title: "Exact equals is shaky on decimals",
              text: "fantasy_pts is a decimal, so = 20 can miss a value that landed on 19.999999. Ranges like >= 20 don't have that problem — and they're usually what you meant anyway.",
              code: "WHERE fantasy_pts = 20    -- risky on computed decimals\nWHERE fantasy_pts >= 20   -- safer, and usually what you meant anyway",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You want games where a player scored MORE than 20 fantasy points (20 itself doesn't count). Which condition?",
              options: [
                "fantasy_pts > 20",
                "fantasy_pts >= 20",
                "fantasy_pts = 20",
                "fantasy_pts < 20",
              ],
              answer: 0,
              explain:
                "> means strictly more than. >= would also keep games at exactly 20.",
            },
            {
              type: "query",
              prompt:
                "Find the boom weeks: every column of week_results where fantasy_pts is greater than 25.",
              starter: "SELECT * FROM week_results\nWHERE ",
              expected: "SELECT * FROM week_results WHERE fantasy_pts > 25;",
              orderMatters: false,
              hint: "Numbers don't need quotes: fantasy_pts > 25.",
              explain:
                "Numeric comparisons are how you define boom and bust — just set the bar and keep what clears it.",
            },
            {
              type: "fill",
              prompt:
                "Two tests, one query: the 2024 season AND more than 20 points.",
              parts: [
                "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE season = 2024 ",
                null,
                " fantasy_pts ",
                null,
                " 20;",
              ],
              bank: ["AND", ">", "OR", "="],
              answer: ["AND", ">"],
              explain:
                "AND means both tests must pass for a row to stay.",
            },
            {
              type: "mc",
              prompt: "What does this return?",
              code: "WHERE season = 2024 AND week = 1",
              options: [
                "Rows matching BOTH conditions",
                "Rows matching either condition",
                "All 2024 rows, then all week-1 rows",
                "An error — one WHERE, one condition",
              ],
              answer: 0,
              explain:
                "AND requires every test to pass. One WHERE can chain as many as you need.",
            },
            {
              type: "query",
              prompt:
                "Who showed up in week 10 of 2023? Pull player and fantasy_pts where season is 2023, week is 10, and fantasy_pts is at least 15.",
              starter:
                "SELECT player, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT player, fantasy_pts FROM week_results WHERE season = 2023 AND week = 10 AND fantasy_pts >= 15;",
              orderMatters: false,
              hint: "Three conditions chained with AND. “At least 15” means >= 15.",
              explain:
                "Chained ANDs read like a short brief: this season, this week, this bar.",
            },
          ],
        },
        {
          id: "u2-l3",
          title: "Any of These",
          blurb: "OR, IN, and BETWEEN: more than one option.",
          brief: {
            goal: "Match several options at once with OR, IN, and BETWEEN.",
      steps: [
        {
          title: "Sometimes any of several will do",
          body: "You often want a handful of options, not one. Quarterbacks or tight ends. The opening month. You could write a long chain of ORs — it works, but it gets ugly fast and brackets are easy to mess up.",
        },
        {
          title: "IN says any of these",
          body: "Give IN a list. A row survives if the column matches anything in it. Same job as a stack of ORs, and it stays readable when the list grows.",
          code: "WHERE position IN ('QB','TE')",
        },
        {
          title: "BETWEEN covers a range, both ends in",
          body: "For numbers or weeks in a sequence, BETWEEN is shorthand for two comparisons. Both ends count: weeks 1 through 4 means four weeks, not three.",
          code: "WHERE week BETWEEN 1 AND 4",
        },
      ],
            setup:
              "When you want any of a set of values, IN beats stacking ORs. BETWEEN covers an inclusive range. Both are shorthand for tests you could write the long way — they just read better.",
            previewSql: "SELECT player, position, fantasy_pts FROM week_results WHERE position IN ('QB','TE') LIMIT 5;",
            previewCaption: "position IN ('QB','TE')",
          },
          intro: {
            title: "OR, IN, and BETWEEN",
            text: "OR keeps a row if either side passes. IN ('A','B','C') is a cleaner “any of these.” BETWEEN a AND b keeps a range — both ends included.",
            code: "WHERE position IN ('QB', 'TE')\n  AND week BETWEEN 1 AND 4",
          },
          film: [
            {
              title: "OR vs IN vs BETWEEN",
              text: "OR for two unrelated tests, IN for a list in one column, BETWEEN for a continuous range. Same result either way — pick the one that reads like the question.",
              code: "WHERE team = 'KC' OR fantasy_pts > 25   -- unrelated\nWHERE team IN ('KC', 'BUF', 'MIA')      -- value list\nWHERE week BETWEEN 5 AND 9              -- range",
            },
            {
              title: "Every filter has a NOT",
              text: "NOT IN and NOT BETWEEN flip a filter cleanly — everyone except those positions, or everything outside the range. Prefer WHERE position NOT IN (...) as the usual form.",
              code: "WHERE position NOT IN ('QB', 'TE')   -- everyone except passers and tight ends\nWHERE week NOT BETWEEN 1 AND 4       -- week 5 onward",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You'll take players from either the Chiefs or the Bills. Which WHERE clause?",
              options: [
                "WHERE team = 'KC' OR team = 'BUF'",
                "WHERE team = 'KC' AND team = 'BUF'",
                "WHERE team = 'KC', 'BUF'",
                "WHERE team = 'KC' + 'BUF'",
              ],
              answer: 0,
              explain:
                "OR means either side counts. AND would need a player on both teams at once — zero rows.",
            },
            {
              type: "fill",
              prompt:
                "Cleaner than a chain of ORs: match any position in a list.",
              parts: [
                "SELECT * FROM waiver_wire\nWHERE position ",
                null,
                " (",
                null,
                ", 'WR');",
              ],
              bank: ["IN", "'RB'", "OR", "RB"],
              answer: ["IN", "'RB'"],
              explain:
                "IN ('RB', 'WR') matches either value — and each text value still needs its quotes.",
            },
            {
              type: "mc",
              prompt: "WHERE week BETWEEN 1 AND 4 keeps…",
              options: [
                "Weeks 1, 2, 3, and 4 — both ends included",
                "Weeks 2 and 3 only",
                "Weeks 1 through 3",
                "Every week except 1 and 4",
              ],
              answer: 0,
              explain:
                "BETWEEN includes both ends. It's shorthand for week >= 1 AND week <= 4.",
            },
            {
              type: "query",
              prompt:
                "Pull Derrick Henry's early-season stretch: every column of his week_results rows for weeks 1 through 4, any season.",
              starter: "SELECT * FROM week_results\nWHERE ",
              expected:
                "SELECT * FROM week_results WHERE player = 'Derrick Henry' AND week BETWEEN 1 AND 4;",
              orderMatters: false,
              hint: "Two conditions: player = '…' AND week BETWEEN 1 AND 4.",
              explain:
                "BETWEEN handles the range; AND ties it to the player. Mix these tools freely in one WHERE.",
            },
            {
              type: "query",
              prompt:
                "Opening week pass catchers: player, team, and fantasy_pts for positions 'QB' and 'TE' in week 1 of season 2022.",
              starter:
                "SELECT player, team, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT player, team, fantasy_pts FROM week_results WHERE position IN ('QB', 'TE') AND season = 2022 AND week = 1;",
              orderMatters: false,
              hint: "position IN ('QB', 'TE'), plus season and week conditions with AND.",
              explain:
                "IN plus AND is the everyday pattern for “these kinds of players, this week.”",
            },
          ],
        },
      ],
    },
    {
      id: "u3",
      number: 3,
      title: "Sort the Board",
      drive: "3rd Drive · Midfield",
      description:
        "The board isn't in order until you say so. ORDER BY, then LIMIT if you only want the top.",
      skills: ["ORDER BY", "DESC / ASC", "Top-N"],
      status: "live",
      lessons: [
        {
          id: "u3-l1",
          title: "Rank the Board",
          blurb: "ORDER BY, ascending and descending.",
          brief: {
            goal: "Put rows in a deliberate order with ORDER BY.",
      steps: [
        {
          title: "Row order is not a promise",
          body: "Everything you've run so far came back in whatever order the database found convenient. It looks stable, so it's easy to assume it's locked in. It isn't. Change the data or the query and the order can change too.",
        },
        {
          title: "ORDER BY makes the order yours",
          body: "Name a column to sort by and the order stops being an accident. Smallest first is the default. DESC flips it to biggest first — what you want almost every time you're ranking anything.",
          code: "SELECT player, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC;",
          note: "Clause order is fixed: WHERE first, then ORDER BY, then LIMIT. Filter, then sort, then cut.",
        },
      ],
            setup:
              "Without ORDER BY, row order isn't guaranteed — it just happens to look stable. ORDER BY makes it explicit: ASC is smallest-first (the default), DESC is largest-first. Here's the top of the board.",
            previewSql: "SELECT player, week, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC LIMIT 5;",
            previewCaption: "highest scoring weeks first",
          },
          intro: {
            title: "Sort your results",
            text: "ORDER BY column sorts your results — smallest first by default (ASC). Add DESC for biggest first. It goes after WHERE, before LIMIT.",
            code: "SELECT player, fantasy_pts\nFROM week_results\nORDER BY fantasy_pts DESC;",
          },
          film: [
            {
              title: "Sorting text, numbers, and ties",
              text: "Numbers sort numerically, text alphabetically. Stack sort keys and the second one only kicks in when the first ties — like teams A–Z with each team's best games first.",
              code: "ORDER BY team, fantasy_pts DESC\n--       ↑ first    ↑ tiebreak within team",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You run the same query twice without ORDER BY and the rows come back in a different order the second time. Is that a bug?",
              options: [
                "Yes, the database is corrupted",
                "No — without ORDER BY the database never promised an order at all",
                "Yes, the query is missing a LIMIT",
                "No, but only because the table is small",
              ],
              answer: 1,
              explain:
                "Without ORDER BY, row order is whatever the database found convenient — not a guarantee.",
            },
            {
              type: "mc",
              prompt:
                "Your leaderboard query is showing the worst players at the top. What has gone wrong?",
              options: [
                "The data is sorted incorrectly in the table",
                "Nothing is broken — ascending is the default, and a leaderboard needs DESC",
                "LIMIT is cutting the wrong end",
                "The aggregate is computing the minimum",
              ],
              answer: 1,
              explain:
                "Smallest-first is the default. A leaderboard almost always wants DESC.",
            },
            {
              type: "fill",
              prompt:
                "Build the week 1 board for 2024 — best performance at the top.",
              parts: [
                "SELECT player, fantasy_pts\nFROM week_results\nWHERE season = 2024 AND week = 1\n",
                null,
                " fantasy_pts ",
                null,
                ";",
              ],
              bank: ["ORDER BY", "DESC", "SORT", "ASC"],
              answer: ["ORDER BY", "DESC"],
              explain:
                "ORDER BY fantasy_pts DESC puts the biggest games on top.",
            },
            {
              type: "query",
              prompt:
                "Sort the waiver wire by trend — hottest (highest) first. All columns.",
              starter: "SELECT * FROM waiver_wire\n",
              expected: "SELECT * FROM waiver_wire ORDER BY trend DESC;",
              orderMatters: true,
              hint: "ORDER BY trend DESC.",
              explain:
                "Sorting turns raw rows into a priority list you can act on.",
            },
            {
              type: "query",
              prompt:
                "Sort the waiver wire the other way — least-rostered player first. Show player and pct_rostered.",
              starter: "SELECT player, pct_rostered FROM waiver_wire\n",
              expected:
                "SELECT player, pct_rostered FROM waiver_wire ORDER BY pct_rostered ASC;",
              orderMatters: true,
              hint: "ASC is smallest-first. It's also the default, so ORDER BY pct_rostered alone works too.",
              explain:
                "Lowest rostered percentage first — that's where the unclaimed players are.",
            },
            {
              type: "mc",
              prompt: "Without ASC or DESC, ORDER BY sorts…",
              options: [
                "Ascending — smallest first",
                "Descending — biggest first",
                "Randomly",
                "By the first column",
              ],
              answer: 0,
              explain:
                "ASC is the silent default. Biggest-first needs an explicit DESC.",
            },
          ],
        },
        {
          id: "u3-l2",
          title: "Top N",
          blurb: "ORDER BY + LIMIT: every top-N question.",
          brief: {
            goal: "Answer any \"top N\" question with ORDER BY + LIMIT.",
      steps: [
        {
          title: "Every top-N question is the same pattern",
          body: "Best five games. Worst three weeks. Highest-scoring quarterback. They sound different. They're one pattern: sort by the number that matters, then cut the list short.",
        },
        {
          title: "Sort first, then cut",
          body: "That order is the whole lesson. LIMIT doesn't pick the best rows — it just stops early. Cut before you sort and you get an arbitrary handful, sorted among themselves. It looks fine. It's wrong.",
          code: "SELECT player, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC LIMIT 3;",
          note: "Sorting on a second column breaks ties in the first, so two equal rows don't swap places between runs.",
        },
      ],
            setup:
              "Sort first, then cut. That order matters: LIMIT before sorting would grab arbitrary rows and sort only those. Every “best/worst N” question is this pattern.",
            previewSql: "SELECT player, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC LIMIT 3;",
            previewCaption: "the 3 biggest weeks in the data",
          },
          intro: {
            title: "The top-N formula",
            text: "“Top 5 anything” is always the same: ORDER BY the stat DESC, then LIMIT 5. You can sort by several columns — the second breaks ties in the first.",
            code: "ORDER BY fantasy_pts DESC, player\nLIMIT 5;",
          },
          film: [
            {
              title: "The clause order never changes",
              text: "SELECT → FROM → WHERE → ORDER BY → LIMIT. Learn that once and “top 5 in week 10” is fill-in-the-blanks: filter, rank, trim.",
              code: "SELECT player, fantasy_pts\nFROM week_results\nWHERE season = 2024 AND week = 10\nORDER BY fantasy_pts DESC\nLIMIT 5;",
            },
            {
              title: "A tie at the cutoff can flip",
              text: "LIMIT 5 keeps exactly 5 rows — but if rows 5 and 6 tie on every ORDER BY column, which one makes the cut can change between runs. Add another sort column so the order is fully decided.",
              code: "ORDER BY fantasy_pts DESC, player  -- player breaks any exact-score tie",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "“The top 5 scorers” translates to…",
              options: [
                "ORDER BY fantasy_pts DESC LIMIT 5",
                "LIMIT 5 ORDER BY fantasy_pts",
                "SELECT TOP 5 fantasy_pts",
                "ORDER BY fantasy_pts ASC LIMIT 5",
              ],
              answer: 0,
              explain:
                "Sort descending so the best are first, then cut to 5. ORDER BY always comes before LIMIT.",
            },
            {
              type: "query",
              prompt:
                "Build the 2023 highlight reel: the 5 biggest single-game scores. Show player, week, and fantasy_pts — biggest first, and break ties alphabetically by player, then by earlier week.",
              starter:
                "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE season = 2023\n",
              expected:
                "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2023 ORDER BY fantasy_pts DESC, player, week LIMIT 5;",
              orderMatters: true,
              hint: "ORDER BY fantasy_pts DESC, player, week — then LIMIT 5 at the very end.",
              explain:
                "WHERE narrows to 2023, ORDER BY ranks, LIMIT trims. That clause order never changes.",
            },
            {
              type: "fill",
              prompt:
                "Week 8 of 2022: sort by points first, and break ties alphabetically by player.",
              parts: [
                "SELECT player, team, fantasy_pts\nFROM week_results\nWHERE season = 2022 AND week = 8\nORDER BY ",
                null,
                " DESC, ",
                null,
                ";",
              ],
              bank: ["fantasy_pts", "player", "LIMIT", "week"],
              answer: ["fantasy_pts", "player"],
              explain:
                "The second sort key only matters when the first one ties.",
            },
            {
              type: "mc",
              prompt: "LIMIT 5 without any ORDER BY gives you…",
              options: [
                "Whatever 5 rows the database reads first — not the top 5",
                "The 5 highest values",
                "5 random rows every time",
                "An error",
              ],
              answer: 0,
              explain:
                "LIMIT has no idea what “best” means until ORDER BY defines it.",
            },
            {
              type: "query",
              prompt:
                "Quiet games for Travis Kelce: his 3 LOWEST-scoring games across all seasons. Show season, week, fantasy_pts — lowest first; break ties by season, then week.",
              starter:
                "SELECT season, week, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT season, week, fantasy_pts FROM week_results WHERE player = 'Travis Kelce' ORDER BY fantasy_pts, season, week LIMIT 3;",
              orderMatters: true,
              hint: "No DESC needed — ascending is the default. ORDER BY fantasy_pts, season, week LIMIT 3.",
              explain:
                "Ascending finds the floor games — same pattern as top-N, flipped.",
            },
          ],
        },
      ],
    },
    {
      id: "u4",
      number: 4,
      title: "Season Math — Aggregations",
      drive: "4th Drive · Red Zone",
      description:
        "A season isn't 300 game rows. GROUP BY folds them into one number per player.",
      skills: ["COUNT / SUM / AVG", "GROUP BY", "AS", "HAVING"],
      status: "live",
      lessons: [
        {
          id: "u4-l1",
          title: "Season Totals",
          blurb: "COUNT, SUM, AVG: many rows → one number.",
          brief: {
            goal: "Turn many rows into one number with COUNT, SUM, and AVG.",
      steps: [
        {
          title: "Lists aren't always the answer",
          body: "You can filter and sort. That still hands back a list. Real questions often want one number: how many games, how many points, what's typical.",
        },
        {
          title: "Fold a column into one value",
          body: "COUNT counts rows. SUM adds a column up. AVG averages it. Each one reads the whole column and hands back a single answer.",
          code: "SELECT COUNT(*) AS games, ROUND(AVG(fantasy_pts), 1) AS avg_pts\nFROM week_results;",
          note: "AS renames a column so it's easy to read. ROUND trims messy decimals. Both are cosmetic — and both make the result friendlier.",
        },
        {
          title: "You get one row back",
          body: "Up to now, answers looked like the table. An aggregate collapses every row you feed it into exactly one. That's the shift.",
        },
      ],
            setup:
              "Aggregates answer \"how many / how much / what's typical\" by folding a whole column into one value. Notice: one row comes back, not many.",
            previewSql: "SELECT COUNT(*) AS rows_total, ROUND(AVG(fantasy_pts), 1) AS avg_pts FROM week_results;",
            previewCaption: "the whole table, as one row",
          },
          intro: {
            title: "Many games, one box score",
            text: "Aggregates squash many rows into one. COUNT(*) counts rows, SUM adds, AVG averages. AS names the result, and ROUND(x, 1) trims decimals.",
            code: "SELECT ROUND(AVG(fantasy_pts), 1) AS ppg\nFROM week_results\nWHERE player = 'Josh Allen';",
          },
          film: [
            {
              title: "The aggregate crew",
              text: "COUNT(*) counts rows. SUM adds. AVG averages. MIN and MAX find the low and high. They all skip NULLs — except COUNT(*), which counts the row no matter what.",
              code: "SELECT COUNT(*), SUM(fantasy_pts),\n       AVG(fantasy_pts), MIN(fantasy_pts), MAX(fantasy_pts)\nFROM week_results;",
            },
            {
              title: "Three kinds of COUNT",
              text: "COUNT(*) counts rows. COUNT(column) skips NULLs in that column. COUNT(DISTINCT column) counts unique values — so COUNT(DISTINCT player) is \"how many different players,\" not \"how many games.\"",
              code: "SELECT COUNT(*) AS games, COUNT(DISTINCT player) AS players\nFROM week_results;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "COUNT(*) counts rows. COUNT(fantasy_pts) counts values. On a column that has gaps in it, why do those two disagree?",
              options: [
                "They never disagree — the two are identical",
                "COUNT on a column ignores NULLs, so every missing value is left out",
                "COUNT on a column only counts distinct values",
                "COUNT(*) includes the header row",
              ],
              answer: 1,
              explain:
                "COUNT on a column ignores NULLs, so gaps make it answer a different question than COUNT(*).",
            },
            {
              type: "mc",
              prompt: "AVG(fantasy_pts) returns…",
              options: [
                "The average of the fantasy_pts values",
                "The biggest fantasy_pts value",
                "The total of all fantasy_pts",
                "The number of games",
              ],
              answer: 0,
              explain:
                "AVG is the mean — points per game when each row is a game.",
            },
            {
              type: "fill",
              prompt: "One number: Josh Allen's career fantasy points.",
              parts: [
                "SELECT ",
                null,
                "(fantasy_pts) AS total_pts\nFROM week_results\nWHERE player = ",
                null,
                ";",
              ],
              bank: ["SUM", "'Josh Allen'", "COUNT", "TOTAL"],
              answer: ["SUM", "'Josh Allen'"],
              explain:
                "SUM adds his weekly scores into one career total.",
            },
            {
              type: "query",
              prompt:
                "How many games has Christian McCaffrey logged? Return one number: COUNT(*) of his rows in week_results.",
              starter: "SELECT COUNT(*)\nFROM week_results\nWHERE ",
              expected:
                "SELECT COUNT(*) FROM week_results WHERE player = 'Christian McCaffrey';",
              orderMatters: false,
              hint: "COUNT(*) plus a WHERE on player.",
              explain:
                "37 games — not 50. Missed weeks are missing rows, and COUNT(*) finds that.",
            },
            {
              type: "query",
              prompt:
                "What was Tyreek Hill's points-per-game in season 2024? Return ROUND(AVG(fantasy_pts), 1).",
              starter: "SELECT ",
              expected:
                "SELECT ROUND(AVG(fantasy_pts), 1) FROM week_results WHERE player = 'Tyreek Hill' AND season = 2024;",
              orderMatters: false,
              hint: "ROUND(AVG(fantasy_pts), 1), with two AND-ed WHERE conditions.",
              explain:
                "12.8 a game — AVG of his 2024 scores, ROUND to one decimal.",
            },
          ],
        },
        {
          id: "u4-l2",
          title: "One Number Per Player",
          blurb: "GROUP BY: one aggregate row per player, position, or team.",
          brief: {
            goal: "Get one aggregate row per player, position, or team with GROUP BY.",
      steps: [
        {
          title: "One league number isn't enough",
          body: "A league average is fine. What you usually want is each player's number, side by side. One query per player would work — and it would be miserable.",
        },
        {
          title: "GROUP BY makes buckets",
          body: "Name a column. SQL sorts every row into a bucket by that value, then runs your aggregate inside each bucket. One bucket per player means one answer per player.",
          code: "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total\nFROM week_results\nGROUP BY player\nORDER BY total DESC;",
          note: "Select the grouping column next to your aggregate and you've built a leaderboard.",
        },
      ],
            setup:
              "GROUP BY splits rows into buckets and runs the aggregate inside each one. Instead of one number for the table, you get one number per group.",
            previewSql: "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results GROUP BY player ORDER BY total DESC LIMIT 5;",
            previewCaption: "one row per player",
          },
          intro: {
            title: "One row per player",
            text: "GROUP BY splits the table into buckets — one per distinct value — then aggregates run inside each bucket. Select the grouping column plus your aggregates and you've got a leaderboard.",
            code: "SELECT player, SUM(fantasy_pts) AS total\nFROM week_results\nGROUP BY player;",
          },
          film: [
            {
              title: "What one row means now",
              text: "week_results is one row per player-week. GROUP BY player makes it one row per player. Every column in SELECT should be in the GROUP BY or wrapped in an aggregate — otherwise SQL is guessing.",
              code: "SELECT player, team, SUM(fantasy_pts)  -- team: in neither!\nFROM week_results\nGROUP BY player  -- ⚠ works in SQLite, lies in interviews",
            },
            {
              title: "Group by more than one column",
              text: "GROUP BY player, season means one row per player per season. Add a column and buckets get finer. Drop one and separate totals merge — often the reason a total looks too big.",
              code: "SELECT player, season, ROUND(SUM(fantasy_pts), 1) AS total\nFROM week_results\nGROUP BY player, season; -- one row per player PER SEASON",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You GROUP BY player, then also try to SELECT week alongside the total. Why is that a problem?",
              options: [
                "week is the wrong data type to select",
                "Each player has many weeks, so there is no single week to show on that one row",
                "You can only ever select the grouping column",
                "GROUP BY has to come before SELECT",
              ],
              answer: 1,
              explain:
                "Grouping squashes many weeks into one row, so there's no single week to show.",
            },
            {
              type: "fill",
              prompt: "Career totals, one row per player.",
              parts: [
                "SELECT player, ",
                null,
                "(fantasy_pts) AS total\nFROM week_results\n",
                null,
                " player;",
              ],
              bank: ["SUM", "GROUP BY", "AVG", "ORDER BY"],
              answer: ["SUM", "GROUP BY"],
              explain:
                "SUM inside, GROUP BY outside — that's a leaderboard.",
            },
            {
              type: "query",
              prompt:
                "Position battle: for season 2024, show position and COUNT(*) AS games — one row per position.",
              starter: "SELECT position, COUNT(*) AS games\nFROM week_results\n",
              expected:
                "SELECT position, COUNT(*) AS games FROM week_results WHERE season = 2024 GROUP BY position;",
              orderMatters: false,
              hint: "WHERE season = 2024, then GROUP BY position.",
              explain:
                "WHERE trims to 2024 first, then GROUP BY splits by position.",
            },
            {
              type: "mc",
              prompt: "After GROUP BY player, each row in the result represents…",
              options: [
                "One player, with their rows squashed into aggregates",
                "One game",
                "One week of the season",
                "The whole league",
              ],
              answer: 0,
              explain:
                "GROUP BY changes the grain: one row per player instead of one row per player-week.",
            },
            {
              type: "query",
              prompt:
                "Build the 2023 season leaderboard: player and ROUND(SUM(fantasy_pts), 1) AS total, one row per player, highest total first, top 5 only.",
              starter:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total\nFROM week_results\n",
              expected:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2023 GROUP BY player ORDER BY total DESC LIMIT 5;",
              orderMatters: true,
              hint: "WHERE, GROUP BY, ORDER BY total DESC, LIMIT 5 — in exactly that order.",
              explain:
                "Filter, group, rank, trim — that's the season board.",
            },
          ],
        },
        {
          id: "u4-l3",
          title: "The Cut Line",
          blurb: "HAVING: filter groups after you aggregate.",
          brief: {
            goal: "Filter the groups themselves with HAVING.",
      steps: [
        {
          title: "Two filters, two moments",
          body: "You already know WHERE. HAVING looks similar but runs later. WHERE cuts rows before grouping. HAVING cuts after each bucket already has a number.",
        },
        {
          title: "HAVING filters the groups",
          body: "A condition about one game goes in WHERE. A condition about a season total or game count goes in HAVING. WHERE can't test an average — that number doesn't exist yet.",
          code: "SELECT player, COUNT(*) AS games\nFROM week_results\nGROUP BY player\nHAVING COUNT(*) > 30;",
          note: "WHERE filters rows. HAVING filters groups. Say it that way and you're set.",
        },
      ],
            setup:
              "WHERE filters rows before grouping. HAVING filters the groups after. Here it keeps only high-volume players.",
            previewSql: "SELECT player, COUNT(*) AS games FROM week_results GROUP BY player HAVING COUNT(*) > 30 LIMIT 5;",
            previewCaption: "only groups with more than 30 games",
          },
          intro: {
            title: "Cut after the totals exist",
            text: "WHERE filters raw rows before grouping. HAVING filters groups after aggregation — like “only players averaging 15+.” In SQLite you can reuse your AS alias inside HAVING.",
            code: "SELECT player, AVG(fantasy_pts) AS ppg\nFROM week_results\nGROUP BY player\nHAVING ppg >= 15;",
          },
          film: [
            {
              title: "Order of operations",
              text: "SQL runs: FROM → WHERE → GROUP BY → aggregates → HAVING → SELECT → ORDER BY → LIMIT. WHERE can't see averages because they don't exist yet when WHERE runs.",
              code: "FROM → WHERE → GROUP BY → HAVING\n     → SELECT → ORDER BY → LIMIT",
            },
            {
              title: "Use both, not either/or",
              text: "WHERE trims rows first. HAVING then filters the groups. Put a condition in the wrong place and either it can't see the aggregate, or you do extra work before throwing rows away.",
              code: "SELECT player, ROUND(AVG(fantasy_pts), 1) AS ppg\nFROM week_results\nWHERE season = 2024              -- cuts rows first (cheap)\nGROUP BY player\nHAVING AVG(fantasy_pts) >= 15;   -- cuts groups after (needs the aggregate)",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "A query uses both WHERE and HAVING. What is each one actually narrowing?",
              options: [
                "They do the same thing; HAVING is just newer syntax",
                "WHERE narrows the individual rows before grouping; HAVING narrows the groups after",
                "WHERE narrows columns; HAVING narrows rows",
                "HAVING runs first, then WHERE cleans up",
              ],
              answer: 1,
              explain:
                "They filter at two different moments — averages can only go in HAVING.",
            },
            {
              type: "fill",
              prompt: "Keep only players averaging 15+ points per game.",
              parts: [
                "SELECT player, ROUND(AVG(fantasy_pts), 1) AS ppg\nFROM week_results\nGROUP BY player\n",
                null,
                " ppg ",
                null,
                " 15;",
              ],
              bank: ["HAVING", ">=", "WHERE", "GROUP"],
              answer: ["HAVING", ">="],
              explain:
                "HAVING can see the aggregate; WHERE can't.",
            },
            {
              type: "mc",
              prompt: "Why is this an error?",
              code: "SELECT player, AVG(fantasy_pts)\nFROM week_results\nWHERE AVG(fantasy_pts) > 15\nGROUP BY player;",
              options: [
                "WHERE runs before grouping — the average doesn't exist yet",
                "AVG needs ROUND around it",
                "You can't use > with AVG",
                "GROUP BY must come before WHERE",
              ],
              answer: 0,
              explain:
                "WHERE runs before grouping, so the average isn't there yet.",
            },
            {
              type: "query",
              prompt:
                "Find the 300 Club: player and ROUND(SUM(fantasy_pts), 1) AS total for season 2024 — keeping only players whose total tops 300.",
              starter:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total\nFROM week_results\nWHERE season = 2024\nGROUP BY player\n",
              expected:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2024 GROUP BY player HAVING total > 300;",
              orderMatters: false,
              hint: "Add HAVING total > 300 after the GROUP BY.",
              explain:
                "WHERE picked the season, GROUP BY built totals, HAVING made the cut.",
            },
            {
              type: "query",
              prompt:
                "Consistency check across ALL seasons: player and COUNT(*) AS big_games — games over 20 points — keeping only players with more than 15 such games. Sort most first, ties alphabetical by player.",
              starter:
                "SELECT player, COUNT(*) AS big_games\nFROM week_results\nWHERE fantasy_pts > 20\n",
              expected:
                "SELECT player, COUNT(*) AS big_games FROM week_results WHERE fantasy_pts > 20 GROUP BY player HAVING big_games > 15 ORDER BY big_games DESC, player;",
              orderMatters: true,
              hint: "GROUP BY player, HAVING big_games > 15, ORDER BY big_games DESC, player.",
              explain:
                "WHERE, GROUP BY, HAVING, ORDER BY — that's the full stack in one query.",
            },
          ],
        },
      ],
    },
    {
      id: "u5",
      number: 5,
      title: "Two Tables — JOINs",
      drive: "5th Drive · Midfield",
      description:
        "week_results knows the score. rosters knows who owns the player. JOIN puts them on the same line.",
      skills: ["JOIN", "ON", "LEFT JOIN", "Anti-joins"],
      status: "live",
      lessons: [
        {
          id: "u5-l1",
          title: "Two Sheets, One Question",
          blurb: "INNER JOIN: connect the roster to the game log.",
          brief: {
            goal: "Answer a question that needs two tables at once.",
      steps: [
        {
          title: "One sheet can't answer this",
          body: "week_results knows what every player scored. rosters knows who owns whom. Neither alone can tell you how your fantasy team did that week — that answer lives across both.",
          previewSql: "SELECT * FROM rosters;",
          previewCaption: "rosters · the sheet week_results knows nothing about",
        },
        {
          title: "A join pairs matching rows",
          body: "JOIN takes two tables and matches their rows. ON says what has to agree. Here that's the player name — the one thing both sheets share.",
          code: "SELECT rosters.team_name, week_results.fantasy_pts\nFROM rosters\nJOIN week_results ON rosters.player = week_results.player;",
          note: "That shared column is the key. Finding it is usually the hard part — and it's almost always the thing both tables are about.",
        },
        {
          title: "Every matched pair becomes one row",
          body: "One roster row and 17 game rows → 17 joined rows, each with a team name beside one game. The join doesn't summarize yet. It just stitches.",
        },
      ],
            setup:
              "week_results knows who scored what. rosters knows who owns whom. Your team's week needs both, joined on the column they share.",
            previewSql: "SELECT * FROM rosters;",
            previewCaption: "rosters · 5 fantasy teams, 10 starters",
          },
          intro: {
            title: "A join matches rows across tables",
            text: "JOIN pairs rows that agree on something. ON says what must match — here, the player name in both tables. Each matched pair becomes one wide row with columns from both sides.",
            code: "SELECT rosters.team_name, week_results.player, week_results.fantasy_pts\nFROM rosters\nJOIN week_results ON rosters.player = week_results.player;",
          },
          film: [
            {
              title: "The shared column is the hinge",
              text: "You can only join when both tables share a value — here, the player's name. Real databases often use an id instead, because names get messy. The idea is the same either way.",
            },
            {
              title: "JOIN means INNER JOIN",
              text: "Bare JOIN is short for INNER JOIN. INNER keeps only matched pairs. OUTER joins (like LEFT JOIN) can keep unmatched rows too — you'll meet those next.",
              code: "-- identical\nFROM rosters JOIN week_results ON rosters.player = week_results.player\nFROM rosters INNER JOIN week_results ON rosters.player = week_results.player",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "Why can't week_results alone tell you how your fantasy team scored?",
              options: [
                "It doesn't have a points column",
                "It has no idea which players you own — that lives in rosters",
                "It only covers one season",
                "It's too large to query",
              ],
              answer: 1,
              explain:
                "week_results has every player. Who's yours only lives in rosters — so you need both.",
            },
            {
              type: "fill",
              prompt: "Connect the two tables on the column they share.",
              parts: [
                "SELECT rosters.team_name, week_results.fantasy_pts\nFROM rosters\n",
                null,
                " week_results ",
                null,
                " rosters.player = week_results.player;",
              ],
              bank: ["JOIN", "ON", "WHERE", "AND"],
              answer: ["JOIN", "ON"],
              explain:
                "JOIN names the second table. ON states the matching rule.",
            },
            {
              type: "query",
              prompt:
                "Pull every scoring row that belongs to a rostered player in week 1 of 2024. Show team_name, player and fantasy_pts.",
              starter:
                "SELECT rosters.team_name, week_results.player, week_results.fantasy_pts\nFROM rosters\n",
              expected:
                "SELECT rosters.team_name, week_results.player, week_results.fantasy_pts FROM rosters JOIN week_results ON rosters.player = week_results.player WHERE week_results.season = 2024 AND week_results.week = 1;",
              orderMatters: false,
              hint: "JOIN week_results ON rosters.player = week_results.player, then filter with WHERE on season and week.",
              explain:
                "Nine rows, not ten — one rostered player is missing. Next lesson explains why.",
            },
            {
              type: "mc",
              prompt:
                "Ten players are on rosters, but that query returned nine rows for week 1. What's the most likely reason?",
              options: [
                "The join is broken",
                "One rostered player has no row that week — he was injured",
                "SQL caps results at nine",
                "One player was traded",
              ],
              answer: 1,
              explain:
                "A plain JOIN only keeps matches. No game row that week means that player vanishes.",
            },
          ],
        },
        {
          id: "u5-l2",
          title: "Short Names for Tables",
          blurb: "Aliases: less typing, clearer joins.",
          brief: {
            goal: "Write joins that stay readable past two tables.",
      steps: [
        {
          title: "Long table names get old fast",
          body: "week_results.fantasy_pts is fine once. With four tables and a dozen columns, the query gets hard to read.",
        },
        {
          title: "Give each table a short handle",
          body: "Put a short name right after the table in FROM or JOIN. That nickname works for the rest of the query. Same result, way less typing.",
          code: "SELECT r.team_name, w.player, w.fantasy_pts\nFROM rosters r\nJOIN week_results w ON r.player = w.player;",
          note: "Qualify columns as r.player or w.player. When both tables share a name, SQL won't guess which you meant.",
        },
      ],
            setup:
              "Spelling out week_results.fantasy_pts every time gets old. Aliases give each table a short name for the query — same result, less typing.",
            previewSql:
              "SELECT r.team_name, w.player, w.fantasy_pts FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 AND w.week = 3 ORDER BY w.fantasy_pts DESC;",
            previewCaption: "the same join, written with aliases",
          },
          intro: {
            title: "One letter per table",
            text: "Put a short name after the table — rosters r, week_results w — then write r.something or w.something. When both tables have player, an unqualified name is ambiguous and SQL refuses.",
            code: "SELECT r.team_name, w.player, w.fantasy_pts\nFROM rosters r\nJOIN week_results w ON r.player = w.player;",
          },
          film: [
            {
              title: "Aliases matter when a table joins itself",
              text: "Compare week 3 to week 8 and you're joining week_results to itself. Without aliases, SQL can't tell the two copies apart. Name each one and pin a.season = b.season so you don't mix seasons.",
              code: "SELECT a.week, a.fantasy_pts AS week3_pts, b.fantasy_pts AS week8_pts\nFROM week_results a\nJOIN week_results b ON a.player = b.player AND a.season = b.season\nWHERE a.season = 2024 AND a.week = 3 AND b.week = 8 AND a.player = 'Justin Jefferson';",
            },
            {
              title: "AS renames a column, not a table",
              text: "rosters r is a table nickname you use elsewhere. fantasy_pts AS pts_scored only relabels the result. WHERE still needs the original column name — renaming happens later.",
              code: "SELECT w.fantasy_pts AS pts_scored\nFROM week_results w\nWHERE w.fantasy_pts > 20; -- not WHERE pts_scored > 20",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "Both tables have a column named `player`. What happens if you SELECT it unqualified in a join?",
              options: [
                "SQL picks the left table",
                "SQL errors — the name is ambiguous",
                "You get both columns",
                "It returns NULL",
              ],
              answer: 1,
              explain:
                "SQL won't guess — qualify it as r.player or w.player.",
            },
            {
              type: "fill",
              prompt: "Give each table a one-letter alias.",
              parts: [
                "SELECT r.team_name, w.fantasy_pts\nFROM rosters ",
                null,
                "\nJOIN week_results ",
                null,
                " ON r.player = w.player;",
              ],
              bank: ["r", "w", "AS r", "rosters"],
              answer: ["r", "w"],
              explain:
                "The alias goes right after the table name.",
            },
            {
              type: "query",
              prompt:
                "Using aliases r and w, show team_name, player and fantasy_pts for rostered players who scored more than 25 points in 2024.",
              starter: "SELECT r.team_name, w.player, w.fantasy_pts\nFROM rosters r\n",
              expected:
                "SELECT r.team_name, w.player, w.fantasy_pts FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 AND w.fantasy_pts > 25;",
              orderMatters: false,
              hint: "JOIN week_results w ON r.player = w.player, then WHERE w.season = 2024 AND w.fantasy_pts > 25.",
              explain:
                "Aliases make it obvious which table each filter hits.",
            },
            {
              type: "query",
              prompt:
                "Which fantasy team owns Derrick Henry? Return just the team_name.",
              starter: "SELECT r.team_name\nFROM rosters r\n",
              expected: "SELECT team_name FROM rosters WHERE player = 'Derrick Henry';",
              orderMatters: false,
              hint: "This one needs no join at all — rosters already has both columns.",
              explain:
                "Goal Line Gang — and no join needed. Reach for a join only when the answer spans two tables.",
            },
          ],
        },
        {
          id: "u5-l3",
          title: "Keep Everyone: LEFT JOIN",
          blurb: "Players who vanished — and how to keep them.",
          brief: {
            goal: "Keep rows that have no match on the other side.",
      steps: [
        {
          title: "A plain JOIN drops non-matches",
          body: "If a rostered player has no row on the other side, JOIN doesn't warn you. You just get fewer rows — and a quiet missing player looks like a finished report.",
        },
        {
          title: "LEFT JOIN keeps the left side",
          body: "LEFT JOIN returns every row from the first table. Matching columns from the second attach when they exist. No match? You get NULL — which means “nothing here.”",
          code: "SELECT r.player, w.fantasy_pts\nFROM rosters r\nLEFT JOIN week_results w\n  ON r.player = w.player AND w.season = 2024 AND w.week = 1;",
          note: "McCaffrey has no week 1 row in 2024 — he was hurt. JOIN drops him. LEFT JOIN shows him with NULL, which is worth seeing.",
        },
      ],
            setup:
              "A plain JOIN silently drops unmatched rows — that's how a hurt player vanished from week 1. LEFT JOIN keeps every left-side row and fills gaps with NULL.",
            previewSql:
              "SELECT r.player, w.fantasy_pts FROM rosters r LEFT JOIN week_results w ON r.player = w.player AND w.season = 2024 AND w.week = 1 ORDER BY r.player;",
            previewCaption: "10 rows now — look at Christian McCaffrey",
          },
          intro: {
            title: "LEFT JOIN keeps the left side whole",
            text: "LEFT JOIN returns every row from the first table, and attaches matches from the second when they exist. No match means NULL. Nothing is lost — and NULL is information.",
            code: "SELECT r.player, w.fantasy_pts\nFROM rosters r\nLEFT JOIN week_results w\n  ON r.player = w.player AND w.week = 1;",
          },
          film: [
            {
              title: "ON vs WHERE on a LEFT JOIN",
              text: "Filters on the right-hand table belong in ON. Put them in WHERE and you drop the NULL rows you meant to keep — turning LEFT JOIN back into INNER JOIN.",
              code: "-- keeps McCaffrey, points NULL\n... LEFT JOIN week_results w ON r.player = w.player AND w.week = 1\n\n-- drops McCaffrey again\n... LEFT JOIN week_results w ON r.player = w.player WHERE w.week = 1",
            },
            {
              title: "Why people stick to LEFT",
              text: "RIGHT JOIN keeps the second table instead. FULL OUTER keeps unmatched rows from both. Most teams just swap table order and use LEFT — one direction, less confusion.",
              code: "-- these two return the same rows\nFROM week_results w RIGHT JOIN rosters r ON r.player = w.player\nFROM rosters r LEFT JOIN week_results w ON r.player = w.player",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does LEFT JOIN put in the columns of an unmatched row?",
              options: ["0", "An empty string", "NULL", "It skips the row"],
              answer: 2,
              explain:
                "NULL means “no value here” — different from scoring zero.",
            },
            {
              type: "mc",
              prompt:
                "You LEFT JOIN, then add `WHERE w.week = 1`. McCaffrey disappears again. Why?",
              options: [
                "LEFT JOIN doesn't work with WHERE",
                "His row has NULL for week, and NULL = 1 is never true, so WHERE removes him",
                "The join order is wrong",
                "week is the wrong column",
              ],
              answer: 1,
              explain:
                "A NULL week can't pass WHERE w.week = 1 — put that filter in ON instead.",
            },
            {
              type: "fill",
              prompt: "Keep every rostered player, matched or not.",
              parts: [
                "SELECT r.player, w.fantasy_pts\nFROM rosters r\n",
                null,
                " week_results w\n  ON r.player = w.player ",
                null,
                " w.season = 2024 AND w.week = 1;",
              ],
              bank: ["LEFT JOIN", "AND", "JOIN", "WHERE"],
              answer: ["LEFT JOIN", "AND"],
              explain:
                "LEFT JOIN keeps all ten; season and week ride in ON with AND.",
            },
            {
              type: "query",
              prompt:
                "List every rostered player and their week 2 points in 2024, keeping players who didn't play. Show player and fantasy_pts.",
              starter: "SELECT r.player, w.fantasy_pts\nFROM rosters r\n",
              expected:
                "SELECT r.player, w.fantasy_pts FROM rosters r LEFT JOIN week_results w ON r.player = w.player AND w.season = 2024 AND w.week = 2;",
              orderMatters: false,
              hint: "LEFT JOIN, and keep the season/week conditions inside ON with AND — not in a WHERE.",
              explain:
                "Ten rows every time — even when someone missed the game.",
            },
          ],
        },
        {
          id: "u5-l4",
          title: "Finding What's Missing",
          blurb: "Anti-joins: players nobody rostered.",
          brief: {
            goal: "Find rows in one table that have no counterpart in another.",
      steps: [
        {
          title: "Absence is a real question",
          body: "Who isn't starting. Who never ordered. Which games have no result yet. Same shape every time — and looking only at rows that exist won't answer it.",
        },
        {
          title: "LEFT JOIN, then keep the NULLs",
          body: "LEFT JOIN keeps everything. WHERE then throws away the matches by keeping only rows where the other side is NULL. What's left is the unmatched set.",
          code: "SELECT DISTINCT w.player\nFROM week_results w\nLEFT JOIN rosters r ON w.player = r.player\nWHERE r.player IS NULL;",
          note: "That's an anti-join. Learn the shape — you'll reach for it a lot.",
        },
      ],
            setup:
              "Useful questions are often about absence: who isn't rostered, who never ordered. Pattern: LEFT JOIN, then keep rows where the match came back NULL.",
            previewSql:
              "SELECT DISTINCT w.player FROM week_results w LEFT JOIN rosters r ON w.player = r.player WHERE r.player IS NULL ORDER BY w.player;",
            previewCaption: "six players in the league, on nobody's roster",
          },
          intro: {
            title: "LEFT JOIN, then keep the NULLs",
            text: "An anti-join is LEFT JOIN plus WHERE right.column IS NULL. The join keeps everything; the WHERE throws away matches and leaves only the unmatched.",
            code: "SELECT DISTINCT w.player\nFROM week_results w\nLEFT JOIN rosters r ON w.player = r.player\nWHERE r.player IS NULL;",
          },
          film: [
            {
              title: "NOT IN looks simpler — until NULL",
              text: "NOT IN (SELECT …) often works. One NULL in that list and the whole filter can return zero rows with no error. LEFT JOIN … IS NULL doesn't have that problem.",
              code: "-- fragile if rosters.player could ever be NULL\nWHERE w.player NOT IN (SELECT player FROM rosters)\n\n-- immune to it\nLEFT JOIN rosters r ON w.player = r.player WHERE r.player IS NULL",
            },
            {
              title: "Same pattern, any tables",
              text: "LEFT JOIN … IS NULL isn't special to fantasy. It's “which left rows have no match elsewhere.” Swap the nouns — customers, shipments, invites — and the shape stays.",
              code: "LEFT JOIN rosters r ON w.player = r.player\nLEFT JOIN waiver_wire ww ON w.player = ww.player\nWHERE r.player IS NULL AND ww.player IS NULL -- on nobody's radar at all",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "In an anti-join, what is `WHERE r.player IS NULL` doing?",
              options: [
                "Removing players with no name",
                "Keeping only rows where the LEFT JOIN found no match",
                "Filling in missing names",
                "Sorting the nulls last",
              ],
              answer: 1,
              explain:
                "NULL marks a failed match — filtering to it leaves only the unmatched.",
            },
            {
              type: "mc",
              prompt: "Why does the query need DISTINCT?",
              options: [
                "To sort the results",
                "week_results has one row per player per week, so each unrostered player appears dozens of times",
                "DISTINCT is required with LEFT JOIN",
                "To remove NULLs",
              ],
              answer: 1,
              explain:
                "Grain is player-week — without DISTINCT you'd get every game, not a name list.",
            },
            {
              type: "query",
              prompt:
                "Find the free agents: every distinct player in week_results who is on nobody's roster. Return just player.",
              starter:
                "SELECT DISTINCT w.player\nFROM week_results w\nLEFT JOIN rosters r ON w.player = r.player\n",
              expected:
                "SELECT DISTINCT w.player FROM week_results w LEFT JOIN rosters r ON w.player = r.player WHERE r.player IS NULL;",
              orderMatters: false,
              hint: "Finish it with WHERE r.player IS NULL.",
              explain:
                "Six names — the waiver pool. Same shape answers “who hasn't done X” anywhere.",
            },
            {
              type: "query",
              prompt:
                "Now flip it: which rostered players are NOT on the waiver wire? Return player from rosters.",
              starter: "SELECT r.player\nFROM rosters r\n",
              expected:
                "SELECT r.player FROM rosters r LEFT JOIN waiver_wire ww ON r.player = ww.player WHERE ww.player IS NULL;",
              orderMatters: false,
              hint: "Same shape, different tables: LEFT JOIN waiver_wire ww ON r.player = ww.player, then WHERE ww.player IS NULL.",
              explain:
                "Eight of ten rostered players aren't on the wire — same pattern, new question.",
            },
          ],
        },
        {
          id: "u5-l5",
          title: "Score the Matchup",
          blurb: "Joins plus GROUP BY: settle it in one query.",
          brief: {
            goal: "Combine a join with aggregation to answer a real question.",
      steps: [
        {
          title: "Time for a verdict",
          body: "So far you've built lists to look at. This one answers a matchup: whose fantasy team scored more over the season. You already have every piece.",
        },
        {
          title: "Join first, then group",
          body: "SQL stitches the tables together, then collapses into buckets. You can group by a column from one table while summing a column from the other.",
          code: "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total\nFROM rosters r\nJOIN week_results w ON r.player = w.player\nWHERE w.season = 2024\nGROUP BY r.team_name\nORDER BY total DESC;",
          note: "Five lines, ideas you already know — and a question that would take forever by hand.",
        },
      ],
            setup:
              "Join the roster to the game log, group by fantasy team, sum the points. Season matchup, settled.",
            previewSql:
              "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 GROUP BY r.team_name ORDER BY total DESC;",
            previewCaption: "the 2024 season, settled",
          },
          intro: {
            title: "Join first, then group",
            text: "SQL builds joined rows first, then GROUP BY collapses them. Group by a column from either table and aggregate a column from the other — that's “total points per fantasy team.”",
            code: "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total\nFROM rosters r\nJOIN week_results w ON r.player = w.player\nGROUP BY r.team_name;",
          },
          film: [
            {
              title: "Watch for fan-out",
              text: "If the right side has several rows per match, the left row repeats. Summing a left-side column then inflates. Here we sum the right side, so we're fine — but doubled totals often mean fan-out.",
            },
            {
              title: "Fan-out breaks COUNT too",
              text: "COUNT(*) on this join counts matched game rows, not roster size. COUNT(DISTINCT r.player) counts unique players instead.",
              code: "SELECT r.team_name,\n       COUNT(*) AS rows_matched,               -- one per game played\n       COUNT(DISTINCT r.player) AS roster_size  -- the real headcount\nFROM rosters r\nJOIN week_results w ON r.player = w.player\nGROUP BY r.team_name;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "In a join with GROUP BY, which happens first?",
              options: [
                "GROUP BY, then the join",
                "The join builds combined rows, then GROUP BY collapses them",
                "They run at the same time",
                "Depends on the table order",
              ],
              answer: 1,
              explain:
                "Join first, then group — so you can mix columns from both sides.",
            },
            {
              type: "query",
              prompt:
                "Total each fantasy team's points for the 2024 season. Show team_name and a rounded total, highest first.",
              starter:
                "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total\nFROM rosters r\n",
              expected:
                "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 GROUP BY r.team_name ORDER BY total DESC;",
              orderMatters: true,
              hint: "JOIN, WHERE w.season = 2024, GROUP BY r.team_name, ORDER BY total DESC.",
              explain:
                "Fourth & Long leads; one query covers the whole season.",
            },
            {
              type: "query",
              prompt:
                "Which rostered player scored the most total points in 2024? Show player and rounded total, top 1 only.",
              starter: "SELECT r.player, ROUND(SUM(w.fantasy_pts), 1) AS total\nFROM rosters r\n",
              expected:
                "SELECT r.player, ROUND(SUM(w.fantasy_pts), 1) AS total FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 GROUP BY r.player ORDER BY total DESC LIMIT 1;",
              orderMatters: true,
              hint: "Group by r.player instead of team, then ORDER BY total DESC LIMIT 1.",
              explain:
                "Josh Allen — change the GROUP BY and the same join answers a new question.",
            },
            {
              type: "query",
              prompt:
                "Per fantasy team, how many rostered players scored a 25-point game in 2024? Show team_name and the count.",
              starter: "SELECT r.team_name, COUNT(*) AS big_games\nFROM rosters r\n",
              expected:
                "SELECT r.team_name, COUNT(*) AS big_games FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 AND w.fantasy_pts >= 25 GROUP BY r.team_name;",
              orderMatters: false,
              hint: "Add AND w.fantasy_pts >= 25 to the WHERE, then GROUP BY r.team_name with COUNT(*).",
              explain:
                "Join, filter, group, count — the shape of most real reports.",
            },
          ],
        },
      ],
    },
    {
      id: "u6",
      number: 6,
      title: "Side-by-Side Stats — Window Functions",
      drive: "6th Drive · Red Zone",
      description:
        "GROUP BY throws the games away. OVER keeps every game and still adds the season number beside it.",
      skills: ["OVER", "PARTITION BY", "RANK", "LAG", "Running totals"],
      status: "live",
      lessons: [
        {
          id: "u6-l1",
          title: "Keep the Row, Add the Context",
          blurb: "OVER(): aggregate without collapsing.",
          brief: {
            goal: "Add a summary number to every row without losing the rows.",
      steps: [
        {
          title: "GROUP BY throws detail away",
          body: "You can already get a player's season average. The individual games disappear from that answer. Plenty of questions need both: each game, and how it compares to the average.",
        },
        {
          title: "OVER keeps the rows",
          body: "Put OVER after an aggregate and it stops folding rows together. The same average still calculates — then it prints beside every row instead of replacing them.",
          code: "SELECT player, week, fantasy_pts,\n       ROUND(AVG(fantasy_pts) OVER (), 1) AS league_avg\nFROM week_results;",
          note: "These are window functions. OVER defines which rows to look at. Empty brackets mean “everything.”",
        },
      ],
            setup:
              "GROUP BY answers with a total and loses the detail. Window functions keep every row and still add the comparison number. Watch the season average repeat beside each game.",
            previewSql:
              "SELECT player, week, fantasy_pts, ROUND(AVG(fantasy_pts) OVER (), 1) AS league_avg FROM week_results WHERE season = 2024 AND week = 1 ORDER BY fantasy_pts DESC;",
            previewCaption: "every row keeps its detail AND gets the average",
          },
          intro: {
            title: "OVER() is the whole idea",
            text: "Put OVER() after an aggregate and rows stop collapsing. AVG with GROUP BY → one row. AVG(...) OVER () → the same average next to every original row, so you can compare each game without a second query.",
            code: "SELECT player, fantasy_pts,\n       AVG(fantasy_pts) OVER () AS league_avg\nFROM week_results\nWHERE season = 2024 AND week = 1;",
          },
          film: [
            {
              title: "Window vs GROUP BY",
              text: "GROUP BY reduces: many rows in, one out per group. A window annotates: same many rows out, plus an extra column. “Compare this to that” is almost always a window.",
              code: "-- 1 row\nSELECT AVG(fantasy_pts) FROM week_results;\n\n-- every row, plus the average\nSELECT player, AVG(fantasy_pts) OVER () FROM week_results;",
            },
            {
              title: "You can't filter on a window in WHERE",
              text: "Window functions run after WHERE, so WHERE league_avg > 15 fails when league_avg comes from OVER(). Wrap the query and filter in an outer SELECT instead.",
              code: "-- errors: league_avg doesn't exist yet when WHERE runs\nSELECT player, AVG(fantasy_pts) OVER () AS league_avg\nFROM week_results WHERE league_avg > 15;\n\n-- works: filter in an outer layer instead\nSELECT * FROM (\n  SELECT player, AVG(fantasy_pts) OVER () AS league_avg\n  FROM week_results\n) WHERE league_avg > 15;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "What's the difference between AVG(x) and AVG(x) OVER ()?",
              options: [
                "Nothing, OVER is decoration",
                "AVG(x) collapses to one row; AVG(x) OVER () keeps every row and adds the average as a column",
                "OVER makes it faster",
                "OVER only works on integers",
              ],
              answer: 1,
              explain:
                "That's the whole idea — everything else in this unit varies it.",
            },
            {
              type: "fill",
              prompt: "Show each week-1 score next to the average of all of them.",
              parts: [
                "SELECT player, fantasy_pts,\n       AVG(fantasy_pts) ",
                null,
                " (",
                null,
                ") AS league_avg\nFROM week_results\nWHERE season = 2024 AND week = 1;",
              ],
              bank: ["OVER", "", "GROUP BY", "PARTITION"],
              answer: ["OVER", ""],
              explain:
                "Empty parentheses mean the window is every row in the result.",
            },
            {
              type: "query",
              prompt:
                "For week 5 of 2024, show player, fantasy_pts, and the highest score that week as a column called top_score.",
              starter: "SELECT player, fantasy_pts,\n",
              expected:
                "SELECT player, fantasy_pts, MAX(fantasy_pts) OVER () AS top_score FROM week_results WHERE season = 2024 AND week = 5;",
              orderMatters: false,
              hint: "MAX(fantasy_pts) OVER () AS top_score, with the WHERE filtering to season 2024 and week 5.",
              explain:
                "Every row carries the week's high — subtracting tells you how far off the pace someone was.",
            },
            {
              type: "mc",
              prompt:
                "Could you get that same result with GROUP BY instead?",
              options: [
                "Yes, identically",
                "No — GROUP BY would collapse to a single row and lose every player",
                "Yes, but only with HAVING",
                "No, GROUP BY can't use MAX",
              ],
              answer: 1,
              explain:
                "GROUP BY would collapse to one row — you'd need a second query and a join.",
            },
          ],
        },
        {
          id: "u6-l2",
          title: "Rank Within the Position",
          blurb: "PARTITION BY and RANK: rankings that restart per group.",
          brief: {
            goal: "Rank rows inside groups without running a query per group.",
      steps: [
        {
          title: "One leaderboard mixes positions badly",
          body: "Quarterbacks score more by design. One big board just lists them first. You want each player ranked against the people they actually compete with.",
        },
        {
          title: "PARTITION BY restarts in each group",
          body: "PARTITION BY splits the window into groups. The calculation starts over inside each one. Rank with a partition on position and numbering restarts at 1 for every position.",
          code: "SELECT player, position,\n       RANK() OVER (PARTITION BY position ORDER BY AVG(fantasy_pts) DESC) AS pos_rank\nFROM week_results\nGROUP BY player, position;",
          note: "Read it out loud: rank these, within each position, ordered by average points.",
        },
      ],
            setup:
              "Comparing a tight end to a quarterback isn't useful. PARTITION BY splits the window by group and restarts the math — so rank begins at 1 for every position.",
            previewSql:
              "SELECT player, position, ROUND(AVG(fantasy_pts), 1) AS ppg, RANK() OVER (PARTITION BY position ORDER BY AVG(fantasy_pts) DESC) AS pos_rank FROM week_results WHERE season = 2024 GROUP BY player, position ORDER BY position, pos_rank;",
            previewCaption: "rank restarts at 1 for QB, RB, TE and WR",
          },
          intro: {
            title: "PARTITION BY is GROUP BY for windows",
            text: "PARTITION BY splits rows into groups. ORDER BY inside OVER sets the order within each group. RANK() numbers them, restarting at 1 in every partition.",
            code: "RANK() OVER (\n  PARTITION BY position\n  ORDER BY AVG(fantasy_pts) DESC\n) AS pos_rank",
          },
          film: [
            {
              title: "RANK, DENSE_RANK, ROW_NUMBER",
              text: "They differ on ties. RANK leaves gaps: 1, 2, 2, 4. DENSE_RANK doesn't: 1, 2, 2, 3. ROW_NUMBER never ties: 1, 2, 3, 4. Pick on purpose — “joint second” is a real answer.",
              code: "-- scores 20, 18, 18, 15\nRANK()       -> 1, 2, 2, 4\nDENSE_RANK() -> 1, 2, 2, 3\nROW_NUMBER() -> 1, 2, 3, 4",
            },
            {
              title: "Top N per group",
              text: "“Best 3 per position” is RANK in a subquery, then WHERE pos_rank <= 3 outside. PARTITION BY restarts per group; the outer filter trims each group.",
              code: "SELECT * FROM (\n  SELECT player, position,\n         RANK() OVER (PARTITION BY position ORDER BY AVG(fantasy_pts) DESC) AS pos_rank\n  FROM week_results\n  WHERE season = 2024\n  GROUP BY player, position\n) WHERE pos_rank <= 3;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Two players tie for second. What does RANK() give the next player?",
              options: ["3", "4", "2", "It errors"],
              answer: 1,
              explain:
                "RANK skips the gap the tie used: 1, 2, 2, 4.",
            },
            {
              type: "mc",
              prompt: "What does PARTITION BY position do?",
              options: [
                "Filters to one position",
                "Restarts the window calculation separately for each position",
                "Sorts by position",
                "Splits the table into four tables",
              ],
              answer: 1,
              explain:
                "It runs the window inside each position group — no filtering, no row loss.",
            },
            {
              type: "fill",
              prompt: "Rank players inside their own position.",
              parts: [
                "SELECT player, position,\n       RANK() OVER (",
                null,
                " position ",
                null,
                " AVG(fantasy_pts) DESC) AS pos_rank\nFROM week_results\nWHERE season = 2024\nGROUP BY player, position;",
              ],
              bank: ["PARTITION BY", "ORDER BY", "GROUP BY", "SORT BY"],
              answer: ["PARTITION BY", "ORDER BY"],
              explain:
                "PARTITION BY makes the groups; ORDER BY decides who's first inside each.",
            },
            {
              type: "query",
              prompt:
                "Rank every 2024 wide receiver by average points, best first. Show player and a rank column called wr_rank.",
              starter:
                "SELECT player,\n       RANK() OVER (ORDER BY AVG(fantasy_pts) DESC) AS wr_rank\nFROM week_results\n",
              expected:
                "SELECT player, RANK() OVER (ORDER BY AVG(fantasy_pts) DESC) AS wr_rank FROM week_results WHERE season = 2024 AND position = 'WR' GROUP BY player;",
              orderMatters: false,
              hint: "Filter to season 2024 and position = 'WR', then GROUP BY player.",
              explain:
                "Ja'Marr Chase is WR1 — RANK sorts on the average alone.",
            },
          ],
        },
        {
          id: "u6-l3",
          title: "This Week vs Last Week",
          blurb: "LAG and LEAD: reach across rows.",
          brief: {
            goal: "Compare a row to the one before or after it.",
      steps: [
        {
          title: "Trend questions need two rows",
          body: "Is he heating up or cooling off? How much better was this week than last? Tools that look at one row at a time can't answer change.",
        },
        {
          title: "LAG reaches back, LEAD reaches forward",
          body: "LAG pulls a value from the previous row in the order you set. LEAD pulls from the next. Once last week's score sits on this week's row, comparing is plain subtraction.",
          code: "SELECT week, fantasy_pts,\n       LAG(fantasy_pts) OVER (ORDER BY week) AS prev_week\nFROM week_results\nWHERE player = 'Patrick Mahomes' AND season = 2024;",
          note: "The first row has nothing behind it, so LAG returns NULL there — that's correct.",
        },
      ],
            setup:
              "Trend questions need two rows at once. LAG reaches back; LEAD reaches forward. Here's a season with last week's score pulled onto each line.",
            previewSql:
              "SELECT week, fantasy_pts, LAG(fantasy_pts) OVER (ORDER BY week) AS prev_week FROM week_results WHERE player = 'Patrick Mahomes' AND season = 2024 ORDER BY week LIMIT 8;",
            previewCaption: "week 1 has no previous week — hence NULL",
          },
          intro: {
            title: "LAG looks back, LEAD looks forward",
            text: "LAG(column) OVER (ORDER BY something) returns that column from the previous row. The first row gets NULL. Subtract the two and you have week-over-week change.",
            code: "SELECT week, fantasy_pts,\n       fantasy_pts - LAG(fantasy_pts) OVER (ORDER BY week) AS swing\nFROM week_results\nWHERE player = 'Josh Allen' AND season = 2024;",
          },
          film: [
            {
              title: "Before LAG, people used a self-join",
              text: "The old way joined a table to itself on player, season, and week − 1. LAG compresses that into one clause. One catch: LAG follows row order, so a bye week can quietly hand back the last game instead of NULL.",
              code: "-- the old way, before LAG\nSELECT a.week, a.fantasy_pts,\n       b.fantasy_pts AS prev_week\nFROM week_results a\nLEFT JOIN week_results b\n  ON a.player = b.player AND a.season = b.season AND b.week = a.week - 1\nWHERE a.player = 'Josh Allen' AND a.season = 2024;",
            },
            {
              title: "LAG takes more than one argument",
              text: "LAG(column) defaults to one row back and NULL when there's nothing. LAG(column, 3) goes three back. LAG(column, 1, 0) returns 0 instead of NULL — handy when more math follows.",
              code: "LAG(fantasy_pts, 1, 0) OVER (ORDER BY week) -- week 1 returns 0, not NULL",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Why is prev_week NULL on the first row?",
              options: [
                "The data is missing",
                "There is no earlier row to look back at",
                "LAG always skips row one",
                "It needs PARTITION BY",
              ],
              answer: 1,
              explain:
                "Nothing precedes the first row, so LAG has nothing to return.",
            },
            {
              type: "mc",
              prompt:
                "You LAG across a table holding several players. What breaks without PARTITION BY player?",
              options: [
                "Nothing",
                "The last week of one player becomes the 'previous week' of the next player",
                "It returns all NULLs",
                "The query errors",
              ],
              answer: 1,
              explain:
                "The window spills across players — partition by player so each gets their own sequence.",
            },
            {
              type: "fill",
              prompt: "Pull the previous week's score onto each row.",
              parts: [
                "SELECT week, fantasy_pts,\n       ",
                null,
                "(fantasy_pts) OVER (",
                null,
                " week) AS prev_week\nFROM week_results\nWHERE player = 'Josh Allen' AND season = 2024;",
              ],
              bank: ["LAG", "ORDER BY", "LEAD", "PARTITION BY"],
              answer: ["LAG", "ORDER BY"],
              explain:
                "LAG needs an ORDER BY so “previous” has a direction.",
            },
            {
              type: "query",
              prompt:
                "For Josh Allen in 2024, show week, fantasy_pts, and the previous week's score as prev_week, in week order.",
              starter: "SELECT week, fantasy_pts,\n",
              expected:
                "SELECT week, fantasy_pts, LAG(fantasy_pts) OVER (ORDER BY week) AS prev_week FROM week_results WHERE player = 'Josh Allen' AND season = 2024 ORDER BY week;",
              orderMatters: true,
              hint: "LAG(fantasy_pts) OVER (ORDER BY week) AS prev_week, filtered to the player and season, then ORDER BY week.",
              explain:
                "Every row now carries its comparison — subtract the two columns for momentum.",
            },
          ],
        },
        {
          id: "u6-l4",
          title: "Running Totals and Rolling Form",
          blurb: "Window frames: cumulative points and a 3-game average.",
          brief: {
            goal: "Build a running total and a moving average.",
      steps: [
        {
          title: "A window doesn't have to be the whole season",
          body: "So far your windows covered everything. A window can also cover just the rows up to the one you're on — that's a running total: the sum so far, recalculated on every line.",
        },
        {
          title: "ORDER BY inside OVER makes it accumulate",
          body: "Add ORDER BY inside the brackets and the window becomes “everything up to here.” That turns SUM into a season-to-date total.",
          code: "SELECT week, fantasy_pts,\n       ROUND(SUM(fantasy_pts) OVER (ORDER BY week), 1) AS season_to_date\nFROM week_results\nWHERE player = 'Josh Allen' AND season = 2024;",
          note: "Spell the frame with ROWS BETWEEN 2 PRECEDING AND CURRENT ROW and you get a three-game rolling average instead.",
        },
      ],
            setup:
              "A window can cover just part of its partition. Add ORDER BY and it becomes everything up to the current row — SUM turns into a running total.",
            previewSql:
              "SELECT week, fantasy_pts, ROUND(SUM(fantasy_pts) OVER (ORDER BY week), 1) AS season_to_date FROM week_results WHERE player = 'Josh Allen' AND season = 2024 ORDER BY week LIMIT 8;",
            previewCaption: "season_to_date grows every week",
          },
          intro: {
            title: "ORDER BY inside OVER creates a running window",
            text: "SUM(x) OVER () totals everything. Add ORDER BY and it totals from the start up to the current row — a running total. Add ROWS BETWEEN 2 PRECEDING AND CURRENT ROW for a three-game moving average.",
            code: "-- running total\nSUM(fantasy_pts) OVER (ORDER BY week)\n\n-- rolling 3-game average\nAVG(fantasy_pts) OVER (\n  ORDER BY week\n  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n)",
          },
          film: [
            {
              title: "Why rolling averages exist",
              text: "One week is noisy. A season average is slow to react. A three-game window sits in between — recent enough to show a real shift, smooth enough to ignore one fluke.",
            },
            {
              title: "The default frame isn't always ROWS",
              text: "ORDER BY with no frame uses RANGE, not ROWS. With unique weeks they match. On ties, RANGE lumps tied rows together. Writing ROWS BETWEEN explicitly avoids surprises.",
              code: "SUM(fantasy_pts) OVER (ORDER BY week)                                                   -- implicit RANGE\nSUM(fantasy_pts) OVER (ORDER BY week ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)  -- explicit, safer",
            },
            {
              title: "A frame has two edges",
              text: "Trailing frames look backward — this row and some before it. Centered ones use both sides, like 1 PRECEDING AND 1 FOLLOWING. Use trailing when you can only see the past; use centered when the full series is already done and you're smoothing noise.",
              code: "-- trailing: this row and the 2 before it\nROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n\n-- centered: this row plus one on each side\nROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "What does adding ORDER BY inside OVER change about SUM?",
              options: [
                "Nothing, it just sorts",
                "It limits the window to rows up to the current one, producing a running total",
                "It makes the sum descending",
                "It groups the rows",
              ],
              answer: 1,
              explain:
                "ORDER BY inside OVER introduces “so far” — that's a running total.",
            },
            {
              type: "mc",
              prompt: "What does ROWS BETWEEN 2 PRECEDING AND CURRENT ROW cover?",
              options: [
                "The whole partition",
                "This row and the two before it — three rows",
                "Two rows only",
                "Everything after this row",
              ],
              answer: 1,
              explain:
                "Three rows total — the frame a rolling 3-game average needs.",
            },
            {
              type: "query",
              prompt:
                "For Christian McCaffrey in 2024, show week, fantasy_pts, and a running season total called season_to_date (rounded to 1 decimal), in week order.",
              starter: "SELECT week, fantasy_pts,\n",
              expected:
                "SELECT week, fantasy_pts, ROUND(SUM(fantasy_pts) OVER (ORDER BY week), 1) AS season_to_date FROM week_results WHERE player = 'Christian McCaffrey' AND season = 2024 ORDER BY week;",
              orderMatters: true,
              hint: "ROUND(SUM(fantasy_pts) OVER (ORDER BY week), 1) AS season_to_date.",
              explain:
                "That's the cumulative line fantasy apps draw — one clause.",
            },
            {
              type: "query",
              prompt:
                "Same player and season: show week, fantasy_pts, and a rolling 3-game average called form (rounded to 1 decimal), in week order.",
              starter: "SELECT week, fantasy_pts,\n",
              expected:
                "SELECT week, fantasy_pts, ROUND(AVG(fantasy_pts) OVER (ORDER BY week ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS form FROM week_results WHERE player = 'Christian McCaffrey' AND season = 2024 ORDER BY week;",
              orderMatters: true,
              hint: "AVG(...) OVER (ORDER BY week ROWS BETWEEN 2 PRECEDING AND CURRENT ROW).",
              explain:
                "Early weeks average fewer than three rows — that's correct when the season is just starting.",
            },
          ],
        },
      ],
    },

    // ── Non-SQL skills ──────────────────────────────────────────────
    // Python and R mix `mc`/`fill` concept drills with live `code` exercises
    // (Pyodide / WebR via lib/runtimes.ts). Never use `query` here — that
    // type is SQL-only (sql.js result sets). Stats/viz/Git stay on mc/fill
    // because they aren't languages with a single in-browser REPL.
    {
      id: "u7",
      number: 7,
      title: "Python — The Analyst's Daily Driver",
      drive: "7th Drive · Own 25",
      description:
        "Variables, lists, loops, and your first DataFrame. SQL pulls the data; Python is where you shape it, script it, and repeat it every week without clicking anything.",
      skills: ["Variables", "Lists", "Loops", "pandas"],
      status: "live",
      lessons: [
        {
          id: "u7-l1",
          title: "Your First Python Line",
          blurb: "Name a value. Reuse it. Print it.",
          brief: {
            goal: "Write and run your first real Python.",
      steps: [
        {
          title: "You're writing real code",
          body: "Not a sketch. Real Python, running in your browser. Same language analysts use every day.",
        },
        {
          title: "Stick a name on a value",
          body: "That's a variable — like a jersey number. Write the name, an equals sign, and the value. Done.",
          code: "points = 24.6\nplayer = 'Josh Allen'\nprint(player, points)",
          note: "print is how code talks to you. Nothing shows up unless you ask.",
        },
      ],
            setup:
              "Python runs live here. A variable is a name stuck on a value. Numbers do math; text needs quotes. Mixing those up is the classic first stumble.",
          },
          intro: {
            title: "A variable is a jersey number",
            text: "Name a value so you can call it later. No type announcement — just assign and go. Numbers do math. Strings are text in quotes.",
            code: 'player = "Jalen Hurts"\npoints = 24.6\ngames = 3\navg = points / games',
          },
          film: [
            {
              title: "Why quotes matter",
              text: '24.6 divides. "24.6" is text that looks like a number — Python won\'t divide it. CSVs arrive as text, so float() is your first cleanup move.',
              code: '"24.6" / 3   # TypeError\nfloat("24.6") / 3   # 8.2',
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which line stores a number you can do math with?",
              options: [
                'points = "24.6"',
                "points = 24.6",
                "points = '24.6'",
                'points = "24.6" points',
              ],
              answer: 1,
              explain:
                "No quotes = a number. Quotes = text that looks like a number but won't divide.",
            },
            {
              type: "fill",
              prompt:
                "Store this receiver's yards, then get yards per catch.",
              parts: ["yards = 128\ncatches = 8\nper_catch = yards ", null, " catches"],
              bank: ["/", "*", "+", "%"],
              answer: ["/"],
              explain:
                "Divide with /. You get 16.0 — / returns a float even with whole numbers.",
            },
            {
              type: "mc",
              prompt: "What does this print?",
              code: 'name = "Bijan"\nname = "Saquon"\nprint(name)',
              options: ["Bijan", "Saquon", "Bijan Saquon", "An error"],
              answer: 1,
              explain:
                "A reassignment replaces the old value. The variable only remembers the last thing you put in.",
            },
            {
              type: "mc",
              prompt:
                "A CSV handed you every value as text. Which turn makes 18.4 a number you can average?",
              options: [
                'str("18.4")',
                'float("18.4")',
                'print("18.4")',
                'len("18.4")',
              ],
              answer: 1,
              explain:
                "float() turns text into a decimal. You'll do this to almost every numeric column.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Real Python in your browser. Print yards per catch: 128 yards on 8 catches.",
              starter: "yards = 128\ncatches = 8\n\n# print yards per catch\n",
              expected: "print(128 / 8)",
              hint: "Divide with /, then wrap it in print(...) so the answer shows up.",
              explain:
                "16.0. / always returns a float — and your code ran for real.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Build a one-line note. Print exactly: Nacua went for 31.0",
              starter:
                'player = "Nacua"\npoints = 31.0\n\n# print: Nacua went for 31.0\n',
              expected: 'print("Nacua went for 31.0")',
              hint: 'An f-string is the tidy way: print(f"{player} went for {points}").',
              explain:
                "f-strings drop variables into text. That's how most readable report lines get built.",
            },
          ],
        },
        {
          id: "u7-l2",
          title: "Lists & Loops",
          blurb: "Hold a roster. Do the same thing to every player.",
          brief: {
            goal: "Store a roster in a list and loop over it.",
      steps: [
        {
          title: "One name, one value gets old fast",
          body: "A roster isn't one player. A season isn't one week. You need many values under one name.",
        },
        {
          title: "A list is a roster. A loop walks it.",
          body: "Square brackets hold values in order. A for loop runs the indented block once per item.",
          code: "scores = [24.6, 18.2, 31.0]\nfor s in scores:\n    print(s)",
          note: "Indentation isn't decoration. Python uses it to decide what's inside the loop.",
        },
      ],
            setup:
              "A list holds many values in order. A for loop runs the same code once per item. Write the logic once; let it walk every week. First item is index 0.",
          },
          intro: {
            title: "A list is a roster",
            text: "Square brackets, values in order. A for loop walks one item at a time and runs the same block for each. That's how you process a season.",
            code: 'scores = [24.6, 18.2, 31.0]\nfor s in scores:\n    print(s)',
          },
          film: [
            {
              title: "Counting starts at zero",
              text: "scores[0] is first. scores[-1] is last. That zero-start trips everyone once.",
              code: "scores[0]    # 24.6  (first)\nscores[-1]   # 31.0  (last)",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What is scores[1] here?",
              code: "scores = [24.6, 18.2, 31.0]",
              options: ["24.6", "18.2", "31.0", "1"],
              answer: 1,
              explain:
                "Index 0 is 24.6, so index 1 is 18.2. Python counts from zero.",
            },
            {
              type: "fill",
              prompt: "Loop over every player and print their name.",
              parts: [
                'roster = ["Hurts", "Bijan", "Nacua"]\n',
                null,
                " player ",
                null,
                " roster:\n    print(player)",
              ],
              bank: ["for", "in", "while", "of"],
              answer: ["for", "in"],
              explain:
                "`for X in Y:` reads almost like English: for each player in the roster.",
            },
            {
              type: "fill",
              prompt:
                "Add up weekly scores into a season total.",
              parts: [
                "weeks = [24.6, 18.2, 31.0]\ntotal = ",
                null,
                "\nfor w in weeks:\n    total ",
                null,
                " w",
              ],
              bank: ["0", "1", "+=", "=="],
              answer: ["0", "+="],
              explain:
                "Start at 0, then total += w each week. Start at 1 and every total is silently one point high.",
            },
            {
              type: "mc",
              prompt:
                "You start the running total at 1 instead of 0. What's the damage?",
              options: [
                "It causes a crash",
                "It makes the loop run one extra time",
                "Every total comes out 1 point too high, with no error to warn you",
                "Nothing — Python corrects it",
              ],
              answer: 2,
              explain:
                "No crash — just a quietly wrong number. Those are the bugs that ship.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Loop the weeks and print this player's season total.",
              starter:
                "weeks = [24.6, 18.2, 31.0, 12.5]\n\n# add them up, then print the total\n",
              expected: "print(24.6 + 18.2 + 31.0 + 12.5)",
              hint: "Start a variable at 0, loop with `for w in weeks:`, and use total += w. Then print(total).",
              explain:
                "86.3. A loop plus a running total is the shape of most season math.",
            },
          ],
        },
        {
          id: "u7-l3",
          title: "pandas: SQL for Python",
          blurb: "Same table moves you know — new spelling.",
          brief: {
            goal: "Do your SQL moves in Python with pandas.",
      steps: [
        {
          title: "You already think in tables",
          body: "Filter, sort, group, join — you know those. pandas is those same moves in Python.",
        },
        {
          title: "A DataFrame is a table",
          body: "Named columns, rows of values. WHERE becomes a filter in brackets. ORDER BY becomes sort_values. GROUP BY becomes groupby.",
          code: "import pandas as pd\ndf = pd.DataFrame({'player': ['Allen', 'Hurts'], 'pts': [24.6, 18.2]})\nprint(df)",
          note: "SQL still pulls data. Python shines for cleaning, scripting, and charts around the query.",
        },
      ],
            setup:
              "pandas gives Python a table type: the DataFrame. WHERE → filter. GROUP BY → .groupby(). ORDER BY → .sort_values(). Same ideas, new spelling.",
          },
          intro: {
            title: "A DataFrame is a table",
            text: "If you know SQL, you already know pandas. WHERE becomes a filter. GROUP BY becomes .groupby(). ORDER BY becomes .sort_values().",
            code: 'import pandas as pd\ndf = pd.read_csv("week_results.csv")\ndf[df["position"] == "RB"]',
          },
          film: [
            {
              title: "The cheat sheet",
              text: "Keep this map handy. The ideas transfer; only the punctuation changes.",
              code: "SELECT cols   →  df[[\"a\", \"b\"]]\nWHERE ...     →  df[df[\"pts\"] > 20]\nGROUP BY x    →  df.groupby(\"x\")\nORDER BY x    →  df.sort_values(\"x\")\nLIMIT 5       →  df.head(5)",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which pandas line is the twin of WHERE points > 20?",
              options: [
                'df.groupby("points")',
                'df[df["points"] > 20]',
                'df.sort_values("points")',
                'df.head(20)',
              ],
              answer: 1,
              explain:
                "Put a condition inside df[...]. Inner builds True/False per row; outer keeps the Trues.",
            },
            {
              type: "fill",
              prompt:
                "Average points by position — pandas GROUP BY.",
              parts: ["df.", null, '("position")["points"].', null, "()"],
              bank: ["groupby", "sort_values", "mean", "count"],
              answer: ["groupby", "mean"],
              explain:
                "groupby buckets the rows; .mean() collapses each bucket — GROUP BY + AVG.",
            },
            {
              type: "mc",
              prompt:
                "You want the 5 highest-scoring weeks. Which chain works?",
              options: [
                'df.head(5).sort_values("points", ascending=False)',
                'df.sort_values("points", ascending=False).head(5)',
                'df.groupby("points").head(5)',
                'df["points"].head(5)',
              ],
              answer: 1,
              explain:
                "Sort first, then take five. Head-then-sort only sorts a random five.",
            },
            {
              type: "mc",
              prompt:
                "In SQL you'd write ORDER BY. What's the pandas twin?",
              options: [".order()", ".sort_values()", ".arrange()", ".rank()"],
              answer: 1,
              explain:
                ".sort_values() is ORDER BY. (.arrange() is R — you'll meet it later.)",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Live pandas. Print players over 20 points — highest first.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "player": ["Hurts", "Bijan", "Nacua", "Kelce"],\n    "points": [24.6, 18.2, 31.0, 22.4],\n})\n\n# filter to > 20, sort high to low, print the player column as a list\n',
              expected:
                'import pandas as pd\ndf = pd.DataFrame({"player":["Hurts","Bijan","Nacua","Kelce"],"points":[24.6,18.2,31.0,22.4]})\nprint(df[df["points"] > 20].sort_values("points", ascending=False)["player"].tolist())',
              hint: 'Filter with df[df["points"] > 20], then .sort_values("points", ascending=False), then ["player"].tolist() inside print().',
              explain:
                "['Nacua', 'Hurts', 'Kelce'] — filter, sort, select. WHERE + ORDER BY + SELECT.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "GROUP BY in pandas. Print mean points per position.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "position": ["RB", "WR", "RB", "WR"],\n    "points": [18.2, 31.0, 12.4, 22.4],\n})\n\n# print the mean points per position\n',
              expected:
                'import pandas as pd\ndf = pd.DataFrame({"position":["RB","WR","RB","WR"],"points":[18.2,31.0,12.4,22.4]})\nprint(df.groupby("position")["points"].mean())',
              hint: 'df.groupby("position")["points"].mean() — then wrap it in print().',
              explain:
                "RB 15.3, WR 26.7. groupby + an aggregate is the move you'll use most.",
            },
          ],
        },
      ],
    },
    {
      id: "u8",
      number: 8,
      title: "Statistical Thinking — Reading Noise",
      drive: "8th Drive · Red Zone",
      description:
        "Averages, variance, sample size, and regression to the mean. The unit that stops you from confidently reporting a fluke — the difference between someone who can query and someone who can analyze.",
      skills: ["Mean vs median", "Sample size", "Variance", "Regression"],
      status: "live",
      lessons: [
        {
          id: "u8-l1",
          title: "Averages Lie",
          blurb: "Mean vs median — and when each one fools you.",
          brief: {
            goal: "Spot when the mean misleads and reach for the median.",
      steps: [
        {
          title: "Your tools will happily lie",
          body: "SQL will average anything. Excel will too. Neither warns you when one huge week dragged the number. Stats is the layer that catches that.",
        },
        {
          title: "Mean gets bullied. Median doesn't.",
          body: "The mean adds and divides — one extreme pulls it. The median is the middle value after you line them up. When they disagree, that gap is the finding.",
          note: "Report both when they differ. Showing only the flattering one misleads without technically lying.",
        },
      ],
            setup:
              "Mean = add and divide; one outlier drags it. Median = middle value; barely moves. When they disagree, report both — or you'll recommend the wrong player.",
          },
          intro: {
            title: "One huge week breaks the mean",
            text: "Mean adds and divides — outliers pull it. Median is the middle after sorting — outliers barely move it. Skewed data + only the mean = wrong player recommended.",
            code: "weeks = [4, 5, 6, 7, 48]\nmean   = 14.0   ← nobody scored near this\nmedian = 6.0    ← the typical week",
          },
          film: [
            {
              title: "Which one do you report?",
              text: "Mean and median far apart? The data is skewed — median describes a typical week better. Report both; the gap is the story.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "A player scores 4, 5, 6, 7, and 48. Which better describes a typical week?",
              options: [
                "The mean, 14.0",
                "The median, 6.0",
                "Both are equally good",
                "Neither — you need more stats",
              ],
              answer: 1,
              explain:
                "Four of five weeks sat between 4 and 7. Median (6) fits them; mean (14) fits nobody.",
            },
            {
              type: "mc",
              prompt:
                "Mean and median are nearly the same. What does that suggest?",
              options: [
                "The data is skewed",
                "There's a huge outlier",
                "The distribution is roughly symmetric",
                "The sample is too small",
              ],
              answer: 2,
              explain:
                "When mean ≈ median, nothing extreme is yanking the average — the shape is roughly balanced.",
            },
            {
              type: "fill",
              prompt: "Compute both in pandas so you can compare them.",
              parts: [
                'typical = df["points"].',
                null,
                '()\naverage = df["points"].',
                null,
                "()",
              ],
              bank: ["median", "mean", "mode", "sum"],
              answer: ["median", "mean"],
              explain:
                "Always grab both. The gap tells you fast whether outliers are in play.",
            },
            {
              type: "mc",
              prompt:
                "A manager wants 'the average' for a boom-or-bust player. What's most useful?",
              options: [
                "Just the mean — it's what they asked for",
                "Just the median — it's more accurate",
                "Both, plus a note that the player is inconsistent",
                "Refuse until they specify",
              ],
              answer: 2,
              explain:
                "The inconsistency is the answer. Both numbers plus a note on the spread — that's analysis.",
            },
          ],
        },
        {
          id: "u8-l2",
          title: "Small Samples Lie Louder",
          blurb: "Three great games prove almost nothing.",
          brief: {
            goal: "Ask whether there's enough data before you trust a rate.",
      steps: [
        {
          title: "Three good games isn't a trend",
          body: "Small samples make the flashiest numbers. The highest average in a league often belongs to someone who played twice.",
        },
        {
          title: "More data, less noise",
          body: "Three coin flips can all land heads. Fifty flips almost never do. The coin didn't change — your evidence did.",
          note: "That's why leaderboards want a minimum-games filter. Not a nicety — the whole point.",
        },
      ],
            setup:
              "Tiny samples look extreme by luck. 3-for-3 isn't elite hands — it's Tuesday. Habit: ask for the denominator before you trust any rate.",
          },
          intro: {
            title: "Noise shrinks as n grows",
            text: "Small samples can look extreme by chance. Three heads in a row isn't a magic coin. Same for a receiver's first three games. More observations make luck harder to fake.",
          },
          film: [
            {
              title: "Some stats settle faster",
              text: "Targets and carries stabilize quick — role is a real, repeated choice. Yards per catch and TD rate need more games; they hang on a few wild plays.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "A receiver has 3 catches on 3 targets — a 100% catch rate. What's the honest read?",
              options: [
                "He's the most reliable receiver in the league",
                "3 targets is far too few to conclude anything",
                "Catch rate is a useless stat",
                "He'll regress to exactly 50%",
              ],
              answer: 1,
              explain:
                "100% of 3 isn't elite hands — the sample is tiny. Ask for attempts before you trust a rate.",
            },
            {
              type: "mc",
              prompt:
                "Which stat gets trustworthy with FEWER games?",
              options: [
                "Touchdown rate",
                "Yards per catch",
                "Targets per game",
                "Longest reception",
              ],
              answer: 2,
              explain:
                "Targets are a coaching choice repeated every week. Rates and maxes hang on rare, wild events.",
            },
            {
              type: "mc",
              prompt:
                "Your query shows a 90% win rate — from 10 games. What do you add?",
              options: [
                "Nothing, the number speaks for itself",
                "The sample size, so the reader can judge it",
                "A larger percentage to be safe",
                "Only the wins",
              ],
              answer: 1,
              explain:
                "A rate without its denominator is nearly useless. Pair n with the percentage.",
            },
            {
              type: "fill",
              prompt:
                "Report the rate next to the count that made it.",
              parts: [
                'summary = df.groupby("player").agg(\n    rate=("caught", "mean"),\n    targets=("caught", "',
                null,
                '")\n)',
              ],
              bank: ["count", "max", "first", "std"],
              answer: ["count"],
              explain:
                "Every rate needs its count. Cheapest habit for not embarrassing yourself in a meeting.",
            },
          ],
        },
        {
          id: "u8-l3",
          title: "Regression to the Mean",
          blurb: "The hot hand cools — and it isn't a jinx.",
          brief: {
            goal: "Spot regression to the mean before you invent a story.",
      steps: [
        {
          title: "Best month, then a worse one",
          body: "People invent stories: complacency, pressure, a new contract. Usually the real reason is duller — and more useful.",
        },
        {
          title: "Extremes drift back toward normal",
          body: "Skill plus luck made the peak. Skill sticks. Luck doesn't. The number falls — no jinx required.",
          note: "See a big drop after a peak? Check ordinary regression before you write the narrative.",
        },
      ],
            setup:
              "Part skill, part luck: an extreme result probably had good luck in it. Luck doesn't repeat. The drift back isn't a slump — it's the most misread pattern in sports analytics.",
          },
          intro: {
            title: "Extremes drift back toward normal",
            text: "Extreme results usually packed in good luck. Luck doesn't repeat, so the next stretch lands closer to true level. That drift is regression to the mean.",
          },
          film: [
            {
              title: "The cover jinx isn't real",
              text: "Players featured after a monster month often decline — they were picked *for* the extreme. Same math behind \"rookie wall\" and \"new coach fixed him.\"",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "A kicker makes 12 straight field goals, then misses 2 of his next 5. Best explanation?",
              options: [
                "He lost his confidence",
                "The streak included good luck that didn't repeat",
                "He was never any good",
                "Someone jinxed him",
              ],
              answer: 1,
              explain:
                "True ability probably didn't change. Extreme runs mix skill and luck; only skill carries forward.",
            },
            {
              type: "mc",
              prompt:
                "You rank by Week 1 points, then track the top 10. What should you EXPECT?",
              options: [
                "They stay the top 10 all season",
                "As a group they score less than in Week 1",
                "They get better each week",
                "Their scores stay identical",
              ],
              answer: 1,
              explain:
                "You picked them for an extreme week — the group's average falls afterward. Predicting that is a real edge.",
            },
            {
              type: "mc",
              prompt:
                "Which finding is most likely real, not just regression?",
              options: [
                "A 3-game scoring spike",
                "A career-best single game",
                "A sustained rise in snap share over 8 games",
                "One week as the league's top scorer",
              ],
              answer: 2,
              explain:
                "A lasting role change — snaps, targets, usage — is a decision, not a coin flip.",
            },
            {
              type: "mc",
              prompt:
                "A stakeholder wants to cut a player after two bad games following a hot month. Your call?",
              options: [
                "Agree — the trend is clear",
                "Point out that two games is noise and the hot month was likely inflated",
                "Say statistics can't answer it",
                "Recommend cutting the whole position group",
              ],
              answer: 1,
              explain:
                "Both ends are over-read. Say what the data can and can't support — in both directions.",
            },
          ],
        },
      ],
    },
    {
      id: "u9",
      number: 9,
      title: "Visualization — Make the Point Land",
      drive: "9th Drive · Goal Line",
      description:
        "Choosing the right chart, labeling it honestly, and cutting everything that isn't the argument. A correct query nobody understands has changed nothing.",
      skills: ["Chart choice", "Axes", "Labels", "Honest scales"],
      status: "live",
      lessons: [
        {
          id: "u9-l1",
          title: "Pick the Right Chart",
          blurb: "Match the chart to the question — not your mood.",
          brief: {
            goal: "Pick the chart the question actually needs.",
      steps: [
        {
          title: "The chart is the argument",
          body: "Wrong chart type hides what you found. Choosing well isn't aesthetics — it's part of being right.",
        },
        {
          title: "The question picks the chart",
          body: "Compare amounts → bars. Track over time → line. Link two numbers → scatter. Say the question out loud; the chart usually follows.",
          note: "Pie charts are the usual trap. People compare angles badly — most pies should be bars.",
        },
      ],
            setup:
              "Question decides the chart. Amounts → bars. Over time → line. Two numbers → scatter. One distribution's shape → histogram. Most bad charts are right data in the wrong box.",
          },
          intro: {
            title: "The chart type follows the question",
            text: "Amounts across categories? Bars. Over time? Line. Two numbers related? Scatter. Shape of one distribution? Histogram.",
          },
          film: [
            {
              title: "Why pies keep losing",
              text: "We compare lengths well and angles poorly. Six similar pie slices? Unreadable. Same data as sorted bars? Clear. Save pies for two or three parts — or skip them.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You want to show how one player's points changed across 17 weeks. Which chart?",
              options: ["Pie chart", "Line chart", "Histogram", "Scatter plot"],
              answer: 1,
              explain:
                "Time on x, value on y — a line. The connecting line says these points are a sequence.",
            },
            {
              type: "mc",
              prompt:
                "You're checking whether more targets tend to mean more points. Which chart?",
              options: [
                "Scatter plot",
                "Pie chart",
                "Stacked bar chart",
                "Line chart",
              ],
              answer: 0,
              explain:
                "Two numbers, one point per player — scatter is how you see (or miss) a relationship.",
            },
            {
              type: "mc",
              prompt: "Total season points for 8 running backs. Best choice?",
              options: [
                "Pie chart",
                "Sorted horizontal bar chart",
                "Line chart",
                "Histogram",
              ],
              answer: 1,
              explain:
                "Comparing amounts is bar work. Sorting does half the analysis; horizontal bars leave room for names.",
            },
            {
              type: "mc",
              prompt:
                "Most weekly scores cluster low, with a few big outliers. Which chart?",
              options: ["Histogram", "Pie chart", "Line chart", "Bar chart"],
              answer: 0,
              explain:
                "A histogram shows one distribution's shape — skew and outliers, visible.",
            },
          ],
        },
        {
          id: "u9-l2",
          title: "Axes That Don't Lie",
          blurb: "Truncated axes and other honest-looking traps.",
          brief: {
            goal: "Build charts that don't overstate the data.",
      steps: [
        {
          title: "Accurate numbers can still mislead",
          body: "Every label right, every value correct — and the reader still walks away with the wrong story. Usually by accident.",
        },
        {
          title: "Where the axis starts changes the story",
          body: "Bars encode value by length, so start at zero. Start at 20 and a tiny gap looks like a rout. Lines encode change — a truncated axis can be fine there.",
          note: "Ask: what would someone conclude in two seconds without reading the axis? If that's wrong, the chart is wrong.",
        },
      ],
            setup:
              "Bars = length, so baseline must be zero. Truncate and a 5% gap looks like a landslide. Lines encode change — non-zero baselines can be honest. Knowing which rule applies is the skill.",
          },
          intro: {
            title: "Where the axis starts changes the story",
            text: "Start a bar chart at 20 instead of 0 and a 5% gap looks huge. Bars need zero. Lines track change — a non-zero baseline is often fine.",
          },
          film: [
            {
              title: "The rule, and its exception",
              text: "Bars: always start at zero. Lines: zero optional — but label clearly, and don't zoom ordinary noise into a crisis.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "A bar chart's y-axis starts at 20 instead of 0. What's the effect?",
              options: [
                "It saves space and is fine",
                "Small differences look far bigger than they are",
                "Nothing changes",
                "It makes the bars more accurate",
              ],
              answer: 1,
              explain:
                "Bar length is the value. Cut the baseline and every gap looks bigger than it is.",
            },
            {
              type: "mc",
              prompt: "Which chart type can skip a zero baseline?",
              options: [
                "Bar chart",
                "Stacked bar chart",
                "Line chart tracking change over time",
                "None ever",
              ],
              answer: 2,
              explain:
                "Lines encode change, not magnitude — a zoomed axis can be the honest choice.",
            },
            {
              type: "mc",
              prompt: "What belongs on nearly every chart you ship?",
              options: [
                "A 3D effect",
                "Axis labels with units, and a title stating the takeaway",
                "As many colors as possible",
                "The raw query underneath",
              ],
              answer: 1,
              explain:
                "Unlabeled axes die out of context — and charts always travel. Title with the finding.",
            },
            {
              type: "mc",
              prompt:
                "Your chart uses red and green for two groups. What's the accessibility problem?",
              options: [
                "Red and green are unprofessional",
                "Roughly 1 in 12 men can't reliably distinguish them",
                "They print poorly",
                "There is no problem",
              ],
              answer: 1,
              explain:
                "Red/green is the most common color-vision issue. Use blue/orange, or vary shape too.",
            },
          ],
        },
        {
          id: "u9-l3",
          title: "One Chart, One Point",
          blurb: "Cut everything that isn't the argument.",
          brief: {
            goal: "Trim a chart down to the one thing it's arguing.",
      steps: [
        {
          title: "Most charts try to say too much",
          body: "Every gridline, legend, and color spends attention. Spend it six ways and the reader leaves with none.",
        },
        {
          title: "If it doesn't serve the point, delete it",
          body: "Say the finding in one sentence. Remove anything that isn't helping. Color is your strongest tool — spend it on what you want noticed; gray the rest.",
        },
      ],
            setup:
              "Every extra mark competes for attention. Say the finding out loud, then delete anything that isn't helping. A title that states the finding beats any styling.",
          },
          intro: {
            title: "If it doesn't serve the point, delete it",
            text: "One clear claim beats a dashboard of eight vague ones. Say your finding in a sentence — then cut anything on the chart that isn't helping you say it.",
          },
          exercises: [
            {
              type: "mc",
              prompt:
                "You have 40 players to plot but your point is about the top 5. What's usually best?",
              options: [
                "Plot all 40 so nothing is hidden",
                "Plot the top 5 and note the full set is available",
                "Plot 40 with all names labeled",
                "Use a pie chart of all 40",
              ],
              answer: 1,
              explain:
                "Show the argument; keep the rest available. Forty labeled bars dump the analysis on the reader.",
            },
            {
              type: "mc",
              prompt: "Which title does the most work?",
              options: [
                '"Points by Week"',
                '"Chart 3"',
                '"Target share collapsed after the Week 8 trade"',
                '"Data Analysis Results"',
              ],
              answer: 2,
              explain:
                "A title that states the finding lands even on a two-second glance.",
            },
            {
              type: "mc",
              prompt:
                "A stakeholder says your chart is 'too simple.' Strongest response?",
              options: [
                "Add more series and colors",
                "Switch to 3D",
                "Ask which decision they need to make, and check the chart answers it",
                "Send the raw spreadsheet instead",
              ],
              answer: 2,
              explain:
                "Simplicity isn't the flaw — mismatch with the decision is. Anchor on what they need to decide.",
            },
            {
              type: "fill",
              prompt:
                "Label the chart so it survives a Slack screenshot.",
              parts: [
                'ax.set_title("RB target share fell after Week 8")\nax.set_xlabel("Week")\nax.',
                null,
                '("Target share (%)")',
              ],
              bank: ["set_ylabel", "set_xlim", "legend", "grid"],
              answer: ["set_ylabel"],
              explain:
                "set_ylabel names the y-axis and its units. Units are the part people forget.",
            },
          ],
        },
      ],
    },
    {
      id: "u10",
      number: 10,
      title: "Git & GitHub — Show Your Work",
      drive: "10th Drive · Two-Minute Warning",
      description:
        "Commits, branches, and pull requests. Every analyst job expects this, almost no course teaches it, and it's what turns your capstone into something a hiring manager can actually open.",
      skills: ["commit", "branch", "pull request", "clone"],
      status: "live",
      lessons: [
        {
          id: "u10-l1",
          title: "Save States for Code",
          blurb: "add, commit — and kill analysis_final_v3_REAL.py.",
          brief: {
            goal: "Save your work in git so you can delete boldly.",
      steps: [
        {
          title: "Git lets you be reckless",
          body: "Once work is saved properly, you can try the risky rewrite. Getting back is one command.",
        },
        {
          title: "A commit is a save point",
          body: "Stage with add. Save with commit and a message. That message is for future-you — usually with no memory of this.",
          code: "git add analysis.sql\ngit commit -m 'Add season totals query'",
          note: "Commit small and often. One change is easy to undo. A week's work in one commit isn't.",
        },
      ],
            setup:
              "Git records snapshots. Stage with `git add`, save with `git commit -m \"message\"`. Every commit is recoverable — so you can stop hoarding final_v3_REAL.py.",
          },
          intro: {
            title: "A commit is a save point",
            text: "Stage what you want with `git add`, then save with `git commit -m \"message\"`. Recoverable forever — that's what frees you to delete boldly.",
            code: 'git add analysis.py\ngit commit -m "Add target share calculation"',
          },
          film: [
            {
              title: "Write a message worth reading",
              text: "'Fix bye-week double count in weekly totals' helps future-you at 11pm. 'update' and 'fix' don't.",
            },
          ],
          exercises: [
            {
              type: "fill",
              prompt: "Stage a file, then save it with a message.",
              parts: [
                "git ",
                null,
                " analysis.py\ngit ",
                null,
                ' -m "Add target share calculation"',
              ],
              bank: ["add", "commit", "push", "save"],
              answer: ["add", "commit"],
              explain:
                "add stages, commit saves. Two steps so you can commit part of your changes and leave the rest.",
            },
            {
              type: "mc",
              prompt: "Which commit message is actually useful?",
              options: [
                '"update"',
                '"fix bug"',
                '"Fix bye-week rows being double counted in season totals"',
                '"asdf"',
              ],
              answer: 2,
              explain:
                "It names the bug and where it lived. Six months later, that's the difference between understanding and rewriting.",
            },
            {
              type: "mc",
              prompt: "What does `git status` tell you?",
              options: [
                "Which files changed and what's staged",
                "Your internet speed",
                "How many lines of code you've written",
                "Who else is on the repo",
              ],
              answer: 0,
              explain:
                "status is the command you'll run constantly — modified, staged, ignored.",
            },
            {
              type: "mc",
              prompt:
                "You committed an API key by mistake. What's true about git?",
              options: [
                "Deleting the file next commit removes it completely",
                "It stays in the history — rotate the key, it's compromised",
                "Git encrypts secrets automatically",
                "Only you can see it",
              ],
              answer: 1,
              explain:
                "History keeps everything. Treat the key as leaked and rotate it. That's why .gitignore exists.",
            },
          ],
        },
        {
          id: "u10-l2",
          title: "Branches",
          blurb: "Try something risky without breaking what works.",
          brief: {
            goal: "Experiment on a branch without risking main.",
      steps: [
        {
          title: "You'll want to try something risky",
          body: "A rewrite that might not work. Doing that on the code everyone depends on leaves you with a broken main and no clean way back.",
        },
        {
          title: "A branch is a parallel drive",
          body: "main stays safe. You experiment on the branch. Merge only when it's good — or delete the branch and nothing was harmed.",
          code: "git checkout -b rolling-averages",
          note: "Branches are cheap. One for a half-hour experiment is normal, not overkill.",
        },
      ],
            setup:
              "A branch is an independent line of work. main keeps running while you try something. Fail? Delete the branch. Win? Merge it back.",
          },
          intro: {
            title: "A branch is a parallel drive",
            text: "Leave main untouched. Experiment on a branch. Merge only if it pans out — otherwise delete it and nothing was at risk.",
            code: "git checkout -b rolling-averages\n# ...work, commit...\ngit checkout main\ngit merge rolling-averages",
          },
          exercises: [
            {
              type: "fill",
              prompt: "Create a new branch and switch to it in one command.",
              parts: ["git checkout ", null, " rolling-averages"],
              bank: ["-b", "-m", "--new", "-a"],
              answer: ["-b"],
              explain:
                "-b creates the branch and switches to it. Without -b, git expects it already exists.",
            },
            {
              type: "mc",
              prompt: "Why branch instead of editing main directly?",
              options: [
                "It's faster",
                "main keeps working while you experiment, and bad ideas cost nothing",
                "Git requires it",
                "It uses less disk space",
              ],
              answer: 1,
              explain:
                "Isolation. Broken half-finished work never touches the version that runs.",
            },
            {
              type: "mc",
              prompt: "What is a merge conflict?",
              options: [
                "Two people changed the same lines and git needs you to choose",
                "Your internet dropped",
                "The repo is corrupted",
                "You committed too often",
              ],
              answer: 0,
              explain:
                "Git merges automatically when changes don't overlap. When they do, it asks a human — normal, not failure.",
            },
            {
              type: "mc",
              prompt:
                "You've finished a branch and merged it. What's the tidy next step?",
              options: [
                "Never touch git again",
                "Delete the merged branch",
                "Rename main",
                "Force push over main",
              ],
              answer: 1,
              explain:
                "Merged branches are noise. Delete them so the list shows only live work.",
            },
          ],
        },
        {
          id: "u10-l3",
          title: "Pull Requests & Your Portfolio",
          blurb: "How work gets reviewed — and how a hiring manager finds it.",
          brief: {
            goal: "Get work reviewed, and make a repo a hiring manager can read.",
      steps: [
        {
          title: "This one's about getting hired",
          body: "Pull requests are how most teams ship. A public repo someone can actually read beats any certificate.",
        },
        {
          title: "A pull request is a proposal",
          body: "Push a branch, open a PR: here's what changed, here's why, please look. Review, comments, then merge.",
          note: "Hiring managers read the README first. What it does, what data, what you found. Code with no explanation isn't evidence.",
        },
      ],
            setup:
              "A pull request proposes a change for review — how most data teams ship. It's also an artifact an interviewer can read: your reasoning, in public.",
          },
          intro: {
            title: "A pull request is a proposal",
            text: "Push a branch, open a PR: here's what I changed, here's why, please review. That's how teams ship — and how a hiring manager sees your thinking.",
          },
          film: [
            {
              title: "The README does the hiring",
              text: "Most people read the README and leave. Lead with the question, one screenshot of the finding, and how to run it.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does opening a pull request actually do?",
              options: [
                "Immediately overwrites main",
                "Proposes your branch's changes for review before merging",
                "Deletes your branch",
                "Makes the repo public",
              ],
              answer: 1,
              explain:
                "It's a request, not an action — discuss first, then merge.",
            },
            {
              type: "mc",
              prompt:
                "A reviewer questions your approach. Best response?",
              options: [
                "Merge anyway",
                "Explain your reasoning and ask what they'd prefer",
                "Close the PR and give up",
                "Rewrite everything without replying",
              ],
              answer: 1,
              explain:
                "Review is a conversation. Defend a choice — and change your mind in public when you should.",
            },
            {
              type: "mc",
              prompt: "What should your capstone README open with?",
              options: [
                "Your full CV",
                "The question the project answers and what you found",
                "Install instructions for Python",
                "A list of every file",
              ],
              answer: 1,
              explain:
                "Lead with the question and the finding. Setup details matter further down.",
            },
            {
              type: "mc",
              prompt:
                "Why does a public repo with real commit history beat one uploaded notebook?",
              options: [
                "It looks longer",
                "It shows how you work and think over time, not just the final artifact",
                "GitHub ranks it higher",
                "It's the only accepted format",
              ],
              answer: 1,
              explain:
                "History is evidence of process — iteration, fixes, judgment.",
            },
          ],
        },
      ],
    },
    {
      id: "u11",
      number: 11,
      title: "R & the Tidyverse — The Other Dialect",
      drive: "11th Drive · Overtime",
      description:
        "dplyr, pipes, and ggplot2. A large share of public sports analytics is written in R — including nflverse, the source of the Practice Field data. Reading it is a real advantage.",
      skills: ["dplyr", "pipes", "ggplot2"],
      status: "live",
      lessons: [
        {
          id: "u11-l1",
          title: "Why R Is Still Here",
          blurb: "Where R wins — and why sports analytics leans on it.",
          brief: {
            goal: "See where R fits next to Python.",
      steps: [
        {
          title: "An honest answer first",
          body: "For a typical company analyst job, Python is the safer bet. R is worth your time for a specific reason — know that before you sink hours here.",
        },
        {
          title: "R was built for data from day one",
          body: "Python grew great data tools. R was designed for stats first — tables, factors, models feel native. That's why academia and a lot of published sports analytics still run on it.",
          note: "Even if you never write R, reading it helps. A lot of public sports work worth learning from ships as R.",
        },
      ],
            setup:
              "R was built for statistics, so tables and models are native. A lot of public sports analytics — nflverse included — ships as R packages. Reading R is an advantage even if you write mostly Python.",
          },
          intro: {
            title: "R was built for data",
            text: "Python is a general language that grew data tools. R was designed for stats from the start. In sports, a huge share of public work — nflverse included — ships as R packages.",
          },
          film: [
            {
              title: "You don't have to choose",
              text: "Most analysts read both and write mostly one. Filter, group, aggregate, sort — same ideas. Switching languages is vocabulary, not a new brain.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Why does R matter for sports analytics specifically?",
              options: [
                "It's faster than Python at everything",
                "Much of the public work, including nflverse, is written in R",
                "Python can't do statistics",
                "It's required for SQL",
              ],
              answer: 1,
              explain:
                "The ecosystem is the reason. If the package that solves your problem is in R, reading R is the shortest path.",
            },
            {
              type: "mc",
              prompt: "In R, which assigns 24.6 to a variable?",
              options: [
                "points <- 24.6",
                "points => 24.6",
                "24.6 -> points only",
                "let points = 24.6",
              ],
              answer: 0,
              explain:
                "`<-` is R's usual assignment. `=` often works too, but `<-` is what you'll see published.",
            },
            {
              type: "mc",
              prompt:
                "You know pandas well. What's the honest effort to read basic dplyr?",
              options: [
                "Months — it's a totally different paradigm",
                "Small — the verbs map almost one to one",
                "Impossible without a stats degree",
                "None, the syntax is identical",
              ],
              answer: 1,
              explain:
                "filter / group_by / summarise / arrange line up with SQL and pandas. New punctuation; same ideas.",
            },
          ],
        },
        {
          id: "u11-l2",
          title: "dplyr Is SQL With Pipes",
          blurb: "filter, group_by, summarise, arrange — same five moves.",
          brief: {
            goal: "Run real dplyr and see it's the SQL you already know.",
      steps: [
        {
          title: "You already know these verbs",
          body: "filter, arrange, group_by, summarise — that's WHERE, ORDER BY, GROUP BY, and your aggregates. Mostly translation, not new concepts.",
        },
        {
          title: "The pipe passes data along",
          body: "Whatever's on the left feeds into the right as the first argument. Chains read in the order the work happens.",
          code: "week_results |>\n  filter(season == 2024) |>\n  group_by(player) |>\n  summarise(total = sum(fantasy_pts))",
          note: "Older code uses %>% instead of |>. Same job here; |> is newer and built into R.",
        },
      ],
            setup:
              "R runs live here, dplyr included. The pipe |> feeds left into right: take the data, filter, group, summarise, sort. Same five moves as SQL.",
          },
          intro: {
            title: "The pipe passes data along",
            text: "|> (or %>% in older code) takes the left side and feeds it to the function on the right. Write the chain in the order you'd say it out loud.",
            code: 'week_results |>\n  filter(position == "RB") |>\n  group_by(player) |>\n  summarise(total = sum(points)) |>\n  arrange(desc(total))',
          },
          film: [
            {
              title: "The cheat sheet",
              text: "One map covers SQL, pandas, and dplyr. Learn the idea once; the rest is spelling.",
              code: "WHERE     →  df[df.x > 1]        →  filter(x > 1)\nGROUP BY  →  df.groupby(\"x\")     →  group_by(x)\nAVG/SUM   →  .mean() / .sum()    →  summarise(...)\nORDER BY  →  .sort_values(\"x\")   →  arrange(x)",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which dplyr verb is SQL's WHERE?",
              options: ["select()", "filter()", "arrange()", "mutate()"],
              answer: 1,
              explain:
                "filter() picks rows. Careful: R's select() picks COLUMNS — SQL's SELECT list, not a row filter.",
            },
            {
              type: "fill",
              prompt:
                "Total each running back's points, highest first.",
              parts: [
                'week_results |>\n  filter(position == "RB") |>\n  ',
                null,
                "(player) |>\n  summarise(total = sum(points)) |>\n  ",
                null,
                "(desc(total))",
              ],
              bank: ["group_by", "arrange", "select", "mutate"],
              answer: ["group_by", "arrange"],
              explain:
                "group_by + summarise is GROUP BY + aggregate; arrange(desc()) is ORDER BY DESC. Same shape as SQL.",
            },
            {
              type: "mc",
              prompt: "What does mutate() do?",
              options: [
                "Deletes rows",
                "Adds or changes a column",
                "Sorts the table",
                "Renames the dataset",
              ],
              answer: 1,
              explain:
                "mutate() adds or changes a column — like points / games AS avg in SQL.",
            },
            {
              type: "mc",
              prompt: "What does the pipe |> actually do?",
              options: [
                "Runs two things at once",
                "Passes the left-hand result into the right-hand function",
                "Comments out a line",
                "Joins two tables",
              ],
              answer: 1,
              explain:
                "It threads data through steps in reading order — chains read like sentences, not nested calls.",
            },
            {
              type: "code",
              lang: "r",
              prompt:
                "Real R with dplyr, running in your browser. Print the players who scored over 20, highest first.",
              starter:
                'suppressMessages(library(dplyr))\n\ndf <- data.frame(\n  player = c("Hurts", "Bijan", "Nacua", "Kelce"),\n  points = c(24.6, 18.2, 31.0, 22.4)\n)\n\n# filter to points > 20, arrange descending, then print(out$player)\n',
              expected:
                'suppressMessages(library(dplyr))\ndf <- data.frame(player=c("Hurts","Bijan","Nacua","Kelce"), points=c(24.6,18.2,31.0,22.4))\nout <- df |> filter(points > 20) |> arrange(desc(points))\nprint(out$player)',
              hint: "df |> filter(points > 20) |> arrange(desc(points)), store it in `out`, then print(out$player).",
              explain:
                'Same three moves as SQL and pandas — filter, arrange, select — just spelled in dplyr.',
            },
            {
              type: "code",
              lang: "r",
              prompt:
                "GROUP BY in dplyr. Print the mean points per position.",
              starter:
                'suppressMessages(library(dplyr))\n\ndf <- data.frame(\n  position = c("RB", "WR", "RB", "WR"),\n  points = c(18.2, 31.0, 12.4, 22.4)\n)\n\n# group by position, summarise the mean, then print it\n',
              expected:
                'suppressMessages(library(dplyr))\ndf <- data.frame(position=c("RB","WR","RB","WR"), points=c(18.2,31.0,12.4,22.4))\nout <- df |> group_by(position) |> summarise(avg = mean(points))\nprint(as.data.frame(out))',
              hint: "df |> group_by(position) |> summarise(avg = mean(points)), then print(as.data.frame(out)).",
              explain:
                "group_by + summarise is GROUP BY + AVG. Same aggregation — three languages.",
            },
          ],
        },
        {
          id: "u11-l3",
          title: "ggplot2 in Layers",
          blurb: "Build a chart by stacking pieces, not by picking a template.",
          brief: {
            goal: "Build a chart in layers with ggplot2.",
      steps: [
        {
          title: "Why many people learn R",
          body: "ggplot2 is built on a theory of charts, not a menu of types. Learn it and you'll think differently about charts — even back in Python.",
        },
        {
          title: "Data, mapping, geometry",
          body: "Name the data. Map columns to x, y, color with aes. Add a geometry that draws them. Layers join with +. Swap the geom — same mapping, new chart.",
          code: "ggplot(df, aes(x = week, y = fantasy_pts)) +\n  geom_line()",
          note: "Declare what the data means once. How it looks is a separate layer on top.",
        },
      ],
            setup:
              "ggplot2 joins layers with +. Name the data, map columns with aes(), add a geometry. Swap the geom and the same mapping becomes a different chart.",
          },
          intro: {
            title: "Data, mapping, geometry",
            text: "Layers join with +. Name the data, map columns (x, y, color) with aes(), then add a geom — point, bar, or line. Change the geom; keep the mapping.",
            code: 'ggplot(rbs, aes(x = targets, y = points)) +\n  geom_point() +\n  labs(title = "Targets drive points")',
          },
          exercises: [
            {
              type: "mc",
              prompt: "In ggplot2, what does aes() do?",
              options: [
                "Sets the color theme",
                "Maps data columns to visual properties like x, y, and color",
                "Saves the chart",
                "Filters the data",
              ],
              answer: 1,
              explain:
                "aes() maps columns to what you see. Fixed color goes outside aes(); a column mapped to color goes inside.",
            },
            {
              type: "fill",
              prompt: "Turn this mapping into a scatter plot.",
              parts: [
                "ggplot(rbs, aes(x = targets, y = points)) ",
                null,
                "\n  ",
                null,
                "()",
              ],
              bank: ["+", "|>", "geom_point", "geom_col"],
              answer: ["+", "geom_point"],
              explain:
                "Layers join with + (not the pipe — classic stumble). geom_point() draws one dot per row.",
            },
            {
              type: "mc",
              prompt:
                "You have the scatter plot and now want bars instead. What changes?",
              options: [
                "Rewrite everything",
                "Swap geom_point() for geom_col()",
                "Change the data",
                "Add a pie layer",
              ],
              answer: 1,
              explain:
                "Data and mapping stay; only the geometry swaps. That's the payoff.",
            },
            {
              type: "mc",
              prompt:
                "Which mistake will R actually complain about most often here?",
              options: [
                "Using + between ggplot layers",
                "Using |> between ggplot layers",
                "Calling labs()",
                "Mapping x and y inside aes()",
              ],
              answer: 1,
              explain:
                "ggplot2 joins layers with +. Piping between layers is the stumble almost everyone hits once.",
            },
          ],
        },
      ],
    },
    {
      id: "u12",
      number: 12,
      title: "AI — Shipping Features, Not Demos",
      drive: "12th Drive · Red Zone",
      description:
        "Prompts that survive users, evals that catch regressions, and retrieval over real sports text. Placeholder unit — drills arrive with the AI Engineer playbook.",
      skills: ["Prompts", "Evals", "RAG", "Guardrails"],
      status: "coming-soon",
      lessons: [],
    },
    {
      id: "u13",
      number: 13,
      title: "Python — Logic, Functions & Shortcuts",
      drive: "2nd Drive · Own 40",
      description:
        "Decisions, reusable functions, and the comprehensions that turn five lines into one. The half of Python that stops you writing the same block over and over.",
      skills: ["if/elif", "def", "Comprehensions", "Dictionaries"],
      status: "live",
      lessons: [
        {
          id: "u13-l1",
          title: "Making Decisions",
          blurb: "if / elif / else — tier a performance.",
          brief: {
            goal: "Make your code choose between paths.",
      steps: [
        {
          title: "Straight-through code only goes so far",
          body: "So far every line always runs. Real programs choose: boom game, skip that row, handle a miss differently.",
        },
        {
          title: "if, elif, else — and the colon",
          body: "The colon opens a block. Indented lines run when the test passes. Python takes the first true branch, so order is part of the logic.",
          code: "points = 24.6\nif points >= 20:\n    print('Boom')\nelif points >= 12:\n    print('Solid')\nelse:\n    print('Bust')",
          note: "Strictest test first. Flip the order and everything over 20 gets labelled Solid — no warning.",
        },
      ],
            setup:
              "So far your code ran straight through. `if` branches: test, then run that block only when true. `elif` adds another test; `else` catches the rest. Indentation marks the block — Python has no braces.",
          },
          intro: {
            title: "Indentation is the syntax",
            text: "Colon opens a block; indented lines are that block. Wrong indent → an error, or worse, the line always runs. Four spaces is the convention.",
            code: 'points = 24.6\n\nif points >= 20:\n    print("Boom game")\nelif points >= 12:\n    print("Solid")\nelse:\n    print("Bust")',
          },
          film: [
            {
              title: "Order matters in an if-chain",
              text: "First true branch wins; the rest are skipped. Test >= 20 before >= 12, or every boom gets labelled Solid — quietly wrong, no error.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "Your chain tests `if points >= 12` first, then `elif points >= 20`. What happens to a 24-point game?",
              options: [
                "It's labelled with the 20+ branch",
                "It's labelled with the 12+ branch — the first passing test wins",
                "Both branches run",
                "Python raises an error",
              ],
              answer: 1,
              explain:
                "First match wins. Put the strictest threshold first, or the top tier never runs.",
            },
            {
              type: "fill",
              prompt: "Complete the branch keywords.",
              parts: [
                "if points >= 20:\n    print(\"Boom\")\n",
                null,
                " points >= 12:\n    print(\"Solid\")\n",
                null,
                ":\n    print(\"Bust\")",
              ],
              bank: ["elif", "else", "else if", "elsif"],
              answer: ["elif", "else"],
              explain:
                "Python spells it `elif`, not `else if`. `else` takes no condition — whatever's left.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Print the tier for a 17.5-point game: Boom at 20+, Solid at 12+, otherwise Bust.",
              starter:
                'points = 17.5\n\n# print "Boom", "Solid" or "Bust"\n',
              expected: 'print("Solid")',
              hint: "if points >= 20: ... elif points >= 12: ... else: ... — and print inside each branch.",
              explain:
                "Solid. Bucketing a number into named tiers is a move you'll do constantly.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Loop the weeks and print how many were boom games (20 or more).",
              starter:
                "weeks = [24.6, 8.2, 31.0, 12.5, 19.9, 22.1]\n\n# count the games at 20 or above, then print the count\n",
              expected: "print(3)",
              hint: "Start a counter at 0, loop with `for w in weeks:`, add 1 inside an `if w >= 20:`, then print the counter.",
              explain:
                "Three. A loop, a condition, and a counter — that trio answers a lot of real questions.",
            },
          ],
        },
        {
          id: "u13-l2",
          title: "Package It in a Function",
          blurb: "def: write the logic once, use it everywhere.",
          brief: {
            goal: "Turn code you keep repeating into something you can call.",
      steps: [
        {
          title: "You'll catch yourself repeating things",
          body: "Same three lines, one number changed. That repetition is a signal: there's a named idea hiding that hasn't been named yet.",
        },
        {
          title: "A function is that idea, named",
          body: "def gives it a name and inputs. Everything indented under it is the body. Call it later with new inputs and it runs again.",
          code: "def per_game(total, games):\n    return total / games\n\nprint(round(per_game(128.4, 6), 1))",
          note: "return hands a value back. print only shows on screen. Mixing those up costs beginners more time than almost anything else.",
        },
      ],
            setup:
              "Copy-pasting the same logic for four players is how bugs get in — you fix one copy and miss the others. A function names that logic once. `def` defines it; `return` hands a value back.",
          },
          intro: {
            title: "return hands a value back; print just shows it",
            text: "`print` writes to the screen and gives the caller nothing. `return` gives a value you can store or pass on — and stops the function. A function that only prints can't be built on.",
            code: 'def tier(points):\n    if points >= 20:\n        return "Boom"\n    elif points >= 12:\n        return "Solid"\n    return "Bust"\n\nprint(tier(24.6))',
          },
          film: [
            {
              title: "Default arguments",
              text: "Give a parameter a default and callers can skip it: `def tier(points, boom=20)` works as tier(24.6) or tier(24.6, 25).",
              code: 'def tier(points, boom=20):\n    return "Boom" if points >= boom else "Not boom"',
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What's the difference between `return x` and `print(x)`?",
              options: [
                "Nothing",
                "return hands the value back to the caller; print only displays it and returns None",
                "print is faster",
                "return only works with numbers",
              ],
              answer: 1,
              explain:
                "A function that only prints returns None. `total = tier(p)` gets nothing useful.",
            },
            {
              type: "fill",
              prompt: "Define a function and hand back its answer.",
              parts: [
                null,
                " per_game(total, games):\n    ",
                null,
                " total / games",
              ],
              bank: ["def", "return", "function", "print"],
              answer: ["def", "return"],
              explain:
                "`def` names it; `return` gives the value back. Skip return and you silently get None.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Write a function `per_game(total, games)` that returns points per game, and print it for 128.4 points over 6 games, rounded to 1 decimal.",
              starter:
                "# define per_game, then print the rounded result for 128.4 over 6\n",
              expected: "print(round(128.4 / 6, 1))",
              hint: "def per_game(total, games): return total / games — then print(round(per_game(128.4, 6), 1)).",
              explain:
                "21.4. Now the logic has a name — every caller uses the same one.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Using a function, print the tier for each of these scores on its own line: 24.6, 11.0, 15.2. Boom at 20+, Solid at 12+, else Bust.",
              starter:
                "scores = [24.6, 11.0, 15.2]\n\n# define tier(points), then loop and print each one\n",
              expected: 'print("Boom")\nprint("Bust")\nprint("Solid")',
              hint: "Define tier(points) with if/elif/return, then `for s in scores: print(tier(s))`.",
              explain:
                "Boom, Bust, Solid. One function, three calls. Thresholds change? Edit one place.",
            },
          ],
        },
        {
          id: "u13-l3",
          title: "Dictionaries",
          blurb: "Look things up by name instead of by position.",
          brief: {
            goal: "Store and retrieve values by a key you choose.",
      steps: [
        {
          title: "Lists are ordered — not always what you want",
          body: "Lists are great when position matters. Useless when you want to look something up by name — you'd have to remember which slot.",
        },
        {
          title: "A dictionary looks up by a key you choose",
          body: "Curly braces. Each entry is key, colon, value. Fetch by handing over the key — how you usually think about data.",
          code: "ppg = {'Josh Allen': 22.9, 'Travis Kelce': 12.7}\nprint(ppg['Travis Kelce'])",
          note: "Asking for a key that is not there raises an error rather than returning nothing. That is deliberate: a silent wrong answer would be worse.",
        },
      ],
            setup:
              "A list finds by position — scores[2] says 'the third one,' not who. A dict finds by a key you pick: ppg[\"Josh Allen\"]. Keys are unique; reassigning overwrites.",
          },
          intro: {
            title: "Curly braces, key: value",
            text: "Write {key: value}. Read with brackets and the key. Missing key → KeyError. Use .get(key, default) when a miss is normal.",
            code: 'ppg = {"Josh Allen": 22.9, "Travis Kelce": 12.7}\n\nprint(ppg["Josh Allen"])\nprint(ppg.get("Nobody", 0))',
          },
          exercises: [
            {
              type: "mc",
              prompt: "What does `ppg[\"Nobody\"]` do when that key doesn't exist?",
              options: [
                "Returns None",
                "Returns 0",
                "Raises a KeyError",
                "Adds the key",
              ],
              answer: 2,
              explain:
                "It raises. `.get(\"Nobody\", 0)` is the version that returns a fallback instead of blowing up.",
            },
            {
              type: "mc",
              prompt: "Why use a dict instead of two parallel lists?",
              options: [
                "Dicts are always faster",
                "The key travels with the value, so they can't drift out of sync",
                "Lists can't hold numbers",
                "Dicts are sorted",
              ],
              answer: 1,
              explain:
                "Two lists need positions to stay lined up. Sort one, forget the other — every lookup is silently wrong.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Build a dict of player to points and print Kelce's value.",
              starter:
                '# keys: "Josh Allen" 22.9, "Travis Kelce" 12.7, "Puka Nacua" 13.7\n# print Travis Kelce\'s points\n',
              expected: "print(12.7)",
              hint: 'ppg = {"Josh Allen": 22.9, "Travis Kelce": 12.7, "Puka Nacua": 13.7} then print(ppg["Travis Kelce"]).',
              explain:
                "12.7 — and the lookup reads like the question you asked.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Loop the dict and print only the players averaging over 13, one name per line, in the order they appear.",
              starter:
                'ppg = {"Josh Allen": 22.9, "Travis Kelce": 12.7, "Puka Nacua": 13.7}\n\n# print each name scoring over 13\n',
              expected: 'print("Josh Allen")\nprint("Puka Nacua")',
              hint: "for name, pts in ppg.items(): then an if on pts before printing name.",
              explain:
                ".items() hands you key and value together — that's what makes filtering a dict readable.",
            },
          ],
        },
        {
          id: "u13-l4",
          title: "Comprehensions",
          blurb: "Five lines become one — without becoming unreadable.",
          brief: {
            goal: "Build a new list from an old one in a single expression.",
      steps: [
        {
          title: "Building a list from another is common",
          body: "Keep the ones that qualify, transform each, hand me the result. A loop with append works — and takes four lines every time.",
        },
        {
          title: "A comprehension says it in one",
          body: "Read left to right: give me this, for each of those, where that's true. The trailing if is optional.",
          code: "weeks = [24.6, 8.2, 31.0, 12.5]\nprint([w for w in weeks if w >= 20])",
          note: "Comprehensions are idiomatic Python, so you will meet them constantly in other people's code. Being able to read one matters more than always writing one.",
        },
      ],
            setup:
              "Empty list + loop + append is three lines of ceremony. A comprehension says it in one. You'll read more than you write — recognise them.",
          },
          intro: {
            title: "[expression for item in list if condition]",
            text: "Read it as a sentence: give me this, for each of those, where that's true. Optional if. Squinting to read one? Write it back out as a loop.",
            code: "weeks = [24.6, 8.2, 31.0, 12.5]\n\ndoubled = [w * 2 for w in weeks]\nbooms   = [w for w in weeks if w >= 20]",
          },
          film: [
            {
              title: "The loop it replaces",
              text: "Same list either way. Comprehensions aren't faster to invent at first — they're faster to read once you're used to them.",
              code: "booms = []\nfor w in weeks:\n    if w >= 20:\n        booms.append(w)\n\n# same thing\nbooms = [w for w in weeks if w >= 20]",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does `[w for w in weeks if w >= 20]` produce?",
              options: [
                "True or False",
                "A new list containing only the weeks at 20 or above",
                "The count of big weeks",
                "The original list, sorted",
              ],
              answer: 1,
              explain:
                "A new list. The original stays untouched — comprehensions build; they don't edit in place.",
            },
            {
              type: "fill",
              prompt: "Keep only the boom weeks.",
              parts: [
                "booms = [w ",
                null,
                " w in weeks ",
                null,
                " w >= 20]",
              ],
              bank: ["for", "if", "in", "where"],
              answer: ["for", "if"],
              explain:
                "`for` names the item; `if` filters. SQL's WHERE in different clothes.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Using a comprehension, print the list of weeks at 20 or above.",
              starter:
                "weeks = [24.6, 8.2, 31.0, 12.5, 19.9, 22.1]\n\n# print the boom weeks as a list\n",
              expected: "print([24.6, 31.0, 22.1])",
              hint: "print([w for w in weeks if w >= 20])",
              explain:
                "[24.6, 31.0, 22.1]. One line — intent right on it.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Print the players' names in upper case as a list, using a comprehension.",
              starter:
                'names = ["Hurts", "Bijan", "Nacua"]\n\n# print the upper-cased names as a list\n',
              expected: 'print(["HURTS", "BIJAN", "NACUA"])',
              hint: "print([n.upper() for n in names])",
              explain:
                "The left side can be any transformation — easy to forget while focusing on the filter.",
            },
          ],
        },
      ],
    },
    {
      id: "u14",
      number: 14,
      title: "pandas for Real Data",
      drive: "3rd Drive · Red Zone",
      description:
        "Filter, group, join and clean a DataFrame. Every SQL verb you already know, plus the mess that real files arrive in.",
      skills: ["groupby", "merge", "Cleaning", "Missing data"],
      status: "live",
      lessons: [
        {
          id: "u14-l1",
          title: "Filter and Sort a DataFrame",
          blurb: "pandas' WHERE and ORDER BY.",
          brief: {
            goal: "Cut a DataFrame down to the rows you want, in the order you want.",
      steps: [
        {
          title: "Now the SQL translation gets literal",
          body: "Filtering and sorting are the two things you reached for most in SQL, and they are the two things you will reach for most here. The thinking transfers completely. Only the punctuation is new.",
        },
        {
          title: "A mask is a column of True and False",
          body: "This is the bit worth slowing down for. Writing a comparison on a column does not return rows. It returns True or False for every row. Putting that result inside square brackets is the step that actually selects.",
          code: "df[df['points'] > 20].sort_values('points', ascending=False)",
          note: "Combining conditions needs & and | rather than and or, and every condition needs its own brackets, because & binds tighter than the comparison does.",
        },
      ],
            setup:
              "You already know filter and sort from SQL. pandas: boolean mask in brackets for WHERE, .sort_values() for ORDER BY. Same thinking; new spelling.",
          },
          intro: {
            title: "A mask is a column of True and False",
            text: 'df["points"] > 20 doesn\'t return rows — it returns a True/False value for every row. Putting that inside df[...] keeps only the Trues. Once you see the mask as its own thing, chained conditions stop looking like magic.',
            code: 'import pandas as pd\n\ndf = pd.DataFrame({"player": ["Hurts", "Bijan"], "points": [24.6, 18.2]})\n\ndf[df["points"] > 20]\ndf.sort_values("points", ascending=False)',
          },
          film: [
            {
              title: "Combining conditions needs parentheses",
              text: "pandas uses & and | rather than `and` / `or`, and they bind tighter than the comparisons — so every condition needs its own parentheses. Leave them out and you get a confusing error about ambiguous truth values, which is pandas' least helpful message.",
              code: '# right\ndf[(df["points"] > 20) & (df["position"] == "WR")]\n\n# wrong — raises\ndf[df["points"] > 20 & df["position"] == "WR"]',
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: 'What does `df["points"] > 20` return on its own?',
              options: [
                "The matching rows",
                "A True/False value for every row — a mask",
                "The count of matching rows",
                "An error",
              ],
              answer: 1,
              explain:
                "It's a boolean Series. Wrapping it in df[...] is the step that actually selects rows.",
            },
            {
              type: "mc",
              prompt:
                "Why does `df[df.points > 20 & df.pos == \"WR\"]` fail?",
              options: [
                "pandas can't combine conditions",
                "& binds tighter than the comparisons, so each condition needs its own parentheses",
                "You must use `and`",
                "The column names are wrong",
              ],
              answer: 1,
              explain:
                "Operator precedence, not logic. Parenthesise each side and it works.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Print the list of players who scored over 20, highest first.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "player": ["Hurts", "Bijan", "Nacua", "Kelce"],\n    "points": [24.6, 18.2, 31.0, 22.4],\n})\n\n# filter to > 20, sort descending, print the player column as a list\n',
              expected:
                'import pandas as pd\ndf = pd.DataFrame({"player": ["Hurts","Bijan","Nacua","Kelce"], "points": [24.6,18.2,31.0,22.4]})\nprint(df[df["points"] > 20].sort_values("points", ascending=False)["player"].tolist())',
              hint: 'df[df["points"] > 20].sort_values("points", ascending=False)["player"].tolist() inside print().',
              explain:
                "['Nacua', 'Hurts', 'Kelce'] — filter, sort, select. Same three moves as SQL.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Print how many rows have points over 20, using the mask.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "player": ["Hurts", "Bijan", "Nacua", "Kelce"],\n    "points": [24.6, 18.2, 31.0, 22.4],\n})\n\n# print the number of rows over 20\n',
              expected: "print(3)",
              hint: 'len(df[df["points"] > 20]) — or sum the mask, since True counts as 1.',
              explain:
                "3. Summing a boolean mask is a neat trick: True is 1, so `mask.sum()` counts matches directly.",
            },
          ],
        },
        {
          id: "u14-l2",
          title: "groupby: One Row Per Group",
          blurb: "pandas' GROUP BY, and .agg for several answers at once.",
          brief: {
            goal: "Collapse rows into one summary per group.",
      steps: [
        {
          title: "GROUP BY in different clothes",
          body: "One number for the whole frame is rarely the question. You want one per player, per position, per team. Same idea as GROUP BY.",
        },
        {
          title: "Split, apply, combine",
          body: "groupby splits into groups, runs your aggregate in each, then combines the answers. Say those three words while you read the code.",
          code: "df.groupby('position')['points'].mean()",
        },
      ],
            setup:
              "groupby buckets rows by a column; an aggregate collapses each bucket — exactly GROUP BY. .agg() does several aggregates in one pass.",
          },
          intro: {
            title: "Split, apply, combine",
            text: "groupby splits, applies the aggregate, combines. Chain a column before the aggregate for one column; use .agg() with a dict for several.",
            code: 'df.groupby("position")["points"].mean()\n\ndf.groupby("position").agg(\n    total=("points", "sum"),\n    games=("points", "count"),\n)',
          },
          exercises: [
            {
              type: "mc",
              prompt: "What does groupby give you before you aggregate?",
              options: [
                "The final answer",
                "A grouped object — nothing is computed until you apply an aggregate",
                "A sorted frame",
                "An error",
              ],
              answer: 1,
              explain:
                "It's lazy: the split is described, then the aggregate triggers the work. That's why printing a bare groupby shows an object rather than data.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Print total points per position, as a dict, using groupby.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "position": ["RB", "WR", "RB", "WR", "QB"],\n    "points": [18.2, 31.0, 12.4, 22.4, 28.9],\n})\n\n# print totals per position as a dict\n',
              expected:
                'import pandas as pd\ndf = pd.DataFrame({"position":["RB","WR","RB","WR","QB"], "points":[18.2,31.0,12.4,22.4,28.9]})\nprint(df.groupby("position")["points"].sum().round(1).to_dict())',
              hint: 'df.groupby("position")["points"].sum().round(1).to_dict() — round to keep the floats tidy.',
              explain:
                "{'QB': 28.9, 'RB': 30.6, 'WR': 53.4}. .to_dict() is a clean way to print a grouped result without wrestling the Series repr.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Print the number of games each position appears in, as a dict.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "position": ["RB", "WR", "RB", "WR", "QB"],\n    "points": [18.2, 31.0, 12.4, 22.4, 28.9],\n})\n\n# print a dict of position -> row count\n',
              expected:
                'import pandas as pd\ndf = pd.DataFrame({"position":["RB","WR","RB","WR","QB"], "points":[18.2,31.0,12.4,22.4,28.9]})\nprint(df.groupby("position")["points"].count().to_dict())',
              hint: 'Swap sum() for count(), then .to_dict().',
              explain:
                "{'QB': 1, 'RB': 2, 'WR': 2}. Same shape, different aggregate — count answers 'how many', sum answers 'how much'.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Print the highest single score in the frame, rounded to 1 decimal.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "position": ["RB", "WR", "RB", "WR", "QB"],\n    "points": [18.2, 31.0, 12.4, 22.4, 28.9],\n})\n\n# print the max points\n',
              expected: "print(31.0)",
              hint: 'round(df["points"].max(), 1) inside print().',
              explain:
                "31.0. Aggregates work on a whole column too, not just inside a groupby.",
            },
          ],
        },
        {
          id: "u14-l3",
          title: "merge: Joining DataFrames",
          blurb: "pandas' JOIN, including the one that drops rows silently.",
          brief: {
            goal: "Combine two DataFrames on a shared column.",
      steps: [
        {
          title: "Joining, again",
          body: "Two frames, one shared column, one combined answer. Matched rows survive. Unmatched ones quietly vanish unless you say otherwise.",
        },
        {
          title: "how= decides who survives",
          body: "inner = only rows in both. left = every left row, gaps filled with NaN. Same decision as INNER vs LEFT JOIN.",
          code: "pd.merge(roster, scores, on='player', how='left')",
          note: "Check the row count before and after every merge. A join that silently halved your data looks identical to one that worked, and this is how you catch it.",
        },
      ],
            setup:
              "merge is SQL's JOIN. `how` matters most: 'inner' keeps matches only; 'left' keeps everything on the left and fills gaps with NaN.",
          },
          intro: {
            title: "how= decides who survives",
            text: "how=\"inner\" keeps players in both. how=\"left\" keeps every left-hand row. Unexpected row count? Check `how` first — then duplicate keys on the right.",
            code: 'pd.merge(roster, scores, on="player", how="left")',
          },
          film: [
            {
              title: "NaN is pandas' NULL",
              text: "Unmatched left rows get NaN on the right. NaN is a float — so an int column can suddenly print as 12.0 after a merge.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You merge a 10-row roster with scores and get 8 rows. What most likely happened?",
              options: [
                "pandas sampled the data",
                "It was an inner merge and 2 players had no matching score row",
                "The frames were sorted differently",
                "merge always drops rows",
              ],
              answer: 1,
              explain:
                "Inner keeps only matches. how='left' would have kept all ten with NaN where scores were missing.",
            },
            {
              type: "mc",
              prompt: "What fills the gaps on an unmatched left-join row?",
              options: ["0", "NaN", "An empty string", "The previous value"],
              answer: 1,
              explain:
                "NaN — pandas' missing marker. It is not zero, and treating it as zero is a real analytical error.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Left-merge the roster onto the scores and print the player column as a list, keeping everyone.",
              starter:
                'import pandas as pd\n\nroster = pd.DataFrame({"player": ["Hurts", "Bijan", "Kelce"]})\nscores = pd.DataFrame({"player": ["Hurts", "Kelce"], "points": [24.6, 22.4]})\n\n# left merge, then print the player column as a list\n',
              expected:
                'import pandas as pd\nroster = pd.DataFrame({"player": ["Hurts","Bijan","Kelce"]})\nscores = pd.DataFrame({"player": ["Hurts","Kelce"], "points": [24.6,22.4]})\nprint(pd.merge(roster, scores, on="player", how="left")["player"].tolist())',
              hint: 'pd.merge(roster, scores, on="player", how="left") then ["player"].tolist().',
              explain:
                "All three survive — Bijan included, with NaN points. An inner merge would have lost him without a word.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Now print how many rows an INNER merge of the same two frames returns.",
              starter:
                'import pandas as pd\n\nroster = pd.DataFrame({"player": ["Hurts", "Bijan", "Kelce"]})\nscores = pd.DataFrame({"player": ["Hurts", "Kelce"], "points": [24.6, 22.4]})\n\n# print the row count of an inner merge\n',
              expected: "print(2)",
              hint: 'len(pd.merge(roster, scores, on="player", how="inner"))',
              explain:
                "2, not 3. Comparing the two counts is the fastest way to find out how much a join is quietly discarding.",
            },
          ],
        },
        {
          id: "u14-l4",
          title: "Cleaning What Arrives",
          blurb: "Missing values, wrong types, and stray whitespace.",
          brief: {
            goal: "Make a messy frame safe to calculate on.",
      steps: [
        {
          title: "Real files arrive broken",
          body: "Tutorials skip this. The job is made of it. Missing values, numbers as text, stray spaces that break every join.",
        },
        {
          title: "Find it, then decide",
          body: "Count what's missing first. Then choose: drop or fill — and say which you did and why.",
          code: "print(df.isna().sum())\ndf = df.dropna(subset=['points'])",
          note: "Dropping is safe when the missing rows are few and random. Filling with the average is defensible and quietly narrows your data's spread, which matters if anyone measures variance later.",
        },
      ],
            setup:
              "Real files arrive broken: text numbers, trailing spaces, gaps. No immediate error — just wrong answers later. Clean first.",
          },
          intro: {
            title: "Find it, then decide",
            text: "df.isna().sum() counts gaps per column. Then choose: drop or fill. Dropping loses data; filling invents it. Choose on purpose.",
            code: 'df.isna().sum()\n\ndf["points"].fillna(0)      # treat missing as zero\ndf.dropna(subset=["points"]) # or remove those rows',
          },
          film: [
            {
              title: "Zero and missing are different facts",
              text: "Injured → missing. Played and blanked → zero. Fill missing with 0 and you merge those stories — averages get dragged by players who never took the field.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Why is filling missing points with 0 sometimes wrong?",
              options: [
                "0 isn't a valid number",
                "It turns 'didn't play' into 'played and scored nothing', which drags every average down",
                "pandas forbids it",
                "It's always correct",
              ],
              answer: 1,
              explain:
                "The fill is a claim about reality. Make it only when a missing value genuinely means zero.",
            },
            {
              type: "code",
              lang: "python",
              prompt: "Print how many missing values are in the points column.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "player": ["Hurts", "Bijan", "Kelce", "Nacua"],\n    "points": [24.6, None, 22.4, None],\n})\n\n# print the count of missing points\n',
              expected: "print(2)",
              hint: 'df["points"].isna().sum() — wrap it in int() or print it directly.',
              explain:
                "2. Counting the gaps before you do anything else is the habit that prevents silent wrongness.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Drop the rows with missing points and print the remaining players as a list.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "player": ["Hurts", "Bijan", "Kelce", "Nacua"],\n    "points": [24.6, None, 22.4, None],\n})\n\n# drop rows missing points, then print the player list\n',
              expected: 'print(["Hurts", "Kelce"])',
              hint: 'df.dropna(subset=["points"])["player"].tolist()',
              explain:
                "['Hurts', 'Kelce']. Dropping is honest here — you can't average a score that was never recorded.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "The points arrived as text with stray spaces. Convert them to numbers and print the total, rounded to 1 decimal.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({"points": [" 24.6", "18.2 ", " 31.0"]})\n\n# strip the whitespace, convert to float, print the rounded total\n',
              expected: "print(73.8)",
              hint: 'df["points"].str.strip().astype(float).sum() — then round it.',
              explain:
                "73.8. .str.strip() then .astype(float) is the two-step that rescues most badly-typed columns.",
            },
          ],
        },
      ],
    },
    {
      id: "u15",
      number: 15,
      title: "Excel: The Grid and Your First Formulas",
      drive: "1st Drive · Own 25",
      description:
        "Cell addresses, ranges, and the handful of formulas that answer most questions anyone will ask you about a spreadsheet.",
      skills: ["A1 notation", "SUM", "AVERAGE", "MAX / MIN", "ROUND"],
      status: "live",
      lessons: [
        {
          id: "u15-l1",
          title: "The Grid: Cells, Rows and Ranges",
          blurb: "Every cell has an address. Formulas speak in addresses.",
          brief: {
            goal: "Point at any cell or block of cells by name, the way a formula does.",
      steps: [
        {
          title: "Excel shows up on more job posts than anything else here",
          body: "Unglamorous and everywhere. A lot of analyst jobs are mostly Excel with a little SQL. Being good at it is a hiring signal.",
        },
        {
          title: "A spreadsheet is a grid with addresses",
          body: "Columns get letters. Rows get numbers. A cell is both stuck together — column first, then row. That's the whole address system.",
          code: "E2        one cell: column E, row 2\nE2:E17    a range: E2 down through E17\nA2:E17    a block: columns A to E, rows 2 to 17",
          note: "The colon means through. Get comfortable reading these and every formula later is a sentence you can already parse.",
        },
        {
          title: "Real formulas, real workbook",
          body: "Everything here runs against a real two-sheet workbook. Graded on the value produced — not matching expected text. Right answer in a different spelling still passes.",
        },
      ],
            setup:
              "A spreadsheet is a grid. Letters across, numbers down. Cell address = column then row: E2. A colon means through: E2:E17. That's the whole address system.",
            previewSheet: "Roster",
            previewCaption:
              "The league roster. Row 1 holds the headers, so the actual data starts at row 2.",
          },
          intro: {
            title: "Column letter, then row number",
            text: "E2 is column E, row 2 — letter first. The colon in E2:E17 means \"through\" — all 16 player rows without listing them.",
            code: "E2        one cell: column E, row 2\nE2:E17    a range: E2 down through E17\nA2:E17    a block: columns A–E, rows 2–17\nImport!A2 a cell on another sheet",
          },
          film: [
            {
              title: "Why the data starts at row 2",
              text: "Row 1 is headers. Include it in a numeric range and you're averaging the word \"Points\" — Excel quietly skips it. Most off-by-ones start one row too high.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which cell does `E2` refer to?",
              options: [
                "Row E, column 2",
                "Column E, row 2",
                "The 2nd cell of the sheet",
                "Whatever cell is selected",
              ],
              answer: 1,
              explain:
                "Letter first, number second. Column E, row 2 — Josh Allen's points.",
            },
            {
              type: "mc",
              prompt: "What does the range `E2:E17` cover?",
              options: [
                "Just E2 and E17",
                "E2 through E17 — every cell in between as well",
                "Columns E through 17",
                "The whole E column",
              ],
              answer: 1,
              explain:
                "The colon means \"through\". E2:E17 is all 16 player rows of the Points column.",
            },
            {
              type: "formula",
              prompt:
                "Return the value in cell E2 — the top row's fantasy points. Just point at the cell.",
              starter: "=",
              expected: "=E2",
              hint: "A formula can be nothing but a cell address: =E2",
              explain:
                "430.4. A bare reference is the simplest formula there is, and it is what every bigger formula is made of.",
            },
            {
              type: "formula",
              prompt:
                "Return the player name in row 5 of the Player column.",
              starter: "=",
              expected: "=A5",
              hint: "Names live in column A. Row 5 is the fourth player, because row 1 is headers.",
              explain:
                "Jahmyr Gibbs. Row 1 is the header row, so row 5 is the 4th player — the off-by-one that catches everyone once.",
            },
            {
              type: "fill",
              prompt:
                "Complete the range covering every player's Games played (column D, rows 2 through 17).",
              parts: ["=SUM(", null, ")"],
              bank: ["D2:D17", "D1:D17", "D2-D17", "2D:17D"],
              answer: ["D2:D17"],
              explain:
                "D2:D17 — start below the header, stop at the last player.",
            },
          ],
        },
        {
          id: "u15-l2",
          title: "SUM, AVERAGE and COUNT",
          blurb: "The three formulas that answer most spreadsheet questions.",
          brief: {
            goal: "Total a column, average it, and count how many rows it holds.",
      steps: [
        {
          title: "A formula always starts with =",
          body: "That's how the sheet knows you're asking, not typing text. Leave it off and Excel stores the literal characters SUM(E2:E17).",
        },
        {
          title: "Every function is the same shape",
          body: "Equals, name, brackets with what it works on. Change the name, change the question — range stays the same.",
          code: "=SUM(E2:E17)       add every value\n=AVERAGE(E2:E17)   the mean\n=COUNT(E2:E17)     how many numbers\n=COUNTA(A2:A17)    how many non-empty cells",
          note: "COUNT = numbers only. COUNTA = anything non-empty. COUNT on names returns 0 — wrong function, not empty sheet.",
        },
      ],
            setup:
              "Formulas start with =. Then a function name and a range: =SUM(E2:E17) means add everything from E2 to E17. SUM, AVERAGE, COUNT — you'll reach for these constantly.",
            previewSheet: "Roster",
          },
          intro: {
            title: "=FUNCTION(range)",
            text: "Same shape every time: equals, name, brackets. Change the name, change the question. Write one and you can write them all.",
            code: "=SUM(E2:E17)       add every value\n=AVERAGE(E2:E17)   the mean\n=COUNT(E2:E17)     how many numbers\n=COUNTA(A2:A17)    how many non-empty cells",
          },
          film: [
            {
              title: "COUNT and COUNTA are not the same",
              text: "COUNT = numbers only. COUNTA = anything non-empty. Names + COUNT = 0. That's usually the wrong function, not an empty sheet.",
              code: "=COUNT(A2:A17)    0  — names are not numbers\n=COUNTA(A2:A17)  16  — counts the names",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt: "Add up every player's fantasy points for the season.",
              starter: "=",
              expected: "=SUM(E2:E17)",
              hint: "=SUM( range )",
              explain:
                "5016.8 points across the league. SUM is the workhorse of every spreadsheet ever built.",
            },
            {
              type: "formula",
              prompt:
                "Average fantasy points across the roster, rounded to 1 decimal place.",
              starter: "=",
              expected: "=ROUND(AVERAGE(E2:E17),1)",
              hint: "Wrap the average in ROUND: =ROUND(AVERAGE(...),1)",
              explain:
                "313.6. Functions nest — the inner one runs first, and its answer becomes the outer one's input.",
            },
            {
              type: "formula",
              prompt: "Count how many players are on the roster.",
              starter: "=",
              expected: "=COUNTA(A2:A17)",
              hint: "Names are text, so COUNT won't see them. Use COUNTA.",
              explain:
                "16 players. COUNTA counts anything non-empty, which is what you need on a text column.",
            },
            {
              type: "mc",
              prompt:
                "You run `=COUNT(A2:A17)` on the Player column and get 0. Why?",
              options: [
                "The range is wrong",
                "COUNT only counts numbers, and names are text",
                "The sheet is empty",
                "COUNT needs a criteria argument",
              ],
              answer: 1,
              explain:
                "COUNT is numbers-only. COUNTA is the one that counts text.",
            },
            {
              type: "fill",
              prompt: "Total the Salary column (column F, rows 2–17).",
              parts: ["=", null, "(", null, ")"],
              bank: ["SUM", "COUNT", "F2:F17", "F1:F17"],
              answer: ["SUM", "F2:F17"],
              explain:
                "=SUM(F2:F17). Same shape as every other function you will write.",
            },
          ],
        },
        {
          id: "u15-l3",
          title: "MAX, MIN and the Spread",
          blurb: "Find the best, the worst, and the gap between them.",
          brief: {
            goal: "Pull the highest and lowest values out of a column, and measure the distance between them.",
      steps: [
        {
          title: "Best and worst are the easy half",
          body: "MAX and MIN do exactly what they sound like. The interesting part is what they can't tell you.",
        },
        {
          title: "They return the value, not the name",
          body: "MAX hands back the biggest number. It doesn't know a player column exists. Getting from the score to the person is a lookup — coming soon.",
          code: "=MAX(E2:E17)      the highest score\n=MIN(E2:E17)      the lowest\n=LARGE(E2:E17,3)  the third highest",
          note: "Noticing what a function can't do matters as much as knowing what it can.",
        },
      ],
            setup:
              "MAX and MIN do what they sound like. Catch: they return the number, not the player. MAX says 430.4 — not who scored it.",
            previewSheet: "Roster",
          },
          intro: {
            title: "The value, not the name",
            text: "MAX hands back the biggest number. It has no idea a Player column exists. Score → who scored it is a lookup problem — Lookups unit next.",
            code: "=MAX(E2:E17)      the highest score\n=MIN(E2:E17)      the lowest\n=LARGE(E2:E17,3)  the 3rd highest",
          },
          exercises: [
            {
              type: "formula",
              prompt: "What was the highest fantasy-point total on the roster?",
              starter: "=",
              expected: "=MAX(E2:E17)",
              hint: "=MAX( range )",
              explain: "430.4 — Lamar Jackson's 2024, the best season on the sheet.",
            },
            {
              type: "formula",
              prompt: "And the lowest?",
              starter: "=",
              expected: "=MIN(E2:E17)",
              hint: "Same shape as MAX.",
              explain: "216.9. Every roster has one.",
            },
            {
              type: "formula",
              prompt:
                "How far apart are the best and worst seasons? Subtract the minimum from the maximum, rounded to 1 decimal.",
              starter: "=",
              expected: "=ROUND(MAX(E2:E17)-MIN(E2:E17),1)",
              hint: "You can do arithmetic between two functions: MAX(...) - MIN(...)",
              explain:
                "213.5 points of spread. Formulas are expressions — you can subtract, add and divide them like any other value.",
            },
            {
              type: "formula",
              prompt:
                "Use LARGE to get the 3rd-highest points total on the roster.",
              starter: "=",
              expected: "=LARGE(E2:E17,3)",
              hint: "=LARGE(range, n) — n is which place you want.",
              explain:
                "379.1. LARGE(range,1) is the same as MAX; the second argument is what makes it useful.",
            },
            {
              type: "mc",
              prompt:
                "`=MAX(E2:E17)` returns 430.4. How do you get the player's *name*?",
              options: [
                "MAX has a second argument for that",
                "You can't — MAX only ever returns a value, so you need a lookup",
                "Sort the sheet first",
                "Use MAXA instead",
              ],
              answer: 1,
              explain:
                "MAX returns a number and nothing else. Turning a value back into a row is exactly what INDEX/MATCH is for — coming up in the Lookups unit.",
            },
          ],
        },
        {
          id: "u15-l4",
          title: "Rates: Division and Per-Game Math",
          blurb: "Totals lie when players play different numbers of games.",
          brief: {
            goal: "Turn totals into rates so players who missed time can be compared fairly.",
      steps: [
        {
          title: "Totals quietly reward whoever stayed healthy",
          body: "Games played aren't equal on this roster. Some played 17; one played 13. A total-points board partly measures availability.",
        },
        {
          title: "Dividing turns a total into a rate",
          body: "Points ÷ games = points per game — compares like with like. Wrap in ROUND to cut the decimal tail.",
          code: "=ROUND(E2/D2,2)     points per game\n=ROUND(F2/E2,0)     salary per point",
          note: "Leaderboard on totals? First ask: did everyone get the same opportunity?",
        },
      ],
            setup:
              "Games played aren't equal — some 17, one 12. Totals partly measure who stayed healthy. Divide by games for a fair rate.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Divide, then round",
            text: "Slash divides. Raw division leaves a long decimal tail — wrap in ROUND(value, decimals).",
            code: "=E2/D2              points ÷ games\n=ROUND(E2/D2,2)     the same, to 2 decimals\n=ROUND(F2/E2,0)     salary per point, whole dollars",
          },
          film: [
            {
              title: "Rate stats change the ranking",
              text: "Hill 218.2, Brown 216.9 — almost identical totals. Per game: 12.8 vs 16.7 (13 games vs 17). Totals hid the better player.",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt:
                "Points per game for the player in row 2: their points divided by their games, rounded to 2 decimals.",
              starter: "=",
              expected: "=ROUND(E2/D2,2)",
              hint: "Points are in E, games are in D. =ROUND(E2/D2,2)",
              explain:
                "25.32 points per game. A rate, not a total — and now comparable to anyone else on the sheet.",
            },
            {
              type: "formula",
              prompt:
                "League-wide points per game: total points divided by total games, rounded to 2 decimals.",
              starter: "=",
              expected: "=ROUND(SUM(E2:E17)/SUM(D2:D17),2)",
              hint: "Divide one SUM by another.",
              explain:
                "19.6 points per game across the league. Note this is not the same as averaging each player's rate — dividing the totals weights by how much each player actually played.",
            },
            {
              type: "formula",
              prompt:
                "Cost efficiency for row 2: salary divided by points, rounded to 0 decimals.",
              starter: "=",
              expected: "=ROUND(F2/E2,0)",
              hint: "Salary is column F, points column E.",
              explain:
                "$88 per fantasy point. Dollars-per-unit is how you turn two unrelated columns into a fairness question.",
            },
            {
              type: "mc",
              prompt:
                "Why can total points be a misleading way to rank these players?",
              options: [
                "Totals are always wrong",
                "Players played different numbers of games, so the total partly measures availability",
                "Excel can't add decimals accurately",
                "Points should never be summed",
              ],
              answer: 1,
              explain:
                "A total rewards whoever played most. Per-game rates compare production at the same opportunity.",
            },
            {
              type: "fill",
              prompt:
                "Build points-per-game for row 3, rounded to 2 decimal places.",
              parts: ["=ROUND(", null, "/", null, ",2)"],
              bank: ["E3", "D3", "E2", "D2"],
              answer: ["E3", "D3"],
              explain:
                "=ROUND(E3/D3,2). Points on top, games underneath — the row number has to match on both sides.",
            },
          ],
        },
      ],
    },
    {
      id: "u16",
      number: 16,
      title: "Excel: Logic and Conditional Math",
      drive: "2nd Drive · Midfield",
      description:
        "IF statements, conditional counting and summing, and the dollar signs that stop your formulas breaking when you copy them.",
      skills: ["IF", "COUNTIF", "SUMIFS", "Absolute refs"],
      status: "live",
      lessons: [
        {
          id: "u16-l1",
          title: "IF: Label Every Row",
          blurb: "Ask a question of each row and write the answer next to it.",
          brief: {
            goal: "Write a formula that makes a decision and returns different text depending on the answer.",
      steps: [
        {
          title: "Formulas that make a decision",
          body: "So far, arithmetic. IF looks at a value, asks a question, and returns different things depending on the answer.",
        },
        {
          title: "Test, then true, then false",
          body: "Order never changes: question, yes-answer, no-answer. Text goes in double quotes so Excel knows you mean the word, not a cell name.",
          code: "=IF(E2>300,\"Stud\",\"Flex\")",
          note: "Skip the third argument and Excel returns FALSE — almost never what you meant.",
        },
      ],
            setup:
              "IF takes three things: test, value if true, value if false. =IF(E2>300,\"Stud\",\"Flex\") means: over 300 → Stud, else Flex.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Test, then true, then false",
            text: "Order never changes: =IF(test, if_true, if_false). Text in quotes; numbers not. Skip the third argument → the word FALSE.",
            code: "=IF(E2>300,\"Stud\",\"Flex\")\n=IF(D2=17,\"Full season\",\"Missed time\")\n=IF(E2>=350,\"Elite\",IF(E2>=250,\"Starter\",\"Bench\"))",
          },
          film: [
            {
              title: "Nesting IFs reads like a ladder",
              text: "Put a second IF where the false answer goes. Check the highest bar first. Test 350 before 250, or everyone above 350 gets labelled Starter.",
              code: "=IF(E2>=350,\"Elite\",IF(E2>=250,\"Starter\",\"Bench\"))",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You write =IF(E2>300,\"Stud\") and leave the last part off. What does the cell show when the test fails?",
              options: [
                "An empty cell",
                "The word FALSE",
                "A #VALUE! error",
                "Zero",
              ],
              answer: 1,
              explain:
                "Excel fills in the missing answer with the literal word FALSE, which is almost never what anyone intended and looks alarming in a finished report. Always supply the third argument.",
            },
            {
              type: "formula",
              prompt:
                "Label the player in row 2: \"Stud\" if their points are over 300, otherwise \"Flex\".",
              starter: "=",
              expected: '=IF(E2>300,"Stud","Flex")',
              hint: 'Text answers need double quotes: =IF(E2>300,"Stud","Flex")',
              explain:
                "Stud — row 2 scored 430.4. Quotes are what tell Excel you mean the word, not a cell name.",
            },
            {
              type: "formula",
              prompt:
                "Same test, but for row 15. Over 300 is \"Stud\", otherwise \"Flex\".",
              starter: "=",
              expected: '=IF(E15>300,"Stud","Flex")',
              hint: "Only the row number changes.",
              explain:
                "Flex — row 15 scored 218.2, well under the bar. Same formula, different row, different answer: that is what makes IF worth writing once and copying down.",
            },
            {
              type: "formula",
              prompt:
                "Three tiers for row 2: \"Elite\" at 350 or more, \"Starter\" at 250 or more, otherwise \"Bench\".",
              starter: "=",
              expected: '=IF(E2>=350,"Elite",IF(E2>=250,"Starter","Bench"))',
              hint: "Put the second IF where the false answer goes.",
              explain:
                "Elite. Test the highest bar first — reverse the order and everyone above 350 would be caught by the 250 test and mislabelled.",
            },
            {
              type: "fill",
              prompt:
                "Flag whether row 4's player made it through a full 17-game season.",
              parts: ["=IF(D4", null, '17,"Full season","Missed time")'],
              bank: ["=", ">", "<>", "&"],
              answer: ["="],
              explain:
                "=IF(D4=17,...). A single equals sign inside a formula means \"is equal to\" — the one at the very front is what starts the formula.",
            },
          ],
        },
        {
          id: "u16-l2",
          title: "COUNTIF: Counting Only What Matters",
          blurb: "Count rows that meet a condition, without filtering anything.",
          brief: {
            goal: "Count how many rows match one condition — or several at once.",
      steps: [
        {
          title: "Counting everything is rarely the question",
          body: "You know the roster size. People ask: how many receivers? How many cleared 250? Count only the rows that qualify.",
        },
        {
          title: "Range first, then the rule",
          body: "COUNTIF: range, then condition. COUNTIFS: as many range/rule pairs as you need — only rows that satisfy every one.",
          code: "=COUNTIF(C2:C17,\"WR\")\n=COUNTIF(E2:E17,\">250\")\n=COUNTIFS(C2:C17,\"WR\",E2:E17,\">200\")",
          note: "Comparisons go inside quotes — looks wrong, required. Excel reads the whole condition as text.",
        },
      ],
            setup:
              "COUNT = how many rows. COUNTIF = how many match a rule. Rules go in quotes — even \">250\".",
            previewSheet: "Roster",
          },
          intro: {
            title: "Range first, then the rule",
            text: "COUNTIF: range + rule. COUNTIFS: many pairs; only rows that hit every rule. Ranges must be the same height.",
            code: "=COUNTIF(C2:C17,\"WR\")\n=COUNTIF(E2:E17,\">250\")\n=COUNTIFS(C2:C17,\"WR\",E2:E17,\">200\")",
          },
          exercises: [
            {
              type: "formula",
              prompt: "How many wide receivers (\"WR\") are on the roster?",
              starter: "=",
              expected: '=COUNTIF(C2:C17,"WR")',
              hint: "Positions live in column C.",
              explain: "7 wide receivers.",
            },
            {
              type: "formula",
              prompt: "How many players scored more than 250 points?",
              starter: "=",
              expected: '=COUNTIF(E2:E17,">250")',
              hint: 'The comparison goes inside quotes: ">250"',
              explain:
                "12 players. The quotes around \">250\" look wrong and are required — Excel reads the whole condition as text.",
            },
            {
              type: "formula",
              prompt:
                "How many wide receivers scored more than 200 points? Two conditions at once.",
              starter: "=",
              expected: '=COUNTIFS(C2:C17,"WR",E2:E17,">200")',
              hint: "COUNTIFS — pairs of range then rule, as many as you need.",
              explain:
                "7. COUNTIFS only counts rows where every condition holds, which is how you ask two questions of one sheet.",
            },
            {
              type: "mc",
              prompt: "Why does `>250` need to be in quotes in COUNTIF?",
              options: [
                "It doesn't — quotes are optional",
                "Excel reads the whole condition as a piece of text, operator included",
                "Because 250 is a decimal",
                "To make it case-sensitive",
              ],
              answer: 1,
              explain:
                "The criteria argument is text. Leave the quotes off and Excel sees a broken comparison rather than a rule.",
            },
            {
              type: "fill",
              prompt: "Count how many players are on Sam's team (column G).",
              parts: ["=COUNTIF(", null, ",", null, ")"],
              bank: ["G2:G17", '"Sam"', "C2:C17", "Sam"],
              answer: ["G2:G17", '"Sam"'],
              explain:
                '=COUNTIF(G2:G17,"Sam"). Range first, then the rule in quotes.',
            },
          ],
        },
        {
          id: "u16-l3",
          title: "SUMIF and SUMIFS: Conditional Totals",
          blurb: "Add up only the rows that qualify.",
          brief: {
            goal: "Total or average a column, but only for the rows matching a condition.",
      steps: [
        {
          title: "Now add up only the rows that qualify",
          body: "Same idea as counting, one step further. Not how many receivers — how many points did they score? Test one column; add another.",
        },
        {
          title: "Test range, rule, then the range to add",
          body: "SUMIF checks one column and totals another. Test range first; sum range last.",
          code: "=SUMIF(C2:C17,\"RB\",E2:E17)\n=SUMIFS(F2:F17,G2:G17,\"Jordan\")",
          note: "SUMIFS flips it: sum range first. Historical accident. Wrong total? Check argument order first.",
        },
      ],
            setup:
              "SUMIF order trips everyone: test range, rule, then the range to *add*. =SUMIF(C2:C17,\"RB\",E2:E17) means find RBs, add their points.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Test range, rule, sum range",
            text: "SUMIF: check one column, add another. SUMIFS flips — sum range first, then pairs. Confusing; read them side by side until it sticks.",
            code: "=SUMIF(C2:C17,\"RB\",E2:E17)      test, rule, then what to add\n=SUMIFS(F2:F17,G2:G17,\"Jordan\") what to add FIRST, then the pairs\n=AVERAGEIF(C2:C17,\"QB\",E2:E17)",
          },
          film: [
            {
              title: "SUMIF and SUMIFS disagree on argument order",
              text: "SUMIF: sum range last. SUMIFS: sum range first. Historical accident — just remember it. Wrong total? Check order first.",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt:
                "Total fantasy points scored by running backs (\"RB\").",
              starter: "=",
              expected: '=SUMIF(C2:C17,"RB",E2:E17)',
              hint: "Test the position column, add the points column.",
              explain:
                "1396.3 points from the RBs. Test range first, points range last.",
            },
            {
              type: "formula",
              prompt:
                "Total salary of every player owned by \"Jordan\" (owners are in column G). Use SUMIFS.",
              starter: "=",
              expected: '=SUMIFS(F2:F17,G2:G17,"Jordan")',
              hint: "SUMIFS puts the range you're adding FIRST.",
              explain:
                "$199,000. Note the flip: with SUMIFS the salary range leads, then come the condition pairs.",
            },
            {
              type: "formula",
              prompt:
                "Average points for quarterbacks (\"QB\"), rounded to 1 decimal.",
              starter: "=",
              expected: '=ROUND(AVERAGEIF(C2:C17,"QB",E2:E17),1)',
              hint: "AVERAGEIF follows SUMIF's argument order, then wrap it in ROUND.",
              explain:
                "351.9 points per QB across the four on this roster.",
            },
            {
              type: "mc",
              prompt:
                "In `=SUMIF(C2:C17,\"RB\",E2:E17)`, what does the last argument do?",
              options: [
                "Sets the criteria",
                "Names the column that actually gets added up",
                "Limits how many rows are checked",
                "Nothing — it's optional",
              ],
              answer: 1,
              explain:
                "It's the sum range. Without it SUMIF would add the position column, which isn't numbers at all.",
            },
            {
              type: "fill",
              prompt:
                "Total the points of every tight end (\"TE\") on the roster.",
              parts: ["=SUMIF(C2:C17,", null, ",", null, ")"],
              bank: ['"TE"', "E2:E17", "TE", "C2:C17"],
              answer: ['"TE"', "E2:E17"],
              explain:
                '=SUMIF(C2:C17,"TE",E2:E17). Rule in quotes, then the column being added.',
            },
          ],
        },
        {
          id: "u16-l4",
          title: "Absolute References: the $ That Saves You",
          blurb: "Why your formula breaks the moment you copy it down.",
          brief: {
            goal: "Lock part of a reference so it stops moving when the formula is copied.",
      steps: [
        {
          title: "Copy a formula down and it moves",
          body: "References shift to stay relative — usually what you want. Until part of the formula was supposed to stay still.",
        },
        {
          title: "The dollar sign freezes what follows it",
          body: "$ before letter and number → that reference never moves when you copy. Share-of-total needs this: numerator moves; total must not.",
          code: "E2      moves with the formula\n$E$2    never moves\n=ROUND(E2/SUM($E$2:$E$17),3)",
          note: "Nothing to do with currency — the guess almost everyone makes first.",
        },
      ],
            setup:
              "Copy =E2/E18 down → =E3/E19. Fine for the top; disaster if the bottom should stay put. $ freezes what follows: $E$2 never moves. One character = copyable vs rewrite sixteen times.",
            previewSheet: "Roster",
          },
          intro: {
            title: "$ freezes what comes after it",
            text: "References are relative by default. $ makes that part absolute. Works in row 1, nonsense below? Missing $ is almost always why.",
            code: "E2      moves with the formula\n$E$2    never moves\nE$2     row locked, column free\n$E2     column locked, row free",
          },
          film: [
            {
              title: "The share-of-total pattern",
              text: "Percent of whole? Absolute denominator. Numerator moves; total stays. Most common real use of $ you'll write.",
              code: "=ROUND(E2/SUM($E$2:$E$17),3)   copy down and the total stays put",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does `$E$2` mean?",
              options: [
                "Format the cell as currency",
                "The reference stays pointed at E2 no matter where the formula is copied",
                "Multiply E by 2",
                "It's a reference to another workbook",
              ],
              answer: 1,
              explain:
                "$ locks the reference. It has nothing to do with currency formatting.",
            },
            {
              type: "formula",
              prompt:
                "What share of all league points did row 2's player score? Divide their points by the total, rounded to 3 decimals — and lock the total so the formula survives being copied down.",
              starter: "=",
              expected: "=ROUND(E2/SUM($E$2:$E$17),3)",
              hint: "The numerator moves, the SUM range does not: SUM($E$2:$E$17)",
              explain:
                "0.086 — about 8.6% of every point scored in the league. The $ signs are what let you copy this down all 16 rows.",
            },
            {
              type: "formula",
              prompt:
                "The same share, for row 3. Keep the total locked.",
              starter: "=",
              expected: "=ROUND(E3/SUM($E$2:$E$17),3)",
              hint: "Only the numerator changes — that's the whole point.",
              explain:
                "0.080. The numerator moved, the denominator didn't. That is exactly the behaviour you designed the $ signs to produce.",
            },
            {
              type: "mc",
              prompt:
                "You write `=E2/SUM(E2:E17)` in row 2 and copy it down. What happens in row 3?",
              options: [
                "It works fine",
                "The SUM range slides to E3:E18, so each row divides by a different, shrinking total",
                "Excel shows #REF!",
                "The formula stops calculating",
              ],
              answer: 1,
              explain:
                "Without $ the range drifts down with the formula. Every row ends up divided by a different total, and the percentages silently stop adding to 100.",
            },
            {
              type: "fill",
              prompt:
                "Lock the reference so this always points at cell E2, wherever it's copied.",
              parts: ["=D5/", null],
              bank: ["$E$2", "E2", "E$2$", "#E#2"],
              answer: ["$E$2"],
              explain:
                "$E$2 — a dollar sign before both the column letter and the row number.",
            },
          ],
        },
      ],
    },
    {
      id: "u17",
      number: 17,
      title: "Excel: Lookups",
      drive: "3rd Drive · Red Zone",
      description:
        "Pull a value out of one table using a key from another — the skill that turns two spreadsheets into one answer.",
      skills: ["VLOOKUP", "IFERROR", "INDEX / MATCH", "XLOOKUP"],
      status: "live",
      lessons: [
        {
          id: "u17-l1",
          title: "VLOOKUP: Find the Row, Return a Column",
          blurb: "The formula every job posting means when it says 'Excel'.",
          brief: {
            goal: "Look up a player by name and return any value from their row.",
      steps: [
        {
          title: "This is the one that gets asked about by name",
          body: "When a posting says Excel skills, lookups are a big part of it. VLOOKUP is the one most people know. Question: I have this name — what's their number?",
          previewSheet: "Roster",
          previewCaption: "the sheet every lookup below points at",
        },
        {
          title: "Four arguments, and the fourth is not optional",
          body: "What to look for, the block to search, which column to return, and FALSE for exact match. Column number counts from the left edge of *your* block — not column A of the sheet.",
          code: "=VLOOKUP(\"Justin Jefferson\",A2:E17,5,FALSE)",
          note: "Skip FALSE and Excel approximates — confidently wrong on unsorted data, no error. Always FALSE here.",
        },
      ],
            setup:
              "Lookup = \"I have this name — what's their number?\" VLOOKUP: what, where, which column, FALSE for exact. Column count starts at the left of your block — classic off-by-one.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Four arguments, and the fourth is not optional",
            text: "=VLOOKUP(\"Justin Jefferson\", A2:E17, 5, FALSE) searches the first column of A2:E17 for the name, then returns the 5th column of that block — column E, points. FALSE means exact match. Leave it off and Excel does an approximate match on data it assumes is sorted, which returns confidently wrong answers rather than an error.",
            code: "=VLOOKUP(\"Justin Jefferson\",A2:E17,5,FALSE)\n                 ^          ^     ^   ^\n              what      where   col  exact",
          },
          film: [
            {
              title: "Always pass FALSE",
              text: "Default is TRUE — approximate. On unsorted data it won't error; it'll land near something and look real. Always FALSE here.",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt:
                "How many fantasy points did \"Justin Jefferson\" score? Search the block A2:E17 and return the points column.",
              starter: "=",
              expected: '=VLOOKUP("Justin Jefferson",A2:E17,5,FALSE)',
              hint: "Points are the 5th column of A2:E17. Don't forget FALSE.",
              explain:
                "317.5. Column 5 counts from A — Player, Team, Pos, Games, Points.",
            },
            {
              type: "formula",
              prompt:
                "How many games did \"George Kittle\" play? Same block, different column.",
              starter: "=",
              expected: '=VLOOKUP("George Kittle",A2:E17,4,FALSE)',
              hint: "Games is the 4th column of the block.",
              explain:
                "15 games. Only the column number changed — the rest of the formula is identical.",
            },
            {
              type: "mc",
              prompt:
                "In `=VLOOKUP(\"Justin Jefferson\",A2:E17,5,FALSE)`, what is the 5 counting from?",
              options: [
                "Column A of the sheet",
                "The first column of the range you passed in — A, in this case",
                "The column the formula is written in",
                "The last column of the sheet",
              ],
              answer: 1,
              explain:
                "It counts from the left edge of the lookup range. Change the range to start at B and the same column becomes 4.",
            },
            {
              type: "mc",
              prompt: "What does the final `FALSE` do?",
              options: [
                "Hides errors",
                "Demands an exact match instead of an approximate one",
                "Makes the search case-sensitive",
                "Searches bottom to top",
              ],
              answer: 1,
              explain:
                "Exact match. Without it Excel approximates on data it assumes is sorted and returns confident nonsense.",
            },
            {
              type: "fill",
              prompt:
                "Look up \"Derrick Henry\" and return his team (the 2nd column of the block).",
              parts: ["=VLOOKUP(", null, ",A2:E17,", null, ",FALSE)"],
              bank: ['"Derrick Henry"', "2", "Derrick Henry", "5"],
              answer: ['"Derrick Henry"', "2"],
              explain:
                'Text to look up goes in quotes; Team is the 2nd column of A2:E17.',
            },
          ],
        },
        {
          id: "u17-l2",
          title: "When VLOOKUP Breaks",
          blurb: "#N/A, and the two things it usually means.",
          brief: {
            goal: "Handle a lookup that finds nothing, instead of leaving #N/A across your sheet.",
      steps: [
        {
          title: "Lookups fail, and the failure spreads",
          body: "No match → error. Every formula touching that cell errors too. One missing player can turn a column red and kill the totals.",
        },
        {
          title: "IFERROR decides what failure looks like",
          body: "Wrap the lookup; give a fallback. Works → answer. Fails → your choice. Text for humans; zero to keep math working.",
          code: "=IFERROR(VLOOKUP(\"Travis Kelce\",A2:E17,5,FALSE),\"Not rostered\")",
          note: "VLOOKUP can't look left — searches the first column, returns only to the right. That's why the next lesson exists.",
        },
      ],
            setup:
              "#N/A = not found. Sometimes real (not rostered); sometimes dirty data (trailing space). Either way, #N/A breaks SUMs below — wrap with IFERROR and choose what to show.",
            previewSheet: "Roster",
          },
          intro: {
            title: "IFERROR catches the failure",
            text: "IFERROR(formula, fallback). Works → answer. Errors → fallback. \"Not rostered\" beats a column that breaks every total.",
            code: "=IFERROR(VLOOKUP(\"Nobody\",A2:E17,5,FALSE),\"Not rostered\")\n=IFERROR(VLOOKUP(\"Nobody\",A2:E17,5,FALSE),0)",
          },
          film: [
            {
              title: "VLOOKUP cannot look left",
              text: "It searches the first column and only returns to the right. Need column A while searching C? VLOOKUP can't. That's why INDEX/MATCH exists.",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt:
                "Look up \"Travis Kelce\" (who is not on this roster) and return \"Not rostered\" instead of an error.",
              starter: "=",
              expected:
                '=IFERROR(VLOOKUP("Travis Kelce",A2:E17,5,FALSE),"Not rostered")',
              hint: 'Wrap the whole VLOOKUP: =IFERROR( lookup , "Not rostered")',
              explain:
                "\"Not rostered\". The lookup still failed — IFERROR just decides what the failure should look like.",
            },
            {
              type: "formula",
              prompt:
                "Same lookup, but return 0 so the column can still be summed.",
              starter: "=",
              expected:
                '=IFERROR(VLOOKUP("Travis Kelce",A2:E17,5,FALSE),0)',
              hint: "The fallback doesn't have to be text.",
              explain:
                "0. Choose your fallback based on what happens next — text reads better for humans, 0 keeps arithmetic working.",
            },
            {
              type: "mc",
              prompt: "What does `#N/A` actually mean?",
              options: [
                "The formula has a syntax error",
                "The lookup ran correctly but found no match",
                "The cell is empty",
                "You divided by zero",
              ],
              answer: 1,
              explain:
                "Not available — no match found. A broken formula gives you a different error entirely.",
            },
            {
              type: "mc",
              prompt:
                "Your lookup value is in column C and the answer you need is in column A. Can VLOOKUP do it?",
              options: [
                "Yes, use a negative column number",
                "No — VLOOKUP only returns columns to the right of the search column",
                "Yes, if you pass TRUE as the last argument",
                "Only if the sheet is sorted",
              ],
              answer: 1,
              explain:
                "VLOOKUP searches the leftmost column of its range and looks rightwards only. Looking left is exactly what INDEX/MATCH solves.",
            },
            {
              type: "fill",
              prompt:
                "Wrap this lookup so a missing player shows \"Free agent\".",
              parts: [
                "=",
                null,
                '(VLOOKUP("Nobody",A2:E17,5,FALSE),',
                null,
                ")",
              ],
              bank: ["IFERROR", '"Free agent"', "IF", "Free agent"],
              answer: ["IFERROR", '"Free agent"'],
              explain:
                "IFERROR takes the formula first, then what to show when it fails.",
            },
          ],
        },
        {
          id: "u17-l3",
          title: "INDEX + MATCH: the Grown-Up Lookup",
          blurb: "Two functions that fix everything VLOOKUP can't do.",
          brief: {
            goal: "Look up a value in any direction by splitting the job into 'which row?' and 'give me that row'.",
      steps: [
        {
          title: "The grown-up version",
          body: "VLOOKUP's weaknesses: can't look left, and a hardcoded column number breaks silently when someone inserts a column. INDEX + MATCH have neither problem.",
        },
        {
          title: "Split the job in two",
          body: "MATCH: where in this list is my value? Returns a position. INDEX: give me item 14 from this column. Nested together, they do everything.",
          code: "=MATCH(\"George Kittle\",A2:A17,0)\n=INDEX(E2:E17,MATCH(\"Tyreek Hill\",A2:A17,0))",
          note: "You name the return column directly — insert a column and the reference moves with it.",
        },
      ],
            setup:
              "MATCH = where is my value? Returns a position. INDEX = give me item N from this column. Nested: everything VLOOKUP does, any direction, no fragile column number.",
            previewSheet: "Roster",
          },
          intro: {
            title: "MATCH finds the position, INDEX fetches the value",
            text: "Read inside out: MATCH returns a row number; INDEX pulls that row from the column you name. Return column can sit anywhere — left, right, another sheet.",
            code: "=MATCH(\"George Kittle\",A2:A17,0)              → 14\n=INDEX(E2:E17,14)                             → 236.6\n=INDEX(E2:E17,MATCH(\"Tyreek Hill\",A2:A17,0))  → both at once",
          },
          film: [
            {
              title: "Why analysts prefer it",
              text: "VLOOKUP's column number is hardcoded. Insert a column and it returns the wrong field — silently. INDEX/MATCH names the return column, so inserts just move the reference.",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt:
                "Which position in the name list does \"George Kittle\" occupy? Use MATCH with an exact match (0).",
              starter: "=",
              expected: '=MATCH("George Kittle",A2:A17,0)',
              hint: "=MATCH(what, where, 0)",
              explain:
                "14 — Kittle is the 14th name in the range. Not a value, a position.",
            },
            {
              type: "formula",
              prompt:
                "Now combine them: how many points did \"Tyreek Hill\" score? Use INDEX over the points column with MATCH finding the row.",
              starter: "=",
              expected: '=INDEX(E2:E17,MATCH("Tyreek Hill",A2:A17,0))',
              hint: "=INDEX(column_to_return, MATCH(name, name_column, 0))",
              explain:
                "218.2. MATCH found the row, INDEX pulled the value — no column counting anywhere.",
            },
            {
              type: "formula",
              prompt:
                "The payoff: who scored the most points? Use MAX to find the top score, MATCH to find its row, and INDEX to return the *name*.",
              starter: "=",
              expected: "=INDEX(A2:A17,MATCH(MAX(E2:E17),E2:E17,0))",
              hint: "MATCH can look up a number too: MATCH(MAX(E2:E17),E2:E17,0)",
              explain:
                "Lamar Jackson. This is the question MAX couldn't answer back in the first unit — and notice you're returning column A while searching column E, which VLOOKUP flatly cannot do.",
            },
            {
              type: "mc",
              prompt: "What does MATCH return?",
              options: [
                "The matching value",
                "A position — how far down the range the value sits",
                "TRUE or FALSE",
                "The whole matching row",
              ],
              answer: 1,
              explain:
                "A number. That number is only useful once INDEX turns it back into a value.",
            },
            {
              type: "mc",
              prompt:
                "Someone inserts a new column in the middle of your table. What happens to a VLOOKUP that pointed past it?",
              options: [
                "It updates automatically",
                "It returns the wrong column, with no error to warn you",
                "It shows #REF!",
                "Nothing — VLOOKUP is immune",
              ],
              answer: 1,
              explain:
                "The hardcoded column number now counts to a different field. It fails silently, which is worse than failing loudly — and it's the main reason to reach for INDEX/MATCH.",
            },
          ],
        },
        {
          id: "u17-l4",
          title: "XLOOKUP: the Modern One",
          blurb: "One function that replaces all of the above.",
          brief: {
            goal: "Write a lookup that reads the way you'd say it out loud.",
      steps: [
        {
          title: "The modern one, if you have it",
          body: "XLOOKUP fixes VLOOKUP in one function: name search and return columns, exact match by default, built-in not-found fallback.",
        },
        {
          title: "Look for, look in, return from",
          body: "Reads almost like the sentence you'd say. Optional fourth argument replaces IFERROR.",
          code: "=XLOOKUP(\"Derrick Henry\",A2:A17,F2:F17)\n=XLOOKUP(\"Travis Kelce\",A2:A17,F2:F17,\"Not rostered\")",
          note: "Older Excel may not have it. That's why INDEX/MATCH still matter — they work everywhere.",
        },
      ],
            setup:
              "XLOOKUP: name search column and return column, exact match by default, not-found fallback built in. Have it? Use it. Older Excel? INDEX/MATCH still works everywhere.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Look for, look in, return from",
            text: "=XLOOKUP(\"Derrick Henry\", A2:A17, F2:F17) reads like: find this name, in this column, return from that column. Fourth argument = not-found fallback.",
            code: "=XLOOKUP(\"Derrick Henry\",A2:A17,F2:F17)\n=XLOOKUP(\"Nobody\",A2:A17,F2:F17,\"Not rostered\")",
          },
          exercises: [
            {
              type: "formula",
              prompt:
                "Use XLOOKUP to find \"Derrick Henry\"'s salary — search the name column, return from the salary column.",
              starter: "=",
              expected: '=XLOOKUP("Derrick Henry",A2:A17,F2:F17)',
              hint: "=XLOOKUP(what, where_to_look, what_to_return)",
              explain:
                "24000. No column counting, no FALSE — the two things that make VLOOKUP fragile are simply gone.",
            },
            {
              type: "formula",
              prompt:
                "Look up \"Travis Kelce\" and return \"Not rostered\" using XLOOKUP's built-in fourth argument — no IFERROR.",
              starter: "=",
              expected:
                '=XLOOKUP("Travis Kelce",A2:A17,F2:F17,"Not rostered")',
              hint: "The fallback is just a fourth argument.",
              explain:
                "\"Not rostered\". What took a wrapper function in VLOOKUP is built in here.",
            },
            {
              type: "mc",
              prompt:
                "What's the main practical advantage of XLOOKUP over VLOOKUP?",
              options: [
                "It's faster on large sheets",
                "You name the return column directly, so there's no column number to break and it can look left",
                "It doesn't need an equals sign",
                "It sorts the data first",
              ],
              answer: 1,
              explain:
                "No hardcoded column index, and no left-to-right restriction. Exact match being the default is a close second.",
            },
            {
              type: "mc",
              prompt:
                "Your workplace runs an older Excel with no XLOOKUP. What do you use?",
              options: [
                "Nothing — you're stuck",
                "INDEX/MATCH, which works everywhere and does the same job",
                "Sort the sheet and use VLOOKUP with TRUE",
                "Rewrite the data by hand",
              ],
              answer: 1,
              explain:
                "INDEX/MATCH is the portable answer, which is exactly why it's still worth knowing.",
            },
            {
              type: "fill",
              prompt:
                "Use XLOOKUP to return \"CeeDee Lamb\"'s points from column E.",
              parts: ["=XLOOKUP(", null, ",A2:A17,", null, ")"],
              bank: ['"CeeDee Lamb"', "E2:E17", "CeeDee Lamb", "5"],
              answer: ['"CeeDee Lamb"', "E2:E17"],
              explain:
                "You pass the return range itself, not a column number. That's the whole improvement.",
            },
          ],
        },
      ],
    },
    {
      id: "u18",
      number: 18,
      title: "Excel: Cleaning the Export",
      drive: "4th Drive · Goal Line",
      description:
        "Real data arrives broken. Trailing spaces, numbers stored as text, and blank cells — and the formulas that fix all three.",
      skills: ["TRIM", "VALUE", "COUNTBLANK", "Text functions"],
      status: "live",
      lessons: [
        {
          id: "u18-l1",
          title: "TRIM: the Space You Cannot See",
          blurb: "Why a lookup fails on a name that looks identical.",
          brief: {
            goal: "Find and remove the invisible whitespace that makes matching fail.",
      steps: [
        {
          title: "This unit is what the job is made of",
          body: "Tutorials use clean data. Real exports don't. A big chunk of analyst work is making files usable first. Import is the same league — exported badly on purpose.",
          previewSheet: "Import",
          previewCaption: "the Import tab · the same league, exported badly",
        },
        {
          title: "The space you cannot see",
          body: "Two names look identical and won't match — one has leading spaces that render as nothing. You can't see them; Excel can. Breaks more lookups than anything else.",
          code: "=LEN(Import!A2)         15, counting the invisible ones\n=LEN(TRIM(Import!A2))   13, the real name\n=TRIM(Import!A2)        the clean version",
          note: "Look the same, won't match? Measure with LEN first. Invisible problem → a number.",
        },
      ],
            setup:
              "Import is the same league exported badly. \"  Josh Allen\" ≠ \"Josh Allen\". You can't see it; Excel can. TRIM strips those spaces — fixes more broken lookups than any other function.",
            previewSheet: "Import",
            previewCaption:
              "The bad export. The names carry stray spaces and the points came through as text.",
          },
          intro: {
            title: "LEN proves it",
            text: "Look the same, won't match? Measure. LEN counts characters including spaces. Too long? Culprit found. Then TRIM.",
            code: "=LEN(Import!A2)         12  — two spaces hiding\n=LEN(TRIM(Import!A2))   10  — the real name\n=TRIM(Import!A2)        \"Josh Allen\"",
          },
          film: [
            {
              title: "Clean on the way in, not after",
              text: "Fix six rows by hand? Fine. Sixty thousand? No — and it breaks again on every refresh. Wrap the lookup in TRIM once; every future refresh stays fixed.",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt:
                "How many characters are actually in cell A2 of the Import sheet? Use LEN.",
              starter: "=",
              expected: "=LEN(Import!A2)",
              hint: "Reference another sheet with its name and an exclamation mark: Import!A2",
              explain:
                "15 — but \"Lamar Jackson\" is only 13 characters. Two of them are invisible.",
            },
            {
              type: "formula",
              prompt: "Now clean it: return Import!A2 with the spaces stripped.",
              starter: "=",
              expected: "=TRIM(Import!A2)",
              hint: "=TRIM( the cell )",
              explain:
                "Lamar Jackson\" — 13 characters, and now it will match the roster.",
            },
            {
              type: "formula",
              prompt:
                "Prove the problem: look up the *untrimmed* Import!A2 against the roster block A2:E17 and return column 5, falling back to \"No match\".",
              starter: "=",
              expected:
                '=IFERROR(VLOOKUP(Import!A2,A2:E17,5,FALSE),"No match")',
              hint: "Wrap a normal VLOOKUP in IFERROR, using Import!A2 as the lookup value.",
              explain:
                "\"No match\" — the name is right there on the roster and the lookup still failed. That is what two invisible spaces cost you.",
            },
            {
              type: "formula",
              prompt:
                "Now fix it: same lookup, but wrap the lookup value in TRIM.",
              starter: "=",
              expected: "=VLOOKUP(TRIM(Import!A2),A2:E17,5,FALSE)",
              hint: "Put TRIM around Import!A2 inside the VLOOKUP.",
              explain:
                "430.4. One function in the right place turned a broken join into a working one.",
            },
            {
              type: "mc",
              prompt:
                "Two names look identical but won't match. What's the first thing to check?",
              options: [
                "Whether the sheet is sorted",
                "LEN on both — a length mismatch means hidden whitespace",
                "The file format",
                "Whether Excel needs restarting",
              ],
              answer: 1,
              explain:
                "Measure before you guess. LEN turns an invisible problem into a visible number.",
            },
          ],
        },
        {
          id: "u18-l2",
          title: "Numbers Stored as Text",
          blurb: "Your SUM says zero and the column is full of numbers.",
          brief: {
            goal: "Spot and convert numbers that arrived as text so arithmetic works again.",
      steps: [
        {
          title: "The most dangerous kind of broken data",
          body: "Numbers stored as text look normal. They read as numbers and behave as words. No error, no warning.",
        },
        {
          title: "SUM silently skips them",
          body: "A column of 400-point seasons totals to zero — sheet looks fine. Implausibly low total, especially exact zero? Suspect text first.",
          code: "=SUM(Import!B2:B7)         0, because every value is text\n=VALUE(TRIM(Import!B2))    430.4, an actual number",
          note: "VALUE(TRIM(...)) pads and converts in one move. Convert first, then calculate.",
        },
      ],
            setup:
              "Exports often deliver numbers as text. They look fine; SUM ignores them and returns 0. VALUE turns text into a real number; TRIM inside handles padding.",
            previewSheet: "Import",
          },
          intro: {
            title: "SUM silently skips text",
            text: "No error. A column of big seasons totals to zero and looks fine. Suspiciously low — especially exact zero — suspect text first.",
            code: "=SUM(Import!B2:B7)              0    — every value is text\n=VALUE(TRIM(Import!B2))         430.4\n=VALUE(TRIM(Import!B2))+VALUE(TRIM(Import!B3))",
          },
          exercises: [
            {
              type: "formula",
              prompt:
                "Try to total the Raw Points column on the Import sheet (B2:B7) and see what happens.",
              starter: "=",
              expected: "=SUM(Import!B2:B7)",
              hint: "=SUM(Import!B2:B7)",
              explain:
                "0. Six rows of points and the total is zero — because every one of them is text, and SUM skipped them all without complaining.",
            },
            {
              type: "formula",
              prompt:
                "Convert Import!B2 into a real number. Strip the spaces first.",
              starter: "=",
              expected: "=VALUE(TRIM(Import!B2))",
              hint: "TRIM inside VALUE: =VALUE(TRIM( cell ))",
              explain:
                "430.4 — now an actual number you can do arithmetic with.",
            },
            {
              type: "formula",
              prompt:
                "Add the first two converted values (B2 and B3) together, rounded to 1 decimal.",
              starter: "=",
              expected:
                "=ROUND(VALUE(TRIM(Import!B2))+VALUE(TRIM(Import!B3)),1)",
              hint: "Convert each one, then add them, then round the result.",
              explain:
                "833.4. Convert first, then calculate — never the other way round.",
            },
            {
              type: "mc",
              prompt:
                "A column of numbers sums to exactly 0. What's the most likely cause?",
              options: [
                "The values are all zero",
                "They're stored as text, and SUM ignored every one of them",
                "The range is empty",
                "Excel needs recalculating",
              ],
              answer: 1,
              explain:
                "SUM skips text without erroring. A suspiciously round zero is the classic symptom.",
            },
            {
              type: "fill",
              prompt:
                "Convert the padded text value in Import!B4 into a usable number.",
              parts: ["=", null, "(", null, "(Import!B4))"],
              bank: ["VALUE", "TRIM", "TEXT", "LEN"],
              answer: ["VALUE", "TRIM"],
              explain:
                "=VALUE(TRIM(Import!B4)). TRIM removes the padding, VALUE makes it a number.",
            },
          ],
        },
        {
          id: "u18-l3",
          title: "Blanks, Zeros and Missing Data",
          blurb: "An empty cell is not the same as a zero.",
          brief: {
            goal: "Count what's missing and handle it deliberately rather than by accident.",
      steps: [
        {
          title: "Empty is not the same as zero",
          body: "Sounds pedantic — changes your answers. AVERAGE skips blanks (shrinks the denominator). Zero gets included (drags the average). Both ok; accident not.",
        },
        {
          title: "Count the gaps before deciding",
          body: "COUNTBLANK = empties. COUNTA = the rest. Together they should add up to the rows you thought you had.",
          code: "=COUNTBLANK(Import!B2:B7)\n=COUNTA(Import!B2:B7)\n=IF(Import!B6=\"\",\"Missing\",\"Present\")",
          note: "Missed game: blank for per-game scoring, zero for season output. Say which out loud, then make the sheet agree.",
        },
      ],
            setup:
              "One Import player has an empty points cell. Empty ≠ zero. AVERAGE skips blanks; zero drags the average. Both defensible — pick on purpose. Count gaps first.",
            previewSheet: "Import",
          },
          intro: {
            title: "Count the gaps first",
            text: "COUNTBLANK = empty. COUNTA = non-empty. See the shape of what's missing, then IF to label or substitute so gaps aren't silently absorbed.",
            code: "=COUNTBLANK(Import!B2:B7)   1\n=COUNTA(Import!B2:B7)       5\n=IF(Import!B6=\"\",\"Missing\",\"Present\")",
          },
          film: [
            {
              title: "Blank and zero average differently",
              text: "10, 20, blank → AVERAGE = 15 (÷2). Blank → 0 → AVERAGE = 10 (÷3). Neither wrong — not knowing which your sheet did is. Decide out loud, then match the formula.",
            },
          ],
          exercises: [
            {
              type: "formula",
              prompt:
                "How many cells in the Import sheet's Raw Points column (B2:B7) are empty?",
              starter: "=",
              expected: "=COUNTBLANK(Import!B2:B7)",
              hint: "=COUNTBLANK( range )",
              explain: "1. One player came through with no points at all.",
            },
            {
              type: "formula",
              prompt: "And how many of those six cells actually have something in them?",
              starter: "=",
              expected: "=COUNTA(Import!B2:B7)",
              hint: "COUNTA counts non-empty cells.",
              explain:
                "5. Five present, one missing — and 5 + 1 = 6, which is the check that you've accounted for every row.",
            },
            {
              type: "formula",
              prompt:
                "Label cell Import!B6: return \"Missing\" if it's empty, otherwise \"Present\".",
              starter: "=",
              expected: '=IF(Import!B6="","Missing","Present")',
              hint: 'Empty is written as two quote marks with nothing between: ""',
              explain:
                "\"Missing\". Two quotes with nothing between them is how you write \"empty\" in a formula.",
            },
            {
              type: "mc",
              prompt:
                "AVERAGE over 10, 20 and a blank cell returns 15. Why not 10?",
              options: [
                "It rounds up",
                "AVERAGE skips blanks, so it divided by 2 rather than 3",
                "Blanks count as 15",
                "It's a bug",
              ],
              answer: 1,
              explain:
                "Blanks are excluded from both the total and the count. A zero would have been included and given you 10.",
            },
            {
              type: "mc",
              prompt:
                "A player missed a game. Should that week be a blank or a zero?",
              options: [
                "Always zero",
                "It depends what you're measuring — and the important thing is deciding on purpose",
                "Always blank",
                "It makes no difference",
              ],
              answer: 1,
              explain:
                "Scoring average per game played wants a blank; total season output wants a zero. The mistake is letting the export decide for you.",
            },
          ],
        },
        {
          id: "u18-l4",
          title: "Text Surgery",
          blurb: "Reshape text into whatever the next step needs.",
          brief: {
            goal: "Cut, join and re-case text so it matches the format you actually need.",
      steps: [
        {
          title: "Clean is not always the same as useful",
          body: "Trusted data still needs reshaping: first name split off, team codes standardised, names glued for an email. Small toolkit of its own.",
        },
        {
          title: "A few blunt tools, endlessly recombined",
          body: "None is hard alone. Skill is nesting two or three to get from what you have to what you need — like VALUE(TRIM(...)).",
          code: "=LEFT(A2,4)                  first four characters\n=UPPER(Import!C2)            standardise the case\n=PROPER(TRIM(Import!A3))     clean and re-case in one\n=TEXTJOIN(\", \",TRUE,A2:A4)   glue a range together",
          note: "LEFT/RIGHT count characters, not words — they cut mid-name when lengths change. Real splits need FIND or Text to Columns.",
        },
      ],
            setup:
              "Clean data still needs reshaping — split names, upper-case codes, glue a list for email. LEFT/RIGHT, UPPER/LOWER/PROPER, TEXTJOIN.",
            previewSheet: "Roster",
          },
          intro: {
            title: "A small toolkit, endlessly recombined",
            text: "None of these is hard alone. Skill is nesting two or three — same instinct as VALUE(TRIM(...)).",
            code: "=LEFT(A2,4)                    \"Josh\"\n=UPPER(Import!C2)              \"BUF\"\n=PROPER(TRIM(Import!A3))       \"Patrick Mahomes\"\n=TEXTJOIN(\", \",TRUE,A2:A4)     one cell, three names",
          },
          exercises: [
            {
              type: "formula",
              prompt:
                "Take the first 4 characters of the name in A2 on the Roster sheet.",
              starter: "=",
              expected: "=LEFT(A2,4)",
              hint: "=LEFT(cell, how_many)",
              explain:
                "Lama\" — it cut the name mid-word. LEFT and RIGHT are blunt instruments: they count characters, not words.",
            },
            {
              type: "formula",
              prompt:
                "The Import sheet's team codes have inconsistent casing. Return Import!C2 in all capitals.",
              starter: "=",
              expected: "=UPPER(Import!C2)",
              hint: "=UPPER( cell )",
              explain:
                "BAL\". Standardising case is usually a prerequisite for matching, since a human-entered code column will contain both.",
            },
            {
              type: "formula",
              prompt:
                "Clean up Import!A3 completely: strip the spaces and fix the capitalisation.",
              starter: "=",
              expected: "=PROPER(TRIM(Import!A3))",
              hint: "Nest them: PROPER(TRIM(...))",
              explain:
                "Ja'Marr Chase\". Two functions, one pass — the nesting habit from VALUE(TRIM(...)) applies everywhere.",
            },
            {
              type: "formula",
              prompt:
                "Join the first three player names (A2:A4) into a single cell, separated by a comma and a space.",
              starter: "=",
              expected: '=TEXTJOIN(", ",TRUE,A2:A4)',
              hint: '=TEXTJOIN(separator, TRUE, range) — TRUE skips blanks.',
              explain:
                "Lamar Jackson, Ja'Marr Chase, Josh Allen\". The TRUE tells it to ignore empty cells rather than leaving double separators.",
            },
            {
              type: "mc",
              prompt:
                "You need just the surname from \"Josh Allen\". Why won't `RIGHT(A2,5)` reliably work?",
              options: [
                "RIGHT only works on numbers",
                "Surnames aren't all 5 characters — you'd need to find the space first",
                "RIGHT counts from the left",
                "It works fine",
              ],
              answer: 1,
              explain:
                "A fixed character count breaks on the next row. Real splitting needs the position of the space — which is what FIND and Text to Columns are for.",
            },
          ],
        },
      ],
    },
    {
      id: "u19",
      number: 7,
      title: "Overtime — CTEs & Temp Tables",
      drive: "Overtime, 1st Drive · Own 20",
      description:
        "A subquery buried in the middle is hard to read. WITH gives that step a name.",
      skills: ["WITH", "Recursive CTEs", "Temp Tables"],
      status: "live",
      lessons: [
        {
          id: "u19-l1",
          title: "Name Your Subquery",
          blurb: "WITH turns a buried subquery into a named first step.",
          brief: {
            goal: "Write a query as a named step instead of nesting a subquery.",
      steps: [
        {
          title: "Nesting gets messy fast",
          body: "You can already put a query inside another query. One level deep? Fine. Two or three? You're peeling it from the inside out. And next month's reader is you.",
        },
        {
          title: "Name the step first",
          body: "WITH lets you give a subquery a name up front. After that, treat the name like a table. Same logic — just top to bottom, like a play sheet.",
          code: "WITH big_games AS (\n  SELECT * FROM week_results WHERE fantasy_pts > 30\n)\nSELECT player, COUNT(*) FROM big_games GROUP BY player;",
          note: "Pros call this a CTE (common table expression). You'll say WITH.",
        },
      ],
            setup:
              "You've buried subqueries in FROM and WHERE. WITH names the step first, so the query reads top to bottom. Here's the same games-over-30 filter as a CTE.",
            previewSql:
              "WITH big_games AS (SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts > 30) SELECT * FROM big_games ORDER BY fantasy_pts DESC;",
            previewCaption: "one CTE, then a plain SELECT from its name",
          },
          intro: {
            title: "WITH name AS (...) names a subquery",
            text: "Write WITH name AS (a SELECT). Then SELECT FROM it, JOIN it, filter it — like any table. What it computes stays the same. How it reads gets way clearer.",
            code: "WITH big_games AS (\n  SELECT player, week, fantasy_pts\n  FROM week_results\n  WHERE season = 2024 AND fantasy_pts > 30\n)\nSELECT * FROM big_games\nORDER BY fantasy_pts DESC;",
          },
          film: [
            {
              title: "Same rows — clearer order",
              text: "A CTE and a subquery in FROM can return the same rows. The win is reading top to bottom instead of inside out.",
              code: "-- same result, opposite reading order\nSELECT * FROM (\n  SELECT player, fantasy_pts FROM week_results WHERE fantasy_pts > 30\n) AS big_games;\n\nWITH big_games AS (\n  SELECT player, fantasy_pts FROM week_results WHERE fantasy_pts > 30\n)\nSELECT * FROM big_games;",
            },
            {
              title: "The name dies with the query",
              text: "big_games isn't a real table — it's gone when this statement ends. A later query that SELECTs from big_games won't know what you mean.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does WITH big_games AS (...) actually create?",
              options: [
                "A permanent new table in the database",
                "A named subquery, usable only inside this one statement",
                "A saved query you can run again later",
                "An index on week_results",
              ],
              answer: 1,
              explain:
                "It only lives inside this statement — nothing sticks around after the query finishes.",
            },
            {
              type: "fill",
              prompt: "Name a CTE called qb_games holding only quarterback rows.",
              parts: [
                "",
                null,
                " qb_games AS (SELECT * FROM week_results WHERE position = 'QB')\nSELECT player, fantasy_pts FROM qb_games;",
              ],
              bank: ["WITH", "CREATE", "AS"],
              answer: ["WITH"],
              explain: "WITH starts the clause; AS ties the name to the subquery.",
            },
            {
              type: "query",
              prompt:
                "Using a CTE named big_games, find every 2024 game where a player scored more than 30 points. Show player, week, and fantasy_pts, highest first.",
              starter:
                "WITH big_games AS (\n  SELECT player, week, fantasy_pts\n  FROM week_results\n  WHERE season = 2024 AND fantasy_pts > 30\n)\n",
              expected:
                "WITH big_games AS (SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts > 30) SELECT * FROM big_games ORDER BY fantasy_pts DESC;",
              orderMatters: true,
              hint: "Finish with SELECT * FROM big_games ORDER BY fantasy_pts DESC;",
              explain:
                "The CTE filters; the final SELECT just reads from that name like a table.",
            },
            {
              type: "query",
              prompt:
                "Name a CTE called qb_games holding only quarterback rows from week_results, then select player and fantasy_pts from it for week 1 of the 2024 season.",
              starter:
                "WITH qb_games AS (\n  SELECT * FROM week_results WHERE position = 'QB'\n)\n",
              expected:
                "WITH qb_games AS (SELECT * FROM week_results WHERE position = 'QB') SELECT player, fantasy_pts FROM qb_games WHERE season = 2024 AND week = 1;",
              orderMatters: false,
              hint: "SELECT player, fantasy_pts FROM qb_games WHERE season = 2024 AND week = 1;",
              explain:
                "CTE narrows to QBs; outer query narrows to one week — two simple filters.",
            },
          ],
        },
        {
          id: "u19-l2",
          title: "Chaining Multiple CTEs",
          blurb: "Build a report in stages — each CTE can use the ones before it.",
          brief: {
            goal: "Chain two or more CTEs into a multi-step report.",
      steps: [
        {
          title: "Real reports take steps",
          body: "You rarely get the answer in one pass. First season totals, then ranks. First clean, then group. Cram both into one expression and nobody wants to touch it.",
        },
        {
          title: "One WITH, several names",
          body: "Comma-separate the steps. Each one can use anything defined above it. Reads like a recipe: first this, then that, then the answer.",
          code: "WITH totals AS (\n  SELECT player, SUM(fantasy_pts) AS pts FROM week_results GROUP BY player\n),\nranked AS (\n  SELECT player, pts, RANK() OVER (ORDER BY pts DESC) AS rk FROM totals\n)\nSELECT * FROM ranked WHERE rk <= 5;",
        },
      ],
            setup:
              "One WITH can define several CTEs, comma-separated. Later ones can read earlier ones. Here's season totals feeding a ranking step.",
            previewSql:
              "WITH season_totals AS (SELECT player, SUM(fantasy_pts) AS total FROM week_results WHERE season = 2024 GROUP BY player), ranked AS (SELECT player, total, RANK() OVER (ORDER BY total DESC) AS rk FROM season_totals) SELECT player, total FROM ranked WHERE rk <= 3;",
            previewCaption: "two CTEs: totals, then a rank built from those totals",
          },
          intro: {
            title: "Comma-separate CTEs to chain them",
            text: "WITH first AS (...), second AS (...) — and second can SELECT FROM first. Each step solves one piece. The chain does the rest.",
            code: "WITH season_totals AS (\n  SELECT player, SUM(fantasy_pts) AS total\n  FROM week_results\n  WHERE season = 2024\n  GROUP BY player\n),\nranked AS (\n  SELECT player, total,\n         RANK() OVER (ORDER BY total DESC) AS rk\n  FROM season_totals\n)\nSELECT player, total FROM ranked WHERE rk <= 3;",
          },
          film: [
            {
              title: "Keep each step simple",
              text: "season_totals only aggregates. ranked only ranks. Neither does the other's job — that's the point of chaining.",
            },
            {
              title: "Later can see earlier — not the reverse",
              text: "ranked can read season_totals. season_totals can't reach forward to ranked. If a chain feels tangled, split a step rather than reorder it.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "In WITH a AS (...), b AS (...) SELECT ..., can b's definition reference a?",
              options: [
                "Yes — later CTEs can use earlier ones",
                "No, CTEs can't reference each other",
                "Only inside a JOIN",
                "Only if a is recursive",
              ],
              answer: 0,
              explain: "Later steps build on earlier ones — that's why you chain.",
            },
            {
              type: "fill",
              prompt: "Separate two CTE definitions correctly.",
              parts: [
                "WITH totals AS (SELECT player, SUM(fantasy_pts) AS total FROM week_results GROUP BY player)",
                null,
                "ranked AS (SELECT *, RANK() OVER (ORDER BY total DESC) AS rk FROM totals)\nSELECT * FROM ranked;",
              ],
              bank: [",", ";", "AND"],
              answer: [","],
              explain: "A comma joins two CTE definitions; a semicolon would end the statement early.",
            },
            {
              type: "query",
              prompt:
                "Build a two-step report: a CTE called season_totals with each player's SUM(fantasy_pts) for 2024, then a CTE called ranked that ranks those totals highest first. Return player and total for the top 5.",
              starter:
                "WITH season_totals AS (\n  SELECT player, SUM(fantasy_pts) AS total\n  FROM week_results\n  WHERE season = 2024\n  GROUP BY player\n),\nranked AS (\n  SELECT player, total, RANK() OVER (ORDER BY total DESC) AS rk\n  FROM season_totals\n)\n",
              expected:
                "WITH season_totals AS (SELECT player, SUM(fantasy_pts) AS total FROM week_results WHERE season = 2024 GROUP BY player), ranked AS (SELECT player, total, RANK() OVER (ORDER BY total DESC) AS rk FROM season_totals) SELECT player, total FROM ranked WHERE rk <= 5;",
              orderMatters: false,
              hint: "SELECT player, total FROM ranked WHERE rk <= 5;",
              explain: "Two clean steps beat one query that aggregates and ranks at once.",
            },
            {
              type: "query",
              prompt:
                "Chain a CTE called by_position (average fantasy_pts per position for 2024) into a second CTE called with_gap that subtracts each position's average from 30. Return position and the gap, ordered by position.",
              starter:
                "WITH by_position AS (\n  SELECT position, AVG(fantasy_pts) AS avg_pts\n  FROM week_results\n  WHERE season = 2024\n  GROUP BY position\n),\nwith_gap AS (\n  SELECT position, 30 - avg_pts AS gap FROM by_position\n)\n",
              expected:
                "WITH by_position AS (SELECT position, AVG(fantasy_pts) AS avg_pts FROM week_results WHERE season = 2024 GROUP BY position), with_gap AS (SELECT position, 30 - avg_pts AS gap FROM by_position) SELECT position, gap FROM with_gap ORDER BY position;",
              orderMatters: true,
              hint: "SELECT position, gap FROM with_gap ORDER BY position;",
              explain: "by_position never needs to know about 30 — that math lives in the next step.",
            },
          ],
        },
        {
          id: "u19-l3",
          title: "Walk the Whole Season",
          blurb: "WITH RECURSIVE builds a sequence — then you find what's missing.",
          brief: {
            goal: "Generate a sequence with a recursive CTE, then find gaps in real data.",
      steps: [
        {
          title: "Some rows never got written",
          body: "You want every week of the season — including byes and missed games. Those weeks aren't in the table. You can't SELECT rows that were never there.",
        },
        {
          title: "Build the weeks yourself",
          body: "A recursive CTE has two halves joined by UNION ALL: a start row, then a rule that makes the next row from the last. It keeps going until the rule stops matching.",
          code: "WITH RECURSIVE weeks(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM weeks WHERE n < 18\n)\nSELECT n FROM weeks;",
          note: "Generate 1–18, LEFT JOIN real games onto it. Missing weeks show up as NULLs instead of vanishing.",
        },
      ],
            setup:
              "So far every CTE ran once. A recursive CTE re-runs itself until a stop condition. Classic use: invent week numbers 1–18 that don't live in any table.",
            previewSql:
              "WITH RECURSIVE weeks(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM weeks WHERE n < 18) SELECT n FROM weeks;",
            previewCaption: "18 rows, built one at a time, from nothing",
          },
          intro: {
            title: "Start row, then a rule for the next",
            text: "WITH RECURSIVE name(col) AS (base UNION ALL recursive). The base is SELECT 1. The recursive half SELECTs from the CTE itself — that's what makes it recursive. SQL feeds each result back in until the WHERE stops matching.",
            code: "WITH RECURSIVE weeks(n) AS (\n  SELECT 1                             -- base case: start at 1\n  UNION ALL\n  SELECT n + 1 FROM weeks WHERE n < 18 -- keep adding 1 until 18\n)\nSELECT n FROM weeks;",
          },
          film: [
            {
              title: "Why invent weeks that aren't in the table?",
              text: "week_results only has games that were played. A bye just means no row. Generate weeks 1–18, LEFT JOIN a player's games, and missing weeks become a normal anti-join.",
              code: "WITH RECURSIVE weeks(n) AS (\n  SELECT 1 UNION ALL SELECT n + 1 FROM weeks WHERE n < 18\n)\nSELECT weeks.n AS week\nFROM weeks\nLEFT JOIN week_results w\n  ON w.week = weeks.n AND w.player = 'Josh Allen' AND w.season = 2024\nWHERE w.player IS NULL;",
            },
            {
              title: "You need a stop condition",
              text: "WHERE n < 18 is what ends recursion — when it matches nothing, you're done. Flip the comparison and SQLite hits a recursion limit instead of hanging forever.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "In WITH RECURSIVE weeks(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM weeks WHERE n < 18), what stops the recursion?",
              options: [
                "Nothing — it runs forever",
                "WHERE n < 18 eventually matches no rows, so the recursive step produces nothing new",
                "UNION ALL automatically stops at 18 rows",
                "SQLite caps every CTE at 18 rows",
              ],
              answer: 1,
              explain:
                "Once n hits 18, n < 18 is false — the recursive half returns nothing and you're done.",
            },
            {
              type: "fill",
              prompt: "Complete the base case and the recursive case.",
              parts: [
                "WITH RECURSIVE weeks(n) AS (\n  SELECT ",
                null,
                "\n  ",
                null,
                " SELECT n + 1 FROM weeks WHERE n < 18\n)\nSELECT n FROM weeks;",
              ],
              bank: ["1", "UNION ALL", "0", "JOIN"],
              answer: ["1", "UNION ALL"],
              explain: "Start at 1, then UNION ALL the rule that builds each next row.",
            },
            {
              type: "query",
              prompt:
                "Generate every week number from 1 to 17 using a recursive CTE called weeks(n). Return just n, in order.",
              starter:
                "WITH RECURSIVE weeks(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM weeks WHERE n < 17\n)\n",
              expected:
                "WITH RECURSIVE weeks(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM weeks WHERE n < 17) SELECT n FROM weeks;",
              orderMatters: true,
              hint: "SELECT n FROM weeks;",
              explain: "Seventeen rows, built one at a time from a single starting row.",
            },
            {
              type: "query",
              prompt:
                "Using a recursive CTE that generates weeks 1 through 18, find which weeks Josh Allen has no row for in the 2024 season. Return the missing week numbers.",
              starter:
                "WITH RECURSIVE weeks(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM weeks WHERE n < 18\n)\n",
              expected:
                "WITH RECURSIVE weeks(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM weeks WHERE n < 18) SELECT weeks.n AS week FROM weeks LEFT JOIN week_results w ON w.week = weeks.n AND w.player = 'Josh Allen' AND w.season = 2024 WHERE w.player IS NULL;",
              orderMatters: false,
              hint: "LEFT JOIN week_results w ON w.week = weeks.n AND w.player = 'Josh Allen' AND w.season = 2024, then WHERE w.player IS NULL.",
              explain:
                "Weeks 12 and 18 — same anti-join pattern, now against a generated sequence.",
            },
          ],
        },
        {
          id: "u19-l4",
          title: "Stash a Result and Come Back to It",
          blurb: "CREATE TEMP TABLE: a real table that vanishes when the session ends.",
          brief: {
            goal: "Know when a temp table beats a CTE.",
      steps: [
        {
          title: "A CTE forgets the next query",
          body: "Its name lives for one statement. Run a second query that references it and the database shrugs. Usually fine. Sometimes that's exactly the wall you're hitting.",
        },
        {
          title: "A temp table lasts the session",
          body: "CREATE TEMP TABLE runs the SELECT once and stores the result as a real table. Later queries in the same connection can read it. Disconnect and it's gone — nothing to clean up.",
          code: "CREATE TEMP TABLE big_games AS\nSELECT * FROM week_results WHERE fantasy_pts > 30;",
          note: "It's also computed once, not re-run. Expensive step feeding five later queries? That's why you reach for this.",
        },
      ],
            setup:
              "A CTE's name dies when its query ends. CREATE TEMP TABLE name AS (a SELECT) makes a real table any later query in the session can read. SQLite drops it when the connection closes.",
            previewSql:
              "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts > 25 LIMIT 5;",
            previewCaption: "the kind of result worth stashing instead of recomputing",
          },
          intro: {
            title: "CREATE TEMP TABLE makes a short-lived real table",
            text: "CREATE TEMP TABLE big_games AS SELECT ... runs once and stores rows. Query it from as many later statements as you want, until the session ends. Close the connection and it's gone.",
            code: "CREATE TEMP TABLE big_games AS\nSELECT player, week, fantasy_pts\nFROM week_results\nWHERE fantasy_pts > 25;\n\n-- now usable from any later query, as many times as you like\nSELECT COUNT(*) FROM big_games;",
          },
          film: [
            {
              title: "Computed once vs re-run every time",
              text: "Reference the same CTE three times and SQL may re-run its definition three times. A temp table runs its SELECT once at CREATE — later reads just pull stored rows.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What's the key difference between a temp table and a CTE?",
              options: [
                "Temp tables can't be filtered",
                "A temp table persists across separate queries in the same session; a CTE only exists for one statement",
                "CTEs are faster",
                "Temp tables require a JOIN",
              ],
              answer: 1,
              explain:
                "That session-long life is why temp tables exist — querying them is otherwise just like any table.",
            },
            {
              type: "mc",
              prompt: "When does a SQLite temp table disappear?",
              options: [
                "Immediately after CREATE runs",
                "When the database connection/session ends",
                "After 24 hours",
                "It never does — you must DROP it manually",
              ],
              answer: 1,
              explain: "It acts like a real table until the session closes, then SQLite cleans it up.",
            },
            {
              type: "fill",
              prompt: "Store a query's result as a temp table.",
              parts: [
                "",
                null,
                " TEMP TABLE big_games AS\nSELECT player, fantasy_pts FROM week_results WHERE fantasy_pts > 25;",
              ],
              bank: ["CREATE", "WITH", "SELECT INTO"],
              answer: ["CREATE"],
              explain: "CREATE TEMP TABLE name AS (a SELECT) — AS fills the table from the query.",
            },
            {
              type: "mc",
              prompt:
                "You'll join the same expensive aggregate to three different tables in one script. What's the better fit — a CTE repeated three times, or a temp table?",
              options: [
                "A CTE, always — simpler syntax",
                "A temp table — the aggregate runs once instead of three times",
                "Neither works for this",
                "A VIEW is required",
              ],
              answer: 1,
              explain: "Compute once, reuse — that's the temp-table sweet spot.",
            },
          ],
        },
        {
          id: "u19-l5",
          title: "Pick the Right Tool",
          blurb: "Subquery, CTE, or temp table — one decision: how long must it live?",
          brief: {
            goal: "Choose between a subquery, a CTE, and a temp table without guessing.",
      steps: [
        {
          title: "Three tools, same job",
          body: "Subqueries, CTEs, and temp tables all hold a middle result for later SQL. None can do something the others can't. The choice isn't about power.",
        },
        {
          title: "Ask how long it needs to live",
          body: "Once, buried in one query, small? Subquery. Once, but with real steps? CTE. Several separate queries in a row? Temp table.",
          note: "Scope and lifetime — not capability. Phrase it that way and the guesswork drops.",
        },
      ],
            setup:
              "All three compute a middle result. The difference is lifetime, not power. One question settles most cases: does anything outside this statement need to see it?",
            previewSql:
              "SELECT player, SUM(fantasy_pts) AS total FROM week_results WHERE season = 2024 GROUP BY player LIMIT 5;",
            previewCaption: "the same aggregate — subquery, CTE, or temp table, depending on who needs it",
          },
          intro: {
            title: "One statement or many?",
            text: "Once, buried in a single query? Subquery. Once, with multiple steps? CTE. Several separate queries, or expensive to recompute? Temp table. Pick the simplest tool that lasts as long as you need.",
            code: "-- once, simple:          a subquery\n-- once, multi-step:      a CTE\n-- reused across queries: a temp table",
          },
          film: [
            {
              title: "Readability breaks the subquery–CTE tie",
              text: "In SQLite, one subquery and one CTE compute the same. One filter? Subquery is fine. About to nest a second subquery just to keep reading top-down? Switch to a CTE.",
            },
            {
              title: "Reuse is what justifies a temp table",
              text: "A temp table is a real object — space, and something else to track. Pay that only when you genuinely reuse the result across queries, or when recomputing would hurt.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "A query needs a season-totals calculation exactly once, as one step before a final SELECT. Best fit?",
              options: ["A temp table", "A CTE", "Neither works", "A trigger"],
              answer: 1,
              explain: "One statement, one use — a CTE gives the name without outliving the query.",
            },
            {
              type: "mc",
              prompt:
                "Three completely separate reports, run as three separate queries, all need the same expensive season-totals number. Best fit?",
              options: [
                "Repeat the same CTE in all three queries",
                "A temp table, computed once and read three times",
                "A subquery in each one",
                "It can't be done",
              ],
              answer: 1,
              explain: "A CTE's name dies with its statement — this is where a temp table wins.",
            },
            {
              type: "fill",
              prompt: "Match the tool to its lifetime.",
              parts: [
                "Subquery: one clause only. CTE: ",
                null,
                ". Temp table: ",
                null,
                ".",
              ],
              bank: ["one statement", "the whole session"],
              answer: ["one statement", "the whole session"],
              explain: "Pick the shortest lifetime that still covers what you need.",
            },
            {
              type: "mc",
              prompt:
                "Why default to a CTE over a temp table when either would technically work?",
              options: [
                "CTEs are always faster",
                "A temp table is a real object that outlives the query and has to be tracked and cleaned up — extra cost that should be justified by real reuse",
                "Temp tables can't be filtered",
                "There's no reason, they're identical",
              ],
              answer: 1,
              explain: "Default to simpler. Reach for more persistence only when you need it.",
            },
          ],
        },
      ],
    },
    {
      id: "u20",
      number: 8,
      title: "Overtime — Views",
      drive: "Overtime, 2nd Drive · Own 40",
      description:
        "A CTE disappears when the query ends. A view stays, and you query it like a table.",
      skills: ["CREATE VIEW", "Updatable views"],
      status: "live",
      lessons: [
        {
          id: "u20-l1",
          title: "A Saved Query That Acts Like a Table",
          blurb: "CREATE VIEW packages a query so anyone can SELECT from it later.",
          brief: {
            goal: "Know what a view actually stores.",
      steps: [
        {
          title: "It stores the question, not the answer",
          body: "Most people assume a view holds rows. It doesn't. It holds a SELECT. Every time someone queries the view, that SELECT runs again from scratch.",
        },
        {
          title: "So it never goes stale",
          body: "Save the query once. Everyone who uses the name gets today's answer — computed now, not a snapshot from create day. One shared definition of \"season totals.\"",
          code: "SELECT * FROM season_totals WHERE total > 200;",
          note: "Querying a view feels like querying a table — filter it, join it, group it. Often you can't tell which you hit.",
        },
      ],
            setup:
              "A view stores a query, not data. Every SELECT from it re-runs the underlying SQL and returns fresh rows. Package once; everyone gets the current answer.",
            previewSql:
              "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2024 GROUP BY player ORDER BY total DESC LIMIT 5;",
            previewCaption: "exactly the kind of query worth packaging as a view",
          },
          intro: {
            title: "CREATE VIEW name AS (a SELECT)",
            text: "After that, SELECT * FROM season_totals — WHERE, JOIN, all of it. Behind the name, SQLite re-runs the stored SELECT fresh every time.",
            code: "CREATE VIEW season_totals AS\nSELECT player, SUM(fantasy_pts) AS total\nFROM week_results\nWHERE season = 2024\nGROUP BY player;\n\n-- later, from anyone, any time:\nSELECT * FROM season_totals ORDER BY total DESC LIMIT 5;",
          },
          film: [
            {
              title: "No cached rows — just the question",
              text: "Add a new week to week_results and season_totals is current on the next read. A temp table would still hold yesterday's freeze.",
            },
            {
              title: "Close enough to a stored procedure for reads",
              text: "SQLite has no full stored procedures. A view can't take parameters, but it does package a complicated SELECT under one name so nobody retypes it wrong.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does a view actually store?",
              options: [
                "A cached copy of the result rows",
                "The SELECT query itself — re-run fresh every time someone queries the view",
                "A pointer to a temp table",
                "Nothing until you query it once",
              ],
              answer: 1,
              explain: "No data is cached — every read re-runs the underlying query, so it stays current.",
            },
            {
              type: "mc",
              prompt:
                "New games get added to week_results. What happens to a view built on that table?",
              options: [
                "It goes stale until manually refreshed",
                "It's automatically up to date — its next query includes the new rows",
                "It breaks and must be recreated",
                "Nothing changes until the app restarts",
              ],
              answer: 1,
              explain: "The view has no stored data of its own — the next query just sees the live table.",
            },
            {
              type: "fill",
              prompt: "Package a season-totals query as a view.",
              parts: [
                "",
                null,
                " VIEW season_totals ",
                null,
                "\nSELECT player, SUM(fantasy_pts) AS total FROM week_results GROUP BY player;",
              ],
              bank: ["CREATE", "AS", "TEMP"],
              answer: ["CREATE", "AS"],
              explain: "CREATE VIEW name AS (a SELECT) — same AS pattern as CTEs and temp tables.",
            },
            {
              type: "mc",
              prompt:
                "Which one of these can a view NOT do that a real stored procedure could?",
              options: [
                "Be queried with a WHERE clause",
                "Accept a parameter and branch on it",
                "Be joined to another table",
                "Return more than one column",
              ],
              answer: 1,
              explain: "A view is one fixed query — no parameters or branching in SQLite.",
            },
          ],
        },
        {
          id: "u20-l2",
          title: "Package a Query for Real",
          blurb: "Write CREATE VIEW — and DROP VIEW when you're done.",
          brief: {
            goal: "Write a CREATE VIEW statement, and drop one when it's no longer needed.",
      steps: [
        {
          title: "Three words in front of the SELECT",
          body: "You already know the query. Wrap it: CREATE VIEW, a name, AS. That's the whole syntax.",
          code: "CREATE VIEW season_totals AS\nSELECT player, SUM(fantasy_pts) AS total\nFROM week_results\nGROUP BY player;",
        },
        {
          title: "Dropping one is safe",
          body: "DROP VIEW removes the saved definition only. No data lived there, so there's nothing to lose — easy to experiment.",
          code: "DROP VIEW season_totals;",
        },
      ],
            setup:
              "CREATE VIEW, a name, AS, then the SELECT you already write. DROP VIEW name removes the definition — no rows to lose.",
            previewSql:
              "SELECT position, ROUND(AVG(fantasy_pts), 1) AS ppg FROM week_results WHERE season = 2024 GROUP BY position;",
            previewCaption: "position averages — a natural view to package",
          },
          intro: {
            title: "CREATE VIEW, then DROP VIEW when you're done",
            text: "CREATE VIEW position_averages AS SELECT ... makes it. DROP VIEW position_averages removes just the saved definition — there was never data under that name.",
            code: "CREATE VIEW position_averages AS\nSELECT position, AVG(fantasy_pts) AS ppg\nFROM week_results\nGROUP BY position;\n\nDROP VIEW position_averages;",
          },
          film: [
            {
              title: "Views can stack on views",
              text: "CREATE VIEW top_scorers AS SELECT * FROM season_totals WHERE total > 300 works — CTE-style layering, made permanent. Stack three deep and tracing a number gets hard.",
            },
          ],
          exercises: [
            {
              type: "fill",
              prompt: "Remove a view that's no longer needed.",
              parts: ["", null, " VIEW position_averages;"],
              bank: ["DROP", "DELETE", "REMOVE"],
              answer: ["DROP"],
              explain: "DROP VIEW — same DROP family as tables, indexes, and triggers.",
            },
            {
              type: "mc",
              prompt: "You DROP a view. What happens to the underlying data in week_results?",
              options: [
                "It's deleted too",
                "Nothing — the view never stored any data, only the query",
                "It's archived",
                "The table is locked",
              ],
              answer: 1,
              explain: "You dropped a saved question, not an answer — the source table is untouched.",
            },
            {
              type: "mc",
              prompt:
                "CREATE VIEW top_scorers AS SELECT * FROM season_totals WHERE total > 300 — what is this an example of?",
              options: [
                "An error — views can't reference other views",
                "A view built on top of another view",
                "A recursive view",
                "A trigger",
              ],
              answer: 1,
              explain: "A view is queryable, so another view can sit on top — same idea as chaining CTEs.",
            },
            {
              type: "mc",
              prompt: "What's the risk of stacking views three or four layers deep?",
              options: [
                "SQLite doesn't allow it",
                "It gets hard to trace where a number actually comes from — the same readability cost as an overly long CTE chain",
                "It's always slower than a single query",
                "Views can only be stacked twice",
              ],
              answer: 1,
              explain: "Nothing technical blocks deep stacks — the cost is how hard the chain is to follow.",
            },
          ],
        },
        {
          id: "u20-l3",
          title: "Can You Write Through a View?",
          blurb: "Some views accept INSERT/UPDATE; most real ones don't.",
          brief: {
            goal: "Know when a view can be written through, and why most can't.",
      steps: [
        {
          title: "Sometimes writes go through",
          body: "Plain SELECT from one table, no grouping, no join? The database can map an UPDATE to one real row — so it lets the write through.",
        },
        {
          title: "Usually it refuses — on purpose",
          body: "Add a GROUP BY and one view row stands for forty real rows. Update it to 40 and there's no sensible answer which of those forty change. Rejecting the write beats guessing.",
          note: "Ambiguity blocks the write. If SQL can't name one row to change, it says no.",
        },
      ],
            setup:
              "A single-table view with no GROUP BY, JOIN, or aggregate can often take UPDATE/INSERT — SQLite maps the write to the real table. Join or aggregate? Ambiguous — write rejected.",
            previewSql:
              "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 LIMIT 5;",
            previewCaption: "a plain, single-table shape — the kind a view CAN be updatable through",
          },
          intro: {
            title: "Simple views can be updatable; aggregates can't",
            text: "UPDATE buffalo_games SET fantasy_pts = 40 can work when the view is a plain SELECT off one table. UPDATE season_totals SET total = 999 doesn't — total is a SUM across many rows.",
            code: "-- updatable in principle: one table, no aggregation\nCREATE VIEW buffalo_games AS\nSELECT * FROM week_results WHERE team = 'BUF';\n\n-- NOT updatable: an aggregate has no one row to write back to\nCREATE VIEW season_totals AS\nSELECT player, SUM(fantasy_pts) AS total FROM week_results GROUP BY player;",
          },
          film: [
            {
              title: "Ask: which real row would this change?",
              text: "UPDATE buffalo_games for Josh Allen week 1 maps to one week_results row. UPDATE season_totals SET total = 999 has nowhere to write — you can't reverse a SUM.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which of these views could realistically accept an UPDATE?",
              options: [
                "A view grouping by player with SUM(fantasy_pts)",
                "A view that's a plain SELECT * FROM week_results WHERE team = 'BUF'",
                "A view joining rosters to week_results",
                "A view using RANK() OVER (...)",
              ],
              answer: 1,
              explain: "One table, no aggregation, no join — SQLite can trace the write to one real row.",
            },
            {
              type: "mc",
              prompt: "Why can't you UPDATE a view built with GROUP BY and SUM()?",
              options: [
                "SQLite has a bug",
                "There's no single real row a change to the summed total could write back to",
                "GROUP BY views are read-only by license",
                "You actually can, it's just slow",
              ],
              answer: 1,
              explain: "A SUM erases which rows it came from — nothing for UPDATE to reverse.",
            },
            {
              type: "fill",
              prompt: "The test for whether a view might be updatable.",
              parts: ["Ask: which real ", null, " would this write actually change?"],
              bank: ["row", "table"],
              answer: ["row"],
              explain: "Updatability means tracing a write to one specific row in one underlying table.",
            },
            {
              type: "mc",
              prompt: "A view joins rosters to week_results. You try to UPDATE it. What happens?",
              options: [
                "It updates both tables",
                "It's rejected — a join means a write could apply to more than one table, which SQLite refuses to guess at",
                "It silently does nothing",
                "It only updates rosters",
              ],
              answer: 1,
              explain: "Same as aggregates: more than one possible target → SQLite won't guess.",
            },
          ],
        },
        {
          id: "u20-l4",
          title: "Three Tools, Complete",
          blurb: "Subquery, CTE, temp table, view — pick by how long it must live.",
          brief: {
            goal: "Add views to the CTE-vs-temp-table decision from last unit.",
      steps: [
        {
          title: "Now there are four",
          body: "Same decision as last unit, plus one more. A view outlives the statement and the session — until someone DROP VIEWs it.",
        },
        {
          title: "The full checklist",
          body: "One clause, small? Subquery. One statement, with steps? CTE. This session, reused? Temp table. Every session, shared forever? View.",
          note: "A view is also the only one other people find without you telling them — often the real reason to make one.",
        },
      ],
            setup:
              "Same question — how long must this survive? — with one more answer. A view lasts past the query and the session, until someone drops it.",
            previewSql:
              "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2024 GROUP BY player ORDER BY total DESC LIMIT 5;",
            previewCaption: "one query, four ways to hold onto it: subquery, CTE, temp table, view",
          },
          intro: {
            title: "Does it need to outlive the session?",
            text: "Subquery: this clause. CTE: this statement. Temp table: this session. View: until dropped — and always current, because it re-runs. Only a view is findable by name days later from another session.",
            code: "-- once, this session:      a temp table\n-- forever, always current: a view",
          },
          film: [
            {
              title: "Fresh vs frozen",
              text: "A temp table is a snapshot — fast to reread, frozen at CREATE. A view stays current but pays the full SELECT every time — dashboards want views; once-per-session reports want temp tables.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "A dashboard needs 'current season totals, right now' every time someone opens it. Best fit?",
              options: [
                "A temp table, refreshed manually",
                "A view — always current because it re-runs the query fresh",
                "A CTE, redefined on every page load",
                "It doesn't matter",
              ],
              answer: 1,
              explain: "The dashboard needs freshness — a view never caches, so it's always current.",
            },
            {
              type: "mc",
              prompt:
                "A once-a-day batch report runs the same expensive aggregate six times across six separate queries, and staleness for a few minutes is fine. Best fit?",
              options: [
                "A view, recomputed six times",
                "A temp table, computed once and reused six times",
                "Six separate subqueries",
                "A trigger",
              ],
              answer: 1,
              explain: "Pay once, read six times — classic temp-table job.",
            },
            {
              type: "fill",
              prompt: "Rank all four tools by how long their result survives, shortest first.",
              parts: ["Subquery < ", null, " < ", null, " < View"],
              bank: ["CTE", "Temp table"],
              answer: ["CTE", "Temp table"],
              explain: "Each step buys a longer lifetime — from one clause up to a permanent view.",
            },
            {
              type: "mc",
              prompt: "What's the one thing a view can do that none of the other three can?",
              options: [
                "Be filtered with WHERE",
                "Be found by name from a completely different session, days later",
                "Contain a JOIN",
                "Use an aggregate function",
              ],
              answer: 1,
              explain: "Subqueries, CTEs, and temp tables die with the session (or sooner). Views stick.",
            },
          ],
        },
      ],
    },
    {
      id: "u21",
      number: 9,
      title: "Overtime — Triggers",
      drive: "Overtime, 3rd Drive · Midfield",
      description:
        "So far every query ran because you asked. A trigger runs itself when a row changes.",
      skills: ["CREATE TRIGGER", "BEFORE / AFTER"],
      status: "live",
      lessons: [
        {
          id: "u21-l1",
          title: "Code That Runs Itself",
          blurb: "A trigger fires automatically on INSERT, UPDATE, or DELETE.",
          brief: {
            goal: "Know when and why a trigger fires.",
      steps: [
        {
          title: "So far, you pressed go",
          body: "Every statement in this course needed someone to type it and run it. A trigger is different. You define it once — then it runs itself.",
        },
        {
          title: "It watches one table for one event",
          body: "Attach it to a table and to an event: before or after insert, update, or delete. When that event happens, it fires. Nobody calls it. It keeps firing long after you've forgotten writing it.",
          note: "That's why triggers are powerful and a little dangerous — invisible automation will surprise you later.",
        },
      ],
            setup:
              "You've typed every statement so far. A trigger is different: define it once on a table and an event (BEFORE or AFTER INSERT/UPDATE/DELETE), and it fires by itself every time that event happens.",
            previewSql: "SELECT player, team_name FROM rosters LIMIT 5;",
            previewCaption: "a change to a table like this is exactly what a trigger watches for",
          },
          intro: {
            title: "Watch one table for one kind of change",
            text: "CREATE TRIGGER name AFTER INSERT ON rosters ... names the table and the event. When a row lands in rosters, the trigger body runs — log it, check it, react — without the INSERT author doing anything extra.",
            code: "-- fires automatically, every time, forever\nCREATE TRIGGER log_new_player\nAFTER INSERT ON rosters\nBEGIN\n  INSERT INTO roster_log (player, team, changed_at)\n  VALUES (NEW.player, NEW.team_name, datetime('now'));\nEND;",
          },
          film: [
            {
              title: "BEFORE vs AFTER are different moments",
              text: "BEFORE runs before the change sticks — good for validating or rejecting. AFTER runs once it's real — good for logging, too late to stop a bad row.",
            },
            {
              title: "NEW and OLD see the change",
              text: "NEW is the incoming row (or new UPDATE values); OLD is the row before delete/update. INSERT has only NEW, DELETE only OLD, UPDATE has both.",
              code: "-- UPDATE trigger, seeing both sides of the change\nCREATE TRIGGER log_trade\nAFTER UPDATE ON rosters\nBEGIN\n  INSERT INTO trade_log (player, old_team, new_team)\n  VALUES (NEW.player, OLD.team_name, NEW.team_name);\nEND;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What actually causes a trigger to run?",
              options: [
                "Someone explicitly calls it by name",
                "A matching INSERT, UPDATE, or DELETE happens on the table it's attached to",
                "It runs once a day automatically",
                "The database restarting",
              ],
              answer: 1,
              explain: "It fires on the event — you don't call it by name.",
            },
            {
              type: "mc",
              prompt:
                "You want to reject an INSERT if a value is invalid, before it's ever saved. BEFORE or AFTER?",
              options: [
                "AFTER — check it once it exists",
                "BEFORE — the change hasn't been committed yet, so it can still be stopped",
                "Either works identically",
                "Neither can reject an insert",
              ],
              answer: 1,
              explain: "AFTER is too late — the row is already there. Validate in BEFORE.",
            },
            {
              type: "mc",
              prompt: "Inside a DELETE trigger's body, which reference is available?",
              options: [
                "Only NEW",
                "Only OLD — there's no new row, since the row is being removed",
                "Both NEW and OLD",
                "Neither",
              ],
              answer: 1,
              explain: "A DELETE has nothing new — OLD is the row right before removal.",
            },
            {
              type: "fill",
              prompt: "Name the two references a trigger uses to see a row's before/after state.",
              parts: ["", null, " for the incoming row, ", null, " for the row as it was."],
              bank: ["NEW", "OLD"],
              answer: ["NEW", "OLD"],
              explain: "NEW and OLD are how the trigger body reaches the row that fired it.",
            },
          ],
        },
        {
          id: "u21-l2",
          title: "Write the Trigger",
          blurb: "Full CREATE TRIGGER syntax, piece by piece.",
          brief: {
            goal: "Write a complete CREATE TRIGGER statement.",
      steps: [
        {
          title: "Five pieces, same order every time",
          body: "CREATE TRIGGER, a name, when it fires, what event, which table, then a block of SQL. See the five slots and you're just filling them in.",
        },
        {
          title: "Inside BEGIN…END is normal SQL",
          body: "No special trigger language. Usually an INSERT into a log table. NEW gives you the row that just landed so you can record what changed.",
          code: "CREATE TRIGGER log_roster_add\nAFTER INSERT ON rosters\nBEGIN\n  INSERT INTO roster_log(player) VALUES (NEW.player);\nEND;",
          note: "NEW is the incoming row; OLD is the row before an update or delete. Which exists depends on the event.",
        },
      ],
            setup:
              "Same shape every time: CREATE TRIGGER, name, BEFORE/AFTER + INSERT/UPDATE/DELETE, ON table, then BEGIN…END with the SQL to run. Here's one that logs every new roster entry.",
            previewSql: "SELECT player, team_name FROM rosters LIMIT 5;",
            previewCaption: "the table a trigger would watch",
          },
          intro: {
            title: "Five pieces, always in the same order",
            text: "CREATE TRIGGER name [BEFORE|AFTER] [INSERT|UPDATE|DELETE] ON table BEGIN ... END. Inside is ordinary SQL — often an INSERT into a log, using NEW or OLD. Multiple statements each get their own semicolon.",
            code: "CREATE TRIGGER log_new_player\nAFTER INSERT ON rosters\nBEGIN\n  INSERT INTO roster_log (player, team, changed_at)\n  VALUES (NEW.player, NEW.team_name, datetime('now'));\nEND;",
          },
          film: [
            {
              title: "More than one statement is fine",
              text: "BEGIN…END can hold several statements, each with its own semicolon. One roster change can log and update a summary count in the same firing.",
            },
          ],
          exercises: [
            {
              type: "fill",
              prompt: "Assemble the trigger header in the right order.",
              parts: [
                "CREATE ",
                null,
                " log_new_player\n",
                null,
                " INSERT ON rosters\nBEGIN\n  ...\nEND;",
              ],
              bank: ["TRIGGER", "AFTER", "VIEW"],
              answer: ["TRIGGER", "AFTER"],
              explain: "CREATE TRIGGER, a name, then timing and event — same order every time.",
            },
            {
              type: "mc",
              prompt: "What ends the block of SQL a trigger runs?",
              options: [
                "A closing parenthesis",
                "END, matching the BEGIN that opened it",
                "A final RETURN statement",
                "Nothing — it runs until the connection closes",
              ],
              answer: 1,
              explain: "BEGIN…END wraps the body — END closes what BEGIN opened.",
            },
            {
              type: "mc",
              prompt: "Can a trigger's BEGIN...END block contain more than one statement?",
              options: [
                "No, exactly one",
                "Yes — each statement inside gets its own semicolon, and all of them run together",
                "Only in MySQL, not SQLite",
                "Only if they're all INSERTs",
              ],
              answer: 1,
              explain: "Everything in the block runs as one firing — handy for several side effects.",
            },
            {
              type: "mc",
              prompt:
                "A trigger references NEW.team_name inside an AFTER INSERT trigger on rosters. What does that resolve to?",
              options: [
                "The team_name value of the row that was just inserted",
                "The previous team_name before this row existed",
                "Every team_name in the table",
                "An error — NEW isn't valid on INSERT",
              ],
              answer: 0,
              explain: "On INSERT, NEW is the row that just landed — the one that fired the trigger.",
            },
          ],
        },
        {
          id: "u21-l3",
          title: "Find and Remove Automation",
          blurb: "Triggers stay invisible until you know where to look.",
          brief: {
            goal: "List existing triggers, and remove one safely.",
      steps: [
        {
          title: "You won't see them on the table",
          body: "Inspect columns and a trigger won't show up — it's a separate object. Inherit a database and a few may be firing that nobody mentioned.",
        },
        {
          title: "sqlite_master lists everything",
          body: "Tables, views, indexes, triggers — plus the SQL that created each. Query it when you want to know what a database is doing behind your back.",
          code: "SELECT name, sql FROM sqlite_master WHERE type = 'trigger';",
          note: "Good day-one habit on an unfamiliar database: look before you write.",
        },
      ],
            setup:
              "Triggers don't appear in a table's columns. SQLite keeps every definition in sqlite_master — same catalog as tables and views.",
            previewSql: "SELECT name FROM sqlite_master WHERE type = 'table';",
            previewCaption: "sqlite_master — the catalog every object gets listed in",
          },
          intro: {
            title: "sqlite_master lists every trigger (and more)",
            text: "SELECT name, sql FROM sqlite_master WHERE type = 'trigger' shows each name and its full CREATE TRIGGER. DROP TRIGGER name removes it — after that, nothing fires on the next INSERT that used to.",
            code: "-- find every trigger in the database\nSELECT name, sql FROM sqlite_master WHERE type = 'trigger';\n\n-- remove one\nDROP TRIGGER log_new_player;",
          },
          film: [
            {
              title: "Inherited automation is a common surprise",
              text: "Rows appear in a log you never touched? Check sqlite_master for triggers before you blame the app. Silent side effects don't show up in the INSERT that caused them.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Where does SQLite store the definition of every trigger in a database?",
              options: [
                "In a separate .trigger file",
                "In sqlite_master, alongside tables, views, and indexes",
                "Triggers aren't stored, only re-typed each session",
                "In the table they're attached to",
              ],
              answer: 1,
              explain: "sqlite_master is the catalog where every named object shows up.",
            },
            {
              type: "fill",
              prompt: "List every trigger's name and full definition.",
              parts: ["SELECT name, sql FROM sqlite_master WHERE type = ", null, ";"],
              bank: ["'trigger'", "'table'", "trigger"],
              answer: ["'trigger'"],
              explain: "type is text, so 'trigger' needs quotes — same as any text comparison.",
            },
            {
              type: "fill",
              prompt: "Remove a trigger by name.",
              parts: ["", null, " TRIGGER log_new_player;"],
              bank: ["DROP", "DELETE", "REMOVE"],
              answer: ["DROP"],
              explain: "DROP TRIGGER — same DROP family as tables, views, and indexes.",
            },
            {
              type: "mc",
              prompt:
                "Why is it worth checking sqlite_master for triggers before debugging an unexpected row change?",
              options: [
                "Triggers always cause bugs",
                "A trigger fires silently — nothing in the query that changed the data will mention it",
                "It's required before every query",
                "Triggers can't be queried directly",
              ],
              answer: 1,
              explain: "The INSERT or UPDATE shows no sign a trigger fired — you have to go looking.",
            },
          ],
        },
      ],
    },
    {
      id: "u22",
      number: 10,
      title: "Overtime — Indexing & Query Plans",
      drive: "Overtime, 4th Drive · Red Zone",
      description:
        "A correct query can still be the slow one. Read the plan, then give the lookup a shorter path.",
      skills: ["EXPLAIN QUERY PLAN", "CREATE INDEX", "Composite indexes"],
      status: "live",
      lessons: [
        {
          id: "u22-l1",
          title: "What Did the Database Actually Do?",
          blurb: "EXPLAIN QUERY PLAN shows the plan — so you don't have to guess.",
          brief: {
            goal: "Read and write EXPLAIN QUERY PLAN output.",
      steps: [
        {
          title: "You've never asked how it found the rows",
          body: "You wrote what you wanted; results came back. In between, the database picks a plan. That choice is what makes a query fast or painfully slow.",
        },
        {
          title: "Ask for the plan",
          body: "Put EXPLAIN QUERY PLAN in front of any SELECT. You get a description instead of data. Right now every plan here says SCAN — read every row — because there are no indexes yet.",
          code: "EXPLAIN QUERY PLAN\nSELECT * FROM week_results WHERE player = 'Josh Allen';",
          note: "SCAN on 876 rows is instant. SCAN on 876 million is a meeting about why the dashboard times out.",
        },
      ],
            setup:
              "EXPLAIN QUERY PLAN in front of a SELECT returns how SQLite plans to find the rows — not the rows. With no indexes here, every plan says SCAN.",
            previewSql:
              "EXPLAIN QUERY PLAN SELECT * FROM week_results WHERE player = 'Josh Allen';",
            previewCaption: "SCAN week_results — read every row, checking each one",
          },
          intro: {
            title: "SCAN means read every row and check it",
            text: "EXPLAIN QUERY PLAN SELECT ... returns a plan, not your data. SCAN week_results means walk the whole table testing your WHERE. Fine on ~900 rows. Brutal on 900 million.",
            code: "EXPLAIN QUERY PLAN\nSELECT * FROM week_results WHERE player = 'Josh Allen';\n\n-- returns something like:\n-- SCAN week_results",
          },
          film: [
            {
              title: "A plan is a description, not an answer",
              text: "EXPLAIN QUERY PLAN never runs your query for real — it asks what SQLite would do. Safe on slow reports and huge result sets; you're reading intent, not paying the cost.",
            },
            {
              title: "Everything here says SCAN — on purpose",
              text: "No indexes yet, so every plan is a full scan. That's the honest starting point. Next lesson is what changes once you add one.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does EXPLAIN QUERY PLAN actually return?",
              options: [
                "Your query's normal result rows, just formatted differently",
                "A description of how the database intends to find the rows — not the rows themselves",
                "The time the query took to run",
                "An error unless the query has already run once",
              ],
              answer: 1,
              explain: "It's a plan, not data — safe to run, since the query doesn't execute for real.",
            },
            {
              type: "mc",
              prompt: "What does SCAN week_results in a query plan mean?",
              options: [
                "The table is broken",
                "Every row in week_results gets read and checked against the WHERE clause",
                "The query failed",
                "An index was used",
              ],
              answer: 1,
              explain: "A scan is the fallback: check every row when there's no faster path.",
            },
            {
              type: "fill",
              prompt: "Ask SQLite how it plans to run a query, without actually running it.",
              parts: ["", null, " ", null, "\nSELECT * FROM week_results WHERE season = 2024;"],
              bank: ["EXPLAIN", "QUERY PLAN", "DESCRIBE"],
              answer: ["EXPLAIN", "QUERY PLAN"],
              explain: "EXPLAIN QUERY PLAN goes right before the SELECT you're asking about.",
            },
            {
              type: "query",
              prompt:
                "Write EXPLAIN QUERY PLAN for a query that selects everything from week_results where the team is 'KC'.",
              starter: "",
              expected: "EXPLAIN QUERY PLAN SELECT * FROM week_results WHERE team = 'KC';",
              orderMatters: true,
              hint: "EXPLAIN QUERY PLAN SELECT * FROM week_results WHERE team = 'KC';",
              explain: "Same SCAN as the rest of this lesson — no index on team yet either.",
            },
          ],
        },
        {
          id: "u22-l2",
          title: "Give the Planner a Shortcut",
          blurb: "CREATE INDEX turns a scan into a search.",
          brief: {
            goal: "Know what an index changes about a query plan.",
      steps: [
        {
          title: "Like the index at the back of a book",
          body: "Without one, finding a name means reading every page. With one, you look it up and jump to the right pages. A database index is that idea, kept up to date automatically.",
        },
        {
          title: "CREATE INDEX turns SCAN into SEARCH",
          body: "Index the column you filter on, rerun the same query, and the plan changes. SEARCH means it went more or less straight to the rows.",
          code: "CREATE INDEX idx_player ON week_results(player);",
          note: "Indexes aren't free — space plus work on every write. Index what you filter and join on, not every column.",
        },
      ],
            setup:
              "An index is a sorted shortcut beside the table — like a book index. CREATE INDEX idx_player ON week_results(player) builds one on player.",
            previewSql:
              "SELECT player, fantasy_pts FROM week_results WHERE player = 'Josh Allen' LIMIT 5;",
            previewCaption: "the exact kind of lookup an index on player would speed up",
          },
          intro: {
            title: "CREATE INDEX turns SCAN into SEARCH",
            text: "CREATE INDEX idx_player ON week_results(player) builds a sorted lookup. Same WHERE player = 'Josh Allen' afterward plans as SEARCH ... USING INDEX instead of SCAN — jump to the matches instead of walking the table.",
            code: "CREATE INDEX idx_player ON week_results(player);\n\nEXPLAIN QUERY PLAN\nSELECT * FROM week_results WHERE player = 'Josh Allen';\n-- SEARCH week_results USING INDEX idx_player (player=?)",
          },
          film: [
            {
              title: "Before and after, same question",
              text: "Before: SCAN — check ~900 rows. After CREATE INDEX idx_player: SEARCH USING INDEX — jump to Josh Allen's rows for the same answer with far less work.",
              code: "-- before\nSCAN week_results\n\n-- after CREATE INDEX idx_player ON week_results(player)\nSEARCH week_results USING INDEX idx_player (player=?)",
            },
            {
              title: "Indexes cost writes and space",
              text: "Every INSERT/UPDATE on an indexed column updates the index too. Speed up the filters you actually use; leave the rest alone.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Before any index exists, what does a query plan say for WHERE player = 'Josh Allen'?",
              options: ["SEARCH", "SCAN — every row gets checked", "INDEX", "ERROR"],
              answer: 1,
              explain: "With nothing to jump to, a full scan is the only option.",
            },
            {
              type: "mc",
              prompt:
                "After CREATE INDEX idx_player ON week_results(player), what changes in the plan for that same query?",
              options: [
                "Nothing — indexes don't affect query plans",
                "SCAN becomes SEARCH ... USING INDEX — the planner jumps to matching rows instead of checking every one",
                "The query starts returning different rows",
                "It becomes slower",
              ],
              answer: 1,
              explain: "Same correct answer, reached by checking far fewer rows.",
            },
            {
              type: "fill",
              prompt: "Build an index on the player column of week_results.",
              parts: ["", null, " idx_player ON week_results(", null, ");"],
              bank: ["CREATE INDEX", "player", "CREATE TABLE"],
              answer: ["CREATE INDEX", "player"],
              explain: "CREATE INDEX name ON table(column) — name it, pick the table, pick the column.",
            },
            {
              type: "mc",
              prompt: "Why not just index every column, to be safe?",
              options: [
                "SQLite has a hard limit of one index per table",
                "Every index has to be updated on every INSERT/UPDATE, so more indexes means slower writes and more disk space, for columns that may never even be searched on",
                "Indexes expire after 30 days",
                "It's not possible to have more than one index total",
              ],
              answer: 1,
              explain: "It's a tradeoff — worth it for columns you filter or join on often, wasteful otherwise.",
            },
          ],
        },
        {
          id: "u22-l3",
          title: "Indexing More Than One Column",
          blurb: "In a composite index, column order isn't cosmetic.",
          brief: {
            goal: "Know why column order matters in a multi-column index.",
      steps: [
        {
          title: "One index, two columns",
          body: "A composite index sorts by its first column, then by its second within each value of the first. That order decides which queries it helps — and which it can't.",
        },
        {
          title: "Think phone book",
          body: "Sorted by last name, then first. Great for every Allen, or one Josh Allen. Useless for every Josh — those names are scattered through the book.",
          code: "CREATE INDEX idx_player_season ON week_results(player, season);",
          note: "The index helps queries that use its first column. Put what you always filter on first; the sometimes-extra second.",
        },
      ],
            setup:
              "CREATE INDEX idx_player_season ON week_results(player, season) sorts by player first, then season. That order isn't style — it decides which filters the index can help.",
            previewSql:
              "SELECT * FROM week_results WHERE player = 'Josh Allen' AND season = 2024;",
            previewCaption: "a two-column filter — the natural case for a composite index",
          },
          intro: {
            title: "Sorted by first column, then second",
            text: "Like a phone book: last name, then first. Index on (player, season) helps filters on player, or player AND season. Season alone? No help — season isn't leftmost.",
            code: "CREATE INDEX idx_player_season ON week_results(player, season);\n\n-- helped: filters on player, or player + season\n-- NOT helped: filters on season alone — season isn't the first column",
          },
          film: [
            {
              title: "Leftmost-first is the rule",
              text: "Index on (player, season) helps player alone, or player + season. Season alone can't use it — same as hunting first names in a last-name phone book.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "CREATE INDEX idx ON week_results(player, season) exists. A query filters WHERE season = 2024 only — no player condition. Does the index help?",
              options: [
                "Yes, column order doesn't matter",
                "No — season isn't the leftmost column, so this index can't be used for a season-only filter",
                "Yes, but only for 2024 specifically",
                "It depends on how many rows match",
              ],
              answer: 1,
              explain: "Leftmost-first: sorted by player first — skip player and you can't use it.",
            },
            {
              type: "mc",
              prompt:
                "Same index, idx ON week_results(player, season). A query filters WHERE player = 'Josh Allen' AND season = 2024. Does the index help?",
              options: [
                "No, composite indexes never help multi-column filters",
                "Yes — it matches both the leftmost column and the one after it, in order",
                "Only if season were listed first",
                "Only for one season at a time",
              ],
              answer: 1,
              explain: "Ideal case: both filtered columns, in the same order the index was built.",
            },
            {
              type: "fill",
              prompt: "Build a composite index on player, then season, in that order.",
              parts: ["CREATE INDEX idx_player_season ON week_results(", null, ", ", null, ");"],
              bank: ["player", "season"],
              answer: ["player", "season"],
              explain: "Order in the parentheses is the sort order — player first helps player-only and player+season.",
            },
            {
              type: "mc",
              prompt:
                "What's the phone-book analogy for a composite index on (last_name, first_name)?",
              options: [
                "It's sorted by first name, then last name",
                "It's sorted by last name first, then first name within each last name — great for finding a last name, useless for a first name alone",
                "It has no particular order",
                "It only stores last names",
              ],
              answer: 1,
              explain: "Same leftmost-first idea — the analogy matches how the index is sorted.",
            },
          ],
        },
      ],
    },
    ...SQL_FOUNDATION_UNITS,
    ...SQL_NEXT_UNITS,
    ...SQL_MORE_UNITS,
    ...FINAL_UNITS,
  ] as Unit[],
};

export const XP_PER_EXERCISE = 10;
export const XP_RETRY = 5;
export const PERFECT_BONUS = 20;

/**
 * Modules let a learner take one skill on its own instead of the whole
 * roadmap — "just teach me Python" is a completely legitimate reason to show
 * up. ALL_MODULE is the combined pathway and stays the default.
 *
 * Progress (`completedLessons`) is global on purpose: a lesson you finished
 * inside the SQL module still counts when you switch to the all-in-one view.
 */
export type Module = {
  id: string;
  name: string;
  blurb: string;
  unitIds: string[];
};

export const ALL_MODULE = "all";

export const MODULES: Module[] = [
  {
    id: ALL_MODULE,
    name: "All-in-one pathway",
    blurb:
      "Every skill in order, the way a career-changer should take it: SQL, Python, statistics, charts, Git, R.",
    unitIds: [
      ...FOUNDATIONS_UNIT_IDS,
      ...ANALYTICS_UNIT_IDS,
      "u15", "u16", "u17", "u18", "u26",
      "u7", "u13", "u14", "u25",
      "u8", "u27", "u9", "u28", "u10", "u29", "u11", "u30",
    ],
  },
  {
    // Everything currently built. Matches Analyst Builder's "Beginner" scope
    // (which runs through JOINs and window-function basics) — their Advanced
    // tier is genuinely new territory (CTEs, views, triggers, indexing), not
    // yet built, so it has no module here — see lib/courses.ts "sql-advanced".
    id: "sql-fundamentals",
    name: "SQL Fundamentals",
    blurb:
      "Sixteen modules, in order: from what a table is through JOINs, to a capstone.",
    unitIds: [...FOUNDATIONS_UNIT_IDS],
  },
  {
    // Pilot module also lives inside Foundations (module 2). This URL keeps
    // the voice review reachable on its own. See docs/SQL-REDESIGN.md.
    id: "sql-foundations",
    name: "SQL Foundations (draft)",
    blurb: "Rebuilt SQL course — pilot module while the teaching voice is reviewed.",
    unitIds: ["f2"],
  },
  {
    id: "sql-advanced",
    name: "Advanced SQL",
    blurb:
      "Twenty-five modules, in order: mental models, CTEs, window functions, then the rest of analytical SQL.",
    unitIds: [...ANALYTICS_UNIT_IDS],
  },
  {
    id: "python",
    name: "Python & pandas",
    blurb: "Variables, loops, and DataFrames — with code that really runs.",
    unitIds: ["u7", "u13", "u14", "u25"],
  },
  {
    id: "excel",
    name: "Excel",
    blurb:
      "Formulas, logic, lookups and cleaning — executed live against a real workbook.",
    unitIds: ["u15", "u16", "u17", "u18", "u26"],
  },
  {
    id: "stats",
    name: "Statistics",
    blurb: "Averages, sample size, and regression to the mean.",
    unitIds: ["u8", "u27"],
  },
  {
    id: "viz",
    name: "Visualization",
    blurb: "Chart choice, honest axes, and making a point land.",
    unitIds: ["u9", "u28"],
  },
  {
    id: "git",
    name: "Git & GitHub",
    blurb: "Commits, branches, pull requests, portfolio READMEs.",
    unitIds: ["u10", "u29"],
  },
  {
    id: "r",
    name: "R & the tidyverse",
    blurb: "dplyr and ggplot2, executed live in your browser.",
    unitIds: ["u11", "u30"],
  },
  {
    id: "ai",
    name: "AI & LLMs",
    blurb:
      "Prompts, evals, retrieval, and shipping AI features — declaring next season.",
    unitIds: ["u12"],
  },
];

export function getModule(id: string | null | undefined): Module {
  return MODULES.find((m) => m.id === id) ?? MODULES[0];
}

function shellUnit(id: string): Unit | undefined {
  const shell = SQL_SHELLS[id];
  if (!shell) return undefined;
  return {
    id,
    number: 0,
    title: shell.title,
    drive: "Up next",
    description: shell.description,
    skills: shell.skills,
    status: "coming-soon",
    lessons: [],
  };
}

/** Units belonging to a module, in course order (includes coming-soon ones). */
export function moduleUnits(moduleId: string): Unit[] {
  const mod = getModule(moduleId);
  const byId = new Map((COURSE.units as Unit[]).map((u) => [u.id, u]));
  // Order by the module's unitIds, NOT by position in COURSE.units. A course
  // whose units were added later (Python's u13/u14) would otherwise appear at
  // the very end of the all-in-one pathway instead of next to its first unit.
  // Shell ids in lib/sql-outline.ts become empty coming-soon units.
  return mod.unitIds
    .map((id) => byId.get(id) ?? shellUnit(id))
    .filter((u): u is Unit => Boolean(u));
}

export function liveLessons(
  moduleId: string = ALL_MODULE,
): { lesson: Lesson; unit: Unit }[] {
  return moduleUnits(moduleId)
    .filter((u) => u.status === "live")
    .flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, unit })));
}

/**
 * Every live lesson in the course, regardless of module membership.
 *
 * liveLessons() walks a module's unitIds, so a unit that belongs to no module
 * — or only to one outside the all-in-one pathway, like the Foundations
 * redesign pilot — is invisible to it. Lesson URLs and static params have to
 * span the whole course instead, or those lessons 404.
 */
export function allLiveLessons(): { lesson: Lesson; unit: Unit }[] {
  return (COURSE.units as Unit[])
    .filter((unit) => unit.status === "live")
    .flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, unit })));
}

export function getLesson(
  id: string,
): { lesson: Lesson; unit: Unit } | undefined {
  // Always resolves against the full course — a lesson URL must work no
  // matter which module the learner currently has selected.
  return allLiveLessons().find((entry) => entry.lesson.id === id);
}

export function nextLessonId(
  id: string,
  moduleId: string = ALL_MODULE,
): string | null {
  const all = liveLessons(moduleId);
  const idx = all.findIndex((entry) => entry.lesson.id === id);
  if (idx === -1 || idx === all.length - 1) return null;
  return all[idx + 1].lesson.id;
}
