-- 44LUXURY Database Schema
-- Initial Migration: Core Tables, Triggers, and RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Extends Supabase Auth users
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster role lookups
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- COLLECTIONS TABLE
-- Product collections and categories
-- =====================================================

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'unisex' CHECK (category IN ('men', 'women', 'unisex')),
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('ACTIVE', 'DRAFT')),
  description TEXT,
  hero_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  branches JSONB DEFAULT '[]',
  hero_headline TEXT,
  hero_subheadline TEXT,
  cta_label TEXT DEFAULT 'EXPLORE',
  cta_link TEXT DEFAULT '/shop',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for collections
CREATE INDEX idx_collections_status ON collections(status);
CREATE INDEX idx_collections_category ON collections(category);
CREATE INDEX idx_collections_slug ON collections(slug);

-- =====================================================
-- PRODUCTS TABLE
-- Main product catalog
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price INTEGER NOT NULL, -- Price in kobo (₦ × 100)
  compare_price INTEGER, -- Strike-through price
  category TEXT NOT NULL CHECK (category IN ('men', 'women', 'unisex')),
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('ACTIVE', 'DRAFT', 'SOLD OUT')),
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  description TEXT,
  short_description TEXT,
  is_new BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_products_is_featured ON products(is_featured);

-- Full-text search index
ALTER TABLE products ADD COLUMN search_vector tsvector;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- =====================================================
-- ORDERS TABLE
-- Customer orders
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  total INTEGER NOT NULL, -- In kobo
  shipping_cost INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ORDERED' CHECK (status IN ('ORDERED', 'DISPATCHED', 'DELIVERED', 'CANCELLED')),
  payment_method TEXT CHECK (payment_method IN ('paystack', 'paypal', 'crypto')),
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'APPROVED', 'FAILED', 'REFUNDED')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- ORDER_ITEMS TABLE
-- Line items for each order
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL, -- Unit price snapshot in kobo
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for order items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- COMPLAINTS TABLE
-- Customer complaints and support tickets
-- =====================================================

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  email TEXT,
  subject TEXT NOT NULL,
  order_number TEXT,
  message TEXT NOT NULL CHECK (LENGTH(message) >= 20),
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN REVIEW', 'RESOLVED')),
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for complaints
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_complaint_number ON complaints(complaint_number);

-- =====================================================
-- ADDRESSES TABLE
-- User saved addresses
-- =====================================================

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT,
  name TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for addresses
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);

-- =====================================================
-- CART_ITEMS TABLE
-- Server-side cart persistence
-- =====================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id, size, color)
);

-- Index for cart items
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- =====================================================
-- WISHLIST TABLE
-- User wishlist
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Index for wishlist
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- =====================================================
-- MEDIA_FILES TABLE
-- Cloudinary media library
-- =====================================================

CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  name TEXT,
  type TEXT CHECK (type IN ('image', 'video')),
  size INTEGER,
  dimensions TEXT,
  tags TEXT[] DEFAULT '{}',
  used_in TEXT[] DEFAULT '{}',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for media files
CREATE INDEX idx_media_files_type ON media_files(type);
CREATE INDEX idx_media_files_tags ON media_files USING GIN(tags);

-- =====================================================
-- HERO_SLIDES TABLE
-- Homepage hero slider
-- =====================================================

CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT NOT NULL,
  headline TEXT,
  subheadline TEXT,
  cta_label TEXT DEFAULT 'SHOP NOW',
  cta_link TEXT DEFAULT '/shop',
  text_position TEXT DEFAULT 'bottom-left',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for hero slides
CREATE INDEX idx_hero_slides_sort_order ON hero_slides(sort_order);

-- =====================================================
-- HOMEPAGE_CONFIG TABLE
-- Homepage section configuration (single row)
-- =====================================================

CREATE TABLE IF NOT EXISTS homepage_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sections JSONB NOT NULL DEFAULT '[]',
  featured_product_ids UUID[] DEFAULT '{}',
  announcement JSONB DEFAULT '{"visible": false, "messages": [], "bgColor": "#000", "textColor": "#fff"}',
  hero_display_mode TEXT DEFAULT 'slideshow',
  hero_speed INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- VIDEOS TABLE
-- Video content management
-- =====================================================

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source TEXT DEFAULT 'UPLOAD' CHECK (source IN ('UPLOAD', 'YOUTUBE', 'VIMEO')),
  url TEXT,
  youtube_url TEXT,
  vimeo_url TEXT,
  thumbnail TEXT,
  pages TEXT[] DEFAULT '{}',
  display_style TEXT,
  playback TEXT[] DEFAULT '{}',
  overlay_headline TEXT,
  overlay_subtext TEXT,
  overlay_cta TEXT,
  display_mode TEXT DEFAULT 'SINGLE',
  transition_speed INTEGER DEFAULT 5,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for videos
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_pages ON videos USING GIN(pages);

-- =====================================================
-- SITE_SETTINGS TABLE
-- Global site configuration (single row)
-- =====================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name TEXT DEFAULT '44LUXURY',
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  currency TEXT DEFAULT '₦',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CONTACT_MESSAGES TABLE
-- Contact form submissions
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for contact messages
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- =====================================================
-- NEWSLETTER_SUBSCRIBERS TABLE
-- Newsletter email list
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for newsletter
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- =====================================================
-- USER_PREFERENCES TABLE
-- User notification preferences
-- =====================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_updates BOOLEAN DEFAULT TRUE,
  new_arrivals BOOLEAN DEFAULT TRUE,
  exclusive_offers BOOLEAN DEFAULT FALSE,
  lookbook_drops BOOLEAN DEFAULT TRUE,
  sms_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user preferences
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- =====================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_config_updated_at BEFORE UPDATE ON homepage_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'customer'
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function: Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM orders;
  
  NEW.order_number := 'LUX-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate order number
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Function: Generate complaint number
CREATE OR REPLACE FUNCTION generate_complaint_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(complaint_number FROM 2) AS INTEGER)), 0) + 1
  INTO next_number
  FROM complaints;
  
  NEW.complaint_number := 'C' || LPAD(next_number::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate complaint number
CREATE TRIGGER set_complaint_number
  BEFORE INSERT ON complaints
  FOR EACH ROW
  WHEN (NEW.complaint_number IS NULL)
  EXECUTE FUNCTION generate_complaint_number();

-- Function: Enforce single default address per user
CREATE OR REPLACE FUNCTION enforce_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Enforce single default address
CREATE TRIGGER enforce_default_address
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION enforce_single_default_address();

-- Function: Update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update search vector on product changes
CREATE TRIGGER update_products_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default site settings
INSERT INTO site_settings (brand_name, contact_email, phone, address, currency)
VALUES (
  '44LUXURY',
  'info@44luxury.com',
  '+234 XXX XXX XXXX',
  'Lagos, Nigeria',
  '₦'
) ON CONFLICT DO NOTHING;

-- Insert default homepage config
INSERT INTO homepage_config (sections, announcement, hero_display_mode, hero_speed)
VALUES (
  '[]'::jsonb,
  '{"visible": false, "messages": [], "bgColor": "#000", "textColor": "#fff"}'::jsonb,
  'slideshow',
  5
) ON CONFLICT DO NOTHING;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables created
SELECT 'Migration completed successfully!' AS status;
