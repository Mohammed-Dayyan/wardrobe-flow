# History Audit

## Scope

- **Route:** `/history` with query params `view`, `page`, `month`, `date`
- **Feature paths:** `src/features/history/**`
- **Queries:** timeline, month calendar, outfit detail

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Timeline view | OK | Paginated, friendly dates |
| Calendar view | OK | Month nav, day-type borders |
| Day detail | OK | `DayDetailSheet` with multi-outfit |
| Future days not loggable | Partial | Calendar blocks; history `?date=` does not |
| Shareable URL state | OK | Query params preserved on tab switch |

## Happy paths verified

- [x] Timeline lists outfits newest first with `HistoryTimelineCard`
- [x] Calendar month navigation via `shiftMonth`
- [x] Logged days open sheet; empty past days link to entry
- [x] Future in-month days disabled in calendar
- [x] `HistoryContentShell` shared max-width
- [x] Day sheet uses `formatFriendlyDateWithYear`

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| `?date=` future day | No add outfit / no sheet | Sheet opens; add links 404 on entry | P2 |
| `?month=invalid` | Graceful fallback | `getMonthBounds` may produce bad SQL | P2 |
| Calendar navigate far future | Stop at current month | No upper bound (unlike analytics) | P3 |
| Timeline load more | Keep `date` if open | Drops `date` param | P3 |
| `?date=` invalid format | notFound or ignore | Queries may error | P3 |
| Multi-outfit day in sheet | List all | `DayDetailSheet` shows all | OK |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| HIST-001 | P2 | `history/page.tsx`, `DayDetailSheet.tsx` | Future `?date=` shows “Add outfit” but entry route `notFound()` | Reject future dates in page; hide add CTA in sheet |
| HIST-002 | P2 | `history/page.tsx` | `month` param not validated/clamped like analytics | Use `clampMonthParam` + validate `YYYY-MM` format |
| HIST-003 | P3 | `CalendarMonthView.tsx` | Can browse empty future months indefinitely | Disable next month past current (match analytics) |
| HIST-004 | P3 | `HistoryTimeline.tsx` | Load more link omits `date` query param | Preserve `date` when paginating |
| HIST-005 | P3 | `history/page.tsx` | `date` param not validated with `isDateISO` | Validate before queries |
| HIST-006 | P3 | `CalendarMonthView.tsx` | Uses `router.push` for month/date | Consider `replace` for `date` to avoid history stack noise |

## Recommended changes (prioritized)

1. Guard future/invalid `date` on history page (HIST-001, HIST-005)
2. Validate `month` param (HIST-002)
3. Align calendar future-month nav with analytics (HIST-003)

## Out of scope / deferred

- Export history as CSV
- `router.replace` for all history navigation (optional polish)

---

## Fixed (2026-06-24)

- **HIST-001**: `parseHistoryParams` rejects future/invalid `?date=`; `DayDetailSheet` hides add CTA for future dates.
- **HIST-002**: `month` param validated via `parseMonthParam`.
- **HIST-003**: Calendar next-month button disabled past current month (`canGoToNextMonth`).
- **HIST-004**: Timeline load-more preserves `date` via `buildHistoryHref`.
- **HIST-005**: `detailDate` validated with `isDateISO` + `clampDateToToday` in `parseHistoryParams`.
- **HIST-006**: Day sheet close and calendar day open use `router.replace`.
