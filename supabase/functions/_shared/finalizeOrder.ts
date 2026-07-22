// Shared payment finalize + audit helpers used by create-order, verify-payment,
// and paystack-webhook.
//
// Designed to work whether or not migration 029 has been applied yet:
//  - if the atomic RPCs / payment_events table exist, they are used;
//  - if not, it transparently falls back to the pre-029 behaviour so
//    checkout never breaks on a not-yet-migrated database.

// deno-lint-ignore no-explicit-any
type Supa = any;

// Best-effort audit log. Never throws — a missing table (pre-029) or a
// transient error must not break the payment flow.
export async function logPaymentEvent(
  supabaseClient: Supa,
  event: {
    order_id?: string | null;
    order_number?: string | null;
    event_type: string;
    source: string;
    reference?: string | null;
    amount?: number | null;
    detail?: unknown;
  },
) {
  try {
    await supabaseClient.from('payment_events').insert({
      order_id: event.order_id ?? null,
      order_number: event.order_number ?? null,
      event_type: event.event_type,
      source: event.source,
      reference: event.reference ?? null,
      amount: event.amount ?? null,
      detail: event.detail ?? null,
    });
  } catch (_e) {
    // swallow — audit logging is best-effort
  }
}

// Atomically claim an order for finalization. Returns true only for the single
// caller that actually transitioned it PENDING/other -> APPROVED, so verify and
// webhook can both call this and only one will proceed. Falls back to a plain
// guarded update if the RPC doesn't exist yet (pre-029).
async function claimOrder(supabaseClient: Supa, orderId: string, reference: string): Promise<boolean> {
  const { data, error } = await supabaseClient.rpc('claim_order_for_finalize', {
    p_order_id: orderId,
    p_reference: reference,
  });
  if (!error) return data === true;

  // Fallback: pre-029 database without the RPC. Not perfectly atomic across
  // concurrent verify+webhook, but the callers already guard on
  // payment_status !== 'APPROVED', which covers the common case.
  const { data: current } = await supabaseClient
    .from('orders')
    .select('payment_status')
    .eq('id', orderId)
    .single();
  if (current?.payment_status === 'APPROVED') return false;
  await supabaseClient
    .from('orders')
    .update({ payment_status: 'APPROVED', payment_reference: reference })
    .eq('id', orderId);
  return true;
}

// Oversell-proof decrement. Returns true if the unit(s) were deducted, false if
// there wasn't enough stock. Falls back to the non-atomic decrement_stock if the
// safe RPC doesn't exist yet (pre-029).
async function decrementStock(supabaseClient: Supa, productId: string, qty: number): Promise<boolean> {
  const { data, error } = await supabaseClient.rpc('decrement_stock_safe', {
    p_product_id: productId,
    p_quantity: qty,
  });
  if (!error) return data === true;

  // Fallback: pre-029 non-atomic decrement (clamps at 0, can't report shortfall).
  await supabaseClient.rpc('decrement_stock', { product_id: productId, quantity: qty });
  return true;
}

// Finalize a paid order exactly once: claim it atomically, decrement stock,
// email the receipt. Safe to call from both verify-payment and the webhook.
export async function finalizeApprovedOrder(
  supabaseClient: Supa,
  // deno-lint-ignore no-explicit-any
  order: any,
  paystackReference: string,
  source: string,
) {
  const claimed = await claimOrder(supabaseClient, order.id, paystackReference);
  if (!claimed) {
    // Someone else already finalized this order — do nothing further.
    await logPaymentEvent(supabaseClient, {
      order_id: order.id,
      order_number: order.order_number,
      event_type: 'FINALIZE_SKIPPED_DUPLICATE',
      source,
      reference: paystackReference,
    });
    return;
  }

  const { data: items } = await supabaseClient
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  // Decrement stock atomically. Payment has already succeeded (money taken), so
  // a shortfall is NOT a reason to fail the order — it's flagged for the admin
  // to restock or refund, and the order stays APPROVED.
  const shortfalls: string[] = [];
  for (const item of items || []) {
    if (!item.product_id) continue;
    const ok = await decrementStock(supabaseClient, item.product_id, item.qty);
    if (!ok) shortfalls.push(`${item.name}${item.size ? ` (${item.size})` : ''} x${item.qty}`);
  }

  if (shortfalls.length > 0) {
    const note = `⚠ Paid but out of stock at fulfilment: ${shortfalls.join('; ')}. Restock or refund.`;
    await supabaseClient
      .from('orders')
      .update({ admin_notes: note })
      .eq('id', order.id);
    await logPaymentEvent(supabaseClient, {
      order_id: order.id,
      order_number: order.order_number,
      event_type: 'STOCK_SHORTFALL',
      source,
      reference: paystackReference,
      detail: { shortfalls },
    });
  }

  await logPaymentEvent(supabaseClient, {
    order_id: order.id,
    order_number: order.order_number,
    event_type: 'ORDER_FINALIZED',
    source,
    reference: paystackReference,
    amount: Math.round((order.total ?? 0) * 100),
  });

  try {
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        type: 'order_confirmation',
        to: order.email,
        data: {
          orderNumber: order.order_number,
          customerName: order.customer_name,
          // deno-lint-ignore no-explicit-any
          items: (items || []).map((item: any) => ({
            name: item.name,
            variant: [item.size, item.color].filter(Boolean).join(' / '),
            quantity: item.qty,
            price: item.price,
          })),
          subtotal: order.total - order.shipping_cost,
          shipping: order.shipping_cost,
          total: order.total,
          shippingAddress: {
            name: order.customer_name,
            address: order.address,
            city: order.city || '',
            state: order.state || '',
            zipCode: '',
            phone: order.phone || '',
          },
          orderDate: order.created_at,
          email: order.email,
        },
      }),
    });
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError);
  }
}
