import { supabase } from '../../lib/supabase';
import { deleteFileByUrl, isSupabaseStorageUrl } from '../storageService';
import { sanitizeForSchema } from '../schemaDetector';

/**
 * Admin Product Service — Schema-safe version
 *
 * All write operations only include columns that exist in the DB.
 * The SAFE_COLUMNS set controls exactly what gets sent to Supabase,
 * preventing "column not found in schema cache" errors.
 */

// ─── Column Safety ────────────────────────────────────────────────────────────
// These are the columns that DEFINITELY exist (base schema + migration 020).
// If a column hasn't been migrated yet, remove it from this set.
const SAFE_PRODUCT_COLUMNS = new Set([
  'name', 'sku', 'price', 'compare_price', 'category', 'collection_id',
  'status', 'sizes', 'colors', 'images', 'description', 'short_description',
  'is_new', 'is_featured', 'stock', 'seo_title', 'seo_description',
  // Columns from migration 017/020 — safe after running migration 020
  'is_best_seller', 'is_limited_edition', 'sort_order', 'video_url',
  'subcategory', 'season', 'brand', 'material', 'weight', 'tags',
]);

/**
 * Strips any keys from a payload that are not in SAFE_PRODUCT_COLUMNS.
 * Also removes undefined values and internal fields like id, created_at, updated_at.
 */
const sanitizePayload = (data) => {
  const EXCLUDED = new Set(['id', 'created_at', 'updated_at', 'search_vector', 'collection']);
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (EXCLUDED.has(k)) continue;
    if (!SAFE_PRODUCT_COLUMNS.has(k)) {
      console.warn(`[productAdminService] Stripping unknown column: "${k}"`);
      continue;
    }
    if (v !== undefined) out[k] = v;
  }
  return out;
};

// ─── Read ────────────────────────────────────────────────────────────────────

