# Database & Security Audit

## Scope

- **Migrations:** `supabase/migrations/001`–`016`
- **Tables:** profiles, clothing_items, outfits, outfit_items, wear_history
- **RPCs:** outfit CRUD, analytics snapshot, day-type breakdown
- **RLS:** migration 002, storage 004

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| User-scoped data | OK | RLS on all tables |
| Transaction-safe outfit writes | OK | RPC in 013 |
| wear_history on item wear | OK | Per selected slot |
| wear_history cleanup on edit/delete | OK | DELETE then re-INSERT in update |
| API grants when auto-expose off | OK | Migration 005 |
| Delete clothing when referenced | OK | RESTRICT + app guard |

## Happy paths verified

- [x] RLS policies use `auth.uid() = user_id`
- [x] Outfit RPCs use `SECURITY INVOKER` + `auth.uid()`
- [x] Multi-outfit replaces legacy 1/day unique (013)
- [x] Categories: top, pants, jacket, shoes in RPC validation
- [x] Analytics month scope in 015; least-worn exclusion in 016
- [x] Profile trigger on signup (003)

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Direct client bypass RLS | Blocked | RLS enforced | OK |
| RPC without auth | Error | `Not authenticated` | OK |
| Concurrent outfit creates | Max 5 enforced | Count race possible | P2 |
| Future outfit via RPC | Rejected | Allowed | P2 |
| Storage bucket | Private per user | Migration 004; app doesn't upload | N/A |
| Stale migration on prod | App matches DB | Runtime throw on 015 | P0 |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| DB-001 | P0 | migrations 015, 016 | Production DB may lag repo; analytics/dashboard break without 015 | Document + run `supabase db push`; add deploy checklist |
| DB-002 | P2 | `013_multi_outfit...sql` | `create_outfit` count not concurrency-safe | Row lock or unique partial index per day count |
| DB-003 | P2 | `create_outfit` RPC | No `p_date <= CURRENT_DATE` | Add date check in RPC |
| DB-004 | P2 | `001_initial_schema.sql` | `ON DELETE RESTRICT` on outfit_items - good; category change not restricted | App-level guard (see WARD-001) |
| DB-005 | P3 | `004_storage_bucket.sql` | Storage bucket unused in V1 UI | Keep for future or document as dormant |
| DB-006 | P3 | `009`–`016` analytics RPCs | Multiple iterative migrations - fresh installs need full chain | README list is correct; verify order in CI |
| DB-007 | P3 | `create_outfit` | Hardcoded max 5 vs TS constant | Align or document |

## Recommended changes (prioritized)

1. **Ops:** Apply migrations 015–016 on all environments (DB-001)
2. Harden RPC date and concurrency (DB-002, DB-003)
3. Migration smoke test script in CI (DB-006)

## Deployment checklist

```bash
# Verify remote has latest functions
supabase db push

# Or apply manually in order through 016:
# 015_analytics_month_scope.sql
# 016_least_worn_exclude_most_worn.sql
```

## Out of scope / deferred

- Point-in-time backup policy
- Row-level audit log table

---

## Fixed (2026-06-24)

- **DB-001**: Migrations 015–016 verified applied (`supabase db push`).
- **DB-002**, **DB-003**, **DB-007**: Migration [`017_outfit_integrity.sql`](../supabase/migrations/017_outfit_integrity.sql) - advisory lock, future-date guard, duplicate slots, max constant.
- **DB-004**: WARD-001 app guard (prior batch).
- **DB-005**: Documented dormant `clothing-images` storage bucket in README.
- **DB-006**: README lists migration 017 and deploy checklist (`supabase db push`, lint, build).
