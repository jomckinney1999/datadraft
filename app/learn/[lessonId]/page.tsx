import { notFound } from "next/navigation";
import { allLiveLessons, getLesson } from "@/lib/curriculum";
import LessonPlayer from "@/components/lesson-player";

export function generateStaticParams() {
  return allLiveLessons().map(({ lesson }) => ({ lessonId: lesson.id }));
}

export default function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  if (!getLesson(params.lessonId)) notFound();
  return <LessonPlayer lessonId={params.lessonId} />;
}
