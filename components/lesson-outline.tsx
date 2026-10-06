"use client";

/**
 * Course outline beside the lesson player. Same shape as the course board:
 * units in order, the lesson you are in marked, finished lessons open, the
 * rest locked until you reach them.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/progress";

/**
 * The course this lesson belongs to, built on the server
 * (app/learn/[lessonId]/page.tsx) so the player never imports the curriculum.
 */
export type OutlineData = {
  moduleId: string;
  title: string;
  units: {
    id: string;
    title: string;
    description?: string;
    status: string;
    lessons: { id: string; title: string }[];
  }[];
};

type OutlineLesson = OutlineData["units"][number]["lessons"][number];

export default function LessonOutline({
  outline,
  lessonId,
  unitId,
  refreshKey,
  onNavigate,
  onClose,
}: {
  outline: OutlineData | null;
  lessonId: string;
  unitId: string;
  /** Bumps when a lesson is saved so checks update without leaving the page. */
  refreshKey?: string;
  onNavigate?: () => void;
  /** Present on the phone drawer. The desktop rail has no close. */
  onClose?: () => void;
}) {
  const units = useMemo(() => outline?.units ?? [], [outline]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [openUnitId, setOpenUnitId] = useState(unitId);

  useEffect(() => {
    setOpenUnitId(unitId);
  }, [unitId]);

  useEffect(() => {
    setCompleted(new Set(loadProgress().completedLessons));
  }, [lessonId, refreshKey]);

  useEffect(() => {
    const row = document.querySelector("[data-outline-here='true']");
    row?.scrollIntoView({ block: "nearest" });
  }, [lessonId, openUnitId]);

  if (!outline) return null;

  const title = outline.title;
  const live = units.filter((u) => u.status === "live");
  const allLessons = live.flatMap((u) => u.lessons);
  const doneCount = allLessons.filter((l) => completed.has(l.id)).length;
  const pct =
    allLessons.length === 0
      ? 0
      : Math.round((doneCount / allLessons.length) * 100);

  const nextId =
    allLessons.find((l) => !completed.has(l.id))?.id ?? null;

  function unitOpen(liveIndex: number): boolean {
    if (liveIndex <= 0) return true;
    for (let i = 0; i < liveIndex; i++) {
      const u = live[i];
      if (!u.lessons.every((l) => completed.has(l.id))) return false;
    }
    return true;
  }

  function rowState(lesson: OutlineLesson): "here" | "done" | "next" | "locked" {
    if (lesson.id === lessonId) return "here";
    if (completed.has(lesson.id)) return "done";
    if (lesson.id === nextId) return "next";
    return "locked";
  }

  return (
    <div className="flex h-full flex-col bg-night">
      <div className="border-b border-panel-border px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <p className="label-broadcast text-turf">course outline</p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close outline"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-panel-border text-ink-muted hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
        <h2 className="mt-1 font-display text-lg font-bold leading-tight text-ink">
          {title}
        </h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          {doneCount}/{allLessons.length} lessons · {pct}%
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel">
          <div className="h-full bg-turf" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <nav
        aria-label="Lessons in this course"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {units.map((unit, index) => {
          const liveIndex = live.findIndex((u) => u.id === unit.id);
          const coming = unit.status !== "live" || unit.lessons.length === 0;
          const unlocked = !coming && unitOpen(liveIndex);
          const open = openUnitId === unit.id;
          const unitDone = unit.lessons.filter((l) =>
            completed.has(l.id),
          ).length;
          const holdsHere = unit.lessons.some((l) => l.id === lessonId);

          return (
            <div key={unit.id} className="border-b border-panel-border/70">
              <button
                type="button"
                onClick={() =>
                  setOpenUnitId((id) => (id === unit.id ? "" : unit.id))
                }
                aria-expanded={open}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-panel/60"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold ${
                    holdsHere
                      ? "border-turf bg-turf text-night"
                      : unlocked
                        ? "border-panel-border text-ink-soft"
                        : "border-panel-border text-ink-muted"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-bold text-ink">
                    {unit.title}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    {coming
                      ? "In build"
                      : unlocked
                        ? `${unitDone}/${unit.lessons.length}`
                        : "Locked"}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-ink-muted">
                  {open ? "Hide" : "Show"}
                </span>
              </button>

              {open && (
                <div className="px-4 pb-3">
                  {unit.description && (
                    <p className="mb-2 pl-9 text-[12px] leading-relaxed text-ink-muted">
                      {unit.description}
                    </p>
                  )}
                  {coming ? (
                    <p className="pl-9 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                      Lessons land here later.
                    </p>
                  ) : (
                    <ul className="space-y-0.5">
                      {unit.lessons.map((lesson) => {
                        const state = unlocked
                          ? rowState(lesson)
                          : lesson.id === lessonId
                            ? "here"
                            : "locked";
                        const here = state === "here";
                        const canOpen =
                          state === "done" || state === "next" || state === "here";
                        const rowClass = `flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] ${
                          here
                            ? "bg-turf/15 text-ink"
                            : canOpen
                              ? "text-ink-soft hover:bg-panel hover:text-ink"
                              : "text-ink-muted"
                        }`;
                        const mark =
                          state === "done" ? (
                            <span className="text-turf" aria-hidden>
                              ✓
                            </span>
                          ) : state === "here" ? (
                            <span className="text-turf" aria-hidden>
                              ▸
                            </span>
                          ) : state === "next" ? (
                            <span className="text-gold" aria-hidden>
                              ○
                            </span>
                          ) : (
                            <span aria-hidden>○</span>
                          );
                        const label = (
                          <>
                            <span className="w-4 shrink-0 text-center font-mono text-[11px]">
                              {mark}
                            </span>
                            <span className="min-w-0 flex-1 leading-snug">
                              {lesson.title}
                              {here && (
                                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-widest text-turf">
                                  You are here
                                </span>
                              )}
                            </span>
                          </>
                        );

                        if (!canOpen || here) {
                          return (
                            <li key={lesson.id}>
                              <div
                                className={rowClass}
                                data-outline-here={here ? "true" : undefined}
                                aria-current={here ? "page" : undefined}
                              >
                                {label}
                              </div>
                            </li>
                          );
                        }

                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/learn/${lesson.id}`}
                              className={rowClass}
                              onClick={onNavigate}
                            >
                              {label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-panel-border p-3">
        <Link
          href={`/learn/track/${outline.moduleId}`}
          onClick={onNavigate}
          className="flex w-full items-center justify-center rounded-xl border border-panel-border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-soft hover:border-turf/40 hover:text-turf"
        >
          ← Course board
        </Link>
      </div>
    </div>
  );
}
