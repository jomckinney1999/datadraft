"use client";

/**
 * The signed-in home. Answers three questions in order:
 *
 *   1. What do I do right now?          → Up next / today's question
 *   2. Where am I?                      → courses in progress / first steps
 *   3. Why is this place for me?        → this week in the league, live
 *
 * Deliberately not a wall of widgets. docs/UX-AUDIT.md measured the homepage
 * at 17 screens on a phone; a dashboard earns its place by being shorter than
 * the thing it replaces.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Coach from "@/components/coach";
import AppNav from "@/components/app-nav";
import TeamLogo from "@/components/team-logo";
import Headshot from "@/components/headshot";
import CourseArt from "@/components/course-art";
import ProjectArt from "@/components/project-art";
import QuestionArt from "@/components/question-art";
import PrepArt from "@/components/prep-art";
import { COURSES } from "@/lib/courses";
import { liveLessons, getLesson } from "@/lib/curriculum";
import { displayStreak, EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import { BADGES, isEarned, nextEnshrinement, statsFrom } from "@/lib/achievements";
import { SHORT_CREDIT } from "@/lib/data-source";
import { weekCaveat, type LiveBoard, type LivePerformer, type LiveWeek } from "@/lib/live-nfl";
import type { Question } from "@/lib/questions";
import QotdCard from "@/components/qotd-card";
import DuelCard from "@/components/duel-card";
import DraftCard from "@/components/draft-card";
import { TourButton } from "@/components/welcome-tour";
import PlayStrip from "@/components/play-strip";
import LeaderboardTeaser from "@/components/leaderboard-teaser";
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

const ACTIONS = [
  {
    href: "/questions",
    name: "Questions",
    blurb: "Today's problem on real NFL scoring.",
    cta: "Open the bank",
    accent: "gold" as const,
    art: <QuestionArt art="chalkboard" className="h-full w-full" />,
  },
  {
    href: "/learn",
    name: "Courses",
    blurb: "SQL, Python, Excel — short lessons.",
    cta: "Browse courses",
    accent: "turf" as const,
    art: <CourseArt id="sql-fundamentals" className="h-full w-full" />,
  },
  {
    href: "/projects",
    name: "Projects",
    blurb: "Your league, a warehouse, a model.",
    cta: "Pick a build",
    accent: "ice" as const,
    art: <ProjectArt id="my-league-scorecard" className="h-full w-full" />,
  },
];

export default function Dashboard({
  live,
  qotd,
  day,
}: {
  live: LiveWeek | null;
  qotd: Question;
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

  const courses: CourseProgress[] = COURSES.filter((c) => c.moduleId && c.status === "live")
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
  const upNext = started.sort((a, b) => b.done - a.done)[0] ?? courses.find((c) => c.done === 0) ?? null;
  const upNextLesson = upNext?.nextLessonId ? getLesson(upNext.nextLessonId) : undefined;

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
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
                <TourButton className="font-semibold text-gold hover:underline" />
                <Link href="/account#locker" className="font-semibold text-gold hover:underline">
                  Edit your kit
                </Link>
                <Link href="/welcome" className="font-semibold text-ice hover:underline">
                  Map of the site
                </Link>
                <Link href="/questions/prep" className="font-semibold text-turf hover:underline">
                  Hiring prep
                </Link>
                <Link href="/pricing" className="font-semibold text-gold hover:underline">
                  Season Pass
                </Link>
              </p>
            </div>
            <div className="hidden shrink-0 items-end gap-2 sm:flex">
              <PlayerMark
                jersey={progress.jersey}
                kitTone={progress.kitTone}
                kitAccent={progress.kitAccent}
                rankTone={tenure.rank.tone}
                status={tenure.rank.name}
                size={76}
              />
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
                <p className="mt-1 font-display text-lg font-bold text-ink">{upNextLesson.lesson.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{upNextLesson.lesson.blurb}</p>
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
            <Stat label="Level" value={tenure.level} animate={hydrated} />
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

        <div className="mt-4" style={{ ["--i" as string]: 1 }}>
          <QotdCard question={qotd} done={qotdDone} streak={progress.qotdStreak} hydrated={hydrated} variant="compact" />
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2" style={{ ["--i" as string]: 2 }}>
          <DuelCard day={day} compact />
          <DraftCard compact />
        </div>

        <div className="mt-4" style={{ ["--i" as string]: 3 }}>
          <PlayStrip title="play · prep" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3" style={{ ["--i" as string]: 4 }}>
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={() => playSfx("ui")}
              data-tone={a.accent}
              className="pop-tile surface group overflow-hidden rounded-2xl border border-panel-border bg-panel"
            >
              <span className="block h-28 border-b border-panel-border bg-night/50">{a.art}</span>
              <span className="block p-4">
                <p
                  className={`font-display text-lg font-bold ${
                    a.accent === "turf" ? "text-turf" : a.accent === "ice" ? "text-ice" : "text-gold"
                  }`}
                >
                  {a.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{a.blurb}</p>
                <p
                  className={`mt-2 font-mono text-[11px] uppercase tracking-wider ${
                    a.accent === "turf" ? "text-turf" : a.accent === "ice" ? "text-ice" : "text-gold"
                  }`}
                >
                  {a.cta} →
                </p>
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/questions/prep"
          onClick={() => playSfx("ui")}
          style={{ ["--i" as string]: 5 }}
          className="lift surface mt-3 flex items-center gap-3 overflow-hidden rounded-2xl border border-gold/40 bg-panel p-3 pr-4 transition-colors hover:border-gold/70"
        >
          <span className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-night/50">
            <PrepArt id="online" className="h-full w-full" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="label-broadcast text-gold">hiring prep · ★ pass path</span>
            <span className="mt-0.5 block font-display text-base font-bold text-ink">
              Patterns → OA → SQL screen → take-home
            </span>
          </span>
          <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-gold">Open →</span>
        </Link>

        <div className="mt-4" style={{ ["--i" as string]: 5 }}>
          <LeaderboardTeaser progress={progress} />
        </div>

        <Link
          href="/achievements"
          onClick={() => playSfx("unlock")}
          style={{ ["--i" as string]: 5 }}
          className="lift surface mt-3 flex items-center gap-3 overflow-hidden rounded-2xl border border-panel-border bg-panel p-3 pr-4 transition-colors hover:border-gold/50"
        >
          <span
            className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 font-display text-2xl font-bold text-gold"
            aria-hidden
          >
            ★
          </span>
          <span className="min-w-0 flex-1">
            <span className="label-broadcast text-gold">hall of fame</span>
            <span className="mt-0.5 block font-display text-base font-bold text-ink">
              {hydrated
                ? earned === 0
                  ? "Your trophy case is empty"
                  : earned === BADGES.length
                    ? "Every trophy enshrined"
                    : `${earned} of ${BADGES.length} enshrined`
                : "Trophies you've earned"}
            </span>
            {hydrated && nextBadge && (
              <span className="mt-0.5 block text-sm text-ink-soft">
                Next: {nextBadge.name}
              </span>
            )}
          </span>
          <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-gold">
            Open →
          </span>
        </Link>

        {hydrated &&
          (fresh ? (
            <section
              className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5"
              style={{ ["--i" as string]: 6 }}
            >
              <p className="label-broadcast text-ice">first steps</p>
              <ul className="mt-3 space-y-2">
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
            </section>
          ) : started.length > 0 ? (
            <section
              className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5"
              style={{ ["--i" as string]: 6 }}
            >
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
            </section>
          ) : null)}

        {live && (
          <section
            className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5"
            style={{ ["--i" as string]: 7 }}
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
