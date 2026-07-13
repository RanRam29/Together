-- Together Platform — WP9 Screenshot Protection Tests
-- Test file: supabase/tests/wp9_screenshot_test.sql

BEGIN;
SET search_path TO public, extensions;
SELECT plan(5);

-- Setup data
INSERT INTO auth.users (id, phone, aud, role, raw_user_meta_data, raw_app_meta_data) VALUES
  ('f9000000-0000-4000-8000-000000000a01', '0599999901', 'authenticated', 'authenticated', '{"role": "parent"}', '{}'),
  ('f9000000-0000-4000-8000-000000000a02', '0599999902', 'authenticated', 'authenticated', '{"role": "professional"}', '{}'),
  ('f9000000-0000-4000-8000-000000000a03', '0599999903', 'authenticated', 'authenticated', '{"role": "professional"}', '{}'),
  ('f9000000-0000-4000-8000-000000000a04', '0599999904', 'authenticated', 'authenticated', '{"role": "admin"}', '{"is_admin": true}');

UPDATE public.profiles SET role = 'admin' WHERE id = 'f9000000-0000-4000-8000-000000000a04';

INSERT INTO public.children (id, parent_id, first_name, age, category, functioning_level, framework, communication_verbal) 
VALUES ('f9000000-0000-4000-8000-0000000000c1', 'f9000000-0000-4000-8000-000000000a01', 'Child C', 5, 'autism', 2, 'regular_school', true);

INSERT INTO public.professionals (id, user_id, display_name, experience_years, specialties, bio)
VALUES 
  ('f9000000-0000-4000-8000-000000000b02', 'f9000000-0000-4000-8000-000000000a02', 'Prof 1', 5, '{"autism"}', 'Bio'),
  ('f9000000-0000-4000-8000-000000000b03', 'f9000000-0000-4000-8000-000000000a03', 'Prof 2', 2, '{"adhd"}', 'Bio');
  
INSERT INTO public.matches (child_id, professional_id, status) 
VALUES ('f9000000-0000-4000-8000-0000000000c1', 'f9000000-0000-4000-8000-000000000b02', 'active');

-- Test 1: Parent logs screenshot successfully
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f9000000-0000-4000-8000-000000000a01', 'role', 'authenticated')::text, true);

SELECT lives_ok(
  $$ SELECT public.log_screenshot_event('f9000000-0000-4000-8000-0000000000c1') $$,
  'Parent can log screenshot event'
);

-- Test 2: Professional with match logs screenshot successfully
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f9000000-0000-4000-8000-000000000a02', 'role', 'authenticated')::text, true);

SELECT lives_ok(
  $$ SELECT public.log_screenshot_event('f9000000-0000-4000-8000-0000000000c1') $$,
  'Matched professional can log screenshot event'
);

-- Test 3: Unauthorized professional gets permission denied exception
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f9000000-0000-4000-8000-000000000a03', 'role', 'authenticated')::text, true);

SELECT throws_ok(
  $$ SELECT public.log_screenshot_event('f9000000-0000-4000-8000-0000000000c1') $$,
  'P0001',
  'permission denied',
  'Unauthorized professional gets permission denied'
);

-- Test 4: Admin can log screenshot event
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f9000000-0000-4000-8000-000000000a04', 'role', 'authenticated', 'app_metadata', json_build_object('is_admin', true))::text, true);

SELECT lives_ok(
  $$ SELECT public.log_screenshot_event('f9000000-0000-4000-8000-0000000000c1') $$,
  'Admin can log screenshot event'
);

-- Verify records exist in audit_log
SET LOCAL ROLE postgres;
SELECT set_config('request.jwt.claims', '', true);

SELECT ok(
  (SELECT count(*) = 3 FROM public.audit_log WHERE resource_id = 'f9000000-0000-4000-8000-0000000000c1' AND action = 'screenshot_detected'),
  'Audit log contains exactly 3 screenshot events for the child'
);

SELECT * FROM finish();
ROLLBACK;
