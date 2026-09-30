"use client";

/**
 * The living field behind the hero.
 *
 * Yard lines receding into the dark, two floodlights drifting across them,
 * chalk dust rising through the beam, and a glow that follows the pointer.
 * All four layers are CSS (see `.field-*` in globals.css) — there is no
 * canvas and no animation loop.
 *
 * The pointer layer is the only JavaScript, and it writes two CSS custom
 * properties straight onto the element rather than going through React
 * state. Moving the mouse across the hero therefore costs one style write
 * per frame instead of a re-render of everything inside it. The write is
 * coalesced through rAF so a fast mouse cannot queue up more work than the
 * browser is going to paint.
 *
 * Nothing here is load-bearing: the hero reads correctly with every layer
 * removed, which is exactly what happens under prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import { Football } from "@/components/art-kit";

/**
 * Two plays drawn on the chalkboard either side of the headline. Each route
 * draws itself, holds, fades and redraws, staggered so the two sides never
 * pulse together. `pathLength="1"` lets one dash length fit every route.
 * Coordinates are in a 1200×700 box stretched over the hero with `slice`,
 * and everything sits outside the middle band where the headline lives.
 */
const ROUTES: { d: string; tip: string; tone: "turf" | "ice" | "gold"; delay: string }[] = [
  // Left: a slant and a go.
  { d: "M150 500 L150 430 L262 346", tip: "M262 346 l-13 1 l7 -11 z", tone: "turf", delay: "0s" },
  { d: "M232 510 L232 262", tip: "M232 262 l-6 12 l12 0 z", tone: "gold", delay: "1.4s" },
  { d: "M88 505 C 88 470, 60 450, 60 400 L60 320", tip: "M60 320 l-6 12 l12 0 z", tone: "ice", delay: "2.8s" },
  // Right: a post and a wheel.
  { d: "M1050 500 L1050 404 L978 318", tip: "M978 318 l1 13 l10 -8 z", tone: "ice", delay: "4s" },
  { d: "M962 510 C 930 470, 902 452, 902 380 L902 270", tip: "M902 270 l-6 12 l12 0 z", tone: "turf", delay: "5.2s" },
  { d: "M1128 505 L1128 440 L1160 400", tip: "M1160 400 l-12 3 l8 9 z", tone: "gold", delay: "6.2s" },
];
const OFFENSE = [
  [150, 500],
  [232, 510],
  [88, 505],
  [1050, 500],
  [962, 510],
  [1128, 505],
];
const DEFENSE = [
  [206, 372],
  [288, 300],
  [104, 340],
  [1004, 350],
  [926, 312],
  [1100, 380],
];

/** Fixed, not random: a re-render must not reshuffle the dust. */
const MOTES = [
  { left: "8%", delay: "0s", duration: "13s" },
  { left: "19%", delay: "3.5s", duration: "17s" },
  { left: "31%", delay: "7s", duration: "11s" },
  { left: "44%", delay: "1.5s", duration: "15s" },
  { left: "57%", delay: "9s", duration: "19s" },
  { left: "68%", delay: "5s", duration: "12s" },
  { left: "79%", delay: "11s", duration: "16s" },
  { left: "88%", delay: "2.5s", duration: "14s" },
  { left: "95%", delay: "6.5s", duration: "18s" },
];

export default function FieldBackdrop() {
  const spotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = spotRef.current;
    const stage = el?.parentElement;
    if (!el || !stage) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!pending) return;
      el.style.setProperty("--px", `${pending.x}%`);
      el.style.setProperty("--py", `${pending.y}%`);
      pending = null;
    };

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      pending = {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    stage.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      stage.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      {/* The ground plane, streaming toward the camera: yard lines move, the
          field doesn't end. A child translates rather than the background
          position animating, so the loop stays on the compositor. */}
      <div aria-hidden className="field-layer field-plane">
        <div className="field-plane-scroll" />
      </div>
      <div aria-hidden className="field-layer field-sweep" />

      <svg
        aria-hidden
        className="field-layer field-plays hidden sm:block"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {ROUTES.map((r) => (
          <g key={r.d} className={`play-tone-${r.tone}`}>
            <path
              d={r.d}
              pathLength={1}
              className="play-route"
              style={{ animationDelay: r.delay }}
            />
            <path d={r.tip} className="play-tip" style={{ animationDelay: r.delay }} />
          </g>
        ))}
        {OFFENSE.map(([x, y]) => (
          <circle key={`o${x}`} cx={x} cy={y} r={10} className="play-o" />
        ))}
        {DEFENSE.map(([x, y]) => (
          <path
            key={`x${x}`}
            d={`M${x - 8} ${y - 8} L${x + 8} ${y + 8} M${x + 8} ${y - 8} L${x - 8} ${y + 8}`}
            className="play-x"
          />
        ))}
      </svg>

      {/* Two passes spiralling across the field on long, staggered loops.
          The outer span carries the ball across; the inner one carries the
          arc and the tilt, so each moves on its own timing curve. */}
      <div aria-hidden className="field-layer overflow-hidden">
        <span className="ball-x ball-one">
          <span className="ball-y">
            <svg viewBox="-20 -14 40 28" className="h-7 w-10 sm:h-9 sm:w-12">
              <Football x={0} y={0} rx={17} />
            </svg>
          </span>
        </span>
        <span className="ball-x ball-two">
          <span className="ball-y">
            <svg viewBox="-20 -14 40 28" className="h-6 w-9 sm:h-8 sm:w-11">
              <Football x={0} y={0} rx={17} />
            </svg>
          </span>
        </span>
      </div>
      <div aria-hidden className="field-layer overflow-hidden">
        {MOTES.map((m) => (
          <span
            key={m.left}
            className="field-mote"
            style={{
              left: m.left,
              bottom: "12%",
              animationDelay: m.delay,
              animationDuration: m.duration,
            }}
          />
        ))}
      </div>
      <div aria-hidden ref={spotRef} className="field-layer field-spot" />
    </>
  );
}
