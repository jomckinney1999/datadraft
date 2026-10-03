/**
 * Pictures for interview prep: the nine SQL patterns analyst screens test
 * and the two mock screens. Same kit and the same rule as every question,
 * course and project card: the picture is what the title says.
 *
 *   filter-sort  — a funnel letting one football through, onto bars that
 *                  stand in order, shortest to tallest.
 *   aggregate    — three crates of footballs, QB / RB / WR, each with its
 *                  total on a tag, under a big gold Σ.
 *   joins        — two tables, a matching row lit in each, chained together.
 *   case         — a signpost at a fork: IF one way, ELSE the other.
 *   subqueries   — a table inside a table inside a table, a magnifier on
 *                  the innermost, and a WITH tag.
 *   ranking      — two little podiums, 1-2-3 each, one per group.
 *   running      — steps that climb by each week's points, a line tracing
 *                  the running total up them.
 *   dates        — a calendar with week 4 circled, a clock on its corner.
 *   nulls        — a stat sheet with NULL holes in it and a broom.
 *   phone        — a phone with SQL on the screen and a 20-minute timer.
 *   technical    — a monitor with a query and its result, a 45-minute timer,
 *                  and three questions ticked off easy to hard.
 *   online       — a monitor with SQL and multiple-choice bubbles, a 70-minute
 *                  stopwatch.
 *   sprint       — a big 35-minute stopwatch beside one SQL block and four
 *                  ticked MC rows.
 *   challenge    — a messy sheet with a NULL hole, an arrow to a rubric card
 *                  ticked build / data / biz.
 *
 * Gradient ids are namespaced `ip-`.
 */

import { ArtSvg, c, Football, MONO, N, r1, Shadow, Sparkle, type Tone } from "@/components/art-kit";
import { Arrow, Bars, Calendar, Check, Chip, Clock, Magnifier, Monitor, OUT, Sheet } from "@/components/art-props";

/** A stopwatch; (x, y) is the centre of the face. */
function Stopwatch({ x, y, r = 18, label }: { x: number; y: number; r?: number; label?: string }) {
  return (
    <g>
      <rect x={x - 4} y={r1(y - r - 8)} width="8" height="7" rx="2" fill={c("ink-soft")} {...OUT} />
      <rect x={r1(x + r * 0.62)} y={r1(y - r * 0.92)} width="7" height="6" rx="2" fill={c("ink-soft")} {...OUT} transform={`rotate(40 ${r1(x + r * 0.62)} ${r1(y - r * 0.92)})`} />
      <circle cx={x} cy={y} r={r} fill={c("ink", 0.95)} {...OUT} strokeWidth="2.4" />
      <path d={`M${x} ${y} V${r1(y - r * 0.7)}`} stroke={c("gold-dim")} strokeWidth="2.4" strokeLinecap="round" />
      <path d={`M${x} ${y} L${r1(x + r * 0.5)} ${r1(y + r * 0.2)}`} stroke={N} strokeWidth="2" strokeLinecap="round" />
      <circle cx={x} cy={y} r="2" fill={c("gold")} stroke={N} strokeWidth="1" />
      {label && <Chip x={x} y={r1(y + r + 9)} text={label} fill={c("gold")} size={7} />}
    </g>
  );
}

/** A few lines of code on a dark screen; (x, y) is the top-left of the text. */
function CodeLines({ x, y, widths, gap = 7 }: { x: number; y: number; widths: number[]; gap?: number }) {
  const tones = [c("ice"), c("turf"), c("gold"), c("ink-soft")];
  return (
    <g>
      {widths.map((w, i) => (
        <g key={i}>
          <rect x={x} y={y + i * gap} width={r1(w * 0.3)} height="3" rx="1.5" fill={tones[i % tones.length]} />
          <rect x={r1(x + w * 0.3 + 3)} y={y + i * gap} width={r1(w * 0.7)} height="3" rx="1.5" fill={c("ink", 0.55)} />
        </g>
      ))}
    </g>
  );
}

