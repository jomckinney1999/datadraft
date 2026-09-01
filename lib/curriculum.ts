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

export type MCExercise = {
  type: "mc";
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
  // Pure-recall concept checks Gunslinger mode skips (the concept still
  // appears in drill feedback). Never tag load-bearing gotcha questions.
  drillSkip?: boolean;
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
 * The grounding step, shown to EVERY playbook style before the first drill —
 * including Gunslingers, who previously landed cold on questions like "one row
 * in week_results represents…" without ever having been told what a row is or
 * shown the table.
 *
 * `goal` is what you'll be able to do; `setup` is the minimum context needed to
 * attempt drill #1. `previewSql` (SQL units only) runs live against the seeded
 * database so the learner literally sees the rows before being asked about
 * them — reading real data is the whole point of the lesson.
 */
export type LessonBrief = {
  goal: string;
  setup: string;
  previewSql?: string;
  /** Excel units: which workbook tab to show in the brief. Same job as previewSql. */
  previewSheet?: string;
  previewCaption?: string;
};

export type Lesson = {
  id: string;
  title: string;
  blurb: string;
  /** Grounding step every style sees before drilling. See LessonBrief. */
  brief: LessonBrief;
  intro: TheoryCard;
  // Bonus film-study cards shown only in Film Room General mode.
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
  title: "Analyst Fundamentals: Rookie Season",
  tagline:
    "The full rookie roadmap: SQL first, then Python, statistics, visualization, Git, and R — every skill on a data analyst job posting, taught one short drive at a time.",
  units: [
    {
      id: "u1",
      number: 1,
      title: "Kickoff — Reading the Stat Sheet",
      drive: "1st Drive · Own 20",
      description:
        "What a database actually is, and how to pull data out of it with SELECT. By the end you can open any stat sheet and grab exactly the columns you want.",
      skills: ["SELECT", "FROM", "LIMIT"],
      status: "live",
      lessons: [
        {
          id: "u1-l1",
          title: "Meet the Stat Sheet",
          blurb: "Tables, rows, columns — and your first SELECT *.",
          brief: {
            goal: "Read any table in the database with SELECT.",
            setup:
              "A database is a set of tables. A table is a grid: each column is a stat category, each row is one entry. Our league has three — week_results, rosters, and waiver_wire. Before we ask you anything about it, look at what one row of week_results actually holds.",
            previewSql: "SELECT * FROM week_results LIMIT 5;",
            previewCaption: "week_results · first 5 rows",
          },
          intro: {
            title: "Databases are stat sheets",
            text: "A database is a set of tables. Each table is a grid: columns are the stat categories, rows are the entries. Our league has three tables — week_results (one row per player per week), rosters, and waiver_wire. SELECT * FROM a table reads the whole sheet.",
            code: "SELECT * FROM week_results;",
          },
          film: [
            {
              title: "Anatomy of a query",
              text: "Every query you'll ever write has the same skeleton: SELECT (what columns), FROM (which table), and a semicolon to end the statement. Everything else — filtering, sorting, grouping — bolts onto that frame. Keywords are conventionally UPPERCASE, but SQL doesn't care; readability does.",
              code: "SELECT *          -- what to bring back\nFROM week_results -- which stat sheet\n;                 -- end of play",
            },
            {
              title: "Scout all three stat sheets",
              text: "week_results: one row per player per week per season — the game log. rosters: one row per (fantasy team, player) — who owns whom. waiver_wire: one row per free agent with roster percentage and trend. Knowing each table's grain — what one row means — is the first question every pro analyst asks.",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "Our league database has three tables. Which one holds one row per player, per week, per season — the weekly scoring log?",
              options: ["week_results", "rosters", "waiver_wire", "playbook"],
              answer: 0,
              drillSkip: true,
              explain:
                "week_results is the weekly scoring log. rosters maps players to fantasy teams, and waiver_wire tracks free agents. There's no playbook table — yet.",
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
                "Analysts call this the grain of the table: week_results is one row per player-week. Knowing the grain is the first thing a pro checks.",
            },
            {
              type: "fill",
              prompt:
                "Call the play: grab every column and every row from the weekly stat sheet.",
              parts: ["SELECT ", null, " FROM ", null, ";"],
              bank: ["*", "week_results", "everything", "rosters"],
              answer: ["*", "week_results"],
              explain:
                "The * means “every column.” SELECT * FROM week_results returns the entire table.",
            },
            {
              type: "query",
              prompt:
                "Your first snap: pull the entire waiver wire — every column, every row.",
              starter: "SELECT ",
              expected: "SELECT * FROM waiver_wire;",
              orderMatters: false,
              hint: "SELECT * FROM table_name; — the table is called waiver_wire.",
              explain:
                "SELECT * FROM waiver_wire; reads the whole free-agent board. Five rows — a quick scouting read.",
            },
            {
              type: "query",
              prompt:
                "Now the roster sheet: pull every column and every row from rosters.",
              starter: "SELECT ",
              expected: "SELECT * FROM rosters;",
              orderMatters: false,
              hint: "Same shape as the last one — SELECT * FROM rosters;",
              explain:
                "Three tables, one pattern. Once SELECT * FROM <table> is muscle memory, every other clause bolts onto it.",
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
              drillSkip: true,
              explain:
                "SELECT * with no other clauses returns the full table: all columns, all rows.",
            },
          ],
        },
        {
          id: "u1-l2",
          title: "Calling Specific Routes",
          blurb: "Select only the columns you need.",
          brief: {
            goal: "Pull only the columns you actually need.",
            setup:
              "SELECT * gives you everything, which is noisy once a table gets wide. Naming columns instead gives you a clean, readable answer. Here's the difference — same rows, fewer columns.",
            previewSql: "SELECT player, position, fantasy_pts FROM week_results LIMIT 5;",
            previewCaption: "three columns instead of six",
          },
          intro: {
            title: "Don't audible to SELECT * every play",
            text: "A good coordinator calls specific routes. List column names after SELECT, separated by commas, and you get only those columns — in the order you asked for them.",
            code: "SELECT player, team FROM week_results;",
          },
          film: [
            {
              title: "Column order is your call",
              text: "Columns come back in exactly the order you list them — the table's own order doesn't matter. And with AS you can rename any column on the way out, which is how analysts make results readable for coaches who don't speak database.",
              code: "SELECT player AS name, fantasy_pts AS points\nFROM week_results;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You only want each player's name and team from week_results. Which play call?",
              options: [
                "SELECT player, team FROM week_results;",
                "SELECT * FROM week_results;",
                "SELECT player team FROM week_results;",
                "SELECT FROM week_results player, team;",
              ],
              answer: 0,
              drillSkip: true,
              explain:
                "Name the columns right after SELECT, separated by commas. Without the comma, SQL thinks `team` is a nickname (alias) for `player`.",
            },
            {
              type: "fill",
              prompt:
                "Run two routes: the player's name and how widely they're rostered.",
              parts: ["SELECT ", null, ", ", null, " FROM waiver_wire;"],
              bank: ["player", "pct_rostered", "rosters", "*"],
              answer: ["player", "pct_rostered"],
              explain:
                "Columns are listed by name, comma-separated. pct_rostered is the percent of leagues where the player is taken.",
            },
            {
              type: "query",
              prompt:
                "Scout the free agents: pull just player and position from waiver_wire.",
              starter: "SELECT ",
              expected: "SELECT player, position FROM waiver_wire;",
              orderMatters: false,
              hint: "Two column names after SELECT, separated by a comma.",
              explain:
                "Selecting only the columns you need keeps results readable — and on real databases, fast.",
            },
            {
              type: "mc",
              prompt: "What separates column names in a SELECT list?",
              options: ["A comma", "The word AND", "A semicolon", "Just spaces"],
              answer: 0,
              drillSkip: true,
              explain:
                "Commas separate columns. AND belongs to filtering (next unit), and the semicolon ends the whole statement.",
            },
            {
              type: "query",
              prompt:
                "Print the league's depth chart: team_name and player from the rosters table.",
              starter: "SELECT ",
              expected: "SELECT team_name, player FROM rosters;",
              orderMatters: false,
              hint: "The table is rosters; the columns are team_name and player.",
              explain:
                "Ten rows: five players on Your Team, five on Kupp's Krew. You'll join this to the scoring log in a later unit.",
            },
          ],
        },
        {
          id: "u1-l3",
          title: "Clock Management",
          blurb: "LIMIT: take a quick look without the whole game tape.",
          brief: {
            goal: "Cap how many rows come back with LIMIT.",
            setup:
              "Real tables have millions of rows. LIMIT takes a quick look without pulling the whole game tape — it's the first thing analysts type when they meet a new table. This returns exactly 3 rows.",
            previewSql: "SELECT player, week, fantasy_pts FROM week_results LIMIT 3;",
            previewCaption: "LIMIT 3 · a quick peek",
          },
          intro: {
            title: "Take a knee with LIMIT",
            text: "week_results has over 2,000 rows. When you just want a feel for the data, add LIMIT n at the very end of the query to cap how many rows come back.",
            code: "SELECT * FROM week_results LIMIT 10;",
          },
          film: [
            {
              title: "Why analysts LIMIT everything",
              text: "First move on any unfamiliar table: SELECT * ... LIMIT 10. It's a free peek at the columns and typical values before you commit to a real question. On production databases with millions of rows it's also what keeps your quick look from becoming an expensive full-table scan.",
              code: "-- the analyst's opening move on any new table\nSELECT * FROM rosters LIMIT 10;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "week_results has 876 rows. You want a quick 10-row peek. Which clause caps the rows returned?",
              options: ["LIMIT", "CAP", "WHERE", "ORDER BY"],
              answer: 0,
              drillSkip: true,
              explain:
                "LIMIT n returns at most n rows. WHERE filters by condition and ORDER BY sorts — both coming soon.",
            },
            {
              type: "fill",
              prompt: "Take a knee after 10 rows.",
              parts: ["SELECT * FROM week_results ", null, " ", null, ";"],
              bank: ["LIMIT", "10", "CAP", "TEN"],
              answer: ["LIMIT", "10"],
              explain: "LIMIT 10 — the keyword, then the row count as a number.",
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
                "LIMIT goes after the FROM (and any other clauses). It's always the last call in the huddle.",
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
                "LIMIT is always last. SQL clauses have a fixed order — like a snap count.",
            },
            {
              type: "query",
              prompt: "Show the first 3 rows of rosters — every column.",
              starter: "SELECT ",
              expected: "SELECT * FROM rosters LIMIT 3;",
              orderMatters: true,
              hint: "SELECT * plus LIMIT 3.",
              explain:
                "Heads up for later: without ORDER BY, “first 3” just means whatever the database reaches first — not the best 3.",
            },
          ],
        },
      ],
    },
    {
      id: "u2",
      number: 2,
      title: "Field Position — Filtering with WHERE",
      drive: "2nd Drive · Own 40",
      description:
        "Most questions are about some of the data: one player, one season, big games only. WHERE keeps the rows that match your conditions and cuts the rest.",
      skills: ["WHERE", "= > <", "AND / OR", "IN", "BETWEEN"],
      status: "live",
      lessons: [
        {
          id: "u2-l1",
          title: "Scouting One Player",
          blurb: "WHERE + equality. Text wears quotes.",
          brief: {
            goal: "Filter to the rows you care about with WHERE.",
            setup:
              "WHERE keeps only rows that pass a test. Text values go in single quotes; numbers don't. Here's every row for one player — the same table you've been reading, narrowed to one name.",
            previewSql: "SELECT player, week, fantasy_pts FROM week_results WHERE player = 'Josh Allen' LIMIT 5;",
            previewCaption: "WHERE player = 'Josh Allen'",
          },
          intro: {
            title: "WHERE cuts the roster",
            text: "WHERE goes after FROM and keeps only rows matching a condition. Text values must be wrapped in single quotes — 'Josh Allen', 'KC' — while numbers go bare.",
            code: "SELECT * FROM week_results\nWHERE player = 'Josh Allen';",
          },
          film: [
            {
              title: "Text wears quotes, numbers don't",
              text: "WHERE player = 'Josh Allen' works; WHERE player = Josh Allen makes SQL hunt for a column named Josh. Numbers go bare: WHERE week = 5. One more scouting note: text matching is exact — capitalization and spelling must match the data, so 'josh allen' finds nothing.",
              code: "WHERE player = 'Josh Allen'  -- text: quoted, exact\nWHERE week = 5               -- number: bare",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "Which clause filters rows — keeping only the ones that match a condition?",
              options: ["WHERE", "LIMIT", "SELECT", "FROM"],
              answer: 0,
              drillSkip: true,
              explain:
                "WHERE is the filter. LIMIT caps row count with no opinion about which rows.",
            },
            {
              type: "fill",
              prompt:
                "Scout Josh Allen's full game log. Careful — text values wear quotes like a jersey.",
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
                "Without quotes, SQL reads Josh Allen as column names and throws an error. Text always gets single quotes.",
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
                "Unquoted MIA is treated as a column name, which doesn't exist. Quoted 'MIA' is a text value.",
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
                "49 rows — every game Mahomes played across the three seasons. One filter took you from 876 rows down to his.",
            },
            {
              type: "query",
              prompt:
                "Scout the waiver wire for running backs only — rows where position is 'RB'. All columns.",
              starter: "SELECT * FROM waiver_wire\nWHERE ",
              expected: "SELECT * FROM waiver_wire WHERE position = 'RB';",
              orderMatters: false,
              hint: "position = 'RB' — text value, single quotes.",
              explain:
                "Two backs on the wire. Same pattern works for any column: team = 'BUF', week = 1, and so on.",
            },
          ],
        },
        {
          id: "u2-l2",
          title: "Setting the Line",
          blurb: "Comparisons and AND: numbers, thresholds, combos.",
          brief: {
            goal: "Filter on numbers and combine tests with AND.",
            setup:
              "Beyond equality you get >, <, >=, <=. AND requires both sides to be true, which is how you express \"big game, this season\" in one line. Nothing in this dataset clears 30, so 25 is what a big game actually looks like here.",
            previewSql:
              "SELECT player, season, week, fantasy_pts FROM week_results WHERE fantasy_pts > 25 ORDER BY fantasy_pts DESC LIMIT 5;",
            previewCaption: "only rows scoring over 25",
          },
          intro: {
            title: "Set the over/under",
            text: "Numbers compare with > < >= <= — no quotes. Chain conditions with AND when every condition must hit.",
            code: "SELECT * FROM week_results\nWHERE season = 2024\n  AND fantasy_pts > 20;",
          },
          film: [
            {
              title: "Compound conditions and parentheses",
              text: "AND binds tighter than OR — like order of operations in math. Mixing them without parentheses is a classic bust: WHERE season = 2024 AND week = 1 OR week = 2 actually returns ALL week-2 rows from every season. Parentheses make your read explicit.",
              code: "-- what you meant:\nWHERE season = 2024 AND (week = 1 OR week = 2)",
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
              drillSkip: true,
              explain:
                "> is strictly more than. >= would also keep games at exactly 20.",
            },
            {
              type: "query",
              prompt:
                "Find the boom weeks: every column of week_results where fantasy_pts is greater than 25.",
              starter: "SELECT * FROM week_results\nWHERE ",
              expected: "SELECT * FROM week_results WHERE fantasy_pts > 25;",
              orderMatters: false,
              hint: "Numbers don't wear quotes: fantasy_pts > 25.",
              explain:
                "209 of the 876 games on file cleared 25 — roughly one in four. Numeric comparisons are how analysts define boom and bust in the first place.",
            },
            {
              type: "fill",
              prompt:
                "Two conditions, one play: the 2024 season AND more than 20 points.",
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
                "AND means both conditions must be true for a row to survive the cut.",
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
                "AND requires every condition to hit. One WHERE can chain as many conditions as you need.",
            },
            {
              type: "query",
              prompt:
                "Who showed up in the week 10 spotlight game of 2023? Pull player and fantasy_pts where season is 2023, week is 10, and fantasy_pts is at least 15.",
              starter:
                "SELECT player, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT player, fantasy_pts FROM week_results WHERE season = 2023 AND week = 10 AND fantasy_pts >= 15;",
              orderMatters: false,
              hint: "Three conditions chained with AND. “At least 15” means >= 15.",
              explain:
                "Chained ANDs read like a scouting brief: this season, this week, this threshold.",
            },
          ],
        },
        {
          id: "u2-l3",
          title: "Multiple Reads",
          blurb: "OR, IN, and BETWEEN: matching more than one option.",
          brief: {
            goal: "Match several options at once with OR, IN, and BETWEEN.",
            setup:
              "When you want any of a set of values, IN beats stacking ORs. BETWEEN covers an inclusive range. Both are shorthand for tests you could write the long way — they just read better.",
            previewSql: "SELECT player, position, fantasy_pts FROM week_results WHERE position IN ('QB','TE') LIMIT 5;",
            previewCaption: "position IN ('QB','TE')",
          },
          intro: {
            title: "Progress through your reads",
            text: "OR keeps a row if either condition hits. IN ('A','B','C') is a cleaner way to say “any of these.” BETWEEN a AND b keeps a range — both ends included.",
            code: "WHERE position IN ('QB', 'TE')\n  AND week BETWEEN 1 AND 4",
          },
          film: [
            {
              title: "Choosing your read: OR vs IN vs BETWEEN",
              text: "All three keep rows matching “any of these,” but each has a natural down-and-distance: OR for two unrelated conditions, IN for a list of values in one column, BETWEEN for a continuous range. They compile to the same result — pick the one that reads like the question you were asked.",
              code: "WHERE team = 'KC' OR fantasy_pts > 25   -- unrelated\nWHERE team IN ('KC', 'BUF', 'MIA')      -- value list\nWHERE week BETWEEN 5 AND 9              -- range",
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
                "OR means either side counts. AND would demand a player be on both teams at once — zero rows, guaranteed.",
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
                "IN ('RB', 'WR') matches either value — and each text value still wears its quotes.",
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
              drillSkip: true,
              explain:
                "BETWEEN is inclusive on both ends. It's shorthand for week >= 1 AND week <= 4.",
            },
            {
              type: "query",
              prompt:
                "Scout Derrick Henry's September stretch: every column of his week_results rows for weeks 1 through 4, any season.",
              starter: "SELECT * FROM week_results\nWHERE ",
              expected:
                "SELECT * FROM week_results WHERE player = 'Derrick Henry' AND week BETWEEN 1 AND 4;",
              orderMatters: false,
              hint: "Two conditions: player = '…' AND week BETWEEN 1 AND 4.",
              explain:
                "BETWEEN handles the range; AND ties it to the player. You can mix all these tools freely in one WHERE.",
            },
            {
              type: "query",
              prompt:
                "Opening-day pass catchers: player, team, and fantasy_pts for positions 'QB' and 'TE' in week 1 of season 2022.",
              starter:
                "SELECT player, team, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT player, team, fantasy_pts FROM week_results WHERE position IN ('QB', 'TE') AND season = 2022 AND week = 1;",
              orderMatters: false,
              hint: "position IN ('QB', 'TE'), plus season and week conditions with AND.",
              explain:
                "IN plus AND is the everyday workhorse of real scouting queries.",
            },
          ],
        },
      ],
    },
    {
      id: "u3",
      number: 3,
      title: "Game Plan — Sorting the Board",
      drive: "3rd Drive · Midfield",
      description:
        "Ranking is the analyst's bread and butter. ORDER BY sorts your results; combined with LIMIT it answers every “top N” question on the board.",
      skills: ["ORDER BY", "DESC / ASC", "Top-N"],
      status: "live",
      lessons: [
        {
          id: "u3-l1",
          title: "Ranking the Board",
          blurb: "ORDER BY, ascending and descending.",
          brief: {
            goal: "Put rows in a deliberate order with ORDER BY.",
            setup:
              "Without ORDER BY, row order is not guaranteed — it just happens to look stable. ORDER BY makes it explicit: ASC is smallest-first (the default), DESC is largest-first. Here's the top of the board.",
            previewSql: "SELECT player, week, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC LIMIT 5;",
            previewCaption: "highest scoring weeks first",
          },
          intro: {
            title: "Sort the draft board",
            text: "ORDER BY column sorts your results — smallest first by default (ASC). Add DESC for biggest first. It goes after WHERE, before LIMIT.",
            code: "SELECT player, fantasy_pts\nFROM week_results\nORDER BY fantasy_pts DESC;",
          },
          film: [
            {
              title: "Sorting text, numbers, and ties",
              text: "Numbers sort numerically, text sorts alphabetically — and you can stack sort keys: the second key only kicks in when the first one ties. ORDER BY team, fantasy_pts DESC gives you an alphabetical team list with each team's best games first. Deterministic order is what separates a real report from a lucky screenshot.",
              code: "ORDER BY team, fantasy_pts DESC\n--       ↑ first    ↑ tiebreak within team",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which clause sorts your results?",
              options: ["ORDER BY", "SORT BY", "GROUP BY", "RANK"],
              answer: 0,
              drillSkip: true,
              explain:
                "ORDER BY is the sorter. GROUP BY (next unit) squashes rows — different job entirely.",
            },
            {
              type: "mc",
              prompt:
                "You want the biggest scores at the top. Which direction keyword?",
              options: ["DESC", "ASC", "TOP", "DOWN"],
              answer: 0,
              drillSkip: true,
              explain:
                "DESC = descending, biggest first. ASC (the default) is smallest first.",
            },
            {
              type: "fill",
              prompt:
                "Build the week 1 draft board for 2024 — best performance at the top.",
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
                "ORDER BY fantasy_pts DESC puts the monster games on top of the board.",
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
                "Now the board reads like a waiver priority list. Sorting turns raw rows into a decision.",
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
                "Lowest rostered percentage first — that's where the genuinely unclaimed players are.",
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
                "ASC is the silent default. If you want biggest-first you must say DESC.",
            },
          ],
        },
        {
          id: "u3-l2",
          title: "Top Plays",
          blurb: "ORDER BY + LIMIT: every top-N question, answered.",
          brief: {
            goal: "Answer any \"top N\" question with ORDER BY + LIMIT.",
            setup:
              "Sort first, then cut. That order matters: LIMIT before sorting would grab arbitrary rows and sort only those. Every \"best/worst N\" question you'll ever be asked is this pattern.",
            previewSql: "SELECT player, fantasy_pts FROM week_results ORDER BY fantasy_pts DESC LIMIT 3;",
            previewCaption: "the 3 biggest weeks in the data",
          },
          intro: {
            title: "The highlight reel formula",
            text: "“Top 5 anything” is always the same play: ORDER BY the stat DESC, then LIMIT 5. You can also sort by several columns — the second breaks ties in the first.",
            code: "ORDER BY fantasy_pts DESC, player\nLIMIT 5;",
          },
          film: [
            {
              title: "The clause pipeline never changes",
              text: "SELECT → FROM → WHERE → ORDER BY → LIMIT. That's the fixed snap count for every top-N question: filter to the population you care about, rank it, trim it. Memorize the order once and “top 5 rushers in week 10” becomes pure fill-in-the-blanks.",
              code: "SELECT player, fantasy_pts\nFROM week_results\nWHERE season = 2024 AND week = 10\nORDER BY fantasy_pts DESC\nLIMIT 5;",
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
              drillSkip: true,
              explain:
                "Sort descending so the best are first, then cut to 5. (ORDER BY always comes before LIMIT.)",
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
                "WHERE narrows to 2023, ORDER BY ranks, LIMIT trims the reel. That clause order never changes.",
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
                "The second sort key only matters when the first one ties — a clean, deterministic board.",
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
                "A classic rookie mistake: LIMIT has no idea what “best” means until ORDER BY defines it.",
            },
            {
              type: "query",
              prompt:
                "Film study on the bad games: Travis Kelce's 3 LOWEST-scoring games across all seasons. Show season, week, fantasy_pts — lowest first; break ties by season, then week.",
              starter:
                "SELECT season, week, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT season, week, fantasy_pts FROM week_results WHERE player = 'Travis Kelce' ORDER BY fantasy_pts, season, week LIMIT 3;",
              orderMatters: true,
              hint: "No DESC needed — ascending is the default. ORDER BY fantasy_pts, season, week LIMIT 3.",
              explain:
                "Ascending order finds the floor games. Analysts study the floor as hard as the ceiling.",
            },
          ],
        },
      ],
    },
    {
      id: "u4",
      number: 4,
      title: "Film Room Math — Aggregations",
      drive: "4th Drive · Red Zone",
      description:
        "Stop reading individual plays and start computing season stats: totals, averages, counts — per player, per position, per team — with GROUP BY and HAVING.",
      skills: ["COUNT / SUM / AVG", "GROUP BY", "AS", "HAVING"],
      status: "live",
      lessons: [
        {
          id: "u4-l1",
          title: "Season Totals",
          blurb: "COUNT, SUM, AVG: collapse many rows into one number.",
          brief: {
            goal: "Collapse many rows into one number with COUNT, SUM, and AVG.",
            setup:
              "Aggregates answer \"how many / how much / what's typical\" by folding a whole column into a single value. Notice this returns one row, not many — that's the shift this lesson is about.",
            previewSql: "SELECT COUNT(*) AS rows_total, ROUND(AVG(fantasy_pts), 1) AS avg_pts FROM week_results;",
            previewCaption: "the whole table, as one row",
          },
          intro: {
            title: "From game tape to box score",
            text: "Aggregate functions squash many rows into one: COUNT(*) counts rows, SUM adds a column up, AVG averages it. AS gives the result a readable name, and ROUND(x, 1) trims decimals.",
            code: "SELECT ROUND(AVG(fantasy_pts), 1) AS ppg\nFROM week_results\nWHERE player = 'Josh Allen';",
          },
          film: [
            {
              title: "The aggregate family",
              text: "Five workhorses: COUNT(*) counts rows, SUM adds, AVG means, MIN and MAX find the floor and ceiling. They all collapse many rows into one answer, and they all skip NULLs (missing values) except COUNT(*), which counts the row no matter what — a subtle difference that decides real stat lines.",
              code: "SELECT COUNT(*), SUM(fantasy_pts),\n       AVG(fantasy_pts), MIN(fantasy_pts), MAX(fantasy_pts)\nFROM week_results;",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which function counts how many rows matched?",
              options: ["COUNT(*)", "SUM(*)", "TOTAL()", "ROWS()"],
              answer: 0,
              drillSkip: true,
              explain:
                "COUNT(*) counts rows. SUM adds up values in a column — related, but a different question.",
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
              drillSkip: true,
              explain:
                "AVG is the mean — points per game if each row is a game. MAX, SUM, and COUNT answer the others.",
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
                "SUM adds every one of his weekly scores into a single career total. AS total_pts names the output column.",
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
                "37 games — not the 50 you might expect from three seasons. McCaffrey played 17, then 16, then just 4 in 2024 before injury ended his year. Real data has those gaps in it, and COUNT(*) is how you find them.",
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
                "12.8 a game. AVG computes the mean of his 17 games in 2024; ROUND keeps it to one decimal, box-score style.",
            },
          ],
        },
        {
          id: "u4-l2",
          title: "Splitting the Film by Player",
          blurb: "GROUP BY: one aggregate row per player, position, or team.",
          brief: {
            goal: "Get one aggregate row per player, position, or team with GROUP BY.",
            setup:
              "GROUP BY splits rows into buckets and runs the aggregate inside each one. Instead of one number for the table, you get one number per group — which is what almost every real report is.",
            previewSql: "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results GROUP BY player ORDER BY total DESC LIMIT 5;",
            previewCaption: "one row per player",
          },
          intro: {
            title: "One row per player",
            text: "GROUP BY splits the table into buckets — one per distinct value — then aggregates run inside each bucket. SELECT the grouping column plus your aggregates and you've built a leaderboard.",
            code: "SELECT player, SUM(fantasy_pts) AS total\nFROM week_results\nGROUP BY player;",
          },
          film: [
            {
              title: "Grain — the question that prevents wrong answers",
              text: "GROUP BY changes the grain of your result: week_results is one row per player-week, but GROUP BY player makes it one row per player. Rule of thumb the pros live by: every column in your SELECT should either be in the GROUP BY or wrapped in an aggregate. Anything else is asking the database to guess.",
              code: "SELECT player, team, SUM(fantasy_pts)  -- team: in neither!\nFROM week_results\nGROUP BY player  -- ⚠ works in SQLite, lies in interviews",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "You want ONE row per player, each showing that player's total points. Which clause creates the per-player split?",
              options: ["GROUP BY", "ORDER BY", "SPLIT BY", "WHERE"],
              answer: 0,
              drillSkip: true,
              explain:
                "GROUP BY player makes a bucket per player; SUM then runs once per bucket.",
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
                "SUM inside, GROUP BY outside — the pattern behind every leaderboard you've ever seen.",
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
                "WHERE trims to 2024 first, then GROUP BY splits by position. Clause order: WHERE before GROUP BY, always.",
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
                "GROUP BY changes the grain of your result: from one row per player-week to one row per player.",
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
                "That's a real analyst query: filter, group, rank, trim. You just built the season MVP board.",
            },
          ],
        },
        {
          id: "u4-l3",
          title: "The Cut Line",
          blurb: "HAVING: filter the aggregated groups themselves.",
          brief: {
            goal: "Filter the groups themselves with HAVING.",
            setup:
              "WHERE filters rows before grouping; HAVING filters the groups after. That's the whole distinction, and it's the one interviewers ask about. Here it keeps only the high-volume players.",
            previewSql: "SELECT player, COUNT(*) AS games FROM week_results GROUP BY player HAVING COUNT(*) > 30 LIMIT 5;",
            previewCaption: "only groups with more than 30 games",
          },
          intro: {
            title: "Cuts happen after the film session",
            text: "WHERE filters raw rows before grouping. HAVING filters groups after aggregation — it's how you say “only players averaging 15+.” In SQLite you can reuse your AS alias inside HAVING.",
            code: "SELECT player, AVG(fantasy_pts) AS ppg\nFROM week_results\nGROUP BY player\nHAVING ppg >= 15;",
          },
          film: [
            {
              title: "The full order of operations",
              text: "How the database actually runs your query: FROM (get the table) → WHERE (cut rows) → GROUP BY (bucket) → aggregates compute → HAVING (cut groups) → SELECT (shape output) → ORDER BY → LIMIT. Every “why doesn't this work” in SQL traces back to this pipeline — WHERE can't see averages because averages don't exist yet when WHERE runs.",
              code: "FROM → WHERE → GROUP BY → HAVING\n     → SELECT → ORDER BY → LIMIT",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt:
                "WHERE filters rows before grouping. What filters the groups AFTER aggregation?",
              options: ["HAVING", "WHERE, again", "LIMIT", "FILTER BY"],
              answer: 0,
              drillSkip: true,
              explain:
                "HAVING is WHERE's post-aggregation counterpart. It sees totals and averages; WHERE never does.",
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
                "HAVING ppg >= 15 makes the cut using the aggregate itself — something WHERE can't see.",
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
                "Order of operations: WHERE cuts rows first, then GROUP BY buckets, then aggregates compute, then HAVING cuts groups.",
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
                "WHERE picked the season, GROUP BY built the totals, HAVING made the cut. Elite club.",
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
                "Every clause you've learned, one play: WHERE, GROUP BY, HAVING, ORDER BY. That's the full fundamental stack — drive complete.",
            },
          ],
        },
      ],
    },
    {
      id: "u5",
      number: 5,
      title: "Trade Desk — JOINs",
      drive: "5th Drive · Midfield",
      description:
        "Combine tables: match rosters to week_results and score entire fantasy matchups. The relational thinking phase of the curriculum.",
      skills: ["JOIN", "ON", "LEFT JOIN", "Anti-joins"],
      status: "live",
      lessons: [
        {
          id: "u5-l1",
          title: "Two Sheets, One Question",
          blurb: "INNER JOIN: connect the roster to the game log.",
          brief: {
            goal: "Answer a question that needs two tables at once.",
            setup:
              "week_results knows who scored what. rosters knows who owns whom. Neither can tell you how your fantasy team did — that needs both, stitched together on the column they share. Here's the roster you'll be joining to.",
            previewSql: "SELECT * FROM rosters;",
            previewCaption: "rosters · 10 rows, two fantasy teams",
          },
          intro: {
            title: "A join matches rows across tables",
            text: "JOIN takes two tables and pairs up rows that agree on something. The ON clause says what has to match — here it's the player name, which appears in both tables. Every matched pair becomes one wide row containing columns from both sides.",
            code: "SELECT rosters.team_name, week_results.player, week_results.fantasy_pts\nFROM rosters\nJOIN week_results ON rosters.player = week_results.player;",
          },
          film: [
            {
              title: "The shared column is the hinge",
              text: "A join is only possible when the two tables have a value in common — here, the player's name. In a production database that link is usually an id rather than a name, precisely because names are messy: two players can share one, and spelling drifts between sources. The idea is identical either way.",
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
              drillSkip: true,
              explain:
                "week_results is every player in the league. Which of them are yours is a fact that only exists in rosters, so the question needs both tables.",
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
                "JOIN names the second table, ON states the matching rule. Swap ON for WHERE here and SQL won't know how to pair the rows.",
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
                "Nine rows — not ten. Ten players are rostered, so one is missing. That's the whole point of the next lesson.",
            },
            {
              type: "mc",
              prompt:
                "Ten players are on rosters, but that query returned nine rows for week 1. What's the most likely reason?",
              options: [
                "The join is broken",
                "Two rostered players have no row that week — both were injured",
                "SQL caps results at nine",
                "One player was traded",
              ],
              answer: 1,
              explain:
                "A plain JOIN only keeps pairs that match. McCaffrey and Nacua were both hurt that week, so neither has a row in week_results to pair with, and both silently disappear.",
            },
          ],
        },
        {
          id: "u5-l2",
          title: "Aliases and Qualified Names",
          blurb: "Stop typing table names twice. Start reading joins fast.",
          brief: {
            goal: "Write joins that stay readable past two tables.",
            setup:
              "Spelling out week_results.fantasy_pts every time gets unbearable quickly. Aliases give each table a short name for the length of the query. Same result, a third of the typing — this is how every join you'll read in the wild is written.",
            previewSql:
              "SELECT r.team_name, w.player, w.fantasy_pts FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 AND w.week = 3 ORDER BY w.fantasy_pts DESC;",
            previewCaption: "the same join, written with aliases",
          },
          intro: {
            title: "One letter per table",
            text: "Put a short name after the table in FROM or JOIN and it becomes that table's handle everywhere else in the query: rosters r, week_results w. Then qualify every column as r.something or w.something. Qualifying isn't just tidy — when both tables have a column called player, an unqualified `player` is ambiguous and SQL will refuse to run.",
            code: "SELECT r.team_name, w.player, w.fantasy_pts\nFROM rosters r\nJOIN week_results w ON r.player = w.player;",
          },
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
                "SQL won't guess. Qualify it — r.player or w.player — and the ambiguity disappears.",
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
                "The alias goes straight after the table name. AS is allowed but almost nobody writes it for tables.",
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
                "Aliases make the filter readable at a glance: you can see instantly which table each condition is testing.",
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
                "Kupp's Krew. Worth noticing: not every question about two tables actually needs both. Reach for a join when the answer genuinely spans them.",
            },
          ],
        },
        {
          id: "u5-l3",
          title: "Keep Everyone: LEFT JOIN",
          blurb: "The players who vanished, and how to get them back.",
          brief: {
            goal: "Keep rows that have no match on the other side.",
            setup:
              "A plain JOIN silently drops anything unmatched — that's how Travis Kelce disappeared from week 1. LEFT JOIN keeps every row from the left table and fills the missing side with NULL, so absence becomes visible instead of invisible.",
            previewSql:
              "SELECT r.player, w.fantasy_pts FROM rosters r LEFT JOIN week_results w ON r.player = w.player AND w.season = 2024 AND w.week = 1 ORDER BY r.player;",
            previewCaption: "10 rows now — look at Travis Kelce",
          },
          intro: {
            title: "LEFT JOIN keeps the left side whole",
            text: "LEFT JOIN returns every row from the first table no matter what, and attaches matching columns from the second where they exist. Where they don't, you get NULL. Nothing is lost — and a NULL is information, not an error.",
            code: "SELECT r.player, w.fantasy_pts\nFROM rosters r\nLEFT JOIN week_results w\n  ON r.player = w.player AND w.week = 1;",
          },
          film: [
            {
              title: "ON versus WHERE on a LEFT JOIN",
              text: "This is the subtlest trap in joins. Conditions on the right-hand table belong in ON. Move them to WHERE and you filter out the NULL rows you just worked to keep — quietly turning your LEFT JOIN back into an INNER JOIN. If a LEFT JOIN mysteriously loses rows, this is almost always why.",
              code: "-- keeps Kelce, points NULL\n... LEFT JOIN week_results w ON r.player = w.player AND w.week = 1\n\n-- drops Kelce again\n... LEFT JOIN week_results w ON r.player = w.player WHERE w.week = 1",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What does LEFT JOIN put in the columns of an unmatched row?",
              options: ["0", "An empty string", "NULL", "It skips the row"],
              answer: 2,
              explain:
                "NULL — meaning 'no value here'. That's different from zero: Kelce didn't score 0 points, he had no game at all.",
            },
            {
              type: "mc",
              prompt:
                "You LEFT JOIN, then add `WHERE w.week = 1`. Kelce disappears again. Why?",
              options: [
                "LEFT JOIN doesn't work with WHERE",
                "His row has NULL for week, and NULL = 1 is never true, so WHERE removes him",
                "The join order is wrong",
                "week is the wrong column",
              ],
              answer: 1,
              explain:
                "The NULL row can't satisfy a WHERE test on the right-hand table. Put that condition in ON instead and he stays.",
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
                "LEFT JOIN keeps all ten, and the extra conditions ride along in ON with AND so the unmatched row survives.",
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
                "Ten rows every time, whoever missed the game. That's a report you can hand someone without it quietly lying about roster size.",
            },
          ],
        },
        {
          id: "u5-l4",
          title: "Finding What's Missing",
          blurb: "Anti-joins: the players nobody rostered.",
          brief: {
            goal: "Find rows in one table that have no counterpart in another.",
            setup:
              "Some of the most useful questions are about absence: which players is nobody starting, which customers never ordered, which games have no result yet. The pattern is always the same — LEFT JOIN, then keep only the rows where the match came back NULL.",
            previewSql:
              "SELECT DISTINCT w.player FROM week_results w LEFT JOIN rosters r ON w.player = r.player WHERE r.player IS NULL ORDER BY w.player;",
            previewCaption: "six players in the league, on nobody's roster",
          },
          intro: {
            title: "LEFT JOIN, then keep the NULLs",
            text: "An anti-join is a LEFT JOIN with `WHERE right.column IS NULL` bolted on. The LEFT JOIN keeps everything; the WHERE then throws away everything that DID match, leaving only the unmatched. It reads backwards at first and becomes second nature fast.",
            code: "SELECT DISTINCT w.player\nFROM week_results w\nLEFT JOIN rosters r ON w.player = r.player\nWHERE r.player IS NULL;",
          },
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
                "The NULL is the fingerprint of a failed match. Filtering to it is what turns 'everything' into 'only the unmatched'.",
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
              drillSkip: true,
              explain:
                "The table's grain is player-week. Without DISTINCT you'd get every one of their games, not a list of names.",
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
                "Six names — the waiver pool. This exact shape answers 'who hasn't done X' in every job you'll ever have.",
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
                "Eight of the ten rostered players aren't on the wire. Same pattern, new question — that's what makes it worth memorising.",
            },
          ],
        },
        {
          id: "u5-l5",
          title: "Score the Matchup",
          blurb: "Joins plus GROUP BY: settle it with one query.",
          brief: {
            goal: "Combine a join with aggregation to answer a real question.",
            setup:
              "Everything so far has produced rows. This produces a verdict. Join the roster to the game log, group by fantasy team, sum the points — and you have the season matchup settled in five lines.",
            previewSql:
              "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 GROUP BY r.team_name ORDER BY total DESC;",
            previewCaption: "the 2024 season, settled",
          },
          intro: {
            title: "Join first, then group",
            text: "SQL builds the joined rows first, then GROUP BY collapses them. So you can group by a column from either table and aggregate a column from the other — which is exactly what 'total points per fantasy team' needs.",
            code: "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total\nFROM rosters r\nJOIN week_results w ON r.player = w.player\nGROUP BY r.team_name;",
          },
          film: [
            {
              title: "Watch for fan-out",
              text: "If the right-hand table has several rows per match, the left row is duplicated once per match — and any SUM over left-hand columns is then inflated. Here that's fine because we're summing the right side. But if you ever join and your totals suddenly double, fan-out is the first thing to check.",
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
                "Join, then group. That's why you can group by a column from one table and aggregate one from the other.",
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
                "Kupp's Krew 1522.3 to Your Team 1047.1 — not close. One query, whole season, no spreadsheet.",
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
                "Josh Allen. Change one line — the GROUP BY — and the same query answers a different question entirely.",
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
                "Counting rows that survive a filter, grouped by team — join, filter, group, count. That's the shape of most real reports.",
            },
          ],
        },
      ],
    },
    {
      id: "u6",
      number: 6,
      title: "Two-Minute Drill — Window Functions",
      drive: "6th Drive · Red Zone",
      description:
        "Rolling averages, ranks within groups, week-over-week trends — the toolkit that separates job-ready from beginner on a SQL screen.",
      skills: ["OVER", "PARTITION BY", "RANK", "LAG", "Running totals"],
      status: "live",
      lessons: [
        {
          id: "u6-l1",
          title: "Keep the Row, Add the Context",
          blurb: "OVER(): aggregate without collapsing.",
          brief: {
            goal: "Add a summary number to every row without losing the rows.",
            setup:
              "GROUP BY answers 'what's the total' by throwing the detail away. Window functions answer 'how does this row compare to the total' and keep every row. Same aggregate maths, no collapse — notice the season average repeating beside each game.",
            previewSql:
              "SELECT player, week, fantasy_pts, ROUND(AVG(fantasy_pts) OVER (), 1) AS league_avg FROM week_results WHERE season = 2024 AND week = 1 ORDER BY fantasy_pts DESC;",
            previewCaption: "every row keeps its detail AND gets the average",
          },
          intro: {
            title: "OVER() is the whole idea",
            text: "Put OVER() after an aggregate and it stops collapsing rows. AVG(fantasy_pts) with GROUP BY gives you one row. AVG(fantasy_pts) OVER () gives you the same average printed next to every original row — so you can compare each game to it without a second query.",
            code: "SELECT player, fantasy_pts,\n       AVG(fantasy_pts) OVER () AS league_avg\nFROM week_results\nWHERE season = 2024 AND week = 1;",
          },
          film: [
            {
              title: "Window vs GROUP BY, side by side",
              text: "GROUP BY reduces: many rows in, one row out per group. A window function annotates: many rows in, the same many rows out, with an extra column. When a question is 'compare this to that' rather than 'summarise this', it's almost always a window function.",
              code: "-- 1 row\nSELECT AVG(fantasy_pts) FROM week_results;\n\n-- every row, plus the average\nSELECT player, AVG(fantasy_pts) OVER () FROM week_results;",
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
                "That's the entire concept. Everything else in this unit is a variation on it.",
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
                "Empty parentheses mean 'the window is every row in the result'. You'll narrow that window in the next lesson.",
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
                "Every row now carries the week's ceiling, so 'how far off the pace was this player' becomes simple subtraction.",
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
                "You'd have to run a second query and join it back. The window function does both jobs in one pass.",
            },
          ],
        },
        {
          id: "u6-l2",
          title: "Rank Within the Position",
          blurb: "PARTITION BY and RANK: WR1 through WR7.",
          brief: {
            goal: "Rank rows inside groups without running a query per group.",
            setup:
              "Comparing a tight end to a quarterback is meaningless — you want each player ranked against their own position. PARTITION BY splits the window into groups and restarts the calculation in each one, so the ranking begins again at 1 for every position.",
            previewSql:
              "SELECT player, position, ROUND(AVG(fantasy_pts), 1) AS ppg, RANK() OVER (PARTITION BY position ORDER BY AVG(fantasy_pts) DESC) AS pos_rank FROM week_results WHERE season = 2024 GROUP BY player, position ORDER BY position, pos_rank;",
            previewCaption: "rank restarts at 1 for QB, RB, TE and WR",
          },
          intro: {
            title: "PARTITION BY is GROUP BY for windows",
            text: "PARTITION BY splits rows into groups; ORDER BY inside OVER decides the order within each group. RANK() then numbers them, restarting at 1 in every partition. Read it as: rank these, within each position, by points, highest first.",
            code: "RANK() OVER (\n  PARTITION BY position\n  ORDER BY AVG(fantasy_pts) DESC\n) AS pos_rank",
          },
          film: [
            {
              title: "RANK, DENSE_RANK, ROW_NUMBER",
              text: "They differ only in how they treat ties. RANK leaves gaps: 1, 2, 2, 4. DENSE_RANK doesn't: 1, 2, 2, 3. ROW_NUMBER refuses to tie at all and picks arbitrarily: 1, 2, 3, 4. Choose deliberately — 'joint second' is a real answer and ROW_NUMBER will hide it from you.",
              code: "-- scores 20, 18, 18, 15\nRANK()       -> 1, 2, 2, 4\nDENSE_RANK() -> 1, 2, 2, 3\nROW_NUMBER() -> 1, 2, 3, 4",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Two players tie for second. What does RANK() give the next player?",
              options: ["3", "4", "2", "It errors"],
              answer: 1,
              explain:
                "RANK skips the gap the tie consumed: 1, 2, 2, 4. DENSE_RANK would say 3.",
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
                "It carves the rows into groups and runs the window function inside each independently — no filtering, no row loss.",
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
                "PARTITION BY makes the groups, ORDER BY decides who's first inside each one.",
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
                "Ja'Marr Chase is WR1 at 23.7 a game. Note Puka Nacua ranks 2nd on 11 games while Jefferson played 17 — RANK sorts on the average alone and says nothing about how much evidence sits behind it.",
            },
          ],
        },
        {
          id: "u6-l3",
          title: "This Week vs Last Week",
          blurb: "LAG and LEAD: reach across rows.",
          brief: {
            goal: "Compare a row to the one before or after it.",
            setup:
              "Trend questions need two rows at once, and until now every tool you have works one row at a time. LAG reaches backwards to the previous row; LEAD reaches forwards. Here's a quarterback's season with last week's score pulled onto each line.",
            previewSql:
              "SELECT week, fantasy_pts, LAG(fantasy_pts) OVER (ORDER BY week) AS prev_week FROM week_results WHERE player = 'Patrick Mahomes' AND season = 2024 ORDER BY week LIMIT 8;",
            previewCaption: "week 1 has no previous week — hence NULL",
          },
          intro: {
            title: "LAG looks back, LEAD looks forward",
            text: "LAG(column) OVER (ORDER BY something) gives you that column's value from the previous row in that order. The first row has nothing behind it, so it returns NULL. Subtract the two and you have a week-over-week change — the basis of every trend chart you'll ever build.",
            code: "SELECT week, fantasy_pts,\n       fantasy_pts - LAG(fantasy_pts) OVER (ORDER BY week) AS swing\nFROM week_results\nWHERE player = 'Josh Allen' AND season = 2024;",
          },
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
                "Nothing precedes the first row, so LAG has nothing to return. That NULL is correct, not a defect.",
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
                "The window spills across players and quietly produces nonsense. Partition by player and each one gets their own sequence.",
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
                "LAG plus an ORDER BY that defines what 'previous' means. Without the ORDER BY there's no sequence to look back along.",
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
                "Now every row carries its own comparison. Subtract the two columns and you've built a momentum metric.",
            },
          ],
        },
        {
          id: "u6-l4",
          title: "Running Totals and Rolling Form",
          blurb: "Window frames: cumulative points and a 3-game average.",
          brief: {
            goal: "Build a running total and a moving average.",
            setup:
              "A window can cover just part of its partition. Add ORDER BY and the window becomes everything up to the current row — which turns SUM into a running total for free. Watch it accumulate week by week.",
            previewSql:
              "SELECT week, fantasy_pts, ROUND(SUM(fantasy_pts) OVER (ORDER BY week), 1) AS season_to_date FROM week_results WHERE player = 'Josh Allen' AND season = 2024 ORDER BY week LIMIT 8;",
            previewCaption: "season_to_date grows every week",
          },
          intro: {
            title: "ORDER BY inside OVER creates a running window",
            text: "SUM(x) OVER () totals everything. Add ORDER BY and it totals everything from the start up to the current row instead — a running total. Add an explicit frame like ROWS BETWEEN 2 PRECEDING AND CURRENT ROW and you get a moving average over the last three rows.",
            code: "-- running total\nSUM(fantasy_pts) OVER (ORDER BY week)\n\n-- rolling 3-game average\nAVG(fantasy_pts) OVER (\n  ORDER BY week\n  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n)",
          },
          film: [
            {
              title: "Why rolling averages exist",
              text: "A single week is mostly noise; a season average is too slow to react. A rolling three-game window sits between them — recent enough to show a real change in role, smooth enough to ignore one fluke. It's the same reason analysts quote a seven-day average rather than yesterday's number.",
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
                "ORDER BY inside OVER introduces the idea of 'so far', which is exactly what a running total is.",
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
                "Three rows total. That's the frame a rolling 3-game average needs.",
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
                "The cumulative line every fantasy app draws — and you just built it in one clause.",
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
                "Early weeks average fewer rows because there aren't three yet — which is correct, and worth knowing before someone asks why week 1 looks odd.",
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
          blurb: "Variables, numbers, strings — naming things you'll reuse.",
          brief: {
            goal: "Write and run your first real Python.",
            setup:
              "Python runs live in your browser here — nothing is simulated. A variable is a name attached to a value. Numbers do math; text goes in quotes and doesn't. Getting those two confused is the most common beginner error, so we start there.",
          },
          intro: {
            title: "A variable is a jersey number",
            text: "A variable is a name you attach to a value so you can call it later. Python doesn't need you to declare a type — assign it and move on. Numbers do math, strings are text in quotes, and mixing them up is the single most common beginner error.",
            code: 'player = "Jalen Hurts"\npoints = 24.6\ngames = 3\navg = points / games',
          },
          film: [
            {
              title: "Why quotes matter",
              text: '24.6 is a number you can divide. "24.6" is a piece of text that happens to look like a number — Python will refuse to divide it. When data arrives from a CSV, everything starts as text, which is why cleaning is step one of every real analysis.',
              code: '"24.6" / 3   # TypeError\nfloat("24.6") / 3   # 8.2',
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which line stores a number Python can do math with?",
              options: [
                'points = "24.6"',
                "points = 24.6",
                "points = '24.6'",
                'points = "24.6" points',
              ],
              answer: 1,
              explain:
                "No quotes means it's a number (a float). Both quoted versions are strings — text that looks like a number but can't be divided.",
            },
            {
              type: "fill",
              prompt:
                "Store this receiver's yards, then compute yards per catch.",
              parts: ["yards = 128\ncatches = 8\nper_catch = yards ", null, " catches"],
              bank: ["/", "*", "+", "%"],
              answer: ["/"],
              explain:
                "Division. per_catch comes out to 16.0 — Python returns a float from / even when both inputs are whole numbers.",
            },
            {
              type: "mc",
              prompt: "What does this print?",
              code: 'name = "Bijan"\nname = "Saquon"\nprint(name)',
              options: ["Bijan", "Saquon", "Bijan Saquon", "An error"],
              answer: 1,
              explain:
                "Reassigning replaces the old value. The variable holds whatever you put in it last — there's no history.",
              drillSkip: true,
            },
            {
              type: "mc",
              prompt:
                "You read a stat sheet from a CSV and every value arrives as text. Which conversion gets you a number you can average?",
              options: [
                'str("18.4")',
                'float("18.4")',
                'print("18.4")',
                'len("18.4")',
              ],
              answer: 1,
              explain:
                "float() turns text into a decimal number. This is the first thing you do to almost every column in a real dataset.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "This is real Python, running in your browser. Print this player's yards per catch — 128 yards on 8 catches.",
              starter: "yards = 128\ncatches = 8\n\n# print yards per catch\n",
              expected: "print(128 / 8)",
              hint: "Divide with /, then wrap it in print(...) so the answer shows up.",
              explain:
                "16.0 — Python's / always returns a float. Your code ran for real; nothing here is simulated.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Build a one-line scouting note. Print exactly: Nacua went for 31.0",
              starter:
                'player = "Nacua"\npoints = 31.0\n\n# print: Nacua went for 31.0\n',
              expected: 'print("Nacua went for 31.0")',
              hint: 'An f-string is the tidy way: print(f"{player} went for {points}").',
              explain:
                "f-strings drop variables straight into text. This is how nearly every readable Python report line gets built.",
            },
          ],
        },
        {
          id: "u7-l2",
          title: "Lists & Loops",
          blurb: "Hold a whole roster, then do the same thing to every player.",
          brief: {
            goal: "Store a whole roster in a list and loop over it.",
            setup:
              "A list holds many values in order. A for loop runs the same code once per item. Together they're how you process a season: write the logic once, let it run over every row. Indexing starts at 0, which trips up everyone at first.",
          },
          intro: {
            title: "A list is a roster",
            text: "A list holds many values in order, written in square brackets. A for loop walks the list one item at a time and runs the same code for each. That's the whole idea behind processing a season: write the logic once, let it run over every row.",
            code: 'scores = [24.6, 18.2, 31.0]\nfor s in scores:\n    print(s)',
          },
          film: [
            {
              title: "Indexing starts at zero",
              text: "scores[0] is the first item, not the second. This trips up everyone at first and it's the source of countless off-by-one bugs. scores[-1] is a handy shortcut for the last item.",
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
                "`for X in Y:` is the standard Python loop. It reads almost like English: for each player in the roster.",
            },
            {
              type: "fill",
              prompt:
                "Add up a player's weekly scores to get their season total.",
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
                "Start the accumulator at 0, then `total += w` adds each week onto it. Starting at 1 would silently inflate every total by one point — exactly the kind of bug that survives to production.",
            },
            {
              type: "mc",
              prompt:
                "Why does starting the accumulator at 1 instead of 0 matter so much here?",
              options: [
                "It causes a crash",
                "It makes the loop run one extra time",
                "Every total comes out 1 point too high, with no error to warn you",
                "Nothing — Python corrects it",
              ],
              answer: 2,
              explain:
                "It's a silent wrong answer, not a crash. Bugs that produce plausible-but-wrong numbers are the dangerous ones — the code runs, the report ships, and nobody notices.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Loop over the weeks and print this player's season total.",
              starter:
                "weeks = [24.6, 18.2, 31.0, 12.5]\n\n# add them up, then print the total\n",
              expected: "print(24.6 + 18.2 + 31.0 + 12.5)",
              hint: "Start a variable at 0, loop with `for w in weeks:`, and use total += w. Then print(total).",
              explain:
                "86.3. A loop plus an accumulator is the shape of almost every season-long calculation you'll write.",
            },
          ],
        },
        {
          id: "u7-l3",
          title: "pandas: SQL for Python",
          blurb: "DataFrames, filtering, and groupby — the same moves you know.",
          brief: {
            goal: "Use pandas to do in Python what you already do in SQL.",
            setup:
              "pandas gives Python a table type called a DataFrame. Every SQL verb has a twin: WHERE is a filter, GROUP BY is .groupby(), ORDER BY is .sort_values(). You already know the concepts — this is the spelling.",
          },
          intro: {
            title: "A DataFrame is a table",
            text: "pandas gives Python a table type called a DataFrame. If you know SQL, you already know pandas — every verb has a twin. WHERE becomes a boolean filter, GROUP BY becomes .groupby(), ORDER BY becomes .sort_values(). Same thinking, different syntax.",
            code: 'import pandas as pd\ndf = pd.read_csv("week_results.csv")\ndf[df["position"] == "RB"]',
          },
          film: [
            {
              title: "The translation table",
              text: "Keep this mapping in your head and pandas stops feeling foreign. The concepts transfer intact; only the punctuation changes.",
              code: "SELECT cols   →  df[[\"a\", \"b\"]]\nWHERE ...     →  df[df[\"pts\"] > 20]\nGROUP BY x    →  df.groupby(\"x\")\nORDER BY x    →  df.sort_values(\"x\")\nLIMIT 5       →  df.head(5)",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "Which pandas expression is the twin of WHERE points > 20?",
              options: [
                'df.groupby("points")',
                'df[df["points"] > 20]',
                'df.sort_values("points")',
                'df.head(20)',
              ],
              answer: 1,
              explain:
                "Filtering rows in pandas means indexing the DataFrame with a condition. The inner part builds True/False per row; the outer part keeps the Trues.",
            },
            {
              type: "fill",
              prompt:
                "Get each position's average points — the pandas version of GROUP BY.",
              parts: ["df.", null, '("position")["points"].', null, "()"],
              bank: ["groupby", "sort_values", "mean", "count"],
              answer: ["groupby", "mean"],
              explain:
                "groupby splits rows into buckets, then .mean() aggregates each bucket — exactly GROUP BY position with AVG(points).",
            },
            {
              type: "mc",
              prompt:
                "You want the 5 highest-scoring weeks. Which chain does it?",
              options: [
                'df.head(5).sort_values("points", ascending=False)',
                'df.sort_values("points", ascending=False).head(5)',
                'df.groupby("points").head(5)',
                'df["points"].head(5)',
              ],
              answer: 1,
              explain:
                "Sort first, then take the top 5. The other order grabs an arbitrary 5 rows and sorts only those — a classic mistake that produces a confident wrong answer.",
            },
            {
              type: "mc",
              prompt:
                "In SQL you'd write ORDER BY. What's the pandas equivalent?",
              options: [".order()", ".sort_values()", ".arrange()", ".rank()"],
              answer: 1,
              explain:
                ".sort_values() is pandas' ORDER BY. (.arrange() is R's — you'll meet it in the R unit.)",
              drillSkip: true,
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "Real pandas, running live. Print the names of every player who scored more than 20 — highest scorer first.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "player": ["Hurts", "Bijan", "Nacua", "Kelce"],\n    "points": [24.6, 18.2, 31.0, 22.4],\n})\n\n# filter to > 20, sort high to low, print the player column as a list\n',
              expected:
                'import pandas as pd\ndf = pd.DataFrame({"player":["Hurts","Bijan","Nacua","Kelce"],"points":[24.6,18.2,31.0,22.4]})\nprint(df[df["points"] > 20].sort_values("points", ascending=False)["player"].tolist())',
              hint: 'Filter with df[df["points"] > 20], then .sort_values("points", ascending=False), then ["player"].tolist() inside print().',
              explain:
                "['Nacua', 'Hurts', 'Kelce'] — filter, then sort, then select. That's WHERE + ORDER BY + SELECT, in pandas.",
            },
            {
              type: "code",
              lang: "python",
              prompt:
                "GROUP BY, in pandas. Print each position's mean points.",
              starter:
                'import pandas as pd\n\ndf = pd.DataFrame({\n    "position": ["RB", "WR", "RB", "WR"],\n    "points": [18.2, 31.0, 12.4, 22.4],\n})\n\n# print the mean points per position\n',
              expected:
                'import pandas as pd\ndf = pd.DataFrame({"position":["RB","WR","RB","WR"],"points":[18.2,31.0,12.4,22.4]})\nprint(df.groupby("position")["points"].mean())',
              hint: 'df.groupby("position")["points"].mean() — then wrap it in print().',
              explain:
                "RB 15.3, WR 26.7. groupby + an aggregate is GROUP BY + AVG, and it's the single most-used move in analyst Python.",
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
          blurb: "Mean, median, and when each one misleads you.",
          brief: {
            goal: "Know when the mean misleads and the median doesn't.",
            setup:
              "The mean adds everything and divides; one huge outlier drags it. The median is the middle value and barely moves. When they disagree, that gap is itself the finding — and reporting only the mean is how people recommend the wrong player.",
          },
          intro: {
            title: "One huge week breaks the mean",
            text: "The mean adds everything and divides by the count, so a single outlier drags it. The median is the middle value once sorted, so outliers barely move it. When a distribution is skewed, reporting only the mean is how you end up recommending the wrong player.",
            code: "weeks = [4, 5, 6, 7, 48]\nmean   = 14.0   ← nobody scored near this\nmedian = 6.0    ← the typical week",
          },
          film: [
            {
              title: "Which one should I report?",
              text: "Rule of thumb: if the mean and median are far apart, the distribution is skewed and the median describes the typical case better. Report both when they disagree — the gap between them is itself the finding.",
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
                "Four of five weeks were between 4 and 7. The median (6) describes them; the mean (14) describes nobody — it's one blowup pulling the number up.",
            },
            {
              type: "mc",
              prompt:
                "The mean and median of a stat are nearly identical. What does that suggest?",
              options: [
                "The data is skewed",
                "There's a huge outlier",
                "The distribution is roughly symmetric",
                "The sample is too small",
              ],
              answer: 2,
              explain:
                "When mean ≈ median, no extreme values are pulling the average around — the distribution is roughly balanced.",
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
                "Always compute both on a new dataset. The distance between them tells you instantly whether outliers are in play.",
            },
            {
              type: "mc",
              prompt:
                "A manager asks for 'the average fantasy score' of a boom-or-bust player. What's the most useful answer?",
              options: [
                "Just the mean — it's what they asked for",
                "Just the median — it's more accurate",
                "Both, plus a note that the player is inconsistent",
                "Refuse until they specify",
              ],
              answer: 2,
              explain:
                "The inconsistency IS the answer they need. Giving both numbers and naming the spread is what separates an analyst from a calculator.",
            },
          ],
        },
        {
          id: "u8-l2",
          title: "Small Samples Lie Louder",
          blurb: "Why three great games proves almost nothing.",
          brief: {
            goal: "Judge whether a result has enough data behind it to trust.",
            setup:
              "Any small sample can look extreme by luck. Three-for-three isn't elite hands, it's Tuesday. The fix is a habit, not a formula: always ask for the denominator before you believe a rate.",
          },
          intro: {
            title: "Noise shrinks as n grows",
            text: "Any small sample can look extreme by chance. Flip a fair coin three times and all-heads happens one time in eight — that's not a magic coin, that's Tuesday. The same is true of a receiver's first three games. The more observations you have, the harder it is for luck alone to fake a pattern.",
          },
          film: [
            {
              title: "Stabilization",
              text: "Different stats need different sample sizes before they mean much. Volume stats (targets, carries) stabilize fast — a player's role is a real, repeated decision. Efficiency stats (yards per catch, touchdown rate) stabilize slowly, because they depend on a handful of high-variance plays.",
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
                "100% of 3 is not evidence of elite hands — it's a sample so small that luck dominates. Ask for the number of attempts before you trust any rate.",
            },
            {
              type: "mc",
              prompt:
                "Which stat becomes trustworthy with FEWER games of data?",
              options: [
                "Touchdown rate",
                "Yards per catch",
                "Targets per game",
                "Longest reception",
              ],
              answer: 2,
              explain:
                "Targets reflect a coaching decision repeated every week, so they stabilize quickly. Rates and maximums hinge on rare, high-variance events.",
            },
            {
              type: "mc",
              prompt:
                "Your query returns a 90% win rate — from 10 games. What do you add to the report?",
              options: [
                "Nothing, the number speaks for itself",
                "The sample size, so the reader can judge it",
                "A larger percentage to be safe",
                "Only the wins",
              ],
              answer: 1,
              explain:
                "A rate without its denominator is close to meaningless. Reporting n alongside the percentage is a habit that earns trust fast.",
            },
            {
              type: "fill",
              prompt:
                "Report the rate alongside the count that produced it.",
              parts: [
                'summary = df.groupby("player").agg(\n    rate=("caught", "mean"),\n    targets=("caught", "',
                null,
                '")\n)',
              ],
              bank: ["count", "max", "first", "std"],
              answer: ["count"],
              explain:
                "Pairing every rate with its count is the single cheapest habit for not embarrassing yourself in a stakeholder meeting.",
            },
          ],
        },
        {
          id: "u8-l3",
          title: "Regression to the Mean",
          blurb: "Why the hot hand cools — and it isn't a jinx.",
          brief: {
            goal: "Recognise regression to the mean instead of inventing a story.",
            setup:
              "If a performance is part skill and part luck, an extreme result probably had good luck in it — and luck doesn't repeat. The drift back toward normal isn't a slump or a jinx. It's the most misread pattern in sports analytics.",
          },
          intro: {
            title: "Extremes drift back toward normal",
            text: "If a performance is partly skill and partly luck, then an extreme result probably had unusually good luck in it. Luck doesn't repeat, so the next stretch lands closer to the player's true level. That drift is regression to the mean, and it's the most misread pattern in all of sports analytics.",
          },
          film: [
            {
              title: "The cover jinx isn't real",
              text: "Players featured after a monster month tend to decline afterward — not because of the magazine cover, but because they were selected FOR an extreme result. Selecting on an extreme guarantees the average performance afterward looks worse. Same math behind 'the rookie hit a wall' and 'the new coach fixed him.'",
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
                "His true ability probably didn't change. An extreme run reflects skill plus luck; only the skill part carries forward.",
            },
            {
              type: "mc",
              prompt:
                "You rank players by Week 1 points and track the top 10 afterward. What should you EXPECT?",
              options: [
                "They stay the top 10 all season",
                "As a group they score less than in Week 1",
                "They get better each week",
                "Their scores stay identical",
              ],
              answer: 1,
              explain:
                "You selected them for an extreme week, so the group's average falls afterward. Predicting this correctly is a genuine analytical edge — and a great interview answer.",
            },
            {
              type: "mc",
              prompt:
                "Which finding is most likely to be real rather than regression?",
              options: [
                "A 3-game scoring spike",
                "A career-best single game",
                "A sustained rise in snap share over 8 games",
                "One week as the league's top scorer",
              ],
              answer: 2,
              explain:
                "A sustained change in role — snaps, targets, usage — is a decision, not a coin flip. Role changes are the signal; single-game peaks are usually noise.",
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
                "Both ends are being over-read. The job is to say what the data can and can't support — in both directions, not just the convenient one.",
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
          blurb: "Match the chart to the question, not to your mood.",
          brief: {
            goal: "Choose the chart the question actually calls for.",
            setup:
              "The question decides the chart, not your mood. Amounts across categories → bars. Something over time → a line. Relationship between two numbers → scatter. Shape of one distribution → histogram. Most bad charts are right data in the wrong container.",
          },
          intro: {
            title: "The chart type is decided by the question",
            text: "Comparing amounts across categories? Bar chart. Tracking something over time? Line chart. Looking for a relationship between two numbers? Scatter plot. Showing how one distribution is shaped? Histogram. Most bad charts are the right data in the wrong container.",
          },
          film: [
            {
              title: "Why pie charts keep losing",
              text: "Humans compare lengths accurately and angles poorly. A pie chart with six similar slices is unreadable; the same data as a sorted bar chart is instantly clear. Reserve pie charts for two or three parts of an obvious whole — or skip them.",
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
                "Time on the x-axis, value on the y-axis — a line chart. The connecting line is what signals 'these points are a sequence.'",
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
                "Two numeric variables, one point per player — a scatter plot is how you see a relationship (and whether it's actually there).",
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
                "Comparing amounts across categories is bar-chart work, and sorting it does half the analysis for the reader. Horizontal bars also give long player names room to breathe.",
            },
            {
              type: "mc",
              prompt:
                "You want to show whether most weekly scores cluster low with a few big outliers. Which chart?",
              options: ["Histogram", "Pie chart", "Line chart", "Bar chart"],
              answer: 0,
              explain:
                "A histogram shows the shape of a single distribution — exactly how you reveal skew and outliers visually rather than arguing about the mean.",
              drillSkip: true,
            },
          ],
        },
        {
          id: "u9-l2",
          title: "Axes That Don't Lie",
          blurb: "The truncated y-axis and other honest-mistake territory.",
          brief: {
            goal: "Build charts that don't overstate what the data says.",
            setup:
              "Bars encode value by length, so their baseline must be zero — truncate it and a 5% gap looks like a landslide. Lines encode change, so a non-zero baseline can be the honest choice. Knowing which rule applies is the skill.",
          },
          intro: {
            title: "Where the axis starts changes the story",
            text: "Start a bar chart's y-axis at 20 instead of 0 and a 5% difference looks like a landslide. Bars encode value by length, so their baseline must be zero. Line charts are different — they encode change, so a non-zero baseline is often fine and sometimes necessary.",
          },
          film: [
            {
              title: "The rule, and its exception",
              text: "Bars: always start at zero, no exceptions. Lines: zero is optional, but label clearly and don't zoom so far that ordinary noise looks like a crisis. When you do truncate, say so on the chart rather than hoping nobody checks.",
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
                "Bar length is the value. Cutting the baseline breaks that link and visually exaggerates every gap — the most common way an honest chart misleads.",
            },
            {
              type: "mc",
              prompt: "Which chart type can legitimately skip a zero baseline?",
              options: [
                "Bar chart",
                "Stacked bar chart",
                "Line chart tracking change over time",
                "None ever",
              ],
              answer: 2,
              explain:
                "Lines encode change rather than magnitude, so a zoomed y-axis can be the honest choice — a body-temperature chart starting at 0°C would hide everything that matters.",
            },
            {
              type: "mc",
              prompt: "What belongs on essentially every chart you ship?",
              options: [
                "A 3D effect",
                "Axis labels with units, and a title stating the takeaway",
                "As many colors as possible",
                "The raw query underneath",
              ],
              answer: 1,
              explain:
                "Unlabeled axes make a chart unusable out of context — and charts always travel out of context. Titling with the finding ('RB targets fell after Week 8') beats a generic label.",
            },
            {
              type: "mc",
              prompt:
                "Your chart uses red and green to separate two groups. What's the accessibility problem?",
              options: [
                "Red and green are unprofessional",
                "Roughly 1 in 12 men can't reliably distinguish them",
                "They print poorly",
                "There is no problem",
              ],
              answer: 1,
              explain:
                "Red/green is the most common color-vision deficiency. Use blue/orange, or vary shape and position too, so color isn't the only thing carrying meaning.",
            },
          ],
        },
        {
          id: "u9-l3",
          title: "One Chart, One Point",
          blurb: "Cut everything that isn't the argument.",
          brief: {
            goal: "Cut a chart down to the one thing it's arguing.",
            setup:
              "Every gridline, legend, and colour competes for attention. Say your finding out loud in one sentence, then delete anything on the chart that isn't helping you say it. A title that states the finding does more work than any styling.",
          },
          intro: {
            title: "If it doesn't serve the point, delete it",
            text: "Every gridline, legend, color, and label competes for attention. A chart making one clear claim beats a dashboard making eight vague ones. Before you ship, say your finding out loud in a sentence — then delete anything on the chart that isn't helping you say it.",
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
                "Show the argument, keep the rest available. Forty labeled bars is a data dump — the reader has to do the analysis you were hired to do.",
            },
            {
              type: "mc",
              prompt: "Which title is doing the most work?",
              options: [
                '"Points by Week"',
                '"Chart 3"',
                '"Target share collapsed after the Week 8 trade"',
                '"Data Analysis Results"',
              ],
              answer: 2,
              explain:
                "A title that states the finding means the reader gets it even if they only look for two seconds. That's usually all you get.",
            },
            {
              type: "mc",
              prompt:
                "A stakeholder says your chart is 'too simple.' What's the strongest response?",
              options: [
                "Add more series and colors",
                "Switch to 3D",
                "Ask which decision they need to make, and check the chart answers it",
                "Send the raw spreadsheet instead",
              ],
              answer: 2,
              explain:
                "Simplicity isn't the flaw — mismatch with the decision is. Anchor on what they need to decide, then confirm the chart supports it.",
            },
            {
              type: "fill",
              prompt:
                "Label the chart so it survives being screenshotted into a Slack thread.",
              parts: [
                'ax.set_title("RB target share fell after Week 8")\nax.set_xlabel("Week")\nax.',
                null,
                '("Target share (%)")',
              ],
              bank: ["set_ylabel", "set_xlim", "legend", "grid"],
              answer: ["set_ylabel"],
              explain:
                "set_ylabel names the y-axis and its units. Units are the part people forget, and the part that makes a chart ambiguous forever.",
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
          blurb: "add, commit, and why analysis_final_v3_REAL.py must die.",
          brief: {
            goal: "Save your work in git so you can delete boldly.",
            setup:
              "Git records snapshots. You stage changes with `git add`, then save them with `git commit -m \"message\"`. Every commit is recoverable forever — which is exactly what frees you to stop hoarding files called analysis_final_v3_REAL.py.",
          },
          intro: {
            title: "A commit is a save point",
            text: "Git records snapshots of your project. You stage the changes you want to keep with `git add`, then save them with `git commit -m \"message\"`. Every commit is recoverable forever, which is what frees you to delete boldly instead of hoarding files named final_v2_actually_final.",
            code: 'git add analysis.py\ngit commit -m "Add target share calculation"',
          },
          film: [
            {
              title: "Writing a message worth reading",
              text: "Write what changed and why, not what you did mechanically. 'Fix bye-week double count in weekly totals' is useful to future-you at 11pm. 'update', 'stuff', and 'fix' are not — and reviewers read these before they read your code.",
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
                "add stages, commit saves. The two-step trip surprises beginners but it's what lets you commit part of your changes and leave the rest.",
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
                "It names the bug and where it lived. Six months later this is the difference between understanding your own work and rewriting it.",
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
                "status is the command you run constantly — it shows what's modified, what's staged, and what git is ignoring.",
              drillSkip: true,
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
                "History keeps everything. Removing the file going forward doesn't erase past commits — treat the key as leaked and rotate it. This is why .gitignore and .env files exist.",
            },
          ],
        },
        {
          id: "u10-l2",
          title: "Branches",
          blurb: "Try something risky without breaking what works.",
          brief: {
            goal: "Experiment on a branch without risking what works.",
            setup:
              "A branch is an independent line of work. main keeps running while you try something; if the idea fails you delete the branch and nothing was ever at risk. If it works, you merge it back.",
          },
          intro: {
            title: "A branch is a parallel drive",
            text: "A branch is an independent line of work. You leave main untouched and safe, experiment on a branch, and merge back only if it pans out. If it doesn't, you delete the branch and nothing was ever at risk.",
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
                "-b creates the branch and switches to it. Without -b, git expects the branch to already exist. (Newer git also offers `git switch -c`.)",
            },
            {
              type: "mc",
              prompt: "Why branch instead of just editing main directly?",
              options: [
                "It's faster",
                "main keeps working while you experiment, and bad ideas cost nothing",
                "Git requires it",
                "It uses less disk space",
              ],
              answer: 1,
              explain:
                "Isolation. Broken half-finished work never touches the version that runs, and abandoning an experiment is a one-line delete.",
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
                "Git merges automatically when changes don't overlap. When they do, it stops and asks a human — conflicts are normal, not a failure state.",
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
                "Merged branches are noise. Delete them so the branch list shows only live work — and never force push over shared history.",
            },
          ],
        },
        {
          id: "u10-l3",
          title: "Pull Requests & Your Portfolio",
          blurb: "How work gets reviewed — and how a hiring manager finds it.",
          brief: {
            goal: "Get work reviewed, and make a repo a hiring manager can read.",
            setup:
              "A pull request proposes a change and opens it for review — it's how nearly every data team ships. It's also the artifact an interviewer can actually read: your reasoning, in public, in your own words.",
          },
          intro: {
            title: "A pull request is a proposal",
            text: "You push a branch to GitHub and open a pull request: here's what I changed, here's why, please review. It's how essentially every data team ships work. It's also the artifact a hiring manager can read — your reasoning, in public, in your own words.",
          },
          film: [
            {
              title: "The README does the hiring",
              text: "Most people click your repo, read the README, and leave. Lead with what the project answers, one screenshot of the finding, and how to run it. A brilliant notebook behind a blank README reads as an unfinished project.",
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
                "It's a request, not an action — a place to discuss the change before it lands. Reviewers comment, you push fixes, then it merges.",
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
                "Review is a conversation. Being able to defend a choice and change your mind in public is exactly the behavior teams are screening for.",
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
                "Lead with the question and the finding. Setup details matter but belong further down — most readers never scroll.",
            },
            {
              type: "mc",
              prompt:
                "Why does a public repo with real commit history beat a single uploaded notebook?",
              options: [
                "It looks longer",
                "It shows how you work and think over time, not just the final artifact",
                "GitHub ranks it higher",
                "It's the only accepted format",
              ],
              answer: 1,
              explain:
                "History is evidence of process — iteration, fixes, judgment. That's the part an interviewer can't get from a polished final file.",
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
          blurb: "Where R wins, and why sports analytics leans on it.",
          brief: {
            goal: "Understand where R fits next to Python.",
            setup:
              "R was designed for statistics from the start, so tables and models are native rather than bolted on. A large share of public sports analytics — nflverse included — ships as R packages, so reading R is a real advantage even if you write mostly Python.",
          },
          intro: {
            title: "R was built for data, not general programming",
            text: "Python is a general language that grew great data tools. R was designed for statistics from the start, so tables, factors, and models are native rather than bolted on. In sports specifically, an enormous amount of public work — nflverse included — ships as R packages.",
          },
          film: [
            {
              title: "You don't have to choose",
              text: "Most working analysts read both and write mostly one. The concepts you already have — filter, group, aggregate, sort — are identical in either. Switching languages is a vocabulary problem, not a thinking problem.",
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
                "The ecosystem is the reason. If the package that already solves your problem is in R, reading R is the shortest path to using it.",
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
                "`<-` is R's idiomatic assignment. `=` also works in most spots, but `<-` is what you'll see in nearly all published code.",
              drillSkip: true,
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
                "filter/group_by/summarise/arrange line up with the SQL and pandas moves you already have. The punctuation is new; the ideas aren't.",
            },
          ],
        },
        {
          id: "u11-l2",
          title: "dplyr Is SQL With Pipes",
          blurb: "filter, group_by, summarise, arrange — same five moves.",
          brief: {
            goal: "Run real dplyr and see it's the SQL you already know.",
            setup:
              "R runs live in your browser here, dplyr included. The pipe |> feeds the left side into the right, so a chain reads in the order you'd say it: take the data, filter it, group it, summarise it, sort it. Same five moves as SQL.",
          },
          intro: {
            title: "The pipe passes data along",
            text: "The pipe (|>, or %>% in older code) takes the thing on the left and feeds it to the function on the right. It lets you write a chain in the order you'd say it out loud: take the data, filter it, group it, summarise it, sort it.",
            code: 'week_results |>\n  filter(position == "RB") |>\n  group_by(player) |>\n  summarise(total = sum(points)) |>\n  arrange(desc(total))',
          },
          film: [
            {
              title: "The translation table",
              text: "One mapping covers all three languages you've now seen. Learn the concept once; the rest is spelling.",
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
                "filter() picks rows. Careful: R's select() picks COLUMNS, so it's SQL's SELECT list rather than a row filter — the one name that reliably confuses people.",
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
                "group_by then summarise is GROUP BY plus an aggregate; arrange(desc()) is ORDER BY ... DESC. Structurally identical to the SQL you wrote in Unit 3.",
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
                "mutate() creates a computed column — SQL's `points / games AS avg` in the SELECT list.",
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
                "It threads data through steps in reading order, which is why dplyr chains scan like sentences instead of nested function calls.",
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
                "group_by + summarise is GROUP BY + AVG. You've now written the same aggregation in three languages.",
            },
          ],
        },
        {
          id: "u11-l3",
          title: "ggplot2 in Layers",
          blurb: "Build a chart by stacking pieces, not by picking a template.",
          brief: {
            goal: "Build a chart in layers with ggplot2.",
            setup:
              "ggplot2 joins layers with +. You name the data, map columns to visual properties with aes(), then add a geometry. Swap the geometry and the same mapping becomes a different chart — that's the payoff of the layered grammar.",
          },
          intro: {
            title: "Data, mapping, geometry",
            text: "ggplot2 builds a chart in layers joined by +. You name the data, map columns to visual properties (x, y, color) with aes(), then add a geometry — geom_point() for a scatter, geom_col() for bars, geom_line() for lines. Change the geom and the same mapping becomes a different chart.",
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
                "aes() is the mapping layer — it connects columns to what you see. Setting a fixed color goes OUTSIDE aes(); mapping a column to color goes inside.",
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
                "ggplot2 layers join with + (not the pipe — a classic stumble), and geom_point() draws one dot per row.",
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
                "That's the payoff of the layered grammar — the data and mapping stay, only the geometry swaps.",
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
                "ggplot2 predates the pipe and joins layers with +. Piping between layers is the error nearly everyone hits once — usually right after learning dplyr.",
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
            setup:
              "So far your code has run straight through. `if` lets it branch: test something, and only run that block when the test is true. `elif` adds another test, `else` catches everything left. Indentation is what says which lines belong to the branch — Python has no braces, and that is not optional styling.",
          },
          intro: {
            title: "Indentation is the syntax",
            text: "The colon opens a block and the indented lines below it are that block. Get the indentation wrong and Python either errors or, worse, runs the line every time instead of only when the test passes. Four spaces is the convention; be consistent and your editor will handle it.",
            code: 'points = 24.6\n\nif points >= 20:\n    print("Boom game")\nelif points >= 12:\n    print("Solid")\nelse:\n    print("Bust")',
          },
          film: [
            {
              title: "Order matters in an if-chain",
              text: "Python takes the FIRST branch that passes and skips the rest. So a chain has to run from most specific to least: test >= 20 before >= 12, or every 24-point game gets labelled 'Solid' and the boom branch never runs at all. It won't error — it'll just be quietly wrong.",
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
                "First match wins and the rest are skipped. Order your thresholds most-specific first, or the top tier becomes unreachable.",
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
                "Python spells it `elif`, not `else if`. `else` takes no condition — it's whatever's left.",
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
                "Solid. Bucketing a number into named tiers is one of the most common things you'll ever do to a column.",
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
                "Three. A loop, a condition and a counter — that trio answers a surprising share of real questions.",
            },
          ],
        },
        {
          id: "u13-l2",
          title: "Package It in a Function",
          blurb: "def: write the logic once, use it everywhere.",
          brief: {
            goal: "Turn code you keep repeating into something you can call.",
            setup:
              "Copy-pasting the same tiering logic for four players is how bugs get in — you fix one copy and forget the others. A function names that logic once. `def` defines it, the indented body is what it does, and `return` hands a value back to whoever called it.",
          },
          intro: {
            title: "return hands a value back; print just shows it",
            text: "This is the distinction beginners lose most time to. `print` writes to the screen and gives the caller nothing. `return` gives the caller a value they can store, compare or pass on — and stops the function immediately. A function that prints instead of returning can't be built on.",
            code: 'def tier(points):\n    if points >= 20:\n        return "Boom"\n    elif points >= 12:\n        return "Solid"\n    return "Bust"\n\nprint(tier(24.6))',
          },
          film: [
            {
              title: "Default arguments",
              text: "Give a parameter a default and callers can skip it: `def tier(points, boom=20)` works as both tier(24.6) and tier(24.6, 25). It's how you make a function flexible without forcing every caller to spell out every option.",
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
                "A function that prints can't be used in a calculation. `total = tier(p)` gets None if tier printed instead of returning.",
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
                "`def` names it, `return` gives the value back. Without return the function silently produces None.",
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
                "21.4. Now that logic has a name, and every place that needs it calls the same one.",
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
                "Boom, Bust, Solid. One function, three calls — and if the thresholds change you edit one place.",
            },
          ],
        },
        {
          id: "u13-l3",
          title: "Dictionaries",
          blurb: "Look things up by name instead of by position.",
          brief: {
            goal: "Store and retrieve values by a key you choose.",
            setup:
              "A list finds things by position — scores[2] means 'the third one', which tells you nothing about who it is. A dictionary finds them by a key you pick, so ppg[\"Josh Allen\"] says exactly what it means. Keys are unique; assigning to an existing key overwrites it.",
          },
          intro: {
            title: "Curly braces, key: value",
            text: "Write it as {key: value, key: value}. Read a value with square brackets and the key. Asking for a key that isn't there raises a KeyError — use .get(key, default) when a miss is expected rather than exceptional.",
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
              drillSkip: true,
              explain:
                "Two lists rely on the positions lining up forever. Sort one and forget the other and every lookup is silently wrong.",
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
                ".items() hands you the key and value together, which is what makes filtering a dict readable.",
            },
          ],
        },
        {
          id: "u13-l4",
          title: "Comprehensions",
          blurb: "Five lines become one — without becoming unreadable.",
          brief: {
            goal: "Build a new list from an old one in a single expression.",
            setup:
              "Creating an empty list, looping, and appending is three lines of ceremony around one idea. A comprehension says the same thing in one: what to keep, where from, and optionally which ones. You'll read far more of these than you write, so recognising them matters as much as producing them.",
          },
          intro: {
            title: "[expression for item in list if condition]",
            text: "Read it left to right as a sentence: give me this, for each of those, where that's true. The `if` on the end is optional. If a comprehension ever gets long enough that you have to squint, that's the signal to write it back out as a loop.",
            code: "weeks = [24.6, 8.2, 31.0, 12.5]\n\ndoubled = [w * 2 for w in weeks]\nbooms   = [w for w in weeks if w >= 20]",
          },
          film: [
            {
              title: "The loop it replaces",
              text: "These two produce exactly the same list. The comprehension isn't faster to think about the first few times — it's faster to read once you're used to it, and it keeps the intent on one line instead of spread over four.",
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
                "A new list. The original is untouched — comprehensions build, they don't modify in place.",
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
                "`for` names the item, `if` filters. SQL's WHERE, wearing different clothes.",
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
                "[24.6, 31.0, 22.1]. One line, and the intent is right there on it.",
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
                "The expression on the left can be any transformation — that's the half people forget while focusing on the filter.",
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
            setup:
              "You already know what filtering and sorting mean — you did both in SQL. pandas spells them differently: a boolean mask inside square brackets for WHERE, .sort_values() for ORDER BY. The thinking transfers completely; only the punctuation is new.",
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
            setup:
              "groupby splits rows into buckets by a column, then an aggregate collapses each bucket to one number — exactly GROUP BY. .agg() goes further and computes several aggregates in one pass, which is where pandas starts saving you real time over SQL.",
          },
          intro: {
            title: "Split, apply, combine",
            text: "groupby splits the frame into groups, applies the aggregate to each, and combines the answers back into one result. Chain a column name before the aggregate to summarise just that column; use .agg() with a dict to summarise several at once.",
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
              drillSkip: true,
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
            setup:
              "You met joins in SQL; merge is the same operation. The argument that matters most is `how`: 'inner' keeps only matches (and quietly drops the rest), 'left' keeps everything on the left and fills gaps with NaN. Choosing wrong is how row counts mysteriously change.",
          },
          intro: {
            title: "how= decides who survives",
            text: "pd.merge(left, right, on=\"player\", how=\"inner\") keeps only players present in both. how=\"left\" keeps every left-hand row regardless. If a merge changes your row count unexpectedly, `how` is the first thing to check — and the second is whether the right side had duplicate keys.",
            code: 'pd.merge(roster, scores, on="player", how="left")',
          },
          film: [
            {
              title: "NaN is pandas' NULL",
              text: "An unmatched left row gets NaN in the right-hand columns. NaN is a float, so an integer column becomes float the moment a merge introduces one — a small surprise that trips people up when their ids suddenly print as 12.0.",
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
            setup:
              "Real files arrive broken: numbers stored as text, names with trailing spaces, gaps where a value should be. None of it errors immediately — it just produces wrong answers later. Cleaning first is the difference between an analysis and a guess.",
          },
          intro: {
            title: "Find it, then decide",
            text: "df.isna().sum() counts missing values per column. Then you choose: drop those rows, or fill them. There's no universal right answer — dropping loses data, filling invents it. What matters is choosing deliberately and saying which you did.",
            code: 'df.isna().sum()\n\ndf["points"].fillna(0)      # treat missing as zero\ndf.dropna(subset=["points"]) # or remove those rows',
          },
          film: [
            {
              title: "Zero and missing are different facts",
              text: "A player who was injured has missing points. A player who played and did nothing has zero. Fill missing with 0 and you've merged those into one story — and every average you compute afterwards is dragged down by players who never took the field.",
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
            setup:
              "A spreadsheet is a grid. Columns get letters across the top, rows get numbers down the side, and a cell's address is just the two stuck together: column first, then row. E2 means column E, row 2. A block of cells is written with a colon — E2:E17 means \"E2 all the way down to E17\". That is the entire address system, and every formula in this course is built on it.",
            previewSheet: "Roster",
            previewCaption:
              "The league roster. Row 1 holds the headers, so the actual data starts at row 2.",
          },
          intro: {
            title: "Column letter, then row number",
            text: "E2 is not \"row E, column 2\" — it is column E, row 2. Excel always writes the letter first. The colon in E2:E17 means \"through\", so it covers all 16 player rows without you listing them. Get comfortable reading addresses now and every formula later becomes a sentence you can already parse.",
            code: "E2        one cell: column E, row 2\nE2:E17    a range: E2 down through E17\nA2:E17    a block: columns A–E, rows 2–17\nImport!A2 a cell on another sheet",
          },
          film: [
            {
              title: "Why the data starts at row 2",
              text: "Row 1 holds the headers — Player, Team, Pos, and so on. If you include row 1 in a numeric range you are asking Excel to average the word \"Points\", which it will quietly skip rather than warn you about. Almost every off-by-one bug in a spreadsheet traces back to a range that started one row too high.",
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
              drillSkip: true,
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
            setup:
              "A formula always starts with an equals sign. That is how Excel knows you are asking a question rather than typing text. After the equals sign comes a function name and a range in brackets: =SUM(E2:E17) means \"add up everything from E2 to E17\". SUM, AVERAGE and COUNT are the three you will reach for constantly.",
            previewSheet: "Roster",
          },
          intro: {
            title: "=FUNCTION(range)",
            text: "Every function follows the same shape: an equals sign, a name, and brackets holding what it should work on. Change the name and you change the question — the range stays exactly the same. Once you can write one of these you can write all of them.",
            code: "=SUM(E2:E17)       add every value\n=AVERAGE(E2:E17)   the mean\n=COUNT(E2:E17)     how many numbers\n=COUNTA(A2:A17)    how many non-empty cells",
          },
          film: [
            {
              title: "COUNT and COUNTA are not the same",
              text: "COUNT only counts numbers. COUNTA counts anything that is not empty, text included. On a column of names COUNT returns 0 and COUNTA returns the real answer — which is why a roster count that reads zero is usually the wrong function rather than an empty sheet.",
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
            setup:
              "MAX and MIN do exactly what they sound like. The catch — and it is the one that sends people to INDEX/MATCH later — is that they return the number, not the player attached to it. MAX tells you the top score was 430.4; it will not tell you who scored it.",
            previewSheet: "Roster",
          },
          intro: {
            title: "The value, not the name",
            text: "MAX(E2:E17) reads down the Points column and hands back the single biggest number. It has no idea a Player column exists. Getting from \"the top score\" to \"who scored it\" is a lookup problem, and you will solve it properly in the Lookups unit.",
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
            setup:
              "Games played is not the same for every player on this roster — some played 17, one played 12. That makes total points a misleading way to rank them, because the biggest total might just belong to whoever stayed healthy. Dividing by games gives points per game, which compares like with like. This is the single most common analytical move in sports data.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Divide, then round",
            text: "Division uses a plain slash. Raw division gives you a long decimal tail nobody wants to read, so wrap it in ROUND with the number of decimal places you want. ROUND takes two arguments: the value, and how many decimals to keep.",
            code: "=E2/D2              points ÷ games\n=ROUND(E2/D2,2)     the same, to 2 decimals\n=ROUND(F2/E2,0)     salary per point, whole dollars",
          },
          film: [
            {
              title: "Rate stats change the ranking",
              text: "Tyreek Hill scored 218.2 and A.J. Brown 216.9 — all but identical seasons, on the totals. Per game they are 12.8 and 16.7, because Brown played 13 games to Hill's 17. The totals hid the better player. Whenever someone hands you a leaderboard built on totals, the first question worth asking is whether everyone had the same opportunity.",
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
            setup:
              "IF takes three things: a test, what to return when the test is true, and what to return when it is false. =IF(E2>300,\"Stud\",\"Flex\") reads as \"if this player scored over 300, call them a Stud, otherwise call them a Flex\". It is the first formula that does something other than arithmetic, and it is the backbone of every spreadsheet that categorises anything.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Test, then true, then false",
            text: "The order never changes: =IF(test, value_if_true, value_if_false). Text you want returned goes in double quotes; numbers do not. Leave the third argument off and Excel returns the word FALSE, which is almost never what you meant.",
            code: "=IF(E2>300,\"Stud\",\"Flex\")\n=IF(D2=17,\"Full season\",\"Missed time\")\n=IF(E2>=350,\"Elite\",IF(E2>=250,\"Starter\",\"Bench\"))",
          },
          film: [
            {
              title: "Nesting IFs reads like a ladder",
              text: "Put a second IF where the false answer goes and you get a ladder: check the highest bar first, then the next, and whatever falls through lands on the final default. Order matters — test 350 before 250, or everyone above 350 gets caught by the 250 rung first and labelled Starter.",
              code: "=IF(E2>=350,\"Elite\",IF(E2>=250,\"Starter\",\"Bench\"))",
            },
          ],
          exercises: [
            {
              type: "mc",
              prompt: "What are the three arguments of IF, in order?",
              options: [
                "true value, test, false value",
                "test, value if true, value if false",
                "range, criteria, result",
                "test, false value, true value",
              ],
              answer: 1,
              explain:
                "Test first, then the true answer, then the false one.",
              drillSkip: true,
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
            setup:
              "COUNT tells you how many rows there are. COUNTIF tells you how many rows match a rule: =COUNTIF(C2:C17,\"WR\") counts the wide receivers. The rule goes in quotes, and comparison rules go in quotes too — \">250\" is a piece of text as far as the formula is concerned, which surprises everyone the first time.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Range first, then the rule",
            text: "COUNTIF takes the range to look at and the rule to apply. COUNTIFS takes as many range/rule pairs as you like, and counts only the rows that satisfy every one of them. The ranges must all be the same height or the pairs won't line up row by row.",
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
            setup:
              "SUMIF has an argument order that trips up nearly everyone: you give it the range to *test*, then the rule, and then — separately — the range to actually *add*. =SUMIF(C2:C17,\"RB\",E2:E17) means \"look at the positions, find the RBs, and add up their points\". The column you are testing and the column you are summing are different, and they go at opposite ends of the formula.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Test range, rule, sum range",
            text: "SUMIF checks one column and adds another. SUMIFS flips the order — the column to add comes first, then the pairs — which is inconsistent and genuinely confusing, so it is worth reading the two side by side until the difference sticks.",
            code: "=SUMIF(C2:C17,\"RB\",E2:E17)      test, rule, then what to add\n=SUMIFS(F2:F17,G2:G17,\"Jordan\") what to add FIRST, then the pairs\n=AVERAGEIF(C2:C17,\"QB\",E2:E17)",
          },
          film: [
            {
              title: "SUMIF and SUMIFS disagree on argument order",
              text: "SUMIF puts the range being added last. SUMIFS puts it first. This is not a rule with a reason — it is a historical accident in Excel that you simply have to remember. When a conditional total comes back wrong, argument order is the first thing to check.",
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
            setup:
              "Copy =E2/E18 down one row and Excel helpfully turns it into =E3/E19. That is usually what you want for the top half and a disaster for the bottom half — the divisor was supposed to stay put. A dollar sign freezes whatever follows it: $E$2 never moves, E$2 keeps the row fixed, $E2 keeps the column fixed. This one character is the difference between a formula you can copy and one you have to rewrite sixteen times.",
            previewSheet: "Roster",
          },
          intro: {
            title: "$ freezes what comes after it",
            text: "References are relative by default — they shift to stay in the same relative position when you copy them. Adding $ makes that part absolute, so it points at the same place no matter where the formula ends up. When a formula works in the first row and returns nonsense further down, a missing $ is almost always why.",
            code: "E2      moves with the formula\n$E$2    never moves\nE$2     row locked, column free\n$E2     column locked, row free",
          },
          film: [
            {
              title: "The share-of-total pattern",
              text: "Any \"what percentage of the whole is this row\" formula needs an absolute denominator. The numerator should move down the column with each row; the total must not. That is exactly one relative reference over one absolute range — and it is the most common real use of $ you will ever write.",
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
              drillSkip: true,
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
            setup:
              "A lookup answers \"I have this name — what's their number?\". VLOOKUP takes four things: what to look for, the block of cells to search, which column of that block to return, and FALSE to demand an exact match. The column number counts from the left edge of the block you gave it, not from column A of the sheet — that off-by-one is the single most common VLOOKUP mistake.",
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
              text: "The fourth argument defaults to TRUE, meaning approximate match. On unsorted data that does not error — it returns whatever it happened to land near, which looks like a real answer and is not. There is no situation in this course where you want anything but FALSE.",
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
            setup:
              "#N/A means \"not available\" — the lookup ran fine and simply did not find the value. Sometimes that is real information (the player is not rostered) and sometimes it is a data problem (the name has a trailing space). Either way, a column full of #N/A makes every SUM below it fail too, so you wrap the lookup in IFERROR and decide what should appear instead.",
            previewSheet: "Roster",
          },
          intro: {
            title: "IFERROR catches the failure",
            text: "IFERROR takes a formula and a fallback. If the formula works you get its answer; if it errors you get the fallback. It is the difference between a sheet that reports \"Not rostered\" and one that breaks every total underneath it.",
            code: "=IFERROR(VLOOKUP(\"Nobody\",A2:E17,5,FALSE),\"Not rostered\")\n=IFERROR(VLOOKUP(\"Nobody\",A2:E17,5,FALSE),0)",
          },
          film: [
            {
              title: "VLOOKUP cannot look left",
              text: "VLOOKUP always searches the first column of the range and returns something to its right. If the value you have is in column C and the answer you need is in column A, VLOOKUP simply cannot do it — you would have to rearrange the sheet. That limitation is the reason INDEX/MATCH exists, and it is the next lesson.",
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
            setup:
              "MATCH answers one question: where in this list is my value? It returns a position — 15, not a name. INDEX answers the other: give me item number 15 from this column. Neither is much use alone. Nested together they do everything VLOOKUP does, in any direction, and without a column number that silently breaks when someone inserts a column.",
            previewSheet: "Roster",
          },
          intro: {
            title: "MATCH finds the position, INDEX fetches the value",
            text: "Read the nested version from the inside out. MATCH runs first and returns a row number; INDEX then pulls that row out of whichever column you point it at. Because you name the return column directly, it can sit anywhere — left of the search column, right of it, another sheet entirely.",
            code: "=MATCH(\"George Kittle\",A2:A17,0)              → 14\n=INDEX(E2:E17,14)                             → 236.6\n=INDEX(E2:E17,MATCH(\"Tyreek Hill\",A2:A17,0))  → both at once",
          },
          film: [
            {
              title: "Why analysts prefer it",
              text: "VLOOKUP's column number is a hardcoded count. Insert a column into the middle of the table and every VLOOKUP pointing past it now returns the wrong field — silently, with no error. INDEX/MATCH references the return column by name, so inserting a column just moves the reference along with it.",
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
            setup:
              "XLOOKUP is the newer function that fixes VLOOKUP's design in one go: you name the search column and the return column directly, exact match is the default, and the fallback for \"not found\" is built into a fourth argument instead of needing IFERROR. If your Excel has it, use it. If you are on an older version — and plenty of workplaces are — INDEX/MATCH from the last lesson does the same job everywhere.",
            previewSheet: "Roster",
          },
          intro: {
            title: "Look for, look in, return from",
            text: "=XLOOKUP(\"Derrick Henry\", A2:A17, F2:F17) reads almost like the sentence you'd say: find this name, in this column, and give me the matching value from that column. An optional fourth argument replaces IFERROR for the not-found case.",
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
            setup:
              "The Import tab is the same league exported badly. The names look right and the lookups fail anyway, because \"  Josh Allen\" with two leading spaces is not the same text as \"Josh Allen\". You cannot see the difference; Excel can. TRIM strips leading and trailing spaces (and collapses runs of them in the middle), and it fixes more broken lookups than any other function.",
            previewSheet: "Import",
            previewCaption:
              "The bad export. The names carry stray spaces and the points came through as text.",
          },
          intro: {
            title: "LEN proves it",
            text: "When two values look the same but won't match, measure them. LEN counts characters, spaces included — if the length is longer than the name you can see, you have found your culprit. Then TRIM removes it.",
            code: "=LEN(Import!A2)         12  — two spaces hiding\n=LEN(TRIM(Import!A2))   10  — the real name\n=TRIM(Import!A2)        \"Josh Allen\"",
          },
          film: [
            {
              title: "Clean on the way in, not after",
              text: "The instinct is to fix the source data by hand. On six rows that works; on sixty thousand it does not, and it has to be redone every time the export refreshes. Wrapping the lookup in TRIM fixes it once, permanently, for every future refresh of the same file.",
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
            setup:
              "Exports frequently deliver numbers as text — quoted, space-padded, or flagged with a little green triangle in the corner of the cell. They look like numbers and they behave like words: SUM ignores them completely and returns 0 rather than an error. VALUE converts a text number into a real one, and TRIM inside VALUE handles the padding at the same time.",
            previewSheet: "Import",
          },
          intro: {
            title: "SUM silently skips text",
            text: "This is the dangerous part: there is no error. A column of 400-point seasons totals to zero and the sheet looks fine. Any time a total is implausibly low — especially exactly zero — suspect text before you suspect the data.",
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
            setup:
              "One player on the Import sheet has no points value at all — the cell is empty. Empty is not zero. AVERAGE skips blanks entirely, so a blank quietly shrinks your denominator, while a zero drags the average down. Both are defensible choices; picking one by accident is not. Start by counting how many you have.",
            previewSheet: "Import",
          },
          intro: {
            title: "Count the gaps first",
            text: "COUNTBLANK counts empty cells; COUNTA counts non-empty ones. Together they tell you the shape of what is missing before you decide what to do about it. Then IF lets you label or substitute, so the gap is visible in the output rather than silently absorbed.",
            code: "=COUNTBLANK(Import!B2:B7)   1\n=COUNTA(Import!B2:B7)       5\n=IF(Import!B6=\"\",\"Missing\",\"Present\")",
          },
          film: [
            {
              title: "Blank and zero average differently",
              text: "Given 10, 20 and a blank, AVERAGE returns 15 — it drops the blank and divides by 2. Replace the blank with 0 and you get 10, dividing by 3. Neither is wrong in the abstract; what is wrong is not knowing which one your sheet did. Say out loud whether a missing game is a zero or an absence, then make the formula agree.",
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
            setup:
              "Once the data is clean you often still need it in a different shape — first names split off, team codes upper-cased, a list of names glued into one cell for an email. LEFT and RIGHT take characters off either end, UPPER/LOWER/PROPER fix capitalisation, and TEXTJOIN stitches a range together with a separator of your choosing.",
            previewSheet: "Roster",
          },
          intro: {
            title: "A small toolkit, endlessly recombined",
            text: "None of these functions is complicated on its own. The skill is seeing which two or three to nest together to get from what you have to what you need — the same instinct as VALUE(TRIM(...)) in the last lesson.",
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
      "u1", "u2", "u3", "u4", "u5", "u6",
      "u15", "u16", "u17", "u18",
      "u7", "u13", "u14",
      "u8", "u9", "u10", "u11",
    ],
  },
  {
    id: "sql",
    name: "SQL",
    blurb: "Select, filter, rank, and aggregate real stat sheets.",
    unitIds: ["u1", "u2", "u3", "u4", "u5", "u6"],
  },
  {
    id: "python",
    name: "Python & pandas",
    blurb: "Variables, loops, and DataFrames — with code that really runs.",
    unitIds: ["u7", "u13", "u14"],
  },
  {
    id: "excel",
    name: "Excel",
    blurb:
      "Formulas, logic, lookups and cleaning — executed live against a real workbook.",
    unitIds: ["u15", "u16", "u17", "u18"],
  },
  {
    id: "stats",
    name: "Statistics",
    blurb: "Averages, sample size, and regression to the mean.",
    unitIds: ["u8"],
  },
  {
    id: "viz",
    name: "Visualization",
    blurb: "Chart choice, honest axes, and making a point land.",
    unitIds: ["u9"],
  },
  {
    id: "git",
    name: "Git & GitHub",
    blurb: "Commits, branches, pull requests, portfolio READMEs.",
    unitIds: ["u10"],
  },
  {
    id: "r",
    name: "R & the tidyverse",
    blurb: "dplyr and ggplot2, executed live in your browser.",
    unitIds: ["u11"],
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

/** Units belonging to a module, in course order (includes coming-soon ones). */
export function moduleUnits(moduleId: string): Unit[] {
  const mod = getModule(moduleId);
  const byId = new Map((COURSE.units as Unit[]).map((u) => [u.id, u]));
  // Order by the module's unitIds, NOT by position in COURSE.units. A course
  // whose units were added later (Python's u13/u14) would otherwise appear at
  // the very end of the all-in-one pathway instead of next to its first unit.
  return mod.unitIds
    .map((id) => byId.get(id))
    .filter((u): u is Unit => Boolean(u));
}

export function liveLessons(
  moduleId: string = ALL_MODULE,
): { lesson: Lesson; unit: Unit }[] {
  return moduleUnits(moduleId)
    .filter((u) => u.status === "live")
    .flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, unit })));
}

export function getLesson(
  id: string,
): { lesson: Lesson; unit: Unit } | undefined {
  // Always resolves against the full course — a lesson URL must work no
  // matter which module the learner currently has selected.
  return liveLessons(ALL_MODULE).find((entry) => entry.lesson.id === id);
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
