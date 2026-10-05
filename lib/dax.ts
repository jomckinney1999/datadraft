/**
 * A small DAX engine, for the Power BI course and the /dax lab.
 *
 * Power BI Desktop is Windows-only and doesn't run in a browser, and the
 * course used to teach DAX with multiple choice alone. The idea that makes
 * DAX hard is the one this exists to make visible: **a measure is evaluated
 * once per cell, in that cell's filter context.** The matrix visual
 * (`evaluateMatrix`) runs the learner's measure for every row of the visual
 * and for the total, exactly as a report would, so `SUM` "just working" per
 * row and a ratio "going wrong" at the total both happen in front of them.
 *
 * What's in it: one table, `Results` (the lesson database's week_results:
 * Player, Team, Position, Season, Week, Points), measures that reference
 * other measures, and the functions the course teaches: SUM, AVERAGE, MIN,
 * MAX, COUNT, COUNTROWS, DISTINCTCOUNT, DIVIDE, ROUND, ABS, IF, BLANK,
 * ISBLANK, SELECTEDVALUE, HASONEVALUE, VALUES, ALL, REMOVEFILTERS, ALLEXCEPT,
 * KEEPFILTERS, FILTER, CALCULATE, and the X iterators (SUMX, AVERAGEX, MINX,
 * MAXX, COUNTX) with context transition. BLANK behaves like DAX's: an
 * aggregate over no rows is BLANK, DIVIDE by zero is BLANK, BLANK + 1 is 1,
 * and a matrix hides rows whose value is BLANK.
 *
 * What it isn't: a full engine. No relationships between tables, no dates,
 * no variables. The errors say plainly when a function isn't here, so a
 * learner never mistakes a gap in this engine for a mistake in their DAX.
 * Pure and DOM-free; graded on the numbers in the visual, like the Excel
 * course is graded on the value a formula produces.
 */

export type DaxRow = {
  player: string;
  team: string;
  position: string;
  season: number;
  week: number;
  points: number;
};

/** The model's one table and its columns, as the Fields pane lists them. */
export const DAX_TABLE = "Results";
export const DAX_COLUMNS: { name: string; key: keyof DaxRow; kind: "text" | "number"; note: string }[] = [
  { name: "Player", key: "player", kind: "text", note: "Player name" },
  { name: "Team", key: "team", kind: "text", note: "NFL team that week" },
  { name: "Position", key: "position", kind: "text", note: "QB, RB, WR or TE" },
  { name: "Season", key: "season", kind: "number", note: "Year" },
  { name: "Week", key: "week", kind: "number", note: "Week of the season" },
  { name: "Points", key: "points", kind: "number", note: "PPR fantasy points in that game" },
];

/** The SQL that loads the model from the lesson database. */
export const DAX_LOAD_SQL = "SELECT player, team, position, season, week, fantasy_pts FROM week_results";

export function rowsFromResult(values: unknown[][]): DaxRow[] {
  return values.map(([player, team, position, season, week, points]) => ({
    player: String(player),
    team: String(team),
    position: String(position),
    season: Number(season),
    week: Number(week),
    points: Number(points),
  }));
}

// ── Values ─────────────────────────────────────────────────────────

const BLANK = null;
type Scalar = number | string | boolean | null;
type Table =
  | { kind: "rows"; rows: DaxRow[] }
  | { kind: "values"; column: keyof DaxRow; values: Scalar[] };
type Value = Scalar | Table;

export class DaxError extends Error {}

const isTable = (v: Value): v is Table => typeof v === "object" && v !== null;

// ── Tokens ─────────────────────────────────────────────────────────

