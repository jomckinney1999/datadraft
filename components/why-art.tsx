/**
 * Pictures for the home page's "Why football, of all things" cards, drawn
 * with the same kit as every question, course and project (art-kit /
 * art-props), so the argument arrives as a picture before it arrives as a
 * paragraph. Same rule as the rest: the picture is what the heading says.
 *
 *   explains-itself — a FINAL scoreboard, 31–17, that nobody needs explained,
 *                     beside a greyed-out org chart of question marks with a
 *                     cross stamped on it: the invented SaaS company.
 *   real-mess       — a stat sheet with a row torn out, a BYE sticky note, a
 *                     plaster over an injured cell and a coffee ring; in the
 *                     corner a sinking ship, crossed out. No Titanic.csv.
 *   before-finished — a stopwatch at 90s with a tick, over a progress bar
 *                     that is a third full and already has a tick on it.
 *
 * Gradient ids are namespaced `w-`.
 */

import { ArtSvg, c, MONO, N, Shadow, Sparkle, type Tone } from "@/components/art-kit";
import { Check, Chip, Cross, OUT, Sheet } from "@/components/art-props";

function ExplainsItself() {
  return (
    <g>
      <Shadow x={82} y={132} rx={52} />
      {/* scoreboard on two posts */}
      <rect x="50" y="100" width="8" height="30" fill={c("ink-soft")} {...OUT} />
      <rect x="106" y="100" width="8" height="30" fill={c("ink-soft")} {...OUT} />
      <rect x="22" y="28" width="120" height="78" rx="9" fill={c("night-100")} {...OUT} strokeWidth="2.4" />
      <rect x="28" y="44" width="52" height="56" rx="5" fill={c("turf", 0.22)} {...OUT} strokeWidth="1.4" />
      <rect x="84" y="44" width="52" height="56" rx="5" fill={c("ink", 0.06)} {...OUT} strokeWidth="1.4" />
      <Chip x={82} y={30} text="FINAL" fill={c("gold")} size={8} />
      <text x="54" y="58" textAnchor="middle" fontSize="8" fontWeight="800" fill={c("ink-soft")} fontFamily={MONO}>
        HOME
      </text>
      <text x="110" y="58" textAnchor="middle" fontSize="8" fontWeight="800" fill={c("ink-soft")} fontFamily={MONO}>
        AWAY
      </text>
      <text x="54" y="91" textAnchor="middle" fontSize="30" fontWeight="900" fill={c("turf")} fontFamily={MONO}>
        31
      </text>
      <text x="110" y="91" textAnchor="middle" fontSize="30" fontWeight="900" fill={c("ink-soft", 0.7)} fontFamily={MONO}>
        17
      </text>
      <Check x={76} y={46} r={9} />

      {/* the invented company nobody can read at a glance */}
      <g opacity="0.75">
        <rect x="160" y="54" width="22" height="14" rx="3" fill={c("ink", 0.3)} {...OUT} strokeWidth="1.2" />
        <path d="M171 68 V76 M158 76 H184 M158 76 V82 M184 76 V82" fill="none" stroke={c("ink", 0.45)} strokeWidth="1.6" />
        <rect x="148" y="82" width="20" height="13" rx="3" fill={c("ink", 0.3)} {...OUT} strokeWidth="1.2" />
        <rect x="174" y="82" width="20" height="13" rx="3" fill={c("ink", 0.3)} {...OUT} strokeWidth="1.2" />
        {[
          [171, 64.5],
          [158, 91.5],
          [184, 91.5],
        ].map(([x, y]) => (
          <text key={x} x={x} y={y} textAnchor="middle" fontSize="9" fontWeight="900" fill={N} fontFamily={MONO}>
            ?
          </text>
        ))}
      </g>
      <Cross x={184} y={50} r={10} />
      <Sparkle x={24} y={20} r={5} fill={c("gold")} />
      <Sparkle x={146} y={24} r={4} />
    </g>
  );
}

