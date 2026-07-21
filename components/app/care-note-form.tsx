"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { Input, Label, Textarea } from "@/components/ui/input";
import { CARE_NOTE_KIND_LABEL, type CareNoteKind } from "@/lib/data/types";
import { createCareNoteAction } from "@/app/(app)/patients/actions";

export function NewCareNoteModal({
  open,
  onClose,
  patientId,
  patientName,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  kind: CareNoteKind;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const targetWeightRaw = String(form.get("targetWeightKg") ?? "").trim();
    const caloriesRaw = String(form.get("caloriesPerDay") ?? "").trim();
    const dateRaw = String(form.get("occurredAt") ?? "").trim();
    startTransition(async () => {
      const res = await createCareNoteAction({
        patientId,
        patientName,
        kind,
        occurredAt: dateRaw ? new Date(dateRaw).toISOString() : undefined,
        note: String(form.get("note") ?? ""),
        mood: String(form.get("mood") ?? ""),
        goal: String(form.get("goal") ?? ""),
        targetWeightKg: targetWeightRaw ? Number(targetWeightRaw) : null,
        caloriesPerDay: caloriesRaw ? Number(caloriesRaw) : null,
        mealPlan: String(form.get("mealPlan") ?? ""),
        exercisePlan: String(form.get("exercisePlan") ?? ""),
        progressNote: String(form.get("progressNote") ?? ""),
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {t(CARE_NOTE_KIND_LABEL[kind])} · {patientName}
          </h2>
          <button
            onClick={onClose}
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="cn-date">{lang === "tr" ? "Tarih" : "Date"}</Label>
            <Input id="cn-date" name="occurredAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>

          {kind === "session_note" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="cn-mood">{lang === "tr" ? "Ruh hali" : "Mood"}</Label>
                <Input id="cn-mood" name="mood" placeholder={lang === "tr" ? "Örn. Sakin, kaygılı" : "e.g. Calm, anxious"} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cn-goal">{lang === "tr" ? "Hedef / odak" : "Goal / focus"}</Label>
                <Input id="cn-goal" name="goal" placeholder={lang === "tr" ? "Bu seansın odağı" : "This session's focus"} />
              </div>
            </>
          )}

          {kind === "nutrition_plan" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cn-weight">{lang === "tr" ? "Hedef kilo (kg)" : "Target weight (kg)"}</Label>
                  <Input id="cn-weight" name="targetWeightKg" type="number" step="0.1" min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cn-cal">{lang === "tr" ? "Günlük kalori" : "Calories / day"}</Label>
                  <Input id="cn-cal" name="caloriesPerDay" type="number" min={0} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cn-meals">{lang === "tr" ? "Öğün planı" : "Meal plan"}</Label>
                <Textarea id="cn-meals" name="mealPlan" rows={3} placeholder={lang === "tr" ? "Kahvaltı: ...\nÖğle: ...\nAkşam: ..." : "Breakfast: ...\nLunch: ...\nDinner: ..."} />
              </div>
            </>
          )}

          {kind === "exercise_plan" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="cn-exercises">{lang === "tr" ? "Egzersiz seti" : "Exercise set"}</Label>
                <Textarea id="cn-exercises" name="exercisePlan" rows={3} placeholder={lang === "tr" ? "3x10 squat\n3x12 lunge" : "3x10 squats\n3x12 lunges"} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cn-progress">{lang === "tr" ? "İlerleme notu" : "Progress note"}</Label>
                <Input id="cn-progress" name="progressNote" placeholder={lang === "tr" ? "Örn. Ağrı azaldı" : "e.g. Pain decreased"} />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cn-note">{lang === "tr" ? "Not" : "Note"}</Label>
            <Textarea id="cn-note" name="note" rows={3} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {lang === "tr" ? "Kaydet" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
