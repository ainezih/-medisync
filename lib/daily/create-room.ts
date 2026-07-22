/**
 * Server-only — creates a Daily.co video room via their REST API. No browser
 * SDK needed. Pass `expiresAt` when the room is created ahead of the visit
 * (e.g. a link sent 24h early) so it doesn't expire before the appointment —
 * defaults to 2h from now for on-demand "join now" creation.
 */
export async function createRoom(name: string, expiresAt?: Date): Promise<{ url: string }> {
  const exp = expiresAt ? Math.floor(expiresAt.getTime() / 1000) : Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      properties: {
        exp,
        enable_chat: true,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Daily room creation failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return { url: data.url as string };
}
