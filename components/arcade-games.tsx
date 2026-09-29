"use client";

/**
 * The arcade — short games between drives.
 *
 * lib/arcade.ts defined Film Room Match and Speed Snap and lib/power-ups.ts
 * paid out for them, but neither game had a screen; this builds them, plus the
 * extra point.
 *
 *   Film Room Match — pair a SQL idea with the plain-English picture of it.
 *   Speed Snap      — six situation questions against a clock.
 *   Extra Point     — a timing kick for bonus XP.
 *
 * All three are free: no timeouts, no lesson order, and every one pays
 * scouting tickets through awardArcadeWin so the sideline shop stays fed.
 *
 * The boards are seeded per day (pickDailyPairs / pickDailySnaps), so everyone
 * gets the same set today and a different one tomorrow, and a refresh can't be
 * used to reroll an awkward board.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Coach from "@/components/coach";
import AppNav from "@/components/app-nav";
import {
  ARCADE_KICK_ATTEMPTS,
  ARCADE_MATCH_SIZE,
  ARCADE_SPEED_SIZE,
  TICKET_KICK_PER_MAKE,
  TICKET_KICK_PERFECT,
  TICKET_MATCH_BASE,
  TICKET_MATCH_PERFECT,
  TICKET_SPEED_BASE,
  TICKET_SPEED_PERFECT,
  pickDailyPairs,
  pickDailySnaps,
  shuffleIds,
  type MatchPair,
  type SpeedSnap,
} from "@/lib/arcade";
import { awardArcadeWin, type ArcadeKind } from "@/lib/power-ups";
import { playSfx } from "@/lib/sfx";

type GameId = "match" | "speed" | "kick";

const GAMES: { id: GameId; name: string; blurb: string; badge: string }[] = [
  {
    id: "match",
    name: "Film Room Match",
    blurb: "Pair each SQL move with what it does in plain English.",
    badge: `${ARCADE_MATCH_SIZE} pairs`,
  },
  {
    id: "speed",
    name: "Two-Minute Drill",
    blurb: "Six situations, one clock. Read it and call it.",
    badge: `${ARCADE_SPEED_SIZE} snaps`,
  },
  {
    id: "kick",
    name: "Extra Point",
    blurb: "Line up the kick and hit it clean. Pure bonus.",
    badge: `${ARCADE_KICK_ATTEMPTS} kicks`,
  },
];

type Payout = { tickets: number; dailyBonus: number; xp: number } | null;

export default function ArcadeGames() {
  const [game, setGame] = useState<GameId | null>(null);
  const [payout, setPayout] = useState<Payout>(null);

  function finish(kind: ArcadeKind, tickets: number, perfect: boolean) {
    const res = awardArcadeWin({ kind, tickets, perfect });
    setPayout({ tickets: res.tickets, dailyBonus: res.dailyBonus, xp: res.xp });
    playSfx("touchdown");
  }

  return (
    <>
      <AppNav back="/learn" backLabel="all courses" />
      <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-10 pt-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="label-broadcast text-gold">between drives</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
              The Arcade
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              Short games that cost no timeouts and pay scouting tickets. Good for
              the days you don&rsquo;t have a full drive in you.
            </p>
          </div>
          <Coach mood={payout ? "cheer" : "idle"} size={78} className="hidden sm:block" />
        </header>

        {payout && (
          <div className="surface mt-6 rounded-2xl border-2 border-turf/50 bg-turf/10 p-4">
            <p className="font-display text-lg font-bold text-turf">
              +{payout.tickets} tickets · +{payout.xp} XP
            </p>
            {payout.dailyBonus > 0 && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-gold">
                includes +{payout.dailyBonus} first-arcade-of-the-day bonus
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setPayout(null);
                setGame(null);
              }}
              className="press mt-3 rounded-full border border-turf/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf"
            >
              Back to the arcade
            </button>
          </div>
        )}

        {!game && !payout && (
          <div className="mt-8 space-y-3">
            {GAMES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGame(g.id)}
                className="lift surface block w-full rounded-2xl border border-panel-border bg-panel p-4 text-left transition-colors hover:border-turf/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold text-ink">
                    {g.name}
                  </h2>
                  <span className="shrink-0 rounded-full border border-panel-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    {g.badge}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{g.blurb}</p>
              </button>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-ink-muted">
              Want the language-by-language version instead?{" "}
              <Link href="/learn/rapid" className="text-turf hover:underline">
                Rapid Fire
              </Link>{" "}
              pulls real drills from the courses.
            </p>
          </div>
        )}

        {game === "match" && !payout && (
          <FilmRoomMatch onDone={(t, p) => finish("match", t, p)} />
        )}
        {game === "speed" && !payout && (
          <TwoMinuteDrill onDone={(t, p) => finish("speed", t, p)} />
        )}
        {game === "kick" && !payout && (
          <ExtraPoint onDone={(t, p) => finish("kick", t, p)} />
        )}
      </main>
    </>
  );
}

/* ── Film Room Match ──────────────────────────────────────── */

