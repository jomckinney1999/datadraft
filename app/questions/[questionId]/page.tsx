import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuestionWorkspace from "@/components/question-workspace";
import {
  QUESTIONS,
  getQuestion,
  leagueDay,
  questionOfTheDay,
} from "@/lib/questions";

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
  return {
    title: `${q.title} — DataDraft`,
    description: q.prompt,
  };
}

/** The day before `day`, for the streak check. */
function previousDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function QuestionPage({
  params,
}: {
  params: { questionId: string };
}) {
  const question = getQuestion(params.questionId);
  if (!question) notFound();

  const day = leagueDay();
  const index = QUESTIONS.findIndex((q) => q.id === question.id);
  const next = QUESTIONS[(index + 1) % QUESTIONS.length];

  return (
    <QuestionWorkspace
      question={question}
      isQotd={questionOfTheDay(day).id === question.id}
      day={day}
      prevDay={previousDay(day)}
      nextId={next.id === question.id ? null : next.id}
    />
  );
}
