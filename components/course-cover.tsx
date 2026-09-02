/**
 * A unique full-bleed cover scene per course.
 *
 * This replaced a set of five stock photos shared across ten course cards —
 * `action-tackle.jpg` alone was doing duty for three of them, so the catalogue
 * visibly repeated itself.
 *
 * Photos were the obvious fix and turned out not to be available. A survey of
 * the freely-licensed football photography on Wikimedia Commons and Openverse
 * found that nearly every usable frame carries a trademark — a Nike swoosh on
 * the ball, an Adidas board behind the scoreboard, an NFL team mark on a
 * banner — which is not something to put on a commercial product for
 * decoration. Only two were genuinely clean, and ten were needed.
 *
 * So each cover is drawn instead: an original scene that pairs the course's
 * subject with the sport, sharing a horizon and light treatment so the ten
 * read as one set. They are a few hundred bytes each against ~11 MB of JPEGs,
 * they flip with the theme because every colour is a token, and there is no
 * licence attached to any of them.
 *
 * Composition rule: keep the centre band quiet. The course title and
 * `CourseArt` mark sit on top of this, so detail belongs at the edges — the
 * scene is atmosphere, not the subject.
 */

type Props = {
  id: string;
  /** Matches the course accent so the scene tints with the card. */
  accent: "turf" | "gold";
  className?: string;
};

const VB = { w: 320, h: 180 };

