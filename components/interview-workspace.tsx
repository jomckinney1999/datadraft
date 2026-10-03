"use client";

/**
 * InterviewMaster-style workspace for one scripted case:
 * left = brief + question + hint/reveal; right = schema + SQL terminal.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import type { InterviewCase } from "@/lib/interview-cases";
import { DIFFICULTY_LABEL } from "@/lib/interview-cases";
import {
  markCaseStarted,
  markQuestionAnswered,
} from "@/lib/interview-progress";
import { resultsMatch } from "@/lib/sql-grade";
import { playSfx } from "@/lib/sfx";
import CodeEditor from "@/components/code-editor";
import Coach from "@/components/coach";
import HomeLink from "@/components/home-link";
import ProjectArt from "@/components/project-art";
import Cutscene, { useSceneOnce } from "@/components/cutscene";
import { caseBeats } from "@/lib/case-scenes";

function formatMs(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ResultTable({ res }: { res: QueryExecResult }) {
  return (
    <div className="max-h-48 overflow-auto">
      <table className="w-full text-left font-mono text-[11px]">
        <thead>
          <tr className="border-b border-panel-border text-ink-muted">
            {res.columns.map((c) => (
              <th key={c} className="px-3 py-1.5 font-semibold uppercase tracking-wider">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {res.values.map((row, i) => (
            <tr key={i} className="border-b border-panel-border/50 text-ink">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5">
                  {cell === null ? "NULL" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InterviewWorkspace({
  interviewCase,
}: {
  interviewCase: InterviewCase;
}) {
  const dbRef = useRef<Database | null>(null);
  // The briefing cutscene: plays on a first visit, then on request.
  const scene = useSceneOnce(`case:${interviewCase.id}`);
  const beats = useMemo(() => caseBeats(interviewCase.id), [interviewCase.id]);
  const [engineReady, setEngineReady] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [sql, setSql] = useState("SELECT ");
  const [runResult, setRunResult] = useState<QueryExecResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [revealShown, setRevealShown] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  const question = interviewCase.questions[qIndex];
  const total = interviewCase.questions.length;

  useEffect(() => {
    markCaseStarted(interviewCase.id);
  }, [interviewCase.id]);

  useEffect(() => {
    let cancelled = false;
    import("sql.js")
      .then((mod) => mod.default({ locateFile: () => "/sql-wasm.wasm" }))
      .then((SQL) => {
        if (cancelled) return;
        const db = new SQL.Database();
        db.run(interviewCase.seedSql);
        dbRef.current = db;
        setEngineReady(true);
      })
      .catch(() => setEngineReady(false));
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
  }, [interviewCase.seedSql]);

  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerOn]);

  useEffect(() => {
    setSql("SELECT ");
    setRunResult(null);
    setRunError(null);
    setFeedback(null);
    setHintShown(false);
    setRevealShown(false);
  }, [qIndex]);

  function runSql(text: string): QueryExecResult | undefined {
    const db = dbRef.current;
    if (!db) throw new Error("SQL engine still loading.");
    return db.exec(text)[0];
  }

  function handleRun() {
    setRunError(null);
    setFeedback(null);
    try {
      const res = runSql(sql);
      setRunResult(res ?? { columns: [], values: [] });
    } catch (err) {
      setRunResult(null);
      setRunError(err instanceof Error ? err.message : String(err));
    }
  }

  function handleExplore(table: string) {
    setSql(`SELECT * FROM ${table} LIMIT 5;`);
    setRunError(null);
    setFeedback(null);
    try {
      const res = runSql(`SELECT * FROM ${table} LIMIT 5`);
      setRunResult(res ?? { columns: [], values: [] });
    } catch (err) {
      setRunResult(null);
      setRunError(err instanceof Error ? err.message : String(err));
    }
  }

  function handleSubmit() {
    if (!question || feedback === "correct") return;
    setRunError(null);
    let mine: QueryExecResult | undefined;
    try {
      mine = runSql(sql);
      setRunResult(mine ?? { columns: [], values: [] });
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err));
      playSfx("miss");
      return;
    }

    let expected: QueryExecResult | undefined;
    try {
      expected = runSql(question.expected);
    } catch {
      setRunError("Answer key failed to run — please report this case.");
      return;
    }

    const ok = resultsMatch(mine, expected, question.orderMatters ?? false);
    if (ok) {
      playSfx("correct");
      setFeedback("correct");
      const progress = markQuestionAnswered(
        interviewCase.id,
        question.id,
        total,
      );
      if (progress.status === "completed" || qIndex >= total - 1) {
        window.setTimeout(() => setDone(true), 600);
      }
    } else {
      playSfx("miss");
      setFeedback("wrong");
    }
  }

  function handleNext() {
    if (qIndex < total - 1) {
      setQIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10">
        <HomeLink label="case" back="/projects" backLabel="all projects" />
        <div className="mt-10 flex flex-col items-center text-center">
          <Coach mood="cheer" size={120} />
          <p className="mt-4 label-broadcast text-turf">case cleared</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">
            Nice work
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            You finished all {total} questions on{" "}
            <span className="text-ink">{interviewCase.title}</span>. That&apos;s
            the kind of walkthrough you&apos;d want in a real screen.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/projects" className="btn-turf px-5 py-2.5">
              Back to cases
            </Link>
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setQIndex(0);
                setSeconds(0);
                setTimerOn(false);
              }}
              className="border border-panel-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted hover:border-turf/50 hover:text-turf"
            >
              Retry case
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-panel-border/60 py-4">
        <HomeLink label="case" back="/projects" backLabel="all projects" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-panel-border bg-panel/60 px-3 py-1.5 font-mono text-[12px] text-ink">
            <span className="tabular-nums">{formatMs(seconds)}</span>
            <button
              type="button"
              aria-label={timerOn ? "Pause timer" : "Start timer"}
              onClick={() => setTimerOn((v) => !v)}
              className="text-ink-muted hover:text-turf"
            >
              {timerOn ? "❚❚" : "▸"}
            </button>
            <button
              type="button"
              aria-label="Reset timer"
              onClick={() => {
                setSeconds(0);
                setTimerOn(false);
              }}
              className="text-ink-muted hover:text-gold"
            >
              ↻
            </button>
          </div>
        </div>
      </header>

      <div className="mt-4 text-center">
        <div className="mx-auto h-24 w-36 overflow-hidden rounded-xl border border-panel-border bg-night/60">
          <ProjectArt id={interviewCase.id} className="h-full w-full" />
        </div>
        <h1 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">
          {interviewCase.title}
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          {interviewCase.org}
          <span className="mx-2 text-panel-border">·</span>
          <span
            className={
              interviewCase.difficulty === "easy"
                ? "text-turf"
                : interviewCase.difficulty === "medium"
                  ? "text-gold"
                  : "text-ice"
            }
          >
            {DIFFICULTY_LABEL[interviewCase.difficulty]}
          </span>
        </p>
        {beats && (
          <button
            type="button"
            onClick={scene.play}
            className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
          >
            ▶ Replay briefing
          </button>
        )}
      </div>

      {beats && (
        <Cutscene
          open={scene.open}
          kicker={`Case file · ${interviewCase.org}`}
          title={interviewCase.title}
          beats={beats}
          objectives={interviewCase.questions.map((q) => q.prompt)}
          objectivesNote="No clock on a case. Hints are there if you want them."
          startLabel="Take the case"
          onStart={scene.close}
        />
      )}

      <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        {/* Left: interviewer */}
        <aside className="flex flex-col rounded-2xl border border-panel-border bg-panel/40 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Coach mood="think" size={64} className="shrink-0" />
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-turf">
                Coach Blitz · interviewer
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {interviewCase.role}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {interviewCase.questions.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i < qIndex
                    ? "bg-turf"
                    : i === qIndex
                      ? "bg-gold"
                      : "bg-panel-border"
                }`}
              />
            ))}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Question {qIndex + 1} of {total}
            </span>
          </div>

          <h2 className="mt-4 font-display text-lg font-bold leading-snug text-ink sm:text-xl">
            {question.prompt}
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setHintShown(true)}
              className="rounded-full border border-ice/40 bg-ice/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ice hover:border-ice"
            >
              Give me a hint
            </button>
            <button
              type="button"
              onClick={() => setRevealShown(true)}
              className="rounded-full border border-panel-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:border-gold/50 hover:text-gold"
            >
              Reveal answer
            </button>
          </div>

          {hintShown && (
            <div className="mt-4 rounded-xl border border-ice/30 bg-ice/5 px-3 py-2.5 text-sm leading-snug text-ink-soft">
              <span className="font-semibold text-ice">Hint · </span>
              {question.hint}
            </div>
          )}

          {revealShown && (
            <div className="mt-4 space-y-2">
              <pre className="overflow-x-auto rounded-xl border border-panel-border bg-night px-3 py-2 font-mono text-[12px] text-turf">
                {question.expected}
              </pre>
              <p className="text-sm leading-relaxed text-ink-soft">
                {question.explain}
              </p>
            </div>
          )}

          {feedback === "correct" && (
            <div className="mt-5 rounded-xl border border-turf/40 bg-turf/10 px-3 py-3">
              <p className="font-display font-bold text-turf">Correct</p>
              <p className="mt-1 text-sm text-ink-soft">{question.explain}</p>
              <button
                type="button"
                onClick={handleNext}
                className="btn-turf mt-3 px-4 py-2"
              >
                {qIndex < total - 1 ? "Next question" : "Finish case"}
              </button>
            </div>
          )}

          {feedback === "wrong" && (
            <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-3">
              <p className="font-display font-bold text-gold">Not quite</p>
              <p className="mt-1 text-sm text-ink-soft">
                Result didn&apos;t match. Tweak the query and submit again — or
                peek at a hint.
              </p>
            </div>
          )}
        </aside>

        {/* Right: terminal */}
        <section className="lesson-terminal-pane flex min-h-[420px] flex-col">
          <div className="lesson-terminal-chrome">
            <div className="flex items-center gap-2">
              <span className="lesson-terminal-dot bg-gold/80" />
              <span className="lesson-terminal-dot bg-turf/80" />
              <span className="lesson-terminal-dot bg-ice/80" />
              <span className="ml-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                SQL terminal · SQLite
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              {engineReady ? "ready" : "loading…"}
            </span>
          </div>

          <div className="border-b border-panel-border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-turf">
                Tables
              </p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {interviewCase.schema.map((t) => (
                <li key={t.table} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-semibold text-gold">
                      {t.table}
                    </p>
                    <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
                      ({t.columns.join(", ")})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExplore(t.table)}
                    className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted underline-offset-2 hover:text-turf hover:underline"
                  >
                    Explore
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <CodeEditor
            value={sql}
            onChange={setSql}
            lang="sql"
            rows={10}
            disabled={!engineReady || feedback === "correct"}
            ariaLabel="Interview SQL editor"
            className="min-h-[180px] flex-1"
          />

          <div className="flex items-center justify-end gap-2 border-t border-panel-border px-3 py-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={!engineReady || feedback === "correct"}
              className="btn-run"
            >
              ▸ Run
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!engineReady || feedback === "correct"}
              className="btn-check px-4 py-2 text-sm"
            >
              Submit
            </button>
          </div>

          {runError && (
            <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">
              ⚠ {runError}
            </p>
          )}

          <div className="border-t border-panel-border bg-night/60 px-3 py-2">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Results
            </p>
            {runResult && runResult.columns.length > 0 ? (
              <ResultTable res={runResult} />
            ) : (
              <p className="font-mono text-[11px] text-ink-muted">
                Run a query to see results
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
