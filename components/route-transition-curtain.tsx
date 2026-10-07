"use client";

/**
 * The page transitions' drawings (lib/route-transition.ts says which link
 * gets which; components/route-transition.tsx runs them).
 *
 *   snap  — a broadcast replay wipe: a football spirals across the screen
 *           trailing gold, ice and turf stripes, the curtain behind it covers
 *           the page, and on the way out the trailing stripes sweep off onto
 *           the question. The whole train is one skewed strip moving in vw,
 *           so it covers any screen shape with nothing to measure.
 *   chart — a bar chart grows out of the floor to a rising trend (the line
 *           draws across the bar tops), then every bar floods to full height
 *           and covers the page; on the way out the bars shoot off the top
 *           one after another, like a chart refreshing onto your league.
 *
 * While the curtain is up, a sticker names where you're going, so a slow
 * network reads as a held beat rather than a stuck screen. Transforms and
 * opacity only (no mask animations, which stall mobile Safari). Never shown
 * under reduced motion: the link navigates plainly instead.
 */

import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { c, Football, N } from "@/components/art-kit";
import { playSfx } from "@/lib/sfx";
import type { TransitionKind } from "@/lib/route-transition";
import css from "./route-transition.module.css";

export type CurtainProps = { kind: TransitionKind; label: string; phase: "cover" | "reveal" };

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** A league that's getting better: the chart the bars draw before they flood. */
const BARS = [0.38, 0.6, 0.5, 0.72, 0.58, 0.84, 0.7, 0.93];
const BAR_TONES = ["turf", "ice", "gold", "turf", "ice", "gold", "turf", "gold"] as const;

export default function RouteTransitionCurtain({ kind, label, phase }: CurtainProps) {
  useEffect(() => {
    playSfx("whoosh");
    if (kind === "chart") {
      const t = window.setTimeout(() => playSfx("first_down"), 160);
      return () => window.clearTimeout(t);
    }
  }, [kind]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className={css.root} data-kind={kind} data-phase={phase} aria-hidden>
      {kind === "snap" ? <Snap /> : <Chart />}
      <div className={css.label}>
        <span className={css.labelIcon}>{kind === "snap" ? <QuestionMark /> : <Ball />}</span>
        <span>
          <span className={css.kicker}>{kind === "snap" ? "Blue 42 · hut!" : "Pulling the numbers"}</span>
          <span className={css.labelText}>{label}</span>
        </span>
      </div>
    </div>,
    document.body,
  );
}

function Snap() {
  return (
    <div className={css.train}>
      <div className={css.strip}>
        <i data-tone="gold" />
        <i data-tone="ice" />
        <i data-tone="turf" />
        <b className={css.fill} />
        <i data-tone="turf" />
        <i data-tone="ice" />
        <i data-tone="gold" />
      </div>
      <div className={css.ball}>
        <svg viewBox="-20 -14 40 28" className={css.ballSpin}>
          <Football x={0} y={0} rx={18} rot={-20} fill={c("gold-dim")} />
        </svg>
        <span className={css.trail} />
      </div>
    </div>
  );
}

function Chart() {
  // Bar tops in the trend line's 0-100 space: a bar is 104% tall from 2%
  // below the floor, so its top sits at 102 - 104h.
  const points = BARS.map((h, i) => `${6.25 + i * 12.5},${(102 - 104 * h).toFixed(1)}`).join(" ");
  return (
    <>
      <div className={css.bars}>
        {BARS.map((h, i) => (
          <i key={i} data-tone={BAR_TONES[i]} style={{ "--h": h, "--i": i } as Vars} />
        ))}
      </div>
      {/* The trend line wipes on left to right (a clip, not a dash: dashes
          and a stretched viewBox disagree about length), reaching each bar
          as it reaches its height. */}
      <div className={css.trend}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={N}
            strokeWidth="9"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={points}
            fill="none"
            stroke={c("ink")}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </>
  );
}

function QuestionMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full">
      <path
        d="M8 4 H24 A5 5 0 0 1 29 9 V17 A5 5 0 0 1 24 22 H14 L8 28 V22 A5 5 0 0 1 3 17 V9 A5 5 0 0 1 8 4 Z"
        fill={c("gold")}
        stroke={N}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <text x="16" y="18.6" textAnchor="middle" fontSize="15" fontWeight="800" fill={N} style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
        ?
      </text>
    </svg>
  );
}

function Ball() {
  return (
    <svg viewBox="-17 -13 34 26" className="h-full w-full">
      <Football x={0} y={0} rx={15} rot={-18} fill={c("gold")} />
    </svg>
  );
}
