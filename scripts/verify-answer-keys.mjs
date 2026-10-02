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

// One Pyodide for the whole run. Booting it twice doubles a slow step, and
// the second copy would be identical anyway.
let pyHandle = null;
async function getPy() {
  if (!pyHandle) {
    pyHandle = await loadPyodide();
    await pyHandle.loadPackage("pandas");
  }
  return pyHandle;
}

/** Run code and report what it printed, the way the browser grades it. */
async function runPython(code) {
  const py = await getPy();
  let out = "";
  py.setStdout({ batched: (t) => (out += t + "\n") });
  py.setStderr({ batched: (t) => (out += t + "\n") });
  try {
    await py.runPythonAsync(code);
  } catch (e) {
    return { stdout: out, error: String(e).split("\n").filter(Boolean).pop() };
  }
  return { stdout: out, error: null };
}

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

// ── Question bank (same seeded lesson DB) ───────────────────
//
// A question is graded by comparing the learner's result grid to the key's,
// so a key that errors or returns nothing marks every learner wrong with no
// way for them to tell. The `returns` line is checked for the same reason a
// tie at a LIMIT cutoff is: it is the contract the learner is graded against,
// and if the key's column count does not match what the prompt promised, the
// prompt is the thing that is wrong.
const questions = await loadProjectTs(path.join(root, "lib/questions.ts"), root);
let questionChecked = 0;
let questionPy = 0;
let questionXl = 0;
let questionR = 0;
const seenQuestionIds = new Set();
for (const q of questions.QUESTIONS) {
  questionChecked++;
  const label = `question ${q.id}`;

  if (seenQuestionIds.has(q.id)) problems.push(`${label} DUPLICATE id`);
  seenQuestionIds.add(q.id);

  // The faces on the card come from `players`. A name that is not one of the
  // twenty lesson players would render as an initial in a circle, silently.
  for (const name of q.players ?? []) {
    if (!data.PLAYERS.includes(name)) {
      problems.push(`${label} names player "${name}", who is not in the lesson data`);
    }
  }

  if (!q.returns || !q.returns.trim()) {
    problems.push(`${label} has no \`returns\` line — grading compares output, so the learner must be told exactly what to produce`);
  }

  // Python and R are graded on printed output against a shared prelude, so
  // the prelude is part of the answer key and a missing one silently grades
  // every learner wrong.
  if ((q.lang === "python" || q.lang === "r") && !q.setup) {
    problems.push(`${label} is ${q.lang} but has no \`setup\` — there is no data for the code to run against`);
  }

  if (q.lang === "python") {
    questionPy++;
    const out = await runPython(`${q.setup}
${q.expected}`);
    if (out.error) {
      problems.push(`${label} python answer key FAILED: ${out.error}`);
    } else if (!out.stdout.trim()) {
      problems.push(
        `${label} python answer key PRINTED NOTHING — grading compares printed output, so this marks every learner wrong`,
      );
    }
    continue;
  }

  if (q.lang === "excel") {
    questionXl++;
    const sheet = q.sheet ?? excelData.MAIN_SHEET;
    if (!excelData.WORKBOOK[sheet]) {
      problems.push(`${label} names sheet "${sheet}", which is not in the workbook`);
      continue;
    }
    const res = await excel.evaluateFormula(q.expected, sheet);
    if (res.error) {
      problems.push(`${label} formula answer key FAILED: ${q.expected} → ${res.error}`);
    } else if (res.value === null || res.value === "") {
      problems.push(`${label} formula answer key returned BLANK`);
    } else if (!excel.referencesCells(q.expected)) {
      problems.push(
        `${label} answer key references no cell (${q.expected}) — the anti-hardcode guard would reject this exact answer`,
      );
    }
    continue;
  }

  if (q.lang === "r") {
    // No supported Node build of WebR. Say so rather than passing silently.
    questionR++;
    continue;
  }

  for (const t of q.tables) {
    if (!data.SCHEMA.some((s) => s.table === t)) {
      problems.push(`${label} names table "${t}", which is not in the seeded schema`);
    }
  }

  let res;
  try {
    res = run(q.expected);
  } catch (e) {
    problems.push(`${label} answer key FAILED: ${e.message}`);
    continue;
  }
  if (!res || res.values.length === 0) {
    problems.push(`${label} answer key returned NO ROWS`);
    continue;
  }

  // An answer key that never mentions a table is a hardcoded result.
  if (!/\bfrom\b/i.test(q.expected)) {
    problems.push(`${label} answer key has no FROM — it is not reading the data`);
  }

  // Same cutoff-tie trap as the lesson keys: if the key stops at N and rows
  // N and N+1 are identical on every ORDER BY column, an equally correct
  // learner query can return the other row and grade wrong.
  const m = /order\s+by\s+(.+?)\s+limit\s+(\d+)/is.exec(q.expected);
  if (m) {
    const limit = Number(m[2]);
    const orderCols = m[1]
      .split(",")
      .map((c) => c.trim().replace(/\s+(asc|desc)$/i, "").replace(/^.*\./, ""))
      .filter(Boolean);
    const unlimited = q.expected.replace(/\s+limit\s+\d+\s*;?\s*$/i, ";");
    try {
      const full = run(unlimited);
      if (full && full.values.length > limit) {
        const idx = orderCols
          .map((c) => full.columns.findIndex((col) => col.toLowerCase() === c.toLowerCase()))
          .filter((i) => i >= 0);
        if (idx.length) {
          const key = (row) => idx.map((i) => String(row[i])).join("");
          if (key(full.values[limit - 1]) === key(full.values[limit])) {
            problems.push(
              `${label} TIE AT CUTOFF: rows ${limit} and ${limit + 1} are identical on every ORDER BY column (${orderCols.join(", ")})`,
            );
          }
        }
      }
    } catch {
      /* the limited form already ran */
    }
  }
}

