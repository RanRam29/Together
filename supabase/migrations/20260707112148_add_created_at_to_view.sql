-- Together Platform — Add created_at to children_tier0 view
-- Migration: 20260707112148_add_created_at_to_view.sql
-- Updates children_tier0 view to include created_at to support client-side sorting in Browse children screen.

DROP VIEW IF EXISTS public.children_tier0 CASCADE;

CREATE OR REPLACE VIEW public.children_tier0 AS
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
    AND (
      get_user_role() = 'professional'
      OR get_user_role() = 'admin'
      OR c.parent_id = auth.uid()
    );

GRANT SELECT ON public.children_tier0 TO authenticated;
