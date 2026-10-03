"use client";

/**
 * The Data Challenge (`/projects/challenge`): a take-home, the round after
 * the screens. Messy data, a business problem, six tasks (two of them
 * graded SQL on the challenge's own seed, the rest written), and a rubric to
 * mark yourself against at the end. The brief, the seed and the keys are in
 * lib/data-challenge.ts; this file is the lobby and the workspace.
 *
 * No clock: a take-home isn't timed. Progress is per browser
 * (`sqlsports.challenge.v1`): drafts, which SQL tasks you've solved, and the
 * rubric ticks. The challenge ships its own tiny database, not the lesson
 * one, so its answer keys stay stable (same as the cases).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import CodeEditor from "@/components/code-editor";
import PassTag from "@/components/pass-tag";
import PassOffer from "@/components/pass-offer";
import PrepArt from "@/components/prep-art";
import { usePass } from "@/lib/use-pass";
import { resultsMatch } from "@/lib/sql-grade";
import { DATA_CHALLENGE, challengeTasks, type ChallengeTask } from "@/lib/data-challenge";

type Saved = {
  v: 1;
  started: boolean;
  /** SQL for sql tasks, prose for write / dq tasks, by task id. */
  drafts: Record<string, string>;
  solved: Record<string, boolean>;
  attempts: Record<string, number>;
  /** Rubric criteria ticked, by rubric id. */
  rubric: Record<string, boolean>;
};

const KEY = "sqlsports.challenge.v1";
const CARD = "surface rounded-2xl border border-panel-border bg-panel";
const EMPTY: Saved = { v: 1, started: false, drafts: {}, solved: {}, attempts: {}, rubric: {} };

const KIND_LABEL: Record<ChallengeTask["kind"], string> = {
  sql: "SQL",
  write: "Write-up",
  dq: "Data quality",
};

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Saved | null;
    return raw && raw.v === 1 ? { ...EMPTY, ...raw } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function useChallengeDb(): Database | null {
  const [db, setDb] = useState<Database | null>(null);
  useEffect(() => {
    let made: Database | null = null;
    let cancelled = false;
    import("sql.js")
      .then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" }))
      .then((SQL) => {
        if (cancelled) return;
        made = new SQL.Database();
        made.run(DATA_CHALLENGE.seedSql);
        setDb(made);
      })
      .catch(() => setDb(null));
    return () => {
      cancelled = true;
      made?.close();
    };
  }, []);
  return db;
}

function taskDone(t: ChallengeTask, s: Saved): boolean {
  return t.kind === "sql" ? Boolean(s.solved[t.id]) : (s.drafts[t.id] ?? "").trim().length > 0;
}

export default function DataChallenge() {
  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(load());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      // Private mode: the challenge still works, it just won't survive a reload.
    }
  }, [saved, ready]);

  if (!ready) return <div className="mx-auto min-h-[60vh] max-w-3xl" aria-busy="true" />;
  if (!saved.started) return <Lobby onStart={() => setSaved((s) => ({ ...s, started: true }))} saved={saved} />;
  return <Workspace saved={saved} setSaved={setSaved} />;
}

