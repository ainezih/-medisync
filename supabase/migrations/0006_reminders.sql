-- Clinica — automated appointment reminders.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Tracks whether the 24h-before and 1h-before reminders have already been
-- sent for an appointment, so the reminders cron (app/api/cron/reminders)
-- never double-sends. Also tracks when a telehealth link was last sent to
-- the patient (shown in the UI, not currently enforced anywhere).

alter table appointments add column if not exists reminder_24h_sent_at timestamptz;
alter table appointments add column if not exists reminder_1h_sent_at timestamptz;
alter table appointments add column if not exists telehealth_link_sent_at timestamptz;
