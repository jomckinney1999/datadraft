/**
 * Which players a question is about — for the faces on its card.
 *
 * Three tiers, in order, and the first that yields anyone wins:
 *
 *   1. `question.players` — set by hand on questions that name someone.
 *      "Week 3 Hammer" is about Saquon Barkley whether or not the prompt
 *      says his name, so the author says so.
 *   2. A position the prompt mentions. "Tight End Premium" shows tight
 *      ends; "Floor and Ceiling" (running backs) shows running backs. The
 *      pick within a position is by 2024 season total, so the faces are the
 *      names a fan already knows.
 *   3. A deterministic slice of the roster keyed on the question id, so a
 *      question about nothing in particular still gets faces — different
 *      ones per question, and the same ones every time it renders.
 *
 * Never random. A card that reshuffles its own faces on re-render flickers
 * while you read it, and a server render that disagrees with the client's
 * tears hydration.
 *
 * Every name here is one of the twenty players the lesson data is built on,
 * and the verifier fails a `players` entry that is not — a typo would
 * otherwise silently render as an initial in a circle.
 */

import type { Question } from "@/lib/questions";
import {
  PLAYER_HEADSHOTS,
  type PlayerHeadshot,
} from "@/lib/player-headshots.generated";

export type FeaturedPlayer = PlayerHeadshot & { name: string };

/**
 * The twenty, by 2024 season total, highest first. Read out of the database
 * (same figures as PY_SETUP in lib/questions.ts), not typed from memory.
 */
export const RANKED_PLAYERS: readonly string[] = [
  "Lamar Jackson",
  "Ja'Marr Chase",
  "Josh Allen",
  "Jahmyr Gibbs",
  "Saquon Barkley",
  "Bijan Robinson",
  "Derrick Henry",
  "Justin Jefferson",
  "Amon-Ra St. Brown",
  "Jalen Hurts",
  "Patrick Mahomes",
  "CeeDee Lamb",
  "Davante Adams",
  "George Kittle",
  "Tyreek Hill",
  "A.J. Brown",
  "Puka Nacua",
  "Travis Kelce",
  "Sam LaPorta",
  "Christian McCaffrey",
];

/** Lesson-era positions, so a position question matches the data it runs on. */
const POSITION: Record<string, "QB" | "RB" | "WR" | "TE"> = {
  "Lamar Jackson": "QB",
  "Ja'Marr Chase": "WR",
  "Josh Allen": "QB",
  "Jahmyr Gibbs": "RB",
  "Saquon Barkley": "RB",
  "Bijan Robinson": "RB",
  "Derrick Henry": "RB",
  "Justin Jefferson": "WR",
  "Amon-Ra St. Brown": "WR",
  "Jalen Hurts": "QB",
  "Patrick Mahomes": "QB",
  "CeeDee Lamb": "WR",
  "Davante Adams": "WR",
  "George Kittle": "TE",
  "Tyreek Hill": "WR",
  "A.J. Brown": "WR",
  "Puka Nacua": "WR",
  "Travis Kelce": "TE",
  "Sam LaPorta": "TE",
  "Christian McCaffrey": "RB",
};

const POSITION_WORDS: [RegExp, "QB" | "RB" | "WR" | "TE"][] = [
  [/quarterbacks?|\bqbs?\b/i, "QB"],
  [/running backs?|\brbs?\b|\bbacks?\b/i, "RB"],
  [/wide receivers?|receivers?|\bwrs?\b/i, "WR"],
  [/tight ends?|\btes?\b/i, "TE"],
];

function lookup(name: string): FeaturedPlayer | null {
  const shot = PLAYER_HEADSHOTS[name];
  return shot ? { name, ...shot } : null;
}

/** Small, stable hash so tier 3 varies by question but never by render. */
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function featuredPlayers(q: Question, max = 3): FeaturedPlayer[] {
  // 1. Named by the author.
  if (q.players && q.players.length > 0) {
    const picked = q.players
      .map(lookup)
      .filter((p): p is FeaturedPlayer => Boolean(p));
    if (picked.length > 0) return picked.slice(0, max);
  }

  // 2. A position the question talks about.
  const text = `${q.title} ${q.prompt}`;
  const positions = POSITION_WORDS.filter(([re]) => re.test(text)).map(
    ([, pos]) => pos,
  );
  if (positions.length > 0) {
    const picked = RANKED_PLAYERS.filter((n) =>
      positions.includes(POSITION[n]),
    )
      .map(lookup)
      .filter((p): p is FeaturedPlayer => Boolean(p));
    if (picked.length > 0) return picked.slice(0, max);
  }

  // 3. A stable slice of the roster, so the faces differ per question and
  //    hold still per render.
  const start = hashId(q.id) % RANKED_PLAYERS.length;
  const out: FeaturedPlayer[] = [];
  for (let i = 0; out.length < max && i < RANKED_PLAYERS.length; i++) {
    const p = lookup(RANKED_PLAYERS[(start + i) % RANKED_PLAYERS.length]);
    if (p) out.push(p);
  }
  return out;
}
