/**
 * Arcade rewards + daily-quest claims + power-up inventory.
 * Keeps the sideline economy (tickets / timeouts) as the single currency.
 */

import {
  loadProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";
import {
  TICKET_DAILY_ARCADE_BONUS,
  XP_ARCADE_WIN,
} from "@/lib/arcade";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DAILY_QUEST_REWARDS: Record<string, number> = {
  "snap-today": 10,
  "xp-chunk": 12,
  arcade: 10,
  perfect: 15,
};

export type PowerUpId = "coach-whisper" | "soft-landing" | "double-tickets";

export const POWER_UP_COST: Record<PowerUpId, number> = {
  "coach-whisper": 25,
  "soft-landing": 35,
  "double-tickets": 40,
};

export function grantPowerUp(id: PowerUpId, qty = 1): Progress {
  const p = loadProgress();
  const next = { ...p };
  if (id === "coach-whisper") next.coachWhispers = (next.coachWhispers ?? 0) + qty;
  if (id === "soft-landing") next.softLandings = (next.softLandings ?? 0) + qty;
  if (id === "double-tickets")
    next.doubleTickets = (next.doubleTickets ?? 0) + qty;
  saveProgress(next);
  return next;
}

export function consumeCoachWhisper(): Progress | null {
  const p = loadProgress();
  if ((p.coachWhispers ?? 0) <= 0) return null;
  const next = { ...p, coachWhispers: p.coachWhispers - 1 };
  saveProgress(next);
  return next;
}

export function consumeSoftLanding(): Progress | null {
  const p = loadProgress();
  if ((p.softLandings ?? 0) <= 0) return null;
  const next = { ...p, softLandings: p.softLandings - 1 };
  saveProgress(next);
  return next;
}

/** Apply double-ticket charge if any; returns { progress, multiplier }. */
export function applyDoubleTickets(p: Progress): {
  progress: Progress;
  multiplier: number;
} {
  if ((p.doubleTickets ?? 0) <= 0) {
    return { progress: p, multiplier: 1 };
  }
  return {
    progress: { ...p, doubleTickets: p.doubleTickets - 1 },
    multiplier: 2,
  };
}

export function claimDailyQuest(
  questId: string,
): { ok: true; progress: Progress; tickets: number } | { ok: false; reason: string } {
  const p = loadProgress();
  const t = today();
  const reward = DAILY_QUEST_REWARDS[questId];
  if (!reward) return { ok: false, reason: "Unknown quest." };

  let claimed = p.dailyQuestsClaimed ?? [];
  let day = p.dailyQuestDay ?? "";
  if (day !== t) {
    claimed = [];
    day = t;
  }
  if (claimed.includes(questId)) {
    return { ok: false, reason: "Already claimed today." };
  }

  const next: Progress = {
    ...p,
    dailyQuestDay: day,
    dailyQuestsClaimed: [...claimed, questId],
    tickets: (p.tickets ?? 0) + reward,
  };
  saveProgress(next);
  return { ok: true, progress: next, tickets: reward };
}

export function isQuestClaimed(p: Progress, questId: string): boolean {
  const t = today();
  if ((p.dailyQuestDay ?? "") !== t) return false;
  return (p.dailyQuestsClaimed ?? []).includes(questId);
}

export type ArcadeKind = "match" | "speed" | "kick";

export function awardArcadeWin(opts: {
  kind: ArcadeKind;
  tickets: number;
  perfect: boolean;
}): { progress: Progress; tickets: number; dailyBonus: number; xp: number } {
  const p = loadProgress();
  const t = today();
  let arcadeDay = p.arcadeDay ?? "";
  let wins = p.arcadeWinsToday ?? 0;
  if (arcadeDay !== t) {
    arcadeDay = t;
    wins = 0;
  }

  let tickets = opts.tickets;
  let dailyBonus = 0;
  if (wins === 0) {
    dailyBonus = TICKET_DAILY_ARCADE_BONUS;
    tickets += dailyBonus;
  }

  // Light streak touch — arcade alone can keep the heater warm.
  let streak = p.streak;
  let lastActiveDay = p.lastActiveDay;
  if (lastActiveDay !== t) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().slice(0, 10);
    streak = lastActiveDay === yesterday ? streak + 1 : 1;
    lastActiveDay = t;
  }

  const next: Progress = {
    ...p,
    xp: p.xp + XP_ARCADE_WIN,
    tickets: (p.tickets ?? 0) + tickets,
    arcadeDay,
    arcadeWinsToday: wins + 1,
    streak,
    lastActiveDay,
  };
  saveProgress(next);
  return { progress: next, tickets, dailyBonus, xp: XP_ARCADE_WIN };
}
