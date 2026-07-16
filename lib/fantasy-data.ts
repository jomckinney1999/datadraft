export type Position = "QB" | "RB" | "WR" | "TE";

export type PlayerProfile = {
  name: string;
  team: string;
  position: Position;
  basePpg: number;
  variance: number;
};

// Illustrative sample data for the sandbox — deterministically generated,
// not real historical stat lines. Bye weeks, season/week ranges, and point
// totals are synthetic so results stay stable across page loads.
export const PLAYERS: PlayerProfile[] = [
  { name: "Tyreek Hill", team: "MIA", position: "WR", basePpg: 19, variance: 8 },
  { name: "CeeDee Lamb", team: "DAL", position: "WR", basePpg: 17, variance: 7 },
  { name: "Amon-Ra St. Brown", team: "DET", position: "WR", basePpg: 16, variance: 6 },
  { name: "A.J. Brown", team: "PHI", position: "WR", basePpg: 15, variance: 7 },
  { name: "Puka Nacua", team: "LAR", position: "WR", basePpg: 14, variance: 6 },
  { name: "Tank Dell", team: "HOU", position: "WR", basePpg: 11, variance: 6 },
  { name: "Rome Odunze", team: "CHI", position: "WR", basePpg: 8, variance: 5 },
  { name: "Christian McCaffrey", team: "SF", position: "RB", basePpg: 20, variance: 8 },
  { name: "Derrick Henry", team: "BAL", position: "RB", basePpg: 16, variance: 7 },
  { name: "Jaylen Warren", team: "PIT", position: "RB", basePpg: 10, variance: 5 },
  { name: "Ray Davis", team: "BUF", position: "RB", basePpg: 9, variance: 5 },
  { name: "Tyler Allgeier", team: "ATL", position: "RB", basePpg: 7, variance: 4 },
  { name: "Patrick Mahomes", team: "KC", position: "QB", basePpg: 22, variance: 6 },
  { name: "Josh Allen", team: "BUF", position: "QB", basePpg: 23, variance: 6 },
  { name: "Travis Kelce", team: "KC", position: "TE", basePpg: 13, variance: 5 },
  { name: "George Kittle", team: "SF", position: "TE", basePpg: 12, variance: 5 },
];

export const SEASONS = [2016, 2017, 2018];
export const WEEKS_PER_SEASON = 16;

// Small seeded PRNG (mulberry32-style) so the generated dataset is
// deterministic — same results on every page load, not fresh random noise.
function seededRandom(seed: number): number {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export type WeekResultRow = {
  player: string;
  team: string;
  position: Position;
  season: number;
  week: number;
  fantasy_pts: number;
};

export function generateWeekResults(): WeekResultRow[] {
  const rows: WeekResultRow[] = [];
  PLAYERS.forEach((p, playerIndex) => {
    SEASONS.forEach((season) => {
      const byeWeek = ((playerIndex + season) % WEEKS_PER_SEASON) + 1;
      for (let week = 1; week <= WEEKS_PER_SEASON; week++) {
        if (week === byeWeek) continue;
        const seed = playerIndex * 100000 + season * 100 + week;
        const noise = (seededRandom(seed) - 0.5) * 2 * p.variance;
        const pts = Math.max(0, Math.round((p.basePpg + noise) * 10) / 10);
        rows.push({
          player: p.name,
          team: p.team,
          position: p.position,
          season,
          week,
          fantasy_pts: pts,
        });
      }
    });
  });
  return rows;
}

export const ROSTERS: { team_name: string; player: string }[] = [
  { team_name: "Your Team", player: "Tyreek Hill" },
  { team_name: "Your Team", player: "Christian McCaffrey" },
  { team_name: "Your Team", player: "Travis Kelce" },
  { team_name: "Your Team", player: "Josh Allen" },
  { team_name: "Your Team", player: "Jaylen Warren" },
  { team_name: "Kupp's Krew", player: "CeeDee Lamb" },
  { team_name: "Kupp's Krew", player: "Derrick Henry" },
  { team_name: "Kupp's Krew", player: "George Kittle" },
  { team_name: "Kupp's Krew", player: "Patrick Mahomes" },
  { team_name: "Kupp's Krew", player: "Tank Dell" },
];

export const WAIVER_WIRE: {
  player: string;
  team: string;
  position: Position;
  pct_rostered: number;
  trend: number;
}[] = [
  { player: "Jaylen Warren", team: "PIT", position: "RB", pct_rostered: 42, trend: 12 },
  { player: "Tank Dell", team: "HOU", position: "WR", pct_rostered: 38, trend: 9 },
  { player: "Ray Davis", team: "BUF", position: "RB", pct_rostered: 31, trend: 7 },
  { player: "Rome Odunze", team: "CHI", position: "WR", pct_rostered: 27, trend: 3 },
  { player: "Tyler Allgeier", team: "ATL", position: "RB", pct_rostered: 19, trend: -4 },
];

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

export function buildSeedSql(): string {
  const weekRows = generateWeekResults();

  const statements: string[] = [
    `CREATE TABLE week_results (
      player TEXT, team TEXT, position TEXT, season INTEGER, week INTEGER, fantasy_pts REAL
    );`,
    `CREATE TABLE rosters (team_name TEXT, player TEXT);`,
    `CREATE TABLE waiver_wire (
      player TEXT, team TEXT, position TEXT, pct_rostered INTEGER, trend INTEGER
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

  return statements.join("\n");
}

export const SCHEMA: { table: string; columns: string[] }[] = [
  {
    table: "week_results",
    columns: ["player", "team", "position", "season", "week", "fantasy_pts"],
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
    label: "Top 10 PPG · 2017",
    query: `SELECT player, team, position, ROUND(AVG(fantasy_pts), 1) AS ppg
FROM week_results
WHERE season = 2017
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
WHERE w.season = 2018 AND w.week = 10
GROUP BY r.team_name
ORDER BY total DESC;`,
  },
  {
    id: "career",
    label: "Career Totals",
    query: `SELECT player, team, COUNT(*) AS games, ROUND(SUM(fantasy_pts), 1) AS total
FROM week_results
GROUP BY player
ORDER BY total DESC
LIMIT 10;`,
  },
];
