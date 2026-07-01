# WardrobeFlow - V1 Development Phases

This document defines the build order for Version 1. Each phase is intentionally scoped so a detailed implementation plan can be written later without rethinking dependencies.

**References:** `product.md` (what), `hld.md` (how), `system-design.md` (architecture)

**Principle:** Ship the daily logging loop as early as possible. Add read-heavy views (dashboard, history, analytics) once the write path is reliable.

---

## Engineering principles (every phase)

All implementation - including catch-up work - must be **modular, scalable, DRY, and SOLID**, consistent with [`hld.md`](hld.md) §7 and [`system-design.md`](system-design.md) §4.

### Architecture and modularity

```
src/features/{outfits,wardrobe,dashboard,history,analytics}/
├── schemas/     # Zod - single source of truth (client + server)
├── queries/     # Read-only Supabase access (no JSX)
├── actions/     # Server Actions: auth → validate → delegate → revalidate
├── components/  # Feature UI only
└── lib/         # Pure helpers (day-type rules, picker utils, summaries)
```

| Rule | Why |
|------|-----|
| One feature folder per domain | Isolated modules; analytics adds `features/analytics/` without touching others |
| Pages are thin | `page.tsx` composes feature components + calls queries - no business logic inline |
| Shared UI in `components/ui/` and `components/layout/` | Primitives stay stateless; no Supabase in UI layer |
| Shared constants once | [`day-types.ts`](src/lib/validations/day-types.ts), [`categories.ts`](src/lib/validations/categories.ts) - never duplicate enums/labels |
| Postgres RPC for multi-table writes | Transaction logic in DB; Server Actions stay thin wrappers |

### DRY

- One Zod schema per form/mutation; shared in RHF resolver and Server Action
- `DAY_TYPE_CONFIG` reused by dashboard, history calendar, timeline badges
- One `revalidateOutfitPaths(date)` helper for all outfit mutations
- Pure helpers for outfit summaries (`formatOutfitSummary`, `hasOutfitItems`) - not duplicated in dashboard/history queries
- Reuse `FormPanel` / `FormSection`, `EmptyState`, `OfficeItemPicker` - feature-specific copy only

### SOLID (practical)

| Principle | How |
|-----------|-----|
| **S**ingle responsibility | Queries read; actions mutate; components render; RPC handles transactions |
| **O**pen/closed | Extend day types or widgets via config maps, not core flow rewrites |
| **L**iskov substitution | `DailyEntryForm` same contract for create/edit; collapsible outfit section works for all day types |
| **I**nterface segregation | Small query functions (`get-today-outfit`, `get-recent-activity`) vs mega-fetch |
| **D**ependency inversion | Pages depend on feature queries/actions, not raw Supabase client |

### Next.js performance (faster site)

Per [`product.md`](product.md) §14 and [`hld.md`](hld.md) §12:

| Practice | Apply when |
|----------|------------|
| **Server Components by default** | Data pages: dashboard, history, wardrobe grid shell |
| **Client islands only when needed** | Forms, collapsible outfit section, history tabs/calendar/sheet |
| **No client-side data fetching** | Pagination/filters via `searchParams` + server re-render |
| **Parallel fetching** | `Promise.all` on dashboard and any multi-query page |
| **Targeted `revalidatePath`** | Shared helpers only - never blanket `/` |
| **`loading.tsx` skeletons** | Routes with noticeable data fetch |
| **Avoid barrel files** | Direct imports for tree-shaking |
| **No TanStack Query / global state** | Server render + revalidation for v1 CRUD |
| **Remove unused client JS** | Dropping wardrobe images removes compress/upload client code |

---

## Phase overview

```text
Phase 1  Foundation & Data Layer
   ↓
Phase 2  Authentication & App Shell
   ↓
Phase 3  Wardrobe Management
   ↓
Phase 4  Outfit Logging (core loop)
   ↓
Phase 5  Dashboard
   ↓
Phase 6  History
   ↓
Phase 7  Analytics
   ↓
Phase 8  Production Readiness & Launch
```

---

## Phase 1 - Foundation & Data Layer

**Goal:** Establish the technical base every feature builds on.

**Why first:** Auth, wardrobe, and outfits all depend on the same schema, Supabase clients, validation patterns, and folder structure. Building features before this creates rework.

### Scope

* Next.js App Router project structure (`app/`, `features/`, `lib/`, `components/`)
* Supabase project wiring (env vars, server + browser clients)
* Full v1 database schema (`profiles`, `clothing_items`, `outfits`, `outfit_items`, `wear_history`)
* Indexes and constraints (`UNIQUE(user_id, date)`, `UNIQUE(outfit_id, role)`, FKs)
* Row Level Security policies on all user tables
* Profile row creation on signup (trigger or server-side hook)
* Shared Zod schemas and TypeScript types for core entities
* shadcn/ui + Tailwind baseline (Button, Input, Card, etc.)
* Local dev workflow documented and working

### Out of scope

* User-facing pages beyond a health-check or placeholder
* Business mutations (create outfit, add clothing)
* Deployment to production

### Exit criteria

