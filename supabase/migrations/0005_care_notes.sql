-- Clinica — profession-specific care modules (SaaS Faz 4, first module).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Doctors/dentists already have `prescriptions`. Psychologists, dietitians
-- and physiotherapists get their own structured notes here instead:
--   - psychologist      → session_note   (mood, goal, note)
--   - dietitian         → nutrition_plan (target weight, calories, meal plan)
--   - physiotherapist   → exercise_plan  (exercise plan, progress note)
-- One table, one `kind` discriminator — columns not used by a given kind
-- just stay null, same pattern as the rest of this schema.

create table if not exists care_notes (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade default current_clinic_id(),
  patient_id uuid not null references patients(id) on delete cascade,
  provider_id uuid references profiles(id) on delete set null,
  kind text not null check (kind in ('session_note', 'nutrition_plan', 'exercise_plan')),
  occurred_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'completed')),
  note text,
  mood text,
  goal text,
  target_weight_kg numeric,
  calories_per_day int,
  meal_plan text,
  exercise_plan text,
  progress_note text,
  created_at timestamptz not null default now()
);

create index if not exists care_notes_clinic_idx on care_notes (clinic_id);
create index if not exists care_notes_patient_idx on care_notes (patient_id);

alter table care_notes enable row level security;

-- Same visibility rule as visits: admin sees all, a provider sees their own
-- notes, and can_see_patient() covers the non-admin "assigned patients" case.
drop policy if exists "select scoped care_notes" on care_notes;
create policy "select scoped care_notes" on care_notes
  for select using (clinic_id = current_clinic_id() and (is_admin() or provider_id = auth.uid() or can_see_patient(patient_id)));
drop policy if exists "insert care_notes" on care_notes;
create policy "insert care_notes" on care_notes
  for insert with check (clinic_id = current_clinic_id());
drop policy if exists "update care_notes" on care_notes;
create policy "update care_notes" on care_notes
  for update using (clinic_id = current_clinic_id()) with check (clinic_id = current_clinic_id());
drop policy if exists "delete care_notes" on care_notes;
create policy "delete care_notes" on care_notes
  for delete using (clinic_id = current_clinic_id());
