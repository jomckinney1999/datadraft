/**
 * Shared pieces for the link-preview cards drawn with next/og (Satori):
 * the brand colours, the display face, and the frame every card sits in.
 *
 * Satori can't read the site's CSS, so the colours are the token values from
 * app/globals.css written out — keep them in step. The display face is
 * fetched once from Google Fonts as TTF (Satori can't read WOFF2); if that
 * fetch fails, cards still render in the default face.
 *
 * Every route that uses this runs on the edge runtime: next/og's Node build
 * resolves its bundled fallback font with a path that breaks on Windows, so
 * on Node the routes 500 in local dev.
 */

import type { ReactNode } from "react";

export const OG = {
  night: "#131F24",
  panel: "#202F36",
  ink: "#F1F7FB",
  muted: "#A0ACB4",
  turf: "#58CC02",
  gold: "#FFC800",
  ice: "#1CB0F6",
} as const;

export const OG_SIZE = { width: 1200, height: 630 };

let display: Promise<ArrayBuffer | null> | null = null;
export function displayFont(): Promise<ArrayBuffer | null> {
  display ??= (async () => {
    try {
      // An old user agent makes Google Fonts answer with TTF.
      const css = await fetch("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700", {
        headers: { "User-Agent": "Mozilla/4.0" },
      }).then((r) => r.text());
      const url = /url\((https:[^)]+\.ttf)\)/.exec(css)?.[1];
      return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
    } catch {
      return null;
    }
  })();
  return display;
}

export async function ogFonts() {
  const font = await displayFont();
  return font ? [{ name: "Display", data: font, weight: 700 as const, style: "normal" as const }] : [];
}

export function OgFrame({ children, glow = OG.turf, tagline }: { children: ReactNode; glow?: string; tagline: string }) {
  // The glow colour as rgba, for the corner wash.
  const hex = glow.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        background: `radial-gradient(circle at 15% 0%, rgba(${r},${g},${b},0.22), ${OG.night} 60%)`,
        backgroundColor: OG.night,
        color: OG.ink,
        fontFamily: "Display",
      }}
    >
      {children}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
        <div style={{ display: "flex", fontWeight: 700 }}>
          <span>Data</span>
          <span style={{ color: OG.turf }}>Draft</span>
        </div>
        <span style={{ color: OG.muted, fontSize: 24 }}>{tagline}</span>
      </div>
    </div>
  );
}
