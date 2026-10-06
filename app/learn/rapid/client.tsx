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
import type { RapidLangId } from "@/lib/rapid-fire";

export default function RapidPageClient({
  counts,
}: {
  counts: Record<RapidLangId, number>;
}) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return (
    <>
      <AppNav back="/learn" backLabel="learn" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link
            href="/questions"
            className="status-chip hover:border-gold/50 hover:text-gold"
          >
            Question bank
          </Link>
        </div>

        <RapidFire onProgress={setProgress} counts={counts} />
      </main>
    </>
  );
}
