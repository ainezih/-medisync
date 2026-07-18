/**
 * Demo data — what makes Clinica feel alive with zero API keys. Free-text
 * fields (conditions, allergies, visit notes, prescription frequency, doc
 * kind) are plain strings, matching how a real clinic's own records work.
 *
 * ⚠️ Everything here is FICTIONAL — patients, notes, prescriptions and amounts
 * are invented for demonstration only. There is no real PHI.
 *
 * Once Supabase is connected, lib/data/*.ts reads real rows instead — this
 * file is also the source dataset for scripts/seed.ts.
 */
export {
  STATUS_LABEL,
  TYPE_LABEL,
  SEX_LABEL,
  PATIENT_STATUS_LABEL,
  type ApptStatus,
  type ApptType,
  type PatientStatus,
  type Sex,
  type DStat,
  type ScheduleSlot,
  type QueueEntry,
  type Visit,
  type Rx,
  type PatientDoc,
  type Patient,
  type RecentRx,
  type DActivity,
  type CalEvent,
} from "@/lib/data/types";
import type { L } from "@/lib/i18n/config";
import type {
  DStat,
  ScheduleSlot,
  QueueEntry,
  Patient,
  RecentRx,
  DActivity,
  CalEvent,
  ApptType,
} from "@/lib/data/types";

/* ── Top stat row ─────────────────────────────────────────────────────────── */
const vsLastWeek: L = { tr: "geçen haftaya göre", en: "vs last week" };

export const stats: DStat[] = [
  { key: "appts", label: { tr: "Bugünkü randevular", en: "Today's appointments" }, value: "24", delta: 9.1, icon: "calendar-days", hint: { tr: "6 kayıt yapıldı", en: "6 checked in" }, tone: 1 },
  { key: "patients", label: { tr: "Aktif hasta", en: "Active patients" }, value: "1,284", delta: 4.2, icon: "users", hint: vsLastWeek, tone: 2 },
  { key: "revenue", label: { tr: "Bugünkü gelir", en: "Today's revenue" }, value: "$3,940", delta: 12.4, icon: "dollar-sign", hint: { tr: "tahsil edildi", en: "collected" }, tone: 3 },
  { key: "noshows", label: { tr: "Gelmeyen (bu ay)", en: "No-shows (this mo.)" }, value: "2.1%", delta: -30.0, icon: "user-x", hint: { tr: "hatırlatma sayesinde", en: "thanks to reminders" }, tone: 4 },
];

/* ── Today's schedule timeline ────────────────────────────────────────────── */
export const schedule: ScheduleSlot[] = [
  { id: "s1", time: "08:30", durationMin: 30, patientId: "p1", patient: "Eleanor Whitfield", initials: "EW", type: "follow-up", status: "done", provider: "Dr. Reyes", room: "2" },
  { id: "s2", time: "09:00", durationMin: 20, patientId: "p2", patient: "Marcus Bennett", initials: "MB", type: "checkup", status: "done", provider: "Dr. Reyes", room: "1" },
  { id: "s3", time: "09:30", durationMin: 40, patientId: "p3", patient: "Priya Nair", initials: "PN", type: "new-patient", status: "in-room", provider: "Dr. Okafor", room: "3" },
  { id: "s4", time: "10:15", durationMin: 15, patientId: "p4", patient: "Daniel Cho", initials: "DC", type: "telehealth", status: "checked-in", provider: "Dr. Reyes" },
  { id: "s5", time: "10:45", durationMin: 30, patientId: "p5", patient: "Sofia Romano", initials: "SR", type: "follow-up", status: "checked-in", provider: "Dr. Okafor", room: "2" },
  { id: "s6", time: "11:15", durationMin: 20, patientId: "p6", patient: "James O'Connor", initials: "JO", type: "vaccine", status: "checked-in", provider: "Nurse Patel" },
  { id: "s7", time: "11:45", durationMin: 45, patientId: "p7", patient: "Aisha Rahman", initials: "AR", type: "procedure", status: "booked", provider: "Dr. Okafor", room: "3" },
  { id: "s8", time: "13:30", durationMin: 30, patientId: "p8", patient: "Thomas Müller", initials: "TM", type: "checkup", status: "booked", provider: "Dr. Reyes", room: "1" },
  { id: "s9", time: "14:00", durationMin: 20, patientId: "p9", patient: "Grace Lindqvist", initials: "GL", type: "follow-up", status: "booked", provider: "Dr. Reyes", room: "2" },
  { id: "s10", time: "14:30", durationMin: 15, patientId: "p10", patient: "Hassan Demir", initials: "HD", type: "telehealth", status: "booked", provider: "Dr. Okafor" },
];

