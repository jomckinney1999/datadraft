"use client";

/**
 * The workbook, drawn the way a spreadsheet looks: lettered columns across the
 * top, numbered rows down the side.
 *
 * This is not a spreadsheet *editor* — it is a read-only view of the data the
 * learner is writing formulas against. Building an editable grid would mean
 * building a fake Excel, and a fake Excel teaches habits that don't transfer.
 * The learner reads real addresses off this grid and types real formulas
 * against them, which is the part that does transfer.
 */

import {
  IMPORT_SHEET,
  MAIN_SHEET,
  WORKBOOK,
  columnLetter,
  sheetWidth,
  type CellValue,
} from "@/lib/excel-data";

function renderCell(value: CellValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

/** Right-align numbers the way a spreadsheet does — it makes columns scannable. */
function alignFor(value: CellValue): string {
  return typeof value === "number" ? "text-right" : "text-left";
}

export default function ExcelGrid({
  sheet = MAIN_SHEET,
  maxRows,
  caption,
}: {
  sheet?: string;
  maxRows?: number;
  caption?: string;
}) {
  const rows = WORKBOOK[sheet] ?? WORKBOOK[MAIN_SHEET];
  const width = sheetWidth(rows);
  const shown = maxRows ? rows.slice(0, maxRows) : rows;
  const hidden = rows.length - shown.length;

  return (
    <div className="border border-panel-border bg-night/95">
      <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
        <span className="label-broadcast text-turf">
          {sheet === IMPORT_SHEET ? "Import (raw export)" : "Roster"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          {rows.length - 1} data rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-panel-border bg-panel/40">
              {/* corner box */}
              <th className="sticky left-0 z-10 w-9 border-r border-panel-border bg-panel/60 px-1 py-1 font-mono text-[10px] text-ink-muted" />
              {Array.from({ length: width }, (_, c) => (
                <th
                  key={c}
                  className="border-r border-panel-border/50 px-2 py-1 font-mono text-[10px] font-normal uppercase tracking-widest text-ink-muted"
                >
                  {columnLetter(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, r) => (
              <tr key={r} className="border-b border-panel-border/40">
                <td className="sticky left-0 z-10 border-r border-panel-border bg-panel/60 px-1 py-1 text-center font-mono text-[10px] text-ink-muted">
                  {r + 1}
                </td>
                {Array.from({ length: width }, (_, c) => {
                  const value = row[c] ?? null;
                  // Row 1 is headers — bold them so the "data starts at row 2"
                  // point the first lesson makes is visible, not just stated.
                  const isHeader = r === 0;
                  return (
                    <td
                      key={c}
                      className={[
                        "whitespace-nowrap border-r border-panel-border/30 px-2 py-1 font-mono text-[11px]",
                        alignFor(value),
                        isHeader
                          ? "bg-panel/30 font-semibold text-ink"
                          : "text-ink-soft",
                      ].join(" ")}
                    >
                      {renderCell(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hidden > 0 && (
        <p className="border-t border-panel-border px-3 py-1.5 font-mono text-[10px] text-ink-muted">
          …{hidden} more rows
        </p>
      )}
      {caption && (
        <p className="border-t border-panel-border px-3 py-2 text-[12px] text-ink-muted">
          {caption}
        </p>
      )}
    </div>
  );
}
