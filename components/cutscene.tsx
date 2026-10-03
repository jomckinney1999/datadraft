"use client";

/**
 * A cutscene: the scenario delivered the way a game delivers a mission.
 * Letterbox bars, a title card, then the cast talking in speech bubbles one
 * beat at a time, then the objectives, then a button that starts the work.
 * (Decided 2026-10-03: the scenarios should feel like scenes.)
 *
 * Used where a scenario is the point and a minute of setup is welcome: a
 * case's briefing, a mock screen's interviewer. Not on a daily question,
 * which has to stay ninety seconds; questions get the speech bubble and the
 * objective inline instead (components/scene-line.tsx).
 *
 * Things to keep true:
 * - **Always skippable.** Esc or "Skip" jumps straight to the objectives,
 *   which are the part you need; a press while a line is typing finishes it.
 * - **Once, then on request.** `useSceneOnce` plays it on a first visit and
 *   remembers (`sqlsports.scenes.v1`); the page offers "Replay briefing".
 * - **Keys:** → / Enter / Space advance, Esc skips. A focused button handles
 *   its own Enter and Space, or a beat would be skipped.
 * - **Reduced motion:** no typing, no bars sliding, no pops; the words just
 *   appear. Screen readers get each line whole, never letter by letter.
 * - Deterministic, never `Math.random()`.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Coach, { type CoachMood } from "@/components/coach";
import CallerPortrait, { type PortraitTone } from "@/components/caller-portrait";

export type Speaker =
  | { kind: "coach"; mood?: CoachMood }
  | { kind: "caller"; name: string; title: string; tone?: PortraitTone };

export type Beat = { who: Speaker; text: string };

const SEEN_KEY = "sqlsports.scenes.v1";

function readSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Play a scene the first time this browser reaches it, then only on request. */
export function useSceneOnce(id: string) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    const was = readSeen().includes(id);
    setSeen(was);
    if (!was) setOpen(true);
  }, [id]);
  const close = useCallback(() => {
    setOpen(false);
    setSeen(true);
    try {
      const all = readSeen();
      if (!all.includes(id)) localStorage.setItem(SEEN_KEY, JSON.stringify([...all, id].slice(-200)));
    } catch {
      /* storage blocked: it just plays again next time */
    }
  }, [id]);
  return { open, seen, play: () => setOpen(true), close };
}

/** Whether this browser has already seen a scene, without playing it. */
export function sceneSeen(id: string): boolean {
  return readSeen().includes(id);
}

export function markSceneSeen(id: string) {
  try {
    const all = readSeen();
    if (!all.includes(id)) localStorage.setItem(SEEN_KEY, JSON.stringify([...all, id].slice(-200)));
  } catch {
    /* fine */
  }
}

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A line typing itself out, two characters a tick; all at once under reduced
 * motion. Restarts whenever `text` or `restartKey` changes. `finish()` shows
 * the whole line (a press while it types). Shared by the cutscene and the
 * tour so both type at the same speed.
 */
export function useTypewriter(text: string, active: boolean, restartKey: unknown = text) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reducedMotion()) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          window.clearInterval(id);
          return n;
        }
        return Math.min(text.length, n + 2);
      });
    }, 24);
    return () => window.clearInterval(id);
  }, [text, active, restartKey]);
  const finish = useCallback(() => setShown(text.length), [text.length]);
  return { shown, typing: active && shown < text.length, finish };
}

function Portrait({ who, talking }: { who: Speaker; talking: boolean }) {
  if (who.kind === "coach") {
    return <Coach mood={who.mood ?? (talking ? "happy" : "idle")} size={104} />;
  }
  return <CallerPortrait tone={who.tone ?? "ice"} size={92} />;
}

const nameOf = (who: Speaker) => (who.kind === "coach" ? "Coach Blitz" : who.name);
const titleOf = (who: Speaker) => (who.kind === "coach" ? "Your coach" : who.title);
const toneOf = (who: Speaker) => (who.kind === "coach" ? "turf" : (who.tone ?? "ice"));

