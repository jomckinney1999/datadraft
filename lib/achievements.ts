/**
 * The Hall of Fame: what a learner has actually achieved, in football terms.
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

import { UNIT_MODULE } from "@/lib/unit-modules.generated";
import type { Progress } from "@/lib/progress";

export type Badge = {
  id: string;
  name: string;
  /** How to earn it, phrased as the requirement. */
  requirement: string;
  /** Emoji shown beside the badge's name on its nameplate. */
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

/** Longest first, so "r-wrangle-l1" belongs to r-wrangle, not r. */
const UNIT_IDS = Object.keys(UNIT_MODULE).sort((a, b) => b.length - a.length);

/**
 * Which course a lesson belongs to, for the "different courses" badge. Every
 * lesson id starts with its unit id and a dash, so the unit is the longest
 * unit id that prefixes it, and the course comes from a small generated map
 * rather than the whole curriculum: this runs in the nav's locker chip on
 * every page (2026-10-05). The verifier checks it against the curriculum for
 * every lesson.
 */
export function courseOfLesson(lessonId: string): string | undefined {
  const unit = UNIT_IDS.find((u) => lessonId.startsWith(`${u}-`));
  return unit ? UNIT_MODULE[unit] : undefined;
}

export function statsFrom(p: Progress): BadgeStats {
  const courses = new Set<string>();
  for (const id of p.completedLessons) {
    const mod = courseOfLesson(id);
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

/**
 * The locked badge closest to done, for "next enshrinement": highest share
 * of the way there, ties to the lower tier, then to list order. Nearest
 * rather than first-in-the-list, so someone four lessons from Workhorse is
 * pointed at Workhorse and not at a 7-day streak they haven't started.
 */
export function nextEnshrinement(stats: BadgeStats): Badge | undefined {
  const rank = { bronze: 0, silver: 1, gold: 2 } as const;
  let best: { badge: Badge; share: number } | undefined;
  for (const badge of BADGES) {
    const { have, need } = badge.progress(stats);
    if (have >= need) continue;
    const share = need > 0 ? have / need : 0;
    if (
      !best ||
      share > best.share ||
      (share === best.share && rank[badge.tier] < rank[best.badge.tier])
    ) {
      best = { badge, share };
    }
  }
  return best?.badge;
}

/**
 * The three wings of the Hall, top shelf first. Gold sits at eye level,
 * where a real case puts the piece it is proudest of.
 */
export const WINGS: { tier: Badge["tier"]; name: string }[] = [
  { tier: "gold", name: "The Inner Circle" },
  { tier: "silver", name: "All-Pro Wing" },
  { tier: "bronze", name: "Rookie Wing" },
];

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
