/**
 * Arcade mini-games — Film Room Match + Speed Snap.
 * Zero timeouts; pays scouting tickets so the sideline shop stays fed.
 */

export type MatchPair = {
  id: string;
  sql: string;
  film: string;
};

/** Concept ↔ picture pairs. Football is seasoning — the SQL still transfers. */
export const FILM_ROOM_PAIRS: MatchPair[] = [
  { id: "select", sql: "SELECT", film: "Show me the box score" },
  { id: "where", sql: "WHERE", film: "Only the starters" },
  { id: "order", sql: "ORDER BY … DESC", film: "Leaderboard, best first" },
  { id: "group", sql: "GROUP BY", film: "Stack totals by position" },
  { id: "join", sql: "JOIN … ON", film: "Line two sheets up on the same player" },
  { id: "limit", sql: "LIMIT 5", film: "Top of the depth chart" },
  { id: "count", sql: "COUNT(*)", film: "How many games did they play?" },
  { id: "avg", sql: "AVG(fantasy_pts)", film: "Points per game" },
  { id: "null", sql: "Missing row / NULL", film: "Bye week — no game logged" },
  { id: "having", sql: "HAVING", film: "Filter the groups, not every row" },
  { id: "distinct", sql: "DISTINCT", film: "Unique names only — no duplicates" },
  { id: "like", sql: "LIKE '%Jackson%'", film: "Name search with wildcards" },
];

export type SpeedSnap = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explain: string;
};

export const SPEED_SNAPS: SpeedSnap[] = [
  {
    id: "s1",
    prompt: "The leaderboard shows the worst players at the top. What went wrong?",
    choices: [
      "Forgot WHERE",
      "ORDER BY ASC instead of DESC",
      "Used LIMIT too early",
      "Grouped by the wrong column",
    ],
    answer: 1,
    explain: "ASC puts the smallest first. Flip to DESC for a leaderboard.",
  },
  {
    id: "s2",
    prompt: "One row in week_results means…",
    choices: [
      "One player’s whole season",
      "One team’s game",
      "One player in one week",
      "One fantasy league",
    ],
    answer: 2,
    explain: "Grain first: each row is one player-game.",
  },
  {
    id: "s3",
    prompt: "You SELECT week and AVG(pts) but skip GROUP BY. What happens?",
    choices: [
      "It works fine",
      "The database guesses a group",
      "Most engines error — aggregates need a group",
      "It returns one random week",
    ],
    answer: 2,
    explain: "If you mix detail columns with aggregates, you must GROUP BY.",
  },
  {
    id: "s4",
    prompt: "COUNT(*) vs COUNT(fantasy_pts) — when do they disagree?",
    choices: [
      "Never",
      "When some fantasy_pts values are NULL",
      "When the table is empty",
      "Only after a JOIN",
    ],
    answer: 1,
    explain: "COUNT(column) skips NULLs. COUNT(*) counts every row.",
  },
  {
    id: "s5",
    prompt: "You want the five highest scorers. What’s the move?",
    choices: [
      "WHERE fantasy_pts > 5",
      "ORDER BY fantasy_pts DESC LIMIT 5",
      "GROUP BY 5",
      "SELECT TOP without ORDER BY",
    ],
    answer: 1,
    explain: "Sort first, then cut — LIMIT alone doesn’t pick the best.",
  },
  {
    id: "s6",
    prompt: "A LEFT JOIN keeps every row from the left table even when…",
    choices: [
      "The right side has no match",
      "The right side has duplicates",
      "You used WHERE instead of ON",
      "Columns have different names",
    ],
    answer: 0,
    explain: "That’s the point of LEFT JOIN — missing partners become NULL.",
  },
  {
    id: "s7",
    prompt: "Excel: =VLOOKUP fails after a dirty import. First suspect?",
    choices: [
      "Wrong sheet tab color",
      "Extra spaces in the lookup names",
      "The formula starts with +",
      "Too many columns",
    ],
    answer: 1,
    explain: "TRIM the dirty names — spaces break exact matches.",
  },
  {
    id: "s8",
    prompt: "You filtered to RBs with WHERE, then want only groups over 20 avg. Use…",
    choices: ["Another WHERE", "HAVING", "LIMIT", "DISTINCT"],
    answer: 1,
    explain: "WHERE filters rows; HAVING filters after GROUP BY.",
  },
];

export const ARCADE_MATCH_SIZE = 6;
export const ARCADE_SPEED_SIZE = 6;
export const TICKET_MATCH_BASE = 6;
export const TICKET_MATCH_PERFECT = 4;
export const TICKET_SPEED_BASE = 5;
export const TICKET_SPEED_PERFECT = 5;
/** Extra point: three kicks, tickets for makes, a bonus for a perfect set. */
export const ARCADE_KICK_ATTEMPTS = 3;
export const TICKET_KICK_PER_MAKE = 3;
export const TICKET_KICK_PERFECT = 5;

export const TICKET_DAILY_ARCADE_BONUS = 8;
export const XP_ARCADE_WIN = 15;

/** Stable daily shuffle so everyone’s board isn’t identical forever. */
export function dailySeed(): number {
  const t = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  return h || 1;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickDailyPairs(n = ARCADE_MATCH_SIZE): MatchPair[] {
  const rand = mulberry32(dailySeed());
  const copy = [...FILM_ROOM_PAIRS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function pickDailySnaps(n = ARCADE_SPEED_SIZE): SpeedSnap[] {
  const rand = mulberry32(dailySeed() ^ 0x9e3779b9);
  const copy = [...SPEED_SNAPS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function shuffleIds(ids: string[], salt: number): string[] {
  const rand = mulberry32(dailySeed() ^ salt);
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
