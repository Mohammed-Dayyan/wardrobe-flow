# WardrobeFlow - System Design & Architecture (V1)

# 1. Architecture Goals

The architecture is designed around the following priorities:

1. Fast user experience
2. Mobile-first design
3. Minimal infrastructure complexity
4. Scalability for future growth
5. Maintainability
6. Low operational cost

The application should feel instant even on average mobile devices.

---

# 2. Technology Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod

---

## Backend

No separate backend service.

Next.js Route Handlers will act as the backend layer.

Benefits:

* Simpler architecture
* Fewer deployments
* Lower latency
* Easier maintenance

---

## Authentication

Supabase Auth

Authentication Methods:

* Email + Password Signup
* Email + Password Login
* Password Reset

Supabase manages:

* User accounts
* Sessions
* JWTs
* Authentication state

---

## Database

Supabase PostgreSQL

Benefits:

* Managed database
* Automatic backups
* Row Level Security
* Realtime support (future)
* Good integration with Next.js

---

## Storage

Supabase Storage

Used for:

* Clothing item images

Optional for V1 but architecture supports it.

---

# 3. High Level Architecture

```text
┌───────────────────────┐
│       Browser         │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│      Next.js App      │
│                       │
│ Server Components     │
│ Client Components     │
│ Route Handlers        │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│      Supabase         │
│                       │
│ Auth                  │
│ PostgreSQL            │
│ Storage               │
└───────────────────────┘
```

---

# 4. Architectural Philosophy

## Server First

Default approach:

* Server Components
* Server Data Fetching
* Minimal Client Components

Reason:

Less JavaScript sent to browser.

Better performance.

Better SEO.

Faster initial load.

---

## Client Components Only When Necessary

Examples:

* Forms
* Dialogs
* Calendar interactions
* Filters
* Dropdowns

Everything else remains server-rendered.

---

# 5. Authentication Flow

```text
User Login
      │
      ▼
Supabase Auth
      │
      ▼
Session Cookie
      │
      ▼
Protected Routes
```

All authenticated routes verify session before rendering.

Unauthenticated users are redirected to login.

---

# 6. Data Access Strategy

## Preferred Pattern

Server Components fetch directly from Supabase.

Example:

```text
Page
 └── Server Component
       └── Supabase Query
```

Benefits:

* No client-side loading states
* Smaller bundles
* Better performance

---

## When To Use Client Fetching

Only for:

* Form submissions
* Interactive filtering
* Optimistic updates

Avoid unnecessary client fetching.

---

# 7. Caching Strategy

One of the most important performance decisions.

---

## Dashboard

Can use short-lived cache.

Example:

30-60 seconds.

Dashboard data does not require millisecond accuracy.

---

## Clothing Inventory

User expects latest data.

Use:

```text
dynamic rendering
```

No long cache.

---

## Outfit History

Paginated.

Fetch only required pages.

Never load entire history.

---

## Analytics

Calculated on demand.

Can use cache for expensive aggregations.

---

# 8. Why Not Fetch Everything?

Bad:

```text
Load all outfits
Load all wear history
Load all analytics
```

This becomes slow quickly.

---

Good:

```text
Dashboard → Dashboard Data

History → Paginated History

Analytics → Analytics Data
```

Each page fetches only what it needs.

---

# 9. Database Design Principles

## User Ownership

Every record belongs to a user.

```text
user_id
```

exists on all major tables.

This enables:

* Security
* Fast filtering
* RLS

---

## Query Patterns

Most common queries:

### Get Today's Outfit

```sql
WHERE user_id = ?
AND date = today
```

---

### Recent Outfits

```sql
WHERE user_id = ?
ORDER BY date DESC
LIMIT 20
```

---

### Last Worn

```sql
WHERE clothing_item_id = ?
ORDER BY worn_date DESC
LIMIT 1
```

---

# 10. Row Level Security (Critical)

