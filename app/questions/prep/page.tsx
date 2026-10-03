import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import PassTag from "@/components/pass-tag";
import PrepArt, { type PrepArtId } from "@/components/prep-art";
import { ANALYST_FORMATS, ANALYST_MC } from "@/lib/analyst-screen";
import { challengeTasks } from "@/lib/data-challenge";
import { PATTERNS } from "@/lib/interview-patterns";
import { MOCK_FORMATS } from "@/lib/mock-interview";
import { QUESTIONS } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Hiring prep — DataDraft",
  description:
    "The analyst hiring funnel in order: a timed online assessment, a live SQL screen, then a take-home. Practise each stage on real NFL data, with a report after every one.",
};

const CARD = "surface rounded-2xl border border-panel-border bg-panel";

export default function HiringPrepPage() {
  const sql = QUESTIONS.filter((q) => q.lang === "sql").length;
  const tasks = challengeTasks();
  const graded = tasks.filter((t) => t.kind === "sql").length;
  const online = ANALYST_FORMATS.find((f) => f.id === "online");
  const sprint = ANALYST_FORMATS.find((f) => f.id === "sprint");
  const phone = MOCK_FORMATS.find((f) => f.id === "phone");
  const technical = MOCK_FORMATS.find((f) => f.id === "technical");

  const steps: {
    n: number;
    art: PrepArtId;
    kicker: string;
    title: string;
    body: string;
    href: string;
    cta: string;
    pass?: boolean;
  }[] = [
    {
      n: 1,
      art: "online",
      kicker: `${online?.minutes ?? 70} minutes · or ${sprint?.minutes ?? 35} for a quick one`,
      title: "The online assessment",
      body: `The timed test that comes before a human talks to you. SQL from the bank of ${sql}, plus multiple choice from ${ANALYST_MC.length} items on statistics, wrangling, types and A/B tests. One clock, no hints, every answer explained afterwards.`,
      href: "/questions/screen",
      cta: "Take an Analyst Screen →",
      pass: true,
    },
    {
      n: 2,
      art: "technical",
      kicker: `${phone?.minutes ?? 20} or ${technical?.minutes ?? 45} minutes`,
      title: "The SQL screen",
      body: `The live round, rehearsed. A phone screen of ${phone?.mix.length ?? 2} questions or a technical screen of ${technical?.mix.length ?? 3}, easy to hard, on questions you haven't solved. Query Doctor reads your last miss in the report.`,
      href: "/questions/mock",
      cta: "Run a mock screen →",
      pass: true,
    },
    {
      n: 3,
      art: "challenge",
      kicker: "No clock · half a day",
      title: "The take-home",
      body: `Messy data, a business problem and ${tasks.length} tasks, ${graded} of them graded SQL. Clean it, join it, recommend, say what you would track next, then mark yourself against a rubric of builder mindset, data management and business intent.`,
      href: "/projects/challenge",
      cta: "Open the Data Challenge →",
      pass: true,
    },
  ];

  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <div className="text-center">
          <p className="label-broadcast text-turf">hiring prep</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-5xl">The funnel, in order</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Most analyst hiring runs the same three stages. Practise each one on the same real NFL data the rest of the
            site uses, so the only new thing in the room is the clock. These are our own rubrics, not any company&apos;s
            tests.
          </p>
        </div>

        <ol className="mt-10 space-y-5">
          {steps.map((s) => (
            <li key={s.n} className={`${CARD} grid overflow-hidden sm:grid-cols-[14rem_1fr]`}>
              <div className="h-40 border-b border-panel-border bg-night/40 sm:h-auto sm:border-b-0 sm:border-r">
                <PrepArt id={s.art} className="h-full w-full" />
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-gold">Stage {s.n}</span>
                  {s.pass && <PassTag />}
                </div>
                <p className="label-broadcast mt-2 text-turf">{s.kicker}</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">{s.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
                <Link href={s.href} className="press btn-turf mt-4 inline-block">
                  {s.cta}
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <section className={`${CARD} mt-8 p-5 sm:p-6`}>
          <p className="label-broadcast">before you sit any of them</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">Drill the patterns underneath</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Screens keep testing the same {PATTERNS.length} SQL patterns: filtering and sorting, grouping, joins,
            conditional logic, subqueries, ranking, running totals, dates and NULLs. The question bank groups its{" "}
            {sql} SQL questions by pattern, with your progress on each.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/questions#interview"
              className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/40 hover:text-turf"
            >
              Interview patterns →
            </Link>
            <Link
              href="/questions"
              className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/40 hover:text-turf"
            >
              The question bank →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
