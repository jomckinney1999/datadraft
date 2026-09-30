/**
 * What Coach tells you before a course starts.
 *
 * Learners used to land straight on a board of locked nodes with no idea what
 * the course covers, how the lessons work, which data they'd be using, or what
 * they'd be able to do at the end. This is that briefing.
 *
 * It also replaces the old "our league" framing. Nobody joined a fantasy
 * league; they opened a course. So the dataset is introduced as a dataset —
 * here is the table, here is what one row means, here is which parts are real
 * NFL data and which are small example tables we wrote to join against.
 *
 * No invented statistics and no promises about jobs, same rule as
 * lib/career.ts. "You'll be able to X" claims must be things the course
 * actually drills.
 */

import { FACTS } from "@/lib/lesson-facts.generated";

export type CourseIntro = {
  /** Module id from lib/curriculum.ts MODULES. */
  moduleId: string;
  /** Coach's opening line. One sentence, spoken. */
  greeting: string;
  /** What the course covers, in plain English. */
  whatYouLearn: string[];
  /** Which data you'll be working with. */
  dataset: { line: string; tables?: string[]; note?: string };
  /** What you can do — and what you'll have — when it's done. */
  outcome: string[];
  /** Overrides the shared mechanics below when a course works differently. */
  howItWorks?: string[];
};

/** How a lesson runs. True for every course unless one overrides it. */
export const DEFAULT_HOW_IT_WORKS = [
  "Lessons are short. A few minutes each, one idea at a time.",
  "Every lesson opens with a walkthrough, then you answer questions and write real code.",
  "Get one wrong and you'll see the answer and why, then that question comes back a couple of snaps later.",
  "Nothing to install and no account needed — it all runs in this browser, and your progress saves here.",
];

