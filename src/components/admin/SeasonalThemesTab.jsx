import { useState, useEffect, useMemo, useCallback, createElement, lazy, Suspense } from 'react';
import {
  Sparkles,
  Check,
  AlertCircle,
  Plus,
  Edit2,
  Copy,
  Trash2,
  ExternalLink,
  Power,
  RefreshCw,
  Calendar,
  X,
  ShieldCheck,
  Monitor,
  Smartphone,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { toast } from '../ui/ToastProvider';
import {
  ORIGINAL_THEME_TOKENS,
  FALLING_DECORATION_KEYS,
  HEADER_CHARACTER_KEYS,
  ORNAMENT_DECORATION_KEYS,
  SURPRISE_DECORATION_KEYS,
  DARK_PALETTE_KEYS,
  VALID_INTENSITIES,
  VALID_ORNAMENT_SIDES,
  isValidHexColor,
  expandHexColor,
  sanitizeThemeTokens,
  resolveDarkPaletteTokens,
  sanitizeDecorationsArray,
  sanitizeIntensity,
  sanitizeOrnamentSide,
  getContrastRatio,
  slugifyThemeName,
  isThemeWithinWindow,
  getThemeStatus,
  getAllThemesAdmin,
  activateThemeRpc,
  createThemeAdmin,
  updateThemeAdmin,
  deleteThemeAdmin,
  saveThemeCache,
  clearThemeCache,
  notifySeasonalThemeUpdated,
} from '../../services/themeService';

const LazyDecorationStage = lazy(() => import('../decorations/DecorationStage'));

const DECORATION_META = {
  // 1. Falling effects
  snow: { label: 'Snow', group: 'falling' },
  confetti: { label: 'Confetti', group: 'falling' },
  hearts: { label: 'Hearts', group: 'falling' },
  petals: { label: 'Petals', group: 'falling' },
  sparkle: { label: 'Sparkle', group: 'falling' },
  fireworks: { label: 'Fireworks', group: 'falling' },
  ribbons: { label: 'Ribbons', group: 'falling' },
  bats: { label: 'Bats', group: 'falling' },
  // 2. Header characters (choose one pair)
  santa_pair: { label: 'Santa Pair', group: 'character' },
  bunny_pair: { label: 'Bunny Pair', group: 'character' },
  ghost_pair: { label: 'Ghost Pair', group: 'character' },
  cupid_pair: { label: 'Cupid Pair', group: 'character' },
  party_pair: { label: 'Party Pair', group: 'character' },
  flag_pair: { label: 'Flag Pair', group: 'character' },
  crescent_pair: { label: 'Crescent Pair', group: 'character' },
  tag_pair: { label: 'Gold Tag Pair', group: 'character' },
  // 3. Corner and edge ornaments
  christmas_tree: { label: 'Christmas Tree', group: 'ornament' },
  string_lights: { label: 'String Lights', group: 'ornament' },
  ornaments: { label: 'Hanging Baubles', group: 'ornament' },
  flower_border: { label: 'Flower Border', group: 'ornament' },
  easter_eggs: { label: 'Easter Eggs', group: 'ornament' },
  rose_corners: { label: 'Rose Corners', group: 'ornament' },
  crescent_stars: { label: 'Crescent & Stars', group: 'ornament' },
  lanterns: { label: 'Lanterns', group: 'ornament' },
  pumpkin_corner: { label: 'Pumpkin Corner', group: 'ornament' },
  cobweb_corner: { label: 'Cobweb Corner', group: 'ornament' },
  easter_basket: { label: 'Easter Basket', group: 'ornament' },
  chicks: { label: 'Baby Chicks', group: 'ornament' },
  teddy: { label: 'Teddy Bear', group: 'ornament' },
  black_cat: { label: 'Black Cat', group: 'ornament' },
  spiderwebs: { label: 'Spiderwebs', group: 'ornament' },
  mosque_skyline: { label: 'Mosque Skyline', group: 'ornament' },
  bunting: { label: 'Pennant Bunting', group: 'ornament' },
  disco_ball: { label: 'Disco Ball', group: 'ornament' },
  balloons: { label: 'Year Balloons', group: 'ornament' },
  price_tags: { label: 'Gold Price Tags', group: 'ornament' },
  fog: { label: 'Drifting Fog', group: 'ornament' },
  // 4. Surprise animations
  sleigh: { label: "Santa's Sleigh", group: 'surprise' },
  elf_peek: { label: 'Peeking Elf', group: 'surprise' },
  bunny_hop: { label: 'Hopping Bunny', group: 'surprise' },
  ghosts: { label: 'Drifting Ghosts', group: 'surprise' },
  spiders: { label: 'Dropping Spider', group: 'surprise' },
  cupid_arrow: { label: "Cupid's Arrow", group: 'surprise' },
  party_poppers: { label: 'Party Poppers', group: 'surprise' },
  shooting_stars: { label: 'Shooting Star', group: 'surprise' },
};

/**
 * Small inline SVG icon for each decoration chip
 */
function DecorationChipIcon({ type }) {
  switch (type) {
    case 'snow':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="3" y1="7" x2="21" y2="17" />
          <line x1="21" y1="7" x2="3" y2="17" />
        </svg>
      );
    case 'confetti':
    case 'party_poppers':
      return (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="2" width="5" height="3" transform="rotate(20 4 3)" />
          <circle cx="12" cy="5" r="2" />
          <rect x="6" y="10" width="5" height="3" transform="rotate(-15 8 11)" />
        </svg>
      );
    case 'hearts':
    case 'cupid_pair':
    case 'cupid_arrow':
    case 'teddy':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21l-1.4-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5L12 21z" />
        </svg>
      );
    case 'petals':
    case 'flower_border':
    case 'rose_corners':
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="5" r="3" />
          <circle cx="15" cy="10" r="3" />
          <circle cx="10" cy="15" r="3" />
          <circle cx="5" cy="10" r="3" />
        </svg>
      );
    case 'sparkle':
    case 'fireworks':
    case 'shooting_stars':
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" />
        </svg>
      );
    case 'ribbons':
    case 'bunting':
    case 'flag_pair':
      return (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <polygon points="2,2 8,2 5,8" />
          <polygon points="8,2 14,2 11,8" />
        </svg>
      );
    case 'bats':
    case 'black_cat':
    case 'ghost_pair':
    case 'ghosts':
      return (
        <svg width="12" height="12" viewBox="0 0 24 14" fill="currentColor">
          <path d="M12 5L9 2L8 5C5 3 2 3 0 7C3 6 5 8 7 10L12 12L17 10C19 8 21 6 24 7C22 3 19 3 16 5L15 2L12 5Z" />
        </svg>
      );
    case 'christmas_tree':
    case 'santa_pair':
    case 'sleigh':
    case 'elf_peek':
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <polygon points="10,2 3,16 17,16" />
          <rect x="8.5" y="16" width="3" height="3" />
        </svg>
      );
    case 'string_lights':
    case 'ornaments':
    case 'lanterns':
    case 'disco_ball':
    case 'balloons':
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <line x1="10" y1="0" x2="10" y2="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="12" r="5" />
        </svg>
      );
    case 'crescent_stars':
    case 'crescent_pair':
    case 'mosque_skyline':
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <path d="M14 3A8 8 0 1 0 14 17A6 6 0 1 1 14 3Z" />
        </svg>
      );
    case 'easter_eggs':
    case 'easter_basket':
    case 'chicks':
    case 'bunny_pair':
    case 'bunny_hop':
    case 'pumpkin_corner':
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <ellipse cx="10" cy="11" rx="6" ry="7.5" />
        </svg>
      );
    case 'tag_pair':
    case 'price_tags':
    case 'party_pair':
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <polygon points="6,3 14,3 16,7 16,17 4,17 4,7" />
        </svg>
      );
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <line x1="2" y1="2" x2="18" y2="18" />
          <line x1="2" y1="10" x2="18" y2="10" />
          <line x1="10" y1="2" x2="10" y2="18" />
        </svg>
      );
  }
}

