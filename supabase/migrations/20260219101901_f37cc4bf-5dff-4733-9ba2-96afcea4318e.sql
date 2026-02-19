
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view client uploads" ON storage.objects;

-- Create scoped SELECT policy: contractors see all, clients see only their own folder
CREATE POLICY "Users can view own project files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-uploads' AND (
    public.is_contractor() OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);
