// localStorage-backed learner progress for the /learn MVP.
// Deliberately no backend yet — swaps for Supabase `progress` later.

/** Jersey / helmet accent on the learner avatar (kept here to avoid a cycle with tenure). */
export type KitAccent = "turf" | "ice" | "gold";

export type Progress = {
  xp: number;
  completedLessons: string[];
  streak: number;
  lastActiveDay: string; // YYYY-MM-DD
  username: string | null;
  draftedTrack: string | null;
  /**
   * Distinct calendar days with activity. Bumped when `lastActiveDay` moves
   * to a new day — the tenure ladder uses it so showing up beats one grind.
   */
  daysActive: number;
  /** Jersey number on your sideline avatar (0–99). */
  jersey: number;
  /** Skin tone index for SidelineCast (0–3). */
  kitTone: number;
  /** Jersey / helmet accent on your avatar. */
  kitAccent: KitAccent;
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
  // ── power-ups + daily arcade (lib/power-ups.ts) ──
  /** Free lesson hints from the shop. */
  coachWhispers: number;
  /** Free Instant Replays (soft landings). */
  softLandings: number;
  /** Next lesson ticket payout ×2 charges. */
  doubleTickets: number;
  /** YYYY-MM-DD for daily quest claim bucket. */
  dailyQuestDay: string;
  /** Quest ids claimed today. */
  dailyQuestsClaimed: string[];
  /** YYYY-MM-DD for arcade win counter. */
  arcadeDay: string;
  /** Arcade wins today (first win pays a daily bonus). */
  arcadeWinsToday: number;
  // ── question bank (lib/questions.ts) ──
  /** Ids of questions solved, so a re-solve doesn't pay XP twice. */
  solvedQuestions: string[];
  /**
   * Question-of-the-Day streak, kept apart from `streak` on purpose. The
   * lesson streak is "you showed up"; this one is "you solved the day's
   * problem", which is a harder and more interesting thing to keep alive.
   */
  qotdStreak: number;
  /** League-timezone day (YYYY-MM-DD) the QOTD was last solved. */
  qotdLastDay: string;
};

const KEY = "sqlsports.progress.v1";

/**
 * The zero state. Exported because components need it for their initial
 * useState before localStorage is readable — three hand-written copies of
 * this literal is three places to forget a field when Progress grows.
 */
const KIT_ACCENTS: readonly KitAccent[] = ["turf", "ice", "gold"];

function parseKitAccent(v: unknown): KitAccent {
  return typeof v === "string" && (KIT_ACCENTS as readonly string[]).includes(v)
    ? (v as KitAccent)
    : "ice";
}

export const EMPTY_PROGRESS: Progress = {
  xp: 0,
  completedLessons: [],
  streak: 0,
  lastActiveDay: "",
  username: null,
  draftedTrack: null,
  daysActive: 0,
  jersey: 7,
  kitTone: 0,
  kitAccent: "ice",
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
  coachWhispers: 0,
  softLandings: 0,
  doubleTickets: 0,
  dailyQuestDay: "",
  dailyQuestsClaimed: [],
  arcadeDay: "",
  arcadeWinsToday: 0,
  solvedQuestions: [],
  qotdStreak: 0,
  qotdLastDay: "",
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
      // Older saves had no daysActive — if they were ever active, count at least one.
      daysActive:
        typeof parsed.daysActive === "number"
          ? parsed.daysActive
          : typeof parsed.lastActiveDay === "string" && parsed.lastActiveDay
            ? 1
            : 0,
      jersey:
        typeof parsed.jersey === "number"
          ? Math.max(0, Math.min(99, Math.round(parsed.jersey)))
          : 7,
      kitTone:
        typeof parsed.kitTone === "number"
          ? ((Math.round(parsed.kitTone) % 4) + 4) % 4
          : 0,
      kitAccent: parseKitAccent(parsed.kitAccent),
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
      coachWhispers:
        typeof parsed.coachWhispers === "number" ? parsed.coachWhispers : 0,
      softLandings:
        typeof parsed.softLandings === "number" ? parsed.softLandings : 0,
      doubleTickets:
        typeof parsed.doubleTickets === "number" ? parsed.doubleTickets : 0,
      dailyQuestDay:
        typeof parsed.dailyQuestDay === "string" ? parsed.dailyQuestDay : "",
      dailyQuestsClaimed: Array.isArray(parsed.dailyQuestsClaimed)
        ? parsed.dailyQuestsClaimed.filter((x) => typeof x === "string")
        : [],
      arcadeDay: typeof parsed.arcadeDay === "string" ? parsed.arcadeDay : "",
      arcadeWinsToday:
        typeof parsed.arcadeWinsToday === "number" ? parsed.arcadeWinsToday : 0,
      solvedQuestions: Array.isArray(parsed.solvedQuestions)
        ? parsed.solvedQuestions.filter((x) => typeof x === "string")
        : [],
      qotdStreak: typeof parsed.qotdStreak === "number" ? parsed.qotdStreak : 0,
      qotdLastDay:
        typeof parsed.qotdLastDay === "string" ? parsed.qotdLastDay : "",
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

/** Name the character on your locker (nav chip, leaderboard, dashboard). */
export function setCallSign(username: string): Progress {
  const trimmed = username.trim().slice(0, 24);
  const next = { ...loadProgress(), username: trimmed.length ? trimmed : null };
  save(next);
  return next;
}

/** Jersey number, skin tone, and kit accent — ownership without accounts. */
export function setKit(patch: {
  jersey?: number;
  kitTone?: number;
  kitAccent?: KitAccent;
}): Progress {
  const p = loadProgress();
  const next: Progress = {
    ...p,
    jersey:
      typeof patch.jersey === "number"
        ? Math.max(0, Math.min(99, Math.round(patch.jersey)))
        : p.jersey,
    kitTone:
      typeof patch.kitTone === "number"
        ? ((Math.round(patch.kitTone) % 4) + 4) % 4
        : p.kitTone,
    kitAccent: patch.kitAccent ?? p.kitAccent,
  };
  save(next);
  return next;
}

/** Exported so progress-sync can write a merged remote+local state back. */
export function saveProgress(progress: Progress) {
  save(progress);
}

/** Fired after every local write so the nav chip can stay live. */
export const PROGRESS_EVENT = "sqlsports:progress";

function save(progress: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: progress }));
    }
  } catch {
    // storage full or blocked — progress just won't persist
  }
}

