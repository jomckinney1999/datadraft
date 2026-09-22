import type { Metadata } from "next";
import InterviewCatalog from "@/components/interview-catalog";

export const metadata: Metadata = {
  title: "Interview Cases — DataDraft",
  description:
    "Scripted data-analyst interview scenarios: business brief, schema, live SQL terminal, optional hints. Filter by Easy, Medium, or Hard.",
};

export default function InterviewPage() {
  return <InterviewCatalog />;
}
