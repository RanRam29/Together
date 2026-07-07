-- Together Platform — C4 Fix: Prevent admin privilege escalation
-- Migration: 20260707120000_c4_protect_profile_role.sql
--
-- Closes ARCHITECTURE_REVIEW finding C4: the `profiles_own_update` policy allowed a user
-- to UPDATE their own row without column restrictions, so any authenticated user could run
--   UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
-- and gain full access to every child's medical file and every professional's ID / criminal-record documents.
--
-- Fix: a BEFORE UPDATE trigger freezes `role` and `id` for end-user (authenticated) requests.
-- Role changes remain possible for the backend (service_role) and for migrations/seed (no JWT context),
-- so signup (handle_new_user), admin RPCs, and data loading keep working.

-- ============================================================
-- 1. TRIGGER — freeze role & id for authenticated end users
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only end-user requests carry the 'authenticated' role claim.
  -- service_role (backend / admin_* RPCs) and superuser (migrations, seed) are exempt,
  -- so those legitimate paths can still set role.
  IF auth.role() = 'authenticated' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Changing role is not allowed';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Changing profile id is not allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_immutable ON public.profiles;
CREATE TRIGGER trg_protect_profile_immutable
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_immutable_fields();

-- ============================================================
-- 2. HARDENED ADMIN CHECK (defense-in-depth)
-- ============================================================
-- Verifies admin via BOTH the profiles table AND the JWT app_metadata claim,
-- which end users cannot edit. Admin accounts are created manually with
-- app_metadata.is_admin = true (see docs/AUTH-SPEC.md §4).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT
    get_user_role() = 'admin'
    AND COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================
-- 3. HARDEN STORAGE ADMIN ACCESS TO DOCUMENTS (most sensitive asset)
-- ============================================================
-- Even with the trigger closing the escalation, require the hardened check
-- on the documents bucket so a future gap cannot expose ID / criminal-record files.
DROP POLICY IF EXISTS "Allow admins to view all documents" ON storage.objects;
CREATE POLICY "Allow admins to view all documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
  );
