-- =====================================================
-- MIGRATION 019 — Create Custom Pages Table & Seed Return Policy
-- Adds custom_pages table, RLS policies, and inserts the Return Policy page.
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE custom_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "custom_pages_select" ON custom_pages;
DROP POLICY IF EXISTS "custom_pages_insert" ON custom_pages;
DROP POLICY IF EXISTS "custom_pages_update" ON custom_pages;
DROP POLICY IF EXISTS "custom_pages_delete" ON custom_pages;

-- Create policies matching other tables
CREATE POLICY "custom_pages_select" ON custom_pages FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "custom_pages_insert" ON custom_pages FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "custom_pages_update" ON custom_pages FOR UPDATE
  USING (is_admin());

CREATE POLICY "custom_pages_delete" ON custom_pages FOR DELETE
  USING (is_admin());

-- Seed Return Policy page
INSERT INTO custom_pages (slug, title, content, is_active)
VALUES (
  'return-policy',
  'Returns & Exchange Policy',
  'At 44 Luxury, we take pride in delivering premium-quality products and ensuring every order meets our highest standards. Please review our Returns & Exchange Policy carefully before making a purchase.

### No Refund Policy

44 Luxury operates a strict **No Refund Policy**. Refunds will not be issued once an order has been successfully completed.

### Returns

Return requests must be initiated within **3 days** of receiving your order.

To qualify for a return, items must:
• Be unused
• Be unworn
• Be unwashed
• Have all original tags attached
• Be returned in their original packaging
• Be accompanied by proof of purchase

All returned items will undergo a quality inspection before approval.
Items that fail inspection may be declined and returned to the customer.

### Return Shipping

If the return is required because of an error made by **44 Luxury**, we will cover all return shipping costs provided the issue is reported within **3 days** of delivery.

If the return is due to customer-related reasons, including:
• Incorrect size selected
• Change of mind
• Incorrect shipping information
the customer will be responsible for all shipping costs.

### Exchanges

Exchange requests may be submitted within **7 days** of receiving your order and are subject to product availability.
If the requested item is unavailable, a **44 Luxury Store Credit** may be offered.
No cash refunds will be provided.
Requests made after **7 days** are not eligible for exchange.

### Non-Returnable Items

The following items cannot be returned or exchanged:
• Final Sale items
• Discounted products
• Limited Edition products
• Custom-made or personalized items

### Policy Updates

44 Luxury reserves the right to amend, modify, or decline any return or exchange request that does not comply with this policy.

By purchasing from 44 Luxury, you acknowledge and agree to the terms outlined above.',
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();

SELECT 'Migration 019 complete — custom_pages created & return-policy seeded' AS status;
