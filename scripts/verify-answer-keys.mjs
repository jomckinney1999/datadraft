/**
 * Verifies every `query` exercise answer key against the seeded sql.js
 * database the lessons actually run on.
 *
 * This exists because a wrong answer key is invisible until a learner hits it:
 * the query runs, grades them incorrect, and they have no way to know the key
 * was at fault. It checks three things per exercise:
 *
 *   1. the expected SQL runs at all
 *   2. it returns rows (an answer key that returns nothing is almost always
 *      a bug, and grades every learner correct-by-accident or wrong-by-accident)
 *   3. for ORDER BY + LIMIT keys, the value at the cutoff isn't tied with the
 *      next one out — a tie there means a learner's equally-correct query can
 *      return a different row and grade wrong. This has bitten this repo before.
 *
 * It also executes every Python `code` answer key in Pyodide — the same
 * runtime the browser uses — and fails if a key errors or prints nothing.
 * A key that prints nothing grades every learner wrong no matter what they
 * type, because grading compares printed output.
 *
 * Usage: node scripts/verify-answer-keys.mjs
 */

import initSqlJs from "sql.js";
import { loadPyodide } from "pyodide";
import path from "node:path";
import { loadTs as loadProjectTs } from "./load-ts.mjs";

const root = process.cwd();

const data = await loadProjectTs(path.join(root, "lib/fantasy-data.ts"), root);
const curriculum = await loadProjectTs(path.join(root, "lib/curriculum.ts"), root);
const excel = await loadProjectTs(path.join(root, "lib/excel-engine.ts"), root);
const excelData = await loadProjectTs(path.join(root, "lib/excel-data.ts"), root);

const SQL = await initSqlJs();
const db = new SQL.Database();
db.run(data.buildSeedSql());

const problems = [];
let checked = 0;
let previews = 0;

function run(sql) {
  return db.exec(sql)[0];
}

for (const unit of curriculum.COURSE.units) {
  for (const lesson of unit.lessons ?? []) {
    // brief previews are shown to the learner — they must work too
    if (lesson.brief?.previewSql) {
      previews++;
      try {
        const res = run(lesson.brief.previewSql);
        if (!res || res.values.length === 0) {
          problems.push(`${lesson.id} brief preview returned no rows`);
        }
      } catch (e) {
        problems.push(`${lesson.id} brief preview FAILED: ${e.message}`);
      }
    }

    for (const [i, ex] of (lesson.exercises ?? []).entries()) {
      if (ex.type !== "query") continue;
      checked++;
      const label = `${lesson.id} ex${i + 1}`;
      let res;
      try {
        res = run(ex.expected);
      } catch (e) {
        problems.push(`${label} answer key FAILED: ${e.message}`);
        continue;
      }
      if (!res || res.values.length === 0) {
        problems.push(`${label} answer key returned NO ROWS`);
        continue;
      }

      // Tie-at-the-cutoff check for ORDER BY + LIMIT keys.
      //
      // A repeated value at the boundary is only dangerous when the FULL
      // ORDER BY key is tied — if the query adds tie-breaks (ORDER BY pts
      // DESC, player, week) the order is deterministic and a learner writing
      // the same query gets the same rows. Comparing only the sort column
      // flags those correct keys as broken, so compare every ORDER BY column.
      const m = /order\s+by\s+(.+?)\s+limit\s+(\d+)/is.exec(ex.expected);
      if (m) {
        const limit = Number(m[2]);
        const orderCols = m[1]
          .split(",")
          .map((c) => c.trim().replace(/\s+(asc|desc)$/i, "").replace(/^.*\./, ""))
          .filter(Boolean);
        const unlimited = ex.expected.replace(/\s+limit\s+\d+\s*;?\s*$/i, ";");
        try {
          const full = run(unlimited);
          if (full && full.values.length > limit) {
            const idx = orderCols
              .map((c) => full.columns.findIndex((col) => col.toLowerCase() === c.toLowerCase()))
              .filter((i) => i >= 0);
            // If no ORDER BY column is in the projection we can't judge it.
            if (idx.length) {
              const key = (row) => idx.map((i) => String(row[i])).join("");
              const lastIn = key(full.values[limit - 1]);
              const firstOut = key(full.values[limit]);
              if (lastIn === firstOut) {
                problems.push(
                  `${label} TIE AT CUTOFF: rows ${limit} and ${limit + 1} are identical on every ORDER BY column (${orderCols.join(", ")}) — a correct learner query can return a different row and grade wrong`,
                );
              }
            }
          }
        } catch {
          /* if the unlimited form won't run, the limited one already passed */
        }
      }
    }
  }
}

