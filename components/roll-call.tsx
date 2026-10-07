"use client";

/**
 * Roll Call, the game (lib/roll-call.ts has the lists and the rules).
 *
 * A prompt, a board of tiles (each answer's team crest and number, or a
 * question mark for the biggest games), a search box over everyone who played
 * this season, three strikes and a clock. Name a player on the list and his
 * tile turns over; name one who isn't and it's a strike. When the board is
 * full, the strikes run out or you give up, every tile turns over and the
 * answer comes four ways: SQL you can run and change on the page, and the
 * same list in pandas, dplyr and Excel, reading the published CSV.
 *
 * Progress is per browser (`sqlsports.rollcall.v1`), so a reload resumes;
 * a saved game for a different list (the data refreshed, or a new day)
 * starts fresh. Scores by day go in `sqlsports.rollcall.history.v1`.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Database, QueryExecResult } from "sql.js";
import Headshot from "@/components/headshot";
import TeamLogo from "@/components/team-logo";
import CodeEditor from "@/components/code-editor";
import ChartIt from "@/components/chart-it";
import DailyCountdown from "@/components/daily-countdown";
import { useBigMoments } from "@/components/big-moment";
import { gameMoment } from "@/lib/big-moments";
import { NFLVERSE_CREDIT } from "@/lib/chart";
import { shareText } from "@/lib/daily-share";
import { SITE_URL } from "@/lib/site";
import { playSfx } from "@/lib/sfx";
import { PLAYER_WEEKS_CSV, ROLL_CALL_STRIKES, seedSql, type RollCallPuzzle } from "@/lib/roll-call";

const KEY = "sqlsports.rollcall.v1";
const HISTORY_KEY = "sqlsports.rollcall.history.v1";

type Saved = {
  key: string;
  found: string[];
  misses: { id: string; name: string }[];
  startedAt: number | null;
  endedAt: number | null;
  gaveUp: boolean;
};

const fresh = (key: string): Saved => ({ key, found: [], misses: [], startedAt: null, endedAt: null, gaveUp: false });

function read<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* private window: the game still plays, it just won't resume */
  }
}

/** Lowercase, accents off, punctuation off: "Ja'Marr Chase" finds "jamarr". */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const prettyDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

export default function RollCall({
  puzzle,
  roster,
}: {
  puzzle: RollCallPuzzle | null;
  roster: [string, string, string][];
}) {
  if (!puzzle) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="label-broadcast text-gold">roll call</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Back when Week 1 is in</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Roll Call is built from real weekly stats, and the season hasn&apos;t given us a full week yet.
        </p>
      </div>
    );
  }
  return <Board puzzle={puzzle} roster={roster} />;
}

