"use client";

/**
 * Placeholder league board on the dashboard. Shows your character only —
 * no invented rivals (PLAN.md: honest trust). Friends and league boards
 * land with accounts sync.
 */

import Link from "next/link";
import PlayerMark from "@/components/player-mark";
import type { Progress } from "@/lib/progress";
import { displayName, tenureFrom } from "@/lib/tenure";

export default function LeaderboardTeaser({ progress }: { progress: Progress }) {
  const tenure = tenureFrom(progress);
  const name = displayName(progress);

  return (
    <section
      id="leaderboard"
      className="surface relative scroll-mt-20 overflow-hidden rounded-2xl border border-gold/30 bg-panel shadow-[0_0_40px_-14px_rgb(var(--c-gold)/0.35)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_0%,rgb(var(--c-gold)/0.14),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_100%,rgb(var(--c-turf)/0.10),transparent_50%)]"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-3 border-b border-panel-border px-5 py-4 sm:px-6">
        <div>
          <p className="label-broadcast text-gold">locker room</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">Leaderboard</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Your standing today. League and friend boards open when accounts sync ranks.
          </p>
        </div>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
          Coming soon
        </span>
      </div>

      <ol className="relative divide-y divide-panel-border">
        <li className="flex items-center gap-3 bg-gold/10 px-5 py-3.5 sm:px-6">
          <span className="w-6 font-mono text-sm font-bold text-gold">1</span>
          <PlayerMark
            jersey={progress.jersey}
            kitAccent={progress.kitAccent}
            rankTone={tenure.rank.tone}
            status={tenure.rank.name}
            size={44}
            className="shrink-0"
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-base font-bold text-ink">{name}</span>
              <span className="rounded-full border border-gold/40 bg-gold/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gold">
                You
              </span>
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              Lv {tenure.level} · {tenure.rank.name} · {progress.xp} XP · {progress.daysActive}{" "}
              day{progress.daysActive === 1 ? "" : "s"}
            </span>
          </span>
          <Link
            href="/account#locker"
            className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-gold hover:underline"
          >
            Edit kit →
          </Link>
        </li>

        {[2, 3, 4].map((n) => (
          <li
            key={n}
            className="flex items-center gap-3 px-5 py-3 sm:px-6"
            aria-hidden
          >
            <span className="w-6 font-mono text-sm text-ink-muted">{n}</span>
            <span className="h-11 w-11 shrink-0 rounded-xl border border-dashed border-panel-border bg-night/20" />
            <span className="min-w-0 flex-1">
              <span className="block h-3 w-28 rounded bg-panel-border/60" />
              <span className="mt-1.5 block h-2.5 w-40 rounded bg-panel-border/40" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">—</span>
          </li>
        ))}
      </ol>

      <p className="border-t border-panel-border px-5 py-3 text-xs leading-relaxed text-ink-muted sm:px-6">
        Level up by clearing lessons, solving questions and keeping a streak. Name your player so
        shares carry your callsign — then challenge your league when the board opens.
      </p>
    </section>
  );
}
