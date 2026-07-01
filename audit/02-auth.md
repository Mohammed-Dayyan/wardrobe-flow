# Auth Audit

## Scope

- **Routes:** `/login`, `/signup`, `/forgot-password`, `/auth/callback`, `/auth/reset-password`
- **Feature paths:** `src/features/auth/**`
- **Actions:** `login`, `signup`, `logout`, `forgot-password`, `update-password`

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Email + password signup/login | OK | Supabase Auth |
| Password reset | OK | Email → callback → reset page |
| Logout | OK | `logoutAction` + `SignOutDialog` |
| Protected routes | OK | Middleware + app layout |
| Session persistence | OK | Cookie refresh in middleware |
| User data isolation | OK | RLS + `auth.uid()` |

## Happy paths verified

- [x] Login form + server action with Zod (`auth.ts` schema)
- [x] Signup creates user; optional `display_name` metadata
- [x] Forgot password uses `redirectTo` with site URL + callback
- [x] Callback exchanges PKCE code for session
- [x] Reset password uses client `updateUser` when recovery session exists
- [x] Logged-in user on login/signup sees `AuthSessionPanel` (no forced redirect)
- [x] Login `?code=` forwards to callback with `next=/auth/reset-password`

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Callback `?error=auth` | User-friendly message | `login` ignores `error` param | P2 |
| Credential login from deep link | Return to intended URL | Always `/dashboard` | P2 |
| Callback `next=//evil.com` | Block open redirect | Only checks `startsWith("/")` | P3 |
| Email confirmation required | “Check email” state | Signup always redirects dashboard | P1 |
| Expired recovery link | Clear error + forgot link | Reset page has fallback link | OK |
| Sign out while pending | Disabled buttons | `SignOutDialog` disables during transition | OK |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| AUTH-001 | P1 | `signup.ts` | If Supabase email confirmation is enabled, user may have no session but still hit `redirect("/dashboard")` then login | Check session after signup; show “confirm email” state when no session |
| AUTH-002 | P2 | `login/page.tsx` | `searchParams.error` typed but never displayed | Show banner for `?error=auth` after failed callback |
| AUTH-003 | P2 | `login.ts`, `signup.ts` | No `next` / return URL after credential auth | Accept optional `next` search param; validate same-origin path |
| AUTH-004 | P3 | `auth/callback/route.ts` | `safeNext` allows `//` paths in theory | Reject `next` starting with `//` or containing `:` |
| AUTH-005 | P3 | `ResetPasswordButton.tsx` | Unused component (settings uses in-app change + forgot link) | Remove or wire for email-only users |

## Recommended changes (prioritized)

1. Handle email-confirmation signup flow (AUTH-001)
2. Surface callback errors on login (AUTH-002)
3. Optional post-login redirect (AUTH-003)

## Out of scope / deferred

- OAuth providers beyond email/password
- MFA

---

## Fixed (2026-06-24)

- **AUTH-001**: Signup returns confirm-email success state when no session after `signUp`; no redirect without session.
- **AUTH-002**: Login page shows banner for `?error=auth` after failed OAuth/callback.
- **AUTH-003**: Login and signup accept optional `next` param; post-auth redirect uses [`sanitizeRedirectPath`](../src/lib/navigation/safe-redirect.ts).
- **AUTH-004**: Auth callback uses `sanitizeRedirectPath` to reject `//` and `:` in `next`.
- **AUTH-005**: Removed unused [`ResetPasswordButton.tsx`](../src/features/settings/components/ResetPasswordButton.tsx).
