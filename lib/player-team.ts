/**
 * Which NFL team a lesson player was on, for putting team logos and colours
 * on a chart whose result names players but has no team column — most of
 * the question bank (`SELECT player, SUM(fantasy_pts) …`).
 *
 * Built from the same rows the lessons seed (scripts/build-lesson-dataset.mjs
 * writes player-teams.generated.ts), and small: a few spans per player, so a
 * chart never loads the dataset to colour a dot.
 */

import { PLAYER_TEAMS, WIRE_TEAMS } from "@/lib/player-teams.generated";

/** One of the twenty lesson players, or a waiver-wire player. */
export function isKnownPlayer(name: string): boolean {
  return name in PLAYER_TEAMS || name in WIRE_TEAMS;
}

/** The team at `week` (or at the end of the season when there's no week). */
function at(spans: [number, string][], week: number | null): string {
  let team = spans[0][1];
  for (const [from, t] of spans) if (week === null || from <= week) team = t;
  return team;
}

/**
 * The team `name` played for: in that week of that season when the result
 * has both, at the end of that season when it has only the season, and his
 * current team otherwise (as the headshots do). Null for a name we don't know.
 */
export function playerTeam(name: string, season: number | null = null, week: number | null = null): string | null {
  const seasons = PLAYER_TEAMS[name];
  if (!seasons) return WIRE_TEAMS[name] ?? null;
  if (season !== null && seasons[season]) return at(seasons[season], week);
  const latest = Math.max(...Object.keys(seasons).map(Number));
  return at(seasons[latest], null);
}
