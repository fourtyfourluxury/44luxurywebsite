import { supabase } from '../lib/supabase';

/**
 * Partnership Service
 * Public, storefront-facing reads for partnerships (brand collaborations).
 * Admin CRUD lives in services/admin/partnershipAdminService.js.
 */

// Get all active partnerships, ordered for display
export const getPartnerships = async () => {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return { partnerships: data || [], error: null };
  } catch (error) {
    console.error('Get partnerships error:', error);
    return { partnerships: [], error: error.message };
  }
};
