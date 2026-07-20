-- Clinica — multi-tenancy (SaaS Faz 1).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Turns the single-clinic kit into a multi-tenant SaaS:
--   - clinics: one row per customer workspace. Carries the 10-day trial clock
--     (trial_ends_at, enforced in Faz 2) and an optional per-clinic WhatsApp
--     sender (empty = platform's central number).
--   - Every data table gets clinic_id; existing rows move to "Demo Klinik".
--   - RLS: members only see their own clinic's rows; the admin/provider
--     split from 0002 keeps working *inside* each clinic.
--   - Signup trigger now creates a clinic and makes the new user its admin.
--   - MRN uniqueness becomes per-clinic.

-- ── clinics ───────────────────────────────────────────────────────────────
create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profession text not null default 'other'
    check (profession in ('doctor', 'dentist', 'psychologist', 'dietitian', 'physiotherapist', 'other')),
  whatsapp_from text,
  trial_ends_at timestamptz not null default now() + interval '10 days',
  created_at timestamptz not null default now()
);

alter table profiles add column if not exists clinic_id uuid references clinics(id) on delete set null;
alter table profiles add column if not exists profession text;

-- ── helper: the signed-in user's clinic ───────────────────────────────────
create or replace function current_clinic_id()
returns uuid
language sql
stable
security definer set search_path = public
as $$
  select clinic_id from profiles where id = auth.uid();
$$;

-- ── clinic_id on all data tables ──────────────────────────────────────────
alter table patients add column if not exists clinic_id uuid references clinics(id) on delete cascade;
alter table appointments add column if not exists clinic_id uuid references clinics(id) on delete cascade;
alter table visits add column if not exists clinic_id uuid references clinics(id) on delete cascade;
alter table prescriptions add column if not exists clinic_id uuid references clinics(id) on delete cascade;
alter table patient_docs add column if not exists clinic_id uuid references clinics(id) on delete cascade;
alter table invoices add column if not exists clinic_id uuid references clinics(id) on delete cascade;
alter table activity_log add column if not exists clinic_id uuid references clinics(id) on delete cascade;

-- ── backfill existing rows into "Demo Klinik" ─────────────────────────────
do $$
declare demo_id uuid;
begin
  select id into demo_id from clinics where name = 'Demo Klinik';
  if demo_id is null then
    insert into clinics (name, profession) values ('Demo Klinik', 'doctor') returning id into demo_id;
  end if;

  update profiles set clinic_id = demo_id where clinic_id is null;
  update profiles set profession = 'psychologist' where role = 'Psikolog' and profession is null;
  update patients set clinic_id = demo_id where clinic_id is null;
  update appointments set clinic_id = demo_id where clinic_id is null;
  update visits set clinic_id = demo_id where clinic_id is null;
  update prescriptions set clinic_id = demo_id where clinic_id is null;
  update patient_docs set clinic_id = demo_id where clinic_id is null;
  update invoices set clinic_id = demo_id where clinic_id is null;
  update activity_log set clinic_id = demo_id where clinic_id is null;
end $$;

alter table patients alter column clinic_id set not null;
alter table appointments alter column clinic_id set not null;
alter table visits alter column clinic_id set not null;
alter table prescriptions alter column clinic_id set not null;
alter table patient_docs alter column clinic_id set not null;
alter table invoices alter column clinic_id set not null;
alter table activity_log alter column clinic_id set not null;

-- App inserts don't have to name clinic_id — it defaults to the caller's clinic.
alter table patients alter column clinic_id set default current_clinic_id();
alter table appointments alter column clinic_id set default current_clinic_id();
alter table visits alter column clinic_id set default current_clinic_id();
alter table prescriptions alter column clinic_id set default current_clinic_id();
alter table patient_docs alter column clinic_id set default current_clinic_id();
alter table invoices alter column clinic_id set default current_clinic_id();
alter table activity_log alter column clinic_id set default current_clinic_id();

create index if not exists patients_clinic_idx on patients (clinic_id);
create index if not exists appointments_clinic_idx on appointments (clinic_id);
create index if not exists visits_clinic_idx on visits (clinic_id);
create index if not exists prescriptions_clinic_idx on prescriptions (clinic_id);
create index if not exists patient_docs_clinic_idx on patient_docs (clinic_id);
create index if not exists invoices_clinic_idx on invoices (clinic_id);
create index if not exists activity_log_clinic_idx on activity_log (clinic_id);

-- MRN is only unique inside a clinic now.
alter table patients drop constraint if exists patients_mrn_key;
create unique index if not exists patients_clinic_mrn_uniq on patients (clinic_id, mrn);

-- ── signup: every new user gets their own clinic and becomes its admin ────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_clinic uuid;
  meta jsonb := new.raw_user_meta_data;
  prof text := coalesce(nullif(meta ->> 'profession', ''), 'other');
  cname text := coalesce(
    nullif(meta ->> 'clinic_name', ''),
    nullif(meta ->> 'full_name', ''),
    new.email
  );
