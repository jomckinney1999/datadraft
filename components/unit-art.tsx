/**
 * A drawn picture for every unit — the same sticker style as the question
 * cards, so a course's roadmap reads like the rest of the site.
 *
 * The rule is the question bank's rule: the picture is what the title says.
 * "Filter with WHERE" is a funnel letting one ball through, "Overtime —
 * Triggers" is a row of dominoes going over, "Overtime — Views" is a pair of
 * binoculars on a table, "The Model" is a star schema, "Locker Room — Git
 * Final" is a locker with a jersey hanging in it. A unit no scene fits gets a
 * new scene, not the nearest one.
 *
 * Keyed by unit id. scripts/verify-answer-keys.mjs fails when a unit in any
 * course has no scene, because the roadmap would show an empty frame for it.
 * Gradient ids are namespaced `u-`, as art-kit requires.
 */

import {
  ArtSvg,
  Football,
  MONO,
  N,
  Shadow,
  Sparkle,
  c,
  r1,
  slicePath,
  starPath,
  type Tone,
} from "@/components/art-kit";
import {
  Arrow,
  Bars,
  BranchGraph,
  Bubble,
  Calendar,
  Card,
  Check,
  Chip,
  Clock,
  Confetti,
  Cross,
  Cyl,
  Gear,
  HexBadge,
  Lock,
  Magnifier,
  Monitor,
  OUT,
  Pencil,
  Robot,
  Sheet,
  Snake,
  Trophy,
} from "@/components/art-props";
import type { ReactNode } from "react";

/** Monospace label. */
function T({
  x,
  y,
  s = 8,
  fill = N,
  anchor = "middle",
  children,
}: {
  x: number;
  y: number;
  s?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  children: ReactNode;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={s} fontWeight="800" fill={fill} fontFamily={MONO}>
      {children}
    </text>
  );
}

/** A big glyph with a dark outline, for Σ, braces, and the like. */
function Glyph({ x, y, s, fill, children }: { x: number; y: number; s: number; fill: string; children: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={s}
      fontWeight="900"
      fill={fill}
      stroke={N}
      strokeWidth="2.2"
      paintOrder="stroke"
      fontFamily={MONO}
    >
      {children}
    </text>
  );
}

