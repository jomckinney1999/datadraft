"use client";

import Link from "next/link";
import { displayStreak, type Progress } from "@/lib/progress";

/**
 * Soft nudge when the heater is at risk or ripe to extend — Duo “keep the
 * streak” energy without a modal.
 */
export default function StreakNudge({ progress }: { progress: Progress }) {
  const streak = displayStreak(progress);
  const playedToday = progress.lastActiveDay === todayIso();

  if (streak === 0 && !playedToday) {
    return (
      <div className="surface mt-4 flex flex-wrap items-center justify-between gap-3 border border-panel-border bg-panel px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Today&apos;s first snap
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            One lesson lights the heater. Coach is waiting on the sideline.
          </p>
        </div>
        <Link href="/learn/path" className="font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:underline">
          Take a snap →
        </Link>
      </div>
    );
  }

  if (streak > 0 && !playedToday) {
    return (
      <div className="surface mt-4 flex flex-wrap items-center justify-between gap-3 border border-gold/40 bg-gold/10 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
            Heater at risk · {streak}-day
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            Miss today and Coach gets salty. One drive keeps the flame.
          </p>
        </div>
        <Link
          href="/learn/path"
          className="rounded-xl border border-gold/50 bg-gold/20 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-gold"
        >
          Protect it →
        </Link>
      </div>
    );
  }

  if (streak >= 3 && playedToday) {
    return (
      <div className="surface mt-4 border border-turf/30 bg-turf/10 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-turf">
          Heater locked in · {streak}-day
        </p>
        <p className="mt-0.5 text-sm text-ink-soft">
          Nice. Come back tomorrow to push it further — or keep stacking XP now.
        </p>
      </div>
    );
  }

  return null;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