function FilterSort() {
  return (
    <g>
      <Shadow x={100} y={132} rx={70} />
      {/* footballs waiting at the top of the funnel */}
      <Football x={38} y={22} rx={9} rot={-20} />
      <Football x={58} y={18} rx={9} rot={15} fill={c("ink-soft")} />
      <Football x={78} y={24} rx={9} rot={-8} fill={c("ink-soft")} />
      {/* the funnel */}
      <path d="M22 36 H96 L68 76 V96 H50 V76 Z" fill={c("ice")} {...OUT} strokeWidth="2.2" />
      <path d="M30 42 H88" stroke={c("ink", 0.5)} strokeWidth="2" strokeLinecap="round" />
      {/* the one that passes */}
      <Football x={59} y={112} rx={9} rot={80} />
      <Arrow x1={78} y1={110} x2={104} y2={110} color={c("turf")} w={3.5} />
      {/* sorted, shortest to tallest */}
      <Bars x={114} y={128} vals={[22, 38, 56, 78]} w={14} gap={5} fills={[c("ink-soft"), c("ice"), c("turf"), c("gold")]} />
      <Chip x={152} y={30} text="ORDER BY" fill={c("ink", 0.95)} size={7} />
      <Sparkle x={182} y={44} r={4} fill={c("gold")} />
    </g>
  );
}

function Aggregate() {
  const crates: [number, string, string][] = [
    [44, "QB", c("ice")],
    [100, "RB", c("turf")],
    [156, "WR", c("gold")],
  ];
  return (
    <g>
      <Shadow x={100} y={134} rx={78} />
      <text x="100" y="40" textAnchor="middle" fontSize="34" fontWeight="900" fill={c("gold")} stroke={N} strokeWidth="1.6" fontFamily={MONO}>
        Σ
      </text>
      {crates.map(([x, label, fill], i) => (
        <g key={label}>
          {/* a few balls piled in each crate */}
          <Football x={x - 9} y={74} rx={8} rot={-25} />
          <Football x={x + 8} y={72} rx={8} rot={20} fill={c("ink-soft")} />
          {i !== 1 && <Football x={x} y={66} rx={8} rot={0} />}
          <path d={`M${x - 24} 78 H${x + 24} L${x + 20} 124 H${x - 20} Z`} fill={fill} {...OUT} strokeWidth="2" />
          <path d={`M${x - 21} 92 H${x + 21} M${x - 20} 108 H${x + 20}`} stroke={N} strokeWidth="1.2" opacity="0.35" />
          <Chip x={x} y={101} text={label} fill={c("ink", 0.95)} size={8} />
          <path d={`M${x} 56 V48`} stroke={c("ink-soft")} strokeWidth="1.6" strokeDasharray="2 2" />
        </g>
      ))}
    </g>
  );
}

function Joins() {
  return (
    <g>
      <Shadow x={100} y={130} rx={76} />
      <Sheet x={14} y={30} w={70} h={74} rows={4} cols={2} hi={1} label="PLAYERS" />
      <Sheet x={116} y={46} w={70} h={74} rows={4} cols={3} hi={2} head={c("ice")} label="GAMES" />
      {/* the chain from one lit row to the other */}
      <path d="M84 61 C100 61 100 89 116 89" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M84 61 C100 61 100 89 116 89" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="94" cy="70" rx="7" ry="4.5" fill="none" stroke={N} strokeWidth="5" transform="rotate(55 94 70)" />
      <ellipse cx="94" cy="70" rx="7" ry="4.5" fill="none" stroke={c("gold")} strokeWidth="2.6" transform="rotate(55 94 70)" />
      <ellipse cx="106" cy="80" rx="7" ry="4.5" fill="none" stroke={N} strokeWidth="5" transform="rotate(55 106 80)" />
      <ellipse cx="106" cy="80" rx="7" ry="4.5" fill="none" stroke={c("gold")} strokeWidth="2.6" transform="rotate(55 106 80)" />
      <Chip x={100} y={20} text="ON player_id" fill={c("gold")} size={7} />
    </g>
  );
}

function CaseLogic() {
  return (
    <g>
      <Shadow x={100} y={132} rx={70} />
      {/* the road forks */}
      <path d="M90 140 Q96 112 70 96 Q50 84 18 82 M110 140 Q104 112 130 96 Q150 84 182 82" fill="none" stroke={c("ink", 0.2)} strokeWidth="14" strokeLinecap="round" />
      <path d="M90 140 Q96 112 70 96 Q50 84 18 82 M110 140 Q104 112 130 96 Q150 84 182 82" fill="none" stroke={c("ink", 0.35)} strokeWidth="1.4" strokeDasharray="5 5" />
      {/* the post and its two signs */}
      <rect x="96" y="28" width="8" height="104" rx="2" fill={c("gold-dim")} {...OUT} />
      <path d="M104 34 H158 L170 45 L158 56 H104 Z" fill={c("turf")} {...OUT} strokeWidth="2" />
      <text x="134" y="49" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={MONO}>
        IF
      </text>
      <path d="M96 62 H44 L32 73 L44 84 H96 Z" fill={c("gold")} {...OUT} strokeWidth="2" />
      <text x="66" y="77" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
        ELSE
      </text>
      <circle cx="100" cy="26" r="5" fill={c("ink-soft")} {...OUT} />
      <Sparkle x={176} y={24} r={4} fill={c("gold")} />
    </g>
  );
}

