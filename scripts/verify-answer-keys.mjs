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
// Chart it puts team logos on a player chart by looking each player up in
// player-teams.generated.ts. A cast player missing from it, or a team code
// with no colours or logo, would quietly draw a plain dot instead.
{
  const pt = await loadProjectTs(path.join(root, "lib/player-teams.generated.ts"), root);
  const tc = await loadProjectTs(path.join(root, "lib/team-colors.generated.ts"), root);
  const known = new Set(tc.TEAM_COLORS.map((t) => t.abbr));
  for (const p of data.PLAYERS) {
    if (!pt.PLAYER_TEAMS[p]) problems.push(`player-teams: no team on file for ${p}`);
  }
  const codes = [
    ...Object.values(pt.PLAYER_TEAMS).flatMap((s) => Object.values(s).flatMap((spans) => spans.map(([, t]) => t))),
    ...Object.values(pt.WIRE_TEAMS),
  ];
  for (const t of new Set(codes)) {
    if (!known.has(t)) problems.push(`player-teams: team code ${t} has no colours or logo`);
  }
}

// The account team draft slices one supplied 8×4 sprite. Every active NFL
// team must own exactly one in-bounds cell or a profile can show another
// team's owl without throwing an error.
{
  const fs = await import("node:fs");
  const avatars = await loadProjectTs(path.join(root, "lib/nfl-team-avatars.ts"), root);
  const order = avatars.NFL_TEAM_ORDER;
  const teams = avatars.NFL_TEAM_AVATARS;
  if (!fs.existsSync(path.join(root, "public/avatars/nfl-team-owls.jpg"))) {
    problems.push("team avatars: public/avatars/nfl-team-owls.jpg is missing");
  }
  if (order.length !== 32 || new Set(order).size !== 32) {
    problems.push(`team avatars: expected 32 unique abbreviations, found ${order.length} entries / ${new Set(order).size} unique`);
  }
  const cells = new Set();
  for (const team of teams) {
    if (team.col < 0 || team.col > 7 || team.row < 0 || team.row > 3) {
      problems.push(`team avatars: ${team.abbr} maps outside the 8×4 sprite (${team.col}, ${team.row})`);
    }
    const cell = `${team.col},${team.row}`;
    if (cells.has(cell)) problems.push(`team avatars: sprite cell ${cell} is assigned more than once`);
    cells.add(cell);
  }
  if (teams.length !== 32 || cells.size !== 32) {
    problems.push(`team avatars: expected all 32 sprite cells, found ${teams.length} teams / ${cells.size} cells`);
  }
}

// The Season Pass (docs/OFFER.md). The free starter set has to be real easy
// SQL questions, and the prices in the code have to be the prices the Stripe
// setup script creates, or the page would advertise one number and charge
// another.
{
  const gates = await loadProjectTs(path.join(root, "lib/pass-gates.ts"), root);
  const bank = await loadProjectTs(path.join(root, "lib/questions.ts"), root);
  for (const id of gates.STARTER_QUESTIONS) {
    const q = bank.QUESTIONS.find((x) => x.id === id);
    if (!q) problems.push(`season pass: starter question "${id}" doesn't exist`);
    else if (q.lang !== "sql" || q.difficulty !== "easy") problems.push(`season pass: starter question "${id}" isn't easy SQL`);
  }
  // The home page only ever shows an easy SQL question (frontDoorQuestion),
  // and it has to be free on its day, or the front door would open on a
  // paywall once the gate is on.
  const startMs = Date.parse(`${bank.leagueDay()}T00:00:00Z`);
  for (let i = 0; i < 180; i++) {
    const day = new Date(startMs + i * 86400000).toISOString().slice(0, 10);
    const { question: q } = bank.frontDoorQuestion(day);
    if (q.lang !== "sql" || q.difficulty !== "easy") {
      problems.push(`home page: ${day} would show "${q.id}", which isn't easy SQL`);
      break;
    }
    if (!gates.questionIsFree(q, day)) {
      problems.push(`home page: ${day}'s question "${q.id}" isn't free under the Season Pass gate`);
      break;
    }
  }
  const pass = await loadProjectTs(path.join(root, "lib/season-pass.ts"), root);
  const fs = await import("node:fs");
  const script = fs.readFileSync(path.join(root, "scripts/setup-stripe-products.mjs"), "utf8");
  for (const [plan, env] of [["monthly", "STRIPE_PRICE_MONTHLY"], ["annual", "STRIPE_PRICE_ANNUAL"], ["founding", "STRIPE_PRICE_FOUNDING"]]) {
    const m = new RegExp(`env: "${env}"[^}]*cents: (\\d+)`).exec(script);
    if (!m) problems.push(`season pass: setup-stripe-products.mjs has no ${env} price`);
    else if (Number(m[1]) !== pass.PASS_PLANS[plan].cents) {
      problems.push(`season pass: ${plan} is ${pass.PASS_PLANS[plan].cents}¢ in lib/season-pass.ts but ${m[1]}¢ in the Stripe setup script`);
    }
  }
}

