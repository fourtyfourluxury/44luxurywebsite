import { supabase } from '../../lib/supabase';

/**
 * Admin Dashboard Service
 * Handles dashboard analytics and statistics
 */

// ── Single Source of Truth for Paid / Confirmed Revenue ─────────────────────
// Payment finalization (supabase/functions/_shared/finalizeOrder.ts +
// claim_order_for_finalize in 029_payment_hardening.sql) sets:
//   payment_status = 'APPROVED'
// Unpaid/failed/cancelled/refunded orders have payment_status in
// ('PENDING', 'FAILED', 'CANCELLED', 'REFUNDED') and must NEVER count as revenue.
export const PAID_PAYMENT_STATUS = 'APPROVED';
export const VALID_FULFILLMENT_STATUSES = ['ORDERED', 'DISPATCHED', 'DELIVERED'];

export const isOrderPaid = (order) =>
  Boolean(order) &&
  order.payment_status === PAID_PAYMENT_STATUS &&
  order.status !== 'CANCELLED';

export const applyPaidOrderFilter = (query) =>
  query
    .eq('payment_status', PAID_PAYMENT_STATUS)
    .in('status', VALID_FULFILLMENT_STATUSES);

const logSupabaseError = (error) => {
  if (error) {
    console.error(error.message, error.details, error.hint, error.code);
  }
};

// Get dashboard overview stats
export const getDashboardStats = async () => {
  try {
    // Total revenue (paid orders only)
    const { data: revenueData, error: revErr } = await applyPaidOrderFilter(
      supabase.from('orders').select('total')
    );
    if (revErr) logSupabaseError(revErr);

    const paidOrdersCount = revenueData?.length || 0;
    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const avgOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

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

    // This week's revenue (paid orders only)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const { data: weekRevenueData, error: weekErr } = await applyPaidOrderFilter(
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', weekAgo.toISOString())
    );
    if (weekErr) logSupabaseError(weekErr);

    const weekRevenue = weekRevenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // This month's revenue (paid orders only)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: monthRevenueData, error: monthErr } = await applyPaidOrderFilter(
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', monthStart.toISOString())
    );
    if (monthErr) logSupabaseError(monthErr);

    const monthRevenue = monthRevenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Total orders
    const { count: totalOrders, error: totalOrdErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    if (totalOrdErr) logSupabaseError(totalOrdErr);

    // Pending (unpaid) orders
    const { count: pendingOrders, error: pendOrdErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'PENDING');
    if (pendOrdErr) logSupabaseError(pendOrdErr);

    // Total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Active products
    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    // Low stock products
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock', 10)
      .eq('status', 'ACTIVE');

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    return {
      stats: {
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          week: weekRevenue,
          month: monthRevenue,
          averageOrderValue: avgOrderValue,
        },
        orders: {
          total: totalOrders || 0,
          paid: paidOrdersCount,
          pending: pendingOrders || 0,
        },
        products: {
          total: totalProducts || 0,
          active: activeProducts || 0,
          lowStock: lowStockProducts || 0,
        },
        customers: {
          total: totalCustomers || 0,
        },
      },
      error: null,
    };
  } catch (error) {
    logSupabaseError(error);
    return { stats: null, error: error.message };
  }
};

// Get revenue trend (last N days) — paid orders only
export const getRevenueTrend = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await applyPaidOrderFilter(
      supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', startDate.toISOString())
    ).order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const revenueByDate = {};
    
    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDate[dateKey] = 0;
    }

    // Fill in actual revenue
    data?.forEach(order => {
      const date = new Date(order.created_at);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (Object.prototype.hasOwnProperty.call(revenueByDate, dateKey)) {
        revenueByDate[dateKey] += order.total || 0;
      }
    });

    const trend = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return { trend, error: null };
  } catch (error) {
    logSupabaseError(error);
    return { trend: [], error: error.message };
  }
};

// Get top selling products (items from paid orders only)
export const getTopSellingProducts = async (limit = 5) => {
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
      productSales[productId].totalRevenue += (item.price || 0) * qty;
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

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
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

// Get recent customers
export const getRecentCustomers = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { customers: data, error: null };
  } catch (error) {
    console.error('Get recent customers error:', error);
    return { customers: [], error: error.message };
  }
};

// Get order status distribution
export const getOrderStatusDistribution = async () => {
  try {
    const statuses = ['ORDERED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
    const distribution = {};

    for (const status of statuses) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      distribution[status] = count || 0;
    }

    return { distribution, error: null };
  } catch (error) {
    console.error('Get order status distribution error:', error);
    return { distribution: {}, error: error.message };
  }
};

// Get sales by category (items from paid orders only)
export const getSalesByCategory = async () => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        qty,
        price,
        order:orders!inner(payment_status, status),
        product:products(category)
      `)
      .eq('order.payment_status', PAID_PAYMENT_STATUS)
      .in('order.status', VALID_FULFILLMENT_STATUSES);

    if (error) throw error;

    // Aggregate by category
    const categorySales = {};
    data?.forEach(item => {
      if (!item.product) return;
      const qty = item.qty ?? item.quantity ?? 0;
      const category = item.product.category;
      if (!categorySales[category]) {
        categorySales[category] = {
          category,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      categorySales[category].totalQuantity += qty;
      categorySales[category].totalRevenue += (item.price || 0) * qty;
    });

    const sales = Object.values(categorySales);

    return { sales, error: null };
  } catch (error) {
    logSupabaseError(error);
    return { sales: [], error: error.message };
  }
};

// Get low stock alerts
export const getLowStockAlerts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', 10)
      .eq('status', 'ACTIVE')
      .order('stock', { ascending: true });

    if (error) throw error;

    return { products: data, error: null };
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    return { products: [], error: error.message };
  }
};

// Get activity feed
export const getActivityFeed = async (limit = 10) => {
  try {
    // Get recent orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, created_at, status')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Format as activity items
    const activities = orders?.map(order => ({
      id: order.id,
      type: 'order',
      message: `New order #${order.order_number} from ${order.customer_name}`,
      timestamp: order.created_at,
      status: order.status,
    })) || [];

    return { activities, error: null };
  } catch (error) {
    console.error('Get activity feed error:', error);
    return { activities: [], error: error.message };
  }
};

// Calculate growth percentage
export const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
