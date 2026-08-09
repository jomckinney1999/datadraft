"use client";

// Duolingo-style lesson player: hearts, XP, combo streaks, re-queued misses.
// Query exercises grade by running learner SQL and the solution SQL against
// the same in-browser sql.js database and comparing result values.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
} from "@/lib/curriculum";
import { completeLesson } from "@/lib/progress";
import Coach, { type CoachMood } from "@/components/coach";

type Phase = "intro" | "exercise" | "complete" | "timeout";

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
      const ka = a.join("");
      const kb = b.join("");
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
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M12 21c-5.5-4.1-9-7.3-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 3.7-3.5 6.9-9 11z"
        fill={filled ? "#E8A33D" : "none"}
        stroke={filled ? "#E8A33D" : "#3a4356"}
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function LessonPlayer({ lessonId }: { lessonId: string }) {
  const entry = getLesson(lessonId);

  const dbRef = useRef<Database | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const savedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("intro");
  const [queue, setQueue] = useState<number[]>(
    entry ? entry.lesson.exercises.map((_, i) => i) : [],
  );
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

  const total = entry ? entry.lesson.exercises.length : 0;
  const currentIdx = queue[0];
  const exercise: Exercise | undefined =
    entry && currentIdx !== undefined
      ? entry.lesson.exercises[currentIdx]
      : undefined;

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
    setRunResult(null);
    setRunError(null);
    setSoftError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase]);

  // lesson finished?
  useEffect(() => {
    if (phase === "exercise" && queue.length === 0) {
      setPhase("complete");
    }
  }, [phase, queue.length]);

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

  if (!entry) return null;
  const { lesson, unit } = entry;

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
      setSoftError(
        err instanceof Error ? err.message : String(err),
      );
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

  function handleCheck() {
    if (!exercise || currentIdx === undefined) return;
    const result = grade();
    if (!result) return; // soft error (query didn't parse)

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
    setQueue(lesson.exercises.map((_, i) => i));
    setHearts(MAX_HEARTS);
    setCombo(0);
    setXp(0);
    setFirstTry({});
    setAttempted({});
    setFeedback(null);
    setPhase("exercise");
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
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <HeartIcon key={i} filled={i < hearts} />
          ))}
        </div>
      </div>

      {/* lesson label */}
      <p className="label-broadcast mb-4">
        {unit.drive} · {lesson.title}
      </p>

      {phase === "intro" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Coach mood="happy" size={140} />
          <div className="w-full border border-panel-border bg-panel/80 p-6 text-left shadow-scoreboard">
            <p className="label-broadcast text-teal">
              coach blitz&apos;s chalkboard
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">
              {lesson.intro.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {lesson.intro.text}
            </p>
            {lesson.intro.code && (
              <pre className="mt-4 overflow-x-auto border border-panel-border bg-night px-4 py-3 font-mono text-[13px] leading-relaxed text-teal">
                {lesson.intro.code}
              </pre>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPhase("exercise")}
            className="w-full max-w-xs border border-teal bg-teal/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-teal transition-colors hover:bg-teal/25"
          >
            Take the field
          </button>
        </div>
      )}

      {phase === "exercise" && exercise && (
        <div className="flex flex-1 flex-col">
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
                <pre className="mt-3 overflow-x-auto border border-panel-border bg-night px-3 py-2 font-mono text-[13px] leading-relaxed text-amber">
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
                        ? "border-teal bg-teal/10 text-teal"
                        : "border-panel-border bg-panel/60 text-ink-soft hover:border-teal/40 hover:text-ink"
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
                      if (part !== null)
                        return <span key={i}>{part}</span>;
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
                              ? "border-teal bg-teal/10 text-teal"
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
                            : "border-panel-border bg-panel/80 text-ink hover:border-teal/50 hover:text-teal"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {exercise.type === "query" && (
              <div className="border border-panel-border bg-night/95 shadow-scoreboard">
                <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
                  <span className="label-broadcast text-teal">
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
                  className="w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none caret-teal"
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
                    className="border border-panel-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-teal/50 hover:text-teal disabled:opacity-40"
                  >
                    ▸ Run preview
                  </button>
                </div>
                {(runError || softError) && (
                  <p className="border-t border-amber/40 bg-amber/5 px-3 py-2 font-mono text-[12px] text-amber">
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
                {exercise.type === "query" ? (
                  <p className="font-mono text-[11px] text-ink-muted">
                    Hint: {(exercise as QueryExercise).hint}
                  </p>
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
                    (exercise.type === "query" && !engineReady)
                  }
                  className="shrink-0 border border-teal bg-teal/15 px-8 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-teal transition-colors hover:bg-teal/25 disabled:cursor-not-allowed disabled:border-panel-border disabled:bg-panel disabled:text-ink-muted"
                >
                  Check
                </button>
              </div>
            ) : (
              <div
                className={`border p-4 ${
                  feedback.correct
                    ? "border-teal/60 bg-teal/10"
                    : "border-amber/60 bg-amber/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`font-display text-lg font-bold ${
                      feedback.correct ? "text-teal" : "text-amber"
                    }`}
                  >
                    {feedback.headline}
                    {feedback.correct && (
                      <span className="ml-3 font-mono text-sm font-semibold">
                        +{attempted[currentIdx] && firstTry[currentIdx] ? XP_PER_EXERCISE : XP_RETRY} XP
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className={`shrink-0 border px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-widest transition-colors ${
                      feedback.correct
                        ? "border-teal bg-teal/15 text-teal hover:bg-teal/25"
                        : "border-amber bg-amber/15 text-amber hover:bg-amber/25"
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
            <p className="label-broadcast text-teal">drive complete</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink">
              Touchdown! Lesson complete.
            </h1>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="border border-amber/40 bg-amber/5 p-4">
              <p className="label-broadcast">xp earned</p>
              <p className="stat-number mt-1 text-2xl">{finalXp}</p>
            </div>
            <div className="border border-teal/40 bg-teal/5 p-4">
              <p className="label-broadcast">first-try accuracy</p>
              <p className="stat-number-teal mt-1 text-2xl">
                {total > 0 ? Math.round((firstTryCorrect / total) * 100) : 0}%
              </p>
            </div>
          </div>
          {perfect && (
            <p className="font-mono text-xs uppercase tracking-widest text-amber">
              Perfect drive · +{PERFECT_BONUS} XP bonus
            </p>
          )}
          <div className="flex w-full max-w-sm flex-col gap-2">
            {nextLessonId(lesson.id) ? (
              <Link
                href={`/learn/${nextLessonId(lesson.id)}`}
                className="border border-teal bg-teal/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-teal transition-colors hover:bg-teal/25"
              >
                Next lesson
              </Link>
            ) : (
              <p className="font-mono text-xs text-ink-muted">
                You&apos;ve cleared every live lesson. More drives coming soon.
              </p>
            )}
            <Link
              href="/learn"
              className="border border-panel-border px-6 py-3 font-mono text-sm uppercase tracking-widest text-ink-muted transition-colors hover:border-teal/40 hover:text-ink"
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
            <p className="label-broadcast text-amber">timeout</p>
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
              className="border border-teal bg-teal/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-teal transition-colors hover:bg-teal/25"
            >
              Rerun the drive
            </button>
            <Link
              href="/learn"
              className="border border-panel-border px-6 py-3 font-mono text-sm uppercase tracking-widest text-ink-muted transition-colors hover:border-teal/40 hover:text-ink"
            >
              Back to the field
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
