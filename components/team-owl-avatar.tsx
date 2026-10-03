import { nflTeam, type NflTeamAbbr } from "@/lib/nfl-team-avatars";

const SPRITE = "/avatars/nfl-team-owls.jpg";
const SOURCE_WIDTH = 1024;
const SOURCE_HEIGHT = 935;
const COLS = 8;
const ROWS = 4;

/**
 * The supplied source has portrait cells (128×234), not square cells. Fit a
 * complete cell to the square's height, center it, and fill the side gutters
 * with the team's primary colour. That preserves the owl's proportions.
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
  const cellWidth = SOURCE_WIDTH / COLS;
  const cellHeight = SOURCE_HEIGHT / ROWS;
  const cellWidthPct = (cellWidth / cellHeight) * 100;

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
        style={{ width: `${cellWidthPct}%` }}
      >
        {/* A plain img keeps the user-supplied sprite local and deterministic. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SPRITE}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none select-none"
          style={{
            width: `${COLS * 100}%`,
            height: `${ROWS * 100}%`,
            left: `${team.col * -100}%`,
            top: `${team.row * -100}%`,
          }}
        />
      </span>
    </span>
  );
}
