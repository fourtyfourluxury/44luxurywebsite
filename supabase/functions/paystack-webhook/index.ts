import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { finalizeApprovedOrder, logPaymentEvent } from '../_shared/finalizeOrder.ts';

// Server-to-server callback from Paystack — not called from the browser, so
// it must be deployed with --no-verify-jwt (Paystack never sends a Supabase
// auth header). This is the reliability backstop for verify-payment: it
// fires even if the customer closes the tab before the redirect back to
// /order-confirmed completes.
function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY not set');
    return new Response('Not configured', { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PAYSTACK_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(rawBody));
  const expectedSignature = toHex(sigBuffer);

  if (!signature || signature !== expectedSignature) {
    return new Response('Invalid signature', { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // reference is the order UUID (see create-order).
      const reference = event.data.reference;
      const { data: order } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', reference)
        .single();

      await logPaymentEvent(supabaseClient, {
        order_id: order?.id ?? null,
        order_number: order?.order_number ?? null,
        event_type: 'WEBHOOK_RECEIVED',
        source: 'webhook',
        reference,
        amount: event.data.amount,
        detail: { event: event.event, status: event.data.status },
      });

      if (order && order.payment_status !== 'APPROVED') {
        // Amount must match what we recorded — guards against a spoofed or
        // mismatched amount even though the signature already checked out.
        const paid = event.data.status === 'success' && event.data.amount === Math.round(order.total * 100);
        if (paid) {
          await finalizeApprovedOrder(supabaseClient, order, event.data.reference, 'webhook');
        }
      }
    }
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
  }

  // Always ack receipt once the signature checks out, so Paystack doesn't retry.
  return new Response('ok', { status: 200 });
});
