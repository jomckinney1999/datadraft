import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import DaxLab from "@/components/dax-lab";

export const metadata: Metadata = {
  title: "DAX Lab — DataDraft",
  description:
    "Write Power BI DAX measures in your browser and watch a matrix evaluate them row by row, on real NFL fantasy data. CALCULATE, ALL, DIVIDE and the X iterators.",
};

export default function DaxPage() {
  return (
    <>
      <AppNav back="/learn" backLabel="all courses" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link href="/viz" className="status-chip hover:border-turf/50 hover:text-turf">
            Viz Builder
          </Link>
          <Link
            href="/learn/track/powerbi"
            className="status-chip border-turf/50 bg-turf/10 text-turf hover:border-turf hover:bg-turf/20"
          >
            Power BI lessons
          </Link>
        </div>
        <div className="mb-6 max-w-2xl">
          <p className="label-broadcast text-gold">open practice · power bi-style</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">The DAX Lab</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Write a measure and the matrix runs it once per row and once for the Total, the way a report does. One
            table, Results, with every real game in it. No install, no grade.
          </p>
        </div>
        <DaxLab />
      </main>
    </>
  );
}
