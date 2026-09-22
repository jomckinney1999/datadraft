import type { Metadata } from "next";
import Link from "next/link";
import ExcelSandbox from "@/components/excel-sandbox";
import HomeLink from "@/components/home-link";

export const metadata: Metadata = {
  title: "The Spreadsheet — DataDraft",
  description:
    "A live Excel-style workbook in your browser. Practice real formulas on fantasy roster data — formula bar, sheet tabs, no install.",
};

export default function ExcelPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <HomeLink label="spreadsheet" back="/learn" backLabel="all courses" />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/field"
            className="status-chip hover:border-turf/50 hover:text-turf"
          >
            SQL Field
          </Link>
          <Link
            href="/learn/track/excel"
            className="border border-turf/50 bg-turf/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors hover:border-turf hover:bg-turf/20"
          >
            Excel lessons
          </Link>
        </div>
      </header>

      <div className="mb-6 max-w-2xl">
        <p className="label-broadcast text-gold">open practice · real formulas</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          The Spreadsheet
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Feels like Excel: formula bar, sheet tabs, click a cell, press Enter.
          Roster and Import are the league data (read-only). Practice is your
          blank sheet — write{" "}
          <code className="font-mono text-turf">=SUM(Roster!E2:E17)</code> and
          watch it calculate. No install, no grade, just reps.
        </p>
      </div>

      <ExcelSandbox />
    </main>
  );
}
