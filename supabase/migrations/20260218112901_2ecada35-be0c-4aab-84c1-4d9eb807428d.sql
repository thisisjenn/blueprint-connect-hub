
-- Add length constraint to project_messages content
ALTER TABLE public.project_messages ADD CONSTRAINT content_length CHECK (length(content) <= 10000);
