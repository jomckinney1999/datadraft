/**
 * The SQL patterns analyst screens actually test, and which questions in the
 * bank practise each one.
 *
 * A pattern is matched from a question's tags rather than stored on it, so a
 * new question lands in the right pattern by being tagged honestly, and one
 * question can count for two patterns (a LEFT JOIN anti-join is both a join
 * and a NULL question). The verifier fails when a pattern has fewer than
 * MIN_PER_PATTERN SQL questions: a pattern with one question isn't practice.
 */

import { QUESTIONS, type Question } from "@/lib/questions";

export type Pattern = {
  id: string;
  name: string;
  /** What a screen asks, in one line. */
  asks: string;
  /** Tags that put a question in this pattern (case-insensitive). */
  tags: string[];
};

export const MIN_PER_PATTERN = 4;

export const PATTERNS: Pattern[] = [
  {
    id: "filter-sort",
    name: "Filter and sort",
    asks: "Find the rows that match, in the right order, top N.",
    tags: ["WHERE", "ORDER BY", "LIMIT", "DISTINCT", "IN", "LIKE", "BETWEEN"],
  },
  {
    id: "aggregate",
    name: "Group and aggregate",
    asks: "Totals, averages and counts per thing, and filtering the groups.",
    tags: ["GROUP BY", "COUNT", "SUM", "AVG", "HAVING", "MIN", "MAX", "Multiple grains"],
  },
  {
    id: "joins",
    name: "Joins",
    asks: "Combine tables without losing or doubling rows.",
    tags: ["JOIN", "LEFT JOIN", "Self-join", "Anti-join"],
  },
  {
    id: "case",
    name: "Conditional logic",
    asks: "Buckets, flags and pivots with CASE WHEN.",
    tags: ["CASE", "Pivot", "Conditional aggregation"],
  },
  {
    id: "subqueries",
    name: "Subqueries and CTEs",
    asks: "Answer a question about an answer: aggregate, then filter or compare.",
    tags: ["Subquery", "CTE", "WITH"],
  },
  {
    id: "ranking",
    name: "Ranking and top-N per group",
    asks: "The best one in each group, with ties handled on purpose.",
    tags: ["RANK", "ROW_NUMBER", "DENSE_RANK", "Top-N", "PARTITION BY"],
  },
  {
    id: "running",
    name: "Running totals and change",
    asks: "Cumulative sums, moving averages, this week against last.",
    tags: ["LAG", "LEAD", "Frame", "Running total", "Gaps and islands", "Moving average"],
  },
  {
    id: "dates",
    name: "Dates",
    asks: "Days, weekdays and gaps between dates.",
    tags: ["Dates", "strftime", "julianday"],
  },
  {
    id: "nulls",
    name: "NULLs and messy data",
    asks: "Missing values, duplicates and rows with no match.",
    tags: ["NULL", "COALESCE", "Dedup", "Anti-join"],
  },
];

export function questionsFor(pattern: Pattern): Question[] {
  const wanted = pattern.tags.map((t) => t.toLowerCase());
  return QUESTIONS.filter((q) => q.lang === "sql" && q.tags.some((t) => wanted.includes(t.toLowerCase())));
}

export function patternOf(id: string): Pattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}
