"use client";

/**
 * Live Excel formula evaluation for the Excel course.
 *
 * Every other course grades by running the learner's real work in a real
 * runtime (sql.js, Pyodide, WebR). Excel had no equivalent, and a
 * multiple-choice-only Excel course teaches recognition rather than recall —
 * so formulas here execute against the actual WORKBOOK grid and are graded on
 * the value they produce, not on string-matching the text.
 *
 * Engine choice: `fast-formula-parser` (MIT). HyperFormula is the more
 * complete engine but is GPL-3.0-only, which would force this whole app to
 * GPL — it is not an option for a commercial product. The tradeoff is that
 * fast-formula-parser ships a partial function library, so the gaps a fantasy
 * spreadsheet actually needs are implemented below.
 *
 * The parser is ~670 KB and is NEVER loaded on page load — only when a
 * learner opens a formula exercise.
 */

import {
  MAIN_SHEET,
  WORKBOOK,
  type CellValue,
  type Workbook,
} from "@/lib/excel-data";

export type FormulaResult = {
  /** Evaluated value, or null when the formula errored. */
  value: CellValue | boolean;
  /** Excel-style error (#REF!, #N/A) or a parse message. Null on success. */
  error: string | null;
};

type ParserPosition = { row: number; col: number; sheet: string };
type RangeRef = {
  sheet: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
};
type Parser = { parse: (formula: string, position: ParserPosition) => unknown };

let parserPromise: Promise<Parser> | null = null;

// ── Argument handling ─────────────────────────────────────────────

/**
 * Flatten whatever the parser hands a custom function into plain values.
 *
 * Arguments arrive as scalars, as 2-D range arrays, or wrapped in
 * `{ value, isArray }` descriptors depending on how they were written, and the
 * wrappers nest. Unwrapping recursively is the only shape that handles all
 * three without special-casing each function.
 */
function flatten(input: unknown): (CellValue | boolean)[] {
  const out: (CellValue | boolean)[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object" && "value" in node) {
      walk((node as { value: unknown }).value);
      return;
    }
    out.push(node as CellValue | boolean);
  };
  walk(input);
  return out;
}

const numbers = (input: unknown): number[] =>
  flatten(input).filter((v): v is number => typeof v === "number");

/** Unwrap a single scalar argument (criteria, lookup values, flags). */
function scalar(input: unknown): CellValue | boolean {
  const flat = flatten(input);
  return flat.length ? flat[0] : null;
}

/**
 * Excel criteria: a bare value means equals, otherwise a leading comparison
 * operator. Text comparison is case-insensitive, as it is in Excel.
 */
function matcher(
  criteria: CellValue | boolean,
): (v: CellValue | boolean) => boolean {
  const raw = criteria === null ? "" : String(criteria).trim();
  const m = /^(>=|<=|<>|>|<|=)(.*)$/.exec(raw);
  const op = m ? m[1] : "=";
  const rhs = m ? m[2].trim() : raw;
  const rhsNum = rhs === "" ? NaN : Number(rhs);
  const rhsIsNum = !Number.isNaN(rhsNum);

  return (v) => {
    if (rhsIsNum && typeof v === "number") {
      switch (op) {
        case ">":
          return v > rhsNum;
        case ">=":
          return v >= rhsNum;
        case "<":
          return v < rhsNum;
        case "<=":
          return v <= rhsNum;
        case "<>":
          return v !== rhsNum;
        default:
          return v === rhsNum;
      }
    }
    const left = v === null ? "" : String(v).toLowerCase();
    const right = rhs.toLowerCase();
    if (op === "<>") return left !== right;
    if (op === "=") return left === right;
    return false; // ordering operators on text aren't used in this course
  };
}

/** Rows matching every (range, criteria) pair — the shared SUMIFS/COUNTIFS core. */
function matchingIndexes(pairs: unknown[]): number[] {
  if (pairs.length === 0) return [];
  const first = flatten(pairs[0]);
  const keep: number[] = [];
  for (let i = 0; i < first.length; i++) {
    let ok = true;
    for (let p = 0; p + 1 < pairs.length; p += 2) {
      const range = flatten(pairs[p]);
      const test = matcher(scalar(pairs[p + 1]));
      if (!test(range[i] ?? null)) {
        ok = false;
        break;
      }
    }
    if (ok) keep.push(i);
  }
  return keep;
}

