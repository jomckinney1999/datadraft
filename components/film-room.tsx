"use client";

/**
 * Film Room: watch a query run, clause by clause, in the order the database
 * runs it (decided 2026-10-03, a Season Pass feature). The plan is
 * lib/sql-steps.ts; this is the button and the replay.
 *
 * Each step shows the clause lit up in the query, Coach saying what it did
 * ("WHERE checks every row and keeps 96 of 4,212"), and the first rows as
 * they stand after it. The step rail across the top doubles as a drive
 * chart: a bar per step, sized by how many rows were left.
 *
 * It replays the answer once you can see the answer (after a solve, or with
 * the solution open) and your own query any time it ran. A step that won't
 * run on its own (a WHERE that names a SELECT alias, say) is left out rather
 * than shown broken; the last step is always the whole statement.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Database, SqlValue } from "sql.js";
import { narrateStep, planSteps, stepCountSql, stepSql, type SqlStep } from "@/lib/sql-steps";
import { SceneLine } from "@/components/scene-line";
import PassTag from "@/components/pass-tag";
import type { CoachMood } from "@/components/coach";

const PREVIEW_ROWS = 8;
const PLAY_MS = 2600;

type Ran = { step: SqlStep; count: number; columns: string[]; rows: SqlValue[][] };

/** Whether a query has more than one step worth replaying. */
export function canReplay(sql: string): boolean {
  const plan = planSteps(sql);
  return Boolean(plan && plan.steps.length >= 2);
}

function runPlan(db: Database, sql: string): { source: string; ran: Ran[] } | null {
  const plan = planSteps(sql);
  if (!plan) return null;
  const ran: Ran[] = [];
  plan.steps.forEach((step, i) => {
    const last = i === plan.steps.length - 1;
    try {
      const count = Number(db.exec(stepCountSql(step))[0]?.values[0]?.[0] ?? 0);
      const stmt = db.prepare(stepSql(step));
      try {
        const columns = stmt.getColumnNames();
        const rows: SqlValue[][] = [];
        while (rows.length < PREVIEW_ROWS && stmt.step()) rows.push(stmt.get());
        ran.push({ step, count, columns, rows });
      } finally {
        stmt.free();
      }
    } catch {
      // A step that can't stand alone is skipped; the last one never is.
      if (last) ran.length = 0;
    }
  });
  return ran.length >= 2 ? { source: plan.source, ran } : null;
}

/** The step's sentence, with the rows before it. */
function narrate(ran: Ran[], at: number): string {
  const cur = ran[at];
  let before: number | null = null;
  for (let i = at - 1; i >= 0; i--) {
    if (ran[i].step.kind !== "cte" && ran[i].step.kind !== "part") {
      before = ran[i].count;
      break;
    }
  }
  return narrateStep(cur.step, cur.count, before, at === ran.length - 1);
}

function moodFor(step: SqlStep, last: boolean): CoachMood {
  if (last) return "dance";
  if (step.kind === "where" || step.kind === "having" || step.kind === "limit") return "point";
  if (step.kind === "group" || step.kind === "combine" || step.kind === "order") return "clipboard";
  return "think";
}

function cell(v: SqlValue): string {
  if (v === null) return "NULL";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  if (v instanceof Uint8Array) return "(blob)";
  return String(v);
}

/** The source split into runs, each tagged with the step that owns it. */
function segments(source: string, ran: Ran[]): { text: string; owner: number }[] {
  const cuts = new Set<number>([0, source.length]);
  ran.forEach((r) => r.step.ranges.forEach(([a, b]) => (cuts.add(a), cuts.add(b))));
  const points = Array.from(cuts).sort((a, b) => a - b);
  const out: { text: string; owner: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    const owner = ran.findIndex((r) => r.step.ranges.some(([s, e]) => a >= s && b <= e));
    out.push({ text: source.slice(a, b), owner });
  }
  return out;
}

