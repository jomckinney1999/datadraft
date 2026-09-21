"use client";

/**
 * Continuous Duolingo career board — every lesson from every course in the
 * formula, one winding path. Clear SQL's last node and Excel's first is next.
 */

import Link from "next/link";
import PathCast from "@/components/path-cast";
import { useModule } from "@/lib/use-module";
import type { BoardLesson, BoardSegment, CareerRole } from "@/lib/career-paths";
import { buildBoard } from "@/lib/career-paths";

const OFFSETS = [0, 64, 24, -64, -24, 48, -48];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <path
        d="M12 3l2.6 6.4L21 10.2l-5 4.2 1.4 7L12 17.8 6.6 21.4 8 14.4l-5-4.2 6.4-.8L12 3z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path
        d="M5 13l5 5L19 7"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        d="M4 9v6M7 8v8M10 11h4M17 8v8M20 9v6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CareerBoard({
  role,
  completedLessons,
  backHref = "/learn/path",
}: {
  role: CareerRole;
  completedLessons: string[];
  backHref?: string;
}) {
  const { setModule } = useModule();
  const { segments, lessons, current } = buildBoard(role, completedLessons);
  const courseNum = (current?.courseIndex ?? 0) + 1;
  const courseCount = role.courseIds.length;
  const doneCount = lessons.filter((l) =>
    completedLessons.includes(l.lesson.id),
  ).length;

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="sticky top-0 z-20 -mx-1 mb-2 px-1 pt-1">
        <div className="unit-banner flex items-center gap-3 !rounded-2xl">
          <Link
            href={backHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-night/15 text-night transition-colors hover:bg-night/25"
            aria-label="Change career path"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-night/65">
              {role.title} · Course {courseNum}/{courseCount}
              {lessons.length > 0
                ? ` · ${doneCount}/${lessons.length} plays`
                : ""}
            </p>
            <h1 className="truncate font-display text-xl font-bold text-night sm:text-2xl">
              {current?.course.title ?? role.title}
            </h1>
          </div>
        </div>
      </div>

      <p className="mb-4 px-2 text-center text-sm leading-relaxed text-ink-soft">
        {role.why}
      </p>
      <p className="mb-6 px-2 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        One board · courses flow into each other down the path
      </p>

      <div className="path-board relative">
        <div className="career-path-rail path-board-stage relative flex flex-col items-center gap-8 py-4 pb-16">
        {segments.map((seg, i) => (
          <SegmentView
            key={segmentKey(seg, i)}
            seg={seg}
            offset={OFFSETS[i % OFFSETS.length]}
            setModule={setModule}
          />
        ))}

        <div
          data-path-decor="endzone"
          className={`path-trophy path-endzone ${
            lessons.length > 0 &&
            lessons.every((l) => completedLessons.includes(l.lesson.id))
              ? "path-trophy-won"
              : ""
          }`}
          aria-hidden
        >
          🏆
        </div>
        <p className="max-w-[14rem] text-center font-mono text-[11px] uppercase tracking-widest text-ink-muted">
          End zone · {role.title}
        </p>
        </div>
        <PathCast
          boardKey={`role:${role.id}`}
          currentId={current?.lesson.id ?? null}
        />
      </div>
    </div>
  );
}

function segmentKey(seg: BoardSegment, i: number): string {
  switch (seg.kind) {
    case "course-header":
      return `h-${seg.course.id}`;
    case "unit-divider":
      return `u-${seg.unitId}`;
    case "lesson":
      return seg.node.lesson.id;
    case "chest":
      return seg.id;
    case "course-clear":
      return `clear-${seg.course.id}`;
    case "building":
      return `build-${seg.course.id}`;
    default:
      return `seg-${i}`;
  }
}

