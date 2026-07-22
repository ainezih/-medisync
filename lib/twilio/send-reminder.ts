import twilio from "twilio";

/**
 * Notification channel policy (decided 2026-07-20): WhatsApp first, SMS
 * fallback. WhatsApp requires TWILIO_WHATSAPP_FROM (an approved WhatsApp
 * sender, e.g. "+14155238886") — until it is set, or when a WhatsApp send
 * fails (recipient has no WhatsApp, template not approved yet, …), we fall
 * back to plain SMS via TWILIO_FROM_NUMBER.
 *
 * Note: WhatsApp sends here are freeform text, which Meta only allows within
 * a 24h customer-initiated session window. Proactive sends (like the
 * reminders cron) will frequently fail that check and fall back to SMS —
 * that's expected until an approved WhatsApp message template is set up.
 */
async function sendViaWhatsappOrSms(to: string, body: string): Promise<{ sid: string; channel: "whatsapp" | "sms" }> {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (whatsappFrom) {
    try {
      const message = await client.messages.create({
        to: `whatsapp:${to}`,
        from: `whatsapp:${whatsappFrom}`,
        body,
      });
      return { sid: message.sid, channel: "whatsapp" };
    } catch {
      // WhatsApp unavailable for this recipient — fall through to SMS.
    }
  }

  const message = await client.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER!,
    body,
  });

  return { sid: message.sid, channel: "sms" };
}

function formatWhen(startsAt: string, lang: "tr" | "en") {
  return new Date(startsAt).toLocaleString(lang === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function sendAppointmentReminder(params: {
  to: string;
  patientName: string;
  startsAt: string;
  provider: string;
  lang: "tr" | "en";
}): Promise<{ sid: string; channel: "whatsapp" | "sms" }> {
  const when = formatWhen(params.startsAt, params.lang);
  const body =
    params.lang === "tr"
      ? `Merhaba ${params.patientName}, ${when} tarihli randevunuzu hatırlatırız (${params.provider}).`
      : `Hi ${params.patientName}, this is a reminder for your appointment on ${when} with ${params.provider}.`;
  return sendViaWhatsappOrSms(params.to, body);
}

/** Sends the patient their video-visit join link (used by the "send link" action and telehealth reminders). */
export async function sendTelehealthLink(params: {
  to: string;
  patientName: string;
  startsAt: string;
  url: string;
  lang: "tr" | "en";
}): Promise<{ sid: string; channel: "whatsapp" | "sms" }> {
  const when = formatWhen(params.startsAt, params.lang);
  const body =
    params.lang === "tr"
      ? `Merhaba ${params.patientName}, ${when} tarihli görüntülü görüşmenize katılmak için bağlantı: ${params.url}`
      : `Hi ${params.patientName}, here is your video visit link for ${when}: ${params.url}`;
  return sendViaWhatsappOrSms(params.to, body);
}
