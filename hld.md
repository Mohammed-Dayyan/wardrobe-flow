# WardrobeFlow - High Level Design (HLD) v1

## 1. Purpose

WardrobeFlow is a personal wardrobe tracking web application for users who want to record what they wore each day, understand clothing usage, and avoid repeating outfits too often. The product is intentionally simple: fast daily logging, clear history, and useful wardrobe insights.

This HLD defines the version 1 system architecture, major components, data flow, data model, security model, and performance decisions.

**Canonical database schema:** §9 (mirrored in `system-design.md` §11).

---

## 2. Design Goals

### Primary goals

* Make daily outfit logging fast.
* Keep the application mobile-first and easy to use.
* Store wardrobe items and daily wear history safely.
* Support wardrobe-context day tracking: office, stay home, travel, day out
* Show useful insights without slow pages or heavy client-side work.

### Non-goals for v1

* AI outfit recommendations
* Weather-based suggestions
* Social sharing
* Multi-user/shared wardrobes
* Team or family accounts
* Packing lists
* Notifications
* QR tagging
* Marketplace features

---

## 3. Key Architecture Decisions

### Chosen stack

* **Frontend:** Next.js 15 App Router, TypeScript
* **UI:** Tailwind CSS + shadcn/ui
* **Forms:** React Hook Form + Zod
* **Auth:** Supabase Auth (email/password)
* **Database:** Supabase PostgreSQL
* **File storage:** Supabase Storage for clothing images
* **Hosting:** Vercel for the web app

### Core decisions

1. **Single web application, no separate backend service for v1.**

   * Next.js Route Handlers and Server Actions are enough for the current scope.
   * This keeps the app simpler, faster to ship, and easier to maintain.

2. **Server Components by default.**

   * Reduce client-side JavaScript.
   * Improve initial load performance.
   * Keep most data fetching on the server.

3. **Mutations through Server Actions or Route Handlers.**

   * Use Server Actions for form submits where it is clean and safe.
   * Use Route Handlers when an explicit HTTP endpoint is more appropriate.

4. **Supabase Row Level Security (RLS) on all user tables.**

   * Security is enforced at the database layer.
   * Each user can only access their own data.

5. **No TanStack Query in v1 by default.**

   * The app is mostly CRUD and server-rendered views.
   * Server Components + targeted revalidation are simpler and faster here.

6. **Paginate history and analytics inputs.**

   * Do not load entire records into the browser.
   * Fetch only what the current screen needs.

---

## 4. System Context

```text
User
  ↓
Next.js Web App (Vercel)
  ↓
Supabase Auth
Supabase PostgreSQL
Supabase Storage
```

The browser talks to the Next.js app. The Next.js app handles rendering, protected routes, input validation, and data access. Supabase manages identity, database storage, and image storage.

---

## 5. Application Modules

### 5.1 Authentication Module

Responsibilities:

* Signup with email and password
* Login with email and password
* Logout
* Password reset
* Session persistence
* Route protection

Behavior:

* Unauthenticated users are redirected to auth pages.
* Authenticated users can access wardrobe and outfit pages.
* Supabase maintains session state.

---

### 5.2 Wardrobe Module

Responsibilities:

* Add clothing items
* Edit clothing items
* Delete clothing items
* Upload optional item images
* Filter and search items

Item fields:

* name
* category
* color
* notes
* image URL
* created_at
* updated_at

---

### 5.3 Outfit Logging Module

Responsibilities:

* Record one daily entry per date
* Support day types (wardrobe context - not HR leave/holiday splits):

  * **Office** (`office`)
  * **Stay home** (`stay_home`) - at home: WFH, rest, sick, holiday at home, etc.
  * **Travel** (`travel`)
  * **Day out** (`day_out`) - outing, meetup, event, brunch, date
* For **office** days, require shirt and pants; shoes optional; store selected items and wear records
* For **stay home, travel, and day out**, day type (+ note) is always stored; outfit items are **optional**
* When optional outfit items are saved on any day type, store `outfit_items` and `wear_history` the same way as office (one wear row per selected item)

Rules:

* A user should not create multiple final outfit records for the same date unless editing the existing record.
* The current day entry should be easy to create or update.
* **Office** days require shirt and pants; shoes are optional.
* **Non-office** days do not require outfit items; the outfit picker is collapsed or secondary in the UI.
* If the user selects zero outfit items on a non-office day, only the `outfits` row is stored.

### Repetition detection (v1)

