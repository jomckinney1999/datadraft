"use client";

/**
 * Testing tools — reset / restart / jump, for QA on the learn surfaces.
 *
 * Visible on course roadmaps while iterating, and on /demo. It writes the
 * same localStorage the real player reads, deliberately: a mock mode would
 * let a bug live in the real path while the test surface stayed green.
 *
 * This used to also drive career paths (jump to a role, complete a whole
 * path). Those are gone, so what is left is the three things anyone testing
 * a lesson actually needs.
 */

import { useState } from "react";
import { COURSES } from "@/lib/courses";
import {
  EMPTY_PROGRESS,
  loadProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";
import { liveLessons } from "@/lib/curriculum";
import { MODULE_STORAGE_KEY } from "@/lib/use-module";
import { PAYWALL_LIVE } from "@/lib/season-pass";
import {
  FREE_DAILY_TIMEOUTS,
  grantSeasonPassDemo,
  loadEconomy,
} from "@/lib/economy";

function go(href: string) {
  window.location.href = href;
}

const LIVE_COURSES = COURSES.filter((c) => c.status === "live" && c.moduleId);

export default function TestingTools({
  moduleId,
  onChange,
}: {
  /** When on a single-course roadmap, reset just that module's lessons. */
  moduleId?: string | null;
  onChange?: (p: Progress) => void;
}) {
  const [open, setOpen] = useState(true);
  const [pickCourse, setPickCourse] = useState(
    moduleId && moduleId !== "all"
      ? moduleId
      : LIVE_COURSES[0]?.moduleId ?? "sql-fundamentals",
  );

  function write(next: Progress, href?: string) {
    saveProgress(next);
    onChange?.(next);
    if (href) go(href);
  }

  function wipeAll() {
    if (!confirm("Wipe all local progress? XP, lessons, badges, tickets.")) {
      return;
    }
    try {
      localStorage.removeItem(MODULE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    write({ ...EMPTY_PROGRESS }, "/learn");
  }

  function jumpToCourse() {
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, pickCourse);
    } catch {
      /* ignore */
    }
    go(`/learn/track/${pickCourse}`);
  }

  function restartCourse() {
    const target = moduleId && moduleId !== "all" ? moduleId : pickCourse;
    const ids = new Set(liveLessons(target).map((l) => l.lesson.id));
    const p = loadProgress();
    write({
      ...p,
      completedLessons: p.completedLessons.filter((id) => !ids.has(id)),
    });
  }

  function completeCourse() {
    const target = moduleId && moduleId !== "all" ? moduleId : pickCourse;
    const ids = liveLessons(target).map((l) => l.lesson.id);
    const p = loadProgress();
    write({
      ...p,
      completedLessons: Array.from(new Set([...p.completedLessons, ...ids])),
    });
  }

  function refillTimeouts() {
    const p = loadEconomy();
    write({ ...p, timeouts: FREE_DAILY_TIMEOUTS, tickets: p.tickets + 50 });
  }

  function seasonPass() {
    write(grantSeasonPassDemo());
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-xl border border-panel-border bg-panel px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted"
      >
        QA
      </button>
    );
  }

  return (
    <div className="surface mt-8 rounded-2xl border border-gold/30 bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="label-broadcast text-gold">testing tools</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          Hide
        </button>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
        Local only, and it writes the same storage the real player reads.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={pickCourse}
          onChange={(e) => setPickCourse(e.target.value)}
          className="rounded-lg border border-panel-border bg-night/60 px-3 py-2 font-mono text-[11px] text-ink"
        >
          {LIVE_COURSES.map((c) => (
            <option key={c.moduleId} value={c.moduleId!}>
              {c.title}
            </option>
          ))}
        </select>
        <ToolBtn onClick={jumpToCourse}>Open course</ToolBtn>
        <ToolBtn onClick={restartCourse}>Restart course</ToolBtn>
        <ToolBtn onClick={completeCourse}>Complete course</ToolBtn>
        {/* Free unlocks. /demo is public, so once the paywall is live these
            exist only in development; a real Pass comes from the server. */}
        {(!PAYWALL_LIVE || process.env.NODE_ENV !== "production") && (
          <>
            <ToolBtn onClick={refillTimeouts}>Refill timeouts + 50 tickets</ToolBtn>
            <ToolBtn onClick={seasonPass}>Grant Season Pass</ToolBtn>
          </>
        )}
        <ToolBtn onClick={wipeAll} danger>
          Wipe all progress
        </ToolBtn>
      </div>
    </div>
  );
}

function ToolBtn({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
        danger
          ? "border-gold/40 text-gold hover:border-gold hover:bg-gold/10"
          : "border-panel-border text-ink-soft hover:border-turf/50 hover:text-turf"
      }`}
    >
      {children}
    </button>
  );
}
