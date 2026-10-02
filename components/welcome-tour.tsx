"use client";

/**
 * The 60-second tour: what DataDraft is, in seven stops, ending on a choice of
 * first move. There's a lot on the site — questions, courses, interview prep,
 * projects, two games, a Hall of Fame — and a first-time visitor shouldn't
 * have to find it all by clicking around.
 *
 * It is offered, never forced. On a first visit to any page with the app nav,
 * a small card in the corner asks "New here?", after a beat so it doesn't
 * flash in with the page. It does NOT appear:
 *   - over a friend's challenge link (`?r=` on the Stat Duel or Draft Room) —
 *     they came to play that, not to be toured;
 *   - on the account page;
 *   - for anyone who already has progress (they're not new);
 *   - ever again once answered (`sqlsports.welcome.v1`).
 * It can be reopened from anywhere with `?tour=1`, the dashboard, the
 * /welcome page, or `openTour()`.
 *
 * Not the retired course chooser (/learn/start): it doesn't ask about careers
 * or route people into a path. It shows what's here and offers four doors.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Coach from "@/components/coach";
import CourseArt from "@/components/course-art";
import HofTrophy from "@/components/hof-trophy";
import ProjectArt from "@/components/project-art";
import QuestionArt from "@/components/question-art";
import WhyArt from "@/components/why-art";
import { loadProgress } from "@/lib/progress";

const SEEN_KEY = "sqlsports.welcome.v1";
const OPEN_EVENT = "datadraft:tour";

/** Open the tour from anywhere on the page. */
export function openTour() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, new Date().toISOString().slice(0, 10));
  } catch {
    // Private mode: the card may come back next visit, which is harmless.
  }
}

type Stop = { label: string; title: string; body: string; art: ReactNode; href?: string; cta?: string };

const ART = "h-full w-full";

const STOPS: Stop[] = [
  {
    label: "welcome",
    title: "Welcome to DataDraft",
    body: "You practise data skills — SQL, Python, Excel and R — on real NFL numbers. It's free, there's no account to make, and your progress saves in this browser.",
    art: (
      <div className="flex h-full items-center justify-center">
        <Coach mood="whistle" size={128} />
      </div>
    ),
  },
  {
    label: "every day",
    title: "One question a day",
    body: "A new question every day in each language, the same for everyone, so you can argue about it. About 90 seconds. Solve one a day and your streak grows. Not ready to write code? The Stat Duel is five head-to-heads with no code at all.",
    art: <QuestionArt art="chalkboard" className={ART} />,
    href: "/questions",
    cta: "See today's question",
  },
  {
    label: "learn",
    title: "Courses that play like a drive",
    body: "Ten courses, from SQL to Python, Excel, R and statistics. Every lesson is a possession: get it right and you gain yards, miss and you burn a down. Score before fourth down.",
    art: <CourseArt id="sql-fundamentals" className={ART} />,
    href: "/learn",
    cta: "Browse the courses",
  },
  {
    label: "get hired",
    title: "Practise for the interview",
    body: "The nine SQL patterns analyst screens actually test, timed mock screens with a report, and Query Doctor — it tells you why a query is wrong without handing you the answer.",
    art: <WhyArt id="before-finished" className={ART} />,
    href: "/questions#interview",
    cta: "See the patterns",
  },
  {
    label: "build",
    title: "Projects you can show someone",
    body: "Chart your own fantasy league, build a real data warehouse, train a prediction model. Each ends in something with your name on it. Cases take half an hour against a schema you've never seen.",
    art: <ProjectArt id="my-league-scorecard" className={ART} />,
    href: "/projects",
    cta: "See the projects",
  },
  {
    label: "play",
    title: "Games, with a point",
    body: "The Draft Room: draft a real season, scouting with SQL, then watch it play out. The Stat Duel: a daily five-round quiz on real numbers. Both share like Wordle, so challenge your league.",
    art: <ProjectArt id="positional-ranks" className={ART} />,
    href: "/draft",
    cta: "Open the Draft Room",
  },
  {
    label: "trophies",
    title: "Your Hall of Fame",
    body: "Twelve trophies for lessons cleared, perfect drives and days in a row. No committee, no vote — every one is earned on the field.",
    art: (
      <div className="flex h-full items-end justify-center gap-2 pb-2">
        <HofTrophy tier="bronze" earned className="h-20 w-auto" />
        <HofTrophy tier="gold" earned className="h-28 w-auto" />
        <HofTrophy tier="silver" earned className="h-24 w-auto" />
      </div>
    ),
    href: "/learn#trophies",
    cta: "See the Hall",
  },
];

const FIRST_MOVES = [
  { href: "/learn/track/sql-fundamentals", label: "I'm new to SQL", note: "Start SQL Fundamentals, lesson one" },
  { href: "/questions", label: "I know some SQL", note: "Try today's question" },
  { href: "/questions/mock", label: "I'm prepping for interviews", note: "Run a mock SQL screen" },
  { href: "/questions/duel", label: "I just want to play", note: "Today's Stat Duel, no code" },
];

