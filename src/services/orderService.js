import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';

/**
 * Order Service
 * Handles order-related operations
 */

const logSupabaseError = (error) => {
  if (!error) return;
  console.error(error.message, error.details, error.hint, error.code);
};

const normalizeCustomerOrder = (order) => {
  if (!order) return order;
  const orderItems = Array.isArray(order.order_items)
    ? order.order_items.map((item) => {
        const qty = item.qty ?? item.quantity ?? 1;
        return {
          ...item,
          qty,
          quantity: qty,
        };
      })
    : [];
  return {
    ...order,
    order_items: orderItems,
    items: orderItems,
  };
};

// Get user's orders
export const getMyOrders = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { orders: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { orders: (data || []).map(normalizeCustomerOrder), error: null };
  } catch (error) {
    logSupabaseError(error);
    return { orders: [], error: error.message };
  }
};

// Get single order by ID
export const getOrderById = async (orderId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { order: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return { order: normalizeCustomerOrder(data), error: null };
  } catch (error) {
    logSupabaseError(error);
    return { order: null, error: error.message };
  }
};

// Get order by order number
export const getOrderByNumber = async (orderNumber) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { order: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('order_number', orderNumber)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return { order: normalizeCustomerOrder(data), error: null };
  } catch (error) {
    logSupabaseError(error);
    return { order: null, error: error.message };
  }
};

// Format order status for display
export const formatOrderStatus = (status) => {
  const statusMap = {
    ORDERED: { label: 'Ordered', color: 'blue' },
    DISPATCHED: { label: 'Dispatched', color: 'yellow' },
    DELIVERED: { label: 'Delivered', color: 'green' },
    CANCELLED: { label: 'Cancelled', color: 'red' },
  };

  return statusMap[status] || { label: status, color: 'gray' };
};

// Format payment status for display
export const formatPaymentStatus = (status) => {
  const statusMap = {
    PENDING: { label: 'Pending', color: 'yellow' },
    APPROVED: { label: 'Approved', color: 'green' },
    FAILED: { label: 'Failed', color: 'red' },
    REFUNDED: { label: 'Refunded', color: 'gray' },
  };

  return statusMap[status] || { label: status, color: 'gray' };
};

// Calculate order summary
export const calculateOrderSummary = (orderItems) => {
  const subtotal = orderItems.reduce((total, item) => {
    return total + item.price * item.qty;
  }, 0);

  return {
    subtotal,
    itemCount: orderItems.reduce((count, item) => count + item.qty, 0),
  };
};
