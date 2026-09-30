import type { Metadata } from "next";
import FieldBackdrop from "@/components/field-backdrop";
import QuestionArt from "@/components/question-art";
import CourseArt from "@/components/course-art";
import ProjectArt from "@/components/project-art";

/**
 * The Notion HQ cover, drawn from the site's own parts: the hero's field,
 * the brand mark and the sticker art. Not linked from anywhere; it exists
 * so the cover can be re-shot when the look changes, instead of editing a
 * PNG. Shoot it at 1500×600 (see CLAUDE.md → brand assets) into
 * public/brand/notion-cover.png.
 *
 * Notion crops a cover to a short band across the middle of the image on a
 * desktop, so everything that matters sits in the middle ~45% of the height
 * and the top and bottom are only field. No numbers on it: a cover is not
 * re-shot often, and a stale count on the first thing a partner sees would
 * be the wrong first impression.
 */
export const metadata: Metadata = {
  title: "DataDraft cover",
  robots: { index: false, follow: false },
};

const CARDS = [
  { label: "Daily questions", tone: "text-turf", tilt: "-rotate-3 translate-y-2", art: <QuestionArt art="quarterback" className="h-full w-full" /> },
  { label: "Courses", tone: "text-ice", tilt: "rotate-2 -translate-y-3", art: <CourseArt id="sql-fundamentals" className="h-full w-full" /> },
  { label: "Projects", tone: "text-gold", tilt: "-rotate-2 translate-y-3", art: <ProjectArt id="fantasy-points-model" className="h-full w-full" /> },
  { label: "SQL · Python · R · Excel", tone: "text-turf", tilt: "rotate-3 -translate-y-1", art: <CourseArt id="python" className="h-full w-full" /> },
];

export default function NotionCover() {
  return (
    // The chalkboard plays and thrown balls are placed around the hero's
    // centred headline; on this left-aligned layout they run straight
    // through the wordmark, so the cover keeps only the field and the light.
    <main className="field-stage h-[600px] w-[1500px] [&_.ball-x]:hidden [&_.field-plays]:!hidden">
      <FieldBackdrop />
      <div aria-hidden className="field-layer dot-field" />

      <div className="relative flex h-full items-center gap-14 px-20">
        <div className="w-[470px] shrink-0">
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element -- a static brand SVG on an unlinked page */}
            <img
              src="/brand/datadraft-avatar.svg"
              alt=""
              className="h-24 w-24 rounded-full shadow-lg"
            />
            <p className="font-display text-7xl font-bold tracking-tight text-pop">
              Data<span className="title-glow-turf text-turf">Draft</span>
            </p>
          </div>
          <p className="mt-5 font-display text-2xl font-semibold text-ink">
            LeetCode for football data.
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-ink-muted">
            Real NFL scoring · practice every day
          </p>
        </div>

        <div className="flex flex-1 items-center justify-between">
          {CARDS.map((c) => (
            <figure
              key={c.label}
              className={`surface w-[196px] overflow-hidden rounded-2xl border border-panel-border bg-panel ${c.tilt}`}
            >
              <div className="h-[147px] w-full bg-night/60">{c.art}</div>
              <figcaption
                className={`whitespace-nowrap border-t border-panel-border px-2 py-2.5 text-center font-mono text-[11px] font-bold uppercase ${c.tone}`}
              >
                {c.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </main>
  );
}
