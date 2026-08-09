# SQL Sports

Education platform teaching SQL and data analytics through fantasy football. Next.js 14 (App Router), TypeScript, Tailwind — a marketing/landing site (`app/page.tsx`) plus a gamified learning MVP (`app/learn/`), deployed to Vercel at https://sql-sports.vercel.app.

## Gamified learning MVP (`/learn`)

Duolingo-style lesson player + DataCamp-style course roadmap, fully client-side (no accounts, no backend):

- **Content:** `lib/curriculum.ts` — 4 live units / 11 lessons / ~55 exercises (mc, tap-the-word fill, write-real-SQL), units 5–6 declared `coming-soon`. Unit structure mirrors the `docs/CURRICULUM.md` phases — keep them aligned when either changes.
- **Grading:** query exercises run learner SQL and the `expected` answer key against the same in-browser sql.js database (seeded from `lib/fantasy-data.ts`) and compare result values; `orderMatters: false` sorts rows first. **When adding exercises, verify answer keys against the seeded data** — especially ORDER BY + LIMIT exercises where a points tie at the LIMIT boundary makes correct learner queries grade wrong (this happened; tie-breaks in the prompt are the fix).
- **Progress:** localStorage only (`lib/progress.ts`, key `sqlsports.progress.v1`) — XP, daily streak, completed lessons. Swaps for the Supabase `progress` table when accounts land (LAUNCH-PLAN Phase 1).
- **Mascot:** Coach Blitz, `components/coach.tsx` — inline SVG with a `mood` prop; no image assets.
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
- Deploy with `npx vercel --prod` after pushing to `main`.

## Backend (Phase 0/1/2/3 of LAUNCH-PLAN.md — scaffolded, not yet live)

- **Stack:** Supabase (Postgres + auth) + Stripe (payments), decided in `docs/LAUNCH-PLAN.md` Phase 0. Client helpers in `lib/supabase/` (`client.ts` browser, `server.ts` server components/route handlers, `admin.ts` service-role for webhooks/cron — bypasses RLS, server-only). `middleware.ts` refreshes auth sessions on every request; required by `@supabase/ssr`, don't remove it.
- **Schema:** `supabase/migrations/*.sql`, run manually via the Supabase Dashboard SQL Editor (no CLI dependency yet). `0001_init.sql` — profiles/subscriptions/progress/challenges/leaderboard/fantasy-links/capstones. `0002_player_stats.sql` — real NFL stats table.
- **Payments:** `lib/stripe.ts` exports a lazy `getStripe()` singleton — **never instantiate the Stripe client at module top level**, it crashes the build (and would crash Vercel's build too) whenever `STRIPE_SECRET_KEY` isn't set. Checkout in `app/api/checkout/route.ts`, webhook in `app/api/stripe/webhook/route.ts`. `scripts/setup-stripe-products.mjs` creates the Practice product/price once a real key exists.
- **Data pipeline:** `lib/data/nflverse.ts` fetches real weekly NFL stats from nflverse-data's `player_stats` GitHub release (verified live before writing — see git history for the research). `lib/data/sleeper.ts` wraps Sleeper's public API (no auth needed, foundational for Phase 5 fantasy-platform sync). `app/api/cron/ingest-stats/route.ts` is the scheduled ETL job wired to Vercel Cron via `vercel.json`; protected by `CRON_SECRET`.
- **Env vars:** see `.env.local.example` for the full list required (Supabase URL/anon/service-role keys, Stripe secret/webhook/price keys, `CRON_SECRET`). None of this works until real values are added to `.env.local` (local) and the Vercel project's environment variables (production) — the build succeeds either way by design (everything's lazily initialized), but the routes themselves will error at runtime without real keys.
- **Legal:** draft Terms of Service / Privacy Policy / Refund Policy in `docs/legal/` — explicitly marked DRAFT, need real review before Phase 2 (real payments) goes live. `docs/BUSINESS-SETUP.md` is the entity/banking/tax checklist — guidance only, not something to execute autonomously.
