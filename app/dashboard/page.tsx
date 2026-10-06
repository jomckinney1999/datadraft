import type { Metadata } from "next";
import Dashboard from "@/components/dashboard";
import QuestionArt from "@/components/question-art";
import CourseArt from "@/components/course-art";
import ProjectArt from "@/components/project-art";
import PrepArt from "@/components/prep-art";
import { COURSES } from "@/lib/courses";
import { getLiveWeek } from "@/lib/live-nfl";
import { QUESTIONS, leagueDay, questionOfTheDay } from "@/lib/questions";
import { pathCatalog } from "@/lib/analyst-path-catalog";

export const metadata: Metadata = {
  title: "Dashboard — DataDraft",
  description:
    "Where you left off, what to do next, and what happened in the league this week.",
};

/**
 * Rebuilt hourly. The live panel parses a couple of megabytes of nflverse CSV
 * on the server, so it must not run per request — and an hour is far fresher
 * than a weekly NFL schedule needs.
 */
export const revalidate = 3600;

export default async function DashboardPage() {
  // Never throws: getLiveWeek returns null if nflverse is unreachable, and the
  // dashboard simply renders without the league panel.
  const live = await getLiveWeek();
  // The day's question is resolved here rather than in the client component
  // so the server and the browser agree on what "today" is.
  const day = leagueDay();
  return (
    <Dashboard
      live={live}
      qotd={questionOfTheDay(day)}
      day={day}
      questionCount={QUESTIONS.length}
      catalog={pathCatalog()}
      arts={{
        duel: <QuestionArt art="scale" className="h-full w-full" />,
        useCases: {
          practice: <QuestionArt art="chalkboard" className="h-full w-full" />,
          course: <CourseArt id="sql-fundamentals" className="h-full w-full" />,
          fantasy: <ProjectArt id="my-league-scorecard" className="h-full w-full" />,
          interview: <PrepArt id="technical" className="h-full w-full" />,
        },
        courses: Object.fromEntries(COURSES.map((c) => [c.id, <CourseArt key={c.id} id={c.id} className="h-full w-full" />])),
      }}
    />
  );
}
