/**
 * The drawn picture on a course card — the same kit and the same rule as
 * the question cards: the picture is what the course is.
 *
 * SQL Fundamentals is a database with a football sitting on it. Python &
 * pandas is a snake coiled round a football, with a panda watching. Git &
 * GitHub is a branch splitting off main and merging back. A stranger should
 * be able to guess the course from the picture before reading the title.
 *
 * This replaced a two-layer treatment — a quiet atmospheric cover with a
 * small single-colour mark and the title laid on top. It had to stay quiet
 * so the overlaid title stayed legible, which is also why it never popped.
 * Titles now sit below the picture, so the picture is free to be loud.
 *
 * Module ids that are not course ids map onto the course they belong to
 * (`ALIAS`), so every roadmap has a picture.
 */

import {
  ArtSvg,
  Football,
  MONO,
  N,
  SANS,
  Shadow,
  Sparkle,
  c,
  r1,
  slicePath,
  type Tone,
} from "@/components/art-kit";

/** Module ids that belong to a course with a different id. */
const ALIAS: Record<string, string> = {
  "sql-foundations": "sql-fundamentals",
  viz: "tableau",
};

function hexPath(cx: number, cy: number, r: number) {
  const pts = [-90, -30, 30, 90, 150, 210].map((a) => {
    const rad = (a * Math.PI) / 180;
    return `${r1(cx + r * Math.cos(rad))} ${r1(cy + r * Math.sin(rad))}`;
  });
  return `M${pts.join(" L")} Z`;
}

/** SQL Fundamentals — a database, with a football sitting on top. */
function SqlFundamentals() {
  const lights: [number, number][] = [
    [80, 92],
    [100, 94],
    [120, 92],
  ];
  return (
    <g>
      <Shadow y={128} rx={52} />
      <path
        d="M58 52 V110 A42 12 0 0 0 142 110 V52"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M58 72 A42 12 0 0 0 142 72" fill="none" stroke={N} strokeWidth="2" />
      <path d="M58 92 A42 12 0 0 0 142 92" fill="none" stroke={N} strokeWidth="2" />
      <path d="M66 62 V104" stroke={c("ink", 0.35)} strokeWidth="4" strokeLinecap="round" />
      {lights.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="2.8" fill={c("gold")} stroke={N} strokeWidth="1" />
      ))}
      <ellipse cx="100" cy="52" rx="42" ry="12" fill={c("turf")} stroke={N} strokeWidth="2.2" />
      <ellipse cx="100" cy="52" rx="42" ry="12" fill={c("ink", 0.28)} />
      <Football x={100} y={46} rx={22} rot={-8} />
      <g transform="rotate(10 158 30)">
        <rect x="128" y="20" width="60" height="20" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" />
        <text x="158" y="34" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
          SELECT *
        </text>
      </g>
      <Sparkle x={36} y={40} r={6} fill={c("gold")} />
      <Sparkle x={162} y={100} r={4} />
    </g>
  );
}

/** Advanced SQL — two tables chained together, and a window function. */
function SqlAdvanced() {
  const table = (x: number, y: number, head: string, label: string) => (
    <g>
      <rect x={x} y={y} width="64" height="62" rx="6" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <path
        d={`M${x} ${y + 16} V${y + 6} Q${x} ${y} ${x + 6} ${y} H${x + 58} Q${x + 64} ${y} ${x + 64} ${y + 6} V${y + 16} Z`}
        fill={head}
        stroke={N}
        strokeWidth="2"
      />
      <text x={x + 32} y={y + 11.5} textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        {label}
      </text>
      <path
        d={`M${x} ${y + 31} H${x + 64} M${x} ${y + 46} H${x + 64} M${x + 26} ${y + 16} V${y + 62}`}
        stroke={N}
        strokeWidth="1"
        opacity="0.3"
      />
      <rect x={x + 32} y={y + 21} width="22" height="5" rx="2" fill={head} opacity="0.75" />
      <rect x={x + 32} y={y + 36} width="16" height="5" rx="2" fill={head} opacity="0.75" />
      <rect x={x + 32} y={y + 51} width="26" height="5" rx="2" fill={head} opacity="0.75" />
    </g>
  );
  return (
    <g>
      <Shadow y={130} rx={62} />
      {table(22, 40, c("turf"), "players")}
      {table(114, 56, c("ice"), "games")}
      <g transform="rotate(-18 100 82)">
        <rect x="78" y="75" width="28" height="14" rx="7" fill="none" stroke={N} strokeWidth="8" />
        <rect x="94" y="75" width="28" height="14" rx="7" fill="none" stroke={N} strokeWidth="8" />
        <rect x="78" y="75" width="28" height="14" rx="7" fill="none" stroke={c("gold")} strokeWidth="4.5" />
        <rect x="94" y="75" width="28" height="14" rx="7" fill="none" stroke={c("gold-dim")} strokeWidth="4.5" />
      </g>
      <rect x="122" y="18" width="60" height="22" rx="6" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="152" y="33" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        OVER()
      </text>
      <Sparkle x={34} y={24} r={5} fill={c("ice")} />
    </g>
  );
}

