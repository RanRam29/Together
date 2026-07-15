-- Fix Supabase Security Advisor: Security Definer Views
--   public.children_tier0
--   public.view_parent_funnel
--
-- children_tier0 keeps tier-0 column isolation via a private SECURITY DEFINER
-- function while the public view itself runs as security_invoker.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.children_tier0_source()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  age INTEGER,
  category need_category,
  secondary_category need_category,
  framework framework_type,
  hours_needed JSONB,
  created_at TIMESTAMPTZ,
  area_general TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
  SELECT
    c.id,
    c.first_name,
    c.age,
    c.category,
    c.secondary_category,
    c.framework,
    c.hours_needed,
    c.created_at,
    p.area AS area_general
  FROM public.children c
  JOIN public.profiles p ON p.id = c.parent_id
  WHERE c.published = true
    AND c.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.match_hides mh
      WHERE mh.hider_id = auth.uid()
        AND mh.hidden_user_id = c.parent_id
        AND mh.expires_at > now()
    )
    AND (
      public.get_user_role() = 'professional'
      OR public.is_admin()
      OR c.parent_id = auth.uid()
      OR c.secondary_parent_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION private.children_tier0_source() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.children_tier0_source() TO authenticated;

DROP VIEW IF EXISTS public.children_tier0;

CREATE VIEW public.children_tier0
WITH (security_invoker = true)
AS
SELECT * FROM private.children_tier0_source();

GRANT SELECT ON public.children_tier0 TO authenticated;

CREATE OR REPLACE VIEW public.view_parent_funnel
WITH (security_invoker = true)
AS
SELECT
  COUNT(DISTINCT CASE WHEN event_name = 'child_profile_completed' THEN user_id END) AS parents_activated,
  COUNT(DISTINCT CASE WHEN event_name = 'matches_viewed' THEN user_id END) AS parents_viewed_matches,
  COUNT(DISTINCT CASE WHEN event_name = 'request_sent' THEN user_id END) AS parents_sent_request,
  COUNT(DISTINCT CASE WHEN event_name = 'match_created' THEN user_id END) AS parents_with_match,
  CASE
    WHEN COUNT(DISTINCT CASE WHEN event_name = 'matches_viewed' THEN user_id END) > 0
    THEN ROUND(
      COUNT(DISTINCT CASE WHEN event_name = 'request_sent' THEN user_id END)::numeric
      / COUNT(DISTINCT CASE WHEN event_name = 'matches_viewed' THEN user_id END) * 100,
      1
    )
    ELSE 0
  END AS conversion_to_request_pct,
  CASE
    WHEN COUNT(DISTINCT CASE WHEN event_name = 'request_sent' THEN user_id END) > 0
    THEN ROUND(
      COUNT(DISTINCT CASE WHEN event_name = 'match_created' THEN user_id END)::numeric
      / COUNT(DISTINCT CASE WHEN event_name = 'request_sent' THEN user_id END) * 100,
      1
    )
    ELSE 0
  END AS conversion_to_match_pct
FROM public.analytics_events;

GRANT SELECT ON public.view_parent_funnel TO authenticated;
