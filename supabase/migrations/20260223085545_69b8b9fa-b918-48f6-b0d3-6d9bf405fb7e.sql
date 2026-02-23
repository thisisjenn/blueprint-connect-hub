-- Allow project members to update messages (mark as read)
CREATE POLICY "Project members can update messages"
ON public.project_messages
FOR UPDATE
USING (is_project_member(project_id))
WITH CHECK (is_project_member(project_id));
