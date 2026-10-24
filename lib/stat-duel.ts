/**
 * The daily Stat Duel: five head-to-head questions on real NFL numbers.
 * "Who scored more PPR points in 2025: Puka Nacua or Ja'Marr Chase?" Tap one,
 * see both numbers, then see the SQL that proves it — and run it yourself.
 *
 * It is trivia about the data, never about football lore, because the point
 * is the query underneath: a guess needs no SQL, and the reveal is the
 * gentlest possible first look at some. That makes it the way in for the
 * person who isn't ready to write a query yet (docs/PLAN.md, Target user).
 *
 * Rules, all load-bearing:
 * - **Every number is computed from the pinned lesson data**, the same rows
 *   the SQL questions run on, and every round carries the SQL that produces
 *   it. `scripts/verify-answer-keys.mjs` runs that SQL for months of future
 *   days and fails if it disagrees with the number shown, if a round ties, or
 *   if a day can't fill five rounds.
 * - **Same five for everyone, picked by the league's day** (`leagueDay()`, in
 *   a server component), exactly like the Question of the Day. Seeded, never
 *   `Math.random()`, so the server and every visitor agree.
 * - **Like for like.** Players are only matched against their own position,
 *   so a duel is never "a quarterback scored more than a tight end".
 * - **No betting language.** "Who had more", never "over/under".
 *
 * **More than fantasy points (2026-10-25).** The first duels were PPR points
 * and team scores, which reads as memorising one number. From DUEL_V2 a duel
 * mixes the season's real box scores (passing, rushing and receiving yards,
 * catches, touchdowns, best single games, last week's games: the rows Roll
 * Call reads, as `player_weeks`), team records from `games`, and one fantasy
 * round, each labelled with its category and never two of a category in a
 * day. Box-score rounds count weeks up to the newest one whose numbers have
 * settled (two days after its last game, Roll Call's rule), so the data job
 * landing a new week can't change a day's rounds. Days before DUEL_V2 keep
 * the old mix, so nobody's duel changed under them the day it shipped.
 */

import { getWeekResults, type WeekResultRow } from "@/lib/fantasy-data";
import { LATEST, PACKED_GAMES } from "@/lib/lesson-data.generated";
import {
  ROLL_CALL_PLAYERS,
  ROLL_CALL_ROWS,
  ROLL_CALL_SEASON,
  ROLL_CALL_WEEK_ENDS,
} from "@/lib/roll-call-data.generated";
import { DAILY_LAUNCH, dailyNumber } from "@/lib/daily-share";

export type DuelSide = {
  name: string;
  kind: "player" | "team";
  /** The player's team in the period asked about, or the team itself. */
  team: string;
  position: string | null;
  value: number;
  /** A box-score player's photo URL, as nflverse lists it (the lesson cast's
   *  come from PLAYER_HEADSHOTS in the browser). */
  headshot?: string | null;
};

export type DuelCategory =
  | "Fantasy"
  | "Passing"
  | "Rushing"
  | "Receiving"
  | "Touchdowns"
  | "Big games"
  | "Team scoring"
  | "Team records"
  | "Clutch";

export type DuelRound = {
  n: number;
  prompt: string;
  category: DuelCategory;
  /** Where the SQL runs: the lesson database, or this season's box scores. */
  source: "league" | "player_weeks";
  /** For a box-score round: the JSON "Run it yourself" seeds player_weeks from. */
  dataUrl?: string;
  /** Short label for the period: "2025 season", "2026, weeks 1–3". */
  scope: string;
  /** What the number is, under it: "PPR pts", "pts allowed". */
  unit: string;
  decimals: number;
  higherWins: boolean;
  a: DuelSide;
  b: DuelSide;
  sql: string;
};

export type Duel = { day: string; number: number; rounds: DuelRound[] };

/** Duel #1 — the same numbering as every daily (lib/daily-share.ts). */
export const DUEL_LAUNCH = DAILY_LAUNCH;
/** The first day of the mixed duel. Earlier days keep the old one. */
export const DUEL_V2 = "2026-10-25";
/** The box scores' season, and where the browser fetches them for "Run it yourself". */
export const BOX_SEASON = ROLL_CALL_SEASON;
export const BOX_DATA_URL = `/roll-call/${ROLL_CALL_SEASON}.json`;
const ROUNDS = 5;

