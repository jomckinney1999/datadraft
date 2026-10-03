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
import Coach, { type CoachMood } from "@/components/coach";
import { useTypewriter } from "@/components/cutscene";
import CourseArt from "@/components/course-art";
import HofTrophy from "@/components/hof-trophy";
import ProjectArt from "@/components/project-art";
import QuestionArt from "@/components/question-art";
import PrepArt from "@/components/prep-art";
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

type Stop = { label: string; title: string; body: string; art: ReactNode; mood: CoachMood; href?: string; cta?: string };

const ART = "h-full w-full";

const STOPS: Stop[] = [
  {
    label: "welcome",
    mood: "whistle",
    title: "Welcome to DataDraft",
    body: "You practise data skills — SQL, Python, Excel and R — on real NFL numbers. It's free, there's no account to make, and your progress saves in this browser.",
    // The title card: the brand mark, since Coach is already the one talking.
    art: (
      <div className="flex h-full items-center justify-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/datadraft-avatar.svg" alt="" className="h-3/4 w-auto rounded-full" />
        <span className="hidden font-display text-4xl font-bold tracking-tight text-pop sm:inline">
          Data<span className="text-turf">Draft</span>
        </span>
      </div>
    ),
  },
  {
    label: "every day",
    mood: "happy",
    title: "One question a day",
    body: "A new question every day in each language, the same for everyone, so you can argue about it. About 90 seconds. Solve one a day and your streak grows. Not ready to write code? The Stat Duel is five head-to-heads with no code at all.",
    art: <QuestionArt art="chalkboard" className={ART} />,
    href: "/questions",
    cta: "See today's question",
  },
  {
    label: "learn",
    mood: "point",
    title: "Courses that play like a drive",
    body: "Ten courses, from SQL to Python, Excel, R and statistics. Every lesson is a possession: get it right and you gain yards, miss and you burn a down. Score before fourth down.",
    art: <CourseArt id="sql-fundamentals" className={ART} />,
    href: "/learn",
    cta: "Browse the courses",
  },
  {
    label: "get hired",
    mood: "clipboard",
    title: "Practise for the interview",
    body: "The nine SQL patterns analyst screens actually test, timed mock screens with a report, and Query Doctor — it tells you why a query is wrong without handing you the answer.",
    art: <PrepArt id="technical" className={ART} />,
    href: "/questions#interview",
    cta: "See the patterns",
  },
  {
    label: "build",
    mood: "flex",
    title: "Projects you can show someone",
    body: "Chart your own fantasy league, build a real data warehouse, train a prediction model. Each ends in something with your name on it. Cases take half an hour against a schema you've never seen.",
    art: <ProjectArt id="my-league-scorecard" className={ART} />,
    href: "/projects",
    cta: "See the projects",
  },
  {
    label: "play",
    mood: "clap",
    title: "Games, with a point",
    body: "The Draft Room: draft a real season, scouting with SQL, then watch it play out. The Stat Duel: a daily five-round quiz on real numbers. Both share like Wordle, so challenge your league.",
    art: <ProjectArt id="positional-ranks" className={ART} />,
    href: "/draft",
    cta: "Open the Draft Room",
  },
  {
    label: "trophies",
    mood: "dance",
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

const FIRST_MOVES: { href: string; label: string; note: string; art: ReactNode }[] = [
  { href: "/learn/track/sql-fundamentals", label: "I'm new to SQL", note: "SQL Fundamentals, lesson one", art: <CourseArt id="sql-fundamentals" className={ART} /> },
  { href: "/questions", label: "I know some SQL", note: "Today's question", art: <QuestionArt art="chalkboard" className={ART} /> },
  { href: "/questions/mock", label: "I'm prepping for interviews", note: "A mock SQL screen", art: <PrepArt id="phone" className={ART} /> },
  { href: "/questions/duel", label: "I just want to play", note: "Today's Stat Duel, no code", art: <QuestionArt art="scale" className={ART} /> },
];

/**
 * The tour, played as a cutscene (decided 2026-10-03): it takes the whole
 * screen, letterboxed like the case briefings, and each stop is a scene: its
 * drawing framed big in the middle, its title over it, and Coach saying it in
 * a dialogue bubble that types out. It ends on a game-style "Choose your
 * start" menu. Same kit as components/cutscene.tsx (`.cutscene-*` classes,
 * `useTypewriter`), so the tour and a briefing feel like one game.
 *
 * Keys: → / Enter / Space advance (a press while a line types finishes it),
 * ← goes back, Esc leaves. On the menu, the arrow keys move between the four
 * starts and Enter picks one. Reduced motion: no typing, no sliding bars.
 */
export function WelcomeTour({ onClose }: { onClose: () => void }) {
  const [at, setAt] = useState(0);
  const last = STOPS.length; // one past the stops is the "first move" menu
  const [pick, setPick] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const close = useCallback(() => {
    markSeen();
    onClose();
  }, [onClose]);

  const stop = STOPS[at];
  const { shown, typing, finish } = useTypewriter(stop?.body ?? "", Boolean(stop), at);

  const next = useCallback(() => {
    if (typing) return finish();
    setAt((a) => Math.min(last, a + 1));
  }, [typing, finish, last]);

  // Lock the page behind, and give focus back where it was on the way out.
  useEffect(() => {
    const prev = document.body.style.overflow;
    const returnTo = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      returnTo?.focus?.();
    };
  }, []);

  // On the menu, focus follows the highlighted start.
  useEffect(() => {
    if (at === last) menuRefs.current[pick]?.focus();
  }, [at, last, pick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (at === last) {
        // The menu: arrows move round the 2x2 grid; Enter is the focused link's own.
        const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 };
        if (!(e.key in step)) return;
        e.preventDefault();
        if (e.key === "ArrowLeft" && pick === 0) {
          setAt(last - 1);
          return;
        }
        setPick((p) => Math.max(0, Math.min(FIRST_MOVES.length - 1, p + step[e.key])));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setAt((a) => Math.max(0, a - 1));
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "Enter" && e.key !== " ") return;
      // A focused button or link acts on its own Enter and Space.
      if ((e.key === "Enter" || e.key === " ") && (t?.tagName === "BUTTON" || t?.tagName === "A")) return;
      e.preventDefault();
      next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, last, pick, next, close]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="A tour of DataDraft"
      className="cutscene-dialog fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-night-100/95 backdrop-blur-sm"
    >
      <div aria-hidden className="cutscene-bar cutscene-bar-top pointer-events-none fixed inset-x-0 top-0 h-[6vh]" />
      <div aria-hidden className="cutscene-bar cutscene-bar-bottom pointer-events-none fixed inset-x-0 bottom-0 h-[6vh]" />

      <div className="relative mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 pb-[8vh] pt-[8vh]">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
            {stop ? `Tour · ${at + 1} of ${STOPS.length} · ${stop.label}` : "Tour · your first move"}
          </p>
          <button
            type="button"
            onClick={close}
            className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Skip tour ⏭
          </button>
        </div>

        {stop ? (
          <div
            className="flex flex-1 flex-col justify-center gap-5 py-4"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest("a,button")) next();
            }}
          >
            <div key={`scene-${at}`} className="cutscene-title">
              <h2 className="text-center font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{stop.title}</h2>
              <div className="surface mx-auto mt-4 aspect-[16/9] max-h-[34vh] w-full max-w-2xl overflow-hidden rounded-2xl border-[3px] border-night bg-night/70">
                {stop.art}
              </div>
            </div>

            <div key={`line-${at}`} className="cutscene-pop mx-auto flex w-full max-w-3xl items-end gap-3 sm:gap-4">
              <div className="flex shrink-0 flex-col items-center">
                <Coach mood={stop.mood} size={88} talking={typing} />
                <span className="mt-1 rounded-full border border-turf/60 bg-turf/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-turf">
                  Coach
                </span>
              </div>
              <div className="cutscene-bubble relative min-h-[6.5rem] flex-1 rounded-2xl border-[3px] border-night bg-ink px-4 py-3 text-night sm:px-5">
                <p aria-hidden className="text-[15px] font-semibold leading-relaxed sm:text-base">
                  {stop.body.slice(0, shown)}
                  {typing && <span className="cutscene-caret">▍</span>}
                </p>
                <p className="sr-only" aria-live="polite">
                  {stop.title}. {stop.body}
                </p>
                {!typing && stop.href && (
                  <Link
                    href={stop.href}
                    onClick={close}
                    className="mt-2 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-turf-dim hover:underline"
                  >
                    {stop.cta} now →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div key="menu" className="cutscene-title flex flex-1 flex-col justify-center py-4">
            <div className="flex items-center justify-center gap-3">
              <Coach mood="point" size={72} />
              <h2 className="font-display text-3xl font-bold text-ink sm:text-5xl">Choose your start</h2>
            </div>
            <ul className="mx-auto mt-6 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
              {FIRST_MOVES.map((m, i) => (
                <li key={m.href}>
                  <Link
                    ref={(el) => {
                      menuRefs.current[i] = el;
                    }}
                    href={m.href}
                    onClick={close}
                    onFocus={() => setPick(i)}
                    onMouseEnter={() => setPick(i)}
                    className={`tour-pick flex items-center gap-3 overflow-hidden rounded-2xl border-[3px] bg-panel p-2 pr-4 transition-all ${
                      pick === i ? "scale-[1.02] border-gold shadow-scoreboard-gold" : "border-night"
                    }`}
                  >
                    <span className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-panel-border bg-night/60">{m.art}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-bold leading-tight text-ink">{m.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">{m.note}</span>
                    </span>
                    <span aria-hidden className={`font-mono text-lg ${pick === i ? "text-gold" : "text-ink-muted"}`}>
                      {pick === i ? "▶" : "›"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Arrows to choose · Enter to go ·{" "}
              <Link href="/welcome" onClick={close} className="font-bold text-ice hover:underline">
                See the full map
              </Link>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: STOPS.length + 1 }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === at ? "w-6 bg-gold" : i < at ? "w-3 bg-turf" : "w-3 bg-panel-border"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {at > 0 && (
              <button
                type="button"
                onClick={() => setAt(at - 1)}
                className="rounded-lg px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink"
              >
                ◀ Back
              </button>
            )}
            {at < last && (
              <button type="button" onClick={next} className="press btn-gold !px-4 !py-2 text-sm" aria-keyshortcuts="ArrowRight">
                {typing ? "Show all" : at === 0 ? "Show me around ▶" : "Next ▶"}
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