function RealMess() {
  return (
    <g>
      <Shadow x={100} y={134} rx={54} />
      <g transform="rotate(-4 100 74)">
        <Sheet x={44} y={24} w={112} h={100} rows={6} cols={3} head={c("turf")} label="WEEK_RESULTS" />
        {/* a week that simply isn't there: the row is torn out */}
        <rect x="45" y="84.5" width="110" height="13.5" fill={c("night-100")} />
        <path d="M45 84.5 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l2 -1.5" fill="none" stroke={N} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M45 98 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l6 3 l6 -3 l2 1.5" fill="none" stroke={N} strokeWidth="1.4" strokeLinejoin="round" />
        {/* an injured cell, patched */}
        <g transform="rotate(-24 78 56)">
          <rect x="60" y="51" width="36" height="11" rx="5.5" fill={c("gold", 0.75)} {...OUT} strokeWidth="1.4" />
          <rect x="72" y="51" width="12" height="11" fill={c("ink", 0.85)} {...OUT} strokeWidth="1.2" />
          {[64, 68, 88, 92].map((x) => (
            <circle key={x} cx={x} cy="56.5" r="0.9" fill={N} opacity="0.5" />
          ))}
        </g>
        {/* a coffee ring, as on every printed stat sheet */}
        <circle cx="134" cy="110" r="10" fill="none" stroke={c("gold-dim", 0.55)} strokeWidth="2.6" strokeDasharray="44 9" />
      </g>
      {/* the bye week, on a sticky note */}
      <g transform="rotate(10 162 40)">
        <rect x="144" y="22" width="36" height="34" rx="2" fill={c("gold")} {...OUT} />
        <path d="M144 22 H180 V27 H144 Z" fill={c("gold-dim")} opacity="0.6" />
        <text x="162" y="46" textAnchor="middle" fontSize="11" fontWeight="900" fill={N} fontFamily={MONO}>
          BYE
        </text>
      </g>
      {/* No Titanic.csv: a little ship going down, crossed out */}
      <g transform="translate(26 118) rotate(-18)">
        <path d="M-14 0 H14 L9 8 H-9 Z" fill={c("ink-soft")} {...OUT} strokeWidth="1.4" />
        <rect x="-8" y="-6" width="14" height="6" fill={c("ink", 0.85)} {...OUT} strokeWidth="1.2" />
        <rect x="-4" y="-12" width="4" height="6" fill={c("gold")} {...OUT} strokeWidth="1.2" />
        <rect x="2" y="-12" width="4" height="6" fill={c("gold")} {...OUT} strokeWidth="1.2" />
      </g>
      <path d="M8 128 Q16 124 24 128 T40 128" fill="none" stroke={c("ice", 0.7)} strokeWidth="2" strokeLinecap="round" />
      <Cross x={38} y={104} r={8} />
    </g>
  );
}

function BeforeFinished() {
  const cx = 94;
  const cy = 70;
  return (
    <g>
      <Shadow x={cx} y={134} rx={44} />
      {/* crown and side button */}
      <rect x={cx - 6} y={cy - 48} width="12" height="9" rx="2" fill={c("ink-soft")} {...OUT} />
      <rect x={cx - 10} y={cy - 54} width="20" height="7" rx="3" fill={c("ice")} {...OUT} />
      <rect x={cx + 26} y={cy - 38} width="10" height="7" rx="2" fill={c("ink-soft")} {...OUT} transform={`rotate(40 ${cx + 31} ${cy - 34})`} />
      <circle cx={cx} cy={cy} r="40" fill={c("ice")} {...OUT} strokeWidth="2.4" />
      <circle cx={cx} cy={cy} r="31" fill={c("ink", 0.96)} {...OUT} />
      {/* half the dial swept: the ninety seconds */}
      <path d={`M${cx} ${cy} L${cx} ${cy - 27} A27 27 0 0 1 ${cx} ${cy + 27} Z`} fill={c("turf", 0.3)} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r0 = i % 3 === 0 ? 23 : 25.5;
        return (
          <path
            key={i}
            d={`M${Math.round((cx + Math.sin(a) * r0) * 10) / 10} ${Math.round((cy - Math.cos(a) * r0) * 10) / 10} L${Math.round((cx + Math.sin(a) * 28.5) * 10) / 10} ${Math.round((cy - Math.cos(a) * 28.5) * 10) / 10}`}
            stroke={N}
            strokeWidth={i % 3 === 0 ? 2 : 1.2}
            strokeLinecap="round"
          />
        );
      })}
      <path d={`M${cx} ${cy} L${cx} ${cy + 24}`} stroke={N} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      <Chip x={cx - 12} y={cy - 10} text="90s" fill={c("gold")} size={8} />
      <Check x={cx + 42} y={cy - 32} r={12} />

      {/* the course is a third done and already paying off */}
      <rect x="40" y="120" width="110" height="10" rx="5" fill={c("night-100")} {...OUT} />
      <rect x="40" y="120" width="40" height="10" rx="5" fill={c("turf")} {...OUT} />
      <Check x={80} y={125} r={7} fill={c("gold")} />
      <Sparkle x={30} y={36} r={5} fill={c("gold")} />
      <Sparkle x={156} y={96} r={4} />
    </g>
  );
}

const SCENES = {
  "explains-itself": { tone: "turf", Scene: ExplainsItself },
  "real-mess": { tone: "gold", Scene: RealMess },
  "before-finished": { tone: "ice", Scene: BeforeFinished },
} as const satisfies Record<string, { tone: Tone; Scene: () => JSX.Element }>;

export type WhyArtId = keyof typeof SCENES;

export default function WhyArt({ id, className = "" }: { id: WhyArtId; className?: string }) {
  const { tone, Scene } = SCENES[id];
  return (
    <ArtSvg tone={tone} glowId={`w-${id}`} className={className}>
      <Scene />
    </ArtSvg>
  );
}
