// The database every SQL lesson and the landing sandbox query.
//
// `week_results` is REAL: nflverse-data weekly PPR fantasy points for the
// 2022–2024 regular seasons, one row per game a player actually played.
// See lib/data-source.ts for attribution and lib/lesson-data.generated.ts
// for the rows themselves (rebuild with scripts/build-lesson-dataset.mjs).
//
// This replaced a synthetic generator that produced plausible-looking noise
// around a hand-set "basePpg". It was not just imprecise, it was impossible —
// Tyreek Hill on Miami in 2016 (he joined in 2022), Puka Nacua playing
// seasons before he was drafted, and every player's week-to-week scoring on a
// tidy symmetric curve. Teaching analysis on invented numbers undercuts the
// entire premise, and learners noticed.
//
// `rosters` and `waiver_wire` are the INVENTED league layer: real players,
// fictional ownership. A waiver wire is a property of one private league, not
// a fact about the NFL, so there is nothing real to source it from. Both are
// labelled as such wherever they are shown — see PROVENANCE in data-source.ts.

import {
  PACKED_GAMES,
  PACKED_WEEKS,
  PLAYER_NAMES,
  SEASON_TOTALS,
} from "@/lib/lesson-data.generated";
import { LESSON_SEASONS } from "@/lib/data-source";

export type Position = "QB" | "RB" | "WR" | "TE";

export type WeekResultRow = {
  player: string;
  team: string;
  position: Position;
  season: number;
  week: number;
  fantasy_pts: number;
};

export const SEASONS: readonly number[] = LESSON_SEASONS;

/** Distinct players in the dataset, alphabetical. */
export const PLAYERS: readonly string[] = PLAYER_NAMES;

/** Real season totals, newest first — what the Excel workbook is built from. */
export { SEASON_TOTALS };

/**
 * The real weekly rows, unpacked from their compact stored form.
 *
 * Ordered season → week → points descending, which matters more than it
 * looks: the first lesson previews `SELECT * FROM week_results LIMIT 5`, and
 * the old player-major ordering meant the very first table a learner ever saw
 * was the same player five times over. It read as a broken table.
 */
export function getWeekResults(): WeekResultRow[] {
  return PACKED_WEEKS.map(([playerIdx, team, position, season, week, pts]) => ({
    player: PLAYER_NAMES[playerIdx],
    team,
    position: position as Position,
    season,
    week,
    fantasy_pts: pts,
  }));
}

/** An example 5-team league slice. Real players, invented ownership.
 *
 * Deliberately not two superteams: elite talent is split so a SELECT * looks
 * like a real draft board. Christian McCaffrey stays rostered so the LEFT JOIN
 * lesson still has a genuine week-1 absence (he was hurt in 2024). Five players
 * stay off both rosters and the wire for the anti-join drills.
 */
export const ROSTERS: { team_name: string; player: string }[] = [
  { team_name: "Blitz Brothers", player: "Josh Allen" },
  { team_name: "Blitz Brothers", player: "Travis Kelce" },
  { team_name: "Fourth & Long", player: "Patrick Mahomes" },
  { team_name: "Fourth & Long", player: "Ja'Marr Chase" },
  { team_name: "Touchdown Factory", player: "Christian McCaffrey" },
  { team_name: "Touchdown Factory", player: "CeeDee Lamb" },
  { team_name: "Gridiron Gurus", player: "Tyreek Hill" },
  { team_name: "Gridiron Gurus", player: "George Kittle" },
  { team_name: "Goal Line Gang", player: "Derrick Henry" },
  { team_name: "Goal Line Gang", player: "Puka Nacua" },
];

/** Example free-agent pool for the same invented league. */
export const WAIVER_WIRE: {
  player: string;
  team: string;
  position: Position;
  pct_rostered: number;
  trend: number;
}[] = [
  { player: "Jahmyr Gibbs", team: "DET", position: "RB", pct_rostered: 44, trend: 12 },
  { player: "Sam LaPorta", team: "DET", position: "TE", pct_rostered: 38, trend: 9 },
  { player: "Bijan Robinson", team: "ATL", position: "RB", pct_rostered: 31, trend: 7 },
  { player: "Davante Adams", team: "LV", position: "WR", pct_rostered: 27, trend: 3 },
  { player: "Amon-Ra St. Brown", team: "DET", position: "WR", pct_rostered: 19, trend: -4 },
];

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

