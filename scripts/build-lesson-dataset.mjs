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
// The fantasy league (`rosters`, `waiver_wire`) comes from Sleeper, whose
// read-only API is free and needs no key: https://docs.sleeper.com
//   - rosters: a draft of the lesson cast run on Sleeper's real 2024 PPR ADP
//   - waiver_wire: Sleeper's real 2024 wire — share of Sleeper leagues
//     rostering each player, and how far that moved in a week
// The ADP (`api.sleeper.com/projections`) and rostered-share
// (`api.sleeper.app/players/nfl/research`) endpoints are the ones Sleeper's
// own app uses and are not in its published docs, so a rebuild that fails
// there is the first place to look. ESPN's equivalent is undocumented and its
// terms forbid automated access; Yahoo's needs an OAuth app and a user login.
//
// Outputs:
//   lib/lesson-data.generated.ts  compact real rows, imported by fantasy-data
//   public/data/*.csv             the exact seeded tables, for learners to
//                                 download and open in their own tool
//
// Usage: node scripts/build-lesson-dataset.mjs
// The lesson data is PINNED (docs/DATA-PIPELINE.md): re-run by hand, then run
// scripts/verify-answer-keys.mjs and re-check any lesson prose that quotes a
// number. The newest season is included up to its last completed week.

import { writeFile, mkdir } from "node:fs/promises";
import { parse } from "csv-parse/sync";

const SEASONS = [2022, 2023, 2024, 2025, 2026];

// The example league plays the 2024 season. Every roster lesson scores it on
// 2024 games, so the draft and the wire come from 2024 too — a league drafted
// in 2026 and scored on 2024 would be scored on a season it never played.
const LEAGUE_SEASON = 2024;
const LEAGUE_TEAMS = [
  "Blitz Brothers",
  "Fourth & Long",
  "Touchdown Factory",
  "Gridiron Gurus",
  "Goal Line Gang",
];
const LEAGUE_ROUNDS = 2;
/** The wire as it stood going into this week of LEAGUE_SEASON. */
const WIRE_WEEK = 10;
const WIRE_RISERS = 6;
const WIRE_FALLERS = 2;
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

// Real schedule for the same seasons. This is what gives the lesson database
// a DATE — nothing else in it has one, which made every date lesson
// unteachable — plus opponent, home/away, and the conditions a game was
// played in. Betting columns (moneylines, spreads, totals) are never read:
// see docs/PLAN.md, no gambling content.
const SCHEDULE_URL =
  "https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv";

