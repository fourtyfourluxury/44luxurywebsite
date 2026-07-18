/**
 * Realtime Service
 * Handles realtime subscriptions for orders, complaints, and other entities
 */

import { supabase } from '../lib/supabase';

/**
 * Subscribe to order updates for a specific user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToUserOrders(userId, callback) {
  if (!userId) {
    console.error('User ID is required for order subscription');
    return null;
  }

  const subscription = supabase
    .channel(`user-orders-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback({
          event: payload.eventType,
          order: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to complaint updates for a specific user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToUserComplaints(userId, callback) {
  if (!userId) {
    console.error('User ID is required for complaint subscription');
    return null;
  }

  const subscription = supabase
    .channel(`user-complaints-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'complaints',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback({
          event: payload.eventType,
          complaint: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to all orders (admin only)
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToAllOrders(callback) {
  const subscription = supabase
    .channel('all-orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders'
      },
      (payload) => {
        callback({
          event: payload.eventType,
          order: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to all complaints (admin only)
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToAllComplaints(callback) {
  const subscription = supabase
    .channel('all-complaints')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'complaints'
      },
      (payload) => {
        callback({
          event: payload.eventType,
          complaint: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to product stock updates
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToProductStock(callback) {
  const subscription = supabase
    .channel('product-stock')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: 'stock_quantity=lt.10' // Only notify when stock is low
      },
      (payload) => {
        callback({
          event: 'STOCK_UPDATE',
          product: payload.new,
          oldStock: payload.old?.stock_quantity,
          newStock: payload.new?.stock_quantity,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to cart updates for a specific user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToUserCart(userId, callback) {
  if (!userId) {
    console.error('User ID is required for cart subscription');
    return null;
  }

  const subscription = supabase
    .channel(`user-cart-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback({
          event: payload.eventType,
          cartItem: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to wishlist updates for a specific user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToUserWishlist(userId, callback) {
  if (!userId) {
    console.error('User ID is required for wishlist subscription');
    return null;
  }

  const subscription = supabase
    .channel(`user-wishlist-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wishlist_items',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback({
          event: payload.eventType,
          wishlistItem: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to new contact submissions (admin only)
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToContactSubmissions(callback) {
  const subscription = supabase
    .channel('contact-submissions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'contact_submissions'
      },
      (payload) => {
        callback({
          event: 'NEW_CONTACT',
          submission: payload.new,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to new newsletter subscribers (admin only)
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToNewsletterSubscribers(callback) {
  const subscription = supabase
    .channel('newsletter-subscribers')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'newsletter_subscribers'
      },
      (payload) => {
        callback({
          event: 'NEW_SUBSCRIBER',
          subscriber: payload.new,
          timestamp: new Date()
        });
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Unsubscribe from a channel
 * @param {Object} subscription - Subscription object
 */
export async function unsubscribe(subscription) {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
}

/**
 * Unsubscribe from multiple channels
 * @param {Array} subscriptions - Array of subscription objects
 */
export async function unsubscribeAll(subscriptions) {
  if (!subscriptions || !Array.isArray(subscriptions)) return;

  for (const subscription of subscriptions) {
    if (subscription) {
      await supabase.removeChannel(subscription);
    }
  }
}

/**
 * Get subscription status
 * @param {Object} subscription - Subscription object
 * @returns {string} Status (SUBSCRIBED, TIMED_OUT, CLOSED, CHANNEL_ERROR)
 */
export function getSubscriptionStatus(subscription) {
  if (!subscription) return 'NONE';
  return subscription.state;
}

/**
 * Subscribe to homepage config updates
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToHomepageConfig(callback) {
  const subscription = supabase
    .channel('homepage-config-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'homepage_config'
      },
      (payload) => {
        console.log('🔄 Realtime: Homepage config updated', payload);
        callback({
          event: 'CONFIG_UPDATE',
          config: payload.new,
          timestamp: new Date()
        });
      }
    )
    .subscribe((status) => {
      console.log('📡 Homepage config subscription status:', status);
    });

  return subscription;
}

/**
 * Subscribe to hero slides updates
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToHeroSlides(callback) {
  const subscription = supabase
    .channel('hero-slides-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'hero_slides'
      },
      (payload) => {
        console.log('🔄 Realtime: Hero slides changed', payload);
        callback({
          event: payload.eventType,
          slide: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe((status) => {
      console.log('📡 Hero slides subscription status:', status);
    });

  return subscription;
}

/**
 * Subscribe to product updates (for admin panel)
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToProducts(callback) {
  const subscription = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        console.log('🔄 Realtime: Product changed', payload);
        callback({
          event: payload.eventType,
          product: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe((status) => {
      console.log('📡 Products subscription status:', status);
    });

  return subscription;
}

/**
 * Subscribe to collection updates (for admin panel)
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToCollections(callback) {
  const subscription = supabase
    .channel('collections-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'collections'
      },
      (payload) => {
        console.log('🔄 Realtime: Collection changed', payload);
        callback({
          event: payload.eventType,
          collection: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe((status) => {
      console.log('📡 Collections subscription status:', status);
    });

  return subscription;
}

/**
 * Subscribe to homepage product sections updates
 * @param {Function} callback - Callback function for updates
 * @returns {Object} Subscription object
 */
export function subscribeToHomepageSections(callback) {
  const subscription = supabase
    .channel('homepage-sections-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'homepage_sections'
      },
      (payload) => {
        console.log('🔄 Realtime: Homepage sections changed', payload);
        callback({
          event: payload.eventType,
          section: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    )
    .subscribe((status) => {
      console.log('📡 Homepage sections subscription status:', status);
    });

  return subscription;
}

/**
 * Create a presence channel for real-time user presence
 * @param {string} channelName - Channel name
 * @param {Object} userInfo - User information
 * @param {Function} onPresenceChange - Callback for presence changes
 * @returns {Object} Subscription object
 */
export function createPresenceChannel(channelName, userInfo, onPresenceChange) {
  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: userInfo.id
      }
    }
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresenceChange(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(userInfo);
      }
    });

  return channel;
}
