# SQL Sports

Education platform teaching SQL and data analytics through fantasy football. Next.js 14 (App Router), TypeScript, Tailwind — currently a single-page marketing/landing site (`app/page.tsx`), deployed to Vercel at https://sql-sports.vercel.app.

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
