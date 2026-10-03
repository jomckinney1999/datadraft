import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import DataChallenge from "@/components/data-challenge";

export const metadata: Metadata = {
  title: "Data Challenge — DataDraft",
  description:
    "A take-home on messy data: clean it, join it, recommend five markets, show your math, then mark yourself against a rubric.",
};

export default function DataChallengePage() {
  return (
    <>
      <AppNav back="/projects" backLabel="all projects" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <DataChallenge />
      </main>
    </>
  );
}
