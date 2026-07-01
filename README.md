# WardrobeFlow

A personal wardrobe tracking app - log what you wore each day, manage your clothing inventory, and avoid repeating outfits too often.

Built for fast daily logging on mobile and desktop. No AI, no social features - just a clean habit loop: **wardrobe → log → history → insights**.

---

## What it does

| Area | What you get |
|------|----------------|
| **Wardrobe** | Catalog tops, pants, jackets, and shoes with color and notes; archive items used in outfit history |
| **Outfit logging** | Log up to 5 outfits per day with day type (office, stay home, travel, day out) |
| **Dashboard** | Today’s outfits, week strip, streak, and quick stats |
| **History** | Timeline and calendar views of past days |
| **Analytics** | Most/least worn items, day-type breakdown, monthly trends |
| **Settings** | Profile name, password change, sign out |

Auth is email + password via Supabase. Every user only sees their own data (Row Level Security).

---

## Architecture

```text
Browser
   │
   ▼
Next.js 16 (App Router) on Vercel
   ├── Server Components  → page data (queries in features/*)
   ├── Server Actions     → form mutations (create outfit, CRUD wardrobe, auth)
   ├── Route Handlers     → /auth/callback, /outfits/new redirect
   └── Middleware         → Supabase session refresh + route protection
   │
   ▼
Supabase
   ├── Auth       → sessions, password reset
   ├── PostgreSQL → profiles, clothing_items, outfits, outfit_items, wear_history
   │                RLS on all user tables; outfit writes via RPC (transactions)
   └── Storage    → clothing-images bucket (reserved for future image uploads)
```

### Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (Auth, Postgres, Storage)
- **Hosting:** Vercel (recommended)

### Project layout

```text
src/
├── app/                    # Routes
│   ├── (auth)/             # Login, signup, forgot password
│   ├── (app)/              # Protected app (dashboard, wardrobe, outfits, …)
│   ├── auth/callback/      # Supabase OAuth / email link handler
│   └── page.tsx            # Public marketing landing
├── components/
│   ├── brand/              # Logo assets
│   ├── layout/             # AppShell, sidebar, bottom nav
│   ├── marketing/          # Landing page sections
│   └── ui/                 # shadcn primitives
├── features/               # Domain modules (colocated actions, queries, components)
│   ├── auth/
│   ├── wardrobe/
│   ├── outfits/
│   ├── dashboard/
│   ├── history/
│   ├── analytics/
│   └── profile/
├── lib/                    # Supabase clients, timezone helpers, navigation, error mapping
└── types/                  # Shared TypeScript types (incl. database types)

supabase/migrations/        # SQL schema, RLS, RPC functions (001–019)
```

Each feature folder typically contains `actions/`, `queries/`, `components/`, `schemas/`, and `lib/` - mutations return typed results; pages stay thin and fetch on the server.

---

## Local development

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase **Settings → API** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key from the same page |
| `NEXT_PUBLIC_SITE_URL` | App origin - `http://localhost:3000` locally; your production domain when deployed |

`NEXT_PUBLIC_SITE_URL` is used for password-reset redirect links and Open Graph metadata. Auth callbacks are built as `{SITE_URL}/auth/callback`.

In production, this must match your deployed origin (e.g. `https://wardrobe-flow.vercel.app`) - not `localhost`.

### 3. Supabase Auth configuration

In **Authentication → URL Configuration**:

| Setting | Local | Production |
|---------|-------|------------|
| **Site URL** | `http://localhost:3000` | `https://your-production-domain` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` | `https://your-production-domain/auth/callback` |

Add both URLs if you use one Supabase project for dev and prod. Supabase only redirects to allowlisted callback URLs after email links (password reset, email confirmation). Normal email/password login works without clicking email links, but reset password **requires** these to match `NEXT_PUBLIC_SITE_URL`.

### 4. Database migrations

Apply all migrations in order. Easiest with the Supabase CLI (linked to your project):

```bash
supabase db push
```

Or run each file manually in the [Supabase SQL Editor](https://supabase.com/dashboard):

`001_initial_schema.sql` → … → `019_clothing_archive.sql`

Key migrations:

- **001–005** - Schema, RLS, profile trigger, storage bucket, API grants
- **006–008** - Outfit RPCs, optional shoes, day types
- **009–016** - Analytics RPCs and snapshot optimizations
- **017** - Outfit integrity (future-date guard, concurrency lock, max 5/day)
- **018** - User timezone (`profiles.timezone`, local-date outfit logging)
- **019** - Clothing archive (`archived_at`, picker/wardrobe filtering, RPC guards)

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Verify locally

```bash
npm run lint
npm run build
```

---

## Production deployment

### Supabase (production)

1. Create a **separate** Supabase project for production (don’t share dev/prod DB).
2. Run migrations: `supabase db push` (all 001–019).
3. Set **Site URL** and **Redirect URLs** (see step 3 above) with your real domain.
4. Copy URL + anon key from **Settings → API**.

### Vercel

1. Import the Git repository at [vercel.com](https://vercel.com).
2. Set environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-production-domain` |

3. Deploy - Vercel auto-detects Next.js; no extra build config needed.

### Post-deploy smoke test

1. Sign up → land on dashboard
2. Add a top and pants to wardrobe
3. Log today’s outfit (office day type) - verify it works in your local timezone
4. Check dashboard, history (timeline + calendar), and analytics
5. Archive a referenced item → hidden from wardrobe/picker, still visible in history
6. Edit outfit → refresh → counts update
7. Delete outfit → analytics reflects removal
8. Forgot password → email link returns to your production domain
9. Sign out → protected routes redirect to login

### Deploy checklist

```bash
supabase db push          # against production project (001–019)
npm run lint && npm run build
# Set all 3 env vars on Vercel
# NEXT_PUBLIC_SITE_URL must equal your Vercel/production domain (https://…)
# Supabase Site URL + Redirect URLs must include {SITE_URL}/auth/callback
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |

---

## Brand assets

Regenerate PNG logo and favicon:

```bash
python3 scripts/generate_brand_assets.py
```

Requires [Pillow](https://pypi.org/project/Pillow/) (`pip install pillow`). Outputs `public/brand/icon.png`, `public/brand/logo.png`, and favicon set (`favicon.ico`, `apple-touch-icon.png`, etc.). App metadata references `/brand/*` via `src/lib/metadata/site.ts`.

---

## Further documentation

| File | Contents |
|------|----------|
| [`product.md`](product.md) | Product requirements and scope |
| [`hld.md`](hld.md) | High-level design and data model |
| [`system-design.md`](system-design.md) | Detailed architecture decisions |
| [`phases.md`](phases.md) | Development phases |
| [`audit/`](audit/) | Product audit reports and fix log |

---

## License

Private project - all rights reserved unless otherwise specified.
