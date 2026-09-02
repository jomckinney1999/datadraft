"use client";

// One course's roadmap: DataCamp-style syllabus clarity on top,
// Duolingo-style winding lesson path per unit below.
// Which course is shown comes from the route (/learn/track/[moduleId]);
// the catalog grid at /learn is what links in here.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  COURSE,
  liveLessons,
  moduleUnits,
  getModule,
  type Lesson,
  type Unit,
} from "@/lib/curriculum";
import { useModule } from "@/lib/use-module";
import { loadProgress, displayStreak, type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import { getStyle } from "@/lib/playbook";
import { getTrack, normalizeTrackId } from "@/lib/draft";
import Coach from "@/components/coach";
import ThemeToggle from "@/components/theme-toggle";
import HomeLink from "@/components/home-link";

const NODE_OFFSETS = [0, 48, 0, -48];

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold" aria-hidden>
      <path
        d="M12 2c1 4-3 5.5-3 9a3 3 0 0 0 6 0c0-1.5-.8-2.6-.8-2.6S17 10 17 13a5 5 0 0 1-10 0c0-4.5 4-6.5 5-11z"
        fill="currentColor"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M5 13l5 5L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

export default function CourseRoadmap({ moduleId }: { moduleId: string }) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);

  const { setModule } = useModule();

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Opening a course makes it the active module, so the lesson player's
  // "next lesson" walks this course rather than the whole roadmap.
  useEffect(() => {
    setModule(moduleId);
  }, [moduleId, setModule]);

  const activeModule = getModule(moduleId);
  const visibleUnits = moduleUnits(moduleId);
  const all = liveLessons(moduleId);
  const completed = new Set(progress.completedLessons);
  const current =
    all.find((e) => !completed.has(e.lesson.id)) ?? all[all.length - 1];
  const completedCount = all.filter((e) => completed.has(e.lesson.id)).length;
  const pct = Math.round((completedCount / all.length) * 100);
  const yardLine = Math.min(100, pct);
  const streak = displayStreak(progress);

  function nodeState(lesson: Lesson): "completed" | "current" | "locked" {
    if (completed.has(lesson.id)) return "completed";
    if (current && lesson.id === current.lesson.id) return "current";
    return "locked";
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-24">
      {/* header */}
      <header className="flex items-center justify-between py-5">
        <HomeLink back="/learn" backLabel="all courses" />
        <div className="flex items-center gap-3">
          {progress.username && (
            <span className="hidden border border-gold/40 bg-gold/5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-gold md:inline">
              GM · {progress.username}
            </span>
          )}
          <ThemeToggle />
          <Link
            href="/field"
            className="hidden border border-panel-border bg-panel/70 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/40 hover:text-turf sm:inline"
          >
            Practice Field
          </Link>
          <span className="flex items-center gap-1.5 border border-panel-border bg-panel/70 px-3 py-1.5 font-mono text-xs text-gold">
            <FlameIcon />
            {streak} day{streak === 1 ? "" : "s"}
          </span>
          <span className="border border-panel-border bg-panel/70 px-3 py-1.5 font-mono text-xs text-turf">
            {progress.xp} XP
          </span>
        </div>
      </header>

      {/* course overview — the DataCamp layer */}
   <section className="surface border border-panel-border bg-panel/80 p-6 ">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-broadcast text-turf">
              {moduleId === "all" ? "course 1 · analyst roadmap" : "module"}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              {moduleId === "all" ? COURSE.title : activeModule.name}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
              {moduleId === "all" ? COURSE.tagline : activeModule.blurb}
            </p>
            <p className="mt-2 max-w-lg font-mono text-[11px] leading-relaxed text-ink-muted">
              No football knowledge required — the game is just the dataset,
              and Coach explains any context as you go.
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <Coach mood={pct === 100 ? "cheer" : "idle"} size={110} />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
              {completedCount}/{all.length} lessons ·{" "}
              {pct === 100 ? "END ZONE — course complete" : `ball on the ${yardLine}-yard line`}
            </p>
            <p className="stat-number text-sm">{pct}%</p>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-night">
            <div
              className="h-full rounded-full bg-gradient-to-r from-turf to-gold transition-all duration-700"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {visibleUnits
            .filter((u) => u.status === "live")
            .flatMap((u) => u.skills)
            .map((skill) => (
              <span
                key={skill}
                className="border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
              >
                {skill}
              </span>
            ))}
        </div>

        {!progress.username || !progress.draftedTrack ? (
          <Link
            href="/learn/draft"
            className="mt-6 block w-full border border-gold bg-gold/15 px-6 py-3 text-center font-mono text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold/25"
          >
            🏈 Enter the SQLSports Draft · claim pick 1.01
          </Link>
        ) : !progress.playbookStyle ? (
          <Link
            href="/learn/playbook"
            className="mt-6 block w-full border border-gold bg-gold/15 px-6 py-3 text-center font-mono text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold/25"
          >
            Take the quiz · Choose your playbook style
          </Link>
        ) : (
          current && (
            <Link
              href={`/learn/${current.lesson.id}`}
              className="mt-6 block w-full border border-turf bg-turf/15 px-6 py-3 text-center font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
            >
              {completedCount === 0
                ? "Start the season"
                : pct === 100
                  ? "Replay the last drive"
                  : `Continue · ${current.lesson.title}`}
            </Link>
          )
        )}

        {progress.username && progress.draftedTrack && (
          <p className="mt-3 text-center font-mono text-[11px] leading-relaxed text-ink-muted">
            Pick 1.01: <span className="text-gold">{progress.username}</span>{" "}
            drafted{" "}
            <span className="text-ink-soft">
              {getTrack(normalizeTrackId(progress.draftedTrack))?.name ??
                progress.draftedTrack}
            </span>
            {progress.playbookStyle && (
              <>
                {" "}
                · running the{" "}
                <span className="text-turf">
                  {getStyle(progress.playbookStyle).name}
                </span>{" "}
                playbook ·{" "}
                <Link
                  href="/learn/playbook"
                  className="underline decoration-panel-border underline-offset-4 transition-colors hover:text-gold"
                >
                  retake the quiz
                </Link>
              </>
            )}
          </p>
        )}
      </section>

      {/* the field — unit by unit, scoped to the selected module */}
      {visibleUnits.map((unit, i) => (
        <UnitSection
          key={unit.id}
          unit={unit}
          displayNumber={i + 1}
          nodeState={nodeState}
          completedCount={
            unit.lessons.filter((l) => completed.has(l.id)).length
          }
        />
      ))}

      <p className="mt-16 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Progress is saved in this browser · full accounts coming with the season launch
      </p>
    </main>
  );
}

