/**
 * Career paths: pick a target job title, get an ordered course formula.
 *
 * The board is one continuous Duolingo path: every live lesson from course 1,
 * then course 2, and so on. Building courses still appear at the end, locked.
 */

import { COURSES, courseById, type Course } from "./courses";
import { CAREER } from "./career";
import { liveLessons, type Lesson, type Unit } from "./curriculum";

export type CareerRole = {
  id: string;
  title: string;
  blurb: string;
  courseIds: string[];
  why: string;
};

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "The most common first data job — pull, clean, and present answers.",
    courseIds: ["sql-fundamentals", "excel", "python", "tableau", "ai"],
    why: "SQL to get the data, Excel to present it, Python when the question outgrows a sheet, then visualization so stakeholders can use it without you in the room.",
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    blurb: "Ops, finance, and stakeholder work — spreadsheets first, SQL next.",
    courseIds: ["excel", "sql-fundamentals", "powerbi", "stats"],
    why: "Most BA work still lives in spreadsheets. SQL unlocks the warehouse; Power BI is what a lot of corporate teams standardize on; stats keeps you from reporting flukes.",
  },
  {
    id: "analytics-engineer",
    title: "Analytics Engineer",
    blurb: "Own the models other people query — SQL depth plus version control.",
    courseIds: ["sql-fundamentals", "sql-advanced", "git", "python"],
    why: "Fundamentals then Advanced SQL (windows, CTEs) is the hiring filter. Git is assumed on day one. Python covers the awkward jobs SQL alone cannot.",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    blurb: "Analysis that needs code, stats, and a clean pull from the database.",
    courseIds: ["sql-fundamentals", "python", "stats", "sql-advanced", "ai"],
    why: "SQL first so you are not filtering in memory. Python and stats are the core loop. Advanced SQL shows up when the questions get senior.",
  },
  {
    id: "bi-analyst",
    title: "BI Analyst",
    blurb: "Dashboards and reporting for decision makers.",
    courseIds: ["sql-fundamentals", "excel", "tableau", "powerbi"],
    why: "Every dashboard sits on a query. Excel covers ad-hoc asks; Tableau and Power BI are the two tools postings name for published dashboards.",
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    blurb: "Pipelines and warehouses — SQL depth, Python, and Git.",
    courseIds: ["sql-fundamentals", "sql-advanced", "python", "git"],
    why: "Strong SQL is non-negotiable. Advanced SQL and Python cover transforms; Git is how the work ships.",
  },
];

export type PathStep = {
  index: number;
  course: Course;
  done: number;
  total: number;
  pct: number;
  complete: boolean;
  unlocked: boolean;
  current: boolean;
};

export type BoardLesson = {
  lesson: Lesson;
  unit: Unit;
  course: Course;
  courseIndex: number;
  globalIndex: number;
  state: "completed" | "current" | "locked";
};

export type BoardSegment =
  | {
      kind: "course-header";
      course: Course;
      courseIndex: number;
      done: number;
      total: number;
    }
  | { kind: "unit-divider"; label: string; unitId: string }
  | { kind: "lesson"; node: BoardLesson }
  | { kind: "chest"; open: boolean; id: string }
  | { kind: "course-clear"; course: Course; open: boolean }
  | { kind: "building"; course: Course; courseIndex: number };

export function getRole(id: string): CareerRole | undefined {
  return CAREER_ROLES.find((r) => r.id === id);
}

export function careerNoteFor(courseId: string) {
  return CAREER[courseId];
}

/** Course-level summary (role picker chips + continue CTA). */
export function pathSteps(
  role: CareerRole,
  completedLessons: string[],
): PathStep[] {
  const doneSet = new Set(completedLessons);
  let priorLiveComplete = true;

  const steps: PathStep[] = role.courseIds.flatMap((courseId, index) => {
    const course = courseById(courseId);
    if (!course) return [];

    const lessons = course.moduleId ? liveLessons(course.moduleId) : [];
    const total = lessons.length;
    const done = lessons.filter((e) => doneSet.has(e.lesson.id)).length;
    const complete = course.status === "live" && total > 0 && done >= total;
    const unlocked = priorLiveComplete;

    if (course.status === "live" && total > 0) {
      priorLiveComplete = complete;
    }

    return [
      {
        index,
        course,
        done,
        total,
        pct: total === 0 ? 0 : Math.round((done / total) * 100),
        complete,
        unlocked,
        current: false,
      },
    ];
  });

  const current =
    steps.find(
      (s) =>
        s.unlocked &&
        s.course.status === "live" &&
        s.total > 0 &&
        !s.complete,
    ) ??
    [...steps]
      .reverse()
      .find((s) => s.course.status === "live" && s.total > 0);

  if (current) current.current = true;
  return steps;
}

