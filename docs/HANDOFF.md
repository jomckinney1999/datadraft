# SQL Sports — Session Handoff

*Written 2026-08-09 after the Aug MVP build-out. Give this file to Claude Code to continue the work with full context. It complements — doesn't replace — `CLAUDE.md` (always in effect) and `docs/PLAN.md` (positioning source of truth).*

## What this project is

Education platform teaching SQL through fantasy football. Next.js 14 App Router + TypeScript + Tailwind, deployed on Vercel at **https://sql-sports.vercel.app** (project `sql-sports` under `jomckinney1999s-projects`, production branch `main`). Repo lives in Dropbox: `C:\Users\jomck\Dropbox\Businesses\SQL-Sports`.

## What shipped in this stretch (Aug 9, 2026)

Four commits on `main`, all deployed:

1. **Gamified learn MVP** — Duolingo-style lessons (`/learn`, `/learn/[lessonId]`): hearts, XP, combo streaks, re-queued misses, Coach Blitz SVG mascot, write-real-SQL exercises graded in-browser via sql.js.
2. **Playbook styles + Practice Field** — 3-question quiz (`/learn/playbook`) sorts learners into Film Room General / Gunslinger / Dual-Threat, and lessons adapt (theory depth, trimmed recall MCs, hint visibility). `/field` is an ungraded sandbox over **real NFL data** (nflverse, 2025 season).
3. **Fantasy palette + SQLSports Draft** — full recolor (turf green / championship gold / draft-night indigo), and course selection as a draft ceremony (`/learn/draft`): jersey name → draft board → *"With the first pick of the SQLSports Draft, {username} selects…"*
4. **Non-fan positioning** — "you don't have to watch football" callouts on landing, draft, roadmap, and field (decision logged in `docs/PLAN.md`).

## Route map