export const getAllProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `);

    // We'll try to order by sort_order first, but catch if it fails because column doesn't exist
    query = query.order('sort_order', { ascending: true, nullsFirst: false })
                 .order('created_at', { ascending: false });

    if (filters.status)       query = query.eq('status', filters.status);
    if (filters.category)     query = query.eq('category', filters.category);
    if (filters.collectionId) query = query.eq('collection_id', filters.collectionId);
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      if (error.message && (error.message.includes('sort_order') || error.code === '42703')) {
        console.warn('⚠️ sort_order column missing in products schema, falling back...');
        let fallbackQuery = supabase
          .from('products')
          .select(`
            *,
            collection:collections(id, name, slug)
          `)
          .order('created_at', { ascending: false });

        if (filters.status)       fallbackQuery = fallbackQuery.eq('status', filters.status);
        if (filters.category)     fallbackQuery = fallbackQuery.eq('category', filters.category);
        if (filters.collectionId) fallbackQuery = fallbackQuery.eq('collection_id', filters.collectionId);
        if (filters.search) {
          fallbackQuery = fallbackQuery.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
        }

        const { data: fbData, error: fbError } = await fallbackQuery;
        if (fbError) throw fbError;
        return { products: fbData, error: null };
      }
      throw error;
    }

    return { products: data, error: null };
  } catch (error) {
    console.error('Get all products error:', error);
    return { products: [], error: error.message };
  }
};

export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`*, collection:collections(id, name, slug)`)
      .eq('id', productId)
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Get product by ID error:', error);
    return { product: null, error: error.message };
  }
};

// ─── Create ──────────────────────────────────────────────────────────────────

export const createProduct = async (productData) => {
  try {
    // Use live schema detection: only include columns that actually exist in the DB
    const payload = await sanitizeForSchema('products', productData);
    // Apply static guard as a second layer of safety
    const safePayload = sanitizePayload(payload);

    // Explicitly add ID if provided (e.g. from generated image folders)
    if (productData.id) {
      safePayload.id = productData.id;
    }

    const { data, error } = await supabase
      .from('products')
      .insert(safePayload)
      .select(`*, collection:collections(id, name, slug)`)
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Create product error:', error);
    return { product: null, error: error.message };
  }
};

// ─── Update ──────────────────────────────────────────────────────────────────

export const updateProduct = async (productId, updates) => {
  try {
    // Use live schema detection: only include columns that actually exist in the DB
    const payload = await sanitizeForSchema('products', updates);
    const safePayload = sanitizePayload(payload);

    const { data, error } = await supabase
      .from('products')
      .update(safePayload)
      .eq('id', productId)
      .select(`*, collection:collections(id, name, slug)`)
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Update product error:', error);
    return { product: null, error: error.message };
  }
};

// ─── Delete ──────────────────────────────────────────────────────────────────

// partnerships.featured_product_ids and homepage_sections.product_ids are
// plain UUID[] columns with no foreign key — Postgres can't cascade into
// array elements, so deleting a product silently leaves it referenced there
// forever (stale "N products" counts) unless we strip it out ourselves.
const removeProductsFromArrayColumns = async (productIds) => {
  if (!productIds?.length) return;
  const tables = [
    { name: 'partnerships', column: 'featured_product_ids' },
    { name: 'homepage_sections', column: 'product_ids' },
  ];
  const idSet = new Set(productIds);

  for (const { name, column } of tables) {
    const { data: rows, error } = await supabase
      .from(name)
      .select(`id, ${column}`)
      .overlaps(column, productIds);

    if (error || !rows) continue;

    for (const row of rows) {
      const cleaned = (row[column] || []).filter(id => !idSet.has(id));
      await supabase.from(name).update({ [column]: cleaned }).eq('id', row.id);
    }
  }
};

export const deleteProduct = async (productId) => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('images, video_url')
      .eq('id', productId)
      .single();

    // Delete storage files
    if (product?.images && Array.isArray(product.images)) {
      for (const url of product.images) {
        if (isSupabaseStorageUrl(url)) {
          const r = await deleteFileByUrl(url);
          if (!r.success) console.warn('Failed to delete image:', url, r.error);
        }
      }
    }
    if (product?.video_url && isSupabaseStorageUrl(product.video_url)) {
      await deleteFileByUrl(product.video_url);
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;

    await removeProductsFromArrayColumns([productId]);

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: error.message };
  }
};

export const bulkDeleteProducts = async (productIds) => {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('images, video_url')
      .in('id', productIds);

    const allUrls = [];
    if (products) {
      products.forEach(p => {
        if (p.images) allUrls.push(...p.images);
        if (p.video_url) allUrls.push(p.video_url);
      });
    }

    for (const url of allUrls) {
      if (isSupabaseStorageUrl(url)) await deleteFileByUrl(url);
    }

    const { error } = await supabase.from('products').delete().in('id', productIds);
    if (error) throw error;

    await removeProductsFromArrayColumns(productIds);

    return { success: true, error: null };
  } catch (error) {
    console.error('Bulk delete products error:', error);
    return { success: false, error: error.message };
  }
};

// ─── Status ──────────────────────────────────────────────────────────────────

export const updateProductStatus = async (productId, status) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Update product status error:', error);
    return { product: null, error: error.message };
  }
};

export const updateProductStock = async (productId, stock) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Update product stock error:', error);
    return { product: null, error: error.message };
  }
};

// ─── Toggle Flag ─────────────────────────────────────────────────────────────

export const toggleProductFlag = async (productId, flag, value) => {
  // Validate the flag is a known safe column before sending
  if (!SAFE_PRODUCT_COLUMNS.has(flag)) {
    console.error(`[toggleProductFlag] Unknown flag column: "${flag}"`);
    return { product: null, error: `Unknown flag: ${flag}` };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update({ [flag]: value })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Toggle product flag error:', error);
    return { product: null, error: error.message };
  }
};

// ─── Duplicate ───────────────────────────────────────────────────────────────

export const duplicateProduct = async (productId) => {
  try {
    const { data: original, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    const duplicate = sanitizePayload({
      ...original,
      name: `${original.name} (Copy)`,
      sku: original.sku ? `${original.sku}-COPY` : null,
      status: 'DRAFT',
      sort_order: (original.sort_order || 0) + 1,
    });

    const { data, error } = await supabase
      .from('products')
      .insert(duplicate)
      .select()
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error) {
    console.error('Duplicate product error:', error);
    return { product: null, error: error.message };
  }
};

// ─── Reorder ─────────────────────────────────────────────────────────────────

export const updateProductOrder = async (orderedIds) => {
  try {
    const updates = orderedIds.map((id, index) =>
      supabase.from('products').update({ sort_order: index }).eq('id', id)
    );
    await Promise.all(updates);
    return { success: true, error: null };
  } catch (error) {
    console.error('Update product order error:', error);
    return { success: false, error: error.message };
  }
};

// ─── Stats ───────────────────────────────────────────────────────────────────

export const getProductStats = async () => {
  try {
    const [
      { count: totalCount },
      { count: activeCount },
      { count: lowStockCount },
      { count: outOfStockCount },
      { count: draftCount },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock', 10).eq('status', 'ACTIVE'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).eq('status', 'ACTIVE'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT'),
    ]);

    return {
      stats: {
        total: totalCount || 0,
        active: activeCount || 0,
        lowStock: lowStockCount || 0,
        outOfStock: outOfStockCount || 0,
        drafts: draftCount || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get product stats error:', error);
    return { stats: null, error: error.message };
  }
};

// ─── Utilities ───────────────────────────────────────────────────────────────

export const generateSKU = (productName, category) => {
  const prefix = category === 'men' ? 'M' : category === 'women' ? 'W' : 'U';
  const namePart = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LUX-${prefix}${namePart}-${randomPart}`;
};

export const validateProductData = (productData) => {
  const errors = {};
  if (!productData.name || productData.name.trim() === '') errors.name = 'Product name is required';
  if (!productData.price || productData.price <= 0) errors.price = 'Valid price is required';
  if (!productData.category) errors.category = 'Category is required';
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Legacy alias kept for backwards compatibility
export const uploadProductImage = async (file) => {
  console.warn('[productAdminService] uploadProductImage is deprecated. Use storageService.uploadFile directly.');
  return { url: null, publicId: null, error: 'Use storageService.uploadFile with BUCKETS.PRODUCTS' };
};

export const deleteProductImage = async () => ({ success: true, error: null });
