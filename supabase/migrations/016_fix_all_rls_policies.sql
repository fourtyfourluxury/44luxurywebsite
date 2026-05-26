-- =====================================================
-- FIX: Clean up all conflicting RLS policies
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Recreate is_admin() function (SECURITY DEFINER avoids recursion)
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 2: Fix PROFILES policies (avoid recursion)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

-- Everyone can read all profiles (avoids recursion when checking admin)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile creation (for auth trigger)
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 3: Fix PRODUCTS policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

DROP POLICY IF EXISTS "products_insert" ON products;
CREATE POLICY "products_insert" ON products FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "products_update" ON products;
CREATE POLICY "products_update" ON products FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_delete" ON products FOR DELETE
  USING (is_admin());

-- =====================================================
-- STEP 4: Fix COLLECTIONS policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active collections" ON collections;
DROP POLICY IF EXISTS "Admins can insert collections" ON collections;
DROP POLICY IF EXISTS "Admins can update collections" ON collections;
DROP POLICY IF EXISTS "Admins can delete collections" ON collections;
DROP POLICY IF EXISTS "Admins can manage collections" ON collections;

DROP POLICY IF EXISTS "collections_select" ON collections;
CREATE POLICY "collections_select" ON collections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "collections_insert" ON collections;
CREATE POLICY "collections_insert" ON collections FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "collections_update" ON collections;
CREATE POLICY "collections_update" ON collections FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "collections_delete" ON collections;
CREATE POLICY "collections_delete" ON collections FOR DELETE
  USING (is_admin());

-- =====================================================
-- STEP 5: Fix MEDIA_FILES policies
-- =====================================================
DROP POLICY IF EXISTS "Admins can view media" ON media_files;
DROP POLICY IF EXISTS "Admins can insert media" ON media_files;
DROP POLICY IF EXISTS "Admins can delete media" ON media_files;
DROP POLICY IF EXISTS "Admins can manage media files" ON media_files;

DROP POLICY IF EXISTS "media_select" ON media_files;
CREATE POLICY "media_select" ON media_files FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "media_insert" ON media_files;
CREATE POLICY "media_insert" ON media_files FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "media_update" ON media_files;
CREATE POLICY "media_update" ON media_files FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "media_delete" ON media_files;
CREATE POLICY "media_delete" ON media_files FOR DELETE
  USING (is_admin());

-- =====================================================
-- STEP 6: Fix STORAGE policies (for deleting files from buckets)
-- =====================================================

-- Drop ALL existing storage policies to start clean
DROP POLICY IF EXISTS "Public read access for products" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for collections" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for homepage" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for general" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload to products" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to collections" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to homepage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to general" ON storage.objects;

DROP POLICY IF EXISTS "Admins can update products" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update collections" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update homepage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update general" ON storage.objects;

DROP POLICY IF EXISTS "Admins can delete from products" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from collections" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from homepage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from general" ON storage.objects;

-- Simplified: One policy for public read across ALL buckets
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general'));

-- Simplified: One policy for admin upload across ALL buckets
DROP POLICY IF EXISTS "storage_admin_insert" ON storage.objects;
CREATE POLICY "storage_admin_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general')
    AND is_admin()
  );

-- Simplified: One policy for admin update across ALL buckets
DROP POLICY IF EXISTS "storage_admin_update" ON storage.objects;
CREATE POLICY "storage_admin_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general')
    AND is_admin()
  );

-- Simplified: One policy for admin delete across ALL buckets
DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general')
    AND is_admin()
  );

-- =====================================================
-- STEP 7: Fix HERO_SLIDES policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Admins can insert hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Admins can update hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Admins can delete hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Admins can manage hero slides" ON hero_slides;

DROP POLICY IF EXISTS "hero_slides_select" ON hero_slides;
CREATE POLICY "hero_slides_select" ON hero_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "hero_slides_insert" ON hero_slides;
CREATE POLICY "hero_slides_insert" ON hero_slides FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "hero_slides_update" ON hero_slides;
CREATE POLICY "hero_slides_update" ON hero_slides FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "hero_slides_delete" ON hero_slides;
CREATE POLICY "hero_slides_delete" ON hero_slides FOR DELETE USING (is_admin());

-- =====================================================
-- STEP 8: Fix VIDEOS policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active videos" ON videos;
DROP POLICY IF EXISTS "Admins can insert videos" ON videos;
DROP POLICY IF EXISTS "Admins can update videos" ON videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON videos;
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;

DROP POLICY IF EXISTS "videos_select" ON videos;
CREATE POLICY "videos_select" ON videos FOR SELECT USING (true);
DROP POLICY IF EXISTS "videos_insert" ON videos;
CREATE POLICY "videos_insert" ON videos FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "videos_update" ON videos;
CREATE POLICY "videos_update" ON videos FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "videos_delete" ON videos;
CREATE POLICY "videos_delete" ON videos FOR DELETE USING (is_admin());

-- =====================================================
-- STEP 9: Fix HOMEPAGE_CONFIG policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view homepage config" ON homepage_config;
DROP POLICY IF EXISTS "Admins can update homepage config" ON homepage_config;
DROP POLICY IF EXISTS "Admins can manage homepage config" ON homepage_config;

DROP POLICY IF EXISTS "homepage_config_select" ON homepage_config;
CREATE POLICY "homepage_config_select" ON homepage_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "homepage_config_insert" ON homepage_config;
CREATE POLICY "homepage_config_insert" ON homepage_config FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "homepage_config_update" ON homepage_config;
CREATE POLICY "homepage_config_update" ON homepage_config FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "homepage_config_delete" ON homepage_config;
CREATE POLICY "homepage_config_delete" ON homepage_config FOR DELETE USING (is_admin());

-- =====================================================
-- STEP 10: Verify your admin user exists
-- =====================================================
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- =====================================================
-- DONE
-- =====================================================
SELECT '✅ All RLS policies fixed! Delete, update, and storage operations should now work for admin users.' AS status;
