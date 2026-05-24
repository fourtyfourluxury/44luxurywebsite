-- 44LUXURY Seed Data
-- Initial data for development and testing

-- =====================================================
-- SEED COLLECTIONS
-- =====================================================

INSERT INTO collections (id, name, slug, category, status, description, hero_headline, hero_subheadline, cta_label, cta_link, sort_order, branches) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Essentials',
  'essentials',
  'unisex',
  'ACTIVE',
  'Timeless pieces that form the foundation of any wardrobe',
  'WARDROBE ESSENTIALS',
  'Build your foundation with timeless classics',
  'SHOP ESSENTIALS',
  '/shop/essentials',
  1,
  '[
    {"id": "basics", "name": "Basics", "slug": "basics"},
    {"id": "denim", "name": "Denim", "slug": "denim"},
    {"id": "outerwear", "name": "Outerwear", "slug": "outerwear"}
  ]'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222',
  'Streetwear',
  'streetwear',
  'unisex',
  'ACTIVE',
  'Bold, contemporary pieces for the urban lifestyle',
  'STREET CULTURE',
  'Express yourself with bold streetwear',
  'EXPLORE COLLECTION',
  '/shop/streetwear',
  2,
  '[
    {"id": "hoodies", "name": "Hoodies & Sweats", "slug": "hoodies"},
    {"id": "graphic-tees", "name": "Graphic Tees", "slug": "graphic-tees"},
    {"id": "joggers", "name": "Joggers", "slug": "joggers"}
  ]'::jsonb
),
(
  '33333333-3333-3333-3333-333333333333',
  'Luxury',
  'luxury',
  'unisex',
  'ACTIVE',
  'Premium pieces crafted with exceptional attention to detail',
  'ELEVATED LUXURY',
  'Experience unparalleled craftsmanship',
  'DISCOVER LUXURY',
  '/shop/luxury',
  3,
  '[
    {"id": "tailored", "name": "Tailored", "slug": "tailored"},
    {"id": "leather", "name": "Leather Goods", "slug": "leather"},
    {"id": "accessories", "name": "Accessories", "slug": "accessories"}
  ]'::jsonb
),
(
  '44444444-4444-4444-4444-444444444444',
  'Summer 2026',
  'summer-2026',
  'unisex',
  'ACTIVE',
  'Fresh styles for the season',
  'SUMMER COLLECTION',
  'Light, breathable pieces for warm days',
  'SHOP SUMMER',
  '/shop/summer-2026',
  4,
  '[
    {"id": "shorts", "name": "Shorts", "slug": "shorts"},
    {"id": "tees", "name": "T-Shirts", "slug": "tees"},
    {"id": "swimwear", "name": "Swimwear", "slug": "swimwear"}
  ]'::jsonb
),
(
  '55555555-5555-5555-5555-555555555555',
  'Accessories',
  'accessories',
  'unisex',
  'ACTIVE',
  'Complete your look with premium accessories',
  'FINISHING TOUCHES',
  'Elevate your style with curated accessories',
  'SHOP ACCESSORIES',
  '/shop/accessories',
  5,
  '[
    {"id": "bags", "name": "Bags", "slug": "bags"},
    {"id": "jewelry", "name": "Jewelry", "slug": "jewelry"},
    {"id": "hats", "name": "Hats & Caps", "slug": "hats"}
  ]'::jsonb
);

-- =====================================================
-- SEED PRODUCTS
-- =====================================================

