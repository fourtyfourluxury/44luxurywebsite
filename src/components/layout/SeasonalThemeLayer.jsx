import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Eye } from 'lucide-react';
import {
  ANNOUNCEMENT_DISMISS_PREFIX,
  PREVIEW_THEME_STORAGE_KEY,
  SEASONAL_THEME_UPDATED_EVENT,
  sanitizeThemeTokens,
  sanitizeDecorationsArray,
  sanitizeIntensity,
  sanitizeOrnamentSide,
  isThemeWithinWindow,
  isCheckoutOrPaymentPath,
  isAdminPath,
  isAuthPath,
  applyThemeToDom,
  clearThemeFromDom,
  saveThemeCache,
  readThemeCache,
  clearThemeCache,
  fetchActiveTheme,
  fetchPreviewThemeBySlug,
} from '../../services/themeService';

// Lazy-load the entire decoration library so a theme with no decorations costs 0 KB
const LazyDecorationStage = lazy(() => import('../decorations/DecorationStage'));

function getPreviewSlugFromUrlOrSession(search = '') {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(search || window.location.search);
    const fromQuery = params.get('previewTheme');
    if (fromQuery && fromQuery.trim()) {
      const clean = fromQuery.trim();
      window.sessionStorage.setItem(PREVIEW_THEME_STORAGE_KEY, clean);
      return clean;
    }
    return window.sessionStorage.getItem(PREVIEW_THEME_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function useSeasonalThemeState() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rawActiveTheme, setRawActiveTheme] = useState(() => readThemeCache());
  const [previewTheme, setPreviewTheme] = useState(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [dismissedSlug, setDismissedSlug] = useState(null);

  const isAdmin = isAdminPath(location.pathname);
  const isCheckoutOrPayment = isCheckoutOrPaymentPath(location.pathname);
  const isAuth = isAuthPath(location.pathname);

  const loadThemeState = useCallback(async () => {
    const previewSlug = getPreviewSlugFromUrlOrSession(location.search);
    if (previewSlug) {
      const { theme: pTheme } = await fetchPreviewThemeBySlug(previewSlug);
      if (pTheme) {
        setPreviewTheme(pTheme);
        return;
      }
      try {
        window.sessionStorage.removeItem(PREVIEW_THEME_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      setPreviewTheme(null);
    } else {
      setPreviewTheme(null);
    }

    const { theme, error } = await fetchActiveTheme();
    if (error) {
      setRawActiveTheme(null);
      clearThemeCache();
      return;
    }

    if (theme && theme.is_active) {
      setRawActiveTheme(theme);
      if (isThemeWithinWindow(theme)) {
        saveThemeCache(theme);
      } else {
        clearThemeCache();
      }
    } else {
      setRawActiveTheme(null);
      clearThemeCache();
    }
  }, [location.search]);

  // Initial fetch + refetch on tab focus / visibilitychange / admin update event
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadThemeState();

    const handleFocus = () => {
      setNowTick(Date.now());
      loadThemeState();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setNowTick(Date.now());
        loadThemeState();
      }
    };
    const handleCustomUpdate = () => {
      setNowTick(Date.now());
      loadThemeState();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener(SEASONAL_THEME_UPDATED_EVENT, handleCustomUpdate);

    // Re-check the schedule window every 60 seconds so a theme turns itself on/off at starts_at/ends_at without reload
    const intervalId = window.setInterval(() => {
      setNowTick(Date.now());
    }, 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener(SEASONAL_THEME_UPDATED_EVENT, handleCustomUpdate);
      window.clearInterval(intervalId);
    };
  }, [loadThemeState]);

  // Determine the effective theme currently applicable
  const isActiveWithinWindow =
    rawActiveTheme &&
    rawActiveTheme.is_active &&
    isThemeWithinWindow(rawActiveTheme, nowTick);

  const effectiveTheme = previewTheme || (isActiveWithinWindow ? rawActiveTheme : null);

  // Sync DOM attributes & CSS variables
  useEffect(() => {
    if (isAdmin) {
      clearThemeFromDom();
      return;
    }
    if (effectiveTheme) {
      const allowDarkPalette = !isCheckoutOrPayment && !isAuth;
      applyThemeToDom(effectiveTheme, { allowDarkPalette });
      if (!previewTheme) {
        saveThemeCache(effectiveTheme);
      }
    } else {
      clearThemeFromDom();
      if (!previewTheme) {
        clearThemeCache();
      }
    }
  }, [effectiveTheme, previewTheme, isAdmin, isCheckoutOrPayment, isAuth, nowTick]);

  // Check sessionStorage dismissal when effectiveTheme slug changes
  const activeSlug = effectiveTheme?.slug || null;
  const isAnnouncementDismissed = (() => {
    if (!activeSlug) return true;
    if (dismissedSlug === activeSlug) return true;
    if (typeof window === 'undefined' || !window.sessionStorage) return false;
    try {
      return window.sessionStorage.getItem(`${ANNOUNCEMENT_DISMISS_PREFIX}${activeSlug}`) === '1';
    } catch {
      return false;
    }
  })();

  const dismissAnnouncement = useCallback(() => {
    if (!activeSlug) return;
    setDismissedSlug(activeSlug);
    try {
      window.sessionStorage.setItem(`${ANNOUNCEMENT_DISMISS_PREFIX}${activeSlug}`, '1');
    } catch {
      // Ignore storage errors
    }
  }, [activeSlug]);

  const exitPreview = useCallback(() => {
    try {
      window.sessionStorage.removeItem(PREVIEW_THEME_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setPreviewTheme(null);
    const params = new URLSearchParams(location.search);
    params.delete('previewTheme');
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  return {
    effectiveTheme,
    isPreview: Boolean(previewTheme),
    isAdmin,
    isCheckoutOrPayment,
    isAuth,
    isAnnouncementDismissed,
    dismissAnnouncement,
    exitPreview,
  };
}

/**
 * Slim seasonal announcement bar rendered inside the sticky <header> above Navbar
 * so it reserves its height and never shifts the sticky header.
 * Also manages the storefront seasonal theme lifecycle, lazy decoration stage, and preview pill.
 */
export function SeasonalAnnouncementBar() {
  const {
    effectiveTheme: theme,
    isPreview,
    isAdmin,
    isCheckoutOrPayment,
    isAuth,
    isAnnouncementDismissed,
    dismissAnnouncement: onDismiss,
    exitPreview: onExitPreview,
  } = useSeasonalThemeState();

  const hidden = isAdmin || isCheckoutOrPayment || isAnnouncementDismissed;
  const tokens = theme ? sanitizeThemeTokens(theme.tokens) : null;
  const text = theme?.announcement_text ? String(theme.announcement_text).trim() : '';
  const link = theme?.announcement_link ? String(theme.announcement_link).trim() : '';
  const isInternalLink = link.startsWith('/');

  const activeDecorations = theme
    ? sanitizeDecorationsArray(theme.decorations, theme.decoration)
    : [];
  const shouldRenderDecorations =
    !isAdmin && !isCheckoutOrPayment && !isAuth && activeDecorations.length > 0;

  const content = (
    <span className="font-grotesk text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] underline-offset-4 hover:underline">
      {text}
    </span>
  );

  return (
    <>
      {!hidden && theme && text && tokens && (
        <div
          role="region"
          aria-label="Seasonal announcement"
          className="w-full min-h-[36px] px-4 py-2 flex items-center justify-center relative select-none border-b border-black/10"
          style={{
            backgroundColor: tokens.banner_bg,
            color: tokens.banner_text,
          }}
        >
          <div className="max-w-[1440px] mx-auto pr-7 text-center leading-tight">
            {link ? (
              isInternalLink ? (
                <Link to={link} className="inline-flex items-center gap-1.5" style={{ color: tokens.banner_text }}>
                  {content}
                </Link>
              ) : (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                  style={{ color: tokens.banner_text }}
                >
                  {content}
                </a>
              )
            ) : (
              <span className="font-grotesk text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]">
                {text}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss seasonal announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: tokens.banner_text }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {shouldRenderDecorations && (
        <Suspense fallback={null}>
          <LazyDecorationStage
            decorations={activeDecorations}
            legacyDecoration={theme?.decoration}
            intensity={sanitizeIntensity(theme?.decoration_intensity)}
            ornamentSide={sanitizeOrnamentSide(theme?.ornament_side)}
            tokens={tokens}
            themeSlug={theme?.slug || ''}
            avoidPreviewPill={isPreview}
          />
        </Suspense>
      )}

      {!isAdmin && isPreview && theme && (
        <div
          role="status"
          className="fixed bottom-5 left-5 z-[2100] flex items-center gap-3 bg-[#141410] text-[#fcf9f3] border border-white/20 shadow-2xl px-3.5 py-2 text-[11px] font-grotesk"
        >
          <span
            className="w-2.5 h-2.5 shrink-0 border border-white/30"
            style={{ backgroundColor: tokens?.accent || '#4b0e1e' }}
          />
          <Eye size={13} className="text-[#c9a96e] shrink-0" />
          <span className="uppercase tracking-wider font-bold">
            Theme preview: {theme.name}
          </span>
          <button
            type="button"
            onClick={onExitPreview}
            className="ml-1 px-2 py-0.5 bg-white/10 hover:bg-white/20 text-[#fcf9f3] text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Exit
          </button>
        </div>
      )}
    </>
  );
}
