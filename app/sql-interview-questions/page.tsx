import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import SiteFooter from "@/components/site-footer";
import PrepArt, { hasPrepArt } from "@/components/prep-art";
import { PATTERNS, questionsFor } from "@/lib/interview-patterns";
import { GUIDES_BASE, TOPIC_GUIDES, guideForPattern } from "@/lib/pattern-guides";
import QuestionArt from "@/components/question-art";
import { datasetOf } from "@/lib/practice-schemas";
import { QUESTIONS, questionOfTheDay, leagueDay } from "@/lib/questions";
import { PAYWALL_LIVE } from "@/lib/season-pass";
import { SITE_URL } from "@/lib/site";

/**
 * The hub for the pattern guides: the page that should rank for "SQL
 * interview questions". Nine patterns, what each one asks, how many practice
 * questions sit behind it, and how to practise. Static; counts come from the
 * bank, so they're true the day a question ships.
 */

export const revalidate = 3600;

const SQL_COUNT = QUESTIONS.filter((q) => q.lang === "sql").length;
const TITLE = "SQL Interview Questions, with Answers: the 9 Patterns Analyst Screens Test";
const DESCRIPTION = `The nine SQL patterns data analyst interviews keep testing, each with the shape of the answer, the mistakes interviewers watch for, a worked example and practice questions you run in your browser. ${SQL_COUNT} SQL questions on real NFL data.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${GUIDES_BASE}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${GUIDES_BASE}`,
    images: [
      {
        url: `/api/og/card?${new URLSearchParams({ kind: "guide", t: "SQL interview questions", n: String(SQL_COUNT), s: "The 9 patterns analyst screens test" })}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "What SQL do data analyst interviews ask?",
    a: "The same handful of patterns, over and over: filtering and sorting, GROUP BY with HAVING, joins, CASE WHEN, subqueries and CTEs, ranking with window functions, running totals with LAG and LEAD, dates, and NULLs. Get those nine solid and most screens hold no surprises.",
  },
  {
    q: "Do I need to know football?",
    a: "No. The data is NFL scoring because it's real, it's messy in the ways work data is, and it's easy to tell when an answer looks wrong. Every question says what each column means.",
  },
  {
    q: "Which SQL dialect is this?",
    a: "The questions run in SQLite, right in your browser. The patterns are the same in Postgres, Snowflake, BigQuery and MySQL, and each guide notes where the syntax differs.",
  },
  {
    q: "Is it free?",
    a: PAYWALL_LIVE
      ? "Today's question is free every day, and so are a starter set and any question for a week after it was the daily. The Season Pass opens the whole bank."
      : "Yes, while DataDraft is in early access. Today's question will always be free.",
  },
];

function ld(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export default function SqlInterviewQuestions() {
  const today = questionOfTheDay(leagueDay(), "sql");
  return (
    <>
      <AppNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ld({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}
      />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <header className="text-center">
          <p className="label-broadcast text-turf">sql interview questions</p>
          <h1 className="mx-auto mt-2 max-w-3xl font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
            The nine patterns analyst screens test, on real data
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            SQL screens keep asking the same kinds of question. Here&apos;s each one: what it is, the shape of the
            answer, the mistakes interviewers watch for, and practice you run in your browser. {SQL_COUNT} SQL
            questions on real NFL scoring, so you&apos;ll notice when an answer looks wrong.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {today && (
              <Link href={`/questions/${today.id}`} className="press btn-turf text-sm">
                Try today&apos;s question
              </Link>
            )}
            <Link
              href="/questions/mock"
              className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:bg-gold/20"
            >
              Run a mock screen →
            </Link>
          </div>
        </header>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERNS.map((p, i) => {
            const guide = guideForPattern(p.id);
            if (!guide) return null;
            const qs = questionsFor(p);
            const levels = (["easy", "medium", "hard"] as const).filter((d) => qs.some((q) => q.difficulty === d));
            return (
              <li key={p.id}>
                <Link
                  href={`${GUIDES_BASE}/${guide.slug}`}
                  className="surface lift group flex h-full flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel transition-colors hover:border-turf/50"
                >
                  <span className="relative block aspect-[5/3] overflow-hidden border-b border-panel-border bg-night/50">
                    {hasPrepArt(p.id) && (
                      <PrepArt id={p.id} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-night/40 bg-night/80 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-muted">
                      {i + 1} / {PATTERNS.length}
                    </span>
                    <span className="absolute bottom-2 right-2 rounded-full border border-night/40 bg-night/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                      {qs.length} questions
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-4">
                    <span className="font-display text-lg font-bold text-ink group-hover:text-turf">{p.name}</span>
                    <span className="mt-1 text-sm leading-snug text-ink-soft">{p.asks}</span>
                    <span className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      {levels.join(" · ")} · read the guide →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        {/* ── Beyond the nine: guides to a kind of role ───── */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink">Interviewing at an app company?</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {TOPIC_GUIDES.map((g) => {
              const n = QUESTIONS.filter((q) => q.lang === "sql" && datasetOf(q.tables) === g.dataset).length;
              return (
                <li key={g.slug}>
                  <Link
                    href={`${GUIDES_BASE}/${g.slug}`}
                    className="surface lift group flex h-full overflow-hidden rounded-2xl border border-panel-border bg-panel transition-colors hover:border-turf/50"
                  >
                    <span className="relative w-36 shrink-0 border-r border-panel-border bg-night/50">
                      <QuestionArt art={g.topic.art} className="absolute inset-0 h-full w-full" />
                    </span>
                    <span className="flex flex-1 flex-col p-4">
                      <span className="font-display text-lg font-bold text-ink group-hover:text-turf">{g.topic.name}</span>
                      <span className="mt-1 text-sm leading-snug text-ink-soft">{g.topic.asks}</span>
                      <span className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                        {n} questions · read the guide →
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="surface mt-10 rounded-2xl border border-panel-border bg-panel p-5 sm:p-7">
          <h2 className="font-display text-2xl font-bold text-ink">How to practise them</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: 1,
                t: "One a day",
                b: "Today's question takes about ninety seconds. Same question for everyone, so you can compare notes.",
                href: today ? `/questions/${today.id}` : "/questions",
                cta: "Today's question",
              },
              {
                n: 2,
                t: "Drill the weak pattern",
                b: "Pick the guide you'd least like to be asked about, read it, then work its questions until it's boring.",
                href: "/questions#interview",
                cta: "Your progress by pattern",
              },
              {
                n: 3,
                t: "Rehearse against the clock",
                b: "A mock phone screen is two questions in twenty minutes, with a report after. Do one before the real thing.",
                href: "/questions/mock",
                cta: "Mock SQL screens",
              },
            ].map((s) => (
              <li key={s.n} className="rounded-xl border border-panel-border bg-night/40 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-turf/20 font-mono text-[11px] font-bold text-turf">
                  {s.n}
                </span>
                <p className="mt-2 font-display text-base font-bold text-ink">{s.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.b}</p>
                <Link href={s.href} className="mt-2 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:underline">
                  {s.cta} →
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink">Questions people ask</h2>
          <div className="mt-4 space-y-2">
            {FAQ.map((f) => (
              <details key={f.q} className="surface group rounded-xl border border-panel-border bg-panel px-4 py-3">
                <summary className="cursor-pointer list-none font-display text-base font-bold text-ink">
                  <span className="mr-2 inline-block text-turf transition-transform group-open:rotate-90">›</span>
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