/* ── Waiting room / queue ─────────────────────────────────────────────────── */
export const queue: QueueEntry[] = [
  { id: "q1", patient: "Priya Nair", initials: "PN", type: "new-patient", waitMin: 4, status: "in-room", provider: "Dr. Okafor" },
  { id: "q2", patient: "Daniel Cho", initials: "DC", type: "telehealth", waitMin: 9, status: "checked-in", provider: "Dr. Reyes" },
  { id: "q3", patient: "Sofia Romano", initials: "SR", type: "follow-up", waitMin: 12, status: "checked-in", provider: "Dr. Okafor" },
  { id: "q4", patient: "James O'Connor", initials: "JO", type: "vaccine", waitMin: 18, status: "checked-in", provider: "Nurse Patel" },
];

/* ── Patient roster + charts ──────────────────────────────────────────────── */
const freqDaily = "günde 1";
const freqBid = "günde 2";
const freqPrn = "gerektiğinde";

export const patients: Patient[] = [
  {
    id: "p1", name: "Eleanor Whitfield", initials: "EW", age: 67, sex: "female",
    mrn: "MRN-04821", phone: "+1 (415) 555-0142", email: "eleanor.w@example.com",
    lastVisit: "2026-06-14T08:30:00Z", nextAppt: "2026-07-12T09:00:00Z", status: "active",
    conditions: ["Hipertansiyon", "Tip 2 Diyabet"],
    allergies: ["Penisilin"],
    vitals: { bp: "138/86", hr: "74", bmi: "27.4", temp: "36.7°C" },
    visits: [
      { id: "v1", date: "2026-06-14T08:30:00Z", reason: "HT takibi", provider: "Dr. Reyes", note: "Kan basıncı sınırda yüksek; lisinopril dozu artırıldı." },
      { id: "v2", date: "2026-05-02T10:00:00Z", reason: "Yıllık kontrol", provider: "Dr. Reyes", note: "HbA1c %7.1, diyet danışmanlığı verildi." },
      { id: "v3", date: "2026-03-18T09:15:00Z", reason: "Reçete yenileme", provider: "Dr. Okafor", note: "Metformin yenilendi, yan etki yok." },
    ],
    rx: [
      { id: "rx1", drug: "Lisinopril", dose: "20 mg", freq: freqDaily, status: "active", prescribed: "2026-06-14T08:40:00Z" },
      { id: "rx2", drug: "Metformin", dose: "500 mg", freq: freqBid, status: "active", prescribed: "2026-03-18T09:25:00Z" },
    ],
    docs: [
      { id: "d1", name: "Lab — Lipid Panel", kind: "Laboratuvar", date: "2026-05-02" },
      { id: "d2", name: "ECG Report", kind: "Görüntüleme", date: "2026-05-02" },
    ],
  },
  {
    id: "p2", name: "Marcus Bennett", initials: "MB", age: 41, sex: "male",
    mrn: "MRN-04822", phone: "+1 (415) 555-0188", email: "marcus.b@example.com",
    lastVisit: "2026-06-14T09:00:00Z", nextAppt: "2026-09-10T11:00:00Z", status: "active",
    conditions: ["Astım"],
    allergies: [],
    vitals: { bp: "122/78", hr: "68", bmi: "24.1", temp: "36.5°C" },
    visits: [
      { id: "v4", date: "2026-06-14T09:00:00Z", reason: "Kontrol", provider: "Dr. Reyes", note: "Astım iyi kontrol altında; inhaler tekniği gözden geçirildi." },
      { id: "v5", date: "2026-02-20T14:30:00Z", reason: "Üst solunum yolu", provider: "Dr. Reyes", note: "Viral, destekleyici tedavi." },
    ],
    rx: [
      { id: "rx3", drug: "Albuterol", dose: "90 mcg", freq: freqPrn, status: "active", prescribed: "2026-06-14T09:10:00Z" },
    ],
    docs: [{ id: "d3", name: "Spirometry", kind: "Laboratuvar", date: "2026-02-20" }],
  },
  {
    id: "p3", name: "Priya Nair", initials: "PN", age: 29, sex: "female",
    mrn: "MRN-04901", phone: "+1 (415) 555-0210", email: "priya.n@example.com",
    lastVisit: "2026-06-14T09:30:00Z", nextAppt: undefined, status: "new",
    conditions: [],
    allergies: ["Lateks"],
    vitals: { bp: "118/72", hr: "70", bmi: "22.0", temp: "36.6°C" },
    visits: [
      { id: "v6", date: "2026-06-14T09:30:00Z", reason: "Yeni hasta — genel", provider: "Dr. Okafor", note: "Kayıt tamamlandı; başlangıç tetkikleri istendi." },
    ],
    rx: [],
    docs: [{ id: "d4", name: "Intake Form", kind: "Form", date: "2026-06-14" }],
  },
  {
    id: "p4", name: "Daniel Cho", initials: "DC", age: 53, sex: "male",
    mrn: "MRN-04733", phone: "+1 (415) 555-0119", email: "daniel.c@example.com",
    lastVisit: "2026-05-28T15:00:00Z", nextAppt: "2026-06-14T10:15:00Z", status: "active",
    conditions: ["Yüksek kolesterol"],
    allergies: [],
    vitals: { bp: "128/80", hr: "72", bmi: "26.8", temp: "36.4°C" },
    visits: [
      { id: "v7", date: "2026-05-28T15:00:00Z", reason: "Lipid takibi", provider: "Dr. Reyes", note: "LDL düştü; statin sürdürülüyor." },
    ],
    rx: [{ id: "rx4", drug: "Atorvastatin", dose: "10 mg", freq: freqDaily, status: "active", prescribed: "2026-05-28T15:10:00Z" }],
    docs: [{ id: "d5", name: "Lab — Lipid Panel", kind: "Laboratuvar", date: "2026-05-28" }],
  },
  {
    id: "p5", name: "Sofia Romano", initials: "SR", age: 34, sex: "female",
    mrn: "MRN-04812", phone: "+1 (415) 555-0177", email: "sofia.r@example.com",
    lastVisit: "2026-04-11T11:00:00Z", nextAppt: "2026-06-14T10:45:00Z", status: "active",
    conditions: ["Migren"],
    allergies: ["Sülfa"],
    vitals: { bp: "115/70", hr: "66", bmi: "21.5", temp: "36.6°C" },
    visits: [
      { id: "v8", date: "2026-04-11T11:00:00Z", reason: "Migren yönetimi", provider: "Dr. Okafor", note: "Sıklık azaldı; tetikleyici günlüğü öneriliyor." },
    ],
    rx: [{ id: "rx5", drug: "Sumatriptan", dose: "50 mg", freq: freqPrn, status: "active", prescribed: "2026-04-11T11:10:00Z" }],
    docs: [],
  },
  {
    id: "p6", name: "James O'Connor", initials: "JO", age: 8, sex: "male",
    mrn: "MRN-05002", phone: "+1 (415) 555-0144", email: "oconnor.family@example.com",
    lastVisit: "2026-06-01T09:30:00Z", nextAppt: "2026-06-14T11:15:00Z", status: "active",
    conditions: [],
    allergies: [],
    vitals: { bp: "100/64", hr: "88", bmi: "16.2", temp: "36.8°C" },
    visits: [
      { id: "v9", date: "2026-06-01T09:30:00Z", reason: "Çocuk kontrolü", provider: "Nurse Patel", note: "Büyüme normal; aşı takvimi güncel." },
    ],
    rx: [],
    docs: [{ id: "d6", name: "Growth Chart", kind: "Form", date: "2026-06-01" }],
  },
  {
    id: "p7", name: "Aisha Rahman", initials: "AR", age: 46, sex: "female",
    mrn: "MRN-04688", phone: "+1 (415) 555-0166", email: "aisha.r@example.com",
    lastVisit: "2026-05-19T13:00:00Z", nextAppt: "2026-06-14T11:45:00Z", status: "active",
    conditions: ["Hipotiroidi"],
    allergies: [],
    vitals: { bp: "120/76", hr: "70", bmi: "25.3", temp: "36.5°C" },
    visits: [
      { id: "v10", date: "2026-05-19T13:00:00Z", reason: "Tiroid takibi", provider: "Dr. Okafor", note: "TSH normal aralıkta; doz sabit." },
    ],
    rx: [{ id: "rx6", drug: "Levothyroxine", dose: "75 mcg", freq: freqDaily, status: "active", prescribed: "2026-05-19T13:10:00Z" }],
    docs: [{ id: "d7", name: "Lab — TSH/T4", kind: "Laboratuvar", date: "2026-05-19" }],
  },
  {
    id: "p8", name: "Thomas Müller", initials: "TM", age: 58, sex: "male",
    mrn: "MRN-04501", phone: "+1 (415) 555-0133", email: "thomas.m@example.com",
    lastVisit: "2026-03-30T13:30:00Z", nextAppt: "2026-06-14T13:30:00Z", status: "overdue",
    conditions: ["Bel ağrısı"],
    allergies: ["Aspirin"],
    vitals: { bp: "134/84", hr: "76", bmi: "28.9", temp: "36.6°C" },
    visits: [
      { id: "v11", date: "2026-03-30T13:30:00Z", reason: "Bel ağrısı", provider: "Dr. Reyes", note: "Fizik tedaviye yönlendirildi." },
    ],
    rx: [{ id: "rx7", drug: "Naproxen", dose: "500 mg", freq: freqBid, status: "completed", prescribed: "2026-03-30T13:40:00Z" }],
    docs: [{ id: "d8", name: "MRI — Lumbar", kind: "Görüntüleme", date: "2026-03-30" }],
  },
  {
    id: "p9", name: "Grace Lindqvist", initials: "GL", age: 72, sex: "female",
    mrn: "MRN-04299", phone: "+1 (415) 555-0155", email: "grace.l@example.com",
    lastVisit: "2026-06-02T14:00:00Z", nextAppt: "2026-06-14T14:00:00Z", status: "active",
    conditions: ["Osteoporoz", "Hipertansiyon"],
    allergies: [],
    vitals: { bp: "142/88", hr: "72", bmi: "23.7", temp: "36.5°C" },
    visits: [
      { id: "v12", date: "2026-06-02T14:00:00Z", reason: "Kemik yoğunluğu takibi", provider: "Dr. Reyes", note: "D vitamini eklendi; düşme önlemi danışmanlığı." },
    ],
    rx: [{ id: "rx8", drug: "Alendronate", dose: "70 mg", freq: "haftada 1", status: "active", prescribed: "2026-06-02T14:10:00Z" }],
    docs: [{ id: "d9", name: "DEXA Scan", kind: "Görüntüleme", date: "2026-06-02" }],
  },
  {
    id: "p10", name: "Hassan Demir", initials: "HD", age: 38, sex: "male",
    mrn: "MRN-04955", phone: "+1 (415) 555-0122", email: "hassan.d@example.com",
    lastVisit: "2026-05-15T10:00:00Z", nextAppt: "2026-06-14T14:30:00Z", status: "active",
    conditions: ["Anksiyete"],
    allergies: [],
    vitals: { bp: "124/79", hr: "74", bmi: "23.0", temp: "36.7°C" },
    visits: [
      { id: "v13", date: "2026-05-15T10:00:00Z", reason: "Teletıp takibi", provider: "Dr. Okafor", note: "İyi yanıt; terapi sürüyor." },
    ],
    rx: [{ id: "rx9", drug: "Sertraline", dose: "50 mg", freq: freqDaily, status: "active", prescribed: "2026-05-15T10:10:00Z" }],
    docs: [],
  },
  {
    id: "p11", name: "Olivia Carter", initials: "OC", age: 24, sex: "female",
    mrn: "MRN-05011", phone: "+1 (415) 555-0190", email: "olivia.c@example.com",
    lastVisit: "2026-01-22T11:30:00Z", nextAppt: undefined, status: "inactive",
    conditions: [],
    allergies: [],
    vitals: { bp: "116/72", hr: "68", bmi: "21.8", temp: "36.6°C" },
    visits: [
      { id: "v14", date: "2026-01-22T11:30:00Z", reason: "Genel kontrol", provider: "Dr. Reyes", note: "Sağlıklı; rutin takip." },
    ],
    rx: [],
    docs: [],
  },
  {
    id: "p12", name: "Robert Fields", initials: "RF", age: 61, sex: "male",
    mrn: "MRN-04412", phone: "+1 (415) 555-0101", email: "robert.f@example.com",
    lastVisit: "2026-06-09T15:30:00Z", nextAppt: "2026-08-01T10:00:00Z", status: "active",
    conditions: ["KOAH", "Hipertansiyon"],
    allergies: ["Kodein"],
    vitals: { bp: "140/90", hr: "80", bmi: "29.5", temp: "36.8°C" },
    visits: [
      { id: "v15", date: "2026-06-09T15:30:00Z", reason: "KOAH takibi", provider: "Dr. Okafor", note: "Stabil; inhaler rejimi optimize edildi." },
    ],
    rx: [{ id: "rx10", drug: "Tiotropium", dose: "18 mcg", freq: freqDaily, status: "active", prescribed: "2026-06-09T15:40:00Z" }],
    docs: [{ id: "d10", name: "Chest X-Ray", kind: "Görüntüleme", date: "2026-06-09" }],
  },
];

