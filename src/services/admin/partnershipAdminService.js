import { supabase } from '../../lib/supabase';
import { deleteFileByUrl, isSupabaseStorageUrl } from '../storageService';

const SAFE_PARTNERSHIP_COLUMNS = new Set([
  'name', 'slug', 'partner_name', 'description', 'launch_date', 'status',
  'partner_website', 'logo_url', 'banner_url', 'gallery', 'video_urls',
  'featured_product_ids', 'collection_ids', 'sort_order', 'is_featured',
  'seo_title', 'seo_description',
]);

const sanitize = (data) => {
  const EXCLUDED = new Set(['id', 'created_at', 'updated_at']);
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (EXCLUDED.has(k) || !SAFE_PARTNERSHIP_COLUMNS.has(k)) continue;
    if (v !== undefined) out[k] = v;
  }
  return out;
};

export const getAllPartnerships = async () => {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { partnerships: data, error: null };
  } catch (error) {
    console.error('Get partnerships error:', error);
    return { partnerships: [], error: error.message };
  }
};

export const getPartnershipBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .single();
    if (error) throw error;
    return { partnership: data, error: null };
  } catch (error) {
    return { partnership: null, error: error.message };
  }
};

export const createPartnership = async (data) => {
  try {
    const payload = sanitize(data);
    const { data: result, error } = await supabase
      .from('partnerships')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return { partnership: result, error: null };
  } catch (error) {
    console.error('Create partnership error:', error);
    return { partnership: null, error: error.message };
  }
};

export const updatePartnership = async (id, data) => {
  try {
    const payload = sanitize(data);
    const { data: result, error } = await supabase
      .from('partnerships')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { partnership: result, error: null };
  } catch (error) {
    console.error('Update partnership error:', error);
    return { partnership: null, error: error.message };
  }
};

export const deletePartnership = async (id) => {
  try {
    const { data: p } = await supabase.from('partnerships').select('logo_url, banner_url, gallery').eq('id', id).single();
    if (p) {
      const urls = [p.logo_url, p.banner_url, ...(p.gallery || [])].filter(Boolean);
      for (const url of urls) {
        if (isSupabaseStorageUrl(url)) await deleteFileByUrl(url);
      }
    }
    const { error } = await supabase.from('partnerships').delete().eq('id', id);
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Delete partnership error:', error);
    return { success: false, error: error.message };
  }
};
