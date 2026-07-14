import { supabase } from '../lib/supabase';

const DEFAULT_RETURN_POLICY = `At 44 Luxury, we take pride in delivering premium-quality products and ensuring every order meets our highest standards. Please review our Returns & Exchange Policy carefully before making a purchase.

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

By purchasing from 44 Luxury, you acknowledge and agree to the terms outlined above.`;

/**
 * Get a custom page by slug
 * @param {string} slug 
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getPageBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      // Fallback if table doesn't exist yet or other query error
      if (slug === 'return-policy') {
        return {
          data: {
            slug: 'return-policy',
            title: 'Returns & Exchange Policy',
            content: DEFAULT_RETURN_POLICY
          },
          error: null
        };
      }
      throw error;
    }

    if (!data && slug === 'return-policy') {
      return {
        data: {
          slug: 'return-policy',
          title: 'Returns & Exchange Policy',
          content: DEFAULT_RETURN_POLICY
        },
        error: null
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    if (slug === 'return-policy') {
      return {
        data: {
          slug: 'return-policy',
          title: 'Returns & Exchange Policy',
          content: DEFAULT_RETURN_POLICY
        },
        error: null
      };
    }
    return { data: null, error: error.message };
  }
}
