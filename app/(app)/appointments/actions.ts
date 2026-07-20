"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppointmentForAction, setDailyRoomUrl } from "@/lib/data/appointments";
import { sendAppointmentReminder } from "@/lib/twilio/send-reminder";
import { createRoom } from "@/lib/daily/create-room";
import { logActivity } from "@/lib/data/dashboard";

const APPT_TYPES = ["checkup", "follow-up", "new-patient", "telehealth", "procedure", "vaccine"] as const;

export async function createAppointmentAction(input: {
  patientId: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMin: number;
  type: string;
  room?: string;
  lang?: "tr" | "en";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const tr = input.lang !== "en";

  if (!input.patientId || !input.date || !input.time) {
    return { ok: false, error: tr ? "Hasta, tarih ve saat zorunlu." : "Patient, date and time are required." };
  }
  const type = (APPT_TYPES as readonly string[]).includes(input.type) ? input.type : "checkup";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: tr ? "Oturum bulunamadı." : "Not signed in." };
  }
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  // Non-admins can only book appointments under their own name — the picker hides
  // teammates for them too, but we don't trust the client for this.
  const providerId = me?.is_admin ? input.providerId : user.id;

  const { data: provider, error: provErr } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", providerId)
    .maybeSingle();
  if (provErr || !provider) {
    return { ok: false, error: tr ? "Sağlayıcı bulunamadı." : "Provider not found." };
  }

  // Turkey is fixed UTC+3 — pin the wall-clock time explicitly.
  const startsAt = new Date(`${input.date}T${input.time}:00+03:00`);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, error: tr ? "Geçersiz tarih/saat." : "Invalid date/time." };
  }

  const { data: patient } = await supabase.from("patients").select("name").eq("id", input.patientId).maybeSingle();

  const { error } = await supabase.from("appointments").insert({
    patient_id: input.patientId,
    provider: provider.full_name,
    provider_id: provider.id,
    room: input.room?.trim() || null,
    starts_at: startsAt.toISOString(),
    duration_min: Math.min(240, Math.max(5, input.durationMin || 30)),
    type,
    status: "booked",
  });
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("patients")
    .update({ next_appt_at: startsAt.toISOString() })
    .eq("id", input.patientId)
    .or(`next_appt_at.is.null,next_appt_at.gt.${startsAt.toISOString()}`);

  await logActivity("System", tr ? "randevu oluşturdu:" : "booked an appointment for", patient?.name ?? "", "info");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/patients");
  return { ok: true };
}

export async function sendReminderAction(appointmentId: string, lang: "tr" | "en" = "tr") {
  const appt = await getAppointmentForAction(appointmentId);
  if (!appt.patientPhone) {
    return { ok: false as const, error: lang === "tr" ? "Hastanın telefon numarası kayıtlı değil." : "Patient has no phone number on file." };
  }
  try {
    const { channel } = await sendAppointmentReminder({
      to: appt.patientPhone,
      patientName: appt.patient,
      startsAt: appt.startsAt,
      provider: appt.provider,
      lang,
    });
    const channelLabel = channel === "whatsapp" ? "WhatsApp" : "SMS";
    await logActivity(
      "System",
      lang === "tr" ? `${channelLabel} hatırlatma gönderdi:` : `sent a ${channelLabel} reminder to`,
      appt.patient,
      "info",
    );
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function joinTelehealthAction(appointmentId: string) {
  const appt = await getAppointmentForAction(appointmentId);
  if (appt.dailyRoomUrl) {
    return { ok: true as const, url: appt.dailyRoomUrl };
  }
  try {
    const room = await createRoom(`clinica-${appointmentId}`);
    await setDailyRoomUrl(appointmentId, room.url);
    await logActivity("System", "created a telehealth room for", appt.patient, "info");
    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    return { ok: true as const, url: room.url };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}
