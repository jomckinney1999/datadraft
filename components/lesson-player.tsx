"use client";

// Duolingo-style lesson player: hearts, XP, combo streaks, re-queued misses.
// Query exercises grade by running learner SQL and the solution SQL against
// the same in-browser sql.js database and comparing result values.
//
// The experience adapts to the learner's playbook style (lib/playbook.ts):
//   film-room  — chalkboard intro + bonus film cards, hints always visible
//   gunslinger — straight to drills, drillSkip concept MCs removed, hints
//                behind a toggle, chalkboard available on demand
//   dual-threat — chalkboard intro, full exercise mix, hints visible

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
import { completeLesson, loadProgress } from "@/lib/progress";
import { getStyle, type PlaybookStyle } from "@/lib/playbook";
import Coach, { type CoachMood } from "@/components/coach";

type Phase = "loading" | "intro" | "exercise" | "complete" | "timeout";

type Feedback = {
  correct: boolean;
  headline: string;
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
    <div className="w-full border border-panel-border bg-panel/80 p-6 text-left shadow-scoreboard">
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
  const entry = getLesson(lessonId);
  const router = useRouter();

  const dbRef = useRef<Database | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const savedRef = useRef(false);
  const { moduleId } = useModule();

  const [style, setStyle] = useState<PlaybookStyle | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("loading");
  const [introStep, setIntroStep] = useState(0);
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

  // live-code exercises (Python / R / SQL executed for real)
  const [codeText, setCodeText] = useState("");
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [runtimeLoading, setRuntimeLoading] = useState<Lang | null>(null);

  // Gunslingers skip pure-recall concept checks; everyone else runs them all.
  const activeIdx = useMemo(() => {
    if (!entry) return [];
    return entry.lesson.exercises
      .map((_, i) => i)
      .filter((i) => {
        const ex = entry.lesson.exercises[i];
        return !(style === "gunslinger" && ex.type === "mc" && ex.drillSkip);
      });
  }, [entry, style]);

  const total = activeIdx.length;
  const currentIdx = queue[0];
  const exercise: Exercise | undefined =
    entry && currentIdx !== undefined
      ? entry.lesson.exercises[currentIdx]
      : undefined;

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
    setPhase(style === "gunslinger" ? "exercise" : "intro");
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
    setCodeOutput(null);
    setCodeError(null);
    setRunResult(null);
    setRunError(null);
    setSoftError(null);
    setHintShown(false);
    setChalkboardOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase]);

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

  // persist once on completion
  useEffect(() => {
    if (phase === "complete" && !savedRef.current && entry) {
      savedRef.current = true;
      completeLesson(entry.lesson.id, finalXp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!entry || !style || phase === "loading") return null;
  const { lesson, unit } = entry;
  // Advance within whichever module the learner picked on the roadmap, so a
  // "just Python" learner isn't dropped into a SQL lesson at the end.
  const nextId = nextLessonId(lesson.id, moduleId);
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
      setFeedback({
        correct: true,
        headline:
          newCombo >= 3
            ? `Completion! ${newCombo} plays in a row 🔥`
            : "Completion!",
        explain: exercise.explain,
      });
    } else {
      if (isFirstAttempt) setFirstTry((m) => ({ ...m, [currentIdx]: false }));
      setCombo(0);
      setHearts((h) => h - 1);
      setFeedback({
        correct: false,
        headline: "Flag on the play",
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
    setFirstTry({});
    setAttempted({});
    setFeedback(null);
    setIntroStep(0);
    setPhase(style === "gunslinger" ? "exercise" : "intro");
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
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-turf transition-all duration-500"
            style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <HeartIcon key={i} filled={i < hearts} />
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

      {phase === "intro" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
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
              className="w-full max-w-xs border border-panel-border bg-panel/70 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-ink transition-colors hover:border-turf/50 hover:text-turf"
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
        <div className="flex flex-1 flex-col">
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
                <div className="mt-2 border border-panel-border bg-panel/60 p-4">
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
            <div className="relative flex-1 border border-panel-border bg-panel/80 p-4 shadow-scoreboard">
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
                <textarea
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  spellCheck={false}
                  rows={9}
                  disabled={!!feedback}
                  className="w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none caret-turf"
                  aria-label={`${LANG_LABEL[exercise.lang]} answer editor`}
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
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  spellCheck={false}
                  rows={5}
                  disabled={!!feedback}
                  className="w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none caret-turf"
                  aria-label="SQL answer editor"
                />
                <div className="flex items-center justify-between border-t border-panel-border px-3 py-2">
                  <p className="font-mono text-[10px] text-ink-muted">
                    tables: week_results · rosters · waiver_wire
                  </p>
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={!engineReady || !!feedback}
                    className="border border-panel-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/50 hover:text-turf disabled:opacity-40"
                  >
                    ▸ Run preview
                  </button>
                </div>
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
                {exercise.type === "query" || exercise.type === "code" ? (
                  hintsVisible ? (
                    <p className="font-mono text-[11px] text-ink-muted">
                      Hint: {(exercise as QueryExercise | CodeExercise).hint}
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
                      (!!runtimeLoading || running || checking))
                  }
                  className="shrink-0 border border-turf bg-turf/15 px-8 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25 disabled:cursor-not-allowed disabled:border-panel-border disabled:bg-panel disabled:text-ink-muted"
                >
                  {checking ? "Checking…" : "Check"}
                </button>
              </div>
            ) : (
              <div
                className={`border p-4 ${
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
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className={`shrink-0 border px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-widest transition-colors ${
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
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Coach mood="cheer" size={150} />
          <div>
            <p className="label-broadcast text-turf">drive complete</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink">
              Touchdown! Lesson complete.
            </h1>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="border border-gold/40 bg-gold/5 p-4">
              <p className="label-broadcast">xp earned</p>
              <p className="stat-number mt-1 text-2xl">{finalXp}</p>
            </div>
            <div className="border border-turf/40 bg-turf/5 p-4">
              <p className="label-broadcast">first-try accuracy</p>
              <p className="stat-number-turf mt-1 text-2xl">
                {total > 0 ? Math.round((firstTryCorrect / total) * 100) : 0}%
              </p>
            </div>
          </div>
          {perfect && (
            <p className="font-mono text-xs uppercase tracking-widest text-gold">
              Perfect drive · +{PERFECT_BONUS} XP bonus
            </p>
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
