"use client";

// Top status chips: division · heater · timeouts · tickets · XP.
// Shared by the course roadmap and the /learn catalog.

import Link from "next/link";
import { displayStreak, type Progress } from "@/lib/progress";
import { statsFrom, BADGES, isEarned } from "@/lib/achievements";
import { FREE_DAILY_TIMEOUTS } from "@/lib/economy";

function FlameIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 ${active ? "text-gold" : "text-ink-muted"}`}
      aria-hidden
    >
      <path
        d="M12 2c1 4-3 5.5-3 9a3 3 0 0 0 6 0c0-1.5-.8-2.6-.8-2.6S17 10 17 13a5 5 0 0 1-10 0c0-4.5 4-6.5 5-11z"
        fill="currentColor"
      />
    </svg>
  );
}

function HelmetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-turf" aria-hidden>
      <path
        d="M4 14c0-5 3.5-9 8-9s8 4 8 9v1.5c0 .8-.7 1.5-1.5 1.5H14l-1.2 2.4c-.2.4-.6.6-1 .6h-1.6c-.4 0-.8-.2-1-.6L8 17H5.5C4.7 17 4 16.3 4 15.5V14z"
        fill="currentColor"
      />
      <path
        d="M13 11.5h5.5"
        stroke="#06080c"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold" aria-hidden>
      <path
        d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a1.5 1.5 0 1 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a1.5 1.5 0 1 0 0-4V8z"
        fill="currentColor"
        fillOpacity="0.85"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ice" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 8v4l2.5 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Depth-chart rank from lesson count — personal, not multiplayer. */
export function leagueLabel(lessonsDone: number): string {
  if (lessonsDone >= 40) return "Pro Bowl";
  if (lessonsDone >= 15) return "Starter";
  if (lessonsDone >= 5) return "Depth Chart";
  if (lessonsDone >= 1) return "Practice Squad";
  return "Walk-on";
}

export default function LearnStatusChips({
  progress,
  trophiesHref = "/learn#trophies",
}: {
  progress: Progress;
  trophiesHref?: string;
}) {
  const streak = displayStreak(progress);
  const stats = statsFrom(progress);
  const league = leagueLabel(stats.lessonsDone);
  const earned = BADGES.filter((b) => isEarned(b, stats)).length;
  const timeoutsLabel = progress.seasonPass
    ? "∞"
    : `${progress.timeouts}/${FREE_DAILY_TIMEOUTS}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={trophiesHref}
        className="status-chip hover:border-turf/50"
        title={`${earned} badges · ${league}`}
      >
        <HelmetIcon />
        <span className="hidden sm:inline">{league}</span>
        <span className="sm:hidden">{league.split(" ")[0]}</span>
      </Link>
      <span
        className={`status-chip ${streak > 0 ? "border-gold/40 text-gold" : ""}`}
        title={
          progress.byeWeeks > 0
            ? `Heater · ${progress.byeWeeks} bye week${progress.byeWeeks === 1 ? "" : "s"} ready`
            : "Day streak (heater)"
        }
      >
        <FlameIcon active={streak > 0} />
        {streak}
        {progress.byeWeeks > 0 && (
          <span className="text-ice" title="Bye weeks">
            ·{progress.byeWeeks}🛡️
          </span>
        )}
        <span className="hidden text-ink-muted md:inline">heater</span>
      </span>
      <span
        className="status-chip text-ice"
        title="Timeouts left today — each graded drive costs one"
      >
        <ClockIcon />
        {timeoutsLabel}
        <span className="hidden text-ink-muted lg:inline">TO</span>
      </span>
      <span className="status-chip text-gold" title="Scouting tickets">
        <TicketIcon />
        {progress.tickets}
        <span className="hidden text-ink-muted lg:inline">tix</span>
      </span>
      <span className="status-chip text-turf" title="Season XP">
        {progress.xp} XP
      </span>
      <span
        className="status-chip hidden text-ink-soft xl:inline-flex"
        title="Career yards"
      >
        {progress.totalYards.toLocaleString()} yd
      </span>
    </div>
  );
}
