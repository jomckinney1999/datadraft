import type { Metadata } from "next";
import Dashboard from "@/components/dashboard";
import { getLiveWeek } from "@/lib/live-nfl";

export const metadata: Metadata = {
  title: "Dashboard — DataDraft",
  description:
    "Where you left off, what to do next, and what happened in the league this week.",
};

/**
 * Rebuilt hourly. The live panel parses a couple of megabytes of nflverse CSV
 * on the server, so it must not run per request — and an hour is far fresher
 * than a weekly NFL schedule needs.
 */
export const revalidate = 3600;

export default async function DashboardPage() {
  // Never throws: getLiveWeek returns null if nflverse is unreachable, and the
  // dashboard simply renders without the league panel.
  const live = await getLiveWeek();
  return <Dashboard live={live} />;
}
