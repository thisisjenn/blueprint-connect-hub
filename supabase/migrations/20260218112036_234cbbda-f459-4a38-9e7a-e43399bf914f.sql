
-- Make the client-uploads bucket private
UPDATE storage.buckets SET public = false WHERE id = 'client-uploads';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view client uploads" ON storage.objects;

-- Add a restricted SELECT policy for authenticated project members only
CREATE POLICY "Authenticated users can view client uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-uploads'
  AND auth.role() = 'authenticated'
);
