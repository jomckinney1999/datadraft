"use client";

/**
 * The signed-in home. Answers three questions in order:
 *
 *   1. What do I do right now?          → Up next, one button
 *   2. Where am I?                      → courses in progress / first steps
 *   3. Why is this place for me?        → this week in the league, live
 *
 * Deliberately not a wall of widgets. docs/UX-AUDIT.md measured the homepage
 * at 17 screens on a phone; a dashboard earns its place by being shorter than
 * the thing it replaces. The first-steps checklist and the in-progress list
 * are mutually exclusive — you get whichever one is true of you.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Coach from "@/components/coach";
import AppNav from "@/components/app-nav";
import TeamChip from "@/components/team-chip";
import TeamLogo from "@/components/team-logo";
import Headshot from "@/components/headshot";
import { COURSES } from "@/lib/courses";
import { liveLessons, getLesson } from "@/lib/curriculum";
import { displayStreak, EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import { BADGES, isEarned, statsFrom } from "@/lib/achievements";
import { SHORT_CREDIT } from "@/lib/data-source";
import { weekCaveat, type LiveBoard, type LivePerformer, type LiveWeek } from "@/lib/live-nfl";
import type { Question } from "@/lib/questions";
import { DIFFICULTY_XP } from "@/lib/questions";
import QotdCard from "@/components/qotd-card";
import DuelCard from "@/components/duel-card";
import DraftCard from "@/components/draft-card";
import { TourButton } from "@/components/welcome-tour";

type CourseProgress = {
  id: string;
  moduleId: string;
  title: string;
  done: number;
  total: number;
  nextLessonId: string | null;
};

const ACTIONS = [
  {
    href: "/questions",
    name: "Questions",
    blurb: "One problem at a time, on real NFL scoring. Nothing to lose.",
    cta: "Open the bank",
    accent: "gold" as const,
  },
  {
    href: "/learn",
    name: "Courses",
    blurb: "SQL, Python, Excel and more, one short lesson at a time.",
    cta: "Browse courses",
    accent: "turf" as const,
  },
  {
    href: "/projects",
    name: "Projects",
    blurb: "Your own league through the Sleeper API, or a dbt warehouse.",
    cta: "Pick a build",
    accent: "ice" as const,
  },
];

export default function Dashboard({
  live,
  qotd,
  day,
}: {
  live: LiveWeek | null;
  qotd: Question;
  /** League-timezone day, resolved on the server so it can't drift. */
  day: string;
}) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  const done = new Set(progress.completedLessons);
  const stats = statsFrom(progress);

  const courses: CourseProgress[] = COURSES.filter(
    (c) => c.moduleId && c.status === "live",
  )
    .map((c) => {
      const lessons = liveLessons(c.moduleId!);
      const doneCount = lessons.filter((l) => done.has(l.lesson.id)).length;
      const next = lessons.find((l) => !done.has(l.lesson.id));
      return {
        id: c.id,
        moduleId: c.moduleId!,
        title: c.title,
        done: doneCount,
        total: lessons.length,
        nextLessonId: next?.lesson.id ?? null,
      };
    })
    .filter((c) => c.total > 0);

  const started = courses.filter((c) => c.done > 0 && c.done < c.total);
  const upNext =
    started.sort((a, b) => b.done - a.done)[0] ??
    courses.find((c) => c.done === 0) ??
    null;
  const upNextLesson = upNext?.nextLessonId
    ? getLesson(upNext.nextLessonId)
    : undefined;

  const earned = BADGES.filter((b) => isEarned(b, stats)).length;

  const steps = [
    { label: "Solve the Question of the Day", done: progress.qotdLastDay !== "" },
    { label: "Finish your first lesson", done: stats.lessonsDone > 0 },
    { label: "Try the Practice Field", done: stats.lessonsDone > 2 },
    { label: "Earn your first badge", done: earned > 0 },
  ];
  const fresh = stats.lessonsDone === 0;
  const qotdDone = progress.qotdLastDay === day;
  const today = new Date().toISOString().slice(0, 10);
  const daysAway = progress.lastActiveDay
    ? Math.floor(
        (Date.parse(`${today}T00:00:00.000Z`) - Date.parse(`${progress.lastActiveDay}T00:00:00.000Z`)) /
          86_400_000,
      )
    : 0;
  const coachMood = fresh
    ? "whistle"
    : progress.lastActiveDay === today
      ? "happy"
      : displayStreak(progress) > 0
        ? "angry"
        : daysAway >= 3
          ? "sleep"
          : "idle";

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        {/* Welcome + the one thing to do next */}
        <section className="surface rounded-2xl border border-panel-border bg-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="label-broadcast text-gold">your locker</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
                {fresh && hydrated
                  ? "Welcome to DataDraft"
                  : progress.username
                    ? `Welcome back, ${progress.username}`
                    : "Welcome back"}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                Solve the day’s question, or pick up the next lesson.
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                New here?{" "}
                <TourButton className="font-semibold text-gold hover:underline" />
                {" · "}
                <Link href="/welcome" className="font-semibold text-ice hover:underline">
                  Map of the site
                </Link>
              </p>
            </div>
            <Coach
              mood={coachMood}
              size={72}
              className="hidden shrink-0 sm:block"
            />
          </div>

          {hydrated && upNextLesson && upNext && (
            <div className="mt-5 rounded-xl border border-turf/40 bg-turf/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-turf">
                Up next · {upNext.title}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-ink">
                {upNextLesson.lesson.title}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {upNextLesson.lesson.blurb}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={`/learn/${upNext.nextLessonId}`}
                  className="press btn-turf rounded-xl px-5 py-2.5 font-display text-sm font-bold text-night"
                >
                  {stats.lessonsDone === 0 ? "Take the first snap" : "Continue"}
                </Link>
                <span className="font-mono text-[11px] text-ink-muted">
                  {upNext.done}/{upNext.total} lessons done
                </span>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-4 border-t border-panel-border pt-4">
            <Stat label="XP" value={stats.xp} />
            <Stat label="Streak" value={progress.streak} />
            <Stat label="Lessons" value={stats.lessonsDone} />
            <Stat label="Badges" value={earned} />
          </div>
        </section>

        {/* The day's question — the reason to open this page on a Tuesday. */}
        <div className="mt-4">
          <QotdCard
            question={qotd}
            done={qotdDone}
            streak={progress.qotdStreak}
            hydrated={hydrated}
            variant="compact"
          />
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <DuelCard day={day} compact />
          <DraftCard compact />
        </div>

        {/* Three ways in */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="lift surface rounded-2xl border border-panel-border bg-panel p-4 transition-colors hover:border-turf/40"
            >
              <p
                className={`font-display text-lg font-bold ${
                  a.accent === "turf"
                    ? "text-turf"
                    : a.accent === "ice"
                      ? "text-ice"
                      : "text-gold"
                }`}
              >
                {a.name}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{a.blurb}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                {a.cta} →
              </p>
            </Link>
          ))}
        </div>

        {/* Either first steps, or what you've got going */}
        {hydrated && (fresh ? (
          <section className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5">
            <p className="label-broadcast text-ice">first steps</p>
            <ul className="mt-3 space-y-2">
              {steps.map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                      s.done
                        ? "border-turf bg-turf/20 text-turf"
                        : "border-panel-border text-ink-muted"
                    }`}
                    aria-hidden
                  >
                    {s.done ? "✓" : ""}
                  </span>
                  <span
                    className={`text-sm ${s.done ? "text-ink-muted line-through" : "text-ink-soft"}`}
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : started.length > 0 ? (
          <section className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5">
            <p className="label-broadcast text-turf">in progress</p>
            <ul className="mt-3 space-y-3">
              {started.slice(0, 3).map((c) => {
                const pct = Math.round((c.done / c.total) * 100);
                return (
                  <li key={c.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/learn/track/${c.moduleId}`}
                        className="font-display text-[15px] font-bold text-ink hover:text-turf"
                      >
                        {c.title}
                      </Link>
                      <span className="font-mono text-[11px] text-ink-muted">
                        {c.done}/{c.total}
                      </span>
                    </div>
                    <div className="quest-bar mt-1.5">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null)}

        {/* Live — the part that makes this a football data site */}
        {live && (
          <section className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label-broadcast text-gold">
                around the league · week {live.week}, {live.season}
                {live.progress?.partial ? " · in progress" : ""}
              </p>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                live from nflverse
              </span>
            </div>

            {/* On a Friday the week is Thursday night alone; say so. */}
            {live.progress && weekCaveat(live) && (
              <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm leading-relaxed text-ink">
                {weekCaveat(live)}
              </p>
            )}

            {live.boards.length > 0 && <LeagueBoards boards={live.boards} partial={Boolean(live.progress?.partial)} />}

            {live.games.length > 0 && (
              <>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ice">
                  Scores
                </p>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {live.games.slice(0, 8).map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-panel-border px-2.5 py-1.5"
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[12px] text-ink">
                        <TeamLogo abbr={g.away} size={20} />
                        <span className="text-ink-muted">@</span>
                        <TeamLogo abbr={g.home} size={20} />
                      </span>
                      <span className="font-mono text-[12px] text-ink-soft">
                        {g.final
                          ? `${g.awayScore}–${g.homeScore}`
                          : `${g.day} ${g.kickoff}`}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-panel-border pt-3">
              <Link
                href="/field"
                className="font-mono text-[11px] uppercase tracking-wider text-turf hover:underline"
              >
                Query this yourself on the Practice Field →
              </Link>
              <span className="font-mono text-[10px] text-ink-muted">
                {SHORT_CREDIT}
              </span>
            </div>
          </section>
        )}

        <p className="mt-6 text-center font-mono text-[11px] text-ink-muted">
          Progress saves in this browser.{" "}
          <Link href="/account" className="text-turf hover:underline">
            Account
          </Link>
        </p>
      </main>
    </>
  );
}

function LeagueBoards({ boards, partial }: { boards: LiveBoard[]; partial: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (boards.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setIndex((n) => (n + 1) % boards.length),
      4800,
    );
    return () => window.clearInterval(id);
  }, [boards.length, paused]);

  const board = boards[index] ?? boards[0];
  if (!board) return null;

  return (
    <div
      className="mt-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          key={board.id}
          className="animate-ticker-in font-mono text-[10px] uppercase tracking-widest text-turf"
        >
          {board.label}
          {partial ? " so far" : ""}
        </p>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Stat boards">
          {boards.map((b, i) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={b.label}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                i === index ? "bg-turf" : "bg-panel-border hover:bg-ink-muted"
              }`}
            />
          ))}
        </div>
      </div>
      <ul key={board.id} className="animate-ticker-in mt-2 space-y-2">
        {board.rows.map((p, i) => (
          <PerformerRow
            key={`${board.id}-${p.player}`}
            rank={i + 1}
            player={p}
            decimals={board.decimals}
          />
        ))}
      </ul>
    </div>
  );
}

function PerformerRow({
  rank,
  player,
  decimals,
}: {
  rank: number;
  player: LivePerformer;
  decimals: number;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-4 shrink-0 font-mono text-[11px] text-ink-muted">
        {rank}
      </span>
      <Headshot name={player.player} src={player.headshot} />
      <span className="min-w-0 flex-1">
        <span className="font-display text-[15px] font-bold text-ink">
          {player.player}
        </span>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {player.position} · {player.team} vs {player.opponent}
        </span>
        <span className="block text-[12px] leading-snug text-ink-muted">
          {player.line}
        </span>
      </span>
      <span className="stat-number shrink-0 text-sm">
        {player.value.toFixed(decimals)}
      </span>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-xl font-bold text-ink">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </p>
    </div>
  );
}
