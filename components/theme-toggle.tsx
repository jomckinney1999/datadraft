"use client";

/**
 * Dark / light toggle. The palette lives in CSS variables on `data-theme`
 * (app/globals.css).
 *
 * Theme flips are instant on purpose. A View Transitions circular wipe used
 * to run here, but capturing two full-page snapshots of a stadium-lit UI
 * (grain, field motion, Coach SVGs) made the click feel stuck for hundreds
 * of milliseconds before anything moved. The `.theme-switching` one-frame
 * transition kill is the snappy path — and the one that also stops Chrome
 * from leaving `transition-colors` stuck on the old var() colours.
 *
 * The same preference is read by the blocking script in app/layout.tsx so
 * the first paint matches; keep those paths in sync.
 */

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "sqlsports-theme";

function systemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function paintTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", next === "dark" ? "#131F24" : "#F4F7F9");
}

/**
 * Swap the theme in one paint. Kill colour transitions for a frame so every
 * var()-derived colour recomputes cleanly instead of crossfading (or sticking).
 */
function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  paintTheme(next);
  // Force style flush so the new vars resolve under the transition kill.
  void window.getComputedStyle(root).backgroundColor;
  const restore = () => root.classList.remove("theme-switching");
  window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
  // Safety net if rAF is throttled in a background tab.
  window.setTimeout(restore, 48);
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme | null) ??
      storedTheme() ??
      systemTheme();
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (storedTheme()) return;
      const next: Theme = media.matches ? "light" : "dark";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* theme still applies for this view */
    }
    setTheme(next);
  }

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-panel-border text-ink-muted transition-[border-color,color,transform] duration-150 hover:border-turf/50 hover:text-turf active:scale-95 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" fill="none" className="icon-when-dark h-4 w-4">
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6L17 17M7 7L5.4 5.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <svg aria-hidden viewBox="0 0 24 24" fill="none" className="icon-when-light h-4 w-4">
        <path
          d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
