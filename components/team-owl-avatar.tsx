import { nflTeam, type NflTeamAbbr } from "@/lib/nfl-team-avatars";

const SPRITE = "/avatars/nfl-team-owls.jpg";
const SOURCE_WIDTH = 1024;
const SOURCE_HEIGHT = 935;
const COLS = 8;
const ROWS = 4;

/**
 * The owl before you've drafted a team (components/player-mark.tsx): one
 * cell of the sprite, cropped square to the face (below the cap's logo,
 * above the jersey's number) and shown in greyscale, so it's the same owl
 * with no team on it. The crop is in source pixels: a 100×100 square from
 * x 14, y 58 of the cell.
 */
const FREE_AGENT = { col: 0, row: 0, x: 14, y: 58, side: 100 };

export function FreeAgentOwl({ className = "" }: { className?: string }) {
  const cellWidth = SOURCE_WIDTH / COLS;
  const cellHeight = SOURCE_HEIGHT / ROWS;
  const { col, row, x, y, side } = FREE_AGENT;
  return (
    <span className={`relative block overflow-hidden bg-night ${className}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPRITE}
        alt=""
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none grayscale"
        style={{
          width: `${(SOURCE_WIDTH / side) * 100}%`,
          height: `${(SOURCE_HEIGHT / side) * 100}%`,
          left: `${(-(col * cellWidth + x) / side) * 100}%`,
          top: `${(-(row * cellHeight + y) / side) * 100}%`,
        }}
      />
    </span>
  );
}

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
