-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 024_homepage_sections_collection_link.sql
-- Links each homepage_sections row to an (optional) collection, so a
-- section's "VIEW ALL" button can route to /collections/:slug and show every
-- product in that collection — not just the up-to-8 curated for the tile.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE homepage_sections
  ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

SELECT 'homepage_sections.collection_id added successfully' AS status;
