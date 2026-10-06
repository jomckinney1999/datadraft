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
  "sandwich-board": "gold",
  "ice-cube": "ice",
  slide: "gold",
  clipboard: "turf",
  fingerprint: "ice",
  balloon: "gold",
  colander: "ice",
  "magic-hat": "gold",
  "tug-of-war": "turf",
  sweater: "ice",
  suitcase: "gold",
  "starting-blocks": "turf",
  "tier-cake": "gold",
  castle: "ice",
  seesaw: "gold",
  boomerang: "turf",
  spring: "ice",
  speedometer: "gold",
  elevator: "turf",
  "spirit-level": "gold",
  "trash-can": "ice",
  "crunch-clock": "gold",
  mug: "turf",
  "draft-board": "ice",
  "beach-umbrella": "gold",
  "winged-shoes": "turf",
  shelf: "ice",
  "spare-tire": "turf",
  vinyl: "gold",
  "growth-chart": "turf",
  "face-off": "ice",
  pile: "gold",
  pillow: "ice",
  "u-turn": "turf",
  "tackle-dummy": "gold",
  robin: "ice",
  "road-trip": "turf",
  halfway: "gold",
  "desk-fan": "ice",
  "empty-seats": "turf",
  "first-look": "ice",
  "game-of-the-year": "gold",
  "ten-big-weeks": "gold",
  "hands-in": "turf",
  "form-line": "ice",
  "moving-box": "gold",
  "qb-grid": "ice",
  "steady-hands": "turf",
  "where-was": "ice",
  "race-to-200": "turf",
  "four-spots": "gold",
  "name-tags": "ice",
  "tally-marks": "turf",
  "per-game": "ice",
  "tall-bar": "gold",
  "steady-streaky": "turf",
  "game-tags": "gold",
  "stacked-blocks": "turf",
  leap: "ice",
  pennants: "gold",
  "above-line": "turf",
  "adding-machine": "ice",
  "middle-ball": "gold",
  stamp: "turf",
  "silver-medal": "ice",
  backfield: "turf",
  "crowned-receiver": "gold",
  "rank-board": "ice",
  "blank-cell": "turf",
  "empty-weeks": "ice",
  "twenty-cells": "turf",
  crosshairs: "gold",
  "which-week": "ice",
  "not-on-sheet": "gold",
  "shopping-bag": "turf",
  "rush-cart": "ice",
  "cash-register": "gold",
  "shop-window": "ice",
  basket: "gold",
  "welcome-mat": "turf",
  "return-box": "ice",
  "price-tag": "gold",
  coupon: "turf",
  "wallet-crown": "gold",
  "two-dates": "ice",
  "blank-form": "turf",
  "free-truck": "ice",
  "heart-jersey": "gold",
  "coin-steps": "turf",
  "signup-hourglass": "ice",
  "fourth-down-sign": "gold",
  "go-chart": "turf",
  "third-down-chains": "gold",
  "red-zone-flag": "gold",
  "chunk-ruler": "turf",
  "script-card": "ice",
  "deep-bomb": "ice",
  "target-bullseye": "ice",
  "long-kick": "gold",
  "ep-gauge": "turf",
  "turnover-scale": "gold",
  "comeback-scoreboard": "turf",
  "hot-hand-flame": "gold",
  "dome-sun": "ice",
  "yard-cow": "turf",
  "sack-qb": "ice",
  "marathon-chain": "turf",
  "phone-sunday": "gold",
  "dau-counter": "turf",
  "peak-mountain": "ice",
  "glue-phone": "turf",
  "seven-calendar": "ice",
  "funnel-steps": "gold",
  "empty-lineup": "ice",
  "channel-signs": "turf",
  "stopwatch-thirty": "ice",
  "first-footprint": "gold",
  "double-tap": "ice",
  "phone-laptop": "turf",
  "join-hourglass": "gold",
  "piggy-repeat": "turf",
  "rolling-wheel": "ice",
  "kickoff-clock": "gold",
  "power-battery": "turf",
  "name-initial": "ice",
  "two-jerseys": "gold",
  "composite-key": "gold",
  "floor-ten": "turf",
  "above-usual": "ice",
  "torn-name": "ice",
  "september-page": "gold",
  "no-shootout": "turf",
  "week-question": "gold",
  "monday-strip": "ice",
  "qb-stack": "turf",
  "dual-threat": "gold",
  "full-kit": "ice",
  "headline-sheet": "turf",
  "lightbulb-lineup": "gold",
  "quarter-bars": "ice",
  "big-jump": "ice",
  "high-bar": "gold",
  "ceiling-line": "turf",
  "two-helmets": "ice",
  "box-lines": "gold",
  "two-podium": "turf",
  "fire-chain": "gold",
  "balance-scale": "ice",
  "coupon-percent": "gold",
  "home-end-zone": "turf",
  "order-gaps": "ice",
  "team-sheet": "gold",
  "seven-ticks": "turf",
  "perfect-week": "turf",
  "two-minute-clock": "gold",
  "order-ticket": "ice",
  "seven-day-window": "turf",
  "three-and-out": "gold",
  "field-marker": "turf",
  "scoring-drive": "ice",
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

/** Saturday Special — a diner sandwich board chalked SAT SPECIAL. */
function SandwichBoard() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <path d="M60 132 L84 26 H116 L140 132" fill="none" stroke={N} strokeWidth="5" strokeLinejoin="round" />
      <path d="M60 132 L84 26 H116 L140 132" fill="none" stroke={c("gold-dim")} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M68 118 L88 34 H112 L132 118 Z" fill={c("night-100")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <text x="100" y="56" textAnchor="middle" fontSize="11" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        SAT
      </text>
      <text x="100" y="72" textAnchor="middle" fontSize="8" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        SPECIAL
      </text>
      <Football x={100} y={94} rx={14} />
      <path d="M84 110 H116" stroke={c("ink", 0.6)} strokeWidth="2" strokeDasharray="3 3" />
      <Sparkle x={150} y={36} r={6} fill={c("gold")} />
    </g>
  );
}

/** Cold One — a football frozen inside an ice cube. */
function IceCube() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <path d="M58 54 L100 36 L146 52 L104 72 Z" fill={c("ice", 0.55)} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M58 54 V112 L104 130 V72 Z" fill={c("ice", 0.35)} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M146 52 V110 L104 130 V72 Z" fill={c("ice", 0.45)} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <g opacity="0.85">
        <Football x={102} y={92} rx={20} rot={-22} />
      </g>
      <path d="M66 64 V92 M72 60 L80 56" stroke={c("ink", 0.8)} strokeWidth="3" strokeLinecap="round" />
      <path d="M150 124 Q156 132 162 124 Q156 112 150 124 Z" fill={c("ice")} stroke={N} strokeWidth="1.4" />
      <path d={starPath(40, 34, 6, 9, 3.5, 0)} fill={c("ice")} />
    </g>
  );
}

/** Sliding Down — a football going down a playground slide. */
function Slide() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <path d="M48 132 V48 M64 132 V48" stroke={N} strokeWidth="5" />
      <path d="M48 132 V48 M64 132 V48" stroke={c("ink-muted")} strokeWidth="2.5" />
      <path d="M48 66 H64 M48 86 H64 M48 106 H64" stroke={c("ink-muted")} strokeWidth="3" />
      <rect x="42" y="40" width="30" height="10" rx="3" fill={c("ice")} stroke={N} strokeWidth="2" />
      <path d="M70 46 Q110 56 132 108 Q140 124 166 126 L168 134 Q132 134 122 112 Q104 70 70 56 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <Football x={112} y={74} rx={14} rot={46} />
      <path d="M94 62 L88 52 M100 70 L92 64" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M150 60 V84 M142 76 L150 86 L158 76" stroke={c("gold")} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Roll Call — a clipboard with a checklist of names. */
