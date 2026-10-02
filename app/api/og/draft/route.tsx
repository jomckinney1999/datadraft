/**
 * The Draft Room's link preview, the card that unfurls in a group chat.
 *
 *   ?r=2025-abc12x-4-11-3-1742-C   a shared result: the record, the finish,
 *                                  the points, "Can you beat it?"
 *   (nothing)                      the pitch
 *
 * 1200×630, drawn with next/og on the edge runtime for the same reason as the
 * Stat Duel's card (app/api/og/duel/route.tsx): the Node build can't find its
 * own fallback font on Windows. Brand colours are the token values from
 * app/globals.css, because Satori can't read the site's CSS.
 */

import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { FINISH_LABEL, parseResult } from "@/lib/draft-sim";

export const runtime = "edge";

const NIGHT = "#131F24";
const PANEL = "#202F36";
const INK = "#F1F7FB";
const MUTED = "#A0ACB4";
const TURF = "#58CC02";
const GOLD = "#FFC800";

let display: Promise<ArrayBuffer | null> | null = null;
function displayFont(): Promise<ArrayBuffer | null> {
  display ??= (async () => {
    try {
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
        background: `radial-gradient(circle at 85% 0%, rgba(255,200,0,0.2), ${NIGHT} 60%)`,
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
        <span style={{ color: MUTED, fontSize: 24 }}>The Draft Room · real ADP · real points</span>
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const result = parseResult(new URL(req.url).searchParams.get("r"));
  const font = await displayFont();

  const body = result ? (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 30, color: GOLD, letterSpacing: 4 }}>
        THE DRAFT ROOM · {result.season} SEASON · SLOT {result.slot + 1}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", marginTop: 8 }}>
        <span style={{ fontSize: 160, fontWeight: 700, lineHeight: 1 }}>
          {result.w}–{result.l}
        </span>
        <span style={{ fontSize: 44, fontWeight: 700, color: MUTED, marginLeft: 28 }}>{result.pf.toLocaleString("en-US")} pts</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 26 }}>
        <div
          style={{
            display: "flex",
            padding: "12px 26px",
            borderRadius: 18,
            background: result.finish === "C" ? GOLD : PANEL,
            color: result.finish === "C" ? NIGHT : INK,
            border: `5px solid ${NIGHT}`,
            boxShadow: `0 7px 0 0 ${NIGHT}`,
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          {FINISH_LABEL[result.finish]}
        </div>
        <span style={{ fontSize: 46, fontWeight: 700 }}>Can you beat my draft?</span>
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 30, color: GOLD, letterSpacing: 4 }}>THE DRAFT ROOM</span>
      <span style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, marginTop: 10 }}>Draft a real season.</span>
      <span style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, color: TURF }}>Scout it with SQL.</span>
      <span style={{ fontSize: 30, color: MUTED, marginTop: 24 }}>
        Real Sleeper ADP. Seven bots. Then the season plays out with the points that actually happened.
      </span>
    </div>
  );

  return new ImageResponse(<Frame>{body}</Frame>, {
    width: 1200,
    height: 630,
    fonts: font ? [{ name: "Display", data: font, weight: 700, style: "normal" }] : [],
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
