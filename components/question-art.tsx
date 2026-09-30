/**
 * The drawn picture on a question card — one per idea in the title.
 *
 * **The rule is literal: the picture is what the title says.** "Name the
 * Quarterbacks" is a quarterback mid-throw. "Thirty Burger" is a burger with
 * a 30 flag in it. "The Drop-Off" is a ball going off a cliff. This used to
 * be eight generic scenes shared across the whole bank, so a quarterback
 * question wore a clipboard and a burger question wore a heat grid — the
 * picture was decoration, and decoration nobody could read. A card is a
 * thing you are being invited to pick up; the picture should tell you what
 * is inside before the title does.
 *
 * When a new question needs a picture no scene covers, draw a new scene
 * rather than borrowing the nearest one. Borrowing is how it drifted last
 * time.
 *
 * Drawn rather than photographed for the same reason as the course covers:
 * freely licensed football photography nearly always has a brand or team mark
 * somewhere in frame. Nothing here depicts a real player, team, number or
 * logo — the figures wear their position (QB, WR, TE) rather than a number,
 * and every colour is a theme token.
 *
 * Anything computed with trig is rounded to one decimal before it reaches an
 * attribute. These render on the server and hydrate on the client, and
 * `Math.cos` is allowed to differ in its last bit between JavaScript engines;
 * an unrounded attribute can differ between the two renders.
 */

import type { QuestionArt } from "@/lib/questions";

const VB = { w: 200, h: 150 };

type Tone = "turf" | "ice" | "gold";

const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** A theme token as a colour, optionally with alpha. Never a hex. */
const c = (token: string, alpha?: number) =>
  alpha === undefined
    ? `rgb(var(--c-${token}))`
    : `rgb(var(--c-${token}) / ${alpha})`;

const N = c("night");

/** Round so server and client print identical attribute strings. */
const r1 = (v: number) => Math.round(v * 10) / 10;

/** Which accent lights each scene — keeps a grid of cards varied. */
export const ART_TONE: Record<QuestionArt, Tone> = {
  hammer: "gold",
  quarterback: "ice",
  burger: "gold",
  calendar: "turf",
  storm: "ice",
  jersey: "turf",
  rocket: "ice",
  chalkboard: "gold",
  dome: "ice",
  "tight-end": "gold",
  ppg: "gold",
  boom: "gold",
  "floor-ceiling": "ice",
  years: "turf",
  podium: "gold",
  "night-game": "ice",
  weather: "ice",
  shield: "ice",
  crown: "gold",
  stairs: "turf",
  mask: "ice",
  medals: "gold",
  wave: "ice",
  "double-flame": "gold",
  pie: "turf",
  film: "gold",
  cliff: "turf",
  zzz: "ice",
  magnifier: "gold",
  "foam-finger": "gold",
  clicker: "turf",
  ticket: "ice",
  "velvet-rope": "ice",
  positions: "ice",
  medkit: "turf",
  receiver: "turf",
  huddle: "gold",
  peak: "turf",
  "money-bag": "gold",
  binoculars: "ice",
  scale: "gold",
  spotlight: "gold",
  broom: "turf",
};

// ── Shared pieces ────────────────────────────────────────────────

/** The pool of light every object sits in, plus faint broadcast rays. */
function Glow({ t, id }: { t: Tone; id: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a0 = ((i * 30 - 5) * Math.PI) / 180;
    const a1 = ((i * 30 + 5) * Math.PI) / 180;
    return `M100 78 L${r1(100 + 150 * Math.cos(a0))} ${r1(78 + 150 * Math.sin(a0))} L${r1(100 + 150 * Math.cos(a1))} ${r1(78 + 150 * Math.sin(a1))} Z`;
  });
  return (
    <>
      <defs>
        <radialGradient id={`qg-${id}`} cx="50%" cy="52%" r="62%">
          <stop offset="0%" stopColor={c(t)} stopOpacity="0.45" />
          <stop offset="60%" stopColor={c(t)} stopOpacity="0.12" />
          <stop offset="100%" stopColor={c(t)} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={VB.w} height={VB.h} fill={`url(#qg-${id})`} />
      <g fill={c(t)} opacity="0.07">
        {rays.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </>
  );
}

