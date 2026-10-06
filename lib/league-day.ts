/**
 * The league's calendar day. Its own module so a client component that needs
 * today's date (Query Doctor's daily meter) doesn't import the question bank
 * to get it (2026-10-06). lib/questions.ts re-exports it.
 */

export const LEAGUE_TZ = "America/New_York";

/** Today's date in the league's timezone, as YYYY-MM-DD. */
export function leagueDay(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, which saves reassembling the parts by hand.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LEAGUE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
