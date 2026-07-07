-- Together Platform — Core Functions
-- Migration 003: Matching engine, check-in verification, utilities
-- Based on DEVELOPMENT_PLAN.md v2.0

-- ============================================================
-- MATCHING ENGINE — get_matches_for_child()
-- ============================================================
-- Two-layer matching:
--   Layer 1: Hard filters (disqualify)
--   Layer 2: Soft scoring (rank 0–100)
-- Returns top N candidates with match explanation

CREATE OR REPLACE FUNCTION get_matches_for_child(
  p_child_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  professional_id UUID,
  display_name TEXT,
  bio TEXT,
  specialties need_category[],
  experience_years INTEGER,
  rating_avg NUMERIC,
  rating_count INTEGER,
  distance_km NUMERIC,
  score NUMERIC,
  match_reason TEXT
) AS $$
DECLARE
  v_child RECORD;
BEGIN
  -- Get child info
  SELECT
    c.category,
    c.secondary_category,
    c.functioning_level,
    c.framework,
    c.communication_verbal,
    c.hours_needed,
    c.location,
    c.needs
  INTO v_child
  FROM children c
  WHERE c.id = p_child_id
    AND c.parent_id = auth.uid();  -- Security: only parent can request

  IF v_child IS NULL THEN
    RAISE EXCEPTION 'Child not found or access denied';
  END IF;

  RETURN QUERY
  WITH filtered_professionals AS (
    -- ============================================
    -- LAYER 1: HARD FILTERS — disqualify
    -- ============================================
    SELECT
      p.id,
      p.display_name,
      p.bio,
      p.specialties,
      p.experience_years,
      p.rating_avg,
      p.rating_count,
      p.location AS pro_location,
      p.availability,
      p.languages,
      p.framework_types,
      -- Calculate distance in km
      ROUND(
        ST_Distance(
          p.location::geography,
          v_child.location::geography
        ) / 1000.0, 1
      ) AS dist_km
    FROM professionals p
    WHERE
      -- Must be verified
      p.verified = 'verified'
      -- Geographic radius (professional's max radius OR default 15km)
      AND ST_DWithin(
        p.location::geography,
        v_child.location::geography,
        COALESCE(p.max_radius_km, 15) * 1000.0  -- convert km to meters
      )
      -- Framework type match
      AND (
        p.framework_types = '{}' -- empty = accepts all
        OR v_child.framework = ANY(p.framework_types)
      )
      -- Not already in an active match or pending request with this child
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE m.professional_id = p.id
          AND m.child_id = p_child_id
          AND m.status = 'active'
      )
      AND NOT EXISTS (
        SELECT 1 FROM match_requests mr
        WHERE mr.professional_id = p.id
          AND mr.child_id = p_child_id
          AND mr.status IN ('pending', 'interested')
      )
  ),
  scored_professionals AS (
    -- ============================================
    -- LAYER 2: SOFT SCORING — rank 0–100
    -- ============================================
    SELECT
      fp.*,
      (
        -- Diagnosis experience (×3, max 30)
        CASE
          WHEN v_child.category = ANY(fp.specialties) THEN 30
          WHEN v_child.secondary_category IS NOT NULL
               AND v_child.secondary_category = ANY(fp.specialties) THEN 15
          ELSE 0
        END
        -- Certifications / experience (×2, max 20)
        + LEAST(COALESCE(fp.experience_years, 0) * 2, 20)
        -- Rating (×2, max 20)
        + CASE
            WHEN fp.rating_count >= 3 THEN ROUND(fp.rating_avg * 4, 0)  -- 5.0 → 20
            ELSE 5  -- new professional gets baseline
          END
        -- Geographic proximity (×1, max 15)
        + CASE
            WHEN fp.dist_km <= 2 THEN 15
            WHEN fp.dist_km <= 5 THEN 12
            WHEN fp.dist_km <= 10 THEN 8
            WHEN fp.dist_km <= 15 THEN 4
            ELSE 0
          END
        -- Platform tenure (×1, max 15)
        + LEAST(
            EXTRACT(MONTH FROM age(now(), (
              SELECT created_at FROM profiles WHERE id = fp.id
            ))) * 1.5,
            15
          )
      )::NUMERIC AS total_score
    FROM filtered_professionals fp
  )
  SELECT
    sp.id AS professional_id,
    sp.display_name,
    sp.bio,
    sp.specialties,
    sp.experience_years,
    sp.rating_avg,
    sp.rating_count,
    sp.dist_km AS distance_km,
    sp.total_score AS score,
    -- Build match explanation
    CONCAT_WS(' · ',
      CASE WHEN v_child.category = ANY(sp.specialties)
           THEN 'ניסיון עם ' || v_child.category::TEXT
           ELSE NULL END,
      CASE WHEN sp.experience_years >= 3
           THEN sp.experience_years || ' שנות ניסיון'
           ELSE NULL END,
      CASE WHEN sp.rating_count >= 3
           THEN 'דירוג ' || ROUND(sp.rating_avg, 1) || '/5'
           ELSE NULL END,
      sp.dist_km || ' ק"מ'
    ) AS match_reason
  FROM scored_professionals sp
  ORDER BY sp.total_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CALCULATE MATCH SCORE — for a specific pair
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_match_score(
  p_child_id UUID,
  p_professional_id UUID
)
RETURNS TABLE (
  score NUMERIC,
  match_reason TEXT
) AS $$
  SELECT score, match_reason
  FROM get_matches_for_child(p_child_id, 100)
  WHERE professional_id = p_professional_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- CHECK-IN VERIFICATION — geofence validation
