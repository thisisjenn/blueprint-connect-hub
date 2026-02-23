-- Create a trigger to auto-populate client_record_id from client_id
CREATE OR REPLACE FUNCTION public.set_client_record_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.client_id IS NOT NULL THEN
    SELECT c.id INTO NEW.client_record_id
    FROM public.clients c
    JOIN public.profiles p ON p.email = c.email
    WHERE p.user_id = NEW.client_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_client_record_id
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_client_record_id();