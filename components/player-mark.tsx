/**
 * Your mark: the owl, everywhere you show up (nav chip, locker, dashboard,
 * course rail).
 *
 * Draft a team and it's that team's owl, in full colour. Before you've
 * drafted one it's the free-agent owl (decided 2026-10-05, replacing the
 * hand-drawn bird that read as a duck): the same owl, cropped to the face so
 * no team's cap or number shows, in greyscale, because a free agent hasn't
 * picked colours yet. Both come from the one owl sprite
 * (components/team-owl-avatar.tsx), so there's a single character.
 *
 * `jersey` and `kitAccent` are kept in the signature for the callers that
 * pass them; the owls carry their own kit.
 */

import type { KitAccent } from "@/lib/progress";
import type { Tone } from "@/components/art-kit";
import TeamOwlAvatar, { FreeAgentOwl } from "@/components/team-owl-avatar";
import { nflTeam, type NflTeamAbbr } from "@/lib/nfl-team-avatars";

export default function PlayerMark({
  jersey,
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
  void jersey;
  const tone = rankTone ?? kitAccent;
  const label = (status ?? "").trim().toUpperCase();
  const hasBadge = Boolean(label);
  const showText = hasBadge && size >= 44;
  const team = nflTeam(favoriteTeam);

  return (
    <span
      className={`player-mark-glow relative inline-block shrink-0 overflow-hidden rounded-full border-[3px] border-night bg-night ${className}`}
      data-tone={tone}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${team ? `${team.name} owl` : "Free-agent owl"}${hasBadge ? `, ${status}` : ""}`}
    >
      {team ? (
        <TeamOwlAvatar team={team.abbr} className="absolute inset-0 h-full w-full" />
      ) : (
        <FreeAgentOwl className="absolute inset-0 h-full w-full" />
      )}
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
