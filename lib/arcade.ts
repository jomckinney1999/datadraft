/**
 * Arcade mini-games for quick prep between drives.
 * Film Room Match, Two-Minute Drill, Extra Point, Pattern Call, Foul Call.
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
  { id: "case", sql: "CASE WHEN", film: "Bucket a score as boom / bust" },
  { id: "cte", sql: "WITH … AS", film: "Name a sub-result, then ask about it" },
  { id: "rank", sql: "RANK() OVER", film: "Best at each position this week" },
  { id: "lag", sql: "LAG(pts)", film: "This week vs last week" },
  { id: "coalesce", sql: "COALESCE", film: "Treat a missing bye as zero" },
  { id: "left", sql: "LEFT JOIN", film: "Keep every rostered player, even on bye" },
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
  {
    id: "s9",
    prompt: "A phone screen asks for \"top scorer per team.\" Which tool family?",
    choices: ["UNION ALL", "Window RANK / ROW_NUMBER", "CROSS JOIN", "DROP TABLE"],
    answer: 1,
    explain: "Top-N per group is a window function (or a correlated subquery).",
  },
  {
    id: "s10",
    prompt: "Your JOIN doubled every total. Most likely cause?",
    choices: [
      "ORDER BY ASC",
      "The join key matched multiple rows (fan-out)",
      "You used LIMIT 1",
      "Missing semicolon",
    ],
    answer: 1,
    explain: "One-to-many joins multiply rows. Check grain before you SUM.",
  },
  {
    id: "s11",
    prompt: "Interview tip: grading compares result grids. So two correct answers can…",
    choices: [
      "Never both pass",
      "Use different SQL and still pass",
      "Only pass if text matches the key",
      "Require the same CTE names",
    ],
    answer: 1,
    explain: "We grade what comes back, not how you spelled the query.",
  },
  {
    id: "s12",
    prompt: "WHERE team = NULL returns…",
    choices: ["Every NULL team", "No rows — use IS NULL", "A syntax error", "Every row"],
    answer: 1,
    explain: "NULL isn't equal to anything. IS NULL / IS NOT NULL.",
  },
];

/** Pattern Call — name the interview pattern a prompt is testing. */
export type PatternCall = {
  id: string;
  prompt: string;
  /** Index into PATTERN_CALL_CHOICES */
  answer: number;
  explain: string;
};

/** Same nine names as lib/interview-patterns — kept local so the arcade stays light. */
export const PATTERN_CALL_CHOICES = [
  "Filter and sort",
  "Group and aggregate",
  "Joins",
  "Conditional logic",
  "Subqueries and CTEs",
  "Ranking and top-N per group",
  "Running totals and change",
  "Dates",
  "NULLs and messy data",
] as const;

export const PATTERN_CALLS: PatternCall[] = [
  {
    id: "pc1",
    prompt: "Return the five highest scorers in week 3, best first.",
    answer: 0,
    explain: "WHERE (week), ORDER BY, LIMIT — classic filter and sort.",
  },
  {
    id: "pc2",
    prompt: "Average fantasy points by position for the 2024 season.",
    answer: 1,
    explain: "GROUP BY position with AVG — aggregate.",
  },
  {
    id: "pc3",
    prompt: "List every rostered player with their week-5 points, including byes.",
    answer: 2,
    explain: "Roster LEFT JOIN scores so missing weeks stay in the result.",
  },
  {
    id: "pc4",
    prompt: "Label each game 'boom' if points ≥ 25, else 'normal'.",
    answer: 3,
    explain: "CASE WHEN builds buckets — conditional logic.",
  },
  {
    id: "pc5",
    prompt: "Players whose season total beats the league average season total.",
    answer: 4,
    explain: "You need a total, then a comparison to a total — CTE or subquery.",
  },
  {
    id: "pc6",
    prompt: "The top scorer at each position this week (handle ties).",
    answer: 5,
    explain: "RANK or ROW_NUMBER partitioned by position.",
  },
  {
    id: "pc7",
    prompt: "For each player, points this week and the change from last week.",
    answer: 6,
    explain: "LAG over a player ordered by week — running / change.",
  },
  {
    id: "pc8",
    prompt: "Games played on a Sunday in October.",
    answer: 7,
    explain: "Date parts / filters — the dates pattern.",
  },
  {
    id: "pc9",
    prompt: "Rostered players with no matching score row this week.",
    answer: 8,
    explain: "Anti-join / IS NULL after a LEFT JOIN — messy / NULL data.",
  },
  {
    id: "pc10",
    prompt: "Total points and games played per team, only teams with 8+ games.",
    answer: 1,
    explain: "GROUP BY with HAVING on the aggregate.",
  },
  {
    id: "pc11",
    prompt: "Deduplicate a player list that somehow has two identical rows.",
    answer: 8,
    explain: "Dedup / DISTINCT / NULL-ish cleanliness — messy data.",
  },
  {
    id: "pc12",
    prompt: "A running season total for each manager week by week.",
    answer: 6,
    explain: "SUM() OVER (PARTITION BY manager ORDER BY week).",
  },
];

/** Foul Call — spot what's wrong with a query (shape, never the answer key). */
export type FoulCall = {
  id: string;
  setup: string;
  code: string;
  choices: string[];
  answer: number;
  explain: string;
};

