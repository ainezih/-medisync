import { createClient } from "@/lib/supabase/server";
import type { DStat, RecentRx, RecentCareNote, CareNoteKind, DActivity, ApptType } from "@/lib/data/types";

/** Top stat row — counts computed live, no fabricated week-over-week deltas. */
export async function getStats(): Promise<DStat[]> {
  const supabase = await createClient();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const monthStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), 1).toISOString();

  const [todayAppts, activePatients, todayRevenue, monthAppts, monthNoShows] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }).gte("starts_at", dayStart.toISOString()).lt("starts_at", dayEnd.toISOString()),
    supabase.from("patients").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("invoices").select("amount").eq("status", "paid").gte("paid_at", dayStart.toISOString()).lt("paid_at", dayEnd.toISOString()),
    supabase.from("appointments").select("id", { count: "exact", head: true }).gte("starts_at", monthStart),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "no-show").gte("starts_at", monthStart),
  ]);

  const revenueToday = (todayRevenue.data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const totalThisMonth = monthAppts.count ?? 0;
  const noShowRate = totalThisMonth ? ((monthNoShows.count ?? 0) / totalThisMonth) * 100 : 0;

  return [
    { key: "appts", label: { tr: "Bugünkü randevular", en: "Today's appointments" }, value: String(todayAppts.count ?? 0), icon: "calendar-days", tone: 1 },
    { key: "patients", label: { tr: "Aktif hasta", en: "Active patients" }, value: String(activePatients.count ?? 0), icon: "users", tone: 2 },
    { key: "revenue", label: { tr: "Bugünkü gelir", en: "Today's revenue" }, value: `$${revenueToday.toLocaleString("en-US")}`, icon: "dollar-sign", tone: 3 },
    { key: "noshows", label: { tr: "Gelmeyen (bu ay)", en: "No-shows (this mo.)" }, value: `${noShowRate.toFixed(1)}%`, icon: "user-x", tone: 4 },
  ];
}

export async function getRecentRx(limit = 5): Promise<RecentRx[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .select("id, drug, dose, freq, status, prescribed_at, patients(name, initials)")
    .order("prescribed_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getRecentRx: ${error.message}`);
  return (data ?? []).map((r) => {
    const p = Array.isArray(r.patients) ? r.patients[0] : r.patients;
    return {
      id: r.id,
      patient: p?.name ?? "",
      initials: p?.initials ?? "",
      drug: r.drug,
      dose: r.dose,
      freq: r.freq,
      status: r.status as RecentRx["status"],
      at: r.prescribed_at,
    };
  });
}

/** Faz 4 — recent entries for a profession's care module (session notes, nutrition/exercise plans). */
export async function getRecentCareNotes(kind: CareNoteKind, limit = 5): Promise<RecentCareNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_notes")
    .select("id, kind, occurred_at, status, note, mood, goal, meal_plan, exercise_plan, patients(name, initials)")
    .eq("kind", kind)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getRecentCareNotes: ${error.message}`);
  return (data ?? []).map((r) => {
    const p = Array.isArray(r.patients) ? r.patients[0] : r.patients;
    const summarySource = r.kind === "session_note" ? r.goal || r.mood : r.kind === "nutrition_plan" ? r.meal_plan : r.exercise_plan;
    const summary = (summarySource || r.note || "").slice(0, 60);
    return {
      id: r.id,
      patient: p?.name ?? "",
      initials: p?.initials ?? "",
      kind: r.kind as CareNoteKind,
      summary,
      status: r.status as RecentCareNote["status"],
      at: r.occurred_at,
    };
  });
}

/** Revenue + visit counts bucketed into the last 8 weeks. */
export async function getRevenueSeries(): Promise<{ series: { label: string; value: number; visits: number }[]; total: string; totalVisits: number; deltaPct: number }> {
  const supabase = await createClient();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const since = new Date(now - 8 * weekMs).toISOString();

  const [invoicesRes, visitsRes] = await Promise.all([
    supabase.from("invoices").select("amount, paid_at").eq("status", "paid").gte("paid_at", since),
    supabase.from("visits").select("occurred_at").gte("occurred_at", since),
  ]);

  const buckets = Array.from({ length: 8 }, (_, i) => ({ label: `W${i + 1}`, value: 0, visits: 0 }));
  const bucketOf = (iso: string) => {
    const idx = Math.floor((now - new Date(iso).getTime()) / weekMs);
    return 7 - Math.min(7, Math.max(0, idx));
  };

  for (const inv of invoicesRes.data ?? []) {
    if (!inv.paid_at) continue;
    buckets[bucketOf(inv.paid_at)].value += Number(inv.amount);
  }
  for (const v of visitsRes.data ?? []) {
    buckets[bucketOf(v.occurred_at)].visits += 1;
  }

  const total = buckets.reduce((sum, b) => sum + b.value, 0);
  const totalVisits = buckets.reduce((sum, b) => sum + b.visits, 0);
  const first = buckets[0].value;
  const last = buckets[buckets.length - 1].value;
  const deltaPct = first > 0 ? ((last - first) / first) * 100 : 0;
  return { series: buckets, total: `$${total.toLocaleString("en-US")}`, totalVisits, deltaPct };
}

/** Appointment-type mix over the last 30 days, as percentages. */
export async function getApptMix(): Promise<{ type: ApptType; value: number }[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data, error } = await supabase.from("appointments").select("type").gte("starts_at", since.toISOString());
  if (error) throw new Error(`getApptMix: ${error.message}`);

  const rows = data ?? [];
  if (!rows.length) return [];
  const counts = new Map<ApptType, number>();
  for (const r of rows) counts.set(r.type as ApptType, (counts.get(r.type as ApptType) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, value: Math.round((count / rows.length) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export async function getActivity(limit = 6): Promise<DActivity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, actor, action, target, tone, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getActivity: ${error.message}`);
  return (data ?? []).map((a) => ({ id: a.id, who: a.actor, action: a.action, target: a.target, at: a.occurred_at, tone: a.tone as DActivity["tone"] }));
}

export async function logActivity(actor: string, action: string, target: string, tone: DActivity["tone"] = "neutral") {
  const supabase = await createClient();
  await supabase.from("activity_log").insert({ actor, action, target, tone });
}

export async function getBilling() {
  const supabase = await createClient();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [collected, outstanding] = await Promise.all([
    supabase.from("invoices").select("amount").eq("status", "paid").gte("paid_at", dayStart.toISOString()),
    supabase.from("invoices").select("amount").eq("status", "unpaid"),
  ]);

  const collectedToday = (collected.data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const outstandingRows = outstanding.data ?? [];
  const outstandingTotal = outstandingRows.reduce((sum, r) => sum + Number(r.amount), 0);

  return {
    collectedToday: { label: { tr: "Bugün tahsil edilen", en: "Collected today" }, value: `$${collectedToday.toLocaleString("en-US")}` },
    outstanding: { label: { tr: "Bekleyen bakiye", en: "Outstanding balance" }, value: `$${outstandingTotal.toLocaleString("en-US")}`, count: outstandingRows.length },
    // No separate insurance-claims tracking table exists — reusing the unpaid-invoice count here.
    claims: { label: { tr: "Bekleyen talepler", en: "Pending claims" }, value: String(outstandingRows.length) },
  };
}
