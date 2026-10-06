import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import DraftRoom from "@/components/draft-room";
import { FINISH_LABEL, parseResult } from "@/lib/draft-sim";

type Props = { searchParams: { r?: string } };

const TITLE = "The Draft Room — DataDraft";
const DESCRIPTION =
  "Draft a real fantasy season with SQL as your scouting department, then watch it play out with the points that actually happened.";

/**
 * A shared link carries the sharer's result (`?r=2025-abc12x-4-11-3-1742-C`):
 * the season, the seed and slot (so a friend gets the same bots), and the
 * record to beat, which the preview card shows.
 */
export function generateMetadata({ searchParams }: Props): Metadata {
  const result = parseResult(searchParams.r);
  const image = result ? `/api/og/draft?r=${searchParams.r}` : "/api/og/draft";
  const title = result
    ? `${result.w}–${result.l}, ${FINISH_LABEL[result.finish].toLowerCase()}. Beat my ${result.season} draft.`
    : TITLE;
  return {
    title,
    description: DESCRIPTION,
    // Keep ?r= on a challenge's og:url, or Facebook previews the bare page.
    openGraph: {
      title,
      description: DESCRIPTION,
      url: result ? `/draft?r=${searchParams.r}` : "/draft",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION, images: [image] },
  };
}

export default function DraftPage({ searchParams }: Props) {
  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <DraftRoom challenge={parseResult(searchParams.r)} />
      </main>
    </>
  );
}
