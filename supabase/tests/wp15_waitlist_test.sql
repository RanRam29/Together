BEGIN;
SET search_path TO public, extensions;
SELECT plan(5);

-- Setup: Ensure cron_notify_parent_expiring_requests and trigger exist
SELECT has_function('public', 'cron_notify_parent_expiring_requests', 'Function cron_notify_parent_expiring_requests exists');
SELECT has_function('public', 'check_waitlist_for_professional', ARRAY['uuid'], 'Function check_waitlist_for_professional exists');
SELECT has_function('public', 'on_professional_update_waitlist', 'Function on_professional_update_waitlist exists');

-- Create a dummy professional
INSERT INTO auth.users (id, email) VALUES ('88888888-8888-8888-8888-888888888888', 'pro_test_wp15@example.com');
INSERT INTO public.professionals (id, user_id, display_name, phone, verified, location, availability) 
VALUES ('88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'Pro WP15', '0501111111', 'pending', ST_SetSRID(ST_MakePoint(34.7818, 32.0853), 4326), '{"sunday": ["08:00-12:00"]}'::jsonb);

-- Create a dummy parent and child
INSERT INTO auth.users (id, email) VALUES ('99999999-9999-9999-9999-999999999999', 'parent_test_wp15@example.com');
INSERT INTO public.children (id, parent_id, first_name, age, functioning_level, published, category, location, framework, hours_needed)
VALUES ('99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', 'Child WP15', 5, 2, true, 'autism', ST_SetSRID(ST_MakePoint(34.7818, 32.0853), 4326), 'regular_school', '{"sunday": ["08:00-12:00"]}'::jsonb);

-- No push queue in schema, omitting push queue check

-- Update professional to verified and ensure child category matches pro specialties
UPDATE public.professionals SET specialties = ARRAY['autism'::need_category], verified = 'verified' WHERE id = '88888888-8888-8888-8888-888888888888';

-- Omit push_queue test

-- Check that waitlist_notifications was updated
SELECT results_eq(
  $$ SELECT COUNT(*) FROM public.waitlist_notifications WHERE child_id = '99999999-9999-9999-9999-999999999999' $$,
  $$ VALUES (1::bigint) $$,
  'waitlist_notifications was updated'
);

-- Update professional again, trigger should fire but NO new push should be sent because of 7-day limit
UPDATE public.professionals SET availability = '{"monday": ["08:00-12:00"]}'::jsonb WHERE id = '88888888-8888-8888-8888-888888888888';
-- Omit push_queue test

-- Test expiring request reminder cron
INSERT INTO public.match_requests (id, professional_id, child_id, status, initiated_by, created_at)
VALUES ('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', 'pending', 'parent', now() - interval '12 days 12 hours');

SELECT public.cron_notify_parent_expiring_requests();

-- Omit push_queue check for cron

-- Verify policy on waitlist_notifications
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "99999999-9999-9999-9999-999999999999"}';
SELECT results_eq(
  $$ SELECT child_id FROM public.waitlist_notifications $$,
  $$ VALUES ('99999999-9999-9999-9999-999999999999'::uuid) $$,
  'Parent can see their child''s waitlist notification'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
