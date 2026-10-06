/**
 * The question bank's labels and prices, without the bank. Cards on the home
 * page and the dashboard show a language and an XP figure; importing these
 * from lib/questions.ts put every question, answer key and setup prelude in
 * those pages' JavaScript (2026-10-05). lib/questions.ts re-exports all of it.
 */

export type QuestionDifficulty = "easy" | "medium" | "hard";

/**
 * Which runtime grades this question.
 *
 * `sql` and `excel` run locally with no download. `python` pulls ~12 MB of
 * Pyodide and `r` ~30 MB of WebR, on first use only — which is why the
 * landing page's Question of the Day is pinned to SQL.
 */
export type QuestionLang = "sql" | "python" | "r" | "excel";

export const LANG_LABEL: Record<QuestionLang, string> = {
  sql: "SQL",
  python: "Python",
  r: "R",
  excel: "Excel",
};

/** Shown before a cold start, so a 30 MB download is never a surprise. */
export const LANG_WEIGHT: Partial<Record<QuestionLang, string>> = {
  python: "~12 MB first run",
  r: "~30 MB first run",
};

export const DIFFICULTY_XP: Record<QuestionDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
};
