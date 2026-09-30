"use client";

/**
 * Public guest invite — shareable link for friends & testers.
 * No account. Progress stays in this browser's localStorage.
 * Deliberately simpler than /demo (internal QA bench).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeLink from "@/components/home-link";
import Coach from "@/components/coach";
import {
  EMPTY_PROGRESS,
  loadProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";
import { FREE_DAILY_TIMEOUTS } from "@/lib/economy";

function armGuest(): Progress {
  const existing = loadProgress();
  const next: Progress = {
    ...EMPTY_PROGRESS,
    ...existing,
    username: existing.username || "Guest",
    draftedTrack: existing.draftedTrack || "sql-fundamentals",
    timeouts:
      existing.timeouts > 0 ? existing.timeouts : FREE_DAILY_TIMEOUTS,
    timeoutsRefilledDay:
      existing.timeoutsRefilledDay ||
      new Date().toISOString().slice(0, 10),
    tickets: Math.max(existing.tickets, 40),
  };
  saveProgress(next);
  return next;
}

export default function TryPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    setHasProgress(p.completedLessons.length > 0 || p.xp > 0);
    setReady(true);
  }, []);

  function startFresh() {
    armGuest();
    router.push("/learn");
  }

  function jumpField() {
    armGuest();
    router.push("/field");
  }

  function jumpFirstLesson() {
    armGuest();
    router.push("/learn/u1-l1");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pb-20 pt-8">
      <HomeLink label="guest invite" />

      <div className="mt-10 flex flex-col items-center text-center">
        <Coach mood="happy" size={120} />
        <p className="label-broadcast mt-4 text-turf">beta · no account</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Try DataDraft
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">
          Learn SQL (and more) through real NFL data. Everything runs in your
          browser — no sign-up, no password. Progress saves on this device only.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={startFresh}
          disabled={!ready}
          className="btn-turf flex w-full items-center justify-center rounded-2xl border border-turf/80 px-6 py-4 font-display text-lg font-bold uppercase tracking-wide text-night disabled:opacity-50"
        >
          {hasProgress
            ? "Continue on the path board"
            : "Start free — pick a path"}
        </button>
        <button
          type="button"
          onClick={jumpFirstLesson}
          disabled={!ready}
          className="flex w-full items-center justify-center rounded-2xl border-2 border-panel-border border-b-4 bg-panel px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-widest text-ink-soft transition-colors hover:border-turf/50 hover:text-turf disabled:opacity-50"
        >
          Jump into the first SQL lesson
        </button>
        <button
          type="button"
          onClick={jumpField}
          disabled={!ready}
          className="flex w-full items-center justify-center rounded-2xl border-2 border-panel-border border-b-4 bg-panel px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-widest text-ink-soft transition-colors hover:border-ice/50 hover:text-ice disabled:opacity-50"
        >
          Open the Practice Field (ungraded)
        </button>
      </div>

      <ul className="mt-10 space-y-3 text-left text-sm leading-relaxed text-ink-soft">
        <li className="flex gap-3">
          <span className="text-turf" aria-hidden>
            ✓
          </span>
          <span>
            <strong className="text-ink">Real NFL stats</strong> from nflverse —
            not toy spreadsheets.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-turf" aria-hidden>
            ✓
          </span>
          <span>
            <strong className="text-ink">Duolingo-style drives</strong> — downs,
            timeouts, scouting tickets, instant replay.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-turf" aria-hidden>
            ✓
          </span>
          <span>
            <strong className="text-ink">No account required.</strong> Clearing
            site data wipes progress — that&apos;s expected for guest mode.
          </span>
        </li>
      </ul>

      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Share this page ·{" "}
        <Link href="/" className="text-turf hover:underline">
          What is DataDraft?
        </Link>
      </p>
    </main>
  );
}
