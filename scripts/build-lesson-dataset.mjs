// Builds the REAL dataset the SQL lessons and the Excel workbook run on.
//
// This replaces a synthetic generator that produced deterministic noise around
// a hand-picked "basePpg". That data was not merely approximate, it was
// impossible: it had Tyreek Hill on Miami in 2016 (he was on Kansas City until
// 2022), Puka Nacua playing seasons before he was drafted, and every player
// scoring on a tidy bell curve. Teaching analysis on invented numbers
// undercuts the whole premise of the product.
//
// Source: nflverse-data, the community-maintained NFL data project.
//   https://github.com/nflverse/nflverse-data
//   Release tag `stats_player`, file stats_player_week_<season>.csv
//   Licence: CC-BY-4.0 (attribution required — see lib/data-source.ts)
//
// Outputs:
//   lib/lesson-data.generated.ts  compact real rows, imported by fantasy-data
//   public/data/*.csv             the exact seeded tables, for learners to
//                                 download and open in their own tool
//
// Usage: node scripts/build-lesson-dataset.mjs
// Re-run when you want newer seasons; bump SEASONS below.

import { writeFile, mkdir } from "node:fs/promises";
import { parse } from "csv-parse/sync";

const SEASONS = [2022, 2023, 2024];
const BASE =
  "https://github.com/nflverse/nflverse-data/releases/download/stats_player";

/**
 * A fixed cast rather than "top N by points".
 *
 * Lesson prose names specific players — Josh Allen alone appears 22 times in
 * lib/curriculum.ts — so the roster has to be stable across rebuilds. Picking
 * by rank would silently swap players out when a season is added and quietly
 * break every lesson that mentions one by name.
 */
const CAST = [
  "Josh Allen",
  "Patrick Mahomes",
  "Lamar Jackson",
  "Jalen Hurts",
  "Christian McCaffrey",
  "Derrick Henry",
  "Saquon Barkley",
  "Bijan Robinson",
  "Jahmyr Gibbs",
  "Tyreek Hill",
  "CeeDee Lamb",
  "Justin Jefferson",
  "Ja'Marr Chase",
  "Amon-Ra St. Brown",
  "A.J. Brown",
  "Puka Nacua",
  "Travis Kelce",
  "George Kittle",
  "Sam LaPorta",
  "Davante Adams",
];

