import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Clock, Shield } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';

export default function OrderConfirmed() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useSiteStore();
  const orderId = searchParams.get('id') || `#LUX-${Math.floor(Math.random() * 8999 + 1000)}`;
  const isCrypto = searchParams.get('method') === 'crypto';

  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#fcf9f3]">

      {/* Icon */}
      <div className={`w-20 h-20 flex items-center justify-center mb-8 ${isCrypto ? 'bg-[#D4AF37]/10 rounded-full' : 'bg-[#1c1c18]'}`}>
        {isCrypto
          ? <Clock size={36} className="text-[#D4AF37]" />
          : <CheckCircle size={36} className="text-[#D4AF37]" />
        }
      </div>

      {/* Title */}
      <p className="font-grotesk font-semibold text-xs uppercase tracking-[0.2em] text-[#5f5e5e] mb-3">
        {isCrypto ? 'Payment Being Verified' : 'Order Confirmed'}
      </p>
      <h1 className="font-unica text-6xl md:text-8xl uppercase tracking-tighter text-[#1c1c18] leading-none mb-4">
        {isCrypto ? 'THANK YOU' : 'THANK YOU'}
      </h1>
      <p className="font-plex text-base text-[#5f5e5e] max-w-md mb-2">
        {isCrypto
          ? "Your crypto payment is being verified on the blockchain. We\u2019ll confirm your order once the transaction is complete."
          : 'Your order has been placed and is being prepared.'
        }
      </p>
      <p className="font-grotesk font-bold text-sm text-[#1c1c18] mb-12">Order {orderId}</p>

      {/* Progress Steps */}
      {isCrypto ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c1c18]/10 mb-12 w-full max-w-2xl">
          {[
            { icon: <Shield size={24} className="text-[#D4AF37]" />, step: '01', label: 'VERIFYING', desc: 'We are verifying your crypto transaction on the blockchain.' },
            { icon: <CheckCircle size={24} className="text-[#5f5e5e]" />, step: '02', label: 'CONFIRMED', desc: 'Once verified, your order will be confirmed and prepared.' },
            { icon: <Package size={24} className="text-[#5f5e5e]" />, step: '03', label: 'DISPATCHED', desc: 'Your order will be dispatched after confirmation.' },
          ].map(s => (
            <div key={s.step} className="bg-[#fcf9f3] p-6 text-center">
              <div className="flex justify-center mb-3">{s.icon}</div>
              <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] mb-1">{s.step} — {s.label}</p>
              <p className="font-plex text-xs text-[#5f5e5e]">{s.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c1c18]/10 mb-12 w-full max-w-2xl">
          {[
            { icon: '📦', step: '01', label: 'CONFIRMED', desc: 'Your order is confirmed and being prepared.' },
            { icon: '🚚', step: '02', label: 'DISPATCHED', desc: "You'll receive a tracking number via email." },
            { icon: '🏠', step: '03', label: 'DELIVERED', desc: '3-5 business days, standard shipping.' },
          ].map(s => (
            <div key={s.step} className="bg-[#fcf9f3] p-6 text-center">
              <div className="text-2xl mb-3">{s.icon}</div>
              <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] mb-1">{s.step} — {s.label}</p>
              <p className="font-plex text-xs text-[#5f5e5e]">{s.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Crypto verification note */}
      {isCrypto && (
        <div className="bg-[#FFF8E1] border border-[#F9A825]/20 rounded-lg p-4 max-w-md mb-8">
          <p className="font-plex text-xs text-[#5D4037] leading-relaxed">
            Crypto payments typically take <strong>10–30 minutes</strong> to verify depending on network congestion. 
            You'll receive an email once your payment is confirmed and your order is processed.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/account" className="flex items-center gap-2 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#4b0e1e] transition-colors">
          <Package size={15} /> VIEW MY ORDERS
        </Link>
        <Link to="/shop" className="flex items-center gap-2 border border-[#1c1c18] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-colors">
          CONTINUE SHOPPING <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