INSERT INTO products (id, name, sku, price, compare_price, category, collection_id, status, sizes, colors, images, description, short_description, is_new, is_featured, stock, seo_title, seo_description) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Classic White Tee',
  'LUX-TEE-001',
  15000, -- ₦150.00
  NULL,
  'unisex',
  '11111111-1111-1111-1111-111111111111',
  'ACTIVE',
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['White', 'Black', 'Grey'],
  ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
  'Premium cotton t-shirt with a classic fit. Made from 100% organic cotton for ultimate comfort and durability. Features reinforced stitching and a ribbed crew neck.',
  'Premium organic cotton tee with classic fit',
  TRUE,
  TRUE,
  150,
  'Classic White Tee - Premium Organic Cotton | 44LUXURY',
  'Shop our classic white tee made from 100% organic cotton. Timeless design, superior comfort.'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Oversized Hoodie',
  'LUX-HOOD-001',
  45000, -- ₦450.00
  55000,
  'unisex',
  '22222222-2222-2222-2222-222222222222',
  'ACTIVE',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Black', 'Grey', 'Navy', 'Olive'],
  ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
  'Heavyweight oversized hoodie with dropped shoulders and extended length. Features premium fleece lining, kangaroo pocket, and adjustable drawstring hood.',
  'Heavyweight oversized hoodie with premium fleece',
  TRUE,
  TRUE,
  80,
  'Oversized Hoodie - Premium Streetwear | 44LUXURY',
  'Heavyweight oversized hoodie with premium fleece lining. Perfect for streetwear enthusiasts.'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Slim Fit Denim',
  'LUX-DEN-001',
  35000, -- ₦350.00
  NULL,
  'unisex',
  '11111111-1111-1111-1111-111111111111',
  'ACTIVE',
  ARRAY['28', '30', '32', '34', '36', '38'],
  ARRAY['Dark Blue', 'Light Blue', 'Black'],
  ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
  'Premium Japanese denim with a modern slim fit. Features 5-pocket styling, button fly, and subtle distressing. Made from sustainable denim with stretch for comfort.',
  'Premium Japanese denim with modern slim fit',
  FALSE,
  TRUE,
  120,
  'Slim Fit Denim Jeans - Japanese Denim | 44LUXURY',
  'Premium slim fit jeans crafted from Japanese denim. Sustainable, comfortable, and stylish.'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Leather Bomber Jacket',
  'LUX-JAC-001',
  125000, -- ₦1,250.00
  150000,
  'unisex',
  '33333333-3333-3333-3333-333333333333',
  'ACTIVE',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Black', 'Brown'],
  ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
  'Genuine leather bomber jacket with quilted lining. Features ribbed cuffs and hem, side pockets, and interior pocket. Handcrafted with premium Italian leather.',
  'Genuine leather bomber with quilted lining',
  FALSE,
  TRUE,
  25,
  'Leather Bomber Jacket - Italian Leather | 44LUXURY',
  'Handcrafted leather bomber jacket made from premium Italian leather. Timeless luxury piece.'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Cargo Joggers',
  'LUX-JOG-001',
  28000, -- ₦280.00
  NULL,
  'unisex',
  '22222222-2222-2222-2222-222222222222',
  'ACTIVE',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Black', 'Khaki', 'Olive', 'Grey'],
  ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
  'Technical cargo joggers with multiple pockets and adjustable cuffs. Made from water-resistant fabric with tapered fit. Perfect for urban exploration.',
  'Technical cargo joggers with multiple pockets',
  TRUE,
  FALSE,
  100,
  'Cargo Joggers - Technical Streetwear | 44LUXURY',
  'Water-resistant cargo joggers with multiple pockets. Perfect blend of style and function.'
),
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'Graphic Print Tee',
  'LUX-TEE-002',
  18000, -- ₦180.00
  NULL,
  'unisex',
  '22222222-2222-2222-2222-222222222222',
  'ACTIVE',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Black', 'White'],
  ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
  'Bold graphic print t-shirt with oversized fit. Features original 44LUXURY artwork, heavyweight cotton, and screen-printed graphics that won''t fade.',
  'Bold graphic tee with original artwork',
  TRUE,
  FALSE,
  200,
  'Graphic Print Tee - Original Artwork | 44LUXURY',
  'Oversized graphic tee featuring original 44LUXURY artwork. Premium heavyweight cotton.'
),
(
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  'Tailored Blazer',
  'LUX-BLZ-001',
  95000, -- ₦950.00
  NULL,
  'unisex',
  '33333333-3333-3333-3333-333333333333',
  'ACTIVE',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Black', 'Navy', 'Charcoal'],
  ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'],
  'Perfectly tailored blazer in premium wool blend. Features notch lapels, two-button closure, and functional sleeve buttons. Fully lined with interior pockets.',
  'Premium wool blend blazer with perfect tailoring',
  FALSE,
  TRUE,
  40,
  'Tailored Blazer - Premium Wool Blend | 44LUXURY',
  'Perfectly tailored blazer crafted from premium wool blend. Timeless elegance.'
),
(
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  'Linen Summer Shirt',
  'LUX-SHT-001',
  32000, -- ₦320.00
  NULL,
  'unisex',
  '44444444-4444-4444-4444-444444444444',
  'ACTIVE',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['White', 'Beige', 'Light Blue'],
  ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
  '100% linen shirt perfect for warm weather. Features relaxed fit, button-down collar, and chest pocket. Breathable and naturally wrinkle-resistant.',
  'Breathable linen shirt for summer',
  TRUE,
  FALSE,
  90,
  'Linen Summer Shirt - 100% Linen | 44LUXURY',
  'Breathable linen shirt perfect for summer. Relaxed fit, naturally wrinkle-resistant.'
),
(
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  'Leather Crossbody Bag',
  'LUX-BAG-001',
  55000, -- ₦550.00
  NULL,
  'unisex',
  '55555555-5555-5555-5555-555555555555',
  'ACTIVE',
  ARRAY['One Size'],
  ARRAY['Black', 'Brown', 'Tan'],
  ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
  'Compact leather crossbody bag with adjustable strap. Features multiple compartments, zip closure, and premium hardware. Perfect for everyday carry.',
  'Compact leather crossbody with adjustable strap',
  FALSE,
  TRUE,
  60,
  'Leather Crossbody Bag - Premium Leather | 44LUXURY',
  'Compact leather crossbody bag with multiple compartments. Perfect everyday accessory.'
),
(
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  'Minimalist Watch',
  'LUX-WAT-001',
  75000, -- ₦750.00
  NULL,
  'unisex',
  '55555555-5555-5555-5555-555555555555',
  'ACTIVE',
  ARRAY['One Size'],
  ARRAY['Silver', 'Gold', 'Black'],
  ARRAY['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800'],
  'Minimalist watch with Japanese quartz movement. Features sapphire crystal, genuine leather strap, and water resistance up to 50m. Timeless design.',
  'Minimalist watch with Japanese quartz movement',
  FALSE,
  FALSE,
  45,
  'Minimalist Watch - Japanese Quartz | 44LUXURY',
  'Minimalist watch featuring Japanese quartz movement and sapphire crystal. Timeless elegance.'
),
(
  'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
  'Wool Beanie',
  'LUX-HAT-001',
  12000, -- ₦120.00
  NULL,
  'unisex',
  '55555555-5555-5555-5555-555555555555',
  'ACTIVE',
  ARRAY['One Size'],
  ARRAY['Black', 'Grey', 'Navy', 'Burgundy'],
  ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
  'Classic wool beanie with fold-up cuff. Made from soft merino wool blend. Features embroidered 44LUXURY logo. Perfect for cold weather.',
  'Classic wool beanie with embroidered logo',
  FALSE,
  FALSE,
  180,
  'Wool Beanie - Merino Wool Blend | 44LUXURY',
  'Classic wool beanie made from soft merino wool blend. Perfect cold weather accessory.'
),
(
  'llllllll-llll-llll-llll-llllllllllll',
  'Chelsea Boots',
  'LUX-BOOT-001',
  85000, -- ₦850.00
  NULL,
  'unisex',
  '33333333-3333-3333-3333-333333333333',
  'ACTIVE',
  ARRAY['39', '40', '41', '42', '43', '44', '45'],
  ARRAY['Black', 'Brown'],
  ARRAY['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800'],
  'Premium leather Chelsea boots with elastic side panels. Features cushioned insole, durable rubber sole, and pull tabs. Handcrafted in Portugal.',
  'Premium leather Chelsea boots handcrafted in Portugal',
  FALSE,
  TRUE,
  55,
  'Chelsea Boots - Premium Leather | 44LUXURY',
  'Handcrafted leather Chelsea boots made in Portugal. Premium quality and timeless style.'
);

