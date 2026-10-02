/**
 * The Draft Room's scouting department: the SQL database you draft from.
 *
 *   players       the draft board: name, position, team, Sleeper ADP, bye,
 *                 age on Sept 1, and NFL draft capital (rookies have no
 *                 history, so where they were drafted is the signal)
 *   weekly        every regular-season game those players played in the
 *                 three seasons BEFORE the draft — never the season itself
 *   draft_picks   the draft so far, kept up to date after every pick
 *   available     a view: players nobody has taken yet
 *
 * After the season, `results` is added: the real weekly points of the season
 * you drafted for, so you can query what happened.
 *
 * Pure functions over a sql.js Database; the presets are written per season
 * so "last season" is always a real year in the query, not a parameter.
 */

import type { Database } from "sql.js";
import { LAST_WEEK, TEAMS, pickLabel, teamForPick, type DraftData, type League } from "@/lib/draft-sim";

export function seedScouting(db: Database, data: DraftData): void {
  db.run(`
    CREATE TABLE players (
      player_id TEXT PRIMARY KEY, player TEXT, position TEXT, team TEXT,
      adp REAL, bye_week INTEGER, age REAL, rookie INTEGER,
      nfl_draft_year INTEGER, nfl_draft_round INTEGER, nfl_draft_pick INTEGER
    );
    CREATE TABLE weekly (
      player_id TEXT, player TEXT, position TEXT, season INTEGER, week INTEGER,
      team TEXT, opponent TEXT, fantasy_pts REAL,
      pass_att INTEGER, pass_yds INTEGER, pass_td INTEGER, ints INTEGER,
      carries INTEGER, rush_yds INTEGER, rush_td INTEGER,
      targets INTEGER, receptions INTEGER, rec_yds INTEGER, rec_td INTEGER,
      target_share REAL
    );
    CREATE TABLE draft_picks (
      pick INTEGER, label TEXT, round INTEGER, manager TEXT,
      player_id TEXT, player TEXT, position TEXT
    );
    CREATE VIEW available AS
      SELECT * FROM players
      WHERE player_id NOT IN (SELECT player_id FROM draft_picks);
  `);
  db.run("BEGIN");
  const p = db.prepare("INSERT INTO players VALUES (?,?,?,?,?,?,?,?,?,?,?)");
  data.board.forEach((x) =>
    p.run([
      x.id,
      x.name,
      x.pos,
      x.team,
      x.adp,
      x.bye,
      x.age,
      x.rookie ? 1 : 0,
      x.nflDraftYear,
      x.nflDraftRound,
      x.nflDraftPick,
    ]),
  );
  p.free();
  const byId = new Map(data.board.map((x) => [x.id, x]));
  const w = db.prepare("INSERT INTO weekly VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
  data.scout.forEach((r) => {
    const x = byId.get(String(r[0]));
    if (!x) return;
    // Stored columns: player_id, season, week, team, opponent, fantasy_pts, …
    w.run([r[0], x.name, x.pos, ...r.slice(1)] as (string | number)[]);
  });
  w.free();
  db.run("COMMIT");
}

/** Rewrite draft_picks to match the pick list. */
export function syncPicks(db: Database, data: DraftData, league: League, picks: string[]): void {
  const byId = new Map(data.board.map((x) => [x.id, x]));
  db.run("DELETE FROM draft_picks");
  const s = db.prepare("INSERT INTO draft_picks VALUES (?,?,?,?,?,?,?)");
  picks.forEach((id, k) => {
    const x = byId.get(id);
    s.run([k + 1, pickLabel(k), Math.floor(k / TEAMS) + 1, league.managers[teamForPick(k)].name, id, x?.name ?? "", x?.pos ?? ""]);
  });
  s.free();
}

/** The season's real points, unlocked once it has been played. */
export function addResults(db: Database, data: DraftData): void {
  db.run(`
    DROP TABLE IF EXISTS results;
    CREATE TABLE results (player_id TEXT, player TEXT, position TEXT, week INTEGER, fantasy_pts REAL);
  `);
  db.run("BEGIN");
  const s = db.prepare("INSERT INTO results VALUES (?,?,?,?,?)");
  data.board.forEach((x) => {
    (data.points[x.id] ?? []).forEach((pts, i) => {
      if (pts !== null && i < LAST_WEEK) s.run([x.id, x.name, x.pos, i + 1, pts]);
    });
  });
  s.free();
  db.run("COMMIT");
}

export type ScoutPreset = { id: string; label: string; sql: string };

/** The scouting reports, written for the season being drafted. */
export function scoutPresets(data: DraftData): ScoutPreset[] {
  const last = data.season - 1;
  const [first] = data.scoutSeasons;
  const trendCols = data.scoutSeasons
    .map((s) => `       ROUND(AVG(CASE WHEN w.season = ${s} THEN w.fantasy_pts END), 1) AS ppg_${s}`)
    .join(",\n");
  return [
    {
      id: "ppg",
      label: "Last season's PPG",
      sql: `-- Points per game in ${last}, best available first.
-- Six games minimum, so one big week can't carry a player.
SELECT a.player, a.position, a.team, a.adp,
       COUNT(*) AS games,
       ROUND(AVG(w.fantasy_pts), 1) AS ppg
FROM available a
JOIN weekly w ON w.player_id = a.player_id
WHERE w.season = ${last}
GROUP BY a.player_id
HAVING COUNT(*) >= 6
ORDER BY ppg DESC
LIMIT 25;`,
    },
    {
      id: "value",
      label: "Value vs ADP",
      sql: `-- Who is the room sleeping on? Rank each position two ways:
-- by where people draft them (ADP) and by ${last} points per game.
-- A big gap means cheap production. Or a reason: check the games.
SELECT *, adp_rank - ppg_rank AS gap
FROM (
  SELECT a.player, a.position, a.adp,
         COUNT(*) AS games,
         ROUND(AVG(w.fantasy_pts), 1) AS ppg,
         RANK() OVER (PARTITION BY a.position ORDER BY a.adp) AS adp_rank,
         RANK() OVER (PARTITION BY a.position ORDER BY AVG(w.fantasy_pts) DESC) AS ppg_rank
  FROM available a
  JOIN weekly w ON w.player_id = a.player_id
  WHERE w.season = ${last}
  GROUP BY a.player_id
  HAVING COUNT(*) >= 6
)
ORDER BY gap DESC
LIMIT 25;`,
    },
    {
      id: "steady",
      label: "Most consistent",
      sql: `-- Best ball pays for big weeks. How often did each player
-- clear 15 points in ${last}?
SELECT a.player, a.position, a.adp,
       COUNT(*) AS games,
       SUM(w.fantasy_pts >= 15) AS big_games,
       ROUND(100.0 * SUM(w.fantasy_pts >= 15) / COUNT(*)) AS pct_big
FROM available a
JOIN weekly w ON w.player_id = a.player_id
WHERE w.season = ${last}
GROUP BY a.player_id
HAVING COUNT(*) >= 6
ORDER BY pct_big DESC, big_games DESC
LIMIT 25;`,
    },
    {
      id: "trend",
      label: `${first}–${last} trend`,
      sql: `-- Points per game, season by season. Rising or falling?
SELECT a.player, a.position, a.adp,
${trendCols}
FROM available a
JOIN weekly w ON w.player_id = a.player_id
GROUP BY a.player_id
ORDER BY ppg_${last} DESC
LIMIT 25;`,
    },
    {
      id: "targets",
      label: "Target hogs",
      sql: `-- Receivers and tight ends: targets are opportunity.
-- Share of the team's targets, per game, in ${last}.
SELECT a.player, a.position, a.team, a.adp,
       ROUND(AVG(w.targets), 1) AS targets_pg,
       ROUND(100 * AVG(w.target_share), 1) AS target_share_pct
FROM available a
JOIN weekly w ON w.player_id = a.player_id
WHERE w.season = ${last} AND a.position IN ('WR', 'TE')
GROUP BY a.player_id
HAVING COUNT(*) >= 6
ORDER BY target_share_pct DESC
LIMIT 25;`,
    },
    {
      id: "workload",
      label: "RB workload",
      sql: `-- Running backs: touches (carries + catches) per game in ${last}.
SELECT a.player, a.team, a.adp, a.age,
       ROUND(AVG(w.carries + w.receptions), 1) AS touches_pg,
       ROUND(AVG(w.fantasy_pts), 1) AS ppg
FROM available a
JOIN weekly w ON w.player_id = a.player_id
WHERE w.season = ${last} AND a.position = 'RB'
GROUP BY a.player_id
HAVING COUNT(*) >= 6
ORDER BY touches_pg DESC
LIMIT 25;`,
    },
    {
      id: "rookies",
      label: "Rookies",
      sql: `-- Rookies have no NFL history. Draft capital is the signal:
-- where did NFL teams spend their picks?
SELECT player, position, team, adp, nfl_draft_round, nfl_draft_pick
FROM available
WHERE rookie = 1
ORDER BY nfl_draft_pick IS NULL, nfl_draft_pick
LIMIT 25;`,
    },
  ];
}

/** A plain starter for writing your own. */
export function blankQuery(data: DraftData): string {
  return `-- Tables: players · weekly (${data.scoutSeasons[0]}–${data.season - 1}) · draft_picks · available
SELECT player, position, team, adp
FROM available
ORDER BY adp
LIMIT 20;`;
}

/** The query that unlocks after the season: what actually happened. */
export function resultsQuery(data: DraftData): string {
  return `-- The ${data.season} season, now that it's been played.
-- Who won leagues, and where were they drafted?
SELECT r.player, r.position, p.adp,
       ROUND(SUM(r.fantasy_pts), 1) AS season_pts
FROM results r
JOIN players p ON p.player_id = r.player_id
GROUP BY r.player_id
ORDER BY season_pts DESC
LIMIT 25;`;
}
