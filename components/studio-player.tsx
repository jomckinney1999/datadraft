"use client";

/**
 * Udemy-style Studio player: sidebar curriculum + video (or placeholder) +
 * notebook / Colab CTA. Same curriculum as drills — different delivery.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Coach from "@/components/coach";
import {
  STUDIO_COURSES,
  findStudioTopic,
  firstTopicId,
  getStudioCourse,
  studioTopicCount,
  toEmbedUrl,
  type StudioCourse,
  type StudioTopic,
} from "@/lib/studio";

function accentBorder(accent: StudioCourse["accent"]) {
  if (accent === "ice") return "border-ice/40";
  if (accent === "gold") return "border-gold/40";
  return "border-turf/40";
}

function accentText(accent: StudioCourse["accent"]) {
  if (accent === "ice") return "text-ice";
  if (accent === "gold") return "text-gold";
  return "text-turf";
}

function accentBg(accent: StudioCourse["accent"]) {
  if (accent === "ice") return "bg-ice/15 text-ice";
  if (accent === "gold") return "bg-gold/15 text-gold";
  return "bg-turf/15 text-turf";
}

function VideoStage({
  topic,
  accent,
}: {
  topic: StudioTopic;
  accent: StudioCourse["accent"];
}) {
  if (topic.videoUrl) {
    return (
      <div className="aspect-video overflow-hidden border border-panel-border bg-night">
        <iframe
          title={topic.title}
          src={toEmbedUrl(topic.videoUrl)}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-video flex-col items-center justify-center gap-4 overflow-hidden border bg-night/90 ${accentBorder(accent)}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 yard-lines opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-turf/10 via-transparent to-ice/10" />
      <Coach mood="think" size={96} className="relative" />
      <div className="relative max-w-md px-6 text-center">
        <p className={`label-broadcast ${accentText(accent)}`}>
          video coming soon
        </p>
        <p className="mt-2 font-display text-xl font-bold text-ink">
          Watch-along shell for {topic.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Recordings land here as we film them. Until then, open the notebook
          and work the same ideas hands-on — same curriculum as the snap
          drills, just Colab / spreadsheet paced.
        </p>
      </div>
      <div
        className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] ${accentBorder(accent)} ${accentText(accent)}`}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
        ~{topic.minutes} min when published
      </div>
    </div>
  );
}

export default function StudioPlayer({
  courseId,
  topicId,
}: {
  courseId: string;
  topicId?: string;
}) {
  const course = getStudioCourse(courseId);
  const initial =
    topicId && course
      ? topicId
      : course
        ? firstTopicId(course)
        : null;
  const [activeId, setActiveId] = useState<string | null>(initial);
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    if (topicId) setActiveId(topicId);
  }, [topicId]);

  const located = useMemo(() => {
    if (!course || !activeId) return null;
    return findStudioTopic(course.id, activeId);
  }, [course, activeId]);

  if (!course) {
    return (
      <p className="text-sm text-ink-soft">
        That studio course isn&apos;t live yet.{" "}
        <Link href="/learn/studio" className="text-turf underline">
          Pick another
        </Link>
        .
      </p>
    );
  }

  const topic = located?.topic;
  const section = located?.section;

  // Flat list for prev/next
  const flat = course.sections.flatMap((s) =>
    s.topics.map((t) => ({ sectionId: s.id, topic: t })),
  );
  const idx = flat.findIndex((f) => f.topic.id === activeId);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="flex min-h-[70vh] flex-col gap-0 overflow-hidden rounded-2xl border border-panel-border bg-panel lg:flex-row">
      {/* Sidebar */}
      <aside
        className={`flex shrink-0 flex-col border-panel-border bg-night/60 ${
          navOpen ? "w-full border-b lg:w-72 lg:border-b-0 lg:border-r" : "w-full lg:w-12"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-panel-border px-3 py-3">
          {navOpen ? (
            <div className="min-w-0">
              <p className={`label-broadcast ${accentText(course.accent)}`}>
                studio course
              </p>
              <p className="truncate font-display text-sm font-bold text-ink">
                {course.title}
              </p>
            </div>
          ) : (
            <span className="sr-only">{course.title}</span>
          )}
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="shrink-0 rounded-lg border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-turf"
            aria-expanded={navOpen}
          >
            {navOpen ? "Hide" : "Menu"}
          </button>
        </div>

        {navOpen && (
          <nav className="max-h-[40vh] flex-1 overflow-y-auto lg:max-h-none">
            {course.sections.map((s) => (
              <div key={s.id} className="border-b border-panel-border/60">
                <p className="px-3 pb-1 pt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  {s.title}
                </p>
                <ul>
                  {s.topics.map((t) => {
                    const active = t.id === activeId;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(t.id)}
                          className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                            active
                              ? `${accentBg(course.accent)} font-semibold`
                              : "text-ink-soft hover:bg-panel/80 hover:text-ink"
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 font-mono text-[10px] text-ink-muted">
                            {t.minutes}m
                          </span>
                          <span className="leading-snug">{t.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </aside>

      {/* Main stage */}
      <div className="min-w-0 flex-1">
        {topic && section ? (
          <>
            <div className="border-b border-panel-border px-4 py-3 sm:px-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                Section · {section.title}
              </p>
              <h1 className="mt-0.5 font-display text-xl font-bold text-ink sm:text-2xl">
                {topic.title}
              </h1>
            </div>

            <div className="p-4 sm:p-5">
              <VideoStage topic={topic} accent={course.accent} />

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {topic.notebook && (
                  <a
                    href={topic.notebook.href}
                    target={
                      topic.notebook.href.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      topic.notebook.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="btn-turf inline-flex items-center gap-2 border border-turf/80 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
                  >
                    {topic.notebook.label} ↗
                  </a>
                )}
                {topic.drillLessonId && (
                  <Link
                    href={`/learn/${topic.drillLessonId}`}
                    className="inline-flex items-center rounded-xl border border-ice/40 bg-ice/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ice hover:border-ice"
                  >
                    Practice as a snap →
                  </Link>
                )}
              </div>

              <div className="mt-6 border-t border-panel-border pt-5">
                <p className="label-broadcast text-ink-muted">section notebook</p>
                <h2 className="mt-1 font-display text-lg font-bold text-ink">
                  {section.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  {topic.summary}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-panel-border pt-4">
                {prev ? (
                  <button
                    type="button"
                    onClick={() => setActiveId(prev.topic.id)}
                    className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted hover:text-turf"
                  >
                    ← {prev.topic.title}
                  </button>
                ) : (
                  <span />
                )}
                {next ? (
                  <button
                    type="button"
                    onClick={() => setActiveId(next.topic.id)}
                    className={`font-mono text-[11px] font-bold uppercase tracking-wider ${accentText(course.accent)} hover:underline`}
                  >
                    Next · {next.topic.title} →
                  </button>
                ) : (
                  <span className="font-mono text-[11px] text-ink-muted">
                    End of course
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="p-6 text-sm text-ink-soft">Pick a topic in the sidebar.</p>
        )}
      </div>
    </div>
  );
}

export function StudioCoursePicker() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STUDIO_COURSES.map((c, i) => (
        <Link
          key={c.id}
          href={`/learn/studio/${c.id}`}
          style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
          className={`group animate-fade-up lift overflow-hidden rounded-2xl border-2 bg-panel transition-colors ${accentBorder(c.accent)} hover:border-opacity-100`}
        >
          <div
            className={`relative h-20 bg-gradient-to-br ${
              c.accent === "ice"
                ? "from-ice/20 to-transparent"
                : c.accent === "gold"
                  ? "from-gold/20 to-transparent"
                  : "from-turf/20 to-transparent"
            }`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 yard-lines opacity-40"
            />
            <p
              className={`absolute left-4 top-4 font-mono text-[10px] font-bold uppercase tracking-widest ${accentText(c.accent)}`}
            >
              {studioTopicCount(c)} topics
            </p>
          </div>
          <div className="p-4">
            <h2
              className={`font-display text-lg font-bold text-ink group-hover:${accentText(c.accent)}`}
            >
              <span
                className={
                  c.accent === "ice"
                    ? "group-hover:text-ice"
                    : c.accent === "gold"
                      ? "group-hover:text-gold"
                      : "group-hover:text-turf"
                }
              >
                {c.title}
              </span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.blurb}</p>
            <p
              className={`mt-4 font-mono text-[11px] font-bold uppercase tracking-widest ${accentText(c.accent)}`}
            >
              Open studio →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
