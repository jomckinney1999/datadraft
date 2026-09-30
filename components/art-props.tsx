/**
 * Props for the unit scenes — the objects a data lesson is made of.
 *
 * Tables, chips, charts, magnifiers, trophies, gears: the nouns that recur
 * across seventy-odd unit titles. Drawn once here in the kit's sticker
 * language (token fills, a dark 1.8 outline, rounded joins) so a funnel in
 * the SQL course and a funnel in Power BI are recognisably the same funnel.
 *
 * Same rules as components/art-kit.tsx: tokens only, trig rounded with r1,
 * nothing random.
 */

import type { ReactNode } from "react";
import { MONO, N, c, r1 } from "@/components/art-kit";

export const OUT = { stroke: N, strokeWidth: 1.8, strokeLinejoin: "round" as const };

/** A plain rounded card. */
export function Card({
  x,
  y,
  w,
  h,
  fill = c("ink", 0.94),
  r = 6,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  r?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} {...OUT} />;
}

/**
 * A little table: a coloured header band, rows of grey text bars, and an
 * optional highlighted row. The shape every SQL scene is built from.
 */
export function Sheet({
  x,
  y,
  w,
  h,
  head = c("turf"),
  rows = 3,
  cols = 3,
  hi,
  hiFill = c("gold", 0.55),
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  head?: string;
  rows?: number;
  cols?: number;
  hi?: number;
  hiFill?: string;
  label?: string;
}) {
  const headH = Math.min(14, h * 0.24);
  const rowH = (h - headH) / rows;
  const colW = w / cols;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={c("ink", 0.95)} {...OUT} />
      <path
        d={`M${x} ${r1(y + headH)} V${y + 5} Q${x} ${y} ${x + 5} ${y} H${x + w - 5} Q${x + w} ${y} ${x + w} ${y + 5} V${r1(y + headH)} Z`}
        fill={head}
        {...OUT}
      />
      {label && (
        <text
          x={r1(x + w / 2)}
          y={r1(y + headH - 4)}
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="800"
          fill={N}
          fontFamily={MONO}
        >
          {label}
        </text>
      )}
      {hi !== undefined && (
        <rect x={x + 1} y={r1(y + headH + hi * rowH)} width={w - 2} height={r1(rowH)} fill={hiFill} />
      )}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <path
          key={`r${i}`}
          d={`M${x} ${r1(y + headH + (i + 1) * rowH)} H${x + w}`}
          stroke={c("night", 0.18)}
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <path
          key={`c${i}`}
          d={`M${r1(x + (i + 1) * colW)} ${r1(y + headH)} V${y + h}`}
          stroke={c("night", 0.12)}
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => (
          <rect
            key={`t${i}-${j}`}
            x={r1(x + j * colW + colW * 0.2)}
            y={r1(y + headH + i * rowH + rowH / 2 - 1.5)}
            width={r1(colW * (0.45 + ((i + j) % 3) * 0.12))}
            height="3"
            rx="1.5"
            fill={c("night", 0.28)}
          />
        )),
      )}
    </g>
  );
}

/** A pill with monospace text, centred on (x, y). */
export function Chip({
  x,
  y,
  text,
  fill = c("ice"),
  ink = N,
  size = 8,
}: {
  x: number;
  y: number;
  text: string;
  fill?: string;
  ink?: string;
  size?: number;
}) {
  const w = r1(text.length * size * 0.62 + 12);
  const h = r1(size + 8);
  return (
    <g>
      <rect x={r1(x - w / 2)} y={r1(y - h / 2)} width={w} height={h} rx={r1(h / 2)} fill={fill} {...OUT} />
      <text
        x={x}
        y={r1(y + size * 0.36)}
        textAnchor="middle"
        fontSize={size}
        fontWeight="800"
        fill={ink}
        fontFamily={MONO}
      >
        {text}
      </text>
    </g>
  );
}

