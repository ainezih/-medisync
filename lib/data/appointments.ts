import { createClient, createAdminClient } from "@/lib/supabase/server";
import { DAY_KEY_BY_INDEX, timeOf } from "@/lib/data/calendar";
import type { ScheduleSlot, QueueEntry, CalEvent, AppointmentRow, ApptType, ApptStatus } from "@/lib/data/types";

const FALLBACK_PROVIDERS = ["Dr. Reyes", "Dr. Okafor", "Nurse Patel"];

type ApptRow = {
  id: string;
  patient_id: string;
  provider: string;
  room: string | null;
  starts_at: string;
  duration_min: number;
  type: ApptType;
  status: ApptStatus;
  daily_room_url: string | null;
  patients: { name: string; initials: string } | { name: string; initials: string }[] | null;
};

function patientOf(r: ApptRow) {
  return Array.isArray(r.patients) ? r.patients[0] : r.patients;
}

/** Today's appointments, earliest first — powers the dashboard timeline. */
export async function getTodaySchedule(): Promise<ScheduleSlot[]> {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from("appointments")
    .select("id, patient_id, provider, room, starts_at, duration_min, type, status, daily_room_url, patients(name, initials)")
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw new Error(`getTodaySchedule: ${error.message}`);

  return ((data ?? []) as unknown as ApptRow[]).map((r) => {
    const p = patientOf(r);
    return {
      id: r.id,
      time: timeOf(r.starts_at),
      durationMin: r.duration_min,
      patientId: r.patient_id,
      patient: p?.name ?? "",
      initials: p?.initials ?? "",
      type: r.type,
      status: r.status,
      provider: r.provider,
      room: r.room ?? undefined,
    };
  });
}

/** Checked-in / in-room patients from today's schedule — the waiting room. */
export async function getQueue(): Promise<QueueEntry[]> {
  const schedule = await getTodaySchedule();
  const now = Date.now();
  return schedule
    .filter((s): s is ScheduleSlot & { status: "checked-in" | "in-room" } => s.status === "checked-in" || s.status === "in-room")
    .map((s) => {
      const [h, m] = s.time.split(":").map(Number);
      const startedAt = new Date();
      startedAt.setHours(h, m, 0, 0);
      return {
        id: s.id,
        patient: s.patient,
        initials: s.initials,
        type: s.type,
        waitMin: Math.max(0, Math.round((now - startedAt.getTime()) / 60000)),
        status: s.status,
        provider: s.provider,
      };
    });
}

/** All appointments in the Mon–Sat week containing `weekStart` — powers the calendar grid. */
export async function getWeekCalendar(weekStart: Date): Promise<CalEvent[]> {
  const supabase = await createClient();
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const { data, error } = await supabase
    .from("appointments")
    .select("id, starts_at, duration_min, type, status, patients(name, initials)")
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw new Error(`getWeekCalendar: ${error.message}`);

  return ((data ?? []) as unknown as ApptRow[]).map((r) => {
    const p = patientOf(r);
    return {
      id: r.id,
      day: DAY_KEY_BY_INDEX[new Date(r.starts_at).getDay()],
      start: timeOf(r.starts_at),
      durationMin: r.duration_min,
      patient: p?.name ?? "",
      type: r.type,
      status: r.status,
    };
  });
}

/** Distinct providers seen on the calendar; falls back to a sane default when the clinic has none yet. */
export async function getProviders(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("appointments").select("provider");
  if (error) throw new Error(`getProviders: ${error.message}`);
  const set = new Set((data ?? []).map((r) => r.provider).filter(Boolean));
  return set.size ? Array.from(set) : FALLBACK_PROVIDERS;
}

/** Lightweight id+name roster for pickers (RLS keeps it clinic-scoped). */
export async function listPatientOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("patients").select("id, name").order("name");
  if (error) throw new Error(`listPatientOptions: ${error.message}`);
  return data ?? [];
}

/**
 * The provider picker when booking. Admins see the whole clinic staff and can
 * book on anyone's behalf; everyone else only sees themselves — they can only
 * book their own appointments.
 */
export async function listClinicMembers(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: me } = await supabase.from("profiles").select("id, full_name, is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) {
    return me?.full_name ? [{ id: me.id, name: me.full_name }] : [];
  }

  const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name");
  if (error) throw new Error(`listClinicMembers: ${error.message}`);
  return (data ?? []).map((p) => ({ id: p.id, name: p.full_name ?? "" })).filter((p) => p.name);
}

