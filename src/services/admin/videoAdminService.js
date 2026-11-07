import { supabase } from '../../lib/supabase';
import { BUCKETS } from '../storageService';

/**
 * Video Admin Service
 * Handles admin video management operations
 */

// ── Form <-> DB row mapping (public.videos columns, see 001_initial_schema.sql) ──
const toSlug = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, '_');

/** Map the admin form object to a payload containing only real videos columns. */
export function toVideoRow(v) {
  const source = v.source || 'UPLOAD';
  const playback = v.playback || [];
  const videoUrl = source === 'YOUTUBE'
    ? (v.youtubeUrl || null)
    : source === 'VIMEO'
      ? (v.vimeoUrl || null)
      : (v.url || null);

  return {
    title: (v.title || '').trim(),
    source,
    source_type: source.toLowerCase(),
    url: v.url || null,
    video_url: videoUrl,
    youtube_url: v.youtubeUrl || null,
    vimeo_url: v.vimeoUrl || null,
    thumbnail: v.thumbnail || null,
    thumbnail_url: v.thumbnail || null,
    pages: (v.pages || []).map(toSlug),
    display_style: toSlug(v.displayStyle) || null,
    playback,
    autoplay: playback.includes('AUTOPLAY MUTED'),
    play_on_click: playback.includes('PLAY ON CLICK'),
    loop: playback.includes('LOOP'),
    overlay_headline: v.overlayHeadline || null,
    headline: v.overlayHeadline || null,
    overlay_subtext: v.overlaySubtext || null,
    subtext: v.overlaySubtext || null,
    overlay_cta: v.overlayCta || null,
    cta_text: v.overlayCta || null,
    display_mode: v.displayMode || 'SINGLE',
    transition_speed: Number(v.transitionSpeed) || 5,
    status: v.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE',
  };
}

/** Map a videos row back to the admin form shape. */
export function fromVideoRow(r) {
  return {
    id: r.id,
    title: r.title || '',
    source: r.source || 'UPLOAD',
    url: r.url || r.video_url || '',
    youtubeUrl: r.youtube_url || '',
    vimeoUrl: r.vimeo_url || '',
    thumbnail: r.thumbnail || r.thumbnail_url || '',
    pages: (r.pages || []).map(toSlug),
    displayStyle: toSlug(r.display_style) || 'inline_section',
    playback: r.playback || [],
    overlayHeadline: r.overlay_headline || r.headline || '',
    overlaySubtext: r.overlay_subtext || r.subtext || '',
    overlayCta: r.overlay_cta || r.cta_text || '',
    displayMode: r.display_mode || 'SINGLE',
    transitionSpeed: r.transition_speed || 5,
    status: r.status || 'ACTIVE',
  };
}

// ── Video file upload (bucket: "videos") ──
export const MAX_VIDEO_BYTES = 104857600; // 100MB
const VIDEO_TYPES_BY_EXT = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };

/**
 * Validate and upload a video file to the "videos" bucket.
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export async function uploadVideoFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const sizeMB = (file.size / 1048576).toFixed(1);

  if (!VIDEO_TYPES_BY_EXT[ext]) {
    return { url: null, error: `Unsupported file "${file.name}" (${sizeMB} MB). Only MP4, WebM or MOV are allowed.` };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { url: null, error: `"${file.name}" is ${sizeMB} MB. Maximum allowed size is 100 MB.` };
  }

  const contentType = Object.values(VIDEO_TYPES_BY_EXT).includes(file.type) ? file.type : VIDEO_TYPES_BY_EXT[ext];
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKETS.VIDEOS)
    .upload(path, file, { contentType, cacheControl: '3600', upsert: false });

  if (error) {
    console.error(error.message, error.details, error.hint, error.code);
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(BUCKETS.VIDEOS).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

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
      .insert(toVideoRow(videoData))
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(error.message, error.details, error.hint, error.code);
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
      // Only real columns; videos has no updated_at in the schema migrations
      .update(toVideoRow(updates))
      .eq('id', videoId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(error.message, error.details, error.hint, error.code);
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
