#!/usr/bin/env node
/**
 * audit_rls.js — Query all active RLS policies and storage bucket config
 * Run: node scratch/audit_rls.js
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vlcwvdgqtsooiwcgdukc.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY3d2ZGdxdHNvb2l3Y2dkdWtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI4ODk4OCwiZXhwIjoyMDkyODY0OTg4fQ.oaodDBYDJaSc_48Gi6yrgh1UIJcX4UN5O-kaqd3SXfQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' SUPABASE RLS POLICY AUDIT');
  console.log('═══════════════════════════════════════════════════\n');

  // 1. List all storage buckets
  console.log('── STORAGE BUCKETS ─────────────────────────────────');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) { console.error('Bucket list error:', bErr.message); }
  else {
    buckets.forEach(b => {
      console.log(`  [${b.public ? 'PUBLIC' : 'PRIVATE'}] ${b.id}`);
      console.log(`           allowed_mime_types: ${JSON.stringify(b.allowedMimeTypes || b.allowed_mime_types || [])}`);
      console.log(`           file_size_limit:    ${b.fileSizeLimit || b.file_size_limit || 'none'}`);
    });
  }

  // 2. Query all RLS policies on storage.objects
  console.log('\n── storage.objects POLICIES ────────────────────────');
  const { data: storagePolicies, error: spErr } = await supabase
    .from('pg_policies')
    .select('policyname, cmd, roles, qual, with_check')
    .eq('schemaname', 'storage')
    .eq('tablename', 'objects');

  if (spErr) {
    // Fallback: use raw SQL via PostgREST
    const { data: rawPolicies, error: rawErr } = await supabase.rpc('get_policies', {});
    if (rawErr) {
      console.log('Cannot query pg_policies directly (expected - use manual SQL below)');
    }
  } else {
    if (!storagePolicies || storagePolicies.length === 0) {
      console.log('  ⚠️  NO POLICIES FOUND on storage.objects!');
    } else {
      storagePolicies.forEach(p => {
        console.log(`  [${p.cmd.padEnd(6)}] ${p.policyname}`);
        console.log(`           roles: ${p.roles}`);
        if (p.qual) console.log(`           USING: ${p.qual}`);
        if (p.with_check) console.log(`           WITH CHECK: ${p.with_check}`);
      });
    }
  }

  // 3. Query all RLS policies on public.products
  console.log('\n── public.products POLICIES ────────────────────────');
  const { data: productPolicies, error: ppErr } = await supabase
    .from('pg_policies')
    .select('policyname, cmd, roles, qual, with_check')
    .eq('schemaname', 'public')
    .eq('tablename', 'products');

  if (ppErr) {
    console.log('  Cannot query directly. See manual SQL below.');
  } else {
    if (!productPolicies || productPolicies.length === 0) {
      console.log('  ⚠️  NO POLICIES FOUND on public.products!');
    } else {
      productPolicies.forEach(p => {
        console.log(`  [${p.cmd.padEnd(6)}] ${p.policyname}`);
        console.log(`           roles: ${p.roles}`);
      });
    }
  }

  // 4. Check if RLS is enabled on products table
  console.log('\n── RLS STATUS ──────────────────────────────────────');
  const { data: rlsStatus, error: rlsErr } = await supabase
    .from('pg_class')
    .select('relname, relrowsecurity')
    .in('relname', ['products', 'objects', 'profiles'])
    .eq('relkind', 'r');

  if (rlsErr) {
    console.log('  Cannot query pg_class directly.');
  } else {
    rlsStatus?.forEach(r => {
      console.log(`  ${r.relname}: RLS = ${r.relrowsecurity ? 'ENABLED' : 'DISABLED'}`);
    });
  }

  // 5. Try a test upload as anon to confirm the exact error
  console.log('\n── ANON UPLOAD TEST ────────────────────────────────');
  const anonClient = createClient(SUPABASE_URL,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY3d2ZGdxdHNvb2l3Y2dkdWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODg5ODgsImV4cCI6MjA5Mjg2NDk4OH0.yWzZmGzp4wV_2sHNWhj4pygmN22IDv0kigBcAjBVO-A',
    { auth: { persistSession: false } }
  );

  // Create a tiny test blob
  const testBlob = new Blob(['test'], { type: 'image/png' });
  const testFile = new File([testBlob], 'rls-test.png', { type: 'image/png' });

  const { data: uploadData, error: uploadErr } = await anonClient.storage
    .from('product-images')
    .upload(`rls-test-${Date.now()}.png`, testFile, { upsert: true });

  if (uploadErr) {
    console.log(`  ❌ Anon upload BLOCKED: ${uploadErr.message}`);
    console.log(`  ❌ Status: ${uploadErr.status || 'unknown'}`);
    console.log(`  → This confirms: anon role has no INSERT policy on product-images`);
  } else {
    console.log('  ✅ Anon upload ALLOWED');
    // Clean up
    await anonClient.storage.from('product-images').remove([uploadData.path]);
  }

  // 6. Test service-role upload (should always work)
  console.log('\n── SERVICE ROLE UPLOAD TEST ────────────────────────');
  const testBlob2 = new Blob(['test'], { type: 'image/png' });
  const { data: svcData, error: svcErr } = await supabase.storage
    .from('product-images')
    .upload(`svc-test-${Date.now()}.png`, testBlob2, { upsert: true });

  if (svcErr) {
    console.log(`  ❌ Service role upload BLOCKED: ${svcErr.message}`);
  } else {
    console.log('  ✅ Service role upload works');
    await supabase.storage.from('product-images').remove([svcData.path]);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(' DIAGNOSIS COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log('\nTo list all policies, run this in Supabase SQL Editor:');
  console.log(`
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname IN ('storage', 'public')
ORDER BY schemaname, tablename, cmd;
  `);
}

main().catch(console.error);
