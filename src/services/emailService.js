/**
 * Email Service
 * Handles email sending via Resend API through Supabase Edge Functions
 */

import { supabase } from '../lib/supabase';

/**
 * Send order confirmation email
 * @param {Object} orderData - Order data
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendOrderConfirmationEmail(orderData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'order_confirmation',
        to: orderData.email,
        data: {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          items: orderData.items,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          orderDate: orderData.orderDate,
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order status update email
 * @param {Object} orderData - Order data
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendOrderStatusEmail(orderData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'order_status',
        to: orderData.email,
        data: {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          status: orderData.status,
          statusMessage: getStatusMessage(orderData.status),
          trackingNumber: orderData.trackingNumber,
          orderDate: orderData.orderDate,
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending order status email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send complaint response email
 * @param {Object} complaintData - Complaint data
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendComplaintResponseEmail(complaintData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'complaint_response',
        to: complaintData.email,
        data: {
          customerName: complaintData.customerName,
          complaintId: complaintData.complaintId,
          subject: complaintData.subject,
          response: complaintData.response,
          status: complaintData.status,
          submittedDate: complaintData.submittedDate,
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending complaint response email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email
 * @param {Object} userData - User data
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendWelcomeEmail(userData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'welcome',
        to: userData.email,
        data: {
          name: userData.name,
          email: userData.email,
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send newsletter email
 * @param {Object} newsletterData - Newsletter data
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendNewsletterEmail(newsletterData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'newsletter',
        to: newsletterData.email,
        data: {
          subject: newsletterData.subject,
          content: newsletterData.content,
          unsubscribeToken: newsletterData.unsubscribeToken,
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 * @param {Object} userData - User data
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendPasswordResetEmail(userData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'password_reset',
        to: userData.email,
        data: {
          name: userData.name,
          resetLink: userData.resetLink,
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send contact form submission notification to admin
 * @param {Object} contactData - Contact form data
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendContactNotificationEmail(contactData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'contact_notification',
        to: 'admin@44luxury.org', // Admin email
        data: {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          subject: contactData.subject,
          message: contactData.message,
          submittedAt: contactData.submittedAt,
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get status message for order status
 * @param {string} status - Order status
 * @returns {string} Status message
 */
function getStatusMessage(status) {
  const messages = {
    ORDERED: 'Your order has been received and is being processed.',
    DISPATCHED: 'Your order has been dispatched and is on its way to you.',
    DELIVERED: 'Your order has been delivered. Thank you for shopping with us!',
    CANCELLED: 'Your order has been cancelled.',
  };

  return messages[status] || 'Your order status has been updated.';
}

/**
 * Test email configuration
 * @param {string} email - Test email address
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function testEmailConfiguration(email) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'test',
        to: email,
        data: {
          message: 'This is a test email from 44LUXURY. If you received this, your email configuration is working correctly!',
        },
      },
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendComplaintResponseEmail,
  sendWelcomeEmail,
  sendNewsletterEmail,
  sendPasswordResetEmail,
  sendContactNotificationEmail,
  testEmailConfiguration,
};
