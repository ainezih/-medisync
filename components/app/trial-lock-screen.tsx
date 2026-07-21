"use client";

import { useRouter } from "next/navigation";
import { Clock, LogOut, Mail } from "lucide-react";
import appConfig from "@/app.config";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/i18n/language-provider";
import { createClient } from "@/lib/supabase/client";

export function TrialLockScreen({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const { ui, lang } = useLang();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const subject = lang === "tr" ? "Abonelik başlatmak istiyorum" : "I want to subscribe";
  const contactHref = `mailto:hello@${appConfig.domain}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-5 lg:px-8">
        <Logo />
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <button
            onClick={handleLogout}
            aria-label={ui.logout}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-warning/15">
            <Clock className="h-6 w-6 text-warning-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            {lang === "tr" ? "Deneme süren sona erdi" : "Your trial has ended"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAdmin
              ? lang === "tr"
                ? "Kliniğinin verileri güvende — panele erişim aboneliğini başlatana kadar kilitli. Devam etmek için bizimle iletişime geç."
                : "Your clinic's data is safe — dashboard access is locked until you subscribe. Contact us to continue."
              : lang === "tr"
                ? "Kliniğinizin deneme süresi sona erdi. Devam etmek için klinik yöneticinizle iletişime geçin."
                : "Your clinic's trial has ended. Contact your clinic admin to continue."}
          </p>
          {isAdmin && (
            <a href={contactHref} className="mt-6 block">
              <Button size="lg" className="w-full">
                <Mail className="h-4 w-4" />
                {lang === "tr" ? "Bizimle iletişime geç" : "Contact us"}
              </Button>
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
