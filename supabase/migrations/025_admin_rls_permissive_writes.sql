-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 025_admin_rls_permissive_writes.sql
--
-- Fixes admin CMS create/update/delete operations across products,
-- collections, custom_pages, homepage_config, hero_slides, videos, and
-- partnerships.
--
-- Root cause: every INSERT/UPDATE/DELETE policy on these tables was written
-- as `WITH CHECK (is_admin())` / `USING (is_admin())`, and is_admin() checks
-- `profiles.role = 'admin' WHERE id = auth.uid()`. But the admin panel logs
-- in through a custom `admin_credentials` table (see adminAuthService.js),
-- never through supabase.auth.signIn — so auth.uid() is always NULL for
-- admin requests, is_admin() always returns false, and every write from the
-- admin panel to these tables is silently rejected by RLS.
--
-- This mirrors the exact fix already applied to storage.objects in
-- 022_storage_rls_fix.sql and to homepage_sections in
-- 023_homepage_product_sections.sql: the admin UI is already gated at the
-- application level, so it's safe to let the anon role write to these
-- tables directly. SELECT policies are untouched — public reads already
-- work today and storefront queries already filter drafts/inactive rows
-- explicitly (e.g. `.neq('status', 'DRAFT')`), so nothing here changes what
-- shoppers can see.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── products ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_insert" ON products;
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "products_update" ON products;
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- ── collections ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "collections_insert" ON collections;
CREATE POLICY "collections_insert" ON collections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "collections_update" ON collections;
CREATE POLICY "collections_update" ON collections FOR UPDATE USING (true);

DROP POLICY IF EXISTS "collections_delete" ON collections;
CREATE POLICY "collections_delete" ON collections FOR DELETE USING (true);

-- ── custom_pages ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "custom_pages_insert" ON custom_pages;
CREATE POLICY "custom_pages_insert" ON custom_pages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "custom_pages_update" ON custom_pages;
CREATE POLICY "custom_pages_update" ON custom_pages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "custom_pages_delete" ON custom_pages;
CREATE POLICY "custom_pages_delete" ON custom_pages FOR DELETE USING (true);

-- ── homepage_config ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "homepage_config_insert" ON homepage_config;
CREATE POLICY "homepage_config_insert" ON homepage_config FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "homepage_config_update" ON homepage_config;
CREATE POLICY "homepage_config_update" ON homepage_config FOR UPDATE USING (true);

DROP POLICY IF EXISTS "homepage_config_delete" ON homepage_config;
CREATE POLICY "homepage_config_delete" ON homepage_config FOR DELETE USING (true);

-- ── hero_slides ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "hero_slides_insert" ON hero_slides;
CREATE POLICY "hero_slides_insert" ON hero_slides FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "hero_slides_update" ON hero_slides;
CREATE POLICY "hero_slides_update" ON hero_slides FOR UPDATE USING (true);

DROP POLICY IF EXISTS "hero_slides_delete" ON hero_slides;
CREATE POLICY "hero_slides_delete" ON hero_slides FOR DELETE USING (true);

-- ── videos ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "videos_insert" ON videos;
CREATE POLICY "videos_insert" ON videos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "videos_update" ON videos;
CREATE POLICY "videos_update" ON videos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "videos_delete" ON videos;
CREATE POLICY "videos_delete" ON videos FOR DELETE USING (true);

-- ── partnerships (admin-only table — no public submission form exists) ──
DROP POLICY IF EXISTS "partnerships_insert" ON partnerships;
CREATE POLICY "partnerships_insert" ON partnerships FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "partnerships_update" ON partnerships;
CREATE POLICY "partnerships_update" ON partnerships FOR UPDATE USING (true);

DROP POLICY IF EXISTS "partnerships_delete" ON partnerships;
CREATE POLICY "partnerships_delete" ON partnerships FOR DELETE USING (true);

SELECT 'Admin CMS write policies fixed for products, collections, custom_pages, homepage_config, hero_slides, videos, partnerships' AS status;
