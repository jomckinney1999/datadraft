"use client";

import { useState } from "react";
import Link from "next/link";

/*
 * One word per link where the section allows it, and in the order the
 * sections actually appear on the page — the nav doubles as a table of
 * contents, so it should read top-to-bottom the way the page scrolls.
 *
 * The labels were two and three words each ("Why SQL Sports", "NFL Stat
 * Guru"), which in uppercase mono added up to wider than the container and
 * wrapped every link onto two lines. `whitespace-nowrap` stops any single
 * label splitting; short labels are what make the row fit at all.
 */
const SECTION_LINKS = [
  { href: "#pick-your-sport", label: "Sports" },
  { href: "#why", label: "Why" },
  { href: "#curriculum", label: "Roadmap" },
  { href: "#career-track", label: "Careers" },
  { href: "#pricing", label: "Pricing" },
  { href: "#challenge", label: "Challenge" },
  { href: "#stat-guru", label: "Stat Guru" },
];

/* Links that leave the page, kept apart from the in-page anchors by a rule. */
const ROUTE_LINKS = [
  { href: "/field", label: "Practice" },
  { href: "/account", label: "Account" },
];

const LINK =
  "whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-turf";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-30 border-b border-panel-border/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="SQL Sports home" className="flex shrink-0 items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-pop">
            SQL<span className="text-turf">Sports</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:inline">
            v0.1
          </span>
        </Link>

        {/* The full row only appears once it can fit on one line. Below lg it
            would have to wrap no matter how short the labels are, so those
            widths get the menu instead. */}
        <nav className="hidden items-center gap-5 lg:flex">
          {SECTION_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={LINK}>
              {link.label}
            </a>
          ))}

          <span aria-hidden className="h-4 w-px bg-panel-border" />

          {ROUTE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK}>
              {link.label}
            </Link>
          ))}

          <Link
            href="/learn"
            className="whitespace-nowrap border border-turf/50 bg-turf/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors duration-150 hover:border-turf hover:bg-turf/20"
          >
            Learn
          </Link>
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
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
        <nav className="border-t border-panel-border/80 bg-night/95 px-4 py-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-2 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-turf"
              >
                {link.label}
              </a>
            ))}

            <span aria-hidden className="mx-2 my-2 h-px bg-panel-border" />

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
              href="/learn"
              onClick={() => setOpen(false)}
              className="mt-2 border border-turf/50 bg-turf/10 px-3 py-2.5 text-center font-mono text-xs uppercase tracking-wider text-turf transition-colors duration-150 hover:border-turf hover:bg-turf/20"
            >
              Learn
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
