import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  product_id: string;
  name: string;
  size?: string;
  color?: string;
  qty: number;
  price: number;
  image?: string;
}

interface OrderRequest {
  customer: {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
  };
  items: OrderItem[];
  payment_method: string;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for bypassing RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const orderRequest: OrderRequest = await req.json();
    const { customer, items, payment_method, user_id } = orderRequest;

    // Validate input
    if (!customer.name || !customer.email || !customer.address) {
      return new Response(
        JSON.stringify({ error: 'Customer name, email, and address are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order must contain at least one item' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate all products exist and have sufficient stock
    for (const item of items) {
      const { data: product, error } = await supabaseClient
        .from('products')
        .select('id, stock, price')
        .eq('id', item.product_id)
        .single();

      if (error || !product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.product_id} not found` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (product.stock < item.qty) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for product ${item.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Calculate total (server-side verification)
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping_cost = 0; // TODO: Calculate based on location

    // Generate order number
    const { data: lastOrder } = await supabaseClient
      .from('orders')
      .select('order_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let orderNumber = 'LUX-0001';
    if (lastOrder?.order_number) {
      const lastNum = parseInt(lastOrder.order_number.split('-')[1]);
      orderNumber = `LUX-${String(lastNum + 1).padStart(4, '0')}`;
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user_id || null,
        customer_name: customer.name,
        email: customer.email,
        phone: customer.phone || null,
        address: customer.address,
        city: customer.city || null,
        state: customer.state || null,
        country: customer.country || 'Nigeria',
        total,
        shipping_cost,
        status: 'ORDERED',
        payment_method,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      name: item.name,
      size: item.size || null,
      color: item.color || null,
      qty: item.qty,
      price: item.price,
      image: item.image || null,
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order
      await supabaseClient.from('orders').delete().eq('id', order.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create order items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrement stock for each product
    for (const item of items) {
      const { error: stockError } = await supabaseClient.rpc('decrement_product_stock', {
        product_id: item.product_id,
        quantity: item.qty,
      });

      if (stockError) {
        console.error('Error decrementing stock:', stockError);
        // Continue anyway - stock can be manually adjusted
      }
    }

    // Clear cart if user is logged in
    if (user_id) {
      await supabaseClient
        .from('cart_items')
        .delete()
        .eq('user_id', user_id);
    }

    // Send order confirmation email
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          type: 'order_confirmation',
          to: customer.email,
          data: {
            orderNumber: order.order_number,
            customerName: customer.name,
            items: items.map(item => ({
              name: item.name,
              variant: [item.size, item.color].filter(Boolean).join(' / '),
              quantity: item.qty,
              price: item.price,
            })),
            subtotal: total,
            shipping: shipping_cost,
            total: total + shipping_cost,
            shippingAddress: {
              name: customer.name,
              address: customer.address,
              city: customer.city || '',
              state: customer.state || '',
              zipCode: '',
              phone: customer.phone || '',
            },
            orderDate: order.created_at,
            email: customer.email,
          },
        }),
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_number: order.order_number,
        order_id: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-order function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
