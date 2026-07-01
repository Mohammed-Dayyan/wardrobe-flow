# Platform Audit

## Scope

- **Routes:** All `src/app/**` layouts, error/loading boundaries, middleware
- **Files:** `middleware.ts`, `src/lib/supabase/middleware.ts`, `src/app/(app)/layout.tsx`, `src/app/layout.tsx`
- **Env:** `.env.example`, `NEXT_PUBLIC_SITE_URL`

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Protected routes | OK | Middleware + `(app)/layout.tsx` double guard |
| Session persistence | OK | Supabase SSR cookie refresh in middleware |
| Mobile-first shell | OK | `AppShell` with bottom nav |
| Fast page transitions | OK | RSC + targeted revalidation |
| Error recovery | Gap | Only `(app)/error.tsx`; no root/global error |

## Happy paths verified

- [x] Build compiles all 16 app routes
- [x] Middleware matcher excludes static assets
- [x] Protected prefixes redirect unauthenticated users to `/login`
- [x] Recovery routes (`/auth/callback`, `/auth/reset-password`) allowed without session
- [ ] Manual: cold start on slow 3G with loading skeletons (not runtime-tested)

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Unauthenticated `/dashboard` | Redirect login | Middleware redirect | - |
| Invalid URL `/foo` | Branded 404 | Default Next.js 404 | P2 |
| Root layout throws | Global error UI | No `global-error.tsx` | P2 |
| `(app)` segment throws | Error boundary + retry | `(app)/error.tsx` works | OK |
| `/settings` loading | Skeleton | Falls back to `(app)/loading.tsx` | P3 |
| `/outfits/.../entry` loading | Route skeleton | No dedicated `loading.tsx` | P3 |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| PLAT-001 | P2 | `src/app/not-found.tsx` (missing) | Generic 404 for unknown routes | Add branded `not-found.tsx` with link to dashboard/home |
| PLAT-002 | P2 | `src/app/global-error.tsx` (missing) | Root layout failures show generic Next error | Add `global-error.tsx` with retry |
| PLAT-003 | P3 | `outfits/[date]/entry/` | No route-level `loading.tsx` | Add skeleton matching `OutfitEntryForm` |
| PLAT-004 | P3 | `settings/page.tsx`, `wardrobe/[id]/edit` | No dedicated loading UI | Optional route `loading.tsx` or accept parent skeleton |
| PLAT-005 | P3 | `dashboard/page.tsx`, `analytics/page.tsx` | `revalidate = 60` may show stale data up to 1 min | Document or reduce if users expect instant post-mutation refresh (mutations already revalidate) |

## Recommended changes (prioritized)

1. Add `src/app/not-found.tsx` (P2, small)
2. Add `src/app/global-error.tsx` (P2, small)
3. Add `loading.tsx` for outfit entry routes (P3)

## Out of scope / deferred

- Edge middleware for geo/locale
- ISR beyond current `revalidate` on dashboard/analytics

---

## Fixed (2026-06-24)

- **PLAT-001**: Added branded [`src/app/not-found.tsx`](../src/app/not-found.tsx) with links to dashboard and home.
- **PLAT-002**: Added [`src/app/global-error.tsx`](../src/app/global-error.tsx) root error boundary with retry.
- **PLAT-003**: Added [`src/app/(app)/outfits/[date]/entry/loading.tsx`](../src/app/(app)/outfits/[date]/entry/loading.tsx) skeleton.
- **PLAT-004**: Added loading skeletons for [`settings`](../src/app/(app)/settings/loading.tsx) and [`wardrobe edit`](../src/app/(app)/wardrobe/[id]/edit/loading.tsx).
- **PLAT-005**: Documented intentional `revalidate = 60` on dashboard and analytics pages (mutations revalidate via server actions).
