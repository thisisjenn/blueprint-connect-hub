
-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Contractors can do everything with project files
CREATE POLICY "Contractors can manage project files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'project-files' AND public.is_contractor())
WITH CHECK (bucket_id = 'project-files' AND public.is_contractor());

-- Clients can upload to their own folder
CREATE POLICY "Clients can upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Clients can view files in their own folder
CREATE POLICY "Clients can view own project files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