// ── Seeded randomness ───────────────────────────────────────────────────

function seedOf(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── The data, shaped once ───────────────────────────────────────────────

const ROWS: WeekResultRow[] = getWeekResults();
const FIRST = Math.min(...ROWS.map((r) => r.season));
const CURRENT = LATEST.season;
const COMPLETE: number[] = [];
for (let s = FIRST; s < CURRENT; s++) COMPLETE.push(s);

type Scope = { key: string; season: number | null; label: string; phrase: string; minGames: number };

const scopeFor = (season: number | null): Scope =>
  season === null
    ? { key: "all", season: null, label: `${FIRST}–${CURRENT}`, phrase: `since ${FIRST}`, minGames: 10 }
    : season === CURRENT
      ? {
          key: String(season),
          season,
          label: `${season}, weeks 1–${LATEST.week}`,
          phrase: `in ${season} so far`,
          minGames: Math.min(2, LATEST.week),
        }
      : { key: String(season), season, label: `${season} season`, phrase: `in the ${season} season`, minGames: 6 };

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

type Cand = { name: string; team: string; position: string | null; value: number; headshot?: string | null };
type Built = {
  kind: "player" | "team";
  source?: DuelRound["source"];
  cands: Cand[];
  prompt: string;
  category: DuelCategory;
  scope: string;
  unit: string;
  decimals: number;
  higherWins: boolean;
  samePosition: boolean;
  sql: (a: string, b: string) => string;
};

/** Each player's games in a scope, in tenths so sums are exact. */
function playerLines(scope: Scope) {
  const by = new Map<string, { team: string; position: string; games: number; tenths: number; max: number; big: number; last: number }>();
  for (const r of ROWS) {
    if (scope.season !== null && r.season !== scope.season) continue;
    const t = Math.round(r.fantasy_pts * 10);
    const order = r.season * 100 + r.week;
    const cur = by.get(r.player);
    if (!cur) {
      by.set(r.player, { team: r.team, position: r.position, games: 1, tenths: t, max: r.fantasy_pts, big: r.fantasy_pts >= 20 ? 1 : 0, last: order });
    } else {
      cur.games++;
      cur.tenths += t;
      cur.max = Math.max(cur.max, r.fantasy_pts);
      if (r.fantasy_pts >= 20) cur.big++;
      if (order > cur.last) {
        cur.last = order;
        cur.team = r.team;
      }
    }
  }
  return Array.from(by.entries()).filter(([, v]) => v.games >= scope.minGames);
}

const where = (scope: Scope, a: string, b: string) =>
  `${scope.season === null ? "" : `season = ${scope.season}\n  AND `}player IN (${q(a)}, ${q(b)})`;

const TEMPLATES: Record<string, (r: () => number, day: string) => Built | null> = {
  total(r) {
    const options = [...COMPLETE, CURRENT, null];
    const scope = scopeFor(options[Math.floor(r() * options.length)]);
    return {
      kind: "player",
      cands: playerLines(scope).map(([name, v]) => ({ name, team: v.team, position: v.position, value: v.tenths / 10 })),
      prompt: `Who scored more PPR points ${scope.phrase}?`,
      category: "Fantasy",
      scope: scope.label,
      unit: "PPR pts",
      decimals: 1,
      higherWins: true,
      samePosition: true,
      sql: (a, b) =>
        `SELECT player, ROUND(SUM(fantasy_pts), 1) AS total_pts\nFROM week_results\nWHERE ${where(scope, a, b)}\nGROUP BY player\nORDER BY total_pts DESC;`,
    };
  },
  avg(r) {
    const options = [...COMPLETE, CURRENT, null];
    const scope = scopeFor(options[Math.floor(r() * options.length)]);
    const cands: Cand[] = [];
    for (const [name, v] of playerLines(scope)) {
      // Rounded the way SQLite's ROUND will see it. A value sitting exactly
      // on a half is left out rather than risk the two disagreeing.
      const exact = v.tenths / v.games;
      if (Math.abs(exact - Math.floor(exact) - 0.5) < 1e-6) continue;
      cands.push({ name, team: v.team, position: v.position, value: Math.round(exact) / 10 });
    }
    return {
      kind: "player",
      cands,
      prompt: `Who averaged more PPR points per game ${scope.phrase}?`,
      category: "Fantasy",
      scope: scope.label,
      unit: "PPR pts per game",
      decimals: 1,
      higherWins: true,
      samePosition: true,
      sql: (a, b) =>
        `SELECT player, ROUND(AVG(fantasy_pts), 1) AS pts_per_game, COUNT(*) AS games\nFROM week_results\nWHERE ${where(scope, a, b)}\nGROUP BY player\nORDER BY pts_per_game DESC;`,
    };
  },
  best(r) {
    const options = [...COMPLETE, CURRENT, null];
    const scope = scopeFor(options[Math.floor(r() * options.length)]);
    return {
      kind: "player",
      cands: playerLines(scope).map(([name, v]) => ({ name, team: v.team, position: v.position, value: v.max })),
      prompt: `Whose best single game was bigger ${scope.phrase}?`,
      category: "Fantasy",
      scope: scope.label,
      unit: "PPR pts, best game",
      decimals: 1,
      higherWins: true,
      samePosition: true,
      sql: (a, b) =>
        `SELECT player, MAX(fantasy_pts) AS best_game\nFROM week_results\nWHERE ${where(scope, a, b)}\nGROUP BY player\nORDER BY best_game DESC;`,
    };
  },
  big(r) {
    const options = [...COMPLETE, null];
    const scope = scopeFor(options[Math.floor(r() * options.length)]);
    return {
      kind: "player",
      cands: playerLines(scope).map(([name, v]) => ({ name, team: v.team, position: v.position, value: v.big })),
      prompt: `Who had more 20-point games ${scope.phrase}?`,
      category: "Fantasy",
      scope: scope.label,
      unit: "games of 20+ pts",
      decimals: 0,
      higherWins: true,
      samePosition: true,
      sql: (a, b) =>
        `SELECT player,\n       SUM(CASE WHEN fantasy_pts >= 20 THEN 1 ELSE 0 END) AS games_20_plus\nFROM week_results\nWHERE ${where(scope, a, b)}\nGROUP BY player\nORDER BY games_20_plus DESC;`,
    };
  },
  week(r) {
    const weeks = Array.from(new Set(ROWS.map((x) => `${x.season}-${x.week}`)));
    const [season, week] = weeks[Math.floor(r() * weeks.length)].split("-").map(Number);
    const rows = ROWS.filter((x) => x.season === season && x.week === week);
    return {
      kind: "player",
      cands: rows.map((x) => ({ name: x.player, team: x.team, position: x.position, value: x.fantasy_pts })),
      prompt: `Who scored more in week ${week} of ${season}?`,
      category: "Fantasy",
      scope: `Week ${week}, ${season}`,
      unit: "PPR pts that week",
      decimals: 1,
      higherWins: true,
      samePosition: true,
      sql: (a, b) =>
        `SELECT player, fantasy_pts\nFROM week_results\nWHERE season = ${season} AND week = ${week}\n  AND player IN (${q(a)}, ${q(b)})\nORDER BY fantasy_pts DESC;`,
    };
  },
  teamScored(r) {
    return teamTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], true);
  },
  teamAllowed(r) {
    return teamTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], false);
  },
  teamWins(r) {
    return teamMetricTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], "wins");
  },
  teamPointDiff(r) {
    return teamMetricTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], "pointDiff");
  },
  teamHighScore(r) {
    return teamMetricTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], "highScore");
  },
  teamThirty(r) {
    return teamMetricTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], "thirty");
  },
  teamCloseWins(r) {
    return teamMetricTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], "closeWins");
  },
  teamRoadWins(r) {
    return teamMetricTemplate(COMPLETE[Math.floor(r() * COMPLETE.length)], "roadWins");
  },
};

