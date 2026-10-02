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
import {
  Flame,
  Football,
  Glow,
  MONO,
  MiniHelmet,
  N,
  Player,
  SANS,
  Shadow,
  Sparkle,
  VB,
  c,
  r1,
  slicePath,
  starPath,
  type Tone,
} from "@/components/art-kit";

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
  turkey: "gold",
  gift: "ice",
  hourglass: "gold",
  "leaf-snow": "ice",
  "high-jump": "turf",
  mirror: "ice",
  "milk-carton": "turf",
  donut: "gold",
  thermometer: "ice",
  fiddle: "gold",
  "record-book": "turf",
  goose: "ice",
  necktie: "turf",
  "photo-finish": "gold",
  "can-opener": "ice",
  "letter-j": "gold",
  lawnmower: "turf",
  house: "gold",
  "party-blower": "ice",
  fireworks: "gold",
  "road-sign": "turf",
  snowball: "ice",
  buckets: "turf",
  "boxing-gloves": "gold",
  "chef-hat": "ice",
  train: "turf",
  "gone-fishing": "ice",
  ladder: "gold",
  "high-five": "turf",
  "framed-jersey": "gold",
  milestone: "turf",
};

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

/** Thanksgiving Triple-Header — a roast turkey on a platter, three footballs in front. */
function Turkey() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <ellipse cx="100" cy="112" rx="70" ry="15" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <ellipse cx="100" cy="109" rx="58" ry="9" fill={c("ink", 0.9)} />
      <path d="M52 104 Q50 58 100 56 Q150 58 148 104 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M66 78 Q78 64 98 62" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" fill="none" />
      <g transform="rotate(-28 50 82)">
        <ellipse cx="50" cy="82" rx="16" ry="11" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
        <rect x="26" y="79" width="12" height="6" rx="2" fill={c("ink")} stroke={N} strokeWidth="1.5" />
        <circle cx="24" cy="79" r="4" fill={c("ink")} stroke={N} strokeWidth="1.5" />
        <circle cx="24" cy="86" r="4" fill={c("ink")} stroke={N} strokeWidth="1.5" />
      </g>
      <g transform="rotate(28 150 82)">
        <ellipse cx="150" cy="82" rx="16" ry="11" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
        <rect x="162" y="79" width="12" height="6" rx="2" fill={c("ink")} stroke={N} strokeWidth="1.5" />
        <circle cx="176" cy="79" r="4" fill={c("ink")} stroke={N} strokeWidth="1.5" />
        <circle cx="176" cy="86" r="4" fill={c("ink")} stroke={N} strokeWidth="1.5" />
      </g>
      <path d="M100 56 V30" stroke={N} strokeWidth="2" />
      <path d="M100 30 H124 L118 37 L124 44 H100 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <text x="110" y="41" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={SANS}>
        3
      </text>
      <Football x={72} y={124} rx={12} />
      <Football x={100} y={126} rx={12} />
      <Football x={128} y={124} rx={12} />
    </g>
  );
}

/** Christmas Football — a wrapped gift with a football peeking out of the top. */
function Gift() {
  return (
    <g>
      <Shadow y={132} rx={50} />
      <Football x={100} y={66} rx={20} rot={-12} />
      <rect x="62" y="74" width="76" height="56" rx="4" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <rect x="93" y="74" width="14" height="56" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <g transform="rotate(-14 64 66)">
        <rect x="56" y="60" width="88" height="16" rx="3" fill={c("ice")} stroke={N} strokeWidth="2.2" />
        <rect x="93" y="60" width="14" height="16" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      </g>
      <path d="M100 52 Q84 36 76 46 Q72 56 98 56 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M100 52 Q116 36 124 46 Q128 56 102 56 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="100" cy="54" r="4.5" fill={c("gold-dim")} stroke={N} strokeWidth="1.6" />
      <path d="M70 92 H90 M70 104 H90 M110 92 H130 M110 104 H130" stroke={c("ink", 0.45)} strokeWidth="2" strokeLinecap="round" />
      <Sparkle x={44} y={50} r={7} fill={c("gold")} />
      <Sparkle x={158} y={40} r={5} />
      <Sparkle x={162} y={96} r={4} fill={c("gold")} />
    </g>
  );
}

