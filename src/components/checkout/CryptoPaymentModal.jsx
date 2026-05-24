import { useState } from 'react';
import { X, Copy, Check, Loader2, ArrowLeft } from 'lucide-react';

// Placeholder wallet addresses — admin should update these
const CRYPTO_OPTIONS = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#F7931A',
    icon: '₿',
    wallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    rate: 0.0000063, // placeholder: 1 NGN = X BTC (update with real API later)
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    icon: 'Ξ',
    wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    rate: 0.00000042,
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    symbol: 'LTC',
    color: '#345D9D',
    icon: 'Ł',
    wallet: 'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kgmn4n9',
    rate: 0.0000083,
  },
];

export default function CryptoPaymentModal({ totalNGN, onClose, onConfirmSent }) {
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'pay' | 'checking'

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const crypto = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);
  const cryptoAmount = crypto ? (totalNGN * crypto.rate).toFixed(8) : '0';
  const qrData = crypto ? `${crypto.id}:${crypto.wallet}?amount=${cryptoAmount}` : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=fcf9f3&color=1c1c18`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#fcf9f3] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1c1c18]/10">
          <div className="flex items-center gap-3">
            {step !== 'select' && (
              <button onClick={() => { setStep('select'); setSelectedCrypto(null); }} className="text-[#5f5e5e] hover:text-[#1c1c18] transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="font-grotesk font-bold text-base text-[#1c1c18]">
              {step === 'select' ? 'Pay with Crypto' : step === 'checking' ? 'Verifying Payment' : `Pay with ${crypto?.name}`}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5f5e5e] hover:text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* ── Step 1: Select Cryptocurrency ─────────── */}
        {step === 'select' && (
          <div className="p-6">
            <p className="font-plex text-sm text-[#5f5e5e] mb-5">Select your preferred cryptocurrency</p>
            <div className="flex flex-col gap-3">
              {CRYPTO_OPTIONS.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCrypto(c.id); setStep('pay'); }}
                  className="flex items-center gap-4 p-4 border border-[#1c1c18]/10 rounded-xl hover:border-[#1c1c18]/30 hover:bg-[#f6f3ed] transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-grotesk font-bold text-sm text-[#1c1c18]">{c.name}</p>
                    <p className="font-plex text-xs text-[#5f5e5e]">{c.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-grotesk font-semibold text-xs text-[#1c1c18]">
                      ≈ {(totalNGN * c.rate).toFixed(6)} {c.symbol}
                    </p>
                    <p className="font-plex text-[10px] text-[#5f5e5e]">₦{totalNGN.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="font-plex text-[10px] text-[#5f5e5e] mt-4 text-center">
              Rates are approximate and may vary at the time of payment
            </p>
          </div>
        )}

        {/* ── Step 2: Payment Details ──────────────── */}
        {step === 'pay' && crypto && (
          <div className="p-6">
            {/* Amount */}
            <div className="bg-[#1c1c18] rounded-xl p-5 mb-5 text-center">
              <p className="font-plex text-[10px] uppercase tracking-widest text-white/40 mb-1">Amount to send</p>
              <p className="font-grotesk font-bold text-2xl text-[#D4AF37]">
                {cryptoAmount} {crypto.symbol}
              </p>
              <p className="font-plex text-xs text-white/50 mt-1">≈ ₦{totalNGN.toLocaleString()}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-5">
              <div className="bg-white p-3 rounded-xl border border-[#1c1c18]/10">
                <img
                  src={qrUrl}
                  alt={`${crypto.name} QR Code`}
                  className="w-[180px] h-[180px]"
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-5">
              <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-2">
                {crypto.name} Wallet Address
              </p>
              <div className="flex items-center gap-2 bg-[#f6f3ed] border border-[#1c1c18]/10 rounded-lg p-3">
                <p className="font-plex text-xs text-[#1c1c18] break-all flex-1 select-all">
                  {crypto.wallet}
                </p>
                <button
                  onClick={() => handleCopy(crypto.wallet)}
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-[#1c1c18] text-[#fcf9f3] hover:bg-[#2a2a26] transition-colors"
                  title="Copy address"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-[#FFF8E1] border border-[#F9A825]/20 rounded-lg p-3 mb-5">
              <p className="font-plex text-[11px] text-[#5D4037] leading-relaxed">
                <strong>Important:</strong> Send only <strong>{crypto.symbol}</strong> to this address. Sending any other cryptocurrency may result in permanent loss of funds.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('checking')}
                className="w-full py-3.5 font-grotesk font-bold uppercase tracking-widest text-xs border border-[#1c1c18]/20 text-[#1c1c18] rounded-lg hover:border-[#1c1c18] hover:bg-[#1c1c18]/5 transition-all"
              >
                Check Payment Status
              </button>
              <button
                onClick={() => onConfirmSent(crypto.id, cryptoAmount, crypto.wallet)}
                className="w-full py-3.5 font-grotesk font-bold uppercase tracking-widest text-xs bg-[#D4AF37] text-[#1c1c18] rounded-lg hover:bg-[#c9a02d] transition-colors"
              >
                I Have Sent Payment
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Checking Status ─────────────── */}
        {step === 'checking' && crypto && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-[#D4AF37] animate-spin" />
            </div>
            <h3 className="font-grotesk font-bold text-lg text-[#1c1c18] mb-2">Checking Payment Status</h3>
            <p className="font-plex text-sm text-[#5f5e5e] mb-6 leading-relaxed">
              Looking for your {crypto.name} transaction on the blockchain. This may take a few minutes depending on network confirmations.
            </p>
            <div className="bg-[#f6f3ed] rounded-xl p-4 mb-6">
              <p className="font-plex text-xs text-[#5f5e5e]">Expected amount</p>
              <p className="font-grotesk font-bold text-base text-[#1c1c18]">{cryptoAmount} {crypto.symbol}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('pay')}
                className="w-full py-3 font-grotesk font-bold uppercase tracking-widest text-xs border border-[#1c1c18]/20 text-[#5f5e5e] rounded-lg hover:text-[#1c1c18] hover:border-[#1c1c18] transition-all"
              >
                Back to Payment Details
              </button>
              <button
                onClick={() => onConfirmSent(crypto.id, cryptoAmount, crypto.wallet)}
                className="w-full py-3 font-grotesk font-bold uppercase tracking-widest text-xs bg-[#D4AF37] text-[#1c1c18] rounded-lg hover:bg-[#c9a02d] transition-colors"
              >
                I Have Sent Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
