"use client";

/**
 * Bridges localStorage progress (lib/progress.ts) and the learner_progress
 * table, so signing in makes progress portable without changing how the
 * anonymous experience works.
 *
 * Merge rule: union the completed lessons and take the max of the counters.
 * Last-write-wins would silently delete work — finish two lessons on your
 * phone, open your laptop where the older row lives, and the laptop's row
 * would overwrite them. Union never loses a completed lesson, which is the
 * thing a learner would actually be upset to lose.
 */

import { createClient } from "@/lib/supabase/client";
import { loadProgress, saveProgress, type Progress } from "@/lib/progress";
import { readStoredModule, MODULE_STORAGE_KEY } from "@/lib/use-module";
import { PAYWALL_LIVE, type PassPlan } from "@/lib/season-pass";
import { PASS_EVENT } from "@/lib/use-pass";
import { isNflTeam } from "@/lib/nfl-team-avatars";

type Supabase = ReturnType<typeof createClient>;

/** The member's Season Pass, as the server knows it. */
export type PassStatus = {
  active: boolean;
  plan: PassPlan | null;
  /** When the current period ends: the renewal date, or the last day of access. */
  periodEnd: string | null;
  /** True once there's any subscription, so the account page can offer billing. */
  hasBilling: boolean;
};

/**
 * Read the signed-in member's subscription row (RLS lets them read their
 * own). Active means Stripe says active and the paid period hasn't run out;
 * the period check covers a webhook that never arrived.
 */
export async function readPass(supabase: Supabase, userId: string): Promise<PassStatus> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, plan, current_period_end, stripe_customer_id")
    .eq("user_id", userId)
    .eq("tier", "practice")
    .maybeSingle();
  if (!data) return { active: false, plan: null, periodEnd: null, hasBilling: false };
  const periodEnd = (data.current_period_end as string | null) ?? null;
  const inPeriod = !periodEnd || Date.parse(periodEnd) > Date.now();
  return {
    active: data.status === "active" && inPeriod,
    plan: (data.plan as PassPlan | null) ?? null,
    periodEnd,
    hasBilling: Boolean(data.stripe_customer_id),
  };
}

function setPassFlag(on: boolean) {
  const p = loadProgress();
  if (p.seasonPass === on) return;
  saveProgress({ ...p, seasonPass: on });
  window.dispatchEvent(new Event(PASS_EVENT));
}

const PASS_CHECKED_KEY = "sqlsports.pass.checked";
const PASS_RECHECK_MS = 12 * 60 * 60 * 1000;

/**
 * Keep this browser's Season Pass flag in step with the server, at most
 * twice a day. Signed out means no Pass: a purchase belongs to an account,
 * so a flag in a signed-out browser (a test toggle, a lapsed member, a
 * hand-edited localStorage) is cleared. Does nothing while the paywall is
 * off, and never throws: a failed check leaves the flag as it was.
 */
export async function refreshPass(force = false): Promise<PassStatus | null> {
  if (!PAYWALL_LIVE) return null;
  try {
    const last = Number(localStorage.getItem(PASS_CHECKED_KEY) ?? 0);
    if (!force && Date.now() - last < PASS_RECHECK_MS) return null;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const status = user ? await readPass(supabase, user.id) : null;
    setPassFlag(Boolean(status?.active));
    localStorage.setItem(PASS_CHECKED_KEY, String(Date.now()));
    return status;
  } catch {
    return null;
  }
}

type Row = {
  user_id: string;
  xp: number;
  completed_lessons: string[];
  streak: number;
  last_active_day: string;
  playbook_style: string | null;
  username: string | null;
  drafted_track: string | null;
  sport: string | null;
  module_id: string | null;
  badges: string[] | null;
  best_combo: number | null;
  perfect_lessons: number | null;
  total_yards: number | null;
  favorite_team: string | null;
};

