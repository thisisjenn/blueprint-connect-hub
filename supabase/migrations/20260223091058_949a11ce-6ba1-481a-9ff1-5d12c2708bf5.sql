
-- Allow clients to view profiles of users who are contractors (so they can see contractor names in messages)
CREATE POLICY "Clients can view contractor profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.user_id AND user_roles.role = 'contractor'
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'client'
  )
);
