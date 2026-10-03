/**
 * Logo-style profile mark — GTA loading-screen energy on a football kit.
 *
 * Solid saturated backdrop, thick night outlines, hard cel-shade planes,
 * reflective visor, and a nameplate banner across the bottom for tenure
 * status. Reads at 34px in the nav and large on the locker.
 */

import { c, Football, N, Sparkle, type Tone } from "@/components/art-kit";
import type { KitAccent } from "@/lib/progress";

const SKIN = [
  { base: "rgb(232 184 148)", shade: "rgb(186 128 92)", lite: "rgb(248 214 188)" },
  { base: "rgb(224 168 130)", shade: "rgb(168 108 72)", lite: "rgb(242 200 168)" },
  { base: "rgb(140 90 60)", shade: "rgb(92 54 34)", lite: "rgb(176 120 84)" },
  { base: "rgb(198 139 99)", shade: "rgb(140 88 56)", lite: "rgb(220 170 128)" },
] as const;

const KIT: Record<
  KitAccent,
  {
    primary: Tone;
    jersey: string;
    jerseyShade: string;
    helmet: string;
    helmetShade: string;
    brim: string;
    number: string;
    bg: string;
    bgDeep: string;
  }
> = {
  ice: {
    primary: "ice",
    jersey: c("ice"),
    jerseyShade: c("ice-dim"),
    helmet: c("turf"),
    helmetShade: c("turf-dim"),
    brim: c("turf-dim"),
    number: c("ink"),
    bg: c("ice"),
    bgDeep: c("ice-dim"),
  },
  turf: {
    primary: "turf",
    jersey: c("turf"),
    jerseyShade: c("turf-dim"),
    helmet: c("ice"),
    helmetShade: c("ice-dim"),
    brim: c("ice-dim"),
    number: c("night"),
    bg: c("turf"),
    bgDeep: c("turf-dim"),
  },
  gold: {
    primary: "gold",
    jersey: c("gold"),
    jerseyShade: c("gold-dim"),
    helmet: c("turf"),
    helmetShade: c("turf-dim"),
    brim: c("turf-dim"),
    number: c("night"),
    bg: c("gold"),
    bgDeep: c("gold-dim"),
  },
};

