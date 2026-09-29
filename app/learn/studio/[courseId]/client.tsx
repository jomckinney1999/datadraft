"use client";

import Link from "next/link";
import AppNav from "@/components/app-nav";
import StudioPlayer from "@/components/studio-player";
import { getStudioCourse } from "@/lib/studio";
import { useLearnMode } from "@/lib/use-learn-mode";
import { useCareerRole } from "@/lib/use-career-role";

export default function StudioCourseClient({ courseId }: { courseId: string }) {
  const course = getStudioCourse(courseId);
  const { setMode } = useLearnMode();
  const { roleId } = useCareerRole();

  return (
    <>
      <AppNav back="/learn/studio" backLabel="all studio courses" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {course?.colabUrl && (
            <a
              href={course.colabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="status-chip hover:border-turf/50 hover:text-turf"
            >
              Course Colab ↗
            </a>
          )}
          <Link
            href={roleId ? `/learn/path/${roleId}` : "/learn"}
            onClick={() => setMode("drills")}
            className="status-chip hover:border-ice/50 hover:text-ice"
          >
            Switch to snaps
          </Link>
        </div>

        <StudioPlayer courseId={courseId} />
      </main>
    </>
  );
}
