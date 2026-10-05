"use client";

/**
 * The Tableau-style builder (lib/viz.ts is the logic, components/viz-chart.tsx
 * the picture). Used by `viz` drills in the Tableau course and on /viz.
 *
 * The parts a Tableau user meets first, in the colours Tableau uses for them:
 * dimensions are blue (ice) and slice the view, measures are green (turf)
 * and get aggregated. Click a field to choose a shelf, or drag it onto one.
 * Shelves: Columns, Rows, and on the Marks card a mark type, Color and
 * Detail; then Filters, a sort and Top N. Underneath, "the query this view
 * runs": Tableau writes SQL for every view too, and showing it ties the
 * course back to the SQL the learner already knows.
 *
 * Controlled: the parent owns the VizSpec (the lesson player grades it) and
 * passes `run`, which executes SQL against the lesson database.
 */

import { useMemo, useState, type DragEvent } from "react";
import type { QueryExecResult } from "sql.js";
import VizChart from "@/components/viz-chart";
import {
  AGGS,
  MARKS,
  VIZ_FIELDS,
  VIZ_SOURCE_LABEL,
  fieldKind,
  pillLabel,
  plotFor,
  specToSql,
  type VizAgg,
  type VizPill,
  type VizShelf,
  type VizSource,
  type VizSpec,
} from "@/lib/viz";

const SHELF_LABEL: Record<VizShelf, string> = { columns: "Columns", rows: "Rows", color: "Color", detail: "Detail" };
const MARK_LABEL = { bar: "Bar", line: "Line", circle: "Circle", text: "Text" } as const;

