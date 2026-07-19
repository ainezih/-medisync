import twilio from "twilio";

/**
 * Notification channel policy (decided 2026-07-20): WhatsApp first, SMS
 * fallback. WhatsApp requires TWILIO_WHATSAPP_FROM (an approved WhatsApp
 * sender, e.g. "+14155238886") — until it is set, or when a WhatsApp send
 * fails (recipient has no WhatsApp, template not approved yet, …), we fall
 * back to plain SMS via TWILIO_FROM_NUMBER.
 */
export async function sendAppointmentReminder(params: {
  to: string;
  patientName: string;
  startsAt: string;
  provider: string;
  lang: "tr" | "en";
}): Promise<{ sid: string; channel: "whatsapp" | "sms" }> {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

  const when = new Date(params.startsAt).toLocaleString(params.lang === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const body =
    params.lang === "tr"
      ? `Merhaba ${params.patientName}, ${when} tarihli randevunuzu hatırlatırız (${params.provider}).`
      : `Hi ${params.patientName}, this is a reminder for your appointment on ${when} with ${params.provider}.`;

  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (whatsappFrom) {
    try {
      const message = await client.messages.create({
        to: `whatsapp:${params.to}`,
        from: `whatsapp:${whatsappFrom}`,
        body,
      });
      return { sid: message.sid, channel: "whatsapp" };
    } catch {
      // WhatsApp unavailable for this recipient — fall through to SMS.
    }
  }

  const message = await client.messages.create({
    to: params.to,
    from: process.env.TWILIO_FROM_NUMBER!,
    body,
  });

  return { sid: message.sid, channel: "sms" };
}
