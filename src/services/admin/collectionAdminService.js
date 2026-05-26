import { supabase } from '../../lib/supabase';
import { deleteFileByUrl, isSupabaseStorageUrl } from '../storageService';

/**
 * Collection Admin Service
 * Handles admin collection management operations
 */

/**
 * Get all collections with product counts
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getAllCollections() {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        products:products(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to include product count
    const collections = data.map(col => ({
      ...col,
      product_count: col.products[0]?.count || 0,
    }));

    return { data: collections, error: null };
  } catch (error) {
    console.error('Error fetching collections:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get collection by ID
 * @param {string} collectionId - Collection ID
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getCollectionById(collectionId) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching collection:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create new collection
 * @param {Object} collectionData - Collection data
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function createCollection(collectionData) {
  try {
    // Generate slug from name if not provided
    const slug = collectionData.slug || 
      collectionData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('collections')
      .insert({
        ...collectionData,
        slug,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating collection:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update collection
 * @param {string} collectionId - Collection ID
 * @param {Object} updates - Collection updates
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateCollection(collectionId, updates) {
  try {
    // Update slug if name changed
    if (updates.name && !updates.slug) {
      updates.slug = updates.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating collection:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete collection
 * @param {string} collectionId - Collection ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteCollection(collectionId) {
  try {
    // Check if collection has products
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('collection_id', collectionId)
      .limit(1);

    if (products && products.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete collection with products. Remove products first.' 
      };
    }

    // Fetch the collection to get the hero image URL before deleting
    const { data: collection } = await supabase
      .from('collections')
      .select('hero_image')
      .eq('id', collectionId)
      .single();

    // Delete hero image from Supabase Storage if it exists
    if (collection?.hero_image && isSupabaseStorageUrl(collection.hero_image)) {
      const deleteResult = await deleteFileByUrl(collection.hero_image);
      if (!deleteResult.success) {
        console.warn('⚠️ Failed to delete hero image from storage:', deleteResult.error);
        // Continue with collection deletion even if image deletion fails
      } else {
        console.log('✅ Hero image deleted from storage');
      }
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting collection:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get collection statistics
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getCollectionStats() {
  try {
    const { data: collections, error } = await supabase
      .from('collections')
      .select('status');

    if (error) throw error;

    const stats = {
      total: collections.length,
      active: collections.filter(c => c.status === 'ACTIVE').length,
      draft: collections.filter(c => c.status === 'DRAFT').length,
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update collection sort order
 * @param {Array} sortedIds - Array of collection IDs in new order
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function updateCollectionOrder(sortedIds) {
  try {
    const updates = sortedIds.map((id, index) => 
      supabase
        .from('collections')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating collection order:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk update collection status
 * @param {Array} collectionIds - Array of collection IDs
 * @param {string} status - New status (ACTIVE, DRAFT)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function bulkUpdateStatus(collectionIds, status) {
  try {
    const { error } = await supabase
      .from('collections')
      .update({ status })
      .in('id', collectionIds);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error bulk updating status:', error);
    return { success: false, error: error.message };
  }
}
