/**
 * Original artwork for each course card.
 *
 * Drawn here rather than sourced, for two reasons. The obvious one: every
 * real BI/database logo (the MySQL dolphin, the Tableau wordmark, the Python
 * logo) is a trademark we have no licence to use, and stock photo libraries
 * are "free to use" rather than genuinely public domain. Original SVG has no
 * third-party rights attached at all.
 *
 * The second: these theme correctly. Everything is stroked in `currentColor`
 * at varying opacity, so the parent sets `text-turf` or `text-gold` and the
 * art follows the palette into light mode without a second asset.
 *
 * Shared visual language: a yard-line backdrop behind every piece ties the set
 * together, and each foreground encodes what the course actually teaches —
 * a table grain for SQL, a branch graph for Git, a distribution for stats.
 */

type Props = { id: string; className?: string };

/** Field stripes behind every card, so the nine read as one set. */
function YardLines() {
  return (
    <g opacity="0.16">
      {[20, 40, 60, 80, 100, 120, 140].map((x) => (
        <line key={x} x1={x} y1="6" x2={x} y2="84" stroke="currentColor" strokeWidth="1" />
      ))}
      <line x1="80" y1="6" x2="80" y2="84" stroke="currentColor" strokeWidth="2" />
    </g>
  );
}

function Sql() {
  // A table with one row picked out — "what one row represents" is lesson one.
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="34" y="22" width="92" height="46" opacity="0.5" />
      <line x1="34" y1="34" x2="126" y2="34" opacity="0.5" />
      <line x1="64" y1="22" x2="64" y2="68" opacity="0.28" />
      <line x1="95" y1="22" x2="95" y2="68" opacity="0.28" />
      <line x1="34" y1="45" x2="126" y2="45" opacity="0.28" />
      <line x1="34" y1="57" x2="126" y2="57" opacity="0.28" />
      <rect x="34" y="45" width="92" height="12" fill="currentColor" opacity="0.22" stroke="none" />
      <rect x="34" y="45" width="92" height="12" opacity="0.9" />
    </g>
  );
}

function Python() {
  // Indented blocks stepping down — the shape of a loop body.
  return (
    <g stroke="currentColor" fill="none" strokeWidth="2">
      <rect x="30" y="24" width="52" height="9" opacity="0.75" />
      <rect x="44" y="38" width="52" height="9" opacity="0.55" />
      <rect x="58" y="52" width="52" height="9" opacity="0.4" />
      <rect x="72" y="66" width="46" height="9" opacity="0.28" />
      <path d="M24 24v55" opacity="0.5" />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" opacity="0.9" />
    </g>
  );
}

function Stats() {
  // A distribution with the tail outlier that every stats lesson argues about.
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M24 70c14 0 16-38 32-38s18 38 32 38"
        opacity="0.35"
        transform="translate(14,0)"
      />
      <path d="M24 70c16 0 18-44 36-44s20 44 36 44" opacity="0.85" transform="translate(10,0)" />
      <line x1="24" y1="70" x2="136" y2="70" opacity="0.5" />
      <circle cx="122" cy="58" r="3.5" fill="currentColor" stroke="none" opacity="0.95" />
      <line x1="122" y1="62" x2="122" y2="70" opacity="0.6" strokeDasharray="3 3" />
    </g>
  );
}

function Excel() {
  // A grid with a formula cell — the moment a spreadsheet becomes analysis.
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="32" y="20" width="96" height="50" opacity="0.5" />
      {[32, 56, 80, 104].map((x) => (
        <line key={x} x1={x} y1="20" x2={x} y2="70" opacity="0.25" />
      ))}
      {[33, 45, 57].map((y) => (
        <line key={y} x1="32" y1={y} x2="128" y2={y} opacity="0.25" />
      ))}
      <rect x="80" y="45" width="24" height="12" fill="currentColor" opacity="0.28" stroke="none" />
      <rect x="80" y="45" width="24" height="12" opacity="0.95" />
      <path d="M86 51h12" opacity="0.9" strokeWidth="2" />
      <path d="M92 47v8" opacity="0.9" strokeWidth="2" />
    </g>
  );
}

