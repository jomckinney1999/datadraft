/**
 * Link-preview cards for the site and for single questions — what unfurls
 * when someone pastes a DataDraft link into a group chat, X or Slack.
 *
 *   (no params)                          the site card
 *   ?kind=question&t=…&d=easy&l=sql&s=…  a question: title, level, language,
 *                                        the start of the prompt
 *
 * The question's text comes in the query string rather than from
 * lib/questions, so this edge function doesn't bundle the question bank and
 * the lesson database behind it. The question page builds the URL.
 */

import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgFrame, ogFonts } from "@/lib/og";

export const runtime = "edge";

const LEVEL_COLOUR: Record<string, string> = { easy: OG.turf, medium: OG.ice, hard: OG.gold };
const LANG_LABEL: Record<string, string> = { sql: "SQL", python: "PYTHON", r: "R", excel: "EXCEL" };

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const fonts = await ogFonts();
  const headers = { "Cache-Control": "public, max-age=3600, s-maxage=86400" };

  if (p.get("kind") === "question") {
    const title = (p.get("t") ?? "A DataDraft question").slice(0, 60);
    const level = (p.get("d") ?? "").toLowerCase();
    const lang = LANG_LABEL[(p.get("l") ?? "sql").toLowerCase()] ?? "SQL";
    const prompt = (p.get("s") ?? "").slice(0, 150);
    return new ImageResponse(
      (
        <OgFrame glow={LEVEL_COLOUR[level] ?? OG.turf} tagline="Real NFL data · solve it in your browser">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 28, color: OG.gold, letterSpacing: 4 }}>{lang} QUESTION</span>
              {level && (
                <span
                  style={{
                    display: "flex",
                    padding: "4px 16px",
                    borderRadius: 999,
                    border: `3px solid ${LEVEL_COLOUR[level] ?? OG.turf}`,
                    color: LEVEL_COLOUR[level] ?? OG.turf,
                    fontSize: 24,
                    letterSpacing: 3,
                  }}
                >
                  {level.toUpperCase()}
                </span>
              )}
            </div>
            <span style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, marginTop: 14 }}>{title}</span>
            {prompt && (
              <span style={{ fontSize: 32, color: OG.muted, marginTop: 22, lineHeight: 1.35, maxWidth: 1040 }}>
                {prompt.length === 150 ? `${prompt}…` : prompt}
              </span>
            )}
          </div>
        </OgFrame>
      ),
      { ...OG_SIZE, fonts, headers },
    );
  }

  return new ImageResponse(
    (
      <OgFrame tagline="SQL · Python · Excel · R on real NFL data">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 30, color: OG.gold, letterSpacing: 4 }}>LEETCODE FOR FOOTBALL DATA</span>
          <span style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 12 }}>
            You&apos;re already the numbers person in your league.
          </span>
          <span style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, color: OG.turf }}>Make it your job.</span>
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, fonts, headers },
  );
}
