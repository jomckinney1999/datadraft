"use client";

/**
 * Coach's briefing before a course starts.
 *
 * Learners used to land on a board of locked nodes with no idea what the
 * course covered, how lessons worked, what data they'd use, or what they'd be
 * able to do at the end.
 *
 * Density rule: this is one card, and it is only open when it is genuinely
 * needed — before the first lesson of the course is done. After that it
 * collapses to a single line you can reopen. A briefing that stays expanded
 * forever is just clutter on every future visit.
 */

import { useState } from "react";
import Coach from "@/components/coach";
import {
  DEFAULT_HOW_IT_WORKS,
  type CourseIntro as Intro,
} from "@/lib/course-intros";

export default function CourseIntro({
  intro,
  courseTitle,
  hours,
  started,
}: {
  intro: Intro;
  courseTitle: string;
  hours?: number;
  /** True once any lesson in this course is done — collapses the brief. */
  started: boolean;
}) {
  const [open, setOpen] = useState(false);
  const how = intro.howItWorks ?? DEFAULT_HOW_IT_WORKS;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-panel-border bg-panel/60 px-4 py-2.5 text-left transition-colors hover:border-turf/40"
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          What this course covers
        </span>
        <span className="font-mono text-[11px] text-turf">read the brief ↓</span>
      </button>
    );
  }

  return (
    <section className="surface mt-4 rounded-2xl border border-panel-border bg-panel p-5">
      <div className="flex items-start gap-3">
        <Coach mood="whistle" size={64} className="hidden shrink-0 sm:block" />
        <div className="min-w-0 flex-1">
          <p className="label-broadcast text-gold">coach&rsquo;s brief</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">
            {courseTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {intro.greeting}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Hide the brief"
          className="press shrink-0 rounded-full border border-panel-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
        >
          hide
        </button>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Block title="What you'll learn" items={intro.whatYouLearn} accent="turf" />
        <Block title="How it works" items={how} accent="ice" />
      </div>

      <div className="mt-5 rounded-xl border border-panel-border bg-night/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          The data you&rsquo;ll use
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {intro.dataset.line}
        </p>
        {intro.dataset.tables && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {intro.dataset.tables.map((t) => (
              <span
                key={t}
                className="rounded-full border border-panel-border px-2 py-0.5 font-mono text-[11px] text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {intro.dataset.note && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {intro.dataset.note}
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
          When you finish, you can
        </p>
        <ul className="mt-1.5 space-y-1">
          {intro.outcome.map((o) => (
            <li key={o} className="text-sm leading-relaxed text-ink-soft">
              <span className="mr-2 text-gold">›</span>
              {o}
            </li>
          ))}
        </ul>
        {hours ? (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            About {hours} hours end to end · go at your own pace
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Block({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: "turf" | "ice";
}) {
  return (
    <div>
      <p
        className={`font-mono text-[10px] uppercase tracking-widest ${
          accent === "turf" ? "text-turf" : "text-ice"
        }`}
      >
        {title}
      </p>
      <ul className="mt-1.5 space-y-1">
        {items.map((i) => (
          <li key={i} className="text-sm leading-relaxed text-ink-soft">
            <span
              className={`mr-2 ${accent === "turf" ? "text-turf" : "text-ice"}`}
            >
              ·
            </span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
