/**
 * Apply migration 020 via Supabase service role
 * Executes each ALTER TABLE statement individually via RPC
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse .env.local
const env = {};
fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([\w.\-_]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = (m[2] || '').trim().replace(/^["']|["']$/g, '');
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Execute SQL via Supabase's REST /rest/v1/rpc or direct pg endpoint
async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }
  return response.json().catch(() => ({}));
}

// Alternative: use the pg connection string if available
async function addColumnsDirect() {
  // Use Supabase's SQL endpoint
  const statements = [
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS season TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title TEXT`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT`,
    `ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check`,
    `ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('ACTIVE', 'DRAFT', 'SOLD OUT', 'PRE-ORDER', 'ARCHIVED'))`,
    `CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order ASC)`,
    `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`,
  ];

  const supabaseUrl = SUPABASE_URL;
  
  for (const sql of statements) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
      });
      // Try via pg-meta endpoint
      const pgRes = await fetch(`${supabaseUrl.replace('.supabase.co', '.supabase.co')}/pg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      
      if (pgRes.ok) {
        console.log(`✅ ${sql.substring(0, 60)}...`);
      } else {
        // Try rpc endpoint
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({ sql }),
        });
        console.log(`📋 Statement needs manual execution: ${sql.substring(0, 60)}...`);
      }
    } catch (e) {
      console.log(`⚠️  ${sql.substring(0, 60)}... → ${e.message}`);
    }
  }
}

console.log('🚀 Attempting to apply migration 020 programmatically...\n');
addColumnsDirect().then(() => {
  console.log('\n✅ Done. Please verify by running: node scratch/check_tables.js');
  console.log('\nIf columns are still missing, paste supabase/migrations/020_complete_schema_audit.sql');
  console.log('into Supabase Dashboard → SQL Editor → Run');
});
