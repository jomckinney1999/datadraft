/**
 * Logo-style profile mark for the learner — sticker art, circular crop,
 * broadcast glow. Same kit as question/course cards (night outline, turf /
 * ice / gold), not a full-body cast figure. Reads at 28px in the nav and
 * large on the locker.
 */

import { c, Football, N, Sparkle, type Tone } from "@/components/art-kit";
import type { KitAccent } from "@/lib/progress";

const SKIN = [
  c("ink-soft"),
  "rgb(224 168 130)",
  "rgb(140 90 60)",
  "rgb(198 139 99)",
] as const;

const KIT: Record<
  KitAccent,
  { primary: Tone; jersey: string; helmet: string; brim: string; number: string }
> = {
  ice: {
    primary: "ice",
    jersey: c("ice"),
    helmet: c("turf"),
    brim: c("turf-dim"),
    number: c("ink"),
  },
  turf: {
    primary: "turf",
    jersey: c("turf"),
    helmet: c("ice"),
    brim: c("ice-dim"),
    number: c("night"),
  },
  gold: {
    primary: "gold",
    jersey: c("gold"),
    helmet: c("turf"),
    brim: c("turf-dim"),
    number: c("night"),
  },
};

export default function PlayerMark({
  jersey = 7,
  kitTone = 0,
  kitAccent = "ice",
  size = 40,
  className = "",
  rankTone,
}: {
  jersey?: number;
  kitTone?: number;
  kitAccent?: KitAccent;
  size?: number;
  className?: string;
  /** Outer ring follows tenure accent when set. */
  rankTone?: Tone;
}) {
  const kit = KIT[kitAccent] ?? KIT.ice;
  const skin = SKIN[((kitTone % SKIN.length) + SKIN.length) % SKIN.length]!;
  const ring = rankTone ?? kit.primary;
  const num = String(Math.max(0, Math.min(99, Math.round(jersey))));
  const gid = `pm-${kitAccent}-${kitTone}-${num}`;

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Player ${num}`}
    >
      <defs>
        <radialGradient id={`${gid}-glow`} cx="40" cy="36" r="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c(kit.primary)} stopOpacity="0.55" />
          <stop offset="55%" stopColor={c(kit.primary)} stopOpacity="0.18" />
          <stop offset="100%" stopColor={c(kit.primary)} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="40" cy="40" r="36" />
        </clipPath>
        <linearGradient id={`${gid}-jersey`} x1="40" y1="42" x2="40" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={kit.jersey} />
          <stop offset="100%" stopColor={c(kit.primary === "gold" ? "gold-dim" : kit.primary === "turf" ? "turf-dim" : "ice-dim")} />
        </linearGradient>
      </defs>

      {/* Outer logo ring */}
      <circle cx="40" cy="40" r="39" fill={N} />
      <circle cx="40" cy="40" r="37.5" fill="none" stroke={c(ring)} strokeWidth="2.4" />
      <circle cx="40" cy="40" r="35" fill={c("night")} />

      <g clipPath={`url(#${gid}-clip)`}>
        <rect width="80" height="80" fill={c("night")} />
        <circle cx="40" cy="40" r="36" fill={`url(#${gid}-glow)`} />
        {/* Broadcast rays */}
        <g fill={c(kit.primary)} opacity="0.12">
          <path d="M40 40 L92 18 L96 38 Z" />
          <path d="M40 40 L-12 18 L-16 38 Z" />
          <path d="M40 40 L62 96 L42 98 Z" />
          <path d="M40 40 L18 -16 L38 -18 Z" />
        </g>
        {/* Yard-line hint */}
        <g stroke={c("ink")} strokeWidth="1.2" opacity="0.08">
          <path d="M6 58 H74" />
          <path d="M12 66 H68" />
        </g>

        {/* Shoulders / jersey */}
        <path
          d="M8 78 Q10 48 28 46 L52 46 Q70 48 72 78 Z"
          fill={`url(#${gid}-jersey)`}
          stroke={N}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M28 48 Q40 52 52 48" fill="none" stroke={N} strokeWidth="1.6" opacity="0.35" />
        <text
          x="40"
          y="68"
          textAnchor="middle"
          fontSize={num.length > 1 ? 14 : 16}
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill={kit.number}
          stroke={N}
          strokeWidth="0.6"
          paintOrder="stroke"
        >
          {num}
        </text>

        {/* Neck + face */}
        <rect x="34" y="38" width="12" height="10" rx="3" fill={skin} stroke={N} strokeWidth="1.4" />
        <circle cx="40" cy="30" r="12" fill={skin} stroke={N} strokeWidth="1.8" />
        <circle cx="35.5" cy="29" r="1.6" fill={N} />
        <circle cx="44.5" cy="29" r="1.6" fill={N} />
        <path d="M36 33.5 Q40 36 44 33.5" fill="none" stroke={N} strokeWidth="1.5" strokeLinecap="round" />

        {/* Helmet shell — sticker outline */}
        <path
          d="M24 32 Q23 14 40 12.5 Q57 14 56 32 L56 36 Q52 36 50 32 L50 26 Q40 22 30 26 L30 32 Q28 36 24 36 Z"
          fill={kit.helmet}
          stroke={N}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M50 26 Q54 20 50 15 Q56 18 56 32 L56 36 Q52 36 50 32 Z" fill={kit.brim} />
        <path d="M37.5 13 Q40 12.5 42.5 13 L42 26 Q40 25.5 38 26 Z" fill={c("ink")} opacity="0.9" />
        <ellipse cx="31" cy="19" rx="5" ry="2.4" fill={c("ink")} opacity="0.25" transform="rotate(-28 31 19)" />
        {/* Facemask */}
        <path
          d="M30 32 L30 38 M50 32 L50 38 M31 37 Q40 41 49 37"
          fill="none"
          stroke={c("ink-soft")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Mini football accent */}
        <g transform="translate(58 52) rotate(-35) scale(0.55)">
          <Football x={0} y={0} rx={14} fill={c("gold")} />
        </g>

        <Sparkle x={14} y={18} r={4} fill={c("gold")} />
        <Sparkle x={66} y={22} r={3} fill={c("ice")} />
      </g>

      {/* Inner specular rim */}
      <circle cx="40" cy="40" r="35" fill="none" stroke={c("ink")} strokeWidth="1" opacity="0.12" />
    </svg>
  );
}
