// Builds the Draft Room's data: a real fantasy draft board for each season,
// the scouting history you're allowed to see before it, and the real season
// it plays out over.
//
// For each draft season S:
//   board    the top BOARD_SIZE QB/RB/WR/TE by Sleeper's real preseason PPR
//            ADP for S, with team, bye week, age and NFL draft capital
//   scout    every regular-season game those players played in the seasons
//            BEFORE S (S-3 to S-1) — the only stats the draft can see
//   season   their real PPR points in weeks 1–17 of S, which the league is
//            scored on after the draft. Never loaded into the scouting
//            database: a draft that could query the season it's drafting for
//            would be a lookup, not a draft.
//
// Sources (same as the lessons — see scripts/build-lesson-dataset.mjs):
//   nflverse-data (CC BY 4.0): stats_player weekly files, players.csv
//     (birth dates, NFL draft round and pick, headshots), schedules (byes)
//   Sleeper: preseason ADP from api.sleeper.com/projections (undocumented,
//     the endpoint Sleeper's own app uses), player ids from the public API
//
// Outputs:
//   public/draft/<S>.json              one file per season, fetched on demand
//   lib/draft-seasons.generated.ts     which seasons exist, for the UI
//
// Usage: node scripts/build-draft-dataset.mjs
// Pinned like the lesson data: re-run by hand, then node
// scripts/verify-answer-keys.mjs (it runs the draft checks too).

import { writeFile, mkdir } from "node:fs/promises";
import { parse } from "csv-parse/sync";

const DRAFT_SEASONS = [2025, 2024, 2023];
const SCOUT_YEARS = 3;
/** 8 teams × 12 rounds is 96 picks; the rest of the board is the sleepers. */
const BOARD_SIZE = 192;
/** The fantasy season the league plays: weeks 1–17. */
const LAST_WEEK = 17;
const POSITIONS = ["QB", "RB", "WR", "TE"];

const STATS = "https://github.com/nflverse/nflverse-data/releases/download/stats_player";
const PLAYERS_CSV = "https://github.com/nflverse/nflverse-data/releases/download/players/players.csv";
const SCHEDULE_CSV = "https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv";

const num = (v) => {
  if (v === "" || v === undefined || v === null) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};
const r1 = (x) => Math.round(x * 10) / 10;
const r3 = (x) => Math.round(x * 1000) / 1000;
const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

async function getText(url, label) {
  process.stdout.write(`fetching ${label} … `);
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`${res.status}`);
    return null;
  }
  const text = await res.text();
  console.log(`${Math.round(text.length / 1024)} KB`);
  return text;
}
const csv = (text) => parse(text, { columns: true, skip_empty_lines: true, relax_column_count: true });

// ── Shared lookups ────────────────────────────────────────────────
const nflPlayers = csv(await getText(PLAYERS_CSV, "nflverse players"));
const bioById = new Map(nflPlayers.map((p) => [p.gsis_id, p]));
// Names differ between the two sources by suffix (Brian Thomas Jr., Kenneth
// Walker III) and by short first names (Josh / Joshua), so every spelling a
// player goes by is a key, suffixes stripped.
const nameKey = (s) => norm(String(s ?? "").replace(/(jr|sr|ii|iii|iv|v)\.?$/i, ""));
const bioByName = new Map();
for (const p of nflPlayers) {
  if (!POSITIONS.includes(p.position)) continue;
  const spellings = [
    p.display_name,
    `${p.first_name} ${p.last_name}`,
    `${p.common_first_name} ${p.last_name}`,
    `${p.football_name} ${p.last_name}`,
  ];
  for (const n of spellings) {
    const key = `${nameKey(n)}|${p.position}`;
    // A shared name keeps the most recent player.
    const cur = bioByName.get(key);
    if (!cur || num(p.last_season) > num(cur.last_season)) bioByName.set(key, p);
  }
}

const schedule = csv(await getText(SCHEDULE_CSV, "schedules"));

