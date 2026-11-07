import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';

const isVideo = (url = '') => /\.(mp4|webm|mov)$/i.test(url) || url.includes('/video/');
const isSlideVideo = (s) => s?.media_type === 'video' || (!s?.media_type && isVideo(s?.video_url || s?.image));

const devLog = (...args) => {
  if (import.meta.env.DEV) {
    console.debug('[HeroSlider]', ...args);
  }
};

function getStableSlideKey(s, fallbackIdx = 0) {
  return String(s?.id || s?.video_url || s?.image || `slide-${fallbackIdx}`);
}

function computeSlidesSignature(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list
    .map((s, i) =>
      [
        s?.id ?? i,
        s?.updated_at ?? '',
        s?.media_type ?? '',
        s?.video_url ?? '',
        s?.poster_url ?? '',
        s?.image ?? '',
        s?.headline ?? '',
        s?.subheadline ?? '',
        s?.ctaLabel ?? s?.cta_label ?? '',
        s?.ctaLink ?? s?.cta_link ?? '',
        s?.textPosition ?? s?.text_position ?? '',
        s?.objectFit ?? s?.object_fit ?? '',
        s?.objectPosition ?? s?.object_position ?? '',
        s?.duration_seconds ?? s?.duration ?? s?.seconds ?? '',
        s?.sort_order ?? i,
      ].join('~')
    )
    .join('||');
}

let cachedSlidesSig = '';
let cachedSlidesRef = [];

function getStabilizedSlides(list) {
  const safeList = Array.isArray(list) ? list : [];
  const sig = computeSlidesSignature(safeList);
  if (sig !== cachedSlidesSig) {
    cachedSlidesSig = sig;
    cachedSlidesRef = safeList;
  }
  return cachedSlidesRef;
}

function getSlideFitAndPos(s) {
  let fit = s?.objectFit || s?.object_fit || null;
  let pos = s?.objectPosition || s?.object_position || null;
  let sec = s?.duration_seconds ?? s?.duration ?? s?.seconds ?? null;
  const tp = s?.textPosition || s?.text_position || '';
  if (typeof tp === 'string' && tp.includes('|')) {
    const [tpFit, tpPos, tpSec] = tp.split('|');
    if (!fit && ['auto', 'cover', 'contain'].includes(tpFit)) fit = tpFit;
    if (!pos && tpPos) pos = tpPos;
    if ((sec === null || sec === undefined || sec === '') && tpSec) {
      const parsed = Number(tpSec);
      if (Number.isFinite(parsed) && parsed > 0) sec = parsed;
    }
  }
  const numSec = Number(sec);
  return {
    fitMode: ['auto', 'cover', 'contain'].includes(fit) ? fit : 'auto',
    focusPos: pos || 'top',
    slideSeconds: Number.isFinite(numSec) && numSec > 0 ? numSec : null,
  };
}

function mapFocusToCssPos(focusPos = 'top') {
  switch (focusPos) {
    case 'top':
      return 'center top';
    case 'bottom':
      return 'center bottom';
    case 'left':
      return 'left center';
    case 'right':
      return 'right center';
    case 'center':
      return 'center center';
    default:
      return focusPos || 'center top';
  }
}

function shouldAutoCover(mediaRatio, containerRatio, containerWidth = 1440) {
  if (!mediaRatio || !containerRatio || mediaRatio <= 0 || containerRatio <= 0) {
    return false;
  }
  if (Math.abs(mediaRatio - containerRatio) / containerRatio <= 0.20) {
    return true;
  }
  if (mediaRatio >= containerRatio && mediaRatio <= 2.0) {
    return true;
  }
  if (containerWidth > 0 && containerWidth <= 640 && containerRatio < 1 && mediaRatio >= 0.5 && mediaRatio <= 1.0) {
    return true;
  }
  return false;
}

function resolveSlideFit(fitMode, focusPos, mediaRatio, containerRatio, containerWidth = 1440) {
  const cssFocus = mapFocusToCssPos(focusPos);
  if (fitMode === 'cover') {
    return { objectFit: 'cover', objectPosition: cssFocus, useBackdrop: false };
  }
  if (fitMode === 'contain') {
    return { objectFit: 'contain', objectPosition: 'center', useBackdrop: true };
  }
  // Auto (recommended): before natural size is known, behave as Mode 2 (contain + blurred backdrop)
  const cover = shouldAutoCover(mediaRatio, containerRatio, containerWidth);
  return cover
    ? { objectFit: 'cover', objectPosition: cssFocus, useBackdrop: false }
    : { objectFit: 'contain', objectPosition: 'center', useBackdrop: true };
}

