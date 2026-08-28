-- Waitlist / email capture.
--
-- The site has no way to take money yet (Terms of Service is still DRAFT and
-- the business entity work in docs/BUSINESS-SETUP.md is unfinished), so the
-- paid tiers capture interest instead of charging. This is also what the
-- "notify me" links on the Weekly Challenge and the in-build sports use.
--
-- RLS: anyone may INSERT, nobody may SELECT. That's deliberate — a public
-- anon key that could read this table would hand the whole email list to
-- anyone who viewed source. Read it from the dashboard or with the service
-- role key.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- what they're waiting for: a pricing tier, a course id, or a sport
  interest text not null default 'general',
  -- the sport lens they had selected, when we know it
  sport text,
  -- which surface they signed up from, for attribution
  source text,
  created_at timestamptz not null default now()
);

-- One row per email per thing they asked about; re-signing up is a no-op.
create unique index if not exists waitlist_email_interest_idx
  on public.waitlist (lower(email), interest);

create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

drop policy if exists "anyone can join the waitlist" on public.waitlist;
create policy "anyone can join the waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (
    email is not null
    and char_length(email) between 3 and 320
    and email like '%_@_%'
  );

-- Intentionally no SELECT/UPDATE/DELETE policy for anon or authenticated.