type TeamLine = {
  scored: number;
  allowed: number;
  wins: number;
  highScore: number;
  thirty: number;
  closeWins: number;
  roadWins: number;
};

function teamLines(season: number): Map<string, TeamLine> {
  const totals = new Map<string, TeamLine>();
  const add = (team: string, scored: number, allowed: number, road: boolean) => {
    const line = totals.get(team) ?? {
      scored: 0,
      allowed: 0,
      wins: 0,
      highScore: 0,
      thirty: 0,
      closeWins: 0,
      roadWins: 0,
    };
    line.scored += scored;
    line.allowed += allowed;
    line.highScore = Math.max(line.highScore, scored);
    if (scored >= 30) line.thirty++;
    if (scored > allowed) {
      line.wins++;
      if (scored - allowed <= 8) line.closeWins++;
      if (road) line.roadWins++;
    }
    totals.set(team, line);
  };
  for (const g of PACKED_GAMES) {
    const [, s, week, , , home, away, homeScore, awayScore] = g;
    if (s !== season || week > 18) continue;
    add(home, homeScore, awayScore, false);
    add(away, awayScore, homeScore, true);
  }
  return totals;
}

function teamTemplate(season: number, scored: boolean): Built {
  const tot = teamLines(season);
  const col = scored ? "points_scored" : "points_allowed";
  return {
    kind: "team",
    cands: Array.from(tot.entries()).map(([team, v]) => ({ name: team, team, position: null, value: scored ? v.scored : v.allowed })),
    prompt: scored
      ? `Which team scored more points in the ${season} regular season?`
      : `Which defense allowed fewer points in the ${season} regular season?`,
    category: "Team scoring",
    scope: `${season} season`,
    unit: scored ? "pts scored" : "pts allowed",
    decimals: 0,
    higherWins: scored,
    samePosition: false,
    sql: (a, b) =>
      `WITH team_games AS (\n  SELECT home_team AS team, home_score AS scored, away_score AS allowed\n  FROM games WHERE season = ${season} AND week <= 18\n  UNION ALL\n  SELECT away_team, away_score, home_score\n  FROM games WHERE season = ${season} AND week <= 18\n)\nSELECT team, SUM(${scored ? "scored" : "allowed"}) AS ${col}\nFROM team_games\nWHERE team IN (${q(a)}, ${q(b)})\nGROUP BY team\nORDER BY ${col} ${scored ? "DESC" : "ASC"};`,
  };
}