function Board({ puzzle, roster }: { puzzle: RollCallPuzzle; roster: [string, string, string][] }) {
  const [game, setGame] = useState<Saved>(() => fresh(puzzle.key));
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [flash, setFlash] = useState<{ text: string; tone: "turf" | "gold" | "ink"; n: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [lastFound, setLastFound] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const moments = useBigMoments();

  const total = puzzle.answers.length;
  const answerIds = useMemo(() => new Set(puzzle.answers.map((a) => a.id)), [puzzle]);
  const folded = useMemo(() => roster.map(([id, name, pos]) => ({ id, name, pos, f: fold(name) })), [roster]);

  // Resume today's board, or start this list fresh.
  useEffect(() => {
    const saved = read<Saved>(KEY);
    if (saved && saved.key === puzzle.key) setGame(saved);
    setHydrated(true);
  }, [puzzle.key]);

  const over = game.gaveUp || game.misses.length >= ROLL_CALL_STRIKES || game.found.length === total;
  const perfect = game.found.length === total;

  // The clock runs from the first guess (or the first click in the box)
  // until the board is over.
  useEffect(() => {
    if (!game.startedAt || game.endedAt) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [game.startedAt, game.endedAt]);
  const elapsed = game.startedAt ? (game.endedAt ?? now) - game.startedAt : 0;

  function save(next: Saved) {
    setGame(next);
    write(KEY, next);
  }

  function start() {
    if (!game.startedAt && !over) save({ ...game, startedAt: Date.now() });
  }

  function finish(next: Saved) {
    const done = { ...next, endedAt: next.endedAt ?? Date.now() };
    save(done);
    const h = { ...(read<Record<string, number>>(HISTORY_KEY) ?? {}), [puzzle.day]: done.found.length };
    write(HISTORY_KEY, h);
    if (done.found.length === total) {
      moments.play(gameMoment("touchdown", `rollcall:${puzzle.key}`, "Perfect roll call!", `Roll Call #${puzzle.number} · ${total} for ${total}`));
    }
  }

  const matches = useMemo(() => {
    const q = fold(query);
    if (!q) return [];
    const words = q.split(" ");
    return folded
      .filter((p) => p.f.includes(q) || words.every((w) => p.f.split(" ").some((part) => part.startsWith(w))))
      .sort((a, b) => Number(!a.f.startsWith(q)) - Number(!b.f.startsWith(q)) || (a.name < b.name ? -1 : 1))
      .slice(0, 8);
  }, [query, folded]);

  function say(text: string, tone: "turf" | "gold" | "ink") {
    setFlash((f) => ({ text, tone, n: (f?.n ?? 0) + 1 }));
  }

  function guess(id: string, name: string) {
    if (over) return;
    setQuery("");
    setCursor(0);
    const base = game.startedAt ? game : { ...game, startedAt: Date.now() };
    if (base.found.includes(id)) {
      say(`${name} is already on the board.`, "ink");
      return;
    }
    if (base.misses.some((m) => m.id === id)) {
      say(`You already tried ${name}.`, "ink");
      return;
    }
    if (answerIds.has(id)) {
      const next = { ...base, found: [...base.found, id] };
      setLastFound(id);
      playSfx(next.found.length === total ? "first_down" : "correct");
      say(`${name} ✓`, "turf");
      if (next.found.length === total) finish(next);
      else save(next);
    } else {
      const next = { ...base, misses: [...base.misses, { id, name }] };
      playSfx("miss");
      const left = ROLL_CALL_STRIKES - next.misses.length;
      say(left > 0 ? `${name} isn't on the list. ${left} strike${left === 1 ? "" : "s"} left.` : `${name} isn't on the list. That's three.`, "gold");
      if (next.misses.length >= ROLL_CALL_STRIKES) finish(next);
      else save(next);
    }
    inputRef.current?.focus();
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(0, matches.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const m = matches[cursor];
      if (m) guess(m.id, m.name);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  function giveUp() {
    if (over) return;
    finish({ ...game, startedAt: game.startedAt ?? Date.now(), gaveUp: true });
  }

  const [shared, setShared] = useState<string | null>(null);
  async function share() {
    const strikes = "✖".repeat(game.misses.length) || "no strikes";
    const text = [
      `DataDraft Roll Call #${puzzle.number} · ${game.found.length}/${total}${perfect ? " 🏆" : ""}`,
      `${strikes} · ${clock(elapsed)}`,
      puzzle.prompt.replace(/^Name every /, "Every "),
      `${SITE_URL}/questions/roll-call`,
    ].join("\n");
    const how = await shareText(text);
    setShared(how === "copied" ? "Copied — paste it in the group chat." : how === "shared" ? "Shared." : "Couldn't share from this browser.");
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="surface rounded-2xl border border-panel-border bg-panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="shrink-0">
            <p className="label-broadcast text-gold">roll call #{puzzle.number}</p>
            <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{prettyDay(puzzle.day)}</p>
          </div>
          <div className="min-w-0 flex-1 border-l-2 border-ice pl-3">
            <h1 className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">{puzzle.prompt}</h1>
            <p className="mt-1 text-xs text-ink-muted">
              Each tile is a player: his team that week and his number. {puzzle.note} Pick names from the list; three
              misses and the board turns over.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-panel-border pt-3">
          <span className="rounded-lg border border-panel-border bg-night/40 px-3 py-1.5 font-display text-lg font-bold" aria-label={`${game.found.length} of ${total} found`}>
            <span className="text-ice">{game.found.length}</span>
            <span className="text-ink-muted"> / {total}</span>
          </span>
          <span className="flex gap-1.5" aria-label={`${game.misses.length} of ${ROLL_CALL_STRIKES} strikes`}>
            {Array.from({ length: ROLL_CALL_STRIKES }, (_, i) => (
              <span
                key={i}
                className={`grid h-7 w-7 place-items-center rounded-md border font-bold ${
                  i < game.misses.length ? "border-gold bg-gold/20 text-gold" : "border-panel-border bg-night/40 text-transparent"
                }`}
                aria-hidden
              >
                ✖
              </span>
            ))}
          </span>
          <span className="rounded-lg border border-panel-border bg-night/40 px-2.5 py-1.5 font-mono text-xs text-ink-soft" aria-label="Time">
            ⏱ {hydrated ? clock(elapsed) : "0:00"}
          </span>
          <span className="ml-auto flex items-center gap-3">
            {!over && (
              <button type="button" onClick={giveUp} className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline">
                Give up
              </button>
            )}
          </span>
        </div>
      </header>

      {!over && (
        <div className="relative mt-3">
          <label htmlFor="roll-call-search" className="sr-only">
            Search for a player
          </label>
          <input
            id="roll-call-search"
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onFocus={start}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search for a player…"
            role="combobox"
            aria-expanded={matches.length > 0}
            aria-controls={matches.length > 0 ? "roll-call-options" : undefined}
            aria-activedescendant={matches[cursor] ? `rc-opt-${matches[cursor].id}` : undefined}
            className="w-full rounded-xl border border-panel-border bg-panel px-4 py-3 text-base text-ink outline-none placeholder:text-ink-muted focus:border-ice"
          />
          {matches.length > 0 && (
            <ul id="roll-call-options" role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-panel-border bg-panel shadow-scoreboard">
              {matches.map((m, i) => (
                <li
                  key={m.id}
                  id={`rc-opt-${m.id}`}
                  role="option"
                  aria-selected={i === cursor}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    guess(m.id, m.name);
                  }}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm ${i === cursor ? "bg-ice/15 text-ink" : "text-ink-soft"}`}
                >
                  <span className="font-semibold">{m.name}</span>
                  <span className="font-mono text-[11px] text-ink-muted">
                    {game.found.includes(m.id) ? "✓ on the board" : m.pos}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-center text-sm">
        {flash && (
          <span key={flash.n} className={`inline-block animate-fade-up ${flash.tone === "turf" ? "text-turf" : flash.tone === "gold" ? "text-gold" : "text-ink-soft"}`}>
            {flash.text}
          </span>
        )}
      </p>

      <ol className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-label="The board">
        {puzzle.answers.map((a, i) => {
          const found = game.found.includes(a.id);
          const shown = found || (over && hydrated);
          return (
            <li
              key={a.id}
              className={`relative flex min-h-[6.5rem] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-colors ${
                found
                  ? `border-turf/60 bg-turf/10 ${lastFound === a.id ? "animate-option-pop" : ""}`
                  : shown
                    ? "border-gold/40 bg-night/40"
                    : "surface border-panel-border bg-panel"
              }`}
              aria-label={shown ? `${a.name}, ${a.team}, ${a.value} ${a.unit}${found ? "" : ", missed"}` : `Tile ${i + 1}: ${a.mystery ? "team hidden" : a.team}, ${a.value} ${a.unit}`}
            >
              {shown ? (
                <>
                  <Headshot name={a.name} src={a.headshot || null} size={44} className={found ? "" : "opacity-60"} />
                  <span className={`text-[13px] font-semibold leading-tight ${found ? "text-ink" : "text-ink-muted"}`}>{a.name}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
                    <TeamLogo abbr={a.team} size={14} showCode={false} />
                    {a.team} · {a.value} {a.unit}
                  </span>
                </>
              ) : (
                <>
                  {a.mystery ? (
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-ink-muted/50 font-display text-lg font-bold text-ink-muted" aria-hidden>
                      ?
                    </span>
                  ) : (
                    <TeamLogo abbr={a.team} size={36} showCode={false} />
                  )}
                  <span className="font-display text-xl font-bold text-ink">
                    {a.value}
                    <span className="ml-1 font-mono text-[10px] font-normal text-ink-muted">{a.unit}</span>
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>

      {over && hydrated && (
        <section className="surface mt-6 rounded-2xl border border-panel-border bg-panel p-5 text-center">
          <p className="label-broadcast text-gold">{perfect ? "perfect board" : game.gaveUp ? "gave up" : game.misses.length >= ROLL_CALL_STRIKES ? "three strikes" : "board done"}</p>
          <p className="mt-1 font-display text-4xl font-bold text-ink">
            {game.found.length}
            <span className="text-ink-muted">/{total}</span>
          </p>
          <p className="mt-1 font-mono text-xs text-ink-muted">
            {game.misses.length ? `Missed on ${game.misses.map((m) => m.name).join(", ")}` : "No strikes"} · {clock(elapsed)}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={share} className="press btn-gold">
              Share
            </button>
            <DailyCountdown className="font-mono text-[11px] uppercase tracking-widest text-ink-muted" />
          </div>
          {shared && <p className="mt-2 text-xs text-ink-soft">{shared}</p>}
        </section>
      )}

      {over && hydrated && <Solve puzzle={puzzle} />}

      {!over && (
        <p className="mt-6 text-center text-xs text-ink-muted">
          When the board&apos;s done you get the query that makes this list, in SQL, Python, R and Excel.
        </p>
      )}
      {moments.node}
    </div>
  );
}

type Tab = "sql" | "python" | "r" | "excel";
const TABS: { id: Tab; label: string }[] = [
  { id: "sql", label: "SQL" },
  { id: "python", label: "Python" },
  { id: "r", label: "R" },
  { id: "excel", label: "Excel" },
];

/** The list, four ways. SQL runs here; the others read the published CSV. */
function Solve({ puzzle }: { puzzle: RollCallPuzzle }) {
  const [tab, setTab] = useState<Tab>("sql");
  const [copied, setCopied] = useState<Tab | null>(null);
  const csv = PLAYER_WEEKS_CSV(puzzle.season);

  async function copy(t: Tab) {
    try {
      await navigator.clipboard.writeText(puzzle.code[t]);
      setCopied(t);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* select-and-copy still works */
    }
  }

  return (
    <section className="surface mt-5 rounded-2xl border border-panel-border bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="label-broadcast text-ice">solve it yourself</p>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">The query that makes this list</h2>
        </div>
        <div role="tablist" aria-label="Language" className="flex gap-1 rounded-xl border border-panel-border bg-night/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
                tab === t.id ? "bg-ice/20 text-ice" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "sql" ? (
        <SqlRun puzzle={puzzle} />
      ) : (
        <div className="mt-3">
          <div className="overflow-hidden rounded-xl border border-panel-border">
            <CodeEditor
              value={puzzle.code[tab]}
              onChange={() => {}}
              lang={tab}
              disabled
              rows={puzzle.code[tab].split("\n").length + 1}
              ariaLabel={`The ${tab === "r" ? "R" : tab === "excel" ? "Excel" : "Python"} version`}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => copy(tab)} className="press btn-turf">
              {copied === tab ? "Copied" : "Copy"}
            </button>
            <span className="text-xs text-ink-muted">
              {tab === "python" && <>Runs as-is in Colab or Jupyter: it reads the table straight from our site.</>}
              {tab === "r" && <>Runs as-is in RStudio or Posit Cloud with dplyr: it reads the table straight from our site.</>}
              {tab === "excel" && (
                <>
                  Excel 365. Download{" "}
                  <a href={csv} className="text-ice underline">
                    the table
                  </a>
                  , make it a table named PlayerWeeks (Ctrl+T), then paste this in an empty cell.
                </>
              )}
            </span>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Practise the {tab === "excel" ? "spreadsheet" : tab === "r" ? "R" : "pandas"} version of moves like this in the{" "}
            <Link href={tab === "excel" ? "/excel" : `/questions?lang=${tab}`} className="text-ice underline">
              {tab === "excel" ? "free Spreadsheet" : `${tab === "r" ? "R" : "Python"} questions`}
            </Link>
            .
          </p>
        </div>
      )}
      <p className="mt-4 font-mono text-[10px] text-ink-muted">
        {NFLVERSE_CREDIT} · regular-season weekly stats, QB/RB/WR/TE ·{" "}
        <a href={csv} className="underline">
          download the table (CSV)
        </a>
      </p>
    </section>
  );
}

/** The SQL, live: load the season's table into sql.js and run (and change) it. */
function SqlRun({ puzzle }: { puzzle: RollCallPuzzle }) {
  const dbRef = useRef<Database | null>(null);
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sql, setSql] = useState(puzzle.code.sql);
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => dbRef.current?.close(), []);

  function exec(text: string) {
    const db = dbRef.current;
    if (!db) return;
    setError(null);
    try {
      const res = db.exec(text);
      setResult(res[res.length - 1] ?? { columns: [], values: [] });
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function goLive() {
    setBusy(true);
    try {
      const [SQL, table] = await Promise.all([
        import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" })),
        fetch(`/roll-call/${puzzle.season}.json`).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<{ columns: string[]; rows: (string | number)[][] }>;
        }),
      ]);
      const db = new SQL.Database();
      db.run(seedSql(table.columns));
      const insert = db.prepare(`INSERT INTO player_weeks VALUES (${table.columns.map(() => "?").join(", ")})`);
      db.run("BEGIN");
      for (const row of table.rows) insert.run(row);
      db.run("COMMIT");
      insert.free();
      dbRef.current = db;
      setLive(true);
      exec(sql);
    } catch {
      setError("The table didn't load. Try a refresh.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <div className="overflow-hidden rounded-xl border border-panel-border">
        <CodeEditor value={sql} onChange={setSql} lang="sql" rows={Math.min(12, sql.split("\n").length + 1)} ariaLabel="The SQL behind this list" disabled={!live} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!live ? (
          <button type="button" onClick={goLive} disabled={busy} className="press btn-gold disabled:opacity-60">
            {busy ? "Loading the table…" : "Run it yourself"}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => exec(sql)} className="press btn-turf">
              Run
            </button>
            {result && (
              <ChartIt
                grid={result}
                title={puzzle.prompt.replace(/^Name every /, "Every ")}
                subtitle={`Week ${puzzle.week}, ${puzzle.season} · DataDraft Roll Call`}
                credit={NFLVERSE_CREDIT}
                shareUrl={`${SITE_URL}/questions/roll-call`}
                shareText="Made the list with one SQL query."
              />
            )}
            <span className="font-mono text-[10px] text-ink-muted">Change it: another week, another position, a lower bar.</span>
          </>
        )}
      </div>
      {!live && (
        <p className="mt-2 text-xs text-ink-muted">
          One table, <code className="font-mono text-ink-soft">player_weeks</code>: a row per player per game this season. Loads in your
          browser (about 20 KB).
        </p>
      )}
      {error && <p className="mt-3 font-mono text-[12px] text-gold">⚠ {error}</p>}
      {result && result.columns.length > 0 && (
        <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-panel-border" tabIndex={0} aria-label="Query result">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="sticky top-0 bg-panel">
              <tr className="border-b border-panel-border text-ink-muted">
                {result.columns.map((c) => (
                  <th key={c} className="whitespace-nowrap px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.values.slice(0, 200).map((row, i) => (
                <tr key={i} className="border-b border-panel-border/50 text-ink">
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-1.5">
                      {cell === null ? <span className="text-ink-muted">NULL</span> : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
