# Settings & Profile Audit

## Scope

- **Route:** `/settings`
- **Feature paths:** `src/features/profile/**`, `src/features/settings/**`, `src/features/auth/components/SignOut*`

## PRD / HLD alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Profile management | OK | Display name editable |
| Password change | OK | `ChangePasswordForm` + `updatePasswordAction` |
| Password reset email | OK | Link to `/forgot-password` in form |
| Logout | OK | `SignOutDialog` matches delete dialog pattern |
| Email display | OK | Read-only in profile section |

## Happy paths verified

- [x] `ChangePasswordForm` exists and builds successfully
- [x] Current password verified via re-sign-in before update
- [x] Profile name modal edit (`ProfileNameSection`)
- [x] Sign out uses `SignOutDialog` (Cancel + destructive confirm)
- [x] Compact card layout for profile/session

## Edge cases matrix

| Scenario | Expected | Actual | Severity |
|----------|----------|--------|----------|
| Wrong current password | Error toast | “Current password is incorrect.” | OK |
| Password mismatch | Field error | Zod refine | OK |
| Sign out while pending | Disabled | Dialog buttons disabled | OK |
| OAuth-only user (no password) | Alternative flow | In-app change may fail at re-sign-in | P2 |

## Findings

| ID | Severity | Component / file | Issue | Required change |
|----|----------|------------------|-------|-----------------|
| SET-001 | - | `ChangePasswordForm.tsx` | **Refuted:** file exists; seed finding incorrect | None |
| SET-002 | P2 | `ChangePasswordForm.tsx` | OAuth/magic-link users cannot change password in-app | Detect provider; show message or hide form |
| SET-003 | P3 | `ResetPasswordButton.tsx` | Dead code - not imported on settings page | Remove file or use for OAuth users |
| SET-004 | P3 | `update-password.ts` | Duplicate Zod schema vs form schema | Share single schema module |

## Recommended changes (prioritized)

1. Handle non-password auth providers on settings (SET-002)
2. Remove or repurpose `ResetPasswordButton` (SET-003)

## Out of scope / deferred

- Account deletion
- Email change in-app

---

## Fixed (2026-06-24)

- **SET-001**: Refuted - `ChangePasswordForm` exists and works.
- **SET-002**: `PasswordSection` hides in-app change for OAuth/magic-link users; links to forgot-password to set email password.
- **SET-003**: Removed in AUTH-005 batch (prior).
- **SET-004**: Shared `change-password.ts` schema used by form and `update-password` action.
