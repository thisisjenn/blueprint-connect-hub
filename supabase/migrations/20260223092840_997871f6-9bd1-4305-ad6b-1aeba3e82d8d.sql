
-- Fix profiles: recreate policies with TO authenticated
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Contractors can view all profiles" ON public.profiles;
CREATE POLICY "Contractors can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_contractor());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Can view profiles of message senders in shared projects" ON public.profiles;
CREATE POLICY "Can view profiles of message senders in shared projects" ON public.profiles FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM project_messages pm
  JOIN projects p ON p.id = pm.project_id
  WHERE pm.sender_id = profiles.user_id
  AND (p.client_id = auth.uid() OR public.is_contractor())
));

-- Fix invoices: recreate policies with TO authenticated
DROP POLICY IF EXISTS "Clients can view own invoices" ON public.invoices;
CREATE POLICY "Clients can view own invoices" ON public.invoices FOR SELECT TO authenticated USING (is_client_for_project(project_id));

DROP POLICY IF EXISTS "Contractors can manage invoices" ON public.invoices;
CREATE POLICY "Contractors can manage invoices" ON public.invoices FOR ALL TO authenticated USING (is_contractor());
