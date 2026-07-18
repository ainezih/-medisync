"use client";

import { useLang } from "@/components/i18n/language-provider";
import { Avatar, StatusPill, TypeChip } from "@/components/app/clinic";

/* ── Inline-SVG fake-clinic wordmarks for the trusted-by row ────────────────── */
export function ClinicMark({ name }: { name: string }) {
  const glyphs: Record<string, React.ReactNode> = {
    "Cedar Family Care": <path d="M12 3 L20 18 H4 Z M12 9 L16 17 H8 Z" />,
    "Mercy Pediatrics": <path d="M12 4 c5 4 5 10 0 14 c-5 -4 -5 -10 0 -14 z" />,
    "Harbor Dermatology": <path d="M4 12 a8 8 0 1 1 16 0" />,
    "Northgate Clinic": <path d="M5 17 L9 5 L12 13 L15 5 L19 17" />,
    "Lakeside Health": <path d="M4 14 c3 -4 5 -4 8 0 s5 4 8 0" />,
    "Summit Practice": <path d="M4 18 L10 6 L14 14 L20 6" />,
    "Bright Smile Dental": <path d="M7 4 c3 -1 7 -1 10 0 c1 5 -1 14 -5 14 c-4 0 -6 -9 -5 -14 z" />,
    "Vista Orthopedics": <path d="M9 4 v6 a3 3 0 0 0 6 0 V4 M9 20 v-6 a3 3 0 0 1 6 0 v6" />,
  };
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground/70">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {glyphs[name]}
      </svg>
      <span className="text-[14.5px] font-semibold tracking-tight">{name}</span>
    </span>
  );
}

/* ── Hero product-preview: a mini schedule + patient chart peek ────────────── */
export function ProductPreview() {
  const { lang } = useLang();
  const rows = [
    { time: "9:00", patient: "Marcus Bennett", initials: "MB", type: "checkup" as const, status: "done" as const },
    { time: "9:30", patient: "Priya Nair", initials: "PN", type: "new-patient" as const, status: "in-room" as const },
    { time: "10:15", patient: "Daniel Cho", initials: "DC", type: "telehealth" as const, status: "checked-in" as const },
  ];

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-pop sm:p-5">
      {/* mini summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-[11px] font-medium text-muted-foreground">{lang === "tr" ? "Bugünkü randevu" : "Appointments today"}</p>
          <p className="mt-1 tnum text-lg font-bold leading-none">24</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">{lang === "tr" ? "Bekleyen" : "Checked in"}</p>
            <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold text-success">6</span>
          </div>
          <p className="mt-1 tnum text-lg font-bold leading-none">$3,940</p>
        </div>
      </div>

      {/* mini schedule */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-[auto_1fr_auto] gap-2 border-b border-border bg-muted/40 px-3 py-2 label-mono text-muted-foreground">
          <span>{lang === "tr" ? "Saat" : "Time"}</span>
          <span>{lang === "tr" ? "Hasta" : "Patient"}</span>
          <span className="text-right">{lang === "tr" ? "Durum" : "Status"}</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.time}
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5 ${i === 1 ? "bg-primary/[0.04]" : ""} ${i < rows.length - 1 ? "border-b border-border/60" : ""}`}
          >
            <span className="tnum text-[12px] font-semibold text-muted-foreground">{r.time}</span>
            <div className="flex items-center gap-2">
              <Avatar initials={r.initials} size={22} />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold leading-tight">{r.patient}</p>
                <TypeChip type={r.type} lang={lang} />
              </div>
            </div>
            <div className="text-right"><StatusPill status={r.status} lang={lang} /></div>
          </div>
        ))}
      </div>

      {/* chart peek */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 p-3">
        <Avatar initials="PN" size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold leading-tight">Priya Nair · 29</p>
          <p className="tnum truncate text-[10.5px] text-muted-foreground">BP 118/72 · HR 70 · BMI 22.0</p>
        </div>
        <button className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground">
          {lang === "tr" ? "Dosya" : "Chart"}
        </button>
      </div>
    </div>
  );
}
