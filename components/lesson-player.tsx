"use client";

// Duolingo-style lesson player: hearts, XP, combo streaks, re-queued misses.
// Query exercises grade by running learner SQL and the solution SQL against
// the same in-browser sql.js database and comparing result values.
//
// The experience adapts to the learner's playbook style (lib/playbook.ts):
//   film-room  — chalkboard intro + bonus film cards, hints always visible
//   gunslinger — brief, then straight to hands-on drills (all MCs dropped on
//                lessons with enough runnable work), hints behind a toggle,
//                chalkboard available on demand
//   dual-threat — chalkboard intro, full exercise mix, hints visible
//
// Every style starts on the brief: goal, setup, and — for SQL lessons — the
// actual rows, run live, before any question is asked about them.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Database, QueryExecResult } from "sql.js";
import { buildSeedSql } from "@/lib/fantasy-data";
import {
  getLesson,
  nextLessonId,
  XP_PER_EXERCISE,
  XP_RETRY,
  PERFECT_BONUS,
  type Exercise,
  type FillExercise,
  type QueryExercise,
  type CodeExercise,
  type FormulaExercise,
  type TheoryCard,
} from "@/lib/curriculum";
import {
  runCode,
  ensureRuntime,
  outputsMatch,
  LANG_LABEL,
  LANG_WEIGHT,
  type Lang,
} from "@/lib/runtimes";
import { useModule } from "@/lib/use-module";
import { useSport } from "@/lib/use-sport";
import { awardBadges, completeLesson, loadProgress } from "@/lib/progress";
import { pushProgress } from "@/lib/progress-sync";
import { getStyle, type PlaybookStyle } from "@/lib/playbook";
import Coach, { type CoachMood } from "@/components/coach";
import CodeEditor from "@/components/code-editor";
import ExcelGrid from "@/components/excel-grid";
import SchemaReference from "@/components/schema-reference";
import {
  ensureFormulaEngine,
  evaluateFormula,
  formatValue,
  referencesCells,
  valuesMatch,
} from "@/lib/excel-engine";
import { MAIN_SHEET, type CellValue } from "@/lib/excel-data";
import { SHORT_CREDIT } from "@/lib/data-source";
import DriveField from "@/components/drive-field";
import { drivePct, heatLabel, missCall, runPlay } from "@/lib/gameplay";
import { newlyEarned, statsFrom, type Badge } from "@/lib/achievements";
import { useCountUp } from "@/lib/use-count-up";

type Phase =
  | "loading"
  | "brief"
  | "intro"
  | "exercise"
  | "complete"
  | "timeout";

type Feedback = {
  correct: boolean;
  headline: string;
  /** Yards gained on this play — rendered in the reward chip. */
  yards?: number;
  solution?: string;
  explain: string;
};

const MAX_HEARTS = 3;

