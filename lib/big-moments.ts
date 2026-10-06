/**
 * The big moments: full-screen cartoon stingers for the things worth
 * stopping for, in the same spirit as the referee on the title screen
 * (components/big-moment.tsx draws them).
 *
 *   touchdown — a lesson finished. The ref signals it, the word stamps in.
 *   game-ball — a unit cleared. A ball drops onto a tee and the unit's name
 *               is painted on its stripe, the way a team paints a game ball.
 *   bucket    — a course cleared. Coach gets the bucket emptied over him.
 *   promoted  — a new rank. Your magnet moves up the depth chart.
 *
 * This file is the pure part: which moment an event earns, and how long
 * each one runs. It never imports the art, so the lesson player can decide
 * what to play without loading what plays it.
 */

import type { Rank } from "./tenure";

export type MomentKind = "touchdown" | "game-ball" | "bucket" | "promoted";

export type Moment = {
  kind: MomentKind;
  /** Stable per event, so React remounts the stinger between two moments. */
  key: string;
  /** The word that stamps in ("Touchdown!"). */
  headline: string;
  /** The line under it: the lesson, unit or course, or the rank's blurb. */
  sub?: string;
  /** For game-ball: what gets painted on the ball. */
  painted?: string;
  /**
   * For promoted: the depth chart's rows, top first (the next rank up if
   * there is one, the rank reached, the rank left), and which row is new.
   */
  chart?: { rows: string[]; to: number };
};

/**
 * Milliseconds each one holds before it clears. The CSS times its beats to
 * these (big-moment.module.css); change one, change the other.
 */
export const MOMENT_HOLD: Record<MomentKind, number> = {
  touchdown: 2100,
  "game-ball": 3300,
  bucket: 4300,
  promoted: 3300,
};
/** Under reduced motion every moment is a still frame, held briefly. */
export const MOMENT_HOLD_REDUCED = 1700;
/** The exit wipe. */
export const MOMENT_OUT = 450;

/**
 * What finishing a lesson earns: the biggest thing it completed, never all
 * of them back to back. A course cleared outranks the unit that cleared it,
 * which outranks the touchdown. Clears only count the first time, so
 * replaying the last lesson of a finished course is a touchdown, not a
 * second bucket.
 */
export function lessonMoment({
  lessonId,
  lessonTitle,
  unit,
  course,
  before,
  after,
}: {
  lessonId: string;
  lessonTitle: string;
  /** The unit's live lessons, in order. */
  unit: { id: string; title: string; lessons: string[] } | null;
  /** The course's live lessons. */
  course: { id: string; title: string; lessons: string[] } | null;
  before: readonly string[];
  after: readonly string[];
}): Moment {
  const had = new Set(before);
  const has = new Set(after);
  const clears = (ids: string[]) => ids.length > 0 && ids.every((id) => has.has(id)) && !ids.every((id) => had.has(id));
  if (course && clears(course.lessons)) {
    return { kind: "bucket", key: `course:${course.id}`, headline: "Course cleared!", sub: course.title };
  }
  if (unit && clears(unit.lessons)) {
    return {
      kind: "game-ball",
      key: `unit:${unit.id}`,
      headline: "Game ball!",
      sub: `Unit cleared · ${unit.title}`,
      painted: unit.title,
    };
  }
  return { kind: "touchdown", key: `lesson:${lessonId}:${after.length}`, headline: "Touchdown!", sub: lessonTitle };
}

/**
 * A new rank, as the depth chart shows it: the rank above (what's next),
 * the rank reached, and the one below it, which is where your magnet starts.
 */
export function promotedMoment(rank: Rank, ranks: readonly Rank[]): Moment {
  const i = ranks.findIndex((r) => r.id === rank.id);
  const above = ranks[i + 1];
  const below = ranks[i - 1];
  const rows = [above?.name, rank.name, below?.name].filter((x): x is string => !!x);
  return {
    kind: "promoted",
    key: `rank:${rank.id}`,
    headline: "Promoted!",
    sub: `${rank.name} · ${rank.blurb}`,
    chart: { rows, to: above ? 1 : 0 },
  };
}

/** Today's date the way it's painted on a game ball: "OCT 6, 2026". */
export function paintedDate(d: Date = new Date()): string {
  const m = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()];
  return `${m} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * The same stingers for the games: a Draft Room title gets the bucket, a
 * perfect duel and a passed mock screen get the ref's signal. Kept to the
 * moments that happen at most once a day or once a season, so a game you
 * come back to every day never makes you sit through one for nothing.
 */
export function gameMoment(kind: "touchdown" | "bucket", key: string, headline: string, sub: string): Moment {
  return { kind, key, headline, sub };
}
