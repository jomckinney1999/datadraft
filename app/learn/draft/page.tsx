"use client";

// Draft Day: the course-selection ceremony. Three acts —
//   1. jersey: put a name on the back of the jersey
//   2. clock:  you're on the clock, pick a track from the draft board
//   3. podium: "With the first pick of the SQLSports Draft, {name} selects…"
// The pick is stored in progress; the lesson player gates on it.

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useRouter, useSearchParams } from "next/navigation";
import { TRACKS, getTrack, type Track } from "@/lib/draft";
import { readStoredModule } from "@/lib/use-module";
import { loadProgress, setDraftPick } from "@/lib/progress";
import Coach from "@/components/coach";

type Act = "jersey" | "clock" | "podium";

function DraftDay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [act, setAct] = useState<Act>("jersey");
  const [name, setName] = useState("");
  const [pick, setPick] = useState<Track | null>(null);
  const [hasStyle, setHasStyle] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    if (p.username) setName(p.username);
    setHasStyle(!!p.playbookStyle);

    // They already chose a course on the catalog — don't make them choose
    // twice. Pre-select it so the ceremony confirms the pick instead of
    // re-asking, and skip straight to the board.
    const chosen = getTrack(readStoredModule());
    if (chosen && chosen.status === "live") {
      setPick(chosen);
      if (p.username) setAct("clock");
    }
  }, []);

  const trimmed = name.trim();

  function submitPick() {
    if (!pick || !trimmed) return;
    setDraftPick(trimmed, pick.id);
    setAct("podium");
  }

  const nextHref = hasStyle
    ? from
      ? `/learn/${from}`
      : "/learn"
    : `/learn/playbook${from ? `?from=${from}` : ""}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-16">
      <header className="flex items-center justify-between py-5">
        <Link
          href="/learn"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          SQL<span className="text-turf">Sports</span>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            draft day
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
            {act === "podium" ? "the pick is in" : "live from the war room"}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {act === "jersey" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Coach mood="happy" size={130} />
          <div className="w-full border border-panel-border bg-panel/80 p-6 shadow-scoreboard">
            <p className="label-broadcast text-gold">
              welcome to the sqlsports draft
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              What name goes on the back of the jersey?
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              Every analyst career starts on draft night. Give the commissioner
              a name — real, gamer tag, or fantasy-team legend, your call.
            </p>
            <p className="mx-auto mt-3 max-w-md font-mono text-[11px] leading-relaxed text-ink-muted">
              Never watched a snap of football? You&apos;re welcome here — the
              football is just the dataset, and Coach explains any game context
              in one sentence when it comes up.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && trimmed) setAct("clock");
              }}
              maxLength={24}
              placeholder="e.g. GridironGuru"
              autoFocus
              className="mt-5 w-full max-w-sm border border-panel-border bg-night px-4 py-3 text-center font-mono text-lg text-ink outline-none transition-colors placeholder:text-ink-muted/50 focus:border-turf"
              aria-label="Your draft name"
            />
          </div>
          <button
            type="button"
            onClick={() => setAct("clock")}
            disabled={!trimmed}
            className="w-full max-w-xs border border-turf bg-turf/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25 disabled:opacity-40"
          >
            Enter the green room
          </button>
        </div>
      )}

      {act === "clock" && (
        <div className="flex flex-1 flex-col gap-5 pt-2">
          <div className="flex items-center gap-4">
            <Coach mood="think" size={90} />
            <div>
              <p className="label-broadcast text-gold">
                pick 1.01 · {trimmed} is on the clock
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                Make your selection.
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                {TRACKS.filter((t) => t.status === "live").length} courses are
                draft-eligible today. The rest of the class is still declaring —
                they hit the board once their lessons are built.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {TRACKS.map((track, i) => {
              const draftable = track.status === "live";
              const selected = pick?.id === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  disabled={!draftable}
                  onClick={() => setPick(track)}
                  className={`border p-5 text-left transition-colors ${
                    selected
                      ? "border-turf bg-turf/10"
                      : draftable
                        ? "border-panel-border bg-panel/70 hover:border-turf/40"
                        : "border-panel-border bg-panel/40 opacity-60"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      Prospect #{i + 1}
                    </p>
                    <span
                      className={`shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        draftable
                          ? "border-turf/50 bg-turf/10 text-turf"
                          : "border-panel-border text-ink-muted"
                      }`}
                    >
                      {track.classOf}
                    </span>
                  </div>
                  <h2
                    className={`mt-1.5 font-display text-lg font-bold ${
                      selected ? "text-turf" : "text-ink"
                    }`}
                  >
                    {track.name}
                  </h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                      Scouting report ·{" "}
                    </span>
                    {track.scoutingReport}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {track.skills.map((s) => (
                      <span
                        key={s}
                        className="border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={submitPick}
            disabled={!pick}
            className="mx-auto w-full max-w-sm border border-gold bg-gold/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold/25 disabled:opacity-40"
          >
            Submit pick to the commissioner
          </button>
        </div>
      )}

      {act === "podium" && pick && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Coach mood="cheer" size={140} />
          <div className="w-full border-2 border-gold/60 bg-panel/80 p-8 shadow-scoreboard-gold">
            <p className="label-broadcast text-gold">
              the sqlsports draft · pick 1.01
            </p>
            <p className="mt-5 font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
              “With the first pick of the SQLSports Draft,{" "}
              <span className="text-turf">{trimmed}</span> selects{" "}
              <span className="text-gold">{pick.name}</span>.”
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
              — the commissioner, to a roaring green room
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {pick.skills.map((s) => (
                <span
                  key={s}
                  className="border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-soft"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <Link
            href={nextHref}
            className="w-full max-w-sm border border-turf bg-turf/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
          >
            {hasStyle ? "Take the field" : "Next · choose your playbook style"}
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Franchise player: you · No trade clause included
          </p>
        </div>
      )}
    </main>
  );
}

export default function DraftPage() {
  // useSearchParams requires a Suspense boundary during prerender
  return (
    <Suspense fallback={null}>
      <DraftDay />
    </Suspense>
  );
}
