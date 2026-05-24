import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';

/**
 * Account Service
 * Handles user profile, addresses, and preferences
 */

// =====================================================
// PROFILE MANAGEMENT
// =====================================================

// Get user profile
export const getProfile = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { profile: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return { profile: data, error: null };
  } catch (error) {
    console.error('Get profile error:', error);
    return { profile: null, error: error.message };
  }
};

// Update user profile
export const updateProfile = async (updates) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { profile: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { profile: data, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { profile: null, error: error.message };
  }
};

// =====================================================
// ADDRESS MANAGEMENT
// =====================================================

// Get user addresses
export const getAddresses = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { addresses: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { addresses: data, error: null };
  } catch (error) {
    console.error('Get addresses error:', error);
    return { addresses: [], error: error.message };
  }
};

// Get default address
export const getDefaultAddress = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { address: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return { address: data, error: null };
  } catch (error) {
    console.error('Get default address error:', error);
    return { address: null, error: error.message };
  }
};

// Add new address
export const addAddress = async (addressData) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { address: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        ...addressData,
      })
      .select()
      .single();

    if (error) throw error;

    return { address: data, error: null };
  } catch (error) {
    console.error('Add address error:', error);
    return { address: null, error: error.message };
  }
};

// Update address
export const updateAddress = async (addressId, updates) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { address: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { address: data, error: null };
  } catch (error) {
    console.error('Update address error:', error);
    return { address: null, error: error.message };
  }
};

// Delete address
export const deleteAddress = async (addressId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete address error:', error);
    return { success: false, error: error.message };
  }
};

// Set default address
export const setDefaultAddress = async (addressId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // The database trigger will handle unsetting other defaults
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Set default address error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// USER PREFERENCES
// =====================================================

// Get user preferences
export const getPreferences = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { preferences: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return { preferences: data, error: null };
  } catch (error) {
    console.error('Get preferences error:', error);
    return { preferences: null, error: error.message };
  }
};

// Update user preferences
export const updatePreferences = async (updates) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { preferences: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { preferences: data, error: null };
  } catch (error) {
    console.error('Update preferences error:', error);
    return { preferences: null, error: error.message };
  }
};

// =====================================================
// COMPLAINTS
// =====================================================

// Get user complaints
export const getMyComplaints = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { complaints: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { complaints: data, error: null };
  } catch (error) {
    console.error('Get my complaints error:', error);
    return { complaints: [], error: error.message };
  }
};

// Submit new complaint
export const submitComplaint = async (complaintData) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { complaint: null, error: 'Not authenticated' };

    const { data: profile } = await getProfile();

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        user_id: user.id,
        customer_name: profile?.full_name || '',
        email: profile?.email || user.email,
        ...complaintData,
      })
      .select()
      .single();

    if (error) throw error;

    return { complaint: data, error: null };
  } catch (error) {
    console.error('Submit complaint error:', error);
    return { complaint: null, error: error.message };
  }
};

// Get single complaint
export const getComplaintById = async (complaintId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { complaint: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return { complaint: data, error: null };
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    return { complaint: null, error: error.message };
  }
};

// =====================================================
// NEWSLETTER
// =====================================================

// Subscribe to newsletter
export const subscribeNewsletter = async (email) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email })
      .select()
      .single();

    if (error) {
      // Check if already subscribed
      if (error.code === '23505') {
        return { success: true, error: null, message: 'Already subscribed' };
      }
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Subscribe newsletter error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// CONTACT FORM
// =====================================================

// Submit contact message
export const submitContactMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Submit contact message error:', error);
    return { success: false, error: error.message };
  }
};