/* ── Recent prescriptions panel ───────────────────────────────────────────── */
export const recentRx: RecentRx[] = [
  { id: "r1", patient: "Eleanor Whitfield", initials: "EW", drug: "Lisinopril", dose: "20 mg", freq: freqDaily, status: "active", at: "2026-06-14T08:40:00Z" },
  { id: "r2", patient: "Marcus Bennett", initials: "MB", drug: "Albuterol", dose: "90 mcg", freq: freqPrn, status: "active", at: "2026-06-14T09:10:00Z" },
  { id: "r3", patient: "Priya Nair", initials: "PN", drug: "Cetirizine", dose: "10 mg", freq: freqDaily, status: "pending", at: "2026-06-14T09:35:00Z" },
  { id: "r4", patient: "Grace Lindqvist", initials: "GL", drug: "Alendronate", dose: "70 mg", freq: "haftada 1", status: "active", at: "2026-06-14T09:50:00Z" },
  { id: "r5", patient: "Hassan Demir", initials: "HD", drug: "Sertraline", dose: "50 mg", freq: freqDaily, status: "active", at: "2026-06-13T16:20:00Z" },
];

/* ── Revenue & visits chart (last 8 weeks) ────────────────────────────────── */
export const revenueMeta = {
  title: { tr: "Gelir & ziyaretler", en: "Revenue & visits" } as L,
  subtitle: { tr: "Son 8 hafta", en: "Last 8 weeks" } as L,
  delta: "+12.4%",
  total: "$28,940",
};