function Subqueries() {
  return (
    <g>
      <Shadow x={100} y={134} rx={74} />
      <Sheet x={24} y={22} w={150} h={108} rows={1} cols={1} label="OUTER QUERY" head={c("ice")} />
      <Sheet x={44} y={48} w={110} h={72} rows={1} cols={1} label="WITH" head={c("turf")} />
      <Sheet x={66} y={74} w={66} h={38} rows={2} cols={2} hi={0} head={c("gold")} />
      <Magnifier x={138} y={100} r={14} rot={40} />
      <Sparkle x={182} y={24} r={4} fill={c("gold")} />
    </g>
  );
}

function Podium({ x, tone, label }: { x: number; tone: string; label: string }) {
  const steps: [number, number, string][] = [
    [-26, 22, "2"],
    [0, 36, "1"],
    [26, 14, "3"],
  ];
  return (
    <g>
      {steps.map(([dx, h, n]) => (
        <g key={n}>
          <rect x={x + dx - 12} y={124 - h} width="24" height={h} fill={n === "1" ? tone : c("ink", 0.9)} {...OUT} />
          <text x={x + dx} y={124 - h + 12} textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
            {n}
          </text>
        </g>
      ))}
      <Football x={x} y={78} rx={9} rot={-15} />
      <Chip x={x} y={134} text={label} fill={tone} size={7} />
    </g>
  );
}

function Ranking() {
  return (
    <g>
      <Shadow x={100} y={128} rx={84} />
      <Podium x={56} tone={c("turf")} label="QB" />
      <Podium x={144} tone={c("ice")} label="WR" />
      <Chip x={100} y={30} text="TOP 3 PER GROUP" fill={c("gold")} size={7} />
      <Sparkle x={56} y={56} r={4} fill={c("gold")} />
      <Sparkle x={144} y={56} r={4} fill={c("gold")} />
    </g>
  );
}

