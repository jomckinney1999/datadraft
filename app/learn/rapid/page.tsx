import type { Metadata } from "next";
import RapidPageClient from "./client";
import { rapidBankCounts } from "@/lib/rapid-deck";

export const metadata: Metadata = {
  title: "Rapid Fire — DataDraft",
  description:
    "Non-linear practice snaps by language. SQL, Python, Excel, and more — shuffled questions, tickets for hits, no timeouts.",
};

export default function RapidPage() {
  // Counted here so the picker can say how many snaps each language has
  // without the page bundling the curriculum to count them.
  return <RapidPageClient counts={rapidBankCounts()} />;
}
