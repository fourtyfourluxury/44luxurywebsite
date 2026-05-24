import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';

/**
 * Wishlist Service
 * Handles wishlist operations
 */

// Get user's wishlist
export const getWishlist = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { wishlistItems: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { wishlistItems: data, error: null };
  } catch (error) {
    console.error('Get wishlist error:', error);
    return { wishlistItems: [], error: error.message };
  }
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { wishlistItem: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select()
      .single();

    if (error) throw error;

    return { wishlistItem: data, error: null };
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return { wishlistItem: null, error: error.message };
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return { success: false, error: error.message };
  }
};

// Toggle wishlist (add if not exists, remove if exists)
export const toggleWishlist = async (productId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { isWishlisted: false, error: 'Not authenticated' };

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Remove from wishlist
      await removeFromWishlist(productId);
      return { isWishlisted: false, error: null };
    } else {
      // Add to wishlist
      await addToWishlist(productId);
      return { isWishlisted: true, error: null };
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return { isWishlisted: false, error: error.message };
  }
};

// Check if product is in wishlist
export const isInWishlist = async (productId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { isWishlisted: false, error: null };

    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    return { isWishlisted: !!data, error: null };
  } catch (error) {
    console.error('Check wishlist error:', error);
    return { isWishlisted: false, error: error.message };
  }
};

// Get wishlist product IDs (for quick checks)
export const getWishlistProductIds = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { productIds: [], error: null };

    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);

    if (error) throw error;

    const productIds = data.map((item) => item.product_id);
    return { productIds, error: null };
  } catch (error) {
    console.error('Get wishlist product IDs error:', error);
    return { productIds: [], error: error.message };
  }
};
