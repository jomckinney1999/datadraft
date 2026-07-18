-- Real weekly NFL player stats, sourced from nflverse (see lib/data/nflverse.ts).
-- Public read-only data — no per-user RLS needed, but RLS is still enabled
-- with a public-select policy so writes are restricted to the service role
-- (the ingestion route in app/api/cron/ingest-stats/route.ts).

create table public.nfl_player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  player_name text not null,
  position text not null,
  team text not null,
  season int not null,
  week int not null,
  opponent_team text,
  completions int not null default 0,
  attempts int not null default 0,
  passing_yards int not null default 0,
  passing_tds int not null default 0,
  interceptions int not null default 0,
  carries int not null default 0,
  rushing_yards int not null default 0,
  rushing_tds int not null default 0,
  receptions int not null default 0,
  targets int not null default 0,
  receiving_yards int not null default 0,
  receiving_tds int not null default 0,
  fantasy_points numeric not null default 0,
  fantasy_points_ppr numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (player_id, season, week)
);

alter table public.nfl_player_stats enable row level security;

create policy "Stats are viewable by everyone"
  on public.nfl_player_stats for select
  using (true);

-- No insert/update/delete policy — only the service role (ingestion route,
-- which bypasses RLS) writes here.

create index nfl_player_stats_season_week_idx
  on public.nfl_player_stats (season, week);

create index nfl_player_stats_player_idx
  on public.nfl_player_stats (player_id);
