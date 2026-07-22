import { NextResponse } from "next/server";
import {
  getAppointmentsDueForReminder,
  markReminderSent,
  setDailyRoomUrlAdmin,
  type ReminderKind,
} from "@/lib/data/appointments";
import { sendAppointmentReminder, sendTelehealthLink } from "@/lib/twilio/send-reminder";
import { createRoom } from "@/lib/daily/create-room";
import { createAdminClient } from "@/lib/supabase/server";

// Cross-clinic + timestamp-driven — never cache, always hit the DB fresh.
export const dynamic = "force-dynamic";

async function logActivityAdmin(clinicId: string, action: string, target: string) {
  const supabase = createAdminClient();
  await supabase.from("activity_log").insert({ clinic_id: clinicId, actor: "System", action, target, tone: "info" });
}

async function sendDueReminders(kind: ReminderKind) {
  const due = await getAppointmentsDueForReminder(kind);
  let sent = 0;
  let failed = 0;

  for (const appt of due) {
    try {
      let channel: "whatsapp" | "sms";
      if (appt.type === "telehealth") {
        let url = appt.dailyRoomUrl;
        if (!url) {
          const expiresAt = new Date(new Date(appt.startsAt).getTime() + appt.durationMin * 60_000 + 60 * 60_000);
          const room = await createRoom(`clinica-${appt.id}`, expiresAt);
          await setDailyRoomUrlAdmin(appt.id, room.url);
          url = room.url;
        }
        ({ channel } = await sendTelehealthLink({ to: appt.patientPhone, patientName: appt.patient, startsAt: appt.startsAt, url, lang: "tr" }));
      } else {
        ({ channel } = await sendAppointmentReminder({ to: appt.patientPhone, patientName: appt.patient, startsAt: appt.startsAt, provider: appt.provider, lang: "tr" }));
      }
      await markReminderSent(appt.id, kind);
      const channelLabel = channel === "whatsapp" ? "WhatsApp" : "SMS";
      await logActivityAdmin(appt.clinicId, `${channelLabel} ile ${kind === "24h" ? "24 saat önce" : "1 saat önce"} hatırlatma gönderdi:`, appt.patient);
      sent++;
    } catch {
      failed++;
    }
  }

  return { kind, due: due.length, sent, failed };
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const [h24, h1] = await Promise.all([sendDueReminders("24h"), sendDueReminders("1h")]);
  return NextResponse.json({ ok: true, results: [h24, h1] });
}
