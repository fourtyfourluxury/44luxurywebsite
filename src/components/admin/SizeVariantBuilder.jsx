import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function SizeVariantBuilder({ sizes = [], onChange }) {
  const [customSize, setCustomSize] = useState('');

  const handleToggleSize = (size) => {
    if (sizes.includes(size)) {
      onChange(sizes.filter(s => s !== size));
    } else {
      onChange([...sizes, size]);
    }
  };

  const handleAddCustomSize = () => {
    if (customSize.trim() && !sizes.includes(customSize.trim())) {
      onChange([...sizes, customSize.trim()]);
      setCustomSize('');
    }
  };

  const handleRemoveSize = (size) => {
    onChange(sizes.filter(s => s !== size));
  };

  return (
    <div className="space-y-4">
      {/* Common Sizes */}
      <div className="flex flex-wrap gap-2">
        {COMMON_SIZES.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => handleToggleSize(size)}
            className={`px-4 py-2 border transition-colors ${
              sizes.includes(size)
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Custom Size Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSize())}
          placeholder="Add custom size..."
          className="flex-1 px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="button"
          onClick={handleAddCustomSize}
          className="px-4 py-2 bg-black text-white hover:bg-gray-800"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Selected Sizes */}
      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => (
            <div
              key={size}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 border"
            >
              <span className="text-sm">{size}</span>
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
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
