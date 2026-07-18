"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  Quote,
  Star,
  ShieldCheck,
  Lock,
  HeartPulse,
  CalendarCheck,
  FileHeart,
  Pill,
  ReceiptText,
  BellRing,
  Video,
  Stethoscope,
  Activity,
  ClipboardList,
} from "lucide-react";
import appConfig from "@/app.config";
import { Icon } from "@/components/ui/icon";
import { BookingDemo } from "@/components/marketing/booking-demo";
import { ProductPreview, ClinicMark } from "@/components/marketing/marks";
import { Avatar } from "@/components/app/clinic";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { L } from "@/lib/i18n/config";

/* ─────────────────────────────────────────────────────────────────────────────
   Local bilingual copy that doesn't belong in app.config.ts. Everything here is
   { tr, en } and resolved through the active language via tt().
   ───────────────────────────────────────────────────────────────────────────── */

const HERO_BENEFITS: L[] = [
  { tr: "Online randevu — hastalar boş slotlardan kendi alır, çift kayıt olmaz", en: "Online booking — patients self-book open slots, no double-booking" },
  { tr: "Tek hasta görünümünde dosya, reçete ve ziyaret geçmişi", en: "Charts, prescriptions and visit history in one patient view" },
  { tr: "Otomatik SMS & e-posta hatırlatması gelmeyen hasta oranını -%30 düşürür", en: "Automatic SMS & email reminders cut no-shows by 30%" },
];

const TRUSTED = [
  "Cedar Family Care",
  "Mercy Pediatrics",
  "Harbor Dermatology",
  "Northgate Clinic",
  "Lakeside Health",
  "Summit Practice",
  "Bright Smile Dental",
  "Vista Orthopedics",
];

const HOW_STEPS: { n: string; icon: string; title: L; body: L }[] = [
  {
    n: "01",
    icon: "calendar-check",
    title: { tr: "Randevu al", en: "Book" },
    body: { tr: "Hasta online ya da resepsiyon boş bir slota randevu açar. Hatırlatma otomatik gider.", en: "A patient books online — or reception books an open slot. Reminders go out automatically." },
  },
  {
    n: "02",
    icon: "user-check",
    title: { tr: "Kayıt yap", en: "Check in" },
    body: { tr: "Hasta geldiğinde tek tıkla kayıt; bekleme odası ve bekleme süresi gerçek zamanlı görünür.", en: "When they arrive, check in with one click; the waiting room and wait time update live." },
  },
  {
    n: "03",
    icon: "file-heart",
    title: { tr: "Muayene & dosya", en: "Chart" },
    body: { tr: "Vital bulgular, notlar ve reçeteyi aynı ekranda işle. E-reçete eczaneye gönderilir.", en: "Capture vitals, notes and prescriptions in one screen. E-scripts go straight to the pharmacy." },
  },
  {
    n: "04",
    icon: "receipt-text",
    title: { tr: "Faturala", en: "Bill" },
    body: { tr: "Ziyaret faturasını oluştur, kartla tahsil et, bakiyeyi tek bakışta gör.", en: "Generate the visit invoice, take card payment, and see the balance at a glance." },
  },
];

const SPECIALTIES: { icon: string; label: L }[] = [
  { icon: "stethoscope", label: { tr: "Aile hekimliği", en: "Family medicine" } },
  { icon: "baby", label: { tr: "Pediatri", en: "Pediatrics" } },
  { icon: "smile", label: { tr: "Diş hekimliği", en: "Dental" } },
  { icon: "bone", label: { tr: "Ortopedi", en: "Orthopedics" } },
  { icon: "brain", label: { tr: "Ruh sağlığı", en: "Mental health" } },
  { icon: "eye", label: { tr: "Göz", en: "Optometry" } },
];