// Interview prep's pictures (components/prep-art.tsx): every pattern and
// every mock format needs its own scene, or its card shows an empty frame.
{
  const fs = await import("node:fs");
  const art = fs.readFileSync(path.join(root, "components/prep-art.tsx"), "utf8");
  const patterns = await loadProjectTs(path.join(root, "lib/interview-patterns.ts"), root);
  const mocks = await loadProjectTs(path.join(root, "lib/mock-interview.ts"), root);
  const screens = await loadProjectTs(path.join(root, "lib/analyst-screen.ts"), root);
  const ids = [
    ...patterns.PATTERNS.map((p) => p.id),
    ...mocks.MOCK_FORMATS.map((f) => f.id),
    ...screens.ANALYST_FORMATS.map((f) => f.id),
    "challenge",
  ];
  for (const id of ids) {
    if (!new RegExp(`(^|\\s)"?${id}"?: \\{ tone:`, "m").test(art)) problems.push(`prep art: no scene for "${id}" in components/prep-art.tsx`);
  }
}

// The Data Challenge (lib/data-challenge.ts) ships its own seed, like the
// cases. Every graded key has to run on it and return rows, and the dirty
// data the tasks are about has to actually be in the seed.
{
  const ch = await loadProjectTs(path.join(root, "lib/data-challenge.ts"), root);
  const cdb = new SQL.Database();
  cdb.run(ch.DATA_CHALLENGE.seedSql);
  for (const t of ch.challengeTasks()) {
    if (t.kind !== "sql") continue;
    try {
      const res = cdb.exec(t.expected)[0];
      if (!res || !res.values.length) problems.push(`data challenge: "${t.id}" key returns no rows`);
    } catch (e) {
      problems.push(`data challenge: "${t.id}" key errors: ${e.message}`);
    }
  }
  const dup = cdb.exec("SELECT COUNT(*) FROM (SELECT market_id FROM market_profiles GROUP BY market_id HAVING COUNT(*) > 1)")[0].values[0][0];
  if (dup < 1) problems.push("data challenge: the seed has no duplicate market to find");
}

// Every case opens on a briefing cutscene (lib/case-scenes.ts); a case
// without one would open straight onto the workspace, the odd one out.
{
  const scenes = await loadProjectTs(path.join(root, "lib/case-scenes.ts"), root);
  const cases = await loadProjectTs(path.join(root, "lib/interview-cases.ts"), root);
  for (const c of cases.INTERVIEW_CASES) {
    if (!scenes.CASE_SCENES[c.id]) problems.push(`case ${c.id} has no briefing in lib/case-scenes.ts`);
  }
}

