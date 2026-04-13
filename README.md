# ⚔️ HeroS SMP — Full-Stack Web Application

A production-ready, full-stack Minecraft server website built with **Next.js 14 App Router**, **MongoDB Atlas**, **Razorpay**, and **Tailwind CSS** glassmorphism UI.

---

## 🗂️ Project Structure

```
heros-smp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── payment/
│   │   │   │   ├── create-order/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   ├── tickets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── news/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── leaderboard/route.ts
│   │   │   ├── server-status/route.ts
│   │   │   ├── faq/route.ts
│   │   │   └── admin/
│   │   │       ├── users/route.ts
│   │   │       └── settings/route.ts
│   │   ├── (pages)/
│   │   │   ├── page.tsx              → /
│   │   │   ├── HomepageClient.tsx
│   │   │   ├── store/
│   │   │   │   ├── page.tsx          → /store
│   │   │   │   └── [category]/page.tsx → /store/[category]
│   │   │   ├── cart/page.tsx         → /cart
│   │   │   ├── login/page.tsx        → /login
│   │   │   ├── register/page.tsx     → /register
│   │   │   ├── dashboard/page.tsx    → /dashboard
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx          → /tickets
│   │   │   │   └── [id]/page.tsx     → /tickets/[id]
│   │   │   ├── news/page.tsx         → /news
│   │   │   ├── faq/page.tsx          → /faq
│   │   │   └── admin/page.tsx        → /admin
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/index.tsx              (Button, Input, Card, Badge, etc.)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── ServerStatus.tsx
│   │   │   └── Leaderboard.tsx
│   │   ├── store/
│   │   │   └── ProductCard.tsx
│   │   └── admin/
│   │       ├── AdminProducts.tsx
│   │       ├── AdminNews.tsx
│   │       ├── AdminTickets.tsx
│   │       ├── AdminUsers.tsx
│   │       ├── AdminSettings.tsx
│   │       └── AdminFAQ.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx               (AuthContext + useAuth)
│   │   └── useCart.tsx               (CartContext + useCart)
│   ├── lib/
│   │   ├── db.ts                     (MongoDB connection)
│   │   ├── auth.ts                   (JWT utilities)
│   │   └── utils.ts                  (helpers, formatters)
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Ticket.ts
│   │   └── index.ts                  (News, Leaderboard, FAQ, SiteSettings)
│   └── types/index.ts
├── scripts/
│   ├── seed.js                       (seed products, FAQs, leaderboard)
│   └── create-owner.js               (create first admin account)
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/heros-smp
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
MINECRAFT_SERVER_IP=play.herossmp.xyz
```

### 3. Set up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free cluster
2. Create a database user with read/write access
3. Whitelist your IP (or `0.0.0.0/0` for Vercel)
4. Copy the connection string into `MONGODB_URI`

### 4. Set up Razorpay

