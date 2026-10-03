/**
 * Which course units stay free once the Season Pass gate is on: the first
 * unit of every course (docs/OFFER.md §2), so anyone can find out what a
 * course is like before paying for the rest. The combined pathway isn't a
 * course of its own, so it doesn't make its units free.
 *
 * Separate from lib/season-pass.ts because it needs the curriculum.
 */

import { ALL_MODULE, MODULES } from "@/lib/curriculum";

const FREE_UNITS = new Set(
  MODULES.filter((m) => m.id !== ALL_MODULE)
    .map((m) => m.unitIds[0])
    .filter(Boolean),
);

export function unitIsFree(unitId: string): boolean {
  return FREE_UNITS.has(unitId);
}
