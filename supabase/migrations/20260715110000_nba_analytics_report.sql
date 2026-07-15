-- WP17 Stage D.6: דשבורד פנימי - אחוזי המרה של פעולות NBA

CREATE OR REPLACE FUNCTION public.admin_report_nba_conversion(p_from date, p_to date)
RETURNS TABLE(action_id text, shown int, tapped int, conversion_rate numeric) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  PERFORM public.check_admin_mfa();

  IF p_from > p_to THEN
    RAISE EXCEPTION 'Invalid date range: p_from must be <= p_to';
  END IF;

  RETURN QUERY
  WITH events AS (
    SELECT 
      event_name,
      metadata->>'action_id' as act_id
    FROM public.analytics_events
    WHERE event_name IN ('nba_shown', 'nba_tapped')
      AND created_at::date >= p_from 
      AND created_at::date <= p_to
  ),
  agg AS (
    SELECT 
      act_id,
      count(*) FILTER (WHERE event_name = 'nba_shown') as c_shown,
      count(*) FILTER (WHERE event_name = 'nba_tapped') as c_tapped
    FROM events
    WHERE act_id IS NOT NULL
    GROUP BY act_id
  )
  SELECT 
    act_id as action_id,
    c_shown::int as shown,
    c_tapped::int as tapped,
    CASE 
      WHEN c_shown > 0 THEN ROUND((c_tapped::numeric / c_shown::numeric) * 100, 2)
      ELSE 0.00
    END as conversion_rate
  FROM agg
  ORDER BY c_shown DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
