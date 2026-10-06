// Times every SQL answer key and its Film Room replay against the same
// database the verifier seeds, slowest first. For when the verifier crashes
// or slows down: a question whose replay takes seconds wants an index in its
// seed (see lib/app-dataset.ts).
//
//   node scripts/time-sql-keys.mjs
//   node scripts/time-sql-keys.mjs "CREATE INDEX ..."   (try an index first)
import initSqlJs from "sql.js";
import path from "node:path";
import fs from "node:fs";
import { loadTs } from "./load-ts.mjs";

const root = path.resolve(".");
const data = await loadTs(path.join(root, "lib/fantasy-data.ts"), root);
const SQL = await initSqlJs();
const db = new SQL.Database();
db.run(data.buildSeedSql());
db.run((await loadTs(path.join(root, "lib/practice-datasets.ts"), root)).buildShopSeedSql());
(await loadTs(path.join(root, "lib/plays-dataset.ts"), root)).seedPlays(db, JSON.parse(fs.readFileSync("public/practice/plays-2025.json", "utf8")));
(await loadTs(path.join(root, "lib/app-dataset.ts"), root)).seedTables(db, JSON.parse(fs.readFileSync("public/practice/benchwarmer-2025.json", "utf8")));
if (process.argv[2]) for (const s of process.argv.slice(2)) db.run(s);
const st = await loadTs(path.join(root, "lib/sql-steps.ts"), root);
const qs = await loadTs(path.join(root, "lib/questions.ts"), root);
const out = [];
for (const q of qs.QUESTIONS.filter((x) => x.lang === "sql")) {
  const t0 = performance.now();
  db.exec(q.expected);
  const key = performance.now() - t0;
  const plan = st.planSteps(q.expected);
  let film = 0;
  for (const step of plan?.steps ?? []) {
    const t1 = performance.now();
    db.exec(st.stepCountSql(step));
    film += performance.now() - t1;
  }
  out.push({ id: q.id, key: Math.round(key), film: Math.round(film) });
}
out.sort((a, b) => b.key + b.film - (a.key + a.film));
console.log(out.slice(0, 12).map((r) => `${r.id.padEnd(28)} key ${String(r.key).padStart(5)}ms  film ${String(r.film).padStart(6)}ms`).join("\n"));
console.log("total ms", out.reduce((s, r) => s + r.key + r.film, 0));
