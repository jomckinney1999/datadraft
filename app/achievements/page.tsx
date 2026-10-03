import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import TrophyCase from "@/components/trophy-case";

export const metadata: Metadata = {
  title: "Hall of Fame — DataDraft",
  description:
    "Your trophies: twelve awards across three wings, earned from lessons, perfect drives and days in a row. No committee, no vote.",
};

/**
 * Achievements — the Hall of Fame as its own locker room page, not buried
 * under Courses. Same case as before; the dashboard links here the way a
 * game opens its trophy cabinet from the home screen.
 */
export default function AchievementsPage() {
  return (
    <>
      <AppNav back="/dashboard" backLabel="locker" />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <TrophyCase />
      </main>
    </>
  );
}
