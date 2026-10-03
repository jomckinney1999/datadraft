/**
 * Film Room: a query, replayed in the order the database runs it.
 *
 * SQL is written SELECT-first and run FROM-first, and that gap is where most
 * beginners get lost: they can't see why WHERE can't use a SUM, or why the
 * row count dropped from four thousand to ninety. This splits one statement
 * into the steps a database takes (each CTE, then FROM and its joins, WHERE,
 * GROUP BY, HAVING, SELECT, ORDER BY, LIMIT), and gives each step a runnable
 * statement whose result is the data as it stands after that step.
 *
 * Pure and DOM-free, so the verifier can plan every answer key in the bank
 * against the real database and fail when a step stops running.
 *
 * It's a reading of the query's top level, not a parser: it tracks strings,
 * comments and parentheses, finds the clause keywords that sit outside any
 * parentheses, and slices the text at them. A query it can't read (several
 * statements, VALUES, something odd) gets `null`, and the UI simply doesn't
 * offer a replay. The last step is always the statement itself, so the
 * replay can never end on a different answer from the one being replayed.
 */

export type StepKind =
  | "cte"
  | "part"
  | "combine"
  | "from"
  | "where"
  | "group"
  | "having"
  | "select"
  | "order"
  | "limit";

export type SqlStep = {
  kind: StepKind;
  /** The clause as a learner would name it: "FROM + JOIN", "WITH totals". */
  label: string;
  /** Runs before `body`: the WITH clause, when there is one. */
  prefix: string;
  /** The statement after the prefix; the data as it stands after this step. */
  body: string;
  /** Where this step's clause sits in the source, for highlighting. */
  ranges: [number, number][];
  /** A CTE's name, or the set operator of a compound select. */
  name?: string;
  /** FROM: whether it joins more than one table. */
  join?: boolean;
  /** SELECT: whether the rows it shapes are groups. */
  grouped?: boolean;
  /** SELECT: whether it says DISTINCT. */
  distinct?: boolean;
  /** Part: which arm of the compound, from 1. */
  part?: number;
};

export type StepPlan = { source: string; steps: SqlStep[] };

type Word = { word: string; upper: string; start: number; end: number; depth: number };
type Mark = { at: number; depth: number };

type Scan = {
  words: Word[];
  commas: Mark[];
  semis: Mark[];
  opens: Mark[];
  closes: Mark[];
  ok: boolean;
};

