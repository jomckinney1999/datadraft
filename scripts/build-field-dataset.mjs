// One-time (re-runnable) builder for the Practice Field dataset.
// Downloads real weekly player stats from nflverse-data's `stats_player`
// release (the successor to the older `player_stats` tag used by
// lib/data/nflverse.ts), filters to fantasy-relevant skill players, and
// writes a compact JSON seed to public/field-data.json for the in-browser
// sql.js sandbox at /field.
//
// Usage: node scripts/build-field-dataset.mjs
// Re-run each season with WEEKLY_SEASON bumped once nflverse publishes it.

import { writeFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";

const WEEKLY_SEASON = 2026; // weekly detail for the current season, through its latest week
const SUMMARY_SEASONS = [2024, 2025, 2026]; // season-level rollups (the newest is in progress)
const MIN_SEASON_PPR = 50; // keeps ~top 350 fantasy-relevant players
const POSITIONS = new Set(["QB", "RB", "WR", "TE"]);

const BASE =
  "https://github.com/nflverse/nflverse-data/releases/download/stats_player";

const num = (v) => {
  if (v === "" || v === undefined) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

async function fetchSeasonWeekly(season) {
  const url = `${BASE}/stats_player_week_${season}.csv`;
  console.log(`fetching ${url} …`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const rows = parse(await res.text(), {
    columns: true,
    skip_empty_lines: true,
  });
  return rows.filter(
    (r) => r.season_type === "REG" && POSITIONS.has(r.position),
  );
}

function round1(x) {
  return Math.round(x * 10) / 10;
}

// 32 teams — static, small, and gives learners a join target.
const TEAMS = [
  ["ARI", "Arizona Cardinals", "NFC", "West"],
  ["ATL", "Atlanta Falcons", "NFC", "South"],
  ["BAL", "Baltimore Ravens", "AFC", "North"],
  ["BUF", "Buffalo Bills", "AFC", "East"],
  ["CAR", "Carolina Panthers", "NFC", "South"],
  ["CHI", "Chicago Bears", "NFC", "North"],
  ["CIN", "Cincinnati Bengals", "AFC", "North"],
  ["CLE", "Cleveland Browns", "AFC", "North"],
  ["DAL", "Dallas Cowboys", "NFC", "East"],
  ["DEN", "Denver Broncos", "AFC", "West"],
  ["DET", "Detroit Lions", "NFC", "North"],
  ["GB", "Green Bay Packers", "NFC", "North"],
  ["HOU", "Houston Texans", "AFC", "South"],
  ["IND", "Indianapolis Colts", "AFC", "South"],
  ["JAX", "Jacksonville Jaguars", "AFC", "South"],
  ["KC", "Kansas City Chiefs", "AFC", "West"],
  ["LA", "Los Angeles Rams", "NFC", "West"],
  ["LAC", "Los Angeles Chargers", "AFC", "West"],
  ["LV", "Las Vegas Raiders", "AFC", "West"],
  ["MIA", "Miami Dolphins", "AFC", "East"],
  ["MIN", "Minnesota Vikings", "NFC", "North"],
  ["NE", "New England Patriots", "AFC", "East"],
  ["NO", "New Orleans Saints", "NFC", "South"],
  ["NYG", "New York Giants", "NFC", "East"],
  ["NYJ", "New York Jets", "AFC", "East"],
  ["PHI", "Philadelphia Eagles", "NFC", "East"],
  ["PIT", "Pittsburgh Steelers", "AFC", "North"],
  ["SEA", "Seattle Seahawks", "NFC", "West"],
  ["SF", "San Francisco 49ers", "NFC", "West"],
  ["TB", "Tampa Bay Buccaneers", "NFC", "South"],
  ["TEN", "Tennessee Titans", "AFC", "South"],
  ["WAS", "Washington Commanders", "NFC", "East"],
];

function summarize(rows) {
  // rows → one summary per player for that season
  const byPlayer = new Map();
  for (const r of rows) {
    const key = r.player_display_name;
    if (!byPlayer.has(key)) {
      byPlayer.set(key, {
        player: key,
        team: r.team,
        position: r.position,
        season: Number(r.season),
        games: 0,
        pass_yards: 0,
        pass_tds: 0,
        interceptions: 0,
        rush_yards: 0,
        rush_tds: 0,
        receptions: 0,
        rec_yards: 0,
        rec_tds: 0,
        fantasy_ppr: 0,
      });
    }
    const s = byPlayer.get(key);
    s.team = r.team; // last team of the season wins
    s.games += 1;
    s.pass_yards += num(r.passing_yards);
    s.pass_tds += num(r.passing_tds);
    s.interceptions += num(r.passing_interceptions);
    s.rush_yards += num(r.rushing_yards);
    s.rush_tds += num(r.rushing_tds);
    s.receptions += num(r.receptions);
    s.rec_yards += num(r.receiving_yards);
    s.rec_tds += num(r.receiving_tds);
    s.fantasy_ppr += num(r.fantasy_points_ppr);
  }
  // A season still being played is held to the same pace, not the same total:
  // 50 PPR over 17 weeks is under 3 a week, and asking three weeks of 2026 to
  // clear 50 kept barely forty players and emptied the weekly table.
  const weeks = Math.max(...rows.map((r) => Number(r.week) || 0));
  const bar = MIN_SEASON_PPR * Math.min(1, weeks / 17);
  return [...byPlayer.values()].filter((s) => s.fantasy_ppr >= bar);
}

const weeklyBySeason = new Map();
for (const season of SUMMARY_SEASONS) {
  weeklyBySeason.set(season, await fetchSeasonWeekly(season));
}

const seasons = SUMMARY_SEASONS.flatMap((season) =>
  summarize(weeklyBySeason.get(season)).map((s) => [
    s.player,
    s.team,
    s.position,
    s.season,
    s.games,
    s.pass_yards,
    s.pass_tds,
    s.interceptions,
    s.rush_yards,
    s.rush_tds,
    s.receptions,
    s.rec_yards,
    s.rec_tds,
    round1(s.fantasy_ppr),
    round1(s.fantasy_ppr / s.games),
  ]),
);

// weekly detail: only players who were fantasy-relevant in the weekly season
const relevant = new Set(
  summarize(weeklyBySeason.get(WEEKLY_SEASON)).map((s) => s.player),
);
const weekly = weeklyBySeason
  .get(WEEKLY_SEASON)
  .filter((r) => relevant.has(r.player_display_name))
  .map((r) => [
    r.player_display_name,
    r.team,
    r.position,
    Number(r.week),
    r.opponent_team,
    num(r.completions),
    num(r.attempts),
    num(r.passing_yards),
    num(r.passing_tds),
    num(r.passing_interceptions),
    num(r.carries),
    num(r.rushing_yards),
    num(r.rushing_tds),
    num(r.receptions),
    num(r.targets),
    num(r.receiving_yards),
    num(r.receiving_tds),
    round1(num(r.fantasy_points_ppr)),
  ]);

// ── Injuries and snap counts ──────────────────────────────────────
// Two things a real analyst reaches for and neither the lessons nor the field
// had: why a player disappeared from the data, and how much he was actually on
// the field. Both ship gzipped, so they need inflating by hand — fetch only
// decompresses what the server marks as Content-Encoding.
import { gunzipSync } from "node:zlib";

async function fetchGz(url) {
  process.stdout.write(`fetching ${url.split("/").pop()} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const text = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`${rows.length} rows`);
  return rows;
}

const injuryRows = await fetchGz(
  `https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_${WEEKLY_SEASON}.csv.gz`,
);
const injuries = injuryRows
  .filter((r) => relevant.has(r.full_name) && (r.report_status || r.practice_status))
  .map((r) => [
    r.full_name,
    r.team,
    r.position,
    Number(r.week),
    r.report_status || "",
    r.report_primary_injury || "",
    r.practice_status || "",
  ]);

const snapRows = await fetchGz(
  `https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_${WEEKLY_SEASON}.csv.gz`,
);
const snaps = snapRows
  .filter((r) => relevant.has(r.player) && r.game_type === "REG")
  .map((r) => [
    r.player,
    r.team,
    r.position,
    Number(r.week),
    r.opponent,
    num(r.offense_snaps),
    Math.round(num(r.offense_pct) * 100),
  ]);

const out = {
  source:
    "nflverse-data stats_player release (https://github.com/nflverse/nflverse-data) — free, community-maintained real NFL stats",
  generated: new Date().toISOString().slice(0, 10),
  weeklySeason: WEEKLY_SEASON,
  summarySeasons: SUMMARY_SEASONS,
  weekly,
  seasons,
  teams: TEAMS,
  injuries,
  snaps,
};

await writeFile(
  new URL("../public/field-data.json", import.meta.url),
  JSON.stringify(out),
);
console.log(
  `wrote public/field-data.json — ${weekly.length} weekly rows (${WEEKLY_SEASON}), ${seasons.length} season rows, ${TEAMS.length} teams, ${injuries.length} injury rows, ${snaps.length} snap rows`,
);