/** Short Week — an hourglass running out, tagged four days. */
function Hourglass() {
  return (
    <g>
      <Shadow y={134} rx={40} />
      <rect x="66" y="22" width="68" height="10" rx="3" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <rect x="66" y="118" width="68" height="10" rx="3" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <path d="M74 32 Q74 62 98 75 Q74 88 74 118 H126 Q126 88 102 75 Q126 62 126 32 Z" fill={c("ice", 0.25)} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M84 50 H116 Q112 62 100 70 Q88 62 84 50 Z" fill={c("gold")} />
      <path d="M100 70 V112" stroke={c("gold")} strokeWidth="2" />
      <path d="M78 116 Q100 92 122 116 Z" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      <path d="M80 38 Q80 56 92 66" stroke={c("ink", 0.6)} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <g transform="rotate(10 152 62)">
        <rect x="132" y="50" width="48" height="24" rx="5" fill={c("ink")} stroke={N} strokeWidth="2" />
        <text x="156" y="66" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
          4 DAYS
        </text>
      </g>
      <path d="M126 58 L134 60" stroke={N} strokeWidth="1.6" />
    </g>
  );
}

/** Fall Into Winter — a falling leaf, a football, and a snowflake. */
function LeafSnow() {
  const arms = [0, 60, 120, 180, 240, 300].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const x = r1(150 + 22 * Math.cos(a));
    const y = r1(62 + 22 * Math.sin(a));
    const bx = r1(150 + 13 * Math.cos(a));
    const by = r1(62 + 13 * Math.sin(a));
    const s1x = r1(bx + 6 * Math.cos(a + 0.9));
    const s1y = r1(by + 6 * Math.sin(a + 0.9));
    const s2x = r1(bx + 6 * Math.cos(a - 0.9));
    const s2y = r1(by + 6 * Math.sin(a - 0.9));
    return `M150 62 L${x} ${y} M${bx} ${by} L${s1x} ${s1y} M${bx} ${by} L${s2x} ${s2y}`;
  });
  return (
    <g>
      <Shadow y={132} rx={46} />
      <g transform="rotate(-30 50 60)">
        <path d="M50 30 Q74 50 50 92 Q26 50 50 30 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 36 V98 M50 54 L60 46 M50 54 L40 46 M50 70 L61 61 M50 70 L39 61" stroke={c("gold-dim")} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      <path d="M70 102 Q100 86 128 78" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="4 5" fill="none" />
      <Football x={100} y={112} rx={24} rot={-8} />
      <path d={arms.join(" ")} stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d={arms.join(" ")} stroke={c("ice")} strokeWidth="3" strokeLinecap="round" />
      <circle cx="150" cy="62" r="4" fill={c("ink")} stroke={N} strokeWidth="1.4" />
    </g>
  );
}

/** Above the Line — a football clearing a high-jump bar marked AVG. */
function HighJump() {
  return (
    <g>
      <Shadow y={134} rx={66} />
      <rect x="34" y="52" width="8" height="80" rx="2" fill={c("turf")} stroke={N} strokeWidth="2" />
      <rect x="158" y="52" width="8" height="80" rx="2" fill={c("turf")} stroke={N} strokeWidth="2" />
      <rect x="30" y="128" width="16" height="6" rx="2" fill={c("turf-dim")} stroke={N} strokeWidth="1.5" />
      <rect x="154" y="128" width="16" height="6" rx="2" fill={c("turf-dim")} stroke={N} strokeWidth="1.5" />
      <rect x="38" y="82" width="124" height="9" rx="4" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="100" y="89.5" textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        AVG
      </text>
      <path d="M54 118 Q82 26 132 52" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="4 5" fill="none" />
      <Football x={112} y={46} rx={20} rot={24} />
      <Sparkle x={140} y={28} r={6} fill={c("gold")} />
      <Sparkle x={76} y={40} r={4} />
    </g>
  );
}

