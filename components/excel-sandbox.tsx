"use client";

/**
 * Live Excel-style workbook: formula bar, sheet tabs, click-to-select,
 * Enter commits into the Practice sheet — feels like Excel without shipping
 * a fake full editor for the locked Roster/Import data.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import ExcelGrid, { type CellCoord } from "@/components/excel-grid";
import {
  IMPORT_SHEET,
  MAIN_SHEET,
  PRACTICE_SHEET,
  WORKBOOK,
  emptySheet,
  toA1,
  type CellValue,
  type Sheet,
  type Workbook,
} from "@/lib/excel-data";
import {
  ensureFormulaEngine,
  evaluateFormula,
  formatValue,
} from "@/lib/excel-engine";
import { EXCEL_DRILLS, type ExcelDrill } from "@/lib/excel-drills";
import Coach from "@/components/coach";

type SheetId = typeof MAIN_SHEET | typeof IMPORT_SHEET | typeof PRACTICE_SHEET;

const TABS: { id: SheetId; label: string }[] = [
  { id: MAIN_SHEET, label: "Roster" },
  { id: IMPORT_SHEET, label: "Import" },
  { id: PRACTICE_SHEET, label: "Practice" },
];

function clonePractice(): Sheet {
  return emptySheet(24, 8).map((row) => [...row]);
}

export default function ExcelSandbox() {
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState<SheetId>(PRACTICE_SHEET);
  const [selected, setSelected] = useState<CellCoord>({ row: 0, col: 0 });
  const [bar, setBar] = useState("");
  const [practiceRows, setPracticeRows] = useState<Sheet>(() => clonePractice());
  /** Practice formulas keyed by A1. */
  const [formulas, setFormulas] = useState<Record<string, string>>({});
  const [overlays, setOverlays] = useState<Record<string, CellValue>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drill, setDrill] = useState<ExcelDrill | null>(null);
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureFormulaEngine()
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setReady(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const a1 = toA1(selected.col, selected.row);
  const editable = sheet === PRACTICE_SHEET;

  const book: Workbook = useMemo(
    () => ({
      ...WORKBOOK,
      [PRACTICE_SHEET]: practiceRows,
    }),
    [practiceRows],
  );

  const loadBarForSelection = useCallback(
    (nextSheet: SheetId, cell: CellCoord) => {
      const addr = toA1(cell.col, cell.row);
      if (nextSheet === PRACTICE_SHEET) {
        const f = formulas[addr];
        if (f) {
          setBar(f.startsWith("=") ? f : `=${f}`);
          return;
        }
        const v = practiceRows[cell.row]?.[cell.col];
        setBar(v === null || v === undefined ? "" : String(v));
        return;
      }
      const v = WORKBOOK[nextSheet]?.[cell.row]?.[cell.col];
      setBar(v === null || v === undefined ? "" : String(v));
    },
    [formulas, practiceRows],
  );

  function switchSheet(id: SheetId) {
    setSheet(id);
    const cell = { row: 0, col: 0 };
    setSelected(cell);
    setError(null);
    setStatus(null);
    loadBarForSelection(id, cell);
  }

  function handleGridSelect(cell: CellCoord, _addr: string) {
    setSelected(cell);
    setError(null);
    setStatus(null);
    loadBarForSelection(sheet, cell);
  }

  function insertLockedRefIntoPractice() {
    const from = sheet;
    const addr = a1;
    const ref = `${from}!${addr}`;
    setSheet(PRACTICE_SHEET);
    setSelected({ row: 0, col: 0 });
    setBar((prev) => {
      const base = prev.trim() === "" ? "=" : prev;
      const withEq = base.startsWith("=") ? base : `=${base}`;
      // If bar still shows the locked cell's literal value, start fresh
      if (prev === String(WORKBOOK[from]?.[selected.row]?.[selected.col] ?? "")) {
        return `=${ref}`;
      }
      return withEq.endsWith(ref) ? withEq : withEq + ref;
    });
    setStatus(`Practice bar ← ${ref}`);
    setError(null);
  }

  async function commitCell() {
    if (!editable || !ready) return;
    const raw = bar.trim();
    const addr = a1;

    // Clear
    if (raw === "") {
      setFormulas((f) => {
        const next = { ...f };
        delete next[addr];
        return next;
      });
      setOverlays((o) => {
        const next = { ...o };
        delete next[addr];
        return next;
      });
      setPracticeRows((rows) => {
        const next = rows.map((r) => [...r]);
        if (next[selected.row]) next[selected.row][selected.col] = null;
        return next;
      });
      setStatus(`Cleared ${addr}`);
      setError(null);
      return;
    }

    const isFormula = raw.startsWith("=") || /[A-Za-z]{1,3}\d+/.test(raw);
    if (isFormula) {
      const formula = raw.startsWith("=") ? raw : `=${raw}`;
      const result = await evaluateFormula(formula, PRACTICE_SHEET, {
        book,
        row: selected.row + 1,
        col: selected.col + 1,
      });
      if (result.error) {
        setError(result.error);
        setStatus(null);
        return;
      }
      const cellValue = (
        typeof result.value === "boolean"
          ? result.value
            ? 1
            : 0
          : result.value
      ) as CellValue;
      setFormulas((f) => ({ ...f, [addr]: formula }));
      setOverlays((o) => ({ ...o, [addr]: cellValue }));
      setPracticeRows((rows) => {
        const next = rows.map((r) => [...r]);
        if (!next[selected.row]) return rows;
        next[selected.row][selected.col] = cellValue;
        return next;
      });
      setError(null);
      setStatus(`${addr} = ${formatValue(result.value)}`);
      setBar(formula);
      return;
    }

    // Literal value
    const asNum = Number(raw);
    const value: CellValue =
      raw !== "" && !Number.isNaN(asNum) && /^-?\d/.test(raw) ? asNum : raw;
    setFormulas((f) => {
      const next = { ...f };
      delete next[addr];
      return next;
    });
    setOverlays((o) => {
      const next = { ...o };
      delete next[addr];
      return next;
    });
    setPracticeRows((rows) => {
      const next = rows.map((r) => [...r]);
      if (!next[selected.row]) return rows;
      next[selected.row][selected.col] = value;
      return next;
    });
    setError(null);
    setStatus(`${addr} ← ${formatValue(value)}`);
  }

  async function previewOnly() {
    if (!ready) return;
    const raw = bar.trim();
    if (!raw) return;
    const formula = raw.startsWith("=") ? raw : `=${raw}`;
    const result = await evaluateFormula(formula, sheet, {
      book,
      row: selected.row + 1,
      col: selected.col + 1,
    });
    if (result.error) {
      setError(result.error);
      setStatus(null);
    } else {
      setError(null);
      setStatus(`Preview · ${formatValue(result.value)}`);
    }
  }

  function applyDrill(d: ExcelDrill) {
    setDrill(d);
    setPeek(false);
    switchSheet(PRACTICE_SHEET);
    setSelected({ row: 0, col: 0 });
    setBar("");
    setStatus(`Drill: ${d.title}`);
  }

  function resetPractice() {
    setPracticeRows(clonePractice());
    setFormulas({});
    setOverlays({});
    setBar("");
    setSelected({ row: 0, col: 0 });
    setError(null);
    setStatus("Practice sheet cleared");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {/* Title bar */}
        <div className="overflow-hidden border border-panel-border bg-panel">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-border px-3 py-2">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink">
              DataDraft · Workbook
            </p>
            <p className="font-mono text-[10px] text-ink-muted">
              {ready ? "Formulas ready" : "Loading engine…"}
            </p>
          </div>

          {/* Formula bar — Excel chrome */}
          <div className="flex items-stretch border-b border-panel-border bg-night/80">
            <div
              className="flex w-[4.5rem] shrink-0 items-center justify-center border-r border-panel-border font-mono text-xs font-bold text-turf"
              title="Active cell"
            >
              {sheet === PRACTICE_SHEET ? a1 : `${sheet}!${a1}`}
            </div>
            <div className="flex w-10 shrink-0 items-center justify-center border-r border-panel-border font-mono text-[11px] font-bold text-ink-muted">
              ƒx
            </div>
            <input
              type="text"
              value={bar}
              onChange={(e) => setBar(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void (editable ? commitCell() : previewOnly());
                }
                if (e.key === "Escape") {
                  loadBarForSelection(sheet, selected);
                  setError(null);
                }
              }}
              disabled={!ready}
              spellCheck={false}
              placeholder={
                editable
                  ? '=SUM(Roster!E2:E17)  ·  Enter to commit'
                  : "Read-only sheet — switch to Practice to type"
              }
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-ink-muted/50"
              aria-label="Formula bar"
            />
            <button
              type="button"
              disabled={!ready}
              onClick={() => void (editable ? commitCell() : previewOnly())}
              className="shrink-0 border-l border-panel-border bg-turf/15 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:bg-turf/25 disabled:opacity-40"
            >
              {editable ? "Enter" : "Preview"}
            </button>
          </div>

          {/* Sheet tabs */}
          <div className="flex flex-wrap items-center gap-1 border-b border-panel-border bg-panel/60 px-2 py-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchSheet(t.id)}
                className={`rounded-md px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  sheet === t.id
                    ? "bg-turf/20 text-turf"
                    : "text-ink-muted hover:bg-panel hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              type="button"
              onClick={resetPractice}
              className="ml-auto font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-gold"
            >
              Reset Practice
            </button>
          </div>

          <ExcelGrid
            sheet={sheet}
            rows={sheet === PRACTICE_SHEET ? practiceRows : undefined}
            selected={selected}
            onSelect={handleGridSelect}
            overlays={sheet === PRACTICE_SHEET ? overlays : undefined}
            maxRows={sheet === PRACTICE_SHEET ? 24 : 18}
            caption={
              sheet === PRACTICE_SHEET
                ? "Click a cell, type a formula or value in the bar, press Enter — like Excel."
                : "Read-only reference data. Switch to Practice to write formulas that reference these cells (e.g. Roster!E2)."
            }
          />

          {/* Insert ref strip when viewing locked sheets */}
          {sheet !== PRACTICE_SHEET && (
            <div className="flex flex-wrap items-center gap-2 border-t border-panel-border px-3 py-2">
              <p className="font-mono text-[10px] text-ink-muted">
                Writing on Practice?
              </p>
              <button
                type="button"
                onClick={insertLockedRefIntoPractice}
                className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ice hover:underline"
              >
                Insert {sheet}!{a1} into Practice →
              </button>
            </div>
          )}

          {(error || status) && (
            <div
              className={`border-t px-3 py-2 font-mono text-[12px] ${
                error
                  ? "border-gold/40 bg-gold/5 text-gold"
                  : "border-panel-border text-ink-soft"
              }`}
            >
              {error ? `⚠ ${error}` : status}
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="surface border border-panel-border bg-panel p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label-broadcast text-gold">drill book</p>
              <h2 className="mt-1 font-display text-lg font-bold text-ink">
                Get your reps
              </h2>
            </div>
            <Coach mood="think" size={56} className="shrink-0" />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            No grades. Pick a drill, write it on the Practice sheet, peek if
            you need to.
          </p>

          <ul className="mt-4 space-y-2">
            {EXCEL_DRILLS.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => applyDrill(d)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    drill?.id === d.id
                      ? "border-turf/50 bg-turf/10"
                      : "border-panel-border hover:border-turf/40"
                  }`}
                >
                  <p className="font-display text-sm font-bold text-ink">
                    {d.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-ink-muted">
                    {d.prompt}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {drill && (
            <div className="mt-4 rounded-xl border border-ice/30 bg-ice/5 px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ice">
                Active · {drill.title}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{drill.prompt}</p>
              {drill.tip && (
                <p className="mt-2 text-xs text-ink-muted">Tip: {drill.tip}</p>
              )}
              {peek ? (
                <pre className="mt-2 overflow-x-auto rounded-lg border border-panel-border bg-night px-2 py-1.5 font-mono text-[11px] text-turf">
                  {drill.solution}
                </pre>
              ) : (
                <button
                  type="button"
                  onClick={() => setPeek(true)}
                  className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-gold"
                >
                  Peek at solution
                </button>
              )}
              {peek && (
                <button
                  type="button"
                  onClick={() => {
                    setBar(drill.solution);
                    setPeek(true);
                  }}
                  className="mt-2 ml-3 font-mono text-[11px] uppercase tracking-wider text-turf hover:underline"
                >
                  Paste into bar
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
