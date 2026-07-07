-- Together Platform — Row Level Security Policies
-- Migration 002: TIER-based privacy model implemented in DB
-- Based on DEVELOPMENT_PLAN.md v2.0

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is a verified professional
CREATE OR REPLACE FUNCTION is_verified_professional()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM professionals
    WHERE user_id = auth.uid()
      AND verified = 'verified'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get professional ID for current user
CREATE OR REPLACE FUNCTION get_professional_id()
RETURNS UUID AS $$
  SELECT id FROM professionals WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if professional has an active match with a child
CREATE OR REPLACE FUNCTION has_active_match(p_child_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM matches
    WHERE child_id = p_child_id
      AND professional_id = get_professional_id()
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check the tier reached for a request between professional and child
CREATE OR REPLACE FUNCTION get_tier_for_child(p_child_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(
    -- Active match = TIER 3
    (SELECT 3 FROM matches
     WHERE child_id = p_child_id
       AND professional_id = get_professional_id()
       AND status = 'active'
     LIMIT 1),
    -- Approved request = TIER 2
    (SELECT 2 FROM match_requests
     WHERE child_id = p_child_id
       AND professional_id = get_professional_id()
       AND status = 'approved'
     LIMIT 1),
    -- Pending/interested request = TIER 1
    (SELECT 1 FROM match_requests
     WHERE child_id = p_child_id
       AND professional_id = get_professional_id()
       AND status IN ('pending', 'interested')
     LIMIT 1),
    -- No relationship = TIER 0
    0
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles_own_read"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "profiles_admin_read"
  ON profiles FOR SELECT
  USING (get_user_role() = 'admin');

-- ============================================================
-- CHILDREN POLICIES — TIER 0–1
-- ============================================================

-- Parent can CRUD their own children
CREATE POLICY "children_parent_all"
  ON children FOR ALL
  USING (parent_id = auth.uid());

-- TIER 0: Verified professionals can see published children
-- Only basic fields (enforced by SELECT query, not column-level RLS)
CREATE POLICY "children_tier0_public"
  ON children FOR SELECT
  USING (
    published = true
    AND is_verified_professional()
  );

-- Admin can see all children
CREATE POLICY "children_admin_read"
  ON children FOR SELECT
  USING (get_user_role() = 'admin');

-- ============================================================
-- CHILD_DETAILS POLICIES — TIER 2–3
-- ============================================================

-- Parent always has full access to their child's details
CREATE POLICY "child_details_parent_all"
  ON child_details FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_details.child_id
        AND children.parent_id = auth.uid()
    )
  );

-- TIER 2: Professional with approved request can read
CREATE POLICY "child_details_tier2_read"
  ON child_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM match_requests
      WHERE match_requests.child_id = child_details.child_id
        AND match_requests.professional_id = get_professional_id()
        AND match_requests.status = 'approved'
    )
  );

-- TIER 3: Professional with active match can read
CREATE POLICY "child_details_tier3_read"
  ON child_details FOR SELECT
  USING (has_active_match(child_details.child_id));

-- Admin can read all
CREATE POLICY "child_details_admin_read"
  ON child_details FOR SELECT
  USING (get_user_role() = 'admin');

-- ============================================================
-- PROFESSIONALS POLICIES
-- ============================================================

-- Professional can manage their own profile
CREATE POLICY "professionals_own_all"
  ON professionals FOR ALL
  USING (user_id = auth.uid());

-- Verified professionals are visible to parents
CREATE POLICY "professionals_public_read"
  ON professionals FOR SELECT
  USING (
    verified = 'verified'
    AND get_user_role() = 'parent'
  );

-- Other verified professionals can see each other (limited browse)
CREATE POLICY "professionals_peer_read"
  ON professionals FOR SELECT
  USING (
    verified = 'verified'
    AND is_verified_professional()
  );

-- Admin can manage all professionals
CREATE POLICY "professionals_admin_all"
  ON professionals FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- MATCH REQUESTS POLICIES
-- ============================================================

-- Parent can create requests for their children
CREATE POLICY "match_requests_parent_create"
  ON match_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = match_requests.child_id
        AND children.parent_id = auth.uid()
    )
  );

-- Parent can read/update requests for their children
CREATE POLICY "match_requests_parent_read"
  ON match_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = match_requests.child_id
        AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "match_requests_parent_update"
  ON match_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = match_requests.child_id
        AND children.parent_id = auth.uid()
    )
  );

-- Professional can read requests directed to them
CREATE POLICY "match_requests_professional_read"
  ON match_requests FOR SELECT
  USING (professional_id = get_professional_id());

