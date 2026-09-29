/**
 * The rest of SQL Foundations and SQL Analytics, written to the same grammar
 * as `f2` in lib/curriculum-foundations.ts.
 *
 * One idea per lesson. Picture first. The learner writes SQL. Queries run
 * against the real seeded database — no invented numbers in the prose.
 *
 * DML and DDL can't be graded by comparing result rows (they return none),
 * so those lessons still show real statements and grade the wording with
 * fill / mc. The check is always "then SELECT it back," not "trust the write."
 */

import type { FillExercise, Lesson, MCExercise, QueryExercise, Unit } from "./curriculum";

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

const NULL_JOIN = `FROM rosters r
LEFT JOIN week_results w
  ON r.player = w.player AND w.season = 2024 AND w.week = 1`;

export const SQL_NEXT_UNITS: Unit[] = [
  {
    id: "sf-null",
    number: 5,
    title: "NULL & Missing Data",
    drive: "Up next",
    description:
      "A missing score is not a zero. Learn the one test that actually finds it.",
    skills: ["IS NULL", "COALESCE"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-null-l1",
        title: "Find the missing row",
        blurb: "McCaffrey sat week 1. His points aren't zero. They're missing.",
        brief: {
          goal: "Keep a player who has no matching game.",
          setup:
            "You want every rostered player, including the one who didn't play week 1 of 2024.",
          steps: [
            {
              title: "He didn't score zero. He didn't play.",
              body: "A regular JOIN drops Christian McCaffrey from week 1 of 2024. He was hurt. If you report on the roster, vanishing him is the wrong answer.",
              previewSql:
                "SELECT r.player, w.fantasy_pts " +
                NULL_JOIN +
                " ORDER BY r.player;",
              previewCaption: "LEFT JOIN keeps him. The points cell is empty — NULL.",
            },
            {
              title: "= NULL never matches",
              body: "NULL means unknown. Unknown isn't equal to anything, including another unknown. The test that works is IS NULL.",
              code:
                "SELECT r.player\n" +
                NULL_JOIN +
                "\nWHERE w.fantasy_pts IS NULL;",
            },
          ],
          previewSql:
            "SELECT r.player, w.fantasy_pts " +
            NULL_JOIN +
            " WHERE w.fantasy_pts IS NULL;",
          previewCaption: "The players with no week-1 points",
        },
        intro: {
          title: "IS NULL is the test. = NULL is the trap.",
          text: "A LEFT JOIN leaves NULL where the right table had no match. WHERE column = NULL returns nothing, even when the empty cells are sitting right there. Ask IS NULL.",
          code:
            "-- returns nobody\nWHERE w.fantasy_pts = NULL\n\n-- returns the missing week\nWHERE w.fantasy_pts IS NULL",
        },
        film: [
          {
            title: "Three-valued logic, in one line",
            text: "Comparisons against NULL aren't true or false. They're unknown, and WHERE only keeps true. That's why the empty cell survives a join and then disappears the moment you write = NULL.",
          },
        ],
        exercises: [
          mc(
            "This query returns no rows, even though McCaffrey's week is missing. Why?",
            [
              "LEFT JOIN can't see 2024",
              "fantasy_pts = NULL is never true, so WHERE throws the row out",
              "rosters has no McCaffrey",
              "You have to write NULL = NULL",
            ],
            1,
            "Unknown isn't equal to unknown. = NULL matches nothing. IS NULL matches the blank.",
            "SELECT r.player\n" + NULL_JOIN + "\nWHERE w.fantasy_pts = NULL;",
          ),
          fill(
            "Keep rostered players whose week-1 points are missing.",
            ["WHERE w.fantasy_pts ", null, " ", null, ";"],
            ["IS", "NULL", "=", "=="],
            ["IS", "NULL"],
            "Two words, in that order. An equals sign looks right and filters everyone out.",
          ),
          query(
            "This still uses = NULL, so it returns nobody. Fix the test.",
            "SELECT r.player\n" + NULL_JOIN + "\nWHERE w.fantasy_pts = NULL;",
            "SELECT r.player\n" + NULL_JOIN + "\nWHERE w.fantasy_pts IS NULL;",
            "Replace = NULL with IS NULL.",
            "Same join, one different test. = never matches a blank.",
          ),
          query(
            "From scratch: rostered players who have no week-1, season-2024 points. Return the player.",
            "-- your query\n",
            "SELECT r.player\n" + NULL_JOIN + "\nWHERE w.fantasy_pts IS NULL;",
            "LEFT JOIN rosters to week_results, then WHERE the points column IS NULL.",
            "LEFT JOIN keeps the player. IS NULL finds the hole.",
          ),
        ],
      }),
      lesson({
        id: "sf-null-l2",
        title: "Fill the blank with zero",
        blurb: "Sometimes a missing week should count as 0 so a total still works.",
        brief: {
          goal: "Swap NULL for a stand-in you choose.",
          setup:
            "A SUM skips NULL. If you want a missed week to count as zero, you have to say so.",
          steps: [
            {
              title: "An empty cell plus a number is still empty",
              body: "Add NULL to 20 and you don't get 20. You get NULL. That's useful when the number really is unknown, and a problem when you meant 'he scored nothing that week.'",
            },
            {
              title: "COALESCE picks the first real value",
              body: "COALESCE walks its arguments and stops at the first one that isn't NULL. Put the column first and your fallback second.",
              code:
                "SELECT r.player, COALESCE(w.fantasy_pts, 0) AS pts\n" +
                NULL_JOIN +
                ";",
            },
          ],
          previewSql:
            "SELECT r.player, COALESCE(w.fantasy_pts, 0) AS pts " +
            NULL_JOIN +
            " ORDER BY r.player;",
          previewCaption: "Missing week-1 points become 0",
        },
        intro: {
          title: "COALESCE is a fallback, not a deletion.",
          text: "It doesn't delete the row. It replaces a NULL inside it. Use 0 when a missing game should count as zero. Leave NULL when you don't actually know.",
          code: "COALESCE(w.fantasy_pts, 0)",
        },
        exercises: [
          mc(
            "McCaffrey's points are NULL. What is COALESCE(w.fantasy_pts, 0) for him?",
            ["NULL", "0", "An error", "The league average"],
            1,
            "The points are blank, so COALESCE moves on and hands you the 0 you supplied.",
            "SELECT COALESCE(w.fantasy_pts, 0)\n" + NULL_JOIN + "\nWHERE r.player = 'Christian McCaffrey';",
          ),
          fill(
            "Show each rostered player's week-1 points, using 0 when the week is missing.",
            ["SELECT r.player, ", null, "(w.fantasy_pts, 0) AS pts\n", NULL_JOIN],
            ["COALESCE", "IS NULL", "NULLIF", "SUM"],
            ["COALESCE"],
            "COALESCE, then the column, then the fallback. IS NULL only tests — it doesn't replace.",
          ),
          query(
            "This shows blanks for missing weeks. Make those blanks 0.",
            "SELECT r.player, w.fantasy_pts AS pts\n" + NULL_JOIN + ";",
            "SELECT r.player, COALESCE(w.fantasy_pts, 0) AS pts\n" + NULL_JOIN + ";",
            "Wrap the points column in COALESCE(..., 0).",
            "You asked SQL to prefer the real score and, if there isn't one, use 0.",
          ),
          query(
            "Write it yourself. Every rostered player, their week-1 2024 points, and 0 instead of NULL.",
            "-- player and pts\n",
            "SELECT r.player, COALESCE(w.fantasy_pts, 0) AS pts\n" + NULL_JOIN + ";",
            "LEFT JOIN the week, then COALESCE the points.",
            "Same join as last lesson. The only new piece is the fallback.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sf-calc",
    number: 6,
    title: "Calculations & Expressions",
    drive: "Up next",
    description: "New columns, built from ones you already have.",
    skills: ["Arithmetic", "CASE"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-calc-l1",
        title: "A column you invent",
        blurb: "Points in half is still a column. SQL will calculate it while it reads.",
        brief: {
          goal: "Return a number the table doesn't store.",
          setup: "You want each game at half the listed points, next to the player.",
          steps: [
            {
              title: "The table doesn't have a half-PPR column",
              body: "You've got fantasy_pts. You want half of it, for a scoring argument. You don't edit the table. You ask for the math in the SELECT list.",
            },
            {
              title: "Write the expression where a column name would go",
              body: "SQL evaluates it per row and hands back a new column.",
              code: "SELECT player, fantasy_pts / 2 AS half_pts\nFROM week_results;",
            },
          ],
          previewSql:
            "SELECT player, fantasy_pts, fantasy_pts / 2 AS half_pts FROM week_results LIMIT 5;",
          previewCaption: "The stored points, and the ones you just computed",
        },
        intro: {
          title: "The expression is a column for this query only.",
          text: "Nothing is saved back to week_results. Next query, the half points are gone unless you ask again. Name it with AS so the heading isn't the formula.",
          code: "SELECT player, fantasy_pts / 2 AS half_pts FROM week_results;",
        },
        exercises: [
          mc(
            "What does this add to each row?",
            [
              "A stored column named half_pts, written back into the table",
              "A calculated value for this query, about half the stored points",
              "The two highest scores",
              "An error, because half_pts isn't a column",
            ],
            1,
            "SELECT math doesn't edit the table. It invents a result column for this answer only.",
            "SELECT player, fantasy_pts / 2 AS half_pts FROM week_results;",
          ),
          fill(
            "Return the player and their points plus 3.",
            ["SELECT player, fantasy_pts ", null, " 3 AS boosted FROM week_results;"],
            ["+", "AND", "&", ","],
            ["+"],
            "Addition is a plus sign. AND is a filter later — it doesn't add numbers.",
          ),
          query(
            "This returns raw points. Change it to half points, named half_pts.",
            "SELECT player, fantasy_pts FROM week_results;",
            "SELECT player, fantasy_pts / 2 AS half_pts FROM week_results;",
            "Divide the points column by 2 and alias it.",
            "One expression in the SELECT list. The table itself is unchanged.",
          ),
          query(
            "From scratch: player, week, and points minus 2, named adjusted, from week_results.",
            "-- your query\n",
            "SELECT player, week, fantasy_pts - 2 AS adjusted FROM week_results;",
            "fantasy_pts - 2 AS adjusted",
            "Three things in the SELECT list. The last one is math, with a name.",
          ),
        ],
      }),
      lesson({
        id: "sf-calc-l2",
        title: "Label a row with CASE",
        blurb: "Turn a score into a word: boom, fine, or quiet.",
        brief: {
          goal: "Map a number onto a label.",
          setup: "A manager wants each game tagged, not just scored.",
          steps: [
            {
              title: "They asked for a word, and you have a number",
              body: "fantasy_pts is a decimal. The request is 'boom week or not.' CASE is how you write that rule in the query.",
            },
            {
              title: "WHEN the test is true, THEN return that label",
              body: "SQL checks each WHEN from the top and stops at the first hit. ELSE is everyone left over.",
              code: "SELECT player, fantasy_pts,\n       CASE WHEN fantasy_pts >= 20 THEN 'boom' ELSE 'quiet' END AS tag\nFROM week_results;",
            },
          ],
          previewSql:
            "SELECT player, fantasy_pts, CASE WHEN fantasy_pts >= 20 THEN 'boom' ELSE 'quiet' END AS tag FROM week_results LIMIT 5;",
          previewCaption: "A label next to the score",
        },
        intro: {
          title: "CASE is an if, in the SELECT list.",
          text: "It returns one value per row. Order matters: put the stricter test first, or a 30-point week will match a looser WHEN before it ever sees the one you meant.",
          code: "CASE WHEN fantasy_pts >= 20 THEN 'boom' ELSE 'quiet' END",
        },
        exercises: [
          mc(
            "A row with 22 points hits this CASE. What is tag?",
            ["boom", "quiet", "NULL", "22"],
            0,
            "22 passes the first WHEN, so CASE stops and returns boom. It doesn't fall through to ELSE.",
            "CASE WHEN fantasy_pts >= 20 THEN 'boom' ELSE 'quiet' END",
          ),
          fill(
            "Finish the label. 20 or more is boom. Everything else is quiet.",
            ["CASE WHEN fantasy_pts >= 20 THEN 'boom' ", null, " 'quiet' END"],
            ["ELSE", "WHEN", "OR", "THEN"],
            ["ELSE"],
            "ELSE is the leftover bucket. A second WHEN would be another test, not the catch-all.",
          ),
          query(
            "This returns raw points. Add a tag column: 'boom' when points are at least 25, otherwise 'other'. Name it tag.",
            "SELECT player, fantasy_pts FROM week_results;",
            "SELECT player, fantasy_pts, CASE WHEN fantasy_pts >= 25 THEN 'boom' ELSE 'other' END AS tag FROM week_results;",
            "Add CASE WHEN fantasy_pts >= 25 THEN 'boom' ELSE 'other' END AS tag",
            "The number stays. CASE only adds the word beside it.",
          ),
          query(
            "Write it yourself. player and a label named tier: 'QB' when position is QB, otherwise 'skill'.",
            "-- from week_results\n",
            "SELECT player, CASE WHEN position = 'QB' THEN 'QB' ELSE 'skill' END AS tier FROM week_results;",
            "CASE WHEN position = 'QB' THEN 'QB' ELSE 'skill' END",
            "Same shape as the points rule. The test just moved onto a text column.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sf-fn",
    number: 7,
    title: "SQL Functions",
    drive: "Up next",
    description: "One function at a time, each from a small problem.",
    skills: ["COUNT", "UPPER", "ROUND"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-fn-l1",
        title: "How many rows",
        blurb: "COUNT(*) answers 'how many games,' not 'what did they score.'",
        brief: {
          goal: "Count rows instead of listing them.",
          setup: "You want the number of 2024 games in the sheet, not 300 lines of them.",
          steps: [
            {
              title: "A list isn't a count",
              body: "SELECT player FROM week_results WHERE season = 2024 dumps every game. You asked for a number. COUNT folds the rows into one.",
            },
            {
              title: "COUNT(*) counts rows. COUNT(column) counts values.",
              body: "A star counts every row, even one that's half empty. A column name skips NULLs in that column. This sheet has no NULLs, so they match here — they won't on a LEFT JOIN.",
              code: "SELECT COUNT(*) AS games\nFROM week_results\nWHERE season = 2024;",
            },
          ],
          previewSql: "SELECT COUNT(*) AS games FROM week_results WHERE season = 2024;",
          previewCaption: "One number, not a list",
        },
        intro: {
          title: "COUNT collapses.",
          text: "You don't get a row per game. You get one row with the total. If you also SELECT player, the database doesn't know which player to keep — that's a later lesson (GROUP BY).",
          code: "SELECT COUNT(*) FROM week_results WHERE season = 2024;",
        },
        exercises: [
          mc(
            "You write COUNT(*) and also player, with no GROUP BY. What happens?",
            [
              "One row per player, with their game count",
              "Most engines error — you mixed a detail column with an aggregate",
              "COUNT is ignored",
              "You get the first player only, silently",
            ],
            1,
            "An aggregate wants one answer. player wants many. Without GROUP BY, those two asks don't fit.",
            "SELECT player, COUNT(*) FROM week_results;",
          ),
          fill(
            "Count every row of waiver_wire.",
            ["SELECT ", null, "(*) AS n FROM waiver_wire;"],
            ["COUNT", "SUM", "LEN", "TOTAL"],
            ["COUNT"],
            "COUNT counts rows. SUM adds a number column — waiver_wire's question here is how many names.",
          ),
          query(
            "This lists 2024 games. Change it so it returns one number, how many rows.",
            "SELECT player FROM week_results WHERE season = 2024;",
            "SELECT COUNT(*) AS games FROM week_results WHERE season = 2024;",
            "Replace the column list with COUNT(*).",
            "The WHERE stays. Only the SELECT list changes, from names to a count.",
          ),
          query(
            "From scratch: how many QB rows are in week_results? Name the number qbs.",
            "-- one number\n",
            "SELECT COUNT(*) AS qbs FROM week_results WHERE position = 'QB';",
            "COUNT(*) and WHERE position = 'QB'.",
            "Filter first, then count what's left. That's 'how many QB games,' not 'how many QBs.'",
          ),
        ],
      }),
      lesson({
        id: "sf-fn-l2",
        title: "Round the points",
        blurb: "A report wants one decimal, not six.",
        brief: {
          goal: "Round a number in the query.",
          setup: "fantasy_pts is precise. A chat post wants one decimal.",
          steps: [
            {
              title: "Don't round it in your head",
              body: "If the sheet says 18.36, copying 18.4 into a message is a one-off. ROUND does it on every row, the same way.",
            },
            {
              title: "ROUND takes the value and how many decimals",
              body: "The second argument is decimal places, not significant figures.",
              code: "SELECT player, ROUND(fantasy_pts, 1) AS pts\nFROM week_results;",
            },
          ],
          previewSql: "SELECT player, fantasy_pts, ROUND(fantasy_pts, 1) AS pts FROM week_results LIMIT 5;",
          previewCaption: "Raw points and points rounded to one decimal",
        },
        intro: {
          title: "ROUND changes the display of the number, for this query.",
          text: "The stored value stays as it was. A negative second argument rounds to tens, which you almost never want on points.",
          code: "ROUND(fantasy_pts, 1)",
        },
        exercises: [
          mc(
            "ROUND(18.36, 1) is?",
            ["18", "18.4", "18.36", "1"],
            1,
            "The 1 means one decimal place. 18 would be ROUND(18.36, 0).",
          ),
          fill(
            "Round fantasy_pts to 0 decimal places.",
            ["SELECT player, ", null, "(fantasy_pts, 0) AS pts FROM week_results;"],
            ["ROUND", "INT", "CEIL", "ABS"],
            ["ROUND"],
            "ROUND, then the column, then 0. SQLite doesn't use Excel's INT() here.",
          ),
          query(
            "This returns raw points. Round them to 1 decimal and name the column pts.",
            "SELECT player, fantasy_pts FROM week_results;",
            "SELECT player, ROUND(fantasy_pts, 1) AS pts FROM week_results;",
            "ROUND(fantasy_pts, 1) AS pts",
            "You kept the player and replaced the raw number with a rounded one.",
          ),
          query(
            "Player and UPPER(position), named pos, from week_results. Positions are already upper case — this is the habit when they aren't.",
            "-- your query\n",
            "SELECT player, UPPER(position) AS pos FROM week_results;",
            "UPPER(position) AS pos",
            "UPPER is the text twin of ROUND. Same idea: wrap the column, name the result.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sf-sub",
    number: 10,
    title: "Subqueries",
    drive: "Up next",
    description: "A query whose answer is another query.",
    skills: ["WHERE subquery", "Scalar"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-sub-l1",
        title: "Better than the average week",
        blurb: "Filter to rows above a number you don't know yet.",
        brief: {
          goal: "Use one query's result inside another's WHERE.",
          setup: "Show 2024 games that beat that season's average score.",
          steps: [
            {
              title: "You can't type the average, because you haven't asked for it",
              body: "Filtering fantasy_pts > 15 is a guess. The real bar is whatever this table averages. Ask for that inside the filter.",
            },
            {
              title: "A subquery in parentheses is a value",
              body: "The inner SELECT must return one number here, or the comparison has nothing to compare to.",
              code: "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE season = 2024\n  AND fantasy_pts > (\n    SELECT AVG(fantasy_pts) FROM week_results WHERE season = 2024\n  );",
            },
          ],
          previewSql:
            "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts > (SELECT AVG(fantasy_pts) FROM week_results WHERE season = 2024) ORDER BY fantasy_pts DESC LIMIT 5;",
          previewCaption: "Games above the 2024 average — first five by points",
        },
        intro: {
          title: "A scalar subquery is one value wearing parentheses.",
          text: "AVG over the same season returns a single number. Put it on the right of > and the outer query tests every row against it. If the inner query returns many rows, the comparison fails.",
          code: "WHERE fantasy_pts > (SELECT AVG(fantasy_pts) FROM week_results WHERE season = 2024)",
        },
        exercises: [
          mc(
            "The subquery returns many rows instead of one average. What happens to `> (...)`?",
            [
              "It averages them for you",
              "It errors — a single comparison needs a single value",
              "It keeps the first row of the subquery",
              "It ignores the subquery",
            ],
            1,
            "fantasy_pts > 15 is fine. fantasy_pts > a whole list is not, unless you switch to IN or ANY.",
          ),
          fill(
            "Keep 2024 rows above the 2024 average.",
            [
              "WHERE season = 2024 AND fantasy_pts > (",
              null,
              " AVG(fantasy_pts) FROM week_results WHERE season = 2024)",
            ],
            ["SELECT", "FROM", "HAVING", "WITH"],
            ["SELECT"],
            "The thing inside the parentheses is its own SELECT, even though it only returns one number.",
          ),
          query(
            "This uses a hard-coded 15. Compare against the 2024 average instead.",
            "SELECT player, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts > 15;",
            "SELECT player, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts > (SELECT AVG(fantasy_pts) FROM week_results WHERE season = 2024);",
            "Replace 15 with (SELECT AVG(fantasy_pts) FROM week_results WHERE season = 2024).",
            "The cutoff now comes from the data. Next season you don't edit the 15.",
          ),
          query(
            "Games whose points are strictly above the average of ALL seasons, not just 2024. Return player, season, fantasy_pts.",
            "-- your query\n",
            "SELECT player, season, fantasy_pts FROM week_results WHERE fantasy_pts > (SELECT AVG(fantasy_pts) FROM week_results);",
            "The subquery has no WHERE if the bar is the whole table.",
            "Drop the season filter in both places, or keep it only where you mean it. Here the bar is everyone.",
          ),
        ],
      }),
      lesson({
        id: "sf-sub-l2",
        title: "Anyone on this list",
        blurb: "IN plus a subquery is a filter you didn't type by hand.",
        brief: {
          goal: "Keep rows whose value appears in another query.",
          setup: "Show weekly games for players who are actually on a roster.",
          steps: [
            {
              title: "You don't want to paste ten names",
              body: "WHERE player IN ('Josh Allen', ...) rots the day the roster changes. The roster is already a table.",
            },
            {
              title: "IN accepts a query that returns one column",
              body: "The inner SELECT is a list. The outer query keeps rows that match something on it.",
              code: "SELECT player, week, fantasy_pts\nFROM week_results\nWHERE player IN (SELECT player FROM rosters);",
            },
          ],
          previewSql:
            "SELECT player, week, fantasy_pts FROM week_results WHERE player IN (SELECT player FROM rosters) LIMIT 5;",
          previewCaption: "Games belonging to rostered players",
        },
        intro: {
          title: "IN (subquery) is a join written as a filter.",
          text: "A JOIN would work too, and can duplicate games if a player is listed twice. IN answers 'is this player on the list?' without duplicating the game row.",
          code: "WHERE player IN (SELECT player FROM rosters)",
        },
        exercises: [
          mc(
            "A player is on the roster twice. IN (SELECT player FROM rosters) does what to their games?",
            [
              "Prints each game twice",
              "Keeps each game once — IN is a membership test, not a join",
              "Drops them",
              "Errors on the duplicate",
            ],
            1,
            "IN asks yes or no. It doesn't multiply the outer row the way a sloppy join does.",
          ),
          fill(
            "Games for rostered players only.",
            ["WHERE player ", null, " (SELECT player FROM rosters)"],
            ["IN", "JOIN", "=", "ON"],
            ["IN"],
            "IN, then the list. = can't compare a name to a column of many names.",
          ),
          query(
            "This lists every game. Limit it to players who appear on waiver_wire.",
            "SELECT player, week, fantasy_pts FROM week_results;",
            "SELECT player, week, fantasy_pts FROM week_results WHERE player IN (SELECT player FROM waiver_wire);",
            "Add WHERE player IN (SELECT player FROM waiver_wire).",
            "The list lives in the other table. You don't type the names.",
          ),
          query(
            "Names from week_results that also appear on the wire. One row per name.",
            "-- your query\n",
            "SELECT DISTINCT player FROM week_results WHERE player IN (SELECT player FROM waiver_wire);",
            "DISTINCT player, and IN (SELECT player FROM waiver_wire).",
            "IN keeps the games that match the list. DISTINCT stops the same name repeating once per week.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sf-set",
    number: 11,
    title: "Set Operations",
    drive: "Up next",
    description: "Stack two result sets.",
    skills: ["UNION", "UNION ALL"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-set-l1",
        title: "One list from two tables",
        blurb: "Roster names and wire names, in a single column.",
        brief: {
          goal: "Stack two queries that share a shape.",
          setup: "You want every player name your league is tracking, owned or not.",
          steps: [
            {
              title: "They're in different tables, same kind of fact",
              body: "rosters has owners' players. waiver_wire has free agents. You want one list of names, not a join — a join would look for overlaps.",
            },
            {
              title: "UNION stacks and drops duplicate names",
              body: "Both SELECTs need the same number of columns. UNION keeps each distinct row once. UNION ALL keeps repeats.",
              code: "SELECT player FROM rosters\nUNION\nSELECT player FROM waiver_wire;",
            },
          ],
          previewSql:
            "SELECT player FROM rosters UNION SELECT player FROM waiver_wire ORDER BY player;",
          previewCaption: "One name column, both pools, duplicates removed",
        },
        intro: {
          title: "UNION is not a JOIN.",
          text: "JOIN adds columns. UNION adds rows. The two queries have to line up: same count of columns, compatible types, in the same order.",
          code: "SELECT player FROM rosters\nUNION\nSELECT player FROM waiver_wire;",
        },
        exercises: [
          mc(
            "The same name is on the roster and the wire. UNION returns that name how many times?",
            ["Twice", "Once", "Never", "It errors"],
            1,
            "UNION removes duplicate rows. If you needed both copies you'd write UNION ALL.",
          ),
          fill(
            "Stack the two name lists and drop duplicates.",
            ["SELECT player FROM rosters\n", null, "\nSELECT player FROM waiver_wire;"],
            ["UNION", "JOIN", "AND", "WITH"],
            ["UNION"],
            "UNION sits between two complete SELECTs. JOIN would belong inside one SELECT.",
          ),
          query(
            "This is only the roster. Add the wire names under it, duplicates removed.",
            "SELECT player FROM rosters;",
            "SELECT player FROM rosters UNION SELECT player FROM waiver_wire;",
            "UNION then SELECT player FROM waiver_wire.",
            "Two queries, one shape, stacked.",
          ),
          query(
            "Same stack, but keep a name twice if it appears in both. Add a source label: 'roster' or 'wire'.",
            "-- your query\n",
            "SELECT player, 'roster' AS src FROM rosters UNION ALL SELECT player, 'wire' AS src FROM waiver_wire;",
            "Two columns in both halves, and UNION ALL.",
            "The label makes the duplicates meaningful. UNION ALL is how you refuse to collapse them.",
          ),
        ],
      }),
    ],
  },
  {
    id: "sf-dml",
    number: 12,
    title: "Data Modification",
    drive: "Up next",
    description: "Change rows on purpose. Then read them back.",
    skills: ["INSERT", "UPDATE", "DELETE"],
    status: "live",
    lessons: [
      lesson({
        id: "sf-dml-l1",
        title: "Add a row, then look",
        blurb: "INSERT writes. SELECT is how you know it worked.",
        brief: {
          goal: "Know the shape of an INSERT, and why you read it back.",
          setup: "A new free agent needs a row on waiver_wire.",
          steps: [
            {
              title: "The sheet doesn't grow because you thought about it",
              body: "Someone has to add the row. INSERT names the table, the columns, and the values, in the same order.",
            },
            {
              title: "Write it, then SELECT it",
              body: "An INSERT returns no result grid. If you don't look afterward, a typo in the name sits there until Sunday.",
              code: "INSERT INTO waiver_wire (player, team, position, pct_rostered, trend)\nVALUES ('Rookie Name', 'KC', 'WR', 4, 1);\n\nSELECT * FROM waiver_wire WHERE player = 'Rookie Name';",
            },
          ],
          previewSql: "SELECT player, team, position FROM waiver_wire;",
          previewCaption: "The wire as it is now — an insert would add one more row",
        },
        intro: {
          title: "We don't run inserts in the grader.",
          text: "A write returns no rows, so this course checks that you can form the statement. In a real database you'd run the INSERT, then the SELECT underneath it. Never skip the SELECT.",
          code: "INSERT INTO waiver_wire (player, team, position, pct_rostered, trend)\nVALUES ('Rookie Name', 'KC', 'WR', 4, 1);",
        },
        exercises: [
          mc(
            "You run an INSERT and the grid is empty. Did it fail?",
            [
              "Yes — every successful statement returns rows",
              "Not necessarily. INSERT doesn't produce a result set. SELECT to check.",
              "Only if you forgot VALUES",
              "Empty grid means the row was deleted",
            ],
            1,
            "Silence isn't success or failure. Read the table back before you trust the write.",
          ),
          fill(
            "Finish the insert. Values follow the column order.",
            ["INSERT INTO waiver_wire (player, team, position, pct_rostered, trend) ", null, " ('Rookie Name', 'KC', 'WR', 4, 1);"],
            ["VALUES", "SELECT", "SET", "WHERE"],
            ["VALUES"],
            "VALUES introduces the row. SET is the UPDATE keyword, not this one.",
          ),
          fill(
            "You inserted 'Rookie Name'. Prove the row is there.",
            ["SELECT * FROM waiver_wire ", null, " player = 'Rookie Name';"],
            ["WHERE", "SET", "VALUES", "JOIN"],
            ["WHERE"],
            "The check is a normal filter. If that player doesn't come back, the insert didn't land.",
          ),
          mc(
            "Which statement can wipe the whole wire if you omit the filter?",
            [
              "SELECT * FROM waiver_wire",
              "DELETE FROM waiver_wire",
              "INSERT INTO waiver_wire VALUES (...)",
              "SELECT COUNT(*) FROM waiver_wire",
            ],
            1,
            "DELETE without WHERE deletes every row. Say the filter out loud before you run it.",
          ),
        ],
      }),
      lesson({
        id: "sf-dml-l2",
        title: "Change one cell",
        blurb: "UPDATE without WHERE is how a league loses every score.",
        brief: {
          goal: "Update a value, and know which rows will move.",
          setup: "Josh Allen's trend on the wire needs a correction. Only his.",
          steps: [
            {
              title: "Picture the rows the statement will touch",
              body: "UPDATE sets columns. WHERE decides who. No WHERE means everyone.",
            },
            {
              title: "SET the new value, WHERE the one row",
              body: "Name the column you're changing and the test that isolates it.",
              code: "UPDATE waiver_wire\nSET trend = 5\nWHERE player = 'Josh Allen';",
            },
          ],
          previewSql: "SELECT player, trend FROM waiver_wire;",
          previewCaption: "trend today — an update would change one of these",
        },
        intro: {
          title: "Say the WHERE before you run the UPDATE.",
          text: "A missing WHERE isn't a style nit. It's every row in the table. If you're unsure, SELECT with that same WHERE first and count the rows.",
          code: "SELECT * FROM waiver_wire WHERE player = 'Josh Allen';",
        },
        exercises: [
          mc(
            "UPDATE waiver_wire SET trend = 0 — no WHERE. What changes?",
            [
              "The first row",
              "No rows, it errors",
              "Every row's trend becomes 0",
              "Only NULL trends",
            ],
            2,
            "No filter means the whole table. That's the mistake people make once.",
          ),
          fill(
            "Set trend to 5 for one player only.",
            ["UPDATE waiver_wire SET trend = 5 ", null, " player = 'Josh Allen';"],
            ["WHERE", "VALUES", "AND", "FROM"],
            ["WHERE"],
            "WHERE is the fence. Without it the SET applies to all rows.",
          ),
          fill(
            "Delete only that player from the wire.",
            ["DELETE FROM waiver_wire ", null, " player = 'Josh Allen';"],
            ["WHERE", "SET", "SELECT", "LIMIT"],
            ["WHERE"],
            "DELETE FROM names the table. WHERE is what stops it deleting the rest.",
          ),
          mc(
            "You meant to change one player and you're nervous. What do you run first?",
            [
              "The UPDATE, then hope",
              "A SELECT with the same WHERE, so you can see the rows that would move",
              "DROP TABLE",
              "COUNT(*) with no filter",
            ],
            1,
            "The SELECT is a dress rehearsal. If two names come back, your WHERE isn't tight enough.",
          ),
        ],
      }),
    ],
  },
];
