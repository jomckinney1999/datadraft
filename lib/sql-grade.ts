/**
 * Shared SQL result grading — lesson player and interview cases both compare
 * learner output to an answer key by value, not by query text.
 */

import type { QueryExecResult } from "sql.js";

export function normalizeResult(
  res: QueryExecResult | undefined,
  orderMatters: boolean,
): string {
  if (!res || res.columns.length === 0) return "empty";
  const rows = res.values.map((row) =>
    row.map((cell) =>
      typeof cell === "number"
        ? String(Math.round(cell * 1000) / 1000)
        : String(cell),
    ),
  );
  if (!orderMatters) {
    rows.sort((a, b) => {
      const ka = a.join("");
      const kb = b.join("");
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
  }
  return JSON.stringify(rows);
}

export function resultsMatch(
  learner: QueryExecResult | undefined,
  expected: QueryExecResult | undefined,
  orderMatters = false,
): boolean {
  return (
    normalizeResult(learner, orderMatters) ===
    normalizeResult(expected, orderMatters)
  );
}