const SNAKE = "M34 118 C58 134 88 128 100 114 C112 100 138 108 150 94 C160 82 152 66 136 64";

/** Python & pandas — a snake coiled round a football, a panda watching. */
function PythonPandas() {
  return (
    <g>
      <Shadow y={134} rx={62} />
      <rect x="18" y="20" width="58" height="40" rx="5" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" />
      <path d="M18 30 V25 Q18 20 23 20 H71 Q76 20 76 25 V30 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" />
      <path d="M18 40 H76 M18 50 H76 M38 30 V60 M57 30 V60" stroke={N} strokeWidth="1" opacity="0.3" />
      <text x="47" y="28.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={N} fontFamily={MONO}>
        df
      </text>
      <Football x={100} y={86} rx={32} />
      <path d={SNAKE} fill="none" stroke={N} strokeWidth="15" strokeLinecap="round" />
      <path d={SNAKE} fill="none" stroke={c("turf")} strokeWidth="11" strokeLinecap="round" />
      <path
        d={SNAKE}
        fill="none"
        stroke={c("turf-dim")}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="3 9"
      />
      <ellipse
        cx="126"
        cy="60"
        rx="14"
        ry="10"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2"
        transform="rotate(-15 126 60)"
      />
      <circle cx="122" cy="56" r="3.2" fill={c("ink")} />
      <circle cx="121.4" cy="56" r="1.6" fill={N} />
      <path
        d="M113 63 L106 65 M106 65 L102 62 M106 65 L102 68"
        stroke={c("gold")}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="159" cy="109" r="6" fill={N} />
      <circle cx="181" cy="109" r="6" fill={N} />
      <circle cx="170" cy="120" r="14" fill={c("ink")} stroke={N} strokeWidth="2" />
      <ellipse cx="164" cy="118" rx="4" ry="5.5" fill={N} transform="rotate(20 164 118)" />
      <ellipse cx="176" cy="118" rx="4" ry="5.5" fill={N} transform="rotate(-20 176 118)" />
      <circle cx="164.6" cy="117" r="1.5" fill={c("ink")} />
      <circle cx="175.4" cy="117" r="1.5" fill={c("ink")} />
      <ellipse cx="170" cy="125" rx="3" ry="2" fill={N} />
      <Sparkle x={178} y={30} r={6} fill={c("gold")} />
    </g>
  );
}

/** Statistics That Hold Up — a bell curve over its histogram, μ and σ. */
function Stats() {
  const bars = [10, 22, 40, 58, 66, 58, 40, 22, 10];
  return (
    <g>
      <Shadow y={128} rx={70} />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={28 + i * 16}
          y={122 - h}
          width="13"
          height={h}
          rx="2"
          fill={c("ice", 0.55)}
          stroke={N}
          strokeWidth="1.2"
        />
      ))}
      <path
        d="M22 120 C52 120 64 52 100 50 C136 52 148 120 178 120"
        fill="none"
        stroke={c("turf")}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d="M100 44 V124" stroke={c("gold")} strokeWidth="2.5" strokeDasharray="4 4" />
      <rect x="86" y="18" width="28" height="20" rx="6" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="100" y="33" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={SANS}>
        μ
      </text>
      <rect x="140" y="30" width="30" height="20" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="155" y="45" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={SANS}>
        σ
      </text>
      <Football x={40} y={40} rx={14} rot={-20} />
      <Sparkle x={172} y={92} r={5} />
    </g>
  );
}