type CompareValue = boolean | L | string;
const COMPARE: { feature: L; paper: CompareValue; generic: CompareValue; clinica: CompareValue }[] = [
  { feature: { tr: "Online self-servis randevu", en: "Online self-booking" }, paper: false, generic: { tr: "Eklenti", en: "Add-on" }, clinica: true },
  { feature: { tr: "Hasta dosyası (EHR-lite)", en: "Patient charts (EHR-lite)" }, paper: { tr: "Kağıt", en: "Paper" }, generic: true, clinica: true },
  { feature: { tr: "E-reçete & etkileşim uyarısı", en: "E-prescriptions & warnings" }, paper: false, generic: { tr: "Sınırlı", en: "Limited" }, clinica: true },
  { feature: { tr: "SMS & e-posta hatırlatma", en: "SMS & email reminders" }, paper: { tr: "Manuel telefon", en: "Manual calls" }, generic: { tr: "Sadece e-posta", en: "Email only" }, clinica: true },
  { feature: { tr: "Bekleme odası / kuyruk", en: "Waiting room / queue" }, paper: false, generic: false, clinica: true },
  { feature: { tr: "Entegre teletıp", en: "Built-in telehealth" }, paper: false, generic: { tr: "Ayrı araç", en: "Separate tool" }, clinica: true },
  { feature: { tr: "Faturalandırma & kart tahsilatı", en: "Billing & card payments" }, paper: { tr: "Defter", en: "Ledger" }, generic: { tr: "Kısmi", en: "Partial" }, clinica: true },
];

const TESTIMONIALS: { quote: L; name: string; role: L; initials: string; metric: L }[] = [
  { quote: { tr: "Hatırlatmalar gelmeyen hasta oranımızı üçte birine düşürdü. Takvim ilk kez dolu ve düzenli.", en: "Reminders cut our no-shows by a third. For the first time the calendar is full and tidy." }, name: "Dr. Daniela Reyes", role: { tr: "Aile hekimi · Cedar Family Care", en: "Family medicine · Cedar Family Care" }, initials: "DR", metric: { tr: "gelmeyen -%30", en: "no-shows -30%" } },
  { quote: { tr: "Resepsiyonum artık telefonla boğuşmuyor. Hastalar boş slotları kendileri görüp randevu alıyor.", en: "My front desk isn't drowning in phone calls. Patients see open slots and book themselves." }, name: "Dr. Amara Okafor", role: { tr: "Dahiliye · Northgate Clinic", en: "Internal medicine · Northgate Clinic" }, initials: "AO", metric: { tr: "telefon -%50", en: "calls -50%" } },
  { quote: { tr: "Dosya, reçete ve fatura tek ekranda. Muayene başına dokümantasyon süremiz yarıya indi.", en: "Chart, prescription and invoice on one screen. Our charting time per visit halved." }, name: "Dr. Liam Hayes", role: { tr: "Pediatri · Mercy Pediatrics", en: "Pediatrics · Mercy Pediatrics" }, initials: "LH", metric: { tr: "dokümantasyon -%50", en: "charting -50%" } },
  { quote: { tr: "Teletıp görüşmesini hastanın dosyasından tek tıkla açıyorum, notu aynı yere işliyorum.", en: "I launch a telehealth visit from the patient's chart in one click and write the note in place." }, name: "Dr. Sofia Marin", role: { tr: "Ruh sağlığı · Lakeside Health", en: "Mental health · Lakeside Health" }, initials: "SM", metric: { tr: "1 tık teletıp", en: "1-click visits" } },
  { quote: { tr: "Kurulum bir öğleden sonra sürdü. PayTR'ı bağladık, aynı gün ilk kart ödemesini aldık.", en: "Setup took an afternoon. We wired PayTR and took our first card payment the same day." }, name: "Nadia Park", role: { tr: "Klinik müdürü · Harbor Dermatology", en: "Practice manager · Harbor Dermatology" }, initials: "NP", metric: { tr: "1 öğleden sonra", en: "1 afternoon" } },
  { quote: { tr: "Bekleme odası paneli sayesinde hangi hasta nerede, ne kadar bekledi anında görüyoruz.", en: "The waiting-room panel shows who's where and how long they've waited, instantly." }, name: "Grace Lindqvist", role: { tr: "Hemşire · Summit Practice", en: "Lead nurse · Summit Practice" }, initials: "GL", metric: { tr: "bekleme görünür", en: "live queue" } },
];

const SECURITY: { icon: typeof ShieldCheck; title: L; body: L }[] = [
  { icon: Lock, title: { tr: "Şifreli & erişim-kontrollü", en: "Encrypted & access-controlled" }, body: { tr: "Hasta verisi aktarımda ve dinlenmede şifrelenir; rol bazlı erişim.", en: "Patient data is encrypted in transit and at rest; role-based access." } },
  { icon: ShieldCheck, title: { tr: "Uyum dostu", en: "Compliance-friendly" }, body: { tr: "Denetim kaydı, izin listeleri ve veri saklama kontrolleriyle kurulur.", en: "Built with audit logs, allowlists and data-retention controls." } },
  { icon: Activity, title: { tr: "Denetim kaydı", en: "Audit trail" }, body: { tr: "Her dosya görüntüleme ve değişiklik zaman damgasıyla kaydedilir.", en: "Every chart view and edit is timestamped and logged." } },
];

