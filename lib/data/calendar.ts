import { WEEKDAY_LABEL } from "@/lib/data/types";
import type { L } from "@/lib/i18n/config";

export const DAY_KEY_BY_INDEX: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export interface WeekDay {
  key: string;
  label: L;
  date: string;
  today?: boolean;
}

/** Mon–Sat of the week containing `reference` (clinic is closed Sundays). */
export function getWeekDays(reference: Date = new Date()): WeekDay[] {
  const day = reference.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + mondayOffset);

  const todayKey = DAY_KEY_BY_INDEX[new Date().getDay()];
  const days: WeekDay[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = DAY_KEY_BY_INDEX[d.getDay()];
    days.push({ key, label: WEEKDAY_LABEL[key], date: String(d.getDate()), today: key === todayKey && isSameWeek(reference, new Date()) });
  }
  return days;
}

function isSameWeek(a: Date, b: Date) {
  const aMonday = new Date(a);
  aMonday.setDate(a.getDate() + (a.getDay() === 0 ? -6 : 1 - a.getDay()));
  const bMonday = new Date(b);
  bMonday.setDate(b.getDate() + (b.getDay() === 0 ? -6 : 1 - b.getDay()));
  return aMonday.toDateString() === bMonday.toDateString();
}

export function timeOf(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
