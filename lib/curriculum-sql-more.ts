/**
 * Remaining Foundations modules and the Analytics course, same grammar as f2.
 */

import type { FillExercise, Lesson, MCExercise, QueryExercise, Unit } from "./curriculum";
import { FACTS } from "./lesson-facts.generated";

function lesson(partial: Lesson): Lesson {
  return partial;
}
function mc(
  prompt: string,
  options: string[],
  answer: number,
  explain: string,
  code?: string,
): MCExercise {
  return code
    ? { type: "mc", prompt, code, options, answer, explain }
    : { type: "mc", prompt, options, answer, explain };
}
function fill(
  prompt: string,
  parts: (string | null)[],
  bank: string[],
  answer: string[],
  explain: string,
): FillExercise {
  return { type: "fill", prompt, parts, bank, answer, explain };
}
function query(
  prompt: string,
  starter: string,
  expected: string,
  hint: string,
  explain: string,
): QueryExercise {
  return {
    type: "query",
    prompt,
    starter,
    expected,
    orderMatters: false,
    hint,
    explain,
  };
}

export const SQL_MORE_UNITS: Unit[] = [
  {
    id: "sf-ddl",
    number: 13,
    title: "Creating & Modifying Tables",
    drive: "Up next",
    description: "Make a table and say which columns can't be empty.",
    skills: ["CREATE TABLE", "PRIMARY KEY"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-ddl-l1",
        title: "Name the table before the rows",
        blurb: "CREATE TABLE is the empty sheet. INSERT comes after.",
        brief: {
          goal: "Read a CREATE TABLE and know what it promises.",
          setup: "You need a place to store a two-column lookup you don't have yet.",
          steps: [
            {
              title: "A query can't read a table that isn't there",
              body: "week_results already exists. A new kind of note — say, a coach's tag per player — needs a new table. CREATE TABLE is how you declare it.",
            },
            {
              title: "Columns, types, and the column that identifies a row",
              body: "PRIMARY KEY means that value shows up once. NOT NULL means the cell can't be left blank.",
              code: "CREATE TABLE player_tags (\n  player TEXT PRIMARY KEY,\n  tag TEXT NOT NULL\n);",
            },
          ],
          previewSql: "SELECT player, team_name FROM rosters LIMIT 5;",
          previewCaption: "rosters was created the same way — columns, then rows",
        },
        intro: {
          title: "The grader won't run CREATE TABLE.",
          text: "DDL doesn't return rows, so you practice the statement here as text. In a database you'd create it, then INSERT, then SELECT.",
          code: "CREATE TABLE player_tags (\n  player TEXT PRIMARY KEY,\n  tag TEXT NOT NULL\n);",
        },
        exercises: [
          mc(
            "You CREATE TABLE and get no grid back. What now?",
            [
              "It failed",
              "CREATE doesn't return rows. SELECT from the new name to see if it exists.",
              "You have to DROP it and retry",
              "Columns only appear after the first report",
            ],
            1,
            "An empty result isn't proof of failure on a create. Query the table.",
          ),
          fill(
            "Declare player as the key, and tag as required text.",
            ["CREATE TABLE player_tags (\n  player TEXT ", null, ",\n  tag TEXT NOT NULL\n);"],
            ["PRIMARY KEY", "FOREIGN KEY", "INDEX", "UNION"],
            ["PRIMARY KEY"],
            "PRIMARY KEY on player means that name can appear once. FOREIGN KEY would point at a different table.",
          ),
          fill(
            "tag must be filled in.",
            ["tag TEXT ", null],
            ["NOT NULL", "NULL", "DEFAULT", "UNION"],
            ["NOT NULL"],
            "NOT NULL refuses a blank. DEFAULT would fill one in — that's a different promise.",
          ),
          mc(
            "Two rows with the same PRIMARY KEY. What should the database do?",
            [
              "Keep both",
              "Reject the second insert",
              "Average them",
              "Turn the key off",
            ],
            1,
            "A primary key is the row's identity. A second copy of it isn't a second row — it's a mistake, and the insert fails.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sf-clean",
    number: 14,
    title: "Data Cleaning With SQL",
    drive: "Up next",
    description: "Find the messy values before you report them.",
    skills: ["TRIM", "DISTINCT"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-clean-l1",
        title: "Spaces that break a match",
        blurb: "'Josh Allen' and 'Josh Allen ' are not the same name.",
        brief: {
          goal: "Strip stray spaces before you compare text.",
          setup: "A pasted export often arrives with spaces around names. Joins then miss.",
          steps: [
            {
              title: "It looks equal. It isn't.",
              body: "A trailing space is invisible in a spreadsheet cell and fatal in a join. The names stop matching and the player vanishes from the report.",
            },
            {
              title: "TRIM cuts space from both ends",
              body: "It doesn't delete letters. It only removes leading and trailing blanks.",
              code: "SELECT TRIM('  Josh Allen  ') AS player;",
            },
          ],
          previewSql: "SELECT TRIM('  Josh Allen  ') AS player;",
          previewCaption: "The spaces go. The name stays.",
        },
        intro: {
          title: "Clean the value in the query before you trust a match.",
          text: "TRIM on both sides of a comparison is the usual habit when you don't control the export. Our seeded tables are already clean — the lesson is the move, not a dirty row we hid in the data.",
          code: "SELECT TRIM(player) FROM week_results;",
        },
        exercises: [
          mc(
            "JOIN fails on a name you can see in both tables. What's the first thing to check?",
            [
              "The tables are the wrong type",
              "Invisible spaces or different capitalization",
              "COUNT is too high",
              "ORDER BY is missing",
            ],
            1,
            "A join is an exact match. A space or a case change is enough to miss.",
          ),
          fill(
            "Strip spaces from a pasted name.",
            ["SELECT ", null, "('  Josh Allen  ') AS player;"],
            ["TRIM", "CUT", "LEFT", "GROUP"],
            ["TRIM"],
            "TRIM is the function. LEFT would take characters, not spaces.",
          ),
          query(
            "This compares the raw columns. Trim both sides of the name compare.",
            "SELECT r.player\nFROM rosters r\nJOIN week_results w ON r.player = w.player;",
            "SELECT r.player\nFROM rosters r\nJOIN week_results w ON TRIM(r.player) = TRIM(w.player);",
            "Wrap both player columns in TRIM inside ON.",
            "Same join. The match is now on the name without edge spaces.",
          ),
          query(
            "List each distinct position from week_results, trimmed and uppercased, named pos.",
            "-- your query\n",
            "SELECT DISTINCT UPPER(TRIM(position)) AS pos FROM week_results;",
            "DISTINCT UPPER(TRIM(position))",
            "Clean first, then DISTINCT, or the same position with a space counts as two.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sf-debug",
    number: 15,
    title: "SQL Debugging",
    drive: "Up next",
    description: "An error is part of writing the query, not the end of it.",
    skills: ["Errors", "Ambiguous columns"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-debug-l1",
        title: "Read the error, then the query",
        blurb: "The message usually names the clause you actually broke.",
        brief: {
          goal: "Treat an error as information.",
          setup: "A query won't run. You need the next move, not a new query from scratch.",
          steps: [
            {
              title: "You don't start over",
              body: "The error is about one token. Find that token, fix that token, run it again. Rewriting the whole thing hides whether you understood the message.",
            },
            {
              title: "Which player? There are two.",
              body: "When both tables have player, player alone is ambiguous. Prefix it.",
              code: "-- ambiguous: both tables have player\nSELECT player FROM rosters r JOIN week_results w ON r.player = w.player;\n\n-- specific\nSELECT r.player FROM rosters r JOIN week_results w ON r.player = w.player;",
            },
          ],
          previewSql: "SELECT r.player FROM rosters r JOIN week_results w ON r.player = w.player LIMIT 5;",
          previewCaption: "The prefix tells SQL which player you meant",
        },
        intro: {
          title: "Getting an error isn't failing.",
          text: "Debugging is part of writing SQL. Read the message, find the clause it names, change one thing.",
          code: "SELECT r.player, w.week FROM rosters r JOIN week_results w ON r.player = w.player;",
        },
        exercises: [
          mc(
            "The error says the column player is ambiguous. What's the fix?",
            [
              "Delete one table",
              "Prefix it: r.player or w.player",
              "Add ORDER BY",
              "Change player to name in both tables first",
            ],
            1,
            "SQL can see two columns with that name. You have to say which one.",
            "SELECT player FROM rosters r JOIN week_results w ON r.player = w.player;",
          ),
          fill(
            "Take player from the roster side.",
            ["SELECT ", null, ".player FROM rosters r JOIN week_results w ON r.player = w.player;"],
            ["r", "w", "ON", "AS"],
            ["r"],
            "r is the alias for rosters. w would be the game log's player — same people, different role in the query.",
          ),
          query(
            "This errors because player is ambiguous. Fix the SELECT list only.",
            "SELECT player, w.week FROM rosters r JOIN week_results w ON r.player = w.player;",
            "SELECT r.player, w.week FROM rosters r JOIN week_results w ON r.player = w.player;",
            "Write r.player in the SELECT list.",
            "The join was fine. The bare name in the SELECT list was the problem.",
          ),
          query(
            "From scratch: team_name and week for rostered players' games. Prefix every column.",
            "-- your query\n",
            "SELECT r.team_name, w.week FROM rosters r JOIN week_results w ON r.player = w.player;",
            "r.team_name, w.week, and the join on r.player = w.player.",
            "Prefixes aren't decoration. They're how you stop the next ambiguous-column error.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-models",
    number: 1,
    title: "Advanced SQL Mental Models",
    drive: "Up next",
    description: "What one row means, and what a join does to that count.",
    skills: ["Grain", "Join multiplication"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-models-l1",
        title: "What one row is",
        blurb: "Before the query, say what a row in week_results represents.",
        brief: {
          goal: "Name the grain out loud.",
          setup: "Someone asks for 'points per player.' The table is not one row per player.",
          steps: [
            {
              title: "The sheet is games, not careers",
              body: "One row of week_results is one player in one week of one season. If you average fantasy_pts with no GROUP BY, you average games, not people.",
              previewSql: "SELECT player, season, week, fantasy_pts FROM week_results LIMIT 5;",
              previewCaption: "Five rows, five games — not five players",
            },
            {
              title: "State the grain before you aggregate",
              body: "GROUP BY player changes the grain to one row per player. That's a different question than the raw table.",
              code: "SELECT player, AVG(fantasy_pts) AS ppg\nFROM week_results\nGROUP BY player;",
            },
          ],
          previewSql: "SELECT player, ROUND(AVG(fantasy_pts), 1) AS ppg FROM week_results GROUP BY player LIMIT 5;",
          previewCaption: "Now the grain is a player, not a game",
        },
        intro: {
          title: "Grain is what one row means.",
          text: "Every mistake of 'the number looks too big' starts here. If you joined or grouped, the row in front of you might not be the row you think it is.",
          code: "SELECT player, season, week, fantasy_pts FROM week_results;",
        },
        exercises: [
          mc(
            "You SELECT AVG(fantasy_pts) with no GROUP BY. What did you average?",
            [
              "One number per player",
              "Every game row in the table — games, not careers",
              "Only 2024",
              "Only starters",
            ],
            1,
            "No GROUP BY means the whole set of rows is one bucket. Those rows are games.",
          ),
          fill(
            "Collapse to one row per player.",
            ["SELECT player, AVG(fantasy_pts) AS ppg FROM week_results ", null, " player;"],
            ["GROUP BY", "ORDER BY", "WHERE", "UNION"],
            ["GROUP BY"],
            "GROUP BY changes the grain. ORDER BY only sorts the rows you already have.",
          ),
          query(
            "This averages every game in the table. Average per player instead. Name it ppg.",
            "SELECT AVG(fantasy_pts) AS ppg FROM week_results;",
            "SELECT player, AVG(fantasy_pts) AS ppg FROM week_results GROUP BY player;",
            "Add player to the SELECT list and GROUP BY player.",
            "You changed the question from 'a typical game' to 'a typical game for each player.'",
          ),
          query(
            "One row per position in 2024, with how many games. Name the count games.",
            "-- your query\n",
            "SELECT position, COUNT(*) AS games FROM week_results WHERE season = 2024 GROUP BY position;",
            "GROUP BY position, WHERE season = 2024.",
            "The grain is a position-season, because you filtered the season before grouping.",
          ),
        ],
      }),
      lesson({
        id: "sa-models-l2",
        title: "Why the row count jumped",
        blurb: "A join multiplies when the other table has many matches.",
        brief: {
          goal: "Predict how many rows a join will return.",
          setup: "You joined one roster row to a season of games and suddenly have dozens of lines.",
          steps: [
            {
              title: "One player, many games",
              body: "Saquon Barkley is one roster row and many week_results rows. A join keeps every match. That's why the roster 'grows.' It didn't. You're looking at games now.",
            },
            {
              title: "Count before and after",
              body: "If the count after the join equals games-for-those-players, the join is doing its job. If it's way bigger, a key matched too loosely.",
              code: "SELECT r.player, w.week, w.fantasy_pts\nFROM rosters r\nJOIN week_results w ON r.player = w.player;",
            },
          ],
          previewSql:
            "SELECT r.player, COUNT(*) AS games FROM rosters r JOIN week_results w ON r.player = w.player GROUP BY r.player;",
          previewCaption: "Each rostered player, and how many game rows the join produced",
        },
        intro: {
          title: "Joins multiply. They don't look up once.",
          text: "One row on the left and five matches on the right become five rows. That's correct for a game log and wrong if you thought you were still counting managers.",
          code: "SELECT COUNT(*) FROM rosters r JOIN week_results w ON r.player = w.player;",
        },
        exercises: [
          mc(
            "One roster row joins to 17 weeks. How many result rows for that player?",
            ["1", "17", "0", "The size of week_results"],
            1,
            "Each matching week is its own output row. The roster row doesn't stay one row after the join.",
          ),
          fill(
            "Count how many game rows each rostered player becomes.",
            ["SELECT r.player, COUNT(*) AS games FROM rosters r JOIN week_results w ON r.player = w.player ", null, " r.player;"],
            ["GROUP BY", "WHERE", "UNION", "ORDER BY"],
            ["GROUP BY"],
            "You grouped back to the player so you can see the multiplication instead of scrolling it.",
          ),
          query(
            "This lists games. Summarize it: one row per rostered player, and a game count named games.",
            "SELECT r.player, w.week FROM rosters r JOIN week_results w ON r.player = w.player;",
            "SELECT r.player, COUNT(*) AS games FROM rosters r JOIN week_results w ON r.player = w.player GROUP BY r.player;",
            "GROUP BY r.player and COUNT(*).",
            "Same join. The grain went from games back to players, and the count tells you how many games you collapsed.",
          ),
          query(
            "Only 2024 games in that count. Same shape otherwise.",
            "-- your query\n",
            "SELECT r.player, COUNT(*) AS games FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 GROUP BY r.player;",
            "Add WHERE w.season = 2024 before GROUP BY.",
            "The filter cuts weeks before the count. The join can still multiply — just inside one season.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-agg",
    number: 4,
    title: "Advanced Aggregation",
    drive: "Up next",
    description: "Several totals in one pass, using CASE inside SUM.",
    skills: ["SUM of CASE", "Percent of total"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-agg-l1",
        title: "Count a slice without a second query",
        blurb: "Boom weeks and all weeks, in the same row.",
        brief: {
          goal: "Aggregate only the rows that pass a test.",
          setup: "Per player in 2024, how many games hit 20 points, next to how many games they played.",
          steps: [
            {
              title: "Two COUNTs would lose the pairing",
              body: "You can filter fantasy_pts >= 20 and count. That doesn't sit next to the player's total games unless you ask for both in one grouped row.",
            },
            {
              title: "CASE returns 1 or 0, and SUM adds the ones",
              body: "A true test contributes 1. A false test contributes 0. SUM of that is a count of the slice.",
              code: "SELECT player,\n       COUNT(*) AS games,\n       SUM(CASE WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END) AS booms\nFROM week_results\nWHERE season = 2024\nGROUP BY player;",
            },
          ],
          previewSql:
            "SELECT player, COUNT(*) AS games, SUM(CASE WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END) AS booms FROM week_results WHERE season = 2024 GROUP BY player LIMIT 5;",
          previewCaption: "Games and boom games, same row",
        },
        intro: {
          title: "SUM(CASE…) is a conditional count.",
          text: "SQLite here doesn't have FILTER or ROLLUP. This is the portable way to get a subtotal beside the total. The GROUP BY still decides the grain.",
          code: "SUM(CASE WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END)",
        },
        exercises: [
          mc(
            "A game scores 12. What does CASE WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END add for that row?",
            ["1", "0", "12", "NULL"],
            1,
            "12 fails the test, so the CASE is 0 and it doesn't count as a boom.",
          ),
          fill(
            "Add up the boom flags.",
            ["SUM(", null, " WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END) AS booms"],
            ["CASE", "WHERE", "COUNT", "IF"],
            ["CASE"],
            "CASE is the expression inside the SUM. WHERE would filter the whole group away.",
          ),
          query(
            "You have the game count. Add booms: games with at least 20 points in 2024, per player.",
            "SELECT player, COUNT(*) AS games FROM week_results WHERE season = 2024 GROUP BY player;",
            "SELECT player, COUNT(*) AS games, SUM(CASE WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END) AS booms FROM week_results WHERE season = 2024 GROUP BY player;",
            "Add the SUM(CASE…) column before FROM.",
            "COUNT stays the denominator. The CASE sum is the slice.",
          ),
          query(
            "Per position in 2024, games and the points those games scored, named pts.",
            "-- your query\n",
            "SELECT position, COUNT(*) AS games, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY position;",
            "GROUP BY position, SUM(fantasy_pts).",
            "Two aggregates, one grain. That's the whole move.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-joins",
    number: 5,
    title: "Advanced JOIN Strategies",
    drive: "Up next",
    description: "A table joined to itself, to compare a week with the next one.",
    skills: ["Self join"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-joins-l1",
        title: "This week beside next week",
        blurb: "Same player, two rows, by joining the table to itself.",
        brief: {
          goal: "Pair a row with a later row of the same player.",
          setup: "You want week N and week N+1 on one line for 2024.",
          steps: [
            {
              title: "LAG is one way. A self join is the other.",
              body: "You already can look backward with window functions. A self join does it by matching the table to a copy of itself, one week ahead.",
            },
            {
              title: "Alias the table twice",
              body: "a is this week. b is the following week. The ON clause says same player, same season, and b.week = a.week + 1.",
              code: "SELECT a.player, a.week, a.fantasy_pts, b.fantasy_pts AS next_pts\nFROM week_results a\nJOIN week_results b\n  ON a.player = b.player\n AND a.season = b.season\n AND b.week = a.week + 1\nWHERE a.season = 2024;",
            },
          ],
          previewSql:
            "SELECT a.player, a.week, a.fantasy_pts, b.fantasy_pts AS next_pts FROM week_results a JOIN week_results b ON a.player = b.player AND a.season = b.season AND b.week = a.week + 1 WHERE a.season = 2024 LIMIT 5;",
          previewCaption: "A week and the one after it",
        },
        intro: {
          title: "A self join needs two aliases or the names collide.",
          text: "Both sides are week_results. Without a and b, every column is ambiguous. The + 1 in the join is what makes it 'next week' instead of 'every week against every week.'",
          code: "ON a.player = b.player AND b.week = a.week + 1",
        },
        exercises: [
          mc(
            "You forget `b.week = a.week + 1` and only match on player. What do you get?",
            [
              "Each week next to the following week",
              "Every week of a player paired with every other week of that player",
              "One row per player",
              "An error",
            ],
            1,
            "That's a cross of all their weeks. The week condition is what keeps it sequential.",
          ),
          fill(
            "Match the next week, not the same week.",
            ["AND b.week = a.week ", null, " 1"],
            ["+", "=", "*", "AND"],
            ["+"],
            "Plus one. An equals sign there would look for a.week = a.week, which is a different (and wrong) shape.",
          ),
          query(
            "This pairs a player with all their own rows. Restrict b to the following week in the same season.",
            "SELECT a.player, a.week, b.week AS other_week\nFROM week_results a\nJOIN week_results b ON a.player = b.player;",
            "SELECT a.player, a.week, b.week AS other_week\nFROM week_results a\nJOIN week_results b ON a.player = b.player AND a.season = b.season AND b.week = a.week + 1;",
            "Add season equality and b.week = a.week + 1.",
            "Two extra conditions. The row count drops from 'every pair' to 'consecutive weeks.'",
          ),
          query(
            "2024 only. player, week, this week's points, and next week's points named next_pts.",
            "-- your query\n",
            "SELECT a.player, a.week, a.fantasy_pts, b.fantasy_pts AS next_pts FROM week_results a JOIN week_results b ON a.player = b.player AND a.season = b.season AND b.week = a.week + 1 WHERE a.season = 2024;",
            "Both aliases, the + 1, and WHERE a.season = 2024.",
            "Same pattern as the preview. You wrote it without the starter this time.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-sub",
    number: 6,
    title: "Advanced Subqueries",
    drive: "Up next",
    description: "A subquery that runs once per outer row.",
    skills: ["Correlated subquery"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-sub-l1",
        title: "Above your own average",
        blurb: "The bar is different for every player.",
        brief: {
          goal: "Compare each game to that player's own average.",
          setup: "A boom is relative. 15 points is quiet for some names and huge for others.",
          steps: [
            {
              title: "The league average is the wrong comparison",
              body: "You can filter above the table's average. That treats a running back and a kicker the same, and we don't even have kickers here — the point is the bar should move with the player.",
            },
            {
              title: "The inner query mentions the outer row",
              body: "w.player inside the subquery is the player of the row being tested. SQL re-runs the average for each of them.",
              code: "SELECT w.player, w.week, w.fantasy_pts\nFROM week_results w\nWHERE w.season = 2024\n  AND w.fantasy_pts > (\n    SELECT AVG(a.fantasy_pts) FROM week_results a\n    WHERE a.player = w.player AND a.season = 2024\n  );",
            },
          ],
          previewSql:
            "SELECT w.player, w.week, w.fantasy_pts FROM week_results w WHERE w.season = 2024 AND w.fantasy_pts > (SELECT AVG(a.fantasy_pts) FROM week_results a WHERE a.player = w.player AND a.season = 2024) LIMIT 5;",
          previewCaption: "Games that beat that player's own 2024 average",
        },
        intro: {
          title: "Correlated means the inside can see the outside.",
          text: "A plain subquery is computed once. This one is computed per player, because it uses w.player. It's correct and it's slower than a join to a grouped average — you'll meet that tradeoff in the performance module.",
          code: "WHERE a.player = w.player",
        },
        exercises: [
          mc(
            "The subquery uses w.player, and w is the outer query. Why does that matter?",
            [
              "It averages the whole league once",
              "The average is recomputed for the player on the row being tested",
              "It errors, outer aliases are invisible",
              "It only runs for week 1",
            ],
            1,
            "That's the correlation. Change the outer row and the inner average changes with it.",
          ),
          fill(
            "Tie the inner average to the outer player.",
            ["WHERE a.player = ", null, ".player AND a.season = 2024"],
            ["w", "a", "FROM", "AVG"],
            ["w"],
            "w is outside. a is inside. You point the inside at the outside.",
          ),
          query(
            "This compares every 2024 game to the season average of the whole table. Compare each game to that player's own 2024 average instead.",
            "SELECT w.player, w.week, w.fantasy_pts FROM week_results w WHERE w.season = 2024 AND w.fantasy_pts > (SELECT AVG(fantasy_pts) FROM week_results WHERE season = 2024);",
            "SELECT w.player, w.week, w.fantasy_pts FROM week_results w WHERE w.season = 2024 AND w.fantasy_pts > (SELECT AVG(a.fantasy_pts) FROM week_results a WHERE a.player = w.player AND a.season = 2024);",
            "Add WHERE a.player = w.player inside the subquery.",
            "The number on the right now depends on who's on the left.",
          ),
          query(
            "Same idea for 2023. Return player, week, fantasy_pts for games above that player's 2023 average.",
            "-- your query\n",
            "SELECT w.player, w.week, w.fantasy_pts FROM week_results w WHERE w.season = 2023 AND w.fantasy_pts > (SELECT AVG(a.fantasy_pts) FROM week_results a WHERE a.player = w.player AND a.season = 2023);",
            "Change both season tests to 2023.",
            "Copy the shape. Don't leave a 2024 hiding in the subquery or the bar is the wrong year.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-dates",
    number: 7,
    title: "Advanced Date & Time Analytics",
    drive: "Up next",
    description: "This database stores weeks, not timestamps. Dates still show up the day you export.",
    skills: ["date()", "date difference"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-dates-l1",
        title: "A date you can add to",
        blurb: "week_results has a week number. A calendar still matters.",
        brief: {
          goal: "Add days to a date inside SQL.",
          setup: "Week 1 isn't a date in this sheet. When an export has dates, this is the move.",
          steps: [
            {
              title: "We don't have a kickoff timestamp here",
              body: "season and week are integers on purpose. A lot of the warehouse extracts you get at work are actual dates. Practice on a date literal so the habit exists before the column does.",
            },
            {
              title: "date() plus a modifier",
              body: "SQLite returns the new calendar day as text. '+7 days' is a week later.",
              code: "SELECT date('2024-09-05', '+7 days') AS next_week;",
            },
          ],
          previewSql: "SELECT date('2024-09-05', '+7 days') AS next_week;",
          previewCaption: "September 5 plus a week",
        },
        intro: {
          title: "date() is a function, not a column we have.",
          text: "When a real timestamp lands, you wrap that column the same way. Until then, don't pretend week_results stores kickoff times.",
          code: "SELECT date('2024-09-05', '+7 days');",
        },
        exercises: [
          mc(
            "week_results can answer 'what day did they play' by itself?",
            [
              "Yes, the week column is a date",
              "No. week is an integer. You'd need a calendar table or a date column.",
              "Only in 2024",
              "Only for Sunday games",
            ],
            1,
            "The grain is a week number. A date question needs a date. We don't invent one in the prose.",
          ),
          fill(
            "A week after September 5, 2024.",
            ["SELECT date('2024-09-05', ", null, ") AS next_week;"],
            ["'+7 days'", "'+7 weeks'", "'WEEK'", "'P7D'"],
            ["'+7 days'"],
            "The modifier is a string SQLite understands. '+7 weeks' is not the spelling it uses.",
          ),
          query(
            "This returns the day itself. Return the day 14 days later, named later.",
            "SELECT date('2024-09-05') AS later;",
            "SELECT date('2024-09-05', '+14 days') AS later;",
            "Add the '+14 days' modifier.",
            "Same function, one modifier. That's the whole edit.",
          ),
          query(
            "How many days from 2024-09-05 to 2024-09-19? SQLite: CAST(julianday(end) - julianday(start) AS INT). Name it days.",
            "-- your query\n",
            "SELECT CAST(julianday('2024-09-19') - julianday('2024-09-05') AS INT) AS days;",
            "julianday of the later date minus julianday of the earlier one.",
            "julianday turns a date into a day count so subtraction means days, not a string mess.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-kpi",
    number: 8,
    title: "Analytical SQL",
    drive: "Up next",
    description: "A position's share of the season's points.",
    skills: ["Share of total"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-kpi-l1",
        title: "Share of the total",
        blurb: "Points per position, as a percent of all 2024 points.",
        brief: {
          goal: "Put a group's total beside the grand total.",
          setup: "Which positions produced the points, as a percent.",
          steps: [
            {
              title: "A SUM by position isn't a share",
              body: "You can total points per position. A manager still asks 'out of everything?' That needs the grand total on the same row.",
            },
            {
              title: "The window sum is the grand total, repeated",
              body: "SUM() OVER () after the GROUP BY sees the grouped rows, not the raw games.",
              code: "SELECT position,\n       SUM(fantasy_pts) AS pts,\n       ROUND(100.0 * SUM(fantasy_pts) / SUM(SUM(fantasy_pts)) OVER (), 1) AS pct\nFROM week_results\nWHERE season = 2024\nGROUP BY position;",
            },
          ],
          previewSql:
            "SELECT position, ROUND(SUM(fantasy_pts), 1) AS pts, ROUND(100.0 * SUM(fantasy_pts) / SUM(SUM(fantasy_pts)) OVER (), 1) AS pct FROM week_results WHERE season = 2024 GROUP BY position;",
          previewCaption: "Each position's points and its share of 2024",
        },
        intro: {
          title: "Percent of total is a group sum divided by every group sum.",
          text: "100.0 forces decimal division. SUM(SUM(...)) OVER () is ugly and it's the right tool: the inner SUM is the GROUP BY, the outer SUM adds those groups.",
          code: "100.0 * SUM(fantasy_pts) / SUM(SUM(fantasy_pts)) OVER ()",
        },
        exercises: [
          mc(
            "You divide two integers by accident, 1/2 in SQLite. What do you get?",
            ["0.5", "0", "1", "An error"],
            1,
            "Integer division truncates. 100.0 or a real column forces a decimal.",
          ),
          fill(
            "Turn the ratio into a percent.",
            ["ROUND(", null, " * SUM(fantasy_pts) / SUM(SUM(fantasy_pts)) OVER (), 1)"],
            ["100.0", "100", "AVG", "COUNT"],
            ["100.0"],
            "The .0 matters. A bare 100 can collapse the division back to integers.",
          ),
          query(
            "You have points per position for 2024. Add pct, one decimal, the share of all those points.",
            "SELECT position, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY position;",
            "SELECT position, SUM(fantasy_pts) AS pts, ROUND(100.0 * SUM(fantasy_pts) / SUM(SUM(fantasy_pts)) OVER (), 1) AS pct FROM week_results WHERE season = 2024 GROUP BY position;",
            "Add the ROUND(100.0 * … OVER (), 1) column.",
            "Same groups. The new column is each group's size relative to all groups.",
          ),
          query(
            "Same share, but only QB and WR rows. Position, pts, pct.",
            "-- your query\n",
            "SELECT position, SUM(fantasy_pts) AS pts, ROUND(100.0 * SUM(fantasy_pts) / SUM(SUM(fantasy_pts)) OVER (), 1) AS pct FROM week_results WHERE season = 2024 AND position IN ('QB', 'WR') GROUP BY position;",
            "Filter to QB and WR before grouping.",
            "The percent is now a share of QB+WR points, not of the whole league. The WHERE changed the total.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-cohort",
    number: 9,
    title: "Cohort & Retention Analysis",
    drive: "Up next",
    description: "Who showed up in a later season.",
    skills: ["First season", "Still around"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-cohort-l1",
        title: "Still in the sheet next year",
        blurb: "A cohort is the season a player first appears. Retention is whether they're back.",
        brief: {
          goal: "Find players who have both a 2023 row and a 2024 row.",
          setup: "Who from 2023 is still producing games in 2024.",
          steps: [
            {
              title: "Retention isn't a vibe",
              body: "You have game rows across seasons. A player is 'back' if their name exists in both years. That's a set question, not a new table.",
            },
            {
              title: "IN against a one-column list of 2024 names",
              body: "Start from 2023 names, keep those that appear in the 2024 list.",
              code: "SELECT DISTINCT player\nFROM week_results\nWHERE season = 2023\n  AND player IN (SELECT player FROM week_results WHERE season = 2024);",
            },
          ],
          previewSql:
            "SELECT DISTINCT player FROM week_results WHERE season = 2023 AND player IN (SELECT player FROM week_results WHERE season = 2024) ORDER BY player LIMIT 5;",
          previewCaption: "A few names that exist in both seasons",
        },
        intro: {
          title: "This is retention on a sports sheet.",
          text: "A manager cohort works the same way when you have a row per week they set a lineup. We don't have that table. Player-seasons are the version this database can actually answer.",
          code: "WHERE season = 2023 AND player IN (SELECT player FROM week_results WHERE season = 2024)",
        },
        exercises: [
          mc(
            "A player has only 2024 rows. Are they in this 'still around' list?",
            ["Yes", "No — they weren't in the 2023 cohort", "Only if they're a QB", "Only if points exceed 100"],
            1,
            "The outer query starts in 2023. Arriving later means they were never in that cohort.",
          ),
          fill(
            "Keep 2023 players who also appear in 2024.",
            ["WHERE season = 2023 AND player ", null, " (SELECT player FROM week_results WHERE season = 2024)"],
            ["IN", "JOIN", "=", "ON"],
            ["IN"],
            "IN checks membership in the later season. A join would also work and might duplicate weeks.",
          ),
          query(
            "This lists everyone in 2023. Keep only names that also have a 2024 row, one row per name.",
            "SELECT player FROM week_results WHERE season = 2023;",
            "SELECT DISTINCT player FROM week_results WHERE season = 2023 AND player IN (SELECT player FROM week_results WHERE season = 2024);",
            "DISTINCT, and IN a 2024 subquery.",
            "DISTINCT matters. Without it you get one row per 2023 game, not per player.",
          ),
          query(
            "Players who appear in 2022 and also in 2024. One row per name.",
            "-- your query\n",
            "SELECT DISTINCT player FROM week_results WHERE season = 2022 AND player IN (SELECT player FROM week_results WHERE season = 2024);",
            "Same IN shape. The outer season is 2022.",
            "You moved the cohort year. The test is still 'also in the later season.'",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-case",
    number: 10,
    title: "Advanced CASE & Conditional Logic",
    drive: "Up next",
    description: "Three buckets, in order, so the first match wins.",
    skills: ["CASE order"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-case-l1",
        title: "The first true WHEN wins",
        blurb: "Put the strict test first or every boom week is labeled 'fine.'",
        brief: {
          goal: "Bucket points into boom, fine, and quiet.",
          setup: "One word per game, three levels.",
          steps: [
            {
              title: "Order is the bug",
              body: "If you test >= 10 before >= 20, a 25-point week matches 'fine' and never sees 'boom.' CASE stops.",
            },
            {
              title: "Strictest test on top",
              body: "THEN the label, ELSE the leftovers, END closes it.",
              code: "SELECT player, fantasy_pts,\n       CASE\n         WHEN fantasy_pts >= 20 THEN 'boom'\n         WHEN fantasy_pts >= 10 THEN 'fine'\n         ELSE 'quiet'\n       END AS band\nFROM week_results;",
            },
          ],
          previewSql:
            "SELECT player, fantasy_pts, CASE WHEN fantasy_pts >= 20 THEN 'boom' WHEN fantasy_pts >= 10 THEN 'fine' ELSE 'quiet' END AS band FROM week_results LIMIT 5;",
          previewCaption: "A band next to the score",
        },
        intro: {
          title: "Write the WHEN clauses in the order you want them tried.",
          text: "It isn't a set of equals tests that all apply. It's a staircase. Top step first.",
          code: "WHEN fantasy_pts >= 20 THEN 'boom'",
        },
        exercises: [
          mc(
            "WHEN >= 10 comes before WHEN >= 20. A 25-point game is labeled?",
            ["boom", "fine", "quiet", "both"],
            1,
            "25 is >= 10, so CASE stops on the first branch and never reaches boom.",
            "CASE WHEN fantasy_pts >= 10 THEN 'fine' WHEN fantasy_pts >= 20 THEN 'boom' ELSE 'quiet' END",
          ),
          fill(
            "Close the CASE.",
            ["CASE WHEN fantasy_pts >= 20 THEN 'boom' ELSE 'quiet' ", null],
            ["END", "DONE", "AS", "THEN"],
            ["END"],
            "END closes the CASE. AS names it, and that comes after END.",
          ),
          query(
            "Two bands aren't enough. Add a middle: >= 20 boom, >= 10 fine, else quiet. Column name band. Keep player and fantasy_pts.",
            "SELECT player, fantasy_pts, CASE WHEN fantasy_pts >= 20 THEN 'boom' ELSE 'quiet' END AS band FROM week_results;",
            "SELECT player, fantasy_pts, CASE WHEN fantasy_pts >= 20 THEN 'boom' WHEN fantasy_pts >= 10 THEN 'fine' ELSE 'quiet' END AS band FROM week_results;",
            "Insert WHEN fantasy_pts >= 10 THEN 'fine' before ELSE.",
            "The new WHEN has to sit below the stricter one.",
          ),
          query(
            "Positions: 'QB' stays 'QB'. 'RB' stays 'RB'. Anything else is 'pass.' Column name group_name, with player.",
            "-- your query\n",
            "SELECT player, CASE WHEN position = 'QB' THEN 'QB' WHEN position = 'RB' THEN 'RB' ELSE 'pass' END AS group_name FROM week_results;",
            "Two WHENs and an ELSE.",
            "Same staircase, now on text. Order doesn't matter here only because the tests don't overlap.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-xform",
    number: 11,
    title: "Advanced Cleaning & Transformation",
    drive: "Up next",
    description: "Find names that show up more than once when they shouldn't.",
    skills: ["HAVING COUNT"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-xform-l1",
        title: "Names that repeat on the roster",
        blurb: "A player listed twice is a dirty roster, not two players.",
        brief: {
          goal: "List values that occur more than once.",
          setup: "Check whether any player sits on more than one roster row.",
          steps: [
            {
              title: "You want the duplicates, not the roster",
              body: "SELECT player FROM rosters shows everyone. You want the names that appear twice. That's a group, then a filter on the count.",
            },
            {
              title: "HAVING filters groups. WHERE filters rows.",
              body: "You can't WHERE COUNT(*) > 1. The count doesn't exist until after the group.",
              code: "SELECT player, COUNT(*) AS n\nFROM rosters\nGROUP BY player\nHAVING COUNT(*) > 1;",
            },
          ],
          previewSql: "SELECT player, COUNT(*) AS n FROM week_results WHERE season = 2024 GROUP BY player HAVING COUNT(*) > 16;",
          previewCaption: "2024 players with more than 16 logged games — a sanity check, not a moral one",
        },
        intro: {
          title: "HAVING is WHERE, after the aggregate.",
          text: "If nobody is listed twice, the roster query returns no rows. That's a clean table, not a broken query. The week_results version is the one that returns rows, because players play many games.",
          code: "GROUP BY player\nHAVING COUNT(*) > 1",
        },
        exercises: [
          mc(
            "WHERE COUNT(*) > 1 fails. Why?",
            [
              "COUNT is illegal",
              "WHERE runs before groups exist, so there's nothing to count yet",
              "You need a semicolon first",
              "COUNT only works in SELECT",
            ],
            1,
            "Filter rows with WHERE. Filter groups with HAVING.",
          ),
          fill(
            "Keep groups bigger than one.",
            ["GROUP BY player ", null, " COUNT(*) > 1"],
            ["HAVING", "WHERE", "ORDER", "UNION"],
            ["HAVING"],
            "HAVING follows GROUP BY. WHERE would have to come earlier, and it can't see the count.",
          ),
          query(
            "Count each player's 2024 games, and keep only players with more than 16. Name the count games.",
            "SELECT player, COUNT(*) AS games FROM week_results WHERE season = 2024 GROUP BY player;",
            "SELECT player, COUNT(*) AS games FROM week_results WHERE season = 2024 GROUP BY player HAVING COUNT(*) > 16;",
            "Add HAVING COUNT(*) > 16 at the end.",
            "The groups are still players. You just dropped the ones with 16 or fewer games.",
          ),
          query(
            "Players whose 2024 point total is over 200. Return player and total named pts.",
            "-- your query\n",
            "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player HAVING SUM(fantasy_pts) > 200;",
            "HAVING SUM(fantasy_pts) > 200",
            "Same shape as the count filter. The aggregate in HAVING should match the one you selected.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-temp",
    number: 12,
    title: "Temporary Tables & Intermediate Data",
    drive: "Up next",
    description: "Save a step so the next query doesn't recompute it.",
    skills: ["CREATE TEMP TABLE"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-temp-l1",
        title: "Park a result",
        blurb: "A temp table is a CTE that outlives one statement.",
        brief: {
          goal: "Know when you'd materialize, and the statement that does it.",
          setup: "You're about to use the same 2024 totals in four queries.",
          steps: [
            {
              title: "A CTE dies when the query ends",
              body: "WITH is great for one statement. The next statement can't see it. A temporary table can.",
            },
            {
              title: "CREATE TEMP TABLE AS SELECT",
              body: "It runs the query and stores the rows for this session. It isn't shared with the next person, and it isn't your warehouse.",
              code: "CREATE TEMP TABLE season_2024 AS\nSELECT player, SUM(fantasy_pts) AS pts\nFROM week_results\nWHERE season = 2024\nGROUP BY player;",
            },
          ],
          previewSql:
            "SELECT player, ROUND(SUM(fantasy_pts), 1) AS pts FROM week_results WHERE season = 2024 GROUP BY player LIMIT 5;",
          previewCaption: "The totals you'd park, if this session allowed a temp table in the grader",
        },
        intro: {
          title: "We grade the SELECT, not the CREATE.",
          text: "Temp tables don't return a grid of their own. Write the SELECT that would fill one, and remember CREATE TEMP TABLE AS in front of it when you have a real session.",
          code: "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player;",
        },
        exercises: [
          mc(
            "You need the same totals in the next query, not just this one. What fits?",
            [
              "A CTE — it stays around",
              "A temporary table in this session",
              "Another window function",
              "A comment",
            ],
            1,
            "A CTE is one statement. A temp table lasts for the connection.",
          ),
          fill(
            "Store a query as a temp table named season_2024.",
            ["CREATE TEMP TABLE season_2024 ", null, "\nSELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player;"],
            ["AS", "WITH", "INTO", "FROM"],
            ["AS"],
            "AS SELECT is the pattern. WITH would start a CTE, not a table.",
          ),
          query(
            "Write the SELECT that belongs inside that temp table: player and 2024 points, named pts.",
            "-- the body, not the CREATE\n",
            "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player;",
            "GROUP BY player, SUM(fantasy_pts).",
            "This is the result you'd reuse. The CREATE line is ceremony around it.",
          ),
          query(
            "Same totals, only WR rows.",
            "-- your query\n",
            "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 AND position = 'WR' GROUP BY player;",
            "AND position = 'WR'",
            "One extra filter. That's a different temp table, not a different idea.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-perf",
    number: 14,
    title: "SQL Performance & Optimization",
    drive: "Up next",
    description: "Do less work. Filter before you join when you can.",
    skills: ["Filter early"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-perf-l1",
        title: "Don't join years you don't need",
        blurb: "A 2024 question shouldn't drag 2022 along for the ride.",
        brief: {
          goal: "Put the year filter where it shrinks the join.",
          setup: "Rostered players' 2024 games only.",
          steps: [
            {
              title: "The wrong shape still returns the right rows",
              body: "You can join every season and throw years away at the end. The answer matches. You just built a bigger intermediate set than the question needed.",
            },
            {
              title: "Put 2024 in the join or a WHERE on the game table",
              body: "The rows that don't qualify never get stitched.",
              code: "SELECT r.player, w.week, w.fantasy_pts\nFROM rosters r\nJOIN week_results w\n  ON r.player = w.player AND w.season = 2024;",
            },
          ],
          previewSql:
            "SELECT r.player, w.week, w.fantasy_pts FROM rosters r JOIN week_results w ON r.player = w.player AND w.season = 2024 LIMIT 5;",
          previewCaption: "2024 games for rostered players",
        },
        intro: {
          title: "Correct and fast aren't the same question.",
          text: `On ${FACTS.rows} rows you won't feel it. On ${FACTS.rows} million you will. Filtering in ON for the right-hand table is the habit.`,
          code: "ON r.player = w.player AND w.season = 2024",
        },
        exercises: [
          mc(
            "Both queries return 2024 roster games. Which one joins fewer rows on the way?",
            [
              "Join all seasons, then WHERE season = 2024",
              "Put season = 2024 in the ON clause so those rows never join",
              "No difference, ever",
              "SELECT * is faster",
            ],
            1,
            "The results can match while the work doesn't. The ON filter throws years out before the match.",
          ),
          fill(
            "Only stitch 2024 games.",
            ["ON r.player = w.player AND w.season ", null, " 2024"],
            ["=", ">", "IN", "IS"],
            ["="],
            "Equality on the year. A greater-than would keep later seasons too.",
          ),
          query(
            "This joins every season. Restrict the join to 2024.",
            "SELECT r.player, w.week FROM rosters r JOIN week_results w ON r.player = w.player;",
            "SELECT r.player, w.week FROM rosters r JOIN week_results w ON r.player = w.player AND w.season = 2024;",
            "Add AND w.season = 2024 inside ON.",
            "Same columns. A smaller right-hand side.",
          ),
          query(
            "2024, running backs only, player and week. Still from rosters joined to week_results.",
            "-- your query\n",
            "SELECT r.player, w.week FROM rosters r JOIN week_results w ON r.player = w.player AND w.season = 2024 AND w.position = 'RB';",
            "Both tests in the ON clause.",
            "Each AND shrinks the match. Don't leave them for a cleanup step you'll forget.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-tx",
    number: 16,
    title: "Transactions & Concurrency",
    drive: "Up next",
    description: "A group of writes that should land together or not at all.",
    skills: ["BEGIN", "COMMIT", "ROLLBACK"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-tx-l1",
        title: "All of it or none of it",
        blurb: "Two updates that belong together should not half-finish.",
        brief: {
          goal: "Name the three statements that wrap a change.",
          setup: "You're moving a player off the wire and onto a roster. Both writes must happen.",
          steps: [
            {
              title: "Halfway is a corrupt league",
              body: "If the delete succeeds and the insert fails, the player is gone from both places. A transaction says those two writes are one story.",
            },
            {
              title: "BEGIN, then the writes, then COMMIT — or ROLLBACK",
              body: "COMMIT keeps them. ROLLBACK pretends they didn't happen.",
              code: "BEGIN;\n-- INSERT and DELETE here\nCOMMIT;",
            },
          ],
          previewSql: "SELECT player FROM rosters;",
          previewCaption: "A roster change would be one of those writes",
        },
        intro: {
          title: "We don't run transactions in the grader.",
          text: "You still need the words. BEGIN opens. COMMIT saves. ROLLBACK undoes, back to BEGIN. If you close the laptop before COMMIT, a careful database rolls back.",
          code: "BEGIN;\nCOMMIT;\nROLLBACK;",
        },
        exercises: [
          mc(
            "The insert worked and the delete hit an error. You want neither change kept. What do you run?",
            ["COMMIT", "ROLLBACK", "SELECT", "DROP TABLE"],
            1,
            "ROLLBACK throws away the uncommitted work. COMMIT would keep the half that succeeded.",
          ),
          fill(
            "Open a transaction.",
            [null, ";"],
            ["BEGIN", "OPEN", "START TRANSACTION", "COMMIT"],
            ["BEGIN"],
            "BEGIN is the SQLite spelling you'll see here. COMMIT is the other end.",
          ),
          fill(
            "Keep the writes.",
            [null, ";"],
            ["COMMIT", "ROLLBACK", "END LOOP", "SAVE"],
            ["COMMIT"],
            "COMMIT makes them durable. ROLLBACK is the undo, not the save.",
          ),
          mc(
            "Another session updates the same row before you commit. What idea is that?",
            [
              "A syntax error",
              "Concurrency — two people in the same table",
              "A bad SELECT",
              "Grain",
            ],
            1,
            "Transactions exist because you are not the only writer. Locks and isolation are how the database keeps those updates from stepping on each other.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-model",
    number: 17,
    title: "Database Design & Data Modeling",
    drive: "Up next",
    description: "A fact table holds events. A dimension holds the things those events are about.",
    skills: ["Fact", "Dimension"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-model-l1",
        title: "Games in one table, names in another",
        blurb: "week_results is a fact table. The player is an attribute that could have lived alone.",
        brief: {
          goal: "Tell a fact row from a dimension row.",
          setup: "Someone wants to add a player's height to every game row. Think before you repeat it.",
          steps: [
            {
              title: "Height doesn't change every week",
              body: "A game score does. If you paste height onto all 17 weeks, you update it in 17 places when you had one fact about the person.",
            },
            {
              title: "Events in the fact table. Descriptions beside it.",
              body: "week_results records events: who, which week, how many points. A player table would hold the slow stuff, once.",
              code: "-- fact grain: one player-week\nSELECT player, season, week, fantasy_pts FROM week_results;",
            },
          ],
          previewSql: "SELECT player, season, week, fantasy_pts FROM week_results LIMIT 5;",
          previewCaption: "Event rows. Not a biography.",
        },
        intro: {
          title: "Don't repeat a fact that isn't about the event.",
          text: "That's the practical version of normalization. Star schemas do this on purpose: a thin fact table, and dimension tables you join when you need a name or a team.",
          code: "SELECT player, season, week, fantasy_pts FROM week_results;",
        },
        exercises: [
          mc(
            "Where does 'this week's points' belong?",
            [
              "A player dimension, once",
              "A fact table whose grain is the player-week",
              "A column named notes",
              "The file name",
            ],
            1,
            "Points change every week. That's an event. The fact table's grain is that event.",
          ),
          fill(
            "The grain of week_results, in the comment you should be able to say.",
            ["-- one player, one ", null],
            ["week", "career", "team", "column"],
            ["week"],
            "One player-week. If you say 'one player,' every aggregate you write next will be wrong.",
          ),
          query(
            "Show the fact grain explicitly: player, season, week, points. Don't aggregate.",
            "SELECT * FROM week_results;",
            "SELECT player, season, week, fantasy_pts FROM week_results;",
            "Name the four columns. Drop the star.",
            "You asked for the event, not every attribute the table happens to carry.",
          ),
          query(
            "One row per player with how many fact rows they have, named games. That's the dimension-side question.",
            "-- your query\n",
            "SELECT player, COUNT(*) AS games FROM week_results GROUP BY player;",
            "GROUP BY player.",
            "You rolled the events up to the person. Different grain, different question.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-wh",
    number: 18,
    title: "Data Warehousing",
    drive: "Up next",
    description: "Yesterday's games land in the table you query today.",
    skills: ["Load", "Grain check"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-wh-l1",
        title: "Did the week land",
        blurb: "A load check is a query, not a feeling.",
        brief: {
          goal: "Count rows for a week you expect to exist.",
          setup: "After an ingest, you want to know 2024 week 1 is actually in the table.",
          steps: [
            {
              title: "The pipeline said it finished",
              body: "Pipelines lie by omission. They load 0 rows and still exit green. Your job is a query that would be wrong if the week were missing.",
            },
            {
              title: "Count that week",
              body: "If the number is 0, the week didn't land. If it's wild compared to last week, something duplicated.",
              code: "SELECT COUNT(*) AS games\nFROM week_results\nWHERE season = 2024 AND week = 1;",
            },
          ],
          previewSql: "SELECT season, week, COUNT(*) AS games FROM week_results GROUP BY season, week ORDER BY season, week LIMIT 5;",
          previewCaption: "Row counts by week — the smallest data-quality check",
        },
        intro: {
          title: "A warehouse is a table with a load history.",
          text: "ETL or ELT is how rows get there. You don't need the tool's name to check the result. Count the grain you expected.",
          code: "SELECT season, week, COUNT(*) AS games FROM week_results GROUP BY season, week;",
        },
        exercises: [
          mc(
            "The load job exited without an error and week 1 has 0 rows. Did the week arrive?",
            ["Yes, because the job was green", "No. Zero rows means it isn't there.", "Only if week is NULL", "Yes if the table exists"],
            1,
            "Green means the script finished. It doesn't mean the rows you wanted are in the table.",
          ),
          fill(
            "Count 2024 week 1.",
            ["SELECT COUNT(*) AS games FROM week_results WHERE season = 2024 AND week ", null, " 1;"],
            ["=", ">", "IN", "IS"],
            ["="],
            "Equals the week you expected. A range would hide a hole inside it.",
          ),
          query(
            "Count games for every season-week, named games.",
            "SELECT * FROM week_results;",
            "SELECT season, week, COUNT(*) AS games FROM week_results GROUP BY season, week;",
            "GROUP BY season, week.",
            "One row per week you have. A missing week is a missing row in this result, which is the point.",
          ),
          query(
            "Which players logged more than 16 games in a single season? Return player, season, and games.",
            "-- a full regular season is 17 or 18; more than 16 is everyone who barely missed time\n",
            "SELECT player, season, COUNT(*) AS games FROM week_results GROUP BY player, season HAVING COUNT(*) > 16;",
            "GROUP BY player, season HAVING COUNT(*) > 16.",
            "Sixteen is the check you can actually run on this sheet. A true double-load would clear it easily. If the list is the healthy seasons, the count is telling you the grain is one game, not one duplicate.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-json",
    number: 19,
    title: "JSON & Semi-Structured Data",
    drive: "Up next",
    description: "A blob of JSON is not a column until you pull the field out.",
    skills: ["json_extract"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-json-l1",
        title: "Pull one field out of a blob",
        blurb: "The API sent you a document. You wanted a team abbreviation.",
        brief: {
          goal: "Read a field from a JSON string.",
          setup: "week_results doesn't store JSON. Exports often do. Practice on a literal so the function is familiar.",
          steps: [
            {
              title: "You can't GROUP BY a blob",
              body: "If team is buried inside text, it isn't a column. You extract it, then the rest of SQL works.",
            },
            {
              title: "json_extract and a path",
              body: "$.team means the team field at the top of the object.",
              code: "SELECT json_extract('{\"team\":\"KC\",\"week\":1}', '$.team') AS team;",
            },
          ],
          previewSql: "SELECT json_extract('{\"team\":\"KC\",\"week\":1}', '$.team') AS team;",
          previewCaption: "The team field, now a normal value",
        },
        intro: {
          title: "Extract, then use the result like any column.",
          text: "Our tables aren't JSON. The function still matters the first time an API dump lands in a text column. If this engine didn't ship JSON, the query would error — it does ship it.",
          code: "json_extract('{\"team\":\"KC\"}', '$.team')",
        },
        exercises: [
          mc(
            "json_extract(doc, '$.week') on {\"team\":\"KC\",\"week\":1} returns?",
            ["KC", "1", "The whole document", "NULL, because week is a number"],
            1,
            "$.week is the week field. $.team would be KC. The type comes along; you can still compare it.",
          ),
          fill(
            "Pull team out of the document.",
            ["SELECT json_extract('{\"team\":\"KC\"}', ", null, ") AS team;"],
            ["'$.team'", "'team'", "'$.week'", "'*'"],
            ["'$.team'"],
            "The path starts with $. That's the root. team alone is not a path.",
          ),
          query(
            "This returns the whole string. Return just the week field, named week.",
            "SELECT '{\"team\":\"KC\",\"week\":1}' AS doc;",
            "SELECT json_extract('{\"team\":\"KC\",\"week\":1}', '$.week') AS week;",
            "json_extract(..., '$.week') AS week",
            "You threw away the document and kept the field the question asked for.",
          ),
          query(
            "Pull both fields: team and week, from '{\"team\":\"BUF\",\"week\":3}'.",
            "-- your query\n",
            "SELECT json_extract('{\"team\":\"BUF\",\"week\":3}', '$.team') AS team, json_extract('{\"team\":\"BUF\",\"week\":3}', '$.week') AS week;",
            "Two json_extract calls, two paths.",
            "Each field is its own expression. There isn't a SELECT * for the inside of a string.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-stack",
    number: 20,
    title: "SQL + Python + BI",
    drive: "Up next",
    description: "The query shapes the rows. Python and a dashboard consume them.",
    skills: ["The handoff"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-stack-l1",
        title: "Finish the shape in SQL",
        blurb: "Don't drag raw games into pandas to do a GROUP BY you could have written.",
        brief: {
          goal: "Write the query a notebook should receive.",
          setup: "A chart wants one row per player for 2024, with points. Not 300 game rows.",
          steps: [
            {
              title: "The chart doesn't want the grain of the warehouse",
              body: "pandas can group. So can SQL, closer to the data, without shipping every game to your laptop.",
            },
            {
              title: "Hand off the grain the chart uses",
              body: "One row per player, points already summed. The notebook plots. It doesn't re-implement the warehouse.",
              code: "SELECT player, SUM(fantasy_pts) AS pts\nFROM week_results\nWHERE season = 2024\nGROUP BY player;",
            },
          ],
          previewSql:
            "SELECT player, ROUND(SUM(fantasy_pts), 1) AS pts FROM week_results WHERE season = 2024 GROUP BY player LIMIT 5;",
          previewCaption: "The frame you'd load — already aggregated",
        },
        intro: {
          title: "SQL, then the tool.",
          text: "Tableau, Power BI, and pandas all get expensive when they scan rows you could have filtered. Do the GROUP BY here. Let the next tool draw.",
          code: "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player;",
        },
        exercises: [
          mc(
            "A dashboard is slow and it's scanning every game just to show season totals. What's the first fix?",
            [
              "A bigger laptop",
              "Aggregate in SQL and point the dashboard at that result",
              "SELECT * so the tool has options",
              "Remove the filters",
            ],
            1,
            "Move the grain change next to the data. The dashboard should receive the shape it displays.",
          ),
          fill(
            "Season totals, one row per player.",
            ["SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 ", null, " player;"],
            ["GROUP BY", "ORDER BY", "UNION", "INTO"],
            ["GROUP BY"],
            "GROUP BY is the handoff. ORDER BY is optional decoration for the chart.",
          ),
          query(
            "This is every 2024 game. Change it to one row per player, total points named pts.",
            "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024;",
            "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player;",
            "Drop week, sum the points, group by player.",
            "The chart's grain isn't the warehouse's grain. You changed it on purpose.",
          ),
          query(
            "Same handoff, plus the position, so the chart can color by it.",
            "-- your query\n",
            "SELECT player, position, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player, position;",
            "GROUP BY player, position.",
            "If you select position you have to group by it. Otherwise the database doesn't know which position a summed player should wear.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-risk",
    number: 21,
    title: "SQL for Fraud, Risk & Anomaly Detection",
    drive: "Up next",
    description: "A row that doesn't fit the pattern. No betting, no odds.",
    skills: ["Outlier weeks"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-risk-l1",
        title: "A week that doesn't look like the others",
        blurb: "Flag games that cleared 30 points. That's a rule, not a model.",
        brief: {
          goal: "Write a rule that surfaces odd rows.",
          setup: "You want 2024 games at or above 30 points, to read them, not to bet them.",
          steps: [
            {
              title: "Start with a rule you can explain",
              body: "Anomaly detection in SQL often starts as a threshold. If you can't say the rule in a sentence, you can't defend the flag.",
            },
            {
              title: "Filter, and keep the identity columns",
              body: "A flag without the player and the week is useless. Someone has to go look.",
              code: "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE season = 2024 AND fantasy_pts >= 30;",
            },
          ],
          previewSql:
            "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts >= 30 ORDER BY fantasy_pts DESC LIMIT 5;",
          previewCaption: "The loud 2024 weeks — a rule, not a prediction",
        },
        intro: {
          title: "A rule you can explain beats a score you can't.",
          text: "Thresholds, duplicate keys, and counts that jump are the SQL version of anomaly detection. We don't have accounts, devices, or odds in this database, and we aren't adding them.",
          code: "WHERE season = 2024 AND fantasy_pts >= 30",
        },
        exercises: [
          mc(
            "A 31-point week is flagged and a 29-point week isn't. What failed?",
            [
              "The model",
              "Nothing. The rule was >= 30. Edit the rule if the cutoff is wrong.",
              "The join",
              "NULL handling",
            ],
            1,
            "A threshold is blunt. That's why you pick it on purpose and why you write it down.",
          ),
          fill(
            "Flag games at or above 30.",
            ["WHERE season = 2024 AND fantasy_pts ", null, " 30"],
            [">=", ">", "!=", "IS"],
            [">="],
            ">= includes the line you named. > 30 would drop a row that landed on it.",
          ),
          query(
            "This is every 2024 game. Keep the ones at or above 30 points. player, week, fantasy_pts.",
            "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024;",
            "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts >= 30;",
            "Add AND fantasy_pts >= 30.",
            "You didn't score anyone. You listed the weeks that tripped a rule.",
          ),
          query(
            "How many such games did each player have in 2024? Name the count flags. Only players with at least one.",
            "-- your query\n",
            "SELECT player, COUNT(*) AS flags FROM week_results WHERE season = 2024 AND fantasy_pts >= 30 GROUP BY player;",
            "COUNT and GROUP BY player, with the same WHERE.",
            "The filter happens before the group, so players with zero flags never appear. That's what you want for a review list.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-biz",
    number: 22,
    title: "SQL for Business Analytics",
    drive: "Up next",
    description: "Start from the sentence someone said, then the query.",
    skills: ["Question to SQL"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-biz-l1",
        title: "Who led 2024",
        blurb: "The sentence is 'who scored the most points in 2024.' The SQL is a sum, a group, and a sort.",
        brief: {
          goal: "Turn one plain question into a query.",
          setup: "A manager asked who led the 2024 season. They want names and totals, best first.",
          steps: [
            {
              title: "Don't open with SELECT",
              body: "Say the grain: one row per player. Say the measure: sum of points. Say the filter: 2024. Say the order: biggest first. Then write it.",
            },
            {
              title: "Grain, measure, filter, order",
              body: "That list becomes GROUP BY, SUM, WHERE, ORDER BY.",
              code: "SELECT player, SUM(fantasy_pts) AS pts\nFROM week_results\nWHERE season = 2024\nGROUP BY player\nORDER BY pts DESC;",
            },
          ],
          previewSql:
            "SELECT player, ROUND(SUM(fantasy_pts), 1) AS pts FROM week_results WHERE season = 2024 GROUP BY player ORDER BY pts DESC LIMIT 5;",
          previewCaption: "The 2024 leaderboard, five names",
        },
        intro: {
          title: "The question decides the clauses, not the other way around.",
          text: "If you can't point at the word in the question that became the WHERE, you guessed. Write the sentence down next to the query when you hand work over.",
          code: "GROUP BY player\nORDER BY pts DESC",
        },
        exercises: [
          mc(
            "'Who scored the most in 2024' is missing a tie-break. Why does that matter for LIMIT 1?",
            [
              "It doesn't",
              "Two players can share the top total, and LIMIT 1 will hide one of them",
              "LIMIT requires a date",
              "SUM can't tie",
            ],
            1,
            "If you cut the list, add a second sort — player name — so a tie doesn't flip between runs.",
          ),
          fill(
            "Best totals first.",
            ["ORDER BY pts ", null],
            ["DESC", "ASC", "GROUP", "HAVING"],
            ["DESC"],
            "DESC is high to low. ASC would put the quiet seasons on top, which isn't what they asked.",
          ),
          query(
            "This is games. Turn it into the 2024 leaderboard: player, pts, best first.",
            "SELECT player, week, fantasy_pts FROM week_results;",
            "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 GROUP BY player ORDER BY pts DESC;",
            "Sum, filter the year, group, then ORDER BY pts DESC.",
            "Four decisions, four clauses. That's the translation.",
          ),
          query(
            "Same board for WR only, and break ties by player name so the order is stable.",
            "-- your query\n",
            "SELECT player, SUM(fantasy_pts) AS pts FROM week_results WHERE season = 2024 AND position = 'WR' GROUP BY player ORDER BY pts DESC, player;",
            "AND position = 'WR', ORDER BY pts DESC, player.",
            "The second sort column is the tie-break. Same total, then alphabetical.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-interview",
    number: 23,
    title: "SQL Interview Patterns",
    drive: "Up next",
    description: "Second-highest is a pattern, not a puzzle.",
    skills: ["Second max"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-interview-l1",
        title: "The second-highest score",
        blurb: "Throw out the max, then take the max of what's left.",
        brief: {
          goal: "Find the second-highest fantasy_pts in the table.",
          setup: "Interviewers love this. The trick is noticing it's two maxes.",
          steps: [
            {
              title: "ORDER BY and LIMIT 1 OFFSET 1 also works",
              body: "Until two rows tie for first, and your 'second' is another copy of the top score, or until the database doesn't support OFFSET. The max-below-max pattern doesn't care.",
            },
            {
              title: "The inner max is the score you exclude",
              body: "The outer max is the best score that isn't that one.",
              code: "SELECT MAX(fantasy_pts) AS second_best\nFROM week_results\nWHERE fantasy_pts < (SELECT MAX(fantasy_pts) FROM week_results);",
            },
          ],
          previewSql:
            "SELECT MAX(fantasy_pts) AS second_best FROM week_results WHERE fantasy_pts < (SELECT MAX(fantasy_pts) FROM week_results);",
          previewCaption: "One number: the next score down from the top",
        },
        intro: {
          title: "Name the pattern so you can reuse it.",
          text: "Second highest, second earliest, second largest invoice — same shape. Exclude the extreme, then take the extreme of what remains.",
          code: "WHERE fantasy_pts < (SELECT MAX(fantasy_pts) FROM week_results)",
        },
        exercises: [
          mc(
            "Two games tie for the highest score. What is 'second highest' in this pattern?",
            [
              "The same score, because ties confuse MAX",
              "The next score strictly below that tie",
              "NULL",
              "The average of the two",
            ],
            1,
            "The inner MAX is that tied score. The filter keeps everything strictly under it, so the next MAX is a different number.",
          ),
          fill(
            "Exclude the maximum.",
            ["WHERE fantasy_pts < (SELECT ", null, "(fantasy_pts) FROM week_results)"],
            ["MAX", "MIN", "COUNT", "SUM"],
            ["MAX"],
            "MAX inside, and a less-than outside. MIN would hunt the other end of the table.",
          ),
          query(
            "This is the highest score. Change it to the second highest, named second_best.",
            "SELECT MAX(fantasy_pts) AS second_best FROM week_results;",
            "SELECT MAX(fantasy_pts) AS second_best FROM week_results WHERE fantasy_pts < (SELECT MAX(fantasy_pts) FROM week_results);",
            "Add the WHERE with a subquery MAX.",
            "You didn't sort the table. You removed the winner and asked again.",
          ),
          query(
            "Second-highest 2024 score only. Name it second_best.",
            "-- your query\n",
            "SELECT MAX(fantasy_pts) AS second_best FROM week_results WHERE season = 2024 AND fantasy_pts < (SELECT MAX(fantasy_pts) FROM week_results WHERE season = 2024);",
            "Put season = 2024 in both the outer and the inner query.",
            "If the inner MAX is the all-time high and the outer is 2024, you mixed two questions.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sa-craft",
    number: 24,
    title: "Professional SQL Practices",
    drive: "Up next",
    description: "SQL the next person can read.",
    skills: ["Names", "No star"],
    status: "live",
    lessons: [
      lesson({
        id: "sa-craft-l1",
        title: "Name the result, not the mystery",
        blurb: "pts means something. A blank heading doesn't.",
        brief: {
          goal: "Alias every expression and skip SELECT *.",
          setup: "A teammate opens your query next month. The heading can't be the formula.",
          steps: [
            {
              title: "They shouldn't have to re-read the SELECT list",
              body: "fantasy_pts / 2 as a heading is a puzzle. half_pts is a column. AS is that kindness.",
            },
            {
              title: "Stars drift",
              body: "SELECT * changes the day someone adds a column. Name what the report needs.",
              code: "SELECT player,\n       ROUND(AVG(fantasy_pts), 1) AS ppg\nFROM week_results\nWHERE season = 2024\nGROUP BY player;",
            },
          ],
          previewSql:
            "SELECT player, ROUND(AVG(fantasy_pts), 1) AS ppg FROM week_results WHERE season = 2024 GROUP BY player LIMIT 5;",
          previewCaption: "A heading a person can read",
        },
        intro: {
          title: "Formatting is so someone else can find the WHERE.",
          text: "One clause per line is enough. You don't need a style guide to stop writing a 200-character line. And you don't save a query that starts with a star.",
          code: "SELECT player, ROUND(AVG(fantasy_pts), 1) AS ppg FROM week_results",
        },
        exercises: [
          mc(
            "Why avoid SELECT * in a query you save?",
            [
              "It's slower to type",
              "The result's shape changes when the table gains a column",
              "Stars are invalid SQL",
              "GROUP BY requires it",
            ],
            1,
            "A saved query is a contract. A star quietly rewrites the contract.",
          ),
          fill(
            "Name the average.",
            ["ROUND(AVG(fantasy_pts), 1) ", null, " ppg"],
            ["AS", "IS", "TO", "EQ"],
            ["AS"],
            "AS names the expression. Without it, the heading is the formula.",
          ),
          query(
            "This selects a star. Return player and a 2024 average named ppg, one row per player.",
            "SELECT * FROM week_results;",
            "SELECT player, AVG(fantasy_pts) AS ppg FROM week_results WHERE season = 2024 GROUP BY player;",
            "Name both outputs. Filter 2024. Group by player.",
            "The star is gone. A teammate can see the grain from the SELECT list.",
          ),
          query(
            "player, 2024 total named pts, rounded to 1 decimal, best first, ties broken by player.",
            "-- your query\n",
            "SELECT player, ROUND(SUM(fantasy_pts), 1) AS pts FROM week_results WHERE season = 2024 GROUP BY player ORDER BY pts DESC, player;",
            "ROUND(SUM(...), 1) AS pts, then ORDER BY pts DESC, player.",
            "That's a query you'd paste into a review. The name, the grain, the order, and the tie-break are all visible.",
          ),
        ],
      }),
    ],
  },
];
