-- Admin set user email RPC tests
-- Run: npx supabase test db

BEGIN;
SET search_path TO public, extensions;
SELECT plan(6);

INSERT INTO auth.users (id, email, phone, encrypted_password, aud, role) VALUES
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701', 'admin-email@test.local', '0500000801', crypt('oldpass123', gen_salt('bf')), 'authenticated', 'authenticated'),
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', NULL, '0500000802', crypt('oldpass123', gen_salt('bf')), 'authenticated', 'authenticated'),
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d703', 'other-email@test.local', '0500000803', crypt('oldpass123', gen_salt('bf')), 'authenticated', 'authenticated');

UPDATE profiles SET role = 'admin', full_name = 'Admin Email', phone = '0500000801' WHERE id = 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701';
UPDATE profiles SET role = 'parent', full_name = 'Parent Email', phone = '0500000802' WHERE id = 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702';
UPDATE profiles SET role = 'parent', full_name = 'Other Parent', phone = '0500000803' WHERE id = 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d703';

SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'role', 'authenticated')::text,
  true
);

SELECT throws_ok(
  $$SELECT admin_set_user_email('e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'parent@test.local')$$,
  'Admin only',
  'Non-admin cannot set email'
);

SELECT set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701',
    'role', 'authenticated',
    'aal', 'aal2',
    'app_metadata', json_build_object('is_admin', true)
  )::text,
  true
);

SELECT throws_ok(
  $$SELECT admin_set_user_email('e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'bad-email')$$,
  'Invalid email address',
  'Invalid email rejected'
);

SELECT throws_ok(
  $$SELECT admin_set_user_email('e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'other-email@test.local')$$,
  'Email already in use',
  'Duplicate email rejected'
);

SELECT lives_ok(
  $$SELECT admin_set_user_email('e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'Parent.Email@test.local')$$,
  'Admin with MFA can set email'
);

SELECT is(
  (SELECT email FROM auth.users WHERE id = 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702'),
  'parent.email@test.local',
  'Email stored lowercase'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702'
      AND provider = 'email'
      AND provider_id = 'parent.email@test.local'
  ),
  'Email identity created'
);

SELECT * FROM finish();
ROLLBACK;