type TeamMetric = "wins" | "pointDiff" | "highScore" | "thirty" | "closeWins" | "roadWins";

const TEAM_METRICS: Record<
  TeamMetric,
  {
    prompt: (season: number) => string;
    category: DuelCategory;
    unit: string;
    column: string;
    value: (line: TeamLine) => number;
    sqlValue: string;
  }
> = {
  wins: {
    prompt: (season) => `Which team won more games in the ${season} regular season?`,
    category: "Team records",
    unit: "wins",
    column: "wins",
    value: (line) => line.wins,
    sqlValue: "SUM(CASE WHEN scored > allowed THEN 1 ELSE 0 END)",
  },
  pointDiff: {
    prompt: (season) => `Which team had the better point differential in ${season}?`,
    category: "Team scoring",
    unit: "point differential",
    column: "point_differential",
    value: (line) => line.scored - line.allowed,
    sqlValue: "SUM(scored - allowed)",
  },
  highScore: {
    prompt: (season) => `Which team posted the higher single-game score in ${season}?`,
    category: "Team scoring",
    unit: "pts, best game",
    column: "high_score",
    value: (line) => line.highScore,
    sqlValue: "MAX(scored)",
  },
  thirty: {
    prompt: (season) => `Which team scored 30+ points more often in ${season}?`,
    category: "Team scoring",
    unit: "games with 30+ pts",
    column: "games_30_plus",
    value: (line) => line.thirty,
    sqlValue: "SUM(CASE WHEN scored >= 30 THEN 1 ELSE 0 END)",
  },
  closeWins: {
    prompt: (season) => `Which team won more one-score games in ${season}?`,
    category: "Clutch",
    unit: "wins by 8 or fewer",
    column: "one_score_wins",
    value: (line) => line.closeWins,
    sqlValue: "SUM(CASE WHEN scored > allowed AND scored - allowed <= 8 THEN 1 ELSE 0 END)",
  },
  roadWins: {
    prompt: (season) => `Which team won more road games in ${season}?`,
    category: "Team records",
    unit: "road wins",
    column: "road_wins",
    value: (line) => line.roadWins,
    sqlValue: "SUM(CASE WHEN venue = 'road' AND scored > allowed THEN 1 ELSE 0 END)",
  },
};

