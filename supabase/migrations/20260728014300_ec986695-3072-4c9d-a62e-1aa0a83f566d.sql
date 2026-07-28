GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
CREATE POLICY "super admins manage roles insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admins manage roles delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admins insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));