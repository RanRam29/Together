-- Migration: Hardening v3
-- 1. DROP export_system_data()
-- 2. get_live_ops_alerts: exclude days off
-- 3. Hardening v3 updates

-- 1. DROP export_system_data
DROP FUNCTION IF EXISTS public.export_system_data();

-- 1.5 GRANT privileges for new tables from D46/D48
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_hides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_days_off TO authenticated;

-- 2. get_live_ops_alerts: exclude match_days_off
CREATE OR REPLACE FUNCTION public.get_live_ops_alerts()
RETURNS TABLE (
  alert_id text,
  alert_type text,
  severity text,
  resource_id uuid,
  details jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    'inactive_' || m.id::text AS alert_id,
    'INACTIVE_MATCH'::text AS alert_type,
    'HIGH'::text AS severity,
    m.id AS resource_id,
    jsonb_build_object(
      'child_name', c.first_name,
      'prof_id', p.id,
      'last_activity', (
        SELECT max(ck.created_at) FROM public.checkins ck WHERE ck.match_id = m.id
      )
    ) AS details,
    now() AS created_at
  FROM public.matches m
  JOIN public.children c ON m.child_id = c.id
  JOIN public.professionals p ON m.professional_id = p.id
  WHERE m.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM public.checkins ck
      WHERE ck.match_id = m.id AND ck.created_at >= now() - interval '3 days'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.daily_logs d
      WHERE d.match_id = m.id AND d.log_date >= current_date - 3
    )
    -- Exclude if there is a day off in the last 3 days
    AND NOT EXISTS (
      SELECT 1 FROM public.match_days_off mdo
      WHERE mdo.match_id = m.id AND mdo.date >= current_date - 3
    )

  UNION ALL

  SELECT
    'pending_prof_' || p.id::text AS alert_id,
    'PENDING_PROFESSIONAL'::text AS alert_type,
    'MEDIUM'::text AS severity,
    p.id AS resource_id,
    jsonb_build_object(
      'user_id', p.user_id,
      'days_waiting', EXTRACT(DAY FROM now() - p.created_at)
    ) AS details,
    now() AS created_at
  FROM public.professionals p
  WHERE p.verified = 'submitted'
    AND p.created_at <= now() - interval '2 days'

  UNION ALL

  SELECT
    'stale_req_' || r.id::text AS alert_id,
    'STALE_REQUEST'::text AS alert_type,
    'MEDIUM'::text AS severity,
    r.id AS resource_id,
    jsonb_build_object(
      'child_name', c.first_name,
      'days_waiting', EXTRACT(DAY FROM now() - r.created_at)
    ) AS details,
    now() AS created_at
  FROM public.match_requests r
  JOIN public.children c ON r.child_id = c.id
  WHERE r.status = 'pending'
    AND r.created_at <= now() - interval '7 days';
END;
$$;


-- 3a. hide_match_profile search_path
CREATE OR REPLACE FUNCTION public.hide_match_profile(p_target_user_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.match_hides (hider_id, hidden_user_id)
  VALUES (auth.uid(), p_target_user_id)
  ON CONFLICT (hider_id, hidden_user_id) 
  DO UPDATE SET expires_at = now() + interval '3 months';
END;
$$;


-- 3e & 3a. mark_day_off: validation and search_path
CREATE OR REPLACE FUNCTION public.mark_day_off(p_match_id UUID, p_date DATE, p_reason TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_is_participant BOOLEAN;
  v_match_status TEXT;
BEGIN
  -- Validate date
  IF p_date < (current_date - integer '14') OR p_date > (current_date + integer '14') THEN
    RAISE EXCEPTION 'Date must be within 14 days of today';
  END IF;

  -- Verify participation and get match status
  SELECT 
    EXISTS (
      SELECT 1 FROM public.matches m2
      WHERE m2.id = p_match_id
      AND (
        m2.professional_id = public.get_professional_id()
        OR m2.child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
      )
    ),
    m.status
  INTO v_is_participant, v_match_status
  FROM public.matches m
  WHERE m.id = p_match_id;

  IF NOT v_is_participant THEN
    RAISE EXCEPTION 'Not authorized to mark days off for this match';
  END IF;
  
  IF v_match_status NOT IN ('active', 'paused') THEN
    RAISE EXCEPTION 'Match must be active or paused to mark a day off';
  END IF;

  INSERT INTO public.match_days_off (match_id, date, reported_by, reason)
  VALUES (p_match_id, p_date, auth.uid(), p_reason)
  ON CONFLICT (match_id, date) DO NOTHING;
END;
$$;


-- 3b. get_matches_for_child replace get_user_role() = 'admin' with is_admin()
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
) AS $func$
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
    c.communication_language,
    c.hours_needed,
    c.location,
    c.needs
  INTO v_child
  FROM public.children c
  WHERE c.id = p_child_id
    AND (c.parent_id = auth.uid() OR public.is_admin());

  IF v_child IS NULL THEN
    RAISE EXCEPTION 'Child not found or access denied';
  END IF;

  RETURN QUERY
  WITH filtered_professionals AS (
    SELECT
      p.id,
      p.user_id,
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
      ROUND(
        (ST_Distance(
          p.location::geography,
          v_child.location::geography
        ) / 1000.0)::numeric, 1
      ) AS dist_km
    FROM public.professionals p
    WHERE
      p.verified = 'verified'
      AND ST_DWithin(
        p.location::geography,
        v_child.location::geography,
        COALESCE(p.max_radius_km, 15) * 1000.0
      )
      AND (
        p.framework_types = '{}' 
        OR v_child.framework = ANY(p.framework_types)
      )
      -- Hard filter: Language
      AND (v_child.communication_language IS NULL OR v_child.communication_language = ANY(p.languages))
      -- Hard filter: Availability (now using 25% coverage rule)
      AND public.availability_overlaps(p.availability, v_child.hours_needed)
      AND NOT EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.professional_id = p.id
          AND m.child_id = p_child_id
          AND m.status = 'active'
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.match_requests mr
        WHERE mr.professional_id = p.id
          AND mr.child_id = p_child_id
          AND mr.status IN ('pending', 'interested')
      )
      -- D48: Exclude hidden profiles
      AND NOT EXISTS (
        SELECT 1 FROM public.match_hides mh
        WHERE mh.hider_id = auth.uid() 
          AND mh.hidden_user_id = p.user_id 
          AND mh.expires_at > now()
      )
  ),
  scored_professionals AS (
    SELECT
      fp.*,
      (
        CASE
          WHEN v_child.category = ANY(fp.specialties) THEN 40
          WHEN v_child.secondary_category IS NOT NULL
               AND v_child.secondary_category = ANY(fp.specialties) THEN 15
          ELSE 0
        END
        + LEAST(COALESCE(fp.experience_years, 0) * 2, 20)
        + CASE
            WHEN fp.rating_count >= 3 THEN ROUND(fp.rating_avg * 5, 0)
            ELSE 5
          END
        + CASE
            WHEN fp.dist_km <= 2 THEN 15
            WHEN fp.dist_km <= 5 THEN 12
            WHEN fp.dist_km <= 10 THEN 8
            WHEN fp.dist_km <= 15 THEN 4
            ELSE 0
          END
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
$func$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3b. match_days_off policy: replace get_user_role() = 'admin' with is_admin()
DROP POLICY IF EXISTS "match_participants_read_days_off" ON public.match_days_off;
CREATE POLICY "match_participants_read_days_off" ON public.match_days_off FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = match_days_off.match_id
    AND (
      m.professional_id = public.get_professional_id()
      OR m.child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
    )
  )
  OR public.is_admin()
);


