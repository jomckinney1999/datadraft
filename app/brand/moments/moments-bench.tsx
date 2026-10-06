"use client";

import { useEffect } from "react";
import { preloadBigMoments, useBigMoments } from "@/components/big-moment";
import { lessonMoment, promotedMoment, type Moment } from "@/lib/big-moments";
import { RANKS } from "@/lib/tenure";

const LESSON = ["a", "b", "c"];

const SAMPLES: { label: string; moment: Moment }[] = [
  {
    label: "Lesson finished",
    moment: lessonMoment({
      lessonId: "demo-l2",
      lessonTitle: "Filter rows with WHERE",
      unit: { id: "demo-u", title: "Filter with WHERE", lessons: LESSON },
      course: null,
      before: [],
      after: ["a"],
    }),
  },
  {
    label: "Unit cleared",
    moment: lessonMoment({
      lessonId: "c",
      lessonTitle: "Filter rows with WHERE",
      unit: { id: "demo-u", title: "Filter with WHERE", lessons: LESSON },
      course: null,
      before: ["a", "b"],
      after: LESSON,
    }),
  },
  {
    label: "Course cleared",
    moment: lessonMoment({
      lessonId: "c",
      lessonTitle: "The final",
      unit: { id: "demo-u", title: "The Final", lessons: LESSON },
      course: { id: "python", title: "Python & pandas", lessons: LESSON },
      before: ["a", "b"],
      after: LESSON,
    }),
  },
  { label: "Promoted", moment: promotedMoment(RANKS[3], RANKS) },
  { label: "Promoted to the top", moment: promotedMoment(RANKS[RANKS.length - 1], RANKS) },
];

export default function MomentsBench() {
  const moments = useBigMoments();
  useEffect(() => preloadBigMoments(), []);
  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SAMPLES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            data-moment={i}
            onClick={() => moments.play({ ...s.moment, key: `${s.moment.key}:${Date.now()}` })}
            className="surface rounded-xl border border-panel-border bg-panel px-4 py-3 text-left font-semibold text-ink hover:border-turf/60"
          >
            {s.label}
            <span className="mt-0.5 block font-mono text-xs font-normal text-ink-muted">{s.moment.kind}</span>
          </button>
        ))}
      </div>
      {moments.node}
    </>
  );
}
