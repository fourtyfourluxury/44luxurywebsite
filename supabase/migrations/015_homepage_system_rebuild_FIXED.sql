-- =====================================================
-- HOMEPAGE SYSTEM REBUILD MIGRATION (FIXED)
-- Handles existing data properly
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 1. ADD NEW COLUMNS TO HOMEPAGE_CONFIG
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

-- New Arrivals Section
ALTER TABLE homepage_config
ADD COLUMN IF NOT EXISTS new_arrivals JSONB DEFAULT '{
  "visible": true,
  "headline": "NEW ARRIVALS",
  "mode": "auto",
  "productIds": [],
  "limit": 8
}'::jsonb;

-- ─────────────────────────────────────────────────────
-- 2. CONSOLIDATE TO SINGLE ROW (IF MULTIPLE EXIST)
-- ─────────────────────────────────────────────────────

DO $$
DECLARE
  row_count INTEGER;
  first_row_id UUID;
BEGIN
  -- Count existing rows
  SELECT COUNT(*) INTO row_count FROM homepage_config;
  
  RAISE NOTICE 'Found % rows in homepage_config', row_count;
  
  IF row_count = 0 THEN
    -- No rows exist, insert default row
    RAISE NOTICE 'No rows found, inserting default row';
    
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
      gen_random_uuid(),
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
    );
    
  ELSIF row_count > 1 THEN
    -- Multiple rows exist, keep the first one and delete others
    RAISE NOTICE 'Multiple rows found, consolidating to single row';
    
    SELECT id INTO first_row_id FROM homepage_config ORDER BY created_at ASC LIMIT 1;
    
    DELETE FROM homepage_config WHERE id != first_row_id;
    
    RAISE NOTICE 'Kept row with id: %', first_row_id;
    
  ELSE
    -- Exactly one row exists, update it with new columns if they're null
    RAISE NOTICE 'Single row exists, updating with defaults if needed';
    
    UPDATE homepage_config
    SET
      editorial_banner = COALESCE(editorial_banner, '{
        "visible": true,
        "image": "https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1440&auto=format&fit=crop",
        "tag": "SS25 — The Core Edit",
        "headline": "THE UNCOMPROMISING FORM",
        "description": "Architecture meets streetwear. Every silhouette is a deliberate act — precision-cut, heavyweight-fabricated, built for those who refuse to be average.",
        "ctaLabel": "EXPLORE THE COLLECTION",
        "ctaLink": "/shop"
      }'::jsonb),
      stats_strip = COALESCE(stats_strip, '{
        "visible": true,
        "stats": [
          {"value": "2000+", "label": "PIECES SOLD"},
          {"value": "98%", "label": "SATISFACTION RATE"},
          {"value": "24/7", "label": "CUSTOMER SUPPORT"},
          {"value": "50+", "label": "COUNTRIES SHIPPED"}
        ]
      }'::jsonb),
      newsletter = COALESCE(newsletter, '{
        "visible": true,
        "headline": "STAY IN THE LOOP",
        "description": "Be the first to know about new drops, exclusive offers, and behind-the-scenes content.",
        "placeholder": "Enter your email address"
      }'::jsonb),
      video_section = COALESCE(video_section, '{
        "visible": false,
        "url": "",
        "thumbnail": "",
        "headline": "THE UNCOMPROMISING FORM",
        "subtext": "Crafted for those who command attention.",
        "playback": "AUTOPLAY_MUTED_LOOP"
      }'::jsonb),
      collections_row = COALESCE(collections_row, '{
        "visible": true,
        "headline": "COLLECTIONS",
        "mode": "auto",
        "collectionIds": []
      }'::jsonb),
      new_arrivals = COALESCE(new_arrivals, '{
        "visible": true,
        "headline": "NEW ARRIVALS",
        "mode": "auto",
        "productIds": [],
        "limit": 8
      }'::jsonb),
      updated_at = NOW();
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 3. ENABLE REALTIME FOR HOMEPAGE TABLES
-- ─────────────────────────────────────────────────────

-- Enable realtime for homepage_config (ignore if already enabled)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE homepage_config;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'homepage_config already in realtime publication';
END $$;

-- Enable realtime for hero_slides (ignore if already enabled)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE hero_slides;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'hero_slides already in realtime publication';
END $$;

-- ─────────────────────────────────────────────────────
-- 4. ADD HELPFUL COMMENTS
-- ─────────────────────────────────────────────────────

COMMENT ON TABLE homepage_config IS 'Homepage configuration - should contain only one row';
COMMENT ON COLUMN homepage_config.editorial_banner IS 'Editorial banner section config (image, headline, CTA)';
COMMENT ON COLUMN homepage_config.stats_strip IS 'Stats strip section config (stats array)';
COMMENT ON COLUMN homepage_config.newsletter IS 'Newsletter section config (headline, description)';
COMMENT ON COLUMN homepage_config.video_section IS 'Video section config (URL, thumbnail, overlay)';
COMMENT ON COLUMN homepage_config.collections_row IS 'Collections row section config (headline, collection IDs)';
COMMENT ON COLUMN homepage_config.new_arrivals IS 'New arrivals section config (mode, product IDs, limit)';

-- ─────────────────────────────────────────────────────
-- 5. CREATE HELPER FUNCTION TO GET HOMEPAGE CONFIG
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
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_homepage_config() TO anon, authenticated;

-- ─────────────────────────────────────────────────────
-- MIGRATION COMPLETE
-- ─────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE '✅ Homepage system rebuild migration completed successfully!';
  RAISE NOTICE '📦 New columns added: editorial_banner, stats_strip, newsletter, video_section, collections_row, new_arrivals';
  RAISE NOTICE '📡 Realtime enabled for: homepage_config, hero_slides';
  RAISE NOTICE '🎉 Your homepage is now fully dynamic and admin-controllable!';
END $$;
