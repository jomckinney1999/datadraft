"use client";

/**
 * The section menus both headers share (the map is lib/nav.ts).
 *
 * Desktop: each section is its own link, plus a chevron button that opens a
 * panel of that section's pages. Hover opens it too, on a short delay so a
 * pointer crossing the bar doesn't flash every menu; leaving closes it on a
 * slightly longer one, so the trip from the tab down to the panel doesn't.
 * Escape closes it and returns focus to the chevron; so does a click
 * outside, tabbing out of it, or arriving on a new page.
 *
 * The panel is anchored to the header's content edge, not to its tab, so it
 * never runs off a tablet-width screen (the header row must be `relative`).
 *
 * Phones: the drawer lists every section with its pages beneath, so nothing
 * needs a hover.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import type { NavSection } from "@/lib/nav";
import { badgeTone, NavIcon, navTone } from "@/components/nav-icons";
import type { Tone } from "@/components/art-kit";

const BADGE_STYLE: Record<Tone, string> = {
  gold: "border-gold/60 bg-gold/15 text-gold",
  ice: "border-ice/60 bg-ice/15 text-ice",
  turf: "border-turf/60 bg-turf/15 text-turf",
};

const GROUP_TONE: Record<string, string> = {
  "Your locker": "text-gold",
  Practice: "text-turf",
  Play: "text-ice",
  Learn: "text-turf",
  Sandboxes: "text-ice",
  Builds: "text-gold",
  Cases: "text-gold",
  "Find your way": "text-ice",
  "Your stuff": "text-gold",
  "Season Pass": "text-gold",
};

function Badge({ text }: { text: string }) {
  const tone = badgeTone(text);
  return (
    <span
      className={`rounded-full border px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-widest ${BADGE_STYLE[tone]}`}
    >
      {text}
    </span>
  );
}

export function NavDropdown({
  section,
  active,
  linkClassName,
  anchor = "left",
}: {
  section: NavSection;
  active: boolean;
  /** Classes for the section's own link, given whether it's the current section. */
  linkClassName: (active: boolean) => string;
  anchor?: "left" | "right";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);
  const panelId = `nav-menu-${section.label.toLowerCase()}`;

  const later = (fn: () => void, ms: number) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  useEffect(() => setOpen(false), [pathname]);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => later(() => setOpen(true), 90)}
      onMouseLeave={() => later(() => setOpen(false), 220)}
      onBlur={onBlur}
    >
      <div className="flex items-center">
        <Link href={section.href} aria-current={active ? "page" : undefined} className={linkClassName(active)}>
          {section.label}
        </Link>
        <button
          ref={btnRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${section.label} menu`}
          onClick={() => setOpen((v) => !v)}
          className="-ml-1 flex h-7 w-5 items-center justify-center rounded text-ink-muted transition-colors hover:text-ink"
        >
          <svg aria-hidden viewBox="0 0 12 12" className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          id={panelId}
          className={`absolute top-full z-40 w-[38rem] max-w-[calc(100vw-2rem)] pt-1 ${anchor === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6"}`}
        >
          <div className="surface relative overflow-hidden rounded-2xl border border-panel-border bg-panel p-3 sm:p-4 shadow-[0_0_48px_-12px_rgb(var(--c-gold)/0.25)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_0%,rgb(var(--c-turf)/0.18),transparent_50%),radial-gradient(ellipse_60%_70%_at_100%_100%,rgb(var(--c-gold)/0.16),transparent_45%),radial-gradient(ellipse_50%_60%_at_80%_0%,rgb(var(--c-ice)/0.14),transparent_40%)]"
            />
            <div className={`relative grid gap-4 ${section.groups.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {section.groups.map((g) => (
                <div key={g.title}>
                  <p
                    className={`px-2 font-mono text-[10px] font-bold uppercase tracking-widest ${GROUP_TONE[g.title] ?? "text-ink-muted"}`}
                  >
                    {g.title}
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {g.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          data-tone={navTone(item.href)}
                          className="pop-tile group flex items-start gap-2.5 rounded-xl border border-panel-border/80 bg-panel/60 px-2 py-2"
                        >
                          <NavIcon href={item.href} />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink">
                              {item.label}
                              {item.badge && <Badge text={item.badge} />}
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-ink-muted">{item.blurb}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The phone drawer's version: every section, its pages listed beneath. */
export function NavDrawerSections({
  sections,
  current,
  onNavigate,
}: {
  sections: NavSection[];
  current: string | null;
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {sections.map((s) => (
        <div key={s.href}>
          <Link
            href={s.href}
            onClick={onNavigate}
            aria-current={current === s.href ? "page" : undefined}
            className={`block rounded-lg px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
              current === s.href ? "bg-turf/15 text-turf" : "text-ink-soft hover:bg-panel"
            }`}
          >
            {s.label}
          </Link>
          {s.groups.length > 0 && (
            <ul className="ml-2 mt-1 space-y-0.5 border-l border-panel-border/70 pl-2">
              {s.groups
                .flatMap((g) => g.items)
                .filter((i) => i.href !== s.href)
                .map((i) => (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={onNavigate}
                      data-tone={navTone(i.href)}
                      className="pop-tile group flex items-center gap-2 rounded-xl border border-panel-border/70 bg-panel/50 px-2 py-1.5 text-sm"
                    >
                      <NavIcon href={i.href} />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5 font-semibold text-ink">
                          {i.label}
                          {i.badge && <Badge text={i.badge} />}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
