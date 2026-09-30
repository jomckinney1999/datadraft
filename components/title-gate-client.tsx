"use client";

/**
 * The title screen's behaviour. The look and every animation are CSS
 * (`.title-gate` in globals.css), driven by `data-phase` on the gate:
 *
 *   idle → the ref bobs and blinks, "press any button" pulses
 *   blow → pose swap, whistle (sound), TWEEET! burst, shockwaves, shake
 *   exit → a cartoon iris opens from the middle of the screen onto the site,
 *          and the hero springs up under it (`data-gate-opened` on <html>)
 *
 * The phase is written straight onto the element rather than through React
 * state so the sound and the first frame of the blow land on the same tick.
 * See title-gate.tsx for when the gate shows at all.
 */

import { useEffect, useRef } from "react";
import Referee from "@/components/referee";
import { blowWhistle, WHISTLE } from "@/lib/whistle";

const KEY = "sqlsports.gate.v1";
/** Exit starts as the long blast ends; the iris takes 0.6s. */
const EXIT_AT = Math.round((WHISTLE.longAt + WHISTLE.longLen) * 1000) + 60;
const DONE_AT = EXIT_AT + 620;
const MODIFIERS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock"]);

declare global {
  interface Window {
    __ddGate?: boolean;
    __ddGatePress?: boolean;
  }
}

export default function TitleGateClient() {
  const gateRef = useRef<HTMLDivElement | null>(null);
  const pressRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    window.__ddGate = true;
    const html = document.documentElement;
    const gate = gateRef.current;
    if (!gate || html.getAttribute("data-gate") !== "on") return;

    const timers: number[] = [];
    let started = false;

    const finish = () => {
      html.removeAttribute("data-gate");
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        // Private mode can refuse storage; the gate just shows again next time.
      }
      // Let the hero's spring finish, then drop the attribute so a later
      // client-side visit to the home page doesn't replay it.
      timers.push(window.setTimeout(() => html.removeAttribute("data-gate-opened"), 1200));
    };

    const start = () => {
      if (started) return;
      started = true;
      window.removeEventListener("keydown", onKey, true);
      gate.dataset.phase = "blow";
      blowWhistle();
      timers.push(
        window.setTimeout(() => {
          gate.dataset.phase = "exit";
          html.setAttribute("data-gate-opened", "");
        }, EXIT_AT),
        window.setTimeout(finish, DONE_AT),
      );
    };

    function onKey(e: KeyboardEvent) {
      // Browser shortcuts and a lone modifier are not "a button".
      if (e.metaKey || e.ctrlKey || e.altKey || MODIFIERS.has(e.key)) return;
      e.preventDefault();
      start();
    }

    window.addEventListener("keydown", onKey, true);
    gate.addEventListener("pointerdown", start);
    // Focusing the button on a phone scrolls the visual viewport under the
    // fixed title screen, and the ref ends up off the screen.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) pressRef.current?.focus({ preventScroll: true });

    // Pressed before the page finished loading: play it now.
    if (window.__ddGatePress) start();

    return () => {
      window.removeEventListener("keydown", onKey, true);
      gate.removeEventListener("pointerdown", start);
      timers.forEach(clearTimeout);
      if (started) finish();
      html.removeAttribute("data-gate-opened");
    };
  }, []);

  return (
    <div
      ref={gateRef}
      className="title-gate"
      data-phase="idle"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to DataDraft"
    >
      <div aria-hidden className="field-layer field-turf" />
      <div aria-hidden className="field-layer dot-field" />
      <div aria-hidden className="gate-rays" />
      <div aria-hidden className="gate-rays gate-rays-hot" />

      <div className="gate-stage">
        <p className="gate-wordmark font-display text-pop">
          Data<span className="title-glow-turf text-turf">Draft</span>
        </p>

        <div className="gate-ref">
          <Referee className="gate-ref-svg" />
          <span aria-hidden className="gate-ring" />
          <span aria-hidden className="gate-ring gate-ring-2" />
          <span aria-hidden className="gate-ring gate-ring-3" />
          <GateBurst />
        </div>

        <button ref={pressRef} type="button" className="gate-press">
          <span className="gate-key">Press any button</span>
          <span className="gate-tap">Tap anywhere</span>
        </button>
        <p className="gate-hint">
          <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5">
            <path d="M3 8 H6 L10.5 4.5 V15.5 L6 12 H3 Z" fill="currentColor" />
            <path d="M13.5 7 Q15.5 10 13.5 13 M15.8 5 Q19 10 15.8 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Sound on · kick off to open the site
        </p>
      </div>
    </div>
  );
}

/** The comic-book "TWEEET!" — a starburst sticker with the night outline. */
function GateBurst() {
  const points = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const r = i % 2 === 0 ? 1 : 0.74;
    const x = Math.round((110 + Math.cos(a) * 104 * r) * 10) / 10;
    const y = Math.round((70 + Math.sin(a) * 64 * r) * 10) / 10;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg aria-hidden viewBox="0 0 220 140" className="gate-burst" overflow="visible">
      <polygon points={points} className="gate-burst-shape" strokeWidth="6" strokeLinejoin="round" />
      <text x="110" y="82" textAnchor="middle" className="gate-burst-text">
        TWEEET!
      </text>
    </svg>
  );
}
