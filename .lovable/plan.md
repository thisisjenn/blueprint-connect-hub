# Fix Login Button Issues

## Problems
1. **Button stays "Signing in…"** after a successful login because `setIsLoading(false)` is only called in the error branch.
2. **Post-login lands on landing page** instead of dashboard/portal: `navigate("/")` runs before `role` is fetched, and `RoleBasedRedirect` falls through to `<LandingPage />` when `role` is still `null`.
3. **`/login` is not guarded** for already-authenticated users.
4. Error messages from Supabase are passed through raw with no friendly handling for common cases (invalid credentials, unconfirmed email, rate limit).

## Changes

### `src/pages/auth/LoginPage.tsx`
- Wrap the success path in `try/finally` so `setIsLoading(false)` always runs.
- After successful `signIn`, do not navigate manually. Instead, rely on a redirect effect driven by the auth context (see below) — this avoids the race with role loading.
- Add a `useEffect` that watches `user` + `role` from `useAuth()` and redirects:
  - `role === "contractor"` → `/dashboard`
  - `role === "client"` → `/portal`
  - `user && !role` → wait (keep showing spinner on button or a small inline message)
- Map common Supabase error messages to friendlier text (invalid credentials, email not confirmed).

### `src/App.tsx` — `RoleBasedRedirect`
- When `user` exists but `role` is still `null` (and `isLoading` is false), show the spinner instead of falling back to `<LandingPage />`. This prevents the "bounce back to landing" flash after login.

### Optional guard
- In `LoginPage`, if `user` is already present on mount, redirect immediately based on role (or to `/`).

## Out of scope
- The unrelated "Function components cannot be given refs" console warning. Can be investigated separately if it persists after these fixes.
- Changes to `AuthContext` role-fetch timing (the deferred `setTimeout` is intentional to avoid Supabase deadlocks).

## Files touched
- `src/pages/auth/LoginPage.tsx`
- `src/App.tsx` (small change in `RoleBasedRedirect`)