/** Single appointment with patient contact info — used by the Twilio/Daily server actions. */
export async function getAppointmentForAction(id: string): Promise<AppointmentRow & { patientPhone: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, patient_id, provider, room, starts_at, duration_min, type, status, daily_room_url, patients(name, initials, phone)")
    .eq("id", id)
    .single();
  if (error) throw new Error(`getAppointmentForAction: ${error.message}`);
  const row = data as unknown as ApptRow & { patients: { name: string; initials: string; phone: string | null } | null };
  const p = patientOf(row) as { name: string; initials: string; phone?: string | null } | undefined;
  return {
    id: row.id,
    patientId: row.patient_id,
    patient: p?.name ?? "",
    initials: p?.initials ?? "",
    provider: row.provider,
    room: row.room,
    startsAt: row.starts_at,
    durationMin: row.duration_min,
    type: row.type,
    status: row.status,
    dailyRoomUrl: row.daily_room_url,
    patientPhone: p?.phone ?? "",
  };
}

export async function setDailyRoomUrl(appointmentId: string, url: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ daily_room_url: url }).eq("id", appointmentId);
  if (error) throw new Error(`setDailyRoomUrl: ${error.message}`);
}

export type ReminderKind = "24h" | "1h";

export type ReminderDue = {
  id: string;
  clinicId: string;
  patient: string;
  patientPhone: string;
  provider: string;
  startsAt: string;
  durationMin: number;
  type: ApptType;
  dailyRoomUrl: string | null;
};

/**
 * Appointments whose 24h-before or 1h-before reminder window has just
 * arrived and hasn't been sent yet. Cross-clinic (service-role client, no
 * RLS) — only ever called from the reminders cron route, never from a
 * user-facing action.
 *
 * The window is [target - 15min, target) so a job running every ~15 minutes
 * catches each appointment's reminder exactly once as "now" advances.
 */
export async function getAppointmentsDueForReminder(kind: ReminderKind): Promise<ReminderDue[]> {
  const supabase = createAdminClient();
  const sentColumn = kind === "24h" ? "reminder_24h_sent_at" : "reminder_1h_sent_at";
  const targetMs = kind === "24h" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
  const now = Date.now();
  const windowStart = new Date(now + targetMs - 15 * 60 * 1000).toISOString();
  const windowEnd = new Date(now + targetMs).toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .select("id, clinic_id, provider, starts_at, duration_min, type, daily_room_url, patients(name, phone)")
    .is(sentColumn, null)
    .gte("starts_at", windowStart)
    .lt("starts_at", windowEnd)
    .not("status", "in", "(done,no-show)");
  if (error) throw new Error(`getAppointmentsDueForReminder: ${error.message}`);

  type Row = {
    id: string;
    clinic_id: string;
    provider: string;
    starts_at: string;
    duration_min: number;
    type: ApptType;
    daily_room_url: string | null;
    patients: { name: string; phone: string | null } | { name: string; phone: string | null }[] | null;
  };

  return ((data ?? []) as unknown as Row[])
    .map((r) => {
      const p = Array.isArray(r.patients) ? r.patients[0] : r.patients;
      return {
        id: r.id,
        clinicId: r.clinic_id,
        patient: p?.name ?? "",
        patientPhone: p?.phone ?? "",
        provider: r.provider,
        startsAt: r.starts_at,
        durationMin: r.duration_min,
        type: r.type,
        dailyRoomUrl: r.daily_room_url,
      };
    })
    .filter((r) => r.patientPhone);
}

export async function markReminderSent(appointmentId: string, kind: ReminderKind): Promise<void> {
  const supabase = createAdminClient();
  const column = kind === "24h" ? "reminder_24h_sent_at" : "reminder_1h_sent_at";
  const { error } = await supabase
    .from("appointments")
    .update({ [column]: new Date().toISOString() })
    .eq("id", appointmentId);
  if (error) throw new Error(`markReminderSent: ${error.message}`);
}

export async function setDailyRoomUrlAdmin(appointmentId: string, url: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("appointments").update({ daily_room_url: url }).eq("id", appointmentId);
  if (error) throw new Error(`setDailyRoomUrlAdmin: ${error.message}`);
}
