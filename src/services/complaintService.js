import { supabase } from '../lib/supabase';

/**
 * Complaint Service
 * Handles user complaint submission and retrieval
 */

/**
 * Get all complaints for the current user
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getMyComplaints() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getMyComplaints:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get a single complaint by ID
 * @param {string} complaintId - The complaint ID
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getComplaintById(complaintId) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching complaint:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getComplaintById:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Submit a new complaint
 * @param {Object} complaintData - The complaint data
 * @param {string} complaintData.subject - Complaint subject
 * @param {string} complaintData.message - Complaint message (min 20 chars)
 * @param {string} [complaintData.orderNumber] - Optional order number
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function submitComplaint({ subject, message, orderNumber = null }) {
  try {
    // Validate input
    if (!subject || !message) {
      return { data: null, error: 'Subject and message are required' };
    }

    if (message.length < 20) {
      return { data: null, error: 'Message must be at least 20 characters' };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get user profile for name and email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { data: null, error: 'Failed to fetch user profile' };
    }

    // Insert complaint
    const { data, error } = await supabase
      .from('complaints')
      .insert({
        user_id: user.id,
        customer_name: profile.full_name || 'Unknown',
        email: profile.email,
        subject,
        message,
        order_number: orderNumber,
        status: 'OPEN',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting complaint:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in submitComplaint:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get complaint statistics for the current user
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getComplaintStats() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('status')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching complaint stats:', error);
      return { data: null, error: error.message };
    }

    const stats = {
      total: complaints.length,
      open: complaints.filter(c => c.status === 'OPEN').length,
      inReview: complaints.filter(c => c.status === 'IN REVIEW').length,
      resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error in getComplaintStats:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Check if user has any unresolved complaints
 * @returns {Promise<{data: boolean, error: string|null}>}
 */
export async function hasUnresolvedComplaints() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('complaints')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['OPEN', 'IN REVIEW'])
      .limit(1);

    if (error) {
      console.error('Error checking unresolved complaints:', error);
      return { data: false, error: error.message };
    }

    return { data: data.length > 0, error: null };
  } catch (error) {
    console.error('Error in hasUnresolvedComplaints:', error);
    return { data: false, error: error.message };
  }
}
