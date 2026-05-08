## Goal

Make the client portal use the same hamburger-menu + slide-out drawer navigation on **all** screen sizes, instead of switching to a horizontal nav bar at desktop widths (≥1024px).

## Why

Currently `ClientPortalLayout.tsx` shows two different navs based on viewport:
- `< 1024px` → hamburger button + `Sheet` drawer (the look the user prefers)
- `≥ 1024px` → horizontal nav bar across the header

On the live domain in a wide browser window, users see the horizontal bar, which feels inconsistent with the preview.

## Change

In `src/components/layout/ClientPortalLayout.tsx`:

1. **Remove the desktop horizontal nav** (the `<nav className="hidden lg:flex …">` block with the inline mapped links).
2. **Always show the hamburger trigger** by removing the `lg:hidden` class on the `SheetTrigger`, so the menu button appears on every screen size.
3. **Keep everything else as-is**: logo, user avatar dropdown, sign-out, the `Sheet`/drawer contents, and `NavLinks` styling.

No changes to routing, auth, data, or any other layout (the contractor `DashboardLayout` is untouched).

## Result

At every viewport — mobile, tablet, and desktop — the client portal shows:
- Header with hamburger ☰ on the left, logo, and avatar on the right
- Tapping ☰ slides the navigation drawer in from the left with all portal links