/**
 * Functions fast-formula-parser does not implement. Verified missing by
 * probing the library directly — see scripts/verify-answer-keys.mjs, which
 * re-checks every one of these on each run so an upstream addition that
 * changes behaviour can't slip past silently.
 */
function customFunctions(): Record<string, (...args: unknown[]) => unknown> {
  return {
    MAX: (...args) => {
      const n = numbers(args);
      return n.length ? Math.max(...n) : 0;
    },
    MIN: (...args) => {
      const n = numbers(args);
      return n.length ? Math.min(...n) : 0;
    },
    COUNTA: (...args) =>
      flatten(args).filter((v) => v !== null && v !== undefined && v !== "")
        .length,
    COUNTBLANK: (...args) =>
      flatten(args).filter((v) => v === null || v === undefined || v === "")
        .length,
    MEDIAN: (...args) => {
      const n = numbers(args).sort((a, b) => a - b);
      if (!n.length) return 0;
      const mid = Math.floor(n.length / 2);
      return n.length % 2 ? n[mid] : (n[mid - 1] + n[mid]) / 2;
    },
    LARGE: (...args) => {
      const n = numbers(args[0]).sort((a, b) => b - a);
      const k = Number(scalar(args[1]));
      return n[k - 1] ?? { error: "#NUM!" };
    },
    SMALL: (...args) => {
      const n = numbers(args[0]).sort((a, b) => a - b);
      const k = Number(scalar(args[1]));
      return n[k - 1] ?? { error: "#NUM!" };
    },
    SUMIFS: (...args) => {
      const sumRange: (CellValue | boolean)[] = flatten(args[0]);
      return matchingIndexes(args.slice(1)).reduce((total, i) => {
        const v = sumRange[i];
        return total + (typeof v === "number" ? v : 0);
      }, 0);
    },
    COUNTIFS: (...args) => matchingIndexes(args).length,
    AVERAGEIFS: (...args) => {
      const avgRange = flatten(args[0]);
      const hits = matchingIndexes(args.slice(1))
        .map((i) => avgRange[i])
        .filter((v): v is number => typeof v === "number");
      if (!hits.length) return { error: "#DIV/0!" };
      return hits.reduce((a, b) => a + b, 0) / hits.length;
    },
    MATCH: (...args) => {
      const needle = scalar(args[0]);
      const hay = flatten(args[1]);
      const probe =
        typeof needle === "string" ? needle.toLowerCase() : needle;
      const idx = hay.findIndex((v) =>
        typeof v === "string" && typeof probe === "string"
          ? v.toLowerCase() === probe
          : v === probe,
      );
      return idx === -1 ? { error: "#N/A" } : idx + 1;
    },
    XLOOKUP: (...args) => {
      const needle = scalar(args[0]);
      const hay = flatten(args[1]);
      const ret = flatten(args[2]);
      const fallback = args.length > 3 ? scalar(args[3]) : null;
      const probe =
        typeof needle === "string" ? needle.toLowerCase() : needle;
      const idx = hay.findIndex((v) =>
        typeof v === "string" && typeof probe === "string"
          ? v.toLowerCase() === probe
          : v === probe,
      );
      if (idx === -1) return fallback === null ? { error: "#N/A" } : fallback;
      return ret[idx] ?? { error: "#N/A" };
    },
    UPPER: (...args) => String(scalar(args[0]) ?? "").toUpperCase(),
    LOWER: (...args) => String(scalar(args[0]) ?? "").toLowerCase(),
    PROPER: (...args) =>
      String(scalar(args[0]) ?? "")
        .toLowerCase()
        .replace(/\b[a-z]/g, (c) => c.toUpperCase()),
    TEXTJOIN: (...args) => {
      const delim = String(scalar(args[0]) ?? "");
      const skipEmpty = scalar(args[1]) !== false;
      const parts = flatten(args.slice(2))
        .filter((v) => (skipEmpty ? v !== null && v !== "" : true))
        .map((v) => (v === null ? "" : String(v)));
      return parts.join(delim);
    },
    SUBSTITUTE: (...args) => {
      const text = String(scalar(args[0]) ?? "");
      const find = String(scalar(args[1]) ?? "");
      const repl = String(scalar(args[2]) ?? "");
      return find === "" ? text : text.split(find).join(repl);
    },
    VALUE: (...args) => {
      const n = Number(String(scalar(args[0]) ?? "").trim());
      return Number.isNaN(n) ? { error: "#VALUE!" } : n;
    },
  };
}

