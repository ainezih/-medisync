# Clinica

**Patient management for small clinics & private practices** — appointments,
patient charts, e-prescriptions, billing and reminders, in one calm panel.
Tagline: *"Run your practice, not your paperwork."*

A production-grade **Next.js 16** starter, built to be rebranded in five minutes.
Inspired by the clean, calm medical-SaaS aesthetic of **drchrono.com** and
**semble.io**.

> ⚠️ All patient data in this kit is **fictional** — invented for demonstration
> only. There is no real PHI. Apply your own policies for real-world compliance
> (e.g. HIPAA/GDPR) before going to production.

## Quick start

```bash
npm install
npm run dev          # → http://localhost:3000  (runs in demo mode, no keys needed)
```

The app boots straight into a live **clinic cockpit** with a sample schedule,
patient roster, charts, prescriptions and billing — all fictional.

## Make it yours

Open this folder in **Claude Code** and say:

> **"set up this project"**  (or run **`/setup`**, or open **`START-HERE.md`**)

Claude interviews you for your **clinic brand**, **logo**, **colors**, and the
**API keys this app needs**, then writes your `app.config.ts` and `.env.local`
and boots it. Prefer to do it by hand? Follow [`SETUP.md`](./SETUP.md) — every
step names the exact file to change.

## What's inside

```
app.config.ts            ← single source of truth (brand, copy, nav, integrations)
app/(marketing)/         ← calm medical landing page (config-driven + interactive demo)
app/(app)/dashboard/     ← clinic cockpit (schedule, queue, charts, revenue, Rx, billing)
app/(app)/patients/      ← patient roster + chart drawer
app/(app)/appointments/  ← week/day calendar grid
components/app/clinic.tsx ← SVG-initial avatars, status pills, patient chart drawer
components/app/charts.tsx ← inline-SVG charts (area, donut, mini-line) — NO chart lib
lib/demo/data.ts         ← fictional patients/appointments that power demo mode
.env.example             ← the keys this kit can use (all optional)
SETUP.md                 ← the guided-setup script
```

## Integrations (all optional, demo-mode by default)

- **Supabase** — database & auth for patients, appointments and charts.
- **Twilio** — SMS appointment reminders to cut no-shows.
- **Stripe** — billing & card payments for visit invoices.
- **Daily** — secure one-click telehealth video visits.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · lucide-react. All visuals are
inline SVG (logomark, charts, avatars) — no photos, no chart library. Bilingual
TR/EN with a live toggle. No database required to run; it falls back to realistic
fictional demo data.
