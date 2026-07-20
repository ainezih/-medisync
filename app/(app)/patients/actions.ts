"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/data/dashboard";

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
