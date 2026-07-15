-- PostGIS creates spatial_ref_sys in public; Supabase Security Advisor flags missing RLS.
-- The table is owned by supabase_admin, so RLS cannot be enabled from migrations.
-- Revoke API role access where permitted (best-effort mitigation on local/dev).

REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon, authenticated, PUBLIC;