// ── Lobby ─────────────────────────────────────────────────────────────
function Lobby({ onStart, saved }: { onStart: () => void; saved: Saved }) {
  const pass = usePass();
  const locked = pass === false;
  const tasks = useMemo(() => challengeTasks(), []);
  const sqlCount = tasks.filter((t) => t.kind === "sql").length;
  const done = tasks.filter((t) => taskDone(t, saved)).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <div className="flex justify-center">
          <PassTag />
        </div>
        <div className="mx-auto mt-4 h-36 w-56 overflow-hidden rounded-xl border border-panel-border bg-night/40">
          <PrepArt id="challenge" className="h-full w-full" />
        </div>
        <p className="label-broadcast mt-4 text-turf">{DATA_CHALLENGE.org} · take-home</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-5xl">{DATA_CHALLENGE.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">{DATA_CHALLENGE.blurb}</p>
      </div>

      <section className={`${CARD} mt-8 p-5`}>
        <p className="label-broadcast">the brief</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{DATA_CHALLENGE.role}</p>
        <ul className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-3">
          <li className="rounded-lg border border-panel-border bg-night/40 p-3">
            <strong className="text-ink">{tasks.length} tasks.</strong> {sqlCount} graded SQL, the rest written.
          </li>
          <li className="rounded-lg border border-panel-border bg-night/40 p-3">
            <strong className="text-ink">No clock.</strong> A take-home is judged on thinking, not speed.
          </li>
          <li className="rounded-lg border border-panel-border bg-night/40 p-3">
            <strong className="text-ink">Its own data.</strong> {DATA_CHALLENGE.schema.length} tables, planted with the
            mess you&apos;d find.
          </li>
        </ul>
      </section>

      <section className={`${CARD} mt-4 p-5`}>
        <p className="label-broadcast">how it&apos;s judged</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Take-homes after a phone screen are read against a rubric, not just checked for a number. This is ours, not
          any company&apos;s. You mark yourself against it at the end.
        </p>
        <ul className="mt-3 space-y-2">
          {DATA_CHALLENGE.rubric.map((r) => (
            <li key={r.id} className="rounded-lg border border-panel-border bg-night/40 p-3">
              <p className="font-display text-base font-bold text-ink">{r.name}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{r.asks}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 text-center">
        {locked ? (
          <PassOffer moment="challenge" />
        ) : (
          <button type="button" onClick={onStart} className="press btn-turf">
            {done > 0 ? "Pick up where you left off →" : "Open the challenge →"}
          </button>
        )}
        <p className="mt-3 text-sm text-ink-soft">
          Before this:{" "}
          <Link href="/questions/screen" className="font-bold text-turf hover:underline">
            Analyst Screen
          </Link>{" "}
          ·{" "}
          <Link href="/questions/mock" className="font-bold text-turf hover:underline">
            Mock SQL screens
          </Link>{" "}
          ·{" "}
          <Link href="/questions/prep" className="font-bold text-turf hover:underline">
            Hiring prep
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── The workspace ─────────────────────────────────────────────────────
function Workspace({ saved, setSaved }: { saved: Saved; setSaved: (fn: (s: Saved) => Saved) => void }) {
  const db = useChallengeDb();
  const tasks = useMemo(() => challengeTasks(), []);
  const [at, setAt] = useState(0);
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<{ grid?: QueryExecResult; error?: string; verdict?: "right" | "wrong" } | null>(null);
  const task = tasks[at];
  const text = saved.drafts[task.id] ?? (task.kind === "sql" ? "SELECT " : "");
  const done = tasks.filter((t) => taskDone(t, saved)).length;

  useEffect(() => {
    setHint(false);
    setRevealed(false);
    setResult(null);
  }, [at]);

  function setText(next: string) {
    setSaved((s) => ({ ...s, drafts: { ...s.drafts, [task.id]: next } }));
  }

  function run(grade: boolean) {
    if (!db || task.kind !== "sql") return;
    let mine: QueryExecResult | undefined;
    try {
      mine = db.exec(text)[0];
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : String(e) });
      return;
    }
    if (!grade) {
      setResult({ grid: mine });
      return;
    }
    let key: QueryExecResult | undefined;
    try {
      key = db.exec(task.expected ?? "")[0];
    } catch {
      setResult({ error: "The answer key failed to run. Please report this task." });
      return;
    }
    const ok = resultsMatch(mine, key, task.orderMatters ?? false);
    setResult({ grid: mine, verdict: ok ? "right" : "wrong" });
    setSaved((s) => ({
      ...s,
      attempts: { ...s.attempts, [task.id]: (s.attempts[task.id] ?? 0) + 1 },
      solved: ok ? { ...s.solved, [task.id]: true } : s.solved,
    }));
  }

  function explore(table: string) {
    setText(`SELECT * FROM ${table} LIMIT 5;`);
    if (!db) return;
    try {
      setResult({ grid: db.exec(`SELECT * FROM ${table} LIMIT 5`)[0] });
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : String(e) });
    }
  }

  function reset() {
    if (!window.confirm("Clear your answers and start the challenge over?")) return;
    setSaved(() => ({ ...EMPTY }));
  }

  const attempts = saved.attempts[task.id] ?? 0;
  const ticks = DATA_CHALLENGE.rubric.filter((r) => saved.rubric[r.id]).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4`}>
        <div>
          <p className="label-broadcast text-turf">{DATA_CHALLENGE.org} · take-home</p>
          <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">{DATA_CHALLENGE.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            {done} of {tasks.length} tasks
          </span>
          <button
            type="button"
            onClick={reset}
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-gold"
          >
            Start over
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* The brief: role, assumptions, what they asked, schema. */}
        <aside className="space-y-4 lg:col-span-4">
          <section className={`${CARD} p-5`}>
            <p className="label-broadcast">the brief</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{DATA_CHALLENGE.role}</p>
          </section>

          <section className={`${CARD} p-5`}>
            <p className="label-broadcast">assumptions</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-ink-soft">
              {DATA_CHALLENGE.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section className={`${CARD} p-5`}>
            <p className="label-broadcast">what they asked for</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-ink-soft">
              {DATA_CHALLENGE.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>

          <section className={`${CARD} p-5`}>
            <p className="label-broadcast">tables</p>
            <ul className="mt-2 space-y-2">
              {DATA_CHALLENGE.schema.map((t) => (
                <li key={t.table} className="rounded-lg border border-panel-border bg-night/40 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-[11px] font-bold text-ink">{t.table}</p>
                    <button
                      type="button"
                      disabled={!db}
                      onClick={() => explore(t.table)}
                      className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted underline-offset-2 hover:text-turf hover:underline disabled:opacity-40"
                    >
                      Explore
                    </button>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-ink-muted">{t.columns.join(", ")}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* The task. */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap gap-1.5">
            {tasks.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAt(i)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-bold ${
                  i === at
                    ? "border-ice bg-ice/15 text-ice"
                    : taskDone(t, saved)
                      ? "border-turf/60 text-turf"
                      : "border-panel-border text-ink-soft hover:text-ink"
                }`}
              >
                {i + 1}. {t.title} {taskDone(t, saved) ? "✓" : ""}
              </button>
            ))}
          </div>

          <section className={`${CARD} p-5`}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-ink-muted">Task {at + 1}</span>
              <span className="rounded-full border border-ice/40 bg-ice/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ice">
                {KIND_LABEL[task.kind]}
              </span>
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-ink">{task.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{task.prompt}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setHint(!hint)}
                className="font-mono text-[11px] font-bold uppercase tracking-wider text-ice hover:underline"
              >
                {hint ? "Hide the hint" : "Need a hint?"}
              </button>
            </div>
            {hint && (
              <p className="mt-2 rounded-xl border border-ice/30 bg-ice/5 px-3 py-2.5 text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-ice">Hint · </span>
                {task.hint}
              </p>
            )}
          </section>

          {task.kind === "sql" ? (
            <section className={`${CARD} p-4 sm:p-5`}>
              <div
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    run(true);
                  }
                }}
              >
                <CodeEditor value={text} onChange={setText} lang="sql" rows={14} ariaLabel={`SQL for task ${at + 1}`} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!db}
                  onClick={() => run(false)}
                  className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-ice/50 hover:text-ice disabled:opacity-40"
                >
                  Run
                </button>
                <button type="button" disabled={!db} onClick={() => run(true)} className="press btn-turf disabled:opacity-40">
                  Submit
                </button>
                <span className="font-mono text-[10px] text-ink-muted">
                  {attempts} submission{attempts === 1 ? "" : "s"}
                </span>
              </div>

              {result?.error && (
                <p role="alert" className="mt-3 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 font-mono text-[12px] text-gold">
                  {result.error}
                </p>
              )}
              {result?.verdict === "right" && (
                <div className="mt-3 rounded-xl border border-turf/50 bg-turf/10 p-3">
                  <p className="font-display text-base font-bold text-turf">Matches the key.</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{task.explain}</p>
                  {at < tasks.length - 1 && (
                    <button type="button" onClick={() => setAt(at + 1)} className="mt-2 press btn-turf">
                      Next task →
                    </button>
                  )}
                </div>
              )}
              {result?.verdict === "wrong" && (
                <p className="mt-3 rounded-xl border border-ice/40 bg-ice/5 px-4 py-3 text-sm text-ink-soft">
                  <strong className="text-ice">Doesn&apos;t match yet.</strong> Check the cleaning rules in the
                  assumptions and the column order in the prompt, then try again.
                </p>
              )}
              {result?.grid && <Grid res={result.grid} />}
              {result && !result.error && !result.grid && <p className="mt-3 font-mono text-[12px] text-ink-muted">No rows.</p>}

              {attempts > 0 && (
                <div className="mt-4 border-t border-panel-border pt-3">
                  <button
                    type="button"
                    onClick={() => setRevealed(!revealed)}
                    className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
                  >
                    {revealed ? "Hide the answer" : "Show the answer"}
                  </button>
                  {revealed && (
                    <div className="mt-2">
                      <pre className="overflow-x-auto rounded-lg border border-turf/40 bg-night/60 p-3 font-mono text-[12px] leading-relaxed text-ink">
                        {task.expected?.trim()}
                      </pre>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{task.explain}</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : (
            <section className={`${CARD} p-4 sm:p-5`}>
              <label htmlFor={`task-${task.id}`} className="label-broadcast">
                {task.kind === "dq" ? "your findings" : "your write-up"}
              </label>
              <textarea
                id={`task-${task.id}`}
                value={saved.drafts[task.id] ?? ""}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={
                  task.kind === "dq"
                    ? "1. What you found, how many rows it touches, and what you did about it…"
                    : "Write it like you're handing it to the product lead…"
                }
                className="mt-2 w-full resize-y rounded-xl border border-panel-border bg-night/60 p-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-ice/60"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Saved in this browser · {(saved.drafts[task.id] ?? "").trim().length} characters
                </span>
                {at < tasks.length - 1 && (
                  <button type="button" onClick={() => setAt(at + 1)} className="press btn-turf">
                    Next task →
                  </button>
                )}
              </div>
              <div className="mt-3 border-t border-panel-border pt-3">
                <button
                  type="button"
                  onClick={() => setRevealed(!revealed)}
                  className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
                >
                  {revealed ? "Hide what a strong answer covers" : "What a strong answer covers"}
                </button>
                {revealed && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{task.explain}</p>}
              </div>
            </section>
          )}

          {/* The rubric, to mark yourself against. */}
          <section className={`${CARD} p-5`}>
            <p className="label-broadcast">mark yourself</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              When you&apos;ve worked through the tasks, tick what you&apos;d honestly say a reviewer would find.
            </p>
            <ul className="mt-3 space-y-2">
              {DATA_CHALLENGE.rubric.map((r) => {
                const on = Boolean(saved.rubric[r.id]);
                return (
                  <li key={r.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                        on ? "border-turf/50 bg-turf/10" : "border-panel-border hover:border-ice/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => setSaved((s) => ({ ...s, rubric: { ...s.rubric, [r.id]: e.target.checked } }))}
                        className="mt-1 h-4 w-4 shrink-0 accent-turf"
                      />
                      <span>
                        <span className="block font-display text-base font-bold text-ink">{r.name}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">{r.asks}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              {ticks} of {DATA_CHALLENGE.rubric.length} covered
              {done === tasks.length && ticks === DATA_CHALLENGE.rubric.length ? " · that's a submission you could send" : ""}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Grid({ res }: { res: QueryExecResult }) {
  return (
    <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-panel-border">
      <table className="w-full text-left font-mono text-[11.5px]">
        <thead className="sticky top-0 bg-panel">
          <tr className="text-ink-muted">
            {res.columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-1.5 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {res.values.map((row, i) => (
            <tr key={i} className="border-t border-panel-border/50 text-ink-soft">
              {row.map((v, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-1">
                  {v === null ? "NULL" : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