When the outfit item picker is open, the system checks recent usage from `wear_history` and shows informational warnings per item:

* **Worn yesterday** - `worn_date` equals yesterday
* **Worn 2 days ago** - `worn_date` equals two days before today
* **Worn 3 times this week** - three or more wear records in the current calendar week (Monday–Sunday, user-local date)

Warnings are informational only. The user can still select the item.

**Context by day type:** Office and **day out** use the strongest repetition signals. **Travel** uses trip-oriented copy. **Stay home** uses softer copy when optional outfit is logged.

The picker loads wear hints in a single batch query when opened. No extra round trip per item.

---

### 5.4 History Module

Responsibilities:

* Show past outfit records
* Show a monthly calendar view
* Open day details from the calendar or timeline
* Support pagination for long histories

Behavior:

* Recent records load first.
* Older history is fetched on demand.

---

### 5.5 Analytics Module

Responsibilities:

* Show most worn items
* Show least worn items
* Show monthly counts for office, stay home, travel, and day out
* Show item wear frequency
* Show last worn date

Analytics are computed from the recorded outfit history and wear records.

---

## 6. User Experience Structure

### Navigation

Mobile-first navigation should use:

* Top app bar for page title and actions
* Bottom navigation for primary pages on mobile
* Sidebar on desktop if needed

### Primary pages

* Dashboard
* Wardrobe
* Add Outfit
* History
* Analytics
* Settings

### Dashboard responsibilities

The dashboard should answer these quickly:

* What did I wear today?
* What did I wear recently?
* How many items are in my wardrobe?
* What is the quickest action right now?

The dashboard should avoid heavy visual density.

---

## 7. High Level Component Architecture

```text
App Shell
├── Auth Layer
├── Layout Layer
├── Feature Pages
│   ├── Dashboard
│   ├── Wardrobe
│   ├── Outfit Entry
│   ├── History
│   ├── Analytics
│   └── Settings
├── Shared UI Components
└── Data Access Layer
    ├── Supabase Auth Client
    ├── Supabase Server Client
    ├── Validation Schemas
    └── Query Helpers
```

### Important separation

* UI components should not contain direct database logic.
* Data access should be centralized in reusable functions.
* Validation should be shared between client and server.

---

## 8. Detailed Data Flow

### 8.1 Login flow

1. User enters email and password.
2. Next.js login form validates input.
3. Credentials are sent to Supabase Auth.
4. Supabase returns a session.
5. User is redirected to the dashboard.
6. Protected routes use the session to fetch only user data.

---

### 8.2 Add clothing item flow

1. User opens Add Clothing Item form.
2. Form validates client-side with Zod.
3. On submit, the request reaches a Server Action or Route Handler.
4. The server verifies the session.
5. The server writes the new item into PostgreSQL.
6. The page revalidates the wardrobe view.
7. The new item appears in the list.

If an image is attached:

1. The file is uploaded to Supabase Storage.
2. The stored image URL is saved in the clothing item record.

---

### 8.3 Log outfit flow (create)

1. User opens daily entry screen.
2. The system checks whether an entry exists for the selected date.
3. If an entry exists, the user is in edit mode (see §8.6).
4. User selects day type (+ optional note).
5. **Office:** user must select shirt and pants; shoes optional. Outfit picker shown by default. Repetition warnings load from `wear_history` (see §5.3).
6. **Stay home / Travel:** outfit picker collapsed by default; user may expand and optionally select items (no minimum).
7. **Day out:** outfit picker shown by default (optional items, no minimum) - social/event days often warrant logging what was worn.
8. The server validates selected items, ownership, and day-type rules (office requires shirt + pants).
9. **Single database transaction:**
   1. Insert or upsert `outfits` row.
   2. If any items selected: insert `outfit_items` rows for each role filled (`shirt`, `pants`, `shoes`).
   3. If any items selected: insert one `wear_history` row per selected item for the outfit date.
10. Commit transaction. On failure, roll back entirely - no partial outfit or wear records.
11. Revalidate dashboard, history, and analytics.

---

### 8.4 Edit outfit flow

1. User opens an existing entry for a date (from history, calendar, or dashboard).
2. The form loads the current `outfits` row and linked `outfit_items` (if any).
3. User changes day type, items, and/or notes.
4. The server validates ownership and day-type rules (office requires shirt + pants).
5. **Single database transaction:**
   1. Update the `outfits` row (`day_type`, `notes`, `updated_at`).
   2. Delete all `outfit_items` for this `outfit_id`.
   3. Delete all `wear_history` rows for this `outfit_id`.
   4. If any items selected for the new state: insert `outfit_items` and matching `wear_history` rows for the outfit date.
