
-- Add contractor ownership to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS contractor_id uuid;

-- Backfill: link each project to the contractor who owns the client_record
UPDATE public.projects p
SET contractor_id = c.user_id
FROM public.clients c
WHERE p.client_record_id = c.id
  AND p.contractor_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_contractor_id ON public.projects(contractor_id);

-- Helper: does the current user own this project?
CREATE OR REPLACE FUNCTION public.owns_project(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND contractor_id = auth.uid()
  )
$$;

-- Update is_project_member to use contractor ownership instead of any-contractor
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.owns_project(_project_id) OR public.is_client_for_project(_project_id)
$$;

-- Update set_client_record_id trigger to also populate contractor_id from inserter
CREATE OR REPLACE FUNCTION public.set_client_record_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.contractor_id IS NULL THEN
    NEW.contractor_id := auth.uid();
  END IF;

  IF NEW.client_id IS NOT NULL THEN
    SELECT c.id INTO NEW.client_record_id
    FROM public.clients c
    JOIN public.profiles p ON p.email = c.email
    WHERE p.user_id = NEW.client_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger if missing
DROP TRIGGER IF EXISTS trg_set_client_record_id ON public.projects;
CREATE TRIGGER trg_set_client_record_id
BEFORE INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_client_record_id();

-- =========================
-- RLS: projects
-- =========================
DROP POLICY IF EXISTS "Contractors can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can create projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can update projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can delete projects" ON public.projects;

CREATE POLICY "Contractors view own projects" ON public.projects
  FOR SELECT TO authenticated USING (contractor_id = auth.uid());

CREATE POLICY "Contractors create own projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (public.is_contractor() AND (contractor_id = auth.uid() OR contractor_id IS NULL));

CREATE POLICY "Contractors update own projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors delete own projects" ON public.projects
  FOR DELETE TO authenticated USING (contractor_id = auth.uid());

-- =========================
-- RLS: project_tasks
-- =========================
DROP POLICY IF EXISTS "Contractors can manage tasks" ON public.project_tasks;
CREATE POLICY "Contractors manage own project tasks" ON public.project_tasks
  FOR ALL TO authenticated
  USING (public.owns_project(project_id))
  WITH CHECK (public.owns_project(project_id));

-- =========================
-- RLS: project_files
-- =========================
DROP POLICY IF EXISTS "Contractors can manage files" ON public.project_files;
DROP POLICY IF EXISTS "Contractors can view all files" ON public.project_files;
CREATE POLICY "Contractors manage own project files" ON public.project_files
  FOR ALL TO authenticated
  USING (public.owns_project(project_id))
  WITH CHECK (public.owns_project(project_id));

-- =========================
-- RLS: invoices
-- =========================
DROP POLICY IF EXISTS "Contractors can manage invoices" ON public.invoices;
CREATE POLICY "Contractors manage own project invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.owns_project(project_id))
  WITH CHECK (public.owns_project(project_id));

-- =========================
-- RLS: client_checklist_items
-- =========================
DROP POLICY IF EXISTS "Contractors can manage checklist" ON public.client_checklist_items;
CREATE POLICY "Contractors manage own project checklist" ON public.client_checklist_items
  FOR ALL TO authenticated
  USING (public.owns_project(project_id))
  WITH CHECK (public.owns_project(project_id));

-- =========================
-- RLS: client_photo_uploads
-- =========================
DROP POLICY IF EXISTS "Contractors can manage uploads" ON public.client_photo_uploads;
DROP POLICY IF EXISTS "Contractors can view all uploads" ON public.client_photo_uploads;
CREATE POLICY "Contractors manage own project uploads" ON public.client_photo_uploads
  FOR ALL TO authenticated
  USING (public.owns_project(project_id))
  WITH CHECK (public.owns_project(project_id));

-- =========================
-- RLS: profiles - tighten contractor visibility
-- =========================
DROP POLICY IF EXISTS "Contractors can view all profiles" ON public.profiles;
CREATE POLICY "Contractors view profiles of own clients" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects pr
      WHERE pr.contractor_id = auth.uid()
        AND pr.client_id = profiles.user_id
    )
  );

-- =========================
-- Notification triggers: notify only the project's contractor
-- =========================
CREATE OR REPLACE FUNCTION public.notify_new_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.contractor_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (NEW.contractor_id, 'job', 'New Job Created',
      'Project "' || NEW.name || '" has been created.',
      NEW.id);
  END IF;

  IF NEW.client_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (NEW.client_id, 'job', 'New Project Assigned',
      'You have been assigned to project "' || NEW.name || '".',
      NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proj RECORD;
BEGIN
  SELECT name, contractor_id INTO proj FROM public.projects WHERE id = NEW.project_id;
  IF proj.contractor_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.contractor_id, 'task', 'New Task Added',
      '"' || NEW.title || '" added to ' || COALESCE(proj.name, 'a project') || '.',
      NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_document()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proj RECORD;
BEGIN
  SELECT name, client_id, contractor_id INTO proj FROM public.projects WHERE id = NEW.project_id;

  IF proj.contractor_id IS NOT NULL AND proj.contractor_id != COALESCE(NEW.uploaded_by, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.contractor_id, 'document', 'New Document Uploaded',
      '"' || NEW.name || '" uploaded to ' || COALESCE(proj.name, 'a project') || '.',
      NEW.id);
  END IF;

  IF NEW.is_shared_with_client = true AND proj.client_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.client_id, 'document', 'New Document Available',
      '"' || NEW.name || '" has been shared with you.',
      NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proj RECORD;
  sender_name TEXT;
BEGIN
  SELECT name, client_id, contractor_id INTO proj FROM public.projects WHERE id = NEW.project_id;
  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id;

  IF proj.contractor_id IS NOT NULL AND proj.contractor_id != COALESCE(NEW.sender_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.contractor_id, 'message', 'New Message',
      COALESCE(sender_name, 'Someone') || ' sent a message in ' || COALESCE(proj.name, 'a project') || '.',
      NEW.project_id);
  END IF;

  IF proj.client_id IS NOT NULL AND proj.client_id != COALESCE(NEW.sender_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.client_id, 'message', 'New Message',
      COALESCE(sender_name, 'Someone') || ' sent a message in ' || COALESCE(proj.name, 'a project') || '.',
      NEW.project_id);
  END IF;

  RETURN NEW;
END;
$$;
