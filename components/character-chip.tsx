"use client";

/**
 * Top-right locker chip — your callsign, level, tenure rank, and avatar.
 * Links to /account where you name and kit the character.
 */

import Link from "next/link";
import SidelineCast from "@/components/sideline-cast";
import { displayName, tenureFrom } from "@/lib/tenure";
import type { Progress } from "@/lib/progress";

const TONE: Record<string, string> = {
  turf: "border-turf/50 text-turf",
  ice: "border-ice/50 text-ice",
  gold: "border-gold/50 text-gold",
};

export default function CharacterChip({
  progress,
  compact = false,
}: {
  progress: Progress;
  /** Nav drawer: full width row. */
  compact?: boolean;
}) {
  const tenure = tenureFrom(progress);
  const name = displayName(progress);
  const tone = TONE[tenure.rank.tone] ?? TONE.ice;

  return (
    <Link
      href="/account#locker"
      title={`${name} · Lv ${tenure.level} · ${tenure.rank.name}`}
      className={`group flex items-center gap-2 rounded-xl border bg-panel/80 transition-colors hover:bg-panel ${tone} ${
        compact ? "w-full px-2.5 py-2" : "max-w-[11.5rem] px-1.5 py-1 pr-2.5"
      }`}
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-panel-border bg-night/60">
        <SidelineCast
          kind="rookie"
          tone={progress.kitTone}
          accent={progress.kitAccent}
          jersey={progress.jersey}
          size={36}
          animated={false}
        />
      </span>
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
