# Outfits Audit

## Scope

- **Routes:** `/outfits/new`, `/outfits/[date]`, `/outfits/[date]/entry`, `/outfits/[date]/entry/[outfitId]`
- **Feature paths:** `src/features/outfits/**`
- **RPCs:** `create_outfit`, `update_outfit`, `delete_outfit_by_id` (migration 013)

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Day types office/stay_home/travel/day_out | OK | `day-types.ts` + RPC |
| Office requires top + pants | OK | Zod + RPC |
| Optional items other day types | OK | No wear_history without selections |
| Multi-outfit per day (max 5) | OK | RPC count; TS constant |
| Duplicate prevention | Partial | App fingerprint only; no DB constraint |
| Repetition warnings | OK | Informational `RepetitionWarning` |
| Future dates blocked | Partial | App/pages only; not in RPC |

## Happy paths verified

- [x] Create outfit on day hub and entry form
- [x] Edit outfit updates wear_history atomically via RPC
- [x] Delete outfit removes wear rows
- [x] Office validation for top/pants
- [x] Duplicate outfit blocked on create/update (same fingerprint)
- [x] Entry page redirects when 5 outfits already logged
- [x] `navigateAfterMutation` avoids Performance.measure noise

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| 6th outfit same day | Rejected | RPC raises; page gate on entry | OK (race: P2) |
| Concurrent duplicate creates | One succeeds | Both can pass fingerprint check | P2 |
| Hidden `date` field tampered | Use route date | Action trusts form `date` | P2 |
| Direct RPC future date | Rejected | RPC accepts any date | P2 |
| Invalid date `2025-02-31` in URL | notFound | Regex only, not `isDateISO` | P3 |
| Delete with wrong client `date` | Revalidate correct day | `deleteOutfitByIdAction` uses client date for revalidate | P2 |
| Same item in top + pants slots | Unlikely | RPC allows | P3 |
| Notes differ, same items | Separate outfits | Fingerprint excludes notes (intentional) | OK |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| OUTFIT-001 | P2 | `create-outfit.ts`, RPC 013 | Duplicate outfits possible under concurrent requests | DB unique index on fingerprint or serializable transaction |
| OUTFIT-002 | P2 | `013_multi_outfit...sql` | Count-then-insert race can exceed 5/day | `SELECT FOR UPDATE` on outfits for date or advisory lock |
| OUTFIT-003 | P2 | `create_outfit` RPC | No future-date guard | Add `p_date <= current_date` check in RPC |
| OUTFIT-004 | P2 | `OutfitEntryForm.tsx`, `create-outfit.ts` | Posted `date` not verified against route | Pass route date from page; ignore or validate hidden field |
| OUTFIT-005 | P2 | `delete-outfit-by-id.ts` | Revalidation uses client-supplied `date` | Fetch outfit date from DB before revalidate |
| OUTFIT-006 | P3 | `outfits/[date]/page.tsx` | Date validated by regex not `isDateISO` | Use `isDateISO` + `notFound()` |
| OUTFIT-007 | P3 | `create-outfit.ts`, `update-outfit.ts` | Raw Postgres error strings returned | Map to `OUTFIT_ERRORS` constants |
| OUTFIT-008 | P3 | `013_multi_outfit...sql` | Hardcoded `5` vs `MAX_OUTFITS_PER_DAY` | Single source or comment sync requirement |
| OUTFIT-009 | P3 | `OutfitEntryForm.tsx` | ESLint warning on RHF `watch()` | Accept or refactor to `useWatch` |

## Recommended changes (prioritized)

1. Validate route date on create (OUTFIT-004)
2. Fix delete revalidation date (OUTFIT-005)
3. RPC future-date guard (OUTFIT-003)
4. Concurrency hardening for count/duplicate (OUTFIT-001, OUTFIT-002)

## Out of scope / deferred

- Outfit recommendations / AI
- Blocking save on repetition warnings (informational by design)

---

## Fixed (2026-06-24)

- **OUTFIT-001**: Migration 017 adds duplicate slot check inside advisory-locked `create_outfit`.
- **OUTFIT-002**: Migration 017 uses `pg_advisory_xact_lock` before count+insert.
- **OUTFIT-003**: Migration 017 rejects `p_date > current_date`.
- **OUTFIT-004**: `createOutfitAction` / `updateOutfitAction` validate `routeDate`; pages use `parseOutfitRouteDate`.
- **OUTFIT-005**: `deleteOutfitByIdAction` fetches outfit date from DB for revalidation; dropped client `date` param.
- **OUTFIT-006**: Outfit route pages use `isDateISO` via `parseOutfitRouteDate`.
- **OUTFIT-007**: `mapOutfitRpcError` maps RPC errors to `OUTFIT_ERRORS` constants.
- **OUTFIT-008**: SQL `max_outfits_per_day` constant + sync comment in `outfit-limits.ts`.
- **OUTFIT-009**: `OutfitEntryForm` uses `useWatch` instead of `watch()`.
