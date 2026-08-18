-- Fix 1: Ensure all UPDATE policies on sensitive tables have WITH CHECK clauses
-- and verify they don't allow unauthorized modifications even if the initial check passes.

-- Fix for profiles: Add WITH CHECK to ensure users can only update their own profile or as super_admin
DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
CREATE POLICY "profiles self update" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (id = auth.uid() OR private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (id = auth.uid() OR private.has_role(auth.uid(), 'super_admin'));

-- Fix for storage: Add WITH CHECK to UPDATE policy
DROP POLICY IF EXISTS "admins update store files" ON storage.objects;
CREATE POLICY "admins update store files" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id IN ('product-images', 'media') AND private.is_admin(auth.uid()))
  WITH CHECK (bucket_id IN ('product-images', 'media') AND private.is_admin(auth.uid()));

-- Fix 2: Ensure 'anon' cannot access sensitive tables even via SELECT if not intended
-- We saw 'anon' has SELECT on some tables. Let's revoke and re-grant explicitly where needed.
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE SELECT ON public.admin_invitations FROM anon;

-- Fix 3: Tighten public product images policy to ensure it only allows SELECT
-- Current policy: "public read product images" for anon, authenticated
-- It's a SELECT policy, which is good.

-- Fix 4: Verify sensitive admin tables don't have unnecessary grants
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.admin_invitations TO authenticated;
-- (Ensure service_role still has ALL)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.admin_invitations TO service_role;

-- Fix 5: Ensure dynamic policies created in the previous turn are robust
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['categories','products','product_images','product_variants','customers','customer_addresses','customer_notes','orders','order_items','order_status_history','whatsapp_logs','inventory_history','coupons','reviews','messages','delivery_zones','notifications','homepage_content','site_settings','media','audit_logs']
  LOOP
    -- Add WITH CHECK to the UPDATE policies for all admin-managed tables
    EXECUTE format('DROP POLICY IF EXISTS "admins update %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "admins update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()))', t);
  END LOOP;
END $$;