export const revenue: { label: string; value: number; visits: number }[] = [
  { label: "W1", value: 2980, visits: 92 },
  { label: "W2", value: 3120, visits: 98 },
  { label: "W3", value: 2840, visits: 88 },
  { label: "W4", value: 3460, visits: 110 },
  { label: "W5", value: 3320, visits: 104 },
  { label: "W6", value: 3780, visits: 118 },
  { label: "W7", value: 3640, visits: 114 },
  { label: "W8", value: 3940, visits: 124 },
];

/* ── Appointment-type breakdown ───────────────────────────────────────────── */
export const apptMix: { type: ApptType; value: number }[] = [
  { type: "checkup", value: 38 },
  { type: "follow-up", value: 31 },
  { type: "new-patient", value: 14 },
  { type: "telehealth", value: 11 },
  { type: "procedure", value: 6 },
];

/* ── Activity feed ────────────────────────────────────────────────────────── */
export const activity: DActivity[] = [
  { id: "a1", who: "Dr. Reyes", action: "muayeneyi tamamladı:", target: "Eleanor Whitfield", at: "2026-06-14T08:58:00Z", tone: "success" },
  { id: "a2", who: "System", action: "SMS hatırlatma gönderdi:", target: "8 patients", at: "2026-06-14T08:00:00Z", tone: "info" },
  { id: "a3", who: "Nurse Patel", action: "kayıt yaptı:", target: "James O'Connor", at: "2026-06-14T11:02:00Z", tone: "info" },
  { id: "a4", who: "System", action: "gelmedi olarak işaretledi:", target: "1 appointment", at: "2026-06-13T16:40:00Z", tone: "warning" },
  { id: "a5", who: "Dr. Okafor", action: "reçete yazdı:", target: "Levothyroxine", at: "2026-06-13T13:10:00Z", tone: "neutral" },
];

