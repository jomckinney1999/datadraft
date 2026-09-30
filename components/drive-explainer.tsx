/**
 * A lesson is a drive — explained with the real field, not a diagram of it.
 *
 * This renders the same `DriveField` the lesson player uses, frozen at a
 * moment that tells the story on its own: 2nd & 4 on the 58, a +13 burst
 * still on screen from the last correct answer. The chains are ahead of the
 * ball, the end zone is in reach, nothing has been burned. That is what a
 * good drive looks like, and it is ours — no other site has this mechanic.
 *
 * The state is a literal, not a simulation, so it is identical on every
 * render and the server and client agree. `DriveField` itself is a client
 * component, but every prop here is plain data, so a server page can hand
 * it across without becoming a client page.
 */

import Link from "next/link";
import DriveField from "@/components/drive-field";
import Coach from "@/components/coach";
import type { DriveState } from "@/lib/drive-sim";

const MOMENT: DriveState = {
  down: 2,
  distance: 4,
  ballOn: 58,
  firstDownAt: 62,
  status: "live",
  lastPlay: { kind: "gain", yards: 13, call: "Play-action deep cross" },
  downsBurned: 0,
};

const BEATS = [
  {
    title: "Downs replace hearts",
    body: "Kick off first-and-ten on your own 25. Every question is a play. The scoreboard is the progress bar, and it reads like one you already understand.",
    tone: "turf" as const,
  },
  {
    title: "Right answer, real yards",
    body: "A correct SQL, Python or Excel drill moves the chains 13 yards. Multiple choice moves six. String answers together and the combo pays extra.",
    tone: "gold" as const,
  },
  {
    title: "Miss, and you burn a down",
    body: "Four misses on one set of downs is a turnover. A syntax slip costs nothing — you see the fix and go again. Clear the drive with zero downs burned and it counts as perfect.",
    tone: "ice" as const,
  },
];

const TONE: Record<string, string> = {
  turf: "text-turf",
  gold: "text-gold",
  ice: "text-ice",
};

export default function DriveExplainer() {
  return (
    <section
      data-reveal-section
      className="wash-turf border-b border-panel-border"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sequence text-center">
          <p className="reveal label-broadcast text-turf">how a lesson works</p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            Every lesson is a drive
          </h2>
          <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            No hearts, no lives, no red X. You are moving a football down a
            field, and the field tells you exactly how it is going.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-5">
          <div className="reveal lg:col-span-3">
            <div className="surface screen-frame rounded-2xl border border-panel-border bg-panel p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  SQL Fundamentals · Lesson 4
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-turf">
                  perfect drive so far
                </span>
              </div>
              <DriveField
                drive={MOMENT}
                heat="Hot hand · 3 in a row"
                burst={{ id: 1, label: "+13 YDS", explosive: true, kind: "gain" }}
              />
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-turf/30 bg-turf/5 p-3">
                <Coach mood="cheer" size={44} className="shrink-0" />
                <p className="text-sm leading-relaxed text-ink-soft">
                  <span className="font-display font-bold text-turf">
                    Chains are moving.
                  </span>{" "}
                  Second and four on the 58. One more clean answer and
                  you&apos;re in a fresh set of downs with the end zone in
                  sight.
                </p>
              </div>
            </div>
          </div>

          <ol className="sequence space-y-6 lg:col-span-2">
            {BEATS.map((b, i) => (
              <li key={b.title} className="reveal flex gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-panel-border bg-panel font-mono text-[12px] font-bold ${TONE[b.tone]}`}
                >
                  {i + 1}
                </span>
                <div>
                  <p className={`font-display text-lg font-bold ${TONE[b.tone]}`}>
                    {b.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {b.body}
                  </p>
                </div>
              </li>
            ))}
            <li className="reveal pl-13">
              <Link
                href="/learn/track/sql-fundamentals"
                className="font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:underline"
              >
                Take the first snap →
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