process.stdout.write("fetching Sleeper players … ");
const sleeperPlayers = await (await fetch("https://api.sleeper.app/v1/players/nfl")).json();
console.log("ok");

const weeklyCache = new Map();
async function weekly(season) {
  if (!weeklyCache.has(season)) {
    const text = await getText(`${STATS}/stats_player_week_${season}.csv`, `weekly ${season}`);
    weeklyCache.set(season, text ? csv(text).filter((r) => r.season_type === "REG") : null);
  }
  return weeklyCache.get(season);
}

function byeWeeks(season) {
  const played = new Map(); // team -> Set(week)
  for (const g of schedule) {
    if (num(g.season) !== season || g.game_type !== "REG") continue;
    for (const t of [g.home_team, g.away_team].map(teamCode)) {
      if (!played.has(t)) played.set(t, new Set());
      played.get(t).add(num(g.week));
    }
  }
  const lastWeek = Math.max(...[...played.values()].flatMap((s) => [...s]));
  const bye = new Map();
  for (const [team, weeks] of played) {
    for (let w = 1; w <= lastWeek; w++) {
      if (!weeks.has(w)) {
        bye.set(team, w);
        break;
      }
    }
  }
  return bye;
}

// nflverse and Sleeper spell a few teams differently.
const TEAM_ALIAS = { JAC: "JAX", LA: "LAR", WSH: "WAS" };
const teamCode = (t) => TEAM_ALIAS[t] ?? t;

function ageOn(birth, season) {
  if (!birth) return null;
  const b = new Date(`${birth}T00:00:00Z`);
  const ref = new Date(Date.UTC(season, 8, 1)); // Sept 1 of the draft season
  return r1((ref - b) / (365.25 * 24 * 3600 * 1000));
}

// The columns of the scouting `weekly` table, in order. Kept to what an
// analyst would actually reach for; the full nflverse file has 150.
const SCOUT_COLS = [
  "player_id",
  "season",
  "week",
  "team",
  "opponent",
  "fantasy_pts",
  "pass_att",
  "pass_yds",
  "pass_td",
  "ints",
  "carries",
  "rush_yds",
  "rush_td",
  "targets",
  "receptions",
  "rec_yds",
  "rec_td",
  "target_share",
];

const built = [];
await mkdir("public/draft", { recursive: true });

