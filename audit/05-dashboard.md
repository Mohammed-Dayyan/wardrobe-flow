# Dashboard Audit

## Scope

- **Route:** `/dashboard` (`revalidate = 60`)
- **Feature paths:** `src/features/dashboard/**`
- **Dependencies:** outfit queries, wardrobe summary, analytics snapshot (limit 3)

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Today’s outfit(s) | OK | `DashboardHero` multi-outfit carousel |
| Quick log CTA | OK | Links to outfit routes |
| Week overview | OK | `WeekStrip` |
| Stats / streak | OK | `DashboardStats`, `compute-streak` |
| Recent activity | OK | `RecentActivitySection` |
| Analytics teaser | OK | `InsightsTeaser` with wear hints |

## Happy paths verified

- [x] New user (`wardrobeCount === 0`) sees welcome; hides week strip + stats
- [x] Returning user sees hero, week strip, stats, recent activity
- [x] Multi-outfit carousel with prev/next when >1 outfit today
- [x] `InsightsTeaser` when `hasOutfitLogs`
- [x] Parallel `Promise.all` for 7 queries

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Analytics RPC missing (migration 015) | Degraded dashboard | Whole page throws | P0 |
| Multiple outfits, different day types same day | Represent all types | Week strip uses first by `created_at` | P3 |
| Logs without clothing this month | Explain gap | `wearHint` in teaser | OK |
| Long history streak | Correct count | Loads all outfit dates unbounded | P3 |
| New user | Minimal fetches | Still calls `getAnalyticsSnapshot` | P3 |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| DASH-001 | P0 | `dashboard/page.tsx` | `Promise.all` includes analytics RPC; missing migration 015 crashes entire dashboard | Ops: apply migrations; code: optional try/catch fallback widget |
| DASH-002 | P3 | `get-week-outfits.ts` | Single `day_type` per date when multiple outfits | Show dominant type or multi-dot |
| DASH-003 | P3 | `get-dashboard-stats.ts` | Streak query fetches all historical dates | Add reasonable window or materialized streak |
| DASH-004 | P3 | `dashboard/page.tsx` | Analytics snapshot fetched for new users with empty wardrobe | Skip analytics query when `wardrobeCount === 0` |
| DASH-005 | P3 | `RecentActivitySection` | Uses `formatDisplayDate` (numeric) vs friendly dates elsewhere | Align with `formatFriendlyDateWithYear` for consistency |

## Recommended changes (prioritized)

1. Ensure migration 015 applied in production (DASH-001 ops)
2. Optional resilient analytics teaser if RPC fails (DASH-001 code)
3. Week strip multi-outfit day types (DASH-002)

## Out of scope / deferred

- Outfit recommendations on dashboard
- Weather widgets

---

## Fixed (2026-06-24)

- **DASH-001**: Migrations 015/016 verified applied; `getDashboardAnalytics` catches RPC failures and returns null so dashboard still renders.
- **DASH-002**: `get-week-outfits` returns `dayTypes[]`; `WeekStrip` renders up to 3 dots per day.
- **DASH-003**: Streak query bounded to last 400 days.
- **DASH-004**: Analytics snapshot skipped when `wardrobeCount === 0`.
- **DASH-005**: `RecentActivitySection` uses `formatFriendlyDateWithYear`.
