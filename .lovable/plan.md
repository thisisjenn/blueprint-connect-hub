
# Complete Authentication Flow — What Exists vs. What Needs Building

## What Already Works Well

The core authentication infrastructure is already solid:

- Users sign up via `/signup`, choosing a role (Homeowner or Contractor)
- The role and full name are passed as metadata to the auth system
- A database trigger (`handle_new_user`) fires on signup and automatically:
  - Creates a row in `public.profiles` (stores email, full_name, user_id)
  - Creates a row in `public.user_roles` (stores the chosen role)
- On login, the app reads the role from `user_roles` and redirects the user to either `/dashboard` (contractor) or `/portal` (client)
- All tables have Row-Level Security (RLS) enabled, using security-definer functions to prevent privilege escalation

## What Is Missing or Broken

### 1. Forgot Password Flow (does not exist)
There is no way for users to reset their password if they forget it. The login page has no "Forgot password?" link, and there is no `/reset-password` page.

### 2. Password Update in Settings Is Not Wired Up
The Security tab in Settings (`SettingsPage.tsx`) has a "Change Password" form with three inputs, but clicking "Update Password" does nothing — there is no actual logic connected to it.

### 3. Email Update in Settings Only Updates the Profile Table
The Profile tab saves email changes only to the `profiles` table (display data), but does NOT update the user's actual login email in the auth system. This means if a user changes their email in settings, they still log in with the old email.

### 4. No "Forgot Password?" Link on Login Page
The login form has no link to trigger a password reset.

---

## Implementation Plan

### Step 1 — Add "Forgot Password" link to the Login page
Add a "Forgot password?" link below the password field on `LoginPage.tsx` that navigates to a new `/forgot-password` route.

### Step 2 — Create `ForgotPasswordPage.tsx`
A simple page at `/forgot-password` with one email input field. On submit, it calls:
```
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: window.location.origin + '/reset-password'
})
```
This sends a password reset email to the user with a secure link.

### Step 3 — Create `ResetPasswordPage.tsx`
A page at `/reset-password` that:
- Detects the `type=recovery` token in the URL hash when the user arrives from the email link
- Shows a form with "New Password" and "Confirm Password" fields
- Calls `supabase.auth.updateUser({ password: newPassword })` on submit
- Redirects to `/login` after a successful reset

### Step 4 — Wire up "Change Password" in Settings
Update the Security tab in `SettingsPage.tsx` to actually call `supabase.auth.updateUser({ password: newPassword })` when the user clicks "Update Password". Add proper validation to confirm both passwords match before submitting.

### Step 5 — Wire up Email Change in Settings
Update the Profile tab save logic in `SettingsPage.tsx` to also call `supabase.auth.updateUser({ email: newEmail })` whenever the email field has changed. This keeps the login email in sync with the profile display email. The user will receive a confirmation email to their new address before the change takes effect.

### Step 6 — Register the new public routes in `App.tsx`
Add `/forgot-password` and `/reset-password` as public routes (no login required — the user needs these to recover access).

---

## How the Full Flow Works After This Plan

```text
SIGN UP
  User fills name / email / password / role → auth system creates account
  → trigger fires → profile row created → role row created
  → user receives verification email → clicks link → can now log in

LOGIN
  User enters email + password → auth system validates
  → app reads role from user_roles → redirects to /dashboard or /portal

FORGOT PASSWORD
  User clicks "Forgot password?" on login page → /forgot-password
  → enters email → reset email sent → user clicks link in email
  → lands on /reset-password → enters new password → saved → redirect to login

CHANGE PASSWORD (while logged in)
  User goes to Settings → Security → enters new password → saved to auth system

CHANGE EMAIL (while logged in)
  User goes to Settings → Profile → changes email → saved to both profile table
  AND auth system → confirmation email sent to new address
```

## Files to Create
- `src/pages/auth/ForgotPasswordPage.tsx`
- `src/pages/auth/ResetPasswordPage.tsx`

## Files to Modify
- `src/pages/auth/LoginPage.tsx` — add "Forgot password?" link
- `src/pages/dashboard/SettingsPage.tsx` — wire up password change + email sync
- `src/App.tsx` — register `/forgot-password` and `/reset-password` routes
