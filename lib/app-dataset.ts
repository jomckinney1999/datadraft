/**
 * Benchwarmer: an INVENTED fantasy football app, for product-analytics
 * questions (daily actives, retention, funnels, sessions, MRR). Built by
 * scripts/build-app-dataset.mjs into public/practice/benchwarmer-2025.json
 * and fetched only by a question that uses it (~170 KB on the wire).
 */

import type { Database } from "sql.js";

export const APP_URL = "/practice/benchwarmer-2025.json";

export type TablesFile = {
  tables: {
    table: string;
    columns: string[];
    types: string[];
    rows: (string | number | null)[][];
  }[];
};

/** Creates each table and loads its rows, all in one transaction. */
export function seedTables(db: Database, file: TablesFile): void {
  db.run("BEGIN;");
  try {
    for (const t of file.tables) {
      db.run(`CREATE TABLE ${t.table} (${t.columns.map((c, i) => `${c} ${t.types[i]}`).join(", ")});`);
      const stmt = db.prepare(`INSERT INTO ${t.table} VALUES (${t.columns.map(() => "?").join(", ")});`);
      try {
        for (const row of t.rows) stmt.run(row);
      } finally {
        stmt.free();
      }
    }
    db.run("COMMIT;");
  } catch (e) {
    db.run("ROLLBACK;");
    throw e;
  }
}

/** Fetches the app's tables and seeds them (browser). */
export async function loadApp(db: Database): Promise<void> {
  const res = await fetch(APP_URL);
  if (!res.ok) throw new Error(`benchwarmer: ${res.status}`);
  seedTables(db, (await res.json()) as TablesFile);
}
