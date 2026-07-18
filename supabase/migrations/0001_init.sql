-- SQL Sports — initial schema
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query),
-- or via `supabase db push` if/when the Supabase CLI is set up locally.
--
-- Auth itself is handled by Supabase's built-in `auth.users` table (magic-link
-- email, no passwords). Everything below is app-specific data keyed off
-- `auth.users.id`.

-- ── Profiles ────────────────────────────────────────────────────────────
-- One row per user, created automatically on signup via the trigger below.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Subscriptions ───────────────────────────────────────────────────────
-- Mirrors Stripe subscription/purchase status. Written to by the Stripe
-- webhook handler (app/api/stripe/webhook/route.ts), never directly by users.
create type subscription_tier as enum ('practice', 'roadmap', 'career_track');
create type subscription_status as enum ('active', 'past_due', 'canceled', 'pending');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tier subscription_tier not null,
  status subscription_status not null default 'pending',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tier)
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- No insert/update policy for regular users — only the webhook handler
-- (using the service role key, which bypasses RLS) should write here.

-- ── Curriculum progress ─────────────────────────────────────────────────
create table public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_number int not null,
  lesson_slug text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, week_number, lesson_slug)
);

alter table public.lesson_completions enable row level security;

create policy "Users can view their own progress"
  on public.lesson_completions for select
  using (auth.uid() = user_id);

create policy "Users can mark their own progress"
  on public.lesson_completions for insert
  with check (auth.uid() = user_id);

-- ── Weekly Challenge & Leaderboard ──────────────────────────────────────
create table public.weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  season int not null,
  week_number int not null,
  question text not null,
  answer text not null,
  points int not null default 50,
  opens_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (season, week_number)
);

-- No RLS select restriction needed once a challenge is open, but hide the
-- answer column from the client — expose a view instead of the raw table.
alter table public.weekly_challenges enable row level security;

create policy "Open challenges are viewable by everyone"
  on public.weekly_challenges for select
  using (opens_at <= now());

create view public.weekly_challenges_public as
  select id, season, week_number, question, points, opens_at
  from public.weekly_challenges
  where opens_at <= now();

create table public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.weekly_challenges (id) on delete cascade,
  answer_given text not null,
  is_correct boolean not null,
  points_awarded int not null default 0,
  submitted_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

alter table public.challenge_submissions enable row level security;

create policy "Users can view their own submissions"
  on public.challenge_submissions for select
  using (auth.uid() = user_id);

create policy "Users can submit their own answers"
  on public.challenge_submissions for insert
  with check (auth.uid() = user_id);

-- Public leaderboard: total points per user, joined to a username.
create view public.leaderboard as
  select
    p.username,
    coalesce(sum(cs.points_awarded), 0) as total_points,
    count(cs.id) filter (where cs.is_correct) as correct_answers
  from public.profiles p
  left join public.challenge_submissions cs on cs.user_id = p.id
  group by p.id, p.username
  order by total_points desc;

-- ── Fantasy platform sync (Phase 5 — schema ready ahead of the feature) ──
create type fantasy_platform as enum ('sleeper', 'espn', 'yahoo');

create table public.fantasy_platform_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform fantasy_platform not null,
  external_username text,
  external_league_id text,
  access_token text, -- null for Sleeper (no OAuth needed); set for ESPN/Yahoo later
  connected_at timestamptz not null default now(),
  unique (user_id, platform, external_league_id)
);

alter table public.fantasy_platform_links enable row level security;

create policy "Users can manage their own platform links"
  on public.fantasy_platform_links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Capstones (Phase 8 — schema ready ahead of the feature) ─────────────
create type capstone_track as enum ('waiver_edge', 'draft_kit', 'manager_scorecard', 'matchup_model_lite', 'custom');
create type capstone_status as enum ('submitted', 'in_review', 'needs_revision', 'passed');

create table public.capstones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  track capstone_track not null,
  submission_url text not null,
  readme_url text,
  status capstone_status not null default 'submitted',
  score int,
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.capstones enable row level security;

create policy "Users can view and submit their own capstones"
  on public.capstones for select
  using (auth.uid() = user_id);

create policy "Users can submit their own capstone"
  on public.capstones for insert
  with check (auth.uid() = user_id);