/** Excel for Analysts — a sheet with a live formula and its answer. */
function Excel() {
  const cols = ["A", "B", "C", "D", "E"];
  const rowsY = [54, 70, 86, 102];
  const eVals = ["430.4", "403.0", "379.1"];
  const widths = [22, 14, 18, 10];
  return (
    <g>
      <Shadow y={134} rx={70} />
      <rect x="20" y="16" width="160" height="20" rx="5" fill={c("panel")} stroke={N} strokeWidth="1.8" />
      <rect x="24" y="19" width="22" height="14" rx="3" fill={c("turf")} />
      <text x="35" y="29.5" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        fx
      </text>
      <text x="52" y="30" fontSize="9.5" fontWeight="800" fill={c("ink")} fontFamily={MONO}>
        =SUM(E2:E4)
      </text>
      <rect x="20" y="40" width="160" height="88" rx="5" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <rect x="148" y="54" width="32" height="74" fill={c("gold", 0.32)} />
      <path d="M20 54 V45 Q20 40 25 40 H175 Q180 40 180 45 V54 Z" fill={c("turf")} stroke={N} strokeWidth="2" />
      {cols.map((l, i) => (
        <text
          key={l}
          x={36 + i * 32}
          y="51"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fill={N}
          fontFamily={MONO}
        >
          {l}
        </text>
      ))}
      {[52, 84, 116, 148].map((x) => (
        <path key={x} d={`M${x} 54 V128`} stroke={N} strokeWidth="1" opacity="0.22" />
      ))}
      {[70, 86, 102, 118].map((y) => (
        <path key={y} d={`M20 ${y} H180`} stroke={N} strokeWidth="1" opacity="0.22" />
      ))}
      {rowsY.slice(0, 3).map((y, r) =>
        [20, 52, 84, 116].map((x, i) => (
          <rect
            key={`${x}-${y}`}
            x={x + 5}
            y={y + 5}
            width={widths[(i + r) % widths.length]}
            height="6"
            rx="2"
            fill={N}
            opacity="0.18"
          />
        )),
      )}
      {eVals.map((v, i) => (
        <text
          key={v}
          x="164"
          y={rowsY[i] + 11.5}
          textAnchor="middle"
          fontSize="8"
          fontWeight="800"
          fill={N}
          fontFamily={MONO}
        >
          {v}
        </text>
      ))}
      <rect x="148" y="102" width="32" height="16" fill={c("turf", 0.3)} stroke={c("turf-dim")} strokeWidth="3" />
      <text x="164" y="113.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={N} fontFamily={MONO}>
        1212.5
      </text>
      <Football x={34} y={124} rx={14} rot={-18} />
    </g>
  );
}

/** Tableau for Data Visualization — a dashboard of four live tiles. */
function Tableau() {
  const bars: [number, number, string][] = [
    [40, 18, c("turf")],
    [52, 26, c("ice")],
    [64, 14, c("gold")],
    [76, 30, c("turf")],
  ];
  const line: [number, number][] = [
    [108, 58],
    [120, 48],
    [132, 52],
    [144, 38],
    [158, 34],
  ];
  return (
    <g>
      <Shadow y={134} rx={50} />
      <rect x="94" y="112" width="12" height="16" fill={c("ink-muted")} />
      <rect x="72" y="126" width="56" height="6" rx="3" fill={c("ink-muted")} stroke={N} strokeWidth="1.5" />
      <rect x="22" y="16" width="156" height="100" rx="8" fill={c("ink-muted")} stroke={N} strokeWidth="2.2" />
      <rect x="28" y="22" width="144" height="88" rx="4" fill={N} />
      <rect x="34" y="28" width="64" height="38" rx="3" fill={c("panel")} />
      <rect x="102" y="28" width="64" height="38" rx="3" fill={c("panel")} />
      <rect x="34" y="70" width="64" height="34" rx="3" fill={c("panel")} />
      <rect x="102" y="70" width="64" height="34" rx="3" fill={c("panel")} />
      {bars.map(([x, h, f]) => (
        <rect key={x} x={x} y={62 - h} width="8" height={h} rx="1.5" fill={f} />
      ))}
      <path
        d={`M${line.map(([x, y]) => `${x} ${y}`).join(" L")}`}
        fill="none"
        stroke={c("ice")}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {line.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="2.4" fill={c("gold")} />
      ))}
      <circle cx="54" cy="87" r="12" fill={c("turf")} />
      <path d={slicePath(54, 87, 12, 0, 120)} fill={c("gold")} />
      <path d={slicePath(54, 87, 12, 120, 190)} fill={c("ice")} />
      <path d="M72 82 H90 M72 88 H86 M72 94 H90" stroke={c("ink", 0.4)} strokeWidth="2.2" strokeLinecap="round" />
      <text x="134" y="92" textAnchor="middle" fontSize="16" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        +12%
      </text>
      <Sparkle x={186} y={22} r={5} fill={c("gold")} />
    </g>
  );
}

