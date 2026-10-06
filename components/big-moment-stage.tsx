"use client";

/**
 * The big moments, drawn (see lib/big-moments.ts for what earns which).
 *
 * Each one is a short broadcast stinger over the page that earned it, in the
 * kit the title screen's referee set: chunky outlined shapes, a held pose
 * and a snap rather than a tween, a word that stamps in, and a sound
 * synthesised on the spot.
 *
 *   touchdown — goalposts rise, the ref pops up signalling it, TOUCHDOWN!
 *   game-ball — a ball spins down onto a tee, lands with a thump, and the
 *               unit's name and today's date are painted on its stripe.
 *   bucket    — a cooler swings in over Coach, tips, and the pour washes
 *               down the whole screen; he comes out of it drenched, then
 *               flexing.
 *   promoted  — the depth chart: your magnet lifts off the rank you held and
 *               snaps up a row, and the new rank gets circled in chalk.
 *
 * Things to keep true:
 *   - Any key or tap skips it (after a beat, so the click that earned it
 *     doesn't), and the key is swallowed: the lesson's → shouldn't move on
 *     to the next lesson behind the stinger.
 *   - Every element's resting CSS is its finished pose; entrances live only
 *     in keyframes. That is what lets reduced motion switch every animation
 *     off and still show a complete picture (held briefly, then faded).
 *   - Phones get no screen shake and no spinning rays (see the title gate).
 *   - Screen readers get one line in a status region; the drawing is hidden.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Coach from "@/components/coach";
import { RefereeTouchdown } from "@/components/referee";
import { c, N } from "@/components/art-kit";
import {
  MOMENT_HOLD,
  MOMENT_HOLD_REDUCED,
  MOMENT_OUT,
  paintedDate,
  type Moment,
  type MomentKind,
} from "@/lib/big-moments";
import { playSfx, type SfxKind } from "@/lib/sfx";
import css from "./big-moment.module.css";

/** Sound cues, in ms from the start. The CSS beats are timed to these. */
const CUES: Record<MomentKind, [number, SfxKind][]> = {
  touchdown: [
    [0, "whistle"],
    [300, "roar"],
    [380, "touchdown"],
  ],
  "game-ball": [
    [800, "thump"],
    [1250, "roar"],
    [1350, "unlock"],
  ],
  bucket: [
    [0, "roar"],
    [950, "splash"],
    [2150, "complete"],
  ],
  promoted: [
    [700, "ui"],
    [1150, "clack"],
    [1300, "unlock"],
  ],
};

const SKIP_AFTER = 350;

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function BigMomentStage({ moment, onDone }: { moment: Moment; onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "out">("in");
  const leaving = useRef(false);
  const started = useRef(0);
  // One array for the whole life of the stage (emptied, never replaced), so
  // the unmount cleanup always clears whatever is pending.
  const timers = useRef<number[]>([]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    for (const t of timers.current.splice(0)) window.clearTimeout(t);
    timers.current.push(window.setTimeout(() => doneRef.current(), MOMENT_OUT));
    setPhase("out");
  }, []);

  useEffect(() => {
    started.current = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? MOMENT_HOLD_REDUCED : MOMENT_HOLD[moment.kind];
    timers.current.push(window.setTimeout(leave, hold));
    // Reduced motion keeps the sound: a cue isn't motion (as on the title
    // screen), but it plays at once rather than on beats nobody can see.
    for (const [at, kind] of CUES[moment.kind]) {
      timers.current.push(window.setTimeout(() => playSfx(kind), reduced ? Math.min(at, 150) : at));
    }
    const list = timers.current;
    return () => {
      for (const t of list.splice(0)) window.clearTimeout(t);
    };
  }, [moment.kind, leave]);

  // Capture-phase, so it runs before any page's own key handler, and
  // swallow the key: the lesson's → shouldn't skip a lesson behind this.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (performance.now() - started.current > SKIP_AFTER) leave();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [leave]);

  const onPointer = () => {
    if (performance.now() - started.current > SKIP_AFTER) leave();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={css.root} data-kind={moment.kind} data-phase={phase} onPointerDown={onPointer}>
      <p role="status" className="sr-only">
        {moment.headline} {moment.sub}
      </p>
      <div aria-hidden className={css.backdrop} />
      <div aria-hidden className={css.rays} />
      <div aria-hidden className={css.stage}>
        <Headline text={moment.headline} />
        {moment.kind === "touchdown" && <TouchdownArt />}
        {moment.kind === "game-ball" && <GameBallArt painted={moment.painted ?? moment.sub ?? ""} />}
        {moment.kind === "bucket" && <BucketArt />}
        {moment.kind === "promoted" && moment.chart && <DepthChartArt rows={moment.chart.rows} to={moment.chart.to} />}
        {moment.sub && <p className={css.sub}>{moment.sub}</p>}
      </div>
      {moment.kind === "bucket" && <Pour />}
      <Confetti />
      <div aria-hidden className={css.wipe}>
        <i />
        <i />
        <i />
      </div>
      <p aria-hidden className={css.skip}>
        Tap or press any key
      </p>
    </div>,
    document.body,
  );
}