/** Bars standing on a baseline at y. */
export function Bars({
  x,
  y,
  vals,
  w = 11,
  gap = 5,
  fills,
}: {
  x: number;
  y: number;
  vals: number[];
  w?: number;
  gap?: number;
  fills: string[];
}) {
  return (
    <g>
      {vals.map((v, i) => (
        <rect
          key={i}
          x={x + i * (w + gap)}
          y={y - v}
          width={w}
          height={v}
          rx="2"
          fill={fills[i % fills.length]}
          {...OUT}
        />
      ))}
    </g>
  );
}

/** A magnifying glass, lens centred on (x, y). */
export function Magnifier({ x, y, r = 14, rot = 45 }: { x: number; y: number; r?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={r - 1} y="-3.5" width={r * 1.1} height="7" rx="3" fill={c("gold-dim")} {...OUT} />
      <circle r={r} fill={c("ice", 0.28)} {...OUT} strokeWidth="3" />
      <circle r={r} fill="none" stroke={c("ink-soft")} strokeWidth="1.2" />
      <path d={`M${-r * 0.5} ${-r * 0.35} Q${-r * 0.35} ${-r * 0.6} ${-r * 0.05} ${-r * 0.62}`} stroke={c("ink")} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** A trophy cup on a plinth; (x, y) is the middle of the base. */
export function Trophy({
  x,
  y,
  s = 1,
  fill = c("gold"),
  plate,
}: {
  x: number;
  y: number;
  s?: number;
  fill?: string;
  plate?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22 -58 Q-40 -58 -38 -44 Q-36 -32 -20 -32" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M-22 -58 Q-40 -58 -38 -44 Q-36 -32 -20 -32" fill="none" stroke={fill} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22 -58 Q40 -58 38 -44 Q36 -32 20 -32" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M22 -58 Q40 -58 38 -44 Q36 -32 20 -32" fill="none" stroke={fill} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-24 -62 H24 Q24 -26 4 -20 V-12 H-4 V-20 Q-24 -26 -24 -62 Z" fill={fill} {...OUT} />
      <path d="M-14 -56 Q-14 -36 -4 -28" stroke={c("ink", 0.55)} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="-16" y="-12" width="32" height="12" rx="2" fill={c("gold-dim")} {...OUT} />
      {plate && (
        <text x="0" y="-3.2" textAnchor="middle" fontSize="7" fontWeight="900" fill={N} fontFamily={MONO}>
          {plate}
        </text>
      )}
    </g>
  );
}

/** A straight arrow from (x1, y1) to (x2, y2) with a solid head. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = c("turf"),
  w = 4,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  w?: number;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hl = w * 2.6;
  const bx = x2 - hl * Math.cos(a);
  const by = y2 - hl * Math.sin(a);
  const px = Math.sin(a) * w * 1.6;
  const py = -Math.cos(a) * w * 1.6;
  return (
    <g>
      <path d={`M${x1} ${y1} L${r1(bx)} ${r1(by)}`} stroke={N} strokeWidth={w + 3.2} strokeLinecap="round" />
      <path d={`M${x1} ${y1} L${r1(bx)} ${r1(by)}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path
        d={`M${x2} ${y2} L${r1(bx + px)} ${r1(by + py)} L${r1(bx - px)} ${r1(by - py)} Z`}
        fill={color}
        {...OUT}
      />
    </g>
  );
}

/** A toothed gear. */
export function Gear({
  x,
  y,
  r = 16,
  teeth = 8,
  fill = c("ice"),
}: {
  x: number;
  y: number;
  r?: number;
  teeth?: number;
  fill?: string;
}) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const rad = i % 4 < 2 ? r : r * 0.78;
    const a = ((i + 0.5) / (teeth * 4)) * Math.PI * 2;
    pts.push(`${r1(x + rad * Math.cos(a))} ${r1(y + rad * Math.sin(a))}`);
  }
  return (
    <g>
      <path d={`M${pts.join(" L")} Z`} fill={fill} {...OUT} />
      <circle cx={x} cy={y} r={r1(r * 0.36)} fill={c("night-100")} {...OUT} />
    </g>
  );
}

