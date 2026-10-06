import type { Metadata } from "next";
import QuestionBank from "@/components/question-bank";
import { leagueDay } from "@/lib/questions";

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
  return (
    <QuestionBank
      day={day}
      initialPattern={searchParams.pattern ?? null}
      initialData={searchParams.data ?? null}
    />
  );
}
