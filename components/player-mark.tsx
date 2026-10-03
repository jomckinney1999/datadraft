/**
 * Logo-style profile mark — flat, non-realistic cartoon (ape-NFT energy)
 * on a football kit.
 *
 * Solid pastel field, thick night outlines, flat fills, one shade block,
 * big goggle-visor, and a soft status veil. One fixed cartoon skin — no
 * tone picker. Gradient ids are sanitized so status text can't break fills.
 */

import { c, Football, N, type Tone } from "@/components/art-kit";
import type { KitAccent } from "@/lib/progress";

/** One warm cartoon skin — same family as the Ref. Not a race menu. */
const SKIN = {
  base: "rgb(214 168 122)",
  shade: "rgb(176 128 88)",
} as const;

/**
 * Jersey = kit accent. Sky = a flat complementary pastel so the subject
 * pops the way a cream field pops a dark ape.
 */
const KIT: Record<
  KitAccent,
  {
    primary: Tone;
    jersey: string;
    jerseyShade: string;
    helmet: string;
    number: string;
    sky: string;
  }
> = {
  ice: {
    primary: "ice",
    jersey: c("ice"),
    jerseyShade: c("ice-dim"),
    helmet: c("gold"),
    number: c("ink"),
    sky: c("gold"),
  },
  turf: {
    primary: "turf",
    jersey: c("turf"),
    jerseyShade: c("turf-dim"),
    helmet: c("ice"),
    number: c("night"),
    sky: c("gold"),
  },
  gold: {
    primary: "gold",
    jersey: c("gold"),
    jerseyShade: c("gold-dim"),
    helmet: c("ice"),
    number: c("night"),
    sky: c("ice"),
  },
};

function safeId(parts: (string | number)[]) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "")
    .slice(0, 64);
}

