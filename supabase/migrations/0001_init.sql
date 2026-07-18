-- Clinica — initial schema.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Single-clinic tenancy: any authenticated staff user can read/write everything.
-- No multi-clinic scoping — this kit is built for one small clinic per project.

create extension if not exists "pgcrypto";

-- ── profiles: one row per staff login, created automatically on signup ──────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'provider',
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── patients ──────────────────────────────────────────────────────────────
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  age int,
  sex text check (sex in ('male', 'female', 'other')),
  mrn text not null unique,
  phone text,
  email text,
  status text not null default 'active'
    check (status in ('active', 'new', 'inactive', 'overdue')),
  conditions text[] not null default '{}',
  allergies text[] not null default '{}',
  vitals jsonb not null default '{}',
  last_visit_at timestamptz,
  next_appt_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create index if not exists patients_mrn_idx on patients (mrn);
create index if not exists patients_status_idx on patients (status);

-- ── appointments (today's schedule + week calendar, one table) ──────────────
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  provider text not null,
  room text,
  starts_at timestamptz not null,
  duration_min int not null default 30,
  type text not null
    check (type in ('checkup', 'follow-up', 'new-patient', 'telehealth', 'procedure', 'vaccine')),
  status text not null default 'booked'
    check (status in ('booked', 'checked-in', 'in-room', 'done', 'no-show')),
  daily_room_url text,
  created_at timestamptz not null default now()
);

create index if not exists appointments_patient_idx on appointments (patient_id);
create index if not exists appointments_starts_at_idx on appointments (starts_at);

-- ── visits (chart history) ───────────────────────────────────────────────────
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  occurred_at timestamptz not null,
  reason text,
  provider text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists visits_patient_idx on visits (patient_id);

-- ── prescriptions ─────────────────────────────────────────────────────────
create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  drug text not null,
  dose text not null,
  freq text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'pending')),
  prescribed_at timestamptz not null default now()
);

create index if not exists prescriptions_patient_idx on prescriptions (patient_id);

-- ── patient documents ─────────────────────────────────────────────────────
create table if not exists patient_docs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  name text not null,
  kind text not null,
  doc_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists patient_docs_patient_idx on patient_docs (patient_id);

-- ── invoices (billing tiles + revenue chart; PayTR will mark these paid later) ─
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  visit_id uuid references visits(id) on delete set null,
  amount numeric(10, 2) not null,
  status text not null default 'unpaid' check (status in ('paid', 'unpaid')),
  issued_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists invoices_patient_idx on invoices (patient_id);
create index if not exists invoices_issued_at_idx on invoices (issued_at);

-- ── activity log (dashboard "recent activity" feed) ──────────────────────────
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target text not null,
  tone text not null default 'neutral' check (tone in ('neutral', 'success', 'warning', 'info')),
  occurred_at timestamptz not null default now()
);

create index if not exists activity_log_occurred_at_idx on activity_log (occurred_at desc);

-- ── Row Level Security: any authenticated staff user can read/write ─────────
alter table profiles enable row level security;
alter table patients enable row level security;
alter table appointments enable row level security;
alter table visits enable row level security;
alter table prescriptions enable row level security;
alter table patient_docs enable row level security;
alter table invoices enable row level security;
alter table activity_log enable row level security;

create policy "staff read own profile" on profiles
  for select using (auth.uid() = id);
create policy "staff update own profile" on profiles
  for update using (auth.uid() = id);

create policy "staff full access" on patients
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access" on appointments
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access" on visits
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access" on prescriptions
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access" on patient_docs
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access" on invoices
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access" on activity_log
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
