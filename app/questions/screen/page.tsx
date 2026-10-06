import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import AnalystScreen from "@/components/analyst-screen";
import { screenPool } from "@/lib/screen-pool";

export const metadata: Metadata = {
  title: "Analyst Screen — DataDraft",
  description:
    "A timed online assessment for analyst jobs: SQL on real NFL data plus multiple choice on statistics, wrangling, types and A/B tests, with a report that explains every answer.",
};

export default function AnalystScreenPage() {
  return (
    <>
      <AppNav back="/questions/prep" backLabel="hiring prep" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <AnalystScreen pool={screenPool()} />
      </main>
    </>
  );
}
