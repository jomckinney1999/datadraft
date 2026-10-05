"use client";

/**
 * Top-right locker chip — your callsign, level, tenure rank, and owl mark.
 * Links to /account where you name and kit the character.
 */

import Link from "next/link";
import PlayerMark from "@/components/player-mark";
import { displayName, tenureFrom } from "@/lib/tenure";
import Hint from "@/components/hint";
import type { Progress } from "@/lib/progress";

const TONE: Record<string, string> = {
  turf: "border-turf/60 bg-turf/10 text-turf shadow-[0_0_20px_rgb(var(--c-turf)/0.12)]",
  ice: "border-ice/60 bg-ice/10 text-ice shadow-[0_0_20px_rgb(var(--c-ice)/0.12)]",
  gold: "border-gold/60 bg-gold/10 text-gold shadow-[0_0_20px_rgb(var(--c-gold)/0.15)]",
};

export default function CharacterChip({
  progress,
  compact = false,
  icon = false,
}: {
  progress: Progress;
  /** Nav drawer: full width row. */
  compact?: boolean;
  /**
   * The desktop nav: just the mark, with the level on a badge. Six sections,
   * the status chips and the name chip didn't fit one row, and the tabs
   * ended up underneath the chips. The name and rank are in the tooltip and
   * the label, and on the drawer row and /account.
   */
  icon?: boolean;
}) {
  const tenure = tenureFrom(progress);
  const name = displayName(progress);
  const tone = TONE[tenure.rank.tone] ?? TONE.ice;

  if (icon) {
    const title = `Level ${tenure.level} · ${tenure.rank.name}`;
    const body = `Your level rises with everything you do here: lessons, questions, your streak, perfect drives and badges.${
      tenure.next ? ` ${tenure.need} more points to ${tenure.next.name}.` : ""
    } Click for your locker: your callsign, your team's owl and the full ladder.`;
    return (
      <Hint title={title} body={body} sr={`${title}. ${body}`} toggleOnTap={false}>
      <Link
        href="/account#locker"
        aria-label={`${name}, level ${tenure.level}, ${tenure.rank.name}. Your locker`}
        className={`relative flex rounded-full border p-0.5 transition-colors hover:brightness-110 ${tone}`}
      >
        <PlayerMark
          jersey={progress.jersey}
          kitAccent={progress.kitAccent}
          rankTone={tenure.rank.tone}
          status={tenure.rank.name}
          favoriteTeam={progress.favoriteTeam}
          size={32}
          className="player-mark-glow shrink-0"
        />
        <span
          aria-hidden
          className="absolute -bottom-1 -right-1.5 min-w-[1.15rem] rounded-full border border-current bg-night px-1 text-center font-mono text-[9px] font-bold leading-[1rem]"
        >
          {tenure.level}
        </span>
      </Link>
      </Hint>
    );
  }

  return (
    <Link
      href="/account#locker"
      title={`${name} · Lv ${tenure.level} · ${tenure.rank.name}`}
      className={`group flex items-center gap-2 rounded-full border transition-colors hover:brightness-110 ${tone} ${
        compact ? "w-full rounded-xl px-2.5 py-2" : "max-w-[12rem] py-0.5 pl-0.5 pr-2.5"
      }`}
    >
      <PlayerMark
        jersey={progress.jersey}
        kitAccent={progress.kitAccent}
        rankTone={tenure.rank.tone}
        status={tenure.rank.name}
        favoriteTeam={progress.favoriteTeam}
        size={compact ? 40 : 34}
        className={`player-mark-glow shrink-0`}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[13px] font-bold leading-tight text-ink group-hover:text-inherit">
          {name}
        </span>
        <span className="block truncate font-mono text-[9px] font-bold uppercase tracking-wider opacity-90">
          Lv {tenure.level} · {tenure.rank.name}
        </span>
      </span>
    </Link>
  );
}
