import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuestionWorkspace from "@/components/question-workspace";
import {
  QUESTIONS,
  getQuestion,
  isDailyQuestion,
  leagueDay,
  questionsIn,
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
  // "Next" stays inside the language you are already working in. Throwing
  // someone from a SQL question straight into a 30 MB R download because it
  // happened to be the next array entry is not a next question, it is a exit.
  const pool = questionsIn(question.lang);
  const index = pool.findIndex((q) => q.id === question.id);
  const next = pool[(index + 1) % pool.length];
  const prev = pool[(index - 1 + pool.length) % pool.length];

  return (
    <QuestionWorkspace
      question={question}
      isQotd={isDailyQuestion(day, question)}
      day={day}
      prevDay={previousDay(day)}
      nextId={next.id === question.id ? null : next.id}
      prevId={prev.id === question.id ? null : prev.id}
      position={index + 1}
      total={pool.length}
    />
  );
}
