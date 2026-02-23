-- Drop the FK constraint so projects.client_id can store auth user_id instead of clients.id
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;

-- Add a client_record_id column to maintain the link to the clients table for contractor UI
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_record_id uuid;

-- Add FK on the new column
ALTER TABLE public.projects ADD CONSTRAINT projects_client_record_id_fkey 
  FOREIGN KEY (client_record_id) REFERENCES public.clients(id) ON DELETE SET NULL;