-- =====================================================
-- SEED HERO SLIDES
-- =====================================================

INSERT INTO hero_slides (image, headline, subheadline, cta_label, cta_link, text_position, sort_order) VALUES
(
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2070',
  'SUMMER 2026 COLLECTION',
  'Discover the latest in luxury streetwear',
  'SHOP NOW',
  '/shop/summer-2026',
  'center',
  1
),
(
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=2070',
  'ELEVATED ESSENTIALS',
  'Timeless pieces for the modern wardrobe',
  'EXPLORE',
  '/shop/essentials',
  'bottom-left',
  2
),
(
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=2070',
  'NEW ARRIVALS',
  'Fresh styles just landed',
  'DISCOVER',
  '/shop',
  'center',
  3
);

-- =====================================================
-- SEED VIDEOS
-- =====================================================

INSERT INTO videos (title, source, youtube_url, thumbnail, pages, display_style, playback, overlay_headline, overlay_subtext, status) VALUES
(
  '44LUXURY Brand Story',
  'YOUTUBE',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1440',
  ARRAY['home'],
  'INLINE SECTION',
  ARRAY['AUTOPLAY MUTED', 'LOOP'],
  'OUR STORY',
  'Crafting luxury for the modern generation',
  'ACTIVE'
);

-- =====================================================
-- UPDATE HOMEPAGE CONFIG
-- =====================================================

UPDATE homepage_config SET
  sections = '[
    {"id": "hero", "type": "hero", "title": "Hero Slider", "visible": true, "order": 1},
    {"id": "announcement", "type": "announcement", "title": "Announcement Bar", "visible": true, "order": 0},
    {"id": "new-arrivals", "type": "new-arrivals", "title": "New Arrivals", "visible": true, "order": 2},
    {"id": "collections", "type": "collections", "title": "Collections", "visible": true, "order": 3},
    {"id": "editorial", "type": "editorial", "title": "Editorial Banner", "visible": true, "order": 4},
    {"id": "video", "type": "video", "title": "Video Section", "visible": true, "order": 5},
    {"id": "stats", "type": "stats", "title": "Stats Strip", "visible": true, "order": 6},
    {"id": "newsletter", "type": "newsletter", "title": "Newsletter", "visible": true, "order": 7}
  ]'::jsonb,
  featured_product_ids = ARRAY[
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'gggggggg-gggg-gggg-gggg-gggggggggggg',
    'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'
  ]::uuid[],
  announcement = '{
    "visible": true,
    "messages": ["FREE SHIPPING ON ORDERS OVER ₦50,000", "NEW SUMMER COLLECTION NOW LIVE", "SIGN UP FOR 10% OFF YOUR FIRST ORDER"],
    "bgColor": "#000000",
    "textColor": "#FFFFFF"
  }'::jsonb;

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================

SELECT 'Seed data inserted successfully!' AS status;
SELECT COUNT(*) AS collections_count FROM collections;
SELECT COUNT(*) AS products_count FROM products;
SELECT COUNT(*) AS hero_slides_count FROM hero_slides;
SELECT COUNT(*) AS videos_count FROM videos;