function teamMetricTemplate(season: number, metric: TeamMetric): Built {
  const spec = TEAM_METRICS[metric];
  const totals = teamLines(season);
  return {
    kind: "team",
    cands: Array.from(totals.entries()).map(([team, line]) => ({
      name: team,
      team,
      position: null,
      value: spec.value(line),
    })),
    prompt: spec.prompt(season),
    category: spec.category,
    scope: `${season} season`,
    unit: spec.unit,
    decimals: 0,
    higherWins: true,
    samePosition: false,
    sql: (a, b) =>
      `WITH team_games AS (\n  SELECT home_team AS team, home_score AS scored, away_score AS allowed, 'home' AS venue\n  FROM games WHERE season = ${season} AND week <= 18\n  UNION ALL\n  SELECT away_team, away_score, home_score, 'road'\n  FROM games WHERE season = ${season} AND week <= 18\n)\nSELECT team, ${spec.sqlValue} AS ${spec.column}\nFROM team_games\nWHERE team IN (${q(a)}, ${q(b)})\nGROUP BY team\nORDER BY ${spec.column} DESC;`,
  };
}

// ── Box scores: this season's real weekly stats ─────────────────────────

/** The newest week whose numbers have settled on `day` (two days after its
 *  last game, as Roll Call), or null before Week 1. */
function boxWeek(day: string): number | null {
  let newest: number | null = null;
  for (const [week, end] of Object.entries(ROLL_CALL_WEEK_ENDS)) {
    const opens = new Date(Date.parse(`${end}T00:00:00Z`) + 2 * 86_400_000).toISOString().slice(0, 10);
    if (opens <= day && (newest === null || Number(week) > newest)) newest = Number(week);
  }
  return newest;
}

/** A name two players share can't be told apart in `WHERE player IN (…)`. */
const NAME_USES = new Map<string, number>();
for (const [name] of Object.values(ROLL_CALL_PLAYERS)) NAME_USES.set(name, (NAME_USES.get(name) ?? 0) + 1);

type BoxCol = "passing_yards" | "passing_tds" | "rushing_yards" | "rushing_tds" | "receptions" | "receiving_yards" | "receiving_tds";
/** Where each stat sits in a RollCallRow. */
const COL: Record<BoxCol, number> = {
  passing_yards: 4,
  passing_tds: 5,
  rushing_yards: 6,
  rushing_tds: 7,
  receptions: 8,
  receiving_yards: 9,
  receiving_tds: 10,
};
const POS_WORD: Record<string, string> = { QB: "quarterback", RB: "running back", WR: "receiver", TE: "tight end" };
/** How deep into a position a matchup reaches: the names people know. */
const DEPTH: Record<string, number> = { QB: 20, RB: 24, WR: 30, TE: 14 };

type BoxSpec = {
  positions: string[];
  cols: BoxCol[];
  /** The result column's name in the SQL. */
  alias: string;
  /** Season to date, its single best game, or the newest week alone. */
  mode: "sum" | "max" | "week";
  category: DuelCategory;
  prompt: (who: string, when: string) => string;
  unit: string;
};

