/**
 * The football layer over grading: yardage, play calls, and combo heat.
 *
 * A lesson is a drive. Every correct answer is a completed play that gains
 * ground; a miss is an incompletion that stalls it. This exists so the reward
 * for getting something right is a *specific* event ("Deep ball — 18 yards")
 * rather than a generic "+10 XP", which is the difference between a scoreboard
 * and a game.
 *
 * Yardage is deliberately NOT the same as XP. XP measures effort and is what
 * persists; yardage measures the play you just made and is what animates. A
 * write-real-SQL drill is worth more ground than a multiple-choice check
 * because it asked more of you, and the numbers being uneven is what makes the
 * field position feel earned rather than a progress bar in a costume.
 */

import type { Exercise } from "@/lib/curriculum";

export type PlayResult = {
  yards: number;
  /** Broadcast-style call for the play just run. */
  call: string;
  /** Set when this play crossed a combo threshold worth shouting about. */
  heat: string | null;
  /** True for the long gains that deserve a bigger animation. */
  explosive: boolean;
};

/**
 * Base yardage by how much the drill actually asked of the learner.
 *
 * Typing a working query is a harder play than picking one of four options,
 * and the ground gained should say so.
 */
const BASE_YARDS: Record<Exercise["type"], number> = {
  mc: 6,
  fill: 8,
  query: 13,
  code: 13,
  formula: 13,
};

/** Combo thresholds, and what the booth calls them. */
const HEAT_TIERS: { at: number; label: string }[] = [
  { at: 3, label: "In rhythm" },
  { at: 5, label: "Heating up" },
  { at: 7, label: "Can't be stopped" },
  { at: 10, label: "Unconscious" },
];

const SHORT_CALLS = [
  "Check-down, caught",
  "Quick slant",
  "Screen pass",
  "Hitch route, in bounds",
];

const MEDIUM_CALLS = [
  "Crossing route, chains moving",
  "Out route, catch and turn",
  "Play-action, found the seam",
  "Dig route over the middle",
];

const LONG_CALLS = [
  "Deep ball — caught in stride!",
  "Post route, nothing but grass",
  "Broke a tackle, still going!",
  "Go route — hauled it in!",
];

const MISS_CALLS = [
  "Incomplete",
  "Batted down at the line",
  "Sacked for a loss",
  "Pressured into a throwaway",
  "Overthrown",
];

/**
 * Deterministic pick, seeded on the exercise index.
 *
 * Math.random() here would re-roll the call text on every React re-render, so
 * the headline would flicker while the learner was reading it.
 */
function pick(list: string[], seed: number): string {
  return list[Math.abs(seed) % list.length];
}

/**
 * Score a correct answer.
 *
 * @param type        which drill it was
 * @param firstTry    false when they missed it earlier and are re-running it
 * @param combo       consecutive correct answers INCLUDING this one
 * @param seed        stable per-exercise number, for picking the call text
 */
export function runPlay(
  type: Exercise["type"],
  firstTry: boolean,
  combo: number,
  seed: number,
): PlayResult {
  const base = BASE_YARDS[type] ?? 6;
  // A re-run of a play you already missed still moves the ball, just less.
  const earned = firstTry ? base : Math.max(3, Math.round(base / 2));
  // Momentum: every completion past the second adds a yard, capped so a long
  // lesson can't inflate a single play into a 60-yard bomb.
  const bonus = Math.min(6, Math.max(0, combo - 2));
  const yards = earned + bonus;

  const tier = [...HEAT_TIERS].reverse().find((t) => combo === t.at);

  const calls = yards >= 14 ? LONG_CALLS : yards >= 9 ? MEDIUM_CALLS : SHORT_CALLS;

  return {
    yards,
    call: pick(calls, seed),
    heat: tier ? `${tier.label} · ${combo} straight` : null,
    explosive: yards >= 14,
  };
}

/** Flavour for a miss. No yardage — a stalled play doesn't move the ball. */
export function missCall(seed: number): string {
  return pick(MISS_CALLS, seed);
}

/** The highest heat label earned at this combo, for the on-field meter. */
export function heatLabel(combo: number): string | null {
  const tier = [...HEAT_TIERS].reverse().find((t) => combo >= t.at);
  return tier ? tier.label : null;
}

/**
 * Field position as a percentage of the drive.
 *
 * A drive starts at your own 25 and the goal line is 100%, so the ball is
 * always visibly on the field rather than pinned to the left edge at the
 * start — an empty progress bar reads as "nothing has happened yet", which is
 * exactly the wrong first impression.
 */
export const DRIVE_START_PCT = 8;

export function drivePct(done: number, total: number): number {
  if (total <= 0) return DRIVE_START_PCT;
  const progress = done / total;
  return DRIVE_START_PCT + progress * (100 - DRIVE_START_PCT);
}

/** Yard line to display, counting down to the end zone. */
export function yardLine(pct: number): string {
  const toGo = Math.max(0, Math.round(((100 - pct) / 100) * 80));
  if (toGo <= 0) return "END ZONE";
  if (toGo <= 20) return `RED ZONE · ${toGo} to go`;
  return `${toGo} yards to go`;
}