function FilmRoomMatch({
  onDone,
}: {
  onDone: (tickets: number, perfect: boolean) => void;
}) {
  const [pairs] = useState<MatchPair[]>(() => pickDailyPairs());
  const [filmOrder] = useState<string[]>(() =>
    shuffleIds(
      pickDailyPairs().map((p) => p.id),
      0x51,
    ),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  const byId = new Map(pairs.map((p) => [p.id, p]));

  function tapFilm(id: string) {
    if (!picked || solved.includes(id)) return;
    if (picked === id) {
      const next = [...solved, id];
      setSolved(next);
      setPicked(null);
      playSfx("correct");
      if (next.length === pairs.length) {
        const perfect = wrong === null;
        onDone(TICKET_MATCH_BASE + (perfect ? TICKET_MATCH_PERFECT : 0), perfect);
      }
      return;
    }
    setWrong(id);
    playSfx("miss");
    window.setTimeout(() => setWrong(null), 450);
  }

  return (
    <section className="mt-8">
      <p className="text-sm text-ink-soft">
        Tap a SQL move, then the picture that matches it.{" "}
        <span className="text-ink-muted">
          {solved.length}/{pairs.length} paired
        </span>
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p) => {
            const done = solved.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={done}
                onClick={() => setPicked(p.id)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left font-mono text-[12px] transition-colors ${
                  done
                    ? "border-turf/40 bg-turf/10 text-turf/60"
                    : picked === p.id
                      ? "border-ice bg-ice/15 text-ice"
                      : "border-panel-border bg-panel text-ink hover:border-ice/50"
                }`}
              >
                {p.sql}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {filmOrder.map((id) => {
            const p = byId.get(id);
            if (!p) return null;
            const done = solved.includes(id);
            return (
              <button
                key={id}
                type="button"
                disabled={done}
                onClick={() => tapFilm(id)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-[13px] leading-snug transition-colors ${
                  done
                    ? "border-turf/40 bg-turf/10 text-turf/60"
                    : wrong === id
                      ? "animate-shake border-gold bg-gold/10 text-gold"
                      : "border-panel-border bg-panel text-ink-soft hover:border-turf/50"
                }`}
              >
                {p.film}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Two-Minute Drill ─────────────────────────────────────── */

const DRILL_SECONDS = 120;

function TwoMinuteDrill({
  onDone,
}: {
  onDone: (tickets: number, perfect: boolean) => void;
}) {
  const [snaps] = useState<SpeedSnap[]>(() => pickDailySnaps());
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [left, setLeft] = useState(DRILL_SECONDS);
  const done = idx >= snaps.length || left <= 0;

  // One clock for the whole drill, like the real thing.
  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [done]);

  const settle = useCallback(() => {
    const perfect = right === snaps.length;
    onDone(TICKET_SPEED_BASE + (perfect ? TICKET_SPEED_PERFECT : 0), perfect);
  }, [onDone, right, snaps.length]);

  useEffect(() => {
    if (done) settle();
  }, [done, settle]);

  if (done) return null;

  const snap = snaps[idx];
  const mins = Math.floor(left / 60);
  const secs = String(left % 60).padStart(2, "0");

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === snap.answer;
    if (ok) setRight((r) => r + 1);
    playSfx(ok ? "correct" : "miss");
    window.setTimeout(() => {
      setPicked(null);
      setIdx((n) => n + 1);
    }, 1100);
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          Snap {idx + 1}/{snaps.length}
        </span>
        <span
          className={`font-mono text-lg font-bold tabular-nums ${
            left <= 20 ? "animate-heat-pulse text-gold" : "text-ink"
          }`}
        >
          {mins}:{secs}
        </span>
      </div>

      <h2 className="mt-3 font-display text-xl font-bold leading-snug text-ink">
        {snap.prompt}
      </h2>

      <div className="mt-4 grid gap-2.5">
        {snap.choices.map((c, i) => {
          const state =
            picked === null
              ? "idle"
              : i === snap.answer
                ? "right"
                : i === picked
                  ? "wrong"
                  : "idle";
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className={`rounded-xl border px-3 py-2.5 text-left text-[14px] transition-colors ${
                state === "right"
                  ? "border-turf bg-turf/15 text-turf"
                  : state === "wrong"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-panel-border bg-panel text-ink hover:border-turf/50"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className="animate-fade-up mt-3 text-sm leading-relaxed text-ink-soft">
          {snap.explain}
        </p>
      )}
    </section>
  );
}

/* ── Extra Point ──────────────────────────────────────────── */

/** Half-width of the good zone, as a fraction of the meter. */
const GOOD = 0.12;

function ExtraPoint({
  onDone,
}: {
  onDone: (tickets: number, perfect: boolean) => void;
}) {
  const [kicks, setKicks] = useState<("good" | "left" | "right")[]>([]);
  const [aim, setAim] = useState(0.5);
  const [live, setLive] = useState(true);
  const raf = useRef<number | null>(null);
  const dir = useRef(1);
  const pos = useRef(0.5);

  // The sweeping marker is the game, not decoration, so it keeps moving under
  // prefers-reduced-motion — there would be nothing to play otherwise. The
  // ball's flight afterwards is decoration, and that does stop.
  useEffect(() => {
    if (!live) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      pos.current += dir.current * dt * 0.0013;
      if (pos.current >= 1) {
        pos.current = 1;
        dir.current = -1;
      }
      if (pos.current <= 0) {
        pos.current = 0;
        dir.current = 1;
      }
      setAim(pos.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [live]);

  function kick() {
    if (!live) return;
    const off = pos.current - 0.5;
    const result: "good" | "left" | "right" =
      Math.abs(off) <= GOOD ? "good" : off < 0 ? "left" : "right";
    const next = [...kicks, result];
    setKicks(next);
    setLive(false);
    playSfx(result === "good" ? "first_down" : "miss");

    window.setTimeout(() => {
      if (next.length >= ARCADE_KICK_ATTEMPTS) {
        const makes = next.filter((k) => k === "good").length;
        const perfect = makes === ARCADE_KICK_ATTEMPTS;
        onDone(
          makes * TICKET_KICK_PER_MAKE + (perfect ? TICKET_KICK_PERFECT : 0),
          perfect,
        );
      } else {
        setLive(true);
      }
    }, 1200);
  }

  const last = kicks[kicks.length - 1];

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          Kick {Math.min(kicks.length + 1, ARCADE_KICK_ATTEMPTS)}/
          {ARCADE_KICK_ATTEMPTS}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-turf">
          {kicks.filter((k) => k === "good").length} good
        </span>
      </div>

      {/* Uprights. The ball sits on the tee and flies on a made kick. */}
      <div className="surface mt-4 overflow-hidden rounded-2xl border border-panel-border bg-panel p-5">
        <svg viewBox="0 0 240 150" className="mx-auto h-44 w-full" role="img" aria-label="Goalposts">
          <rect x="0" y="126" width="240" height="24" fill="rgb(var(--c-turf) / 0.16)" />
          <path d="M20 132 H220" stroke="rgb(255 255 255 / 0.3)" strokeWidth="2" />
          <g stroke="#FFC800" strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M120 126 V78" />
            <path d="M84 78 H156" />
            <path d="M84 78 V26" />
            <path d="M156 78 V26" />
          </g>
          <g
            style={{
              transform:
                last === undefined || live
                  ? "translate(0px, 0px)"
                  : last === "good"
                    ? "translate(0px, -70px)"
                    : `translate(${last === "left" ? -62 : 62}px, -54px)`,
              transition: last && !live ? "transform 0.9s cubic-bezier(0.2,0.7,0.4,1)" : "none",
            }}
          >
            <ellipse cx="120" cy="120" rx="9" ry="6" fill="#C0652B" transform="rotate(-20 120 120)" />
            <path d="M116 120 H124" stroke="#FFF6EA" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </svg>

        {/* Aim meter */}
        <div className="relative mt-3 h-6 overflow-hidden rounded-full border border-panel-border bg-night">
          <div
            className="absolute inset-y-0 bg-turf/20"
            style={{ left: `${(0.5 - GOOD) * 100}%`, width: `${GOOD * 200}%` }}
          />
          <div
            className="absolute inset-y-1 w-1.5 rounded-full bg-gold"
            style={{ left: `calc(${aim * 100}% - 3px)` }}
          />
        </div>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          hit it inside the green
        </p>

        <button
          type="button"
          onClick={kick}
          disabled={!live}
          className="press btn-turf mt-4 w-full rounded-full px-4 py-3 font-display text-base font-bold text-night disabled:opacity-60"
        >
          {live ? "Kick" : last === "good" ? "It's good!" : `Wide ${last}`}
        </button>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {Array.from({ length: ARCADE_KICK_ATTEMPTS }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              kicks[i] === "good"
                ? "bg-turf"
                : kicks[i]
                  ? "bg-gold/60"
                  : "bg-panel-border"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
