import { getTodaySchedule, getWeekCalendar, getProviders, listPatientOptions, listClinicMembers } from "@/lib/data/appointments";
import { getWeekDays } from "@/lib/data/calendar";
import { AppointmentsClient } from "@/components/app/appointments-client";
import { createClient } from "@/lib/supabase/server";

export default async function AppointmentsPage() {
  const weekDays = getWeekDays();
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("profession").eq("id", user.id).maybeSingle()
    : { data: null };

  const [schedule, calendarEvents, providers, patientOptions, members] = await Promise.all([
    getTodaySchedule(),
    getWeekCalendar(monday),
    getProviders(),
    listPatientOptions(),
    listClinicMembers(),
  ]);

  return (
    <AppointmentsClient
      calendarEvents={calendarEvents}
      schedule={schedule}
      providers={providers}
      weekDays={weekDays}
      patientOptions={patientOptions}
      members={members}
      profession={profile?.profession ?? null}
    />
  );
}
