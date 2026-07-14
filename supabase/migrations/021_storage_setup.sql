-- ─────────────────────────────────────────────────────────────
-- STORAGE SETUP: product-images bucket
-- ─────────────────────────────────────────────────────────────

-- 1. Create or update the product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  TRUE,
  31457280, -- 30MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 31457280,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

-- 2. Define policies for storage.objects
-- Ensure RLS is enabled on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Select/Read: Public access to read all objects in the product-images bucket
DROP POLICY IF EXISTS "Public Read product-images" ON storage.objects;
CREATE POLICY "Public Read product-images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Insert/Upload: Only authenticated administrators can upload
DROP POLICY IF EXISTS "Admin Insert product-images" ON storage.objects;
CREATE POLICY "Admin Insert product-images" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (
      -- Check is_admin helper function or role
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    )
  );

-- Update: Only authenticated administrators can update
DROP POLICY IF EXISTS "Admin Update product-images" ON storage.objects;
CREATE POLICY "Admin Update product-images" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    )
  );

-- Delete: Only authenticated administrators can delete
DROP POLICY IF EXISTS "Admin Delete product-images" ON storage.objects;
CREATE POLICY "Admin Delete product-images" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    )
  );
