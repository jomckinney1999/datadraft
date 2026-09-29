"use client";

/**
 * /learn — pick the job title you want, get an auto-built Duolingo-style path.
 * Course grid stays as a secondary "browse one skill" escape hatch.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSES, type Course } from "@/lib/courses";
import { CAREER_ROLES, pathSteps, buildBoard } from "@/lib/career-paths";
import RolePathCard from "@/components/role-path-card";
import { liveLessons, ALL_MODULE } from "@/lib/curriculum";
import { loadProgress, type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import { useCareerRole } from "@/lib/use-career-role";
import { useLearnMode } from "@/lib/use-learn-mode";
import TrophyCase from "@/components/trophy-case";
import HomeLink from "@/components/home-link";
import Coach from "@/components/coach";
import CourseArt from "@/components/course-art";
import CourseCover from "@/components/course-cover";
import LearnStatusChips from "@/components/learn-status-chips";

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
  const accentText = course.accent === "turf" ? "text-turf" : "text-gold";
  const accentBorder =
    course.accent === "turf" ? "hover:border-turf/60" : "hover:border-gold/60";

  const body = (
    <>
      <div className="relative overflow-hidden border-b border-panel-border bg-night">
        <CourseCover
          id={course.id}
          accent={course.accent}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="cover-scrim pointer-events-none absolute inset-0" />
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
        <div className="relative flex min-h-[120px] flex-col items-center justify-center px-5 pb-5 pt-2 text-center">
          <CourseArt
            id={course.id}
            className={`h-[60px] w-full max-w-[160px] ${accentText}`}
          />
          <h3 className="mt-2 font-display text-base font-bold uppercase leading-tight tracking-tight text-pop">
            {course.title}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex-1 text-sm leading-relaxed text-ink-soft">
          {course.blurb}
        </p>
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

export default function LearnCatalogPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const { roleId, setRoleId } = useCareerRole();
  const { mode, hydrated: modeReady } = useLearnMode();

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const completed = new Set(progress.completedLessons);
  const allLessons = liveLessons(ALL_MODULE);
  const allDone = allLessons.filter((e) => completed.has(e.lesson.id)).length;
  const savedRole = CAREER_ROLES.find((r) => r.id === roleId);
  const resume = savedRole
    ? buildBoard(savedRole, progress.completedLessons).current
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <HomeLink label="learn" />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {progress.username && (
            <span className="hidden border border-gold/40 bg-gold/5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-gold lg:inline">
              GM · {progress.username}
            </span>
          )}
          <LearnStatusChips progress={progress} />
          <Link
            href="/account"
            className="status-chip hover:border-turf/50 hover:text-turf"
          >
            Account
          </Link>
        </div>
      </header>

      {savedRole && (
        <section className="section-card">
          <p className="label-broadcast text-turf">your board</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                You&apos;re on the {savedRole.title} board
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                {resume
                  ? `Next snap: ${resume.lesson.title}.`
                  : "Pick up where you left off."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={
                  !modeReady || mode === null || mode === "studio"
                    ? `/learn/path/${savedRole.id}?style=choose`
                    : resume
                      ? `/learn/${resume.lesson.id}`
                      : `/learn/path/${savedRole.id}`
                }
                className="btn-turf inline-flex items-center rounded-xl border border-turf/80 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
              >
                Continue
              </Link>
              <Link
                href={`/learn/path/${savedRole.id}?style=choose`}
                className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-soft hover:border-ice/40 hover:text-ice"
              >
                Change style
              </Link>
              <button
                type="button"
                onClick={() => setRoleId(null)}
                className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-soft hover:border-turf/40"
              >
                Switch job
              </button>
            </div>
          </div>
        </section>
      )}

      {!savedRole && (
        <>
          <section className="section-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-broadcast text-turf">one question</p>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                  What job are you playing for?
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
                  Pick a title. Practice snaps open next. Video and Colab
                  are coming soon.
                </p>
              </div>
              <div className="hidden shrink-0 sm:block">
                <Coach mood={allDone > 0 ? "happy" : "idle"} size={100} />
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_ROLES.map((role, i) => {
              const steps = pathSteps(role, progress.completedLessons);
              const href = `/learn/path/${role.id}?style=choose`;
              return (
                <RolePathCard
                  key={role.id}
                  role={role}
                  steps={steps}
                  index={i}
                  href={href}
                />
              );
            })}
          </div>
        </>
      )}

      <details className="section-card mt-8">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-widest text-ink-muted">
          Courses, project, trophies
        </summary>
        <div className="mt-4">
        <ul className="mt-2 divide-y divide-panel-border border-t border-panel-border">
          {[
            { href: "/learn/project/my-league-scorecard", name: "Your League Scorecard", note: "your data, in Colab" },
            { href: "/resources", name: "Career kit", note: "resumes · outreach · books" },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex items-center justify-between gap-3 py-2.5"
              >
                <span className="font-display text-[15px] font-bold text-ink transition-colors group-hover:text-turf">
                  {l.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  {l.note}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 font-display text-lg font-bold text-ink">Courses</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} completed={completed} />
          ))}
        </div>

        <div id="trophies" className="mt-8">
          <TrophyCase />
        </div>
        </div>
      </details>
    </main>
  );
}
