/**
 * Duolingo-shaped miss handling helpers:
 * - plain-English “what you said” / “what’s right”
 * - schedule a missed play a few snaps later
 */

import type { Exercise, FillExercise } from "./curriculum";

export const REVIEW_DELAY = 2;
/** After the first miss, how many times we’ll bring the play back. */
export const MAX_REVIEWS = 2;

export function fillSolution(ex: FillExercise): string {
  let i = 0;
  return ex.parts
    .map((part) => (part === null ? ex.answer[i++] : part))
    .join("");
}

/** What the learner submitted, for “you answered X” copy. */
export function describeLearnerAnswer(
  exercise: Exercise,
  inputs: {
    mcChoice: number | null;
    fillSlots: (string | null)[];
    queryText: string;
    codeText: string;
    formulaText: string;
  },
): string | undefined {
  if (exercise.type === "mc") {
    if (inputs.mcChoice === null) return undefined;
    return exercise.options[inputs.mcChoice];
  }
  if (exercise.type === "fill") {
    return fillSolution({
      ...exercise,
      answer: inputs.fillSlots.map((s, i) => s ?? exercise.answer[i] ?? "?"),
    });
  }
  if (exercise.type === "query") {
    const t = inputs.queryText.trim();
    return t || undefined;
  }
  if (exercise.type === "code") {
    const t = inputs.codeText.trim();
    return t || undefined;
  }
  if (exercise.type === "formula") {
    const t = inputs.formulaText.trim();
    return t || undefined;
  }
  return undefined;
}

/**
 * Short “why that miss” line. Curriculum `explain` stays the concept tip;
 * this names the gap between their answer and the key.
 */
export function whyWrongMessage(
  exercise: Exercise,
  learnerAnswer: string | undefined,
  solution: string | undefined,
): string {
  if (exercise.type === "mc" && learnerAnswer && solution) {
    return `You picked “${learnerAnswer}.” The right call is “${solution}.”`;
  }
  if (exercise.type === "fill" && learnerAnswer && solution) {
    return `You built: ${learnerAnswer} — needed: ${solution}.`;
  }
  if (solution) {
    return "That didn’t match the expected result. Compare yours to the answer below, then you’ll get another shot.";
  }
  return "Not quite — read the tip, then you’ll see this play again.";
}

/**
 * After a miss, drop the current play and insert it `delay` snaps later
 * (or at the end if fewer remain). Caps how often one play can bounce back.
 */
export function queueAfterMiss(
  queue: number[],
  missedIdx: number,
  reviewCounts: Record<number, number>,
  delay: number = REVIEW_DELAY,
  maxReviews: number = MAX_REVIEWS,
): { queue: number[]; reviewCounts: Record<number, number> } {
  const rest = queue.slice(1);
  const nextCount = (reviewCounts[missedIdx] ?? 0) + 1;
  const nextCounts = { ...reviewCounts, [missedIdx]: nextCount };

  if (nextCount > maxReviews) {
    return { queue: rest, reviewCounts: nextCounts };
  }

  const cleaned = rest.filter((i) => i !== missedIdx);
  const at = Math.min(delay, cleaned.length);
  return {
    queue: [...cleaned.slice(0, at), missedIdx, ...cleaned.slice(at)],
    reviewCounts: nextCounts,
  };
}
