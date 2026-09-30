"use client";

/**
 * A grid whose `.glow-card` children light up under the pointer.
 *
 * One listener on the grid rather than one per card: the pointer's position
 * inside whichever card it is over is written straight onto that card as two
 * custom properties (--mx, --my), which `.glow-card::before` reads for its
 * radial light. No React state, so moving across six cards costs six style
 * writes a frame at most, coalesced through rAF, and never a re-render.
 *
 * Everything else about the hover — the lift, the ring of light, the glow
 * underneath — is plain CSS and works without this. This only adds the light
 * that follows the cursor, and it stays off under prefers-reduced-motion.
 */

import { useEffect, useRef, type ReactNode } from "react";

export default function GlowGrid({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: { card: HTMLElement; x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!pending) return;
      pending.card.style.setProperty("--mx", `${pending.x}px`);
      pending.card.style.setProperty("--my", `${pending.y}px`);
      pending = null;
    };

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>(".glow-card");
      if (!card || !grid.contains(card)) return;
      const r = card.getBoundingClientRect();
      pending = { card, x: e.clientX - r.left, y: e.clientY - r.top };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    grid.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      grid.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
