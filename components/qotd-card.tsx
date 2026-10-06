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

import Link from "next/link";
import type { Question } from "@/lib/questions";
import { DIFFICULTY_XP, LANG_LABEL } from "@/lib/question-meta";
import { featuredPlayers, type FeaturedPlayer } from "@/lib/question-players";
import { teamAccent } from "@/lib/team-colors";
import Headshot from "@/components/headshot";
import QuestionArt from "@/components/question-art";
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

/**
 * Two or three headshots, overlapping, each haloed in its team's colour.
 * The first is largest; the rest step down and tuck behind it. Names sit
 * underneath so nobody has to guess who they are looking at.
 */
export function FaceCluster({
  players,
  size = 88,
  names = true,
  className = "",
}: {
  players: FeaturedPlayer[];
  /** Diameter of the lead face in px; the others scale from it. */
  size?: number;
  names?: boolean;
  className?: string;
}) {
  if (players.length === 0) return null;
  const sizes = [size, Math.round(size * 0.82), Math.round(size * 0.7)];
  const overlap = Math.round(size * 0.28);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex items-end">
        {players.map((p, i) => (
          <span
            key={p.name}
            className="face-ring face-float relative"
            style={{
              ["--ring" as string]: teamAccent(p.team),
              marginLeft: i === 0 ? 0 : -overlap,
              zIndex: players.length - i,
              animationDelay: `${i * 0.9}s`,
            }}
          >
            <Headshot name={p.name} src={p.url} size={sizes[i] ?? sizes[2]} />
          </span>
        ))}
      </div>
      {names && (
        // Each name stays on one line with its team, and the players sit
        // apart: with only a space between them, "MIA A.J. BROWN" read as
        // one name.
        <p className="flex max-w-[18rem] flex-wrap justify-center gap-x-3 gap-y-0.5 text-center font-mono text-[10px] uppercase leading-relaxed tracking-wider text-ink-muted">
          {players.map((p) => (
            <span key={p.name} className="whitespace-nowrap">
              <span className="text-ink-soft">{p.name}</span>
              <span className="text-ink-muted"> · {p.team}</span>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

export default function QotdCard({
  question,
  done = false,
  streak = 0,
  hydrated = false,
  variant = "hero",
}: {
  question: Question;
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
            <Link href={href} className="press btn-gold mt-2 inline-flex">
              {done ? "Replay" : `Solve · +${xp} XP`}
            </Link>
          </div>
        </div>
        <Link
          href={href}
          className="relative block border-t border-gold/20 px-4 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-gold sm:hidden"
        >
          {done ? "Replay today's question" : "Solve today's question →"}
        </Link>
      </section>
    );
  }

  return (
    <section className="qotd-hero overflow-hidden rounded-3xl">
      <QuestionArt art={question.art} className="qotd-hero-art" />
      <div className="qotd-sheen" aria-hidden />

      <div className="relative grid items-center gap-8 p-6 sm:grid-cols-5 sm:p-9">
        <div className="order-2 min-w-0 sm:order-1 sm:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/60 bg-gold/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold shadow-[0_0_24px_-6px_rgb(var(--c-gold)/0.8)]">
              {LANG_LABEL[question.lang]} question of the day
            </span>
            <DifficultyChip difficulty={question.difficulty} />
            {hydrated && !done && <span className="live-dot">Live</span>}
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
            <Link href={href} className="press btn-gold text-sm">
              {done ? "Solve it again →" : "Attempt now →"}
            </Link>
            {hydrated && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                <FlameIcon lit={streak > 0} />
                {streak} day{streak === 1 ? "" : "s"} running
              </span>
            )}
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
