import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuestionWorkspace from "@/components/question-workspace";
import { QUESTIONS, getQuestion } from "@/lib/questions";
import { workspaceProps } from "@/lib/question-page";

export const revalidate = 3600;

export function generateStaticParams() {
  return QUESTIONS.map((q) => ({ questionId: q.id }));
}

export function generateMetadata({
  params,
}: {
  params: { questionId: string };
}): Metadata {
  const q = getQuestion(params.questionId);
  if (!q) return { title: "Question — DataDraft" };
  const title = `${q.title} — DataDraft`;
  // The preview card shows the question itself, so a shared link reads as
  // a challenge rather than as the front page.
  const image = `/api/og/card?${new URLSearchParams({
    kind: "question",
    t: q.title,
    d: q.difficulty,
    l: q.lang,
    s: q.prompt.slice(0, 150),
  })}`;
  return {
    title,
    description: q.prompt,
    openGraph: { title, description: q.prompt, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: q.prompt, images: [image] },
  };
}

export default function QuestionPage({
  params,
}: {
  params: { questionId: string };
}) {
  const question = getQuestion(params.questionId);
  if (!question) notFound();
  return <QuestionWorkspace {...workspaceProps(question)} />;
}
