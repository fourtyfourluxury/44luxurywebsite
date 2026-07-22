-- =====================================================
-- 029 — Payment workflow hardening
-- Adds: payment audit trail, atomic once-only order finalize,
-- atomic oversell-proof stock decrement, and extra payment states.
-- Safe to run more than once.
-- =====================================================

-- 1. Allow richer payment lifecycle states.
--    PENDING  -> created, awaiting payment
--    APPROVED -> paid & verified
--    FAILED   -> Paystack declined / verification failed
--    CANCELLED-> customer abandoned the Paystack page
--    REFUNDED -> money returned
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('PENDING', 'APPROVED', 'FAILED', 'CANCELLED', 'REFUNDED'));

-- Free-text note so the finalize logic can flag issues (e.g. paid-but-oversold)
-- for the admin without inventing more columns.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. Payment event audit trail. Every state transition and provider callback
--    is appended here so there is a full, tamper-evident history per order.
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_number TEXT,
  event_type TEXT NOT NULL,          -- ORDER_CREATED, PAYSTACK_INIT, PAYSTACK_INIT_FAILED,
                                     -- PAYMENT_VERIFIED, VERIFY_FAILED, WEBHOOK_RECEIVED,
                                     -- ORDER_FINALIZED, FINALIZE_SKIPPED_DUPLICATE,
                                     -- STOCK_SHORTFALL, REFUNDED
  source TEXT,                       -- 'create-order' | 'verify-payment' | 'webhook' | 'admin'
  reference TEXT,                    -- Paystack reference (order UUID)
  amount INTEGER,                    -- kobo, when relevant
  detail JSONB,                      -- raw payload / message
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON payment_events(created_at DESC);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Only admins may read the audit trail; writes happen via service-role edge
-- functions which bypass RLS, so no INSERT policy is needed for end users.
DROP POLICY IF EXISTS "Admins can read payment events" ON payment_events;
CREATE POLICY "Admins can read payment events"
ON payment_events FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Atomic, oversell-proof stock decrement. Only decrements when enough stock
--    exists; returns TRUE on success, FALSE if there wasn't enough. Because the
--    UPDATE ... WHERE stock >= quantity is a single atomic statement, two
--    concurrent orders for the last unit cannot both succeed.
CREATE OR REPLACE FUNCTION decrement_stock_safe(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE products
     SET stock = stock - p_quantity
   WHERE id = p_product_id
     AND stock >= p_quantity;
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atomic once-only finalize claim. Flips PENDING -> APPROVED for exactly one
--    caller; returns TRUE only to the caller that actually made the transition.
--    verify-payment and the webhook both call this, so whichever lands first
--    wins and the other is a no-op — no double stock decrement, no double email.
CREATE OR REPLACE FUNCTION claim_order_for_finalize(p_order_id UUID, p_reference TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE orders
     SET payment_status = 'APPROVED',
         payment_reference = p_reference,
         updated_at = NOW()
   WHERE id = p_order_id
     AND payment_status <> 'APPROVED';
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Payment hardening (029) applied successfully!' AS status;
