
-- Fix profiles RLS: change RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Contractors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Contractors can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_contractor());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_roles RLS
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix all other tables too
DROP POLICY IF EXISTS "Contractors can manage tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Project members can view tasks" ON public.project_tasks;
CREATE POLICY "Contractors can manage tasks" ON public.project_tasks FOR ALL TO authenticated USING (is_contractor());
CREATE POLICY "Project members can view tasks" ON public.project_tasks FOR SELECT TO authenticated USING (is_project_member(project_id));

DROP POLICY IF EXISTS "Clients can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can create projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can update projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can delete projects" ON public.projects;
CREATE POLICY "Clients can view own projects" ON public.projects FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Contractors can view all projects" ON public.projects FOR SELECT TO authenticated USING (is_contractor());
CREATE POLICY "Contractors can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (is_contractor());
CREATE POLICY "Contractors can update projects" ON public.projects FOR UPDATE TO authenticated USING (is_contractor());
CREATE POLICY "Contractors can delete projects" ON public.projects FOR DELETE TO authenticated USING (is_contractor());

DROP POLICY IF EXISTS "Project members can send messages" ON public.project_messages;
DROP POLICY IF EXISTS "Project members can view messages" ON public.project_messages;
CREATE POLICY "Project members can send messages" ON public.project_messages FOR INSERT TO authenticated WITH CHECK (is_project_member(project_id) AND sender_id = auth.uid());
CREATE POLICY "Project members can view messages" ON public.project_messages FOR SELECT TO authenticated USING (is_project_member(project_id));

DROP POLICY IF EXISTS "Clients can view shared files" ON public.project_files;
DROP POLICY IF EXISTS "Contractors can manage files" ON public.project_files;
DROP POLICY IF EXISTS "Contractors can view all files" ON public.project_files;
DROP POLICY IF EXISTS "Clients can upload files to their projects" ON public.project_files;
CREATE POLICY "Clients can view shared files" ON public.project_files FOR SELECT TO authenticated USING (is_shared_with_client = true AND is_client_for_project(project_id));
CREATE POLICY "Contractors can manage files" ON public.project_files FOR ALL TO authenticated USING (is_contractor());
CREATE POLICY "Contractors can view all files" ON public.project_files FOR SELECT TO authenticated USING (is_contractor());
CREATE POLICY "Clients can upload files to their projects" ON public.project_files FOR INSERT TO authenticated WITH CHECK (is_client_for_project(project_id) AND uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Clients can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Contractors can manage invoices" ON public.invoices;
CREATE POLICY "Clients can view own invoices" ON public.invoices FOR SELECT TO authenticated USING (is_client_for_project(project_id));
CREATE POLICY "Contractors can manage invoices" ON public.invoices FOR ALL TO authenticated USING (is_contractor());

DROP POLICY IF EXISTS "Clients can update checklist completion" ON public.client_checklist_items;
DROP POLICY IF EXISTS "Contractors can manage checklist" ON public.client_checklist_items;
DROP POLICY IF EXISTS "Project members can view checklist" ON public.client_checklist_items;
CREATE POLICY "Clients can update checklist completion" ON public.client_checklist_items FOR UPDATE TO authenticated USING (is_client_for_project(project_id)) WITH CHECK (is_client_for_project(project_id));
CREATE POLICY "Contractors can manage checklist" ON public.client_checklist_items FOR ALL TO authenticated USING (is_contractor());
CREATE POLICY "Project members can view checklist" ON public.client_checklist_items FOR SELECT TO authenticated USING (is_project_member(project_id));

DROP POLICY IF EXISTS "Clients can delete own uploads" ON public.client_photo_uploads;
DROP POLICY IF EXISTS "Clients can upload photos" ON public.client_photo_uploads;
DROP POLICY IF EXISTS "Clients can view own uploads" ON public.client_photo_uploads;
DROP POLICY IF EXISTS "Contractors can manage uploads" ON public.client_photo_uploads;
DROP POLICY IF EXISTS "Contractors can view all uploads" ON public.client_photo_uploads;
CREATE POLICY "Clients can delete own uploads" ON public.client_photo_uploads FOR DELETE TO authenticated USING (uploaded_by = auth.uid());
CREATE POLICY "Clients can upload photos" ON public.client_photo_uploads FOR INSERT TO authenticated WITH CHECK (is_client_for_project(project_id) AND uploaded_by = auth.uid());
CREATE POLICY "Clients can view own uploads" ON public.client_photo_uploads FOR SELECT TO authenticated USING (is_client_for_project(project_id));
CREATE POLICY "Contractors can manage uploads" ON public.client_photo_uploads FOR ALL TO authenticated USING (is_contractor());
CREATE POLICY "Contractors can view all uploads" ON public.client_photo_uploads FOR SELECT TO authenticated USING (is_contractor());
