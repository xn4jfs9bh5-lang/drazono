-- ============================================================
-- DRAZONO — PRICE TYPE MIGRATION (FOB / CIF)
-- Execute in Supabase SQL Editor
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_type text DEFAULT 'fob';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS destination_country text;