/* ── Billing snapshot (small dashboard card) ──────────────────────────────── */
export const billing = {
  collectedToday: { label: { tr: "Bugün tahsil edilen", en: "Collected today" } as L, value: "$3,940" },
  outstanding: { label: { tr: "Bekleyen bakiye", en: "Outstanding balance" } as L, value: "$1,280", count: 6 },
  claims: { label: { tr: "Bekleyen talepler", en: "Pending claims" } as L, value: "4" },
};

/* ── Appointment calendar (week view) ─────────────────────────────────────── */
export const weekDays: { key: string; label: L; date: string; today?: boolean }[] = [
  { key: "mon", label: { tr: "Pzt", en: "Mon" }, date: "9" },
  { key: "tue", label: { tr: "Sal", en: "Tue" }, date: "10" },
  { key: "wed", label: { tr: "Çar", en: "Wed" }, date: "11" },
  { key: "thu", label: { tr: "Per", en: "Thu" }, date: "12" },
  { key: "fri", label: { tr: "Cum", en: "Fri" }, date: "13" },
  { key: "sat", label: { tr: "Cmt", en: "Sat" }, date: "14", today: true },
];

export const calendarHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

export const calendarEvents: CalEvent[] = [
  { id: "c1", day: "mon", start: "09:00", durationMin: 30, patient: "M. Bennett", type: "checkup", status: "done" },
  { id: "c2", day: "mon", start: "11:00", durationMin: 45, patient: "A. Rahman", type: "procedure", status: "done" },
  { id: "c3", day: "tue", start: "10:00", durationMin: 30, patient: "D. Cho", type: "follow-up", status: "done" },
  { id: "c4", day: "tue", start: "14:00", durationMin: 20, patient: "S. Romano", type: "follow-up", status: "done" },
  { id: "c5", day: "wed", start: "09:00", durationMin: 40, patient: "P. Nair", type: "new-patient", status: "done" },
  { id: "c6", day: "thu", start: "13:00", durationMin: 30, patient: "G. Lindqvist", type: "checkup", status: "booked" },
  { id: "c7", day: "thu", start: "15:00", durationMin: 15, patient: "H. Demir", type: "telehealth", status: "booked" },
  { id: "c8", day: "fri", start: "08:00", durationMin: 30, patient: "T. Müller", type: "checkup", status: "booked" },
  { id: "c9", day: "fri", start: "11:00", durationMin: 20, patient: "J. O'Connor", type: "vaccine", status: "booked" },
  { id: "c10", day: "sat", start: "08:00", durationMin: 30, patient: "E. Whitfield", type: "follow-up", status: "done" },
  { id: "c11", day: "sat", start: "09:00", durationMin: 20, patient: "M. Bennett", type: "checkup", status: "done" },
  { id: "c12", day: "sat", start: "10:00", durationMin: 40, patient: "P. Nair", type: "new-patient", status: "in-room" },
  { id: "c13", day: "sat", start: "13:00", durationMin: 30, patient: "T. Müller", type: "checkup", status: "booked" },
];

/* ── Open slots a receptionist could book into (used by patients/appts) ───── */
export const openSlots = ["10:30", "11:30", "13:00", "15:30", "16:00"];

/* Providers for filters. */
export const providers = ["Dr. Reyes", "Dr. Okafor", "Nurse Patel"];