// The nav menus (lib/nav.ts): every link must be a real page, and every
// #anchor a real id on it, or a menu item quietly lands on a 404 or the top
// of the page.
{
  const nav = await loadProjectTs(path.join(root, "lib/nav.ts"), root);
  const projects = await loadProjectTs(path.join(root, "lib/projects.ts"), root);
  const fs = await import("node:fs");
  const sources = ["components", "app"].flatMap((d) =>
    fs.readdirSync(path.join(root, d), { recursive: true }).filter((f) => /\.tsx$/.test(f)).map((f) => fs.readFileSync(path.join(root, d, f), "utf8")),
  );
  for (const item of nav.NAV.flatMap((s) => [{ href: s.href }, ...s.groups.flatMap((g) => g.items)])) {
    const [p, hash] = item.href.split("#");
    const build = /^\/projects\/([^/]+)$/.exec(p);
    const real = build
      ? projects.PROJECTS.some((x) => x.id === build[1]) || fs.existsSync(path.join(root, "app", p, "page.tsx"))
      : fs.existsSync(path.join(root, "app", p, "page.tsx"));
    if (!real) problems.push(`nav: ${item.href} isn't a page`);
    if (hash && !sources.some((src) => src.includes(`id="${hash}"`))) problems.push(`nav: ${item.href} points at #${hash}, which no page has`);
  }
}

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
  // Count from the day the whole pool is in the rotation: a question with an
  // `added` date only joins on that day, so before it the pool is smaller.
  const latest = pool.map((q) => q.added).filter(Boolean).sort().pop();
  const startMs = Date.parse(`${latest && latest > "2026-01-01" ? latest : "2026-01-01"}T00:00:00Z`);
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

