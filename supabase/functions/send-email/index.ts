// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: string
  to: string
  data: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { type, to, data }: EmailRequest = await req.json()

    // Validate required fields
    if (!type || !to) {
      throw new Error('Missing required fields: type and to')
    }

    // Generate email content based on type
    const emailContent = generateEmailContent(type, data)

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: '44LUXURY <noreply@44luxury.org>',
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/**
 * Generate email content based on type
 */
function generateEmailContent(type: string, data: any): { subject: string; html: string } {
  switch (type) {
    case 'order_confirmation':
      return generateOrderConfirmationEmail(data)
    case 'order_status':
      return generateOrderStatusEmail(data)
    case 'complaint_response':
      return generateComplaintResponseEmail(data)
    case 'welcome':
      return generateWelcomeEmail(data)
    case 'newsletter':
      return generateNewsletterEmail(data)
    case 'password_reset':
      return generatePasswordResetEmail(data)
    case 'contact_notification':
      return generateContactNotificationEmail(data)
    case 'test':
      return generateTestEmail(data)
    default:
      throw new Error(`Unknown email type: ${type}`)
  }
}

/**
 * Order Confirmation Email
 */
function generateOrderConfirmationEmail(data: any) {
  const itemsHtml = data.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name} ${item.variant ? `(${item.variant})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₦${item.price.toLocaleString()}
      </td>
    </tr>
  `
    )
    .join('')

  return {
    subject: `Order Confirmation - #${data.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    <h2 style="color: #1c1c18; margin-top: 0;">Thank You for Your Order!</h2>
    
    <p>Hi ${data.customerName},</p>
    
    <p>We've received your order and it's being processed. You'll receive another email when your order has been shipped.</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #1c1c18;">
      <h3 style="margin-top: 0;">Order #${data.orderNumber}</h3>
      <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
    </div>
    
    <h3>Order Items</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <div style="text-align: right; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₦${data.subtotal.toLocaleString()}</p>
      <p style="margin: 5px 0;"><strong>Shipping:</strong> ₦${data.shipping.toLocaleString()}</p>
      <p style="margin: 10px 0; font-size: 18px;"><strong>Total:</strong> ₦${data.total.toLocaleString()}</p>
    </div>
    
    <h3>Shipping Address</h3>
    <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0;">
      <p style="margin: 5px 0;">${data.shippingAddress.name}</p>
      <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
      <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
      <p style="margin: 5px 0;">${data.shippingAddress.phone}</p>
    </div>
    
    <p style="margin-top: 30px;">If you have any questions about your order, please contact us at <a href="mailto:support@44luxury.com" style="color: #1c1c18;">support@44luxury.com</a></p>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
    <p>This email was sent to ${data.email}</p>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Order Status Update Email
 */
function generateOrderStatusEmail(data: any) {
  return {
    subject: `Order Status Update - #${data.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    <h2 style="color: #1c1c18; margin-top: 0;">Order Status Update</h2>
    
    <p>Hi ${data.customerName},</p>
    
    <p>Your order status has been updated.</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #1c1c18;">
      <h3 style="margin-top: 0;">Order #${data.orderNumber}</h3>
      <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #1a4a2e; font-weight: bold;">${data.status}</span></p>
      <p style="margin: 5px 0;">${data.statusMessage}</p>
      ${data.trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
    </div>
    
    <p>You can view your order details by logging into your account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://44luxury.com/account" style="background-color: #1c1c18; color: #fcf9f3; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px;">View Order</a>
    </div>
    
    <p>If you have any questions, please contact us at <a href="mailto:support@44luxury.com" style="color: #1c1c18;">support@44luxury.com</a></p>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Complaint Response Email
 */
function generateComplaintResponseEmail(data: any) {
  return {
    subject: `Response to Your Complaint - #${data.complaintId}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complaint Response</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    <h2 style="color: #1c1c18; margin-top: 0;">Response to Your Complaint</h2>
    
    <p>Hi ${data.customerName},</p>
    
    <p>Thank you for bringing this to our attention. We've reviewed your complaint and have a response for you.</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #1c1c18;">
      <h3 style="margin-top: 0;">Complaint #${data.complaintId}</h3>
      <p style="margin: 5px 0;"><strong>Subject:</strong> ${data.subject}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> ${data.status}</p>
      <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(data.submittedDate).toLocaleDateString()}</p>
    </div>
    
    <h3>Our Response:</h3>
    <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <p style="white-space: pre-wrap;">${data.response}</p>
    </div>
    
    <p>If you have any further questions or concerns, please don't hesitate to reach out to us.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://44luxury.com/account" style="background-color: #1c1c18; color: #fcf9f3; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px;">View Complaint</a>
    </div>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Welcome Email
 */
function generateWelcomeEmail(data: any) {
  return {
    subject: 'Welcome to 44LUXURY',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to 44LUXURY</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    <h2 style="color: #1c1c18; margin-top: 0;">Welcome to 44LUXURY!</h2>
    
    <p>Hi ${data.name},</p>
    
    <p>Thank you for joining 44LUXURY! We're excited to have you as part of our community.</p>
    
    <p>At 44LUXURY, we offer premium luxury fashion and accessories. Explore our collections and discover pieces that define your style.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://44luxury.com/shop" style="background-color: #1c1c18; color: #fcf9f3; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px; margin: 10px;">Shop Now</a>
      <a href="https://44luxury.com/collections" style="background-color: #fff; color: #1c1c18; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px; border: 2px solid #1c1c18; margin: 10px;">View Collections</a>
    </div>
    
    <p>If you have any questions, our support team is here to help at <a href="mailto:support@44luxury.com" style="color: #1c1c18;">support@44luxury.com</a></p>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
    <p>This email was sent to ${data.email}</p>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Newsletter Email
 */
function generateNewsletterEmail(data: any) {
  return {
    subject: data.subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    ${data.content}
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
    <p><a href="https://44luxury.com/unsubscribe?token=${data.unsubscribeToken}" style="color: #666;">Unsubscribe</a></p>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Password Reset Email
 */
function generatePasswordResetEmail(data: any) {
  return {
    subject: 'Reset Your Password - 44LUXURY',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    <h2 style="color: #1c1c18; margin-top: 0;">Reset Your Password</h2>
    
    <p>Hi ${data.name},</p>
    
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetLink}" style="background-color: #1c1c18; color: #fcf9f3; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px;">Reset Password</a>
    </div>
    
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
    
    <p style="font-size: 12px; color: #666; margin-top: 30px;">This link will expire in 1 hour for security reasons.</p>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Contact Notification Email (to admin)
 */
function generateContactNotificationEmail(data: any) {
  return {
    subject: `New Contact Form Submission - ${data.subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    <h2 style="color: #1c1c18; margin-top: 0;">New Contact Form Submission</h2>
    
    <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> ${data.subject}</p>
      <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
    </div>
    
    <h3>Message:</h3>
    <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <p style="white-space: pre-wrap;">${data.message}</p>
    </div>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Test Email
 */
function generateTestEmail(data: any) {
  return {
    subject: 'Test Email - 44LUXURY',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1c1c18; padding: 30px; text-align: center;">
    <h1 style="color: #fcf9f3; margin: 0; font-size: 32px; letter-spacing: 2px;">44LUXURY</h1>
  </div>
  
  <div style="padding: 30px; background-color: #fff;">
    <h2 style="color: #1c1c18; margin-top: 0;">Test Email</h2>
    <p>${data.message}</p>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© 2024 44LUXURY. All rights reserved.</p>
  </div>
</body>
</html>
    `,
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"type":"test","to":"test@example.com","data":{"message":"Test message"}}'

*/
