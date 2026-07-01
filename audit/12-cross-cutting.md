# Cross-Cutting Audit

## Scope

- **Dates:** `src/lib/utils/date.ts`
- **Navigation:** `src/lib/navigation/client-navigate.ts`
- **Validation:** `src/lib/validations/**`
- **Types:** `src/types/database.ts`
- **Testing:** none
- **A11y / perf:** patterns across features

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| ISO date handling | Partial | `isDateISO` exists; not used on all routes |
| DRY day types / categories | OK | Central config maps |
| No client data fetching for lists | OK | RSC + searchParams |
| Fast mobile experience | OK | Server-first architecture |
| Automated quality gates | Gap | No tests |

## Happy paths verified

- [x] `getTodayISO()` uses local timezone via `Date`
- [x] `clampMonthParam` / `canGoToNextMonth` for analytics
- [x] `DAY_TYPE_CONFIG` shared across dashboard, history, analytics
- [x] `navigateAfterMutation` for post-save navigation
- [x] `notifyActionResult` standardizes mutation feedback

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| User in UTC+14 logs “today” | Local calendar day | Local `Date` - OK for V1 | OK |
| Invalid calendar date in URL | notFound | Regex-only on some routes | P3 |
| Timezone change mid-session | Consistent today | Uses client/server local at request time | P3 |
| No automated regression | CI catches breaks | Build only | P1 |
| Screen reader on icon buttons | aria-label | Wardrobe delete/edit labeled | OK |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| X-001 | P1 | `package.json` | Zero unit/e2e tests | Add minimal Playwright smoke or Vitest for schemas/helpers |
| X-002 | P3 | `date.ts` | `parseDateISO` uses local midnight; edge cases near DST rare | Document V1 assumes local calendar dates |
| X-003 | P3 | Outfit/history routes | Inconsistent use of `isDateISO` vs regex | Standardize on `isDateISO` + `notFound()` |
| X-004 | P3 | `formatDisplayDate` vs friendly formatters | Mixed date display styles across app | Unify history/dashboard copy (see DASH-005) |
| X-005 | P2 | Server actions | Some return raw Postgres/Supabase messages | Central error mapping layer |
| X-006 | P3 | `types/database.ts` | Hand-maintained; may drift from DB | Regenerate from Supabase CLI when schema changes |

## Recommended minimal test plan (follow-up)

| Priority | Test | Covers |
|----------|------|--------|
| 1 | `isDateISO`, `clampMonthParam`, outfit fingerprint unit tests | X-003 |
| 2 | `wear-insights-context` / `wear-list-context` message resolver tests | AN-* |
| 3 | Playwright: login → log outfit → see dashboard | Smoke |
| 4 | RPC integration tests against local Supabase | DB-* |

## Out of scope / deferred

- Full E2E matrix for all routes
- i18n / timezone picker

---

## Fixed (2026-06-24)

- **X-001**: Deferred - no automated tests added in this batch (separate effort).
- **X-002**: Documented local calendar date assumption in [`date.ts`](../src/lib/utils/date.ts).
- **X-003**: Resolved in prior batches (`parseOutfitRouteDate`, `parseHistoryParams`, `parseMonthParam`).
- **X-004**: Outfit headers use `formatFriendlyDateWithYear`; dashboard/history aligned previously.
- **X-005**: `map-supabase-error` + wardrobe/profile mappers; outfits use `map-outfit-rpc-error`.
- **X-006**: Regeneration note added to [`database.ts`](../src/types/database.ts) header.