-- Professional can update requests directed to them (respond)
CREATE POLICY "match_requests_professional_update"
  ON match_requests FOR UPDATE
  USING (professional_id = get_professional_id());

-- Professional can create requests (express interest — secondary channel)
CREATE POLICY "match_requests_professional_create"
  ON match_requests FOR INSERT
  WITH CHECK (
    professional_id = get_professional_id()
    AND is_verified_professional()
  );

-- Admin can read all
CREATE POLICY "match_requests_admin_read"
  ON match_requests FOR SELECT
  USING (get_user_role() = 'admin');

-- ============================================================
-- MATCHES POLICIES
-- ============================================================

-- Parent can read matches for their children
CREATE POLICY "matches_parent_read"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = matches.child_id
        AND children.parent_id = auth.uid()
    )
  );

-- Professional can read their own matches
CREATE POLICY "matches_professional_read"
  ON matches FOR SELECT
  USING (professional_id = get_professional_id());

-- Admin can manage all
CREATE POLICY "matches_admin_all"
  ON matches FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- CHECKINS POLICIES
-- ============================================================

-- Professional can create checkins for their active matches
CREATE POLICY "checkins_professional_create"
  ON checkins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = checkins.match_id
        AND matches.professional_id = get_professional_id()
        AND matches.status = 'active'
    )
  );

-- Parent and professional can read checkins for their matches
CREATE POLICY "checkins_parent_read"
  ON checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      JOIN children ON children.id = matches.child_id
      WHERE matches.id = checkins.match_id
        AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "checkins_professional_read"
  ON checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = checkins.match_id
        AND matches.professional_id = get_professional_id()
    )
  );

-- ============================================================
-- DAILY LOGS POLICIES
-- ============================================================

-- Professional can create/update logs for their active matches
CREATE POLICY "daily_logs_professional_write"
  ON daily_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = daily_logs.match_id
        AND matches.professional_id = get_professional_id()
        AND matches.status = 'active'
    )
  );

CREATE POLICY "daily_logs_professional_update"
  ON daily_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = daily_logs.match_id
        AND matches.professional_id = get_professional_id()
    )
  );

-- Parent can read logs for their children's matches
CREATE POLICY "daily_logs_parent_read"
  ON daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      JOIN children ON children.id = matches.child_id
      WHERE matches.id = daily_logs.match_id
        AND children.parent_id = auth.uid()
    )
  );

-- Professional can read their own logs
CREATE POLICY "daily_logs_professional_read"
  ON daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = daily_logs.match_id
        AND matches.professional_id = get_professional_id()
    )
  );

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================

-- Users can create reviews for matches they're part of (match must be ended)
CREATE POLICY "reviews_create"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = reviews.match_id
        AND matches.status = 'ended'
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

-- Reviews are readable by relevant parties
CREATE POLICY "reviews_read"
  ON reviews FOR SELECT
  USING (
    reviewer_id = auth.uid()
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

-- Parents can read reviews about professionals (for matching)
CREATE POLICY "reviews_parent_browse"
  ON reviews FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND reviewer_role = 'parent'  -- only parent reviews are public
  );

-- ============================================================
-- DOCUMENT UPLOADS POLICIES
-- ============================================================

-- Owner can manage their own documents
CREATE POLICY "documents_own_all"
  ON document_uploads FOR ALL
  USING (owner_id = auth.uid());

-- Admin can manage all documents
CREATE POLICY "documents_admin_all"
  ON document_uploads FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- AUDIT LOG POLICIES
-- ============================================================

-- Audit log is insert-only (no deletes/updates)
-- Service role inserts; users can read their own entries

CREATE POLICY "audit_own_read"
  ON audit_log FOR SELECT
  USING (user_id = auth.uid());

-- Parents can see who accessed their children's data
CREATE POLICY "audit_parent_read"
  ON audit_log FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND resource = 'child_details'
    AND resource_id IN (
      SELECT cd.id FROM child_details cd
      JOIN children c ON c.id = cd.child_id
      WHERE c.parent_id = auth.uid()
    )
  );

-- Admin can read all audit logs
CREATE POLICY "audit_admin_read"
  ON audit_log FOR SELECT
  USING (get_user_role() = 'admin');

-- ============================================================
-- AUDIT LOG TRIGGER — auto-log TIER 3 access
-- ============================================================

CREATE OR REPLACE FUNCTION log_tier3_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if accessed by a professional (not the parent)
  IF get_user_role() = 'professional' THEN
    INSERT INTO audit_log (user_id, resource, resource_id, action, tier)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, 'view', 3);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger fires on SELECT via a view or function
-- For direct table access, audit is handled in Edge Functions
