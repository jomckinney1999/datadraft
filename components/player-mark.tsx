/**
 * Logo-style profile mark — flat ape-NFT cartoon energy, but an owl.
 *
 * Owls read as the smart animal; big round glasses do the rest. Solid pastel
 * field, thick night outlines, flat fills, one shade block, gold halo, soft
 * status veil. Shirt colour + number are the kit customisation — no football
 * gear. One fixed feather palette (not a race menu). Gradient ids sanitized.
 */

import { c, N, type Tone } from "@/components/art-kit";
import type { KitAccent } from "@/lib/progress";

/** Fixed cartoon feather / face — illustration hexes, like the cast. */
const OWL = {
  feather: "rgb(92 72 58)",
  featherShade: "rgb(62 48 38)",
  face: "rgb(232 198 158)",
  faceShade: "rgb(198 158 118)",
  beak: "rgb(255 180 60)",
  beakShade: "rgb(212 140 30)",
} as const;

/**
 * Shirt = kit accent. Sky = flat complementary pastel so the dark owl
 * pops the way a cream field pops a Bored Ape.
 */
const KIT: Record<
  KitAccent,
  {
    primary: Tone;
    shirt: string;
    shirtShade: string;
    number: string;
    sky: string;
    frames: string;
  }
> = {
  ice: {
    primary: "ice",
    shirt: c("ice"),
    shirtShade: c("ice-dim"),
    number: c("ink"),
    sky: c("gold"),
    frames: c("night"),
  },
  turf: {
    primary: "turf",
    shirt: c("turf"),
    shirtShade: c("turf-dim"),
    number: c("night"),
    sky: c("gold"),
    frames: c("night"),
  },
  gold: {
    primary: "gold",
    shirt: c("gold"),
    shirtShade: c("gold-dim"),
    number: c("night"),
    sky: c("ice"),
    frames: c("night"),
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
      aria-label={banner ? `Owl ${num}, ${status}` : `Owl ${num}`}
    >
      <defs>
        <linearGradient id={`${gid}-veil`} x1="40" y1="54" x2="40" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={N} stopOpacity="0" />
          <stop offset="40%" stopColor={N} stopOpacity="0.28" />
          <stop offset="100%" stopColor={kit.shirtShade} stopOpacity="0.82" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="40" cy="40" r="36" />
        </clipPath>
      </defs>

      {/* Fat sticker ring */}
      <circle cx="40" cy="40" r="39.5" fill={kit.sky} />
      <circle cx="40" cy="40" r="38" fill="none" stroke={N} strokeWidth="3.5" />
      <circle cx="40" cy="40" r="36.2" fill="none" stroke={kit.shirt} strokeWidth="2.2" />

      <g clipPath={`url(#${gid}-clip)`}>
        {/* Flat pastel field */}
        <rect width="80" height="80" fill={kit.sky} />

        {/* Gold halo — ape energy */}
        <ellipse cx="40" cy="13" rx="17" ry="5" fill="none" stroke={c("gold")} strokeWidth="3.2" />
        <ellipse cx="40" cy="13" rx="17" ry="5" fill="none" stroke={N} strokeWidth="1.2" opacity="0.35" />

        {/* Shirt — flat, kit colour, number like an ape tee graphic */}
        <path
          d="M8 80 V52 Q10 44 24 42 L56 42 Q70 44 72 52 V80 Z"
          fill={kit.shirt}
          stroke={N}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path d="M54 44 Q68 48 70 80 H58 Q56 56 54 46 Z" fill={kit.shirtShade} />
        <path
          d="M28 42 L33 50 L40 46 L47 50 L52 42"
          fill={kit.shirtShade}
          stroke={N}
          strokeWidth="2.2"
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

        {/* Oversized owl ears / head tufts */}
        <path
          d="M18 28 Q14 10 28 18 Z"
          fill={OWL.feather}
          stroke={N}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M62 28 Q66 10 52 18 Z"
          fill={OWL.feather}
          stroke={N}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M20 26 Q18 16 26 20 Z" fill={OWL.featherShade} />
        <path d="M60 26 Q62 16 54 20 Z" fill={OWL.featherShade} />

        {/* Round cartoon head */}
        <ellipse
          cx="40"
          cy="32"
          rx="22"
          ry="20"
          fill={OWL.feather}
          stroke={N}
          strokeWidth="3.4"
        />
        {/* One flat shade cheek */}
        <ellipse cx="52" cy="36" rx="7" ry="11" fill={OWL.featherShade} />

        {/* Pale face disc */}
        <ellipse
          cx="40"
          cy="34"
          rx="14"
          ry="13"
          fill={OWL.face}
          stroke={N}
          strokeWidth="2.6"
        />
        <ellipse cx="46" cy="36" rx="5" ry="8" fill={OWL.faceShade} />

        {/*
          Big round glasses — the smart beat. Thick frames, tinted lenses,
          white slash reflections (ape goggle energy).
        */}
        <circle cx="31" cy="30" r="9.5" fill={c("night-50")} stroke={kit.frames} strokeWidth="3.4" />
        <circle cx="49" cy="30" r="9.5" fill={c("night-50")} stroke={kit.frames} strokeWidth="3.4" />
        <path d="M40 30 H40.01" stroke={kit.frames} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M25.5 27 L34 34" stroke={c("ink")} strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        <path d="M27.5 26.5 L35.5 33.5" stroke={c("ink")} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M43.5 27 L52 34" stroke={c("ink")} strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        <path d="M45.5 26.5 L53.5 33.5" stroke={c("ink")} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        {/* Tiny pupils peeking through */}
        <circle cx="31" cy="31" r="2.2" fill={N} />
        <circle cx="49" cy="31" r="2.2" fill={N} />
        <circle cx="31.7" cy="30.3" r="0.7" fill={c("ink")} />
        <circle cx="49.7" cy="30.3" r="0.7" fill={c("ink")} />

        {/* Triangle beak */}
        <path
          d="M36 38 L40 46 L44 38 Z"
          fill={OWL.beak}
          stroke={N}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M40 39.5 L40 44.5" stroke={OWL.beakShade} strokeWidth="1.6" strokeLinecap="round" />

        {/* Soft status veil */}
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
