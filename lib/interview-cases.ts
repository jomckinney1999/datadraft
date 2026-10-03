/**
 * Scripted interview cases — InterviewMaster-style analyst scenarios.
 *
 * Each case ships its own tiny seed (CREATE + INSERT), not the lesson DB, so
 * answer keys stay stable and the schema matches only what the brief shows.
 * Orgs are invented sports-tech brands — no real NFL / Big-Tech marks.
 */

export type Difficulty = "easy" | "medium" | "hard";

export type InterviewQuestion = {
  id: string;
  prompt: string;
  hint: string;
  expected: string;
  orderMatters?: boolean;
  explain: string;
};

export type InterviewTable = {
  table: string;
  columns: string[];
};

export type InterviewCase = {
  id: string;
  title: string;
  org: string;
  difficulty: Difficulty;
  skills: string[];
  blurb: string;
  role: string;
  schema: InterviewTable[];
  seedSql: string;
  questions: InterviewQuestion[];
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const INTERVIEW_CASES: InterviewCase[] = [
  // ── Easy 1 ─────────────────────────────────────────────────────
  {
    id: "waiver-pulse",
    title: "Waiver Wire Pulse for Roster Health",
    org: "Gridiron Desk",
    difficulty: "easy",
    skills: ["Filtering", "COUNT", "DISTINCT"],
    blurb:
      "Product wants to know how diverse last month's waiver recommendations were.",
    role: "You are a Product Analyst on the Gridiron Desk fantasy app. The roster team is deciding whether waiver suggestions feel repetitive.",
    schema: [
      {
        table: "fct_waiver_recs",
        columns: [
          "rec_id",
          "user_id",
          "player_name",
          "position",
          "rec_date",
          "is_new_add",
        ],
      },
    ],
    seedSql: `
CREATE TABLE fct_waiver_recs (
  rec_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  rec_date TEXT NOT NULL,
  is_new_add INTEGER NOT NULL
);
INSERT INTO fct_waiver_recs VALUES
  (1, 101, 'Jaylen Warren', 'RB', '2024-04-03', 1),
  (2, 101, 'Romeo Doubs', 'WR', '2024-04-05', 0),
  (3, 102, 'Jaylen Warren', 'RB', '2024-04-08', 1),
  (4, 103, 'Tucker Kraft', 'TE', '2024-04-12', 1),
  (5, 102, 'Isaiah Likely', 'TE', '2024-04-18', 1),
  (6, 104, 'Romeo Doubs', 'WR', '2024-04-22', 0),
  (7, 105, 'Kimani Vidal', 'RB', '2024-04-27', 1),
  (8, 101, 'Jaylen Warren', 'RB', '2024-05-02', 0),
  (9, 106, 'Jalen Coker', 'WR', '2024-05-06', 1),
  (10, 103, 'Tucker Kraft', 'TE', '2024-05-11', 0),
  (11, 107, 'Ray Davis', 'RB', '2024-05-15', 1),
  (12, 104, 'Jalen Coker', 'WR', '2024-05-20', 1);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "How many unique players were recommended to users in April 2024? This helps gauge recommendation diversity that month.",
        hint: "Filter rec_date to April 2024, then COUNT(DISTINCT player_name).",
        expected:
          "SELECT COUNT(DISTINCT player_name) AS unique_players FROM fct_waiver_recs WHERE rec_date >= '2024-04-01' AND rec_date < '2024-05-01';",
        orderMatters: false,
        explain:
          "Five distinct names hit the wire in April — Warren, Doubs, Kraft, Likely, and Vidal.",
      },
      {
        id: "q2",
        prompt:
          "What is the total number of recommendations marked as new adds (is_new_add = 1) in May 2024?",
        hint: "Filter May 2024 and is_new_add = 1, then COUNT(*).",
        expected:
          "SELECT COUNT(*) AS total_new_adds FROM fct_waiver_recs WHERE rec_date >= '2024-05-01' AND rec_date < '2024-06-01' AND is_new_add = 1;",
        orderMatters: false,
        explain:
          "Three new-add flags in May — Coker (twice across users) and Ray Davis.",
      },
      {
        id: "q3",
        prompt:
          "List every distinct position that appeared in the recommendation log, alphabetically.",
        hint: "SELECT DISTINCT position … ORDER BY position.",
        expected:
          "SELECT DISTINCT position FROM fct_waiver_recs ORDER BY position;",
        orderMatters: true,
        explain: "RB, TE, WR — the three skill spots the wire covers here.",
      },
    ],
  },

  // ── Easy 2 ─────────────────────────────────────────────────────
  {
    id: "slate-leaders",
    title: "Sunday Slate Scoring Leaders",
    org: "SnapCount Labs",
    difficulty: "easy",
    skills: ["Sorting", "LIMIT", "Filtering"],
    blurb:
      "Content needs a highlight reel of the biggest single-game scores from week 3.",
    role: "You are an Analytics Engineer at SnapCount Labs supporting the Sunday recap newsletter.",
    schema: [
      {
        table: "game_scores",
        columns: [
          "player_name",
          "team",
          "position",
          "week",
          "fantasy_pts",
        ],
      },
    ],
    seedSql: `
CREATE TABLE game_scores (
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT NOT NULL,
  week INTEGER NOT NULL,
  fantasy_pts REAL NOT NULL
);
INSERT INTO game_scores VALUES
  ('Lamar Jackson', 'BAL', 'QB', 3, 28.4),
  ('Ja''Marr Chase', 'CIN', 'WR', 3, 31.2),
  ('Saquon Barkley', 'PHI', 'RB', 3, 24.1),
  ('Josh Allen', 'BUF', 'QB', 3, 22.6),
  ('Amon-Ra St. Brown', 'DET', 'WR', 3, 19.8),
  ('George Kittle', 'SF', 'TE', 3, 18.4),
  ('Jahmyr Gibbs', 'DET', 'RB', 3, 17.2),
  ('CeeDee Lamb', 'DAL', 'WR', 3, 12.5),
  ('Lamar Jackson', 'BAL', 'QB', 2, 14.0),
  ('Ja''Marr Chase', 'CIN', 'WR', 2, 8.6);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "Return the top 3 week-3 performances by fantasy_pts (player_name, fantasy_pts), highest first.",
        hint: "WHERE week = 3, ORDER BY fantasy_pts DESC, LIMIT 3.",
        expected:
          "SELECT player_name, fantasy_pts FROM game_scores WHERE week = 3 ORDER BY fantasy_pts DESC LIMIT 3;",
        orderMatters: true,
        explain:
          "Chase 31.2, Lamar 28.4, Barkley 24.1 — the newsletter lead.",
      },
      {
        id: "q2",
        prompt:
          "How many week-3 games cleared 20.0 fantasy points?",
        hint: "COUNT(*) with week = 3 AND fantasy_pts > 20.",
        expected:
          "SELECT COUNT(*) AS boom_games FROM game_scores WHERE week = 3 AND fantasy_pts > 20;",
        orderMatters: false,
        explain: "Four boom games on that slate.",
      },
      {
        id: "q3",
        prompt:
          "List week-3 WRs by fantasy_pts descending: player_name, fantasy_pts.",
        hint: "Filter position = 'WR' and week = 3, then sort.",
        expected:
          "SELECT player_name, fantasy_pts FROM game_scores WHERE week = 3 AND position = 'WR' ORDER BY fantasy_pts DESC;",
        orderMatters: true,
        explain: "Chase, St. Brown, Lamb — WR board for the recap sidebar.",
      },
    ],
  },

  // ── Medium 1 ───────────────────────────────────────────────────
  {
    id: "league-standings",
    title: "Private League Power Rankings",
    org: "Waiver Wire Labs",
    difficulty: "medium",
    skills: ["JOINs", "GROUP BY", "Aggregations"],
    blurb:
      "Commissioner tools need season-to-date points by fantasy team for the standings page.",
    role: "You are a Data Analyst on Waiver Wire Labs building the in-app league standings module.",
    schema: [
      {
        table: "fantasy_teams",
        columns: ["team_id", "team_name", "owner"],
      },
      {
        table: "roster_scores",
        columns: ["team_id", "player_name", "week", "points"],
      },
    ],
    seedSql: `
CREATE TABLE fantasy_teams (
  team_id INTEGER PRIMARY KEY,
  team_name TEXT NOT NULL,
  owner TEXT NOT NULL
);
CREATE TABLE roster_scores (
  team_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  week INTEGER NOT NULL,
  points REAL NOT NULL
);
INSERT INTO fantasy_teams VALUES
  (1, 'Blitz Brothers', 'Jordan'),
  (2, 'Fourth & Long', 'Riley'),
  (3, 'Touchdown Factory', 'Sam');
INSERT INTO roster_scores VALUES
  (1, 'Josh Allen', 1, 24.6),
  (1, 'Travis Kelce', 1, 12.4),
  (1, 'Josh Allen', 2, 18.2),
  (1, 'Travis Kelce', 2, 9.1),
  (2, 'Patrick Mahomes', 1, 21.0),
  (2, 'CeeDee Lamb', 1, 22.4),
  (2, 'Patrick Mahomes', 2, 16.5),
  (2, 'CeeDee Lamb', 2, 14.2),
  (3, 'Lamar Jackson', 1, 28.4),
  (3, 'Bijan Robinson', 1, 11.0),
  (3, 'Lamar Jackson', 2, 19.6),
  (3, 'Bijan Robinson', 2, 15.3);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "Season standings: team_name and total_points (sum of points, rounded to 1 decimal), highest first.",
        hint: "JOIN fantasy_teams to roster_scores on team_id, GROUP BY team_name, ORDER BY total DESC.",
        expected:
          "SELECT t.team_name, ROUND(SUM(s.points), 1) AS total_points FROM fantasy_teams t JOIN roster_scores s ON t.team_id = s.team_id GROUP BY t.team_name ORDER BY total_points DESC;",
        orderMatters: true,
        explain:
          "Touchdown Factory 74.3, Fourth & Long 74.1, Blitz Brothers 64.3.",
      },
      {
        id: "q2",
        prompt:
          "For week 2 only, return team_name and week_points (sum, 1 decimal), highest first.",
        hint: "Same join, add WHERE s.week = 2.",
        expected:
          "SELECT t.team_name, ROUND(SUM(s.points), 1) AS week_points FROM fantasy_teams t JOIN roster_scores s ON t.team_id = s.team_id WHERE s.week = 2 GROUP BY t.team_name ORDER BY week_points DESC;",
        orderMatters: true,
        explain: "Touchdown Factory edged the week at 34.9.",
      },
      {
        id: "q3",
        prompt:
          "Which owner has the highest season total? Return owner and total_points (1 decimal).",
        hint: "GROUP BY owner instead of team_name.",
        expected:
          "SELECT t.owner, ROUND(SUM(s.points), 1) AS total_points FROM fantasy_teams t JOIN roster_scores s ON t.team_id = s.team_id GROUP BY t.owner ORDER BY total_points DESC LIMIT 1;",
        orderMatters: true,
        explain: "Sam at 74.3 — one team per owner here, so owner and team align.",
      },
    ],
  },

  // ── Medium 2 ───────────────────────────────────────────────────
  {
    id: "form-guide",
    title: "Starter Form Guide Week-over-Week",
    org: "Sideline Metrics",
    difficulty: "medium",
    skills: ["Self-join", "Filtering", "Sorting"],
    blurb:
      "Coaching product wants each player's points next to their prior week for the form strip.",
    role: "You are a Product Analyst at Sideline Metrics shipping the in-app form guide.",
    schema: [
      {
        table: "weekly_form",
        columns: ["player_name", "week", "fantasy_pts"],
      },
    ],
    seedSql: `
CREATE TABLE weekly_form (
  player_name TEXT NOT NULL,
  week INTEGER NOT NULL,
  fantasy_pts REAL NOT NULL
);
INSERT INTO weekly_form VALUES
  ('Josh Allen', 1, 24.6),
  ('Josh Allen', 2, 18.2),
  ('Josh Allen', 3, 27.1),
  ('Ja''Marr Chase', 1, 14.0),
  ('Ja''Marr Chase', 2, 31.2),
  ('Ja''Marr Chase', 3, 22.4),
  ('Saquon Barkley', 1, 16.5),
  ('Saquon Barkley', 2, 12.0),
  ('Saquon Barkley', 3, 24.1);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "For every player-week that has a previous week, return player_name, week, fantasy_pts, and prev_pts (prior week's points). Order by player_name, then week.",
        hint: "Self-join weekly_form a to b ON same player AND b.week = a.week - 1.",
        expected:
          "SELECT a.player_name, a.week, a.fantasy_pts, b.fantasy_pts AS prev_pts FROM weekly_form a JOIN weekly_form b ON a.player_name = b.player_name AND b.week = a.week - 1 ORDER BY a.player_name, a.week;",
        orderMatters: true,
        explain:
          "Six rows — weeks 2 and 3 for each of the three players, with prior week attached.",
      },
      {
        id: "q2",
        prompt:
          "Same shape, but only rows where the player scored at least 5.0 more than the prior week. Order by player_name, week.",
        hint: "Add WHERE a.fantasy_pts >= b.fantasy_pts + 5.",
        expected:
          "SELECT a.player_name, a.week, a.fantasy_pts, b.fantasy_pts AS prev_pts FROM weekly_form a JOIN weekly_form b ON a.player_name = b.player_name AND b.week = a.week - 1 WHERE a.fantasy_pts >= b.fantasy_pts + 5 ORDER BY a.player_name, a.week;",
        orderMatters: true,
        explain:
          "Three form spikes: Chase week 2, Allen week 3, and Barkley week 3.",
      },
      {
        id: "q3",
        prompt:
          "Josh Allen only: week, fantasy_pts, prev_pts for weeks that have a prior week, ordered by week.",
        hint: "Same self-join with WHERE a.player_name = 'Josh Allen'.",
        expected:
          "SELECT a.week, a.fantasy_pts, b.fantasy_pts AS prev_pts FROM weekly_form a JOIN weekly_form b ON a.player_name = b.player_name AND b.week = a.week - 1 WHERE a.player_name = 'Josh Allen' ORDER BY a.week;",
        orderMatters: true,
        explain: "Week 2 vs 24.6, week 3 vs 18.2 — Allen's three-week arc.",
      },
    ],
  },

  // ── Hard 1 ─────────────────────────────────────────────────────
  {
    id: "positional-ranks",
    title: "Positional Rank Board for Draft Room",
    org: "Combine Analytics",
    difficulty: "hard",
    skills: ["Window functions", "RANK", "Subqueries"],
    blurb:
      "Draft room UI needs the top 2 scorers at each position from the sample slate.",
    role: "You are an Analytics Engineer at Combine Analytics building the live draft board.",
    schema: [
      {
        table: "slate_scores",
        columns: ["player_name", "position", "fantasy_pts"],
      },
    ],
    seedSql: `
CREATE TABLE slate_scores (
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  fantasy_pts REAL NOT NULL
);
INSERT INTO slate_scores VALUES
  ('Lamar Jackson', 'QB', 28.4),
  ('Josh Allen', 'QB', 24.6),
  ('Jalen Hurts', 'QB', 21.0),
  ('Saquon Barkley', 'RB', 24.1),
  ('Jahmyr Gibbs', 'RB', 22.0),
  ('Bijan Robinson', 'RB', 18.5),
  ('Ja''Marr Chase', 'WR', 31.2),
  ('CeeDee Lamb', 'WR', 22.4),
  ('Amon-Ra St. Brown', 'WR', 19.8),
  ('George Kittle', 'TE', 18.4),
  ('Travis Kelce', 'TE', 14.2),
  ('Tucker Kraft', 'TE', 11.0);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "Rank every player within their position by fantasy_pts descending. Return player_name, position, fantasy_pts, pos_rank (RANK). Order by position, pos_rank.",
        hint: "RANK() OVER (PARTITION BY position ORDER BY fantasy_pts DESC).",
        expected:
          "SELECT player_name, position, fantasy_pts, RANK() OVER (PARTITION BY position ORDER BY fantasy_pts DESC) AS pos_rank FROM slate_scores ORDER BY position, pos_rank;",
        orderMatters: true,
        explain:
          "Each position restarts at 1 — the core draft-board ranking pattern.",
      },
      {
        id: "q2",
        prompt:
          "Keep only the top 2 at each position (pos_rank <= 2). Same columns, order by position, pos_rank.",
        hint: "Wrap the RANK query in a subquery (or CTE), then WHERE pos_rank <= 2.",
        expected:
          "SELECT player_name, position, fantasy_pts, pos_rank FROM (SELECT player_name, position, fantasy_pts, RANK() OVER (PARTITION BY position ORDER BY fantasy_pts DESC) AS pos_rank FROM slate_scores) WHERE pos_rank <= 2 ORDER BY position, pos_rank;",
        orderMatters: true,
        explain:
          "Eight rows — QB1/2, RB1/2, TE1/2, WR1/2. Window first, filter second.",
      },
      {
        id: "q3",
        prompt:
          "Among those top-2-per-position players, who has the single highest fantasy_pts? Return player_name and fantasy_pts only.",
        hint: "Reuse the top-2 subquery, then ORDER BY fantasy_pts DESC LIMIT 1.",
        expected:
          "SELECT player_name, fantasy_pts FROM (SELECT player_name, position, fantasy_pts, RANK() OVER (PARTITION BY position ORDER BY fantasy_pts DESC) AS pos_rank FROM slate_scores) WHERE pos_rank <= 2 ORDER BY fantasy_pts DESC LIMIT 1;",
        orderMatters: true,
        explain: "Ja'Marr Chase at 31.2 — WR1 and overall slate king.",
      },
    ],
  },

  // ── Hard 2 ─────────────────────────────────────────────────────
  {
    id: "retention-report",
    title: "Engagement Retention for Lineup Lock",
    org: "Lock Screen Co",
    difficulty: "hard",
    skills: ["CTEs", "Aggregations", "HAVING"],
    blurb:
      "Growth wants users who set a lineup in both week 1 and week 2 — sticky managers.",
    role: "You are a Product Analyst at Lock Screen Co measuring lineup-lock retention.",
    schema: [
      {
        table: "lineup_locks",
        columns: ["user_id", "week", "players_started", "locked_at"],
      },
    ],
    seedSql: `
CREATE TABLE lineup_locks (
  user_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  players_started INTEGER NOT NULL,
  locked_at TEXT NOT NULL
);
INSERT INTO lineup_locks VALUES
  (1, 1, 9, '2024-09-08 11:02'),
  (1, 2, 9, '2024-09-15 10:40'),
  (2, 1, 8, '2024-09-08 12:15'),
  (3, 1, 9, '2024-09-08 09:50'),
  (3, 2, 7, '2024-09-15 13:01'),
  (4, 2, 9, '2024-09-15 11:22'),
  (5, 1, 6, '2024-09-08 14:00'),
  (5, 2, 9, '2024-09-15 10:05'),
  (6, 1, 9, '2024-09-08 10:11'),
  (7, 1, 9, '2024-09-08 16:40'),
  (7, 2, 9, '2024-09-15 16:40'),
  (8, 2, 8, '2024-09-15 12:00');
`,
    questions: [
      {
        id: "q1",
        prompt:
          "Using a CTE named week1_users (distinct user_id from week 1), how many of those users also locked a lineup in week 2? One column: retained.",
        hint: "WITH week1_users AS (SELECT DISTINCT user_id … WHERE week = 1) then COUNT users also in week 2.",
        expected:
          "WITH week1_users AS (SELECT DISTINCT user_id FROM lineup_locks WHERE week = 1) SELECT COUNT(*) AS retained FROM week1_users w WHERE EXISTS (SELECT 1 FROM lineup_locks l WHERE l.user_id = w.user_id AND l.week = 2);",
        orderMatters: false,
        explain:
          "Four of six week-1 lockers returned in week 2 (users 1, 3, 5, 7).",
      },
      {
        id: "q2",
        prompt:
          "List user_id values that locked in both weeks, ordered by user_id.",
        hint: "GROUP BY user_id HAVING COUNT(DISTINCT week) = 2.",
        expected:
          "SELECT user_id FROM lineup_locks GROUP BY user_id HAVING COUNT(DISTINCT week) = 2 ORDER BY user_id;",
        orderMatters: true,
        explain: "Users 1, 3, 5, 7 — the retained cohort.",
      },
      {
        id: "q3",
        prompt:
          "Among retained users (both weeks), return user_id and avg_started (average players_started across both locks, 1 decimal), highest avg first.",
        hint: "Filter to the retained set (HAVING or CTE), then AVG(players_started).",
        expected:
          "SELECT user_id, ROUND(AVG(players_started), 1) AS avg_started FROM lineup_locks GROUP BY user_id HAVING COUNT(DISTINCT week) = 2 ORDER BY avg_started DESC, user_id;",
        orderMatters: true,
        explain:
          "Users 1 and 7 average 9.0 starters; 5 averages 7.5; 3 averages 8.0.",
      },
    ],
  },

  // ── Easy 3 ─────────────────────────────────────────────────────
  {
    id: "bye-week-gaps",
    title: "Bye Week Gaps on the Depth Chart",
    org: "Roster Stack",
    difficulty: "easy",
    skills: ["LEFT JOIN", "NULLs", "Filtering"],
    blurb:
      "Product wants every rostered player listed with week-5 points — including the ones who were on bye.",
    role: "You are a Data Analyst at Roster Stack. The depth-chart view is blank for bye weeks, and managers think their players disappeared.",
    schema: [
      {
        table: "roster",
        columns: ["player_id", "player_name", "position", "team"],
      },
      {
        table: "week5_scores",
        columns: ["player_id", "points"],
      },
    ],
    seedSql: `
CREATE TABLE roster (
  player_id INTEGER PRIMARY KEY,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  team TEXT NOT NULL
);
CREATE TABLE week5_scores (
  player_id INTEGER PRIMARY KEY,
  points REAL NOT NULL
);
INSERT INTO roster VALUES
  (1, 'Josh Allen', 'QB', 'BUF'),
  (2, 'Saquon Barkley', 'RB', 'PHI'),
  (3, 'CeeDee Lamb', 'WR', 'DAL'),
  (4, 'Travis Kelce', 'TE', 'KC'),
  (5, 'Tyreek Hill', 'WR', 'MIA'),
  (6, 'Justin Jefferson', 'WR', 'MIN');
INSERT INTO week5_scores VALUES
  (1, 22.4),
  (2, 18.1),
  (3, 14.6),
  (5, 9.2);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "Return every rostered player with week_5_points. Players with no week-5 row should show NULL. Columns: player_name, position, week_5_points. Order by player_name.",
        hint: "LEFT JOIN roster to week5_scores on player_id.",
        expected:
          "SELECT r.player_name, r.position, s.points AS week_5_points FROM roster r LEFT JOIN week5_scores s ON r.player_id = s.player_id ORDER BY r.player_name;",
        orderMatters: true,
        explain:
          "Kelce and Jefferson are NULL — bye or inactive. An INNER JOIN would have dropped them.",
      },
      {
        id: "q2",
        prompt:
          "Which rostered players have no week-5 score? Return player_name and team, ordered by player_name.",
        hint: "LEFT JOIN, then WHERE s.player_id IS NULL (or points IS NULL).",
        expected:
          "SELECT r.player_name, r.team FROM roster r LEFT JOIN week5_scores s ON r.player_id = s.player_id WHERE s.player_id IS NULL ORDER BY r.player_name;",
        orderMatters: true,
        explain: "Justin Jefferson (MIN) and Travis Kelce (KC).",
      },
      {
        id: "q3",
        prompt:
          "Among players who did score in week 5, return player_name and points, highest points first.",
        hint: "INNER JOIN (or LEFT JOIN with WHERE s.points IS NOT NULL), ORDER BY points DESC.",
        expected:
          "SELECT r.player_name, s.points FROM roster r JOIN week5_scores s ON r.player_id = s.player_id ORDER BY s.points DESC;",
        orderMatters: true,
        explain: "Allen 22.4, Barkley 18.1, Lamb 14.6, Hill 9.2.",
      },
    ],
  },

  // ── Medium 3 ───────────────────────────────────────────────────
  {
    id: "trade-ledger",
    title: "Trade Ledger — Who Got the Points?",
    org: "Commissioner OS",
    difficulty: "medium",
    skills: ["JOINs", "CASE", "Aggregation"],
    blurb:
      "Commissioners want a post-trade report: points each side scored after the deal, from the players they received.",
    role: "You are an Analyst at Commissioner OS. A heated trade just went through, and both managers swear they won.",
    schema: [
      {
        table: "trades",
        columns: ["trade_id", "from_manager", "to_manager", "player_name"],
      },
      {
        table: "post_trade_scores",
        columns: ["player_name", "week", "points"],
      },
    ],
    seedSql: `
CREATE TABLE trades (
  trade_id INTEGER NOT NULL,
  from_manager TEXT NOT NULL,
  to_manager TEXT NOT NULL,
  player_name TEXT NOT NULL
);
CREATE TABLE post_trade_scores (
  player_name TEXT NOT NULL,
  week INTEGER NOT NULL,
  points REAL NOT NULL
);
INSERT INTO trades VALUES
  (1, 'Jordan', 'Riley', 'Puka Nacua'),
  (1, 'Jordan', 'Riley', 'Rachaad White'),
  (1, 'Riley', 'Jordan', 'A.J. Brown'),
  (1, 'Riley', 'Jordan', 'Isiah Pacheco');
INSERT INTO post_trade_scores VALUES
  ('Puka Nacua', 8, 21.4),
  ('Puka Nacua', 9, 16.2),
  ('Rachaad White', 8, 8.1),
  ('Rachaad White', 9, 6.4),
  ('A.J. Brown', 8, 18.7),
  ('A.J. Brown', 9, 12.3),
  ('Isiah Pacheco', 8, 14.0),
  ('Isiah Pacheco', 9, 11.5);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "For each manager who received players, return manager and points_received (sum of post-trade points for players they got, 1 decimal). Highest first.",
        hint: "JOIN trades to post_trade_scores on player_name; GROUP BY to_manager.",
        expected:
          "SELECT t.to_manager AS manager, ROUND(SUM(s.points), 1) AS points_received FROM trades t JOIN post_trade_scores s ON t.player_name = s.player_name GROUP BY t.to_manager ORDER BY points_received DESC;",
        orderMatters: true,
        explain: "Riley 52.1 from Nacua+White; Jordan 56.5 from Brown+Pacheco.",
      },
      {
        id: "q2",
        prompt:
          "List each traded player with to_manager and total_points after the trade (1 decimal), highest total first.",
        hint: "JOIN and GROUP BY player_name, to_manager.",
        expected:
          "SELECT t.player_name, t.to_manager, ROUND(SUM(s.points), 1) AS total_points FROM trades t JOIN post_trade_scores s ON t.player_name = s.player_name GROUP BY t.player_name, t.to_manager ORDER BY total_points DESC;",
        orderMatters: true,
        explain: "Puka 37.6 leads; then A.J. 31.0, Pacheco 25.5, White 14.5.",
      },
      {
        id: "q3",
        prompt:
          "Return one row: jordan_points and riley_points (each side's total from players received, 1 decimal) so the commissioner can paste a verdict.",
        hint: "Conditional SUM(CASE WHEN to_manager = …) in one SELECT, or two subqueries.",
        expected:
          "SELECT ROUND(SUM(CASE WHEN t.to_manager = 'Jordan' THEN s.points ELSE 0 END), 1) AS jordan_points, ROUND(SUM(CASE WHEN t.to_manager = 'Riley' THEN s.points ELSE 0 END), 1) AS riley_points FROM trades t JOIN post_trade_scores s ON t.player_name = s.player_name;",
        orderMatters: false,
        explain: "Jordan 56.5, Riley 52.1 — Jordan's side edged it on the scores so far.",
      },
    ],
  },

  // ── Hard 2 ─────────────────────────────────────────────────────
  {
    id: "red-zone-look",
    title: "Red Zone Look — Who Finishes Drives?",
    org: "SnapCount Labs",
    difficulty: "hard",
    skills: ["CASE", "GROUP BY", "HAVING", "Sorting"],
    blurb:
      "The recap desk wants red-zone conversion rates by player for the Sunday mailer — touches that became TDs.",
    role: "You are a Sports Data Analyst at SnapCount Labs. Editors want a conversion table, not a raw dump of every play.",
    schema: [
      {
        table: "red_zone_touches",
        columns: ["touch_id", "player_name", "position", "week", "is_td"],
      },
    ],
    seedSql: `
CREATE TABLE red_zone_touches (
  touch_id INTEGER PRIMARY KEY,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  week INTEGER NOT NULL,
  is_td INTEGER NOT NULL
);
INSERT INTO red_zone_touches VALUES
  (1, 'Christian McCaffrey', 'RB', 1, 1),
  (2, 'Christian McCaffrey', 'RB', 1, 0),
  (3, 'Christian McCaffrey', 'RB', 2, 1),
  (4, 'Christian McCaffrey', 'RB', 2, 1),
  (5, 'Christian McCaffrey', 'RB', 3, 0),
  (6, 'Amon-Ra St. Brown', 'WR', 1, 1),
  (7, 'Amon-Ra St. Brown', 'WR', 1, 0),
  (8, 'Amon-Ra St. Brown', 'WR', 2, 0),
  (9, 'Amon-Ra St. Brown', 'WR', 3, 1),
  (10, 'Amon-Ra St. Brown', 'WR', 3, 0),
  (11, 'Mark Andrews', 'TE', 1, 1),
  (12, 'Mark Andrews', 'TE', 2, 0),
  (13, 'Mark Andrews', 'TE', 3, 1),
  (14, 'Jahmyr Gibbs', 'RB', 1, 0),
  (15, 'Jahmyr Gibbs', 'RB', 2, 1),
  (16, 'Jahmyr Gibbs', 'RB', 2, 0),
  (17, 'Jahmyr Gibbs', 'RB', 3, 1),
  (18, 'Jahmyr Gibbs', 'RB', 3, 1),
  (19, 'Drake London', 'WR', 1, 0),
  (20, 'Drake London', 'WR', 2, 0);
`,
    questions: [
      {
        id: "q1",
        prompt:
          "For each player with at least 3 red-zone touches, return player_name, touches, tds, and conv_rate (tds/touches as a percent rounded to 1 decimal). Highest conv_rate first, then player_name.",
        hint: "GROUP BY player_name HAVING COUNT(*) >= 3. conv_rate = ROUND(100.0 * SUM(is_td) / COUNT(*), 1).",
        expected:
          "SELECT player_name, COUNT(*) AS touches, SUM(is_td) AS tds, ROUND(100.0 * SUM(is_td) / COUNT(*), 1) AS conv_rate FROM red_zone_touches GROUP BY player_name HAVING COUNT(*) >= 3 ORDER BY conv_rate DESC, player_name;",
        orderMatters: true,
        explain:
          "McCaffrey 60.0%, Gibbs 60.0%, Andrews 66.7%, St. Brown 40.0%. London is out (only 2 touches).",
      },
      {
        id: "q2",
        prompt:
          "By position, return position, touches, and td_rate (percent, 1 decimal). Order by td_rate DESC.",
        hint: "GROUP BY position — same rate formula.",
        expected:
          "SELECT position, COUNT(*) AS touches, ROUND(100.0 * SUM(is_td) / COUNT(*), 1) AS td_rate FROM red_zone_touches GROUP BY position ORDER BY td_rate DESC;",
        orderMatters: true,
        explain: "TE 66.7, RB 60.0, WR 28.6 — sample sizes differ; say so in a real write-up.",
      },
      {
        id: "q3",
        prompt:
          "Label each touch as 'score' or 'stop' with a CASE on is_td. Return player_name, week, and result for Christian McCaffrey only, ordered by week then touch_id.",
        hint: "CASE WHEN is_td = 1 THEN 'score' ELSE 'stop' END. Filter player_name.",
        expected:
          "SELECT player_name, week, CASE WHEN is_td = 1 THEN 'score' ELSE 'stop' END AS result FROM red_zone_touches WHERE player_name = 'Christian McCaffrey' ORDER BY week, touch_id;",
        orderMatters: true,
        explain: "Five rows for CMC: score, stop, score, score, stop.",
      },
    ],
  },
];

export function getInterviewCase(id: string): InterviewCase | undefined {
  return INTERVIEW_CASES.find((c) => c.id === id);
}

export function casesByDifficulty(diff: Difficulty | "all"): InterviewCase[] {
  if (diff === "all") return INTERVIEW_CASES;
  return INTERVIEW_CASES.filter((c) => c.difficulty === diff);
}
