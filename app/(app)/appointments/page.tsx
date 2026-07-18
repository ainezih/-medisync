import { getTodaySchedule, getWeekCalendar, getProviders } from "@/lib/data/appointments";
import { getWeekDays } from "@/lib/data/calendar";
import { AppointmentsClient } from "@/components/app/appointments-client";

export default async function AppointmentsPage() {
  const weekDays = getWeekDays();
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));

  const [schedule, calendarEvents, providers] = await Promise.all([
    getTodaySchedule(),
    getWeekCalendar(monday),
    getProviders(),
  ]);

  return <AppointmentsClient calendarEvents={calendarEvents} schedule={schedule} providers={providers} weekDays={weekDays} />;
}
