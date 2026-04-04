-- ============================================================
-- DRAZONO — SOCIAL CALENDAR TABLE
-- Execute in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.social_calendar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  day_number integer NOT NULL,
  theme text,
  platform text NOT NULL,
  content text NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id),
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_calendar_week
  ON social_calendar(week_start DESC);

ALTER TABLE public.social_calendar ENABLE ROW LEVEL SECURITY;

-- Allow admin full access, and service role insert from API
CREATE POLICY "social_calendar_admin" ON public.social_calendar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "social_calendar_anon_insert" ON public.social_calendar
  FOR INSERT WITH CHECK (true);
