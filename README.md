# Panchayat Vermi Compost Ordering System

Production-ready MVP for online vermi compost orders with Razorpay payments, Supabase PostgreSQL, Resend email notifications, and an admin dashboard.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Prisma ORM** + **Supabase PostgreSQL**
- **Razorpay** (payments)
- **Resend** (email)
- **Vercel** (deployment)

## Features

- Mobile-first landing page with order form
- Dynamic total: `quantity × ₹10`
- Razorpay checkout with server-side signature verification
- Order persistence with payment status tracking
- Admin dashboard (search, filter, sort by latest)
- Email notifications on successful payment
- WhatsApp notification stub (ready to wire to Meta/Twilio)

## Project Structure

```
panchayat-vermi-compost/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── api/orders/      # create, verify, cancel, fail
│   │   ├── api/admin/       # login, logout, orders
│   │   ├── admin/           # login + dashboard
│   │   ├── order/           # success & failed pages
│   │   └── page.tsx         # landing + order form
│   ├── components/
│   ├── lib/
│   └── middleware.ts
├── .env.example
└── vercel.json
```

## Prerequisites

- Node.js 18+
- Supabase project (PostgreSQL)
- Razorpay account (test/live keys)
- Resend account + verified domain
- Vercel account (for deployment)

---

## Local Setup

### 1. Clone and install

```bash
cd panchayat-vermi-compost
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env` (see `.env.example` for descriptions).

**Supabase database URLs**

1. Open Supabase → Project Settings → Database
2. Copy **Connection string** (URI)
3. Use **Transaction pooler** URL for `DATABASE_URL` (port 6543, `?pgbouncer=true`)
4. Use **Session pooler** or direct URL for `DIRECT_URL` (port 5432)

### 3. Database migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

For production / CI:

```bash
npx prisma migrate deploy
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (password from `ADMIN_PASSWORD`)

---

## Razorpay Setup

1. Create account at [https://razorpay.com](https://razorpay.com)
2. Dashboard → Settings → API Keys → generate Test keys
3. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Use test card `4111 1111 1111 1111`, any future expiry, any CVV

---

## Resend Setup

1. Sign up at [https://resend.com](https://resend.com)
2. Add and verify your domain
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
4. Set `ADMIN_NOTIFICATION_EMAIL` for admin alerts
5. Set `CUSTOMER_NOTIFICATION_EMAIL` for order receipts (MVP: routes customer confirmation to this inbox with customer phone in body; add customer email field or WhatsApp API for direct delivery)

---

## Payment Flow

1. User submits order form → `POST /api/orders/create`
2. Order saved as `PENDING`, Razorpay order created
3. Razorpay checkout opens in browser
4. On success → `POST /api/orders/verify` (HMAC signature check)
5. Order marked `PAID`, emails sent, redirect to `/order/success`
6. Cancel/fail → status updated, redirect to `/order/failed`

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Panchayat vermi compost ordering system"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import repository
2. Framework preset: **Next.js**
3. Add all environment variables from `.env.example`
4. Deploy

### 3. Environment variables on Vercel

Add every variable from `.env.example` in Project Settings → Environment Variables.

`vercel.json` runs `prisma migrate deploy` during build — ensure `DATABASE_URL` and `DIRECT_URL` are set for Production.

### 4. Post-deploy

- Set Razorpay webhook (optional) for additional reliability
- Switch to live Razorpay keys when going live
- Verify Resend domain for production emails

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client + build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:migrate:deploy` | Deploy migrations (prod) |
| `npm run db:studio` | Open Prisma Studio |

---

## Admin Dashboard

- URL: `/admin`
- Password: value of `ADMIN_PASSWORD` env variable
- Features: view orders, search by phone, filter by status, sorted latest first

---

## Security (Staff Review Summary)

| Area | Mitigation |
|------|------------|
| Payment verification | HMAC signature (timing-safe) + Razorpay API fetch + amount/currency match |
| Idempotency | Atomic `updateMany` (PENDING→PAID only once); unique `razorpayPaymentId` |
| Webhook | `POST /api/webhooks/razorpay` with `X-Razorpay-Signature` verification (`RAZORPAY_WEBHOOK_SECRET`) |
| Order status API | Requires secret `checkoutToken` (not guessable order id alone) |
| Admin | HttpOnly cookie, `sameSite: strict`, 8h session, rate-limited login, hashed password compare |
| Success page | Order details only with valid `orderId` + `token` pair |
| HTTP headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` |
| Rate limits | Per-IP on create, verify, status, admin login (in-memory; use Redis at scale) |

**Configure webhook in Razorpay Dashboard:** `https://your-domain.com/api/webhooks/razorpay` — events: `payment.captured`, `payment.authorized`.

**Run new migration after pull:**

```bash
npx prisma migrate deploy
```

---

## WhatsApp (Production)

The MVP logs WhatsApp messages to the server console. To enable real notifications:

1. Register WhatsApp Business API (Meta Cloud API or Twilio)
2. Replace `logWhatsAppNotifications` in `src/lib/email.ts` with your provider SDK
3. Set `ADMIN_WHATSAPP_NUMBER` for admin alerts

---

## License

MIT — built for Gram Panchayat digital services.
