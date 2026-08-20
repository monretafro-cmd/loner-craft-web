CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
DECLARE
  inv public.admin_invitations%ROWTYPE;
  new_status text := 'pending';
  is_permanent_owner boolean := lower(COALESCE(NEW.email, '')) = 'valaverde05@gmail.com';
BEGIN
  IF is_permanent_owner THEN
    new_status := 'approved';
  ELSE
    SELECT * INTO inv FROM public.admin_invitations
    WHERE lower(email) = lower(NEW.email) AND revoked = false AND accepted_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1;

    IF inv.id IS NOT NULL THEN
      new_status := 'approved';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, avatar_url, provider, status, is_owner, approved_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    new_status,
    is_permanent_owner,
    CASE WHEN new_status = 'approved' THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    provider = EXCLUDED.provider,
    status = CASE WHEN is_permanent_owner THEN 'approved' ELSE public.profiles.status END,
    is_owner = CASE WHEN is_permanent_owner THEN true ELSE public.profiles.is_owner END,
    approved_at = CASE WHEN is_permanent_owner THEN COALESCE(public.profiles.approved_at, now()) ELSE public.profiles.approved_at END;

  IF is_permanent_owner THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF inv.id IS NOT NULL THEN
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
END;
$function$;

UPDATE public.profiles
SET status = 'approved',
    is_owner = true,
    approved_at = COALESCE(approved_at, now())
WHERE lower(email) = 'valaverde05@gmail.com';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM public.profiles
WHERE lower(email) = 'valaverde05@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;