const USE_CASES: { icon: string; title: L; body: L }[] = [
  { icon: "stethoscope", title: { tr: "Tek hekimli muayenehaneler", en: "Solo practices" }, body: { tr: "Randevu, dosya ve fatura — resepsiyon kadrosuna ihtiyaç olmadan tek panelde.", en: "Booking, charts and billing in one panel — without hiring front-desk staff." } },
  { icon: "building-2", title: { tr: "Çok-hekimli klinikler", en: "Multi-provider clinics" }, body: { tr: "Sağlayıcılar arası takvim, odalar ve kuyruk; herkes aynı sayfada.", en: "Cross-provider calendars, rooms and queue; everyone on the same page." } },
  { icon: "video", title: { tr: "Teletıp odaklı", en: "Telehealth-first" }, body: { tr: "Görüntülü muayeneyi dosyadan başlat, notu aynı yere işle, kartı al.", en: "Launch a video visit from the chart, note it in place, take the card." } },
  { icon: "heart-pulse", title: { tr: "Uzman klinikleri", en: "Specialty clinics" }, body: { tr: "Diş, ortopedi, dermatoloji — kendi ziyaret türlerin ve formlarınla.", en: "Dental, ortho, derma — with your own visit types and forms." } },
];

const DEEP_DIVE: { eyebrow: L; title: L; body: L; points: L[]; reverse?: boolean }[] = [
  {
    eyebrow: { tr: "Hasta dosyaları", en: "Patient charts" },
    title: { tr: "Tüm hasta hikâyesi tek görünümde", en: "The whole patient story, one view" },
    body: { tr: "Demografik bilgi, vital bulgular, tanılar, alerjiler, ziyaret geçmişi, reçeteler ve belgeler — sekme avına çıkmadan. Muayene sırasında not al, anında kaydedilir.", en: "Demographics, vitals, conditions, allergies, visit history, prescriptions and documents — without hunting through tabs. Chart during the visit; it saves instantly." },
    points: [
      { tr: "Vital bulgu & büyüme takibi", en: "Vitals & growth tracking" },
      { tr: "Alerji ve etkileşim uyarıları", en: "Allergy & interaction warnings" },
      { tr: "Belge ve laboratuvar ekleri", en: "Document & lab attachments" },
    ],
  },
  {
    eyebrow: { tr: "Randevu & kuyruk", en: "Scheduling & queue" },
    title: { tr: "Boş slottan muayene odasına", en: "From open slot to exam room" },
    body: { tr: "Hafta/gün ızgarasında sürükle-bırak randevu, gerçek zamanlı bekleme odası ve bekleme süresi. Hasta geldi mi, odaya mı geçti, bitti mi — tek bakışta.", en: "Drag-and-drop scheduling on a week/day grid, a real-time waiting room and wait timers. Arrived, in-room, done — all at a glance." },
    points: [
      { tr: "Hafta & gün takvim görünümü", en: "Week & day calendar views" },
      { tr: "Bekleme odası & bekleme sayacı", en: "Waiting room & wait timers" },
      { tr: "Çift kayıt önleme", en: "Double-booking protection" },
    ],
    reverse: true,
  },
  {
    eyebrow: { tr: "E-reçete & fatura", en: "E-Rx & billing" },
    title: { tr: "Reçeteyi yaz, faturayı kes — yerinde", en: "Prescribe and bill, in place" },
    body: { tr: "Reçeteyi dakikalar içinde yaz, etkileşim uyarısı al, eczaneye gönder. Ziyaret faturasını oluştur, kartla tahsil et, ödenmemişleri panelde gör.", en: "Write a script in minutes, get interaction warnings, send it to the pharmacy. Generate the visit invoice, take a card, and see unpaid balances in the dashboard." },
    points: [
      { tr: "E-reçete & yenileme", en: "E-prescriptions & refills" },
      { tr: "Kartla tahsilat (PayTR)", en: "Card payments (PayTR)" },
      { tr: "Bakiye & talep takibi", en: "Balance & claims tracking" },
    ],
  },
];

