# SQL Sports

Education platform teaching SQL and data analytics through fantasy football. Next.js 14 (App Router), TypeScript, Tailwind — a marketing/landing site (`app/page.tsx`) plus a gamified learning MVP (`app/learn/`), deployed to Vercel at https://sql-sports.vercel.app.

## Design system

Fantasy-football palette, defined once in `tailwind.config.ts` + `app/globals.css`: `night` (draft-night indigo #0C1022 family), `turf` (green #3FD973, primary accent), `gold` (championship gold #F2C94C, secondary), plus `ink`/`panel` neutrals. These replaced an older teal/amber scheme in Aug 2026 — never reintroduce `teal`/`amber` token names, and change colors by editing token values, not component classes.

### Light + dark mode

Both themes ship. Every token resolves through a CSS variable holding an `"r g b"` channel triplet — declared in `app/globals.css` under `:root` (dark, the default) and `:root[data-theme="light"]`, wired into Tailwind as `rgb(var(--c-x) / <alpha-value>)`. That indirection is what keeps the ~186 alpha modifiers (`bg-turf/10`, `border-panel-border/60`) working while the palette flips.

- **Use the tokens.** Never hardcode a hex, `rgba()`, or `text-[#...]` in a component — it won't flip. For glows/scrims/gradients that need per-theme tuning, add a class in `globals.css` (see `.rays-turf`, `.yard-lines`, `.edge-glow-gold`) rather than an inline `style`. Coach Blitz (`components/coach.tsx`) is the deliberate exception — it's an illustration, and its hexes stay fixed in both themes.
- **Light-mode turf and gold are far darker** than their dark-mode values, calibrated against the tightest real pairing (accent text on an accent/10 chip), not against plain white. Every token pair clears WCAG AA 4.5:1 in both themes — re-measure if you change them.
- `--glow-strength` is `1` in dark and `0` in light, so the scoreboard glow classes multiply to nothing on white instead of smearing.
- `.theme-dark` re-asserts the dark values on any subtree, if a section ever needs to stay dark in light mode.
- **The toggle lives in every route's header** (`components/theme-toggle.tsx`), except the lesson player — its top bar is deliberately minimal (quit / progress / hearts). Choice persists in `localStorage` under `sqlsports-theme` and defaults to the OS preference until the visitor picks explicitly.
- `app/layout.tsx` runs a blocking inline script that sets `data-theme` before first paint. It mirrors the resolution order in `theme-toggle.tsx` — **change both or neither**, or the page flashes the wrong theme on load.
- **Don't remove the `.theme-switching` transition suppression.** Chrome does not re-resolve a `var()`-derived color on an element with an active `transition-colors`, so without it every button, card, and nav link stays painted in the *previous* theme's colors after a toggle. It is a correctness fix, not polish.

## Sport selection

The learner picks football, basketball, or baseball as their lens (`lib/sports.ts`, `components/sport-picker.tsx`, persisted via `lib/use-sport.ts` under `sqlsports-sport`). Football is `status: "live"` — it's the only one with a real dataset (`public/field-data.json`); basketball and baseball are `status: "building"` and are labeled that way everywhere they appear. Don't mark a sport live until a pipeline actually backs it. The choice is kept in its own localStorage key rather than in `lib/progress.ts` to avoid touching the progress schema — fold it into `Progress` when accounts land (LAUNCH-PLAN Phase 1).

## Gamified learning MVP (`/learn`)

Duolingo-style lesson player + DataCamp-style course roadmap, fully client-side (no accounts, no backend):

- **Content:** `lib/curriculum.ts` — 4 live units / 11 lessons / ~55 exercises (mc, tap-the-word fill, write-real-SQL), units 5–6 declared `coming-soon`. Unit structure mirrors the `docs/CURRICULUM.md` phases — keep them aligned when either changes.
- **Grading:** query exercises run learner SQL and the `expected` answer key against the same in-browser sql.js database (seeded from `lib/fantasy-data.ts`) and compare result values; `orderMatters: false` sorts rows first. **When adding exercises, verify answer keys against the seeded data** — especially ORDER BY + LIMIT exercises where a points tie at the LIMIT boundary makes correct learner queries grade wrong (this happened; tie-breaks in the prompt are the fix).
- **Progress:** localStorage only (`lib/progress.ts`, key `sqlsports.progress.v1`) — XP, daily streak, completed lessons. Swaps for the Supabase `progress` table when accounts land (LAUNCH-PLAN Phase 1).
- **Mascot:** Coach Blitz, `components/coach.tsx` — inline SVG with a `mood` prop; no image assets.
- **Draft Day:** `app/learn/draft/` is the course-selection ceremony — username ("name on the jersey"), a draft board of tracks from `lib/draft.ts` (one live, three "declaring next season"), and the commissioner announcement ("With the first pick of the SQLSports Draft, {username} selects …"). Stored as `username`/`draftedTrack` in progress. Onboarding gate order in the lesson player: draft → playbook quiz → lessons.
- **Playbook styles:** `lib/playbook.ts` defines three learning modes (Film Room General / Gunslinger / Dual-Threat) + the onboarding quiz at `app/learn/playbook/`. The lesson player redirects to the quiz until a style is stored in progress. Tailoring hooks in `lib/curriculum.ts`: `film` cards on a lesson = bonus theory shown only to Film Room; `drillSkip: true` on an mc exercise = removed for Gunslingers (only tag pure-recall checks, never gotcha questions). Gunslingers also get hints behind a toggle and a collapsible chalkboard instead of the intro.
- **Practice Field (`/field`):** ungraded free-play sandbox over real NFL data. `scripts/build-field-dataset.mjs` downloads nflverse `stats_player` weekly CSVs (note: the *new* release tag — the older `player_stats` tag used by `lib/data/nflverse.ts` stops at 2024) and bakes `public/field-data.json` (~300 KB: latest-season weekly + 3-season summaries + 32 teams). Re-run it each season with `WEEKLY_SEASON` bumped. `lib/field-data.ts` holds the schema/seed builder and the drill-book prompts; UI in `components/field-sandbox.tsx`.
- `middleware.ts` deliberately no-ops when `NEXT_PUBLIC_SUPABASE_URL` isn't a real http(s) URL (placeholder env values) — same lazy-init contract as `lib/stripe.ts`. Don't revert; with placeholder keys the Supabase client throws in middleware and takes down every route locally.

## Before changing pricing, tiers, or positioning

Read [docs/PLAN.md](docs/PLAN.md) first. It's the source of truth for the product ladder (Free / Practice / Roadmap / Career Track), the target-user reasoning behind each tier's price, and open questions still unresolved. The landing page pricing section (`PLANS` array in `app/page.tsx`) is implemented from that doc — they should stay in sync. If a request conflicts with something decided there, say so instead of silently overriding it, and update the doc alongside the code when the plan itself changes.

## Curriculum and launch plan

- [docs/CURRICULUM.md](docs/CURRICULUM.md) is the full 12-week syllabus (source of truth behind the landing page's 4-phase `ROADMAP` summary and the Capstone Project Briefs).
- [docs/LAUNCH-PLAN.md](docs/LAUNCH-PLAN.md) is the full build-out plan for everything beyond the marketing site — accounts, payments, a real stats data pipeline, full curriculum production (incl. a server-side autograder and video lessons), fantasy-platform sync (Sleeper/ESPN/Yahoo), a fully automated Weekly Challenge/Leaderboard, Career Track ops, testing/monitoring, growth, and eventual multi-sport/language expansion. It's organized as dependency-ordered phases (no calendar dates by design) — check it before assuming a feature is in or out of scope, and update it if a phase's approach changes rather than letting it go stale.

## Deployment

- Vercel project `sql-sports` under `jomckinney1999s-projects`, linked via `.vercel/` (gitignored).
- Production branch is `main` (not `master` — `master` is a stale GitHub default branch with no app code, left over from initial repo setup).
- Framework preset on Vercel is explicitly set to `nextjs` — don't let this get unset, it previously caused production to silently serve only `/public` with everything else 404ing.
- Deploy with `npx vercel deploy --prod --scope jomckinney1999s-projects` after pushing to `main`. The `--scope` flag is required — without it the CLI fails with a misleading `Not authorized` even when `npx vercel whoami` shows you logged in.

## Backend (Phase 0/1/2/3 of LAUNCH-PLAN.md — scaffolded, not yet live)

- **Stack:** Supabase (Postgres + auth) + Stripe (payments), decided in `docs/LAUNCH-PLAN.md` Phase 0. Client helpers in `lib/supabase/` (`client.ts` browser, `server.ts` server components/route handlers, `admin.ts` service-role for webhooks/cron — bypasses RLS, server-only). `middleware.ts` refreshes auth sessions on every request; required by `@supabase/ssr`, don't remove it.
- **Schema:** `supabase/migrations/*.sql`, run manually via the Supabase Dashboard SQL Editor (no CLI dependency yet). `0001_init.sql` — profiles/subscriptions/progress/challenges/leaderboard/fantasy-links/capstones. `0002_player_stats.sql` — real NFL stats table.
- **Payments:** `lib/stripe.ts` exports a lazy `getStripe()` singleton — **never instantiate the Stripe client at module top level**, it crashes the build (and would crash Vercel's build too) whenever `STRIPE_SECRET_KEY` isn't set. Checkout in `app/api/checkout/route.ts`, webhook in `app/api/stripe/webhook/route.ts`. `scripts/setup-stripe-products.mjs` creates the Practice product/price once a real key exists.
- **Data pipeline:** `lib/data/nflverse.ts` fetches real weekly NFL stats from nflverse-data's `player_stats` GitHub release (verified live before writing — see git history for the research). `lib/data/sleeper.ts` wraps Sleeper's public API (no auth needed, foundational for Phase 5 fantasy-platform sync). `app/api/cron/ingest-stats/route.ts` is the scheduled ETL job wired to Vercel Cron via `vercel.json`; protected by `CRON_SECRET`.
- **Env vars:** see `.env.local.example` for the full list required (Supabase URL/anon/service-role keys, Stripe secret/webhook/price keys, `CRON_SECRET`). None of this works until real values are added to `.env.local` (local) and the Vercel project's environment variables (production) — the build succeeds either way by design (everything's lazily initialized), but the routes themselves will error at runtime without real keys.
- **Legal:** draft Terms of Service / Privacy Policy / Refund Policy in `docs/legal/` — explicitly marked DRAFT, need real review before Phase 2 (real payments) goes live. `docs/BUSINESS-SETUP.md` is the entity/banking/tax checklist — guidance only, not something to execute autonomously.
