import Link from "next/link";
import type { Metadata } from "next";
import {
  DOWNLOADS,
  LATEST,
  LEAGUE_META,
  PROVENANCE,
  SEASON_SPAN,
  SOURCES,
} from "@/lib/data-source";
import ThemeToggle from "@/components/theme-toggle";
import AppNav from "@/components/app-nav";

export const metadata: Metadata = {
  title: "Where the data comes from — DataDraft",
  description:
    "The NFL statistics and fantasy data behind every DataDraft lesson: the sources, the licences, exactly how much of each table is real, and how to download it yourself.",
};

export default function DataPage() {
  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-12 pt-8">
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
          <h2 className="font-display text-xl font-bold text-ink">The sources</h2>
          {SOURCES.map((src) => (
            <div
              key={src.id}
              className="surface mt-3 border border-panel-border bg-panel/40 p-5"
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
                {src.downloadLabel}
              </a>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-muted">
                {src.creditNote}
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
            The stat lines are real, and so is the waiver wire: it is
            Sleeper&apos;s, from week {LEAGUE_META.wireWeek} of{" "}
            {LEAGUE_META.season}. The rosters are a draft run on real Sleeper ADP.
            The order players went in is real, but the five managers are ours,
            because a real league&apos;s rosters belong to the people in it. We
            would rather say exactly that than let you assume more.
          </p>
          <div className="mt-4 space-y-2">
            {PROVENANCE.map((t) => (
              <div
                key={t.table}
                className="surface flex flex-col gap-1.5 border border-panel-border bg-panel/30 p-4 sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                      t.kind === "real"
                        ? "border-turf/60 bg-turf/10 text-turf"
                        : "border-gold/60 bg-gold/10 text-gold"
                    }`}
                  >
                    {t.label}
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
                className="surface flex items-center justify-between gap-4 border border-panel-border bg-panel/30 px-4 py-3 transition-colors hover:border-turf/50 hover:bg-panel/60"
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
        <section className="surface mt-10 border border-panel-border bg-panel/40 p-5">
          <h2 className="font-display text-lg font-bold text-ink">
            What is covered
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Regular seasons from {SEASON_SPAN}, PPR scoring, one row per game a
            player actually played. The newest season stops at its last
            completed week when the lesson data was built, and the lesson data
            is pinned: it is rebuilt by hand, so an answer never changes under
            you mid-course. The {LATEST.season} season is live elsewhere on the
            site. Missed games are absent rather than recorded as zero, which is
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
    </>
  );
}
