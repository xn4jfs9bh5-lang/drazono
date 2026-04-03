-- ============================================================
-- DRAZONO — BACKEND MACHINES MIGRATION
-- Execute in Supabase SQL Editor (in order)
-- ============================================================

-- ============================================================
-- 1. ANALYTICS EVENTS — UTM enrichment
-- ============================================================
ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS landing_path text;

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source
  ON analytics_events (utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date
  ON analytics_events (event_type, created_at DESC);

-- ============================================================
-- 2. VEHICLES — Social posts cache
-- ============================================================
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS social_posts_cache jsonb;

-- ============================================================
-- 3. EMAIL LOGS — Idempotency constraint
-- ============================================================
-- Add campaign_type column first
ALTER TABLE email_logs
  ADD COLUMN IF NOT EXISTS campaign_type text DEFAULT 'new_vehicle';

-- Create unique index for idempotency (partial — only on success)
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_logs_idempotency
  ON email_logs (vehicle_id, email, campaign_type)
  WHERE success = true;

-- ============================================================
-- 4. ALERT NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(alert_id, vehicle_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_alert_notifs_alert_id
  ON alert_notifications(alert_id);

ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alert_notifs_service_all" ON public.alert_notifications
  FOR ALL USING (true) WITH CHECK (true);

-- Enrich alerts table
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  last_sent_at timestamptz;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  cooldown_hours integer DEFAULT 24;

-- ============================================================
-- 5. ONBOARDING EMAIL SEQUENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_name text NOT NULL DEFAULT 'onboarding',
  step_key text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL
    CHECK (status IN ('pending','sent','failed','cancelled'))
    DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sequence_name, step_key)
);

CREATE INDEX IF NOT EXISTS idx_seq_pending
  ON user_email_sequences(scheduled_for)
  WHERE status = 'pending';

ALTER TABLE public.user_email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seq_service_all" ON public.user_email_sequences
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. EMAIL UNSUBSCRIBE
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_unsubscribed boolean DEFAULT false;
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_reengagement_at timestamptz;

-- Add unsubscribe token to email_subscriptions (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'email_subscriptions') THEN
    ALTER TABLE email_subscriptions
      ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;
    ALTER TABLE email_subscriptions
      ADD COLUMN IF NOT EXISTS unsubscribe_token text
        DEFAULT encode(gen_random_bytes(32), 'hex');
  END IF;
END $$;

-- ============================================================
-- 7. RE-ENGAGEMENT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reengagement_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reengagement_user
  ON reengagement_logs(user_id, created_at DESC);

ALTER TABLE public.reengagement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reengagement_service_all" ON public.reengagement_logs
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 8. RECOMMENDATIONS — user_recommendations table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  reason text,
  source text NOT NULL CHECK (source IN ('favorites','views','hybrid')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vehicle_id, source)
);

ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recommendations_service_all" ON public.user_recommendations
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 9. VIEWS — Marketing attribution + Conversion funnel
-- ============================================================
CREATE OR REPLACE VIEW marketing_attribution AS
SELECT
  COALESCE(utm_source, 'organic') AS source,
  COALESCE(utm_medium, 'direct') AS medium,
  COALESCE(utm_campaign, 'none') AS campaign,
  COUNT(*) FILTER (WHERE event_type = 'page_view') AS visits,
  COUNT(*) FILTER (WHERE event_type = 'vehicle_view') AS vehicle_views,
  COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'page_view'), 0) * 100, 2
  ) AS conversion_rate_pct,
  DATE_TRUNC('week', created_at) AS week
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY 1, 2, 3, 8
ORDER BY 8 DESC, 5 DESC;

CREATE OR REPLACE VIEW conversion_funnel AS
WITH events_30d AS (
  SELECT event_type, session_id
  FROM analytics_events
  WHERE created_at > NOW() - INTERVAL '30 days'
)
SELECT
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'page_view') AS visitors,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'vehicle_view') AS vehicle_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'contact_form') AS contact_forms,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'newsletter_signup') AS newsletter_subs
FROM events_30d;

-- ============================================================
-- 10. RECOMMENDATION SQL FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION get_vehicle_recommendations(
  p_user_id UUID, p_limit INTEGER DEFAULT 6
)
RETURNS TABLE(vehicle_id UUID, score FLOAT, reason TEXT)
LANGUAGE SQL STABLE AS $$
  WITH seeds AS (
    SELECT v.id, v.brand, v.body_type, v.fuel_type,
           v.condition, v.price_eur
    FROM favorites f JOIN vehicles v ON f.vehicle_id = v.id
    WHERE f.user_id = p_user_id LIMIT 5
  ),
  already_seen AS (
    SELECT DISTINCT vehicle_id FROM vehicle_views
    WHERE user_id = p_user_id
  ),
  candidates AS (
    SELECT id, brand, body_type, fuel_type,
           condition, price_eur
    FROM vehicles WHERE status = 'disponible'
    AND id NOT IN (SELECT vehicle_id FROM already_seen)
    LIMIT 200
  ),
  scored AS (
    SELECT c.id,
      SUM(
        CASE WHEN s.brand = c.brand THEN 5 ELSE 0 END +
        CASE WHEN s.body_type = c.body_type THEN 4 ELSE 0 END +
        CASE WHEN s.fuel_type = c.fuel_type THEN 3 ELSE 0 END +
        CASE WHEN s.condition = c.condition THEN 2 ELSE 0 END +
        CASE WHEN c.price_eur BETWEEN s.price_eur*0.8
          AND s.price_eur*1.2 THEN 4 ELSE 0 END
      )::FLOAT AS total_score
    FROM seeds s CROSS JOIN candidates c
    WHERE c.id != s.id
    GROUP BY c.id
    HAVING SUM(
      CASE WHEN s.brand = c.brand THEN 1 ELSE 0 END
    ) > 0
  )
  SELECT id AS vehicle_id, total_score AS score,
    'Base sur vos favoris' AS reason
  FROM scored ORDER BY score DESC, RANDOM()
  LIMIT p_limit;
$$;

-- ============================================================
-- RE-ENGAGEMENT via pg_cron (optional — execute if pg_cron enabled)
-- ============================================================
-- SELECT cron.schedule(
--   'weekly-reengagement',
--   '0 9 * * 1',
--   $$SELECT net.http_post(
--     url := 'https://drazono.vercel.app/api/cron/reengagement',
--     headers := '{"x-cron-secret":"YOUR_CRON_SECRET"}'::jsonb
--   )$$
-- );
