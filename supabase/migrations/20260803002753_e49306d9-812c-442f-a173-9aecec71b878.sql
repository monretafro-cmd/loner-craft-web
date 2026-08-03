DROP POLICY IF EXISTS "profiles self update" ON public.profiles;

CREATE POLICY "profiles self update"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK ((id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS protect_profile_privileges_trg ON public.profiles;
CREATE TRIGGER protect_profile_privileges_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();