"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Settings, LifeBuoy, LogOut } from "lucide-react";
import appConfig from "@/app.config";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Sidebar({ fullName, title, isAdmin }: { fullName: string; title: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useLang();
  const navGroups = isAdmin ? appConfig.navGroups : appConfig.navGroups.filter((g) => g.label.en !== "Finance");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="inline-flex">
          <Logo withChevron />
        </Link>
      </div>

      {/* AI search pill */}
      <div className="px-3 pb-2">
        <button className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{lang === "tr" ? "Hasta ara" : "Find a patient"}</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group) => (
          <div key={t(group.label)} className="mb-4">
            <p className="label-mono px-3 pb-1.5 pt-2 text-sidebar-muted">{t(group.label)}</p>
            <div className="space-y-0.5">
              {group.items.map((item, idx) => {
                const active = !item.muted && isActive(item.href) && (idx === 0 || true);
                const inner = (
                  <>
                    <Icon
                      name={item.icon}
                      className={cn("h-[17px] w-[17px] shrink-0", active ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="truncate">{t(item.label)}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">
                        {t(item.badge)}
                      </span>
                    )}
                    {item.muted && (
                      <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                        {lang === "tr" ? "yakında" : "soon"}
                      </span>
                    )}
                  </>
                );
                // Muted items are "coming soon" — render non-navigating.
                if (item.muted) {
                  return (
                    <span
                      key={`${item.href}-${idx}`}
                      className="group flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-sidebar-muted"
                    >
                      {inner}
                    </span>
                  );
                }
                return (
                  <Link
                    key={`${item.href}-${idx}`}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                      active ? "nav-pill-active text-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings + Support */}
      <div className="space-y-0.5 px-3 pb-2">
        {isAdmin && (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
              isActive("/settings") ? "nav-pill-active text-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground",
            )}
          >
            <Settings className="h-[17px] w-[17px] text-muted-foreground" />
            {lang === "tr" ? "Ayarlar" : "Settings"}
          </Link>
        )}
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground">
          <LifeBuoy className="h-[17px] w-[17px] text-muted-foreground" />
          {lang === "tr" ? "Destek" : "Support"}
        </button>
      </div>

      {/* Pinned user card — the attending provider */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-2.5 py-2 shadow-pill">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
            {initialsOf(fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{fullName}</p>
            {title && <p className="truncate text-[11.5px] text-muted-foreground">{title}</p>}
          </div>
          <button
            onClick={handleLogout}
            aria-label={lang === "tr" ? "Çıkış" : "Log out"}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
