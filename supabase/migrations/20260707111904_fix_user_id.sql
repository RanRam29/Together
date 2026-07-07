-- Together Platform — Engine Fix: user_id missing in CTE
-- Migration: 20260707111904_fix_user_id.sql
-- Adds p.user_id to filtered_professionals SELECT list inside get_matches_for_child function to fix tenure score calculation.

CREATE OR REPLACE FUNCTION public.get_matches_for_child(
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
  -- Get child info (allowing parent or admin)
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
    AND (c.parent_id = auth.uid() OR get_user_role() = 'admin');

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
      p.user_id, -- Added to fix engine platforms tenure calculation
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
      -- Calculate distance in km (casting double precision to numeric for ROUND)
      ROUND(
        (ST_Distance(
          p.location::geography,
          v_child.location::geography
        ) / 1000.0)::numeric, 1
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
        -- Platform tenure (×1, max 15) - Corrected: profiles.id matches professionals.user_id
        -- Corrected tenure math: sum years*12 + months to get total months
        + LEAST(
            COALESCE(
              (
                SELECT 
                  (EXTRACT(YEAR FROM age(now(), pr.created_at)) * 12 + 
                   EXTRACT(MONTH FROM age(now(), pr.created_at)))
                FROM profiles pr
                WHERE pr.id = fp.user_id
              ) * 1.5, 
              0
            ),
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
