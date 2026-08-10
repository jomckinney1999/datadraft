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

export type Exercise =
  | MCExercise
  | FillExercise
  | QueryExercise
  | CodeExercise;

export type TheoryCard = { title: string; text: string; code?: string };

export type Lesson = {
  id: string;
  title: string;
  blurb: string;
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
                "week_results has 2,160 rows. You want a quick 10-row peek. Which clause caps the rows returned?",
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
                "45 rows: 15 games a season for three seasons. One filter took you from 2,160 rows to just his.",
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
                "Three backs on the wire. Same pattern works for any column: team = 'BUF', week = 1, and so on.",
            },
          ],
        },
        {
          id: "u2-l2",
          title: "Setting the Line",
          blurb: "Comparisons and AND: numbers, thresholds, combos.",
          intro: {
            title: "Set the over/under",
            text: "Numbers compare with > < >= <= — no quotes. Chain conditions with AND when every condition must hit.",
            code: "SELECT * FROM week_results\nWHERE season = 2018\n  AND fantasy_pts > 20;",
          },
          film: [
            {
              title: "Compound conditions and parentheses",
              text: "AND binds tighter than OR — like order of operations in math. Mixing them without parentheses is a classic bust: WHERE season = 2018 AND week = 1 OR week = 2 actually returns ALL week-2 rows from every season. Parentheses make your read explicit.",
              code: "-- what you meant:\nWHERE season = 2018 AND (week = 1 OR week = 2)",
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
                "Only the league's best games clear 25. Numeric comparisons are how analysts define “boom” and “bust” in the first place.",
            },
            {
              type: "fill",
              prompt:
                "Two conditions, one play: the 2018 season AND more than 20 points.",
              parts: [
                "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE season = 2018 ",
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
              code: "WHERE season = 2018 AND week = 1",
              options: [
                "Rows matching BOTH conditions",
                "Rows matching either condition",
                "All 2018 rows, then all week-1 rows",
                "An error — one WHERE, one condition",
              ],
              answer: 0,
              explain:
                "AND requires every condition to hit. One WHERE can chain as many conditions as you need.",
            },
            {
              type: "query",
              prompt:
                "Who showed up in the week 10 spotlight game of 2017? Pull player and fantasy_pts where season is 2017, week is 10, and fantasy_pts is at least 15.",
              starter:
                "SELECT player, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT player, fantasy_pts FROM week_results WHERE season = 2017 AND week = 10 AND fantasy_pts >= 15;",
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
                "Opening-day pass catchers: player, team, and fantasy_pts for positions 'QB' and 'TE' in week 1 of season 2016.",
              starter:
                "SELECT player, team, fantasy_pts\nFROM week_results\nWHERE ",
              expected:
                "SELECT player, team, fantasy_pts FROM week_results WHERE position IN ('QB', 'TE') AND season = 2016 AND week = 1;",
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
                "Build the week 1 draft board for 2018 — best performance at the top.",
              parts: [
                "SELECT player, fantasy_pts\nFROM week_results\nWHERE season = 2018 AND week = 1\n",
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
          intro: {
            title: "The highlight reel formula",
            text: "“Top 5 anything” is always the same play: ORDER BY the stat DESC, then LIMIT 5. You can also sort by several columns — the second breaks ties in the first.",
            code: "ORDER BY fantasy_pts DESC, player\nLIMIT 5;",
          },
          film: [
            {
              title: "The clause pipeline never changes",
              text: "SELECT → FROM → WHERE → ORDER BY → LIMIT. That's the fixed snap count for every top-N question: filter to the population you care about, rank it, trim it. Memorize the order once and “top 5 rushers in week 10” becomes pure fill-in-the-blanks.",
              code: "SELECT player, fantasy_pts\nFROM week_results\nWHERE season = 2018 AND week = 10\nORDER BY fantasy_pts DESC\nLIMIT 5;",
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
                "Build the 2017 highlight reel: the 5 biggest single-game scores. Show player, week, and fantasy_pts — biggest first, and break ties alphabetically by player, then by earlier week.",
              starter:
                "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE season = 2017\n",
              expected:
                "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2017 ORDER BY fantasy_pts DESC, player, week LIMIT 5;",
              orderMatters: true,
              hint: "ORDER BY fantasy_pts DESC, player, week — then LIMIT 5 at the very end.",
              explain:
                "WHERE narrows to 2017, ORDER BY ranks, LIMIT trims the reel. That clause order never changes.",
            },
            {
              type: "fill",
              prompt:
                "Week 8 of 2016: sort by points first, and break ties alphabetically by player.",
              parts: [
                "SELECT player, team, fantasy_pts\nFROM week_results\nWHERE season = 2016 AND week = 8\nORDER BY ",
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
                "45 games — 15 a season for three seasons (every player sits one bye week).",
            },
            {
              type: "query",
              prompt:
                "What was Tyreek Hill's points-per-game in season 2018? Return ROUND(AVG(fantasy_pts), 1).",
              starter: "SELECT ",
              expected:
                "SELECT ROUND(AVG(fantasy_pts), 1) FROM week_results WHERE player = 'Tyreek Hill' AND season = 2018;",
              orderMatters: false,
              hint: "ROUND(AVG(fantasy_pts), 1), with two AND-ed WHERE conditions.",
              explain:
                "AVG computes the mean of his 15 games; ROUND keeps it to one decimal, box-score style.",
            },
          ],
        },
        {
          id: "u4-l2",
          title: "Splitting the Film by Player",
          blurb: "GROUP BY: one aggregate row per player, position, or team.",
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
                "Position battle: for season 2018, show position and COUNT(*) AS games — one row per position.",
              starter: "SELECT position, COUNT(*) AS games\nFROM week_results\n",
              expected:
                "SELECT position, COUNT(*) AS games FROM week_results WHERE season = 2018 GROUP BY position;",
              orderMatters: false,
              hint: "WHERE season = 2018, then GROUP BY position.",
              explain:
                "WHERE trims to 2018 first, then GROUP BY splits by position. Clause order: WHERE before GROUP BY, always.",
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
                "Build the 2017 season leaderboard: player and ROUND(SUM(fantasy_pts), 1) AS total, one row per player, highest total first, top 5 only.",
              starter:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total\nFROM week_results\n",
              expected:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2017 GROUP BY player ORDER BY total DESC LIMIT 5;",
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
                "Find the 300 Club: player and ROUND(SUM(fantasy_pts), 1) AS total for season 2018 — keeping only players whose total tops 300.",
              starter:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total\nFROM week_results\nWHERE season = 2018\nGROUP BY player\n",
              expected:
                "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2018 GROUP BY player HAVING total > 300;",
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
      drive: "5th Drive · Coming Soon",
      description:
        "Combine tables: match rosters to week_results and score entire fantasy matchups. The relational thinking phase of the full curriculum.",
      skills: ["JOIN", "ON", "Table aliases"],
      status: "coming-soon",
      lessons: [],
    },
    {
      id: "u6",
      number: 6,
      title: "Two-Minute Drill — Window Functions",
      drive: "6th Drive · Coming Soon",
      description:
        "Rolling averages, ranks within groups, week-over-week trends — the analyst toolkit that separates job-ready from beginner.",
      skills: ["OVER", "PARTITION BY", "Rolling stats"],
      status: "coming-soon",
      lessons: [],
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
          ],
        },
        {
          id: "u7-l2",
          title: "Lists & Loops",
          blurb: "Hold a whole roster, then do the same thing to every player.",
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
          ],
        },
        {
          id: "u11-l3",
          title: "ggplot2 in Layers",
          blurb: "Build a chart by stacking pieces, not by picking a template.",
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
    unitIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11"],
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
    unitIds: ["u7"],
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
  return (COURSE.units as Unit[]).filter((u) => mod.unitIds.includes(u.id));
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
