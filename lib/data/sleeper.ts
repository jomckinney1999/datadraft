// Sleeper's public API — fully unauthenticated, no OAuth/API key needed,
// which is exactly why docs/LAUNCH-PLAN.md sequences it before ESPN/Yahoo
// for fantasy-platform sync (Phase 5). Endpoints verified live before
// writing this. Full reference: https://docs.sleeper.com/
//
// Used in the browser by the League Scorecard's "run it on your league" panel
// (lib/league-load.ts): the API answers cross-origin requests from anywhere
// (`access-control-allow-origin: *`), so a learner's league goes straight
// from Sleeper into their tab and never touches our servers.

const SLEEPER_BASE = "https://api.sleeper.app/v1";

export type SleeperNflState = {
  week: number;
  season: string;
  season_type: "off" | "pre" | "regular" | "post";
  league_season: string;
  previous_season: string;
};

export type SleeperUser = {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
};

export type SleeperLeague = {
  league_id: string;
  name: string;
  season: string;
  status: string;
  total_rosters: number;
  scoring_settings: Record<string, number>;
  settings?: { playoff_week_start?: number };
};

export type SleeperRoster = {
  roster_id: number;
  owner_id: string | null;
  players: string[];
  starters: string[];
};

export type SleeperMatchup = {
  roster_id: number;
  matchup_id: number | null;
  points: number | null;
  starters?: string[] | null;
  players?: string[] | null;
  players_points?: Record<string, number> | null;
};

async function sleeperGet<T>(path: string): Promise<T> {
  const res = await fetch(`${SLEEPER_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Sleeper API error for ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getNflState() {
  return sleeperGet<SleeperNflState>("/state/nfl");
}

export function getUserByUsername(username: string) {
  return sleeperGet<SleeperUser>(`/user/${encodeURIComponent(username)}`);
}

export function getUserLeagues(userId: string, season: string) {
  return sleeperGet<SleeperLeague[]>(`/user/${userId}/leagues/nfl/${season}`);
}

export function getLeague(leagueId: string) {
  return sleeperGet<SleeperLeague>(`/league/${leagueId}`);
}

export function getLeagueRosters(leagueId: string) {
  return sleeperGet<SleeperRoster[]>(`/league/${leagueId}/rosters`);
}

export function getLeagueUsers(leagueId: string) {
  return sleeperGet<SleeperUser[]>(`/league/${leagueId}/users`);
}

export function getLeagueMatchups(leagueId: string, week: number) {
  return sleeperGet<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`);
}

/**
 * The full NFL player directory — several MB of JSON. Sleeper's own docs
 * ask integrators to call this at most once per day and cache the result
 * (e.g. in a `players` table, refreshed by a daily cron), not per-request.
 */
export function getAllPlayers() {
  return sleeperGet<Record<string, { full_name: string; position: string; team: string }>>(
    "/players/nfl",
  );
}