export default function FilmRoom({
  sql,
  getDb,
  subject,
  locked = false,
  onLocked,
  variant = "chip",
  className = "",
}: {
  sql: string;
  /** The database the query ran on, read when the replay opens. */
  getDb: () => Database | null;
  subject: "answer" | "yours";
  /** The Season Pass gate (a no-op until the paywall is on). */
  locked?: boolean;
  onLocked?: () => void;
  variant?: "chip" | "cta";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const currentRef = useRef<HTMLSpanElement | null>(null);
  const chipRef = useRef<HTMLButtonElement | null>(null);

  const replayable = useMemo(() => canReplay(sql), [sql]);
  // Run once, when it opens: every step is a query, so not on every render.
  const [film, setFilm] = useState<ReturnType<typeof runPlan>>(null);

  const steps = film?.ran.length ?? 0;
  const next = useCallback(() => setAt((a) => Math.min(steps - 1, a + 1)), [steps]);
  const back = useCallback(() => setAt((a) => Math.max(0, a - 1)), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const opener = openerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open, next, back]);

  // Play walks the steps on a timer and stops at the result.
  useEffect(() => {
    if (!playing) return;
    if (at >= steps - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(next, PLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, at, steps, next]);

  useEffect(() => {
    // Keep the lit clause and the current stop in view (the rail scrolls on a phone).
    chipRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    currentRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [at, open]);

  if (!replayable) return null;

  const start = () => {
    if (locked) {
      onLocked?.();
      return;
    }
    const db = getDb();
    setFilm(db ? runPlan(db, sql) : null);
    setAt(0);
    setPlaying(false);
    setOpen(true);
  };

  const icon = (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5">
      <path d="M2 6.5 H14 V14 H2 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M2 6.5 L3 2.5 L14 2.5 L13 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5.5 2.7 L4.5 6.3 M9 2.7 L8 6.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );

  const cur = film?.ran[at];
  const max = film ? Math.max(1, ...film.ran.map((r) => r.count)) : 1;

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={start}
        className={
          variant === "cta"
            ? `press inline-flex items-center gap-2 rounded-xl border border-ice/60 bg-ice/10 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ice transition-colors hover:bg-ice/20 ${className}`
            : `press inline-flex items-center gap-1.5 rounded-lg border border-ice/50 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ice transition-colors hover:bg-ice/10 ${className}`
        }
        title="Replay the query clause by clause, in the order the database runs it"
      >
        {icon}
        {variant === "cta"
          ? subject === "answer"
            ? "Watch the answer run"
            : "Replay your query"
          : "Film room"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-night/85 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Film room: ${subject === "answer" ? "the answer" : "your query"}, step by step`}
            className="surface w-full max-w-5xl rounded-2xl border border-panel-border bg-panel p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="label-broadcast text-ice">
                  film room · {subject === "answer" ? "the answer" : "your query"}
                </p>
                <PassTag />
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg border border-panel-border px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">
              You write SQL SELECT-first. The database runs it FROM-first. This is the order it really works in.
            </p>

            {!film || !cur ? (
              <p className="mt-4 rounded-xl border border-panel-border bg-night/40 px-4 py-3 text-sm text-ink-soft">
                This one won&apos;t replay step by step. Run it again and try once more.
              </p>
            ) : (
              <>
                {/* The drive chart: one stop per step, its bar the rows left. */}
                <ol className="mt-4 flex gap-1.5 overflow-x-auto pb-1" aria-label="Steps">
                  {film.ran.map((r, i) => (
                    <li key={i} className="shrink-0">
                      <button
                        ref={i === at ? chipRef : undefined}
                        type="button"
                        onClick={() => {
                          setPlaying(false);
                          setAt(i);
                        }}
                        aria-current={i === at ? "step" : undefined}
                        aria-label={`Step ${i + 1}: ${r.step.label}, ${r.count.toLocaleString("en-US")} rows`}
                        className={`flex w-32 flex-col gap-1 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                          i === at
                            ? "border-gold bg-gold/10 shadow-scoreboard-gold"
                            : i < at
                              ? "border-turf/40 bg-turf/5 hover:border-turf/70"
                              : "border-panel-border hover:border-ice/50"
                        }`}
                      >
                        <span className="flex items-baseline justify-between gap-1">
                          <span className={`font-mono text-[10px] font-bold ${i === at ? "text-gold" : "text-ink-muted"}`}>{i + 1}</span>
                          <span className="font-mono text-[10px] text-ink-muted">{r.count.toLocaleString("en-US")}</span>
                        </span>
                        <span className={`truncate font-mono text-[11px] font-bold ${i === at ? "text-ink" : "text-ink-soft"}`}>
                          {r.step.label}
                        </span>
                        <span className="h-1 w-full overflow-hidden rounded-full bg-night/60">
                          <span
                            className={`block h-full rounded-full ${i === at ? "bg-gold" : i < at ? "bg-turf" : "bg-panel-border"}`}
                            style={{ width: `${Math.max(4, (Math.log10(r.count + 1) / Math.log10(max + 1)) * 100)}%` }}
                          />
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.15fr]">
                  {/* The query, with this step's clause lit and the ones still to run dimmed. */}
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-panel-border bg-night/60 px-3.5 py-3 font-mono text-[12px] leading-relaxed">
                    {segments(film.source, film.ran).map((s, i) => (
                      <span
                        key={i}
                        ref={s.owner === at ? currentRef : undefined}
                        className={
                          s.owner === at
                            ? "rounded-sm bg-gold/20 text-ink ring-1 ring-gold/50"
                            : s.owner === -1
                              ? "text-ink-muted"
                              : s.owner < at
                                ? "text-ink-soft"
                                : "text-ink-muted/45"
                        }
                      >
                        {s.text}
                      </span>
                    ))}
                  </pre>

                  <div className="min-w-0">
                    <SceneLine mood={moodFor(cur.step, at === steps - 1)}>
                      <span aria-live="polite">{narrate(film.ran, at)}</span>
                    </SceneLine>

                    <div className="mt-3">
                      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                        after step {at + 1} ·{" "}
                        {cur.count > cur.rows.length
                          ? `first ${cur.rows.length} of ${cur.count.toLocaleString("en-US")} rows`
                          : `${cur.count.toLocaleString("en-US")} ${cur.count === 1 ? "row" : "rows"}`}
                      </p>
                      {cur.rows.length ? (
                        <div className="max-h-64 overflow-auto rounded-lg border border-panel-border">
                          <table className="w-full border-collapse font-mono text-[11px]">
                            <thead className="sticky top-0 bg-panel">
                              <tr>
                                {cur.columns.map((c, i) => (
                                  <th
                                    key={i}
                                    className="whitespace-nowrap border-b border-panel-border px-2.5 py-1.5 text-left font-bold uppercase tracking-wider text-ink-muted"
                                  >
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {cur.rows.map((row, ri) => (
                                <tr key={ri} className="odd:bg-night/30">
                                  {row.map((v, ci) => (
                                    <td key={ci} className="whitespace-nowrap px-2.5 py-1 text-ink-soft">
                                      {cell(v)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="rounded-lg border border-panel-border bg-night/40 px-3 py-2 text-sm text-ink-soft">
                          No rows left after this step.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      back();
                    }}
                    disabled={at === 0}
                    className="rounded-xl border border-panel-border px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:text-ink disabled:opacity-35"
                    aria-keyshortcuts="ArrowLeft"
                  >
                    ◀ Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      next();
                    }}
                    disabled={at >= steps - 1}
                    className="press btn-turf !px-4 !py-2 text-sm disabled:opacity-40"
                    aria-keyshortcuts="ArrowRight"
                  >
                    Next step ▶
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (at >= steps - 1) setAt(0);
                      setPlaying((p) => !p);
                    }}
                    className="rounded-xl border border-gold/50 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10"
                  >
                    {playing ? "❚❚ Pause" : at >= steps - 1 ? "↺ Replay" : "▶ Play it"}
                  </button>
                  <span className="ml-auto hidden font-mono text-[10px] text-ink-muted sm:inline">← → to step · Esc to close</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
