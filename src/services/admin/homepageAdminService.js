import { supabase } from '../../lib/supabase';

/**
 * Homepage Admin Service
 * Handles admin homepage configuration management
 */

/**
 * Get current homepage configuration
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getHomepageConfig() {
  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('*')
      .single();

    if (error) throw error;

    // Extract custom keys stored inside sections JSONB back to top-level
    const config = { ...data };
    if (config.sections && typeof config.sections === 'object' && !Array.isArray(config.sections)) {
      const { collections_row, new_arrivals, ...restSections } = config.sections;
      if (collections_row) config.collections_row = collections_row;
      if (new_arrivals) config.new_arrivals = new_arrivals;
      // Keep any remaining section data
      config._rawSections = restSections;
    }

    return { data: config, error: null };
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update homepage configuration
 * @param {Object} config - Homepage configuration
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateHomepageConfig(config) {
  try {
    // Known database columns on homepage_config
    const knownColumns = ['sections', 'featured_product_ids', 'announcement', 'hero_display_mode', 'hero_speed'];
    
    // Separate known columns from custom data (like collections_row, new_arrivals)
    const dbUpdate = {};
    const customData = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (knownColumns.includes(key)) {
        dbUpdate[key] = value;
      } else {
        customData[key] = value;
      }
    }
    
    // If there's custom data, merge it into the sections JSONB field
    if (Object.keys(customData).length > 0) {
      // Fetch current config to merge
      const { data: current } = await supabase
        .from('homepage_config')
        .select('sections')
        .limit(1)
        .single();
      
      const existingSections = (current?.sections && typeof current.sections === 'object' && !Array.isArray(current.sections))
        ? current.sections 
        : {};
      
      dbUpdate.sections = { ...existingSections, ...customData };
    }
    
    dbUpdate.updated_at = new Date().toISOString();

    // Try update first, then insert if no rows exist
    const { data: existing } = await supabase
      .from('homepage_config')
      .select('id')
      .limit(1)
      .single();

    let data, error;
    if (existing) {
      ({ data, error } = await supabase
        .from('homepage_config')
        .update(dbUpdate)
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from('homepage_config')
        .insert(dbUpdate)
        .select()
        .single());
    }

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating homepage config:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get all hero slides
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getHeroSlides() {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create new hero slide
 * @param {Object} slideData - Slide data
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function createHeroSlide(slideData) {
  try {
    // Get max sort order
    const { data: slides } = await supabase
      .from('hero_slides')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = slides && slides.length > 0 ? slides[0].sort_order + 1 : 0;

    // Convert camelCase to snake_case for database
    const dbData = {
      image: slideData.image,
      headline: slideData.headline,
      subheadline: slideData.subheadline,
      cta_label: slideData.ctaLabel || slideData.cta_label,
      cta_link: slideData.ctaLink || slideData.cta_link,
      text_position: slideData.textPosition || slideData.text_position,
      sort_order: nextOrder,
    };

    const { data, error } = await supabase
      .from('hero_slides')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update hero slide
 * @param {string} slideId - Slide ID
 * @param {Object} updates - Slide updates
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateHeroSlide(slideId, updates) {
  try {
    // Convert camelCase to snake_case for database
    const dbUpdates = {
      image: updates.image,
      headline: updates.headline,
      subheadline: updates.subheadline,
      cta_label: updates.ctaLabel || updates.cta_label,
      cta_link: updates.ctaLink || updates.cta_link,
      text_position: updates.textPosition || updates.text_position,
      sort_order: updates.sort_order,
    };

    // Remove undefined values
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });

    const { data, error } = await supabase
      .from('hero_slides')
      .update(dbUpdates)
      .eq('id', slideId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete hero slide
 * @param {string} slideId - Slide ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteHeroSlide(slideId) {
  try {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', slideId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update hero slide order
 * @param {Array} sortedIds - Array of slide IDs in new order
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function updateHeroSlideOrder(sortedIds) {
  try {
    const updates = sortedIds.map((id, index) =>
      supabase
        .from('hero_slides')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating hero slide order:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update featured products
 * @param {Array} productIds - Array of product IDs to feature
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function updateFeaturedProducts(productIds) {
  try {
    // First, unset all featured products
    await supabase
      .from('products')
      .update({ is_featured: false })
      .eq('is_featured', true);

    // Then set the new featured products
    if (productIds && productIds.length > 0) {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: true })
        .in('id', productIds);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating featured products:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update homepage section visibility
 * @param {string} sectionId - Section identifier
 * @param {boolean} visible - Visibility state
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function updateSectionVisibility(sectionId, visible) {
  try {
    const { data: config } = await getHomepageConfig();
    
    if (!config) {
      return { success: false, error: 'Homepage config not found' };
    }

    const sections = config.sections || [];
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, visible } : section
    );

    const { error } = await updateHomepageConfig({
      ...config,
      sections: updatedSections,
    });

    if (error) throw new Error(error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating section visibility:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update homepage section order
 * @param {Array} sortedSectionIds - Array of section IDs in new order
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function updateSectionOrder(sortedSectionIds) {
  try {
    const { data: config } = await getHomepageConfig();
    
    if (!config) {
      return { success: false, error: 'Homepage config not found' };
    }

    const sections = config.sections || [];
    const sortedSections = sortedSectionIds.map(id =>
      sections.find(s => s.id === id)
    ).filter(Boolean);

    const { error } = await updateHomepageConfig({
      ...config,
      sections: sortedSections,
    });

    if (error) throw new Error(error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating section order:', error);
    return { success: false, error: error.message };
  }
}
