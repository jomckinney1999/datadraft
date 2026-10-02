/**
 * The Wordle-shaped parts of the daily games: a number for the day, a
 * countdown to the next one, a result small enough to put in a link, and one
 * share action that uses the phone's share sheet and falls back to copying.
 *
 * Light on purpose — no lesson data in here — so the Stat Duel, the daily
 * question and the link-preview image can all import it.
 *
 * The result in a challenge link is the score and nothing else: which rounds
 * were right, never which side was picked, so a link can't hand a friend the
 * answers.
 */

/** Daily #1 — the Stat Duel's first day. */
export const DAILY_LAUNCH = "2026-10-02";
const DAY_MS = 86_400_000;

export function dailyNumber(day: string): number {
  return Math.floor((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${DAILY_LAUNCH}T00:00:00Z`)) / DAY_MS) + 1;
}

/** Milliseconds until midnight in the league's timezone, when the dailies turn over. */
export function msUntilNextLeagueDay(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const elapsed = ((get("hour") % 24) * 3600 + get("minute") * 60 + get("second")) * 1000 + now.getMilliseconds();
  return Math.max(0, DAY_MS - elapsed);
}

export function formatCountdown(ms: number): string {
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export type DuelResult = { number: number; grid: boolean[]; score: number };

/** "1-GGRGG": the duel number, then G for a right round and R for a wrong one. */
export function encodeDuelResult(number: number, grid: boolean[]): string {
  return `${number}-${grid.map((ok) => (ok ? "G" : "R")).join("")}`;
}

export function parseDuelResult(code: string | null | undefined): DuelResult | null {
  const m = /^(\d{1,4})-([GR]{5})$/.exec(code ?? "");
  if (!m) return null;
  const grid = m[2].split("").map((c) => c === "G");
  return { number: Number(m[1]), grid, score: grid.filter(Boolean).length };
}

export const squares = (grid: boolean[]) => grid.map((ok) => (ok ? "🟩" : "🟥")).join("");

/**
 * Share text the way people actually share: the phone's share sheet where
 * there is one, the clipboard where there isn't.
 */
export async function shareText(text: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ text });
      return "shared";
    }
  } catch (e) {
    // Dismissing the sheet is not a failure, and isn't a cue to copy either.
    if (e instanceof Error && e.name === "AbortError") return "shared";
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