* Schema matches `hld.md` §9 / `system-design.md` §11
* RLS verified: user A cannot read or write user B's rows
* Supabase clients callable from Server Components and Server Actions
* Project runs locally with no type or lint errors

---

## Phase 2 - Authentication & App Shell

**Goal:** Users can sign up, log in, and navigate a protected mobile-first shell.

**Why now:** Every product feature requires an authenticated session and consistent layout. The shell sets navigation patterns used by all later phases.

### Scope

* Auth pages: `/login`, `/signup`, `/forgot-password`
* Email + password signup, login, logout, password reset (Supabase Auth)
* Session persistence and middleware-based route protection
* Redirect unauthenticated users to login; redirect authenticated users away from auth pages
* App shell: top bar, bottom navigation (mobile), responsive layout (desktop)
* Protected route stubs: `/dashboard`, `/wardrobe`, `/outfits/new`, `/history`, `/analytics`, `/settings`
* Settings page (minimal): logout action
* Empty states on stub pages ("coming soon" or zero-data placeholders)

### Out of scope

* Wardrobe CRUD
* Outfit logging
* Real dashboard data

### Exit criteria

* Full auth flow works end to end
* All protected routes require a session
* Mobile bottom nav and desktop layout are usable
* New user lands on dashboard after signup with an empty profile

---

## Phase 3 - Wardrobe Management

**Goal:** Users can build and maintain their clothing inventory.

**Why before outfits:** Office outfit logging requires selectable shirt, pants, and shoes from the user's wardrobe.

### Scope

* Wardrobe list page (`/wardrobe`) with category grouping or filtering
* Add clothing item (`/wardrobe/new`)
* Edit clothing item (`/wardrobe/[id]/edit`)
* Delete clothing item with guard (blocked if referenced in `outfit_items` or `wear_history`)
* Fields: name, category (shirt / pants / shoes), color, notes
* Filter and search by category / name
* Server Actions for create, update, delete
* Targeted revalidation after mutations
* Empty state: no clothing items yet

### Out of scope

* Outfit logging
* Wear counts on item cards (comes with analytics / history)
* Repetition warnings

### Exit criteria

* User can add an item in under 30 seconds (PRD success metric)
* CRUD works with server-side validation (Zod)
* Delete correctly blocked for items used in history
* Wardrobe page loads with user-scoped data only

---

## Phase 4 - Outfit Logging (Core Loop)

**Goal:** Users can log, edit, and delete daily entries - the primary product action.

**Why now:** This is the core value proposition. Dashboard, history, and analytics are read views on data created here.

### Scope

* Outfit entry page (`/outfits/new`, `/outfits/[date]`)
* Day types: **Office**, **Stay home**, **Travel**, **Day out** (`office`, `stay_home`, `travel`, `day_out`)
* **Every day:** day type + optional note (fast path - save without outfit items)
* **Office:** shirt + pants required; shoes optional; outfit picker shown by default
* **Stay home / Travel:** optional outfit - picker collapsed by default (“Add what you wore”)
* **Day out:** optional outfit - picker shown by default (“What did you wear?”)
* **Optional outfit (non-office):** same picker; no minimum items; `wear_history` per selected item only
* One entry per date (`UNIQUE(user_id, date)`); existing date opens edit mode
* **Repetition detection** when outfit picker is open (informational; copy may vary by day type):
  * Worn yesterday
  * Worn 2 days ago
  * Worn 3× this week (Mon–Sun)
* Transaction-safe mutations (`hld.md` §14 / `system-design.md` §13):
  * Create outfit (day type only) → `outfits`
  * Create outfit (with items) → `outfits` + `outfit_items` + `wear_history`
  * Edit outfit → replace items and wear records atomically
  * Delete outfit → cascade delete wear records and items
* Revalidation of affected routes after every mutation

### Out of scope

* Dashboard widgets showing outfit data
* Timeline / calendar history views
* Analytics aggregates
* Day-type–filtered analytics views (Phase 7)

### Exit criteria

* User can log today's entry in under 10 seconds via fast path (day type only) or full office outfit
* Office requires shirt + pants; shoes optional
* Optional outfit on stay home / travel / day out persists items and wear records when user selects them
* Day-type changes handle required vs optional items and wear records correctly
* Failed transaction leaves no partial data
* Repetition warnings appear in picker and do not block selection
* Edit and delete flows match `hld.md` §8.4–8.5

---

## Phase 5 - Dashboard

**Goal:** Give users an at-a-glance home screen that answers "what did I wear?" and "what's next?"

**Why after outfit logging:** Dashboard widgets read from `outfits`, `wear_history`, and `clothing_items`. Without Phase 4, the dashboard has nothing meaningful to show.

### Scope

* Dashboard page (`/dashboard`) as default post-login landing
* **Today's status** - current day's outfit or day type
* **Recent activity** - last 7 days summary
* **Wardrobe summary** - item count by category
* **Quick add outfit** - CTA to `/outfits/new` (or edit today if entry exists)
* Selective server queries (no over-fetching)
* Short-lived cache acceptable (30–60s per `system-design.md` §7)
* Empty states: no outfit logged today, no history yet

### Out of scope

