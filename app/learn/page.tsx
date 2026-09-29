"use client";

/**
 * /learn — pick the job title you want, get an auto-built Duolingo-style path.
 * Course grid stays as a secondary "browse one skill" escape hatch.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COURSES, type Course } from "@/lib/courses";
import { CAREER_ROLES, pathSteps } from "@/lib/career-paths";
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
import LearnModePicker from "@/components/learn-mode-picker";
import TestingTools from "@/components/testing-tools";
import StreakNudge from "@/components/streak-nudge";
import { StudioCoursePicker } from "@/components/studio-player";

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
  const { roleId, setRoleId, hydrated } = useCareerRole();
  const { mode, setMode, hydrated: modeHydrated } = useLearnMode();
  const router = useRouter();

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Resume last path once hydrated — only in snaps mode.
  useEffect(() => {
    if (hydrated && modeHydrated && mode === "drills" && roleId) {
      router.replace(`/learn/path/${roleId}`);
    }
  }, [hydrated, modeHydrated, mode, roleId, router]);

  const completed = new Set(progress.completedLessons);
  const allLessons = liveLessons(ALL_MODULE);
  const allDone = allLessons.filter((e) => completed.has(e.lesson.id)).length;

  if (hydrated && modeHydrated && mode === "drills" && roleId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          Loading your board…
        </p>
      </main>
    );
  }

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
          <LearnStatusChips progress={progress} trophiesHref="#trophies" />
          <Link
            href="/field"
            className="hidden status-chip hover:border-turf/50 hover:text-turf sm:inline-flex"
          >
            SQL Field
          </Link>
          <Link
            href="/excel"
            className="hidden status-chip hover:border-ice/50 hover:text-ice sm:inline-flex"
          >
            Spreadsheet
          </Link>
          <Link
            href="/resources"
            className="status-chip hover:border-turf/50 hover:text-turf"
          >
            Resources
          </Link>
          <Link
            href="/account"
            className="status-chip hover:border-turf/50 hover:text-turf"
          >
            Account
          </Link>
        </div>
      </header>

      <LearnModePicker
        mode={mode}
        onPick={(next) => {
          setMode(next);
          if (next === "studio") {
            router.push("/learn/studio");
          }
        }}
      />

      {mode === "studio" && (
        <section className="mt-8">
          <p className="label-broadcast text-ice">studio courses</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">
            Pick a watch-along course
          </h2>
          <div className="mt-4">
            <StudioCoursePicker />
          </div>
        </section>
      )}

      {(mode === "drills" || mode === null) && (
        <>
          <section className="section-card mt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-broadcast text-turf">draft your path</p>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                  What job are you playing for?
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
                  Pick a title. We build the course formula and put it on a
                  Duolingo-style board — clear courses in order, see exactly
                  where you are.
                </p>
              </div>
              <div className="hidden shrink-0 sm:block">
                <Coach mood={allDone > 0 ? "happy" : "idle"} size={100} />
              </div>
            </div>
          </section>

          <StreakNudge progress={progress} />

          <section className="surface mt-6 overflow-hidden border border-gold/35 bg-panel">
            <div className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0 max-w-xl">
                <p className="label-broadcast text-gold">rapid fire</p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">
                  Non-linear practice snaps
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Pick SQL, Python, Excel, and more — shuffled questions from
                  the real curriculum, 12 seconds each, tickets for hits. No
                  path order, no timeouts.
                </p>
              </div>
              <Link href="/learn/rapid" className="btn-gold shrink-0">
                Start Rapid Fire →
              </Link>
            </div>
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_ROLES.map((role, i) => (
              <RolePathCard
                key={role.id}
                role={role}
                steps={pathSteps(role, progress.completedLessons)}
                index={i}
                onSelect={() => {
                  setMode("drills");
                  setRoleId(role.id);
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-8 max-w-md">
        <TestingTools />
      </div>

      <section className="surface mt-8 border border-gold/30 bg-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-xl">
            <p className="label-broadcast text-gold">portfolio project</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Your League Scorecard
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Export your real fantasy league (Sleeper is one click), load it
              into SQL in Google Colab, and answer the questions managers argue
              about every week.
            </p>
          </div>
          <Link
            href="/learn/project/my-league-scorecard"
            className="btn-gold shrink-0"
          >
            Start project →
          </Link>
        </div>
      </section>

      <section className="surface mt-4 border border-panel-border bg-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-xl">
            <p className="label-broadcast text-ice">career kit</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Resumes, outreach &amp; books
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Sample resume outlines for your roadmap, job-hunt tactics (yes —
              including The 2-Hour Job Search), and a short reading list.
            </p>
          </div>
          <Link
            href="/resources"
            className="shrink-0 rounded-2xl border-2 border-ice/50 border-b-4 bg-ice/10 px-5 py-3.5 font-mono text-[12px] font-bold uppercase tracking-wider text-ice transition-colors hover:bg-ice/20"
          >
            Open resources →
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-broadcast text-ink-muted">or browse one skill</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Individual courses
            </h2>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course, i) => (
            <div
              key={course.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
            >
              <CourseCard course={course} completed={completed} />
            </div>
          ))}
        </div>
      </section>

      <div id="trophies">
        <TrophyCase />
      </div>

      <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Building courses still appear on your board — locked until they ship
      </p>
    </main>
  );
}
