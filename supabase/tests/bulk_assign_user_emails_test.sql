-- Backfill user emails from phone
-- Run: npx supabase test db

BEGIN;
SET search_path TO public, extensions;
SELECT plan(5);

INSERT INTO auth.users (instance_id, id, aud, role, email, phone, encrypted_password, phone_confirmed_at, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000000', 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701', 'authenticated', 'authenticated', NULL, '972502222222', crypt('pass123456', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'authenticated', 'authenticated', 'existing@test.local', '0500000902', crypt('pass123456', gen_salt('bf')), now(), now(), now());

UPDATE profiles SET role = 'parent', full_name = 'Backfill Parent', phone = '972502222222'
WHERE id = 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701';
UPDATE profiles SET role = 'parent', full_name = 'Existing Email', phone = '0500000902'
WHERE id = 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702';

SELECT ok(
  public.backfill_user_emails_from_phone() >= 2,
  'Backfill updates users missing email or identity'
);

SELECT is(
  (SELECT email FROM auth.users WHERE id = 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701'),
  '972502222222@together.test',
  'Phone-only user gets phone-based email'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd38d701'
      AND provider = 'email'
      AND provider_id = '972502222222@together.test'
  ),
  'Email identity created for phone-only user'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd38d702'
      AND provider = 'email'
      AND provider_id = 'existing@test.local'
  ),
  'Existing-email user gets missing identity backfilled'
);

SELECT is(
  public.backfill_user_emails_from_phone(),
  0,
  'Second run is idempotent (no further changes)'
);

SELECT * FROM finish();
ROLLBACK;
