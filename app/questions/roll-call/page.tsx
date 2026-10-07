import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import RollCall from "@/components/roll-call";
import { leagueDay } from "@/lib/league-day";
import { rollCallFor, rollCallRoster } from "@/lib/roll-call";

const TITLE = "Roll Call — name every player · DataDraft";
const DESCRIPTION =
  "A daily NFL list game on real weekly stats: name every player on the list, three strikes. Then see the SQL, pandas, R and Excel that make the list.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/questions/roll-call" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/questions/roll-call" },
};

// The list changes at midnight Eastern, so the page is rendered per request
// rather than cached for an hour across the turn of the day. Picking it is a
// filter over one season of rows: cheap.
export const dynamic = "force-dynamic";

export default function RollCallPage() {
  // Resolved on the server, never in the browser, so everyone gets the same list.
  const day = leagueDay();
  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <RollCall puzzle={rollCallFor(day)} roster={rollCallRoster()} />
      </main>
    </>
  );
}
