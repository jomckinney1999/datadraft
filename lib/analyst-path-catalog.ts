/**
 * What the analyst path is made of, as plain ids: the SQL Fundamentals
 * lessons, the SQL questions, and each pattern's questions and guide.
 *
 * Built on the server and handed to the client components as a prop, so the
 * path page, the dashboard and the league lab never bundle the question bank
 * or the curriculum just to tick a box. lib/analyst-path.ts does the rest.
 */

import { COURSES } from "@/lib/courses";
import { liveLessons } from "@/lib/curriculum";
import { PATTERNS, questionsFor } from "@/lib/interview-patterns";
import { GUIDES_BASE, guideForPattern } from "@/lib/pattern-guides";
import { QUESTIONS } from "@/lib/questions";
import type { PathCatalog } from "@/lib/analyst-path";

export function pathCatalog(): PathCatalog {
  const sql = COURSES.find((c) => c.id === "sql-fundamentals");
  return {
    lessons: sql?.moduleId ? liveLessons(sql.moduleId).map((l) => l.lesson.id) : [],
    sqlQuestions: QUESTIONS.filter((q) => q.lang === "sql").map((q) => q.id),
    patterns: PATTERNS.map((p) => {
      const guide = guideForPattern(p.id);
      return {
        id: p.id,
        name: p.name,
        href: guide ? `${GUIDES_BASE}/${guide.slug}` : `/questions?pattern=${p.id}#interview`,
        questions: questionsFor(p).map((q) => q.id),
      };
    }),
  };
}