// Every question must get its own day before any repeats, within its own
// language. The rotation walks a stride co-prime with that language's pool
// size to guarantee it; if someone adds a question and the stride silently
// stops being co-prime, this catches it.
for (const lang of ["sql", "python", "r", "excel"]) {
  const pool = questions.questionsIn(lang);
  if (pool.length === 0) {
    problems.push(`no questions at all in ${lang} — the nav offers a filter with nothing behind it`);
    continue;
  }
  const seen = new Set();
  const startMs = Date.parse("2026-01-01T00:00:00Z");
  for (let i = 0; i < pool.length; i++) {
    const day = new Date(startMs + i * 86400000).toISOString().slice(0, 10);
    seen.add(questions.questionOfTheDay(day, lang).id);
  }
  if (seen.size !== pool.length) {
    problems.push(
      `QOTD rotation repeats in ${lang}: ${pool.length} questions but only ${seen.size} distinct in the first ${pool.length} days`,
    );
  }
}

// ── Facts the prose quotes ────────────────────────────────────
// Lesson text reads numbers from lib/lesson-facts.generated.ts instead of
// typing them. The builder computes those in JavaScript; this re-derives each
// one with SQL against the seeded database, so a builder bug cannot put a
// wrong number in front of a learner either.
let factsChecked = 0;
{
  const { FACTS } = await loadProjectTs(path.join(root, "lib/lesson-facts.generated.ts"), root);
  const one = (sql) => run(sql).values[0][0];
  const same = (label, got, want) => {
    factsChecked++;
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      problems.push(`FACTS.${label} is ${JSON.stringify(want)} but the database says ${JSON.stringify(got)}`);
    }
  };
  same("rows", one("SELECT COUNT(*) FROM week_results"), FACTS.rows);
  same("gamesTable", one("SELECT COUNT(*) FROM games"), FACTS.gamesTable);
  same("players", one("SELECT COUNT(DISTINCT player) FROM week_results"), FACTS.players);
  same("teams", one("SELECT COUNT(DISTINCT team) FROM week_results"), FACTS.teams);
  same("playerTeamPairs", one("SELECT COUNT(*) FROM (SELECT DISTINCT player, team FROM week_results)"), FACTS.playerTeamPairs);
  same("movers", one("SELECT COUNT(*) FROM (SELECT player FROM week_results GROUP BY player HAVING COUNT(DISTINCT team) > 1)"), FACTS.movers);
  same("over25", one("SELECT COUNT(*) FROM week_results WHERE fantasy_pts > 25"), FACTS.over25);
  same("boom30", one("SELECT COUNT(*) FROM week_results WHERE fantasy_pts >= 30"), FACTS.boom30);
  same("seasons", run("SELECT DISTINCT season FROM games ORDER BY season").values.map((r) => r[0]), [...FACTS.seasons]);
  same("latest.week", one("SELECT MAX(week) FROM games WHERE season = (SELECT MAX(season) FROM games)"), FACTS.latest.week);
  same(
    "possibleGames",
    one(`SELECT SUM(g) FROM (SELECT season, MAX(n) AS g FROM (
           SELECT season, team, COUNT(*) AS n FROM (
             SELECT season, home_team AS team FROM games UNION ALL SELECT season, away_team FROM games
           ) GROUP BY season, team) GROUP BY season)`),
    FACTS.possibleGames,
  );
  same(
    "gamesPlayed",
    Object.fromEntries(run("SELECT player, COUNT(*) FROM week_results GROUP BY player").values.sort((a, b) => (a[0] < b[0] ? -1 : 1))),
    Object.fromEntries(Object.entries(FACTS.gamesPlayed).sort((a, b) => (a[0] < b[0] ? -1 : 1))),
  );
  same(
    "maxGame",
    run("SELECT player, season, week, fantasy_pts FROM week_results WHERE fantasy_pts = (SELECT MAX(fantasy_pts) FROM week_results) ORDER BY season, week").values,
    FACTS.maxGame.games.map((g) => [g.player, g.season, g.week, FACTS.maxGame.pts]),
  );
  for (const [player, arc] of Object.entries(FACTS.seasonPpg)) {
    same(
      `seasonPpg["${player}"]`,
      run(`SELECT season, ROUND(AVG(fantasy_pts), 1) FROM week_results WHERE player = '${player.replace(/'/g, "''")}' GROUP BY season ORDER BY season`).values,
      arc.map((x) => [...x]),
    );
  }
  const L = FACTS.league;
  same("league.drafted", one("SELECT COUNT(*) FROM rosters"), L.drafted);
  same("league.undrafted", one("SELECT COUNT(DISTINCT w.player) FROM week_results w LEFT JOIN rosters r ON w.player = r.player WHERE r.player IS NULL"), L.undrafted);
  same("league.wireRows", one("SELECT COUNT(*) FROM waiver_wire"), L.wireRows);
  same(
    "league.leader",
    run(`SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) FROM rosters r JOIN week_results w ON r.player = w.player
         WHERE w.season = ${L.season} GROUP BY r.team_name ORDER BY 2 DESC LIMIT 1`).values[0],
    [L.leader.team, L.leader.pts],
  );
  same(
    "league.undraftedByPoints",
    run(`SELECT w.player FROM week_results w LEFT JOIN rosters r ON w.player = r.player
         WHERE w.season = ${L.season} AND r.player IS NULL GROUP BY w.player ORDER BY SUM(w.fantasy_pts) DESC`).values.map((r) => r[0]),
    [...L.undraftedByPoints],
  );
  same(
    "league.topRostered",
    run(`SELECT r.player, ROUND(SUM(w.fantasy_pts), 1) FROM rosters r JOIN week_results w ON r.player = w.player
         WHERE w.season = ${L.season} GROUP BY r.player ORDER BY 2 DESC LIMIT 1`).values[0],
    [L.topRostered.player, L.topRostered.pts],
  );
  same(
    "league.topRiser",
    run("SELECT player, trend FROM waiver_wire ORDER BY trend DESC LIMIT 1").values[0],
    [L.topRiser.player, L.topRiser.trend],
  );
}

