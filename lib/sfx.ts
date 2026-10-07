/**
 * Duolingo-style lesson SFX via the Web Audio API — no asset files, no
 * licence headaches. Mute preference lives in its own localStorage key so it
 * never touches the progress schema.
 *
 * Browsers suspend AudioContext until a user gesture; every play() resumes it
 * so the first Check click is what unlocks audio for the rest of the drive.
 */

import { scheduleWhistle } from "./whistle";

export type SfxKind =
  | "correct"
  | "first_down"
  | "touchdown"
  | "miss"
  | "sack"
  | "turnover"
  | "complete"
  | "ui"
  | "unlock"
  // The big moments (components/big-moment.tsx).
  | "whistle"
  | "splash"
  | "roar"
  | "clack"
  | "thump"
  // The page transitions (components/route-transition-curtain.tsx).
  | "whoosh";

const MUTE_KEY = "sqlsports-sfx-muted";
const MUTE_EVENT = "sqlsports:sfx-mute";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isSfxMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSfxMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Non-fatal — mute still applies for this page view via the event.
  }
  window.dispatchEvent(
    new CustomEvent(MUTE_EVENT, { detail: { muted } }),
  );
}

export function toggleSfxMuted(): boolean {
  const next = !isSfxMuted();
  setSfxMuted(next);
  return next;
}

/** Subscribe to mute flips (same-tab + cross-tab). */
export function onSfxMuteChange(cb: (muted: boolean) => void): () => void {
  const sync = () => cb(isSfxMuted());
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ muted: boolean }>).detail;
    cb(detail?.muted ?? isSfxMuted());
  };
  window.addEventListener(MUTE_EVENT, onCustom);
  window.addEventListener("storage", sync);
  return () => {
    window.removeEventListener(MUTE_EVENT, onCustom);
    window.removeEventListener("storage", sync);
  };
}

type Tone = {
  freq: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  /** Exponential pitch bend end (Hz). */
  to?: number;
};

function beep(c: AudioContext, t: Tone): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = t.type ?? "triangle";
  osc.frequency.setValueAtTime(t.freq, c.currentTime + t.at);
  if (t.to != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, t.to),
      c.currentTime + t.at + t.dur,
    );
  }
  const peak = t.gain ?? 0.18;
  const start = c.currentTime + t.at;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.018);
  g.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(start);
  osc.stop(start + t.dur + 0.02);
}

type Noise = {
  at: number;
  dur: number;
  /** Band-pass centre at the start and end of the burst (Hz). */
  from: number;
  to: number;
  gain: number;
  /** Band width: low Q is a wide hiss, high Q is nearly a pitch. */
  q?: number;
  /** Seconds to swell in; a splash is instant, a crowd is not. */
  attack?: number;
};

let noiseBuf: AudioBuffer | null = null;

