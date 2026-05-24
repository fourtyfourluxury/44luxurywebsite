const EFFECTS = ['FADE', 'SLIDE', 'ZOOM'];

export default function DisplayModePanel({ config, onChange }) {
  const set = (key, val) => onChange({ ...config, [key]: val });

  const isSlideshow = config.displayMode === 'SLIDESHOW' || config.displayMode === 'FADE';

  return (
    <div className="flex flex-col gap-5">
      {/* Display mode buttons */}
      <div>
        <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">Display Mode</label>
        <div className="flex gap-2">
          {['STATIC', 'SLIDESHOW', 'FADE'].map(mode => (
            <button
              key={mode}
              onClick={() => set('displayMode', mode)}
              className={`px-4 py-2 font-grotesk font-bold text-[10px] uppercase tracking-widest transition-colors border
                ${config.displayMode === mode
                  ? 'bg-bone text-[#1c1c18] border-bone'
                  : 'bg-transparent text-concrete border-[#2a2a26] hover:border-bone hover:text-bone'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {isSlideshow && (
        <div className="grid grid-cols-2 gap-5 border-t border-[#2a2a26] pt-5">
          {/* Transition Speed */}
          <div>
            <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">
              Speed: {config.transitionSpeed || 4}s
            </label>
            <input
              type="range" min="1" max="10" step="0.5"
              value={config.transitionSpeed || 4}
              onChange={e => set('transitionSpeed', parseFloat(e.target.value))}
              className="w-full accent-[#D4AF37] h-1"
            />
          </div>

          {/* Transition Effect */}
          <div>
            <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">Effect</label>
            <select
              value={config.transitionEffect || 'FADE'}
              onChange={e => set('transitionEffect', e.target.value)}
              className="bg-[#0f0f0c] border border-[#2a2a26] text-bone font-plex text-xs px-3 py-2 outline-none w-full"
            >
              {EFFECTS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Toggles */}
          {[
            { key: 'autoplay', label: 'Autoplay' },
            { key: 'pauseOnHover', label: 'Pause on Hover' },
            { key: 'showDots', label: 'Show Dot Indicators' },
            { key: 'showArrows', label: 'Show Arrow Controls' },
            { key: 'loop', label: 'Loop' },
            { key: 'showOnMobile', label: 'Show on Mobile' },
          ].map(t => (
            <div key={t.key} className="flex items-center justify-between">
              <span className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete">{t.label}</span>
              <button
                onClick={() => set(t.key, !config[t.key])}
                className={`w-10 h-5 relative transition-colors ${config[t.key] !== false ? 'bg-[#D4AF37]' : 'bg-[#2a2a26]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white transition-all ${config[t.key] !== false ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