/** A round clock with hands at 10 and 2. */
export function Clock({ x, y, r = 16, fill = c("ink", 0.95) }: { x: number; y: number; r?: number; fill?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} {...OUT} strokeWidth="2.4" />
      {[0, 90, 180, 270].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <path
            key={a}
            d={`M${r1(x + r * 0.72 * Math.cos(rad))} ${r1(y + r * 0.72 * Math.sin(rad))} L${r1(x + r * 0.86 * Math.cos(rad))} ${r1(y + r * 0.86 * Math.sin(rad))}`}
            stroke={N}
            strokeWidth="1.6"
          />
        );
      })}
      <path d={`M${x} ${y} L${r1(x - r * 0.3)} ${r1(y - r * 0.42)} M${x} ${y} L${r1(x + r * 0.5)} ${r1(y - r * 0.2)}`} stroke={N} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={x} cy={y} r="1.8" fill={c("gold")} stroke={N} strokeWidth="1" />
    </g>
  );
}

/** A tear-off calendar page. */
export function Calendar({
  x,
  y,
  w = 46,
  h = 44,
  head = c("turf"),
  mark = 4,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  head?: string;
  mark?: number;
}) {
  const cellW = (w - 8) / 4;
  const cellH = (h - 16) / 3;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={c("ink", 0.95)} {...OUT} />
      <path d={`M${x} ${y + 12} V${y + 5} Q${x} ${y} ${x + 5} ${y} H${x + w - 5} Q${x + w} ${y} ${x + w} ${y + 5} V${y + 12} Z`} fill={head} {...OUT} />
      {[0.28, 0.72].map((k) => (
        <rect key={k} x={r1(x + w * k - 2)} y={y - 4} width="4" height="9" rx="2" fill={c("ink-soft")} {...OUT} strokeWidth="1.2" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={r1(x + 4 + (i % 4) * cellW + 1)}
          y={r1(y + 14 + Math.floor(i / 4) * cellH + 1)}
          width={r1(cellW - 2)}
          height={r1(cellH - 2)}
          rx="1.5"
          fill={i === mark ? c("gold") : c("night", 0.14)}
          stroke={i === mark ? N : "none"}
          strokeWidth="1.2"
        />
      ))}
    </g>
  );
}

/** A monitor on a stand; children draw on the screen. */
export function Monitor({
  x,
  y,
  w,
  h,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect x={r1(x + w / 2 - 4)} y={y + h} width="8" height="9" fill={c("ink-soft")} {...OUT} />
      <rect x={r1(x + w / 2 - 18)} y={y + h + 8} width="36" height="5" rx="2.5" fill={c("ink-soft")} {...OUT} />
      <rect x={x} y={y} width={w} height={h} rx="6" fill={c("ink-soft")} {...OUT} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx="3" fill={c("night-100")} {...OUT} strokeWidth="1.2" />
      {children}
    </g>
  );
}