type Tok =
  | { t: "num"; v: number; at: number }
  | { t: "str"; v: string; at: number }
  | { t: "id"; v: string; at: number }
  | { t: "col"; table: string; col: string; at: number }
  | { t: "measure"; v: string; at: number }
  | { t: "op"; v: string; at: number };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const isIdStart = (ch: string) => /[A-Za-z_]/.test(ch);
  const isId = (ch: string) => /[A-Za-z0-9_.]/.test(ch);
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      out.push({ t: "num", v: Number(src.slice(i, j)), at: i });
      i = j;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let s = "";
      while (j < src.length) {
        if (src[j] === '"' && src[j + 1] === '"') {
          s += '"';
          j += 2;
        } else if (src[j] === '"') break;
        else s += src[j++];
      }
      if (j >= src.length) throw new DaxError(`A text value starting at character ${i + 1} is missing its closing quote.`);
      out.push({ t: "str", v: s, at: i });
      i = j + 1;
      continue;
    }
    if (ch === "[") {
      const j = src.indexOf("]", i);
      if (j < 0) throw new DaxError(`A [ at character ${i + 1} is never closed.`);
      out.push({ t: "measure", v: src.slice(i + 1, j).trim(), at: i });
      i = j + 1;
      continue;
    }
    if (ch === "'") {
      const j = src.indexOf("'", i + 1);
      if (j < 0) throw new DaxError(`A table name starting at character ${i + 1} is missing its closing '.`);
      const table = src.slice(i + 1, j);
      i = j + 1;
      if (src[i] === "[") {
        const k = src.indexOf("]", i);
        if (k < 0) throw new DaxError(`A [ at character ${i + 1} is never closed.`);
        out.push({ t: "col", table, col: src.slice(i + 1, k).trim(), at: i });
        i = k + 1;
      } else out.push({ t: "id", v: table, at: i });
      continue;
    }
    if (isIdStart(ch)) {
      let j = i;
      while (j < src.length && isId(src[j])) j++;
      const word = src.slice(i, j);
      if (src[j] === "[") {
        const k = src.indexOf("]", j);
        if (k < 0) throw new DaxError(`A [ at character ${j + 1} is never closed.`);
        out.push({ t: "col", table: word, col: src.slice(j + 1, k).trim(), at: i });
        i = k + 1;
      } else {
        out.push({ t: "id", v: word, at: i });
        i = j;
      }
      continue;
    }
    const two = src.slice(i, i + 2);
    if (["<=", ">=", "<>", "&&", "||", "=="].includes(two)) {
      out.push({ t: "op", v: two === "==" ? "=" : two, at: i });
      i += 2;
      continue;
    }
    if ("+-*/^&=<>(),{}".includes(ch)) {
      out.push({ t: "op", v: ch, at: i });
      i++;
      continue;
    }
    throw new DaxError(`DAX doesn't use "${ch}" (character ${i + 1}).`);
  }
  return out;
}

// ── Parse ──────────────────────────────────────────────────────────

export type Node =
  | { k: "num"; v: number }
  | { k: "str"; v: string }
  | { k: "bool"; v: boolean }
  | { k: "col"; table: string; col: string }
  | { k: "measure"; name: string }
  | { k: "table"; name: string }
  | { k: "call"; name: string; args: Node[] }
  | { k: "bin"; op: string; l: Node; r: Node }
  | { k: "neg"; e: Node }
  | { k: "in"; e: Node; list: Node[] };

