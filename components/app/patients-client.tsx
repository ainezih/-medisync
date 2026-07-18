"use client";

import { useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown, UserPlus } from "lucide-react";
import { Avatar, PatientDrawer } from "@/components/app/clinic";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatShortDate } from "@/lib/utils";
import { SEX_LABEL, PATIENT_STATUS_LABEL, type Patient, type PatientStatus } from "@/lib/data/types";

const STATUS_FILTERS: { key: PatientStatus | "all"; tr: string; en: string }[] = [
  { key: "all", tr: "Tümü", en: "All" },
  { key: "active", tr: "Aktif", en: "Active" },
  { key: "new", tr: "Yeni", en: "New" },
  { key: "overdue", tr: "Gecikmiş", en: "Overdue" },
  { key: "inactive", tr: "Pasif", en: "Inactive" },
];

const TONE: Record<PatientStatus, string> = {
  active: "text-success bg-success/10",
  new: "text-info bg-info/10",
  overdue: "text-destructive bg-destructive/10",
  inactive: "text-muted-foreground bg-muted",
};

export function PatientsClient({ patients }: { patients: Patient[] }) {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PatientStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      patients.filter((p) => {
        const matchesQuery =
          !query ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.mrn.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === "all" || p.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [query, filter, patients],
  );

  const selectedPatient = patients.find((p) => p.id === selected) ?? null;
  const counts: Record<string, number> = { all: patients.length };
  for (const p of patients) counts[p.status] = (counts[p.status] ?? 0) + 1;

  return (
    <div className="mx-auto max-w-[1500px] animate-fade-in">
      <div className={cn("grid gap-6", selectedPatient ? "xl:grid-cols-[1fr_380px]" : "grid-cols-1")}>
        <div className="min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Hastalar" : "Patients"}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {lang === "tr"
                  ? `${patients.length} hasta · bir satıra tıkla, dosyası açılır.`
                  : `${patients.length} patients · click a row to open the chart.`}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                {lang === "tr" ? "Dışa aktar" : "Export"}
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                <UserPlus className="h-4 w-4" />
                {lang === "tr" ? "Yeni hasta" : "New patient"}
              </button>
            </div>
          </div>

          {/* Filters + search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors",
                    filter === f.key ? "border-primary bg-primary/[0.06] text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {lang === "tr" ? f.tr : f.en}
                  <span className="tnum rounded-full bg-muted px-1.5 text-[10px] font-semibold">{counts[f.key] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={lang === "tr" ? "İsim, MRN ya da e-posta…" : "Name, MRN or email…"}
                  className="w-40 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:w-52"
                />
              </div>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                {lang === "tr" ? "Sırala" : "Sort"}
              </button>
            </div>
          </div>

          {/* Roster table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Hasta" : "Patient"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Yaş / Cins" : "Age / Sex"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground sm:table-cell">{lang === "tr" ? "Tanılar" : "Conditions"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Son ziyaret" : "Last visit"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Sonraki" : "Next appt"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Durum" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const isSel = p.id === selected;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelected(p.id)}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                          isSel ? "bg-primary/[0.04]" : "hover:bg-muted/50",
                        )}
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={p.initials} size={32} />
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">{p.name}</p>
                              <p className="tnum text-xs text-muted-foreground">{p.mrn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="tnum text-[13px]">{p.age ?? "—"}</span>
                          <span className="text-[13px] text-muted-foreground"> · {p.sex ? t(SEX_LABEL[p.sex]).slice(0, 1) : "—"}</span>
                        </td>
                        <td className="hidden py-3 sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {p.conditions.length ? (
                              p.conditions.slice(0, 2).map((c) => (
                                <span key={c} className="rounded-md bg-info/10 px-1.5 py-0.5 text-[10.5px] font-medium text-info">
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-[13px] text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3"><span className="tnum text-[13px] text-muted-foreground">{p.lastVisit ? formatShortDate(p.lastVisit) : "—"}</span></td>
                        <td className="py-3">
                          {p.nextAppt ? (
                            <span className="tnum text-[13px]">{formatShortDate(p.nextAppt)}</span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", TONE[p.status])}>
                            {t(PATIENT_STATUS_LABEL[p.status])}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                        {lang === "tr" ? "Eşleşen hasta yok." : "No matching patients."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chart drawer */}
        {selectedPatient && (
          <aside className="animate-float-up xl:sticky xl:top-2 xl:self-start">
            <PatientDrawer patient={selectedPatient} onClose={() => setSelected(null)} />
          </aside>
        )}
      </div>
    </div>
  );
}
