#!/usr/bin/env node
/**
 * apply_storage_rls.js
 * Applies storage RLS policies directly via Supabase Management REST API.
 * Run: node scratch/apply_storage_rls.js
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// ── Load env ──────────────────────────────────────────────────────────────────
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SERVICE_KEY  = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Extract project ref from URL (https://<ref>.supabase.co)
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
console.log(`Project ref: ${projectRef}`);

// ── SQL statements ─────────────────────────────────────────────────────────────
const SQL = `
-- Fix product-images bucket RLS
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_allow_upload" ON storage.objects;
CREATE POLICY "product_images_allow_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_allow_update" ON storage.objects;
CREATE POLICY "product_images_allow_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_allow_delete" ON storage.objects;
CREATE POLICY "product_images_allow_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Fix products bucket RLS
DROP POLICY IF EXISTS "products_public_read" ON storage.objects;
CREATE POLICY "products_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "products_allow_upload" ON storage.objects;
CREATE POLICY "products_allow_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "products_allow_update" ON storage.objects;
CREATE POLICY "products_allow_update" ON storage.objects FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "products_allow_delete" ON storage.objects;
CREATE POLICY "products_allow_delete" ON storage.objects FOR DELETE USING (bucket_id = 'products');

-- Fix all other admin buckets
DROP POLICY IF EXISTS "admin_buckets_public_read" ON storage.objects;
CREATE POLICY "admin_buckets_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships'));

DROP POLICY IF EXISTS "admin_buckets_allow_upload" ON storage.objects;
CREATE POLICY "admin_buckets_allow_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships'));

DROP POLICY IF EXISTS "admin_buckets_allow_update" ON storage.objects;
CREATE POLICY "admin_buckets_allow_update" ON storage.objects FOR UPDATE
  USING (bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships'));

DROP POLICY IF EXISTS "admin_buckets_allow_delete" ON storage.objects;
CREATE POLICY "admin_buckets_allow_delete" ON storage.objects FOR DELETE
  USING (bucket_id IN ('hero-slides', 'collections', 'homepage', 'videos', 'general', 'partnerships'));

SELECT 'RLS policies applied successfully' AS status;
`;

// ── Apply via Management API ───────────────────────────────────────────────────
async function applyViaManagementAPI() {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  console.log(`\nTrying Management API: ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  });

  const text = await res.text();
  if (res.ok) {
    console.log('✅ Management API success:', text);
    return true;
  }
  console.warn('⚠️  Management API failed:', res.status, text);
  return false;
}

// ── Apply via supabase-js RPC (pg_execute or exec_sql) ───────────────────────
async function applyViaRPC() {
  console.log('\nTrying supabase-js RPC...');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
  });

  // Try exec_sql
  let { error } = await supabase.rpc('exec_sql', { sql_query: SQL });
  if (!error) {
    console.log('✅ exec_sql RPC succeeded');
    return true;
  }

  // Try query
  ({ error } = await supabase.rpc('query', { query: SQL }));
  if (!error) {
    console.log('✅ query RPC succeeded');
    return true;
  }

  console.warn('⚠️  RPC approach failed:', error?.message);
  return false;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Applying storage RLS policies...\n');

  const mgmtOk = await applyViaManagementAPI();
  if (mgmtOk) return;

  const rpcOk = await applyViaRPC();
  if (rpcOk) return;

  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('⚠️  Automatic application failed. Please run this SQL manually:');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('1. Open: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('2. Paste and run: supabase/migrations/022_storage_rls_fix.sql');
  console.log('──────────────────────────────────────────────────────────────\n');
}

main().catch(console.error);
