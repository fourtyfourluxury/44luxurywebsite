-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 027_realtime_partnerships.sql
--
-- Enables realtime broadcasting for the partnerships table, now that
-- partnerships are surfaced on the storefront (navbar dropdown +
-- /partnerships/:slug pages), not just in the admin panel.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE partnerships;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'partnerships already in realtime publication';
END $$;

SELECT 'Realtime enabled for partnerships' AS status;
