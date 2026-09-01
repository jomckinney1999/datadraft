/**
 * Trophy case: what a learner has actually achieved, in football terms.
 *
 * Badges are evaluated from stats that already exist in `Progress` rather than
 * from a separate event log. That means they are recomputed, not incremented —
 * so a badge can never be "spent" or lost by a failed write, and a learner who
 * syncs progress from another device gets the badges that device earned
 * without any reconciliation logic.
 *
 * Every badge is unlockable by doing the work. None of them are time-gated or
 * luck-based: if a learner asks "how do I get that one", the answer is always
 * a thing they can go and do.
 */

import { COURSE, MODULES, ALL_MODULE, type Unit } from "@/lib/curriculum";
import type { Progress } from "@/lib/progress";

export type Badge = {
  id: string;
  name: string;
  /** How to earn it, phrased as the requirement. */
  requirement: string;
  /** Emoji used as the trophy-case glyph. */
  glyph: string;
  tier: "bronze" | "silver" | "gold";
  /** Progress toward the badge, for the "3 / 5" bar. */
  progress: (s: BadgeStats) => { have: number; need: number };
};

/** Everything the predicates are allowed to look at. */
export type BadgeStats = {
  xp: number;
  lessonsDone: number;
  perfectLessons: number;
  bestCombo: number;
  streak: number;
  totalYards: number;
  /** Distinct courses (modules) the learner has finished a lesson in. */
  coursesTouched: number;
};

const count = (have: number, need: number) => ({ have: Math.min(have, need), need });

export const BADGES: Badge[] = [
  {
    id: "first-snap",
    name: "First Snap",
    requirement: "Finish your first lesson",
    glyph: "🏈",
    tier: "bronze",
    progress: (s) => count(s.lessonsDone, 1),
  },
  {
    id: "moving-chains",
    name: "Moving the Chains",
    requirement: "Finish 5 lessons",
    glyph: "⛓️",
    tier: "bronze",
    progress: (s) => count(s.lessonsDone, 5),
  },
  {
    id: "workhorse",
    name: "Workhorse",
    requirement: "Finish 15 lessons",
    glyph: "🐎",
    tier: "silver",
    progress: (s) => count(s.lessonsDone, 15),
  },
  {
    id: "franchise",
    name: "Franchise Player",
    requirement: "Finish 40 lessons",
    glyph: "🏛️",
    tier: "gold",
    progress: (s) => count(s.lessonsDone, 40),
  },
  {
    id: "perfect-drive",
    name: "Perfect Drive",
    requirement: "Clear a lesson without a single miss",
    glyph: "🎯",
    tier: "bronze",
    progress: (s) => count(s.perfectLessons, 1),
  },
  {
    id: "hat-trick",
    name: "Hat Trick",
    requirement: "Three perfect drives",
    glyph: "🎩",
    tier: "silver",
    progress: (s) => count(s.perfectLessons, 3),
  },
  {
    id: "mvp",
    name: "MVP Season",
    requirement: "Ten perfect drives",
    glyph: "🏆",
    tier: "gold",
    progress: (s) => count(s.perfectLessons, 10),
  },
  {
    id: "heater",
    name: "Heater",
    requirement: "7 correct answers in a row",
    glyph: "🔥",
    tier: "bronze",
    progress: (s) => count(s.bestCombo, 7),
  },
  {
    id: "unconscious",
    name: "Unconscious",
    requirement: "15 correct answers in a row",
    glyph: "⚡",
    tier: "gold",
    progress: (s) => count(s.bestCombo, 15),
  },
  {
    id: "iron-man",
    name: "Iron Man",
    requirement: "A 7-day streak",
    glyph: "🛡️",
    tier: "silver",
    progress: (s) => count(s.streak, 7),
  },
  {
    id: "utility",
    name: "Utility Player",
    requirement: "Finish a lesson in 3 different courses",
    glyph: "🧰",
    tier: "silver",
    progress: (s) => count(s.coursesTouched, 3),
  },
  {
    id: "field-general",
    name: "Field General",
    requirement: "Gain 2,000 career yards",
    glyph: "📣",
    tier: "gold",
    progress: (s) => count(s.totalYards, 2000),
  },
];

/** Which module each unit belongs to, for the "different courses" badge. */
function unitToModule(): Map<string, string> {
  const map = new Map<string, string>();
  for (const mod of MODULES) {
    if (mod.id === ALL_MODULE) continue;
    for (const unitId of mod.unitIds) {
      if (!map.has(unitId)) map.set(unitId, mod.id);
    }
  }
  return map;
}

function lessonToUnit(): Map<string, string> {
  const map = new Map<string, string>();
  for (const unit of COURSE.units as Unit[]) {
    for (const lesson of unit.lessons ?? []) map.set(lesson.id, unit.id);
  }
  return map;
}

export function statsFrom(p: Progress): BadgeStats {
  const lessonUnit = lessonToUnit();
  const unitModule = unitToModule();
  const courses = new Set<string>();
  for (const id of p.completedLessons) {
    const unit = lessonUnit.get(id);
    const mod = unit ? unitModule.get(unit) : undefined;
    if (mod) courses.add(mod);
  }
  return {
    xp: p.xp,
    lessonsDone: p.completedLessons.length,
    perfectLessons: p.perfectLessons,
    bestCombo: p.bestCombo,
    streak: p.streak,
    totalYards: p.totalYards,
    coursesTouched: courses.size,
  };
}

export function isEarned(badge: Badge, stats: BadgeStats): boolean {
  const { have, need } = badge.progress(stats);
  return have >= need;
}

/** Every badge id the stats currently justify. */
export function earnedBadgeIds(stats: BadgeStats): string[] {
  return BADGES.filter((b) => isEarned(b, stats)).map((b) => b.id);
}

/**
 * Badges earned now that weren't before — what the unlock toast announces.
 * Compared against the stored list so a badge is only celebrated once.
 */
export function newlyEarned(stats: BadgeStats, already: string[]): Badge[] {
  const have = new Set(already);
  return BADGES.filter((b) => isEarned(b, stats) && !have.has(b.id));
}

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export const TIER_CLASS: Record<Badge["tier"], string> = {
  bronze: "border-gold/40 text-gold",
  silver: "border-ink-soft/40 text-ink-soft",
  gold: "border-turf/50 text-turf",
};
