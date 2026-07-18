import { Link } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, getCartTotal } = useSiteStore();
  const total = getCartTotal();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-[#fcf9f3] z-50 animate-slide-in flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1c1c18]/10">
          <h2 className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18]">
            YOUR CART ({cart.length})
          </h2>
          <button onClick={closeCart} className="text-[#5f5e5e] hover:text-[#1c1c18] transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {cart.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <p className="font-unica text-3xl uppercase tracking-tighter text-[#5f5e5e] text-center">YOUR BAG IS EMPTY</p>
              <p className="font-plex text-sm text-[#5f5e5e] text-center">Add something incredible.</p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-8 py-4 hover:bg-[#4b0e1e] transition-colors"
              >
                SHOP NOW
              </Link>
            </div>
          )}

          {cart.map(item => (
            <div key={item.cartId} className="flex gap-4 border-b border-[#1c1c18]/10 pb-4">
              <div className="w-24 h-28 bg-[#f1eee7] shrink-0 overflow-hidden">
                {item.images?.[0] && (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-grotesk font-bold text-sm text-[#1c1c18] uppercase tracking-wide">{item.name}</p>
                    <p className="font-plex text-xs text-[#5f5e5e] mt-0.5">
                      {item.size && `Size: ${item.size}`}
                      {item.color && ` / ${item.color}`}
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(item.cartId)} className="text-[#5f5e5e] hover:text-[#1c1c18] transition-colors shrink-0 ml-2">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3">
                  <span className="font-grotesk text-xs text-[#5f5e5e] uppercase tracking-wide">
                    Qty: {item.qty}
                  </span>
                  <span className="font-grotesk font-bold text-sm text-[#1c1c18]">
                    ₦{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-6 border-t border-[#1c1c18]/10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-grotesk font-semibold text-sm uppercase tracking-wider text-[#5f5e5e]">Subtotal</span>
              <span className="font-unica text-2xl tracking-tighter text-[#1c1c18]">₦{total.toLocaleString()}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="w-full bg-[#D4AF37] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-sm py-4 flex items-center justify-center hover:bg-[#c9a02d] transition-colors"
            >
              SECURE CHECKOUT
            </Link>
            <button
              onClick={closeCart}
              className="w-full border border-[#1c1c18] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs py-3 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-colors"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </>
  );
}
