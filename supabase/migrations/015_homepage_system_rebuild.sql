-- =====================================================
-- HOMEPAGE SYSTEM REBUILD MIGRATION
-- Makes homepage fully dynamic and admin-controllable
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 1. ADD SINGLE-ROW CONSTRAINT TO HOMEPAGE_CONFIG
-- ─────────────────────────────────────────────────────

-- Drop existing constraint if it exists
ALTER TABLE homepage_config DROP CONSTRAINT IF EXISTS single_row_config;

-- Add constraint to ensure only one row with id=1
ALTER TABLE homepage_config ADD CONSTRAINT single_row_config CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid);

-- ─────────────────────────────────────────────────────
-- 2. EXPAND HOMEPAGE_CONFIG SCHEMA
-- Add columns for all homepage sections
-- ─────────────────────────────────────────────────────

-- Editorial Banner Section
ALTER TABLE homepage_config
ADD COLUMN IF NOT EXISTS editorial_banner JSONB DEFAULT '{
  "visible": true,
  "image": "https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1440&auto=format&fit=crop",
  "tag": "SS25 — The Core Edit",
  "headline": "THE UNCOMPROMISING FORM",
  "description": "Architecture meets streetwear. Every silhouette is a deliberate act — precision-cut, heavyweight-fabricated, built for those who refuse to be average.",
  "ctaLabel": "EXPLORE THE COLLECTION",
  "ctaLink": "/shop"
}'::jsonb;

-- Stats Strip Section
ALTER TABLE homepage_config
ADD COLUMN IF NOT EXISTS stats_strip JSONB DEFAULT '{
  "visible": true,
  "stats": [
    {"value": "2000+", "label": "PIECES SOLD"},
    {"value": "98%", "label": "SATISFACTION RATE"},
    {"value": "24/7", "label": "CUSTOMER SUPPORT"},
    {"value": "50+", "label": "COUNTRIES SHIPPED"}
  ]
}'::jsonb;

-- Newsletter Section
ALTER TABLE homepage_config
ADD COLUMN IF NOT EXISTS newsletter JSONB DEFAULT '{
  "visible": true,
  "headline": "STAY IN THE LOOP",
  "description": "Be the first to know about new drops, exclusive offers, and behind-the-scenes content.",
  "placeholder": "Enter your email address"
}'::jsonb;

-- Video Section
ALTER TABLE homepage_config
ADD COLUMN IF NOT EXISTS video_section JSONB DEFAULT '{
  "visible": false,
  "url": "",
  "thumbnail": "",
  "headline": "THE UNCOMPROMISING FORM",
  "subtext": "Crafted for those who command attention.",
  "playback": "AUTOPLAY_MUTED_LOOP"
}'::jsonb;

-- Collections Row Section
ALTER TABLE homepage_config
ADD COLUMN IF NOT EXISTS collections_row JSONB DEFAULT '{
  "visible": true,
  "headline": "COLLECTIONS",
  "mode": "auto",
  "collectionIds": []
}'::jsonb;

-- New Arrivals Section (enhance existing)
ALTER TABLE homepage_config
ADD COLUMN IF NOT EXISTS new_arrivals JSONB DEFAULT '{
  "visible": true,
  "headline": "NEW ARRIVALS",
  "mode": "auto",
  "productIds": [],
  "limit": 8
}'::jsonb;

-- ─────────────────────────────────────────────────────
-- 3. INSERT DEFAULT HOMEPAGE CONFIG (IF NOT EXISTS)
-- ─────────────────────────────────────────────────────

