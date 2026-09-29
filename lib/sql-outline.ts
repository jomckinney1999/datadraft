/**
 * Course order for SQL Foundations (16) and SQL Analytics (25).
 *
 * Live unit ids point at lessons that already exist. Shell ids (`sf-*`,
 * `sa-*`) are coming-soon placeholders so the roadmap shows the full course
 * in this order before those lessons are written. `moduleUnits()` turns a
 * shell id into an empty unit.
 *
 * Windows (`u6`) sit in Analytics, not Foundations. The rebuilt "first
 * queries" pilot (`f2`) is module 2; `u1` stays as the database walk-in
 * until that module is rewritten to match.
 */

export type SqlShell = {
  title: string;
  skills: string[];
  description: string;
};

export const SQL_SHELLS: Record<string, SqlShell> = {
  "sf-null": {
    title: "NULL & Missing Data",
    skills: ["IS NULL", "COALESCE", "NULLIF"],
    description:
      "What a missing value is, why = NULL never works, and how to fill or drop it on purpose.",
  },
  "sf-calc": {
    title: "Calculations & Expressions",
    skills: ["Arithmetic", "CASE", "WHEN"],
    description:
      "Build new columns out of ones you already have, including the rules a league uses to score a week.",
  },
  "sf-fn": {
    title: "SQL Functions",
    skills: ["COUNT", "CONCAT", "ROUND", "Dates"],
    description:
      "One function at a time, each from a small problem — not a glossary to memorize.",
  },
  "sf-sub": {
    title: "Subqueries",
    skills: ["WHERE subquery", "EXISTS", "Scalar"],
    description:
      "A query inside a query. Use one when the answer depends on another answer.",
  },
  "sf-set": {
    title: "Set Operations",
    skills: ["UNION", "UNION ALL", "EXCEPT"],
    description: "Stack two result sets, and know when duplicates should survive.",
  },
  "sf-dml": {
    title: "Data Modification",
    skills: ["INSERT", "UPDATE", "DELETE", "ROLLBACK"],
    description:
      "Change rows on purpose, and undo it. Kept careful — a delete with no filter is how leagues lose their history.",
  },
  "sf-ddl": {
    title: "Creating & Modifying Tables",
    skills: ["CREATE TABLE", "PRIMARY KEY", "FOREIGN KEY"],
    description:
      "Make a table, name its keys, and say which columns are not allowed to be empty.",
  },
  "sf-clean": {
    title: "Data Cleaning With SQL",
    skills: ["Duplicates", "TRIM", "Validation"],
    description:
      "Find the bad rows, standardize the names, and leave a column someone else can trust.",
  },
  "sf-debug": {
    title: "SQL Debugging",
    skills: ["Errors", "Ambiguous columns", "Join bugs"],
    description:
      "Getting an error isn't failing. Debugging is part of writing SQL.",
  },
  "sa-models": {
    title: "Advanced SQL Mental Models",
    skills: ["Execution order", "Grain", "Cardinality"],
    description:
      "What the database actually does with a query, and why one join can quietly multiply your rows.",
  },
  "sa-agg": {
    title: "Advanced Aggregation",
    skills: ["ROLLUP", "Conditional SUM", "Percent of total"],
    description:
      "More than one total in the same query — subtotals, shares, and segments.",
  },
  "sa-joins": {
    title: "Advanced JOIN Strategies",
    skills: ["Self join", "Anti join", "Row explosion"],
    description:
      "Joins that aren't a simple match: ranges, many-to-many, and the rows that shouldn't have doubled.",
  },
  "sa-sub": {
    title: "Advanced Subqueries",
    skills: ["Correlated", "EXISTS", "Derived tables"],
    description:
      "When a join, a CTE, and a subquery are three ways to ask the same thing — and how you pick.",
  },
  "sa-dates": {
    title: "Advanced Date & Time Analytics",
    skills: ["Date diff", "YoY", "Rolling periods"],
    description:
      "Weeks, seasons, and the gaps between games. Date-shaped questions, answered in SQL.",
  },
  "sa-kpi": {
    title: "Analytical SQL",
    skills: ["Ratios", "Percentiles", "Trends"],
    description:
      "KPIs, shares, outliers, and moving averages — the questions a manager actually asks.",
  },
  "sa-cohort": {
    title: "Cohort & Retention Analysis",
    skills: ["Cohorts", "Retention", "Repeat behavior"],
    description:
      "Who keeps showing up. Taught on fantasy lineups: which managers stay active week after week.",
  },
  "sa-case": {
    title: "Advanced CASE & Conditional Logic",
    skills: ["Nested CASE", "Bucketing", "Rules"],
    description:
      "Turn a number into a label — tiers, risk, and the business rule nobody wrote down.",
  },
  "sa-xform": {
    title: "Advanced Cleaning & Transformation",
    skills: ["Dedup", "Pivot", "Parsing"],
    description:
      "Shape a messy export into columns you can group. Split, combine, pivot, unpivot.",
  },
  "sa-temp": {
    title: "Temporary Tables & Intermediate Data",
    skills: ["Temp tables", "Staging", "Materialize"],
    description:
      "Save a step so the next query doesn't redo it. Temp-table drills still live inside the CTE unit until this splits out.",
  },
  "sa-perf": {
    title: "SQL Performance & Optimization",
    skills: ["Plans", "Filter early", "Cost"],
    description:
      "Why a correct query can still be the slow one. The indexing unit after this is where the indexes themselves get built.",
  },
  "sa-tx": {
    title: "Transactions & Concurrency",
    skills: ["COMMIT", "ROLLBACK", "Isolation"],
    description:
      "Two people editing the same table. What holds, what rolls back, and what a lock is for.",
  },
  "sa-model": {
    title: "Database Design & Data Modeling",
    skills: ["3NF", "Star schema", "Fact / dimension"],
    description:
      "How a warehouse is shaped, and why the tables look different from a live app.",
  },
  "sa-wh": {
    title: "Data Warehousing",
    skills: ["ETL", "MERGE", "Snapshots"],
    description:
      "How yesterday's games land in the table you query tomorrow. Loads, upserts, history.",
  },
  "sa-json": {
    title: "JSON & Semi-Structured Data",
    skills: ["JSON", "Arrays", "Flatten"],
    description:
      "When a column is a blob of JSON — pull the field out so SQL can see it.",
  },
  "sa-stack": {
    title: "SQL + Python + BI",
    skills: ["pandas", "Connections", "Dashboards"],
    description:
      "The query is the source. Python and a dashboard are where the result goes next.",
  },
  "sa-risk": {
    title: "SQL for Fraud, Risk & Anomaly Detection",
    skills: ["Duplicates", "Velocity", "Scoring"],
    description:
      "Spot the row that doesn't fit: repeats, bursts, and accounts that shouldn't link. Taught as pattern-finding, not as betting.",
  },
  "sa-biz": {
    title: "SQL for Business Analytics",
    skills: ["KPI", "Funnels", "Question → SQL"],
    description:
      "Start from the question a person asked, then the SQL. Revenue, customers, operations — the same moves on sports numbers.",
  },
  "sa-interview": {
    title: "SQL Interview Patterns",
    skills: ["Top-N", "Gaps", "Running totals"],
    description:
      "The shapes interview questions repeat. Learn the pattern, not one puzzle.",
  },
  "sa-craft": {
    title: "Professional SQL Practices",
    skills: ["Formatting", "Names", "Review"],
    description:
      "SQL someone else can read next month. Names, comments, and not SELECT *.",
  },
};

/** Foundations, in teaching order. */
export const FOUNDATIONS_UNIT_IDS = [
  "u1",
  "f2",
  "u2",
  "u3",
  "sf-null",
  "sf-calc",
  "sf-fn",
  "u4",
  "u5",
  "sf-sub",
  "sf-set",
  "sf-dml",
  "sf-ddl",
  "sf-clean",
  "sf-debug",
  "u23",
];

/** Analytics, in teaching order. Triggers (`u21`) are an appendix after the capstone. */
export const ANALYTICS_UNIT_IDS = [
  "sa-models",
  "u19",
  "u6",
  "sa-agg",
  "sa-joins",
  "sa-sub",
  "sa-dates",
  "sa-kpi",
  "sa-cohort",
  "sa-case",
  "sa-xform",
  "sa-temp",
  "u20",
  "sa-perf",
  "u22",
  "sa-tx",
  "sa-model",
  "sa-wh",
  "sa-json",
  "sa-stack",
  "sa-risk",
  "sa-biz",
  "sa-interview",
  "sa-craft",
  "u24",
  "u21",
];
