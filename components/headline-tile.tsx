/**
 * The tile that lives inside the hero headline — "Data practice ▢ that" —
 * and never stops turning over: a football, then a database, a Python
 * snake, a spreadsheet's fx, a rising chart, an R hex, and round again.
 *
 * Modelled on the icon analystbuilder.com flips inside its own headline:
 * one small, bright thing in the middle of the biggest words on the page is
 * what makes a still hero feel alive, where a moving background only makes
 * it feel busy. Each tile flips in, holds, flips out, and the next one takes
 * the slot — six tiles on one shared 13.2s loop, each offset by its 2.2s
 * turn, so the handover is seamless for as long as the page is open.
 *
 * Pure CSS (.hl-* in globals.css), no JavaScript and no timers. Under
 * reduced motion it holds on the football.
 */

import { N, c } from "@/components/art-kit";

type Tone = "turf" | "gold" | "ice";

function Football() {
  return (
    <g transform="translate(24 24) rotate(-32)">
      <path d="M-17 0 Q0 -21 17 0 Q0 21 -17 0 Z" fill={c("gold-dim")} stroke={N} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M-10 -5.5 Q-11.5 0 -10 5.5 M10 -5.5 Q11.5 0 10 5.5" fill="none" stroke={c("ink")} strokeWidth="2" strokeLinecap="round" />
      <path d="M-5 0 H5 M-3 -2.6 V2.6 M0 -2.6 V2.6 M3 -2.6 V2.6" stroke={c("ink")} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function Database() {
  return (
    <g stroke={N} strokeWidth="2.6" strokeLinejoin="round">
      <path d="M11 13 V35 A13 5 0 0 0 37 35 V13" fill={c("ink")} />
      <path d="M11 24 A13 5 0 0 0 37 24" fill="none" />
      <ellipse cx="24" cy="13" rx="13" ry="5" fill={c("ink")} />
    </g>
  );
}

function Snake() {
  const d = "M12 36 Q12 28 20 28 H28 Q36 28 36 20 Q36 13 28 13 H24";
  return (
    <g>
      <path d={d} fill="none" stroke={N} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={c("turf")} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="22" cy="13" rx="6" ry="5" fill={c("turf")} stroke={N} strokeWidth="2.4" />
      <circle cx="20.5" cy="11.5" r="1.4" fill={N} />
    </g>
  );
}

function Formula() {
  return (
    <g stroke={N} strokeWidth="2.4" strokeLinejoin="round">
      <rect x="9" y="10" width="30" height="28" rx="4" fill={c("ink")} />
      <path d="M9 19 H39 M19 19 V38 M29 19 V38 M9 28.5 H39" fill="none" strokeWidth="1.6" />
      <path d="M9 19 V14 Q9 10 13 10 H35 Q39 10 39 14 V19 Z" fill={c("gold")} />
      <text x="24" y="17.4" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={N} stroke="none" fontFamily="ui-monospace, monospace">
        fx
      </text>
    </g>
  );
}

function Chart() {
  return (
    <g stroke={N} strokeWidth="2.4" strokeLinejoin="round">
      <rect x="10" y="27" width="7" height="11" rx="1.5" fill={c("ink")} />
      <rect x="20.5" y="20" width="7" height="18" rx="1.5" fill={c("ink")} />
      <rect x="31" y="11" width="7" height="27" rx="1.5" fill={c("turf")} />
      <path d="M8 38.5 H40" strokeLinecap="round" />
    </g>
  );
}

function RHex() {
  return (
    <g>
      <path d="M24 4 L41.5 14 V34 L24 44 L6.5 34 V14 Z" fill={N} stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <text x="24" y="32.5" textAnchor="middle" fontSize="23" fontWeight="900" fill={c("ice")} fontFamily="ui-monospace, monospace">
        R
      </text>
    </g>
  );
}

const TILES: { tone: Tone; Icon: () => JSX.Element }[] = [
  { tone: "turf", Icon: Football },
  { tone: "gold", Icon: Database },
  { tone: "ice", Icon: Snake },
  { tone: "turf", Icon: Formula },
  { tone: "gold", Icon: Chart },
  { tone: "ice", Icon: RHex },
];

export default function HeadlineTile() {
  return (
    <span aria-hidden className="hl-tiles">
      {TILES.map(({ tone, Icon }, i) => (
        <span
          key={i}
          className={`hl-tile hl-tone-${tone}`}
          style={{ animationDelay: `${i * 2.2}s` }}
        >
          <svg viewBox="0 0 48 48" className="h-[84%] w-[84%]">
            <Icon />
          </svg>
        </span>
      ))}
    </span>
  );
}
