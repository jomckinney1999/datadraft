/**
 * A daily-question challenge: /questions/who-improved/vs/7-2 is "a friend
 * solved Daily SQL #7 in 2 tries". It's the question's own workspace with the
 * friend's score on it, and a link preview that shows the score and the
 * squares instead of the plain question card. That preview is what makes a
 * pasted result spread, the way the Stat Duel's does.
 *
 * The result lives in the path, not the query string, so the question pages
 * stay pre-built and hourly-cached: reading ?r= there would turn every one of
 * them into a per-request render. The code is the daily number and the try
 * count, nothing about the answer. Not indexed: it's the same question as
 * /questions/<id>, which is the page search should know.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuestionWorkspace from "@/components/question-workspace";
import { LANG_LABEL, getQuestion } from "@/lib/questions";
import { workspaceProps } from "@/lib/question-page";
import { parseDailyResult } from "@/lib/daily-share";

export const revalidate = 3600;

type Params = { questionId: string; code: string };

export function generateMetadata({ params }: { params: Params }): Metadata {
  const q = getQuestion(params.questionId);
  const result = parseDailyResult(params.code);
  if (!q || !result) return { title: "Question — DataDraft", robots: { index: false } };
  const lang = LANG_LABEL[q.lang];
  const solved = `solved in ${result.tries} ${result.tries === 1 ? "try" : "tries"}`;
  const title = `Daily ${lang} #${result.number} · ${solved} — DataDraft`;
  const description = `Can you do it in fewer? ${q.title}: one ${lang} answer on real NFL data.`;
  const image = `/api/og/card?${new URLSearchParams({
    kind: "daily",
    n: String(result.number),
    k: String(result.tries),
    t: q.title,
    d: q.difficulty,
    l: q.lang,
  })}`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function ChallengePage({ params }: { params: Params }) {
  const question = getQuestion(params.questionId);
  if (!question) notFound();
  return <QuestionWorkspace {...workspaceProps(question)} challenge={parseDailyResult(params.code)} />;
}
