/**
 * Rapid Fire — non-linear practice snaps by language.
 * Pulls real multiple-choice drills from the live curriculum, merges the
 * extra bank in lib/rapid-bank.ts, shuffles them, and pays scouting tickets.
 * No timeouts, no path order.
 *
 * This file is the light half: languages, timings, scoring and the payout.
 * Dealing a round reads the curriculum, so that lives in lib/rapid-deck.ts
 * and is imported when a round starts, never with the page.
 */

import { loadProgress, saveProgress, type Progress } from "./progress";

export type RapidLangId =
  | "sql"
  | "python"
  | "excel"
  | "r"
  | "stats"
  | "git";

export type RapidLang = {
  id: RapidLangId;
  label: string;
  blurb: string;
  moduleIds: string[];
  accent: "turf" | "ice" | "gold";
};

export const RAPID_LANGS: RapidLang[] = [
  {
    id: "sql",
    label: "SQL",
    blurb: "SELECT through JOINs — rapid recognition.",
    moduleIds: ["sql-fundamentals", "sql-advanced"],
    accent: "turf",
  },
  {
    id: "python",
    label: "Python",
    blurb: "Variables, loops, pandas instincts.",
    moduleIds: ["python"],
    accent: "ice",
  },
  {
    id: "excel",
    label: "Excel",
    blurb: "Formulas, lookups, cleaning habits.",
    moduleIds: ["excel"],
    accent: "gold",
  },
  {
    id: "r",
    label: "R",
    blurb: "tidyverse fluency under the clock.",
    moduleIds: ["r"],
    accent: "ice",
  },
  {
    id: "stats",
    label: "Stats",
    blurb: "Mean, sample size, regression to the mean.",
    moduleIds: ["stats"],
    accent: "gold",
  },
  {
    id: "git",
    label: "Git",
    blurb: "Commits, branches, PRs — no dead ends.",
    moduleIds: ["git"],
    accent: "turf",
  },
];

export type RapidQuestion = {
  id: string;
  lang: RapidLangId;
  prompt: string;
  code?: string;
  choices: string[];
  answer: number;
  explain: string;
  lessonId: string;
};

export const RAPID_ROUND_SIZE = 10;
export const RAPID_SECONDS = 12;
export const TICKET_PER_HIT = 2;
export const TICKET_PERFECT_ROUND = 8;
export const TICKET_STREAK_3 = 3;

export function getRapidLang(id: string): RapidLang | undefined {
  return RAPID_LANGS.find((l) => l.id === id);
}

export function scoreRapidRound(opts: {
  correct: number;
  total: number;
  bestStreak: number;
}): { tickets: number; perfect: boolean } {
  let tickets = opts.correct * TICKET_PER_HIT;
  if (opts.bestStreak >= 3) tickets += TICKET_STREAK_3;
  const perfect = opts.correct === opts.total && opts.total > 0;
  if (perfect) tickets += TICKET_PERFECT_ROUND;
  return { tickets, perfect };
}

/** Persist ticket payout + light streak touch (keeps heater warm). */
export function awardRapidFire(tickets: number): Progress {
  const p = loadProgress();
  const t = new Date().toISOString().slice(0, 10);
  let streak = p.streak;
  let lastActiveDay = p.lastActiveDay;
  if (lastActiveDay !== t) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().slice(0, 10);
    streak = lastActiveDay === yesterday ? streak + 1 : Math.max(1, streak);
    lastActiveDay = t;
  }
  const next: Progress = {
    ...p,
    tickets: (p.tickets ?? 0) + tickets,
    streak,
    lastActiveDay,
    xp: p.xp + tickets, // small XP echo so the board moves
  };
  saveProgress(next);
  return next;
}
