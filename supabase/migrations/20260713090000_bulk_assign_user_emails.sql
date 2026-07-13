-- Backfill email addresses from phone for users missing login email.
-- Pattern: {digits_only_phone}@together.test (e.g. 972502222222@together.test)
-- Idempotent — safe to re-run.
-- Migration: 20260713090000_bulk_assign_user_emails.sql

CREATE OR REPLACE FUNCTION public._upsert_user_email_identity(
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
  v_email := lower(trim(p_email));

  SELECT
    COALESCE(u.raw_app_meta_data->>'provider', 'phone'),
    COALESCE(u.raw_app_meta_data->'providers', '[]'::jsonb)
  INTO v_provider, v_providers
  FROM auth.users u
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
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
END;
$$;

CREATE OR REPLACE FUNCTION public.backfill_user_emails_from_phone()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
  r record;
  v_email text;
  v_base text;
  v_suffix int;
  v_updated int := 0;
BEGIN
  -- 1) Assign email from phone when missing or deleted placeholder
  FOR r IN
    SELECT u.id, u.phone
    FROM auth.users u
    WHERE (
      u.email IS NULL
      OR trim(u.email) = ''
      OR u.email LIKE '%@deleted.local'
    )
    AND u.phone IS NOT NULL
    AND trim(u.phone) <> ''
  LOOP
    v_base := regexp_replace(r.phone, '[^0-9]', '', 'g');
    IF v_base = '' THEN
      CONTINUE;
    END IF;

    v_email := v_base || '@together.test';
    v_suffix := 0;

    WHILE EXISTS (
      SELECT 1
      FROM auth.users u2
      WHERE lower(u2.email) = v_email
        AND u2.id <> r.id
    ) LOOP
      v_suffix := v_suffix + 1;
      v_email := v_base || '+' || v_suffix || '@together.test';
    END LOOP;

    PERFORM public._upsert_user_email_identity(r.id, v_email);
    v_updated := v_updated + 1;
  END LOOP;

  -- 2) Users without phone: stable id-based email
  FOR r IN
    SELECT u.id
    FROM auth.users u
    WHERE (
      u.email IS NULL
      OR trim(u.email) = ''
      OR u.email LIKE '%@deleted.local'
    )
    AND (u.phone IS NULL OR trim(u.phone) = '')
  LOOP
    v_email := 'user-' || replace(r.id::text, '-', '') || '@together.test';
    PERFORM public._upsert_user_email_identity(r.id, v_email);
    v_updated := v_updated + 1;
  END LOOP;

  -- 3) Ensure email identity exists for users who already have a valid email
  FOR r IN
    SELECT u.id, u.email
    FROM auth.users u
    WHERE u.email IS NOT NULL
      AND trim(u.email) <> ''
      AND u.email NOT LIKE '%@deleted.local'
      AND NOT EXISTS (
        SELECT 1 FROM auth.identities i
        WHERE i.user_id = u.id AND i.provider = 'email'
      )
  LOOP
    PERFORM public._upsert_user_email_identity(r.id, r.email);
    v_updated := v_updated + 1;
  END LOOP;

  RETURN v_updated;
END;
$$;

-- Run once on deploy; idempotent on re-run.
SELECT public.backfill_user_emails_from_phone();
