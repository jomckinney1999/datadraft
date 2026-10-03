/**
 * Duolingo-style lesson SFX via the Web Audio API — no asset files, no
 * licence headaches. Mute preference lives in its own localStorage key so it
 * never touches the progress schema.
 *
 * Browsers suspend AudioContext until a user gesture; every play() resumes it
 * so the first Check click is what unlocks audio for the rest of the drive.
 */

export type SfxKind =
  | "correct"
  | "first_down"
  | "touchdown"
  | "miss"
  | "sack"
  | "turnover"
  | "complete"
  | "ui"
  | "unlock";

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
