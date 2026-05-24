import { supabase } from '../../lib/supabase';
import { sendOrderStatusEmail } from '../emailService';

/**
 * Admin Order Service
 * Handles order management operations for admin
 */

// Get all orders (admin view)
export const getAllOrders = async (filters = {}) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        user:profiles(id, full_name, email),
        items:order_items(
          id,
          quantity,
          price,
          product:products(id, name, images)
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { orders: data, error: null };
  } catch (error) {
    console.error('Get all orders error:', error);
    return { orders: [], error: error.message };
  }
};

// Get single order details
export const getOrderDetails = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:profiles(id, full_name, email, phone),
        items:order_items(
          id,
          quantity,
          price,
          size,
          color,
          product:products(id, name, images, sku)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return { order: data, error: null };
  } catch (error) {
    console.error('Get order details error:', error);
    return { order: null, error: error.message };
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, notes = null) => {
  try {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updates.admin_notes = notes;
    }

    // Update specific status timestamps
    if (status === 'DISPATCHED') {
      updates.dispatched_at = new Date().toISOString();
    } else if (status === 'DELIVERED') {
      updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Send order status update email (don't fail operation if email fails)
    try {
      await sendOrderStatusEmail({
        email: data.customer_email,
        orderNumber: data.order_number,
        customerName: data.customer_name,
        status: data.status,
        trackingNumber: data.tracking_number,
        orderDate: data.created_at,
      });
    } catch (emailError) {
      console.error('Failed to send order status email:', emailError);
      // Continue with operation even if email fails
    }

    return { order: data, error: null };
  } catch (error) {
    console.error('Update order status error:', error);
    return { order: null, error: error.message };
  }
};

// Update tracking information
export const updateTrackingInfo = async (orderId, trackingNumber, carrier) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        carrier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { order: data, error: null };
  } catch (error) {
    console.error('Update tracking info error:', error);
    return { order: null, error: error.message };
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    // Total orders
    const { count: totalCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Pending orders (ORDERED status)
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ORDERED');

    // Dispatched orders
    const { count: dispatchedCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'DISPATCHED');

    // Delivered orders
    const { count: deliveredCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'DELIVERED');

    // Total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['ORDERED', 'DISPATCHED', 'DELIVERED']);

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayRevenueData } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', today.toISOString())
      .in('status', ['ORDERED', 'DISPATCHED', 'DELIVERED']);

    const todayRevenue = todayRevenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

    return {
      stats: {
        total: totalCount || 0,
        pending: pendingCount || 0,
        dispatched: dispatchedCount || 0,
        delivered: deliveredCount || 0,
        totalRevenue,
        todayRevenue,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get order stats error:', error);
    return { stats: null, error: error.message };
  }
};

// Get recent orders
export const getRecentOrders = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { orders: data, error: null };
  } catch (error) {
    console.error('Get recent orders error:', error);
    return { orders: [], error: error.message };
  }
};

// Export orders to CSV
export const exportOrdersToCSV = (orders) => {
  const headers = [
    'Order Number',
    'Date',
    'Customer',
    'Email',
    'Total',
    'Status',
    'Payment Method',
    'Tracking Number',
  ];

  const rows = orders.map(order => [
    order.order_number,
    new Date(order.created_at).toLocaleDateString(),
    order.customer_name,
    order.customer_email,
    `₦${order.total.toLocaleString()}`,
    order.status,
    order.payment_method || 'N/A',
    order.tracking_number || 'N/A',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Get revenue by date range
export const getRevenueByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('status', ['ORDERED', 'DISPATCHED', 'DELIVERED'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const revenueByDate = {};
    data?.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      revenueByDate[date] = (revenueByDate[date] || 0) + order.total;
    });

    return { revenueByDate, error: null };
  } catch (error) {
    console.error('Get revenue by date range error:', error);
    return { revenueByDate: {}, error: error.message };
  }
};

// Get top selling products
export const getTopSellingProducts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        product:products(id, name, images, price)
      `);

    if (error) throw error;

    // Aggregate by product
    const productSales = {};
    data?.forEach(item => {
      if (!item.product) return;
      
      const productId = item.product_id;
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      productSales[productId].totalQuantity += item.quantity;
      productSales[productId].totalRevenue += item.quantity * item.product.price;
    });

    // Convert to array and sort
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return { products: topProducts, error: null };
  } catch (error) {
    console.error('Get top selling products error:', error);
    return { products: [], error: error.message };
  }
};

// Bulk update order status
export const bulkUpdateOrderStatus = async (orderIds, status) => {
  try {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'DISPATCHED') {
      updates.dispatched_at = new Date().toISOString();
    } else if (status === 'DELIVERED') {
      updates.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .in('id', orderIds);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Bulk update order status error:', error);
    return { success: false, error: error.message };
  }
};
