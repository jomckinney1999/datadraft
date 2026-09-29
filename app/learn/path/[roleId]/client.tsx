"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getRole, pathSteps, buildBoard } from "@/lib/career-paths";
import { studioStartForCourseIds } from "@/lib/studio";
import { type Progress, EMPTY_PROGRESS } from "@/lib/progress";
import { loadEconomy } from "@/lib/economy";
import { useCareerRole } from "@/lib/use-career-role";
import { useLearnMode, type LearnMode } from "@/lib/use-learn-mode";
import CareerBoard from "@/components/career-board";
import LearnModePicker from "@/components/learn-mode-picker";
import LearnRail from "@/components/learn-rail";
import LearnStatusChips from "@/components/learn-status-chips";
import HomeLink from "@/components/home-link";

export default function CareerPathClient({ roleId }: { roleId: string }) {
  const role = getRole(roleId)!;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRoleId } = useCareerRole();
  const { mode, setMode, hydrated } = useLearnMode();
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const asking = searchParams.get("style") === "choose";

  useEffect(() => {
    setRoleId(role.id);
    setProgress(loadEconomy());
  }, [role.id, setRoleId]);

  const steps = pathSteps(role, progress.completedLessons);
  const { lessons, current } = buildBoard(role, progress.completedLessons);
  const liveSteps = steps.filter(
    (s) => s.course.status === "live" && s.total > 0,
  );
  const cleared = liveSteps.filter((s) => s.complete).length;
  const doneLessons = lessons.filter((l) =>
    progress.completedLessons.includes(l.lesson.id),
  ).length;
  const studioHref = studioStartForCourseIds(role.courseIds);
  const showPicker = asking || (hydrated && mode === null);

  function pickStyle(next: LearnMode) {
    setMode(next);
    if (next === "studio") {
      router.push(studioHref);
      return;
    }
    if (current && doneLessons === 0) {
      router.push(`/learn/${current.lesson.id}`);
      return;
    }
    router.replace(`/learn/path/${role.id}`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <HomeLink back="/learn/path" backLabel="all paths" />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <LearnStatusChips progress={progress} />
          <Link
            href={`/learn/path/${role.id}?style=choose`}
            className="status-chip hover:border-ice/50 hover:text-ice"
          >
            {mode === "studio" ? "Studio" : "Snaps"} · switch
          </Link>
          <Link
            href="/learn/rapid"
            className="status-chip hover:border-gold/50 hover:text-gold"
          >
            Rapid Fire
          </Link>
          <Link
            href="/learn/arcade"
            className="status-chip hover:border-gold/50 hover:text-gold"
          >
            Arcade
          </Link>
          <Link
            href="/learn/path"
            className="status-chip hover:border-turf/50 hover:text-turf"
            onClick={() => setRoleId(null)}
          >
            Switch path
          </Link>
        </div>
      </header>

      {showPicker && (
        <>
          <section className="section-card">
            <p className="label-broadcast text-turf">your path</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">
              {role.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              {role.blurb} Same courses either way. Pick how you want to
              learn them.
            </p>
          </section>
          <LearnModePicker
            mode={mode}
            onPick={pickStyle}
            studioHref={studioHref}
          />
        </>
      )}

      {hydrated && !showPicker && (
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <section className="section-card scorebug-card mb-6">
            <p className="label-broadcast text-turf">your formula</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              {role.title} path
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              {role.blurb} One continuous board — every lesson from each course
              in order. Clear a course and the next one starts on the same path.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                {doneLessons}/{lessons.length} plays · {cleared}/
                {liveSteps.length} courses
              </p>
              {current && (
                <Link
                  href={`/learn/${current.lesson.id}`}
                  className="btn-turf inline-flex rounded-xl border border-turf/80 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
                >
                  Continue · {current.lesson.title}
                </Link>
              )}
            </div>
          </section>

          <CareerBoard
            role={role}
            completedLessons={progress.completedLessons}
          />
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            <LearnRail progress={progress} onProgress={setProgress} quiet />
          </div>
        </div>
      </div>
      )}
    </main>
  );
}
