"use client";

/**
 * What the tables actually look like, wherever a learner writes SQL against
 * them: each table's first five rows, every column's type, and how many rows
 * there are.
 *
 * It replaced a line of column names ("week_results(player, team, …)"), and
 * the feedback that killed it was fair: you can't write `WHERE gameday >=
 * '2025-10-01'` without knowing the date is text, or `= 'QB'` without seeing
 * that positions are capitals. So the grid is the real rows, queried from the
 * same database the answer is graded on, never a screenshot that can drift.
 *
 * The runner is injected: every workspace already holds a seeded sql.js
 * connection, and a second one would double the memory and could disagree
 * with it. Until it's ready, each table shows its columns with a loading row,
 * so the panel never jumps from nothing to a grid.
 */

import { useMemo } from "react";
import type { QueryExecResult, SqlValue } from "sql.js";
import { PROVENANCE } from "@/lib/data-source";
import { EXTRA_PROVENANCE } from "@/lib/practice-schemas";
import TeamChip, { isTeamColumn } from "@/components/team-chip";

const PROV = new Map([...PROVENANCE, ...EXTRA_PROVENANCE].map((p) => [p.table, p]));

export type TableShape = { table: string; columns: string[] };
type Run = (sql: string) => QueryExecResult | undefined;

type Preview = {
  table: string;
  columns: string[];
  types: string[];
  rows: SqlValue[][];
  total: number | null;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/** SQLite's declared type, in plain words, or a guess from the values when
 *  the table declared none. Text that holds dates says so, because that's
 *  the thing people get wrong first. */
function typeOf(declared: string, values: SqlValue[]): string {
  const d = declared.toUpperCase();
  const seen = values.filter((v) => v !== null);
  const dates = seen.length > 0 && seen.every((v) => typeof v === "string" && ISO_DATE.test(v));
  if (d.includes("INT")) return "integer";
  if (d.includes("REAL") || d.includes("FLOA") || d.includes("DOUB") || d.includes("NUM")) return "decimal";
  if (d.includes("CHAR") || d.includes("TEXT") || d.includes("CLOB")) return dates ? "text · date" : "text";
  const first = seen[0];
  if (typeof first === "number") return seen.every((v) => Number.isInteger(v)) ? "integer" : "decimal";
  if (typeof first === "string") return dates ? "text · date" : "text";
  return "—";
}

function preview(run: Run, shape: TableShape, limit: number): Preview {
  const quoted = `"${shape.table.replace(/"/g, '""')}"`;
  const rows = run(`SELECT * FROM ${quoted} LIMIT ${limit};`);
  const columns = rows?.columns ?? shape.columns;
  const values = rows?.values ?? [];
  const info = run(`PRAGMA table_info(${quoted});`);
  const declared = new Map((info?.values ?? []).map((r) => [String(r[1]), String(r[2] ?? "")]));
  const count = run(`SELECT COUNT(*) FROM ${quoted};`);
  return {
    table: shape.table,
    columns,
    types: columns.map((c, i) => typeOf(declared.get(c) ?? "", values.map((row) => row[i]))),
    rows: values,
    total: count ? Number(count.values[0][0]) : null,
  };
}

export default function TablePreview({
  tables,
  run,
  ready,
  limit = 5,
  label = "the tables",
}: {
  tables: TableShape[];
  /** Runs SQL on the graded database; null until it has loaded. */
  run: Run | null;
  ready: boolean;
  limit?: number;
  label?: string;
}) {
  const key = tables.map((t) => t.table).join(",");
  const previews = useMemo(() => {
    if (!ready || !run) return null;
    const out = new Map<string, Preview>();
    for (const t of tables) {
      try {
        out.set(t.table, preview(run, t, limit));
      } catch {
        // A preview is a convenience; it must never take the workspace down.
      }
    }
    return out;
    // `run` is a fresh closure each render; the tables and readiness are
    // what change the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key, limit]);

  if (tables.length === 0) return null;

  return (
    <div>
      <p className="label-broadcast text-turf">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        The first {limit} rows of each, with every column&apos;s type, so you can see what the values look like before you
        query them.
      </p>
      <div className="mt-3 space-y-3">
        {tables.map((t, i) => {
          const p = previews?.get(t.table);
          const prov = PROV.get(t.table);
          const columns = p?.columns ?? t.columns;
          return (
            <details
              key={t.table}
              open={tables.length <= 3 || i < 2}
              className="group overflow-hidden rounded-xl border border-panel-border bg-night/30"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-[12px] font-bold text-ink">{t.table}</span>
                {prov && (
                  <span
                    className={`rounded-sm border px-1 font-mono text-[9px] uppercase tracking-widest ${
                      prov.kind === "real" ? "border-turf/40 text-turf" : "border-gold/40 text-gold"
                    }`}
                  >
                    {prov.label}
                  </span>
                )}
                <span className="ml-auto font-mono text-[10px] text-ink-muted">
                  {p?.total != null ? `${p.total.toLocaleString("en-US")} rows · ` : ""}
                  {columns.length} columns
                </span>
                <span aria-hidden className="font-mono text-[10px] text-ink-muted transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div
                className="max-h-64 overflow-auto border-t border-panel-border"
                tabIndex={0}
                aria-label={`First ${limit} rows of ${t.table}`}
              >
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="sticky top-0 z-[1] bg-panel">
                    <tr className="border-b border-panel-border">
                      {columns.map((c, j) => (
                        <th key={c} scope="col" className="whitespace-nowrap px-3 py-1.5 align-bottom">
                          <span className="block font-semibold text-ink">{c}</span>
                          <span className="block text-[10px] font-normal text-ice">{p ? p.types[j] : " "}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p ? (
                      p.rows.map((row, r) => (
                        <tr key={r} className="border-b border-panel-border/50 last:border-0">
                          {row.map((cell, j) => (
                            <td key={j} className="whitespace-nowrap px-3 py-1.5 text-ink-soft">
                              {cell === null ? (
                                <span className="text-ink-muted">NULL</span>
                              ) : isTeamColumn(columns[j] ?? "") ? (
                                <TeamChip abbr={String(cell)} />
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="px-3 py-3 text-ink-muted">
                          Loading rows…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