function normalizeResult(
  res: QueryExecResult | undefined,
  orderMatters: boolean,
): string {
  if (!res || res.columns.length === 0) return "empty";
  const rows = res.values.map((row) =>
    row.map((cell) =>
      typeof cell === "number"
        ? String(Math.round(cell * 1000) / 1000)
        : String(cell),
    ),
  );
  if (!orderMatters) {
    rows.sort((a, b) => {
      const ka = a.join("");
      const kb = b.join("");
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
  }
  return JSON.stringify(rows);
}

function fillSolution(ex: FillExercise): string {
  let i = 0;
  return ex.parts
    .map((part) => (part === null ? ex.answer[i++] : part))
    .join("");
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${filled ? "text-gold" : "text-panel-hover"}`}
      aria-hidden
    >
      <path
        d="M12 21c-5.5-4.1-9-7.3-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 3.7-3.5 6.9-9 11z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function TheoryCardView({ card }: { card: TheoryCard }) {
  return (
  <div className="surface w-full border border-panel-border bg-panel/80 p-6 text-left ">
      <p className="label-broadcast text-turf">coach blitz&apos;s chalkboard</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">
        {card.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{card.text}</p>
      {card.code && (
        <pre className="mt-4 overflow-x-auto border border-panel-border bg-night px-4 py-3 font-mono text-[13px] leading-relaxed text-turf">
          {card.code}
        </pre>
      )}
    </div>
  );
}

export default function LessonPlayer({ lessonId }: { lessonId: string }) {
  // Memoised because getLesson() rebuilds its {lesson, unit} wrapper on every
  // call. An unmemoised `entry` is a new object each render, and two effects
  // below depend on it — the brief-preview one then re-ran forever, setting
  // state with a fresh result object each pass ("Maximum update depth
  // exceeded" on every SQL lesson brief).
  const entry = useMemo(() => getLesson(lessonId), [lessonId]);
  const router = useRouter();

  const dbRef = useRef<Database | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const savedRef = useRef(false);
  const { moduleId } = useModule();
  const { sport } = useSport();

  const [style, setStyle] = useState<PlaybookStyle | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("loading");
  const [introStep, setIntroStep] = useState(0);
  /**
   * Which beat of the brief's paced walk-in is showing.
   *
   * The preview table and the "start" button are held back until the last
   * beat, so a beginner meets one idea at a time instead of a wall of text
   * with a table under it.
   */
  const [briefStep, setBriefStep] = useState(0);
  const [queue, setQueue] = useState<number[]>([]);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [firstTry, setFirstTry] = useState<Record<number, boolean>>({});
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // per-exercise inputs
  const [mcChoice, setMcChoice] = useState<number | null>(null);
  const [fillSlots, setFillSlots] = useState<(string | null)[]>([]);
  const [queryText, setQueryText] = useState("");
  const [runResult, setRunResult] = useState<QueryExecResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [softError, setSoftError] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [chalkboardOpen, setChalkboardOpen] = useState(false);
  const [briefRows, setBriefRows] = useState<QueryExecResult | null>(null);

  // live-code exercises (Python / R / SQL executed for real)
  const [codeText, setCodeText] = useState("");
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [runtimeLoading, setRuntimeLoading] = useState<Lang | null>(null);

  // Excel formula exercises (evaluated live against lib/excel-data.ts)
  const [formulaText, setFormulaText] = useState("");
  const [formulaValue, setFormulaValue] = useState<CellValue | boolean>(null);
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [formulaReady, setFormulaReady] = useState(false);

  // ── drive state (the football layer over grading) ──
  const [driveYards, setDriveYards] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  /** Floating "+12 YDS" chip. `id` forces a re-animation on repeat values. */
  const [burst, setBurst] = useState<{
    yards: number;
    id: number;
    explosive: boolean;
  } | null>(null);
  /** Badges unlocked by this lesson, celebrated on the completion screen. */
  const [unlocked, setUnlocked] = useState<Badge[]>([]);
  /** Bumped on every miss so the hearts row re-runs its shake. */
  const [hitId, setHitId] = useState(0);

  /**
   * Gunslingers want to type, not tick boxes. They always skip pure-recall
   * concept checks (drillSkip), and on lessons that have enough hands-on work
   * they skip the remaining multiple-choice too, leaving a DataCamp-style run
   * of write-it-yourself drills.
   *
   * The MIN_HANDS_ON floor matters: concept-only units (statistics, chart
   * choice, git) have no runnable exercises, and stripping their MCs would
   * leave a lesson with nothing in it.
   */
  const activeIdx = useMemo(() => {
    if (!entry) return [];
    const all = entry.lesson.exercises;
    const idx = all.map((_, i) => i);
    if (style !== "gunslinger") return idx;

    const MIN_HANDS_ON = 3;
    const handsOn = all.filter(
      (ex) => ex.type === "query" || ex.type === "code" || ex.type === "fill",
    ).length;
    const dropAllMc = handsOn >= MIN_HANDS_ON;

    return idx.filter((i) => {
      const ex = all[i];
      if (ex.type !== "mc") return true;
      return dropAllMc ? false : !ex.drillSkip;
    });
  }, [entry, style]);

  const total = activeIdx.length;
  const currentIdx = queue[0];
  const exercise: Exercise | undefined =
    entry && currentIdx !== undefined
      ? entry.lesson.exercises[currentIdx]
      : undefined;

  /**
   * The SQL the brief should be showing right now.
   *
   * A beat can carry its own preview so it can display the table it is
   * talking about; otherwise the lesson-level preview appears on the final
   * beat. Derived up here because the effect that runs it is a hook, and
   * hooks have to sit above the early return that `lesson` comes after.
   */
  const briefStepsAll = entry?.lesson.brief.steps ?? [];
  const lastBriefBeat =
    briefStepsAll.length === 0 || briefStep >= briefStepsAll.length - 1;
  const briefPreviewSql =
    briefStepsAll[briefStep]?.previewSql ??
    (lastBriefBeat ? entry?.lesson.brief.previewSql : undefined);

  // Which workbook tab the current formula exercise reads from.
  const formulaSheet =
    exercise?.type === "formula" ? exercise.sheet ?? MAIN_SHEET : MAIN_SHEET;

  // Onboarding gates, in ceremony order: get drafted, then pick a playbook.
  useEffect(() => {
    const p = loadProgress();
    if (!p.username || !p.draftedTrack) {
      router.replace(`/learn/draft?from=${lessonId}`);
      return;
    }
    if (!p.playbookStyle) {
      router.replace(`/learn/playbook?from=${lessonId}`);
      return;
    }
    setStyle(p.playbookStyle);
  }, [router, lessonId]);

  // Once the style is known, deal the queue and pick the opening screen.
  useEffect(() => {
    if (!style || phase !== "loading") return;
    setQueue(activeIdx);
    // Every style starts at the brief. Gunslingers skip the theory cards that
    // follow it, not the grounding itself — landing cold on drill #1 with no
    // idea what the table looks like was the old behaviour and it was wrong.
    setPhase("brief");
  }, [style, phase, activeIdx]);

  useEffect(() => {
    let cancelled = false;
    import("sql.js")
      .then((mod) => mod.default({ locateFile: () => "/sql-wasm.wasm" }))
      .then((SQL) => {
        if (cancelled) return;
        const db = new SQL.Database();
        db.run(buildSeedSql());
        dbRef.current = db;
        setEngineReady(true);
      })
      .catch(() => {
        // engine failure surfaces on query exercises via runError
      });
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
  }, []);

  // The formula parser is a lazy import — warm it as soon as an Excel
  // exercise appears so Check never stalls on a cold module load.
  useEffect(() => {
    if (exercise?.type !== "formula") return;
    let cancelled = false;
    ensureFormulaEngine()
      .then(() => !cancelled && setFormulaReady(true))
      .catch(() => !cancelled && setFormulaReady(false));
    return () => {
      cancelled = true;
    };
  }, [exercise]);

  // reset inputs whenever the current exercise changes
  useEffect(() => {
    if (!exercise) return;
    setMcChoice(null);
    setFillSlots(
      exercise.type === "fill"
        ? exercise.parts.filter((p) => p === null).map(() => null)
        : [],
    );
    setQueryText(exercise.type === "query" ? exercise.starter : "");
    setCodeText(exercise.type === "code" ? exercise.starter : "");
    setFormulaText(exercise.type === "formula" ? exercise.starter : "");
    setFormulaValue(null);
    setFormulaError(null);
    setCodeOutput(null);
    setCodeError(null);
    setRunResult(null);
    setRunError(null);
    setSoftError(null);
    setHintShown(false);
    setChalkboardOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase]);

  // Run the brief's preview query once the engine is up, so the learner sees
  // real rows before the first question about them.
  useEffect(() => {
    if (phase !== "brief" || !engineReady || !briefPreviewSql) return;
    try {
      const res = dbRef.current?.exec(briefPreviewSql)[0];
      setBriefRows(res ?? { columns: [], values: [] });
    } catch {
      setBriefRows(null); // a broken preview must never block the lesson
    }
  }, [phase, engineReady, briefPreviewSql]);

  // Start downloading Python/R the moment a code exercise appears, rather than
  // making the learner wait for a multi-MB fetch after they hit Run.
  useEffect(() => {
    if (!exercise || exercise.type !== "code") {
      setRuntimeLoading(null);
      return;
    }
    const lang = exercise.lang;
    let cancelled = false;
    setRuntimeLoading(lang);
    ensureRuntime(lang)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setRuntimeLoading(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase]);

  // lesson finished?
  useEffect(() => {
    if (phase === "exercise" && total > 0 && queue.length === 0) {
      setPhase("complete");
    }
  }, [phase, total, queue.length]);

  const perfect =
    Object.values(firstTry).length === total &&
    Object.values(firstTry).every(Boolean) &&
    hearts === MAX_HEARTS;
  const finalXp = xp + (perfect ? PERFECT_BONUS : 0);
  // Ticks up on the completion screen; stays 0 elsewhere so the animation
  // starts from nothing the moment that screen mounts.
  const shownXp = useCountUp(phase === "complete" ? finalXp : 0);

  // persist once on completion
  useEffect(() => {
    if (phase === "complete" && !savedRef.current && entry) {
      savedRef.current = true;
      const saved = completeLesson(entry.lesson.id, finalXp, {
        perfect,
        bestCombo,
        yards: driveYards,
      });
      // Badges are recomputed from the saved stats, so an unlock can never
      // depend on this render having the freshest state.
      const fresh = newlyEarned(statsFrom(saved), saved.badges);
      if (fresh.length) {
        setUnlocked(fresh);
        awardBadges(fresh.map((b) => b.id));
      }
      // Fire-and-forget: no-op when signed out, and a failed sync must never
      // block the completion screen the learner just earned.
      void pushProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!entry || !style || phase === "loading") return null;
  const { lesson, unit } = entry;
  // A lesson either paces its brief across steps or falls back to one
  // paragraph; the preview and the start button wait for the final beat so
  // the learner isn't reading ahead while still being introduced.
  const briefSteps = lesson.brief.steps ?? [];
  const onLastBriefStep = lastBriefBeat;
  const activePreviewSql = briefPreviewSql;
  const activePreviewSheet =
    briefSteps[briefStep]?.previewSheet ??
    (onLastBriefStep ? lesson.brief.previewSheet : undefined);
  const activePreviewCaption =
    briefSteps[briefStep]?.previewCaption ?? lesson.brief.previewCaption;
  // Advance within whichever module the learner picked on the roadmap, so a
  // "just Python" learner isn't dropped into a SQL lesson at the end.
  const nextId = nextLessonId(lesson.id, moduleId);
  // XP in the learner's own sport's language — yards for football, and the
  // equivalent unit of ground gained for the other two.
  const gainNoun =
    sport === "basketball" ? "pts" : sport === "baseball" ? "bases" : "yards";
  const styleDef = getStyle(style);
  const introCards: TheoryCard[] =
    style === "film-room"
      ? [lesson.intro, ...(lesson.film ?? [])]
      : [lesson.intro];
  const hintsVisible = style !== "gunslinger" || hintShown;

  function runQuery(sql: string): QueryExecResult | undefined {
    const db = dbRef.current;
    if (!db) throw new Error("SQL engine still loading — try again in a second.");
    return db.exec(sql)[0];
  }

  function handleRun() {
    setRunError(null);
    setSoftError(null);
    try {
      const res = runQuery(queryText);
      setRunResult(res ?? { columns: [], values: [] });
    } catch (err) {
      setRunResult(null);
      setRunError(err instanceof Error ? err.message : String(err));
    }
  }

  /** Run a live-code exercise without grading it — the console button. */
  async function handleRunCode(ex: CodeExercise) {
    if (running) return;
    setRunning(true);
    setCodeError(null);
    try {
      const res = await runCode(ex.lang, codeText);
      setCodeOutput(res.error ? null : res.stdout);
      setCodeError(res.error);
    } finally {
      setRunning(false);
    }
  }

  /**
   * Grade by executing the learner's code and the reference solution in the
   * same runtime and comparing what they printed. A crash or syntax error
   * returns null so it costs no heart — same forgiveness the SQL path gives.
   */
  async function gradeCode(
    ex: CodeExercise,
  ): Promise<{ correct: boolean; solution?: string } | null> {
    const mine = await runCode(ex.lang, codeText);
    if (mine.error) {
      setCodeOutput(null);
      setCodeError(mine.error);
      setSoftError(mine.error);
      return null;
    }
    setCodeOutput(mine.stdout);
    setCodeError(null);

    if (!mine.stdout.trim()) {
      setSoftError(
        "That ran, but printed nothing — wrap your answer in print() so it can be checked.",
      );
      return null;
    }

    const reference = await runCode(ex.lang, ex.expected);
    if (reference.error) {
      // Our answer key is broken, not the learner's code. Never penalise them.
      setSoftError(
        "The answer key failed to run — that's our bug, not yours. Skipping the check.",
      );
      return null;
    }
    return {
      correct: outputsMatch(mine.stdout, reference.stdout),
      solution: ex.expected,
    };
  }

  /** Run a formula without grading it — the preview button. */
  async function handleRunFormula() {
    if (running) return;
    setRunning(true);
    try {
      const res = await evaluateFormula(formulaText, formulaSheet);
      setFormulaValue(res.error ? null : res.value);
      setFormulaError(res.error);
    } finally {
      setRunning(false);
    }
  }

  /**
   * Grade an Excel formula on the value it produces, not on its text — there
   * are several correct ways to write most of these, and string-matching would
   * reject all but one of them.
   *
   * The one extra rule: the formula has to actually reference the sheet.
   * Otherwise a learner can read 402.5 off the grid, type `=402.5`, and be
   * graded correct without having written a formula at all.
   */
  async function gradeFormula(
    ex: FormulaExercise,
  ): Promise<{ correct: boolean; solution?: string } | null> {
    const mine = await evaluateFormula(formulaText, ex.sheet ?? MAIN_SHEET);
    if (mine.error) {
      setFormulaValue(null);
      setFormulaError(mine.error);
      setSoftError(mine.error);
      return null;
    }
    setFormulaValue(mine.value);
    setFormulaError(null);

    if (!ex.allowLiteral && !referencesCells(formulaText)) {
      setSoftError(
        "That returns the right kind of value, but it doesn't reference a single cell — read it from the sheet instead of typing the number.",
      );
      return null;
    }

    const reference = await evaluateFormula(ex.expected, ex.sheet ?? MAIN_SHEET);
    if (reference.error) {
      // Our key is broken, not their formula. Never take a heart for that.
      setSoftError(
        "The answer key failed to run — that's our bug, not yours. Skipping the check.",
      );
      return null;
    }
    return {
      correct: valuesMatch(mine.value, reference.value),
      solution: ex.expected,
    };
  }

  function grade(): { correct: boolean; solution?: string } | null {
    if (!exercise) return null;
    if (exercise.type === "mc") {
      return {
        correct: mcChoice === exercise.answer,
        solution: exercise.options[exercise.answer],
      };
    }
    if (exercise.type === "fill") {
      const correct =
        fillSlots.length === exercise.answer.length &&
        fillSlots.every((s, i) => s === exercise.answer[i]);
      return { correct, solution: fillSolution(exercise) };
    }
    // query
    const ex = exercise as QueryExercise;
    let learner: QueryExecResult | undefined;
    try {
      learner = runQuery(queryText);
    } catch (err) {
      setSoftError(err instanceof Error ? err.message : String(err));
      return null; // syntax errors don't cost a heart — fix and retry
    }
    setRunResult(learner ?? { columns: [], values: [] });
    const expected = runQuery(ex.expected);
    return {
      correct:
        normalizeResult(learner, ex.orderMatters) ===
        normalizeResult(expected, ex.orderMatters),
      solution: ex.expected,
    };
  }

  async function handleCheck() {
    if (!exercise || currentIdx === undefined || checking) return;

    let result: { correct: boolean; solution?: string } | null;
    if (exercise.type === "code") {
      // Live runtimes are async (and may still be downloading), so this path
      // can't reuse the synchronous grade() the other exercise types use.
      setChecking(true);
      try {
        result = await gradeCode(exercise);
      } finally {
        setChecking(false);
      }
    } else if (exercise.type === "formula") {
      setChecking(true);
      try {
        result = await gradeFormula(exercise);
      } finally {
        setChecking(false);
      }
    } else {
      result = grade();
    }
    if (!result) return; // soft error (code didn't run) — no heart lost

    const isFirstAttempt = !attempted[currentIdx];
    setAttempted((m) => ({ ...m, [currentIdx]: true }));

    if (result.correct) {
      if (isFirstAttempt) {
        setFirstTry((m) => ({ ...m, [currentIdx]: true }));
        setXp((v) => v + XP_PER_EXERCISE);
      } else {
        setXp((v) => v + XP_RETRY);
      }
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));

      // The play: yardage scaled to how much the drill actually asked for,
      // plus a momentum bonus. This is what animates; XP is what persists.
      const play = runPlay(exercise.type, isFirstAttempt, newCombo, currentIdx);
      setDriveYards((y) => y + play.yards);
      setBurst({ yards: play.yards, id: Date.now(), explosive: play.explosive });

      setFeedback({
        correct: true,
        headline: play.heat ? `${play.call} · ${play.heat} 🔥` : play.call,
        yards: play.yards,
        explain: exercise.explain,
      });
    } else {
      if (isFirstAttempt) setFirstTry((m) => ({ ...m, [currentIdx]: false }));
      setCombo(0);
      setHearts((h) => h - 1);
      setBurst(null);
      setHitId((v) => v + 1);
      setFeedback({
        correct: false,
        headline: missCall(currentIdx),
        solution: result.solution,
        explain: exercise.explain,
      });
    }
  }

  function handleContinue() {
    if (!feedback || currentIdx === undefined) return;
    if (!feedback.correct && hearts <= 0) {
      setFeedback(null);
      setPhase("timeout");
      return;
    }
    setQueue((q) =>
      feedback.correct ? q.slice(1) : [...q.slice(1), currentIdx],
    );
    setFeedback(null);
  }

  function restart() {
    savedRef.current = false;
    setQueue(activeIdx);
    setHearts(MAX_HEARTS);
    setCombo(0);
    setXp(0);
    setDriveYards(0);
    setBestCombo(0);
    setBurst(null);
    setUnlocked([]);
    setFirstTry({});
    setAttempted({});
    setFeedback(null);
    setIntroStep(0);
    setBriefStep(0);
    // Every style starts at the brief. Gunslingers skip the theory cards that
    // follow it, not the grounding itself — landing cold on drill #1 with no
    // idea what the table looks like was the old behaviour and it was wrong.
    setPhase("brief");
  }

  const coachMood: CoachMood =
    phase === "complete"
      ? "cheer"
      : phase === "timeout"
        ? "sad"
        : feedback
          ? feedback.correct
            ? combo >= 3
              ? "cheer"
              : "happy"
            : "sad"
          : exercise?.type === "query"
            ? "think"
            : "idle";

  const done = total - queue.length;
  const firstTryCorrect = Object.values(firstTry).filter(Boolean).length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-8">
      {/* top bar */}
      <div className="flex items-center gap-4 py-4">
        <Link
          href="/learn"
          aria-label="Quit lesson"
          className="text-ink-muted transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <DriveField
          pct={drivePct(done, total)}
          heat={heatLabel(combo)}
          burst={burst}
        />
        <div
          key={hitId}
          className={`flex items-center gap-1 ${hitId > 0 ? "animate-shake" : ""}`}
        >
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span
              key={i}
              className={i === hearts && hitId > 0 ? "animate-heart-break" : ""}
            >
              <HeartIcon filled={i < hearts} />
            </span>
          ))}
        </div>
      </div>

      {/* lesson label */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="label-broadcast">
          {unit.drive} · {lesson.title}
        </p>
        <span className="shrink-0 border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          {styleDef.name}
        </span>
      </div>

      {phase === "brief" && (
        <div className="animate-fade-up flex flex-1 flex-col justify-center gap-5">
          <div className="flex items-start gap-4">
            <div className="hidden shrink-0 sm:block">
              <Coach mood="happy" size={104} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="label-broadcast text-turf">
                {briefSteps.length > 0
                  ? `the brief · ${briefStep + 1} of ${briefSteps.length}`
                  : "the brief"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold leading-snug text-ink">
                {briefSteps.length > 0
                  ? briefSteps[briefStep].title
                  : lesson.brief.goal}
              </h2>
              <p
                key={briefStep}
                className="animate-fade-up mt-3 text-sm leading-relaxed text-ink-soft"
              >
                {briefSteps.length > 0
                  ? briefSteps[briefStep].body
                  : lesson.brief.setup}
              </p>
              {briefSteps[briefStep]?.code && (
                <pre
                  key={`c-${briefStep}`}
                  className="animate-fade-up mt-3 overflow-x-auto border border-panel-border bg-night px-3 py-2.5 font-mono text-[12px] leading-relaxed text-turf"
                >
                  {briefSteps[briefStep].code}
                </pre>
              )}
              {briefSteps[briefStep]?.note && (
                <p
                  key={`n-${briefStep}`}
                  className="animate-fade-up mt-3 border-l-2 border-gold/50 bg-gold/5 py-2 pl-3 pr-2 text-[13px] leading-relaxed text-ink-muted"
                >
                  {briefSteps[briefStep].note}
                </p>
              )}
            </div>
          </div>

          {/* Pager. Dots mirror the theory cards, so the two read the same. */}
          {briefSteps.length > 1 && (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setBriefStep((i) => Math.max(0, i - 1))}
                disabled={briefStep === 0}
                className="press font-mono text-[11px] uppercase tracking-widest text-ink-muted hover:text-ink disabled:opacity-30"
              >
                ← Back
              </button>
              <div className="flex items-center gap-1.5">
                {briefSteps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Brief step ${i + 1}`}
                    onClick={() => setBriefStep(i)}
                    className={`h-1.5 w-6 transition-colors ${
                      i === briefStep ? "bg-turf" : "bg-panel-hover hover:bg-turf/40"
                    }`}
                  />
                ))}
              </div>
              {!onLastBriefStep ? (
                <button
                  type="button"
                  onClick={() => setBriefStep((i) => i + 1)}
                  className="press font-mono text-[11px] uppercase tracking-widest text-turf hover:opacity-80"
                >
                  Next →
                </button>
              ) : (
                <span className="w-[52px]" />
              )}
            </div>
          )}

          {/* Real rows from the real database, before we ask about them. */}
          {activePreviewSql && (
            <div className="border border-panel-border bg-night/95 shadow-scoreboard">
              <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
                <span className="label-broadcast text-[10px] text-turf">
                  {activePreviewCaption ?? "the data"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {briefRows ? `${briefRows.values.length} rows` : "loading…"}
                </span>
              </div>
              <pre className="overflow-x-auto border-b border-panel-border px-3 py-2 font-mono text-[11px] text-ink-muted">
                {activePreviewSql}
              </pre>
              {briefRows && briefRows.columns.length > 0 && (
                <div className="max-h-56 overflow-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-panel-border">
                        {briefRows.columns.map((c) => (
                          <th
                            key={c}
                            className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {briefRows.values.map((row, i) => (
                        <tr key={i} className="border-b border-panel-border/50">
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className="px-3 py-1.5 font-mono text-[12px] text-ink"
                            >
                              {cell === null ? "null" : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Real data deserves a visible source, not a footnote nobody reads. */}
          {(activePreviewSql || activePreviewSheet) && (
            <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
              {SHORT_CREDIT} ·{" "}
              <Link
                href="/data"
                className="underline underline-offset-2 hover:text-turf"
              >
                source &amp; free download
              </Link>
            </p>
          )}

          {/* Excel lessons: the real grid, before we ask anything about it. */}
          {activePreviewSheet && (
            <ExcelGrid
              sheet={activePreviewSheet}
              maxRows={9}
              caption={activePreviewCaption}
            />
          )}

          {onLastBriefStep ? (
            <button
              type="button"
              onClick={() =>
                setPhase(style === "gunslinger" ? "exercise" : "intro")
              }
              className="press w-full border border-turf bg-turf/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf hover:bg-turf/25"
            >
              {style === "gunslinger" ? "Snap the ball" : "Walk me through it"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setBriefStep((i) => i + 1)}
              className="surface press w-full border border-panel-border bg-panel/60 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-ink-soft hover:border-turf/50 hover:text-turf"
            >
              Got it → keep going
            </button>
          )}
        </div>
      )}

      {phase === "intro" && (
        <div
          key={introStep}
          className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-6 text-center"
        >
          <Coach mood="happy" size={140} />
          <TheoryCardView card={introCards[introStep]} />
          {introCards.length > 1 && (
            <div className="flex items-center gap-1.5">
              {introCards.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-6 ${
                    i === introStep ? "bg-turf" : "bg-panel-hover"
                  }`}
                />
              ))}
            </div>
          )}
          {introStep < introCards.length - 1 ? (
            <button
              type="button"
              onClick={() => setIntroStep((s) => s + 1)}
              className="surface w-full max-w-xs border border-panel-border bg-panel/70 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-ink transition-colors hover:border-turf/50 hover:text-turf"
            >
              Next film card
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPhase("exercise")}
              className="w-full max-w-xs border border-turf bg-turf/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
            >
              Take the field
            </button>
          )}
        </div>
      )}

      {phase === "exercise" && exercise && (
        <div key={currentIdx} className="animate-play-in flex flex-1 flex-col">
          {/* gunslinger's on-demand chalkboard */}
          {style === "gunslinger" && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setChalkboardOpen((v) => !v)}
                className="font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:text-turf"
              >
                {chalkboardOpen ? "▾ hide chalkboard" : "▸ peek at the chalkboard"}
              </button>
              {chalkboardOpen && (
                <div className="surface mt-2 border border-panel-border bg-panel/60 p-4">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-turf">
                    {lesson.intro.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                    {lesson.intro.text}
                  </p>
                  {lesson.intro.code && (
                    <pre className="mt-2 overflow-x-auto border border-panel-border bg-night px-3 py-2 font-mono text-[12px] leading-relaxed text-turf">
                      {lesson.intro.code}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* coach + prompt */}
          <div className="flex items-start gap-4">
            <div className="hidden shrink-0 sm:block">
              <Coach mood={coachMood} size={96} />
            </div>
      <div className="surface relative flex-1 border border-panel-border bg-panel/80 p-4 ">
              <span className="absolute -left-2 top-6 hidden h-4 w-4 rotate-45 border-b border-l border-panel-border bg-panel sm:block" />
              <p className="text-[15px] leading-relaxed text-ink">
                {exercise.prompt}
              </p>
              {exercise.type === "mc" && exercise.code && (
                <pre className="mt-3 overflow-x-auto border border-panel-border bg-night px-3 py-2 font-mono text-[13px] leading-relaxed text-gold">
                  {exercise.code}
                </pre>
              )}
            </div>
          </div>

          {/* answer area */}
          <div className="mt-5 flex-1">
            {exercise.type === "mc" && (
              <div className="grid gap-2">
                {exercise.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={!!feedback}
                    onClick={() => setMcChoice(i)}
                    className={`border px-4 py-3 text-left font-mono text-[13px] transition-colors ${
                      mcChoice === i
                        ? "border-turf bg-turf/10 text-turf"
                        : "border-panel-border bg-panel/60 text-ink-soft hover:border-turf/40 hover:text-ink"
                    } disabled:cursor-default`}
                  >
                    <span className="mr-3 text-ink-muted">{i + 1}</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {exercise.type === "fill" && (
              <div>
                <pre className="overflow-x-auto whitespace-pre-wrap border border-panel-border bg-night px-4 py-4 font-mono text-[14px] leading-loose text-ink">
                  {(() => {
                    let blank = -1;
                    return exercise.parts.map((part, i) => {
                      if (part !== null) return <span key={i}>{part}</span>;
                      blank += 1;
                      const b = blank;
                      const value = fillSlots[b];
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!!feedback}
                          onClick={() =>
                            setFillSlots((s) => {
                              const next = [...s];
                              next[b] = null;
                              return next;
                            })
                          }
                          className={`mx-0.5 inline-block min-w-[72px] border-b-2 px-2 py-0.5 text-center align-baseline transition-colors ${
                            value
                              ? "border-turf bg-turf/10 text-turf"
                              : "border-ink-muted/50 text-ink-muted"
                          }`}
                        >
                          {value ?? " "}
                        </button>
                      );
                    });
                  })()}
                </pre>
                <div className="mt-4 flex flex-wrap gap-2">
                  {exercise.bank.map((chip) => {
                    const used = fillSlots.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        disabled={used || !!feedback}
                        onClick={() =>
                          setFillSlots((s) => {
                            const firstEmpty = s.indexOf(null);
                            if (firstEmpty === -1) return s;
                            const next = [...s];
                            next[firstEmpty] = chip;
                            return next;
                          })
                        }
                        className={`border px-3 py-2 font-mono text-[13px] transition-colors ${
                          used
                            ? "border-panel-border bg-panel text-panel-hover"
                            : "border-panel-border bg-panel/80 text-ink hover:border-turf/50 hover:text-turf"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {exercise.type === "code" && (
              <div className="border border-panel-border bg-night/95 shadow-scoreboard">
                <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
                  <span className="label-broadcast text-turf">
                    your {LANG_LABEL[exercise.lang].toLowerCase()} · runs for real
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    {runtimeLoading === exercise.lang
                      ? `loading ${LANG_LABEL[exercise.lang]} ${LANG_WEIGHT[exercise.lang]}…`
                      : "runtime ready"}
                  </span>
                </div>
                <CodeEditor
                  value={codeText}
                  onChange={setCodeText}
                  lang={exercise.lang}
                  rows={9}
                  disabled={!!feedback}
                  ariaLabel={`${LANG_LABEL[exercise.lang]} answer editor`}
                />
                <div className="flex items-center justify-between border-t border-panel-border px-3 py-2">
                  <p className="font-mono text-[10px] text-ink-muted">
                    print your answer so it can be checked
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRunCode(exercise)}
                    disabled={
                      running || !!runtimeLoading || !!feedback || checking
                    }
                    className="border border-panel-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/50 hover:text-turf disabled:opacity-40"
                  >
                    {running ? "running…" : "▸ Run"}
                  </button>
                </div>
                {(codeError || softError) && (
                  <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] leading-relaxed text-gold">
                    ⚠ {softError ?? codeError}
                    {" — no flag on the play. Fix it and check again."}
                  </p>
                )}
                {codeOutput !== null && !codeError && (
                  <div className="max-h-48 overflow-auto border-t border-panel-border bg-night px-4 py-3">
                    <p className="label-broadcast mb-1 text-[10px] text-ink-muted">
                      output
                    </p>
                    <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-ink">
                      {codeOutput || "(nothing printed)"}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {exercise.type === "formula" && (
              <div className="space-y-3">
                <ExcelGrid sheet={formulaSheet} maxRows={9} />

                <div className="border border-panel-border bg-night/95 shadow-scoreboard">
                  <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
                    <span className="label-broadcast text-turf">
                      formula bar · fx
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      {formulaReady ? "engine ready" : "loading engine…"}
                    </span>
                  </div>
                  <CodeEditor
                    value={formulaText}
                    onChange={setFormulaText}
                    lang="excel"
                    rows={2}
                    disabled={!!feedback}
                    ariaLabel="Excel formula editor"
                  />
                  <div className="flex items-center justify-between border-t border-panel-border px-3 py-2">
                    <p className="font-mono text-[10px] text-ink-muted">
                      sheet: {formulaSheet}
                    </p>
                    <button
                      type="button"
                      onClick={handleRunFormula}
                      disabled={running || !!feedback}
                      className="border border-panel-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/50 hover:text-turf disabled:opacity-40"
                    >
                      {running ? "Running…" : "▸ Run preview"}
                    </button>
                  </div>
                  {(formulaError || softError) && (
                    <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">
                      ⚠ {softError ?? formulaError}
                      {softError &&
                        " — no flag on the play. Fix it and check again."}
                    </p>
                  )}
                  {formulaValue !== null && !formulaError && (
                    <div className="flex items-baseline gap-3 border-t border-panel-border px-3 py-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                        result
                      </span>
                      <span className="font-mono text-[15px] font-semibold text-turf">
                        {formatValue(formulaValue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {exercise.type === "query" && (
              <div className="border border-panel-border bg-night/95 shadow-scoreboard">
                <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
                  <span className="label-broadcast text-turf">
                    your sql · 3 tables loaded
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    {engineReady ? "engine ready" : "loading engine…"}
                  </span>
                </div>
                <CodeEditor
                  value={queryText}
                  onChange={setQueryText}
                  lang="sql"
                  rows={5}
                  disabled={!!feedback}
                  ariaLabel="SQL answer editor"
                />
                <div className="flex items-center justify-end border-t border-panel-border px-3 py-2">
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={!engineReady || !!feedback}
                    className="border border-panel-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/50 hover:text-turf disabled:opacity-40"
                  >
                    ▸ Run preview
                  </button>
                </div>
                {/* Prompts name tables constantly; make them checkable here. */}
                <SchemaReference />
                {(runError || softError) && (
                  <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">
                    ⚠ {softError ?? runError}
                    {softError && " — no flag on the play. Fix it and check again."}
                  </p>
                )}
                {runResult && runResult.columns.length > 0 && (
                  <div className="max-h-48 overflow-auto border-t border-panel-border">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-panel-border">
                          {runResult.columns.map((c, i) => (
                            <th
                              key={i}
                              className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted"
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {runResult.values.slice(0, 30).map((row, ri) => (
                          <tr key={ri} className="border-b border-panel-border/40">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="px-3 py-1.5 font-mono text-[12px] text-ink-soft"
                              >
                                {cell === null ? "null" : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {runResult.values.length > 30 && (
                      <p className="px-3 py-1.5 font-mono text-[10px] text-ink-muted">
                        …{runResult.values.length - 30} more rows
                      </p>
                    )}
                  </div>
                )}
                {runResult && runResult.columns.length === 0 && (
                  <p className="border-t border-panel-border px-3 py-2 font-mono text-[12px] text-ink-muted">
                    Query ran but returned nothing — try a SELECT.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* check bar / feedback */}
          <div className="mt-6">
            {!feedback ? (
              <div className="flex items-center justify-between gap-4">
                {exercise.type === "query" ||
                exercise.type === "code" ||
                exercise.type === "formula" ? (
                  hintsVisible ? (
                    <p className="font-mono text-[11px] text-ink-muted">
                      Hint:{" "}
                      {
                        (
                          exercise as
                            | QueryExercise
                            | CodeExercise
                            | FormulaExercise
                        ).hint
                      }
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHintShown(true)}
                      className="font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:text-gold"
                    >
                      Need a hint, gunslinger?
                    </button>
                  )
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={
                    (exercise.type === "mc" && mcChoice === null) ||
                    (exercise.type === "fill" &&
                      fillSlots.some((s) => s === null)) ||
                    (exercise.type === "query" && !engineReady) ||
                    (exercise.type === "code" &&
                      (!!runtimeLoading || running || checking)) ||
                    (exercise.type === "formula" &&
                      (!formulaText.replace(/^=/, "").trim() ||
                        running ||
                        checking))
                  }
                  className="press shrink-0 border border-turf bg-turf/15 px-8 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf hover:bg-turf/25 disabled:cursor-not-allowed disabled:border-panel-border disabled:bg-panel disabled:text-ink-muted"
                >
                  {checking ? "Checking…" : "Check"}
                </button>
              </div>
            ) : (
              <div
                className={`animate-fade-up border p-4 ${
                  feedback.correct
                    ? "border-turf/60 bg-turf/10"
                    : "border-gold/60 bg-gold/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`font-display text-lg font-bold ${
                      feedback.correct ? "text-turf" : "text-gold"
                    }`}
                  >
                    {feedback.headline}
                    {feedback.correct && (
                      <span className="ml-3 font-mono text-sm font-semibold">
                        +{firstTry[currentIdx] ? XP_PER_EXERCISE : XP_RETRY} XP
                        {feedback.yards !== undefined && (
                          <span className="ml-2 text-ink-muted">
                            · +{feedback.yards} {gainNoun}
                          </span>
                        )}
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className={`press shrink-0 border px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-widest ${
                      feedback.correct
                        ? "border-turf bg-turf/15 text-turf hover:bg-turf/25"
                        : "border-gold bg-gold/15 text-gold hover:bg-gold/25"
                    }`}
                  >
                    Continue
                  </button>
                </div>
                {!feedback.correct && feedback.solution && (
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap border border-panel-border bg-night px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-soft">
                    {feedback.solution}
                  </pre>
                )}
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  {feedback.explain}
                </p>
                {!feedback.correct && (
                  <p className="mt-2 font-mono text-[11px] text-ink-muted">
                    This play comes back around at the end of the drive.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "complete" && (
        <div className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="animate-trophy-in">
            <Coach mood="cheer" size={150} />
          </div>
          <div>
            <p className="label-broadcast text-turf">drive complete</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink">
              Touchdown! Lesson complete.
            </h1>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="border border-gold/40 bg-gold/5 p-4">
              <p className="label-broadcast">xp earned</p>
              <p className="stat-number mt-1 text-2xl">{shownXp}</p>
            </div>
            <div className="border border-turf/40 bg-turf/5 p-4">
              <p className="label-broadcast">first-try accuracy</p>
              <p className="stat-number-turf mt-1 text-2xl">
                {total > 0 ? Math.round((firstTryCorrect / total) * 100) : 0}%
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="border border-panel-border bg-panel/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
              {driveYards} yards on the drive
            </span>
            {bestCombo >= 3 && (
              <span className="border border-gold/50 bg-gold/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-gold">
                🔥 {bestCombo} straight
              </span>
            )}
          </div>
          {perfect && (
            <p className="font-mono text-xs uppercase tracking-widest text-gold">
              Perfect drive · +{PERFECT_BONUS} XP bonus
            </p>
          )}

          {/* Badge unlocks — the reason to come back tomorrow. */}
          {unlocked.length > 0 && (
            <div className="w-full max-w-sm">
              <p className="label-broadcast text-gold">
                {unlocked.length === 1 ? "badge unlocked" : "badges unlocked"}
              </p>
              <div className="mt-2 space-y-2">
                {unlocked.map((badge, i) => (
                  <div
                    key={badge.id}
                    className="animate-badge-drop sheen flex items-center gap-3 border border-gold/50 bg-gold/10 p-3 text-left"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="text-2xl leading-none" aria-hidden>
                      {badge.glyph}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-ink">
                        {badge.name}
                      </p>
                      <p className="text-[12px] leading-snug text-ink-muted">
                        {badge.requirement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex w-full max-w-sm flex-col gap-2">
            {nextId ? (
              <Link
                href={`/learn/${nextId}`}
                className="border border-turf bg-turf/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
              >
                Next lesson
              </Link>
            ) : (
              <p className="font-mono text-xs text-ink-muted">
                You&apos;ve cleared every live lesson in this module. Switch
                modules on the roadmap to keep going.
              </p>
            )}
            <Link
              href="/learn"
              className="border border-panel-border px-6 py-3 font-mono text-sm uppercase tracking-widest text-ink-muted transition-colors hover:border-turf/40 hover:text-ink"
            >
              Back to the field
            </Link>
          </div>
        </div>
      )}

      {phase === "timeout" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Coach mood="sad" size={140} />
          <div>
            <p className="label-broadcast text-gold">timeout</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">
              Coach calls a timeout.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              Out of hearts — happens to every rookie. Huddle up, shake it off,
              and run the drive again. Repetition is how film study works.
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <button
              type="button"
              onClick={restart}
              className="border border-turf bg-turf/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
            >
              Rerun the drive
            </button>
            <Link
              href="/learn"
              className="border border-panel-border px-6 py-3 font-mono text-sm uppercase tracking-widest text-ink-muted transition-colors hover:border-turf/40 hover:text-ink"
            >
              Back to the field
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