6. Commit transaction. On failure, roll back - the previous outfit state is preserved.
7. Revalidate dashboard, history, and analytics.

Changing day type may change outfit UX expectations (e.g. office → stay home). Clearing all items removes `outfit_items` and `wear_history` for that day while keeping the `outfits` row.

---

### 8.5 Delete outfit flow

1. User deletes an outfit from history or the outfit detail screen.
2. The server verifies session and ownership.
3. **Single database transaction:**
   1. Delete all `wear_history` rows for this `outfit_id`.
   2. Delete all `outfit_items` rows for this `outfit_id`.
   3. Delete the `outfits` row.
4. Commit transaction. On failure, roll back entirely.
5. Revalidate dashboard, history, and analytics.

---

### 8.6 Edit clothing item flow

1. User opens edit form for an existing item.
2. Form validates client-side with Zod.
3. On submit, the server verifies session and ownership.
4. If a new image is uploaded: upload to Supabase Storage first, then update `clothing_items.image_url` in a single update (image upload failure aborts before the DB write).
5. Update `clothing_items` fields (`name`, `category`, `color`, `notes`, `image_url`, `updated_at`).
6. Revalidate wardrobe and dashboard counts.

Editing an item does not change historical `wear_history` or past `outfit_items` - those keep the item reference by `clothing_item_id`.

---

### 8.7 Delete clothing item flow

1. User requests deletion from the wardrobe screen.
2. The server verifies session and ownership.
3. The server checks whether the item is referenced in `outfit_items` or `wear_history`.
4. If referenced: reject with a clear error - the item cannot be deleted because it appears in outfit history.
5. If not referenced: delete the `clothing_items` row. If an image exists, delete the storage object after the DB delete succeeds.
6. Revalidate wardrobe and dashboard.

---

### 8.8 View history flow

1. User opens the history page.
2. The server loads the first page of records.
3. The UI shows a timeline and/or calendar.
4. Additional pages load only when requested.

The history page must never load the full dataset by default.

---

### 8.9 Analytics flow

1. User opens analytics.
2. The server queries aggregated data from PostgreSQL.
3. The app shows top items, least used items, and day-type counts.
4. Results may be cached briefly if the same aggregates are requested often.

---

## 9. Data Model

### 9.1 profiles

Stores basic user profile data.

Fields:

* id (uuid, primary key, matches auth user id)
* email
* created_at
* updated_at

Purpose:

* Reference table for user-specific application data
* Keep a small profile record for app needs

---

### 9.2 clothing_items

Stores wardrobe items.

Fields:

* id (uuid, primary key)
* user_id (uuid, indexed)
* name
* category
* color
* notes
* image_url
* created_at
* updated_at

Indexes:

* (user_id)
* (user_id, category)
* (user_id, created_at)

---

### 9.3 outfits

Stores one daily outfit entry.

Fields:

* id (uuid, primary key)
* user_id (uuid, indexed)
* date (date, unique per user)
* day_type (text: `office` | `stay_home` | `travel` | `day_out`)
* notes
* created_at
* updated_at

Constraints:

* Unique(user_id, date)

Purpose:

* Represent the final daily entry for a specific date

**Enum (wardrobe context):** `office`, `stay_home`, `travel`, `day_out`. Do not use HR labels (leave, holiday, WFH as separate types). A future migration remaps legacy `wfh` / `leave` / `holiday` rows to `stay_home` when the schema is updated.

---

### 9.4 outfit_items

Maps an outfit to selected clothing items.

Fields:

* id (uuid, primary key)
* outfit_id (uuid, indexed, foreign key → outfits.id)
* clothing_item_id (uuid, indexed, foreign key → clothing_items.id)
* role (text: `shirt`, `pants`, `shoes` - present only when that role was selected)

Constraints:

* Unique(outfit_id, role) - at most one item per role per outfit

Purpose:

* Link outfits to selected clothing items with fixed roles
* Populated whenever the user saves outfit items, on **any** day type (not office-only)
* Office entries always include shirt and pants rows when valid; shoes row only if selected

---

### 9.5 wear_history

Stores one wear event per item per day usage.

Fields:

* id (uuid, primary key)
* user_id (uuid, indexed)
* clothing_item_id (uuid, indexed, foreign key → clothing_items.id)
* outfit_id (uuid, indexed, foreign key → outfits.id)
* worn_date (date, indexed)
* created_at

