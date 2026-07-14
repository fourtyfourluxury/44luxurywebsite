-- =====================================================
-- ADD PRODUCT AND COLLECTION FIELDS MIGRATION
-- Adds subcategory, season, is_best_seller, and supports 'PRE-ORDER' status for products.
-- Adds category_type, seo_title, seo_description, seo_keywords for collections.
-- Copy and paste this script into your Supabase SQL Editor.
-- =====================================================

-- 1. Add new columns to products table if they do not exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Update status check constraint to support PRE-ORDER
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('ACTIVE', 'DRAFT', 'SOLD OUT', 'PRE-ORDER'));

-- 3. Rebuild search vector trigger function to include subcategory & season for better search
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.subcategory, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.season, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Add new columns to collections table if they do not exist
ALTER TABLE collections ADD COLUMN IF NOT EXISTS category_type TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- Verify migration message
SELECT 'Product and Collection fields migration completed successfully!' AS status;
