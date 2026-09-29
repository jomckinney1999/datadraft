/**
 * Which of our tables a piece of lesson text is talking about.
 *
 * A question like "One row in week_results represents…" names a table the
 * learner may not have on screen. Rather than authoring a preview onto every
 * exercise — which we would forget to do, and which would leave older content
 * behind — the player scans the prompt and offers the tables it finds.
 *
 * Matching is word-boundary against the real seeded schema, so prose about
 * "the roster" doesn't offer the `rosters` table, and a table renamed in
 * fantasy-data.ts stops matching here rather than pointing at nothing.
 */

import { SCHEMA } from "./fantasy-data";

/** Table names in schema order, longest first so `week_results` wins over any prefix. */
const NAMES = SCHEMA.map((t) => t.table).sort((a, b) => b.length - a.length);

export function tablesMentioned(...texts: (string | undefined)[]): string[] {
  const haystack = texts.filter(Boolean).join("\n");
  if (!haystack) return [];
  const hits = NAMES.filter((name) =>
    new RegExp(`(^|[^\\w])${name}([^\\w]|$)`).test(haystack),
  );
  // Back to schema order, so the peek buttons don't reshuffle between questions.
  return SCHEMA.map((t) => t.table).filter((t) => hits.includes(t));
}
