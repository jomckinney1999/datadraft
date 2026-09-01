-- Badges, combo records and career yards.
--
-- Additive to 0004: learner_progress still mirrors the `Progress` type in
-- lib/progress.ts one-to-one, so syncing stays a straight field copy.
--
-- Defaults matter here. Rows written before this migration have no values for
-- these columns, and lib/progress-sync.ts merges by taking the max of the
-- counters and the union of the badges — a NULL would poison that arithmetic,
-- so every column is NOT NULL with a zero-ish default rather than nullable.

alter table public.learner_progress
  add column if not exists badges text[] not null default '{}',
  add column if not exists best_combo integer not null default 0,
  add column if not exists perfect_lessons integer not null default 0,
  add column if not exists total_yards integer not null default 0;