/**
 * CampaignCarousel — Premium full-bleed editorial hero
 *
 * Design language: YL Collectives
 * ─ True edge-to-edge image (no horizontal padding, no max-width box)
 * ─ Portrait-first aspect ratio (4:5) capped at 92dvh on desktop
 * ─ Text anchored bottom-left with generous padding
 * ─ Thin progress-line dot navigation (bottom-right)
 * ─ Minimal prev/next arrows (hidden on mobile, shown on hover desktop)
 * ─ Auto-advances every 1–3 s, pauses on hover, loops infinitely
 * ─ Swipe gesture support on mobile
 * ─ Next slide preloaded for smooth transitions
 */
export default function CampaignCarousel({ showAdminInfo = false, speedOverride = null, containerStyle = undefined } = {}) {
  const { heroSlides, heroSpeed, _hasHydrated } = useSiteStore();
  const [activeKey, setActiveKey] = useState(null);
  const [progress, setProgress] = useState(0);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [failedVideos, setFailedVideos] = useState({});
  const [noCorsVideos, setNoCorsVideos] = useState({});
  const [failedImages, setFailedImages] = useState({});
  const [mediaDimensions, setMediaDimensions] = useState({});
  const [videoDurations, setVideoDurations] = useState({});
  const [containerRatio, setContainerRatio] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1440);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );
  const [isInView, setIsInView] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const canvasRefs = useRef({});
  const retryTimeoutsRef = useRef({});
  const canPlayHandlersRef = useRef({});
  const activeSlideKeyRef = useRef(null);
  const watchdogStateRef = useRef({ key: null, lastTime: -1, stuckSince: 0, reloaded: false });

  // Swipe states for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Stabilize slides array across store/realtime refetches when nothing changed
  const rawSlides = getStabilizedSlides((_hasHydrated ? heroSlides : null) || []);

  // Filter out video slides that failed to load and have no fallback poster/image
  const slides = rawSlides.filter((s, idx) => {
    const key = getStableSlideKey(s, idx);
    if (!failedVideos[key]) return true;
    return Boolean(s.poster_url);
  });
  const total = slides.length;

  // Keep current slide in view when slides array changes; otherwise go to first slide (index 0)
  const foundIndex =
    total > 0 && activeKey
      ? slides.findIndex((s, i) => getStableSlideKey(s, i) === activeKey)
      : -1;
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const activeSlide = total > 0 ? slides[currentIndex] : null;
  const activeSlideKey = activeSlide ? getStableSlideKey(activeSlide, currentIndex) : null;

  const shouldPlayVideos = isTabVisible && isInView && !prefersReducedMotion;
  const shouldPlayRef = useRef(shouldPlayVideos);

  useEffect(() => {
    shouldPlayRef.current = shouldPlayVideos;
    activeSlideKeyRef.current = activeSlideKey;
  }, [shouldPlayVideos, activeSlideKey]);

  const advanceToIndex = useCallback(
    (targetIdx) => {
      if (total <= 1) return;
      const wrapped = ((targetIdx % total) + total) % total;
      const nextS = slides[wrapped];
      if (nextS) {
        setActiveKey(getStableSlideKey(nextS, wrapped));
      }
      setProgress(0);
    },
    [slides, total]
  );

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setPrefersReducedMotion(Boolean(e.matches));
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
  }, []);

  // Track tab visibility (visibilitychange)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsTabVisible(visible);
      if (visible) {
        devLog('tab visible again — resuming timer & active video');
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  // Track hero viewport intersection (pause video when scrolled out of view, resume when back)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [total, _hasHydrated]);

  const recordMediaSize = useCallback((key, width, height) => {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h || w <= 0 || h <= 0) return;
    setMediaDimensions((prev) => {
      const existing = prev[key];
      if (existing && existing.width === w && existing.height === h) return prev;
      return { ...prev, [key]: { width: w, height: h } };
    });
  }, []);

  const recordVideoDuration = useCallback((key, durationSec) => {
    const d = Number(durationSec);
    if (!Number.isFinite(d) || d <= 0) return;
    setVideoDurations((prev) => {
      if (prev[key] && Math.abs(prev[key] - d) < 0.05) return prev;
      return { ...prev, [key]: d };
    });
  }, []);

  const drawVideoToBackdropCanvas = useCallback((slideKey) => {
    if (!slideKey) return;
    const videoEl = videoRefs.current[slideKey];
    const canvasEl = canvasRefs.current[slideKey];
    if (!videoEl || !canvasEl || videoEl.readyState < 2) return;
    try {
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    } catch {
      // If canvas draw fails, poster/dark background fallback behind the canvas remains visible
    }
  }, []);

  const clearVideoRetry = useCallback((slideKey) => {
    if (retryTimeoutsRef.current[slideKey]) {
      clearTimeout(retryTimeoutsRef.current[slideKey]);
      delete retryTimeoutsRef.current[slideKey];
    }
    const videoEl = videoRefs.current[slideKey];
    const handler = canPlayHandlersRef.current[slideKey];
    if (videoEl && handler) {
      videoEl.removeEventListener('canplay', handler);
      delete canPlayHandlersRef.current[slideKey];
    }
  }, []);

  const safePlayVideo = useCallback(
    (el, slideKey, resetToStart = false) => {
      if (!el || !shouldPlayRef.current) return;
      clearVideoRetry(slideKey);
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
      if (resetToStart) {
        try {
          el.currentTime = 0;
        } catch {
          // Ignore if not seekable yet
        }
      }
      let playPromise;
      try {
        playPromise = el.play();
      } catch (err) {
        devLog('play() synchronous error for', slideKey, err?.message);
        return;
      }
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          devLog('play() rejected for', slideKey, err?.message || err);
          if (!shouldPlayRef.current || activeSlideKeyRef.current !== slideKey) return;

          // Retry once on 'canplay', then after 500 ms
          const onCanPlay = () => {
            delete canPlayHandlersRef.current[slideKey];
            if (!shouldPlayRef.current || activeSlideKeyRef.current !== slideKey) return;
            el.muted = true;
            el.defaultMuted = true;
            el.play?.().catch((e2) => devLog('canplay retry rejected for', slideKey, e2?.message));
          };
          canPlayHandlersRef.current[slideKey] = onCanPlay;
          el.addEventListener('canplay', onCanPlay, { once: true });

          retryTimeoutsRef.current[slideKey] = setTimeout(() => {
            delete retryTimeoutsRef.current[slideKey];
            if (!shouldPlayRef.current || activeSlideKeyRef.current !== slideKey) return;
            if (el.paused) {
              el.muted = true;
              el.defaultMuted = true;
              el.play?.().catch((e3) => devLog('500ms retry rejected for', slideKey, e3?.message));
            }
          }, 500);
        });
      }
    },
    [clearVideoRetry]
  );

  // Cleanup any pending play() retry timers on unmount
  useEffect(() => {
    const retryMap = retryTimeoutsRef.current;
    return () => {
      Object.keys(retryMap).forEach(clearVideoRetry);
    };
  }, [clearVideoRetry]);

  // Observe hero container size so aspect-ratio comparison updates on resize & breakpoint change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateRatio = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerRatio(rect.width / rect.height);
        setContainerWidth(rect.width);
      }
    };

    updateRatio();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateRatio) : null;
    ro?.observe(el);
    window.addEventListener('resize', updateRatio);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateRatio);
    };
  }, [total, _hasHydrated]);

  const prevSlideKeyForResetRef = useRef(null);

  // Play only the active video slide; pause all others; update 64x36 backdrop canvas at ~12.5 fps
  useEffect(() => {
    const slideChanged = prevSlideKeyForResetRef.current !== activeSlideKey;
    prevSlideKeyForResetRef.current = activeSlideKey;
    if (slideChanged && activeSlideKey) {
      devLog('slide change ->', currentIndex, activeSlideKey);
      watchdogStateRef.current = {
        key: activeSlideKey,
        lastTime: -1,
        stuckSince: Date.now(),
        reloaded: false,
      };
    }

    Object.entries(videoRefs.current).forEach(([key, el]) => {
      if (!el) return;
      el.muted = true;
      el.defaultMuted = true;
      if (key === activeSlideKey && shouldPlayVideos) {
        safePlayVideo(el, key, slideChanged);
      } else {
        clearVideoRetry(key);
        el.pause?.();
      }
    });

    let active = true;
    let rvfcId = null;
    let lastDraw = 0;
    const activeVideo = activeSlideKey ? videoRefs.current[activeSlideKey] : null;

    drawVideoToBackdropCanvas(activeSlideKey);

    if (activeVideo && typeof activeVideo.requestVideoFrameCallback === 'function') {
      const onFrame = (now) => {
        if (!active) return;
        if (now - lastDraw >= 70) {
          lastDraw = now;
          drawVideoToBackdropCanvas(activeSlideKey);
        }
        rvfcId = activeVideo.requestVideoFrameCallback(onFrame);
      };
      rvfcId = activeVideo.requestVideoFrameCallback(onFrame);
    }

    const timerId = setInterval(() => {
      drawVideoToBackdropCanvas(activeSlideKey);
    }, 80);

    return () => {
      active = false;
      clearInterval(timerId);
      if (rvfcId !== null && activeVideo && typeof activeVideo.cancelVideoFrameCallback === 'function') {
        activeVideo.cancelVideoFrameCallback(rvfcId);
      }
    };
  }, [activeSlideKey, currentIndex, shouldPlayVideos, total, safePlayVideo, clearVideoRetry, drawVideoToBackdropCanvas]);

  // Lightweight watchdog (every 2 seconds): keep active video moving or recover/advance
  useEffect(() => {
    const watchdogId = setInterval(() => {
      if (!shouldPlayRef.current || !activeSlide || !activeSlideKey) return;
      const isVid = isSlideVideo(activeSlide) && !failedVideos[activeSlideKey];
      if (!isVid) return;

      const el = videoRefs.current[activeSlideKey];
      if (!el) return;

      if (el.paused) {
        devLog('watchdog: active video is paused, calling play()', activeSlideKey);
        safePlayVideo(el, activeSlideKey, false);
      }

      const now = Date.now();
      const ws = watchdogStateRef.current;
      const curTime = Number(el.currentTime || 0);

      if (ws.key !== activeSlideKey) {
        watchdogStateRef.current = {
          key: activeSlideKey,
          lastTime: curTime,
          stuckSince: now,
          reloaded: false,
        };
        return;
      }

      if (Math.abs(curTime - ws.lastTime) > 0.05) {
        ws.lastTime = curTime;
        ws.stuckSince = now;
        ws.reloaded = false;
        return;
      }

      // currentTime has not moved for 4 seconds
      if (now - ws.stuckSince >= 4000) {
        if (!ws.reloaded) {
          devLog('watchdog: video currentTime stuck for 4s, reloading source', activeSlideKey);
          ws.reloaded = true;
          ws.stuckSince = now;
          try {
            el.load?.();
          } catch {
            // Ignore load errors
          }
          safePlayVideo(el, activeSlideKey, false);
        } else {
          devLog('watchdog: video still stuck after reload, advancing to next slide', activeSlideKey);
          ws.stuckSince = now;
          if (total > 1) {
            advanceToIndex(currentIndex + 1);
          }
        }
      }
    }, 2000);

    return () => clearInterval(watchdogId);
  }, [activeSlide, activeSlideKey, failedVideos, total, currentIndex, safePlayVideo, advanceToIndex]);

  // Single timing rule for both image and video slides:
  // 1. Per-slide seconds if configured on the slide
  // 2. Otherwise global autoplay seconds (speedOverride ?? heroSpeed) if configured (> 0)
  // 3. Otherwise, for a video slide with no seconds configured, video metadata duration (clamped 5–30s)
  // 4. Otherwise 5 seconds default
  const { slideSeconds: activePerSlideSec } = activeSlide
    ? getSlideFitAndPos(activeSlide)
    : { slideSeconds: null };
  const rawGlobalSpeed = Number(speedOverride ?? heroSpeed);
  const configuredGlobalSec =
    Number.isFinite(rawGlobalSpeed) && rawGlobalSpeed > 0
      ? Math.min(Math.max(rawGlobalSpeed, 1), 120)
      : null;

  const isActiveVideoSlide = Boolean(
    activeSlide && isSlideVideo(activeSlide) && !failedVideos[activeSlideKey]
  );
  const loadedVideoDurationSec = activeSlideKey ? videoDurations[activeSlideKey] : null;
  const fallbackVideoMetaSec =
    isActiveVideoSlide && loadedVideoDurationSec
      ? Math.min(Math.max(loadedVideoDurationSec, 5), 30)
      : null;

  const activeSlideDurationSec = activePerSlideSec
    ? Math.min(Math.max(activePerSlideSec, 1), 120)
    : (configuredGlobalSec ?? fallbackVideoMetaSec ?? 5);
  const activeSlideDurationMs = activeSlideDurationSec * 1000;

  // ── Auto-advance (one setTimeout per slide; pauses ONLY when tab hidden or out of view) ──
  useEffect(() => {
    if (total <= 1 || !isTabVisible || !isInView) return;

    const duration = activeSlideDurationMs;
    let progressId = null;

    if (showAdminInfo) {
      const startTime = Date.now();
      progressId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min((elapsed / duration) * 100, 100);
        setProgress(pct);
      }, 50);
    }

    const slideTimeoutId = setTimeout(() => {
      advanceToIndex(currentIndex + 1);
    }, duration);

    return () => {
      clearTimeout(slideTimeoutId);
      if (progressId) clearInterval(progressId);
    };
  }, [total, activeSlideDurationMs, isTabVisible, isInView, currentIndex, timerResetKey, showAdminInfo, advanceToIndex]);

  // ── Navigation helpers (keep carousel running and restart timer) ─────────────
  const goTo = (index) => {
    if (total <= 1) return;
    advanceToIndex(index);
    setTimerResetKey((k) => k + 1);
  };

  const nextSlide = () => goTo(currentIndex + 1);
  const prevSlide = () => goTo(currentIndex - 1);

  const handleKeyDown = (e) => {
    if (total <= 1) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  // ── Swipe handlers ───────────────────────────────────────────────────────────
  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove  = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd   = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 48) delta > 0 ? nextSlide() : prevSlide();
  };

  if (slides.length === 0) {
    if (!_hasHydrated) {
      return (
        <section className="w-full bg-[#1c1c18]">
          <div className="hero-widget-container" />
        </section>
      );
    }
    return null;
  }

  const nextIndex = (currentIndex + 1) % total;

  return (
    <section className="w-full bg-[#1c1c18] group">
      {/* ── Preload next slide ─────────────────────────────────── */}
      {slides[nextIndex] && !isSlideVideo(slides[nextIndex]) && slides[nextIndex].image && (
        <link rel="preload" as="image" href={slides[nextIndex].image} />
      )}

      {/*
        Single source of truth for hero container size (.hero-widget-container in index.css):
        height: var(--hero-height) = clamp(500px, calc(100vw / 0.8), 1400px).
        Every slide (image or video) adapts automatically to this container.
      */}
      <div
        ref={containerRef}
        className="hero-widget-container focus:outline-none"
        style={containerStyle}
        tabIndex={total > 1 ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Slides ──────────────────────────────────────────────────────── */}
        {slides.map((s, i) => {
          const isCurrent = i === currentIndex;
          const isNext = i === nextIndex;
          const slideKey = getStableSlideKey(s, i);
          const showVideo = isSlideVideo(s) && !failedVideos[slideKey];
          const videoSrc = s.video_url || s.image;
          const fallbackImg = failedVideos[slideKey] ? (s.poster_url || s.image) : s.image;
          const ctaLabel = s.ctaLabel || s.cta_label;
          const ctaLink = s.ctaLink || s.cta_link;

          const dims = mediaDimensions[slideKey];
          const mediaRatio =
            dims && dims.width > 0 && dims.height > 0 ? dims.width / dims.height : null;

          const { fitMode, focusPos } = getSlideFitAndPos(s);
          const { objectFit, objectPosition: objectPos, useBackdrop } = resolveSlideFit(
            fitMode,
            focusPos,
            mediaRatio,
            containerRatio,
            containerWidth
          );

          return (
            <div
              key={slideKey}
              className="absolute inset-0 bg-[#1c1c18] transition-opacity duration-[1200ms] ease-in-out"
              style={{
                opacity: isCurrent ? 1 : 0,
                zIndex: isCurrent ? 10 : 0,
                pointerEvents: isCurrent ? 'auto' : 'none',
              }}
            >
              {showVideo && videoSrc ? (
                <>
                  {/* Video backdrop fallback chain: poster image blurred -> 64x36 live canvas backdrop (never decodes video twice) */}
                  {useBackdrop && s.poster_url && !failedImages[`poster-${slideKey}`] && (
                    <img
                      src={s.poster_url}
                      alt=""
                      aria-hidden="true"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [`poster-${slideKey}`]: true }))
                      }
                      className="hero-media-backdrop"
                    />
                  )}
                  {useBackdrop && (
                    <canvas
                      ref={el => {
                        canvasRefs.current[slideKey] = el;
                      }}
                      width={64}
                      height={36}
                      aria-hidden="true"
                      className="hero-media-backdrop"
                    />
                  )}
                  <video
                    ref={el => {
                      videoRefs.current[slideKey] = el;
                      if (el) {
                        el.muted = true;
                        el.defaultMuted = true;
                        el.playsInline = true;
                        if (el.readyState >= 1 && el.videoWidth > 0 && el.videoHeight > 0) {
                          recordMediaSize(slideKey, el.videoWidth, el.videoHeight);
                        }
                        if (el.readyState >= 1 && Number.isFinite(el.duration) && el.duration > 0) {
                          recordVideoDuration(slideKey, el.duration);
                        }
                      }
                    }}
                    src={videoSrc}
                    crossOrigin={noCorsVideos[slideKey] ? undefined : 'anonymous'}
                    poster={s.poster_url || undefined}
                    autoPlay={isCurrent && !prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    preload={isCurrent || isNext ? 'auto' : 'metadata'}
                    onLoadedMetadata={e => {
                      recordMediaSize(
                        slideKey,
                        e.currentTarget.videoWidth,
                        e.currentTarget.videoHeight
                      );
                      recordVideoDuration(slideKey, e.currentTarget.duration);
                      drawVideoToBackdropCanvas(slideKey);
                    }}
                    onDurationChange={e => {
                      recordVideoDuration(slideKey, e.currentTarget.duration);
                    }}
                    onLoadedData={() => drawVideoToBackdropCanvas(slideKey)}
                    onCanPlay={() => drawVideoToBackdropCanvas(slideKey)}
                    onPlay={() => drawVideoToBackdropCanvas(slideKey)}
                    onSeeked={() => drawVideoToBackdropCanvas(slideKey)}
                    onPause={e => {
                      if (isCurrent && shouldPlayRef.current && !e.currentTarget.ended) {
                        devLog('video pause event while active — resuming', slideKey);
                        safePlayVideo(e.currentTarget, slideKey, false);
                      }
                    }}
                    onStalled={e => {
                      devLog('video stalled event', slideKey);
                      if (isCurrent && shouldPlayRef.current) {
                        safePlayVideo(e.currentTarget, slideKey, false);
                      }
                    }}
                    onWaiting={e => {
                      devLog('video waiting event', slideKey);
                      if (isCurrent && shouldPlayRef.current && e.currentTarget.paused) {
                        safePlayVideo(e.currentTarget, slideKey, false);
                      }
                    }}
                    onError={() => {
                      if (!noCorsVideos[slideKey]) {
                        devLog('video CORS error — retrying without crossOrigin', slideKey);
                        setNoCorsVideos(prev => ({ ...prev, [slideKey]: true }));
                      } else {
                        devLog('video load error — falling back to poster / advancing', slideKey);
                        setFailedVideos(prev => ({ ...prev, [slideKey]: true }));
                        if (isCurrent && total > 1) {
                          if (!s.poster_url) {
                            advanceToIndex(currentIndex + 1);
                          }
                        }
                      }
                    }}
                    className="hero-media-foreground"
                    style={{
                      objectFit,
                      objectPosition: objectPos,
                    }}
                  />
                </>
              ) : fallbackImg && !failedImages[slideKey] ? (
                <>
                  {/* Blurred, scaled copy of the same image behind it when using contain */}
                  {useBackdrop && (
                    <img
                      src={fallbackImg}
                      alt=""
                      aria-hidden="true"
                      className="hero-media-backdrop"
                    />
                  )}
                  <img
                    ref={el => {
                      if (el && el.complete && el.naturalWidth > 0 && el.naturalHeight > 0) {
                        recordMediaSize(slideKey, el.naturalWidth, el.naturalHeight);
                      }
                    }}
                    src={fallbackImg}
                    alt={s.headline || '44LUXURY Campaign'}
                    onLoad={e => {
                      recordMediaSize(
                        slideKey,
                        e.currentTarget.naturalWidth,
                        e.currentTarget.naturalHeight
                      );
                    }}
                    onError={() => {
                      setFailedImages(prev => ({ ...prev, [slideKey]: true }));
                    }}
                    className="hero-media-foreground"
                    style={{
                      objectFit,
                      objectPosition: objectPos,
                    }}
                    loading={isCurrent ? 'eager' : 'lazy'}
                  />
                </>
              ) : null}

              {/* Gradient — heavy at bottom for text legibility, lighter top */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent z-10 pointer-events-none" />

              {/* ── Slide text — bottom-center, generous padding ──────────── */}
              {(s.headline || s.subheadline || ctaLabel) && (
                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end text-center px-6 pb-16 md:pb-24 lg:pb-28">
                  <div className="max-w-[75%] md:max-w-[600px] flex flex-col items-center">
                    {s.subheadline && (
                      <p className="font-grotesk font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#fcf9f3]/70 mb-3 md:mb-4">
                        {s.subheadline}
                      </p>
                    )}
                    {s.headline && (
                      <h2 className="font-unica text-[clamp(2.2rem,5vw,4.2rem)] uppercase tracking-[-0.01em] leading-[1.05] text-[#fcf9f3] mb-6 drop-shadow-2xl">
                        {s.headline}
                      </h2>
                    )}
                    {ctaLabel && (
                      <Link
                        to={ctaLink || '/shop'}
                        className="inline-block bg-[#fcf9f3] text-[#1c1c18] border border-[#fcf9f3] font-grotesk font-bold uppercase tracking-[0.18em] text-[10px] md:text-[11px] px-9 py-3.5 hover:bg-transparent hover:text-[#fcf9f3] transition-all duration-300"
                      >
                        {ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Prev / Next arrows — visible on hover (desktop) ─────────────── */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-5 top-1/2 -translate-y-1/2 z-30
                         w-11 h-11 flex items-center justify-center
                         border border-white/25 text-white/60
                         hover:border-white/60 hover:text-white
                         bg-black/10 hover:bg-black/30
                         backdrop-blur-sm transition-all duration-300
                         opacity-0 md:group-hover:opacity-100
                         focus:opacity-100 outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft size={19} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2 z-30
                         w-11 h-11 flex items-center justify-center
                         border border-white/25 text-white/60
                         hover:border-white/60 hover:text-white
                         bg-black/10 hover:bg-black/30
                         backdrop-blur-sm transition-all duration-300
                         opacity-0 md:group-hover:opacity-100
                         focus:opacity-100 outline-none"
              aria-label="Next slide"
            >
              <ChevronRight size={19} strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* ── Admin-only slide counter, timing & progress indicator ─────────── */}
        {showAdminInfo && total > 0 && (
          <div className="absolute bottom-5 right-5 md:bottom-7 md:right-8 flex flex-col items-end gap-2.5 z-30 bg-black/65 backdrop-blur-sm border border-white/15 px-3 py-2 rounded">
            <span className="font-grotesk text-[10px] font-bold uppercase tracking-[0.16em] text-[#fcf9f3] tabular-nums">
              Slide {currentIndex + 1} of {total} · {Math.round(activeSlideDurationSec)}s
            </span>

            {total > 1 && (
              <div className="flex items-center gap-1.5 w-full justify-end">
                {slides.map((s, i) => (
                  <button
                    key={getStableSlideKey(s, i)}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(i);
                    }}
                    className="relative h-[2px] w-8 md:w-10 bg-[#fcf9f3]/25 overflow-hidden focus:outline-none"
                    aria-label={`Go to slide ${i + 1}`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 bg-[#fcf9f3]"
                      style={{
                        width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%',
                        transition: i === currentIndex ? 'none' : 'width 0.3s ease',
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