// ── Draft Room ────────────────────────────────────────────────
// The scouting database must never contain the season being drafted (that
// would make the draft a lookup), every scouting preset has to run and
// return players, and the engine has to be deterministic, fill every
// lineup, and give each pair of teams exactly two regular-season games.
let draftChecked = 0;
{
  const fs = await import("node:fs");
  const sim = await loadProjectTs(path.join(root, "lib/draft-sim.ts"), root);
  const scout = await loadProjectTs(path.join(root, "lib/draft-scout.ts"), root);
  const { DRAFT_SEASONS } = await loadProjectTs(path.join(root, "lib/draft-seasons.generated.ts"), root);
  if (!DRAFT_SEASONS.length) problems.push("Draft Room: no seasons built");
  for (const meta of DRAFT_SEASONS) {
    const tag = `Draft Room ${meta.season}`;
    const data = JSON.parse(fs.readFileSync(path.join(root, "public/draft", `${meta.season}.json`), "utf8"));
    if (data.board.length < sim.TOTAL_PICKS + 48) problems.push(`${tag}: board of ${data.board.length} is too small`);
    if (new Set(data.board.map((p) => p.id)).size !== data.board.length) problems.push(`${tag}: duplicate player ids`);
    if (data.scout.some((r) => r[1] >= data.season)) problems.push(`${tag}: scouting rows from the season being drafted`);
    for (const p of data.board) {
      if (!(p.adp > 0)) problems.push(`${tag}: ${p.name} has no ADP`);
      if ((data.points[p.id] ?? []).length !== sim.LAST_WEEK) problems.push(`${tag}: ${p.name} has no ${sim.LAST_WEEK}-week points`);
    }

    // The scouting desk, on the real data, with picks in flight.
    const db = new SQL.Database();
    scout.seedScouting(db, data);
    const league = sim.makeLeague(data.season, "verify", 2);
    const picks = sim.autodraftRest(league, data, []);
    scout.syncPicks(db, data, league, picks.slice(0, 30));
    for (const preset of scout.scoutPresets(data)) {
      draftChecked++;
      try {
        const res = db.exec(preset.sql)[0];
        if (!res || !res.values.length) problems.push(`${tag} preset "${preset.label}" returns no rows`);
        else if (!res.columns.includes("player")) problems.push(`${tag} preset "${preset.label}" has no player column to draft from`);
        else {
          const gone = new Set(picks.slice(0, 30).map((id) => data.board.find((p) => p.id === id)?.name));
          const leaked = res.values.map((r) => r[res.columns.indexOf("player")]).filter((n) => gone.has(n));
          if (leaked.length) problems.push(`${tag} preset "${preset.label}" shows drafted players: ${leaked.slice(0, 3).join(", ")}`);
        }
      } catch (e) {
        problems.push(`${tag} preset "${preset.label}" failed: ${e.message}`);
      }
    }
    scout.addResults(db, data);
    try {
      if (!db.exec(scout.resultsQuery(data))[0]?.values.length) problems.push(`${tag}: the results query returns nothing`);
    } catch (e) {
      problems.push(`${tag}: the results query failed: ${e.message}`);
    }
    db.close();

    // The engine, from every slot.
    for (let slot = 0; slot < sim.TEAMS; slot++) {
      draftChecked++;
      const lg = sim.makeLeague(data.season, `v${slot}x`, slot);
      const all = sim.autodraftRest(lg, data, []);
      if (all.length !== sim.TOTAL_PICKS || new Set(all).size !== all.length) {
        problems.push(`${tag} slot ${slot + 1}: the draft didn't produce ${sim.TOTAL_PICKS} different picks`);
        continue;
      }
      if (JSON.stringify(sim.autodraftRest(lg, data, [])) !== JSON.stringify(all)) {
        problems.push(`${tag} slot ${slot + 1}: the same draft twice came out differently`);
      }
      sim.rosters(all).forEach((roster, team) => {
        const lineup = sim.bestLineup(data, roster, 1);
        if (lineup.spots.some((x) => x.id === null)) {
          problems.push(`${tag} slot ${slot + 1}: team ${team + 1} can't fill a lineup`);
        }
      });
      const games = new Map();
      sim.schedule(lg).forEach((week) =>
        week.forEach(([a, b]) => {
          const k = [a, b].sort().join("-");
          games.set(k, (games.get(k) ?? 0) + 1);
        }),
      );
      if (games.size !== (sim.TEAMS * (sim.TEAMS - 1)) / 2 || [...games.values()].some((n) => n !== 2)) {
        problems.push(`${tag} slot ${slot + 1}: the schedule isn't everyone-plays-everyone-twice`);
      }
      const result = sim.simulateSeason(lg, data, all);
      const me = sim.summarize(result, slot);
      const code = sim.encodeResult({ season: data.season, seed: lg.seed, slot, w: me.w, l: me.l, pf: me.pf, finish: me.finish });
      const back = sim.parseResult(code);
      if (!back || back.seed !== lg.seed || back.slot !== slot || back.w !== me.w) {
        problems.push(`${tag} slot ${slot + 1}: the share code ${code} doesn't read back`);
      }
    }
  }
}

