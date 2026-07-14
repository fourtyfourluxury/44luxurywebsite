-- =====================================================
-- MIGRATION 018 — Product Video URL & Sort Order
-- Adds video_url, is_limited_edition, sort_order columns.
-- Run in Supabase SQL Editor.
-- =====================================================

-- Add new columns to products table if they do not exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Backfill sort_order based on creation order so existing products sort correctly
UPDATE products p
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM products
) sub
WHERE p.id = sub.id;

-- Verify
SELECT 'Migration 018 complete — video_url, is_limited_edition, sort_order added' AS status;
