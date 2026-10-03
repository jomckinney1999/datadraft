import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import PassTag from "@/components/pass-tag";
import PrepPassBridge from "@/components/prep-pass-bridge";
import PrepArt, { hasPrepArt, type PrepArtId } from "@/components/prep-art";
import { ANALYST_FORMATS, ANALYST_MC } from "@/lib/analyst-screen";
import { challengeTasks } from "@/lib/data-challenge";
import { PATTERNS, questionsFor } from "@/lib/interview-patterns";
import { MOCK_FORMATS } from "@/lib/mock-interview";
import { QUESTIONS } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Hiring prep — DataDraft",
  description:
    "The analyst hiring funnel in order: drill the nine SQL patterns, then a timed online assessment, a live SQL screen, and a take-home. Practise each stage on real NFL data.",
};

const CARD = "surface rounded-2xl border border-panel-border bg-panel";

/** Where to go — one lane, left to right. */
const PATH = [
  {
    n: "0",
    label: "Drill patterns",
    href: "#patterns",
    note: "The nine SQL moves screens keep testing",
    tone: "ice" as const,
  },
  {
    n: "1",
    label: "Online assessment",
    href: "/questions/screen",
    note: "Timed OA before a human",
    tone: "turf" as const,
  },
  {
    n: "2",
    label: "SQL screen",
    href: "/questions/mock",
    note: "Live round, against the clock",
    tone: "gold" as const,
  },
  {
    n: "3",
    label: "Take-home",
    href: "/projects/challenge",
    note: "Messy data, a recommendation",
    tone: "ice" as const,
  },
];

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
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-5xl">
            The funnel, in order
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Most analyst hiring runs the same three stages. Drill the patterns first, then practise each stage on the
            same real NFL data the rest of the site uses. These are our own rubrics, not any company&apos;s tests.
          </p>
        </div>

        {/* ── Where to go ──────────────────────────────────── */}
        <nav
          aria-label="Prep path"
          className={`${CARD} mt-8 overflow-hidden border-gold/30 bg-gold/5 p-4 sm:p-5`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="label-broadcast text-gold">your path · follow this</p>
            <Link
              href="/learn/arcade"
              className="font-mono text-[10px] uppercase tracking-widest text-ink-muted hover:text-gold"
            >
              Warm up in the Arcade →
            </Link>
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PATH.map((p, i) => (
              <li key={p.label} className="relative">
                <Link
                  href={p.href}
                  className={`lift flex h-full flex-col rounded-xl border border-panel-border bg-panel p-3.5 transition-colors hover:border-gold/50`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                        p.tone === "gold"
                          ? "bg-gold/20 text-gold"
                          : p.tone === "turf"
                            ? "bg-turf/20 text-turf"
                            : "bg-ice/20 text-ice"
                      }`}
                    >
                      {p.n}
                    </span>
                    <span className="font-display text-base font-bold text-ink">{p.label}</span>
                  </span>
                  <span className="mt-1.5 text-xs leading-snug text-ink-soft">{p.note}</span>
                </Link>
                {i < PATH.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-1 top-1/2 hidden -translate-y-1/2 font-mono text-ink-muted lg:block"
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted sm:text-left">
            New to SQL? Start in{" "}
            <Link href="/learn" className="font-semibold text-turf hover:underline">
              Courses
            </Link>
            , then come back. Just want a daily habit?{" "}
            <Link href="/questions" className="font-semibold text-gold hover:underline">
              Today&apos;s question
            </Link>
            {" · "}
            <Link href="/questions/duel" className="font-semibold text-gold hover:underline">
              Stat Duel
            </Link>
            .
          </p>
        </nav>

        {/* ── Patterns (before the funnel) ─────────────────── */}
        <section id="patterns" className="mt-10 scroll-mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-ice/40 bg-panel">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgb(var(--c-ice)/0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_100%,rgb(var(--c-gold)/0.12),transparent_50%)]"
            />
            <div className="relative border-b border-panel-border px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-xl">
                  <p className="label-broadcast text-ice">before you sit any of them</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
                    Drill the patterns underneath
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                    Screens keep testing the same {PATTERNS.length} SQL patterns. The bank groups its{" "}
                    <span className="font-semibold text-ink">{sql} SQL questions</span> by pattern, with your
                    progress on each. Tap a picture to open that set.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/questions#interview" className="press btn-turf text-sm">
                    All patterns →
                  </Link>
                  <Link
                    href="/learn/arcade"
                    className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:bg-gold/20"
                  >
                    Pattern Call game →
                  </Link>
                </div>
              </div>
            </div>

            <ul className="relative grid grid-cols-2 gap-px bg-panel-border sm:grid-cols-3">
              {PATTERNS.map((p) => {
                const n = questionsFor(p).length;
                const artId = hasPrepArt(p.id) ? p.id : null;
                return (
                  <li key={p.id} className="bg-panel">
                    <Link
                      href={`/questions?pattern=${p.id}#interview`}
                      className="group flex h-full flex-col outline-none transition-colors hover:bg-ice/5 focus-visible:bg-ice/10"
                    >
                      <span className="relative block aspect-[5/3] overflow-hidden border-b border-panel-border bg-night/50">
                        {artId && (
                          <PrepArt
                            id={artId}
                            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <span className="absolute bottom-2 right-2 rounded-full border border-night/40 bg-night/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                          {n} Qs
                        </span>
                      </span>
                      <span className="flex flex-1 flex-col p-3 sm:p-4">
                        <span className="font-display text-sm font-bold text-ink sm:text-base group-hover:text-ice">
                          {p.name}
                        </span>
                        <span className="mt-1 line-clamp-2 text-xs leading-snug text-ink-soft">{p.asks}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-panel-border px-5 py-4 sm:px-8">
              <p className="text-xs text-ink-muted sm:text-sm">
                Filtering · grouping · joins · CASE · CTEs · ranking · running totals · dates · NULLs
              </p>
              <Link
                href="/questions"
                className="font-mono text-[11px] font-bold uppercase tracking-wider text-ice hover:underline"
              >
                Full question bank →
              </Link>
            </div>
          </div>
        </section>

        {/* ── The three stages ─────────────────────────────── */}
        <div className="mt-12">
          <p className="label-broadcast text-gold">then sit the funnel</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            Three stages. Same data. Real clock.
          </h2>
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

        <p className="mt-10 text-center text-sm text-ink-muted">
          Lost?{" "}
          <Link href="/welcome" className="font-semibold text-gold hover:underline">
            Map of the site
          </Link>
          {" · "}
          <Link href="/dashboard" className="font-semibold text-turf hover:underline">
            Your locker
          </Link>
          {" · "}
          <Link href="/questions/prep#patterns" className="font-semibold text-ice hover:underline">
            Back to patterns
          </Link>
        </p>
      </main>
    </>
  );
}
