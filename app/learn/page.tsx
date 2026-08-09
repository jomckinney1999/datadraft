"use client";

// The course roadmap: DataCamp-style syllabus clarity on top,
// Duolingo-style winding lesson path per unit below.

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSE, liveLessons, type Lesson, type Unit } from "@/lib/curriculum";
import { loadProgress, displayStreak, type Progress } from "@/lib/progress";
import Coach from "@/components/coach";

const NODE_OFFSETS = [0, 48, 0, -48];

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M12 2c1 4-3 5.5-3 9a3 3 0 0 0 6 0c0-1.5-.8-2.6-.8-2.6S17 10 17 13a5 5 0 0 1-10 0c0-4.5 4-6.5 5-11z"
        fill="#E8A33D"
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

export default function LearnPage() {
  const [progress, setProgress] = useState<Progress>({
    xp: 0,
    completedLessons: [],
    streak: 0,
    lastActiveDay: "",
  });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const all = liveLessons();
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
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          SQL<span className="text-teal">Sports</span>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            learn
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 border border-panel-border bg-panel/70 px-3 py-1.5 font-mono text-xs text-amber">
            <FlameIcon />
            {streak} day{streak === 1 ? "" : "s"}
          </span>
          <span className="border border-panel-border bg-panel/70 px-3 py-1.5 font-mono text-xs text-teal">
            {progress.xp} XP
          </span>
        </div>
      </header>

      {/* course overview — the DataCamp layer */}
      <section className="border border-panel-border bg-panel/80 p-6 shadow-scoreboard">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-broadcast text-teal">course 1 · sql roadmap</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              {COURSE.title}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
              {COURSE.tagline}
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
              className="h-full rounded-full bg-gradient-to-r from-teal to-amber transition-all duration-700"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {COURSE.units
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

        {current && (
          <Link
            href={`/learn/${current.lesson.id}`}
            className="mt-6 block w-full border border-teal bg-teal/15 px-6 py-3 text-center font-mono text-sm font-semibold uppercase tracking-widest text-teal transition-colors hover:bg-teal/25"
          >
            {completedCount === 0
              ? "Start the season"
              : pct === 100
                ? "Replay the last drive"
                : `Continue · ${current.lesson.title}`}
          </Link>
        )}
      </section>

      {/* the field — unit by unit */}
      {COURSE.units.map((unit) => (
        <UnitSection
          key={unit.id}
          unit={unit}
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
  nodeState,
  completedCount,
}: {
  unit: Unit;
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
            <p className="label-broadcast text-amber">{unit.drive}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Unit {unit.number} · {unit.title}
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
        <div
          className="relative mt-2 flex flex-col items-center gap-7 py-8"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0px, transparent 55px, rgba(79,209,197,0.06) 55px, rgba(79,209,197,0.06) 57px)",
          }}
        >
          {unit.lessons.map((lesson, i) => {
            const state = nodeState(lesson);
            const offset = NODE_OFFSETS[i % NODE_OFFSETS.length];
            const node = (
              <div
                className="relative flex flex-col items-center"
                style={{ transform: `translateX(${offset}px)` }}
              >
                {state === "current" && (
                  <span className="absolute -top-9 animate-bounce border border-amber bg-night px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-amber">
                    Start
                  </span>
                )}
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-transform ${
                    state === "completed"
                      ? "border-teal bg-teal/20 text-teal"
                      : state === "current"
                        ? "border-amber bg-amber/15 text-amber shadow-scoreboard-amber"
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
