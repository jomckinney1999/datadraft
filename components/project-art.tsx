/**
 * The drawn picture on a project card — the builds and the cases —
 * from the same kit and under the same rule as the questions and courses:
 * the picture is what the title says.
 *
 * "Build the Warehouse" is a warehouse, hard hat and all. "Waiver Wire Pulse
 * for Roster Health" is a heart with a heartbeat running through it. "Private
 * League Power Rankings" is a ranking ladder, a bolt of power and a padlock.
 * The cases previously had no picture at all, and the two builds had flow
 * diagrams that explained the plumbing rather than inviting anyone in.
 *
 * Keyed by project or case id. A new build or case needs a new scene here;
 * scripts/verify-answer-keys.mjs fails when one is missing, because the
 * catalogue would otherwise render an empty picture slot for it.
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
  starPath,
  type Tone,
} from "@/components/art-kit";

/** Your League Scorecard — a scorecard on a clipboard, a trophy clipped on. */
function LeagueScorecard() {
  const rows = [
    { y: 64, col: c("gold"), wl: "11–3" },
    { y: 80, col: c("turf"), wl: "9–5" },
    { y: 96, col: c("ice"), wl: "7–7" },
    { y: 112, col: c("ink-muted"), wl: "4–10" },
  ];
  return (
    <g>
      <Shadow y={138} rx={50} />
      <rect x="48" y="20" width="104" height="114" rx="8" fill={c("gold-dim")} stroke={N} strokeWidth="2.2" />
      <rect x="56" y="30" width="88" height="96" rx="3" fill={c("ink-soft")} stroke={N} strokeWidth="1.5" />
      <rect x="82" y="14" width="36" height="14" rx="4" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <text
        x="100"
        y="46"
        textAnchor="middle"
        fontSize="9"
        fontWeight="900"
        fill={N}
        fontFamily={MONO}
        letterSpacing="1.5"
      >
        SCORECARD
      </text>
      <path d="M62 52 H138" stroke={N} strokeWidth="1.5" opacity="0.4" />
      {rows.map((r) => (
        <g key={r.y}>
          <circle cx="68" cy={r.y} r="5" fill={r.col} stroke={N} strokeWidth="1.2" />
          <rect x="78" y={r.y - 3} width="30" height="6" rx="3" fill={N} opacity="0.22" />
          <text
            x="138"
            y={r.y + 3.5}
            textAnchor="end"
            fontSize="9"
            fontWeight="900"
            fill={N}
            fontFamily={MONO}
          >
            {r.wl}
          </text>
        </g>
      ))}
      <path d="M150 18 H172 V28 Q172 40 161 40 Q150 40 150 28 Z" fill={c("gold")} stroke={N} strokeWidth="2" />
      <path d="M150 22 H145 Q145 31 152 33 M172 22 H177 Q177 31 170 33" fill="none" stroke={c("gold")} strokeWidth="2.4" />
      <rect x="157" y="40" width="8" height="5" fill={c("gold-dim")} />
      <rect x="152" y="44" width="18" height="5" rx="2" fill={c("gold-dim")} stroke={N} strokeWidth="1.4" />
      <g transform="rotate(28 30 96)">
        <rect x="24" y="56" width="12" height="62" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.8" />
        <rect x="24" y="56" width="12" height="9" rx="2" fill={c("ink-muted")} stroke={N} strokeWidth="1.8" />
        <path d="M24 118 L30 132 L36 118 Z" fill={c("ink-soft")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      </g>
      <Sparkle x={176} y={70} r={5} />
    </g>
  );
}

/** Build the Warehouse — a warehouse, crates of models, and a hard hat. */
function Warehouse() {
  const crates: [number, number, string][] = [
    [144, 104, "stg"],
    [168, 104, "dim"],
    [156, 80, "fct"],
  ];
  return (
    <g>
      <Shadow y={132} rx={76} />
      <path d="M26 66 L86 34 L146 66 Z" fill={c("turf")} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="86" cy="54" r="6" fill={c("ice")} stroke={N} strokeWidth="1.6" />
      <rect x="34" y="64" width="104" height="64" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" />
      <rect x="60" y="68" width="52" height="12" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.5" />
      <text x="86" y="76.5" textAnchor="middle" fontSize="6.5" fontWeight="900" fill={N} fontFamily={MONO}>
        WAREHOUSE
      </text>
      <rect x="62" y="84" width="48" height="44" fill={c("ink-muted")} stroke={N} strokeWidth="2" />
      <path
        d="M62 92 H110 M62 100 H110 M62 108 H110 M62 116 H110 M62 124 H110"
        stroke={N}
        strokeWidth="1.2"
        opacity="0.4"
      />
      {crates.map(([x, y, label]) => (
        <g key={label}>
          <rect x={x} y={y} width="24" height="24" rx="2" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
          <path d={`M${x} ${y} L${x + 24} ${y + 24} M${x + 24} ${y} L${x} ${y + 24}`} stroke={N} strokeWidth="1" opacity="0.25" />
          <rect x={x + 3} y={y + 8} width="18" height="9" rx="1.5" fill={c("ink-soft")} />
          <text x={x + 12} y={y + 15} textAnchor="middle" fontSize="7" fontWeight="900" fill={N} fontFamily={MONO}>
            {label}
          </text>
        </g>
      ))}
      <path d="M14 40 Q14 20 34 20 Q54 20 54 40 Z" fill={c("gold")} stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M34 20 V36" stroke={N} strokeWidth="2" opacity="0.4" />
      <rect x="9" y="38" width="50" height="6" rx="3" fill={c("gold-dim")} stroke={N} strokeWidth="2" />
      <Sparkle x={176} y={40} r={6} />
    </g>
  );
}

/** Waiver Wire Pulse for Roster Health — a heart with a heartbeat through it. */
function WaiverPulse() {
  const ekg = "M10 78 H62 L72 58 L84 102 L96 44 L108 90 L116 78 H190";
  return (
    <g>
      <Shadow y={132} rx={50} />
      <path
        d="M100 124 C60 98 38 78 38 56 C38 38 52 28 66 28 C80 28 92 36 100 48 C108 36 120 28 134 28 C148 28 162 38 162 56 C162 78 140 98 100 124 Z"
        fill={c("turf")}
        stroke={N}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M52 50 Q54 38 66 36" fill="none" stroke={c("ink", 0.5)} strokeWidth="4" strokeLinecap="round" />
      <path d={ekg} fill="none" stroke={N} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
      <path d={ekg} fill="none" stroke={c("ink")} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="124" y="108" width="60" height="18" rx="5" fill={c("ice")} stroke={N} strokeWidth="2" />
      <text x="154" y="120.5" textAnchor="middle" fontSize="8" fontWeight="900" fill={N} fontFamily={MONO}>
        WAIVERS
      </text>
      <path d="M170 24 V40 M162 32 H178" stroke={c("gold")} strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}

/** Sunday Slate Scoring Leaders — the leaderboard, with a star on the top line. */
function SlateLeaders() {
  const rows = [
    { y: 48, w: 90, col: c("gold"), n: "1" },
    { y: 72, w: 70, col: c("ice"), n: "2" },
    { y: 96, w: 54, col: c("turf"), n: "3" },
  ];
  return (
    <g>
      <Shadow y={136} rx={64} />
      <rect x="24" y="16" width="152" height="112" rx="10" fill={N} stroke={c("gold")} strokeWidth="3" />
      <text
        x="100"
        y="34"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="900"
        fill={c("gold")}
        fontFamily={MONO}
        letterSpacing="2"
      >
        SUNDAY LEADERS
      </text>
      {rows.map((r) => (
        <g key={r.n}>
          <circle cx="42" cy={r.y + 8} r="9" fill={r.col} stroke={c("ink", 0.8)} strokeWidth="1.5" />
          <text x="42" y={r.y + 12} textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={SANS}>
            {r.n}
          </text>
          <rect x="58" y={r.y + 2} width={r.w} height="12" rx="6" fill={r.col} />
        </g>
      ))}
      <path d={starPath(160, 56, 5, 10, 4.2, -90)} fill={c("gold")} stroke={c("ink", 0.8)} strokeWidth="1.2" strokeLinejoin="round" />
      <Football x={150} y={114} rx={12} rot={-15} />
    </g>
  );
}

/** Private League Power Rankings — a ranking ladder, a bolt, a padlock. */
function PowerRankings() {
  const rows = [
    { y: 34, up: true, col: c("gold") },
    { y: 60, up: true, col: c("turf") },
    { y: 86, up: false, col: c("ice") },
    { y: 112, up: true, col: c("ink-muted") },
  ];
  return (
    <g>
      {rows.map((r, i) => (
        <g key={r.y}>
          <rect x="18" y={r.y - 10} width="110" height="20" rx="6" fill={c("panel")} stroke={N} strokeWidth="1.6" />
          <text x="30" y={r.y + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
            {i + 1}
          </text>
          <circle cx="48" cy={r.y} r="5" fill={r.col} stroke={N} strokeWidth="1.2" />
          <rect x="58" y={r.y - 3} width="42" height="6" rx="3" fill={c("ink", 0.35)} />
          <path
            d={r.up ? `M112 ${r.y + 4} L117 ${r.y - 3} L122 ${r.y + 4}` : `M112 ${r.y - 4} L117 ${r.y + 3} L122 ${r.y - 4}`}
            fill="none"
            stroke={r.up ? c("turf") : c("gold")}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <path
        d="M156 14 L136 70 H154 L142 128 L182 58 H162 L176 14 Z"
        fill={c("gold")}
        stroke={N}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M164 110 V104 Q164 96 172 96 Q180 96 180 104 V110"
        fill="none"
        stroke={c("ink-muted")}
        strokeWidth="3.5"
      />
      <rect x="160" y="108" width="24" height="20" rx="3" fill={c("ice")} stroke={N} strokeWidth="2" />
      <circle cx="172" cy="116" r="2.6" fill={N} />
      <rect x="171" y="117" width="2" height="6" fill={N} />
    </g>
  );
}

/** Starter Form Guide Week-over-Week — form chips, and the line they make. */
function FormGuide() {
  const form = [true, true, false, true, true];
  const line: [number, number][] = [
    [40, 110],
    [70, 100],
    [100, 112],
    [130, 94],
    [160, 86],
  ];
  return (
    <g>
      <Shadow y={134} rx={70} />
      {form.map((up, i) => {
        const x = 36 + i * 32;
        const y = 36;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill={up ? c("turf") : c("gold")} stroke={N} strokeWidth="2" />
            <path
              d={
                up
                  ? `M${x} ${y + 6} V${y - 6} M${x - 5} ${y - 1} L${x} ${y - 6} L${x + 5} ${y - 1}`
                  : `M${x} ${y - 6} V${y + 6} M${x - 5} ${y + 1} L${x} ${y + 6} L${x + 5} ${y + 1}`
              }
              fill="none"
              stroke={N}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x={x}
              y="62"
              textAnchor="middle"
              fontSize="7"
              fontWeight="800"
              fill={c("ink-muted")}
              fontFamily={MONO}
            >
              WK{i + 1}
            </text>
          </g>
        );
      })}
      <rect x="24" y="74" width="152" height="52" rx="6" fill={c("panel")} stroke={N} strokeWidth="1.6" />
      <path
        d={`M${line.map(([x, y]) => `${x} ${y}`).join(" L")}`}
        fill="none"
        stroke={c("turf")}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {line.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3.5" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      ))}
    </g>
  );
}

/** Positional Rank Board for Draft Room — the war-room draft board. */
function DraftBoard() {
  const cols = [
    { l: "QB", col: c("gold"), n: 3 },
    { l: "RB", col: c("turf"), n: 5 },
    { l: "WR", col: c("ice"), n: 5 },
    { l: "TE", col: c("ink-muted"), n: 2 },
  ];
  return (
    <g>
      <Shadow y={138} rx={72} />
      <rect x="20" y="14" width="160" height="118" rx="8" fill={c("panel")} stroke={c("gold")} strokeWidth="3" />
      <text
        x="100"
        y="30"
        textAnchor="middle"
        fontSize="9"
        fontWeight="900"
        fill={c("gold")}
        fontFamily={MONO}
        letterSpacing="2"
      >
        DRAFT BOARD
      </text>
      <path d="M26 80 H174 M26 110 H174" stroke={c("ink", 0.25)} strokeWidth="1.2" strokeDasharray="3 3" />
      {cols.map((col, i) => {
        const x = 30 + i * 38;
        return (
          <g key={col.l}>
            <text
              x={x + 15}
              y="45"
              textAnchor="middle"
              fontSize="9"
              fontWeight="900"
              fill={c("ink-soft")}
              fontFamily={MONO}
            >
              {col.l}
            </text>
            {Array.from({ length: col.n }, (_, j) => (
              <g key={j}>
                <rect x={x} y={50 + j * 15} width="30" height="11" rx="3" fill={col.col} stroke={N} strokeWidth="1.2" />
                <path d={`M${x + 5} ${55.5 + j * 15} H${x + 22}`} stroke={N} strokeWidth="1.6" opacity="0.35" strokeLinecap="round" />
              </g>
            ))}
          </g>
        );
      })}
      <Sparkle x={184} y={16} r={6} />
    </g>
  );
}

/** Engagement Retention for Lineup Lock — a locked lineup on a phone, and who came back. */
function RetentionLock() {
  return (
    <g>
      <Shadow y={138} rx={58} />
      <path
        d="M16 40 C28 70 42 88 58 94 S80 98 90 97"
        fill="none"
        stroke={c("ice")}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {[
        [16, 40],
        [36, 78],
        [58, 94],
        [90, 97],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3.2" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      ))}
      <text x="18" y="120" fontSize="7" fontWeight="800" fill={c("ink-muted")} fontFamily={MONO} letterSpacing="1">
        RETAINED
      </text>
      <rect x="96" y="16" width="56" height="112" rx="12" fill={c("ink-soft")} stroke={N} strokeWidth="2.4" />
      <rect x="102" y="28" width="44" height="88" rx="4" fill={N} />
      <rect x="116" y="20" width="16" height="4" rx="2" fill={N} />
      <path
        d="M114 70 V60 Q114 50 124 50 Q134 50 134 60 V70"
        fill="none"
        stroke={c("gold")}
        strokeWidth="4.5"
      />
      <rect x="108" y="68" width="32" height="26" rx="5" fill={c("gold")} stroke={N} strokeWidth="1.8" />
      <circle cx="124" cy="79" r="3" fill={N} />
      <rect x="122.8" y="80" width="2.4" height="7" fill={N} />
      <text x="124" y="108" textAnchor="middle" fontSize="7" fontWeight="900" fill={c("ink")} fontFamily={MONO}>
        LOCKED
      </text>
      <circle cx="172" cy="40" r="15" fill={c("turf")} stroke={N} strokeWidth="2" />
      <text x="172" y="47" textAnchor="middle" fontSize="19" fontWeight="900" fill={N} fontFamily={SANS}>
        ↻
      </text>
      <Sparkle x={176} y={96} r={5} />
    </g>
  );
}

/**
 * Build a Fantasy Prediction Model — a chart whose solid history turns into a
 * dashed forecast inside a shaded range, and a crystal ball with a football
 * in it: a prediction, drawn literally.
 */
function PredictionModel() {
  return (
    <>
      <Shadow y={134} rx={66} />
      <rect x="18" y="30" width="118" height="92" rx="8" fill={c("night-100")} stroke={N} strokeWidth="1.8" />
      <path d="M26 110 H128" stroke={c("ink", 0.25)} strokeWidth="1.2" />
      <path d="M88 76 L128 44 L128 88 Z" fill={c("gold", 0.22)} />
      <path d="M28 100 L42 92 L54 96 L66 82 L78 86 L88 70" fill="none" stroke={c("ice")} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88 70 L128 60" fill="none" stroke={c("gold")} strokeWidth="3.2" strokeDasharray="5 4" strokeLinecap="round" />
      {[
        [28, 100],
        [42, 92],
        [54, 96],
        [66, 82],
        [78, 86],
        [88, 70],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3" fill={c("ice")} stroke={N} strokeWidth="1.2" />
      ))}
      <circle cx="128" cy="60" r="4.5" fill={c("gold")} stroke={N} strokeWidth="1.6" />
      <text x="30" y="46" fontSize="8" fontWeight="800" fill={c("ink-muted")} fontFamily={MONO}>
        NEXT WEEK
      </text>
      <path d="M140 118 L176 118 L170 128 L146 128 Z" fill={c("gold-dim")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="158" cy="92" r="27" fill={c("ice", 0.3)} stroke={N} strokeWidth="2.4" />
      <circle cx="158" cy="92" r="27" fill="none" stroke={c("ice")} strokeWidth="1.2" />
      <Football x={158} y={94} rx={14} rot={-25} />
      <path d="M142 78 Q148 70 158 69" fill="none" stroke={c("ink")} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <Sparkle x={184} y={64} r={5} fill={c("gold")} />
      <Sparkle x={134} y={24} r={4} />
    </>
  );
}
/** Bye Week Gaps — a depth chart with two blank slots stamped BYE. */
function ByeWeekGaps() {
  const slots = [
    { y: 48, name: "ALLEN", filled: true },
    { y: 68, name: "BARKLEY", filled: true },
    { y: 88, name: "KELCE", filled: false },
    { y: 108, name: "JEFF", filled: false },
  ];
  return (
    <g>
      <Shadow y={138} rx={62} />
      <rect x="28" y="18" width="144" height="112" rx="8" fill={c("panel")} stroke={N} strokeWidth="2.4" />
      <text x="100" y="36" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("ice")} fontFamily={MONO} letterSpacing="1.5">
        DEPTH CHART
      </text>
      {slots.map((s) => (
        <g key={s.y}>
          <rect
            x="40"
            y={s.y}
            width="120"
            height="16"
            rx="4"
            fill={s.filled ? c("turf", 0.35) : c("night-100")}
            stroke={N}
            strokeWidth="1.6"
            strokeDasharray={s.filled ? undefined : "4 3"}
          />
          <text
            x="100"
            y={s.y + 11.5}
            textAnchor="middle"
            fontSize="9"
            fontWeight="900"
            fill={s.filled ? c("ink") : c("gold")}
            fontFamily={MONO}
          >
            {s.filled ? s.name : "BYE"}
          </text>
        </g>
      ))}
      <Sparkle x={178} y={28} r={5} fill={c("gold")} />
    </g>
  );
}

/** Trade Ledger — two manager chips swapping footballs across a ledger line. */
function TradeLedger() {
  return (
    <g>
      <Shadow y={138} rx={64} />
      <rect x="24" y="22" width="152" height="100" rx="8" fill={c("night-100")} stroke={N} strokeWidth="2.2" />
      <text x="100" y="40" textAnchor="middle" fontSize="9" fontWeight="900" fill={c("gold")} fontFamily={MONO} letterSpacing="1.5">
        TRADE LEDGER
      </text>
      <rect x="36" y="52" width="52" height="28" rx="6" fill={c("turf")} stroke={N} strokeWidth="1.8" />
      <text x="62" y="70" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        J
      </text>
      <rect x="112" y="52" width="52" height="28" rx="6" fill={c("ice")} stroke={N} strokeWidth="1.8" />
      <text x="138" y="70" textAnchor="middle" fontSize="10" fontWeight="900" fill={N} fontFamily={MONO}>
        R
      </text>
      <path d="M88 66 H112" stroke={c("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M106 60 L112 66 L106 72" fill="none" stroke={c("gold")} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M94 60 L88 66 L94 72" fill="none" stroke={c("gold")} strokeWidth="2.4" strokeLinejoin="round" />
      <Football x={62} y={104} rx={12} rot={-18} />
      <Football x={138} y={104} rx={12} rot={18} />
      <Sparkle x={100} y={96} r={4} fill={c("gold")} />
    </g>
  );
}

/** Red Zone Look — a field with the red zone lit and a TD flag. */
function RedZoneLook() {
  return (
    <g>
      <Shadow y={138} rx={70} />
      <rect x="16" y="28" width="168" height="96" rx="8" fill={c("turf-dim")} stroke={N} strokeWidth="2.4" />
      <rect x="120" y="28" width="64" height="96" fill={c("gold", 0.22)} />
      <path d="M120 28 V124" stroke={c("gold")} strokeWidth="2.5" />
      {[48, 68, 88, 108].map((y) => (
        <path key={y} d={`M24 ${y} H112`} stroke={c("ink", 0.2)} strokeWidth="1.2" />
      ))}
      <Football x={148} y={76} rx={14} rot={-30} />
      <path d="M158 40 V70" stroke={N} strokeWidth="2.4" />
      <path d="M158 40 H178 L172 50 L178 60 H158 Z" fill={c("gold")} stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <text x="40" y="118" fontSize="8" fontWeight="900" fill={c("ink")} fontFamily={MONO} letterSpacing="1">
        RED ZONE
      </text>
      <Sparkle x={176} y={84} r={5} />
    </g>
  );
}

const SCENES: Record<string, { tone: Tone; Scene: () => JSX.Element }> = {
  "my-league-scorecard": { tone: "gold", Scene: LeagueScorecard },
  "nflverse-dbt-warehouse": { tone: "turf", Scene: Warehouse },
  "fantasy-points-model": { tone: "gold", Scene: PredictionModel },
  "waiver-pulse": { tone: "turf", Scene: WaiverPulse },
  "slate-leaders": { tone: "gold", Scene: SlateLeaders },
  "league-standings": { tone: "ice", Scene: PowerRankings },
  "form-guide": { tone: "turf", Scene: FormGuide },
  "positional-ranks": { tone: "gold", Scene: DraftBoard },
  "retention-report": { tone: "ice", Scene: RetentionLock },
  "bye-week-gaps": { tone: "ice", Scene: ByeWeekGaps },
  "trade-ledger": { tone: "gold", Scene: TradeLedger },
  "red-zone-look": { tone: "turf", Scene: RedZoneLook },
};

export default function ProjectArt({
  id,
  className = "",
  align = "center",
}: {
  /** A build id from lib/projects.ts or a case id from lib/interview-cases.ts. */
  id: string;
  className?: string;
  align?: "center" | "left";
}) {
  const entry = SCENES[id];
  if (!entry) return null;
  const { tone, Scene } = entry;
  return (
    <ArtSvg tone={tone} glowId={`p-${id}`} className={className} align={align}>
      <Scene />
    </ArtSvg>
  );
}
