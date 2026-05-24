import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSynced: false,

      // Add item to cart
      addItem: async (product, size, color, quantity = 1) => {
        const { user } = await supabase.auth.getUser();
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.id === product.id && i.size === size && i.color === color
          );
          
          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }
          
          return { items: [...state.items, { ...product, size, color, quantity }] };
        });

        // Sync to server if logged in
        if (user?.data?.user) {
          try {
            await supabase.from('cart_items').upsert({
              user_id: user.data.user.id,
              product_id: product.id,
              size,
              color,
              qty: quantity,
            }, {
              onConflict: 'user_id,product_id,size,color',
            });
          } catch (error) {
            console.error('Error syncing cart to server:', error);
          }
        }
      },

      // Remove item from cart
      removeItem: async (productId, size, color) => {
        const { user } = await supabase.auth.getUser();
        
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === productId && i.size === size && i.color === color)
          )
        }));

        // Remove from server if logged in
        if (user?.data?.user) {
          try {
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.data.user.id)
              .eq('product_id', productId)
              .eq('size', size)
              .eq('color', color);
          } catch (error) {
            console.error('Error removing cart item from server:', error);
          }
        }
      },

      // Update quantity
      updateQuantity: async (productId, size, color, quantity) => {
        const { user } = await supabase.auth.getUser();
        
        set((state) => ({
          items: state.items.map((i) => 
            i.id === productId && i.size === size && i.color === color 
              ? { ...i, quantity } 
              : i
          )
        }));

        // Update on server if logged in
        if (user?.data?.user) {
          try {
            await supabase
              .from('cart_items')
              .update({ qty: quantity })
              .eq('user_id', user.data.user.id)
              .eq('product_id', productId)
              .eq('size', size)
              .eq('color', color);
          } catch (error) {
            console.error('Error updating cart quantity on server:', error);
          }
        }
      },

      // Clear cart
      clearCart: async () => {
        const { user } = await supabase.auth.getUser();
        
        set({ items: [] });

        // Clear from server if logged in
        if (user?.data?.user) {
          try {
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.data.user.id);
          } catch (error) {
            console.error('Error clearing cart on server:', error);
          }
        }
      },

      // Load cart from server
      loadCartFromServer: async (userId) => {
        set({ isLoading: true });
        
        try {
          const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
              *,
              products (*)
            `)
            .eq('user_id', userId);

          if (error) throw error;

          const items = cartItems.map(item => ({
            ...item.products,
            size: item.size,
            color: item.color,
            quantity: item.qty,
          }));

          set({ items, isSynced: true });
        } catch (error) {
          console.error('Error loading cart from server:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Merge local cart with server cart on login
      mergeCartOnLogin: async (userId) => {
        const localItems = get().items;
        
        if (localItems.length === 0) {
          // No local items, just load from server
          await get().loadCartFromServer(userId);
          return;
        }

        set({ isLoading: true });

        try {
          // Get server cart
          const { data: serverCartItems, error } = await supabase
            .from('cart_items')
            .select(`
              *,
              products (*)
            `)
            .eq('user_id', userId);

          if (error) throw error;

          // Merge logic: local items take precedence
          const mergedItems = [...localItems];
          
          serverCartItems?.forEach(serverItem => {
            const existingIndex = mergedItems.findIndex(
              item => 
                item.id === serverItem.product_id &&
                item.size === serverItem.size &&
                item.color === serverItem.color
            );

            if (existingIndex === -1) {
              // Add server item if not in local cart
              mergedItems.push({
                ...serverItem.products,
                size: serverItem.size,
                color: serverItem.color,
                quantity: serverItem.qty,
              });
            }
          });

          // Update local state
          set({ items: mergedItems });

          // Sync merged cart to server
          const upsertPromises = mergedItems.map(item =>
            supabase.from('cart_items').upsert({
              user_id: userId,
              product_id: item.id,
              size: item.size,
              color: item.color,
              qty: item.quantity,
            }, {
              onConflict: 'user_id,product_id,size,color',
            })
          );

          await Promise.all(upsertPromises);
          set({ isSynced: true });
        } catch (error) {
          console.error('Error merging cart on login:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Get totals
      getTotals: () => {
        const items = get().items;
        return {
          total: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
          count: items.reduce((acc, item) => acc + item.quantity, 0)
        };
      }
    }),
    {
      name: '44luxury-cart-storage',
    }
  )
);

