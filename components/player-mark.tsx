/**
 * An original stats-nerd owl in a flat collectible-avatar style.
 *
 * The visual language comes from the reference set's broad traits: a solid
 * colour field, chest-up 3/4 portrait, elongated face, expressive eyes,
 * thick ink contours, sparse flat shading, and one loud accessory. This is
 * intentionally character art rather than theme-token UI.
 */

import type { KitAccent } from "@/lib/progress";
import type { Tone } from "@/components/art-kit";
import TeamOwlAvatar from "@/components/team-owl-avatar";
import { nflTeam, type NflTeamAbbr } from "@/lib/nfl-team-avatars";

const P = {
  ink: "#171717",
  feather: "#51443D",
  featherDark: "#352C28",
  featherLight: "#705E53",
  face: "#DDBB8E",
  faceShade: "#B88C62",
  beak: "#DF9135",
  beakShade: "#A85D21",
  lens: "#D7F0EE",
  lensShade: "#93C6C8",
  paper: "#FFF9E4",
  cream: "#EEEFAE",
  gold: "#F0CA45",
} as const;

const KIT: Record<
  KitAccent,
  {
    shirt: string;
    shirtShade: string;
    field: string;
    accent: string;
  }
> = {
  ice: {
    shirt: "#277FA9",
    shirtShade: "#175470",
    field: "#F3A12E",
    accent: "#45C8E8",
  },
  turf: {
    shirt: "#5C9D45",
    shirtShade: "#376B2B",
    field: "#78D7E7",
    accent: "#77D64F",
  },
  gold: {
    shirt: "#D8A329",
    shirtShade: "#946A18",
    field: "#52D2AF",
    accent: "#F0C948",
  },
};

