-- Together Platform — v3 Hardening Tests
-- Test file: supabase/tests/v3_hardening_test.sql

BEGIN;
SET search_path TO public, extensions;
SELECT plan(5);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_hides TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_days_off TO authenticated, anon;
GRANT SELECT ON public.children TO authenticated;
GRANT SELECT ON public.matches TO authenticated;

-- 1. export_system_data should be dropped
SELECT is(
  (SELECT count(*)::int FROM pg_proc JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace WHERE proname = 'export_system_data' AND nspname = 'public'),
  0,
  'export_system_data() function should be dropped'
);

-- Setup data
INSERT INTO auth.users (id, phone, aud, role, raw_user_meta_data) VALUES
  ('f1000000-0000-4000-8000-000000000a01', '0599999901', 'authenticated', 'authenticated', '{"role": "parent"}'),
  ('f1000000-0000-4000-8000-000000000a02', '0599999902', 'authenticated', 'authenticated', '{"role": "professional"}'),
  ('f1000000-0000-4000-8000-000000000a03', '0599999903', 'authenticated', 'authenticated', '{"role": "parent"}'),
  ('f1000000-0000-4000-8000-000000000a04', '0599999904', 'authenticated', 'authenticated', '{"role": "admin"}');

UPDATE public.profiles SET role = 'admin' WHERE id = 'f1000000-0000-4000-8000-000000000a04';

DO $$ 
DECLARE
  v_child_id uuid;
  v_prof_id uuid;
  v_match_id uuid;
BEGIN
  INSERT INTO public.children (parent_id, first_name, age, category, functioning_level, framework, communication_verbal) VALUES ('f1000000-0000-4000-8000-000000000a01', 'Child A', 5, 'autism', 2, 'regular_school', true) RETURNING id INTO v_child_id;
  
  INSERT INTO public.professionals (user_id, verified, display_name) VALUES ('f1000000-0000-4000-8000-000000000a02', 'pending', 'Prof A') RETURNING id INTO v_prof_id;
  UPDATE public.professionals SET verified = 'verified' WHERE id = v_prof_id;
  
  INSERT INTO public.matches (child_id, professional_id, status) VALUES (v_child_id, v_prof_id, 'active') RETURNING id INTO v_match_id;

  INSERT INTO public.match_hides (hider_id, hidden_user_id) VALUES ('f1000000-0000-4000-8000-000000000a01', 'f1000000-0000-4000-8000-000000000a02');
  INSERT INTO public.match_hides (hider_id, hidden_user_id) VALUES ('f1000000-0000-4000-8000-000000000a02', 'f1000000-0000-4000-8000-000000000a03');

  INSERT INTO public.checkins (match_id, location, created_at) 
  VALUES (v_match_id, 'POINT(34.78 32.08)', now() - interval '4 days');
  
  PERFORM set_config('my.match_id', v_match_id::text, true);
END $$;

-- 2. match_hides policy
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f1000000-0000-4000-8000-000000000a01', 'role', 'authenticated')::text, true);

SELECT is(
  (SELECT count(*)::int FROM public.match_hides),
  1,
  'match_hides RLS: parent should only see 1 hide (their own)'
);

-- 3. mark_day_off only participant
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f1000000-0000-4000-8000-000000000a03', 'role', 'authenticated')::text, true);

SELECT throws_ok(
  format('SELECT public.mark_day_off(%L::uuid, current_date)', current_setting('my.match_id')),
  'Not authorized to mark days off for this match',
  'mark_day_off: random user cannot mark day off'
);

SELECT set_config('request.jwt.claims', json_build_object('sub', 'f1000000-0000-4000-8000-000000000a01', 'role', 'authenticated')::text, true);
SELECT public.mark_day_off(current_setting('my.match_id')::uuid, current_date);

SELECT is(
  (SELECT count(*)::int FROM public.match_days_off),
  1,
  'mark_day_off: participant can successfully mark day off'
);

-- 4. Exclude days off from alerts
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f1000000-0000-4000-8000-000000000a04', 'role', 'authenticated', 'app_metadata', json_build_object('is_admin', true))::text, true);

SELECT is(
  (SELECT count(*)::int FROM public.get_live_ops_alerts() WHERE alert_type = 'INACTIVE_MATCH'),
  0,
  'get_live_ops_alerts: active match with recent day off is NOT flagged as INACTIVE_MATCH'
);

SELECT * FROM finish();
ROLLBACK;
