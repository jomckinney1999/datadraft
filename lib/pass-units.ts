/**
 * Which course units stay free once the Season Pass gate is on: the first
 * unit of every course (docs/OFFER.md §2), so anyone can find out what a
 * course is like before paying for the rest. The combined pathway isn't a
 * course of its own, so it doesn't make its units free.
 *
 * Reads each course's unit order from the generated lesson index, so the
 * lesson player doesn't import the curriculum to ask (2026-10-06).
 */

import { ALL_MODULE } from "@/lib/all-module";
import { MODULE_UNIT_IDS } from "@/lib/lesson-index.generated";

const FREE_UNITS = new Set(
  Object.entries(MODULE_UNIT_IDS)
    .filter(([moduleId]) => moduleId !== ALL_MODULE)
    .map(([, unitIds]) => unitIds[0])
    .filter(Boolean),
);

export function unitIsFree(unitId: string): boolean {
  return FREE_UNITS.has(unitId);
}