export default function PlayerMark({
  jersey = 7,
  kitTone = 0,
  kitAccent = "ice",
  size = 40,
  className = "",
  rankTone,
  status,
}: {
  jersey?: number;
  kitTone?: number;
  kitAccent?: KitAccent;
  size?: number;
  className?: string;
  /** Outer ring follows tenure accent when set. */
  rankTone?: Tone;
  /** Tenure rank (or short status) painted on the bottom banner. */
  status?: string;
}) {
  const kit = KIT[kitAccent] ?? KIT.ice;
  const skin = SKIN[((kitTone % SKIN.length) + SKIN.length) % SKIN.length]!;
  const ring = rankTone ?? kit.primary;
  const num = String(Math.max(0, Math.min(99, Math.round(jersey))));
  const gid = `pm-${kitAccent}-${kitTone}-${num}-${status ?? "x"}`;
  const banner = Boolean(status?.trim());
  const label = (status ?? "").trim().toUpperCase();
  // Condensed GTA nameplate: shorter ranks get a bigger face.
  // Under ~44px the letters vanish; the coloured strip still signals status.
  const showLabel = banner && size >= 44;
  const bannerSize = label.length > 12 ? 6.2 : label.length > 8 ? 7.2 : 8.4;

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`player-mark-glow ${className}`}
      data-tone={ring}
      role="img"
      aria-label={banner ? `Player ${num}, ${status}` : `Player ${num}`}
    >
      <defs>
        <linearGradient id={`${gid}-sky`} x1="20" y1="0" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={kit.bg} />
          <stop offset="55%" stopColor={kit.bg} stopOpacity="0.92" />
          <stop offset="100%" stopColor={kit.bgDeep} />
        </linearGradient>
        <linearGradient id={`${gid}-jersey`} x1="20" y1="44" x2="62" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c("ink")} stopOpacity="0.35" />
          <stop offset="28%" stopColor={kit.jersey} />
          <stop offset="100%" stopColor={kit.jerseyShade} />
        </linearGradient>
        <linearGradient id={`${gid}-helm`} x1="28" y1="10" x2="54" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c("ink")} stopOpacity="0.4" />
          <stop offset="32%" stopColor={kit.helmet} />
          <stop offset="100%" stopColor={kit.helmetShade} />
        </linearGradient>
        <linearGradient id={`${gid}-visor`} x1="30" y1="26" x2="52" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c("ink")} stopOpacity="0.15" />
          <stop offset="35%" stopColor={N} />
          <stop offset="70%" stopColor={c("ink-soft")} stopOpacity="0.85" />
          <stop offset="100%" stopColor={N} />
        </linearGradient>
        <linearGradient id={`${gid}-banner`} x1="40" y1="58" x2="40" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c(ring)} />
          <stop offset="100%" stopColor={c(ring === "gold" ? "gold-dim" : ring === "turf" ? "turf-dim" : "ice-dim")} />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="40" cy="40" r="36" />
        </clipPath>
      </defs>

      {/* Thick logo ring — sticker / cover-art edge */}
      <circle cx="40" cy="40" r="39.5" fill={N} />
      <circle cx="40" cy="40" r="37.8" fill="none" stroke={c(ring)} strokeWidth="2.8" />
      <circle cx="40" cy="40" r="35.2" fill={N} />

      <g clipPath={`url(#${gid}-clip)`}>
        {/* Saturated GTA portrait field */}
        <rect width="80" height="80" fill={`url(#${gid}-sky)`} />
        {/* Soft vignette so the bust pops */}
        <ellipse cx="40" cy="78" rx="42" ry="22" fill={N} opacity="0.28" />
        <ellipse cx="14" cy="18" rx="18" ry="14" fill={c("ink")} opacity="0.12" />

        {/* Shoulders / jersey — hard shade plane on the right */}
        <path
          d="M4 80 Q8 46 26 44 L54 44 Q72 46 76 80 Z"
          fill={`url(#${gid}-jersey)`}
          stroke={N}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M48 46 Q62 48 70 80 L54 80 Q52 56 48 48 Z" fill={kit.jerseyShade} opacity="0.55" />
        <path d="M26 46 Q40 51 54 46" fill="none" stroke={N} strokeWidth="2" strokeLinecap="round" />
        {/* Collar / yoke */}
        <path
          d="M30 46 L34 52 L40 49 L46 52 L50 46"
          fill={kit.jerseyShade}
          stroke={N}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <text
          x="40"
          y={banner ? 55.5 : 70}
          textAnchor="middle"
          fontSize={num.length > 1 ? (banner ? 13 : 15) : banner ? 15 : 17}
          fontWeight="900"
          fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
          fill={kit.number}
          stroke={N}
          strokeWidth="1.4"
          paintOrder="stroke fill"
        >
          {num}
        </text>

        {/* Neck */}
        <path
          d="M33 40 Q34 48 40 49 Q46 48 47 40 Z"
          fill={skin.base}
          stroke={N}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M42 41 Q45 46 44 49 L40 49 Q42 45 42 41 Z" fill={skin.shade} opacity="0.7" />

        {/* Face — slight 3/4, hard cheek shade */}
        <ellipse cx="39" cy="30" rx="13" ry="13.5" fill={skin.base} stroke={N} strokeWidth="2.2" />
        <path d="M42 20 Q50 26 49 36 Q48 40 40 41 L42 20 Z" fill={skin.shade} opacity="0.55" />
        <ellipse cx="33" cy="26" rx="4.5" ry="3.2" fill={skin.lite} opacity="0.55" />
        {/* Brow / eyes under the visor hint */}
        <path d="M30 28.5 Q34 27 37 28.5" fill="none" stroke={N} strokeWidth="1.7" strokeLinecap="round" />
        <path d="M41 28.5 Q44.5 27.2 48 29" fill="none" stroke={N} strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="33.5" cy="30.5" r="1.5" fill={N} />
        <circle cx="44.5" cy="30.8" r="1.5" fill={N} />
        <circle cx="33.9" cy="30.1" r="0.45" fill={skin.lite} />
        <circle cx="44.9" cy="30.4" r="0.45" fill={skin.lite} />
        {/* Stoic mouth */}
        <path d="M34.5 35.5 Q39.5 37.8 45 35.2" fill="none" stroke={N} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M36 38.5 Q39.5 40 43.5 38.2" fill="none" stroke={skin.shade} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

        {/* Helmet shell — chrome highlight + deep shade */}
        <path
          d="M22 33 Q21 12 39 10.5 Q57 12 58 33 L58 37 Q53.5 37.5 51 33 L51 25 Q39 20.5 27 25 L27 33 Q24.5 37.5 22 37 Z"
          fill={`url(#${gid}-helm)`}
          stroke={N}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Hard shade on the far side */}
        <path
          d="M48 14 Q57 16 58 33 L58 37 Q53.5 37.5 51 33 L51 25 Q48 22 44 21 Z"
          fill={kit.helmetShade}
          opacity="0.55"
        />
        {/* Specular blade */}
        <path
          d="M28 16 Q34 13 40 13.5 Q36 20 29 24 Q26 20 28 16 Z"
          fill={c("ink")}
          opacity="0.18"
        />
        <path
          d="M29 17 Q34 14.5 39 15 Q35.5 19.5 30 22.5 Q28 20 29 17 Z"
          fill={c("ink")}
          opacity="0.12"
        />
        {/* Stripe */}
        <path d="M37 11.2 Q39.5 10.6 42.2 11.2 L41.6 26 Q39.5 25.4 37.4 26 Z" fill={N} />
        <path d="M38.2 11.5 Q39.5 11.1 41 11.5 L40.6 25.2 Q39.5 24.9 38.4 25.2 Z" fill={c(ring)} opacity="0.85" />
        {/* Ear hole / brim */}
        <path d="M51 25 Q56 18 51 13.5 Q58 17 58 33 L58 37 Q53.5 37.5 51 33 Z" fill={kit.brim} stroke={N} strokeWidth="1.2" />
        <ellipse cx="29.5" cy="20" rx="3.2" ry="2.4" fill={N} opacity="0.35" transform="rotate(-24 29.5 20)" />

        {/* Reflective visor — sunglasses energy */}
        <path
          d="M27 31.5 Q39 36.5 53 31.5 L53 36 Q39 42 27 36 Z"
          fill={`url(#${gid}-visor)`}
          stroke={N}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M30 33.2 Q39 36.8 50 33.5" fill="none" stroke={c("ink")} strokeWidth="1.2" opacity="0.55" />
        <path d="M31 34.5 Q36 36.2 40 36.4" fill="none" stroke={c("ink")} strokeWidth="1.1" opacity="0.55" strokeLinecap="round" />

        {/* Facemask bars */}
        <path
          d="M28.5 36.5 V42.5 M39.5 38.5 V44 M50.5 36.5 V42.5 M29 41.5 Q39.5 46.5 51 41.5"
          fill="none"
          stroke={c("ink-soft")}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M28.5 36.5 V42.5 M39.5 38.5 V44 M50.5 36.5 V42.5 M29 41.5 Q39.5 46.5 51 41.5"
          fill="none"
          stroke={N}
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Mini football — corner accent */}
        <g transform="translate(60 48) rotate(-28) scale(0.5)">
          <Football x={0} y={0} rx={14} fill={c("gold")} />
        </g>

        {/* Bling sparkles */}
        <Sparkle x={16} y={16} r={4.5} fill={c("gold")} />
        <Sparkle x={64} y={20} r={3.2} fill={c("ink")} />

        {/* Status nameplate — GTA cover banner */}
        {banner && (
          <g>
            <path d="M0 58 H80 V80 H0 Z" fill={N} opacity="0.55" />
            <path d="M0 60 H80 V78 H0 Z" fill={`url(#${gid}-banner)`} />
            {/* Cel band + hard bottom edge */}
            <path d="M0 60 H80" stroke={c("ink")} strokeWidth="1.2" opacity="0.35" />
            <path d="M0 62 H80" stroke={c("ink")} strokeWidth="2.2" opacity="0.2" />
            <path d="M0 78 H80" stroke={N} strokeWidth="2.4" />
            {showLabel && (
              <text
                x="40"
                y="72.2"
                textAnchor="middle"
                fontSize={bannerSize}
                fontWeight="900"
                fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
                letterSpacing="0.08em"
                fill={c("ink")}
                stroke={N}
                strokeWidth="0.55"
                paintOrder="stroke fill"
              >
                {label}
              </text>
            )}
          </g>
        )}
      </g>

      {/* Inner rim catch-light */}
      <circle cx="40" cy="40" r="35" fill="none" stroke={c("ink")} strokeWidth="1.2" opacity="0.18" />
      <path
        d="M18 22 A24 24 0 0 1 52 14"
        fill="none"
        stroke={c("ink")}
        strokeWidth="1.4"
        opacity="0.22"
        strokeLinecap="round"
      />
    </svg>
  );
}