/** Power BI & DAX — a gauge, and a bolt of power. */
function PowerBi() {
  const cx = 96;
  const cy = 104;
  const R = 50;
  const pt = (a: number, r = R) => {
    const rad = (a * Math.PI) / 180;
    return `${r1(cx + r * Math.cos(rad))} ${r1(cy + r * Math.sin(rad))}`;
  };
  const arc = (a0: number, a1: number) => `M${pt(a0)} A${R} ${R} 0 0 1 ${pt(a1)}`;
  const segs: [number, number, string][] = [
    [182, 238, c("turf")],
    [242, 298, c("gold")],
    [302, 358, c("ice")],
  ];
  return (
    <g>
      <Shadow y={130} rx={62} />
      {segs.map(([a0, a1, col]) => (
        <g key={a0}>
          <path d={arc(a0, a1)} fill="none" stroke={N} strokeWidth="19" />
          <path d={arc(a0, a1)} fill="none" stroke={col} strokeWidth="15" />
        </g>
      ))}
      <path d={`M${cx} ${cy} L${pt(292, 40)}`} stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d={`M${cx} ${cy} L${pt(292, 40)}`} stroke={c("ink")} strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="8" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <rect x="40" y="108" width="112" height="18" rx="5" fill={c("panel")} stroke={N} strokeWidth="2" />
      <text x="96" y="121" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        YTD +18%
      </text>
      <path
        d="M164 12 L148 54 H162 L152 96 L186 44 H170 L182 12 Z"
        fill={c("gold")}
        stroke={N}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="20" y="18" width="40" height="20" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="40" y="32" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        DAX
      </text>
    </g>
  );
}

/** Git & GitHub — a branch off main, and the merge back. */
function Git() {
  return (
    <g>
      <path d="M22 96 H178" stroke={N} strokeWidth="8" strokeLinecap="round" />
      <path d="M22 96 H178" stroke={c("turf")} strokeWidth="5" strokeLinecap="round" />
      <path
        d="M68 96 C84 96 84 56 100 56 H128 C144 56 144 96 160 96"
        fill="none"
        stroke={N}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M68 96 C84 96 84 56 100 56 H128 C144 56 144 96 160 96"
        fill="none"
        stroke={c("ice")}
        strokeWidth="5"
        strokeLinecap="round"
      />
      {[36, 68, 116].map((x) => (
        <circle key={x} cx={x} cy="96" r="8" fill={c("turf")} stroke={N} strokeWidth="2.2" />
      ))}
      {[100, 128].map((x) => (
        <circle key={x} cx={x} cy="56" r="8" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      ))}
      <circle cx="160" cy="96" r="12" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      <path
        d="M154 96 L158.5 100.5 L166 92"
        fill="none"
        stroke={N}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="20" y="110" width="40" height="18" rx="6" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text x="40" y="122.5" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        main
      </text>
      <rect x="90" y="24" width="50" height="18" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="115" y="36.5" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        feature
      </text>
      <rect x="140" y="112" width="42" height="18" rx="6" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="161" y="124.5" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        PR ✓
      </text>
      <Sparkle x={40} y={40} r={6} fill={c("gold")} />
      <Sparkle x={170} y={30} r={4} />
    </g>
  );
}

