-- Allow 'designer' role to act as a pro (create/own projects) — same as contractor
CREATE OR REPLACE FUNCTION public.is_contractor()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('contractor'::public.app_role, 'designer'::public.app_role)
  )
$$;