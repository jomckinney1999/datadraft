/**
 * The free tier's daily taste of Query Doctor: one diagnosis a day
 * (FREE_ALLOWANCE in lib/season-pass.ts), counted in this browser.
 *
 * Spending is idempotent per diagnosis: showing the same findings again (a
 * re-render, React running an effect twice in development) doesn't spend a
 * second one. Like every free allowance here it's a nudge, not a lock.
 */

import { FREE_ALLOWANCE } from "@/lib/season-pass";

const KEY = "sqlsports.pass.meter.v1";

type Meter = { day: string; doctor: number; last: string | null };

function read(day: string): Meter {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) ?? "null") as Meter | null;
    if (m && m.day === day) return m;
  } catch {
    /* blocked or corrupt: start the day fresh */
  }
  return { day, doctor: 0, last: null };
}

/**
 * Show this diagnosis? True if it's the one already shown, or if today's
 * allowance has room (and then it's spent). `signature` identifies the
 * diagnosis: the query plus what was found.
 */
export function spendDoctor(day: string, signature: string): boolean {
  const m = read(day);
  if (m.last === signature) return true;
  if (m.doctor >= FREE_ALLOWANCE.doctorPerDay) return false;
  const next = { day, doctor: m.doctor + 1, last: signature };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* can't count it, so don't block it either */
  }
  return true;
}