const INTEGRATIONS: { name: string; glyph: "db" | "sms" | "card" | "video"; subtitle: L }[] = [
  { name: "Supabase", glyph: "db", subtitle: { tr: "Veritabanı & auth", en: "Database & auth" } },
  { name: "Twilio", glyph: "sms", subtitle: { tr: "SMS hatırlatma", en: "SMS reminders" } },
  { name: "PayTR", glyph: "card", subtitle: { tr: "Faturalandırma", en: "Billing" } },
  { name: "Daily", glyph: "video", subtitle: { tr: "Teletıp video", en: "Telehealth video" } },
];

const FEATURE_ICON: Record<string, typeof CalendarCheck> = {
  "calendar-check": CalendarCheck,
  "file-heart": FileHeart,
  pill: Pill,
  "receipt-text": ReceiptText,
  "bell-ring": BellRing,
  video: Video,
};

export default function LandingPage() {
  const { t, lang } = useLang();
  const m = appConfig.marketing;
  const tt = (v: L) => v[lang];

  const sectionCopy = {
    demoTitle: { tr: "Randevuyu al, hasta kayıt yapsın — canlı dene", en: "Book it, check them in — try it live" } as L,
    demoSub: { tr: "Boş bir slot seç, bir hasta ekle. Randevu programa düşer, sonra tek tıkla kayıt yap.", en: "Pick an open slot, add a patient. The appointment lands on the schedule, then check them in with one click." } as L,
    featuresTitle: { tr: "Kliniğini yönetmek için ihtiyacın olan her şey", en: "Everything you need to run your clinic" } as L,
    featuresSub: { tr: "Randevudan dosyaya, reçeteden faturaya kadar tek sakin panel.", en: "From booking to charts to prescriptions to billing, in one calm panel." } as L,
    howTitle: { tr: "Dört adımda bir ziyaret", en: "A visit in four steps" } as L,
    howSub: { tr: "Randevu al, kayıt yap, muayene et, faturala. Medisync aradakini halleder.", en: "Book, check in, chart, bill. Medisync handles everything in between." } as L,
    specialtiesTitle: { tr: "Her uzmanlık için bir akış", en: "A flow for every specialty" } as L,
    specialtiesSub: { tr: "Kendi ziyaret türlerin, formların ve sağlayıcılarınla kur.", en: "Set it up with your own visit types, forms and providers." } as L,
    useCasesTitle: { tr: "Medisync kimler için?", en: "Who Medisync is for" } as L,
    useCasesSub: { tr: "Küçük klinikler ve özel muayenehaneler için bir panel.", en: "One panel for small clinics and private practices." } as L,
    deepTitle: { tr: "Randevudan deftere kadar", en: "From the schedule to the ledger" } as L,
    deepSub: { tr: "Üç katman, tek panel: planla, muayene et, faturala.", en: "Three layers, one panel: schedule, chart, bill." } as L,
    integrationsTitle: { tr: "Sevdiğin araçlarla çalışır", en: "Works with the tools you love" } as L,
    integrationsSub: { tr: "Supabase, Twilio, PayTR ve teletıp video'yu dakikalar içinde bağla.", en: "Wire Supabase, Twilio, PayTR and telehealth video in minutes." } as L,
    compareTitle: { tr: "Neden Medisync?", en: "Why Medisync?" } as L,
    compareSub: { tr: "Kağıt + telefon ve genel araçlarla karşılaştır.", en: "Compared to paper + phone and generic tools." } as L,
    securityTitle: { tr: "Hasta verisi için güvenlik", en: "Security worthy of patient data" } as L,
    securitySub: { tr: "Klinik verini şifreli, erişim-kontrollü ve kayıtlı tutarız.", en: "We keep your clinical data encrypted, access-controlled and logged." } as L,
    testimonialsTitle: { tr: "Klinik ekipleri Medisync'i seviyor", en: "Clinic teams love Medisync" } as L,
    testimonialsSub: { tr: "Hekimler, hemşireler ve klinik yöneticilerinden.", en: "From doctors, nurses and practice managers." } as L,
    pricingTitle: { tr: "Sağlayıcı başına basit fiyatlandırma", en: "Simple per-provider pricing" } as L,
    pricingSub: { tr: "Ücretsiz başla. Sadece sağlayıcı başına öde.", en: "Start free. Pay only per provider." } as L,
    popular: { tr: "En popüler", en: "Most popular" } as L,
    faqTitle: { tr: "Sıkça sorulanlar", en: "Frequently asked" } as L,
    faqSub: { tr: "Cevabını bulamadın mı? Ekibimize yaz.", en: "Can't find an answer? Reach our team." } as L,
    ctaTitle: { tr: "Kliniğini bugün Medisync'e taşı", en: "Move your practice to Medisync today" } as L,
    ctaSub: { tr: "Anahtarsız demo modda aç, hazır olunca Supabase, Twilio ve PayTR'ı bağla.", en: "Open the keyless demo, then wire Supabase, Twilio and PayTR when you're ready." } as L,
  };

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--grad-hero)" }} aria-hidden />
        <span className="blob -left-10 top-16 -z-10 h-72 w-72 bg-primary/15 drift" aria-hidden />
        <span className="blob -right-10 top-40 -z-10 h-64 w-64 bg-[oklch(58%_0.12_250)]/12" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left copy */}
          <div className="stagger">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
              {t(m.badge)}
            </span>
            <h1 className="mt-5 max-w-xl font-display text-[40px] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-[56px]">
              {t(m.heroTitle)}{" "}
              <span className="bg-gradient-to-br from-[oklch(64%_0.11_192)] to-[oklch(56%_0.12_232)] bg-clip-text text-transparent">
                {t(m.heroAccent)}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted-foreground">{t(m.heroSubtitle)}</p>

            <ul className="mt-6 space-y-2.5">
              {HERO_BENEFITS.map((b) => (
                <li key={tt(b)} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {tt(b)}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-[15px] font-semibold text-foreground shadow-pill transition-colors hover:bg-muted"
              >
                {t(m.heroCtaSecondary)}
              </a>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {lang === "tr" ? "Kredi kartı gerekmez · Anahtarsız demo · Kurgusal hasta verisi" : "No credit card · Keyless demo · Fictional patient data"}
            </p>
          </div>

          {/* Right floating product preview */}
          <div className="relative animate-float-up lg:pl-4">
            <div className="absolute -left-6 -top-6 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl drift" aria-hidden />
            <div className="absolute -bottom-8 -right-4 -z-10 h-44 w-44 rounded-full bg-[oklch(58%_0.12_250)]/10 blur-3xl" aria-hidden />
            {/* floating heartbeat motif */}
            <span className="absolute -right-3 -top-3 z-10 grid h-12 w-12 place-items-center rounded-2xl bg-card shadow-pop">
              <HeartPulse className="heart-beat h-6 w-6 text-primary" />
            </span>
            <ProductPreview />
          </div>
        </div>

        {/* Trusted-by row */}
        <div className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-5 py-6">
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {lang === "tr" ? "Modern klinikler tarafından kullanılıyor" : "Used by modern clinics & practices"}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
              {TRUSTED.map((c) => (
                <ClinicMark key={c} name={c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-soft sm:grid-cols-4">
          {[
            { value: "-30%", label: { tr: "gelmeyen hasta", en: "fewer no-shows" } as L },
            { value: "1,200+", label: { tr: "aktif klinik", en: "active clinics" } as L },
            { value: "8 dk", label: { tr: "ortalama dokümantasyon", en: "avg charting time" } as L },
            { value: "4.9/5", label: { tr: "klinik memnuniyeti", en: "clinic rating" } as L },
          ].map((s) => (
            <div key={s.value} className="bg-card px-5 py-8 text-center">
              <p className="font-display text-3xl font-extrabold tracking-tight">{s.value}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{tt(s.label)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="label-mono text-primary">{lang === "tr" ? "Canlı demo" : "Live demo"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.demoTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.demoSub)}</p>
        </div>
        <BookingDemo />
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.featuresTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.featuresSub)}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.features.map((f) => {
              const FIcon = FEATURE_ICON[f.icon] ?? Stethoscope;
              return (
                <div key={tt(f.title)} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-pop">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <FIcon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{t(f.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(f.body)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DEEP-DIVE FEATURE BLOCKS ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.deepTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.deepSub)}</p>
        </div>
        <div className="mt-14 space-y-16">
          {DEEP_DIVE.map((d, idx) => (
            <div
              key={tt(d.title)}
              className={cn("grid items-center gap-10 lg:grid-cols-2", d.reverse && "lg:[&>*:first-child]:order-2")}
            >
              <div>
                <p className="label-mono text-primary">{tt(d.eyebrow)}</p>
                <h3 className="mt-2 max-w-md font-display text-2xl font-bold tracking-tight sm:text-3xl">{tt(d.title)}</h3>
                <p className="mt-3 max-w-md text-muted-foreground">{tt(d.body)}</p>
                <ul className="mt-5 space-y-2.5">
                  {d.points.map((p) => (
                    <li key={tt(p)} className="flex items-start gap-2.5 text-[15px]">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {tt(p)}
                    </li>
                  ))}
                </ul>
              </div>
              {/* illustrative panel */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                {idx === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                      <Avatar initials="EW" size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight">Eleanor Whitfield · 67</p>
                        <p className="tnum text-[11px] text-muted-foreground">MRN-04821 · {lang === "tr" ? "Kadın" : "Female"}</p>
                      </div>
                      <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                        {lang === "tr" ? "Penisilin alerjisi" : "Penicillin allergy"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { k: lang === "tr" ? "TA" : "BP", v: "138/86" },
                        { k: lang === "tr" ? "Nabız" : "HR", v: "74" },
                        { k: "BMI", v: "27.4" },
                        { k: lang === "tr" ? "Ateş" : "Temp", v: "36.7" },
                      ].map((m2) => (
                        <div key={m2.k} className="rounded-lg border border-border bg-card py-2 text-center">
                          <p className="tnum text-[13px] font-semibold leading-none">{m2.v}</p>
                          <p className="mt-1 text-[9.5px] text-muted-foreground">{m2.k}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="text-[12.5px] font-medium">Lisinopril 20 mg</span>
                      <span className="tnum ml-auto text-[11px] text-muted-foreground">{lang === "tr" ? "günde 1" : "once daily"}</span>
                    </div>
                  </div>
                )}
                {idx === 1 && (
                  <div className="space-y-2.5">
                    {[
                      { t: "9:00", p: "M. Bennett", s: lang === "tr" ? "tamamlandı" : "done", c: "var(--color-status-done)" },
                      { t: "9:30", p: "P. Nair", s: lang === "tr" ? "odada" : "in-room", c: "var(--color-status-inroom)" },
                      { t: "10:15", p: "D. Cho", s: lang === "tr" ? "kayıtlı" : "checked-in", c: "var(--color-status-checkedin)" },
                    ].map((r) => (
                      <div key={r.t} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                        <span className="tnum w-10 text-[12px] font-semibold text-muted-foreground">{r.t}</span>
                        <span className="flex-1 text-[13px] font-medium">{r.p}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: r.c, background: `color-mix(in oklch, ${r.c} 12%, transparent)` }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.c }} /> {r.s}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {idx === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Pill className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold leading-tight">Atorvastatin 10 mg</p>
                        <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "Eczaneye gönderildi" : "Sent to pharmacy"}</p>
                      </div>
                      <Check className="h-4 w-4 text-success" strokeWidth={3} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-success/[0.05] p-3">
                      <span className="text-[13px] font-medium">{lang === "tr" ? "Ziyaret faturası" : "Visit invoice"}</span>
                      <span className="tnum text-[15px] font-bold text-success">$120.00</span>
                    </div>
                    <button className="w-full rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
                      {lang === "tr" ? "Kartla tahsil et" : "Charge card"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.howTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.howSub)}</p>
          </div>
          <div className="relative mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-primary/15">{s.n}</span>
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">{tt(s.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tt(s.body)}</p>
                {i < HOW_STEPS.length - 1 && (
                  <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground lg:grid">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALTIES STRIP ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.specialtiesTitle)}</h2>
            <p className="mt-3 max-w-md text-muted-foreground">{tt(sectionCopy.specialtiesSub)}</p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline"
            >
              {lang === "tr" ? "Kliniğini kur" : "Set up your clinic"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SPECIALTIES.map((sp) => (
              <div key={tt(sp.label)} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={sp.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[13.5px] font-semibold tracking-tight">{tt(sp.label)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ─────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.useCasesTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.useCasesSub)}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <div key={tt(u.title)} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={u.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{tt(u.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tt(u.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EHR DEEP-DIVE (charts illustration) ───────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="label-mono text-primary">{lang === "tr" ? "EHR-lite" : "EHR-lite"}</p>
            <h2 className="mt-2 max-w-md font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "tr" ? "Dosyalar hafif, klinik kayıt sağlam" : "Charts that are light, records that are solid"}
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              {lang === "tr"
                ? "Ağır bir hastane EHR'ı değil. Küçük bir klinik için tasarlanmış, hızlı ve sakin bir hasta kaydı: vital bulgular, notlar, reçeteler, belgeler — hepsi tek hasta dosyasında."
                : "Not a heavyweight hospital EHR. A fast, calm patient record designed for a small clinic: vitals, notes, prescriptions, documents — all in one chart."}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: ClipboardList, label: lang === "tr" ? "Notlar" : "Notes" },
                { icon: Activity, label: lang === "tr" ? "Vital" : "Vitals" },
                { icon: Pill, label: lang === "tr" ? "Reçete" : "Rx" },
              ].map((x) => (
                <div key={x.label} className="rounded-xl border border-border bg-card p-3 text-center shadow-soft">
                  <x.icon className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-1.5 text-[12px] font-medium">{x.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* mini chart card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-pop">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Avatar initials="AR" size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">Aisha Rahman · 46</p>
                <p className="tnum text-[11px] text-muted-foreground">MRN-04688 · {lang === "tr" ? "Hipotiroidi" : "Hypothyroidism"}</p>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">{lang === "tr" ? "aktif" : "active"}</span>
            </div>
            <div className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">{lang === "tr" ? "Son ziyaret" : "Last visit"}</span>
                <span className="tnum font-medium">19 May · Dr. Okafor</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-medium text-muted-foreground">{lang === "tr" ? "Klinik not" : "Clinical note"}</p>
                <p className="mt-1 leading-relaxed text-foreground/80">
                  {lang === "tr" ? "TSH normal aralıkta; doz sabit. 8 hafta sonra tekrar." : "TSH within range; dose unchanged. Recheck in 8 weeks."}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <Pill className="h-4 w-4 text-primary" />
                <span className="font-medium">Levothyroxine 75 mcg</span>
                <span className="tnum ml-auto text-[11px] text-muted-foreground">{lang === "tr" ? "günde 1" : "once daily"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.compareTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.compareSub)}</p>
        </div>
        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-4 text-left font-medium text-muted-foreground"></th>
                  <th className="px-5 py-4 text-center font-medium text-muted-foreground">{lang === "tr" ? "Kağıt + telefon" : "Paper + phone"}</th>
                  <th className="px-5 py-4 text-center font-medium text-muted-foreground">{lang === "tr" ? "Genel araç" : "Generic tool"}</th>
                  <th className="bg-primary/[0.04] px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                      <HeartPulse className="h-4 w-4" />
                      {appConfig.name}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={tt(row.feature)} className={cn("border-b border-border/60 last:border-0", i % 2 === 1 && "bg-muted/20")}>
                    <td className="px-5 py-3.5 font-medium">{tt(row.feature)}</td>
                    <CompareCell value={row.paper} lang={lang} />
                    <CompareCell value={row.generic} lang={lang} />
                    <CompareCell value={row.clinica} lang={lang} highlight />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECURITY STRIP ────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{tt(sectionCopy.securityTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.securitySub)}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {SECURITY.map((s) => {
              const I = s.icon;
              return (
                <div key={tt(s.title)} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <I className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{tt(s.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tt(s.body)}</p>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
            {lang === "tr"
              ? "Bu bir demo başlangıç kitidir; tüm hasta verisi kurgusaldır. Üretimde gerçek uyum (ör. HIPAA/KVKK) için kendi politikalarını uygula."
              : "This is a demo starter kit; all patient data is fictional. Apply your own policies for real-world compliance (e.g. HIPAA/GDPR) in production."}
          </p>
        </div>
      </section>

      {/* ── INTEGRATIONS ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{tt(sectionCopy.integrationsTitle)}</h3>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.integrationsSub)}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((it) => (
            <div key={it.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <IntegrationGlyph glyph={it.glyph} />
              <div className="min-w-0">
                <p className="font-semibold tracking-tight">{it.name}</p>
                <p className="truncate text-xs text-muted-foreground">{tt(it.subtitle)}</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {lang === "tr" ? "Hazır" : "Ready"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.testimonialsTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.testimonialsSub)}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((tm) => (
              <figure key={tm.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
                <Quote className="h-5 w-5 text-primary/30" />
                <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-foreground/90">{tt(tm.quote)}</blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar initials={tm.initials} size={40} />
                  <div className="min-w-0 flex-1">
                    <figcaption className="text-sm font-semibold leading-tight">{tm.name}</figcaption>
                    <p className="truncate text-xs text-muted-foreground">{tt(tm.role)}</p>
                  </div>
                  <span className="rounded-full bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">{tt(tm.metric)}</span>
                </div>
              </figure>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
            <span className="ml-2">{lang === "tr" ? "4.9/5 · 1,200+ klinik" : "4.9/5 · 1,200+ clinics"}</span>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.pricingTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.pricingSub)}</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {m.pricing.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-7 shadow-soft",
                tier.featured ? "border-primary/40 shadow-pop ring-1 ring-primary/20" : "border-border",
              )}
            >
              {tier.featured && (
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  <Star className="h-3 w-3 fill-current" />
                  {tt(sectionCopy.popular)}
                </span>
              )}
              <h3 className="font-semibold tracking-tight">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-sm text-muted-foreground">{t(tier.period)}</span>}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(tier.tagline)}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={t(f)} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {t(f)}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={cn(
                  "mt-7 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all",
                  tier.featured
                    ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                    : "border border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {t(tier.cta)}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.faqTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.faqSub)}</p>
          </div>
          <div className="mt-10 space-y-3">
            {m.faq.map((f) => (
              <details key={t(f.q)} className="group rounded-xl border border-border bg-card px-5 py-4 shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {t(f.q)}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                    <Plus className="h-3.5 w-3.5 group-open:hidden" />
                    <Minus className="hidden h-3.5 w-3.5 group-open:block" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-pop">
          <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--grad-hero)" }} aria-hidden />
          <span className="pointer-events-none absolute -left-10 top-0 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl drift" aria-hidden />
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-pill">
            <HeartPulse className="heart-beat h-4 w-4 text-primary" />
            <span>{lang === "tr" ? "Klinikler için · canlı" : "For clinics · live"}</span>
          </div>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{tt(sectionCopy.ctaTitle)}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{tt(sectionCopy.ctaSub)}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-7 text-[15px] font-semibold text-foreground shadow-pill transition-colors hover:bg-muted"
            >
              {lang === "tr" ? "Demoyu aç" : "Open the demo"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function IntegrationGlyph({ glyph }: { glyph: "db" | "sms" | "card" | "video" }) {
  const color =
    glyph === "db" ? "var(--color-success)" : glyph === "sms" ? "var(--color-info)" : glyph === "card" ? "var(--color-primary)" : "var(--seg-2)";
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: color }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {glyph === "db" && <path d="M4 6 c0 -1.7 3.6 -3 8 -3 s8 1.3 8 3 v12 c0 1.7 -3.6 3 -8 3 s-8 -1.3 -8 -3 z M4 6 c0 1.7 3.6 3 8 3 s8 -1.3 8 -3 M4 12 c0 1.7 3.6 3 8 3 s8 -1.3 8 -3" />}
        {glyph === "sms" && <path d="M4 5 h16 v11 h-9 l-4 4 v-4 H4 z M8 9 h8 M8 12 h5" />}
        {glyph === "card" && <path d="M3 6 h18 v12 H3 z M3 10 h18 M7 15 h4" />}
        {glyph === "video" && <path d="M3 7 h12 v10 H3 z M15 11 l6 -3 v8 l-6 -3 z" />}
      </svg>
    </span>
  );
}

function CompareCell({
  value,
  lang,
  highlight = false,
}: {
  value: boolean | L | string;
  lang: "tr" | "en";
  highlight?: boolean;
}) {
  const text = typeof value === "string" ? value : typeof value === "object" ? value[lang] : null;
  return (
    <td className={cn("px-5 py-3.5 text-center", highlight && "bg-primary/[0.04]")}>
      {typeof value === "boolean" ? (
        value ? (
          <span className={cn("mx-auto grid h-5 w-5 place-items-center rounded-full", highlight ? "bg-primary text-primary-foreground" : "bg-success/12 text-success")}>
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : (
          <span className="mx-auto grid h-5 w-5 place-items-center rounded-full bg-muted text-muted-foreground">
            <Minus className="h-3 w-3" />
          </span>
        )
      ) : (
        <span className={cn("text-[13px] font-medium", highlight ? "text-primary" : "text-muted-foreground")}>{text}</span>
      )}
    </td>
  );
}
