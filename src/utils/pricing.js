/**
 * Shared Pricing & Discount Helper
 * Single source of truth for computing product effective prices across
 * storefront cards, listings, product detail, cart, checkout, and admin.
 */

export const CLOTHING_CATEGORIES = [
  'Sweatshirts',
  'Polo Shirts',
  'Tank Tops',
  'Caps',
  'Socks',
  'Skirts',
  'Crop Tops',
  'Denim',
  'Accessories',
];

export const ALL_PRODUCT_CATEGORIES = [
  ...CLOTHING_CATEGORIES.slice(0, 8),
  'Footwear',
  'Accessories',
];

/** Clamp a discount percentage to [0, 100]. Never returns NaN or negative. */
export function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(100, Math.max(0, num));
}

/** Round an NGN price to a non-negative integer, never NaN or negative. */
export function roundNGN(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.max(0, Math.round(num));
}

/**
 * Compute the store-wide sale schedule/status state:
 * - 'Ended': ends_at is set and in the past
 * - 'Scheduled': starts_at is set and in the future (when is_active is true)
 * - 'Live': is_active is true, discount_percent > 0, within starts_at/ends_at,
 *           AND at least one category is selected in applies_to_categories
 * - 'Off': otherwise
 */
export function getStoreSaleStatus(storeSale, now = new Date()) {
  if (!storeSale) return 'Off';

  const nowDate = now instanceof Date ? now : new Date(now);
  const nowMs = nowDate.getTime();
  if (Number.isNaN(nowMs)) return 'Off';

  if (storeSale.ends_at) {
    const endMs = new Date(storeSale.ends_at).getTime();
    if (!Number.isNaN(endMs) && nowMs > endMs) {
      return 'Ended';
    }
  }

  if (!storeSale.is_active) return 'Off';

  if (storeSale.starts_at) {
    const startMs = new Date(storeSale.starts_at).getTime();
    if (!Number.isNaN(startMs) && nowMs < startMs) {
      return 'Scheduled';
    }
  }

  const pct = clampPercent(storeSale.discount_percent);
  const categories = Array.isArray(storeSale.applies_to_categories)
    ? storeSale.applies_to_categories.filter(Boolean)
    : [];

  if (categories.length === 0) return 'Off';

  const catDiscounts =
    storeSale.category_discounts && typeof storeSale.category_discounts === 'object'
      ? storeSale.category_discounts
      : {};

  const hasAnyCategoryPct = categories.some((cat) => {
    const key = Object.keys(catDiscounts).find(
      (k) => k.trim().toLowerCase() === String(cat).trim().toLowerCase()
    );
    return key !== undefined && clampPercent(catDiscounts[key]) > 0;
  });

  if (pct > 0 || hasAnyCategoryPct) {
    return 'Live';
  }

  return 'Off';
}

/**
 * Check whether the store-wide sale row is currently active right now,
 * requiring is_active = true, at least one selected category in
 * applies_to_categories, a positive discount percent, and within starts_at/ends_at window.
 */
export function isStoreSaleActive(storeSale, now = new Date()) {
  return getStoreSaleStatus(storeSale, now) === 'Live';
}

/**
 * Check if a product's category matches store_sale.applies_to_categories.
 * Safer rule: an EMPTY applies_to_categories array means NO categories are discounted.
 * Note: In 44 Luxury, the product category ("Footwear", "Crop Tops",
 * "Sweatshirts", etc.) is stored in `product.subcategory`, while
 * `product.category` holds gender ('unisex' | 'men' | 'women'). We check both.
 */
export function doesSaleApplyToCategory(product, storeSale) {
  const list = Array.isArray(storeSale?.applies_to_categories)
    ? storeSale.applies_to_categories.filter(Boolean)
    : [];

  if (list.length === 0) return false;

  const sub = String(product?.subcategory || '').trim().toLowerCase();
  const cat = String(product?.category || '').trim().toLowerCase();

  return list.some((entry) => {
    const normalized = String(entry || '').trim().toLowerCase();
    return Boolean(normalized) && (normalized === sub || normalized === cat);
  });
}

/**
 * Resolve the discount percentage for a product's category from store_sale.category_discounts,
 * falling back to store_sale.discount_percent when no category-specific override is set.
 *
 * @param {Object} product
 * @param {Object|null} storeSale
 * @returns {{ percent: number, isCategorySpecific: boolean }}
 */
