/**
 * The Draft Room's engine: a real fantasy draft and the real season it plays
 * out over. Pure functions over `public/draft/<season>.json` (built by
 * scripts/build-draft-dataset.mjs), no DOM, so the verifier can run it.
 *
 * The league: 8 teams, a 12-round snake draft, PPR best ball. Best ball
 * because the draft is the whole game — every week the best lineup a roster
 * could have started (QB, 2 RB, 3 WR, TE, FLEX) is the one that counts, so
 * there's nothing to manage after the last pick. A 14-week regular season
 * (everyone plays everyone twice), then the top four play semifinals in
 * week 15 and the final in week 16.
 *
 * Seven bots draft off Sleeper's real ADP for that season, each with a lean
 * and a little seeded noise. Everything is a function of (season, seed,
 * slot, your picks): the same challenge link gives a friend the same bots,
 * and nothing anywhere calls Math.random().
 */

export type Pos = "QB" | "RB" | "WR" | "TE";

export type DraftPlayer = {
  id: string;
  name: string;
  pos: Pos;
  team: string;
  adp: number;
  bye: number | null;
  age: number | null;
  nflDraftYear: number | null;
  nflDraftRound: number | null;
  nflDraftPick: number | null;
  rookie: boolean;
  headshot: string | null;
};

export type DraftData = {
  season: number;
  scoutSeasons: number[];
  built: string;
  board: DraftPlayer[];
  scoutCols: string[];
  scout: (string | number)[][];
  /** Real PPR points in weeks 1–17, null for a week with no game. */
  points: Record<string, (number | null)[]>;
};

export const TEAMS = 8;
export const ROUNDS = 12;
export const TOTAL_PICKS = TEAMS * ROUNDS;
export const REG_WEEKS = 14;
export const SEMIS_WEEK = 15;
export const FINAL_WEEK = 16;
/** The fantasy season a player's total is measured over. */
export const LAST_WEEK = 17;

export const SLOTS = ["QB", "RB", "RB", "WR", "WR", "WR", "TE", "FLEX"] as const;
export type Slot = (typeof SLOTS)[number];
const NEED: Record<Pos, number> = { QB: 1, RB: 2, WR: 3, TE: 1 };
const CAP: Record<Pos, number> = { QB: 2, RB: 6, WR: 7, TE: 2 };
/** A second QB or TE waits until this round (0-based) — nobody takes two early. */
const BACKUP_ROUND = 8;

export type Manager = {
  name: string;
  /** One line on how they draft, shown on the board. */
  lean: string;
  /** Multiplier on ADP by position: under 1 means they reach. */
  bias: Partial<Record<Pos, number>>;
  rookieBias?: number;
  human?: boolean;
};

export const BOTS: Manager[] = [
  { name: "Blitz Brothers", lean: "Loves a running back", bias: { RB: 0.8 } },
  { name: "Fourth & Long", lean: "Wide receivers early and often", bias: { WR: 0.84 } },
  { name: "Touchdown Factory", lean: "Takes a quarterback early", bias: { QB: 0.55 } },
  { name: "Gridiron Gurus", lean: "Drafts straight off ADP", bias: {} },
  { name: "Goal Line Gang", lean: "Pays up at tight end", bias: { TE: 0.65 } },
  { name: "Hail Mary Club", lean: "Chases rookies", bias: {}, rookieBias: 0.75 },
  { name: "Red Zone Regulars", lean: "Drafts straight off ADP", bias: {} },
];

export const YOU: Manager = { name: "Your team", lean: "Drafts with SQL", bias: {}, human: true };

