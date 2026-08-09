"use client";

import { useState } from "react";

const NAV_LINKS = [
  { href: "#why", label: "Why SQL Sports", accent: "teal" as const },
  { href: "#sandbox", label: "Sandbox", accent: "teal" as const },
  { href: "#curriculum", label: "Curriculum", accent: "teal" as const },
  { href: "#pricing", label: "Pricing", accent: "teal" as const },
  { href: "#career-track", label: "Career Track", accent: "amber" as const },
  { href: "#challenge", label: "Challenge", accent: "teal" as const },
  { href: "#stat-guru", label: "NFL Stat Guru", accent: "amber" as const },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-panel-border/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-pop">
            SQL<span className="text-teal">Sports</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:inline">
            v0.1
          </span>
        </a>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors duration-150 ${
                link.accent === "amber" ? "hover:text-amber" : "hover:text-teal"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/learn"
            className="border border-teal/50 bg-teal/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-teal transition-colors duration-150 hover:border-teal hover:bg-teal/20"
          >
            Start learning
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-ink transition-colors duration-150 hover:text-teal sm:hidden"
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

      {open && (
        <nav className="border-t border-panel-border/80 bg-night/95 px-4 py-4 backdrop-blur-sm sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-2 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors duration-150 ${
                  link.accent === "amber" ? "hover:text-amber" : "hover:text-teal"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/learn"
              onClick={() => setOpen(false)}
              className="mt-2 border border-teal/50 bg-teal/10 px-3 py-2.5 text-center font-mono text-xs uppercase tracking-wider text-teal transition-colors duration-150 hover:border-teal hover:bg-teal/20"
            >
              Start learning
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
