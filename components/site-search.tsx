"use client";

/**
 * Site search — AnalystBuilder-shaped: a magnifying glass opens a panel, type
 * to filter pages / courses / projects / questions. ⌘/Ctrl+K opens it from
 * anywhere the button is mounted; Escape closes it.
 *
 * The index is fetched on intent (hover, focus, click or ⌘K), never on page
 * load: it's built from the whole question bank and the course catalogue,
 * and with the button in the nav on every page, importing it up front put
 * about a megabyte of JavaScript on every page (2026-10-05).
 */

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import type { SearchHit } from "@/lib/site-search";

type SearchIndex = typeof import("@/lib/site-search");

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  page: "Page",
  question: "Question",
  course: "Course",
  project: "Project",
  case: "Case",
};

export default function SiteSearch({
  className = "",
  compact = false,
}: {
  className?: string;
  /** Icon-only trigger (desktop nav). */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const loading = useRef(false);

  /** Start fetching the index; safe to call as often as you like. */
  function warm() {
    if (loading.current) return;
    loading.current = true;
    import("@/lib/site-search")
      .then((m) => setIndex(m))
      .catch(() => {
        loading.current = false; // try again on the next hover or open
      });
  }

  const hits = !index ? [] : q.trim() ? index.searchSite(q) : index.SEARCH_SUGGESTIONS;
  const empty = Boolean(index) && Boolean(q.trim()) && hits.length === 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    warm();
    setQ("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  function onInputKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(hits.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      window.location.href = hits[active].href;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={warm}
        onFocus={warm}
        aria-label="Search the site"
        title="Search (⌘K)"
        className={
          compact
            ? `flex h-8 w-8 items-center justify-center rounded-lg border border-panel-border text-ink-muted transition-colors hover:border-turf/50 hover:text-turf ${className}`
            : `flex items-center gap-2 rounded-xl border border-panel-border bg-night/40 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-turf/40 hover:text-ink ${className}`
        }
      >
        <SearchIcon />
        {!compact && (
          <>
            <span>Search</span>
            <kbd className="ml-auto hidden rounded border border-panel-border px-1.5 py-0.5 font-mono text-[10px] text-ink-muted sm:inline">
              ⌘K
            </kbd>
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-night/70 px-4 pb-8 pt-[12vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search DataDraft"
            className="surface w-full max-w-lg overflow-hidden rounded-2xl border border-panel-border bg-panel shadow-float"
          >
            <div className="flex items-center gap-2 border-b border-panel-border px-3 py-2.5">
              <span className="text-ink-muted">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search questions, courses, projects…"
                aria-controls={listId}
                aria-autocomplete="list"
                className="min-w-0 flex-1 bg-transparent font-sans text-sm text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink"
              >
                Esc
              </button>
            </div>

            <ul id={listId} role="listbox" className="max-h-[min(22rem,50vh)] overflow-y-auto p-2">
              {!index && (
                <li className="px-3 py-6 text-center text-sm text-ink-muted">Loading the index…</li>
              )}
              {index && !q.trim() && (
                <li className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  Suggested
                </li>
              )}
              {empty && (
                <li className="px-3 py-6 text-center text-sm text-ink-muted">
                  Nothing matched “{q.trim()}”.
                </li>
              )}
              {hits.map((h, i) => (
                <li key={`${h.kind}-${h.href}`} role="option" aria-selected={i === active}>
                  <Link
                    href={h.href}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      i === active ? "bg-turf/15 text-ink" : "text-ink-soft hover:bg-panel-hover"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 rounded border border-panel-border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-muted">
                      {KIND_LABEL[h.kind]}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-bold text-ink">{h.title}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-muted">{h.blurb}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 16.2L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
