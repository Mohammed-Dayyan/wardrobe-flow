# Wardrobe Audit

## Scope

- **Routes:** `/wardrobe`, `/wardrobe/new`, `/wardrobe/[id]/edit`
- **Feature paths:** `src/features/wardrobe/**`
- **Actions:** `create-clothing-item`, `update-clothing-item`, `delete-clothing-item`

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| CRUD clothing items | OK | Forms + server actions |
| Categories top/pants/jacket/shoes | OK | `categories.ts` + RPC validation |
| Delete guard when referenced | OK | `is-item-referenced` + FK RESTRICT |
| Wardrobe grid | OK | Search + category filters |
| Images (V1 removed) | N/A | No storage usage in app code |

## Happy paths verified

- [x] Create item with name, category, color, notes
- [x] Edit item with ownership check + `notFound()`
- [x] Delete from grid and edit page via shared `ClothingDeleteDialog`
- [x] Filter by category and search (client-side)
- [x] Empty state when no items / no filter matches
- [x] Referenced item delete returns `WARDROBE_ERRORS.REFERENCED` toast

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Delete item in outfit history | Blocked | App + DB RESTRICT | OK |
| Delete unreferenced item | Success + refresh | `router.refresh()` on grid | OK |
| Change category on referenced item | Safe or blocked | Allowed; breaks future outfit edit RPC | P2 |
| `isItemReferenced` DB error | Graceful error | Throws uncaught | P2 |
| Referenced item shows delete | Disable or warn | Delete always visible; fails on submit | P3 |
| Rename item | Updates everywhere | Wardrobe update missing `/history` revalidate | P2 |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| WARD-001 | P2 | `update-clothing-item.ts` | Category change allowed on items in `outfit_items`; `update_outfit` RPC then rejects slot | Block category change when referenced, or migrate outfit_items roles |
| WARD-002 | P2 | `is-item-referenced.ts` | Throws on Supabase error | Return safe `{ referenced: true }` or action error |
| WARD-003 | P2 | `update-clothing-item.ts` | Missing `revalidatePath` for `/history`, `/analytics`, outfit routes | Extend revalidation after name/color updates |
| WARD-004 | P3 | `ClothingItemCard.tsx` | Delete icon always shown | Optional: query reference state or show toast-only (current) |
| WARD-005 | P3 | `filter-clothing-items.ts` | Search is case-sensitive substring | Consider case-insensitive match |

## Recommended changes (prioritized)

1. Guard category changes on referenced items (WARD-001)
2. Harden `isItemReferenced` error handling (WARD-002)
3. Broaden revalidation on wardrobe update (WARD-003)

## Out of scope / deferred

- Wardrobe images / storage bucket (migration 004 exists but unused in UI)
- Bulk import/export

---

## Fixed (2026-06-24)

- **WARD-001**: Category change blocked in `update-clothing-item` when item is referenced in outfits.
- **WARD-002**: `isItemReferenced` returns safe result on DB errors instead of throwing.
- **WARD-003**: `revalidateWardrobePaths` revalidates wardrobe, dashboard, history, analytics, and edit route after updates/deletes.
- **WARD-004**: Edit form disables category select and shows helper text when item is referenced.
- **WARD-005**: Verified - search is already case-insensitive in `filter-clothing-items.ts` (no code change needed).