export function buildSeedSql(): string {
  const weekRows = getWeekResults();

  const statements: string[] = [
    `CREATE TABLE week_results (
      player TEXT, team TEXT, position TEXT, season INTEGER, week INTEGER, fantasy_pts REAL
    );`,
    `CREATE TABLE rosters (team_name TEXT, player TEXT);`,
    `CREATE TABLE waiver_wire (
      player TEXT, team TEXT, position TEXT, pct_rostered INTEGER, trend INTEGER
    );`,
    // Real schedule, and the only table here with a date in it. week_results
    // joins to it on season + week, which is what makes opponent, home/away
    // and playing conditions answerable at all.
    `CREATE TABLE games (
      game_id TEXT, season INTEGER, week INTEGER, gameday TEXT, weekday TEXT,
      home_team TEXT, away_team TEXT, home_score INTEGER, away_score INTEGER,
      roof TEXT, surface TEXT, temp INTEGER
    );`,
  ];

  const weekValues = weekRows
    .map(
      (r) =>
        `('${escapeSqlString(r.player)}','${r.team}','${r.position}',${r.season},${r.week},${r.fantasy_pts})`,
    )
    .join(",");
  statements.push(
    `INSERT INTO week_results (player, team, position, season, week, fantasy_pts) VALUES ${weekValues};`,
  );

  const rosterValues = ROSTERS.map(
    (r) => `('${escapeSqlString(r.team_name)}','${escapeSqlString(r.player)}')`,
  ).join(",");
  statements.push(`INSERT INTO rosters (team_name, player) VALUES ${rosterValues};`);

  const waiverValues = WAIVER_WIRE.map(
    (w) =>
      `('${escapeSqlString(w.player)}','${w.team}','${w.position}',${w.pct_rostered},${w.trend})`,
  ).join(",");
  statements.push(
    `INSERT INTO waiver_wire (player, team, position, pct_rostered, trend) VALUES ${waiverValues};`,
  );

  const gameValues = PACKED_GAMES.map(
    ([id, season, week, day, weekday, home, away, hs, as_, roof, surface, temp]) =>
      `('${escapeSqlString(id)}',${season},${week},'${day}','${weekday}','${home}','${away}',${hs},${as_},'${escapeSqlString(roof)}','${escapeSqlString(surface)}',${temp === null ? "NULL" : temp})`,
  ).join(",");
  statements.push(
    `INSERT INTO games (game_id, season, week, gameday, weekday, home_team, away_team, home_score, away_score, roof, surface, temp) VALUES ${gameValues};`,
  );

  return statements.join("\n");
}

export const SCHEMA: { table: string; columns: string[] }[] = [
  {
    table: "week_results",
    columns: ["player", "team", "position", "season", "week", "fantasy_pts"],
  },
  {
    table: "games",
    columns: [
      "game_id",
      "season",
      "week",
      "gameday",
      "weekday",
      "home_team",
      "away_team",
      "home_score",
      "away_score",
      "roof",
      "surface",
      "temp",
    ],
  },
  { table: "rosters", columns: ["team_name", "player"] },
  {
    table: "waiver_wire",
    columns: ["player", "team", "position", "pct_rostered", "trend"],
  },
];

export const PRESETS: { id: string; label: string; query: string }[] = [
  {
    id: "top-ppg",
    label: "Top 10 PPG · 2024",
    query: `SELECT player, team, position, ROUND(AVG(fantasy_pts), 1) AS ppg
FROM week_results
WHERE season = 2024
GROUP BY player
ORDER BY ppg DESC
LIMIT 10;`,
  },
  {
    id: "waiver",
    label: "Waiver Wire",
    query: `SELECT player, team, position, pct_rostered
FROM waiver_wire
WHERE pct_rostered < 50
ORDER BY trend DESC
LIMIT 5;`,
  },
  {
    id: "matchup",
    label: "My Matchup · Wk 10",
    query: `SELECT r.team_name, ROUND(SUM(w.fantasy_pts), 1) AS total
FROM rosters r
JOIN week_results w ON w.player = r.player
WHERE w.season = 2024 AND w.week = 10
GROUP BY r.team_name
ORDER BY total DESC;`,
  },
  {
    id: "career",
    label: "Three-Season Totals",
    query: `SELECT player, COUNT(*) AS games, ROUND(SUM(fantasy_pts), 1) AS total
FROM week_results
GROUP BY player
ORDER BY total DESC
LIMIT 10;`,
  },
];
