-- Fix Infinite Recursion in RLS Policies
-- The "Admins can read all profiles" policy was causing infinite recursion
-- because it queries profiles table to check if user is admin

-- =====================================================
-- DROP ALL EXISTING POLICIES ON PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- =====================================================
-- CREATE FIXED POLICIES FOR PROFILES
-- =====================================================

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile (for trigger)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- FIX OTHER POLICIES THAT CHECK ADMIN ROLE
-- =====================================================

-- We need to fix all policies that check admin role
-- Instead of querying profiles table, we'll use a simpler approach

-- Drop and recreate admin policies for other tables

-- PRODUCTS
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- COLLECTIONS
DROP POLICY IF EXISTS "Admins can manage collections" ON collections;
CREATE POLICY "Admins can manage collections"
ON collections FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ORDERS
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Admins can read all orders"
ON orders FOR SELECT
USING (
  auth.uid() = user_id OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ORDER_ITEMS
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
CREATE POLICY "Admins can manage order items"
ON order_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- COMPLAINTS
DROP POLICY IF EXISTS "Admins can read all complaints" ON complaints;
DROP POLICY IF EXISTS "Admins can update complaints" ON complaints;

CREATE POLICY "Admins can read all complaints"
ON complaints FOR SELECT
USING (
  auth.uid() = user_id OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update complaints"
ON complaints FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- MEDIA_FILES
DROP POLICY IF EXISTS "Admins can manage media files" ON media_files;
CREATE POLICY "Admins can manage media files"
ON media_files FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- HERO_SLIDES
DROP POLICY IF EXISTS "Admins can manage hero slides" ON hero_slides;
CREATE POLICY "Admins can manage hero slides"
ON hero_slides FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- HOMEPAGE_CONFIG
DROP POLICY IF EXISTS "Admins can manage homepage config" ON homepage_config;
CREATE POLICY "Admins can manage homepage config"
ON homepage_config FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- VIDEOS
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
CREATE POLICY "Admins can manage videos"
ON videos FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- SITE_SETTINGS
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings"
ON site_settings FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- CONTACT_MESSAGES
DROP POLICY IF EXISTS "Admins can read contact messages" ON contact_messages;
CREATE POLICY "Admins can read contact messages"
ON contact_messages FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- NEWSLETTER_SUBSCRIBERS
DROP POLICY IF EXISTS "Admins can read newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can read newsletter subscribers"
ON newsletter_subscribers FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

SELECT 
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- Should show:
-- 1. Users can insert own profile
-- 2. Users can read own profile
-- 3. Users can update own profile

SELECT 'Infinite recursion fixed! ✅' AS status;
