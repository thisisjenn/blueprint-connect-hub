# Blueprint Hub — Gap Analysis & Build Plan

Below is what your current site has vs. the spec, then a proposed phased plan to close the gaps. I won't change anything until you pick what to tackle.

## What you already have

**Marketing**
- Landing page (single file)
- Waitlist/contact form, pricing, anchor links

**Auth**
- Email/password login, signup, forgot/reset
- Role at signup (client / contractor)
- Role-based redirect after login

**Contractor dashboard** (`/dashboard`)
- Overview (Home), Jobs, Clients, Documents, Messages, Schedule, Contracts, Settings
- Data isolation via RLS by `contractor_id`
- Notifications bell, realtime messaging

**Client portal** (`/portal`)
- Overview, Documents, Checklist, Messages, Invoices, Photos, Project Detail
- Collapsible drawer at all sizes

**Backend**
- Supabase (Lovable Cloud), storage buckets, RLS hardened
- Tables: projects, clients, project_tasks/files/messages, invoices, checklist, photos, profiles, notifications, user_roles

## What's missing vs. spec

### Brand & design
- Fonts: spec wants **DM Serif Display + Plus Jakarta Sans** — current theme uses different typography
- Color palette doesn't match exactly (warm off-white #F7F5F0, deep navy #1C2B3A, **brass gold #C49A3C**)
- No blueprint grid texture / architectural line accents on hero & CTA sections
- No Framer Motion scroll-reveal animations

### Landing page content gaps
- Hero copy/CTAs don't match ("From Inspiration to Move-In Day…")
- Missing **Problem Statement** 3-column section
- Features section needs the **6 specific AI features** (Design-to-Scope, Budget/Schedule Engine, Visual Dashboard, Permit Checker, Change Order Simulator, Digital Home Manual)
- Missing **How It Works** 3-step section
- Missing **Who It's For** 3 cards (Homeowners / Contractors / Architects)
- Missing **Additional Features grid** (9 smaller cards)
- Missing testimonials section
- Floating dashboard mockup card in hero

### Auth gaps
- No **Architect/Designer** role (only client + contractor)
- No **Google OAuth** button
- No blueprint grid background on auth pages

### Homeowner portal gaps (spec lists 10 sections — you have 6)
- ❌ **Schedule** (calendar + Gantt)
- ❌ **Contracts** (list, e-sign placeholder, change orders)
- ❌ **Budget & Payments** (milestones, affordability planner) — partly covered by Invoices
- ❌ **Approvals & Selections** + **Change Order Simulator**
- ❌ **Daily Updates** feed
- ❌ **Home Manual** (paint, appliances, warranties, contractors)
- Overview missing: clickable floor plan, milestone list, 4-stat summary cards in spec format
- Photos: missing **before/after slider**
- Messages: missing channel grouping (General/Design/Contractor/Permits)

### Contractor dashboard gaps
- ❌ **AI Tools page** (the centerpiece) — Design-to-Scope, Permit Checker, Conflict Detector, Meeting Summarizer
- ❌ **Change Orders** page (workflow + simulator)
- ❌ **Financials** page (separate from Contracts)
- ❌ **Alerts & Conflicts** page (emotional risk dashboard, backorders, dependency warnings)
- Overview missing: alerts panel, projects table format per spec

### Tech stack gaps
- No **Framer Motion**
- No **Recharts** for budget/schedule viz
- No **React Hook Form + Zod** (likely using plain forms)
- No **AI integration** — spec calls for Claude; recommend **Lovable AI Gateway** instead (Gemini/GPT-5, no key needed)
- No seed data for "Johnson Kitchen & Bath Remodel"

## Proposed phased plan

Each phase is a separate scope you can approve one at a time. I'd suggest this order:

**Phase 1 — Brand & landing page polish**
- Swap fonts to DM Serif Display + Plus Jakarta Sans
- Tune color tokens to exact spec hex values
- Add blueprint grid texture, architectural line accents
- Rewrite landing sections to match spec (Hero, Problem, 6 Features, How It Works, Who It's For, Additional Features grid, Testimonials)
- Add Framer Motion scroll reveals

**Phase 2 — Auth additions**
- Add "Architect/Designer" role to enum + signup
- Add Google OAuth button (requires you to enable Google provider in Lovable Cloud auth settings)
- Blueprint grid auth background

**Phase 3 — Client portal completion**
Add 4 new pages: Schedule, Contracts, Budget & Payments, Approvals & Selections, Daily Updates, Home Manual. Adds DB tables: `project_milestones`, `payment_milestones`, `change_orders`, `selections`, `daily_updates`, `home_manual_entries`. Photos before/after slider. Messages channel grouping.

**Phase 4 — Contractor dashboard expansion**
Add: Change Orders, Financials, Alerts & Conflicts pages. Enhance Overview with alerts panel.

**Phase 5 — AI Tools (largest)**
Add `/dashboard/ai-tools` with 4 tools backed by Lovable AI Gateway edge functions:
1. Design-to-Scope Translator (text + image → scope table JSON)
2. Permit Readiness Checker (PDF upload → checklist)
3. Conflict Detector (multi-file → conflict list)
4. Meeting Summarizer (text/audio → structured output)

**Phase 6 — Polish & seed**
- Recharts for budget/schedule visualizations
- React Hook Form + Zod on all forms
- Seed "Johnson Kitchen & Bath Remodel" demo project

## Questions before I start

1. **Which phase(s)** do you want first? (I'd recommend Phase 1 alone — it's visible immediately and low-risk.)
2. **Switch AI provider** from Claude (spec) to **Lovable AI Gateway** (no API key, included)? Strongly recommended.
3. **Google OAuth** — do you want it, and have you set up a Google OAuth client to paste into Cloud auth?
4. **Replace existing landing page** wholesale to match spec, or layer the missing sections on top of what's there?