* Full history pagination
* Analytics charts
* Calendar view

### Exit criteria

* Dashboard loads in under 1 second with typical data (PRD target)
* All four widgets show correct live data
* Quick add routes to create or edit today's entry correctly
* Works on 375px mobile viewport

---

## Phase 6 - History

**Goal:** Users can browse past entries by timeline and calendar.

**Why after dashboard:** History is a deeper read view. The daily loop (dashboard → log outfit) should work before investing in browse UX.

### Scope

* History page (`/history`)
* **Timeline view** - paginated, newest first
* **Calendar view** - monthly grid with day-type markers (office, stay home, travel, day out)
* Day detail drawer / page - full outfit or day-type info for selected date
* Edit and delete actions from day detail (reuse Phase 4 mutations)
* Month-scoped queries for calendar (never load full history)
* Pagination for timeline (never load full history)

### Out of scope

* Analytics aggregates
* Export or sharing

### Exit criteria

* Timeline paginates correctly
* Calendar shows correct day types for the visible month
* Tapping a day opens accurate detail
* Edit/delete from history reflects on dashboard immediately (revalidation)

---

## Phase 7 - Analytics

**Goal:** Surface wardrobe usage insights from accumulated wear data.

**Why near the end:** Analytics need `wear_history` and `outfits` data. Queries are the heaviest reads in v1 - best built once the data model and write paths are stable.

### Scope

* Analytics page (`/analytics`)
* **Most worn items** - top items by wear count (all contexts); optional filters by day type (office, stay home, travel, day out)
* **Least worn items** - rarely used items
* **Day-type breakdown** - monthly counts for office, stay home, travel, day out
* Per-item stats where shown: total wears, last worn date, wears this month
* Database-side aggregation (not client-side)
* Short-lived cache for expensive aggregates
* Empty state: not enough data yet

### Out of scope

* Charts beyond simple ranked lists / summary cards
* Date-range picker (default to current month or all-time as decided in phase plan)
* AI recommendations

### Exit criteria

* All PRD §12 analytics widgets implemented
* Aggregations run in PostgreSQL, not the browser
* Page remains responsive with hundreds of wear records
* Numbers stay consistent with outfit edit/delete (revalidation or cache invalidation)

---

## Phase 8 - Production Readiness & Launch

**Goal:** Harden the app for real daily use and deploy to production.

**Why last:** Performance tuning, error handling, and deployment are most effective when the full feature set exists.

### Scope

* Performance pass against PRD targets:
  * Initial page load < 2s
  * Dashboard < 1s
  * Outfit save < 300ms perceived latency
* Error states: session expired, validation failed, blocked delete
* Empty states polished across all pages
* Settings page: account email display, logout
* Environment config for Vercel + Supabase production
* Deploy to Vercel; production Supabase project
* Basic observability: Vercel logs, Supabase logs, mutation error visibility
* Final mobile UX pass (touch targets, bottom nav, transitions)
* Smoke test full user journey: signup → add clothes → log outfits → review history → check analytics

### Out of scope

* Features listed in PRD §17 (AI, social, notifications, etc.)
* Custom domain setup (unless decided in phase plan)
* Automated test suite (unless decided in phase plan)

### Exit criteria

* Production deployment is live and accessible
* Full v1 user journey works on mobile and desktop
* No known data integrity issues (transactions, RLS, delete guards)
* PRD §18 success metrics achievable in manual testing

---

## Phase dependency map

```text
                    ┌─────────────────┐
                    │  Phase 1        │
                    │  Foundation     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Phase 2        │
                    │  Auth + Shell   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Phase 3        │
                    │  Wardrobe       │
                    └────────┬────────┘
                             │
              ┌──────────────▼──────────────┐
              │  Phase 4                    │
              │  Outfit Logging + Repetition│
              └──────────────┬──────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌───────▼───────┐ ┌─────────▼─────────┐
│  Phase 5        │ │  Phase 6      │ │  Phase 7          │
│  Dashboard      │ │  History      │ │  Analytics        │
└────────┬────────┘ └───────┬───────┘ └─────────┬─────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Phase 8        │
                    │  Launch         │
                    └─────────────────┘
```

Phases 5, 6, and 7 can run in parallel once Phase 4 is complete, but the recommended serial order above prioritizes the daily-use path (dashboard before browse before insights).

---

## What each phase plan should contain (later)

When creating a detailed plan for any phase, include:

1. **Tasks** - concrete file/route/action checklist
2. **Database changes** - migrations specific to that phase (if any)
3. **Server Actions / queries** - names and responsibilities
4. **UI components** - from `hld.md` §16
5. **Test scenarios** - manual or automated
6. **Revalidation map** - which paths to invalidate after mutations

---

## V1 completion definition

Version 1 is complete when all 8 phases meet their exit criteria and the product delivers:

* Personal wardrobe inventory
* Daily logging: day type on every entry; outfit items required on office, optional on other day types
* Repetition warnings at selection time (context-aware by day type)
* Dashboard, history, and analytics views
* Transaction-safe data integrity
* Mobile-first, production-deployed experience

Everything in PRD §17 remains out of scope.
