-- Together Platform — Security Advisor Fixes Tests (2026-07-15)
-- Verifies security_invoker views and spatial_ref_sys RLS.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SET search_path TO public, extensions;

SELECT plan(4);

-- 1–2: flagged views must run as security invoker
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'children_tier0'
      AND c.relkind = 'v'
      AND 'security_invoker=true' = ANY (c.reloptions)
  ),
  'children_tier0 is a security_invoker view'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'view_parent_funnel'
      AND c.relkind = 'v'
      AND 'security_invoker=true' = ANY (c.reloptions)
  ),
  'view_parent_funnel is a security_invoker view'
);

-- 3: PostGIS reference table is not exposed without protection
SELECT ok(
  (
    NOT has_table_privilege('authenticated', 'public.spatial_ref_sys', 'SELECT')
    AND NOT has_table_privilege('anon', 'public.spatial_ref_sys', 'SELECT')
  )
  OR (
    SELECT c.relrowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'spatial_ref_sys'
  ),
  'spatial_ref_sys is not publicly exposed without protection'
);

-- 4: tier-0 view still omits sensitive child columns
SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'children_tier0'
      AND column_name IN ('location', 'needs', 'functioning_level')
  ),
  'children_tier0 does not expose sensitive child columns'
);

SELECT * FROM finish();
ROLLBACK;
