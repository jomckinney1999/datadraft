"use client";

/**
 * Live code execution for lesson exercises.
 *
 * Three runtimes, one interface:
 *   sql    → sql.js (bundled, seeded from lib/fantasy-data.ts)
 *   python → Pyodide + pandas, lazy-loaded from CDN
 *   r      → WebR + dplyr, lazy-loaded from CDN
 *
 * Python and R are multi-megabyte WebAssembly downloads, so they are NEVER
 * fetched on page load — only when a learner opens an exercise in that
 * language, and the UI shows a loading state while it happens. Measured cold
 * starts on a normal connection: Python ~1.8s (incl. pandas), R ~3.7s (incl.
 * dplyr). Each runtime initialises once per page and is reused after that.
 *
 * Versions are pinned deliberately. Floating these to @latest means a silent
 * upstream change can break grading for every learner at once.
 */


export type Lang = "sql" | "python" | "r";

export type RunResult = {
  /** Whatever the learner's code printed, trimmed. Grading compares this. */
  stdout: string;
  /** Runtime/syntax error message, or null. Errors don't cost a heart. */
  error: string | null;
};

const PYODIDE_VERSION = "0.28.3";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const WEBR_VERSION = "0.5.4";
const WEBR_URL = `https://webr.r-wasm.org/v${WEBR_VERSION}/webr.mjs`;

export const LANG_LABEL: Record<Lang, string> = {
  sql: "SQL",
  python: "Python",
  r: "R",
};

/** Rough download weight, shown to the learner before a cold start. */
export const LANG_WEIGHT: Record<Lang, string> = {
  sql: "",
  python: "~12 MB",
  r: "~30 MB",
};

type Status = "idle" | "loading" | "ready" | "error";

const status: Record<Lang, Status> = { sql: "idle", python: "idle", r: "idle" };

export function runtimeStatus(lang: Lang): Status {
  return status[lang];
}

// ── SQL ───────────────────────────────────────────────────────────

type SqlDb = { exec: (sql: string) => SqlExecResult[]; close: () => void };
type SqlExecResult = { columns: string[]; values: unknown[][] };

let sqlPromise: Promise<SqlDb> | null = null;

async function getSql(): Promise<SqlDb> {
  if (!sqlPromise) {
    status.sql = "loading";
    // The dataset comes with the engine, never up front: this module is in
    // the lesson player's bundle, and most lessons never run SQL code.
    sqlPromise = Promise.all([
      import("sql.js").then((mod) => mod.default({ locateFile: () => "/sql-wasm.wasm" })),
      import("@/lib/fantasy-data"),
    ])
      .then(([SQL, data]) => {
        const db = new SQL.Database() as unknown as SqlDb;
        db.exec(data.buildSeedSql());
        status.sql = "ready";
        return db;
      })
      .catch((err) => {
        status.sql = "error";
        sqlPromise = null;
        throw err;
      });
  }
  return sqlPromise;
}

/** Render a SQL result set the way the results table shows it. */
function formatSqlResult(res: SqlExecResult | undefined): string {
  if (!res || res.columns.length === 0) return "";
  const head = res.columns.join(" | ");
  const rows = res.values.map((r) =>
    r.map((c) => (c === null ? "null" : String(c))).join(" | "),
  );
  return [head, ...rows].join("\n");
}

// ── Python ────────────────────────────────────────────────────────

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  loadPackage: (pkg: string | string[]) => Promise<void>;
};

let pyPromise: Promise<Pyodide> | null = null;

async function getPython(): Promise<Pyodide> {
  if (!pyPromise) {
    status.python = "loading";
    pyPromise = (async () => {
      const mod = await import(/* webpackIgnore: true */ `${PYODIDE_URL}pyodide.mjs`);
      const py: Pyodide = await mod.loadPyodide({ indexURL: PYODIDE_URL });
      await py.loadPackage("pandas");
      status.python = "ready";
      return py;
    })().catch((err) => {
      status.python = "error";
      pyPromise = null;
      throw err;
    });
  }
  return pyPromise;
}

