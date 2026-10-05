/**
 * Which questions stay free once the Season Pass gate is on
 * (docs/OFFER.md §2). Separate from lib/season-pass.ts because it needs the
 * question bank, and that file is imported by the tag on every Pass feature.
 *
 * Free, always:
 *   - today's daily, in every language;
 *   - any question for 7 days after it was a daily, so a friend's challenge
 *     link never lands on a paywall;
 *   - the home page's easy question, for the same 7 days, because the front
 *     door is a growth surface and never sits behind the Pass;
 *   - the starter set, the bank's original on-ramp.
 */

import { frontDoorQuestion, isDailyQuestion, type Question } from "@/lib/questions";

/** How long a question stays free after its day as the daily. */
export const DAILY_FREE_DAYS = 7;

/** The first ten easy SQL questions: the on-ramp a new player meets first. */
export const STARTER_QUESTIONS: readonly string[] = [
  "week-3-hammer",
  "the-quarterbacks",
  "thirty-burger",
  "games-actually-played",
  "rough-afternoon",
  "whos-on-my-team",
  "waiver-risers",
  "the-slate",
  "indoor-football",
  "tight-end-premium",
];

function daysBefore(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Free without a Pass, on `day` (the league day, resolved on the server). */
export function questionIsFree(q: Question, day: string): boolean {
  if (STARTER_QUESTIONS.includes(q.id)) return true;
  for (let i = 0; i < DAILY_FREE_DAYS; i++) {
    const d = daysBefore(day, i);
    if (isDailyQuestion(d, q)) return true;
    if (frontDoorQuestion(d).question.id === q.id) return true;
  }
  return false;
}
