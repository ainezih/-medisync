import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { createClient } from "@/lib/supabase/server";

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
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("full_name, role, is_admin").eq("id", user.id).maybeSingle();
    fullName = profile?.full_name ?? fullName;
    title = profile?.role ?? "";
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar fullName={fullName} title={title} isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
