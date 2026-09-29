"use client";

import { useState } from "react";
import Link from "next/link";
import HomeLink from "@/components/home-link";
import LearnStatusChips from "@/components/learn-status-chips";
import RapidFire from "@/components/rapid-fire";
import {
  EMPTY_PROGRESS,
  loadProgress,
  type Progress,
} from "@/lib/progress";
import { useEffect } from "react";
import { useLearnMode } from "@/lib/use-learn-mode";

export default function RapidPageClient() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const { setMode } = useLearnMode();

  useEffect(() => {
    setProgress(loadProgress());
    setMode("drills");
  }, [setMode]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <HomeLink label="rapid fire" back="/learn" backLabel="learn" />
        <div className="flex flex-wrap items-center gap-2">
          <LearnStatusChips progress={progress} />
          <Link
            href="/learn/studio"
            className="status-chip hover:border-ice/50 hover:text-ice"
          >
            Studio
          </Link>
        </div>
      </header>

      <RapidFire onProgress={setProgress} />
    </main>
  );
}