export function WelcomeTour({ onClose }: { onClose: () => void }) {
  const [at, setAt] = useState(0);
  const last = STOPS.length; // one past the stops is the "first move" screen
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    markSeen();
    onClose();
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setAt((a) => Math.min(last, a + 1));
      if (e.key === "ArrowLeft") setAt((a) => Math.max(0, a - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, last]);

  const stop = STOPS[at];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/80 p-3 backdrop-blur-sm sm:items-center sm:p-6" onClick={close}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="A tour of DataDraft"
        onClick={(e) => e.stopPropagation()}
        className="surface relative w-full max-w-lg overflow-hidden rounded-3xl border border-panel-border bg-panel outline-none"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close the tour"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-night/60 hover:text-ink"
        >
          ✕
        </button>

        {stop ? (
          <div key={at} className="animate-fade-up">
            <div className="relative h-44 overflow-hidden border-b border-panel-border bg-night/60 sm:h-52">{stop.art}</div>
            <div className="p-5 sm:p-6">
              <p className="label-broadcast text-gold">
                {at + 1} of {STOPS.length} · {stop.label}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink">{stop.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{stop.body}</p>
              {stop.href && (
                <Link href={stop.href} onClick={close} className="mt-3 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:underline">
                  {stop.cta} →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div key="moves" className="animate-fade-up p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Coach mood="cheer" size={64} />
              <div>
                <p className="label-broadcast text-gold">your first move</p>
                <h2 className="font-display text-2xl font-bold text-ink">Where do you want to start?</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {FIRST_MOVES.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={close}
                  className="lift group flex items-center justify-between gap-3 rounded-xl border border-panel-border bg-night/40 px-4 py-3 transition-colors hover:border-turf/60"
                >
                  <span>
                    <span className="block font-display text-base font-bold text-ink">{m.label}</span>
                    <span className="block text-xs text-ink-muted">{m.note}</span>
                  </span>
                  <span className="font-mono text-sm text-turf group-hover:translate-x-0.5">→</span>
                </Link>
              ))}
            </div>
            <Link href="/welcome" onClick={close} className="mt-4 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-ice hover:underline">
              See the full map of the site →
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-panel-border px-5 py-3">
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: STOPS.length + 1 }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === at ? "w-5 bg-turf" : "w-1.5 bg-panel-border"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {at > 0 && (
              <button type="button" onClick={() => setAt(at - 1)} className="rounded-lg px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink">
                Back
              </button>
            )}
            {at < last ? (
              <button type="button" onClick={() => setAt(at + 1)} className="press btn-turf" aria-keyshortcuts="ArrowRight">
                {at === 0 ? "Show me around" : "Next"}
              </button>
            ) : (
              <button type="button" onClick={close} className="rounded-lg px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink">
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mounted once, in the app nav. Offers the tour on a first visit and opens
 * it on `?tour=1` or `openTour()`.
 */
export function WelcomePrompt() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [offer, setOffer] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => {
      setOffer(false);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (params.get("tour") === "1") {
      setOpen(true);
      return;
    }
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(SEEN_KEY);
    } catch {
      return;
    }
    if (seen) return;
    if (params.get("r") || pathname.startsWith("/account") || pathname.startsWith("/auth")) return;
    const p = loadProgress();
    if (p.xp > 0 || p.completedLessons.length > 0 || p.solvedQuestions.length > 0) {
      markSeen(); // not new — they found their way already
      return;
    }
    const t = setTimeout(() => setOffer(true), 1500);
    return () => clearTimeout(t);
  }, [pathname, params]);

  return (
    <>
      {offer && !open && (
        <div className="animate-fade-up fixed bottom-4 left-4 right-4 z-40 sm:right-auto sm:max-w-sm">
          <div className="surface flex items-center gap-3 rounded-2xl border border-gold/50 bg-panel p-3 pr-4 shadow-lg">
            <Coach mood="whistle" size={56} className="shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-base font-bold text-ink">New here?</p>
              <p className="text-xs leading-snug text-ink-soft">There&apos;s a lot on the field. Take the 60-second tour.</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOffer(false);
                    setOpen(true);
                  }}
                  className="press btn-gold px-3 py-1.5 text-[11px]"
                >
                  Show me around
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markSeen();
                    setOffer(false);
                  }}
                  className="rounded-lg px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink"
                >
                  No thanks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {open && <WelcomeTour onClose={() => setOpen(false)} />}
    </>
  );
}

/** A plain button that opens the tour, for the dashboard and /welcome. */
export function TourButton({ className = "", children = "Take the 60-second tour" }: { className?: string; children?: ReactNode }) {
  return (
    <button type="button" onClick={openTour} className={className}>
      {children}
    </button>
  );
}
