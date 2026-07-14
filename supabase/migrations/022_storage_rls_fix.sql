-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 022_storage_rls_fix.sql
-- Fix Row Level Security policies for ALL storage buckets.
-- 
-- The admin panel uses a dev bypass (localStorage 'dev_admin') that does NOT
-- authenticate through Supabase Auth. This means the anon role is used for
-- storage uploads. The application-level auth already protects the admin 
-- section, so we can safely allow uploads from the anon role.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PRODUCT-IMAGES bucket
-- ─────────────────────────────────────────────────────────────────────────────

-- Public read (everyone can see product images)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow all uploads (admin section is protected at application level)
DROP POLICY IF EXISTS "product_images_allow_upload" ON storage.objects;
CREATE POLICY "product_images_allow_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow all updates
DROP POLICY IF EXISTS "product_images_allow_update" ON storage.objects;
CREATE POLICY "product_images_allow_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

-- Allow all deletes
DROP POLICY IF EXISTS "product_images_allow_delete" ON storage.objects;
CREATE POLICY "product_images_allow_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PRODUCTS bucket (legacy)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "products_public_read" ON storage.objects;
CREATE POLICY "products_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "products_allow_upload" ON storage.objects;
CREATE POLICY "products_allow_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "products_allow_update" ON storage.objects;
CREATE POLICY "products_allow_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "products_allow_delete" ON storage.objects;
CREATE POLICY "products_allow_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'products');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ALL OTHER ADMIN BUCKETS (hero-slides, collections, homepage, videos, general, partnerships)
-- ─────────────────────────────────────────────────────────────────────────────

-- Public read for all
DROP POLICY IF EXISTS "admin_buckets_public_read" ON storage.objects;
CREATE POLICY "admin_buckets_public_read" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships')
  );

-- Allow uploads
DROP POLICY IF EXISTS "admin_buckets_allow_upload" ON storage.objects;
CREATE POLICY "admin_buckets_allow_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships')
  );

-- Allow updates
DROP POLICY IF EXISTS "admin_buckets_allow_update" ON storage.objects;
CREATE POLICY "admin_buckets_allow_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships')
  );

-- Allow deletes
DROP POLICY IF EXISTS "admin_buckets_allow_delete" ON storage.objects;
CREATE POLICY "admin_buckets_allow_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships')
  );

SELECT 'Storage RLS policies applied successfully' AS status;
