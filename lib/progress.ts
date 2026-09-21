// localStorage-backed learner progress for the /learn MVP.
// Deliberately no backend yet — swaps for Supabase `progress` later.

export type Progress = {
  xp: number;
  completedLessons: string[];
  streak: number;
  lastActiveDay: string; // YYYY-MM-DD
  username: string | null;
  draftedTrack: string | null;
  // ── game state (lib/achievements.ts reads these) ──
  /** Badge ids already celebrated, so an unlock only pops once. */
  badges: string[];
  /** Longest run of correct answers, across every lesson. */
  bestCombo: number;
  /** Lessons cleared without a single miss. */
  perfectLessons: number;
  /** Career yards, the cosmetic counter the drive bar feeds. */
  totalYards: number;
  // ── sideline economy (lib/economy.ts) ──
  /** Daily lesson starts left (Duo hearts → timeouts). */
  timeouts: number;
  /** YYYY-MM-DD of last daily timeout refill. */
  timeoutsRefilledDay: string;
  /** Scouting tickets (Duo gems). */
  tickets: number;
  /** Bye weeks in inventory (Duo streak freezes). */
  byeWeeks: number;
  /** Day a bye week last auto-applied. */
  byeUsedOn: string;
  /**
   * Local Practice-tier flag — unlimited timeouts. Real billing stays on the
   * waitlist until Stripe/legal are ready; testing tools can flip this.
   */
  seasonPass: boolean;
};

const KEY = "sqlsports.progress.v1";

/**
 * The zero state. Exported because components need it for their initial
 * useState before localStorage is readable — three hand-written copies of
 * this literal is three places to forget a field when Progress grows.
 */
export const EMPTY_PROGRESS: Progress = {
  xp: 0,
  completedLessons: [],
  streak: 0,
  lastActiveDay: "",
  username: null,
  draftedTrack: null,
  badges: [],
  bestCombo: 0,
  perfectLessons: 0,
  totalYards: 0,
  timeouts: 5,
  timeoutsRefilledDay: "",
  tickets: 40,
  byeWeeks: 0,
  byeUsedOn: "",
  seasonPass: false,
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
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons.filter((x) => typeof x === "string")
        : [],
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastActiveDay:
        typeof parsed.lastActiveDay === "string" ? parsed.lastActiveDay : "",
      username:
        typeof parsed.username === "string" && parsed.username.trim()
          ? parsed.username
          : null,
      draftedTrack:
        typeof parsed.draftedTrack === "string" ? parsed.draftedTrack : null,
      // Defaulted rather than required: progress saved before these existed
      // must keep loading, not blow up or reset someone's XP.
      badges: Array.isArray(parsed.badges)
        ? parsed.badges.filter((x) => typeof x === "string")
        : [],
      bestCombo: typeof parsed.bestCombo === "number" ? parsed.bestCombo : 0,
      perfectLessons:
        typeof parsed.perfectLessons === "number" ? parsed.perfectLessons : 0,
      totalYards: typeof parsed.totalYards === "number" ? parsed.totalYards : 0,
      timeouts: typeof parsed.timeouts === "number" ? parsed.timeouts : 5,
      timeoutsRefilledDay:
        typeof parsed.timeoutsRefilledDay === "string"
          ? parsed.timeoutsRefilledDay
          : "",
      tickets: typeof parsed.tickets === "number" ? parsed.tickets : 40,
      byeWeeks: typeof parsed.byeWeeks === "number" ? parsed.byeWeeks : 0,
      byeUsedOn: typeof parsed.byeUsedOn === "string" ? parsed.byeUsedOn : "",
      seasonPass: parsed.seasonPass === true,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function setDraftPick(username: string, trackId: string): Progress {
  const next = {
    ...loadProgress(),
    username: username.trim().slice(0, 24),
    draftedTrack: trackId,
  };
  save(next);
  return next;
}

/** Exported so progress-sync can write a merged remote+local state back. */
export function saveProgress(progress: Progress) {
  save(progress);
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

export type DriveResult = {
  /** Cleared with no misses at all. */
  perfect: boolean;
  /** Longest run of correct answers in this lesson. */
  bestCombo: number;
  /** Yards gained on this drive. */
  yards: number;
};

export function completeLesson(
  lessonId: string,
  earnedXp: number,
  drive?: DriveResult,
): Progress {
  const p = loadProgress();
  const t = today();
  // A repeat of a lesson already cleared still counts for combo, yards and
  // streak — replaying to beat your own drive is the point — but it must not
  // inflate the perfect-drive count a second time for the same lesson.
  const firstClear = !p.completedLessons.includes(lessonId);

  let streak: number;
  if (p.lastActiveDay === t) streak = Math.max(p.streak, 1);
  else if (p.lastActiveDay === yesterday()) streak = p.streak + 1;
  else streak = 1;

  const next: Progress = {
    ...p,
    xp: p.xp + earnedXp,
    completedLessons: p.completedLessons.includes(lessonId)
      ? p.completedLessons
      : [...p.completedLessons, lessonId],
    streak,
    lastActiveDay: t,
    bestCombo: Math.max(p.bestCombo, drive?.bestCombo ?? 0),
    perfectLessons:
      p.perfectLessons + (drive?.perfect && firstClear ? 1 : 0),
    totalYards: p.totalYards + (drive?.yards ?? 0),
  };

  // Sideline tickets — perfect drives and heaters pay more.
  let ticketGain = 8;
  if (drive?.perfect) ticketGain += 7;
  ticketGain += Math.min(10, Math.max(0, streak) * 2);
  next.tickets = (next.tickets ?? 0) + ticketGain;

  save(next);
  return next;
}

/** Record badges as celebrated so their unlock only fires once. */
export function awardBadges(ids: string[]): Progress {
  const p = loadProgress();
  if (ids.length === 0) return p;
  const next = { ...p, badges: Array.from(new Set([...p.badges, ...ids])) };
  save(next);
  return next;
}
