"use client";

/**
 * Testing tools for pathway QA — reset / restart / jump to a role or course.
 * Visible on learn surfaces while iterating; also on /demo.
 */

import { useMemo, useState } from "react";
import type { CareerRole } from "@/lib/career-paths";
import { CAREER_ROLES, buildBoard, getRole } from "@/lib/career-paths";
import { COURSES } from "@/lib/courses";
import {
  EMPTY_PROGRESS,
  loadProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";
import { liveLessons } from "@/lib/curriculum";
import { CAREER_ROLE_KEY } from "@/lib/use-career-role";
import { MODULE_STORAGE_KEY } from "@/lib/use-module";
import { STYLES, type PlaybookStyle } from "@/lib/playbook";
import {
  FREE_DAILY_TIMEOUTS,
  grantSeasonPassDemo,
  loadEconomy,
} from "@/lib/economy";

function go(href: string) {
  window.location.href = href;
}

function clearLocalKeys() {
  try {
    localStorage.removeItem(CAREER_ROLE_KEY);
    localStorage.removeItem(MODULE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const LIVE_COURSES = COURSES.filter(
  (c) => c.status === "live" && c.moduleId,
);

export default function TestingTools({
  role,
  moduleId,
  onChange,
}: {
  role?: CareerRole | null;
  /** When on a single-course track, reset just that module's lessons. */
  moduleId?: string | null;
  onChange?: (p: Progress) => void;
}) {
  const [open, setOpen] = useState(true);
  const [pickRole, setPickRole] = useState(role?.id ?? CAREER_ROLES[0].id);
  const [pickCourse, setPickCourse] = useState(
    moduleId && moduleId !== "all"
      ? moduleId
      : LIVE_COURSES[0]?.moduleId ?? "sql-fundamentals",
  );
  const [pickStyle, setPickStyle] = useState<PlaybookStyle>("dual-threat");
  const [clearProgressOnJump, setClearProgressOnJump] = useState(true);

  const courseLessons = useMemo(
    () => liveLessons(pickCourse),
    [pickCourse],
  );
  const [pickLesson, setPickLesson] = useState(
    () => courseLessons[0]?.lesson.id ?? "",
  );

  // Keep lesson picker in sync when the course changes.
  const lessonOptions = courseLessons;
  const activeLesson =
    lessonOptions.find((e) => e.lesson.id === pickLesson)?.lesson.id ??
    lessonOptions[0]?.lesson.id ??
    "";

  function write(next: Progress, href?: string) {
    saveProgress(next);
    onChange?.(next);
    if (href) go(href);
    else window.location.reload();
  }

  function maybeClearedProgress(): Progress {
    if (!clearProgressOnJump) return loadProgress();
    return { ...EMPTY_PROGRESS };
  }

  function wipeAndPick() {
    if (!confirm("Wipe all progress and go back to the path picker?"))
      return;
    clearLocalKeys();
    write({ ...EMPTY_PROGRESS }, "/learn/path");
  }

  function jumpToRole() {
    const nextRole = getRole(pickRole);
    if (!nextRole) return;
    try {
      localStorage.setItem(CAREER_ROLE_KEY, pickRole);
    } catch {
      /* ignore */
    }
    const base = maybeClearedProgress();
    write(
      {
        ...base,
        username: base.username || "Tester",
        draftedTrack: base.draftedTrack || nextRole.courseIds[0] || "sql-fundamentals",
        playbookStyle: pickStyle,
      },
      `/learn/path/${pickRole}`,
    );
  }

  function jumpToCourse() {
    if (!LIVE_COURSES.some((c) => c.moduleId === pickCourse)) return;
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, pickCourse);
      // Leaving a career path so /learn doesn't bounce you back into one.
      localStorage.removeItem(CAREER_ROLE_KEY);
    } catch {
      /* ignore */
    }
    const base = maybeClearedProgress();
    write(
      {
        ...base,
        username: base.username || "Tester",
        draftedTrack: base.draftedTrack || pickCourse,
        playbookStyle: pickStyle,
      },
      `/learn/track/${pickCourse}`,
    );
  }

  function jumpToLesson() {
    const id = activeLesson;
    if (!id) return;
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, pickCourse);
    } catch {
      /* ignore */
    }
    const base = maybeClearedProgress();
    write(
      {
        ...base,
        username: base.username || "Tester",
        draftedTrack: base.draftedTrack || pickCourse,
        playbookStyle: pickStyle,
      },
      `/learn/${id}`,
    );
  }

  function restartPath() {
    if (!role) return;
    if (!confirm(`Restart the ${role.title} path from lesson one?`)) return;
    const { lessons } = buildBoard(role, loadProgress().completedLessons);
    const ids = new Set(lessons.map((l) => l.lesson.id));
    const p = loadProgress();
    write({
      ...p,
      completedLessons: p.completedLessons.filter((id) => !ids.has(id)),
    });
  }

  function completeCurrentCourse() {
    if (!role) return;
    const p = loadProgress();
    const { lessons, current } = buildBoard(role, p.completedLessons);
    if (!current) return;
    const courseIds = lessons
      .filter((l) => l.course.id === current.course.id)
      .map((l) => l.lesson.id);
    const merged = Array.from(new Set(p.completedLessons.concat(courseIds)));
    write({ ...p, completedLessons: merged, xp: p.xp + courseIds.length * 10 });
  }

  function completeEntirePath() {
    if (!role) return;
    if (!confirm(`Mark every live lesson on the ${role.title} path complete?`))
      return;
    const p = loadProgress();
    const { lessons } = buildBoard(role, p.completedLessons);
    const ids = lessons.map((l) => l.lesson.id);
    write({
      ...p,
      completedLessons: Array.from(new Set(p.completedLessons.concat(ids))),
      xp: p.xp + ids.length * 10,
    });
  }

  function restartCourse() {
    if (!moduleId) return;
    if (!confirm("Clear progress for this course only?")) return;
    const ids = new Set(liveLessons(moduleId).map((e) => e.lesson.id));
    const p = loadProgress();
    write({
      ...p,
      completedLessons: p.completedLessons.filter((id) => !ids.has(id)),
    });
  }

  function completeCourse() {
    if (!moduleId) return;
    const ids = liveLessons(moduleId).map((e) => e.lesson.id);
    const p = loadProgress();
    write({
      ...p,
      completedLessons: Array.from(new Set(p.completedLessons.concat(ids))),
      xp: p.xp + ids.length * 10,
    });
  }

  /** Start this path at a chosen course: mark all prior courses complete. */
  function startPathAtCourse() {
    if (!role) return;
    const p = loadProgress();
    const { lessons } = buildBoard(role, []);
    const courseId =
      COURSES.find((c) => c.moduleId === pickCourse)?.id ?? pickCourse;
    const idx = role.courseIds.indexOf(courseId);
    if (idx < 0) {
      alert("That course is not on this career path.");
      return;
    }
    const priorIds = lessons
      .filter((l) => l.courseIndex < idx)
      .map((l) => l.lesson.id);
    // Clear lessons from the target course onward so you start at its first node.
    const fromHere = new Set(
      lessons.filter((l) => l.courseIndex >= idx).map((l) => l.lesson.id),
    );
    const kept = p.completedLessons.filter((id) => !fromHere.has(id));
    const merged = Array.from(new Set(kept.concat(priorIds)));
    write(
      {
        ...p,
        completedLessons: merged,
        username: p.username || "Tester",
        playbookStyle: p.playbookStyle || pickStyle,
      },
      `/learn/path/${role.id}`,
    );
  }

  const pathCourseOptions = role
    ? role.courseIds
        .map((id) => COURSES.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c && c.moduleId))
    : [];

  return (
    <div className="section-card border-gold/40 bg-gold/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span>
          <span className="label-broadcast text-gold">testing</span>
          <span className="mt-0.5 block font-display text-sm font-bold text-ink">
            Reset, pick &amp; jump
          </span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {open ? "hide" : "show"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Local only. Wipe sends you to the picker so you can choose a role or
            course. Jump actions arm a demo profile and navigate.
          </p>

          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink-soft">
            <input
              type="checkbox"
              checked={clearProgressOnJump}
              onChange={(e) => setClearProgressOnJump(e.target.checked)}
              className="accent-[rgb(var(--c-turf))]"
            />
            Clear lesson progress when jumping
          </label>

          {/* ── Pick a career path ── */}
          <fieldset className="space-y-2">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              Career path
            </legend>
            <select
              value={pickRole}
              onChange={(e) => setPickRole(e.target.value)}
              className="w-full rounded-xl border-2 border-panel-border bg-panel px-3 py-2 font-mono text-[11px] text-ink"
            >
              {CAREER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <ToolBtn onClick={jumpToRole}>Open this path</ToolBtn>
          </fieldset>

          {/* ── Pick a course ── */}
          <fieldset className="space-y-2">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              Single course
            </legend>
            <select
              value={pickCourse}
              onChange={(e) => {
                setPickCourse(e.target.value);
                const first = liveLessons(e.target.value)[0]?.lesson.id ?? "";
                setPickLesson(first);
              }}
              className="w-full rounded-xl border-2 border-panel-border bg-panel px-3 py-2 font-mono text-[11px] text-ink"
            >
              {LIVE_COURSES.map((c) => (
                <option key={c.id} value={c.moduleId!}>
                  {c.title}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <ToolBtn onClick={jumpToCourse}>Open course roadmap</ToolBtn>
              {role && pathCourseOptions.some((c) => c.moduleId === pickCourse) && (
                <ToolBtn onClick={startPathAtCourse}>
                  Start this path at that course
                </ToolBtn>
              )}
            </div>
          </fieldset>

          {/* ── Jump into a lesson ── */}
          <fieldset className="space-y-2">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              Lesson
            </legend>
            <select
              value={activeLesson}
              onChange={(e) => setPickLesson(e.target.value)}
              className="w-full rounded-xl border-2 border-panel-border bg-panel px-3 py-2 font-mono text-[11px] text-ink"
            >
              {lessonOptions.map(({ lesson, unit }, i) => (
                <option key={lesson.id} value={lesson.id}>
                  {i + 1}. {lesson.title} · {unit.title}
                </option>
              ))}
            </select>
            <ToolBtn onClick={jumpToLesson}>Open lesson</ToolBtn>
          </fieldset>

          {/* ── Playbook style (optional) ── */}
          <fieldset className="space-y-2">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              Playbook style
            </legend>
            <select
              value={pickStyle}
              onChange={(e) => setPickStyle(e.target.value as PlaybookStyle)}
              className="w-full rounded-xl border-2 border-panel-border bg-panel px-3 py-2 font-mono text-[11px] text-ink"
            >
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </fieldset>

          {/* ── Economy ── */}
          <fieldset className="space-y-2 border-t border-panel-border pt-4">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              Sideline economy
            </legend>
            <div className="flex flex-wrap gap-2">
              <ToolBtn
                onClick={() => {
                  const p = loadEconomy();
                  write({
                    ...p,
                    timeouts: FREE_DAILY_TIMEOUTS,
                    timeoutsRefilledDay: new Date().toISOString().slice(0, 10),
                  });
                }}
              >
                Refill timeouts
              </ToolBtn>
              <ToolBtn
                onClick={() => {
                  const p = loadEconomy();
                  write({ ...p, tickets: p.tickets + 100 });
                }}
              >
                +100 tickets
              </ToolBtn>
              <ToolBtn
                onClick={() => {
                  const p = loadEconomy();
                  write({ ...p, byeWeeks: p.byeWeeks + 1 });
                }}
              >
                +1 bye week
              </ToolBtn>
              <ToolBtn
                onClick={() => {
                  write(grantSeasonPassDemo(true));
                }}
              >
                Season Pass ON
              </ToolBtn>
              <ToolBtn
                onClick={() => {
                  write(grantSeasonPassDemo(false));
                }}
              >
                Season Pass OFF
              </ToolBtn>
            </div>
          </fieldset>

          {/* ── Context actions ── */}
          <div className="flex flex-wrap gap-2 border-t border-panel-border pt-4">
            {role && (
              <>
                <ToolBtn onClick={restartPath}>Restart this path</ToolBtn>
                <ToolBtn onClick={completeCurrentCourse}>
                  Complete current course
                </ToolBtn>
                <ToolBtn onClick={completeEntirePath}>Complete full path</ToolBtn>
              </>
            )}
            {moduleId && (
              <>
                <ToolBtn onClick={restartCourse}>Restart this course</ToolBtn>
                <ToolBtn onClick={completeCourse}>Complete this course</ToolBtn>
              </>
            )}
            <ToolBtn danger onClick={wipeAndPick}>
              Wipe all → pick again
            </ToolBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 border-b-4 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
        danger
          ? "border-gold/50 bg-gold/10 text-gold hover:bg-gold/20"
          : "border-panel-border bg-panel text-ink-soft hover:border-turf/50 hover:text-turf"
      }`}
    >
      {children}
    </button>
  );
}
