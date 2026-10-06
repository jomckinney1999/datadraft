// Loader + schema + drill prompts for the Practice Field (/field).
// The dataset is real NFL stats (nflverse) baked to public/field-data.json
// by scripts/build-field-dataset.mjs.

export type FieldData = {
  source: string;
  generated: string;
  weeklySeason: number;
  summarySeasons: number[];
  weekly: (string | number)[][];
  seasons: (string | number)[][];
  teams: string[][];
  /** Weekly injury report — why a player vanished from the stat sheet. */
  injuries: (string | number)[][];
  /** Weekly snap counts — opportunity, as opposed to production. */
  snaps: (string | number)[][];
};

export const FIELD_SCHEMA: {
  table: string;
  grain: string;
  columns: string[];
}[] = [
  {
    table: "player_weeks",
    grain: "one row per player per week (latest full season)",
    columns: [
      "player",
      "team",
      "position",
      "week",
      "opponent",
      "completions",
      "attempts",
      "pass_yards",
      "pass_tds",
      "interceptions",
      "carries",
      "rush_yards",
      "rush_tds",
      "receptions",
      "targets",
      "rec_yards",
      "rec_tds",
      "fantasy_ppr",
    ],
  },
  {
    table: "player_seasons",
    grain: "one row per player per season (three seasons)",
    columns: [
      "player",
      "team",
      "position",
      "season",
      "games",
      "pass_yards",
      "pass_tds",
      "interceptions",
      "rush_yards",
      "rush_tds",
      "receptions",
      "rec_yards",
      "rec_tds",
      "fantasy_ppr",
      "ppr_per_game",
    ],
  },
  {
    table: "teams",
    grain: "one row per NFL team",
    columns: ["team", "name", "conference", "division"],
  },
  {
    table: "injuries",
    grain: "one row per player per week they appeared on an injury report",
    columns: [
      "player",
      "team",
      "position",
      "week",
      "report_status",
      "injury",
      "practice_status",
    ],
  },
  {
    table: "snap_counts",
    grain: "one row per player per game — how much he was actually on the field",
    columns: [
      "player",
      "team",
      "position",
      "week",
      "opponent",
      "offense_snaps",
      "offense_pct",
    ],
  },
];

