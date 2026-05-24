import { supabase } from '../lib/supabase';

/**
 * Product Service
 * Handles all product-related database operations
 */

// Get all active products with optional filters
export const getProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.collectionId) {
      query = query.eq('collection_id', filters.collectionId);
    }

    if (filters.isNew) {
      query = query.eq('is_new', true);
    }

    if (filters.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get products error:', error);
    return { products: [], error: error.message };
  }
};

// Get single product by ID
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .eq('id', productId)
      .single();

    if (error) throw error;

    return { product: data, error: null };
  } catch (error) {
    console.error('Get product by ID error:', error);
    return { product: null, error: error.message };
  }
};

// Get products by collection slug
export const getProductsByCollection = async (collectionSlug) => {
  try {
    // First get the collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', collectionSlug)
      .eq('status', 'ACTIVE')
      .single();

    if (collectionError) throw collectionError;

    // Then get products in that collection
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .eq('collection_id', collection.id)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get products by collection error:', error);
    return { products: [], error: error.message };
  }
};

// Search products by name, description, or SKU
export const searchProducts = async (searchQuery) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .eq('status', 'ACTIVE')
      .textSearch('search_vector', searchQuery, {
        type: 'websearch',
        config: 'english',
      })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Search products error:', error);
    return { products: [], error: error.message };
  }
};

// Get new arrivals (products marked as new)
export const getNewArrivals = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .eq('status', 'ACTIVE')
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get new arrivals error:', error);
    return { products: [], error: error.message };
  }
};

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .eq('status', 'ACTIVE')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get featured products error:', error);
    return { products: [], error: error.message };
  }
};

// Get related products (same collection, excluding current product)
export const getRelatedProducts = async (productId, collectionId, limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .eq('status', 'ACTIVE')
      .eq('collection_id', collectionId)
      .neq('id', productId)
      .limit(limit);

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get related products error:', error);
    return { products: [], error: error.message };
  }
};

// Get products by IDs (for featured products on homepage)
export const getProductsByIds = async (productIds) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(id, name, slug)
      `)
      .in('id', productIds)
      .eq('status', 'ACTIVE');

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get products by IDs error:', error);
    return { products: [], error: error.message };
  }
};

// Get low stock products (for admin dashboard)
export const getLowStockProducts = async (threshold = 10) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', threshold)
      .eq('status', 'ACTIVE')
      .order('stock', { ascending: true });

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get low stock products error:', error);
    return { products: [], error: error.message };
  }
};

// Format price from kobo to naira
export const formatPrice = (priceInKobo) => {
  const naira = priceInKobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(naira);
};

// Check if product is in stock
export const isInStock = (product, size = null, color = null) => {
  if (!product) return false;
  
  // Basic stock check
  if (product.stock <= 0) return false;
  
  // If size/color specified, you could add variant-specific stock logic here
  // For now, we just check overall stock
  
  return true;
};
