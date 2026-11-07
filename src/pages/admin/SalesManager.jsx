import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Tag,
  Check,
  AlertCircle,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Package,
  Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  getStoreSale,
  updateStoreSale,
  updateProductDiscountsBatch,
  NO_ADMIN_SESSION_MESSAGE,
} from '../../services/saleService';
import { getAllProducts } from '../../services/admin/productAdminService';
import { useSiteStore } from '../../store/useSiteStore';
import { toast } from '../../components/ui/ToastProvider';
import {
  ALL_PRODUCT_CATEGORIES,
  clampPercent,
  roundNGN,
  isStoreSaleActive,
  getStoreSaleStatus,
  getEffectivePrice,
} from '../../utils/pricing';
import SeasonalThemesTab from '../../components/admin/SeasonalThemesTab';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getLocalTimeZoneLabel() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const shortOffset =
      new Intl.DateTimeFormat('en-US', { timeZoneName: 'shortOffset' })
        .formatToParts(new Date())
        .find((p) => p.type === 'timeZoneName')?.value || '';
    return tz ? `${tz}${shortOffset ? ` (${shortOffset})` : ''}` : 'Local Time';
  } catch {
    return 'Local Time';
  }
}

function isSameLocalDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function formatDateTimeDisplay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatShortDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatScheduleSummary(startsAt, endsAt) {
  if (!startsAt && !endsAt) {
    return 'No schedule restriction — runs continuously while switched ON.';
  }
  const s = startsAt ? new Date(startsAt) : null;
  const e = endsAt ? new Date(endsAt) : null;
  const sValid = s && !Number.isNaN(s.getTime());
  const eValid = e && !Number.isNaN(e.getTime());

  if (sValid && eValid) {
    const diffMs = e.getTime() - s.getTime();
    const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    return `Runs ${formatShortDateTime(startsAt)} to ${formatShortDateTime(endsAt)} (${days} day${days === 1 ? '' : 's'})`;
  }
  if (sValid) {
    return `Starts ${formatShortDateTime(startsAt)} (no end date set)`;
  }
  if (eValid) {
    return `Runs now until ${formatShortDateTime(endsAt)}`;
  }
  return 'No schedule restriction';
}

/**
 * Custom Popover Calendar + Time Selector (Section B)
 */
