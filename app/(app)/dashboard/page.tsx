import { getTodaySchedule, getQueue, getWeekCalendar } from "@/lib/data/appointments";
import { listPatients } from "@/lib/data/patients";
import { getStats, getRecentRx, getRevenueSeries, getApptMix, getActivity, getBilling } from "@/lib/data/dashboard";
import { getWeekDays } from "@/lib/data/calendar";
import { DashboardClient } from "@/components/app/dashboard-client";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.is_admin ?? false;

  const weekDays = getWeekDays();
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));

  const [schedule, queue, patients, recentRx, statsRaw, revenueData, apptMix, activity, billing, calendarEvents] = await Promise.all([
    getTodaySchedule(),
    getQueue(),
    listPatients(),
    getRecentRx(),
    getStats(),
    getRevenueSeries(),
    getApptMix(),
    getActivity(),
    getBilling(),
    getWeekCalendar(monday),
  ]);
  const stats = isAdmin ? statsRaw : statsRaw.filter((s) => s.key !== "revenue");

  return (
    <DashboardClient
      isAdmin={isAdmin}
      stats={stats}
      schedule={schedule}
      queue={queue}
      patients={patients}
      recentRx={recentRx}
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
