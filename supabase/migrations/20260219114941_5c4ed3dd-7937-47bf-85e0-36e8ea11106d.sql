-- Create the trigger on auth.users so handle_new_user fires on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing roles for existing users using their metadata
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  (au.raw_user_meta_data->>'role')::public.app_role
FROM auth.users au
WHERE au.raw_user_meta_data->>'role' IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
  )
ON CONFLICT (user_id, role) DO NOTHING;