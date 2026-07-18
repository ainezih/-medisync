# Working in this project (read me first)

This is **Clinica** — a **GoatStarter kit** on Next.js 16. The product: **patient
management for small clinics & private practices** — appointments, patient
charts, e-prescriptions, billing and reminders (modeled on drchrono.com +
semble.io). A production-grade starter built to be rebranded fast.

**Design language:** LIGHT, calm, trustworthy medical SaaS. White surfaces,
hairline borders, a soft medical **teal** primary (`oklch(62% 0.11 195)`),
generous whitespace, tabular-num clinical data (Hanken Grotesk + JetBrains Mono).
Light is the default — **no `dark` class** on `<html>`. The dashboard is a clinic
cockpit: white sidebar (grouped nav + pinned provider card) · stat row · today's
schedule timeline · patient roster → patient-chart drawer · revenue/visits chart
· appointment-mix donut · week calendar strip · waiting-room queue · recent
prescriptions. All visuals are inline SVG (logomark in `components/ui/logo.tsx`,
charts in `components/app/charts.tsx`, SVG-initial avatars in
`components/app/clinic.tsx`) — **no photos**.

> ⚠️ All patient data (`lib/demo/data.ts`) is **fictional** — invented for the
> demo. There is no real PHI. Keep it clearly fictional when you edit it.

## ⭐ If the user wants to set this up

When the user says anything like **"set up this project"**, **"bu projeyi kur"**,
**"make this mine"**, **"configure this"**, or runs **`/setup`** — do NOT start
editing files blindly. Open **`SETUP.md`** and follow it exactly. It is an
interview: you ask a short list of questions (brand, logo, colors, and the
specific API keys this app needs), then you apply the answers to:

- `app.config.ts` — name, tagline, copy, navigation
- `app/globals.css` — brand colors
- `app/layout.tsx` — fonts (optional)
- `.env.local` — the API keys you collected
- `public/logo.svg` — the user's logo (if provided)

Ask **one question at a time**, accept "skip"/"keep default" for any of them, and
never invent API keys. When done, run `npm install` and `npm run dev` and report
the local URL.

## The single source of truth

`app.config.ts` drives the brand, the marketing page, the dashboard navigation,
and the list of integrations this kit expects. Read it before changing UI copy.

## Bilingual (TR + EN)

Every user-facing string is `{ tr: "…", en: "…" }`. When you edit copy, **keep
both languages**. Shared UI strings (auth, nav chrome, buttons) live in
`lib/i18n/dict.ts`. The default language is set in `lib/i18n/config.ts`
(`DEFAULT_LANG`). A live TR/EN toggle sits in the navbar, dashboard topbar and
auth pages.

## Auth

`/login` and `/signup` are real screens but run a **demo bypass** — Supabase
isn't connected, so submitting (or "Continue with demo") just enters the
dashboard. Wiring Supabase via setup is what makes them do real auth.

## Demo mode

With no keys in `.env.local`, the app renders from `lib/demo/data.ts`. That is
intentional — it lets anyone boot the app instantly. Real integrations replace
the demo data once their keys are present.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you may know

This is Next.js 16 (App Router, React 19, Tailwind v4). APIs and conventions may
differ from older training data. If unsure about a Next.js API, check
`node_modules/next/dist/docs/` before writing code, and heed deprecation notices.
<!-- END:nextjs-agent-rules -->