/** A mouse pointer, tip at (x, y). */
function Pointer({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y} V${y + 20} L${x + 5} ${y + 15} L${x + 9} ${y + 24} L${x + 13} ${y + 22} L${x + 9} ${y + 13} L${x + 16} ${y + 13} Z`}
      fill={c("ink")}
      {...OUT}
    />
  );
}

/** A lightning bolt. */
function Bolt({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M4 -18 L-8 2 H0 L-4 18 L10 -4 H2 Z"
      fill={c("gold")}
      {...OUT}
    />
  );
}

// ═══ SQL Fundamentals ═══════════════════════════════════════════════

function StatSheet() {
  return (
    <>
      <Shadow y={134} rx={52} />
      <rect x="58" y="22" width="84" height="106" rx="8" fill={c("gold-dim")} {...OUT} />
      <Sheet x={66} y={36} w={68} h={84} head={c("turf")} rows={5} cols={3} hi={2} label="STATS" />
      <rect x="84" y="15" width="32" height="13" rx="4" fill={c("ink-soft")} {...OUT} />
      <Magnifier x={132} y={84} r={16} rot={40} />
      <Football x={52} y={112} rx={15} rot={-25} />
      <Sparkle x={160} y={36} r={5} />
    </>
  );
}

function FirstQueries() {
  return (
    <>
      <Shadow y={132} rx={60} />
      <Sheet x={88} y={58} w={76} h={60} head={c("ice")} rows={3} cols={3} label="RESULT" />
      <Chip x={76} y={36} text="SELECT *" fill={c("turf")} size={10} />
      <circle cx="54" cy="94" r="17" fill={c("turf")} {...OUT} />
      <path d="M48 85 L63 94 L48 103 Z" fill={N} />
      <Pointer x={62} y={102} />
      <Arrow x1={74} y1={88} x2={86} y2={84} color={c("gold")} w={3} />
      <Sparkle x={170} y={40} r={5} fill={c("gold")} />
    </>
  );
}

function WhereFunnel() {
  return (
    <>
      <Shadow y={134} rx={40} />
      <path d="M52 38 Q100 50 148 38 L110 88 V104 H90 V88 Z" fill={c("ice")} {...OUT} />
      <ellipse cx="100" cy="38" rx="48" ry="9" fill={c("ice-dim")} {...OUT} />
      <Football x={78} y={28} rx={11} rot={-20} />
      <Football x={104} y={22} rx={11} rot={15} />
      <Football x={127} y={30} rx={11} rot={-10} fill={c("ink-soft")} />
      <Chip x={100} y={64} text="WHERE" fill={c("gold")} />
      <Football x={100} y={120} rx={13} fill={c("gold")} />
      <Sparkle x={124} y={112} r={5} fill={c("gold")} />
      <Sparkle x={76} y={116} r={3.5} />
    </>
  );
}

function SortBoard() {
  const rows = [
    { w: 76, fill: c("turf"), medal: c("gold") },
    { w: 60, fill: c("ice"), medal: c("ink-soft") },
    { w: 44, fill: c("gold"), medal: c("gold-dim") },
    { w: 28, fill: c("ink-soft"), medal: c("panel") },
  ];
  return (
    <>
      <Shadow y={134} rx={62} />
      <rect x="34" y="24" width="118" height="104" rx="10" fill={c("night-100")} {...OUT} />
      {rows.map((r, i) => (
        <g key={i}>
          <circle cx="50" cy={38 + i * 24} r="8" fill={r.medal} {...OUT} />
          <T x={50} y={41 + i * 24} s={8}>
            {i + 1}
          </T>
          <rect x="64" y={32 + i * 24} width={r.w} height="12" rx="3" fill={r.fill} {...OUT} />
        </g>
      ))}
      <Arrow x1={168} y1={116} x2={168} y2={36} color={c("gold")} w={4} />
    </>
  );
}

function MissingNull() {
  return (
    <>
      <Shadow y={134} rx={56} />
      <Sheet x={36} y={36} w={96} h={84} head={c("ice")} rows={4} cols={3} label="week_results" />
      <rect x="69" y="85" width="30" height="15.5" rx="2" fill={c("ink")} stroke={c("gold")} strokeWidth="2" strokeDasharray="3 2" />
      <T x={84} y={97} s={12} fill={c("gold-dim")}>
        ?
      </T>
      <Bubble x={120} y={16} w={56} h={26} tail="left" fill={c("gold")}>
        <T x={148} y={33} s={11}>
          NULL
        </T>
      </Bubble>
      <Sparkle x={160} y={96} r={5} />
    </>
  );
}

function Calculator() {
  const keys = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"];
  return (
    <>
      <Shadow y={134} rx={42} />
      <rect x="62" y="20" width="76" height="110" rx="10" fill={c("ice")} {...OUT} />
      <rect x="70" y="28" width="60" height="22" rx="4" fill={c("night-100")} {...OUT} />
      <T x={124} y={44} s={12} fill={c("turf")} anchor="end">
        24.6
      </T>
      {keys.map((k, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const op = col === 3;
        const eq = k === "=";
        return (
          <g key={k}>
            <rect
              x={70 + col * 16}
              y={58 + row * 17}
              width="12"
              height="13"
              rx="3"
              fill={eq ? c("turf") : op ? c("gold") : c("ink", 0.95)}
              {...OUT}
              strokeWidth="1.3"
            />
            <T x={76 + col * 16} y={67.5 + row * 17} s={8}>
              {k}
            </T>
          </g>
        );
      })}
      <Football x={154} y={116} rx={13} rot={-20} />
      <Sparkle x={44} y={40} r={5} fill={c("gold")} />
    </>
  );
}

function FunctionGears() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Gear x={134} y={50} r={15} teeth={7} fill={c("gold")} />
      <Gear x={100} y={76} r={26} teeth={9} fill={c("turf")} />
      <Chip x={60} y={30} text="ROUND()" fill={c("ice")} />
      <Chip x={40} y={112} text="18.36" fill={c("ink-soft")} />
      <Arrow x1={58} y1={106} x2={74} y2={94} color={c("ink-soft")} w={3} />
      <Arrow x1={124} y1={94} x2={140} y2={106} color={c("gold")} w={3} />
      <Chip x={162} y={112} text="18.4" fill={c("turf")} />
    </>
  );
}

function SigmaSum() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <Bars x={30} y={120} vals={[14, 22, 10, 18, 12]} w={8} gap={3} fills={[c("turf"), c("ice")]} />
      <Glyph x={54} y={78} s={40} fill={c("ink")}>
        Σ
      </Glyph>
      <Arrow x1={88} y1={104} x2={108} y2={104} color={c("gold")} w={4} />
      <rect x="116" y="46" width="30" height="74" rx="4" fill={c("gold")} {...OUT} />
      <path d="M122 54 V112" stroke={c("ink", 0.5)} strokeWidth="3" strokeLinecap="round" />
      <Chip x={131} y={34} text="SUM" fill={c("turf")} />
      <Sparkle x={164} y={56} r={5} />
    </>
  );
}

function JoinTables() {
  return (
    <>
      <Shadow y={134} rx={72} />
      <Sheet x={20} y={34} w={66} h={70} head={c("turf")} rows={4} cols={2} hi={1} hiFill={c("gold", 0.6)} label="rosters" />
      <Sheet x={114} y={50} w={66} h={70} head={c("ice")} rows={4} cols={2} hi={1} hiFill={c("gold", 0.6)} label="scores" />
      <path d="M86 69 C100 69 100 85 114 85" fill="none" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M86 69 C100 69 100 85 114 85" fill="none" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" />
      <circle cx="86" cy="69" r="4" fill={c("gold")} {...OUT} />
      <circle cx="114" cy="85" r="4" fill={c("gold")} {...OUT} />
      <Chip x={60} y={122} text="ON player" fill={c("gold")} />
    </>
  );
}

function NestedBoxes() {
  return (
    <>
      <Shadow y={134} rx={60} />
      <rect x="32" y="20" width="136" height="108" rx="12" fill={c("turf")} {...OUT} />
      <T x={42} y={34} s={8} anchor="start">
        SELECT … WHERE IN
      </T>
      <rect x="50" y="42" width="100" height="76" rx="10" fill={c("ice")} {...OUT} />
      <T x={60} y={56} s={8} anchor="start">
        (SELECT …
      </T>
      <rect x="70" y="64" width="60" height="44" rx="8" fill={c("gold")} {...OUT} />
      <Football x={100} y={86} rx={14} fill={c("gold-dim")} />
    </>
  );
}

function Venn() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <circle cx="78" cy="72" r="40" fill={c("turf", 0.8)} {...OUT} />
      <circle cx="122" cy="72" r="40" fill={c("ice", 0.8)} {...OUT} />
      <path d="M100 38.6 A40 40 0 0 1 100 105.4 A40 40 0 0 1 100 38.6 Z" fill={c("gold")} {...OUT} />
      <Football x={62} y={72} rx={11} rot={-20} />
      <Football x={138} y={70} rx={11} rot={20} />
      <Football x={100} y={72} rx={9} fill={c("ink-soft")} />
      <Chip x={100} y={126} text="UNION" fill={c("gold")} />
    </>
  );
}

function EditRow() {
  return (
    <>
      <Shadow y={134} rx={60} />
      <Sheet x={30} y={30} w={100} h={88} head={c("gold")} rows={4} cols={3} hi={2} hiFill={c("turf", 0.5)} label="waiver_wire" />
      <Pencil x={118} y={96} rot={-40} len={48} />
      <circle cx="150" cy="30" r="10" fill={c("turf")} {...OUT} />
      <path d="M145 30 H155 M150 25 V35" stroke={N} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="172" cy="52" r="10" fill={c("gold")} {...OUT} />
      <path d="M167 52 H177" stroke={N} strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

function Blueprint() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <rect x="26" y="22" width="148" height="104" rx="8" fill={c("ice-dim")} {...OUT} />
      {[40, 54, 68, 82, 96, 110].map((y) => (
        <path key={`h${y}`} d={`M26 ${y} H174`} stroke={c("ink", 0.16)} strokeWidth="1" />
      ))}
      {[44, 62, 80, 98, 116, 134, 152].map((x) => (
        <path key={`v${x}`} d={`M${x} 22 V126`} stroke={c("ink", 0.16)} strokeWidth="1" />
      ))}
      <rect x="44" y="36" width="80" height="60" rx="3" fill="none" stroke={c("ink")} strokeWidth="2" strokeDasharray="5 3" />
      <rect x="44" y="36" width="80" height="14" rx="3" fill={c("turf")} {...OUT} />
      <path d="M71 50 V96 M98 50 V96" stroke={c("ink")} strokeWidth="1.6" strokeDasharray="4 3" />
      <Chip x={84} y={112} text="CREATE TABLE" fill={c("gold")} size={7} />
      <g transform="translate(150 70) rotate(35)">
        <rect x="-4.5" y="-4" width="9" height="42" rx="4" fill={c("ink-soft")} {...OUT} />
        <circle cx="0" cy="-12" r="11" fill={c("ink-soft")} {...OUT} />
        <rect x="-4" y="-25" width="8" height="12" fill={c("ice-dim")} />
      </g>
    </>
  );
}

function Broom() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <Sheet x={98} y={34} w={76} h={80} head={c("turf")} rows={4} cols={2} label="clean" />
      {[
        [34, 116, -20, c("ink-soft")],
        [48, 124, 15, c("ice")],
        [62, 118, 40, c("gold")],
        [30, 104, 60, c("ice")],
        [78, 124, -35, c("ink-soft")],
      ].map(([x, y, r, f], i) => (
        <rect
          key={i}
          x={Number(x)}
          y={Number(y)}
          width="9"
          height="4"
          rx="1.5"
          fill={String(f)}
          transform={`rotate(${r} ${x} ${y})`}
          {...OUT}
          strokeWidth="1"
        />
      ))}
      <path d="M40 26 L74 92" stroke={N} strokeWidth="8" strokeLinecap="round" />
      <path d="M40 26 L74 92" stroke={c("gold-dim")} strokeWidth="5" strokeLinecap="round" />
      <path d="M64 88 L86 100 L78 122 L52 110 Z" fill={c("gold")} {...OUT} />
      <path d="M60 106 L72 96 M66 110 L78 100 M72 114 L82 104" stroke={c("gold-dim")} strokeWidth="1.6" />
      <Sparkle x={168} y={28} r={6} />
      <Sparkle x={184} y={52} r={4} fill={c("gold")} />
    </>
  );
}

function BugHunt() {
  const lines: [number, number, string][] = [
    [42, 46, c("turf")],
    [54, 70, c("ice")],
    [66, 58, c("ink-soft")],
    [78, 64, c("gold")],
    [90, 40, c("ice")],
    [102, 54, c("ink-soft")],
  ];
  return (
    <>
      <Shadow y={134} rx={60} />
      <Card x={28} y={28} w={116} h={92} fill={c("night-100")} />
      {lines.map(([y, w, f]) => (
        <rect key={y} x="40" y={y} width={w} height="5" rx="2.5" fill={f} />
      ))}
      <path d="M40 74 q4 -4 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0" fill="none" stroke={c("gold")} strokeWidth="2" />
      <g transform="translate(112 72)">
        {[-6, 0, 6].map((dy) => (
          <path key={dy} d={`M-12 ${dy} H12`} stroke={N} strokeWidth="2" strokeLinecap="round" />
        ))}
        <ellipse cx="0" cy="2" rx="8" ry="10" fill={c("gold")} {...OUT} />
        <path d="M0 -7 V12" stroke={N} strokeWidth="1.4" />
        <circle cx="0" cy="-10" r="5" fill={N} />
        <path d="M-2 -14 L-6 -20 M2 -14 L6 -20" stroke={N} strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <Magnifier x={112} y={72} r={20} rot={40} />
    </>
  );
}

function SqlFinal() {
  return (
    <>
      <Shadow y={134} rx={46} />
      <Confetti cx={100} cy={40} spread={80} />
      <Trophy x={100} y={130} s={1.35} plate="SQL" />
      <Football x={150} y={112} rx={14} rot={-30} />
      <Sparkle x={48} y={62} r={6} fill={c("gold")} />
    </>
  );
}

// ═══ Advanced SQL ═══════════════════════════════════════════════════

function Lightbulb() {
  return (
    <>
      <Shadow y={134} rx={34} />
      {[
        [100, 8, 100, 16],
        [58, 22, 64, 28],
        [142, 22, 136, 28],
        [44, 56, 52, 56],
        [156, 56, 148, 56],
      ].map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      ))}
      <path d="M100 22 C72 22 60 44 66 64 C70 76 80 82 82 94 H118 C120 82 130 76 134 64 C140 44 128 22 100 22 Z" fill={c("gold", 0.92)} {...OUT} />
      <rect x="82" y="42" width="36" height="28" rx="3" fill={c("ink", 0.9)} {...OUT} strokeWidth="1.4" />
      <path d="M82 50 H118 M82 60 H118 M94 42 V70 M106 42 V70" stroke={c("night", 0.45)} strokeWidth="1" />
      <rect x="84" y="94" width="32" height="9" rx="2" fill={c("ink-soft")} {...OUT} />
      <rect x="86" y="103" width="28" height="9" rx="2" fill={c("ink-soft")} {...OUT} />
      <ellipse cx="100" cy="116" rx="8" ry="4" fill={N} />
      <Sparkle x={150} y={96} r={5} fill={c("ice")} />
    </>
  );
}

function CteSteps() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <rect x="40" y="98" width="42" height="28" rx="5" fill={c("turf")} {...OUT} />
      <T x={61} y={116} s={9}>
        WITH
      </T>
      <rect x="84" y="78" width="42" height="48" rx="5" fill={c("ice")} {...OUT} />
      <T x={105} y={96} s={9}>
        step
      </T>
      <rect x="128" y="58" width="42" height="68" rx="5" fill={c("gold")} {...OUT} />
      <T x={149} y={76} s={9}>
        final
      </T>
      <path d="M58 26 H66" stroke={N} strokeWidth="2" />
      <rect x="55" y="22" width="14" height="9" rx="2" fill={c("gold")} {...OUT} />
      <circle cx="62" cy="56" r="21" fill={c("ink", 0.95)} {...OUT} strokeWidth="2.4" />
      <T x={62} y={61} s={13} fill={c("turf-dim")}>
        OT
      </T>
      <path d="M62 36 V40" stroke={N} strokeWidth="2" />
    </>
  );
}

function WindowFrame() {
  const g = c("ink-soft");
  const hi = c("ice");
  return (
    <>
      <Shadow y={134} rx={66} />
      <Bars x={36} y={118} vals={[30, 46, 38, 62, 50, 70, 44]} w={14} gap={5} fills={[g, g, hi, hi, hi, g, g]} />
      <rect x="70" y="30" width="60" height="94" rx="6" fill={c("ice", 0.16)} stroke={N} strokeWidth="5" />
      <rect x="70" y="30" width="60" height="94" rx="6" fill="none" stroke={c("ice")} strokeWidth="2.6" />
      <path d="M100 30 V124" stroke={c("ice", 0.6)} strokeWidth="1.4" />
      <Chip x={100} y={18} text="OVER ( )" fill={c("gold")} />
      <Arrow x1={134} y1={138} x2={152} y2={138} color={c("gold")} w={2.6} />
    </>
  );
}

function Cube() {
  return (
    <>
      <Shadow y={134} rx={52} />
      <path d="M100 30 L144 52 L100 74 L56 52 Z" fill={c("turf")} {...OUT} />
      <path d="M56 52 L100 74 V120 L56 98 Z" fill={c("turf-dim")} {...OUT} />
      <path d="M100 74 L144 52 V98 L100 120 Z" fill={c("ice")} {...OUT} />
      <path d="M70.7 44.7 L114.7 66.7 M85.3 37.3 L129.3 59.3 M70.7 59.3 L114.7 37.3 M85.3 66.7 L129.3 44.7" stroke={N} strokeWidth="1" opacity="0.5" />
      <path d="M56 67.3 L100 89.3 M56 82.7 L100 104.7 M70.7 59.3 V105.3 M85.3 66.7 V112.7" stroke={N} strokeWidth="1" opacity="0.5" />
      <path d="M100 89.3 L144 67.3 M100 104.7 L144 82.7 M114.7 66.7 V112.7 M129.3 59.3 V105.3" stroke={N} strokeWidth="1" opacity="0.5" />
      <Chip x={156} y={28} text="ROLLUP" fill={c("gold")} />
    </>
  );
}

function JoinPlaybook() {
  return (
    <>
      <Shadow y={134} rx={68} />
      <rect x="22" y="20" width="156" height="104" rx="8" fill={c("gold-dim")} {...OUT} />
      <rect x="28" y="26" width="144" height="92" rx="4" fill={c("night-100")} {...OUT} />
      <Sheet x={38} y={38} w={42} h={40} head={c("turf")} rows={3} cols={2} />
      <Sheet x={120} y={66} w={42} h={40} head={c("ice")} rows={3} cols={2} />
      <path d="M82 54 Q110 34 124 58" fill="none" stroke={c("ink", 0.85)} strokeWidth="2.4" strokeDasharray="5 4" strokeLinecap="round" />
      <path d="M124 58 L116 54 L120 48 Z" fill={c("ink", 0.85)} />
      {[
        [58, 100],
        [100, 100],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="6" fill="none" stroke={c("ink", 0.85)} strokeWidth="2.2" />
      ))}
      {[
        [96, 44],
        [150, 44],
      ].map(([x, y]) => (
        <path key={x} d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} stroke={c("ice")} strokeWidth="2.4" strokeLinecap="round" />
      ))}
    </>
  );
}

function CorrelatedLoop() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Sheet x={20} y={34} w={70} h={80} head={c("gold")} rows={4} cols={2} hi={1} hiFill={c("turf", 0.5)} label="outer" />
      <rect x="112" y="40" width="66" height="60" rx="8" fill={c("ice")} {...OUT} />
      <T x={145} y={56} s={8}>
        inner
      </T>
      <rect x="124" y="62" width="42" height="28" rx="6" fill={c("gold")} {...OUT} />
      <T x={145} y={80} s={8}>
        o.player
      </T>
      <path d="M90 60 Q102 44 112 52" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M90 60 Q102 44 112 52" fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" />
      <path d="M112 90 Q100 98 90 84" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M112 90 Q100 98 90 84" fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" />
      <path d="M90 84 L98 86 L94 78 Z" fill={c("turf")} {...OUT} strokeWidth="1.2" />
      <Chip x={145} y={118} text="EXISTS" fill={c("turf")} />
    </>
  );
}

function DateTime() {
  return (
    <>
      <Shadow y={134} rx={56} />
      <Calendar x={40} y={28} w={84} h={78} head={c("turf")} mark={6} />
      <Clock x={138} y={94} r={25} />
      <Chip x={74} y={122} text="DATE_TRUNC" fill={c("gold")} size={7} />
    </>
  );
}

function KpiCard() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Card x={30} y={26} w={140} h={98} fill={c("night-100")} />
      <T x={44} y={46} s={8} fill={c("ink-muted")} anchor="start">
        PPG · WEEK OVER WEEK
      </T>
      <T x={44} y={80} s={26} fill={c("turf")} anchor="start">
        +12%
      </T>
      <path d="M44 112 L62 106 L78 110 L96 100 L112 102 L130 92 L150 94" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Arrow x1={152} y1={78} x2={152} y2={48} color={c("turf")} w={4} />
    </>
  );
}

function CohortTriangle() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Card x={30} y={24} w={140} h={102} fill={c("ink", 0.95)} />
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 5 - r }, (_, k) => (
          <rect
            key={`${r}-${k}`}
            x={42 + k * 24}
            y={34 + r * 17}
            width="21"
            height="14"
            rx="2.5"
            fill={c("ice", r1(0.95 - k * 0.19))}
            stroke={N}
            strokeWidth="1"
          />
        )),
      )}
      <Chip x={140} y={112} text="RETAINED" fill={c("turf")} size={7} />
    </>
  );
}

function Signpost() {
  return (
    <>
      <Shadow y={134} rx={44} />
      <rect x="96" y="26" width="8" height="104" rx="2" fill={c("gold-dim")} {...OUT} />
      <path d="M104 32 H156 L168 43 L156 54 H104 Z" fill={c("turf")} {...OUT} />
      <T x={133} y={47} s={9}>
        WHEN
      </T>
      <path d="M96 60 H44 L32 71 L44 82 H96 Z" fill={c("ice")} {...OUT} />
      <T x={66} y={75} s={9}>
        THEN
      </T>
      <path d="M104 88 H150 L162 99 L150 110 H104 Z" fill={c("gold")} {...OUT} />
      <T x={130} y={103} s={9}>
        ELSE
      </T>
      <Football x={70} y={120} rx={13} rot={-15} />
    </>
  );
}

function TransformMachine() {
  return (
    <>
      <Shadow y={134} rx={74} />
      <Card x={14} y={46} w={46} h={50} fill={c("ink", 0.95)} />
      <path d="M20 58 L28 54 L34 62 L42 52 L52 60 M20 72 Q30 64 36 76 T54 72 M22 86 L32 80 L38 90 L50 82" fill="none" stroke={c("night", 0.5)} strokeWidth="2" strokeLinecap="round" />
      <path d="M60 71 H70" stroke={N} strokeWidth="3" />
      <path d="M76 34 H124 L118 44 H82 Z" fill={c("ink-soft")} {...OUT} />
      <rect x="72" y="44" width="56" height="58" rx="6" fill={c("ice")} {...OUT} />
      <Gear x={100} y={70} r={14} teeth={8} fill={c("gold")} />
      <Arrow x1={130} y1={72} x2={142} y2={72} color={c("turf")} w={3} />
      <Sheet x={146} y={50} w={42} h={46} head={c("turf")} rows={3} cols={2} />
    </>
  );
}

function ScratchPad() {
  return (
    <>
      <Shadow y={134} rx={58} />
      <path d="M36 32 H112 V96 L96 112 H36 Z" fill={c("gold")} {...OUT} />
      <path d="M112 96 L96 112 V96 Z" fill={c("gold-dim")} {...OUT} />
      <rect x="58" y="26" width="32" height="12" rx="2" fill={c("ice", 0.7)} transform="rotate(-6 74 32)" {...OUT} strokeWidth="1.2" />
      {[52, 66, 80, 94].map((y) => (
        <path key={y} d={`M44 ${y} H104`} stroke={c("night", 0.35)} strokeWidth="1.4" />
      ))}
      <path d="M72 46 V104" stroke={c("night", 0.35)} strokeWidth="1.4" />
      <g transform="translate(146 82)">
        <rect x="-22" y="-36" width="44" height="7" rx="3" fill={c("gold-dim")} {...OUT} />
        <rect x="-22" y="29" width="44" height="7" rx="3" fill={c("gold-dim")} {...OUT} />
        <path d="M-16 -29 H16 Q16 -8 3 0 Q16 8 16 29 H-16 Q-16 8 -3 0 Q-16 -8 -16 -29 Z" fill={c("ice", 0.35)} {...OUT} />
        <path d="M-10 -20 H10 Q8 -10 0 -4 Q-8 -10 -10 -20 Z" fill={c("turf")} />
        <path d="M-12 28 H12 Q10 16 0 12 Q-10 16 -12 28 Z" fill={c("turf")} />
      </g>
      <Chip x={74} y={124} text="#temp" fill={c("ice")} />
    </>
  );
}

function Binoculars() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Sheet x={106} y={38} w={72} h={74} head={c("turf")} rows={4} cols={3} label="VIEW" />
      <path d="M78 64 L106 52 M78 90 L106 102" stroke={c("ink", 0.45)} strokeWidth="1.6" strokeDasharray="4 3" />
      <g transform="translate(56 78) rotate(-8)">
        <rect x="-34" y="-25" width="50" height="20" rx="7" fill={c("ice")} {...OUT} />
        <rect x="-34" y="5" width="50" height="20" rx="7" fill={c("ice")} {...OUT} />
        <rect x="-14" y="-7" width="12" height="14" rx="3" fill={c("ink-soft")} {...OUT} />
        <ellipse cx="17" cy="-15" rx="5" ry="10" fill={c("night-100")} {...OUT} />
        <ellipse cx="17" cy="15" rx="5" ry="10" fill={c("night-100")} {...OUT} />
        <path d="M15 -21 Q18 -18 16 -12" stroke={c("ink")} strokeWidth="1.6" fill="none" />
        <rect x="-42" y="-21" width="9" height="12" rx="2" fill={N} />
        <rect x="-42" y="9" width="9" height="12" rx="2" fill={N} />
      </g>
    </>
  );
}

function Speedometer() {
  const P = (deg: number, r = 56) => {
    const a = (deg * Math.PI) / 180;
    return `${r1(100 + r * Math.cos(a))} ${r1(100 - r * Math.sin(a))}`;
  };
  return (
    <>
      <Shadow y={134} rx={60} />
      <path d={`M${P(180)} A56 56 0 0 1 ${P(0)}`} fill="none" stroke={N} strokeWidth="17" />
      <path d={`M${P(180)} A56 56 0 0 1 ${P(120)}`} fill="none" stroke={c("ice")} strokeWidth="12" />
      <path d={`M${P(120)} A56 56 0 0 1 ${P(60)}`} fill="none" stroke={c("gold")} strokeWidth="12" />
      <path d={`M${P(60)} A56 56 0 0 1 ${P(0)}`} fill="none" stroke={c("turf")} strokeWidth="12" />
      <path d={`M100 100 L${P(30, 44)}`} stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d={`M100 100 L${P(30, 44)}`} stroke={c("ink")} strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="100" r="7" fill={c("gold")} {...OUT} />
      <Bolt x={158} y={36} s={1.3} />
      <Chip x={100} y={124} text="EXPLAIN" fill={c("ice")} />
    </>
  );
}

function IndexBook() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <rect x="30" y="28" width="76" height="98" rx="6" fill={c("turf")} {...OUT} />
      <rect x="30" y="28" width="11" height="98" rx="4" fill={c("turf-dim")} {...OUT} />
      <rect x="102" y="32" width="6" height="90" fill={c("ink")} {...OUT} strokeWidth="1.2" />
      {[
        [40, c("gold")],
        [56, c("ice")],
        [72, c("ink-soft")],
        [88, c("gold")],
      ].map(([y, f]) => (
        <rect key={String(y)} x="106" y={Number(y)} width="11" height="11" rx="2" fill={String(f)} {...OUT} strokeWidth="1.3" />
      ))}
      <T x={72} y={72} s={14}>
        A–Z
      </T>
      <path d="M150 46 L136 76 M150 46 L166 76 M136 76 L126 104 M136 76 L144 104" stroke={N} strokeWidth="2.4" />
      {[
        [150, 46, c("gold")],
        [136, 76, c("ice")],
        [166, 76, c("ice")],
        [126, 104, c("turf")],
        [144, 104, c("turf")],
      ].map(([x, y, f]) => (
        <circle key={`${x}-${y}`} cx={Number(x)} cy={Number(y)} r="7" fill={String(f)} {...OUT} />
      ))}
    </>
  );
}

function Transaction() {
  return (
    <>
      <Shadow y={134} rx={56} />
      <Cyl x={100} y={60} w={54} h={48} fill={c("ice")} />
      <Lock x={100} y={102} s={1.1} />
      <Arrow x1={36} y1={50} x2={70} y2={74} color={c("turf")} w={3.5} />
      <Arrow x1={164} y1={50} x2={130} y2={74} color={c("gold")} w={3.5} />
      <Chip x={44} y={30} text="COMMIT" fill={c("turf")} />
      <Chip x={156} y={30} text="ROLLBACK" fill={c("gold")} />
    </>
  );
}

function ErDiagram() {
  const foot = (x: number, y: number, dir: -1 | 1) => (
    <path
      d={`M${x} ${y} L${x - 7 * dir} ${y - 7} M${x} ${y} L${x} ${y - 9} M${x} ${y} L${x + 7 * dir} ${y - 7}`}
      stroke={N}
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
  return (
    <>
      <Shadow y={134} rx={68} />
      <path d="M50 70 L86 92 M150 70 L114 92 M76 52 H124" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M50 70 L86 92 M150 70 L114 92 M76 52 H124" stroke={c("ink-soft")} strokeWidth="2.4" strokeLinecap="round" />
      <Sheet x={22} y={34} w={54} h={36} head={c("turf")} rows={2} cols={1} label="player" />
      <Sheet x={124} y={34} w={54} h={36} head={c("ice")} rows={2} cols={1} label="team" />
      <Sheet x={73} y={92} w={54} h={36} head={c("gold")} rows={2} cols={1} label="game" />
      {foot(86, 92, 1)}
      {foot(114, 92, -1)}
    </>
  );
}

function Forklift() {
  return (
    <>
      <Shadow y={134} rx={70} />
      <rect x="110" y="20" width="70" height="106" rx="3" fill="none" stroke={N} strokeWidth="4" />
      <rect x="110" y="20" width="70" height="106" rx="3" fill="none" stroke={c("ink-soft")} strokeWidth="2" />
      {[56, 92].map((y) => (
        <path key={y} d={`M110 ${y} H180`} stroke={c("ink-soft")} strokeWidth="3" />
      ))}
      <rect x="116" y="36" width="24" height="20" rx="2" fill={c("ice")} {...OUT} />
      <rect x="146" y="40" width="26" height="16" rx="2" fill={c("gold-dim")} {...OUT} />
      <rect x="118" y="72" width="26" height="20" rx="2" fill={c("gold-dim")} {...OUT} />
      <rect x="150" y="70" width="22" height="22" rx="2" fill={c("ice")} {...OUT} />
      <path d="M40 84 V56 H64 L72 84" fill="none" stroke={N} strokeWidth="4" strokeLinejoin="round" />
      <rect x="26" y="84" width="54" height="30" rx="5" fill={c("gold")} {...OUT} />
      <rect x="80" y="46" width="6" height="72" fill={c("ink-soft")} {...OUT} />
      <rect x="86" y="108" width="26" height="5" fill={N} />
      <rect x="86" y="82" width="26" height="26" rx="2" fill={c("turf")} {...OUT} />
      <T x={99} y={99} s={9}>
        fct
      </T>
      {[38, 68].map((x) => (
        <g key={x}>
          <circle cx={x} cy="118" r="9" fill={N} />
          <circle cx={x} cy="118" r="3.5" fill={c("ink-soft")} />
        </g>
      ))}
    </>
  );
}

function JsonBraces() {
  return (
    <>
      <Shadow y={134} rx={58} />
      <Glyph x={40} y={108} s={84} fill={c("ice")}>
        {"{"}
      </Glyph>
      <Glyph x={160} y={108} s={84} fill={c("ice")}>
        {"}"}
      </Glyph>
      <T x={62} y={52} s={9} fill={c("ink")} anchor="start">
        &quot;pos&quot;: &quot;QB&quot;,
      </T>
      <T x={62} y={70} s={9} fill={c("ink")} anchor="start">
        &quot;pts&quot;: 24.6,
      </T>
      <T x={62} y={88} s={9} fill={c("ink")} anchor="start">
        &quot;tags&quot;:
      </T>
      <Chip x={122} y={85} text="[ … ]" fill={c("gold")} />
      <Football x={100} y={114} rx={12} rot={-10} />
    </>
  );
}

function StackTower() {
  return (
    <>
      <Shadow y={134} rx={54} />
      <rect x="52" y="94" width="96" height="32" rx="6" fill={c("turf")} {...OUT} />
      <T x={64} y={114} s={11} anchor="start">
        SQL
      </T>
      <Cyl x={128} y={101} w={20} h={16} fill={c("ink")} />
      <rect x="52" y="60" width="96" height="32" rx="6" fill={c("ice")} {...OUT} />
      <T x={64} y={80} s={11} anchor="start">
        Python
      </T>
      <path d="M122 82 Q122 72 130 72 H136 Q142 72 142 66" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M122 82 Q122 72 130 72 H136 Q142 72 142 66" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" />
      <rect x="52" y="26" width="96" height="32" rx="6" fill={c("gold")} {...OUT} />
      <T x={64} y={46} s={11} anchor="start">
        BI
      </T>
      <Bars x={116} y={52} vals={[8, 14, 20]} w={6} gap={3} fills={[c("ink")]} />
    </>
  );
}

function AnomalySpike() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <Card x={26} y={28} w={148} h={94} fill={c("night-100")} />
      <path d="M38 98 L56 94 L72 100 L88 92 L104 96 L116 44 L128 94 L144 90 L162 96" fill="none" stroke={c("ice")} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="116" cy="44" r="6" fill={c("gold")} {...OUT} />
      <path d="M146 36 L162 62 H130 Z" fill={c("gold")} {...OUT} />
      <T x={146} y={58} s={14}>
        !
      </T>
      <Magnifier x={62} y={62} r={14} rot={45} />
    </>
  );
}

function Briefcase() {
  return (
    <>
      <Shadow y={134} rx={58} />
      <Bars x={66} y={78} vals={[18, 30, 44, 58]} w={14} gap={6} fills={[c("ice"), c("turf")]} />
      <path d="M66 50 L86 42 L106 30 L126 18" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <rect x="84" y="62" width="32" height="14" rx="5" fill="none" stroke={N} strokeWidth="7" />
      <rect x="84" y="62" width="32" height="14" rx="5" fill="none" stroke={c("ink-soft")} strokeWidth="3.5" />
      <rect x="48" y="72" width="104" height="56" rx="8" fill={c("gold-dim")} {...OUT} />
      <path d="M48 92 H152" stroke={N} strokeWidth="1.6" />
      <rect x="92" y="86" width="16" height="12" rx="2" fill={c("gold")} {...OUT} />
    </>
  );
}

function InterviewBoard() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <rect x="26" y="20" width="148" height="66" rx="5" fill={c("ink", 0.95)} {...OUT} />
      <T x={36} y={40} s={9} fill={c("turf-dim")} anchor="start">
        SELECT player, AVG(pts)
      </T>
      <T x={36} y={56} s={9} fill={c("ice-dim")} anchor="start">
        GROUP BY player
      </T>
      <T x={36} y={72} s={9} fill={c("gold-dim")} anchor="start">
        HAVING COUNT(*) &gt; 8
      </T>
      <Bubble x={28} y={94} w={52} h={24} tail="left" fill={c("ice")}>
        <T x={54} y={110} s={11}>
          Q?
        </T>
      </Bubble>
      <Bubble x={120} y={94} w={52} h={24} tail="right" fill={c("turf")}>
        <T x={146} y={110} s={11}>
          A ✓
        </T>
      </Bubble>
    </>
  );
}

function CodeReview() {
  return (
    <>
      <Shadow y={134} rx={60} />
      <Card x={28} y={26} w={124} h={98} fill={c("night-100")} />
      {[
        [40, 42, 40, c("ink-muted")],
        [40, 56, 52, c("turf")],
        [52, 70, 60, c("ice")],
        [52, 84, 44, c("ice")],
        [40, 98, 56, c("gold")],
        [52, 112, 36, c("ink-soft")],
      ].map(([x, y, w, f]) => (
        <rect key={String(y)} x={Number(x)} y={Number(y)} width={Number(w)} height="5" rx="2.5" fill={String(f)} />
      ))}
      <path d="M46 64 V116" stroke={c("ink", 0.2)} strokeWidth="1.4" />
      <g transform="rotate(-14 150 92)">
        <circle cx="150" cy="92" r="24" fill={c("gold")} {...OUT} strokeWidth="2.4" />
        <circle cx="150" cy="92" r="18" fill="none" stroke={N} strokeWidth="1.4" strokeDasharray="3 2" />
        <T x={150} y={96} s={10}>
          LGTM
        </T>
      </g>
    </>
  );
}

function ProBowlHelmet() {
  return (
    <>
      <Shadow y={134} rx={56} />
      {[
        [40, 34, 7],
        [160, 30, 8],
        [166, 102, 6],
      ].map(([x, y, r]) => (
        <path key={x} d={starPath(x, y, 5, r, r * 0.45, -90)} fill={c("gold")} {...OUT} />
      ))}
      <g transform="translate(96 80)">
        <path d="M-42 12 Q-46 -34 0 -40 Q40 -40 46 -6 Q48 8 38 14 L10 14 Q6 26 -6 26 L-32 26 Q-42 24 -42 12 Z" fill={c("ice")} {...OUT} />
        <path d="M-6 -39 Q-40 -30 -42 8" stroke={c("ink")} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M38 -2 H60 M36 10 H60 M54 -8 V20" stroke={N} strokeWidth="6" strokeLinecap="round" />
        <path d="M38 -2 H60 M36 10 H60 M54 -8 V20" stroke={c("ink-soft")} strokeWidth="3" strokeLinecap="round" />
        <circle cx="-4" cy="4" r="4.5" fill={N} />
        <path d={starPath(-18, -14, 5, 11, 5, -90)} fill={c("gold")} {...OUT} />
      </g>
      <Chip x={100} y={124} text="PRO BOWL" fill={c("gold")} />
    </>
  );
}

function Dominoes() {
  const tiles = [
    { x: 50, a: 56, f: c("ice") },
    { x: 78, a: 42, f: c("gold") },
    { x: 106, a: 26, f: c("turf") },
    { x: 134, a: 10, f: c("ice") },
    { x: 162, a: 0, f: c("gold") },
  ];
  return (
    <>
      <Shadow y={130} rx={74} />
      {tiles.map((t) => (
        <g key={t.x} transform={`rotate(${t.a} ${t.x + 16} 126)`}>
          <rect x={t.x} y="66" width="16" height="60" rx="3" fill={c("ink", 0.95)} {...OUT} />
          <path d={`M${t.x} 96 H${t.x + 16}`} stroke={N} strokeWidth="1.6" />
          <circle cx={t.x + 5} cy="76" r="2.6" fill={t.f} stroke={N} strokeWidth="0.9" />
          <circle cx={t.x + 11} cy="86" r="2.6" fill={t.f} stroke={N} strokeWidth="0.9" />
          <circle cx={t.x + 8} cy="111" r="2.8" fill={t.f} stroke={N} strokeWidth="0.9" />
        </g>
      ))}
      <Chip x={40} y={26} text="INSERT" fill={c("turf")} />
      <Arrow x1={40} y1={38} x2={52} y2={64} color={c("turf")} w={3} />
      <Sparkle x={182} y={44} r={5} fill={c("gold")} />
    </>
  );
}

// ═══ Python ═════════════════════════════════════════════════════════

function SteeringSnake() {
  return (
    <>
      <Shadow y={134} rx={52} />
      <circle cx="96" cy="80" r="40" fill="none" stroke={N} strokeWidth="13" />
      <circle cx="96" cy="80" r="40" fill="none" stroke={c("ink-soft")} strokeWidth="8" />
      {["M96 80 L96 118", "M96 80 L62 62", "M96 80 L130 62"].map((d) => (
        <g key={d}>
          <path d={d} stroke={N} strokeWidth="10" strokeLinecap="round" />
          <path d={d} stroke={c("ink-soft")} strokeWidth="6" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="96" cy="80" r="13" fill={c("gold")} {...OUT} />
      <T x={96} y={84} s={10}>
        py
      </T>
      <Snake x={140} y={50} s={1} fill={c("turf")} />
    </>
  );
}

function Flowchart() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <path d="M100 24 L128 50 L100 76 L72 50 Z" fill={c("gold")} {...OUT} />
      <T x={100} y={54} s={11}>
        if
      </T>
      <Arrow x1={72} y1={50} x2={58} y2={88} color={c("ink-soft")} w={3} />
      <Arrow x1={128} y1={50} x2={142} y2={88} color={c("ink-soft")} w={3} />
      <rect x="34" y="90" width="48" height="30" rx="6" fill={c("ice")} {...OUT} />
      <Check x={58} y={105} r={9} />
      <rect x="118" y="90" width="48" height="30" rx="6" fill={c("ice")} {...OUT} />
      <Cross x={142} y={105} r={9} />
      <Chip x={156} y={24} text="def" fill={c("turf")} />
      <Bolt x={44} y={30} s={0.9} />
    </>
  );
}

function PandaFrame() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <circle cx="54" cy="36" r="10" fill={N} />
      <circle cx="96" cy="36" r="10" fill={N} />
      <circle cx="75" cy="60" r="30" fill={c("ink")} {...OUT} />
      <ellipse cx="63" cy="58" rx="8" ry="10" fill={N} transform="rotate(20 63 58)" />
      <ellipse cx="87" cy="58" rx="8" ry="10" fill={N} transform="rotate(-20 87 58)" />
      <circle cx="64" cy="57" r="2.6" fill={c("ink")} />
      <circle cx="86" cy="57" r="2.6" fill={c("ink")} />
      <ellipse cx="75" cy="71" rx="5" ry="3.5" fill={N} />
      <Sheet x={82} y={78} w={86} h={50} head={c("ice")} rows={3} cols={3} label="df" />
      <ellipse cx="90" cy="82" rx="9" ry="7" fill={N} />
      <ellipse cx="124" cy="80" rx="9" ry="7" fill={N} />
    </>
  );
}

function PythonFinal() {
  return (
    <>
      <Shadow y={134} rx={50} />
      <Confetti cx={100} cy={38} spread={80} />
      <Trophy x={96} y={130} s={1.3} plate="PY" />
      <Snake x={150} y={108} s={0.85} fill={c("turf")} />
      <Sparkle x={46} y={64} r={6} fill={c("gold")} />
    </>
  );
}

// ═══ Excel ══════════════════════════════════════════════════════════

function FormulaGrid() {
  const cw = 33.5;
  const rh = 17;
  return (
    <>
      <Shadow y={134} rx={68} />
      <Card x={24} y={20} w={152} h={20} fill={c("ink", 0.95)} />
      <Chip x={38} y={30} text="fx" fill={c("turf")} size={8} />
      <T x={54} y={34} s={9} anchor="start">
        =SUM(B2:B4)
      </T>
      <rect x="24" y="46" width="152" height="82" rx="4" fill={c("ink", 0.95)} {...OUT} />
      <rect x="24" y="46" width="152" height="12" fill={c("turf", 0.35)} />
      <rect x="24" y="46" width="14" height="82" fill={c("turf", 0.35)} />
      {["A", "B", "C", "D"].map((l, i) => (
        <T key={l} x={r1(38 + cw * i + cw / 2)} y={55} s={7}>
          {l}
        </T>
      ))}
      {[1, 2, 3, 4].map((n, i) => (
        <T key={n} x={31} y={r1(58 + rh * i + 11.5)} s={7}>
          {n}
        </T>
      ))}
      {[1, 2, 3].map((i) => (
        <path key={`h${i}`} d={`M24 ${58 + rh * i} H176`} stroke={c("night", 0.15)} />
      ))}
      {[1, 2, 3].map((i) => (
        <path key={`v${i}`} d={`M${r1(38 + cw * i)} 46 V128`} stroke={c("night", 0.15)} />
      ))}
      {["430.4", "403.0", "379.1"].map((v, i) => (
        <T key={v} x={r1(38 + cw * 2 - 4)} y={r1(58 + rh * i + 11.5)} s={7} fill={c("night", 0.7)} anchor="end">
          {v}
        </T>
      ))}
      <rect x={r1(38 + cw)} y={58 + rh * 3} width={cw} height={rh} fill={c("turf", 0.25)} stroke={c("turf-dim")} strokeWidth="2.6" />
      <rect x={r1(38 + cw * 2 - 3)} y={58 + rh * 4 - 3} width="6" height="6" fill={c("turf-dim")} />
      <T x={r1(38 + cw * 2 - 4)} y={r1(58 + rh * 3 + 11.5)} s={7} anchor="end">
        1212.5
      </T>
    </>
  );
}

function IfCells() {
  const rows: [string, boolean][] = [
    ["430.4", true],
    ["262.1", false],
    ["341.7", true],
    ["218.2", false],
  ];
  return (
    <>
      <Shadow y={134} rx={58} />
      <Chip x={100} y={24} text="=IF(E2>300, …)" fill={c("gold")} size={8} />
      {rows.map(([v, ok], i) => (
        <g key={v}>
          <rect x="56" y={40 + i * 22} width="88" height="18" rx="3" fill={c("ink", 0.95)} {...OUT} />
          <T x={66} y={53 + i * 22} s={9} anchor="start">
            {v}
          </T>
          {ok ? <Check x={132} y={49 + i * 22} r={7} /> : <Cross x={132} y={49 + i * 22} r={7} />}
        </g>
      ))}
    </>
  );
}

function LookupRow() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Sheet x={22} y={46} w={156} h={70} head={c("ice")} rows={3} cols={4} hi={1} hiFill={c("gold", 0.5)} />
      <Magnifier x={138} y={80} r={15} rot={40} />
      <Chip x={64} y={28} text="XLOOKUP" fill={c("gold")} />
      <Sparkle x={168} y={40} r={5} />
    </>
  );
}

function Scissors() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Card x={20} y={34} w={108} h={28} fill={c("ink", 0.95)} />
      {[28, 36, 104, 112].map((x) => (
        <rect key={x} x={x} y="45" width="6" height="6" rx="1" fill={c("night", 0.25)} />
      ))}
      <T x={74} y={52} s={11}>
        402.5
      </T>
      <g transform="translate(150 46) rotate(-18)">
        <path d="M0 0 L-38 -9 L-38 -3 Z" fill={c("ink-soft")} {...OUT} />
        <path d="M0 0 L-38 9 L-38 3 Z" fill={c("ink-soft")} {...OUT} />
        <circle cx="12" cy="-8" r="6.5" fill="none" stroke={N} strokeWidth="5" />
        <circle cx="12" cy="-8" r="6.5" fill="none" stroke={c("gold")} strokeWidth="2.6" />
        <circle cx="12" cy="8" r="6.5" fill="none" stroke={N} strokeWidth="5" />
        <circle cx="12" cy="8" r="6.5" fill="none" stroke={c("gold")} strokeWidth="2.6" />
        <circle cx="0" cy="0" r="2.4" fill={N} />
      </g>
      <Arrow x1={74} y1={68} x2={74} y2={88} color={c("turf")} w={3.5} />
      <rect x="42" y="92" width="64" height="28" rx="5" fill={c("turf")} {...OUT} />
      <T x={74} y={110} s={11}>
        402.5
      </T>
      <Chip x={152} y={106} text="TRIM" fill={c("gold")} />
      <Sparkle x={116} y={90} r={5} />
    </>
  );
}

function DraftPodium() {
  return (
    <>
      <Shadow y={134} rx={54} />
      <Confetti cx={100} cy={30} spread={70} />
      <path d="M64 128 L72 78 H128 L136 128 Z" fill={c("ice")} {...OUT} />
      <rect x="66" y="72" width="68" height="10" rx="3" fill={c("ink-soft")} {...OUT} />
      <Football x={100} y={104} rx={14} />
      <path d="M96 72 L104 48" stroke={N} strokeWidth="3" />
      <ellipse cx="106" cy="42" rx="6" ry="8" fill={c("ink-soft")} {...OUT} />
      <g transform="rotate(8 150 46)">
        <rect x="128" y="28" width="46" height="36" rx="4" fill={c("ink", 0.95)} {...OUT} />
        <path d="M128 40 V32 Q128 28 132 28 H170 Q174 28 174 32 V40 Z" fill={c("gold")} {...OUT} />
        <T x={151} y={38} s={7}>
          PICK
        </T>
        <rect x="134" y="46" width="34" height="4" rx="2" fill={c("night", 0.35)} />
        <rect x="134" y="54" width="22" height="4" rx="2" fill={c("night", 0.35)} />
      </g>
    </>
  );
}

// ═══ Statistics · Visualization ═════════════════════════════════════

function NoiseTrend() {
  // Scattered well off the line on both sides: the picture is that the trend
  // is only visible once you stop looking at any one dot.
  const dots: [number, number][] = [
    [44, 96], [50, 118], [58, 90], [64, 114], [72, 84], [78, 108],
    [86, 78], [92, 104], [100, 68], [106, 96], [114, 60], [120, 90],
    [128, 56], [134, 82], [142, 46], [150, 72], [156, 42], [160, 64],
  ];
  return (
    <>
      <Shadow y={134} rx={64} />
      <Card x={26} y={24} w={148} h={100} fill={c("night-100")} />
      <path d="M40 124 L162 66 L162 38 L40 96 Z" fill={c("ice", 0.18)} />
      <Arrow x1={40} y1={110} x2={162} y2={52} color={c("gold")} w={3} />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.4" fill={c("ink-soft")} stroke={N} strokeWidth="1" />
      ))}
    </>
  );
}

function FilmProjector() {
  return (
    <>
      <Shadow y={134} rx={70} />
      <path d="M80 96 L106 30 L106 84 Z" fill={c("gold", 0.18)} />
      <rect x="104" y="22" width="76" height="64" rx="4" fill={c("ink", 0.95)} {...OUT} />
      <path d="M112 78 C128 78 132 34 142 34 C152 34 156 78 172 78" fill="none" stroke={c("turf-dim")} strokeWidth="3" strokeLinecap="round" />
      <path d="M142 34 V78" stroke={c("gold-dim")} strokeWidth="1.6" strokeDasharray="3 3" />
      <path d="M126 86 L120 112 M158 86 L164 112" stroke={N} strokeWidth="3" />
      <rect x="22" y="88" width="50" height="30" rx="5" fill={c("ink-soft")} {...OUT} />
      <rect x="72" y="94" width="10" height="16" rx="2" fill={c("night-100")} {...OUT} />
      {[36, 60].map((x) => (
        <g key={x}>
          <circle cx={x} cy="76" r="12" fill={N} />
          <circle cx={x} cy="76" r="4" fill={c("ink-soft")} />
          <path d={`M${x - 8} 76 H${x + 8} M${x} 68 V84`} stroke={c("ink-soft")} strokeWidth="1.6" />
        </g>
      ))}
    </>
  );
}

function PointLands() {
  const g = c("ink-soft");
  return (
    <>
      <Shadow y={134} rx={62} />
      <path d="M34 122 H170" stroke={N} strokeWidth="3" strokeLinecap="round" />
      <Bars x={40} y={121} vals={[30, 42, 36, 84, 40, 34]} w={16} gap={6} fills={[g, g, g, c("gold"), g, g]} />
      <Bubble x={112} y={8} w={60} h={22} tail="left" fill={c("turf")}>
        <T x={142} y={23} s={10}>
          +48%
        </T>
      </Bubble>
      <Sparkle x={62} y={60} r={5} />
    </>
  );
}

function BroadcastBooth() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Monitor x={72} y={34} w={100} h={64}>
        <Bars x={86} y={88} vals={[14, 26, 20, 36, 30]} w={10} gap={6} fills={[c("ice"), c("turf"), c("gold")]} />
      </Monitor>
      <Chip x={122} y={20} text="ON AIR" fill={c("gold")} />
      <path d="M24 86 A24 24 0 0 1 72 86" fill="none" stroke={N} strokeWidth="8" />
      <path d="M24 86 A24 24 0 0 1 72 86" fill="none" stroke={c("ink-soft")} strokeWidth="4" />
      <rect x="18" y="80" width="12" height="24" rx="5" fill={c("ice")} {...OUT} />
      <rect x="66" y="80" width="12" height="24" rx="5" fill={c("ice")} {...OUT} />
      <path d="M24 102 Q30 118 50 116" fill="none" stroke={N} strokeWidth="3.4" />
      <circle cx="52" cy="116" r="4.5" fill={c("gold")} {...OUT} />
    </>
  );
}

// ═══ Git · R ════════════════════════════════════════════════════════

function ShowYourWork() {
  const level = (i: number) => [0.2, 0.55, 0.9, 0.35, 0.75][(i * 7 + (i >> 2)) % 5];
  return (
    <>
      <Shadow y={134} rx={64} />
      <BranchGraph x={44} y={52} w={112} />
      <rect x="30" y="72" width="140" height="54" rx="8" fill={c("night-100")} {...OUT} />
      {Array.from({ length: 40 }, (_, i) => (
        <rect
          key={i}
          x={38 + (i % 10) * 13}
          y={80 + Math.floor(i / 10) * 11}
          width="10"
          height="8"
          rx="2"
          fill={c("turf", level(i))}
        />
      ))}
    </>
  );
}

function Locker() {
  return (
    <>
      <Shadow y={134} rx={62} />
      {[40, 104].map((x) => (
        <g key={x}>
          <rect x={x} y="16" width="56" height="114" rx="4" fill={c("ice")} {...OUT} />
          {[24, 30, 36].map((y) => (
            <path key={y} d={`M${x + 12} ${y} H${x + 44}`} stroke={N} strokeWidth="2" strokeLinecap="round" />
          ))}
          <rect x={x + 44} y="70" width="5" height="14" rx="2" fill={c("ink-soft")} {...OUT} strokeWidth="1.2" />
        </g>
      ))}
      <path d="M76 50 L88 42 H112 L124 50 L132 66 L122 70 V114 H78 V70 L68 66 Z" fill={c("gold")} {...OUT} />
      <path d="M92 42 Q100 50 108 42" fill="none" stroke={N} strokeWidth="1.6" />
      <T x={100} y={86} s={13}>
        GIT
      </T>
      <path d="M100 34 V42" stroke={N} strokeWidth="2" />
      <path d="M96 34 Q100 28 104 34" fill="none" stroke={N} strokeWidth="2" />
    </>
  );
}

function OtherDialect() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Bubble x={20} y={20} w={80} h={30} tail="right" fill={c("turf")}>
        <T x={60} y={39} s={10}>
          GROUP BY
        </T>
      </Bubble>
      <Bubble x={100} y={62} w={80} h={30} tail="left" fill={c("ice")}>
        <T x={140} y={81} s={12}>
          %&gt;%
        </T>
      </Bubble>
      <HexBadge x={58} y={100} r={21} text="R" />
      <Sparkle x={160} y={30} r={5} fill={c("gold")} />
    </>
  );
}

function CombineDrill() {
  const cone = (x: number) => (
    <g key={x}>
      <path d={`M${x - 11} 124 L${x - 3} 96 H${x + 3} L${x + 11} 124 Z`} fill={c("gold")} {...OUT} />
      <path d={`M${x - 7} 112 H${x + 7}`} stroke={c("ink")} strokeWidth="3" />
      <rect x={x - 15} y="122" width="30" height="5" rx="2" fill={c("gold-dim")} {...OUT} />
    </g>
  );
  return (
    <>
      <Shadow y={134} rx={70} />
      <path d="M44 126 H156" stroke={c("ink", 0.6)} strokeWidth="2" strokeDasharray="6 5" />
      {cone(38)}
      {cone(162)}
      <rect x="93" y="28" width="14" height="10" rx="2" fill={c("gold")} {...OUT} />
      <circle cx="100" cy="70" r="30" fill={c("ink", 0.95)} {...OUT} strokeWidth="2.6" />
      <T x={100} y={76} s={15} fill={c("turf-dim")}>
        4.41
      </T>
      <path d="M100 46 V52" stroke={N} strokeWidth="2" />
      <HexBadge x={148} y={40} r={14} text="R" />
    </>
  );
}

// ═══ Tableau ════════════════════════════════════════════════════════

function DragToShelf() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Card x={24} y={22} w={152} h={104} fill={c("night-100")} />
      <rect x="32" y="30" width="136" height="14" rx="3" fill={c("panel")} {...OUT} strokeWidth="1.2" />
      <rect x="32" y="48" width="136" height="14" rx="3" fill={c("panel")} {...OUT} strokeWidth="1.2" />
      <Chip x={66} y={37} text="Week" fill={c("ice")} size={7} />
      <rect x="54" y="50" width="30" height="10" rx="5" fill="none" stroke={c("turf")} strokeWidth="1.6" strokeDasharray="3 2" />
      <Chip x={112} y={62} text="Pts" fill={c("turf")} size={8} />
      <Pointer x={120} y={64} />
      <Bars x={44} y={118} vals={[18, 32, 26, 44, 36]} w={12} gap={6} fills={[c("ice")]} />
    </>
  );
}

function MarksPalette() {
  return (
    <>
      <Shadow y={134} rx={60} />
      <Card x={30} y={22} w={140} h={104} fill={c("ink", 0.95)} />
      <path d="M30 38 V28 Q30 22 36 22 H164 Q170 22 170 28 V38 Z" fill={c("turf")} {...OUT} />
      <T x={100} y={34} s={8}>
        MARKS
      </T>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 40 + (i % 3) * 44;
        const y = 46 + Math.floor(i / 3) * 40;
        return <rect key={i} x={x} y={y} width="36" height="32" rx="4" fill={c("night", 0.08)} stroke={N} strokeWidth="1.2" />;
      })}
      <Bars x={46} y={72} vals={[10, 18, 14]} w={6} gap={3} fills={[c("ice")]} />
      <path d="M90 70 L98 58 L106 64 L116 52" fill="none" stroke={c("turf-dim")} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="146" cy="62" r="9" fill={c("gold")} {...OUT} />
      <rect x="49" y="95" width="18" height="18" rx="2" fill={c("ice")} {...OUT} />
      <T x={102} y={108} s={10}>
        Abc
      </T>
      <path d={slicePath(146, 104, 11, 0, 250)} fill={c("turf")} {...OUT} />
    </>
  );
}

function CalcEditor() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Card x={28} y={26} w={144} h={96} fill={c("night-100")} />
      <path d="M28 42 V32 Q28 26 34 26 H166 Q172 26 172 32 V42 Z" fill={c("gold")} {...OUT} />
      <T x={40} y={37} s={8} anchor="start">
        CALC · PPG
      </T>
      <T x={40} y={62} s={10} fill={c("turf")} anchor="start">
        SUM([Pts])
      </T>
      <T x={40} y={80} s={10} fill={c("ice")} anchor="start">
        / COUNTD([Wk])
      </T>
      <Check x={46} y={104} r={7} />
      <T x={58} y={107} s={8} fill={c("ink-soft")} anchor="start">
        valid
      </T>
      <Bars x={132} y={112} vals={[14, 24, 32]} w={9} gap={3} fills={[c("gold")]} />
    </>
  );
}

function FilterDropdown() {
  const rows: [string, boolean][] = [
    ["QB", true],
    ["RB", true],
    ["WR", false],
    ["TE", false],
  ];
  return (
    <>
      <Shadow y={134} rx={56} />
      <Card x={46} y={22} w={100} h={20} fill={c("ink", 0.95)} />
      <T x={56} y={36} s={9} anchor="start">
        Position ▾
      </T>
      <Card x={46} y={46} w={100} h={80} fill={c("ink", 0.95)} />
      {rows.map(([p, on], i) => (
        <g key={p}>
          <rect x="56" y={54 + i * 18} width="11" height="11" rx="2" fill={on ? c("turf") : c("ink")} {...OUT} strokeWidth="1.4" />
          {on && (
            <path d={`M58.5 ${60 + i * 18} L61 ${62.5 + i * 18} L65 ${57 + i * 18}`} fill="none" stroke={N} strokeWidth="1.8" strokeLinecap="round" />
          )}
          <T x={74} y={63 + i * 18} s={9} anchor="start">
            {p}
          </T>
        </g>
      ))}
      <Pointer x={126} y={92} />
    </>
  );
}

function DashboardPage() {
  return (
    <>
      <Shadow y={134} rx={54} />
      <path d="M52 16 H136 L148 28 V134 H52 Z" fill={c("ink", 0.95)} {...OUT} />
      <path d="M136 16 V28 H148 Z" fill={c("ink-soft")} {...OUT} />
      <rect x="60" y="26" width="52" height="5" rx="2.5" fill={c("night", 0.4)} />
      <rect x="60" y="38" width="38" height="22" rx="3" fill={c("turf")} {...OUT} strokeWidth="1.3" />
      <rect x="102" y="38" width="38" height="22" rx="3" fill={c("gold")} {...OUT} strokeWidth="1.3" />
      <rect x="60" y="66" width="80" height="34" rx="3" fill={c("night", 0.08)} {...OUT} strokeWidth="1.3" />
      <Bars x={66} y={96} vals={[10, 18, 14, 24, 20, 26]} w={8} gap={4} fills={[c("ice")]} />
      <rect x="60" y="106" width="80" height="22" rx="3" fill={c("night", 0.08)} {...OUT} strokeWidth="1.3" />
      <path d="M66 122 L80 114 L94 118 L110 110 L134 112" fill="none" stroke={c("turf-dim")} strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

function PortfolioBadge() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Card x={22} y={26} w={124} h={90} fill={c("ink", 0.95)} />
      <path d="M22 40 V32 Q22 26 28 26 H140 Q146 26 146 32 V40 Z" fill={c("ink-soft")} {...OUT} />
      {[30, 38, 46].map((x) => (
        <circle key={x} cx={x} cy="33" r="2.4" fill={N} />
      ))}
      <rect x="56" y="29" width="80" height="8" rx="4" fill={c("ink")} stroke={N} strokeWidth="1" />
      <T x={60} y={35.5} s={6} anchor="start">
        public/you
      </T>
      <Bars x={36} y={106} vals={[20, 36, 28, 50, 42]} w={12} gap={6} fills={[c("ice"), c("turf")]} />
      <path d="M142 104 L134 128 L144 122 L150 132 L154 108 Z" fill={c("ice")} {...OUT} />
      <path d="M160 104 L168 128 L158 122 L152 132 L148 108 Z" fill={c("turf")} {...OUT} />
      <path d={starPath(152, 90, 12, 22, 18, 0)} fill={c("gold")} {...OUT} />
      <Check x={152} y={90} r={11} />
    </>
  );
}

// ═══ Power BI ═══════════════════════════════════════════════════════

function PowerPlug() {
  return (
    <>
      <Shadow y={134} rx={62} />
      <Card x={88} y={30} w={86} h={70} fill={c("night-100")} />
      <Bars x={100} y={92} vals={[16, 30, 24, 42]} w={11} gap={6} fills={[c("gold"), c("ice")]} />
      <path d="M22 118 Q40 118 48 96 Q54 78 66 72" fill="none" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M22 118 Q40 118 48 96 Q54 78 66 72" fill="none" stroke={c("ink-soft")} strokeWidth="3.6" strokeLinecap="round" />
      <rect x="62" y="60" width="20" height="22" rx="4" fill={c("gold")} {...OUT} />
      <path d="M82 66 H90 M82 76 H90" stroke={N} strokeWidth="3" strokeLinecap="round" />
      <Bolt x={66} y={36} s={1.1} />
    </>
  );
}

function AppliedSteps() {
  return (
    <>
      <Shadow y={134} rx={68} />
      <Card x={20} y={22} w={90} h={104} fill={c("ink", 0.95)} />
      <T x={30} y={38} s={8} anchor="start">
        APPLIED STEPS
      </T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Check x={34} y={54 + i * 20} r={6} fill={i === 3 ? c("gold") : c("turf")} />
          <rect x="46" y={51 + i * 20} width={[48, 40, 52, 36][i]} height="5" rx="2.5" fill={c("night", 0.3)} />
        </g>
      ))}
      <Arrow x1={114} y1={74} x2={132} y2={74} color={c("ice")} w={3.5} />
      <Sheet x={136} y={48} w={46} h={52} head={c("ice")} rows={3} cols={2} />
    </>
  );
}

function StarSchema() {
  const dims: [number, number, string][] = [
    [22, 22, c("turf")],
    [140, 22, c("ice")],
    [22, 100, c("ice")],
    [140, 100, c("turf")],
  ];
  return (
    <>
      <Shadow y={134} rx={70} />
      {dims.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M100 76 L${x + 19} ${y + 14}`} stroke={N} strokeWidth="5" />
          <path d={`M100 76 L${x + 19} ${y + 14}`} stroke={c("ink-soft")} strokeWidth="2.4" />
        </g>
      ))}
      {dims.map(([x, y, f]) => (
        <Sheet key={`d${x}-${y}`} x={x} y={y} w={38} h={28} head={f} rows={2} cols={1} label="dim" />
      ))}
      <Sheet x={76} y={56} w={48} h={42} head={c("gold")} rows={2} cols={2} label="fact" />
      <path d={starPath(100, 44, 5, 8, 3.6, -90)} fill={c("gold")} {...OUT} />
    </>
  );
}

