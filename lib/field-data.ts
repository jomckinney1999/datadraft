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
    insertBatch("player_weeks", data.weekly),
    insertBatch("player_seasons", data.seasons),
    insertBatch("teams", data.teams),
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
