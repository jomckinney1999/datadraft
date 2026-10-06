import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppNav from "@/components/app-nav";
import SiteFooter from "@/components/site-footer";
import PrepArt, { hasPrepArt } from "@/components/prep-art";
import QuestionArt from "@/components/question-art";
import DifficultyChip from "@/components/difficulty-chip";
import SqlBlock from "@/components/sql-block";
import { patternOf, questionsFor } from "@/lib/interview-patterns";
import {
  GUIDES_BASE,
  PATTERN_GUIDES,
  TOPIC_GUIDES,
  guideBySlug,
  topicGuideBySlug,
  type PatternGuide,
  type TopicGuide,
} from "@/lib/pattern-guides";
import { QUESTIONS, type Question } from "@/lib/questions";
import { datasetOf } from "@/lib/practice-schemas";
import { SITE_URL } from "@/lib/site";

/**
 * One interview pattern, as a page someone lands on from a search: what it
 * is, why screens ask it, the shape of the answer, the mistakes interviewers
 * watch for, one worked example from the bank with its key, and every
 * practice question in the pattern. Content in lib/pattern-guides.ts; the
 * question list is computed from tags, so it grows with the bank.
 *
 * A topic guide (product analytics) is the same page: its practice list is a
 * practice database instead of a tag set, and it sits outside the nine.
 */

/** What the page needs, whichever kind of guide it is. */
type GuideView = {
  guide: PatternGuide | TopicGuide;
  id: string;
  name: string;
  asks: string;
  practice: Question[];
  /** The bank, filtered to this guide's questions. */
  bankHref: string;
  /** "pattern 3 of 9", or the topic's own label. */
  label: string;
  art: "prep" | "question";
  questionArt?: Question["art"];
  prev?: PatternGuide;
  next?: PatternGuide;
};

function viewFor(slug: string): GuideView | null {
  const guide = guideBySlug(slug);
  const pattern = guide && patternOf(guide.pattern);
  if (guide && pattern) {
    const index = PATTERN_GUIDES.findIndex((g) => g.slug === guide.slug);
    return {
      guide,
      id: pattern.id,
      name: pattern.name,
      asks: pattern.asks,
      practice: questionsFor(pattern),
      bankHref: `/questions?pattern=${pattern.id}#interview`,
      label: `pattern ${index + 1} of ${PATTERN_GUIDES.length}`,
      art: "prep",
      prev: PATTERN_GUIDES[index - 1],
      next: PATTERN_GUIDES[index + 1],
    };
  }
  const topic = topicGuideBySlug(slug);
  if (!topic) return null;
  return {
    guide: topic,
    id: topic.topic.id,
    name: topic.topic.name,
    asks: topic.topic.asks,
    practice: QUESTIONS.filter((q) => q.lang === "sql" && datasetOf(q.tables) === topic.dataset),
    bankHref: `/questions?data=${topic.dataset}`,
    label: topic.topic.label,
    art: "question",
    questionArt: topic.topic.art,
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [...PATTERN_GUIDES, ...TOPIC_GUIDES].map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const view = viewFor(params.slug);
  if (!view) return {};
  const { guide } = view;
  const url = `${SITE_URL}${GUIDES_BASE}/${guide.slug}`;
  const n = view.practice.length;
  const image = `/api/og/card?${new URLSearchParams({ kind: "guide", t: view.name, n: String(n), s: view.asks })}`;
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: guide.metaTitle, description: guide.metaDescription, url, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: guide.metaTitle, description: guide.metaDescription, images: [image] },
  };
}

const ORDER = { easy: 0, medium: 1, hard: 2 } as const;

