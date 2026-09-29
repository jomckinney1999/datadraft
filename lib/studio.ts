/**
 * Studio track — Udemy-style outline: video + notebook per topic.
 *
 * Videos land as YouTube/Vimeo URLs when recorded. Until then the player
 * shows a watch-along shell and the Colab (or in-browser) CTA stays the
 * hands-on surface. Outline is derived from live curriculum units so it
 * can't drift from what drills teach.
 */

import { COURSES } from "./courses";
import { getModule, moduleUnits, type Unit } from "./curriculum";
import { getProject } from "./projects";

export type StudioTopic = {
  id: string;
  title: string;
  /** Optional YouTube/Vimeo embed URL. Empty = placeholder shell. */
  videoUrl: string | null;
  /** Minutes shown in the sidebar (estimate until real videos). */
  minutes: number;
  /** Plain intro under the player. */
  summary: string;
  /** Open-in-Colab or drill deep-link. */
  notebook?: { label: string; href: string };
  /** Graded drill twin, if any. */
  drillLessonId?: string;
};

export type StudioSection = {
  id: string;
  title: string;
  topics: StudioTopic[];
};

export type StudioCourse = {
  id: string;
  title: string;
  blurb: string;
  accent: "turf" | "gold" | "ice";
  /** Hero Colab for the whole course (optional). */
  colabUrl: string | null;
  sections: StudioSection[];
};

const LEAGUE = getProject("my-league-scorecard");

/** Hand-authored video slots + Colab hooks. Keys = unit id or lesson id. */
const VIDEO_BY_LESSON: Record<string, string> = {
  // Fill as recordings land, e.g.:
  // "u7-l1": "https://www.youtube.com/embed/…",
};

function topicMinutes(lessonCount: number): number {
  // Rough Udemy pacing until real durations exist.
  return Math.max(4, Math.min(18, 3 + lessonCount * 2));
}

function unitToSection(unit: Unit, courseId: string): StudioSection {
  return {
    id: unit.id,
    title: unit.title,
    topics: unit.lessons.map((lesson) => {
      const isPython = courseId === "python";
      const isSql =
        courseId === "sql-fundamentals" || courseId === "sql-advanced";
      const notebook =
        isSql && LEAGUE
          ? { label: "Open Colab project", href: LEAGUE.colabUrl }
          : isPython
            ? {
                label: "Open blank Colab",
                href: "https://colab.research.google.com/",
              }
            : courseId === "excel"
              ? { label: "Open Spreadsheet", href: "/excel" }
              : {
                  label: "Try the graded drill",
                  href: `/learn/${lesson.id}`,
                };

      return {
        id: lesson.id,
        title: lesson.title,
        videoUrl: VIDEO_BY_LESSON[lesson.id] ?? null,
        minutes: topicMinutes(1),
        summary:
          lesson.brief.setup.split("\n")[0]?.slice(0, 220) ||
          lesson.brief.goal,
        notebook,
        drillLessonId: lesson.id,
      };
    }),
  };
}

function buildCourse(
  moduleId: string,
  opts: { accent: StudioCourse["accent"]; colabUrl: string | null },
): StudioCourse | null {
  const mod = getModule(moduleId);
  const catalog = COURSES.find((c) => c.moduleId === moduleId);
  if (!catalog || catalog.status !== "live") return null;
  const units = moduleUnits(moduleId);
  if (units.length === 0) return null;

  return {
    id: moduleId,
    title: catalog.title,
    blurb: catalog.blurb,
    accent: opts.accent,
    colabUrl: opts.colabUrl,
    sections: units.map((u) => unitToSection(u, moduleId)),
  };
}

/** Studio catalog — live, hands-on courses first. */
export const STUDIO_COURSES: StudioCourse[] = [
  buildCourse("sql-fundamentals", {
    accent: "turf",
    colabUrl: LEAGUE?.colabUrl ?? null,
  }),
  buildCourse("python", {
    accent: "ice",
    colabUrl: "https://colab.research.google.com/",
  }),
  buildCourse("excel", {
    accent: "gold",
    colabUrl: null,
  }),
  buildCourse("sql-advanced", {
    accent: "turf",
    colabUrl: LEAGUE?.colabUrl ?? null,
  }),
  buildCourse("stats", { accent: "gold", colabUrl: null }),
  buildCourse("git", { accent: "ice", colabUrl: null }),
  buildCourse("r", {
    accent: "ice",
    colabUrl: "https://colab.research.google.com/",
  }),
  buildCourse("viz", { accent: "gold", colabUrl: null }),
].filter((c): c is StudioCourse => Boolean(c));

export function getStudioCourse(id: string): StudioCourse | undefined {
  return STUDIO_COURSES.find((c) => c.id === id);
}

export function findStudioTopic(
  courseId: string,
  topicId: string,
): { course: StudioCourse; section: StudioSection; topic: StudioTopic } | null {
  const course = getStudioCourse(courseId);
  if (!course) return null;
  for (const section of course.sections) {
    const topic = section.topics.find((t) => t.id === topicId);
    if (topic) return { course, section, topic };
  }
  return null;
}

export function firstTopicId(course: StudioCourse): string | null {
  return course.sections[0]?.topics[0]?.id ?? null;
}

/** YouTube watch URL → embed URL. Pass-through for already-embed links. */
export function toEmbedUrl(url: string): string {
  if (url.includes("/embed/")) return url;
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/.exec(url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

/** Flat count for UI chips. */
export function studioTopicCount(course: StudioCourse): number {
  return course.sections.reduce((n, s) => n + s.topics.length, 0);
}
