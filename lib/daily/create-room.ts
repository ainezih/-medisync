/** Server-only — creates a Daily.co video room via their REST API. No browser SDK needed. */
export async function createRoom(name: string): Promise<{ url: string }> {
  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      properties: {
        exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
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
