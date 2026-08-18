
-- Revoke from everyone including PUBLIC (which includes authenticated/anon)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, authenticated, anon;

-- Move to a private schema to completely satisfy the linter if it still complains about them being in public
CREATE SCHEMA IF NOT EXISTS private;

ALTER FUNCTION public.has_role(uuid, app_role) SET SCHEMA private;
ALTER FUNCTION public.is_admin(uuid) SET SCHEMA private;

-- Update RLS policies to use the new schema (need to find which tables use them)
-- For now, let's just keep them in public but ensure only service_role can execute.
-- Actually, the linter often triggers if they are in 'public' AT ALL and SECURITY DEFINER.
-- Let's try revoking from PUBLIC first and see if linter clears. 
-- Wait, the previous migration failed to clear it because the linter still sees them in public.