function Clipboard() {
  return (
    <g>
      <Shadow y={134} rx={46} />
      <rect x="58" y="26" width="84" height="106" rx="6" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" />
      <rect x="66" y="36" width="68" height="88" rx="2" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <rect x="84" y="20" width="32" height="14" rx="4" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      {[50, 68, 86, 104].map((y, i) => (
        <g key={y}>
          <rect x="72" y={y - 6} width="10" height="10" rx="2" fill="none" stroke={N} strokeWidth="1.6" />
          {i < 3 && <path d={`M73 ${y - 1} L77 ${y + 3} L84 ${y - 7}`} stroke={c("turf")} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          <path d={`M88 ${y} H${126 - i * 6}`} stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ))}
      <path d="M154 102 L150 128" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M154 102 L150 128" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Fingerprints — a fingerprint under a magnifying glass. */
function Fingerprint() {
  const rings = [10, 17, 24, 31, 38].map((r) => `M${100 - r} 84 Q${100 - r} ${84 - r * 1.25} 100 ${84 - r * 1.25} Q${100 + r} ${84 - r * 1.25} ${100 + r} 84 Q${100 + r} ${84 + r * 0.8} ${100 + r * 0.4} ${84 + r}`);
  return (
    <g>
      <Shadow y={134} rx={48} />
      <ellipse cx="100" cy="82" rx="46" ry="52" fill={c("ink-soft", 0.2)} />
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={c("ice")} strokeWidth="3.4" strokeLinecap="round" />
      ))}
      <circle cx="140" cy="56" r="22" fill={c("ink", 0.12)} stroke={N} strokeWidth="5" />
      <circle cx="140" cy="56" r="22" fill="none" stroke={c("gold")} strokeWidth="2.5" />
      <path d="M156 72 L176 94" stroke={N} strokeWidth="9" strokeLinecap="round" />
      <path d="M156 72 L176 94" stroke={c("gold-dim")} strokeWidth="5" strokeLinecap="round" />
      <path d="M128 46 Q132 40 140 40" stroke={c("ink", 0.8)} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Inflation — a football-patterned balloon being pumped up. */
function Balloon() {
  return (
    <g>
      <Shadow y={134} rx={50} />
      <path d="M120 96 Q116 112 124 120" stroke={c("ink-muted")} strokeWidth="2" fill="none" />
      <ellipse cx="120" cy="58" rx="38" ry="40" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      <path d="M116 98 L124 98 L120 92 Z" fill={c("gold-dim")} stroke={N} strokeWidth="1.6" />
      <path d="M120 34 V82" stroke={c("ink")} strokeWidth="2.4" />
      <path d="M114 44 H126 M114 52 H126 M114 60 H126 M114 68 H126" stroke={c("ink")} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M96 36 Q100 28 110 26" stroke={c("ink", 0.7)} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <rect x="48" y="96" width="14" height="36" rx="3" fill={c("ice")} stroke={N} strokeWidth="2" />
      <path d="M55 96 V80 M44 80 H66" stroke={N} strokeWidth="4" strokeLinecap="round" />
      <path d="M62 124 Q92 128 118 118" stroke={c("night-100")} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M164 30 V18 M164 18 L158 24 M164 18 L170 24" stroke={c("turf")} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Leaky Defense — a colander with a football falling straight through. */
function Colander() {
  const holes: [number, number][] = [
    [74, 70], [90, 72], [106, 72], [122, 70], [82, 84], [98, 86], [114, 84], [90, 98], [106, 98],
  ];
  return (
    <g>
      <Shadow y={134} rx={44} />
      <path d="M50 58 H150 Q146 104 100 108 Q54 104 50 58 Z" fill={c("ice")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <ellipse cx="100" cy="58" rx="50" ry="9" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <ellipse cx="100" cy="58" rx="42" ry="6" fill={c("night")} />
      <path d="M50 58 H34 M150 58 H166" stroke={N} strokeWidth="5" strokeLinecap="round" />
      {holes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={c("night")} />
      ))}
      <Football x={100} y={124} rx={13} rot={70} />
      <path d="M84 112 L80 118 M116 112 L120 118 M100 110 V116" stroke={c("ice")} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M100 40 V22 M94 30 L100 22 L106 30" stroke={c("gold")} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Magic Number — a top hat with a 20 card rising out of it. */
function MagicHat() {
  return (
    <g>
      <Shadow y={134} rx={54} />
      <g transform="rotate(-8 100 50)">
        <rect x="80" y="26" width="40" height="52" rx="4" fill={c("ink")} stroke={N} strokeWidth="2" />
        <text x="100" y="60" textAnchor="middle" fontSize="20" fontWeight="900" fill={N} fontFamily={SANS}>
          20
        </text>
      </g>
      <ellipse cx="100" cy="128" rx="54" ry="8" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <path d="M66 74 H134 V124 Q100 132 66 124 Z" fill={c("night-100")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="100" cy="74" rx="34" ry="6" fill={c("night")} stroke={N} strokeWidth="2" />
      <rect x="66" y="108" width="68" height="9" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <Sparkle x={54} y={50} r={8} fill={c("gold")} />
      <Sparkle x={150} y={40} r={6} />
      <Sparkle x={144} y={84} r={4} fill={c("gold")} />
    </g>
  );
}

/** Turf War — a tug of war across grass on one side and striped turf on the other. */
function TugOfWar() {
  return (
    <g>
      <path d="M10 118 H100 V140 H10 Z" fill={c("turf")} />
      <path d="M100 118 H190 V140 H100 Z" fill={c("turf-dim")} />
      <path d="M112 118 V140 M128 118 V140 M144 118 V140 M160 118 V140 M176 118 V140" stroke={c("ink", 0.4)} strokeWidth="2" />
      <path d="M20 118 L24 110 M30 118 L32 108 M44 118 L40 110 M60 118 L64 110 M76 118 L74 108" stroke={c("turf-dim")} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M100 118 V40" stroke={c("ink", 0.5)} strokeWidth="2" strokeDasharray="5 5" />
      <path d="M14 84 Q100 96 186 84" stroke={N} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M14 84 Q100 96 186 84" stroke={c("gold-dim")} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M100 90 L94 112 L106 112 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <Football x={44} y={66} rx={14} rot={-20} />
      <Football x={156} y={66} rx={14} rot={20} />
      <text x="46" y="40" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("turf")} fontFamily={MONO}>
        GRASS
      </text>
      <text x="154" y="40" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("ice")} fontFamily={MONO}>
        TURF
      </text>
    </g>
  );
}

/** Sweater Weather — a knitted sweater with a football on the chest. */
function Sweater() {
  return (
    <g>
      <Shadow y={134} rx={58} />
      <path
        d="M70 30 L86 26 Q100 38 114 26 L130 30 L162 62 L146 80 L136 70 V128 H64 V70 L54 80 L38 62 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M86 26 Q100 44 114 26" stroke={N} strokeWidth="2" fill={c("turf-dim")} />
      <path d="M64 118 H136 M64 122 H136" stroke={c("turf-dim")} strokeWidth="2.4" />
      <path d="M140 74 L150 64 M60 74 L50 64" stroke={c("turf-dim")} strokeWidth="2.4" />
      <path d="M70 58 H130" stroke={c("ink", 0.85)} strokeWidth="3" strokeDasharray="4 4" />
      <path d="M70 104 H130" stroke={c("ink", 0.85)} strokeWidth="3" strokeDasharray="4 4" />
      <Football x={100} y={82} rx={16} />
      <path d={starPath(170, 26, 6, 8, 3, 0)} fill={c("ice")} />
      <path d={starPath(30, 34, 6, 6, 2.5, 30)} fill={c("ice")} />
    </g>
  );
}

/** Journeyman — a suitcase covered in travel stickers. */
function Suitcase() {
  return (
    <g>
      <Shadow y={134} rx={60} />
      <path d="M84 50 V38 Q84 32 90 32 H110 Q116 32 116 38 V50" fill="none" stroke={N} strokeWidth="6" />
      <path d="M84 50 V38 Q84 32 90 32 H110 Q116 32 116 38 V50" fill="none" stroke={c("gold-dim")} strokeWidth="3" />
      <rect x="40" y="48" width="120" height="78" rx="8" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" />
      <path d="M40 74 H160" stroke={N} strokeWidth="2" />
      <rect x="92" y="68" width="16" height="12" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="1.6" />
      <circle cx="66" cy="98" r="13" fill={c("ice")} stroke={N} strokeWidth="1.8" />
      <rect x="112" y="88" width="34" height="22" rx="4" fill={c("turf")} stroke={N} strokeWidth="1.8" transform="rotate(-10 129 99)" />
      <path d="M118 98 H140" stroke={N} strokeWidth="1.6" transform="rotate(-10 129 99)" />
      <Football x={66} y={98} rx={8} />
      <path d={starPath(138, 58, 5, 7, 3, -90)} fill={c("ink")} stroke={N} strokeWidth="1" />
      <circle cx="56" cy="128" r="5" fill={c("night-100")} stroke={N} strokeWidth="1.6" />
      <circle cx="144" cy="128" r="5" fill={c("night-100")} stroke={N} strokeWidth="1.6" />
    </g>
  );
}

/** Fast Start — sprint starting blocks, a football on the line, a GO flag. */
function StartingBlocks() {
  return (
    <g>
      <path d="M10 120 H190 V140 H10 Z" fill={c("gold-dim", 0.6)} />
      <path d="M10 120 H190" stroke={c("ink")} strokeWidth="3" />
      <rect x="60" y="112" width="70" height="8" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="1.8" />
      <path d="M68 112 L80 92 L92 112 Z" fill={c("ice")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M100 112 L112 88 L124 112 Z" fill={c("ice")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <Football x={150} y={108} rx={14} />
      <path d="M128 100 H116 M130 108 H120" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M40 120 V30" stroke={N} strokeWidth="3" />
      <path d="M40 30 H76 L68 42 L76 54 H40 Z" fill={c("turf")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <text x="56" y="47" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={SANS}>
        GO
      </text>
    </g>
  );
}

/** Tier List — a four-tier cake, the top tier gold. */
function TierCake() {
  const tiers: [number, number, string][] = [
    [96, 80, "ice"],
    [76, 64, "turf"],
    [58, 48, "ink-soft"],
    [42, 32, "gold"],
  ];
  return (
    <g>
      <Shadow y={134} rx={58} />
      <ellipse cx="100" cy="128" rx="58" ry="7" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      {tiers.map(([y, w, t], i) => (
        <g key={i}>
          <rect x={100 - w / 2} y={y} width={w} height={i === 0 ? 30 : 18} rx="4" fill={c(t)} stroke={N} strokeWidth="2" />
          <text x={100} y={y + (i === 0 ? 20 : 13)} textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
            {4 - i}
          </text>
        </g>
      ))}
      <path d="M100 42 V28" stroke={N} strokeWidth="2.4" />
      <path d={starPath(100, 22, 5, 9, 4, -90)} fill={c("gold")} stroke={N} strokeWidth="1.4" />
      <Sparkle x={150} y={40} r={6} />
    </g>
  );
}

/** Fortress — a castle keep with a football flag on top. */
function Castle() {
  return (
    <g>
      <Shadow y={134} rx={66} />
      <path d="M40 132 V66 H52 V58 H62 V66 H72 V58 H82 V66 H92 V132 Z" fill={c("ink-muted")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M108 132 V66 H118 V58 H128 V66 H138 V58 H148 V66 H160 V132 Z" fill={c("ink-muted")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M78 132 V50 H88 V42 H98 V50 H102 V42 H112 V50 H122 V132 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M88 132 V108 Q100 94 112 108 V132 Z" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <rect x="94" y="64" width="12" height="18" rx="6" fill={c("night")} stroke={N} strokeWidth="1.6" />
      <path d="M100 42 V16" stroke={N} strokeWidth="2.4" />
      <path d="M100 16 H128 L122 24 L128 32 H100 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <Football x={112} y={24} rx={6} />
      <path d="M52 80 H62 M136 80 H146" stroke={N} strokeWidth="2" />
    </g>
  );
}

/** The Median Game — a seesaw balanced on its middle point. */
function Seesaw() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <path d="M84 132 L100 98 L116 132 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="22" y="90" width="156" height="9" rx="4" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <circle cx="100" cy="94.5" r="4" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      <Football x={44} y={80} rx={14} />
      <Football x={68} y={82} rx={10} />
      <Football x={146} y={76} rx={18} />
      <path d="M100 86 V30" stroke={c("gold")} strokeWidth="2.4" strokeDasharray="4 4" />
      <rect x="82" y="18" width="36" height="16" rx="4" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <text x="100" y="30" textAnchor="middle" fontSize="8" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        MID
      </text>
    </g>
  );
}

/** Revenge Game — a boomerang curving back to where it was thrown from. */
function Boomerang() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <path d="M40 112 Q60 28 140 40 Q172 46 160 74" stroke={c("ink-muted")} strokeWidth="2.4" strokeDasharray="5 6" fill="none" />
      <path d="M156 70 L160 80 L168 72" stroke={c("ink-muted")} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(-20 100 96)">
        <path d="M60 92 Q100 58 140 92 Q132 104 122 98 Q100 80 78 98 Q68 104 60 92 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M74 88 Q100 68 126 88" stroke={c("gold")} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <Football x={50} y={118} rx={13} rot={-14} />
      <path d={starPath(160, 30, 6, 10, 4, 0)} fill={c("gold")} stroke={N} strokeWidth="1.2" />
    </g>
  );
}

/** Bounce Back — a coiled spring launching a football. */
function Spring() {
  const coil = Array.from({ length: 6 }, (_, i) => `M76 ${126 - i * 8} Q100 ${120 - i * 8} 124 ${126 - i * 8}`).join(" ");
  return (
    <g>
      <Shadow y={134} rx={40} />
      <rect x="66" y="126" width="68" height="8" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="1.8" />
      <path d={coil} stroke={N} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={coil} stroke={c("ice")} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="70" y="76" width="60" height="8" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="1.8" />
      <Football x={112} y={34} rx={18} rot={-30} />
      <path d="M92 58 L84 70 M108 60 L106 72 M124 58 L130 70" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 112 V58 M34 66 L40 58 L46 66" stroke={c("turf")} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** First to 100 — a speedometer with the needle at 100. */
function Speedometer() {
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = Math.PI + (i * Math.PI) / 5;
    return `M${r1(100 + 46 * Math.cos(a))} ${r1(104 + 46 * Math.sin(a))} L${r1(100 + 56 * Math.cos(a))} ${r1(104 + 56 * Math.sin(a))}`;
  });
  return (
    <g>
      <Shadow y={132} rx={66} />
      <path d="M36 104 A64 64 0 0 1 164 104 Z" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <path d="M48 104 A52 52 0 0 1 152 104" fill="none" stroke={c("turf")} strokeWidth="6" />
      <path d="M134 66 A52 52 0 0 1 152 104" fill="none" stroke={c("gold")} strokeWidth="6" />
      <path d={ticks.join(" ")} stroke={c("ink")} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M100 104 L142 74" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M100 104 L142 74" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="104" r="8" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <rect x="76" y="112" width="48" height="18" rx="4" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <text x="100" y="125.5" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={MONO}>
        100
      </text>
      <Sparkle x={160} y={50} r={6} fill={c("gold")} />
    </g>
  );
}

/** Elevator — open elevator doors, the up arrow lit, a football riding up. */
function Elevator() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <rect x="54" y="30" width="92" height="102" rx="4" fill={c("ink-muted")} stroke={N} strokeWidth="2.4" />
      <rect x="64" y="44" width="72" height="88" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <path d="M64 44 H80 V132 H64 Z M120 44 H136 V132 H120 Z" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" />
      <Football x={100} y={92} rx={16} rot={-8} />
      <rect x="80" y="18" width="40" height="16" rx="3" fill={c("night")} stroke={N} strokeWidth="1.8" />
      <path d="M100 22 L108 30 H92 Z" fill={c("turf")} />
      <circle cx="160" cy="84" r="8" fill={c("turf")} stroke={N} strokeWidth="2" />
      <path d="M156 86 L160 80 L164 86" stroke={N} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="160" cy="104" r="8" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
    </g>
  );
}

/** Mr. Steady — a spirit level with its bubble dead centre. */
function SpiritLevel() {
  return (
    <g>
      <Shadow y={132} rx={74} />
      <rect x="24" y="78" width="152" height="34" rx="6" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      <rect x="76" y="86" width="48" height="18" rx="9" fill={c("turf", 0.55)} stroke={N} strokeWidth="2" />
      <ellipse cx="100" cy="95" rx="8" ry="5" fill={c("ink")} />
      <path d="M92 86 V104 M108 86 V104" stroke={N} strokeWidth="1.8" />
      <circle cx="44" cy="95" r="6" fill={c("night-100")} stroke={N} strokeWidth="1.6" />
      <circle cx="156" cy="95" r="6" fill={c("night-100")} stroke={N} strokeWidth="1.6" />
      <Football x={100} y={58} rx={20} />
      <path d="M60 40 H140" stroke={c("ink-muted")} strokeWidth="2.4" strokeDasharray="5 5" />
    </g>
  );
}

// ── Batch 3 (2026-10-05) ─────────────────────────────────────────

/** Garbage Time — a trash can with its lid knocked off, a football and a crumpled stat sheet spilling out, the 4th quarter on the clock. */
function TrashCan() {
  return (
    <g>
      <Shadow y={134} rx={58} />
      <path d="M58 62 H142 L132 130 H68 Z" fill={c("ink-muted")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M80 72 L84 122 M100 72 V122 M120 72 L116 122" stroke={N} strokeWidth="1.8" opacity="0.55" />
      <rect x="54" y="56" width="92" height="9" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      <path d="M70 58 L76 44 L86 50 L94 40 L102 52 L96 58 Z" fill={c("ink")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M80 50 L90 54 M88 44 L94 50" stroke={N} strokeWidth="1.2" opacity="0.6" />
      <Football x={120} y={48} rx={15} rot={-24} />
      <g transform="rotate(24 168 104)">
        <rect x="140" y="98" width="56" height="10" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
        <path d="M160 98 Q168 88 176 98" fill="none" stroke={N} strokeWidth="2.4" />
      </g>
      <rect x="18" y="20" width="46" height="24" rx="4" fill={c("night")} stroke={N} strokeWidth="2" />
      <text x="41" y="37" textAnchor="middle" fontSize="12" fontWeight="900" fill={c("ice")} fontFamily={MONO}>
        4TH
      </text>
      <path d="M150 54 q6 -6 0 -12 q-6 -6 0 -12 M164 60 q6 -6 0 -12 q-6 -6 0 -12" fill="none" stroke={c("ink-muted")} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** Crunch Time — the game clock at 0:08 and a football squeezed in a vise. */
function CrunchClock() {
  return (
    <g>
      <Shadow y={134} rx={66} />
      <rect x="18" y="16" width="80" height="40" rx="6" fill={c("night")} stroke={N} strokeWidth="2.4" />
      <rect x="24" y="22" width="68" height="28" rx="3" fill={c("night-100")} />
      <text x="58" y="44" textAnchor="middle" fontSize="22" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        0:08
      </text>
      <rect x="66" y="112" width="100" height="18" rx="3" fill={c("ink-muted")} stroke={N} strokeWidth="2.2" />
      <rect x="78" y="72" width="22" height="42" rx="2" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      <rect x="132" y="72" width="22" height="42" rx="2" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      <path d="M154 93 H178 M178 80 V106" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M154 93 H178 M178 80 V106" stroke={c("gold-dim")} strokeWidth="2.4" strokeLinecap="round" />
      <g transform="translate(116 92) scale(0.75 1.25)">
        <Football x={0} y={0} rx={22} />
      </g>
      <path d="M104 66 L108 72 M116 62 V70 M128 66 L124 72" stroke={c("gold")} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Manager of the Week — a #1 mug with a crown on it, still steaming. */
function Mug() {
  return (
    <g>
      <Shadow y={134} rx={54} />
      <path d="M128 68 Q156 68 156 90 Q156 112 128 112" fill="none" stroke={N} strokeWidth="10" />
      <path d="M128 68 Q156 68 156 90 Q156 112 128 112" fill="none" stroke={c("turf")} strokeWidth="5" />
      <path d="M52 54 H132 V118 Q132 130 120 130 H64 Q52 130 52 118 Z" fill={c("turf")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <ellipse cx="92" cy="54" rx="40" ry="7" fill={c("night")} stroke={N} strokeWidth="2.2" />
      <path d="M74 96 L78 74 L86 84 L92 68 L98 84 L106 74 L110 96 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <text x="92" y="120" textAnchor="middle" fontSize="17" fontWeight="900" fill={N} fontFamily={SANS}>
        #1
      </text>
      <path d="M76 42 q-6 -7 0 -14 q6 -7 0 -14 M92 40 q-6 -7 0 -14 q6 -7 0 -14 M108 42 q-6 -7 0 -14 q6 -7 0 -14" fill="none" stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Left on the Board — a draft board with its last slots empty, and the one card nobody took. */
function DraftBoard() {
  const cells = [0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((col) => ({ r, col })));
  return (
    <g>
      <Shadow y={134} rx={72} />
      <rect x="18" y="18" width="128" height="104" rx="5" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <rect x="18" y="18" width="128" height="16" rx="5" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <text x="82" y="30" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        DRAFT
      </text>
      {cells.map(({ r, col }) => {
        const x = 26 + col * 29;
        const y = 42 + r * 26;
        return r < 2 || col < 2 ? (
          <g key={`${r}-${col}`}>
            <rect x={x} y={y} width="24" height="20" rx="2" fill={c(r === 0 ? "ice" : "turf")} stroke={N} strokeWidth="1.6" />
            <path d={`M${x + 4} ${y + 7} H${x + 20} M${x + 4} ${y + 13} H${x + 14}`} stroke={N} strokeWidth="1.6" />
          </g>
        ) : (
          <rect key={`${r}-${col}`} x={x} y={y} width="24" height="20" rx="2" fill="none" stroke={c("ink-muted")} strokeWidth="1.6" strokeDasharray="3 3" />
        );
      })}
      <g transform="rotate(12 168 92)">
        <rect x="150" y="68" width="36" height="46" rx="3" fill={c("gold")} stroke={N} strokeWidth="2.2" />
        <path d={starPath(168, 86, 5, 10, 4.2, -90)} fill={N} />
        <path d="M156 102 H180 M156 108 H172" stroke={N} strokeWidth="1.8" />
      </g>
    </g>
  );
}

/** Two Weeks Off — a beach umbrella and a deckchair, a ball in the sand, and 15 days on the calendar. */
function BeachUmbrella() {
  return (
    <g>
      <path d="M0 116 Q100 104 200 116 V150 H0 Z" fill={c("gold-dim", 0.7)} />
      <path d="M96 46 L104 124" stroke={N} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M30 62 Q84 0 156 42 Q140 40 128 50 Q114 44 100 54 Q84 48 72 58 Q54 52 30 62 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M72 58 Q76 30 96 18 M100 54 Q108 28 116 22 M128 50 Q132 36 132 28" fill="none" stroke={N} strokeWidth="1.6" opacity="0.5" />
      <path d="M70 126 L86 96 M86 96 L116 126 M80 112 L122 112" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M84 92 Q96 108 112 120" fill="none" stroke={N} strokeWidth="9" strokeLinecap="round" />
      <path d="M84 92 Q96 108 112 120" fill="none" stroke={c("turf")} strokeWidth="5" strokeLinecap="round" />
      <Football x={44} y={124} rx={13} rot={-14} />
      <rect x="148" y="68" width="38" height="40" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <rect x="148" y="68" width="38" height="11" rx="4" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="167" y="101" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
        15
      </text>
    </g>
  );
}

/** Fresh Legs — a winged cleat at full speed, chasing a football. */
function WingedShoes() {
  return (
    <g>
      <Shadow y={132} rx={60} />
      <path d="M58 76 Q38 40 14 42 Q26 50 24 56 Q36 56 36 62 Q46 64 48 70 Z" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 70 Q34 56 22 52 M44 64 Q36 58 30 58" fill="none" stroke={N} strokeWidth="1.4" opacity="0.6" />
      <path d="M42 98 Q44 76 62 74 L84 74 Q92 86 106 90 L142 96 Q154 100 152 112 H46 Q40 112 42 98 Z" fill={c("turf")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M86 80 L80 90 M94 84 L88 94 M102 88 L96 98" stroke={N} strokeWidth="2" strokeLinecap="round" />
      <rect x="46" y="112" width="106" height="7" rx="2" fill={c("night")} stroke={N} strokeWidth="1.8" />
      <path d="M58 119 V125 M80 119 V125 M114 119 V125 M138 119 V125" stroke={N} strokeWidth="4" strokeLinecap="round" />
      <path d="M8 88 H30 M4 100 H32 M12 112 H36" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" />
      <Football x={172} y={56} rx={15} rot={-24} />
    </g>
  );
}

/** On the Shelf — a bandaged football sitting on a shelf with an ice pack on its head, an OUT tag hanging below. */
function Shelf() {
  return (
    <g>
      <rect x="26" y="96" width="148" height="9" rx="2" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" />
      <path d="M50 105 V126 L70 105 M150 105 V126 L130 105" fill="none" stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <Football x={100} y={83} rx={22} />
      <rect x="88" y="78" width="24" height="8" rx="1.5" fill={c("ink")} stroke={N} strokeWidth="1.3" transform="rotate(32 100 82)" />
      <rect x="88" y="78" width="24" height="8" rx="1.5" fill={c("ink")} stroke={N} strokeWidth="1.3" transform="rotate(-32 100 82)" />
      <rect x="84" y="52" width="32" height="16" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" transform="rotate(-8 100 60)" />
      <path d="M92 60 H108 M100 54 V66" stroke={c("ink")} strokeWidth="1.8" transform="rotate(-8 100 60)" />
      <path d="M146 105 V114" stroke={N} strokeWidth="1.6" />
      <rect x="130" y="114" width="32" height="18" rx="3" fill={c("ink")} stroke={N} strokeWidth="2" />
      <text x="146" y="127" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        OUT
      </text>
    </g>
  );
}

/** Above Replacement — a spare tyre at the replacement line, and a football on a bar far above it. */
function SpareTire() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <circle cx="58" cy="104" r="28" fill={c("night")} stroke={N} strokeWidth="2.4" />
      <circle cx="58" cy="104" r="23" fill="none" stroke={c("ink-soft")} strokeWidth="3" strokeDasharray="4 4" />
      <circle cx="58" cy="104" r="13" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <circle cx="58" cy="104" r="4" fill={N} />
      <path d="M22 76 H186" stroke={c("ink-muted")} strokeWidth="2.2" strokeDasharray="6 5" />
      <rect x="116" y="40" width="34" height="92" rx="3" fill={c("turf")} stroke={N} strokeWidth="2.4" />
      <Football x={133} y={28} rx={15} />
      <path d="M172 72 V46 M166 52 L172 44 L178 52 M166 66 L172 74 L178 66" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** One-Hit Wonder — a vinyl record with a football on the label and a gold "1" sticker. */
function Vinyl() {
  return (
    <g>
      <Shadow y={136} rx={52} />
      <circle cx="92" cy="78" r="54" fill={c("night")} stroke={N} strokeWidth="2.4" />
      <circle cx="92" cy="78" r="46" fill="none" stroke={c("ink-muted")} strokeWidth="1.2" opacity="0.55" />
      <circle cx="92" cy="78" r="38" fill="none" stroke={c("ink-muted")} strokeWidth="1.2" opacity="0.55" />
      <circle cx="92" cy="78" r="30" fill="none" stroke={c("ink-muted")} strokeWidth="1.2" opacity="0.55" />
      <path d="M58 50 Q70 38 86 34" fill="none" stroke={c("ink")} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
      <circle cx="92" cy="78" r="19" fill={c("gold")} stroke={N} strokeWidth="2" />
      <Football x={92} y={78} rx={11} />
      <path d={starPath(158, 38, 8, 22, 15, -90)} fill={c("turf")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <text x="158" y="46" textAnchor="middle" fontSize="22" fontWeight="900" fill={N} fontFamily={SANS}>
        1
      </text>
    </g>
  );
}

/** Growth Chart — a measuring stick on the wall, three season marks climbing, a football standing tall against it. */
function GrowthChart() {
  return (
    <g>
      <Shadow y={134} rx={50} />
      <rect x="78" y="14" width="24" height="120" rx="3" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" />
      <path d="M78 26 H86 M78 38 H90 M78 50 H86 M78 62 H90 M78 74 H86 M78 86 H90 M78 98 H86 M78 110 H90 M78 122 H86" stroke={N} strokeWidth="1.6" />
      <path d="M102 98 H118 M102 82 H118 M102 64 H118" stroke={c("ink")} strokeWidth="3" strokeLinecap="round" />
      <text x="70" y="102" textAnchor="end" fontSize="11" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
        &apos;23
      </text>
      <text x="70" y="86" textAnchor="end" fontSize="11" fontWeight="900" fill={c("ink-soft")} fontFamily={MONO}>
        &apos;24
      </text>
      <text x="70" y="68" textAnchor="end" fontSize="11" fontWeight="900" fill={c("turf")} fontFamily={MONO}>
        &apos;25
      </text>
      <Football x={134} y={100} rx={34} rot={90} />
      <path d="M166 74 V40 M158 48 L166 38 L174 48" fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** A helmet in profile, facing right, for the Face-Off. */
function ProfileHelmet({ x, y, fill, flip = false }: { x: number; y: number; fill: string; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`}>
      <path d="M-30 12 Q-34 -26 0 -30 Q30 -30 32 0 L32 8 L12 8 L10 20 L-22 20 Q-30 18 -30 12 Z" fill={fill} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M-26 -6 Q-10 -24 16 -22" fill="none" stroke={c("ink", 0.55)} strokeWidth="3" strokeLinecap="round" />
      <circle cx="-6" cy="4" r="4" fill={N} />
      <path d="M22 8 V24 H38 M30 8 V24 M22 16 H38" fill="none" stroke={c("ink-soft")} strokeWidth="2.6" strokeLinejoin="round" />
    </g>
  );
}

/** Face-Off — two helmets nose to nose with a spark between them. */
function FaceOff() {
  return (
    <g>
      <Shadow y={128} rx={76} />
      <ProfileHelmet x={56} y={80} fill={c("ice")} />
      <ProfileHelmet x={144} y={80} fill={c("gold")} flip />
      <path d={starPath(100, 58, 8, 14, 6, 0)} fill={c("ink")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M100 30 V38 M84 36 L88 42 M116 36 L112 42" stroke={c("ink")} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Pile-Up — a heap of footballs, six high, with dust flying off it. */
function Pile() {
  const balls: [number, number, number][] = [
    [62, 116, -8],
    [100, 118, 6],
    [138, 116, -4],
    [81, 96, 10],
    [119, 96, -10],
    [100, 76, 4],
  ];
  return (
    <g>
      <Shadow y={132} rx={70} />
      {balls.map(([x, y, rot]) => (
        <Football key={`${x}-${y}`} x={x} y={y} rx={20} rot={rot} />
      ))}
      <path d="M30 104 L22 98 M28 116 L18 116 M170 104 L178 98 M172 116 L182 116" stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
      <path d={starPath(100, 44, 5, 10, 4.2, -90)} fill={c("gold")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={starPath(136, 56, 5, 6, 2.6, -90)} fill={c("ink")} />
      <path d={starPath(64, 58, 5, 6, 2.6, -90)} fill={c("ink")} />
    </g>
  );
}

/** Snooze Fest — a football asleep on a pillow in a nightcap, the Zs rising. */
function Pillow() {
  return (
    <g>
      <Shadow y={130} rx={72} />
      <path d="M28 102 Q26 82 46 86 Q100 76 154 86 Q174 82 172 102 Q174 122 154 118 Q100 128 46 118 Q26 122 28 102 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M46 92 Q60 100 52 112 M154 92 Q140 100 148 112" fill="none" stroke={N} strokeWidth="1.4" opacity="0.4" />
      <Football x={96} y={92} rx={26} rot={-4} />
      <path d="M112 80 Q130 62 152 54 Q144 78 126 96 Z" fill={c("ice")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M118 74 L132 90 M128 64 L140 78" stroke={c("ink", 0.7)} strokeWidth="2.6" />
      <circle cx="154" cy="52" r="6" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      <text x="40" y="62" fontSize="24" fontWeight="900" fill={c("ice")} fontFamily={SANS}>
        Z
      </text>
      <text x="62" y="44" fontSize="17" fontWeight="900" fill={c("ice", 0.8)} fontFamily={SANS}>
        z
      </text>
      <text x="78" y="30" fontSize="12" fontWeight="900" fill={c("ice", 0.6)} fontFamily={SANS}>
        z
      </text>
    </g>
  );
}

/** Turnaround — a U-turn sign, and a football that took it. */
function UTurn() {
  return (
    <g>
      <Shadow y={134} rx={66} />
      <path d="M70 84 V132" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M70 84 V132" stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M70 18 L106 54 L70 90 L34 54 Z" fill={c("gold")} stroke={N} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M60 70 V50 Q60 40 70 40 Q80 40 80 50 V60" fill="none" stroke={N} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M73 58 L80 68 L87 58" fill="none" stroke={N} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128 124 V74 Q128 50 150 50 Q172 50 172 74 V92" fill="none" stroke={c("ink-muted")} strokeWidth="2.4" strokeDasharray="5 5" strokeLinecap="round" />
      <Football x={172} y={106} rx={15} rot={90} />
    </g>
  );
}

/** Pushover — a tackling dummy tipping over at the first touch. */
function TackleDummy() {
  return (
    <g>
      <Shadow y={132} rx={64} />
      <g transform="rotate(28 112 128)">
        <rect x="94" y="40" width="36" height="88" rx="5" fill={c("turf")} stroke={N} strokeWidth="2.4" />
        <path d="M94 66 H130 M94 100 H130" stroke={N} strokeWidth="2.2" />
        <path d="M100 48 V120" stroke={c("ink", 0.4)} strokeWidth="3" strokeLinecap="round" />
        <path d="M130 56 H138 V74 H130 M130 88 H138 V106 H130" fill="none" stroke={N} strokeWidth="2.6" strokeLinejoin="round" />
        <rect x="88" y="124" width="48" height="8" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      </g>
      <path d="M118 30 Q140 20 160 30 M126 18 Q150 6 172 18" fill="none" stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
      <path d={starPath(84, 48, 7, 12, 5, 0)} fill={c("gold")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <Football x={46} y={118} rx={16} rot={-18} />
    </g>
  );
}

/** Round Robin — a round little robin perched on a football, arrows circling. */
function Robin() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <path d="M36 70 A64 54 0 0 1 164 70" fill="none" stroke={c("ink-muted")} strokeWidth="2.6" strokeDasharray="6 5" strokeLinecap="round" />
      <path d="M158 60 L164 72 L172 62" fill="none" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M164 92 A64 40 0 0 1 36 92" fill="none" stroke={c("ink-muted")} strokeWidth="2.6" strokeDasharray="6 5" strokeLinecap="round" />
      <path d="M42 102 L36 90 L28 100" fill="none" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <Football x={100} y={118} rx={30} />
      <path d="M92 100 L90 104 M106 100 L108 104" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M70 66 L52 58 L60 76 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="100" cy="72" r="30" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" />
      <path d="M86 74 Q100 108 122 80 Q118 68 104 70 Q92 70 86 74 Z" fill={c("gold")} />
      <circle cx="112" cy="60" r="5" fill={N} />
      <circle cx="113.5" cy="58.5" r="1.6" fill={c("ink")} />
      <path d="M126 64 L140 68 L126 72 Z" fill={c("gold-dim")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M78 66 Q88 58 98 66" fill="none" stroke={N} strokeWidth="1.8" opacity="0.5" />
    </g>
  );
}

/** Road Trip — a van on the highway, a suitcase and a football on the roof rack. */
function RoadTrip() {
  return (
    <g>
      <rect x="0" y="122" width="200" height="24" fill={c("night-100")} />
      <path d="M8 134 H34 M56 134 H82 M104 134 H130 M152 134 H178" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M46 72 Q46 62 56 62 H126 Q138 62 146 78 L156 92 Q160 98 160 104 V110 Q160 116 154 116 H52 Q46 116 46 110 Z" fill={c("turf")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M58 70 H86 V88 H58 Z M94 70 H120 V88 H94 Z" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <path d="M128 70 L144 90 H128 Z" fill={c("night-100")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 100 H158" stroke={N} strokeWidth="1.6" opacity="0.5" />
      <circle cx="74" cy="116" r="12" fill={c("night")} stroke={N} strokeWidth="2.2" />
      <circle cx="74" cy="116" r="4.5" fill={c("ink-muted")} />
      <circle cx="136" cy="116" r="12" fill={c("night")} stroke={N} strokeWidth="2.2" />
      <circle cx="136" cy="116" r="4.5" fill={c("ink-muted")} />
      <path d="M56 62 V56 H128 V62" fill="none" stroke={N} strokeWidth="2.2" />
      <rect x="62" y="36" width="36" height="20" rx="3" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <path d="M74 36 V32 H86 V36" fill="none" stroke={N} strokeWidth="2" />
      <Football x={116} y={46} rx={13} rot={-8} />
      <path d="M14 82 H34 M8 96 H32" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

/** Halfway There — a progress track filled to the middle, a ½ flag planted there, the finish flag waiting. */
function Halfway() {
  return (
    <g>
      <Shadow y={124} rx={80} />
      <rect x="20" y="100" width="160" height="16" rx="8" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <rect x="20" y="100" width="80" height="16" rx="8" fill={c("turf")} stroke={N} strokeWidth="2.2" />
      <path d="M106 108 H174" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="4 4" />
      <path d="M100 100 V30" stroke={N} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M100 32 H140 L132 46 L140 60 H100 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <text x="116" y="53" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
        ½
      </text>
      <Football x={70} y={86} rx={14} rot={-10} />
      <path d="M40 84 H52 M44 92 H54" stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M178 100 V62" stroke={N} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M178 62 H196 V76 H178 Z" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <path d="M178 62 H184 V69 H178 Z M190 62 H196 V69 H190 Z M184 69 H190 V76 H184 Z" fill={N} />
    </g>
  );
}

/** Cool Down — a desk fan blowing out the flame on a hot football. */
function DeskFan() {
  return (
    <g>
      <Shadow y={132} rx={72} />
      <ellipse cx="56" cy="126" rx="26" ry="6" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <rect x="52" y="96" width="8" height="30" rx="3" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <circle cx="56" cy="64" r="36" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <ellipse cx="56" cy="46" rx="9" ry="16" fill={c("ice")} stroke={N} strokeWidth="1.8" />
      <ellipse cx="56" cy="46" rx="9" ry="16" fill={c("ice")} stroke={N} strokeWidth="1.8" transform="rotate(120 56 64)" />
      <ellipse cx="56" cy="46" rx="9" ry="16" fill={c("ice")} stroke={N} strokeWidth="1.8" transform="rotate(240 56 64)" />
      <circle cx="56" cy="64" r="6" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <path d="M20 64 H92 M56 28 V100 M30.5 38.5 L81.5 89.5 M81.5 38.5 L30.5 89.5" stroke={c("ink-muted")} strokeWidth="1" opacity="0.6" />
      <circle cx="56" cy="64" r="36" fill="none" stroke={N} strokeWidth="2.4" />
      <path d="M100 52 Q116 46 132 52 M100 66 Q118 60 136 66 M100 80 Q116 74 130 80" fill="none" stroke={c("ice")} strokeWidth="2.6" strokeLinecap="round" />
      <g transform="rotate(34 164 88)">
        <Flame x={164} y={88} s={0.5} outer={c("gold")} inner={c("ink")} />
      </g>
      <Football x={162} y={98} rx={20} />
      <path d="M182 72 q4 -6 0 -12 q-4 -6 0 -12" fill="none" stroke={c("ink-muted")} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** Empty Seats — a row of stadium seats, footballs in some, the rest folded up and empty. */
function EmptySeats() {
  const seats = [0, 1, 2, 3, 4];
  const filled = [true, false, true, true, false];
  return (
    <g>
      <rect x="8" y="110" width="184" height="12" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <rect x="8" y="122" width="184" height="12" rx="2" fill={c("ink-soft")} stroke={N} strokeWidth="2" opacity="0.7" />
      {seats.map((i) => {
        const x = 14 + i * 36;
        return filled[i] ? (
          <g key={i}>
            <rect x={x} y="62" width="30" height="40" rx="6" fill={c("turf")} stroke={N} strokeWidth="2.2" />
            <rect x={x - 2} y="98" width="34" height="10" rx="3" fill={c("turf-dim")} stroke={N} strokeWidth="2" />
            <Football x={x + 15} y={88} rx={13} rot={-6} />
          </g>
        ) : (
          <g key={i}>
            <rect x={x} y="62" width="30" height="40" rx="6" fill={c("turf")} stroke={N} strokeWidth="2.2" />
            <rect x={x + 2} y="76" width="26" height="24" rx="4" fill={c("turf-dim")} stroke={N} strokeWidth="2" />
            <rect x={x - 3} y="58" width="36" height="52" rx="7" fill="none" stroke={c("gold")} strokeWidth="2" strokeDasharray="4 3" />
          </g>
        );
      })}
      <path d="M65 40 V30 M65 22 V20" stroke={c("gold")} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M173 40 V30 M173 22 V20" stroke={c("gold")} strokeWidth="3.4" strokeLinecap="round" />
    </g>
  );
}

// ── Python, R and Excel, the long table (2026-10-05) ─────────────

/** A small grid of spreadsheet cells, for the table-shaped scenes. */
function CellGrid({ x, y, cols, rows, w = 22, h = 14, fill = c("ink"), head = c("gold") }: { x: number; y: number; cols: number; rows: number; w?: number; h?: number; fill?: string; head?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={cols * w} height={rows * h} rx="3" fill={fill} stroke={N} strokeWidth="2.2" />
      <rect x={x} y={y} width={cols * w} height={h} rx="3" fill={head} stroke={N} strokeWidth="2" />
      {Array.from({ length: cols - 1 }, (_, i) => (
        <path key={`c${i}`} d={`M${x + (i + 1) * w} ${y} V${y + rows * h}`} stroke={N} strokeWidth="1.2" opacity="0.5" />
      ))}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <path key={`r${i}`} d={`M${x} ${y + (i + 1) * h} H${x + cols * w}`} stroke={N} strokeWidth="1.2" opacity="0.5" />
      ))}
    </g>
  );
}

/** First Look — a table being measured: rows down the side, columns across the top. */
function FirstLook() {
  return (
    <g>
      <Shadow y={134} rx={58} />
      <CellGrid x={58} y={44} cols={5} rows={6} />
      <path d="M44 44 V128 M38 52 L44 44 L50 52 M38 120 L44 128 L50 120" fill="none" stroke={c("ice")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 30 H168 M66 24 L58 30 L66 36 M160 24 L168 30 L160 36" fill="none" stroke={c("ice")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="172" cy="104" rx="16" ry="10" fill={c("ink")} stroke={N} strokeWidth="2" />
      <circle cx="172" cy="104" r="6" fill={c("ice")} stroke={N} strokeWidth="1.6" />
      <circle cx="172" cy="104" r="2.6" fill={N} />
    </g>
  );
}

/** Game of the Year — a gold plaque with a football and a star. */
function GameOfTheYear() {
  return (
    <g>
      <Shadow y={136} rx={52} />
      <path d="M62 30 H138 V94 Q138 120 100 132 Q62 120 62 94 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M72 40 H128 V92 Q128 112 100 122 Q72 112 72 92 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <Football x={100} y={90} rx={20} rot={-12} />
      <path d={starPath(100, 58, 5, 14, 6, -90)} fill={c("ink")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M46 52 L62 56 L62 70 L46 74 L52 63 Z M154 52 L138 56 L138 70 L154 74 L148 63 Z" fill={c("turf")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <Sparkle x={160} y={30} r={6} />
      <Sparkle x={40} y={110} r={5} />
    </g>
  );
}

/** Ten Big Weeks — an 18-week calendar, ten of the boxes on fire. */
function TenBigWeeks() {
  const lit = [0, 2, 3, 5, 7, 9, 10, 12, 15, 17];
  return (
    <g>
      <Shadow y={134} rx={70} />
      <rect x="28" y="30" width="144" height="100" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="28" y="30" width="144" height="16" rx="6" fill={c("gold")} stroke={N} strokeWidth="2" />
      {Array.from({ length: 18 }, (_, i) => {
        const x = 36 + (i % 6) * 22;
        const y = 52 + Math.floor(i / 6) * 25;
        return (
          <g key={i}>
            <rect x={x} y={y} width="18" height="20" rx="2" fill={lit.includes(i) ? c("gold", 0.25) : c("night-100", 0.25)} stroke={N} strokeWidth="1.4" />
            {lit.includes(i) && <Flame x={x + 9} y={y + 16} s={0.3} outer={c("gold")} inner={c("ink")} />}
          </g>
        );
      })}
    </g>
  );
}

/** Team Effort — three arms in a huddle, hands stacked over the ball. */
function HandsIn() {
  return (
    <g>
      <Shadow y={134} rx={64} />
      <path d="M28 128 L84 80" stroke={N} strokeWidth="20" strokeLinecap="round" />
      <path d="M28 128 L84 80" stroke={c("turf")} strokeWidth="14" strokeLinecap="round" />
      <path d="M172 128 L116 80" stroke={N} strokeWidth="20" strokeLinecap="round" />
      <path d="M172 128 L116 80" stroke={c("ice")} strokeWidth="14" strokeLinecap="round" />
      <path d="M100 140 V86" stroke={N} strokeWidth="20" strokeLinecap="round" />
      <path d="M100 140 V86" stroke={c("gold")} strokeWidth="14" strokeLinecap="round" />
      <circle cx="88" cy="76" r="12" fill={c("ink")} stroke={N} strokeWidth="2" />
      <circle cx="112" cy="76" r="12" fill={c("ink")} stroke={N} strokeWidth="2" />
      <circle cx="100" cy="82" r="12" fill={c("ink")} stroke={N} strokeWidth="2" />
      <Football x={100} y={50} rx={18} rot={-8} />
      <path d="M70 34 L64 26 M130 34 L136 26 M100 22 V14" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

/** Three-Game Form — a season of bars with the three-game average running over them. */
function FormLine() {
  const bars = [52, 34, 60, 44, 70, 40, 66, 58, 76];
  return (
    <g>
      <path d="M22 126 H182" stroke={c("ink-muted")} strokeWidth="2.4" />
      {bars.map((hgt, i) => (
        <rect key={i} x={30 + i * 17} y={126 - hgt} width="12" height={hgt} rx="2" fill={i >= 6 ? c("ice") : c("ink-soft")} stroke={N} strokeWidth="1.6" />
      ))}
      <path d="M36 92 Q70 82 96 80 T148 70 T176 62" fill="none" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" />
      <path d="M130 40 H182 M130 40 V46 M182 40 V46" fill="none" stroke={c("ice")} strokeWidth="2.4" strokeLinecap="round" />
      <text x="156" y="34" textAnchor="middle" fontSize="13" fontWeight="900" fill={c("ice")} fontFamily={MONO}>
        3
      </text>
      <circle cx="176" cy="62" r="4" fill={c("gold")} stroke={N} strokeWidth="1.6" />
    </g>
  );
}

/** Change of Address — a moving box with the ball packed in, an arrow to the new place. */
function MovingBox() {
  return (
    <g>
      <Shadow y={134} rx={60} />
      <path d="M40 70 H124 V128 H40 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M40 70 L28 52 H94 L104 70 M124 70 L134 54 H104" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="74" y="70" width="16" height="58" fill={c("ink-soft")} opacity="0.7" />
      <Football x={70} y={60} rx={16} rot={-24} />
      <path d="M142 96 H176 M168 88 L176 96 L168 104" fill="none" stroke={c("ice")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M158 56 L170 44 L182 56 V72 H158 Z" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <rect x="166" y="60" width="8" height="12" fill={c("turf")} stroke={N} strokeWidth="1.4" />
    </g>
  );
}

/** Quarterback Grid — a quarterback beside a players-by-weeks grid. */
function QbGrid() {
  return (
    <g>
      <Shadow y={132} rx={74} />
      <Player x={46} y={130} s={0.92} pose="throw" jersey="ice" label="QB" />
      <CellGrid x={92} y={36} cols={4} rows={5} w={20} h={17} />
      {[0, 1, 2, 3].flatMap((r) =>
        [0, 1, 2, 3].map((col) => (
          <rect key={`${r}-${col}`} x={95 + col * 20} y={56 + r * 17} width="14" height="11" rx="2" fill={(r + col) % 3 === 0 ? c("ice") : c("ink-soft")} opacity="0.85" />
        )),
      )}
    </g>
  );
}

/** Steady Hands — two gloves holding the ball dead level. */
function SteadyHands() {
  return (
    <g>
      <Shadow y={132} rx={56} />
      <path d="M30 116 H170" stroke={c("turf")} strokeWidth="3" strokeDasharray="6 5" />
      <Football x={100} y={78} rx={30} />
      <path d="M52 92 Q48 70 60 64 L74 66 Q80 74 76 92 Q66 104 52 92 Z" fill={c("ink")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M148 92 Q152 70 140 64 L126 66 Q120 74 124 92 Q134 104 148 92 Z" fill={c("ink")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M60 72 H72 M60 79 H73 M128 72 H140 M127 79 H140" stroke={N} strokeWidth="1.4" opacity="0.5" />
      <path d="M86 32 H114 V44 H86 Z" fill={c("turf", 0.5)} stroke={N} strokeWidth="1.8" />
      <ellipse cx="100" cy="38" rx="5" ry="3.4" fill={c("ink")} />
    </g>
  );
}

/** Where Was A.J.? — a map pin with a question mark over an empty spot on the field. */
function WhereWas() {
  return (
    <g>
      <path d="M0 108 L200 108 L200 150 L0 150 Z" fill={c("turf", 0.35)} />
      <path d="M30 108 L20 150 M80 108 L76 150 M130 108 L134 150 M180 108 L190 150" stroke={c("ink", 0.5)} strokeWidth="2" />
      <ellipse cx="100" cy="124" rx="30" ry="9" fill="none" stroke={c("ice")} strokeWidth="2.4" strokeDasharray="5 4" />
      <path d="M100 116 C72 84 72 72 72 62 A28 28 0 0 1 128 62 C128 72 128 84 100 116 Z" fill={c("ice")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="100" cy="62" r="16" fill={c("ink")} stroke={N} strokeWidth="2" />
      <text x="100" y="70" textAnchor="middle" fontSize="22" fontWeight="900" fill={N} fontFamily={SANS}>
        ?
      </text>
    </g>
  );
}

/** Race to 200 — a football at full speed for a finish banner that says 200. */
function RaceTo200() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <path d="M128 132 V36 M182 132 V36" stroke={N} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M126 38 H184 V64 H126 Z" fill={c("turf")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <text x="155" y="58" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
        200
      </text>
      <path d="M128 70 H182" stroke={c("ink")} strokeWidth="3" strokeDasharray="6 4" />
      <Football x={86} y={100} rx={20} rot={-6} />
      <path d="M18 92 H56 M10 104 H58 M22 116 H54" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Best at Each Spot — four podiums, one per position, a star on each. */
function FourSpots() {
  const spots = ["QB", "RB", "WR", "TE"];
  const heights = [62, 48, 56, 40];
  return (
    <g>
      <Shadow y={132} rx={80} />
      {spots.map((s, i) => {
        const x = 22 + i * 40;
        const h = heights[i];
        return (
          <g key={s}>
            <rect x={x} y={130 - h} width="36" height={h} rx="3" fill={i % 2 ? c("ink-soft") : c("gold-dim")} stroke={N} strokeWidth="2.2" />
            <text x={x + 18} y={130 - h + 20} textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={MONO}>
              {s}
            </text>
            <path d={starPath(x + 18, 130 - h - 14, 5, 10, 4.2, -90)} fill={c("gold")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
}

/** Same Last Name — two name tags, both saying BROWN. */
function NameTags() {
  const tag = (x: number, y: number, rot: number, tone: string) => (
    <g transform={`rotate(${rot} ${x + 40} ${y + 30})`}>
      <rect x={x} y={y} width="80" height="58" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <rect x={x} y={y} width="80" height="18" rx="6" fill={tone} stroke={N} strokeWidth="2" />
      <text x={x + 40} y={y + 13} textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        MY NAME IS
      </text>
      <text x={x + 40} y={y + 44} textAnchor="middle" fontSize="15" fontWeight="900" fill={N} fontFamily={SANS}>
        BROWN
      </text>
    </g>
  );
  return (
    <g>
      <Shadow y={132} rx={70} />
      {tag(26, 46, -8, c("ice"))}
      {tag(96, 60, 7, c("turf"))}
      <path d="M96 28 L104 36 M110 22 V34 M124 28 L116 36" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

/** Position Count — a chalkboard of tally marks by position. */
function TallyMarks() {
  const rows: [string, number][] = [["QB", 4], ["RB", 5], ["TE", 3], ["WR", 8]];
  return (
    <g>
      <Shadow y={136} rx={70} />
      <rect x="22" y="22" width="156" height="108" rx="6" fill={c("night-100")} stroke={N} strokeWidth="2.6" />
      <rect x="28" y="28" width="144" height="96" rx="3" fill="none" stroke={c("gold-dim")} strokeWidth="2" />
      {rows.map(([label, n], r) => {
        const y = 48 + r * 22;
        return (
          <g key={label}>
            <text x="40" y={y + 5} fontSize="12" fontWeight="900" fill={c("turf")} fontFamily={MONO}>
              {label}
            </text>
            {Array.from({ length: n }, (_, i) => {
              const group = Math.floor(i / 5);
              const inGroup = i % 5;
              const x = 72 + group * 44 + inGroup * 7;
              return inGroup === 4 ? (
                <path key={i} d={`M${x - 30} ${y + 4} L${x + 2} ${y - 8}`} stroke={c("ink")} strokeWidth="2.4" strokeLinecap="round" />
              ) : (
                <path key={i} d={`M${x} ${y - 8} V${y + 6}`} stroke={c("ink")} strokeWidth="2.4" strokeLinecap="round" />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Rate, Not Total — a football over a calendar: points divided by games. */
function PerGame() {
  return (
    <g>
      <Shadow y={136} rx={46} />
      <Football x={100} y={36} rx={22} />
      <path d="M58 66 H142" stroke={c("ink")} strokeWidth="5" strokeLinecap="round" />
      <rect x="74" y="80" width="52" height="46" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <rect x="74" y="80" width="52" height="12" rx="4" fill={c("ice")} stroke={N} strokeWidth="2" />
      <path d="M82 102 H118 M82 112 H118 M94 92 V126 M106 92 V126" stroke={N} strokeWidth="1.2" opacity="0.5" />
      <path d="M86 76 V84 M114 76 V84" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="160" cy="58" r="3.6" fill={c("ice")} />
      <circle cx="160" cy="74" r="3.6" fill={c("ice")} />
      <path d="M150 66 H170" stroke={c("ice")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Single-Game High — a row of short bars and one towering one with a star. */
function TallBar() {
  const bars = [28, 36, 22, 104, 32, 40, 26];
  return (
    <g>
      <path d="M20 128 H180" stroke={c("ink-muted")} strokeWidth="2.4" />
      {bars.map((h, i) => (
        <rect key={i} x={28 + i * 22} y={128 - h} width="16" height={h} rx="2" fill={i === 3 ? c("gold") : c("ink-soft")} stroke={N} strokeWidth="1.8" />
      ))}
      <path d={starPath(102, 12, 5, 10, 4.2, -90)} fill={c("gold")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <Football x={102} y={36} rx={10} rot={-16} />
    </g>
  );
}

/** Steady or Streaky — a flat line and a zigzag, side by side. */
function SteadyStreaky() {
  return (
    <g>
      <path d="M18 54 H182" stroke={c("turf")} strokeWidth="4" strokeLinecap="round" />
      <Football x={100} y={44} rx={13} />
      <path d="M18 112 L38 84 L56 126 L76 80 L96 120 L116 76 L136 128 L156 86 L182 118" fill="none" stroke={c("ice")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="54" r="4" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <circle cx="182" cy="54" r="4" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <circle cx="18" cy="112" r="4" fill={c("ice")} stroke={N} strokeWidth="1.6" />
      <circle cx="182" cy="118" r="4" fill={c("ice")} stroke={N} strokeWidth="1.6" />
    </g>
  );
}

/** Label Every Game — three footballs, each with a tag hanging off it. */
function GameTags() {
  const balls: [number, string][] = [[46, c("turf")], [100, c("gold")], [154, c("ink-muted")]];
  return (
    <g>
      <Shadow y={134} rx={74} />
      {balls.map(([x, tone], i) => (
        <g key={i}>
          <Football x={x} y={60} rx={20} rot={i === 1 ? -6 : 8} />
          <path d={`M${x + 10} ${68} Q${x + 14} ${84} ${x + 6} ${96}`} fill="none" stroke={c("ink")} strokeWidth="1.6" />
          <path d={`M${x - 10} ${96} H${x + 22} V${122} H${x - 10} L${x - 18} ${109} Z`} fill={tone} stroke={N} strokeWidth="2" strokeLinejoin="round" />
          <circle cx={x - 8} cy={109} r="2.4" fill={N} />
          <path d={`M${x - 2} ${104} H${x + 16} M${x - 2} ${112} H${x + 10}`} stroke={N} strokeWidth="1.8" />
        </g>
      ))}
    </g>
  );
}

/** First to 300 — blocks stacking up a staircase to a flag marked 300. */
function StackedBlocks() {
  return (
    <g>
      <Shadow y={134} rx={74} />
      {[0, 1, 2, 3, 4].flatMap((i) =>
        Array.from({ length: i + 1 }, (_, j) => (
          <rect key={`${i}-${j}`} x={30 + i * 26} y={110 - j * 20} width="24" height="18" rx="2" fill={j === i ? c("turf") : c("ink-soft")} stroke={N} strokeWidth="1.8" />
        )),
      )}
      <path d="M154 30 V130" stroke={N} strokeWidth="3" strokeLinecap="round" />
      <path d="M154 32 H194 L186 44 L194 56 H154 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <text x="168" y="49" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={SANS}>
        300
      </text>
      <Football x={138} y={20} rx={11} rot={-20} />
    </g>
  );
}

/** Biggest Jump — a football leaping from a low block to a high one. */
function Leap() {
  return (
    <g>
      <Shadow y={134} rx={74} />
      <rect x="22" y="104" width="40" height="28" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      <rect x="140" y="56" width="40" height="76" rx="3" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <path d="M44 100 Q86 8 158 50" fill="none" stroke={c("ink-muted")} strokeWidth="2.6" strokeDasharray="6 5" strokeLinecap="round" />
      <Football x={112} y={30} rx={17} rot={22} />
      <path d="M150 44 L158 50 L148 54" fill="none" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M168 66 V48 M162 54 L168 46 L174 54" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Team Totals — three pennants on poles of different heights. */
function Pennants() {
  const flags: [number, number, string][] = [[52, 66, c("ice")], [100, 30, c("gold")], [148, 50, c("turf")]];
  return (
    <g>
      <Shadow y={134} rx={74} />
      {flags.map(([x, top, tone], i) => (
        <g key={i}>
          <path d={`M${x} ${top} V132`} stroke={N} strokeWidth="3.4" strokeLinecap="round" />
          <path d={`M${x} ${top + 2} L${x + 40} ${top + 14} L${x} ${top + 26} Z`} fill={tone} stroke={N} strokeWidth="2" strokeLinejoin="round" />
          <path d={`M${x + 6} ${top + 14} H${x + 22}`} stroke={N} strokeWidth="1.8" opacity="0.5" />
        </g>
      ))}
      <path d="M30 132 H170" stroke={c("ink-muted")} strokeWidth="2.4" />
    </g>
  );
}

/** Above His Average — dots over a dashed average line, the ball bouncing above it. */
function AboveLine() {
  const dots: [number, number][] = [[30, 70], [48, 96], [66, 60], [84, 104], [102, 64], [120, 58], [138, 100], [156, 66], [174, 62]];
  return (
    <g>
      <path d="M18 84 H182" stroke={c("ink-muted")} strokeWidth="2.4" strokeDasharray="7 5" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill={y < 84 ? c("turf") : c("ink-soft")} stroke={N} strokeWidth="1.8" />
      ))}
      <path d="M60 128 Q82 92 100 30 Q118 92 140 128" fill="none" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="3 5" />
      <Football x={100} y={26} rx={14} rot={-10} />
      <path d="M188 64 V44 M182 50 L188 42 L194 50" fill="none" stroke={c("turf")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Add It Up — an adding machine, its paper tape curling up with a total. */
function AddingMachine() {
  return (
    <g>
      <Shadow y={134} rx={60} />
      <path d="M86 56 V18 Q86 10 96 12 L120 16 Q128 18 126 26 L122 56" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M94 24 H116 M94 32 H114 M94 40 H116" stroke={N} strokeWidth="1.6" opacity="0.5" />
      <path d="M92 48 H118" stroke={N} strokeWidth="2.4" />
      <rect x="48" y="54" width="104" height="76" rx="8" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" />
      <rect x="58" y="62" width="84" height="16" rx="3" fill={c("night")} stroke={N} strokeWidth="1.8" />
      <text x="136" y="75" textAnchor="end" fontSize="12" fontWeight="900" fill={c("ice")} fontFamily={MONO}>
        Σ
      </text>
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2, 3].map((col) => (
          <rect key={`${r}-${col}`} x={60 + col * 21} y={86 + r * 14} width="16" height="10" rx="2" fill={col === 3 ? c("ice") : c("ink")} stroke={N} strokeWidth="1.4" />
        )),
      )}
    </g>
  );
}

/** Middle of the Pack — five footballs in a row, the middle one lit. */
function MiddleBall() {
  const xs = [28, 64, 100, 136, 172];
  return (
    <g>
      <Shadow y={116} rx={86} />
      {xs.map((x, i) => (
        <Football key={x} x={x} y={92} rx={i === 2 ? 20 : 15} fill={i === 2 ? c("gold") : c("gold-dim")} rot={i === 2 ? 0 : i < 2 ? -10 : 10} />
      ))}
      <path d="M100 30 V58 M92 50 L100 60 L108 50" fill="none" stroke={c("ice")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 124 V130 H172 V124 M100 130 V136" fill="none" stroke={c("ink-muted")} strokeWidth="2" />
    </g>
  );
}

/** Elite or Not — a rubber stamp, and the card it just stamped ELITE. */
function Stamp() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="34" y="72" width="104" height="58" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.2" transform="rotate(-4 86 101)" />
      <g transform="rotate(-10 86 102)">
        <rect x="46" y="88" width="80" height="28" rx="4" fill="none" stroke={c("turf")} strokeWidth="3" />
        <text x="86" y="109" textAnchor="middle" fontSize="17" fontWeight="900" fill={c("turf")} fontFamily={SANS}>
          ELITE
        </text>
      </g>
      <rect x="132" y="56" width="44" height="14" rx="3" fill={c("ink-muted")} stroke={N} strokeWidth="2" transform="rotate(18 154 63)" />
      <path d="M150 50 L160 24" stroke={N} strokeWidth="10" strokeLinecap="round" />
      <path d="M150 50 L160 24" stroke={c("gold-dim")} strokeWidth="6" strokeLinecap="round" />
      <circle cx="162" cy="18" r="10" fill={c("gold")} stroke={N} strokeWidth="2" />
    </g>
  );
}

/** Silver Medal — a medal on a ribbon with a 2 on it. */
function SilverMedal() {
  return (
    <g>
      <Shadow y={136} rx={40} />
      <path d="M72 14 L92 70 H108 L128 14 H108 L100 40 L92 14 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="100" cy="96" r="32" fill={c("ink-soft")} stroke={N} strokeWidth="2.6" />
      <circle cx="100" cy="96" r="24" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <text x="100" y="106" textAnchor="middle" fontSize="28" fontWeight="900" fill={N} fontFamily={SANS}>
        2
      </text>
      <Sparkle x={138} y={74} r={6} />
    </g>
  );
}

/** Riley's Backfield — a running back in front of the play drawn on the board. */
function Backfield() {
  return (
    <g>
      <Shadow y={132} rx={70} />
      <rect x="84" y="20" width="98" height="78" rx="5" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <path d="M100 76 L108 84 M108 76 L100 84 M150 40 L158 48 M158 40 L150 48" stroke={c("ink")} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="128" cy="80" r="6" fill="none" stroke={c("turf")} strokeWidth="2.6" />
      <path d="M128 72 Q126 52 146 50 Q160 48 170 34" fill="none" stroke={c("turf")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M164 34 L171 32 L170 40" fill="none" stroke={c("turf")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <Player x={52} y={130} s={0.92} pose="stand" jersey="turf" label="RB" />
      <Football x={72} y={92} rx={10} rot={30} />
    </g>
  );
}

/** Top Receiver — a receiver making the catch, wearing a crown. */
function CrownedReceiver() {
  return (
    <g>
      <Shadow y={132} rx={52} />
      <Player x={100} y={130} s={1} pose="catch" jersey="gold" label="WR" />
      <path d="M86 18 L90 6 L96 14 L100 2 L104 14 L110 6 L114 18 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <Football x={146} y={40} rx={13} rot={-30} />
      <path d="M160 26 L170 18 M164 36 L176 34" stroke={c("ink-muted")} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Where He Ranks — a leaderboard with one row pointed out. */
function RankBoard() {
  return (
    <g>
      <Shadow y={136} rx={60} />
      <rect x="42" y="18" width="116" height="116" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 28 + i * 21;
        const hit = i === 3;
        return (
          <g key={i}>
            <rect x="50" y={y} width="100" height="16" rx="3" fill={hit ? c("ice") : c("ink-soft")} stroke={N} strokeWidth="1.6" />
            <circle cx="60" cy={y + 8} r="5.5" fill={hit ? c("gold") : c("ink")} stroke={N} strokeWidth="1.4" />
            <path d={`M72 ${y + 8} H${hit ? 132 : 118 - i * 6}`} stroke={N} strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
          </g>
        );
      })}
      <path d="M182 99 H162 M170 92 L160 99 L170 106" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Blanks Aren't Zeros — a row of cells with one left blank, and a zero crossed out. */
function BlankCell() {
  return (
    <g>
      <Shadow y={128} rx={80} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={20 + i * 33} y="84" width="30" height="26" rx="2" fill={i === 2 ? "none" : c("ink")} stroke={i === 2 ? c("turf") : N} strokeWidth={i === 2 ? 2.6 : 2} strokeDasharray={i === 2 ? "4 3" : undefined} />
      ))}
      {[0, 1, 3, 4].map((i) => (
        <path key={i} d={`M${27 + i * 33} 97 H${43 + i * 33}`} stroke={N} strokeWidth="2.6" strokeLinecap="round" opacity="0.6" />
      ))}
      <circle cx="102" cy="44" r="22" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <text x="102" y="53" textAnchor="middle" fontSize="26" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        0
      </text>
      <path d="M86 28 L118 60" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" />
      <path d="M102 66 V80" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="3 3" />
    </g>
  );
}

/** Empty Weeks — a strip of weeks with a ball in most, a few left empty. */
function EmptyWeeks() {
  const empty = [3, 4, 5];
  return (
    <g>
      <Shadow y={128} rx={84} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 12 + i * 20;
        return (
          <g key={i}>
            <rect x={x} y="60" width="18" height="44" rx="3" fill={empty.includes(i) ? "none" : c("ink")} stroke={empty.includes(i) ? c("ice") : N} strokeWidth="2" strokeDasharray={empty.includes(i) ? "4 3" : undefined} />
            {!empty.includes(i) && <Football x={x + 9} y={82} rx={7} rot={90} />}
          </g>
        );
      })}
      <path d="M72 46 Q100 30 128 46" fill="none" stroke={c("ice")} strokeWidth="2.4" strokeLinecap="round" />
      <text x="100" y="36" textAnchor="middle" fontSize="16" fontWeight="900" fill={c("ice")} fontFamily={SANS}>
        ?
      </text>
    </g>
  );
}

/** Twenty-Point Weeks — a row of cells, the big ones lit with a 20+ sticker. */
function TwentyCells() {
  const lit = [1, 2, 4, 6];
  return (
    <g>
      <Shadow y={124} rx={84} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={14 + i * 22} y="80" width="20" height="28" rx="2" fill={lit.includes(i) ? c("turf") : c("ink")} stroke={N} strokeWidth="1.8" />
      ))}
      {lit.map((i) => (
        <path key={i} d={`M${18 + i * 22} 94 H${30 + i * 22}`} stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      ))}
      <g transform="rotate(-10 100 44)">
        <circle cx="100" cy="44" r="24" fill={c("gold")} stroke={N} strokeWidth="2.4" />
        <text x="100" y="51" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
          20+
        </text>
      </g>
      <path d="M80 64 L62 78 M120 64 L138 78" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="3 3" />
    </g>
  );
}

/** Crosshairs — a grid with one row and one column lit, a target where they cross. */
function Crosshairs() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="36" y="20" width="128" height="112" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="36" y="64" width="128" height="16" fill={c("gold", 0.45)} />
      <rect x="100" y="20" width="16" height="112" fill={c("gold", 0.45)} />
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={`v${i}`} d={`M${36 + i * 16} 20 V132`} stroke={N} strokeWidth="1" opacity="0.4" />
      ))}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <path key={`h${i}`} d={`M36 ${20 + i * 16} H164`} stroke={N} strokeWidth="1" opacity="0.4" />
      ))}
      <circle cx="108" cy="72" r="15" fill="none" stroke={c("gold")} strokeWidth="3" />
      <path d="M108 50 V62 M108 82 V94 M86 72 H98 M118 72 H130" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <circle cx="108" cy="72" r="3" fill={c("gold")} />
    </g>
  );
}

/** Which Week? — a calendar page with one day starred and a question in a bubble. */
function WhichWeek() {
  return (
    <g>
      <Shadow y={136} rx={56} />
      <rect x="34" y="40" width="104" height="92" rx="5" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="34" y="40" width="104" height="18" rx="5" fill={c("ice")} stroke={N} strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={42 + (i % 4) * 23} y={66 + Math.floor(i / 4) * 20} width="18" height="15" rx="2" fill={i === 9 ? c("gold") : c("ink-soft")} stroke={N} strokeWidth="1.2" />
      ))}
      <path d={starPath(97, 113, 5, 6, 2.6, -90)} fill={N} />
      <path d="M140 18 H184 Q190 18 190 24 V52 Q190 58 184 58 H158 L150 68 L150 58 H146 Q140 58 140 52 V24 Q140 18 146 18 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <text x="165" y="50" textAnchor="middle" fontSize="28" fontWeight="900" fill={N} fontFamily={SANS}>
        ?
      </text>
    </g>
  );
}

/** Not on the Sheet — a magnifier over the list, and an empty, dashed slot where the name would be. */
function NotOnSheet() {
  return (
    <g>
      <Shadow y={136} rx={60} />
      <rect x="30" y="20" width="96" height="112" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      {[0, 1, 2, 4].map((i) => (
        <path key={i} d={`M42 ${38 + i * 18} H${108 - (i % 2) * 12}`} stroke={N} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      ))}
      <rect x="40" y="86" width="76" height="14" rx="2" fill="none" stroke={c("gold")} strokeWidth="2.2" strokeDasharray="4 3" />
      <circle cx="140" cy="88" r="24" fill={c("ice", 0.25)} stroke={N} strokeWidth="3" />
      <path d="M157 105 L180 128" stroke={N} strokeWidth="10" strokeLinecap="round" />
      <path d="M157 105 L180 128" stroke={c("gold-dim")} strokeWidth="6" strokeLinecap="round" />
      <text x="140" y="97" textAnchor="middle" fontSize="24" fontWeight="900" fill={c("ink")} fontFamily={SANS}>
        ?
      </text>
    </g>
  );
}

// ── Gridiron Goods, the practice store (2026-10-05) ──────────────

/** Best Sellers — a shopping bag with a #1 tag and a ball peeking out. */
function ShoppingBag() {
  return (
    <g>
      <Shadow y={134} rx={52} />
      <Football x={94} y={46} rx={16} rot={-24} />
      <path d="M58 52 H142 L150 130 H50 Z" fill={c("turf")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M78 52 V44 Q78 28 100 28 Q122 28 122 44 V52" fill="none" stroke={N} strokeWidth="4" />
      <path d="M78 52 V44 Q78 28 100 28 Q122 28 122 44 V52" fill="none" stroke={c("gold-dim")} strokeWidth="2" />
      <path d="M58 52 H142" stroke={N} strokeWidth="2.4" />
      <path d={starPath(100, 92, 5, 18, 8, -90)} fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <text x="100" y="97" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={SANS}>
        1
      </text>
    </g>
  );
}

/** Rush Season — a loaded shopping cart at full speed. */
function RushCart() {
  return (
    <g>
      <Shadow y={136} rx={60} />
      <path d="M8 74 H30 M4 88 H32 M12 102 H36" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
      <rect x="66" y="42" width="30" height="24" rx="2" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <rect x="96" y="34" width="34" height="32" rx="2" fill={c("ice")} stroke={N} strokeWidth="2" />
      <rect x="130" y="46" width="22" height="20" rx="2" fill={c("turf")} stroke={N} strokeWidth="2" />
      <path d="M40 40 H54 L66 108 H158 L170 66 H58" fill="none" stroke={N} strokeWidth="5" strokeLinejoin="round" />
      <path d="M40 40 H54 L66 108 H158 L170 66 H58" fill="none" stroke={c("ink-soft")} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M62 80 H166 M64 94 H162" stroke={c("ink-soft")} strokeWidth="2" />
      <circle cx="78" cy="124" r="8" fill={c("night")} stroke={N} strokeWidth="2" />
      <circle cx="148" cy="124" r="8" fill={c("night")} stroke={N} strokeWidth="2" />
    </g>
  );
}

/** Where the Money Is — a cash register with the drawer out. */
function CashRegister() {
  return (
    <g>
      <Shadow y={136} rx={62} />
      <rect x="62" y="22" width="76" height="26" rx="4" fill={c("night")} stroke={N} strokeWidth="2.2" />
      <text x="100" y="41" textAnchor="middle" fontSize="15" fontWeight="900" fill={c("turf")} fontFamily={MONO}>
        $$$
      </text>
      <path d="M44 56 H156 L162 108 H38 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2, 3].map((col) => (
          <rect key={`${r}-${col}`} x={60 + col * 20} y={64 + r * 13} width="15" height="9" rx="2" fill={col === 3 ? c("gold") : c("ink")} stroke={N} strokeWidth="1.3" />
        )),
      )}
      <path d="M30 108 H170 V128 H30 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="44" y="112" width="26" height="12" rx="2" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <rect x="76" y="112" width="26" height="12" rx="2" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <circle cx="122" cy="118" r="6" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <circle cx="140" cy="118" r="6" fill={c("gold")} stroke={N} strokeWidth="1.6" />
    </g>
  );
}

/** Window Shoppers — a shop window with goods inside, and someone outside just looking. */
function ShopWindow() {
  return (
    <g>
      <Shadow y={136} rx={70} />
      <rect x="20" y="30" width="122" height="100" rx="3" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <path d="M16 30 L28 14 H134 L146 30 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M40 14 L36 30 M60 14 L58 30 M80 14 L80 30 M100 14 L102 30 M120 14 L124 30" stroke={N} strokeWidth="1.6" opacity="0.5" />
      <rect x="30" y="42" width="102" height="62" rx="2" fill={c("ice", 0.18)} stroke={N} strokeWidth="2" />
      <path d="M40 50 L58 92 M50 48 L70 92" stroke={c("ink")} strokeWidth="2" opacity="0.35" />
      <rect x="44" y="76" width="22" height="22" rx="2" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <Football x={92} y={88} rx={12} />
      <rect x="110" y="70" width="14" height="28" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <circle cx="166" cy="70" r="13" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      <path d="M144 130 Q144 92 166 90 Q188 92 188 130 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M150 60 L138 52 M150 66 L136 66" stroke={c("gold")} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Basket Size — a shopping basket with a cap, a mug and a ball in it. */
function Basket() {
  return (
    <g>
      <Shadow y={134} rx={62} />
      <path d="M62 72 Q62 30 100 30 Q138 30 138 72" fill="none" stroke={N} strokeWidth="6" />
      <path d="M62 72 Q62 30 100 30 Q138 30 138 72" fill="none" stroke={c("gold-dim")} strokeWidth="3" />
      <Football x={78} y={66} rx={15} rot={-20} />
      <rect x="96" y="54" width="20" height="24" rx="3" fill={c("ice")} stroke={N} strokeWidth="1.8" />
      <path d="M116 60 Q126 60 126 68 Q126 76 116 76" fill="none" stroke={N} strokeWidth="2" />
      <path d="M124 72 Q134 52 150 62 L148 74 Z" fill={c("turf")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M40 74 H160 L148 128 H52 Z" fill={c("gold")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M46 92 H154 M50 110 H150 M76 74 L80 128 M100 74 V128 M124 74 L120 128" stroke={N} strokeWidth="1.6" opacity="0.5" />
    </g>
  );
}

/** Come Back Soon — an open door and a mat that says welcome back. */
function WelcomeMat() {
  return (
    <g>
      <Shadow y={136} rx={70} />
      <rect x="66" y="14" width="68" height="100" rx="3" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <path d="M66 14 L44 24 V122 L66 114 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="52" cy="70" r="2.6" fill={N} />
      <path d="M34 116 H166 L176 134 H24 Z" fill={c("turf")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <text x="100" y="130" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        WELCOME BACK
      </text>
      <path d="M150 50 Q166 40 160 26 M154 30 L160 24 L166 30" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Return to Sender — a parcel with a big return arrow curling back. */
function ReturnBox() {
  return (
    <g>
      <Shadow y={134} rx={58} />
      <path d="M50 64 L100 48 L150 64 V118 L100 134 L50 118 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M50 64 L100 80 L150 64 M100 80 V134" fill="none" stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M74 56 L124 72" stroke={c("ink-soft")} strokeWidth="6" />
      <rect x="110" y="92" width="28" height="18" rx="2" fill={c("ink")} stroke={N} strokeWidth="1.6" transform="rotate(-18 124 101)" />
      <path d="M150 40 Q150 14 116 14 Q86 14 82 34" fill="none" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M150 40 Q150 14 116 14 Q86 14 82 34" fill="none" stroke={c("ice")} strokeWidth="4" strokeLinecap="round" />
      <path d="M72 28 L82 40 L92 28" fill="none" stroke={c("ice")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Price Tag Trap — a jersey's tag with the old price crossed out under the new one. */
function PriceTag() {
  return (
    <g>
      <Shadow y={132} rx={64} />
      <g transform="rotate(-12 100 80)">
        <path d="M40 50 H140 L166 80 L140 110 H40 Z" fill={c("ink")} stroke={N} strokeWidth="2.6" strokeLinejoin="round" />
        <circle cx="146" cy="80" r="6" fill={c("night-100")} stroke={N} strokeWidth="2" />
        <text x="90" y="74" textAnchor="middle" fontSize="15" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
          $109.99
        </text>
        <path d="M56 70 H124" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
        <text x="90" y="100" textAnchor="middle" fontSize="18" fontWeight="900" fill={c("turf-dim")} fontFamily={MONO}>
          $119.99
        </text>
      </g>
      <path d="M166 80 Q186 60 178 34" fill="none" stroke={c("ink-muted")} strokeWidth="2" />
      <path d={starPath(30, 40, 4, 10, 4, 0)} fill={c("gold")} stroke={N} strokeWidth="1.4" strokeLinejoin="round" />
    </g>
  );
}

/** Promo Codes — a coupon with a dashed edge and scissors cutting it out. */
function Coupon() {
  return (
    <g>
      <Shadow y={132} rx={68} />
      <rect x="28" y="46" width="128" height="72" rx="6" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      <rect x="36" y="54" width="112" height="56" rx="4" fill="none" stroke={N} strokeWidth="1.8" strokeDasharray="5 4" />
      <text x="92" y="84" textAnchor="middle" fontSize="20" fontWeight="900" fill={N} fontFamily={SANS}>
        10% OFF
      </text>
      <text x="92" y="102" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        CODE
      </text>
      <g transform="rotate(-30 166 46)">
        <path d="M150 46 L184 40 M150 46 L184 52" stroke={N} strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="144" cy="38" r="7" fill="none" stroke={c("ice")} strokeWidth="3.4" />
        <circle cx="144" cy="54" r="7" fill="none" stroke={c("ice")} strokeWidth="3.4" />
      </g>
    </g>
  );
}

/** Big Spenders — a fat wallet wearing a crown. */
function WalletCrown() {
  return (
    <g>
      <Shadow y={134} rx={62} />
      <rect x="54" y="62" width="92" height="20" rx="3" fill={c("turf")} stroke={N} strokeWidth="2" transform="rotate(-6 100 72)" />
      <rect x="40" y="70" width="120" height="62" rx="10" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" />
      <path d="M118 88 H164 V114 H118 Q110 114 110 101 Q110 88 118 88 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" />
      <circle cx="124" cy="101" r="4" fill={N} />
      <path d="M72 58 L76 30 L90 44 L100 24 L110 44 L124 30 L128 58 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="100" cy="24" r="3.4" fill={c("ice")} stroke={N} strokeWidth="1.4" />
    </g>
  );
}

/** Second Visit — a calendar with two days circled and an arrow between them. */
function TwoDates() {
  return (
    <g>
      <Shadow y={136} rx={62} />
      <rect x="40" y="28" width="120" height="102" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="40" y="28" width="120" height="20" rx="6" fill={c("turf")} stroke={N} strokeWidth="2" />
      <path d="M62 22 V36 M138 22 V36" stroke={N} strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={50 + (i % 5) * 21} y={56 + Math.floor(i / 5) * 17} width="16" height="12" rx="2" fill={c("ink-soft")} opacity="0.5" />
      ))}
      <circle cx="79" cy="79" r="11" fill="none" stroke={c("gold")} strokeWidth="3" />
      <circle cx="142" cy="113" r="11" fill="none" stroke={c("ice")} strokeWidth="3" />
      <path d="M88 86 Q118 90 132 106" fill="none" stroke={N} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M88 86 Q118 90 132 106" fill="none" stroke={c("gold")} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Blank Fields — a sign-up form with two fields left empty. */
function BlankForm() {
  return (
    <g>
      <Shadow y={136} rx={52} />
      <rect x="52" y="16" width="96" height="116" rx="5" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="62" y={28 + i * 25} width="32" height="5" rx="2" fill={c("ink-muted")} />
          <rect
            x="62"
            y={36 + i * 25}
            width="76"
            height="11"
            rx="2"
            fill={i === 1 || i === 3 ? "none" : c("ink-soft")}
            stroke={i === 1 || i === 3 ? c("gold") : N}
            strokeWidth={i === 1 || i === 3 ? 2 : 1.2}
            strokeDasharray={i === 1 || i === 3 ? "4 3" : undefined}
          />
        </g>
      ))}
      <text x="160" y="72" fontSize="22" fontWeight="900" fill={c("gold")} fontFamily={SANS}>
        ?
      </text>
      <text x="160" y="122" fontSize="22" fontWeight="900" fill={c("gold")} fontFamily={SANS}>
        ?
      </text>
    </g>
  );
}

/** Free Shipping — a delivery truck with a FREE sign on its side. */
function FreeTruck() {
  return (
    <g>
      <Shadow y={132} rx={72} />
      <rect x="24" y="52" width="100" height="58" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <path d="M124 70 H152 L170 90 V110 H124 Z" fill={c("ice")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M132 76 H150 L160 88 H132 Z" fill={c("night-100")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="38" y="64" width="72" height="30" rx="4" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text x="74" y="85" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={SANS}>
        FREE
      </text>
      <circle cx="54" cy="114" r="11" fill={c("night")} stroke={N} strokeWidth="2.2" />
      <circle cx="146" cy="114" r="11" fill={c("night")} stroke={N} strokeWidth="2.2" />
      <path d="M6 70 H18 M2 84 H18 M8 98 H18" stroke={c("ink-muted")} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

/** Home Team Loyalty — a jersey with a heart on it. */
function HeartJersey() {
  return (
    <g>
      <Shadow y={136} rx={56} />
      <path d="M74 24 L54 32 L30 56 L46 74 L60 62 V130 H140 V62 L154 74 L170 56 L146 32 L126 24 Q118 38 100 38 Q82 38 74 24 Z" fill={c("ice")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M74 24 Q86 32 100 32 Q114 32 126 24" fill="none" stroke={N} strokeWidth="2" />
      <path d="M100 112 C70 92 72 70 88 70 Q96 70 100 80 Q104 70 112 70 C128 70 130 92 100 112 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M60 116 H140" stroke={N} strokeWidth="1.6" opacity="0.4" />
    </g>
  );
}

/** Running Revenue — stacks of coins climbing like stairs, an arrow up the top. */
function CoinSteps() {
  const stack = (x: number, n: number) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={`${x}-${i}`} cx={x} cy={124 - i * 9} rx="15" ry="5" fill={c("gold")} stroke={N} strokeWidth="1.8" />
    ));
  return (
    <g>
      <Shadow y={132} rx={74} />
      {stack(40, 2)}
      {stack(74, 4)}
      {stack(108, 7)}
      {stack(142, 10)}
      <path d="M36 104 L72 86 L106 60 L140 32" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 104 L72 86 L106 60 L140 32" fill="none" stroke={c("turf")} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M130 30 L142 30 L140 42" fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Signup to Sale — a sign-up card, an hourglass, and a cart on the far side. */
function SignupHourglass() {
  return (
    <g>
      <Shadow y={134} rx={78} />
      <rect x="14" y="52" width="44" height="58" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <path d="M22 64 H50 M22 74 H44 M22 84 H50" stroke={N} strokeWidth="2" opacity="0.5" />
      <rect x="22" y="94" width="28" height="10" rx="3" fill={c("turf")} stroke={N} strokeWidth="1.6" />
      <path d="M82 36 H118 M82 128 H118" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M86 38 Q86 70 100 82 Q86 94 86 126 H114 Q114 94 100 82 Q114 70 114 38 Z" fill={c("ice", 0.25)} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M92 52 H108 L100 76 Z M90 124 Q100 106 110 124 Z" fill={c("gold")} />
      <path d="M142 64 H150 L156 102 H186 L192 76 H152" fill="none" stroke={N} strokeWidth="3.6" strokeLinejoin="round" />
      <path d="M142 64 H150 L156 102 H186 L192 76 H152" fill="none" stroke={c("ink-soft")} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="160" cy="112" r="5" fill={c("night")} stroke={N} strokeWidth="1.8" />
      <circle cx="182" cy="112" r="5" fill={c("night")} stroke={N} strokeWidth="1.8" />
    </g>
  );
}

// ── Play by play (2026-10-05) ─────────────────────────────────────

/** Fourth and Short — the down marker flipped to 4, the ball a yard short of the stick. */
function FourthDownSign() {
  return (
    <g>
      <Shadow y={136} rx={70} />
      <rect x="20" y="104" width="160" height="26" rx="3" fill={c("turf-dim")} stroke={N} strokeWidth="2" />
      <path d="M60 104 V130 M140 104 V130" stroke={c("ink")} strokeWidth="2" opacity="0.6" />
      <path d="M140 104 V130" stroke={c("gold")} strokeWidth="3.4" />
      <Football x={124} y={116} rx={11} />
      <path d="M128 98 H140 M134 94 L140 98 L134 102" fill="none" stroke={c("gold")} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="134" y="90" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        1 YD
      </text>
      <rect x="54" y="22" width="5" height="84" fill={c("ink-soft")} stroke={N} strokeWidth="1.6" />
      <rect x="34" y="14" width="46" height="40" rx="4" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      <text x="57" y="46" textAnchor="middle" fontSize="32" fontWeight="900" fill={N} fontFamily={SANS}>
        4
      </text>
    </g>
  );
}

/** Go For It — a traffic light on green, and a ball taking off. */
function GoChart() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="40" y="16" width="44" height="106" rx="10" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <circle cx="62" cy="38" r="12" fill={c("ink-muted")} opacity="0.35" stroke={N} strokeWidth="1.8" />
      <circle cx="62" cy="69" r="12" fill={c("gold-dim")} opacity="0.4" stroke={N} strokeWidth="1.8" />
      <circle cx="62" cy="100" r="16" fill={c("turf", 0.3)} />
      <circle cx="62" cy="100" r="12" fill={c("turf")} stroke={N} strokeWidth="1.8" />
      <rect x="58" y="122" width="8" height="12" fill={c("ink-soft")} stroke={N} strokeWidth="1.4" />
      <path d="M100 98 H122 M96 84 H118 M104 112 H120" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
      <Football x={148} y={88} rx={22} rot={-20} />
      <text x="150" y="44" textAnchor="middle" fontSize="26" fontWeight="900" fill={c("turf")} stroke={N} strokeWidth="1.2" fontFamily={SANS}>
        GO!
      </text>
    </g>
  );
}

/** Third Down Kings — a crown on top of the down marker flipped to 3. */
function ThirdDownChains() {
  return (
    <g>
      <Shadow y={136} rx={50} />
      <rect x="97" y="62" width="6" height="70" fill={c("ink-soft")} stroke={N} strokeWidth="1.6" />
      <rect x="72" y="58" width="56" height="48" rx="4" fill={c("ice")} stroke={N} strokeWidth="2.4" />
      <text x="100" y="96" textAnchor="middle" fontSize="38" fontWeight="900" fill={N} fontFamily={SANS}>
        3
      </text>
      <path d="M70 52 L74 22 L88 36 L100 14 L112 36 L126 22 L130 52 Z" fill={c("gold")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="100" cy="14" r="3.6" fill={c("turf")} stroke={N} strokeWidth="1.4" />
      <path d="M74 46 H126" stroke={N} strokeWidth="1.6" opacity="0.5" />
      <Sparkle x={42} y={40} r={7} fill={c("gold")} />
      <Sparkle x={158} y={70} r={6} fill={c("gold")} />
    </g>
  );
}

/** Red Zone Trips — a dashed trip arrow running into the shaded zone inside the 20, with a pennant. */
function RedZoneFlag() {
  return (
    <g>
      <Shadow y={136} rx={78} />
      <path d="M14 70 H186 L186 128 H14 Z" fill={c("turf-dim")} stroke={N} strokeWidth="2.2" />
      <rect x="128" y="70" width="58" height="58" fill={c("gold", 0.35)} />
      <path d="M128 70 V128" stroke={c("gold")} strokeWidth="3" />
      <text x="120" y="122" textAnchor="end" fontSize="13" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        20
      </text>
      <path d="M50 70 V128 M90 70 V128" stroke={c("ink")} strokeWidth="1.6" opacity="0.5" />
      <path d="M26 112 Q70 60 150 96" fill="none" stroke={c("ice")} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
      <path d="M140 88 L152 97 L138 102" fill="none" stroke={c("ice")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Football x={158} y={104} rx={11} />
      <path d="M170 70 V20" stroke={c("ink-soft")} strokeWidth="3" />
      <path d="M170 22 L196 30 L170 40 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
    </g>
  );
}

/** Chunk Plays — a ball leaping over a tape measure that reads 20+. */
function ChunkRuler() {
  return (
    <g>
      <Shadow y={136} rx={72} />
      <rect x="18" y="102" width="164" height="24" rx="3" fill={c("gold")} stroke={N} strokeWidth="2.2" />
      {Array.from({ length: 21 }, (_, i) => (
        <path key={i} d={`M${26 + i * 7.4} 102 V${i % 5 === 0 ? 114 : 108}`} stroke={N} strokeWidth="1.4" />
      ))}
      <text x="100" y="123" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        0 · · · · 10 · · · · 20
      </text>
      <path d="M30 94 Q100 6 170 94" fill="none" stroke={c("ink-muted")} strokeWidth="2.4" strokeDasharray="4 5" />
      <Football x={100} y={42} rx={20} rot={-6} />
      <rect x="140" y="20" width="44" height="26" rx="5" fill={c("turf")} stroke={N} strokeWidth="2.2" />
      <text x="162" y="39" textAnchor="middle" fontSize="16" fontWeight="900" fill={N} fontFamily={SANS}>
        20+
      </text>
    </g>
  );
}

/** Neutral Script — the coach's call sheet with a spirit level sitting dead centre on it. */
function ScriptCard() {
  return (
    <g>
      <Shadow y={136} rx={56} />
      <rect x="50" y="14" width="100" height="118" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="50" y="14" width="100" height="18" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <text x="60" y={50 + i * 12} fontSize="8" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
            {i + 1}
          </text>
          <rect x="70" y={44 + i * 12} width={i % 2 ? 50 : 66} height="6" rx="2" fill={c("ink-soft")} />
        </g>
      ))}
      <rect x="40" y="104" width="120" height="22" rx="5" fill={c("gold")} stroke={N} strokeWidth="2.2" />
      <rect x="84" y="108" width="32" height="14" rx="7" fill={c("turf", 0.35)} stroke={N} strokeWidth="1.6" />
      <circle cx="100" cy="115" r="4.6" fill={c("ink")} stroke={N} strokeWidth="1.2" />
      <path d="M92 108 V122 M108 108 V122" stroke={N} strokeWidth="1.4" />
    </g>
  );
}

/** Deep Shots — a quarterback letting one go on a huge arc downfield. */
function DeepBomb() {
  return (
    <g>
      <Shadow x={46} y={136} rx={26} />
      <path d="M40 132 H190" stroke={c("turf-dim")} strokeWidth="6" />
      {[80, 120, 160].map((x) => (
        <path key={x} d={`M${x} 126 V138`} stroke={c("ink")} strokeWidth="2" opacity="0.5" />
      ))}
      <Player x={44} y={134} s={0.82} pose="throw" jersey="ice" label="QB" />
      <path d="M58 66 Q118 -8 176 104" fill="none" stroke={c("gold")} strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" />
      <path d="M166 100 L177 108 L180 94" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="176" cy="118" r="7" fill="none" stroke={c("ice")} strokeWidth="2.4" />
      <text x="114" y="76" textAnchor="middle" fontSize="16" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        20+
      </text>
      <text x="114" y="90" textAnchor="middle" fontSize="8" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
        AIR YARDS
      </text>
    </g>
  );
}

/** Target Hogs — a hog with a ball, in front of a bullseye. */
function TargetBullseye() {
  return (
    <g>
      <Shadow y={136} rx={66} />
      <circle cx="132" cy="62" r="46" fill={c("ice")} stroke={N} strokeWidth="2.4" />
      <circle cx="132" cy="62" r="32" fill={c("ink")} stroke={N} strokeWidth="2" />
      <circle cx="132" cy="62" r="18" fill={c("ice")} stroke={N} strokeWidth="2" />
      <circle cx="132" cy="62" r="7" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <ellipse cx="74" cy="104" rx="44" ry="26" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" />
      <path d="M44 126 V134 M60 128 V136 M88 128 V136 M104 126 V134" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M118 96 Q128 92 124 102 Q120 108 128 108" fill="none" stroke={N} strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="86" r="22" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" />
      <path d="M34 68 L30 56 L44 64 Z M58 66 L64 54 L66 70 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="38" cy="94" rx="10" ry="7" fill={c("ink-muted")} stroke={N} strokeWidth="1.8" />
      <circle cx="35" cy="94" r="1.8" fill={N} />
      <circle cx="41" cy="94" r="1.8" fill={N} />
      <circle cx="42" cy="80" r="2.6" fill={N} />
      <circle cx="56" cy="80" r="2.6" fill={N} />
      <Football x={84} y={98} rx={14} rot={-30} />
    </g>
  );
}

/** From Way Out — uprights far downfield and a kick sailing toward them from the 50. */
function LongKick() {
  return (
    <g>
      <Shadow y={136} rx={78} />
      <path d="M8 132 L192 132 L150 92 L50 92 Z" fill={c("turf-dim")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 118 H170 M42 106 H158" stroke={c("ink")} strokeWidth="1.4" opacity="0.5" />
      <text x="30" y="128" fontSize="10" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        50
      </text>
      <path d="M100 92 V64 M84 64 H116 M84 64 V28 M116 64 V28" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M100 92 V64 M84 64 H116 M84 64 V28 M116 64 V28" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M36 124 Q60 20 100 46" fill="none" stroke={c("ink-muted")} strokeWidth="2.2" strokeDasharray="4 5" />
      <Football x={100} y={46} rx={9} rot={40} />
      <Sparkle x={150} y={30} r={7} fill={c("gold")} />
    </g>
  );
}

/** Expected Points — a gauge labelled EP, needle up in the green. */
function EpGauge() {
  return (
    <g>
      <Shadow y={136} rx={60} />
      <path d="M36 112 A64 64 0 0 1 164 112 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d={slicePath(100, 112, 54, 270, 330)} fill={c("ink-muted")} opacity="0.7" />
      <path d={slicePath(100, 112, 54, 330, 390)} fill={c("gold")} opacity="0.85" />
      <path d={slicePath(100, 112, 54, 390, 450)} fill={c("turf")} />
      <circle cx="100" cy="112" r="30" fill={c("ink")} />
      <path d="M100 112 L140 76" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M100 112 L140 76" stroke={c("ice")} strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="112" r="7" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="100" y="104" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={MONO}>
        EP
      </text>
      <rect x="28" y="112" width="144" height="16" rx="3" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <text x="100" y="124" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("turf")} fontFamily={MONO}>
        +0.157 / PLAY
      </text>
    </g>
  );
}

/** Turnover Margin — a balance scale, three balls on one pan outweighing one on the other. */
function TurnoverScale() {
  return (
    <g>
      <Shadow y={136} rx={56} />
      <path d="M100 30 V124 M76 128 H124" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M100 30 V124 M76 128 H124" stroke={c("gold-dim")} strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(14 100 34)">
        <path d="M40 34 H160" stroke={N} strokeWidth="5" strokeLinecap="round" />
        <path d="M40 34 H160" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M40 34 L26 70 M40 34 L54 70 M160 34 L146 70 M160 34 L174 70" stroke={c("ink-muted")} strokeWidth="1.6" />
        <path d="M22 70 Q40 84 58 70 Z" fill={c("ice")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
        <path d="M142 70 Q160 84 178 70 Z" fill={c("turf")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
        <Football x={40} y={64} rx={9} />
        <Football x={152} y={64} rx={9} />
        <Football x={168} y={64} rx={9} />
        <Football x={160} y={54} rx={9} />
      </g>
      <circle cx="100" cy="32" r="6" fill={c("gold")} stroke={N} strokeWidth="2" />
    </g>
  );
}

/** The Comeback — a scoreboard: the 21-point hole crossed out, the win underneath. */
function ComebackScoreboard() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <path d="M60 128 V112 M140 128 V112" stroke={N} strokeWidth="6" />
      <rect x="30" y="18" width="140" height="96" rx="6" fill={c("night-100")} stroke={N} strokeWidth="2.6" />
      <text x="100" y="34" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
        HOME · AWAY
      </text>
      <text x="100" y="62" textAnchor="middle" fontSize="22" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
        0 – 21
      </text>
      <path d="M62 54 L138 54" stroke={c("gold")} strokeWidth="3.4" strokeLinecap="round" />
      <text x="100" y="100" textAnchor="middle" fontSize="26" fontWeight="900" fill={c("turf")} fontFamily={MONO}>
        24 – 21
      </text>
      <path d="M176 92 Q192 60 176 30 M170 38 L176 28 L184 36" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Hot Hand — a glove holding the ball, on fire. */
function HotHandFlame() {
  return (
    <g>
      <Shadow y={136} rx={52} />
      <Flame x={100} y={92} s={1.25} outer={c("gold")} inner={c("ink")} />
      <Football x={100} y={74} rx={20} rot={-16} />
      <path d="M68 132 L70 96 Q70 86 80 86 L84 86 V70 Q84 62 91 62 Q98 62 98 70 V86 L120 86 Q132 86 132 98 L130 132 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M98 98 H124 M98 110 H126 M84 86 V100" stroke={N} strokeWidth="1.6" opacity="0.5" />
      <path d="M66 120 H132" stroke={c("ice")} strokeWidth="6" />
    </g>
  );
}

/** Inside or Out — a stadium dome on one side, the open sky and sun on the other. */
function DomeSun() {
  return (
    <g>
      <Shadow y={136} rx={80} />
      <path d="M100 18 V132" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="5 5" />
      <path d="M12 124 Q12 54 88 54 L88 124 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 124 Q24 66 88 66 M40 124 Q40 80 88 80 M88 54 Q60 70 56 124" fill="none" stroke={c("ink-muted")} strokeWidth="1.6" />
      <rect x="8" y="122" width="84" height="8" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.8" />
      <circle cx="150" cy="56" r="20" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <path
            key={i}
            d={`M${r1(150 + Math.cos(a) * 26)} ${r1(56 + Math.sin(a) * 26)} L${r1(150 + Math.cos(a) * 34)} ${r1(56 + Math.sin(a) * 34)}`}
            stroke={c("gold")}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <path d="M108 124 H192 V130 H108 Z" fill={c("turf")} stroke={N} strokeWidth="1.8" />
      <path d="M118 124 V104 M182 124 V104" stroke={c("ink-soft")} strokeWidth="2.4" />
    </g>
  );
}

/** Bell Cows — a cow with a bell round its neck and a ball tucked under a hoof. */
function YardCow() {
  return (
    <g>
      <Shadow y={136} rx={66} />
      <path d="M58 122 V134 M76 124 V136 M128 124 V136 M146 122 V134" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M58 122 V134 M76 124 V136 M128 124 V136 M146 122 V134" stroke={c("ink-soft")} strokeWidth="3" strokeLinecap="round" />
      <rect x="50" y="78" width="104" height="50" rx="22" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <path d="M70 84 Q84 80 86 96 Q80 106 68 100 Z M120 104 Q134 98 140 110 Q130 120 118 114 Z" fill={N} />
      <path d="M154 96 Q170 92 168 110" fill="none" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M56 60 L44 50 M80 60 L92 50" stroke={c("gold-dim")} strokeWidth="5" strokeLinecap="round" />
      <path d="M56 60 L44 50 M80 60 L92 50" stroke={N} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <rect x="44" y="56" width="48" height="42" rx="18" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <ellipse cx="68" cy="88" rx="18" ry="11" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <circle cx="62" cy="88" r="2.2" fill={N} />
      <circle cx="74" cy="88" r="2.2" fill={N} />
      <circle cx="58" cy="70" r="3" fill={N} />
      <circle cx="78" cy="70" r="3" fill={N} />
      <path d="M58 100 Q68 108 78 100" fill="none" stroke={c("gold-dim")} strokeWidth="3" />
      <path d="M62 104 H74 L76 118 H60 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="68" cy="120" r="2.4" fill={N} />
      <Football x={108} y={130} rx={13} rot={-8} />
    </g>
  );
}

/** Sack Watch — a burlap sack with a helmet poking out, and a stopwatch keeping count. */
function SackQb() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <path d="M40 132 Q30 92 52 66 L104 66 Q126 92 116 132 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M50 70 Q78 80 106 70" fill="none" stroke={N} strokeWidth="3" />
      <path d="M58 100 L64 108 M86 92 L92 100 M72 118 L78 126" stroke={N} strokeWidth="1.6" opacity="0.4" />
      <path d="M56 66 Q56 34 80 34 Q104 34 104 62 L104 66 Z" fill={c("ice")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M78 36 V64" stroke={c("ink", 0.55)} strokeWidth="3" />
      <path d="M96 52 H112 M96 60 H112 M106 48 V62" stroke={c("ink-soft")} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="152" cy="80" r="30" fill={c("ink")} stroke={N} strokeWidth="2.6" />
      <rect x="146" y="40" width="12" height="10" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.8" />
      <circle cx="152" cy="80" r="23" fill="none" stroke={c("ink-muted")} strokeWidth="1.4" />
      <path d="M152 80 V62 M152 80 L164 88" stroke={N} strokeWidth="3" strokeLinecap="round" />
      <circle cx="152" cy="80" r="3" fill={c("gold")} stroke={N} strokeWidth="1.2" />
    </g>
  );
}

/** Marathon Drives — fifteen play dots winding down the field to a finish-line tape. */
function MarathonChain() {
  const dots: [number, number][] = [
    [22, 118], [36, 106], [48, 118], [62, 106], [74, 94], [86, 104], [98, 92],
    [110, 80], [122, 90], [132, 76], [142, 64], [150, 76], [160, 62], [168, 50], [176, 38],
  ];
  return (
    <g>
      <Shadow y={136} rx={80} />
      <path d={`M${dots.map(([x, y]) => `${x} ${y}`).join(" L")}`} fill="none" stroke={c("ink-muted")} strokeWidth="2" strokeDasharray="3 4" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5.4" fill={i === dots.length - 1 ? c("gold") : c("ice")} stroke={N} strokeWidth="1.6" />
      ))}
      <path d="M150 18 V54 M196 18 V54" stroke={c("ink-soft")} strokeWidth="3" />
      <path d="M150 26 Q173 34 196 26" fill="none" stroke={N} strokeWidth="5" />
      <path d="M150 26 Q173 34 196 26" fill="none" stroke={c("turf")} strokeWidth="3" />
      <Football x={28} y={92} rx={12} rot={-20} />
      <text x="70" y="136" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
        15 PLAYS
      </text>
    </g>
  );
}

// ── Benchwarmer, the practice app (2026-10-05) ───────────────────

/** A phone outline; the scene draws on its screen. */
function PhoneFrame({ x, y, w = 64, h = 112, children }: { x: number; y: number; w?: number; h?: number; children?: React.ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <rect x={x + 5} y={y + 12} width={w - 10} height={h - 24} rx="3" fill={c("ink")} />
      <rect x={x + w / 2 - 8} y={y + 5} width="16" height="3" rx="1.5" fill={c("ink-muted")} />
      {children}
    </g>
  );
}

/** Game Day Traffic — a phone whose week chart spikes on Sunday. */
function PhoneSunday() {
  const bars = [62, 40, 34, 48, 39, 24, 32];
  return (
    <g>
      <Shadow y={136} rx={60} />
      <PhoneFrame x={68} y={16} w={64} h={114}>
        {bars.map((h, i) => (
          <rect key={i} x={76 + i * 7} y={116 - h} width="5" height={h} rx="1" fill={i === 0 ? c("gold") : i === 3 ? c("ice") : c("ink-muted")} stroke={N} strokeWidth="0.8" />
        ))}
        <text x="78" y="44" fontSize="7" fontWeight="900" fill={c("gold-dim")} fontFamily={MONO}>
          SUN
        </text>
      </PhoneFrame>
      <Football x={36} y={70} rx={18} rot={-20} />
      <path d="M150 50 L164 40 M152 66 H170 M150 82 L164 92" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Daily Actives — a tear-off calendar page above a row of little people. */
function DauCounter() {
  return (
    <g>
      <Shadow y={136} rx={70} />
      <rect x="70" y="14" width="60" height="62" rx="5" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="70" y="14" width="60" height="16" rx="5" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text x="100" y="26" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        TODAY
      </text>
      <text x="100" y="64" textAnchor="middle" fontSize="26" fontWeight="900" fill={N} fontFamily={SANS}>
        75
      </text>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 36 + i * 26;
        const col = [c("ice"), c("turf"), c("gold"), c("ice"), c("turf"), c("gold")][i];
        return (
          <g key={i}>
            <circle cx={x} cy={100} r="8" fill={col} stroke={N} strokeWidth="1.8" />
            <path d={`M${x - 11} 132 Q${x - 11} 112 ${x} 112 Q${x + 11} 112 ${x + 11} 132 Z`} fill={col} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
}

/** Peak Week — a mountain with a flag on the summit. */
function PeakMountain() {
  return (
    <g>
      <Shadow y={136} rx={84} />
      <path d="M8 132 L60 72 L80 90 L112 36 L150 92 L166 80 L194 132 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M98 60 L112 36 L126 60 L118 56 L112 64 L104 56 Z" fill={c("ink")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M112 36 V8" stroke={N} strokeWidth="3" />
      <path d="M112 9 L138 15 L112 22 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 120 L48 98 L70 108 L96 76" fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4" />
    </g>
  );
}

/** Stickiness — a glue bottle, and a phone stuck fast to a hand-drawn heart of glue. */
function GluePhone() {
  return (
    <g>
      <Shadow y={136} rx={66} />
      <path d="M36 132 V70 Q36 60 46 60 H66 Q76 60 76 70 V132 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M50 60 L54 36 H58 L62 60 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <rect x="40" y="84" width="32" height="26" rx="3" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <text x="56" y="101" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        GLUE
      </text>
      <path d="M56 36 Q60 26 70 30 Q80 34 90 30" fill="none" stroke={c("ink")} strokeWidth="3" strokeLinecap="round" />
      <PhoneFrame x={112} y={24} w={56} h={98}>
        <path d="M140 92 C120 78 122 60 132 60 Q137 60 140 67 Q143 60 148 60 C158 60 160 78 140 92 Z" fill={c("turf")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      </PhoneFrame>
      <path d="M108 118 Q104 128 110 132 M172 118 Q178 128 170 134 M140 122 V132" stroke={c("ink")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Day Seven — a calendar with day 1 and day 8 circled, seven hops between them. */
function SevenCalendar() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="34" y="24" width="132" height="106" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="34" y="24" width="132" height="20" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" />
      <path d="M58 18 V32 M142 18 V32" stroke={N} strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: 21 }, (_, i) => (
        <text key={i} x={48 + (i % 7) * 17.5} y={64 + Math.floor(i / 7) * 22} textAnchor="middle" fontSize="9" fontWeight="800" fill={c("ink-muted")} fontFamily={MONO}>
          {i + 1}
        </text>
      ))}
      <circle cx="48" cy="61" r="8" fill="none" stroke={c("gold")} strokeWidth="2.6" />
      <circle cx="48" cy="83" r="8" fill="none" stroke={c("turf")} strokeWidth="2.6" />
      <path d="M58 58 Q100 44 152 58 Q160 70 56 80" fill="none" stroke={c("turf")} strokeWidth="2.2" strokeDasharray="4 3" />
      <text x="140" y="120" textAnchor="middle" fontSize="13" fontWeight="900" fill={c("turf-dim")} fontFamily={SANS}>
        +7
      </text>
    </g>
  );
}

/** The Funnel — a funnel in four bands, wide at the top, a drip at the bottom. */
function FunnelSteps() {
  const bands: [number, number, string][] = [
    [80, 64, "turf"],
    [64, 52, "ice"],
    [52, 40, "gold"],
    [40, 16, "gold-dim"],
  ];
  return (
    <g>
      <Shadow y={136} rx={44} />
      {bands.map(([top, bottom, tone], i) => {
        const y = 20 + i * 24;
        return (
          <path
            key={i}
            d={`M${100 - top} ${y} H${100 + top} L${100 + bottom} ${y + 24} H${100 - bottom} Z`}
            fill={c(tone)}
            stroke={N}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        );
      })}
      <rect x="92" y="116" width="16" height="10" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <circle cx="100" cy="132" r="4" fill={c("gold")} stroke={N} strokeWidth="1.4" />
      <text x="100" y="37" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        420
      </text>
      <text x="100" y="109" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        53
      </text>
    </g>
  );
}

/** Empty Lineups — a lineup card with its slots left blank. */
function EmptyLineup() {
  const slots = ["QB", "RB", "RB", "WR", "WR", "TE"];
  return (
    <g>
      <Shadow y={136} rx={56} />
      <rect x="46" y="12" width="108" height="122" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="46" y="12" width="108" height="18" rx="6" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text x="100" y="25" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        LINEUP
      </text>
      {slots.map((s, i) => (
        <g key={i}>
          <rect x="54" y={36 + i * 16} width="22" height="12" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.2" />
          <text x="65" y={45 + i * 16} textAnchor="middle" fontSize="7" fontWeight="900" fill={N} fontFamily={MONO}>
            {s}
          </text>
          <rect x="80" y={36 + i * 16} width="66" height="12" rx="2" fill="none" stroke={c("ink-muted")} strokeWidth="1.4" strokeDasharray="3 3" />
        </g>
      ))}
      <text x="172" y="80" textAnchor="middle" fontSize="26" fontWeight="900" fill={c("gold")} fontFamily={SANS}>
        ?
      </text>
    </g>
  );
}

/** Channel Check — a signpost with arrows pointing different ways. */
function ChannelSigns() {
  return (
    <g>
      <Shadow y={136} rx={56} />
      <rect x="96" y="20" width="8" height="114" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <path d="M104 26 H158 L170 36 L158 46 H104 Z" fill={c("turf")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M96 52 H42 L30 62 L42 72 H96 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M104 78 H150 L162 88 L150 98 H104 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M118 36 H150 M46 62 H86 M116 88 H144" stroke={N} strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
      <circle cx="100" cy="18" r="6" fill={c("gold")} stroke={N} strokeWidth="2" />
    </g>
  );
}

/** Thirty-Minute Rule — a stopwatch with a 30-minute wedge lit. */
function StopwatchThirty() {
  return (
    <g>
      <Shadow y={136} rx={52} />
      <rect x="92" y="14" width="16" height="12" rx="3" fill={c("gold")} stroke={N} strokeWidth="2" />
      <path d="M140 34 L150 26" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="80" r="50" fill={c("ink")} stroke={N} strokeWidth="2.8" />
      <path d={slicePath(100, 80, 42, 0, 180)} fill={c("ice", 0.45)} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <path key={i} d={`M${r1(100 + Math.sin(a) * 38)} ${r1(80 - Math.cos(a) * 38)} L${r1(100 + Math.sin(a) * 44)} ${r1(80 - Math.cos(a) * 44)}`} stroke={N} strokeWidth="2" />;
      })}
      <path d="M100 80 V42 M100 80 V118" stroke={N} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M100 80 V118" stroke={c("gold")} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="100" cy="80" r="5" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <text x="124" y="84" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={MONO}>
        30
      </text>
    </g>
  );
}

/** First Move — a sign-up door behind, and the first footprint stepping out. */
function FirstFootprint() {
  const foot = (x: number, y: number, rot: number, tone: string) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx="0" cy="0" rx="9" ry="15" fill={c(tone)} stroke={N} strokeWidth="1.8" />
      {[-6, -2, 2, 6].map((dx, i) => (
        <circle key={i} cx={dx} cy={-20 + Math.abs(dx) * 0.4} r="2.6" fill={c(tone)} stroke={N} strokeWidth="1.2" />
      ))}
    </g>
  );
  return (
    <g>
      <Shadow y={136} rx={72} />
      <rect x="22" y="22" width="52" height="96" rx="3" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <rect x="28" y="28" width="40" height="90" rx="2" fill={c("ice")} stroke={N} strokeWidth="2" />
      <circle cx="60" cy="76" r="3" fill={N} />
      <text x="48" y="48" textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        SIGN
      </text>
      <text x="48" y="58" textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        UP
      </text>
      {foot(98, 112, 70, "ink-muted")}
      {foot(130, 92, 70, "gold")}
      <path d="M150 74 L170 62 M164 60 L170 62 L168 68" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Double Taps — a finger tapping a phone, two ripples on the screen. */
function DoubleTap() {
  return (
    <g>
      <Shadow y={136} rx={54} />
      <PhoneFrame x={56} y={14} w={70} h={120}>
        <circle cx="91" cy="70" r="10" fill="none" stroke={c("ice")} strokeWidth="2.4" />
        <circle cx="91" cy="70" r="20" fill="none" stroke={c("ice")} strokeWidth="2" opacity="0.6" />
        <text x="74" y="44" textAnchor="middle" fontSize="14" fontWeight="900" fill={c("gold-dim")} fontFamily={SANS}>
          ×2
        </text>
      </PhoneFrame>
      <path d="M96 74 Q100 62 108 64 L112 66 V54 Q112 46 118 46 Q124 46 124 54 V78 Q140 76 146 86 L150 118 Q150 132 136 134 L114 134 Q100 132 96 114 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M112 66 V82 M124 78 V90" stroke={N} strokeWidth="1.6" opacity="0.4" />
    </g>
  );
}

/** Two Screens — a phone leaning on a laptop. */
function PhoneLaptop() {
  return (
    <g>
      <Shadow y={136} rx={80} />
      <rect x="20" y="36" width="116" height="74" rx="5" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <rect x="27" y="43" width="102" height="60" rx="2" fill={c("ink")} />
      <path d="M8 112 H148 L140 126 H16 Z" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="36" y="52" width="40" height="8" rx="2" fill={c("turf")} />
      <rect x="36" y="66" width="80" height="5" rx="2" fill={c("ink-muted")} />
      <rect x="36" y="76" width="64" height="5" rx="2" fill={c("ink-muted")} />
      <rect x="36" y="86" width="72" height="5" rx="2" fill={c("ink-muted")} />
      <PhoneFrame x={146} y={52} w={42} h={78}>
        <rect x="154" y="72" width="26" height="6" rx="2" fill={c("turf")} />
        <rect x="154" y="84" width="20" height="4" rx="2" fill={c("ink-muted")} />
        <rect x="154" y="92" width="24" height="4" rx="2" fill={c("ink-muted")} />
      </PhoneFrame>
      <path d="M134 30 Q150 14 166 30 M160 24 L166 30 L158 33" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Time to Join — an hourglass beside a league badge being stamped "joined". */
function JoinHourglass() {
  return (
    <g>
      <Shadow y={136} rx={72} />
      <path d="M30 26 H76 M30 126 H76" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M36 28 Q36 62 53 76 Q36 90 36 124 H70 Q70 90 53 76 Q70 62 70 28 Z" fill={c("ice", 0.25)} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M43 46 H63 L53 70 Z M42 122 Q53 100 64 122 Z" fill={c("gold")} />
      <path d="M128 18 L166 32 V70 Q166 102 128 122 Q90 102 90 70 V32 Z" fill={c("turf")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <Football x={128} y={58} rx={16} rot={-24} />
      <rect x="100" y="80" width="56" height="18" rx="4" fill={c("gold")} stroke={N} strokeWidth="2" transform="rotate(-8 128 89)" />
      <text x="128" y="93" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO} transform="rotate(-8 128 89)">
        JOINED
      </text>
    </g>
  );
}

/** Recurring Revenue — a piggy bank with a coin dropping in and a repeat arrow round it. */
function PiggyRepeat() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <path d="M44 66 A60 52 0 1 1 52 108" fill="none" stroke={c("turf")} strokeWidth="3.2" strokeDasharray="6 5" strokeLinecap="round" />
      <path d="M38 96 L50 110 L60 96" fill="none" stroke={c("turf")} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="104" cy="88" rx="44" ry="32" fill={c("gold-dim")} stroke={N} strokeWidth="2.4" />
      <path d="M78 116 V128 M92 118 V130 M116 118 V130 M130 116 V128" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M78 116 V128 M92 118 V130 M116 118 V130 M130 116 V128" stroke={c("gold-dim")} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="146" cy="88" rx="10" ry="12" fill={c("gold")} stroke={N} strokeWidth="2" />
      <circle cx="143" cy="85" r="1.8" fill={N} />
      <circle cx="149" cy="85" r="1.8" fill={N} />
      <path d="M120 60 L126 46 L134 62 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="128" cy="76" r="3" fill={N} />
      <rect x="92" y="56" width="22" height="5" rx="2" fill={N} />
      <circle cx="103" cy="38" r="12" fill={c("gold")} stroke={N} strokeWidth="2" />
      <text x="103" y="43" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={SANS}>
        $
      </text>
    </g>
  );
}

/** Rolling Seven — a wheel of seven day-segments rolling along, one lit. */
function RollingWheel() {
  return (
    <g>
      <Shadow y={136} rx={70} />
      <path d="M8 128 H192" stroke={c("ink-muted")} strokeWidth="2.4" strokeDasharray="6 5" />
      <circle cx="104" cy="74" r="52" fill={c("ink")} stroke={N} strokeWidth="2.8" />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={slicePath(104, 74, 46, i * (360 / 7) + 20, (i + 1) * (360 / 7) + 20)} fill={i === 0 ? c("gold") : i % 2 ? c("ice", 0.55) : c("turf", 0.55)} stroke={N} strokeWidth="1.6" />
      ))}
      <circle cx="104" cy="74" r="14" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <text x="104" y="79" textAnchor="middle" fontSize="14" fontWeight="900" fill={c("gold")} fontFamily={SANS}>
        7
      </text>
      <path d="M22 60 H40 M14 76 H38 M22 92 H40" stroke={c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Kickoff Rush — a clock at noon with a football swinging on its hands. */
function KickoffClock() {
  return (
    <g>
      <Shadow y={136} rx={56} />
      <circle cx="100" cy="74" r="56" fill={c("ink")} stroke={N} strokeWidth="2.8" />
      <circle cx="100" cy="74" r="48" fill="none" stroke={c("ink-muted")} strokeWidth="1.4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <path key={i} d={`M${r1(100 + Math.sin(a) * 42)} ${r1(74 - Math.cos(a) * 42)} L${r1(100 + Math.sin(a) * 49)} ${r1(74 - Math.cos(a) * 49)}`} stroke={N} strokeWidth={i % 3 === 0 ? 3.4 : 1.8} />;
      })}
      <path d="M100 74 V34" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M100 74 V40" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M100 74 V48" stroke={N} strokeWidth="7" strokeLinecap="round" />
      <path d="M100 74 V50" stroke={c("turf")} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="100" cy="74" r="6" fill={c("gold")} stroke={N} strokeWidth="2" />
      <Football x={100} y={104} rx={16} />
      <path d="M150 20 L158 12 M160 30 L172 26 M46 22 L38 14" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Power Users — a battery charged right to the top, with a bolt. */
function PowerBattery() {
  return (
    <g>
      <Shadow y={136} rx={58} />
      <rect x="54" y="30" width="92" height="102" rx="10" fill={c("night-100")} stroke={N} strokeWidth="2.6" />
      <rect x="84" y="18" width="32" height="14" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="62" y={106 - i * 22} width="76" height="18" rx="3" fill={c("turf")} stroke={N} strokeWidth="1.8" />
      ))}
      <path d="M106 42 L84 82 H100 L92 118 L118 72 H102 L112 42 Z" fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <Sparkle x={36} y={50} r={7} fill={c("gold")} />
      <Sparkle x={164} y={96} r={6} fill={c("gold")} />
    </g>
  );
}

// ── Batch 4: strings, EXISTS and dates (2026-10-06) ──────────────

/** Initial Here — a full-name tag, an arrow, and the same name cut down to an initial. */
function NameInitial() {
  return (
    <g>
      <Shadow y={136} rx={80} />
      <rect x="12" y="34" width="86" height="46" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="12" y="34" width="86" height="14" rx="6" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="55" y="70" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={MONO}>
        FIRST LAST
      </text>
      <path d="M104 58 H128 M120 50 L130 58 L120 66" fill="none" stroke={c("gold")} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="134" y="38" width="56" height="40" rx="6" fill={c("turf")} stroke={N} strokeWidth="2.4" />
      <text x="162" y="64" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={MONO}>
        F.LAST
      </text>
      <path d="M30 104 H82 M30 116 H70" stroke={c("ink-muted")} strokeWidth="4" strokeLinecap="round" />
      <path d="M142 104 H182" stroke={c("ink-muted")} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/** Two T.Hills — two different jerseys, the same name bar across both backs. */
function TwoJerseys() {
  const jersey = (x: number, fill: string) => (
    <g>
      <path
        d={`M${x - 26} 30 L${x - 40} 40 L${x - 52} 58 L${x - 42} 68 L${x - 34} 60 V124 H${x + 34} V60 L${x + 42} 68 L${x + 52} 58 L${x + 40} 40 L${x + 26} 30 Q${x} 40 ${x - 26} 30 Z`}
        fill={fill}
        stroke={N}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x={x - 26} y="50" width="52" height="16" rx="3" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      <text x={x} y="62" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
        T.HILL
      </text>
    </g>
  );
  return (
    <g>
      <Shadow y={136} rx={84} />
      {jersey(54, c("ice"))}
      {jersey(146, c("gold"))}
      <text x="100" y="104" textAnchor="middle" fontSize="28" fontWeight="900" fill={c("turf")} stroke={N} strokeWidth="1.2" fontFamily={SANS}>
        ?
      </text>
    </g>
  );
}

/** Right Name, Right Team — a key whose three teeth are name, team and week. */
function CompositeKey() {
  return (
    <g>
      <Shadow y={134} rx={74} />
      <circle cx="46" cy="76" r="30" fill={c("gold")} stroke={N} strokeWidth="2.6" />
      <circle cx="46" cy="76" r="12" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <rect x="72" y="68" width="112" height="16" rx="3" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      {[
        [92, "NAME", c("ice")],
        [124, "TEAM", c("turf")],
        [156, "WEEK", c("ink-soft")],
      ].map(([x, label, fill]) => (
        <g key={label as string}>
          <rect x={(x as number) - 12} y="84" width="24" height="26" rx="2" fill={fill as string} stroke={N} strokeWidth="2" />
          <text x={x as number} y="124" textAnchor="middle" fontSize="8" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
            {label as string}
          </text>
        </g>
      ))}
      <Sparkle x={166} y={44} r={7} fill={c("gold")} />
    </g>
  );
}

/** Never Below Ten — every bar standing clear of a dashed floor marked 10. */
function FloorTen() {
  const bars = [62, 48, 74, 56, 66, 80];
  return (
    <g>
      <Shadow y={132} rx={80} />
      <path d="M20 128 H182" stroke={c("ink-muted")} strokeWidth="2.4" />
      {bars.map((h, i) => (
        <rect key={i} x={30 + i * 21} y={128 - h} width="15" height={h} rx="2" fill={i % 2 ? c("turf") : c("ice")} stroke={N} strokeWidth="1.8" />
      ))}
      <path d="M18 98 H184" stroke={c("gold")} strokeWidth="3" strokeDasharray="7 5" />
      <rect x="150" y="104" width="34" height="18" rx="4" fill={c("gold")} stroke={N} strokeWidth="1.8" />
      <text x="167" y="117" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
        10
      </text>
    </g>
  );
}

/** Better Than Usual — a player's games as dots, the ones above his own average line lit. */
function AboveUsual() {
  const dots: [number, number][] = [
    [24, 92], [42, 64], [60, 98], [78, 56], [96, 86], [114, 48], [132, 94], [150, 60], [168, 52],
  ];
  return (
    <g>
      <Shadow y={134} rx={80} />
      <path d="M14 126 H186" stroke={c("ink-muted")} strokeWidth="2.4" />
      <path d="M14 76 H186" stroke={c("ink-soft")} strokeWidth="2.6" strokeDasharray="7 5" />
      <text x="186" y="90" textAnchor="end" fontSize="9" fontWeight="900" fill={c("ink-muted")} fontFamily={MONO}>
        HIS AVG
      </text>
      <path d={`M${dots.map(([x, y]) => `${x} ${y}`).join(" L")}`} fill="none" stroke={c("ink-muted")} strokeWidth="1.6" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={y < 76 ? 7 : 5} fill={y < 76 ? c("gold") : c("ice", 0.6)} stroke={N} strokeWidth="1.8" />
      ))}
    </g>
  );
}

/** Names That Break — a name tag torn in two at the apostrophe. */
function TornName() {
  return (
    <g>
      <Shadow y={134} rx={78} />
      <g transform="rotate(-6 60 76)">
        <path d="M14 46 H94 L88 60 L96 72 L86 86 L94 104 H14 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="14" y="46" width="76" height="14" fill={c("ice")} stroke={N} strokeWidth="1.8" />
        <text x="50" y="88" textAnchor="middle" fontSize="20" fontWeight="900" fill={N} fontFamily={MONO}>
          JA&apos;
        </text>
      </g>
      <g transform="rotate(8 140 80)">
        <path d="M108 50 L114 64 L106 76 L116 90 L108 108 H188 V50 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="112" y="50" width="76" height="14" fill={c("ice")} stroke={N} strokeWidth="1.8" />
        <text x="150" y="92" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={MONO}>
          MARR
        </text>
      </g>
      <path d="M100 30 L96 40 M104 30 L108 40" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** September Stars — a calendar page for SEP with a star and a ball on it. */
function SeptemberPage() {
  return (
    <g>
      <Shadow y={136} rx={60} />
      <rect x="46" y="22" width="108" height="106" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="46" y="22" width="108" height="28" rx="6" fill={c("gold")} stroke={N} strokeWidth="2.2" />
      <text x="100" y="42" textAnchor="middle" fontSize="15" fontWeight="900" fill={N} fontFamily={MONO}>
        SEP
      </text>
      <path d="M68 16 V30 M132 16 V30" stroke={N} strokeWidth="4" strokeLinecap="round" />
      <path d={starPath(100, 84, 5, 26, 11, -90)} fill={c("gold")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <Football x={136} y={112} rx={13} rot={-20} />
      <path d="M58 112 H82" stroke={c("ink-muted")} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/** Never in a Shootout — a high-scoring scoreboard behind a no-entry sign. */
function NoShootout() {
  return (
    <g>
      <Shadow y={136} rx={70} />
      <path d="M62 128 V112 M138 128 V112" stroke={N} strokeWidth="6" />
      <rect x="28" y="26" width="144" height="88" rx="6" fill={c("night-100")} stroke={N} strokeWidth="2.6" />
      <text x="86" y="78" textAnchor="middle" fontSize="28" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        38–31
      </text>
      <circle cx="166" cy="104" r="22" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <circle cx="166" cy="104" r="16" fill="none" stroke={c("ice")} strokeWidth="4.5" />
      <path d="M155 115 L177 93" stroke={c("ice")} strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}

/** What Week Is It? — a calendar page whose week number is a question mark. */
function WeekQuestion() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="40" y="24" width="120" height="104" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="40" y="24" width="120" height="26" rx="6" fill={c("gold")} stroke={N} strokeWidth="2.2" />
      <text x="100" y="43" textAnchor="middle" fontSize="14" fontWeight="900" fill={N} fontFamily={MONO}>
        WEEK
      </text>
      <path d="M64 16 V30 M136 16 V30" stroke={N} strokeWidth="4" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={50 + i * 15} y="58" width="11" height="9" rx="1.5" fill={i === 6 ? c("gold") : c("ink-muted", 0.5)} stroke={N} strokeWidth="1.2" />
      ))}
      <text x="100" y="116" textAnchor="middle" fontSize="44" fontWeight="900" fill={c("night-100")} stroke={N} strokeWidth="1.4" fontFamily={SANS}>
        ?
      </text>
      <circle cx="152" cy="118" r="14" fill={c("turf")} stroke={N} strokeWidth="2.2" />
      <text x="152" y="123" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={MONO}>
        7
      </text>
    </g>
  );
}

/** Week Starting Monday — a week strip with Monday circled and an arrow running back to it. */
function MondayStrip() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <g>
      <Shadow y={132} rx={84} />
      {days.map((d, i) => (
        <g key={i}>
          <rect x={18 + i * 24} y="58" width="20" height="34" rx="3" fill={i === 0 ? c("ice") : c("ink")} stroke={N} strokeWidth="2" />
          <text x={28 + i * 24} y="80" textAnchor="middle" fontSize="12" fontWeight="900" fill={N} fontFamily={MONO}>
            {d}
          </text>
        </g>
      ))}
      <circle cx="28" cy="75" r="20" fill="none" stroke={c("gold")} strokeWidth="3" />
      <path d="M170 104 Q100 128 40 102" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M48 96 L38 101 L46 110" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="62" y="22" width="76" height="22" rx="4" fill={c("night-100")} stroke={N} strokeWidth="2" />
      <text x="100" y="37" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("ice")} fontFamily={MONO}>
        WEEK OF
      </text>
    </g>
  );
}

/** The Stack — a QB block with a teammate's block stacked on top, both lit. */
function QbStack() {
  const block = (y: number, label: string, fill: string) => (
    <g>
      <rect x="56" y={y} width="88" height="34" rx="5" fill={fill} stroke={N} strokeWidth="2.4" />
      <rect x="56" y={y} width="88" height="8" rx="4" fill={c("ink", 0.35)} />
      <text x="100" y={y + 25} textAnchor="middle" fontSize="16" fontWeight="900" fill={N} fontFamily={MONO}>
        {label}
      </text>
    </g>
  );
  return (
    <g>
      <Shadow y={134} rx={66} />
      {block(92, "QB", c("turf"))}
      {block(56, "WR", c("ice"))}
      <Flame x={100} y={56} s={0.55} outer={c("gold")} inner={c("ink")} />
      <Sparkle x={160} y={60} r={7} fill={c("gold")} />
      <Sparkle x={42} y={86} r={5} fill={c("gold")} />
    </g>
  );
}

/** Dual Threat — a quarterback with one arrow arcing through the air and one along the ground, both into the end zone. */
function DualThreat() {
  return (
    <g>
      <Shadow y={134} rx={84} />
      <rect x="162" y="30" width="28" height="98" fill={c("turf", 0.35)} stroke={N} strokeWidth="2" />
      <path d="M162 30 V128" stroke={c("ink")} strokeWidth="2.4" />
      <Player x={52} y={128} s={0.82} pose="throw" jersey="gold" label="QB" />
      <path d="M70 46 Q120 4 172 52" fill="none" stroke={c("ice")} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
      <path d="M164 44 L174 54 L176 40" fill="none" stroke={c("ice")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M74 118 H170" stroke={c("gold")} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M162 111 L172 118 L162 125" fill="none" stroke={c("gold")} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <Football x={176} y={64} rx={9} rot={30} />
    </g>
  );
}

/** Full Kit — a jersey, a hoodie and a cap in one team's colour, with a tick for owning all three. */
function FullKit() {
  return (
    <g>
      <Shadow y={134} rx={84} />
      {/* jersey */}
      <path d="M38 40 L22 50 L12 66 L22 74 L28 68 V122 H76 V68 L82 74 L92 66 L82 50 L66 40 Q52 48 38 40 Z" fill={c("ice")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="40" y="76" width="24" height="18" rx="2" fill={c("ink")} stroke={N} strokeWidth="1.6" />
      {/* hoodie */}
      <path d="M112 56 Q126 40 140 56 L156 64 L164 96 L152 98 L150 84 V124 H102 V84 L100 98 L88 96 L96 64 Z" fill={c("ice")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M116 58 Q126 70 136 58" fill="none" stroke={N} strokeWidth="2" />
      <rect x="112" y="98" width="28" height="12" rx="3" fill={c("ink", 0.5)} stroke={N} strokeWidth="1.4" />
      {/* cap */}
      <path d="M150 40 Q166 16 184 34 L186 42 Z" fill={c("ice")} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M150 40 H192 L194 46 H148 Z" fill={c("ink")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="172" cy="114" r="14" fill={c("turf")} stroke={N} strokeWidth="2.2" />
      <path d="M165 114 L170 119 L180 108" fill="none" stroke={N} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Waiver Headline — a newsletter sheet with a bold headline and a "+32.6" tag. */
function HeadlineSheet() {
  return (
    <g>
      <Shadow y={136} rx={62} />
      <rect x="46" y="20" width="108" height="112" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="56" y="30" width="88" height="10" rx="2" fill={c("night-100")} />
      <rect x="56" y="48" width="70" height="8" rx="2" fill={c("ink-muted")} />
      <rect x="56" y="62" width="88" height="5" rx="2" fill={c("ink-muted", 0.5)} />
      <rect x="56" y="72" width="80" height="5" rx="2" fill={c("ink-muted", 0.5)} />
      <rect x="56" y="82" width="86" height="5" rx="2" fill={c("ink-muted", 0.5)} />
      <rect x="56" y="98" width="38" height="24" rx="3" fill={c("ice", 0.6)} stroke={N} strokeWidth="1.6" />
      <rect x="112" y="92" width="62" height="26" rx="5" fill={c("turf")} stroke={N} strokeWidth="2.2" transform="rotate(-8 143 105)" />
      <text x="143" y="110" textAnchor="middle" fontSize="14" fontWeight="900" fill={N} fontFamily={MONO} transform="rotate(-8 143 105)">
        +32.6
      </text>
    </g>
  );
}

/** The Aha Moment — a lit bulb over a lineup card with its slots ticked. */
function LightbulbLineup() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="58" y="70" width="84" height="60" rx="5" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="68" y={80 + i * 15} width="46" height="8" rx="2" fill={c("ink-muted", 0.6)} />
          <path d={`M122 ${85 + i * 15} L126 ${89 + i * 15} L134 ${80 + i * 15}`} fill="none" stroke={c("turf")} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <circle cx="100" cy="36" r="20" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      <path d="M93 54 H107 V62 H93 Z" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <path d="M94 38 Q100 28 106 38" fill="none" stroke={N} strokeWidth="2" />
      {[[-34, -6], [34, -6], [-26, -26], [26, -26], [0, -34]].map(([dx, dy], i) => (
        <path key={i} d={`M${100 + dx * 0.78} ${36 + dy * 0.78} L${100 + dx} ${36 + dy}`} stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      ))}
    </g>
  );
}

/** Quarterly Report — a report sheet with four bars, Q1 to Q4, the last one towering. */
function QuarterBars() {
  const bars: [string, number][] = [["Q1", 22], ["Q2", 14], ["Q3", 40], ["Q4", 82]];
  return (
    <g>
      <Shadow y={136} rx={70} />
      <rect x="34" y="18" width="132" height="114" rx="5" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="44" y="27" width="56" height="8" rx="2" fill={c("night-100")} />
      <path d="M46 116 H156" stroke={c("ink-muted")} strokeWidth="2" />
      {bars.map(([label, h], i) => (
        <g key={label}>
          <rect x={52 + i * 26} y={116 - h} width="18" height={h} rx="2" fill={i === 3 ? c("gold") : c("ice")} stroke={N} strokeWidth="1.8" />
          <text x={61 + i * 26} y="127" textAnchor="middle" fontSize="8" fontWeight="900" fill={c("night-100")} fontFamily={MONO}>
            {label}
          </text>
        </g>
      ))}
      <path d="M118 44 L132 30 L146 38" fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Biggest Jump — a low bar and a tall one, a football leaping from one to the other. */
function BigJump() {
  return (
    <g>
      <Shadow y={134} rx={78} />
      <path d="M20 128 H180" stroke={c("ink-muted")} strokeWidth="2.4" />
      <rect x="34" y="104" width="34" height="24" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="2" />
      <rect x="132" y="40" width="34" height="88" rx="3" fill={c("ice")} stroke={N} strokeWidth="2.2" />
      <path d="M52 98 Q90 6 146 34" fill="none" stroke={c("gold")} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
      <Football x={104} y={30} rx={13} rot={20} />
      <path d="M118 84 V58 M110 66 L118 56 L126 66" fill="none" stroke={c("turf")} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** New Season High — high-jump uprights with the bar set at a new mark, the old marks below it. */
function HighBar() {
  return (
    <g>
      <Shadow y={134} rx={72} />
      <path d="M44 128 V24 M156 128 V24" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M44 128 V24 M156 128 V24" stroke={c("ink-soft")} strokeWidth="3" strokeLinecap="round" />
      {[104, 88, 74].map((y, i) => (
        <path key={i} d={`M50 ${y} H150`} stroke={c("ink-muted", 0.6)} strokeWidth="2.4" strokeDasharray="5 5" />
      ))}
      <rect x="40" y="46" width="120" height="8" rx="4" fill={c("gold")} stroke={N} strokeWidth="2" />
      <path d="M100 40 V22 M92 30 L100 20 L108 30" fill="none" stroke={c("turf")} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <Sparkle x={168} y={40} r={7} fill={c("gold")} />
    </g>
  );
}

/** The Ceiling — bars of every height under a dashed ceiling, one poking through it. */
function CeilingLine() {
  const bars = [44, 70, 52, 86, 60, 102, 48];
  return (
    <g>
      <Shadow y={134} rx={80} />
      <path d="M20 128 H180" stroke={c("ink-muted")} strokeWidth="2.4" />
      {bars.map((h, i) => (
        <rect key={i} x={28 + i * 21} y={128 - h} width="15" height={h} rx="2" fill={h > 90 ? c("gold") : c("turf")} stroke={N} strokeWidth="1.8" />
      ))}
      <path d="M16 40 H184" stroke={c("ice")} strokeWidth="3" strokeDasharray="8 5" />
      <rect x="144" y="16" width="40" height="18" rx="4" fill={c("ice")} stroke={N} strokeWidth="1.8" />
      <text x="164" y="29" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        P90
      </text>
    </g>
  );
}

/** Head to Head — two helmets facing each other across a VS. */
function TwoHelmets() {
  const helmet = (fill: string) => (
    <g>
      <path d="M-34 14 Q-40 -30 0 -34 Q34 -34 36 0 L36 12 L18 12 L14 22 L-26 22 Z" fill={fill} stroke={N} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M-6 -33 Q-14 -6 -10 21" fill="none" stroke={c("ink", 0.55)} strokeWidth="4" />
      <circle cx="6" cy="4" r="5" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <path d="M30 0 H44 M30 12 H44 M40 -6 V20" stroke={c("ink-soft")} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <Shadow y={132} rx={84} />
      <g transform="translate(54 82)">{helmet(c("ice"))}</g>
      <g transform="translate(146 82) scale(-1 1)">{helmet(c("gold"))}</g>
      <circle cx="100" cy="80" r="17" fill={c("night-100")} stroke={N} strokeWidth="2.4" />
      <text x="100" y="86" textAnchor="middle" fontSize="14" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        VS
      </text>
    </g>
  );
}

/** Box Score Lines — a printout of name lines, each ending in a points figure. */
function BoxLines() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <path d="M44 20 H156 V122 L148 128 L140 122 L132 128 L124 122 L116 128 L108 122 L100 128 L92 122 L84 128 L76 122 L68 128 L60 122 L52 128 L44 122 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="56" y={34 + i * 20} width={i === 0 ? 50 : 44 - i * 4} height="8" rx="2" fill={c("ink-muted", 0.7)} />
          <rect x="120" y={34 + i * 20} width="26" height="8" rx="2" fill={i === 0 ? c("gold") : c("turf", 0.8)} stroke={N} strokeWidth="1" />
        </g>
      ))}
      <text x="133" y="117" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("night-100")} fontFamily={MONO}>
        PTS
      </text>
    </g>
  );
}

/** Top Two Games — a podium with only first and second places, a ball on each. */
function TwoPodium() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <rect x="52" y="70" width="48" height="58" rx="3" fill={c("gold")} stroke={N} strokeWidth="2.4" />
      <rect x="100" y="90" width="48" height="38" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" />
      <text x="76" y="108" textAnchor="middle" fontSize="22" fontWeight="900" fill={N} fontFamily={MONO}>
        1
      </text>
      <text x="124" y="118" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={MONO}>
        2
      </text>
      <Football x={76} y={56} rx={15} rot={-15} />
      <Football x={124} y={77} rx={13} rot={15} />
      <Sparkle x={44} y={46} r={6} fill={c("gold")} />
    </g>
  );
}

/** Hot Streak — a chain of game tiles, every link on fire. */
function FireChain() {
  return (
    <g>
      <Shadow y={134} rx={84} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={18 + i * 34} y="88" width="28" height="34" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.2" />
          <text x={32 + i * 34} y="110" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("night-100")} fontFamily={MONO}>
            15+
          </text>
          {i < 4 && <path d={`M${46 + i * 34} 105 H${52 + i * 34}`} stroke={c("gold")} strokeWidth="3" />}
          <Flame x={32 + i * 34} y={86} s={0.42} outer={c("gold")} inner={c("ink")} />
        </g>
      ))}
    </g>
  );
}

/** Average of Averages — a balance with a big weight and a small one, tipped toward the big one. */
function BalanceScale() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <path d="M100 128 V40" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <path d="M100 128 V40" stroke={c("ink-soft")} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M78 128 H122" stroke={N} strokeWidth="6" strokeLinecap="round" />
      <g transform="rotate(10 100 44)">
        <path d="M40 44 H160" stroke={c("gold")} strokeWidth="5" strokeLinecap="round" />
        <path d="M48 44 L38 78 M48 44 L58 78 M152 44 L142 78 M152 44 L162 78" stroke={c("ink-muted")} strokeWidth="1.8" />
        <path d="M34 78 H62 Q48 90 34 78 Z" fill={c("ink")} stroke={N} strokeWidth="2" />
        <path d="M138 78 H166 Q152 90 138 78 Z" fill={c("ink")} stroke={N} strokeWidth="2" />
        <rect x="41" y="64" width="14" height="14" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.8" />
        <rect x="139" y="48" width="26" height="30" rx="3" fill={c("ice")} stroke={N} strokeWidth="2" />
        <text x="152" y="68" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
          17
        </text>
        <text x="48" y="75" textAnchor="middle" fontSize="7" fontWeight="900" fill={N} fontFamily={MONO}>
          13
        </text>
      </g>
      <circle cx="100" cy="44" r="6" fill={c("gold")} stroke={N} strokeWidth="2" />
    </g>
  );
}

/** What the Codes Cost — a coupon with a big percentage and a dashed cut line. */
function CouponPercent() {
  return (
    <g>
      <Shadow y={134} rx={78} />
      <g transform="rotate(-6 100 78)">
        <path d="M24 44 H176 V64 A10 10 0 0 0 176 84 V112 H24 V84 A10 10 0 0 0 24 64 Z" fill={c("gold")} stroke={N} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M60 50 V106" stroke={N} strokeWidth="2" strokeDasharray="5 4" />
        <text x="118" y="88" textAnchor="middle" fontSize="30" fontWeight="900" fill={N} fontFamily={SANS}>
          20%
        </text>
        <text x="42" y="82" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO} transform="rotate(-90 42 78)">
          CODE
        </text>
      </g>
      <path d="M150 116 L174 132 M150 132 L174 116" stroke={c("ink")} strokeWidth="3" strokeLinecap="round" />
      <circle cx="148" cy="114" r="5" fill="none" stroke={c("ink")} strokeWidth="2.4" />
      <circle cx="148" cy="134" r="5" fill="none" stroke={c("ink")} strokeWidth="2.4" />
    </g>
  );
}

/** Home Turf Touchdowns — a house standing in the end zone with a ball crossing the goal line. */
function HomeEndZone() {
  return (
    <g>
      <Shadow y={134} rx={84} />
      <rect x="16" y="96" width="168" height="34" rx="3" fill={c("turf", 0.35)} stroke={N} strokeWidth="2" />
      <path d="M120 96 V130" stroke={c("ink")} strokeWidth="2.6" />
      <path d="M128 96 L156 74 L184 96 Z" fill={c("gold")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="134" y="96" width="44" height="30" fill={c("ink")} stroke={N} strokeWidth="2.2" />
      <rect x="150" y="106" width="12" height="20" rx="1" fill={c("turf")} stroke={N} strokeWidth="1.8" />
      <path d="M40 66 Q80 30 116 86" fill="none" stroke={c("ice")} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
      <Football x={118} y={88} rx={12} rot={40} />
      <text x="62" y="120" textAnchor="middle" fontSize="13" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        TD
      </text>
    </g>
  );
}

/** Days Between Orders — shopping bags along a timeline, the gaps between them measured. */
function OrderGaps() {
  const bag = (x: number, fill: string) => (
    <g>
      <rect x={x - 16} y="56" width="32" height="38" rx="3" fill={fill} stroke={N} strokeWidth="2.2" />
      <path d={`M${x - 8} 56 V48 Q${x} 38 ${x + 8} 48 V56`} fill="none" stroke={N} strokeWidth="2.2" />
    </g>
  );
  return (
    <g>
      <Shadow y={132} rx={84} />
      <path d="M14 104 H186" stroke={c("ink-muted")} strokeWidth="2.4" />
      {bag(36, c("ice"))}
      {bag(98, c("gold"))}
      {bag(164, c("turf"))}
      {[[52, 82], [114, 148]].map(([a, b]) => (
        <g key={a}>
          <path d={`M${a} 116 H${b}`} stroke={c("ink")} strokeWidth="2.2" />
          <path d={`M${a} 110 V122 M${b} 110 V122`} stroke={c("ink")} strokeWidth="2.2" />
        </g>
      ))}
      <text x="67" y="134" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("ink-soft")} fontFamily={MONO}>
        DAYS
      </text>
      <text x="131" y="134" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("ink-soft")} fontFamily={MONO}>
        DAYS
      </text>
    </g>
  );
}

/** Team Sheets — a team's sheet with its players run together on one line. */
function TeamSheet() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="40" y="22" width="120" height="108" rx="5" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="40" y="22" width="120" height="24" rx="5" fill={c("gold")} stroke={N} strokeWidth="2.2" />
      <rect x="54" y="30" width="56" height="8" rx="2" fill={N} />
      <rect x="52" y="62" width="40" height="10" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.4" />
      <text x="97" y="72" textAnchor="middle" fontSize="14" fontWeight="900" fill={N} fontFamily={MONO}>
        ,
      </text>
      <rect x="102" y="62" width="46" height="10" rx="2" fill={c("turf")} stroke={N} strokeWidth="1.4" />
      <rect x="52" y="86" width="96" height="6" rx="2" fill={c("ink-muted", 0.5)} />
      <rect x="52" y="100" width="80" height="6" rx="2" fill={c("ink-muted", 0.5)} />
      <rect x="52" y="114" width="88" height="6" rx="2" fill={c("ink-muted", 0.5)} />
    </g>
  );
}

/** Every Day of the Week — seven day tiles, every one ticked. */
function SevenTicks() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <g>
      <Shadow y={128} rx={86} />
      {days.map((d, i) => (
        <g key={i}>
          <rect x={14 + i * 25} y="48" width="21" height="50" rx="3" fill={c("ink")} stroke={N} strokeWidth="2" />
          <text x={24.5 + i * 25} y="64" textAnchor="middle" fontSize="11" fontWeight="900" fill={c("night-100")} fontFamily={MONO}>
            {d}
          </text>
          <path d={`M${18 + i * 25} 80 L${23 + i * 25} 86 L${31 + i * 25} 74`} fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <Sparkle x={182} y={36} r={7} fill={c("gold")} />
    </g>
  );
}

/** Perfect Week — a roster card where every slot has a 15+ tick. */
function PerfectWeek() {
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="44" y="24" width="112" height="104" rx="6" fill={c("ink")} stroke={N} strokeWidth="2.4" />
      <rect x="44" y="24" width="112" height="22" rx="6" fill={c("turf")} stroke={N} strokeWidth="2.2" />
      <rect x="56" y="31" width="48" height="8" rx="2" fill={N} />
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x="56" y={58 + i * 30} width="52" height="18" rx="3" fill={c("ink-muted", 0.5)} />
          <rect x="114" y={58 + i * 30} width="24" height="18" rx="3" fill={c("gold")} stroke={N} strokeWidth="1.6" />
          <text x="126" y={71 + i * 30} textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
            15+
          </text>
          <path d={`M142 ${66 + i * 30} L146 ${71 + i * 30} L154 ${61 + i * 30}`} fill="none" stroke={c("turf")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <Sparkle x={168} y={30} r={8} fill={c("gold")} />
    </g>
  );
}

/** Two-Minute Drill — a game clock on 2:00 with a pass arcing out of it. */
function TwoMinuteClock() {
  return (
    <g>
      <Shadow y={134} rx={70} />
      <path d="M86 128 V108 M114 128 V108" stroke={N} strokeWidth="6" />
      <rect x="44" y="50" width="112" height="60" rx="6" fill={c("night-100")} stroke={N} strokeWidth="2.6" />
      <text x="100" y="94" textAnchor="middle" fontSize="34" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        2:00
      </text>
      <rect x="66" y="38" width="68" height="14" rx="3" fill={c("ink")} stroke={N} strokeWidth="1.8" />
      <text x="100" y="49" textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
        4TH QTR
      </text>
      <path d="M152 52 Q176 20 188 40" fill="none" stroke={c("ice")} strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />
      <Football x={186} y={44} rx={9} rot={40} />
    </g>
  );
}

/** Order References — a ticket stub with a padded reference and a barcode. */
function OrderTicket() {
  return (
    <g>
      <Shadow y={134} rx={78} />
      <path d="M22 50 H178 V70 A8 8 0 0 0 178 86 V106 H22 V86 A8 8 0 0 0 22 70 Z" fill={c("ink")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <text x="88" y="76" textAnchor="middle" fontSize="14" fontWeight="900" fill={N} fontFamily={MONO}>
        GG-02248
      </text>
      <rect x="38" y="84" width="40" height="12" rx="2" fill={c("ice")} stroke={N} strokeWidth="1.4" />
      <text x="58" y="94" textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        WEB
      </text>
      {[0, 3, 5, 9, 11, 14, 17, 19, 23, 26].map((x, i) => (
        <rect key={i} x={140 + x} y="58" width={i % 3 ? 2 : 3} height="38" fill={N} />
      ))}
    </g>
  );
}

/** Seven Calendar Days — a bracket over seven days of a calendar strip, some days empty. */
function SevenDayWindow() {
  const sales = [1, 0, 1, 1, 0, 0, 1, 1, 0];
  return (
    <g>
      <Shadow y={132} rx={88} />
      {sales.map((has, i) => (
        <g key={i}>
          <rect x={10 + i * 20} y="62" width="17" height="40" rx="3" fill={has ? c("ink") : c("ink-muted", 0.25)} stroke={N} strokeWidth="1.8" />
          {has ? <rect x={14 + i * 20} y={98 - 10 - (i % 3) * 6} width="9" height={10 + (i % 3) * 6} fill={c("turf")} stroke={N} strokeWidth="1.2" /> : null}
        </g>
      ))}
      <path d="M48 52 V44 H186 V52" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="117" y="38" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("gold")} fontFamily={MONO}>
        7 DAYS
      </text>
    </g>
  );
}

/** Three and Out — three down markers crossed out, then a punt sailing away. */
function ThreeAndOut() {
  return (
    <g>
      <Shadow y={134} rx={84} />
      {[1, 2, 3].map((d, i) => (
        <g key={d}>
          <rect x={20 + i * 34} y="70" width="28" height="34" rx="4" fill={c("ink")} stroke={N} strokeWidth="2.2" />
          <text x={34 + i * 34} y="94" textAnchor="middle" fontSize="18" fontWeight="900" fill={N} fontFamily={MONO}>
            {d}
          </text>
          <path d={`M${24 + i * 34} 74 L${44 + i * 34} 100`} stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      <path d="M128 100 Q156 18 186 70" fill="none" stroke={c("ice")} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
      <Football x={176} y={50} rx={11} rot={50} />
      <text x="150" y="122" textAnchor="middle" fontSize="11" fontWeight="900" fill={c("ink-soft")} fontFamily={MONO}>
        PUNT
      </text>
    </g>
  );
}

/** Field Position — a strip of field with yard numbers and a flag where the drive starts. */
function FieldMarker() {
  return (
    <g>
      <Shadow y={132} rx={88} />
      <rect x="10" y="66" width="180" height="50" rx="3" fill={c("turf", 0.35)} stroke={N} strokeWidth="2" />
      {[30, 70, 110, 150].map((x) => (
        <path key={x} d={`M${x} 66 V116`} stroke={c("ink", 0.6)} strokeWidth="2" />
      ))}
      {[["20", 30], ["40", 70], ["40", 110], ["20", 150]].map(([t, x]) => (
        <text key={`${t}${x}`} x={x as number} y="108" textAnchor="middle" fontSize="10" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
          {t}
        </text>
      ))}
      <path d="M118 66 V30" stroke={N} strokeWidth="3" />
      <path d="M118 30 L144 38 L118 46 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M118 84 H178" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M170 78 L180 84 L170 90" fill="none" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Drives That Score — drive arrows across a field, most ending at the goalposts. */
function ScoringDrive() {
  return (
    <g>
      <Shadow y={134} rx={84} />
      <rect x="10" y="60" width="150" height="60" rx="3" fill={c("turf", 0.3)} stroke={N} strokeWidth="2" />
      <path d="M160 120 V60" stroke={c("ink")} strokeWidth="2.4" />
      <path d="M176 120 V84 M168 84 H184 M168 84 V52 M184 84 V52" fill="none" stroke={c("gold")} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {[[20, 72, 150, true], [40, 90, 150, true], [30, 108, 96, false]].map(([x, y, to, scored], i) => (
        <g key={i}>
          <path d={`M${x} ${y} H${to}`} stroke={scored ? c("ice") : c("ink-muted")} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${(to as number) - 8} ${(y as number) - 6} L${to} ${y} L${(to as number) - 8} ${(y as number) + 6}`} fill="none" stroke={scored ? c("ice") : c("ink-muted")} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <Sparkle x={176} y={36} r={8} fill={c("gold")} />
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
  "sandwich-board": SandwichBoard,
  "ice-cube": IceCube,
  slide: Slide,
  clipboard: Clipboard,
  fingerprint: Fingerprint,
  balloon: Balloon,
  colander: Colander,
  "magic-hat": MagicHat,
  "tug-of-war": TugOfWar,
  sweater: Sweater,
  suitcase: Suitcase,
  "starting-blocks": StartingBlocks,
  "tier-cake": TierCake,
  castle: Castle,
  seesaw: Seesaw,
  boomerang: Boomerang,
  spring: Spring,
  speedometer: Speedometer,
  elevator: Elevator,
  "spirit-level": SpiritLevel,
  "trash-can": TrashCan,
  "crunch-clock": CrunchClock,
  mug: Mug,
  "draft-board": DraftBoard,
  "beach-umbrella": BeachUmbrella,
  "winged-shoes": WingedShoes,
  shelf: Shelf,
  "spare-tire": SpareTire,
  vinyl: Vinyl,
  "growth-chart": GrowthChart,
  "face-off": FaceOff,
  pile: Pile,
  pillow: Pillow,
  "u-turn": UTurn,
  "tackle-dummy": TackleDummy,
  robin: Robin,
  "road-trip": RoadTrip,
  halfway: Halfway,
  "desk-fan": DeskFan,
  "empty-seats": EmptySeats,
  "first-look": FirstLook,
  "game-of-the-year": GameOfTheYear,
  "ten-big-weeks": TenBigWeeks,
  "hands-in": HandsIn,
  "form-line": FormLine,
  "moving-box": MovingBox,
  "qb-grid": QbGrid,
  "steady-hands": SteadyHands,
  "where-was": WhereWas,
  "race-to-200": RaceTo200,
  "four-spots": FourSpots,
  "name-tags": NameTags,
  "tally-marks": TallyMarks,
  "per-game": PerGame,
  "tall-bar": TallBar,
  "steady-streaky": SteadyStreaky,
  "game-tags": GameTags,
  "stacked-blocks": StackedBlocks,
  leap: Leap,
  pennants: Pennants,
  "above-line": AboveLine,
  "adding-machine": AddingMachine,
  "middle-ball": MiddleBall,
  stamp: Stamp,
  "silver-medal": SilverMedal,
  backfield: Backfield,
  "crowned-receiver": CrownedReceiver,
  "rank-board": RankBoard,
  "blank-cell": BlankCell,
  "empty-weeks": EmptyWeeks,
  "twenty-cells": TwentyCells,
  crosshairs: Crosshairs,
  "which-week": WhichWeek,
  "not-on-sheet": NotOnSheet,
  "shopping-bag": ShoppingBag,
  "rush-cart": RushCart,
  "cash-register": CashRegister,
  "shop-window": ShopWindow,
  basket: Basket,
  "welcome-mat": WelcomeMat,
  "return-box": ReturnBox,
  "price-tag": PriceTag,
  coupon: Coupon,
  "wallet-crown": WalletCrown,
  "two-dates": TwoDates,
  "blank-form": BlankForm,
  "free-truck": FreeTruck,
  "heart-jersey": HeartJersey,
  "coin-steps": CoinSteps,
  "signup-hourglass": SignupHourglass,
  "fourth-down-sign": FourthDownSign,
  "go-chart": GoChart,
  "third-down-chains": ThirdDownChains,
  "red-zone-flag": RedZoneFlag,
  "chunk-ruler": ChunkRuler,
  "script-card": ScriptCard,
  "deep-bomb": DeepBomb,
  "target-bullseye": TargetBullseye,
  "long-kick": LongKick,
  "ep-gauge": EpGauge,
  "turnover-scale": TurnoverScale,
  "comeback-scoreboard": ComebackScoreboard,
  "hot-hand-flame": HotHandFlame,
  "dome-sun": DomeSun,
  "yard-cow": YardCow,
  "sack-qb": SackQb,
  "marathon-chain": MarathonChain,
  "phone-sunday": PhoneSunday,
  "dau-counter": DauCounter,
  "peak-mountain": PeakMountain,
  "glue-phone": GluePhone,
  "seven-calendar": SevenCalendar,
  "funnel-steps": FunnelSteps,
  "empty-lineup": EmptyLineup,
  "channel-signs": ChannelSigns,
  "stopwatch-thirty": StopwatchThirty,
  "first-footprint": FirstFootprint,
  "double-tap": DoubleTap,
  "phone-laptop": PhoneLaptop,
  "join-hourglass": JoinHourglass,
  "piggy-repeat": PiggyRepeat,
  "rolling-wheel": RollingWheel,
  "kickoff-clock": KickoffClock,
  "power-battery": PowerBattery,
  "name-initial": NameInitial,
  "two-jerseys": TwoJerseys,
  "composite-key": CompositeKey,
  "floor-ten": FloorTen,
  "above-usual": AboveUsual,
  "torn-name": TornName,
  "september-page": SeptemberPage,
  "no-shootout": NoShootout,
  "week-question": WeekQuestion,
  "monday-strip": MondayStrip,
  "qb-stack": QbStack,
  "dual-threat": DualThreat,
  "full-kit": FullKit,
  "headline-sheet": HeadlineSheet,
  "lightbulb-lineup": LightbulbLineup,
  "quarter-bars": QuarterBars,
  "big-jump": BigJump,
  "high-bar": HighBar,
  "ceiling-line": CeilingLine,
  "two-helmets": TwoHelmets,
  "box-lines": BoxLines,
  "two-podium": TwoPodium,
  "fire-chain": FireChain,
  "balance-scale": BalanceScale,
  "coupon-percent": CouponPercent,
  "home-end-zone": HomeEndZone,
  "order-gaps": OrderGaps,
  "team-sheet": TeamSheet,
  "seven-ticks": SevenTicks,
  "perfect-week": PerfectWeek,
  "two-minute-clock": TwoMinuteClock,
  "order-ticket": OrderTicket,
  "seven-day-window": SevenDayWindow,
  "three-and-out": ThreeAndOut,
  "field-marker": FieldMarker,
  "scoring-drive": ScoringDrive,
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
