"use client";

/**
 * The Question of the Day, playable on the landing page.
 *
 * This replaced a free-form SQL sandbox. The sandbox demonstrated that the
 * engine was real, which is a thing a visitor has no reason to care about —
 * it handed them a blinking cursor and an empty database and asked them to
 * think of something to ask it. Most people typed nothing.
 *
 * A question does the same job and answers "what is this site" at the same
 * time: here is a real problem, here is the real data, you can solve it right
 * now without an account. Getting it right is the pitch.
 *
 * Deliberately lighter than /questions/[id]: no XP, no streak, no progress
 * write. Signing in is not the price of trying it, and the CTA after a
 * correct answer is the only thing asking for anything.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import type { Question } from "@/lib/questions";
import { schemaFor } from "@/lib/questions";
import { resultsMatch } from "@/lib/sql-grade";
import CodeEditor from "@/components/code-editor";
import QuestionArt from "@/components/question-art";
import DifficultyChip from "@/components/difficulty-chip";
import { FaceCluster } from "@/components/qotd-card";
import { featuredPlayers } from "@/lib/question-players";

export default function QotdPanel({ question }: { question: Question }) {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [sql, setSql] = useState(question.starter ?? "SELECT ");
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let db: Database | null = null;
    Promise.all([
      import("sql.js").then((m) =>
        m.default({ locateFile: () => "/sql-wasm.wasm" }),
      ),
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

  function attempt(grade: boolean) {
    const db = dbRef.current;
    if (!db) return;
    let mine: QueryExecResult | undefined;
    try {
      mine = db.exec(sql)[0];
    } catch (e) {
      setResult(null);
      setVerdict(null);
      setError(e instanceof Error ? e.message : String(e));
      return;
    }
    setError(null);
    setResult(mine ?? null);
    if (!grade) {
      setVerdict(null);
      return;
    }
    const key = db.exec(question.expected)[0];
    setVerdict(
      resultsMatch(mine, key, question.orderMatters ?? false) ? "right" : "wrong",
    );
  }

  const tables = schemaFor(question);
  const players = featuredPlayers(question, 3);

  return (
    <div className="qotd-hero overflow-hidden rounded-2xl">
      <QuestionArt art={question.art} className="qotd-hero-art" />
      <div className="qotd-sheen" aria-hidden />
      <div className="relative flex flex-wrap items-center gap-5 border-b border-gold/20 px-5 py-5">
        <FaceCluster players={players} size={64} names={false} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              Question of the day
            </span>
            <DifficultyChip difficulty={question.difficulty} />
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-pop sm:text-3xl">
            {question.title}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {players.map((p) => p.name).join(" · ")}
          </p>
        </div>
      </div>

      <div className="relative px-5 py-4">
        <p className="text-[15px] leading-relaxed text-ink-soft">
          {question.prompt}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ice">
            Return
          </span>{" "}
          {question.returns}
        </p>

        <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-muted">
          {tables.map((t) => (
            <span key={t.table} className="mr-3 inline-block">
              <span className="text-ink">{t.table}</span>({t.columns.join(", ")})
            </span>
          ))}
        </p>

        <div className="mt-3">
          <CodeEditor
            value={sql}
            onChange={setSql}
            lang="sql"
            rows={6}
            ariaLabel="Question of the day SQL"
            disabled={!ready}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => attempt(false)}
            disabled={!ready}
            className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/50 hover:text-ice disabled:opacity-40"
          >
            Run
          </button>
          <button
            type="button"
            onClick={() => attempt(true)}
            disabled={!ready}
            className="press btn-gold disabled:opacity-40"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setHintOpen((v) => !v)}
            className="ml-auto font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
          >
            {hintOpen ? "Hide hint" : "Hint"}
          </button>
        </div>

        {hintOpen && (
          <p className="mt-3 rounded-xl border border-ice/30 bg-ice/5 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            {question.hint}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 font-mono text-[12px] leading-relaxed text-gold"
          >
            {error}
          </p>
        )}

        {verdict === "wrong" && (
          <p className="mt-3 rounded-xl border border-ice/40 bg-ice/5 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            Ran fine, different answer. Check it against what the question asks
            for — <span className="text-ink">{question.returns}</span>
          </p>
        )}

        {verdict === "right" && (
          <div className="mt-3 rounded-xl border border-turf/50 bg-turf/10 px-4 py-3">
            <p className="font-display text-base font-bold text-turf">
              That&apos;s it — and you did it without an account.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {question.explain}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/questions" className="press btn-turf">
                Next question
              </Link>
              <Link
                href="/learn"
                className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/40"
              >
                Start from the beginning
              </Link>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-3">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {result.values.length} row
              {result.values.length === 1 ? "" : "s"}
            </p>
            <div className="max-h-44 overflow-auto rounded-lg border border-panel-border">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="sticky top-0 bg-panel">
                  <tr className="border-b border-panel-border text-ink-muted">
                    {result.columns.map((c) => (
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
                  {result.values.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-panel-border/50 text-ink"
                    >
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-nowrap px-3 py-1.5">
                          {cell === null ? "NULL" : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
