

## Plan: Make Jobs and Clients Pages Dynamic with Real Data

### Overview
Replace all hardcoded/mock data in the Jobs and Clients pages with live data from the database. Add working "Add Job" and "Add Client" forms, plus functional task management, status updates, and delete actions.

### What Changes

**1. New `clients` database table**

Currently there's no dedicated table for contractor-managed clients. The existing `projects.client_id` references auth users, but contractors need to track clients who may not have app accounts. A new `clients` table will store client contact info managed by the contractor.

Columns: `id`, `name`, `email`, `phone`, `address`, `type` (homeowner/contractor/business), `user_id` (the contractor who owns the record), `created_at`, `updated_at`

RLS policies will restrict access so only the contractor who created a client can view/manage them.

The `projects.client_id` column type will remain UUID but will now optionally reference the new `clients` table via a foreign key.

**2. Database migration**
- Create `clients` table with RLS policies (contractors can CRUD their own clients)
- Add a foreign key from `projects.client_id` to `clients.id`
- Add a `description` column to `project_tasks` if missing (it already exists)

**3. Clients Page (`ClientsPage.tsx`) - Dynamic**
- Remove all hardcoded client data
- Fetch clients from `clients` table using React Query
- Add a dialog/modal for "Add Client" with form fields: name, email, phone, address, type
- Wire up "Edit Client" and "Archive" actions in the dropdown menu
- Compute active/total jobs counts by joining with `projects` table
- Show loading skeletons while data loads
- Show empty state when no clients exist

**4. Jobs Page (`JobsPage.tsx`) - Dynamic**
- Remove all hardcoded job and task data
- Fetch projects from `projects` table (joined with `clients` for client name)
- Fetch tasks from `project_tasks` for the selected project
- Add a dialog/modal for "New Job" with fields: name, client (dropdown from clients table), address, status, start date, end date, description
- Wire up "Add Task" button to create tasks in `project_tasks`
- Make task checkboxes functional (toggle task status/completed_at)
- Wire up "Delete" action to delete a project
- Compute progress from completed vs total tasks
- Show loading states and empty states

**5. New shared components**
- `AddClientDialog.tsx` - Form dialog for creating/editing clients
- `AddJobDialog.tsx` - Form dialog for creating/editing jobs (with client dropdown)
- `AddTaskDialog.tsx` - Simple dialog for adding a task to a project

### Technical Details

**Database Migration SQL:**
```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT NOT NULL DEFAULT 'homeowner',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Contractors can manage their own clients
CREATE POLICY "Contractors can manage own clients"
  ON public.clients FOR ALL USING (auth.uid() = user_id);

-- Add FK from projects to clients
ALTER TABLE public.projects
  ADD CONSTRAINT projects_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id)
  ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Data fetching pattern** (using React Query + Supabase client):
- `useQuery` for fetching lists with proper loading/error states
- `useMutation` with `queryClient.invalidateQueries` for create/update/delete
- All mutations will use `toast` for success/error feedback

**Files to create:**
- `src/components/jobs/AddJobDialog.tsx`
- `src/components/jobs/AddTaskDialog.tsx`
- `src/components/clients/AddClientDialog.tsx`

**Files to modify:**
- `src/pages/dashboard/JobsPage.tsx` - Complete rewrite to use dynamic data
- `src/pages/dashboard/ClientsPage.tsx` - Complete rewrite to use dynamic data