export const COURSE_INTROS: CourseIntro[] = [
  {
    moduleId: "sql-fundamentals",
    greeting:
      "SQL is how you get data out of a database, and it's the first thing on almost every analyst job post. We'll start from nothing.",
    whatYouLearn: [
      "Pull exactly the columns and rows you want (SELECT, WHERE, ORDER BY)",
      "Summarise a table — totals, averages, counts per group",
      "Combine two tables with JOINs, and spot when a join quietly duplicates rows",
      "Window functions are in Advanced SQL, not this course",
    ],
    dataset: {
      line: `One dataset the whole way through: weekly NFL fantasy scoring, ${FACTS.rows} games from ${FACTS.seasons[0]} through week ${FACTS.latest.week} of ${FACTS.latest.season}. One row is one player in one week.`,
      tables: ["week_results", "rosters", "waiver_wire"],
      note: "week_results is real data from nflverse. rosters and waiver_wire are a fantasy league from Sleeper: a draft run on real 2024 ADP, and the real 2024 waiver wire.",
    },
    outcome: [
      "Open a database you've never seen and answer a real question with SQL",
      "Read someone else's query and say what it returns",
      "Finish the course final: trade-deadline questions answered live against all three tables",
    ],
  },
  {
    moduleId: "sql-foundations",
    greeting:
      "Same SQL, rebuilt to teach one idea at a time. This is the new version of the course — tell us if it lands better.",
    whatYouLearn: [
      "Ask a database for exactly the columns you want",
      "Drop duplicate values with DISTINCT",
      "Rename what comes back, and leave notes in your SQL",
      "Understand the order a database actually reads your query in",
    ],
    dataset: {
      line: `Weekly NFL fantasy scoring — ${FACTS.rows} real games, ${FACTS.players} players, ${FACTS.seasons[0]} through week ${FACTS.latest.week} of ${FACTS.latest.season}. One row is one player in one week.`,
      tables: ["week_results", "rosters", "waiver_wire"],
      note: "week_results is real. The other two are small example tables for join practice.",
    },
    outcome: [
      "Write a SELECT against any table without looking up the shape of it",
      "Explain what one row in an unfamiliar table represents — the first question worth asking",
    ],
  },
  {
    moduleId: "sql-advanced",
    greeting:
      "You can already answer a question with SQL. This course is about making a query reusable, readable, and fast.",
    whatYouLearn: [
      "Break a long query into named steps with CTEs",
      "Save a query as a view so other people can use it",
      "Read a query plan and see why something is slow",
      "Know what an index does, and when it doesn't help",
    ],
    dataset: {
      line: "The same three tables as SQL Fundamentals, so nothing new to learn about the data — the difficulty is all in the SQL.",
      tables: ["week_results", "rosters", "waiver_wire"],
    },
    outcome: [
      "Take a 40-line query and restructure it so someone else can follow it",
      "Explain why one version of a query beats another instead of guessing",
    ],
  },
  {
    moduleId: "python",
    greeting:
      "Python picks up where a spreadsheet gives out. We'll write real code that runs right here — no install.",
    whatYouLearn: [
      "Variables, lists, loops and conditions from scratch",
      "Functions, and why you'd write one",
      "pandas DataFrames — the same filtering and grouping you did in SQL",
      "Loading real data and cleaning what's wrong with it",
    ],
    dataset: {
      line: "The same NFL weekly scoring, loaded into a pandas DataFrame — so you can see the SQL you know and the pandas you're learning do the same job.",
      note: "Your code runs in a real Python interpreter in this tab (Pyodide). It's the same Python, not a simulation.",
    },
    outcome: [
      "Write a small script that loads a file, filters it, and prints an answer",
      "Translate a query you'd write in SQL into pandas, and back",
    ],
  },
  {
    moduleId: "excel",
    greeting:
      "Excel is unglamorous and it's on more job posts than anything else here. A lot of analyst work is still a spreadsheet.",
    whatYouLearn: [
      "Formulas, cell references, and what the $ in $E$2 is actually for",
      "IF, COUNTIF, SUMIF — logic and conditional math",
      "VLOOKUP, INDEX/MATCH and XLOOKUP, and when each one breaks",
      "Cleaning a messy export: stray spaces, numbers stored as text, blanks",
    ],
    dataset: {
      line: "A two-tab workbook: a clean roster sheet, and an Import tab that's deliberately dirty — the kind of export you actually get sent.",
      tables: ["Roster", "Import"],
      note: "Your formulas are evaluated for real and graded on the value they produce, so any correct spelling passes.",
    },
    outcome: [
      "Build a working lookup against a sheet you didn't make",
      "Spot why a total is wrong when the cells look fine",
    ],
  },
  {
    moduleId: "stats",
    greeting:
      "This one stops you reporting a fluke as a fact. It's the difference between pulling numbers and being trusted with them.",
    whatYouLearn: [
      "Mean versus median, and when the average lies",
      "Sample size — how much data you need before a difference means anything",
      "Regression to the mean, and why last week's outlier cools off",
      "Correlation, and what it doesn't prove",
    ],
    dataset: {
      line: "Worked examples from the same NFL scoring data, where a hot streak and random noise look identical until you check.",
    },
    outcome: [
      "Say whether a difference in a report is real or just noise",
      "Push back on a confident claim built from eight data points",
    ],
    howItWorks: [
      "Lessons are short, one idea at a time.",
      "This course is reasoning rather than code — questions put you in a situation and ask what you'd conclude.",
      "Get one wrong and you'll see the answer and why, then it comes back a couple of snaps later.",
      "Nothing to install; your progress saves in this browser.",
    ],
  },
  {
    moduleId: "git",
    greeting:
      "Git is how your work becomes something a hiring manager can open. Most portfolio projects die on this step.",
    whatYouLearn: [
      "Commits, and writing a message that means something later",
      "Branches, and why you don't work on main",
      "Pull requests and review",
      "Fixing the common mess: wrong branch, wrong commit, conflicts",
    ],
    dataset: {
      line: "A worked analytics repo — the same project files you'd have after a course capstone.",
    },
    outcome: [
      "Put a project on GitHub with a history someone can read",
      "Recover from the usual mistakes without starting over",
    ],
    howItWorks: [
      "Lessons are short, one idea at a time.",
      "Git runs on your own machine, so this course teaches the commands and what they do rather than running them here.",
      "Get one wrong and you'll see the answer and why, then it comes back a couple of snaps later.",
      "Your progress saves in this browser.",
    ],
  },
  {
    moduleId: "r",
    greeting:
      "R is the other dialect. Worth your time for a specific reason — sports and academic analytics are full of it — and skippable if you just want a company analyst job.",
    whatYouLearn: [
      "Vectors and data frames, R's way of holding a table",
      "dplyr verbs: filter, select, mutate, group_by, summarise",
      "ggplot2 — building a chart in layers",
      "Reading R code you'll meet in public sports analytics",
    ],
    dataset: {
      line: "The same NFL weekly scoring, as an R data frame, so the comparison with pandas and SQL is direct.",
      note: "Your R runs for real in this tab (WebR).",
    },
    outcome: [
      "Do a full filter-group-summarise pass in dplyr",
      "Read a tidyverse script without getting lost in the pipes",
    ],
  },
];

export function introFor(moduleId: string | null | undefined) {
  if (!moduleId) return undefined;
  return COURSE_INTROS.find((c) => c.moduleId === moduleId);
}
