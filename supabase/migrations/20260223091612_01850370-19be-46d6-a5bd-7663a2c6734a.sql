-- Drop the existing policy that depends on user_roles (may not be populated)
DROP POLICY IF EXISTS "Clients can view contractor profiles" ON public.profiles;

-- Create a more robust policy: clients can view profiles of anyone who sent messages in their projects
CREATE POLICY "Can view profiles of message senders in shared projects"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_messages pm
    JOIN projects p ON p.id = pm.project_id
    WHERE pm.sender_id = profiles.user_id
    AND (p.client_id = auth.uid() OR public.is_contractor())
  )
);