function UnitSection({
  unit,
  displayNumber,
  nodeState,
  completedCount,
}: {
  unit: Unit;
  /** Position within the selected module, so non-contiguous unit ids still read 1,2,3. */
  displayNumber: number;
  nodeState: (lesson: Lesson) => "completed" | "current" | "locked";
  completedCount: number;
}) {
  const comingSoon = unit.status === "coming-soon";

  return (
    <section className={`mt-10 ${comingSoon ? "opacity-60" : ""}`}>
      {/* unit header band */}
      <div
        className={`border p-5 shadow-scoreboard ${
          comingSoon
            ? "border-panel-border bg-panel/40"
            : "border-panel-border bg-panel/80"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="label-broadcast text-gold">{unit.drive}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Unit {displayNumber} · {unit.title}
            </h2>
          </div>
          {comingSoon ? (
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              <LockIcon />
              In the playbook
            </span>
          ) : (
            <span className="font-mono text-xs text-ink-muted">
              {completedCount}/{unit.lessons.length}
            </span>
          )}
        </div>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-soft">
          {unit.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {unit.skills.map((skill) => (
            <span
              key={skill}
              className="border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* winding lesson path over faint yard lines */}
      {!comingSoon && (
        <div className="yard-lines relative mt-2 flex flex-col items-center gap-7 py-8">
          {unit.lessons.map((lesson, i) => {
            const state = nodeState(lesson);
            const offset = NODE_OFFSETS[i % NODE_OFFSETS.length];
            const node = (
              <div
                className="relative flex flex-col items-center"
                style={{ transform: `translateX(${offset}px)` }}
              >
                {state === "current" && (
                  <span className="absolute -top-9 animate-bounce border border-gold bg-night px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">
                    Start
                  </span>
                )}
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-transform ${
                    state === "completed"
                      ? "border-turf bg-turf/20 text-turf"
                      : state === "current"
                        ? "border-gold bg-gold/15 text-gold shadow-scoreboard-gold"
                        : "border-panel-border bg-panel text-ink-muted"
                  } ${state !== "locked" ? "hover:scale-105" : ""}`}
                >
                  {state === "completed" ? (
                    <CheckIcon />
                  ) : state === "current" ? (
                    <PlayIcon />
                  ) : (
                    <LockIcon />
                  )}
                </span>
                <span
                  className={`mt-2 max-w-[140px] text-center font-mono text-[11px] leading-tight ${
                    state === "locked" ? "text-ink-muted/60" : "text-ink-soft"
                  }`}
                >
                  {lesson.title}
                </span>
              </div>
            );

            return state === "locked" ? (
              <div key={lesson.id}>{node}</div>
            ) : (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.id}`}
                aria-label={`${lesson.title} — ${
                  state === "completed" ? "replay" : "start"
                }`}
              >
                {node}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