1. Go to [razorpay.com](https://razorpay.com) and create an account
2. Get your API keys from Dashboard → Settings → API Keys
3. Use **Test keys** during development (prefix `rzp_test_`)
4. Use **Live keys** in production (prefix `rzp_live_`)

### 5. Seed the database

```bash
# Seed products, leaderboard, FAQs, and site settings
node scripts/seed.js

# Create your first admin/owner account
OWNER_EMAIL=admin@herossmp.xyz \
OWNER_USERNAME=HerosAdmin \
OWNER_PASSWORD=YourSecurePassword123 \
node scripts/create-owner.js
```

### 6. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Add Environment Variables in Vercel:

Go to your project → **Settings** → **Environment Variables** and add all values from `.env.example`.

---

## 🔐 Roles & Permissions

| Role   | Permissions                                        |
|--------|----------------------------------------------------|
| USER   | View store, cart, checkout, tickets, dashboard     |
| STAFF  | All USER + reply/close tickets, post news          |
| ADMIN  | All STAFF + manage products, users, FAQs, settings |
| OWNER  | All ADMIN + assign ADMIN/OWNER roles               |

---

## 💳 Payment Flow (Razorpay)

```
User → Cart → POST /api/payment/create-order
                        ↓
             Razorpay order created (pending in DB)
                        ↓
             Razorpay checkout modal opens
                        ↓
             User pays via UPI/Card/NetBanking
                        ↓
             POST /api/payment/verify (HMAC check)
                        ↓
             Order marked COMPLETED in DB
                        ↓
             User redirected to Dashboard
```

---

## 🎮 API Reference

| Method | Endpoint                     | Auth     | Description              |
|--------|------------------------------|----------|--------------------------|
| POST   | /api/auth/register           | Public   | Register new user        |
| POST   | /api/auth/login              | Public   | Login user               |
| DELETE | /api/auth/login              | Public   | Logout (clear cookie)    |
| GET    | /api/products                | Public   | List all products        |
| POST   | /api/products                | ADMIN    | Create product           |
| PUT    | /api/products/:id            | ADMIN    | Update product           |
| DELETE | /api/products/:id            | ADMIN    | Delete product           |
| POST   | /api/payment/create-order    | USER     | Create Razorpay order    |
| POST   | /api/payment/verify          | USER     | Verify payment           |
| GET    | /api/tickets                 | USER     | Get user's tickets       |
| POST   | /api/tickets                 | USER     | Create ticket            |
| GET    | /api/tickets/:id             | USER     | Get ticket with messages |
| POST   | /api/tickets/:id             | USER     | Reply to ticket          |
| PATCH  | /api/tickets/:id             | STAFF    | Update ticket status     |
| GET    | /api/news                    | Public   | List news                |
| POST   | /api/news                    | STAFF    | Create news post         |
| PUT    | /api/news/:id                | STAFF    | Update news post         |
| DELETE | /api/news/:id                | ADMIN    | Delete news post         |
| GET    | /api/leaderboard             | Public   | Get leaderboard          |
| POST   | /api/leaderboard             | ADMIN    | Update player stats      |
| GET    | /api/server-status           | Public   | Live server status       |
| GET    | /api/faq                     | Public   | List FAQs                |
| POST   | /api/faq                     | ADMIN    | Create FAQ               |
| PUT    | /api/faq                     | ADMIN    | Update FAQ               |
| DELETE | /api/faq?id=:id              | ADMIN    | Delete FAQ               |
| GET    | /api/admin/users             | ADMIN    | List all users           |
| PATCH  | /api/admin/users             | ADMIN    | Change user role         |
| GET    | /api/admin/settings          | Public   | Get site settings        |
| PUT    | /api/admin/settings          | ADMIN    | Update site settings     |

---

## 🎨 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Language   | TypeScript                        |
| Styling    | Tailwind CSS + Glassmorphism      |
| Database   | MongoDB Atlas + Mongoose          |
| Auth       | JWT (jsonwebtoken) + bcryptjs     |
| Payments   | Razorpay (India, GST support)     |
| Deployment | Vercel (serverless)               |
| Fonts      | Cinzel (display) + Rajdhani (body)|

---

## ⚙️ Features Checklist

- [x] Homepage with hero, stats, server status, leaderboard, news, featured items
- [x] Live Minecraft server status via mcsrvstat.us API
- [x] Leaderboard with 10-second auto-refresh
- [x] Store with 6 categories (RANKS, KEYS, MONEY, COINS, LANDCLAIM, PACKS)
- [x] Cart with GST (18%) calculation
- [x] Razorpay payment integration with order creation & HMAC verification
- [x] JWT-based auth with 4 roles (USER, STAFF, ADMIN, OWNER)
- [x] Support ticket system with real-time polling chat
- [x] Admin panel (products, news, tickets, users, FAQs, settings)
- [x] News system
- [x] FAQ accordion
- [x] User dashboard
- [x] Glassmorphism dark gaming UI
- [x] Fully responsive
- [x] Vercel-ready deployment

---

## 📝 Notes

- **GST**: All prices shown in the store are before GST. The 18% GST is added at checkout.
- **Razorpay**: Test mode uses `rzp_test_` keys. Switch to live keys before going live.
- **Server Status**: Uses [mcsrvstat.us](https://mcsrvstat.us) public API. Cached for 30s.
- **Ticket Polling**: Messages refresh every 5 seconds (can be upgraded to WebSockets).
- **Leaderboard**: Auto-refreshes every 10 seconds. Use the `/api/leaderboard` POST endpoint or your Minecraft plugin to push stats.
