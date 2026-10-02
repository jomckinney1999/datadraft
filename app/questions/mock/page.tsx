import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import MockInterview from "@/components/mock-interview";

export const metadata: Metadata = {
  title: "Mock SQL screens — DataDraft",
  description:
    "Timed SQL screens like the first technical round for an analyst job: a clock, unseen questions, no hints — and a report afterwards that shows what went wrong.",
};

export default function MockPage() {
  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <MockInterview />
      </main>
    </>
  );
}
