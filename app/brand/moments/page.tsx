import type { Metadata } from "next";
import MomentsBench from "./moments-bench";

/**
 * The big moments, on demand: a button per stinger, so a change to one is
 * watched beside the others before it ships. Not linked from anywhere
 * (robots keeps crawlers out of /brand/), like Coach's model sheet.
 */
export const metadata: Metadata = {
  title: "Big moments — DataDraft",
  robots: { index: false, follow: false },
};

export default function MomentsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-ink">Big moments</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Full-screen stingers for a lesson finished, a unit cleared, a course cleared and a new rank. Any key or tap
        skips one. The real ones fire from the lesson player and the question workspace.
      </p>
      <MomentsBench />
    </main>
  );
}
