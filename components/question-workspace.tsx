"use client";

/**
 * Solving one question.
 *
 * Deliberately not the lesson player. There is no drive, no down, no timeout
 * and nothing to lose — a wrong answer here costs you the twenty seconds you
 * spent on it. That is the whole point of the question bank: it has to be
 * cheap enough to open on a phone in a queue.
 *
 * The three affordances are ordered by how much they give away, and each one
 * is a deliberate click: Run (see your own output), Hint (a nudge), Solution
 * (the key). Run is free and unlimited because looking at what your query
 * actually returned is how people debug SQL, and hiding it behind a grade
 * would just teach them to guess.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import type { Question } from "@/lib/questions";
import { DIFFICULTY_LABEL, DIFFICULTY_XP, schemaFor } from "@/lib/questions";
import { resultsMatch } from "@/lib/sql-grade";
import { solveQuestion, loadProgress } from "@/lib/progress";
import { SHORT_CREDIT } from "@/lib/data-source";
import { playSfx } from "@/lib/sfx";
import CodeEditor from "@/components/code-editor";
import QuestionArt from "@/components/question-art";
import AppNav from "@/components/app-nav";
import Coach from "@/components/coach";
import DifficultyChip from "@/components/difficulty-chip";

function ResultGrid({ res, label }: { res: QueryExecResult; label: string }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        {label} · {res.values.length} row{res.values.length === 1 ? "" : "s"}
      </p>
      <div className="max-h-56 overflow-auto rounded-lg border border-panel-border">
        <table className="w-full text-left font-mono text-[11px]">
          <thead className="sticky top-0 bg-panel">
            <tr className="border-b border-panel-border text-ink-muted">
              {res.columns.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap px-3 py-1.5 font-semibold uppercase tracking-wider"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {res.values.map((row, i) => (
              <tr key={i} className="border-b border-panel-border/50 text-ink">
                {row.map((cell, j) => (
                  <td key={j} className="whitespace-nowrap px-3 py-1.5">
                    {cell === null ? (
                      <span className="text-ink-muted">NULL</span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function QuestionWorkspace({
  question,
  isQotd,
  day,
  prevDay,
  nextId,
}: {
  question: Question;
  isQotd: boolean;
  /** League-timezone day, resolved on the server so it can't drift. */
  day: string;
  prevDay: string;
  nextId: string | null;
}) {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [sql, setSql] = useState(question.starter ?? "SELECT ");
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [alreadySolved, setAlreadySolved] = useState(false);
  const [reward, setReward] = useState<{ xp: number; tickets: number } | null>(
    null,
  );

  useEffect(() => {
    setAlreadySolved(loadProgress().solvedQuestions.includes(question.id));
  }, [question.id]);

  useEffect(() => {
    let cancelled = false;
    let db: Database | null = null;
    Promise.all([
      import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" })),
      import("@/lib/fantasy-data"),
    ])
      .then(([SQL, data]) => {
        if (cancelled) return;
        db = new SQL.Database();
        db.run(data.buildSeedSql());
        dbRef.current = db;
        setReady(true);
      })
      .catch(() => setError("The SQL engine didn't load. Try a refresh."));
    return () => {
      cancelled = true;
      db?.close();
      dbRef.current = null;
    };
  }, []);

  function exec(text: string): QueryExecResult | undefined {
    const db = dbRef.current;
    if (!db) throw new Error("The SQL engine is still warming up.");
    return db.exec(text)[0];
  }

  function onRun() {
    setVerdict(null);
    try {
      const res = exec(sql);
      setError(null);
      setResult(res ?? null);
      if (!res) setError("That ran, but returned no rows.");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function onSubmit() {
    let mine: QueryExecResult | undefined;
    try {
      mine = exec(sql);
    } catch (e) {
      setResult(null);
      setVerdict(null);
      setError(e instanceof Error ? e.message : String(e));
      return;
    }
    setError(null);
    setResult(mine ?? null);

    const key = exec(question.expected);
    const ok = resultsMatch(mine, key, question.orderMatters ?? false);
    setVerdict(ok ? "right" : "wrong");
    playSfx(ok ? "touchdown" : "miss");
    if (!ok) return;

    const firstSolve = !alreadySolved;
    solveQuestion(
      question.id,
      DIFFICULTY_XP[question.difficulty],
      isQotd,
      day,
      prevDay,
    );
    setReward({
      xp: firstSolve ? DIFFICULTY_XP[question.difficulty] : 0,
      tickets: (firstSolve ? 5 : 1) + (isQotd ? 10 : 0),
    });
    setAlreadySolved(true);
  }

  const tables = schemaFor(question);

  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* ── The problem ───────────────────────────────── */}
          <section className="lg:col-span-5">
            <div className="surface overflow-hidden rounded-2xl border border-panel-border bg-panel">
              <div className="relative h-28 overflow-hidden border-b border-panel-border">
                <QuestionArt
                  art={question.art}
                  className="absolute inset-0 h-full w-full"
                />
                {isQotd && (
                  <span className="absolute left-4 top-4 rounded-full border border-gold/50 bg-night/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                    Question of the day
                  </span>
                )}
                {alreadySolved && (
                  <span className="absolute right-4 top-4 rounded-full border border-turf/50 bg-night/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-turf">
                    ✓ Solved
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyChip difficulty={question.difficulty} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    +{DIFFICULTY_XP[question.difficulty]} XP
                  </span>
                </div>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                  {question.title}
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                  {question.prompt}
                </p>

                <div className="mt-4 rounded-xl border border-ice/30 bg-ice/5 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ice">
                    Return
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {question.returns}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {question.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Schema — only the tables this question touches. A learner who
                has to scroll past three irrelevant tables to find a column
                name stops looking and guesses. */}
            <div className="surface mt-3 rounded-2xl border border-panel-border bg-panel p-5">
              <p className="label-broadcast text-turf">the tables</p>
              <div className="mt-3 space-y-3">
                {tables.map((t) => (
                  <div key={t.table}>
                    <p className="font-mono text-[12px] font-bold text-ink">
                      {t.table}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-ink-muted">
                      {t.columns.join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border-t border-panel-border pt-2 font-mono text-[10px] text-ink-muted">
                {SHORT_CREDIT} ·{" "}
                <Link href="/data" className="text-turf hover:underline">
                  where this comes from
                </Link>
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setHintOpen((v) => !v)}
                className="w-full rounded-xl border border-panel-border px-4 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/40 hover:text-ice"
              >
                {hintOpen ? "Hide hint" : "Need a hint?"}
              </button>
              {hintOpen && (
                <p className="rounded-xl border border-ice/30 bg-ice/5 px-4 py-3 text-sm leading-relaxed text-ink-soft">
                  {question.hint}
                </p>
              )}
              <button
                type="button"
                onClick={() => setSolutionOpen((v) => !v)}
                className="w-full rounded-xl border border-panel-border px-4 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
              >
                {solutionOpen ? "Hide solution" : "Show solution"}
              </button>
              {solutionOpen && (
                <pre className="overflow-x-auto rounded-xl border border-gold/30 bg-night/60 px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                  {question.expected}
                </pre>
              )}
            </div>
          </section>

          {/* ── The workspace ─────────────────────────────── */}
          <section className="lg:col-span-7">
            <div className="surface rounded-2xl border border-panel-border bg-panel p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="label-broadcast text-ice">your query</p>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {ready ? "SQLite · in your browser" : "warming up…"}
                </span>
              </div>

              <CodeEditor
                value={sql}
                onChange={setSql}
                lang="sql"
                rows={12}
                ariaLabel={`SQL for ${question.title}`}
                disabled={!ready}
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onRun}
                  disabled={!ready}
                  className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/50 hover:text-ice disabled:opacity-40"
                >
                  Run
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!ready}
                  className="press btn-turf disabled:opacity-40"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSql(question.starter ?? "SELECT ");
                    setResult(null);
                    setError(null);
                    setVerdict(null);
                  }}
                  className="ml-auto font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
                >
                  Reset
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 font-mono text-[12px] leading-relaxed text-gold"
                >
                  {error}
                </p>
              )}

              {verdict === "wrong" && (
                <div className="mt-3 rounded-xl border border-ice/40 bg-ice/5 p-4">
                  <p className="font-display text-base font-bold text-ice">
                    Not the grid we&apos;re after.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Your query ran fine — it just returned something different.
                    Compare your output against what the question asks for:{" "}
                    <span className="text-ink">{question.returns}</span>
                  </p>
                </div>
              )}

              {verdict === "right" && (
                <div className="mt-3 rounded-xl border border-turf/50 bg-turf/10 p-4">
                  <div className="flex items-start gap-3">
                    <Coach mood="cheer" size={54} className="hidden shrink-0 sm:block" />
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold text-turf">
                        Correct.
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {question.explain}
                      </p>
                      {reward && (
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-gold">
                          {reward.xp > 0
                            ? `+${reward.xp} XP · +${reward.tickets} tickets`
                            : `+${reward.tickets} ticket${reward.tickets === 1 ? "" : "s"} · already banked the XP for this one`}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {nextId && (
                          <Link
                            href={`/questions/${nextId}`}
                            className="press btn-turf"
                          >
                            Next question
                          </Link>
                        )}
                        <Link
                          href="/questions"
                          className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/40"
                        >
                          Back to the bank
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="mt-4">
                  <ResultGrid res={result} label="your result" />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
