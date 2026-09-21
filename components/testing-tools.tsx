"use client";

/**
 * Testing tools for pathway QA — reset / restart / jump ahead.
 * Visible on learn path surfaces while you're iterating; also linked from /demo.
 */

import { useState } from "react";
import type { CareerRole } from "@/lib/career-paths";
import { buildBoard } from "@/lib/career-paths";
import {
  EMPTY_PROGRESS,
  loadProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";
import { liveLessons } from "@/lib/curriculum";
import { CAREER_ROLE_KEY } from "@/lib/use-career-role";

function refresh() {
  // Hard reload so every client island re-reads localStorage.
  window.location.reload();
}

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
  const [open, setOpen] = useState(false);

  function write(next: Progress) {
    saveProgress(next);
    onChange?.(next);
    refresh();
  }

  function resetEverything() {
    if (!confirm("Wipe all progress, draft, playbook, and career role?")) return;
    try {
      localStorage.removeItem(CAREER_ROLE_KEY);
    } catch {
      /* ignore */
    }
    write({ ...EMPTY_PROGRESS });
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

  function armDemoProfile() {
    const p = loadProgress();
    write({
      ...p,
      username: p.username || "Tester",
      draftedTrack: p.draftedTrack || "sql-fundamentals",
      playbookStyle: p.playbookStyle || "dual-threat",
    });
  }

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
            Reset &amp; restart tools
          </span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {open ? "hide" : "show"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-2">
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Local only — rewrites this browser&apos;s progress so you can re-walk
            pathways without clearing site data by hand.
          </p>
          <div className="flex flex-wrap gap-2">
            <ToolBtn onClick={armDemoProfile}>Arm demo profile</ToolBtn>
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
            <ToolBtn danger onClick={resetEverything}>
              Wipe all progress
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