export function getCategoryDiscountPercent(product, storeSale) {
  const defaultPct = clampPercent(storeSale?.discount_percent);
  const rawMap =
    storeSale?.category_discounts &&
    typeof storeSale.category_discounts === 'object' &&
    !Array.isArray(storeSale.category_discounts)
      ? storeSale.category_discounts
      : {};

  const sub = String(product?.subcategory || '').trim().toLowerCase();
  const cat = String(product?.category || '').trim().toLowerCase();

  for (const [key, rawVal] of Object.entries(rawMap)) {
    const normKey = String(key || '').trim().toLowerCase();
    if (!normKey) continue;
    if (normKey === sub || normKey === cat) {
      if (rawVal !== null && rawVal !== undefined && String(rawVal).trim() !== '') {
        const parsed = Number(rawVal);
        if (Number.isFinite(parsed)) {
          return {
            percent: clampPercent(parsed),
            isCategorySpecific: true,
          };
        }
      }
    }
  }

  return {
    percent: defaultPct,
    isCategorySpecific: false,
  };
}

/**
 * Compute effective price for a product given the current store_sale config.
 *
 * PRICING PRECEDENCE:
 * 1. sale_excluded = true -> no discount from this system.
 * 2. Product's own discount (discount_enabled true and discount_percent > 0).
 * 3. Category discount: store sale is active AND the product's category is in
 *    applies_to_categories -> use category_discounts[category] if present,
 *    otherwise the store-wide percent.
 * 4. Otherwise no discount.
 *
 * @param {Object} product
 * @param {Object|null} storeSale
 * @param {Date|string|number} [now]
 * @returns {{ originalPrice: number, finalPrice: number, discountPercent: number, isOnSale: boolean, source: 'product'|'category'|'store'|'excluded'|'none' }}
 */
export function getEffectivePrice(product, storeSale, now = new Date()) {
  const basePrice = roundNGN(product?.price);

  if (!product || basePrice <= 0) {
    return {
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      isOnSale: false,
      source: 'none',
    };
  }

  // 1. sale_excluded = true -> no discount from this system
  const isExcluded = Boolean(product.sale_excluded ?? product.saleExcluded);
  if (isExcluded) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice,
      discountPercent: 0,
      isOnSale: false,
      source: 'excluded',
    };
  }

  // 2. Product's own discount (discount_enabled true and discount_percent > 0)
  const ownEnabled = Boolean(product.discount_enabled ?? product.discountEnabled);
  const ownPercent = clampPercent(product.discount_percent ?? product.discountPercent);
  if (ownEnabled && ownPercent > 0) {
    const finalPrice = roundNGN(basePrice * (1 - ownPercent / 100));
    const discountPercent = Math.round(ownPercent);
    const isOnSale = finalPrice < basePrice && discountPercent > 0;
    return {
      originalPrice: basePrice,
      finalPrice: isOnSale ? finalPrice : basePrice,
      discountPercent: isOnSale ? discountPercent : 0,
      isOnSale,
      source: isOnSale ? 'product' : 'none',
    };
  }

  // 3. Category discount / Store-wide sale:
  //    store sale is active AND product's category is in applies_to_categories ->
  //    use category_discounts[category] if present, otherwise store-wide percent.
  if (
    isStoreSaleActive(storeSale, now) &&
    doesSaleApplyToCategory(product, storeSale)
  ) {
    const { percent, isCategorySpecific } = getCategoryDiscountPercent(product, storeSale);
    if (percent > 0) {
      const finalPrice = roundNGN(basePrice * (1 - percent / 100));
      const discountPercent = Math.round(percent);
      const isOnSale = finalPrice < basePrice && discountPercent > 0;
      if (isOnSale) {
        return {
          originalPrice: basePrice,
          finalPrice,
          discountPercent,
          isOnSale: true,
          source: isCategorySpecific ? 'category' : 'store',
        };
      }
    }
  }

  // 4. Otherwise no discount
  return {
    originalPrice: basePrice,
    finalPrice: basePrice,
    discountPercent: 0,
    isOnSale: false,
    source: 'none',
  };
}
