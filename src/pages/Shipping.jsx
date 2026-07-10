import { Link } from 'react-router-dom';
import HeroBanner from '../components/common/HeroBanner';

const SHIPPING_ZONES = [
  {
    zone: 'LAGOS (STANDARD)',
    time: '1–2 Business Days',
    cost: 'Free on orders above ₦150,000 · ₦3,000 below',
  },
  {
    zone: 'NIGERIA (NATIONWIDE)',
    time: '3–5 Business Days',
    cost: 'Free on orders above ₦150,000 · ₦5,000 below',
  },
  {
    zone: 'WEST AFRICA',
    time: '5–10 Business Days',
    cost: 'Calculated at checkout based on destination',
  },
  {
    zone: 'INTERNATIONAL',
    time: '7–14 Business Days',
    cost: 'Calculated at checkout based on destination',
  },
];

const POLICIES = [
  {
    title: 'ORDER PROCESSING',
    body: 'All orders are processed within 1–2 business days (excluding weekends and public holidays). Orders placed after 2pm WAT are processed the following business day. You will receive an order confirmation email immediately after purchase.',
  },
  {
    title: 'TRACKING YOUR ORDER',
    body: 'Once your order has been dispatched, you will receive a shipping confirmation email with a tracking number. You can also monitor your order status from your account dashboard under "My Orders".',
  },
  {
    title: 'SIGNATURE ON DELIVERY',
    body: 'Some high-value orders may require a signature upon delivery. If you are unavailable at the time of delivery, our courier will leave a notification card with instructions for re-delivery or collection.',
  },
  {
    title: 'CUSTOMS & DUTIES (INTERNATIONAL)',
    body: 'International orders may be subject to import duties and taxes levied by the destination country. These charges are the responsibility of the recipient. 44LUXURY has no control over these charges and cannot predict their amount.',
  },
];

export default function Shipping() {
  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Full-width editorial hero */}
      <HeroBanner
        title="SHIPPING"
        subtitle="DELIVERY INFORMATION"
        image="/lifestyle-faq.jpg"
        overlayOpacity={0.5}
        height="65vh"
        alignment="bottom-left"
      />

      {/* Intro */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start mb-20">
          <div>
            <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.2em] text-[#5f5e5e] mb-6">OUR COMMITMENT</p>
            <h2 className="font-unica text-5xl md:text-6xl uppercase tracking-tighter text-[#1c1c18] leading-tight mb-8">
              EVERY ORDER<br />DELIVERED WITH CARE.
            </h2>
            <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">
              We partner with trusted courier services to ensure your 44LUXURY pieces arrive safely and on time.
              Every package is carefully prepared and quality-checked before dispatch.
            </p>
          </div>
          <div className="bg-[#1c1c18] p-10">
            <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#D4AF37] mb-6">FREE SHIPPING THRESHOLD</p>
            <p className="font-unica text-5xl text-[#fcf9f3] mb-4">₦150,000</p>
            <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">
              All orders above ₦150,000 qualify for complimentary standard shipping within Nigeria.
              No code required — the discount is applied automatically at checkout.
            </p>
          </div>
        </div>

        {/* Shipping Zones Table */}
        <div className="mb-20">
          <h2 className="font-unica text-4xl md:text-5xl uppercase tracking-tighter text-[#1c1c18] mb-10">DELIVERY ZONES</h2>
          <div className="divide-y divide-[#1c1c18]/10 border-t border-[#1c1c18]/10">
            {SHIPPING_ZONES.map((zone) => (
              <div key={zone.zone} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                <p className="font-grotesk font-bold text-[11px] uppercase tracking-widest text-[#1c1c18]">{zone.zone}</p>
                <p className="font-plex text-sm text-[#5f5e5e]">{zone.time}</p>
                <p className="font-plex text-sm text-[#5f5e5e]">{zone.cost}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div>
          <h2 className="font-unica text-4xl md:text-5xl uppercase tracking-tighter text-[#1c1c18] mb-10">SHIPPING POLICIES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {POLICIES.map((policy) => (
              <div key={policy.title} className="border-t border-[#1c1c18]/10 pt-8">
                <h3 className="font-grotesk font-bold text-[11px] uppercase tracking-widest text-[#1c1c18] mb-4">{policy.title}</h3>
                <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">{policy.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Questions CTA */}
      <div className="bg-[#1c1c18] py-20 px-6 text-center">
        <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-4">NEED HELP?</p>
        <h3 className="font-unica text-4xl md:text-6xl uppercase tracking-tighter text-[#fcf9f3] mb-6">CONTACT OUR TEAM</h3>
        <p className="font-plex text-sm text-[#5f5e5e] mb-10 max-w-sm mx-auto">
          Questions about your delivery? Our team responds within 48 hours.
        </p>
        <Link
          to="/contact"
          className="inline-block bg-[#fcf9f3] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#D4AF37] transition-colors"
        >
          GET IN TOUCH
        </Link>
      </div>
    </div>
  );
}
