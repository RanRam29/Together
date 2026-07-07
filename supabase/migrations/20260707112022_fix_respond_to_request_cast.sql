-- Together Platform — Fix cast in respond_to_request
-- Migration: 20260707112022_fix_respond_to_request_cast.sql
-- Corrects the status cast from match_status to match_request_status inside respond_to_request RPC function.

CREATE OR REPLACE FUNCTION public.respond_to_request(
  p_request_id UUID,
  p_status TEXT
)
RETURNS VOID AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Retrieve and lock request
  SELECT r.* INTO v_request
  FROM match_requests r
  JOIN professionals p ON p.id = r.professional_id
  WHERE r.id = p_request_id
  FOR UPDATE;

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  -- Verify ownership
  IF v_request.professional_id != get_professional_id() THEN
    RAISE EXCEPTION 'Not authorized to respond to this request';
  END IF;

  -- Validate state: only pending requests can be responded to
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is already in status: %', v_request.status;
  END IF;

  -- Validate input status
  IF p_status NOT IN ('interested', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status response. Must be interested or rejected';
  END IF;

  -- Update request status with correct match_request_status cast
  UPDATE match_requests
  SET status = p_status::match_request_status,
      updated_at = now()
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
