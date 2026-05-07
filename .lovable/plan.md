## Problem

On `/signup` the "I am a…" label shows but the **Contractor / Client** cards are missing.

The form populates the cards from `supabase.rpc("get_available_roles")`. Visitors on the signup page are not signed in, and the project's security hardening revokes `EXECUTE` on `SECURITY DEFINER` functions for the `anon` role. The RPC therefore returns no rows for unauthenticated users, `availableRoles` stays empty, and the radio cards never render.

## Fix

Stop depending on a database round-trip for a static, two-value choice.

1. In `src/pages/auth/SignUpPage.tsx`:
   - Remove the `useEffect` + `get_available_roles` RPC call and the `rolesLoading` / `availableRoles` state.
   - Hardcode the two options as a constant: `[{ value: "contractor", label: "Contractor", description: "Manage projects & clients", icon: HardHat }, { value: "client", label: "Client", description: "Track your project & files", icon: Home }]`.
   - Default `role` to empty string so the user must pick one; keep `required` behavior by validating before submit and disabling the submit button until a role is chosen.
   - Render the two cards in a 2-column grid using the existing RadioGroup styling (selected card gets `border-primary bg-primary/5`).
   - Make the "Contractor" card visually first/most prominent per the original requirement.

2. No DB or `AuthContext` change needed — `signUp()` already forwards the chosen role into `raw_user_meta_data.role`, and the `handle_new_user` trigger (already updated last turn) honors it.

3. Verification: reload `/signup` in the browser, confirm both cards render for an anonymous visitor, confirm submit is blocked until a card is selected, confirm a new contractor signup lands on `/dashboard` and a new client signup lands on `/portal`.

## Out of scope

- No migration. The `get_available_roles` RPC stays as-is for any authenticated callers; we just stop relying on it from the public signup page.