function Shadow({ x = 100, y = 130, rx = 48 }: { x?: number; y?: number; rx?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={r1(rx * 0.16)} fill={N} opacity="0.55" />;
}

function Sparkle({
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
function Football({
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

type Pose = "throw" | "catch" | "stand";

/**
 * A player, feet at (x, y). Wears a position on his chest, never a number —
 * a number is one step from a real person.
 */
function Player({
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
function MiniHelmet({ x, y, fill }: { x: number; y: number; fill: string }) {
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

const FLAME_D =
  "M0 0 C-20 0 -26 -18 -18 -34 C-12 -46 -4 -50 -6 -66 C4 -58 12 -48 12 -36 C16 -42 18 -46 16 -52 C26 -40 26 -18 20 -8 C16 -2 8 0 0 0 Z";

function Flame({
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
function starPath(cx: number, cy: number, points: number, outer: number, inner: number, rotDeg: number) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner;
    const a = ((rotDeg + (i * 180) / points) * Math.PI) / 180;
    pts.push(`${r1(cx + rad * Math.cos(a))} ${r1(cy + rad * Math.sin(a))}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** A pie slice; degrees start at 12 o'clock and run clockwise. */
function slicePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${r1(cx + r * Math.cos(rad))} ${r1(cy + r * Math.sin(rad))}`;
  };
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx} ${cy} L${p(a0)} A${r} ${r} 0 ${large} 1 ${p(a1)} Z`;
}

// ── Scenes, one per title idea ───────────────────────────────────

/** Week 3 Hammer — a sledgehammer coming down on a football. */
function Hammer() {
  return (
    <g>
      <Shadow y={132} rx={50} />
      <Football x={104} y={116} rx={26} />
      <g stroke={c("gold")} strokeWidth="3.5" strokeLinecap="round">
        <path d="M64 108 L50 100" />
        <path d="M62 122 L46 124" />
        <path d="M146 104 L158 94" />
        <path d="M148 120 L164 122" />
      </g>
      <g transform="rotate(30 100 81)">
        <rect x="96" y="6" width="9" height="66" rx="4" fill={c("gold-dim")} stroke={N} strokeWidth="1.8" />
        <rect x="68" y="66" width="64" height="30" rx="7" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
        <rect x="68" y="66" width="13" height="30" rx="5" fill={c("ink-muted")} stroke={N} strokeWidth="1.5" />
        <rect x="119" y="66" width="13" height="30" rx="5" fill={c("ink-muted")} stroke={N} strokeWidth="1.5" />
        <rect x="93" y="66" width="14" height="30" fill={c("gold")} stroke={N} strokeWidth="1.5" />
        <path d="M84 70 H116" stroke={c("ink", 0.7)} strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="40" cy="40" r="19" fill={c("gold")} stroke={N} strokeWidth="2.2" />
      <text x="40" y="33" textAnchor="middle" fontSize="7" fontWeight="900" fill={N} fontFamily={SANS}>
        WEEK
      </text>
      <text x="40" y="52" textAnchor="middle" fontSize="20" fontWeight="900" fill={N} fontFamily={SANS}>
        3
      </text>
      <Sparkle x={170} y={34} r={6} />
    </g>
  );
}

/** Name the Quarterbacks — a quarterback mid-throw. */
function Quarterback() {
  return (
    <g>
      <path
        d="M128 18 Q154 2 180 14"
        fill="none"
        stroke={c("ice", 0.75)}
        strokeWidth="2.5"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <path
        d="M128 30 Q158 16 188 30"
        fill="none"
        stroke={c("ice", 0.45)}
        strokeWidth="2.5"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <Player x={92} y={134} s={1.05} pose="throw" jersey="ice" label="QB" />
      <Sparkle x={40} y={40} r={6} fill={c("gold")} />
      <Sparkle x={166} y={56} r={4} />
    </g>
  );
}

/** Thirty Burger — a burger with a 30 flag through the bun. */
function Burger() {
  const seeds: [number, number, number][] = [
    [76, 62, -25],
    [92, 55, -8],
    [110, 55, 10],
    [126, 62, 25],
    [84, 72, -12],
    [102, 69, 4],
    [118, 73, 18],
  ];
  return (
    <g>
      <Shadow y={132} rx={56} />
      <path d="M50 112 H150 Q150 128 134 128 H66 Q50 128 50 112 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <rect x="46" y="96" width="108" height="18" rx="9" fill={N} stroke={c("ink-muted", 0.7)} strokeWidth="1.8" />
      <path
        d="M62 105 H74 M86 105 H98 M110 105 H122 M134 105 H142"
        stroke={c("ink-muted", 0.45)}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M48 92 H152 L148 99 H134 L127 109 L120 99 H92 L85 107 L78 99 H54 Z"
        fill={c("gold")}
        stroke={N}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M44 90 Q52 81 60 90 T76 90 T92 90 T108 90 T124 90 T140 90 T156 90 L152 96 H48 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M48 88 Q48 44 100 42 Q152 44 152 88 Z" fill={c("gold")} stroke={N} strokeWidth="2" />
      <path d="M58 82 Q60 56 94 50" fill="none" stroke={c("ink", 0.45)} strokeWidth="3" strokeLinecap="round" />
      {seeds.map(([x, y, a]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx="3.2"
          ry="1.7"
          fill={c("ink")}
          transform={`rotate(${a} ${x} ${y})`}
        />
      ))}
      <path d="M100 46 V16" stroke={c("ink-soft")} strokeWidth="2" strokeLinecap="round" />
      <path d="M100 16 H132 L125 24 L132 32 H100 Z" fill={c("turf")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <text x="113" y="28.5" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={SANS}>
        30
      </text>
    </g>
  );
}

/** Games Actually Played — a calendar of played weeks and missed ones. */
function Calendar() {
  const cells = ["y", "y", "y", "n", "y", "y", "n", "y", "y", "y", "y", "n"];
  return (
    <g>
      <Shadow y={132} rx={52} />
      <rect x="52" y="28" width="96" height="98" rx="10" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <path d="M52 52 V38 Q52 28 62 28 H138 Q148 28 148 38 V52 Z" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text
        x="100"
        y="45"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fill={N}
        fontFamily={SANS}
        letterSpacing="2"
      >
        GAMES
      </text>
      {[72, 100, 128].map((x) => (
        <rect key={x} x={x - 3} y="20" width="6" height="16" rx="3" fill={c("ink-muted")} stroke={N} strokeWidth="1.5" />
      ))}
      {cells.map((s, i) => {
        const x = 67 + (i % 4) * 22;
        const y = 67 + Math.floor(i / 4) * 21;
        return (
          <g key={i}>
            <rect
              x={x - 9}
              y={y - 9}
              width="18"
              height="18"
              rx="4"
              fill={s === "y" ? c("turf", 0.18) : c("gold", 0.22)}
              stroke={c("night", 0.35)}
              strokeWidth="1"
            />
            {s === "y" ? (
              <path
                d={`M${x - 5} ${y} L${x - 1.5} ${y + 4} L${x + 5.5} ${y - 4}`}
                fill="none"
                stroke={c("turf-dim")}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d={`M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`}
                stroke={c("gold-dim")}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Rough Afternoon — a storm cloud with a lightning bolt. */
function Storm() {
  const drops: [number, number][] = [
    [66, 84],
    [76, 102],
    [60, 112],
    [140, 84],
    [134, 104],
    [150, 110],
  ];
  return (
    <g>
      <Shadow y={134} rx={40} />
      <path
        d="M54 72 Q50 50 74 48 Q82 28 106 32 Q128 26 138 48 Q160 48 156 72 Z"
        fill={c("ink-muted")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M62 66 Q62 54 78 54" fill="none" stroke={c("ink", 0.5)} strokeWidth="3" strokeLinecap="round" />
      {drops.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} l-4 11`} stroke={c("ice")} strokeWidth="3" strokeLinecap="round" />
      ))}
      <path
        d="M108 70 L94 98 H107 L98 126 L128 90 H112 L121 70 Z"
        fill={c("gold")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Who's On My Team — a jersey on a hanger. */
function Jersey() {
  return (
    <g>
      <Shadow y={134} rx={46} />
      <path
        d="M100 30 Q100 14 108 14 Q115 14 115 21 Q115 27 104 30"
        fill="none"
        stroke={c("ink-muted")}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M100 30 L62 44 H138 Z" fill="none" stroke={c("ink-muted")} strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M72 40 L55 48 L44 74 L61 81 L66 70 V126 H134 V70 L139 81 L156 74 L145 48 L128 40 Q116 51 100 51 Q84 51 72 40 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M86 42 Q100 56 114 42" fill="none" stroke={N} strokeWidth="3" />
      <path d="M49 64 L63 69 M151 64 L137 69" stroke={c("ink")} strokeWidth="3.5" strokeLinecap="round" />
      <text
        x="100"
        y="72"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fill={N}
        fontFamily={SANS}
        letterSpacing="2"
      >
        MY TEAM
      </text>
      <text x="100" y="112" textAnchor="middle" fontSize="34" fontWeight="900" fill={N} fontFamily={SANS}>
        WR1
      </text>
      <Sparkle x={162} y={30} r={6} fill={c("gold")} />
    </g>
  );
}

/** Waiver Risers — a rocket taking off from a rising line. */
function Rocket() {
  return (
    <g>
      <path
        d="M26 128 L64 106 L90 114 L128 76"
        fill="none"
        stroke={c("turf")}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="rotate(40 140 58)">
        <path d="M131 86 Q140 116 149 86 Z" fill={c("gold")} />
        <path d="M135 86 Q140 102 145 86 Z" fill={c("ink")} />
        <path d="M126 70 L113 92 L127 87 Z" fill={c("turf")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M154 70 L167 92 L153 87 Z" fill={c("turf")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
        <path
          d="M140 16 Q157 34 155 88 H125 Q123 34 140 16 Z"
          fill={c("ink-soft")}
          stroke={N}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M130 34 Q140 28 150 34" fill="none" stroke={c("ice")} strokeWidth="4" strokeLinecap="round" />
        <circle cx="140" cy="54" r="8.5" fill={c("ice")} stroke={N} strokeWidth="2" />
        <circle cx="137" cy="51" r="2.5" fill={c("ink")} />
      </g>
      <circle cx="46" cy="44" r="17" fill={c("turf")} stroke={N} strokeWidth="2" />
      <path
        d="M46 54 V35 M38 43 L46 35 L54 43"
        fill="none"
        stroke={N}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Sparkle x={88} y={36} r={5} />
    </g>
  );
}

/** The Slate — a chalkboard with the week's plays on it. */
function Chalkboard() {
  const xs: [number, number][] = [
    [76, 62],
    [98, 62],
  ];
  return (
    <g>
      <Shadow y={136} rx={58} />
      <path d="M62 118 L52 136 M138 118 L148 136" stroke={c("gold-dim")} strokeWidth="4.5" strokeLinecap="round" />
      <rect x="34" y="22" width="132" height="98" rx="7" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <rect x="42" y="30" width="116" height="82" rx="3" fill={N} />
      <rect x="42" y="30" width="116" height="82" rx="3" fill={c("turf-dim", 0.28)} />
      <text x="50" y="46" fontSize="9" fontWeight="800" fill={c("ink", 0.85)} fontFamily={MONO}>
        WK 1–18
      </text>
      {[66, 86, 106].map((x) => (
        <circle key={x} cx={x} cy="92" r="6.5" fill="none" stroke={c("ink", 0.9)} strokeWidth="2.2" />
      ))}
      {xs.map(([x, y]) => (
        <path
          key={x}
          d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`}
          stroke={c("gold")}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M106 84 Q120 60 146 56"
        fill="none"
        stroke={c("ink", 0.85)}
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <path
        d="M140 50 L147 56 L139 61"
        fill="none"
        stroke={c("ink", 0.85)}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="38" y="116" width="124" height="6" rx="2" fill={c("gold-dim")} stroke={N} strokeWidth="1.5" />
      <rect x="122" y="111.5" width="16" height="4.5" rx="2" fill={c("ink")} />
    </g>
  );
}

/** Indoor Football — a domed stadium with the rain kept outside. */
function Dome() {
  const rain: [number, number][] = [
    [16, 34],
    [24, 58],
    [14, 80],
    [176, 28],
    [186, 52],
    [178, 76],
  ];
  return (
    <g>
      <Shadow y={130} rx={70} />
      {rain.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} l-3 10`} stroke={c("ice", 0.75)} strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <path d="M30 118 H170 L162 128 H38 Z" fill={c("turf")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d="M62 118 L58 128 M81 118 L79 128 M100 118 V128 M119 118 L121 128 M138 118 L142 128"
        stroke={c("ink", 0.55)}
        strokeWidth="1.3"
      />
      <path d="M28 118 Q28 42 100 38 Q172 42 172 118 Z" fill={c("ice", 0.22)} stroke={c("ice")} strokeWidth="3" />
      <path
        d="M100 38 V118 M64 46 Q52 80 55 118 M136 46 Q148 80 145 118 M40 70 Q100 58 160 70 M31 96 Q100 84 169 96"
        fill="none"
        stroke={c("ice")}
        strokeWidth="1.6"
        opacity="0.8"
      />
      <path d="M44 92 Q46 58 82 47" fill="none" stroke={c("ink", 0.65)} strokeWidth="4" strokeLinecap="round" />
      <Sparkle x={100} y={26} r={5} fill={c("gold")} />
    </g>
  );
}

/** Tight End Premium — a tight end hauling one in, and a gem. */
function TightEnd() {
  return (
    <g>
      <Player x={88} y={134} pose="catch" jersey="gold" label="TE" />
      <path
        d="M136 42 H164 L174 54 L150 84 L126 54 Z"
        fill={c("ice")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M126 54 H174 M142 42 L150 54 L158 42 M136 42 L144 54 M164 42 L156 54 M144 54 L150 84 L156 54"
        fill="none"
        stroke={c("ink", 0.65)}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <Sparkle x={176} y={30} r={6} />
      <Sparkle x={122} y={34} r={4} fill={c("gold")} />
    </g>
  );
}

/** Points Per Game — a PPG stat card. */
function PpgCard() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <rect x="44" y="26" width="108" height="100" rx="12" fill={c("panel")} stroke={c("gold")} strokeWidth="2.5" />
      <path d="M44 52 V38 Q44 26 56 26 H140 Q152 26 152 38 V52 Z" fill={c("gold")} />
      <text
        x="98"
        y="45"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fill={N}
        fontFamily={SANS}
        letterSpacing="4"
      >
        PPG
      </text>
      <text x="98" y="92" textAnchor="middle" fontSize="34" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        25.3
      </text>
      <text
        x="98"
        y="113"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="800"
        fill={c("gold")}
        fontFamily={MONO}
        letterSpacing="1"
      >
        PTS ÷ GAMES
      </text>
      <Football x={156} y={116} rx={17} rot={-28} />
      <Sparkle x={36} y={36} r={5} fill={c("gold")} />
    </g>
  );
}

/** Boom Games — a comic-book explosion. */
function Boom() {
  return (
    <g>
      <path d={starPath(100, 76, 12, 64, 44, -90)} fill={c("turf")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d={starPath(100, 76, 12, 50, 34, -75)} fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <text
        x="100"
        y="86"
        textAnchor="middle"
        fontSize="27"
        fontWeight="900"
        fill={N}
        fontFamily={SANS}
        transform="rotate(-8 100 76)"
      >
        BOOM
      </text>
      <Football x={170} y={30} rx={12} rot={35} />
      <Sparkle x={28} y={30} r={6} />
      <Sparkle x={176} y={120} r={5} fill={c("gold")} />
    </g>
  );
}

/** Floor and Ceiling — a ball bouncing between the two. */
function FloorCeiling() {
  return (
    <g>
      <rect x="36" y="22" width="128" height="10" rx="3" fill={c("ice")} stroke={N} strokeWidth="1.6" />
      <path
        d="M44 32 l6 -10 M60 32 l6 -10 M76 32 l6 -10 M92 32 l6 -10 M108 32 l6 -10 M124 32 l6 -10 M140 32 l6 -10"
        stroke={N}
        strokeWidth="1.2"
        opacity="0.4"
      />
      <rect x="36" y="118" width="128" height="10" rx="3" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <text
        x="100"
        y="17"
        textAnchor="middle"
        fontSize="8"
        fontWeight="900"
        fill={c("ice")}
        fontFamily={MONO}
        letterSpacing="2"
      >
        CEILING
      </text>
      <text
        x="100"
        y="141"
        textAnchor="middle"
        fontSize="8"
        fontWeight="900"
        fill={c("turf")}
        fontFamily={MONO}
        letterSpacing="2"
      >
        FLOOR
      </text>
      <path
        d="M46 116 Q72 -34 98 116 Q124 -34 150 116"
        fill="none"
        stroke={c("ink", 0.55)}
        strokeWidth="2"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <Football x={72} y={42} rx={14} />
      <Football x={150} y={108} rx={11} rot={30} />
      <path
        d="M22 70 V44 M15 51 L22 44 L29 51"
        fill="none"
        stroke={c("ice")}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M178 76 V102 M171 95 L178 102 L185 95"
        fill="none"
        stroke={c("turf")}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Year Over Year — three seasons of bars, climbing. */
function Years() {
  const bars = [
    { x: 48, h: 38, y: "'22", fill: c("ice", 0.55) },
    { x: 84, h: 58, y: "'23", fill: c("ice") },
    { x: 120, h: 82, y: "'24", fill: c("turf") },
  ];
  return (
    <g>
      <Shadow y={124} rx={64} />
      {bars.map((b) => (
        <g key={b.y}>
          <rect x={b.x} y={120 - b.h} width="30" height={b.h} rx="5" fill={b.fill} stroke={N} strokeWidth="1.8" />
          <text
            x={b.x + 15}
            y="138"
            textAnchor="middle"
            fontSize="10"
            fontWeight="900"
            fill={c("ink-soft")}
            fontFamily={MONO}
          >
            {b.y}
          </text>
        </g>
      ))}
      <path d="M52 70 L96 50 L146 24" fill="none" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M134 22 L148 23 L142 36" fill="none" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="22" y="22" width="30" height="28" rx="4" fill={c("ink-soft")} stroke={N} strokeWidth="1.6" />
      <path d="M22 32 V26 Q22 22 26 22 H48 Q52 22 52 26 V32 Z" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <text x="37" y="45" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        YoY
      </text>
      <Sparkle x={172} y={50} r={6} />
    </g>
  );
}

/** League Standings — a 1-2-3 podium with the trophy on top. */
function Podium() {
  return (
    <g>
      <Shadow y={132} rx={66} />
      <rect x="44" y="86" width="38" height="44" rx="3" fill={c("ice")} stroke={N} strokeWidth="2" />
      <rect x="81" y="64" width="38" height="66" rx="3" fill={c("gold")} stroke={N} strokeWidth="2" />
      <rect x="118" y="98" width="38" height="32" rx="3" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text x="63" y="114" textAnchor="middle" fontSize="20" fontWeight="900" fill={N} fontFamily={SANS}>
        2
      </text>
      <text x="100" y="99" textAnchor="middle" fontSize="22" fontWeight="900" fill={N} fontFamily={SANS}>
        1
      </text>
      <text x="137" y="122" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
        3
      </text>
      <path d="M89 28 H111 V38 Q111 52 100 52 Q89 52 89 38 Z" fill={c("gold")} stroke={N} strokeWidth="2" />
      <path
        d="M89 32 H83 Q83 43 91 45 M111 32 H117 Q117 43 109 45"
        fill="none"
        stroke={c("gold")}
        strokeWidth="2.6"
      />
      <rect x="96" y="52" width="8" height="6" fill={c("gold-dim")} />
      <rect x="90" y="57" width="20" height="6" rx="2" fill={c("gold-dim")} stroke={N} strokeWidth="1.5" />
      <Sparkle x={126} y={30} r={6} />
      <Sparkle x={70} y={46} r={4} fill={c("gold")} />
    </g>
  );
}

/** Thursday Night — a crescent moon over a lit field. */
function NightGame() {
  const bulbs: [number, number][] = [150, 158, 166].flatMap((x) =>
    [50, 57].map((y) => [x, y] as [number, number]),
  );
  return (
    <g>
      <defs>
        <mask id="qa-moon-mask">
          <rect width={VB.w} height={VB.h} fill="white" />
          <circle cx="66" cy="32" r="17" fill="black" />
        </mask>
      </defs>
      <circle cx="54" cy="40" r="20" fill={c("gold")} mask="url(#qa-moon-mask)" />
      <Sparkle x={98} y={22} r={4} />
      <Sparkle x={124} y={40} r={3} />
      <Sparkle x={28} y={78} r={3} />
      <path d="M150 58 L96 124 L140 124 Z" fill={c("ink", 0.12)} />
      <rect x="156" y="62" width="5" height="64" fill={c("ink-muted")} />
      <rect x="144" y="44" width="30" height="18" rx="3" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      {bulbs.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill={c("gold")} />
      ))}
      <path d="M20 124 H180 L172 132 H28 Z" fill={c("turf")} stroke={N} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="44" y="86" width="52" height="24" rx="7" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text
        x="70"
        y="103"
        textAnchor="middle"
        fontSize="13"
        fontWeight="900"
        fill={N}
        fontFamily={SANS}
        letterSpacing="2"
      >
        THU
      </text>
      <Football x={114} y={116} rx={11} rot={-10} />
    </g>
  );
}

/** Weather Report — sun, cloud, rain and a thermometer. */
function Weather() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    return `M${r1(62 + 24 * Math.cos(a))} ${r1(46 + 24 * Math.sin(a))} L${r1(62 + 32 * Math.cos(a))} ${r1(46 + 32 * Math.sin(a))}`;
  });
  const drops: [number, number][] = [
    [96, 106],
    [114, 112],
    [132, 106],
    [150, 112],
  ];
  return (
    <g>
      <Shadow y={134} rx={52} />
      <g stroke={c("gold")} strokeWidth="3.5" strokeLinecap="round">
        {rays.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx="62" cy="46" r="18" fill={c("gold")} stroke={N} strokeWidth="2" />
      <path
        d="M78 96 Q74 76 94 74 Q100 58 120 62 Q138 56 146 74 Q164 74 160 96 Z"
        fill={c("ink-soft")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {drops.map(([x, y]) => (
        <path key={x} d={`M${x} ${y} l-3 10`} stroke={c("ice")} strokeWidth="3" strokeLinecap="round" />
      ))}
      <rect x="30" y="80" width="12" height="40" rx="6" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" />
      <rect x="33.5" y="92" width="5" height="30" rx="2.5" fill={c("gold")} />
      <circle cx="36" cy="124" r="9" fill={c("gold")} stroke={N} strokeWidth="1.8" />
    </g>
  );
}

/** The Untouchables — a shield that everything bounces off. */
function Shield() {
  const hits: [number, number][] = [
    [50, 64],
    [50, 82],
    [52, 98],
  ];
  return (
    <g>
      <Shadow y={134} rx={42} />
      <path d="M22 58 L46 64 M20 84 L46 82 M26 106 L48 98" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      {hits.map(([x, y]) => (
        <Sparkle key={`${x}-${y}`} x={x} y={y} r={4} fill={c("gold")} />
      ))}
      <path
        d="M100 20 L146 34 V72 Q146 110 100 128 Q54 110 54 72 V34 Z"
        fill={c("ice")}
        stroke={N}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M100 30 L136 41 V72 Q136 102 100 117 Z" fill={c("ice-dim")} />
      <path d="M64 42 L100 31" stroke={c("ink", 0.6)} strokeWidth="3" strokeLinecap="round" />
      <Football x={100} y={76} rx={24} rot={-30} />
      <Sparkle x={162} y={30} r={6} />
    </g>
  );
}

/** Top of Each Week — a crown on a football. */
function Crown() {
  const tips: [number, number][] = [
    [54, 42],
    [100, 28],
    [146, 42],
  ];
  return (
    <g>
      <Shadow y={132} rx={44} />
      <Football x={100} y={112} rx={32} />
      <path
        d="M60 86 L54 42 L79 62 L100 28 L121 62 L146 42 L140 86 Z"
        fill={c("gold")}
        stroke={N}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M66 52 L71 78" stroke={c("ink", 0.5)} strokeWidth="3" strokeLinecap="round" />
      <rect x="58" y="82" width="84" height="11" rx="3" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <circle cx="80" cy="73" r="5" fill={c("turf")} stroke={N} strokeWidth="1.5" />
      <circle cx="100" cy="68" r="6.5" fill={c("ice")} stroke={N} strokeWidth="1.5" />
      <circle cx="120" cy="73" r="5" fill={c("turf")} stroke={N} strokeWidth="1.5" />
      {tips.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="4.5" fill={c("ink")} stroke={N} strokeWidth="1.5" />
      ))}
      <Sparkle x={164} y={30} r={6} />
      <Sparkle x={34} y={62} r={4} fill={c("gold")} />
    </g>
  );
}

/** Who Improved — steps up, with the ball on the top one. */
function Stairs() {
  return (
    <g>
      <Shadow y={130} rx={66} />
      <path
        d="M34 128 H70 V104 H98 V80 H126 V56 H166 V128 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M72 104 H96 M100 80 H124 M128 56 H164"
        stroke={c("ink", 0.5)}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M44 110 L78 88 L106 66 L124 52"
        fill="none"
        stroke={c("gold")}
        strokeWidth="4"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      <path d="M112 50 L125 51 L120 63" fill="none" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <Football x={148} y={45} rx={15} rot={-20} />
      <rect x="22" y="26" width="48" height="22" rx="7" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="46" y="42" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={MONO}>
        +7.3
      </text>
    </g>
  );
}

/** Opponent Unmasked — a helmet with a mask lifting off it. */
function Mask() {
  return (
    <g>
      <Shadow y={128} rx={52} />
      <path
        d="M58 112 Q42 70 76 50 Q110 34 136 58 Q148 72 146 94 L128 98 L128 112 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M66 60 Q100 42 134 60" fill="none" stroke={c("ink", 0.6)} strokeWidth="4" strokeLinecap="round" />
      <circle cx="96" cy="86" r="5" fill={N} opacity="0.6" />
      <path
        d="M128 92 H160 M128 104 H156 M150 86 V110"
        fill="none"
        stroke={c("ink-soft")}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <g transform="rotate(-14 142 34)">
        <path
          d="M108 30 Q124 20 142 28 Q160 20 176 30 Q178 46 164 48 Q150 48 142 40 Q134 48 120 48 Q106 46 108 30 Z"
          fill={c("gold")}
          stroke={N}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <ellipse cx="125" cy="36" rx="7" ry="4.5" fill={N} />
        <ellipse cx="159" cy="36" rx="7" ry="4.5" fill={N} />
      </g>
      <path d="M112 54 L118 46 M124 56 L130 48" stroke={c("ink", 0.6)} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/** Rank Your Position — gold, silver and bronze medals. */
function Medals() {
  const medals = [
    { x: 56, y: 94, r: 18, fill: c("ink-soft"), ribbon: c("ice"), n: "2" },
    { x: 144, y: 98, r: 17, fill: c("gold-dim"), ribbon: c("turf"), n: "3" },
    { x: 100, y: 82, r: 23, fill: c("gold"), ribbon: c("ice"), n: "1" },
  ];
  return (
    <g>
      <Shadow y={134} rx={60} />
      {medals.map((m) => {
        // Two strips crossing into a V, the way a neck ribbon hangs. A single
        // tall wedge read as an exclamation mark at thumbnail size.
        const bt = m.y - m.r + 4;
        const top = bt - 34;
        return (
        <g key={m.n}>
          <path
            d={`M${m.x - 3} ${bt} L${m.x - 20} ${top} H${m.x - 9} L${m.x + 4} ${bt} Z`}
            fill={m.ribbon}
            stroke={N}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d={`M${m.x + 3} ${bt} L${m.x + 20} ${top} H${m.x + 9} L${m.x - 4} ${bt} Z`}
            fill={m.ribbon}
            stroke={N}
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <circle cx={m.x} cy={m.y} r={m.r} fill={m.fill} stroke={N} strokeWidth="2.4" />
          <circle cx={m.x} cy={m.y} r={m.r - 6} fill="none" stroke={N} strokeWidth="1.4" opacity="0.35" />
          <text
            x={m.x}
            y={r1(m.y + m.r * 0.36)}
            textAnchor="middle"
            fontSize={m.r}
            fontWeight="900"
            fill={N}
            fontFamily={SANS}
          >
            {m.n}
          </text>
        </g>
        );
      })}
      <Sparkle x={126} y={52} r={5} />
    </g>
  );
}

/** Rolling Form — a smoothed line riding over a noisy wave. */
function Wave() {
  const bars = [30, 44, 26, 52, 40, 60, 48];
  return (
    <g>
      {bars.map((h, i) => (
        <rect key={i} x={24 + i * 22} y={122 - h} width="14" height={h} rx="3" fill={c("ice", 0.28)} />
      ))}
      <path d="M16 104 C40 70 64 70 84 90 S124 114 146 76 S176 52 188 64 V134 H16 Z" fill={c("ice", 0.3)} />
      <path
        d="M16 104 C40 70 64 70 84 90 S124 114 146 76 S176 52 188 64"
        fill="none"
        stroke={c("ice")}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M16 96 C50 84 80 88 104 86 S154 72 186 66"
        fill="none"
        stroke={c("gold")}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Football x={148} y={64} rx={15} rot={-22} />
      <Sparkle x={40} y={34} r={5} />
    </g>
  );
}

/** Back to Back — two flames, side by side. */
function DoubleFlame() {
  return (
    <g>
      <Shadow y={128} rx={58} />
      <Flame x={72} y={124} s={1.3} outer={c("gold")} inner={c("ink")} />
      <Flame x={130} y={124} s={1.3} outer={c("turf")} inner={c("gold")} />
      <circle cx="100" cy="30" r="16" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="100" y="36" textAnchor="middle" fontSize="15" fontWeight="900" fill={N} fontFamily={SANS}>
        ×2
      </text>
      <Sparkle x={34} y={40} r={5} />
      <Sparkle x={168} y={44} r={5} fill={c("gold")} />
    </g>
  );
}

/** Share of the Load — a pie with one slice pulled out. */
function Pie() {
  const cx = 94;
  const cy = 80;
  const r = 46;
  // The ice slice runs 306°–360°, so it pulls out along 333°.
  const pull = ((333 - 90) * Math.PI) / 180;
  const ox = r1(9 * Math.cos(pull));
  const oy = r1(9 * Math.sin(pull));
  return (
    <g>
      <Shadow y={134} rx={52} />
      <path d={slicePath(cx, cy, r, 0, 198)} fill={c("turf")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d={slicePath(cx, cy, r, 198, 306)} fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <g transform={`translate(${ox} ${oy})`}>
        <path d={slicePath(cx, cy, r, 306, 360)} fill={c("ice")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <text x="114" y="96" textAnchor="middle" fontSize="15" fontWeight="900" fill={N} fontFamily={SANS}>
        55%
      </text>
      <Football x={164} y={112} rx={16} rot={-25} />
      <Sparkle x={160} y={30} r={5} />
    </g>
  );
}

/** Best of Each Season — a highlight reel. */
function Film() {
  const frames = [
    { x: 22, f: c("turf") },
    { x: 78, f: c("ice") },
    { x: 134, f: c("gold") },
  ];
  return (
    <g>
      <g transform="rotate(-8 100 76)">
        <rect x="14" y="44" width="172" height="62" rx="4" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <rect x={20 + i * 15.5} y="48" width="7" height="5" rx="1.2" fill={N} />
            <rect x={20 + i * 15.5} y="97" width="7" height="5" rx="1.2" fill={N} />
          </g>
        ))}
        {frames.map((fr) => (
          <rect key={fr.x} x={fr.x} y="57" width="46" height="36" rx="3" fill={fr.f} stroke={N} strokeWidth="1.6" />
        ))}
        <Football x={45} y={75} rx={13} rot={-20} />
        <path d={starPath(101, 76, 5, 12, 5, -90)} fill={c("ink")} stroke={N} strokeWidth="1.2" strokeLinejoin="round" />
        <text x="157" y="81" textAnchor="middle" fontSize="16" fontWeight="900" fill={N} fontFamily={SANS}>
          #1
        </text>
      </g>
      <circle cx="150" cy="120" r="16" fill={c("gold")} stroke={N} strokeWidth="2" />
      <path d="M145 112 L158 120 L145 128 Z" fill={N} />
      <text
        x="30"
        y="138"
        fontSize="9"
        fontWeight="900"
        fill={c("gold")}
        fontFamily={MONO}
        letterSpacing="2"
      >
        HIGHLIGHTS
      </text>
    </g>
  );
}

/** The Drop-Off — a ball going off the edge of a cliff. */
function Cliff() {
  const bars = [
    { x: 24, h: 34 },
    { x: 48, h: 31 },
    { x: 72, h: 28 },
  ];
  return (
    <g>
      <rect x="10" y="128" width="180" height="8" rx="3" fill={c("turf-dim", 0.5)} />
      <path
        d="M12 66 H112 L120 80 L113 96 L122 112 L116 132 H12 Z"
        fill={c("ink-muted")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 66 H112" stroke={c("turf")} strokeWidth="6" strokeLinecap="round" />
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={63 - b.h} width="16" height={b.h} rx="3" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      ))}
      <rect x="150" y="116" width="16" height="12" rx="3" fill={c("ice")} stroke={N} strokeWidth="1.6" />
      <path
        d="M114 58 Q146 58 156 106"
        fill="none"
        stroke={c("ink", 0.6)}
        strokeWidth="2"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <path d="M150 99 L156 108 L162 99" fill="none" stroke={c("ink", 0.6)} strokeWidth="2" strokeLinecap="round" />
      <Football x={134} y={70} rx={13} rot={50} />
      <path d="M118 48 l6 -6 M127 52 l8 -4" stroke={c("ink", 0.5)} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** The Quiet Weeks — a sleeping moon over weeks with no stat line. */
function Zzz() {
  const cells = [1, 0, 0, 0, 0, 0, 0, 1];
  return (
    <g>
      <defs>
        <mask id="qa-zmoon-mask">
          <rect width={VB.w} height={VB.h} fill="white" />
          <circle cx="46" cy="30" r="15" fill="black" />
        </mask>
      </defs>
      <circle cx="36" cy="38" r="18" fill={c("ice")} mask="url(#qa-zmoon-mask)" />
      <text x="116" y="52" fontSize="28" fontWeight="900" fill={c("ink")} fontFamily={SANS}>
        Z
      </text>
      <text x="144" y="36" fontSize="19" fontWeight="900" fill={c("ink", 0.8)} fontFamily={SANS}>
        z
      </text>
      <text x="164" y="22" fontSize="13" fontWeight="900" fill={c("ink", 0.6)} fontFamily={SANS}>
        z
      </text>
      {cells.map((on, i) => {
        const x = 16 + i * 22;
        return on ? (
          <rect key={i} x={x} y="84" width="18" height="26" rx="4" fill={c("turf")} stroke={N} strokeWidth="1.6" />
        ) : (
          <rect
            key={i}
            x={x}
            y="84"
            width="18"
            height="26"
            rx="4"
            fill="none"
            stroke={c("ink-muted")}
            strokeWidth="1.6"
            strokeDasharray="3 3"
          />
        );
      })}
      <text x="25" y="126" textAnchor="middle" fontSize="9" fontWeight="800" fill={c("ink-muted")} fontFamily={MONO}>
        1
      </text>
      <text x="179" y="126" textAnchor="middle" fontSize="9" fontWeight="800" fill={c("ink-muted")} fontFamily={MONO}>
        8
      </text>
      <text
        x="102"
        y="126"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fill={c("ink-muted")}
        fontFamily={MONO}
        letterSpacing="2"
      >
        NO STAT LINE
      </text>
    </g>
  );
}

/** Streak Finder — a magnifying glass over a run of hot weeks. */
function Magnifier() {
  const heat = [0.25, 0.9, 1, 0.95, 0.85, 0.3, 0.9];
  return (
    <g>
      {heat.map((o, i) => (
        <rect
          key={i}
          x={20 + i * 23}
          y="96"
          width="19"
          height="19"
          rx="4"
          fill={c("gold")}
          opacity={r1(0.15 + o * 0.8)}
          stroke={N}
          strokeWidth="1.2"
        />
      ))}
      <path d="M128 90 L162 124" stroke={N} strokeWidth="13" strokeLinecap="round" />
      <path d="M128 90 L162 124" stroke={c("gold-dim")} strokeWidth="9" strokeLinecap="round" />
      <circle cx="104" cy="64" r="34" fill={c("ice", 0.16)} stroke={N} strokeWidth="10" />
      <circle cx="104" cy="64" r="34" fill="none" stroke={c("ice")} strokeWidth="6.5" />
      <Flame x={104} y={88} s={0.72} outer={c("gold")} inner={c("ink")} />
      <path d="M82 46 Q88 38 98 36" fill="none" stroke={c("ink", 0.7)} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Name the Leader — a #1 foam finger. */
function FoamFinger() {
  return (
    <g>
      <Shadow y={136} rx={40} />
      <rect x="86" y="14" width="28" height="68" rx="14" fill={c("gold")} stroke={N} strokeWidth="2.5" />
      <path d="M92 22 V56" stroke={c("ink", 0.55)} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse
        cx="64"
        cy="92"
        rx="11"
        ry="18"
        fill={c("gold")}
        stroke={N}
        strokeWidth="2.5"
        transform="rotate(-24 64 92)"
      />
      <rect x="64" y="66" width="74" height="60" rx="18" fill={c("gold")} stroke={N} strokeWidth="2.5" />
      <path d="M72 80 H130" stroke={N} strokeWidth="1.6" opacity="0.35" />
      <text x="101" y="113" textAnchor="middle" fontSize="28" fontWeight="900" fill={N} fontFamily={SANS}>
        #1
      </text>
      <rect x="72" y="122" width="58" height="12" rx="3" fill={c("turf")} stroke={N} strokeWidth="2" />
      <Sparkle x={142} y={30} r={7} />
      <Sparkle x={52} y={40} r={5} fill={c("gold")} />
      <Sparkle x={160} y={62} r={4} fill={c("ice")} />
    </g>
  );
}

/** Count the Room — a tally counter and some tally marks. */
function Clicker() {
  return (
    <g>
      <Shadow y={128} rx={46} />
      <rect x="90" y="28" width="20" height="18" rx="4" fill={c("turf")} stroke={N} strokeWidth="2" />
      <rect x="56" y="42" width="88" height="80" rx="30" fill={c("ink-soft")} stroke={N} strokeWidth="2.5" />
      <rect x="70" y="62" width="60" height="28" rx="5" fill={N} />
      <text
        x="100"
        y="83"
        textAnchor="middle"
        fontSize="20"
        fontWeight="900"
        fill={c("gold")}
        fontFamily={MONO}
        letterSpacing="2"
      >
        020
      </text>
      <circle cx="100" cy="106" r="7" fill={c("ink-muted")} stroke={N} strokeWidth="1.6" />
      <circle cx="152" cy="104" r="9" fill="none" stroke={c("ink-muted")} strokeWidth="4" />
      <path
        d="M22 108 V132 M29 108 V132 M36 108 V132 M43 108 V132 M18 128 L48 110"
        stroke={c("turf")}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Sparkle x={152} y={36} r={5} />
    </g>
  );
}

/** Per Game, Not Per Season — a football over a game ticket. */
function Ticket() {
  return (
    <g>
      <Shadow y={132} rx={48} />
      <Football x={100} y={36} rx={24} />
      <rect x="58" y="62" width="84" height="7" rx="3.5" fill={c("ink")} stroke={N} strokeWidth="1.4" />
      <path
        d="M62 80 H138 Q142 80 142 84 V95 A6 6 0 0 0 142 107 V118 Q142 122 138 122 H62 Q58 122 58 118 V107 A6 6 0 0 0 58 95 V84 Q58 80 62 80 Z"
        fill={c("ice")}
        stroke={N}
        strokeWidth="2"
      />
      <path d="M120 84 V118" stroke={N} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <text
        x="89"
        y="106"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fill={N}
        fontFamily={SANS}
        letterSpacing="2"
      >
        GAME
      </text>
      <text x="131" y="105" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
        1
      </text>
      <Sparkle x={160} y={30} r={5} fill={c("gold")} />
    </g>
  );
}

/** The Three Hundred Club — a neon 300 over a velvet rope. */
function VelvetRope() {
  return (
    <g>
      <Shadow y={132} rx={62} />
      <text
        x="100"
        y="58"
        textAnchor="middle"
        fontSize="44"
        fontWeight="900"
        fill="none"
        stroke={c("ice", 0.35)}
        strokeWidth="9"
        fontFamily={SANS}
      >
        300
      </text>
      <text
        x="100"
        y="58"
        textAnchor="middle"
        fontSize="44"
        fontWeight="900"
        fill="none"
        stroke={c("ice")}
        strokeWidth="2.8"
        fontFamily={SANS}
      >
        300
      </text>
      <text
        x="100"
        y="76"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fill={c("gold")}
        fontFamily={MONO}
        letterSpacing="6"
      >
        CLUB
      </text>
      <path d="M50 96 Q100 128 150 96" fill="none" stroke={c("ice-dim")} strokeWidth="7" strokeLinecap="round" />
      <path
        d="M52 94 Q100 124 148 94"
        fill="none"
        stroke={c("ink", 0.3)}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {[48, 152].map((x) => (
        <g key={x}>
          <rect x={x - 3.5} y="90" width="7" height="38" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.5" />
          <circle cx={x} cy="88" r="6" fill={c("gold")} stroke={N} strokeWidth="1.5" />
          <ellipse cx={x} cy="129" rx="13" ry="4" fill={c("gold-dim")} stroke={N} strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

/** Which Position Scores — four bars, one per position, helmets on top. */
function Positions() {
  // Heights in proportion to the real 2024 averages: QB 351.8, RB 288.8,
  // WR 272.9, TE 202.2.
  const bars = [
    { x: 30, h: 70, l: "QB", f: c("gold") },
    { x: 68, h: 57, l: "RB", f: c("turf") },
    { x: 106, h: 54, l: "WR", f: c("ice") },
    { x: 144, h: 40, l: "TE", f: c("ink-muted") },
  ];
  return (
    <g>
      <Shadow y={122} rx={78} />
      {bars.map((b) => (
        <g key={b.l}>
          <rect x={b.x} y={118 - b.h} width="28" height={b.h} rx="5" fill={b.f} stroke={N} strokeWidth="1.8" />
          <MiniHelmet x={b.x + 13} y={118 - b.h - 13} fill={b.f} />
          <text
            x={b.x + 14}
            y="136"
            textAnchor="middle"
            fontSize="11"
            fontWeight="900"
            fill={c("ink-soft")}
            fontFamily={MONO}
          >
            {b.l}
          </text>
        </g>
      ))}
    </g>
  );
}

/** The Availability Tax — a first-aid kit and a tax receipt. */
function Medkit() {
  return (
    <g>
      <Shadow y={128} rx={60} />
      <path
        d="M124 36 H166 V114 L159 108 L152 114 L145 108 L138 114 L131 108 L124 114 Z"
        fill={c("ink")}
        stroke={N}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M132 50 H158 M132 60 H152" stroke={c("ink-muted")} strokeWidth="2.2" strokeLinecap="round" />
      <text x="146" y="94" textAnchor="middle" fontSize="24" fontWeight="900" fill={c("gold-dim")} fontFamily={SANS}>
        %
      </text>
      <path
        d="M72 58 V48 Q72 40 80 40 H100 Q108 40 108 48 V58"
        fill="none"
        stroke={c("ink-muted")}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="40" y="56" width="96" height="66" rx="11" fill={c("ink-soft")} stroke={N} strokeWidth="2.5" />
      <rect x="67" y="68" width="42" height="42" rx="6" fill={c("turf")} stroke={N} strokeWidth="1.8" />
      <path d="M88 76 V102 M75 89 H101" stroke={c("ink")} strokeWidth="7" strokeLinecap="round" />
      <path d="M48 64 H128" stroke={c("ink", 0.6)} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** Receivers Only / How Many Receivers — a receiver leaping for the ball. */
function Receiver() {
  return (
    <g>
      <path
        d="M16 56 Q44 6 80 20"
        fill="none"
        stroke={c("ink", 0.55)}
        strokeWidth="2.2"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <Player x={100} y={134} pose="catch" jersey="turf" label="WR" />
      <path
        d="M150 70 L168 64 M152 84 L172 82 M150 98 L166 102"
        stroke={c("turf")}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <Sparkle x={152} y={30} r={6} fill={c("gold")} />
    </g>
  );
}

/** Group and Summarise — a huddle, seen from above, around a Σ. */
function Huddle() {
  const tones = ["turf", "ice", "gold", "turf", "ice", "gold", "turf"];
  const helmets = tones.map((t, i) => {
    const a = (((i * 360) / tones.length - 90) * Math.PI) / 180;
    return {
      t,
      x: r1(100 + 44 * Math.cos(a)),
      y: r1(76 + 40 * Math.sin(a)),
      ix: r1(100 + 30 * Math.cos(a)),
      iy: r1(76 + 27 * Math.sin(a)),
    };
  });
  return (
    <g>
      <ellipse
        cx="100"
        cy="78"
        rx="64"
        ry="58"
        fill={c("turf", 0.12)}
        stroke={c("turf", 0.4)}
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      {helmets.map((h) => (
        <g key={`${h.x}-${h.y}`}>
          <circle cx={h.x} cy={h.y} r="13" fill={c(h.t)} stroke={N} strokeWidth="2" />
          <path d={`M${h.x} ${h.y} L${h.ix} ${h.iy}`} stroke={c("ink", 0.75)} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="100" cy="76" r="20" fill={c("panel")} stroke={c("gold")} strokeWidth="2.5" />
      <text x="100" y="86" textAnchor="middle" fontSize="28" fontWeight="900" fill={c("gold")} fontFamily={SANS}>
        Σ
      </text>
    </g>
  );
}

/** Highest on the Sheet — a peak with a MAX flag, drawn on a spreadsheet. */
function Peak() {
  const cols = ["A", "B", "C", "D", "E"];
  return (
    <g>
      <rect x="26" y="26" width="148" height="104" rx="6" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <path d="M26 42 V32 Q26 26 32 26 H168 Q174 26 174 32 V42 Z" fill={c("turf")} />
      {cols.map((l, i) => (
        <text
          key={l}
          x={52 + i * 28}
          y="38"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fill={N}
          fontFamily={MONO}
        >
          {l}
        </text>
      ))}
      {[66, 94, 122, 150].map((x) => (
        <path key={x} d={`M${x} 42 V130`} stroke={N} strokeWidth="1" opacity="0.2" />
      ))}
      {[58, 74, 90, 106, 122].map((y) => (
        <path key={y} d={`M26 ${y} H174`} stroke={N} strokeWidth="1" opacity="0.2" />
      ))}
      <path
        d="M34 128 L72 84 L90 100 L124 50 L166 128 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M114 64 L124 50 L134 64 L128 60 L124 66 L119 60 Z" fill={c("ink")} />
      <path d="M124 50 V10" stroke={N} strokeWidth="2" />
      <path d="M124 10 H150 L143 17 L150 24 H124 Z" fill={c("gold")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <text x="135.5" y="20" textAnchor="middle" fontSize="7" fontWeight="900" fill={N} fontFamily={MONO}>
        MAX
      </text>
    </g>
  );
}

/** One Manager's Haul — a sack of points. */
function MoneyBag() {
  const coins: [number, number][] = [
    [156, 124],
    [168, 114],
    [160, 104],
  ];
  return (
    <g>
      <Shadow y={132} rx={56} />
      <path
        d="M72 60 Q44 86 52 112 Q58 130 100 130 Q142 130 148 112 Q156 86 128 60 Z"
        fill={c("gold-dim")}
        stroke={N}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M62 92 Q60 108 70 118" fill="none" stroke={c("ink", 0.45)} strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M84 50 Q86 32 100 38 Q114 32 116 50"
        fill={c("gold-dim")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M76 60 Q100 68 124 60 L118 48 Q100 55 82 48 Z"
        fill={c("gold")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="98" r="17" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="100" y="102" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={SANS}>
        PTS
      </text>
      <Football x={40} y={120} rx={14} rot={22} />
      {coins.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="7" fill={c("gold")} stroke={N} strokeWidth="1.5" />
          <path d={`M${x} ${y - 3} V${y + 3}`} stroke={N} strokeWidth="1.5" opacity="0.5" />
        </g>
      ))}
      <Sparkle x={150} y={40} r={6} />
    </g>
  );
}

/** Look Somebody Up — a pair of binoculars. */
function Binoculars() {
  return (
    <g>
      <Shadow y={130} rx={56} />
      <rect x="60" y="30" width="26" height="16" rx="4" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" />
      <rect x="114" y="30" width="26" height="16" rx="4" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" />
      <rect x="48" y="42" width="50" height="76" rx="20" fill={c("ink-muted")} stroke={N} strokeWidth="2.2" />
      <rect x="102" y="42" width="50" height="76" rx="20" fill={c("ink-muted")} stroke={N} strokeWidth="2.2" />
      <rect x="88" y="58" width="24" height="22" rx="5" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" />
      {[73, 127].map((x) => (
        <g key={x}>
          <circle cx={x} cy="96" r="20" fill={c("ice")} stroke={N} strokeWidth="3" />
          <circle cx={x} cy="96" r="13" fill={c("ice-dim")} />
          <path
            d={`M${x - 10} 90 Q${x - 8} 82 ${x} 80`}
            fill="none"
            stroke={c("ink", 0.85)}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ))}
      <Sparkle x={170} y={40} r={6} fill={c("gold")} />
    </g>
  );
}

/** Average Per Game — a balance, level. */
function Scale() {
  return (
    <g>
      <Shadow y={132} rx={50} />
      <rect x="97" y="40" width="6" height="84" fill={c("gold-dim")} stroke={N} strokeWidth="1.2" />
      <path d="M70 130 Q100 110 130 130 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <rect x="36" y="36" width="128" height="7" rx="3.5" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <circle cx="100" cy="39.5" r="6.5" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <path
        d="M46 43 L34 78 M46 43 L58 78 M154 43 L142 78 M154 43 L166 78"
        stroke={c("ink-muted")}
        strokeWidth="1.6"
      />
      <path d="M28 78 H64 Q60 92 46 92 Q32 92 28 78 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M136 78 H172 Q168 92 154 92 Q140 92 136 78 Z"
        fill={c("gold-dim")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Football x={46} y={71} rx={13} />
      <rect x="142" y="70" width="24" height="7" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.2" />
      <rect x="144" y="63" width="20" height="7" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.2" />
      <rect x="146" y="56" width="16" height="7" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.2" />
      <rect x="80" y="96" width="40" height="18" rx="6" fill={c("ice")} stroke={N} strokeWidth="1.8" />
      <text x="100" y="109" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
        AVG
      </text>
    </g>
  );
}

/** Who, Not How Much — a spotlight on an unnamed player. */
function Spotlight() {
  return (
    <g>
      <path d="M48 36 L178 104 L112 132 Z" fill={c("gold", 0.22)} />
      <ellipse cx="146" cy="126" rx="38" ry="8" fill={c("gold", 0.45)} />
      <Player x={146} y={126} s={0.85} pose="stand" jersey="ice" label="?" />
      <path d="M40 44 L32 70 M40 44 L50 70" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(35 40 30)">
        <rect x="26" y="18" width="30" height="24" rx="5" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
        <rect x="54" y="20" width="6" height="20" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.5" />
      </g>
      <Sparkle x={100} y={30} r={5} />
    </g>
  );
}

/** Clean the Export — a broom sweeping junk cells into sparkle. */
function Broom() {
  const junk: [number, number, string][] = [
    [24, 112, "#"],
    [40, 122, "?"],
    [30, 96, "!"],
  ];
  const dust: [number, number, number][] = [
    [62, 106, 5],
    [54, 118, 4],
    [70, 120, 3],
  ];
  return (
    <g>
      <Shadow y={134} rx={58} />
      {junk.map(([x, y, t]) => (
        <g key={t}>
          <rect x={x} y={y} width="14" height="12" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="1.2" />
          <text
            x={x + 7}
            y={y + 9.5}
            textAnchor="middle"
            fontSize="9"
            fontWeight="900"
            fill={N}
            fontFamily={MONO}
          >
            {t}
          </text>
        </g>
      ))}
      {dust.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c("ink-muted")} opacity="0.45" />
      ))}
      <path d="M158 14 L104 98" stroke={N} strokeWidth="8.5" strokeLinecap="round" />
      <path d="M158 14 L104 98" stroke={c("ink-soft")} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M92 94 L118 104 L112 112 L86 102 Z" fill={c("turf")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M86 102 L112 112 L104 136 L60 124 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M92 108 L78 128 M100 110 L90 132 M106 112 L100 134 M86 106 L68 126"
        stroke={c("gold-dim")}
        strokeWidth="1.6"
      />
      <Sparkle x={150} y={100} r={7} fill={c("turf")} />
      <Sparkle x={170} y={80} r={4} />
      <Sparkle x={140} y={124} r={4} />
    </g>
  );
}

const SCENES: Record<QuestionArt, () => JSX.Element> = {
  hammer: Hammer,
  quarterback: Quarterback,
  burger: Burger,
  calendar: Calendar,
  storm: Storm,
  jersey: Jersey,
  rocket: Rocket,
  chalkboard: Chalkboard,
  dome: Dome,
  "tight-end": TightEnd,
  ppg: PpgCard,
  boom: Boom,
  "floor-ceiling": FloorCeiling,
  years: Years,
  podium: Podium,
  "night-game": NightGame,
  weather: Weather,
  shield: Shield,
  crown: Crown,
  stairs: Stairs,
  mask: Mask,
  medals: Medals,
  wave: Wave,
  "double-flame": DoubleFlame,
  pie: Pie,
  film: Film,
  cliff: Cliff,
  zzz: Zzz,
  magnifier: Magnifier,
  "foam-finger": FoamFinger,
  clicker: Clicker,
  ticket: Ticket,
  "velvet-rope": VelvetRope,
  positions: Positions,
  medkit: Medkit,
  receiver: Receiver,
  huddle: Huddle,
  peak: Peak,
  "money-bag": MoneyBag,
  binoculars: Binoculars,
  scale: Scale,
  spotlight: Spotlight,
  broom: Broom,
};

export default function QuestionArt({
  art,
  className = "",
  align = "center",
}: {
  art: QuestionArt;
  className?: string;
  /** "left" pins the scene to the left edge of a wide box, for banners. */
  align?: "center" | "left";
}) {
  const Scene = SCENES[art];
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className={className}
      role="presentation"
      aria-hidden
      preserveAspectRatio={align === "left" ? "xMinYMid meet" : "xMidYMid meet"}
    >
      <Glow t={ART_TONE[art]} id={art} />
      <Scene />
    </svg>
  );
}
