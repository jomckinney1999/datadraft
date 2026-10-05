"use client";

/**
 * The Power BI-style measure builder (lib/dax.ts is the engine). Used by `dax`
 * drills in the Power BI course and on /dax.
 *
 * Laid out like Report view: the Fields pane (the Results table's columns and
 * the model's measures; click one to drop its reference into the formula), a
 * formula bar for the measure, any slicers, and a matrix visual that runs the
 * measure once per row and once for the Total, live as you type. That last
 * part is the lesson: a SUM looks right on every row, a ratio summed wrongly
 * shows up at the total, and CALCULATE visibly overrides a row's filter.
 *
 * Controlled: the parent owns the measure text, the model rows and the visual.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DAX_COLUMNS,
  DAX_TABLE,
  evaluateMatrix,
  formatDax,
  splitMeasure,
  type DaxModel,
  type DaxRow,
  type DaxVisual,
} from "@/lib/dax";

const FUNCTIONS = ["SUM", "AVERAGE", "COUNTROWS", "DISTINCTCOUNT", "DIVIDE", "CALCULATE", "ALL", "FILTER", "VALUES", "SUMX", "AVERAGEX", "IF"];

export default function DaxBuilder({
  measure,
  onChange,
  model,
  visual,
  onVisualChange,
  disabled = false,
}: {
  measure: string;
  onChange: (text: string) => void;
  /** Null while the lesson database is still loading. */
  model: DaxModel | null;
  visual: DaxVisual;
  /** When set, the rows column and the slicer can be changed (the /dax lab). */
  onVisualChange?: (v: DaxVisual) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  // Evaluate a beat after typing stops, so a half-typed bracket isn't an error flash.
  const [settled, setSettled] = useState(measure);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(measure), 250);
    return () => window.clearTimeout(t);
  }, [measure]);

  const matrix = useMemo(() => (model ? evaluateMatrix(settled, visual, model) : null), [settled, visual, model]);
  const name = splitMeasure(settled).name ?? "Measure";
  const rowsCol = DAX_COLUMNS.find((c) => c.key === visual.rows);
  const slicers = Object.entries(visual.slicers ?? {}) as [keyof DaxRow, string | number][];
  const seasons = useMemo(
    () => (model ? Array.from(new Set(model.rows.map((r) => r.season))).sort((a, b) => a - b) : []),
    [model],
  );

  function insert(text: string) {
    if (disabled) return;
    const el = ref.current;
    if (!el) return onChange(measure + text);
    const start = el.selectionStart ?? measure.length;
    const end = el.selectionEnd ?? measure.length;
    const next = measure.slice(0, start) + text + measure.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  }

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {/* Fields pane */}
      <div className="rounded-xl border border-panel-border bg-night/30 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">Fields · {DAX_TABLE}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DAX_COLUMNS.map((c) => (
            <button
              key={c.key}
              type="button"
              disabled={disabled}
              onClick={() => insert(`${DAX_TABLE}[${c.name}]`)}
              title={c.note}
              className="rounded-md border border-panel-border px-2 py-0.5 font-mono text-[11px] text-ink-soft hover:border-ice/50 hover:text-ice"
            >
              {c.kind === "number" ? "Σ " : ""}
              {c.name}
            </button>
          ))}
        </div>
        {model && Object.keys(model.measures).length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-gold">Measures</span>
            {Object.entries(model.measures).map(([m, body]) => (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => insert(`[${m}]`)}
                title={`${m} = ${body}`}
                className="rounded-md border border-gold/40 px-2 py-0.5 font-mono text-[11px] text-gold hover:bg-gold/10"
              >
                ▦ {m}
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          {FUNCTIONS.map((f) => (
            <button
              key={f}
              type="button"
              disabled={disabled}
              onClick={() => insert(`${f}(`)}
              className="rounded px-1.5 py-0.5 font-mono text-[10px] text-ink-muted hover:bg-panel hover:text-ink"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Formula bar */}
      <div className="overflow-hidden rounded-xl border border-panel-border bg-night/60">
        <div className="flex items-center gap-2 border-b border-panel-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          <span className="text-turf">✓</span> New measure
        </div>
        <textarea
          ref={ref}
          value={measure}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          spellCheck={false}
          aria-label="DAX measure"
          placeholder={`Total Points = SUM(${DAX_TABLE}[Points])`}
          className="block w-full resize-y bg-transparent px-3 py-2 font-mono text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink-muted/60"
        />
        {matrix?.error && settled.trim() && (
          <p className="border-t border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">⚠ {matrix.error}</p>
        )}
      </div>

      {/* Slicers + matrix visual */}
      <div className="rounded-xl border border-panel-border bg-night/20 p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {onVisualChange ? (
            <>
              <label className="flex items-center gap-1.5 font-mono text-[11px] text-ink-soft">
                Rows
                <select
                  value={visual.rows}
                  onChange={(e) => onVisualChange({ ...visual, rows: e.target.value as keyof DaxRow })}
                  className="rounded-md border border-panel-border bg-panel px-1.5 py-0.5 text-ink"
                >
                  {DAX_COLUMNS.filter((c) => c.key !== "points").map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1.5 font-mono text-[11px] text-ink-soft">
                Season slicer
                <select
                  value={String(visual.slicers?.season ?? "")}
                  onChange={(e) =>
                    onVisualChange({ ...visual, slicers: e.target.value ? { ...visual.slicers, season: Number(e.target.value) } : {} })
                  }
                  className="rounded-md border border-panel-border bg-panel px-1.5 py-0.5 text-ink"
                >
                  <option value="">All</option>
                  {seasons.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            slicers.map(([k, v]) => (
              <span key={k} className="rounded-md border border-ice/40 bg-ice/10 px-2 py-0.5 font-mono text-[11px] text-ice">
                Slicer · {DAX_COLUMNS.find((c) => c.key === k)?.name}: {String(v)}
              </span>
            ))
          )}
        </div>
        {!model ? (
          <p className="py-6 text-center font-mono text-[12px] text-ink-muted">Loading the model…</p>
        ) : (
          <table className="w-full font-mono text-[12px]">
            <thead>
              <tr className="border-b border-panel-border text-[10px] uppercase tracking-wider text-ink-muted">
                <th className="px-2 py-1.5 text-left">{rowsCol?.name}</th>
                <th className="px-2 py-1.5 text-right">{name}</th>
              </tr>
            </thead>
            <tbody>
              {(matrix?.rows ?? []).map((r) => (
                <tr key={r.label} className="border-b border-panel-border/40">
                  <td className="px-2 py-1 text-ink-soft">{r.label}</td>
                  <td className="px-2 py-1 text-right text-ink">{formatDax(r.value)}</td>
                </tr>
              ))}
              {matrix && !matrix.error && matrix.total !== undefined && (
                <tr className="font-bold">
                  <td className="px-2 py-1.5 text-ink">Total</td>
                  <td className="px-2 py-1.5 text-right text-ink">{formatDax(matrix.total)}</td>
                </tr>
              )}
              {matrix && !matrix.error && matrix.rows.length === 0 && settled.trim() && (
                <tr>
                  <td colSpan={2} className="px-2 py-3 text-center text-ink-muted">
                    Every row is blank, so the visual hides them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