function DaxMeasure() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <Card x={24} y={34} w={152} h={78} fill={c("night-100")} />
      <path d="M24 48 V40 Q24 34 30 34 H170 Q176 34 176 40 V48 Z" fill={c("ice")} {...OUT} />
      <T x={34} y={44.5} s={7} anchor="start">
        MEASURE
      </T>
      <T x={34} y={66} s={10} fill={c("ink")} anchor="start">
        Wins =
      </T>
      <T x={34} y={84} s={11} fill={c("gold")} anchor="start">
        CALCULATE(
      </T>
      <T x={46} y={100} s={9} fill={c("ice")} anchor="start">
        COUNTROWS(games), …)
      </T>
      <Bolt x={162} y={24} s={1.1} />
      <Chip x={50} y={22} text="DAX" fill={c("gold")} />
    </>
  );
}

function ReportPage() {
  return (
    <>
      <Shadow y={134} rx={68} />
      <Card x={20} y={24} w={160} h={100} fill={c("ink", 0.95)} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="28" y={34 + i * 20} width="30" height="14" rx="3" fill={i === 1 ? c("gold") : c("night", 0.1)} {...OUT} strokeWidth="1.2" />
      ))}
      <path d={slicePath(94, 70, 22, 0, 150)} fill={c("turf")} {...OUT} />
      <path d={slicePath(94, 70, 22, 150, 260)} fill={c("ice")} {...OUT} />
      <path d={slicePath(94, 70, 22, 260, 360)} fill={c("gold")} {...OUT} />
      <circle cx="94" cy="70" r="9" fill={c("ink")} {...OUT} />
      <Bars x={126} y={110} vals={[20, 36, 26, 46]} w={9} gap={4} fills={[c("ice"), c("turf")]} />
    </>
  );
}