/** Count a new active day when the calendar day of activity advances. */
function withActiveDay(p: Progress, t: string): Pick<Progress, "daysActive" | "lastActiveDay"> {
  if (p.lastActiveDay === t) {
    return { daysActive: p.daysActive, lastActiveDay: t };
  }
  // First-ever activity, or a new calendar day.
  const bump = p.lastActiveDay === "" || p.lastActiveDay !== t;
  return {
    daysActive: bump ? p.daysActive + 1 : p.daysActive,
    lastActiveDay: t,
  };
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

  const day = withActiveDay(p, t);
  const next: Progress = {
    ...p,
    xp: p.xp + earnedXp,
    completedLessons: p.completedLessons.includes(lessonId)
      ? p.completedLessons
      : [...p.completedLessons, lessonId],
    streak,
    ...day,
    bestCombo: Math.max(p.bestCombo, drive?.bestCombo ?? 0),
    perfectLessons:
      p.perfectLessons + (drive?.perfect && firstClear ? 1 : 0),
    totalYards: p.totalYards + (drive?.yards ?? 0),
  };

  // Sideline tickets — perfect drives and heaters pay more.
  let ticketGain = 8;
  if (drive?.perfect) ticketGain += 7;
  ticketGain += Math.min(10, Math.max(0, streak) * 2);

  // Shop power-up: double tickets on the next cleared drive.
  if ((next.doubleTickets ?? 0) > 0) {
    ticketGain *= 2;
    next.doubleTickets = next.doubleTickets - 1;
  }
  next.tickets = (next.tickets ?? 0) + ticketGain;

  save(next);
  return next;
}

/**
 * Bank a solved question.
 *
 * XP is paid once per question, because otherwise re-running a solved
 * question is an XP faucet and the number stops meaning anything. The solve
 * still counts for the daily streak every time, which is the behaviour you
 * want — coming back is the habit being rewarded, not grinding.
 *
 * `day` and `prevDay` are league-timezone days from lib/questions.ts, passed
 * in rather than computed here so this module stays free of date-formatting
 * and the caller decides what "today" means.
 */
export function solveQuestion(
  questionId: string,
  earnedXp: number,
  isQotd: boolean,
  day: string,
  prevDay: string,
): Progress {
  const p = loadProgress();
  const firstSolve = !p.solvedQuestions.includes(questionId);
  const t = today();

  let streak: number;
  if (p.lastActiveDay === t) streak = Math.max(p.streak, 1);
  else if (p.lastActiveDay === yesterday()) streak = p.streak + 1;
  else streak = 1;

  let qotdStreak = p.qotdStreak;
  if (isQotd && p.qotdLastDay !== day) {
    qotdStreak = p.qotdLastDay === prevDay ? p.qotdStreak + 1 : 1;
  }

  const active = withActiveDay(p, t);
  const next: Progress = {
    ...p,
    xp: p.xp + (firstSolve ? earnedXp : 0),
    solvedQuestions: firstSolve
      ? [...p.solvedQuestions, questionId]
      : p.solvedQuestions,
    streak,
    ...active,
    qotdStreak,
    qotdLastDay: isQotd ? day : p.qotdLastDay,
    // Tickets are the small, repeatable reward. A solved question pays less
    // than a cleared drive, and the day's question pays a bonus on top.
    tickets: (p.tickets ?? 0) + (firstSolve ? 5 : 1) + (isQotd ? 10 : 0),
  };

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