/** Beating Yourself — a football squaring up to its own reflection. */
function Mirror() {
  return (
    <g>
      <Shadow y={134} rx={62} />
      <path d="M128 132 L134 116 M156 132 L150 116" stroke={N} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="142" cy="72" rx="32" ry="44" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" />
      <ellipse cx="142" cy="72" rx="25" ry="37" fill={c("ice", 0.35)} stroke={N} strokeWidth="1.6" />
      <path d="M126 50 Q130 40 138 38" stroke={c("ink", 0.7)} strokeWidth="3" strokeLinecap="round" fill="none" />
      <g opacity="0.75">
        <Football x={142} y={84} rx={16} rot={-20} fill={c("gold")} />
      </g>
      <Football x={62} y={100} rx={24} rot={20} />
      <path d="M86 70 L100 62 M86 80 L104 78" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 50 L44 36 L52 46 L66 30" stroke={c("turf")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M58 30 H66 V38" stroke={c("turf")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
}

/** Have You Seen This Running Back? — a milk carton with a missing poster. */
function MilkCarton() {
  return (
    <g>
      <Shadow y={134} rx={44} />
      <path d="M130 52 L150 42 V118 L130 130 Z" fill={c("ink-muted")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M70 52 L84 30 H136 L130 52 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M130 52 L136 30 L150 42 Z" fill={c("ink-muted")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <rect x="84" y="24" width="52" height="8" rx="1.5" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <rect x="70" y="52" width="60" height="78" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <text x="100" y="66" textAnchor="middle" fontSize="7" fontWeight="900" fill={N} fontFamily={MONO}>
        HAVE YOU SEEN
      </text>
      <rect x="78" y="72" width="44" height="42" rx="3" fill={c("ice", 0.25)} stroke={c("ice")} strokeWidth="2" />
      <MiniHelmet x={100} y={90} fill={c("turf")} />
      <text x="100" y="110" textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={SANS}>
        RB
      </text>
      <text x="100" y="124" textAnchor="middle" fontSize="7" fontWeight="900" fill={c("gold-dim")} fontFamily={MONO}>
        MISSING
      </text>
    </g>
  );
}

/** Donut Week — a frosted donut, which is to say a zero. */
function Donut() {
  const sprinkles: [number, number, number, string][] = [
    [74, 62, 30, "turf"],
    [92, 50, -20, "gold"],
    [118, 52, 60, "ink"],
    [134, 70, -40, "turf"],
    [130, 94, 20, "gold"],
    [70, 90, -60, "ink"],
    [86, 108, 40, "gold"],
    [112, 110, -10, "turf"],
  ];
  return (
    <g>
      <Shadow y={134} rx={52} />
      <circle cx="102" cy="80" r="46" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" />
      <path
        d="M102 40 Q118 38 128 48 Q142 52 142 68 Q150 82 140 94 Q138 112 120 114 Q106 124 92 116 Q72 116 66 100 Q54 86 62 70 Q62 50 80 46 Q90 38 102 40 Z"
        fill={c("ice")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="102" cy="80" r="15" fill={c("night")} stroke={N} strokeWidth="2.2" />
      {sprinkles.map(([x, y, rot, t], i) => (
        <rect key={i} x={x - 5} y={y - 1.6} width="10" height="3.2" rx="1.6" fill={c(t)} transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      <path d="M72 58 Q78 48 90 44" stroke={c("ink", 0.7)} strokeWidth="3" strokeLinecap="round" fill="none" />
      <g transform="rotate(8 164 40)">
        <rect x="146" y="30" width="38" height="20" rx="4" fill={c("gold")} stroke={N} strokeWidth="1.8" />
        <text x="165" y="44" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
          WK 1
        </text>
      </g>
    </g>
  );
}

/** Temperature Unknown — a thermometer with a question mark where the reading should be. */
function Thermometer() {
  return (
    <g>
      <Shadow y={134} rx={40} />
      <rect x="86" y="24" width="24" height="88" rx="12" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <circle cx="98" cy="114" r="17" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <rect x="93" y="70" width="10" height="40" rx="5" fill={c("ice")} />
      <path d="M110 40 H104 M110 52 H104 M110 64 H104 M110 76 H104 M110 88 H104" stroke={N} strokeWidth="1.8" />
      <path d="M92 32 V62" stroke={c("ink", 0.9)} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M126 26 H176 Q182 26 182 32 V64 Q182 70 176 70 H140 L130 80 L132 70 H126 Q120 70 120 64 V32 Q120 26 126 26 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <text x="151" y="60" textAnchor="middle" fontSize="32" fontWeight="900" fill={N} fontFamily={SANS}>
        ?
      </text>
      <path d="M30 120 Q46 92 64 120 Z" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M40 120 V110 M54 120 V110" stroke={N} strokeWidth="1.4" />
    </g>
  );
}

/** Second Fiddle — a fiddle and its bow, with a silver 2. */
function Fiddle() {
  return (
    <g>
      <Shadow y={134} rx={44} />
      <g transform="rotate(-18 98 82)">
        <rect x="94" y="16" width="8" height="48" rx="2" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
        <circle cx="98" cy="14" r="6" fill={c("gold-dim")} stroke={N} strokeWidth="1.8" />
        <path d="M98 56 C74 56 72 74 82 82 C70 90 70 116 98 120 C126 116 126 90 114 82 C124 74 122 56 98 56 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M86 84 Q82 92 86 100 M110 84 Q114 92 110 100" stroke={N} strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="90" y="104" width="16" height="5" rx="1.5" fill={c("night-100")} stroke={N} strokeWidth="1.4" />
        <path d="M95.5 18 V106 M100.5 18 V106" stroke={c("ink", 0.8)} strokeWidth="0.9" />
        <path d="M80 70 Q86 64 92 62" stroke={c("gold", 0.9)} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
      <path d="M44 120 L150 34" stroke={N} strokeWidth="4" strokeLinecap="round" />
      <path d="M46 116 L148 34" stroke={c("ink-soft")} strokeWidth="1.6" />
      <circle cx="152" cy="94" r="18" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      <circle cx="152" cy="94" r="12.5" fill="none" stroke={c("ink", 0.7)} strokeWidth="1.4" />
      <text x="152" y="101" textAnchor="middle" fontSize="19" fontWeight="900" fill={N} fontFamily={SANS}>
        2
      </text>
    </g>
  );
}

/** Team Record Book — an open record book, a football on one page, a gold ribbon. */
function RecordBook() {
  return (
    <g>
      <Shadow y={132} rx={66} />
      <path d="M30 46 Q64 40 100 50 Q136 40 170 46 V124 Q136 118 100 128 Q64 118 30 124 Z" fill={c("turf-dim")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M36 42 Q68 36 98 46 V122 Q68 112 36 118 Z" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M164 42 Q132 36 102 46 V122 Q132 112 164 118 Z" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <Football x={67} y={78} rx={17} rot={-12} />
      <path d="M50 102 Q68 98 86 104" stroke={c("ink-muted")} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M114 62 Q132 58 152 62 M114 74 Q132 70 152 74 M114 86 Q132 82 152 86 M114 98 Q130 95 140 98" stroke={c("ink-muted")} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <text x="133" y="58" textAnchor="middle" fontSize="8" fontWeight="900" fill={c("gold-dim")} fontFamily={MONO}>
        No. 1
      </text>
      <path d="M140 40 V70 L146 64 L152 70 V40" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <Sparkle x={34} y={30} r={6} fill={c("gold")} />
    </g>
  );
}

/** Goose Egg — a goose standing guard over an egg with a zero on it. */
function Goose() {
  return (
    <g>
      <Shadow y={132} rx={64} />
      <ellipse cx="134" cy="102" rx="24" ry="30" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      <text x="134" y="114" textAnchor="middle" fontSize="30" fontWeight="900" fill={N} fontFamily={SANS}>
        0
      </text>
      <path d="M110 84 Q112 76 118 76" stroke={c("ink", 0.8)} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M44 128 L46 116 M62 128 L60 116" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" />
      <path d="M38 130 H52 M56 130 H70" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" />
      <path d="M28 104 Q30 84 52 82 Q74 82 80 100 Q82 116 60 118 Q34 120 28 104 Z" fill={c("ink")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M40 98 Q52 92 66 98" stroke={c("ink-muted")} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M70 90 Q66 62 72 44" stroke={N} strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M70 90 Q66 62 72 44" stroke={c("ink")} strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="76" cy="40" r="10" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <path d="M84 38 L98 42 L84 46 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="78" cy="37" r="2.2" fill={N} />
    </g>
  );
}

/** Tied Up — a necktie under a level scoreboard. */
function Necktie() {
  return (
    <g>
      <Shadow y={134} rx={34} />
      <rect x="52" y="14" width="96" height="30" rx="5" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <text x="100" y="35" textAnchor="middle" fontSize="18" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        20–20
      </text>
      <path d="M90 52 H110 L106 64 H94 Z" fill={c("turf")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M94 64 H106 L118 112 L100 130 L82 112 Z" fill={c("turf")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M90 82 L110 72 M86 98 L114 84 M86 114 L114 100 M94 124 L110 116" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" />
      <path d="M74 52 Q86 44 90 52 M126 52 Q114 44 110 52" stroke={c("ink-soft")} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Photo Finish — a ball breaking the finish tape under a camera flash. */
function PhotoFinish() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <rect x="28" y="40" width="6" height="94" fill={c("ink-soft")} stroke={N} strokeWidth="1.6" />
      <rect x="166" y="40" width="6" height="94" fill={c("ink-soft")} stroke={N} strokeWidth="1.6" />
      <path d="M34 78 Q70 84 92 92 M108 92 Q136 84 166 78" stroke={c("ink")} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M34 78 Q70 84 92 92 M108 92 Q136 84 166 78" stroke={N} strokeWidth="5" strokeDasharray="5 5" fill="none" />
      <Football x={100} y={96} rx={20} rot={-6} />
      <path d="M70 108 H50 M72 116 H58" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
      <rect x="128" y="18" width="44" height="28" rx="5" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <rect x="138" y="13" width="12" height="7" rx="2" fill={c("ink-soft")} stroke={N} strokeWidth="1.4" />
      <circle cx="150" cy="32" r="9" fill={c("ice")} stroke={N} strokeWidth="2" />
      <circle cx="150" cy="32" r="4" fill={N} />
      <path d={starPath(118, 22, 8, 12, 5, 0)} fill={c("gold")} stroke={N} strokeWidth="1.2" />
    </g>
  );
}

/** Season Opener — a can opener taking the lid off a can, a football popping out. */
function CanOpener() {
  return (
    <g>
      <Shadow y={134} rx={44} />
      <path d="M64 70 V122 Q64 130 100 130 Q136 130 136 122 V70" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <ellipse cx="100" cy="70" rx="36" ry="9" fill={c("night")} stroke={N} strokeWidth="2.2" />
      <rect x="64" y="88" width="72" height="22" fill={c("gold")} stroke={N} strokeWidth="1.8" />
      <text x="100" y="103.5" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        SEASON
      </text>
      <g transform="rotate(-24 118 46)">
        <ellipse cx="118" cy="46" rx="30" ry="7" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      </g>
      <Football x={96} y={58} rx={20} rot={-30} />
      <g transform="rotate(30 52 64)">
        <rect x="18" y="58" width="44" height="12" rx="6" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
        <circle cx="66" cy="64" r="9" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
        <circle cx="66" cy="64" r="3" fill={N} />
      </g>
      <Sparkle x={146} y={24} r={6} fill={c("gold")} />
    </g>
  );
}

/** The J Team — a toy block with a big J on it. */
function LetterJ() {
  return (
    <g>
      <Shadow y={134} rx={58} />
      <path d="M68 58 L100 44 L132 58 L100 72 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M68 58 V112 L100 128 V72 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M132 58 V112 L100 128 V72 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M118 78 V104 Q118 114 110 112 Q104 110 104 104" stroke={N} strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="26" y="98" width="28" height="28" rx="3" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="40" y="119" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
        A
      </text>
      <rect x="146" y="98" width="28" height="28" rx="3" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text x="160" y="119" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
        Z
      </text>
      <Sparkle x={144} y={40} r={6} />
    </g>
  );
}

/** Grass Is Greener — a push mower cutting stripes into the turf. */
function Lawnmower() {
  return (
    <g>
      <path d="M10 116 H190 V140 H10 Z" fill={c("turf-dim")} />
      <path d="M10 116 H60 V140 H10 Z M110 116 H160 V140 H110 Z" fill={c("turf")} />
      <path d="M118 112 L150 46" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M118 112 L150 46" stroke={c("ink-soft")} strokeWidth="3" strokeLinecap="round" />
      <path d="M140 46 H162" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M140 46 H162" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" />
      <path d="M52 112 Q52 84 82 84 H118 Q130 84 130 112 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="64" y="74" width="28" height="12" rx="4" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <circle cx="66" cy="114" r="10" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <circle cx="116" cy="114" r="10" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <circle cx="66" cy="114" r="3.5" fill={c("ink-muted")} />
      <circle cx="116" cy="114" r="3.5" fill={c("ink-muted")} />
      <path d="M30 104 L34 96 M38 106 L44 94 M24 108 L26 100" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Home Sweet Home — a house with a football over the door. */
function House() {
  return (
    <g>
      <Shadow y={134} rx={62} />
      <rect x="54" y="72" width="92" height="60" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <path d="M42 76 L100 30 L158 76 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="124" y="40" width="12" height="22" fill={c("gold-dim")} stroke={N} strokeWidth="1.8" />
      <rect x="88" y="98" width="24" height="34" rx="2" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <circle cx="106" cy="116" r="2" fill={c("gold")} />
      <rect x="62" y="86" width="18" height="16" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <rect x="120" y="86" width="18" height="16" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <path d="M71 86 V102 M62 94 H80 M129 86 V102 M120 94 H138" stroke={N} strokeWidth="1.4" />
      <Football x={100} y={62} rx={14} />
      <rect x="80" y="130" width="40" height="6" rx="2" fill={c("turf")} stroke={N} strokeWidth="1.4" />
    </g>
  );
}

/** Blowout — a party blower unrolling, confetti everywhere. */
function PartyBlower() {
  const bits: [number, number, string, number][] = [
    [150, 38, "gold", 20],
    [168, 64, "turf", -30],
    [138, 22, "ice", 60],
    [176, 92, "gold", 10],
    [60, 36, "turf", -15],
    [44, 64, "ice", 40],
  ];
  return (
    <g>
      <Shadow y={132} rx={56} />
      <g transform="rotate(-18 70 96)">
        <path d="M30 88 L84 92 V104 L30 108 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M44 89 V107 M58 90 V106 M72 91 V105" stroke={c("turf")} strokeWidth="4" />
        <rect x="20" y="91" width="12" height="14" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" />
      </g>
      <path
        d="M84 86 H140 Q164 86 164 66 Q164 50 148 50 Q134 50 134 64 Q134 72 144 72"
        fill="none"
        stroke={N}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M84 86 H140 Q164 86 164 66 Q164 50 148 50 Q134 50 134 64 Q134 72 144 72"
        fill="none"
        stroke={c("ice")}
        strokeWidth="9"
        strokeLinecap="round"
      />
      {bits.map(([x, y, t, r], i) => (
        <rect key={i} x={x - 4} y={y - 2.5} width="8" height="5" rx="1.5" fill={c(t)} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <Football x={112} y={118} rx={14} rot={10} />
    </g>
  );
}

/** Fireworks Show — two bursts over a lit stadium rim. */
function Fireworks() {
  const burst = (cx: number, cy: number, r: number, t: string) =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (i * 36 * Math.PI) / 180;
      return `M${r1(cx + r * 0.35 * Math.cos(a))} ${r1(cy + r * 0.35 * Math.sin(a))} L${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`;
    }).join(" ") + `|${t}`;
  const bursts = [burst(64, 48, 30, "gold"), burst(138, 40, 24, "ice"), burst(150, 86, 14, "turf")];
  return (
    <g>
      {bursts.map((b, i) => {
        const [d, t] = b.split("|");
        return (
          <g key={i}>
            <path d={d} stroke={N} strokeWidth="6" strokeLinecap="round" />
            <path d={d} stroke={c(t)} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      })}
      <circle cx="64" cy="48" r="5" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      <circle cx="138" cy="40" r="4" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      <path d="M20 132 Q20 104 100 104 Q180 104 180 132 Z" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <path d="M36 118 Q100 106 164 118" stroke={c("gold", 0.8)} strokeWidth="2.4" strokeDasharray="3 5" fill="none" />
      <Football x={100} y={124} rx={11} />
    </g>
  );
}

/** Road Warriors — a highway sign over a road running into the distance. */
function RoadSign() {
  return (
    <g>
      <path d="M70 140 L94 70 H106 L130 140 Z" fill={c("night-100")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M100 76 V86 M100 96 V108 M100 118 V134" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <rect x="146" y="60" width="6" height="74" fill={c("ink-muted")} stroke={N} strokeWidth="1.6" />
      <rect x="112" y="24" width="76" height="44" rx="6" fill={c("turf-dim")} stroke={N} strokeWidth="2.2" />
      <rect x="116" y="28" width="68" height="36" rx="4" fill="none" stroke={c("ink", 0.85)} strokeWidth="1.6" />
      <text x="150" y="44" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        AWAY
      </text>
      <path d="M134 54 H164 M158 49 L164 54 L158 59" stroke={c("ink")} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Football x={58} y={112} rx={20} rot={-14} />
      <path d="M30 104 H14 M32 116 H20" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Snowball — a snowball with a football in it, rolling down a slope and growing. */
function Snowball() {
  return (
    <g>
      <path d="M10 60 L190 132 V140 H10 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="44" cy="62" r="6" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      <circle cx="72" cy="78" r="11" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <circle cx="132" cy="84" r="30" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <Football x={132} y={84} rx={15} rot={30} />
      <path d="M108 66 Q114 58 124 56" stroke={c("ice")} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M88 68 L96 74 M84 82 L94 84" stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
      <path d={starPath(176, 32, 6, 8, 3, 0)} fill={c("ice")} />
      <path d={starPath(30, 28, 6, 6, 2.5, 30)} fill={c("ice")} />
    </g>
  );
}

/** Bust, Solid, Boom — three labelled buckets, filling up left to right. */
function Buckets() {
  const pails: [number, string, string, number][] = [
    [46, "gold-dim", "BUST", 0],
    [100, "ice", "SOLID", 1],
    [154, "turf", "BOOM", 2],
  ];
  return (
    <g>
      <Shadow y={134} rx={78} />
      {pails.map(([x, t, label, n]) => (
        <g key={label}>
          {Array.from({ length: n }, (_, i) => (
            <Football key={i} x={x - 6 + i * 12} y={78 - i * 4} rx={11} rot={i ? 24 : -18} />
          ))}
          <path d={`M${x - 24} 80 L${x - 18} 128 H${x + 18} L${x + 24} 80 Z`} fill={c(t)} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
          <ellipse cx={x} cy="80" rx="24" ry="5" fill={c("night")} stroke={N} strokeWidth="2" />
          <path d={`M${x - 22} 80 Q${x} 54 ${x + 22} 80`} fill="none" stroke={N} strokeWidth="2" />
          <text x={x} y="110" textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Rematch — two boxing gloves squaring up, with a 2 between them. */
function BoxingGloves() {
  const glove = (flip: number, t: string) => (
    <g transform={`translate(${flip === 1 ? 0 : 200} 0) scale(${flip} 1)`}>
      <path d="M30 104 L28 126 H62 L60 104 Z" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 74 Q24 46 52 44 Q82 42 84 68 Q86 92 66 104 H32 Q24 98 24 74 Z" fill={c(t)} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M62 60 Q74 58 76 70 Q76 80 66 82" fill="none" stroke={N} strokeWidth="2" />
      <path d="M36 56 Q44 50 54 50" stroke={c("ink", 0.7)} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <Shadow y={134} rx={70} />
      {glove(1, "gold")}
      {glove(-1, "ice")}
      <circle cx="100" cy="36" r="14" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <text x="100" y="42" textAnchor="middle" fontSize="17" fontWeight="900" fill={c("gold")} fontFamily={SANS}>
        2
      </text>
      <path d="M100 58 L94 72 L104 70 L98 84" stroke={c("gold")} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Home Cooking — a chef's hat over a steaming pot with a football in it. */
function ChefHat() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <path d="M56 92 H144 V118 Q144 130 132 130 H68 Q56 130 56 118 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <rect x="50" y="86" width="100" height="10" rx="4" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <path d="M50 100 H40 M150 100 H160" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <Football x={100} y={84} rx={18} rot={-10} />
      <path d="M78 70 Q72 60 78 52 Q84 44 78 36 M122 70 Q116 60 122 52 Q128 44 122 36" stroke={c("ink-muted")} strokeWidth="3" fill="none" strokeLinecap="round" />
      <g transform="rotate(-12 146 34)">
        <path d="M128 40 Q120 24 134 20 Q140 8 152 14 Q166 10 166 26 Q174 32 164 40 Z" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
        <rect x="130" y="38" width="34" height="10" rx="2" fill={c("ink")} stroke={N} strokeWidth="2" />
      </g>
    </g>
  );
}

/** Winning Streak — a locomotive pulling a line of W cars. */
function Train() {
  const cars = [62, 104];
  return (
    <g>
      <path d="M8 124 H192" stroke={c("ink-muted")} strokeWidth="3" />
      <path d="M14 128 V120 M34 128 V120 M54 128 V120 M74 128 V120 M94 128 V120 M114 128 V120 M134 128 V120 M154 128 V120 M174 128 V120" stroke={c("ink-muted")} strokeWidth="2" />
      {cars.map((x) => (
        <g key={x}>
          <rect x={x - 18} y="78" width="36" height="34" rx="3" fill={c("gold")} stroke={N} strokeWidth="2" />
          <text x={x} y="102" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
            W
          </text>
          <circle cx={x - 9} cy="116" r="6" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
          <circle cx={x + 9} cy="116" r="6" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
        </g>
      ))}
      <path d="M80 98 H86 M122 98 H130" stroke={N} strokeWidth="3" />
      <path d="M130 112 V74 H160 V60 H176 V112 Z" fill={c("turf")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="164" y="66" width="8" height="10" fill={c("ink")} stroke={N} strokeWidth="1.4" />
      <rect x="136" y="56" width="10" height="18" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <path d="M176 104 L188 112 H176 Z" fill={c("gold-dim")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="142" cy="116" r="7" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <circle cx="166" cy="116" r="7" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <circle cx="146" cy="42" r="7" fill={c("ink-soft")} />
      <circle cx="136" cy="30" r="9" fill={c("ink-soft", 0.8)} />
      <circle cx="122" cy="22" r="10" fill={c("ink-soft", 0.6)} />
    </g>
  );
}

/** Gone Fishing — the sign, the rod, and a football on the line. */
function GoneFishing() {
  return (
    <g>
      <Shadow y={134} rx={66} />
      <rect x="54" y="62" width="6" height="72" fill={c("gold-dim")} stroke={N} strokeWidth="1.6" />
      <g transform="rotate(-6 58 50)">
        <rect x="20" y="30" width="78" height="38" rx="4" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" />
        <text x="59" y="46" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
          GONE
        </text>
        <text x="59" y="60" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
          FISHING
        </text>
      </g>
      <path d="M112 132 L170 24" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M112 132 L170 24" stroke={c("ice")} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="124" cy="110" r="6" fill={c("ink-soft")} stroke={N} strokeWidth="1.6" />
      <path d="M170 24 Q182 60 176 88" stroke={c("ink-muted")} strokeWidth="1.4" fill="none" />
      <Football x={176} y={98} rx={11} rot={90} />
      <path d="M150 128 Q176 120 196 128" stroke={c("ice", 0.6)} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Power Rankings — a ladder with a helmet on every rung, number one at the top. */
function Ladder() {
  const rungs = [44, 70, 96, 122];
  const fills = ["gold", "ice", "turf", "ink-muted"];
  return (
    <g>
      <Shadow y={136} rx={46} />
      <path d="M70 136 L84 18 M130 136 L116 18" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M70 136 L84 18 M130 136 L116 18" stroke={c("gold-dim")} strokeWidth="4" strokeLinecap="round" />
      {rungs.map((y, i) => {
        const inset = r1((136 - y) * 0.118);
        return (
          <g key={y}>
            <path d={`M${r1(70 + inset)} ${y} H${r1(130 - inset)}`} stroke={N} strokeWidth="5" strokeLinecap="round" />
            <path d={`M${r1(70 + inset)} ${y} H${r1(130 - inset)}`} stroke={c("gold-dim")} strokeWidth="2.6" strokeLinecap="round" />
            <MiniHelmet x={100} y={y - 9} fill={c(fills[i])} />
          </g>
        );
      })}
      <circle cx="140" cy="26" r="10" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="140" y="31" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={SANS}>
        1
      </text>
      <Sparkle x={58} y={28} r={6} fill={c("gold")} />
    </g>
  );
}

/** High Five — two hands meeting in the air. */
function HighFive() {
  const hand = (flip: number, t: string) => (
    <g transform={`translate(${flip === 1 ? 0 : 200} 0) scale(${flip} 1)`}>
      <path d="M40 132 L54 100" stroke={N} strokeWidth="20" strokeLinecap="round" />
      <path d="M40 132 L54 100" stroke={c(t)} strokeWidth="15" strokeLinecap="round" />
      <path
        d="M50 104 Q44 84 56 70 L64 40 Q66 34 72 36 Q76 38 74 44 L70 64 L78 34 Q80 28 86 30 Q90 32 88 38 L82 64 L90 40 Q92 34 98 36 Q102 38 100 44 L92 70 Q102 72 98 84 Q90 102 72 108 Z"
        fill={c("ink-soft")}
        stroke={N}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </g>
  );
  return (
    <g>
      {hand(1, "turf")}
      {hand(-1, "ice")}
      <path d="M100 20 V8 M84 24 L76 14 M116 24 L124 14" stroke={c("gold")} strokeWidth="3.5" strokeLinecap="round" />
      <path d={starPath(100, 40, 8, 10, 4, 0)} fill={c("gold")} stroke={N} strokeWidth="1.4" />
    </g>
  );
}

/** Career Year — a jersey framed on the wall, a plaque underneath. */
function FramedJersey() {
  return (
    <g>
      <rect x="44" y="14" width="112" height="112" rx="4" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" />
      <rect x="54" y="24" width="92" height="92" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <path
        d="M80 36 L92 32 Q100 40 108 32 L120 36 L134 50 L126 60 L120 54 V104 H80 V54 L74 60 L66 50 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={starPath(100, 74, 5, 11, 4.5, -90)} fill={c("gold")} stroke={N} strokeWidth="1.4" />
      <rect x="80" y="120" width="40" height="12" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <path d="M88 126 H112" stroke={N} strokeWidth="1.6" />
      <Sparkle x={160} y={20} r={6} />
      <Sparkle x={38} y={110} r={4} fill={c("gold")} />
    </g>
  );
}

/** Milestone Game — a green mile-marker post reading 30, a ball rolling past it. */
function Milestone() {
  return (
    <g>
      <path d="M10 126 Q100 116 190 126 V140 H10 Z" fill={c("turf-dim")} />
      <Shadow y={130} rx={34} />
      <rect x="96" y="80" width="8" height="50" fill={c("ink-muted")} stroke={N} strokeWidth="1.8" />
      <rect x="74" y="20" width="52" height="66" rx="6" fill={c("turf")} stroke={N} strokeWidth="2.4" />
      <rect x="79" y="25" width="42" height="56" rx="4" fill="none" stroke={c("ink", 0.9)} strokeWidth="1.8" />
      <text x="100" y="44" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        PTS
      </text>
      <text x="100" y="72" textAnchor="middle" fontSize="26" fontWeight="900" fill={c("ink")} fontFamily={SANS}>
        30
      </text>
      <Football x={146} y={118} rx={14} rot={-14} />
      <path d="M124 112 H112 M126 122 H116" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" />
      <Sparkle x={140} y={28} r={6} fill={c("gold")} />
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
  turkey: Turkey,
  gift: Gift,
  hourglass: Hourglass,
  "leaf-snow": LeafSnow,
  "high-jump": HighJump,
  mirror: Mirror,
  "milk-carton": MilkCarton,
  donut: Donut,
  thermometer: Thermometer,
  fiddle: Fiddle,
  "record-book": RecordBook,
  goose: Goose,
  necktie: Necktie,
  "photo-finish": PhotoFinish,
  "can-opener": CanOpener,
  "letter-j": LetterJ,
  lawnmower: Lawnmower,
  house: House,
  "party-blower": PartyBlower,
  fireworks: Fireworks,
  "road-sign": RoadSign,
  snowball: Snowball,
  buckets: Buckets,
  "boxing-gloves": BoxingGloves,
  "chef-hat": ChefHat,
  train: Train,
  "gone-fishing": GoneFishing,
  ladder: Ladder,
  "high-five": HighFive,
  "framed-jersey": FramedJersey,
  milestone: Milestone,
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
