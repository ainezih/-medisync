import { listPatients } from "@/lib/data/patients";
import { PatientsClient } from "@/components/app/patients-client";
import { createClient } from "@/lib/supabase/server";

export default async function PatientsPage() {
  const patients = await listPatients();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("profession").eq("id", user.id).maybeSingle()
    : { data: null };

  return <PatientsClient patients={patients} profession={profile?.profession ?? null} />;
}
