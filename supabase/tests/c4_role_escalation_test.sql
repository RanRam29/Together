-- Together Platform — C4 Role Escalation Tests
-- Test file: supabase/tests/c4_role_escalation_test.sql
-- Runs via: npx supabase db query --linked --file supabase/tests/c4_role_escalation_test.sql
--
-- Proves that an authenticated end user cannot escalate to admin or change immutable fields,
-- while legitimate backend paths (service_role) still can.

BEGIN;

SET search_path TO public, extensions;

CREATE OR REPLACE FUNCTION public.test_c4_role_escalation()
RETURNS SETOF TEXT AS $$
DECLARE
  parent_id       uuid := 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd38c401';
  other_id        uuid := 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd38c402';
  v_role_after    text;
BEGIN
  -- ============================================================
  -- SETUP (superuser context — no JWT — trigger is exempt)
  -- ============================================================
  INSERT INTO auth.users (id, phone, aud, role) VALUES
    (parent_id, '0500000401', 'authenticated', 'authenticated'),
    (other_id,  '0500000402', 'authenticated', 'authenticated');

  UPDATE profiles SET role = 'parent', full_name = 'הורה C4' WHERE id = parent_id;
  UPDATE profiles SET role = 'parent' WHERE id = other_id;

  -- ============================================================
  -- TEST 1: authenticated user CANNOT promote self to admin
  -- ============================================================
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', parent_id, 'role', 'authenticated')::text, true);

  RETURN NEXT throws_ok(
    format('UPDATE profiles SET role = ''admin'' WHERE id = %L', parent_id),
    'Changing role is not allowed',
    'Authenticated user cannot promote self to admin (C4)'
  );

  -- ============================================================
  -- TEST 2: role in DB is unchanged after the blocked attempt
  -- ============================================================
  -- Read back in superuser context (reset claims)
  PERFORM set_config('request.jwt.claims', NULL, true);
  SELECT role::text INTO v_role_after FROM profiles WHERE id = parent_id;
  RETURN NEXT is(v_role_after, 'parent', 'Role remains parent after blocked escalation (C4)');

  -- ============================================================
  -- TEST 3: authenticated user cannot change profile id
  -- ============================================================
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', parent_id, 'role', 'authenticated')::text, true);

  RETURN NEXT throws_ok(
    format('UPDATE profiles SET id = %L WHERE id = %L', other_id, parent_id),
    'Changing profile id is not allowed',
    'Authenticated user cannot change profile id (C4)'
  );

  -- ============================================================
  -- TEST 4: authenticated user CAN update allowed fields (role unchanged)
  -- ============================================================
  RETURN NEXT lives_ok(
    format('UPDATE profiles SET full_name = ''שם חדש'' WHERE id = %L', parent_id),
    'Authenticated user can update allowed profile fields'
  );

  -- ============================================================
  -- TEST 5: service_role CAN change role (admin RPC / backend path)
  -- ============================================================
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', parent_id, 'role', 'service_role')::text, true);

  RETURN NEXT lives_ok(
    format('UPDATE profiles SET role = ''admin'' WHERE id = %L', parent_id),
    'service_role can change role (legitimate backend path)'
  );

  -- ============================================================
  -- TEST 6: is_admin() is false without app_metadata, even if role=admin
  -- ============================================================
  -- parent_id now has role='admin' in table but the JWT below lacks app_metadata.is_admin
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', parent_id, 'role', 'authenticated')::text, true);

  RETURN NEXT is(
    public.is_admin(),
    false,
    'is_admin() is false without app_metadata.is_admin claim (defense-in-depth)'
  );

  -- ============================================================
  -- TEST 7: is_admin() is true with role=admin AND app_metadata claim
  -- ============================================================
  PERFORM set_config('request.jwt.claims',
    json_build_object(
      'sub', parent_id,
      'role', 'authenticated',
      'app_metadata', json_build_object('is_admin', true)
    )::text, true);

  RETURN NEXT is(
    public.is_admin(),
    true,
    'is_admin() is true with role=admin and app_metadata.is_admin'
  );

  PERFORM set_config('request.jwt.claims', NULL, true);
END;
$$ LANGUAGE plpgsql;

SELECT * FROM runtests('public'::name, '^test_c4');

ROLLBACK;
