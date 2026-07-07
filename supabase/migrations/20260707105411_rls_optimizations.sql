-- Together Platform — RLS Optimizations Migration
-- Migration: 20260707105411_rls_optimizations.sql
-- Optimizes SELECT policies on profiles and reviews tables to resolve multiple permissive policies warnings.

-- ============================================================
-- 1. OPTIMIZE PROFILES SELECT POLICIES
-- ============================================================
DROP POLICY IF EXISTS "profiles_own_read" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;

CREATE POLICY "profiles_read_all"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR get_user_role() = 'admin'
  );

-- ============================================================
-- 2. OPTIMIZE REVIEWS SELECT POLICIES
-- ============================================================
DROP POLICY IF EXISTS "reviews_read" ON reviews;
DROP POLICY IF EXISTS "reviews_parent_browse" ON reviews;

CREATE POLICY "reviews_select"
  ON reviews FOR SELECT
  USING (
    reviewer_id = auth.uid()
    OR (get_user_role() = 'parent' AND reviewer_role = 'parent')
    OR EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = reviews.match_id
        AND (
          matches.professional_id = get_professional_id()
          OR EXISTS (
            SELECT 1 FROM children
            WHERE children.id = matches.child_id
              AND children.parent_id = auth.uid()
          )
        )
    )
  );
