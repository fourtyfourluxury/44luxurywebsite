-- 44LUXURY Row Level Security Policies
-- Defines access control for all tables

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

-- Users can update their own profile (name, phone only)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- =====================================================
-- PRODUCTS TABLE POLICIES
-- =====================================================

-- Anyone can view ACTIVE products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

-- Admins can insert products
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update products
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

-- Admins can delete products
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- =====================================================
-- COLLECTIONS TABLE POLICIES
-- =====================================================

-- Anyone can view ACTIVE collections
CREATE POLICY "Anyone can view active collections"
  ON collections FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

-- Admins can insert collections
CREATE POLICY "Admins can insert collections"
  ON collections FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update collections
CREATE POLICY "Admins can update collections"
  ON collections FOR UPDATE
  USING (is_admin());

-- Admins can delete collections
CREATE POLICY "Admins can delete collections"
  ON collections FOR DELETE
  USING (is_admin());

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

-- Users can view their own orders, admins can view all
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update orders (status changes)
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- =====================================================
-- ORDER_ITEMS TABLE POLICIES
-- =====================================================

-- Users can view items from their own orders, admins can view all
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

-- Order items are created via Edge Function (service role)
-- No direct INSERT policy needed for users

-- =====================================================
-- COMPLAINTS TABLE POLICIES
-- =====================================================

-- Users can view their own complaints, admins can view all
CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Authenticated users can create complaints
CREATE POLICY "Authenticated users can create complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update complaints (responses)
CREATE POLICY "Admins can update complaints"
  ON complaints FOR UPDATE
  USING (is_admin());

-- =====================================================
-- ADDRESSES TABLE POLICIES
-- =====================================================

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own addresses
CREATE POLICY "Users can create own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CART_ITEMS TABLE POLICIES
-- =====================================================

-- Users can view their own cart
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their own cart
CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete from their own cart
CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- WISHLIST TABLE POLICIES
-- =====================================================

-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to own wishlist"
  ON wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can delete from own wishlist"
  ON wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- MEDIA_FILES TABLE POLICIES
-- =====================================================

-- Admins can view all media
CREATE POLICY "Admins can view media"
  ON media_files FOR SELECT
  USING (is_admin());

-- Admins can upload media
CREATE POLICY "Admins can insert media"
  ON media_files FOR INSERT
  WITH CHECK (is_admin());

-- Admins can delete media
CREATE POLICY "Admins can delete media"
  ON media_files FOR DELETE
  USING (is_admin());

-- =====================================================
-- HERO_SLIDES TABLE POLICIES
-- =====================================================

-- Anyone can view hero slides
CREATE POLICY "Anyone can view hero slides"
  ON hero_slides FOR SELECT
  USING (true);

-- Admins can manage hero slides
CREATE POLICY "Admins can insert hero slides"
  ON hero_slides FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update hero slides"
  ON hero_slides FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete hero slides"
  ON hero_slides FOR DELETE
  USING (is_admin());

-- =====================================================
-- HOMEPAGE_CONFIG TABLE POLICIES
-- =====================================================

-- Anyone can view homepage config
CREATE POLICY "Anyone can view homepage config"
  ON homepage_config FOR SELECT
  USING (true);

-- Admins can update homepage config
CREATE POLICY "Admins can update homepage config"
  ON homepage_config FOR UPDATE
  USING (is_admin());

-- =====================================================
-- VIDEOS TABLE POLICIES
-- =====================================================

-- Anyone can view ACTIVE videos
CREATE POLICY "Anyone can view active videos"
  ON videos FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

-- Admins can manage videos
CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE
  USING (is_admin());

-- =====================================================
-- SITE_SETTINGS TABLE POLICIES
-- =====================================================

-- Anyone can view site settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Admins can update site settings
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (is_admin());

-- =====================================================
-- CONTACT_MESSAGES TABLE POLICIES
-- =====================================================

-- Anyone can submit contact messages
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Admins can view contact messages
CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  USING (is_admin());

-- =====================================================
-- NEWSLETTER_SUBSCRIBERS TABLE POLICIES
-- =====================================================

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins can view subscribers
CREATE POLICY "Admins can view subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (is_admin());

-- =====================================================
-- USER_PREFERENCES TABLE POLICIES
-- =====================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES COMPLETE
-- =====================================================

SELECT 'RLS policies created successfully!' AS status;
