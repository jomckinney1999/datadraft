"use client";

/**
 * Landing-page header, AnalystBuilder-shaped:
 *
 *   • At the top of the page the full menu stays hidden — only the wordmark
 *     and a Menu control sit over the hero, so the first screen is one
 *     composition (headline + CTAs), not a nav dashboard.
 *   • Menu opens a panel with every section, search, theme and Start free.
 *   • After a short scroll, a floating glass bar slides in with the same
 *     links in a row, and its wordmark folds down into the DD mark
 *     (components/brand-mark.tsx).
 *
 * Same sections as AppNav (lib/nav.ts); Dashboard is left out — a visitor
 * has none yet.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/brand-mark";
import { NavDrawerSections, NavDropdown } from "@/components/nav-menu";
import SiteSearch from "@/components/site-search";
import ThemeToggle from "@/components/theme-toggle";
import { NAV } from "@/lib/nav";

const SECTIONS = NAV.filter((s) => s.href !== "/dashboard");

const LINK =
  "whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-turf";

const SCROLL_SHOW = 72;

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_SHOW);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock background scroll while the menu panel is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* ── Top of page: quiet chrome over the hero ─────────────── */}
      {!scrolled && (
        <div className="fixed inset-x-0 top-0 z-30">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" aria-label="DataDraft home" className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-pop drop-shadow-[0_1px_8px_rgb(var(--c-night)/0.8)]">
                Data<span className="text-turf">Draft</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5">
              <SiteSearch compact />
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="flex h-9 items-center gap-2 rounded-xl border border-panel-border/70 bg-night/50 px-3 font-mono text-[11px] uppercase tracking-wider text-ink backdrop-blur-md transition-colors hover:border-turf/50 hover:text-turf"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="hidden sm:inline">Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── After scroll: floating glass bar ────────────────────── */}
      <header
        aria-hidden={!scrolled}
        className={`fixed inset-x-0 top-0 z-30 transition-[transform,opacity] duration-300 ease-out ${
          scrolled ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="mx-auto mt-3 max-w-5xl px-3 sm:px-4">
          <div className="glass relative flex h-14 items-center justify-between gap-4 rounded-2xl border border-panel-border/80 px-3 shadow-float sm:px-4">
            {/* The wordmark folds into the DD mark as the bar arrives. */}
            <Link href="/" aria-label="DataDraft home" className="flex shrink-0 items-center">
              <BrandLogo compact={scrolled} />
            </Link>

            <nav className="hidden items-center gap-4 lg:flex">
              {SECTIONS.map((section) => (
                <NavDropdown
                  key={section.href}
                  section={section}
                  active={false}
                  linkClassName={() => LINK}
                  anchor="right"
                />
              ))}
              <Link href="/account" className={LINK}>
                Account
              </Link>
              <div className="ml-1 flex items-center gap-1.5 border-l border-panel-border/70 pl-3">
                <SiteSearch compact />
                <ThemeToggle />
                <Link
                  href="/account"
                  className="whitespace-nowrap rounded-xl border border-turf/50 bg-turf/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors duration-150 hover:border-turf hover:bg-turf/20"
                >
                  Start free
                </Link>
              </div>
            </nav>

            <div className="flex items-center gap-1 lg:hidden">
              <SiteSearch compact />
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:text-turf"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Menu panel (hamburger / Menu) ───────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-night/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <nav
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="surface flex h-full w-full max-w-sm flex-col border-l border-panel-border bg-panel shadow-float"
          >
            <div className="flex items-center justify-between gap-3 border-b border-panel-border px-4 py-3">
              <span className="font-display text-base font-bold text-pop">
                Data<span className="text-turf">Draft</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-panel-border text-ink-muted hover:text-ink"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <NavDrawerSections sections={SECTIONS} current={null} onNavigate={() => setOpen(false)} />
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:bg-panel-hover hover:text-ink"
              >
                Account
              </Link>
            </div>

            <div className="space-y-2 border-t border-panel-border p-3">
              <SiteSearch className="w-full" />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Theme</span>
              </div>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="btn-turf block w-full rounded-xl px-3 py-2.5 text-center font-mono text-xs uppercase tracking-wider"
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
