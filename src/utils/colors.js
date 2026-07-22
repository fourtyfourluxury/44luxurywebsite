// Single source of truth for the product color palette. The admin picker and
// the storefront swatches both import from here — previously each kept its
// own list and they drifted apart, so half the admin's colors had no
// matching swatch hex on the storefront and silently rendered grey.
export const PRESET_COLORS = [
  { name: 'Black',    hex: '#1c1c18' },
  { name: 'White',    hex: '#ffffff' },
  { name: 'Navy',     hex: '#1b2a4a' },
  { name: 'Beige',    hex: '#e8dcc8' },
  { name: 'Grey',     hex: '#8a8a8a' },
  { name: 'Brown',    hex: '#5c4033' },
  { name: 'Olive',    hex: '#6b6f3a' },
  { name: 'Burgundy', hex: '#4b0e1e' },
  { name: 'Cream',    hex: '#fcf9f3' },
];

export const PRESET_COLOR_NAMES = PRESET_COLORS.map(c => c.name);

const LIGHT_NAMES = new Set(['White', 'Cream', 'Beige']);

// Resolve any stored color value (preset or admin-typed custom) to a
// CSS-safe swatch color. Presets use the curated hex above; anything else is
// passed straight through as a raw CSS color string, since browsers already
// resolve valid keywords/hex codes on their own — so a custom name typed in
// the admin ("Sky Blue", "#2e86de") still renders instead of falling back to
// a generic grey.
export function resolveSwatchColor(name) {
  const preset = PRESET_COLORS.find(c => c.name.toLowerCase() === String(name || '').trim().toLowerCase());
  return preset ? preset.hex : name;
}

// Light swatches need a hairline border to stay visible against the
// storefront's off-white background.
export function needsSwatchBorder(name) {
  return LIGHT_NAMES.has(name);
}
