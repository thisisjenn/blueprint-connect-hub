-- Check if policy already exists and recreate it to ensure it's properly applied
DROP POLICY IF EXISTS "Can view profiles of message senders in shared projects" ON public.profiles;

CREATE POLICY "Can view profiles of message senders in shared projects"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_messages pm
    JOIN projects p ON p.id = pm.project_id
    WHERE pm.sender_id = profiles.user_id
    AND (p.client_id = auth.uid() OR public.is_contractor())
  )
);

-- Also create the trigger for handle_new_user if it doesn't exist
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();