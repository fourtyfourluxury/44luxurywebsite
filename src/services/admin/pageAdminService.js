import { supabase } from '../../lib/supabase';

/**
 * Get all custom pages
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getAllPages() {
  try {
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .order('slug', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching admin pages:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Get page by ID
 * @param {string} id 
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getPageById(id) {
  try {
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching admin page by ID:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create a new custom page
 * @param {Object} page 
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function createPage(page) {
  try {
    const { data, error } = await supabase
      .from('custom_pages')
      .insert({
        slug: page.slug,
        title: page.title,
        content: page.content,
        is_active: page.is_active !== undefined ? page.is_active : true,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating custom page:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update an existing custom page
 * @param {string} id 
 * @param {Object} updates 
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updatePage(id, updates) {
  try {
    const { data, error } = await supabase
      .from('custom_pages')
      .update({
        slug: updates.slug,
        title: updates.title,
        content: updates.content,
        is_active: updates.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating custom page:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete a custom page
 * @param {string} id 
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deletePage(id) {
  try {
    const { error } = await supabase
      .from('custom_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting custom page:', error);
    return { success: false, error: error.message };
  }
}