async function fetchGames() {
  process.stdout.write("fetching schedules … ");
  const res = await fetch(SCHEDULE_URL);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for schedules`);
  const rows = parse(await res.text(), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  const keep = rows
    .filter((g) => SEASONS.includes(num(g.season)) && g.game_type === "REG")
    .map((g) => ({
      done: String(g.result ?? "").trim() !== "",
      game_id: g.game_id,
      season: num(g.season),
      week: num(g.week),
      gameday: g.gameday,
      weekday: g.weekday,
      home_team: g.home_team,
      away_team: g.away_team,
      home_score: num(g.home_score),
      away_score: num(g.away_score),
      roof: g.roof || "unknown",
      surface: g.surface || "unknown",
      temp: g.temp === "" || g.temp === undefined ? null : num(g.temp),
    }))
    .sort(
      (a, b) =>
        a.season - b.season || a.week - b.week || a.gameday.localeCompare(b.gameday),
    );
  console.log(`${keep.filter((g) => g.done).length} completed regular-season games`);
  return keep;
}

const scheduled = await fetchGames();

// The season in progress counts only through its last FINISHED week. Run on
// a Friday, a week with only Thursday night in it would otherwise land as a
// whole week: a "week 4" of two teams, and every per-week average dragged
// toward them. This runs every day from a GitHub Action
// (.github/workflows/weekly-data.yml), so it has to be right on any day.
// A game with no score more than a week after its date was cancelled, not
// pending (Bills–Bengals, 2022), and doesn't hold its week back.
const NEWEST = Math.max(...SEASONS);
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (d) => (Date.parse(today) - Date.parse(d)) / 86_400_000;
const newestWeeks = [...new Set(scheduled.filter((g) => g.season === NEWEST).map((g) => g.week))].sort((a, b) => a - b);
let throughWeek = 0;
for (const w of newestWeeks) {
  const games = scheduled.filter((g) => g.season === NEWEST && g.week === w);
  if (!games.every((g) => g.done || daysAgo(g.gameday) > 7)) break;
  throughWeek = w;
}
console.log(`${NEWEST}: complete through week ${throughWeek}`);

const wanted = new Set(CAST);
let weekRows = [];
/** Every player's rows for the league season — the wire needs their teams. */
let leagueSeasonRows = [];
/** Which teams the newest season's stats file has, per week. */
const statTeams = new Map();

for (const season of SEASONS) {
  const rows = await fetchSeason(season);
  if (season === LEAGUE_SEASON) leagueSeasonRows = rows;
  for (const r of rows) {
    if (r.season_type !== "REG") continue;
    if (season === NEWEST) {
      const w = num(r.week);
      if (!statTeams.has(w)) statTeams.set(w, new Set());
      statTeams.get(w).add(r.team);
    }
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

// The schedule can know Monday night's score before the stats file has its
// box score. A week whose games aren't all in the stats yet waits for the
// next run rather than going out missing a game.
while (throughWeek > 0) {
  const teams = scheduled
    .filter((g) => g.season === NEWEST && g.week === throughWeek && g.done)
    .flatMap((g) => [g.home_team, g.away_team]);
  const have = statTeams.get(throughWeek) ?? new Set();
  const missingTeams = teams.filter((t) => !have.has(t));
  if (!missingTeams.length) break;
  console.log(`${NEWEST} week ${throughWeek}: no stats yet for ${missingTeams.join(", ")}; holding it back`);
  throughWeek -= 1;
}
const counts = (season, week) => season < NEWEST || week <= throughWeek;
const gameRows = scheduled.filter((g) => g.done && counts(g.season, g.week)).map(({ done, ...g }) => g);
weekRows = weekRows.filter((r) => counts(r.season, r.week));

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

// ── The fantasy league, from Sleeper ─────────────────────────────
const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

async function getJson(url, label) {
  process.stdout.write(`fetching ${label} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const body = await res.json();
  console.log("ok");
  return body;
}

// Real preseason ADP for the league season, every skill position.
const adpRows = await getJson(
  `https://api.sleeper.com/projections/nfl/${LEAGUE_SEASON}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&order_by=adp_ppr`,
  `Sleeper ${LEAGUE_SEASON} PPR ADP`,
);
const adpByName = new Map();
for (const e of adpRows) {
  const adp = e.stats?.adp_ppr;
  if (typeof adp !== "number" || adp >= 999) continue; // 999 = undrafted
  const key = norm(`${e.player?.first_name} ${e.player?.last_name}`);
  // Two players can share a name; keep the one drafted earlier.
  if (!adpByName.has(key) || adp < adpByName.get(key)) adpByName.set(key, adp);
}

// Five managers, snake order, each taking the cast player with the best real
// ADP still on the board. The draft ORDER is real; the league and its team
// names are ours. Only the cast is on the board because roster lessons join
// to week_results, and a rostered player with no stat rows there would drop
// out of every join for a reason no lesson has taught yet.
const board = CAST.map((player) => {
  const adp = adpByName.get(norm(player));
  if (adp === undefined) throw new Error(`no ${LEAGUE_SEASON} Sleeper ADP for ${player}`);
  return { player, adp };
}).sort((a, b) => a.adp - b.adp || a.player.localeCompare(b.player));

const picks = [];
for (let round = 1; round <= LEAGUE_ROUNDS; round++) {
  const order = round % 2 === 1 ? LEAGUE_TEAMS : [...LEAGUE_TEAMS].reverse();
  for (const team of order) {
    const next = board[picks.length];
    picks.push({ team_name: team, player: next.player, round, pick: picks.length + 1, adp: next.adp });
  }
}
// Stored team by team, the way a league page lists rosters.
const rosterRows = LEAGUE_TEAMS.flatMap((t) => picks.filter((p) => p.team_name === t));

