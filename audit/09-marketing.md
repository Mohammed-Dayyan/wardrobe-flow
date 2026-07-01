# Marketing Audit

## Scope

- **Route:** `/` (public)
- **Components:** `src/components/marketing/**`, `src/app/page.tsx`

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Public landing | OK | Hero + features |
| CTA for signed-out users | OK | Sign up / log in |
| CTA for signed-in users | OK | Dashboard link |
| Mobile-first | OK | Responsive marketing layout |

## Happy paths verified

- [x] `getUser()` adapts header and hero CTAs
- [x] `MarketingHeader`, `Hero`, `FeatureGrid`, `MarketingFooter` compose page
- [x] Root metadata title/description in `layout.tsx`

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Logged-in user visits `/` | Dashboard CTA | `isAuthenticated` branch | OK |
| SEO / social share | og:image, description | Basic title/description only | P3 |
| `/` performance | Static where possible | Server component page | OK |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| MKT-001 | P3 | `src/app/layout.tsx` | No Open Graph / Twitter metadata | Add `openGraph` to metadata export |
| MKT-002 | P3 | `Hero.tsx` | No explicit skip link to main content | Optional a11y improvement on marketing page |

## Recommended changes (prioritized)

1. Enrich metadata for sharing (MKT-001)

## Out of scope / deferred

- Blog / SEO landing pages
- i18n

---

## Fixed (2026-06-24)

- **MKT-001**: Open Graph and Twitter metadata via [`getSiteMetadata`](../src/lib/metadata/site.ts) in root layout.
- **MKT-002**: Skip link to `#main-content` on marketing home page.
