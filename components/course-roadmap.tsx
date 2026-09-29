"use client";

// One course's roadmap: Duo-style unit banners + winding lesson path,
// with a right-hand gamification rail on desktop.
// Route: /learn/track/[moduleId]

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
import { type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import { loadEconomy } from "@/lib/economy";
import { getTrack, normalizeTrackId } from "@/lib/draft";
import { introFor } from "@/lib/course-intros";
import { COURSES } from "@/lib/courses";
import Coach from "@/components/coach";
import CourseIntro from "@/components/course-intro";
import PathCast from "@/components/path-cast";
import HomeLink from "@/components/home-link";
import LearnRail from "@/components/learn-rail";
import LearnStatusChips from "@/components/learn-status-chips";
import TestingTools from "@/components/testing-tools";

const NODE_OFFSETS = [0, 56, 0, -56, 28, -28];

function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path
        d="M5 13l5 5L19 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <ellipse cx="12" cy="12" rx="7" ry="9" fill="#a5672f" />
      <ellipse cx="10.5" cy="10" rx="4.5" ry="6" fill="#b3743a" opacity="0.5" />
      <path
        d="M12 5.5v4M9.5 8h5M9.5 10.5h5M9.5 13h5"
        stroke="#f4ede2"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CourseRoadmap({ moduleId }: { moduleId: string }) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const { setModule } = useModule();

  useEffect(() => {
    setProgress(loadEconomy());
  }, []);

  useEffect(() => {
    setModule(moduleId);
  }, [moduleId, setModule]);

  const activeModule = getModule(moduleId);
  const visibleUnits = moduleUnits(moduleId);
  const liveUnits = visibleUnits.filter((u) => u.status === "live");
  const all = liveLessons(moduleId);
  const completed = new Set(progress.completedLessons);
  const current =
    all.find((e) => !completed.has(e.lesson.id)) ?? all[all.length - 1];
  const completedCount = all.filter((e) => completed.has(e.lesson.id)).length;
  const pct =
    all.length === 0 ? 0 : Math.round((completedCount / all.length) * 100);

  function nodeState(lesson: Lesson): "completed" | "current" | "locked" {
    if (completed.has(lesson.id)) return "completed";
    if (current && lesson.id === current.lesson.id) return "current";
    return "locked";
  }

  /** Unit is unlocked when every prior live unit is complete (unit 1 always open). */
  function unitUnlocked(liveIndex: number): boolean {
    if (liveIndex <= 0) return true;
    for (let i = 0; i < liveIndex; i++) {
      const u = liveUnits[i];
      if (!u.lessons.every((l) => completed.has(l.id))) return false;
    }
    return true;
  }

  const activeUnitId =
    current?.unit.id ??
    liveUnits.find((u) => !u.lessons.every((l) => completed.has(l.id)))?.id ??
    liveUnits[0]?.id;

  const gateHref = current ? `/learn/${current.lesson.id}` : null;

  const courseIntro = introFor(moduleId);
  const courseHours = COURSES.find((c) => c.moduleId === moduleId)?.hours;

  const yardLine = Math.min(100, pct);
  const fieldCaption =
    pct === 100
      ? "END ZONE — course complete"
      : completedCount === 0
        ? "Kickoff · ball on own 25"
        : `Ball on the ${yardLine}-yard line`;

  const gateLabel =
    completedCount === 0
      ? "Take the first snap"
      : pct === 100
        ? "Replay last drive"
        : "Run the next play";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <HomeLink back="/learn" backLabel="all courses" />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {progress.username && (
            <span className="hidden border border-gold/40 bg-gold/5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-gold lg:inline">
              GM · {progress.username}
            </span>
          )}
          <LearnStatusChips progress={progress} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          {/* Slim course header */}
          <section className="section-card scorebug-card">
            <p className="label-broadcast text-turf">
              {moduleId === "all" ? "season roadmap" : "game plan"}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              {moduleId === "all" ? COURSE.title : activeModule.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              {moduleId === "all" ? COURSE.tagline : activeModule.blurb}
            </p>
            {moduleId === "excel" && (
              <p className="mt-3">
                <Link
                  href="/excel"
                  className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ice hover:underline"
                >
                  Open the live Spreadsheet →
                </Link>
              </p>
            )}

            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                  {completedCount}/{all.length} drives · {fieldCaption}
                </p>
                <p className="stat-number text-sm">{pct}%</p>
              </div>
              <div className="field-progress mt-2 flex items-center gap-2">
                <div className="field-progress-track">
                  <div
                    className="field-progress-fill"
                    style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
                  />
                  <span
                    className="field-progress-stick"
                    style={{ left: `${Math.min(Math.max(pct, 8), 96)}%` }}
                    aria-hidden
                  />
                </div>
                <span className="text-lg" aria-hidden>
                  {pct === 100 ? "🏈" : "🏁"}
                </span>
              </div>
            </div>

            {gateHref && (
              <Link
                href={gateHref}
                className="btn-turf mt-5 flex w-full items-center justify-center rounded-2xl border border-turf/80 px-6 py-3.5 font-display text-base font-bold uppercase tracking-wide text-night"
              >
                {gateLabel}
              </Link>
            )}

            {progress.username && progress.draftedTrack && (
              <p className="mt-3 text-center font-mono text-[11px] leading-relaxed text-ink-muted">
                <span className="text-gold">{progress.username}</span>
                {" · "}
                <span className="text-ink-soft">
                  {getTrack(normalizeTrackId(progress.draftedTrack))?.name ??
                    progress.draftedTrack}
                </span>
              </p>
            )}
          </section>

          {/* Coach's brief — open before the first lesson, a one-line toggle
              after. New learners get the orientation; returning ones don't
              get a wall of text they've already read. */}
          {courseIntro && (
            <CourseIntro
              intro={courseIntro}
              courseTitle={moduleId === "all" ? COURSE.title : activeModule.name}
              hours={courseHours}
              started={completedCount > 0}
            />
          )}

          {/* Units */}
          {visibleUnits.map((unit) => {
            const liveIndex = liveUnits.findIndex((u) => u.id === unit.id);
            const displayNumber =
              liveIndex >= 0
                ? liveIndex + 1
                : visibleUnits.findIndex((u) => u.id === unit.id) + 1;
            const doneCount = unit.lessons.filter((l) =>
              completed.has(l.id),
            ).length;
            const unlocked =
              unit.status !== "live" ? false : unitUnlocked(liveIndex);
            const isActive = unit.id === activeUnitId && unlocked;

            return (
              <UnitBlock
                key={unit.id}
                unit={unit}
                displayNumber={displayNumber}
                completedCount={doneCount}
                unlocked={unlocked}
                isActive={isActive}
                nodeState={nodeState}
                continueHref={
                  isActive && current
                    ? `/learn/${current.lesson.id}`
                    : gateHref && isActive
                      ? gateHref
                      : null
                }
                continueLabel={gateLabel}
              />
            );
          })}

          <p className="mt-16 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Progress is saved in this browser · full accounts coming with the
            season launch
          </p>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            <LearnRail progress={progress} onProgress={setProgress} />
            <TestingTools moduleId={moduleId} onChange={setProgress} />
          </div>
        </div>
      </div>
    </main>
  );
}