for (const season of DRAFT_SEASONS) {
  console.log(`\n── ${season} draft ──`);
  process.stdout.write(`fetching Sleeper ${season} ADP … `);
  const adpRows = await (
    await fetch(
      `https://api.sleeper.com/projections/nfl/${season}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&order_by=adp_ppr`,
    )
  ).json();
  console.log(`${adpRows.length} rows`);

  const ranked = adpRows
    .filter((e) => typeof e.stats?.adp_ppr === "number" && e.stats.adp_ppr < 999)
    .filter((e) => POSITIONS.includes(e.player?.position))
    .sort((a, b) => a.stats.adp_ppr - b.stats.adp_ppr);

  const seasonRows = await weekly(season);
  if (!seasonRows) throw new Error(`no nflverse weekly file for ${season}`);
  const bye = byeWeeks(season);

  // Resolve each Sleeper player to an nflverse gsis id: Sleeper's own
  // cross-reference first, then name + position.
  const board = [];
  const seen = new Set();
  for (const e of ranked) {
    if (board.length >= BOARD_SIZE) break;
    const sp = sleeperPlayers[e.player_id] ?? {};
    const name = `${e.player.first_name} ${e.player.last_name}`.trim();
    const pos = e.player.position;
    let bio = bioById.get(String(sp.gsis_id ?? "").trim());
    if (!bio) bio = bioByName.get(`${nameKey(name)}|${pos}`);
    if (!bio) {
      console.warn(`  skip (no nflverse match): ${name} ${pos}`);
      continue;
    }
    if (seen.has(bio.gsis_id)) continue;
    seen.add(bio.gsis_id);
    const team = teamCode(e.team ?? e.player.team ?? sp.team ?? "");
    board.push({
      id: bio.gsis_id,
      name: bio.display_name || name,
      pos,
      team: team || "FA",
      adp: r1(e.stats.adp_ppr),
      bye: bye.get(team) ?? null,
      age: ageOn(bio.birth_date, season),
      nflDraftYear: num(bio.draft_year) || null,
      nflDraftRound: num(bio.draft_round) || null,
      nflDraftPick: num(bio.draft_pick) || null,
      rookie: num(bio.rookie_season) === season || num(bio.draft_year) === season,
      headshot: bio.headshot || null,
    });
  }
  const ids = new Set(board.map((p) => p.id));
  console.log(`  board: ${board.length} players (ADP ${board[0].adp} to ${board[board.length - 1].adp})`);

  // Scouting history: the seasons before this one, games actually played.
  const scout = [];
  const scoutSeasons = [];
  for (let s = season - SCOUT_YEARS; s < season; s++) {
    const rows = await weekly(s);
    if (!rows) continue;
    scoutSeasons.push(s);
    for (const r of rows) {
      if (!ids.has(r.player_id)) continue;
      const played = num(r.completions) + num(r.attempts) + num(r.carries) + num(r.targets);
      if (played === 0) continue;
      scout.push([
        r.player_id,
        num(r.season),
        num(r.week),
        teamCode(r.team),
        teamCode(r.opponent_team),
        r1(num(r.fantasy_points_ppr)),
        num(r.attempts),
        num(r.passing_yards),
        num(r.passing_tds),
        num(r.passing_interceptions),
        num(r.carries),
        num(r.rushing_yards),
        num(r.rushing_tds),
        num(r.targets),
        num(r.receptions),
        num(r.receiving_yards),
        num(r.receiving_tds),
        r3(num(r.target_share)),
      ]);
    }
  }
  scout.sort((a, b) => a[1] - b[1] || a[2] - b[2] || b[5] - a[5]);
  if (scout.some((r) => r[1] >= season)) throw new Error("scouting rows leak the draft season");
  console.log(`  scouting: ${scout.length} games from ${scoutSeasons.join(", ")}`);

  // The season the league is scored on: weeks 1–17, null for no game.
  const points = {};
  for (const p of board) points[p.id] = Array(LAST_WEEK).fill(null);
  for (const r of seasonRows) {
    if (!ids.has(r.player_id)) continue;
    const w = num(r.week);
    if (w < 1 || w > LAST_WEEK) continue;
    const played = num(r.completions) + num(r.attempts) + num(r.carries) + num(r.targets);
    if (played === 0) continue;
    points[r.player_id][w - 1] = r1(num(r.fantasy_points_ppr));
  }
  const maxWeek = Math.max(...seasonRows.map((r) => num(r.week)));
  if (maxWeek < LAST_WEEK) throw new Error(`${season} only runs to week ${maxWeek}: not a finished season`);

  const out = {
    season,
    scoutSeasons,
    built: new Date().toISOString().slice(0, 10),
    board,
    scoutCols: SCOUT_COLS,
    scout,
    points,
  };
  const json = JSON.stringify(out);
  await writeFile(`public/draft/${season}.json`, json);
  console.log(`  wrote public/draft/${season}.json (${Math.round(json.length / 1024)} KB)`);
  built.push({ season, scoutSeasons, players: board.length, scoutGames: scout.length, kb: Math.round(json.length / 1024) });
}

const ts = `// Generated by scripts/build-draft-dataset.mjs — do not edit by hand.
// Which Draft Room seasons exist in public/draft/, newest first.

export type DraftSeasonMeta = {
  season: number;
  scoutSeasons: number[];
  players: number;
  scoutGames: number;
  kb: number;
};

export const DRAFT_SEASONS: DraftSeasonMeta[] = ${JSON.stringify(built, null, 2)};
`;
await writeFile("lib/draft-seasons.generated.ts", ts);
console.log("\nwrote lib/draft-seasons.generated.ts");