// ── Interview prep ────────────────────────────────────────────
// Every interview pattern needs enough questions to be practice, and Query
// Doctor has to keep naming the right mistake for the classic wrong answers.
// Each case is a real wrong query against a real question's key; the
// expected finding is the one a tutor would lead with.
let doctorChecked = 0;
{
  const ip = await loadProjectTs(path.join(root, "lib/interview-patterns.ts"), root);
  for (const p of ip.PATTERNS) {
    const n = ip.questionsFor(p).length;
    if (n < ip.MIN_PER_PATTERN) problems.push(`Interview pattern "${p.name}" has ${n} SQL questions; it needs ${ip.MIN_PER_PATTERN}`);
  }
  const doc = await loadProjectTs(path.join(root, "lib/query-doctor.ts"), root);
  const qs = await loadProjectTs(path.join(root, "lib/questions.ts"), root);
  const schemaOf = (q) => qs.schemaFor(q).map((t) => ({ name: t.table, columns: t.columns }));
  const cases = [
    ["week-3-hammer", "SELECT player, team, pts FROM week_results", "no-such-column"],
    ["week-3-hammer", "SELECT TOP 1 player, team, fantasy_pts FROM week_results", "top"],
    ["week-3-hammer", "SELECT player, team, fantasy_pts, FROM week_results", "trailing-comma"],
    ["week-3-hammer", "SELECT player, team, fantasy_pts FROM week_results WHERE season = 2024 AND week = 3 ORDER BY fantasy_pts LIMIT 1", "limit-sort"],
    ["week-3-hammer", "SELECT player, team, fantasy_pts FROM week_results WHERE season = 2024 AND week = 3 ORDER BY fantasy_pts DESC", "too-many-rows"],
    ["donut-week", "SELECT r.team_name, r.player, COALESCE(w.fantasy_pts, 0) AS week1_pts FROM rosters r JOIN week_results w ON w.player = r.player AND w.season = 2024 AND w.week = 1 ORDER BY week1_pts DESC, r.player", "too-few-rows"],
    ["donut-week", "SELECT r.team_name, r.player, w.fantasy_pts AS week1_pts FROM rosters r LEFT JOIN week_results w ON w.player = r.player AND w.season = 2024 AND w.week = 1 ORDER BY week1_pts DESC, r.player", "values"],
    ["donut-week", "SELECT r.team_name, r.player, COALESCE(w.fantasy_pts, 0) AS week1_pts FROM rosters r LEFT JOIN week_results w ON w.player = r.player WHERE w.season = 2024 AND w.week = 1 ORDER BY week1_pts DESC, r.player", "left-join-where"],
    ["above-the-line", "WITH ppg AS (SELECT player, position, AVG(fantasy_pts) AS ppg FROM week_results WHERE season = 2024 GROUP BY player, position) SELECT player, position, ppg FROM ppg p WHERE ppg > (SELECT AVG(ppg) FROM ppg x WHERE x.position = p.position) ORDER BY position, ppg DESC", "rounding"],
    ["above-the-line", "SELECT player, position, AVG(fantasy_pts) AS ppg FROM week_results WHERE AVG(fantasy_pts) > 10 GROUP BY player", "aggregate-in-where"],
    ["have-you-seen-this-running-back", "SELECT week FROM week_results WHERE season = 2024 AND player = 'Christian McCaffrey' AND fantasy_pts = NULL", "no-rows"],
  ];
  for (const [id, sql, want] of cases) {
    doctorChecked++;
    const q = qs.QUESTIONS.find((x) => x.id === id);
    if (!q) {
      problems.push(`Query Doctor case: no question ${id}`);
      continue;
    }
    let mine = null;
    let error = null;
    try {
      mine = run(sql) ?? null;
    } catch (e) {
      error = e.message;
    }
    const found = doc.diagnoseSql({ sql, error, mine, key: run(q.expected), orderMatters: q.orderMatters ?? false, schema: schemaOf(q) });
    if (!found.some((f) => f.kind === want)) {
      problems.push(`Query Doctor on ${id}: expected "${want}", got ${found.map((f) => f.kind).join(", ") || "nothing"} for: ${sql.slice(0, 70)}…`);
    }
  }
}

// ── Pattern guides ────────────────────────────────────────────
// Every interview pattern has a guide page, slugs are unique, and each
// guide's worked example is a SQL question in its own pattern (its key is
// shown in full on the page, so it has to be the right question).
let guidesChecked = 0;
{
  const ip = await loadProjectTs(path.join(root, "lib/interview-patterns.ts"), root);
  const pg = await loadProjectTs(path.join(root, "lib/pattern-guides.ts"), root);
  const slugs = new Set();
  for (const g of pg.PATTERN_GUIDES) {
    guidesChecked++;
    if (slugs.has(g.slug)) problems.push(`Pattern guide slug "${g.slug}" is used twice`);
    slugs.add(g.slug);
    const p = ip.patternOf(g.pattern);
    if (!p) {
      problems.push(`Pattern guide "${g.slug}" names pattern "${g.pattern}", which doesn't exist`);
      continue;
    }
    if (!ip.questionsFor(p).some((q) => q.id === g.example)) {
      problems.push(`Pattern guide "${g.slug}": worked example "${g.example}" isn't a SQL question in ${p.name}`);
    }
    if (g.mistakes.length < 3 || g.faq.length < 2) problems.push(`Pattern guide "${g.slug}" needs 3+ mistakes and 2+ FAQs`);
  }
  for (const p of ip.PATTERNS) {
    if (!pg.guideForPattern(p.id)) problems.push(`Interview pattern "${p.name}" has no guide page (lib/pattern-guides.ts)`);
  }
}

