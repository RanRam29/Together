-- Together Platform — WP8 Field Visibility Tests
-- Test file: supabase/tests/wp8_field_visibility_test.sql

BEGIN;
SET search_path TO public, extensions;
SELECT plan(13);

GRANT SELECT ON public.children TO authenticated;
GRANT SELECT ON public.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_field_visibility TO authenticated;

-- Setup data
INSERT INTO auth.users (id, phone, aud, role, raw_user_meta_data) VALUES
  ('f8000000-0000-4000-8000-000000000a01', '0588888801', 'authenticated', 'authenticated', '{"role": "parent"}'),
  ('f8000000-0000-4000-8000-000000000a02', '0588888802', 'authenticated', 'authenticated', '{"role": "professional"}'),
  ('f8000000-0000-4000-8000-000000000a03', '0588888803', 'authenticated', 'authenticated', '{"role": "professional"}'),
  ('f8000000-0000-4000-8000-000000000a04', '0588888804', 'authenticated', 'authenticated', '{"role": "parent"}'),
  ('f8000000-0000-4000-8000-000000000a05', '0588888805', 'authenticated', 'authenticated', '{"role": "admin"}');

UPDATE public.profiles SET role = 'admin' WHERE id = 'f8000000-0000-4000-8000-000000000a05';

DO $$ 
DECLARE
  v_child_id uuid;
  v_prof1_id uuid;
  v_prof2_id uuid;
BEGIN
  INSERT INTO public.children (parent_id, first_name, age, category, functioning_level, framework, communication_verbal) 
  VALUES ('f8000000-0000-4000-8000-000000000a01', 'Child B', 5, 'autism', 2, 'regular_school', true) RETURNING id INTO v_child_id;
  
  INSERT INTO public.child_details (child_id, full_name, diagnosis_full, what_works, win_definition)
  VALUES (v_child_id, 'Child B Full', 'Autism Spectrum', 'Routine', 'Smile') ON CONFLICT DO NOTHING;
  
  INSERT INTO public.professionals (user_id, verified, display_name) VALUES ('f8000000-0000-4000-8000-000000000a02', 'verified', 'Prof B1') RETURNING id INTO v_prof1_id;
  INSERT INTO public.professionals (user_id, verified, display_name) VALUES ('f8000000-0000-4000-8000-000000000a03', 'verified', 'Prof B2') RETURNING id INTO v_prof2_id;
  
  INSERT INTO public.matches (child_id, professional_id, status) VALUES (v_child_id, v_prof1_id, 'active');
  INSERT INTO public.matches (child_id, professional_id, status) VALUES (v_child_id, v_prof2_id, 'active');

  PERFORM set_config('my.child_id', v_child_id::text, true);
  PERFORM set_config('my.prof1_id', v_prof1_id::text, true);
  PERFORM set_config('my.prof2_id', v_prof2_id::text, true);
END $$;


-- 1. Default behavior (all fields visible to a TIER 2/3 professional)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a02', 'role', 'authenticated')::text, true);

SELECT results_eq(
  format('SELECT diagnosis_full FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES ('Autism Spectrum') $$,
  'Professional 1 sees diagnosis_full by default'
);

-- 5. Professional cannot query child_field_visibility directly (RLS returns 0 rows)
SELECT is_empty(
  'SELECT * FROM public.child_field_visibility',
  'Professional cannot query child_field_visibility table directly (RLS blocks all rows)'
);


-- Hide diagnosis_full for Prof 1 (as Parent)
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a01', 'role', 'authenticated')::text, true);
SELECT public.set_child_field_visibility(current_setting('my.child_id')::uuid, current_setting('my.prof1_id')::uuid, ARRAY['diagnosis_full']);

-- 2. Masking behavior for Prof 1
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a02', 'role', 'authenticated')::text, true);
SELECT results_eq(
  format('SELECT diagnosis_full FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES (NULL::text) $$,
  'Professional 1 sees diagnosis_full as NULL after it is hidden'
);

SELECT results_eq(
  format('SELECT what_works FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES ('Routine') $$,
  'Professional 1 still sees what_works'
);

-- 3. Isolation: Prof 2 is not affected
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a03', 'role', 'authenticated')::text, true);
SELECT results_eq(
  format('SELECT diagnosis_full FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES ('Autism Spectrum') $$,
  'Professional 2 still sees diagnosis_full (not affected by Prof 1 settings)'
);


-- 4. Unrestricted access for parents and admins
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a01', 'role', 'authenticated')::text, true);
SELECT results_eq(
  format('SELECT diagnosis_full FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES ('Autism Spectrum') $$,
  'Parent sees diagnosis_full even if hidden'
);

SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a05', 'role', 'authenticated', 'app_metadata', json_build_object('is_admin', true))::text, true);
SELECT results_eq(
  format('SELECT diagnosis_full FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES ('Autism Spectrum') $$,
  'Admin sees diagnosis_full even if hidden'
);


-- 6. Validation errors
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a01', 'role', 'authenticated')::text, true);

SELECT throws_ok(
  format('SELECT public.set_child_field_visibility(%L::uuid, %L::uuid, ARRAY[''invalid_field''])', current_setting('my.child_id'), current_setting('my.prof1_id')),
  'Invalid field name: invalid_field',
  'Setting visibility fails for invalid field name'
);

SELECT throws_ok(
  format('SELECT public.set_child_field_visibility(%L::uuid, %L::uuid, ARRAY[''full_name''])', current_setting('my.child_id'), current_setting('my.prof1_id')),
  'Invalid field name: full_name',
  'Setting visibility fails for non-hideable field (full_name)'
);

SELECT throws_ok(
  format('SELECT public.set_child_field_visibility(%L::uuid, %L::uuid, ARRAY[''diagnosis_full''])', current_setting('my.child_id'), 'f8000000-0000-4000-8000-000000000a02'::uuid),
  'Cannot set visibility for a professional without an active or paused match',
  'Cannot set visibility if match does not exist'
);

-- Unauthorized parent
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a04', 'role', 'authenticated')::text, true);
SELECT throws_ok(
  format('SELECT public.set_child_field_visibility(%L::uuid, %L::uuid, ARRAY[''diagnosis_full''])', current_setting('my.child_id'), current_setting('my.prof1_id')),
  'Not authorized to manage visibility for this child',
  'Random parent cannot manage visibility'
);


-- 7. "Pause access" simulation
SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a01', 'role', 'authenticated')::text, true);
SELECT public.set_child_field_visibility(
  current_setting('my.child_id')::uuid, 
  current_setting('my.prof1_id')::uuid, 
  ARRAY['diagnosis_full', 'what_works', 'what_triggers', 'gender_preference', 'parent_contact', 'win_definition', 'notes']
);

SELECT set_config('request.jwt.claims', json_build_object('sub', 'f8000000-0000-4000-8000-000000000a02', 'role', 'authenticated')::text, true);

SELECT results_eq(
  format('SELECT diagnosis_full, what_works, win_definition FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES (NULL::text, NULL::text, NULL::text) $$,
  'Pause access masks all hideable fields'
);

SELECT results_eq(
  format('SELECT full_name FROM public.get_child_details(%L::uuid)', current_setting('my.child_id')),
  $$ VALUES ('Child B Full') $$,
  'Pause access keeps full_name intact'
);


SELECT * FROM finish();
ROLLBACK;
