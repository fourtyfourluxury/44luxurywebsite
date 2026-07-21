import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { finalizeApprovedOrder } from '../_shared/finalizeOrder.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FREE_SHIPPING_THRESHOLD = 150000;
const FLAT_SHIPPING_COST = 5000;

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
  delivery_method?: 'ship' | 'pickup';
  callback_url?: string;
  crypto_details?: unknown;
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
    const { customer, items, payment_method, user_id, delivery_method, callback_url } = orderRequest;

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

    // Validate all products exist, have sufficient stock, and re-price each
    // line server-side — never trust the price a client sends, only the
    // qty/size/color selection.
    const verifiedItems: OrderItem[] = [];
    for (const item of items) {
      const { data: product, error } = await supabaseClient
        .from('products')
        .select('id, name, stock, price')
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

      verifiedItems.push({ ...item, price: product.price });
    }

    // Calculate total (server-side verification)
    const subtotal = verifiedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping_cost = delivery_method === 'pickup'
      ? 0
      : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST);
    const total = subtotal + shipping_cost;

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

    const isPaystack = payment_method === 'paystack';

    // Create order. Paystack orders start PENDING and are only finalized
    // (stock decremented + confirmation email sent) once the payment is
    // actually verified — see verify-payment / paystack-webhook. Other
    // payment methods (crypto) keep the existing immediate-finalize behavior
    // since there's no automated verification wired up for them yet.
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
        payment_status: 'PENDING',
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
    const orderItems = verifiedItems.map(item => ({
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

    if (isPaystack) {
      const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
      if (!PAYSTACK_SECRET_KEY) {
        await supabaseClient.from('orders').delete().eq('id', order.id);
        return new Response(
          JSON.stringify({ error: 'Paystack is not configured yet. Set PAYSTACK_SECRET_KEY in Supabase secrets.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customer.email,
          amount: Math.round(total * 100), // Paystack expects kobo
          currency: 'NGN',
          reference: orderNumber,
          callback_url: callback_url || undefined,
          metadata: { order_id: order.id, order_number: orderNumber },
        }),
      });

      const initJson = await initRes.json();

      if (!initRes.ok || !initJson?.status) {
        console.error('Paystack initialize failed:', initRes.status, JSON.stringify(initJson));
        await supabaseClient.from('orders').delete().eq('id', order.id);
        return new Response(
          JSON.stringify({ error: initJson?.message || 'Failed to initialize payment' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          order_number: order.order_number,
          order_id: order.id,
          authorization_url: initJson.data.authorization_url,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Non-Paystack methods (crypto, etc.) — finalize immediately as before.
    await finalizeApprovedOrder(supabaseClient, order, `${payment_method}-${order.order_number}`);

    // Clear cart if user is logged in
    if (user_id) {
      await supabaseClient
        .from('cart_items')
        .delete()
        .eq('user_id', user_id);
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
