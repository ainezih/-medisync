"use client";

import { useState } from "react";
import { Check, CalendarPlus, UserCheck, Clock } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/app/clinic";

interface DemoSlot {
  time: string;
  patient?: string;
  initials?: string;
  type?: string;
  checkedIn?: boolean;
}

const TYPE_OPTS: { key: string; tr: string; en: string }[] = [
  { key: "checkup", tr: "Kontrol", en: "Check-up" },
  { key: "follow-up", tr: "Takip", en: "Follow-up" },
  { key: "telehealth", tr: "Teletıp", en: "Telehealth" },
];

/**
 * Interactive landing demo: pick an open slot, name a patient + visit type,
 * book it → it lands on the schedule and the patient can be "checked in".
 * Pure useState, no deps.
 */
export function BookingDemo() {
  const { lang } = useLang();

  const [slots, setSlots] = useState<DemoSlot[]>([
    { time: "9:00", patient: "Marcus Bennett", initials: "MB", type: "checkup", checkedIn: true },
    { time: "9:30", patient: "Priya Nair", initials: "PN", type: "follow-up", checkedIn: false },
    { time: "10:00" },
    { time: "10:30" },
    { time: "11:00" },
  ]);

  const [name, setName] = useState("Jordan Ellis");
  const [type, setType] = useState("checkup");
  const [pickedTime, setPickedTime] = useState<string | null>("10:00");
  const [justBooked, setJustBooked] = useState<string | null>(null);

  const openSlots = slots.filter((s) => !s.patient);

  function book() {
    if (!pickedTime || !name.trim()) return;
    const initials = name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setSlots((prev) =>
      prev.map((s) => (s.time === pickedTime ? { ...s, patient: name.trim(), initials, type, checkedIn: false } : s)),
    );
    setJustBooked(pickedTime);
    const next = openSlots.find((s) => s.time !== pickedTime);
    setPickedTime(next?.time ?? null);
    setTimeout(() => setJustBooked(null), 2200);
  }

  function checkIn(time: string) {
    setSlots((prev) => prev.map((s) => (s.time === time ? { ...s, checkedIn: true } : s)));
  }

  const labelFor = (key?: string) => {
    const o = TYPE_OPTS.find((x) => x.key === key);
    return o ? (lang === "tr" ? o.tr : o.en) : "";
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1fr]">
      {/* Booking form */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-pop">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <CalendarPlus className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{lang === "tr" ? "Randevu al" : "Book an appointment"}</p>
            <p className="text-[11.5px] text-muted-foreground">{lang === "tr" ? "Boş bir slot seç" : "Pick an open slot"}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label-mono text-muted-foreground">{lang === "tr" ? "Hasta adı" : "Patient name"}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="label-mono text-muted-foreground">{lang === "tr" ? "Ziyaret türü" : "Visit type"}</label>
            <div className="mt-1.5 flex gap-1.5">
              {TYPE_OPTS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setType(o.key)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-[12px] font-medium transition-colors",
                    type === o.key ? "border-primary bg-primary/[0.06] text-primary" : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {lang === "tr" ? o.tr : o.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-mono text-muted-foreground">{lang === "tr" ? "Boş saatler" : "Open times"}</label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {openSlots.length ? (
                openSlots.map((s) => (
                  <button
                    key={s.time}
                    onClick={() => setPickedTime(s.time)}
                    className={cn(
                      "tnum rounded-lg border py-2 text-[12.5px] font-semibold transition-colors",
                      pickedTime === s.time ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
                    )}
                  >
                    {s.time}
                  </button>
                ))
              ) : (
                <p className="col-span-3 rounded-lg bg-muted/50 py-2 text-center text-[12px] text-muted-foreground">
                  {lang === "tr" ? "Bugün boş slot kalmadı" : "No open slots left today"}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={book}
            disabled={!pickedTime || !name.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <CalendarPlus className="h-4 w-4" />
            {lang === "tr" ? "Randevuyu onayla" : "Confirm booking"}
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            {lang === "tr" ? "Hatırlatma SMS'i otomatik gönderilir." : "A reminder SMS goes out automatically."}
          </p>
        </div>
      </div>

      {/* Live schedule */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-pop">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{lang === "tr" ? "Bugünün programı" : "Today's schedule"}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {slots.filter((s) => s.patient).length} {lang === "tr" ? "dolu" : "booked"}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {slots.map((s) => {
            const booked = !!s.patient;
            const isNew = justBooked === s.time;
            return (
              <div
                key={s.time}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
                  booked ? "border-border bg-card" : "border-dashed border-border/70 bg-muted/20",
                  isNew && "border-primary/50 bg-primary/[0.05] ring-1 ring-primary/20",
                )}
              >
                <span className="tnum w-12 shrink-0 text-[12.5px] font-semibold text-muted-foreground">{s.time}</span>
                {booked ? (
                  <>
                    <Avatar initials={s.initials!} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold leading-tight">{s.patient}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{labelFor(s.type)}</p>
                    </div>
                    {s.checkedIn ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                        <Check className="h-3 w-3" strokeWidth={3} />
                        {lang === "tr" ? "kayıtlı" : "checked in"}
                      </span>
                    ) : (
                      <button
                        onClick={() => checkIn(s.time)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <UserCheck className="h-3 w-3" />
                        {lang === "tr" ? "Kayıt yap" : "Check in"}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {lang === "tr" ? "Boş" : "Open"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
