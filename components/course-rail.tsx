"use client";

/**
 * The course rail — a slow, continuous marquee of every course.
 *
 * A static grid of ten cards is a wall to read. A rail moving at walking
 * pace reads as a catalogue going past, which is the right feeling for a
 * landing page: you are being shown the range, not asked to choose yet.
 *
 * The seam trick: the list is rendered twice and the track slides exactly
 * -50%, so the second copy arrives where the first began and the loop is
 * invisible. Width comes from the content, so adding a course needs no
 * arithmetic anywhere.
 *
 * It pauses on hover and on keyboard focus. A card sliding out from under a
 * cursor that is trying to click it is a genuinely annoying way to lose a
 * click, and a focused link that keeps moving is worse.
 *
 * Under prefers-reduced-motion the animation stops entirely and the rail
 * becomes an ordinary horizontal scroller — same content, same order, no
 * movement anyone did not ask for.
 */

import Link from "next/link";
import { COURSES, type Course } from "@/lib/courses";
import CourseCover from "@/components/course-cover";
import CourseArt from "@/components/course-art";

function RailCard({ course }: { course: Course }) {
  const live = course.status === "live";
  const accentText = course.accent === "turf" ? "text-turf" : "text-gold";
  const body = (
    <>
      <div className="relative h-32 overflow-hidden border-b border-panel-border bg-night">
        <CourseCover
          id={course.id}
          accent={course.accent}
          className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
        />
        <div
          aria-hidden
          className="cover-scrim pointer-events-none absolute inset-0"
        />
        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
          <CourseArt
            id={course.id}
            className={`h-10 w-full max-w-[120px] ${accentText}`}
          />
          <p className="mt-1.5 font-display text-[13px] font-bold uppercase leading-tight tracking-tight text-pop">
            {course.title}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {course.lessons} lessons
          </span>
          <span className="rounded-md border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {course.hours}h
          </span>
        </div>
        <p className="mt-2 line-clamp-2 flex-1 text-[12px] leading-relaxed text-ink-muted">
          {course.blurb}
        </p>
        <p
          className={`mt-2 font-mono text-[10px] font-bold uppercase tracking-wider ${
            live ? accentText : "text-ink-muted"
          }`}
        >
          {live ? "Open course →" : "In build"}
        </p>
      </div>
    </>
  );

  const shell =
    "group surface mx-2 flex w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel transition-colors";

  if (!live || !course.moduleId) {
    return <div className={`${shell} opacity-70`}>{body}</div>;
  }
  return (
    <Link
      href={`/learn/track/${course.moduleId}`}
      className={`${shell} hover:border-turf/50`}
    >
      {body}
    </Link>
  );
}

export default function CourseRail() {
  return (
    <div className="rail-mask overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="rail-track py-2">
        {/* Rendered twice on purpose — see the note at the top of the file.
            The second pass is decoration, so it is hidden from assistive
            tech rather than read out as ten more courses. */}
        {COURSES.map((c) => (
          <RailCard key={c.id} course={c} />
        ))}
        <div aria-hidden className="flex">
          {COURSES.map((c) => (
            <RailCard key={`dup-${c.id}`} course={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