// ── The analyst path ──────────────────────────────────────────
// Its catalog has lessons and enough questions per pattern to tick, a fresh
// learner starts on step one, and a learner who has done everything is
// done (lib/analyst-path.ts).
let pathChecks = 0;
{
  const ap = await loadProjectTs(path.join(root, "lib/analyst-path.ts"), root);
  const cat = (await loadProjectTs(path.join(root, "lib/analyst-path-catalog.ts"), root)).pathCatalog();
  pathChecks++;
  if (!cat.lessons.length) problems.push("Analyst path: SQL Fundamentals has no live lessons");
  for (const p of cat.patterns) {
    pathChecks++;
    if (p.questions.length < ap.PER_PATTERN) {
      problems.push(`Analyst path: pattern "${p.name}" has ${p.questions.length} questions, fewer than the ${ap.PER_PATTERN} the path asks for`);
    }
  }
  const fresh = ap.analystPath({ completedLessons: [], solvedQuestions: [], mocks: [], screens: [], challengeSolved: 0, marks: {} }, cat);
  if (ap.currentStep(fresh)?.id !== "foundations") problems.push("Analyst path: a fresh learner doesn't start on Foundations");
  const all = ap.analystPath(
    {
      completedLessons: cat.lessons,
      solvedQuestions: cat.sqlQuestions,
      mocks: [{ format: "phone", solved: 2, of: 2 }, { format: "technical", solved: 3, of: 3 }],
      screens: [],
      challengeSolved: 0,
      marks: { leagueLoaded: "2026-10-05", portfolio: true },
    },
    cat,
  );
  pathChecks++;
  if (ap.currentStep(all) !== null) problems.push(`Analyst path: everything done still leaves "${ap.currentStep(all)?.title}" open`);
}

