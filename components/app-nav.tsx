"use client";

/**
 * One nav for the whole product.
 *
 * Every signed-in page used to build its own header: a HomeLink here, a row of
 * status chips there, an Account link on one board and not the next. So the
 * answer to "where am I and where can I go" changed from page to page, and the
 * only reliable way to reach /interview was to already be on /interview.
 *
 * Product sections plus Resources and Pricing, one line, always the same,
 * with the current one marked; each opens a menu of its own pages
 * (lib/nav.ts). The wordmark goes home, which CLAUDE.md requires of every route.
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
import { EMPTY_PROGRESS, loadProgress, PROGRESS_EVENT, type Progress } from "@/lib/progress";
import { PAYWALL_LIVE } from "@/lib/season-pass";
import LearnStatusChips from "@/components/learn-status-chips";
import CharacterChip from "@/components/character-chip";
import { NavDrawerSections, NavDropdown } from "@/components/nav-menu";
import SiteSearch from "@/components/site-search";
import ThemeToggle from "@/components/theme-toggle";
import SfxMuteButton from "@/components/sfx-mute-button";
import BroadcastCut from "@/components/broadcast-cut";
import SecretPlay from "@/components/secret-play";
import { NAV, currentSection } from "@/lib/nav";
import { playSfx } from "@/lib/sfx";

// Sections in the order someone moves through them: where am I, what can I
// solve, what can I learn, what can I build, then Resources and Pricing.
// Each opens a menu of its own pages (lib/nav.ts).
const TAB = (on: boolean) =>
  `whitespace-nowrap rounded-lg px-1.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors xl:px-2 xl:text-[11px] ${
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
  // A back link to the section whose tab is already lit says the same thing
  // twice, and the bar has no room for it ("← all questions" beside a lit
  // Questions tab). It stays in the drawer either way.
  const showBack = Boolean(back) && back !== current;

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
    const onProgress = (e: Event) => {
      const detail = (e as CustomEvent<Progress>).detail;
      setProgress(detail ?? loadProgress());
    };
    window.addEventListener(PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(PROGRESS_EVENT, onProgress);
  }, []);

  return (
    <>
    {/* The first-visit tour offer. It reads the query string (?tour=1, ?r=),
        which needs a Suspense boundary so static pages stay static. */}
    <Suspense fallback={null}>
      <WelcomePrompt />
    </Suspense>
    <BroadcastCut />
    <SecretPlay />
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
          {showBack && (
            <Link
              href={back!}
              title={`Back to ${backLabel ?? "the last page"}`}
              aria-label={`Back to ${backLabel ?? "the last page"}`}
              className="hidden h-8 w-8 items-center justify-center self-center rounded-lg border border-panel-border font-mono text-sm text-ink-muted transition-colors hover:border-turf/50 hover:text-turf lg:flex"
            >
              ←
            </Link>
          )}
        </div>

        {/* The tabs never shrink: when they could, the row ran out of room and
            they slid underneath the status chips. Below lg they're in the
            drawer; if room still runs short, the status chips give way. */}
        <nav
          aria-label="Main"
          className="hidden shrink-0 items-center gap-0.5 lg:flex xl:gap-1"
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
                onClick={() => playSfx("ui")}
              >
                {section.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden min-w-0 md:block">
            <LearnStatusChips progress={progress} dense />
          </div>
          <SiteSearch compact />
          <span className="hidden sm:inline-flex">
            <SfxMuteButton />
          </span>
          <ThemeToggle />
          <div className="hidden shrink-0 md:block lg:hidden">
            <CharacterChip progress={progress} />
          </div>
          <div className="hidden shrink-0 lg:block">
            <CharacterChip progress={progress} icon />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-ink transition-colors hover:text-turf lg:hidden"
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
          className="border-t border-panel-border/80 bg-night/95 px-4 py-3 backdrop-blur-sm lg:hidden"
        >
          <div className="mx-auto flex max-h-[calc(100svh-4rem)] max-w-6xl flex-col gap-0.5 overflow-y-auto">
            <NavDrawerSections sections={NAV} current={current} onNavigate={() => setOpen(false)} />
            <div className="mt-2" onClick={() => setOpen(false)}>
              <CharacterChip progress={progress} compact />
            </div>
            {back && (
              <Link
                href={back}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:bg-panel"
              >
                ← {backLabel ?? "back"}
              </Link>
            )}
            <div className="mt-2 space-y-2 border-t border-panel-border/70 pt-3">
              <SiteSearch className="w-full" />
              <div className="flex items-center gap-2 px-1">
                <ThemeToggle />
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Theme</span>
              </div>
              <LearnStatusChips progress={progress} />
            </div>
          </div>
        </nav>
      )}
    </header>
    </>
  );
}
