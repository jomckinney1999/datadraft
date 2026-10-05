import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import PassTag from "@/components/pass-tag";
import PrepPassBridge from "@/components/prep-pass-bridge";
import PrepArt, { type PrepArtId } from "@/components/prep-art";
import AnalystPath from "@/components/analyst-path";
import { pathCatalog } from "@/lib/analyst-path-catalog";
import { ANALYST_FORMATS, ANALYST_MC } from "@/lib/analyst-screen";
import { challengeTasks } from "@/lib/data-challenge";
import { MOCK_FORMATS } from "@/lib/mock-interview";
import { QUESTIONS } from "@/lib/questions";

export const metadata: Metadata = {
  title: "The analyst path — DataDraft",
  description:
    "Four steps from your first query to interview-ready, on real NFL data: SQL foundations, the nine patterns screens test, mock screens against the clock, and a portfolio piece built on your own fantasy league.",
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
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-5xl">The analyst path</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Four steps from your first query to interview-ready, all on the same real NFL data. Your progress is
            ticked as you go. Already past a step? It ticks itself, or skip it.
          </p>
        </div>

        <div className="mt-8">
          <AnalystPath catalog={pathCatalog()} />
        </div>

        {/* ── The three stages ─────────────────────────────── */}
        <div className="mt-12">
          <p className="label-broadcast text-gold">what each round is like</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            Most analyst hiring runs three stages
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Practise each one here. These are our own rubrics, not any company&apos;s tests.
          </p>
        </div>

        <ol className="mt-6 space-y-5">
          {steps.map((s) => (
            <li key={s.n} className={`${CARD} grid overflow-hidden sm:grid-cols-[14rem_1fr]`}>
              <div className="h-40 border-b border-panel-border bg-night/40 sm:h-auto sm:border-b-0 sm:border-r">
                <PrepArt id={s.art} className="h-full w-full" />
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-gold">
                    Stage {s.n}
                  </span>
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

        <PrepPassBridge />

      </main>
    </>
  );
}