Indexes:

* (user_id, clothing_item_id, worn_date)
* (user_id, worn_date)
* (outfit_id)

Purpose:

* Fast analytics and last-worn lookup
* Wear counts without reprocessing outfits each time
* Repetition detection at outfit selection time (v1)

---

## 10. Why wear_history is necessary

Do not rely only on outfit records for usage analytics.

Reasons:

* Analytics queries become simpler.
* Last worn date becomes cheap to calculate.
* Counting total wears is straightforward.
* Repetition detection at selection time reads directly from this table in v1.

This table is justified even in v1 because it improves performance and avoids repeated expensive joins.

### Repetition detection queries

Batch-load wear hints when the outfit item picker opens (any day type where items can be selected):

```sql
-- Last worn date per item (for yesterday / 2-days-ago checks)
SELECT clothing_item_id, MAX(worn_date) AS last_worn
FROM wear_history
WHERE user_id = ?
GROUP BY clothing_item_id;

-- Wears in current calendar week (Monday–Sunday, user-local)
SELECT clothing_item_id, COUNT(*) AS week_wears
FROM wear_history
WHERE user_id = ?
  AND worn_date >= start_of_week
  AND worn_date <= end_of_week
GROUP BY clothing_item_id;
```

Derive warnings in application logic from these results. Adjust copy or filters by `day_type` (office, day_out, stay_home, travel).

## 11. Security Design

### 11.1 Authentication

* Supabase Auth handles identity and session management.
* The app never stores passwords directly.
* Sessions should be handled securely using the Supabase client model.

### 11.2 Authorization

* Every user-owned table must have Row Level Security.
* Users may only read and mutate rows where `user_id = auth.uid()`.

### 11.3 RLS policies

Required policies for each user table:

* SELECT own rows only
* INSERT with matching `user_id`
* UPDATE own rows only
* DELETE own rows only

### 11.4 Server-side validation

Even with RLS, the server must still validate:

* Input shape
* Day type rules
* Item ownership
* Required fields
* Office role rules (shirt and pants required; shoes optional when day type is office)
* Optional outfit rules for non-office day types (no minimum items)

Security should not rely on UI checks.

---

## 12. Performance Design

Performance is a primary requirement.

### 12.1 Rendering strategy

* Use Server Components wherever possible.
* Keep client components small and focused.
* Avoid global client-side state unless necessary.

### 12.2 Data fetching strategy

* Fetch data only for the current screen.
* Use pagination for history.
* Use selective queries with proper filters.
* Avoid loading all wardrobe and history records on first render.

### 12.3 Query optimization

* Index `user_id` on all major tables.
* Index `(user_id, date)` for outfits.
* Index `(user_id, category)` for wardrobe filtering.
* Keep analytics queries scoped and aggregated in the database.

### 12.4 Revalidation strategy

After mutations:

* Revalidate affected pages only.
* Do not invalidate the entire application.

Example:

* Adding a clothing item should revalidate the wardrobe page and dashboard counts.
* Logging an outfit should revalidate dashboard, history, and analytics views.

### 12.5 Images

* Compress images before upload where possible.
* Serve optimized image sizes.
* Do not load large images unnecessarily.

---

## 13. Caching Strategy

Caching should be conservative because user data changes frequently.

### Cacheable data

* Analytics summaries can use short-lived caching.
* Static UI fragments can be cached.

### Non-cacheable or short-lived data

* Today’s outfit
* Current wardrobe state
* Recently edited records

### Recommendation

Use:

* Server rendering for current state
* Short cache windows for expensive read-only aggregates
* Revalidation after writes

This gives good speed without stale data problems.

---

## 14. API and Mutation Design

### Preferred mutation patterns

Use Server Actions for:

* Create clothing item
* Update clothing item
* Delete clothing item
* Create daily outfit
* Update daily outfit
* Delete daily outfit

Use Route Handlers only when:

* A standard HTTP endpoint is cleaner
* External integration is needed
* A distinct API contract is beneficial

### Transaction requirements

These mutations must run inside a single PostgreSQL transaction. Roll back on any failure.

| Mutation | Tables affected (order) |
|----------|-------------------------|
| Create outfit (day type only) | `outfits` |
| Create outfit (with items) | `outfits` → `outfit_items` → `wear_history` |
| Edit outfit | `outfits` (update) → delete `outfit_items` + `wear_history` → re-insert items + wear rows if any selected |
| Delete outfit | `wear_history` → `outfit_items` → `outfits` |
| Delete clothing item | `clothing_items` only (blocked if referenced) |