function parse(src: string): Node {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === "op" && (peek() as { v: string }).v === v;
  const expectOp = (v: string) => {
    if (!isOp(v)) {
      const tok = peek();
      throw new DaxError(tok ? `Expected "${v}" at character ${tok.at + 1}.` : `Expected "${v}" before the end.`);
    }
    p++;
  };

  const binary = (next: () => Node, ops: string[]): (() => Node) => () => {
    let l = next();
    while (peek()?.t === "op" && ops.includes((peek() as { v: string }).v)) {
      const op = (toks[p++] as { v: string }).v;
      l = { k: "bin", op, l, r: next() };
    }
    return l;
  };

  const primary = (): Node => {
    const tok = toks[p];
    if (!tok) throw new DaxError("The formula ends too early.");
    p++;
    if (tok.t === "num") return { k: "num", v: tok.v };
    if (tok.t === "str") return { k: "str", v: tok.v };
    if (tok.t === "col") return { k: "col", table: tok.table, col: tok.col };
    if (tok.t === "measure") return { k: "measure", name: tok.v };
    if (tok.t === "op" && tok.v === "(") {
      const e = expr();
      expectOp(")");
      return e;
    }
    if (tok.t === "op" && tok.v === "{") {
      // A list on its own only appears after IN, which handles it below.
      throw new DaxError(`A { list } only works after IN (character ${tok.at + 1}).`);
    }
    if (tok.t === "id") {
      const upper = tok.v.toUpperCase();
      if (upper === "TRUE" || upper === "FALSE") {
        if (isOp("(")) {
          p++;
          expectOp(")");
        }
        return { k: "bool", v: upper === "TRUE" };
      }
      if (isOp("(")) {
        p++;
        const args: Node[] = [];
        if (!isOp(")")) {
          args.push(expr());
          while (isOp(",")) {
            p++;
            args.push(expr());
          }
        }
        expectOp(")");
        return { k: "call", name: upper, args };
      }
      return { k: "table", name: tok.v };
    }
    throw new DaxError(`Unexpected "${(tok as { v?: string }).v ?? "?"}" at character ${tok.at + 1}.`);
  };

  const unary = (): Node => {
    if (isOp("-")) {
      p++;
      return { k: "neg", e: unary() };
    }
    if (isOp("+")) {
      p++;
      return unary();
    }
    const base = primary();
    if (isOp("^")) {
      p++;
      return { k: "bin", op: "^", l: base, r: unary() };
    }
    return base;
  };
  const mul = binary(unary, ["*", "/"]);
  const add = binary(mul, ["+", "-"]);
  const concat = binary(add, ["&"]);
  const cmp = (): Node => {
    const l = concat();
    if (peek()?.t === "id" && (peek() as { v: string }).v.toUpperCase() === "IN") {
      p++;
      expectOp("{");
      const list: Node[] = [];
      if (!isOp("}")) {
        list.push(expr());
        while (isOp(",")) {
          p++;
          list.push(expr());
        }
      }
      expectOp("}");
      return { k: "in", e: l, list };
    }
    if (peek()?.t === "op" && ["=", "<>", "<", ">", "<=", ">="].includes((peek() as { v: string }).v)) {
      const op = (toks[p++] as { v: string }).v;
      return { k: "bin", op, l, r: concat() };
    }
    return l;
  };
  const and = binary(cmp, ["&&"]);
  const expr = binary(and, ["||"]);

  const tree = expr();
  if (p < toks.length) {
    const tok = toks[p];
    throw new DaxError(`Unexpected "${(tok as { v?: string }).v ?? (tok as { col?: string }).col ?? "?"}" at character ${tok.at + 1}. Is a comma or a bracket missing?`);
  }
  return tree;
}

/**
 * Split "Name = expression" into its parts. The name is optional, as in the
 * formula bar: everything before the first "=" counts as a name only if it
 * has no brackets, quotes or parentheses in it.
 */
