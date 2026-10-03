import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import AppNav from "@/components/app-nav";
import Coach from "@/components/coach";
import CourseArt from "@/components/course-art";
import HofTrophy from "@/components/hof-trophy";
import ProjectArt from "@/components/project-art";
import QuestionArt from "@/components/question-art";
import WhyArt from "@/components/why-art";
import { TourButton } from "@/components/welcome-tour";
import { COURSES } from "@/lib/courses";
import { INTERVIEW_CASES } from "@/lib/interview-cases";
import { liveProjects } from "@/lib/projects";
import { QUESTION_COUNT, questionsIn } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Start here — DataDraft",
  description:
    "A map of DataDraft: the daily questions, the courses, interview prep, projects, the Draft Room and Stat Duel, and how your progress works.",
};

/**
 * The full map of the site, for a new member or a new partner. The 60-second
 * tour (components/welcome-tour.tsx) is the short version and links here.
 * Every number on the page is counted from the code, never typed.
 */

type Area = {
  label: string;
  title: string;
  art: ReactNode;
  what: string;
  bullets: { name: string; href: string; note: string }[];
};

export default function WelcomePage() {
  const sql = questionsIn("sql").length;
  const courses = COURSES.filter((c) => c.moduleId).length;
  const builds = liveProjects().length;
  const cases = INTERVIEW_CASES.length;

  const AREAS: Area[] = [
    {
      label: "every day · 90 seconds",
      title: "Questions",
      art: <QuestionArt art="chalkboard" className="h-full w-full" />,
      what: `${QUESTION_COUNT} problems on real NFL data (${sql} of them SQL, plus Python, Excel and R). Each is a situation, a table or two, and a result to produce. Graded on your result, not your wording, so any correct query passes.`,
      bullets: [
        { name: "Question of the Day", href: "/questions", note: "One per language, the same for everyone. Solve one a day to build a streak." },
        { name: "Stat Duel", href: "/questions/duel", note: "Five head-to-heads a day on real numbers. No code; every answer shows the SQL that proves it." },
        { name: "Query Doctor", href: "/questions", note: "Get a question wrong and it tells you why — the column, the clause, the kind of mistake — without giving the answer away." },
      ],
    },
    {
      label: "learn · at your pace",
      title: "Courses",
      art: <CourseArt id="sql-fundamentals" className="h-full w-full" />,
      what: `${courses} courses that play like a football drive. A lesson is one possession: right answers gain yards, misses burn downs. You get five graded lessons a day for free, and the Practice Field never runs out.`,
      bullets: [
        { name: "SQL Fundamentals", href: "/learn/track/sql-fundamentals", note: "Start here if you've never written a query." },
        { name: "All courses", href: "/learn", note: "Advanced SQL, Python & pandas, Excel, R, statistics, visualization, Git." },
        { name: "Practice Field", href: "/field", note: "A free SQL sandbox over real NFL stats. No grades, just reps." },
      ],
    },
    {
      label: "get hired",
      title: "Interview prep",
      art: <WhyArt id="before-finished" className="h-full w-full" />,
      what: "The SQL that analyst screens actually test, and a way to rehearse against the clock.",
      bullets: [
        { name: "Interview patterns", href: "/questions#interview", note: "Nine patterns — joins, CTEs, ranking within groups, running totals, dates, NULLs — with your progress on each." },
        { name: "Mock SQL screens", href: "/questions/mock", note: "A 20-minute phone screen or a 45-minute technical screen. No hints until the report." },
        { name: "Cases", href: "/projects", note: `${cases} half-hour cases against a schema you've never seen.` },
      ],
    },
    {
      label: "something to show",
      title: "Projects",
      art: <ProjectArt id="my-league-scorecard" className="h-full w-full" />,
      what: `${builds} builds that end in something with your name on it — the thing you talk about in an interview.`,
      bullets: [
        { name: "Your League Scorecard", href: "/projects/my-league-scorecard", note: "Load your own Sleeper league and chart who's actually good. The group chat will have opinions." },
        { name: "Build the Warehouse", href: "/projects/nflverse-dbt-warehouse", note: "A real dbt project on real NFL data, tests and all." },
        { name: "Fantasy Prediction Model", href: "/projects/fantasy-points-model", note: "A model that has to beat a simple baseline, in Colab." },
      ],
    },
    {
      label: "play",
      title: "The Draft Room",
      art: <ProjectArt id="positional-ranks" className="h-full w-full" />,
      what: "Draft a real fantasy season against seven bots on real ADP, scouting with SQL over the seasons before. Then the season plays out with the points that actually happened, and you find out what your scouting was worth.",
      bullets: [
        { name: "Start a draft", href: "/draft", note: "About 15 minutes. 2025, 2024 or 2023." },
        { name: "Chart it", href: "/questions", note: "Every SQL result can become a chart sized for X, with one click." },
      ],
    },
  ];

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        <header className="text-center">
          <div className="flex justify-center">
            <Coach mood="whistle" size={96} />
          </div>
          <p className="label-broadcast mt-3 text-gold">start here</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-5xl">Your map of DataDraft</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Practise data skills — SQL, Python, Excel and R — on the real NFL numbers you already argue about. Here&apos;s
            everything on the field, and where to start.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <TourButton className="press btn-gold" />
            <Link href="/questions" className="press btn-turf">
              Solve today&apos;s question
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          {[
            { q: "I'm new to SQL", a: "SQL Fundamentals, lesson one", href: "/learn/track/sql-fundamentals" },
            { q: "I know some SQL", a: "Today's question, then the interview patterns", href: "/questions" },
            { q: "I'm prepping for interviews", a: "A mock SQL screen", href: "/questions/mock" },
            { q: "I just want to play", a: "Today's Stat Duel or a Draft Room draft", href: "/questions/duel" },
          ].map((m) => (
            <Link
              key={m.q}
              href={m.href}
              className="lift surface flex items-center justify-between gap-3 rounded-2xl border border-panel-border bg-panel px-5 py-4 transition-colors hover:border-turf/60"
            >
              <span>
                <span className="block font-display text-lg font-bold text-ink">{m.q}</span>
                <span className="block text-sm text-ink-soft">{m.a}</span>
              </span>
              <span className="font-mono text-turf">→</span>
            </Link>
          ))}
        </section>

        <div className="mt-12 space-y-6">
          {AREAS.map((a) => (
            <section key={a.title} className="surface overflow-hidden rounded-3xl border border-panel-border bg-panel sm:flex">
              <div className="h-40 shrink-0 border-b border-panel-border bg-night/60 sm:h-auto sm:w-56 sm:border-b-0 sm:border-r">{a.art}</div>
              <div className="p-5 sm:p-6">
                <p className="label-broadcast text-gold">{a.label}</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">{a.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.what}</p>
                <ul className="mt-3 space-y-2">
                  {a.bullets.map((b) => (
                    <li key={b.name} className="text-sm leading-relaxed">
                      <Link href={b.href} className="font-semibold text-turf hover:underline">
                        {b.name}
                      </Link>{" "}
                      <span className="text-ink-soft">— {b.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="surface rounded-2xl border border-panel-border bg-panel p-5">
            <div className="flex items-end gap-1">
              <HofTrophy tier="bronze" earned className="h-14 w-auto" />
              <HofTrophy tier="gold" earned className="h-20 w-auto" />
              <HofTrophy tier="silver" earned className="h-16 w-auto" />
            </div>
            <h2 className="mt-3 font-display text-xl font-bold text-ink">Your progress</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              XP, your streak and twelve Hall of Fame trophies, earned from what you actually do. Progress saves in this
              browser; <Link href="/account" className="text-turf hover:underline">sign in</Link> and it follows you to
              other devices.
            </p>
            <Link href="/achievements" className="mt-3 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline">
              See the Hall of Fame →
            </Link>
          </div>
          <div className="surface rounded-2xl border border-panel-border bg-panel p-5">
            <h2 className="font-display text-xl font-bold text-ink">Good to know</h2>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-soft">
              <li>
                <strong className="text-ink">The data is real.</strong> Weekly NFL scoring from nflverse and fantasy data
                from Sleeper — <Link href="/data" className="text-turf hover:underline">where it comes from</Link>.
              </li>
              <li>
                <strong className="text-ink">It all runs in your browser.</strong> SQL and Excel start instantly; Python
                and R download once, the first time you use them.
              </li>
              <li>
                <strong className="text-ink">Keyboard:</strong> Ctrl/⌘ + Enter submits a query. Arrow keys drive a lesson.
              </li>
              <li>
                <strong className="text-ink">Free.</strong> Everything here is free while DataDraft is in early access.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