const BOX: Record<string, BoxSpec> = {
  passYds: { positions: ["QB"], cols: ["passing_yards"], alias: "passing_yards", mode: "sum", category: "Passing", prompt: (_, w) => `Which quarterback has thrown for more yards ${w}?`, unit: "passing yds" },
  passTds: { positions: ["QB"], cols: ["passing_tds"], alias: "td_passes", mode: "sum", category: "Passing", prompt: (_, w) => `Who has thrown more touchdown passes ${w}?`, unit: "TD passes" },
  qbRush: { positions: ["QB"], cols: ["rushing_yards"], alias: "rushing_yards", mode: "sum", category: "Rushing", prompt: (_, w) => `Which quarterback has run for more yards ${w}?`, unit: "rushing yds" },
  rushYds: { positions: ["RB"], cols: ["rushing_yards"], alias: "rushing_yards", mode: "sum", category: "Rushing", prompt: (_, w) => `Which running back has run for more yards ${w}?`, unit: "rushing yds" },
  scrimmage: { positions: ["RB"], cols: ["rushing_yards", "receiving_yards"], alias: "scrimmage_yards", mode: "sum", category: "Rushing", prompt: (_, w) => `Who has more yards from scrimmage, running and catching, ${w}?`, unit: "scrimmage yds" },
  rbCatches: { positions: ["RB"], cols: ["receptions"], alias: "catches", mode: "sum", category: "Receiving", prompt: (_, w) => `Which running back has caught more passes ${w}?`, unit: "catches" },
  recYds: { positions: ["WR", "TE"], cols: ["receiving_yards"], alias: "receiving_yards", mode: "sum", category: "Receiving", prompt: (p, w) => `Which ${p} has more receiving yards ${w}?`, unit: "receiving yds" },
  catches: { positions: ["WR", "TE"], cols: ["receptions"], alias: "catches", mode: "sum", category: "Receiving", prompt: (p, w) => `Which ${p} has caught more passes ${w}?`, unit: "catches" },
  tds: { positions: ["RB", "WR", "TE"], cols: ["rushing_tds", "receiving_tds"], alias: "touchdowns", mode: "sum", category: "Touchdowns", prompt: (p, w) => `Which ${p} has scored more touchdowns ${w}?`, unit: "touchdowns" },
  bigPass: { positions: ["QB"], cols: ["passing_yards"], alias: "best_game", mode: "max", category: "Big games", prompt: (_, w) => `Whose best passing day was bigger ${w}?`, unit: "passing yds, best game" },
  bigRush: { positions: ["RB"], cols: ["rushing_yards"], alias: "best_game", mode: "max", category: "Big games", prompt: (_, w) => `Whose best rushing day was bigger ${w}?`, unit: "rushing yds, best game" },
  bigRec: { positions: ["WR", "TE"], cols: ["receiving_yards"], alias: "best_game", mode: "max", category: "Big games", prompt: (p, w) => `Which ${p} had the bigger receiving day ${w}?`, unit: "receiving yds, best game" },
  weekPass: { positions: ["QB"], cols: ["passing_yards"], alias: "passing_yards", mode: "week", category: "Passing", prompt: (_, w) => `Who threw for more yards ${w}?`, unit: "passing yds that week" },
  weekRush: { positions: ["RB"], cols: ["rushing_yards"], alias: "rushing_yards", mode: "week", category: "Rushing", prompt: (_, w) => `Who ran for more yards ${w}?`, unit: "rushing yds that week" },
  weekRec: { positions: ["WR", "TE"], cols: ["receiving_yards"], alias: "receiving_yards", mode: "week", category: "Receiving", prompt: (p, w) => `Which ${p} had more receiving yards ${w}?`, unit: "receiving yds that week" },
};

