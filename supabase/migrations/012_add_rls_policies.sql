-- Add RLS Policies for All Tables
-- This migration adds Row Level Security policies to allow proper access control

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- PRODUCTS TABLE POLICIES
-- =====================================================

-- Allow everyone to read active products
CREATE POLICY "Anyone can read active products"
ON products FOR SELECT
USING (status = 'ACTIVE' OR status = 'SOLD OUT');

-- Allow admins to manage products
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- COLLECTIONS TABLE POLICIES
-- =====================================================

-- Allow everyone to read active collections
CREATE POLICY "Anyone can read active collections"
ON collections FOR SELECT
USING (status = 'ACTIVE');

-- Allow admins to manage collections
CREATE POLICY "Admins can manage collections"
ON collections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

-- Allow users to read their own orders
CREATE POLICY "Users can read own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create orders
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all orders
CREATE POLICY "Admins can read all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update orders
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- ORDER_ITEMS TABLE POLICIES
-- =====================================================

-- Allow users to read their own order items
CREATE POLICY "Users can read own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Allow users to create order items
CREATE POLICY "Users can create order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Allow admins to manage all order items
CREATE POLICY "Admins can manage order items"
ON order_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- COMPLAINTS TABLE POLICIES
-- =====================================================

-- Allow users to read their own complaints
CREATE POLICY "Users can read own complaints"
ON complaints FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create complaints
CREATE POLICY "Users can create complaints"
ON complaints FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all complaints
CREATE POLICY "Admins can read all complaints"
ON complaints FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update complaints
CREATE POLICY "Admins can update complaints"
ON complaints FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- ADDRESSES TABLE POLICIES
-- =====================================================

-- Allow users to manage their own addresses
CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CART_ITEMS TABLE POLICIES
-- =====================================================

-- Allow users to manage their own cart
CREATE POLICY "Users can manage own cart"
ON cart_items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- WISHLIST TABLE POLICIES
-- =====================================================

-- Allow users to manage their own wishlist
CREATE POLICY "Users can manage own wishlist"
ON wishlist FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER_PREFERENCES TABLE POLICIES
-- =====================================================

-- Allow users to manage their own preferences
CREATE POLICY "Users can manage own preferences"
ON user_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- MEDIA_FILES TABLE POLICIES
-- =====================================================

-- Allow everyone to read media files
CREATE POLICY "Anyone can read media files"
ON media_files FOR SELECT
USING (true);

-- Allow admins to manage media files
CREATE POLICY "Admins can manage media files"
ON media_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- HERO_SLIDES TABLE POLICIES
-- =====================================================

-- Allow everyone to read hero slides
CREATE POLICY "Anyone can read hero slides"
ON hero_slides FOR SELECT
USING (true);

-- Allow admins to manage hero slides
CREATE POLICY "Admins can manage hero slides"
ON hero_slides FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- HOMEPAGE_CONFIG TABLE POLICIES
-- =====================================================

-- Allow everyone to read homepage config
CREATE POLICY "Anyone can read homepage config"
ON homepage_config FOR SELECT
USING (true);

-- Allow admins to manage homepage config
CREATE POLICY "Admins can manage homepage config"
ON homepage_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- VIDEOS TABLE POLICIES
-- =====================================================

-- Allow everyone to read active videos
CREATE POLICY "Anyone can read active videos"
ON videos FOR SELECT
USING (status = 'ACTIVE');

-- Allow admins to manage videos
CREATE POLICY "Admins can manage videos"
ON videos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- SITE_SETTINGS TABLE POLICIES
-- =====================================================

-- Allow everyone to read site settings
CREATE POLICY "Anyone can read site settings"
ON site_settings FOR SELECT
USING (true);

-- Allow admins to manage site settings
CREATE POLICY "Admins can manage site settings"
ON site_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- CONTACT_MESSAGES TABLE POLICIES
-- =====================================================

-- Allow anyone to create contact messages
CREATE POLICY "Anyone can create contact messages"
ON contact_messages FOR INSERT
WITH CHECK (true);

-- Allow admins to read contact messages
CREATE POLICY "Admins can read contact messages"
ON contact_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- NEWSLETTER_SUBSCRIBERS TABLE POLICIES
-- =====================================================

-- Allow anyone to subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
ON newsletter_subscribers FOR INSERT
WITH CHECK (true);

-- Allow admins to read newsletter subscribers
CREATE POLICY "Admins can read newsletter subscribers"
ON newsletter_subscribers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'RLS policies added successfully!' AS status;
