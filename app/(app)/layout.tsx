import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { TrialLockScreen } from "@/components/app/trial-lock-screen";
import { createClient } from "@/lib/supabase/server";
import { isTrialLocked, trialInfoFromClinic, type TrialInfo } from "@/lib/trial";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = user?.email ?? "";
  let title = "";
  let isAdmin = false;
  let profession: string | null = null;
  let trial: TrialInfo | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, is_admin, profession, clinics(trial_ends_at, subscription_status)")
      .eq("id", user.id)
      .maybeSingle();
    fullName = profile?.full_name ?? fullName;
    title = profile?.role ?? "";
    isAdmin = profile?.is_admin ?? false;
    profession = profile?.profession ?? null;

    const clinic = Array.isArray(profile?.clinics) ? profile.clinics[0] : profile?.clinics;
    if (clinic) trial = trialInfoFromClinic(clinic);
  }

  if (isTrialLocked(trial)) {
    return <TrialLockScreen isAdmin={isAdmin} />;
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar fullName={fullName} title={title} isAdmin={isAdmin} profession={profession} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar trial={trial} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