/** A padlock; (x, y) is the middle of the body. */
export function Lock({ x, y, s = 1, fill = c("gold") }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-8 -6 V-13 Q-8 -22 0 -22 Q8 -22 8 -13 V-6" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M-8 -6 V-13 Q-8 -22 0 -22 Q8 -22 8 -13 V-6" fill="none" stroke={c("ink-soft")} strokeWidth="3" strokeLinecap="round" />
      <rect x="-13" y="-7" width="26" height="20" rx="4" fill={fill} {...OUT} />
      <circle cx="0" cy="1" r="3" fill={N} />
      <path d="M0 2 V7" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** A pencil; (x, y) is the tip. */
export function Pencil({ x, y, rot = -45, len = 54 }: { x: number; y: number; rot?: number; len?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 L10 -5 H${len} V5 H10 Z`} fill={c("gold")} {...OUT} />
      <path d="M0 0 L10 -5 V5 Z" fill={c("ink-soft")} {...OUT} />
      <path d="M0 0 L4 -2 V2 Z" fill={N} />
      <rect x={len} y="-5" width="9" height="10" rx="2" fill={c("ice")} {...OUT} />
      <path d={`M14 0 H${len - 4}`} stroke={c("gold-dim")} strokeWidth="2" />
    </g>
  );
}

/** A database cylinder; (x, y) is the centre of the top ellipse. */
export function Cyl({
  x,
  y,
  w = 44,
  h = 40,
  fill = c("turf"),
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill?: string;
}) {
  const rx = w / 2;
  const ry = r1(w * 0.18);
  return (
    <g>
      <path d={`M${x - rx} ${y} V${y + h} A${rx} ${ry} 0 0 0 ${x + rx} ${y + h} V${y}`} fill={fill} {...OUT} />
      <path d={`M${x - rx} ${r1(y + h / 2)} A${rx} ${ry} 0 0 0 ${x + rx} ${r1(y + h / 2)}`} fill="none" stroke={N} strokeWidth="1.4" opacity="0.6" />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c("ink", 0.9)} {...OUT} />
    </g>
  );
}

/** A speech bubble; children draw inside it. */
export function Bubble({
  x,
  y,
  w,
  h,
  tail = "left",
  fill = c("ink", 0.95),
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tail?: "left" | "right";
  fill?: string;
  children?: ReactNode;
}) {
  const tx = tail === "left" ? x + 12 : x + w - 12;
  const dx = tail === "left" ? -8 : 8;
  return (
    <g>
      <path
        d={`M${x + 6} ${y} H${x + w - 6} Q${x + w} ${y} ${x + w} ${y + 6} V${y + h - 6} Q${x + w} ${y + h} ${x + w - 6} ${y + h} H${tx + 6} L${tx + dx} ${y + h + 9} L${tx - 4} ${y + h} H${x + 6} Q${x} ${y + h} ${x} ${y + h - 6} V${y + 6} Q${x} ${y} ${x + 6} ${y} Z`}
        fill={fill}
        {...OUT}
      />
      {children}
    </g>
  );
}

/** A tick in a disc. */
export function Check({ x, y, r = 9, fill = c("turf") }: { x: number; y: number; r?: number; fill?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} {...OUT} />
      <path d={`M${r1(x - r * 0.45)} ${y} L${r1(x - r * 0.1)} ${r1(y + r * 0.38)} L${r1(x + r * 0.5)} ${r1(y - r * 0.4)}`} fill="none" stroke={N} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** A cross in a disc. */
export function Cross({ x, y, r = 9, fill = c("gold") }: { x: number; y: number; r?: number; fill?: string }) {
  const k = r * 0.38;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} {...OUT} />
      <path d={`M${r1(x - k)} ${r1(y - k)} L${r1(x + k)} ${r1(y + k)} M${r1(x + k)} ${r1(y - k)} L${r1(x - k)} ${r1(y + k)}`} stroke={N} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Confetti flecks, at fixed places so a render never reshuffles them. */
export function Confetti({ cx = 100, cy = 40, spread = 70 }: { cx?: number; cy?: number; spread?: number }) {
  const bits: [number, number, number, string][] = [
    [-0.9, -0.2, 20, "turf"],
    [-0.62, 0.35, -30, "ice"],
    [-0.4, -0.5, 45, "gold"],
    [0.35, -0.45, -15, "turf"],
    [0.6, 0.25, 35, "gold"],
    [0.88, -0.15, -40, "ice"],
    [-0.15, -0.7, 10, "ice"],
    [0.12, -0.8, -25, "gold"],
  ];
  return (
    <g>
      {bits.map(([dx, dy, rot, tone], i) => (
        <rect
          key={i}
          x={r1(cx + dx * spread - 3)}
          y={r1(cy + dy * spread * 0.5 - 1.5)}
          width="6"
          height="3"
          rx="1"
          fill={c(tone)}
          transform={`rotate(${rot} ${r1(cx + dx * spread)} ${r1(cy + dy * spread * 0.5)})`}
        />
      ))}
    </g>
  );
}

/** A friendly robot head; (x, y) is the centre of the face. */
export function Robot({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -26 V-34" stroke={N} strokeWidth="2.4" />
      <circle cx="0" cy="-36" r="4" fill={c("gold")} {...OUT} />
      <rect x="-30" y="-8" width="6" height="16" rx="3" fill={c("turf")} {...OUT} />
      <rect x="24" y="-8" width="6" height="16" rx="3" fill={c("turf")} {...OUT} />
      <rect x="-25" y="-26" width="50" height="44" rx="12" fill={c("ink-soft")} {...OUT} />
      <rect x="-18" y="-17" width="36" height="20" rx="8" fill={c("night-100")} {...OUT} />
      <circle cx="-8" cy="-7" r="4.5" fill={c("turf")} />
      <circle cx="8" cy="-7" r="4.5" fill={c("turf")} />
      <circle cx="-7" cy="-8.5" r="1.4" fill={c("ink")} />
      <circle cx="9" cy="-8.5" r="1.4" fill={c("ink")} />
      <path d="M-9 9 H9" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** A snake in an S, head at the top right; for Python. */
export function Snake({ x, y, s = 1, fill = c("turf") }: { x: number; y: number; s?: number; fill?: string }) {
  const d = "M-30 18 Q-30 4 -14 4 H10 Q24 4 24 -10 Q24 -24 10 -24 H2";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={d} fill="none" stroke={N} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={c("gold")} strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" />
      <ellipse cx="-2" cy="-24" rx="9" ry="7" fill={fill} {...OUT} />
      <circle cx="-4" cy="-26" r="1.8" fill={N} />
      <path d="M-11 -23 L-17 -22 M-17 -22 L-20 -24 M-17 -22 L-20 -20" stroke={c("gold")} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/** A hexagon badge with a letter, for R. */
export function HexBadge({
  x,
  y,
  r = 18,
  fill = c("ice"),
  text,
}: {
  x: number;
  y: number;
  r?: number;
  fill?: string;
  text: string;
}) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return `${r1(x + r * Math.cos(a))} ${r1(y + r * Math.sin(a))}`;
  });
  return (
    <g>
      <path d={`M${pts.join(" L")} Z`} fill={fill} {...OUT} strokeWidth="2.2" />
      <text x={x} y={r1(y + r * 0.34)} textAnchor="middle" fontSize={r1(r * 0.95)} fontWeight="900" fill={N} fontFamily={MONO}>
        {text}
      </text>
    </g>
  );
}

/** A branch graph: a main line and a feature line that splits and merges. */
export function BranchGraph({ x, y, w = 110 }: { x: number; y: number; w?: number }) {
  const k = w / 110;
  const X = (v: number) => r1(x + v * k);
  return (
    <g>
      <path d={`M${X(0)} ${y} H${X(110)}`} stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d={`M${X(0)} ${y} H${X(110)}`} stroke={c("turf")} strokeWidth="4" strokeLinecap="round" />
      <path d={`M${X(22)} ${y} Q${X(30)} ${y - 26} ${X(48)} ${y - 26} H${X(66)} Q${X(84)} ${y - 26} ${X(90)} ${y}`} fill="none" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d={`M${X(22)} ${y} Q${X(30)} ${y - 26} ${X(48)} ${y - 26} H${X(66)} Q${X(84)} ${y - 26} ${X(90)} ${y}`} fill="none" stroke={c("ice")} strokeWidth="4" strokeLinecap="round" />
      {[8, 22, 90, 104].map((v) => (
        <circle key={v} cx={X(v)} cy={y} r="5.5" fill={c("turf")} {...OUT} />
      ))}
      {[48, 66].map((v) => (
        <circle key={v} cx={X(v)} cy={y - 26} r="5.5" fill={c("ice")} {...OUT} />
      ))}
    </g>
  );
}