function IdBadge() {
  return (
    <>
      <Shadow y={136} rx={44} />
      <path d="M72 0 L100 42 L128 0" fill="none" stroke={N} strokeWidth="9" strokeLinejoin="round" />
      <path d="M72 0 L100 42 L128 0" fill="none" stroke={c("turf")} strokeWidth="5.5" strokeLinejoin="round" />
      <rect x="93" y="38" width="14" height="12" rx="2" fill={c("ink-soft")} {...OUT} />
      <rect x="66" y="48" width="68" height="84" rx="7" fill={c("ink", 0.95)} {...OUT} />
      <path d="M66 62 V55 Q66 48 73 48 H127 Q134 48 134 55 V62 Z" fill={c("turf")} {...OUT} />
      <rect x="78" y="68" width="44" height="30" rx="3" fill={c("night-100")} {...OUT} strokeWidth="1.3" />
      <Bars x={84} y={94} vals={[8, 16, 12, 20]} w={6} gap={3} fills={[c("gold"), c("ice")]} />
      <T x={100} y={110} s={8}>
        ANALYST
      </T>
      {[78, 82, 85, 90, 93, 98, 101, 106, 110, 114, 118, 121].map((x) => (
        <path key={x} d={`M${x} 116 V126`} stroke={N} strokeWidth={x % 2 ? 1 : 2} />
      ))}
    </>
  );
}