function Tableau() {
  // Scattered marks resolving into a dashboard grid.
  return (
    <g stroke="currentColor" fill="none" strokeWidth="2">
      <rect x="28" y="20" width="44" height="28" opacity="0.45" />
      <rect x="80" y="20" width="52" height="28" opacity="0.45" />
      <rect x="28" y="54" width="104" height="18" opacity="0.45" />
      <path d="M34 42l8-10 8 6 8-14 8 8" opacity="0.95" />
      {[
        [88, 40],
        [100, 32],
        [112, 36],
        [124, 27],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="3" fill="currentColor" stroke="none" opacity="0.85" />
      ))}
      <rect x="34" y="60" width="30" height="6" fill="currentColor" stroke="none" opacity="0.7" />
      <rect x="70" y="60" width="18" height="6" fill="currentColor" stroke="none" opacity="0.4" />
    </g>
  );
}

function PowerBi() {
  // Columns plus a KPI tile — the two halves of every BI report.
  return (
    <g stroke="currentColor" fill="none" strokeWidth="2">
      <rect x="28" y="18" width="46" height="22" opacity="0.5" />
      <path d="M35 32l7-7 6 5 7-9" opacity="0.9" />
      <line x1="28" y1="72" x2="132" y2="72" opacity="0.5" />
      {[
        [84, 30],
        [98, 44],
        [112, 22],
        [126, 38],
      ].map(([x, y]) => (
        <rect
          key={x}
          x={x}
          y={y}
          width="10"
          height={72 - y}
          fill="currentColor"
          stroke="none"
          opacity="0.55"
        />
      ))}
      <rect x="112" y="22" width="10" height="50" opacity="0.95" />
      <rect x="34" y="52" width="34" height="6" fill="currentColor" stroke="none" opacity="0.35" />
      <rect x="34" y="62" width="22" height="6" fill="currentColor" stroke="none" opacity="0.2" />
    </g>
  );
}

function Git() {
  // A branch leaving main and merging back — the whole course in one graph.
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M32 60h96" opacity="0.5" />
      <path d="M56 60c0-16 12-24 26-24h14" opacity="0.85" />
      <path d="M96 36c14 0 22 8 22 24" opacity="0.85" />
      {[32, 60, 90, 128].map((cx) => (
        <circle key={cx} cx={cx} cy="60" r="4.5" fill="currentColor" stroke="none" opacity="0.55" />
      ))}
      <circle cx="78" cy="36" r="4.5" fill="currentColor" stroke="none" opacity="0.95" />
      <circle cx="104" cy="38" r="4.5" fill="currentColor" stroke="none" opacity="0.95" />
    </g>
  );
}

function RLang() {
  // Scatter with a fitted line — what R was built to do.
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="30" y1="72" x2="132" y2="72" opacity="0.5" />
      <line x1="30" y1="16" x2="30" y2="72" opacity="0.5" />
      <path d="M38 66L126 26" opacity="0.9" />
      {[
        [46, 62],
        [58, 60],
        [70, 50],
        [82, 48],
        [94, 38],
        [106, 36],
        [118, 28],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="3.2" fill="currentColor" stroke="none" opacity="0.7" />
      ))}
    </g>
  );
}

function Ai() {
  // A small network — nodes and weights, not a glowing brain.
  const nodes: [number, number][] = [
    [40, 30],
    [40, 58],
    [80, 22],
    [80, 44],
    [80, 66],
    [120, 34],
    [120, 58],
  ];
  const edges: [number, number][] = [
    [0, 2],
    [0, 3],
    [1, 3],
    [1, 4],
    [2, 5],
    [3, 5],
    [3, 6],
    [4, 6],
  ];
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1.6">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          opacity={i % 3 === 0 ? 0.8 : 0.3}
        />
      ))}
      {nodes.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="5"
          fill="currentColor"
          stroke="none"
          opacity={i === 3 ? 0.95 : 0.55}
        />
      ))}
    </g>
  );
}

const ART: Record<string, () => JSX.Element> = {
  sql: Sql,
  python: Python,
  stats: Stats,
  excel: Excel,
  tableau: Tableau,
  powerbi: PowerBi,
  git: Git,
  r: RLang,
  ai: Ai,
};

export default function CourseArt({ id, className = "" }: Props) {
  const Shape = ART[id] ?? Sql;
  return (
    <svg
      viewBox="0 0 160 90"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <YardLines />
      <Shape />
    </svg>
  );
}