/**
 * One continuous board: every live lesson in formula order. Finish the last
 * SQL lesson and the next node is Excel's first — same path, next course.
 */
export function buildBoard(
  role: CareerRole,
  completedLessons: string[],
): {
  segments: BoardSegment[];
  lessons: BoardLesson[];
  current: BoardLesson | null;
} {
  const doneSet = new Set(completedLessons);
  const flat: Omit<BoardLesson, "state">[] = [];

  role.courseIds.forEach((courseId, courseIndex) => {
    const course = courseById(courseId);
    if (!course?.moduleId || course.status !== "live") return;
    for (const { lesson, unit } of liveLessons(course.moduleId)) {
      flat.push({
        lesson,
        unit,
        course,
        courseIndex,
        globalIndex: flat.length,
      });
    }
  });

  const firstOpen = flat.findIndex((n) => !doneSet.has(n.lesson.id));
  const activeIdx =
    firstOpen === -1 ? Math.max(0, flat.length - 1) : firstOpen;

  const lessons: BoardLesson[] = flat.map((n, i) => {
    if (doneSet.has(n.lesson.id)) {
      return { ...n, state: "completed" };
    }
    if (i === activeIdx) return { ...n, state: "current" };
    if (i < activeIdx) return { ...n, state: "completed" };
    return { ...n, state: "locked" };
  });

  if (firstOpen === -1 && lessons.length > 0) {
    for (const l of lessons) l.state = "completed";
    lessons[lessons.length - 1].state = "current";
  }

  const segments: BoardSegment[] = [];
  let lastCourseId: string | null = null;
  let lastUnitId: string | null = null;
  let lessonsInCourse = 0;

  for (const node of lessons) {
    if (node.course.id !== lastCourseId) {
      if (lastCourseId) {
        const prevLessons = lessons.filter((l) => l.course.id === lastCourseId);
        const allDone = prevLessons.every((l) => doneSet.has(l.lesson.id));
        segments.push({
          kind: "course-clear",
          course: courseById(lastCourseId)!,
          open: allDone,
        });
        segments.push({
          kind: "chest",
          open: allDone,
          id: `between-${lastCourseId}-${node.course.id}`,
        });
      }

      const inCourse = lessons.filter((l) => l.course.id === node.course.id);
      segments.push({
        kind: "course-header",
        course: node.course,
        courseIndex: node.courseIndex,
        done: inCourse.filter((l) => doneSet.has(l.lesson.id)).length,
        total: inCourse.length,
      });
      lastCourseId = node.course.id;
      lastUnitId = null;
      lessonsInCourse = 0;
    }

    if (node.unit.id !== lastUnitId) {
      segments.push({
        kind: "unit-divider",
        label: node.unit.title,
        unitId: node.unit.id,
      });
      lastUnitId = node.unit.id;
    }

    if (lessonsInCourse > 0 && lessonsInCourse % 5 === 0) {
      segments.push({
        kind: "chest",
        open: node.globalIndex > 0 && doneSet.has(lessons[node.globalIndex - 1].lesson.id),
        id: `mid-${node.course.id}-${lessonsInCourse}`,
      });
    }

    segments.push({ kind: "lesson", node });
    lessonsInCourse += 1;
  }

  if (lastCourseId) {
    const prevLessons = lessons.filter((l) => l.course.id === lastCourseId);
    const allDone = prevLessons.every((l) => doneSet.has(l.lesson.id));
    segments.push({
      kind: "course-clear",
      course: courseById(lastCourseId)!,
      open: allDone,
    });
  }

  role.courseIds.forEach((courseId, courseIndex) => {
    const course = courseById(courseId);
    if (!course || course.status !== "building") return;
    segments.push({ kind: "building", course, courseIndex });
  });

  return {
    segments,
    lessons,
    current: lessons.find((l) => l.state === "current") ?? null,
  };
}

export function roleHours(role: CareerRole): number {
  return role.courseIds.reduce((sum, id) => {
    const c = courseById(id);
    return sum + (c?.hours ?? 0);
  }, 0);
}

export function coursesOnAnyPath(): Course[] {
  const ids = new Set(CAREER_ROLES.flatMap((r) => r.courseIds));
  return COURSES.filter((c) => ids.has(c.id));
}
