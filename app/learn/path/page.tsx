"use client";

/**
 * /learn/path — pick a career board. Distinct from /learn (which also lists
 * individual courses) and from /learn/path/[roleId] (one board).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CAREER_ROLES, pathSteps, roleHours } from "@/lib/career-paths";
import { loadProgress, type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import { useCareerRole } from "@/lib/use-career-role";
import HomeLink from "@/components/home-link";
import LearnStatusChips from "@/components/learn-status-chips";
import TestingTools from "@/components/testing-tools";
import Coach from "@/components/coach";

export default function CareerPathPickerPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const { setRoleId } = useCareerRole();

  useEffect(() => {
    // Clear the stored role so /learn doesn't bounce you back onto one board
    // when you meant to pick again.
    setRoleId(null);
    setProgress(loadProgress());
  }, [setRoleId]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <HomeLink label="career paths" back="/learn" backLabel="learn" />
        <LearnStatusChips progress={progress} />
      </header>

      <section className="section-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-broadcast text-turf">pick your path</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              What job are you playing for?
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Each path is a Duolingo-style board — courses in order, every
              lesson on one continuous track. Pick a title to open it.
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <Coach mood="idle" size={100} />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAREER_ROLES.map((role, i) => {
          const steps = pathSteps(role, progress.completedLessons);
          const live = steps.filter(
            (s) => s.course.status === "live" && s.total > 0,
          );
          const cleared = live.filter((s) => s.complete).length;
          return (
            <Link
              key={role.id}
              href={`/learn/path/${role.id}`}
              onClick={() => setRoleId(role.id)}
              style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
              className="section-card lift animate-fade-up group block transition-colors hover:border-turf/50"
            >
              <p className="label-broadcast text-gold">
                ~{roleHours(role)}h formula
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-ink group-hover:text-turf">
                {role.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {role.blurb}
              </p>
              <ol className="mt-3 flex flex-wrap gap-1.5">
                {steps.map((s, idx) => (
                  <li
                    key={s.course.id}
                    className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      s.complete
                        ? "border-turf/50 bg-turf/15 text-turf"
                        : s.course.status === "building"
                          ? "border-panel-border text-ink-muted"
                          : "border-panel-border text-ink-soft"
                    }`}
                  >
                    {idx + 1}. {s.course.mark}
                    {s.course.status === "building" ? " · soon" : ""}
                  </li>
                ))}
              </ol>
              <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf">
                {cleared > 0
                  ? `${cleared}/${live.length} cleared · Open board →`
                  : "Open board →"}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 max-w-md">
        <TestingTools />
      </div>

      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Prefer one skill at a time?{" "}
        <Link href="/learn" className="text-turf underline-offset-2 hover:underline">
          Browse courses
        </Link>
      </p>
    </main>
  );
}
