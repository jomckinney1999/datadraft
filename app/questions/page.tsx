import type { Metadata } from "next";
import QuestionBank from "@/components/question-bank";
import { leagueDay, questionOfTheDay } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Questions — DataDraft",
  description:
    "LeetCode-style SQL problems on real NFL data, plus a new Question of the Day every morning.",
};

// The day's question changes at midnight Eastern, so the page can't be baked
// at build time and it can't be baked for longer than that either. An hourly
// revalidate is a cheap way to be at most an hour stale at the boundary
// without rendering this per request.
export const revalidate = 3600;

export default function QuestionsPage() {
  const day = leagueDay();
  return <QuestionBank qotd={questionOfTheDay(day)} day={day} />;
}