export const FOUL_CALLS: FoulCall[] = [
  {
    id: "fc1",
    setup: "Top scorers this week — but the list looks upside down.",
    code: "SELECT player, fantasy_pts\nFROM week_results\nWHERE week = 3\nORDER BY fantasy_pts\nLIMIT 5;",
    choices: [
      "Missing GROUP BY",
      "ORDER BY needs DESC for a leaderboard",
      "LIMIT can't follow ORDER BY",
      "WHERE should be HAVING",
    ],
    answer: 1,
    explain: "ASC (default) puts the smallest first. DESC for \"best.\"",
  },
  {
    id: "fc2",
    setup: "Bye-week players vanished from the depth chart.",
    code: "SELECT r.player_name, s.points\nFROM roster r\nJOIN week5_scores s ON r.player_id = s.player_id;",
    choices: [
      "Need LEFT JOIN to keep roster rows with no score",
      "Need UNION instead",
      "ON should be WHERE",
      "SELECT * is required",
    ],
    answer: 0,
    explain: "INNER JOIN drops non-matches. LEFT JOIN keeps the roster.",
  },
  {
    id: "fc3",
    setup: "Engine errors: aggregate with a bare column.",
    code: "SELECT player, week, SUM(fantasy_pts)\nFROM week_results\nGROUP BY player;",
    choices: [
      "SUM can't be selected",
      "week must be aggregated or in the GROUP BY",
      "FROM is wrong",
      "Need DISTINCT",
    ],
    answer: 1,
    explain: "Every non-aggregated selected column belongs in GROUP BY.",
  },
  {
    id: "fc4",
    setup: "Looking for missing teams — got zero rows.",
    code: "SELECT *\nFROM week_results\nWHERE team = NULL;",
    choices: [
      "Use IS NULL, not = NULL",
      "NULL only works in HAVING",
      "Need COUNT(NULL)",
      "Quote the word null",
    ],
    answer: 0,
    explain: "NULL comparisons use IS NULL / IS NOT NULL.",
  },
  {
    id: "fc5",
    setup: "Want groups with avg over 20 after filtering RBs.",
    code: "SELECT player, AVG(fantasy_pts)\nFROM week_results\nWHERE position = 'RB'\n  AND AVG(fantasy_pts) > 20\nGROUP BY player;",
    choices: [
      "AVG in WHERE is illegal — use HAVING",
      "WHERE can't filter position",
      "GROUP BY must include AVG",
      "Need ORDER BY first",
    ],
    answer: 0,
    explain: "WHERE runs before aggregation. Filter groups with HAVING.",
  },
  {
    id: "fc6",
    setup: "Totals doubled after a join to a lookup table.",
    code: "SELECT t.team, SUM(w.fantasy_pts)\nFROM week_results w\nJOIN teams t ON w.season = t.season\nGROUP BY t.team;",
    choices: [
      "SUM is wrong",
      "Join key too loose — fan-out multiplied rows",
      "GROUP BY needs season",
      "Need LIMIT 1",
    ],
    answer: 1,
    explain: "Joining only on season matches every team row. Tighten the key (e.g. team + season).",
  },
  {
    id: "fc7",
    setup: "Hardcoded the answer instead of reading the table.",
    code: "SELECT 'Josh Allen' AS player, 31.2 AS fantasy_pts;",
    choices: [
      "Missing FROM — graders reject hardcoded results",
      "Alias names are illegal",
      "Need ORDER BY",
      "Numbers must be integers",
    ],
    answer: 0,
    explain: "Interview SQL has to query the data. A literal SELECT is a foul.",
  },
  {
    id: "fc8",
    setup: "LEFT JOIN undone by a filter on the right table.",
    code: "SELECT r.player_name, s.points\nFROM roster r\nLEFT JOIN week5_scores s ON r.player_id = s.player_id\nWHERE s.points > 10;",
    choices: [
      "WHERE on the joined table turns the LEFT JOIN into an inner join",
      "LEFT JOIN can't use ON",
      "Need FULL OUTER JOIN",
      "points must be TEXT",
    ],
    answer: 0,
    explain: "Move right-side filters into ON, or accept that WHERE drops NULL extensions.",
  },
];

export const ARCADE_MATCH_SIZE = 6;
export const ARCADE_SPEED_SIZE = 6;
export const ARCADE_PATTERN_SIZE = 6;
export const ARCADE_FOUL_SIZE = 5;
export const TICKET_MATCH_BASE = 6;
export const TICKET_MATCH_PERFECT = 4;
export const TICKET_SPEED_BASE = 5;
export const TICKET_SPEED_PERFECT = 5;
export const TICKET_PATTERN_BASE = 6;
export const TICKET_PATTERN_PERFECT = 4;
export const TICKET_FOUL_BASE = 6;
export const TICKET_FOUL_PERFECT = 5;
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

function pickDaily<T>(items: T[], n: number, salt: number): T[] {
  const rand = mulberry32(dailySeed() ^ salt);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export function pickDailyPatterns(n = ARCADE_PATTERN_SIZE): PatternCall[] {
  return pickDaily(PATTERN_CALLS, n, 0xc0ffee);
}

export function pickDailyFouls(n = ARCADE_FOUL_SIZE): FoulCall[] {
  return pickDaily(FOUL_CALLS, n, 0xf007);
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