// The wire: Sleeper's real rostered share going into WIRE_WEEK, against the
// week before. Under 50% rostered means most leagues have him available.
const sleeperPlayers = await getJson("https://api.sleeper.app/v1/players/nfl", "Sleeper players");
const [ownedNow, ownedBefore] = await Promise.all([
  getJson(
    `https://api.sleeper.app/players/nfl/research/regular/${LEAGUE_SEASON}/${WIRE_WEEK}`,
    `Sleeper rostered % ${LEAGUE_SEASON} wk ${WIRE_WEEK}`,
  ),
  getJson(
    `https://api.sleeper.app/players/nfl/research/regular/${LEAGUE_SEASON}/${WIRE_WEEK - 1}`,
    `Sleeper rostered % ${LEAGUE_SEASON} wk ${WIRE_WEEK - 1}`,
  ),
]);

// Team as of the wire week, from nflverse, so it is the team he was actually
// on that week rather than wherever he plays now.
const teamAt = new Map(); // gsis id or normalised name -> { week, team }
for (const r of leagueSeasonRows) {
  if (r.season_type !== "REG" || num(r.week) > WIRE_WEEK) continue;
  for (const key of [r.player_id, norm(r.player_display_name || r.player_name)]) {
    if (!key) continue;
    const cur = teamAt.get(key);
    if (!cur || num(r.week) >= cur.week) teamAt.set(key, { week: num(r.week), team: r.team });
  }
}

const castKeys = new Set(CAST.map(norm));
const candidates = [];
for (const [id, now] of Object.entries(ownedNow)) {
  const before = ownedBefore[id];
  const p = sleeperPlayers[id];
  if (!before || !p || typeof now.owned !== "number") continue;
  if (!["QB", "RB", "WR", "TE"].includes(p.position)) continue;
  if (now.owned >= 50) continue;
  const name = p.full_name || `${p.first_name} ${p.last_name}`;
  if (castKeys.has(norm(name))) continue;
  const at = teamAt.get(p.gsis_id?.trim()) ?? teamAt.get(norm(name));
  if (!at) continue; // never played by then: not a pickup anyone was making
  candidates.push({
    player: name,
    team: at.team,
    position: p.position,
    pct_rostered: round1(now.owned),
    trend: round1(now.owned - before.owned),
  });
}
candidates.sort((a, b) => b.trend - a.trend || a.player.localeCompare(b.player));
const risers = candidates.slice(0, WIRE_RISERS);
const fallers = candidates.filter((c) => c.trend < 0).slice(-WIRE_FALLERS);
// Listed by rostered share, so sorting by trend visibly re-orders it.
const wireRows = [...risers, ...fallers].sort(
  (a, b) => b.pct_rostered - a.pct_rostered || a.player.localeCompare(b.player),
);
if (!wireRows.some((w) => w.position === "RB")) {
  throw new Error("waiver wire has no RB — a lesson filters on position = 'RB'");
}

// How far the newest season goes: its last week with a completed game.
const latestSeason = Math.max(...gameRows.map((g) => g.season));
const latestWeek = Math.max(
  ...gameRows.filter((g) => g.season === latestSeason).map((g) => g.week),
);
const builtOn = new Date().toISOString().slice(0, 10);

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

/** Seasons on file. The newest runs only through \`LATEST.week\`. */
export const SEASONS_ON_FILE: number[] = ${JSON.stringify(SEASONS)};

/** The newest season's last completed week at build time, and the build date. */
export const LATEST = ${JSON.stringify({ season: latestSeason, week: latestWeek, builtOn })} as const;

/**
 * The example fantasy league, from Sleeper (see the builder for endpoints).
 * rosters: ${LEAGUE_TEAMS.length} teams, ${LEAGUE_ROUNDS}-round snake draft of the lesson cast in
 * real Sleeper ${LEAGUE_SEASON} PPR ADP order. waiver_wire: Sleeper's real
 * rostered share going into ${LEAGUE_SEASON} week ${WIRE_WEEK}, and its change from week ${WIRE_WEEK - 1}.
 */
