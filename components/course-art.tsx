/**
 * Original artwork for each course card.
 *
 * Drawn rather than sourced. Every real logo in this space — the MySQL
 * dolphin, the Tableau wordmark, the Python logo — is a trademark we have no
 * licence to use, and stock libraries are "free to use" rather than genuinely
 * public domain. Original SVG carries no third-party rights at all.
 *
 * Each piece has to do two jobs at once: say what the course teaches AND read
 * as football, because that pairing is the whole product. So the Git branch
 * graph merges at a goalpost, the stats distribution is a field-goal arc, the
 * AI network is an X-and-O play diagram, and Python's nesting is a route tree.
 *
 * Everything is stroked in `currentColor` at varying opacity, so the card sets
 * `text-turf` or `text-gold` and the art follows the palette into light mode
 * without a second asset.
 */

type Props = { id: string; className?: string };

/** Shared prop for the football shape used across several pieces. */
function Football({ x, y, r = 1, o = 0.95 }: { x: number; y: number; r?: number; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-24) scale(${r})`} opacity={o}>
      <ellipse rx="7.5" ry="4.6" fill="currentColor" stroke="none" />
      <line x1="-3.4" y1="0" x2="3.4" y2="0" stroke="rgb(var(--c-night))" strokeWidth="1.1" />
      <line x1="-1.6" y1="-1.5" x2="-1.6" y2="1.5" stroke="rgb(var(--c-night))" strokeWidth="1.1" />
      <line x1="0" y1="-1.7" x2="0" y2="1.7" stroke="rgb(var(--c-night))" strokeWidth="1.1" />
      <line x1="1.6" y1="-1.5" x2="1.6" y2="1.5" stroke="rgb(var(--c-night))" strokeWidth="1.1" />
    </g>
  );
}

/** Goalpost — the uprights, from behind. */
function Goalpost({ x, y, s = 1, o = 0.8 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      opacity={o}
    >
      <line x1="0" y1="0" x2="0" y2="-12" />
      <line x1="-13" y1="-12" x2="13" y2="-12" />
      <line x1="-13" y1="-12" x2="-13" y2="-30" />
      <line x1="13" y1="-12" x2="13" y2="-30" />
    </g>
  );
}

function YardLines() {
  return (
    <g opacity="0.14">
      {[20, 40, 60, 80, 100, 120, 140].map((x) => (
        <line key={x} x1={x} y1="6" x2={x} y2="84" stroke="currentColor" strokeWidth="1" />
      ))}
      <line x1="80" y1="6" x2="80" y2="84" stroke="currentColor" strokeWidth="2" />
    </g>
  );
}

/** SQL — a stat sheet with one row picked out, ball sitting on it. */
function Sql() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="28" y="20" width="104" height="50" opacity="0.45" />
      <line x1="28" y1="32" x2="132" y2="32" opacity="0.55" />
      <line x1="60" y1="20" x2="60" y2="70" opacity="0.22" />
      <line x1="98" y1="20" x2="98" y2="70" opacity="0.22" />
      <line x1="28" y1="45" x2="132" y2="45" opacity="0.22" />
      <line x1="28" y1="58" x2="132" y2="58" opacity="0.22" />
      <rect x="28" y="45" width="104" height="13" fill="currentColor" opacity="0.2" stroke="none" />
      <rect x="28" y="45" width="104" height="13" opacity="0.95" />
      <Football x={44} y={51.5} r={0.78} />
      <rect x="34" y="24.5" width="18" height="4" fill="currentColor" stroke="none" opacity="0.5" />
      <rect x="66" y="24.5" width="24" height="4" fill="currentColor" stroke="none" opacity="0.5" />
      <rect x="104" y="24.5" width="20" height="4" fill="currentColor" stroke="none" opacity="0.5" />
    </g>
  );
}

/** Python — a route tree: branching logic drawn the way a playbook draws it. */
function Python() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="24" y1="76" x2="136" y2="76" opacity="0.45" />
      <path d="M52 76V34" opacity="0.9" />
      <path d="M52 46h-18" opacity="0.6" strokeDasharray="4 3" />
      <path d="M52 40l22-12" opacity="0.6" strokeDasharray="4 3" />
      <path d="M52 34h26" opacity="0.75" strokeDasharray="4 3" />
      <path d="M52 34c18 0 20-12 34-12" opacity="0.6" strokeDasharray="4 3" />
      <path d="M52 58l26 10" opacity="0.5" strokeDasharray="4 3" />
      <circle cx="52" cy="76" r="4" fill="currentColor" stroke="none" opacity="0.9" />
      {[
        [34, 46],
        [74, 28],
        [78, 34],
        [86, 22],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" fill="currentColor" stroke="none" opacity="0.75" />
      ))}
      <Football x={112} y={40} r={0.72} o={0.85} />
    </g>
  );
}

/** Statistics — a field-goal arc as the distribution, plus the outlier miss. */
function Stats() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="74" x2="138" y2="74" opacity="0.45" />
      <path d="M34 74C46 26 86 26 100 74" opacity="0.9" />
      <path d="M34 74C50 40 84 40 100 74" opacity="0.3" />
      <Goalpost x={100} y={74} s={0.85} o={0.7} />
      {[
        [50, 48],
        [62, 39],
        [74, 37],
        [86, 43],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="2.8" fill="currentColor" stroke="none" opacity="0.6" />
      ))}
      <circle cx="128" cy="34" r="3.4" fill="currentColor" stroke="none" opacity="0.95" />
      <line x1="128" y1="38" x2="128" y2="74" opacity="0.45" strokeDasharray="3 3" />
    </g>
  );
}

/** Excel — the stadium scoreboard as a grid, with one cell doing the maths. */
function Excel() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="26" y="16" width="108" height="48" opacity="0.5" />
      <line x1="26" y1="28" x2="134" y2="28" opacity="0.5" />
      {[53, 80, 107].map((x) => (
        <line key={x} x1={x} y1="28" x2={x} y2="64" opacity="0.22" />
      ))}
      <line x1="26" y1="46" x2="134" y2="46" opacity="0.22" />
      <rect x="80" y="46" width="27" height="18" fill="currentColor" opacity="0.22" stroke="none" />
      <rect x="80" y="46" width="27" height="18" opacity="0.95" />
      <path d="M88 55h11M93.5 49.5v11" opacity="0.95" />
      <rect x="32" y="20" width="22" height="4" fill="currentColor" stroke="none" opacity="0.55" />
      <rect x="106" y="20" width="22" height="4" fill="currentColor" stroke="none" opacity="0.55" />
      <line x1="44" y1="64" x2="44" y2="74" opacity="0.5" />
      <line x1="116" y1="64" x2="116" y2="74" opacity="0.5" />
      <line x1="34" y1="74" x2="54" y2="74" opacity="0.5" />
      <line x1="106" y1="74" x2="126" y2="74" opacity="0.5" />
    </g>
  );
}

/** Tableau — dashboard tiles, one of them holding a helmet. */
function Tableau() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="24" y="18" width="46" height="30" opacity="0.4" />
      <rect x="78" y="18" width="58" height="30" opacity="0.4" />
      <rect x="24" y="54" width="112" height="20" opacity="0.4" />
      {/* helmet: dome + facemask */}
      <path d="M34 42c0-11 7-17 15-17s12 6 12 14v3" opacity="0.95" />
      <path d="M47 42h14" opacity="0.9" />
      <path d="M50 36h11" opacity="0.6" />
      <circle cx="44" cy="33" r="2" fill="currentColor" stroke="none" opacity="0.7" />
      {/* trend tile */}
      <path d="M84 42l10-12 9 7 10-15 12 10" opacity="0.9" />
      {[
        [30, 64],
        [58, 64],
        [86, 64],
      ].map(([x]) => (
        <rect key={x} x={x} y="60" width="22" height="8" fill="currentColor" stroke="none" opacity="0.4" />
      ))}
      <rect x="114" y="60" width="16" height="8" fill="currentColor" stroke="none" opacity="0.75" />
    </g>
  );
}

/** Power BI — the stands as a bar chart, scoreboard tile above. */
function PowerBi() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="24" y="14" width="50" height="22" opacity="0.45" />
      <path d="M31 29l8-8 7 6 8-11" opacity="0.9" />
      <line x1="24" y1="76" x2="136" y2="76" opacity="0.5" />
      {[
        [82, 44],
        [95, 32],
        [108, 24],
        [121, 36],
      ].map(([x, y], i) => (
        <rect
          key={x}
          x={x}
          y={y}
          width="11"
          height={76 - y}
          fill="currentColor"
          stroke="none"
          opacity={i === 2 ? 0.9 : 0.45}
        />
      ))}
      {/* crowd tiers on the left */}
      {[62, 52, 42].map((y, i) => (
        <line key={y} x1={30 + i * 5} y1={y} x2={66 - i * 4} y2={y} opacity="0.3" strokeWidth="3" />
      ))}
      <Football x={108} y={16} r={0.7} o={0.9} />
    </g>
  );
}

/** Git — commits as footballs down the drive, the branch merging at the posts. */
function Git() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="20" y1="60" x2="120" y2="60" opacity="0.45" />
      <path d="M46 60c0-16 12-22 26-22h10" opacity="0.85" />
      <path d="M82 38c16 0 20 8 20 22" opacity="0.85" />
      <Football x={26} y={60} r={0.62} o={0.7} />
      <Football x={64} y={60} r={0.62} o={0.7} />
      <Football x={72} y={38} r={0.72} o={0.95} />
      <Goalpost x={126} y={72} s={0.8} o={0.85} />
      <line x1="20" y1="72" x2="112" y2="72" opacity="0.2" strokeDasharray="4 4" />
    </g>
  );
}

/** R — the pass trajectory as the fitted line, receivers scattered around it. */
function RLang() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="26" y1="74" x2="136" y2="74" opacity="0.45" />
      <line x1="26" y1="14" x2="26" y2="74" opacity="0.45" />
      <path d="M36 68C64 22 104 22 128 52" opacity="0.9" />
      <Football x={38} y={66} r={0.68} o={0.95} />
      {[
        [52, 52],
        [64, 42],
        [78, 36],
        [92, 33],
        [106, 36],
        [118, 44],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="3" fill="currentColor" stroke="none" opacity="0.6" />
      ))}
      <circle cx="128" cy="52" r="4" opacity="0.95" />
    </g>
  );
}

/** AI — the network as an X-and-O play diagram, one node lit up. */
function Ai() {
  const os: [number, number][] = [
    [38, 30],
    [38, 58],
  ];
  const mid: [number, number][] = [
    [80, 22],
    [80, 44],
    [80, 66],
  ];
  const xs: [number, number][] = [
    [124, 34],
    [124, 58],
  ];
  const edges: [[number, number], [number, number]][] = [
    [os[0], mid[0]],
    [os[0], mid[1]],
    [os[1], mid[1]],
    [os[1], mid[2]],
    [mid[0], xs[0]],
    [mid[1], xs[0]],
    [mid[1], xs[1]],
    [mid[2], xs[1]],
  ];
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.7">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          opacity={i === 2 || i === 6 ? 0.85 : 0.28}
          strokeDasharray={i % 2 ? "4 3" : undefined}
        />
      ))}
      {os.map(([cx, cy]) => (
        <circle key={cx + cy} cx={cx} cy={cy} r="5.5" opacity="0.8" strokeWidth="2.2" />
      ))}
      {mid.map(([cx, cy], i) => (
        <circle
          key={cx + cy}
          cx={cx}
          cy={cy}
          r="5"
          fill="currentColor"
          stroke="none"
          opacity={i === 1 ? 0.95 : 0.45}
        />
      ))}
      {xs.map(([cx, cy]) => (
        <g key={cx + cy} opacity="0.85" strokeWidth="2.4">
          <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} />
          <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} />
        </g>
      ))}
    </g>
  );
}

const ART: Record<string, () => JSX.Element> = {
  "sql-fundamentals": Sql,
  "sql-advanced": Sql,
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
