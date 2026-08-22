-- Fix search_path for functions
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.setup_initial_owner() SET search_path = public;

-- Revoke public execution of SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.setup_initial_owner() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.setup_initial_owner() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_initial_owner() FROM anon;

-- Add policies for admin_roles
CREATE POLICY "Admins can view roles" ON public.admin_roles
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles 
            WHERE id = auth.uid() AND status = 'approved'
        )
    );

CREATE POLICY "Super Admins can manage roles" ON public.admin_roles
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles 
            WHERE id = auth.uid() AND role = 'super_admin' AND status = 'approved'
        )
    );

-- Add policies for admin_access_requests
CREATE POLICY "Users can view their own access requests" ON public.admin_access_requests
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create access requests" ON public.admin_access_requests
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super Admins can manage access requests" ON public.admin_access_requests
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles 
            WHERE id = auth.uid() AND role = 'super_admin' AND status = 'approved'
        )
    );
