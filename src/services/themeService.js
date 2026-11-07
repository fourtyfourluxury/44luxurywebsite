import { supabase } from '../lib/supabase';
import { NO_ADMIN_SESSION_MESSAGE } from './saleService';

export const THEME_CACHE_KEY = '44luxury_active_theme_cache_v1';
export const PREVIEW_THEME_STORAGE_KEY = '44luxury_preview_theme_slug';
export const ANNOUNCEMENT_DISMISS_PREFIX = '44luxury_theme_bar_dismissed_';
export const SEASONAL_THEME_UPDATED_EVENT = '44luxury:seasonal-theme-updated';

export function notifySeasonalThemeUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SEASONAL_THEME_UPDATED_EVENT));
  }
}

export const ORIGINAL_THEME_TOKENS = Object.freeze({
  accent: '#4b0e1e',
  accent_hover: '#2c000b',
  accent_contrast: '#fcf9f3',
  banner_bg: '#1c1c18',
  banner_text: '#fcf9f3',
});

export const ORIGINAL_PAGE_TOKENS = Object.freeze({
  page_bg: '#fcf9f3',
  surface_bg: '#f1eee7',
  text: '#1c1c18',
  text_muted: '#5f5e5e',
  border: '#dad6cd',
});

export const DARK_PALETTE_KEYS = ['page_bg', 'surface_bg', 'text', 'text_muted', 'border'];

export const VALID_DECORATIONS = ['none', 'snow', 'confetti', 'hearts', 'sparkle'];

export const FALLING_DECORATION_KEYS = [
  'snow',
  'confetti',
  'hearts',
  'petals',
  'sparkle',
  'fireworks',
  'ribbons',
  'bats',
];

export const HEADER_CHARACTER_KEYS = [
  'santa_pair',
  'bunny_pair',
  'ghost_pair',
  'cupid_pair',
  'party_pair',
  'flag_pair',
  'crescent_pair',
  'tag_pair',
];

export const ORNAMENT_DECORATION_KEYS = [
  'christmas_tree',
  'string_lights',
  'ornaments',
  'flower_border',
  'easter_eggs',
  'rose_corners',
  'crescent_stars',
  'lanterns',
  'pumpkin_corner',
  'cobweb_corner',
  'easter_basket',
  'chicks',
  'teddy',
  'black_cat',
  'spiderwebs',
  'mosque_skyline',
  'bunting',
  'disco_ball',
  'balloons',
  'price_tags',
  'fog',
];

export const SURPRISE_DECORATION_KEYS = [
  'sleigh',
  'elf_peek',
  'bunny_hop',
  'ghosts',
  'spiders',
  'cupid_arrow',
  'party_poppers',
  'shooting_stars',
];

export const ALLOWED_DECORATION_KEYS = [
  ...FALLING_DECORATION_KEYS,
  ...HEADER_CHARACTER_KEYS,
  ...ORNAMENT_DECORATION_KEYS,
  ...SURPRISE_DECORATION_KEYS,
];

export const PHONE_ALLOWED_DECORATION_KEYS = [
  ...FALLING_DECORATION_KEYS,
  'string_lights',
  'bunting',
  'flower_border',
  'fog',
  'sparkle',
  'shooting_stars',
];

export const VALID_INTENSITIES = ['low', 'medium', 'high'];
export const VALID_ORNAMENT_SIDES = ['left', 'right'];

export function sanitizeDecorationsArray(rawDecorations, legacyDecoration = 'none') {
  const list = Array.isArray(rawDecorations)
    ? rawDecorations
        .map((k) => String(k || '').trim().toLowerCase())
        .filter((k) => ALLOWED_DECORATION_KEYS.includes(k))
    : [];
  const unique = Array.from(new Set(list));
  if (unique.length > 0) return unique;

  const leg = String(legacyDecoration || '').trim().toLowerCase();
  if (leg && leg !== 'none' && ALLOWED_DECORATION_KEYS.includes(leg)) {
    return [leg];
  }
  return [];
}