export const LEAGUE_META = ${JSON.stringify({ season: LEAGUE_SEASON, teams: LEAGUE_TEAMS.length, rounds: LEAGUE_ROUNDS, wireWeek: WIRE_WEEK })} as const;

/** [team_name, player, round, overall pick, Sleeper ADP] */
export const LEAGUE_ROSTERS: [string, string, number, number, number][] = [
${rosterRows.map((r) => `  ${JSON.stringify([r.team_name, r.player, r.round, r.pick, r.adp])},`).join("\n")}
];

/** [player, team, position, pct_rostered, trend] */
export const LEAGUE_WAIVER_WIRE: [string, string, string, number, number][] = [
${wireRows.map((w) => `  ${JSON.stringify([w.player, w.team, w.position, w.pct_rostered, w.trend])},`).join("\n")}
];

export const PLAYER_NAMES: string[] = ${JSON.stringify(players, null, 0)};

/** [playerIndex, team, position, season, week, fantasy_pts] */
export type PackedWeek = [number, string, string, number, number, number];

export const PACKED_WEEKS: PackedWeek[] = [
${packed.map((p) => `  ${JSON.stringify(p)},`).join("\n")}
];

/**
 * Real games for the same seasons, from nflverse schedules.
 * [game_id, season, week, gameday, weekday, home_team, away_team,
 *  home_score, away_score, roof, surface, temp]
 */
export type PackedGame = [
  string, number, number, string, string, string, string,
  number, number, string, string, number | null,
];

