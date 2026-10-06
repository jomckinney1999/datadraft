"use client";

/**
 * The signed-in home. Answers four questions in order, once each:
 *
 *   1. Where am I?               → your locker: rank, up next, a few numbers
 *   2. What's on today?          → today's question and the Stat Duel
 *   3. What can I do here?       → the four ways to use DataDraft
 *   4. How am I doing?           → first steps or courses in progress, the
 *                                  Hall of Fame, and the league this week
 *
 * Deliberately not a wall of widgets (decided 2026-10-05). It had grown to
 * ten blocks with the same games shown twice, three doors to hiring prep, a
 * row of five links and a "coming soon" leaderboard of empty rows. Every
 * destination those offered is still one click away, through the use-case
 * cards or the nav menus; nothing on this page should say the same thing as
 * something else on it.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Coach from "@/components/coach";
import AppNav from "@/components/app-nav";
import TeamLogo from "@/components/team-logo";
import Headshot from "@/components/headshot";
import CourseArt from "@/components/course-art";
import { COURSES } from "@/lib/courses";
// The lesson index, not the curriculum (~560 KB): the dashboard lists
// lessons, it never plays one.
import { LESSON_INFO, LIVE_LESSONS } from "@/lib/lesson-index.generated";
import { displayStreak, EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import { BADGES, isEarned, nextEnshrinement, statsFrom } from "@/lib/achievements";
import { SHORT_CREDIT } from "@/lib/data-source";
import { weekCaveat, type LiveBoard, type LivePerformer, type LiveWeek } from "@/lib/live-nfl";
import type { Question } from "@/lib/questions";
import UseCases from "@/components/use-cases";
import { analystPath, currentStep, readPathInputs, type PathCatalog } from "@/lib/analyst-path";
import QotdCard from "@/components/qotd-card";
import DuelCard from "@/components/duel-card";
import { TourButton } from "@/components/welcome-tour";
import PlayerMark from "@/components/player-mark";
import { displayName, tenureFrom } from "@/lib/tenure";
import { useCountUp } from "@/lib/use-count-up";
import { playSfx } from "@/lib/sfx";

type CourseProgress = {
  id: string;
  moduleId: string;
  title: string;
  done: number;
  total: number;
  nextLessonId: string | null;
};


export default function Dashboard({
  live,
  qotd,
  day,
  questionCount,
  catalog,
}: {
  live: LiveWeek | null;
  qotd: Question;
  day: string;
  /** Counted on the server, so the bank isn't bundled to print one number. */
  questionCount: number;
  catalog: PathCatalog;
}) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [path, setPath] = useState<{ step: number; of: number; title: string } | "done" | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
    const steps = analystPath(readPathInputs(), catalog);
    const now = currentStep(steps);
    setPath(now ? { step: steps.indexOf(now) + 1, of: steps.length, title: now.title } : "done");
  }, [catalog]);

  const done = new Set(progress.completedLessons);
  const stats = statsFrom(progress);

  const courses: CourseProgress[] = COURSES.filter((c) => c.moduleId && c.status === "live")
    .map((c) => {
      const lessons = LIVE_LESSONS[c.moduleId!] ?? [];
      const doneCount = lessons.filter((id) => done.has(id)).length;
      const next = lessons.find((id) => !done.has(id));
      return {
        id: c.id,
        moduleId: c.moduleId!,
        title: c.title,
        done: doneCount,
        total: lessons.length,
        nextLessonId: next ?? null,
      };
    })
    .filter((c) => c.total > 0);

  const started = courses.filter((c) => c.done > 0 && c.done < c.total);
  const upNext = started.sort((a, b) => b.done - a.done)[0] ?? courses.find((c) => c.done === 0) ?? null;
  const upNextLesson = upNext?.nextLessonId ? LESSON_INFO[upNext.nextLessonId] : undefined;

  const earned = BADGES.filter((b) => isEarned(b, stats)).length;
  const nextBadge = nextEnshrinement(stats);

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
  const tenure = tenureFrom(progress);
  const callsign = displayName(progress);

  return (
    <>
      <AppNav />
      <main className="locker-stagger mx-auto min-h-screen w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6">
        <section
          className="locker-yard surface rounded-2xl border border-panel-border bg-panel p-5 sm:p-6"
          style={{ ["--i" as string]: 0 }}
        >
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="label-broadcast text-gold">your locker</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
                {fresh && hydrated
                  ? "Welcome to DataDraft"
                  : `Welcome back, ${callsign}`}
              </h1>
              <p className="mt-1.5 text-sm text-ink-soft">
                {hydrated ? (
                  <>
                    <span
                      className={
                        tenure.rank.tone === "gold"
                          ? "text-gold"
                          : tenure.rank.tone === "turf"
                            ? "text-turf"
                            : "text-ice"
                      }
                    >
                      Lv {tenure.level} · {tenure.rank.name}
                    </span>
                    {" · "}
                    {fresh
                      ? "Solve today's question, or take the first snap of a course."
                      : "Pick up today's question or the next lesson."}
                  </>
                ) : (
                  "Pick up today's question or the next lesson."
                )}
              </p>
              {hydrated && fresh && (
                <p className="mt-2 text-xs text-ink-muted">
                  New here? <TourButton className="font-semibold text-gold hover:underline" />
                </p>
              )}
            </div>
            <div className="hidden shrink-0 items-end gap-2 sm:flex">
              <Link href="/account#locker" aria-label="Your locker: edit your kit" className="rounded-xl transition-opacity hover:opacity-90">
              <PlayerMark
                jersey={progress.jersey}
                kitAccent={progress.kitAccent}
                rankTone={tenure.rank.tone}
                status={tenure.rank.name}
                favoriteTeam={progress.favoriteTeam}
                size={76}
              />
              </Link>
              <Coach mood={coachMood} size={64} />
            </div>
          </div>

          {hydrated && upNextLesson && upNext && (
            <div className="mt-5 flex gap-3 overflow-hidden rounded-xl border border-turf/40 bg-turf/5 p-3 sm:p-4">
              <span className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-night/50 sm:block">
                <CourseArt id={upNext.id} className="h-full w-full" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-turf">Up next · {upNext.title}</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">{upNextLesson.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{upNextLesson.blurb}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link href={`/learn/${upNext.nextLessonId}`} className="press btn-turf rounded-xl px-5 py-2.5 font-display text-sm font-bold text-night">
                    {stats.lessonsDone === 0 ? "Take the first snap" : "Continue"}
                  </Link>
                  <span className="font-mono text-[11px] text-ink-muted">
                    {upNext.done}/{upNext.total} lessons
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="relative mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-panel-border pt-3">
            <Stat label="XP" value={stats.xp} animate={hydrated} />
            <Stat label="Streak" value={progress.streak} animate={hydrated} />
            <Stat label="Lessons" value={stats.lessonsDone} animate={hydrated} />
            <Stat
              label="Badges"
              value={earned}
              href="/achievements"
              animate={hydrated}
              onNavigate={() => playSfx("ui")}
            />
          </div>
          {hydrated && tenure.next && (
            <div className="relative mt-3">
              <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                <span>Next: {tenure.next.name}</span>
                <span>{tenure.need} pts</span>
              </div>
              <div className="quest-bar mt-1">
                <span style={{ width: `${Math.round(tenure.progress * 100)}%` }} />
              </div>
            </div>
          )}
        </section>

        {/* ── Today ─────────────────────────────────────────── */}
        <section className="mt-6" style={{ ["--i" as string]: 1 }} aria-labelledby="today-title">
          <h2 id="today-title" className="font-display text-xl font-bold text-ink">
            Today
          </h2>
          <div className="mt-3 space-y-3">
            <QotdCard question={qotd} done={qotdDone} streak={progress.qotdStreak} hydrated={hydrated} variant="compact" />
            <DuelCard day={day} compact />
          </div>
        </section>

        {/* ── What you can do here ──────────────────────────── */}
        <div style={{ ["--i" as string]: 2 }}>
          <UseCases
            className="mt-8"
            questionCount={questionCount}
            qotdId={qotd.id}
            path={path}
            course={
              hydrated && upNext?.nextLessonId && stats.lessonsDone > 0
                ? { href: `/learn/${upNext.nextLessonId}`, label: `Continue ${upNext.title}` }
                : { href: "/learn/track/sql-fundamentals", label: "Start SQL Fundamentals" }
            }
          />
        </div>

        {/* ── How you're doing ──────────────────────────────── */}
        {hydrated && (
          <section
            className="surface mt-8 rounded-2xl border border-panel-border bg-panel p-5"
            style={{ ["--i" as string]: 3 }}
          >
            {fresh ? (
              <>
                <p className="label-broadcast text-ice">first steps</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {steps.map((s) => (
                    <li key={s.label} className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          s.done ? "border-turf bg-turf/20 text-turf" : "border-panel-border text-ink-muted"
                        }`}
                        aria-hidden
                      >
                        {s.done ? "✓" : ""}
                      </span>
                      <span className={`text-sm ${s.done ? "text-ink-muted line-through" : "text-ink-soft"}`}>{s.label}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : started.length > 0 ? (
              <>
                <p className="label-broadcast text-turf">in progress</p>
                <ul className="mt-3 space-y-3">
                  {started.slice(0, 3).map((c) => {
                    const pct = Math.round((c.done / c.total) * 100);
                    return (
                      <li key={c.id} className="flex items-center gap-3">
                        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-night/50">
                          <CourseArt id={c.id} className="h-full w-full" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <Link href={`/learn/track/${c.moduleId}`} className="font-display text-[15px] font-bold text-ink hover:text-turf">
                              {c.title}
                            </Link>
                            <span className="font-mono text-[11px] text-ink-muted">
                              {c.done}/{c.total}
                            </span>
                          </span>
                          <span className="quest-bar mt-1.5 block">
                            <span style={{ width: `${pct}%` }} />
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}

            <Link
              href="/achievements"
              onClick={() => playSfx("unlock")}
              className={`group flex items-center gap-3 ${fresh || started.length > 0 ? "mt-4 border-t border-panel-border pt-4" : ""}`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 font-display text-lg font-bold text-gold"
                aria-hidden
              >
                ★
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-bold text-ink group-hover:text-gold">
                  {earned === 0
                    ? "Hall of Fame: your trophy case is empty"
                    : earned === BADGES.length
                      ? "Hall of Fame: every trophy enshrined"
                      : `Hall of Fame: ${earned} of ${BADGES.length} enshrined`}
                </span>
                {nextBadge && <span className="block text-sm text-ink-soft">Next: {nextBadge.name}</span>}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-gold">Open →</span>
            </Link>
          </section>
        )}

        {live && (
          <section
            className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5"
            style={{ ["--i" as string]: 4 }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label-broadcast text-gold">
                <span className="live-dot mr-2 align-middle">Live</span>
                around the league · week {live.week}, {live.season}
                {live.progress?.partial ? " · in progress" : ""}
              </p>
              <Link href="/field" className="font-mono text-[10px] uppercase tracking-widest text-turf hover:underline">
                Query it →
              </Link>
            </div>

            {live.progress && weekCaveat(live) && (
              <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm leading-relaxed text-ink">
                {weekCaveat(live)}
              </p>
            )}

            {live.boards.length > 0 && <LeagueBoards boards={live.boards} partial={Boolean(live.progress?.partial)} />}

            {live.games.length > 0 && (
              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {live.games.slice(0, 6).map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-2 rounded-lg border border-panel-border px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5 font-mono text-[12px] text-ink">
                      <TeamLogo abbr={g.away} size={18} />
                      <span className="text-ink-muted">@</span>
                      <TeamLogo abbr={g.home} size={18} />
                    </span>
                    <span className="font-mono text-[12px] text-ink-soft">
                      {g.final ? `${g.awayScore}–${g.homeScore}` : `${g.day} ${g.kickoff}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 border-t border-panel-border pt-2 font-mono text-[10px] text-ink-muted">{SHORT_CREDIT}</p>
          </section>
        )}
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
    const id = window.setInterval(() => setIndex((n) => (n + 1) % boards.length), 4800);
    return () => window.clearInterval(id);
  }, [boards.length, paused]);

  const board = boards[index] ?? boards[0];
  if (!board) return null;

  return (
    <div className="mt-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex items-center justify-between gap-3">
        <p key={board.id} className="animate-ticker-in font-mono text-[10px] uppercase tracking-widest text-turf">
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
        {board.rows.slice(0, 5).map((p, i) => (
          <PerformerRow key={`${board.id}-${p.player}`} rank={i + 1} player={p} decimals={board.decimals} />
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
      <span className="w-4 shrink-0 font-mono text-[11px] text-ink-muted">{rank}</span>
      <Headshot name={player.player} src={player.headshot} />
      <span className="min-w-0 flex-1">
        <span className="font-display text-[15px] font-bold text-ink">{player.player}</span>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {player.position} · {player.team}
        </span>
      </span>
      <span className="stat-number shrink-0 text-sm">{player.value.toFixed(decimals)}</span>
    </li>
  );
}

function Stat({
  label,
  value,
  href,
  animate = false,
  onNavigate,
}: {
  label: string;
  value: number;
  href?: string;
  animate?: boolean;
  onNavigate?: () => void;
}) {
  const shown = useCountUp(animate ? value : 0, animate ? 700 : 0);
  const n = animate ? shown : value;
  const body = (
    <>
      <p className="font-display text-xl font-bold text-ink tabular-nums">{n}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">{label}</p>
    </>
  );
  if (!href) return <div>{body}</div>;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="rounded-lg transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      {body}
    </Link>
  );
}
