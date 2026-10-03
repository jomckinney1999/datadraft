import type { Metadata } from "next";
import Coach, { COACH_MOODS, type CoachMood } from "@/components/coach";

/**
 * Coach Blitz's model sheet: every mood, moving, plus talking and facing
 * left. Not linked from anywhere (robots keeps crawlers out of /brand/); it
 * exists so a new mood is checked beside the others before it ships, the
 * way the question art gets a contact sheet.
 */
export const metadata: Metadata = {
  title: "Coach Blitz — model sheet",
  robots: { index: false, follow: false },
};

const WHERE: Record<CoachMood, string> = {
  idle: "Waiting on you: sandboxes, the account page",
  happy: "You played today; a friendly hello",
  cheer: "A right answer, a perfect drive",
  clap: "A right answer, a good score",
  dance: "A perfect day, the end of a replay",
  flex: "A right answer, a streak, a build",
  point: "Look over there: a tour stop, the next step",
  think: "Working a problem with you",
  clipboard: "Scouting: the Film Room, cases, the Doctor",
  surprised: "A big number, a twist",
  shrug: "Ran fine, not quite the answer",
  sad: "A turnover on downs, a lost duel round",
  facepalm: "An error before it even ran",
  angry: "Your streak's about to go",
  whistle: "Start of a drive, a briefing, a page that isn't there",
  sleep: "You haven't been by in a while",
};

export default function CoachSheet() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="label-broadcast text-turf">model sheet</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">Coach Blitz, every mood</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Sixteen moods, each a pose, a face and a motion of its own. Hover one to see him hop; move the pointer and
        his eyes follow it.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {COACH_MOODS.map((m) => (
          <div key={m} className="surface flex flex-col items-center rounded-2xl border border-panel-border bg-panel p-4">
            <Coach mood={m} size={140} />
            <p className="mt-2 font-mono text-[12px] font-bold uppercase tracking-widest text-ink">{m}</p>
            <p className="mt-1 text-center text-[12px] leading-snug text-ink-muted">{WHERE[m]}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Talking, and facing left</h2>
      <div className="mt-4 flex flex-wrap items-end gap-6">
        {(["idle", "happy", "point", "think", "clipboard", "shrug"] as CoachMood[]).map((m) => (
          <div key={m} className="flex flex-col items-center">
            <Coach mood={m} size={110} talking />
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink-muted">{m} · talking</p>
          </div>
        ))}
        {(["point", "flex"] as CoachMood[]).map((m) => (
          <div key={`${m}-left`} className="flex flex-col items-center">
            <Coach mood={m} size={110} facing="left" />
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink-muted">{m} · left</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Still (animated off)</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {COACH_MOODS.map((m) => (
          <Coach key={m} mood={m} size={64} animated={false} />
        ))}
      </div>
    </main>
  );
}