// ═══ AI ═════════════════════════════════════════════════════════════

function NextToken() {
  return (
    <>
      <Shadow y={134} rx={64} />
      <Robot x={50} y={70} s={0.95} />
      <Chip x={104} y={36} text="QB" fill={c("ink-soft")} />
      <Chip x={140} y={36} text="threw" fill={c("ink-soft")} />
      <Chip x={104} y={60} text="a" fill={c("ink-soft")} />
      <Chip x={136} y={60} text="?" fill={c("gold")} />
      <rect x="96" y="80" width="66" height="10" rx="3" fill={c("turf")} {...OUT} />
      <T x={170} y={88} s={7} fill={c("ink")} anchor="start">
        pass
      </T>
      <rect x="96" y="96" width="24" height="10" rx="3" fill={c("ice")} {...OUT} />
      <T x={128} y={104} s={7} fill={c("ink")} anchor="start">
        pick
      </T>
      <rect x="96" y="112" width="10" height="10" rx="3" fill={c("ink-soft")} {...OUT} />
      <T x={114} y={120} s={7} fill={c("ink")} anchor="start">
        punt
      </T>
    </>
  );
}

function AskingWell() {
  const rows: [string, string][] = [
    ["ROLE", c("ice")],
    ["DATA", c("turf")],
    ["FORMAT", c("gold")],
  ];
  return (
    <>
      <Shadow y={134} rx={58} />
      <Bubble x={26} y={18} w={118} h={84} tail="left">
        {rows.map(([t, f], i) => (
          <g key={t}>
            <Check x={42} y={38 + i * 22} r={7} />
            <Chip x={r1(58 + t.length * 3.1 + 6)} y={38 + i * 22} text={t} fill={f} size={8} />
          </g>
        ))}
      </Bubble>
      <Pencil x={138} y={120} rot={-35} len={46} />
    </>
  );
}

