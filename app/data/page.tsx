import Link from "next/link";
import type { Metadata } from "next";
import {
  DOWNLOADS,
  LESSON_SEASONS,
  PROVENANCE,
  SOURCES,
} from "@/lib/data-source";
import ThemeToggle from "@/components/theme-toggle";
import HomeLink from "@/components/home-link";

export const metadata: Metadata = {
  title: "Where the data comes from — SQL Sports",
  description:
    "The NFL statistics behind every SQL Sports lesson: the source, the licence, what is real, what is illustrative, and how to download it yourself.",
};

export default function DataPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-12">
      <div className="mb-8">
        <HomeLink label="data" />
      </div>

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="label-broadcast text-turf">the numbers</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Where the data comes from
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Every stat you query in a lesson is a real NFL result you can check
            against any box score. It is free, it is public, and this page tells
            you exactly where to get it.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* ── the source ── */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink">The source</h2>
        {SOURCES.map((src) => (
          <div
            key={src.id}
            className="mt-3 border border-panel-border bg-panel/40 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[15px] font-semibold text-turf underline underline-offset-4 hover:text-gold"
              >
                {src.name}
              </a>
              <a
                href={src.licenceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted hover:border-turf/50 hover:text-turf"
              >
                {src.licence}
              </a>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {src.provides}
            </p>
            <a
              href={src.downloadUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-block border border-turf bg-turf/15 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
            >
              Download the full dataset, free →
            </a>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-muted">
              nflverse is maintained by volunteers. If you use it in your own
              work, credit them — that is the whole of the licence.
            </p>
          </div>
        ))}
      </section>

      {/* ── what's real ── */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink">
          What is real, and what is not
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The stat lines are real. The fantasy league wrapped around them is
          invented, because who owns a player is a fact about one private
          league, not about the NFL. We would rather say so than let you assume
          otherwise.
        </p>
        <div className="mt-4 space-y-2">
          {PROVENANCE.map((t) => (
            <div
              key={t.table}
              className="flex flex-col gap-1.5 border border-panel-border bg-panel/30 p-4 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                    t.kind === "real"
                      ? "border-turf/60 bg-turf/10 text-turf"
                      : "border-gold/60 bg-gold/10 text-gold"
                  }`}
                >
                  {t.kind === "real" ? "real" : "illustrative"}
                </span>
                <code className="font-mono text-[12px] text-ink">
                  {t.table}
                </code>
              </div>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {t.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── downloads ── */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink">
          Take the data with you
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          These are the exact tables the lessons load — not a sample of them.
          Open them in Excel, load them into your own database, or point pandas
          at them and redo every exercise in your own tool.
        </p>
        <div className="mt-4 space-y-2">
          {DOWNLOADS.map((d) => (
            <a
              key={d.file}
              href={d.file}
              download
              className="flex items-center justify-between gap-4 border border-panel-border bg-panel/30 px-4 py-3 transition-colors hover:border-turf/50 hover:bg-panel/60"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[13px] text-turf">
                  {d.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-ink-muted">
                  {d.note}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                CSV ↓
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── coverage ── */}
      <section className="mt-10 border border-panel-border bg-panel/40 p-5">
        <h2 className="font-display text-lg font-bold text-ink">
          What is covered
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The {LESSON_SEASONS[0]}–{LESSON_SEASONS[LESSON_SEASONS.length - 1]}{" "}
          regular seasons, PPR scoring, one row per game a player actually
          played. Missed games are absent rather than recorded as zero, which is
          why <code className="font-mono text-[12px] text-turf">COUNT(*)</code>{" "}
          on a player returns the games they played and not a tidy 17 — and why
          the JOIN lessons have something real to teach.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Basketball and baseball are not covered yet. When they are, they will
          be sourced and credited on this page the same way.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-panel-border pt-6">
        <Link
          href="/learn"
          className="border border-turf bg-turf/15 px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
        >
          Start a course
        </Link>
        <Link
          href="/field"
          className="border border-panel-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted transition-colors hover:border-turf/50 hover:text-turf"
        >
          Query it yourself
        </Link>
      </div>
    </main>
  );
}
