import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInterviewCase, INTERVIEW_CASES } from "@/lib/interview-cases";
import InterviewWorkspace from "@/components/interview-workspace";

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
    title: c
      ? `${c.title} — Interview — DataDraft`
      : "Interview Case — DataDraft",
    description: c?.blurb,
  };
}

export default function InterviewCasePage({
  params,
}: {
  params: { caseId: string };
}) {
  const interviewCase = getInterviewCase(params.caseId);
  if (!interviewCase) notFound();
  return <InterviewWorkspace interviewCase={interviewCase} />;
}
