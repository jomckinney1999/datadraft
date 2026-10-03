/**
 * Career tenure — the character you level up by showing up.
 *
 * Rank is recomputed from progress (like badges), never stored. That way a
 * bug can't strand someone at "Rookie" after they've earned Starter, and a
 * new threshold can re-rank everyone without a migration.
 *
 * Hall of Fame trophies (/achievements) stay separate: those are for specific
 * feats. "Hall of Famer" here is the top tenure shelf for long commitment.
 */

import { displayStreak, type KitAccent, type Progress } from "@/lib/progress";
import { statsFrom } from "@/lib/achievements";

export type { KitAccent };

export type Rank = {
  id: string;
  /** Short label for chips ("Rookie"). */
  name: string;
  /** One line for the locker. */
  blurb: string;
  /** Minimum commitment score to hold this rank. */
  min: number;
  tone: KitAccent;
};

export const RANKS: Rank[] = [
  {
    id: "undrafted",
    name: "Undrafted",
    blurb: "Nobody's claimed you yet. Take a snap.",
    min: 0,
    tone: "ice",
  },
  {
    id: "walk-on",
    name: "Walk-on",
    blurb: "You showed up. The roster's watching.",
    min: 25,
    tone: "ice",
  },
  {
    id: "practice-squad",
    name: "Practice Squad",
    blurb: "Reps on the side. Earning a game-day look.",
    min: 70,
    tone: "ice",
  },
  {
    id: "rookie",
    name: "Rookie",
    blurb: "On the 53. Still learning the playbook.",
    min: 140,
    tone: "turf",
  },
  {
    id: "depth",
    name: "Depth Chart",
    blurb: "In the rotation. Coaches know your name.",
    min: 260,
    tone: "turf",
  },
  {
    id: "starter",
    name: "Starter",
    blurb: "You're in the lineup every week.",
    min: 450,
    tone: "gold",
  },
  {
    id: "captain",
    name: "Team Captain",
    blurb: "The locker follows your lead.",
    min: 720,
    tone: "gold",
  },
  {
    id: "pro-bowl",
    name: "Pro Bowl",
    blurb: "Voted in by the work, not the hype.",
    min: 1100,
    tone: "gold",
  },
  {
    id: "all-pro",
    name: "All-Pro",
    blurb: "First team. No argument.",
    min: 1600,
    tone: "gold",
  },
  {
    id: "hof",
    name: "Hall of Famer",
    blurb: "Tenure earned. The case stays lit.",
    min: 2300,
    tone: "gold",
  },
];

export type Tenure = {
  /** Weighted commitment score. */
  score: number;
  /** 1–99 display level inside the career. */
  level: number;
  rank: Rank;
  /** Next rank, or null at the top. */
  next: Rank | null;
  /** 0–1 progress toward the next rank (1 at the top). */
  progress: number;
  /** Points still needed for the next rank. */
  need: number;
};

/**
 * One number that rises when you keep coming back: lessons, questions, XP,
 * streaks, and days active. Caps keep a single grind from jumping the queue.
 */
export function commitmentScore(p: Progress): number {
  const stats = statsFrom(p);
  const streak = displayStreak(p);
  const solved = p.solvedQuestions.length;
  const xpPart = Math.min(p.xp, 8000) / 20;
  return Math.round(
    stats.lessonsDone * 12 +
      solved * 5 +
      xpPart +
      streak * 8 +
      Math.min(p.qotdStreak, 60) * 6 +
      p.daysActive * 5 +
      stats.perfectLessons * 10 +
      Math.min(p.badges.length, 12) * 12,
  );
}

/** Level 1–99 from commitment. Early levels come fast; later ones stretch. */
export function levelFromScore(score: number): number {
  return Math.min(99, 1 + Math.floor(score / 35));
}

export function rankFromScore(score: number): Rank {
  let current = RANKS[0]!;
  for (const r of RANKS) {
    if (score >= r.min) current = r;
  }
  return current;
}

export function tenureFrom(p: Progress): Tenure {
  const score = commitmentScore(p);
  const level = levelFromScore(score);
  const rank = rankFromScore(score);
  const idx = RANKS.findIndex((r) => r.id === rank.id);
  const next = idx >= 0 && idx < RANKS.length - 1 ? RANKS[idx + 1]! : null;
  if (!next) {
    return { score, level, rank, next: null, progress: 1, need: 0 };
  }
  const span = next.min - rank.min;
  const have = Math.max(0, score - rank.min);
  const progress = span > 0 ? Math.min(1, have / span) : 1;
  return {
    score,
    level,
    rank,
    next,
    progress,
    need: Math.max(0, next.min - score),
  };
}

/** Stable display name when they haven't named themselves yet. */
export function displayName(p: Progress): string {
  const name = p.username?.trim();
  return name && name.length > 0 ? name : "Free Agent";
}

/**
 * One line for share sheets — only when they've named themselves, so we
 * never paste "Free Agent" into a group chat.
 */
export function shareIdentity(p: Progress): string | null {
  const name = p.username?.trim();
  if (!name) return null;
  const t = tenureFrom(p);
  return `— ${name} · Lv ${t.level} ${t.rank.name}`;
}

const RANK_SEEN_KEY = "sqlsports.rank.v1";

/**
 * If the learner just crossed into a higher tenure rank, return it once.
 * First visit seeds the key without celebrating Undrafted.
 */
export function consumeRankUp(p: Progress): Rank | null {
  if (typeof window === "undefined") return null;
  const t = tenureFrom(p);
  try {
    const prev = window.localStorage.getItem(RANK_SEEN_KEY);
    if (!prev) {
      window.localStorage.setItem(RANK_SEEN_KEY, t.rank.id);
      return null;
    }
    if (prev === t.rank.id) return null;
    const prevIdx = RANKS.findIndex((r) => r.id === prev);
    const nextIdx = RANKS.findIndex((r) => r.id === t.rank.id);
    window.localStorage.setItem(RANK_SEEN_KEY, t.rank.id);
    if (nextIdx > prevIdx) return t.rank;
  } catch {
    /* storage blocked */
  }
  return null;
}

export function kitAccentHex(accent: KitAccent): string {
  if (accent === "gold") return "#FFC800";
  if (accent === "turf") return "#58CC02";
  return "#1CB0F6";
}

/** Depth-chart label used by older call sites — now the tenure rank name. */
export function leagueLabel(lessonsDone: number): string {
  // Approximate from lessons alone when only a count is available (rare).
  const score = lessonsDone * 12;
  return rankFromScore(score).name;
}
