import type { Metadata } from "next";
import QuestionBank, { type BankItem, type BankPattern } from "@/components/question-bank";
import { QUESTIONS, leagueDay, questionOfTheDay, type Question, type QuestionLang } from "@/lib/questions";
import { PATTERNS, questionsFor } from "@/lib/interview-patterns";

const LANGS: QuestionLang[] = ["sql", "python", "r", "excel"];

/** The day's card shows the question, never its key, prelude or hints. */
function forCard(q: Question): Question {
  return { ...q, expected: "", setup: undefined, starter: undefined, hint: "", explain: "" };
}

export const metadata: Metadata = {
  title: "Questions — DataDraft",
  description:
    "LeetCode-style SQL, Python, R and Excel problems on real NFL data and real play-by-play, plus practice databases for the store and app schemas interviews use. A new Question of the Day in every language."
};

// The day's question changes at midnight Eastern, so the page can't be baked
// at build time and it can't be baked for longer than that either. An hourly
// revalidate is a cheap way to be at most an hour stale at the boundary
// without rendering this per request.
export const revalidate = 3600;

type Props = { searchParams: { pattern?: string; data?: string } };

export default function QuestionsPage({ searchParams }: Props) {
  const day = leagueDay();
  // Worked out here and passed down, so the page's JavaScript carries a
  // list, not the bank (2026-10-06).
  const list: BankItem[] = QUESTIONS.map(({ id, title, lang, difficulty, tags, tables, art, prompt }) => ({
    id, title, lang, difficulty, tags, tables, art, prompt,
  }));
  const dailies = Object.fromEntries(LANGS.map((l) => [l, forCard(questionOfTheDay(day, l))])) as Record<QuestionLang, Question>;
  const patterns: BankPattern[] = PATTERNS.map((p) => ({ id: p.id, name: p.name, asks: p.asks, ids: questionsFor(p).map((q) => q.id) }));
  return (
    <QuestionBank
      day={day}
      list={list}
      dailies={dailies}
      patterns={patterns}
      initialPattern={searchParams.pattern ?? null}
      initialData={searchParams.data ?? null}
    />
  );
}
