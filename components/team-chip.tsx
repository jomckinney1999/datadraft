/**
 * A three-letter team code with its own colour beside it.
 *
 * Used wherever a table or scoreboard shows a team, so a column of codes reads
 * as football instead of as strings. The swatch is a colour, never a logo.
 */

import { teamAccent, teamName } from "@/lib/team-colors";

export default function TeamChip({
  abbr,
  className = "",
}: {
  abbr: string;
  className?: string;
}) {
  if (!abbr) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={teamName(abbr)}
    >
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: teamAccent(abbr) }}
      />
      {abbr}
    </span>
  );
}

/** Is this column holding team codes? Used to decide when to colour a cell. */
export function isTeamColumn(name: string): boolean {
  return [
    "team",
    "home_team",
    "away_team",
    "opponent",
    "opponent_team",
    "recent_team",
    "posteam",
    "defteam",
  ].includes(name.toLowerCase());
}
