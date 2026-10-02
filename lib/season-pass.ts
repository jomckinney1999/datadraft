/**
 * Which features are Season Pass, and whether the gate is on.
 *
 * The paid tier is about the career, not the hobby (docs/PLAN.md, decided
 * 2026-10-02): depth, interview prep, "why is my query wrong", proof for
 * employers, and the weekly in-season drop. Those features are built and
 * labelled now, and stay OPEN to everyone until billing exists — the HR
 * sign-off, the legal review, the business setup and the Stripe webhook all
 * have to clear first. Until then every Season Pass feature says "free in
 * early access", which is true, and the gate is one constant below.
 *
 * Never gate the things that bring people in: the daily question, the Stat
 * Duel, the current Draft Room season, Chart it and your own league.
 */

import type { Progress } from "@/lib/progress";

/** Flip only when people can actually buy a Season Pass. */
export const PAYWALL_LIVE = false;

export type PassFeature = "query-doctor" | "ai-coach" | "mock-interviews" | "interview-paths";

export const PASS_FEATURES: Record<PassFeature, { name: string; blurb: string }> = {
  "query-doctor": {
    name: "Query Doctor",
    blurb: "Why your query is wrong — the clause, the column, the kind of mistake — without giving away the answer.",
  },
  "ai-coach": {
    name: "Ask Coach",
    blurb: "A conversational explanation of your mistake, built on Query Doctor's diagnosis.",
  },
  "mock-interviews": {
    name: "Mock SQL screens",
    blurb: "Timed, three-question screens graded like the real thing, with a report after.",
  },
  "interview-paths": {
    name: "Interview patterns",
    blurb: "The SQL patterns analyst screens actually test, with progress on each.",
  },
};

export function hasPass(feature: PassFeature, progress?: Pick<Progress, "seasonPass"> | null): boolean {
  void feature;
  return !PAYWALL_LIVE || Boolean(progress?.seasonPass);
}
