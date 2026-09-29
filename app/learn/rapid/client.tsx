"use client";

import { useState } from "react";
import Link from "next/link";
import AppNav from "@/components/app-nav";
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
    <>
      <AppNav back="/learn" backLabel="learn" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link
            href="/learn/studio"
            className="status-chip hover:border-ice/50 hover:text-ice"
          >
            Studio
          </Link>
        </div>

        <RapidFire onProgress={setProgress} />
      </main>
    </>
  );
}
