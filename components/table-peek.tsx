"use client";

/**
 * "Show me the table" — on any question that names one.
 *
 * A prompt like "One row in week_results represents…" asks the learner to hold
 * a picture in their head of something they may never have seen. The brief can
 * show a table (`previewSql`), but drills couldn't, and the schema panel under
 * the SQL editor lists column names without a single row of data.
 *
 * This takes the tables found in the prompt and offers each as a toggle that
 * runs `SELECT * FROM <table> LIMIT n` against the same database the drill is
 * graded on — so what the learner peeks at is exactly what their query will
 * hit, not a screenshot that can drift.
 *
 * The runner is injected rather than opened here: the lesson player already
 * holds a seeded sql.js connection, and a second one would double the memory
 * and could disagree with it.
 */

import { useState } from "react";
import type { QueryExecResult } from "sql.js";
import { PROVENANCE } from "@/lib/data-source";

const KIND = new Map(PROVENANCE.map((p) => [p.table, p.kind]));
const NOTE = new Map(PROVENANCE.map((p) => [p.table, p.note]));

export default function TablePeek({
  tables,
  ready,
  run,
  limit = 5,
}: {
  tables: string[];
  /** False while the engine is still loading; buttons stay disabled. */
  ready: boolean;
  run: (sql: string) => QueryExecResult | undefined;
  limit?: number;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [rows, setRows] = useState<QueryExecResult | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  if (tables.length === 0) return null;

  function show(table: string) {
    if (open === table) {
      setOpen(null);
      return;
    }
    setOpen(table);
    setFailed(false);
    try {
      setRows(run(`SELECT * FROM ${table} LIMIT ${limit};`) ?? null);
      const count = run(`SELECT COUNT(*) FROM ${table};`);
      setTotal(count ? Number(count.values[0][0]) : null);
    } catch {
      // Peeking is a convenience; it must never take the drill down with it.
      setRows(null);
      setTotal(null);
      setFailed(true);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          Show me
        </span>
        {tables.map((t) => {
          const kind = KIND.get(t);
          return (
            <button
              key={t}
              type="button"
              disabled={!ready}
              onClick={() => show(t)}
              aria-expanded={open === t}
              className={`press inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors disabled:opacity-50 ${
                open === t
                  ? "border-ice bg-ice/15 text-ice"
                  : "border-panel-border text-ink-muted hover:border-ice/50 hover:text-ink"
              }`}
            >
              {t}
              {kind && (
                <span
                  className={`rounded-sm px-1 text-[8px] uppercase tracking-widest ${
                    kind === "real" ? "text-turf" : "text-gold"
                  }`}
                >
                  {kind === "real" ? "real" : "example"}
                </span>
              )}
              <span aria-hidden>{open === t ? "▴" : "▾"}</span>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="surface mt-2 overflow-hidden rounded-xl border border-panel-border bg-panel">
          <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ice">
              {open}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {failed
                ? "unavailable"
                : total !== null
                  ? `first ${rows?.values.length ?? 0} of ${total} rows`
                  : "loading…"}
            </span>
          </div>
          <p className="border-b border-panel-border px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
            {NOTE.get(open)}
          </p>
          {rows && rows.columns.length > 0 && (
            <div className="max-h-56 overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-panel-border">
                    {rows.columns.map((c) => (
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
                  {rows.values.map((row, i) => (
                    <tr key={i} className="border-b border-panel-border/50">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="whitespace-nowrap px-3 py-1.5 font-mono text-[12px] text-ink"
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
    </div>
  );
}