export function splitMeasure(text: string): { name: string | null; body: string } {
  const m = /^\s*([^=[\]()"'{}]+?)\s*=(?![=<>])([\s\S]*)$/.exec(text);
  if (m && /[A-Za-z]/.test(m[1])) return { name: m[1].trim(), body: m[2] };
  return { name: null, body: text };
}

// ── Evaluate ───────────────────────────────────────────────────────

/** One filter on the context: a column's allowed values, or a row test (FILTER). */
type Filter = { column: keyof DaxRow | null; test: (row: DaxRow) => boolean };

type Ctx = {
  filters: Filter[];
  /** Set inside an iterator: the row (or the value of one column) being visited. */
  row: Partial<DaxRow> | null;
  depth: number;
};

export type DaxModel = { rows: DaxRow[]; measures: Record<string, string> };

function columnKey(table: string, col: string): keyof DaxRow {
  if (table.toLowerCase() !== DAX_TABLE.toLowerCase()) {
    throw new DaxError(`There's no table called ${table}. The model has one table: ${DAX_TABLE}.`);
  }
  const c = DAX_COLUMNS.find((x) => x.name.toLowerCase() === col.toLowerCase());
  if (!c) throw new DaxError(`${DAX_TABLE} has no column called [${col}]. Its columns: ${DAX_COLUMNS.map((x) => x.name).join(", ")}.`);
  return c.key;
}

function columnLabel(key: keyof DaxRow): string {
  return `${DAX_TABLE}[${DAX_COLUMNS.find((c) => c.key === key)?.name ?? key}]`;
}

export class DaxEngine {
  private parsed = new Map<string, Node>();
  constructor(private model: DaxModel) {}

  private measureNode(name: string): Node {
    const key = Object.keys(this.model.measures).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) {
      const known = Object.keys(this.model.measures);
      throw new DaxError(
        `There's no measure called [${name}].${known.length ? ` Measures in this model: ${known.map((k) => `[${k}]`).join(", ")}.` : ""}`,
      );
    }
    let node = this.parsed.get(key);
    if (!node) {
      node = parse(splitMeasure(this.model.measures[key]).body);
      this.parsed.set(key, node);
    }
    return node;
  }

  visible(ctx: Ctx): DaxRow[] {
    return this.model.rows.filter((r) => ctx.filters.every((f) => f.test(r)));
  }

  /** Context transition: an iterator's current row becomes filters, as CALCULATE does. */
  private transition(ctx: Ctx): Ctx {
    if (!ctx.row) return ctx;
    const entries = Object.entries(ctx.row) as [keyof DaxRow, Scalar][];
    const filters = ctx.filters.filter((f) => !entries.some(([k]) => f.column === k));
    for (const [k, v] of entries) filters.push({ column: k, test: (r) => r[k] === v });
    return { filters, row: null, depth: ctx.depth };
  }

  evalScalar(node: Node, ctx: Ctx): Scalar {
    const v = this.eval(node, ctx);
    if (isTable(v)) {
      // A one-value table is a scalar, as in DAX (VALUES with one row).
      const vals = this.tableValues(v);
      if (vals.length === 1) return vals[0];
      throw new DaxError("That gives a table where a single value was expected. Wrap it in an aggregation like COUNTROWS or SUMX.");
    }
    return v;
  }

  private tableValues(t: Table): Scalar[] {
    return t.kind === "values" ? t.values : t.rows.map(() => null);
  }

  private num(v: Scalar): number | null {
    if (v === null) return null;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "number") return v;
    const n = Number(v);
    if (Number.isNaN(n)) throw new DaxError(`Can't do arithmetic with the text "${v}".`);
    return n;
  }

  private truthy(v: Scalar): boolean {
    if (v === null) return false;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    return v !== "";
  }

  private compare(op: string, a: Scalar, b: Scalar): boolean {
    // BLANK compares as 0 against a number and "" against text, as in DAX.
    const norm = (x: Scalar, other: Scalar) =>
      x === null ? (typeof other === "string" ? "" : 0) : typeof x === "string" ? x.toLowerCase() : x;
    const l = norm(a, b);
    const r = norm(b, a);
    switch (op) {
      case "=":
        return l === r || (typeof l !== typeof r && String(l) === String(r));
      case "<>":
        return !(l === r || (typeof l !== typeof r && String(l) === String(r)));
      case "<":
        return (l as number) < (r as number);
      case ">":
        return (l as number) > (r as number);
      case "<=":
        return (l as number) <= (r as number);
      default:
        return (l as number) >= (r as number);
    }
  }

  private columnOf(node: Node, fn: string): keyof DaxRow {
    if (node.k !== "col") throw new DaxError(`${fn} needs a column, like ${DAX_TABLE}[Points].`);
    return columnKey(node.table, node.col);
  }

  /** Aggregate a column over the rows visible in the filter context. */
  private aggregate(fn: string, args: Node[], ctx: Ctx): Scalar {
    if (args.length !== 1) throw new DaxError(`${fn} takes one column.`);
    const key = this.columnOf(args[0], fn);
    const vals = this.visible(ctx).map((r) => r[key]);
    if (fn === "COUNT") return vals.length ? vals.filter((v) => v !== null && v !== undefined).length : BLANK;
    if (fn === "DISTINCTCOUNT") return vals.length ? new Set(vals).size : BLANK;
    const nums = vals.filter((v): v is number => typeof v === "number");
    if (!nums.length) {
      if (vals.length) throw new DaxError(`${fn} needs a number column; ${columnLabel(key)} is text. COUNT or DISTINCTCOUNT work on text.`);
      return BLANK;
    }
    switch (fn) {
      case "SUM":
        return nums.reduce((a, b) => a + b, 0);
      case "AVERAGE":
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      case "MIN":
        return Math.min(...nums);
      default:
        return Math.max(...nums);
    }
  }

  /** Apply one CALCULATE filter argument to a context. */
  private applyFilter(arg: Node, base: Ctx, current: Ctx): Ctx {
    let filters = [...current.filters];
    const drop = (keys: (keyof DaxRow)[] | "all") => {
      filters = keys === "all" ? [] : filters.filter((f) => f.column === null || !keys.includes(f.column));
    };

    if (arg.k === "call" && (arg.name === "ALL" || arg.name === "REMOVEFILTERS")) {
      if (arg.args.length === 0 || arg.args.some((a) => a.k === "table")) drop("all");
      else drop(arg.args.map((a) => this.columnOf(a, arg.name)));
      return { ...current, filters };
    }
    if (arg.k === "call" && arg.name === "ALLEXCEPT") {
      const keep = arg.args.slice(1).map((a) => this.columnOf(a, "ALLEXCEPT"));
      filters = filters.filter((f) => f.column !== null && keep.includes(f.column));
      return { ...current, filters };
    }
    if (arg.k === "call" && arg.name === "KEEPFILTERS") {
      if (arg.args.length !== 1) throw new DaxError("KEEPFILTERS takes one filter.");
      const inner = this.applyFilter(arg.args[0], base, { ...current, filters: [] });
      return { ...current, filters: [...filters, ...inner.filters] };
    }
    if (arg.k === "call" && arg.name === "FILTER") {
      const [tableArg, cond] = arg.args;
      if (!tableArg || !cond) throw new DaxError("FILTER takes a table and a condition.");
      const table = this.eval(tableArg, base);
      if (!isTable(table)) throw new DaxError("FILTER's first argument must be a table, like Results or VALUES(Results[Player]).");
      if (tableArg.k === "call" && tableArg.name === "ALL") drop("all");
      if (table.kind === "values") {
        const key = table.column;
        const keep = new Set(
          table.values.filter((v) => this.truthy(this.evalScalar(cond, { ...base, row: { [key]: v } as Partial<DaxRow> }))),
        );
        filters = filters.filter((f) => f.column !== key);
        filters.push({ column: key, test: (r) => keep.has(r[key]) });
      } else {
        const keep = new Set(table.rows.filter((r) => this.truthy(this.evalScalar(cond, { ...base, row: r }))));
        filters.push({ column: null, test: (r) => keep.has(r) });
      }
      return { ...current, filters };
    }

    // A boolean on one column: Results[Position] = "WR", Results[Season] >= 2024,
    // Results[Position] IN {"WR", "TE"}. It replaces any filter already on
    // that column, which is what CALCULATE does and what trips people up.
    const cols = new Set<keyof DaxRow>();
    const walk = (n: Node) => {
      if (n.k === "col") cols.add(columnKey(n.table, n.col));
      if (n.k === "measure") throw new DaxError("A CALCULATE filter like this can test a column, not a measure. To filter on a measure, use FILTER(VALUES(column), [Measure] > …).");
      if (n.k === "bin") {
        walk(n.l);
        walk(n.r);
      }
      if (n.k === "neg") walk(n.e);
      if (n.k === "in") {
        walk(n.e);
        n.list.forEach(walk);
      }
      if (n.k === "call") n.args.forEach(walk);
    };
    walk(arg);
    if (cols.size !== 1) {
      throw new DaxError("Each CALCULATE filter should test one column, like Results[Position] = \"WR\". Split two columns into two filters.");
    }
    const key = Array.from(cols)[0];
    filters = filters.filter((f) => f.column !== key);
    filters.push({ column: key, test: (r) => this.truthy(this.evalScalar(arg, { filters: [], row: { [key]: r[key] } as Partial<DaxRow>, depth: base.depth })) });
    return { ...current, filters };
  }

  eval(node: Node, ctx: Ctx): Value {
    if (ctx.depth > 40) throw new DaxError("These measures refer to each other in a loop.");
    switch (node.k) {
      case "num":
        return node.v;
      case "str":
        return node.v;
      case "bool":
        return node.v;
      case "neg": {
        const v = this.num(this.evalScalar(node.e, ctx));
        return v === null ? BLANK : -v;
      }
      case "col": {
        const key = columnKey(node.table, node.col);
        if (ctx.row && key in ctx.row) return ctx.row[key] as Scalar;
        throw new DaxError(
          `A single value for ${columnLabel(key)} can't be determined here. In a measure, wrap a column in an aggregation like SUM(${columnLabel(key)}), or iterate with SUMX.`,
        );
      }
      case "measure": {
        const inner = this.transition(ctx);
        return this.evalScalar(this.measureNode(node.name), { ...inner, depth: ctx.depth + 1 });
      }
      case "table": {
        if (node.name.toLowerCase() !== DAX_TABLE.toLowerCase()) {
          throw new DaxError(`"${node.name}" isn't a function, table or measure here. Measures go in square brackets: [${node.name}].`);
        }
        return { kind: "rows", rows: this.visible(ctx) };
      }
      case "in": {
        const v = this.evalScalar(node.e, ctx);
        return node.list.some((n) => this.compare("=", v, this.evalScalar(n, ctx)));
      }
      case "bin": {
        if (node.op === "&&") return this.truthy(this.evalScalar(node.l, ctx)) && this.truthy(this.evalScalar(node.r, ctx));
        if (node.op === "||") return this.truthy(this.evalScalar(node.l, ctx)) || this.truthy(this.evalScalar(node.r, ctx));
        const a = this.evalScalar(node.l, ctx);
        const b = this.evalScalar(node.r, ctx);
        if (["=", "<>", "<", ">", "<=", ">="].includes(node.op)) return this.compare(node.op, a, b);
        if (node.op === "&") return `${a ?? ""}${b ?? ""}`;
        const x = this.num(a);
        const y = this.num(b);
        if (node.op === "+" || node.op === "-") {
          if (x === null && y === null) return BLANK;
          return node.op === "+" ? (x ?? 0) + (y ?? 0) : (x ?? 0) - (y ?? 0);
        }
        if (x === null || y === null) return BLANK;
        if (node.op === "*") return x * y;
        if (node.op === "^") return x ** y;
        if (y === 0) return x === 0 ? Number.NaN : x > 0 ? Infinity : -Infinity;
        return x / y;
      }
      case "call":
        return this.call(node.name, node.args, ctx);
    }
  }

  private call(fn: string, args: Node[], ctx: Ctx): Value {
    switch (fn) {
      case "SUM":
      case "AVERAGE":
      case "MIN":
      case "MAX":
      case "COUNT":
      case "DISTINCTCOUNT":
        if (fn === "MIN" || fn === "MAX") {
          if (args.length === 2) {
            const a = this.num(this.evalScalar(args[0], ctx));
            const b = this.num(this.evalScalar(args[1], ctx));
            if (a === null) return b;
            if (b === null) return a;
            return fn === "MIN" ? Math.min(a, b) : Math.max(a, b);
          }
        }
        return this.aggregate(fn, args, ctx);
      case "COUNTROWS": {
        const t = args.length ? this.eval(args[0], ctx) : { kind: "rows" as const, rows: this.visible(ctx) };
        if (!isTable(t)) throw new DaxError("COUNTROWS counts a table, like COUNTROWS(Results).");
        const n = t.kind === "rows" ? t.rows.length : t.values.length;
        return n ? n : BLANK;
      }
      case "DIVIDE": {
        if (args.length < 2) throw new DaxError("DIVIDE takes a numerator and a denominator, and optionally what to show instead of dividing by zero.");
        const a = this.num(this.evalScalar(args[0], ctx));
        const b = this.num(this.evalScalar(args[1], ctx));
        if (b === null || b === 0) return args[2] ? this.evalScalar(args[2], ctx) : BLANK;
        if (a === null) return BLANK;
        return a / b;
      }
      case "ROUND": {
        const v = this.num(this.evalScalar(args[0], ctx));
        const d = args[1] ? this.num(this.evalScalar(args[1], ctx)) ?? 0 : 0;
        if (v === null) return BLANK;
        const f = 10 ** d;
        return Math.round(v * f) / f;
      }
      case "ABS": {
        const v = this.num(this.evalScalar(args[0], ctx));
        return v === null ? BLANK : Math.abs(v);
      }
      case "IF": {
        if (args.length < 2) throw new DaxError("IF takes a test, a value if true, and optionally a value if false.");
        return this.truthy(this.evalScalar(args[0], ctx))
          ? this.evalScalar(args[1], ctx)
          : args[2]
            ? this.evalScalar(args[2], ctx)
            : BLANK;
      }
      case "BLANK":
        return BLANK;
      case "ISBLANK":
        return this.evalScalar(args[0], ctx) === null;
      case "NOT":
        return !this.truthy(this.evalScalar(args[0], ctx));
      case "AND":
        return this.truthy(this.evalScalar(args[0], ctx)) && this.truthy(this.evalScalar(args[1], ctx));
      case "OR":
        return this.truthy(this.evalScalar(args[0], ctx)) || this.truthy(this.evalScalar(args[1], ctx));
      case "VALUES":
      case "DISTINCT": {
        const key = this.columnOf(args[0], fn);
        const vals = Array.from(new Set(this.visible(ctx).map((r) => r[key])));
        return { kind: "values", column: key, values: vals };
      }
      case "ALL":
      case "REMOVEFILTERS": {
        if (!args.length || args[0].k === "table") return { kind: "rows", rows: this.model.rows };
        const key = this.columnOf(args[0], fn);
        return { kind: "values", column: key, values: Array.from(new Set(this.model.rows.map((r) => r[key]))) };
      }
      case "FILTER": {
        const t = this.eval(args[0], ctx);
        if (!isTable(t)) throw new DaxError("FILTER's first argument must be a table.");
        if (t.kind === "values") {
          const key = t.column;
          return {
            kind: "values",
            column: key,
            values: t.values.filter((v) => this.truthy(this.evalScalar(args[1], { ...ctx, row: { [key]: v } as Partial<DaxRow> }))),
          };
        }
        return { kind: "rows", rows: t.rows.filter((r) => this.truthy(this.evalScalar(args[1], { ...ctx, row: r }))) };
      }
      case "SELECTEDVALUE": {
        const key = this.columnOf(args[0], fn);
        const vals = Array.from(new Set(this.visible(ctx).map((r) => r[key])));
        if (vals.length === 1) return vals[0];
        return args[1] ? this.evalScalar(args[1], ctx) : BLANK;
      }
      case "HASONEVALUE": {
        const key = this.columnOf(args[0], fn);
        return new Set(this.visible(ctx).map((r) => r[key])).size === 1;
      }
      case "CALCULATE": {
        if (!args.length) throw new DaxError("CALCULATE needs an expression to evaluate.");
        const base = this.transition(ctx);
        let next: Ctx = { ...base, depth: ctx.depth + 1 };
        for (const f of args.slice(1)) next = this.applyFilter(f, base, next);
        return this.evalScalar(args[0], next);
      }
      case "SUMX":
      case "AVERAGEX":
      case "MINX":
      case "MAXX":
      case "COUNTX": {
        if (args.length !== 2) throw new DaxError(`${fn} takes a table and an expression to evaluate for each row.`);
        const t = this.eval(args[0], ctx);
        if (!isTable(t)) throw new DaxError(`${fn}'s first argument must be a table, like Results or VALUES(${DAX_TABLE}[Player]).`);
        const rowsOf: Partial<DaxRow>[] =
          t.kind === "rows" ? t.rows : t.values.map((v) => ({ [t.column]: v }) as Partial<DaxRow>);
        const vals = rowsOf
          .map((row) => this.num(this.evalScalar(args[1], { ...ctx, row, depth: ctx.depth + 1 })))
          .filter((v): v is number => v !== null);
        if (fn === "COUNTX") return vals.length || BLANK;
        if (!vals.length) return BLANK;
        if (fn === "SUMX") return vals.reduce((a, b) => a + b, 0);
        if (fn === "AVERAGEX") return vals.reduce((a, b) => a + b, 0) / vals.length;
        return fn === "MINX" ? Math.min(...vals) : Math.max(...vals);
      }
      default:
        throw new DaxError(`${fn} isn't in this DAX engine. It has SUM, AVERAGE, MIN, MAX, COUNT, COUNTROWS, DISTINCTCOUNT, DIVIDE, ROUND, IF, CALCULATE, ALL, REMOVEFILTERS, ALLEXCEPT, KEEPFILTERS, FILTER, VALUES, SELECTEDVALUE, HASONEVALUE, ISBLANK and the X iterators.`);
    }
  }

  /** Evaluate a measure in a context of column = value filters. */
  measureIn(body: string, where: Partial<DaxRow>): Scalar {
    const filters: Filter[] = (Object.entries(where) as [keyof DaxRow, Scalar][]).map(([k, v]) => ({ column: k, test: (r) => r[k] === v }));
    return this.evalScalar(parse(body), { filters, row: null, depth: 0 });
  }
}