// ── Seeded randomness ─────────────────────────────────────────────
function fnv(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
/** A number in [0, 1) that is always the same for the same key. */
export function unit(key: string): number {
  let a = fnv(key);
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffled<T>(items: T[], key: string): T[] {
  return items
    .map((item, i) => ({ item, k: unit(`${key}:${i}`) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.item);
}

// ── The league ────────────────────────────────────────────────────
export type League = {
  season: number;
  seed: string;
  /** 0-based draft slot of the human. */
  slot: number;
  /** Index = team = draft slot. */
  managers: Manager[];
};

export function makeLeague(season: number, seed: string, slot: number): League {
  const bots = shuffled(BOTS, `${season}:${seed}:bots`);
  const managers: Manager[] = [];
  let b = 0;
  for (let t = 0; t < TEAMS; t++) managers.push(t === slot ? YOU : bots[b++]);
  return { season, seed, slot, managers };
}

/** Which team (draft slot) makes overall pick `overall` (0-based), snake order. */
export function teamForPick(overall: number): number {
  const round = Math.floor(overall / TEAMS);
  const i = overall % TEAMS;
  return round % 2 === 0 ? i : TEAMS - 1 - i;
}

/** "3.05": round, then pick within the round. */
export function pickLabel(overall: number): string {
  return `${Math.floor(overall / TEAMS) + 1}.${String((overall % TEAMS) + 1).padStart(2, "0")}`;
}

/** The overall picks a team makes, in order. */
export function picksOf(team: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < TOTAL_PICKS; k++) if (teamForPick(k) === team) out.push(k);
  return out;
}

export function byId(data: DraftData): Map<string, DraftPlayer> {
  return new Map(data.board.map((p) => [p.id, p]));
}

/** Rosters by team from the pick list. */
export function rosters(picks: string[]): string[][] {
  const out: string[][] = Array.from({ length: TEAMS }, () => []);
  picks.forEach((id, k) => out[teamForPick(k)].push(id));
  return out;
}

function counts(ids: string[], players: Map<string, DraftPlayer>): Record<Pos, number> {
  const c: Record<Pos, number> = { QB: 0, RB: 0, WR: 0, TE: 0 };
  ids.forEach((id) => {
    const p = players.get(id);
    if (p) c[p.pos]++;
  });
  return c;
}

/**
 * Who `team` takes next. Bots use their lean and seeded noise; "auto" is a
 * plain ADP pick with the same roster rules — it's what the autodraft does,
 * and the baseline your scouting is measured against.
 */
export function choosePick(
  league: League,
  data: DraftData,
  picks: string[],
  mode: "bot" | "auto",
  players: Map<string, DraftPlayer> = byId(data),
): string {
  const overall = picks.length;
  const team = teamForPick(overall);
  const round = Math.floor(overall / TEAMS);
  const taken = new Set(picks);
  const mine = rosters(picks)[team];
  const have = counts(mine, players);
  const left = ROUNDS - mine.length; // including this pick

  const short = (Object.keys(NEED) as Pos[]).filter((p) => have[p] < NEED[p]);
  const missing = short.reduce((n, p) => n + (NEED[p] - have[p]), 0);
  // When the picks left only just cover the empty starting spots, fill them.
  const mustFill = missing >= left;

  const m = league.managers[team];
  let best: { id: string; score: number; adp: number } | null = null;
  for (const p of data.board) {
    if (taken.has(p.id)) continue;
    if (have[p.pos] >= CAP[p.pos]) continue;
    if ((p.pos === "QB" || p.pos === "TE") && have[p.pos] >= 1 && round < BACKUP_ROUND) continue;
    if (mustFill && !short.includes(p.pos)) continue;
    let score = p.adp;
    if (mode === "bot") {
      score *= m.bias[p.pos] ?? 1;
      if (p.rookie && m.rookieBias) score *= m.rookieBias;
      score *= 1 + 0.2 * (unit(`${league.season}:${league.seed}:${overall}:${p.id}`) - 0.5);
    }
    if (!best || score < best.score || (score === best.score && p.adp < best.adp)) {
      best = { id: p.id, score, adp: p.adp };
    }
  }
  if (!best) throw new Error(`no legal pick for team ${team} at ${pickLabel(overall)}`);
  return best.id;
}

/** Let the bots pick until it's the human's turn or the draft is over. */
export function runBots(league: League, data: DraftData, picks: string[]): string[] {
  const players = byId(data);
  const out = picks.slice();
  while (out.length < TOTAL_PICKS && teamForPick(out.length) !== league.slot) {
    out.push(choosePick(league, data, out, "bot", players));
  }
  return out;
}

/** Finish the whole draft, the human's picks made by ADP. */
export function autodraftRest(league: League, data: DraftData, picks: string[]): string[] {
  const players = byId(data);
  const out = picks.slice();
  while (out.length < TOTAL_PICKS) {
    const human = teamForPick(out.length) === league.slot;
    out.push(choosePick(league, data, out, human ? "auto" : "bot", players));
  }
  return out;
}

/** Is this a legal pick for the human right now? Returns why not, or null. */
export function pickProblem(
  league: League,
  data: DraftData,
  picks: string[],
  id: string,
): string | null {
  const players = byId(data);
  const p = players.get(id);
  if (!p) return "Not on this draft board.";
  if (picks.includes(id)) return `${p.name} is already taken.`;
  if (teamForPick(picks.length) !== league.slot) return "It isn't your pick yet.";
  const mine = rosters(picks)[league.slot];
  const have = counts(mine, players);
  if (have[p.pos] >= CAP[p.pos]) return `You already have ${CAP[p.pos]} ${p.pos}s — that's the limit.`;
  const left = ROUNDS - mine.length;
  const short = (Object.keys(NEED) as Pos[]).filter((q) => have[q] < NEED[q]);
  const missing = short.reduce((n, q) => n + (NEED[q] - have[q]), 0);
  if (missing >= left && !short.includes(p.pos)) {
    return `You need ${short.join(" and ")} to fill your lineup, and you're running out of picks.`;
  }
  return null;
}

// ── The season ────────────────────────────────────────────────────
export function weekPoints(data: DraftData, id: string, week: number): number {
  return data.points[id]?.[week - 1] ?? 0;
}

export function seasonPoints(data: DraftData, id: string): number {
  const w = data.points[id] ?? [];
  return Math.round(w.reduce<number>((s, v) => s + (v ?? 0), 0) * 10) / 10;
}

export type LineupSpot = { slot: Slot; id: string | null; pts: number };

/** The best lineup a roster could have started this week. */
export function bestLineup(
  data: DraftData,
  roster: string[],
  week: number,
  players: Map<string, DraftPlayer> = byId(data),
): { total: number; spots: LineupSpot[] } {
  const pool: Record<Pos, { id: string; pts: number }[]> = { QB: [], RB: [], WR: [], TE: [] };
  roster.forEach((id) => {
    const p = players.get(id);
    if (p) pool[p.pos].push({ id, pts: weekPoints(data, id, week) });
  });
  (Object.keys(pool) as Pos[]).forEach((pos) => pool[pos].sort((a, b) => b.pts - a.pts));
  const spots: LineupSpot[] = [];
  const take = (pos: Pos, slot: Slot) => {
    const next = pool[pos].shift();
    spots.push({ slot, id: next?.id ?? null, pts: next?.pts ?? 0 });
  };
  take("QB", "QB");
  take("RB", "RB");
  take("RB", "RB");
  take("WR", "WR");
  take("WR", "WR");
  take("WR", "WR");
  take("TE", "TE");
  const flex = [...pool.RB, ...pool.WR, ...pool.TE].sort((a, b) => b.pts - a.pts)[0];
  spots.push({ slot: "FLEX", id: flex?.id ?? null, pts: flex?.pts ?? 0 });
  const total = Math.round(spots.reduce((s, x) => s + x.pts, 0) * 10) / 10;
  return { total, spots };
}

/** Everyone plays everyone once in weeks 1–7, then again in 8–14. */
export function schedule(league: League): [number, number][][] {
  let ring = shuffled(
    Array.from({ length: TEAMS }, (_, i) => i),
    `${league.season}:${league.seed}:schedule`,
  );
  const half: [number, number][][] = [];
  for (let r = 0; r < TEAMS - 1; r++) {
    const games: [number, number][] = [];
    for (let i = 0; i < TEAMS / 2; i++) games.push([ring[i], ring[TEAMS - 1 - i]]);
    half.push(games);
    ring = [ring[0], ring[TEAMS - 1], ...ring.slice(1, TEAMS - 1)];
  }
  return [...half, ...half];
}

export type Game = { week: number; a: number; b: number; pa: number; pb: number };
export type Standing = { team: number; w: number; l: number; t: number; pf: number; pa: number };
export type Finish = "C" | "F" | "S" | "X";

export type SeasonResult = {
  /** Regular-season games, week by week. */
  weeks: Game[][];
  standings: Standing[];
  /** Teams by playoff seed, best first. */
  seeds: number[];
  semis: Game[];
  final: Game;
  champion: number;
};

function play(data: DraftData, teams: string[][], week: number, a: number, b: number, players: Map<string, DraftPlayer>): Game {
  return {
    week,
    a,
    b,
    pa: bestLineup(data, teams[a], week, players).total,
    pb: bestLineup(data, teams[b], week, players).total,
  };
}

/** Standings from a set of games, ordered by wins then points for. */
export function standingsFrom(games: Game[]): Standing[] {
  const s: Standing[] = Array.from({ length: TEAMS }, (_, team) => ({ team, w: 0, l: 0, t: 0, pf: 0, pa: 0 }));
  games.forEach((g) => {
    const A = s[g.a];
    const B = s[g.b];
    A.pf += g.pa;
    A.pa += g.pb;
    B.pf += g.pb;
    B.pa += g.pa;
    if (g.pa > g.pb) {
      A.w++;
      B.l++;
    } else if (g.pb > g.pa) {
      B.w++;
      A.l++;
    } else {
      A.t++;
      B.t++;
    }
  });
  s.forEach((x) => {
    x.pf = Math.round(x.pf * 10) / 10;
    x.pa = Math.round(x.pa * 10) / 10;
  });
  return s.sort((x, y) => y.w + y.t / 2 - (x.w + x.t / 2) || y.pf - x.pf || x.team - y.team);
}

/** A playoff game goes to the higher score; a dead heat to the higher seed. */
function winner(g: Game): number {
  return g.pb > g.pa ? g.b : g.a;
}

export function simulateSeason(league: League, data: DraftData, picks: string[]): SeasonResult {
  const players = byId(data);
  const teams = rosters(picks);
  const weeks = schedule(league).map((pairs, i) =>
    pairs.map(([a, b]) => play(data, teams, i + 1, a, b, players)),
  );
  const standings = standingsFrom(([] as Game[]).concat(...weeks));
  const seeds = standings.slice(0, 4).map((s) => s.team);
  const semis = [
    play(data, teams, SEMIS_WEEK, seeds[0], seeds[3], players),
    play(data, teams, SEMIS_WEEK, seeds[1], seeds[2], players),
  ];
  const final = play(data, teams, FINAL_WEEK, winner(semis[0]), winner(semis[1]), players);
  return { weeks, standings, seeds, semis, final, champion: winner(final) };
}

export function finishOf(result: SeasonResult, team: number): Finish {
  if (result.champion === team) return "C";
  if (result.final.a === team || result.final.b === team) return "F";
  if (result.seeds.includes(team)) return "S";
  return "X";
}

export const FINISH_LABEL: Record<Finish, string> = {
  C: "League champion",
  F: "Lost in the final",
  S: "Lost in the semifinals",
  X: "Missed the playoffs",
};

export type TeamSummary = {
  team: number;
  w: number;
  l: number;
  t: number;
  pf: number;
  place: number;
  finish: Finish;
  /** W / L / T for each regular-season week, for the share grid. */
  marks: ("W" | "L" | "T")[];
};

export function summarize(result: SeasonResult, team: number): TeamSummary {
  const s = result.standings.find((x) => x.team === team)!;
  const marks = result.weeks.map((games) => {
    const g = games.find((x) => x.a === team || x.b === team)!;
    const mine = g.a === team ? g.pa : g.pb;
    const theirs = g.a === team ? g.pb : g.pa;
    return mine > theirs ? "W" : mine < theirs ? "L" : "T";
  });
  return {
    team,
    w: s.w,
    l: s.l,
    t: s.t,
    pf: s.pf,
    place: result.standings.indexOf(s) + 1,
    finish: finishOf(result, team),
    marks,
  };
}

// ── What your scouting was worth ──────────────────────────────────
export type PickReview = {
  overall: number;
  id: string;
  /** What a straight ADP pick would have been at that moment. */
  alt: string;
  pts: number;
  altPts: number;
};

export function reviewPicks(league: League, data: DraftData, picks: string[]): PickReview[] {
  const players = byId(data);
  return picksOf(league.slot)
    .filter((k) => k < picks.length)
    .map((k) => {
      const id = picks[k];
      const alt = choosePick(league, data, picks.slice(0, k), "auto", players);
      return { overall: k, id, alt, pts: seasonPoints(data, id), altPts: seasonPoints(data, alt) };
    });
}

/** The same league, same bots, with the autodraft in your seat. */
export function autodraftBaseline(league: League, data: DraftData): TeamSummary {
  const picks = autodraftRest(league, data, []);
  return summarize(simulateSeason(league, data, picks), league.slot);
}

// ── Sharing ───────────────────────────────────────────────────────
export type DraftResultCode = {
  season: number;
  seed: string;
  /** 0-based. */
  slot: number;
  w: number;
  l: number;
  pf: number;
  finish: Finish;
};

export function encodeResult(r: DraftResultCode): string {
  return `${r.season}-${r.seed}-${r.slot + 1}-${r.w}-${r.l}-${Math.round(r.pf)}-${r.finish}`;
}

export function parseResult(code: string | null | undefined): DraftResultCode | null {
  const m = /^(\d{4})-([a-z0-9]{3,12})-([1-8])-(\d{1,2})-(\d{1,2})-(\d{1,5})-([CFSX])$/.exec(code ?? "");
  if (!m) return null;
  const w = Number(m[4]);
  const l = Number(m[5]);
  if (w + l > REG_WEEKS) return null;
  return {
    season: Number(m[1]),
    seed: m[2],
    slot: Number(m[3]) - 1,
    w,
    l,
    pf: Number(m[6]),
    finish: m[7] as Finish,
  };
}

export function newSeed(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("") + "x";
}
