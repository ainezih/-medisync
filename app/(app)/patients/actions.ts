"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/data/dashboard";
import type { CareNoteKind } from "@/lib/data/types";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export async function createPatientAction(input: {
  name: string;
  age?: number | null;
  sex?: "male" | "female" | "other" | null;
  phone?: string;
  email?: string;
  conditions?: string;
  lang?: "tr" | "en";
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: input.lang === "en" ? "Name is required." : "İsim zorunlu." };
  }

  const conditions = (input.conditions ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  // MRN is unique per clinic — retry a few times on the (unlikely) collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const mrn = `MRN-${String(Math.floor(10000 + Math.random() * 90000))}`;
    const { data, error } = await supabase
      .from("patients")
      .insert({
        name,
        initials: initialsOf(name),
        age: input.age ?? null,
        sex: input.sex ?? null,
        mrn,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        status: "new",
        conditions,
      })
      .select("id")
      .single();

    if (!error && data) {
      await logActivity(
        "System",
        input.lang === "en" ? "registered a new patient:" : "yeni hasta kaydetti:",
        name,
        "info",
      );
      revalidatePath("/patients");
      revalidatePath("/dashboard");
      return { ok: true, id: data.id };
    }
    if (error && error.code !== "23505") {
      return { ok: false, error: error.message };
    }
  }
  return { ok: false, error: "MRN collision — try again." };
}

const CARE_NOTE_KIND_TR: Record<CareNoteKind, string> = {
  session_note: "seans notu",
  nutrition_plan: "beslenme planı",
  exercise_plan: "egzersiz planı",
};
const CARE_NOTE_KIND_EN: Record<CareNoteKind, string> = {
  session_note: "session note",
  nutrition_plan: "nutrition plan",
  exercise_plan: "exercise plan",
};

export async function createCareNoteAction(input: {
  patientId: string;
  patientName: string;
  kind: CareNoteKind;
  occurredAt?: string;
  note?: string;
  mood?: string;
  goal?: string;
  targetWeightKg?: number | null;
  caloriesPerDay?: number | null;
  mealPlan?: string;
  exercisePlan?: string;
  progressNote?: string;
  lang?: "tr" | "en";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("care_notes").insert({
    patient_id: input.patientId,
    provider_id: user?.id ?? null,
    kind: input.kind,
    occurred_at: input.occurredAt || new Date().toISOString(),
    note: input.note?.trim() || null,
    mood: input.mood?.trim() || null,
    goal: input.goal?.trim() || null,
    target_weight_kg: input.targetWeightKg ?? null,
    calories_per_day: input.caloriesPerDay ?? null,
    meal_plan: input.mealPlan?.trim() || null,
    exercise_plan: input.exercisePlan?.trim() || null,
    progress_note: input.progressNote?.trim() || null,
  });

  if (error) return { ok: false, error: error.message };

  const kindLabel = input.lang === "en" ? CARE_NOTE_KIND_EN[input.kind] : CARE_NOTE_KIND_TR[input.kind];
  await logActivity(
    "System",
    input.lang === "en" ? `added a ${kindLabel}:` : `${kindLabel} ekledi:`,
    input.patientName,
    "info",
  );
  revalidatePath("/patients");
  revalidatePath("/dashboard");
  return { ok: true };
}
