/**
 * Lesson navigation without the curriculum: which lesson comes next in a
 * course and which course a unit belongs to, read off the generated lesson
 * index (scripts/build-curriculum-index.mjs). The lesson player uses these so
 * its bundle carries one lesson rather than all 180 (2026-10-06). The
 * verifier checks both against lib/curriculum.ts for every lesson and unit.
 */

import { ALL_MODULE } from "./all-module";
import { LIVE_LESSONS, MODULE_UNIT_IDS } from "./lesson-index.generated";

/** Every course id, the combined pathway included. */
export const MODULE_IDS: string[] = Object.keys(MODULE_UNIT_IDS);

/** The live lesson after this one in a course, as curriculum.nextLessonId. */
export function nextLiveLessonId(id: string, moduleId: string = ALL_MODULE): string | null {
  const all = LIVE_LESSONS[moduleId] ?? [];
  const idx = all.indexOf(id);
  if (idx === -1 || idx === all.length - 1) return null;
  return all[idx + 1];
}

/**
 * The course a unit belongs to for its art and outline: the first course that
 * lists it, not counting the combined pathway or the Foundations pilot.
 */
export function courseModuleOfUnit(unitId: string): string | null {
  for (const [moduleId, unitIds] of Object.entries(MODULE_UNIT_IDS)) {
    if (moduleId === ALL_MODULE || moduleId === "sql-foundations") continue;
    if (unitIds.includes(unitId)) return moduleId;
  }
  return null;
}

/**
 * The lesson to offer after this one. The learner's chosen course wins when
 * this lesson is in it; otherwise the lesson's own course. Before 2026-10-06
 * a learner whose last roadmap was, say, the AI course finished a SQL lesson
 * and was told they'd "cleared every live lesson in this module", with no way
 * on: the stored course didn't contain the lesson, so there was no next.
 */
export function nextLessonFor(id: string, preferredModule: string, unitId: string): string | null {
  const inPreferred = (LIVE_LESSONS[preferredModule] ?? []).includes(id);
  const moduleId = inPreferred ? preferredModule : courseModuleOfUnit(unitId) ?? ALL_MODULE;
  return nextLiveLessonId(id, moduleId);
}