// ── Interview cases (dedicated seeds, not the lesson DB) ─────────────
const interview = await loadProjectTs(
  path.join(root, "lib/interview-cases.ts"),
  root,
);
let interviewChecked = 0;
for (const c of interview.INTERVIEW_CASES) {
  const caseDb = new SQL.Database();
  try {
    caseDb.run(c.seedSql);
  } catch (e) {
    problems.push(`interview ${c.id} seed FAILED: ${e.message}`);
    continue;
  }
  for (const [qi, q] of c.questions.entries()) {
    interviewChecked++;
    const label = `interview ${c.id} q${qi + 1}`;
    let res;
    try {
      res = caseDb.exec(q.expected)[0];
    } catch (e) {
      problems.push(`${label} answer key FAILED: ${e.message}`);
      continue;
    }
    if (!res || res.values.length === 0) {
      problems.push(`${label} answer key returned NO ROWS`);
    }
  }
}

// ── Python answer keys ────────────────────────────────────────────
// R keys are not checked here: WebR has no supported Node build, so those
// are verified in-browser instead. Anything skipped is reported below rather
// than silently passing.
const pyExercises = [];
let skippedR = 0;
for (const unit of curriculum.COURSE.units) {
  for (const lesson of unit.lessons ?? []) {
    for (const [i, ex] of (lesson.exercises ?? []).entries()) {
      if (ex.type !== "code") continue;
      if (ex.lang === "python") pyExercises.push([`${lesson.id} ex${i + 1}`, ex]);
      else skippedR++;
    }
  }
}

let pyChecked = 0;
if (pyExercises.length) {
  const py = await loadPyodide();
  await py.loadPackage("pandas");
  for (const [label, ex] of pyExercises) {
    pyChecked++;
    let out = "";
    py.setStdout({ batched: (t) => (out += t + "\n") });
    py.setStderr({ batched: (t) => (out += t + "\n") });
    try {
      await py.runPythonAsync(ex.expected);
    } catch (e) {
      problems.push(`${label} python answer key FAILED: ${String(e).split("\n").pop()}`);
      continue;
    }
    if (!out.trim()) {
      problems.push(
        `${label} python answer key printed NOTHING — grading compares printed output, so every learner would be marked wrong`,
      );
    }
  }
}

// ── Excel formula answer keys ─────────────────────────────────
// Evaluated by the SHIPPED engine (lib/excel-engine.ts), not a copy of it —
// a re-implementation here would happily agree with itself while the real one
// was broken. Four failure modes, all of which grade a correct learner wrong:
//
//   1. the key errors (#N/A, bad syntax, a function the parser lacks)
//   2. the key returns blank — nothing to compare against
//   3. the key hardcodes its answer instead of reading the sheet, which means
//      the exercise's own anti-hardcode guard would reject the model answer
//   4. brief previewSheet names a tab that doesn't exist
const formulaExercises = [];
const sheetProblems = [];
for (const unit of curriculum.COURSE.units) {
  for (const lesson of unit.lessons ?? []) {
    if (lesson.brief?.previewSheet) {
      if (!excelData.WORKBOOK[lesson.brief.previewSheet]) {
        sheetProblems.push(
          `${lesson.id} brief previewSheet "${lesson.brief.previewSheet}" is not a sheet in the workbook`,
        );
      }
    }
    for (const [i, ex] of (lesson.exercises ?? []).entries()) {
      if (ex.type === "formula") formulaExercises.push([`${lesson.id} ex${i + 1}`, ex]);
    }
  }
}
problems.push(...sheetProblems);

let formulaChecked = 0;
for (const [label, ex] of formulaExercises) {
  formulaChecked++;
  if (ex.sheet && !excelData.WORKBOOK[ex.sheet]) {
    problems.push(`${label} names sheet "${ex.sheet}", which does not exist`);
    continue;
  }
  const res = await excel.evaluateFormula(ex.expected, ex.sheet ?? excelData.MAIN_SHEET);
  if (res.error) {
    problems.push(`${label} formula answer key FAILED: ${ex.expected} → ${res.error}`);
    continue;
  }
  if (res.value === null || res.value === "") {
    problems.push(
      `${label} formula answer key returned BLANK — there is nothing for a learner answer to match`,
    );
    continue;
  }
  if (!ex.allowLiteral && !excel.referencesCells(ex.expected)) {
    problems.push(
      `${label} answer key references no cell (${ex.expected}) — the exercise's anti-hardcode guard would reject this exact answer`,
    );
  }
}

console.log(`brief previews checked : ${previews}`);
console.log(`query answer keys checked: ${checked}`);
console.log(`interview keys checked   : ${interviewChecked}`);
console.log(`python answer keys run    : ${pyChecked}`);
console.log(`excel formula keys checked: ${formulaChecked}`);
if (skippedR) console.log(`R keys skipped (no Node WebR): ${skippedR}`);

if (problems.length === 0) {
  console.log("\nAll answer keys run, return rows, and have no cutoff ties.");
} else {
  console.log(`\n${problems.length} PROBLEM(S):`);
  problems.forEach((p) => console.log("  - " + p));
  process.exitCode = 1;
}