const COLOR_FIELDS = [
  { key: 'accent', label: 'Accent Color', hint: 'Buttons, badges, highlights' },
  { key: 'accent_hover', label: 'Accent Hover Color', hint: 'Hover state on accent elements' },
  { key: 'accent_contrast', label: 'Text on Accent', hint: 'Text inside accent buttons/badges' },
  { key: 'banner_bg', label: 'Banner Background', hint: 'Seasonal announcement bar background' },
  { key: 'banner_text', label: 'Banner Text', hint: 'Seasonal announcement bar text' },
];

const DARK_COLOR_FIELDS = [
  { key: 'page_bg', label: 'Page Background', hint: 'Main page background (e.g. #0d0b12)', placeholder: '#0d0b12' },
  { key: 'surface_bg', label: 'Surface / Card Background', hint: 'Cards, panels, drawers (e.g. #181420)', placeholder: '#181420' },
  { key: 'text', label: 'Primary Text', hint: 'Headings & body text (>= 4.5:1 contrast)', placeholder: '#f5f0eb' },
  { key: 'text_muted', label: 'Muted Text', hint: 'Secondary labels & captions', placeholder: '#a89fb0' },
  { key: 'border', label: 'Border Color', hint: 'Dividers & input borders', placeholder: '#2e2638' },
];

const DEFAULT_DARK_PALETTE_PRESET = {
  page_bg: '#0d0b12',
  surface_bg: '#181420',
  text: '#f5f0eb',
  text_muted: '#a89fb0',
  border: '#2e2638',
};

