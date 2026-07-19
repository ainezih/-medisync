import { redirect } from "next/navigation";
import appConfig from "@/app.config";
import { SettingsClient } from "@/components/app/settings-client";
import { createClient } from "@/lib/supabase/server";

/** Server side: an integration is "connected" when all its env vars exist. */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    : { data: null };
  if (!profile?.is_admin) redirect("/dashboard");

  const connected: Record<string, boolean> = {};
  for (const it of appConfig.integrations) {
    connected[it.key] = it.envVars.every((v) => !!process.env[v]);
  }
  return <SettingsClient connected={connected} />;
}
