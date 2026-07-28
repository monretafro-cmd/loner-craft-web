
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('pending','approved','rejected','blocked'));

UPDATE public.profiles p SET status = 'approved', approved_at = COALESCE(approved_at, now())
WHERE EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = p.id);

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id AND p.status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id AND ur.role = _role AND p.status = 'approved'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'admin',
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  accepted_at timestamptz,
  accepted_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_invitations_email_active_idx
  ON public.admin_invitations (lower(email)) WHERE revoked = false AND accepted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super admins read invitations" ON public.admin_invitations;
CREATE POLICY "super admins read invitations" ON public.admin_invitations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "super admins insert invitations" ON public.admin_invitations;
CREATE POLICY "super admins insert invitations" ON public.admin_invitations
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "super admins update invitations" ON public.admin_invitations;
CREATE POLICY "super admins update invitations" ON public.admin_invitations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "super admins delete invitations" ON public.admin_invitations;
CREATE POLICY "super admins delete invitations" ON public.admin_invitations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS update_admin_invitations_updated_at ON public.admin_invitations;
CREATE TRIGGER update_admin_invitations_updated_at BEFORE UPDATE ON public.admin_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- prevent self-service privilege escalation on profiles
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'super_admin') THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.approved_by IS DISTINCT FROM OLD.approved_by
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at THEN
      RAISE EXCEPTION 'Only a super admin can change approval status';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.protect_profile_privileges() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

-- new user handling: pending by default, auto-approve valid invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  inv public.admin_invitations%ROWTYPE;
  new_status text := 'pending';
BEGIN
  SELECT * INTO inv FROM public.admin_invitations
  WHERE lower(email) = lower(NEW.email) AND revoked = false AND accepted_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF inv.id IS NOT NULL THEN
    new_status := 'approved';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    new_status,
    CASE WHEN new_status = 'approved' THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;

  IF inv.id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, inv.role)
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invitations SET accepted_at = now(), accepted_by = NEW.id WHERE id = inv.id;
  ELSE
    INSERT INTO public.notifications (type, title, body, link)
    VALUES ('access_request', 'New admin access request',
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || ' (' || NEW.email || ') requested access via ' ||
      COALESCE(NEW.raw_app_meta_data->>'provider','email'), '/admin/admins');
  END IF;

  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
