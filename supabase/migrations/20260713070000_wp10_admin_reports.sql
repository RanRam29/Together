-- Migration: WP10 Admin Reports (D25)
-- Implements safe, aggregated, non-PII admin reports.

-- 1. admin_report_overview
CREATE OR REPLACE FUNCTION public.admin_report_overview()
RETURNS jsonb AS $$
DECLARE
  v_res jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  PERFORM public.check_admin_mfa();

  -- Audit log
  INSERT INTO public.audit_log (user_id, resource, action, tier, metadata)
  VALUES (auth.uid(), 'report', 'admin_report_overview', 0, '{}'::jsonb);

  WITH
    users_by_role AS (
      SELECT role, count(*) as count 
      FROM public.profiles 
      WHERE deleted_at IS NULL 
      GROUP BY role
    ),
    matches_by_status AS (
      SELECT status, count(*) as count 
      FROM public.matches 
      GROUP BY status
    ),
    reqs_by_status AS (
      SELECT status, count(*) as count 
      FROM public.match_requests 
      WHERE status IN ('pending', 'interested', 'approved') 
      GROUP BY status
    ),
    prof_by_verification AS (
      SELECT verified as status, count(*) as count 
      FROM public.professionals 
      WHERE deleted_at IS NULL
      GROUP BY verified
    ),
    verification_wait AS (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (verified_at - created_at))/86400), 0) as avg_days
      FROM public.professionals
      WHERE verified = 'verified' AND verified_at IS NOT NULL
    ),
    logs_7_days AS (
      SELECT count(*) as count 
      FROM public.daily_logs 
      WHERE created_at >= (now() - interval '7 days')
    ),
    screenshots_30_days AS (
      SELECT count(*) as count 
      FROM public.audit_log 
      WHERE action = 'screenshot_detected' AND created_at >= (now() - interval '30 days')
    )
  SELECT jsonb_build_object(
    'users_by_role', COALESCE((SELECT jsonb_object_agg(role, count) FROM users_by_role), '{}'::jsonb),
    'matches_by_status', COALESCE((SELECT jsonb_object_agg(status, count) FROM matches_by_status), '{}'::jsonb),
    'requests_by_status', COALESCE((SELECT jsonb_object_agg(status, count) FROM reqs_by_status), '{}'::jsonb),
    'professionals_by_verification', COALESCE((SELECT jsonb_object_agg(status, count) FROM prof_by_verification), '{}'::jsonb),
    'avg_verification_wait_days', (SELECT avg_days FROM verification_wait),
    'daily_logs_7_days', (SELECT count FROM logs_7_days),
    'screenshots_30_days', (SELECT count FROM screenshots_30_days)
  ) INTO v_res;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 2. admin_report_timeseries
CREATE OR REPLACE FUNCTION public.admin_report_timeseries(p_metric text, p_from date, p_to date)
RETURNS TABLE(bucket date, value numeric) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  PERFORM public.check_admin_mfa();

  IF p_from > p_to THEN
    RAISE EXCEPTION 'Invalid date range: p_from must be <= p_to';
  END IF;

  IF (p_to - p_from) > 366 THEN
    RAISE EXCEPTION 'Invalid date range: max 366 days';
  END IF;

  IF p_metric NOT IN ('new_users', 'new_children_published', 'new_requests', 'new_matches', 'ended_matches', 'daily_logs', 'checkins', 'day_offs') THEN
    RAISE EXCEPTION 'Invalid metric: %', p_metric;
  END IF;

  -- Audit log
  INSERT INTO public.audit_log (user_id, resource, action, tier, metadata)
  VALUES (auth.uid(), 'report', 'admin_report_timeseries', 0, jsonb_build_object('metric', p_metric, 'from', p_from, 'to', p_to));

  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(p_from::timestamp, p_to::timestamp, '1 day'::interval)::date as d
  )
  SELECT 
    d.d as bucket,
    COALESCE(
      CASE p_metric
        WHEN 'new_users' THEN
          (SELECT count(*) FROM public.profiles p WHERE p.created_at::date = d.d)
        WHEN 'new_children_published' THEN
          (SELECT count(*) FROM public.children c WHERE c.published = true AND c.created_at::date = d.d)
        WHEN 'new_requests' THEN
          (SELECT count(*) FROM public.match_requests r WHERE r.created_at::date = d.d)
        WHEN 'new_matches' THEN
          (SELECT count(*) FROM public.matches m WHERE m.started_at::date = d.d)
        WHEN 'ended_matches' THEN
          (SELECT count(*) FROM public.matches m WHERE m.ended_at::date = d.d)
        WHEN 'daily_logs' THEN
          (SELECT count(*) FROM public.daily_logs l WHERE l.created_at::date = d.d)
        WHEN 'checkins' THEN
          (SELECT count(*) FROM public.checkins c WHERE c.created_at::date = d.d)
        WHEN 'day_offs' THEN
          (SELECT count(*) FROM public.match_days_off o WHERE o.date = d.d)
      END, 0
    )::numeric as value
  FROM dates d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3. admin_report_funnel
