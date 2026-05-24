import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';
import { clearCart } from './cartService';

/**
 * Checkout Service
 * Handles order creation and payment processing
 */

// Create order from cart
export const createOrder = async (orderData) => {
  try {
    const user = await getCurrentUser();
    
    const {
      customerInfo,
      cartItems,
      paymentMethod,
      shippingCost = 0,
    } = orderData;

    // Calculate total
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.qty);
    }, 0);
    const total = subtotal + shippingCost;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        country: customerInfo.country || 'Nigeria',
        total,
        shipping_cost: shippingCost,
        payment_method: paymentMethod,
        payment_status: 'PENDING',
        status: 'ORDERED',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      name: item.product.name,
      size: item.size,
      color: item.color,
      qty: item.qty,
      price: item.product.price,
      image: item.product.images?.[0],
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Decrement product stock
    for (const item of cartItems) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: item.product.id,
        quantity: item.qty,
      });

      if (stockError) {
        console.error('Stock decrement error:', stockError);
        // Don't fail the order if stock update fails
      }
    }

    // Clear cart if user is authenticated
    if (user) {
      await clearCart();
    }

    return { order, error: null };
  } catch (error) {
    console.error('Create order error:', error);
    return { order: null, error: error.message };
  }
};

// Initialize payment (placeholder for payment gateway integration)
export const initializePayment = async (order, paymentMethod) => {
  try {
    // This will be implemented when we add payment gateways
    // For now, return a mock response
    
    switch (paymentMethod) {
      case 'paystack':
        // TODO: Initialize Paystack payment
        return {
          success: true,
          paymentUrl: null,
          reference: `PAY-${Date.now()}`,
          error: null,
        };

      case 'paypal':
        // TODO: Initialize PayPal payment
        return {
          success: true,
          paymentUrl: null,
          reference: `PP-${Date.now()}`,
          error: null,
        };

      case 'crypto':
        // TODO: Initialize NOWPayments
        return {
          success: true,
          paymentUrl: null,
          reference: `CRYPTO-${Date.now()}`,
          error: null,
        };

      default:
        return {
          success: false,
          error: 'Invalid payment method',
        };
    }
  } catch (error) {
    console.error('Initialize payment error:', error);
    return { success: false, error: error.message };
  }
};

// Verify payment (placeholder for payment gateway integration)
export const verifyPayment = async (reference, paymentMethod) => {
  try {
    // This will be implemented when we add payment gateways
    // For now, return a mock response
    
    return {
      success: true,
      status: 'APPROVED',
      error: null,
    };
  } catch (error) {
    console.error('Verify payment error:', error);
    return { success: false, error: error.message };
  }
};

// Update order payment status
export const updateOrderPaymentStatus = async (orderId, status, reference = null) => {
  try {
    const updates = {
      payment_status: status,
    };

    if (reference) {
      updates.payment_reference = reference;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { order: data, error: null };
  } catch (error) {
    console.error('Update order payment status error:', error);
    return { order: null, error: error.message };
  }
};

// Calculate shipping cost
export const calculateShipping = (subtotal, country = 'Nigeria') => {
  // Free shipping over ₦50,000
  if (subtotal >= 5000000) {
    return 0;
  }

  // Flat rate for Nigeria
  if (country === 'Nigeria') {
    return 200000; // ₦2,000
  }

  // International shipping
  return 500000; // ₦5,000
};

// Validate checkout data
export const validateCheckoutData = (customerInfo, cartItems) => {
  const errors = {};

  // Validate customer info
  if (!customerInfo.name || customerInfo.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!customerInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
    errors.email = 'Valid email is required';
  }

  if (!customerInfo.phone || customerInfo.phone.trim() === '') {
    errors.phone = 'Phone number is required';
  }

  if (!customerInfo.address || customerInfo.address.trim() === '') {
    errors.address = 'Address is required';
  }

  if (!customerInfo.city || customerInfo.city.trim() === '') {
    errors.city = 'City is required';
  }

  if (!customerInfo.state || customerInfo.state.trim() === '') {
    errors.state = 'State is required';
  }

  // Validate cart
  if (!cartItems || cartItems.length === 0) {
    errors.cart = 'Cart is empty';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
