"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, LayoutGrid, MessageSquareText, Video, Send, Loader2, X } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { StatusPill, TypeChip } from "@/components/app/clinic";
import { Input, Label } from "@/components/ui/input";
import { cn, formatTime, minutesOf } from "@/lib/utils";
import { STATUS_LABEL, typeLabel, apptTypesFor, type CalEvent, type ScheduleSlot } from "@/lib/data/types";
import type { WeekDay } from "@/lib/data/calendar";
import { sendReminderAction, joinTelehealthAction, sendTelehealthLinkAction, createAppointmentAction } from "@/app/(app)/appointments/actions";

const CALENDAR_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const GRID_START = minutesOf("08:00");
const GRID_END = minutesOf("16:00");
const GRID_SPAN = GRID_END - GRID_START;

export function NewAppointmentModal({
  open,
  onClose,
  patientOptions,
  members,
  profession,
}: {
  open: boolean;
  onClose: () => void;
  patientOptions: { id: string; name: string }[];
  members: { id: string; name: string }[];
  profession?: string | null;
}) {
  const { lang } = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const typeOptions = apptTypesFor(profession);
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAppointmentAction({
        patientId: String(form.get("patient") ?? ""),
        providerId: String(form.get("provider") ?? ""),
        date: String(form.get("date") ?? ""),
        time: String(form.get("time") ?? ""),
        durationMin: Number(form.get("duration") ?? 30),
        type: String(form.get("type") ?? "checkup"),
        room: String(form.get("room") ?? ""),
        lang,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  const selectCls =
    "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {lang === "tr" ? "Yeni randevu" : "New appointment"}
          </h2>
          <button
            onClick={onClose}
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {patientOptions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Önce bir hasta eklemelisin — Hastalar sayfasından \"Yeni hasta\" ile başla."
              : "Add a patient first — start from the Patients page with \"New patient\"."}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="na-patient">{lang === "tr" ? "Hasta *" : "Patient *"}</Label>
              <select id="na-patient" name="patient" required defaultValue="" className={selectCls}>
                <option value="" disabled>
                  {lang === "tr" ? "Seç…" : "Select…"}
                </option>
                {patientOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="na-provider">{lang === "tr" ? "Sağlayıcı *" : "Provider *"}</Label>
              <select id="na-provider" name="provider" required defaultValue={members[0]?.id ?? ""} className={selectCls}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="na-date">{lang === "tr" ? "Tarih *" : "Date *"}</Label>
                <Input id="na-date" name="date" type="date" required defaultValue={defaultDate} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-time">{lang === "tr" ? "Saat *" : "Time *"}</Label>
                <Input id="na-time" name="time" type="time" required defaultValue="09:00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="na-duration">{lang === "tr" ? "Süre (dk)" : "Duration (min)"}</Label>
                <Input id="na-duration" name="duration" type="number" min={5} max={240} step={5} defaultValue={30} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-type">{lang === "tr" ? "Tür" : "Type"}</Label>
                <select id="na-type" name="type" defaultValue={typeOptions[0]} className={selectCls}>
                  {typeOptions.map((value) => (
                    <option key={value} value={value}>
                      {typeLabel(value, profession)[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="na-room">{lang === "tr" ? "Oda (opsiyonel)" : "Room (optional)"}</Label>
              <Input id="na-room" name="room" placeholder={lang === "tr" ? "Örn. 2" : "e.g. 2"} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {lang === "tr" ? "Randevuyu oluştur" : "Book appointment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function AppointmentsClient({
  calendarEvents,
  schedule,
  providers,
  weekDays,
  patientOptions,
  members,
  profession,
}: {
  calendarEvents: CalEvent[];
  schedule: ScheduleSlot[];
  providers: string[];
  weekDays: WeekDay[];
  patientOptions: { id: string; name: string }[];
  members: { id: string; name: string }[];
  profession?: string | null;
}) {
  const { lang } = useLang();
  const [view, setView] = useState<"week" | "day">("week");
  const todayKey = weekDays.find((d) => d.today)?.key ?? weekDays[0]?.key ?? "mon";
  const [activeDay, setActiveDay] = useState(todayKey);
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [pending, startTransition] = useTransition();
  const [actionMsg, setActionMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const dayEvents = (key: string) => calendarEvents.filter((e) => e.day === key);

  function selectEvent(e: CalEvent) {
    setActionMsg(null);
    setSelected(e);
  }

  function handleSendReminder() {
    if (!selected) return;
    setActionMsg(null);
    startTransition(async () => {
      const res = await sendReminderAction(selected.id, lang);
      setActionMsg(
        res.ok
          ? { tone: "success", text: lang === "tr" ? "Hatırlatma SMS'i gönderildi." : "Reminder SMS sent." }
          : { tone: "error", text: res.error ?? (lang === "tr" ? "Gönderilemedi." : "Failed to send.") },
      );
    });
  }

  function handleJoinTelehealth() {
    if (!selected) return;
    setActionMsg(null);
    startTransition(async () => {
      const res = await joinTelehealthAction(selected.id);
      if (res.ok) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        setActionMsg({ tone: "error", text: res.error ?? (lang === "tr" ? "Oda oluşturulamadı." : "Could not create room.") });
      }
    });
  }

  function handleSendTelehealthLink() {
    if (!selected) return;
    setActionMsg(null);
    startTransition(async () => {
      const res = await sendTelehealthLinkAction(selected.id, lang);
      setActionMsg(
        res.ok
          ? { tone: "success", text: lang === "tr" ? "Görüntülü görüşme linki hastaya gönderildi." : "Video link sent to the patient." }
          : { tone: "error", text: res.error ?? (lang === "tr" ? "Gönderilemedi." : "Failed to send.") },
      );
    });
  }

  return (
    <div className="mx-auto max-w-[1500px] animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Randevular" : "Appointments"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr" ? `${providers.length} sağlayıcı · klinik takvimi.` : `${providers.length} providers · clinic calendar.`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-pill">
            <button
              onClick={() => setView("week")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {lang === "tr" ? "Hafta" : "Week"}
            </button>
            <button
              onClick={() => setView("day")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {lang === "tr" ? "Gün" : "Day"}
            </button>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "Randevu" : "New appointment"}
          </button>
        </div>
      </div>

      {/* Toolbar: week nav + provider legend */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 shadow-pill">
          <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-[13px] font-semibold">{lang === "tr" ? "Bu hafta" : "This week"}</span>
          <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {providers.map((p, i) => (
            <span key={p} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: ["var(--seg-1)", "var(--seg-2)", "var(--seg-4)"][i % 3] }} />
              {p}
            </span>
          ))}
        </div>
      </div>

      {view === "week" ? (
        <WeekGrid dayEvents={dayEvents} onSelect={selectEvent} weekDays={weekDays} profession={profession} />
      ) : (
        <DayView day={activeDay} setDay={setActiveDay} events={dayEvents(activeDay)} onSelect={selectEvent} weekDays={weekDays} todayKey={todayKey} schedule={schedule} profession={profession} />
      )}

      <NewAppointmentModal open={showNew} onClose={() => setShowNew(false)} patientOptions={patientOptions} members={members} profession={profession} />


      {/* Selected event detail */}
      {selected && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft animate-float-up">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Randevu detayı" : "Appointment details"}</h3>
            <button onClick={() => setSelected(null)} className="text-[12px] text-muted-foreground hover:text-foreground">
              {lang === "tr" ? "Kapat" : "Close"}
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <Detail label={lang === "tr" ? "Hasta" : "Patient"} value={selected.patient} />
            <Detail label={lang === "tr" ? "Tür" : "Type"} value={typeLabel(selected.type, profession)[lang]} />
            <Detail label={lang === "tr" ? "Saat" : "Time"} value={`${formatTime(selected.start)} · ${selected.durationMin}m`} />
            <div>
              <p className="label-mono text-muted-foreground">{lang === "tr" ? "Durum" : "Status"}</p>
              <div className="mt-1.5"><StatusPill status={selected.status} lang={lang} /></div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-border pt-4">
            <button
              onClick={handleSendReminder}
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground" />}
              {lang === "tr" ? "SMS hatırlatma gönder" : "Send SMS reminder"}
            </button>
            {selected.type === "telehealth" && (
              <>
                <button
                  onClick={handleSendTelehealthLink}
                  disabled={pending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-muted-foreground" />}
                  {lang === "tr" ? "Hastaya linki gönder" : "Send link to patient"}
                </button>
                <button
                  onClick={handleJoinTelehealth}
                  disabled={pending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
                  {lang === "tr" ? "Görüntülü katıl" : "Join video"}
                </button>
              </>
            )}
            {actionMsg && (
              <span className={cn("text-[12.5px] font-medium", actionMsg.tone === "success" ? "text-success" : "text-destructive")}>
                {actionMsg.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-mono text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[14px] font-semibold">{value}</p>
    </div>
  );
}

/* ── Week grid ────────────────────────────────────────────────────────────── */
function WeekGrid({
  dayEvents,
  onSelect,
  weekDays,
  profession,
}: {
  dayEvents: (key: string) => CalEvent[];
  onSelect: (e: CalEvent) => void;
  weekDays: WeekDay[];
  profession?: string | null;
}) {
  const { lang } = useLang();
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          {/* Day header row */}
          <div className="grid grid-cols-[56px_repeat(6,1fr)] border-b border-border">
            <div className="border-r border-border" />
            {weekDays.map((d) => (
              <div key={d.key} className={cn("border-r border-border px-3 py-3 text-center last:border-r-0", d.today && "bg-primary/[0.03]")}>
                <p className="text-[11px] font-medium uppercase text-muted-foreground">{d.label[lang]}</p>
                <p className={cn("tnum mt-0.5 text-[17px] font-bold", d.today ? "text-primary" : "text-foreground")}>{d.date}</p>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative grid grid-cols-[56px_repeat(6,1fr)]" style={{ height: 520 }}>
            <div className="relative border-r border-border">
              {CALENDAR_HOURS.map((hh) => {
                const top = ((minutesOf(hh) - GRID_START) / GRID_SPAN) * 100;
                return (
                  <span key={hh} className="tnum absolute right-2 -translate-y-1/2 text-[10px] text-muted-foreground" style={{ top: `${top}%` }}>
                    {hh}
                  </span>
                );
              })}
            </div>
            {weekDays.map((d) => (
              <div key={d.key} className={cn("relative border-r border-border last:border-r-0", d.today && "bg-primary/[0.02]")}>
                {CALENDAR_HOURS.map((hh) => {
                  const top = ((minutesOf(hh) - GRID_START) / GRID_SPAN) * 100;
                  return <span key={hh} className="absolute inset-x-0 h-px bg-border/60" style={{ top: `${top}%` }} />;
                })}
                {dayEvents(d.key).map((ev) => {
                  const top = ((minutesOf(ev.start) - GRID_START) / GRID_SPAN) * 100;
                  const height = (ev.durationMin / GRID_SPAN) * 100;
                  const color = STATUS_LABEL[ev.status].var;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onSelect(ev)}
                      className="absolute inset-x-1 overflow-hidden rounded-lg px-2 py-1 text-left text-[10.5px] font-medium transition-shadow hover:shadow-pop"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(height, 8)}%`,
                        background: `color-mix(in oklch, ${color} 13%, var(--color-card))`,
                        borderLeft: `2.5px solid ${color}`,
                      }}
                    >
                      <span className="block truncate font-semibold leading-tight">{ev.patient}</span>
                      <span className="block truncate text-muted-foreground">{typeLabel(ev.type, profession)[lang]}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Day view: a single column with the full schedule list ─────────────────── */
function DayView({
  day,
  setDay,
  events,
  onSelect,
  weekDays,
  todayKey,
  schedule,
  profession,
}: {
  day: string;
  setDay: (d: string) => void;
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
  weekDays: WeekDay[];
  todayKey: string;
  schedule: ScheduleSlot[];
  profession?: string | null;
}) {
  const { lang } = useLang();
  const agendaRows =
    day === todayKey
      ? schedule.map((s) => ({ id: s.id, time: s.time, patient: s.patient, type: s.type, status: s.status }))
      : events.map((e) => ({ id: e.id, time: e.start, patient: e.patient, type: e.type, status: e.status }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* Day picker + agenda */}
      <div className="space-y-4">
        <div className="flex gap-1.5">
          {weekDays.map((d) => (
            <button
              key={d.key}
              onClick={() => setDay(d.key)}
              className={cn(
                "flex flex-1 flex-col items-center rounded-xl border py-2.5 transition-colors",
                day === d.key ? "border-primary bg-primary/[0.05]" : "border-border bg-card hover:bg-muted/50",
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{d.label[lang]}</span>
              <span className={cn("tnum mt-0.5 text-[16px] font-bold", day === d.key ? "text-primary" : "text-foreground")}>{d.date}</span>
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border p-4">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Gün listesi" : "Agenda"}</h2>
          </div>
          <div className="divide-y divide-border/60">
            {agendaRows.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="tnum w-12 shrink-0 text-[12px] font-semibold text-muted-foreground">{formatTime(s.time)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight">{s.patient}</p>
                  <p className="text-[11px] text-muted-foreground">{typeLabel(s.type, profession)[lang]}</p>
                </div>
                <StatusPill status={s.status} lang={lang} />
              </div>
            ))}
            {agendaRows.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">{lang === "tr" ? "Bu gün için randevu yok." : "No appointments this day."}</p>
            )}
          </div>
        </div>
      </div>

      {/* Single-day timeline */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-[15px] font-semibold tracking-tight">
          {weekDays.find((d) => d.key === day)?.label[lang]} · {weekDays.find((d) => d.key === day)?.date}
        </h2>
        <div className="relative mt-4" style={{ height: 480 }}>
          {CALENDAR_HOURS.map((hh) => {
            const top = ((minutesOf(hh) - GRID_START) / GRID_SPAN) * 100;
            return (
              <div key={hh} className="absolute inset-x-0 flex items-center gap-3" style={{ top: `${top}%` }}>
                <span className="tnum w-10 shrink-0 text-[10px] text-muted-foreground">{hh}</span>
                <span className="h-px flex-1 bg-border/60" />
              </div>
            );
          })}
          {events.map((ev) => {
            const top = ((minutesOf(ev.start) - GRID_START) / GRID_SPAN) * 100;
            const height = (ev.durationMin / GRID_SPAN) * 100;
            const color = STATUS_LABEL[ev.status].var;
            return (
              <button
                key={ev.id}
                onClick={() => onSelect(ev)}
                className="absolute left-14 right-2 overflow-hidden rounded-lg px-3 py-1.5 text-left transition-shadow hover:shadow-pop"
                style={{
                  top: `${top}%`,
                  height: `${Math.max(height, 8)}%`,
                  background: `color-mix(in oklch, ${color} 13%, var(--color-card))`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold leading-tight">{ev.patient}</span>
                  <TypeChip type={ev.type} lang={lang} profession={profession} />
                </div>
                <span className="tnum text-[10.5px] text-muted-foreground">{formatTime(ev.start)} · {ev.durationMin}m</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
