-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 028_homepage_sections_partnership_slug.sql
--
-- Two fixes for homepage_sections:
--
-- 1. Adds partnership_id, mirroring the existing collection_id — a section's
--    "View All" can now link to a Partnership page, not just a Collection.
--    This was simply never built: only collection_id existed.
--
-- 2. Adds slug — a section that ISN'T linked to a Collection or Partnership
--    (e.g. a hand-picked "New Arrivals" row) had nowhere for "View All" to
--    go and silently fell back to /shop. It now gets its own page at
--    /featured/:slug. Existing rows are backfilled with a slug derived
--    from their title.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE homepage_sections
  ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL;

ALTER TABLE homepage_sections
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slugs for existing rows from their title
UPDATE homepage_sections
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

-- Keep slugs unique so /featured/:slug always resolves to exactly one section
CREATE UNIQUE INDEX IF NOT EXISTS idx_homepage_sections_slug ON homepage_sections (slug);

SELECT 'homepage_sections.partnership_id and .slug added' AS status;
