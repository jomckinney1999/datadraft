/**
 * The course catalog shown on /learn.
 *
 * A "course" here is the learner-facing product (SQL, Tableau, Excel …). Where
 * lessons already exist, `moduleId` points at the matching module in
 * lib/curriculum.ts and the card links into that roadmap. Where they don't,
 * `moduleId` is null and the card is marked "In build" — never dressed up as
 * ready. Full lesson-by-lesson plans for all nine live in
 * docs/COURSE-CATALOG.md.
 *
 * `lessons` / `projects` describe the SPEC (what the finished course covers),
 * while `builtLessons` is computed from the real curriculum at render time.
 * Keep those two honest about each other — the card shows both.
 */

import { ALL_MODULE } from "./curriculum";

export type CourseStatus = "live" | "building";

export type Course = {
  id: string;
  /** Module id in lib/curriculum.ts, or null when nothing is built yet. */
  moduleId: string | null;
  title: string;
  /** Short mark shown on the card thumbnail. */
  mark: string;
  blurb: string;
  hours: number;
  /** Lessons in the full spec (docs/COURSE-CATALOG.md), not what's built. */
  lessons: number;
  projects: number;
  level: string;
  accent: "turf" | "gold";
  status: CourseStatus;
  /** True when exercises execute the learner's real code. */
  liveCode?: boolean;
};

export const COURSES: Course[] = [
  {
    id: "sql",
    moduleId: "sql",
    title: "SQL for Data Analytics",
    mark: "SQL",
    blurb:
      "From your first SELECT to window functions, every query run against a real database in your browser. The most-asked-for skill on any analyst posting.",
    hours: 12,
    lessons: 62,
    projects: 1,
    level: "Beginner → Advanced",
    accent: "turf",
    status: "live",
    liveCode: true,
  },
  {
    id: "python",
    moduleId: "python",
    title: "Python & pandas",
    mark: "Py",
    blurb:
      "Variables to DataFrames, with real Python executing as you type. Every SQL verb you know has a pandas twin — you already understand half of it.",
    hours: 14,
    lessons: 64,
    projects: 1,
    level: "Beginner → Advanced",
    accent: "gold",
    status: "live",
    liveCode: true,
  },
  {
    id: "stats",
    moduleId: "stats",
    title: "Statistics That Hold Up",
    mark: "Stat",
    blurb:
      "Sample size, significance, and regression to the mean. The course that stops you confidently reporting a fluke — and the reason anyone trusts your numbers.",
    hours: 11,
    lessons: 54,
    projects: 1,
    level: "Beginner → Advanced",
    accent: "turf",
    status: "live",
  },
  {
    id: "excel",
    moduleId: null,
    title: "Excel for Analysts",
    mark: "XL",
    blurb:
      "Lookups, PivotTables, and workbooks someone else can actually use. The tool that appears on more job postings than every other skill here.",
    hours: 10,
    lessons: 52,
    projects: 1,
    level: "Beginner → Advanced",
    accent: "gold",
    status: "building",
  },
  {
    id: "tableau",
    moduleId: null,
    title: "Tableau for Data Visualization",
    mark: "Tab",
    blurb:
      "Build dashboards a stakeholder can use without you in the room — LODs, table calcs, and a published portfolio URL at the end.",
    hours: 10,
    lessons: 48,
    projects: 2,
    level: "Beginner → Advanced",
    accent: "turf",
    status: "building",
  },
  {
    id: "powerbi",
    moduleId: null,
    title: "Power BI & DAX",
    mark: "PBI",
    blurb:
      "Data modelling, star schemas, and real DAX — CALCULATE included. The BI tool most enterprises actually run.",
    hours: 11,
    lessons: 50,
    projects: 2,
    level: "Beginner → Advanced",
    accent: "gold",
    status: "building",
  },
  {
    id: "git",
    moduleId: "git",
    title: "Git & GitHub",
    mark: "Git",
    blurb:
      "Commits, branches, and pull requests — plus the README that does your hiring for you. Expected by every team, taught by almost no course.",
    hours: 6,
    lessons: 40,
    projects: 1,
    level: "Beginner → Intermediate",
    accent: "turf",
    status: "live",
  },
  {
    id: "r",
    moduleId: "r",
    title: "R & the Tidyverse",
    mark: "R",
    blurb:
      "dplyr and ggplot2, executing live in your browser. A huge share of public sports analytics is published in R — reading it is a real edge.",
    hours: 9,
    lessons: 46,
    projects: 1,
    level: "Beginner → Intermediate",
    accent: "gold",
    status: "live",
    liveCode: true,
  },
  {
    id: "ai",
    moduleId: null,
    title: "LLMs & AI for Analysts",
    mark: "AI",
    blurb:
      "Prompting, verification, and building a natural-language interface over a real database. Using AI as a tool with known failure modes, not a magic box.",
    hours: 9,
    lessons: 44,
    projects: 1,
    level: "Beginner → Intermediate",
    accent: "turf",
    status: "building",
  },
];

/** The combined pathway, presented as its own card ahead of the grid. */
export const ALL_IN_ONE = {
  moduleId: ALL_MODULE,
  title: "The All-in-One Pathway",
  blurb:
    "Every course in the order a career-changer should take them, ending in one capstone that touches all of them.",
};

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function courseByModule(moduleId: string): Course | undefined {
  return COURSES.find((c) => c.moduleId === moduleId);
}
