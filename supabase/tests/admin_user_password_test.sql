-- Admin user login + password RPC tests
-- Run: npx supabase test db

BEGIN;
SET search_path TO public, extensions;
SELECT plan(5);

INSERT INTO auth.users (id, email, phone, encrypted_password, aud, role) VALUES
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701', 'admin-pw@test.local', '0500000701', crypt('oldpass123', gen_salt('bf')), 'authenticated', 'authenticated'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'parent-pw@test.local', '0500000702', crypt('oldpass123', gen_salt('bf')), 'authenticated', 'authenticated');

UPDATE profiles SET role = 'admin', full_name = 'Admin PW', phone = '0500000701' WHERE id = 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701';
UPDATE profiles SET role = 'parent', full_name = 'Parent PW', phone = '0500000702' WHERE id = 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702';

SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'role', 'authenticated')::text,
  true
);

SELECT throws_ok(
  $$SELECT admin_get_user_login('d1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702')$$,
  'Admin only',
  'Non-admin cannot read login info'
);

SELECT set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701',
    'role', 'authenticated',
    'aal', 'aal2',
    'app_metadata', json_build_object('is_admin', true)
  )::text,
  true
);

SELECT is(
  admin_get_user_login('d1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702')->>'username',
  'parent-pw@test.local',
  'Admin reads email as username'
);

SELECT throws_ok(
  $$SELECT admin_set_user_password('d1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'short')$$,
  'Password must be at least 8 characters',
  'Short password rejected'
);

SELECT lives_ok(
  $$SELECT admin_set_user_password('d1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'newpass123')$$,
  'Admin with MFA can set password'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM audit_log
    WHERE user_id = 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701'
      AND resource = 'auth'
      AND resource_id = 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702'
      AND action = 'admin_set_user_password'
  ),
  'Password change is audited'
);

SELECT * FROM finish();
ROLLBACK;
