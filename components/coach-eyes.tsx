"use client";

/**
 * Coach watches you. One pointer listener for the whole page moves the
 * pupils of every Coach on screen toward the pointer, a couple of units at
 * most, so he looks at what you're doing instead of staring past it.
 *
 * Each Coach with open eyes carries `data-coach-eyes` ("left" when he's
 * mirrored, so the x is flipped back); this sets `--lx` / `--ly` on it, and
 * cast.module.css's `.track` reads them. Coach himself stays a plain server
 * component with no state. At most one update a frame, nothing at all when
 * the pointer is still, and off under reduced motion and on touch screens
 * (there's no pointer to follow, and a tap would make him jump).
 */

import { useEffect } from "react";

const REACH = 2.4; // viewBox units the pupils may travel
const NEAR = 520; // px: beyond this he only glances

export default function CoachEyes() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;

    const update = () => {
      frame = 0;
      const all = document.querySelectorAll<SVGSVGElement>("svg[data-coach-eyes]");
      all.forEach((svg) => {
        const box = svg.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight || !box.width) return;
        // His eyes sit about 40% of the way down the figure.
        const dx = px - (box.left + box.width / 2);
        const dy = py - (box.top + box.height * 0.4);
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(1, dist / NEAR) * 0.6 + 0.4;
        const flip = svg.dataset.coachEyes === "left" ? -1 : 1;
        svg.style.setProperty("--lx", `${((dx / dist) * REACH * pull * flip).toFixed(2)}px`);
        svg.style.setProperty("--ly", `${((dy / dist) * REACH * 0.8 * pull).toFixed(2)}px`);
      });
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLeave = () => {
      document.querySelectorAll<SVGSVGElement>("svg[data-coach-eyes]").forEach((svg) => {
        svg.style.removeProperty("--lx");
        svg.style.removeProperty("--ly");
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
