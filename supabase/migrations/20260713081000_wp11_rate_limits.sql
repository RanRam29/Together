-- WP11: RPC Rate Limiting

CREATE TABLE IF NOT EXISTS public.rpc_rate_limits (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    window_start timestamp with time zone NOT NULL,
    count integer NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, action, window_start)
);

-- Enable RLS
ALTER TABLE public.rpc_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.enforce_rate_limit(p_action text, p_max integer, p_window interval)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id uuid;
    v_window_start timestamp with time zone;
    v_current_count integer;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    IF p_window <= interval '1 hour' THEN
        v_window_start := date_trunc('hour', now());
    ELSE
        v_window_start := date_trunc('day', now());
    END IF;

    INSERT INTO public.rpc_rate_limits (user_id, action, window_start, count)
    VALUES (v_user_id, p_action, v_window_start, 1)
    ON CONFLICT (user_id, action, window_start)
    DO UPDATE SET count = rpc_rate_limits.count + 1
    RETURNING count INTO v_current_count;

    IF v_current_count > p_max THEN
        RAISE EXCEPTION 'Rate limit exceeded for %', p_action;
    END IF;
END;
$$;

-- 1. hide_match_profile (20/day)
CREATE OR REPLACE FUNCTION public.hide_match_profile(p_target_user_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM public.enforce_rate_limit('hide_match_profile', 20, interval '1 day');

  INSERT INTO public.match_hides (hider_id, hidden_user_id)
  VALUES (auth.uid(), p_target_user_id)
  ON CONFLICT (hider_id, hidden_user_id) 
  DO UPDATE SET expires_at = now() + interval '3 months';
END;
$$;

-- 2. mark_day_off (10/day)
CREATE OR REPLACE FUNCTION public.mark_day_off(p_match_id UUID, p_date DATE, p_reason TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_is_participant BOOLEAN;
  v_match_status TEXT;
BEGIN
  PERFORM public.enforce_rate_limit('mark_day_off', 10, interval '1 day');

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

-- 3. invite_secondary_parent (5/day)
CREATE OR REPLACE FUNCTION public.invite_secondary_parent(p_child_id UUID, p_phone TEXT)
RETURNS void AS $$
BEGIN
  PERFORM public.enforce_rate_limit('invite_secondary_parent', 5, interval '1 day');

  -- Verify caller is primary parent
  IF NOT EXISTS (SELECT 1 FROM public.children WHERE id = p_child_id AND parent_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only primary parent can invite';
  END IF;

  -- Create invitation
  INSERT INTO public.parent_invitations (child_id, inviter_id, invited_phone, status)
  VALUES (p_child_id, auth.uid(), p_phone, 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. log_screenshot_event (30/day)
CREATE OR REPLACE FUNCTION public.log_screenshot_event(p_child_id UUID)
RETURNS void AS $$
DECLARE
  v_is_parent BOOLEAN;
  v_is_admin BOOLEAN;
  v_tier INTEGER;
BEGIN
  PERFORM public.enforce_rate_limit('log_screenshot_event', 30, interval '1 day');

  v_is_admin := public.is_admin();
  v_tier := public.get_tier_for_child(p_child_id);

  SELECT EXISTS (
    SELECT 1 FROM public.children 
    WHERE id = p_child_id 
      AND (parent_id = auth.uid() OR secondary_parent_id = auth.uid())
  ) INTO v_is_parent;

  IF NOT (v_tier >= 2 OR v_is_parent OR v_is_admin) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  IF v_is_parent OR v_is_admin THEN
    v_tier := 3;
  END IF;

  INSERT INTO public.audit_log (user_id, resource, resource_id, action, tier, metadata)
  VALUES (auth.uid(), 'child_details', p_child_id, 'screenshot_detected', v_tier, '{"platform": "iOS"}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 5. set_child_field_visibility (60/day)
CREATE OR REPLACE FUNCTION public.set_child_field_visibility(
  p_child_id UUID,
  p_professional_id UUID,
  p_hidden_fields TEXT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_parent BOOLEAN;
  v_is_secondary BOOLEAN;
  v_allowed_fields TEXT[] := ARRAY['diagnosis_full', 'what_works', 'what_triggers', 'gender_preference', 'parent_contact', 'win_definition', 'notes'];
  v_field TEXT;
  v_unique_fields TEXT[];
BEGIN
  PERFORM public.enforce_rate_limit('set_child_field_visibility', 60, interval '1 day');

  SELECT
    (c.parent_id = auth.uid()),
    (c.secondary_parent_id = auth.uid() AND c.secondary_parent_permissions ? 'manage_visibility')
  INTO v_is_parent, v_is_secondary
  FROM public.children c
  WHERE c.id = p_child_id;

  IF NOT (COALESCE(v_is_parent, false) OR COALESCE(v_is_secondary, false)) THEN
    RAISE EXCEPTION 'Not authorized to manage visibility for this child';
  END IF;

  SELECT ARRAY(SELECT DISTINCT unnest(p_hidden_fields)) INTO v_unique_fields;
  
  FOREACH v_field IN ARRAY COALESCE(v_unique_fields, '{}')
  LOOP
    IF NOT (v_field = ANY(v_allowed_fields)) THEN
      RAISE EXCEPTION 'Invalid field name: %', v_field;
    END IF;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.child_id = p_child_id 
      AND m.professional_id = p_professional_id
      AND m.status IN ('active', 'paused')
  ) THEN
    RAISE EXCEPTION 'Cannot set visibility for a professional without an active or paused match';
  END IF;

  INSERT INTO public.child_field_visibility (child_id, professional_id, hidden_fields, updated_by, updated_at)
  VALUES (p_child_id, p_professional_id, COALESCE(v_unique_fields, '{}'), auth.uid(), now())
  ON CONFLICT (child_id, professional_id) DO UPDATE
  SET hidden_fields = EXCLUDED.hidden_fields,
      updated_by = EXCLUDED.updated_by,
      updated_at = now();

  INSERT INTO public.audit_log (user_id, resource, resource_id, action, metadata)
  VALUES (auth.uid(), 'child_field_visibility', p_child_id, 'update', jsonb_build_object('professional_id', p_professional_id, 'hidden_fields', v_unique_fields));
END;
$$;