function UnitBlock({
  unit,
  displayNumber,
  completedCount,
  unlocked,
  isActive,
  nodeState,
  continueHref,
  continueLabel,
}: {
  unit: Unit;
  displayNumber: number;
  completedCount: number;
  unlocked: boolean;
  isActive: boolean;
  nodeState: (lesson: Lesson) => "completed" | "current" | "locked";
  continueHref: string | null;
  continueLabel: string;
}) {
  const comingSoon = unit.status === "coming-soon";
  const total = unit.lessons.length;
  const unitPct =
    total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const unitComplete = !comingSoon && completedCount === total && total > 0;
  const locked = comingSoon || !unlocked;

  return (
    <section className={`mt-8 ${locked && !comingSoon ? "opacity-90" : ""}`}>
      {isActive && !locked ? (
        <div className="unit-banner">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-night/70">
                {unit.drive} · Unit {displayNumber}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-night sm:text-2xl">
                {unit.title}
              </h2>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`section-card ${locked ? "section-card-locked" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label-broadcast text-gold">
                {comingSoon ? "coming soon" : unit.drive}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-ink">
                Unit {displayNumber} · {unit.title}
              </h2>
            </div>
            {locked && <LockIcon className="h-6 w-6 text-ink-muted" />}
          </div>

          {!comingSoon && (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-night">
                <div
                  className="h-full rounded-full bg-turf transition-all duration-500"
                  style={{ width: `${unitPct}%` }}
                />
              </div>
              <span
                className={`text-base ${unitComplete ? "" : "opacity-40 grayscale"}`}
                aria-hidden
              >
                {unitComplete ? "🏈" : "🏁"}
              </span>
            </div>
          )}

          {locked && !comingSoon && (
            <p className="mt-3 font-mono text-[11px] text-ink-muted">
              Move the chains on Unit {displayNumber - 1} to unlock
            </p>
          )}
          {comingSoon && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              Still in the playbook
            </p>
          )}
        </div>
      )}

      {/* Unlocked units: Coach speech on active + winding path for replay */}
      {!locked && (
        <>
          {isActive && (
            <div className="section-card mt-3">
              <div className="flex items-start gap-3">
                <Coach mood="idle" size={88} className="hidden shrink-0 sm:block" />
                <div className="min-w-0 flex-1">
                  {unit.skills[0] && (
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      Coach&apos;s note · {unit.skills[0]}
                    </p>
                  )}
                  <div className="speech-bubble speech-bubble-coach">
                    {unit.description}
                  </div>
                  {continueHref && (
                    <Link
                      href={continueHref}
                      className="btn-turf mt-4 flex w-full items-center justify-center rounded-2xl border border-turf/80 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-night sm:w-auto"
                    >
                      {continueLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <LessonPath
            unit={unit}
            nodeState={nodeState}
            completedCount={completedCount}
            unitComplete={unitComplete}
          />
        </>
      )}
    </section>
  );
}

function LessonPath({
  unit,
  nodeState,
  completedCount,
  unitComplete,
}: {
  unit: Unit;
  nodeState: (lesson: Lesson) => "completed" | "current" | "locked";
  completedCount: number;
  unitComplete: boolean;
}) {
  const mid = Math.floor(unit.lessons.length / 2);
  const chestOpen = completedCount > mid;
  // Each unit is its own board; Coach only walks the one holding the current play.
  const currentId = unit.lessons.find((l) => nodeState(l) === "current")?.id ?? null;
  const items: Array<
    | { kind: "lesson"; lesson: Lesson; index: number }
    | { kind: "chest" }
    | { kind: "trophy" }
    | { kind: "divider"; label: string }
  > = [];

  unit.lessons.forEach((lesson, i) => {
    if (i === mid && unit.lessons.length >= 4) {
      items.push({ kind: "chest" });
    }
    if (i > 0 && i % 3 === 0 && unit.skills[Math.floor(i / 3)]) {
      items.push({
        kind: "divider",
        label: unit.skills[Math.floor(i / 3)] ?? unit.skills[0],
      });
    }
    items.push({ kind: "lesson", lesson, index: i });
  });
  items.push({ kind: "trophy" });

  return (
    <div className="path-board relative">
      <div className="path-rail path-board-stage yard-lines mt-1">
      {items.map((item, i) => {
        if (item.kind === "chest") {
          return (
            <div
              key={`chest-${i}`}
              data-path-decor="chest"
              className={`path-chest ${chestOpen ? "path-chest-open" : ""}`}
              title={chestOpen ? "First down secured" : "Pick up a first down"}
              aria-hidden
            >
              {chestOpen ? "⛓️" : "⬇️"}
            </div>
          );
        }
        if (item.kind === "trophy") {
          return (
            <div
              key="trophy"
              data-path-decor="endzone"
              className={`path-trophy path-endzone ${unitComplete ? "path-trophy-won" : ""}`}
              title={unitComplete ? "Touchdown — unit complete" : "Drive to the end zone"}
              aria-hidden
            >
              {unitComplete ? "🏈" : "🏁"}
            </div>
          );
        }
        if (item.kind === "divider") {
          return (
            <div key={`div-${i}`} className="path-divider">
              <span>hash · {item.label}</span>
            </div>
          );
        }

        const { lesson, index } = item;
        const state = nodeState(lesson);
        const offset = NODE_OFFSETS[index % NODE_OFFSETS.length];

        const node = (
          <div
            data-path-node={lesson.id}
            className="relative flex flex-col items-center"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {state === "current" && <span className="path-start-pill">Snap</span>}
            <span
              className={`path-node ${
                state === "completed"
                  ? "path-node-done"
                  : state === "current"
                    ? "path-node-current"
                    : "path-node-locked"
              }`}
            >
              {state === "completed" ? (
                <CheckIcon />
              ) : state === "current" ? (
                <BallIcon />
              ) : (
                <LockIcon />
              )}
            </span>
            <span
              className={`mt-2 max-w-[150px] text-center font-mono text-[11px] leading-tight ${
                state === "locked" ? "text-ink-muted/60" : "text-ink-soft"
              }`}
            >
              {lesson.title}
            </span>
          </div>
        );

        if (state === "locked") {
          return <div key={lesson.id}>{node}</div>;
        }

        return (
          <Link
            key={lesson.id}
            href={`/learn/${lesson.id}`}
            aria-label={`${lesson.title} — ${
              state === "completed" ? "replay drive" : "take the snap"
            }`}
          >
            {node}
          </Link>
        );
      })}
      </div>
      <PathCast
        boardKey={`unit:${unit.id}`}
        currentId={currentId}
        walker={currentId !== null}
      />
    </div>
  );
}
