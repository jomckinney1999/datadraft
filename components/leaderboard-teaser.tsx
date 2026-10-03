"use client";

/**
 * Placeholder league board on the dashboard. Shows your character on top and
 * ghost rows for friends / league — the real board lands with accounts sync.
 */

import Link from "next/link";
import SidelineCast from "@/components/sideline-cast";
import type { Progress } from "@/lib/progress";
import { displayName, tenureFrom } from "@/lib/tenure";

const GHOSTS = [
  { name: "League mate", rank: "Starter", level: 28, tone: 1 as const, accent: "turf" as const },
  { name: "Rival GM", rank: "Rookie", level: 14, tone: 2 as const, accent: "ice" as const },
  { name: "Waivers shark", rank: "Depth Chart", level: 19, tone: 3 as const, accent: "gold" as const },
];

export default function LeaderboardTeaser({ progress }: { progress: Progress }) {
  const tenure = tenureFrom(progress);
  const name = displayName(progress);

  return (
    <section
      id="leaderboard"
      className="surface scroll-mt-20 overflow-hidden rounded-2xl border border-panel-border bg-panel"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-panel-border px-5 py-4 sm:px-6">
        <div>
          <p className="label-broadcast text-gold">locker room</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">Leaderboard</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Show your level and tenure. Friends and league boards come next.
          </p>
        </div>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
          Coming soon
        </span>
      </div>

      <ol className="divide-y divide-panel-border">
        <li className="flex items-center gap-3 bg-gold/5 px-5 py-3.5 sm:px-6">
          <span className="w-6 font-mono text-sm font-bold text-gold">1</span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/40 bg-night/50">
            <SidelineCast
              kind="rookie"
              tone={progress.kitTone}
              accent={progress.kitAccent}
              jersey={progress.jersey}
              size={48}
              animated={false}
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-base font-bold text-ink">{name}</span>
              <span className="rounded-full border border-gold/40 bg-gold/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gold">
                You
              </span>
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              Lv {tenure.level} · {tenure.rank.name} · {progress.xp} XP
            </span>
          </span>
          <Link
            href="/account#locker"
            className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-gold hover:underline"
          >
            Edit kit →
          </Link>
        </li>

        {GHOSTS.map((g, i) => (
          <li
            key={g.name}
            className="flex items-center gap-3 px-5 py-3 opacity-45 sm:px-6"
            aria-hidden
          >
            <span className="w-6 font-mono text-sm text-ink-muted">{i + 2}</span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-panel-border bg-night/40 grayscale">
              <SidelineCast
                kind="rookie"
                tone={g.tone}
                accent={g.accent}
                jersey={(i + 1) * 11}
                size={48}
                animated={false}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-bold text-ink-muted">{g.name}</span>
              <span className="font-mono text-[11px] text-ink-muted">
                Lv {g.level} · {g.rank}
              </span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">—</span>
          </li>
        ))}
      </ol>

      <p className="border-t border-panel-border px-5 py-3 text-xs leading-relaxed text-ink-muted sm:px-6">
        Sign in when accounts sync the board — until then this is your private standing.
        Level up by clearing lessons, solving questions and keeping a streak.
      </p>
    </section>
  );
}
