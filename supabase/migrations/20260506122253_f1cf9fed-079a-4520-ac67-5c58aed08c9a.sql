
-- Revoke anon execute on internal helpers (still needed by authenticated users via RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_contractor() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_client_for_project(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_project_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_available_roles() FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_contractor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_client_for_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_roles() TO authenticated;

-- Tighten the avatars bucket: stop allowing listing of every file.
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Public read-by-path is fine for avatars (URLs are unguessable since they include user id),
-- but we restrict to authenticated viewers and disable folder listing for anon.
CREATE POLICY "Avatars: read by authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
