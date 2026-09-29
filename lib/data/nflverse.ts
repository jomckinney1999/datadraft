import { parse } from "csv-parse/sync";

// Real weekly player stats from nflverse-data (community-maintained, free,
// updated through the season — https://github.com/nflverse/nflverse-data).
// One row per player per week, with fantasy points already computed.
//
// This used to point at the "player_stats" release, which nflverse retired:
// it stops at 2024, so the scheduled ingest had been fetching a dead URL and
// writing nothing. The live release is "stats_player", and it renamed two
// columns we read — `recent_team` became `team`, `interceptions` became
// `passing_interceptions` — so a URL-only fix would still have written rows
// with an undefined team. Verified against the live 2026 file.
const NFLVERSE_BASE =
  "https://github.com/nflverse/nflverse-data/releases/download/stats_player";

/**
 * The season currently being played.
 *
 * Not `getFullYear()`: an NFL season spans the new year, so a cron running in
 * January would ask for a season that doesn't exist yet and fail every night
 * until March.
 */
export function currentNflSeason(now = new Date()): number {
  return now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
}

export type NflverseWeeklyStat = {
  playerId: string;
  playerName: string;
  playerDisplayName: string;
  position: string;
  positionGroup: string;
  team: string;
  season: number;
  week: number;
  seasonType: string;
  opponentTeam: string;
  completions: number;
  attempts: number;
  passingYards: number;
  passingTds: number;
  interceptions: number;
  carries: number;
  rushingYards: number;
  rushingTds: number;
  receptions: number;
  targets: number;
  receivingYards: number;
  receivingTds: number;
  fantasyPoints: number;
  fantasyPointsPpr: number;
};

function toNumber(value: string): number {
  if (value === "" || value === undefined) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Fetches and parses one season's weekly player stats.
 * Only regular-season rows are returned by default — pass
 * `{ includePostseason: true }` to keep playoff weeks too.
 *
 * Note: the per-year CSV for the *current* season may 404 until nflverse
 * publishes it (their pipeline runs on its own schedule after each week).
 * Callers should handle a fetch failure by falling back to the prior
 * season or retrying later, not by assuming the file always exists.
 */
export async function fetchSeasonStats(
  season: number,
  options: { includePostseason?: boolean } = {},
): Promise<NflverseWeeklyStat[]> {
  const url = `${NFLVERSE_BASE}/stats_player_week_${season}.csv`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `nflverse fetch failed for season ${season}: ${res.status} ${res.statusText} (${url})`,
    );
  }

  const csvText = await res.text();
  const rows: Record<string, string>[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  return rows
    .filter((row) => options.includePostseason || row.season_type === "REG")
    .map((row) => ({
      playerId: row.player_id,
      playerName: row.player_name,
      playerDisplayName: row.player_display_name,
      position: row.position,
      positionGroup: row.position_group,
      // `team` in the current release; `recent_team` in the retired one, kept
      // so an archived file still parses instead of yielding undefined.
      team: row.team ?? row.recent_team,
      season: toNumber(row.season),
      week: toNumber(row.week),
      seasonType: row.season_type,
      opponentTeam: row.opponent_team,
      completions: toNumber(row.completions),
      attempts: toNumber(row.attempts),
      passingYards: toNumber(row.passing_yards),
      passingTds: toNumber(row.passing_tds),
      interceptions: toNumber(row.passing_interceptions ?? row.interceptions),
      carries: toNumber(row.carries),
      rushingYards: toNumber(row.rushing_yards),
      rushingTds: toNumber(row.rushing_tds),
      receptions: toNumber(row.receptions),
      targets: toNumber(row.targets),
      receivingYards: toNumber(row.receiving_yards),
      receivingTds: toNumber(row.receiving_tds),
      fantasyPoints: toNumber(row.fantasy_points),
      fantasyPointsPpr: toNumber(row.fantasy_points_ppr),
    }));
}
