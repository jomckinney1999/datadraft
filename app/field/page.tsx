import type { Metadata } from "next";
import Link from "next/link";
import FieldSandbox from "@/components/field-sandbox";
import AppNav from "@/components/app-nav";

export const metadata: Metadata = {
  title: "The Practice Field — DataDraft",
  description:
    "A free SQL sandbox loaded with real NFL data. Practice on the field like players do — no grades, no limits, just reps.",
};

export default function FieldPage() {
  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link
            href="/excel"
            className="status-chip hover:border-ice/50 hover:text-ice"
          >
            Spreadsheet
          </Link>
        </div>

        <div className="mb-6 max-w-2xl">
          <p className="label-broadcast text-gold">open practice · no refs</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">
            The Practice Field
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Real NFL stat sheets, a live SQL engine, and nothing on the line.
            This is where players get their reps between lessons — run the
            drills from the drill book, or freelance and chase your own
            questions. Data: free, community-maintained nflverse stats. Never
            watch football? Doesn&apos;t matter — out here it&apos;s just rows
            and columns with better storylines.
          </p>
        </div>

        <FieldSandbox />
      </main>
    </>
  );
}
