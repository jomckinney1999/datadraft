import { parse } from "csv-parse/sync";

// Real weekly player stats from nflverse-data (community-maintained, free,
// updated weekly in-season — https://github.com/nflverse/nflverse-data).
// Verified against the live release before writing this: the "player_stats"
// release tag holds per-season CSVs at this exact URL pattern, one row per
// player per week, already including computed fantasy points (standard and
// PPR). This is the source for Phase 3 of docs/LAUNCH-PLAN.md — it replaces
// the sandbox's synthetic dataset once wired into the database.
const NFLVERSE_BASE =
  "https://github.com/nflverse/nflverse-data/releases/download/player_stats";

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
  const url = `${NFLVERSE_BASE}/player_stats_${season}.csv`;
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
      team: row.recent_team,
      season: toNumber(row.season),
      week: toNumber(row.week),
      seasonType: row.season_type,
      opponentTeam: row.opponent_team,
      completions: toNumber(row.completions),
      attempts: toNumber(row.attempts),
      passingYards: toNumber(row.passing_yards),
      passingTds: toNumber(row.passing_tds),
      interceptions: toNumber(row.interceptions),
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
