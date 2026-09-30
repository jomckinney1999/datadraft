/**
 * The drawing kit behind every picture on the site's cards — questions,
 * courses and projects.
 *
 * One kit so the three sets read as one system: the same pool of coloured
 * light with faint broadcast rays behind every object, the same chunky
 * sticker shapes with a dark outline, the same football, the same player.
 * A course card and a question card that sit side by side on the dashboard
 * should look like they came from the same hand.
 *
 * Rules every scene follows, wherever it lives:
 *
 * - **Drawn, never photographed.** Freely licensed football photography
 *   nearly always has a brand or team mark somewhere in frame (see CLAUDE.md,
 *   Course imagery).
 * - **Every colour is a theme token**, via `c()`. Never a hex.
 * - **Figures wear a position, never a number.** A number is one step from
 *   a real person.
 * - **Anything computed with trig is rounded** (`r1`) before it reaches an
 *   attribute. These render on the server and hydrate on the client, and
 *   `Math.cos` is allowed to differ in its last bit between engines.
 * - **Gradient ids are namespaced by the caller** — question scenes use
 *   their bare key, courses `c-`, projects `p-` — because SVG ids are
 *   global to the document and two different glows sharing an id would paint
 *   one card with the other card's colour.
 */

import type { ReactNode } from "react";

export const VB = { w: 200, h: 150 };

export type Tone = "turf" | "ice" | "gold";

export const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** A theme token as a colour, optionally with alpha. Never a hex. */
export const c = (token: string, alpha?: number) =>
  alpha === undefined
    ? `rgb(var(--c-${token}))`
    : `rgb(var(--c-${token}) / ${alpha})`;

export const N = c("night");

/** Round so server and client print identical attribute strings. */
export const r1 = (v: number) => Math.round(v * 10) / 10;

// ── Shared pieces ────────────────────────────────────────────────

/** The pool of light every object sits in, plus faint broadcast rays. */
/**
 * The glow and rays are drawn well past the 200×150 viewBox on purpose. A
 * card wider than 4:3 letterboxes the scene (`meet`), and a glow that stopped
 * at the viewBox then read as a soft box floating in the middle of the card.
 * Drawn wide, the rays run to whatever edge the card has; the <svg> element's
 * own box clips them, so nothing spills past the picture.
 */
export function Glow({ t, id }: { t: Tone; id: string }) {
  const L = 420;
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a0 = ((i * 30 - 5) * Math.PI) / 180;
    const a1 = ((i * 30 + 5) * Math.PI) / 180;
    return `M100 78 L${r1(100 + L * Math.cos(a0))} ${r1(78 + L * Math.sin(a0))} L${r1(100 + L * Math.cos(a1))} ${r1(78 + L * Math.sin(a1))} Z`;
  });
  return (
    <>
      <defs>
        {/* Same ellipse the old bounding-box gradient drew (124 × 93 about
            the centre), now in user space so the fill rect can be any size. */}
        <radialGradient
          id={`qg-${id}`}
          gradientUnits="userSpaceOnUse"
          cx="100"
          cy="78"
          r="124"
          gradientTransform="translate(0 19.5) scale(1 0.75)"
        >
          <stop offset="0%" stopColor={c(t)} stopOpacity="0.45" />
          <stop offset="60%" stopColor={c(t)} stopOpacity="0.12" />
          <stop offset="100%" stopColor={c(t)} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-300} y={-150} width={800} height={450} fill={`url(#qg-${id})`} />
      <g fill={c(t)} opacity="0.07">
        {rays.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </>
  );
}