function buildUniqueSlug(baseName, existingThemes, currentId = null) {
  const base = slugifyThemeName(baseName) || 'custom-theme';
  const taken = new Set(
    (existingThemes || [])
      .filter((t) => t.id !== currentId)
      .map((t) => String(t.slug || '').toLowerCase())
  );
  if (!taken.has(base)) return base;
  let counter = 2;
  while (taken.has(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
}

function getStatusBadgeProps(status) {
  switch (status) {
    case 'Live':
      return {
        label: 'Live',
        cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'Scheduled':
      return {
        label: 'Scheduled',
        cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'Ended':
      return {
        label: 'Ended',
        cls: 'bg-red-500/15 text-red-400 border border-red-500/30',
        dot: 'bg-red-400',
      };
    default:
      return {
        label: 'Off',
        cls: 'bg-white/5 text-white/45 border border-white/10',
        dot: 'bg-white/30',
      };
  }
}

/**
 * Small mini preview (a header strip with the banner and an accent button) for theme cards
 */
function ThemeMiniPreview({ tokens, announcementText, themeName }) {
  const safe = sanitizeThemeTokens(tokens);
  const darkResolved = resolveDarkPaletteTokens(tokens);
  const bannerLabel =
    (announcementText && String(announcementText).trim()) ||
    `${themeName || 'Seasonal'} · Limited Time`;

  return (
    <div
      className="border border-white/10 overflow-hidden"
      style={{ backgroundColor: darkResolved.isDark ? darkResolved.page_bg : '#fcf9f3' }}
    >
      <div
        className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] truncate text-center"
        style={{
          backgroundColor: safe.banner_bg,
          color: safe.banner_text,
        }}
      >
        {bannerLabel}
      </div>

      <div className="bg-[#1c1c18] px-3 py-2 flex items-center justify-between border-b border-white/10">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#fcf9f3]">
          44 LUXURY
        </span>
        <span
          className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{
            backgroundColor: safe.accent,
            color: safe.accent_contrast,
          }}
        >
          Shop Now
        </span>
      </div>
    </div>
  );
}

/**
 * Live Decoration Preview Panel inside the Theme Edit Form:
 * Mock storefront frame (header strip + content blocks) rendering selected decorations live
 * with a Desktop / Phone toggle and surprise animations every ~6s.
 */
function DecorationLivePreviewFrame({
  tokens,
  announcementText,
  themeName,
  themeSlug,
  decorations,
  intensity,
  ornamentSide,
  previewDevice,
  onChangeDevice,
}) {
  const safe = sanitizeThemeTokens(tokens);
  const darkResolved = resolveDarkPaletteTokens(tokens);
  const bannerLabel =
    (announcementText && String(announcementText).trim()) ||
    `${themeName || 'Seasonal'} · Limited Time Offer`;
  const isPhone = previewDevice === 'phone';
  const activeDecs = sanitizeDecorationsArray(decorations, 'none');

  const pageBg = darkResolved.isDark ? darkResolved.page_bg : '#fcf9f3';
  const surfaceBg = darkResolved.isDark ? darkResolved.surface_bg : '#f1eee7';
  const textColor = darkResolved.isDark ? darkResolved.text : '#1c1c18';
  const mutedColor = darkResolved.isDark ? darkResolved.text_muted : '#5f5e5e';
  const borderColor = darkResolved.isDark ? darkResolved.border : 'rgba(28,28,24,0.12)';

  return (
    <div className="bg-[#0f0f0c] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white">
            Decoration Preview
          </p>
          <p className="text-[10px] text-white/40">
            Live mock storefront ({isPhone ? 'Phone < 768px: light ornaments only' : 'Desktop view · surprises play every ~6s'})
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-white/15 bg-[#141410] p-0.5">
          <button
            type="button"
            onClick={() => onChangeDevice('desktop')}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-colors ${
              !isPhone ? 'bg-[#c9a96e] text-[#0a0a08]' : 'text-white/55 hover:text-white'
            }`}
          >
            <Monitor size={11} />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onChangeDevice('phone')}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-colors ${
              isPhone ? 'bg-[#c9a96e] text-[#0a0a08]' : 'text-white/55 hover:text-white'
            }`}
          >
            <Smartphone size={11} />
            Phone
          </button>
        </div>
      </div>

      {/* Mock Storefront Viewport */}
      <div
        className={`relative mx-auto border border-white/15 overflow-hidden transition-all ${
          isPhone ? 'max-w-[270px] h-[250px]' : 'w-full h-[250px]'
        }`}
        style={{ backgroundColor: pageBg }}
      >
        {/* Mock Header Strip (36px total height matches --header-offset: 36px in previewMode) */}
        <div className="relative z-20 h-[36px] flex flex-col">
          <div
            className="h-[15px] px-2 flex items-center justify-center text-[8px] font-bold uppercase tracking-[0.16em] truncate"
            style={{ backgroundColor: safe.banner_bg, color: safe.banner_text }}
          >
            {bannerLabel}
          </div>
          <div className="h-[21px] bg-[#1c1c18] px-3 flex items-center justify-between text-[#fcf9f3]">
            <span className="text-[7px] tracking-widest opacity-60">MENU</span>
            <span className="text-[9px] font-bold tracking-[0.2em]">44 LUXURY</span>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: safe.accent }}
            />
          </div>
        </div>

        {/* Mock Storefront Content Blocks */}
        <div className="relative z-0 p-4 flex flex-col items-center justify-center h-[calc(100%-36px)] text-center">
          <p
            className="text-[8px] font-bold uppercase tracking-[0.25em] mb-1"
            style={{ color: mutedColor }}
          >
            LIMITED EDITION
          </p>
          <p
            className="text-sm font-bold uppercase tracking-tight mb-2"
            style={{ color: textColor }}
          >
            {themeName || 'SEASONAL COLLECTION'}
          </p>
          <span
            className="px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{ backgroundColor: safe.accent, color: safe.accent_contrast }}
          >
            Explore Now
          </span>

          {/* Mock Product Cards Strip */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] mt-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-1.5 text-left"
                style={{
                  backgroundColor: surfaceBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div
                  className="h-7 mb-1 relative"
                  style={{ backgroundColor: borderColor }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 px-1 text-[6px] font-bold uppercase"
                    style={{ backgroundColor: safe.accent, color: safe.accent_contrast }}
                  >
                    NEW
                  </span>
                </div>
                <div
                  className="h-1.5 w-3/4 opacity-50"
                  style={{ backgroundColor: textColor }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Decoration Stage Overlay */}
        {activeDecs.length > 0 && (
          <Suspense fallback={null}>
            <LazyDecorationStage
              decorations={activeDecs}
              intensity={intensity}
              ornamentSide={ornamentSide}
              tokens={safe}
              themeSlug={themeSlug}
              previewMode={true}
              isPhoneOverride={isPhone}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default function SeasonalThemesTab({
  DateTimePicker,
  formatDateTimeDisplay,
  formatScheduleSummary,
  timeZoneLabel,
}) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyActionId, setBusyActionId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirm dialog state for "Turn on"
  const [confirmTurnOnTheme, setConfirmTurnOnTheme] = useState(null);
  // Confirm dialog state for "Delete" (custom themes only)
  const [confirmDeleteTheme, setConfirmDeleteTheme] = useState(null);

  // Create / Edit modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [savingForm, setSavingForm] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [darkSectionOpen, setDarkSectionOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [draft, setDraft] = useState({
    id: null,
    is_preset: false,
    name: '',
    slug: '',
    description: '',
    tokens: { ...ORIGINAL_THEME_TOKENS },
    decorations: [],
    decoration_intensity: 'medium',
    ornament_side: 'left',
    announcement_text: '',
    announcement_link: '',
    starts_at: null,
    ends_at: null,
  });

  const loadThemes = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    const { themes: data, error } = await getAllThemesAdmin();
    if (error) {
      setErrorMsg(error);
    } else {
      setThemes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadThemes();
  }, [loadThemes]);

  const activeRow = useMemo(
    () => themes.find((t) => Boolean(t.is_active)) || null,
    [themes]
  );

  const isSeasonalCurrentlyLive = useMemo(
    () => Boolean(activeRow && isThemeWithinWindow(activeRow)),
    [activeRow]
  );

  // ── Turn off all seasonal themes (restore Original) ──
  const handleTurnOffAll = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setBusyActionId('turn-off-all');

    const { error } = await activateThemeRpc(null);
    setBusyActionId(null);

    if (error) {
      setErrorMsg(error);
      toast(error, 'error');
      return;
    }

    clearThemeCache();
    notifySeasonalThemeUpdated();
    await loadThemes();
    const msg = 'Seasonal theme turned off. Storefront restored to the Original theme.';
    setSuccessMsg(msg);
    toast(msg, 'success');
  };

  // ── Confirm & Turn on a seasonal theme ──
  const handleConfirmTurnOn = async () => {
    if (!confirmTurnOnTheme) return;
    const target = confirmTurnOnTheme;
    setConfirmTurnOnTheme(null);
    setErrorMsg('');
    setSuccessMsg('');
    setBusyActionId(target.id);

    const { error } = await activateThemeRpc(target.id);
    setBusyActionId(null);

    if (error) {
      setErrorMsg(error);
      toast(error, 'error');
      return;
    }

    const updatedActive = { ...target, is_active: true };
    if (isThemeWithinWindow(updatedActive)) {
      saveThemeCache(updatedActive);
    } else {
      clearThemeCache();
    }
    notifySeasonalThemeUpdated();
    await loadThemes();

    const status = getThemeStatus(updatedActive);
    const msg =
      status === 'Scheduled'
        ? `"${target.name}" is now enabled and scheduled to go live at ${formatDateTimeDisplay(target.starts_at)}.`
        : `"${target.name}" is now live on the storefront.`;
    setSuccessMsg(msg);
    toast(msg, 'success');
  };

  // ── Delete custom theme ──
  const handleConfirmDelete = async () => {
    if (!confirmDeleteTheme) return;
    const target = confirmDeleteTheme;
    setConfirmDeleteTheme(null);
    if (target.is_preset) return;

    setErrorMsg('');
    setSuccessMsg('');
    setBusyActionId(target.id);

    const { error } = await deleteThemeAdmin(target.id);
    setBusyActionId(null);

    if (error) {
      setErrorMsg(error);
      toast(error, 'error');
      return;
    }

    if (target.is_active) {
      clearThemeCache();
      notifySeasonalThemeUpdated();
    }
    await loadThemes();
    const msg = `Deleted custom theme "${target.name}".`;
    setSuccessMsg(msg);
    toast(msg, 'success');
  };

  // ── Open Create / Edit / Duplicate modal ──
  const openCreateModal = () => {
    setFormError('');
    setSlugManuallyEdited(false);
    setPreviewDevice('desktop');
    setDarkSectionOpen(false);
    setDraft({
      id: null,
      is_preset: false,
      name: '',
      slug: '',
      description: '',
      tokens: { ...ORIGINAL_THEME_TOKENS },
      decorations: [],
      decoration_intensity: 'medium',
      ornament_side: 'left',
      announcement_text: '',
      announcement_link: '',
      starts_at: null,
      ends_at: null,
    });
    setEditorOpen(true);
  };

  const openEditModal = (theme) => {
    setFormError('');
    setSlugManuallyEdited(true);
    setPreviewDevice('desktop');
    setDarkSectionOpen(false);
    setDraft({
      id: theme.id,
      is_preset: Boolean(theme.is_preset),
      name: theme.name || '',
      slug: theme.slug || '',
      description: theme.description || '',
      tokens: sanitizeThemeTokens(theme.tokens),
      decorations: sanitizeDecorationsArray(theme.decorations, theme.decoration),
      decoration_intensity: sanitizeIntensity(theme.decoration_intensity),
      ornament_side: sanitizeOrnamentSide(theme.ornament_side),
      announcement_text: theme.announcement_text || '',
      announcement_link: theme.announcement_link || '',
      starts_at: theme.starts_at || null,
      ends_at: theme.ends_at || null,
    });
    setEditorOpen(true);
  };

  const openDuplicateModal = (theme) => {
    setFormError('');
    const copyName = `${theme.name || 'Theme'} (Copy)`;
    const copySlug = buildUniqueSlug(`${theme.slug || theme.name}-copy`, themes, null);
    setSlugManuallyEdited(false);
    setPreviewDevice('desktop');
    setDarkSectionOpen(false);
    setDraft({
      id: null,
      is_preset: false,
      name: copyName,
      slug: copySlug,
      description: theme.description || '',
      tokens: sanitizeThemeTokens(theme.tokens),
      decorations: sanitizeDecorationsArray(theme.decorations, theme.decoration),
      decoration_intensity: sanitizeIntensity(theme.decoration_intensity),
      ornament_side: sanitizeOrnamentSide(theme.ornament_side),
      announcement_text: theme.announcement_text || '',
      announcement_link: theme.announcement_link || '',
      starts_at: theme.starts_at || null,
      ends_at: theme.ends_at || null,
    });
    setEditorOpen(true);
  };

  const toggleDraftDecoration = (key) => {
    setDraft((prev) => {
      const current = Array.isArray(prev.decorations) ? prev.decorations : [];
      const exists = current.includes(key);
      if (HEADER_CHARACTER_KEYS.includes(key)) {
        const withoutPairs = current.filter((k) => !HEADER_CHARACTER_KEYS.includes(k));
        return {
          ...prev,
          decorations: exists ? withoutPairs : [...withoutPairs, key],
        };
      }
      const next = exists ? current.filter((k) => k !== key) : [...current, key];
      return { ...prev, decorations: next };
    });
  };

  const openPreviewTab = (theme) => {
    if (!theme?.slug) return;
    const url = `/?previewTheme=${encodeURIComponent(theme.slug)}`;
    window.open(url, '_blank', 'noopener');
  };

  // ── Contrast warnings (WCAG 4.5:1 & Dark Palette 3:1) ──
  const contrastWarnings = useMemo(() => {
    const warnings = [];
    const t = draft.tokens || {};
    if (isValidHexColor(t.accent) && isValidHexColor(t.accent_contrast)) {
      const ratio = getContrastRatio(t.accent, t.accent_contrast);
      if (ratio < 4.5) {
        warnings.push(
          `Text on Accent vs Accent Color contrast is ${ratio.toFixed(2)}:1 (recommended minimum is 4.5:1).`
        );
      }
    }
    if (isValidHexColor(t.banner_bg) && isValidHexColor(t.banner_text)) {
      const ratio = getContrastRatio(t.banner_bg, t.banner_text);
      if (ratio < 4.5) {
        warnings.push(
          `Banner Text vs Banner Background contrast is ${ratio.toFixed(2)}:1 (recommended minimum is 4.5:1).`
        );
      }
    }
    if (isValidHexColor(t.page_bg)) {
      const textHex = isValidHexColor(t.text) ? t.text : '#fcf9f3';
      const pageRatio = getContrastRatio(textHex, t.page_bg);
      if (pageRatio < 4.5) {
        warnings.push(
          `Dark Palette: Primary Text vs Page Background contrast is ${pageRatio.toFixed(2)}:1 (must be at least 4.5:1; otherwise dark palette falls back to original).`
        );
      }
      if (isValidHexColor(t.surface_bg)) {
        const surfRatio = getContrastRatio(textHex, t.surface_bg);
        if (surfRatio < 4.5) {
          warnings.push(
            `Dark Palette: Primary Text vs Surface Background contrast is ${surfRatio.toFixed(2)}:1 (must be at least 4.5:1; otherwise surface_bg is ignored).`
          );
        }
      }
      if (isValidHexColor(t.accent)) {
        const accentRatio = getContrastRatio(t.accent, t.page_bg);
        if (accentRatio < 3.0) {
          warnings.push(
            `Dark Palette: Accent Color vs Page Background contrast is ${accentRatio.toFixed(2)}:1 (must be at least 3.0:1; otherwise offending accent is ignored).`
          );
        }
      }
    }
    return warnings;
  }, [draft.tokens]);

  // ── Validate & Save Create/Edit form ──
  const handleSaveDraft = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    const cleanName = String(draft.name || '').trim();
    if (!cleanName) {
      setFormError('Theme name is required.');
      return;
    }

    const cleanSlug = slugifyThemeName(draft.slug || cleanName);
    if (!cleanSlug) {
      setFormError('A valid URL slug is required.');
      return;
    }

    const duplicateSlugTheme = themes.find(
      (t) => t.id !== draft.id && String(t.slug || '').toLowerCase() === cleanSlug.toLowerCase()
    );
    if (duplicateSlugTheme) {
      setFormError(`Slug "${cleanSlug}" is already used by "${duplicateSlugTheme.name}". Choose a unique slug.`);
      return;
    }

    for (const field of COLOR_FIELDS) {
      const rawVal = draft.tokens?.[field.key];
      if (!isValidHexColor(rawVal)) {
        setFormError(`${field.label} must be a valid hex color (e.g. #4b0e1e).`);
        return;
      }
    }

    for (const df of DARK_COLOR_FIELDS) {
      const rawVal = draft.tokens?.[df.key];
      if (rawVal && String(rawVal).trim() !== '' && !isValidHexColor(rawVal)) {
        setFormError(`Dark Palette ${df.label} must be a valid hex color (e.g. ${df.placeholder}) or left empty.`);
        return;
      }
    }

    if (draft.starts_at && draft.ends_at) {
      const sMs = new Date(draft.starts_at).getTime();
      const eMs = new Date(draft.ends_at).getTime();
      if (!Number.isNaN(sMs) && !Number.isNaN(eMs) && eMs <= sMs) {
        setFormError('End date/time must be after the start date/time.');
        return;
      }
    }

    setSavingForm(true);
    const nextTokens = {
      accent: expandHexColor(draft.tokens.accent),
      accent_hover: expandHexColor(draft.tokens.accent_hover),
      accent_contrast: expandHexColor(draft.tokens.accent_contrast),
      banner_bg: expandHexColor(draft.tokens.banner_bg),
      banner_text: expandHexColor(draft.tokens.banner_text),
    };

    for (const k of DARK_PALETTE_KEYS) {
      if (isValidHexColor(draft.tokens?.[k])) {
        nextTokens[k] = expandHexColor(draft.tokens[k]);
      }
    }

    const payload = {
      ...draft,
      name: cleanName,
      slug: cleanSlug,
      decorations: sanitizeDecorationsArray(draft.decorations, 'none'),
      decoration_intensity: sanitizeIntensity(draft.decoration_intensity),
      ornament_side: sanitizeOrnamentSide(draft.ornament_side),
      tokens: nextTokens,
    };

    const result = draft.id
      ? await updateThemeAdmin(draft.id, payload)
      : await createThemeAdmin(payload);

    setSavingForm(false);

    if (result.error) {
      setFormError(result.error);
      toast(result.error, 'error');
      return;
    }

    // If we just edited the currently active theme, update cache & storefront
    if (result.theme?.is_active) {
      if (isThemeWithinWindow(result.theme)) {
        saveThemeCache(result.theme);
      } else {
        clearThemeCache();
      }
      notifySeasonalThemeUpdated();
    }

    setEditorOpen(false);
    await loadThemes();
    const msg = draft.id
      ? `Updated theme "${result.theme?.name || cleanName}".`
      : `Created custom theme "${result.theme?.name || cleanName}".`;
    setSuccessMsg(msg);
    toast(msg, 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Feedback Banners */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3.5 flex items-center gap-3 text-red-400 text-[12px]">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3.5 flex items-center gap-3 text-emerald-400 text-[12px]">
          <Check size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── 1. ORIGINAL THEME CARD (Always the base, never modified) ── */}
      <div className="bg-[#141410] border border-white/[0.08] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <ShieldCheck size={18} className="text-[#c9a96e]" />
            <h2 className="text-[16px] font-bold text-white">
              Original theme (always the base)
            </h2>
            {!isSeasonalCurrentlyLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/50 border border-white/10">
                Base layer ({activeRow?.name} overlaid)
              </span>
            )}
          </div>
          <p className="text-[12px] text-white/45 max-w-2xl leading-relaxed">
            The 44LUXURY signature Burgundy &amp; Bone palette is permanent and never modified. Turning on a seasonal theme applies a thin layer on top; turning it off or reaching its end date immediately restores this exact original look.
          </p>

          {/* Original Swatches (Read-only) */}
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            {COLOR_FIELDS.map((cf) => (
              <div key={cf.key} className="flex items-center gap-2 text-[11px] text-white/55">
                <span
                  className="w-4 h-4 border border-white/25 shrink-0"
                  style={{ backgroundColor: ORIGINAL_THEME_TOKENS[cf.key] }}
                />
                <span>{cf.label}:</span>
                <code className="text-white/75 font-mono text-[10px]">
                  {ORIGINAL_THEME_TOKENS[cf.key]}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={!activeRow || busyActionId === 'turn-off-all'}
            onClick={handleTurnOffAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Power size={14} />
            {busyActionId === 'turn-off-all'
              ? 'Turning off…'
              : 'Turn off seasonal theme'}
          </button>
        </div>
      </div>

      {/* ── 2. SEASONAL THEMES HEADER + CREATE BUTTON ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Seasonal &amp; Holiday Themes</h2>
          <p className="text-[11px] text-white/40 mt-0.5">
            Only one seasonal theme can be turned on at a time. Preview any theme in a new tab before turning it on for visitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadThemes}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors"
          >
            <Plus size={14} />
            Create Custom Theme
          </button>
        </div>
      </div>

      {/* ── 3. THEME CARDS GRID ── */}
      {themes.length === 0 ? (
        <div className="bg-[#141410] border border-white/[0.06] rounded-2xl p-12 text-center text-white/35 text-sm">
          No seasonal themes found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {themes.map((theme) => {
            const status = getThemeStatus(theme);
            const badge = getStatusBadgeProps(status);
            const tokens = sanitizeThemeTokens(theme.tokens);
            const decKeys = sanitizeDecorationsArray(theme.decorations, theme.decoration);
            const intensity = sanitizeIntensity(theme.decoration_intensity);
            const side = sanitizeOrnamentSide(theme.ornament_side);
            const isBusy = busyActionId === theme.id;

            return (
              <div
                key={theme.id}
                className={`bg-[#141410] border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors ${
                  theme.is_active
                    ? 'border-[#c9a96e]/60 shadow-lg'
                    : 'border-white/[0.07] hover:border-white/15'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Top: Name, Preset/Custom tag, Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[15px] font-bold text-white">{theme.name}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/45 border border-white/10">
                          {theme.is_preset ? 'Preset' : 'Custom'}
                        </span>
                        {Boolean(theme.tokens?.page_bg) && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <Moon size={10} />
                            Dark palette
                          </span>
                        )}
                      </div>
                      {theme.description && (
                        <p className="text-[11px] text-white/45 mt-1 leading-relaxed">
                          {theme.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${badge.cls}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Mini Preview Strip */}
                  <ThemeMiniPreview
                    tokens={tokens}
                    announcementText={theme.announcement_text}
                    themeName={theme.name}
                  />

                  {/* Color Swatches */}
                  <div className="flex items-center justify-between gap-2 bg-[#0f0f0c] border border-white/[0.06] rounded-xl px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Swatches
                    </span>
                    <div className="flex items-center gap-1.5">
                      {COLOR_FIELDS.map((cf) => (
                        <div
                          key={cf.key}
                          title={`${cf.label}: ${tokens[cf.key]}`}
                          className="w-5 h-5 border border-white/25"
                          style={{ backgroundColor: tokens[cf.key] }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Decoration Chips & Schedule Info */}
                  <div className="space-y-2 text-[11px] text-white/55">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white/35">Decorations:</span>
                        {decKeys.length > 0 && (
                          <span className="text-[10px] text-white/45 uppercase tracking-wider">
                            {intensity} · {side} corner
                          </span>
                        )}
                      </div>
                      {decKeys.length === 0 ? (
                        <span className="text-white/35 text-[11px]">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {decKeys.map((dk) => (
                            <span
                              key={dk}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-white/80"
                            >
                              <span className="text-[#c9a96e]">
                                <DecorationChipIcon type={dk} />
                              </span>
                              {DECORATION_META[dk]?.label || dk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2 pt-1">
                      <span className="text-white/35 shrink-0">Schedule:</span>
                      <span className="text-right text-white/75">
                        {theme.starts_at || theme.ends_at
                          ? formatScheduleSummary(theme.starts_at, theme.ends_at)
                          : 'No schedule restriction'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                  {theme.is_active ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={handleTurnOffAll}
                      className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {isBusy ? 'Updating…' : 'Turn off'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setConfirmTurnOnTheme(theme)}
                      className="px-3.5 py-2 rounded-xl bg-[#c9a96e] hover:bg-[#d4b87e] text-[#0a0a08] text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {isBusy ? 'Updating…' : 'Turn on'}
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openPreviewTab(theme)}
                      title="Preview in new tab"
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(theme)}
                      title="Edit theme"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/65 hover:text-white transition-colors"
                      aria-label={`Edit ${theme.name}`}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDuplicateModal(theme)}
                      title="Duplicate theme"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/65 hover:text-white transition-colors"
                      aria-label={`Duplicate ${theme.name}`}
                    >
                      <Copy size={13} />
                    </button>
                    {!theme.is_preset && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTheme(theme)}
                        title="Delete custom theme"
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                        aria-label={`Delete ${theme.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CONFIRM DIALOG: TURN ON SEASONAL THEME ── */}
      {confirmTurnOnTheme && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-turn-on-theme-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="bg-[#141410] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 id="confirm-turn-on-theme-title" className="text-lg font-bold text-white">
              Turn on &ldquo;{confirmTurnOnTheme.name}&rdquo;?
            </h3>
            <p className="text-[13px] text-white/80 leading-relaxed">
              {getThemeStatus({ ...confirmTurnOnTheme, is_active: true }) === 'Scheduled' &&
              confirmTurnOnTheme.starts_at ? (
                <>
                  This theme will change the storefront colors for all visitors from{' '}
                  <strong className="text-[#c9a96e]">
                    {formatDateTimeDisplay(confirmTurnOnTheme.starts_at)} ({timeZoneLabel})
                  </strong>
                  .
                </>
              ) : (
                <>
                  This theme will change the storefront colors for all visitors{' '}
                  <strong className="text-[#c9a96e]">now</strong>.
                </>
              )}
            </p>
            {activeRow && activeRow.id !== confirmTurnOnTheme.id && (
              <p className="text-[12px] text-amber-300/90 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3.5 py-2.5">
                Turning this on will automatically turn off &ldquo;{activeRow.name}&rdquo;.
              </p>
            )}
            <ThemeMiniPreview
              tokens={confirmTurnOnTheme.tokens}
              announcementText={confirmTurnOnTheme.announcement_text}
              themeName={confirmTurnOnTheme.name}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmTurnOnTheme(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[12px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTurnOn}
                className="px-5 py-2 rounded-xl bg-[#c9a96e] hover:bg-[#d4b87e] text-[#0a0a08] text-[12px] font-bold uppercase tracking-wider transition-colors"
              >
                Confirm &amp; Turn On
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DIALOG: DELETE CUSTOM THEME ── */}
      {confirmDeleteTheme && !confirmDeleteTheme.is_preset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-theme-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="bg-[#141410] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 id="confirm-delete-theme-title" className="text-lg font-bold text-white">
              Delete Custom Theme?
            </h3>
            <p className="text-[13px] text-white/75 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">&ldquo;{confirmDeleteTheme.name}&rdquo;</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteTheme(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[12px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold uppercase tracking-wider transition-colors"
              >
                Delete Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT THEME MODAL ── */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="theme-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
        >
          <div className="bg-[#141410] border border-white/15 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 id="theme-editor-title" className="text-lg font-bold text-white">
                  {draft.id ? `Edit Theme: ${draft.name}` : 'Create Custom Seasonal Theme'}
                </h3>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Configure accent colors, announcement banner, falling &amp; corner decorations, and optional schedule window.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2.5 text-red-400 text-[12px]">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Live Decoration & Storefront Preview inside Modal */}
            <DecorationLivePreviewFrame
              tokens={draft.tokens}
              announcementText={draft.announcement_text}
              themeName={draft.name || 'Custom Theme'}
              themeSlug={draft.slug || ''}
              decorations={draft.decorations}
              intensity={draft.decoration_intensity}
              ornamentSide={draft.ornament_side}
              previewDevice={previewDevice}
              onChangeDevice={setPreviewDevice}
            />

            {/* WCAG Contrast Warnings */}
            {contrastWarnings.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
                {contrastWarnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-amber-300 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveDraft} className="space-y-5">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                    Theme Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.name}
                    onChange={(e) => {
                      const nextName = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        name: nextName,
                        slug: slugManuallyEdited
                          ? prev.slug
                          : buildUniqueSlug(nextName, themes, prev.id),
                      }));
                    }}
                    placeholder="e.g. Valentine's Day"
                    className="w-full bg-[#0f0f0c] border border-white/10 focus:border-[#c9a96e] rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(draft.id && draft.is_preset)}
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setDraft((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder="valentines-day"
                    className="w-full bg-[#0f0f0c] border border-white/10 focus:border-[#c9a96e] rounded-xl px-3.5 py-2.5 text-[13px] text-white font-mono outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={draft.description}
                  onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Romantic crimson & rose palette for Valentine's season"
                  className="w-full bg-[#0f0f0c] border border-white/10 focus:border-[#c9a96e] rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none"
                />
              </div>

              {/* 5 Color Token Pickers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    Theme Colors (Hex)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        tokens: { ...ORIGINAL_THEME_TOKENS },
                      }))
                    }
                    className="text-[10px] text-[#c9a96e] hover:underline"
                  >
                    Reset colors to Original
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_FIELDS.map((cf) => {
                    const val = draft.tokens?.[cf.key] || '';
                    const valid = isValidHexColor(val);
                    const pickerValue = valid ? expandHexColor(val) : ORIGINAL_THEME_TOKENS[cf.key];
                    return (
                      <div
                        key={cf.key}
                        className="bg-[#0f0f0c] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-white">{cf.label}</p>
                          <p className="text-[10px] text-white/35 truncate">{cf.hint}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            aria-label={`${cf.label} color picker`}
                            value={pickerValue}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                tokens: {
                                  ...prev.tokens,
                                  [cf.key]: e.target.value,
                                },
                              }))
                            }
                            className="w-8 h-8 bg-transparent border border-white/20 cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            aria-label={`${cf.label} hex code`}
                            value={val}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                tokens: {
                                  ...prev.tokens,
                                  [cf.key]: e.target.value,
                                },
                              }))
                            }
                            placeholder="#4b0e1e"
                            className={`w-24 bg-[#141410] border rounded-lg px-2.5 py-1.5 text-[12px] font-mono text-white outline-none ${
                              valid ? 'border-white/15 focus:border-[#c9a96e]' : 'border-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── COLLAPSIBLE DARK PAGE PALETTE SECTION (off by default) ── */}
              <div className="bg-[#0f0f0c] border border-white/[0.08] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDarkSectionOpen((prev) => !prev)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Moon size={14} className="text-[#c9a96e]" />
                    <span className="text-[12px] font-bold text-white">
                      Dark page palette
                    </span>
                    {draft.tokens?.page_bg ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        Enabled
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/35">
                        Optional (Off)
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-white/50 transition-transform ${
                      darkSectionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {darkSectionOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-[10px] text-white/45">
                        Optional full dark page palette (used by Halloween). Applies on public pages only — checkout, payment, and auth routes always keep the original light look.
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        {!draft.tokens?.page_bg ? (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                tokens: {
                                  ...prev.tokens,
                                  ...DEFAULT_DARK_PALETTE_PRESET,
                                },
                              }))
                            }
                            className="text-[10px] font-semibold text-[#c9a96e] hover:underline"
                          >
                            Fill dark preset
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((prev) => {
                                const next = { ...prev.tokens };
                                for (const k of DARK_PALETTE_KEYS) {
                                  delete next[k];
                                }
                                return { ...prev, tokens: next };
                              })
                            }
                            className="text-[10px] font-semibold text-red-300 hover:underline"
                          >
                            Clear dark palette
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DARK_COLOR_FIELDS.map((df) => {
                        const val = draft.tokens?.[df.key] || '';
                        const hasVal = String(val).trim().length > 0;
                        const valid = !hasVal || isValidHexColor(val);
                        const pickerValue = isValidHexColor(val)
                          ? expandHexColor(val)
                          : DEFAULT_DARK_PALETTE_PRESET[df.key];

                        return (
                          <div
                            key={df.key}
                            className="bg-[#141410] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-white">{df.label}</p>
                              <p className="text-[10px] text-white/35 truncate">{df.hint}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                type="color"
                                aria-label={`${df.label} color picker`}
                                value={pickerValue}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    tokens: {
                                      ...prev.tokens,
                                      [df.key]: e.target.value,
                                    },
                                  }))
                                }
                                className="w-8 h-8 bg-transparent border border-white/20 cursor-pointer p-0"
                              />
                              <input
                                type="text"
                                aria-label={`${df.label} hex code`}
                                value={val}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    tokens: {
                                      ...prev.tokens,
                                      [df.key]: e.target.value,
                                    },
                                  }))
                                }
                                placeholder={df.placeholder}
                                className={`w-24 bg-[#0f0f0c] border rounded-lg px-2.5 py-1.5 text-[12px] font-mono text-white outline-none ${
                                  valid ? 'border-white/15 focus:border-[#c9a96e]' : 'border-red-500'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── DECORATIONS MULTI-SELECT CHIPS, INTENSITY & ORNAMENT SIDE ── */}
              <div className="bg-[#0f0f0c] border border-white/[0.08] rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-[12px] font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#c9a96e]" />
                      Seasonal Decorations ({(draft.decorations || []).length} selected)
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      Combine falling effects, a header character pair, ornaments, and surprise animations.
                    </p>
                  </div>
                  {(draft.decorations || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, decorations: [] }))}
                      className="text-[10px] text-white/50 hover:text-white underline"
                    >
                      Clear all decorations
                    </button>
                  )}
                </div>

                {/* Gentle non-blocking warning when more than 7 decorations are selected */}
                {(draft.decorations || []).length > 7 && (
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2 flex items-center gap-2 text-[11px] text-amber-300">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>Fewer decorations look more premium.</span>
                  </div>
                )}

                {/* Group 1: Falling effects */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Falling effects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FALLING_DECORATION_KEYS.map((key) => {
                      const selected = (draft.decorations || []).includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleDraftDecoration(key)}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all ${
                            selected
                              ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]'
                              : 'bg-[#141410] text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <DecorationChipIcon type={key} />
                          {DECORATION_META[key]?.label || key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Group 2: Header characters (choose one pair) */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Header characters (choose one pair)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {HEADER_CHARACTER_KEYS.map((key) => {
                      const selected = (draft.decorations || []).includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleDraftDecoration(key)}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all ${
                            selected
                              ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]'
                              : 'bg-[#141410] text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <DecorationChipIcon type={key} />
                          {DECORATION_META[key]?.label || key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Group 3: Corner and edge ornaments */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Corner and edge ornaments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ORNAMENT_DECORATION_KEYS.map((key) => {
                      const selected = (draft.decorations || []).includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleDraftDecoration(key)}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all ${
                            selected
                              ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]'
                              : 'bg-[#141410] text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <DecorationChipIcon type={key} />
                          {DECORATION_META[key]?.label || key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Group 4: Surprise animations */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Surprise animations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SURPRISE_DECORATION_KEYS.map((key) => {
                      const selected = (draft.decorations || []).includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleDraftDecoration(key)}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all ${
                            selected
                              ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]'
                              : 'bg-[#141410] text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <DecorationChipIcon type={key} />
                          {DECORATION_META[key]?.label || key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Intensity & Ornament Side Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/45 mb-1.5">
                      Intensity (Particle Count)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-[#141410] p-1 border border-white/10">
                      {VALID_INTENSITIES.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({ ...prev, decoration_intensity: lvl }))
                          }
                          className={`py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            draft.decoration_intensity === lvl
                              ? 'bg-[#c9a96e] text-[#0a0a08]'
                              : 'text-white/55 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/45 mb-1.5">
                      Ornament Side (Corner Ornaments)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-[#141410] p-1 border border-white/10">
                      {VALID_ORNAMENT_SIDES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, ornament_side: s }))}
                          className={`py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            draft.ornament_side === s
                              ? 'bg-[#c9a96e] text-[#0a0a08]'
                              : 'text-white/55 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcement Bar Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                    Announcement Bar Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={draft.announcement_text}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, announcement_text: e.target.value }))
                    }
                    placeholder="e.g. HOLIDAY SEASON — COMPLIMENTARY GIFT WRAPPING"
                    className="w-full bg-[#0f0f0c] border border-white/10 focus:border-[#c9a96e] rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                    Announcement Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={draft.announcement_link}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, announcement_link: e.target.value }))
                    }
                    placeholder="/shop or https://..."
                    className="w-full bg-[#0f0f0c] border border-white/10 focus:border-[#c9a96e] rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none"
                  />
                </div>
              </div>

              {/* Schedule Window using the exact same DateTimePopoverPicker component as Sales */}
              <div className="bg-[#0f0f0c] border border-white/[0.08] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#c9a96e]" />
                  <span className="text-[12px] font-bold text-white">
                    Optional Schedule Window
                  </span>
                  <span className="text-[10px] text-white/35">({timeZoneLabel})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {createElement(DateTimePicker, {
                    label: 'Starts At (Optional)',
                    valueIso: draft.starts_at,
                    onChangeIso: (iso) => setDraft((prev) => ({ ...prev, starts_at: iso })),
                    defaultHour24: 0,
                    defaultMinute: 0,
                    placeholder: 'Immediate when turned on',
                  })}
                  {createElement(DateTimePicker, {
                    label: 'Ends At (Optional)',
                    valueIso: draft.ends_at,
                    onChangeIso: (iso) => setDraft((prev) => ({ ...prev, ends_at: iso })),
                    defaultHour24: 23,
                    defaultMinute: 59,
                    minIso: draft.starts_at,
                    placeholder: 'Until manually turned off',
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[12px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingForm}
                  className="px-6 py-2.5 rounded-xl bg-[#c9a96e] hover:bg-[#d4b87e] text-[#0a0a08] text-[12px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {savingForm ? 'Saving…' : draft.id ? 'Save Theme Changes' : 'Create Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
