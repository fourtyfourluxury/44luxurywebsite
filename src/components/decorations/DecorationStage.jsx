import { Component, useState, useEffect, lazy, Suspense } from 'react';
import {
  HEADER_CHARACTER_KEYS,
  SURPRISE_DECORATION_KEYS,
  PHONE_ALLOWED_DECORATION_KEYS,
  sanitizeThemeTokens,
  sanitizeDecorationsArray,
  sanitizeIntensity,
  sanitizeOrnamentSide,
} from '../../services/themeService';

// Lazy-load every decoration module on demand so only the active theme's decorations are fetched
const SnowDecoration = lazy(() => import('./SnowDecoration'));
const ConfettiDecoration = lazy(() => import('./ConfettiDecoration'));
const HeartsDecoration = lazy(() => import('./HeartsDecoration'));
const PetalsDecoration = lazy(() => import('./PetalsDecoration'));
const SparkleDecoration = lazy(() => import('./SparkleDecoration'));
const FireworksDecoration = lazy(() => import('./FireworksDecoration'));
const RibbonsDecoration = lazy(() => import('./RibbonsDecoration'));
const BatsDecoration = lazy(() => import('./BatsDecoration'));

const ChristmasTreeOrnament = lazy(() => import('./ChristmasTreeOrnament'));
const StringLightsOrnament = lazy(() => import('./StringLightsOrnament'));
const OrnamentsHanging = lazy(() => import('./OrnamentsHanging'));
const FlowerBorderOrnament = lazy(() => import('./FlowerBorderOrnament'));
const EasterEggsOrnament = lazy(() => import('./EasterEggsOrnament'));
const RoseCornersOrnament = lazy(() => import('./RoseCornersOrnament'));
const CrescentStarsOrnament = lazy(() => import('./CrescentStarsOrnament'));
const LanternsOrnament = lazy(() => import('./LanternsOrnament'));
const PumpkinCornerOrnament = lazy(() => import('./PumpkinCornerOrnament'));
const CobwebCornerOrnament = lazy(() => import('./CobwebCornerOrnament'));

const HeaderCharactersPair = lazy(() => import('./HeaderCharactersPair'));
const ExtraOrnaments = lazy(() => import('./ExtraOrnaments'));
const SurpriseMoments = lazy(() => import('./SurpriseMoments'));