function merge(local: Progress, remote: Row | null): Progress {
  if (!remote) return local;
  const lessons = new Set([
    ...local.completedLessons,
    ...(remote.completed_lessons ?? []),
  ]);
  const newer =
    local.lastActiveDay >= (remote.last_active_day ?? "") ? local : null;
  return {
    ...local,
    xp: Math.max(local.xp, remote.xp ?? 0),
    completedLessons: Array.from(lessons),
    streak: Math.max(local.streak, remote.streak ?? 0),
    lastActiveDay:
      local.lastActiveDay > (remote.last_active_day ?? "")
        ? local.lastActiveDay
        : (remote.last_active_day ?? ""),
    // Prefer whichever side was active most recently for the single-value
    // fields, falling back to whichever one actually has a value.
    username: newer?.username ?? remote.username ?? local.username ?? null,
    draftedTrack:
      newer?.draftedTrack ?? remote.drafted_track ?? local.draftedTrack ?? null,
    // A choice on this device is intentional and wins; a fresh device has
    // null locally and receives the server's team.
    favoriteTeam:
      local.favoriteTeam ??
      (isNflTeam(remote.favorite_team) ? remote.favorite_team : null),
    // Same rule as the counters above: union the badges, max the totals. A
    // badge earned on a phone must not disappear because the laptop's row is
    // older, and that is exactly what last-write-wins would do.
    badges: Array.from(
      new Set([...local.badges, ...(remote.badges ?? [])]),
    ),
    bestCombo: Math.max(local.bestCombo, remote.best_combo ?? 0),
    perfectLessons: Math.max(
      local.perfectLessons,
      remote.perfect_lessons ?? 0,
    ),
    totalYards: Math.max(local.totalYards, remote.total_yards ?? 0),
    // Sideline economy + power-ups stay device-local until accounts sync them.
    timeouts: Math.max(local.timeouts, 0),
    tickets: Math.max(local.tickets, 0),
    byeWeeks: Math.max(local.byeWeeks, 0),
  };
}

/**
 * Pull the signed-in learner's row, merge it with whatever is on this device,
 * write the result back to both. Safe to call on every sign-in and page load.
 */
export async function syncProgress(): Promise<Progress | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const local = loadProgress();

  const { data: remote } = await supabase
    .from("learner_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const merged = merge(local, (remote as Row | null) ?? null);
  // The Season Pass comes from the server's subscription row, never from
  // what this browser happened to have stored.
  if (PAYWALL_LIVE) {
    merged.seasonPass = (await readPass(supabase, user.id)).active;
    try {
      localStorage.setItem(PASS_CHECKED_KEY, String(Date.now()));
    } catch {
      /* storage blocked — not fatal */
    }
  }

  // Local first, so the learner sees the merged state even if the write fails.
  saveProgress(merged);
  if (PAYWALL_LIVE) window.dispatchEvent(new Event(PASS_EVENT));
  if (remote?.module_id) {
    try {
      window.localStorage.setItem(MODULE_STORAGE_KEY, remote.module_id);
    } catch {
      /* storage blocked — not fatal */
    }
  }

  await pushProgress(merged);
  return merged;
}

/** Write the current device's progress up. No-op when signed out. */
export async function pushProgress(progress?: Progress): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const p = progress ?? loadProgress();
  const { error } = await supabase.from("learner_progress").upsert(
    {
      user_id: user.id,
      xp: p.xp,
      completed_lessons: p.completedLessons,
      streak: p.streak,
      last_active_day: p.lastActiveDay,
      username: p.username,
      drafted_track: p.draftedTrack,
      // The column predates the decision to ship football only. Writing a
      // constant keeps migration 0004 untouched and keeps the door open.
      sport: "football",
      module_id: readStoredModule(),
      badges: p.badges,
      best_combo: p.bestCombo,
      perfect_lessons: p.perfectLessons,
      total_yards: p.totalYards,
      favorite_team: p.favoriteTeam,
    },
    { onConflict: "user_id" },
  );
  if (error) console.error("progress sync failed", error.message);
}
