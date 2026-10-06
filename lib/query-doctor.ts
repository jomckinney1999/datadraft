/**
 * Query Doctor — "why is my query wrong?", answered without the answer.
 *
 * Grading says right or wrong. This says why, from three things it can see:
 * the error SQLite raised, the learner's result next to the answer key's,
 * and the text of the learner's query. Every finding talks about the SHAPE of
 * the mistake: which column, which clause, what kind of difference. Never a
 * value from the answer, because a diagnosis that leaks the answer is just
 * the answer with extra steps.
 *
 * Pure and DOM-free: the question workspace, the mock interview report and
 * the verifier all call it with plain grids. No AI involved; the coach
 * (`/api/coach`, mode "diagnose") can add a conversational layer on top when
 * it is switched on, and these findings are what it is given to work from.
 */

export type Grid = { columns: string[]; values: (string | number | null | Uint8Array)[][] };

export type Finding = {
  /** Stable id, for tests and analytics. */
  kind: string;
  /** One line, bold in the UI. */
  title: string;
  /** One or two sentences on what to change. */
  detail: string;
};

export type DoctorInput = {
  sql: string;
  /** The error SQLite raised, if the query didn't run. */
  error?: string | null;
  mine?: Grid | null;
  key?: Grid | null;
  orderMatters?: boolean;
  /** Tables and columns the question can use, for "did you mean". */
  schema?: { name: string; columns: string[] }[];
};

const MAX_FINDINGS = 3;
/** A word boundary for built regexes. Never an escaped b in a template literal: the server minifier turns it into a backspace. */
const WB = /\b/.source;

// ── Small helpers ─────────────────────────────────────────────────
const lc = (s: string) => s.toLowerCase();
const code = (s: string) => `\`${s}\``;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** The closest name in `pool`, if it's close enough to be a typo or a guess. */
function closest(word: string, pool: string[]): string | null {
  const w = lc(word);
  let best: { name: string; d: number } | null = null;
  for (const name of pool) {
    const n = lc(name);
    // A guess like `pts` for `fantasy_pts` is a containment, not a typo.
    const d = n.includes(w) || w.includes(n) ? 1 : editDistance(w, n);
    if (!best || d < best.d) best = { name, d };
  }
  return best && best.d <= Math.max(2, Math.floor(word.length / 3)) ? best.name : null;
}

const cell = (v: unknown) => (v instanceof Uint8Array ? "[blob]" : v);
const isNum = (v: unknown): v is number => typeof v === "number";
const norm = (v: unknown) => (isNum(v) ? Math.round(v * 1000) / 1000 : v === null ? null : String(cell(v)));
const rowKey = (row: unknown[]) => JSON.stringify(row.map(norm));

function decimals(values: unknown[]): number {
  let most = 0;
  values.forEach((v) => {
    if (isNum(v) && !Number.isInteger(v)) {
      const s = String(Math.round(v * 1e6) / 1e6);
      const d = s.includes(".") ? s.split(".")[1].length : 0;
      most = Math.max(most, d);
    }
  });
  return most;
}

/** Strip comments and string literals, so a keyword inside a quote doesn't count. */
function bare(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/'(?:[^']|'')*'/g, "''");
}

// ── Errors ────────────────────────────────────────────────────────
const MISSING_FUNCTIONS: Record<string, string> = {
  datediff: "SQLite has no DATEDIFF. Subtract dates with julianday(a) - julianday(b).",
  year: "SQLite has no YEAR(). Use strftime('%Y', date_column).",
  month: "SQLite has no MONTH(). Use strftime('%m', date_column).",
  now: "SQLite has no NOW(). Use date('now') or datetime('now').",
  getdate: "SQLite has no GETDATE(). Use date('now').",
  len: "SQLite spells it LENGTH(), not LEN().",
  isnull: "SQLite uses IFNULL(x, fallback) or COALESCE(x, fallback), not ISNULL().",
  median: "SQLite has no MEDIAN(). Sort the values and take the middle one, with ROW_NUMBER() and COUNT(*).",
  concat: "Join text in SQLite with || — 'a' || 'b'.",
  if: "SQLite has no IF(). Use CASE WHEN … THEN … ELSE … END, or IIF(condition, a, b).",
  stdev: "SQLite has no STDEV(). Compute it from AVG(x*x) - AVG(x)*AVG(x), then SQRT if your build has it.",
};