function sqlValue(v: string | number): string {
  return typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`;
}

function insertBatch(table: string, rows: (string | number)[][]): string {
  const values = rows.map((r) => `(${r.map(sqlValue).join(",")})`).join(",");
  return `INSERT INTO ${table} VALUES ${values};`;
}

export function buildFieldSeedSql(data: FieldData): string {
  return [
    `CREATE TABLE player_weeks (
      player TEXT, team TEXT, position TEXT, week INTEGER, opponent TEXT,
      completions INTEGER, attempts INTEGER, pass_yards INTEGER, pass_tds INTEGER,
      interceptions INTEGER, carries INTEGER, rush_yards INTEGER, rush_tds INTEGER,
      receptions INTEGER, targets INTEGER, rec_yards INTEGER, rec_tds INTEGER,
      fantasy_ppr REAL
    );`,
    `CREATE TABLE player_seasons (
      player TEXT, team TEXT, position TEXT, season INTEGER, games INTEGER,
      pass_yards INTEGER, pass_tds INTEGER, interceptions INTEGER,
      rush_yards INTEGER, rush_tds INTEGER, receptions INTEGER,
      rec_yards INTEGER, rec_tds INTEGER, fantasy_ppr REAL, ppr_per_game REAL
    );`,
    `CREATE TABLE teams (team TEXT, name TEXT, conference TEXT, division TEXT);`,
    `CREATE TABLE injuries (
      player TEXT, team TEXT, position TEXT, week INTEGER,
      report_status TEXT, injury TEXT, practice_status TEXT
    );`,
    `CREATE TABLE snap_counts (
      player TEXT, team TEXT, position TEXT, week INTEGER, opponent TEXT,
      offense_snaps INTEGER, offense_pct INTEGER
    );`,
    insertBatch("player_weeks", data.weekly),
    insertBatch("player_seasons", data.seasons),
    insertBatch("teams", data.teams),
    // ?? [] so a stale field-data.json from before these tables existed still
    // boots the sandbox instead of throwing on a missing key.
    insertBatch("injuries", data.injuries ?? []),
    insertBatch("snap_counts", data.snaps ?? []),
  ].join("\n");
}

export type Drill = {
  id: string;
  tier: "Warm-ups" | "Position drills" | "Game situations";
  title: string;
  prompt: string;
  solution: string;
};

export const DRILLS: Drill[] = [
  {
    id: "first-look",
    tier: "Warm-ups",
    title: "First look",
    prompt: "Take a 10-row peek at the weekly stat sheet. What columns do you have to work with?",
    solution: "SELECT * FROM player_weeks LIMIT 10;",
  },
  {
    id: "snaps-vs-production",
    tier: "Warm-ups",
    title: "Snaps versus production",
    prompt:
      "Points tell you what a player did. Snaps tell you whether he had the chance. Pull the players who played the most offensive snaps in week 1, with their share of the team's plays.",
    solution:
      "SELECT player, team, position, offense_snaps, offense_pct\nFROM snap_counts\nWHERE week = 1\nORDER BY offense_snaps DESC\nLIMIT 15;",
  },
  {
    id: "who-was-hurt",
    tier: "Warm-ups",
    title: "Why did he disappear?",
    prompt:
      "A player vanishes from the stat sheet and you want to know why. Find everyone listed as Out on the week 2 injury report, and what the injury was.",
    solution:
      "SELECT player, team, position, injury, practice_status\nFROM injuries\nWHERE week = 2 AND report_status = 'Out'\nORDER BY team, player;",
  },
  {
    id: "team-season",
    tier: "Warm-ups",
    title: "Follow your team",
    prompt: "Pull every weekly stat line for your favorite team, in week order. (Team abbreviations live in the teams table.)",
    solution: "SELECT player, position, week, opponent, fantasy_ppr\nFROM player_weeks\nWHERE team = 'DET'\nORDER BY week, fantasy_ppr DESC;",
  },
  {
    id: "top-games",
    tier: "Position drills",
    title: "The highlight reel",
    prompt: "Find the 10 biggest single-game PPR performances of the season. Who went nuclear, and in which week?",
    solution: "SELECT player, team, week, opponent, fantasy_ppr\nFROM player_weeks\nORDER BY fantasy_ppr DESC\nLIMIT 10;",
  },
  {
    id: "thousand-club",
    tier: "Position drills",
    title: "The 1,000-yard club",
    prompt: "List every receiver who cleared 1,000 receiving yards in the latest season, most yards first.",
    solution: "SELECT player, team, receptions, rec_yards, rec_tds\nFROM player_seasons\nWHERE season = 2025 AND rec_yards >= 1000\nORDER BY rec_yards DESC;",
  },
  {
    id: "qb-efficiency",
    tier: "Position drills",
    title: "Gunslingers vs game managers",
    prompt: "For QBs with 20+ passing TDs in 2025, show their TD-to-interception ratio. Who takes care of the ball?",
    solution: "SELECT player, team, pass_tds, interceptions,\n       ROUND(CAST(pass_tds AS REAL) / MAX(interceptions, 1), 1) AS td_int_ratio\nFROM player_seasons\nWHERE season = 2025 AND position = 'QB' AND pass_tds >= 20\nORDER BY td_int_ratio DESC;",
  },
  {
    id: "volume-kings",
    tier: "Position drills",
    title: "Volume is king",
    prompt: "Aggregate the weekly data: who led the league in targets? Show targets and total catches, top 10.",
    solution: "SELECT player, team, SUM(targets) AS total_targets,\n       SUM(receptions) AS total_catches\nFROM player_weeks\nGROUP BY player, team\nORDER BY total_targets DESC\nLIMIT 10;",
  },
  {
    id: "division-power",
    tier: "Game situations",
    title: "Division power rankings",
    prompt: "JOIN the teams table to the weekly stats: which NFL division produced the most total fantasy points?",
    solution: "SELECT t.conference, t.division,\n       ROUND(SUM(w.fantasy_ppr), 1) AS total_ppr\nFROM player_weeks w\nJOIN teams t ON t.team = w.team\nGROUP BY t.conference, t.division\nORDER BY total_ppr DESC;",
  },
  {
    id: "breakout-check",
    tier: "Game situations",
    title: "Breakout or fluke?",
    prompt: "Pick any player and trace their three-season arc in player_seasons: games, total PPR, and points per game. Trending up or down?",
    solution: "SELECT season, team, games, fantasy_ppr, ppr_per_game\nFROM player_seasons\nWHERE player = 'Puka Nacua'\nORDER BY season;",
  },
  {
    id: "consistency",
    tier: "Game situations",
    title: "Floor vs ceiling",
    prompt: "For one position, who was most consistent week to week? Compare each player's average, best, and worst game (min 8 games).",
    solution: "SELECT player, team, COUNT(*) AS games,\n       ROUND(AVG(fantasy_ppr), 1) AS avg_ppr,\n       MAX(fantasy_ppr) AS ceiling,\n       MIN(fantasy_ppr) AS floor\nFROM player_weeks\nWHERE position = 'RB'\nGROUP BY player, team\nHAVING games >= 8\nORDER BY avg_ppr DESC\nLIMIT 15;",
  },
];

/**
 * Drills on the 2025 play-by-play (lib/plays-dataset.ts), which the field
 * loads only when someone asks for it (2026-10-06). Fantasy-first: who gets
 * the ball near the goal line, who's being thrown deep, which plays went
 * for the most. verify-answer-keys.mjs runs every solution.
 */
export const PLAY_DRILLS: Drill[] = [
  {
    id: "goal-line-touches",
    tier: "Game situations",
    title: "Goal-line touches",
    prompt: "Touchdowns come from touches near the goal line. Who got the most carries plus targets inside the opponent's 10 (yardline_100 <= 10)?",
    solution: "SELECT COALESCE(receiver, rusher) AS player,\n       COUNT(*) AS touches_inside_10\nFROM plays\nWHERE yardline_100 <= 10\n  AND play_type IN ('pass', 'run')\n  AND COALESCE(receiver, rusher) IS NOT NULL\nGROUP BY player\nORDER BY touches_inside_10 DESC\nLIMIT 15;",
  },
  {
    id: "air-yards",
    tier: "Position drills",
    title: "Air yards leaders",
    prompt: "Air yards are how far the ball travels past the line on each throw at a player, caught or not. Who was targeted for the most air yards?",
    solution: "SELECT receiver, COUNT(*) AS targets,\n       SUM(air_yards) AS air_yards\nFROM plays\nWHERE play_type = 'pass' AND receiver IS NOT NULL\nGROUP BY receiver\nORDER BY air_yards DESC\nLIMIT 15;",
  },
  {
    id: "explosive-plays",
    tier: "Warm-ups",
    title: "The season's biggest plays",
    prompt: "List the ten longest gains of 2025: the week, the offense, the passer or rusher, the receiver and the yards.",
    solution: "SELECT week, posteam AS team,\n       COALESCE(passer, rusher) AS thrown_or_run_by,\n       receiver, yards_gained\nFROM plays\nWHERE play_type IN ('pass', 'run')\nORDER BY yards_gained DESC\nLIMIT 10;",
  },
  {
    id: "fourth-down-calls",
    tier: "Game situations",
    title: "Go for it or kick?",
    prompt: "On 4th down a team passes, runs, punts or kicks. Which offenses went for it (a pass or a run) most often?",
    solution: "SELECT posteam AS team,\n       COUNT(*) AS fourth_downs,\n       SUM(play_type IN ('pass', 'run')) AS went_for_it\nFROM plays\nWHERE down = 4\nGROUP BY posteam\nORDER BY went_for_it DESC\nLIMIT 10;",
  },
  {
    id: "epa-by-down",
    tier: "Position drills",
    title: "Pass or run, by down",
    prompt: "epa is nflverse's model of the points a play added. Compare passes and runs on each down: how many, and how much each one added on average.",
    solution: "SELECT down, play_type, COUNT(*) AS plays,\n       ROUND(AVG(epa), 3) AS epa_per_play\nFROM plays\nWHERE play_type IN ('pass', 'run')\nGROUP BY down, play_type\nORDER BY down, play_type;",
  },
];

/** What the schema panel shows for the play-by-play once it's loaded. */
export const PLAYS_FIELD_SCHEMA = {
  table: "plays",
  grain: "one row per pass, run, punt or field goal · 2025 regular season",
  columns: [
    "game_id", "week", "posteam", "defteam", "drive", "qtr", "down", "ydstogo", "yardline_100",
    "score_differential", "play_type", "passer", "rusher", "receiver", "air_yards", "complete_pass",
    "yards_gained", "first_down", "touchdown", "td_team", "interception", "sack", "fumble_lost",
    "field_goal_result", "kick_distance", "epa",
  ],
};
