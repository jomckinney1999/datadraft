import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStudioCourse } from "@/lib/studio";
import StudioCourseClient from "./client";

export function generateStaticParams() {
  // Soft list — studio catalog is derived at runtime from live courses.
  return [
    { courseId: "sql-fundamentals" },
    { courseId: "python" },
    { courseId: "excel" },
    { courseId: "sql-advanced" },
    { courseId: "stats" },
    { courseId: "git" },
    { courseId: "r" },
    { courseId: "viz" },
  ];
}

export function generateMetadata({
  params,
}: {
  params: { courseId: string };
}): Metadata {
  const course = getStudioCourse(params.courseId);
  return {
    title: course ? `${course.title} Studio — DataDraft` : "Studio — DataDraft",
    description: course?.blurb,
  };
}

export default function StudioCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  if (!getStudioCourse(params.courseId)) notFound();
  return <StudioCourseClient courseId={params.courseId} />;
}
