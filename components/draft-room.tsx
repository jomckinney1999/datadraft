"use client";

/**
 * The Draft Room: draft a real fantasy season with SQL as your scouting
 * department, then watch it play out with the points that actually happened.
 *
 *   setup    pick a season and a draft slot (or arrive on a friend's link)
 *   draft    12 rounds against seven bots on real Sleeper ADP; the scouting
 *            desk is SQL over the three seasons before, and any result row
 *            with a player in it has a Draft button
 *   season   14 weeks, then semis and a final, week by week
 *   results  your finish, the same draft with the autodraft in your seat,
 *            your best and worst picks, and a link that hands a friend the
 *            same slot and the same bots
 *
 * The engine is lib/draft-sim.ts and the database lib/draft-scout.ts; this
 * file is screens. Progress is saved per browser (`sqlsports.draft.v1`), so a
 * reload resumes the draft where it was.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Database, QueryExecResult, SqlJsStatic } from "sql.js";
import CodeEditor from "@/components/code-editor";
import ChartIt from "@/components/chart-it";
import PassOffer from "@/components/pass-offer";
import { usePass } from "@/lib/use-pass";
import Headshot from "@/components/headshot";
import { NFLVERSE_CREDIT } from "@/lib/chart";
import { shareText } from "@/lib/daily-share";
import { DRAFT_SEASONS } from "@/lib/draft-seasons.generated";
import { SITE_URL } from "@/lib/site";
import {
  FINAL_WEEK,
  FINISH_LABEL,
  REG_WEEKS,
  ROUNDS,
  SEMIS_WEEK,
  TEAMS,
  TOTAL_PICKS,
  autodraftBaseline,
  autodraftRest,
  bestLineup,
  byId,
  choosePick,
  encodeResult,
  makeLeague,
  newSeed,
  pickLabel,
  pickProblem,
  picksOf,
  reviewPicks,
  rosters,
  runBots,
  seasonPoints,
  simulateSeason,
  standingsFrom,
  summarize,
  teamForPick,
  type DraftData,
  type DraftPlayer,
  type DraftResultCode,
  type Finish,
  type Game,
  type League,
  type Pos,
} from "@/lib/draft-sim";
import { addResults, blankQuery, resultsQuery, scoutPresets, seedScouting, syncPicks } from "@/lib/draft-scout";

type Phase = "setup" | "draft" | "season" | "results";
type Saved = { v: 1; season: number; seed: string; slot: number; picks: string[]; phase: Phase; week: number };
type HistoryRow = { season: number; seed: string; w: number; l: number; pf: number; finish: Finish; at: string };

const SAVE_KEY = "sqlsports.draft.v1";
const HISTORY_KEY = "sqlsports.draft.history.v1";
const BOT_DELAY = 260;
const WEEK_DELAY = 900;

const dataCache = new Map<number, Promise<DraftData>>();
function loadData(season: number): Promise<DraftData> {
  if (!dataCache.has(season)) {
    dataCache.set(
      season,
      fetch(`/draft/${season}.json`).then((r) => {
        if (!r.ok) throw new Error(`Couldn't load the ${season} draft board (${r.status}).`);
        return r.json() as Promise<DraftData>;
      }),
    );
  }
  return dataCache.get(season)!;
}
let sqlPromise: Promise<SqlJsStatic> | null = null;
function loadSql(): Promise<SqlJsStatic> {
  sqlPromise ??= import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" }));
  return sqlPromise;
}

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode: the draft still works, it just won't survive a reload.
  }
}

const POS_CLASS: Record<Pos, string> = {
  QB: "border-gold/50 bg-gold/10 text-gold",
  RB: "border-turf/50 bg-turf/10 text-turf",
  WR: "border-ice/50 bg-ice/10 text-ice",
  TE: "border-ink-soft/40 bg-ink-soft/10 text-ink-soft",
};
function PosChip({ pos }: { pos: Pos | string }) {
  return (
    <span
      className={`inline-flex w-8 shrink-0 justify-center rounded border px-1 py-px font-mono text-[10px] font-bold ${
        POS_CLASS[pos as Pos] ?? "border-panel-border text-ink-muted"
      }`}
    >
      {pos}
    </span>
  );
}

const CARD = "surface rounded-2xl border border-panel-border bg-panel";
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });

// ─────────────────────────────────────────────────────────────────────
export default function DraftRoom({ challenge }: { challenge: DraftResultCode | null }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const seasons = DRAFT_SEASONS.map((s) => s.season);
  const [season, setSeason] = useState<number>(
    challenge && seasons.includes(challenge.season) ? challenge.season : seasons[0],
  );
  const [slotChoice, setSlotChoice] = useState<number | "random">(challenge ? challenge.slot : "random");
  const [league, setLeague] = useState<League | null>(null);
  const [data, setData] = useState<DraftData | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [week, setWeek] = useState(0);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<Database | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  // A saved draft is offered, never resumed behind your back — and never
  // when you arrived on a friend's challenge.
  useEffect(() => {
    const s = readJson<Saved>(SAVE_KEY);
    if (s && s.v === 1 && s.phase !== "setup" && seasons.includes(s.season)) setSaved(s);
    setHistory(readJson<HistoryRow[]>(HISTORY_KEY) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start(seasonArg: number, seed: string, slot: number, from?: Saved) {
    setError(null);
    setLoading(`Loading the ${seasonArg} draft board…`);
    try {
      const [d, SQL] = await Promise.all([loadData(seasonArg), loadSql()]);
      const next = new SQL.Database();
      seedScouting(next, d);
      const lg = makeLeague(seasonArg, seed, slot);
      const p = from?.picks ?? [];
      syncPicks(next, d, lg, p);
      if (from && (from.phase === "results" || from.week > 0)) addResults(next, d);
      db?.close();
      setDb(next);
      setData(d);
      setLeague(lg);
      setPicks(p);
      setWeek(from?.week ?? 0);
      setPhase(from?.phase ?? "draft");
      setSaved(null);
      topRef.current?.scrollIntoView({ block: "start" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  }

  function begin() {
    const seed = challenge && challenge.season === season ? challenge.seed : newSeed();
    const slot =
      slotChoice === "random"
        ? Math.floor((parseInt(seed, 36) || 0) % TEAMS)
        : slotChoice;
    start(season, seed, slot);
  }

  function restart() {
    writeJson(SAVE_KEY, null);
    db?.close();
    setDb(null);
    setLeague(null);
    setData(null);
    setPicks([]);
    setWeek(0);
    setPhase("setup");
  }

  // Save every step, so a reload lands you back at the same pick.
  useEffect(() => {
    if (!league || phase === "setup") return;
    writeJson(SAVE_KEY, { v: 1, season: league.season, seed: league.seed, slot: league.slot, picks, phase, week } satisfies Saved);
  }, [league, picks, phase, week]);

  // The bots pick on their own, one at a time, so you can watch the board move.
  useEffect(() => {
    if (phase !== "draft" || !league || !data) return;
    if (picks.length >= TOTAL_PICKS) {
      setPhase("season");
      setWeek(0);
      return;
    }
    if (teamForPick(picks.length) === league.slot) return;
    const t = setTimeout(() => {
      setPicks((p) => (p.length === picks.length ? [...p, choosePick(league, data, p, "bot")] : p));
    }, BOT_DELAY);
    return () => clearTimeout(t);
  }, [phase, league, data, picks]);

  const result = useMemo(
    () => (league && data && picks.length === TOTAL_PICKS ? simulateSeason(league, data, picks) : null),
    [league, data, picks],
  );

  // Record a finished season once.
  useEffect(() => {
    if (phase !== "results" || !result || !league) return;
    const s = summarize(result, league.slot);
    const rows = readJson<HistoryRow[]>(HISTORY_KEY) ?? [];
    if (!rows.some((r) => r.seed === league.seed && r.season === league.season)) {
      const next = [
        { season: league.season, seed: league.seed, w: s.w, l: s.l, pf: s.pf, finish: s.finish, at: new Date().toISOString().slice(0, 10) },
        ...rows,
      ].slice(0, 30);
      writeJson(HISTORY_KEY, next);
      setHistory(next);
    }
  }, [phase, result, league]);

  return (
    <div ref={topRef} className="scroll-mt-20">
      {phase === "setup" && (
        <Setup
          seasons={seasons}
          season={season}
          setSeason={setSeason}
          slotChoice={slotChoice}
          setSlotChoice={setSlotChoice}
          onStart={begin}
          loading={loading}
          error={error}
          saved={saved}
          onResume={() => saved && start(saved.season, saved.seed, saved.slot, saved)}
          onDiscard={() => {
            writeJson(SAVE_KEY, null);
            setSaved(null);
          }}
          challenge={challenge}
          history={history}
        />
      )}

      {phase === "draft" && league && data && db && (
        <DraftScreen
          league={league}
          data={data}
          db={db}
          picks={picks}
          onPick={(id) => setPicks((p) => [...p, id])}
          onSkip={() => setPicks((p) => runBots(league, data, p))}
          onAuto={() => setPicks((p) => autodraftRest(league, data, p))}
          onRestart={restart}
        />
      )}

      {phase === "season" && league && data && result && (
        <SeasonScreen
          league={league}
          data={data}
          picks={picks}
          result={result}
          week={week}
          setWeek={setWeek}
          onDone={() => {
            if (db) addResults(db, data);
            setPhase("results");
            topRef.current?.scrollIntoView({ block: "start" });
          }}
        />
      )}

      {phase === "results" && league && data && result && db && (
        <ResultsScreen
          league={league}
          data={data}
          db={db}
          picks={picks}
          result={result}
          onAgain={() => start(league.season, newSeed(), league.slot)}
          onRestart={restart}
        />
      )}
    </div>
  );
}

// ── Setup ─────────────────────────────────────────────────────────────
function Setup(props: {
  seasons: number[];
  season: number;
  setSeason: (s: number) => void;
  slotChoice: number | "random";
  setSlotChoice: (s: number | "random") => void;
  onStart: () => void;
  loading: string | null;
  error: string | null;
  saved: Saved | null;
  onResume: () => void;
  onDiscard: () => void;
  challenge: DraftResultCode | null;
  history: HistoryRow[];
}) {
  const { season, challenge } = props;
  const meta = DRAFT_SEASONS.find((s) => s.season === season)!;
  const lockedToChallenge = challenge !== null && challenge.season === season;
  // The newest season is free; older ones are the Season Pass, except the
  // season a friend's challenge is in, which always opens.
  const pass = usePass();
  const isPast = (s: number) => s !== props.seasons[0];
  const needsPass = pass === false && isPast(season) && !lockedToChallenge;
  const best = props.history
    .filter((h) => h.season === season)
    .sort((a, b) => b.w - a.w || b.pf - a.pf)[0];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="label-broadcast text-gold">the draft room</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
          Draft a real season.
          <br />
          <span className="text-turf">Scout it with SQL.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          Eight teams, twelve rounds, real Sleeper ADP. You can see every game up to {season - 1}; the
          bots just read ADP. Then the {season} season plays out week by week, with the points that
          actually happened.
        </p>
      </div>

      {challenge && (
        <div className="mt-6 rounded-2xl border border-gold/50 bg-gold/10 p-4 text-center">
          <p className="font-display text-lg font-bold text-ink">
            A friend went {challenge.w}–{challenge.l} drafting from slot {challenge.slot + 1} in {challenge.season}
            {challenge.finish === "C" ? " and won the league 🏆" : ""}.
          </p>
          <p className="mt-1 text-sm text-ink-soft">Same slot, same bots. Your turn.</p>
        </div>
      )}

      {props.saved && (
        <div className={`${CARD} mt-6 flex flex-wrap items-center justify-between gap-3 p-4`}>
          <div>
            <p className="font-display text-base font-bold text-ink">Your {props.saved.season} draft is still open</p>
            <p className="text-xs text-ink-muted">
              {props.saved.phase === "draft"
                ? `Pick ${pickLabel(props.saved.picks.length)} of ${ROUNDS} rounds`
                : props.saved.phase === "season"
                  ? `Week ${Math.max(1, props.saved.week)} of the season`
                  : "Season finished"}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={props.onDiscard} className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink">
              Start over
            </button>
            <button type="button" onClick={props.onResume} className="press btn-turf">
              Resume →
            </button>
          </div>
        </div>
      )}

      <div className={`${CARD} mt-6 p-5 sm:p-6`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="label-broadcast">season</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {props.seasons.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => props.setSeason(s)}
                  className={`rounded-xl border px-4 py-2 font-display text-lg font-bold transition-colors ${
                    s === season ? "border-turf bg-turf/15 text-turf" : "border-panel-border text-ink-soft hover:border-turf/50"
                  }`}
                >
                  {s}
                  {pass === false && isPast(s) && !(challenge && challenge.season === s) ? (
                    <span className="ml-1 text-sm text-gold" aria-label="Season Pass">★</span>
                  ) : null}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Scouting: {meta.scoutSeasons[0]}–{meta.scoutSeasons[meta.scoutSeasons.length - 1]} ·{" "}
              {meta.players} players · {fmt(meta.scoutGames)} games
            </p>
          </div>
          <div>
            <p className="label-broadcast">your draft slot</p>
            <div className="mt-2 grid grid-cols-8 gap-1">
              <button
                type="button"
                disabled={lockedToChallenge}
                onClick={() => props.setSlotChoice("random")}
                className={`col-span-8 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40 ${
                  props.slotChoice === "random" ? "border-gold bg-gold/15 text-gold" : "border-panel-border text-ink-soft hover:border-gold/50"
                }`}
              >
                Random
              </button>
              {Array.from({ length: TEAMS }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={lockedToChallenge && challenge?.slot !== i}
                  onClick={() => props.setSlotChoice(i)}
                  className={`h-9 rounded-lg border font-mono text-[12px] font-bold transition-colors disabled:opacity-40 ${
                    props.slotChoice === i ? "border-gold bg-gold/15 text-gold" : "border-panel-border text-ink-soft hover:border-gold/50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-muted">Snake draft: whoever picks last in a round picks first in the next.</p>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 border-t border-panel-border pt-5 text-sm text-ink-soft sm:grid-cols-2">
          <Rule icon="🏈">
            <strong className="text-ink">Best ball, PPR.</strong> Every week your best lineup is set for you: QB, 2 RB,
            3 WR, TE and a FLEX. The draft is the whole game.
          </Rule>
          <Rule icon="🗄️">
            <strong className="text-ink">Your scouting desk is SQL</strong> over three seasons of real games. Nothing from{" "}
            {season} until the season&apos;s over.
          </Rule>
          <Rule icon="🤖">
            <strong className="text-ink">Seven bots draft off ADP,</strong> each with a lean: one loves running backs,
            one takes a quarterback early.
          </Rule>
          <Rule icon="📈">
            <strong className="text-ink">Then the verdict:</strong> the same draft with the autodraft in your seat. Was
            your scouting worth anything?
          </Rule>
        </ul>

        <div className="mt-6 flex flex-col items-center gap-2">
          {needsPass ? (
            <PassOffer moment="draft-season" className="w-full max-w-md" />
          ) : (
            <button type="button" onClick={props.onStart} disabled={!!props.loading} className="press btn-gold px-8 py-3 text-base disabled:opacity-60">
              {props.loading ? props.loading : challenge && lockedToChallenge ? "Take the challenge →" : `Start the ${season} draft →`}
            </button>
          )}
          <p className="font-mono text-[10px] text-ink-muted">
            Loads about {Math.round(meta.kb / 4)} KB · runs in your browser · no account
          </p>
          {props.error && <p className="font-mono text-[11px] text-gold">⚠ {props.error}</p>}
        </div>
      </div>

      {best && (
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          Your best {season} draft: {best.w}–{best.l}
          {best.finish === "C" ? " · champion 🏆" : ""} · {props.history.length} drafted
        </p>
      )}

      <p className="mt-6 text-center text-[11px] text-ink-muted">
        ADP: Sleeper, real {season} PPR drafts. Stats and points: nflverse-data (CC BY 4.0). The bots and the league
        are ours.
      </p>
    </div>
  );
}

function Rule({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-lg leading-6" aria-hidden>
        {icon}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

// ── Draft ─────────────────────────────────────────────────────────────
type Tab = "scout" | "board" | "team" | "log";

function DraftScreen({
  league,
  data,
  db,
  picks,
  onPick,
  onSkip,
  onAuto,
  onRestart,
}: {
  league: League;
  data: DraftData;
  db: Database;
  picks: string[];
  onPick: (id: string) => void;
  onSkip: () => void;
  onAuto: () => void;
  onRestart: () => void;
}) {
  const players = useMemo(() => byId(data), [data]);
  const [tab, setTab] = useState<Tab>("scout");
  const [notice, setNotice] = useState<string | null>(null);
  const onClock = picks.length < TOTAL_PICKS ? teamForPick(picks.length) : -1;
  const mine = onClock === league.slot;
  const myPicks = picksOf(league.slot);
  const nextMine = myPicks.find((k) => k >= picks.length);
  const lastId = picks[picks.length - 1];
  const last = lastId ? players.get(lastId) : null;

  function draft(id: string) {
    const problem = pickProblem(league, data, picks, id);
    if (problem) {
      setNotice(problem);
      return;
    }
    setNotice(null);
    onPick(id);
  }

  const panel = (t: Tab) => (tab === t ? "" : "hidden lg:block");

  return (
    <div>
      {/* On the clock */}
      <div className={`${CARD} z-20 p-3 sm:p-4 lg:sticky lg:top-16 ${mine ? "border-gold/70" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {league.season} draft · round {Math.min(ROUNDS, Math.floor(picks.length / TEAMS) + 1)} of {ROUNDS} · pick{" "}
              {pickLabel(Math.min(picks.length, TOTAL_PICKS - 1))}
            </p>
            {mine ? (
              <p className="mt-0.5 font-display text-xl font-bold text-gold">
                <span className="draft-clock mr-2 inline-block h-2.5 w-2.5 rounded-full bg-gold align-middle" aria-hidden />
                You&apos;re on the clock
              </p>
            ) : (
              <p className="mt-0.5 font-display text-lg font-bold text-ink">
                {league.managers[onClock]?.name} {onClock >= 0 ? "are picking…" : ""}
              </p>
            )}
            {last && (
              <p className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                <Headshot name={last.name} src={last.headshot} size={20} />
                <span className="truncate">
                  {pickLabel(picks.length - 1)} · {league.managers[teamForPick(picks.length - 1)].name} took{" "}
                  <strong className="text-ink">{last.name}</strong> ({last.pos}, {last.team})
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!mine && nextMine !== undefined && (
              <button type="button" onClick={onSkip} className="press btn-turf">
                Skip to my pick ({nextMine - picks.length} away)
              </button>
            )}
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-lg border border-panel-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink">
                More
              </summary>
              <div className={`${CARD} absolute right-0 z-30 mt-2 w-56 p-2`}>
                <button type="button" onClick={onAuto} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-panel-hover">
                  Autodraft my remaining picks
                </button>
                <button type="button" onClick={onRestart} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-panel-hover">
                  Quit this draft
                </button>
              </div>
            </details>
          </div>
        </div>
        <PickTicker league={league} picks={picks} />
        {notice && <p className="mt-2 font-mono text-[11px] text-gold">⚠ {notice}</p>}
      </div>

      {/* Phone tabs; on a laptop everything is on screen at once. */}
      <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl border border-panel-border bg-night/60 p-1 lg:hidden">
        {(["scout", "board", "team", "log"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg py-2 font-mono text-[11px] font-bold uppercase tracking-wider ${
              tab === t ? "bg-panel text-gold" : "text-ink-muted"
            }`}
          >
            {t === "scout" ? "Scout" : t === "board" ? "Board" : t === "team" ? "My team" : "Picks"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className={panel("scout")}>
          <ScoutPanel db={db} data={data} league={league} picks={picks} canPick={mine} onDraft={draft} mode="draft" />
        </div>
        <div className="space-y-4">
          <div className={panel("board")}>
            <BigBoard data={data} picks={picks} canPick={mine} onDraft={draft} />
          </div>
          <div className={panel("team")}>
            <TeamCard data={data} roster={rosters(picks)[league.slot]} />
          </div>
          <div className={panel("log")}>
            <PickLog league={league} data={data} picks={picks} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PickTicker({ league, picks }: { league: League; picks: string[] }) {
  const upcoming = Array.from({ length: 10 }, (_, i) => picks.length + i).filter((k) => k < TOTAL_PICKS);
  if (!upcoming.length) return null;
  return (
    <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" aria-label="Upcoming picks">
      {upcoming.map((k, i) => {
        const t = teamForPick(k);
        const you = t === league.slot;
        return (
          <span
            key={k}
            className={`shrink-0 rounded-lg border px-2 py-1 font-mono text-[10px] ${
              you ? "border-gold bg-gold/15 font-bold text-gold" : i === 0 ? "border-ink-soft/50 text-ink" : "border-panel-border text-ink-muted"
            }`}
          >
            {pickLabel(k)} {you ? "YOU" : league.managers[t].name}
          </span>
        );
      })}
    </div>
  );
}

// ── Scouting desk ─────────────────────────────────────────────────────
function ScoutPanel({
  db,
  data,
  league,
  picks,
  canPick,
  onDraft,
  mode,
}: {
  db: Database;
  data: DraftData;
  league: League;
  picks: string[];
  canPick: boolean;
  onDraft?: (id: string) => void;
  mode: "draft" | "results";
}) {
  const presets = useMemo(() => (mode === "draft" ? scoutPresets(data) : []), [data, mode]);
  const [sql, setSql] = useState(() => (mode === "draft" ? presets[0].sql : resultsQuery(data)));
  const [ran, setRan] = useState<string | null>(null);
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const taken = useMemo(() => new Set(picks), [picks]);
  const nameToId = useMemo(() => {
    const m = new Map<string, string | null>();
    data.board.forEach((p) => m.set(p.name, m.has(p.name) ? null : p.id));
    return m;
  }, [data]);

  function run(q: string) {
    setErr(null);
    setRan(q);
    try {
      const res = db.exec(q);
      setResult(res[res.length - 1] ?? { columns: [], values: [] });
    } catch (e) {
      setResult(null);
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  // Bring draft_picks up to date, then re-run whatever last ran, so
  // `available` never shows someone who's gone. Done here rather than in the
  // parent because a child's effects run first: syncing up there re-ran the
  // query against the draft as it stood one pick ago.
  useEffect(() => {
    syncPicks(db, data, league, picks);
    run(ran ?? sql);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks.length]);

  const idCol = result ? result.columns.indexOf("player_id") : -1;
  const nameCol = result ? result.columns.indexOf("player") : -1;
  const rowId = (row: unknown[]): string | null => {
    if (idCol >= 0) return String(row[idCol]);
    if (nameCol >= 0) return nameToId.get(String(row[nameCol])) ?? null;
    return null;
  };
  const hasPlayers = idCol >= 0 || nameCol >= 0;

  return (
    <section className={`${CARD} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="label-broadcast text-turf">{mode === "draft" ? "scouting desk" : `the ${data.season} season, unlocked`}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {mode === "draft"
              ? `SQL over ${data.scoutSeasons[0]}–${data.season - 1}. Any row with a player in it can be drafted from here.`
              : `Query \`results\`: every player's real ${data.season} weeks. Who should you have taken?`}
          </p>
        </div>
      </div>

      {mode === "draft" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSql(p.sql);
                run(p.sql);
              }}
              className={`rounded-lg border px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                ran === p.sql ? "border-turf bg-turf/15 text-turf" : "border-panel-border text-ink-soft hover:border-turf/50"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSql(blankQuery(data))}
            className="rounded-lg border border-dashed border-panel-border px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink"
          >
            Write your own
          </button>
        </div>
      )}

      <div
        className="mt-3 overflow-hidden rounded-xl border border-panel-border"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            run(sql);
          }
        }}
      >
        <CodeEditor value={sql} onChange={setSql} lang="sql" rows={9} ariaLabel="Scouting SQL" textSize="text-[12.5px] leading-relaxed" />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-ink-muted">
          Tables: <span className="text-ink-soft">players</span> · <span className="text-ink-soft">weekly</span> ·{" "}
          <span className="text-ink-soft">draft_picks</span> · <span className="text-ink-soft">available</span>
          {mode === "results" && (
            <>
              {" "}
              · <span className="text-gold">results</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          {result && result.values.length > 1 && (
            <ChartIt
              grid={result}
              title={mode === "draft" ? `Scouting the ${data.season} draft` : `The ${data.season} season`}
              subtitle={mode === "draft" ? `${data.scoutSeasons[0]}–${data.season - 1} regular seasons` : "PPR, weeks 1–17"}
              credit={NFLVERSE_CREDIT}
              shareUrl={`${SITE_URL}/draft`}
              shareText="Scouting my fantasy draft with SQL."
            />
          )}
          <button type="button" onClick={() => run(sql)} className="press btn-turf" aria-keyshortcuts="Control+Enter">
            Run
          </button>
        </div>
      </div>

      {err && <p className="mt-3 font-mono text-[12px] text-gold">⚠ {err}</p>}
      {result && result.columns.length > 0 && (
        <div className="mt-3 max-h-[26rem] overflow-auto rounded-lg border border-panel-border">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="sticky top-0 bg-panel">
              <tr>
                {hasPlayers && mode === "draft" && <th className="px-2 py-1.5" />}
                {result.columns.map((c) => (
                  <th key={c} className="whitespace-nowrap px-2 py-1.5 font-semibold text-ink-muted">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.values.map((row, i) => {
                const id = hasPlayers ? rowId(row) : null;
                const gone = id ? taken.has(id) : false;
                return (
                  <tr key={i} className={`border-t border-panel-border/60 ${gone && mode === "draft" ? "opacity-45" : ""}`}>
                    {hasPlayers && mode === "draft" && (
                      <td className="px-2 py-1">
                        {id && !gone && (
                          <button
                            type="button"
                            disabled={!canPick}
                            onClick={() => onDraft?.(id)}
                            className="rounded border border-gold/60 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase text-gold transition-colors hover:bg-gold hover:text-night disabled:cursor-not-allowed disabled:border-panel-border disabled:bg-transparent disabled:text-ink-muted"
                          >
                            Draft
                          </button>
                        )}
                        {gone && <span className="text-[10px] uppercase text-ink-muted">Gone</span>}
                      </td>
                    )}
                    {row.map((v, j) => (
                      <td key={j} className="whitespace-nowrap px-2 py-1 text-ink-soft">
                        {v === null ? <span className="text-ink-muted">NULL</span> : String(v)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {result && result.columns.length === 0 && <p className="mt-3 font-mono text-[12px] text-ink-muted">No rows.</p>}
    </section>
  );
}

// ── Big board, team, log ──────────────────────────────────────────────
function BigBoard({
  data,
  picks,
  canPick,
  onDraft,
}: {
  data: DraftData;
  picks: string[];
  canPick: boolean;
  onDraft: (id: string) => void;
}) {
  const [pos, setPos] = useState<Pos | "ALL">("ALL");
  const [q, setQ] = useState("");
  const taken = useMemo(() => new Set(picks), [picks]);
  const list = data.board
    .filter((p) => !taken.has(p.id) && (pos === "ALL" || p.pos === pos))
    .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 60);

  return (
    <section className={`${CARD} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <p className="label-broadcast text-ice">big board · by ADP</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          aria-label="Search players"
          className="w-28 rounded-lg border border-panel-border bg-night/60 px-2 py-1 text-xs text-ink outline-none focus:border-ice/60"
        />
      </div>
      <div className="mt-2 flex gap-1">
        {(["ALL", "QB", "RB", "WR", "TE"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPos(p)}
            className={`rounded-md border px-2 py-1 font-mono text-[10px] font-bold ${
              pos === p ? "border-ice bg-ice/15 text-ice" : "border-panel-border text-ink-muted hover:text-ink"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <ul className="mt-2 max-h-[22rem] divide-y divide-panel-border/60 overflow-y-auto pr-1">
        {list.map((p) => (
          <li key={p.id} className="flex items-center gap-2 py-1.5">
            <span className="w-9 shrink-0 text-right font-mono text-[10px] text-ink-muted">{p.adp}</span>
            <Headshot name={p.name} src={p.headshot} size={24} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ink">{p.name}</span>
              <span className="block font-mono text-[10px] text-ink-muted">
                {p.team} · bye {p.bye ?? "—"}
                {p.rookie ? " · rookie" : ""}
              </span>
            </span>
            <PosChip pos={p.pos} />
            <button
              type="button"
              disabled={!canPick}
              onClick={() => onDraft(p.id)}
              className="rounded border border-gold/60 bg-gold/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-gold transition-colors hover:bg-gold hover:text-night disabled:cursor-not-allowed disabled:border-panel-border disabled:bg-transparent disabled:text-ink-muted"
            >
              Draft
            </button>
          </li>
        ))}
        {!list.length && <li className="py-3 text-center text-xs text-ink-muted">Nobody left who matches.</li>}
      </ul>
    </section>
  );
}

/** Your roster, laid out as the lineup it would start, in draft order. */
function layout(data: DraftData, roster: string[]): { slot: string; p: DraftPlayer | null }[] {
  const players = byId(data);
  const left = roster.map((id) => players.get(id)!).filter(Boolean);
  const take = (ok: (p: DraftPlayer) => boolean) => {
    const i = left.findIndex(ok);
    return i >= 0 ? left.splice(i, 1)[0] : null;
  };
  const out: { slot: string; p: DraftPlayer | null }[] = [];
  out.push({ slot: "QB", p: take((p) => p.pos === "QB") });
  out.push({ slot: "RB", p: take((p) => p.pos === "RB") });
  out.push({ slot: "RB", p: take((p) => p.pos === "RB") });
  out.push({ slot: "WR", p: take((p) => p.pos === "WR") });
  out.push({ slot: "WR", p: take((p) => p.pos === "WR") });
  out.push({ slot: "WR", p: take((p) => p.pos === "WR") });
  out.push({ slot: "TE", p: take((p) => p.pos === "TE") });
  out.push({ slot: "FLEX", p: take((p) => p.pos !== "QB") });
  left.forEach((p) => out.push({ slot: "BN", p }));
  while (out.length < ROUNDS) out.push({ slot: "BN", p: null });
  return out;
}

function TeamCard({ data, roster, points }: { data: DraftData; roster: string[]; points?: boolean }) {
  // After the season there is no lineup to show — best ball played everyone
  // where they helped — so the roster is ranked by what each player scored.
  const rows = points
    ? roster
        .map((id) => byId(data).get(id)!)
        .sort((a, b) => seasonPoints(data, b.id) - seasonPoints(data, a.id))
        .map((p) => ({ slot: p.pos as string, p: p as DraftPlayer | null }))
    : layout(data, roster);
  return (
    <section className={`${CARD} p-4`}>
      <div className="flex items-baseline justify-between">
        <p className="label-broadcast text-gold">{points ? "your team · season points" : "your team"}</p>
        <span className="font-mono text-[10px] text-ink-muted">
          {roster.length}/{ROUNDS} picks
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {rows.map((r, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 rounded-lg px-2 py-0.5 ${r.p ? "bg-night/40" : "border border-dashed border-panel-border"} ${
              !points && r.slot === "BN" && i === 8 ? "mt-2" : ""
            }`}
          >
            <span className="w-9 shrink-0 font-mono text-[10px] font-bold text-ink-muted">{r.slot}</span>
            {r.p ? (
              <>
                <Headshot name={r.p.name} src={r.p.headshot} size={20} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{r.p.name}</span>
                <span className="font-mono text-[10px] text-ink-muted">
                  {r.p.pos} · {r.p.team}
                </span>
                {points && <span className="w-12 text-right font-mono text-[11px] text-turf">{fmt(seasonPoints(data, r.p.id))}</span>}
              </>
            ) : (
              <span className="text-[11px] text-ink-muted">—</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PickLog({ league, data, picks }: { league: League; data: DraftData; picks: string[] }) {
  const players = useMemo(() => byId(data), [data]);
  const recent = picks
    .map((id, k) => ({ id, k }))
    .slice(-12)
    .reverse();
  return (
    <section className={`${CARD} p-4`}>
      <p className="label-broadcast">the draft so far</p>
      {!recent.length && <p className="mt-2 text-xs text-ink-muted">No picks yet.</p>}
      <ul className="mt-2 space-y-1">
        {recent.map(({ id, k }) => {
          const p = players.get(id)!;
          const you = teamForPick(k) === league.slot;
          return (
            <li key={k} className={`flex items-center gap-2 text-[12px] ${you ? "text-gold" : "text-ink-soft"}`}>
              <span className="w-10 shrink-0 font-mono text-[10px] text-ink-muted">{pickLabel(k)}</span>
              <span className="w-28 shrink-0 truncate font-mono text-[10px]">{you ? "YOU" : league.managers[teamForPick(k)].name}</span>
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              <PosChip pos={p.pos} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Season ────────────────────────────────────────────────────────────
function weekGame(result: ReturnType<typeof simulateSeason>, team: number, week: number): Game | null {
  if (week <= REG_WEEKS) return result.weeks[week - 1].find((g) => g.a === team || g.b === team) ?? null;
  if (week === SEMIS_WEEK) return result.semis.find((g) => g.a === team || g.b === team) ?? null;
  if (week === FINAL_WEEK) return result.final.a === team || result.final.b === team ? result.final : null;
  return null;
}

function SeasonScreen({
  league,
  data,
  picks,
  result,
  week,
  setWeek,
  onDone,
}: {
  league: League;
  data: DraftData;
  picks: string[];
  result: ReturnType<typeof simulateSeason>;
  week: number;
  setWeek: (w: number) => void;
  onDone: () => void;
}) {
  const [auto, setAuto] = useState(false);
  const me = league.slot;
  const roster = rosters(picks)[me];

  useEffect(() => {
    if (!auto) return;
    if (week >= FINAL_WEEK) {
      setAuto(false);
      return;
    }
    const t = setTimeout(() => setWeek(week + 1), week === 0 ? 200 : WEEK_DELAY);
    return () => clearTimeout(t);
  }, [auto, week, setWeek]);

  const played = result.weeks.slice(0, Math.min(week, REG_WEEKS));
  const table = standingsFrom(([] as Game[]).concat(...played));
  const game = week > 0 ? weekGame(result, me, week) : null;
  const shownWeek = game ? week : week > REG_WEEKS ? week : Math.max(1, week);
  const lineup = bestLineup(data, roster, shownWeek);
  const players = byId(data);
  const stage = week === 0 ? "Preseason" : week <= REG_WEEKS ? `Week ${week} of ${REG_WEEKS}` : week === SEMIS_WEEK ? "Semifinals · week 15" : "Championship · week 16";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-broadcast text-gold">the {league.season} season</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-ink">{stage}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {week < FINAL_WEEK ? (
            <>
              <button type="button" onClick={() => setAuto(!auto)} className="press btn-turf">
                {auto ? "Pause" : week === 0 ? "Play the season ▶" : "Play ▶"}
              </button>
              <button type="button" onClick={() => setWeek(week + 1)} className="rounded-lg border border-panel-border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/50">
                Next week
              </button>
              <button type="button" onClick={() => setWeek(FINAL_WEEK)} className="rounded-lg border border-panel-border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink">
                Skip to the end
              </button>
            </>
          ) : (
            <button type="button" onClick={onDone} className="press btn-gold">
              See how you did →
            </button>
          )}
        </div>
      </div>

      <WeekStrip result={result} team={me} week={week} />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className={`${CARD} p-4 sm:p-5`}>
          {week === 0 ? (
            <div>
              <p className="font-display text-lg font-bold text-ink">Draft&apos;s done. Here&apos;s who you&apos;re riding with.</p>
              <p className="mt-1 text-sm text-ink-soft">
                Every week your best possible lineup counts. Press play and watch the {league.season} season happen.
              </p>
              <div className="mt-4">
                <TeamCard data={data} roster={roster} />
              </div>
            </div>
          ) : game ? (
            <Matchup league={league} game={game} me={me} week={week} />
          ) : (
            <div className="py-6 text-center">
              <p className="font-display text-xl font-bold text-ink">
                {week === SEMIS_WEEK && !result.seeds.includes(me) ? "You missed the playoffs." : "Your season is over."}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {week === FINAL_WEEK
                  ? `${league.managers[result.final.a].name} ${result.final.pa} – ${result.final.pb} ${league.managers[result.final.b].name}`
                  : `Semifinals: ${result.semis.map((g) => `${league.managers[g.a].name} ${g.pa} – ${g.pb} ${league.managers[g.b].name}`).join(" · ")}`}
              </p>
            </div>
          )}

          {week > 0 && game && (
            <div className="mt-4">
              <p className="label-broadcast">your best lineup, week {shownWeek}</p>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {lineup.spots.map((s, i) => {
                  const p = s.id ? players.get(s.id) : null;
                  const top = s.pts === Math.max(...lineup.spots.map((x) => x.pts)) && s.pts > 0;
                  return (
                    <li key={i} className={`flex items-center gap-2 rounded-lg px-2 py-1 ${top ? "bg-gold/10" : "bg-night/40"}`}>
                      <span className="w-9 font-mono text-[10px] font-bold text-ink-muted">{s.slot}</span>
                      {p && <Headshot name={p.name} src={p.headshot} size={20} />}
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{p?.name ?? "—"}</span>
                      <span className={`font-mono text-[12px] ${top ? "text-gold" : "text-turf"}`}>{s.pts.toFixed(1)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        <Standings league={league} table={week === 0 ? standingsFrom([]) : table} me={me} />
      </div>
    </div>
  );
}

function WeekStrip({ result, team, week }: { result: ReturnType<typeof simulateSeason>; team: number; week: number }) {
  return (
    <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
      {Array.from({ length: FINAL_WEEK }, (_, i) => i + 1).map((w) => {
        const g = weekGame(result, team, w);
        const shown = w <= week;
        let tone = "border-panel-border text-ink-muted";
        if (shown && g) {
          const mine = g.a === team ? g.pa : g.pb;
          const theirs = g.a === team ? g.pb : g.pa;
          tone = mine > theirs ? "border-turf bg-turf/20 text-turf" : mine < theirs ? "border-gold/60 bg-gold/10 text-gold" : "border-ink-soft text-ink-soft";
        } else if (shown) tone = "border-panel-border bg-night/60 text-ink-muted opacity-50";
        return (
          <span
            key={w}
            className={`flex h-9 min-w-[2.25rem] flex-col items-center justify-center rounded-lg border font-mono text-[10px] font-bold ${tone} ${
              w === week ? "ring-2 ring-ink/40" : ""
            } ${w === SEMIS_WEEK ? "ml-2" : ""}`}
            title={w <= REG_WEEKS ? `Week ${w}` : w === SEMIS_WEEK ? "Semifinal" : "Final"}
          >
            {w <= REG_WEEKS ? w : w === SEMIS_WEEK ? "SF" : "F"}
            {shown && g && (
              <span className="text-[8px]">{(g.a === team ? g.pa > g.pb : g.pb > g.pa) ? "W" : (g.a === team ? g.pa < g.pb : g.pb < g.pa) ? "L" : "T"}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function Matchup({ league, game, me, week }: { league: League; game: Game; me: number; week: number }) {
  const mineFirst = game.a === me;
  const [you, them] = mineFirst ? [game.pa, game.pb] : [game.pb, game.pa];
  const opp = mineFirst ? game.b : game.a;
  const won = you > them;
  const lost = you < them;
  return (
    <div key={week} className="animate-fade-up">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold">You</p>
          <p className={`font-display text-4xl font-bold ${won ? "text-turf" : "text-ink"}`}>{you.toFixed(1)}</p>
        </div>
        <span className="font-mono text-xs text-ink-muted">vs</span>
        <div>
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-ink-muted">{league.managers[opp].name}</p>
          <p className={`font-display text-4xl font-bold ${lost ? "text-turf" : "text-ink-soft"}`}>{them.toFixed(1)}</p>
        </div>
      </div>
      <p className={`mt-2 text-center font-display text-lg font-bold ${won ? "text-turf" : lost ? "text-gold" : "text-ink-soft"}`}>
        {won ? (week === FINAL_WEEK ? "Champions! 🏆" : week === SEMIS_WEEK ? "Into the final!" : "Win") : lost ? (week >= SEMIS_WEEK ? "Season over." : "Loss") : "Tie"}
      </p>
    </div>
  );
}

function Standings({ league, table, me }: { league: League; table: ReturnType<typeof standingsFrom>; me: number }) {
  return (
    <section className={`${CARD} p-4`}>
      <p className="label-broadcast">standings</p>
      <table className="mt-2 w-full text-left text-[12.5px]">
        <thead>
          <tr className="font-mono text-[10px] uppercase text-ink-muted">
            <th className="py-1 font-medium">#</th>
            <th className="py-1 font-medium">Team</th>
            <th className="py-1 text-right font-medium">W–L</th>
            <th className="py-1 text-right font-medium">PF</th>
          </tr>
        </thead>
        <tbody>
          {table.map((s, i) => (
            <tr key={s.team} className={`${i === 4 ? "border-t-2 border-dashed border-gold/40" : "border-t border-panel-border/50"} ${s.team === me ? "text-gold" : "text-ink-soft"}`}>
              <td className="py-1.5 font-mono text-[11px]">{i + 1}</td>
              <td className="max-w-[9rem] truncate py-1.5 font-semibold">{s.team === me ? "You" : league.managers[s.team].name}</td>
              <td className="py-1.5 text-right font-mono">
                {s.w}–{s.l}
                {s.t ? `–${s.t}` : ""}
              </td>
              <td className="py-1.5 text-right font-mono">{fmt(s.pf)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 font-mono text-[10px] text-ink-muted">Top four make the playoffs.</p>
    </section>
  );
}

// ── Results ───────────────────────────────────────────────────────────
const FINISH_ICON: Record<Finish, string> = { C: "🏆", F: "🥈", S: "🏈", X: "📉" };

function ResultsScreen({
  league,
  data,
  db,
  picks,
  result,
  onAgain,
  onRestart,
}: {
  league: League;
  data: DraftData;
  db: Database;
  picks: string[];
  result: ReturnType<typeof simulateSeason>;
  onAgain: () => void;
  onRestart: () => void;
}) {
  const me = summarize(result, league.slot);
  const base = useMemo(() => autodraftBaseline(league, data), [league, data]);
  const reviews = useMemo(() => reviewPicks(league, data, picks), [league, data, picks]);
  const players = useMemo(() => byId(data), [data]);
  const [shared, setShared] = useState<string | null>(null);

  const edge = Math.round(me.pf - base.pf);
  const diffs = reviews.filter((r) => r.id !== r.alt).map((r) => ({ ...r, diff: r.pts - r.altPts }));
  const bestPick = diffs.slice().sort((a, b) => b.diff - a.diff)[0];
  const worstPick = diffs.slice().sort((a, b) => a.diff - b.diff)[0];
  const code = encodeResult({ season: league.season, seed: league.seed, slot: league.slot, w: me.w, l: me.l, pf: me.pf, finish: me.finish });
  const link = `${SITE_URL}/draft?r=${code}`;
  const grid = me.marks.map((m) => (m === "W" ? "🟩" : m === "L" ? "🟥" : "⬜")).join("");
  const text = [
    `DataDraft Draft Room · ${league.season} season`,
    `${FINISH_ICON[me.finish]} ${FINISH_LABEL[me.finish]} · ${me.w}–${me.l} · ${fmt(Math.round(me.pf))} pts`,
    edge >= 0 ? `Scouting with SQL: +${edge} pts over the autodraft` : `The autodraft beat me by ${-edge} pts`,
    grid,
    "Same slot, same bots. Beat my draft:",
    link,
  ].join("\n");

  return (
    <div className="mx-auto max-w-5xl">
      <section className={`${CARD} overflow-hidden p-6 text-center sm:p-8 ${me.finish === "C" ? "border-gold/70" : ""}`}>
        <p className="text-5xl" aria-hidden>
          {FINISH_ICON[me.finish]}
        </p>
        <p className="label-broadcast mt-3 text-gold">{league.season} season · drafted from slot {league.slot + 1}</p>
        <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">{FINISH_LABEL[me.finish]}</h2>
        <p className="mt-2 font-mono text-sm text-ink-soft">
          {me.w}–{me.l}
          {me.t ? `–${me.t}` : ""} · {ordinal(me.place)} of {TEAMS} · {fmt(me.pf)} points
        </p>
        <p className="mt-4 text-2xl tracking-[0.15em]" aria-label="Your regular season, week by week">
          {grid}
        </p>

        <div className={`mx-auto mt-5 max-w-md rounded-xl border p-3 ${edge >= 0 ? "border-turf/50 bg-turf/10" : "border-gold/50 bg-gold/10"}`}>
          <p className="font-display text-lg font-bold text-ink">
            {edge > 0 ? `Your scouting was worth +${edge} points` : edge < 0 ? `ADP beat your scouting by ${-edge} points` : "Dead even with the autodraft"}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            The autodraft in your seat, same bots: {base.w}–{base.l}, {fmt(base.pf)} pts, {FINISH_LABEL[base.finish].toLowerCase()}.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const r = await shareText(text);
              setShared(r === "copied" ? "Copied — paste it in the group chat." : r === "failed" ? "Couldn't share from this browser." : null);
            }}
            className="press btn-gold"
          >
            Share my draft
          </button>
          <button type="button" onClick={onAgain} className="press btn-turf">
            Draft again
          </button>
          <button type="button" onClick={onRestart} className="rounded-lg border border-panel-border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/50">
            Another season
          </button>
        </div>
        {shared && <p className="mt-2 font-mono text-[11px] text-turf">{shared}</p>}
      </section>

      {(bestPick || worstPick) && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bestPick && bestPick.diff > 0 && (
            <PickVerdict title="Best call" tone="turf" pick={bestPick} players={players} />
          )}
          {worstPick && worstPick.diff < 0 && (
            <PickVerdict title="One you'd take back" tone="gold" pick={worstPick} players={players} />
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <TeamCard data={data} roster={rosters(picks)[league.slot]} points />
        <ScoutPanel db={db} data={data} league={league} picks={picks} canPick={false} mode="results" />
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Want more reps at the queries?{" "}
        <Link href="/questions" className="font-semibold text-gold hover:underline">
          Today&apos;s SQL question →
        </Link>
      </p>
    </div>
  );
}

function PickVerdict({
  title,
  tone,
  pick,
  players,
}: {
  title: string;
  tone: "turf" | "gold";
  pick: { overall: number; id: string; alt: string; pts: number; altPts: number; diff: number };
  players: Map<string, DraftPlayer>;
}) {
  const p = players.get(pick.id)!;
  const a = players.get(pick.alt)!;
  return (
    <section className={`${CARD} p-4 ${tone === "turf" ? "border-turf/40" : "border-gold/40"}`}>
      <p className={`label-broadcast ${tone === "turf" ? "text-turf" : "text-gold"}`}>{title}</p>
      <div className="mt-2 flex items-center gap-3">
        <Headshot name={p.name} src={p.headshot} size={44} />
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-ink">
            {p.name} at {pickLabel(pick.overall)}
          </p>
          <p className="text-xs text-ink-soft">
            {fmt(pick.pts)} pts. ADP&apos;s pick there was {a.name}: {fmt(pick.altPts)}.{" "}
            <strong className={tone === "turf" ? "text-turf" : "text-gold"}>
              {pick.diff > 0 ? "+" : ""}
              {fmt(Math.round(pick.diff))}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
