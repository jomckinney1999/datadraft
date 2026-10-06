/**
 * A small syntax tokenizer for the three languages the lesson player runs.
 *
 * Deliberately not a parser: it never has to be *correct*, only stable and
 * fast enough to re-run on every keystroke. It returns plain token objects so
 * the editor can render React elements — nothing here produces HTML, so
 * learner input can never become markup.
 */

export type TokenKind =
  | "keyword"
  | "string"
  | "number"
  | "func"
  | "comment"
  | "punct"
  | "table"
  | "plain";

export type Token = { text: string; kind: TokenKind };

export type HighlightLang = "sql" | "python" | "r" | "excel";

const SQL_KEYWORDS = `select from where group by having order limit offset join inner left right full outer on as and or not in between like is null distinct count sum avg min max round case when then else end asc desc union all insert into values update set delete create table drop alter with over partition recursive temp temporary view index trigger exists explain query plan using cross natural`;

const PYTHON_KEYWORDS = `False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield print len range int float str list dict set sum min max sorted enumerate zip abs round`;

const R_KEYWORDS = `if else repeat while function for next break TRUE FALSE NULL Inf NaN NA library suppressMessages c data frame paste print mean sum length round sort order head filter arrange group_by summarise summarize mutate select desc n`;

// Excel has no keywords in the SQL sense — TRUE/FALSE and the error literals
// are the only bare words that aren't a function call or a cell reference.
const EXCEL_KEYWORDS = `TRUE FALSE`;

const KEYWORDS: Record<HighlightLang, Set<string>> = {
  sql: new Set(SQL_KEYWORDS.split(/\s+/)),
  python: new Set(PYTHON_KEYWORDS.split(/\s+/)),
  r: new Set(R_KEYWORDS.split(/\s+/)),
  excel: new Set(EXCEL_KEYWORDS.split(/\s+/)),
};

/**
 * Tables the learner actually hits in-browser. Known names always paint as
 * tables (even in SELECT lists / ON clauses). Unknown names still light up
 * when they follow FROM / JOIN / INTO / UPDATE / TABLE / WITH — same cue
 * Instant SQL Formatter and friends give you.
 */
const SQL_TABLES = new Set(
  [
    // lesson db (lib/fantasy-data.ts)
    "week_results",
    "rosters",
    "waiver_wire",
    // Practice Field (lib/field-data.ts)
    "player_weeks",
    "player_seasons",
    "teams",
    // SQLite catalog — shows up in Advanced SQL plan lessons
    "sqlite_master",
  ].map((t) => t.toLowerCase()),
);

/** Keywords whose next identifier is a table (or CTE) name. */
const SQL_TABLE_LEADERS = new Set([
  "from",
  "join",
  "into",
  "update",
  "table",
  "with",
]);

/**
 * A number, written as a regex literal on purpose. With an escaped b inside
 * a template literal, Next's server minifier turned the word boundary into a
 * backspace character, so server-rendered editors never coloured a number
 * and /field failed hydration (2026-10-05). A regex literal can't be
 * misread that way; the verifier fails a template literal holding one.
 */
const NUMBER = /\b\d+(?:\.\d+)?\b/.source;

/** A1, $A$1, AB12 — matched before the generic word rule so the $ stays attached. */
const CELL_REF = /^\$?[A-Za-z]{1,3}\$?\d+$/;

/**
 * One pass, one regex. Order matters: comments and strings must be matched
 * before identifiers so a keyword inside a string stays a string.
 */
function patternFor(lang: HighlightLang): RegExp {
  // Excel formulas have no comment syntax; use a pattern that can never match
  // so the alternation keeps its shape and the capture-group indexes hold.
  const comment =
    lang === "excel" ? `(?!)` : lang === "sql" ? `--[^\\n]*` : `#[^\\n]*`;
  // SQL: no dots inside a word so `week_results.player` splits into
  // table + punct + column — the way real formatters colour it.
  // Excel keeps dots out the other way (cell refs are a separate branch).
  // Python/R keep dotted names as one word (pandas / package paths).
  const word =
    lang === "excel"
      ? `(\\$?[A-Za-z]{1,3}\\$?\\d+|[A-Za-z_][A-Za-z0-9_.]*)`
      : lang === "sql"
        ? `([A-Za-z_][A-Za-z0-9_]*)`
        : `([A-Za-z_][A-Za-z0-9_.]*)`;
  return new RegExp(
    [
      `(${comment})`, // 1 comment
      `('(?:[^'\\\\\\n]|\\\\.)*'|"(?:[^"\\\\\\n]|\\\\.)*")`, // 2 string
      `(${NUMBER})`, // 3 number
      word, // 4 word (or cell reference, in Excel)
      `([^\\sA-Za-z0-9_]+)`, // 5 punctuation
    ].join("|"),
    "g",
  );
}

export function tokenize(code: string, lang: HighlightLang): Token[] {
  const re = patternFor(lang);
  const keywords = KEYWORDS[lang];
  const out: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  /** Next non-keyword word after FROM/JOIN/… should paint as a table. */
  let expectTable = false;

  while ((m = re.exec(code)) !== null) {
    if (m.index > last) {
      out.push({ text: code.slice(last, m.index), kind: "plain" });
    }
    const [full, comment, str, num, word, punct] = m;

    if (comment !== undefined) {
      out.push({ text: full, kind: "comment" });
    } else if (str !== undefined) {
      out.push({ text: full, kind: "string" });
    } else if (num !== undefined) {
      out.push({ text: full, kind: "number" });
    } else if (word !== undefined) {
      // SQL is case-insensitive; Python and R are not.
      const probe = lang === "sql" ? word.toLowerCase() : word;
      if (lang === "excel" && CELL_REF.test(word)) {
        // Cell references read as the "nouns" of a formula — give them the
        // number colour so ranges stand out from the function names.
        out.push({ text: full, kind: "number" });
      } else if (lang === "excel" && keywords.has(word.toUpperCase())) {
        out.push({ text: full, kind: "keyword" });
      } else if (keywords.has(probe)) {
        out.push({ text: full, kind: "keyword" });
        if (lang === "sql" && SQL_TABLE_LEADERS.has(probe)) {
          expectTable = true;
        } else if (lang === "sql" && probe !== "as") {
          // AS sits between table and alias — keep expecting until the table
          // name itself lands. Other keywords clear the flag.
          expectTable = false;
        }
      } else if (lang === "sql" && (SQL_TABLES.has(probe) || expectTable)) {
        out.push({ text: full, kind: "table" });
        expectTable = false;
      } else if (code[re.lastIndex] === "(") {
        out.push({ text: full, kind: "func" });
        expectTable = false;
      } else {
        out.push({ text: full, kind: "plain" });
        if (lang === "sql") expectTable = false;
      }
    } else if (punct !== undefined) {
      out.push({ text: full, kind: "punct" });
      // Commas in FROM a, b — next name is also a table.
      if (lang === "sql" && full.includes(",") && expectTable === false) {
        // Only re-arm when the previous token was a table (FROM a, b).
        const prev = out[out.length - 2];
        if (prev?.kind === "table") expectTable = true;
      }
    }

    last = re.lastIndex;
  }

  if (last < code.length) {
    out.push({ text: code.slice(last), kind: "plain" });
  }
  return out;
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  keyword: "tok-keyword",
  string: "tok-string",
  number: "tok-number",
  func: "tok-func",
  comment: "tok-comment",
  punct: "tok-punct",
  table: "tok-table",
  plain: "",
};
