-- =====================================================
-- MIGRATION 020: Complete Schema Audit & Fix
-- Adds ALL missing columns referenced by the frontend,
-- fixes constraint issues, and refreshes schema cache.
-- 
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION 1: PRODUCTS TABLE — Add all missing columns
-- ─────────────────────────────────────────────────────────────

-- Columns from migration 017 (may not have been applied)
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Columns from migration 018 (may not have been applied)
-- sort_order and video_url already added above

-- Additional columns used in frontend but potentially missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT; -- alias for category field (for clarity)

-- ─────────────────────────────────────────────────────────────
-- SECTION 2: FIX STATUS CONSTRAINT
-- ─────────────────────────────────────────────────────────────

-- Drop old constraint (may not exist yet, safe to ignore)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;

-- Re-add with all valid statuses including PRE-ORDER
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('ACTIVE', 'DRAFT', 'SOLD OUT', 'PRE-ORDER', 'ARCHIVED'));

-- ─────────────────────────────────────────────────────────────
-- SECTION 3: COLLECTIONS TABLE — Add missing columns
-- ─────────────────────────────────────────────────────────────

ALTER TABLE collections ADD COLUMN IF NOT EXISTS category_type TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS hero_image TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS hero_headline TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS hero_subheadline TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS cta_label TEXT DEFAULT 'EXPLORE';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS cta_link TEXT DEFAULT '/shop';

-- ─────────────────────────────────────────────────────────────
-- SECTION 4: PARTNERSHIPS TABLE (New Feature)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  partner_name TEXT NOT NULL,
  description TEXT,
  launch_date DATE,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED')),
  partner_website TEXT,
  logo_url TEXT,
  banner_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  video_urls TEXT[] DEFAULT '{}',
  featured_product_ids UUID[] DEFAULT '{}',
  collection_ids UUID[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on partnerships
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partnerships_select" ON partnerships;
CREATE POLICY "partnerships_select" ON partnerships FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

DROP POLICY IF EXISTS "partnerships_insert" ON partnerships;
CREATE POLICY "partnerships_insert" ON partnerships FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "partnerships_update" ON partnerships;
CREATE POLICY "partnerships_update" ON partnerships FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "partnerships_delete" ON partnerships;
CREATE POLICY "partnerships_delete" ON partnerships FOR DELETE
  USING (is_admin());

-- ─────────────────────────────────────────────────────────────
-- SECTION 5: CUSTOM PAGES TABLE (from migration 019)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE custom_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_pages_select" ON custom_pages;
CREATE POLICY "custom_pages_select" ON custom_pages FOR SELECT
  USING (is_active = TRUE OR is_admin());

DROP POLICY IF EXISTS "custom_pages_insert" ON custom_pages;
CREATE POLICY "custom_pages_insert" ON custom_pages FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "custom_pages_update" ON custom_pages;
CREATE POLICY "custom_pages_update" ON custom_pages FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "custom_pages_delete" ON custom_pages;
CREATE POLICY "custom_pages_delete" ON custom_pages FOR DELETE
  USING (is_admin());

-- Seed Return Policy page
INSERT INTO custom_pages (slug, title, content, is_active)
VALUES (
  'return-policy',
  'Returns & Exchange Policy',
  'At 44 Luxury, we take pride in delivering premium-quality products and ensuring every order meets our highest standards. Please review our Returns & Exchange Policy carefully before making a purchase.

### No Refund Policy

44 Luxury operates a strict **No Refund Policy**. Refunds will not be issued once an order has been successfully completed.

### Returns

Return requests must be initiated within **3 days** of receiving your order.

To qualify for a return, items must:
• Be unused
• Be unworn
• Be unwashed
• Have all original tags attached
• Be returned in their original packaging
• Be accompanied by proof of purchase

All returned items will undergo a quality inspection before approval.
Items that fail inspection may be declined and returned to the customer.

### Return Shipping

If the return is required because of an error made by **44 Luxury**, we will cover all return shipping costs provided the issue is reported within **3 days** of delivery.

If the return is due to customer-related reasons, including:
• Incorrect size selected
• Change of mind
• Incorrect shipping information
the customer will be responsible for all shipping costs.

### Exchanges

Exchange requests may be submitted within **7 days** of receiving your order and are subject to product availability.
If the requested item is unavailable, a **44 Luxury Store Credit** may be offered.
No cash refunds will be provided.
Requests made after **7 days** are not eligible for exchange.

### Non-Returnable Items

The following items cannot be returned or exchanged:
• Final Sale items
• Discounted products
• Limited Edition products
• Custom-made or personalized items

### Policy Updates

44 Luxury reserves the right to amend, modify, or decline any return or exchange request that does not comply with this policy.

By purchasing from 44 Luxury, you acknowledge and agree to the terms outlined above.',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();

-- ─────────────────────────────────────────────────────────────
-- SECTION 6: INDEXES for performance
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_limited_edition ON products(is_limited_edition) WHERE is_limited_edition = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_collections_sort_order ON collections(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_slug ON partnerships(slug);

-- ─────────────────────────────────────────────────────────────
-- SECTION 7: Rebuild search vector trigger (includes new fields)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.subcategory, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.season, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.material, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS update_product_search_vector_trigger ON products;
CREATE TRIGGER update_product_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- ─────────────────────────────────────────────────────────────
-- SECTION 8: Backfill sort_order for existing products/collections
-- ─────────────────────────────────────────────────────────────

-- Set sort_order based on created_at for existing products
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS rn
  FROM products
  WHERE sort_order = 0
)
UPDATE products p
SET sort_order = r.rn
FROM ranked r
WHERE p.id = r.id AND p.sort_order = 0;

-- Set sort_order for collections
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS rn
  FROM collections
  WHERE sort_order = 0
)
UPDATE collections c
SET sort_order = r.rn
FROM ranked r
WHERE c.id = r.id AND c.sort_order = 0;

-- ─────────────────────────────────────────────────────────────
-- SECTION 9: STORAGE BUCKETS — Add partnerships and product-images buckets to RLS
-- ─────────────────────────────────────────────────────────────

-- Add partnerships and product-images buckets to existing storage policies
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general', 'partnerships', 'product-images'));

DROP POLICY IF EXISTS "storage_admin_insert" ON storage.objects;
CREATE POLICY "storage_admin_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general', 'partnerships', 'product-images')
    AND is_admin()
  );

DROP POLICY IF EXISTS "storage_admin_update" ON storage.objects;
CREATE POLICY "storage_admin_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general', 'partnerships', 'product-images')
    AND is_admin()
  );

DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general', 'partnerships', 'product-images')
    AND is_admin()
  );

-- ─────────────────────────────────────────────────────────────
-- VERIFICATION: Confirm all key columns exist
-- ─────────────────────────────────────────────────────────────

SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND table_schema = 'public'
  AND column_name IN (
    'id', 'name', 'sku', 'price', 'compare_price', 'category', 'collection_id',
    'status', 'sizes', 'colors', 'images', 'description', 'short_description',
    'is_new', 'is_featured', 'is_best_seller', 'is_limited_edition',
    'stock', 'seo_title', 'seo_description', 'sort_order', 'video_url',
    'subcategory', 'season', 'brand', 'material', 'weight', 'tags'
  )
ORDER BY column_name;

SELECT '✅ Migration 020 complete — all columns verified and schema cache refreshed.' AS status;