/** Parse only, to report a syntax error before anything runs. */
export function checkSyntax(text: string): string | null {
  try {
    parse(splitMeasure(text).body);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

// ── The matrix visual ──────────────────────────────────────────────

/** A report visual: rows by one column, optionally sliced to one value of another. */
export type DaxVisual = {
  rows: keyof DaxRow;
  /** Slicers: column = value, applied to every cell including the total. */
  slicers?: Partial<DaxRow>;
  /** Show the Total row (on by default, as in Power BI). */
  total?: boolean;
};

export type MatrixCell = { label: string; value: Scalar };
export type Matrix = { rows: MatrixCell[]; total: Scalar | undefined; error: string | null };

/**
 * Run a measure the way a matrix visual would: once per row value of the
 * visual's column, in that row's filter context, and once for the total.
 * Rows whose value is BLANK are hidden, as Power BI does.
 */
export function evaluateMatrix(text: string, visual: DaxVisual, model: DaxModel): Matrix {
  const { body } = splitMeasure(text);
  if (!body.trim()) return { rows: [], total: undefined, error: "Write a measure to see it in the visual." };
  try {
    const engine = new DaxEngine(model);
    const slicers = visual.slicers ?? {};
    const base = model.rows.filter((r) => (Object.entries(slicers) as [keyof DaxRow, Scalar][]).every(([k, v]) => r[k] === v));
    const values = Array.from(new Set(base.map((r) => r[visual.rows]))).sort((a, b) =>
      typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b)),
    );
    const rows: MatrixCell[] = [];
    for (const v of values) {
      const value = engine.measureIn(body, { ...slicers, [visual.rows]: v });
      if (value !== null) rows.push({ label: String(v), value });
    }
    const total = visual.total === false ? undefined : engine.measureIn(body, slicers);
    return { rows, total, error: null };
  } catch (e) {
    return { rows: [], total: undefined, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Format a cell the way a report would: one decimal for fractions, blank for BLANK. */
export function formatDax(v: Scalar | undefined): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return Number.isNaN(v) ? "NaN" : v > 0 ? "Infinity" : "-Infinity";
    return Number.isInteger(v) ? v.toLocaleString("en-US") : v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  return v;
}

/** Same numbers in the same rows (to the cent), same total. */
export function matricesMatch(a: Matrix, b: Matrix): boolean {
  const same = (x: Scalar | undefined, y: Scalar | undefined) => {
    if (typeof x === "number" && typeof y === "number") {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return Object.is(x, y);
      return Math.abs(x - y) < 0.005;
    }
    return x === y || String(x ?? "").toLowerCase() === String(y ?? "").toLowerCase();
  };
  if (a.error || b.error) return false;
  if (a.rows.length !== b.rows.length) return false;
  return a.rows.every((r, i) => r.label === b.rows[i].label && same(r.value, b.rows[i].value)) && same(a.total, b.total);
}
