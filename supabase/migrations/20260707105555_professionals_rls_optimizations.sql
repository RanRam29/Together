-- Together Platform — Professionals RLS Optimizations
-- Migration: 20260707105555_professionals_rls_optimizations.sql
-- Optimizes ALL and SELECT policies on professionals table to resolve multiple permissive policies linter warnings.

-- ============================================================
-- DROP OLD POLICIES
-- ============================================================
DROP POLICY IF EXISTS "professionals_own_all" ON professionals;
DROP POLICY IF EXISTS "professionals_admin_all" ON professionals;
DROP POLICY IF EXISTS "professionals_public_read" ON professionals;
DROP POLICY IF EXISTS "professionals_peer_read" ON professionals;

-- ============================================================
-- CREATE OPTIMIZED MERGED POLICIES
-- ============================================================

-- Merged manage policy (covers ALL operations for owners and admins)
CREATE POLICY "professionals_manage_all"
  ON professionals FOR ALL
  USING (
    user_id = auth.uid()
    OR get_user_role() = 'admin'
  );

-- Merged read policy (covers public/peer SELECT for verified professionals)
CREATE POLICY "professionals_read_all"
  ON professionals FOR SELECT
  USING (
    verified = 'verified'
    AND (
      get_user_role() = 'parent'
      OR is_verified_professional()
    )
  );
