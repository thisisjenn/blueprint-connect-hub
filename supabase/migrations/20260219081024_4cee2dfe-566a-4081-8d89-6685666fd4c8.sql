
-- Create a function to expose the app_role enum values dynamically
CREATE OR REPLACE FUNCTION public.get_available_roles()
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT enumlabel::text
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = 'app_role'
    ORDER BY enumsortorder
  )
$$;
