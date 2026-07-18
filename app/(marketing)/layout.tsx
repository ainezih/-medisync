"use client";

import Link from "next/link";
import appConfig from "@/app.config";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/i18n/language-provider";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { ui, lang } = useLang();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">{ui.features}</a>
            <a href="#how" className="hover:text-foreground transition-colors">{ui.howItWorks}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{ui.pricing}</a>
            <a href="#faq" className="hover:text-foreground transition-colors">{ui.faq}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-7">
            <LanguageToggle className="mr-1" />
            <Link href="/login">
              <Button variant="ghost" size="sm">{ui.signIn}</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">{ui.getStarted}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {lang === "tr"
                  ? "Küçük klinikler ve özel muayenehaneler için sakin hasta yönetimi."
                  : "Calm patient management for small clinics and private practices."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
              <div className="space-y-2">
                <p className="label-mono text-muted-foreground">{lang === "tr" ? "Ürün" : "Product"}</p>
                <a href="#features" className="block text-muted-foreground transition-colors hover:text-foreground">{ui.features}</a>
                <a href="#pricing" className="block text-muted-foreground transition-colors hover:text-foreground">{ui.pricing}</a>
                <a href="#faq" className="block text-muted-foreground transition-colors hover:text-foreground">{ui.faq}</a>
              </div>
              <div className="space-y-2">
                <p className="label-mono text-muted-foreground">{lang === "tr" ? "Klinik" : "Clinic"}</p>
                <Link href="/dashboard" className="block text-muted-foreground transition-colors hover:text-foreground">{lang === "tr" ? "Panel" : "Dashboard"}</Link>
                <Link href="/patients" className="block text-muted-foreground transition-colors hover:text-foreground">{lang === "tr" ? "Hastalar" : "Patients"}</Link>
                <Link href="/appointments" className="block text-muted-foreground transition-colors hover:text-foreground">{lang === "tr" ? "Randevular" : "Appointments"}</Link>
              </div>
              <div className="space-y-2">
                <p className="label-mono text-muted-foreground">{lang === "tr" ? "Hesap" : "Account"}</p>
                <Link href="/login" className="block text-muted-foreground transition-colors hover:text-foreground">{ui.signIn}</Link>
                <Link href="/signup" className="block text-muted-foreground transition-colors hover:text-foreground">{ui.getStarted}</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {appConfig.name} · {appConfig.domain}</p>
            <p>{lang === "tr" ? "Demo kiti · tüm hasta verisi kurgusaldır." : "Demo kit · all patient data is fictional."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
