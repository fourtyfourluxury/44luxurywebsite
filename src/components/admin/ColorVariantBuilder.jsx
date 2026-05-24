import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const COMMON_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Pink', hex: '#FFC0CB' },
];

export default function ColorVariantBuilder({ colors = [], onChange }) {
  const [customColor, setCustomColor] = useState({ name: '', hex: '#000000' });

  const handleToggleColor = (color) => {
    const exists = colors.find(c => c.name === color.name);
    if (exists) {
      onChange(colors.filter(c => c.name !== color.name));
    } else {
      onChange([...colors, color]);
    }
  };

  const handleAddCustomColor = () => {
    if (customColor.name.trim() && !colors.find(c => c.name === customColor.name)) {
      onChange([...colors, customColor]);
      setCustomColor({ name: '', hex: '#000000' });
    }
  };

  const handleRemoveColor = (colorName) => {
    onChange(colors.filter(c => c.name !== colorName));
  };

  const isColorSelected = (colorName) => {
    return colors.some(c => c.name === colorName);
  };

  return (
    <div className="space-y-4">
      {/* Common Colors */}
      <div className="grid grid-cols-5 gap-2">
        {COMMON_COLORS.map(color => (
          <button
            key={color.name}
            type="button"
            onClick={() => handleToggleColor(color)}
            className={`flex items-center gap-2 px-3 py-2 border transition-colors ${
              isColorSelected(color.name)
                ? 'border-black bg-gray-50'
                : 'border-gray-300 hover:border-black'
            }`}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-sm">{color.name}</span>
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customColor.name}
          onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })}
          placeholder="Color name..."
          className="flex-1 px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="color"
          value={customColor.hex}
          onChange={(e) => setCustomColor({ ...customColor, hex: e.target.value })}
          className="w-20 h-10 border cursor-pointer"
        />
        <button
          type="button"
          onClick={handleAddCustomColor}
          className="px-4 py-2 bg-black text-white hover:bg-gray-800"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Selected Colors */}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <div
              key={color.name}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 border"
            >
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm">{color.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveColor(color.name)}
                className="text-gray-500 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
