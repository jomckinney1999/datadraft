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
  | "plain";

export type Token = { text: string; kind: TokenKind };

export type HighlightLang = "sql" | "python" | "r";

const SQL_KEYWORDS = `select from where group by having order limit offset join inner left right full outer on as and or not in between like is null distinct count sum avg min max round case when then else end asc desc union all insert into values update set delete create table drop alter with over partition`;

const PYTHON_KEYWORDS = `False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield print len range int float str list dict set sum min max sorted enumerate zip abs round`;

const R_KEYWORDS = `if else repeat while function for next break TRUE FALSE NULL Inf NaN NA library suppressMessages c data frame paste print mean sum length round sort order head filter arrange group_by summarise summarize mutate select desc n`;

const KEYWORDS: Record<HighlightLang, Set<string>> = {
  sql: new Set(SQL_KEYWORDS.split(/\s+/)),
  python: new Set(PYTHON_KEYWORDS.split(/\s+/)),
  r: new Set(R_KEYWORDS.split(/\s+/)),
};

/**
 * One pass, one regex. Order matters: comments and strings must be matched
 * before identifiers so a keyword inside a string stays a string.
 */
function patternFor(lang: HighlightLang): RegExp {
  const comment = lang === "sql" ? `--[^\\n]*` : `#[^\\n]*`;
  return new RegExp(
    [
      `(${comment})`, // 1 comment
      `('(?:[^'\\\\\\n]|\\\\.)*'|"(?:[^"\\\\\\n]|\\\\.)*")`, // 2 string
      `(\\b\\d+(?:\\.\\d+)?\\b)`, // 3 number
      `([A-Za-z_][A-Za-z0-9_.]*)`, // 4 word
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

  while ((m = re.exec(code)) !== null) {
    if (m.index > last) {
      out.push({ text: code.slice(last, m.index), kind: "plain" });
    }
    const [full, comment, str, num, word, punct] = m;

    if (comment !== undefined) out.push({ text: full, kind: "comment" });
    else if (str !== undefined) out.push({ text: full, kind: "string" });
    else if (num !== undefined) out.push({ text: full, kind: "number" });
    else if (word !== undefined) {
      // SQL is case-insensitive; Python and R are not.
      const probe = lang === "sql" ? word.toLowerCase() : word;
      if (keywords.has(probe)) {
        out.push({ text: full, kind: "keyword" });
      } else if (code[re.lastIndex] === "(") {
        out.push({ text: full, kind: "func" });
      } else {
        out.push({ text: full, kind: "plain" });
      }
    } else if (punct !== undefined) out.push({ text: full, kind: "punct" });

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
  plain: "",
};