export default function Cutscene({
  open,
  kicker,
  title,
  beats,
  objectives,
  objectivesNote,
  startLabel,
  onStart,
  onClose,
}: {
  open: boolean;
  /** Above the title: "Case file · Gridiron Desk". */
  kicker: string;
  title: string;
  beats: Beat[];
  objectives: string[];
  /** One line under the objectives: "No clock. Take your time." */
  objectivesNote?: string;
  startLabel: string;
  /** The start button; also Esc on the objectives, unless `onClose` is given. */
  onStart: () => void;
  /**
   * Leave without starting: a "Not now" link and Esc on the objectives. For a
   * scene whose start has a cost, like a mock screen's clock.
   */
  onClose?: () => void;
}) {
  const [phase, setPhase] = useState<"title" | "beats" | "objectives">("title");
  const [beat, setBeat] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const text = beats[beat]?.text ?? "";
  const { shown, typing, finish } = useTypewriter(text, open && phase === "beats", beat);

  // Open: reset, lock the page behind, remember where focus was.
  useEffect(() => {
    if (!open) return;
    setPhase("title");
    setBeat(0);
    returnTo.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      returnTo.current?.focus?.();
    };
  }, [open]);

  // The title card holds for a beat, then the scene starts on its own.
  useEffect(() => {
    if (!open || phase !== "title") return;
    const t = window.setTimeout(() => setPhase("beats"), reducedMotion() ? 600 : 1500);
    return () => window.clearTimeout(t);
  }, [open, phase]);

  useEffect(() => {
    if (phase === "objectives") startRef.current?.focus();
  }, [phase]);

  const advance = useCallback(() => {
    if (phase === "title") return setPhase("beats");
    if (phase === "beats") {
      if (typing) return finish();
      if (beat < beats.length - 1) return setBeat((b) => b + 1);
      return setPhase("objectives");
    }
  }, [phase, typing, finish, beat, beats.length]);

  const skip = useCallback(() => {
    if (phase === "objectives") (onClose ?? onStart)();
    else setPhase("objectives");
  }, [phase, onStart, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "Enter" && e.key !== " ") return;
      // A focused button acts on its own Enter/Space.
      if ((e.key === "Enter" || e.key === " ") && t?.tagName === "BUTTON") return;
      if (phase === "objectives") return;
      e.preventDefault();
      advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, advance, skip]);

  if (!open) return null;
  const who = beats[beat]?.who;
  const tone = who ? toneOf(who) : "turf";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-night-100/95 backdrop-blur-sm">
      <div aria-hidden className="cutscene-bar cutscene-bar-top absolute inset-x-0 top-0 h-[8vh]" />
      <div aria-hidden className="cutscene-bar cutscene-bar-bottom absolute inset-x-0 bottom-0 h-[8vh]" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${kicker}: ${title}`}
        tabIndex={-1}
        className="cutscene-dialog relative w-full max-w-3xl px-4"
        onClick={(e) => {
          if (phase !== "objectives" && !(e.target as HTMLElement).closest("button")) advance();
        }}
      >
        {phase !== "objectives" && (
          <button
            type="button"
            onClick={skip}
            className="absolute -top-[calc(8vh-1rem)] right-4 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink sm:-top-10"
          >
            Skip ⏭
          </button>
        )}

        {phase === "title" && (
          <div className="cutscene-title text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-gold">{kicker}</p>
            <p className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{title}</p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted">Press any key</p>
          </div>
        )}

        {phase === "beats" && who && (
          <div key={beat} className="cutscene-pop flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="flex shrink-0 flex-col items-center">
              <Portrait who={who} talking={typing} />
              <span
                className={`mt-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                  tone === "turf"
                    ? "border-turf/60 bg-turf/15 text-turf"
                    : tone === "gold"
                      ? "border-gold/60 bg-gold/15 text-gold"
                      : "border-ice/60 bg-ice/15 text-ice"
                }`}
              >
                {nameOf(who)}
              </span>
              <span className="mt-0.5 max-w-[10rem] text-center font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                {titleOf(who)}
              </span>
            </div>
            <div className="cutscene-bubble relative min-h-[7.5rem] w-full rounded-2xl border-[3px] border-night bg-ink px-5 py-4 text-night">
              <p aria-hidden className="font-display text-lg font-semibold leading-snug sm:text-xl">
                {text.slice(0, shown)}
                {typing && <span className="cutscene-caret">▍</span>}
              </p>
              <p className="sr-only" aria-live="polite">
                {nameOf(who)}: {text}
              </p>
              {!typing && (
                <span aria-hidden className="cutscene-caret absolute bottom-2 right-3 text-sm text-night/70">
                  ▼
                </span>
              )}
            </div>
          </div>
        )}

        {phase === "beats" && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden>
              {beats.map((_, i) => (
                <span key={i} className={`h-1.5 w-5 rounded-full ${i <= beat ? "bg-gold" : "bg-panel-border"}`} />
              ))}
            </div>
            <button type="button" onClick={advance} className="press btn-gold !px-4 !py-2 text-sm">
              {typing ? "Show all" : beat < beats.length - 1 ? "Next ▸" : "Objectives ▸"}
            </button>
          </div>
        )}

        {phase === "objectives" && (
          <div className="cutscene-pop surface mx-auto max-w-xl rounded-2xl border border-gold/50 bg-panel p-5 sm:p-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Objectives</p>
            <p className="mt-1 font-display text-xl font-bold text-ink">{title}</p>
            <ol className="mt-4 space-y-2.5">
              {objectives.map((o, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-ink-muted font-mono text-[10px] text-ink-muted">
                    {i + 1}
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ol>
            {objectivesNote && <p className="mt-4 font-mono text-[11px] text-ink-muted">{objectivesNote}</p>}
            <button ref={startRef} type="button" onClick={onStart} className="press btn-gold mt-5 w-full justify-center py-3 text-base">
              {startLabel}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-3 block w-full text-center font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink"
              >
                Not now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
