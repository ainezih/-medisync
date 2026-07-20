/**
 * Pins the server to the clinic's timezone. Vercel functions run in UTC —
 * without this, schedule times and "today" boundaries shift by 3 hours.
 * Turkey is permanently UTC+3 (no DST).
 */
export function register() {
  process.env.TZ = "Europe/Istanbul";
}
