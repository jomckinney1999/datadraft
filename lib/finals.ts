/**
 * End-of-course finals — ~30-minute fantasy-football knowledge checks.
 *
 * One unit + one dense lesson per live course. Hands-on where a runtime
 * exists (SQL / Python / R / Excel); concept drills for stats, viz, and Git.
 * Answer keys were checked against the real seeded datasets.
 */

import type { Unit } from "./curriculum";
import { FACTS } from "./lesson-facts.generated";

export const FINAL_UNITS: Unit[] = [
  // ── SQL Fundamentals ─────────────────────────────────────────────
  {
    id: "u23",
    number: 23,
    title: "Championship Sunday — SQL Final",
    drive: "Championship · Own 25",
    description:
      "Everything you've learned, on the same three tables. No new clauses — just the kind of questions someone would actually bring you, answered live in the terminal.",
    skills: ["Capstone", "Joins", "Aggregates", "Windows"],
    status: "live",
    lessons: [
      {
        id: "u23-l1",
        title: "Trade Deadline Desk",
        blurb:
          "~30 min. Answer the commissioner's questions against the live season data.",
        brief: {
          goal: "Settle a trade-deadline argument with queries, not opinions.",
          steps: [
            {
              title: "The group chat is on fire",
              body: "One manager wants Ja'Marr Chase. Another swears Fourth & Long is secretly stacked. A third insists boom games are rare. Your job is not to argue — it is to pull the number that ends the argument.",
            },
            {
              title: "Same tables, full toolkit",
              body: "Everything you need is already in week_results, rosters, and waiver_wire. You'll filter, join, group, sort, and once or twice use a window — the same plays you drilled, now chained into one sitting. Column names live under Tables & columns on the left of the terminal — expand it any time you blank on a field.",
              note: "Roughly half an hour. Wrong answers cost a down like any other drive — Instant Replay still works if you burn a ticket.",
            },
            {
              title: "Peek at 2024 before you snap",
              body: "Here's the 2024 scoring log, biggest games first. You'll spend most of this desk on that season.",
              previewSql:
                "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 ORDER BY fantasy_pts DESC LIMIT 8;",
              previewCaption: "2024 · biggest single-game scores",
            },
          ],
          setup:
            `Trade deadline desk: answer the commissioner's questions with live SQL against real PPR data from ${FACTS.seasons[0]} through week ${FACTS.latest.week} of ${FACTS.latest.season}.`,
          previewSql:
            "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 ORDER BY fantasy_pts DESC LIMIT 8;",
          previewCaption: "2024 · biggest single-game scores",
        },
        intro: {
          title: "Commissioner's checklist",
          text: "Ten snaps. Most are write-the-query. A couple check whether you still recognise the right tool. Need a column name? Open Tables & columns on the left — every sheet and field you can query is listed there beside the terminal.",
          code: "-- tables on the board\n-- week_results · rosters · waiver_wire",
        },
        film: [
          {
            title: "Grading cares about the result, not your whitespace",
            text: "Format the query however you like — one line or pretty-printed. The grader runs your SQL and compares the rows that come back. A correct answer with ugly spacing still scores.",
          },
        ],
        exercises: [
          {
            type: "mc",
            prompt:
              "A manager wants \"every 2024 game over 30 points, biggest first.\" Which skeleton is right?",
            options: [
              "SELECT … WHERE fantasy_pts > 30 ORDER BY fantasy_pts DESC — and filter season in WHERE",
              "GROUP BY player, then LIMIT 30",
              "SELECT * with no WHERE — scroll until you see big numbers",
              "HAVING fantasy_pts > 30 with no GROUP BY",
            ],
            answer: 0,
            explain:
              "Filter the season and the threshold in WHERE, then sort. HAVING is for aggregates after GROUP BY.",
          },
          {
            type: "query",
            prompt:
              "2024 season totals: show player and total (sum of fantasy_pts, rounded to 1 decimal). Biggest total first, top 5 only.",
            starter: "SELECT ",
            expected:
              "SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2024 GROUP BY player ORDER BY total DESC LIMIT 5;",
            orderMatters: true,
            hint: "WHERE season = 2024, GROUP BY player, ORDER BY total DESC, LIMIT 5.",
            explain:
              "Lamar Jackson 430.4 leads, then Chase, Allen, Gibbs, Barkley — the board everyone is fighting over.",
          },
          {
            type: "query",
            prompt:
              "Which position scored the highest average fantasy_pts in 2024? Show position and avg_pts (rounded to 1 decimal), highest first.",
            starter: "SELECT ",
            expected:
              "SELECT position, ROUND(AVG(fantasy_pts), 1) AS avg_pts FROM week_results WHERE season = 2024 GROUP BY position ORDER BY avg_pts DESC;",
            orderMatters: true,
            hint: "GROUP BY position, AVG, ORDER BY the alias DESC.",
            explain:
              "QB 22.0, then RB, WR, TE — the positional hierarchy the draft board is built on.",
          },
          {
            type: "query",
            prompt:
              "Fantasy team standings for 2024: join rosters to week_results, sum each team_name's points (rounded to 1 decimal), biggest first.",
            starter: "SELECT ",
            expected:
              "SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS pts FROM rosters r JOIN week_results w ON r.player = w.player WHERE w.season = 2024 GROUP BY r.team_name ORDER BY pts DESC;",
            orderMatters: true,
            hint: "JOIN on player, WHERE season = 2024, GROUP BY team_name.",
            explain:
              `${FACTS.league.leader.team} leads the league at ${FACTS.league.leader.pts} — now you can settle the group chat with a number.`,
          },
          {
            type: "query",
            prompt:
              "How many individual games across every season cleared 30.0 fantasy points? One column: boom.",
            starter: "SELECT ",
            expected:
              "SELECT COUNT(*) AS boom FROM week_results WHERE fantasy_pts >= 30;",
            orderMatters: false,
            hint: "COUNT(*) with WHERE fantasy_pts >= 30 — no season filter.",
            explain:
              `${FACTS.boom30} boom games in the whole dataset. Rare enough to feel special, common enough to plan around.`,
          },
          {
            type: "query",
            prompt:
              "The single biggest 2024 game: show player, week, and fantasy_pts for the row that matches the season max.",
            starter: "SELECT ",
            expected:
              "SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts = (SELECT MAX(fantasy_pts) FROM week_results WHERE season = 2024);",
            orderMatters: false,
            hint: "A subquery for MAX(fantasy_pts) in the WHERE, scoped to 2024.",
            explain:
              "Ja'Marr Chase, week 10, 55.4 — the high-water mark of 2024 in this table.",
          },
          {
            type: "query",
            prompt:
              "Waiver bait: 2024 players who are NOT on any roster. Show player and total (rounded to 1), biggest total first, top 5.",
            starter: "SELECT ",
            expected:
              "SELECT w.player, ROUND(SUM(w.fantasy_pts), 1) AS total FROM week_results w LEFT JOIN rosters r ON w.player = r.player WHERE w.season = 2024 AND r.player IS NULL GROUP BY w.player ORDER BY total DESC LIMIT 5;",
            orderMatters: true,
            hint: "LEFT JOIN rosters, keep WHERE r.player IS NULL, then aggregate.",
            explain:
              `${FACTS.league.undraftedByPoints.slice(0, 5).join(", ")} — elite production that a five-team, two-round draft never reached.`,
          },
          {
            type: "query",
            prompt:
              "2024 heaters: players averaging at least 18.0 PPG. Show player, ppg (avg rounded to 1), and games (COUNT). Highest ppg first.",
            starter: "SELECT ",
            expected:
              "SELECT player, ROUND(AVG(fantasy_pts), 1) AS ppg, COUNT(*) AS games FROM week_results WHERE season = 2024 GROUP BY player HAVING AVG(fantasy_pts) >= 18 ORDER BY ppg DESC;",
            orderMatters: true,
            hint: "HAVING filters on the average after GROUP BY — WHERE cannot see AVG yet.",
            explain:
              "Eleven players clear the bar. HAVING is the cut line after the film session.",
          },
          {
            type: "query",
            prompt:
              "Josh Allen's career arc: for each season, show season and avg_pts (average fantasy_pts, rounded to 1). Chronological order.",
            starter: "SELECT ",
            expected:
              "SELECT season, ROUND(AVG(fantasy_pts), 1) AS avg_pts FROM week_results WHERE player = 'Josh Allen' GROUP BY season ORDER BY season;",
            orderMatters: true,
            hint: "WHERE player = 'Josh Allen', GROUP BY season, ORDER BY season.",
            explain:
              `${FACTS.seasonPpg["Josh Allen"].map(([, ppg]) => ppg).join(" → ")}. Stable excellence — the opposite of a one-year spike.${FACTS.latest.week < 18 ? " The last one is a season still being played." : ""}`,
          },
          {
            type: "mc",
            prompt:
              "You need each of Josh Allen's 2024 games next to his season average — without collapsing the weeks. What do you reach for?",
            options: [
              "GROUP BY week",
              "AVG(fantasy_pts) OVER () — or PARTITION BY player — as a window",
              "HAVING AVG(fantasy_pts)",
              "LIMIT 1",
            ],
            answer: 1,
            explain:
              "Windows annotate rows; GROUP BY collapses them. That's the last tool in the Fundamentals bag.",
          },
        ],
      },
    ],
  },

  // ── Advanced SQL ─────────────────────────────────────────────────
  {
    id: "u24",
    number: 24,
    title: "Pro Bowl — Advanced SQL Final",
    drive: "Pro Bowl · Own 20",
    description:
      "Package a season report with CTEs, then prove you still know when views, triggers, and indexes earn their keep.",
    skills: ["CTEs", "Views", "Indexes", "Capstone"],
    status: "live",
    lessons: [
      {
        id: "u24-l1",
        title: "Season Report, Named Steps",
        blurb: "~30 min. Build the report in WITH clauses, then answer the architecture questions.",
        brief: {
          goal: "Write a readable multi-step season report and defend the packaging choices.",
          steps: [
            {
              title: "The GM wants one clean report",
              body: "Not a pile of nested subqueries. Name each step with WITH, then SELECT from those names — the Advanced SQL habit that keeps a 40-line report reviewable.",
            },
            {
              title: "Then the architecture quiz",
              body: "After the live queries: views vs CTEs, when a trigger fires, and how an index actually helps. Same ideas as the unit, now without the scaffolding.",
            },
          ],
          setup:
            "Advanced final: CTE-built reports against week_results, plus concept checks on views, triggers, and indexes.",
          previewSql:
            "SELECT player, ROUND(SUM(fantasy_pts),1) AS total FROM week_results WHERE season = 2024 GROUP BY player ORDER BY total DESC LIMIT 5;",
          previewCaption: "2024 totals — you'll rebuild this as a CTE",
        },
        intro: {
          title: "Name the steps, then ask the question",
          text: "Every live drill here should start with WITH …. Architecture questions come after — no CREATE statements to grade, so those stay multiple-choice like the rest of Advanced.",
          code: "WITH season_totals AS (\n  SELECT player, SUM(fantasy_pts) AS total\n  FROM week_results\n  WHERE season = 2024\n  GROUP BY player\n)\nSELECT * FROM season_totals\nORDER BY total DESC\nLIMIT 5;",
        },
        exercises: [
          {
            type: "query",
            prompt:
              "Using a CTE named season_totals, list the top 5 players by 2024 total points (rounded to 1 decimal as total), biggest first.",
            starter: "WITH season_totals AS (\n  \n)\nSELECT ",
            expected:
              "WITH season_totals AS (SELECT player, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2024 GROUP BY player) SELECT player, total FROM season_totals ORDER BY total DESC LIMIT 5;",
            orderMatters: true,
            hint: "CTE does the GROUP BY; outer query sorts and LIMITs.",
            explain:
              "Same five leaders as Fundamentals — now packaged as a named step a teammate can read top-down.",
          },
          {
            type: "query",
            prompt:
              "Chain two CTEs: big_games = 2024 rows with fantasy_pts > 30; then boom_counts = player + COUNT(*) AS boom_games from big_games. Show players with at least 2 boom games, most booms first.",
            starter: "WITH big_games AS (\n  \n),\nboom_counts AS (\n  \n)\nSELECT ",
            expected:
              "WITH big_games AS (SELECT player, week, fantasy_pts FROM week_results WHERE season = 2024 AND fantasy_pts > 30), boom_counts AS (SELECT player, COUNT(*) AS boom_games FROM big_games GROUP BY player) SELECT player, boom_games FROM boom_counts WHERE boom_games >= 2 ORDER BY boom_games DESC;",
            orderMatters: true,
            hint: "Second CTE SELECTs FROM the first. Filter boom_games in the outer WHERE (or HAVING inside boom_counts).",
            explain:
              "Two named steps beat a nested mess — and you can test big_games alone when something looks off.",
          },
          {
            type: "query",
            prompt:
              "2023 WR leaderboard via a CTE named wr_2023: player, games (COUNT), total (sum rounded to 1). Top 3 by total.",
            starter: "WITH wr_2023 AS (\n  \n)\nSELECT ",
            expected:
              "WITH wr_2023 AS (SELECT player, COUNT(*) AS games, ROUND(SUM(fantasy_pts), 1) AS total FROM week_results WHERE season = 2023 AND position = 'WR' GROUP BY player) SELECT player, games, total FROM wr_2023 ORDER BY total DESC LIMIT 3;",
            orderMatters: true,
            hint: "Filter season and position inside the CTE.",
            explain:
              "CeeDee Lamb, Tyreek Hill, Amon-Ra St. Brown — 2023's WR podium in this dataset.",
          },
          {
            type: "mc",
            prompt:
              "You need the same season-totals logic available to every analyst, every session, always current. What do you ship?",
            options: [
              "A CTE pasted into every notebook",
              "A VIEW — a saved query that behaves like a table",
              "A temporary table only",
              "An index on fantasy_pts",
            ],
            answer: 1,
            explain:
              "Views outlive the session and stay up to date. CTEs and temp tables are for one sitting.",
          },
          {
            type: "mc",
            prompt: "When does an AFTER INSERT trigger on rosters fire?",
            options: [
              "Once a day at midnight",
              "Automatically, every time a row is inserted into rosters",
              "Only when you call it by name",
              "When someone opens the table",
            ],
            answer: 1,
            explain:
              "Triggers are event-driven automation — insert/update/delete, not a schedule you remember to run.",
          },
          {
            type: "fill",
            prompt: "Read the plan for a player lookup (don't invent new syntax — fill the blanks).",
            parts: [
              null,
              " ",
              null,
              " ",
              null,
              "\nSELECT * FROM week_results WHERE player = 'Josh Allen';",
            ],
            bank: ["EXPLAIN", "QUERY", "PLAN", "DESCRIBE", "SHOW"],
            answer: ["EXPLAIN", "QUERY", "PLAN"],
            explain:
              "EXPLAIN QUERY PLAN — the Advanced SQL habit before you blame the network for a slow dashboard.",
          },
          {
            type: "mc",
            prompt:
              "idx ON week_results(player). Which query benefits most?",
            options: [
              "SELECT * FROM week_results ORDER BY fantasy_pts DESC",
              "SELECT * FROM week_results WHERE player = 'Josh Allen'",
              "SELECT AVG(fantasy_pts) FROM week_results",
              "SELECT * FROM week_results WHERE fantasy_pts > 30",
            ],
            answer: 1,
            explain:
              "Indexes help lookups on the indexed column. Sorting or filtering a different column won't use this one.",
          },
          {
            type: "mc",
            prompt:
              "Composite index on (player, season). A query filters only WHERE season = 2024. Helpful?",
            options: [
              "Yes — any column in the index counts",
              "No — it isn't leftmost-first; season alone can't use an index that starts with player",
              "Only if you also ORDER BY player",
              "Only on TEMP tables",
            ],
            answer: 1,
            explain:
              "Leftmost prefix rule. Season-only filters want season first in the index — or a separate season index.",
          },
        ],
      },
    ],
  },

  // ── Python ───────────────────────────────────────────────────────
  {
    id: "u25",
    number: 25,
    title: "Super Bowl — Python Final",
    drive: "Super Bowl · Own 25",
    description:
      "Variables through pandas — settle lineup debates with code that actually runs.",
    skills: ["pandas", "merge", "groupby", "Capstone"],
    status: "live",
    lessons: [
      {
        id: "u25-l1",
        title: "Lineup Lock Desk",
        blurb: "~30 min. Score, merge, and clean a mini fantasy dataset in Pyodide.",
        brief: {
          goal: "Decide starters with real Python — lists, frames, merges, and cleaning.",
          steps: [
            {
              title: "Kickoff is in an hour",
              body: "You have point lists, a roster frame, and a messy export. Same toolkit as the course: print what you compute, merge carefully, strip before you cast.",
            },
            {
              title: "Nothing is simulated",
              body: "Every code drill runs in your browser. If it prints the right answer, you're done — formatting can vary as long as the output matches.",
            },
          ],
          setup:
            "Python final: live code against small fantasy DataFrames — the same patterns as units 7, 13, and 14.",
        },
        intro: {
          title: "Print the decision",
          text: "Grading compares printed output. Use pandas freely. When a prompt says \"as a list\", call .tolist().",
          code: 'import pandas as pd\nprint(pd.Series([18.2, 24.6, 12.0]).mean())',
        },
        exercises: [
          {
            type: "mc",
            prompt:
              "points = \"24.6\". What happens if you divide by 3 without converting?",
            options: [
              "You get 8.2",
              "TypeError — it's text until you cast it",
              "Python silently treats it as a float",
              "It becomes None",
            ],
            answer: 1,
            explain:
              "Quotes make text. float(\"24.6\") / 3 is the fix — same trap as dirty CSV columns.",
          },
          {
            type: "code",
            lang: "python",
            prompt:
              "Weekly PPR scores: 18.2, 24.6, 9.4, 31.0. Print the average, rounded to 1 decimal.",
            starter: "scores = [18.2, 24.6, 9.4, 31.0]\n\n# print the rounded average\n",
            expected: "print(20.8)",
            hint: "sum(scores) / len(scores), then round(..., 1).",
            explain: "20.8 — a four-game sample, not a season, but enough to rank the week.",
          },
          {
            type: "code",
            lang: "python",
            prompt:
              "Print every score from that list that cleared 20, as a list.",
            starter: "scores = [18.2, 24.6, 9.4, 31.0]\n\n# print the scores over 20 as a list\n",
            expected: "print([24.6, 31.0])",
            hint: "[s for s in scores if s > 20]",
            explain: "List comprehensions are the Python version of WHERE.",
          },
          {
            type: "code",
            lang: "python",
            prompt:
              "Build a DataFrame of player + points, then print the mean of points rounded to 1 decimal.",
            starter:
              'import pandas as pd\n\ndf = pd.DataFrame({\n    "player": ["Hurts", "Bijan", "Kelce", "Nacua"],\n    "points": [24.6, 18.2, 22.4, 31.0],\n})\n\n# print the rounded mean of points\n',
            expected: "print(24.0)",
            hint: 'round(df["points"].mean(), 1)',
            explain: "24.0 on the nose — .mean() is AVG for a Series.",
          },
          {
            type: "code",
            lang: "python",
            prompt:
              "Print mean points by position as a Series (groupby), sorted descending.",
            starter:
              'import pandas as pd\n\ndf = pd.DataFrame({\n    "position": ["QB", "RB", "WR", "QB", "RB", "WR"],\n    "points": [28.0, 18.2, 22.4, 24.6, 12.0, 31.0],\n})\n\n# groupby position, mean points, sort descending, print\n',
            expected:
              'import pandas as pd\ndf = pd.DataFrame({"position":["QB","RB","WR","QB","RB","WR"],"points":[28.0,18.2,22.4,24.6,12.0,31.0]})\nprint(df.groupby("position")["points"].mean().sort_values(ascending=False))',
            hint: 'df.groupby("position")["points"].mean().sort_values(ascending=False)',
            explain:
              "WR leads this tiny sample — groupby is GROUP BY, sort_values is ORDER BY.",
          },
          {
            type: "code",
            lang: "python",
            prompt:
              "Left-merge roster onto scores and print the player column as a list (keep everyone).",
            starter:
              'import pandas as pd\n\nroster = pd.DataFrame({"player": ["Hurts", "Bijan", "Kelce"]})\nscores = pd.DataFrame({"player": ["Hurts", "Kelce"], "points": [24.6, 22.4]})\n\n# left merge, print player list\n',
            expected:
              'print(pd.merge(roster, scores, on="player", how="left")["player"].tolist())',
            hint: 'how="left", then ["player"].tolist()',
            explain:
              "All three names survive — Bijan included with NaN points.",
          },
          {
            type: "code",
            lang: "python",
            prompt:
              "Points arrived as text with spaces. Strip, cast to float, print the total rounded to 1 decimal.",
            starter:
              'import pandas as pd\n\ndf = pd.DataFrame({"points": [" 24.6", "18.2 ", " 31.0"]})\n\n# clean, sum, print rounded total\n',
            expected: "print(73.8)",
            hint: 'df["points"].str.strip().astype(float).sum()',
            explain: "73.8 — strip then cast is the two-step that rescues most exports.",
          },
          {
            type: "mc",
            prompt:
              "An inner merge drops from 10 roster rows to 8. What happened?",
            options: [
              "pandas sampled randomly",
              "Two roster players had no matching score row",
              "The frames were unsorted",
              "Inner always keeps the left frame",
            ],
            answer: 1,
            explain:
              "Inner keeps matches only. how='left' would have kept ten with NaNs.",
          },
        ],
      },
    ],
  },

  // ── Excel ────────────────────────────────────────────────────────
  {
    id: "u26",
    number: 26,
    title: "Draft Day — Excel Final",
    drive: "Draft Day · Own 25",
    description:
      "Auction board on the Roster sheet: totals, lookups, and cleaning the bad Import tab.",
    skills: ["SUMIF", "VLOOKUP", "Cleaning", "Capstone"],
    status: "live",
    lessons: [
      {
        id: "u26-l1",
        title: "Auction Board Check",
        blurb: "~30 min. Real formulas against the live Roster / Import workbook.",
        brief: {
          goal: "Run the numbers a co-manager would ask for on draft night.",
          steps: [
            {
              title: "The board is open",
              body: "Roster is clean. Import is dirty on purpose. You'll total, look up, and clean — every formula grades on the value it produces, so any correct spelling passes.",
            },
            {
              title: "Addresses are on the grid",
              body: "Read the cells off the sheet under the prompt. Don't hardcode a number you can see — the engine rejects formulas that never reference a cell.",
            },
          ],
          setup:
            "Excel final on the same workbook as the course: Roster (clean) and Import (messy).",
          previewSheet: "Roster",
          previewCaption: "Roster · real 2024 points, invented salaries & owners",
        },
        intro: {
          title: "Point at cells, don't retype numbers",
          text: "Every drill needs a cell reference. SUMIF, VLOOKUP, TRIM, VALUE — the full auction-night toolkit.",
          code: "=SUMIF(G:G,\"Jordan\",E:E)",
        },
        exercises: [
          {
            type: "formula",
            prompt: "Total fantasy points on the Roster sheet (column E).",
            starter: "=",
            expected: "=SUM(E2:E17)",
            hint: "=SUM(E2:E17) — or SUM(E:E) if the engine allows the column form.",
            explain: "Season points for the whole auction board in one cell.",
          },
          {
            type: "formula",
            prompt: "How many players are on the board? Count the names in column A.",
            starter: "=",
            expected: "=COUNTA(A2:A17)",
            hint: "COUNTA counts non-blanks.",
            explain: "16 players — the league's auction pool.",
          },
          {
            type: "formula",
            prompt: "Jordan's team total: sum Points (E) where Owner (G) is Jordan.",
            starter: "=",
            expected: '=SUMIF(G2:G17,"Jordan",E2:E17)',
            hint: '=SUMIF(owner_range, "Jordan", points_range)',
            explain: "Jordan's squad stacks Lamar, Gibbs, Henry, Hurts, Adams, and A.J. Brown.",
          },
          {
            type: "formula",
            prompt: "Who scored the most? Return the max of Points.",
            starter: "=",
            expected: "=MAX(E2:E17)",
            hint: "=MAX(E2:E17)",
            explain: "430.4 — Lamar Jackson's season.",
          },
          {
            type: "formula",
            prompt:
              "Look up Ja'Marr Chase's points with VLOOKUP. Names are in A, points in E (column index 5), exact match.",
            starter: "=",
            expected: '=VLOOKUP("Ja\'Marr Chase",A2:E17,5,FALSE)',
            hint: "VLOOKUP(name, A2:E17, 5, FALSE)",
            explain: "403 — exact match matters; approximate match is for sorted keys, not player names.",
          },
          {
            type: "formula",
            prompt:
              "Import!B2 has points stored as text with spaces. Turn it into a real number.",
            starter: "=",
            expected: "=VALUE(TRIM(Import!B2))",
            hint: "VALUE(TRIM(...))",
            explain: "430.4 as a number — trim first or VALUE chokes on the spaces.",
          },
          {
            type: "formula",
            prompt: "Clean Import!A3: strip spaces and fix capitalisation.",
            starter: "=",
            expected: "=PROPER(TRIM(Import!A3))",
            hint: "PROPER(TRIM(...))",
            explain: "Patrick Mahomes-shaped names come out draft-board ready.",
          },
          {
            type: "mc",
            prompt:
              "A player missed a game. For PPG, should the week be blank or zero?",
            options: [
              "Always zero",
              "Blank if you're averaging per game played — decide on purpose",
              "Always blank for every metric",
              "It never matters",
            ],
            answer: 1,
            explain:
              "PPG wants blank (or omitted); season totals may want zero. The export shouldn't choose for you.",
          },
        ],
      },
    ],
  },

  // ── Statistics ───────────────────────────────────────────────────
  {
    id: "u27",
    number: 27,
    title: "Film Session — Stats Final",
    drive: "Film Session · Own 25",
    description:
      "Sample size, averages, and regression to the mean — applied to lineup fights.",
    skills: ["Sample size", "Regression", "Capstone"],
    status: "live",
    lessons: [
      {
        id: "u27-l1",
        title: "Trust the Tape?",
        blurb: "~30 min. Concept checks that show up in every fantasy argument.",
        brief: {
          goal: "Catch the statistical traps that make managers look foolish.",
          steps: [
            {
              title: "Hot takes vs cold math",
              body: "Small samples, misleading averages, and regression to the mean explain most \"he fell off\" narratives. This final is recognition practice — no calculator required.",
            },
          ],
          setup:
            "Stats final: the three ideas from the course, stress-tested with fantasy scenarios.",
        },
        intro: {
          title: "Name the trap",
          text: "Each prompt is a conversation you'll hear in a league chat. Pick the answer that would actually help the team.",
        },
        exercises: [
          {
            type: "mc",
            prompt:
              "A waiver WR just dropped 28 and 31 in two games. Your league mate says he's WR1 rest-of-season. Best reply?",
            options: [
              "Agree — two great games prove it",
              "Two games is a tiny sample; wait for more tape before paying up",
              "Ignore points and start him every week anyway",
              "Averages can't be computed with n=2",
            ],
            answer: 1,
            explain:
              "Sample size is the whole lesson. Extremes in n=2 are mostly noise.",
          },
          {
            type: "mc",
            prompt:
              "Player A: 20, 20, 20. Player B: 5, 35, 20. Same average. Who is riskier in a must-win week?",
            options: [
              "Player A — too consistent",
              "Player B — same mean, much higher variance",
              "They're identical for every purpose",
              "Whoever has the cooler name",
            ],
            answer: 1,
            explain:
              "The mean hides spread. Floor/ceiling is variance wearing a jersey.",
          },
          {
            type: "mc",
            prompt:
              "A kicker hits 12 straight field goals, then misses 2 of 5. Best explanation?",
            options: [
              "He lost confidence because of the media",
              "Regression to the mean — an extreme streak had luck in it",
              "The cover jinx is real",
              "Sample size no longer matters after 12 makes",
            ],
            answer: 1,
            explain:
              "Extremes drift back toward the player's true rate. Luck doesn't repeat on command.",
          },
          {
            type: "mc",
            prompt:
              "You average a player's season including three games he was out (entered as 0). What did you do?",
            options: [
              "Computed true PPG",
              "Dragged the average down by treating \"didn't play\" as \"played and scored nothing\"",
              "Nothing wrong — zero is always correct",
              "Removed variance",
            ],
            answer: 1,
            explain:
              "Missing and zero are different facts. PPG per game played should skip inactive weeks.",
          },
          {
            type: "mc",
            prompt:
              "A rookie posts a 90th-percentile month, then \"hits a wall.\" Before writing the narrative, check…",
            options: [
              "Whether ordinary regression explains the drop",
              "Whether the stadium Wi-Fi changed",
              "Whether fantasy points are illegal in his state",
              "Nothing — narratives come first",
            ],
            answer: 0,
            explain:
              "Selecting on an extreme almost guarantees the next stretch looks worse. Check regression before the story.",
          },
          {
            type: "fill",
            prompt: "The drift of extreme results back toward average is called _____ to the _____.",
            parts: [null, " to the ", null],
            bank: ["regression", "mean", "progression", "median", "mode"],
            answer: ["regression", "mean"],
            explain: "Regression to the mean — the phrase worth stealing for every film session.",
          },
          {
            type: "mc",
            prompt:
              "Which sample is more trustworthy for estimating true PPG?",
            options: [
              "2 games",
              "4 games",
              "16 games",
              "They're equal if the average matches",
            ],
            answer: 2,
            explain:
              "More independent observations → tighter estimate. Season-long beats a hot streak.",
          },
          {
            type: "mc",
            prompt:
              "League mate cherry-picks the three best weeks to argue a trade. What bias is that?",
            options: [
              "Selecting on extremes / cherry-picking",
              "The central limit theorem",
              "A controlled experiment",
              "Regression done correctly",
            ],
            answer: 0,
            explain:
              "Show all the weeks or you're selling a highlight reel as a scouting report.",
          },
        ],
      },
    ],
  },

  // ── Visualization ────────────────────────────────────────────────
  {
    id: "u28",
    number: 28,
    title: "Broadcast Booth — Viz Final",
    drive: "Broadcast · Own 25",
    description:
      "Pick the honest chart — axes, encodings, and making a fantasy point land.",
    skills: ["Chart choice", "Axes", "Capstone"],
    status: "live",
    lessons: [
      {
        id: "u28-l1",
        title: "Make the Point Land",
        blurb: "~30 min. Chart-choice and honesty checks for fantasy reports.",
        brief: {
          goal: "Choose charts that inform managers instead of misleading them.",
          steps: [
            {
              title: "You're on the broadcast",
              body: "Same data, different graphics, different stories. This final is about picking the encoding that matches the question — and refusing the ones that lie.",
            },
          ],
          setup:
            "Visualization final: chart choice, axis integrity, and fantasy-report judgment calls.",
        },
        intro: {
          title: "Match the chart to the question",
          text: "Trend over weeks → line. Part-to-whole → careful with pie. Rank → bar. Comparison across categories → bar or dot, not a 3D explosion.",
        },
        exercises: [
          {
            type: "mc",
            prompt:
              "Show Josh Allen's fantasy points across 17 weeks. Best default chart?",
            options: [
              "Pie chart with 17 slices",
              "Line chart with week on x and points on y",
              "3D exploding pie",
              "A table only — charts never help",
            ],
            answer: 1,
            explain:
              "Time series want lines (or connected dots). Pies are for part-to-whole with few categories.",
          },
          {
            type: "mc",
            prompt:
              "A bar chart of team totals starts the y-axis at 400 instead of 0. What happens?",
            options: [
              "Nothing — axes are decorative",
              "Tiny gaps look like blowouts — it exaggerates differences",
              "It improves accuracy",
              "It only matters for line charts",
            ],
            answer: 1,
            explain:
              "Truncated baselines are the classic lie factor in sports graphics.",
          },
          {
            type: "mc",
            prompt:
              "You want to compare PPG for five RBs. Best chart?",
            options: [
              "Pie",
              "Horizontal or vertical bars",
              "A stacked area with 12 seasons",
              "A map of the US",
            ],
            answer: 1,
            explain:
              "Bars encode magnitude with length — perfect for ranked category comparisons.",
          },
          {
            type: "mc",
            prompt: "Dual-axis chart: points on the left, temperature on the right. Risk?",
            options: [
              "None — dual axes are always clearer",
              "You can manufacture a correlation by scaling the axes independently",
              "Browsers can't render them",
              "Fantasy points aren't numeric",
            ],
            answer: 1,
            explain:
              "Independent scales let you draw any story you want. Prefer two charts or a shared scale.",
          },
          {
            type: "mc",
            prompt:
              "Color encoding: red = bad game, green = good. What's the accessibility catch?",
            options: [
              "None — everyone sees red/green the same",
              "Red/green alone fails many color-blind readers — add shape or labels",
              "Green is illegal in charts",
              "Only use grayscale forever",
            ],
            answer: 1,
            explain:
              "Don't rely on hue alone. Pattern, text, or position as a backup.",
          },
          {
            type: "fill",
            prompt: "A chart's job is to make a _____ land — not to decorate the slide.",
            parts: [null],
            bank: ["point", "logo", "animation", "gradient"],
            answer: ["point"],
            explain: "If the takeaway isn't obvious in two seconds, redesign.",
          },
          {
            type: "mc",
            prompt:
              "Part-to-whole: four position shares of a team's fantasy points. Acceptable?",
            options: [
              "Pie or stacked bar with clear labels — few slices",
              "Pie with 40 player slices",
              "Exploding 3D pie always",
              "Never show part-to-whole",
            ],
            answer: 0,
            explain:
              "Pies can work with few categories and labels. Forty slices is a spreadsheet in a circle.",
          },
          {
            type: "mc",
            prompt:
              "Before you publish a \"QB dead zone\" chart, you should…",
            options: [
              "Check the axis starts at zero (or intentionally annotate if not) and the sample is clear",
              "Add clipart of a football",
              "Remove the title so viewers guess",
              "Use Comic Sans for honesty",
            ],
            answer: 0,
            explain:
              "Honesty first: baseline, sample, and a title that states the claim.",
          },
        ],
      },
    ],
  },

  // ── Git ──────────────────────────────────────────────────────────
  {
    id: "u29",
    number: 29,
    title: "Locker Room — Git Final",
    drive: "Locker Room · Own 25",
    description:
      "Commits, branches, and PRs — keep the league's analytics repo from descending into chaos.",
    skills: ["commit", "branch", "PR", "Capstone"],
    status: "live",
    lessons: [
      {
        id: "u29-l1",
        title: "Repo on Game Day",
        blurb: "~30 min. Version-control judgment calls for a fantasy analytics repo.",
        brief: {
          goal: "Use Git the way a team actually ships lineup models.",
          steps: [
            {
              title: "main is protected",
              body: "You're contributing to sql-sports-league-analytics. The habits from the course — small commits, branches, pull requests — are what keep Sunday morning deploys calm.",
            },
          ],
          setup:
            "Git final: commits, branches, and PR workflow framed as a shared fantasy-analytics repo.",
        },
        intro: {
          title: "Don't commit straight to main",
          text: "Same commands you assembled in the unit — now as match-day decisions.",
        },
        exercises: [
          {
            type: "mc",
            prompt: "You fixed a bug in the projection script. Next step before sharing?",
            options: [
              "Email the file as projections_FINAL_v3.py",
              "Commit on a branch and open a pull request",
              "Rewrite history on main with force-push",
              "Delete .git so nobody sees the mistake",
            ],
            answer: 1,
            explain:
              "Branch + PR is how teams review lineup logic before it hits production.",
          },
          {
            type: "fill",
            prompt: "Stage everything and save a snapshot with a message.",
            parts: ["git ", null, " -", null, "\ngit ", null, " -m \"fix waiver wire join\""],
            bank: ["add", "A", "commit", "push", "status"],
            answer: ["add", "A", "commit"],
            explain: "git add -A then git commit -m \"…\" — the two-beat save.",
          },
          {
            type: "mc",
            prompt: "Why write commit messages that say what changed and why?",
            options: [
              "Git requires poetry",
              "Future you (and reviewers) need the story without diff archaeology",
              "Messages are unused metadata",
              "Only the hash matters",
            ],
            answer: 1,
            explain:
              "A good message is a scouting note for the next person in the film room.",
          },
          {
            type: "mc",
            prompt: "Two teammates edited the same line in roster.csv. After pull you see conflict markers. You should…",
            options: [
              "Delete the repo",
              "Resolve the conflict, then commit the merge",
              "Force-push and hope",
              "Ignore markers — Python will skip them",
            ],
            answer: 1,
            explain:
              "Conflicts are normal. Fix the file, commit the resolution, move on.",
          },
          {
            type: "fill",
            prompt: "Create and switch to a branch for the new DRO metric.",
            parts: ["git ", null, " -", null, " feature/dro-metric"],
            bank: ["checkout", "b", "branch", "switch", "clone"],
            answer: ["checkout", "b"],
            explain: "git checkout -b … (or git switch -c) — branch before you experiment.",
          },
          {
            type: "mc",
            prompt: "A pull request is…",
            options: [
              "A demand that GitHub merge without review",
              "A request to merge your branch, with discussion and checks attached",
              "A backup zip file",
              "Only used by open-source celebrities",
            ],
            answer: 1,
            explain:
              "PR = conversation + diff. Merge when the lineup model looks right.",
          },
          {
            type: "mc",
            prompt: "README for your fantasy analytics repo should include…",
            options: [
              "Nothing — code is self-documenting",
              "What it does, how to run it, and where the data comes from",
              "Only your fantasy team name",
              "A list of every NFL player ever",
            ],
            answer: 1,
            explain:
              "Portfolio readers and future you both need the how and the provenance.",
          },
          {
            type: "mc",
            prompt: "git status shows modified files you aren't ready to commit. Safe move?",
            options: [
              "Commit -a with message \"wip\" on main",
              "Leave them, or stash/commit on a branch — don't pollute main",
              "rm -rf the project",
              "Change the files to match HEAD silently without Git",
            ],
            answer: 1,
            explain:
              "Dirty tree is fine. Dirty main history shared with teammates is not.",
          },
        ],
      },
    ],
  },

  // ── R ────────────────────────────────────────────────────────────
  {
    id: "u30",
    number: 30,
    title: "Combine — R Final",
    drive: "Combine · Own 25",
    description:
      "dplyr verbs and a dash of ggplot thinking — fantasy tables in the tidyverse.",
    skills: ["dplyr", "ggplot2", "Capstone"],
    status: "live",
    lessons: [
      {
        id: "u30-l1",
        title: "Tidy Tape Review",
        blurb: "~30 min. Live dplyr drills plus chart-grammar checks.",
        brief: {
          goal: "Filter, summarise, and talk about charts the tidyverse way.",
          steps: [
            {
              title: "Same questions, R accent",
              body: "You've done these transforms in SQL and Python. dplyr's verbs — filter, mutate, group_by, summarise — are the tidy edition. Code drills run for real in WebR.",
            },
          ],
          setup:
            "R final: live dplyr against small fantasy frames, plus ggplot concept checks.",
        },
        intro: {
          title: "Pipe the plays",
          text: "Use |> (or %>%) to chain verbs. Print data frames so the grader can see them — as.data.frame(out) if a tibble is being shy.",
          code: "df |> filter(points > 20) |> summarise(n = n())",
        },
        exercises: [
          {
            type: "mc",
            prompt: "In dplyr, filter() is closest to which SQL clause?",
            options: ["GROUP BY", "WHERE", "ORDER BY", "JOIN"],
            answer: 1,
            explain: "filter() drops rows — WHERE's job.",
          },
          {
            type: "code",
            lang: "r",
            prompt:
              "Print the mean of points for this tiny frame (one number).",
            starter:
              "df <- data.frame(\n  player = c(\"Hurts\", \"Bijan\", \"Kelce\"),\n  points = c(24.6, 18.2, 22.4)\n)\n\n# print mean points\n",
            expected: "print(mean(c(24.6, 18.2, 22.4)))",
            hint: "mean(df$points) or mean(c(...))",
            explain: "21.733… — mean() is the base-R AVG.",
          },
          {
            type: "code",
            lang: "r",
            prompt:
              "Using dplyr, keep rows with points > 20 and print the result as a data.frame.",
            starter:
              'suppressMessages(library(dplyr))\n\ndf <- data.frame(\n  player = c("Hurts", "Bijan", "Kelce", "Nacua"),\n  points = c(24.6, 18.2, 22.4, 31.0)\n)\n\n# filter and print as.data.frame\n',
            expected:
              'suppressMessages(library(dplyr))\ndf <- data.frame(player=c("Hurts","Bijan","Kelce","Nacua"), points=c(24.6,18.2,22.4,31.0))\nprint(as.data.frame(df |> filter(points > 20)))',
            hint: "df |> filter(points > 20), then print(as.data.frame(...))",
            explain: "Hurts, Kelce, Nacua — Bijan stays on the bench for this cut.",
          },
          {
            type: "code",
            lang: "r",
            prompt:
              "Group by position and print mean points per position as a data.frame.",
            starter:
              'suppressMessages(library(dplyr))\n\ndf <- data.frame(\n  position = c("RB", "WR", "RB", "WR"),\n  points = c(18.2, 31.0, 12.4, 22.4)\n)\n\n# group_by + summarise, print as.data.frame\n',
            expected:
              'suppressMessages(library(dplyr))\ndf <- data.frame(position=c("RB","WR","RB","WR"), points=c(18.2,31.0,12.4,22.4))\nout <- df |> group_by(position) |> summarise(avg = mean(points))\nprint(as.data.frame(out))',
            hint: "group_by(position) |> summarise(avg = mean(points))",
            explain: "group_by + summarise = GROUP BY + AVG — third language, same idea.",
          },
          {
            type: "mc",
            prompt: "ggplot2 aes() does what?",
            options: [
              "Saves the file",
              "Maps data columns to visual properties like x, y, color",
              "Filters rows",
              "Installs packages",
            ],
            answer: 1,
            explain:
              "Aesthetic mappings declare what the columns mean visually; geoms decide the shape.",
          },
          {
            type: "mc",
            prompt:
              "Week on x, fantasy points on y, connected over time. Which geom?",
            options: ["geom_boxplot()", "geom_line()", "geom_bar() with no stat", "geom_blank()"],
            answer: 1,
            explain: "geom_line() for time series — same choice as the viz course.",
          },
          {
            type: "fill",
            prompt: "Tidyverse pipelines pass the left-hand data into the next verb with ____.",
            parts: ["df ", null, " filter(points > 20)"],
            bank: ["|>", "%>%", "&&", "<-", "::"],
            answer: ["|>"],
            explain:
              "|> is the base pipe (%>% still works in magrittr). Either habit is fine here.",
          },
          {
            type: "mc",
            prompt:
              "mutate() is for…",
            options: [
              "Dropping columns only",
              "Adding or changing columns — like a SELECT with computed fields",
              "Joining two databases on a server",
              "Opening ggplot",
            ],
            answer: 1,
            explain:
              "mutate(ppg = points / games) is the tidy version of a computed column.",
          },
        ],
      },
    ],
  },
];
