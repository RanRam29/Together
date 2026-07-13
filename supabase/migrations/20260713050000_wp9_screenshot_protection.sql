-- Migration for WP9 D44 (Screenshot Protection)

CREATE OR REPLACE FUNCTION public.log_screenshot_event(p_child_id UUID)
RETURNS void AS $$
DECLARE
  v_tier INTEGER;
  v_is_parent BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  v_is_admin := public.is_admin();

  -- Get tier for professional (returns 0 if not professional or no request)
  v_tier := public.get_tier_for_child(p_child_id);

  -- Check if user is primary or secondary parent
  SELECT EXISTS (
    SELECT 1 FROM public.children 
    WHERE id = p_child_id 
      AND (parent_id = auth.uid() OR secondary_parent_id = auth.uid())
  ) INTO v_is_parent;

  -- Verify access level (Must be TIER >= 2, parent, or admin)
  IF NOT (v_tier >= 2 OR v_is_parent OR v_is_admin) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  -- For parents/admins, record tier as 3 (highest) for audit context
  IF v_is_parent OR v_is_admin THEN
    v_tier := 3;
  END IF;

  -- Log event
  INSERT INTO public.audit_log (user_id, resource, resource_id, action, tier, metadata)
  VALUES (
    auth.uid(), 
    'child_details', 
    p_child_id, 
    'screenshot_detected', 
    v_tier, 
    '{"platform": "iOS"}'::jsonb
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Ensure it's executable by authenticated users
GRANT EXECUTE ON FUNCTION public.log_screenshot_event(UUID) TO authenticated;
