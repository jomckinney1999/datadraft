/**
 * The four ways to use DataDraft, side by side (decided 2026-10-05).
 *
 * People arrive for different reasons, and the site used to show every door
 * at once: a strip of six games, three section tiles, a hiring-prep bar and a
 * row of links, all on one dashboard. This says it once and plainly: you can
 * treat DataDraft like LeetCode, follow a course, use it on your fantasy
 * league, or prepare for interviews, and mix them as you like. Each card has
 * one main door and at most two side doors, so every destination the old
 * tiles offered is still one click away.
 *
 * Server-safe: no state, so the dashboard and any static page can use it.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import QuestionArt from "@/components/question-art";
import CourseArt from "@/components/course-art";
import ProjectArt from "@/components/project-art";
import PrepArt from "@/components/prep-art";

type Tone = "gold" | "turf" | "ice";

type UseCase = {
  id: string;
  title: string;
  pitch: string;
  bestFor: string;
  primary: { href: string; label: string };
  more: { href: string; label: string }[];
  tone: Tone;
  art: ReactNode;
};

const TEXT: Record<Tone, string> = { gold: "text-gold", turf: "text-turf", ice: "text-ice" };
const BORDER: Record<Tone, string> = {
  gold: "hover:border-gold/50",
  turf: "hover:border-turf/50",
  ice: "hover:border-ice/50",
};
const BUTTON: Record<Tone, string> = {
  gold: "border-gold/50 bg-gold/10 text-gold hover:bg-gold/20",
  turf: "border-turf/50 bg-turf/10 text-turf hover:bg-turf/20",
  ice: "border-ice/50 bg-ice/10 text-ice hover:bg-ice/20",
};

export default function UseCases({
  questionCount,
  qotdId,
  course,
  className = "",
}: {
  questionCount: number;
  /** Today's SQL question, for the practice card's side door. */
  qotdId: string;
  /** Where "follow a course" should go: your next lesson, or lesson one. */
  course: { href: string; label: string };
  className?: string;
}) {
  const cases: UseCase[] = [
    {
      id: "practice",
      title: "Practise questions",
      pitch: `Like LeetCode: pick a problem, write the query, get graded on the result. A new one every day, and ${questionCount} to work through.`,
      bestFor: "Best if you know a little SQL and want reps.",
      primary: { href: "/questions", label: "Question bank" },
      more: [
        { href: `/questions/${qotdId}`, label: "Today's question" },
        { href: "/learn/rapid", label: "Rapid Fire" },
      ],
      tone: "gold",
      art: <QuestionArt art="chalkboard" className="h-full w-full" />,
    },
    {
      id: "course",
      title: "Follow a course",
      pitch: "Short lessons in order, from your first SELECT to window functions, plus Python, Excel and more.",
      bestFor: "Best if you're starting out, or want structure.",
      primary: course,
      more: [
        { href: "/learn", label: "All courses" },
        { href: "/field", label: "Practice Field" },
      ],
      tone: "turf",
      art: <CourseArt id="sql-fundamentals" className="h-full w-full" />,
    },
    {
      id: "fantasy",
      title: "Fantasy football insights",
      pitch: "Load your Sleeper league and see who's actually good, who got lucky, and who left points on the bench.",
      bestFor: "Best if you came for your league. No code needed to start.",
      primary: { href: "/projects/my-league-scorecard#your-league", label: "Chart your league" },
      more: [
        { href: "/draft", label: "Draft Room" },
        { href: "/questions/duel", label: "Stat Duel" },
      ],
      tone: "ice",
      art: <ProjectArt id="my-league-scorecard" className="h-full w-full" />,
    },
    {
      id: "interview",
      title: "Interview prep",
      pitch: "The nine SQL patterns analyst screens test, then timed mock screens and real cases, in the order hiring runs.",
      bestFor: "Best if you're applying for analyst roles.",
      primary: { href: "/questions/prep", label: "Hiring prep" },
      more: [
        { href: "/sql-interview-questions", label: "Pattern guides" },
        { href: "/questions/mock", label: "Mock screens" },
      ],
      tone: "gold",
      art: <PrepArt id="technical" className="h-full w-full" />,
    },
  ];

  return (
    <section className={className} aria-labelledby="use-cases-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="use-cases-title" className="font-display text-xl font-bold text-ink">
          Four ways to use DataDraft
        </h2>
        <p className="text-sm text-ink-muted">Use one or mix them. Your progress counts across all four.</p>
      </div>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {cases.map((c) => (
          <li
            key={c.id}
            className={`surface flex gap-4 rounded-2xl border border-panel-border bg-panel p-4 transition-colors ${BORDER[c.tone]}`}
          >
            <span className="hidden h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-panel-border bg-night/50 sm:block">
              {c.art}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className={`font-display text-lg font-bold ${TEXT[c.tone]}`}>{c.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{c.pitch}</p>
              <p className="mt-1 text-xs text-ink-muted">{c.bestFor}</p>
              <Link
                href={c.primary.href}
                className={`mt-3 inline-flex rounded-lg border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${BUTTON[c.tone]}`}
              >
                {c.primary.label} →
              </Link>
              <p className="mt-2 text-xs text-ink-muted">
                Or{" "}
                {c.more.map((m, i) => (
                  <span key={m.href}>
                    {i > 0 && " · "}
                    <Link href={m.href} className="font-semibold text-ink-soft hover:text-ink hover:underline">
                      {m.label}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