function diagnoseError(input: DoctorInput): Finding[] {
  const msg = input.error ?? "";
  const sql = bare(input.sql);
  const tables = (input.schema ?? []).map((t) => t.name);
  const columns = Array.from(new Set((input.schema ?? []).flatMap((t) => t.columns)));
  const out: Finding[] = [];

  let m: RegExpExecArray | null;
  if ((m = /no such column: ([\w.]+)/i.exec(msg))) {
    const name = m[1].split(".").pop()!;
    const guess = closest(name, columns);
    out.push({
      kind: "no-such-column",
      title: `There's no column called ${code(m[1])}.`,
      detail: guess
        ? `Did you mean ${code(guess)}? Column names have to match the table exactly.`
        : "Check the table panel for the exact column names. If it's an alias you made with AS, WHERE can't see it — WHERE runs before SELECT.",
    });
  } else if ((m = /no such table: ([\w.]+)/i.exec(msg))) {
    const guess = closest(m[1], tables);
    out.push({
      kind: "no-such-table",
      title: `There's no table called ${code(m[1])}.`,
      detail: guess ? `Did you mean ${code(guess)}?` : `The tables here are ${tables.map(code).join(", ")}.`,
    });
  } else if ((m = /ambiguous column name: ([\w.]+)/i.exec(msg))) {
    out.push({
      kind: "ambiguous-column",
      title: `More than one table has a ${code(m[1])} column.`,
      detail: `Say which one you mean with the table's alias, like ${code(`w.${m[1]}`)}.`,
    });
  } else if (/misuse of (aggregate|window)/i.test(msg)) {
    out.push({
      kind: "aggregate-in-where",
      title: "An aggregate can't go in WHERE.",
      detail:
        "WHERE filters single rows before anything is grouped, so SUM, AVG or COUNT don't exist yet. Filter groups with HAVING, after GROUP BY.",
    });
  } else if (/GROUP BY clause is required before HAVING|HAVING clause on a non-aggregate query/i.test(msg)) {
    out.push({
      kind: "having-without-group",
      title: "HAVING needs a GROUP BY.",
      detail: "HAVING filters groups. If you meant to filter rows, use WHERE; if you meant groups, add GROUP BY first.",
    });
  } else if ((m = /no such function: (\w+)/i.exec(msg))) {
    const fn = lc(m[1]);
    out.push({
      kind: "no-such-function",
      title: `SQLite doesn't have ${code(m[1].toUpperCase() + "()")}.`,
      detail: MISSING_FUNCTIONS[fn] ?? "Every database has its own function list; this one is SQLite.",
    });
  } else if (/incomplete input|unterminated|unrecognized token/i.test(msg)) {
    const open = (sql.match(/\(/g) ?? []).length - (sql.match(/\)/g) ?? []).length;
    const quotes = (input.sql.match(/'/g) ?? []).length % 2;
    out.push({
      kind: "incomplete",
      title: "The query stops before it's finished.",
      detail:
        open > 0
          ? `There ${open === 1 ? "is an opening parenthesis" : `are ${open} opening parentheses`} without a closing one.`
          : quotes
            ? "There's a quote mark without its partner. Text goes in single quotes: 'QB'."
            : "Look for a missing closing parenthesis or quote at the end.",
    });
  } else if ((m = /near "([^"]+)": syntax error/i.exec(msg))) {
    const near = m[1];
    if (/,\s*(FROM|WHERE|GROUP|ORDER|LIMIT)\b/i.test(sql)) {
      out.push({
        kind: "trailing-comma",
        title: "There's a comma before a keyword.",
        detail: "The last column before FROM (or the last item in a list) doesn't take a comma.",
      });
    } else if (/^top$/i.test(near) || /\bSELECT\s+TOP\b/i.test(sql)) {
      out.push({
        kind: "top",
        title: "SQLite doesn't have TOP.",
        detail: "Put LIMIT at the very end instead: ORDER BY … LIMIT 5.",
      });
    } else {
      const order = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT"];
      const at = order.map((k) => sql.toUpperCase().search(new RegExp(`${WB}${k.replace(" ", "\\s+")}${WB}`)));
      const seen = at.map((p, i) => ({ k: order[i], p })).filter((x) => x.p >= 0);
      const outOfOrder = seen.some((x, i) => i > 0 && x.p < seen[i - 1].p);
      out.push(
        outOfOrder
          ? {
              kind: "clause-order",
              title: "The clauses are in the wrong order.",
              detail: "SQL wants SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT, in that order.",
            }
          : {
              kind: "syntax",
              title: `SQLite got lost near ${code(near)}.`,
              detail: "Read the line around it for a missing comma between columns, a missing keyword, or a stray character.",
            },
      );
    }
  } else if (msg) {
    out.push({ kind: "error", title: "The query didn't run.", detail: `SQLite says: ${msg}` });
  }
  return out;
}

/**
 * The classic LEFT JOIN trap: a WHERE condition on the joined table throws
 * away exactly the rows the LEFT JOIN kept (their columns are NULL), so the
 * query quietly behaves like an inner join.
 */
function whereOnLeftJoined(sql: string): boolean {
  const m = /\bLEFT\s+(?:OUTER\s+)?JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/i.exec(sql);
  if (!m) return false;
  const alias = m[2] && !/^(ON|USING|WHERE|LEFT|JOIN|INNER)$/i.test(m[2]) ? m[2] : m[1];
  const where = /\bWHERE\b([\s\S]*?)(\bGROUP\s+BY\b|\bORDER\s+BY\b|\bLIMIT\b|$)/i.exec(sql);
  if (!where) return false;
  const cond = where[1];
  if (new RegExp(`${WB}${alias}\\.\\w+\\s+IS\\s+(NOT\\s+)?NULL`, "i").test(cond)) return false;
  return new RegExp(`${WB}${alias}\\.\\w+`, "i").test(cond);
}

// ── Results ───────────────────────────────────────────────────────
function textHints(sql: string): Finding[] {
  const s = bare(sql);
  const raw = sql.replace(/--[^\n]*/g, " ");
  const out: Finding[] = [];
  if (/(=|!=|<>)\s*NULL\b/i.test(s)) {
    out.push({
      kind: "equals-null",
      title: "= NULL is never true.",
      detail: "NULL means unknown, and nothing equals unknown. Use IS NULL or IS NOT NULL.",
    });
  }
  if (/'[a-z]{2}'/.test(raw) && /\b(position|team)\b/i.test(s)) {
    out.push({
      kind: "case-sensitive",
      title: "Text comparisons are case-sensitive.",
      detail: "Positions and teams are stored in capitals, so 'qb' matches nothing. Use 'QB'.",
    });
  }
  return out;
}

function diagnoseResult(input: DoctorInput): Finding[] {
  const mine = input.mine;
  const key = input.key;
  if (!key) return [];
  const out: Finding[] = [];
  const keyRows = key.values.length;
  const sql = bare(input.sql);

  if (!mine || mine.columns.length === 0 || mine.values.length === 0) {
    out.push({
      kind: "no-rows",
      title: "Your query returned no rows.",
      detail: `The answer has ${plural(keyRows, "row")}. Something is filtering everything out: a WHERE that can't be true, or a join on columns that never match.`,
    });
    return [...out, ...textHints(input.sql)];
  }

  // Columns, matched without regard to case.
  const mineCols = mine.columns.map(lc);
  const keyCols = key.columns.map(lc);
  const missing = keyCols.filter((c) => !mineCols.includes(c));
  const extra = mineCols.filter((c) => !keyCols.includes(c));

  // A missing column whose values are all present in an extra one is an alias problem.
  const colValues = (g: Grid, i: number) => g.values.map((r) => norm(r[i])).map(String).sort().join("|");
  const renamed: { have: string; want: string }[] = [];
  missing.forEach((want) => {
    const ki = keyCols.indexOf(want);
    const kv = colValues(key, ki);
    const hit = extra.find((have) => colValues(mine, mineCols.indexOf(have)) === kv);
    if (hit) renamed.push({ have: mine.columns[mineCols.indexOf(hit)], want: key.columns[ki] });
  });
  if (renamed.length) {
    renamed.forEach((r) =>
      out.push({
        kind: "rename",
        title: `${code(r.have)} has the right numbers but the wrong name.`,
        detail: `Name it ${code(r.want)} with AS. Results are checked by column name.`,
      }),
    );
  }
  const stillMissing = missing.filter((m) => !renamed.some((r) => lc(r.want) === m));
  const stillExtra = extra.filter((e) => !renamed.some((r) => lc(r.have) === e));
  if (stillMissing.length) {
    out.push({
      kind: "missing-column",
      title: `Missing ${stillMissing.length === 1 ? "column" : "columns"}: ${stillMissing.map((c) => code(key.columns[keyCols.indexOf(c)])).join(", ")}.`,
      detail: "The question's Return line lists every column the answer needs.",
    });
  }
  if (stillExtra.length) {
    out.push({
      kind: "extra-column",
      title: `Extra ${stillExtra.length === 1 ? "column" : "columns"}: ${stillExtra.map((c) => code(mine.columns[mineCols.indexOf(c)])).join(", ")}.`,
      detail: "Return exactly the columns asked for. An extra column can also split one group into several.",
    });
  }
  if (!missing.length && !extra.length && mineCols.join() !== keyCols.join()) {
    out.push({
      kind: "column-order",
      title: "Right columns, wrong order.",
      detail: `List them in SELECT as ${key.columns.map(code).join(", ")}.`,
    });
  }
  if (out.length) return out.slice(0, MAX_FINDINGS);

  // Same columns from here on. Line mine up with the key's column order.
  const order = keyCols.map((c) => mineCols.indexOf(c));
  const mv = mine.values.map((r) => order.map((i) => r[i]));
  const kv = key.values;
  const mineRows = mv.length;

  if (mineRows > keyRows) {
    const dupes = mineRows - new Set(mv.map(rowKey)).size;
    const keyDupes = keyRows - new Set(kv.map(rowKey)).size;
    const allThere = kv.every((r) => mv.some((x) => rowKey(x) === rowKey(r)));
    if (dupes > keyDupes) {
      out.push({
        kind: "duplicates",
        title: `Some rows repeat (${plural(dupes - keyDupes, "extra copy", "extra copies")}).`,
        detail: /\bJOIN\b/i.test(sql)
          ? "A join that matches more than once multiplies rows. Check the ON condition matches on every column it should, or GROUP BY the thing you're counting."
          : "Use DISTINCT, or GROUP BY the thing each row should represent.",
      });
    } else if (allThere) {
      const n = mineRows - keyRows;
      out.push({
        kind: "too-many-rows",
        title: `Every right row is there, plus ${plural(n, "row")} that shouldn't be.`,
        detail: /\bLIMIT\b/i.test(sql)
          ? "Your filter lets too much through, or the LIMIT is bigger than the question asks."
          : "Your filter lets too much through. Re-read the question for a condition you haven't written, or a top-N that needs a LIMIT.",
      });
    } else {
      out.push({
        kind: "row-count",
        title: `You returned ${plural(mineRows, "row")}; the answer has ${keyRows}.`,
        detail: /\bGROUP BY\b/i.test(sql)
          ? "Check what you're grouping by: one group per row of the answer."
          : "Check the filter, the grouping and the LIMIT.",
      });
    }
  } else if (mineRows < keyRows) {
    const keyHasNull = kv.some((r) => r.some((v) => v === null));
    const mineHasNull = mv.some((r) => r.some((v) => v === null));
    const allRight = mv.every((r) => kv.some((x) => rowKey(x) === rowKey(r)));
    if (whereOnLeftJoined(sql)) {
      out.push({
        kind: "left-join-where",
        title: "Your WHERE undoes the LEFT JOIN.",
        detail:
          "The rows the LEFT JOIN kept have NULLs in the joined table's columns, and a WHERE condition on those columns throws them away again. Move that condition into the ON clause.",
      });
    } else if (keyHasNull && !mineHasNull && /\bJOIN\b/i.test(sql) && !/\bLEFT\s+(OUTER\s+)?JOIN\b/i.test(sql)) {
      out.push({
        kind: "inner-vs-left",
        title: "The answer keeps rows with nothing to match.",
        detail: "An inner JOIN drops a row when the other table has no partner for it. A LEFT JOIN keeps it, with NULLs.",
      });
    } else if (allRight) {
      out.push({
        kind: "too-few-rows",
        title: `Every row you returned is right, but ${plural(keyRows - mineRows, "row is", "rows are")} missing.`,
        detail: /\bLIMIT\b/i.test(sql)
          ? "Is the LIMIT smaller than the question asks, or a filter stricter than it says?"
          : "A filter is stricter than the question, or a join is dropping rows.",
      });
    } else {
      out.push({
        kind: "row-count",
        title: `You returned ${plural(mineRows, "row")}; the answer has ${keyRows}.`,
        detail: "Check the filter, the grouping and the LIMIT.",
      });
    }
  } else {
    // Same columns, same row count.
    const sortedMine = mv.map(rowKey).sort().join("\n");
    const sortedKey = kv.map(rowKey).sort().join("\n");
    if (sortedMine === sortedKey) {
      const reversed = mv.slice().reverse().map(rowKey).join("\n") === kv.map(rowKey).join("\n");
      out.push(
        reversed
          ? { kind: "reversed", title: "Right rows, upside down.", detail: "Flip the sort: DESC puts the biggest first, ASC (the default) the smallest." }
          : {
              kind: "order",
              title: "Right rows, wrong order.",
              detail: "Check the ORDER BY: which column, which direction, and a tie-break for rows that share a value.",
            },
      );
    } else if (/\bLIMIT\b/i.test(sql) && /\bORDER\s+BY\b/i.test(sql) && !mv.some((r) => kv.some((x) => rowKey(x) === rowKey(r)))) {
      out.push({
        kind: "limit-sort",
        title: "Your LIMIT kept different rows than the answer's.",
        detail: "With a LIMIT, the ORDER BY decides which rows survive. Check the column you sort by, and DESC (biggest first) against ASC.",
      });
    } else {
      out.push(...columnDiffs(mv, kv, key.columns, sql));
    }
  }

  return [...out, ...textHints(input.sql)].slice(0, MAX_FINDINGS);
}

/** Same shape, different values: which column, and what kind of difference. */
function columnDiffs(mv: unknown[][], kv: unknown[][], names: string[], sql: string): Finding[] {
  const out: Finding[] = [];
  // A column holding the same values as the answer (in any order) is not the
  // problem. Pair rows by those columns, so a wrong number lines up with the
  // row it belongs to rather than wherever a different sort put it.
  const agrees = names.map((_, i) => {
    const a = mv.map((r) => String(norm(r[i]))).sort().join("|");
    const b = kv.map((r) => String(norm(r[i]))).sort().join("|");
    return a === b;
  });
  const sortBy = (rows: unknown[][]) =>
    rows.slice().sort((x, y) => {
      const kx = JSON.stringify(x.map((v, i) => (agrees[i] ? norm(v) : 0)));
      const ky = JSON.stringify(y.map((v, i) => (agrees[i] ? norm(v) : 0)));
      return kx < ky ? -1 : kx > ky ? 1 : 0;
    });
  const pm = sortBy(mv);
  const pk = sortBy(kv);

  names.forEach((name, i) => {
    if (agrees[i]) return;
    const a = pm.map((r) => r[i]);
    const b = pk.map((r) => r[i]);
    if (a.every((v, j) => norm(v) === norm(b[j]))) return;
    const nums = a.every(isNum) && b.every(isNum);
    if (nums) {
      const an = a as number[];
      const bn = b as number[];
      const keyDp = decimals(bn);
      const close = an.every((v, j) => Math.abs(v - bn[j]) <= 0.5 * Math.pow(10, -keyDp) + 1e-9);
      if (close && decimals(an) !== keyDp) {
        out.push({
          kind: "rounding",
          title: `${code(name)} is off by rounding.`,
          detail: keyDp === 0 ? `The answer has ${code(name)} as whole numbers.` : `The answer rounds ${code(name)} to ${plural(keyDp, "decimal place")}: ROUND(x, ${keyDp}).`,
        });
        return;
      }
      if (an.every(Number.isInteger) && !bn.every(Number.isInteger) && an.every((v, j) => v === Math.trunc(bn[j]) || v === Math.floor(bn[j]))) {
        out.push({
          kind: "integer-division",
          title: `${code(name)} looks like integer division.`,
          detail: "In SQLite, 7 / 2 is 3: two whole numbers divide into a whole number. Multiply one side by 1.0 first, or use AVG.",
        });
        return;
      }
      const ratios = an.map((v, j) => (bn[j] === 0 ? null : v / bn[j])).filter((r): r is number => r !== null);
      if (ratios.length >= 3 && ratios.every((r) => Math.abs(r - ratios[0]) < 1e-6) && Math.abs(ratios[0] - 1) > 1e-6) {
        const r = ratios[0];
        out.push({
          kind: "scaled",
          title: `${code(name)} is off by the same factor in every row (×${Math.round(r * 100) / 100}).`,
          detail:
            Math.abs(r - 100) < 1e-6 || Math.abs(r - 0.01) < 1e-6
              ? "A percentage against a fraction: one of you multiplied by 100."
              : r > 1
                ? "Every row is counted more than once — usually a join fanning out, or SUM where you meant one value."
                : "Every value is too small by the same amount — a divide by the wrong total?",
        });
        return;
      }
    }
    if (nums && /\bJOIN\b/i.test(sql)) {
      const an = a as number[];
      const bn = b as number[];
      if (an.every((v, j) => v >= bn[j]) && an.some((v, j) => v > bn[j])) {
        out.push({
          kind: "fan-out",
          title: `${code(name)} is too big wherever it's wrong.`,
          detail: "A join that matches several rows per row multiplies them before you count or add. Join on everything that makes a match unique, or aggregate before you join.",
        });
        return;
      }
    }
    out.push({
      kind: "values",
      title: `${code(name)} doesn't match the answer.`,
      detail: nums
        ? "Check the calculation behind it: which rows go in, and which aggregate (SUM, AVG, COUNT, MAX)."
        : "Different names or labels: check the filter, the join, or the CASE that makes it.",
    });
  });
  if (!out.length) {
    out.push({
      kind: "values",
      title: "Same columns and row count, different values.",
      detail: "Check the calculation and the filter.",
    });
  }
  return out;
}

export function diagnoseSql(input: DoctorInput): Finding[] {
  const found = input.error ? diagnoseError(input) : diagnoseResult(input);
  return found.slice(0, MAX_FINDINGS);
}
