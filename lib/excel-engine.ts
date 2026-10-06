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

/** The library's own error values, so IFERROR and ISERROR recognise ours. */
type Errors = { NA: unknown; NUM: unknown; VALUE: unknown; DIV0: unknown; REF: unknown };

/** A range argument as rows of cells (a lone value becomes a 1×1 grid). */
function grid(input: unknown): (CellValue | boolean)[][] {
  const v = input && typeof input === "object" && "value" in input ? (input as { value: unknown }).value : input;
  if (Array.isArray(v)) return v.map((row) => (Array.isArray(row) ? flatten(row) : [row as CellValue]));
  return [[v as CellValue]];
}

/**
 * Functions fast-formula-parser does not implement, or implements differently
 * from Excel. Verified by probing the library directly — see
 * scripts/verify-answer-keys.mjs, which re-checks every one of these on each
 * run so an upstream addition that changes behaviour can't slip past
 * silently.
 *
 * Errors are the library's own values (`E.NA`, …), not plain objects:
 * IFERROR only recognises those, so `IFERROR(XLOOKUP(…), "none")` used to
 * come back #VALUE! instead of "none" (2026-10-05).
 */
function customFunctions(E: Errors): Record<string, (...args: unknown[]) => unknown> {
  const rank = (...args: unknown[]) => {
    const v = Number(scalar(args[0]));
    const pool = numbers(args[1]);
    const ascending = args.length > 2 && Number(scalar(args[2])) !== 0;
    if (!pool.includes(v)) return E.NA;
    return 1 + pool.filter((x) => (ascending ? x < v : x > v)).length;
  };
  // Spread and percentiles, which the library doesn't have: STDEV, VAR,
  // PERCENTILE and QUARTILE all came back #ERROR! before 2026-10-06. Sample
  // (.S, and the old names) divides by n - 1, population (.P) by n, and a
  // percentile interpolates between ranks the way PERCENTILE.INC does.
  const variance = (sample: boolean) => (...args: unknown[]) => {
    const n = numbers(args);
    if (n.length < (sample ? 2 : 1)) return E.DIV0;
    const mean = n.reduce((a, b) => a + b, 0) / n.length;
    return n.reduce((a, b) => a + (b - mean) ** 2, 0) / (n.length - (sample ? 1 : 0));
  };
  const stdev = (sample: boolean) => (...args: unknown[]) => {
    const v = variance(sample)(...args);
    return typeof v === "number" ? Math.sqrt(v) : v;
  };
  const percentile = (input: unknown, k: number) => {
    const n = numbers(input).sort((a, b) => a - b);
    if (!n.length || !(k >= 0 && k <= 1)) return E.NUM;
    const r = k * (n.length - 1);
    const lo = Math.floor(r);
    const hi = Math.min(lo + 1, n.length - 1);
    return n[lo] + (r - lo) * (n[hi] - n[lo]);
  };
  const quartile = (...args: unknown[]) => {
    const q = Number(scalar(args[1]));
    if (![0, 1, 2, 3, 4].includes(q)) return E.NUM;
    return percentile(args[0], q / 4);
  };
  // The most frequent number; on a tie, the one that appears first, as Excel
  // does. #N/A when nothing repeats.
  const mode = (...args: unknown[]) => {
    const n = numbers(args);
    const count = new Map<number, number>();
    n.forEach((x) => count.set(x, (count.get(x) ?? 0) + 1));
    let best: number | null = null;
    for (const x of n) if ((count.get(x) ?? 0) > 1 && (best === null || (count.get(x) ?? 0) > (count.get(best) ?? 0))) best = x;
    return best ?? E.NA;
  };
  const ifs = (pick: (hits: number[]) => number) => (...args: unknown[]) => {
    const values = flatten(args[0]);
    const hits = matchingIndexes(args.slice(1))
      .map((i) => values[i])
      .filter((v): v is number => typeof v === "number");
    return hits.length ? pick(hits) : 0;
  };
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
      return n[k - 1] ?? E.NUM;
    },
    SMALL: (...args) => {
      const n = numbers(args[0]).sort((a, b) => a - b);
      const k = Number(scalar(args[1]));
      return n[k - 1] ?? E.NUM;
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
      if (!hits.length) return E.DIV0;
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
      return idx === -1 ? E.NA : idx + 1;
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
      if (idx === -1) return fallback === null ? E.NA : fallback;
      return ret[idx] ?? E.NA;
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
    MAXIFS: ifs((hits) => Math.max(...hits)),
    MINIFS: ifs((hits) => Math.min(...hits)),
    RANK: rank,
    "RANK.EQ": rank,
    // As Excel: multiply the arrays cell by cell and add, counting anything
    // that isn't a number (TRUE included) as 0, which is why the idiom is
    // --(range>=20). Arrays must be the same shape (#VALUE!), and an error
    // in any cell is the answer. The library counted TRUE as 1 when there
    // was only one array, and glued an #N/A onto the total as text.
    SUMPRODUCT: (...args) => {
      const arrays = args.map(grid);
      const rows = arrays[0]?.length ?? 0;
      const cols = arrays[0]?.[0]?.length ?? 0;
      if (arrays.some((g) => g.length !== rows || g.some((r) => r.length !== cols))) return E.VALUE;
      let total = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let product = 1;
          for (const g of arrays) {
            const v: unknown = g[r][c];
            if (v && typeof v === "object" && "error" in v) return v;
            product *= typeof v === "number" ? v : 0;
          }
          total += product;
        }
      }
      return total;
    },
    STDEV: stdev(true),
    "STDEV.S": stdev(true),
    STDEVP: stdev(false),
    "STDEV.P": stdev(false),
    VAR: variance(true),
    "VAR.S": variance(true),
    VARP: variance(false),
    "VAR.P": variance(false),
    PERCENTILE: (...args) => percentile(args[0], Number(scalar(args[1]))),
    "PERCENTILE.INC": (...args) => percentile(args[0], Number(scalar(args[1]))),
    QUARTILE: quartile,
    "QUARTILE.INC": quartile,
    MODE: mode,
    "MODE.SNGL": mode,
    // Pearson correlation over the pairs where both cells are numbers.
    CORREL: (...args) => {
      const a = flatten(args[0]);
      const b = flatten(args[1]);
      if (a.length !== b.length) return E.NA;
      const pairs = a
        .map((x, i) => [x, b[i]] as const)
        .filter((p): p is readonly [number, number] => typeof p[0] === "number" && typeof p[1] === "number");
      if (pairs.length < 2) return E.DIV0;
      const mx = pairs.reduce((s, p) => s + p[0], 0) / pairs.length;
      const my = pairs.reduce((s, p) => s + p[1], 0) / pairs.length;
      let sxy = 0;
      let sxx = 0;
      let syy = 0;
      for (const [x, y] of pairs) {
        sxy += (x - mx) * (y - my);
        sxx += (x - mx) ** 2;
        syy += (y - my) ** 2;
      }
      return sxx && syy ? sxy / Math.sqrt(sxx * syy) : E.DIV0;
    },
    // Excel reads INDEX(one_row, n) as the nth column, and the library reads
    // it as the nth row and answers #REF!. Same for a one-column range. A row
    // or column of 0 returns the whole column or row. The library calls INDEX
    // with itself first and the arguments as raw references, so values come
    // out through its own extractRefValue.
    INDEX: (context, ...raw) => {
      const ctx = context as { utils: { extractRefValue: (a: unknown) => { val: unknown } } };
      const args = raw.map((a) => (a == null ? null : ctx.utils.extractRefValue(a).val));
      const g = grid(args[0]);
      let r = args.length > 1 && args[1] !== null ? Number(scalar(args[1])) : 1;
      let c = args.length > 2 && args[2] !== null ? Number(scalar(args[2])) : NaN;
      if (Number.isNaN(c)) {
        if (g.length === 1) [r, c] = [1, r];
        else c = 1;
      }
      if (r === 0) return g.map((row) => [row[c - 1] ?? null]);
      if (c === 0) return [g[r - 1] ?? []];
      const v = g[r - 1]?.[c - 1];
      return v === undefined ? E.REF : v;
    },
    VALUE: (...args) => {
      const n = Number(String(scalar(args[0]) ?? "").trim());
      return Number.isNaN(n) ? E.VALUE : n;
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

/**
 * Cap a parser range to the sheet that actually exists.
 *
 * `SUM(A:A)` / `E:E` expand to Excel's full column (~1,048,576 rows). Building
 * that array freezes the tab. Real Excel short-circuits to used cells; we
 * clamp to the workbook's last populated row/column instead, which is the
 * same answer on our fixed sheets and keeps the UI responsive when a learner
 * types the whole-column habit from Excel desktop.
 */
function clampRange(book: Workbook, ref: RangeRef): RangeRef {
  const rows = book[ref.sheet];
  if (!rows || rows.length === 0) {
    return {
      ...ref,
      from: { row: 1, col: ref.from.col },
      to: { row: 1, col: ref.from.col },
    };
  }
  const maxRow = rows.length;
  const maxCol = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const fromRow = Math.max(1, Math.min(ref.from.row, maxRow));
  const toRow = Math.max(fromRow, Math.min(ref.to.row, maxRow));
  const fromCol = Math.max(1, Math.min(ref.from.col, maxCol));
  const toCol = Math.max(fromCol, Math.min(ref.to.col, maxCol));
  return {
    sheet: ref.sheet,
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
  };
}

async function getParser(): Promise<Parser> {
  if (!parserPromise) {
    parserPromise = buildParser(WORKBOOK).catch((err) => {
      parserPromise = null;
      throw err;
    });
  }
  return parserPromise;
}

type Operand = { val: unknown; isArray: boolean };
type OperatorHooks = {
  _applyInfix: (a: Operand, infix: string, b: Operand) => unknown;
  _applyPrefix: (prefixes: string[], val: unknown, isArray: boolean) => unknown;
};

/** A value as rows of cells if it's an array or a range, else null. */
function asGrid(v: unknown): unknown[][] | null {
  if (!Array.isArray(v)) return null;
  return v.map((row) => (Array.isArray(row) ? row : [row]));
}

/**
 * Operators work cell by cell on arrays and ranges, as they do in Excel 365:
 * =SUMPRODUCT((C2:C17="QB")*E2:E17) sums the quarterbacks' points. The
 * library applies +, -, *, /, ^, &, comparisons and unary minus to the first
 * cell of a range only, so before 2026-10-06 that formula gave 0 and
 * =SUMPRODUCT(E2:E17*D2:D17) gave 430.4 x 17: a correct answer graded wrong.
 * A single value, row or column stretches to meet the other side; cells
 * past the end of a shorter array are #N/A, as in Excel. Scalars still go
 * straight to the library.
 */
function arrayOperators(parser: Parser, NA: unknown): void {
  const hooks = (parser as unknown as { utils: OperatorHooks }).utils;
  const infix = hooks._applyInfix.bind(hooks);
  const prefix = hooks._applyPrefix.bind(hooks);
  hooks._applyInfix = (a, op, b) => {
    const ga = asGrid(a.val);
    const gb = asGrid(b.val);
    if (!ga && !gb) return infix(a, op, b);
    const x = ga ?? [[a.val]];
    const y = gb ?? [[b.val]];
    const rows = Math.max(x.length, y.length);
    const cols = Math.max(x[0]?.length ?? 0, y[0]?.length ?? 0);
    const at = (g: unknown[][], r: number, c: number) => {
      const rr = g.length === 1 ? 0 : r;
      const cc = (g[0]?.length ?? 0) === 1 ? 0 : c;
      return rr < g.length && cc < (g[rr]?.length ?? 0) ? g[rr][cc] : NA;
    };
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) =>
        infix({ val: at(x, r, c), isArray: false }, op, { val: at(y, r, c), isArray: false }),
      ),
    );
  };
  // A minus sign turns TRUE/FALSE into 1/0 (=--TRUE is 1 in Excel); the
  // library cancels a double minus and handed the boolean back unchanged.
  const minus = (prefixes: string[], cell: unknown) =>
    prefix(prefixes, prefixes.includes("-") && typeof cell === "boolean" ? Number(cell) : cell, false);
  hooks._applyPrefix = (prefixes, val, isArray) => {
    const g = asGrid(val);
    if (!g) return isArray ? prefix(prefixes, val, isArray) : minus(prefixes, val);
    return g.map((row) => row.map((cell) => minus(prefixes, cell)));
  };
}

