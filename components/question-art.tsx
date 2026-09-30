/**
 * The big drawn object on a question card.
 *
 * These are louder than the course covers on purpose. A course cover is
 * atmosphere behind a title; a question card is a thing you are being invited
 * to pick up, so the object is the subject — chunky, lit, sitting in its own
 * pool of colour.
 *
 * Drawn rather than photographed for the same reason as the covers: freely
 * licensed football photography is almost universally carrying a brand or
 * team mark somewhere in frame, and these are a few hundred bytes each.
 *
 * Every colour is a theme token, so a palette change reaches all eight
 * without touching this file. Nothing here depicts a real player, team or
 * logo.
 */

import type { QuestionArt } from "@/lib/questions";

const VB = { w: 200, h: 150 };

type Tone = "turf" | "ice" | "gold";

/** Which accent each scene is lit with — keeps a grid of cards varied. */
export const ART_TONE: Record<QuestionArt, Tone> = {
  trophy: "gold",
  scoreboard: "ice",
  clipboard: "turf",
  stopwatch: "ice",
  routes: "turf",
  weather: "ice",
  depth: "turf",
  heat: "gold",
};

function tone(t: Tone) {
  return t === "turf"
    ? "var(--c-turf)"
    : t === "ice"
      ? "var(--c-ice)"
      : "var(--c-gold)";
}

/** The pool of light every object sits in. */
function Glow({ t, id }: { t: Tone; id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`qg-${id}`} cx="50%" cy="52%" r="62%">
          <stop offset="0%" stopColor={`rgb(${tone(t)})`} stopOpacity="0.42" />
          <stop offset="60%" stopColor={`rgb(${tone(t)})`} stopOpacity="0.12" />
          <stop offset="100%" stopColor={`rgb(${tone(t)})`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={VB.w} height={VB.h} fill={`url(#qg-${id})`} />
    </>
  );
}

