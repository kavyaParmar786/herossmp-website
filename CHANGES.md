# HeroS SMP — Update Changelog

## What Changed

### 🔐 Auth System (Complete Overhaul)
- **4 login methods**: Google, Discord, Twitter/X, Email+Password
- OAuth callbacks at `/api/auth/callback/{google,discord,twitter}`
- OAuth users auto-created, existing users auto-linked by email
- `src/middleware.ts` — server-side auth guard, protects `/dashboard`, `/tickets`, `/cart`, `/admin`
- Redirects guests to `/login?redirect=<path>` and logged-in users away from `/login`/`/register`

### 📧 Email Notifications (NEW)
- `src/lib/email.ts` — Resend-based email utility
- **Welcome email** sent to every new user (email + OAuth)
- **Admin notification** sent to `ADMIN_EMAIL` when anyone registers
- Non-blocking — won't slow down registration

### 🎬 Loading Screen (NEW)
- `src/components/layout/LoadingScreen.tsx`
- Cinematic intro with floating logo, animated purple glow, loading bar
- Only shows once per browser session (uses sessionStorage)
- Smooth fade-out after 2.8s

### 🖼️ Logo Fix
- Logo uses `mix-blend-mode: screen` — black background becomes transparent
- Applied in: hero section, navbar (via CSS), loading screen, auth pages

### 📊 Real Stats (No More Fake Data)
- `src/app/api/stats/route.ts` — reads from MongoDB
- **Players**: actual `User.countDocuments()` 
- **Total Kills**: `Leaderboard.aggregate()` sum of all kills
- Falls back gracefully if DB unavailable

### 🏆 Leaderboard Fix
- Leaderboard code was correct — it just needed data
- `scripts/seed-leaderboard.js` — seeds 10 demo players with realistic stats
- Run: `node scripts/seed-leaderboard.js`

### 🗂️ Files Changed
| File | Status |
|------|--------|
| `src/middleware.ts` | **NEW** |
| `src/lib/email.ts` | **NEW** |
| `src/lib/oauth.ts` | **NEW** |
| `src/app/api/stats/route.ts` | **NEW** |
| `src/app/api/auth/oauth/route.ts` | **NEW** |
| `src/app/api/auth/callback/google/route.ts` | **NEW** |
| `src/app/api/auth/callback/discord/route.ts` | **NEW** |
| `src/app/api/auth/callback/twitter/route.ts` | **NEW** |
| `src/components/layout/LoadingScreen.tsx` | **NEW** |
| `scripts/seed-leaderboard.js` | **NEW** |
| `.env.local.example` | **NEW** |
| `src/app/layout.tsx` | Updated |
| `src/app/page.tsx` | Updated |
| `src/app/login/page.tsx` | Updated |
| `src/app/register/page.tsx` | Updated |
| `src/hooks/useAuth.tsx` | Updated |
| `src/models/User.ts` | Updated |
| `src/types/index.ts` | Updated |
| `src/app/api/auth/register/route.ts` | Updated |

## Setup Checklist
1. Copy `.env.local.example` → `.env.local` and fill in values
2. Run `node scripts/seed-leaderboard.js` to populate leaderboard
3. Register OAuth apps (see .env.local.example for links)
4. Sign up at resend.com for email API key (free)
5. Deploy — all changes are drop-in compatible
