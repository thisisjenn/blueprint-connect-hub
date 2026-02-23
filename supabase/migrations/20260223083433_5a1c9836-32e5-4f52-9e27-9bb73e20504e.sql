-- The previous migration already dropped and recreated the policies as PERMISSIVE
-- and added the UPDATE policy. Just need to handle the realtime error.
-- This is a no-op migration since the policies were already applied above.
SELECT 1;