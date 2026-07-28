-- Establish exactly one automatic initial owner. All other accounts begin
-- pending with no role, including accounts created from an email invitation.

DO $$
DECLARE
  owner_email constant text := 'valaverde05@gmail.com';
  owner_id uuid;
  previous_status text;
  previous_role public.app_role;
BEGIN
  SELECT u.id
  INTO owner_id
  FROM auth.users u
  WHERE lower(u.email) = owner_email
  ORDER BY u.created_at
  LIMIT 1;

  IF owner_id IS NOT NULL THEN
    SELECT p.status
    INTO previous_status
    FROM public.profiles p
    WHERE p.id = owner_id;

    SELECT ur.role
    INTO previous_role
    FROM public.user_roles ur
    WHERE ur.user_id = owner_id
    ORDER BY CASE WHEN ur.role = 'super_admin' THEN 0 ELSE 1 END
    LIMIT 1;

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      avatar_url,
      provider,
      status,
      approved_at,
      approved_by,
      last_login_at
    )
    SELECT
      u.id,
      owner_email,
      COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        split_part(owner_email, '@', 1)
      ),
      u.raw_user_meta_data->>'avatar_url',
      COALESCE(u.raw_app_meta_data->>'provider', 'email'),
      'approved',
      now(),
      u.id,
      now()
    FROM auth.users u
    WHERE u.id = owner_id
    ON CONFLICT (id) DO UPDATE
    SET
      email = owner_email,
      status = 'approved',
      approved_at = now(),
      approved_by = owner_id,
      provider = COALESCE(EXCLUDED.provider, public.profiles.provider),
      avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      last_login_at = now(),
      updated_at = now();

    DELETE FROM public.user_roles WHERE user_id = owner_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (owner_id, 'super_admin');

    IF NOT EXISTS (
      SELECT 1
      FROM public.audit_logs
      WHERE action = 'initial_owner_promoted'
        AND record_type = 'profiles'
        AND record_id = owner_id::text
    ) THEN
      INSERT INTO public.audit_logs (
        admin_id,
        admin_name,
        action,
        page,
        record_type,
        record_id,
        old_value,
        new_value
      )
      VALUES (
        owner_id,
        owner_email,
        'initial_owner_promoted',
        'admin/access',
        'profiles',
        owner_id::text,
        jsonb_build_object(
          'status', COALESCE(previous_status, 'missing'),
          'role', previous_role
        ),
        jsonb_build_object(
          'email', owner_email,
          'status', 'approved',
          'role', 'super_admin',
          'approved_by', owner_id,
          'initialization', 'self_owner_initialization'
        )
      );
    END IF;
  END IF;

  -- Authorization roles are never valid for unapproved accounts.
  DELETE FROM public.user_roles ur
  USING public.profiles p
  WHERE ur.user_id = p.id
    AND p.status <> 'approved';
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  owner_email constant text := 'valaverde05@gmail.com';
  is_initial_owner boolean := lower(COALESCE(NEW.email, '')) = owner_email;
  matching_invitation public.admin_invitations%ROWTYPE;
  new_status text := 'pending';
BEGIN
  IF is_initial_owner THEN
    new_status := 'approved';
  ELSE
    SELECT *
    INTO matching_invitation
    FROM public.admin_invitations
    WHERE lower(email) = lower(NEW.email)
      AND revoked = false
      AND accepted_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    provider,
    status,
    approved_at,
    approved_by
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    new_status,
    CASE WHEN is_initial_owner THEN now() ELSE NULL END,
    CASE WHEN is_initial_owner THEN NEW.id ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    provider = EXCLUDED.provider,
    status = EXCLUDED.status,
    approved_at = EXCLUDED.approved_at,
    approved_by = EXCLUDED.approved_by,
    updated_at = now();

  DELETE FROM public.user_roles WHERE user_id = NEW.id;

  IF is_initial_owner THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');

    INSERT INTO public.audit_logs (
      admin_id,
      admin_name,
      action,
      page,
      record_type,
      record_id,
      new_value
    )
    VALUES (
      NEW.id,
      owner_email,
      'initial_owner_promoted',
      'admin/access',
      'profiles',
      NEW.id::text,
      jsonb_build_object(
        'email', owner_email,
        'status', 'approved',
        'role', 'super_admin',
        'approved_by', NEW.id,
        'initialization', 'self_owner_initialization'
      )
    );
  ELSE
    INSERT INTO public.notifications (type, title, body, link)
    VALUES (
      'access_request',
      CASE
        WHEN matching_invitation.id IS NOT NULL
          THEN 'Invited admin awaiting approval'
        ELSE 'New admin access request'
      END,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
        || ' (' || NEW.email || ') must be approved by a Super Admin.',
      '/admin/admins'
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
