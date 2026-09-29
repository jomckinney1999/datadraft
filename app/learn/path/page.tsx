"use client";

/**
 * /learn/path — pick a career board. Distinct from /learn (which also lists
 * individual courses) and from /learn/path/[roleId] (one board).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CAREER_ROLES, pathSteps } from "@/lib/career-paths";
import { loadProgress, type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import { useCareerRole } from "@/lib/use-career-role";
import AppNav from "@/components/app-nav";
import RolePathCard from "@/components/role-path-card";
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
    <>
      <AppNav back="/learn" backLabel="learn" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        <section className="section-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-broadcast text-turf">pick your path</p>
              <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                What job are you playing for?
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
                Pick a title. Practice snaps are open. Video and Colab
                are coming soon.
              </p>
            </div>
            <div className="hidden shrink-0 sm:block">
              <Coach mood="idle" size={100} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAREER_ROLES.map((role, i) => (
            <RolePathCard
              key={role.id}
              role={role}
              steps={pathSteps(role, progress.completedLessons)}
              index={i}
            />
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          Prefer one skill at a time?{" "}
          <Link href="/learn" className="text-turf underline-offset-2 hover:underline">
            Browse courses
          </Link>
        </p>
      </main>
    </>
  );
}
