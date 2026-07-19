-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 026_realtime_products_collections.sql
--
-- Enables realtime broadcasting for the products and collections tables.
-- Neither was ever added to the supabase_realtime publication (only
-- homepage_config, hero_slides, and homepage_sections were, in earlier
-- migrations) — so creating a collection, adding a product to a collection,
-- or editing a product never notified other open admin sessions or the
-- storefront. The app was already subscribed and listening
-- (subscribeToProducts / subscribeToCollections in realtimeService.js) but
-- Postgres never sent the change events because the tables weren't part of
-- the publication. This is why the "View All" collection dropdown and
-- product/collection lists only updated after a manual page refresh.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'products already in realtime publication';
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE collections;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'collections already in realtime publication';
END $$;

SELECT 'Realtime enabled for products and collections' AS status;
