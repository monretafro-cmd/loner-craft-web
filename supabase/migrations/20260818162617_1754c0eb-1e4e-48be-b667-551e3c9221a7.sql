-- 1. Ensure schema private exists
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Move handle_new_user and protect_profile_privileges to private
-- (They were still in public according to read_query)
ALTER FUNCTION public.handle_new_user() SET SCHEMA private;
ALTER FUNCTION public.protect_profile_privileges() SET SCHEMA private;

-- 3. Update the functions to include private in search_path and fix logic
CREATE OR REPLACE FUNCTION private.protect_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'private' AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT private.has_role(auth.uid(), 'super_admin') THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.approved_by IS DISTINCT FROM OLD.approved_by
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at THEN
      RAISE EXCEPTION 'Only a super admin can change approval status';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
GRANT EXECUTE ON FUNCTION private.protect_profile_privileges() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'private' AS $$
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
GRANT EXECUTE ON FUNCTION private.handle_new_user() TO authenticated, service_role;

-- 4. Re-bind triggers to the new functions in private schema
DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.protect_profile_privileges();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- 5. Update RLS policies to use private schema for has_role and is_admin
-- We don't need to re-create the functions themselves, just point the policies to them.

-- Profiles
DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "admins insert profiles" ON public.profiles;
CREATE POLICY "admins insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));

-- User Roles
DROP POLICY IF EXISTS "roles readable by admins" ON public.user_roles;
CREATE POLICY "roles readable by admins" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "super admins manage roles insert" ON public.user_roles;
CREATE POLICY "super admins manage roles insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "super admins manage roles delete" ON public.user_roles;
CREATE POLICY "super admins manage roles delete" ON public.user_roles FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'super_admin'));

-- Admin Invitations
DROP POLICY IF EXISTS "super admins read invitations" ON public.admin_invitations;
CREATE POLICY "super admins read invitations" ON public.admin_invitations FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super admins insert invitations" ON public.admin_invitations;
CREATE POLICY "super admins insert invitations" ON public.admin_invitations FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super admins update invitations" ON public.admin_invitations;
CREATE POLICY "super admins update invitations" ON public.admin_invitations FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'super_admin')) WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super admins delete invitations" ON public.admin_invitations;
CREATE POLICY "super admins delete invitations" ON public.admin_invitations FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin'));

-- Dynamic policies for other tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['categories','products','product_images','product_variants','customers','customer_addresses','customer_notes','orders','order_items','order_status_history','whatsapp_logs','inventory_history','coupons','reviews','messages','delivery_zones','notifications','homepage_content','site_settings','media','audit_logs']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admins read %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "admins read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (private.is_admin(auth.uid()))', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "admins insert %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "admins insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()))', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "admins update %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "admins update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()))', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "super admins delete %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "super admins delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (private.has_role(auth.uid(), ''super_admin''))', t);
  END LOOP;
END $$;

-- Storage policies
DROP POLICY IF EXISTS "admins upload store files" ON storage.objects;
CREATE POLICY "admins upload store files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('product-images','media') AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins update store files" ON storage.objects;
CREATE POLICY "admins update store files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('product-images','media') AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins delete store files" ON storage.objects;
CREATE POLICY "admins delete store files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('product-images','media') AND private.is_admin(auth.uid()));