// ── Film Room ─────────────────────────────────────────────────
// Every SQL answer can be replayed clause by clause (lib/sql-steps.ts). Each
// step has to run on its own, and the last has to land on the key's result,
// or the replay would teach a different answer from the one being graded.
let filmSteps = 0;
{
  const st = await loadProjectTs(path.join(root, "lib/sql-steps.ts"), root);
  const qs = await loadProjectTs(path.join(root, "lib/questions.ts"), root);
  for (const q of qs.QUESTIONS.filter((x) => x.lang === "sql")) {
    const plan = st.planSteps(q.expected);
    if (!plan || plan.steps.length < 2) {
      problems.push(`Film Room can't replay ${q.id}: ${plan ? "only one step" : "the planner couldn't read it"}`);
      continue;
    }
    for (const step of plan.steps) {
      filmSteps++;
      try {
        db.exec(st.stepCountSql(step));
        db.exec(st.stepSql(step));
      } catch (e) {
        problems.push(`Film Room step "${step.label}" of ${q.id} doesn't run: ${e.message}`);
      }
    }
    const last = run(st.stepSql(plan.steps[plan.steps.length - 1]));
    if (JSON.stringify(last) !== JSON.stringify(run(q.expected))) {
      problems.push(`Film Room's last step of ${q.id} isn't the key's result`);
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

// The engine's own functions (customFunctions in lib/excel-engine.ts), each
// against an answer worked out by hand from the workbook. These are the
// places it differs from the library, so an upgrade that changes either side
// shows up here first.
for (const [sheet, f, want] of [
  ["Roster", '=MAXIFS(E2:E17,C2:C17,"WR")', 403],
  ["Roster", '=MINIFS(E2:E17,C2:C17,"QB")', 282.9],
  ["Roster", "=RANK(E10,E2:E17)", 9],
  ["Roster", "=RANK.EQ(E2,E2:E17,1)", 16],
  ["Roster", '=IFERROR(XLOOKUP("Puka Nacua",A2:A17,E2:E17),"none")', "none"],
  ["Roster", "=IFERROR(MATCH(1,E2:E17,0),0)", 0],
  ["Roster", "=INDEX(E2:E17,14)", 236.6],
  ["Roster", "=INDEX(A1:G1,3)", "Pos"],
  ["Roster", "=INDEX(B2:F17,3,4)", 379.1],
  ["Roster", "=SUM(INDEX(B2:F17,0,4))", 5016.8],
  ["Weeks", "=INDEX(B1:S1,MATCH(MAX(B2:S2),B2:S2,0))", "W15"],
  ["Weeks", "=COUNTBLANK(B14:S14)", 4],
]) {
  const res = await excel.evaluateFormula(f, sheet);
  if (res.error || !excel.valuesMatch(res.value, want)) {
    problems.push(`excel engine: ${f} on ${sheet} gave ${res.error ?? JSON.stringify(res.value)}, expected ${JSON.stringify(want)}`);
  }
}

// The Weeks sheet and the Python/R `weekly` table are the database's rows
// (scripts/build-question-frames.mjs). Re-derive both, so a rebuild that
// drifted from week_results can't put a wrong number in front of anyone.
{
  const frames = await loadProjectTs(path.join(root, "lib/question-frames.generated.ts"), root);
  const fromDb = db.exec(
    "SELECT player, position, team, week, fantasy_pts FROM week_results WHERE season = 2024 ORDER BY player, week",
  )[0].values;
  const key = (r) => r.join("|");
  const mine = [...frames.WEEKLY_2024].sort((a, b) => a[0].localeCompare(b[0]) || a[3] - b[3]);
  const dbSorted = [...fromDb].sort((a, b) => String(a[0]).localeCompare(String(b[0])) || a[3] - b[3]);
  if (mine.length !== dbSorted.length || mine.some((r, i) => key(r) !== key(dbSorted[i]))) {
    problems.push(`weekly frame: lib/question-frames.generated.ts disagrees with week_results 2024 — rerun scripts/build-question-frames.mjs`);
  }
  const sheet = excelData.WORKBOOK.Weeks;
  const roster = excelData.WORKBOOK.Roster.slice(1).map((r) => r[0]);
  sheet.slice(1).forEach((row, i) => {
    if (row[0] !== roster[i]) problems.push(`Weeks sheet row ${i + 2} is ${row[0]}, but the Roster sheet's row ${i + 2} is ${roster[i]}`);
    for (let w = 1; w <= 18; w++) {
      const hit = fromDb.find((r) => r[0] === row[0] && r[3] === w);
      const want = hit ? hit[4] : null;
      if (row[w] !== want) {
        problems.push(`Weeks sheet: ${row[0]} week ${w} is ${row[w]}, the database says ${want}`);
        break;
      }
    }
  });
}

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
console.log(`draft room checks         : ${draftChecked} (scouting presets per season, drafts from every slot)`);
console.log(`query doctor cases        : ${doctorChecked} (known wrong answers, the diagnosis a tutor would lead with)`);
console.log(`pattern guides            : ${guidesChecked} (one per interview pattern, each example in its pattern)`);
console.log(`analyst path checks       : ${pathChecks} (catalog, patterns tickable, fresh and finished learners)`);
console.log(`film room steps           : ${filmSteps} (every SQL answer replayed clause by clause, each step run)`);

if (problems.length === 0) {
  console.log("\nAll answer keys run, return rows, and have no cutoff ties.");
} else {
  console.log(`\n${problems.length} PROBLEM(S):`);
  problems.forEach((p) => console.log("  - " + p));
  process.exitCode = 1;
}
