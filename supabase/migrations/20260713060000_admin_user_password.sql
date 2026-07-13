-- Admin user login info + password reset (staff user detail screen)
-- Migration: 20260713060000_admin_user_password.sql

CREATE OR REPLACE FUNCTION public.admin_get_user_login(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
  v_email text;
  v_phone text;
  v_username text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  SELECT u.email, u.phone
  INTO v_email, v_phone
  FROM auth.users u
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_email LIKE '%@deleted.local' THEN
    v_email := NULL;
  END IF;

  v_username := COALESCE(
    NULLIF(trim(v_email), ''),
    NULLIF(trim(v_phone), ''),
    p_user_id::text
  );

  RETURN jsonb_build_object(
    'email', v_email,
    'phone', v_phone,
    'username', v_username
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_password(
  p_user_id uuid,
  p_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
BEGIN
  PERFORM public.check_admin_mfa();

  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  IF p_password IS NULL OR length(trim(p_password)) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters';
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(trim(p_password), gen_salt('bf')),
      updated_at = now()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  INSERT INTO public.audit_log (user_id, resource, resource_id, action, tier, metadata)
  VALUES (
    auth.uid(), 'auth', p_user_id, 'admin_set_user_password', 0, '{}'::jsonb
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_user_login(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(uuid, text) TO authenticated;
