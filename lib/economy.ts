/**
 * Football-themed free-tier economy (Duo hearts/gems/streak-freeze).
 *
 * Timeouts  → daily lesson starts (lives)
 * Tickets   → scouting currency (gems)
 * Bye weeks → protect the heater streak one missed day (freeze)
 * Season Pass → Practice-tier unlimited timeouts (local flag + waitlist CTA;
 *               real Stripe checkout stays blocked until legal/business ready)
 *
 * Free on purpose: Practice Field never spends a timeout.
 */

import {
  loadProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";

export const FREE_DAILY_TIMEOUTS = 5;
export const STARTER_TICKETS = 40;

export const TICKET_LESSON = 8;
export const TICKET_PERFECT_BONUS = 7;
export const TICKET_STREAK_BONUS = 2; // per day of streak, capped
export const TICKET_STREAK_CAP = 10;

export const COST_TIMEOUT_REFILL_ONE = 15;
export const COST_TIMEOUT_REFILL_FULL = 50;
export const COST_BYE_WEEK = 120;
/** Undo a hard miss and re-take the same snap (solution stays hidden). */
export const COST_INSTANT_REPLAY = 12;
/** After a turnover on downs — buy one more chance at the same play. */
export const COST_CHALLENGE_FLAG = 25;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 999;
  const ms =
    new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime();
  return Math.round(ms / 86_400_000);
}

/** Apply daily timeout refill + spend bye weeks on a 1-day gap. */
export function reconcileEconomy(p: Progress): Progress {
  const t = today();
  let next = { ...p };
  let dirty = false;

  // Daily timeout top-up (Season Pass always sits at the free daily max).
  if (next.timeoutsRefilledDay !== t) {
    next.timeouts = next.seasonPass
      ? FREE_DAILY_TIMEOUTS
      : FREE_DAILY_TIMEOUTS;
    next.timeoutsRefilledDay = t;
    dirty = true;
  }

  // One bye week covers exactly one missed calendar day.
  if (
    next.lastActiveDay &&
    next.lastActiveDay !== t &&
    next.lastActiveDay !== yesterday() &&
    next.byeWeeks > 0
  ) {
    const gap = daysBetween(next.lastActiveDay, t);
    if (gap === 2) {
      next.byeWeeks -= 1;
      next.lastActiveDay = yesterday();
      next.byeUsedOn = t;
      dirty = true;
    }
  }

  if (dirty) saveProgress(next);
  return next;
}

export function loadEconomy(): Progress {
  return reconcileEconomy(loadProgress());
}

export function canStartLesson(p: Progress = loadEconomy()): boolean {
  if (p.seasonPass) return true;
  return p.timeouts > 0;
}

/** Spend one timeout to take the field. Returns null if empty. */
export function spendTimeout(): Progress | null {
  const p = loadEconomy();
  if (p.seasonPass) return p;
  if (p.timeouts <= 0) return null;
  const next = { ...p, timeouts: p.timeouts - 1 };
  saveProgress(next);
  return next;
}

export function awardLessonTickets(
  p: Progress,
  opts: { perfect: boolean },
): Progress {
  let gain = TICKET_LESSON;
  if (opts.perfect) gain += TICKET_PERFECT_BONUS;
  gain += Math.min(TICKET_STREAK_CAP, Math.max(0, p.streak) * TICKET_STREAK_BONUS);
  return { ...p, tickets: p.tickets + gain };
}

/** Spend tickets for instant replay / challenge flag. Null if broke. */
export function spendTickets(
  amount: number,
): Progress | null {
  const p = loadEconomy();
  if (amount <= 0) return p;
  if (p.tickets < amount) return null;
  const next = { ...p, tickets: p.tickets - amount };
  saveProgress(next);
  return next;
}

export type ShopItemId = "timeout-1" | "timeout-full" | "bye-week";

export function shopPrice(id: ShopItemId): number {
  switch (id) {
    case "timeout-1":
      return COST_TIMEOUT_REFILL_ONE;
    case "timeout-full":
      return COST_TIMEOUT_REFILL_FULL;
    case "bye-week":
      return COST_BYE_WEEK;
  }
}

export function buyShopItem(id: ShopItemId): { ok: true; progress: Progress } | { ok: false; reason: string } {
  const p = loadEconomy();
  const price = shopPrice(id);
  if (p.tickets < price) {
    return { ok: false, reason: `Need ${price} tickets — you have ${p.tickets}.` };
  }
  let next: Progress = { ...p, tickets: p.tickets - price };
  if (id === "timeout-1") {
    next.timeouts = Math.min(FREE_DAILY_TIMEOUTS, next.timeouts + 1);
  } else if (id === "timeout-full") {
    next.timeouts = FREE_DAILY_TIMEOUTS;
  } else {
    next.byeWeeks += 1;
  }
  saveProgress(next);
  return { ok: true, progress: next };
}

export function grantSeasonPassDemo(on = true): Progress {
  const p = loadEconomy();
  const next = {
    ...p,
    seasonPass: on,
    timeouts: on ? FREE_DAILY_TIMEOUTS : p.timeouts,
  };
  saveProgress(next);
  return next;
}
