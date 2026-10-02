/**
 * Mock SQL screens — the first technical round for an analyst job, rehearsed.
 *
 * A screen is a handful of SQL questions from the bank, a clock, and no help:
 * no hint, no answer button, no Query Doctor until it's over. Run as often as
 * you like; a submit is graded the same way as everywhere else (by result,
 * lib/sql-grade.ts). The report afterwards is where the learning is: what you
 * solved and how fast, your last attempt at the rest with Query Doctor's
 * diagnosis, and the answer.
 *
 * Questions you haven't solved come first, so a screen is as close to unseen
 * as the bank allows. Picks are seeded, so a screen restored after a reload
 * is the same screen.
 */

import { QUESTIONS, type Question, type QuestionDifficulty } from "@/lib/questions";

export type MockFormat = {
  id: "phone" | "technical";
  name: string;
  blurb: string;
  minutes: number;
  mix: QuestionDifficulty[];
};

export const MOCK_FORMATS: MockFormat[] = [
  {
    id: "phone",
    name: "Phone screen",
    blurb: "Two questions in 20 minutes. The quick check a recruiter sends before anything else.",
    minutes: 20,
    mix: ["easy", "medium"],
  },
  {
    id: "technical",
    name: "Technical screen",
    blurb: "Three questions in 45 minutes, easy to hard. The round that decides whether you get a real interview.",
    minutes: 45,
    mix: ["easy", "medium", "hard"],
  },
];

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The SQL questions for a screen: one per difficulty in the mix, unsolved first. */
export function pickScreen(format: MockFormat, seed: string, solved: string[]): Question[] {
  const done = new Set(solved);
  const taken = new Set<string>();
  return format.mix.map((difficulty, i) => {
    const pool = QUESTIONS.filter((q) => q.lang === "sql" && q.difficulty === difficulty && !taken.has(q.id));
    const fresh = pool.filter((q) => !done.has(q.id));
    const from = fresh.length ? fresh : pool;
    const ranked = from
      .map((q) => ({ q, k: hash(`${seed}:${i}:${q.id}`) }))
      .sort((a, b) => a.k - b.k);
    const pick = ranked[0].q;
    taken.add(pick.id);
    return pick;
  });
}

export type MockAnswer = {
  id: string;
  /** Graded submissions. */
  attempts: number;
  /** Seconds into the screen when it was solved. */
  solvedAt: number | null;
  /** The last thing submitted. */
  lastSql: string;
};

export type MockVerdict = { band: "strong" | "pass" | "not-yet"; label: string; detail: string };

/**
 * Our rubric, stated as ours: all solved is a strong pass, two thirds or
 * better a pass. It is a way to read the result, not a claim about any
 * company's bar.
 */
export function verdictFor(answers: MockAnswer[]): MockVerdict {
  const solved = answers.filter((a) => a.solvedAt !== null).length;
  const n = answers.length;
  if (solved === n) {
    return { band: "strong", label: "Strong pass", detail: "Every question solved. On a real screen, this is the result that gets you the next round." };
  }
  if (solved >= Math.ceil((n * 2) / 3)) {
    return { band: "pass", label: "Pass", detail: "Most of the screen solved. Tighten up the one you missed and this becomes a strong pass." };
  }
  return { band: "not-yet", label: "Not yet", detail: "Not enough solved in the time. Work the patterns you missed, then run another screen." };
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