function Running() {
  // Each step adds that week's points to the one before it.
  const weekly = [14, 22, 9, 18, 26];
  const tops = weekly.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + v], []);
  const x0 = 28;
  const w = 26;
  return (
    <g>
      <Shadow x={100} y={130} rx={80} />
      {tops.map((t, i) => (
        <rect key={i} x={x0 + i * w} y={126 - t} width={w} height={t} fill={i === tops.length - 1 ? c("gold") : i % 2 ? c("turf") : c("ice")} {...OUT} />
      ))}
      {/* the running total, traced up the stairs */}
      <path
        d={`M${x0} 126 ${tops.map((t, i) => `L${x0 + (i + 1) * w} ${126 - t}`).join(" ")}`}
        fill="none"
        stroke={N}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${x0} 126 ${tops.map((t, i) => `L${x0 + (i + 1) * w} ${126 - t}`).join(" ")}`}
        fill="none"
        stroke={c("ink")}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Arrow x1={x0 + 5 * w - 6} y1={126 - tops[4] + 4} x2={x0 + 5 * w + 22} y2={126 - tops[4] - 14} color={c("gold")} w={3.5} />
      <Chip x={66} y={30} text="SUM() OVER" fill={c("ink", 0.95)} size={7} />
    </g>
  );
}

function Dates() {
  return (
    <g>
      <Shadow x={100} y={134} rx={60} />
      <Calendar x={52} y={30} w={96} h={96} mark={6} head={c("ice")} />
      <circle cx="112" cy="84" r="16" fill="none" stroke={c("gold")} strokeWidth="3" />
      <Chip x={100} y={20} text="WEEK 4" fill={c("gold")} size={8} />
      <Clock x={152} y={116} r={18} />
      <Sparkle x={38} y={44} r={4} fill={c("gold")} />
    </g>
  );
}

function Nulls() {
  return (
    <g>
      <Shadow x={92} y={132} rx={74} />
      <Sheet x={18} y={26} w={118} h={98} rows={4} cols={3} label="WEEK_RESULTS" />
      {/* the holes, where a value should be */}
      {[
        [57, 58],
        [96, 80],
        [57, 102],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 16} y={y - 8} width="32" height="15" rx="2" fill={c("night-100")} stroke={c("gold")} strokeWidth="1.4" strokeDasharray="3 2" />
          <text x={x} y={y + 3} textAnchor="middle" fontSize="7" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
            NULL
          </text>
        </g>
      ))}
      {/* a broom, mid-sweep */}
      <g transform="rotate(28 162 76)">
        <rect x="158" y="18" width="7" height="86" rx="3" fill={c("gold-dim")} {...OUT} />
        <path d="M148 100 H176 L182 130 H142 Z" fill={c("gold")} {...OUT} />
        <path d="M150 112 L148 128 M158 112 L157 128 M166 112 L166 128 M174 112 L176 128" stroke={N} strokeWidth="1.2" />
      </g>
      <Sparkle x={182} y={30} r={4} fill={c("ice")} />
    </g>
  );
}

function Phone() {
  return (
    <g>
      <Shadow x={92} y={136} rx={52} />
      <rect x="58" y="14" width="66" height="118" rx="12" fill={c("ink-soft")} {...OUT} strokeWidth="2.4" />
      <rect x="64" y="26" width="54" height="94" rx="5" fill={c("night-100")} {...OUT} strokeWidth="1.2" />
      <rect x="82" y="18" width="18" height="4" rx="2" fill={N} />
      <CodeLines x={70} y={36} widths={[36, 30, 40, 24, 34]} />
      <rect x="70" y="80" width="42" height="26" rx="3" fill={c("ink", 0.9)} {...OUT} strokeWidth="1" />
      <path d="M70 89 H112 M70 97 H112 M91 80 V106" stroke={c("night", 0.25)} strokeWidth="1" />
      <Stopwatch x={150} y={52} r={20} label="20 MIN" />
      <Sparkle x={36} y={40} r={4} fill={c("gold")} />
    </g>
  );
}

function Technical() {
  return (
    <g>
      <Shadow x={92} y={138} rx={66} />
      <Monitor x={22} y={20} w={112} h={84}>
        <CodeLines x={32} y={32} widths={[44, 34, 52, 30]} />
        <rect x="32" y="64" width="80" height="30" rx="3" fill={c("ink", 0.9)} {...OUT} strokeWidth="1" />
        <rect x="33" y="64" width="78" height="8" fill={c("turf")} />
        <path d="M32 82 H112 M59 72 V94 M86 72 V94" stroke={c("night", 0.25)} strokeWidth="1" />
      </Monitor>
      <Stopwatch x={164} y={44} r={20} label="45 MIN" />
      {/* three questions, easy to hard */}
      {[
        [96, c("turf")],
        [114, c("ice")],
        [132, c("gold")],
      ].map(([y, fill]) => (
        <g key={y as number}>
          <rect x="146" y={(y as number) - 6} width="36" height="12" rx="3" fill={fill as string} {...OUT} strokeWidth="1.4" />
          <Check x={146} y={y as number} r={6} fill={c("ink", 0.95)} />
        </g>
      ))}
    </g>
  );
}

/** A multiple-choice row: a bubble (ticked or empty) and a text bar. */
function Choice({ x, y, on, w = 40 }: { x: number; y: number; on?: boolean; w?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="4" fill={on ? c("turf") : c("ink", 0.9)} {...OUT} strokeWidth="1.2" />
      <rect x={x + 8} y={y - 1.5} width={w} height="3" rx="1.5" fill={c("ink", 0.55)} />
    </g>
  );
}

function Online() {
  return (
    <g>
      <Shadow x={92} y={138} rx={68} />
      <Monitor x={16} y={18} w={118} h={88}>
        <CodeLines x={28} y={30} widths={[48, 36, 54]} />
        <Choice x={32} y={64} on />
        <Choice x={32} y={76} />
        <Choice x={32} y={88} />
        <rect x="88" y="62" width="34" height="28" rx="3" fill={c("ink", 0.9)} {...OUT} strokeWidth="1" />
        <path d="M88 71 H122 M88 80 H122 M105 62 V90" stroke={c("night", 0.25)} strokeWidth="1" />
      </Monitor>
      <Stopwatch x={166} y={52} r={21} label="70 MIN" />
      <Chip x={166} y={102} text="SQL + MC" fill={c("gold")} size={7} />
      <Sparkle x={36} y={12} r={4} fill={c("gold")} />
    </g>
  );
}

function Sprint() {
  return (
    <g>
      <Shadow x={100} y={136} rx={64} />
      {/* a big stopwatch, a short run */}
      <Stopwatch x={70} y={74} r={42} label="35 MIN" />
      {/* one SQL block and four MC ticks */}
      <rect x="128" y="30" width="56" height="30" rx="4" fill={c("night-100")} {...OUT} strokeWidth="1.4" />
      <CodeLines x={134} y={37} widths={[36, 28, 40]} gap={7} />
      {[72, 88, 104, 120].map((y) => (
        <g key={y}>
          <rect x="128" y={y - 6} width="56" height="12" rx="3" fill={c("ink", 0.9)} {...OUT} strokeWidth="1.2" />
          <Check x={136} y={y} r={5} fill={c("turf")} />
          <rect x="146" y={y - 1.5} width="30" height="3" rx="1.5" fill={c("ink", 0.5)} />
        </g>
      ))}
      <Sparkle x={26} y={24} r={4} fill={c("gold")} />
    </g>
  );
}

function Challenge() {
  return (
    <g>
      <Shadow x={100} y={136} rx={78} />
      {/* the messy sheet, with a hole in it */}
      <Sheet x={14} y={30} w={74} h={84} rows={4} cols={3} label="SESSIONS" head={c("ice")} />
      <rect x="22" y="64" width="30" height="14" rx="2" fill={c("night-100")} stroke={c("gold")} strokeWidth="1.4" strokeDasharray="3 2" />
      <text x="37" y="74" textAnchor="middle" fontSize="7" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        NULL
      </text>
      <Arrow x1={92} y1={72} x2={116} y2={72} color={c("turf")} w={3.5} />
      {/* the rubric card: three ticks */}
      <rect x="120" y="26" width="68" height="92" rx="6" fill={c("ink", 0.95)} {...OUT} strokeWidth="2" />
      <rect x="146" y="20" width="16" height="9" rx="3" fill={c("gold")} {...OUT} strokeWidth="1.4" />
      {[
        [48, "BUILD", c("turf")],
        [72, "DATA", c("ice")],
        [96, "BIZ", c("gold")],
      ].map(([y, label, fill]) => (
        <g key={label as string}>
          <Check x={134} y={y as number} r={6} fill={fill as string} />
          <text x="144" y={(y as number) + 3} fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
            {label as string}
          </text>
        </g>
      ))}
      <Chip x={52} y={22} text="TAKE-HOME" fill={c("gold")} size={7} />
      <Sparkle x={184} y={10} r={4} fill={c("gold")} />
    </g>
  );
}

const SCENES = {
  "filter-sort": { tone: "ice", Scene: FilterSort },
  aggregate: { tone: "gold", Scene: Aggregate },
  joins: { tone: "turf", Scene: Joins },
  case: { tone: "turf", Scene: CaseLogic },
  subqueries: { tone: "ice", Scene: Subqueries },
  ranking: { tone: "gold", Scene: Ranking },
  running: { tone: "turf", Scene: Running },
  dates: { tone: "ice", Scene: Dates },
  nulls: { tone: "gold", Scene: Nulls },
  phone: { tone: "turf", Scene: Phone },
  technical: { tone: "ice", Scene: Technical },
  online: { tone: "ice", Scene: Online },
  sprint: { tone: "gold", Scene: Sprint },
  challenge: { tone: "turf", Scene: Challenge },
} as const satisfies Record<string, { tone: Tone; Scene: () => JSX.Element }>;

export type PrepArtId = keyof typeof SCENES;

export function hasPrepArt(id: string): id is PrepArtId {
  return id in SCENES;
}

export default function PrepArt({
  id,
  className = "",
  align = "center",
}: {
  id: PrepArtId;
  className?: string;
  align?: "center" | "left" | "right";
}) {
  const { tone, Scene } = SCENES[id];
  return (
    <ArtSvg tone={tone} glowId={`ip-${id}`} className={className} align={align}>
      <Scene />
    </ArtSvg>
  );
}
