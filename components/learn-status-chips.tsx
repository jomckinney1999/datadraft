"use client";

// Top status chips: division · heater · timeouts · tickets · XP.
// Shared by the course roadmap and the /learn catalog.

import { displayStreak, type Progress } from "@/lib/progress";
import {
  COST_BYE_WEEK,
  COST_TIMEOUT_REFILL_FULL,
  COST_TIMEOUT_REFILL_ONE,
  FREE_DAILY_TIMEOUTS,
  TICKET_LESSON,
  TICKET_PERFECT_BONUS,
} from "@/lib/economy";
import Hint from "@/components/hint";
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
  const byes = progress.byeWeeks;

  // What each number means, in the words a hover card can hold (components/hint.tsx).
  const streakTitle = streak > 0 ? `${streak}-day streak` : "No streak yet";
  const streakBody =
    (streak > 0
      ? "Days in a row you've finished a lesson or solved a question. Miss a day and it starts again."
      : "Finish a lesson or solve a question today to start one. Come back tomorrow to keep it going.") +
    (byes > 0
      ? ` You have ${byes} bye week${byes === 1 ? "" : "s"} saved: each one covers a missed day automatically.`
      : ` A bye week (${COST_BYE_WEEK} tickets) covers one missed day.`);
  const timeoutsTitle = progress.seasonPass
    ? "Unlimited lessons"
    : `${progress.timeouts} of ${FREE_DAILY_TIMEOUTS} timeouts left today`;
  const timeoutsBody = progress.seasonPass
    ? "Your Season Pass means graded lessons never use a timeout."
    : `Starting a graded lesson uses one, and they refill every morning. Questions, games and the Practice Field never use them. Out early? Refill one for ${COST_TIMEOUT_REFILL_ONE} tickets or all of them for ${COST_TIMEOUT_REFILL_FULL}, in the sideline shop on any course page.`;
  const ticketsTitle = `${progress.tickets} scouting tickets`;
  const ticketsBody = `You earn them by playing: ${TICKET_LESSON} for a lesson (${TICKET_PERFECT_BONUS} more for a perfect drive, plus a streak bonus), 5 for a new question, 1 for a repeat, and 10 more for today's question. Spend them on timeout refills, bye weeks and replays.`;

  return (
    <div className="flex max-w-full items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Hint title={streakTitle} body={streakBody} sr={`${streakTitle}. ${streakBody}`}>
        <button
          type="button"
          aria-label={streakTitle}
          className={`status-chip shrink-0 cursor-help !px-2 !py-1 ${streak > 0 ? "border-gold/40 text-gold" : ""}`}
        >
          <FlameIcon active={streak > 0} />
          <span aria-hidden>{streak}</span>
          {byes > 0 && (
            <span aria-hidden className="text-ice">
              ·{byes}
            </span>
          )}
        </button>
      </Hint>
      <Hint title={timeoutsTitle} body={timeoutsBody} sr={`${timeoutsTitle}. ${timeoutsBody}`}>
        <button type="button" aria-label={timeoutsTitle} className="status-chip shrink-0 cursor-help !px-2 !py-1 text-ice">
          <ClockIcon />
          <span aria-hidden>{timeoutsLabel}</span>
        </button>
      </Hint>
      <Hint
        title={ticketsTitle}
        body={ticketsBody}
        sr={`${ticketsTitle}. ${ticketsBody}`}
        className={dense ? "lg:!hidden xl:!inline-flex" : ""}
      >
        <button type="button" aria-label={ticketsTitle} className="status-chip shrink-0 cursor-help !px-2 !py-1 text-gold">
          <TicketIcon />
          <span aria-hidden>{progress.tickets}</span>
        </button>
      </Hint>
    </div>
  );
}
