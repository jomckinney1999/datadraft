import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allLiveLessons, getLesson, MODULES, moduleUnits } from "@/lib/curriculum";
import { courseByModule } from "@/lib/courses";
import { courseModuleOfUnit } from "@/lib/lesson-nav";
import LessonPlayer from "@/components/lesson-player";
import type { OutlineData } from "@/components/lesson-outline";

export function generateMetadata({ params }: { params: { lessonId: string } }): Metadata {
  const entry = getLesson(params.lessonId);
  if (!entry) return {};
  // The tab used to read "Courses" on every one of the 180 lessons.
  return { title: `${entry.lesson.title} — DataDraft`, description: entry.lesson.blurb };
}

export function generateStaticParams() {
  return allLiveLessons().map(({ lesson }) => ({ lessonId: lesson.id }));
}

/**
 * The player gets its own lesson, its unit and its course's outline from
 * here, so the page's JavaScript carries one lesson instead of the whole
 * curriculum (2026-10-06).
 */
export default function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const entry = getLesson(params.lessonId);
  if (!entry) notFound();
  const courseId = courseModuleOfUnit(entry.unit.id);
  const outline: OutlineData | null = courseId
    ? {
        moduleId: courseId,
        title: courseByModule(courseId)?.title ?? MODULES.find((m) => m.id === courseId)?.name ?? "",
        units: moduleUnits(courseId).map((u) => ({
          id: u.id,
          title: u.title,
          description: u.description,
          status: u.status,
          lessons: u.lessons.map((l) => ({ id: l.id, title: l.title })),
        })),
      }
    : null;
  return (
    <LessonPlayer
      lessonId={params.lessonId}
      lesson={entry.lesson}
      unit={{ id: entry.unit.id, title: entry.unit.title }}
      outline={outline}
    />
  );
}
