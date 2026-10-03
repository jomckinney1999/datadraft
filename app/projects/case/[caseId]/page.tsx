import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInterviewCase, INTERVIEW_CASES } from "@/lib/interview-cases";
import InterviewWorkspace from "@/components/interview-workspace";
import PassGate from "@/components/pass-gate";
import { FREE_ALLOWANCE } from "@/lib/season-pass";

export function generateStaticParams() {
  return INTERVIEW_CASES.map((c) => ({ caseId: c.id }));
}

export function generateMetadata({
  params,
}: {
  params: { caseId: string };
}): Metadata {
  const c = getInterviewCase(params.caseId);
  return {
    title: c ? `${c.title} — Case — DataDraft` : "Case — DataDraft",
    description: c?.blurb,
  };
}

export default function ProjectCasePage({
  params,
}: {
  params: { caseId: string };
}) {
  const interviewCase = getInterviewCase(params.caseId);
  if (!interviewCase) notFound();
  // The first case is free; the rest are the Season Pass (a no-op until the
  // paywall is on). Allowance in lib/season-pass.ts.
  const free = INTERVIEW_CASES.slice(0, FREE_ALLOWANCE.cases).some((c) => c.id === interviewCase.id);
  return (
    <PassGate free={free} moment="case" backHref="/projects" backLabel="All projects" title={interviewCase.title}>
      <InterviewWorkspace interviewCase={interviewCase} />
    </PassGate>
  );
}
