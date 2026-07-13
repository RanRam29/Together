-- ============================================================================
-- Migration: 20260713040000_wp8_field_visibility.sql
-- Description: D45 Field visibility switches ("מה דנה רואה") per child-pro pair.
-- ============================================================================

BEGIN;

-- 1. Create the visibility table
CREATE TABLE public.child_field_visibility (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  hidden_fields   TEXT[] NOT NULL DEFAULT '{}',   -- Empty = all visible
  updated_by      UUID NOT NULL REFERENCES public.profiles(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, professional_id)
);

-- 2. RLS for the visibility table
ALTER TABLE public.child_field_visibility ENABLE ROW LEVEL SECURITY;

-- Read access: Only parents of the child or admins. (Professionals do NOT get read access).
CREATE POLICY cfv_parent_read ON public.child_field_visibility FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children c 
      WHERE c.id = child_field_visibility.child_id
        AND (c.parent_id = auth.uid() OR c.secondary_parent_id = auth.uid())
    )
    OR public.is_admin()
  );

-- 3. RPC to set the visibility
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
  -- 1. Authorization
  SELECT
    (c.parent_id = auth.uid()),
    (c.secondary_parent_id = auth.uid() AND c.secondary_parent_permissions ? 'manage_visibility')
  INTO v_is_parent, v_is_secondary
  FROM public.children c
  WHERE c.id = p_child_id;

  IF NOT (COALESCE(v_is_parent, false) OR COALESCE(v_is_secondary, false)) THEN
    RAISE EXCEPTION 'Not authorized to manage visibility for this child';
  END IF;

  -- 2. Validate input fields and remove duplicates
  SELECT ARRAY(SELECT DISTINCT unnest(p_hidden_fields)) INTO v_unique_fields;
  
  FOREACH v_field IN ARRAY COALESCE(v_unique_fields, '{}')
  LOOP
    IF NOT (v_field = ANY(v_allowed_fields)) THEN
      RAISE EXCEPTION 'Invalid field name: %', v_field;
    END IF;
  END LOOP;

  -- 3. Validate relationship exists (active or paused match)
  IF NOT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.child_id = p_child_id 
      AND m.professional_id = p_professional_id
      AND m.status IN ('active', 'paused')
  ) THEN
    RAISE EXCEPTION 'Cannot set visibility for a professional without an active or paused match';
  END IF;

  -- 4. UPSERT
  INSERT INTO public.child_field_visibility (child_id, professional_id, hidden_fields, updated_by, updated_at)
  VALUES (p_child_id, p_professional_id, COALESCE(v_unique_fields, '{}'), auth.uid(), now())
  ON CONFLICT (child_id, professional_id) DO UPDATE
  SET hidden_fields = EXCLUDED.hidden_fields,
      updated_by = EXCLUDED.updated_by,
      updated_at = now();

  -- 5. Audit log
  INSERT INTO public.audit_log (user_id, resource, resource_id, action, metadata)
  VALUES (
    auth.uid(), 
    'child_field_visibility', 
    p_child_id, 
    'update', 
    jsonb_build_object('professional_id', p_professional_id, 'hidden_fields', v_unique_fields)
  );

END;
$$;


-- 4. Update get_child_details to enforce visibility (keeping the exact same signature)
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
  v_is_professional BOOLEAN;
  v_prof_id UUID;
  v_hidden TEXT[] := '{}';
BEGIN
  -- Calculate relationship tier
  v_tier := get_tier_for_child(p_child_id);
  v_is_professional := get_user_role() = 'professional';

  -- Access control: Caller must be admin, child's parent, or a professional with tier >= 2
  IF v_tier < 2 AND NOT v_is_professional AND get_user_role() != 'admin' AND NOT EXISTS (
    SELECT 1 FROM children WHERE children.id = p_child_id AND (children.parent_id = auth.uid() OR children.secondary_parent_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Access denied. Relationship tier 2 or 3 required.';
  END IF;

  -- Determine hidden fields if the actor is a professional
  IF v_is_professional THEN
    v_prof_id := get_professional_id();
    
    -- Log access
    INSERT INTO audit_log (user_id, resource, resource_id, action, tier)
    VALUES (auth.uid(), 'child_details', p_child_id, 'view', v_tier);
    
    -- Load visibility rules (if any exist for this pair)
    SELECT hidden_fields INTO v_hidden
    FROM public.child_field_visibility cfv
    WHERE cfv.child_id = p_child_id AND cfv.professional_id = v_prof_id;
    
    -- Fallback to empty array if no record
    v_hidden := COALESCE(v_hidden, '{}');
  END IF;

  -- Return the details row, masking hidden fields for professionals
  RETURN QUERY
  SELECT
    cd.id,
    cd.child_id,
    cd.full_name,
    CASE WHEN v_is_professional AND 'diagnosis_full' = ANY(v_hidden) THEN NULL ELSE cd.diagnosis_full END AS diagnosis_full,
    CASE WHEN v_is_professional AND 'what_works' = ANY(v_hidden) THEN NULL ELSE cd.what_works END AS what_works,
    CASE WHEN v_is_professional AND 'what_triggers' = ANY(v_hidden) THEN NULL ELSE cd.what_triggers END AS what_triggers,
    CASE WHEN v_is_professional AND 'gender_preference' = ANY(v_hidden) THEN NULL ELSE cd.gender_preference END AS gender_preference,
    CASE WHEN v_is_professional AND 'parent_contact' = ANY(v_hidden) THEN NULL ELSE cd.parent_contact END AS parent_contact,
    CASE WHEN v_is_professional AND 'win_definition' = ANY(v_hidden) THEN NULL ELSE cd.win_definition END AS win_definition,
    CASE WHEN v_is_professional AND 'notes' = ANY(v_hidden) THEN NULL ELSE cd.notes END AS notes,
    cd.created_at,
    cd.updated_at
  FROM child_details cd
  WHERE cd.child_id = p_child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Ensure proper grants
GRANT SELECT ON public.child_field_visibility TO authenticated, anon;

COMMIT;
