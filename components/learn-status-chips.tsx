"use client";

// Top status chips: division · heater · timeouts · tickets · XP.
// Shared by the course roadmap and the /learn catalog.

import { displayStreak, type Progress } from "@/lib/progress";
import { FREE_DAILY_TIMEOUTS } from "@/lib/economy";
import { leagueLabel } from "@/lib/tenure";

export { leagueLabel };

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

export default function LearnStatusChips({
  progress,
  dense = false,
}: {
  progress: Progress;
  /**
   * The desktop bar: between lg and xl the six tabs leave room for two
   * chips, not three, so tickets (the least urgent) wait for xl.
   */
  dense?: boolean;
}) {
  const streak = displayStreak(progress);
  const timeoutsLabel = progress.seasonPass
    ? "∞"
    : `${progress.timeouts}/${FREE_DAILY_TIMEOUTS}`;

  return (
    <div className="flex max-w-full items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span
        className={`status-chip shrink-0 !px-2 !py-1 ${streak > 0 ? "border-gold/40 text-gold" : ""}`}
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
            ·{progress.byeWeeks}
          </span>
        )}
      </span>
      <span
        className="status-chip shrink-0 !px-2 !py-1 text-ice"
        title="Timeouts left today — each graded drive costs one"
      >
        <ClockIcon />
        {timeoutsLabel}
      </span>
      <span
        className={`status-chip shrink-0 !px-2 !py-1 text-gold ${dense ? "lg:!hidden xl:!inline-flex" : ""}`}
        title="Scouting tickets"
      >
        <TicketIcon />
        {progress.tickets}
      </span>
    </div>
  );
}
