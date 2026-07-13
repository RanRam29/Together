-- Admin set user email for email+password login (staff user detail screen)
-- Migration: 20260713080000_admin_user_email.sql

CREATE OR REPLACE FUNCTION public.admin_set_user_email(
  p_user_id uuid,
  p_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
  v_email text;
  v_providers jsonb;
  v_provider text;
BEGIN
  PERFORM public.check_admin_mfa();

  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  v_email := lower(trim(p_email));

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE lower(u.email) = v_email
      AND u.id <> p_user_id
      AND u.email NOT LIKE '%@deleted.local'
  ) THEN
    RAISE EXCEPTION 'Email already in use';
  END IF;

  SELECT
    COALESCE(u.raw_app_meta_data->>'provider', 'phone'),
    COALESCE(u.raw_app_meta_data->'providers', '[]'::jsonb)
  INTO v_provider, v_providers
  FROM auth.users u
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF NOT v_providers ? 'email' THEN
    v_providers := v_providers || '["email"]'::jsonb;
  END IF;
  IF NOT v_providers ? v_provider THEN
    v_providers := v_providers || to_jsonb(v_provider);
  END IF;

  UPDATE auth.users
  SET
    email = v_email,
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now(),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
      'provider', v_provider,
      'providers', v_providers
    )
  WHERE id = p_user_id;

  IF EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = p_user_id AND i.provider = 'email'
  ) THEN
    UPDATE auth.identities
    SET
      provider_id = v_email,
      identity_data = jsonb_build_object(
        'sub', p_user_id::text,
        'email', v_email,
        'email_verified', true
      ),
      updated_at = now()
    WHERE user_id = p_user_id AND provider = 'email';
  ELSE
    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_email,
      p_user_id,
      jsonb_build_object(
        'sub', p_user_id::text,
        'email', v_email,
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  INSERT INTO public.audit_log (user_id, resource, resource_id, action, tier, metadata)
  VALUES (
    auth.uid(),
    'auth',
    p_user_id,
    'admin_set_user_email',
    0,
    jsonb_build_object('email', v_email)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_email(uuid, text) TO authenticated;
