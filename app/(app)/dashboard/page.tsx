import { getTodaySchedule, getQueue, getWeekCalendar } from "@/lib/data/appointments";
import { listPatients } from "@/lib/data/patients";
import { getStats, getRecentRx, getRecentCareNotes, getRevenueSeries, getApptMix, getActivity, getBilling } from "@/lib/data/dashboard";
import { getWeekDays } from "@/lib/data/calendar";
import { DashboardClient } from "@/components/app/dashboard-client";
import { createClient } from "@/lib/supabase/server";
import type { CareNoteKind, RecentCareNote, RecentRx } from "@/lib/data/types";

const PROFESSION_CARE_KIND: Record<string, CareNoteKind> = {
  psychologist: "session_note",
  dietitian: "nutrition_plan",
  physiotherapist: "exercise_plan",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin, profession").eq("id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.is_admin ?? false;
  const profession = profile?.profession ?? null;
  const careKind = profession ? (PROFESSION_CARE_KIND[profession] ?? null) : null;

  const weekDays = getWeekDays();
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));

  const [schedule, queue, patients, recentItems, statsRaw, revenueData, apptMix, activity, billing, calendarEvents] = await Promise.all([
    getTodaySchedule(),
    getQueue(),
    listPatients(),
    careKind ? getRecentCareNotes(careKind) : getRecentRx(),
    getStats(),
    getRevenueSeries(),
    getApptMix(),
    getActivity(),
    getBilling(),
    getWeekCalendar(monday),
  ]);
  const stats = isAdmin ? statsRaw : statsRaw.filter((s) => s.key !== "revenue");
  const recentRx: RecentRx[] = careKind ? [] : (recentItems as RecentRx[]);
  const recentCareNotes: RecentCareNote[] = careKind ? (recentItems as RecentCareNote[]) : [];

  return (
    <DashboardClient
      isAdmin={isAdmin}
      profession={profession}
      careKind={careKind}
      stats={stats}
      schedule={schedule}
      queue={queue}
      patients={patients}
      recentRx={recentRx}
      recentCareNotes={recentCareNotes}
      revenue={revenueData.series}
      revenueMeta={{
        title: { tr: "Gelir & ziyaretler", en: "Revenue & visits" },
        subtitle: { tr: "Son 8 hafta", en: "Last 8 weeks" },
        delta: revenueData.deltaPct,
        total: revenueData.total,
        totalVisits: revenueData.totalVisits,
      }}
      apptMix={apptMix}
      activity={activity}
      billing={billing}
      calendarEvents={calendarEvents}
      weekDays={weekDays}
    />
  );
}
