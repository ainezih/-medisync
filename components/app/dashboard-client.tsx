"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  ChevronDown,
  Clock,
  Pill,
  Brain,
  Utensils,
  Dumbbell,
  Stethoscope,
  CalendarDays,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react";
import { AreaChart, DonutChart } from "@/components/app/charts";
import { Avatar, StatusPill, TypeChip, PatientDrawer } from "@/components/app/clinic";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatTime, minutesOf, formatShortDate, formatRelative } from "@/lib/utils";
import { STATUS_LABEL, TYPE_LABEL } from "@/lib/data/types";
import type {
  DStat,
  ScheduleSlot,
  QueueEntry,
  Patient,
  RecentRx,
  RecentCareNote,
  CareNoteKind,
  DActivity,
  CalEvent,
  ApptType,
} from "@/lib/data/types";
import type { WeekDay } from "@/lib/data/calendar";
import type { L } from "@/lib/i18n/config";

const CALENDAR_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const TILE: Record<number, string> = {
  1: "var(--grad-tile-1)",
  2: "var(--grad-tile-2)",
  3: "var(--grad-tile-3)",
  4: "var(--grad-tile-4)",
};

const MIX_COLOR: Record<ApptType, string> = {
  checkup: "var(--seg-1)",
  "follow-up": "var(--seg-2)",
  "new-patient": "var(--seg-3)",
  telehealth: "var(--color-info)",
  procedure: "var(--seg-4)",
  vaccine: "var(--color-status-checkedin)",
};

// Timeline window: 08:00 → 15:30
const DAY_START = 8 * 60;
const DAY_END = 15 * 60 + 30;
const DAY_SPAN = DAY_END - DAY_START;

export interface RevenueMeta {
  title: L;
  subtitle: L;
  delta: number;
  total: string;
  totalVisits: number;
}

export interface Billing {
  collectedToday: { label: L; value: string };
  outstanding: { label: L; value: string; count: number };
  claims: { label: L; value: string };
}

