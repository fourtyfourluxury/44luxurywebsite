import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { finalizeApprovedOrder, logPaymentEvent } from '../_shared/finalizeOrder.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Called from the browser when Paystack redirects back to /order-confirmed
// with a `reference` query param. This is the primary confirmation path;
// paystack-webhook is the backup in case the customer closes the tab before
// the redirect completes. Both funnel through finalizeApprovedOrder, which
// only acts once per order (guarded by the payment_status check below).
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Paystack is not configured yet. Set PAYSTACK_SECRET_KEY in Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reference } = await req.json();
    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Missing reference' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // reference is the order UUID (see create-order — it's used instead of
    // order_number to avoid Paystack duplicate-reference collisions).
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', reference)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.payment_status === 'APPROVED') {
      return new Response(
        JSON.stringify({ success: true, order }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const verifyJson = await verifyRes.json();

    const gatewayStatus = verifyJson?.data?.status; // success | failed | abandoned | ongoing
    const paid = verifyRes.ok
      && gatewayStatus === 'success'
      && verifyJson?.data?.amount === Math.round(order.total * 100)
      && verifyJson?.data?.currency === 'NGN';

    if (!paid) {
      console.error('Paystack verification not successful:', gatewayStatus, JSON.stringify(verifyJson));
      // 'abandoned' means the customer left the Paystack page without paying —
      // record that as CANCELLED rather than a hard FAILED so the admin can
      // tell "gave up" apart from "card declined". 'ongoing' means still in
      // progress: leave it PENDING and let the webhook settle it.
      if (gatewayStatus !== 'ongoing') {
        const newStatus = gatewayStatus === 'abandoned' ? 'CANCELLED' : 'FAILED';
        const { error: updErr } = await supabaseClient
          .from('orders')
          .update({ payment_status: newStatus })
          .eq('id', order.id)
          .neq('payment_status', 'APPROVED');
        // 'CANCELLED' is only a valid status once migration 029 is applied; if
        // the constraint rejects it (pre-029), fall back to 'FAILED'.
        if (updErr && newStatus === 'CANCELLED') {
          await supabaseClient
            .from('orders')
            .update({ payment_status: 'FAILED' })
            .eq('id', order.id)
            .neq('payment_status', 'APPROVED');
        }
        await logPaymentEvent(supabaseClient, {
          order_id: order.id,
          order_number: order.order_number,
          event_type: 'VERIFY_FAILED',
          source: 'verify-payment',
          reference,
          detail: { gateway_status: gatewayStatus, message: verifyJson?.data?.gateway_response },
        });
      }
      return new Response(
        JSON.stringify({ success: false, status: gatewayStatus, error: 'Payment could not be verified' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await logPaymentEvent(supabaseClient, {
      order_id: order.id,
      order_number: order.order_number,
      event_type: 'PAYMENT_VERIFIED',
      source: 'verify-payment',
      reference,
      amount: verifyJson.data.amount,
    });

    await finalizeApprovedOrder(supabaseClient, order, verifyJson.data.reference, 'verify-payment');

    return new Response(
      JSON.stringify({ success: true, order: { ...order, payment_status: 'APPROVED' } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-payment function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
