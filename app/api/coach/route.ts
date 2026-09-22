import { generateText } from "ai";
import { NextResponse } from "next/server";

/**
 * Coach Blitz — short, Duo-style tips. Uses Vercel AI Gateway when configured;
 * otherwise returns 503 so the UI can fall back to the written hint/explain.
 *
 * Auth: AI Gateway via OIDC on Vercel, or AI_GATEWAY_API_KEY locally.
 * Never send full lesson dumps — only the active prompt + attempt.
 */

export const runtime = "nodejs";
export const maxDuration = 20;

type CoachBody = {
  mode: "hint" | "why_wrong";
  prompt: string;
  exerciseType: string;
  learnerAnswer?: string;
  solution?: string;
  explain?: string;
  /** Optional lesson id for logging — not required. */
  lessonId?: string;
};

const SYSTEM = `You are Coach Blitz for SQL Sports — a friendly fantasy-football SQL coach.
Rules:
- 2–4 short sentences max. Talk like Duo: warm, plain, contractions OK.
- Never dump a full multi-statement solution unless mode is why_wrong AND a solution was provided — then show it briefly and say why theirs missed.
- In "hint" mode: nudge toward the idea; do NOT give the final answer.
- Football flavor is light seasoning, not jargon.
- No markdown headings. No bullet walls.`;

function coachAvailable(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.AWS_ROLE_ARN,
  );
}

export async function POST(req: Request) {
  let body: CoachBody;
  try {
    body = (await req.json()) as CoachBody;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (!body?.prompt || !body?.mode || !body?.exerciseType) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Soft gate: without gateway credentials, don't pretend.
  if (!process.env.AI_GATEWAY_API_KEY && process.env.NODE_ENV === "development") {
    // Still try — local `vercel env pull` / gateway may inject auth.
  }

  const userBits = [
    `Mode: ${body.mode}`,
    `Exercise type: ${body.exerciseType}`,
    `Prompt: ${body.prompt.slice(0, 800)}`,
  ];
  if (body.learnerAnswer) {
    userBits.push(`Learner answer (truncated):\n${body.learnerAnswer.slice(0, 1200)}`);
  }
  if (body.mode === "why_wrong" && body.solution) {
    userBits.push(`Correct answer / key (truncated):\n${body.solution.slice(0, 1200)}`);
  }
  if (body.explain) {
    userBits.push(`Curriculum tip: ${body.explain.slice(0, 400)}`);
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM,
      prompt: userBits.join("\n\n"),
      maxOutputTokens: 220,
      temperature: 0.4,
    });

    const cleaned = text.trim();
    if (!cleaned) {
      return NextResponse.json({ error: "empty" }, { status: 502 });
    }
    return NextResponse.json({ text: cleaned });
  } catch (err) {
    const message = err instanceof Error ? err.message : "coach_failed";
    // Common when gateway isn't linked yet — UI shows written explain instead.
    const unavailable =
      /auth|api key|unauthorized|not configured|oidc/i.test(message) ||
      !coachAvailable();
    return NextResponse.json(
      {
        error: unavailable ? "unavailable" : "coach_failed",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: unavailable ? 503 : 502 },
    );
  }
}
