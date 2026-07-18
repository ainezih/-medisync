/**
 * Shared data shapes for the app. Enum-like fields (status, type, sex) stay
 * bilingual via the *_LABEL dicts below, resolved client-side by useLang().
 * Free-text fields (conditions, allergies, visit notes, prescription
 * frequency, doc kind) are plain strings — whatever the clinic staff typed,
 * in whichever language they typed it in.
 */
import type { L } from "@/lib/i18n/config";

export type ApptStatus = "booked" | "checked-in" | "in-room" | "done" | "no-show";
export type ApptType = "checkup" | "follow-up" | "new-patient" | "telehealth" | "procedure" | "vaccine";
export type PatientStatus = "active" | "new" | "inactive" | "overdue";
export type Sex = "male" | "female" | "other";

export const STATUS_LABEL: Record<ApptStatus, { tr: string; en: string; var: string }> = {
  booked: { tr: "randevulu", en: "booked", var: "var(--color-muted-foreground)" },
  "checked-in": { tr: "kayıt yapıldı", en: "checked-in", var: "var(--color-status-checkedin)" },
  "in-room": { tr: "odada", en: "in-room", var: "var(--color-status-inroom)" },
  done: { tr: "tamamlandı", en: "done", var: "var(--color-status-done)" },
  "no-show": { tr: "gelmedi", en: "no-show", var: "var(--color-status-noshow)" },
};

export const TYPE_LABEL: Record<ApptType, L> = {
  checkup: { tr: "Kontrol", en: "Check-up" },
  "follow-up": { tr: "Takip", en: "Follow-up" },
  "new-patient": { tr: "Yeni hasta", en: "New patient" },
  telehealth: { tr: "Teletıp", en: "Telehealth" },
  procedure: { tr: "İşlem", en: "Procedure" },
  vaccine: { tr: "Aşı", en: "Vaccine" },
};

export const SEX_LABEL: Record<Sex, L> = {
  male: { tr: "Erkek", en: "Male" },
  female: { tr: "Kadın", en: "Female" },
  other: { tr: "Diğer", en: "Other" },
};

export const PATIENT_STATUS_LABEL: Record<PatientStatus, L> = {
  active: { tr: "aktif", en: "active" },
  new: { tr: "yeni", en: "new" },
  overdue: { tr: "gecikmiş", en: "overdue" },
  inactive: { tr: "pasif", en: "inactive" },
};

export const WEEKDAY_LABEL: Record<string, L> = {
  sun: { tr: "Paz", en: "Sun" },
  mon: { tr: "Pzt", en: "Mon" },
  tue: { tr: "Sal", en: "Tue" },
  wed: { tr: "Çar", en: "Wed" },
  thu: { tr: "Per", en: "Thu" },
  fri: { tr: "Cum", en: "Fri" },
  sat: { tr: "Cmt", en: "Sat" },
};

export interface DStat {
  key: string;
  label: L;
  value: string;
  delta?: number;
  icon: string;
  hint?: L;
  tone?: 1 | 2 | 3 | 4;
}

export interface ScheduleSlot {
  id: string;
  time: string;
  durationMin: number;
  patientId: string;
  patient: string;
  initials: string;
  type: ApptType;
  status: ApptStatus;
  provider: string;
  room?: string;
}

export interface QueueEntry {
  id: string;
  patient: string;
  initials: string;
  type: ApptType;
  waitMin: number;
  status: Extract<ApptStatus, "checked-in" | "in-room">;
  provider: string;
}

export interface Visit {
  id: string;
  date: string;
  reason: string;
  provider: string;
  note: string;
}

export interface Rx {
  id: string;
  drug: string;
  dose: string;
  freq: string;
  status: "active" | "completed" | "pending";
  prescribed: string;
}

export interface PatientDoc {
  id: string;
  name: string;
  kind: string;
  date: string;
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number | null;
  sex: Sex | null;
  mrn: string;
  phone: string;
  email: string;
  lastVisit: string | null;
  nextAppt?: string;
  status: PatientStatus;
  conditions: string[];
  allergies: string[];
  vitals: { bp: string; hr: string; bmi: string; temp: string };
  visits: Visit[];
  rx: Rx[];
  docs: PatientDoc[];
}

export interface RecentRx {
  id: string;
  patient: string;
  initials: string;
  drug: string;
  dose: string;
  freq: string;
  status: "active" | "pending" | "completed";
  at: string;
}

export interface DActivity {
  id: string;
  who: string;
  action: string;
  target: string;
  at: string;
  tone: "neutral" | "success" | "warning" | "info";
}

export interface CalEvent {
  id: string;
  day: string;
  start: string;
  durationMin: number;
  patient: string;
  type: ApptType;
  status: ApptStatus;
}

export interface AppointmentRow {
  id: string;
  patientId: string;
  patient: string;
  initials: string;
  provider: string;
  room: string | null;
  startsAt: string;
  durationMin: number;
  type: ApptType;
  status: ApptStatus;
  dailyRoomUrl: string | null;
}
