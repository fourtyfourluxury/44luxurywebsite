import { supabase } from '../lib/supabase';

/**
 * Collection Service
 * Handles all collection-related database operations
 */

// Get all active collections
export const getCollections = async (filters = {}) => {
  try {
    let query = supabase
      .from('collections')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('sort_order', { ascending: true });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { collections: data, error: null };
  } catch (error) {
    console.error('Get collections error:', error);
    return { collections: [], error: error.message };
  }
};

// Get single collection by slug
export const getCollectionBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .single();

    if (error) throw error;

    return { collection: data, error: null };
  } catch (error) {
    console.error('Get collection by slug error:', error);
    return { collection: null, error: error.message };
  }
};

// Get single collection by ID
export const getCollectionById = async (collectionId) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single();

    if (error) throw error;

    return { collection: data, error: null };
  } catch (error) {
    console.error('Get collection by ID error:', error);
    return { collection: null, error: error.message };
  }
};

// Get collection with product count
export const getCollectionWithProductCount = async (slug) => {
  try {
    // Get collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .single();

    if (collectionError) throw collectionError;

    // Get product count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collection.id)
      .eq('status', 'ACTIVE');

    if (countError) throw countError;

    return {
      collection: { ...collection, productCount: count },
      error: null,
    };
  } catch (error) {
    console.error('Get collection with product count error:', error);
    return { collection: null, error: error.message };
  }
};

// Get collections for navigation (with product counts)
export const getCollectionsForNav = async () => {
  try {
    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, name, slug, category')
      .eq('status', 'ACTIVE')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Get product counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', collection.id)
          .eq('status', 'ACTIVE');

        return { ...collection, productCount: count || 0 };
      })
    );

    return { collections: collectionsWithCounts, error: null };
  } catch (error) {
    console.error('Get collections for nav error:', error);
    return { collections: [], error: error.message };
  }
};

// Get collections by category
export const getCollectionsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('category', category)
      .eq('status', 'ACTIVE')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return { collections: data, error: null };
  } catch (error) {
    console.error('Get collections by category error:', error);
    return { collections: [], error: error.message };
  }
};

// Get collection branches (sub-categories)
export const getCollectionBranches = async (collectionSlug) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('branches')
      .eq('slug', collectionSlug)
      .eq('status', 'ACTIVE')
      .single();

    if (error) throw error;

    return { branches: data?.branches || [], error: null };
  } catch (error) {
    console.error('Get collection branches error:', error);
    return { branches: [], error: error.message };
  }
};
