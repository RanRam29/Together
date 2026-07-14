-- Allow multiple daily logs per match per calendar day.
-- Professionals may document several observations in a single day.

ALTER TABLE public.daily_logs
  DROP CONSTRAINT IF EXISTS daily_logs_match_id_log_date_key;

CREATE INDEX IF NOT EXISTS idx_daily_logs_match_date_created
  ON public.daily_logs (match_id, log_date DESC, created_at DESC);