export function Shadow({ x = 100, y = 130, rx = 48 }: { x?: number; y?: number; rx?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={r1(rx * 0.16)} fill={N} opacity="0.55" />;
}

export function Sparkle({
  x,
  y,
  r = 6,
  fill = c("ink"),
}: {
  x: number;
  y: number;
  r?: number;
  fill?: string;
}) {
  const k = r * 0.3;
  return (
    <path
      d={`M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k} Z`}
      fill={fill}
    />
  );
}

/** A football, pointed at both ends, laces up. */
export function Football({
  x,
  y,
  rx = 16,
  rot = 0,
  fill = c("gold-dim"),
}: {
  x: number;
  y: number;
  rx?: number;
  rot?: number;
  fill?: string;
}) {
  const ry = rx * 0.62;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M${-rx} 0 Q0 ${-ry * 2} ${rx} 0 Q0 ${ry * 2} ${-rx} 0 Z`}
        fill={fill}
        stroke={N}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d={`M${-rx * 0.62} ${-ry * 0.55} Q${-rx * 0.7} 0 ${-rx * 0.62} ${ry * 0.55}`}
        fill="none"
        stroke={c("ink", 0.85)}
        strokeWidth="1.4"
      />
      <path
        d={`M${rx * 0.62} ${-ry * 0.55} Q${rx * 0.7} 0 ${rx * 0.62} ${ry * 0.55}`}
        fill="none"
        stroke={c("ink", 0.85)}
        strokeWidth="1.4"
      />
      <path
        d={`M${-rx * 0.34} 0 H${rx * 0.34}`}
        stroke={c("ink")}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {[-0.22, 0, 0.22].map((k) => (
        <path
          key={k}
          d={`M${rx * k} ${-ry * 0.26} V${ry * 0.26}`}
          stroke={c("ink")}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export type Pose = "throw" | "catch" | "stand";

/**
 * A player, feet at (x, y). Wears a position on his chest, never a number —
 * a number is one step from a real person.
 */
export function Player({
  x,
  y,
  s = 1,
  pose,
  jersey,
  label,
}: {
  x: number;
  y: number;
  s?: number;
  pose: Pose;
  jersey: string;
  label: string;
}) {
  const J = c(jersey);
  const legs =
    pose === "catch"
      ? ["M-6 -38 L-15 -20 L-9 -5", "M6 -38 L16 -24 L24 -12"]
      : ["M-7 -38 L-11 -4", "M7 -38 L11 -4"];
  const feet: [number, number][] =
    pose === "catch"
      ? [
          [-9, -3],
          [25, -10],
        ]
      : [
          [-12, -2],
          [12, -2],
        ];
  const arms =
    pose === "throw"
      ? ["M15 -66 L27 -80 L22 -99", "M-15 -66 L-32 -70"]
      : pose === "catch"
        ? ["M-14 -68 L-20 -95", "M14 -68 L20 -95"]
        : ["M-16 -66 L-22 -42", "M16 -66 L22 -42"];
  const hands: [number, number][] =
    pose === "throw"
      ? [
          [22, -101],
          [-34, -70],
        ]
      : pose === "catch"
        ? [
            [-20, -97],
            [20, -97],
          ]
        : [
            [-22, -40],
            [22, -40],
          ];

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="24" ry="4" fill={N} opacity="0.5" />
      {legs.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={c("ink-soft")}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {feet.map(([fx, fy]) => (
        <ellipse key={fx} cx={fx} cy={fy} rx="7" ry="3.5" fill={N} />
      ))}
      {arms.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={J}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <path
        d="M-17 -70 Q0 -78 17 -70 L14 -36 Q0 -32 -14 -36 Z"
        fill={J}
        stroke={N}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M-15 -69 Q0 -76 15 -69" fill="none" stroke={c("ink", 0.4)} strokeWidth="2" />
      <text
        x="0"
        y="-45"
        textAnchor="middle"
        fontSize="13"
        fontWeight="900"
        fill={N}
        fontFamily={SANS}
      >
        {label}
      </text>
      {hands.map(([hx, hy]) => (
        <circle key={hx} cx={hx} cy={hy} r="4.5" fill={c("ink-soft")} stroke={N} strokeWidth="1.2" />
      ))}
      <circle cx="0" cy="-85" r="12.5" fill={J} stroke={N} strokeWidth="1.8" />
      <path d="M-3 -97 V-80" stroke={c("ink", 0.6)} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="-4" cy="-84" r="2.2" fill={N} opacity="0.55" />
      <path
        d="M6 -88 H15 M6 -82 H15 M11 -91 V-78"
        stroke={c("ink-soft")}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {pose === "throw" && <Football x={23} y={-108} rx={11} rot={-35} />}
      {pose === "catch" && <Football x={0} y={-110} rx={12} rot={-10} />}
    </g>
  );
}

/** A small side-on helmet, for labelling a bar or a group. */
export function MiniHelmet({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill={fill} stroke={N} strokeWidth="1.6" />
      <path d={`M${x - 2} ${y - 9} V${y + 2}`} stroke={c("ink", 0.55)} strokeWidth="2" strokeLinecap="round" />
      <path
        d={`M${x + 4} ${y - 2} H${x + 11} M${x + 4} ${y + 3} H${x + 11} M${x + 8} ${y - 5} V${y + 6}`}
        stroke={c("ink-soft")}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  );
}

export const FLAME_D =
  "M0 0 C-20 0 -26 -18 -18 -34 C-12 -46 -4 -50 -6 -66 C4 -58 12 -48 12 -36 C16 -42 18 -46 16 -52 C26 -40 26 -18 20 -8 C16 -2 8 0 0 0 Z";

export function Flame({
  x,
  y,
  s = 1,
  outer,
  inner,
}: {
  x: number;
  y: number;
  s?: number;
  outer: string;
  inner: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={FLAME_D} fill={outer} stroke={N} strokeWidth={r1(1.8 / s)} strokeLinejoin="round" />
      <path d={FLAME_D} transform="translate(0 -2) scale(0.55)" fill={inner} />
    </g>
  );
}

/** A many-pointed star, for bursts. */
export function starPath(cx: number, cy: number, points: number, outer: number, inner: number, rotDeg: number) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner;
    const a = ((rotDeg + (i * 180) / points) * Math.PI) / 180;
    pts.push(`${r1(cx + rad * Math.cos(a))} ${r1(cy + rad * Math.sin(a))}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** A pie slice; degrees start at 12 o'clock and run clockwise. */
export function slicePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${r1(cx + r * Math.cos(rad))} ${r1(cy + r * Math.sin(rad))}`;
  };
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx} ${cy} L${p(a0)} A${r} ${r} 0 ${large} 1 ${p(a1)} Z`;
}

/**
 * The frame every scene sits in: the viewBox, the tone's glow, and the
 * scene on top. `align="left"` pins it to the left of a wide box, for
 * banners that carry something else on the right.
 */
export function ArtSvg({
  tone,
  glowId,
  className = "",
  align = "center",
  children,
}: {
  tone: Tone;
  /** Namespaced by the caller: c- courses, p- projects. */
  glowId: string;
  className?: string;
  align?: "center" | "left";
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className={className}
      role="presentation"
      aria-hidden
      preserveAspectRatio={align === "left" ? "xMinYMid meet" : "xMidYMid meet"}
    >
      <Glow t={tone} id={glowId} />
      {children}
    </svg>
  );
}
