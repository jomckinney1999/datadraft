import type { ReactNode } from "react";
import Link from "next/link";
import QuestionArt from "@/components/question-art";
import DifficultyChip from "@/components/difficulty-chip";
import SqlBlock from "@/components/sql-block";
import type { Question } from "@/lib/questions";
import type { HighlightLang } from "@/lib/highlight";

/**
 * The body of an interview guide page: the pattern, why screens ask it, the
 * shape of an answer, the mistakes, one worked example with its key, every
 * practice question and the FAQ (which also goes out as FAQPage JSON-LD).
 * The nine SQL pattern guides, the topic guides and the pandas guide all
 * render through this, so they can't drift apart (2026-10-06).
 */

export type GuideContent = {
  h1: string;
  lead: string;
  whyAsked: string;
  shape: string;
  shapeNote: string;
  mistakes: { title: string; body: string }[];
  faq: { q: string; a: string }[];
};

const ORDER = { easy: 0, medium: 1, hard: 2 } as const;

function ld(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export default function InterviewGuide({
  guide,
  url,
  crumbs,
  name,
  label,
  hero,
  practice: unsorted,
  bankHref,
  example,
  code = "sql",
  mistakesNote,
  exampleNote,
  cta,
  footer,
}: {
  guide: GuideContent;
  /** This page's canonical URL, for the breadcrumb JSON-LD. */
  url: string;
  /** The breadcrumb trail above this page, root first. */
  crumbs: { href: string; label: string; absolute: string }[];
  name: string;
  /** The line above the h1. */
  label: string;
  /** The drawing on the right of the header. */
  hero: ReactNode;
  practice: Question[];
  bankHref: string;
  example?: Question;
  code?: HighlightLang;
  mistakesNote: string;
  exampleNote: string;
  cta: { title: string; body: string; href: string; label: string };
  footer?: ReactNode;
}) {
  const practice = [...unsorted].sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);
  const counts = (["easy", "medium", "hard"] as const)
    .map((d) => [d, practice.filter((q) => q.difficulty === d).length] as const)
    .filter(([, n]) => n > 0);

  return (
    <>
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
              ...crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.absolute })),
              { "@type": "ListItem", position: crumbs.length + 1, name, item: url },
            ],
          },
        ])}
      />
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
          {crumbs.map((c) => (
            <span key={c.href}>
              <Link href={c.href} className="hover:text-turf">
                {c.label}
              </Link>{" "}
              <span aria-hidden>›</span>{" "}
            </span>
          ))}
          <span className="text-ink-soft">{name}</span>
        </nav>

        {/* ── The pattern ─────────────────────────────────── */}
        <header className="surface mt-4 overflow-hidden rounded-3xl border border-panel-border bg-panel">
          <div className="grid gap-0 sm:grid-cols-[1.3fr_1fr]">
            <div className="p-5 sm:p-7">
              <p className="label-broadcast text-turf">{label}</p>
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
                    href={bankHref}
                    className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/50 hover:text-turf"
                  >
                    All {practice.length} in the bank
                  </Link>
                </div>
              )}
            </div>
            <div className="relative min-h-[11rem] border-t border-panel-border bg-night/50 sm:border-l sm:border-t-0">{hero}</div>
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
          <SqlBlock sql={guide.shape} lang={code} className="mt-3" />
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
          <p className="mt-3 text-sm text-ink-muted">{mistakesNote}</p>
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
                <SqlBlock sql={example.expected} lang={code} className="mt-1.5" />
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-turf">Why it works. </span>
                  {example.explain}
                </p>
                <Link href={`/questions/${example.id}`} className="press btn-turf mt-4 inline-flex text-sm">
                  Run it yourself
                </Link>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{exampleNote}</p>
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
          <p className="font-display text-lg font-bold text-ink">{cta.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{cta.body}</p>
          <Link href={cta.href} className="press btn-gold mt-3 inline-flex text-sm">
            {cta.label}
          </Link>
        </section>

        {footer}
      </main>
    </>
  );
}
