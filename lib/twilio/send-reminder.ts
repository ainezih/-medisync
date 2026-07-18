import twilio from "twilio";

/** Server-only — never import from a "use client" file. */
export async function sendAppointmentReminder(params: {
  to: string;
  patientName: string;
  startsAt: string;
  provider: string;
  lang: "tr" | "en";
}): Promise<{ sid: string }> {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

  const when = new Date(params.startsAt).toLocaleString(params.lang === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const body =
    params.lang === "tr"
      ? `Merhaba ${params.patientName}, ${when} tarihli randevunuzu hatırlatırız (${params.provider}).`
      : `Hi ${params.patientName}, this is a reminder for your appointment on ${when} with ${params.provider}.`;

  const message = await client.messages.create({
    to: params.to,
    from: process.env.TWILIO_FROM_NUMBER!,
    body,
  });

  return { sid: message.sid };
}
