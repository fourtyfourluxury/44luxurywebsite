/**
 * Schema Detector
 *
 * Probes the live Supabase database to determine which columns actually exist.
 * Results are cached for the session. This lets the admin run safely even
 * before migration 020 is applied.
 */

import { supabase } from '../lib/supabase';

// Cache: tableName -> Set of known column names
const schemaCache = {};

// Full known column sets, used only when a table has zero rows (so probing
// via `select('*').limit(1)` returns no columns to read keys from). There is
// no `get_table_columns` RPC in the database, so this is the real fallback —
// keep it in sync with the columns added across migrations 001/017/018/020.
const FULL_KNOWN_COLUMNS = {
  products: new Set([
    'id', 'name', 'sku', 'price', 'compare_price', 'category', 'collection_id',
    'status', 'sizes', 'colors', 'images', 'description', 'short_description',
    'is_new', 'is_featured', 'stock', 'seo_title', 'seo_description',
    'is_best_seller', 'is_limited_edition', 'sort_order', 'video_url',
    'subcategory', 'season', 'brand', 'material', 'weight', 'tags',
    'created_at', 'updated_at',
  ]),
};

/**
 * Returns the set of columns that actually exist in the given table.
 * Probes by running a minimal SELECT and checking the response columns.
 */
export async function getExistingColumns(tableName) {
  if (schemaCache[tableName]) return schemaCache[tableName];

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.warn(`[schemaDetector] Could not probe ${tableName}:`, error.message);
      return new Set();
    }

    // If there are rows, get columns from the first row
    // If empty table, Supabase still returns column names in the response
    // We use information_schema as fallback
    if (data && data.length > 0) {
      const cols = new Set(Object.keys(data[0]));
      schemaCache[tableName] = cols;
      return cols;
    }

    // Empty table — there's no live row to read keys from, so fall back to
    // the full known column set for this table (see FULL_KNOWN_COLUMNS above).
    const cols = FULL_KNOWN_COLUMNS[tableName] || new Set();
    schemaCache[tableName] = cols;
    return cols;
  } catch (e) {
    console.warn(`[schemaDetector] Error probing ${tableName}:`, e);
    return new Set();
  }
}

/**
 * Detects missing columns by comparing expected against actual.
 */
export async function detectMissingColumns(tableName, expectedColumns) {
  const existing = await getExistingColumns(tableName);
  const missing = expectedColumns.filter(c => !existing.has(c));
  return missing;
}

/**
 * Check if a specific column exists in a table.
 */
export async function columnExists(tableName, columnName) {
  const existing = await getExistingColumns(tableName);
  return existing.has(columnName);
}

/**
 * Returns a filter that removes keys not in existing columns.
 * Used as a safe sanitizer when writing to the DB.
 */
export async function sanitizeForSchema(tableName, data) {
  const existing = await getExistingColumns(tableName);
  const EXCLUDED = new Set(['id', 'created_at', 'updated_at', 'search_vector', 'collection']);
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (EXCLUDED.has(k)) continue;
    if (!existing.has(k)) continue;
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * Clear the cache (useful after running migrations).
 */
export function clearSchemaCache() {
  Object.keys(schemaCache).forEach(k => delete schemaCache[k]);
}