function boxTemplate(id: string, r: () => number, day: string): Built | null {
  const spec = BOX[id];
  const week = boxWeek(day);
  if (!spec || week === null) return null;
  const pos = spec.positions[Math.floor(r() * spec.positions.length)];
  const S = BOX_SEASON;
  // Every week up to `week` for each player: the season total picks who's in
  // the pool (the names people know), and the round's own number comes from
  // the mode. Picking the pool by one big game surfaced backups nobody knew.
  const by = new Map<string, { total: number; best: number; latest: number | null; games: number; team: string; last: number }>();
  for (const row of ROLL_CALL_ROWS) {
    const w = row[3];
    if (w > week) continue;
    const [name, position] = ROLL_CALL_PLAYERS[row[0]] ?? [];
    if (!name || position !== pos || NAME_USES.get(name) !== 1) continue;
    const v = spec.cols.reduce((sum, c) => sum + (row[COL[c]] as number), 0);
    const cur = by.get(row[0]) ?? { total: 0, best: 0, latest: null, games: 0, team: row[1], last: 0 };
    cur.total += v;
    cur.best = Math.max(cur.best, v);
    if (w === week) cur.latest = v;
    cur.games++;
    if (w >= cur.last) {
      cur.last = w;
      cur.team = row[1];
    }
    by.set(row[0], cur);
  }
  const valueOf = (v: { total: number; best: number; latest: number | null }) =>
    spec.mode === "sum" ? v.total : spec.mode === "max" ? v.best : v.latest;
  const ranked = Array.from(by.entries())
    .filter(([, v]) => v.games >= Math.min(2, week))
    .sort((a, b) => b[1].total - a[1].total || (a[0] < b[0] ? -1 : 1))
    .slice(0, DEPTH[pos] ?? 20)
    .flatMap(([pid, v]) => {
      const value = valueOf(v);
      return value !== null && value > 0 ? [{ pid, value, team: v.team }] : [];
    });
  if (ranked.length < 2) return null;

  const when = spec.mode === "week" ? `in Week ${week} of ${S}` : week >= 18 ? `in the ${S} season` : `through Week ${week} of ${S}`;
  const expr = spec.cols.join(" + ");
  const agg = spec.mode === "max" ? `MAX(${expr})` : `SUM(${expr})`;
  const weeks = spec.mode === "week" ? `week = ${week}` : `week <= ${week}`;
  return {
    kind: "player",
    source: "player_weeks",
    cands: ranked.map(({ pid, value, team }) => ({
      name: ROLL_CALL_PLAYERS[pid][0],
      team,
      position: pos,
      value,
      headshot: ROLL_CALL_PLAYERS[pid][2] || null,
    })),
    prompt: spec.prompt(POS_WORD[pos] ?? pos, when),
    category: spec.category,
    scope: spec.mode === "week" ? `Week ${week}, ${S}` : week >= 18 ? `${S} season` : `${S}, weeks 1–${week}`,
    unit: spec.unit,
    decimals: 0,
    higherWins: true,
    samePosition: true,
    sql: (a, b) =>
      `SELECT player, ${agg} AS ${spec.alias}\nFROM player_weeks\nWHERE season = ${S} AND ${weeks}\n  AND player IN (${q(a)}, ${q(b)})\nGROUP BY player\nORDER BY ${spec.alias} DESC;`,
  };
}

for (const id of Object.keys(BOX)) TEMPLATES[`box:${id}`] = (r, day) => boxTemplate(id, r, day);

type Band = "easy" | "medium" | "hard";

/** Rounds get closer as the day goes on. */
const SLOTS: { templates: string[]; band: Band }[] = [
  { templates: ["total", "best"], band: "easy" },
  { templates: ["teamWins", "teamHighScore", "teamThirty"], band: "easy" },
  { templates: ["teamScored", "teamAllowed", "teamPointDiff"], band: "medium" },
  { templates: ["avg", "big", "total"], band: "medium" },
  { templates: ["teamCloseWins", "teamRoadWins", "teamPointDiff"], band: "hard" },
];

/**
 * The mixed duel: two box-score rounds, a team round, a fantasy round and a
 * hard one that's either. `fallback` fills a slot when the box scores have
 * nothing yet (before a new season's Week 1 has settled).
 */
const SLOTS_V2: { templates: string[]; band: Band; fallback?: string[] }[] = [
  { templates: ["box:passYds", "box:rushYds", "box:recYds", "box:catches", "box:tds"], band: "easy", fallback: ["total", "best"] },
  { templates: ["teamWins", "teamHighScore", "teamThirty", "teamScored", "teamAllowed"], band: "easy" },
  {
    templates: ["box:weekPass", "box:weekRush", "box:weekRec", "box:scrimmage", "box:rbCatches", "box:passTds", "box:qbRush"],
    band: "medium",
    fallback: ["avg", "week"],
  },
  { templates: ["total", "avg", "best", "big", "week"], band: "medium" },
  { templates: ["box:bigPass", "box:bigRush", "box:bigRec", "teamCloseWins", "teamRoadWins", "teamPointDiff"], band: "hard", fallback: ["teamPointDiff"] },
];

const BANDS: Record<Band, [number, number]> = {
  easy: [0, 0.45],
  medium: [0.3, 0.75],
  hard: [0.6, 1],
};