export function sanitizeIntensity(val) {
  const clean = String(val || '').trim().toLowerCase();
  return VALID_INTENSITIES.includes(clean) ? clean : 'medium';
}

export function sanitizeOrnamentSide(val) {
  const clean = String(val || '').trim().toLowerCase();
  return VALID_ORNAMENT_SIDES.includes(clean) ? clean : 'left';
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHexColor(value) {
  if (typeof value !== 'string') return false;
  return HEX_COLOR_REGEX.test(value.trim());
}

export function expandHexColor(hex, fallback = '#000000') {
  if (!isValidHexColor(hex)) return fallback;
  const clean = hex.trim().toLowerCase();
  if (clean.length === 4) {
    const r = clean[1];
    const g = clean[2];
    const b = clean[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return clean;
}

export function sanitizeThemeTokens(rawTokens = {}) {
  const t = rawTokens && typeof rawTokens === 'object' ? rawTokens : {};
  const result = {
    accent: isValidHexColor(t.accent)
      ? expandHexColor(t.accent, ORIGINAL_THEME_TOKENS.accent)
      : ORIGINAL_THEME_TOKENS.accent,
    accent_hover: isValidHexColor(t.accent_hover)
      ? expandHexColor(t.accent_hover, ORIGINAL_THEME_TOKENS.accent_hover)
      : ORIGINAL_THEME_TOKENS.accent_hover,
    accent_contrast: isValidHexColor(t.accent_contrast)
      ? expandHexColor(t.accent_contrast, ORIGINAL_THEME_TOKENS.accent_contrast)
      : ORIGINAL_THEME_TOKENS.accent_contrast,
    banner_bg: isValidHexColor(t.banner_bg)
      ? expandHexColor(t.banner_bg, ORIGINAL_THEME_TOKENS.banner_bg)
      : ORIGINAL_THEME_TOKENS.banner_bg,
    banner_text: isValidHexColor(t.banner_text)
      ? expandHexColor(t.banner_text, ORIGINAL_THEME_TOKENS.banner_text)
      : ORIGINAL_THEME_TOKENS.banner_text,
  };

  for (const key of DARK_PALETTE_KEYS) {
    if (isValidHexColor(t[key])) {
      result[key] = expandHexColor(t[key]);
    }
  }

  return result;
}

/**
 * Validate contrast of optional dark palette tokens:
 * - text against page_bg >= 4.5:1
 * - text against surface_bg >= 4.5:1
 * - accent against page_bg >= 3:1
 * Otherwise ignore the offending token and fall back to the original value.
 */
export function resolveDarkPaletteTokens(rawTokens = {}) {
  const safe = sanitizeThemeTokens(rawTokens);
  if (!safe.page_bg || !isValidHexColor(safe.page_bg)) {
    return {
      isDark: false,
      accent: safe.accent,
      page_bg: ORIGINAL_PAGE_TOKENS.page_bg,
      surface_bg: ORIGINAL_PAGE_TOKENS.surface_bg,
      text: ORIGINAL_PAGE_TOKENS.text,
      text_muted: ORIGINAL_PAGE_TOKENS.text_muted,
      border: ORIGINAL_PAGE_TOKENS.border,
    };
  }

  const candidatePageBg = safe.page_bg;
  const candidateText = safe.text || '#fcf9f3';

  // text vs page_bg must be at least 4.5:1; otherwise ignore offending dark palette tokens and fall back to original
  if (getContrastRatio(candidateText, candidatePageBg) < 4.5) {
    return {
      isDark: false,
      accent: safe.accent,
      page_bg: ORIGINAL_PAGE_TOKENS.page_bg,
      surface_bg: ORIGINAL_PAGE_TOKENS.surface_bg,
      text: ORIGINAL_PAGE_TOKENS.text,
      text_muted: ORIGINAL_PAGE_TOKENS.text_muted,
      border: ORIGINAL_PAGE_TOKENS.border,
    };
  }

  // text vs surface_bg must be at least 4.5:1; otherwise ignore offending surface_bg token
  const candidateSurface = safe.surface_bg || candidatePageBg;
  const validSurface =
    getContrastRatio(candidateText, candidateSurface) >= 4.5
      ? candidateSurface
      : getContrastRatio(candidateText, ORIGINAL_PAGE_TOKENS.surface_bg) >= 4.5
        ? ORIGINAL_PAGE_TOKENS.surface_bg
        : candidatePageBg;

  // accent vs page_bg must be at least 3.0:1; otherwise ignore offending accent and fall back to original (or readable fallback)
  let validAccent = safe.accent;
  if (getContrastRatio(validAccent, candidatePageBg) < 3.0) {
    validAccent =
      getContrastRatio(ORIGINAL_THEME_TOKENS.accent, candidatePageBg) >= 3.0
        ? ORIGINAL_THEME_TOKENS.accent
        : '#f97316';
  }

  const validTextMuted = safe.text_muted || ORIGINAL_PAGE_TOKENS.text_muted;
  const validBorder = safe.border || ORIGINAL_PAGE_TOKENS.border;

  return {
    isDark: true,
    accent: validAccent,
    page_bg: candidatePageBg,
    surface_bg: validSurface,
    text: candidateText,
    text_muted: validTextMuted,
    border: validBorder,
  };
}

function hexToRgb(hex) {
  const full = expandHexColor(hex, null);
  if (!full) return null;
  const num = parseInt(full.slice(1), 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function relativeLuminance({ r, g, b }) {
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Compute WCAG 2.1 contrast ratio between two hex colors (1.0 to 21.0)
 */
export function getContrastRatio(hexA, hexB) {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return 21;
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function slugifyThemeName(name = '') {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns true if the theme's schedule window includes `nowMs`.
 * Ignores `is_active` so it can also be used to check whether a cached or previewed
 * theme is within its valid date window.
 */
export function isThemeWithinWindow(theme, nowMs = Date.now()) {
  if (!theme) return false;
  if (theme.starts_at) {
    const startMs = new Date(theme.starts_at).getTime();
    if (!Number.isNaN(startMs) && nowMs < startMs) {
      return false;
    }
  }
  if (theme.ends_at) {
    const endMs = new Date(theme.ends_at).getTime();
    if (!Number.isNaN(endMs) && nowMs >= endMs) {
      return false;
    }
  }
  return true;
}

/**
 * Returns the display status for a theme card:
 * 'Live' | 'Scheduled' | 'Ended' | 'Off'
 */
export function getThemeStatus(theme, nowMs = Date.now()) {
  if (!theme) return 'Off';
  if (theme.ends_at) {
    const endMs = new Date(theme.ends_at).getTime();
    if (!Number.isNaN(endMs) && nowMs >= endMs) {
      return 'Ended';
    }
  }
  if (!theme.is_active) {
    return 'Off';
  }
  if (theme.starts_at) {
    const startMs = new Date(theme.starts_at).getTime();
    if (!Number.isNaN(startMs) && nowMs < startMs) {
      return 'Scheduled';
    }
  }
  return 'Live';
}

export function isCheckoutOrPaymentPath(pathname = '') {
  const p = String(pathname || '').toLowerCase();
  return (
    p === '/checkout' ||
    p.startsWith('/checkout/') ||
    p === '/order-confirmed' ||
    p.startsWith('/order-confirmed/') ||
    p === '/payment' ||
    p.startsWith('/payment/')
  );
}

export function isAdminPath(pathname = '') {
  const p = String(pathname || '').toLowerCase();
  return p === '/admin' || p.startsWith('/admin/');
}

export function isAuthPath(pathname = '') {
  const p = String(pathname || '').toLowerCase();
  return p === '/auth' || p.startsWith('/auth/');
}

const THEME_CSS_VARS = [
  '--theme-accent',
  '--theme-accent-hover',
  '--theme-accent-contrast',
  '--theme-banner-bg',
  '--theme-banner-text',
  '--theme-page-bg',
  '--theme-surface-bg',
  '--theme-text',
  '--theme-text-muted',
  '--theme-border',
  '--accent',
  '--accent-hover',
  '--accent-contrast',
  '--banner-bg',
  '--banner-text',
  '--page-bg',
  '--surface-bg',
  '--text',
  '--text-muted',
  '--border',
];

/**
 * Apply seasonal theme CSS variables and `data-season="<slug>"` on document.documentElement.
 */
export function applyThemeToDom(theme, { allowDarkPalette = true } = {}) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!theme || !theme.slug) {
    clearThemeFromDom();
    return;
  }

  const tokens = sanitizeThemeTokens(theme.tokens);
  const darkResolved = resolveDarkPaletteTokens(theme.tokens);
  const effectiveAccent =
    allowDarkPalette && darkResolved.isDark ? darkResolved.accent : tokens.accent;

  root.setAttribute('data-season', String(theme.slug));

  root.style.setProperty('--theme-accent', effectiveAccent);
  root.style.setProperty('--theme-accent-hover', tokens.accent_hover);
  root.style.setProperty('--theme-accent-contrast', tokens.accent_contrast);
  root.style.setProperty('--theme-banner-bg', tokens.banner_bg);
  root.style.setProperty('--theme-banner-text', tokens.banner_text);

  root.style.setProperty('--accent', effectiveAccent);
  root.style.setProperty('--accent-hover', tokens.accent_hover);
  root.style.setProperty('--accent-contrast', tokens.accent_contrast);
  root.style.setProperty('--banner-bg', tokens.banner_bg);
  root.style.setProperty('--banner-text', tokens.banner_text);

  if (allowDarkPalette && darkResolved.isDark) {
    root.setAttribute('data-theme-dark', 'true');
    root.style.colorScheme = 'dark';
    root.style.setProperty('--theme-page-bg', darkResolved.page_bg);
    root.style.setProperty('--theme-surface-bg', darkResolved.surface_bg);
    root.style.setProperty('--theme-text', darkResolved.text);
    root.style.setProperty('--theme-text-muted', darkResolved.text_muted);
    root.style.setProperty('--theme-border', darkResolved.border);
    root.style.setProperty('--page-bg', darkResolved.page_bg);
    root.style.setProperty('--surface-bg', darkResolved.surface_bg);
    root.style.setProperty('--text', darkResolved.text);
    root.style.setProperty('--text-muted', darkResolved.text_muted);
    root.style.setProperty('--border', darkResolved.border);
  } else {
    root.removeAttribute('data-theme-dark');
    root.style.removeProperty('color-scheme');
    root.style.removeProperty('--theme-page-bg');
    root.style.removeProperty('--theme-surface-bg');
    root.style.removeProperty('--theme-text');
    root.style.removeProperty('--theme-text-muted');
    root.style.removeProperty('--theme-border');
    root.style.removeProperty('--page-bg');
    root.style.removeProperty('--surface-bg');
    root.style.removeProperty('--text');
    root.style.removeProperty('--text-muted');
    root.style.removeProperty('--border');
  }
}

/**
 * Remove seasonal theme CSS variable overrides and `data-season` attribute from document.documentElement,
 * restoring the original theme values immediately.
 */
export function clearThemeFromDom() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.removeAttribute('data-season');
  root.removeAttribute('data-theme-dark');
  root.style.removeProperty('color-scheme');
  for (const prop of THEME_CSS_VARS) {
    root.style.removeProperty(prop);
  }
}

export function saveThemeCache(theme) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (!theme || !theme.slug || !theme.is_active || !isThemeWithinWindow(theme)) {
      window.localStorage.removeItem(THEME_CACHE_KEY);
      return;
    }
    const decorations = sanitizeDecorationsArray(theme.decorations, theme.decoration);
    const payload = {
      id: theme.id,
      slug: theme.slug,
      name: theme.name,
      tokens: sanitizeThemeTokens(theme.tokens),
      decoration: VALID_DECORATIONS.includes(theme.decoration) ? theme.decoration : (decorations[0] || 'none'),
      decorations,
      decoration_intensity: sanitizeIntensity(theme.decoration_intensity),
      ornament_side: sanitizeOrnamentSide(theme.ornament_side),
      announcement_text: theme.announcement_text || '',
      announcement_link: theme.announcement_link || '',
      starts_at: theme.starts_at || null,
      ends_at: theme.ends_at || null,
      is_active: true,
      cached_at: Date.now(),
    };
    window.localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / private mode errors
  }
}

export function readThemeCache() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(THEME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.slug) {
      window.localStorage.removeItem(THEME_CACHE_KEY);
      return null;
    }
    if (!isThemeWithinWindow(parsed)) {
      window.localStorage.removeItem(THEME_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearThemeCache() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(THEME_CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Synchronously apply cached active theme before first React paint to prevent a flash of wrong colors.
 */
export function applyCachedThemeBeforePaint() {
  if (typeof window === 'undefined') return null;
  const pathname = window.location?.pathname || '/';
  if (isAdminPath(pathname)) {
    clearThemeFromDom();
    return null;
  }
  const allowDarkPalette = !isCheckoutOrPaymentPath(pathname) && !isAuthPath(pathname);
  const cached = readThemeCache();
  if (cached) {
    applyThemeToDom(cached, { allowDarkPalette });
    return cached;
  }
  clearThemeFromDom();
  return null;
}

function logSupabaseError(context, error) {
  console.error(`[themeService:${context}]`, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    error,
  });
  return error?.message || 'An unexpected database error occurred.';
}

async function requireRealAdminSession(context) {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { session: null, error: logSupabaseError(`${context}:getSession`, error) };
  }
  if (!data?.session) {
    console.error(`[themeService:${context}] No active Supabase session.`);
    return { session: null, error: NO_ADMIN_SESSION_MESSAGE };
  }
  return { session: data.session, error: null };
}

/**
 * Fetch the single active theme for the storefront.
 */
export async function fetchActiveTheme() {
  try {
    const { data, error } = await supabase
      .from('site_themes')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      return { theme: null, error: logSupabaseError('fetchActiveTheme', error) };
    }
    return { theme: data || null, error: null };
  } catch (err) {
    return { theme: null, error: logSupabaseError('fetchActiveTheme', err) };
  }
}

/**
 * Fetch a theme by slug for admin preview (?previewTheme=<slug>).
 * Requires a real Supabase session so visitors cannot preview inactive themes.
 */
export async function fetchPreviewThemeBySlug(slug) {
  if (!slug) return { theme: null, error: null };
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return { theme: null, error: 'Preview requires a signed-in admin session.' };
    }
    const { data, error } = await supabase
      .from('site_themes')
      .select('*')
      .eq('slug', String(slug).trim())
      .maybeSingle();

    if (error) {
      return { theme: null, error: logSupabaseError('fetchPreviewThemeBySlug', error) };
    }
    return { theme: data || null, error: null };
  } catch (err) {
    return { theme: null, error: logSupabaseError('fetchPreviewThemeBySlug', err) };
  }
}

/**
 * Fetch all themes for the admin Seasonal Themes tab.
 */
export async function getAllThemesAdmin() {
  try {
    const { data, error } = await supabase
      .from('site_themes')
      .select('*')
      .order('is_preset', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      return { themes: [], error: logSupabaseError('getAllThemesAdmin', error) };
    }
    return { themes: data || [], error: null };
  } catch (err) {
    return { themes: [], error: logSupabaseError('getAllThemesAdmin', err) };
  }
}

/**
 * Activate a seasonal theme (or pass null to turn off all seasonal themes) via RPC.
 */
export async function activateThemeRpc(themeId = null) {
  const { error: authErr } = await requireRealAdminSession('activateThemeRpc');
  if (authErr) return { error: authErr };

  try {
    const { data, error } = await supabase.rpc('activate_theme', {
      p_id: themeId || null,
    });
    if (error) {
      return { data: null, error: logSupabaseError('activateThemeRpc', error) };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: logSupabaseError('activateThemeRpc', err) };
  }
}

/**
 * Create a new custom seasonal theme (.insert).
 */
export async function createThemeAdmin(payload) {
  const { error: authErr } = await requireRealAdminSession('createThemeAdmin');
  if (authErr) return { theme: null, error: authErr };

  try {
    const cleanDecorations = sanitizeDecorationsArray(payload.decorations, payload.decoration);
    const legacyDec = cleanDecorations.find((d) => VALID_DECORATIONS.includes(d)) || 'none';
    const row = {
      name: String(payload.name || '').trim(),
      slug: String(payload.slug || '').trim(),
      description: payload.description ? String(payload.description).trim() : null,
      is_preset: false,
      is_active: false,
      tokens: sanitizeThemeTokens(payload.tokens),
      decoration: legacyDec,
      decorations: cleanDecorations,
      decoration_intensity: sanitizeIntensity(payload.decoration_intensity),
      ornament_side: sanitizeOrnamentSide(payload.ornament_side),
      announcement_text: payload.announcement_text ? String(payload.announcement_text).trim() : null,
      announcement_link: payload.announcement_link ? String(payload.announcement_link).trim() : null,
      starts_at: payload.starts_at || null,
      ends_at: payload.ends_at || null,
    };

    const { data, error } = await supabase
      .from('site_themes')
      .insert([row])
      .select('*')
      .single();

    if (error) {
      return { theme: null, error: logSupabaseError('createThemeAdmin', error) };
    }
    return { theme: data, error: null };
  } catch (err) {
    return { theme: null, error: logSupabaseError('createThemeAdmin', err) };
  }
}

/**
 * Update an existing seasonal theme (.update).
 */
export async function updateThemeAdmin(id, payload) {
  const { error: authErr } = await requireRealAdminSession('updateThemeAdmin');
  if (authErr) return { theme: null, error: authErr };

  try {
    const cleanDecorations = sanitizeDecorationsArray(payload.decorations, payload.decoration);
    const legacyDec = cleanDecorations.find((d) => VALID_DECORATIONS.includes(d)) || 'none';
    const updates = {
      name: String(payload.name || '').trim(),
      slug: String(payload.slug || '').trim(),
      description: payload.description ? String(payload.description).trim() : null,
      tokens: sanitizeThemeTokens(payload.tokens),
      decoration: legacyDec,
      decorations: cleanDecorations,
      decoration_intensity: sanitizeIntensity(payload.decoration_intensity),
      ornament_side: sanitizeOrnamentSide(payload.ornament_side),
      announcement_text: payload.announcement_text ? String(payload.announcement_text).trim() : null,
      announcement_link: payload.announcement_link ? String(payload.announcement_link).trim() : null,
      starts_at: payload.starts_at || null,
      ends_at: payload.ends_at || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('site_themes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return { theme: null, error: logSupabaseError('updateThemeAdmin', error) };
    }
    return { theme: data, error: null };
  } catch (err) {
    return { theme: null, error: logSupabaseError('updateThemeAdmin', err) };
  }
}

/**
 * Delete a custom seasonal theme (.delete). Presets can never be deleted.
 */
export async function deleteThemeAdmin(id) {
  const { error: authErr } = await requireRealAdminSession('deleteThemeAdmin');
  if (authErr) return { error: authErr };

  try {
    const { error } = await supabase
      .from('site_themes')
      .delete()
      .eq('id', id)
      .eq('is_preset', false);

    if (error) {
      return { error: logSupabaseError('deleteThemeAdmin', error) };
    }
    return { error: null };
  } catch (err) {
    return { error: logSupabaseError('deleteThemeAdmin', err) };
  }
}
