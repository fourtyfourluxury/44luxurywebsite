import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// SQL to fix RLS policies for product-images bucket
// Allows anon/authenticated to upload (admin app-level auth protects this)
const sql = `
-- Fix storage RLS for product-images bucket
-- Allow public read
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow all uploads (admin is protected at the application level)
DROP POLICY IF EXISTS "product_images_allow_upload" ON storage.objects;
CREATE POLICY "product_images_allow_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow all updates
DROP POLICY IF EXISTS "product_images_allow_update" ON storage.objects;
CREATE POLICY "product_images_allow_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

-- Allow all deletes
DROP POLICY IF EXISTS "product_images_allow_delete" ON storage.objects;
CREATE POLICY "product_images_allow_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- Same fix for the legacy 'products' bucket
DROP POLICY IF EXISTS "products_bucket_allow_upload" ON storage.objects;
CREATE POLICY "products_bucket_allow_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "products_bucket_allow_update" ON storage.objects;
CREATE POLICY "products_bucket_allow_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "products_bucket_allow_delete" ON storage.objects;
CREATE POLICY "products_bucket_allow_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'products');

-- Also fix hero-slides, collections, homepage, general, videos
DROP POLICY IF EXISTS "all_buckets_allow_upload" ON storage.objects;
CREATE POLICY "all_buckets_allow_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('hero-slides', 'collections', 'homepage', 'general', 'videos', 'partnerships')
  );

DROP POLICY IF EXISTS "all_buckets_allow_update" ON storage.objects;
CREATE POLICY "all_buckets_allow_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('hero-slides', 'collections', 'homepage', 'general', 'videos', 'partnerships')
  );

DROP POLICY IF EXISTS "all_buckets_allow_delete" ON storage.objects;
CREATE POLICY "all_buckets_allow_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('hero-slides', 'collections', 'homepage', 'general', 'videos', 'partnerships')
  );
`;

async function run() {
  console.log('Applying storage RLS fix...');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    // Try direct SQL execution via the REST API
    console.log('RPC not available, trying direct REST...');
    
    // Split into individual statements and run each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let failCount = 0;
    
    for (const stmt of statements) {
      const { error: stmtError } = await supabase.rpc('query', { query: stmt + ';' });
      if (stmtError) {
        // Try via the SQL API endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sql_query: stmt })
        });
        
        if (!response.ok) {
          console.error(`Failed: ${stmt.substring(0, 80)}...`);
          failCount++;
        } else {
          successCount++;
        }
      } else {
        successCount++;
      }
    }
    
    console.log(`Results: ${successCount} succeeded, ${failCount} failed`);
    console.log('\nIMPORTANT: If the above approach failed, please run the following SQL in the Supabase SQL Editor:');
    console.log(sql);
  } else {
    console.log('✅ Storage RLS policies applied successfully!');
  }
  
  console.log('\nTo apply via Supabase SQL Editor, run 021_storage_rls_fix.sql');
}

run();