async function buildParser(book: Workbook): Promise<Parser> {
  const mod = await import("fast-formula-parser");
  const FormulaParser = (mod.default ?? mod) as new (cfg: unknown) => Parser;
  const errors = (FormulaParser as unknown as { FormulaError: Errors }).FormulaError;
  const parser = new FormulaParser({
    onCell: ({ sheet, row, col }: ParserPosition) =>
      readCell(book, sheet, row, col),
    onRange: (ref: RangeRef) => {
      const clipped = clampRange(book, ref);
      const rows: CellValue[][] = [];
      for (let r = clipped.from.row; r <= clipped.to.row; r++) {
        const row: CellValue[] = [];
        for (let c = clipped.from.col; c <= clipped.to.col; c++) {
          row.push(readCell(book, clipped.sheet, r, c));
        }
        rows.push(row);
      }
      return rows;
    },
    functions: customFunctions(errors),
  });
  arrayOperators(parser, errors.NA);
  return parser;
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

export type EvaluateOptions = {
  /** Override workbook (e.g. Practice sheet overlays). Defaults to pinned WORKBOOK. */
  book?: Workbook;
  /** 1-based cell the formula “lives” in — matters for relative refs. */
  row?: number;
  col?: number;
};

/**
 * Evaluate a formula against the workbook. The leading `=` is optional so a
 * learner who types it (as they would in Excel) and one who doesn't both work.
 */
export async function evaluateFormula(
  formula: string,
  sheet: string = MAIN_SHEET,
  opts: EvaluateOptions = {},
): Promise<FormulaResult> {
  const body = formula.trim().replace(/^=/, "").trim();
  if (!body) return { value: null, error: "Type a formula to run it." };

  try {
    const book = opts.book ?? WORKBOOK;
    const parser =
      book === WORKBOOK ? await getParser() : await buildParser(book);
    ready = true;
    const raw = parser.parse(body, {
      row: opts.row ?? 1,
      col: opts.col ?? 1,
      sheet,
    });

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
