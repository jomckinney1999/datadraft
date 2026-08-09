// Course content for the gamified /learn MVP.
// Structure mirrors docs/CURRICULUM.md phases: Select & Filter → Sorting →
// Aggregations, with Joins and Window Functions visible as coming-soon units.
// All query exercises run against the sql.js dataset in lib/fantasy-data.ts.

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
  // SQL rendered in order; null marks a blank the learner fills from the bank.
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

export type Exercise = MCExercise | FillExercise | QueryExercise;

export type Lesson = {
  id: string;
  title: string;
  blurb: string;
  intro: { title: string; text: string; code?: string };
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
  title: "SQL Fundamentals: Rookie Season",
  tagline:
    "Course 1 of the SQL Sports roadmap. Go from zero to reading, filtering, ranking, and summarizing real football stat sheets — one short drive at a time.",
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
          exercises: [
            {
              type: "mc",
              prompt:
                "Our league database has three tables. Which one holds one row per player, per week, per season — the weekly scoring log?",
              options: ["week_results", "rosters", "waiver_wire", "playbook"],
              answer: 0,
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
          exercises: [
            {
              type: "mc",
              prompt:
                "week_results has 2,160 rows. You want a quick 10-row peek. Which clause caps the rows returned?",
              options: ["LIMIT", "CAP", "WHERE", "ORDER BY"],
              answer: 0,
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
          exercises: [
            {
              type: "mc",
              prompt:
                "Which clause filters rows — keeping only the ones that match a condition?",
              options: ["WHERE", "LIMIT", "SELECT", "FROM"],
              answer: 0,
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
          exercises: [
            {
              type: "mc",
              prompt: "Which clause sorts your results?",
              options: ["ORDER BY", "SORT BY", "GROUP BY", "RANK"],
              answer: 0,
              explain:
                "ORDER BY is the sorter. GROUP BY (next unit) squashes rows — different job entirely.",
            },
            {
              type: "mc",
              prompt:
                "You want the biggest scores at the top. Which direction keyword?",
              options: ["DESC", "ASC", "TOP", "DOWN"],
              answer: 0,
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
          exercises: [
            {
              type: "mc",
              prompt: "Which function counts how many rows matched?",
              options: ["COUNT(*)", "SUM(*)", "TOTAL()", "ROWS()"],
              answer: 0,
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
          exercises: [
            {
              type: "mc",
              prompt:
                "You want ONE row per player, each showing that player's total points. Which clause creates the per-player split?",
              options: ["GROUP BY", "ORDER BY", "SPLIT BY", "WHERE"],
              answer: 0,
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
          exercises: [
            {
              type: "mc",
              prompt:
                "WHERE filters rows before grouping. What filters the groups AFTER aggregation?",
              options: ["HAVING", "WHERE, again", "LIMIT", "FILTER BY"],
              answer: 0,
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
  ] as Unit[],
};

export const XP_PER_EXERCISE = 10;
export const XP_RETRY = 5;
export const PERFECT_BONUS = 20;

export function liveLessons(): { lesson: Lesson; unit: Unit }[] {
  return COURSE.units
    .filter((u) => u.status === "live")
    .flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, unit })));
}

export function getLesson(
  id: string,
): { lesson: Lesson; unit: Unit } | undefined {
  return liveLessons().find((entry) => entry.lesson.id === id);
}

export function nextLessonId(id: string): string | null {
  const all = liveLessons();
  const idx = all.findIndex((entry) => entry.lesson.id === id);
  if (idx === -1 || idx === all.length - 1) return null;
  return all[idx + 1].lesson.id;
}
