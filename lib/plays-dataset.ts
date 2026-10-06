/**
 * The `plays` table: every scrimmage play, punt and field goal of the 2025
 * regular season, from nflverse's play-by-play (CC BY 4.0). Built by
 * scripts/build-plays-dataset.mjs into public/practice/plays-2025.json, and
 * fetched only by a question that uses it: ~4.4 MB as JSON, ~0.8 MB on the
 * wire, which is about what the lesson database costs.
 */

import type { Database } from "sql.js";

export const PLAYS_URL = "/practice/plays-2025.json";

export type PlaysFile = {
  season: number;
  columns: string[];
  rows: (string | number | null)[][];
};

const TYPES: Record<string, "TEXT" | "INTEGER" | "REAL"> = {
  game_id: "TEXT",
  posteam: "TEXT",
  defteam: "TEXT",
  play_type: "TEXT",
  passer: "TEXT",
  rusher: "TEXT",
  receiver: "TEXT",
  td_team: "TEXT",
  field_goal_result: "TEXT",
  epa: "REAL",
};

/** Creates `plays` and loads every row in one transaction. */
export function seedPlays(db: Database, file: PlaysFile): void {
  const cols = file.columns;
  db.run(`CREATE TABLE plays (${cols.map((c) => `${c} ${TYPES[c] ?? "INTEGER"}`).join(", ")});`);
  const stmt = db.prepare(`INSERT INTO plays VALUES (${cols.map(() => "?").join(", ")});`);
  db.run("BEGIN;");
  try {
    for (const row of file.rows) stmt.run(row);
    // A drive is (game_id, posteam, drive), and most questions group or
    // join on the first two. Without the index a join back to games or a
    // per-team subquery rescans 36k rows each time (see app-dataset.ts
    // for what heavy scans did to Node on Windows).
    db.run("CREATE INDEX plays_game_team ON plays (game_id, posteam, drive);");
    db.run("COMMIT;");
  } catch (e) {
    db.run("ROLLBACK;");
    throw e;
  } finally {
    stmt.free();
  }
}

/** Fetches the file and seeds it (browser). */
export async function loadPlays(db: Database): Promise<void> {
  const res = await fetch(PLAYS_URL);
  if (!res.ok) throw new Error(`plays: ${res.status}`);
  seedPlays(db, (await res.json()) as PlaysFile);
}
