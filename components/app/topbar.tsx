"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Clock, Plus } from "lucide-react";
import appConfig from "@/app.config";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { TrialInfo } from "@/lib/trial";

export function Topbar({ trial }: { trial?: TrialInfo | null }) {
  const pathname = usePathname();
  const { t, lang } = useLang();
  const current =
    appConfig.nav.find((n) => pathname === n.href || pathname.startsWith(n.href + "/")) ??
    appConfig.navGroups.flatMap((g) => g.items).find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur lg:px-8">
      <span className="font-display text-[15px] font-semibold tracking-tight md:hidden">
        {current ? t(current.label) : appConfig.name}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        {trial && trial.status === "trialing" && (
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium sm:inline-flex",
              trial.daysLeft <= 3 ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {lang === "tr"
              ? `Deneme: ${Math.max(trial.daysLeft, 0)} gün kaldı`
              : `Trial: ${Math.max(trial.daysLeft, 0)} day${trial.daysLeft === 1 ? "" : "s"} left`}
          </span>
        )}
        <Link
          href="/appointments"
          className="hidden h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {lang === "tr" ? "Randevu" : "New appt"}
        </Link>
        <LanguageToggle className="mr-1" />
        <button
          aria-label="Notifications"
          className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
        </button>
      </div>
    </header>
  );
}
