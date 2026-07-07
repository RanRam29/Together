-- Together Platform — Security Overhaul Migration
-- Migration: 20260707111544_security_overhaul.sql
-- Addresses C1, C2, and C3 critical security findings by introducing View Tier 0, secure RPC details access with auditing, and RPC state machine for match requests.

-- ============================================================
-- 1. DROP INSECURE POLICIES & VIEWS
-- ============================================================
DROP POLICY IF EXISTS "children_tier0_public" ON children;
DROP POLICY IF EXISTS "child_details_tier2_read" ON child_details;
DROP POLICY IF EXISTS "child_details_tier3_read" ON child_details;
DROP POLICY IF EXISTS "match_requests_parent_update" ON match_requests;
DROP POLICY IF EXISTS "match_requests_professional_update" ON match_requests;

-- ============================================================
-- 2. CREATE TIER 0 CHILDREN VIEW (C2)
-- ============================================================
CREATE OR REPLACE VIEW public.children_tier0 AS
  SELECT
    c.id,
    c.first_name,
    c.age,
    c.category,
    c.secondary_category,
    c.framework,
    c.hours_needed,
    p.area AS area_general
  FROM public.children c
  JOIN public.profiles p ON p.id = c.parent_id
  WHERE c.published = true
    AND (
      get_user_role() = 'professional'
      OR get_user_role() = 'admin'
      OR c.parent_id = auth.uid()
    );

GRANT SELECT ON public.children_tier0 TO authenticated;

-- ============================================================
-- 3. RESTRICTED SELECT ON CHILDREN TABLE (C2)
-- ============================================================
-- Professionals can only query children table if they have active request or match (Tier >= 1)
CREATE POLICY "children_tier1_select"
  ON children FOR SELECT TO authenticated
  USING (
    get_tier_for_child(id) >= 1
    AND is_verified_professional()
  );

-- ============================================================
-- 4. SECURE CHILD DETAILS RPC WITH AUDITING (C3)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_child_details(p_child_id UUID)
RETURNS TABLE (
  id UUID,
  child_id UUID,
  full_name TEXT,
  diagnosis_full TEXT,
  what_works TEXT,
  what_triggers TEXT,
  gender_preference TEXT,
  parent_contact JSONB,
  win_definition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_tier INT;
BEGIN
  -- Calculate relationship tier
  v_tier := get_tier_for_child(p_child_id);

  -- Access control: Caller must be admin, child's parent, or a professional with tier >= 2
  IF v_tier < 2 AND get_user_role() != 'admin' AND NOT EXISTS (
    SELECT 1 FROM children WHERE children.id = p_child_id AND children.parent_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied. Relationship tier 2 or 3 required.';
  END IF;

  -- Log access if the actor is a professional
  IF get_user_role() = 'professional' THEN
    INSERT INTO audit_log (user_id, resource, resource_id, action, tier)
    VALUES (auth.uid(), 'child_details', p_child_id, 'view', v_tier);
  END IF;

  -- Return the details row
  RETURN QUERY
  SELECT
    cd.id,
    cd.child_id,
    cd.full_name,
    cd.diagnosis_full,
    cd.what_works,
    cd.what_triggers,
    cd.gender_preference,
    cd.parent_contact,
    cd.win_definition,
    cd.notes,
    cd.created_at,
    cd.updated_at
  FROM child_details cd
  WHERE cd.child_id = p_child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. MATCH REQUESTS STATE MACHINE RPCS (C1)
-- ============================================================

-- Professional responds to request (interested or rejected)
CREATE OR REPLACE FUNCTION public.respond_to_request(
  p_request_id UUID,
  p_status TEXT
)
RETURNS VOID AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Retrieve and lock request
  SELECT r.* INTO v_request
  FROM match_requests r
  JOIN professionals p ON p.id = r.professional_id
  WHERE r.id = p_request_id
  FOR UPDATE;

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  -- Verify ownership
  IF v_request.professional_id != get_professional_id() THEN
    RAISE EXCEPTION 'Not authorized to respond to this request';
  END IF;

  -- Validate state: only pending requests can be responded to
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is already in status: %', v_request.status;
  END IF;

  -- Validate input status
  IF p_status NOT IN ('interested', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status response. Must be interested or rejected';
  END IF;

  -- Update request status
  UPDATE match_requests
  SET status = p_status::match_status,
      updated_at = now()
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parent approves request (creates match atomically)
CREATE OR REPLACE FUNCTION public.approve_request(
  p_request_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_request RECORD;
  v_match_id UUID;
  v_score NUMERIC;
  v_reason TEXT;
BEGIN
  -- Retrieve request and lock, ensuring caller is the parent of the child
  SELECT r.* INTO v_request
  FROM match_requests r
  JOIN children c ON c.id = r.child_id
  WHERE r.id = p_request_id
    AND c.parent_id = auth.uid()
  FOR UPDATE;

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request not found or access denied';
  END IF;

  -- Validate state: can only approve if status is pending or interested
  IF v_request.status NOT IN ('pending', 'interested') THEN
    RAISE EXCEPTION 'Request cannot be approved from status: %', v_request.status;
  END IF;

  -- 1. Update request status to approved
  UPDATE match_requests
  SET status = 'approved',
      tier_reached = 2,
      updated_at = now()
  WHERE id = p_request_id;

  -- 2. Calculate score using DB matching engine
  SELECT s.score, s.match_reason
  INTO v_score, v_reason
  FROM calculate_match_score(v_request.child_id, v_request.professional_id) s;

  -- 3. Insert active match record (Tier 3)
  INSERT INTO matches (child_id, professional_id, request_id, score, match_reason, status)
  VALUES (v_request.child_id, v_request.professional_id, p_request_id, v_score, v_reason, 'active')
  RETURNING id INTO v_match_id;

  -- 4. Set final request tier to 3
  UPDATE match_requests
  SET tier_reached = 3
  WHERE id = p_request_id;

  RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parent rejects request
CREATE OR REPLACE FUNCTION public.reject_request(
  p_request_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE match_requests r
  SET status = 'rejected',
      updated_at = now()
  FROM children c
  WHERE r.id = p_request_id
    AND c.id = r.child_id
    AND c.parent_id = auth.uid()
    AND r.status IN ('pending', 'interested');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found, not active, or access denied';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parent withdraws request
CREATE OR REPLACE FUNCTION public.withdraw_request(
  p_request_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE match_requests r
  SET status = 'withdrawn',
      updated_at = now()
  FROM children c
  WHERE r.id = p_request_id
    AND c.id = r.child_id
    AND c.parent_id = auth.uid()
    AND r.status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found, not pending, or access denied';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
