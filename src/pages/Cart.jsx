import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';

export default function Cart() {
  const { cart, removeFromCart, updateQty, getCartTotal, clearCart } = useSiteStore();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f3] px-6 text-center gap-8">
        <ShoppingBag size={56} className="text-[#1c1c18]/10" />
        <div>
          <h1 className="font-unica text-6xl uppercase tracking-tighter text-[#1c1c18] mb-3">YOUR BAG IS EMPTY</h1>
          <p className="font-plex text-sm text-[#5f5e5e]">Add something incredible to get started.</p>
        </div>
        <Link
          to="/shop"
          className="bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#4b0e1e] transition-colors"
        >
          SHOP NOW
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-6 pt-12 pb-8 border-b border-[#1c1c18]/10">
        <div className="flex items-end justify-between">
          <h1 className="font-unica text-6xl md:text-8xl uppercase tracking-tighter text-[#1c1c18] leading-none">
            YOUR BAG
          </h1>
          <p className="font-plex text-sm text-[#5f5e5e] mb-1">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Items */}
          <div className="flex-1 flex flex-col gap-6">
            {cart.map(item => (
              <div key={item.cartId} className="flex gap-5 pb-6 border-b border-[#1c1c18]/10">
                {/* Image */}
                <div className="w-24 h-32 md:w-32 md:h-40 bg-[#f1eee7] shrink-0 overflow-hidden">
                  {item.images?.[0] && (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <p className="font-grotesk font-bold text-sm text-[#1c1c18] uppercase tracking-wide leading-tight">{item.name}</p>
                      <p className="font-plex text-xs text-[#5f5e5e] mt-1">
                        {item.size && `Size: ${item.size}`}
                        {item.color && ` / ${item.color}`}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-[#5f5e5e] hover:text-[#1c1c18] transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4">
                    {/* Qty */}
                    <div className="flex items-center border border-[#1c1c18]/20">
                      <button
                        onClick={() => updateQty(item.cartId, item.qty - 1)}
                        className="w-9 h-9 flex items-center justify-center text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-grotesk font-bold text-sm text-[#1c1c18] min-w-[36px] text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.cartId, item.qty + 1)}
                        className="w-9 h-9 flex items-center justify-center text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-grotesk font-bold text-sm text-[#1c1c18]">
                      ₦{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear cart */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="font-grotesk text-xs text-[#5f5e5e] hover:text-[#1c1c18] uppercase tracking-widest transition-colors border-b border-[#5f5e5e]/40 hover:border-[#1c1c18] pb-0.5"
              >
                Clear Bag
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-[#f6f3ed] p-8 sticky top-24">
              <h2 className="font-unica text-3xl uppercase tracking-tighter text-[#1c1c18] mb-6">ORDER SUMMARY</h2>

              <div className="flex flex-col gap-3 mb-6 border-b border-[#1c1c18]/10 pb-6">
                {cart.map(item => (
                  <div key={item.cartId} className="flex justify-between items-start gap-3">
                    <span className="font-plex text-xs text-[#5f5e5e] flex-1 leading-snug">
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-grotesk font-semibold text-xs text-[#1c1c18] shrink-0">
                      ₦{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-grotesk text-xs uppercase tracking-widest text-[#5f5e5e]">Subtotal</span>
                <span className="font-grotesk font-bold text-sm text-[#1c1c18]">₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#1c1c18]/10">
                <span className="font-grotesk text-xs uppercase tracking-widest text-[#5f5e5e]">Shipping</span>
                <span className="font-plex text-xs text-[#5f5e5e]">
                  {total >= 150000 ? 'FREE' : '₦5,000'}
                </span>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-grotesk font-bold text-sm uppercase tracking-widest text-[#1c1c18]">TOTAL</span>
                <span className="font-unica text-2xl tracking-tighter text-[#1c1c18]">
                  ₦{(total + (total >= 150000 ? 0 : 5000)).toLocaleString()}
                </span>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-[#D4AF37] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-sm py-4 flex items-center justify-center hover:bg-[#c9a02d] transition-colors mb-3"
              >
                SECURE CHECKOUT
              </Link>
              <Link
                to="/shop"
                className="w-full border border-[#1c1c18] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs py-3 flex items-center justify-center hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-colors"
              >
                CONTINUE SHOPPING
              </Link>

              {total < 150000 && (
                <p className="font-plex text-xs text-[#5f5e5e] text-center mt-4">
                  Add ₦{(150000 - total).toLocaleString()} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
