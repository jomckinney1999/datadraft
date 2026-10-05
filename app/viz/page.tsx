import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import VizLab from "@/components/viz-lab";

export const metadata: Metadata = {
  title: "Viz Builder — DataDraft",
  description:
    "A Tableau-style chart builder in your browser: dimensions and measures, shelves, marks and filters, on real NFL fantasy data. No install.",
};

export default function VizPage() {
  return (
    <>
      <AppNav back="/learn" backLabel="all courses" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link href="/dax" className="status-chip hover:border-gold/50 hover:text-gold">
            DAX Lab
          </Link>
          <Link
            href="/learn/track/tableau"
            className="status-chip border-turf/50 bg-turf/10 text-turf hover:border-turf hover:bg-turf/20"
          >
            Tableau lessons
          </Link>
        </div>
        <div className="mb-6 max-w-2xl">
          <p className="label-broadcast text-gold">open practice · tableau-style</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">The Viz Builder</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Blue fields slice the view, green fields add up. Put them on Columns and Rows, pick a mark, filter and
            sort, the way you would in Tableau. Every view shows the SQL it runs underneath. No install, no grade.
          </p>
        </div>
        <VizLab />
      </main>
    </>
  );
}
