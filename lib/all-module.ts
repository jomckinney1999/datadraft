/**
 * The id of the combined pathway (every live unit). Its own module so
 * lib/courses.ts, which the home page's client course rail imports, can name
 * it without pulling the whole curriculum into the browser (2026-10-05).
 * lib/curriculum.ts re-exports it, so existing imports keep working.
 */
export const ALL_MODULE = "all";
