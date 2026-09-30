/**
 * Which steps of a guided build someone has ticked off.
 *
 * Its own storage key rather than a field on `Progress`, for the same reason
 * interview cases have their own: a build is not worth XP, does not spend a
 * timeout, and should not be able to break the progress schema that holds
 * somebody's streak.
 *
 * Lifted out of project-guide.tsx so the catalogue can show how far in you
 * are without importing the whole guide.
 */

const STORAGE_KEY = "sqlsports.project.checklist.v1";

export type Checklist = Record<string, boolean>;

export function loadChecklist(projectId: string): Checklist {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw) as Record<string, Checklist>;
    return all[projectId] ?? {};
  } catch {
    return {};
  }
}

export function saveChecklist(projectId: string, next: Checklist) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Checklist>) : {};
    all[projectId] = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota / private mode */
  }
}
