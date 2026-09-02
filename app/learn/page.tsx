"use client";

// The course catalog: every course as a card you can browse, replacing the
// old module dropdown. Cards for courses with lessons link into their roadmap
// (/learn/track/[moduleId]); the rest are honestly marked "In build".

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSES, ALL_IN_ONE, type Course } from "@/lib/courses";
import { liveLessons, ALL_MODULE } from "@/lib/curriculum";
import { loadProgress, displayStreak, type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import TrophyCase from "@/components/trophy-case";
import HomeLink from "@/components/home-link";
import Coach from "@/components/coach";
import CourseArt from "@/components/course-art";
import CourseCover from "@/components/course-cover";
import ThemeToggle from "@/components/theme-toggle";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

/** Lessons actually built for this course right now. */
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
  const accentText = course.accent === "turf" ? "text-turf" : "text-gold";
  const accentBorder =
    course.accent === "turf" ? "hover:border-turf/60" : "hover:border-gold/60";

  const body = (
    <>
      {/* thumbnail — a cover scene unique to this course, then the scrim,
          broadcast rays and course mark on top. See components/course-cover. */}
      <div className="relative overflow-hidden border-b border-panel-border bg-night">
        <CourseCover
          id={course.id}
          accent={course.accent}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="cover-scrim pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${
            course.accent === "turf" ? "rays-turf" : "rays-gold"
          } opacity-[0.07]`}
        />
        <div className="relative flex items-center justify-between px-4 pt-4">
          <span className="inline-flex items-center gap-1.5 border border-panel-border bg-panel/80 px-2 py-1 font-mono text-[10px] text-ink-soft">
            <ClockIcon />
            {course.hours}h
          </span>
          <span className="inline-flex items-center gap-1.5 border border-panel-border bg-panel/80 px-2 py-1 font-mono text-[10px] text-ink-soft">
            <FlameIcon />
            {course.lessons * 10}
          </span>
        </div>
        <div className="relative flex min-h-[152px] flex-col items-center justify-center px-5 pb-5 pt-2 text-center">
          <CourseArt
            id={course.id}
            className={`h-[74px] w-full max-w-[190px] ${accentText}`}
          />
          <h3 className="mt-2 font-display text-lg font-bold uppercase leading-tight tracking-tight text-pop">
            {course.title}
          </h3>
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-3 divide-x divide-panel-border border-b border-panel-border bg-panel/60 text-center">
        <span className="px-1 py-2 font-mono text-[10px] text-ink-muted">
          <span className={accentText}>{course.lessons}</span> Lessons
        </span>
        <span className="px-1 py-2 font-mono text-[10px] text-ink-muted">
          <span className={accentText}>{course.projects}</span> Project
          {course.projects === 1 ? "" : "s"}
        </span>
        <span className="px-1 py-2 font-mono text-[10px] text-ink-muted">
          {isLive ? (
            <>
              <span className={accentText}>{built}</span> Live
            </>
          ) : (
            <span className="text-gold">In build</span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex-1 text-sm leading-relaxed text-ink-soft">
          {course.blurb}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {course.level}
          </span>
          {course.liveCode && (
            <span className="border border-turf/40 bg-turf/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-turf">
              Runs your code
            </span>
          )}
          {isLive && done > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-gold">
              {done}/{built} done
            </span>
          )}
        </div>

        <span
          className={`mt-4 block border px-4 py-2.5 text-center font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
            isLive
              ? "border-turf bg-turf text-night group-hover:bg-turf-dim"
              : "cursor-default border-panel-border bg-panel text-ink-muted"
          }`}
        >
          {isLive ? "Learn More →" : "Coming soon"}
        </span>
      </div>
    </>
  );

  const shell = `group lift flex flex-col border border-panel-border bg-panel ${
    isLive ? accentBorder : "opacity-75"
  }`;

  if (!isLive || !course.moduleId) {
    return (
      <div className={shell} aria-label={`${course.title} — in build`}>
        {body}
      </div>
    );
  }

  return (
    <Link href={`/learn/track/${course.moduleId}`} className={shell}>
      {body}
    </Link>
  );
}

export default function LearnCatalogPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const completed = new Set(progress.completedLessons);
  const allLessons = liveLessons(ALL_MODULE);
  const allDone = allLessons.filter((e) => completed.has(e.lesson.id)).length;
  const streak = displayStreak(progress);
  const liveCourses = COURSES.filter((c) => c.status === "live").length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <HomeLink label="learn" />
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
          <Link
            href="/interview"
            className="hidden border border-panel-border bg-panel/70 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/40 hover:text-gold md:inline"
          >
            AI Interview
          </Link>
          <Link
            href="/account"
            className="border border-panel-border bg-panel/70 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/40 hover:text-turf"
          >
            Account
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

      <section className="border border-panel-border bg-panel/80 p-6 shadow-scoreboard">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-broadcast text-turf">the course board</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Pick your course.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              {liveCourses} courses open now, more in build. Take one on its
              own, or run the all-in-one pathway in order. Progress carries
              across every course either way.
            </p>
            <p className="mt-2 max-w-xl font-mono text-[11px] leading-relaxed text-ink-muted">
              No football knowledge required — the sport is just the dataset,
              and Coach explains any context as you go.
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <Coach mood={allDone > 0 ? "happy" : "idle"} size={110} />
          </div>
        </div>

        <Link
          href={`/learn/track/${ALL_IN_ONE.moduleId}`}
          className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-gold/50 bg-gold/10 px-5 py-4 transition-colors hover:bg-gold/20"
        >
          <span>
            <span className="block font-display text-base font-bold text-ink">
              🏈 {ALL_IN_ONE.title}
            </span>
            <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">
              {ALL_IN_ONE.blurb}
            </span>
          </span>
          <span className="shrink-0 font-mono text-xs font-semibold uppercase tracking-widest text-gold">
            {allDone}/{allLessons.length} · Start →
          </span>
        </Link>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((course, i) => (
          <div
            key={course.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
          >
            <CourseCard course={course} completed={completed} />
          </div>
        ))}
      </div>

      <TrophyCase />

      <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Lesson counts show the full syllabus · &ldquo;Live&rdquo; is what&apos;s
        playable today
      </p>
    </main>
  );
}