export default function PlayerMark({
  jersey = 7,
  kitAccent = "ice",
  size = 40,
  className = "",
  rankTone,
  status,
}: {
  jersey?: number;
  kitAccent?: KitAccent;
  size?: number;
  className?: string;
  rankTone?: Tone;
  status?: string;
}) {
  const kit = KIT[kitAccent] ?? KIT.ice;
  const ring = rankTone ?? kit.primary;
  const num = String(Math.max(0, Math.min(99, Math.round(jersey))));
  const gid = safeId(["pm", kitAccent, num, status ?? "x"]);
  const banner = Boolean(status?.trim());
  const label = (status ?? "").trim().toUpperCase();
  const showLabel = banner && size >= 44;
  const bannerSize = label.length > 12 ? 6 : label.length > 8 ? 7 : 8;

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
        <linearGradient id={`${gid}-veil`} x1="40" y1="54" x2="40" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={N} stopOpacity="0" />
          <stop offset="40%" stopColor={N} stopOpacity="0.28" />
          <stop offset="100%" stopColor={kit.jerseyShade} stopOpacity="0.82" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="40" cy="40" r="36" />
        </clipPath>
      </defs>

      {/* Fat sticker ring */}
      <circle cx="40" cy="40" r="39.5" fill={kit.sky} />
      <circle cx="40" cy="40" r="38" fill="none" stroke={N} strokeWidth="3.5" />
      <circle cx="40" cy="40" r="36.2" fill="none" stroke={kit.jersey} strokeWidth="2.2" />

      <g clipPath={`url(#${gid}-clip)`}>
        {/* Flat pastel field — no gradients, no night */}
        <rect width="80" height="80" fill={kit.sky} />

        {/* Gold halo ring — ape energy, football glory */}
        <ellipse
          cx="40"
          cy="14"
          rx="18"
          ry="5.5"
          fill="none"
          stroke={c("gold")}
          strokeWidth="3.2"
        />
        <ellipse
          cx="40"
          cy="14"
          rx="18"
          ry="5.5"
          fill="none"
          stroke={N}
          strokeWidth="1.2"
          opacity="0.35"
        />

        {/* Jersey — flat slab, one shade block */}
        <path
          d="M6 80 V50 Q8 42 22 40 L58 40 Q72 42 74 50 V80 Z"
          fill={kit.jersey}
          stroke={N}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path d="M54 42 Q68 46 72 80 H58 Q56 54 54 44 Z" fill={kit.jerseyShade} />
        {/* Collar */}
        <path
          d="M26 40 L32 48 L40 44 L48 48 L54 40"
          fill={kit.jerseyShade}
          stroke={N}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <text
          x="40"
          y={banner ? 54 : 66}
          textAnchor="middle"
          fontSize={num.length > 1 ? (banner ? 13 : 16) : banner ? 15 : 18}
          fontWeight="900"
          fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
          fill={kit.number}
          stroke={N}
          strokeWidth="2"
          paintOrder="stroke fill"
        >
          {num}
        </text>

        {/* Neck — flat */}
        <rect
          x="32"
          y="40"
          width="16"
          height="10"
          rx="3"
          fill={SKIN.base}
          stroke={N}
          strokeWidth="2.6"
        />
        <rect x="40" y="42" width="8" height="8" rx="2" fill={SKIN.shade} />

        {/* Big cartoon head */}
        <ellipse
          cx="40"
          cy="30"
          rx="16"
          ry="15.5"
          fill={SKIN.base}
          stroke={N}
          strokeWidth="3.2"
        />
        {/* One flat shade on the cheek — cel, not realistic */}
        <ellipse cx="48" cy="32" rx="5" ry="8" fill={SKIN.shade} />

        {/* Cap / helmet shell — simple dome */}
        <path
          d="M24 28 Q24 12 40 11 Q56 12 56 28 L56 30 Q52 28 48 26 L32 26 Q28 28 24 30 Z"
          fill={kit.helmet}
          stroke={N}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Centre stripe */}
        <path d="M37 12 L37 27 L43 27 L43 12 Z" fill={N} />
        <path d="M38.2 13 L38.2 26 L41.8 26 L41.8 13 Z" fill={kit.jersey} />

        {/*
          Big rectangular goggles — the non-realistic beat. Dark lenses,
          thick frame, three white slash reflections like the ape reference.
        */}
        <rect
          x="24"
          y="26"
          width="32"
          height="12"
          rx="3"
          fill={N}
          stroke={N}
          strokeWidth="3"
        />
        <rect x="26" y="28" width="13" height="8" rx="1.5" fill={c("night-50")} />
        <rect x="41" y="28" width="13" height="8" rx="1.5" fill={c("night-50")} />
        <path d="M28 29.5 L35 34.5" stroke={c("ink")} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        <path d="M30.5 29.5 L37 34.5" stroke={c("ink")} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
        <path d="M43 29.5 L50 34.5" stroke={c("ink")} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        <path d="M45.5 29.5 L52 34.5" stroke={c("ink")} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
        {/* Bridge */}
        <rect x="38" y="29" width="4" height="6" fill={N} />

        {/* Wide cartoon mouth */}
        <path
          d="M30 40 Q40 46 50 40"
          fill="none"
          stroke={N}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Tiny football sticker */}
        <g transform="translate(62 50) rotate(-25) scale(0.42)">
          <Football x={0} y={0} rx={14} fill={c("gold")} />
        </g>

        {/* Soft status veil — hugs the circle via clip */}
        {banner && (
          <g>
            <path d="M2 56 Q40 50 78 56 L80 80 L0 80 Z" fill={`url(#${gid}-veil)`} />
            <path
              d="M8 57 Q40 51.5 72 57"
              fill="none"
              stroke={c("ink")}
              strokeWidth="1.6"
              opacity="0.4"
              strokeLinecap="round"
            />
            {showLabel && (
              <text
                x="40"
                y="70"
                textAnchor="middle"
                fontSize={bannerSize}
                fontWeight="900"
                fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
                letterSpacing="0.1em"
                fill={c("ink")}
                stroke={N}
                strokeWidth="0.8"
                paintOrder="stroke fill"
              >
                {label}
              </text>
            )}
          </g>
        )}
      </g>
    </svg>
  );
}