const RING: Record<Tone, string> = {
  ice: "#45C8E8",
  turf: "#77D64F",
  gold: "#F0C948",
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
  favoriteTeam,
}: {
  jersey?: number;
  kitAccent?: KitAccent;
  size?: number;
  className?: string;
  rankTone?: Tone;
  status?: string;
  favoriteTeam?: NflTeamAbbr | null;
}) {
  const kit = KIT[kitAccent] ?? KIT.ice;
  const tone = rankTone ?? kitAccent;
  const number = String(Math.max(0, Math.min(99, Math.round(jersey))));
  const label = (status ?? "").trim().toUpperCase();
  const hasBadge = Boolean(label);
  const showText = hasBadge && size >= 44;
  const labelSize = label.length > 12 ? 8 : label.length > 8 ? 9.5 : 11;
  const gid = safeId(["owl", kitAccent, number, label || "none"]);
  const draftedTeam = nflTeam(favoriteTeam);

  if (draftedTeam) {
    return (
      <span
        className={`player-mark-glow relative inline-block shrink-0 overflow-hidden rounded-full border-[3px] border-night bg-night ${className}`}
        data-tone={tone}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${draftedTeam.name} owl avatar${hasBadge ? `, ${status}` : ""}`}
      >
        <TeamOwlAvatar team={draftedTeam.abbr} className="absolute inset-0 h-full w-full" />
        {hasBadge && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 flex h-[31%] items-center justify-center border-t border-white/25 bg-gradient-to-b from-night/10 via-night/55 to-night/90 px-1"
          >
            {showText && (
              <span
                className="truncate font-display font-black uppercase tracking-[0.08em] text-white [text-shadow:0_1px_1px_rgb(0_0_0/0.9)]"
                style={{ fontSize: Math.max(5, size * 0.075) }}
              >
                {label}
              </span>
            )}
          </span>
        )}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`player-mark-glow ${className}`}
      data-tone={tone}
      role="img"
      aria-label={hasBadge ? `Stats owl ${number}, ${status}` : `Stats owl ${number}`}
    >
      <defs>
        <linearGradient id={`${gid}-badge`} x1="60" y1="86" x2="60" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={P.ink} stopOpacity="0.04" />
          <stop offset="35%" stopColor={P.ink} stopOpacity="0.44" />
          <stop offset="100%" stopColor={P.ink} stopOpacity="0.82" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="60" cy="60" r="54" />
        </clipPath>
      </defs>

      {/* Collectible-avatar frame. */}
      <circle cx="60" cy="60" r="59" fill={kit.field} />
      <circle cx="60" cy="60" r="57.2" fill="none" stroke={P.ink} strokeWidth="5.2" />
      <circle cx="60" cy="60" r="54.2" fill="none" stroke={RING[tone]} strokeWidth="2.8" />

      <g clipPath={`url(#${gid}-clip)`}>
        {/* Flat background, exactly one colour. */}
        <rect width="120" height="120" fill={kit.field} />

        {/* Thin halo: small accessory, not a logo element. */}
        <ellipse cx="57" cy="14" rx="23" ry="6" fill="none" stroke={P.gold} strokeWidth="3.4" />
        <ellipse cx="57" cy="14" rx="23" ry="6" fill="none" stroke={P.ink} strokeWidth="1.2" opacity="0.42" />

        {/* Shirt and sweater vest sit low, leaving a full portrait above. */}
        <path
          d="M7 124 L13 101 Q17 88 38 84 L74 84 Q96 89 104 104 L111 124 Z"
          fill={P.paper}
          stroke={P.ink}
          strokeWidth="4.2"
          strokeLinejoin="round"
        />
        <path
          d="M24 93 L40 85 L58 102 L76 84 L92 92 L102 124 H13 Z"
          fill={kit.shirt}
          stroke={P.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <path d="M77 86 Q95 94 101 124 H84 Q84 101 74 89 Z" fill={kit.shirtShade} />
        {/* Crisp shirt collar. */}
        <path d="M39 84 L58 101 L47 107 L32 89 Z" fill={P.paper} stroke={P.ink} strokeWidth="2.5" />
        <path d="M76 84 L58 101 L68 107 L83 89 Z" fill={P.paper} stroke={P.ink} strokeWidth="2.5" />
        {/* Bow tie. */}
        <path
          d="M54 99 L45 95 L45 106 L54 103 Z M62 99 L71 95 L71 106 L62 103 Z"
          fill="#D66D38"
          stroke={P.ink}
          strokeWidth="2"
        />
        <circle cx="58" cy="101" r="3.2" fill={P.gold} stroke={P.ink} strokeWidth="1.8" />

        {/* Long tapered neck creates the reference's recognisable silhouette. */}
        <path
          d="M44 59 L41 88 Q53 96 70 87 L68 56 Z"
          fill={P.feather}
          stroke={P.ink}
          strokeWidth="4.4"
          strokeLinejoin="round"
        />
        <path d="M60 59 L68 57 L70 87 Q64 92 59 92 Z" fill={P.featherDark} />
        <path d="M45 73 Q50 76 55 76" fill="none" stroke={P.featherLight} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M44 80 Q49 83 54 82" fill="none" stroke={P.featherLight} strokeWidth="1.5" strokeLinecap="round" />

        {/*
          Asymmetrical 3/4 head. It is deliberately taller than it is wide,
          with cheek mass and a beak projecting right—the key difference
          between a portrait and the previous centred mascot icon.
        */}
        <path
          d="M33 46
             Q29 28 40 20
             Q52 11 69 18
             Q80 22 82 35
             Q91 37 96 46
             Q100 56 94 65
             Q89 72 78 71
             Q74 81 63 84
             Q48 87 37 77
             Q31 71 31 61
             Q21 58 20 49
             Q20 40 27 37
             Q30 38 33 46 Z"
          fill={P.feather}
          stroke={P.ink}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Ear tufts / side feathers. */}
        <path d="M34 42 Q24 24 43 28 Z" fill={P.feather} stroke={P.ink} strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M78 39 Q88 23 82 47 Z" fill={P.featherDark} stroke={P.ink} strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M29 45 Q25 39 31 35 Q36 40 34 50 Z" fill={P.featherLight} stroke={P.ink} strokeWidth="2" />
        <path d="M83 43 Q89 38 92 45 Q92 52 85 57 Z" fill={P.featherLight} stroke={P.ink} strokeWidth="2" />
        {/* Sparse hard shadow on the far side. */}
        <path
          d="M68 19 Q83 24 82 37 Q94 40 96 50 Q97 63 84 69 Q76 76 65 82 L66 58 Z"
          fill={P.featherDark}
          opacity="0.78"
        />

        {/* Cream facial disc, weighted right for the 3/4 turn. */}
        <path
          d="M35 37
             Q42 25 55 33
             Q67 23 78 35
             Q84 44 79 57
             Q76 69 61 77
             Q47 71 38 60
             Q31 49 35 37 Z"
          fill={P.face}
          stroke={P.ink}
          strokeWidth="3.3"
          strokeLinejoin="round"
        />
        <path d="M63 32 Q77 27 81 40 Q84 55 70 68 L61 75 L60 43 Z" fill={P.faceShade} />

        {/* Heavy expressive brows above the glasses. */}
        <path d="M37 37 Q46 30 54 37" fill="none" stroke={P.ink} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M60 36 Q70 28 78 36" fill="none" stroke={P.ink} strokeWidth="3.2" strokeLinecap="round" />

        {/*
          Stats-nerd glasses: clear square lenses, visible sleepy eyes,
          taped bridge, and a tiny rising chart reflected on the right.
        */}
        <g transform="rotate(-2 58 47)">
          <rect x="32" y="38" width="25" height="21" rx="5" fill={P.lens} stroke={P.ink} strokeWidth="4.2" />
          <rect x="59" y="37" width="27" height="22" rx="5" fill={P.lens} stroke={P.ink} strokeWidth="4.2" />
          <path d="M57 45 Q58 42 60 45" fill="none" stroke={P.ink} strokeWidth="4" strokeLinecap="round" />
          <path d="M32 43 L24 40" fill="none" stroke={P.ink} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M86 42 L91 39" fill="none" stroke={P.ink} strokeWidth="3.2" strokeLinecap="round" />
          {/* Droopy white eyes. */}
          <path d="M37 49 Q44 43 51 49 Q44 55 37 49 Z" fill={P.paper} stroke={P.ink} strokeWidth="1.6" />
          <path d="M64 48 Q72 41 80 48 Q72 55 64 48 Z" fill={P.paper} stroke={P.ink} strokeWidth="1.6" />
          <circle cx="46" cy="49" r="2.2" fill={P.ink} />
          <circle cx="75" cy="48" r="2.2" fill={P.ink} />
          {/* Lens shine. */}
          <path d="M36 42 L43 49" stroke={P.paper} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M64 41 L70 47" stroke={P.paper} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          {/* Tape on the bridge. */}
          <path d="M55 39 L61 51" stroke={P.paper} strokeWidth="3.3" strokeLinecap="round" />
          <path d="M56 42 L60 40 M57 46 L62 44 M58 49 L62 47" stroke={P.lensShade} strokeWidth="0.9" />
          {/* Rising chart reflection. */}
          <path d="M66 54 V51 M71 54 V48 M76 54 V44 M81 54 V41" stroke="#2D9CA0" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* Long hooked beak supplies the ape references' projecting muzzle. */}
        <path
          d="M55 57
             Q68 52 80 55
             Q92 57 98 62
             Q90 66 81 67
             Q75 76 62 76
             Q54 72 55 57 Z"
          fill={P.beak}
          stroke={P.ink}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M78 57 Q90 58 98 62 Q90 66 80 66 Z" fill={P.beakShade} />
        <path d="M59 68 Q71 72 82 67" fill="none" stroke={P.ink} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M63 58 Q67 55 71 58" fill="none" stroke={P.ink} strokeWidth="1.8" strokeLinecap="round" />
        {/* A few ink feather marks keep it hand-drawn. */}
        <path d="M42 65 L45 68 M48 69 L50 72 M73 72 L70 75" stroke={P.ink} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

        {/* Curved translucent rank badge, clipped cleanly by the circle. */}
        {hasBadge && (
          <g>
            <path d="M4 89 Q60 79 116 89 L121 122 H-1 Z" fill={`url(#${gid}-badge)`} />
            <path
              d="M13 91 Q60 82.5 107 91"
              fill="none"
              stroke={P.paper}
              strokeWidth="1.5"
              opacity="0.38"
              strokeLinecap="round"
            />
            <path d="M25 114 Q60 119 95 114" fill="none" stroke={P.gold} strokeWidth="1.4" opacity="0.5" />
            {showText && (
              <>
                <text
                  x="60"
                  y="96"
                  textAnchor="middle"
                  fontSize="5.5"
                  fontWeight="800"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  letterSpacing="0.14em"
                  fill={P.paper}
                  opacity="0.72"
                >
                  NO. {number}
                </text>
                <text
                  x="60"
                  y="108.5"
                  textAnchor="middle"
                  fontSize={labelSize}
                  fontWeight="900"
                  fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
                  letterSpacing="0.1em"
                  fill={P.paper}
                  stroke={P.ink}
                  strokeWidth="0.75"
                  paintOrder="stroke fill"
                >
                  {label}
                </text>
              </>
            )}
          </g>
        )}
      </g>
    </svg>
  );
}
