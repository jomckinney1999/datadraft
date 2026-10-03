-- 0006: which Season Pass plan each subscription is on (docs/OFFER.md).
--
-- The Season Pass is the `practice` tier in subscription_tier (the name
-- predates the product's). A member is on one of three plans: monthly,
-- annual, or founding (annual at the founding price, kept while active).
--
-- The founding offer is capped at 500 seats, and a seat once taken is gone,
-- so the count is every founding row ever written, whatever its status.
-- Only the webhook writes here (service role); members can read their own
-- row through the select policy from 0001.
--
-- Additive and safe to re-run.

alter table public.subscriptions
  add column if not exists plan text
    check (plan in ('monthly', 'annual', 'founding'));

create index if not exists subscriptions_plan_idx
  on public.subscriptions (plan);