// ── Stat Duel ─────────────────────────────────────────────────
// Each round's numbers are computed in JavaScript and shown first; the SQL is
// what "Prove it" shows and runs. Generate half a year of future days and
// fail on any disagreement between the two, a tie, a mismatched position, a
// first row that isn't the answer, or a day that can't fill five rounds.
let duelChecked = 0;
{
  const duel = await loadProjectTs(path.join(root, "lib/stat-duel.ts"), root);
  const start = Date.parse(`${duel.DUEL_LAUNCH}T00:00:00Z`);
  for (let d = 0; d < 180; d++) {
    const day = new Date(start + d * 86_400_000).toISOString().slice(0, 10);
    const today = duel.dailyDuel(day);
    if (today.rounds.length !== 5) problems.push(`Stat Duel ${day}: only ${today.rounds.length} rounds`);
    if (JSON.stringify(duel.dailyDuel(day)) !== JSON.stringify(today)) {
      problems.push(`Stat Duel ${day} is not the same duel twice`);
    }
    const names = today.rounds.flatMap((r) => [r.a.name, r.b.name]);
    if (new Set(names).size !== names.length) problems.push(`Stat Duel ${day}: a name appears in two rounds`);
    for (const r of today.rounds) {
      duelChecked++;
      const tag = `Stat Duel ${day} round ${r.n}`;
      let res;
      try {
        res = run(r.sql);
      } catch (e) {
        problems.push(`${tag} SQL failed: ${e.message}`);
        continue;
      }
      const got = new Map((res?.values ?? []).map((row) => [row[0], row[1]]));
      for (const side of [r.a, r.b]) {
        if (!got.has(side.name)) problems.push(`${tag}: the SQL returns no row for ${side.name}`);
        else if (Math.abs(Number(got.get(side.name)) - side.value) > 1e-9) {
          problems.push(`${tag}: shows ${side.name} at ${side.value} but the SQL says ${got.get(side.name)}`);
        }
      }
      if (r.a.value.toFixed(r.decimals) === r.b.value.toFixed(r.decimals)) problems.push(`${tag}: a tie`);
      const winner = duel.duelWinner(r) === 0 ? r.a.name : r.b.name;
      if (res?.values?.[0]?.[0] !== winner) {
        problems.push(`${tag}: the SQL ranks ${res?.values?.[0]?.[0]} first but the answer is ${winner}`);
      }
      if (r.a.kind === "player" && r.a.position !== r.b.position) {
        problems.push(`${tag}: ${r.a.position} against ${r.b.position}`);
      }
    }
  }
}

