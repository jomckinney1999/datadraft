import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import StatDuel from "@/components/stat-duel";
import { leagueDay, questionOfTheDay } from "@/lib/questions";
import { dailyDuel } from "@/lib/stat-duel";

export const metadata: Metadata = {
  title: "Stat Duel — DataDraft",
  description:
    "Five head-to-head questions on real NFL numbers, every day. Pick who had more, then see the SQL that proves it.",
};

// Same clock as the Question of the Day: the duel turns over at midnight
// Eastern, so the page can't be baked for longer than an hour.
export const revalidate = 3600;

export default function DuelPage() {
  // Resolved on the server, never in the browser, so every visitor and the
  // server agree on today's five.
  const day = leagueDay();
  const duel = dailyDuel(day);
  const qotd = questionOfTheDay(day, "sql");
  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <StatDuel duel={duel} qotdId={qotd.id} />
      </main>
    </>
  );
}
