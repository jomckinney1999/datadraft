/**
 * The Question of the Day, as a headline rather than a card.
 *
 * Gold-lit panel, the question's art blown up behind it as light, and the
 * players the question is about as ringed headshots — a running-back
 * question shows running backs, "Rolling Form" shows Lamar Jackson. The
 * faces come from `featuredPlayers`, which is deterministic on purpose: a
 * card that reshuffles itself on re-render flickers while you read it.
 *
 * No hooks in here, so it renders from server and client parents alike.
 * `Headshot` is a client component (it needs onError for the fallback) and
 * receives only plain props, which is fine across that boundary.
 *
 * Two variants. `hero` is the full treatment for /questions and the landing
 * page. `compact` is one row for the dashboard, where the card has to share
 * the screen with "Up next" and must not win that argument.
 */

import TransitionLink from "@/components/transition-link";
import { FaceCluster } from "@/components/face-cluster";
import type { Question } from "@/lib/questions";
import { DIFFICULTY_XP, LANG_LABEL } from "@/lib/question-meta";
import { featuredPlayers } from "@/lib/question-players";
import type { ReactNode } from "react";
import DifficultyChip from "@/components/difficulty-chip";
import DailyCountdown from "@/components/daily-countdown";

function FlameIcon({ lit }: { lit: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${lit ? "text-gold" : "text-ink-muted"}`}
      aria-hidden
    >
      <path
        d="M12 2c1 4-3 5.5-3 9a3 3 0 0 0 6 0c0-1.5-.8-2.6-.8-2.6S17 10 17 13a5 5 0 0 1-10 0c0-4.5 4-6.5 5-11z"
        fill="currentColor"
      />
    </svg>
  );
}

// FaceCluster lives in its own file so the question workspace can use it
// without this card's drawing kit (2026-10-06); re-exported for old imports.
export { FaceCluster };

export default function QotdCard({
  question,
  done = false,
  streak = 0,
  hydrated = false,
  variant = "hero",
  art = null,
}: {
  question: Question;
  /** The hero's drawing, rendered by the caller: importing the drawing kit
   * here put every scene on the dashboard, which shows the compact card
   * with no drawing at all (2026-10-06). */
  art?: ReactNode;
  done?: boolean;
  streak?: number;
  /** Progress has loaded — until then the streak and tick are withheld. */
  hydrated?: boolean;
  variant?: "hero" | "compact";
}) {
  const players = featuredPlayers(question, variant === "hero" ? 3 : 2);
  const href = `/questions/${question.id}`;
  const xp = DIFFICULTY_XP[question.difficulty];

  if (variant === "compact") {
    return (
      <section className="qotd-hero overflow-hidden rounded-2xl">
        <div className="qotd-sheen" aria-hidden />
        <div className="relative flex items-center gap-4 p-4 sm:p-5">
          <FaceCluster players={players} size={52} names={false} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                Question of the day
              </span>
              <DifficultyChip difficulty={question.difficulty} />
              {hydrated && !done && <span className="live-dot">Live</span>}
              {hydrated && done && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-turf">
                  ✓ Done
                </span>
              )}
            </div>
            <p className="mt-1 font-display text-lg font-bold text-ink">
              {question.title}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
              {question.prompt}
            </p>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            {hydrated && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                {streak} day{streak === 1 ? "" : "s"} running
              </p>
            )}
            <DailyCountdown className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-ink-muted" />
            <TransitionLink href={href} transition="snap" label="Today's question" className="press btn-gold mt-2 inline-flex">
              {done ? "Replay" : `Solve · +${xp} XP`}
            </TransitionLink>
          </div>
        </div>
        <TransitionLink
          href={href}
          transition="snap"
          label="Today's question"
          className="relative block border-t border-gold/20 px-4 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-gold sm:hidden"
        >
          {done ? "Replay today's question" : "Solve today's question →"}
        </TransitionLink>
      </section>
    );
  }

  return (
    <section className="qotd-hero overflow-hidden rounded-3xl">
      {art}
      <div className="qotd-sheen" aria-hidden />

      <div className="relative grid items-center gap-8 p-6 sm:grid-cols-5 sm:p-9">
        <div className="order-2 min-w-0 sm:order-1 sm:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/60 bg-gold/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold shadow-[0_0_24px_-6px_rgb(var(--c-gold)/0.8)]">
              {LANG_LABEL[question.lang]} question of the day
            </span>
            <DifficultyChip difficulty={question.difficulty} />
            {/* Rendered from the start and hidden until progress loads, so
                its space is held: appearing after hydration it wrapped this
                row on a phone and pushed the card down (2026-10-06). */}
            {!done && <span className={`live-dot ${hydrated ? "" : "invisible"}`}>Live</span>}
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              +{xp} XP
            </span>
          </div>

          <h2 className="mt-4 font-display text-3xl font-bold leading-[1.05] text-pop sm:text-5xl">
            {question.title}
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            {question.prompt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <TransitionLink href={href} transition="snap" label="Today's question" className="press btn-gold text-sm">
              {done ? "Solve it again →" : "Attempt now →"}
            </TransitionLink>
            <span
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted ${hydrated ? "" : "invisible"}`}
            >
              <FlameIcon lit={streak > 0} />
              {streak} day{streak === 1 ? "" : "s"} running
            </span>
            <DailyCountdown className="font-mono text-[11px] uppercase tracking-wider text-ink-muted" />
            {hydrated && done && (
              <span className="font-mono text-[11px] uppercase tracking-wider text-turf">
                ✓ Today&apos;s is done
              </span>
            )}
          </div>
        </div>

        <div className="order-1 flex min-w-0 justify-center sm:order-2 sm:col-span-2">
          <FaceCluster players={players} size={96} />
        </div>
      </div>
    </section>
  );
}
