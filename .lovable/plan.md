## Problem

Currently every contractor sees every other contractor's data. Root cause: the `projects` table has no contractor owner column. All RLS policies on projects, tasks, files, invoices, messages, checklists, and photos use `is_contractor()`, which is true for ANY contractor. Only `clients` is correctly scoped (by `user_id`).

Clients are mostly OK because their RLS uses `client_id = auth.uid()` on projects, but they can be cross-contaminated wherever the UI fetches without filtering.

## Fix

### 1. Database migration (root fix)

Add contractor ownership to `projects` and cascade scoping through it.

- Add `projects.contractor_id uuid` (nullable initially for backfill, then enforce via app logic).
- Backfill: `UPDATE projects SET contractor_id = clients.user_id FROM clients WHERE projects.client_record_id = clients.id`. For any remaining NULL projects, leave NULL (orphan; only the creator-less rows).
- Add helper: `public.owns_project(_project_id uuid)` → `SELECT EXISTS(SELECT 1 FROM projects WHERE id=_project_id AND contractor_id=auth.uid())`. SECURITY DEFINER, stable.
- Replace `is_contractor()` RLS on the following tables with `owns_project(project_id)` (keeping client policies intact):
  - `projects` SELECT/UPDATE/DELETE → `contractor_id = auth.uid()`. INSERT WITH CHECK → `is_contractor() AND contractor_id = auth.uid()`.
  - `project_tasks`, `project_files`, `project_messages`, `client_checklist_items`, `client_photo_uploads`, `invoices` → contractor policies use `owns_project(project_id)`.
- Update `is_project_member` to use `owns_project` instead of `is_contractor`.
- Update `set_client_record_id` trigger to also set `contractor_id` from the inserting user (`auth.uid()`) when missing.
- Update notification triggers (`notify_new_project`, `notify_new_task`, `notify_new_document`, `notify_new_message`) to notify only the project's `contractor_id` instead of all contractors.
- Tighten `profiles` SELECT: replace "Contractors can view all profiles" with a policy allowing a contractor to view profiles only of clients on their projects (via `EXISTS` over projects.contractor_id = auth.uid() AND projects.client_id = profiles.user_id).

### 2. Frontend changes (defense in depth + correct UI)

For every contractor page that queries Supabase, RLS will now naturally scope. But several pages currently filter by `is_contractor` only or fetch globally — verify and add explicit `.eq('contractor_id', user.id)` on `projects` queries, and rely on RLS for child tables. Touch:

- `src/pages/dashboard/DashboardHome.tsx` — counts and recent lists scoped via projects join.
- `src/pages/dashboard/JobsPage.tsx`, `ClientsPage.tsx` (already filters by user_id), `DocumentsPage.tsx`, `MessagesPage.tsx`, `SchedulePage.tsx`, `ContractsPage.tsx`.
- `AddJobDialog.tsx` — set `contractor_id: user.id` on insert.
- Any project detail / task / file pages — no change needed (RLS handles it) but verify queries don't rely on cross-contractor data.

Client portal pages already scope via `client_id = auth.uid()` through RLS; verify each portal page filters projects by `client_id` explicitly too.

### 3. UI / design

No visual changes. Layouts, colors, and components stay identical.

## Technical notes

- New column `projects.contractor_id` references the auth user id (no FK to auth.users per project guidelines).
- Existing `client_record_id` and `client_id` keep current behavior.
- New `owns_project` SECURITY DEFINER prevents recursive RLS on projects.
- All policies remain `TO authenticated`.
- After migration, the Supabase types file regenerates automatically; frontend insert calls must include `contractor_id`.

## Out of scope

- No schema change to clients (already scoped).
- No UI redesign.
- Historical orphan projects (no contractor_id) will become invisible to contractors — acceptable per the isolation requirement; user can reassign manually if needed.
