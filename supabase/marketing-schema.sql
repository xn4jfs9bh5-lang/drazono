-- ============================================================
-- DRAZONO — MARKETING SCHEMA
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. ANALYTICS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  page text,
  vehicle_id uuid,
  session_id text,
  country text,
  device text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public insert (tracking from any visitor)
CREATE POLICY "analytics_public_insert" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Admin read only
CREATE POLICY "analytics_admin_select" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 2. EMAIL LOGS (idempotency for email notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid,
  email text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  success boolean DEFAULT true,
  error text
);

CREATE INDEX IF NOT EXISTS idx_email_logs_vehicle ON email_logs(vehicle_id);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admin insert + read
CREATE POLICY "email_logs_admin_insert" ON public.email_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "email_logs_admin_select" ON public.email_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Also allow anon insert for the API route (uses anon key)
CREATE POLICY "email_logs_anon_insert" ON public.email_logs
  FOR INSERT WITH CHECK (true);