| Route | What it is |
|---|---|
| `/` | Marketing landing (`app/page.tsx`) — pricing there is governed by `docs/PLAN.md` |
| `/learn` | Course roadmap: DataCamp-style course card + Duolingo-style winding path |
| `/learn/draft` | Draft Day: username + track pick (gate #1) |
| `/learn/playbook` | Playbook-style quiz (gate #2) |
| `/learn/[lessonId]` | Lesson player (u1-l1 … u4-l3, 11 lessons SSG'd) |
| `/field` | Practice Field: free-play sql.js sandbox, real nflverse data, drill book |

## Architecture crib sheet

- **Content** is all in `lib/curriculum.ts`: 4 live units / 11 lessons / ~55 exercises (`mc` / `fill` / `query` types), units 5–6 declared `coming-soon`. Structure mirrors `docs/CURRICULUM.md` phases — keep aligned.
- **Grading**: query exercises run learner SQL + the `expected` answer key against the same seeded sql.js DB (`lib/fantasy-data.ts`, synthetic 16-player dataset) and value-compare results; `orderMatters: false` sorts rows first. **Verify new answer keys against the data** — a points tie at an ORDER BY + LIMIT boundary silently fails correct answers (happened once; prompt-level tie-breaks are the fix). Pattern for checking: a node script that rebuilds the seed and regex-extracts `expected:` strings (see git history of the first learn commit).
- **Progress** is localStorage-only, key `sqlsports.progress.v1` (`lib/progress.ts`): `{ xp, completedLessons, streak, lastActiveDay, playbookStyle, username, draftedTrack }`. Swaps for the Supabase `progress` table when accounts land (LAUNCH-PLAN Phase 1).
- **Onboarding gate chain** (enforced in `components/lesson-player.tsx`): no username/draftedTrack → `/learn/draft`; no playbookStyle → `/learn/playbook`; both `?from=<lessonId>` round-trips back to the lesson.
- **Style tailoring hooks**: `film` cards on a lesson = extra theory shown only to Film Room Generals; `drillSkip: true` on an mc = removed for Gunslingers (only tag pure-recall checks, never gotcha questions); Gunslingers get hints behind a toggle + a collapsible chalkboard.
- **Draft board**: `lib/draft.ts` TRACKS — one live track, three "declaring next season" (Contender Season / Analytics Combine / Dynasty Mode). These future names are placeholders; PLAN.md governs what's publicly promised.
- **Practice Field data**: `scripts/build-field-dataset.mjs` downloads nflverse `stats_player` weekly CSVs (the NEW release tag — the old `player_stats` tag used by `lib/data/nflverse.ts` stops at 2024) → bakes `public/field-data.json` (~300 KB). Bump `WEEKLY_SEASON` and re-run each season. Schema/seed/drills in `lib/field-data.ts`, UI in `components/field-sandbox.tsx`.
- **Palette** (fantasy football): tokens in `tailwind.config.ts` + CSS vars in `app/globals.css` — `night` #0C1022 indigo, `turf` #3FD973, `gold` #F2C94C, `ink`/`panel` neutrals. The old `teal`/`amber` names are dead — never reintroduce them. Coach Blitz's SVG hard-codes accent hexes by design (grep `#3FD973` / `#F2C94C`); nothing else should.
- **Light + dark mode** (added 2026-08-10): tokens are now `"r g b"` triplets behind `rgb(var(--c-x) / <alpha-value>)`, flipped by `data-theme` on `<html>`. Toggle in every header except the lesson player; blocking script in `app/layout.tsx` prevents a flash and must stay in sync with `components/theme-toggle.tsx`. **Don't delete the `.theme-switching` rule** — Chrome won't re-resolve `var()`-derived colors on elements with `transition-colors`, so without it everything stays painted in the old theme after a toggle. Full detail in `CLAUDE.md`. Note this pass also fixed leftover dead-teal/amber `rgba()` values still hardcoded in glow shadows and the `/learn` yard-lines gradient.
- **Coach Blitz**: `components/coach.tsx`, inline SVG, `mood` prop (`idle|happy|sad|cheer|think`).

## Operational gotchas (learned the hard way)

- **Deploy**: `npx vercel deploy --prod --scope jomckinney1999s-projects` — without `--scope` it fails with a misleading "Not authorized" even when logged in. Push to `main` first.
- **`next build` while `next dev` is running corrupts the dev server's `.next`** ("Cannot find module './276.js'"). Stop dev, build, restart dev.
- **Local dev works without real env keys**: `middleware.ts` deliberately no-ops when `NEXT_PUBLIC_SUPABASE_URL` is a placeholder (same lazy-init contract as `lib/stripe.ts`). Don't revert — with placeholder keys the Supabase client would crash every route locally. `.env.local` currently has placeholders; production behavior is unaffected.
- **Port 3000 is usually taken** by the personal portfolio site on this machine — run dev on another port (`npm run dev -- -p 3055`).
- **Perpetually dirty files to leave uncommitted**: `docs/CURRICULUM.md` shows a line-endings-only diff (no content change) and `docs/.obsidian/` is untracked editor state. Don't sweep either into commits.

## How to verify changes (the workflow that caught real bugs)

1. `npx next build` — lint is strict (react-hooks/rules-of-hooks, no-unescaped-entities have both failed builds here).
2. Browser test as a fresh user: `localStorage.removeItem("sqlsports.progress.v1")`, reload `/learn`, walk draft → quiz → lesson → completion; confirm XP/streak persist and the roadmap unlocks.
3. For new query exercises: run every `expected` against the seeded data (non-empty results, no boundary ties).
4. Deploy, then curl the new routes for 200s.

## Added 2026-08-10 (after this doc was written)

- **Positioning pivot** — the site now sells the full data-analyst toolkit (SQL, Python, R, Git, stats) across three sports, with a sport picker on the landing page (`#pick-your-sport`, `lib/sports.ts`, `lib/use-sport.ts`). Football is the only `live` sport; NBA/MLB are labeled "In build". Reasoning and the risks it creates are logged in `docs/PLAN.md`.
- **Non-SQL curriculum shipped** — `lib/curriculum.ts` units 7–11 (Python/pandas, statistics, visualization, Git/GitHub, R/tidyverse): 15 lessons, ~60 exercises, same XP/hearts/streak flow as the SQL units. `COURSE.title` is now "Analyst Fundamentals: Rookie Season" and the `rookie-season` draft track was rewritten to match — the track **id** was kept stable so existing drafted picks don't orphan.
- **Live coding shipped** — Python (Pyodide) and R (WebR) run in-browser via `lib/runtimes.ts`; `code` exercises grade printed output. SQL keeps `query` result-set grading. Modules (`MODULES` / `lib/use-module.ts`) let learners take SQL, Python, R, or the all-in-one pathway. Still don't add `query` exercises to units 7–11 — use `code` instead.
- **Still football-only.** Every example in all 11 units uses football data, while the picker offers three sports. That's the live gap now — see `docs/PLAN.md` → Open questions.
- **Sport choice is a standalone localStorage key** (`sqlsports-sport`), deliberately *not* in `lib/progress.ts`, to avoid touching the progress schema. Fold it into `Progress` when accounts land.

## Open threads (roughly in priority order)

- **Unit 5: JOINs** ("Trade Desk") — schema already supports it (`rosters` + `week_results`; the Field's `teams` join drill warms learners up). Unit 6: window functions.
- **Supabase swap for progress** — accounts, cross-device streaks (LAUNCH-PLAN Phase 1; schema already in `supabase/migrations/`).
- **Weekly Challenge / leaderboard** on real Field data (LAUNCH-PLAN; PLAN.md "appointment-based habit loop").
- **Style analytics** — which playbook style retains best; informs pricing before payments go live (payments deferred per LAUNCH-PLAN Phase 2; legal docs still DRAFT).
- **Season refresh** — re-run `scripts/build-field-dataset.mjs` when nflverse publishes 2026 weeks (in-season, weekly).
- **Content debt**: the non-fan promise ("context explained in one sentence when it matters") is a real commitment for Unit 5+ copy. Landing page `ROADMAP`/pricing must stay in sync with `docs/PLAN.md` + `docs/CURRICULUM.md`.
