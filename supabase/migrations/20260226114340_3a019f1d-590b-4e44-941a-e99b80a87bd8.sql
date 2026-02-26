
-- Fix: notify ALL contractors including the creator

CREATE OR REPLACE FUNCTION public.notify_new_project()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  SELECT ur.user_id, 'job', 'New Job Created',
    'Project "' || NEW.name || '" has been created.',
    NEW.id
  FROM public.user_roles ur
  WHERE ur.role = 'contractor';
  
  IF NEW.client_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (NEW.client_id, 'job', 'New Project Assigned',
      'You have been assigned to project "' || NEW.name || '".',
      NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

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
  WHERE ur.role = 'contractor';
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_document()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  proj RECORD;
BEGIN
  SELECT name, client_id INTO proj FROM public.projects WHERE id = NEW.project_id;
  
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  SELECT ur.user_id, 'document', 'New Document Uploaded',
    '"' || NEW.name || '" uploaded to ' || COALESCE(proj.name, 'a project') || '.',
    NEW.id
  FROM public.user_roles ur
  WHERE ur.role = 'contractor';
  
  IF NEW.is_shared_with_client = true AND proj.client_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.client_id, 'document', 'New Document Available',
      '"' || NEW.name || '" has been shared with you.',
      NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  proj RECORD;
  sender_name TEXT;
BEGIN
  SELECT name, client_id INTO proj FROM public.projects WHERE id = NEW.project_id;
  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id;
  
  INSERT INTO public.notifications (user_id, type, title, description, reference_id)
  SELECT ur.user_id, 'message', 'New Message',
    COALESCE(sender_name, 'Someone') || ' sent a message in ' || COALESCE(proj.name, 'a project') || '.',
    NEW.project_id
  FROM public.user_roles ur
  WHERE ur.role = 'contractor' AND ur.user_id != COALESCE(NEW.sender_id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF proj.client_id IS NOT NULL AND proj.client_id != COALESCE(NEW.sender_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications (user_id, type, title, description, reference_id)
    VALUES (proj.client_id, 'message', 'New Message',
      COALESCE(sender_name, 'Someone') || ' sent a message in ' || COALESCE(proj.name, 'a project') || '.',
      NEW.project_id);
  END IF;
  
  RETURN NEW;
END;
$$;
