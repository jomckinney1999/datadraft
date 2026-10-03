"use client";

/**
 * Courses.
 *
 * This page used to lead with a job-title picker that built a "career path"
 * out of the courses — Data Analyst, Analytics Engineer, and so on — and the
 * catalogue itself was folded away behind a disclosure triangle. That was the
 * wrong bet. Career coaching is a crowded shelf we have no edge on, and the
 * thing people actually came here for was buried two clicks down.
 *
 * So: the ten courses are the page. Pick one, work through it, come back for
 * the day's question in between.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSES, type Course } from "@/lib/courses";
import { liveLessons, ALL_MODULE, getLesson } from "@/lib/curriculum";
import { loadProgress, type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import CourseArt from "@/components/course-art";
import AppNav from "@/components/app-nav";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold" aria-hidden>
      <path
        d="M12 2c1 4-3 5.5-3 9a3 3 0 0 0 6 0c0-1.5-.8-2.6-.8-2.6S17 10 17 13a5 5 0 0 1-10 0c0-4.5 4-6.5 5-11z"
        fill="currentColor"
      />
    </svg>
  );
}

function builtCount(course: Course): number {
  return course.moduleId ? liveLessons(course.moduleId).length : 0;
}

function CourseCard({
  course,
  completed,
}: {
  course: Course;
  completed: Set<string>;
}) {
  const built = builtCount(course);
  const done = course.moduleId
    ? liveLessons(course.moduleId).filter((e) => completed.has(e.lesson.id))
        .length
    : 0;
  const isLive = course.status === "live";
  const accentBorder =
    course.accent === "turf" ? "hover:border-turf/60" : "hover:border-gold/60";

  const body = (
    <>
      <div className="relative h-44 overflow-hidden border-b border-panel-border bg-night/60">
        <CourseArt
          id={course.id}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <span className="inline-flex items-center gap-1.5 border border-panel-border bg-panel/80 px-2 py-1 font-mono text-[10px] text-ink-soft">
            <ClockIcon />
            {course.hours}h
          </span>
          <span className="inline-flex items-center gap-1.5 border border-panel-border bg-panel/80 px-2 py-1 font-mono text-[10px] text-ink-soft">
            <FlameIcon />
            {course.lessons * 10}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold leading-tight text-ink">
          {course.title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
          {course.blurb}
        </p>
        {isLive && done > 0 && (
          <div className="quest-bar mt-3">
            <span style={{ width: `${built ? (done / built) * 100 : 0}%` }} />
          </div>
        )}
        <span
          className={`mt-4 block rounded-xl border px-4 py-2.5 text-center font-display text-sm font-bold tracking-wide ${
            isLive
              ? "border-turf-dim border-b-4 bg-turf text-night"
              : "border-panel-border bg-panel text-ink-muted"
          }`}
        >
          {isLive
            ? done > 0
              ? `${done}/${built} · Continue →`
              : "Open course →"
            : "Coming soon"}
        </span>
      </div>
    </>
  );

  const shell = `group lift flex flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel ${
    isLive ? accentBorder : "opacity-75"
  }`;

  if (!isLive || !course.moduleId) {
    return <div className={shell}>{body}</div>;
  }
  return (
    <Link href={`/learn/track/${course.moduleId}`} className={shell}>
      {body}
    </Link>
  );
}

export default function CourseCatalogPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  const completed = new Set(progress.completedLessons);
  const allLessons = liveLessons(ALL_MODULE);
  const allDone = allLessons.filter((e) => completed.has(e.lesson.id)).length;

  // The course you are furthest into, so "pick up where you left off" beats
  // scanning ten cards for the one with a half-full bar on it.
  const inProgress = COURSES.filter((c) => c.moduleId && c.status === "live")
    .map((c) => {
      const lessons = liveLessons(c.moduleId!);
      const done = lessons.filter((l) => completed.has(l.lesson.id)).length;
      return {
        course: c,
        done,
        total: lessons.length,
        next: lessons.find((l) => !completed.has(l.lesson.id)),
      };
    })
    .filter((c) => c.done > 0 && c.done < c.total)
    .sort((a, b) => b.done - a.done)[0];
  const resumeId = inProgress?.next?.lesson.id;
  const resumeLesson = resumeId ? getLesson(resumeId) : undefined;

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        <header className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Courses
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Short lessons, one idea each, on real NFL data. SQL first — it is
            the one every analytics job actually asks for.
          </p>
        </header>

        {hydrated && inProgress && resumeLesson && resumeId && (
          <section className="surface mt-6 rounded-2xl border border-turf/40 bg-turf/5 p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-turf">
                  Pick up where you left off · {inProgress.course.title}
                </p>
                <p className="mt-1 font-display text-xl font-bold text-ink">
                  {resumeLesson.lesson.title}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {inProgress.done}/{inProgress.total} lessons done
                </p>
              </div>
              <Link href={`/learn/${resumeId}`} className="press btn-turf">
                Continue
              </Link>
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} completed={completed} />
          ))}
        </div>

        {hydrated && (
          <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            {allDone}/{allLessons.length} lessons cleared across every course
            {" · "}
            <Link href="/achievements" className="text-gold hover:underline">
              Hall of Fame →
            </Link>
          </p>
        )}
      </main>
    </>
  );
}
