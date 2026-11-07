import { supabase } from '../lib/supabase';
import { clampPercent } from '../utils/pricing';

const DEFAULT_STORE_SALE = {
  id: 1,
  is_active: false,
  discount_percent: 0,
  label: 'BLACK FRIDAY SALE',
  starts_at: null,
  ends_at: null,
  applies_to_categories: [],
  category_discounts: {},
};

const logSupabaseError = (error) => {
  if (error) {
    console.error(error.message, error.details, error.hint, error.code);
  }
};

/**
 * Sanitize a category_discounts map to only valid 0..100 numbers.
 */
function sanitizeCategoryDiscounts(rawMap) {
  if (!rawMap || typeof rawMap !== 'object' || Array.isArray(rawMap)) {
    return {};
  }
  const clean = {};
  for (const [key, val] of Object.entries(rawMap)) {
    const trimmedKey = String(key || '').trim();
    if (!trimmedKey) continue;
    if (val === null || val === undefined || String(val).trim() === '') continue;
    const num = Number(val);
    if (Number.isFinite(num)) {
      clean[trimmedKey] = clampPercent(num);
    }
  }
  return clean;
}

/**
 * Fetch the single store_sale configuration row (id = 1).
 */
export async function getStoreSale() {
  try {
    const { data, error } = await supabase
      .from('store_sale')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      logSupabaseError(error);
      return { sale: DEFAULT_STORE_SALE, error: error.message };
    }

    return {
      sale: data
        ? {
            ...DEFAULT_STORE_SALE,
            ...data,
            category_discounts: sanitizeCategoryDiscounts(data.category_discounts),
          }
        : DEFAULT_STORE_SALE,
      error: null,
    };
  } catch (error) {
    logSupabaseError(error);
    return { sale: DEFAULT_STORE_SALE, error: error.message };
  }
}

export const NO_ADMIN_SESSION_MESSAGE =
  'You are not signed in with a real admin account. Sign in to save.';

/**
 * Update the single store_sale row (id = 1) using .update(...).eq('id', 1)
 * and verify that exactly one row was affected.
 */
export async function updateStoreSale(updates) {
  try {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      logSupabaseError(sessionErr);
    }
    if (!sessionData?.session) {
      return { sale: null, error: NO_ADMIN_SESSION_MESSAGE };
    }

    const is_active = Boolean(updates.is_active);
    const discount_percent = clampPercent(updates.discount_percent);
    const label = String(updates.label || 'BLACK FRIDAY SALE').trim() || 'BLACK FRIDAY SALE';
    const starts_at = updates.starts_at ? new Date(updates.starts_at).toISOString() : null;
    const ends_at = updates.ends_at ? new Date(updates.ends_at).toISOString() : null;
    const applies_to_categories = Array.isArray(updates.applies_to_categories)
      ? updates.applies_to_categories.filter(Boolean)
      : [];
    const category_discounts = sanitizeCategoryDiscounts(updates.category_discounts);

    const { data, error } = await supabase
      .from('store_sale')
      .update({
        is_active,
        discount_percent,
        label,
        starts_at,
        ends_at,
        applies_to_categories,
        category_discounts,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select('*');

    if (error) {
      logSupabaseError(error);
      return { sale: null, error: error.message };
    }

    if (!Array.isArray(data) || data.length !== 1) {
      const msg =
        !data || data.length === 0
          ? 'No store_sale row (id=1) was updated. Check RLS UPDATE policy on public.store_sale.'
          : `Unexpected number of store_sale rows updated (${data.length}).`;
      console.error(msg, null, null, 'PGRST_ROW_COUNT');
      return { sale: null, error: msg };
    }

    return {
      sale: {
        ...DEFAULT_STORE_SALE,
        ...data[0],
        category_discounts: sanitizeCategoryDiscounts(data[0].category_discounts),
      },
      error: null,
    };
  } catch (error) {
    logSupabaseError(error);
    return { sale: null, error: error.message };
  }
}

/**
 * Update only discount_enabled, discount_percent, and sale_excluded on changed products.
 * Uses .update(...).eq('id', id) per row in small batches (never upsert, never touches price).
 *
 * @param {Array<{ id: string, name?: string, discount_enabled: boolean, discount_percent: number, sale_excluded: boolean }>} changes
 * @returns {Promise<{ succeededIds: string[], failed: Array<{ id: string, name: string, error: string }> }>}
 */
export async function updateProductDiscountsBatch(changes) {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) {
    logSupabaseError(sessionErr);
  }
  if (!sessionData?.session) {
    return {
      succeededIds: [],
      failed: changes.map((item) => ({
        id: item.id,
        name: item.name || item.id,
        error: NO_ADMIN_SESSION_MESSAGE,
      })),
      authError: NO_ADMIN_SESSION_MESSAGE,
    };
  }

  const succeededIds = [];
  const failed = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < changes.length; i += BATCH_SIZE) {
    const batch = changes.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        try {
          const excluded = Boolean(item.sale_excluded);
          const pct = excluded ? 0 : clampPercent(item.discount_percent);
          const enabled = !excluded && Boolean(item.discount_enabled) && pct > 0;

          const { data, error } = await supabase
            .from('products')
            .update({
              discount_enabled: enabled,
              discount_percent: enabled ? pct : 0,
              sale_excluded: excluded,
            })
            .eq('id', item.id)
            .select('id');

          if (error) {
            logSupabaseError(error);
            failed.push({
              id: item.id,
              name: item.name || item.id,
              error: error.message || 'Update failed',
            });
            return;
          }

          if (!Array.isArray(data) || data.length !== 1) {
            const msg = 'Row was not updated (check RLS UPDATE policy on public.products).';
            console.error(msg, item.id, null, 'PGRST_ROW_COUNT');
            failed.push({
              id: item.id,
              name: item.name || item.id,
              error: msg,
            });
            return;
          }

          succeededIds.push(item.id);
        } catch (err) {
          logSupabaseError(err);
          failed.push({
            id: item.id,
            name: item.name || item.id,
            error: err?.message || 'Unexpected error',
          });
        }
      })
    );
  }

  return { succeededIds, failed };
}
