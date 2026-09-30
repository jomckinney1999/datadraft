"use client";

/**
 * The question bank — a LeetCode list with a Question of the Day on top.
 *
 * The QOTD card is the whole retention argument in one component: the same
 * question for everyone, a streak that only advances by solving it, and a
 * reason to open the site on a Tuesday when you are not in the mood for a
 * lesson. It is picked from the NFL's timezone rather than the viewer's, so
 * two people in different countries can argue about the same problem.
 *
 * The list below it is deliberately plain — difficulty, title, tags, solved
 * tick. A card grid looks better and scans worse, and this is a page people
 * come back to dozens of times.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Question, QuestionDifficulty } from "@/lib/questions";
import { DIFFICULTY_XP, QUESTIONS } from "@/lib/questions";
import { EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import QuestionArt from "@/components/question-art";
import DifficultyChip from "@/components/difficulty-chip";
import AppNav from "@/components/app-nav";

type Filter = "all" | QuestionDifficulty | "unsolved";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unsolved", label: "Unsolved" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

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

export default function QuestionBank({
  qotd,
  day,
}: {
  qotd: Question;
  /** League-timezone day, resolved on the server. */
  day: string;
}) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  const solved = useMemo(
    () => new Set(progress.solvedQuestions),
    [progress.solvedQuestions],
  );
  const qotdDone = hydrated && progress.qotdLastDay === day;

  const shown = QUESTIONS.filter((q) => {
    if (filter === "unsolved" && solved.has(q.id)) return false;
    if (filter !== "all" && filter !== "unsolved" && q.difficulty !== filter) {
      return false;
    }
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      q.title.toLowerCase().includes(needle) ||
      q.tags.some((t) => t.toLowerCase().includes(needle)) ||
      q.prompt.toLowerCase().includes(needle)
    );
  });

  const byDifficulty = (d: QuestionDifficulty) =>
    QUESTIONS.filter((q) => q.difficulty === d);
  const solvedIn = (d: QuestionDifficulty) =>
    byDifficulty(d).filter((q) => solved.has(q.id)).length;

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <header className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Questions
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Real NFL scoring, 2022&ndash;2024. One problem at a time, no lesson
            around it, nothing to lose for a wrong answer.
          </p>
        </header>

        {/* ── Question of the Day ─────────────────────────── */}
        <section className="surface relative mt-6 overflow-hidden rounded-2xl border border-panel-border bg-panel">
          <div className="grid items-center gap-4 sm:grid-cols-5">
            <div className="order-2 p-5 sm:order-1 sm:col-span-3 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                  Question of the day
                </span>
                <DifficultyChip difficulty={qotd.difficulty} />
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
                {qotd.title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                {qotd.prompt}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link href={`/questions/${qotd.id}`} className="press btn-gold">
                  {qotdDone ? "Solve it again" : "Attempt now"}
                </Link>
                {hydrated && (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                    <FlameIcon lit={progress.qotdStreak > 0} />
                    {progress.qotdStreak} day
                    {progress.qotdStreak === 1 ? "" : "s"} running
                  </span>
                )}
                {qotdDone && (
                  <span className="font-mono text-[11px] uppercase tracking-wider text-turf">
                    ✓ Today&apos;s is done
                  </span>
                )}
              </div>
            </div>
            <div className="order-1 h-36 sm:order-2 sm:col-span-2 sm:h-44">
              <QuestionArt art={qotd.art} className="h-full w-full" />
            </div>
          </div>
        </section>

        {/* ── Progress by difficulty ──────────────────────── */}
        {hydrated && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(["easy", "medium", "hard"] as QuestionDifficulty[]).map((d) => {
              const total = byDifficulty(d).length;
              const done = solvedIn(d);
              return (
                <div
                  key={d}
                  className="surface rounded-xl border border-panel-border bg-panel px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <DifficultyChip difficulty={d} />
                    <span className="font-mono text-[11px] text-ink-muted">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="quest-bar mt-2">
                    <span
                      style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                filter === f.id
                  ? "border-turf bg-turf/15 text-turf"
                  : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
          <label className="ml-auto min-w-[10rem] flex-1 sm:max-w-xs">
            <span className="sr-only">Search questions</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a topic…"
              className="w-full rounded-lg border border-panel-border bg-night/60 px-3 py-2 font-mono text-[12px] text-ink placeholder:text-ink-muted"
            />
          </label>
        </div>

        {/* ── The list ────────────────────────────────────── */}
        <ul className="mt-3 space-y-2">
          {shown.map((q) => {
            const done = hydrated && solved.has(q.id);
            return (
              <li key={q.id}>
                <Link
                  href={`/questions/${q.id}`}
                  className="lift surface flex items-center gap-4 rounded-xl border border-panel-border bg-panel px-4 py-3 transition-colors hover:border-turf/40"
                >
                  <span className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg sm:block">
                    <QuestionArt art={q.art} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-ink">
                        {q.title}
                      </span>
                      {done && (
                        <span
                          className="font-mono text-[11px] text-turf"
                          title="Solved"
                        >
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
                      {q.tags.join(" · ")}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden font-mono text-[10px] uppercase tracking-widest text-ink-muted sm:inline">
                      +{DIFFICULTY_XP[q.difficulty]} XP
                    </span>
                    <DifficultyChip difficulty={q.difficulty} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {shown.length === 0 && (
          <p className="mt-6 text-center text-sm text-ink-muted">
            Nothing matches that. {filter === "unsolved" && "You've cleared this difficulty — try another."}
          </p>
        )}

        <p className="mt-8 text-center font-mono text-[11px] text-ink-muted">
          {QUESTIONS.length} questions and counting · new ones land with each
          data refresh
        </p>
      </main>
    </>
  );
}