function AnalystRobot() {
  return (
    <>
      <Shadow y={134} rx={68} />
      <rect x="86" y="42" width="84" height="56" rx="5" fill={c("ink-soft")} {...OUT} />
      <rect x="92" y="48" width="72" height="44" rx="3" fill={c("night-100")} {...OUT} strokeWidth="1.2" />
      {[
        [58, 40, c("turf")],
        [68, 52, c("ice")],
        [78, 32, c("gold")],
      ].map(([y, w, f]) => (
        <rect key={String(y)} x="100" y={Number(y)} width={Number(w)} height="4.5" rx="2" fill={String(f)} />
      ))}
      <path d="M78 98 H178 L170 108 H86 Z" fill={c("ink-soft")} {...OUT} />
      <Robot x={48} y={76} s={0.9} />
      <Chip x={148} y={30} text="SQL" fill={c("turf")} />
    </>
  );
}

function ApiCable() {
  return (
    <>
      <Shadow y={134} rx={68} />
      <Cyl x={150} y={54} w={46} h={54} fill={c("turf")} />
      <Robot x={52} y={72} s={0.95} />
      <path d="M80 82 Q104 110 124 88" fill="none" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M80 82 Q104 110 124 88" fill="none" stroke={c("gold")} strokeWidth="3.6" strokeLinecap="round" />
      <rect x="120" y="80" width="10" height="14" rx="2" fill={c("ink-soft")} {...OUT} />
      <Chip x={102} y={40} text="API" fill={c("gold")} />
    </>
  );
}

