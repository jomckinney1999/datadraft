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
      <div aria-hidden className="field-layer field-turf" />
      <div aria-hidden className="field-layer field-sweep" />
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
