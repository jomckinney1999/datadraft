"use client";

// Right-hand gamification rail — Practice Field, depth chart, daily drills,
// next trophies. Football framing on Duo's widget layout.

import Link from "next/link";
import Coach from "@/components/coach";
import SidelineShop from "@/components/sideline-shop";
import {
  BADGES,
  isEarned,
  statsFrom,
  type BadgeStats,
} from "@/lib/achievements";
import { type Progress } from "@/lib/progress";
import { leagueLabel } from "@/components/learn-status-chips";
import { FREE_DAILY_TIMEOUTS } from "@/lib/economy";

type Quest = {
  id: string;
  label: string;
  icon: string;
  have: number;
  need: number;
};

function buildDrills(progress: Progress, stats: BadgeStats): Quest[] {
  const today = new Date().toISOString().slice(0, 10);
  const activeToday = progress.lastActiveDay === today;
  const xpChunk = 50;
  const towardXp =
    stats.xp === 0 ? 0 : stats.xp % xpChunk === 0 ? xpChunk : stats.xp % xpChunk;

  return [
    {
      id: "snap-today",
      label: "Take a snap today",
      icon: "🏈",
      have: activeToday ? 1 : 0,
      need: 1,
    },
    {
      id: "xp-chunk",
      label: `Bank ${xpChunk} XP`,
      icon: "📏",
      have: towardXp,
      need: xpChunk,
    },
    {
      id: "perfect",
      label: "Call a perfect drive",
      icon: "🎯",
      have: Math.min(stats.perfectLessons, 1),
      need: 1,
    },
  ];
}

function HelmetBadge() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 text-gold" aria-hidden>
      <ellipse cx="24" cy="26" rx="16" ry="14" fill="currentColor" fillOpacity="0.2" />
      <path
        d="M8 26c0-9 7-16 16-16s16 7 16 16v2c0 1.5-1.2 2.5-2.5 2.5H28l-2 4c-.3.6-1 1-1.7 1h-2.6c-.7 0-1.4-.4-1.7-1l-2-4H10.5C9.2 30.5 8 29.5 8 28v-2z"
        fill="currentColor"
      />
      <path
        d="M26 22h12"
        stroke="#06080c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LearnRail({
  progress,
  onProgress,
}: {
  progress: Progress;
  onProgress?: (p: Progress) => void;
}) {
  const stats = statsFrom(progress);
  const drills = buildDrills(progress, stats);
  const league = leagueLabel(stats.lessonsDone);
  const nextBadges = BADGES.filter((b) => !isEarned(b, stats)).slice(0, 3);

  return (
    <aside className="flex flex-col gap-4">
      <div className="section-card relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 yard-lines opacity-40"
        />
        <p className="relative label-broadcast text-ice">timeouts today</p>
        <p className="relative mt-1 font-display text-3xl font-bold text-ink">
          {progress.seasonPass ? "∞" : progress.timeouts}
          {!progress.seasonPass && (
            <span className="text-lg text-ink-muted">
              /{FREE_DAILY_TIMEOUTS}
            </span>
          )}
        </p>
        <p className="relative mt-1 text-[12px] leading-relaxed text-ink-muted">
          {progress.seasonPass
            ? "Season Pass — unlimited drives."
            : "Each graded lesson spends one timeout. Practice Field is free."}
        </p>
      </div>

      <div className="section-card relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 yard-lines opacity-40"
        />
        <p className="relative label-broadcast text-turf">open practice</p>
        <p className="relative mt-1 font-display text-lg font-bold text-ink">
          Hit the Practice Field
        </p>
        <p className="relative mt-1 text-sm leading-relaxed text-ink-soft">
          Ungraded free play over real NFL data — no timeouts, no scoreboard
          pressure.
        </p>
        <div className="relative mt-3 flex items-end justify-between gap-3">
          <Link
            href="/field"
            className="btn-turf inline-flex items-center rounded-xl border border-turf/80 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
          >
            Walk onto the field
          </Link>
          <Coach mood="happy" size={72} className="shrink-0" />
        </div>
      </div>

      <div className="section-card relative overflow-hidden">
        <p className="label-broadcast text-ice">mock screens</p>
        <p className="mt-1 font-display text-lg font-bold text-ink">
          Interview cases
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Scripted analyst scenarios — brief, schema, live SQL. Filter Easy /
          Medium / Hard. Free like the Practice Field.
        </p>
        <Link
          href="/interview"
          className="mt-3 inline-flex items-center rounded-xl border border-ice/50 bg-ice/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ice transition-colors hover:border-ice hover:bg-ice/20"
        >
          Open interview desk
        </Link>
      </div>

      <SidelineShop progress={progress} onChange={onProgress} />

      <div className="section-card">
        <p className="label-broadcast text-gold">depth chart</p>
        <p className="mt-1 font-display text-base font-bold text-ink">
          {stats.lessonsDone === 0
            ? "Earn your roster spot"
            : "You're moving up the chart"}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <HelmetBadge />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
              Current role
            </p>
            <p className="font-display text-lg font-bold text-gold">{league}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
              Ranked from your lessons — live standings land with accounts.
            </p>
          </div>
        </div>
        <Link
          href="/learn#trophies"
          className="mt-4 block w-full rounded-xl border-2 border-panel-border border-b-4 py-2.5 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-ink-soft transition-colors hover:border-gold/50 hover:text-gold"
        >
          Open the trophy case
        </Link>
      </div>

      <div className="section-card">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-base font-bold text-ink">
            Daily Drills
          </p>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            today&apos;s sheet
          </span>
        </div>
        <ul className="mt-4 space-y-4">
          {drills.map((q) => {
            const pct = Math.min(100, Math.round((q.have / q.need) * 100));
            const done = q.have >= q.need;
            return (
              <li key={q.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span aria-hidden className="text-sm">
                    {q.icon}
                  </span>
                  <span className="flex-1 text-[13px] font-medium text-ink-soft">
                    {q.label}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">
                    {Math.min(q.have, q.need)}/{q.need}
                  </span>
                </div>
                <div className="quest-row">
                  <div
                    className="quest-bar"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span
                      style={{ width: `${Math.max(pct, done ? 100 : 0)}%` }}
                    />
                  </div>
                  <span
                    className={`quest-chest ${done ? "quest-chest-done" : ""}`}
                    aria-hidden
                    title={done ? "Drill done" : "Finish the drill"}
                  >
                    {done ? "🏈" : "📦"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {nextBadges.length > 0 && (
        <div className="section-card">
          <p className="label-broadcast text-turf">next hardware</p>
          <p className="mt-1 font-display text-base font-bold text-ink">
            Up next on the shelf
          </p>
          <ul className="mt-3 space-y-3">
            {nextBadges.map((badge) => {
              const { have, need } = badge.progress(stats);
              const pct = need > 0 ? Math.round((have / need) * 100) : 0;
              return (
                <li key={badge.id}>
                  <div className="flex items-center gap-2">
                    <span className="opacity-40 grayscale" aria-hidden>
                      {badge.glyph}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink-soft">
                        {badge.name}
                      </p>
                      <div className="quest-bar mt-1">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-ink-muted">
                      {have}/{need}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
