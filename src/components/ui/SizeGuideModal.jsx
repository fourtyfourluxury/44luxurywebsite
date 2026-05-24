import { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = {
  tops: [
    { size: 'XS', chest: '86–91', shoulder: '42', length: '68' },
    { size: 'S',  chest: '91–96', shoulder: '44', length: '70' },
    { size: 'M',  chest: '96–101', shoulder: '46', length: '72' },
    { size: 'L',  chest: '101–106', shoulder: '48', length: '74' },
    { size: 'XL', chest: '106–111', shoulder: '50', length: '76' },
    { size: 'XXL', chest: '111–116', shoulder: '52', length: '78' },
  ],
  bottoms: [
    { size: '28', waist: '71', hips: '91', inseam: '76' },
    { size: '30', waist: '76', hips: '96', inseam: '78' },
    { size: '32', waist: '81', hips: '101', inseam: '80' },
    { size: '34', waist: '86', hips: '106', inseam: '80' },
    { size: '36', waist: '91', hips: '111', inseam: '81' },
    { size: '38', waist: '96', hips: '116', inseam: '81' },
  ],
  footwear: [
    { size: 'EU 39', uk: '6', us: '7', cm: '25.0' },
    { size: 'EU 40', uk: '7', us: '8', cm: '25.7' },
    { size: 'EU 41', uk: '7.5', us: '8.5', cm: '26.3' },
    { size: 'EU 42', uk: '8', us: '9', cm: '27.0' },
    { size: 'EU 43', uk: '9', us: '10', cm: '27.7' },
    { size: 'EU 44', uk: '10', us: '11', cm: '28.3' },
    { size: 'EU 45', uk: '11', us: '12', cm: '29.0' },
  ],
};

export default function SizeGuideModal({ onClose, category = 'tops' }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const isFootwear = category === 'footwear';
  const isBottoms = category === 'bottoms';
  const data = SIZES[category] || SIZES.tops;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center px-4 pointer-events-none">
        <div className="bg-[#fcf9f3] w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#1c1c18]/10 sticky top-0 bg-[#fcf9f3] z-10">
            <h2 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">SIZE GUIDE</h2>
            <button onClick={onClose} className="text-[#5f5e5e] hover:text-[#1c1c18] transition-colors">
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <p className="font-plex text-sm text-[#5f5e5e] mb-6 leading-relaxed">
              All measurements are in centimetres unless stated. 44LUXURY garments are designed with an intentional{' '}
              <strong className="text-[#1c1c18] font-semibold">oversized silhouette</strong> — size down for a more fitted look.
            </p>

            <div className="overflow-x-auto">
              {!isFootwear && !isBottoms && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#1c1c18]">
                      {['Size', 'Chest (cm)', 'Shoulder (cm)', 'Length (cm)'].map(h => (
                        <th key={h} className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] pb-3 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={row.size} className={`border-b border-[#1c1c18]/10 ${i % 2 === 0 ? '' : 'bg-[#f6f3ed]'}`}>
                        <td className="font-grotesk font-bold text-sm text-[#1c1c18] py-3 pr-6">{row.size}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3 pr-6">{row.chest}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3 pr-6">{row.shoulder}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {isBottoms && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#1c1c18]">
                      {['Size', 'Waist (cm)', 'Hips (cm)', 'Inseam (cm)'].map(h => (
                        <th key={h} className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] pb-3 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={row.size} className={`border-b border-[#1c1c18]/10 ${i % 2 === 0 ? '' : 'bg-[#f6f3ed]'}`}>
                        <td className="font-grotesk font-bold text-sm text-[#1c1c18] py-3 pr-6">{row.size}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3 pr-6">{row.waist}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3 pr-6">{row.hips}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3">{row.inseam}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {isFootwear && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#1c1c18]">
                      {['EU Size', 'UK', 'US', 'Length (cm)'].map(h => (
                        <th key={h} className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] pb-3 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={row.size} className={`border-b border-[#1c1c18]/10 ${i % 2 === 0 ? '' : 'bg-[#f6f3ed]'}`}>
                        <td className="font-grotesk font-bold text-sm text-[#1c1c18] py-3 pr-6">{row.size}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3 pr-6">{row.uk}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3 pr-6">{row.us}</td>
                        <td className="font-plex text-sm text-[#5f5e5e] py-3">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* How to measure */}
            <div className="mt-10 pt-8 border-t border-[#1c1c18]/10">
              <h3 className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] mb-5">HOW TO MEASURE</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
                  { label: 'Shoulder', desc: 'Measure from the edge of one shoulder across to the other.' },
                  { label: 'Waist', desc: 'Measure around your natural waistline, just above the hip bone.' },
                  { label: 'Inseam', desc: 'Measure from the top of the inner thigh down to the ankle.' },
                ].map(m => (
                  <div key={m.label} className="flex flex-col gap-1">
                    <p className="font-grotesk font-bold text-[11px] uppercase tracking-widest text-[#1c1c18]">{m.label}</p>
                    <p className="font-plex text-xs text-[#5f5e5e] leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-8 p-4 bg-[#f6f3ed] flex items-center justify-between gap-4">
              <p className="font-plex text-xs text-[#5f5e5e]">Unsure of your size? Our team is here to help.</p>
              <a
                href="mailto:hello@44luxury.com"
                className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5 hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors shrink-0"
              >
                CONTACT US
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