function DateTimePopoverPicker({
  label,
  valueIso,
  onChangeIso,
  defaultHour24 = 0,
  defaultMinute = 0,
  minIso = null,
  placeholder = 'Select date & time',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDate = useMemo(() => {
    if (!valueIso) return null;
    const d = new Date(valueIso);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [valueIso]);

  const minDate = useMemo(() => {
    if (!minIso) return null;
    const d = new Date(minIso);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [minIso]);

  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const hour24 = selectedDate ? selectedDate.getHours() : defaultHour24;
  const minute = selectedDate ? selectedDate.getMinutes() : defaultMinute;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const buildCells = () => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  };

  const cells = buildCells();
  const today = new Date();

  const isDayDisabled = (dayDate) => {
    if (!dayDate || !minDate) return false;
    return startOfLocalDay(dayDate).getTime() < startOfLocalDay(minDate).getTime();
  };

  const handleSelectDay = (dayDate) => {
    if (!dayDate || isDayDisabled(dayDate)) return;
    const h = selectedDate ? selectedDate.getHours() : defaultHour24;
    const m = selectedDate ? selectedDate.getMinutes() : defaultMinute;
    const next = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate(),
      h,
      m,
      0,
      0
    );
    if (minDate && next.getTime() < minDate.getTime()) {
      onChangeIso(new Date(minDate.getTime()).toISOString());
      return;
    }
    onChangeIso(next.toISOString());
  };

  const updateTimePart = (newHour12, newMinute, newPeriod) => {
    const base = selectedDate || new Date();
    let h24 = Number(newHour12) % 12;
    if (newPeriod === 'PM') h24 += 12;
    const m = Math.min(59, Math.max(0, Number(newMinute) || 0));
    const next = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      h24,
      m,
      0,
      0
    );
    if (minDate && next.getTime() < minDate.getTime()) {
      toast('End date/time cannot be before the start date/time.', 'error');
      return;
    }
    onChangeIso(next.toISOString());
  };

  const applyPreset = (type) => {
    const now = new Date();
    let target = new Date();
    if (type === 'now') {
      target = now;
    } else if (type === 'tomorrow_start') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    } else if (type === 'in_7_days') {
      target = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 7,
        defaultHour24,
        defaultMinute,
        0,
        0
      );
    } else if (type === 'end_of_month') {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 0, 0);
    }

    if (minDate && target.getTime() < minDate.getTime()) {
      toast('End date/time cannot be before the start date/time.', 'error');
      return;
    }

    onChangeIso(target.toISOString());
    setViewMonth(new Date(target.getFullYear(), target.getMonth(), 1));
  };

  const isBeforeMin =
    selectedDate && minDate && selectedDate.getTime() < minDate.getTime();

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
          {label}
        </label>
        {valueIso && (
          <button
            type="button"
            onClick={() => onChangeIso(null)}
            className="inline-flex items-center gap-1 text-[10px] text-white/40 hover:text-red-400 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (!open && selectedDate) {
            setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
          }
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        className={`w-full flex items-center justify-between bg-[#0f0f0c] border rounded-xl px-4 py-3 text-left text-[13px] transition-colors ${
          isBeforeMin
            ? 'border-red-500/60 text-red-300'
            : open
            ? 'border-[#c9a96e] text-white'
            : 'border-white/[0.08] hover:border-white/25 text-white'
        }`}
      >
        <span className={valueIso ? 'text-white font-medium' : 'text-white/30'}>
          {valueIso ? formatDateTimeDisplay(valueIso) : placeholder}
        </span>
        <Calendar size={15} className="text-[#c9a96e] shrink-0 ml-2" />
      </button>

      {isBeforeMin && (
        <p className="mt-1.5 text-[11px] text-red-400">
          End date/time cannot be before the start date/time.
        </p>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-full mt-2 z-40 w-full min-w-[300px] sm:w-[340px] bg-[#141410] border border-white/15 rounded-2xl shadow-2xl p-4 space-y-4"
        >
          {/* Month Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                )
              }
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[13px] font-bold text-white tracking-wide">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                )
              }
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="text-[10px] font-semibold uppercase tracking-wider text-white/35 py-1"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((dayDate, idx) => {
              if (!dayDate) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }
              const disabled = isDayDisabled(dayDate);
              const isSelected = isSameLocalDay(dayDate, selectedDate);
              const isToday = isSameLocalDay(dayDate, today);

              return (
                <button
                  key={dayDate.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(dayDate)}
                  className={`h-8 rounded-lg text-[12px] font-medium transition-all flex items-center justify-center ${
                    disabled
                      ? 'text-white/15 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#c9a96e] text-[#0a0a08] font-bold shadow'
                      : isToday
                      ? 'border border-[#c9a96e]/60 text-[#c9a96e] hover:bg-[#c9a96e]/15'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {dayDate.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time Selector */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              <Clock size={12} className="text-[#c9a96e]" />
              <span>Time</span>
            </div>

            <div className="flex items-center gap-1.5">
              <select
                aria-label="Hour"
                value={hour12}
                onChange={(e) => updateTimePart(Number(e.target.value), minute, period)}
                className="bg-[#0a0a08] border border-white/15 rounded-lg px-2 py-1 text-[12px] text-white outline-none focus:border-[#c9a96e]"
              >
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-white/40 font-bold">:</span>
              <select
                aria-label="Minute"
                value={minute}
                onChange={(e) => updateTimePart(hour12, Number(e.target.value), period)}
                className="bg-[#0a0a08] border border-white/15 rounded-lg px-2 py-1 text-[12px] text-white outline-none focus:border-[#c9a96e]"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <div className="inline-flex rounded-lg border border-white/15 overflow-hidden bg-[#0a0a08]">
                {['AM', 'PM'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateTimePart(hour12, minute, p)}
                    className={`px-2 py-1 text-[11px] font-bold transition-colors ${
                      period === p
                        ? 'bg-[#c9a96e] text-[#0a0a08]'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('now')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/75 transition-colors"
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow_start')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/75 transition-colors"
              >
                Tomorrow 12:00 AM
              </button>
              <button
                type="button"
                onClick={() => applyPreset('in_7_days')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/75 transition-colors"
              >
                In 7 days
              </button>
              <button
                type="button"
                onClick={() => applyPreset('end_of_month')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/75 transition-colors"
              >
                End of this month 11:59 PM
              </button>
              <button
                type="button"
                onClick={() => onChangeIso(null)}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-[11px] text-red-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-[#c9a96e] text-[#0a0a08] text-[11px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeCategoryDiscountsObject(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = String(k || '').trim();
    if (!key) continue;
    if (v === null || v === undefined || String(v).trim() === '') continue;
    const num = Number(v);
    if (Number.isFinite(num)) {
      out[key] = clampPercent(num);
    }
  }
  return out;
}

export default function SalesManager() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [products, setProducts] = useState([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Store-wide sale form state
  const [form, setForm] = useState({
    is_active: false,
    discount_percent: 30,
    label: 'BLACK FRIDAY SALE',
    starts_at: null,
    ends_at: null,
    applies_to_categories: [],
    category_discounts: {},
  });

  const [baselineSaleForm, setBaselineSaleForm] = useState({
    is_active: false,
    discount_percent: 30,
    label: 'BLACK FRIDAY SALE',
    starts_at: null,
    ends_at: null,
    applies_to_categories: [],
    category_discounts: {},
  });

  // Per-product discount baseline & draft state: id -> { discount_enabled, discount_percent, sale_excluded }
  const [baselineMap, setBaselineMap] = useState({});
  const [draftMap, setDraftMap] = useState({});

  // Product table toolbar & bulk selection state
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPercent, setBulkPercent] = useState('');

  const timeZoneLabel = useMemo(() => getLocalTimeZoneLabel(), []);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');

    const [{ sale, error: saleErr }, { products: prodData, error: prodErr }] =
      await Promise.all([getStoreSale(), getAllProducts()]);

    if (saleErr || prodErr) {
      setErrorMsg(saleErr || prodErr);
    }

    if (sale) {
      const catDiscountsStrings = {};
      if (sale.category_discounts && typeof sale.category_discounts === 'object') {
        for (const [k, v] of Object.entries(sale.category_discounts)) {
          if (v !== null && v !== undefined && String(v).trim() !== '') {
            catDiscountsStrings[k] = String(clampPercent(v));
          }
        }
      }
      const loadedSaleForm = {
        is_active: Boolean(sale.is_active),
        discount_percent: Number(sale.discount_percent ?? 0),
        label: sale.label || 'BLACK FRIDAY SALE',
        starts_at: sale.starts_at || null,
        ends_at: sale.ends_at || null,
        applies_to_categories: Array.isArray(sale.applies_to_categories)
          ? sale.applies_to_categories.filter(Boolean)
          : [],
        category_discounts: catDiscountsStrings,
      };
      setForm(loadedSaleForm);
      setBaselineSaleForm(loadedSaleForm);
    }

    const list = prodData || [];
    setProducts(list);

    const initialMap = {};
    for (const p of list) {
      const excluded = Boolean(p.sale_excluded);
      const pct = excluded ? 0 : clampPercent(p.discount_percent);
      const enabled = !excluded && Boolean(p.discount_enabled) && pct > 0;
      initialMap[p.id] = {
        discount_enabled: enabled,
        discount_percent: enabled ? pct : 0,
        sale_excluded: excluded,
      };
    }
    setBaselineMap(initialMap);
    setDraftMap(initialMap);
    setSelectedIds([]);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  // Distinct real categories from ALL_PRODUCT_CATEGORIES + DB products
  const categories = useMemo(() => {
    const set = new Set(ALL_PRODUCT_CATEGORIES);
    for (const p of products) {
      const cat = (p.subcategory || '').trim();
      if (cat) set.add(cat);
    }
    return Array.from(set);
  }, [products]);

  const clothingCategories = useMemo(
    () => categories.filter((c) => c.toLowerCase() !== 'footwear'),
    [categories]
  );

  // Category selection & per-category discount handlers (Section A)
  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.applies_to_categories.some(
        (c) => c.toLowerCase() === cat.toLowerCase()
      );
      const next = exists
        ? prev.applies_to_categories.filter((c) => c.toLowerCase() !== cat.toLowerCase())
        : [...prev.applies_to_categories, cat];
      return { ...prev, applies_to_categories: next };
    });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const getCategoryInputString = (cat) => {
    const map = form.category_discounts || {};
    const matchKey = Object.keys(map).find(
      (k) => k.trim().toLowerCase() === cat.trim().toLowerCase()
    );
    return matchKey !== undefined ? String(map[matchKey] ?? '') : '';
  };

  const handleCategoryPercentChange = (cat, rawVal) => {
    setForm((prev) => {
      const nextMap = { ...(prev.category_discounts || {}) };
      // Remove any existing key with different casing
      for (const k of Object.keys(nextMap)) {
        if (k.trim().toLowerCase() === cat.trim().toLowerCase() && k !== cat) {
          delete nextMap[k];
        }
      }
      if (rawVal === '') {
        delete nextMap[cat];
        return { ...prev, category_discounts: nextMap };
      }
      nextMap[cat] = rawVal;
      // If typing a positive percent into a category, ensure that category is ticked
      const alreadyTicked = prev.applies_to_categories.some(
        (c) => c.toLowerCase() === cat.toLowerCase()
      );
      const nextCategories = alreadyTicked
        ? prev.applies_to_categories
        : [...prev.applies_to_categories, cat];
      return {
        ...prev,
        applies_to_categories: nextCategories,
        category_discounts: nextMap,
      };
    });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const selectAllClothing = () => {
    setForm((prev) => ({
      ...prev,
      applies_to_categories: [...clothingCategories],
    }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const clearCategories = () => {
    setForm((prev) => ({
      ...prev,
      applies_to_categories: [],
    }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const cleanedCategoryDiscounts = useMemo(
    () => normalizeCategoryDiscountsObject(form.category_discounts),
    [form.category_discounts]
  );

  // Live preview of store_sale object (with real schedule for status chip)
  const previewSaleObj = useMemo(
    () => ({
      is_active: Boolean(form.is_active),
      discount_percent: clampPercent(form.discount_percent),
      label: form.label || 'BLACK FRIDAY SALE',
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      applies_to_categories: form.applies_to_categories,
      category_discounts: cleanedCategoryDiscounts,
    }),
    [form, cleanedCategoryDiscounts]
  );

  // For the table's live Sale Price Preview (Section B):
  // Reflect the current unsaved form toggle & category settings immediately when sale is ON
  const previewSaleForTable = useMemo(
    () => ({
      ...previewSaleObj,
      starts_at: null,
      ends_at: null,
    }),
    [previewSaleObj]
  );

  // Status chip: 'Live' | 'Scheduled' | 'Ended' | 'Off'
  const saleStatus = useMemo(
    () => getStoreSaleStatus(previewSaleObj),
    [previewSaleObj]
  );

  // ── Per-Product Draft Helpers (Section C) ──

  const updateRowDraft = (id, patch) => {
    setDraftMap((prev) => {
      const current = prev[id] || {
        discount_enabled: false,
        discount_percent: 0,
        sale_excluded: false,
      };
      const merged = { ...current, ...patch };

      // Mutual exclusion rule:
      // 1. Typing a percent > 0 on an excluded row un-excludes it.
      // 2. Setting sale_excluded = true clears the product's own discount.
      if ('discount_percent' in patch && clampPercent(patch.discount_percent) > 0) {
        const pct = clampPercent(patch.discount_percent);
        merged.discount_percent = pct;
        merged.discount_enabled = true;
        merged.sale_excluded = false;
      } else if (patch.sale_excluded === true) {
        merged.sale_excluded = true;
        merged.discount_enabled = false;
        merged.discount_percent = 0;
      } else {
        const pct = merged.sale_excluded ? 0 : clampPercent(merged.discount_percent);
        merged.discount_percent = pct;
        merged.discount_enabled = !merged.sale_excluded && pct > 0;
      }

      return { ...prev, [id]: merged };
    });
    setSuccessMsg('');
  };

  // Compute list of changed product rows compared to baselineMap
  const changedRows = useMemo(() => {
    const list = [];
    for (const p of products) {
      const base = baselineMap[p.id];
      const draft = draftMap[p.id];
      if (!base || !draft) continue;

      const baseExcl = Boolean(base.sale_excluded);
      const draftExcl = Boolean(draft.sale_excluded);
      const basePct = !baseExcl && base.discount_enabled ? clampPercent(base.discount_percent) : 0;
      const draftPct =
        !draftExcl && draft.discount_enabled ? clampPercent(draft.discount_percent) : 0;
      const baseEnabled = !baseExcl && Boolean(base.discount_enabled) && basePct > 0;
      const draftEnabled = !draftExcl && Boolean(draft.discount_enabled) && draftPct > 0;

      if (
        baseEnabled !== draftEnabled ||
        basePct !== draftPct ||
        baseExcl !== draftExcl
      ) {
        list.push({
          id: p.id,
          name: p.name,
          discount_enabled: draftEnabled,
          discount_percent: draftEnabled ? draftPct : 0,
          sale_excluded: draftExcl,
        });
      }
    }
    return list;
  }, [products, baselineMap, draftMap]);

  // Check whether the store-wide sale form itself has unsaved changes
  const hasSaleFormChanges = useMemo(() => {
    if (Boolean(form.is_active) !== Boolean(baselineSaleForm.is_active)) return true;
    if (clampPercent(form.discount_percent) !== clampPercent(baselineSaleForm.discount_percent))
      return true;
    if ((form.label || '').trim() !== (baselineSaleForm.label || '').trim()) return true;
    if ((form.starts_at || null) !== (baselineSaleForm.starts_at || null)) return true;
    if ((form.ends_at || null) !== (baselineSaleForm.ends_at || null)) return true;

    const curCats = [...(form.applies_to_categories || [])].map((c) => c.toLowerCase()).sort();
    const baseCats = [...(baselineSaleForm.applies_to_categories || [])]
      .map((c) => c.toLowerCase())
      .sort();
    if (curCats.length !== baseCats.length || curCats.some((c, i) => c !== baseCats[i]))
      return true;

    const curMap = normalizeCategoryDiscountsObject(form.category_discounts);
    const baseMap = normalizeCategoryDiscountsObject(baselineSaleForm.category_discounts);
    const curKeys = Object.keys(curMap).sort();
    const baseKeys = Object.keys(baseMap).sort();
    if (curKeys.length !== baseKeys.length) return true;
    for (let i = 0; i < curKeys.length; i++) {
      const k = curKeys[i];
      if (k !== baseKeys[i] || curMap[k] !== baseMap[k]) return true;
    }

    return false;
  }, [form, baselineSaleForm]);

  const hasUnsavedChanges = hasSaleFormChanges || changedRows.length > 0;

  // Build enriched product rows with live pricing & source badge (Section B)
  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const draft = draftMap[p.id] || {
        discount_enabled: Boolean(p.discount_enabled) && !p.sale_excluded,
        discount_percent: p.sale_excluded ? 0 : clampPercent(p.discount_percent),
        sale_excluded: Boolean(p.sale_excluded),
      };
      const mergedProduct = {
        ...p,
        discount_enabled: draft.discount_enabled,
        discount_percent: draft.discount_percent,
        sale_excluded: draft.sale_excluded,
      };

      const eff = getEffectivePrice(mergedProduct, previewSaleForTable);
      const hasManualMarkdown =
        roundNGN(p.compare_price ?? p.comparePrice) > roundNGN(p.price);

      // Source badge values required by Section B:
      // "Product discount -X%", "Category -X%", "Store sale -X%", "Excluded", "No discount"
      let sourceBadge = {
        label: 'No discount',
        cls: 'bg-white/5 text-white/40 border border-white/10',
      };
      if (eff.source === 'excluded' || draft.sale_excluded) {
        sourceBadge = {
          label: 'Excluded',
          cls: 'bg-red-500/15 text-red-300 border border-red-500/30',
        };
      } else if (eff.source === 'product' && eff.isOnSale) {
        sourceBadge = {
          label: `Product discount -${eff.discountPercent}%`,
          cls: 'bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/30',
        };
      } else if (eff.source === 'category' && eff.isOnSale) {
        sourceBadge = {
          label: `Category -${eff.discountPercent}%`,
          cls: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
        };
      } else if (eff.source === 'store' && eff.isOnSale) {
        sourceBadge = {
          label: `Store sale -${eff.discountPercent}%`,
          cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        };
      }

      return {
        product: p,
        draft,
        eff,
        hasManualMarkdown,
        sourceBadge,
      };
    });
  }, [products, draftMap, previewSaleForTable]);

  // Filtered rows for the table
  const filteredRows = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return enrichedProducts.filter(({ product: p, eff }) => {
      if (q && !(p.name || '').toLowerCase().includes(q)) {
        return false;
      }
      if (categoryFilter) {
        const cat = (p.subcategory || p.category || '').toLowerCase();
        if (cat !== categoryFilter.toLowerCase()) return false;
      }
      if (onlyDiscounted && !eff.isOnSale) {
        return false;
      }
      return true;
    });
  }, [enrichedProducts, productSearch, categoryFilter, onlyDiscounted]);

  const filteredIds = useMemo(
    () => filteredRows.map((r) => r.product.id),
    [filteredRows]
  );

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

  // Select-all applies to the filtered rows only
  const handleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredIds);
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Select all N in the active category chip
  const handleSelectAllInCategory = () => {
    setSelectedIds(filteredIds);
    toast(
      `Selected all ${filteredIds.length} product${filteredIds.length === 1 ? '' : 's'} in ${categoryFilter}.`,
      'success'
    );
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Bulk actions on selectedIds (Section C)
  const handleBulkApplyPercent = () => {
    if (selectedIds.length === 0) {
      toast('Select products first', 'error');
      return;
    }
    const raw = Number(bulkPercent);
    if (String(bulkPercent).trim() === '' || !Number.isFinite(raw) || raw < 0 || raw > 100) {
      toast('Enter a valid discount percentage between 0 and 100.', 'error');
      return;
    }
    const pct = clampPercent(raw);
    setDraftMap((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        next[id] = {
          discount_enabled: pct > 0,
          discount_percent: pct,
          sale_excluded: false,
        };
      }
      return next;
    });
    setSuccessMsg('');
    toast(
      `Applied ${pct}% discount to ${selectedIds.length} product${selectedIds.length === 1 ? '' : 's'} (pending save).`,
      'success'
    );
  };

  const handleBulkClearDiscount = () => {
    if (selectedIds.length === 0) {
      toast('Select products first', 'error');
      return;
    }
    const count = selectedIds.length;
    setDraftMap((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        const cur = next[id] || {
          discount_enabled: false,
          discount_percent: 0,
          sale_excluded: false,
        };
        next[id] = {
          ...cur,
          discount_enabled: false,
          discount_percent: 0,
        };
      }
      return next;
    });
    setSuccessMsg('');
    toast(`Cleared ${count} product${count === 1 ? '' : 's'}`, 'success');
  };

  const handleBulkExcludeFromSale = () => {
    if (selectedIds.length === 0) {
      toast('Select products first', 'error');
      return;
    }
    const count = selectedIds.length;
    setDraftMap((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        next[id] = {
          discount_enabled: false,
          discount_percent: 0,
          sale_excluded: true,
        };
      }
      return next;
    });
    setSuccessMsg('');
    toast(`Excluded ${count} product${count === 1 ? '' : 's'} from sale`, 'success');
  };

  const handleBulkIncludeInSale = () => {
    if (selectedIds.length === 0) {
      toast('Select products first', 'error');
      return;
    }
    const count = selectedIds.length;
    setDraftMap((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        const cur = next[id] || {
          discount_enabled: false,
          discount_percent: 0,
          sale_excluded: false,
        };
        next[id] = {
          ...cur,
          sale_excluded: false,
        };
      }
      return next;
    });
    setSuccessMsg('');
    toast(`Included ${count} product${count === 1 ? '' : 's'} in sale`, 'success');
  };

  // Summary counts for Review Changes (Section D)
  const ownDiscountedCount = useMemo(
    () =>
      Object.values(draftMap).filter(
        (d) => !d?.sale_excluded && Boolean(d?.discount_enabled) && clampPercent(d?.discount_percent) > 0
      ).length,
    [draftMap]
  );

  const excludedCount = useMemo(
    () => Object.values(draftMap).filter((d) => Boolean(d?.sale_excluded)).length,
    [draftMap]
  );

  const reviewWarnings = useMemo(() => {
    const warnings = [];
    if (form.is_active && form.applies_to_categories.length === 0) {
      if (ownDiscountedCount === 0) {
        warnings.push(
          'Sale is ON but no category is ticked and no product has its own discount (saving will be blocked).'
        );
      } else {
        warnings.push(
          `Sale is ON with no category ticked — only the ${ownDiscountedCount} product(s) with their own discount will be discounted.`
        );
      }
    }
    if (
      form.is_active &&
      form.applies_to_categories.length > 0 &&
      !isStoreSaleActive(previewSaleForTable)
    ) {
      warnings.push('Sale is ON but effective discount percentage is 0%.');
    }
    if (form.starts_at && form.ends_at) {
      const s = new Date(form.starts_at).getTime();
      const e = new Date(form.ends_at).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e < s) {
        warnings.push('End date/time is earlier than start date/time.');
      }
    }
    return warnings;
  }, [form, ownDiscountedCount, previewSaleForTable]);

  // Validate before saving
  const validateBeforeSave = () => {
    const rawPct = Number(form.discount_percent);
    if (String(form.discount_percent).trim() === '' || !Number.isFinite(rawPct) || rawPct < 0 || rawPct > 100) {
      return 'Default discount percentage must be between 0 and 100.';
    }

    for (const [cat, val] of Object.entries(form.category_discounts || {})) {
      if (val === '' || val === null || val === undefined) continue;
      const num = Number(val);
      if (!Number.isFinite(num) || num < 0 || num > 100) {
        return `Category discount for "${cat}" must be between 0 and 100.`;
      }
    }

    if (form.starts_at && form.ends_at) {
      const startMs = new Date(form.starts_at).getTime();
      const endMs = new Date(form.ends_at).getTime();
      if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs < startMs) {
        return 'End date/time cannot be before the start date/time.';
      }
    }

    if (form.is_active && form.applies_to_categories.length === 0 && ownDiscountedCount === 0) {
      return 'Cannot save with the store-wide sale ON when no categories are ticked and no product has its own discount.';
    }

    return null;
  };

  // Triggered when clicking the final "Save Sale Settings" button
  const handleFinalSaveClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setErrorMsg(NO_ADMIN_SESSION_MESSAGE);
      toast(NO_ADMIN_SESSION_MESSAGE, 'error');
      return;
    }

    const validationError = validateBeforeSave();
    if (validationError) {
      setErrorMsg(validationError);
      toast(validationError, 'error');
      return;
    }

    if (form.is_active) {
      setConfirmDialogOpen(true);
      return;
    }

    executeUnifiedSave();
  };

  // Unified save:
  // 0. Check supabase.auth.getSession() first.
  // 1. Write pending product changes first (.update(...).eq('id', id) in batches).
  // 2. If any product update fails, STOP and do not change store_sale; keep failed rows pending.
  // 3. Only if product updates succeed, write store_sale (.update(...).eq('id', 1)) LAST.
  const executeUnifiedSave = async () => {
    setConfirmDialogOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setSavingAll(true);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setSavingAll(false);
      setErrorMsg(NO_ADMIN_SESSION_MESSAGE);
      toast(NO_ADMIN_SESSION_MESSAGE, 'error');
      return;
    }

    // Step 1: Save pending product changes first
    if (changedRows.length > 0) {
      const { succeededIds, failed, authError } = await updateProductDiscountsBatch(changedRows);

      if (authError) {
        setSavingAll(false);
        setErrorMsg(authError);
        toast(authError, 'error');
        return;
      }

      if (succeededIds.length > 0) {
        const succeededSet = new Set(succeededIds);
        setBaselineMap((prev) => {
          const next = { ...prev };
          for (const row of changedRows) {
            if (succeededSet.has(row.id)) {
              next[row.id] = {
                discount_enabled: row.discount_enabled,
                discount_percent: row.discount_percent,
                sale_excluded: row.sale_excluded,
              };
            }
          }
          return next;
        });

        setProducts((prev) =>
          prev.map((p) => {
            if (!succeededSet.has(p.id)) return p;
            const draft = draftMap[p.id];
            return draft
              ? {
                  ...p,
                  discount_enabled: draft.discount_enabled,
                  discount_percent: draft.discount_percent,
                  sale_excluded: draft.sale_excluded,
                }
              : p;
          })
        );
      }

      if (failed.length > 0) {
        setSavingAll(false);
        const detail = failed.map((f) => `${f.name}: ${f.error}`).join(' | ');
        const msg = `Product update failed for ${failed.length} row(s) (${detail}). Store-wide sale was NOT modified so exclusions/discounts stay safe.`;
        setErrorMsg(msg);
        toast(msg, 'error');
        return;
      }
    }

    // Step 2: Save store_sale LAST
    const rawPct = clampPercent(form.discount_percent);
    const { sale, error } = await updateStoreSale({
      is_active: form.is_active,
      discount_percent: rawPct,
      label: (form.label || 'BLACK FRIDAY SALE').trim() || 'BLACK FRIDAY SALE',
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      applies_to_categories: form.applies_to_categories,
      category_discounts: cleanedCategoryDiscounts,
    });

    setSavingAll(false);

    if (error) {
      setErrorMsg(error);
      toast(error, 'error');
      return;
    }

    // Sync baseline form and global storefront state
    const savedStringsMap = {};
    for (const [k, v] of Object.entries(sale.category_discounts || {})) {
      savedStringsMap[k] = String(v);
    }
    const nextSaleForm = {
      is_active: Boolean(sale.is_active),
      discount_percent: Number(sale.discount_percent ?? 0),
      label: sale.label || 'BLACK FRIDAY SALE',
      starts_at: sale.starts_at || null,
      ends_at: sale.ends_at || null,
      applies_to_categories: Array.isArray(sale.applies_to_categories)
        ? sale.applies_to_categories.filter(Boolean)
        : [],
      category_discounts: savedStringsMap,
    };
    setForm(nextSaleForm);
    setBaselineSaleForm(nextSaleForm);

    useSiteStore.getState().setStoreSale(sale);
    try {
      await useSiteStore.getState().refreshProducts();
    } catch (err) {
      console.warn('Could not refresh storefront products:', err);
    }

    const msg =
      changedRows.length > 0
        ? `Saved ${changedRows.length} product update(s) and store sale settings.`
        : 'Sale settings saved.';
    setSuccessMsg(msg);
    toast(msg, 'success');
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1300px]">
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const statusBadgeConfig = {
    Live: {
      label: `LIVE (-${Math.round(clampPercent(form.discount_percent))}%)`,
      cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    Scheduled: {
      label: 'SCHEDULED',
      cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      dot: 'bg-amber-400',
    },
    Ended: {
      label: 'ENDED',
      cls: 'bg-red-500/15 text-red-400 border border-red-500/30',
      dot: 'bg-red-400',
    },
    Off: {
      label: 'OFF',
      cls: 'bg-white/5 text-white/40 border border-white/10',
      dot: 'bg-white/30',
    },
  }[saleStatus];

  const liveStartDescription =
    saleStatus === 'Scheduled' && form.starts_at
      ? `${formatDateTimeDisplay(form.starts_at)} (${timeZoneLabel})`
      : 'now';

  return (
    <div className="p-8 max-w-[1300px] space-y-8">
      {/* ── 1. HEADER & STATUS ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">
            Shop
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white tracking-tight">Sales &amp; Discounts</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeConfig.cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadgeConfig.dot}`} />
              {statusBadgeConfig.label}
            </span>
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c9a96e]/20 text-[#c9a96e] border border-[#c9a96e]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-[12px] text-white/35 mt-1">
            Configure store-wide and per-category discounts, manage individual product overrides and exclusions, then review and save at the bottom.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/70 transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── TABS: "Sales & Discounts" | "Seasonal Themes" ── */}
      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'sales'
              ? 'border-[#c9a96e] text-[#c9a96e]'
              : 'border-transparent text-white/45 hover:text-white/80'
          }`}
        >
          Sales &amp; Discounts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'themes'
              ? 'border-[#c9a96e] text-[#c9a96e]'
              : 'border-transparent text-white/45 hover:text-white/80'
          }`}
        >
          Seasonal Themes
        </button>
      </div>

      {activeTab === 'themes' ? (
        <SeasonalThemesTab
          DateTimePicker={DateTimePopoverPicker}
          formatDateTimeDisplay={formatDateTimeDisplay}
          formatScheduleSummary={formatScheduleSummary}
          timeZoneLabel={timeZoneLabel}
        />
      ) : (
        <>
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

      {/* ── 2. STORE-WIDE SALE (Toggle, Label, Default %) ── */}
      <div className="bg-[#141410] border border-white/[0.06] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-bold text-white">Store-Wide Sale</h2>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeConfig.cls}`}
              >
                {saleStatus}
              </span>
            </div>
            <p className="text-[11px] text-white/35 mt-0.5">
              Switch the store-wide sale ON or OFF, set the campaign label, and choose the default discount percentage.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_active}
            onClick={() => {
              setForm((p) => ({ ...p, is_active: !p.is_active }));
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              form.is_active ? 'bg-[#c9a96e]' : 'bg-white/15'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#0a0a08] shadow ring-0 transition duration-200 ease-in-out ${
                form.is_active ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Sale Label
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => {
                setForm((p) => ({ ...p, label: e.target.value }));
                setSuccessMsg('');
              }}
              placeholder="BLACK FRIDAY SALE"
              className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Default Discount Percentage (0–100%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step="1"
                value={form.discount_percent}
                onChange={(e) => {
                  setForm((p) => ({ ...p, discount_percent: e.target.value }));
                  setSuccessMsg('');
                }}
                placeholder="30"
                className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 pr-10 text-[13px] text-white placeholder-white/20 outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. APPLY TO CATEGORIES (Per-Category Discounts — Section A) ── */}
      <div className="bg-[#141410] border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-white">Apply to categories</h2>
            <p className="text-[11px] text-white/40 mt-0.5">
              Click a category card to tick it. Optionally enter a specific % for that category (leave blank to use the store-wide {clampPercent(form.discount_percent)}%). Empty selection discounts NO categories.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllClothing}
              className="px-3 py-1.5 rounded-lg bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/30 text-[11px] font-semibold hover:bg-[#c9a96e]/25 transition-colors"
            >
              Select all clothing
            </button>
            <button
              type="button"
              onClick={clearCategories}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 border border-white/10 text-[11px] font-semibold hover:text-white hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {categories.map((cat) => {
            const checked = form.applies_to_categories.some(
              (c) => c.toLowerCase() === cat.toLowerCase()
            );
            const isFootwear = cat.toLowerCase() === 'footwear';
            const count = products.filter(
              (p) => (p.subcategory || '').toLowerCase() === cat.toLowerCase()
            ).length;
            const customPctStr = getCategoryInputString(cat);

            return (
              <div
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl border cursor-pointer select-none transition-all ${
                  checked
                    ? 'bg-[#c9a96e]/15 border-[#c9a96e] text-white'
                    : 'bg-[#0f0f0c] border-white/[0.08] text-white/55 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                      checked
                        ? 'bg-[#c9a96e] border-[#c9a96e] text-[#0a0a08]'
                        : 'border-white/25 bg-transparent'
                    }`}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold truncate">{cat}</p>
                    <p className="text-[9px] text-white/30">
                      {count} item{count === 1 ? '' : 's'}
                      {isFootwear ? ' · shoes' : ''}
                    </p>
                  </div>
                </div>

                {/* Per-category optional % input */}
                <div
                  className="relative w-16 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="1"
                    aria-label={`${cat} discount percent`}
                    value={customPctStr}
                    placeholder={String(clampPercent(form.discount_percent))}
                    onChange={(e) => handleCategoryPercentChange(cat, e.target.value)}
                    className="w-full bg-[#0a0a08] border border-white/15 focus:border-[#c9a96e] rounded-lg px-2 py-1 pr-5 text-[11px] text-white placeholder-white/25 outline-none transition-colors"
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-white/35">
                    %
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-white/35 pt-1">
          {form.applies_to_categories.length > 0
            ? `Selected (${form.applies_to_categories.length}): ${form.applies_to_categories
                .map((cat) => {
                  const custom = cleanedCategoryDiscounts[cat];
                  return custom !== undefined
                    ? `${cat} (${custom}%)`
                    : `${cat} (${clampPercent(form.discount_percent)}%)`;
                })
                .join(', ')}`
            : 'No categories selected — the store-wide sale will not discount any category until you tick at least one.'}
        </p>
      </div>

      {/* ── 4. PRODUCT DISCOUNTS TABLE (Sections A, B, C) ── */}
      <div className="bg-[#141410] border border-white/[0.06] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-white">Product Discounts</h2>
            <p className="text-[11px] text-white/40 mt-0.5">
              Set an individual discount % on specific products, clear product discounts, or exclude items from the sale. Changes are applied when you click Save Sale Settings at the bottom.
            </p>
          </div>
          {changedRows.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/30 shrink-0">
              {changedRows.length} product row{changedRows.length === 1 ? '' : 's'} modified
            </span>
          )}
        </div>

        {/* Category Filter Chips + "Select all N in this category" (Section A) */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                categoryFilter === ''
                  ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]'
                  : 'bg-[#0f0f0c] text-white/60 border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter(
                (p) => (p.subcategory || p.category || '').toLowerCase() === cat.toLowerCase()
              ).length;
              const isActiveChip = categoryFilter.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(isActiveChip ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                    isActiveChip
                      ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]'
                      : 'bg-[#0f0f0c] text-white/60 border-white/10 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {categoryFilter && filteredIds.length > 0 && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSelectAllInCategory}
                className="px-3 py-1.5 rounded-lg bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/35 text-[11px] font-semibold hover:bg-[#c9a96e]/25 transition-colors"
              >
                Select all {filteredIds.length} in this category
              </button>
              <span className="text-[11px] text-white/40">
                Filtering by <strong className="text-white/75">{categoryFilter}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Toolbar: Search, Category Select, Show Only Discounted */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
            <div className="relative flex-1 max-w-xs min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by product name..."
                className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none transition-colors"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-3.5 py-2.5 text-[12px] text-white/75 outline-none transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <span className="text-[12px] text-white/60">Show only discounted</span>
            <button
              type="button"
              role="switch"
              aria-checked={onlyDiscounted}
              onClick={() => setOnlyDiscounted((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                onlyDiscounted ? 'bg-[#c9a96e]' : 'bg-white/15'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0a0a08] shadow transition duration-200 ${
                  onlyDiscounted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>

        {/* Bulk Actions Bar (Section C) */}
        <div className="bg-[#0f0f0c] border border-white/[0.06] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-[12px] text-white/55">
              <span className="font-bold text-white">{selectedIds.length}</span> product
              {selectedIds.length === 1 ? '' : 's'} selected
            </div>
            {selectedIds.length === 0 ? (
              <span className="text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                Select products first
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-white/40 hover:text-white underline"
              >
                Deselect all
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/45">Apply</span>
              <input
                type="number"
                min={0}
                max={100}
                value={bulkPercent}
                onChange={(e) => setBulkPercent(e.target.value)}
                placeholder="15"
                className="w-16 bg-[#141410] border border-white/15 rounded-lg px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-[#c9a96e]"
              />
              <span className="text-[11px] text-white/45">%</span>
              <button
                type="button"
                onClick={handleBulkApplyPercent}
                className={`ml-1 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                  selectedIds.length > 0
                    ? 'bg-[#c9a96e]/15 text-[#c9a96e] border-[#c9a96e]/30 hover:bg-[#c9a96e]/25'
                    : 'bg-white/5 text-white/35 border-white/10'
                }`}
              >
                Apply %
              </button>
            </div>

            <button
              type="button"
              onClick={handleBulkClearDiscount}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                selectedIds.length > 0
                  ? 'bg-white/5 text-white/75 border-white/15 hover:text-white hover:bg-white/10'
                  : 'bg-white/5 text-white/35 border-white/10'
              }`}
            >
              Clear discount
            </button>

            <button
              type="button"
              onClick={handleBulkExcludeFromSale}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                selectedIds.length > 0
                  ? 'bg-red-500/10 text-red-300 border-red-500/25 hover:bg-red-500/20'
                  : 'bg-white/5 text-white/35 border-white/10'
              }`}
            >
              Exclude from sale
            </button>

            <button
              type="button"
              onClick={handleBulkIncludeInSale}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                selectedIds.length > 0
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
                  : 'bg-white/5 text-white/35 border-white/10'
              }`}
            >
              Include in sale
            </button>
          </div>
        </div>

        {/* Scrollable Table Container with Sticky Header */}
        <div className="border border-white/[0.06] rounded-xl overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full min-w-[940px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0f0f0c] border-b border-white/[0.08]">
              <tr>
                <th className="px-4 py-3.5 text-left w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all filtered products"
                    checked={allFilteredSelected}
                    onChange={handleSelectAllFiltered}
                    className="w-4 h-4 accent-[#c9a96e] rounded cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/35 w-14">
                  Image
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Product Name
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Category
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  List Price
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Discount %
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Sale Price Preview
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Source
                </th>
                <th className="px-4 py-3.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Exclude from Sale
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-white/30 text-sm">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredRows.map(
                  ({ product: p, draft, eff, hasManualMarkdown, sourceBadge }) => {
                    const isSelected = selectedIds.includes(p.id);
                    const base = baselineMap[p.id];
                    const isDirty =
                      base &&
                      (Boolean(base.discount_enabled) !== Boolean(draft.discount_enabled) ||
                        clampPercent(base.discount_percent) !==
                          clampPercent(draft.discount_percent) ||
                        Boolean(base.sale_excluded) !== Boolean(draft.sale_excluded));

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isDirty
                            ? 'bg-[#c9a96e]/[0.05]'
                            : isSelected
                            ? 'bg-white/[0.03]'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(p.id)}
                            className="w-4 h-4 accent-[#c9a96e] rounded cursor-pointer"
                          />
                        </td>

                        {/* Image */}
                        <td className="px-3 py-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={15} className="text-white/20" />
                            )}
                          </div>
                        </td>

                        {/* Product Name + manual markdown note */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-white/85">{p.name}</p>
                            {isDirty && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#c9a96e]/20 text-[#c9a96e]">
                                Unsaved
                              </span>
                            )}
                          </div>
                          {hasManualMarkdown && (
                            <p className="text-[10px] text-amber-400/80 mt-0.5">
                              has manual markdown
                            </p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-[12px] text-white/55">
                          {p.subcategory || p.category || '—'}
                        </td>

                        {/* List Price */}
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold text-white/80">
                            ₦{roundNGN(p.price).toLocaleString()}
                          </p>
                        </td>

                        {/* Discount % (0-100 editable input) */}
                        <td className="px-4 py-3">
                          <div className="relative w-24">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step="1"
                              value={
                                !draft.sale_excluded &&
                                draft.discount_enabled &&
                                draft.discount_percent > 0
                                  ? draft.discount_percent
                                  : ''
                              }
                              placeholder="0"
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') {
                                  updateRowDraft(p.id, {
                                    discount_enabled: false,
                                    discount_percent: 0,
                                  });
                                  return;
                                }
                                const num = clampPercent(raw);
                                updateRowDraft(p.id, {
                                  discount_enabled: num > 0,
                                  discount_percent: num,
                                  sale_excluded: num > 0 ? false : draft.sale_excluded,
                                });
                              }}
                              className="w-full bg-[#0f0f0c] border border-white/15 focus:border-[#c9a96e] rounded-lg px-2.5 py-1.5 pr-6 text-[12px] text-white outline-none transition-colors"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-white/35">
                              %
                            </span>
                          </div>
                        </td>

                        {/* Sale Price Preview (Section B: only show when a discount from this system really applies) */}
                        <td className="px-4 py-3">
                          {eff.isOnSale ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-emerald-400">
                                  ₦{eff.finalPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4b0e1e] text-[#fcf9f3]">
                                  -{eff.discountPercent}%
                                </span>
                              </div>
                              {eff.originalPrice > eff.finalPrice && (
                                <p className="text-[10px] text-white/30 line-through">
                                  ₦{eff.originalPrice.toLocaleString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[13px] text-white/30 select-none">-</span>
                          )}
                        </td>

                        {/* Source Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${sourceBadge.cls}`}
                          >
                            {sourceBadge.label}
                          </span>
                        </td>

                        {/* Exclude from Store Sale toggle (Section C: clear on/off appearance in sync with bulk actions) */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(draft.sale_excluded)}
                              onClick={() =>
                                updateRowDraft(p.id, {
                                  sale_excluded: !draft.sale_excluded,
                                })
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                                draft.sale_excluded ? 'bg-red-500' : 'bg-white/15'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0a0a08] shadow transition duration-200 ${
                                  draft.sale_excluded ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[10px] font-semibold w-14 text-left ${
                                draft.sale_excluded ? 'text-red-300' : 'text-white/35'
                              }`}
                            >
                              {draft.sale_excluded ? 'Excluded' : 'Included'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. SCHEDULE WINDOW (Section D order) ── */}
      <div className="bg-[#141410] border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-[#c9a96e]" />
            <div>
              <h2 className="text-[15px] font-bold text-white">Schedule Window (Optional)</h2>
              <p className="text-[11px] text-white/35 mt-0.5">
                Times shown in {timeZoneLabel} · Stored in UTC.
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${statusBadgeConfig.cls}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadgeConfig.dot}`} />
            {saleStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <DateTimePopoverPicker
            label="Starts At (Default 12:00 AM)"
            valueIso={form.starts_at}
            onChangeIso={(iso) => {
              setForm((p) => ({ ...p, starts_at: iso }));
              setSuccessMsg('');
              setErrorMsg('');
            }}
            defaultHour24={0}
            defaultMinute={0}
            placeholder="Select start date & time"
          />

          <DateTimePopoverPicker
            label="Ends At (Default 11:59 PM)"
            valueIso={form.ends_at}
            onChangeIso={(iso) => {
              setForm((p) => ({ ...p, ends_at: iso }));
              setSuccessMsg('');
              setErrorMsg('');
            }}
            defaultHour24={23}
            defaultMinute={59}
            minIso={form.starts_at}
            placeholder="Select end date & time"
          />
        </div>

        <div className="bg-[#0a0a08] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center justify-between text-[12px] text-white/65">
          <span>{formatScheduleSummary(form.starts_at, form.ends_at)}</span>
        </div>
      </div>

      {/* ── 6. REVIEW CHANGES SUMMARY (Section D) ── */}
      <div className="bg-[#141410] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-white">Review changes</h2>
          {hasUnsavedChanges ? (
            <span className="text-[11px] font-semibold text-[#c9a96e]">
              Unsaved changes pending
            </span>
          ) : (
            <span className="text-[11px] text-white/35">All changes saved</span>
          )}
        </div>

        <div className="bg-[#0f0f0c] border border-white/[0.06] rounded-xl p-4 space-y-2 text-[12px] text-white/75 leading-relaxed">
          <p>
            <span className="text-white/40">Store-wide sale:</span>{' '}
            <strong className={form.is_active ? 'text-emerald-400' : 'text-white/70'}>
              {form.is_active ? 'ON' : 'OFF'}
            </strong>{' '}
            — Label: <strong className="text-white">{form.label || 'BLACK FRIDAY SALE'}</strong>
          </p>
          <p>
            <span className="text-white/40">Default discount:</span>{' '}
            <strong className="text-white">{clampPercent(form.discount_percent)}%</strong>
          </p>
          <p>
            <span className="text-white/40">Ticked categories:</span>{' '}
            {form.applies_to_categories.length > 0 ? (
              <strong className="text-white">
                {form.applies_to_categories
                  .map((cat) => {
                    const custom = cleanedCategoryDiscounts[cat];
                    return custom !== undefined
                      ? `${cat} (${custom}%)`
                      : `${cat} (${clampPercent(form.discount_percent)}%)`;
                  })
                  .join(', ')}
              </strong>
            ) : (
              <span className="text-white/50">None (no categories ticked)</span>
            )}
          </p>
          <p>
            <span className="text-white/40">Schedule:</span>{' '}
            <strong className="text-white">
              {formatScheduleSummary(form.starts_at, form.ends_at)}
            </strong>{' '}
            <span className="text-white/45">({timeZoneLabel})</span>
          </p>
          <p>
            <span className="text-white/40">Product-specific discounts:</span>{' '}
            <strong className="text-white">
              {ownDiscountedCount} product{ownDiscountedCount === 1 ? '' : 's'} with their own discount
            </strong>
          </p>
          <p>
            <span className="text-white/40">Exclusions:</span>{' '}
            <strong className="text-white">
              {excludedCount} excluded product{excludedCount === 1 ? '' : 's'}
            </strong>
          </p>
        </div>

        {reviewWarnings.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
            {reviewWarnings.map((w, idx) => (
              <p key={idx} className="text-[12px] text-amber-300 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{w}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── 7. FINAL SAVE BUTTON (LAST ELEMENT ON THE PAGE — Section D) ── */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[12px] text-white/40">
          {(() => {
            const activeDiscountedCount = enrichedProducts.filter((r) => r.eff.isOnSale).length;
            return `${activeDiscountedCount} of ${products.length} products will show a discounted price from this system.`;
          })()}
        </div>

        <button
          type="button"
          disabled={savingAll}
          onClick={handleFinalSaveClick}
          className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-7 py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors disabled:opacity-50 shadow-lg"
        >
          <Tag size={14} />
          {savingAll ? 'Saving Sale Settings…' : 'Save Sale Settings'}
        </button>
      </div>

      {/* Confirm Dialog when saving with Sale ON */}
      {confirmDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-sale-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="bg-[#141410] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 id="confirm-sale-title" className="text-lg font-bold text-white">
              Confirm Sale Settings
            </h3>
            <p className="text-[13px] text-white/80 leading-relaxed">
              This sale will go live for customers at{' '}
              <strong className="text-[#c9a96e]">{liveStartDescription}</strong>.
            </p>
            <div className="bg-[#0f0f0c] border border-white/[0.08] rounded-xl p-3.5 space-y-1.5 text-[12px] text-white/70">
              <p>
                • Label: <strong className="text-white">{form.label || 'BLACK FRIDAY SALE'}</strong>{' '}
                ({clampPercent(form.discount_percent)}% default)
              </p>
              <p>
                • Categories ({form.applies_to_categories.length}):{' '}
                {form.applies_to_categories.length > 0
                  ? form.applies_to_categories
                      .map((c) => {
                        const custom = cleanedCategoryDiscounts[c];
                        return custom !== undefined ? `${c} (${custom}%)` : `${c}`;
                      })
                      .join(', ')
                  : 'None'}
              </p>
              <p>
                • {ownDiscountedCount} product{ownDiscountedCount === 1 ? '' : 's'} with individual discount ·{' '}
                {excludedCount} excluded
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialogOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[12px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeUnifiedSave}
                className="px-5 py-2 rounded-xl bg-[#c9a96e] hover:bg-[#d4b87e] text-[#0a0a08] text-[12px] font-bold uppercase tracking-wider transition-colors"
              >
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
