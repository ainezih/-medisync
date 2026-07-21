"use client";

import { useState } from "react";
import { X, Phone, Mail, Pill, FileText, ClipboardList, AlertTriangle, Activity, CalendarClock, Brain, Utensils, Dumbbell, Plus } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatShortDate } from "@/lib/utils";
import {
  STATUS_LABEL,
  TYPE_LABEL,
  SEX_LABEL,
  CARE_NOTE_KIND_LABEL,
  type ApptStatus,
  type ApptType,
  type Patient,
  type CareNoteKind,
} from "@/lib/data/types";
import { NewCareNoteModal } from "@/components/app/care-note-form";

/* ── SVG-initial avatar (no photos, ever) ─────────────────────────────────── */
export function Avatar({
  initials,
  size = 36,
  tone = "brand",
}: {
  initials: string;
  size?: number;
  tone?: "brand" | "muted";
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold",
        tone === "brand" ? "text-white" : "bg-muted text-muted-foreground",
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        backgroundImage: tone === "brand" ? "var(--grad-brand)" : undefined,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ── Appointment status pill ──────────────────────────────────────────────── */
export function StatusPill({ status, lang }: { status: ApptStatus; lang: "tr" | "en" }) {
  const s = STATUS_LABEL[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: s.var, background: `color-mix(in oklch, ${s.var} 12%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.var }} />
      {lang === "tr" ? s.tr : s.en}
    </span>
  );
}

/* ── Appointment-type chip ────────────────────────────────────────────────── */
export function TypeChip({ type, lang }: { type: ApptType; lang: "tr" | "en" }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
      {TYPE_LABEL[type][lang]}
    </span>
  );
}

const RX_TONE: Record<string, string> = {
  active: "text-success bg-success/10",
  pending: "text-warning-foreground bg-warning/15",
  completed: "text-muted-foreground bg-muted",
};

const CARE_NOTE_TONE: Record<string, string> = {
  active: "text-success bg-success/10",
  completed: "text-muted-foreground bg-muted",
};

/** Which profession gets its own module instead of the generic Prescriptions section. */
const PROFESSION_CARE_KIND: Record<string, CareNoteKind> = {
  psychologist: "session_note",
  dietitian: "nutrition_plan",
  physiotherapist: "exercise_plan",
};

const CARE_NOTE_ICON: Record<CareNoteKind, typeof Brain> = {
  session_note: Brain,
  nutrition_plan: Utensils,
  exercise_plan: Dumbbell,
};

function careNoteSummary(n: Patient["careNotes"][number]): string {
  if (n.kind === "session_note") return n.goal || n.mood || n.note || "—";
  if (n.kind === "nutrition_plan") return n.mealPlan || n.note || "—";
  return n.exercisePlan || n.note || "—";
}

/* ── Patient chart drawer ─────────────────────────────────────────────────── */
export function PatientDrawer({
  patient,
  profession,
  onClose,
}: {
  patient: Patient;
  /** Signed-in provider's profession — picks the profile-appropriate module (Faz 4). */
  profession?: string | null;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const [showNewNote, setShowNewNote] = useState(false);
  const careKind = profession ? PROFESSION_CARE_KIND[profession] : undefined;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={patient.initials} size={44} />
          <div>
            <p className="font-display text-[16px] font-semibold leading-tight tracking-tight">{patient.name}</p>
            <p className="tnum text-[12px] text-muted-foreground">
              {patient.age ?? "—"} · {patient.sex ? t(SEX_LABEL[patient.sex]) : "—"} · {patient.mrn}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={lang === "tr" ? "Kapat" : "Close"}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-2 text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" /> <span className="tnum">{patient.phone}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 truncate text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{patient.email}</span>
        </span>
      </div>

      {/* Next appointment */}
      {patient.nextAppt && (
        <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/[0.05] px-3 py-2.5 text-[13px]">
          <CalendarClock className="h-4 w-4 text-primary" />
          <span className="font-medium">{lang === "tr" ? "Sonraki randevu" : "Next appointment"}</span>
          <span className="tnum ml-auto font-semibold text-primary">{formatShortDate(patient.nextAppt)}</span>
        </div>
      )}

      {/* Vitals */}
      <div>
        <p className="label-mono mb-2 flex items-center gap-1.5 text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> {lang === "tr" ? "Vital bulgular" : "Vitals"}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { k: lang === "tr" ? "TA" : "BP", v: patient.vitals.bp },
            { k: lang === "tr" ? "Nabız" : "HR", v: patient.vitals.hr },
            { k: "BMI", v: patient.vitals.bmi },
            { k: lang === "tr" ? "Ateş" : "Temp", v: patient.vitals.temp },
          ].map((m) => (
            <div key={m.k} className="rounded-xl border border-border bg-muted/30 p-2 text-center">
              <p className="tnum text-[13px] font-semibold leading-none">{m.v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{m.k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conditions + allergies */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="label-mono mb-1.5 text-muted-foreground">{lang === "tr" ? "Tanılar" : "Conditions"}</p>
          <div className="flex flex-wrap gap-1.5">
            {patient.conditions.length ? (
              patient.conditions.map((c) => (
                <span key={c} className="rounded-md bg-info/10 px-2 py-0.5 text-[11px] font-medium text-info">
                  {c}
                </span>
              ))
            ) : (
              <span className="text-[12px] text-muted-foreground">—</span>
            )}
          </div>
        </div>
        <div>
          <p className="label-mono mb-1.5 flex items-center gap-1 text-muted-foreground">
            <AlertTriangle className="h-3 w-3" /> {lang === "tr" ? "Alerjiler" : "Allergies"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies.length ? (
              patient.allergies.map((a) => (
                <span key={a} className="rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                  {a}
                </span>
              ))
            ) : (
              <span className="text-[12px] text-muted-foreground">{lang === "tr" ? "Bilinen yok" : "None known"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Visit history */}
      <div>
        <p className="label-mono mb-2 flex items-center gap-1.5 text-muted-foreground">
          <ClipboardList className="h-3.5 w-3.5" /> {lang === "tr" ? "Ziyaret geçmişi" : "Visit history"}
        </p>
        <div className="space-y-2">
          {patient.visits.map((v) => (
            <div key={v.id} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold">{v.reason}</p>
                <span className="tnum text-[11px] text-muted-foreground">{formatShortDate(v.date)}</span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">{v.provider}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/80">{v.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prescriptions, or a profession-specific module (Faz 4) */}
      {careKind ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="label-mono flex items-center gap-1.5 text-muted-foreground">
              {(() => {
                const KindIcon = CARE_NOTE_ICON[careKind];
                return <KindIcon className="h-3.5 w-3.5" />;
              })()}
              {t(CARE_NOTE_KIND_LABEL[careKind])}
            </p>
            <button
              onClick={() => setShowNewNote(true)}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" /> {lang === "tr" ? "Ekle" : "Add"}
            </button>
          </div>
          {patient.careNotes.filter((n) => n.kind === careKind).length ? (
            <div className="space-y-1.5">
              {patient.careNotes
                .filter((n) => n.kind === careKind)
                .map((n) => {
                  const KindIcon = CARE_NOTE_ICON[n.kind];
                  return (
                    <div key={n.id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                        <KindIcon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight">{careNoteSummary(n)}</p>
                        <p className="tnum text-[11px] text-muted-foreground">{formatShortDate(n.occurredAt)}</p>
                      </div>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", CARE_NOTE_TONE[n.status])}>
                        {n.status}
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              {lang === "tr" ? "Henüz kayıt yok" : "No entries yet"}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="label-mono mb-2 flex items-center gap-1.5 text-muted-foreground">
            <Pill className="h-3.5 w-3.5" /> {lang === "tr" ? "Reçeteler" : "Prescriptions"}
          </p>
          {patient.rx.length ? (
            <div className="space-y-1.5">
              {patient.rx.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
                    <Pill className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-tight">
                      {r.drug} <span className="tnum text-muted-foreground">{r.dose}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{r.freq}</p>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", RX_TONE[r.status])}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">{lang === "tr" ? "Aktif reçete yok" : "No active prescriptions"}</p>
          )}
        </div>
      )}

      {/* Documents */}
      <div>
        <p className="label-mono mb-2 flex items-center gap-1.5 text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> {lang === "tr" ? "Belgeler" : "Documents"}
        </p>
        {patient.docs.length ? (
          <div className="space-y-1.5">
            {patient.docs.map((d) => (
              <div key={d.name} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-[12.5px]">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate font-medium">{d.name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{d.kind}</span>
                <span className="tnum text-[11px] text-muted-foreground">{d.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">{lang === "tr" ? "Belge yok" : "No documents"}</p>
        )}
      </div>

      <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
        {lang === "tr" ? "Muayeneyi başlat" : "Open chart & start visit"}
      </button>

      {careKind && (
        <NewCareNoteModal
          open={showNewNote}
          onClose={() => setShowNewNote(false)}
          patientId={patient.id}
          patientName={patient.name}
          kind={careKind}
        />
      )}
    </div>
  );
}