INSERT INTO homepage_config (
  id,
  sections,
  featured_product_ids,
  announcement,
  hero_display_mode,
  hero_speed,
  editorial_banner,
  stats_strip,
  newsletter,
  video_section,
  collections_row,
  new_arrivals,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '[]'::jsonb,
  '{}'::uuid[],
  '{
    "visible": true,
    "messages": [
      "FREE DELIVERY ON ORDERS ABOVE ₦150,000",
      "NEW ARRIVALS — SS25 COLLECTION NOW LIVE",
      "OFFICIAL STOCKIST: LAGOS · ABUJA · LONDON"
    ],
    "bgColor": "#1c1c18",
    "textColor": "#fcf9f3"
  }'::jsonb,
  'slideshow',
  5,
  '{
    "visible": true,
    "image": "https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1440&auto=format&fit=crop",
    "tag": "SS25 — The Core Edit",
    "headline": "THE UNCOMPROMISING FORM",
    "description": "Architecture meets streetwear. Every silhouette is a deliberate act — precision-cut, heavyweight-fabricated, built for those who refuse to be average.",
    "ctaLabel": "EXPLORE THE COLLECTION",
    "ctaLink": "/shop"
  }'::jsonb,
  '{
    "visible": true,
    "stats": [
      {"value": "2000+", "label": "PIECES SOLD"},
      {"value": "98%", "label": "SATISFACTION RATE"},
      {"value": "24/7", "label": "CUSTOMER SUPPORT"},
      {"value": "50+", "label": "COUNTRIES SHIPPED"}
    ]
  }'::jsonb,
  '{
    "visible": true,
    "headline": "STAY IN THE LOOP",
    "description": "Be the first to know about new drops, exclusive offers, and behind-the-scenes content.",
    "placeholder": "Enter your email address"
  }'::jsonb,
  '{
    "visible": false,
    "url": "",
    "thumbnail": "",
    "headline": "THE UNCOMPROMISING FORM",
    "subtext": "Crafted for those who command attention.",
    "playback": "AUTOPLAY_MUTED_LOOP"
  }'::jsonb,
  '{
    "visible": true,
    "headline": "COLLECTIONS",
    "mode": "auto",
    "collectionIds": []
  }'::jsonb,
  '{
    "visible": true,
    "headline": "NEW ARRIVALS",
    "mode": "auto",
    "productIds": [],
    "limit": 8
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  editorial_banner = EXCLUDED.editorial_banner,
  stats_strip = EXCLUDED.stats_strip,
  newsletter = EXCLUDED.newsletter,
  video_section = EXCLUDED.video_section,
  collections_row = EXCLUDED.collections_row,
  new_arrivals = EXCLUDED.new_arrivals,
  updated_at = NOW();

-- ─────────────────────────────────────────────────────
-- 4. ENABLE REALTIME FOR HOMEPAGE TABLES
-- ─────────────────────────────────────────────────────

-- Enable realtime for homepage_config
ALTER PUBLICATION supabase_realtime ADD TABLE homepage_config;

-- Enable realtime for hero_slides
ALTER PUBLICATION supabase_realtime ADD TABLE hero_slides;

-- ─────────────────────────────────────────────────────
-- 5. ADD HELPFUL COMMENTS
-- ─────────────────────────────────────────────────────

COMMENT ON TABLE homepage_config IS 'Single-row table (id=1) containing all homepage configuration';
COMMENT ON COLUMN homepage_config.editorial_banner IS 'Editorial banner section config (image, headline, CTA)';
COMMENT ON COLUMN homepage_config.stats_strip IS 'Stats strip section config (stats array)';
COMMENT ON COLUMN homepage_config.newsletter IS 'Newsletter section config (headline, description)';
COMMENT ON COLUMN homepage_config.video_section IS 'Video section config (URL, thumbnail, overlay)';
COMMENT ON COLUMN homepage_config.collections_row IS 'Collections row section config (headline, collection IDs)';
COMMENT ON COLUMN homepage_config.new_arrivals IS 'New arrivals section config (mode, product IDs, limit)';

-- ─────────────────────────────────────────────────────
-- 6. CREATE HELPER FUNCTION TO GET HOMEPAGE CONFIG
-- ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_homepage_config()
RETURNS TABLE (
  id UUID,
  sections JSONB,
  featured_product_ids UUID[],
  announcement JSONB,
  hero_display_mode TEXT,
  hero_speed INTEGER,
  editorial_banner JSONB,
  stats_strip JSONB,
  newsletter JSONB,
  video_section JSONB,
  collections_row JSONB,
  new_arrivals JSONB,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hc.id,
    hc.sections,
    hc.featured_product_ids,
    hc.announcement,
    hc.hero_display_mode,
    hc.hero_speed,
    hc.editorial_banner,
    hc.stats_strip,
    hc.newsletter,
    hc.video_section,
    hc.collections_row,
    hc.new_arrivals,
    hc.updated_at
  FROM homepage_config hc
  WHERE hc.id = '00000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_homepage_config() TO anon, authenticated;

-- ─────────────────────────────────────────────────────
-- MIGRATION COMPLETE
-- ─────────────────────────────────────────────────────

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Homepage system rebuild migration completed successfully!';
  RAISE NOTICE 'New columns added: editorial_banner, stats_strip, newsletter, video_section, collections_row, new_arrivals';
  RAISE NOTICE 'Realtime enabled for: homepage_config, hero_slides';
  RAISE NOTICE 'Single-row constraint added to homepage_config (id must be 00000000-0000-0000-0000-000000000001)';
END $$;
