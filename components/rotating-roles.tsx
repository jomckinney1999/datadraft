"use client";

import { useEffect, useState } from "react";

/**
 * Cycles the job title in the hero to show the same skills open several doors.
 *
 * The trailing period lives *inside* the absolutely positioned role (and the
 * width reserve) so it never floats out at the end of the longest title while
 * a shorter one is showing.
 *
 * Accessibility: the animation is decorative, so the rotating word is hidden
 * from assistive tech and the full list is exposed once as static text. It
 * also honours prefers-reduced-motion by holding on the first role rather
 * than animating — a looping element is a real problem for some vestibular
 * and attention conditions.
 */

export const ROLES = [
  "data analyst",
  "analytics engineer",
  "BI analyst",
  "data scientist",
  "business analyst",
  "data engineer",
];

const INTERVAL_MS = 2200;
const LONGEST = "analytics engineer";

export default function RotatingRoles() {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let swapTimer: number;
    const tick = window.setInterval(() => {
      setLeaving(true);
      swapTimer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length);
        setLeaving(false);
      }, 260);
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(swapTimer);
    };
  }, []);

  return (
    <span className="relative inline-block align-baseline">
      {/* Reserves the width of the longest role + period so the line never reflows. */}
      <span aria-hidden className="invisible whitespace-nowrap">
        {LONGEST}.
      </span>

      <span
        aria-hidden
        className={`absolute left-0 top-0 whitespace-nowrap text-gold transition-all duration-[260ms] ease-out ${
          leaving
            ? "-translate-y-1 opacity-0 blur-[1px]"
            : "translate-y-0 opacity-100 blur-0"
        }`}
      >
        {ROLES[index]}.
      </span>

      <span className="sr-only">
        {ROLES.slice(0, -1).join(", ")}, or {ROLES[ROLES.length - 1]}.
      </span>
    </span>
  );
}
