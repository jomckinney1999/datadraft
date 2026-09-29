import type { Metadata } from "next";
import RapidPageClient from "./client";

export const metadata: Metadata = {
  title: "Rapid Fire — DataDraft",
  description:
    "Non-linear practice snaps by language. SQL, Python, Excel, and more — shuffled questions, tickets for hits, no timeouts.",
};

export default function RapidPage() {
  return <RapidPageClient />;
}