function ld(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export default function PatternGuidePage({ params }: { params: { slug: string } }) {
  const view = viewFor(params.slug);
  if (!view) notFound();
  const { guide, prev, next } = view;
  const practice = [...view.practice].sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);
  const example = QUESTIONS.find((q) => q.id === guide.example);
  const counts = (["easy", "medium", "hard"] as const)
    .map((d) => [d, practice.filter((q) => q.difficulty === d).length] as const)
    .filter(([, n]) => n > 0);
  const url = `${SITE_URL}${GUIDES_BASE}/${guide.slug}`;

  return (
    <>
      <AppNav back={GUIDES_BASE} backLabel="all nine patterns" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ld([
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "SQL interview questions", item: `${SITE_URL}${GUIDES_BASE}` },
              { "@type": "ListItem", position: 2, name: view.name, item: url },
            ],
          },
        ])}
      />
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
          <Link href={GUIDES_BASE} className="hover:text-turf">
            SQL interview questions
          </Link>{" "}
          <span aria-hidden>›</span> <span className="text-ink-soft">{view.name}</span>
        </nav>

        {/* ── The pattern ─────────────────────────────────── */}
        <header className="surface mt-4 overflow-hidden rounded-3xl border border-panel-border bg-panel">
          <div className="grid gap-0 sm:grid-cols-[1.3fr_1fr]">
            <div className="p-5 sm:p-7">
              <p className="label-broadcast text-turf">{view.label}</p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{guide.h1}</h1>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">{guide.lead}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                  {practice.length} practice questions
                </span>
                {counts.map(([d, n]) => (
                  <span key={d} className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    {n} {d}
                  </span>
                ))}
              </div>
              {practice[0] && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/questions/${practice[0].id}`} className="press btn-turf text-sm">
                    Start with {practice[0].title}
                  </Link>
                  <Link
                    href={view.bankHref}
                    className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/50 hover:text-turf"
                  >
                    All {practice.length} in the bank
                  </Link>
                </div>
              )}
            </div>
            <div className="relative min-h-[11rem] border-t border-panel-border bg-night/50 sm:border-l sm:border-t-0">
              {view.art === "prep" && hasPrepArt(view.id) && <PrepArt id={view.id} className="absolute inset-0 h-full w-full" />}
              {view.art === "question" && view.questionArt && (
                <QuestionArt art={view.questionArt} className="absolute inset-0 h-full w-full" />
              )}
            </div>
          </div>
        </header>

        {/* ── Why ─────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink">Why interviewers ask it</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">{guide.whyAsked}</p>
        </section>

        {/* ── The shape ───────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink">The shape of the answer</h2>
          <SqlBlock sql={guide.shape} className="mt-3" />
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{guide.shapeNote}</p>
        </section>

        {/* ── Mistakes ────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink">The mistakes interviewers watch for</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {guide.mistakes.map((m) => (
              <li key={m.title} className="surface rounded-xl border border-panel-border bg-panel p-4">
                <p className="flex items-start gap-2 font-display text-base font-bold text-ink">
                  <span aria-hidden className="mt-0.5 text-gold">
                    ⚑
                  </span>
                  {m.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{m.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-muted">
            {view.art === "prep"
              ? "Make one of these on a DataDraft question and Query Doctor names it, without giving away the answer."
              : "Get one of these wrong on a practice question and Query Doctor compares your result's shape with the answer's (missing columns, extra rows, a join that fanned out) without giving the answer away."}
          </p>
        </section>

        {/* ── Worked example ──────────────────────────────── */}
        {example && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold text-ink">A worked example</h2>
            <article className="surface mt-4 overflow-hidden rounded-2xl border border-panel-border bg-panel">
              <div className="relative h-32 border-b border-panel-border">
                <QuestionArt art={example.art} align="left" className="absolute inset-0 h-full w-full" />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyChip difficulty={example.difficulty} />
                  <h3 className="font-display text-xl font-bold text-ink">{example.title}</h3>
                </div>
                <p className="mt-3 text-base leading-relaxed text-ink">{example.prompt}</p>
                <p className="mt-2 text-sm text-ink-soft">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Return </span>
                  {example.returns}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-muted">One answer</p>
                <SqlBlock sql={example.expected} className="mt-1.5" />
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-turf">Why it works. </span>
                  {example.explain}
                </p>
                <Link href={`/questions/${example.id}`} className="press btn-turf mt-4 inline-flex text-sm">
                  Run it yourself
                </Link>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  Grading compares results, not text, so a CTE or a subquery that gets the same rows passes too. On
                  the question, Show solution then Watch the answer run replays it clause by clause, in the order the
                  database runs it.
                </p>
              </div>
            </article>
          </section>
        )}

        {/* ── Practice ────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink">
            Practise it: {practice.length} questions, easiest first
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {practice.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/questions/${q.id}`}
                  className="surface group flex items-center gap-3 overflow-hidden rounded-xl border border-panel-border bg-panel pr-3 transition-colors hover:border-turf/50"
                >
                  <span className="relative h-16 w-24 shrink-0 border-r border-panel-border bg-night/50">
                    <QuestionArt art={q.art} className="absolute inset-0 h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1 py-2">
                    <span className="block truncate font-display text-sm font-bold text-ink group-hover:text-turf">{q.title}</span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                      {q.tags.slice(0, 3).join(" · ")}
                    </span>
                  </span>
                  <DifficultyChip difficulty={q.difficulty} className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink">Questions people ask</h2>
          <div className="mt-4 space-y-2">
            {guide.faq.map((f) => (
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

        {/* ── Next ────────────────────────────────────────── */}
        <section className="surface mt-10 rounded-2xl border border-gold/40 bg-gold/5 p-5 sm:p-6">
          <p className="font-display text-lg font-bold text-ink">Ready to try it under a clock?</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            A mock phone screen is two questions in twenty minutes, then a report on each answer.
          </p>
          <Link href="/questions/mock" className="press btn-gold mt-3 inline-flex text-sm">
            Run a mock screen
          </Link>
        </section>

        <nav aria-label="Other patterns" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-panel-border pt-4">
          {prev ? (
            <Link href={`${GUIDES_BASE}/${prev.slug}`} className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-turf">
              ← {patternOf(prev.pattern)?.name}
            </Link>
          ) : (
            <span />
          )}
          <Link href={GUIDES_BASE} className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-turf">
            All nine patterns
          </Link>
          {next ? (
            <Link href={`${GUIDES_BASE}/${next.slug}`} className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-turf">
              {patternOf(next.pattern)?.name} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