// ── Parser lifecycle ──────────────────────────────────────────────

function readCell(book: Workbook, sheet: string, row: number, col: number) {
  const rows = book[sheet];
  if (!rows) return null;
  const r = rows[row - 1];
  if (!r) return null;
  return r[col - 1] ?? null;
}

async function getParser(): Promise<Parser> {
  if (!parserPromise) {
    parserPromise = (async () => {
      const mod = await import("fast-formula-parser");
      const FormulaParser = (mod.default ?? mod) as new (
        cfg: unknown,
      ) => Parser;
      return new FormulaParser({
        onCell: ({ sheet, row, col }: ParserPosition) =>
          readCell(WORKBOOK, sheet, row, col),
        onRange: (ref: RangeRef) => {
          const rows: CellValue[][] = [];
          for (let r = ref.from.row; r <= ref.to.row; r++) {
            const row: CellValue[] = [];
            for (let c = ref.from.col; c <= ref.to.col; c++) {
              row.push(readCell(WORKBOOK, ref.sheet, r, c));
            }
            rows.push(row);
          }
          return rows;
        },
        functions: customFunctions(),
      });
    })().catch((err) => {
      parserPromise = null;
      throw err;
    });
  }
  return parserPromise;
}

let ready = false;

/** Warm the engine so the UI can show a loading state instead of a stall. */
export async function ensureFormulaEngine(): Promise<void> {
  await getParser();
  ready = true;
}

/** True once the parser is loaded — lets the Check button gate on readiness. */
export function formulaEngineReady(): boolean {
  return ready;
}

/**
 * Evaluate a formula against the workbook. The leading `=` is optional so a
 * learner who types it (as they would in Excel) and one who doesn't both work.
 */
export async function evaluateFormula(
  formula: string,
  sheet: string = MAIN_SHEET,
): Promise<FormulaResult> {
  const body = formula.trim().replace(/^=/, "").trim();
  if (!body) return { value: null, error: "Type a formula to run it." };

  try {
    const parser = await getParser();
    ready = true;
    const raw = parser.parse(body, { row: 1, col: 1, sheet });

    if (raw && typeof raw === "object" && "error" in raw) {
      const err = (raw as { error: unknown }).error;
      return { value: null, error: String(err) };
    }
    return { value: scalar(raw), error: null };
  } catch (err) {
    return { value: null, error: cleanError(err) };
  }
}

function cleanError(err: unknown): string {
  if (err && typeof err === "object" && "error" in err) {
    return String((err as { error: unknown }).error);
  }
  const raw = err instanceof Error ? err.message : String(err);
  const first = raw.split("\n").find((l) => l.trim()) ?? raw;
  return first.trim().slice(0, 200);
}

// ── Grading ───────────────────────────────────────────────────────

const CELL_REFERENCE = /\$?[A-Za-z]{1,3}\$?\d+/;

/** Does this formula actually read the sheet, rather than hardcode an answer? */
export function referencesCells(formula: string): boolean {
  // Strip quoted text first, so a criteria string like ">20" or a name like
  // "A.J. Brown" can't be mistaken for a reference.
  const withoutStrings = formula.replace(/"(?:[^"\\]|\\.)*"/g, "");
  return CELL_REFERENCE.test(withoutStrings);
}

/**
 * Values match if they're the same number (to a cent) or the same text.
 *
 * Floating-point sums of one-decimal points land on things like
 * 96.19999999999999, so an exact === would fail obviously-correct answers.
 */
export function valuesMatch(
  a: CellValue | boolean,
  b: CellValue | boolean,
): boolean {
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) < 0.005;
  }
  if (typeof a === "boolean" || typeof b === "boolean") {
    return String(a).toLowerCase() === String(b).toLowerCase();
  }
  const norm = (v: CellValue | boolean) =>
    v === null || v === undefined ? "" : String(v).trim().toLowerCase();
  return norm(a) === norm(b);
}

/** How a value should read in the result chip. */
export function formatValue(value: CellValue | boolean): string {
  if (value === null || value === undefined || value === "") return "(blank)";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
  }
  return String(value);
}
