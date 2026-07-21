-- Clinica — trial enforcement (SaaS Faz 2).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- 0003 already gave every clinic a trial_ends_at (10 days from creation) but
-- nothing in the app read it. This adds subscription_status so a clinic that
-- has actually subscribed (Faz 3 / PayTR webhook) is never locked out
-- regardless of trial_ends_at, and one that's canceled is locked immediately.

alter table clinics
  add column if not exists subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'canceled'));
