-- Setup Supabase Storage for Media Management
-- This replaces Cloudinary with Supabase Storage

-- =====================================================
-- STEP 1: Create Storage Buckets
-- =====================================================

-- Create buckets for different media types
-- File size limits: 30MB for images, 100MB for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('products', 'products', true, 31457280, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('collections', 'collections', true, 31457280, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('homepage', 'homepage', true, 31457280, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('hero-slides', 'hero-slides', true, 31457280, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png']),
  ('general', 'general', true, 31457280, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STEP 2: Public Read Access Policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for products" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for collections" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for homepage" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for general" ON storage.objects;

-- Allow public read access to all buckets
CREATE POLICY "Public read access for products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Public read access for collections"
ON storage.objects FOR SELECT
USING (bucket_id = 'collections');

CREATE POLICY "Public read access for homepage"
ON storage.objects FOR SELECT
USING (bucket_id = 'homepage');

CREATE POLICY "Public read access for hero-slides"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-slides');

CREATE POLICY "Public read access for videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Public read access for general"
ON storage.objects FOR SELECT
USING (bucket_id = 'general');

-- =====================================================
-- STEP 3: Admin Upload Policies
-- =====================================================

-- Drop existing upload policies if they exist
DROP POLICY IF EXISTS "Admins can upload to products" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to collections" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to homepage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to general" ON storage.objects;

-- Allow admins to upload files
CREATE POLICY "Admins can upload to products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can upload to collections"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'collections' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can upload to homepage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'homepage' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can upload to hero-slides"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-slides' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can upload to videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can upload to general"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'general' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- =====================================================
-- STEP 4: Admin Update Policies
-- =====================================================

-- Drop existing update policies if they exist
DROP POLICY IF EXISTS "Admins can update products" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update collections" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update homepage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update general" ON storage.objects;

-- Allow admins to update files
CREATE POLICY "Admins can update products"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update collections"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'collections' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update homepage"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'homepage' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update hero-slides"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-slides' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update general"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'general' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- =====================================================
-- STEP 5: Admin Delete Policies
-- =====================================================

-- Drop existing delete policies if they exist
DROP POLICY IF EXISTS "Admins can delete from products" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from collections" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from homepage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from general" ON storage.objects;

-- Allow admins to delete files
CREATE POLICY "Admins can delete from products"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete from collections"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'collections' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete from homepage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'homepage' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete from hero-slides"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-slides' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete from videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete from general"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'general' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check buckets were created
SELECT 
  id AS bucket_name,
  public,
  file_size_limit / 1048576 AS max_size_mb,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general')
ORDER BY id;

-- Check policies were created
SELECT 
  policyname,
  cmd AS operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has conditions'
    ELSE 'No conditions'
  END AS has_conditions
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%products%'
     OR policyname LIKE '%collections%'
     OR policyname LIKE '%homepage%'
     OR policyname LIKE '%hero-slides%'
     OR policyname LIKE '%videos%'
     OR policyname LIKE '%general%'
ORDER BY policyname;

-- Summary
SELECT 
  '✅ Supabase Storage Setup Complete!' AS status,
  (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('products', 'collections', 'homepage', 'hero-slides', 'videos', 'general')) AS buckets_created,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') AS storage_policies;
