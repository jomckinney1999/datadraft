import initSqlJs from "sql.js";
import path from "node:path";
import { loadTs as loadProjectTs } from "./load-ts.mjs";
const root = process.cwd();
const data = await loadProjectTs(path.join(root, "lib/fantasy-data.ts"), root);
const SQL = await initSqlJs();
const db = new SQL.Database();
db.run(data.buildSeedSql());
for (const q of process.argv.slice(2)) {
  try {
    const res = db.exec(q)[0];
    if (!res) { console.log(`\n-- ${q}\n(no rows)`); continue; }
    console.log(`\n-- ${q}`);
    console.log(res.columns.join(" | "));
    for (const row of res.values.slice(0, 30)) console.log(row.join(" | "));
    console.log(`(${res.values.length} rows)`);
  } catch (e) { console.log(`\n-- ${q}\nERROR: ${e.message}`); }
}