export const PACKED_GAMES: PackedGame[] = [
${gameRows
  .map(
    (g) =>
      `  ${JSON.stringify([g.game_id, g.season, g.week, g.gameday, g.weekday, g.home_team, g.away_team, g.home_score, g.away_score, g.roof, g.surface, g.temp])},`,
  )
  .join("\n")}
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

// ── Facts the lesson prose quotes ────────────────────────────────
// Prose that says "876 rows" or "37 games, not 50" goes stale the moment the
// data is rebuilt, and it already had: a rebuild once broke twelve lesson
// explanations in one go. Prose reads these instead of typing the number, and
// scripts/verify-answer-keys.mjs re-derives each one with SQL, so the builder
// and the database cannot disagree either. Kept in its own small file so
// importing a fact never drags the whole dataset into a bundle.
const teamGames = new Map(); // "season|team" -> games that team played
for (const g of gameRows) {
  for (const t of [g.home_team, g.away_team]) {
    const k = `${g.season}|${t}`;
    teamGames.set(k, (teamGames.get(k) ?? 0) + 1);
  }
}
const possibleGames = SEASONS.reduce((sum, s) => {
  const perTeam = [...teamGames].filter(([k]) => k.startsWith(`${s}|`)).map(([, n]) => n);
  return sum + (perTeam.length ? Math.max(...perTeam) : 0);
}, 0);

const gamesPlayed = {};
for (const r of weekRows) gamesPlayed[r.player] = (gamesPlayed[r.player] ?? 0) + 1;

// Per-season average, rounded the way SQLite's ROUND(AVG(x), 1) rounds it.
// Summing floats and Math.round-ing disagrees at exact halves: McCaffrey's
// four 2024 games average 11.95, which SQLite prints as 11.9 (the double sits
// just under .95) and Math.round made 12.0. Sum in whole tenths, divide once,
// and let toFixed round the double's exact value.
const tenths = new Map(); // "player|season" -> [sum of tenths, games]
for (const r of weekRows) {
  const k = `${r.player}|${r.season}`;
  const cur = tenths.get(k) ?? [0, 0];
  tenths.set(k, [cur[0] + Math.round(r.fantasy_pts * 10), cur[1] + 1]);
}
const seasonPpg = {};
for (const [k, [sum, n]] of [...tenths].sort((a, b) => a[0].localeCompare(b[0]))) {
  const [player, season] = k.split("|");
  (seasonPpg[player] ??= []).push([Number(season), Number((sum / 10 / n).toFixed(1))]);
}
for (const arc of Object.values(seasonPpg)) arc.sort((a, b) => a[0] - b[0]);

const drafted = new Set(rosterRows.map((r) => r.player));
const leagueTotals = new Map();
for (const r of weekRows) {
  if (r.season !== LEAGUE_SEASON) continue;
  const pick = rosterRows.find((p) => p.player === r.player);
  if (pick) leagueTotals.set(pick.team_name, (leagueTotals.get(pick.team_name) ?? 0) + r.fantasy_pts);
}
const [leaderTeam, leaderPts] = [...leagueTotals].sort((a, b) => b[1] - a[1])[0];
const undraftedByPoints = [...totals.values()]
  .filter((t) => t.season === LEAGUE_SEASON && !drafted.has(t.player))
  .sort((a, b) => b.points - a.points)
  .map((t) => t.player);
const topRiser = [...wireRows].sort((a, b) => b.trend - a.trend)[0];
const topRostered = [...totals.values()]
  .filter((t) => t.season === LEAGUE_SEASON && drafted.has(t.player))
  .sort((a, b) => b.points - a.points)[0];
const teamsPerPlayer = new Map();
for (const r of weekRows) {
  if (!teamsPerPlayer.has(r.player)) teamsPerPlayer.set(r.player, new Set());
  teamsPerPlayer.get(r.player).add(r.team);
}
const movers = [...teamsPerPlayer.values()].filter((s) => s.size > 1).length;

const facts = {
  rows: weekRows.length,
  gamesTable: gameRows.length,
  players: players.length,
  seasons: SEASONS,
  latest: { season: latestSeason, week: latestWeek },
  teams: new Set(weekRows.map((r) => r.team)).size,
  playerTeamPairs: new Set(weekRows.map((r) => `${r.player}|${r.team}`)).size,
  /** Players who appear with more than one team. */
  movers,
  possibleGames,
  /** The biggest single game on file, and every game that shares it. */
  maxGame: (() => {
    const pts = Math.max(...weekRows.map((r) => r.fantasy_pts));
    return {
      pts,
      games: weekRows
        .filter((r) => r.fantasy_pts === pts)
        .sort((a, b) => a.season - b.season || a.week - b.week)
        .map((r) => ({ player: r.player, season: r.season, week: r.week })),
    };
  })(),
  over25: weekRows.filter((r) => r.fantasy_pts > 25).length,
  boom30: weekRows.filter((r) => r.fantasy_pts >= 30).length,
  gamesPlayed,
  seasonPpg,
  league: {
    season: LEAGUE_SEASON,
    wireWeek: WIRE_WEEK,
    drafted: drafted.size,
    undrafted: players.length - drafted.size,
    wireRows: wireRows.length,
    leader: { team: leaderTeam, pts: round1(leaderPts) },
    undraftedByPoints,
    topRiser: { player: topRiser.player, trend: topRiser.trend },
    topRostered: { player: topRostered.player, pts: round1(topRostered.points) },
  },
};

await writeFile(
  "lib/lesson-facts.generated.ts",
  `// GENERATED by scripts/build-lesson-dataset.mjs — do not edit by hand.
//
// Numbers the lesson prose quotes, derived from the same rows the lessons
// seed. scripts/verify-answer-keys.mjs re-checks each one against the
// database. Import from here rather than typing a number into a lesson.

export const FACTS = ${JSON.stringify(facts, null, 2)} as const;

// The same three constants lesson-data.generated.ts carries, repeated here
// so pages that only need a season or a week never import the dataset.
// The verifier checks the two copies agree.
export const SEASONS_ON_FILE: number[] = ${JSON.stringify(SEASONS)};
export const LATEST = ${JSON.stringify({ season: latestSeason, week: latestWeek, builtOn })} as const;
export const LEAGUE_META = ${JSON.stringify({ season: LEAGUE_SEASON, teams: LEAGUE_TEAMS.length, rounds: LEAGUE_ROUNDS, wireWeek: WIRE_WEEK })} as const;
`,
  "utf8",
);
console.log("lib/lesson-facts.generated.ts written");

// Each player's team, kept only at the weeks it changed, so Chart it can put
// a team logo on a player chart whose result has no team column (most of the
// question bank) without loading the dataset. Waiver players aren't in the
// cast; they carry the team the wire lists.
const teamSpans = {};
for (const r of weekRows) {
  const spans = ((teamSpans[r.player] ??= {})[r.season] ??= []);
  if (!spans.length || spans[spans.length - 1][1] !== r.team) spans.push([r.week, r.team]);
}
const wireTeams = Object.fromEntries(wireRows.map((w) => [w.player, w.team]));
await writeFile(
  "lib/player-teams.generated.ts",
  `// GENERATED by scripts/build-lesson-dataset.mjs — do not edit by hand.
//
// Which NFL team each lesson player was on, by season, as [first week, team]
// spans (a trade starts a new span). Read through lib/player-team.ts.

export const PLAYER_TEAMS: Record<string, Record<number, [number, string][]>> = ${JSON.stringify(teamSpans)};

/** Waiver-wire players, who aren't in the cast: the team the wire lists. */
export const WIRE_TEAMS: Record<string, string> = ${JSON.stringify(wireTeams)};
`,
  "utf8",
);
console.log("lib/player-teams.generated.ts written");
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

await writeFile(
  "public/data/games.csv",
  csv(
    ["game_id","season","week","gameday","weekday","home_team","away_team","home_score","away_score","roof","surface","temp"],
    gameRows.map((g) => [
      g.game_id, g.season, g.week, g.gameday, g.weekday, g.home_team,
      g.away_team, g.home_score, g.away_score, g.roof, g.surface,
      g.temp === null ? "" : g.temp,
    ]),
  ),
  "utf8",
);

await writeFile(
  "public/data/rosters.csv",
  csv(
    ["team_name", "player", "round", "pick", "sleeper_adp"],
    rosterRows.map((r) => [r.team_name, r.player, r.round, r.pick, r.adp]),
  ),
  "utf8",
);

await writeFile(
  "public/data/waiver_wire.csv",
  csv(
    ["player", "team", "position", "pct_rostered", "trend"],
    wireRows.map((w) => [w.player, w.team, w.position, w.pct_rostered, w.trend]),
  ),
  "utf8",
);

console.log(
  "public/data/week_results.csv + season_totals.csv + games.csv + rosters.csv + waiver_wire.csv written (learner downloads)",
);

console.log(`\nleague draft (${LEAGUE_SEASON} Sleeper PPR ADP):`);
for (const p of picks) {
  console.log(`  ${String(p.pick).padStart(2)}. ${p.team_name.padEnd(18)} ${p.player.padEnd(20)} ADP ${p.adp}`);
}
console.log(`undrafted cast: ${board.slice(picks.length).map((b) => `${b.player} (${b.adp})`).join(", ")}`);
console.log(`\nwaiver wire going into ${LEAGUE_SEASON} week ${WIRE_WEEK}:`);
for (const w of wireRows) {
  console.log(`  ${w.player.padEnd(22)} ${w.team.padEnd(4)} ${w.position.padEnd(3)} ${String(w.pct_rostered).padStart(5)}%  trend ${w.trend > 0 ? "+" : ""}${w.trend}`);
}
console.log(`\nnewest data: ${latestSeason} through week ${latestWeek} (built ${builtOn})`);

// Quick sanity report so a rebuild that goes wrong is obvious immediately.
const top = [...totals.values()].sort((a, b) => b.points - a.points)[0];
console.log(
  `\nsanity: best season on file = ${top.player} ${top.season} (${round1(top.points)} pts in ${top.games} games)`,
);
console.log(
  `        seasons ${Math.min(...weekRows.map((r) => r.season))}–${Math.max(...weekRows.map((r) => r.season))}, weeks ${Math.min(...weekRows.map((r) => r.week))}–${Math.max(...weekRows.map((r) => r.week))}`,
);
