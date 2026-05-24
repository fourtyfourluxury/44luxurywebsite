import { supabase } from '../../lib/supabase';

/**
 * Video Admin Service
 * Handles admin video management operations
 */

/**
 * Get all videos with filters
 * @param {Object} filters - Filter options
 * @param {string} filters.page - Filter by page
 * @param {string} filters.status - Filter by status
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getAllVideos(filters = {}) {
  try {
    let query = supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply page filter
    if (filters.page) {
      query = query.contains('pages', [filters.page]);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getVideoById(videoId) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching video:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create new video
 * @param {Object} videoData - Video data
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function createVideo(videoData) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert(videoData)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating video:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update video
 * @param {string} videoId - Video ID
 * @param {Object} updates - Video updates
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updateVideo(videoId, updates) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating video:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete video
 * @param {string} videoId - Video ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteVideo(videoId) {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get videos by page
 * @param {string} page - Page name
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getVideosByPage(page) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .contains('pages', [page])
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching videos by page:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get video statistics
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getVideoStats() {
  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select('status, source');

    if (error) throw error;

    const stats = {
      total: videos.length,
      active: videos.filter(v => v.status === 'ACTIVE').length,
      draft: videos.filter(v => v.status === 'DRAFT').length,
      bySource: {
        upload: videos.filter(v => v.source === 'UPLOAD').length,
        youtube: videos.filter(v => v.source === 'YOUTUBE').length,
        vimeo: videos.filter(v => v.source === 'VIMEO').length,
      },
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching video stats:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Bulk update video status
 * @param {Array} videoIds - Array of video IDs
 * @param {string} status - New status (ACTIVE, DRAFT)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function bulkUpdateStatus(videoIds, status) {
  try {
    const { error } = await supabase
      .from('videos')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', videoIds);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error bulk updating status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update video playback settings
 * @param {string} videoId - Video ID
 * @param {Object} playbackSettings - Playback settings
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function updatePlaybackSettings(videoId, playbackSettings) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .update({
        playback: playbackSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating playback settings:', error);
    return { data: null, error: error.message };
  }
}