function SegmentView({
  seg,
  offset,
  setModule,
}: {
  seg: BoardSegment;
  offset: number;
  setModule: (id: string) => void;
}) {
  if (seg.kind === "course-header") {
    return (
      <div className="relative z-[1] w-full max-w-sm px-2">
        <div className="rounded-2xl border-2 border-turf/40 border-b-4 bg-turf/10 px-4 py-3 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-turf">
            Course {seg.courseIndex + 1} · {seg.done}/{seg.total}
          </p>
          <p className="mt-0.5 font-display text-lg font-bold text-ink">
            {seg.course.title}
          </p>
        </div>
      </div>
    );
  }

  if (seg.kind === "unit-divider") {
    return (
      <div className="path-divider relative z-[1] w-full max-w-xs">
        <span>{seg.label}</span>
      </div>
    );
  }

  if (seg.kind === "chest") {
    return (
      <div
        data-path-decor="chest"
        className={`path-chest ${seg.open ? "path-chest-open" : ""}`}
        style={{ transform: `translateX(${offset * 0.3}px)` }}
        aria-hidden
      >
        {seg.open ? "⛓️" : "🎁"}
      </div>
    );
  }

  if (seg.kind === "course-clear") {
    return (
      <div
        data-path-decor="clear"
        className={`path-trophy ${seg.open ? "path-trophy-won" : ""}`}
        style={{ transform: `translateX(${offset * 0.2}px)` }}
        title={
          seg.open
            ? `${seg.course.title} cleared — next course is down the path`
            : `Finish ${seg.course.title}`
        }
        aria-hidden
      >
        {seg.open ? "🏈" : "🏁"}
      </div>
    );
  }

  if (seg.kind === "building") {
    return (
      <div className="relative z-[1] flex w-full max-w-sm flex-col items-center gap-4 px-2">
        <div className="w-full rounded-2xl border-2 border-panel-border border-b-4 bg-panel/60 px-4 py-3 text-center opacity-70">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            Course {seg.courseIndex + 1} · In build
          </p>
          <p className="mt-0.5 font-display text-lg font-bold text-ink-muted">
            {seg.course.title}
          </p>
        </div>
        <span className="path-node path-node-locked">
          <LockIcon />
        </span>
        <p className="max-w-[12rem] text-center font-mono text-[11px] text-ink-muted">
          On your formula — lessons land here when the course ships
        </p>
      </div>
    );
  }

  return (
    <LessonNode
      node={seg.node}
      offset={offset}
      onEnter={() => {
        if (seg.node.course.moduleId) setModule(seg.node.course.moduleId);
      }}
    />
  );
}

function LessonNode({
  node,
  offset,
  onEnter,
}: {
  node: BoardLesson;
  offset: number;
  onEnter: () => void;
}) {
  const { state, lesson, course } = node;
  const locked = state === "locked";

  const icon =
    state === "completed" ? (
      <CheckIcon />
    ) : state === "current" ? (
      <StarIcon />
    ) : locked ? (
      <LockIcon />
    ) : (
      <DumbbellIcon />
    );

  const nodeClass =
    state === "completed"
      ? "path-node path-node-done"
      : state === "current"
        ? "path-node path-node-current"
        : "path-node path-node-locked";

  const body = (
    <div
      data-path-node={lesson.id}
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* Coach stands beside this node from PathCast's overlay, so he can
          walk here from the last play instead of being drawn in place. */}
      {state === "current" && <span className="path-start-pill">Snap</span>}
      <span className={nodeClass}>{icon}</span>
      <div className="mt-2.5 max-w-[10.5rem] text-center">
        <p
          className={`font-mono text-[11px] font-semibold leading-snug ${
            locked ? "text-ink-muted/70" : "text-ink-soft"
          }`}
        >
          {lesson.title}
        </p>
        {state === "current" && (
          <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-turf">
            {course.mark}
          </p>
        )}
      </div>
    </div>
  );

  if (locked) {
    return <div className="relative z-[1]">{body}</div>;
  }

  return (
    <Link
      href={`/learn/${lesson.id}`}
      onClick={onEnter}
      className="relative z-[1] block"
      aria-label={`${lesson.title} — ${
        state === "completed" ? "replay" : "take the snap"
      }`}
    >
      {body}
    </Link>
  );
}
