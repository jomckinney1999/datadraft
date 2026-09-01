"use client";

/**
 * The trophy case on /learn: every badge, earned and unearned, with progress.
 *
 * Locked badges are shown rather than hidden. A trophy case that only lists
 * what you already have gives a learner nothing to aim at, and "3 / 5 lessons"
 * on a locked badge is a far better prompt to start another lesson than an
 * empty shelf. Requirements are always stated, never mysterious.
 */

import { useEffect, useState } from "react";
import {
  BADGES,
  TIER_CLASS,
  isEarned,
  statsFrom,
  type BadgeStats,
} from "@/lib/achievements";
import { displayStreak, loadProgress } from "@/lib/progress";

export default function TrophyCase() {
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const p = loadProgress();
    setStats(statsFrom(p));
    setStreak(displayStreak(p));
  }, []);

  // Server render and first paint show nothing rather than a flash of zeros —
  // progress lives in localStorage, which does not exist until mount.
  if (!stats) return null;

  const earned = BADGES.filter((b) => isEarned(b, stats)).length;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-broadcast text-turf">the trophy case</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">
            {earned} of {BADGES.length} earned
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="border border-panel-border bg-panel/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            {stats.totalYards.toLocaleString()} career yds
          </span>
          <span
            className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest ${
              streak > 0
                ? "border-gold/50 bg-gold/10 text-gold"
                : "border-panel-border bg-panel/60 text-ink-muted"
            }`}
          >
            🔥 {streak} day{streak === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((badge, i) => {
          const { have, need } = badge.progress(stats);
          const done = have >= need;
          return (
            <div
              key={badge.id}
              style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
              className={`lift animate-fade-up flex items-start gap-3 border p-3 ${
                done
                  ? `bg-panel/60 ${TIER_CLASS[badge.tier]}`
                  : "border-panel-border bg-panel/20"
              }`}
            >
              <span
                className={`text-xl leading-none ${done ? "" : "opacity-25 grayscale"}`}
                aria-hidden
              >
                {badge.glyph}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-display text-sm font-bold ${
                    done ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {badge.name}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
                  {badge.requirement}
                </p>
                {!done && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-panel">
                      <div
                        className="h-full rounded-full bg-turf/60"
                        style={{ width: `${need > 0 ? (have / need) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-ink-muted">
                      {have}/{need}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
