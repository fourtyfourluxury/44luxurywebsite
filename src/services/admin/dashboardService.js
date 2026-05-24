import { supabase } from '../../lib/supabase';

/**
 * Admin Dashboard Service
 * Handles dashboard analytics and statistics
 */

// Get dashboard overview stats
export const getDashboardStats = async () => {
  try {
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

    // This week's revenue
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const { data: weekRevenueData } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', weekAgo.toISOString())
      .in('status', ['ORDERED', 'DISPATCHED', 'DELIVERED']);

    const weekRevenue = weekRevenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

    // This month's revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: monthRevenueData } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', monthStart.toISOString())
      .in('status', ['ORDERED', 'DISPATCHED', 'DELIVERED']);

    const monthRevenue = monthRevenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ORDERED');

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
        },
        orders: {
          total: totalOrders || 0,
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
    console.error('Get dashboard stats error:', error);
    return { stats: null, error: error.message };
  }
};

// Get revenue trend (last N days)
export const getRevenueTrend = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total')
      .gte('created_at', startDate.toISOString())
      .in('status', ['ORDERED', 'DISPATCHED', 'DELIVERED'])
      .order('created_at', { ascending: true });

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
      if (revenueByDate.hasOwnProperty(dateKey)) {
        revenueByDate[dateKey] += order.total;
      }
    });

    const trend = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return { trend, error: null };
  } catch (error) {
    console.error('Get revenue trend error:', error);
    return { trend: [], error: error.message };
  }
};

// Get top selling products
export const getTopSellingProducts = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
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
      productSales[productId].totalRevenue += item.price * item.quantity;
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

// Get sales by category
export const getSalesByCategory = async () => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        product:products(category)
      `);

    if (error) throw error;

    // Aggregate by category
    const categorySales = {};
    data?.forEach(item => {
      if (!item.product) return;
      
      const category = item.product.category;
      if (!categorySales[category]) {
        categorySales[category] = {
          category,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      categorySales[category].totalQuantity += item.quantity;
      categorySales[category].totalRevenue += item.price * item.quantity;
    });

    const sales = Object.values(categorySales);

    return { sales, error: null };
  } catch (error) {
    console.error('Get sales by category error:', error);
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