export default function VizBuilder({
  spec,
  onChange,
  run,
  sources = ["week_results"],
  disabled = false,
}: {
  spec: VizSpec;
  onChange: (next: VizSpec) => void;
  run: (sql: string) => QueryExecResult | undefined;
  /** Which tables the data pane may switch between. A drill pins one. */
  sources?: VizSource[];
  disabled?: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [editingFilter, setEditingFilter] = useState<string | null>(null);

  const sql = useMemo(() => specToSql(spec), [spec]);
  const { result, error } = useMemo(() => {
    if (!sql) return { result: null, error: null };
    try {
      const r = run(sql);
      return { result: r ? { columns: r.columns, values: r.values as (string | number | null)[][] } : { columns: [], values: [] }, error: null };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [sql, run]);
  const plot = useMemo(() => plotFor(spec, result), [spec, result]);

  const fields = VIZ_FIELDS[spec.source];
  const set = (patch: Partial<VizSpec>) => !disabled && onChange({ ...spec, ...patch });

  function addTo(shelf: VizShelf | "filter", field: string) {
    setPicked(null);
    if (disabled) return;
    if (shelf === "filter") {
      if (!spec.filters.some((f) => f.field === field)) set({ filters: [...spec.filters, { field, values: [] }] });
      setEditingFilter(field);
      return;
    }
    const pill: VizPill = fieldKind(spec.source, field) === "measure" ? { field, agg: "SUM" } : { field };
    if (spec[shelf].some((p) => p.field === field && p.agg === pill.agg)) return;
    set({ [shelf]: [...spec[shelf], pill] } as Partial<VizSpec>);
  }

  function removeFrom(shelf: VizShelf, i: number) {
    set({ [shelf]: spec[shelf].filter((_, j) => j !== i) } as Partial<VizSpec>);
  }

  function setAgg(shelf: VizShelf, i: number, agg: VizAgg) {
    set({ [shelf]: spec[shelf].map((p, j) => (j === i ? { ...p, agg } : p)) } as Partial<VizSpec>);
  }

  function onDrop(shelf: VizShelf | "filter", e: DragEvent) {
    e.preventDefault();
    const field = e.dataTransfer.getData("text/viz-field");
    if (field) addTo(shelf, field);
  }

  const distinct = (field: string): (string | number)[] => {
    try {
      const r = run(`SELECT DISTINCT "${field}" FROM ${spec.source} WHERE "${field}" IS NOT NULL ORDER BY 1;`);
      return (r?.values ?? []).map((v) => v[0] as string | number);
    } catch {
      return [];
    }
  };

  const shelfBox = (shelf: VizShelf) => (
    <div
      className="flex min-h-[38px] flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-panel-border bg-night/40 px-2 py-1.5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(shelf, e)}
      aria-label={`${SHELF_LABEL[shelf]} shelf`}
    >
      {spec[shelf].length === 0 && <span className="font-mono text-[10px] text-ink-muted">drop a field</span>}
      {spec[shelf].map((p, i) => (
        <span
          key={`${p.field}-${i}`}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${
            p.agg ? "border-turf/50 bg-turf/15 text-turf" : "border-ice/50 bg-ice/15 text-ice"
          }`}
        >
          {p.agg ? (
            <select
              value={p.agg}
              disabled={disabled}
              onChange={(e) => setAgg(shelf, i, e.target.value as VizAgg)}
              className="cursor-pointer bg-transparent font-bold text-turf outline-none"
              aria-label={`Aggregation for ${p.field}`}
            >
              {AGGS.map((a) => (
                <option key={a} value={a} className="bg-panel text-ink">
                  {a}
                </option>
              ))}
            </select>
          ) : null}
          {p.agg ? `(${p.field})` : p.field}
          {!disabled && (
            <button type="button" onClick={() => removeFrom(shelf, i)} className="ml-0.5 text-ink-muted hover:text-ink" aria-label={`Remove ${pillLabel(p)}`}>
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {/* Data pane */}
      <div className="rounded-xl border border-panel-border bg-night/30 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">Data</p>
          {sources.length > 1 ? (
            <select
              value={spec.source}
              disabled={disabled}
              onChange={(e) => onChange({ ...spec, source: e.target.value as VizSource, columns: [], rows: [], color: [], detail: [], filters: [] })}
              className="rounded-md border border-panel-border bg-panel px-2 py-1 font-mono text-[11px] text-ink"
              aria-label="Data source"
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  {VIZ_SOURCE_LABEL[s]}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-mono text-[10px] text-ink-muted">{VIZ_SOURCE_LABEL[spec.source]}</span>
          )}
        </div>
        {(["dimension", "measure"] as const).map((kind) => (
          <div key={kind} className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`w-20 font-mono text-[10px] uppercase tracking-wider ${kind === "measure" ? "text-turf" : "text-ice"}`}>
              {kind === "measure" ? "Measures" : "Dimensions"}
            </span>
            {fields
              .filter((f) => f.kind === kind)
              .map((f) => (
                <button
                  key={f.name}
                  type="button"
                  draggable={!disabled}
                  onDragStart={(e) => e.dataTransfer.setData("text/viz-field", f.name)}
                  onClick={() => setPicked(picked === f.name ? null : f.name)}
                  title={f.note}
                  disabled={disabled}
                  aria-expanded={picked === f.name}
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold transition-colors ${
                    kind === "measure"
                      ? "border-turf/40 text-turf hover:bg-turf/15"
                      : "border-ice/40 text-ice hover:bg-ice/15"
                  } ${picked === f.name ? (kind === "measure" ? "bg-turf/20" : "bg-ice/20") : ""}`}
                >
                  {f.name}
                </button>
              ))}
          </div>
        ))}
        {picked && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-panel-border bg-panel px-2 py-1.5">
            <span className="font-mono text-[10px] text-ink-muted">Add {picked} to</span>
            {(["columns", "rows", "color", "detail"] as VizShelf[]).map((s) => (
              <button key={s} type="button" onClick={() => addTo(s, picked)} className="rounded-md border border-panel-border px-2 py-0.5 font-mono text-[11px] text-ink hover:border-turf/50 hover:text-turf">
                {SHELF_LABEL[s]}
              </button>
            ))}
            {fieldKind(spec.source, picked) === "dimension" && (
              <button type="button" onClick={() => addTo("filter", picked)} className="rounded-md border border-panel-border px-2 py-0.5 font-mono text-[11px] text-ink hover:border-gold/50 hover:text-gold">
                Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shelves */}
      <div className="space-y-1.5">
        {(["columns", "rows"] as VizShelf[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">{SHELF_LABEL[s]}</span>
            {shelfBox(s)}
          </div>
        ))}
      </div>

      {/* Marks card + filters */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-panel-border bg-night/30 p-2.5">
          <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Marks</p>
          <div className="mb-2 flex flex-wrap gap-1">
            {MARKS.map((m) => (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => set({ mark: m })}
                aria-pressed={spec.mark === m}
                className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                  spec.mark === m ? "border-turf bg-turf/15 text-turf" : "border-panel-border text-ink-soft hover:text-ink"
                }`}
              >
                {MARK_LABEL[m]}
              </button>
            ))}
          </div>
          {(["color", "detail"] as VizShelf[]).map((s) => (
            <div key={s} className="mt-1 flex items-center gap-2">
              <span className="w-12 shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted">{SHELF_LABEL[s]}</span>
              {shelfBox(s)}
            </div>
          ))}
        </div>
        <div
          className="rounded-xl border border-panel-border bg-night/30 p-2.5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop("filter", e)}
        >
          <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Filters</p>
          <div className="flex flex-wrap gap-1.5">
            {spec.filters.length === 0 && <span className="font-mono text-[10px] text-ink-muted">drop a dimension</span>}
            {spec.filters.map((f) => (
              <span key={f.field} className="flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 font-mono text-[11px] font-bold text-gold">
                <button type="button" onClick={() => setEditingFilter(editingFilter === f.field ? null : f.field)} disabled={disabled}>
                  {f.field}
                  {f.values.length ? `: ${f.values.length > 2 ? `${f.values.length} values` : f.values.join(", ")}` : ": pick values"}
                </button>
                {!disabled && (
                  <button type="button" onClick={() => set({ filters: spec.filters.filter((x) => x.field !== f.field) })} className="text-ink-muted hover:text-ink" aria-label={`Remove filter on ${f.field}`}>
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {editingFilter && spec.filters.some((f) => f.field === editingFilter) && !disabled && (
            <div className="mt-2 max-h-36 overflow-auto rounded-lg border border-panel-border bg-panel p-2">
              {distinct(editingFilter).map((v) => {
                const f = spec.filters.find((x) => x.field === editingFilter)!;
                const on = f.values.includes(v);
                return (
                  <label key={String(v)} className="flex cursor-pointer items-center gap-2 py-0.5 font-mono text-[11px] text-ink-soft">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        set({
                          filters: spec.filters.map((x) =>
                            x.field === editingFilter ? { ...x, values: on ? x.values.filter((y) => y !== v) : [...x.values, v] } : x,
                          ),
                        })
                      }
                    />
                    {String(v)}
                  </label>
                );
              })}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => set({ sort: spec.sort === undefined ? "desc" : spec.sort === "desc" ? "asc" : undefined })}
              className="rounded-md border border-panel-border px-2 py-0.5 font-mono text-[11px] text-ink-soft hover:text-ink"
            >
              Sort: {spec.sort === "desc" ? "highest first" : spec.sort === "asc" ? "lowest first" : "off"}
            </button>
            <label className="flex items-center gap-1 font-mono text-[11px] text-ink-soft">
              Top
              <input
                type="number"
                min={1}
                value={spec.top ?? ""}
                disabled={disabled}
                onChange={(e) => set({ top: e.target.value ? Math.max(1, Number(e.target.value)) : undefined })}
                className="w-14 rounded-md border border-panel-border bg-panel px-1.5 py-0.5 text-ink"
                aria-label="Keep the top N marks"
              />
            </label>
          </div>
        </div>
      </div>

      {/* The view */}
      <div className="rounded-xl border border-panel-border bg-night/20 p-3">
        {error ? <p className="font-mono text-[12px] text-gold">⚠ {error}</p> : <VizChart plot={plot} />}
      </div>

      {sql && (
        <details className="rounded-lg border border-panel-border bg-night/30 px-3 py-2">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            The query this view runs
          </summary>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-ink-soft">{sql}</pre>
        </details>
      )}
    </div>
  );
}