function TheLine() {
  const lx = 44.5;
  const ly = 48.8;
  const rx = 155.5;
  const ry = 33.2;
  return (
    <>
      <Shadow y={134} rx={56} />
      <rect x="97" y="40" width="6" height="84" fill={c("gold-dim")} {...OUT} />
      <rect x="74" y="122" width="52" height="8" rx="3" fill={c("gold-dim")} {...OUT} />
      <rect x="44" y="38" width="112" height="6" rx="3" fill={c("ink-soft")} transform="rotate(-8 100 41)" {...OUT} />
      <circle cx="100" cy="41" r="5" fill={c("gold")} {...OUT} />
      <path d={`M${lx} ${ly} L${lx - 14} ${ly + 30} M${lx} ${ly} L${lx + 14} ${ly + 30}`} stroke={N} strokeWidth="1.6" />
      <path d={`M${rx} ${ry} L${rx - 14} ${ry + 30} M${rx} ${ry} L${rx + 14} ${ry + 30}`} stroke={N} strokeWidth="1.6" />
      <path d={`M${lx - 20} ${ly + 30} Q${lx} ${ly + 44} ${lx + 20} ${ly + 30} Z`} fill={c("ice")} {...OUT} />
      <path d={`M${rx - 20} ${ry + 30} Q${rx} ${ry + 44} ${rx + 20} ${ry + 30} Z`} fill={c("ice")} {...OUT} />
      <Check x={lx} y={ly + 24} r={9} />
      <Cross x={rx} y={ry + 24} r={9} />
      <path d="M150 112 Q160 104 172 110 L168 126 Q156 122 146 128 Z" fill={c("gold")} {...OUT} />
      <circle cx="150" cy="114" r="4" fill={c("ink")} {...OUT} strokeWidth="1.2" />
    </>
  );
}

// ═══ Registry ═══════════════════════════════════════════════════════

// ── Statistics, Visualization, Git and R: units 2 and 3 (2026-10-05) ──

/** Spread and Shape — a box-and-whisker plot with the ball sitting on the median. */
function BoxPlot() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Card x={22} y={22} w={156} h={102} fill={c("night-100")} />
      <path d="M40 74 H70 M130 74 H160 M40 62 V86 M160 62 V86" stroke={c("ink")} strokeWidth="3" strokeLinecap="round" />
      <rect x="70" y="52" width="60" height="44" rx="3" fill={c("ice", 0.55)} {...OUT} />
      <path d="M96 52 V96" stroke={c("gold")} strokeWidth="4" />
      <Football x={96} y={40} rx={11} rot={-10} />
      <circle cx="170" cy="74" r="3.5" fill={c("gold")} {...OUT} />
      <path d="M70 108 H130" stroke={c("ink-muted")} strokeWidth="2" />
      <path d="M70 104 V112 M130 104 V112" stroke={c("ink-muted")} strokeWidth="2" />
    </>
  );
}

/** Relationships and Proof — a scatter climbing a line, with a stamp of proof. */
function ScatterProof() {
  const dots: [number, number][] = [[46, 104], [58, 98], [66, 90], [78, 92], [88, 80], [98, 76], [108, 70], [118, 64], [128, 66], [138, 52]];
  return (
    <>
      <Shadow y={134} rx={64} />
      <Card x={24} y={24} w={140} h={100} fill={c("night-100")} />
      <path d="M38 112 V34 M38 112 H156" stroke={c("ink-muted")} strokeWidth="2" />
      <Arrow x1={42} y1={110} x2={150} y2={44} color={c("turf")} w={2.6} />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={c("ink")} {...OUT} />
      ))}
      <Check x={160} y={36} r={13} />
    </>
  );
}

