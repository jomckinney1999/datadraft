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

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import Coach from "@/components/coach";
import { loadProgress } from "@/lib/progress";
import { markSeen, openTour, OPEN_EVENT, SEEN_KEY } from "@/lib/welcome";

export { openTour };

/** The tour, fetched the first time it opens (it carries every art kit). */
const WelcomeTour = dynamic(() => import("@/components/welcome-tour-player"), { ssr: false });

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
