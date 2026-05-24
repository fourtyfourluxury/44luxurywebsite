import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';

/**
 * Cart Service
 * Handles shopping cart operations (server-side for authenticated users)
 */

// Get user's cart
export const getCart = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { cartItems: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    return { cartItems: data, error: null };
  } catch (error) {
    console.error('Get cart error:', error);
    return { cartItems: [], error: error.message };
  }
};

// Add item to cart
export const addToCart = async ({ productId, size, color, qty = 1 }) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { cartItem: null, error: 'Not authenticated' };

    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('size', size || '')
      .eq('color', color || '')
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ qty: existing.qty + qty })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { cartItem: data, error: null };
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          size,
          color,
          qty,
        })
        .select()
        .single();

      if (error) throw error;
      return { cartItem: data, error: null };
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    return { cartItem: null, error: error.message };
  }
};

// Update cart item quantity
export const updateCartItemQty = async (cartItemId, qty) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ qty })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;

    return { cartItem: data, error: null };
  } catch (error) {
    console.error('Update cart item qty error:', error);
    return { cartItem: null, error: error.message };
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Remove from cart error:', error);
    return { success: false, error: error.message };
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Clear cart error:', error);
    return { success: false, error: error.message };
  }
};

// Merge local cart with server cart (on login)
export const mergeCart = async (localCartItems) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Add each local cart item to server
    for (const item of localCartItems) {
      await addToCart({
        productId: item.productId,
        size: item.size,
        color: item.color,
        qty: item.qty,
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Merge cart error:', error);
    return { success: false, error: error.message };
  }
};

// Calculate cart totals
export const calculateCartTotals = (cartItems) => {
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.qty;
  }, 0);

  const shipping = subtotal >= 5000000 ? 0 : 200000; // Free shipping over ₦50,000
  const total = subtotal + shipping;

  return {
    subtotal,
    shipping,
    total,
    itemCount: cartItems.reduce((count, item) => count + item.qty, 0),
  };
};
