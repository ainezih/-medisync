import { createClient } from "@/lib/supabase/server";
import type { Patient, Sex, PatientStatus } from "@/lib/data/types";

const SELECT = `
  id, name, initials, age, sex, mrn, phone, email, status, conditions, allergies, vitals,
  last_visit_at, next_appt_at,
  visits ( id, occurred_at, reason, provider, note ),
  prescriptions ( id, drug, dose, freq, status, prescribed_at ),
  patient_docs ( id, name, kind, doc_date )
`;

type PatientRow = {
  id: string;
  name: string;
  initials: string;
  age: number | null;
  sex: Sex | null;
  mrn: string;
  phone: string | null;
  email: string | null;
  status: PatientStatus;
  conditions: string[] | null;
  allergies: string[] | null;
  vitals: { bp?: string; hr?: string; bmi?: string; temp?: string } | null;
  last_visit_at: string | null;
  next_appt_at: string | null;
  visits: { id: string; occurred_at: string; reason: string | null; provider: string | null; note: string | null }[] | null;
  prescriptions: { id: string; drug: string; dose: string; freq: string; status: string; prescribed_at: string }[] | null;
  patient_docs: { id: string; name: string; kind: string; doc_date: string }[] | null;
};

function mapPatient(r: PatientRow): Patient {
  return {
    id: r.id,
    name: r.name,
    initials: r.initials,
    age: r.age,
    sex: r.sex,
    mrn: r.mrn,
    phone: r.phone ?? "",
    email: r.email ?? "",
    lastVisit: r.last_visit_at,
    nextAppt: r.next_appt_at ?? undefined,
    status: r.status,
    conditions: r.conditions ?? [],
    allergies: r.allergies ?? [],
    vitals: {
      bp: r.vitals?.bp ?? "—",
      hr: r.vitals?.hr ?? "—",
      bmi: r.vitals?.bmi ?? "—",
      temp: r.vitals?.temp ?? "—",
    },
    visits: (r.visits ?? [])
      .map((v) => ({ id: v.id, date: v.occurred_at, reason: v.reason ?? "", provider: v.provider ?? "", note: v.note ?? "" }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    rx: (r.prescriptions ?? [])
      .map((p) => ({ id: p.id, drug: p.drug, dose: p.dose, freq: p.freq, status: p.status as Patient["rx"][number]["status"], prescribed: p.prescribed_at }))
      .sort((a, b) => b.prescribed.localeCompare(a.prescribed)),
    docs: (r.patient_docs ?? []).map((d) => ({ id: d.id, name: d.name, kind: d.kind, date: d.doc_date })),
  };
}

/** Full patient roster, each with visits/prescriptions/docs joined in one round trip. */
export async function listPatients(): Promise<Patient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("patients").select(SELECT).order("name");
  if (error) throw new Error(`listPatients: ${error.message}`);
  return (data ?? []).map((row) => mapPatient(row as unknown as PatientRow));
}

export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("patients").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`getPatient: ${error.message}`);
  return data ? mapPatient(data as unknown as PatientRow) : null;
}
