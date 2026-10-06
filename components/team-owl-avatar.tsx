import { nflTeam, type NflTeamAbbr } from "@/lib/nfl-team-avatars";

/**
 * One owl per image, cut from the sprite (public/avatars/nfl-team-owls.jpg,
 * eight teams by four) by scripts/build-owl-avatars.py into
 * public/avatars/owls/. The sprite is 423 KB and the nav's locker chip shows
 * one 28px owl on every page; one cell is ~8 KB (2026-10-06).
 */
const OWLS = "/avatars/owls";
/** A cell's width over its height in the source: 128 × 233.75. */
const CELL_ASPECT = 128 / 233.75;

/**
 * The owl before you've drafted a team (components/player-mark.tsx): cell
 * one's face, cropped square below the cap's logo and above the jersey's
 * number and turned grey, so it's the same owl with no team on it. The crop
 * is baked by the build script.
 */
export function FreeAgentOwl({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-night ${className}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${OWLS}/free-agent.webp`}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
    </span>
  );
}

/**
 * The supplied cells are portrait (128×234), not square. Fit a complete cell
 * to the square's height, center it, and fill the side gutters with the
 * team's primary colour. That preserves the owl's proportions.
 */
export default function TeamOwlAvatar({
  team: abbr,
  className = "",
  labelled = false,
}: {
  team: NflTeamAbbr;
  className?: string;
  labelled?: boolean;
}) {
  const team = nflTeam(abbr)!;

  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ backgroundColor: team.primary }}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? `${team.name} owl avatar` : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <span
        className="absolute inset-y-0 left-1/2 block -translate-x-1/2 overflow-hidden"
        style={{ width: `${CELL_ASPECT * 100}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${OWLS}/${abbr.toLowerCase()}.webp`}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
        />
      </span>
    </span>
  );
}
