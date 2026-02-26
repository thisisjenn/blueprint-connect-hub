
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'job', 'task', 'client', 'document', 'message'
  title TEXT NOT NULL,
  description TEXT,
  reference_id UUID, -- ID of the related entity
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System inserts via triggers (SECURITY DEFINER), but also allow authenticated insert for own
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: new project → notify contractor
CREATE OR REPLACE FUNCTION public.notify_new_project()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  -- Notify all contractors
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  SELECT ur.user_id, 'job', 'New Job Created',
    'Project "' || NEW.name || '" has been created.',
    NEW.id
  FROM public.user_roles ur
  WHERE ur.role = 'contractor' AND ur.user_id != auth.uid();
  
  -- Notify client if assigned
  IF NEW.client_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (NEW.client_id, 'job', 'New Project Assigned',
      'You have been assigned to project "' || NEW.name || '".',
      NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_project
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_project();

-- Trigger: new task → notify contractors
CREATE OR REPLACE FUNCTION public.notify_new_task()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  project_name TEXT;
BEGIN
  SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;
  
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  SELECT ur.user_id, 'task', 'New Task Added',
    '"' || NEW.title || '" added to ' || COALESCE(project_name, 'a project') || '.',
    NEW.id
  FROM public.user_roles ur
  WHERE ur.role = 'contractor' AND ur.user_id != auth.uid();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_task
  AFTER INSERT ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_task();

-- Trigger: new client → notify contractor who owns it
CREATE OR REPLACE FUNCTION public.notify_new_client()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  VALUES (NEW.user_id, 'client', 'New Client Added',
    NEW.name || ' has been added to your client list.',
    NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_client
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_client();

-- Trigger: new document uploaded → notify project members
CREATE OR REPLACE FUNCTION public.notify_new_document()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  proj RECORD;
BEGIN
  SELECT name, client_id INTO proj FROM public.projects WHERE id = NEW.project_id;
  
  -- Notify contractors
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  SELECT ur.user_id, 'document', 'New Document Uploaded',
    '"' || NEW.name || '" uploaded to ' || COALESCE(proj.name, 'a project') || '.',
    NEW.id
  FROM public.user_roles ur
  WHERE ur.role = 'contractor' AND ur.user_id != COALESCE(NEW.uploaded_by, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Notify client if shared
  IF NEW.is_shared_with_client = true AND proj.client_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.client_id, 'document', 'New Document Available',
      '"' || NEW.name || '" has been shared with you.',
      NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_document
  AFTER INSERT ON public.project_files
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_document();

-- Trigger: new message → notify other project members
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  proj RECORD;
  sender_name TEXT;
BEGIN
  SELECT name, client_id INTO proj FROM public.projects WHERE id = NEW.project_id;
  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id;
  
  -- Notify contractors (except sender)
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  SELECT ur.user_id, 'message', 'New Message',
    COALESCE(sender_name, 'Someone') || ' sent a message in ' || COALESCE(proj.name, 'a project') || '.',
    NEW.project_id
  FROM public.user_roles ur
  WHERE ur.role = 'contractor' AND ur.user_id != COALESCE(NEW.sender_id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Notify client (except sender)
  IF proj.client_id IS NOT NULL AND proj.client_id != COALESCE(NEW.sender_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.client_id, 'message', 'New Message',
      COALESCE(sender_name, 'Someone') || ' sent a message in ' || COALESCE(proj.name, 'a project') || '.',
      NEW.project_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.project_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();
