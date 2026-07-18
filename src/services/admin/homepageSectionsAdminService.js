import { supabase } from '../../lib/supabase';

/**
 * Homepage Sections Admin Service
 * CRUD for admin-managed, named homepage product sections
 */

// Get all sections (including hidden), ordered for the admin list
export async function getSections() {
  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return { data: [], error: error.message };
  }
}

// Create a new empty section, appended to the end of the order
export async function createSection(title) {
  try {
    const { data: existing } = await supabase
      .from('homepage_sections')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from('homepage_sections')
      .insert({ title: title || 'NEW SECTION', product_ids: [], sort_order: nextOrder })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating homepage section:', error);
    return { data: null, error: error.message };
  }
}

// Update a section's title, product_ids, and/or visibility
export async function updateSection(id, updates) {
  try {
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.product_ids !== undefined) dbUpdates.product_ids = updates.product_ids;
    if (updates.visible !== undefined) dbUpdates.visible = updates.visible;
    if (updates.collection_id !== undefined) dbUpdates.collection_id = updates.collection_id;

    const { data, error } = await supabase
      .from('homepage_sections')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating homepage section:', error);
    return { data: null, error: error.message };
  }
}

// Delete a section
export async function deleteSection(id) {
  try {
    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting homepage section:', error);
    return { success: false, error: error.message };
  }
}

// Persist new sort order for all sections
export async function reorderSections(orderedIds) {
  try {
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('homepage_sections')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error reordering homepage sections:', error);
    return { success: false, error: error.message };
  }
}
