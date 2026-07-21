"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ArrowUpDown, UserPlus, X, Loader2 } from "lucide-react";
import { Avatar, PatientDrawer } from "@/components/app/clinic";
import { useLang } from "@/components/i18n/language-provider";
import { Input, Label } from "@/components/ui/input";
import { cn, formatShortDate, formatPhoneTR } from "@/lib/utils";
import { SEX_LABEL, PATIENT_STATUS_LABEL, type Patient, type PatientStatus } from "@/lib/data/types";
import { createPatientAction } from "@/app/(app)/patients/actions";

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

export function NewPatientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const ageRaw = String(form.get("age") ?? "").trim();
    const sexRaw = String(form.get("sex") ?? "");
    startTransition(async () => {
      const res = await createPatientAction({
        name: String(form.get("name") ?? ""),
        age: ageRaw ? Number(ageRaw) : null,
        sex: sexRaw === "male" || sexRaw === "female" || sexRaw === "other" ? sexRaw : null,
        phone: String(form.get("phone") ?? "").replace(/\s+/g, ""),
        email: String(form.get("email") ?? ""),
        conditions: String(form.get("conditions") ?? ""),
        lang,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {lang === "tr" ? "Yeni hasta" : "New patient"}
          </h2>
          <button
            onClick={onClose}
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="np-name">{lang === "tr" ? "Ad Soyad *" : "Full name *"}</Label>
            <Input id="np-name" name="name" required placeholder={lang === "tr" ? "Ayşe Yılmaz" : "Jane Doe"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="np-age">{lang === "tr" ? "Yaş" : "Age"}</Label>
              <Input id="np-age" name="age" type="number" min={0} max={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-sex">{lang === "tr" ? "Cinsiyet" : "Sex"}</Label>
              <select
                id="np-sex"
                name="sex"
                defaultValue=""
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                <option value="">{lang === "tr" ? "Belirtilmedi" : "Not specified"}</option>
                <option value="female">{lang === "tr" ? "Kadın" : "Female"}</option>
                <option value="male">{lang === "tr" ? "Erkek" : "Male"}</option>
                <option value="other">{lang === "tr" ? "Diğer" : "Other"}</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-phone">{lang === "tr" ? "Telefon (hatırlatmalar için)" : "Phone (for reminders)"}</Label>
            <Input
              id="np-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              placeholder="+90 5xx xxx xx xx"
              maxLength={17}
              onChange={(e) => {
                e.target.value = formatPhoneTR(e.target.value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-email">E-posta</Label>
            <Input id="np-email" name="email" type="email" placeholder="ornek@eposta.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-conditions">{lang === "tr" ? "Tanılar (virgülle ayır)" : "Conditions (comma-separated)"}</Label>
            <Input id="np-conditions" name="conditions" placeholder={lang === "tr" ? "Örn. Migren, Hipertansiyon" : "e.g. Migraine, Hypertension"} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {lang === "tr" ? "Hastayı kaydet" : "Save patient"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function PatientsClient({ patients, profession }: { patients: Patient[]; profession?: string | null }) {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PatientStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

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
              <button
                onClick={() => setShowNew(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
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
                        {patients.length === 0 ? (
                          <span className="space-y-2">
                            <span className="block">
                              {lang === "tr" ? "Henüz hasta kaydın yok." : "No patients yet."}
                            </span>
                            <button
                              onClick={() => setShowNew(true)}
                              className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                            >
                              <UserPlus className="h-4 w-4" />
                              {lang === "tr" ? "İlk hastanı ekle" : "Add your first patient"}
                            </button>
                          </span>
                        ) : (
                          lang === "tr" ? "Eşleşen hasta yok." : "No matching patients."
                        )}
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
            <PatientDrawer patient={selectedPatient} profession={profession} onClose={() => setSelected(null)} />
          </aside>
        )}
      </div>

      <NewPatientModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
