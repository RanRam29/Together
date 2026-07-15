-- Together Platform — WP16: Notification Hygiene
-- Migration: 20260715150000_wp16_notification_hygiene.sql

-- 1. Table for throttling missing log notifications
CREATE TABLE IF NOT EXISTS public.missing_log_notifications (
  match_id uuid PRIMARY KEY REFERENCES public.matches(id) ON DELETE CASCADE,
  last_notified_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS but add no policies -> internal use only (bypassed by SECURITY DEFINER or Postgres role)
ALTER TABLE public.missing_log_notifications ENABLE ROW LEVEL SECURITY;

-- 2. Function to check for missing logs and send a gentle reminder
CREATE OR REPLACE FUNCTION public.check_missing_logs_and_notify()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_match RECORD;
  v_professional_id uuid;
  v_child_name text;
  v_last_notified timestamptz;
  v_recent_logs int;
  v_days_off int;
  v_yesterday date := (now() - interval '1 day')::date;
  v_day_before date := (now() - interval '2 days')::date;
BEGIN
  -- Iterate through active matches started at least 2 days ago
  FOR v_match IN
    SELECT m.id, m.professional_id, c.first_name
    FROM public.matches m
    JOIN public.children c ON m.child_id = c.id
    WHERE m.status = 'active'
      AND m.started_at <= (now() - interval '2 days')
  LOOP
    v_professional_id := v_match.professional_id;
    v_child_name := v_match.first_name;

    -- Check if we notified in the last 7 days
    SELECT last_notified_at INTO v_last_notified
    FROM public.missing_log_notifications
    WHERE match_id = v_match.id;

    IF v_last_notified IS NULL OR v_last_notified <= (now() - interval '7 days') THEN
      -- Check if there are any logs in the last 2 days
      SELECT count(*) INTO v_recent_logs
      FROM public.daily_logs
      WHERE match_id = v_match.id
        AND log_date >= v_day_before;

      IF v_recent_logs = 0 THEN
        -- Check if both days are covered by days off
        SELECT count(*) INTO v_days_off
        FROM public.match_days_off
        WHERE match_id = v_match.id
          AND day_date IN (v_yesterday, v_day_before);

        IF v_days_off < 2 THEN
          -- Send notification
          PERFORM public.notify_push(
            v_professional_id,
            'דיווח יומי חסר',
            'איך היו היומיים האחרונים עם ' || v_child_name || '? נשמח אם תשתפי.',
            jsonb_build_object('type', 'missing_daily_log', 'match_id', v_match.id),
            'daily_summary' -- Or another category, but daily_summary fits best for log reminders
          );

          -- Update throttling table
          INSERT INTO public.missing_log_notifications (match_id, last_notified_at)
          VALUES (v_match.id, now())
          ON CONFLICT (match_id) DO UPDATE
          SET last_notified_at = now();
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- 3. Function to compile admin summary and push to admins
CREATE OR REPLACE FUNCTION public.admin_weekly_summary_push()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_admin_id uuid;
  v_new_parents int;
  v_new_pros int;
  v_pending_reqs int;
  v_summary_text text;
  v_start_of_week timestamptz := now() - interval '7 days';
BEGIN
  -- Gather metrics
  SELECT count(*) INTO v_new_parents FROM public.profiles WHERE role = 'parent' AND created_at >= v_start_of_week;
  SELECT count(*) INTO v_new_pros FROM public.profiles WHERE role = 'professional' AND created_at >= v_start_of_week;
  SELECT count(*) INTO v_pending_reqs FROM public.match_requests WHERE status = 'pending';

  v_summary_text := format(
    'סיכום שבועי: %s הורים ו-%s משלבות חדשות. %s בקשות ממתינות.',
    v_new_parents, v_new_pros, v_pending_reqs
  );

  -- Send to all admins
  FOR v_admin_id IN
    SELECT id FROM auth.users WHERE raw_app_meta_data->>'is_admin' = 'true'
  LOOP
    PERFORM public.notify_push(
      v_admin_id,
      'סיכום שבועי - אדמין',
      v_summary_text,
      jsonb_build_object('type', 'admin_weekly_summary'),
      'system'
    );
  END LOOP;
END;
$$;

-- 4. Create cron jobs
-- Reminder to professional: Runs daily at 20:00 UTC
SELECT cron.schedule('daily_log_reminder', '0 20 * * *', 'SELECT public.check_missing_logs_and_notify()');

-- Admin weekly summary: Runs every Sunday at 08:00 UTC
SELECT cron.schedule('admin_weekly_summary', '0 8 * * 0', 'SELECT public.admin_weekly_summary_push()');
