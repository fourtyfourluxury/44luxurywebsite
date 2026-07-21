import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSiteStore } from '../store/useSiteStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/ToastProvider';
import CryptoPaymentModal from '../components/checkout/CryptoPaymentModal';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara'
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useSiteStore();
  const { user, profile } = useAuthStore();
  const total = getCartTotal();

  const [form, setForm] = useState({
    firstName: profile?.full_name?.split(' ')[0] || '',
    lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    apartment: '',
    city: profile?.city || '',
    state: profile?.state || '',
    zipCode: '',
    country: 'Nigeria',
  });

  const [deliveryMethod, setDeliveryMethod] = useState('ship');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [billingAddress, setBillingAddress] = useState('same');
  const [processing, setProcessing] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (deliveryMethod === 'ship' && (!form.address || !form.city || !form.state)) {
      toast('Please fill in all required shipping fields.', 'error');
      return;
    }
    setProcessing(true);

    try {
      const items = cart.map(item => ({
        product_id: item.id,
        name: item.name,
        size: item.size,
        color: item.color,
        qty: item.qty,
        price: item.price,
        image: item.images?.[0] || null,
      }));

      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          customer: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email,
            phone: form.phone,
            address: deliveryMethod === 'pickup' ? 'Pickup: 44 Admiralty Way Lagos' : (form.apartment ? `${form.address}, ${form.apartment}` : form.address),
            city: deliveryMethod === 'pickup' ? 'Lagos' : form.city,
            state: deliveryMethod === 'pickup' ? 'Lagos' : form.state,
            country: deliveryMethod === 'pickup' ? 'Nigeria' : form.country,
          },
          items,
          payment_method: paymentMethod,
          user_id: user?.id || null,
          delivery_method: deliveryMethod,
          callback_url: `${window.location.origin}/order-confirmed`,
        },
      });

      if (error) throw error;

      if (paymentMethod === 'paystack') {
        if (!data.authorization_url) throw new Error('Paystack did not return a checkout URL');
        // Full-page redirect to Paystack's hosted checkout. Cart is cleared
        // only after payment is verified back on /order-confirmed, not here.
        window.location.href = data.authorization_url;
        return;
      }

      clearCart();
      navigate(`/order-confirmed?id=${encodeURIComponent(data.order_number)}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast('Failed to process order. Please try again.', 'error');
      setProcessing(false);
    }
  };

  const handleCryptoConfirm = async (cryptoId, cryptoAmount, walletAddress) => {
    setShowCryptoModal(false);
    setProcessing(true);
    try {
      const items = cart.map(item => ({
        product_id: item.id, name: item.name, size: item.size,
        color: item.color, qty: item.qty, price: item.price,
        image: item.images?.[0] || null,
      }));

      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          customer: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email || user?.email || '',
            phone: form.phone,
            address: deliveryMethod === 'pickup' ? 'Pickup: 44 Admiralty Way Lagos' : (form.apartment ? `${form.address}, ${form.apartment}` : form.address),
            city: deliveryMethod === 'pickup' ? 'Lagos' : form.city,
            state: deliveryMethod === 'pickup' ? 'Lagos' : form.state,
            country: deliveryMethod === 'pickup' ? 'Nigeria' : form.country,
          },
          items,
          payment_method: `crypto_${cryptoId}`,
          crypto_details: { currency: cryptoId, amount: cryptoAmount, wallet: walletAddress },
          user_id: user?.id || null,
          delivery_method: deliveryMethod,
        },
      });

      if (error) throw error;
      clearCart();
      navigate(`/order-confirmed?id=${encodeURIComponent(data.order_number)}&method=crypto`);
    } catch (error) {
      console.error('Error creating crypto order:', error);
      toast('Failed to process order. Please try again.', 'error');
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingCost = deliveryMethod === 'pickup' ? 0 : (total >= 150000 ? 0 : 5000);
  const grandTotal = total + shippingCost;

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Header */}
      <div className="border-b border-[#1c1c18]/10 px-6 py-5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link to="/" className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18] hover:text-[#D4AF37] transition-colors">44 LUXURY</Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── LEFT: Form ────────────────────────────── */}
          <div className="flex-1">
            <form onSubmit={handleSubmit}>

              {/* Account / Email */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#1c1c18]/10">
                <div className="w-10 h-10 rounded-full bg-[#1c1c18] text-[#fcf9f3] flex items-center justify-center font-grotesk font-bold text-sm uppercase">
                  {(form.email?.[0] || 'G').toUpperCase()}
                </div>
                <div>
                  <p className="font-plex text-sm text-[#1c1c18]">{form.email || 'guest@checkout.com'}</p>
                </div>
              </div>

              {/* ── Delivery ──────────────────────────── */}
              <h2 className="font-grotesk font-bold text-base text-[#1c1c18] mb-5">Delivery</h2>

              {/* Ship / Pickup toggle */}
              <div className="flex border border-[#1c1c18]/15 rounded-lg overflow-hidden mb-6">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('ship')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-plex text-sm transition-colors ${
                    deliveryMethod === 'ship' ? 'bg-white text-[#1c1c18] font-semibold shadow-sm' : 'bg-[#f6f3ed] text-[#5f5e5e] hover:text-[#1c1c18]'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Ship
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-plex text-sm transition-colors ${
                    deliveryMethod === 'pickup' ? 'bg-white text-[#1c1c18] font-semibold shadow-sm' : 'bg-[#f6f3ed] text-[#5f5e5e] hover:text-[#1c1c18]'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  Pickup
                </button>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                {deliveryMethod === 'ship' ? (
                  <>
                    {/* Country */}
                    <div>
                      <label className="font-plex text-[11px] text-[#5f5e5e] block mb-1 mt-2">Country/Region</label>
                      <select
                        value={form.country}
                        onChange={e => set('country', e.target.value)}
                        className="w-full bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors appearance-none"
                      >
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={e => set('firstName', e.target.value)}
                        placeholder="First name (optional)"
                        className="bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors"
                      />
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={e => set('lastName', e.target.value)}
                        placeholder="Last name"
                        required
                        className="bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="Phone"
                      required
                      className="w-full bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors"
                    />

                    {/* Address */}
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      placeholder="Address"
                      required
                      className="w-full bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors"
                    />

                    {/* Apartment */}
                    <input
                      type="text"
                      value={form.apartment}
                      onChange={e => set('apartment', e.target.value)}
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors"
                    />

                    {/* City / State / ZIP */}
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => set('city', e.target.value)}
                        placeholder="City"
                        required
                        className="bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors"
                      />
                      <select
                        value={form.state}
                        onChange={e => set('state', e.target.value)}
                        required
                        className="bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors appearance-none"
                      >
                        <option value="">State</option>
                        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input
                        type="text"
                        value={form.zipCode}
                        onChange={e => set('zipCode', e.target.value)}
                        placeholder="ZIP code"
                        className="bg-white border border-[#1c1c18]/15 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 rounded-lg outline-none transition-colors"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-[#f6f3ed] border border-[#1c1c18]/10 rounded-lg p-5 mt-2">
                    <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-2">Pickup Location</p>
                    <p className="font-plex text-sm text-[#1c1c18]">44 Admiralty Way</p>
                    <p className="font-plex text-sm text-[#1c1c18]">Lagos, Nigeria</p>
                  </div>
                )}
              </div>



              {/* ── Payment ────────────────────────────── */}
              <h2 className="font-grotesk font-bold text-base text-[#1c1c18] mb-1">Payment</h2>
              <p className="font-plex text-xs text-[#5f5e5e] mb-4">All transactions are secure and encrypted.</p>

              <div className="flex flex-col border border-[#1c1c18]/15 rounded-lg overflow-hidden mb-8">
                {/* Paystack */}
                <label className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${paymentMethod === 'paystack' ? 'bg-[#f6f3ed]' : 'hover:bg-[#faf8f4]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'paystack' ? 'border-[#1c1c18]' : 'border-[#1c1c18]/30'}`}>
                      {paymentMethod === 'paystack' && <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c18]" />}
                    </div>
                    <span className="font-plex text-sm text-[#1c1c18]">Paystack</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#E64A19] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">MC</span>
                    <span className="bg-[#1A1F71] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">VISA</span>
                    <span className="text-[10px] text-[#5f5e5e]">+5</span>
                  </div>
                  <input type="radio" name="payment" value="paystack" checked={paymentMethod === 'paystack'} onChange={() => setPaymentMethod('paystack')} className="hidden" />
                </label>

                {/* Redirect note for Paystack */}
                {paymentMethod === 'paystack' && (
                  <div className="border-t border-[#1c1c18]/10 px-4 py-3 bg-[#faf8f4]">
                    <p className="font-plex text-xs text-[#5f5e5e]">
                      You'll be redirected to Paystack to complete your purchase.
                    </p>
                  </div>
                )}

                <div className="border-t border-[#1c1c18]/10" />

                {/* Pay with Crypto */}
                <label className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${paymentMethod === 'crypto' ? 'bg-[#f6f3ed]' : 'hover:bg-[#faf8f4]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'crypto' ? 'border-[#1c1c18]' : 'border-[#1c1c18]/30'}`}>
                      {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c18]" />}
                    </div>
                    <span className="font-plex text-sm text-[#1c1c18]">Pay with Crypto</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#F7931A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">BTC</span>
                    <span className="bg-[#627EEA] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">ETH</span>
                    <span className="bg-[#345D9D] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">LTC</span>
                  </div>
                  <input type="radio" name="payment" value="crypto" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} className="hidden" />
                </label>

                {paymentMethod === 'crypto' && (
                  <div className="border-t border-[#1c1c18]/10 px-4 py-3 bg-[#faf8f4]">
                    <p className="font-plex text-xs text-[#5f5e5e]">
                      Pay securely using Bitcoin, Ethereum, or Litecoin. Click "Pay Now" to select your cryptocurrency.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Billing Address ────────────────────── */}
              <h2 className="font-grotesk font-bold text-base text-[#1c1c18] mb-4">Billing address</h2>
              <div className="flex flex-col border border-[#1c1c18]/15 rounded-lg overflow-hidden mb-6">
                <label className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors ${billingAddress === 'same' ? 'bg-[#f6f3ed]' : 'hover:bg-[#faf8f4]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${billingAddress === 'same' ? 'border-[#1c1c18]' : 'border-[#1c1c18]/30'}`}>
                    {billingAddress === 'same' && <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c18]" />}
                  </div>
                  <span className="font-plex text-sm text-[#1c1c18]">Same as shipping address</span>
                  <input type="radio" name="billing" value="same" checked={billingAddress === 'same'} onChange={() => setBillingAddress('same')} className="hidden" />
                </label>
                <div className="border-t border-[#1c1c18]/10" />
                <label className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors ${billingAddress === 'different' ? 'bg-[#f6f3ed]' : 'hover:bg-[#faf8f4]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${billingAddress === 'different' ? 'border-[#1c1c18]' : 'border-[#1c1c18]/30'}`}>
                    {billingAddress === 'different' && <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c18]" />}
                  </div>
                  <span className="font-plex text-sm text-[#1c1c18]">Use a different billing address</span>
                  <input type="radio" name="billing" value="different" checked={billingAddress === 'different'} onChange={() => setBillingAddress('different')} className="hidden" />
                </label>
              </div>


              {/* Pay Now Button */}
              <button
                type={paymentMethod === 'crypto' ? 'button' : 'submit'}
                onClick={paymentMethod === 'crypto' ? () => setShowCryptoModal(true) : undefined}
                disabled={processing}
                className="w-full bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-sm py-4 rounded-lg hover:bg-[#2a2a26] transition-colors disabled:opacity-70"
              >
                {processing ? 'PROCESSING...' : paymentMethod === 'crypto' ? 'SELECT CRYPTOCURRENCY' : 'PAY NOW'}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Order Summary ──────────────────── */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-6 border-l border-[#1c1c18]/10 pl-10 hidden lg:block">
              <div className="flex flex-col gap-5 mb-6">
                {cart.map(item => (
                  <div key={item.cartId} className="flex gap-4 items-start">
                    <div className="relative w-16 h-16 bg-[#f1eee7] rounded-lg overflow-hidden shrink-0 border border-[#1c1c18]/10">
                      {item.images?.[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#5f5e5e] text-[#fcf9f3] rounded-full flex items-center justify-center text-[10px] font-bold">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-grotesk font-semibold text-xs text-[#1c1c18] uppercase tracking-wide truncate">{item.name}</p>
                      <p className="font-plex text-[11px] text-[#5f5e5e]">{item.size}{item.color ? ` · ${item.color}` : ''}</p>
                    </div>
                    <p className="font-plex text-sm text-[#1c1c18] shrink-0">₦{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#1c1c18]/10 pt-4 flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="font-plex text-sm text-[#5f5e5e]">Subtotal</span>
                  <span className="font-plex text-sm text-[#1c1c18]">₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-plex text-sm text-[#5f5e5e]">Shipping</span>
                  <span className="font-plex text-sm text-[#1c1c18]">
                    {deliveryMethod === 'pickup' ? 'FREE' : (!form.address || !form.city || !form.state ? 'Enter shipping address' : (shippingCost === 0 ? 'FREE' : `₦${shippingCost.toLocaleString()}`))}
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-t border-[#1c1c18]/10 pt-4 mt-1">
                  <span className="font-grotesk font-bold text-base text-[#1c1c18]">Total</span>
                  <div className="text-right">
                    <span className="font-plex text-[10px] text-[#5f5e5e] mr-2">NGN</span>
                    <span className="font-grotesk font-bold text-xl text-[#1c1c18]">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Order Summary (visible on small screens) */}
            <div className="lg:hidden border border-[#1c1c18]/10 rounded-lg p-5 mb-6">
              <h3 className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] mb-4">Order Summary ({cart.length})</h3>
              {cart.map(item => (
                <div key={item.cartId} className="flex gap-3 mb-3">
                  <div className="relative w-14 h-14 bg-[#f1eee7] rounded overflow-hidden shrink-0">
                    {item.images?.[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#5f5e5e] text-white rounded-full flex items-center justify-center text-[9px] font-bold">{item.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-grotesk font-semibold text-xs text-[#1c1c18] uppercase truncate">{item.name}</p>
                    <p className="font-plex text-[10px] text-[#5f5e5e]">{item.size}</p>
                  </div>
                  <p className="font-plex text-xs text-[#1c1c18]">₦{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t border-[#1c1c18]/10 pt-3 mt-3 flex justify-between items-baseline">
                <span className="font-grotesk font-bold text-sm text-[#1c1c18]">Total</span>
                <span className="font-grotesk font-bold text-lg text-[#1c1c18]">₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Payment Modal */}
      {showCryptoModal && (
        <CryptoPaymentModal
          totalNGN={grandTotal}
          onClose={() => setShowCryptoModal(false)}
          onConfirmSent={handleCryptoConfirm}
        />
      )}
    </div>
  );
}
