-- Cross-device learner progress.
--
-- Mirrors the `Progress` type in lib/progress.ts one-to-one so syncing is a
-- straight field copy rather than a translation layer. The older
-- `lesson_completions` table from 0001_init is shaped for the original
-- 12-week syllabus (week_number + lesson_slug) and doesn't fit the current
-- unit/lesson ids (u1-l1) or the XP/streak/playbook state, so this supersedes
-- it for the learn app. 0001's table is left alone rather than dropped —
-- nothing writes to it, and dropping tables is not worth the risk here.
--
-- Until someone signs in, progress stays in localStorage exactly as before.
-- This is additive: an account makes progress portable, it isn't required.

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0,
  completed_lessons text[] not null default '{}',
  streak integer not null default 0,
  last_active_day text not null default '',
  playbook_style text,
  username text,
  drafted_track text,
  -- the learner's chosen lens and course, currently separate localStorage keys
  sport text,
  module_id text,
  updated_at timestamptz not null default now()
);

alter table public.learner_progress enable row level security;

drop policy if exists "read own progress" on public.learner_progress;
create policy "read own progress"
  on public.learner_progress for select
  using (auth.uid() = user_id);

drop policy if exists "insert own progress" on public.learner_progress;
create policy "insert own progress"
  on public.learner_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own progress" on public.learner_progress;
create policy "update own progress"
  on public.learner_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at honest so last-write-wins merges have something to compare.
create or replace function public.touch_learner_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learner_progress_touch on public.learner_progress;
create trigger learner_progress_touch
  before update on public.learner_progress
  for each row execute function public.touch_learner_progress();