const round1 = (x) => Math.round(x * 10) / 10;
const num = (v) => {
  if (v === "" || v === undefined) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

async function fetchSeason(season) {
  const url = `${BASE}/stats_player_week_${season}.csv`;
  process.stdout.write(`fetching ${season} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const rows = parse(await res.text(), {
    columns: true,
    skip_empty_lines: true,
  });
  console.log(`${rows.length} rows`);
  return rows;
}

const wanted = new Set(CAST);
const weekRows = [];

for (const season of SEASONS) {
  const rows = await fetchSeason(season);
  for (const r of rows) {
    if (r.season_type !== "REG") continue;
    const name = r.player_display_name || r.player_name;
    if (!wanted.has(name)) continue;
    // A row exists for every week a player was on a roster; skip games they
    // did not actually play, which is what a bye or an injury looks like in
    // real data. Keeping them would invent zeros nobody scored.
    const played = num(r.completions) + num(r.carries) + num(r.targets);
    if (played === 0) continue;
    weekRows.push({
      player: name,
      team: r.team,
      position: r.position,
      season: num(r.season),
      week: num(r.week),
      fantasy_pts: round1(num(r.fantasy_points_ppr)),
    });
  }
}

// Sort by season, week, then points — so `SELECT * FROM week_results LIMIT 5`
// shows five DIFFERENT players from one week, not the same player five times.
// The old generator emitted player-by-player, so the very first thing a
// learner ever saw was Tyreek Hill repeated five times, which reads as a
// broken table.
weekRows.sort(
  (a, b) =>
    a.season - b.season ||
    a.week - b.week ||
    b.fantasy_pts - a.fantasy_pts ||
    a.player.localeCompare(b.player),
);

const players = [...new Set(weekRows.map((r) => r.player))].sort();
const missing = CAST.filter((c) => !players.includes(c));
if (missing.length) {
  console.warn(`\nWARNING: no rows found for: ${missing.join(", ")}`);
}

// Latest team and position per player, for the roster-style tables.
const latest = new Map();
for (const r of weekRows) latest.set(r.player, r);

// Season totals — what the Excel workbook is built from.
const totals = new Map();
for (const r of weekRows) {
  const key = `${r.player}|${r.season}`;
  const cur = totals.get(key) ?? {
    player: r.player,
    season: r.season,
    team: r.team,
    position: r.position,
    games: 0,
    points: 0,
  };
  cur.games += 1;
  cur.points += r.fantasy_pts;
  cur.team = r.team;
  totals.set(key, cur);
}

const playerIndex = new Map(players.map((p, i) => [p, i]));

// Compact encoding: the player name is the largest field by far, so store it
// once in PLAYER_NAMES and reference it by index in the week rows.
const packed = weekRows.map((r) => [
  playerIndex.get(r.player),
  r.team,
  r.position,
  r.season,
  r.week,
  r.fantasy_pts,
]);

const generated = `// GENERATED by scripts/build-lesson-dataset.mjs — do not edit by hand.
//
// Real NFL weekly fantasy production (PPR) from nflverse-data, seasons
// ${SEASONS.join(", ")}, regular season only, games actually played.
// Source and licence: lib/data-source.ts
//
// Rows are ordered season → week → points desc so the first rows a learner
// sees are different players from the same week.

export const PLAYER_NAMES: string[] = ${JSON.stringify(players, null, 0)};

/** [playerIndex, team, position, season, week, fantasy_pts] */
export type PackedWeek = [number, string, string, number, number, number];

export const PACKED_WEEKS: PackedWeek[] = [
${packed.map((p) => `  ${JSON.stringify(p)},`).join("\n")}
];

/** [player, team, position, season, games, points] — real season totals. */
export const SEASON_TOTALS: [string, string, string, number, number, number][] = [
${[...totals.values()]
  .sort((a, b) => b.season - a.season || b.points - a.points)
  .map(
    (t) =>
      `  ${JSON.stringify([t.player, t.team, t.position, t.season, t.games, round1(t.points)])},`,
  )
  .join("\n")}
];
`;

await writeFile("lib/lesson-data.generated.ts", generated, "utf8");
console.log(
  `\nlib/lesson-data.generated.ts — ${weekRows.length} week rows, ${players.length} players, ${totals.size} season totals`,
);

// ── Downloadable copies of exactly what gets seeded ───────────────
await mkdir("public/data", { recursive: true });

const csv = (header, rows) =>
  [header.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n") +
  "\n";
const csvCell = (v) =>
  typeof v === "string" && (v.includes(",") || v.includes('"'))
    ? `"${v.replace(/"/g, '""')}"`
    : String(v);

await writeFile(
  "public/data/week_results.csv",
  csv(
    ["player", "team", "position", "season", "week", "fantasy_pts"],
    weekRows.map((r) => [
      r.player,
      r.team,
      r.position,
      r.season,
      r.week,
      r.fantasy_pts,
    ]),
  ),
  "utf8",
);

await writeFile(
  "public/data/season_totals.csv",
  csv(
    ["player", "team", "position", "season", "games", "points"],
    [...totals.values()]
      .sort((a, b) => b.season - a.season || b.points - a.points)
      .map((t) => [
        t.player,
        t.team,
        t.position,
        t.season,
        t.games,
        round1(t.points),
      ]),
  ),
  "utf8",
);

console.log(
  "public/data/week_results.csv + season_totals.csv written (learner downloads)",
);

// Quick sanity report so a rebuild that goes wrong is obvious immediately.
const top = [...totals.values()].sort((a, b) => b.points - a.points)[0];
console.log(
  `\nsanity: best season on file = ${top.player} ${top.season} (${round1(top.points)} pts in ${top.games} games)`,
);
console.log(
  `        seasons ${Math.min(...weekRows.map((r) => r.season))}–${Math.max(...weekRows.map((r) => r.season))}, weeks ${Math.min(...weekRows.map((r) => r.week))}–${Math.max(...weekRows.map((r) => r.week))}`,
);