/** Filtered white noise: the splash, the crowd, the clack of a magnet. */
function hiss(c: AudioContext, n: Noise): void {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    const len = Math.floor(c.sampleRate * 2.5);
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = n.q ?? 0.8;
  const start = c.currentTime + n.at;
  bp.frequency.setValueAtTime(n.from, start);
  bp.frequency.exponentialRampToValueAtTime(Math.max(40, n.to), start + n.dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(n.gain, start + (n.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(c.destination);
  src.start(start);
  src.stop(start + n.dur + 0.05);
}

function noises(list: Noise[]): void {
  const c = getCtx();
  if (!c || isSfxMuted()) return;
  for (const n of list) hiss(c, n);
}

function sequence(tones: Tone[]): void {
  const c = getCtx();
  if (!c || isSfxMuted()) return;
  for (const t of tones) beep(c, t);
}

/**
 * Play a named cue. Safe to call from SSR / before any gesture — it no-ops
 * until an AudioContext can start, then resumes on the click that triggered it.
 */
export function playSfx(kind: SfxKind): void {
  switch (kind) {
    case "correct":
      // Bright two-note ding — Duolingo's "ding ding" energy.
      sequence([
        { freq: 587.33, at: 0, dur: 0.12, type: "triangle", gain: 0.2 }, // D5
        { freq: 880, at: 0.1, dur: 0.18, type: "triangle", gain: 0.22 }, // A5
      ]);
      break;
    case "first_down":
      sequence([
        { freq: 523.25, at: 0, dur: 0.1, gain: 0.18 },
        { freq: 659.25, at: 0.09, dur: 0.1, gain: 0.2 },
        { freq: 783.99, at: 0.18, dur: 0.22, gain: 0.24 },
      ]);
      break;
    case "touchdown":
      // Short victory fanfare.
      sequence([
        { freq: 392, at: 0, dur: 0.12, gain: 0.2 },
        { freq: 523.25, at: 0.11, dur: 0.12, gain: 0.22 },
        { freq: 659.25, at: 0.22, dur: 0.12, gain: 0.24 },
        { freq: 783.99, at: 0.33, dur: 0.28, type: "square", gain: 0.14 },
      ]);
      break;
    case "miss":
      // Soft descending "whomp" — incomplete pass.
      sequence([
        {
          freq: 220,
          to: 110,
          at: 0,
          dur: 0.22,
          type: "sine",
          gain: 0.16,
        },
      ]);
      break;
    case "sack":
      sequence([
        {
          freq: 140,
          to: 70,
          at: 0,
          dur: 0.28,
          type: "sawtooth",
          gain: 0.1,
        },
      ]);
      break;
    case "turnover":
      sequence([
        { freq: 196, at: 0, dur: 0.16, type: "square", gain: 0.1 },
        { freq: 147, at: 0.14, dur: 0.22, type: "square", gain: 0.12 },
        {
          freq: 98,
          to: 55,
          at: 0.32,
          dur: 0.3,
          type: "sine",
          gain: 0.14,
        },
      ]);
      break;
    case "complete":
      // Lesson-over arpeggio (played once on the finish screen).
      sequence([
        { freq: 523.25, at: 0, dur: 0.14, gain: 0.18 },
        { freq: 659.25, at: 0.12, dur: 0.14, gain: 0.2 },
        { freq: 783.99, at: 0.24, dur: 0.14, gain: 0.22 },
        { freq: 1046.5, at: 0.36, dur: 0.32, gain: 0.24 },
      ]);
      break;
    case "ui":
      // Soft tick for nav / chip presses — barely there.
      sequence([{ freq: 740, at: 0, dur: 0.05, type: "sine", gain: 0.06 }]);
      break;
    case "unlock":
      // Hall of Fame / badge cabinet open.
      sequence([
        { freq: 392, at: 0, dur: 0.1, type: "triangle", gain: 0.12 },
        { freq: 523.25, at: 0.08, dur: 0.12, type: "triangle", gain: 0.16 },
        { freq: 784, at: 0.18, dur: 0.28, type: "triangle", gain: 0.2 },
      ]);
      break;
    case "whistle": {
      // The title screen's whistle, through this context, so it plays
      // wherever the lesson's first click already unlocked sound and obeys
      // the mute switch like every other cue.
      const c = getCtx();
      if (!c || isSfxMuted()) return;
      try {
        scheduleWhistle(c, c.destination, c.currentTime + 0.02);
      } catch {
        /* sound is the garnish */
      }
      break;
    }
    case "splash":
      // A bucket emptied over someone: a hard slap, then the pour hissing
      // down and away.
      noises([
        { at: 0, dur: 0.18, from: 1800, to: 700, gain: 0.5, q: 0.6 },
        { at: 0.04, dur: 1.1, from: 5200, to: 900, gain: 0.32, q: 0.5, attack: 0.05 },
        { at: 0.5, dur: 0.7, from: 2600, to: 1400, gain: 0.12, q: 1.5, attack: 0.1 },
      ]);
      break;
    case "roar":
      // A crowd coming up out of its seats: low and wide, swelling in.
      noises([
        { at: 0, dur: 2.2, from: 700, to: 1100, gain: 0.16, q: 0.35, attack: 0.5 },
        { at: 0.1, dur: 1.9, from: 1700, to: 2300, gain: 0.07, q: 0.7, attack: 0.6 },
      ]);
      break;
    case "clack":
      // A magnet slapped onto a whiteboard.
      noises([{ at: 0, dur: 0.07, from: 3200, to: 2200, gain: 0.45, q: 2.2 }]);
      sequence([{ freq: 180, to: 90, at: 0, dur: 0.09, type: "sine", gain: 0.2 }]);
      break;
    case "whoosh":
      // Air past a ball in flight: a band of noise swept up and away.
      noises([
        { at: 0, dur: 0.42, from: 500, to: 3600, gain: 0.2, q: 0.9, attack: 0.12 },
        { at: 0.05, dur: 0.3, from: 1400, to: 5200, gain: 0.07, q: 1.6, attack: 0.08 },
      ]);
      break;
    case "thump":
      // A ball landing on the podium.
      sequence([{ freq: 120, to: 55, at: 0, dur: 0.22, type: "sine", gain: 0.32 }]);
      noises([{ at: 0, dur: 0.06, from: 900, to: 500, gain: 0.2, q: 1 }]);
      break;
  }
}

/** Map a graded play to the right cue. */
export function playForPlayKind(
  correct: boolean,
  playKind: string | undefined,
): void {
  if (correct) {
    if (playKind === "td") playSfx("touchdown");
    else if (playKind === "first_down") playSfx("first_down");
    else playSfx("correct");
    return;
  }
  if (playKind === "turnover") playSfx("turnover");
  else if (playKind === "sack") playSfx("sack");
  else playSfx("miss");
}
