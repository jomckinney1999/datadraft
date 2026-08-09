// localStorage-backed learner progress for the /learn MVP.
// Deliberately no backend yet — swaps for Supabase `progress` later.

export type Progress = {
  xp: number;
  completedLessons: string[];
  streak: number;
  lastActiveDay: string; // YYYY-MM-DD
};

const KEY = "sqlsports.progress.v1";

const EMPTY: Progress = {
  xp: 0,
  completedLessons: [],
  streak: 0,
  lastActiveDay: "",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons.filter((x) => typeof x === "string")
        : [],
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastActiveDay:
        typeof parsed.lastActiveDay === "string" ? parsed.lastActiveDay : "",
    };
  } catch {
    return EMPTY;
  }
}

function save(progress: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // storage full or blocked — progress just won't persist
  }
}

/** Current streak for display: broken if last activity was before yesterday. */
export function displayStreak(p: Progress): number {
  if (p.lastActiveDay === today() || p.lastActiveDay === yesterday()) {
    return p.streak;
  }
  return 0;
}

export function completeLesson(lessonId: string, earnedXp: number): Progress {
  const p = loadProgress();
  const t = today();

  let streak: number;
  if (p.lastActiveDay === t) streak = Math.max(p.streak, 1);
  else if (p.lastActiveDay === yesterday()) streak = p.streak + 1;
  else streak = 1;

  const next: Progress = {
    xp: p.xp + earnedXp,
    completedLessons: p.completedLessons.includes(lessonId)
      ? p.completedLessons
      : [...p.completedLessons, lessonId],
    streak,
    lastActiveDay: t,
  };
  save(next);
  return next;
}
