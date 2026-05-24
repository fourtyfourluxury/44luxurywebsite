import { supabase } from '../lib/supabase';

/**
 * Homepage Service
 * Handles homepage-specific data (hero slides, config, videos)
 */

// Get all hero slides
export const getHeroSlides = async () => {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return { slides: data, error: null };
  } catch (error) {
    console.error('Get hero slides error:', error);
    return { slides: [], error: error.message };
  }
};

// Get homepage configuration
export const getHomepageConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('*')
      .single();

    if (error) throw error;

    return { config: data, error: null };
  } catch (error) {
    console.error('Get homepage config error:', error);
    return { config: null, error: error.message };
  }
};

// Get active videos for a specific page
export const getActiveVideos = async (page = 'home') => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('status', 'ACTIVE')
      .contains('pages', [page]);

    if (error) throw error;

    return { videos: data, error: null };
  } catch (error) {
    console.error('Get active videos error:', error);
    return { videos: [], error: error.message };
  }
};

// Get all active videos
export const getAllActiveVideos = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { videos: data, error: null };
  } catch (error) {
    console.error('Get all active videos error:', error);
    return { videos: [], error: error.message };
  }
};

// Get site settings
export const getSiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (error) throw error;

    return { settings: data, error: null };
  } catch (error) {
    console.error('Get site settings error:', error);
    return { settings: null, error: error.message };
  }
};

// Get announcement bar config from homepage config
export const getAnnouncementConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('announcement')
      .single();

    if (error) throw error;

    return { announcement: data?.announcement, error: null };
  } catch (error) {
    console.error('Get announcement config error:', error);
    return { announcement: null, error: error.message };
  }
};

// Get featured product IDs from homepage config
export const getFeaturedProductIds = async () => {
  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('featured_product_ids')
      .single();

    if (error) throw error;

    return { productIds: data?.featured_product_ids || [], error: null };
  } catch (error) {
    console.error('Get featured product IDs error:', error);
    return { productIds: [], error: error.message };
  }
};

// Get homepage sections configuration
export const getHomepageSections = async () => {
  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('sections')
      .single();

    if (error) throw error;

    // Sort sections by order
    const sections = data?.sections || [];
    const sortedSections = sections.sort((a, b) => a.order - b.order);

    return { sections: sortedSections, error: null };
  } catch (error) {
    console.error('Get homepage sections error:', error);
    return { sections: [], error: error.message };
  }
};

// Get complete homepage data (all in one call)
export const getCompleteHomepageData = async () => {
  try {
    // Fetch all homepage data in parallel
    const [
      { slides },
      { config },
      { videos },
      { settings },
    ] = await Promise.all([
      getHeroSlides(),
      getHomepageConfig(),
      getActiveVideos('home'),
      getSiteSettings(),
    ]);

    return {
      data: {
        heroSlides: slides,
        config,
        videos,
        settings,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get complete homepage data error:', error);
    return { data: null, error: error.message };
  }
};
