"use client";

/**
 * Counts a number up to its target over a short duration.
 *
 * Used on the completion screen: watching XP tick from 0 to 50 makes the
 * number feel earned in a way that rendering "50" instantly does not. It is
 * the cheapest possible reward animation and the one people actually watch.
 *
 * Driven by requestAnimationFrame rather than setInterval so it stays in step
 * with the display's refresh and pauses when the tab is backgrounded instead
 * of firing a burst of catch-up ticks when the learner returns.
 */

import { useEffect, useRef, useState } from "react";

/** Fast out of the gate, easing to a stop — a linear count reads as a spinner. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    // Respect the OS setting: land on the final number with no animation.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || target <= 0 || durationMs <= 0) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(easeOutCubic(t) * target));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs]);

  return value;
}
