/**
 * SQL Foundations — rebuilt to the lesson grammar in docs/LESSON-GRAMMAR.md.
 *
 * This is the pilot for the redesign in docs/SQL-REDESIGN.md: Module 2, "Your
 * first queries". It lives in its own file rather than inside the 7,500-line
 * curriculum.ts so the rewrite can proceed module by module without fighting
 * the old content for the same lines.
 *
 * Deliberately NOT in lib/courses.ts, so it does not appear in the /learn
 * catalog. It is reachable at /learn/track/sql-foundations and by lesson URL
 * while the voice is being reviewed. Once the voice is signed off, the rest of
 * Foundations lands here and the old u1–u6 units retire.
 *
 * Every lesson follows the same shape:
 *   hook → one idea → tiny query → explain → ladder of drills → feedback
 * and every drill climbs: recognise → complete → modify → write → apply.
 *
 * Every factual claim below was run against the real seeded database before it
 * was written down — including the ones that sound wrong (a missing comma
 * silently renames a column; DISTINCT player, team returns 24 rows for 20
 * players). See docs/LESSON-GRAMMAR.md, rule 7.
 */

import type { Unit } from "./curriculum";

export const SQL_FOUNDATION_UNITS: Unit[] = [
  {
    id: "f2",
    number: 2,
    title: "Your First Queries",
    drive: "1st & 10 · Own 25",
    description:
      "Ask the database for exactly the columns you want — and nothing else.",
    skills: ["SELECT", "FROM", "DISTINCT", "AS", "comments"],
    status: "live",
    lessons: [
      // ── Lesson 1 — SELECT + FROM ─────────────────────────────────
      {
        id: "f2-l1",
        title: "Ask for one column",
        blurb: "Two words get you your first answer: what you want, and where it lives.",
        brief: {
          goal: "Pull a single column out of a table.",
          setup:
            "The dataset holds three seasons of weekly scores. You only want the names.",
          steps: [
            {
              title: "876 rows. You want one column.",
              body: "Our weekly stat sheet has every game 20 players played across three seasons. Right now you just want to see who's in there — not the points, not the weeks. Just names.",
            },
            {
              title: "Tell it what, and where",
              body: "Every question you ask a database starts the same way. Name the column you want, then the table it lives in. That's it.",
              code: "SELECT player\nFROM week_results;",
              note: "LIMIT 5 on the end just stops it early so we can look without 876 rows flying past. More on that later.",
            },
            {
              title: "Here's what comes back",
              body: "One column. Same name repeats, because this sheet has one row per game, and players play a lot of games.",
              previewSql: "SELECT player FROM week_results LIMIT 5;",
              previewCaption: "SELECT player FROM week_results — first 5 of 876 rows",
            },
          ],
          previewSql: "SELECT player FROM week_results LIMIT 5;",
          previewCaption: "Your first query, running for real",
        },
        intro: {
          title: "SELECT picks columns. FROM picks the table.",
          text: "SELECT is the list of columns you want back. FROM is where to get them. Swap the column and you get a different answer from the same table.",
          code: "SELECT player FROM week_results;\nSELECT team   FROM week_results;\nSELECT week   FROM week_results;",
        },
        exercises: [
          {
            type: "mc",
            prompt: "This query runs. What comes back?",
            code: "SELECT team FROM week_results;",
            options: [
              "One row per team — 17 rows",
              "The team column for all 876 rows, repeats and all",
              "Every column, for the team table",
              "An error, because team is a column and not a table",
            ],
            answer: 1,
            explain:
              "SELECT hands back the column as-is, once per row. 876 rows go in, 876 team values come out — BUF appears on every Josh Allen game.",
          },
          {
            type: "fill",
            prompt: "Pull the position column out of the weekly stat sheet.",
            parts: ["SELECT ", null, " FROM ", null, ";"],
            bank: ["position", "week_results", "rosters", "positions"],
            answer: ["position", "week_results"],
            explain:
              "Column first, then the table it lives in. The table is week_results — singular position is the column inside it.",
          },
          {
            type: "query",
            prompt:
              "Here's a working query. Change it so it returns the team column instead of player.",
            starter: "SELECT player FROM week_results;",
            expected: "SELECT team FROM week_results;",
            orderMatters: false,
            hint: "Only one word needs to change, and it's not FROM.",
            explain:
              "Same table, same shape, one different column. Most of the SQL you write is this move repeated.",
          },
          {
            type: "query",
            prompt:
              "Your turn from scratch. The waiver wire is a table called waiver_wire. Pull just its player column.",
            starter: "-- your query here\n",
            expected: "SELECT player FROM waiver_wire;",
            orderMatters: false,
            hint: "Same two words as before: SELECT <column> FROM <table>;",
            explain:
              "Five free agents. Different table, identical pattern — which is the point: learn the shape once and every table opens.",
          },
          {
            type: "mc",
            prompt: "In this query, which part is the table?",
            code: "SELECT pct_rostered FROM waiver_wire;",
            options: [
              "pct_rostered",
              "waiver_wire",
              "SELECT",
              "Both — SQL works it out",
            ],
            answer: 1,
            explain:
              "Whatever follows FROM is the table. pct_rostered is a column inside it — the percentage of leagues where that player is already taken.",
          },
        ],
      },

      // ── Lesson 2 — more than one column ──────────────────────────
      {
        id: "f2-l2",
        title: "Ask for more than one",
        blurb: "Names alone don't answer much. Add the columns you actually need.",
        brief: {
          goal: "Return several columns, in the order you want them.",
          setup: "A list of names doesn't tell you who scored. Bring the points along.",
          steps: [
            {
              title: "A name on its own is useless",
              body: "You pulled the player column and got 876 names. You still can't tell who had a big week. You need the points sitting next to the name.",
            },
            {
              title: "Separate them with commas",
              body: "List as many columns as you want after SELECT. The order you ask for them is the order you get them.",
              code: "SELECT player, team, fantasy_pts\nFROM week_results;",
            },
            {
              title: "Now it reads like a stat sheet",
              body: "Three columns, side by side. This is the shape almost every real query ends up in.",
              previewSql: "SELECT player, team, fantasy_pts FROM week_results LIMIT 5;",
              previewCaption: "Three columns instead of one",
            },
          ],
          previewSql: "SELECT player, team, fantasy_pts FROM week_results LIMIT 5;",
        },
        intro: {
          title: "Commas between columns",
          text: "SELECT takes a list. Commas separate the items, and the last one gets no comma. Ask for the columns in the order you want to read them.",
          code: "SELECT player, fantasy_pts FROM week_results;\nSELECT fantasy_pts, player FROM week_results;  -- same data, columns swapped",
        },
        film: [
          {
            title: "SELECT * is for peeking, not for work",
            text: "A star means every column. It's perfect for a first look at an unfamiliar table, and a bad habit in anything you save: it drags back columns you don't need, and it silently changes shape when someone adds a column.",
            code: "SELECT * FROM waiver_wire;",
          },
        ],
        exercises: [
          {
            type: "mc",
            prompt: "Someone left out a comma. What does this actually do?",
            code: "SELECT player fantasy_pts FROM week_results;",
            options: [
              "Returns two columns, player and fantasy_pts",
              "Fails with a syntax error",
              "Returns one column of player names, with fantasy_pts as its heading",
              "Returns nothing at all",
            ],
            answer: 2,
            explain:
              "This is the nasty one. Without the comma, SQL reads fantasy_pts as a nickname for the player column — so you get names under a heading that says points, and no error to warn you.",
          },
          {
            type: "fill",
            prompt: "Return the player and the team from the weekly stat sheet.",
            parts: ["SELECT player", null, " team FROM week_results;"],
            bank: [",", "AND", "+", "&"],
            answer: [","],
            explain:
              "Commas separate columns. AND is for conditions later on — it won't join a column list.",
          },
          {
            type: "query",
            prompt:
              "This returns names only. Add the team and the points, in that order.",
            starter: "SELECT player FROM week_results;",
            expected: "SELECT player, team, fantasy_pts FROM week_results;",
            orderMatters: false,
            hint: "SELECT player, team, fantasy_pts FROM ...",
            explain:
              "Three columns, one comma between each. The query grew by six words and got a lot more useful.",
          },
          {
            type: "query",
            prompt:
              "From waiver_wire, pull the player and how widely they're already rostered (pct_rostered).",
            starter: "-- two columns this time\n",
            expected: "SELECT player, pct_rostered FROM waiver_wire;",
            orderMatters: false,
            hint: "Two column names after SELECT, separated by a comma.",
            explain:
              "That's the free-agent board an analyst actually looks at: who's out there, and how contested they are.",
          },
          {
            type: "mc",
            prompt:
              "You're about to save a query that a weekly report will run forever. Which is the better habit?",
            options: [
              "SELECT * — it's shorter and always has everything",
              "Name the columns you need",
              "No difference, they cost the same",
              "SELECT *, then delete columns in the spreadsheet after",
            ],
            answer: 1,
            explain:
              "Naming columns keeps the result stable. With a star, the day someone adds a column to the table, your report quietly changes shape.",
          },
        ],
      },

      // ── Lesson 3 — DISTINCT ──────────────────────────────────────
      {
        id: "f2-l3",
        title: "The list without repeats",
        blurb: "Every value once, so you can see what's actually in a column.",
        brief: {
          goal: "Get the unique values in a column.",
          setup:
            "You want to know which positions are in this table. Scrolling 876 rows won't tell you.",
          steps: [
            {
              title: "What's actually in this column?",
              body: "New table, first question: what values does this column hold? Pull position straight and you get 876 answers, nearly all of them repeats.",
            },
            {
              title: "DISTINCT collapses the repeats",
              body: "Put DISTINCT right after SELECT and you get each value once. It's the fastest way to see the shape of a column.",
              code: "SELECT DISTINCT position\nFROM week_results;",
            },
            {
              title: "Four rows, and now you know",
              body: "Quarterbacks, running backs, receivers, tight ends. That's the whole table in four lines instead of 876.",
              previewSql: "SELECT DISTINCT position FROM week_results;",
              previewCaption: "876 rows in, 4 out",
            },
          ],
          previewSql: "SELECT DISTINCT position FROM week_results;",
        },
        intro: {
          title: "DISTINCT goes once, right after SELECT",
          text: "It applies to everything in your column list, not just the first column. One DISTINCT covers the whole row you asked for.",
          code: "SELECT DISTINCT team FROM week_results;    -- 17 rows\nSELECT DISTINCT season FROM week_results;  -- 3 rows",
        },
        exercises: [
          {
            type: "mc",
            prompt: "What does this give you?",
            code: "SELECT DISTINCT team FROM week_results;",
            options: [
              "Every team value, 876 of them",
              "Each team that appears in the table, listed once",
              "The most common team",
              "One row, counting the teams",
            ],
            answer: 1,
            explain:
              "Each value once — 17 rows here. DISTINCT doesn't count anything or rank anything, it just removes the repeats.",
          },
          {
            type: "fill",
            prompt: "List each season in the table exactly once.",
            parts: ["SELECT ", null, " season FROM week_results;"],
            bank: ["DISTINCT", "UNIQUE", "ONLY", "SEPARATE"],
            answer: ["DISTINCT"],
            explain:
              "DISTINCT is the SQL word for it. UNIQUE exists in SQL, but it's a rule you put on a table, not a way to query one.",
          },
          {
            type: "query",
            prompt: "Change this to list each team once instead of each position.",
            starter: "SELECT DISTINCT position FROM week_results;",
            expected: "SELECT DISTINCT team FROM week_results;",
            orderMatters: false,
            hint: "Swap the column. DISTINCT stays where it is.",
            explain:
              "17 teams. Notice DISTINCT didn't move — it always sits directly after SELECT.",
          },
          {
            type: "query",
            prompt: "Now list the seasons this table covers, each one once.",
            starter: "-- which seasons are in here?\n",
            expected: "SELECT DISTINCT season FROM week_results;",
            orderMatters: false,
            hint: "SELECT DISTINCT <column> FROM week_results;",
            explain:
              "2022, 2023, 2024. Three seasons — worth knowing before you write anything that assumes a date range.",
          },
          {
            type: "mc",
            prompt:
              "There are 20 players in this table. This query returns 24 rows. Why?",
            code: "SELECT DISTINCT player, team FROM week_results;",
            options: [
              "Four rows are duplicated by mistake",
              "DISTINCT only applies to player, so team adds rows",
              "DISTINCT looks at the whole row — four players changed teams",
              "It counted four players twice because they missed games",
            ],
            answer: 2,
            explain:
              "DISTINCT works on the combination you asked for, not on the first column. Four of these players appear with two different teams, so each of them is two distinct player-and-team pairs.",
          },
        ],
      },

      // ── Lesson 4 — aliases and comments ──────────────────────────
      {
        id: "f2-l4",
        title: "Name what comes back",
        blurb: "fantasy_pts is a database name. Your manager wants to read Points.",
        brief: {
          goal: "Rename a column in your result, and leave notes in your SQL.",
          setup:
            "Column names come from whoever built the table. They're rarely what you'd put in front of someone.",
          steps: [
            {
              title: "Nobody outside the database says fantasy_pts",
              body: "You're putting this table in front of someone else. The heading says fantasy_pts. It should say Points.",
            },
            {
              title: "AS renames it in the result",
              body: "Put AS and a new name after a column. It changes the heading you get back. It does not touch the table — nothing in the database is renamed.",
              code: "SELECT player AS name,\n       fantasy_pts AS points\nFROM week_results;",
            },
            {
              title: "Two dashes start a note",
              body: "Anything after -- on a line is ignored. Use it to say why a query does something, which is the part you'll forget first.",
              code: "-- Weekly scoring, 2022-2024\nSELECT player AS name\nFROM week_results;",
            },
          ],
          previewSql:
            "SELECT player AS name, fantasy_pts AS points FROM week_results LIMIT 5;",
          previewCaption: "Same data — headings you'd show someone",
        },
        intro: {
          title: "AS changes the label, not the data",
          text: "An alias only exists for the length of the query. The column is still called fantasy_pts tomorrow, and your alias is what the result heading says today.",
          code: "SELECT fantasy_pts AS points FROM week_results;\nSELECT fantasy_pts points FROM week_results;  -- AS is optional, and clearer with it",
        },
        exercises: [
          {
            type: "mc",
            prompt: "After running this, what is the column called in the table?",
            code: "SELECT fantasy_pts AS points FROM week_results;",
            options: [
              "points — the alias renamed it",
              "fantasy_pts — the alias only labels the result",
              "Both names work from now on",
              "It depends whether you saved the query",
            ],
            answer: 1,
            explain:
              "An alias lives and dies with the query. The table is untouched — which is why aliasing is safe to do freely.",
          },
          {
            type: "fill",
            prompt: "Return the player column under the heading name.",
            parts: ["SELECT player ", null, " name FROM week_results;"],
            bank: ["AS", "IS", "=", "CALLED"],
            answer: ["AS"],
            explain:
              "AS is the keyword. = compares things, and IS is for checking NULL later on.",
          },
          {
            type: "fill",
            prompt: "Comment out the note so this query runs.",
            parts: [null, " scoring is PPR\nSELECT player FROM week_results;"],
            bank: ["--", "//", "#", "/*"],
            answer: ["--"],
            explain:
              "Two dashes comment the rest of the line in SQL. // and # belong to other languages, and /* needs a closing */ to match.",
          },
          {
            type: "query",
            prompt:
              "Rewrite this so the result shows the player under the heading name and the points under the heading points.",
            starter: "SELECT player, fantasy_pts FROM week_results;",
            expected:
              "SELECT player AS name, fantasy_pts AS points FROM week_results;",
            orderMatters: false,
            hint: "Each column gets its own AS: SELECT player AS name, fantasy_pts AS points ...",
            explain:
              "Two aliases, one query. When you build reports for other people, most of your SELECT list ends up aliased.",
          },
          {
            type: "query",
            prompt:
              "From waiver_wire, return the player and pct_rostered, labelling the second one rostered_pct.",
            starter: "-- alias the second column\n",
            expected:
              "SELECT player, pct_rostered AS rostered_pct FROM waiver_wire;",
            orderMatters: false,
            hint: "Only the second column needs AS.",
            explain:
              "You can alias one column and leave the rest alone. Nothing forces you to rename everything.",
          },
        ],
      },

      // ── Lesson 5 — execution order ───────────────────────────────
      {
        id: "f2-l5",
        title: "How SQL reads your query",
        blurb: "You write SELECT first. The database doesn't start there.",
        brief: {
          goal: "Know which part of a query the database resolves first, and why it matters.",
          setup:
            "SQL isn't read top to bottom the way you wrote it. That's behind a lot of confusing errors.",
          steps: [
            {
              title: "You write it in one order",
              body: "SELECT, then FROM. That's how every query you've written so far looks on the page.",
              code: "SELECT player\nFROM week_results;",
            },
            {
              title: "It runs in another",
              body: "The database goes to FROM first. It has to know which table it's holding before your column names mean anything. Then it applies your SELECT.",
              code: "1. FROM week_results   -- get the table\n2. SELECT player       -- keep this column",
            },
            {
              title: "Why you care",
              body: "Misspell the table and you get an unknown-table error, not a column error — it never got as far as your columns. Once WHERE and GROUP BY arrive, this order explains most of the surprises.",
            },
          ],
          previewSql: "SELECT DISTINCT position FROM week_results;",
          previewCaption: "FROM runs first, then DISTINCT, then SELECT",
        },
        intro: {
          title: "FROM, then SELECT",
          text: "Table first, columns second. Everything you learn later slots into the middle of that: filters run after the table is loaded, and before the columns are picked.",
          code: "FROM   -> which table\nWHERE  -> which rows   (next module)\nSELECT -> which columns",
        },
        exercises: [
          {
            type: "mc",
            prompt: "Which part does the database work out first?",
            code: "SELECT player FROM week_results;",
            options: [
              "SELECT, because it's written first",
              "FROM, because it needs the table before the columns mean anything",
              "They happen at the same time",
              "Whichever is shorter",
            ],
            answer: 1,
            explain:
              "FROM first. Column names are meaningless until the database knows which table you're talking about.",
          },
          {
            type: "mc",
            prompt: "You run this and the table name is misspelled. What comes back?",
            code: "SELECT playr FROM wek_results;",
            options: [
              "An error about the column playr",
              "An error about the table wek_results",
              "Both errors at once",
              "Empty results, no error",
            ],
            answer: 1,
            explain:
              "It fails at FROM and stops. You never hear about the misspelled column — fix the table name and the column error shows up next.",
          },
          {
            type: "fill",
            prompt: "Build a query returning each position once.",
            parts: ["SELECT ", null, " position ", null, " week_results;"],
            bank: ["DISTINCT", "FROM", "ONLY", "IN"],
            answer: ["DISTINCT", "FROM"],
            explain:
              "DISTINCT right after SELECT, FROM before the table. That's the whole skeleton of a query at this stage.",
          },
          {
            type: "query",
            prompt:
              "Put it together: from the weekly stat sheet, list each team once, under the heading team_code.",
            starter: "-- distinct, plus an alias\n",
            expected: "SELECT DISTINCT team AS team_code FROM week_results;",
            orderMatters: false,
            hint: "DISTINCT goes after SELECT; the alias goes after the column.",
            explain:
              "Three things from three lessons in one line: pick a column, drop the repeats, rename the heading.",
          },
          {
            type: "query",
            prompt:
              "Last one. The rosters table lists who owns whom in our example league. List each fantasy team once.",
            starter: "-- rosters has team_name and player\n",
            expected: "SELECT DISTINCT team_name FROM rosters;",
            orderMatters: false,
            hint: "The column is team_name, the table is rosters.",
            explain:
              "Five teams across ten roster spots. Same two moves you've used all module, on a table you hadn't seen until now — which is the real test.",
          },
        ],
      },
    ],
  },
];
