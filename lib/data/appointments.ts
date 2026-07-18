import { createClient } from "@/lib/supabase/server";
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