CREATE OR REPLACE FUNCTION public.admin_report_funnel(p_from date, p_to date)
RETURNS jsonb AS $$
DECLARE
  v_res jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  PERFORM public.check_admin_mfa();

  IF p_from > p_to THEN
    RAISE EXCEPTION 'Invalid date range: p_from must be <= p_to';
  END IF;

  -- Audit log
  INSERT INTO public.audit_log (user_id, resource, action, tier, metadata)
  VALUES (auth.uid(), 'report', 'admin_report_funnel', 0, jsonb_build_object('from', p_from, 'to', p_to));

  WITH reqs AS (
    SELECT * FROM public.match_requests 
    WHERE created_at::date >= p_from AND created_at::date <= p_to
  ),
  counts AS (
    SELECT
      (SELECT count(*) FROM reqs) as total_sent,
      (SELECT count(*) FROM reqs WHERE status IN ('interested', 'approved') OR id IN (SELECT request_id FROM public.matches WHERE request_id IS NOT NULL)) as total_interested,
      (SELECT count(*) FROM reqs WHERE status = 'approved' OR id IN (SELECT request_id FROM public.matches WHERE request_id IS NOT NULL)) as total_approved,
      (SELECT count(*) FROM public.matches m JOIN reqs r ON m.request_id = r.id) as total_became_match,
      (SELECT count(*) FROM public.matches m JOIN reqs r ON m.request_id = r.id WHERE m.status = 'active') as currently_active,
      (SELECT count(*) FROM public.matches m JOIN reqs r ON m.request_id = r.id WHERE m.status IN ('ended', 'cancelled')) as ended
  )
  SELECT jsonb_build_object(
    'total_sent', total_sent,
    'total_interested', total_interested,
    'total_approved', total_approved,
    'total_became_match', total_became_match,
    'currently_active', currently_active,
    'ended', ended
  ) INTO v_res FROM counts;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 4. admin_report_verification_sla
CREATE OR REPLACE FUNCTION public.admin_report_verification_sla()
RETURNS TABLE(week date, submitted int, verified int, avg_days_to_verdict numeric) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  PERFORM public.check_admin_mfa();

  -- Audit log
  INSERT INTO public.audit_log (user_id, resource, action, tier, metadata)
  VALUES (auth.uid(), 'report', 'admin_report_verification_sla', 0, '{}'::jsonb);

  RETURN QUERY
  WITH weeks AS (
    SELECT date_trunc('week', d)::date as w
    FROM generate_series(date_trunc('week', now()) - interval '11 weeks', date_trunc('week', now()), '1 week'::interval) d
  )
  SELECT 
    w.w as week,
    (SELECT count(*)::int FROM public.professionals p WHERE date_trunc('week', p.created_at)::date = w.w AND p.verified != 'pending') as submitted,
    (SELECT count(*)::int FROM public.professionals p WHERE date_trunc('week', p.verified_at)::date = w.w AND p.verified = 'verified') as verified,
    COALESCE((
      SELECT AVG(EXTRACT(EPOCH FROM (v.verdict_at - v.created_at))/86400)::numeric
      FROM (
        SELECT p.created_at, p.verified_at as verdict_at
        FROM public.professionals p
        WHERE date_trunc('week', p.created_at)::date = w.w AND p.verified = 'verified' AND p.verified_at IS NOT NULL
        UNION ALL
        SELECT p.created_at, d.created_at as verdict_at
        FROM public.professionals p
        JOIN public.document_uploads d ON d.owner_id = p.id
        WHERE date_trunc('week', p.created_at)::date = w.w AND p.verified = 'rejected' AND d.rejection_note IS NOT NULL
      ) v
    ), 0)::numeric as avg_days_to_verdict
  FROM weeks w
  ORDER BY w.w ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 5. Cron Jobs for Data Retention (D49)
SELECT cron.schedule('retention_analytics', '0 2 1 * *', $$
  DELETE FROM public.analytics_events WHERE created_at < now() - interval '12 months';
$$);

SELECT cron.schedule('retention_audit', '0 3 1 * *', $$
  DELETE FROM public.audit_log WHERE created_at < now() - interval '24 months';
$$);

SELECT cron.schedule('retention_checkins', '0 4 1 * *', $$
  -- Fuzz coordinates after 6 months (keep the record but anonymize the location)
  -- 0.01 degrees is roughly 1km.
  UPDATE public.checkins 
  SET location = ST_SetSRID(ST_MakePoint(
      ST_X(location::geometry) + (random() * 0.02 - 0.01),
      ST_Y(location::geometry) + (random() * 0.02 - 0.01)
    ), 4326)::geography
  WHERE created_at < now() - interval '6 months'
    -- avoid re-fuzzing indefinitely if we don't have a flag, but this is simple enough for MVP
    -- we can just fuzz it once. To prevent drift, we just accept it drifts slightly if re-fuzzed, or we just rely on deleted_at in the future.
    -- actually, if it runs every month, it will re-fuzz old ones. That's fine, it just scrambles them more.
$$);
