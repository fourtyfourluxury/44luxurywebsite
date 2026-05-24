import { supabase } from '../lib/supabase';

/**
 * Admin Authentication Service
 * Handles admin login with username/email and password
 * Credentials are stored securely in Supabase with hashed passwords
 */

/**
 * Admin login with username/email and password
 * @param {string} usernameOrEmail - Username or email
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, admin: object|null, error: string|null}>}
 */
export const adminLogin = async (usernameOrEmail, password) => {
  try {
    console.log('🔐 Starting admin login...');
    console.log('📝 Username/Email:', usernameOrEmail);
    
    // TEMPORARY: Direct table query instead of RPC
    // First, get the admin record
    console.log('📡 Querying admin_credentials table...');
    const { data: adminData, error: queryError } = await supabase
      .from('admin_credentials')
      .select('id, username, email, password_hash, is_active')
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
      .eq('is_active', true)
      .single();

    console.log('📊 Query result:', { adminData, queryError });

    if (queryError) {
      console.error('❌ Query error:', queryError);
      return {
        success: false,
        admin: null,
        error: `Database error: ${queryError.message}`,
      };
    }

    if (!adminData) {
      console.log('❌ No admin found');
      return {
        success: false,
        admin: null,
        error: 'Invalid username/email or password',
      };
    }

    console.log('✅ Admin found:', adminData.username);

    // Now verify password using RPC
    console.log('📡 Calling verify_password RPC...');
    const { data: verifyData, error: verifyError } = await supabase.rpc('verify_admin_password', {
      p_admin_id: adminData.id,
      p_password: password
    });

    console.log('📊 Verify result:', { verifyData, verifyError });

    if (verifyError || !verifyData) {
      console.log('❌ Password verification failed');
      return {
        success: false,
        admin: null,
        error: 'Invalid username/email or password',
      };
    }

    console.log('✅ Login successful!');
    return {
      success: true,
      admin: {
        id: adminData.id,
        username: adminData.username,
        email: adminData.email,
      },
      error: null,
    };
  } catch (error) {
    console.error('❌ Admin login exception:', error);
    console.error('❌ Exception details:', JSON.stringify(error, null, 2));
    return {
      success: false,
      admin: null,
      error: error.message || 'An error occurred during login',
    };
  }
};

/**
 * Get all admin credentials (for management)
 * @returns {Promise<{admins: array, error: string|null}>}
 */
export const getAdminCredentials = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('id, username, email, is_active, last_login, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { admins: data || [], error: null };
  } catch (error) {
    console.error('Get admin credentials error:', error);
    return { admins: [], error: error.message };
  }
};

/**
 * Create new admin credentials
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, adminId: string|null, error: string|null}>}
 */
export const createAdminCredentials = async (username, email, password) => {
  try {
    const { data, error } = await supabase.rpc('create_admin_credentials', {
      p_username: username,
      p_email: email,
      p_password: password,
    });

    if (error) throw error;

    return {
      success: true,
      adminId: data,
      error: null,
    };
  } catch (error) {
    console.error('Create admin credentials error:', error);
    return {
      success: false,
      adminId: null,
      error: error.message || 'Failed to create admin credentials',
    };
  }
};

/**
 * Update admin password
 * @param {string} adminId - Admin ID
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const updateAdminPassword = async (adminId, newPassword) => {
  try {
    const { data, error } = await supabase.rpc('update_admin_password', {
      p_admin_id: adminId,
      p_new_password: newPassword,
    });

    if (error) throw error;

    return {
      success: data === true,
      error: data === true ? null : 'Failed to update password',
    };
  } catch (error) {
    console.error('Update admin password error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update password',
    };
  }
};

/**
 * Update admin credentials (username, email, active status)
 * @param {string} adminId - Admin ID
 * @param {object} updates - Updates object
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const updateAdminCredentials = async (adminId, updates) => {
  try {
    const { error } = await supabase
      .from('admin_credentials')
      .update(updates)
      .eq('id', adminId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Update admin credentials error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update admin credentials',
    };
  }
};

/**
 * Delete admin credentials
 * @param {string} adminId - Admin ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteAdminCredentials = async (adminId) => {
  try {
    const { error } = await supabase
      .from('admin_credentials')
      .delete()
      .eq('id', adminId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete admin credentials error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete admin credentials',
    };
  }
};

/**
 * Toggle admin active status
 * @param {string} adminId - Admin ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const toggleAdminStatus = async (adminId, isActive) => {
  return updateAdminCredentials(adminId, { is_active: isActive });
};

