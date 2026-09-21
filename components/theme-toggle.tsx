"use client";

/**
 * Light mode was removed (dark-only charcoal). Kept as a no-op so headers that
 * still import it don't break — remove those imports when convenient.
 */
export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "sqlsports-theme";

export default function ThemeToggle() {
  return null;
}
