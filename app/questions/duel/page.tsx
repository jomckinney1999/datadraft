import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import StatDuel from "@/components/stat-duel";
import { leagueDay, questionOfTheDay } from "@/lib/questions";
import { dailyDuel } from "@/lib/stat-duel";
import { parseDuelResult } from "@/lib/daily-share";

type Props = { searchParams: { r?: string } };

const TITLE = "Stat Duel — DataDraft";
const DESCRIPTION =
  "Five head-to-head questions on real NFL numbers, every day. Pick who had more, then see the SQL that proves it.";

/**
 * A shared link carries the sharer's result (`?r=1-GGRGG`), so its preview
 * card shows the score to beat; a bare link previews today's first matchup.
 * Reading the link makes this page render per request, which is cheap — the
 * duel is a few milliseconds of arithmetic over pinned data.
 */
export function generateMetadata({ searchParams }: Props): Metadata {
  const result = parseDuelResult(searchParams.r);
  const image = result ? `/api/og/duel?r=${searchParams.r}` : `/api/og/duel?d=${leagueDay()}`;
  const title = result ? `Stat Duel #${result.number}: ${result.score}/5. Can you beat it?` : TITLE;
  return {
    title,
    description: DESCRIPTION,
    openGraph: { title, description: DESCRIPTION, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION, images: [image] },
  };
}

export default function DuelPage({ searchParams }: Props) {
  // Resolved on the server, never in the browser, so every visitor and the
  // server agree on today's five.
  const day = leagueDay();
  const duel = dailyDuel(day);
  const qotd = questionOfTheDay(day, "sql");
  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <StatDuel duel={duel} qotdId={qotd.id} challenge={parseDuelResult(searchParams.r)} />
      </main>
    </>
  );
}
