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
import { PathChest, PathFlag } from "@/components/path-marks";
import HomeLink from "@/components/home-link";
import LearnRail from "@/components/learn-rail";
import LearnStatusChips from "@/components/learn-status-chips";
import RapidFire from "@/components/rapid-fire";

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
  const [opened, setOpened] = useState<Record<string, boolean>>({});
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
  const activeUnit = visibleUnits.find((u) => u.id === activeUnitId);
  const activeIndex = visibleUnits.findIndex((u) => u.id === activeUnitId);

  const gateHref = current ? `/learn/${current.lesson.id}` : null;

  const courseIntro = introFor(moduleId);
  const courseHours = COURSES.find((c) => c.moduleId === moduleId)?.hours;

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

      <div className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-panel-border bg-night/95 px-4 py-2 backdrop-blur lg:hidden">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          {progress.seasonPass ? "Unlimited" : `${progress.timeouts} timeouts`}
        </span>
        {gateHref && current && (
          <Link
            href={gateHref}
            className="truncate font-mono text-[11px] font-bold uppercase tracking-wider text-turf"
          >
            {current.lesson.title} →
          </Link>
        )}
      </div>

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
              <p className="font-display text-lg font-bold text-ink">
                {current && pct < 100
                  ? current.lesson.title
                  : pct === 100
                    ? "Course complete"
                    : "Next snap"}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                {completedCount} done · {Math.max(0, all.length - completedCount)}{" "}
                still ahead
                {activeUnit ? ` · ${activeUnit.title}` : ""}
              </p>
              <div className="field-progress mt-2 flex items-center gap-2">
                <div className="field-progress-track">
                  <div
                    className="field-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                  <span
                    className="field-progress-stick"
                    style={{ left: `${pct}%` }}
                    aria-hidden
                  />
                </div>
                <span className="shrink-0 text-gold" aria-hidden>
                  {pct === 100 ? <PathFlag won /> : <PathFlag won={false} />}
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
          {current && activeUnit && activeIndex >= 0 && pct < 100 && (
            <div className="sticky top-14 z-10 mt-4 lg:top-3">
              <div className="unit-banner flex items-center justify-between gap-3 !rounded-2xl !px-4 !py-2.5">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-night/70">
                    Unit {activeIndex + 1} · {activeUnit.title}
                  </p>
                  <p className="truncate font-display text-base font-bold text-night">
                    {current.lesson.title}
                  </p>
                </div>
                {gateHref && (
                  <Link
                    href={gateHref}
                    className="shrink-0 rounded-xl bg-night/15 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-night hover:bg-night/25"
                  >
                    Snap
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Units */}
          {visibleUnits.map((unit, unitIndex) => {
            const liveIndex = liveUnits.findIndex((u) => u.id === unit.id);
            // Number from the course outline, so a coming-soon module in the
            // middle doesn't renumber the live ones. Module 9 stays Module 9.
            const displayNumber = unitIndex + 1;
            const doneCount = unit.lessons.filter((l) =>
              completed.has(l.id),
            ).length;
            const unlocked =
              unit.status !== "live" ? false : unitUnlocked(liveIndex);
            const priorLive = [...visibleUnits]
              .slice(0, unitIndex)
              .reverse()
              .find((u) => u.status === "live");
            const unlockAfter = priorLive
              ? visibleUnits.findIndex((u) => u.id === priorLive.id) + 1
              : null;
            const isActive = unit.id === activeUnitId && unlocked;

            const isFocus =
              unitIndex === activeIndex || unitIndex === activeIndex + 1;
            const isExpanded = isFocus || opened[unit.id];
            const showStop =
              unit.status === "live" &&
              (displayNumber === 1 || displayNumber % 4 === 0);

            if (!isExpanded) {
              const done =
                unit.status === "live" &&
                unit.lessons.length > 0 &&
                unit.lessons.every((l) => completed.has(l.id));
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() =>
                    setOpened((prev) => ({ ...prev, [unit.id]: true }))
                  }
                  className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-panel-border px-4 py-3 text-left"
                >
                  <span className="font-display text-sm font-bold text-ink">
                    Unit {displayNumber} · {unit.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    {unit.status !== "live" ? "Soon" : done ? "Done" : "Locked"}
                  </span>
                </button>
              );
            }

            return (
              <div key={unit.id}>
                <UnitBlock
                  unit={unit}
                  displayNumber={displayNumber}
                  unlockAfter={unlockAfter}
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
                {showStop && (
                  <PathStop
                    moduleId={moduleId}
                    after={`Unit ${displayNumber}`}
                  />
                )}
              </div>
            );
          })}

          <p className="mt-16 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Progress is saved in this browser · full accounts coming with the
            season launch
          </p>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            <LearnRail progress={progress} onProgress={setProgress} quiet />
          </div>
        </div>
      </div>
    </main>
  );
}

function PathStop({
  moduleId,
  after,
}: {
  moduleId: string;
  after: string;
}) {
  const [play, setPlay] = useState(false);

  return (
    <div className="path-board relative mt-2">
      <div className="path-rail flex flex-col items-center">
        {!play ? (
          <button
            type="button"
            onClick={() => setPlay(true)}
            className="path-node-current relative z-[1] flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-gold bg-gold/15 font-display text-xs font-bold text-gold shadow-[0_0_24px_-6px_rgb(var(--c-gold)/0.7)]"
          >
            <span aria-hidden className="text-lg">
              🔥
            </span>
            Snap round
            <span className="mt-0.5 font-mono text-[9px] font-normal uppercase tracking-wider text-ink-muted">
              {after}
            </span>
          </button>
        ) : (
          <div className="relative z-[1] w-full max-w-xl rounded-2xl border border-gold/40 bg-panel p-4">
            <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-gold">
              On the path · {after}
            </p>
            <RapidFire
              embedded
              courseModuleId={moduleId}
              roundSize={5}
              onClose={() => setPlay(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function UnitBlock({
  unit,
  displayNumber,
  unlockAfter,
  completedCount,
  unlocked,
  isActive,
  nodeState,
  continueHref,
  continueLabel,
}: {
  unit: Unit;
  displayNumber: number;
  /** Outline number of the live module that has to be finished first. */
  unlockAfter: number | null;
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
                className={`shrink-0 ${unitComplete ? "text-turf" : "text-gold opacity-50"}`}
                aria-hidden
              >
                <PathFlag won={unitComplete} />
              </span>
            </div>
          )}

          {locked && !comingSoon && (
            <p className="mt-3 font-mono text-[11px] text-ink-muted">
              Move the chains on Unit {unlockAfter ?? displayNumber - 1} to unlock
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
              <span className={chestOpen ? "text-turf" : "text-gold"}>
                <PathChest open={chestOpen} />
              </span>
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
              <span className={unitComplete ? "text-turf" : "text-gold"}>
                <PathFlag won={unitComplete} />
              </span>
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
