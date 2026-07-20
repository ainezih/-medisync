// One-time seed script — ports the kit's fictional demo dataset into real
// Supabase tables so the app isn't empty on first real run.
//
// Run with:  node --env-file=.env.local scripts/seed.mjs
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// (the service-role key bypasses RLS — never expose it to the browser).

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// Multi-tenant: seed data lives in the shared demo workspace.
async function demoClinicId() {
  const { data: existing } = await supabase.from("clinics").select("id").eq("name", "Demo Klinik").maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabase
    .from("clinics")
    .insert({ name: "Demo Klinik", profession: "doctor" })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

function atTime(daysFromToday, hh, mm) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

function mondayOffset() {
  const day = new Date().getDay();
  return day === 0 ? -6 : 1 - day;
}

const PATIENTS = [
  { key: "p1", name: "Eleanor Whitfield", initials: "EW", age: 67, sex: "female", mrn: "MRN-04821", phone: "+14155550142", email: "eleanor.w@example.com", status: "active", conditions: ["Hipertansiyon", "Tip 2 Diyabet"], allergies: ["Penisilin"], vitals: { bp: "138/86", hr: "74", bmi: "27.4", temp: "36.7°C" } },
  { key: "p2", name: "Marcus Bennett", initials: "MB", age: 41, sex: "male", mrn: "MRN-04822", phone: "+14155550188", email: "marcus.b@example.com", status: "active", conditions: ["Astım"], allergies: [], vitals: { bp: "122/78", hr: "68", bmi: "24.1", temp: "36.5°C" } },
  { key: "p3", name: "Priya Nair", initials: "PN", age: 29, sex: "female", mrn: "MRN-04901", phone: "+14155550210", email: "priya.n@example.com", status: "new", conditions: [], allergies: ["Lateks"], vitals: { bp: "118/72", hr: "70", bmi: "22.0", temp: "36.6°C" } },
  { key: "p4", name: "Daniel Cho", initials: "DC", age: 53, sex: "male", mrn: "MRN-04733", phone: "+14155550119", email: "daniel.c@example.com", status: "active", conditions: ["Yüksek kolesterol"], allergies: [], vitals: { bp: "128/80", hr: "72", bmi: "26.8", temp: "36.4°C" } },
  { key: "p5", name: "Sofia Romano", initials: "SR", age: 34, sex: "female", mrn: "MRN-04812", phone: "+14155550177", email: "sofia.r@example.com", status: "active", conditions: ["Migren"], allergies: ["Sülfa"], vitals: { bp: "115/70", hr: "66", bmi: "21.5", temp: "36.6°C" } },
  { key: "p6", name: "James O'Connor", initials: "JO", age: 8, sex: "male", mrn: "MRN-05002", phone: "+14155550144", email: "oconnor.family@example.com", status: "active", conditions: [], allergies: [], vitals: { bp: "100/64", hr: "88", bmi: "16.2", temp: "36.8°C" } },
  { key: "p7", name: "Aisha Rahman", initials: "AR", age: 46, sex: "female", mrn: "MRN-04688", phone: "+14155550166", email: "aisha.r@example.com", status: "active", conditions: ["Hipotiroidi"], allergies: [], vitals: { bp: "120/76", hr: "70", bmi: "25.3", temp: "36.5°C" } },
  { key: "p8", name: "Thomas Müller", initials: "TM", age: 58, sex: "male", mrn: "MRN-04501", phone: "+14155550133", email: "thomas.m@example.com", status: "overdue", conditions: ["Bel ağrısı"], allergies: ["Aspirin"], vitals: { bp: "134/84", hr: "76", bmi: "28.9", temp: "36.6°C" } },
  { key: "p9", name: "Grace Lindqvist", initials: "GL", age: 72, sex: "female", mrn: "MRN-04299", phone: "+14155550155", email: "grace.l@example.com", status: "active", conditions: ["Osteoporoz", "Hipertansiyon"], allergies: [], vitals: { bp: "142/88", hr: "72", bmi: "23.7", temp: "36.5°C" } },
  { key: "p10", name: "Hassan Demir", initials: "HD", age: 38, sex: "male", mrn: "MRN-04955", phone: "+14155550122", email: "hassan.d@example.com", status: "active", conditions: ["Anksiyete"], allergies: [], vitals: { bp: "124/79", hr: "74", bmi: "23.0", temp: "36.7°C" } },
  { key: "p11", name: "Olivia Carter", initials: "OC", age: 24, sex: "female", mrn: "MRN-05011", phone: "+14155550190", email: "olivia.c@example.com", status: "inactive", conditions: [], allergies: [], vitals: { bp: "116/72", hr: "68", bmi: "21.8", temp: "36.6°C" } },
  { key: "p12", name: "Robert Fields", initials: "RF", age: 61, sex: "male", mrn: "MRN-04412", phone: "+14155550101", email: "robert.f@example.com", status: "active", conditions: ["KOAH", "Hipertansiyon"], allergies: ["Kodein"], vitals: { bp: "140/90", hr: "80", bmi: "29.5", temp: "36.8°C" } },
];

async function main() {
  const clinicId = await demoClinicId();
  console.log("Seeding patients into Demo Klinik", clinicId, "…");
  const { data: insertedPatients, error: patientErr } = await supabase
    .from("patients")
    .upsert(
      PATIENTS.map(({ key: _key, ...p }) => ({ ...p, clinic_id: clinicId })),
      { onConflict: "clinic_id,mrn" },
    )
    .select("id, mrn");
  if (patientErr) throw patientErr;

  const idByKey = {};
  for (const p of PATIENTS) {
    const row = insertedPatients.find((r) => r.mrn === p.mrn);
    if (row) idByKey[p.key] = row.id;
  }

  const withClinic = (rows) => rows.map((r) => ({ ...r, clinic_id: clinicId }));

  console.log("Seeding visits, prescriptions, documents…");
  await supabase.from("visits").insert(withClinic([
    { patient_id: idByKey.p1, occurred_at: atTime(-30, 8, 30), reason: "HT takibi", provider: "Dr. Reyes", note: "Kan basıncı sınırda yüksek; lisinopril dozu artırıldı." },
    { patient_id: idByKey.p2, occurred_at: atTime(-45, 9, 0), reason: "Kontrol", provider: "Dr. Reyes", note: "Astım iyi kontrol altında." },
    { patient_id: idByKey.p3, occurred_at: atTime(-3, 9, 30), reason: "Yeni hasta — genel", provider: "Dr. Okafor", note: "Kayıt tamamlandı; başlangıç tetkikleri istendi." },
    { patient_id: idByKey.p4, occurred_at: atTime(-20, 15, 0), reason: "Lipid takibi", provider: "Dr. Reyes", note: "LDL düştü; statin sürdürülüyor." },
    { patient_id: idByKey.p5, occurred_at: atTime(-60, 11, 0), reason: "Migren yönetimi", provider: "Dr. Okafor", note: "Sıklık azaldı." },
    { patient_id: idByKey.p9, occurred_at: atTime(-16, 14, 0), reason: "Kemik yoğunluğu takibi", provider: "Dr. Reyes", note: "D vitamini eklendi." },
    { patient_id: idByKey.p12, occurred_at: atTime(-9, 15, 30), reason: "KOAH takibi", provider: "Dr. Okafor", note: "Stabil; inhaler rejimi optimize edildi." },
  ]));

  await supabase.from("prescriptions").insert(withClinic([
    { patient_id: idByKey.p1, drug: "Lisinopril", dose: "20 mg", freq: "günde 1", status: "active", prescribed_at: atTime(-30, 8, 40) },
    { patient_id: idByKey.p1, drug: "Metformin", dose: "500 mg", freq: "günde 2", status: "active", prescribed_at: atTime(-120, 9, 25) },
    { patient_id: idByKey.p2, drug: "Albuterol", dose: "90 mcg", freq: "gerektiğinde", status: "active", prescribed_at: atTime(-45, 9, 10) },
    { patient_id: idByKey.p3, drug: "Cetirizine", dose: "10 mg", freq: "günde 1", status: "pending", prescribed_at: atTime(-3, 9, 35) },
    { patient_id: idByKey.p9, drug: "Alendronate", dose: "70 mg", freq: "haftada 1", status: "active", prescribed_at: atTime(-16, 14, 10) },
    { patient_id: idByKey.p10, drug: "Sertraline", dose: "50 mg", freq: "günde 1", status: "active", prescribed_at: atTime(-5, 10, 10) },
  ]));

  await supabase.from("patient_docs").insert(withClinic([
    { patient_id: idByKey.p1, name: "Lab — Lipid Panel", kind: "Laboratuvar", doc_date: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10) },
    { patient_id: idByKey.p4, name: "Lab — Lipid Panel", kind: "Laboratuvar", doc_date: new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10) },
    { patient_id: idByKey.p8, name: "MRI — Lumbar", kind: "Görüntüleme", doc_date: new Date(Date.now() - 40 * 86400000).toISOString().slice(0, 10) },
    { patient_id: idByKey.p12, name: "Chest X-Ray", kind: "Görüntüleme", doc_date: new Date(Date.now() - 9 * 86400000).toISOString().slice(0, 10) },
  ]));

  console.log("Seeding appointments (today + this week)…");
  const today = [
    { key: "p1", h: 8, m: 30, dur: 30, type: "follow-up", status: "done", provider: "Dr. Reyes", room: "2" },
    { key: "p2", h: 9, m: 0, dur: 20, type: "checkup", status: "done", provider: "Dr. Reyes", room: "1" },
    { key: "p3", h: 9, m: 30, dur: 40, type: "new-patient", status: "in-room", provider: "Dr. Okafor", room: "3" },
    { key: "p4", h: 10, m: 15, dur: 15, type: "telehealth", status: "checked-in", provider: "Dr. Reyes", room: null },
    { key: "p5", h: 10, m: 45, dur: 30, type: "follow-up", status: "checked-in", provider: "Dr. Okafor", room: "2" },
    { key: "p6", h: 11, m: 15, dur: 20, type: "vaccine", status: "checked-in", provider: "Nurse Patel", room: null },
    { key: "p7", h: 11, m: 45, dur: 45, type: "procedure", status: "booked", provider: "Dr. Okafor", room: "3" },
    { key: "p8", h: 13, m: 30, dur: 30, type: "checkup", status: "booked", provider: "Dr. Reyes", room: "1" },
    { key: "p9", h: 14, m: 0, dur: 20, type: "follow-up", status: "booked", provider: "Dr. Reyes", room: "2" },
    { key: "p10", h: 14, m: 30, dur: 15, type: "telehealth", status: "booked", provider: "Dr. Okafor", room: null },
  ].map((s) => ({
    patient_id: idByKey[s.key],
    provider: s.provider,
    room: s.room,
    starts_at: atTime(0, s.h, s.m),
    duration_min: s.dur,
    type: s.type,
    status: s.status,
  }));

  const off = mondayOffset();
  const restOfWeek = [
    { key: "p2", day: off + 0, h: 9, m: 0, dur: 30, type: "checkup", status: "done" },
    { key: "p7", day: off + 0, h: 11, m: 0, dur: 45, type: "procedure", status: "done" },
    { key: "p4", day: off + 1, h: 10, m: 0, dur: 30, type: "follow-up", status: "done" },
    { key: "p5", day: off + 1, h: 14, m: 0, dur: 20, type: "follow-up", status: "done" },
    { key: "p3", day: off + 2, h: 9, m: 0, dur: 40, type: "new-patient", status: "done" },
    { key: "p9", day: off + 3, h: 13, m: 0, dur: 30, type: "checkup", status: "booked" },
    { key: "p10", day: off + 3, h: 15, m: 0, dur: 15, type: "telehealth", status: "booked" },
    { key: "p8", day: off + 4, h: 8, m: 0, dur: 30, type: "checkup", status: "booked" },
    { key: "p6", day: off + 4, h: 11, m: 0, dur: 20, type: "vaccine", status: "booked" },
  ].map((s) => ({
    patient_id: idByKey[s.key],
    provider: "Dr. Reyes",
    room: null,
    starts_at: atTime(s.day, s.h, s.m),
    duration_min: s.dur,
    type: s.type,
    status: s.status,
  }));

  await supabase.from("appointments").insert(withClinic([...today, ...restOfWeek]));

  console.log("Seeding invoices (revenue chart, last 8 weeks)…");
  const invoices = [];
  for (let week = 0; week < 8; week++) {
    const count = 3 + (week % 3);
    for (let i = 0; i < count; i++) {
      const key = PATIENTS[(week * 3 + i) % PATIENTS.length].key;
      const daysAgo = week * 7 + i;
      invoices.push({
        patient_id: idByKey[key],
        amount: (80 + ((week * 37 + i * 19) % 220)).toFixed(2),
        status: "paid",
        issued_at: atTime(-daysAgo, 9, 0),
        paid_at: atTime(-daysAgo, 9, 0),
      });
    }
  }
  invoices.push(
    { patient_id: idByKey.p8, amount: "240.00", status: "unpaid", issued_at: atTime(-10, 13, 30) },
    { patient_id: idByKey.p11, amount: "160.00", status: "unpaid", issued_at: atTime(-25, 11, 0) },
  );
  await supabase.from("invoices").insert(withClinic(invoices));

  console.log("Seeding activity log…");
  await supabase.from("activity_log").insert(withClinic([
    { actor: "Dr. Reyes", action: "muayeneyi tamamladı:", target: "Eleanor Whitfield", tone: "success", occurred_at: atTime(0, 8, 58) },
    { actor: "Nurse Patel", action: "kayıt yaptı:", target: "James O'Connor", tone: "info", occurred_at: atTime(0, 11, 2) },
    { actor: "Dr. Okafor", action: "reçete yazdı:", target: "Levothyroxine", tone: "neutral", occurred_at: atTime(-1, 13, 10) },
  ]));

  console.log("Backfilling patients.last_visit_at / next_appt_at…");
  const { data: visitMaxes } = await supabase.from("visits").select("patient_id, occurred_at");
  const lastVisitByPatient = {};
  for (const v of visitMaxes ?? []) {
    if (!lastVisitByPatient[v.patient_id] || v.occurred_at > lastVisitByPatient[v.patient_id]) {
      lastVisitByPatient[v.patient_id] = v.occurred_at;
    }
  }
  const { data: futureAppts } = await supabase
    .from("appointments")
    .select("patient_id, starts_at")
    .gt("starts_at", new Date().toISOString());
  const nextApptByPatient = {};
  for (const a of futureAppts ?? []) {
    if (!nextApptByPatient[a.patient_id] || a.starts_at < nextApptByPatient[a.patient_id]) {
      nextApptByPatient[a.patient_id] = a.starts_at;
    }
  }
  for (const [patientId, lastVisit] of Object.entries(lastVisitByPatient)) {
    await supabase.from("patients").update({ last_visit_at: lastVisit }).eq("id", patientId);
  }
  for (const [patientId, nextAppt] of Object.entries(nextApptByPatient)) {
    await supabase.from("patients").update({ next_appt_at: nextAppt }).eq("id", patientId);
  }

  console.log("Done. Seeded", PATIENTS.length, "patients with appointments, visits, prescriptions, docs, invoices and activity.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
