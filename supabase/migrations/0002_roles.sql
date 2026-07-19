-- Clinica — role-based access.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Adds an admin/provider distinction on top of the flat "any staff member sees
-- everything" model from 0001_init.sql:
--   - profiles.is_admin: clinic admins (front desk / owner) see all data.
--   - appointments.provider_id / visits.provider_id: which signed-in provider
--     (e.g. a specific psychologist) is attached to that row.
--   - Non-admin providers only SEE patients/appointments/visits they're
--     attached to. Write access (insert/update/delete) is unchanged from
--     0001 — this migration only scopes what each signed-in user can read.
--   - Invoices are admin/finance-only. The activity log can be written by any
--     staff member (so reminders/telehealth actions can still log) but only
--     read by admins.

alter table profiles add column if not exists is_admin boolean not null default false;
alter table appointments add column if not exists provider_id uuid references profiles(id) on delete set null;
alter table visits add column if not exists provider_id uuid references profiles(id) on delete set null;

create index if not exists appointments_provider_id_idx on appointments (provider_id);
create index if not exists visits_provider_id_idx on visits (provider_id);

create or replace function is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false);
$$;

create or replace function can_see_patient(pid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select is_admin()
    or exists (select 1 from appointments a where a.patient_id = pid and a.provider_id = auth.uid())
    or exists (select 1 from visits v where v.patient_id = pid and v.provider_id = auth.uid());
$$;

-- ── patients ──────────────────────────────────────────────────────────────
drop policy if exists "staff full access" on patients;
create policy "select scoped patients" on patients for select using (can_see_patient(id));
create policy "insert patients" on patients for insert with check (auth.uid() is not null);
create policy "update patients" on patients for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "delete patients" on patients for delete using (auth.uid() is not null);

-- ── appointments ──────────────────────────────────────────────────────────
drop policy if exists "staff full access" on appointments;
create policy "select scoped appointments" on appointments for select using (is_admin() or provider_id = auth.uid());
create policy "insert appointments" on appointments for insert with check (auth.uid() is not null);
create policy "update appointments" on appointments for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "delete appointments" on appointments for delete using (auth.uid() is not null);

-- ── visits ────────────────────────────────────────────────────────────────
drop policy if exists "staff full access" on visits;
create policy "select scoped visits" on visits for select using (is_admin() or provider_id = auth.uid() or can_see_patient(patient_id));
create policy "insert visits" on visits for insert with check (auth.uid() is not null);
create policy "update visits" on visits for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "delete visits" on visits for delete using (auth.uid() is not null);

-- ── prescriptions ─────────────────────────────────────────────────────────
drop policy if exists "staff full access" on prescriptions;
create policy "select scoped prescriptions" on prescriptions for select using (can_see_patient(patient_id));
create policy "insert prescriptions" on prescriptions for insert with check (auth.uid() is not null);
create policy "update prescriptions" on prescriptions for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "delete prescriptions" on prescriptions for delete using (auth.uid() is not null);

-- ── patient documents ─────────────────────────────────────────────────────
drop policy if exists "staff full access" on patient_docs;
create policy "select scoped patient_docs" on patient_docs for select using (can_see_patient(patient_id));
create policy "insert patient_docs" on patient_docs for insert with check (auth.uid() is not null);
create policy "update patient_docs" on patient_docs for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "delete patient_docs" on patient_docs for delete using (auth.uid() is not null);

-- ── invoices — admin / finance only ──────────────────────────────────────
drop policy if exists "staff full access" on invoices;
create policy "admin only invoices" on invoices for all using (is_admin()) with check (is_admin());

-- ── activity log — anyone can log, only admins read the feed ────────────
drop policy if exists "staff full access" on activity_log;
create policy "admin reads activity" on activity_log for select using (is_admin());
create policy "staff logs activity" on activity_log for insert with check (auth.uid() is not null);