const EXTRA_ORNAMENT_KEYS = [
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

const DECORATION_KEYFRAMES = `
@keyframes decFallSway {
  0%   { transform: translate3d(0, -24px, 0) rotate(0deg); }
  50%  { transform: translate3d(18px, 50vh, 0) rotate(180deg); }
  100% { transform: translate3d(-12px, 105vh, 0) rotate(360deg); }
}
@keyframes decFallTumble {
  0%   { transform: translate3d(0, -24px, 0) rotate(0deg) scaleX(1); }
  50%  { transform: translate3d(-16px, 52vh, 0) rotate(190deg) scaleX(0.65); }
  100% { transform: translate3d(14px, 105vh, 0) rotate(360deg) scaleX(1); }
}
@keyframes decRiseWobble {
  0%   { transform: translate3d(0, 20px, 0) scale(0.85); opacity: 0; }
  15%  { opacity: 0.78; }
  50%  { transform: translate3d(14px, -48vh, 0) scale(1); opacity: 0.72; }
  100% { transform: translate3d(-12px, -102vh, 0) scale(0.9); opacity: 0; }
}
@keyframes decTwinkle {
  0%, 100% { opacity: 0.28; transform: scale(0.92); }
  50%      { opacity: 0.92; transform: scale(1.06); }
}
@keyframes decTwinkleAlt {
  0%, 100% { opacity: 0.9; transform: scale(1.04); }
  50%      { opacity: 0.3; transform: scale(0.92); }
}
@keyframes decFireworkBurst {
  0%, 74%  { transform: scale(0.15); opacity: 0; }
  80%      { transform: scale(0.55); opacity: 0.62; }
  92%      { transform: scale(1.12); opacity: 0.35; }
  100%     { transform: scale(1.3); opacity: 0; }
}
@keyframes decBatFly {
  0%   { transform: translate3d(-60px, 8px, 0) scale(0.95); }
  50%  { transform: translate3d(50vw, -12px, 0) scale(1.04); }
  100% { transform: translate3d(105vw, 6px, 0) scale(0.95); }
}
@keyframes decSwingTop {
  0%, 100% { transform: rotate(-3.5deg); }
  50%      { transform: rotate(3.5deg); }
}
@keyframes decSwayBottom {
  0%, 100% { transform: skewX(-2deg); }
  50%      { transform: skewX(2deg); }
}
.dec-fall-sway      { animation: decFallSway 12s linear infinite; will-change: transform; }
.dec-fall-tumble    { animation: decFallTumble 10s linear infinite; will-change: transform; }
.dec-rise-wobble    { animation: decRiseWobble 11s ease-in-out infinite; will-change: transform, opacity; }
.dec-twinkle        { animation: decTwinkle 3.6s ease-in-out infinite; will-change: opacity, transform; }
.dec-twinkle-alt    { animation: decTwinkleAlt 4.1s ease-in-out infinite; will-change: opacity, transform; }
.dec-firework-burst { animation: decFireworkBurst 16s ease-out infinite; will-change: transform, opacity; }
.dec-bat-fly        { animation: decBatFly 20s linear infinite; will-change: transform; }
.dec-swing-top      { animation: decSwingTop 5.2s ease-in-out infinite; will-change: transform; }
.dec-sway-bottom    { animation: decSwayBottom 5.5s ease-in-out infinite; will-change: transform; }
.decorations-paused,
.decorations-paused * {
  animation-play-state: paused !important;
}
`;

const PARTICLE_COUNTS = {
  low: { desktop: 12, phone: 6 },
  medium: { desktop: 24, phone: 12 },
  high: { desktop: 40, phone: 18 },
};

class DecorationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn('[DecorationErrorBoundary] Caught decoration error:', err);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function SafePiece({ children }) {
  return (
    <DecorationErrorBoundary>
      <Suspense fallback={null}>{children}</Suspense>
    </DecorationErrorBoundary>
  );
}

function DecorationStageInner({
  decorations = [],
  legacyDecoration = 'none',
  intensity = 'medium',
  ornamentSide = 'left',
  tokens = {},
  themeSlug = '',
  avoidPreviewPill = false,
  previewMode = false,
  isPhoneOverride = null,
}) {
  const [isPhoneViewport, setIsPhoneViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  // Track phone breakpoint
  useEffect(() => {
    if (isPhoneOverride !== null || typeof window === 'undefined') return;
    const onResize = () => setIsPhoneViewport(window.innerWidth < 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [isPhoneOverride]);

  // Track prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setPrefersReducedMotion(Boolean(e.matches));
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
  }, []);

  // Pause all animations when tab is hidden
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => setIsTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Measure combined header + announcement bar height via ResizeObserver into --header-offset
  useEffect(() => {
    if (previewMode || typeof document === 'undefined') return;
    const root = document.documentElement;
    const headerEl = document.querySelector('header');
    if (!headerEl) {
      root.style.setProperty('--header-offset', '70px');
      return;
    }

    const updateHeaderOffset = () => {
      const h = Math.round(headerEl.getBoundingClientRect().height || 70);
      root.style.setProperty('--header-offset', `${h}px`);
    };

    updateHeaderOffset();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateHeaderOffset);
      ro.observe(headerEl);
    }
    window.addEventListener('resize', updateHeaderOffset, { passive: true });

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateHeaderOffset);
    };
  }, [previewMode]);

  const rawActiveKeys = sanitizeDecorationsArray(decorations, legacyDecoration);
  const isPhone = isPhoneOverride !== null ? Boolean(isPhoneOverride) : isPhoneViewport;

  // On phones (< 768px): only falling effects (reduced counts), string_lights, bunting,
  // flower_border, fog, sparkle and shooting_stars. Everything else is hidden.
  const activeKeys = isPhone
    ? rawActiveKeys.filter((k) => PHONE_ALLOWED_DECORATION_KEYS.includes(k))
    : rawActiveKeys;

  if (activeKeys.length === 0) return null;

  const safeTokens = sanitizeThemeTokens(tokens);
  const safeIntensity = sanitizeIntensity(intensity);
  const safeSide = sanitizeOrnamentSide(ornamentSide);

  const countsForIntensity = PARTICLE_COUNTS[safeIntensity] || PARTICLE_COUNTS.medium;
  const particleCount = isPhone ? countsForIntensity.phone : countsForIntensity.desktop;

  const has = (key) => activeKeys.includes(key);

  const activePairKey = !isPhone
    ? activeKeys.find((k) => HEADER_CHARACTER_KEYS.includes(k)) || null
    : null;

  const hasExtraOrnaments = activeKeys.some((k) => EXTRA_ORNAMENT_KEYS.includes(k));

  const activeSurpriseKeys = !isPhone
    ? activeKeys.filter((k) => SURPRISE_DECORATION_KEYS.includes(k))
    : [];

  const containerClass = previewMode
    ? `absolute inset-0 overflow-hidden pointer-events-none z-10 ${
        !isTabVisible ? 'decorations-paused' : ''
      }`
    : `fixed inset-0 overflow-hidden pointer-events-none z-[35] ${
        !isTabVisible ? 'decorations-paused' : ''
      }`;

  const containerStyle = previewMode
    ? { '--header-offset': '36px', maxWidth: '100%' }
    : { maxWidth: '100vw' };

  return (
    <div aria-hidden="true" className={containerClass} style={containerStyle}>
      <style>{DECORATION_KEYFRAMES}</style>

      {/* ── 1. Shared Overlay for Falling / Floating Effects (disabled for prefers-reduced-motion) ── */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {has('snow') && (
            <SafePiece>
              <SnowDecoration count={particleCount} />
            </SafePiece>
          )}
          {has('confetti') && (
            <SafePiece>
              <ConfettiDecoration count={particleCount} tokens={safeTokens} />
            </SafePiece>
          )}
          {has('hearts') && (
            <SafePiece>
              <HeartsDecoration count={particleCount} tokens={safeTokens} />
            </SafePiece>
          )}
          {has('petals') && (
            <SafePiece>
              <PetalsDecoration count={particleCount} tokens={safeTokens} />
            </SafePiece>
          )}
          {has('sparkle') && (
            <SafePiece>
              <SparkleDecoration count={particleCount} tokens={safeTokens} />
            </SafePiece>
          )}
          {has('fireworks') && (
            <SafePiece>
              <FireworksDecoration tokens={safeTokens} />
            </SafePiece>
          )}
          {has('ribbons') && (
            <SafePiece>
              <RibbonsDecoration count={particleCount} />
            </SafePiece>
          )}
          {has('bats') && (
            <SafePiece>
              <BatsDecoration count={particleCount} />
            </SafePiece>
          )}
        </div>
      )}

      {/* ── 2. Top Edge & Corner Ornaments (positioned at var(--header-offset)) ── */}
      {has('string_lights') && (
        <SafePiece>
          <StringLightsOrnament
            tokens={safeTokens}
            isPhone={isPhone}
            reducedMotion={prefersReducedMotion}
          />
        </SafePiece>
      )}

      {!isPhone && has('ornaments') && (
        <SafePiece>
          <OrnamentsHanging
            side={safeSide}
            tokens={safeTokens}
            reducedMotion={prefersReducedMotion}
          />
        </SafePiece>
      )}

      {!isPhone && has('crescent_stars') && (
        <SafePiece>
          <CrescentStarsOrnament
            side={safeSide}
            tokens={safeTokens}
            reducedMotion={prefersReducedMotion}
          />
        </SafePiece>
      )}

      {!isPhone && has('lanterns') && (
        <SafePiece>
          <LanternsOrnament
            side={safeSide}
            tokens={safeTokens}
            reducedMotion={prefersReducedMotion}
          />
        </SafePiece>
      )}

      {!isPhone && has('cobweb_corner') && (
        <SafePiece>
          <CobwebCornerOrnament side={safeSide} />
        </SafePiece>
      )}

      {/* ── 3. Header Character Pair (12% from left & right on --header-offset, desktop/tablet only) ── */}
      {!isPhone && activePairKey && (
        <SafePiece>
          <HeaderCharactersPair
            pairKey={activePairKey}
            reducedMotion={prefersReducedMotion}
          />
        </SafePiece>
      )}

      {/* ── 4. Bottom Edge & Corner Ornaments (respecting ornamentSide and BackToTop clearance) ── */}
      {has('flower_border') && (
        <SafePiece>
          <FlowerBorderOrnament
            tokens={safeTokens}
            isPhone={isPhone}
            reducedMotion={prefersReducedMotion}
          />
        </SafePiece>
      )}

      {!isPhone && has('christmas_tree') && (
        <SafePiece>
          <ChristmasTreeOrnament
            side={safeSide}
            tokens={safeTokens}
            reducedMotion={prefersReducedMotion}
            avoidPreviewPill={avoidPreviewPill}
          />
        </SafePiece>
      )}

      {!isPhone && has('easter_eggs') && (
        <SafePiece>
          <EasterEggsOrnament
            side={safeSide}
            tokens={safeTokens}
            avoidPreviewPill={avoidPreviewPill}
          />
        </SafePiece>
      )}

      {!isPhone && has('rose_corners') && (
        <SafePiece>
          <RoseCornersOrnament
            side={safeSide}
            tokens={safeTokens}
            avoidPreviewPill={avoidPreviewPill}
          />
        </SafePiece>
      )}

      {!isPhone && has('pumpkin_corner') && (
        <SafePiece>
          <PumpkinCornerOrnament
            side={safeSide}
            reducedMotion={prefersReducedMotion}
            avoidPreviewPill={avoidPreviewPill}
          />
        </SafePiece>
      )}

      {/* ── 5. Second-Wave Ornaments (easter_basket, chicks, teddy, black_cat, spiderwebs, mosque_skyline, bunting, disco_ball, balloons, price_tags, fog) ── */}
      {hasExtraOrnaments && (
        <SafePiece>
          <ExtraOrnaments
            activeKeys={activeKeys}
            side={safeSide}
            tokens={safeTokens}
            themeSlug={themeSlug}
            isPhone={isPhone}
            reducedMotion={prefersReducedMotion}
            avoidPreviewPill={avoidPreviewPill}
          />
        </SafePiece>
      )}

      {/* ── 6. Shared Mischief / Surprise Moments Scheduler ── */}
      {!isPhone && !prefersReducedMotion && activeSurpriseKeys.length > 0 && (
        <SafePiece>
          <SurpriseMoments
            surpriseKeys={activeSurpriseKeys}
            allActiveKeys={activeKeys}
            intensity={safeIntensity}
            side={safeSide}
            tokens={safeTokens}
            isPhone={isPhone}
            reducedMotion={prefersReducedMotion}
            isTabVisible={isTabVisible}
            previewMode={previewMode}
            avoidPreviewPill={avoidPreviewPill}
          />
        </SafePiece>
      )}
    </div>
  );
}

export default function DecorationStage(props) {
  return (
    <DecorationErrorBoundary>
      <DecorationStageInner {...props} />
    </DecorationErrorBoundary>
  );
}
