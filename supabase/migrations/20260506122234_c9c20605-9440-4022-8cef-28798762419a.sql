
-- 1. Fix handle_new_user: never trust role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Always default new users to 'client' role.
  -- Contractor role must be granted manually via the database (admin action).
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 2. Lock down user_roles: no self-modification by users
-- (Only SECURITY DEFINER functions and dashboard admins can change roles)
CREATE POLICY "No direct inserts to user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct updates to user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No direct deletes from user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);

-- 3. Restrict notifications policies to authenticated role
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Restrict clients policy to authenticated
DROP POLICY IF EXISTS "Contractors can manage own clients" ON public.clients;
CREATE POLICY "Contractors can manage own clients"
ON public.clients FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Restrict project_messages update policy to authenticated
DROP POLICY IF EXISTS "Project members can update messages" ON public.project_messages;
CREATE POLICY "Project members can update messages"
ON public.project_messages FOR UPDATE
TO authenticated
USING (is_project_member(project_id))
WITH CHECK (is_project_member(project_id));

-- 6. Fix client-uploads storage policies
DROP POLICY IF EXISTS "Users can view their uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Client uploads: scoped insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-uploads'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Client uploads: scoped delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-uploads'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- The existing "Users can view own project files" policy already provides
-- correct scoped SELECT (contractors see all; clients see only their own folder).

-- 7. Input validation constraints
ALTER TABLE public.clients
  ADD CONSTRAINT clients_name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT clients_email_length CHECK (email IS NULL OR length(email) <= 255),
  ADD CONSTRAINT clients_phone_length CHECK (phone IS NULL OR length(phone) <= 50),
  ADD CONSTRAINT clients_address_length CHECK (address IS NULL OR length(address) <= 500);

ALTER TABLE public.projects
  ADD CONSTRAINT projects_name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT projects_description_length CHECK (description IS NULL OR length(description) <= 5000),
  ADD CONSTRAINT projects_address_length CHECK (address IS NULL OR length(address) <= 500);

ALTER TABLE public.project_files
  ADD CONSTRAINT project_files_name_length CHECK (length(name) <= 300),
  ADD CONSTRAINT project_files_description_length CHECK (description IS NULL OR length(description) <= 2000),
  ADD CONSTRAINT project_files_category_length CHECK (category IS NULL OR length(category) <= 50);

ALTER TABLE public.project_tasks
  ADD CONSTRAINT project_tasks_title_length CHECK (length(title) <= 300),
  ADD CONSTRAINT project_tasks_description_length CHECK (description IS NULL OR length(description) <= 5000);

ALTER TABLE public.client_checklist_items
  ADD CONSTRAINT checklist_title_length CHECK (length(title) <= 300),
  ADD CONSTRAINT checklist_description_length CHECK (description IS NULL OR length(description) <= 2000);

ALTER TABLE public.client_photo_uploads
  ADD CONSTRAINT photo_description_length CHECK (description IS NULL OR length(description) <= 2000),
  ADD CONSTRAINT photo_location_notes_length CHECK (location_notes IS NULL OR length(location_notes) <= 500);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length CHECK (full_name IS NULL OR length(full_name) <= 100),
  ADD CONSTRAINT profiles_email_length CHECK (email IS NULL OR length(email) <= 255),
  ADD CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR length(phone) <= 50);