/** Shared night sky + horizon glow, so all ten covers feel like one set. */
function Sky({ accent }: { accent: "turf" | "gold" }) {
  const glow = accent === "turf" ? "var(--c-turf)" : "var(--c-gold)";
  return (
    <>
      <rect width={VB.w} height={VB.h} fill="rgb(var(--c-night))" />
      <rect width={VB.w} height={VB.h} fill={`url(#sky-${accent})`} />
      {/* horizon bloom — the light spill that gives the scene depth */}
      <ellipse
        cx={VB.w / 2}
        cy={VB.h * 0.86}
        rx={VB.w * 0.62}
        ry={VB.h * 0.34}
        fill={`rgb(${glow})`}
        opacity="0.14"
      />
      <defs>
        <linearGradient id={`sky-${accent}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={`rgb(${glow})`} stopOpacity="0.62" />
          <stop offset="42%" stopColor={`rgb(${glow})`} stopOpacity="0.18" />
          <stop offset="100%" stopColor={`rgb(${glow})`} stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </>
  );
}

/** Receding yard lines — the ground plane most of the scenes stand on. */
function Field({ from = 128 }: { from?: number }) {
  const lines = [0, 1, 2, 3, 4, 5, 6];
  return (
    <g stroke="currentColor" strokeWidth="0.7">
      {lines.map((i) => {
        const t = i / (lines.length - 1);
        const y = from + t * t * (VB.h - from);
        const inset = 150 * (1 - t) * 0.42;
        return (
          <line
            key={i}
            x1={inset}
            y1={y}
            x2={VB.w - inset}
            y2={y}
            opacity={0.1 + t * 0.3}
          />
        );
      })}
    </g>
  );
}

/** Stadium crowd speckle. Deterministic — a random fill would flicker on rerender. */
function Crowd({ y, rows = 4, seed = 1 }: { y: number; rows?: number; seed?: number }) {
  const dots: { x: number; y: number; o: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 46; c++) {
      // cheap deterministic hash — stable across renders and builds
      const h = ((c * 73 + r * 149 + seed * 31) % 97) / 97;
      if (h < 0.35) continue;
      dots.push({ x: 4 + c * 6.9, y: y - r * 5.2, o: 0.1 + h * 0.28 });
    }
  }
  return (
    <g fill="currentColor">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1.15" opacity={d.o} />
      ))}
    </g>
  );
}

function Floodlight({ x, h = 46 }: { x: number; h?: number }) {
  return (
    <g stroke="currentColor" fill="currentColor">
      <line x1={x} y1={h} x2={x} y2={h + 44} strokeWidth="1.2" opacity="0.35" />
      <rect x={x - 11} y={h - 7} width="22" height="8" opacity="0.4" rx="1" />
      <polygon
        points={`${x - 11},${h + 1} ${x + 11},${h + 1} ${x + 34},${VB.h} ${x - 34},${VB.h}`}
        opacity="0.06"
      />
    </g>
  );
}

// ── the ten scenes ────────────────────────────────────────────────

/** SQL Fundamentals — a stat sheet standing on the field: rows and columns. */
function SqlFundamentals() {
  return (
    <g>
      <Crowd y={62} rows={4} seed={2} />
      <Field from={120} />
      <g stroke="currentColor" opacity="0.5">
        <rect x="96" y="66" width="128" height="52" fill="none" strokeWidth="1.1" />
        <line x1="96" y1="80" x2="224" y2="80" strokeWidth="1.1" />
        {[128, 160, 192].map((x) => (
          <line key={x} x1={x} y1="66" x2={x} y2="118" strokeWidth="0.6" opacity="0.6" />
        ))}
        {[93, 106].map((y) => (
          <line key={y} x1="96" y1={y} x2="224" y2={y} strokeWidth="0.5" opacity="0.45" />
        ))}
      </g>
    </g>
  );
}

/** Advanced SQL — a ranked board where one window of rows is lit: OVER/PARTITION. */
function SqlAdvanced() {
  return (
    <g>
      <Floodlight x={44} />
      <Floodlight x={276} />
      <Field from={132} />
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 52 + i * 13;
          const lit = i >= 2 && i <= 4;
          return (
            <g key={i}>
              <rect
                x="104"
                y={y}
                width={112 - i * 6}
                height="9"
                fill="currentColor"
                opacity={lit ? 0.34 : 0.12}
              />
              <rect x="92" y={y} width="8" height="9" fill="currentColor" opacity="0.3" />
            </g>
          );
        })}
        {/* the window frame — the partition being ranked over */}
        <rect
          x="86"
          y="76"
          width="140"
          height="37"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          opacity="0.65"
        />
      </g>
    </g>
  );
}

/** Python — a route tree: one stem branching into receiver paths. */
function Python() {
  return (
    <g>
      <Crowd y={50} rows={3} seed={5} />
      <Field from={118} />
      <g stroke="currentColor" fill="none" strokeWidth="1.6" opacity="0.6">
        <path d="M160 156 L160 96" />
        <path d="M160 116 C160 100 138 96 118 88" />
        <path d="M160 108 C160 92 186 88 208 82" />
        <path d="M160 96 C160 78 140 66 126 58" strokeWidth="1.2" opacity="0.75" />
        <path d="M160 96 C160 76 184 66 202 60" strokeWidth="1.2" opacity="0.75" />
      </g>
      <g fill="currentColor" opacity="0.75">
        {[
          [118, 88],
          [208, 82],
          [126, 58],
          [202, 60],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" />
        ))}
        <circle cx="160" cy="156" r="3.2" />
      </g>
    </g>
  );
}

/** Statistics — kick trajectories scattering around a curve through the uprights. */
function Stats() {
  return (
    <g>
      <Field from={126} />
      {/* uprights */}
      <g stroke="currentColor" strokeWidth="1.6" opacity="0.45">
        <line x1="160" y1="150" x2="160" y2="104" />
        <line x1="128" y1="104" x2="192" y2="104" />
        <line x1="128" y1="104" x2="128" y2="72" />
        <line x1="192" y1="104" x2="192" y2="72" />
      </g>
      {/* the distribution of attempts */}
      <g stroke="currentColor" fill="none" opacity="0.4">
        {[-26, -13, 0, 13, 26].map((d, i) => (
          <path
            key={i}
            d={`M52 150 Q ${106 + d} ${44 + Math.abs(d) * 0.8} ${160 + d} 96`}
            strokeWidth={d === 0 ? 1.7 : 0.9}
            opacity={d === 0 ? 0.9 : 0.5}
          />
        ))}
      </g>
      <g fill="currentColor" opacity="0.55">
        {[-26, -13, 0, 13, 26].map((d, i) => (
          <circle key={i} cx={160 + d} cy={96} r={d === 0 ? 2.6 : 1.8} />
        ))}
      </g>
    </g>
  );
}

/** Excel — the stadium as a grid of cells, one column running the totals. */
function Excel() {
  const cols = 12;
  const rows = 5;
  return (
    <g>
      <Field from={140} />
      <g>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => {
            const h = ((c * 61 + r * 113) % 89) / 89;
            const isTotal = c === cols - 1;
            return (
              <rect
                key={`${r}-${c}`}
                x={40 + c * 20}
                y={54 + r * 15}
                width="18"
                height="13"
                fill="currentColor"
                opacity={isTotal ? 0.34 : 0.07 + h * 0.14}
              />
            );
          }),
        )}
        <rect
          x="38"
          y="52"
          width={cols * 20 + 2}
          height={rows * 15 + 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.4"
        />
      </g>
    </g>
  );
}

/** Tableau — terraced stands that read as a bar chart. */
function Tableau() {
  const bars = [26, 44, 34, 58, 48, 70, 62, 40];
  return (
    <g>
      <Crowd y={44} rows={2} seed={9} />
      <Field from={144} />
      <g fill="currentColor">
        {bars.map((h, i) => (
          <rect
            key={i}
            x={40 + i * 30}
            y={140 - h}
            width="21"
            height={h}
            opacity={0.16 + (i % 3) * 0.12}
          />
        ))}
      </g>
      <line
        x1="34"
        y1="140"
        x2="286"
        y2="140"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.5"
      />
    </g>
  );
}

/** Power BI — a scoreboard matrix wired into a star schema. */
function PowerBi() {
  const spokes = [
    [96, 58],
    [224, 58],
    [82, 112],
    [238, 112],
    [160, 136],
  ];
  return (
    <g>
      <Field from={150} />
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.4">
        {spokes.map(([x, y], i) => (
          <line key={i} x1="160" y1="92" x2={x} y2={y} />
        ))}
      </g>
      <g fill="currentColor">
        {spokes.map(([x, y], i) => (
          <rect key={i} x={x - 13} y={y - 7} width="26" height="14" opacity="0.22" rx="1" />
        ))}
        <rect x="140" y="82" width="40" height="20" opacity="0.42" rx="1" />
      </g>
      {/* scoreboard pixels */}
      <g fill="currentColor" opacity="0.2">
        {Array.from({ length: 18 }).map((_, i) => (
          <rect key={i} x={46 + i * 13} y="34" width="8" height="8" />
        ))}
      </g>
    </g>
  );
}

/** Git — chalked play-lines branching off a drive and merging back. */
function Git() {
  return (
    <g>
      <Field from={132} />
      <g stroke="currentColor" fill="none" strokeWidth="1.7" opacity="0.6">
        <path d="M36 96 L284 96" />
        <path d="M104 96 C124 96 128 66 150 66 L206 66 C226 66 232 96 250 96" opacity="0.75" />
        <path d="M132 96 C150 96 154 126 176 126 L214 126" opacity="0.45" />
      </g>
      <g fill="currentColor">
        {[
          [104, 96, 0.8],
          [150, 66, 0.7],
          [206, 66, 0.7],
          [250, 96, 0.85],
          [132, 96, 0.55],
          [214, 126, 0.45],
        ].map(([x, y, o], i) => (
          <circle key={i} cx={x} cy={y} r="3.4" opacity={o as number} />
        ))}
      </g>
    </g>
  );
}

/** R — small multiples: the same field repeated, faceted. */
function RLang() {
  const cells = [0, 1, 2, 3, 4, 5];
  return (
    <g>
      <Field from={150} />
      <g>
        {cells.map((i) => {
          const x = 46 + (i % 3) * 78;
          const y = 46 + Math.floor(i / 3) * 52;
          const h = ((i * 37) % 23) / 23;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width="66"
                height="42"
                fill="currentColor"
                opacity={0.05 + h * 0.06}
                stroke="currentColor"
                strokeOpacity="0.32"
                strokeWidth="0.7"
              />
              <path
                d={`M${x + 6} ${y + 34} Q ${x + 22} ${y + 8 + h * 16} ${x + 33} ${y + 20} T ${x + 60} ${y + 10 + h * 10}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                opacity="0.55"
              />
            </g>
          );
        })}
      </g>
    </g>
  );
}

