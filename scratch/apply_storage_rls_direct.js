#!/usr/bin/env node
/**
 * apply_storage_rls_direct.js
 * Uses Supabase's direct DB REST endpoint with service role key.
 */
import fs from 'fs';

const SUPABASE_URL = 'https://vlcwvdgqtsooiwcgdukc.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY3d2ZGdxdHNvb2l3Y2dkdWtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI4ODk4OCwiZXhwIjoyMDkyODY0OTg4fQ.oaodDBYDJaSc_48Gi6yrgh1UIJcX4UN5O-kaqd3SXfQ';
const PROJECT_REF  = 'vlcwvdgqtsooiwcgdukc';

// Each statement separately for maximum compatibility
const statements = [
  // product-images bucket — public read
  `DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects`,
  `CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images')`,
  // product-images — allow upload (anon + authenticated)
  `DROP POLICY IF EXISTS "product_images_allow_upload" ON storage.objects`,
  `CREATE POLICY "product_images_allow_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images')`,
  // product-images — allow update
  `DROP POLICY IF EXISTS "product_images_allow_update" ON storage.objects`,
  `CREATE POLICY "product_images_allow_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images')`,
  // product-images — allow delete
  `DROP POLICY IF EXISTS "product_images_allow_delete" ON storage.objects`,
  `CREATE POLICY "product_images_allow_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images')`,

  // products bucket (legacy)
  `DROP POLICY IF EXISTS "products_public_read" ON storage.objects`,
  `CREATE POLICY "products_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'products')`,
  `DROP POLICY IF EXISTS "products_allow_upload" ON storage.objects`,
  `CREATE POLICY "products_allow_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products')`,
  `DROP POLICY IF EXISTS "products_allow_update" ON storage.objects`,
  `CREATE POLICY "products_allow_update" ON storage.objects FOR UPDATE USING (bucket_id = 'products')`,
  `DROP POLICY IF EXISTS "products_allow_delete" ON storage.objects`,
  `CREATE POLICY "products_allow_delete" ON storage.objects FOR DELETE USING (bucket_id = 'products')`,

  // all other admin buckets
  `DROP POLICY IF EXISTS "admin_buckets_public_read" ON storage.objects`,
  `CREATE POLICY "admin_buckets_public_read" ON storage.objects FOR SELECT USING (bucket_id IN ('hero-slides','collections','homepage','videos','general','partnerships'))`,
  `DROP POLICY IF EXISTS "admin_buckets_allow_upload" ON storage.objects`,
  `CREATE POLICY "admin_buckets_allow_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('hero-slides','collections','homepage','videos','general','partnerships'))`,
  `DROP POLICY IF EXISTS "admin_buckets_allow_update" ON storage.objects`,
  `CREATE POLICY "admin_buckets_allow_update" ON storage.objects FOR UPDATE USING (bucket_id IN ('hero-slides','collections','homepage','videos','general','partnerships'))`,
  `DROP POLICY IF EXISTS "admin_buckets_allow_delete" ON storage.objects`,
  `CREATE POLICY "admin_buckets_allow_delete" ON storage.objects FOR DELETE USING (bucket_id IN ('hero-slides','collections','homepage','videos','general','partnerships'))`,
];

// Try Supabase's pg_dump REST endpoint
async function tryRestSQL(sql) {
  // Supabase REST API for executing raw SQL (requires service key)
  const url = `${SUPABASE_URL}/rest/v1/`;
  
  // Actually use the direct postgres REST API via PostgREST's internal RPC
  const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/`;
  
  // Try using fetch against the database REST for pg functions
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ sql_query: sql }),
  });
  
  return { ok: response.ok, status: response.status, body: await response.text() };
}

// Try the Management API with service key as access token
async function tryMgmtAPI(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  
  return { ok: response.ok, status: response.status, body: await response.text() };
}

async function main() {
  console.log('🔧 Applying storage RLS policies...\n');
  
  // Try exec_sql RPC (fastest if it exists)
  console.log('Testing exec_sql RPC...');
  const testResult = await tryRestSQL('SELECT 1 AS test');
  
  if (testResult.ok) {
    console.log('✅ exec_sql RPC works! Applying all policies...\n');
    let success = 0, fail = 0;
    for (const stmt of statements) {
      const r = await tryRestSQL(stmt);
      if (r.ok) { success++; process.stdout.write('.'); }
      else { fail++; console.error(`\n❌ Failed: ${stmt.substring(0, 60)}...`); console.error('   Error:', r.body); }
    }
    console.log(`\n\nDone: ${success} succeeded, ${fail} failed`);
    return;
  }
  
  console.log('exec_sql RPC not available. Printing SQL to apply manually.\n');
  
  // Print the SQL for the user to apply manually
  const sql = fs.readFileSync('supabase/migrations/022_storage_rls_fix.sql', 'utf8');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('PLEASE APPLY THIS SQL IN YOUR SUPABASE DASHBOARD:');
  console.log(`→ https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('\nFile location: supabase/migrations/022_storage_rls_fix.sql');
  console.log('\nSQL Preview (first 500 chars):');
  console.log(sql.substring(0, 500));
  console.log('...\n');
}

main().catch(console.error);
