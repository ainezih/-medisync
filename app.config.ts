/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  app.config.ts — the single source of truth for this starter.            │
 * │                                                                          │
 * │  Medisync — patient management for small clinics & private practices.    │
 * │  Appointments, patient charts, e-prescriptions, billing & reminders.     │
 * │  Inspired by drchrono.com and semble.io (calm, clean medical SaaS).      │
 * │                                                                          │
 * │  Every user-facing string is bilingual: { tr: "...", en: "..." }.        │
 * │  The guided setup (run `/setup`, or say "bu projeyi kur") edits this      │
 * │  file plus app/globals.css and .env.local.                               │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import type { L } from "@/lib/i18n/config";

export type IconName = string;

export interface NavItem {
  label: L;
  href: string;
  icon: IconName;
  badge?: L;
  muted?: boolean;
}

export interface NavGroup {
  label: L;
  items: NavItem[];
}

export interface Feature {
  icon: IconName;
  title: L;
  body: L;
}

export interface Stat {
  value: string;
  label: L;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: L;
  tagline: L;
  features: L[];
  cta: L;
  featured?: boolean;
}

export interface FaqItem {
  q: L;
  a: L;
}

export interface Integration {
  key: string;
  name: string;
  envVars: string[];
  required: boolean;
  docsUrl: string;
  purpose: string;
}

export interface AppConfig {
  name: string;
  tagline: L;
  description: L;
  domain: string;
  logoText: string;
  accentName: string;
  marketing: {
    badge: L;
    heroTitle: L;
    heroAccent: L;
    heroSubtitle: L;
    heroCtaPrimary: L;
    heroCtaSecondary: L;
    features: Feature[];
    stats: Stat[];
    pricing: PricingTier[];
    faq: FaqItem[];
  };
  /** Flat list — used by the topbar title lookup. */
  nav: NavItem[];
  /** Grouped sidebar nav. */
  navGroups: NavGroup[];
  integrations: Integration[];
}