/** Words, commas, semicolons and brackets outside strings and comments. */
function scan(sql: string): Scan {
  const words: Word[] = [];
  const commas: Mark[] = [];
  const semis: Mark[] = [];
  const opens: Mark[] = [];
  const closes: Mark[] = [];
  let depth = 0;
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    if (c === "-" && sql[i + 1] === "-") {
      while (i < n && sql[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      i++;
      while (i < n) {
        if (sql[i] === c) {
          if (sql[i + 1] === c) {
            i += 2;
            continue;
          }
          break;
        }
        i++;
      }
      i++;
      continue;
    }
    if (c === "[") {
      const end = sql.indexOf("]", i + 1);
      i = end < 0 ? n : end + 1;
      continue;
    }
    if (c === "(") {
      opens.push({ at: i, depth });
      depth++;
      i++;
      continue;
    }
    if (c === ")") {
      depth--;
      closes.push({ at: i, depth });
      i++;
      continue;
    }
    if (c === ",") {
      commas.push({ at: i, depth });
      i++;
      continue;
    }
    if (c === ";") {
      semis.push({ at: i, depth });
      i++;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const start = i;
      while (i < n && /[A-Za-z0-9_$]/.test(sql[i])) i++;
      const word = sql.slice(start, i);
      words.push({ word, upper: word.toUpperCase(), start, end: i, depth });
      continue;
    }
    i++;
  }
  return { words, commas, semis, opens, closes, ok: depth === 0 };
}

const CLAUSES = ["FROM", "WHERE", "GROUP", "HAVING", "WINDOW", "ORDER", "LIMIT"] as const;
type Clause = (typeof CLAUSES)[number];
const SET_OPS = new Set(["UNION", "INTERSECT", "EXCEPT"]);

/** The SQL keywords that can't be a bare alias after an expression. */
const NOT_ALIAS = new Set([
  "END", "AND", "OR", "NOT", "NULL", "IS", "IN", "LIKE", "BETWEEN", "THEN", "ELSE", "WHEN", "CASE",
  "DESC", "ASC", "DISTINCT", "ALL", "AS", "ON", "TRUE", "FALSE",
]);

type SelectItem = { text: string; expr: string; alias: string | null };

function splitItems(src: string, from: number, to: number, commas: Mark[]): { text: string; start: number }[] {
  const cuts = commas.filter((c) => c.depth === 0 && c.at > from && c.at < to).map((c) => c.at);
  const out: { text: string; start: number }[] = [];
  let at = from;
  for (const cut of [...cuts, to]) {
    const raw = src.slice(at, cut);
    const lead = raw.length - raw.trimStart().length;
    if (raw.trim()) out.push({ text: raw.trim(), start: at + lead });
    at = cut + 1;
  }
  return out;
}

function readItem(text: string): SelectItem {
  const as = /^([\s\S]*?\S)\s+AS\s+("[^"]+"|`[^`]+`|\[[^\]]+\]|[A-Za-z_][\w$]*)\s*$/i.exec(text);
  if (as) return { text, expr: as[1], alias: as[2].replace(/^["`[]|["`\]]$/g, "") };
  const bare = /^([\s\S]*?[\w)"'\]])\s+([A-Za-z_][\w$]*)\s*$/.exec(text);
  if (bare && !NOT_ALIAS.has(bare[2].toUpperCase()) && !/\.\s*$/.test(bare[1])) {
    return { text, expr: bare[1], alias: bare[2] };
  }
  return { text, expr: text, alias: null };
}

/**
 * Plan a replay of one SQL statement, or null when it can't be read.
 */
export function planSteps(input: string): StepPlan | null {
  const all = scan(input);
  if (!all.ok) return null;

  // One statement: trailing semicolons are fine, a second statement isn't.
  let end = input.length;
  const topSemis = all.semis.filter((s) => s.depth === 0);
  for (const s of topSemis) {
    if (input.slice(s.at + 1).replace(/--[^\n]*|\/\*[\s\S]*?\*\/|[\s;]/g, "") !== "") return null;
    end = Math.min(end, s.at);
  }
  const source = input.slice(0, end).replace(/\s+$/, "");
  if (!source.trim()) return null;

  const { words, commas, opens, closes } = scan(source);
  const top = words.filter((w) => w.depth === 0);
  if (!top.length) return null;

  // ── WITH: each CTE is a step of its own ─────────────────────────
  const steps: SqlStep[] = [];
  let prefix = "";
  let mainStart = top[0].start;
  if (top[0].upper === "WITH") {
    const withStart = top[0].start;
    let at = top[0].end;
    const recursive = top[1]?.upper === "RECURSIVE";
    if (recursive) at = top[1].end;
    const ctes: { name: string; start: number; end: number }[] = [];
    for (;;) {
      const m = /^\s*("[^"]+"|`[^`]+`|\[[^\]]+\]|[A-Za-z_][\w$]*)/.exec(source.slice(at));
      if (!m) return null;
      const name = m[1];
      const nameEnd = at + m[0].length;
      const nameStart = nameEnd - name.length;
      // The body is the first top-level bracket after AS.
      const asWord = top.find((w) => w.start >= nameEnd && w.upper === "AS");
      if (!asWord) return null;
      const open = opens.find((o) => o.depth === 0 && o.at > asWord.end);
      if (!open) return null;
      const close = closes.find((c) => c.depth === 0 && c.at > open.at);
      if (!close) return null;
      ctes.push({ name, start: nameStart, end: close.at + 1 });
      at = close.at + 1;
      const comma = /^\s*,/.exec(source.slice(at));
      if (comma) {
        at += comma[0].length;
        continue;
      }
      break;
    }
    ctes.forEach((cte) => {
      steps.push({
        kind: "cte",
        label: `WITH ${cte.name}`,
        prefix: `${source.slice(withStart, cte.end)}\n`,
        body: `SELECT * FROM ${cte.name}`,
        ranges: [[cte.start, cte.end]],
        name: cte.name,
      });
    });
    prefix = `${source.slice(withStart, ctes[ctes.length - 1].end)}\n`;
    const next = top.find((w) => w.start >= at);
    if (!next) return null;
    mainStart = next.start;
  }

  const main = top.filter((w) => w.start >= mainStart);
  if (main[0]?.upper !== "SELECT") return null;
  const full = source.slice(mainStart);
  const finish = (): StepPlan => {
    // The last step is the statement itself, so the replay ends on its answer.
    const last = steps[steps.length - 1];
    if (last) last.body = full;
    return { source, steps };
  };

  // Clause keywords at the top level of the main statement.
  const at = (kw: Clause | string, after = mainStart): Word | undefined =>
    main.find((w, i) => {
      if (w.start < after || w.upper !== kw) return false;
      if (kw === "GROUP" || kw === "ORDER") return main[i + 1]?.upper === "BY";
      return true;
    });

  // ── A compound select: each part, then the operator, then the tail ──
  const ops = main.filter((w) => SET_OPS.has(w.upper));
  if (ops.length) {
    const lastOp = ops[ops.length - 1];
    const order = at("ORDER", lastOp.end);
    const limit = at("LIMIT", lastOp.end);
    const tail = order?.start ?? limit?.start ?? source.length;
    const opRanges: [number, number][] = [];
    let armStart = mainStart;
    let part = 1;
    const opName = (w: Word) => {
      const nextWord = main[main.indexOf(w) + 1];
      return nextWord?.upper === "ALL" ? `${w.upper} ALL` : w.upper;
    };
    for (const op of [...ops, null]) {
      const armEnd = op ? op.start : tail;
      const arm = source.slice(armStart, armEnd).trim();
      steps.push({
        kind: "part",
        label: `Part ${part}`,
        prefix,
        body: arm,
        ranges: [[armStart, armStart + source.slice(armStart, armEnd).trimEnd().length]],
        part,
      });
      part++;
      if (op) {
        const name = opName(op);
        const opEnd = name.endsWith("ALL") ? main[main.indexOf(op) + 1].end : op.end;
        opRanges.push([op.start, opEnd]);
        armStart = opEnd;
      }
    }
    const names = Array.from(new Set(ops.map(opName)));
    steps.push({
      kind: "combine",
      label: names.join(" + "),
      prefix,
      body: source.slice(mainStart, tail).trim(),
      ranges: opRanges,
      name: names.join(" + "),
    });
    if (order) {
      steps.push({
        kind: "order",
        label: "ORDER BY",
        prefix,
        body: source.slice(mainStart, limit?.start ?? source.length).trim(),
        ranges: [[order.start, (limit?.start ?? source.length)]],
      });
    }
    if (limit) {
      steps.push({ kind: "limit", label: "LIMIT", prefix, body: full, ranges: [[limit.start, source.length]] });
    }
    return finish();
  }

  // ── A single SELECT ────────────────────────────────────────────
  const marks = new Map<Clause, Word>();
  let after = main[0].end;
  for (const kw of CLAUSES) {
    const w = at(kw, after);
    if (w) {
      marks.set(kw, w);
      after = w.end;
    }
  }
  const startOf = (kw: Clause) => marks.get(kw)?.start;
  const endOf = (kw: Clause): number => {
    const i = CLAUSES.indexOf(kw);
    for (const later of CLAUSES.slice(i + 1)) {
      const s = startOf(later);
      if (s !== undefined) return s;
    }
    return source.length;
  };
  const text = (kw: Clause) => (marks.has(kw) ? source.slice(startOf(kw)!, endOf(kw)).trim() : "");
  const range = (kw: Clause): [number, number] => {
    const s = startOf(kw)!;
    return [s, s + source.slice(s, endOf(kw)).trimEnd().length];
  };

  const selectStart = main[0].start;
  const fromAt = startOf("FROM");
  const selectEnd = fromAt ?? endOf("FROM");
  const selectRange: [number, number] = [selectStart, selectStart + source.slice(selectStart, selectEnd).trimEnd().length];
  const selectText = source.slice(selectStart, selectEnd).trim();
  const distinct = main[1]?.upper === "DISTINCT";

  if (fromAt === undefined) {
    steps.push({ kind: "select", label: "SELECT", prefix, body: full, ranges: [selectRange] });
    return finish();
  }

  const from = text("FROM");
  const where = text("WHERE");
  const group = text("GROUP");
  const having = text("HAVING");
  const windowClause = text("WINDOW");
  const fromRange = range("FROM");
  const join =
    main.some((w) => w.upper === "JOIN" && w.start > fromRange[0] && w.start < fromRange[1]) ||
    commas.some((c) => c.depth === 0 && c.at > fromRange[0] && c.at < fromRange[1]);

  steps.push({
    kind: "from",
    label: join ? "FROM + JOIN" : "FROM",
    prefix,
    body: `SELECT *\n${from}`,
    ranges: [fromRange],
    join,
  });

  if (where) {
    steps.push({ kind: "where", label: "WHERE", prefix, body: `SELECT *\n${from}\n${where}`, ranges: [range("WHERE")] });
  }

  const tail = [from, where, group, having, windowClause].filter(Boolean).join("\n");

  if (group) {
    // The groups themselves: the keys, and how many rows fell into each.
    const groupWord = marks.get("GROUP")!;
    const byWord = main[main.indexOf(groupWord) + 1];
    const bodyStart = byWord.end;
    const itemsEnd = endOf("GROUP");
    const select = splitItems(source, main[distinct ? 1 : 0].end, selectEnd, commas).map((it) => readItem(it.text));
    const keys = splitItems(source, bodyStart, itemsEnd, commas).map(({ text: key }) => {
      if (/^\d+$/.test(key)) return select[Number(key) - 1]?.text ?? key;
      const named = select.find((s) => s.alias && s.alias.toLowerCase() === key.toLowerCase());
      return named && named.expr.trim().toLowerCase() !== key.toLowerCase() ? `${named.expr} AS ${named.alias}` : key;
    });
    const ordinals = keys.map((_, i) => String(i + 1)).join(", ");
    steps.push({
      kind: "group",
      label: "GROUP BY",
      prefix,
      body: `SELECT ${keys.join(", ")}, COUNT(*) AS rows_in_group\n${[from, where].filter(Boolean).join("\n")}\nGROUP BY ${ordinals}`,
      ranges: [range("GROUP")],
    });
  }

  if (having) {
    // HAVING is shown in the final columns: it usually names them, and a
    // separate SELECT step after it would repeat the same rows.
    steps.push({
      kind: "having",
      label: "HAVING",
      prefix,
      body: `${selectText}\n${tail}`,
      ranges: [range("HAVING"), selectRange],
      grouped: true,
    });
  } else {
    steps.push({
      kind: "select",
      label: distinct ? "SELECT DISTINCT" : "SELECT",
      prefix,
      body: `${selectText}\n${tail}`,
      ranges: windowClause ? [selectRange, range("WINDOW")] : [selectRange],
      grouped: Boolean(group),
      distinct,
    });
  }

  if (marks.has("ORDER")) {
    const limitAt = startOf("LIMIT");
    steps.push({
      kind: "order",
      label: "ORDER BY",
      prefix,
      body: source.slice(mainStart, limitAt ?? source.length).trim(),
      ranges: [range("ORDER")],
    });
  }
  if (marks.has("LIMIT")) {
    steps.push({ kind: "limit", label: "LIMIT", prefix, body: full, ranges: [range("LIMIT")] });
  }
  return finish();
}

/** A step's statement, whole. */
export function stepSql(step: SqlStep): string {
  return `${step.prefix}${step.body}`;
}

/** How many rows the step leaves, without materialising them. */
export function stepCountSql(step: SqlStep): string {
  return `${step.prefix}SELECT COUNT(*) FROM (\n${step.body}\n)`;
}

/** What the step does, in a sentence, given the rows before and after it. */
export function narrateStep(step: SqlStep, rows: number, before: number | null, last: boolean): string {
  const n = rows.toLocaleString("en-US");
  const was = before === null ? null : before.toLocaleString("en-US");
  const noun = (k: number, one: string, many: string) => (k === 1 ? one : many);
  const r = noun(rows, "row", "rows");
  let line: string;
  switch (step.kind) {
    case "cte":
      line = `First, build ${step.name}: ${n} ${r}. Everything after this can read it like a table.`;
      break;
    case "part":
      line = `Part ${step.part} runs on its own: ${n} ${r}.`;
      break;
    case "combine":
      line =
        step.name === "UNION ALL"
          ? `UNION ALL stacks the parts on top of each other: ${n} ${r}.`
          : step.name === "UNION"
            ? `UNION stacks the parts and drops exact repeats: ${n} ${r}.`
            : `${step.name} combines the parts: ${n} ${r}.`;
      break;
    case "from":
      line = step.join
        ? `FROM runs first. The join lines the tables up side by side: ${n} ${r} to work with.`
        : `FROM runs first: ${n} ${r} to work with.`;
      break;
    case "where":
      line = `WHERE checks every row and keeps ${n} of ${was ?? "them"}.`;
      break;
    case "group":
      line = `GROUP BY folds ${was === null ? "the rows" : `those ${was} ${noun(before ?? 0, "row", "rows")}`} into ${n} ${noun(rows, "group", "groups")}. rows_in_group shows how many landed in each.`;
      break;
    case "having":
      line = `HAVING checks each group and keeps ${n} of ${was ?? "them"}.`;
      break;
    case "select":
      line = step.grouped
        ? `SELECT builds one row per group, in the columns you return.`
        : step.distinct
          ? `SELECT builds the columns you return, and DISTINCT drops repeats: ${n} ${r}.`
          : `SELECT builds the columns you return. Same ${n} ${r}.`;
      break;
    case "order":
      line = `ORDER BY sorts them. Same ${n} ${r}, now in order.`;
      break;
    case "limit":
      line = `LIMIT stops after ${n}.`;
      break;
  }
  return last ? `${line} That's the result.` : line;
}