begin
  if prof not in ('doctor', 'dentist', 'psychologist', 'dietitian', 'physiotherapist', 'other') then
    prof := 'other';
  end if;

  insert into public.clinics (name, profession) values (cname, prof) returning id into new_clinic;

  insert into public.profiles (id, full_name, role, clinic_id, profession, is_admin)
  values (
    new.id,
    coalesce(meta ->> 'full_name', new.email),
    case prof
      when 'doctor' then 'Doktor'
      when 'dentist' then 'Diş Hekimi'
      when 'psychologist' then 'Psikolog'
      when 'dietitian' then 'Diyetisyen'
      when 'physiotherapist' then 'Fizyoterapist'
      else 'Uzman'
    end,
    new_clinic,
    prof,
    true
  );
  return new;
end;
$$;

-- ── RLS: clinic scoping everywhere ────────────────────────────────────────
alter table clinics enable row level security;
drop policy if exists "members read own clinic" on clinics;
create policy "members read own clinic" on clinics
  for select using (id = current_clinic_id());
drop policy if exists "admin updates own clinic" on clinics;
create policy "admin updates own clinic" on clinics
  for update using (id = current_clinic_id() and is_admin())
  with check (id = current_clinic_id());

-- profiles: members can see teammates (needed for provider pickers).
drop policy if exists "members read clinic profiles" on profiles;
create policy "members read clinic profiles" on profiles
  for select using (clinic_id = current_clinic_id());

-- patients
drop policy if exists "select scoped patients" on patients;
create policy "select scoped patients" on patients
  for select using (clinic_id = current_clinic_id() and can_see_patient(id));
drop policy if exists "insert patients" on patients;
create policy "insert patients" on patients
  for insert with check (clinic_id = current_clinic_id());
drop policy if exists "update patients" on patients;
create policy "update patients" on patients
  for update using (clinic_id = current_clinic_id()) with check (clinic_id = current_clinic_id());
drop policy if exists "delete patients" on patients;
create policy "delete patients" on patients
  for delete using (clinic_id = current_clinic_id());

-- appointments
drop policy if exists "select scoped appointments" on appointments;
create policy "select scoped appointments" on appointments
  for select using (clinic_id = current_clinic_id() and (is_admin() or provider_id = auth.uid()));
drop policy if exists "insert appointments" on appointments;
create policy "insert appointments" on appointments
  for insert with check (clinic_id = current_clinic_id());
drop policy if exists "update appointments" on appointments;
create policy "update appointments" on appointments
  for update using (clinic_id = current_clinic_id()) with check (clinic_id = current_clinic_id());
drop policy if exists "delete appointments" on appointments;
create policy "delete appointments" on appointments
  for delete using (clinic_id = current_clinic_id());

-- visits
drop policy if exists "select scoped visits" on visits;
create policy "select scoped visits" on visits
  for select using (clinic_id = current_clinic_id() and (is_admin() or provider_id = auth.uid() or can_see_patient(patient_id)));
drop policy if exists "insert visits" on visits;
create policy "insert visits" on visits
  for insert with check (clinic_id = current_clinic_id());
drop policy if exists "update visits" on visits;
create policy "update visits" on visits
  for update using (clinic_id = current_clinic_id()) with check (clinic_id = current_clinic_id());
drop policy if exists "delete visits" on visits;
create policy "delete visits" on visits
  for delete using (clinic_id = current_clinic_id());

-- prescriptions
drop policy if exists "select scoped prescriptions" on prescriptions;
create policy "select scoped prescriptions" on prescriptions
  for select using (clinic_id = current_clinic_id() and can_see_patient(patient_id));
drop policy if exists "insert prescriptions" on prescriptions;
create policy "insert prescriptions" on prescriptions
  for insert with check (clinic_id = current_clinic_id());
drop policy if exists "update prescriptions" on prescriptions;
create policy "update prescriptions" on prescriptions
  for update using (clinic_id = current_clinic_id()) with check (clinic_id = current_clinic_id());
drop policy if exists "delete prescriptions" on prescriptions;
create policy "delete prescriptions" on prescriptions
  for delete using (clinic_id = current_clinic_id());

-- patient_docs
drop policy if exists "select scoped patient_docs" on patient_docs;
create policy "select scoped patient_docs" on patient_docs
  for select using (clinic_id = current_clinic_id() and can_see_patient(patient_id));
drop policy if exists "insert patient_docs" on patient_docs;
create policy "insert patient_docs" on patient_docs
  for insert with check (clinic_id = current_clinic_id());
drop policy if exists "update patient_docs" on patient_docs;
create policy "update patient_docs" on patient_docs
  for update using (clinic_id = current_clinic_id()) with check (clinic_id = current_clinic_id());
drop policy if exists "delete patient_docs" on patient_docs;
create policy "delete patient_docs" on patient_docs
  for delete using (clinic_id = current_clinic_id());

-- invoices (admin-only inside the clinic)
drop policy if exists "admin only invoices" on invoices;
create policy "admin only invoices" on invoices
  for all using (clinic_id = current_clinic_id() and is_admin())
  with check (clinic_id = current_clinic_id() and is_admin());

-- activity log (staff write, admin read — clinic-scoped)
drop policy if exists "admin reads activity" on activity_log;
create policy "admin reads activity" on activity_log
  for select using (clinic_id = current_clinic_id() and is_admin());
drop policy if exists "staff logs activity" on activity_log;
create policy "staff logs activity" on activity_log
  for insert with check (clinic_id = current_clinic_id());
