import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MODULES, getModule } from "@/lib/curriculum";
import CourseRoadmap from "@/components/course-roadmap";

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
  return <CourseRoadmap moduleId={getModule(params.moduleId).id} />;
}