// ── Card art coverage ─────────────────────────────────────────
// A course, build or case with no scene renders an empty picture slot on
// its card. The scene maps live in TSX the loader does not transpile, so
// read their keys straight out of the source.
let artChecked = 0;
{
  const fs = await import("node:fs");
  const hasScene = (file, id) => {
    artChecked++;
    return new RegExp(`(^|\\s)"?${id.replace(/[-]/g, "\\-")}"?: \\{ tone:`, "m").test(
      fs.readFileSync(path.join(root, file), "utf8"),
    );
  };
  const courses = await loadProjectTs(path.join(root, "lib/courses.ts"), root);
  for (const course of courses.COURSES) {
    if (!hasScene("components/course-art.tsx", course.id)) {
      problems.push(`course "${course.id}" has no scene in components/course-art.tsx`);
    }
  }
  const projects = await loadProjectTs(path.join(root, "lib/projects.ts"), root);
  const cases = await loadProjectTs(path.join(root, "lib/interview-cases.ts"), root);
  for (const id of [
    ...projects.PROJECTS.map((p) => p.id),
    ...cases.INTERVIEW_CASES.map((c) => c.id),
  ]) {
    if (!hasScene("components/project-art.tsx", id)) {
      problems.push(`project/case "${id}" has no scene in components/project-art.tsx`);
    }
  }
  // Every unit a course shows on its roadmap carries its own picture.
  const unitIds = new Set(
    curriculum.MODULES.filter((m) => m.id !== curriculum.ALL_MODULE).flatMap((m) => m.unitIds),
  );
  for (const id of unitIds) {
    if (!hasScene("components/unit-art.tsx", id)) {
      problems.push(`unit "${id}" has no scene in components/unit-art.tsx`);
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
for (const [label, ex] of pyExercises) {
  pyChecked++;
  const res = await runPython(ex.expected);
  if (res.error) {
    problems.push(`${label} python answer key FAILED: ${res.error}`);
  } else if (!res.stdout.trim()) {
    problems.push(
      `${label} python answer key printed NOTHING — grading compares printed output, so every learner would be marked wrong`,
    );
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
console.log(`question bank keys checked: ${questionChecked} (sql ${questionChecked - questionPy - questionXl - questionR}, python ${questionPy}, excel ${questionXl})`);
if (questionR) console.log(`question R keys skipped (no Node WebR): ${questionR}`);
console.log(`python answer keys run    : ${pyChecked}`);
console.log(`excel formula keys checked: ${formulaChecked}`);
if (skippedR) console.log(`R keys skipped (no Node WebR): ${skippedR}`);
console.log(`card art ids checked      : ${artChecked} (courses, builds, cases, units)`);
console.log(`prose facts checked       : ${factsChecked} (lib/lesson-facts.generated.ts vs the database)`);
console.log(`stat duel rounds checked  : ${duelChecked} (180 days from launch, numbers vs their SQL)`);

if (problems.length === 0) {
  console.log("\nAll answer keys run, return rows, and have no cutoff ties.");
} else {
  console.log(`\n${problems.length} PROBLEM(S):`);
  problems.forEach((p) => console.log("  - " + p));
  process.exitCode = 1;
}
