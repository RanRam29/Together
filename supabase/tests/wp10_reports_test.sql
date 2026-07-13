-- WP10 Admin Reports tests
-- Run: npx supabase test db

BEGIN;
SET search_path TO public, extensions;
SELECT plan(10);

-- Create some users for testing
INSERT INTO auth.users (id, email, phone, encrypted_password, aud, role) VALUES
  ('f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d701', 'admin-rep@test.local', '0500000801', crypt('pass123', gen_salt('bf')), 'authenticated', 'authenticated'),
  ('f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'parent-rep@test.local', '0500000802', crypt('pass123', gen_salt('bf')), 'authenticated', 'authenticated');

UPDATE profiles SET role = 'admin', full_name = 'Admin Rep', phone = '0500000801' WHERE id = 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d701';
UPDATE profiles SET role = 'parent', full_name = 'Parent Rep', phone = '0500000802' WHERE id = 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d702';

-- 1. Non-admin should be rejected
SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d702', 'role', 'authenticated')::text,
  true
);

SELECT throws_ok(
  $$SELECT admin_report_overview()$$,
  'Access denied',
  'Non-admin cannot run reports'
);

-- 2. Admin without MFA should be rejected
SELECT set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d701',
    'role', 'authenticated',
    'aal', 'aal1',
    'app_metadata', json_build_object('is_admin', true)
  )::text,
  true
);

SELECT throws_ok(
  $$SELECT admin_report_overview()$$,
  'Access denied: Requires MFA (AAL2)',
  'Admin without MFA cannot run reports'
);

-- 3. Admin with MFA
SELECT set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d701',
    'role', 'authenticated',
    'aal', 'aal2',
    'app_metadata', json_build_object('is_admin', true)
  )::text,
  true
);

-- Test Overview
SELECT lives_ok(
  $$SELECT admin_report_overview()$$,
  'Admin with MFA can run overview report'
);

-- Test Timeseries Valid
SELECT lives_ok(
  $$SELECT * FROM admin_report_timeseries('new_users', now()::date - 7, now()::date)$$,
  'Admin can run timeseries for valid metric'
);

-- Test Timeseries Invalid Metric
SELECT throws_ok(
  $$SELECT * FROM admin_report_timeseries('invalid_metric', now()::date - 7, now()::date)$$,
  'Invalid metric: invalid_metric',
  'Timeseries throws on invalid metric'
);

-- Test Timeseries Invalid Date
SELECT throws_ok(
  $$SELECT * FROM admin_report_timeseries('new_users', now()::date, now()::date - 7)$$,
  'Invalid date range: p_from must be <= p_to',
  'Timeseries throws on inverted date range'
);

-- Test Funnel
SELECT lives_ok(
  $$SELECT admin_report_funnel(now()::date - 30, now()::date)$$,
  'Admin can run funnel report'
);

-- Test Verification SLA
SELECT lives_ok(
  $$SELECT * FROM admin_report_verification_sla()$$,
  'Admin can run SLA report'
);

-- Test Anti-leakage (No PII)
-- Insert some distinct PII that we can check for
UPDATE profiles SET full_name = 'SECRET_NAME_LEAK', phone = '0599999999' WHERE id = 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd38d702';

SELECT ok(
  (SELECT admin_report_overview()::text) NOT LIKE '%SECRET_NAME_LEAK%' AND
  (SELECT admin_report_overview()::text) NOT LIKE '%0599999999%',
  'Overview report does not leak PII'
);

SELECT ok(
  (SELECT admin_report_funnel(now()::date - 30, now()::date)::text) NOT LIKE '%SECRET_NAME_LEAK%' AND
  (SELECT admin_report_funnel(now()::date - 30, now()::date)::text) NOT LIKE '%0599999999%',
  'Funnel report does not leak PII'
);

SELECT * FROM finish();
ROLLBACK;
