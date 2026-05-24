import { supabase } from '../../lib/supabase';

/**
 * Customer Admin Service
 * Handles admin customer management operations
 */

/**
 * Get all customers with order statistics
 * @param {Object} filters - Filter options
 * @param {string} filters.search - Search by name or email
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getAllCustomers(filters = {}) {
  try {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        orders:orders(count),
        complaints:complaints(count)
      `)
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    // Apply search filter
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to include counts
    const customers = data.map(customer => ({
      ...customer,
      order_count: customer.orders[0]?.count || 0,
      complaint_count: customer.complaints[0]?.count || 0,
    }));

    return { data: customers, error: null };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get customer by ID with detailed information
 * @param {string} customerId - Customer ID
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getCustomerById(customerId) {
  try {
    // Get customer profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (profileError) throw profileError;

    // Get customer orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Get customer complaints
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (complaintsError) throw complaintsError;

    // Get customer addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', customerId);

    if (addressesError) throw addressesError;

    // Calculate statistics
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

    const customer = {
      ...profile,
      orders,
      complaints,
      addresses,
      stats: {
        totalOrders: orders.length,
        totalSpent,
        avgOrderValue,
        totalComplaints: complaints.length,
        unresolvedComplaints: complaints.filter(c => c.status !== 'RESOLVED').length,
      },
    };

    return { data: customer, error: null };
  } catch (error) {
    console.error('Error fetching customer:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get customer statistics
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getCustomerStats() {
  try {
    // Get total customers
    const { data: customers, error: customersError } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('role', 'customer');

    if (customersError) throw customersError;

    // Get customers with orders
    const { data: customersWithOrders, error: ordersError } = await supabase
      .from('orders')
      .select('user_id')
      .not('user_id', 'is', null);

    if (ordersError) throw ordersError;

    const uniqueCustomersWithOrders = new Set(customersWithOrders.map(o => o.user_id));

    // Calculate new customers this month
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = customers.filter(c => new Date(c.created_at) >= monthAgo).length;

    const stats = {
      total: customers.length,
      withOrders: uniqueCustomersWithOrders.size,
      withoutOrders: customers.length - uniqueCustomersWithOrders.size,
      newThisMonth,
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get top customers by spending
 * @param {number} limit - Number of customers to fetch
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getTopCustomers(limit = 10) {
  try {
    // Get all orders with user info
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        user_id,
        total,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .not('user_id', 'is', null);

    if (error) throw error;

    // Group by customer and calculate totals
    const customerTotals = {};
    orders.forEach(order => {
      if (order.user_id && order.profiles) {
        if (!customerTotals[order.user_id]) {
          customerTotals[order.user_id] = {
            id: order.user_id,
            name: order.profiles.full_name,
            email: order.profiles.email,
            totalSpent: 0,
            orderCount: 0,
          };
        }
        customerTotals[order.user_id].totalSpent += order.total;
        customerTotals[order.user_id].orderCount += 1;
      }
    });

    // Convert to array and sort
    const topCustomers = Object.values(customerTotals)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    return { data: topCustomers, error: null };
  } catch (error) {
    console.error('Error fetching top customers:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get recent customers
 * @param {number} limit - Number of customers to fetch
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getRecentCustomers(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching recent customers:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Export customers to CSV format
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: string, error: string|null}>}
 */
export async function exportCustomersCSV(filters = {}) {
  try {
    const { data: customers, error } = await getAllCustomers(filters);

    if (error) throw error;

    // Generate CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Orders', 'Complaints', 'Joined'];
    const rows = customers.map(c => [
      c.id,
      c.full_name || 'N/A',
      c.email,
      c.phone || 'N/A',
      c.order_count,
      c.complaint_count,
      new Date(c.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return { data: csv, error: null };
  } catch (error) {
    console.error('Error exporting customers:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Search customers
 * @param {string} query - Search query
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function searchCustomers(query) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('role', 'customer')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error searching customers:', error);
    return { data: null, error: error.message };
  }
}
