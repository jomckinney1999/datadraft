"use client";

import { useState } from "react";
import Link from "next/link";

/*
 * Deliberately short, and the same four sections as the in-product AppNav so
 * crossing from the landing page into the app does not re-arrange the world.
 * Marketing sections stay on the page; they are not in the bar.
 */
const ROUTE_LINKS = [
  { href: "/questions", label: "Questions" },
  { href: "/learn", label: "Courses" },
  { href: "/projects", label: "Projects" },
  { href: "/account", label: "Account" },
];

const LINK =
  "whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-turf";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-30 border-b border-panel-border/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="DataDraft home" className="flex shrink-0 items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-pop">
            Data<span className="text-turf">Draft</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:inline">
            v0.1
          </span>
        </Link>

        <nav className="hidden items-center gap-5 sm:flex">
          {ROUTE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK}>
              {link.label}
            </Link>
          ))}

          <Link
            href="/account"
            className="whitespace-nowrap border border-turf/50 bg-turf/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors duration-150 hover:border-turf hover:bg-turf/20"
          >
            Start free
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center text-ink transition-colors duration-150 hover:text-turf"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-panel-border/80 bg-night/95 px-4 py-4 backdrop-blur-sm sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {ROUTE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-2 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-turf"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-2 border border-turf/50 bg-turf/10 px-3 py-2.5 text-center font-mono text-xs uppercase tracking-wider text-turf transition-colors duration-150 hover:border-turf hover:bg-turf/20"
            >
              Start free
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
