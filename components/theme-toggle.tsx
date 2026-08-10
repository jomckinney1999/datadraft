"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "sqlsports-theme";

/**
 * The same logic runs twice: once here, and once in the blocking script in
 * app/layout.tsx that sets data-theme before first paint. Keep them in sync —
 * if they disagree, the page flashes the wrong theme on load.
 */
function systemTheme(): Theme {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    // Private mode / blocked storage — fall back to the system preference.
    return null;
  }
}

/**
 * Swap the theme with transitions suppressed for one frame. Skipping this
 * leaves every element with `transition-colors` painted in the previous
 * theme's colors — see the .theme-switching rule in app/globals.css.
 */
function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.setAttribute("data-theme", next);
  // Force a style flush so the suppression is in effect for this change.
  void window.getComputedStyle(root).backgroundColor;

  // rAF is the right moment to restore transitions, but it never fires in a
  // backgrounded tab — without the timeout, switching the theme and then
  // switching tabs would leave transitions disabled site-wide. Both paths are
  // idempotent, so whichever lands first wins.
  const restore = () => root.classList.remove("theme-switching");
  window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
  window.setTimeout(restore, 100);
}

export default function ThemeToggle() {
  // Must match the server render (dark is the documented default) so the first
  // client render doesn't mismatch; the effect below corrects it immediately.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme | null) ??
      storedTheme() ??
      systemTheme();
    setTheme(current);
  }, []);

  // Track the OS preference only while the visitor hasn't made an explicit
  // choice — an explicit choice should survive the system flipping at sunset.
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
      // Non-fatal: the theme still applies for this page view.
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
      className="flex h-8 w-8 items-center justify-center border border-panel-border text-ink-muted transition-colors duration-150 hover:border-turf/50 hover:text-turf"
    >
      {/* Sun — shown on dark, i.e. the theme you'd switch to */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className="icon-when-dark h-4 w-4"
      >
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6L17 17M7 7L5.4 5.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      {/* Moon — shown on light */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className="icon-when-light h-4 w-4"
      >
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