// ── R ─────────────────────────────────────────────────────────────

type WebRShell = {
  init: () => Promise<void>;
  installPackages: (pkgs: string[]) => Promise<void>;
  evalRString: (code: string) => Promise<string>;
};

let rPromise: Promise<WebRShell> | null = null;

async function getR(): Promise<WebRShell> {
  if (!rPromise) {
    status.r = "loading";
    rPromise = (async () => {
      const mod = await import(/* webpackIgnore: true */ WEBR_URL);
      const webR = new mod.WebR();
      await webR.init();
      await webR.installPackages(["dplyr"]);
      status.r = "ready";
      return webR as WebRShell;
    })().catch((err) => {
      status.r = "error";
      rPromise = null;
      throw err;
    });
  }
  return rPromise;
}

// ── Public API ────────────────────────────────────────────────────

/** Warm a runtime without running anything, so the UI can show progress. */
export async function ensureRuntime(lang: Lang): Promise<void> {
  if (lang === "sql") await getSql();
  else if (lang === "python") await getPython();
  else await getR();
}

export async function runCode(lang: Lang, code: string): Promise<RunResult> {
  try {
    if (lang === "sql") {
      const db = await getSql();
      return { stdout: formatSqlResult(db.exec(code)[0]), error: null };
    }

    if (lang === "python") {
      const py = await getPython();
      let out = "";
      py.setStdout({ batched: (s) => (out += s + "\n") });
      py.setStderr({ batched: (s) => (out += s + "\n") });
      await py.runPythonAsync(code);
      return { stdout: out.trim(), error: null };
    }

    const webR = await getR();
    // Capture printed output the same way the console would show it.
    const wrapped = `paste(capture.output({\n${code}\n}), collapse = "\\n")`;
    const out = await webR.evalRString(wrapped);
    return { stdout: String(out).trim(), error: null };
  } catch (err) {
    return { stdout: "", error: cleanError(err) };
  }
}

/**
 * Tracebacks are noisy and mostly point at our wrapper rather than the
 * learner's mistake, so surface the last meaningful line.
 */
function cleanError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lines = raw.split("\n").filter((l) => l.trim());
  const meaningful = [...lines]
    .reverse()
    .find((l) => !/^\s*(File|at |\^+)/.test(l));
  return (meaningful ?? lines[lines.length - 1] ?? raw).trim().slice(0, 300);
}

// NumPy 2 prints a NumPy number with its type: dict(series) shows
// {'WR': np.int64(8)} where series.to_dict() shows {'WR': 8}. Same answer,
// so grading reads both as the plain value (2026-10-06: an exact match was
// marking print(dict(df["position"].value_counts())) wrong).
const NP_NUMBER = /np\.(?:u?int|float|complex|longdouble|clongdouble)\d*\(([^()]*)\)/g;
const NP_TEXT = /np\.(?:str_|bytes_)\(('[^']*'|"[^"]*")\)/g;
const NP_BOOL = /np\.(True|False)_/g;

/** Printed output as grading reads it: NumPy's type wrappers dropped. */
export function plainPrinted(s: string): string {
  return s.replace(NP_NUMBER, "$1").replace(NP_TEXT, "$1").replace(NP_BOOL, "$1");
}

/**
 * Grading: run the learner's code and the reference solution in the same
 * runtime and compare what they printed. Whitespace-insensitive per line so
 * formatting differences don't fail a correct answer, and blind to NumPy's
 * type wrappers (see plainPrinted).
 */
export function outputsMatch(a: string, b: string): boolean {
  const norm = (s: string) =>
    plainPrinted(s)
      .split("\n")
      .map((l) => l.trim().replace(/\s+/g, " "))
      .filter(Boolean)
      .join("\n");
  return norm(a) === norm(b);
}
