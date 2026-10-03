/**
 * The Season Pass: what it costs, which features it covers, and whether the
 * gate is on.
 *
 * The paid tier is about the career, not the hobby (docs/PLAN.md, approved
 * 2026-10-03; the copy and the free/Pass line are in docs/OFFER.md): depth,
 * interview prep, "why is my query wrong", proof for employers, and the
 * weekly in-season drop. Everything is built and labelled now, and stays
 * OPEN to everyone until billing exists. The HR sign-off, the business
 * setup, the legal review, Vercel Pro, accounts and Stripe all come first
 * (docs/OFFER.md §9). Until then every Season Pass feature says "free in
 * early access", which is true, /pricing is a 404 in production, checkout
 * refuses, and the gate is one constant below.
 *
 * Never gate the things that bring people in: the daily question, the Stat
 * Duel, the current Draft Room season, Chart it and your own league.
 *
 * Light on purpose (no question bank in here), because the tag on every
 * Pass feature imports it. The question-level rules are in lib/pass-gates.ts.
 */

import type { Progress } from "@/lib/progress";

/** Flip only when people can actually buy a Season Pass (docs/OFFER.md §9). */
export const PAYWALL_LIVE = false;

export type PassFeature =
  | "query-doctor"
  | "ai-coach"
  | "mock-interviews"
  | "interview-paths"
  | "question-bank"
  | "unlimited-lessons"
  | "cases"
  | "draft-seasons";

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
    blurb: "Timed phone and technical screens graded like the real thing, with a report after.",
  },
  "interview-paths": {
    name: "Interview patterns",
    blurb: "The SQL patterns analyst screens actually test, with progress on each.",
  },
  "question-bank": {
    name: "The whole question bank",
    blurb: "Every question in every language, with solutions, on real NFL data.",
  },
  "unlimited-lessons": {
    name: "Every lesson, no limit",
    blurb: "Every unit of every course, with no daily cap on graded lessons.",
  },
  cases: {
    name: "Every case",
    blurb: "Half-hour data cases on schemas you've never seen, graded.",
  },
  "draft-seasons": {
    name: "Every Draft Room season",
    blurb: "Draft and replay every season on file, not just the current one.",
  },
};

export type PassPlan = "monthly" | "annual" | "founding";

/** The approved prices (docs/OFFER.md §2). Change them there first. */
export const PASS_PLANS: Record<PassPlan, { cents: number; price: string; per: "month" | "year"; note: string }> = {
  monthly: { cents: 1999, price: "$19.99", per: "month", note: "Cancel anytime" },
  annual: { cents: 11900, price: "$119", per: "year", note: "$9.92 a month, half the monthly price" },
  founding: { cents: 7900, price: "$79", per: "year", note: "Kept for as long as you stay a member" },
};

/**
 * The founding offer: the first 500 members or through January 31 (Eastern),
 * whichever comes first. Both limits are real. The count includes founding
 * memberships that later lapsed, because a seat once taken is gone.
 */
export const FOUNDING = { cap: 500, lastDay: "2027-01-31" } as const;

export function foundingOpen(day: string, taken: number): boolean {
  return day <= FOUNDING.lastDay && taken < FOUNDING.cap;
}

/** The free tier's daily allowances on Pass features. */
export const FREE_ALLOWANCE = {
  /** Query Doctor diagnoses a day. */
  doctorPerDay: 1,
  /** Mock screens, ever: enough to try one. */
  mockScreens: 1,
  /** Cases: the first one in the list. */
  cases: 1,
} as const;

export function hasPass(feature: PassFeature, progress?: Pick<Progress, "seasonPass"> | null): boolean {
  void feature;
  return !PAYWALL_LIVE || Boolean(progress?.seasonPass);
}