function pickPair(built: Built, band: Band, r: () => number, used: Set<string>): [Cand, Cand] | null {
  const shown = (v: number) => v.toFixed(built.decimals);
  const pairs: { a: Cand; b: Cand; gap: number }[] = [];
  const all = built.cands;
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      if (built.samePosition && a.position !== b.position) continue;
      if (shown(a.value) === shown(b.value)) continue;
      if (used.has(a.name) || used.has(b.name)) continue;
      pairs.push({ a, b, gap: Math.abs(a.value - b.value) / Math.max(Math.abs(a.value), Math.abs(b.value), 1) });
    }
  }
  if (!pairs.length) return null;
  // Widest gaps first, so the easy band is the front of the list.
  pairs.sort((x, y) => y.gap - x.gap || (x.a.name + x.b.name < y.a.name + y.b.name ? -1 : 1));
  const [lo, hi] = BANDS[band];
  const from = Math.floor(lo * (pairs.length - 1));
  const to = Math.max(from, Math.floor(hi * (pairs.length - 1)));
  const p = pairs[from + Math.floor(r() * (to - from + 1))];
  return r() < 0.5 ? [p.a, p.b] : [p.b, p.a];
}

export const duelNumber = dailyNumber;

function toRound(n: number, built: Built, a: Cand, b: Cand): DuelRound {
  const side = (c: Cand): DuelSide => ({
    name: c.name,
    kind: built.kind,
    team: c.team,
    position: c.position,
    value: c.value,
    ...(c.headshot !== undefined ? { headshot: c.headshot } : {}),
  });
  return {
    n,
    prompt: built.prompt,
    category: built.category,
    source: built.source ?? "league",
    ...(built.source === "player_weeks" ? { dataUrl: BOX_DATA_URL } : {}),
    scope: built.scope,
    unit: built.unit,
    decimals: built.decimals,
    higherWins: built.higherWins,
    a: side(a),
    b: side(b),
    sql: built.sql(a.name, b.name),
  };
}

/** The day's five rounds. Pure: the same day always gives the same duel. */
export function dailyDuel(day: string): Duel {
  return day < DUEL_V2 ? duelV1(day) : duelV2(day);
}

/** The original mix, kept exactly for the days that were played with it. */
function duelV1(day: string): Duel {
  const r = seeded(seedOf(`stat-duel:${day}`));
  const used = new Set<string>();
  const rounds: DuelRound[] = [];
  SLOTS.forEach((slot, i) => {
    // A slot tries its templates in a seeded order, a few times over, so an
    // unlucky draw (a week with no same-position pair) never empties it.
    for (let attempt = 0; attempt < 12 && rounds.length === i; attempt++) {
      const name = slot.templates[Math.floor(r() * slot.templates.length)];
      const built = TEMPLATES[name](r, day);
      if (!built) continue;
      const pair = pickPair(built, slot.band, r, used);
      if (!pair) continue;
      const [a, b] = pair;
      used.add(a.name).add(b.name);
      rounds.push(toRound(i + 1, built, a, b));
    }
  });
  return { day, number: duelNumber(day), rounds: rounds.slice(0, ROUNDS) };
}

/** The mixed duel: never the same template or category twice in a day. */
function duelV2(day: string): Duel {
  const r = seeded(seedOf(`stat-duel-v2:${day}`));
  const used = new Set<string>();
  const usedTemplates = new Set<string>();
  const usedCategories = new Set<DuelCategory>();
  const rounds: DuelRound[] = [];
  SLOTS_V2.forEach((slot, i) => {
    const tries = (names: string[], strict: boolean) => {
      for (let attempt = 0; attempt < 16 && rounds.length === i; attempt++) {
        const name = names[Math.floor(r() * names.length)];
        if (usedTemplates.has(name)) continue;
        const built = TEMPLATES[name](r, day);
        if (!built) continue;
        if (strict && usedCategories.has(built.category)) continue;
        const pair = pickPair(built, slot.band, r, used);
        if (!pair) continue;
        const [a, b] = pair;
        used.add(a.name).add(b.name);
        usedTemplates.add(name);
        usedCategories.add(built.category);
        rounds.push(toRound(i + 1, built, a, b));
      }
    };
    tries(slot.templates, true);
    if (rounds.length === i) tries(slot.templates, false);
    if (rounds.length === i && slot.fallback) tries(slot.fallback, false);
  });
  return { day, number: duelNumber(day), rounds: rounds.slice(0, ROUNDS) };
}

/** Which side won: 0 for a, 1 for b. */
export function duelWinner(round: DuelRound): 0 | 1 {
  const aWins = round.higherWins ? round.a.value > round.b.value : round.a.value < round.b.value;
  return aWins ? 0 : 1;
}
