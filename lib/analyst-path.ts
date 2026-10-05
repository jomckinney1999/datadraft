/**
 * The analyst path: one ordered route from your first query to
 * interview-ready, built only from things the site already has (decided
 * 2026-10-05, in place of bringing back career pathways).
 *
 *   1. Foundations       SQL Fundamentals (or skip it if you already solve)
 *   2. The nine patterns  three solved questions in each
 *   3. Mock screens       pass a phone screen, then a technical screen
 *   4. A portfolio piece  your League Scorecard
 *
 * What it deliberately isn't: a job-title picker, a resume or outreach
 * coach, or a board of placeholder stations. Those were retired on Sep 30
 * and stay retired. Every step points at something that exists today, and
 * every tick is earned from progress the site already records, except the
 * notebook, which lives in Colab and can only be self-reported.
 *
 * The step logic is pure (`analystPath`) and takes the catalog of ids the
 * server built (lib/analyst-path-catalog.ts), so this module stays small
 * enough for any client page; `readPathInputs` gathers the inputs from this
 * browser's storage, so the path page and the dashboard read the same state
 * the games and screens write.
 */

import { loadProgress } from "@/lib/progress";

/** The path's ingredients, as ids (built on the server). */
export type PathCatalog = {
  /** SQL Fundamentals' live lessons, in order. */
  lessons: string[];
  sqlQuestions: string[];
  patterns: { id: string; name: string; href: string; questions: string[] }[];
};

/** Solved questions per pattern that count as "drilled". */
export const PER_PATTERN = 3;
/** SQL questions solved that show you're past the foundations already. */
export const FOUNDATIONS_BY_SOLVING = 10;

const PATH_KEY = "sqlsports.path.v1";
const MOCK_HISTORY_KEY = "sqlsports.mock.history.v1";
const SCREEN_HISTORY_KEY = "sqlsports.screen.history.v1";
const CHALLENGE_KEY = "sqlsports.challenge.v1";

export type PathMarks = {
  /** "I already know the basics." */
  skipFoundations?: boolean;
  /** The day a league loaded in the browser (set by the league lab). */
  leagueLoaded?: string;
  /** "I've built the notebook" (self-reported: Colab can't tell us). */
  portfolio?: boolean;
};

type Attempt = { format: string; solved: number; of: number };

export type PathInputs = {
  completedLessons: string[];
  solvedQuestions: string[];
  mocks: Attempt[];
  screens: Attempt[];
  challengeSolved: number;
  marks: PathMarks;
};

export type PathItem = { label: string; href: string; done: boolean; detail?: string };

export type PathStep = {
  id: "foundations" | "patterns" | "screens" | "portfolio";
  title: string;
  why: string;
  done: boolean;
  /** For the progress line: how much of this step is done. */
  have: number;
  need: number;
  items: PathItem[];
  /** Not required to finish the step, but the next thing worth doing. */
  extra?: PathItem;
  /** Ticked by "skip" rather than by the work, so it can be undone. */
  skipped?: boolean;
  next: { href: string; label: string };
};

/** A screen passes at two-thirds solved, the same bar as the mock report. */
export function passed(a: Attempt): boolean {
  return a.of > 0 && a.solved >= Math.ceil((a.of * 2) / 3);
}

