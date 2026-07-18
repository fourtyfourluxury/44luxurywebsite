-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 023_homepage_product_sections.sql
-- Adds a `homepage_sections` table so the admin can create/rename/reorder
-- named product sections (e.g. "NEW ARRIVALS", "CLOTHING SALES") that appear
-- on the homepage, each with up to 8 hand-picked products in a 4x2 grid.
--
-- RLS mirrors the pattern already used for storage buckets (022): the admin
-- panel authenticates via a custom `admin_credentials` table, not Supabase
-- Auth, so requests always arrive as the anon role. Application-level auth
-- already gates the admin UI, so anon is allowed to write here too.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'NEW SECTION',
  product_ids UUID[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort_order ON homepage_sections (sort_order);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homepage_sections_select" ON homepage_sections;
CREATE POLICY "homepage_sections_select" ON homepage_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "homepage_sections_insert" ON homepage_sections;
CREATE POLICY "homepage_sections_insert" ON homepage_sections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "homepage_sections_update" ON homepage_sections;
CREATE POLICY "homepage_sections_update" ON homepage_sections FOR UPDATE USING (true);

DROP POLICY IF EXISTS "homepage_sections_delete" ON homepage_sections;
CREATE POLICY "homepage_sections_delete" ON homepage_sections FOR DELETE USING (true);

-- Keep updated_at fresh on every write
CREATE OR REPLACE FUNCTION set_homepage_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_homepage_sections_updated_at ON homepage_sections;
CREATE TRIGGER trg_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION set_homepage_sections_updated_at();

-- Enable realtime so the homepage and admin panel both reflect edits live
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE homepage_sections;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'homepage_sections already in realtime publication';
END $$;

COMMENT ON TABLE homepage_sections IS 'Named, admin-managed homepage product sections (title + up to 8 product IDs), rendered in sort_order on the homepage.';

SELECT 'homepage_sections table created successfully' AS status;
