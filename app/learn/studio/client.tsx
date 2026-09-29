"use client";

import Link from "next/link";
import AppNav from "@/components/app-nav";
import { StudioCoursePicker } from "@/components/studio-player";
import { useLearnMode } from "@/lib/use-learn-mode";
import { useCareerRole } from "@/lib/use-career-role";

export default function StudioHubClient() {
  const { setMode } = useLearnMode();
  const { roleId } = useCareerRole();

  return (
    <>
      <AppNav back="/learn" backLabel="learn" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link
            href={roleId ? `/learn/path/${roleId}` : "/learn"}
            onClick={() => setMode("drills")}
            className="status-chip hover:border-turf/50 hover:text-turf"
          >
            Switch to snaps
          </Link>
        </div>

        <section className="section-card mb-6">
          <p className="label-broadcast text-ice">hands-on track</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Studio — watch &amp; work in Colab
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Udemy-style pacing: sidebar topics, a video stage, and a notebook you
            actually run. Videos fill in as we film them — Colab and the
            Spreadsheet are ready now. Prefer short graded snaps?{" "}
            <Link
              href={roleId ? `/learn/path/${roleId}` : "/learn"}
              onClick={() => setMode("drills")}
              className="text-turf underline underline-offset-2"
            >
              Switch to Practice snaps
            </Link>
            .
          </p>
        </section>

        <StudioCoursePicker />
      </main>
    </>
  );
}
