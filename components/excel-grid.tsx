"use client";

/**
 * Spreadsheet view — lettered columns, numbered rows, Excel-style selection.
 *
 * Roster / Import stay read-only source data (habits transfer: read addresses,
 * write real formulas). Practice sheet cells can show overlays (computed
 * values) and receive clicks for editing in the formula bar.
 *
 * When `maxRows` truncates the sheet, “Show all rows” expands to the full
 * grid; “Show fewer” collapses back. Call sites keep a compact default.
 */

import { useState } from "react";
import {
  IMPORT_SHEET,
  MAIN_SHEET,
  PRACTICE_SHEET,
  WORKBOOK,
  columnLetter,
  sheetWidth,
  toA1,
  type CellValue,
  type Sheet,
} from "@/lib/excel-data";

export type CellCoord = { row: number; col: number }; // 0-based

function renderCell(value: CellValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function alignFor(value: CellValue): string {
  return typeof value === "number" ? "text-right" : "text-left";
}

function sheetLabel(sheet: string): string {
  if (sheet === IMPORT_SHEET) return "Import (raw export)";
  if (sheet === PRACTICE_SHEET) return "Practice";
  return "Roster";
}

export default function ExcelGrid({
  sheet = MAIN_SHEET,
  maxRows,
  caption,
  rows: rowsOverride,
  selected,
  onSelect,
  /** Display values that override the underlying sheet (Practice formulas). */
  overlays,
  /** Soft highlight for formula-range previews, etc. */
  highlighted,
  /** Offer expand/collapse when maxRows hides rows. Default true. */
  expandable = true,
}: {
  sheet?: string;
  maxRows?: number;
  caption?: string;
  rows?: Sheet;
  selected?: CellCoord | null;
  onSelect?: (cell: CellCoord, a1: string) => void;
  overlays?: Record<string, CellValue>;
  highlighted?: Set<string>;
  expandable?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const base = rowsOverride ?? WORKBOOK[sheet] ?? WORKBOOK[MAIN_SHEET];
  const width = Math.max(sheetWidth(base), 1);
  const canExpand =
    expandable && Boolean(maxRows) && base.length > (maxRows ?? 0);
  const showingAll = !maxRows || expanded || !canExpand;
  const shown = showingAll ? base : base.slice(0, maxRows);
  const hidden = base.length - shown.length;
  const selectable = Boolean(onSelect);

  return (
    <div className="overflow-hidden border border-panel-border bg-night/95">
      <div className="flex items-center justify-between gap-2 border-b border-panel-border px-3 py-2">
        <span className="label-broadcast text-turf">{sheetLabel(sheet)}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            {sheet === PRACTICE_SHEET
              ? `${shown.length} of ${base.length} rows · type here`
              : showingAll
                ? `${Math.max(0, base.length - 1)} data rows`
                : `${shown.length} of ${base.length} rows`}
          </span>
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ice hover:underline"
              aria-expanded={expanded}
            >
              {expanded ? "Show fewer" : "Show all"}
            </button>
          )}
        </div>
      </div>

      <div
        className={
          expanded && base.length > 12
            ? "max-h-[min(70vh,32rem)] overflow-auto"
            : "overflow-x-auto"
        }
      >
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-[2]">
            <tr className="border-b border-panel-border bg-panel/95">
              <th className="sticky left-0 z-10 w-9 border-r border-panel-border bg-panel px-1 py-1 font-mono text-[10px] text-ink-muted" />
              {Array.from({ length: width }, (_, c) => (
                <th
                  key={c}
                  className={[
                    "border-r border-panel-border/50 bg-panel/95 px-2 py-1 font-mono text-[10px] font-normal uppercase tracking-widest text-ink-muted",
                    selected?.col === c ? "bg-turf/15 text-turf" : "",
                  ].join(" ")}
                >
                  {columnLetter(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, r) => (
              <tr key={r} className="border-b border-panel-border/40">
                <td
                  className={[
                    "sticky left-0 z-10 border-r border-panel-border bg-panel/60 px-1 py-1 text-center font-mono text-[10px] text-ink-muted",
                    selected?.row === r ? "bg-turf/15 text-turf" : "",
                  ].join(" ")}
                >
                  {r + 1}
                </td>
                {Array.from({ length: width }, (_, c) => {
                  const a1 = toA1(c, r);
                  const overlay = overlays?.[a1];
                  const value =
                    overlay !== undefined ? overlay : (row[c] ?? null);
                  const isHeader = r === 0 && sheet !== PRACTICE_SHEET;
                  const isSelected =
                    selected?.row === r && selected?.col === c;
                  const isHi = highlighted?.has(a1);
                  const cellClass = [
                    "relative min-w-[4.5rem] whitespace-nowrap border-r border-panel-border/30 px-2 py-1 font-mono text-[11px]",
                    alignFor(value),
                    isHeader
                      ? "bg-panel/30 font-semibold text-ink"
                      : "text-ink-soft",
                    isHi && !isSelected ? "bg-ice/10" : "",
                    isSelected
                      ? "z-[1] bg-turf/20 ring-2 ring-inset ring-turf"
                      : "",
                    selectable ? "cursor-cell hover:bg-panel/50" : "",
                  ].join(" ");

                  if (!selectable) {
                    return (
                      <td key={c} className={cellClass}>
                        {renderCell(value)}
                      </td>
                    );
                  }

                  return (
                    <td key={c} className={cellClass}>
                      <button
                        type="button"
                        onClick={() => onSelect?.({ row: r, col: c }, a1)}
                        className="absolute inset-0 flex items-center px-2 text-inherit"
                        aria-label={`Cell ${a1}`}
                      >
                        <span
                          className={`w-full truncate ${alignFor(value)}`}
                        >
                          {renderCell(value) || "\u00a0"}
                        </span>
                      </button>
                      {/* keep row height when empty */}
                      <span className="invisible px-2 py-1">0</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hidden > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-panel-border px-3 py-1.5">
          <p className="font-mono text-[10px] text-ink-muted">
            …{hidden} more rows
          </p>
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ice hover:underline"
            >
              Show all {base.length} rows
            </button>
          )}
        </div>
      )}
      {caption && (
        <p className="border-t border-panel-border px-3 py-2 text-[12px] text-ink-muted">
          {caption}
        </p>
      )}
    </div>
  );
}
