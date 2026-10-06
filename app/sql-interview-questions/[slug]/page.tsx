import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppNav from "@/components/app-nav";
import SiteFooter from "@/components/site-footer";
import PrepArt, { hasPrepArt } from "@/components/prep-art";
import QuestionArt from "@/components/question-art";
import InterviewGuide from "@/components/interview-guide";
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

export default function PatternGuidePage({ params }: { params: { slug: string } }) {
  const view = viewFor(params.slug);
  if (!view) notFound();
  const { guide, prev, next } = view;
  const example = QUESTIONS.find((q) => q.id === guide.example);
  const url = `${SITE_URL}${GUIDES_BASE}/${guide.slug}`;

  return (
    <>
      <AppNav back={GUIDES_BASE} backLabel="all nine patterns" />
      <InterviewGuide
        guide={guide}
        url={url}
        crumbs={[{ href: GUIDES_BASE, label: "SQL interview questions", absolute: `${SITE_URL}${GUIDES_BASE}` }]}
        name={view.name}
        label={view.label}
        hero={
          <>
            {view.art === "prep" && hasPrepArt(view.id) && <PrepArt id={view.id} className="absolute inset-0 h-full w-full" />}
            {view.art === "question" && view.questionArt && (
              <QuestionArt art={view.questionArt} className="absolute inset-0 h-full w-full" />
            )}
          </>
        }
        practice={view.practice}
        bankHref={view.bankHref}
        example={example}
        mistakesNote={
          view.art === "prep"
            ? "Make one of these on a DataDraft question and Query Doctor names it, without giving away the answer."
            : "Get one of these wrong on a practice question and Query Doctor compares your result's shape with the answer's (missing columns, extra rows, a join that fanned out) without giving the answer away."
        }
        exampleNote="Grading compares results, not text, so a CTE or a subquery that gets the same rows passes too. On the question, Show solution then Watch the answer run replays it clause by clause, in the order the database runs it."
        cta={{
          title: "Ready to try it under a clock?",
          body: "A mock phone screen is two questions in twenty minutes, then a report on each answer.",
          href: "/questions/mock",
          label: "Run a mock screen",
        }}
        footer={
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
        }
      />
      <SiteFooter />
    </>
  );
}