export function DashboardClient({
  stats,
  schedule,
  queue,
  patients,
  recentRx,
  recentCareNotes,
  careKind,
  profession,
  revenue,
  revenueMeta,
  apptMix,
  activity,
  billing,
  calendarEvents,
  weekDays,
  isAdmin,
}: {
  stats: DStat[];
  schedule: ScheduleSlot[];
  queue: QueueEntry[];
  patients: Patient[];
  recentRx: RecentRx[];
  recentCareNotes: RecentCareNote[];
  careKind: CareNoteKind | null;
  profession: string | null;
  revenue: { label: string; value: number; visits: number }[];
  revenueMeta: RevenueMeta;
  apptMix: { type: ApptType; value: number }[];
  activity: DActivity[];
  billing: Billing;
  calendarEvents: CalEvent[];
  weekDays: WeekDay[];
  isAdmin: boolean;
}) {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<string | null>(patients[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(patients.length > 0);
  const [query, setQuery] = useState("");
  const [inRoom, setInRoom] = useState<string[]>([]);

  const selectedPatient = patients.find((p) => p.id === selected) ?? patients[0] ?? null;

  const rosterRows = useMemo(
    () =>
      patients.filter(
        (p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.mrn.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, patients],
  );

  return (
    <div className="mx-auto max-w-[1500px] animate-fade-in">
      <div className={cn("grid gap-6", drawerOpen && selectedPatient ? "xl:grid-cols-[1fr_380px]" : "grid-cols-1")}>
        {/* ── Main column ──────────────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          {/* Page header */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "İyi günler" : "Good morning"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {lang === "tr"
                  ? `Bugün ${schedule.length} randevu · ${queue.length} hasta bekliyor · klinik akışta.`
                  : `${schedule.length} appointments today · ${queue.length} checked in · your clinic is on track.`}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {lang === "tr" ? "Bugün" : "Today"}
              </button>
              <Link
                href="/appointments"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                {lang === "tr" ? "Randevu" : "New appointment"}
              </Link>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => {
              const up = (s.delta ?? 0) >= 0;
              const positive = s.key === "noshows" ? !up : up;
              return (
                <div
                  key={s.key}
                  className="relative overflow-hidden rounded-2xl p-4 ring-1 ring-border shadow-soft"
                  style={{ background: TILE[s.tone ?? 1] }}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-card text-foreground/80 ring-1 ring-border">
                      {s.icon === "calendar-days" && <CalendarDays className="h-[18px] w-[18px]" />}
                      {s.icon === "users" && <Stethoscope className="h-[18px] w-[18px]" />}
                      {s.icon === "dollar-sign" && <CircleDollarSign className="h-[18px] w-[18px]" />}
                      {s.icon === "user-x" && <Clock className="h-[18px] w-[18px]" />}
                    </span>
                    {s.delta !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded-full bg-card/70 px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-border/60",
                          positive ? "text-success" : "text-destructive",
                        )}
                      >
                        {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(s.delta).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-3.5 tnum text-2xl font-bold leading-none text-foreground">{s.value}</p>
                  <p className="mt-1.5 text-[12.5px] font-medium text-foreground/90">{t(s.label)}</p>
                  {s.hint && <p className="mt-0.5 line-clamp-1 text-[11px] text-foreground/55">{t(s.hint)}</p>}
                </div>
              );
            })}
          </div>

          {/* Today's schedule timeline */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Bugünün programı" : "Today's schedule"}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {schedule.length} {lang === "tr" ? "randevu" : "appts"}
              </span>
              <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
                {(["checked-in", "in-room", "done"] as const).map((st) => (
                  <span key={st} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: STATUS_LABEL[st].var }} />
                    {lang === "tr" ? STATUS_LABEL[st].tr : STATUS_LABEL[st].en}
                  </span>
                ))}
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {schedule.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {lang === "tr" ? "Bugün için randevu yok." : "No appointments today."}
                </p>
              )}
              {schedule.map((slot) => {
                const start = minutesOf(slot.time);
                const left = ((start - DAY_START) / DAY_SPAN) * 100;
                const width = (slot.durationMin / DAY_SPAN) * 100;
                const color = STATUS_LABEL[slot.status].var;
                const isSel = slot.patientId === selected;
                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelected(slot.patientId);
                      setDrawerOpen(true);
                    }}
                    className={cn(
                      "grid w-full grid-cols-[64px_1fr] items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      isSel ? "bg-primary/[0.04]" : "hover:bg-muted/40",
                    )}
                  >
                    <span className="tnum text-[12px] font-semibold text-muted-foreground">{formatTime(slot.time)}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={slot.initials} size={28} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold leading-tight">{slot.patient}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {slot.provider}
                            {slot.room ? ` · ${lang === "tr" ? "Oda" : "Room"} ${slot.room}` : ""}
                          </p>
                        </div>
                        <TypeChip type={slot.type} lang={lang} />
                        <StatusPill status={slot.status} lang={lang} />
                      </div>
                      <div className="relative mt-1.5 ml-[38px] h-1.5 rounded-full bg-muted">
                        <span
                          className="absolute top-0 h-full rounded-full"
                          style={{ left: `${left}%`, width: `${Math.max(width, 3)}%`, background: color, opacity: 0.85 }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patients roster */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Hastalar" : "Patients"}
              </h2>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === "tr" ? "İsim ya da MRN…" : "Name or MRN…"}
                    className="w-32 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:w-44"
                  />
                </div>
                <Link
                  href="/patients"
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {lang === "tr" ? "Tümü" : "All patients"}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Hasta" : "Patient"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Yaş" : "Age"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Son ziyaret" : "Last visit"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Sonraki" : "Next appt"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Durum" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rosterRows.slice(0, 7).map((p) => {
                    const isSel = p.id === selected;
                    const tone: Record<string, string> = {
                      active: "text-success bg-success/10",
                      new: "text-info bg-info/10",
                      overdue: "text-destructive bg-destructive/10",
                      inactive: "text-muted-foreground bg-muted",
                    };
                    const statusLabel: Record<string, { tr: string; en: string }> = {
                      active: { tr: "aktif", en: "active" },
                      new: { tr: "yeni", en: "new" },
                      overdue: { tr: "gecikmiş", en: "overdue" },
                      inactive: { tr: "pasif", en: "inactive" },
                    };
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setSelected(p.id);
                          setDrawerOpen(true);
                        }}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                          isSel ? "bg-primary/[0.04]" : "hover:bg-muted/50",
                        )}
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={p.initials} size={30} />
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">{p.name}</p>
                              <p className="tnum text-xs text-muted-foreground">{p.mrn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3"><span className="tnum text-[13px]">{p.age ?? "—"}</span></td>
                        <td className="py-3">
                          <span className="tnum text-[13px] text-muted-foreground">{p.lastVisit ? formatShortDate(p.lastVisit) : "—"}</span>
                        </td>
                        <td className="py-3">
                          {p.nextAppt ? (
                            <span className="tnum text-[13px]">{formatShortDate(p.nextAppt)}</span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", tone[p.status])}>
                            {lang === "tr" ? statusLabel[p.status].tr : statusLabel[p.status].en}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {rosterRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                        {lang === "tr" ? "Henüz hasta yok." : "No patients yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue & visits + appointment mix */}
          <div className={cn("grid gap-6", isAdmin && "lg:grid-cols-[1.5fr_1fr]")}>
            {isAdmin && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-[15px] font-semibold tracking-tight">{t(revenueMeta.title)}</h3>
                    <p className="text-xs text-muted-foreground">{t(revenueMeta.subtitle)}</p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", revenueMeta.delta >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    {revenueMeta.delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(revenueMeta.delta).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-3">
                  <p className="tnum text-2xl font-bold leading-none">{revenueMeta.total}</p>
                  <span className="text-xs text-muted-foreground">
                    {lang === "tr" ? `8 haftada · ${revenueMeta.totalVisits} ziyaret` : `over 8 weeks · ${revenueMeta.totalVisits} visits`}
                  </span>
                </div>
                <div className="mt-4">
                  <AreaChart
                    data={revenue.map((r) => r.value)}
                    bars={revenue.map((r) => r.visits)}
                    labels={revenue.map((r) => r.label)}
                    height={160}
                  />
                </div>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded-full bg-primary" /> {lang === "tr" ? "Gelir" : "Revenue"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded-sm" style={{ background: "color-mix(in oklch, var(--seg-2) 30%, transparent)" }} /> {lang === "tr" ? "Ziyaretler" : "Visits"}
                  </span>
                </div>
              </div>
            )}

            {/* Appointment mix donut */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Randevu türleri" : "Appointment mix"}
              </h3>
              {apptMix.length === 0 ? (
                <p className="mt-4 text-[13px] text-muted-foreground">{lang === "tr" ? "Son 30 günde randevu yok." : "No appointments in the last 30 days."}</p>
              ) : (
                <div className="mt-4 flex items-center gap-5">
                  <div className="relative shrink-0">
                    <DonutChart segments={apptMix.map((m) => ({ label: TYPE_LABEL[m.type][lang], value: m.value, color: MIX_COLOR[m.type] }))} />
                    <span className="absolute inset-0 grid place-items-center text-center">
                      <span className="block tnum text-xl font-bold leading-none">{apptMix.reduce((s, m) => s + m.value, 0)}%</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{lang === "tr" ? "son 30 gün" : "last 30 days"}</span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {apptMix.map((m) => (
                      <div key={m.type} className="flex items-center gap-2 text-[12.5px]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: MIX_COLOR[m.type] }} />
                        <span className="flex-1 truncate">{TYPE_LABEL[m.type][lang]}</span>
                        <span className="tnum font-semibold text-muted-foreground">{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment calendar (compact week strip) + billing */}
          <div className={cn("grid gap-6", isAdmin && "lg:grid-cols-[1.5fr_1fr]")}>
            <WeekStrip calendarEvents={calendarEvents} weekDays={weekDays} />
            {/* Billing snapshot */}
            {isAdmin && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[15px] font-semibold tracking-tight">
                    {lang === "tr" ? "Faturalandırma" : "Billing"}
                  </h3>
                  <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-success/[0.04] p-3">
                    <span className="text-[13px] font-medium">{t(billing.collectedToday.label)}</span>
                    <span className="tnum text-[15px] font-bold text-success">{billing.collectedToday.value}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                    <div>
                      <p className="text-[13px] font-medium">{t(billing.outstanding.label)}</p>
                      <p className="text-[11px] text-muted-foreground">{billing.outstanding.count} {lang === "tr" ? "fatura" : "invoices"}</p>
                    </div>
                    <span className="tnum text-[15px] font-bold">{billing.outstanding.value}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                    <span className="text-[13px] font-medium">{t(billing.claims.label)}</span>
                    <span className="tnum text-[15px] font-bold">{billing.claims.value}</span>
                  </div>
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted">
                  {lang === "tr" ? "Faturalara git" : "Open billing"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right rail: waiting room + prescriptions + activity ──── */}
        {drawerOpen && selectedPatient ? (
          <aside className="animate-float-up space-y-5 xl:sticky xl:top-2 xl:self-start">
            <PatientDrawer patient={selectedPatient} profession={profession} onClose={() => setDrawerOpen(false)} />
          </aside>
        ) : (
          <aside className="animate-float-up space-y-5 xl:sticky xl:top-2 xl:self-start">
            <WaitingRoom queue={queue} inRoom={inRoom} setInRoom={setInRoom} />
            {careKind ? <CareNotesPanel notes={recentCareNotes} kind={careKind} /> : <Prescriptions recentRx={recentRx} />}
            <ActivityFeed activity={activity} />
          </aside>
        )}
      </div>

      {drawerOpen && selectedPatient && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <WaitingRoom queue={queue} inRoom={inRoom} setInRoom={setInRoom} />
          {careKind ? <CareNotesPanel notes={recentCareNotes} kind={careKind} /> : <Prescriptions recentRx={recentRx} />}
          <ActivityFeed activity={activity} />
        </div>
      )}
    </div>
  );
}

/* ── Waiting room / queue panel ───────────────────────────────────────────── */
function WaitingRoom({ queue, inRoom, setInRoom }: { queue: QueueEntry[]; inRoom: string[]; setInRoom: (v: string[]) => void }) {
  const { lang } = useLang();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold tracking-tight">
          {lang === "tr" ? "Bekleme odası" : "Waiting room"}
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-warning pulse-dot" />
          {queue.filter((q) => !inRoom.includes(q.id)).length} {lang === "tr" ? "bekliyor" : "waiting"}
        </span>
      </div>
      <div className="mt-3.5 space-y-2.5">
        {queue.length === 0 && <p className="text-[12.5px] text-muted-foreground">{lang === "tr" ? "Bekleme odası boş." : "Waiting room is empty."}</p>}
        {queue.map((q) => {
          const called = inRoom.includes(q.id);
          return (
            <div key={q.id} className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/20 p-2.5">
              <Avatar initials={q.initials} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight">{q.patient}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {TYPE_LABEL[q.type][lang]} · {q.provider}
                </p>
              </div>
              {called ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: "var(--color-status-inroom)", background: "color-mix(in oklch, var(--color-status-inroom) 12%, transparent)" }}>
                  {lang === "tr" ? "odada" : "in-room"}
                </span>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <span className="tnum inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" /> {q.waitMin}m
                  </span>
                  <button
                    onClick={() => setInRoom([...inRoom, q.id])}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {lang === "tr" ? "Çağır" : "Call in"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Recent prescriptions panel ───────────────────────────────────────────── */
function Prescriptions({ recentRx }: { recentRx: RecentRx[] }) {
  const { lang } = useLang();
  const tone: Record<string, string> = {
    active: "text-success bg-success/10",
    pending: "text-warning-foreground bg-warning/15",
    completed: "text-muted-foreground bg-muted",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold tracking-tight">
          {lang === "tr" ? "Son reçeteler" : "Recent prescriptions"}
        </h3>
        <Pill className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3.5 space-y-2.5">
        {recentRx.length === 0 && <p className="text-[12.5px] text-muted-foreground">{lang === "tr" ? "Henüz reçete yok." : "No prescriptions yet."}</p>}
        {recentRx.map((r) => (
          <div key={r.id} className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Pill className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">
                {r.drug} <span className="tnum text-muted-foreground">{r.dose}</span>
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {r.patient} · {r.freq}
              </p>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", tone[r.status])}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Recent care-notes panel — Faz 4, doctor/dentist's Prescriptions equivalent
   for psychologist/dietitian/physiotherapist clinics ─────────────────────── */
const CARE_NOTE_ICON: Record<CareNoteKind, typeof Brain> = {
  session_note: Brain,
  nutrition_plan: Utensils,
  exercise_plan: Dumbbell,
};

const CARE_NOTE_PANEL_TITLE: Record<CareNoteKind, L> = {
  session_note: { tr: "Son seans notları", en: "Recent session notes" },
  nutrition_plan: { tr: "Son beslenme planları", en: "Recent nutrition plans" },
  exercise_plan: { tr: "Son egzersiz planları", en: "Recent exercise plans" },
};

function CareNotesPanel({ notes, kind }: { notes: RecentCareNote[]; kind: CareNoteKind }) {
  const { t, lang } = useLang();
  const tone: Record<string, string> = {
    active: "text-success bg-success/10",
    completed: "text-muted-foreground bg-muted",
  };
  const KindIcon = CARE_NOTE_ICON[kind];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold tracking-tight">{t(CARE_NOTE_PANEL_TITLE[kind])}</h3>
        <KindIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3.5 space-y-2.5">
        {notes.length === 0 && <p className="text-[12.5px] text-muted-foreground">{lang === "tr" ? "Henüz kayıt yok." : "No entries yet."}</p>}
        {notes.map((n) => (
          <div key={n.id} className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <KindIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">{n.summary || "—"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{n.patient}</p>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", tone[n.status])}>
              {n.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Activity feed ────────────────────────────────────────────────────────── */
function ActivityFeed({ activity }: { activity: DActivity[] }) {
  const { lang } = useLang();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h3 className="font-display text-[15px] font-semibold tracking-tight">
        {lang === "tr" ? "Son hareketler" : "Recent activity"}
      </h3>
      <div className="mt-3.5 space-y-3.5">
        {activity.length === 0 && <p className="text-[12.5px] text-muted-foreground">{lang === "tr" ? "Henüz hareket yok." : "No activity yet."}</p>}
        {activity.map((a) => (
          <div key={a.id} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                a.tone === "success" ? "bg-success" : a.tone === "warning" ? "bg-warning" : a.tone === "info" ? "bg-info" : "bg-muted-foreground",
              )}
            />
            <div className="min-w-0 text-[13px]">
              <p className="leading-snug">
                <span className="font-semibold">{a.who}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                <span className="font-medium">{a.target}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">{formatRelative(a.at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Compact appointment-calendar week strip ──────────────────────────────── */
function WeekStrip({ calendarEvents, weekDays }: { calendarEvents: CalEvent[]; weekDays: WeekDay[] }) {
  const { lang } = useLang();
  const [day, setDay] = useState(weekDays.find((d) => d.today)?.key ?? weekDays[0]?.key ?? "mon");
  const events = calendarEvents.filter((e) => e.day === day);
  const startMin = minutesOf("08:00");
  const endMin = minutesOf("16:00");
  const span = endMin - startMin;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold tracking-tight">
          {lang === "tr" ? "Bu hafta" : "This week"}
        </h3>
        <Link href="/appointments" className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
          {lang === "tr" ? "Takvim" : "Calendar"}
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
        </Link>
      </div>

      <div className="mt-4 flex gap-1.5">
        {weekDays.map((d) => (
          <button
            key={d.key}
            onClick={() => setDay(d.key)}
            className={cn(
              "flex flex-1 flex-col items-center rounded-xl border py-2 transition-colors",
              day === d.key ? "border-primary bg-primary/[0.05]" : "border-border hover:bg-muted/50",
            )}
          >
            <span className="text-[10px] font-medium uppercase text-muted-foreground">{d.label[lang]}</span>
            <span className={cn("tnum mt-0.5 text-[15px] font-bold", day === d.key ? "text-primary" : "text-foreground", d.today && "underline decoration-primary decoration-2 underline-offset-2")}>
              {d.date}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mt-4 h-[180px] rounded-xl border border-border bg-muted/20">
        {CALENDAR_HOURS.map((hh) => {
          const top = ((minutesOf(hh) - startMin) / span) * 100;
          return (
            <div key={hh} className="absolute inset-x-0 flex items-center gap-2" style={{ top: `${top}%` }}>
              <span className="tnum w-10 shrink-0 pl-2 text-[9.5px] text-muted-foreground">{hh}</span>
              <span className="h-px flex-1 bg-border/70" />
            </div>
          );
        })}
        {events.map((ev) => {
          const top = ((minutesOf(ev.start) - startMin) / span) * 100;
          const height = (ev.durationMin / span) * 100;
          const color = STATUS_LABEL[ev.status].var;
          return (
            <div
              key={ev.id}
              className="absolute left-12 right-2 overflow-hidden rounded-lg px-2 py-1 text-[10.5px] font-medium"
              style={{
                top: `${top}%`,
                height: `${Math.max(height, 9)}%`,
                background: `color-mix(in oklch, ${color} 14%, var(--color-card))`,
                borderLeft: `2.5px solid ${color}`,
              }}
            >
              <span className="block truncate font-semibold leading-tight">{ev.patient}</span>
              <span className="block truncate text-muted-foreground">{TYPE_LABEL[ev.type][lang]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