export const appConfig: AppConfig = {
  name: "Medisync",
  tagline: {
    tr: "İşini yönet, evrak işini değil.",
    en: "Run your practice, not your paperwork.",
  },
  description: {
    tr: "Küçük klinikler ve özel muayenehaneler için hasta yönetimi: randevular, hasta dosyaları, e-reçete ve faturalandırma — tek sakin panelde.",
    en: "Patient management for small clinics & private practices: appointments, patient charts, e-prescriptions and billing — in one calm panel.",
  },
  domain: "medisync.digital",
  logoText: "M",
  accentName: "teal",

  marketing: {
    badge: { tr: "Klinikler için hasta yönetimi", en: "Patient management for clinics" },
    heroTitle: {
      tr: "İşini yönet,",
      en: "Run your practice,",
    },
    heroAccent: {
      tr: "evrak işini değil.",
      en: "not your paperwork.",
    },
    heroSubtitle: {
      tr: "Online randevu, hasta dosyaları, e-reçete, faturalandırma ve hatırlatmalar — tek, sakin bir panelde. Klinik ekibinin sevdiği yazılım.",
      en: "Online booking, patient charts, e-prescriptions, billing and reminders — in one calm panel. The software your clinic team actually likes.",
    },
    heroCtaPrimary: { tr: "Ücretsiz başla", en: "Start free" },
    heroCtaSecondary: { tr: "Nasıl çalıştığını gör", en: "See how it works" },
    features: [
      { icon: "calendar-check", title: { tr: "Online randevu", en: "Online booking" }, body: { tr: "Hastalar 7/24 boş slotlardan randevu alır; takvimin gerçek zamanlı güncellenir, çift kayıt olmaz.", en: "Patients self-book open slots 24/7; your calendar updates in real time, with zero double-booking." } },
      { icon: "file-heart", title: { tr: "Hasta dosyaları (EHR-lite)", en: "Patient charts (EHR-lite)" }, body: { tr: "Demografik bilgi, ziyaret geçmişi, klinik notlar, belgeler ve reçeteler — tek hasta görünümünde.", en: "Demographics, visit history, clinical notes, documents and prescriptions — in one patient view." } },
      { icon: "pill", title: { tr: "E-reçete", en: "E-prescriptions" }, body: { tr: "Reçeteyi dakikalar içinde yaz, etkileşim uyarısı al ve eczaneye doğrudan gönder.", en: "Write a script in minutes, get interaction warnings, and send it straight to the pharmacy." } },
      { icon: "receipt-text", title: { tr: "Faturalandırma & tahsilat", en: "Billing & payments" }, body: { tr: "Muayene başına fatura kes, kart al ve ödenmemişleri tek bakışta gör. PayTR ile bağla.", en: "Invoice per visit, take cards and see unpaid balances at a glance. Wire it to PayTR." } },
      { icon: "bell-ring", title: { tr: "Otomatik hatırlatmalar", en: "Automatic reminders" }, body: { tr: "SMS ve e-posta hatırlatmaları gelmeyen hasta oranını düşürür — kurulumu beş dakika.", en: "SMS and email reminders cut no-shows — set up in five minutes." } },
      { icon: "video", title: { tr: "Teletıp", en: "Telehealth" }, body: { tr: "Güvenli görüntülü muayene başlat, notlarını aynı dosyaya işle. Tek tıkla bağlantı.", en: "Launch a secure video visit and chart it in the same record. One-click join link." } },
    ],
    stats: [
      { value: "-30%", label: { tr: "gelmeyen hasta", en: "fewer no-shows" } },
      { value: "8 dk", label: { tr: "ortalama dokümantasyon", en: "avg charting time" } },
      { value: "0", label: { tr: "anahtarla demo", en: "keys to demo it" } },
      { value: "4.9/5", label: { tr: "klinik memnuniyeti", en: "clinic rating" } },
    ],
    pricing: [
      {
        name: "Solo",
        price: "$49",
        period: { tr: "/sağlayıcı/ay", en: "/provider/mo" },
        tagline: { tr: "Tek hekimli muayenehaneler için.", en: "For single-provider practices." },
        features: [
          { tr: "1 sağlayıcı", en: "1 provider" },
          { tr: "Online randevu & takvim", en: "Online booking & calendar" },
          { tr: "Hasta dosyaları (EHR-lite)", en: "Patient charts (EHR-lite)" },
          { tr: "E-posta hatırlatmaları", en: "Email reminders" },
        ],
        cta: { tr: "Başla", en: "Get started" },
      },
      {
        name: "Practice",
        price: "$89",
        period: { tr: "/sağlayıcı/ay", en: "/provider/mo" },
        tagline: { tr: "Büyüyen klinikler için.", en: "For growing clinics." },
        features: [
          { tr: "Solo'daki her şey", en: "Everything in Solo" },
          { tr: "5 sağlayıcıya kadar", en: "Up to 5 providers" },
          { tr: "SMS hatırlatmaları & e-reçete", en: "SMS reminders & e-prescriptions" },
          { tr: "Faturalandırma & kart tahsilatı", en: "Billing & card payments" },
          { tr: "Teletıp görüntülü muayene", en: "Telehealth video visits" },
        ],
        cta: { tr: "Ücretsiz dene", en: "Start free trial" },
        featured: true,
      },
      {
        name: "Group",
        price: "—",
        tagline: { tr: "Çok-lokasyonlu gruplar için.", en: "For multi-location groups." },
        features: [
          { tr: "Practice'teki her şey", en: "Everything in Practice" },
          { tr: "Sınırsız sağlayıcı & lokasyon", en: "Unlimited providers & locations" },
          { tr: "Roller, denetim kaydı & SSO", en: "Roles, audit log & SSO" },
          { tr: "Özel onboarding & destek", en: "Dedicated onboarding & support" },
        ],
        cta: { tr: "Bize ulaş", en: "Contact sales" },
      },
    ],
    faq: [
      { q: { tr: "Ücretsiz deneme var mı?", en: "Is there a free trial?" }, a: { tr: "Evet — Practice planında kredi kartı bilgisi vermeden ücretsiz deneyebilirsiniz.", en: "Yes — the Practice plan comes with a free trial, no card required." } },
      { q: { tr: "Hasta verilerimiz güvende mi?", en: "Is our patient data secure?" }, a: { tr: "Evet. Tüm veriler şifrelenerek saklanır ve yalnızca yetkilendirdiğiniz klinik personeli erişebilir.", en: "Yes. All data is stored encrypted and only accessible to the clinic staff you authorize." } },
      { q: { tr: "Mevcut hasta kayıtlarımızı aktarabilir miyiz?", en: "Can we migrate our existing patient records?" }, a: { tr: "Evet — kurulum sırasında ekibimiz mevcut sisteminizden hasta ve randevu verisinin aktarımında size yardımcı olur.", en: "Yes — during onboarding, our team helps you migrate patients and appointments from your current system." } },
      { q: { tr: "Randevu hatırlatmaları nasıl gönderiliyor?", en: "How are appointment reminders sent?" }, a: { tr: "SMS ve e-posta ile otomatik gönderilir; hastalarınız randevudan önce hatırlatma alır ve gelmeyen hasta oranı düşer.", en: "Automatically by SMS and email before each appointment — cutting no-shows without any manual follow-up." } },
      { q: { tr: "Ödemeleri nasıl alıyorum?", en: "How do I take payments?" }, a: { tr: "Muayene faturalarını kartla tahsil edebilir, ödenmemiş bakiyeleri panelden tek bakışta görebilirsiniz.", en: "Collect visit invoices by card and see unpaid balances at a glance in your dashboard." } },
      { q: { tr: "Teletıp gerçekten dahil mi?", en: "Is telehealth really included?" }, a: { tr: "Evet — güvenli görüntülü muayeneyi tek tıkla başlatıp notlarını aynı hasta dosyasına işleyebilirsiniz.", en: "Yes — launch a secure video visit in one click and chart it in the same patient record." } },
      { q: { tr: "Birden fazla sağlayıcı veya lokasyon ekleyebilir miyiz?", en: "Can we add multiple providers or locations?" }, a: { tr: "Evet — Practice planı 5 sağlayıcıya kadar, Group planı sınırsız sağlayıcı ve lokasyonu destekler.", en: "Yes — the Practice plan supports up to 5 providers, and Group supports unlimited providers and locations." } },
      { q: { tr: "Uzun vadeli bir sözleşme imzalamam gerekiyor mu?", en: "Do I need to sign a long-term contract?" }, a: { tr: "Hayır — aylık faturalandırılır ve istediğiniz zaman iptal edebilirsiniz.", en: "No — billing is monthly and you can cancel anytime." } },
    ],
  },

  nav: [
    { label: { tr: "Panel", en: "Dashboard" }, href: "/dashboard", icon: "layout-dashboard" },
    { label: { tr: "Hastalar", en: "Patients" }, href: "/patients", icon: "users" },
    { label: { tr: "Randevular", en: "Appointments" }, href: "/appointments", icon: "calendar-days" },
    { label: { tr: "Ayarlar", en: "Settings" }, href: "/settings", icon: "settings" },
  ],

  navGroups: [
    {
      label: { tr: "Klinik", en: "Clinic" },
      items: [
        { label: { tr: "Panel", en: "Dashboard" }, href: "/dashboard", icon: "layout-dashboard" },
        { label: { tr: "Randevular", en: "Appointments" }, href: "/appointments", icon: "calendar-days" },
        { label: { tr: "Hastalar", en: "Patients" }, href: "/patients", icon: "users" },
        { label: { tr: "Bekleme odası", en: "Waiting room" }, href: "/dashboard", icon: "armchair", badge: { tr: "3", en: "3" } },
      ],
    },
    {
      label: { tr: "Klinik İş Akışı", en: "Clinical" },
      items: [
        { label: { tr: "Reçeteler", en: "Prescriptions" }, href: "/patients", icon: "pill" },
        { label: { tr: "Teletıp", en: "Telehealth" }, href: "/appointments", icon: "video" },
        { label: { tr: "Laboratuvar", en: "Lab orders" }, href: "/patients", icon: "flask-conical", muted: true },
      ],
    },
    {
      label: { tr: "Finans", en: "Finance" },
      items: [
        { label: { tr: "Faturalandırma", en: "Billing" }, href: "/dashboard", icon: "receipt-text" },
        { label: { tr: "Raporlar", en: "Reports" }, href: "/dashboard", icon: "chart-line", muted: true },
      ],
    },
  ],

  integrations: [
    {
      key: "supabase",
      name: "Supabase",
      envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      required: false,
      docsUrl: "https://supabase.com/dashboard/project/_/settings/api",
      purpose: "Database & auth for patients, appointments and charts. Without it, the app runs in demo mode.",
    },
    {
      key: "twilio",
      name: "Twilio",
      envVars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"],
      required: false,
      docsUrl: "https://www.twilio.com/console",
      purpose: "SMS appointment reminders to cut no-shows. Pair with an email provider for full reminders.",
    },
    {
      key: "paytr",
      name: "PayTR",
      envVars: ["PAYTR_MERCHANT_ID", "PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT"],
      required: false,
      docsUrl: "https://www.paytr.com/magaza/api-bilgileri",
      purpose: "Billing & card payments for visit invoices and balances (Turkish local card/installment support).",
    },
    {
      key: "daily",
      name: "Daily (Telehealth)",
      envVars: ["DAILY_API_KEY"],
      required: false,
      docsUrl: "https://dashboard.daily.co/developers",
      purpose: "Secure one-click video visits for telehealth appointments.",
    },
  ],
};

export default appConfig;
