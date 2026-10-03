"use client";

// DataCamp / Duolingo-style lesson player with a real football drive sim:
// every exercise is a play. Correct answers gain yards; misses burn a down.
// Soft errors (syntax) cost nothing. 4th-down miss = turnover. Misses show
// the right answer, then come back a few snaps later (review queue).
//
// Every lesson: brief walk-in, chalkboard theory, then one drive of drills.
// Immediate feedback after each play; soft errors cost no downs.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import HofTrophy from "@/components/hof-trophy";
import type { Database, QueryExecResult } from "sql.js";
import { buildSeedSql } from "@/lib/fantasy-data";
import {
  getLesson,
  MODULES,
  ALL_MODULE,
  nextLessonId,
  XP_PER_EXERCISE,
  XP_RETRY,
  PERFECT_BONUS,
  type Exercise,
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
import { useRouter } from "next/navigation";
import LessonOutline from "@/components/lesson-outline";
import CourseArt, { hasCourseArt } from "@/components/course-art";
import UnitArt, { hasUnitArt } from "@/components/unit-art";
import {
  awardBadges,
  completeLesson,
  displayStreak,
  loadProgress,
  type Progress,
} from "@/lib/progress";
import { pushProgress } from "@/lib/progress-sync";
import {
  canStartLesson,
  loadEconomy,
  spendTimeout,
  spendTickets,
  COST_INSTANT_REPLAY,
  COST_CHALLENGE_FLAG,
} from "@/lib/economy";
import Coach, { celebrationFor } from "@/components/coach";
import TablePeek from "@/components/table-peek";
import TeamChip, { isTeamColumn } from "@/components/team-chip";
import { tablesMentioned } from "@/lib/table-mentions";
import CoachAssist from "@/components/coach-assist";
import TimeoutGate from "@/components/timeout-gate";
import { PassGateScreen } from "@/components/pass-gate";
import { PAYWALL_LIVE } from "@/lib/season-pass";
import { unitIsFree } from "@/lib/pass-units";
import CodeEditor from "@/components/code-editor";
import ExcelGrid, { type CellCoord } from "@/components/excel-grid";
import SchemaReference from "@/components/schema-reference";
import {
  ensureFormulaEngine,
  evaluateFormula,
  formatValue,
  referencesCells,
  valuesMatch,
} from "@/lib/excel-engine";
import { MAIN_SHEET, toA1, type CellValue } from "@/lib/excel-data";
import { SHORT_CREDIT } from "@/lib/data-source";
import DriveField, { burstFromPlay, type FieldBurst } from "@/components/drive-field";
import {
  ConfettiBurst,
  XpFloat,
  ComboRibbon,
  RewardToast,
} from "@/components/lesson-fx";
import SfxMuteButton from "@/components/sfx-mute-button";
import { heatLabel } from "@/lib/gameplay";
import {
  startDrive,
  scoreCorrectPlay,
  scoreMissPlay,
  type DriveState,
  type PlayKind,
} from "@/lib/drive-sim";
import { newlyEarned, statsFrom, type Badge } from "@/lib/achievements";
import { useCountUp } from "@/lib/use-count-up";
import { playForPlayKind, playSfx } from "@/lib/sfx";
import {
  describeLearnerAnswer,
  fillSolution,
  queueAfterMiss,
  whyWrongMessage,
  MAX_REVIEWS,
} from "@/lib/miss-feedback";

type Phase =
  | "loading"
  | "brief"
  | "intro"
  | "exercise"
  | "complete"
  | "turnover";

type Feedback = {
  correct: boolean;
  headline: string;
  /** Yards gained (or lost) on this play. */
  yards?: number;
  playKind?: PlayKind;
  solution?: string;
  explain: string;
  /** Plain “you said X” for miss panels. */
  yourAnswer?: string;
  /** Contrast line before the curriculum explain. */
  whyWrong?: string;
  /** Miss will reappear later in the drive. */
  willReview?: boolean;
};

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

function TheoryCardView({ card }: { card: TheoryCard }) {
  return (
    <div className="lesson-prompt w-full text-left">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-turf">
        Coach Blitz&apos;s chalkboard
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
        {card.title}
      </h1>
      <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-soft">
        {card.text}
      </p>
      {card.code && (
        <pre className="mt-5 overflow-x-auto rounded-xl border border-panel-border bg-night px-4 py-3 font-mono text-[13px] leading-relaxed text-turf">
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

  const dbRef = useRef<Database | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const savedRef = useRef(false);
  const { moduleId } = useModule();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("loading");
  const [timeoutBlocked, setTimeoutBlocked] = useState(false);
  /** Past a course's first unit without the Season Pass (paywall on only). */
  const [passBlocked, setPassBlocked] = useState(false);
  const [economy, setEconomy] = useState<Progress | null>(null);
  const timeoutSpentRef = useRef(false);
  /** Drive snapshot taken right before a hard miss — Instant Replay restores it. */
  const driveBeforeMissRef = useRef<DriveState | null>(null);
  const [showMissSolution, setShowMissSolution] = useState(false);
  const [replayMsg, setReplayMsg] = useState<string | null>(null);
  /** How many times each exercise index has been re-queued after a miss. */
  const [reviewCounts, setReviewCounts] = useState<Record<number, number>>({});
  const [rewardToast, setRewardToast] = useState<{
    label: string;
    accent: "gold" | "turf" | "ice";
  } | null>(null);
  const [completionBoost, setCompletionBoost] = useState<{
    streak: number;
    ticketsGained: number;
    streakGrew: boolean;
  } | null>(null);
  const [introStep, setIntroStep] = useState(0);
  /**
   * Which beat of the brief's paced walk-in is showing.
   *
   * The preview table and the "start" button are held back until the last
   * beat, so a beginner meets one idea at a time instead of a wall of text
   * with a table under it.
   */
  const [briefStep, setBriefStep] = useState(0);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [queue, setQueue] = useState<number[]>([]);
  const [drive, setDrive] = useState<DriveState>(() => startDrive());
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [firstTry, setFirstTry] = useState<Record<number, boolean>>({});
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  /**
   * The graded play's feedback panel. When a play is graded the panel grows
   * under the question, and on a laptop screen it grew straight past the
   * bottom edge — the Continue button with it. The action bar is pinned now,
   * and this scrolls the page so the panel sits in the space between the
   * scorebug and the bar: all of it when it fits, otherwise its top just
   * under the scorebug. Measured, not a fixed margin, because the bar is
   * twice as tall after a miss (headline plus three buttons) as after a hit.
   */
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const actionBarRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() => {
      const el = feedbackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const top = (topBarRef.current?.getBoundingClientRect().bottom ?? 0) + 12;
      const bottom = (actionBarRef.current?.getBoundingClientRect().top ?? window.innerHeight) - 12;
      let delta = 0;
      if (r.height > bottom - top) delta = r.top - top;
      else if (r.bottom > bottom) delta = r.bottom - bottom;
      else if (r.top < top) delta = r.top - top;
      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, behavior: still ? "auto" : "smooth" });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [feedback]);

  /**
   * Arrow keys drive the lesson. → is the primary button of whatever screen
   * you are on (next beat, next card, Check, Continue, next lesson), ← steps
   * back through the intro, ↑/↓ move the multiple-choice selection. The
   * listener is attached once and calls whichever handler the latest render
   * left in this ref, so it always sees current state. Keys typed into an
   * editor or any text field are never intercepted — the caret needs them.
   */
  const keyRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current?.(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // per-exercise inputs
  const [mcChoice, setMcChoice] = useState<number | null>(null);
  const [fillSlots, setFillSlots] = useState<(string | null)[]>([]);
  const [queryText, setQueryText] = useState("");
  const [runResult, setRunResult] = useState<QueryExecResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [softError, setSoftError] = useState<string | null>(null);
  const [briefRows, setBriefRows] = useState<QueryExecResult | null>(null);

  // live-code exercises (Python / R / SQL executed for real)
  const [codeText, setCodeText] = useState("");
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [runtimeLoading, setRuntimeLoading] = useState<Lang | null>(null);
  /** Hints stay hidden until the learner asks — same as Duo. */
  const [hintShown, setHintShown] = useState(false);

  // Excel formula exercises (evaluated live against lib/excel-data.ts)
  const [formulaText, setFormulaText] = useState("");
  const [formulaValue, setFormulaValue] = useState<CellValue | boolean>(null);
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [formulaReady, setFormulaReady] = useState(false);
  const [formulaSelected, setFormulaSelected] = useState<CellCoord | null>(
    null,
  );

  // ── drive state (downs-and-distance over grading) ──
  const [driveYards, setDriveYards] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  /** Floating play-result chip. `id` forces a re-animation on repeat values. */
  const [burst, setBurst] = useState<FieldBurst | null>(null);
  /** Badges unlocked by this lesson, celebrated on the completion screen. */
  const [unlocked, setUnlocked] = useState<Badge[]>([]);
  /** Duolingo FX — bump key to re-fire confetti; float shows last XP award. */
  const [fxKey, setFxKey] = useState(0);
  const [xpFloat, setXpFloat] = useState<{
    amount: number;
    yards: number;
  } | null>(null);

  const activeIdx = useMemo(() => {
    if (!entry) return [];
    return entry.lesson.exercises.map((_, i) => i);
  }, [entry]);

  const total = activeIdx.length;
  const currentIdx = queue[0];
  const exercise: Exercise | undefined =
    entry && currentIdx !== undefined
      ? entry.lesson.exercises[currentIdx]
      : undefined;

  /**
   * Tables this question names, so the learner can put one on screen instead
   * of picturing it. Scanned rather than authored per exercise: the content is
   * hundreds of drills deep and anything opt-in would be missing from most.
   */
  const mentionedTables = useMemo(() => {
    if (!exercise) return [];
    const code = "code" in exercise ? exercise.code : undefined;
    const starter = "starter" in exercise ? exercise.starter : undefined;
    const parts =
      exercise.type === "fill" ? exercise.parts.join(" ") : undefined;
    return tablesMentioned(exercise.prompt, code, starter, parts);
  }, [exercise]);

  /**
   * The SQL the brief should be showing right now.
   *
   * A beat can carry its own preview so it can display the table it is
   * talking about; otherwise the lesson-level preview appears on the final
   * beat. Derived up here because the effect that runs it is a hook, and
   * hooks have to sit above the early return that `lesson` comes after.
   */
  const authoredBrief = entry?.lesson.brief.steps ?? [];
  const alreadyEasesIn = /^(You|What you're|What this course)/.test(
    authoredBrief[0]?.title ?? "",
  );
  const briefStepsAll = entry
    ? alreadyEasesIn
      ? authoredBrief
      : [
          {
            title: "What this lesson is",
            body: `${entry.lesson.brief.goal} ${entry.lesson.brief.setup} We'll look at the idea first, then you'll try it.`,
          },
          ...authoredBrief,
        ]
    : [];
  const lastBriefBeat =
    briefStepsAll.length === 0 || briefStep >= briefStepsAll.length - 1;
  const briefPreviewSql =
    briefStepsAll[briefStep]?.previewSql ??
    (lastBriefBeat ? entry?.lesson.brief.previewSql : undefined);

  // Which workbook tab the current formula exercise reads from.
  const formulaSheet =
    exercise?.type === "formula" ? exercise.sheet ?? MAIN_SHEET : MAIN_SHEET;

  // Graded drives spend one daily timeout (Season Pass / Practice Field exempt).
  useEffect(() => {
    const p = loadEconomy();
    setEconomy(p);
    setPassBlocked(false);

    const day = new Date().toISOString().slice(0, 10);
    const spendKey = `sqlsports.timeout-spend.${lessonId}.${day}`;
    let alreadySpent = false;
    try {
      alreadySpent = sessionStorage.getItem(spendKey) === "1";
    } catch {
      alreadySpent = timeoutSpentRef.current;
    }

    if (p.seasonPass || alreadySpent) {
      timeoutSpentRef.current = true;
      setTimeoutBlocked(false);
      return;
    }

    // Past a course's first unit is the Season Pass. Checked before a
    // timeout is spent, so the offer never costs a free lesson.
    if (PAYWALL_LIVE && entry && !unitIsFree(entry.unit.id)) {
      setPassBlocked(true);
      return;
    }

    if (!canStartLesson(p)) {
      setTimeoutBlocked(true);
      return;
    }

    const spent = spendTimeout();
    timeoutSpentRef.current = true;
    if (!spent) {
      setTimeoutBlocked(true);
      setEconomy(loadEconomy());
      return;
    }
    try {
      sessionStorage.setItem(spendKey, "1");
    } catch {
      /* ignore */
    }
    setEconomy(spent);
    setTimeoutBlocked(false);
  }, [lessonId, entry]);

  // Once timeouts are settled, deal the queue and open the brief.
  useEffect(() => {
    if (timeoutBlocked || phase !== "loading") return;
    setQueue(activeIdx);
    setPhase("brief");
  }, [phase, activeIdx, timeoutBlocked]);

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
    setFormulaSelected(null);
    setCodeOutput(null);
    setCodeError(null);
    setRunResult(null);
    setRunError(null);
    setSoftError(null);
    setHintShown(false);
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

  useEffect(() => {
    if (phase === "complete") playSfx("complete");
  }, [phase]);

  const perfect = drive.downsBurned === 0 && Object.values(firstTry).every(Boolean);
  const finalXp = xp + (perfect && total > 0 ? PERFECT_BONUS : 0);
  // Ticks up on the completion screen; stays 0 elsewhere so the animation
  // starts from nothing the moment that screen mounts.
  const shownXp = useCountUp(phase === "complete" ? finalXp : 0);

  // persist once on completion
  useEffect(() => {
    if (phase === "complete" && !savedRef.current && entry) {
      savedRef.current = true;
      const before = loadProgress();
      const streakBefore = displayStreak(before);
      const ticketsBefore = before.tickets ?? 0;
      const saved = completeLesson(entry.lesson.id, finalXp, {
        perfect,
        bestCombo,
        yards: driveYards,
      });
      const ticketsGained = Math.max(0, (saved.tickets ?? 0) - ticketsBefore);
      const streakGrew =
        saved.streak > streakBefore ||
        (streakBefore === 0 && saved.streak >= 1);
      setCompletionBoost({
        streak: saved.streak,
        ticketsGained,
        streakGrew,
      });
      if (ticketsGained > 0) {
        setRewardToast({
          label: `+${ticketsGained} ✦ tickets`,
          accent: "gold",
        });
        window.setTimeout(() => setRewardToast(null), 1600);
      }
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

  if (passBlocked) {
    return (
      <PassGateScreen
        moment="course-unit"
        backHref="/learn"
        backLabel="Back to courses"
        title="The rest of this course is in the Season Pass"
      />
    );
  }

  if (timeoutBlocked && economy) {
    return (
      <TimeoutGate
        progress={economy}
        backHref="/learn"
        onRefill={(p) => {
          setEconomy(p);
          if (!canStartLesson(p)) return;
          const spent = spendTimeout();
          timeoutSpentRef.current = true;
          if (!spent) return;
          try {
            const day = new Date().toISOString().slice(0, 10);
            sessionStorage.setItem(
              `sqlsports.timeout-spend.${lessonId}.${day}`,
              "1",
            );
          } catch {
            /* ignore */
          }
          setEconomy(spent);
          setTimeoutBlocked(false);
          setPhase("loading");
        }}
      />
    );
  }

  if (!entry || phase === "loading") return null;
  const { lesson } = entry;
  const artId =
    MODULES.find(
      (m) =>
        m.id !== ALL_MODULE &&
        m.id !== "sql-foundations" &&
        m.unitIds.includes(entry.unit.id),
    )?.id ?? null;
  // A lesson either paces its brief across steps or falls back to one
  // paragraph; the preview and the start button wait for the final beat so
  // the learner isn't reading ahead while still being introduced.
  const briefSteps = briefStepsAll;
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
  // One sport, so one noun. This used to branch on the learner's picked
  // sport; basketball and baseball never had a dataset behind them.
  const gainNoun = "yards";
  const introCards: TheoryCard[] = [lesson.intro, ...(lesson.film ?? [])];

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
   * returns null so it costs no down — same forgiveness the SQL path gives.
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

  /** Click a grid cell to insert its address — Excel-style point-and-click. */
  function insertFormulaCell(cell: CellCoord, a1: string) {
    if (feedback) return;
    setFormulaSelected(cell);
    const ref =
      formulaSheet === MAIN_SHEET ? a1 : `${formulaSheet}!${a1}`;
    setFormulaText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed || trimmed === "=") return `=${ref}`;
      const withEq = trimmed.startsWith("=") ? trimmed : `=${trimmed}`;
      if (withEq.endsWith(ref) || withEq.endsWith(a1)) return withEq;
      return withEq + ref;
    });
    setFormulaError(null);
    setSoftError(null);
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
      // Our key is broken, not their formula. Never burn a down for that.
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
      return null; // syntax errors don't burn a down — fix and retry
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
    if (!result) return; // soft error (code didn't run) — no down burned
    // It ran and was graded, so any "syntax error — fix & retry" left from an
    // earlier attempt is stale; leaving it up beside a graded answer read as
    // though this attempt had failed to run too.
    setSoftError(null);

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

      const scored = scoreCorrectPlay(
        drive,
        exercise.type,
        isFirstAttempt,
        newCombo,
        currentIdx,
      );
      setDrive(scored.state);
      setDriveYards((y) => y + scored.yards);
      const kind = scored.state.lastPlay?.kind ?? "gain";
      setBurst(
        burstFromPlay(kind, scored.yards, Date.now(), scored.explosive),
      );

      const xpGain = isFirstAttempt ? XP_PER_EXERCISE : XP_RETRY;
      setFxKey((k) => k + 1);
      setXpFloat({ amount: xpGain, yards: scored.yards });
      window.setTimeout(() => setXpFloat(null), 1400);

      setFeedback({
        correct: true,
        headline: scored.heat
          ? `${scored.call} · ${scored.heat}`
          : kind === "first_down"
            ? `${scored.call} · First down!`
            : kind === "td"
              ? `${scored.call} · Touchdown!`
              : scored.call,
        yards: scored.yards,
        playKind: kind,
        explain: exercise.explain,
      });
      playForPlayKind(true, kind);
    } else {
      if (isFirstAttempt) setFirstTry((m) => ({ ...m, [currentIdx]: false }));
      setCombo(0);

      // Snapshot LOS/downs so Instant Replay can rewind the play.
      driveBeforeMissRef.current = drive;
      setShowMissSolution(true);
      setReplayMsg(null);

      const missed = scoreMissPlay(drive, currentIdx);
      setDrive(missed.state);
      const kind = missed.state.lastPlay?.kind ?? "incomplete";
      const yards = missed.state.lastPlay?.yards ?? 0;
      setBurst(burstFromPlay(kind, yards, Date.now()));

      const yourAnswer = describeLearnerAnswer(exercise, {
        mcChoice,
        fillSlots,
        queryText,
        codeText,
        formulaText,
      });
      const reviewsSoFar = reviewCounts[currentIdx] ?? 0;
      const willReview =
        kind !== "turnover" && reviewsSoFar < MAX_REVIEWS;

      setFeedback({
        correct: false,
        headline:
          kind === "turnover"
            ? `${missed.call} · Turnover on downs`
            : missed.call,
        yards,
        playKind: kind,
        solution: result.solution,
        explain: exercise.explain,
        yourAnswer,
        whyWrong: whyWrongMessage(exercise, yourAnswer, result.solution),
        willReview,
      });
      playForPlayKind(false, kind);
    }
  }

  /** Free practice on this snap — down already burned; no ticket spend. */
  function handleTryAgainNow() {
    if (!feedback || feedback.correct) return;
    setFeedback(null);
    setShowMissSolution(false);
    setReplayMsg(null);
    setBurst(null);
    setMcChoice(null);
    setFillSlots([]);
    setSoftError(null);
    setRunError(null);
    setCodeError(null);
    setFormulaError(null);
    setHintShown(false);
    if (exercise?.type === "query") setQueryText(exercise.starter);
    if (exercise?.type === "code") setCodeText(exercise.starter);
    if (exercise?.type === "formula") setFormulaText(exercise.starter);
  }

  /** Spend tickets to rewind the miss and re-take this snap. */
  function handleInstantReplay() {
    if (!feedback || feedback.correct) return;
    const snapshot = driveBeforeMissRef.current;
    if (!snapshot) return;

    const cost =
      feedback.playKind === "turnover"
        ? COST_CHALLENGE_FLAG
        : COST_INSTANT_REPLAY;
    const next = spendTickets(cost);
    if (!next) {
      setReplayMsg(
        `Need ${cost} ✦ tickets — you have ${loadEconomy().tickets}.`,
      );
      setEconomy(loadEconomy());
      return;
    }

    setEconomy(next);
    setRewardToast({ label: `−${cost} ✦`, accent: "gold" });
    window.setTimeout(() => setRewardToast(null), 1200);
    setDrive(snapshot);
    driveBeforeMissRef.current = null;
    setFeedback(null);
    setShowMissSolution(false);
    setReplayMsg(null);
    setBurst(null);
    // Soft-clear inputs so they aren't staring at the wrong answer.
    setMcChoice(null);
    setFillSlots([]);
    setSoftError(null);
    setRunError(null);
    setCodeError(null);
    setFormulaError(null);
    if (phase === "turnover") setPhase("exercise");
  }

  function handleContinue() {
    if (!feedback || currentIdx === undefined) return;

    if (drive.status === "turnover" || feedback.playKind === "turnover") {
      setFeedback(null);
      setShowMissSolution(false);
      setPhase("turnover");
      return;
    }

    if (drive.status === "touchdown" || feedback.playKind === "td") {
      setFeedback(null);
      setQueue([]);
      setPhase("complete");
      return;
    }

    if (!feedback.correct) {
      // Duo-style: bring the miss back a few snaps later.
      const scheduled = queueAfterMiss(queue, currentIdx, reviewCounts);
      setReviewCounts(scheduled.reviewCounts);
      setQueue(scheduled.queue);
    } else {
      setQueue((q) => q.slice(1));
    }
    setFeedback(null);
    setShowMissSolution(false);
    driveBeforeMissRef.current = null;
  }

  function restart() {
    savedRef.current = false;
    driveBeforeMissRef.current = null;
    setShowMissSolution(false);
    setReplayMsg(null);
    setReviewCounts({});
    setRewardToast(null);
    setCompletionBoost(null);
    setQueue(activeIdx);
    setDrive(startDrive());
    setCombo(0);
    setXp(0);
    setDriveYards(0);
    setBestCombo(0);
    setBurst(null);
    setUnlocked([]);
    setFxKey(0);
    setXpFloat(null);
    setFirstTry({});
    setAttempted({});
    setFeedback(null);
    setIntroStep(0);
    setBriefStep(0);
    setPhase("brief");
  }

  const firstTryCorrect = Object.values(firstTry).filter(Boolean).length;
  const playOrdinal =
    total > 0 ? Math.min(total, total - queue.length + (queue.length > 0 ? 1 : 0)) : 0;
  const isHandsOn =
    !!exercise &&
    (exercise.type === "query" ||
      exercise.type === "code" ||
      exercise.type === "formula");
  const isReviewPlay =
    currentIdx !== undefined && (reviewCounts[currentIdx] ?? 0) > 0;
  const checkDisabled =
    !exercise ||
    (exercise.type === "mc" && mcChoice === null) ||
    (exercise.type === "fill" && fillSlots.some((s) => s === null)) ||
    (exercise.type === "query" && !engineReady) ||
    (exercise.type === "code" && (!!runtimeLoading || running || checking)) ||
    (exercise.type === "formula" &&
      (!formulaText.replace(/^=/, "").trim() || running || checking));

  keyRef.current = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const k = e.key;
    if (k !== "ArrowRight" && k !== "ArrowLeft" && k !== "ArrowUp" && k !== "ArrowDown") return;
    const t = e.target;
    if (
      t instanceof HTMLElement &&
      (t.isContentEditable || t.closest("input, textarea, select, [contenteditable='true']"))
    ) {
      return;
    }
    if (outlineOpen) return;
    const fwd = k === "ArrowRight";
    const back = k === "ArrowLeft";

    if (phase === "brief") {
      if (fwd) {
        e.preventDefault();
        if (onLastBriefStep) setPhase("intro");
        else setBriefStep((i) => i + 1);
      } else if (back && briefStep > 0) {
        e.preventDefault();
        setBriefStep((i) => i - 1);
      }
      return;
    }
    if (phase === "intro") {
      if (fwd) {
        e.preventDefault();
        if (introStep < introCards.length - 1) setIntroStep((s) => s + 1);
        else setPhase("exercise");
      } else if (back) {
        e.preventDefault();
        if (introStep > 0) setIntroStep((s) => s - 1);
        else setPhase("brief");
      }
      return;
    }
    if (phase === "exercise" && exercise) {
      if (feedback) {
        if (fwd) {
          e.preventDefault();
          handleContinue();
        }
        return;
      }
      if (exercise.type === "mc" && (k === "ArrowUp" || k === "ArrowDown")) {
        e.preventDefault();
        const n = exercise.options.length;
        const step = k === "ArrowDown" ? 1 : -1;
        setMcChoice((c) => (c === null ? (step > 0 ? 0 : n - 1) : (c + step + n) % n));
        return;
      }
      if (fwd && !checkDisabled) {
        e.preventDefault();
        void handleCheck();
      }
      return;
    }
    if (phase === "complete" && fwd && nextId) {
      e.preventDefault();
      router.push(`/learn/${nextId}`);
    }
  };

  return (
    <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen overflow-hidden border-r border-panel-border lg:block">
        <LessonOutline
          lessonId={lesson.id}
          unitId={entry.unit.id}
          refreshKey={phase}
        />
      </aside>
      {outlineOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close outline"
            className="absolute inset-0 bg-night/70"
            onClick={() => setOutlineOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(100%,20rem)] overflow-hidden border-r border-panel-border shadow-scoreboard">
            <LessonOutline
              lessonId={lesson.id}
              unitId={entry.unit.id}
              refreshKey={phase}
              onClose={() => setOutlineOpen(false)}
              onNavigate={() => setOutlineOpen(false)}
            />
          </div>
        </div>
      )}
    <div
      className={`relative mx-auto flex min-h-screen w-full flex-col px-4 ${
        phase === "exercise" && isHandsOn
          ? "max-w-6xl"
          : "max-w-xl sm:max-w-2xl"
      }`}
    >
      <ConfettiBurst fireKey={fxKey} active={!!feedback?.correct} />
      <XpFloat
        amount={xpFloat?.amount ?? 0}
        yards={xpFloat?.yards}
        yardsLabel={gainNoun}
        show={!!xpFloat}
      />
      <RewardToast
        label={rewardToast?.label ?? ""}
        show={!!rewardToast}
        accent={rewardToast?.accent}
      />
      {/* top bar — frosted scorebug */}
      <div ref={topBarRef} className="glass sticky top-0 z-20 -mx-4 border-b border-panel-border/50 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            aria-label="Quit lesson"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-panel-border bg-panel/80 text-ink-muted transition-colors hover:border-turf/40 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setOutlineOpen(true)}
            className="status-chip shrink-0 lg:hidden"
          >
            Outline
          </button>
          <DriveField
            drive={drive}
            heat={heatLabel(combo)}
            burst={burst}
          />
          <SfxMuteButton />
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-ink-soft">
            {lesson.title}
          </p>
          {phase === "exercise" && total > 0 && (
            <span className="shrink-0 rounded-full border border-panel-border bg-panel/70 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              Play {playOrdinal}/{total}
            </span>
          )}
        </div>
      </div>

      {/* The unit's own picture beside the title, in the same lit card as the
          roadmap's current unit, so walking from the path into a lesson
          keeps the same picture in view. Falls back to the course's. */}
      {/* Only on the brief: during plays the scorebug already names the
          lesson, and this card's height is what pushed Continue off a laptop
          screen. */}
      {phase === "brief" && (hasUnitArt(entry.unit.id) || (artId && hasCourseArt(artId))) && (
        <div className="unit-banner mt-4 flex items-center justify-between gap-4 !py-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-turf">
              {entry.unit.title}
            </p>
            <p className="font-display text-lg font-bold leading-tight text-ink">
              {lesson.title}
            </p>
          </div>
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-turf/30 bg-night/60 sm:h-24 sm:w-32">
            {hasUnitArt(entry.unit.id) ? (
              <UnitArt id={entry.unit.id} className="h-full w-full" />
            ) : (
              artId && <CourseArt id={artId} className="h-full w-full" />
            )}
          </div>
        </div>
      )}

      {phase === "brief" && (
        <div className="flex flex-1 flex-col">
        <div className="animate-fade-up flex flex-1 flex-col justify-center gap-6 py-6">
          <div className="flex items-start gap-4">
            <div className="hidden shrink-0 sm:block">
              <Coach mood="clipboard" size={104} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="label-broadcast text-turf">
                {briefSteps.length > 0
                  ? `intro · ${briefStep + 1} of ${briefSteps.length}`
                  : "intro"}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
                {briefSteps.length > 0
                  ? briefSteps[briefStep].title
                  : lesson.brief.goal}
              </h2>
              {/* Coach says the beat: the same dialogue bubble as the
                  cutscenes and the question pages, popping in per beat. */}
              <div
                key={briefStep}
                className="cutscene-pop cutscene-bubble relative mt-4 max-w-prose rounded-2xl border-[3px] border-night bg-ink px-4 py-3 text-night"
              >
                <span
                  aria-hidden
                  className="absolute -left-[11px] top-5 hidden h-0 w-0 border-y-[8px] border-r-[10px] border-y-transparent border-r-night sm:block"
                />
                <span
                  aria-hidden
                  className="absolute -left-[6px] top-[22px] hidden h-0 w-0 border-y-[6px] border-r-[7px] border-y-transparent border-r-ink sm:block"
                />
                <p className="text-base leading-relaxed">
                  {briefSteps.length > 0
                    ? briefSteps[briefStep].body
                    : lesson.brief.setup}
                </p>
              </div>
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
              <TablePeek
                tables={tablesMentioned(
                  briefSteps[briefStep]?.title,
                  briefSteps[briefStep]?.body,
                  briefSteps[briefStep]?.note,
                  briefSteps[briefStep]?.code,
                )}
                ready={engineReady}
                run={runQuery}
              />
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
                              {isTeamColumn(briefRows.columns[j] ?? "") && cell
                                ? <TeamChip abbr={String(cell)} />
                                : cell === null ? "null" : String(cell)}
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

        </div>
          <div className="lesson-actionbar">
            {onLastBriefStep ? (
              <button
                type="button"
                onClick={() => setPhase("intro")}
                aria-keyshortcuts="ArrowRight"
                className="btn-check"
              >
                Show me how
                <KeyHint />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBriefStep((i) => i + 1)}
                aria-keyshortcuts="ArrowRight"
                className="press w-full rounded-2xl border-2 border-panel-border bg-panel px-6 py-3.5 font-display text-base font-bold text-ink transition-colors hover:border-turf/50 hover:text-turf"
              >
                Got it
                <KeyHint />
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "intro" && (
        <div className="flex flex-1 flex-col">
        <div
          key={introStep}
          className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center"
        >
          <Coach mood="happy" size={140} />
          <TheoryCardView card={introCards[introStep]} />
          <div className="w-full max-w-xl text-left">
            <TablePeek
              tables={tablesMentioned(
                introCards[introStep]?.title,
                introCards[introStep]?.text,
                introCards[introStep]?.code,
              )}
              ready={engineReady}
              run={runQuery}
            />
          </div>
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
        </div>
          <div className="lesson-actionbar">
            <div className="mx-auto max-w-sm">
              {introStep < introCards.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setIntroStep((s) => s + 1)}
                  aria-keyshortcuts="ArrowRight"
                  className="press w-full rounded-2xl border-2 border-panel-border bg-panel px-6 py-3.5 font-display text-base font-bold text-ink transition-colors hover:border-turf/50 hover:text-turf"
                >
                  Next
                  <KeyHint />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhase("exercise")}
                  aria-keyshortcuts="ArrowRight"
                  className="btn-check"
                >
                  Let&apos;s practice
                  <KeyHint />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "exercise" && exercise && (
        <div
          key={currentIdx}
          className={`animate-play-in flex flex-1 flex-col pt-4 ${
            feedback?.correct ? "animate-correct-flash" : ""
          }`}
        >
          {isHandsOn ? (
            <div className="grid flex-1 gap-4 lg:grid-cols-2 lg:items-stretch">
              <aside className="lesson-content-pane p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-turf/40 bg-turf/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-turf">
                    Instructions
                  </span>
                  {isReviewPlay && (
                    <span className="rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                      Review play
                    </span>
                  )}
                  <ComboRibbon combo={combo} />
                </div>
                <h2 className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
                  {exercise.prompt}
                </h2>
                <TablePeek
                  tables={mentionedTables}
                  ready={engineReady}
                  run={runQuery}
                />
                <div className="mt-4 hidden sm:block">
                  <Coach
                    mood={
                      softError || codeError || runError || formulaError
                        ? "facepalm"
                        : feedback
                          ? feedback.correct
                            ? celebrationFor(`${lessonId}-${currentIdx}`)
                            : "sad"
                          : "think"
                    }
                    size={88}
                  />
                </div>
                <div className="mt-5">
                  {hintShown ? (
                    <div className="rounded-xl border border-ice/30 bg-ice/5 px-3 py-2.5 text-sm leading-snug text-ink-soft">
                      <span className="font-semibold text-ice">Hint · </span>
                      {
                        (
                          exercise as
                            | QueryExercise
                            | CodeExercise
                            | FormulaExercise
                        ).hint
                      }
                      <CoachAssist
                        mode="hint"
                        prompt={exercise.prompt}
                        exerciseType={exercise.type}
                        explain={exercise.explain}
                        lessonId={lessonId}
                        label="Ask Coach for another angle"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHintShown(true)}
                      className="text-sm font-medium text-ink-muted transition-colors hover:text-gold"
                    >
                      Need a hint?
                    </button>
                  )}
                </div>
                {exercise.type === "query" && (
                  <div className="mt-5">
                    <SchemaReference />
                  </div>
                )}
                {exercise.type === "formula" && (
                  <div className="mt-5">
                    <p className="mb-2 font-mono text-[10px] leading-snug text-ink-muted">
                      Click a cell to drop its address into the formula bar —
                      same move as Excel.
                    </p>
                    <ExcelGrid
                      sheet={formulaSheet}
                      maxRows={7}
                      selected={formulaSelected}
                      onSelect={feedback ? undefined : insertFormulaCell}
                      caption={
                        formulaSelected
                          ? `Selected ${toA1(formulaSelected.col, formulaSelected.row)}`
                          : undefined
                      }
                    />
                  </div>
                )}
                {feedback && (
                  <div
                    ref={feedbackRef}
                    className={`mt-5 animate-feedback-rise ${
                      feedback.correct ? "feedback-win" : "feedback-miss"
                    }`}
                  >
                    <p
                      className={`font-display text-lg font-bold ${
                        feedback.correct ? "text-turf" : "text-gold"
                      }`}
                    >
                      {feedback.correct ? "🎉 " : "🚩 "}
                      {feedback.headline}
                    </p>
                    {!feedback.correct && feedback.whyWrong && (
                      <p className="mt-2 text-sm font-medium leading-relaxed text-ink">
                        {feedback.whyWrong}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {feedback.explain}
                    </p>
                    {!feedback.correct && feedback.solution && (
                      <div className="mt-3">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          Correct answer
                        </p>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-xl border border-panel-border bg-night px-3 py-2 font-mono text-[12px] text-ink-soft">
                          {feedback.solution}
                        </pre>
                      </div>
                    )}
                    {!feedback.correct && feedback.willReview && (
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-gold">
                        You&apos;ll see this play again in a few snaps
                      </p>
                    )}
                    {!feedback.correct && (
                      <CoachAssist
                        mode="why_wrong"
                        prompt={exercise.prompt}
                        exerciseType={exercise.type}
                        learnerAnswer={feedback.yourAnswer}
                        solution={feedback.solution}
                        explain={feedback.explain}
                        lessonId={lessonId}
                      />
                    )}
                  </div>
                )}
              </aside>

              <section className="lesson-terminal-pane">
                <div className="lesson-terminal-chrome">
                  <div className="flex items-center gap-2">
                    <span className="lesson-terminal-dot bg-gold/80" />
                    <span className="lesson-terminal-dot bg-turf/80" />
                    <span className="lesson-terminal-dot bg-ice/80" />
                    <span className="ml-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      {exercise.type === "query"
                        ? "SQL terminal"
                        : exercise.type === "code"
                          ? `${LANG_LABEL[exercise.lang]} console`
                          : "Formula bar"}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    {exercise.type === "query"
                      ? engineReady
                        ? "ready"
                        : "loading…"
                      : exercise.type === "code"
                        ? runtimeLoading === exercise.lang
                          ? `loading ${LANG_WEIGHT[exercise.lang]}…`
                          : "ready"
                        : formulaReady
                          ? "ready"
                          : "loading…"}
                  </span>
                </div>

                {exercise.type === "code" && (
                  <>
                    <CodeEditor
                      value={codeText}
                      onChange={setCodeText}
                      lang={exercise.lang}
                      rows={12}
                      disabled={!!feedback}
                      ariaLabel={`${LANG_LABEL[exercise.lang]} answer editor`}
                      className="min-h-[220px] flex-1"
                    />
                    <div className="flex items-center justify-between border-t border-panel-border px-3 py-2">
                      <p className="font-mono text-[10px] text-ink-muted">
                        print() so output can be graded
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRunCode(exercise)}
                        disabled={
                          running || !!runtimeLoading || !!feedback || checking
                        }
                        className="btn-run"
                      >
                        {running ? "Running…" : "▸ Run"}
                      </button>
                    </div>
                    {(codeError || softError) && (
                      <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">
                        ⚠ {softError ?? codeError} — no down. Fix &amp; retry.
                      </p>
                    )}
                    {codeOutput !== null && !codeError && (
                      <div className="max-h-40 overflow-auto border-t border-panel-border bg-night px-4 py-3">
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          Output
                        </p>
                        <pre className="whitespace-pre-wrap font-mono text-[12px] text-ink">
                          {codeOutput || "(nothing printed)"}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {exercise.type === "formula" && (
                  <>
                    <div className="flex items-stretch border-b border-panel-border bg-night/80">
                      <div className="flex w-14 shrink-0 items-center justify-center border-r border-panel-border font-mono text-xs font-bold text-turf">
                        {formulaSelected
                          ? toA1(formulaSelected.col, formulaSelected.row)
                          : "ƒx"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CodeEditor
                          value={formulaText}
                          onChange={setFormulaText}
                          lang="excel"
                          rows={3}
                          disabled={!!feedback}
                          ariaLabel="Excel formula editor"
                          className="min-h-[72px] border-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-panel-border px-3 py-2">
                      <p className="font-mono text-[10px] text-ink-muted">
                        sheet: {formulaSheet}
                        {" · "}
                        <Link
                          href="/excel"
                          className="text-ice hover:underline"
                        >
                          open full workbook
                        </Link>
                      </p>
                      <button
                        type="button"
                        onClick={handleRunFormula}
                        disabled={running || !!feedback}
                        className="btn-run"
                      >
                        {running ? "Running…" : "▸ Run preview"}
                      </button>
                    </div>
                    {(formulaError || softError) && (
                      <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">
                        ⚠ {softError ?? formulaError}
                        {softError && " — no down. Fix & retry."}
                      </p>
                    )}
                    {formulaValue !== null && !formulaError && (
                      <div className="flex items-baseline gap-3 border-t border-panel-border px-3 py-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          Result
                        </span>
                        <span className="font-mono text-[15px] font-semibold text-turf">
                          {formatValue(formulaValue)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {exercise.type === "query" && (
                  <>
                    <CodeEditor
                      value={queryText}
                      onChange={setQueryText}
                      lang="sql"
                      rows={10}
                      disabled={!!feedback}
                      ariaLabel="SQL answer editor"
                      className="min-h-[200px] flex-1"
                    />
                    <div className="flex items-center justify-end border-t border-panel-border px-3 py-2">
                      <button
                        type="button"
                        onClick={handleRun}
                        disabled={!engineReady || !!feedback}
                        className="btn-run"
                      >
                        ▸ Run preview
                      </button>
                    </div>
                    {(runError || softError) && (
                      <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">
                        ⚠ {softError ?? runError}
                        {softError && " — no down. Fix & retry."}
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
                              <tr
                                key={ri}
                                className="border-b border-panel-border/40"
                              >
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className="px-3 py-1.5 font-mono text-[12px] text-ink-soft"
                                  >
                                    {isTeamColumn(runResult.columns[ci] ?? "") && cell
                                      ? <TeamChip abbr={String(cell)} />
                                      : cell === null ? "null" : String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {runResult && runResult.columns.length === 0 && (
                      <p className="border-t border-panel-border px-3 py-2 font-mono text-[12px] text-ink-muted">
                        Query ran but returned nothing — try a SELECT.
                      </p>
                    )}
                  </>
                )}
              </section>
            </div>
          ) : (
            <>
              <div className="lesson-prompt">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-turf">
                    Your play
                  </span>
                  {isReviewPlay && (
                    <span className="rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                      Review play
                    </span>
                  )}
                  <ComboRibbon combo={combo} />
                </div>
                <p className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                  {exercise.prompt}
                </p>
                {exercise.type === "mc" && exercise.code && (
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-panel-border bg-night px-3 py-2.5 font-mono text-[13px] leading-relaxed text-gold">
                    {exercise.code}
                  </pre>
                )}
                <TablePeek
                  tables={mentionedTables}
                  ready={engineReady}
                  run={runQuery}
                />
              </div>

              <div className="mt-5 flex-1 pb-4">
                {exercise.type === "mc" && (
                  <div className="grid gap-2.5">
                    {exercise.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={!!feedback}
                        onClick={() => setMcChoice(i)}
                        className={`option-chip ${
                          mcChoice === i
                            ? "option-chip-on animate-option-pop"
                            : ""
                        } disabled:cursor-default`}
                      >
                        <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-panel-border font-mono text-xs font-bold text-ink-muted">
                          {i + 1}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {exercise.type === "fill" && (
                  <div>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-panel-border bg-night px-4 py-4 font-mono text-[14px] leading-loose text-ink">
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
                              className={`mx-0.5 inline-block min-w-[72px] rounded-md border-b-2 px-2 py-0.5 text-center align-baseline transition-colors ${
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
                            className={`fill-chip ${used ? "fill-chip-used" : ""}`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {feedback && (
                  <div
                    ref={feedbackRef}
                    className={`mt-4 animate-feedback-rise ${
                      feedback.correct ? "feedback-win" : "feedback-miss"
                    }`}
                  >
                    {!feedback.correct && feedback.whyWrong && (
                      <p className="text-sm font-medium leading-relaxed text-ink">
                        {feedback.whyWrong}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {feedback.explain}
                    </p>
                    {!feedback.correct && feedback.solution && (
                      <div className="mt-3">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          Correct answer
                        </p>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-xl border border-panel-border bg-night px-3 py-2.5 font-mono text-[12px] text-ink-soft">
                          {feedback.solution}
                        </pre>
                      </div>
                    )}
                    {!feedback.correct && feedback.willReview && (
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-gold">
                        You&apos;ll see this play again in a few snaps
                      </p>
                    )}
                    {!feedback.correct && (
                      <CoachAssist
                        mode="why_wrong"
                        prompt={exercise.prompt}
                        exerciseType={exercise.type}
                        learnerAnswer={feedback.yourAnswer}
                        solution={feedback.solution}
                        explain={feedback.explain}
                        lessonId={lessonId}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div ref={actionBarRef} className="lesson-actionbar">
            <div
              className={`mx-auto ${
                isHandsOn ? "max-w-6xl" : "max-w-xl sm:max-w-none"
              }`}
            >
              {!feedback ? (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={checkDisabled}
                  aria-keyshortcuts="ArrowRight"
                  className="btn-check"
                >
                  {checking ? "Checking…" : "Check"}
                  {!checking && <KeyHint />}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  {!isHandsOn && (
                    <p
                      className={`font-display text-lg font-bold ${
                        feedback.correct ? "text-turf" : "text-gold"
                      }`}
                    >
                      {feedback.correct ? "🎉 " : "🚩 "}
                      {feedback.headline}
                      {feedback.correct && (
                        <span className="ml-2 text-sm font-semibold text-ink-soft">
                          +
                          {firstTry[currentIdx!]
                            ? XP_PER_EXERCISE
                            : XP_RETRY}{" "}
                          XP
                        </span>
                      )}
                    </p>
                  )}
                  {replayMsg && (
                    <p className="font-mono text-[11px] text-gold" role="status">
                      {replayMsg}
                    </p>
                  )}
                  {/* On a phone the two recovery buttons share a row, so a miss
                      doesn't stack three full-width buttons into a bar that
                      eats a third of the screen. On desktop the wrapper
                      dissolves (sm:contents) and all three sit in one row. */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <div className="grid auto-cols-fr grid-flow-col gap-2 empty:hidden sm:contents">
                    {!feedback.correct && feedback.playKind !== "turnover" && (
                      <button
                        type="button"
                        onClick={handleTryAgainNow}
                        className="rounded-2xl border-2 border-ice/50 border-b-4 bg-ice/10 px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ice transition-colors hover:bg-ice/20 sm:px-5 sm:py-3.5 sm:text-[12px]"
                      >
                        Try again now
                      </button>
                    )}
                    {!feedback.correct && driveBeforeMissRef.current && (
                      <button
                        type="button"
                        onClick={handleInstantReplay}
                        className="rounded-2xl border-2 border-gold/50 border-b-4 bg-gold/10 px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/20 sm:px-5 sm:py-3.5 sm:text-[12px]"
                      >
                        {feedback.playKind === "turnover"
                          ? `Challenge flag · ${COST_CHALLENGE_FLAG} ✦`
                          : `Undo down · ${COST_INSTANT_REPLAY} ✦`}
                        <span className="ml-2 hidden font-normal text-ink-muted normal-case tracking-normal sm:inline">
                          ({(economy ?? loadEconomy()).tickets} left)
                        </span>
                      </button>
                    )}
                    </div>
                    <button
                      type="button"
                      onClick={handleContinue}
                      aria-keyshortcuts="ArrowRight"
                      className={
                        feedback.correct
                          ? "btn-continue-win"
                          : "btn-continue-miss"
                      }
                    >
                      {feedback.playKind === "turnover"
                        ? "See the film"
                        : feedback.playKind === "td"
                          ? "Celebrate"
                          : feedback.correct
                            ? "Continue"
                            : feedback.willReview
                              ? "Got it — next play"
                              : "Continue"}
                      <KeyHint />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "complete" && (
        <div className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-6 pb-10 pt-8 text-center">
          <div className="animate-trophy-in">
            <Coach mood={perfect ? "dance" : celebrationFor(lessonId)} size={150} />
          </div>
          <div>
            <p className="inline-flex rounded-full border border-turf/40 bg-turf/15 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-turf">
              Drive complete
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              Touchdown!
            </h1>
            <p className="mt-2 text-base text-ink-soft">Lesson complete.</p>
            {completionBoost && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
                    completionBoost.streakGrew
                      ? "border-gold/50 bg-gold/15 text-gold animate-celebrate"
                      : "border-panel-border text-ink-muted"
                  }`}
                >
                  🔥 {completionBoost.streak}-day heater
                  {completionBoost.streakGrew ? " · extended!" : ""}
                </span>
                {completionBoost.ticketsGained > 0 && (
                  <span className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-gold">
                    +{completionBoost.ticketsGained} ✦ tickets
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="lesson-prompt !p-4 text-left">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                XP earned
              </p>
              <p className="stat-number mt-1 text-2xl">{shownXp}</p>
            </div>
            <div className="lesson-prompt !p-4 text-left">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                First-try
              </p>
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
                Enshrined in your Hall of Fame
              </p>
              <div className="mt-2 space-y-2">
                {unlocked.map((badge, i) => (
                  <div
                    key={badge.id}
                    className="animate-badge-drop sheen flex items-center gap-3 rounded-xl border border-gold/50 bg-gold/10 p-3 text-left"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <HofTrophy tier={badge.tier} earned className="h-14 w-12 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-ink">
                        <span aria-hidden>{badge.glyph} </span>
                        {badge.name}
                      </p>
                      <p className="text-[12px] leading-snug text-ink-muted">
                        {badge.requirement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/achievements"
                className="mt-2 inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-gold hover:underline"
              >
                See it in the case →
              </Link>
            </div>
          )}
          <div className="flex w-full max-w-sm flex-col gap-2.5">
            {nextId ? (
              <Link href={`/learn/${nextId}`} aria-keyshortcuts="ArrowRight" className="btn-check">
                Next lesson
                <KeyHint />
              </Link>
            ) : (
              <p className="text-sm text-ink-muted">
                You&apos;ve cleared every live lesson in this module. Switch
                modules on the roadmap to keep going.
              </p>
            )}
            <Link
              href="/learn"
              className="press rounded-2xl border-2 border-panel-border bg-panel px-6 py-3.5 text-center font-display text-base font-bold text-ink-soft transition-colors hover:border-turf/40 hover:text-ink"
            >
              Back to courses
            </Link>
          </div>
        </div>
      )}

      {phase === "turnover" && (
        <div className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-6 pb-10 pt-8 text-center">
          <Coach mood="sad" size={140} />
          <div>
            <p className="inline-flex rounded-full border border-gold/50 bg-gold/15 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-gold">
              Turnover on downs
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              Drive stalled
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-ink-soft">
              Fourth down and no conversion — happens to every offense. Throw a
              challenge flag to rewind that last snap, or restart the whole
              drive.
            </p>
          </div>
          {replayMsg && (
            <p className="font-mono text-[11px] text-gold" role="status">
              {replayMsg}
            </p>
          )}
          <div className="flex w-full max-w-sm flex-col gap-2.5">
            {driveBeforeMissRef.current && (
              <button
                type="button"
                onClick={handleInstantReplay}
                className="rounded-2xl border-2 border-gold/50 border-b-4 bg-gold/10 px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/20"
              >
                Challenge flag · {COST_CHALLENGE_FLAG} ✦
                <span className="mt-1 block font-normal normal-case tracking-normal text-ink-muted">
                  Replay the 4th-down snap · {(economy ?? loadEconomy()).tickets}{" "}
                  tickets
                </span>
              </button>
            )}
            <button type="button" onClick={restart} className="btn-check">
              Rerun the drive
            </button>
            <Link
              href="/learn"
              className="press rounded-2xl border-2 border-panel-border bg-panel px-6 py-3.5 text-center font-display text-base font-bold text-ink-soft transition-colors hover:border-turf/40 hover:text-ink"
            >
              Back to courses
            </Link>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

/**
 * "→" beside a primary button's label: this button is also the right-arrow
 * key. Desktop only — a phone has no arrow keys to hint at.
 */
function KeyHint() {
  return (
    <kbd
      aria-hidden
      className="ml-2 hidden rounded-md border border-current px-1.5 py-0.5 align-middle font-mono text-[10px] font-bold leading-none opacity-50 lg:inline-block"
    >
      →
    </kbd>
  );
}
