"use client";

// Right-hand rail: what you have today, where else you can practise, and
// where you stand.
//
// This was eight separate cards — timeouts, rapid fire, practice field, mock
// screens, shop, depth chart, daily drills, next badges — which put 18
// top-level cards on a single course page. Same information, grouped by what
// the learner is actually asking:
//
//   Today          what have I got, and what's left to do
//   Practice       where else can I go
//   Your standing  how far along am I
//   Shop           spend tickets (kept separate: it's transactional)
//
// Each destination is one line instead of a card with its own heading,
// paragraph and button. The paragraphs were explaining things the link name
// already says.

import Link from "next/link";
import SidelineShop from "@/components/sideline-shop";
import {
  nextEnshrinement,
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
      label: "Play a lesson today",
      icon: "🏈",
      have: activeToday ? 1 : 0,
      need: 1,
    },
    {
      id: "xp-chunk",
      label: `Earn ${xpChunk} XP`,
      icon: "📏",
      have: towardXp,
      need: xpChunk,
    },
    {
      id: "perfect",
      label: "Nail a perfect lesson",
      icon: "🎯",
      have: Math.min(stats.perfectLessons, 1),
      need: 1,
    },
  ];
}

/** One destination. The name carries the meaning; the note is four words. */
const PRACTICE_LINKS: {
  href: string;
  name: string;
  note: string;
  accent: "gold" | "turf" | "ice";
}[] = [
  { href: "/field", name: "Practice Field", note: "free-play SQL", accent: "turf" },
  { href: "/excel", name: "Spreadsheet", note: "free-play Excel", accent: "turf" },
  { href: "/projects", name: "Projects", note: "builds & cases", accent: "ice" },
];

/**
 * Written out in full, never built by interpolation: Tailwind generates CSS by
 * scanning source for complete class names, so `group-hover:text-${x}` would
 * compile to nothing.
 */
const HOVER = {
  gold: "group-hover:text-gold",
  turf: "group-hover:text-turf",
  ice: "group-hover:text-ice",
} as const;

export default function LearnRail({
  progress,
  onProgress,
  /** Course pages: no menu of other products beside the next lesson. */
  quiet = false,
}: {
  progress: Progress;
  onProgress?: (p: Progress) => void;
  quiet?: boolean;
}) {
  const stats = statsFrom(progress);
  const drills = buildDrills(progress, stats);
  const league = leagueLabel(stats.lessonsDone);
  const nextBadge = nextEnshrinement(stats);

  return (
    <aside className="flex flex-col gap-4">
      {/* ── Today ─────────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-baseline justify-between gap-2">
          <p className="label-broadcast text-ice">today</p>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {progress.seasonPass ? "season pass" : "free tier"}
          </span>
        </div>

        <p className="mt-1 font-display text-3xl font-bold text-ink">
          {progress.seasonPass ? "∞" : progress.timeouts}
          {!progress.seasonPass && (
            <span className="text-lg text-ink-muted">/{FREE_DAILY_TIMEOUTS}</span>
          )}
          <span className="ml-2 font-mono text-xs uppercase tracking-wider text-ink-muted">
            timeouts
          </span>
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
          {progress.seasonPass
            ? "Unlimited graded drives."
            : "A graded lesson spends one. Everything under Practice is free."}
        </p>

        <ul className="mt-4 space-y-3 border-t border-panel-border pt-3">
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
                    <span style={{ width: `${Math.max(pct, done ? 100 : 0)}%` }} />
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

      {!quiet && (
      <div className="section-card">
        <p className="label-broadcast text-turf">practice</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
          None of these spend a timeout.
        </p>
        <ul className="mt-3 divide-y divide-panel-border border-t border-panel-border">
          {PRACTICE_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex items-center justify-between gap-3 py-2.5 transition-colors"
              >
                <span
                  className={`font-display text-[15px] font-bold text-ink transition-colors ${HOVER[l.accent]}`}
                >
                  {l.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  {l.note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      )}
      <div className="section-card">
        <p className="label-broadcast text-gold">your standing</p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="font-display text-xl font-bold text-gold">{league}</p>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {stats.lessonsDone} done
          </span>
        </div>

        {nextBadge && (
          <div className="mt-3 border-t border-panel-border pt-3">
            <div className="flex items-center gap-2">
              <span className="opacity-40 grayscale" aria-hidden>
                {nextBadge.glyph}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink-soft">
                  Next enshrinement: {nextBadge.name}
                </p>
                <div className="quest-bar mt-1">
                  <span
                    style={{
                      width: `${
                        nextBadge.progress(stats).need > 0
                          ? Math.round(
                              (nextBadge.progress(stats).have /
                                nextBadge.progress(stats).need) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <span className="font-mono text-[10px] text-ink-muted">
                {nextBadge.progress(stats).have}/{nextBadge.progress(stats).need}
              </span>
            </div>
          </div>
        )}

        <Link
          href="/learn#trophies"
          className="mt-3 block w-full rounded-xl border border-panel-border py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted transition-colors hover:border-gold/50 hover:text-gold"
        >
          Hall of Fame
        </Link>
      </div>

      <SidelineShop progress={progress} onChange={onProgress} />
    </aside>
  );
}
