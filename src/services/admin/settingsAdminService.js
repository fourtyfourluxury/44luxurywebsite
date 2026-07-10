import { supabase } from '../../lib/supabase';

/**
 * Settings Admin Service
 * Handles admin settings management operations
 */

/**
 * Get site settings
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update site settings
 * @param {Object} updates - Settings updates
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateSettings(updates) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1, // Single row settings
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get store information
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getStoreInfo() {
  try {
    const { data, error } = await getSettings();

    if (error) throw error;

    const storeInfo = {
      name: data?.store_name || '44LUXURY',
      email: data?.contact_email || 'hello@44luxury.com',
      phone: data?.contact_phone || '+234 800 000 0044',
      address: data?.store_address || 'Shariff Plaza, Banex Wuse 2, Shop C426, Abuja, Nigeria',
    };

    return { data: storeInfo, error: null };
  } catch (error) {
    console.error('Error fetching store info:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update store information
 * @param {Object} storeInfo - Store information
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateStoreInfo(storeInfo) {
  try {
    const updates = {
      store_name: storeInfo.name,
      contact_email: storeInfo.email,
      contact_phone: storeInfo.phone,
      store_address: storeInfo.address,
    };

    return await updateSettings(updates);
  } catch (error) {
    console.error('Error updating store info:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Clear all carts (DANGER ZONE)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function clearAllCarts() {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error clearing all carts:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset homepage configuration (DANGER ZONE)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function resetHomepage() {
  try {
    // Delete all hero slides
    await supabase
      .from('hero_slides')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Reset homepage config to defaults
    const defaultConfig = {
      id: 1,
      sections: [
        { id: 'hero', type: 'hero', title: 'Hero Banner', visible: true, config: {} },
        { id: 'announcement', type: 'announcement', title: 'Announcement Bar', visible: true, config: {} },
        { id: 'tagline', type: 'tagline', title: 'Brand Tagline', visible: true, config: {} },
        { id: 'products', type: 'products', title: 'New Arrivals', visible: true, config: {} },
        { id: 'editorial', type: 'editorial', title: 'Editorial Feature', visible: true, config: {} },
        { id: 'collections', type: 'collections', title: 'Collections', visible: true, config: {} },
        { id: 'video', type: 'video', title: 'Video Section', visible: true, config: {} },
      ],
    };

    const { error } = await supabase
      .from('homepage_config')
      .upsert(defaultConfig);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error resetting homepage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get system statistics
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getSystemStats() {
  try {
    // Get counts from various tables
    const [
      { count: productCount },
      { count: orderCount },
      { count: customerCount },
      { count: collectionCount },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('collections').select('*', { count: 'exact', head: true }),
    ]);

    const stats = {
      products: productCount || 0,
      orders: orderCount || 0,
      customers: customerCount || 0,
      collections: collectionCount || 0,
      version: '2.0.0',
      environment: import.meta.env.MODE || 'development',
      framework: 'React / Vite',
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update currency settings
 * @param {Object} currencySettings - Currency settings
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateCurrencySettings(currencySettings) {
  try {
    const updates = {
      primary_currency: currencySettings.primary || 'NGN',
      supported_currencies: currencySettings.supported || ['NGN'],
      exchange_rates: currencySettings.rates || {},
    };

    return await updateSettings(updates);
  } catch (error) {
    console.error('Error updating currency settings:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update email settings
 * @param {Object} emailSettings - Email settings
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateEmailSettings(emailSettings) {
  try {
    const updates = {
      email_from: emailSettings.from,
      email_reply_to: emailSettings.replyTo,
      email_notifications_enabled: emailSettings.enabled,
    };

    return await updateSettings(updates);
  } catch (error) {
    console.error('Error updating email settings:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get maintenance mode status
 * @returns {Promise<{data: boolean, error: string|null}>}
 */
export async function getMaintenanceMode() {
  try {
    const { data, error } = await getSettings();

    if (error) throw error;

    return { data: data?.maintenance_mode || false, error: null };
  } catch (error) {
    console.error('Error fetching maintenance mode:', error);
    return { data: false, error: error.message };
  }
}

/**
 * Toggle maintenance mode
 * @param {boolean} enabled - Maintenance mode state
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function toggleMaintenanceMode(enabled) {
  try {
    const { error } = await updateSettings({
      maintenance_mode: enabled,
    });

    if (error) throw new Error(error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    return { success: false, error: error.message };
  }
}