Create/update outfit operations use upsert on `(user_id, date)` for the `outfits` row when saving an existing date.

Clothing item create/update are single-table writes and do not require multi-table transactions unless image upload is involved (upload first, then DB write; abort DB write if upload fails).

### Validation

All input must be validated with shared Zod schemas.

### Error handling

Return clear, user-friendly errors for:

* Missing required fields
* Invalid item selection
* Unauthorized access
* Duplicate date entry (redirect to edit instead)
* Invalid file upload
* Cannot delete item used in outfit history

---

## 15. Route Structure

### Public routes

* `/login`
* `/signup`
* `/forgot-password`

### Protected routes

* `/dashboard`
* `/wardrobe`
* `/wardrobe/new`
* `/wardrobe/[id]/edit`
* `/outfits/new`
* `/outfits/[date]`
* `/history`
* `/analytics`
* `/settings`

### API or action routes

* Mutations through Server Actions or `/api/*` endpoints as needed

---

## 16. Component Strategy

### Shared UI components

* Button
* Input
* Select
* Dialog
* Sheet
* Badge
* Card
* Calendar
* Empty state
* Skeleton loader

### Feature components

#### Wardrobe

* ClothingGrid
* ClothingItemCard
* ClothingFilterBar
* ClothingForm

#### Outfit

* DailyEntryForm
* OfficeItemPicker
* RepetitionWarning
* DayTypeSelector
* OutfitSummaryCard

#### History

* HistoryTimeline
* CalendarMonthView
* DayDetailDrawer

#### Analytics

* TopItemsChart
* UsageSummaryCards
* DayTypeBreakdown

---

## 17. Error and Empty State Design

The product should be helpful when data is missing.

### Empty states

* No clothing items yet
* No outfit logged for today
* No history records yet
* No analytics data yet

### Error states

* Session expired
* Upload failed
* Validation failed
* Record already exists for the selected date

Each error should include a simple next step.

---

## 18. Deployment Architecture

### Production

* Web app deployed on Vercel
* Database and auth managed by Supabase
* Storage managed by Supabase Storage

### Environment variables

* Supabase project URL
* Supabase anon key
* Supabase service role key only if server-side privileged access is required
* App base URL

### Deployment rule

Never expose service-role credentials to the browser.

---

## 19. Observability

Even for a small app, basic observability matters.

Track:

* Authentication failures
* Validation failures
* Upload failures
* Slow queries
* Mutation errors
* Unexpected empty states

Recommended tools:

* Vercel logs
* Supabase logs
* Lightweight app error tracking later if needed

---

## 20. Scalability Considerations

This is a personal product first, but the design should still scale.

### Why this architecture scales reasonably

* User-scoped queries keep data small.
* RLS protects data without custom per-user branching.
* Pagination prevents large page payloads.
* Aggregations stay in the database.
* Server Components keep client bundles lighter.

### Expected growth path

If the product grows later:

* Add background jobs for heavier analytics
* Add a dedicated caching layer if required
* Add more granular activity tracking
* Introduce AI or suggestions as a separate feature set

None of that is required for v1.

---

## 21. Risks and Mitigations

### Risk 1: Slow dashboard due to too much data

Mitigation:

* Fetch only summary data
* Use selective queries
* Revalidate only relevant sections

### Risk 2: Complex outfit structure causing rigid schema

Mitigation:

* Keep outfit-items mapping flexible
* Use a generic data model instead of hardcoding too many assumptions

### Risk 3: Duplicate daily entries

Mitigation:

* Unique constraint on `(user_id, date)`
* Upsert or edit existing entry flow

### Risk 4: Unauthorized access

Mitigation:

* RLS on every user table
* Server-side session checks
* Validation of ownership before mutation

### Risk 5: Image upload slowing the app

Mitigation:

* Optional image support
* Compressed uploads
* Lazy loading

---

## 22. Final HLD Summary

WardrobeFlow v1 should be implemented as a single fast Next.js application with Supabase Auth, Supabase PostgreSQL, and Supabase Storage.

The design should prioritize:

* Server rendering by default
* Minimal client-side complexity
* Strong row-level security
* Paginated data access
* Efficient analytics through normalized records
* Mobile-first UI
* Low latency user interactions

The correct design choice for v1 is simplicity with disciplined structure, not overengineering.

This HLD is intentionally optimized for speed, maintainability, and clean growth into future versions.
