/**
 * The Stat Duel's link preview — the card that unfurls when a link is pasted
 * into iMessage, X, Slack or a league group chat. This is what makes the
 * sports grid games spread: the preview shows the score to beat.
 *
 *   ?r=1-GGRGG       a shared result: "Stat Duel #1 · 4/5", the squares,
 *                    "Can you beat it?" — the result only, never the answers
 *   ?d=2026-10-02    the day's card: its first matchup, names only
 *
 * 1200×630, the size every network previews. Drawn with next/og (Satori),
 * which can't see the site's CSS, so the brand colours are written here as
 * the token values from app/globals.css — keep them in step. The display face
 * is fetched once from Google Fonts as TTF (Satori can't read WOFF2); if that
 * fetch fails the card still renders in the default face.
 */

import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { dailyDuel } from "@/lib/stat-duel";
import { dailyNumber, parseDuelResult } from "@/lib/daily-share";

// Edge, not Node: next/og's Node build resolves its bundled fallback font
// with a path that breaks on Windows, so the route would 500 in local dev.
// The edge build loads it by URL, and edge is the right home for a preview
// image anyway.
export const runtime = "edge";

// The token values, for an image drawn outside the page.
const NIGHT = "#131F24";
const PANEL = "#202F36";
const INK = "#F1F7FB";
const MUTED = "#A0ACB4";
const TURF = "#58CC02";
const GOLD = "#FFC800";
const ICE = "#1CB0F6";

let display: Promise<ArrayBuffer | null> | null = null;
function displayFont(): Promise<ArrayBuffer | null> {
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

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        background: `radial-gradient(circle at 15% 0%, rgba(88,204,2,0.22), ${NIGHT} 60%)`,
        backgroundColor: NIGHT,
        color: INK,
        fontFamily: "Display",
      }}
    >
      {children}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
        <div style={{ display: "flex", fontWeight: 700 }}>
          <span>Data</span>
          <span style={{ color: TURF }}>Draft</span>
        </div>
        <span style={{ color: MUTED, fontSize: 24 }}>Real NFL numbers · the SQL that proves them</span>
      </div>
    </div>
  );
}

const Square = ({ ok }: { ok: boolean }) => (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: 18,
      background: ok ? TURF : GOLD,
      border: `6px solid ${NIGHT}`,
      boxShadow: `0 8px 0 0 ${NIGHT}`,
      display: "flex",
    }}
  />
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = parseDuelResult(url.searchParams.get("r"));
  const day = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("d") ?? "") ? url.searchParams.get("d")! : null;
  const font = await displayFont();

  let body: ReactNode;
  if (result) {
    body = (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 30, color: GOLD, letterSpacing: 4 }}>STAT DUEL #{result.number}</span>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 8 }}>
          <span style={{ fontSize: 150, fontWeight: 700, lineHeight: 1 }}>{result.score}</span>
          <span style={{ fontSize: 80, fontWeight: 700, color: MUTED }}>/5</span>
          <span style={{ fontSize: 56, fontWeight: 700, marginLeft: 36 }}>Can you beat it?</span>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 36 }}>
          {result.grid.map((ok, i) => (
            <Square key={i} ok={ok} />
          ))}
        </div>
      </div>
    );
  } else {
    const d = day ?? new Date().toISOString().slice(0, 10);
    const first = dailyDuel(d).rounds[0];
    body = (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 30, color: GOLD, letterSpacing: 4 }}>STAT DUEL #{dailyNumber(d)}</span>
        <span style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05, marginTop: 8 }}>Who had more?</span>
        {first && (
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 34 }}>
            <div style={{ display: "flex", padding: "18px 28px", borderRadius: 20, background: PANEL, border: `4px solid ${ICE}`, fontSize: 44, fontWeight: 700 }}>
              {first.a.name}
            </div>
            <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: GOLD, color: NIGHT, fontSize: 34, fontWeight: 700 }}>VS</div>
            <div style={{ display: "flex", padding: "18px 28px", borderRadius: 20, background: PANEL, border: `4px solid ${ICE}`, fontSize: 44, fontWeight: 700 }}>
              {first.b.name}
            </div>
          </div>
        )}
        <span style={{ fontSize: 30, color: MUTED, marginTop: 26 }}>Five head-to-heads a day. Same five for everyone.</span>
      </div>
    );
  }

  return new ImageResponse(<Frame>{body}</Frame>, {
    width: 1200,
    height: 630,
    fonts: font ? [{ name: "Display", data: font, weight: 700, style: "normal" }] : [],
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
