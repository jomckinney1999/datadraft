/**
 * Rapid Fire — non-linear practice snaps by language.
 * Pulls real multiple-choice drills from the live curriculum, merges the
 * extra bank in lib/rapid-bank.ts, shuffles them, and pays scouting tickets.
 * No timeouts, no path order.
 */

import { liveLessons, type MCExercise } from "./curriculum";
import { rapidBankFor } from "./rapid-bank";
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

/** Build the MC bank for a language from live curriculum + rapid-bank extras. */
export function buildRapidBank(langId: RapidLangId): RapidQuestion[] {
  const lang = getRapidLang(langId);
  if (!lang) return [];
  const out: RapidQuestion[] = [];

  for (const moduleId of lang.moduleIds) {
    for (const { lesson } of liveLessons(moduleId)) {
      lesson.exercises.forEach((ex, i) => {
        if (ex.type !== "mc") return;
        const mc = ex as MCExercise;
        out.push({
          id: `${lesson.id}:${i}`,
          lang: langId,
          prompt: mc.prompt,
          code: mc.code,
          choices: mc.options,
          answer: mc.answer,
          explain: mc.explain,
          lessonId: lesson.id,
        });
      });
    }
  }
  for (const snap of rapidBankFor(langId)) {
    out.push({
      id: snap.id,
      lang: langId,
      prompt: snap.prompt,
      code: snap.code,
      choices: snap.choices,
      answer: snap.answer,
      explain: snap.explain,
      lessonId: "rapid-bank",
    });
  }
  return out;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Multiple-choice snaps from one course, for a stop on that course's path. */
export function dealCourseRound(
  moduleId: string,
  size = 5,
  seed?: number,
): RapidQuestion[] {
  const out: RapidQuestion[] = [];
  for (const { lesson } of liveLessons(moduleId)) {
    lesson.exercises.forEach((ex, i) => {
      if (ex.type !== "mc") return;
      const mc = ex as MCExercise;
      out.push({
        id: `${lesson.id}:${i}`,
        lang: "sql",
        prompt: mc.prompt,
        code: mc.code,
        choices: mc.options,
        answer: mc.answer,
        explain: mc.explain,
        lessonId: lesson.id,
      });
    });
  }
  if (out.length === 0) return [];
  const rand = mulberry32(
    seed ?? (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0,
  );
  const copy = [...out];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(size, copy.length));
}

/** Shuffle a fresh round. Seed optional for tests. */
export function dealRapidRound(
  langId: RapidLangId,
  size = RAPID_ROUND_SIZE,
  seed?: number,
): RapidQuestion[] {
  const bank = buildRapidBank(langId);
  if (bank.length === 0) return [];
  const rand = mulberry32(
    seed ?? (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0,
  );
  const copy = [...bank];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(size, copy.length));
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