/** The word, one stamped letter at a time, each landing at its own tilt. */
function Headline({ text }: { text: string }) {
  return (
    <p className={css.headline}>
      {Array.from(text).map((ch, i) => (
        <span key={i} style={{ "--i": i, "--r": `${((i * 47) % 30) - 15}deg` } as Vars}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </p>
  );
}

/** Thirty pieces, placed by index (never at random) in the three accents. */
function Confetti() {
  const tones = ["var(--c-gold)", "var(--c-turf)", "var(--c-ice)"];
  return (
    <div aria-hidden className={css.confetti}>
      {Array.from({ length: 30 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--x": `${(i * 37 + 5) % 100}%`,
              "--d": `${(i % 8) * 70}ms`,
              "--dur": `${1400 + ((i * 53) % 700)}ms`,
              "--sway": `${((i * 29) % 120) - 60}px`,
              "--spin": `${((i * 97) % 720) - 360}deg`,
              "--c": tones[i % 3],
            } as Vars
          }
          data-round={i % 4 === 0 ? "" : undefined}
        />
      ))}
    </div>
  );
}

/* ── touchdown ───────────────────────────────────────────────────────── */

function TouchdownArt() {
  return (
    <div className={css.tdArt}>
      <svg viewBox="0 0 240 200" className={css.posts}>
        {/* drawn twice: a wide night stroke, then the gold on top */}
        {[
          { s: N, w: 15 },
          { s: c("gold"), w: 8 },
        ].map(({ s, w }) => (
          <path
            key={w}
            d="M120 200 V118 M34 118 H206 M34 118 V8 M206 118 V8"
            fill="none"
            stroke={s}
            strokeWidth={w}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <path d="M206 8 L226 14 L206 22 Z" fill={c("ice")} stroke={N} strokeWidth="3" strokeLinejoin="round" className={css.flag} />
      </svg>
      <RefereeTouchdown className={css.ref} />
    </div>
  );
}

/* ── game ball ───────────────────────────────────────────────────────── */

const BALL = "M30 124 Q160 -4 290 124 Q160 252 30 124 Z";

function GameBallArt({ painted }: { painted: string }) {
  // Fit the unit's name on the stripe: shrink to 12px, then squeeze.
  const size = Math.max(12, Math.min(22, Math.floor(220 / Math.max(1, painted.length * 0.6))));
  const squeeze = painted.length * size * 0.6 > 214;
  return (
    <div className={css.ballArt}>
      <svg viewBox="0 0 320 250" overflow="visible" className={css.ballSvg}>
        <defs>
          <clipPath id="bm-ball">
            <path d={BALL} />
          </clipPath>
        </defs>
        <ellipse cx="160" cy="236" rx="96" ry="9" fill={N} opacity="0.5" className={css.ballShadow} />
        {/* the tee */}
        <path d="M128 238 L138 214 H182 L192 238 Z" fill={c("ice")} stroke={N} strokeWidth="4" strokeLinejoin="round" className={css.tee} />
        <g className={css.ballDrop}>
          <g className={css.ballSpin}>
            <path d={BALL} fill={c("gold-dim")} stroke={N} strokeWidth="5" strokeLinejoin="round" />
            <g clipPath="url(#bm-ball)">
              <path d="M30 124 Q160 20 290 124" fill="none" stroke={c("gold")} strokeWidth="10" opacity="0.35" />
              {/* the painted stripe and what's painted on it */}
              <g className={css.paint}>
                <rect x="20" y="108" width="280" height="50" fill={c("ink")} />
                <rect x="20" y="108" width="280" height="50" fill="none" stroke={N} strokeWidth="3" />
              </g>
            </g>
            <path d="M74 84 Q62 124 74 164 M246 84 Q258 124 246 164" fill="none" stroke={c("ink")} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <path d="M126 70 H194" stroke={c("ink")} strokeWidth="5" strokeLinecap="round" />
            {[134, 147, 160, 173, 186].map((x) => (
              <path key={x} d={`M${x} 62 V78`} stroke={c("ink")} strokeWidth="4" strokeLinecap="round" />
            ))}
            <g className={css.paintText}>
              <text
                x="160"
                y="133"
                textAnchor="middle"
                fontSize={size}
                fontWeight="800"
                fontStyle="italic"
                fill={N}
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                {...(squeeze ? { textLength: 214, lengthAdjust: "spacingAndGlyphs" } : {})}
              >
                {painted}
              </text>
              <text x="160" y="151" textAnchor="middle" fontSize="11" fontWeight="700" fill={N} letterSpacing="2" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                {paintedDate()}
              </text>
            </g>
          </g>
        </g>
      </svg>
      <Coach mood="clap" size={120} className={css.ballCoach} />
    </div>
  );
}

/* ── the bucket ──────────────────────────────────────────────────────── */

function BucketArt() {
  return (
    <div className={css.bucketArt}>
      <div className={css.coachSpot}>
        <Coach mood="cheer" size={200} className={css.coachA} />
        <Coach mood="surprised" size={200} className={css.coachB} />
        <Coach mood="flex" size={200} className={css.coachC} />
        <svg viewBox="0 0 200 200" className={css.drench} overflow="visible">
          <ellipse cx="100" cy="196" rx="74" ry="10" fill={c("ice", 0.55)} stroke={N} strokeWidth="3" className={css.puddle} />
          {[
            [58, 70, 0],
            [140, 60, 180],
            [80, 118, 360],
            [126, 132, 90],
            [104, 40, 270],
          ].map(([x, y, d]) => (
            <path
              key={`${x}${y}`}
              d={`M${x} ${y} q-5 9 0 12 q5 -3 0 -12 Z`}
              fill={c("ice")}
              stroke={N}
              strokeWidth="2"
              className={css.drip}
              style={{ "--d": `${d}ms` } as Vars}
            />
          ))}
        </svg>
      </div>
      <svg viewBox="0 0 170 150" className={css.cooler} overflow="visible">
        {/* the cooler, its lid off, full to the brim */}
        <path d="M22 40 H148 L138 136 Q137 144 129 144 H41 Q33 144 32 136 Z" fill={c("gold")} stroke={N} strokeWidth="5" strokeLinejoin="round" />
        <path d="M30 70 H140" stroke={c("gold-dim")} strokeWidth="8" />
        <path d="M30 70 H140" stroke={N} strokeWidth="2.5" opacity="0.5" />
        <rect x="16" y="30" width="138" height="16" rx="5" fill={c("ice")} stroke={N} strokeWidth="5" />
        <path d="M40 30 Q60 18 80 30 Q100 20 120 30" fill={c("ice")} stroke={N} strokeWidth="3" strokeLinejoin="round" />
        <path d="M8 76 Q-2 90 14 100 M162 76 Q172 90 156 100" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" />
        {/* the gloved hands of whoever's holding it */}
        <circle cx="10" cy="88" r="11" fill={c("ink")} stroke={N} strokeWidth="4" />
        <circle cx="160" cy="88" r="11" fill={c("ink")} stroke={N} strokeWidth="4" />
      </svg>
    </div>
  );
}

/** The pour: one sheet with wavy edges and ice cubes, falling past the screen. */
function Pour() {
  const cubes = [
    [12, 18, 20],
    [34, 40, -25],
    [58, 22, 40],
    [80, 46, -10],
    [22, 66, 15],
    [68, 72, -35],
    [90, 14, 30],
    [46, 86, -15],
  ];
  return (
    <div aria-hidden className={css.pour}>
      <div className={css.pourSheet}>
        <svg viewBox="0 0 100 140" preserveAspectRatio="none" className={css.pourSvg}>
          <path
            d="M0 10 Q6 2 12 8 T24 8 T36 8 T48 8 T60 8 T72 8 T84 8 T100 8 V130 Q94 138 88 132 T76 132 T64 132 T52 132 T40 132 T28 132 T16 132 T0 132 Z"
            fill={c("ice", 0.86)}
            stroke={N}
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {[8, 21, 33, 47, 62, 74, 88].map((x, i) => (
            <path
              key={x}
              d={`M${x} ${16 + (i % 3) * 6} V${100 + (i % 4) * 7}`}
              stroke={c("ink", 0.35)}
              strokeWidth="5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {cubes.map(([x, y, r]) => (
          <i key={`${x}-${y}`} className={css.cube} style={{ left: `${x}%`, top: `${y}%`, "--r": `${r}deg` } as Vars} />
        ))}
      </div>
    </div>
  );
}

/* ── the depth chart ─────────────────────────────────────────────────── */

function DepthChartArt({ rows, to }: { rows: string[]; to: number }) {
  const from = rows.length - 1;
  const rowY = (i: number) => 86 + i * 50;
  return (
    <div className={css.chartArt}>
      <svg viewBox="0 0 320 240" overflow="visible" className={css.board}>
        <rect x="8" y="8" width="304" height="224" rx="14" fill={c("panel")} stroke={N} strokeWidth="5" />
        <rect x="18" y="18" width="284" height="204" rx="8" fill="none" stroke={c("panel-border")} strokeWidth="2" />
        <text x="30" y="46" fontSize="13" fontWeight="700" letterSpacing="3" fill={c("ink-soft")} style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
          ROSTER MOVES
        </text>
        {/* X's and O's in the corner, as every whiteboard has */}
        <g fill="none" stroke={c("ink-muted")} strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <path d="M246 34 l10 10 m0 -10 l-10 10 M270 34 l10 10 m0 -10 l-10 10" />
          <circle cx="263" cy="58" r="5.5" />
          <circle cx="287" cy="58" r="5.5" />
          <path d="M251 50 q4 12 12 2" />
        </g>
        {rows.map((name, i) => (
          <g key={name} className={i === from && from !== to ? css.oldRow : undefined}>
            <path d={`M30 ${rowY(i) + 18} H290`} stroke={c("panel-border")} strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="52" cy={rowY(i)} r="17" fill="none" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="4 4" />
            <text
              x="84"
              y={rowY(i) + 7}
              fontSize="21"
              fontWeight="700"
              fill={i === to ? c("ink") : c("ink-soft")}
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              {name}
            </text>
            {i < to && (
              <text x="288" y={rowY(i) + 6} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="2" fill={c("ink-muted")} style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                NEXT
              </text>
            )}
          </g>
        ))}
        {/* chalk circle round the new rank */}
        <ellipse
          cx="182"
          cy={rowY(to)}
          rx="104"
          ry="24"
          fill="none"
          stroke={c("gold")}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          transform={`rotate(-2 182 ${rowY(to)})`}
          className={css.chalk}
        />
        {/* your magnet, drawn where it ends up and animated up from below */}
        <g className={css.magnet} style={{ "--from": `${rowY(from) - rowY(to)}px` } as Vars}>
          <circle cx="52" cy={rowY(to)} r="18" fill={c("gold")} stroke={N} strokeWidth="4" />
          <text x="52" y={rowY(to) + 5} textAnchor="middle" fontSize="12" fontWeight="800" fill={N} style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
            YOU
          </text>
        </g>
      </svg>
      <Coach mood="point" facing="left" size={120} className={css.chartCoach} />
    </div>
  );
}
