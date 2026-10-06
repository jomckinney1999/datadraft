// Builds public/practice/plays-2025.json: every scrimmage play, punt and
// field goal of the 2025 regular season, from nflverse's play-by-play
// release (CC BY 4.0). It is the question bank's third database, `plays`,
// loaded only by the questions that use it.
//
//   node scripts/build-plays-dataset.mjs
//
// Pinned like the lesson data: rebuild by hand, then run
// scripts/verify-answer-keys.mjs, which runs every key against this file.
//
// What is kept, and why:
//   - REG only. Playoffs are a dozen teams playing a different game.
//   - pass, run, punt and field_goal plays. Kickoffs, extra points, kneels,
//     spikes, two-point tries and penalties with no play are left out, so
//     "a play" means what a fan means by it.
//   - Names are as the play-by-play writes them (P.Mahomes). That is the
//     real data's shape, and resolving them to full names would be a guess.
//   - Team codes are nflverse's, LA included, so `plays` joins `games` on
//     game_id with no mapping.
//   - epa is nflverse's expected points model, rounded to 3 places. It is a
//     model's number, and the questions that use it say so.

import { writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const SEASON = 2025;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const URL = `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${SEASON}.csv.gz`;

process.stdout.write(`fetching ${URL.split("/").pop()} … `);
const res = await fetch(URL);
if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${URL}`);
const text = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
const raw = parse(text, { columns: true, skip_empty_lines: true, relax_column_count: true });
console.log(`${raw.length} rows`);

const KEEP = new Set(["pass", "run", "punt", "field_goal"]);
const int = (v) => (v === "" || v === "NA" ? null : Math.round(Number(v)));
const flag = (v) => (v === "1" || v === "1.0" ? 1 : 0);
const str = (v) => (v === "" || v === "NA" ? null : v);
const dec = (v, places) => (v === "" || v === "NA" ? null : Number(Number(v).toFixed(places)));

/** Column name → how to read it from the nflverse row. Order is the table's. */
const COLUMNS = [
  ["game_id", (r) => r.game_id],
  ["play_id", (r) => int(r.play_id)],
  ["week", (r) => int(r.week)],
  ["posteam", (r) => r.posteam],
  ["defteam", (r) => r.defteam],
  ["drive", (r) => int(r.drive)],
  ["qtr", (r) => int(r.qtr)],
  ["game_seconds_remaining", (r) => int(r.game_seconds_remaining)],
  ["down", (r) => int(r.down)],
  ["ydstogo", (r) => int(r.ydstogo)],
  ["yardline_100", (r) => int(r.yardline_100)],
  ["score_differential", (r) => int(r.score_differential)],
  ["play_type", (r) => r.play_type],
  ["shotgun", (r) => flag(r.shotgun)],
  ["passer", (r) => str(r.passer_player_name)],
  ["rusher", (r) => str(r.rusher_player_name)],
  ["receiver", (r) => str(r.receiver_player_name)],
  ["air_yards", (r) => (r.play_type === "pass" ? int(r.air_yards) : null)],
  ["complete_pass", (r) => flag(r.complete_pass)],
  ["yards_gained", (r) => int(r.yards_gained)],
  ["first_down", (r) => flag(r.first_down)],
  ["touchdown", (r) => flag(r.touchdown)],
  ["td_team", (r) => str(r.td_team)],
  ["interception", (r) => flag(r.interception)],
  ["sack", (r) => flag(r.sack)],
  ["fumble_lost", (r) => flag(r.fumble_lost)],
  ["field_goal_result", (r) => str(r.field_goal_result)],
  ["kick_distance", (r) => (r.play_type === "field_goal" ? int(r.kick_distance) : null)],
  ["epa", (r) => dec(r.epa, 3)],
];

const rows = raw
  .filter(
    (r) =>
      r.season_type === "REG" &&
      KEEP.has(r.play_type) &&
      r.two_point_attempt !== "1" &&
      r.posteam &&
      r.posteam !== "NA",
  )
  .map((r) => COLUMNS.map(([, read]) => read(r)));

// A scrimmage play with no down is a two-point try or a timing oddity.
const downIdx = COLUMNS.findIndex(([c]) => c === "down");
const typeIdx = COLUMNS.findIndex(([c]) => c === "play_type");
const kept = rows.filter((r) => r[downIdx] !== null || r[typeIdx] === "field_goal" || r[typeIdx] === "punt");

const weeks = new Set(kept.map((r) => r[2]));
const out = {
  season: SEASON,
  source: URL,
  builtAt: new Date().toISOString().slice(0, 10),
  columns: COLUMNS.map(([c]) => c),
  rows: kept,
};
const dir = path.join(root, "public/practice");
mkdirSync(dir, { recursive: true });
const json = JSON.stringify(out);
writeFileSync(path.join(dir, `plays-${SEASON}.json`), json);
console.log(
  `plays ${kept.length} (dropped ${rows.length - kept.length} with no down), weeks ${Math.min(...weeks)}–${Math.max(...weeks)}, ${(json.length / 1024 / 1024).toFixed(2)} MB`,
);
