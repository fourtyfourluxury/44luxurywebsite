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

    return { data, error: null };
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
    const { data, error } = await supabase
      .from('homepage_config')
      .upsert({
        id: 1, // Single row config
        ...config,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

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