-- 3c. Storage policy: "Allow admins to view all documents" -> use is_admin()
DROP POLICY IF EXISTS "Allow admins to view all documents" ON storage.objects;
CREATE POLICY "Allow admins to view all documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
  );


-- 3d. anonymize_user step 8 -> set ended_at = now() when ending matches
CREATE OR REPLACE FUNCTION public.anonymize_user(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_is_authorized boolean;
  v_role text;
BEGIN
  -- Authorization: User themselves, or Admin
  IF auth.uid() = p_user_id THEN
    v_is_authorized := true;
  ELSE
    v_is_authorized := public.is_admin();
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Access denied. You can only delete your own account or must be an admin.';
  END IF;

  -- 1. Blank out Auth data to free email/phone and mark as deleted
  UPDATE auth.users 
  SET email = id || '@deleted.local',
      phone = NULL,
      raw_user_meta_data = '{"deleted": true}'::jsonb,
      encrypted_password = NULL -- they can't log in anymore
  WHERE id = p_user_id;

  -- 2. Blank out Profile
  UPDATE public.profiles
  SET full_name = 'Deleted User',
      phone = NULL,
      avatar_url = NULL,
      deleted_at = now()
  WHERE id = p_user_id;

  -- 3. Blank out Professional data (if any)
  UPDATE public.professionals
  SET display_name = 'Deleted Professional',
      bio = NULL,
      languages = '{}',
      location = 'POINT(0 0)'::geometry,
      deleted_at = now()
  WHERE user_id = p_user_id;

  -- Remove sensitive documents physically (if any, requires bucket cleanup which is separate)
  -- But we delete the DB records to sever the link
  DELETE FROM public.document_uploads
  WHERE professional_id IN (SELECT id FROM public.professionals WHERE user_id = p_user_id);

  -- 4. Blank out Children data (if parent)
  UPDATE public.children
  SET first_name = 'Deleted Child',
      needs = '{}'::jsonb,
      location = 'POINT(0 0)'::geometry,
      deleted_at = now()
  WHERE parent_id = p_user_id;

  -- Delete sensitive child medical details
  DELETE FROM public.child_details
  WHERE child_id IN (SELECT id FROM public.children WHERE parent_id = p_user_id);

  -- 5. Anonymize Daily Logs for related matches
  UPDATE public.daily_logs
  SET notes = NULL
  WHERE match_id IN (
    SELECT id FROM public.matches 
    WHERE professional_id IN (SELECT id FROM public.professionals WHERE user_id = p_user_id)
       OR child_id IN (SELECT id FROM public.children WHERE parent_id = p_user_id)
  );

  -- 6. Anonymize Reviews
  UPDATE public.reviews
  SET text = NULL
  WHERE author_id = p_user_id 
     OR target_id = p_user_id;

  -- 7. End any active matches (D14: ended_at = now())
  UPDATE public.matches
  SET status = 'ended',
      ended_at = now()
  WHERE status = 'active'
    AND (
       professional_id IN (SELECT id FROM public.professionals WHERE user_id = p_user_id)
       OR child_id IN (SELECT id FROM public.children WHERE parent_id = p_user_id)
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
