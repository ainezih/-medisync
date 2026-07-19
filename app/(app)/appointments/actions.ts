"use server";

import { revalidatePath } from "next/cache";
import { getAppointmentForAction, setDailyRoomUrl } from "@/lib/data/appointments";
import { sendAppointmentReminder } from "@/lib/twilio/send-reminder";
import { createRoom } from "@/lib/daily/create-room";
import { logActivity } from "@/lib/data/dashboard";

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
