import { generateText } from "ai";
import { NextResponse } from "next/server";

/**
 * Coach Blitz — short, Duo-style tips. Uses Vercel AI Gateway; when the
 * gateway can't answer it returns 503 so the UI falls back to the written
 * hint, explain, or Query Doctor's diagnosis.
 *
 * Auth: on Vercel the gateway authenticates with the deployment's OIDC token
 * (no key to manage); locally, set AI_GATEWAY_API_KEY. Spend is capped by an
 * AI Gateway budget on the project, which is the hard limit. The per-visitor
 * limit below is a soft one, so one tab can't burn the month's budget.
 *
 * Never send full lesson dumps — only the active prompt + attempt.
 */

export const runtime = "nodejs";
export const maxDuration = 20;

/**
 * gpt-5-mini is a reasoning model: output tokens include its thinking, and it
 * doesn't take a temperature. Reasoning is set to minimal so the budget goes
 * on the answer — at 220 tokens with default reasoning it could think through
 * the whole allowance and say nothing.
 */
const MODEL = "openai/gpt-5-mini";
const MAX_OUTPUT_TOKENS = 500;

/** Asks per visitor per hour, per server instance. Best effort; the budget is the real cap. */
const PER_HOUR = 20;
const asks = new Map<string, number[]>();

function overLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (asks.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= PER_HOUR) {
    asks.set(ip, recent);
    return true;
  }
  recent.push(now);
  asks.set(ip, recent);
  if (asks.size > 5000) asks.clear(); // keep a long-lived instance from growing forever
  return false;
}

type CoachBody = {
  mode: "hint" | "why_wrong" | "diagnose";
  prompt: string;
  exerciseType: string;
  learnerAnswer?: string;
  solution?: string;
  explain?: string;
  /** diagnose: Query Doctor's findings (lib/query-doctor.ts). Never the key. */
  findings?: string;
  /** Optional lesson id for logging — not required. */
  lessonId?: string;
};

const SYSTEM = `You are Coach Blitz for DataDraft — a friendly fantasy-football SQL coach.
Rules:
- 2–4 short sentences max. Talk like Duo: warm, plain, contractions OK.
- Never dump a full multi-statement solution unless mode is why_wrong AND a solution was provided — then show it briefly and say why theirs missed.
- In "hint" mode: nudge toward the idea; do NOT give the final answer.
- In "diagnose" mode: you get the learner's SQL and a diagnosis of what is wrong. Explain the mistake in plain words and say which part of THEIR query to change. Never write the full corrected query, and never invent numbers from the answer — you haven't seen it.
- Football flavor is light seasoning, not jargon.
- No markdown headings. No bullet walls.`;

/** Errors that mean "the coach isn't switched on", as opposed to a one-off failure. */
const UNAVAILABLE =
  /auth|api key|unauthori[sz]ed|forbidden|not configured|oidc|credit|insufficient|payment|quota|budget|free tier|402|401|403/i;

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

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (overLimit(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
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
  if (body.mode === "diagnose" && body.findings) {
    userBits.push(`Diagnosis:\n${body.findings.slice(0, 900)}`);
  }

  try {
    const { text } = await generateText({
      model: MODEL,
      system: SYSTEM,
      prompt: userBits.join("\n\n"),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions: { openai: { reasoningEffort: "minimal" } },
    });

    const cleaned = text.trim();
    if (!cleaned) {
      console.error("[coach] empty answer", { mode: body.mode, model: MODEL });
      return NextResponse.json({ error: "empty" }, { status: 502 });
    }
    return NextResponse.json({ text: cleaned });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // The real reason goes to the function logs (`vercel logs`), so a coach
    // that's off can be diagnosed instead of guessed at. The visitor only
    // ever sees "Coach isn't switched on yet".
    console.error("[coach] gateway call failed", { mode: body.mode, model: MODEL, message });
    const unavailable = UNAVAILABLE.test(message);
    return NextResponse.json(
      {
        error: unavailable ? "unavailable" : "coach_failed",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: unavailable ? 503 : 502 },
    );
  }
}
