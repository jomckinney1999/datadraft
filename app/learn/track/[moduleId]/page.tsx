import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_MODULE, COURSE, MODULES, getModule, moduleUnits } from "@/lib/curriculum";
import CourseRoadmap, { type RoadmapUnit } from "@/components/course-roadmap";

// One page per course. A static segment ("track") sits above the lesson
// player's [lessonId], so /learn/track/sql and /learn/u1-l1 don't collide.
export function generateStaticParams() {
  return MODULES.map((m) => ({ moduleId: m.id }));
}

export function generateMetadata({
  params,
}: {
  params: { moduleId: string };
}): Metadata {
  const mod = MODULES.find((m) => m.id === params.moduleId);
  return {
    title: mod ? `${mod.name} — DataDraft` : "Course — DataDraft",
    description: mod?.blurb,
  };
}

export default function TrackPage({
  params,
}: {
  params: { moduleId: string };
}) {
  if (!MODULES.some((m) => m.id === params.moduleId)) notFound();
  const mod = getModule(params.moduleId);
  // Each lesson cut to what the path draws, so the page doesn't ship the
  // exercises of every lesson in the course.
  const units: RoadmapUnit[] = moduleUnits(mod.id).map((u) => ({
    ...u,
    lessons: u.lessons.map((l) => ({ id: l.id, title: l.title })),
  }));
  const isAll = mod.id === ALL_MODULE;
  return (
    <CourseRoadmap
      moduleId={mod.id}
      units={units}
      title={isAll ? COURSE.title : mod.name}
      blurb={isAll ? COURSE.tagline : mod.blurb}
    />
  );
}