/** AI — a chalk play diagram with predicted paths fanning out. */
function Ai() {
  return (
    <g>
      <Field from={128} />
      {/* the line of scrimmage and the Xs and Os */}
      <line
        x1="52"
        y1="104"
        x2="268"
        y2="104"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.6" fill="none">
        {[76, 106, 136, 166, 196].map((x) => (
          <g key={x}>
            <line x1={x - 4} y1="112" x2={x + 4} y2="120" />
            <line x1={x + 4} y1="112" x2={x - 4} y2="120" />
          </g>
        ))}
        {[91, 121, 151, 181].map((x) => (
          <circle key={x} cx={x} cy="92" r="4.5" opacity="0.5" />
        ))}
      </g>
      {/* predicted routes, fading with confidence */}
      <g stroke="currentColor" fill="none">
        {[
          ["M226 116 C246 106 250 78 240 56", 0.75],
          ["M226 116 C252 110 268 92 272 70", 0.45],
          ["M226 116 C244 118 262 116 276 104", 0.25],
        ].map(([d, o], i) => (
          <path
            key={i}
            d={d as string}
            strokeWidth="1.6"
            opacity={o as number}
            strokeDasharray={i === 0 ? undefined : "3 3"}
          />
        ))}
      </g>
      <circle cx="226" cy="116" r="3.4" fill="currentColor" opacity="0.8" />
    </g>
  );
}

const SCENES: Record<string, () => JSX.Element> = {
  "sql-fundamentals": SqlFundamentals,
  "sql-advanced": SqlAdvanced,
  python: Python,
  stats: Stats,
  excel: Excel,
  tableau: Tableau,
  powerbi: PowerBi,
  git: Git,
  r: RLang,
  ai: Ai,
};

export default function CourseCover({ id, accent, className = "" }: Props) {
  const Scene = SCENES[id] ?? SqlFundamentals;
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <Sky accent={accent} />
      {/* currentColor is set by the caller to the course accent, so every
          stroke below tints without each scene naming a colour. */}
      <g className={accent === "turf" ? "text-turf" : "text-gold"}>
        <Scene />
      </g>
    </svg>
  );
}