/** Build the Chart — bars laid like bricks, a hard hat on the tallest. */
function CraneChart() {
  const bricks = (x: number, n: number, fill: string) =>
    Array.from({ length: n }, (_, i) => (
      <rect key={`${x}-${i}`} x={x} y={118 - i * 14} width="26" height="12" rx="2" fill={fill} {...OUT} />
    ));
  return (
    <>
      <Shadow y={134} rx={70} />
      <path d="M30 131 H170" stroke={c("ink-muted")} strokeWidth="2.4" />
      {bricks(40, 3, c("turf"))}
      {bricks(76, 5, c("ice"))}
      {bricks(112, 4, c("turf"))}
      <rect x="148" y="118" width="26" height="12" rx="2" fill={c("gold")} {...OUT} />
      <rect x="152" y="96" width="26" height="12" rx="2" fill={c("gold", 0.5)} {...OUT} strokeDasharray="3 3" />
      <path d="M161 86 V92 M157 89 L161 93 L165 89" stroke={c("ink-muted")} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 50 Q89 30 106 50 Z" fill={c("gold")} {...OUT} />
      <rect x="68" y="48" width="42" height="7" rx="3" fill={c("gold")} {...OUT} />
      <path d="M89 32 V48" stroke={N} strokeWidth="2" />
    </>
  );
}

/** Make It Read — one bar lit, an arrow on it, and a title banner that says the finding. */
function TitleBanner() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Card x={24} y={20} w={152} h={108} fill={c("night-100")} />
      <rect x="34" y="28" width="110" height="12" rx="3" fill={c("gold")} {...OUT} />
      <path d="M150 34 H164" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
      <Bars x={40} y={118} vals={[30, 22, 62, 26, 18]} fills={[c("ink-soft"), c("ink-soft"), c("turf"), c("ink-soft"), c("ink-soft")]} w={16} gap={9} />
      <Arrow x1={130} y1={60} x2={96} y2={66} color={c("gold")} w={2.6} />
    </>
  );
}

/** History and Mistakes — a row of commits on a timeline, and an arrow looping back to undo. */
function UndoTimeline() {
  return (
    <>
      <Shadow y={128} rx={72} />
      <path d="M26 96 H174" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M26 96 H174" stroke={c("turf")} strokeWidth="4" strokeLinecap="round" />
      {[36, 72, 108, 144].map((x) => (
        <circle key={x} cx={x} cy="96" r="8" fill={c("turf")} {...OUT} />
      ))}
      <circle cx="166" cy="96" r="9" fill={c("gold")} {...OUT} />
      <path d="M166 84 Q156 40 108 40 Q78 40 74 70" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M166 84 Q156 40 108 40 Q78 40 74 70" fill="none" stroke={c("ice")} strokeWidth="3" strokeLinecap="round" />
      <path d="M66 62 L74 74 L82 62" fill="none" stroke={c("ice")} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M166 112 L160 118 M166 112 L172 118" stroke={c("ink-muted")} strokeWidth="2" />
    </>
  );
}

/** Working With Others — a branch merging back into main, with a pull down and a push up. */
function PushPull() {
  return (
    <>
      <Shadow y={132} rx={70} />
      <BranchGraph x={40} y={104} w={120} />
      <Arrow x1={38} y1={30} x2={38} y2={72} color={c("ice")} w={3} />
      <Arrow x1={162} y1={72} x2={162} y2={30} color={c("gold")} w={3} />
      <rect x="70" y="20" width="60" height="22" rx="6" fill={c("ink")} {...OUT} />
      <path d="M80 31 H120" stroke={N} strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </>
  );
}

/** Wrangling in R — a lasso thrown round a table, the R hex beside it. */
function LassoTable() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <Sheet x={30} y={52} w={92} h={66} rows={4} cols={3} head={c("ice")} />
      <ellipse cx="76" cy="86" rx="60" ry="44" fill="none" stroke={N} strokeWidth="6" />
      <ellipse cx="76" cy="86" rx="60" ry="44" fill="none" stroke={c("gold-dim")} strokeWidth="3" />
      <path d="M130 64 Q152 46 170 30" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M130 64 Q152 46 170 30" fill="none" stroke={c("gold-dim")} strokeWidth="3" strokeLinecap="round" />
      <HexBadge x={160} y={104} r={20} fill={c("ice")} text="R" />
    </>
  );
}

/** From Data to Report — a table, an arrow, and the one-page report it became. */
function TableToReport() {
  return (
    <>
      <Shadow y={134} rx={72} />
      <Sheet x={18} y={50} w={64} h={58} rows={4} cols={2} head={c("ice")} />
      <Arrow x1={88} y1={80} x2={110} y2={80} color={c("turf")} w={3} />
      <Card x={116} y={24} w={66} h={104} fill={c("ink")} />
      <rect x="124" y="32" width="50" height="8" rx="2" fill={c("gold")} {...OUT} />
      <Bars x={128} y={98} vals={[22, 36, 28]} fills={[c("turf"), c("ice"), c("turf")]} w={10} gap={6} />
      <path d="M126 108 H172 M126 116 H160" stroke={N} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
      <HexBadge x={40} y={30} r={14} fill={c("ice")} text="R" />
    </>
  );
}

const SCENES: Record<string, { tone: Tone; Scene: () => JSX.Element }> = {
  "st-spread": { tone: "ice", Scene: BoxPlot },
  "st-relate": { tone: "turf", Scene: ScatterProof },
  "vz-build": { tone: "gold", Scene: CraneChart },
  "vz-story": { tone: "turf", Scene: TitleBanner },
  "gt-history": { tone: "ice", Scene: UndoTimeline },
  "gt-team": { tone: "gold", Scene: PushPull },
  "r-wrangle": { tone: "turf", Scene: LassoTable },
  "r-report": { tone: "ice", Scene: TableToReport },
  // SQL Fundamentals
  u1: { tone: "turf", Scene: StatSheet },
  f2: { tone: "ice", Scene: FirstQueries },
  u2: { tone: "gold", Scene: WhereFunnel },
  u3: { tone: "turf", Scene: SortBoard },
  "sf-null": { tone: "ice", Scene: MissingNull },
  "sf-calc": { tone: "gold", Scene: Calculator },
  "sf-fn": { tone: "turf", Scene: FunctionGears },
  u4: { tone: "gold", Scene: SigmaSum },
  u5: { tone: "ice", Scene: JoinTables },
  "sf-sub": { tone: "turf", Scene: NestedBoxes },
  "sf-set": { tone: "ice", Scene: Venn },
  "sf-dml": { tone: "gold", Scene: EditRow },
  "sf-ddl": { tone: "ice", Scene: Blueprint },
  "sf-clean": { tone: "turf", Scene: Broom },
  "sf-debug": { tone: "gold", Scene: BugHunt },
  u23: { tone: "gold", Scene: SqlFinal },
  // Advanced SQL
  "sa-models": { tone: "ice", Scene: Lightbulb },
  u19: { tone: "gold", Scene: CteSteps },
  u6: { tone: "ice", Scene: WindowFrame },
  "sa-agg": { tone: "turf", Scene: Cube },
  "sa-joins": { tone: "ice", Scene: JoinPlaybook },
  "sa-sub": { tone: "gold", Scene: CorrelatedLoop },
  "sa-dates": { tone: "turf", Scene: DateTime },
  "sa-kpi": { tone: "gold", Scene: KpiCard },
  "sa-cohort": { tone: "ice", Scene: CohortTriangle },
  "sa-case": { tone: "turf", Scene: Signpost },
  "sa-xform": { tone: "gold", Scene: TransformMachine },
  "sa-temp": { tone: "ice", Scene: ScratchPad },
  u20: { tone: "turf", Scene: Binoculars },
  "sa-perf": { tone: "gold", Scene: Speedometer },
  u22: { tone: "ice", Scene: IndexBook },
  "sa-tx": { tone: "turf", Scene: Transaction },
  "sa-model": { tone: "ice", Scene: ErDiagram },
  "sa-wh": { tone: "gold", Scene: Forklift },
  "sa-json": { tone: "turf", Scene: JsonBraces },
  "sa-stack": { tone: "ice", Scene: StackTower },
  "sa-risk": { tone: "gold", Scene: AnomalySpike },
  "sa-biz": { tone: "turf", Scene: Briefcase },
  "sa-interview": { tone: "ice", Scene: InterviewBoard },
  "sa-craft": { tone: "turf", Scene: CodeReview },
  u24: { tone: "gold", Scene: ProBowlHelmet },
  u21: { tone: "ice", Scene: Dominoes },
  // Python
  u7: { tone: "gold", Scene: SteeringSnake },
  u13: { tone: "turf", Scene: Flowchart },
  u14: { tone: "ice", Scene: PandaFrame },
  u25: { tone: "gold", Scene: PythonFinal },
  // Excel
  u15: { tone: "turf", Scene: FormulaGrid },
  u16: { tone: "gold", Scene: IfCells },
  u17: { tone: "ice", Scene: LookupRow },
  u18: { tone: "turf", Scene: Scissors },
  u26: { tone: "gold", Scene: DraftPodium },
  // Statistics
  u8: { tone: "ice", Scene: NoiseTrend },
  u27: { tone: "gold", Scene: FilmProjector },
  // Visualization
  u9: { tone: "turf", Scene: PointLands },
  u28: { tone: "ice", Scene: BroadcastBooth },
  // Git
  u10: { tone: "turf", Scene: ShowYourWork },
  u29: { tone: "gold", Scene: Locker },
  // R
  u11: { tone: "ice", Scene: OtherDialect },
  u30: { tone: "gold", Scene: CombineDrill },
  // Tableau
  "tb-start": { tone: "ice", Scene: DragToShelf },
  "tb-marks": { tone: "turf", Scene: MarksPalette },
  "tb-calc": { tone: "gold", Scene: CalcEditor },
  "tb-filters": { tone: "ice", Scene: FilterDropdown },
  "tb-dash": { tone: "turf", Scene: DashboardPage },
  "tb-job": { tone: "gold", Scene: PortfolioBadge },
  // Power BI
  "pb-start": { tone: "gold", Scene: PowerPlug },
  "pb-query": { tone: "ice", Scene: AppliedSteps },
  "pb-model": { tone: "turf", Scene: StarSchema },
  "pb-dax": { tone: "gold", Scene: DaxMeasure },
  "pb-report": { tone: "ice", Scene: ReportPage },
  "pb-job": { tone: "turf", Scene: IdBadge },
  // AI
  "ai-how": { tone: "ice", Scene: NextToken },
  "ai-prompt": { tone: "turf", Scene: AskingWell },
  "ai-analyst": { tone: "gold", Scene: AnalystRobot },
  "ai-api": { tone: "ice", Scene: ApiCable },
  "ai-judge": { tone: "gold", Scene: TheLine },
};

export function hasUnitArt(id: string | null | undefined): boolean {
  return !!id && id in SCENES;
}

export default function UnitArt({
  id,
  className = "",
  align = "center",
}: {
  id: string;
  className?: string;
  align?: "center" | "left" | "right";
}) {
  const entry = SCENES[id];
  if (!entry) return null;
  const { tone, Scene } = entry;
  return (
    <ArtSvg tone={tone} glowId={`u-${id}`} className={className} align={align}>
      <Scene />
    </ArtSvg>
  );
}
