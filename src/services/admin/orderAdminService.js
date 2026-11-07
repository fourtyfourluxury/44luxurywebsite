import { supabase } from '../../lib/supabase';
import { sendOrderStatusEmail } from '../emailService';
import { PAID_PAYMENT_STATUS, VALID_FULFILLMENT_STATUSES, applyPaidOrderFilter } from './dashboardService';

const logSupabaseError = (error) => {
  if (error) {
    console.error(error.message, error.details, error.hint, error.code);
  }
};

const normalizeOrderItem = (item) => {
  if (!item) return item;
  const qty = item.qty ?? item.quantity ?? 1;
  return {
    ...item,
    qty,
    quantity: qty,
  };
};

const normalizeOrder = (order) => {
  if (!order) return order;
  const rawItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.order_items)
      ? order.order_items
      : [];
  const items = rawItems.map(normalizeOrderItem);
  return {
    ...order,
    customer_email: order.customer_email || order.email || order.user?.email || '',
    customer_phone: order.customer_phone || order.phone || order.user?.phone || '',
    items,
  };
};

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
          order_id,
          product_id,
          name,
          size,
          color,
          qty,
          price,
          image,
          product:products(id, name, images)
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { orders: (data || []).map(normalizeOrder), error: null };
  } catch (error) {
    logSupabaseError(error);
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
          order_id,
          product_id,
          name,
          size,
          color,
          qty,
          price,
          image,
          product:products(id, name, images, sku)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return { order: normalizeOrder(data), error: null };
  } catch (error) {
    logSupabaseError(error);
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
        email: data.customer_email || data.email,
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

    return { order: normalizeOrder(data), error: null };
  } catch (error) {
    logSupabaseError(error);
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

    return { order: normalizeOrder(data), error: null };
  } catch (error) {
    logSupabaseError(error);
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

    // Pending (unpaid) orders
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'PENDING');

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

    // Total revenue (paid orders only)
    const { data: revenueData, error: revErr } = await applyPaidOrderFilter(
      supabase.from('orders').select('total')
    );
    if (revErr) logSupabaseError(revErr);

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Today's revenue (paid orders only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayRevenueData, error: todayErr } = await applyPaidOrderFilter(
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', today.toISOString())
    );
    if (todayErr) logSupabaseError(todayErr);

    const todayRevenue = todayRevenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

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
    logSupabaseError(error);
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

    return { orders: (data || []).map(normalizeOrder), error: null };
  } catch (error) {
    logSupabaseError(error);
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
    order.customer_email || order.email || '',
    `₦${(order.total || 0).toLocaleString()}`,
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

// Get revenue by date range (paid orders only)
export const getRevenueByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await applyPaidOrderFilter(
      supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
    ).order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const revenueByDate = {};
    data?.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      revenueByDate[date] = (revenueByDate[date] || 0) + (order.total || 0);
    });

    return { revenueByDate, error: null };
  } catch (error) {
    logSupabaseError(error);
    return { revenueByDate: {}, error: error.message };
  }
};

// Get top selling products (items from paid orders only)
export const getTopSellingProducts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        name,
        image,
        qty,
        price,
        order:orders!inner(payment_status, status),
        product:products(id, name, images, price)
      `)
      .eq('order.payment_status', PAID_PAYMENT_STATUS)
      .in('order.status', VALID_FULFILLMENT_STATUSES);

    if (error) throw error;

    // Aggregate by product
    const productSales = {};
    data?.forEach(item => {
      const productObj = item.product || (item.name ? {
        id: item.product_id,
        name: item.name,
        images: item.image ? [item.image] : [],
        price: item.price,
      } : null);
      if (!productObj) return;
      const qty = item.qty ?? item.quantity ?? 0;
      const unitPrice = item.price ?? productObj.price ?? 0;
      const productId = item.product_id || item.name;
      if (!productSales[productId]) {
        productSales[productId] = {
          product: productObj,
          totalQuantity: 0,
          quantity: 0,
          totalRevenue: 0,
        };
      }
      productSales[productId].totalQuantity += qty;
      productSales[productId].quantity += qty;
      productSales[productId].totalRevenue += qty * unitPrice;
    });

    // Convert to array and sort
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return { products: topProducts, error: null };
  } catch (error) {
    logSupabaseError(error);
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
    logSupabaseError(error);
    return { success: false, error: error.message };
  }
};
