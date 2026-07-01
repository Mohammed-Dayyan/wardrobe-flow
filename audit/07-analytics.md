# Analytics Audit

## Scope

- **Route:** `/analytics` (`?month=`, `revalidate = 60`)
- **Feature paths:** `src/features/analytics/**`
- **RPC:** `get_analytics_snapshot` (migrations 015, 016)

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Most worn items | OK | Month-scoped, filterable by day type |
| Least worn items | OK | Excludes most-worn IDs (016) |
| Day-type breakdown | OK | Counts outfit rows per month |
| Month navigation | OK | Clamped to current month |
| Empty wardrobe state | OK | `EmptyState` + CTA |

## Happy paths verified

- [x] Empty wardrobe shows add-clothing CTA
- [x] Day breakdown visible even when no wear in month
- [x] `WearInsightsEmpty` with distinct reasons (`wear-insights-context.ts`)
- [x] Most/least worn disjoint when migration 016 applied
- [x] Dev overlap warning in `map-wear-stat.ts` if 016 missing
- [x] `has_wear_in_month` assertion for migration 015

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Outfit logs, no clothing tracked | Explain mismatch | `logs_without_clothing` message | OK |
| Wear in other months only | Suggest other months | `no_wear_this_month_has_history` | OK |
| All items in most worn | Empty least worn + message | `resolveLeastWornEmptyMessage` | OK |
| Day-type filter, no wears | Filter-specific empty copy | OK | OK |
| Migration 015 not applied | Clear failure | Throws with migration hint | P0 (ops) |
| Migration 016 not applied | Overlapping lists | Dev console error | P2 (ops) |
| Invalid `month` URL | Fallback | Only future clamp, not format validation | P2 |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| AN-001 | P0 | `map-wear-stat.ts`, migration 015 | Missing `has_wear_in_month` crashes analytics + dashboard | Apply migration 015 in all environments |
| AN-002 | P2 | migration 016 | Without 016, same items appear in most and least worn | Apply migration 016; dev warning exists |
| AN-003 | P2 | `analytics/page.tsx` | Invalid `month` string not format-validated | Validate `YYYY-MM` before RPC |
| AN-004 | P3 | `AnalyticsView.tsx` | Day-type filter hidden when `!hasWearInMonth` | Acceptable; breakdown still visible |
| AN-005 | P3 | `DayTypeBreakdown` vs wear lists | Users may still confuse outfit logs with wear data | Copy is improved; monitor feedback |
| AN-006 | P3 | `get-analytics-snapshot.ts` | Default limit 10; dashboard uses 3 | Document intentional difference |

## Recommended changes (prioritized)

1. **Ops:** Run migrations 015 and 016 on production Supabase (AN-001, AN-002)
2. Validate month query param format (AN-003)
3. Optional: resilient dashboard/analytics if RPC fails (ties to DASH-001)

## Out of scope / deferred

- All-time analytics toggle
- Export reports

---

## Fixed (2026-06-24)

- **AN-001**: Migration 015 verified applied (`supabase db push` up to date).
- **AN-002**: Migration 016 verified applied.
- **AN-003**: `analytics/page.tsx` uses `parseMonthParam` for `YYYY-MM` validation before RPC.
- **AN-004**: No change - acceptable by design.
- **AN-005**: No change - copy improved previously; monitor feedback.
- **AN-006**: Documented default limit 10 vs dashboard limit 3 in `get-analytics-snapshot.ts`.
