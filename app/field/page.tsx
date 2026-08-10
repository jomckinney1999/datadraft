import type { Metadata } from "next";
import Link from "next/link";
import FieldSandbox from "@/components/field-sandbox";

export const metadata: Metadata = {
  title: "The Practice Field — SQL Sports",
  description:
    "A free SQL sandbox loaded with real NFL data. Practice on the field like players do — no grades, no limits, just reps.",
};

export default function FieldPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          SQL<span className="text-turf">Sports</span>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            practice field
          </span>
        </Link>
        <Link
          href="/learn"
          className="border border-turf/50 bg-turf/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors hover:border-turf hover:bg-turf/20"
        >
          Back to lessons
        </Link>
      </header>

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
  );
}