function Trophy({ c }: { c: string }) {
  return (
    <g>
      {/* cup */}
      <path
        d="M70 40h60v22a30 30 0 0 1-60 0z"
        fill={`rgb(${c})`}
        opacity="0.9"
      />
      <path
        d="M70 44H58a14 14 0 0 0 14 14M130 44h12a14 14 0 0 1-14 14"
        stroke={`rgb(${c})`}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="93" y="90" width="14" height="16" fill={`rgb(${c})`} opacity="0.75" />
      <rect x="74" y="106" width="52" height="10" rx="3" fill={`rgb(${c})`} />
      {/* football sitting in the cup */}
      <ellipse cx="100" cy="52" rx="20" ry="13" fill="rgb(var(--c-night))" />
      <ellipse
        cx="100"
        cy="52"
        rx="20"
        ry="13"
        fill="none"
        stroke={`rgb(${c})`}
        strokeWidth="2.5"
      />
      <path
        d="M92 52h16M96 48v8M104 48v8"
        stroke={`rgb(${c})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* sparkles */}
      <path d="M44 34l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={`rgb(${c})`} opacity="0.8" />
      <path d="M158 62l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={`rgb(${c})`} opacity="0.55" />
    </g>
  );
}

function Scoreboard({ c }: { c: string }) {
  return (
    <g>
      <rect
        x="30"
        y="34"
        width="140"
        height="66"
        rx="8"
        fill="rgb(var(--c-night))"
        stroke={`rgb(${c})`}
        strokeWidth="3"
      />
      <rect x="30" y="34" width="140" height="16" rx="8" fill={`rgb(${c})`} opacity="0.25" />
      {/* two team rows */}
      <rect x="42" y="58" width="10" height="10" rx="2" fill={`rgb(${c})`} />
      <rect x="58" y="60" width="44" height="6" rx="3" fill={`rgb(${c})`} opacity="0.45" />
      <text
        x="152"
        y="68"
        textAnchor="end"
        fill={`rgb(${c})`}
        fontSize="16"
        fontWeight="700"
        fontFamily="monospace"
      >
        31
      </text>
      <rect x="42" y="78" width="10" height="10" rx="2" fill={`rgb(${c})`} opacity="0.5" />
      <rect x="58" y="80" width="36" height="6" rx="3" fill={`rgb(${c})`} opacity="0.3" />
      <text
        x="152"
        y="88"
        textAnchor="end"
        fill={`rgb(${c})`}
        opacity="0.6"
        fontSize="16"
        fontWeight="700"
        fontFamily="monospace"
      >
        24
      </text>
      {/* stand */}
      <rect x="94" y="100" width="12" height="16" fill={`rgb(${c})`} opacity="0.4" />
      <rect x="76" y="116" width="48" height="6" rx="3" fill={`rgb(${c})`} opacity="0.6" />
    </g>
  );
}

function Clipboard({ c }: { c: string }) {
  return (
    <g>
      <rect
        x="56"
        y="26"
        width="88"
        height="104"
        rx="8"
        fill="rgb(var(--c-night))"
        stroke={`rgb(${c})`}
        strokeWidth="3"
      />
      <rect x="86" y="18" width="28" height="14" rx="5" fill={`rgb(${c})`} />
      {/* play diagram */}
      <path
        d="M68 92h64"
        stroke={`rgb(${c})`}
        strokeWidth="2.5"
        opacity="0.5"
        strokeDasharray="5 5"
      />
      {[74, 88, 102, 116, 130].map((x) => (
        <circle key={x} cx={x} cy="92" r="3.5" fill={`rgb(${c})`} opacity="0.7" />
      ))}
      <path
        d="M102 88V62l-14-14"
        stroke={`rgb(${c})`}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M88 48l-2 9 9-2z" fill={`rgb(${c})`} />
      <path
        d="M130 88V70l12-14"
        stroke={`rgb(${c})`}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path d="M142 56l-1 9 8-3z" fill={`rgb(${c})`} opacity="0.65" />
      <path
        d="M70 112l10-10M70 102l10 10"
        stroke={`rgb(${c})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Stopwatch({ c }: { c: string }) {
  return (
    <g>
      <rect x="90" y="18" width="20" height="10" rx="3" fill={`rgb(${c})`} />
      <path d="M128 30l12-10 8 9-12 10z" fill={`rgb(${c})`} opacity="0.6" />
      <circle
        cx="100"
        cy="82"
        r="44"
        fill="rgb(var(--c-night))"
        stroke={`rgb(${c})`}
        strokeWidth="4"
      />
      <circle cx="100" cy="82" r="34" fill="none" stroke={`rgb(${c})`} strokeWidth="1.5" opacity="0.3" />
      {/* the swept arc — the part that says "clock running" */}
      <path
        d="M100 40a42 42 0 0 1 36 21"
        stroke={`rgb(${c})`}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M100 82l22-16"
        stroke={`rgb(${c})`}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="100" cy="82" r="5" fill={`rgb(${c})`} />
      {[0, 90, 180, 270].map((deg) => (
        <rect
          key={deg}
          x="99"
          y="44"
          width="2.5"
          height="8"
          rx="1"
          fill={`rgb(${c})`}
          opacity="0.7"
          transform={`rotate(${deg} 100 82)`}
        />
      ))}
    </g>
  );
}

function Routes({ c }: { c: string }) {
  return (
    <g>
      {/* line of scrimmage */}
      <path d="M20 118h160" stroke={`rgb(${c})`} strokeWidth="2.5" opacity="0.35" />
      <circle cx="100" cy="118" r="6" fill={`rgb(${c})`} />
      {/* route tree */}
      <path
        d="M100 118V72l-40-24"
        stroke={`rgb(${c})`}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M60 48l1 11 10-4z" fill={`rgb(${c})`} />
      <path
        d="M100 118V84h38"
        stroke={`rgb(${c})`}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path d="M138 84l-8-5v10z" fill={`rgb(${c})`} opacity="0.72" />
      <path
        d="M100 118V56"
        stroke={`rgb(${c})`}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
        strokeDasharray="7 6"
      />
      <path d="M100 30l-6 12h12z" fill={`rgb(${c})`} opacity="0.45" />
      <path
        d="M100 118V98l-28 18"
        stroke={`rgb(${c})`}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path d="M72 116l10-3-3 10z" fill={`rgb(${c})`} opacity="0.55" />
    </g>
  );
}

function Weather({ c }: { c: string }) {
  return (
    <g>
      {/* dome */}
      <path
        d="M34 104a66 52 0 0 1 132 0z"
        fill="rgb(var(--c-night))"
        stroke={`rgb(${c})`}
        strokeWidth="3.5"
      />
      <path
        d="M100 52v52M56 82a52 52 0 0 1 88 0M34 104h132"
        stroke={`rgb(${c})`}
        strokeWidth="2"
        opacity="0.35"
        fill="none"
      />
      {/* sun on the open half, rain on the closed half */}
      <circle cx="52" cy="38" r="12" fill={`rgb(${c})`} opacity="0.85" />
      {[0, 45, 90, 135].map((deg) => (
        <rect
          key={deg}
          x="51"
          y="18"
          width="2.5"
          height="7"
          rx="1.2"
          fill={`rgb(${c})`}
          opacity="0.6"
          transform={`rotate(${deg} 52 38)`}
        />
      ))}
      <path
        d="M128 32h28a13 13 0 0 1 0 26h-28a13 13 0 0 1 0-26z"
        fill={`rgb(${c})`}
        opacity="0.28"
      />
      {[132, 146, 160].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${62 + i * 2}l-4 12`}
          stroke={`rgb(${c})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      <rect x="30" y="104" width="140" height="8" rx="4" fill={`rgb(${c})`} opacity="0.5" />
    </g>
  );
}

function Depth({ c }: { c: string }) {
  const bars = [
    { y: 30, w: 118, o: 1 },
    { y: 52, w: 96, o: 0.78 },
    { y: 74, w: 70, o: 0.56 },
    { y: 96, w: 44, o: 0.36 },
  ];
  return (
    <g>
      {bars.map((b) => (
        <g key={b.y}>
          <circle cx="42" cy={b.y + 8} r="8" fill={`rgb(${c})`} opacity={b.o} />
          <rect
            x="58"
            y={b.y}
            width={b.w}
            height="16"
            rx="8"
            fill={`rgb(${c})`}
            opacity={b.o * 0.55}
          />
          <rect x="58" y={b.y} width={b.w * 0.12} height="16" rx="8" fill={`rgb(${c})`} opacity={b.o} />
        </g>
      ))}
      <path d="M30 122h140" stroke={`rgb(${c})`} strokeWidth="2" opacity="0.3" />
    </g>
  );
}

function Heat({ c }: { c: string }) {
  // A 6x4 grid of weeks, hot cells clustered — a streak you can see.
  const cells: { x: number; y: number; o: number }[] = [];
  const heat = [
    [0.15, 0.3, 0.9, 1, 0.85, 0.25],
    [0.2, 0.55, 1, 0.75, 0.3, 0.15],
    [0.9, 0.35, 0.2, 0.45, 0.95, 0.6],
    [0.25, 0.15, 0.4, 0.2, 0.3, 0.85],
  ];
  heat.forEach((row, r) =>
    row.forEach((o, i) => cells.push({ x: 34 + i * 23, y: 34 + r * 23, o })),
  );
  return (
    <g>
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width="18"
          height="18"
          rx="4"
          fill={`rgb(${c})`}
          opacity={0.1 + cell.o * 0.85}
        />
      ))}
      {/* flame on the hottest run */}
      <path
        d="M104 18c4 9-7 12-7 20a10 10 0 0 0 20 0c0-4-2-6-2-6s5 3 5 10a14 14 0 0 1-28 0c0-10 10-15 12-24z"
        fill={`rgb(${c})`}
        opacity="0.95"
      />
    </g>
  );
}

const SCENES: Record<QuestionArt, (p: { c: string }) => JSX.Element> = {
  trophy: Trophy,
  scoreboard: Scoreboard,
  clipboard: Clipboard,
  stopwatch: Stopwatch,
  routes: Routes,
  weather: Weather,
  depth: Depth,
  heat: Heat,
};

export default function QuestionArt({
  art,
  className = "",
}: {
  art: QuestionArt;
  className?: string;
}) {
  const t = ART_TONE[art];
  const Scene = SCENES[art];
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className={className}
      role="presentation"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <Glow t={t} id={art} />
      <Scene c={tone(t)} />
    </svg>
  );
}
