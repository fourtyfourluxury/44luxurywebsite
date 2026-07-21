// Shared by verify-payment and paystack-webhook: the single place that
// actually marks an order paid. Both call sites hit this after independently
// confirming a successful charge with Paystack, so this is idempotent —
// callers should skip it entirely if order.payment_status is already
// 'APPROVED' rather than relying on this function to no-op.
export async function finalizeApprovedOrder(
  // deno-lint-ignore no-explicit-any
  supabaseClient: any,
  // deno-lint-ignore no-explicit-any
  order: any,
  paystackReference: string,
) {
  const { data: items } = await supabaseClient
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  for (const item of items || []) {
    if (!item.product_id) continue;
    const { error } = await supabaseClient.rpc('decrement_stock', {
      product_id: item.product_id,
      quantity: item.qty,
    });
    if (error) console.error('Error decrementing stock:', error);
  }

  await supabaseClient
    .from('orders')
    .update({ payment_status: 'APPROVED', payment_reference: paystackReference })
    .eq('id', order.id);

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