-- ============================================================

CREATE OR REPLACE FUNCTION verify_checkin(
  p_match_id UUID,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_geofence_radius_m INTEGER DEFAULT 100  -- ±100m
)
RETURNS TABLE (
  checkin_id UUID,
  is_valid BOOLEAN,
  distance_m NUMERIC
) AS $$
DECLARE
  v_framework_location geography;
  v_checkin_point geography;
  v_distance NUMERIC;
  v_is_valid BOOLEAN;
  v_checkin_id UUID;
BEGIN
  -- Get the framework location from the child's profile
  SELECT c.location INTO v_framework_location
  FROM matches m
  JOIN children c ON c.id = m.child_id
  WHERE m.id = p_match_id
    AND m.professional_id = get_professional_id()
    AND m.status = 'active';

  IF v_framework_location IS NULL THEN
    RAISE EXCEPTION 'Match not found, not active, or access denied';
  END IF;

  -- Create point from provided coordinates
  v_checkin_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;

  -- Calculate distance
  v_distance := ROUND(ST_Distance(v_checkin_point, v_framework_location), 1);

  -- Validate within geofence
  v_is_valid := v_distance <= p_geofence_radius_m;

  -- Insert checkin record
  INSERT INTO checkins (match_id, location, is_valid)
  VALUES (p_match_id, v_checkin_point, v_is_valid)
  RETURNING id INTO v_checkin_id;

  RETURN QUERY SELECT v_checkin_id, v_is_valid, v_distance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- UPDATE PROFESSIONAL RATING — after new review
-- ============================================================

CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professionals
  SET
    rating_avg = (
      SELECT AVG((reliability + professionalism + child_fit) / 3.0)
      FROM reviews r
      JOIN matches m ON m.id = r.match_id
      WHERE m.professional_id = professionals.id
        AND r.reviewer_role = 'parent'
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews r
      JOIN matches m ON m.id = r.match_id
      WHERE m.professional_id = professionals.id
        AND r.reviewer_role = 'parent'
    )
  WHERE id = (
    SELECT m.professional_id
    FROM matches m
    WHERE m.id = NEW.match_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  WHEN (NEW.reviewer_role = 'parent')
  EXECUTE FUNCTION update_professional_rating();

-- ============================================================
-- TIER TRANSITION — auto-update tier on request status change
-- ============================================================

CREATE OR REPLACE FUNCTION update_tier_on_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Update tier_reached based on status
  NEW.tier_reached := CASE NEW.status
    WHEN 'pending' THEN 1
    WHEN 'interested' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 0
    WHEN 'expired' THEN 0
    WHEN 'withdrawn' THEN 0
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tier_transition
  BEFORE UPDATE OF status ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_tier_on_request();

-- ============================================================
-- CREATE MATCH — when request is approved and parent confirms
-- ============================================================

CREATE OR REPLACE FUNCTION create_match_from_request(
  p_request_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_request RECORD;
  v_match_id UUID;
  v_score NUMERIC;
  v_reason TEXT;
BEGIN
  -- Get request details (only parent can call this)
  SELECT * INTO v_request
  FROM match_requests
  WHERE id = p_request_id
    AND status = 'approved'
    AND EXISTS (
      SELECT 1 FROM children
      WHERE children.id = match_requests.child_id
        AND children.parent_id = auth.uid()
    );

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request not found, not approved, or access denied';
  END IF;

  -- Calculate score
  SELECT s.score, s.match_reason
  INTO v_score, v_reason
  FROM calculate_match_score(v_request.child_id, v_request.professional_id) s;

  -- Create the match
  INSERT INTO matches (child_id, professional_id, request_id, score, match_reason)
  VALUES (v_request.child_id, v_request.professional_id, p_request_id, v_score, v_reason)
  RETURNING id INTO v_match_id;

  -- Update request tier to 3
  UPDATE match_requests
  SET tier_reached = 3
  WHERE id = p_request_id;

  RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
