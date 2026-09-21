/**
 * Downs-and-distance drive simulation for the lesson player.
 *
 * A lesson is one possession. Correct answers gain yards (from lib/gameplay
 * BASE_YARDS + combo); misses burn a down. Soft grading errors never touch
 * this state — only a hard wrong answer does.
 *
 * Yardage here is physical field position, not the old "percent of exercises
 * done" progress bar. XP still comes from grading; this only decides whether
 * the drive stays alive.
 */

import type { Exercise } from "@/lib/curriculum";
import { missCall, runPlay } from "@/lib/gameplay";

export type Down = 1 | 2 | 3 | 4;

export type PlayKind =
  | "gain"
  | "first_down"
  | "incomplete"
  | "sack"
  | "td"
  | "turnover";

export type LastPlay = {
  kind: PlayKind;
  yards: number;
  call: string;
};

export type DriveState = {
  down: Down;
  /** Yards needed for a first down. */
  distance: number;
  /** 0 = own goal, 100 = opponent end zone. */
  ballOn: number;
  /** Where the chains sit (ballOn + distance, capped at 100). */
  firstDownAt: number;
  status: "live" | "touchdown" | "turnover";
  lastPlay: LastPlay | null;
  /** Hard misses this drive — perfect = zero. */
  downsBurned: number;
};

/** Kickoff field position: 1st & 10 at the own 25. */
export const DRIVE_START_BALL = 25;

export function startDrive(): DriveState {
  return {
    down: 1,
    distance: 10,
    ballOn: DRIVE_START_BALL,
    firstDownAt: Math.min(100, DRIVE_START_BALL + 10),
    status: "live",
    lastPlay: null,
    downsBurned: 0,
  };
}

function chains(ballOn: number, distance: number): number {
  return Math.min(100, ballOn + distance);
}

/** Broadcast label: "1st & 10", "3rd & Goal", etc. */
export function downAndDistance(state: DriveState): string {
  const ordinal = (["1st", "2nd", "3rd", "4th"] as const)[state.down - 1];
  if (state.ballOn + state.distance >= 100) return `${ordinal} & Goal`;
  return `${ordinal} & ${state.distance}`;
}

/** "Own 25" / "Opp 40" / "END ZONE" for the scorebug. */
export function ballOnLabel(ballOn: number): string {
  const y = Math.round(ballOn);
  if (y >= 100) return "END ZONE";
  if (y <= 0) return "Own 0";
  if (y < 50) return `Own ${y}`;
  if (y === 50) return "50";
  return `Opp ${100 - y}`;
}

/**
 * Whether this miss is a sack (loses yards) vs an incomplete (LOS stays).
 * Deterministic on seed so the headline doesn't flicker across re-renders.
 */
export function isSackMiss(seed: number, call: string): boolean {
  if (/sack/i.test(call)) return true;
  return Math.abs(seed) % 5 === 2;
}

export function applyCorrect(
  state: DriveState,
  yards: number,
  call: string,
): DriveState {
  if (state.status !== "live") return state;

  const gained = Math.max(0, Math.round(yards));
  const ballOn = Math.min(100, state.ballOn + gained);

  if (ballOn >= 100) {
    return {
      ...state,
      ballOn: 100,
      firstDownAt: 100,
      distance: 0,
      status: "touchdown",
      lastPlay: { kind: "td", yards: gained, call },
    };
  }

  if (gained >= state.distance) {
    const distance = Math.min(10, 100 - ballOn);
    return {
      ...state,
      ballOn,
      down: 1,
      distance,
      firstDownAt: chains(ballOn, distance),
      lastPlay: { kind: "first_down", yards: gained, call },
    };
  }

  const distance = state.distance - gained;
  return {
    ...state,
    ballOn,
    distance,
    firstDownAt: chains(ballOn, distance),
    lastPlay: { kind: "gain", yards: gained, call },
  };
}

export function applyMiss(
  state: DriveState,
  seed: number,
  call: string,
): DriveState {
  if (state.status !== "live") return state;

  const sack = isSackMiss(seed, call);
  const sackYards = sack ? 2 + (Math.abs(seed) % 5) : 0; // 2–6
  const ballOn = sack ? Math.max(0, state.ballOn - sackYards) : state.ballOn;
  const distance = sack ? state.distance + sackYards : state.distance;
  const downsBurned = state.downsBurned + 1;

  if (state.down >= 4) {
    return {
      ...state,
      ballOn,
      distance,
      firstDownAt: chains(ballOn, distance),
      status: "turnover",
      downsBurned,
      lastPlay: {
        kind: "turnover",
        yards: sack ? -sackYards : 0,
        call,
      },
    };
  }

  return {
    ...state,
    down: (state.down + 1) as Down,
    ballOn,
    distance,
    firstDownAt: chains(ballOn, distance),
    downsBurned,
    lastPlay: {
      kind: sack ? "sack" : "incomplete",
      yards: sack ? -sackYards : 0,
      call,
    },
  };
}

/**
 * Score a correct answer through gameplay yardage, then advance the drive.
 * Keeps play-call flavour in gameplay.ts and physics here.
 */
export function scoreCorrectPlay(
  state: DriveState,
  type: Exercise["type"],
  firstTry: boolean,
  combo: number,
  seed: number,
): {
  state: DriveState;
  yards: number;
  call: string;
  heat: string | null;
  explosive: boolean;
} {
  const play = runPlay(type, firstTry, combo, seed);
  return {
    state: applyCorrect(state, play.yards, play.call),
    yards: play.yards,
    call: play.call,
    heat: play.heat,
    explosive: play.explosive,
  };
}

export function scoreMissPlay(
  state: DriveState,
  seed: number,
): { state: DriveState; call: string } {
  const call = missCall(seed);
  return { state: applyMiss(state, seed, call), call };
}
