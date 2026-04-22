# Changelog — HeroSMP Website Upgrades

## Bug Fixes
- **Tickets** — Fixed `require('mongoose')` inside async handler causing errors in Next.js 15. Replaced with top-level `import mongoose from 'mongoose'`
- **Ticket `[id]` route** — Fixed `params` not being awaited (Next.js 15 requires `await params`). Applied same fix to `news/[id]` and `products/[id]` routes
- **Navbar** — Added passive scroll listener for better scroll performance

## New Feature: Applications System
- **Admin Panel → Applications tab** — Create and manage application forms with full CRUD
  - Add any number of questions per form
  - Question types: Short Answer, Long Answer, Q&A, Multiple Choice (MCQ), Yes/No, Rating (1-10)
  - Toggle forms open/closed
  - Set a role label per form (e.g. STAFF, BUILDER, MOD)
- **Submissions viewer** — Browse applicants, expand to read answers, Accept or Reject with optional staff note
- **Public Apply page** — `/apply` lists all open positions; `/apply/[slug]` renders the form with proper input UI per question type
- **Dashboard** — Users can see their own application statuses

## Animations & UI Polish
- **Hero section** — `hero-reveal` staggered entrance animation (opacity + translateY + blur)
- **Stat cards** — Stagger fade-in on load
- **Button CTA** — Subtle `ctaPulse` glow animation (3s loop)
- **Aurora blobs** — Two pure-CSS radial gradient blobs rotating slowly behind the background (no JS)
- **Scanline sweep** — Subtle scanline that drifts top-to-bottom across the page
- **glass-hover** — Now uses `cubic-bezier(0.22,1,0.36,1)` for snappy, spring-like card hover
- **Input focus** — Added `box-shadow` ring on focus for better accessibility feedback

## Performance
- `VideoBackground` — Added `transform: translateZ(0)` + `will-change: auto` to keep video on GPU layer
- Scroll listener on Navbar uses `{ passive: true }`
- All animations use only `transform` and `opacity` (composited properties, no layout repaints)
- `backdrop-filter` glass uses `translateZ(0)` to avoid per-frame compositing cost

## Navigation
- Added "Apply" link to desktop nav and mobile menu
- "Apply for Staff" CTA button on homepage hero
- User dropdown includes Apply link

## v2.0 — Polish + Applications System (Latest)

### 🐛 Bug Fixes
- **Tickets fixed**: Replaced `require('mongoose')` inside async route handler with proper top-level import — this was causing a runtime crash when replying to tickets
- **Next.js 15 params**: All API routes now use `Promise<{ id: string }>` params (required by Next.js 15) instead of sync params — fixes errors in `/api/tickets/[id]`, `/api/news/[id]`, `/api/products/[id]`
- Ticket reply now correctly creates a new `mongoose.Types.ObjectId` without dynamic require

### ✨ Animations & Performance
- **Hero section**: Added staggered `hero-reveal` text animation with blur+slide entrance
- **Page transitions**: Smooth `page-enter` animation on every route change
- **Aurora background**: Slow-rotating CSS-only aurora blobs that loop infinitely
- **Scanline effect**: Subtle scanline sweep across the video background
- **CTA button**: Gentle pulse glow animation on primary buttons
- **Loading screen**: New animated progress bar with phase text
- **Video background**: Added `translateZ(0)` + `willChange:auto` for GPU compositing
- **Glass hover**: Switched to `cubic-bezier(0.22,1,0.36,1)` for snappy spring feel
- **Stats cards**: Stagger `animate-fade-in` with CSS nth-child delays
- **Input focus**: Soft violet ring glow on all inputs/textareas

### 📋 Applications System (New)
- **Admin panel tab**: "Applications" in the sidebar
- **Form builder**: Create application forms with title, slug, description, and any number of questions
- **Question types**: Short, Long, Q&A, Multiple Choice (MCQ), Yes/No, Rating (1–10)
- **MCQ options**: Paste options line-by-line in the admin builder
- **Toggle open/close**: Toggle applications open or closed without deleting the form
- **Submissions view**: See all submissions per form; expand to read answers
- **Review actions**: Accept or Reject with an optional staff note
- **Public apply page**: `/apply` lists all open positions; `/apply/[slug]` shows the form
- **User dashboard**: Shows submitted applications with live status badges
- **Anti-duplicate**: Users can't submit the same form twice
- **Navbar link**: "Apply" added to main navigation

### 🗃️ New Files
- `src/models/Application.ts` — `ApplicationForm` + `ApplicationSubmission` Mongoose models
- `src/app/api/applications/forms/route.ts` — CRUD for forms
- `src/app/api/applications/forms/[id]/route.ts` — individual form ops
- `src/app/api/applications/submit/route.ts` — user submission endpoint
- `src/app/api/applications/submissions/route.ts` — list submissions (admin + user)
- `src/app/api/applications/submissions/[id]/route.ts` — review/delete submission
- `src/components/admin/AdminApplications.tsx` — full admin UI
- `src/app/apply/page.tsx` — public listings page
- `src/app/apply/[slug]/page.tsx` — interactive application form
