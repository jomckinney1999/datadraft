"use client";

/**
 * One nav for the whole product.
 *
 * Every signed-in page used to build its own header: a HomeLink here, a row of
 * status chips there, an Account link on one board and not the next. So the
 * answer to "where am I and where can I go" changed from page to page, and the
 * only reliable way to reach /interview was to already be on /interview.
 *
 * Four sections, one line, always the same, with the current one marked;
 * three of them open a menu of their own pages (lib/nav.ts).
 * The wordmark goes home, which CLAUDE.md requires of every route.
 *
 * It is `h-14` at every width on purpose, matching the marketing header. A
 * header that changed height when the links wrapped would drag every other
 * sticky element in the app with it — the roadmap's mobile bar and the career
 * board's progress strip both park directly underneath it at `top-14`.
 *
 * A page that also wants an in-context back link passes `back` / `backLabel`
 * and it renders beside the wordmark, never by re-pointing the wordmark — the
 * same rule HomeLink follows and for the same reason.
 *
 * The lesson player and the interview workspace deliberately do not use this:
 * mid-drive their top bar stays the task and a way out, so a nav row can't
 * cost you a drive by accident.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { WelcomePrompt } from "@/components/welcome-tour";
import { EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import { PAYWALL_LIVE } from "@/lib/season-pass";
import LearnStatusChips from "@/components/learn-status-chips";
import { NavDrawerSections, NavDropdown } from "@/components/nav-menu";
import { NAV, currentSection } from "@/lib/nav";

// Four sections, in the order someone moves through them: where am I, what
// can I solve, what can I learn, what can I build. Each of the last three
// opens a menu of its own pages (lib/nav.ts); adding a fifth tab still means
// taking one out.
const TAB = (on: boolean) =>
  `whitespace-nowrap rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
    on ? "bg-turf/15 text-turf" : "text-ink-muted hover:bg-panel hover:text-ink"
  }`;

export default function AppNav({
  back,
  backLabel,
}: {
  /** Optional in-context back target, rendered beside the wordmark. */
  back?: string;
  backLabel?: string;
} = {}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const current = currentSection(pathname);

  // Keep the Season Pass flag in step with the server (at most twice a day).
  // Loaded only once the paywall is live, so the Supabase client isn't in
  // every page's bundle before there's anything to check.
  useEffect(() => {
    if (!PAYWALL_LIVE) return;
    void import("@/lib/progress-sync").then((m) => m.refreshPass());
  }, []);

  // Escape closes the drawer, as it does every other overlay on the web.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Arriving on a new route closes it too. The link handlers already do
  // this for a tap; this covers back/forward, where no link was tapped.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Loaded here rather than passed in, so a page can drop <AppNav /> at the
  // top without threading progress through components that don't need it.
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return (
    <>
    {/* The first-visit tour offer. It reads the query string (?tour=1, ?r=),
        which needs a Suspense boundary so static pages stay static. */}
    <Suspense fallback={null}>
      <WelcomePrompt />
    </Suspense>
    <header className="glass sticky top-0 z-30 border-b border-panel-border/80">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 shrink-0 items-baseline gap-3">
          <Link
            href="/"
            aria-label="DataDraft home"
            className="shrink-0 font-display text-lg font-bold tracking-tight text-pop transition-opacity hover:opacity-80"
          >
            Data<span className="text-turf">Draft</span>
          </Link>
          {back && (
            <Link
              href={back}
              className="hidden truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-turf lg:inline"
            >
              ← {backLabel ?? "back"}
            </Link>
          )}
        </div>

        <nav
          aria-label="Main"
          className="hidden min-w-0 flex-1 items-center gap-1 md:flex"
        >
          {NAV.map((section) =>
            section.groups.length ? (
              <NavDropdown key={section.href} section={section} active={current === section.href} linkClassName={TAB} />
            ) : (
              <Link
                key={section.href}
                href={section.href}
                aria-current={current === section.href ? "page" : undefined}
                className={TAB(current === section.href)}
              >
                {section.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden lg:block">
            <LearnStatusChips progress={progress} />
          </div>
          <Link
            href="/account"
            aria-current={pathname === "/account" ? "page" : undefined}
            className={`hidden max-w-[10rem] truncate whitespace-nowrap rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors md:inline ${
              pathname === "/account"
                ? "bg-turf/15 text-turf"
                : "text-ink-muted hover:bg-panel hover:text-ink"
            }`}
          >
            {progress.username || "Account"}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-turf md:hidden"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Main"
          className="border-t border-panel-border/80 bg-night/95 px-4 py-3 backdrop-blur-sm md:hidden"
        >
          <div className="mx-auto flex max-h-[calc(100svh-4rem)] max-w-6xl flex-col gap-0.5 overflow-y-auto">
            <NavDrawerSections sections={NAV} current={current} onNavigate={() => setOpen(false)} />
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/account" ? "page" : undefined}
              className={`mt-2 rounded-lg px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                pathname === "/account" ? "bg-turf/15 text-turf" : "text-ink-soft hover:bg-panel"
              }`}
            >
              Account
            </Link>
            {back && (
              <Link
                href={back}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:bg-panel"
              >
                ← {backLabel ?? "back"}
              </Link>
            )}
            <div className="mt-2 border-t border-panel-border/70 pt-3">
              <LearnStatusChips progress={progress} />
            </div>
          </div>
        </nav>
      )}
    </header>
    </>
  );
}
