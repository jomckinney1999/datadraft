import { TEAM_COLORS } from "@/lib/team-colors.generated";

/**
 * The supplied sprite is eight columns by four rows, in this exact order.
 * Historical aliases (LA/OAK/SD/STL) in TEAM_COLORS are deliberately absent:
 * this is the current 32-team league.
 */
export const NFL_TEAM_ORDER = [
  "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE",
  "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC",
  "LV", "LAC", "LAR", "MIA", "MIN", "NE", "NO", "NYG",
  "NYJ", "PHI", "PIT", "SF", "SEA", "TB", "TEN", "WAS",
] as const;

export type NflTeamAbbr = (typeof NFL_TEAM_ORDER)[number];

const ACTIVE = new Set<string>(NFL_TEAM_ORDER);
const COLORS = new Map(TEAM_COLORS.map((team) => [team.abbr, team]));

export type NflTeamAvatar = {
  abbr: NflTeamAbbr;
  name: string;
  nick: string;
  primary: string;
  secondary: string;
  col: number;
  row: number;
};

export const NFL_TEAM_AVATARS: NflTeamAvatar[] = NFL_TEAM_ORDER.map((abbr, index) => {
  const team = COLORS.get(abbr);
  if (!team) throw new Error(`Missing team metadata for ${abbr}`);
  return {
    abbr,
    name: team.name,
    nick: team.nick,
    primary: team.primary,
    secondary: team.secondary ?? "#FFFFFF",
    col: index % 8,
    row: Math.floor(index / 8),
  };
});

const BY_ABBR = new Map(NFL_TEAM_AVATARS.map((team) => [team.abbr, team]));

export function isNflTeam(value: unknown): value is NflTeamAbbr {
  return typeof value === "string" && ACTIVE.has(value);
}

export function nflTeam(abbr: string | null | undefined): NflTeamAvatar | null {
  return abbr && isNflTeam(abbr) ? (BY_ABBR.get(abbr) ?? null) : null;
}

/** Cryptographic browser pick: called only from an explicit "Surprise me". */
export function randomNflTeam(): NflTeamAvatar {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return NFL_TEAM_AVATARS[value[0]! % NFL_TEAM_AVATARS.length]!;
  }
  // Server/test fallback is deterministic; the browser path above is the UI.
  return NFL_TEAM_AVATARS[0]!;
}