Every table uses RLS.

Example:

```sql
auth.uid() = user_id
```

Result:

Users can only access their own data.

No custom authorization layer needed.

Security remains at database level.

---

# 11. Database Tables

Canonical schema for v1. Matches `hld.md` §9.

## profiles

Stores user profile data.

```text
id          uuid PK (matches auth.users.id)
email       text
created_at  timestamptz
updated_at  timestamptz
```

---

## clothing_items

```text
id          uuid PK
user_id     uuid FK → profiles.id, indexed
name        text
category    text
color       text
notes       text (nullable)
image_url   text (nullable)
created_at  timestamptz
updated_at  timestamptz
```

Indexes: `(user_id)`, `(user_id, category)`, `(user_id, created_at)`

---

## outfits

One daily entry per user per date.

```text
id          uuid PK
user_id     uuid FK → profiles.id, indexed
date        date
day_type    text
notes       text (nullable)
created_at  timestamptz
updated_at  timestamptz
```

Constraints: `UNIQUE(user_id, date)`

Indexes: `(user_id, date)`

---

## outfit_items

Links outfits to clothing items with fixed roles (`shirt`, `pants`, `shoes`).

```text
id                uuid PK
outfit_id         uuid FK → outfits.id, indexed
clothing_item_id  uuid FK → clothing_items.id, indexed
role              text (shirt | pants | shoes)
```

Constraints: `UNIQUE(outfit_id, role)`

Populated whenever the user saves outfit items on **any** day type. Office entries always include shirt and pants when valid; shoes only if selected. Non-office entries include only the roles the user chose (zero to three).

---

## wear_history

One wear event per clothing item included in a saved outfit (any day type).

```text
id                uuid PK
user_id           uuid FK → profiles.id, indexed
clothing_item_id  uuid FK → clothing_items.id, indexed
outfit_id         uuid FK → outfits.id, indexed
worn_date         date, indexed
created_at        timestamptz
```

Indexes: `(user_id, clothing_item_id, worn_date)`, `(user_id, worn_date)`, `(outfit_id)`

---

# 12. Why Separate wear_history?

Without it:

Calculating usage becomes expensive.

With it:

Easy queries.

Example:

```sql
COUNT(*)
```

for total wears.

Much faster analytics.

Repetition detection at outfit selection time also reads from this table in v1.

---

# 13. Mutation Flows and Transactions

All multi-table writes run in a single PostgreSQL transaction. Roll back on any failure.

## Create outfit (day type only)

```text
BEGIN
  INSERT outfits (day_type, notes; no outfit_items)
COMMIT
```

## Create outfit (with items)

Office (shirt + pants required, shoes optional) or optional outfit on stay home / travel / day out.

```text
BEGIN
  INSERT outfits
  INSERT outfit_items (one row per selected role: shirt, pants, shoes)
  INSERT wear_history (one row per selected item, worn_date = outfit.date)
COMMIT
```

## Edit outfit

```text
BEGIN
  UPDATE outfits
  DELETE wear_history WHERE outfit_id = ?
  DELETE outfit_items WHERE outfit_id = ?
  IF any items selected: INSERT outfit_items + wear_history for those roles
COMMIT
```

Changing day type may change required items (office needs shirt + pants). Clearing all items keeps the `outfits` row and removes linked item/wear rows.

## Delete outfit

```text
BEGIN
  DELETE wear_history WHERE outfit_id = ?
  DELETE outfit_items WHERE outfit_id = ?
  DELETE outfits WHERE id = ?
COMMIT
```

## Delete clothing item

Blocked if the item exists in `outfit_items` or `wear_history`. Otherwise:

```text
DELETE clothing_items WHERE id = ?
```

(then delete storage image if present)

## Clothing item create/update

Single-table write. Image upload happens before the DB insert/update; abort if upload fails.

---

# 14. Repetition Detection

