import { supabase } from '../../lib/supabase';
import { sendComplaintResponseEmail } from '../emailService';

/**
 * Complaint Admin Service
 * Handles admin complaint management operations
 */

/**
 * Get all complaints with filters
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status
 * @param {string} filters.search - Search by customer name or email
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getAllComplaints(filters = {}) {
  try {
    let query = supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter
    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    // Apply search filter
    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,complaint_number.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get complaint by ID
 * @param {string} complaintId - Complaint ID
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getComplaintById(complaintId) {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update complaint status
 * @param {string} complaintId - Complaint ID
 * @param {string} status - New status (OPEN, IN REVIEW, RESOLVED)
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateComplaintStatus(complaintId, status) {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', complaintId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Respond to complaint
 * @param {string} complaintId - Complaint ID
 * @param {string} response - Admin response text
 * @param {string} status - New status (default: IN REVIEW)
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function respondToComplaint(complaintId, response, status = 'IN REVIEW') {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        admin_response: response,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', complaintId)
      .select()
      .single();

    if (error) throw error;

    // Send complaint response email (don't fail operation if email fails)
    try {
      await sendComplaintResponseEmail({
        email: data.email,
        customerName: data.customer_name,
        complaintId: data.complaint_number || data.id.slice(0, 8),
        subject: data.subject,
        response: response,
        status: status,
        submittedDate: data.created_at,
      });
    } catch (emailError) {
      console.error('Failed to send complaint response email:', emailError);
      // Continue with operation even if email fails
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error responding to complaint:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete complaint
 * @param {string} complaintId - Complaint ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteComplaint(complaintId) {
  try {
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', complaintId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get complaint statistics
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getComplaintStats() {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('status, created_at');

    if (error) throw error;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: complaints.length,
      open: complaints.filter(c => c.status === 'OPEN').length,
      inReview: complaints.filter(c => c.status === 'IN REVIEW').length,
      resolved: complaints.filter(c => c.status === 'RESOLVED').length,
      thisWeek: complaints.filter(c => new Date(c.created_at) >= weekAgo).length,
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Bulk update complaint status
 * @param {Array} complaintIds - Array of complaint IDs
 * @param {string} status - New status
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function bulkUpdateStatus(complaintIds, status) {
  try {
    const { error } = await supabase
      .from('complaints')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', complaintIds);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error bulk updating status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get recent complaints
 * @param {number} limit - Number of complaints to fetch
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getRecentComplaints(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching recent complaints:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Export complaints to CSV format
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: string, error: string|null}>}
 */
export async function exportComplaintsCSV(filters = {}) {
  try {
    const { data: complaints, error } = await getAllComplaints(filters);

    if (error) throw error;

    // Generate CSV
    const headers = ['Complaint #', 'Date', 'Customer', 'Email', 'Subject', 'Status', 'Order #', 'Message', 'Response'];
    const rows = complaints.map(c => [
      c.complaint_number || c.id.slice(0, 8),
      new Date(c.created_at).toLocaleDateString(),
      c.customer_name,
      c.email,
      c.subject,
      c.status,
      c.order_number || 'N/A',
      `"${c.message.replace(/"/g, '""')}"`,
      c.admin_response ? `"${c.admin_response.replace(/"/g, '""')}"` : 'N/A',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return { data: csv, error: null };
  } catch (error) {
    console.error('Error exporting complaints:', error);
    return { data: null, error: error.message };
  }
}