/** R & the Tidyverse — a hex sticker, and a couple more from the pack. */
function RTidy() {
  return (
    <g>
      <Shadow y={132} rx={56} />
      <path d={hexPath(150, 42, 24)} fill={c("turf")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <text x="150" y="45.5" textAnchor="middle" fontSize="8.5" fontWeight="900" fill={N} fontFamily={MONO}>
        dplyr
      </text>
      <path d={hexPath(160, 98, 20)} fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <text x="160" y="102" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        gg
      </text>
      <path d={hexPath(88, 76, 50)} fill={c("ice")} stroke={N} strokeWidth="3" strokeLinejoin="round" />
      <path d={hexPath(88, 76, 42)} fill="none" stroke={c("ink", 0.5)} strokeWidth="2" />
      <text x="88" y="96" textAnchor="middle" fontSize="56" fontWeight="900" fill={N} fontFamily={SANS}>
        R
      </text>
      <Football x={30} y={118} rx={14} rot={20} />
      <Sparkle x={34} y={34} r={6} fill={c("gold")} />
    </g>
  );
}

/** LLMs & AI for Analysts — a robot, a chat bubble, AI sparkles. */
function AiRobot() {
  return (
    <g>
      <Shadow y={134} rx={48} />
      <path d="M78 30 V16" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
      <circle cx="78" cy="13" r="5" fill={c("gold")} stroke={N} strokeWidth="1.5" />
      <rect x="36" y="48" width="10" height="20" rx="4" fill={c("turf")} stroke={N} strokeWidth="2" />
      <rect x="110" y="48" width="10" height="20" rx="4" fill={c("turf")} stroke={N} strokeWidth="2" />
      <rect x="44" y="30" width="68" height="58" rx="16" fill={c("ink-soft")} stroke={N} strokeWidth="2.5" />
      <rect x="52" y="42" width="52" height="24" rx="12" fill={N} />
      <circle cx="68" cy="54" r="5.5" fill={c("turf")} />
      <circle cx="88" cy="54" r="5.5" fill={c("turf")} />
      <circle cx="66.5" cy="52.5" r="1.6" fill={c("ink")} />
      <circle cx="86.5" cy="52.5" r="1.6" fill={c("ink")} />
      <path d="M64 76 H92" stroke={N} strokeWidth="3" strokeLinecap="round" />
      <path d="M70 72 V80 M78 72 V80 M86 72 V80" stroke={N} strokeWidth="1.6" opacity="0.5" />
      <rect x="66" y="88" width="24" height="8" fill={c("ink-muted")} />
      <path d="M44 128 Q44 96 78 96 Q112 96 112 128 Z" fill={c("turf")} stroke={N} strokeWidth="2.5" strokeLinejoin="round" />
      <text x="78" y="120" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={SANS}>
        AI
      </text>
      <path
        d="M124 18 H180 Q186 18 186 24 V54 Q186 60 180 60 H140 L128 70 L131 60 H124 Q118 60 118 54 V24 Q118 18 124 18 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text x="126" y="32" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        SELECT…
      </text>
      <rect x="126" y="38" width="40" height="4" rx="2" fill={N} opacity="0.45" />
      <rect x="126" y="46" width="28" height="4" rx="2" fill={N} opacity="0.45" />
      <Sparkle x={160} y={98} r={11} fill={c("gold")} />
      <Sparkle x={180} y={82} r={5} />
      <Sparkle x={146} y={120} r={4} fill={c("ice")} />
    </g>
  );
}

const SCENES: Record<string, { tone: Tone; Scene: () => JSX.Element }> = {
  "sql-fundamentals": { tone: "turf", Scene: SqlFundamentals },
  "sql-advanced": { tone: "ice", Scene: SqlAdvanced },
  python: { tone: "gold", Scene: PythonPandas },
  stats: { tone: "turf", Scene: Stats },
  excel: { tone: "gold", Scene: Excel },
  tableau: { tone: "ice", Scene: Tableau },
  powerbi: { tone: "gold", Scene: PowerBi },
  git: { tone: "turf", Scene: Git },
  r: { tone: "ice", Scene: RTidy },
  ai: { tone: "turf", Scene: AiRobot },
};

/** True when `id` (a course or module id) has a picture. */
export function hasCourseArt(id: string): boolean {
  return Boolean(SCENES[ALIAS[id] ?? id]);
}

export default function CourseArt({
  id,
  className = "",
  align = "center",
}: {
  /** A course id, or a module id that belongs to a course. */
  id: string;
  className?: string;
  align?: "center" | "left";
}) {
  const key = ALIAS[id] ?? id;
  const entry = SCENES[key];
  if (!entry) return null;
  const { tone, Scene } = entry;
  return (
    <ArtSvg tone={tone} glowId={`c-${key}`} className={className} align={align}>
      <Scene />
    </ArtSvg>
  );
}