When the outfit item picker opens (office or optional outfit on other day types), batch-load wear hints from `wear_history`:

* **Worn yesterday** - last `worn_date` equals yesterday
* **Worn 2 days ago** - last `worn_date` equals two days before today
* **Worn 3 times this week** - three or more rows in the current calendar week (Monday–Sunday)

```sql
SELECT clothing_item_id, MAX(worn_date) AS last_worn
FROM wear_history
WHERE user_id = ?
GROUP BY clothing_item_id;

SELECT clothing_item_id, COUNT(*) AS week_wears
FROM wear_history
WHERE user_id = ?
  AND worn_date >= start_of_week
  AND worn_date <= end_of_week
GROUP BY clothing_item_id;
```

Warnings are informational only. Users can still select any item.

**By day type:** Office and **day out** use the strongest warnings. **Travel** uses trip-oriented copy. **Stay home** uses softer copy when optional outfit is logged.

---

# 15. API Architecture

Route Handlers.

Example:

```text
/api/clothing

/api/outfits

/api/analytics
```

Responsibilities:

* Validation
* Authentication
* Database operations (inside transactions where required)

Nothing else.

Business logic should remain reusable.

Server Actions handle create/update/delete for clothing and outfits. Route Handlers remain available for explicit HTTP endpoints.

---

# 16. Folder Structure

```text
src/

app/
├── (auth)
├── dashboard
├── wardrobe
├── outfits
├── analytics
├── api

components/
├── ui
├── wardrobe
├── outfits
├── analytics

features/
├── wardrobe
├── outfits
├── analytics
├── auth

lib/
├── supabase
├── validations
├── utils

types/

hooks/
```

---

# 17. Feature Module Structure

Example:

```text
features/wardrobe

components/
actions/
queries/
types/
schemas/
```

Everything related to wardrobe stays together.

Improves maintainability.

---

# 18. Forms Strategy

React Hook Form

Zod Validation

Benefits:

* Fast
* Lightweight
* Type-safe

Validation occurs:

* Client side
* Server side

---

# 19. Image Handling

Images are optional.

When enabled:

```text
Supabase Storage
```

Store:

* Compressed images
* WebP format

Avoid large uploads.

Mobile performance remains good.

---

# 20. Analytics Strategy

Avoid storing unnecessary aggregates.

Compute from:

```text
wear_history
outfits
```

Examples:

* Most worn (all contexts); optional filters by day type (office, stay home, travel, day out)
* Least worn
* Monthly counts: office, stay home, travel, day out

Database performs aggregation.

Not the browser.

---

# 21. Mobile First Architecture

Design target:

375px width first.

Then:

* Tablet
* Desktop

Not the opposite.

Benefits:

* Faster UI decisions
* Better usability
* Less layout complexity

---

# 22. Deployment Architecture

Frontend:

Vercel

Database:

Supabase

Storage:

Supabase Storage

Architecture:

```text
User
 │
 ▼
Vercel
 │
 ▼
Supabase
```

Very low operational overhead.

---

# 23. Scalability Considerations

Even though V1 is a personal product, architecture should scale.

Design supports:

* Thousands of users
* Millions of wear records

Through:

* Indexed queries
* Pagination
* RLS
* Server Components
* Selective fetching

No redesign required.

---

# 24. Performance Decisions Summary

The following decisions are intentionally made to keep the application fast:

✓ Next.js App Router

✓ Server Components by default

✓ Minimal client-side state

✓ Direct Supabase queries

✓ Paginated history

✓ Indexed database queries

✓ Row Level Security

✓ Mobile-first UI

✓ Lazy-loaded images

✓ Small JavaScript bundles

✓ Feature-based architecture

✓ No unnecessary global state

✓ No separate backend service

✓ Transaction-safe outfit mutations

✓ Repetition detection from wear_history

The architecture prioritizes simplicity, maintainability, and performance over unnecessary complexity.