export function analystPath(input: PathInputs, catalog: PathCatalog): PathStep[] {
  const done = new Set(input.completedLessons);
  const solved = new Set(input.solvedQuestions);

  // 1 · Foundations
  const lessons = catalog.lessons;
  const lessonsDone = lessons.filter((id) => done.has(id)).length;
  const nextLesson = lessons.find((id) => !done.has(id));
  const sqlSolved = catalog.sqlQuestions.filter((id) => solved.has(id)).length;
  const foundationsDone =
    (lessons.length > 0 && lessonsDone === lessons.length) ||
    sqlSolved >= FOUNDATIONS_BY_SOLVING ||
    Boolean(input.marks.skipFoundations);

  // 2 · The nine patterns
  const patternRows = catalog.patterns.map((p) => {
    const have = p.questions.filter((id) => solved.has(id)).length;
    const need = Math.min(PER_PATTERN, p.questions.length);
    const firstOpen = p.questions.find((id) => !solved.has(id));
    return { p, have, need, firstOpen };
  });
  const patternsDone = patternRows.filter((r) => r.have >= r.need).length;
  const weakest = [...patternRows].filter((r) => r.have < r.need).sort((a, b) => a.have / a.need - b.have / b.need)[0];

  // 3 · Mock screens
  const best = (format: string) =>
    input.mocks.filter((m) => m.format === format).sort((a, b) => b.solved / b.of - a.solved / a.of)[0];
  const phone = best("phone");
  const technical = best("technical");
  const phoneOk = phone ? passed(phone) : false;
  const technicalOk = technical ? passed(technical) : false;
  const oa = input.screens.some(passed);

  // 4 · Portfolio
  const leagueOk = Boolean(input.marks.leagueLoaded);
  const notebookOk = Boolean(input.marks.portfolio);

  const result = (a?: Attempt) => (a ? `best ${a.solved}/${a.of}` : "not taken yet");

  return [
    {
      id: "foundations",
      title: "Foundations",
      why: "SELECT, WHERE, GROUP BY and JOIN, one short lesson at a time. Already writing SQL? Skip it.",
      done: foundationsDone,
      have: lessonsDone,
      need: lessons.length,
      items: [
        {
          label: "SQL Fundamentals",
          href: nextLesson ? `/learn/${nextLesson}` : "/learn/track/sql-fundamentals",
          done: lessons.length > 0 && lessonsDone === lessons.length,
          detail: `${lessonsDone}/${lessons.length} lessons`,
        },
      ],
      extra: { label: "Coming from Excel? Excel for Analysts first", href: "/learn/track/excel", done: false },
      skipped:
        Boolean(input.marks.skipFoundations) &&
        !(lessons.length > 0 && lessonsDone === lessons.length) &&
        sqlSolved < FOUNDATIONS_BY_SOLVING,
      next: nextLesson
        ? { href: `/learn/${nextLesson}`, label: lessonsDone ? "Continue SQL Fundamentals" : "Start SQL Fundamentals" }
        : { href: "/learn/track/sql-fundamentals", label: "Open SQL Fundamentals" },
    },
    {
      id: "patterns",
      title: "The nine patterns",
      why: `Analyst screens keep testing the same nine kinds of SQL question. Solve ${PER_PATTERN} in each.`,
      done: patternsDone === patternRows.length,
      have: patternsDone,
      need: patternRows.length,
      items: patternRows.map((r) => ({
        label: r.p.name,
        href: r.p.href,
        done: r.have >= r.need,
        detail: `${Math.min(r.have, r.need)}/${r.need}`,
      })),
      next: weakest?.firstOpen
        ? { href: `/questions/${weakest.firstOpen}`, label: `Next: ${weakest.p.name}` }
        : { href: "/sql-interview-questions", label: "Review the guides" },
    },
    {
      id: "screens",
      title: "Mock screens",
      why: "Rehearse the live round against the clock: a 20-minute phone screen, then a 45-minute technical one.",
      done: phoneOk && technicalOk,
      have: Number(phoneOk) + Number(technicalOk),
      need: 2,
      items: [
        { label: "Pass a phone screen", href: "/questions/mock", done: phoneOk, detail: result(phone) },
        { label: "Pass a technical screen", href: "/questions/mock", done: technicalOk, detail: result(technical) },
      ],
      extra: { label: "Also try the online assessment", href: "/questions/screen", done: oa },
      next: { href: "/questions/mock", label: phoneOk ? "Run a technical screen" : "Run a phone screen" },
    },
    {
      id: "portfolio",
      title: "A portfolio piece",
      why: "Something an interviewer can click on: your own fantasy league, loaded with SQL and charted, as a notebook with your name on it.",
      done: notebookOk,
      have: Number(leagueOk) + Number(notebookOk),
      need: 2,
      items: [
        { label: "Load your league in the browser", href: "/projects/my-league-scorecard#your-league", done: leagueOk },
        { label: "Build the notebook in Colab", href: "/projects/my-league-scorecard", done: notebookOk, detail: "tick it yourself" },
      ],
      extra: {
        label: "Then the take-home: the Data Challenge",
        href: "/projects/challenge",
        done: input.challengeSolved > 0,
      },
      next: leagueOk
        ? { href: "/projects/my-league-scorecard", label: "Build the notebook" }
        : { href: "/projects/my-league-scorecard#your-league", label: "Load your league" },
    },
  ];
}

/** The first step that isn't done, or null when the whole path is. */
export function currentStep(steps: PathStep[]): PathStep | null {
  return steps.find((s) => !s.done) ?? null;
}

function read<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
}

/** Everything the path needs, from this browser. Client-only. */
export function readPathInputs(): PathInputs {
  const p = loadProgress();
  const challenge = read<{ solved?: Record<string, unknown> }>(CHALLENGE_KEY);
  return {
    completedLessons: p.completedLessons,
    solvedQuestions: p.solvedQuestions,
    mocks: read<Attempt[]>(MOCK_HISTORY_KEY) ?? [],
    screens: read<Attempt[]>(SCREEN_HISTORY_KEY) ?? [],
    challengeSolved: Object.keys(challenge?.solved ?? {}).length,
    marks: read<PathMarks>(PATH_KEY) ?? {},
  };
}

/** Record a mark (a skip, a loaded league, a built notebook). Client-only. */
export function markPath(patch: PathMarks): void {
  try {
    const next = { ...(read<PathMarks>(PATH_KEY) ?? {}), ...patch };
    localStorage.setItem(PATH_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("sqlsports:path"));
  } catch {
    // Storage off: the path just won't remember this one.
  }
}
