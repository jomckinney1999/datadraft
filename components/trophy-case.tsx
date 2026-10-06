"use client";

/**
 * The Hall of Fame on /achievements: every badge, earned and unearned,
 * standing in a lit glass case — gold at eye level, then silver, then bronze.
 *
 * Lives under Dashboard (your locker), not Courses — trophies are about what
 * you've done across the whole product, the way a game opens its achievement
 * cabinet from the home screen.
 *
 * Locked badges are shown rather than hidden. A case that only holds what you
 * already have gives a learner nothing to aim at, and a dark silhouette with
 * "3/5" on its nameplate is a far better prompt to start another lesson than
 * an empty shelf. Requirements are always stated, never mysterious.
 */

import { useEffect, useRef, useState } from "react";
import {
  BADGES,
  WINGS,
  isEarned,
  nextEnshrinement,
  statsFrom,
  type BadgeStats,
} from "@/lib/achievements";
import { displayStreak, loadProgress } from "@/lib/progress";
import { HofCabinet, HofSlot } from "@/components/hof-trophy";
import { playSfx } from "@/lib/sfx";

export default function TrophyCase() {
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [streak, setStreak] = useState(0);
  const announced = useRef(false);

  useEffect(() => {
    const p = loadProgress();
    const s = statsFrom(p);
    setStats(s);
    setStreak(displayStreak(p));
    if (!announced.current && BADGES.some((b) => isEarned(b, s))) {
      announced.current = true;
      playSfx("unlock");
    }
  }, []);

  // Server render and first paint show nothing rather than a flash of zeros —
  // progress lives in localStorage, which does not exist until mount.
  if (!stats) return null;

  const earned = BADGES.filter((b) => isEarned(b, stats)).length;
  const next = nextEnshrinement(stats);
  let slot = 0;

  return (
    <section id="hall" className="scroll-mt-20">
      <div className="text-center">
        <p className="label-broadcast text-gold">achievements · hall of fame</p>
        {/* The page's only heading at this level: /achievements is the Hall. */}
        <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
          {earned === 0 ? (
            "The lights are on"
          ) : (
            <>
              <span className="text-gold">{earned}</span> of {BADGES.length} enshrined
            </>
          )}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          {earned === 0
            ? "And the case is empty. Finish one lesson and First Snap takes the first spot in the Rookie Wing."
            : earned === BADGES.length
              ? "Every spot in the case is filled. First ballot, every one."
              : "No committee, no vote. Every trophy in this case was earned on the field — lessons cleared, perfect drives, days in a row."}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-panel-border bg-panel/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            {stats.totalYards.toLocaleString()} career yds
          </span>
          <span
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest ${
              streak > 0
                ? "border-gold/50 bg-gold/10 text-gold"
                : "border-panel-border bg-panel/60 text-ink-muted"
            }`}
          >
            🔥 {streak} day{streak === 1 ? "" : "s"}
          </span>
          {next && (
            <span className="rounded-full border border-turf/40 bg-turf/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-turf">
              Next enshrinement: {next.name} · {next.progress(stats).have}/{next.progress(stats).need}
            </span>
          )}
        </div>
      </div>

      <HofCabinet className="mt-10">
        {WINGS.map((wing) => {
          const badges = BADGES.filter((b) => b.tier === wing.tier);
          const inWing = badges.filter((b) => isEarned(b, stats)).length;
          return (
            <div key={wing.tier} className="hof-shelf" data-tier={wing.tier}>
              <p className="hof-wing">
                {wing.name}
                <span className="hof-wing-count">
                  {inWing}/{badges.length}
                </span>
              </p>
              <ul className="grid grid-cols-2 sm:grid-cols-4">
                {badges.map((badge) => {
                  const { have, need } = badge.progress(stats);
                  return (
                    <HofSlot key={badge.id} badge={badge} have={have} need={need} index={slot++} />
                  );
                })}
              </ul>
            </div>
          );
        })}
      </HofCabinet>
    </section>
  );
}
