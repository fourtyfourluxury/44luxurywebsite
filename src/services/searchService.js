/**
 * Search Service
 * Handles full-text search functionality for products
 */

import { supabase } from '../lib/supabase';

/**
 * Search products with full-text search
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function searchProducts(query, filters = {}) {
  try {
    if (!query || query.trim().length === 0) {
      return { data: [], error: null };
    }

    const {
      category = null,
      minPrice = null,
      maxPrice = null,
      limit = 20
    } = filters;

    const { data, error } = await supabase.rpc('search_products', {
      search_query: query.trim(),
      category_filter: category,
      min_price: minPrice,
      max_price: maxPrice,
      limit_count: limit
    });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching products:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get search suggestions for autocomplete
 * @param {string} query - Search query
 * @param {number} limit - Number of suggestions
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getSearchSuggestions(query, limit = 5) {
  try {
    if (!query || query.trim().length < 2) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase.rpc('search_suggestions', {
      search_query: query.trim(),
      limit_count: limit
    });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Search products with basic text matching (fallback)
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function searchProductsBasic(query, filters = {}) {
  try {
    if (!query || query.trim().length === 0) {
      return { data: [], error: null };
    }

    const searchTerm = `%${query.trim().toLowerCase()}%`;
    let queryBuilder = supabase
      .from('products')
      .select('*')
      .eq('status', 'ACTIVE')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`);

    // Apply filters
    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      queryBuilder = queryBuilder.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      queryBuilder = queryBuilder.lte('price', filters.maxPrice);
    }

    // Limit results
    queryBuilder = queryBuilder.limit(filters.limit || 20);

    const { data, error } = await queryBuilder;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in basic search:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get popular search terms
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getPopularSearches() {
  try {
    // Get most common product categories and tags
    const { data, error } = await supabase
      .from('products')
      .select('category, tags')
      .eq('status', 'ACTIVE')
      .limit(100);

    if (error) throw error;

    // Extract unique categories and tags
    const categories = new Set();
    const tags = new Set();

    data.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tags.add(tag));
      }
    });

    const popularSearches = [
      ...Array.from(categories).slice(0, 5),
      ...Array.from(tags).slice(0, 5)
    ];

    return { data: popularSearches, error: null };
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Subscribe to product search updates (realtime)
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToProductUpdates(callback) {
  const subscription = supabase
    .channel('products-search')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Unsubscribe from product updates
 * @param {Object} subscription - Subscription object
 */
export async function unsubscribeFromProductUpdates(subscription) {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
}
