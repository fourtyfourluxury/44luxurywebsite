/**
 * Run migration 020 via Supabase service role
 * node scratch/run_migration.js
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([\w.\-_]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = (m[2] || '').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Run individual ALTER statements (Supabase JS doesn't support multi-statement SQL)
// We check and report each column individually
async function checkColumns() {
  const checks = [
    'is_best_seller', 'is_limited_edition', 'sort_order', 
    'video_url', 'subcategory', 'season', 'brand', 'material', 'weight', 'tags'
  ];
  
  console.log('\n=== Checking products table columns ===');
  const { data, error } = await supabase.rpc('pg_get_columns', {}).select?.() || {};
  
  // Alternative: try selecting with those columns
  for (const col of checks) {
    try {
      const { error } = await supabase
        .from('products')
        .select(col)
        .limit(1);
      
      if (error && error.message.includes('column')) {
        console.log(`❌ MISSING: ${col} — ${error.message}`);
      } else {
        console.log(`✅ EXISTS:  ${col}`);
      }
    } catch (e) {
      console.log(`❌ ERROR checking ${col}: ${e.message}`);
    }
  }
  
  console.log('\n=== Checking partnerships table ===');
  const { error: partErr } = await supabase.from('partnerships').select('id').limit(1);
  if (partErr && partErr.message.includes('does not exist')) {
    console.log('❌ partnerships table does not exist — run migration 020!');
  } else {
    console.log('✅ partnerships table exists');
  }

  console.log('\n=== Checking custom_pages table ===');
  const { error: pagesErr } = await supabase.from('custom_pages').select('id').limit(1);
  if (pagesErr && pagesErr.message.includes('does not exist')) {
    console.log('❌ custom_pages table does not exist — run migration 020!');
  } else {
    console.log('✅ custom_pages table exists');
  }
}

checkColumns().then(() => {
  console.log('\n📋 TO FIX: Copy supabase/migrations/020_complete_schema_audit.sql');
  console.log('   and run it in Supabase Dashboard → SQL Editor');
});
