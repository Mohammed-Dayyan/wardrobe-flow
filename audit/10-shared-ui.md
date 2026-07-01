# Shared UI Audit

## Scope

- **Layout:** `src/components/layout/**`
- **UI primitives:** `src/components/ui/**`
- **Feedback:** `src/lib/feedback/toast.ts`

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Responsive layouts | OK | Sidebar desktop, bottom nav mobile |
| Thumb-friendly nav | OK | Bottom nav + `h-11` CTAs |
| Large touch targets | Partial | Icon buttons on wardrobe cards are small-sm |
| Consistent destructive flows | OK | Outfit/clothing/sign-out dialogs aligned |
| Toast feedback | OK | `notifyActionResult` on mutations |

## Happy paths verified

- [x] `AppShell` wraps authenticated pages
- [x] Sticky sidebar with account pinned (`SidebarAccount`)
- [x] `TopBar` titles from `nav-config.ts`
- [x] `Button` has `cursor-pointer` globally
- [x] `FormPanel` / `FormSection` on forms
- [x] `EmptyState` on analytics and wardrobe grid

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Delete confirmations | Consistent dialog | Outfit, clothing, sign-out match | OK |
| Mobile dialog footer | Side-by-side on sm+ | `DialogFooter` col-reverse on mobile | OK |
| Unused `ConfirmDialog` | Removed or used | Orphaned in `confirm-dialog.tsx` | P3 |
| Sonner toasts | Success/error | `richColors` top-center | OK |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| UI-001 | P3 | `confirm-dialog.tsx` | No longer used after `SignOutDialog` | Delete or keep for future confirmations |
| UI-002 | P3 | `ClothingItemCard.tsx` | `icon-sm` edit/delete may be tight on mobile | Verify 44px touch target or add padding |
| UI-003 | P3 | `DialogFooter` | Mobile stacks cancel below confirm (col-reverse) | Acceptable; matches outfit delete |
| UI-004 | P2 | Various forms | Some actions return raw DB errors in toasts | Map to user-friendly messages (see OUTFIT-007) |

## Recommended changes (prioritized)

1. Remove dead `ConfirmDialog` if unused (UI-001)
2. Audit touch targets on wardrobe card icons (UI-002)

## Out of scope / deferred

- Dark mode toggle
- Theme customization

---

## Fixed (2026-06-24)

- **UI-001**: Deleted unused [`confirm-dialog.tsx`](../src/components/ui/confirm-dialog.tsx).
- **UI-002**: Wardrobe card edit/delete buttons use `size="icon"` with `min-h-11 min-w-11` touch targets.
- **UI-003**: No change - acceptable by design.
- **UI-004**: Wardrobe/profile actions use `map-wardrobe-db-error` / `map-supabase-error`; outfits already mapped.
