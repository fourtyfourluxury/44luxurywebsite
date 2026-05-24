import { useState } from 'react';

const FAQS = [
  {
    category: 'ORDERS & SHIPPING',
    items: [
      { q: 'When will my order be dispatched?', a: 'Orders are dispatched within 1–2 business days. You\'ll receive a confirmation email with tracking once your order has shipped.' },
      { q: 'How long does delivery take?', a: 'Standard delivery within Nigeria takes 3–5 business days. Lagos orders typically arrive within 2 days. International orders are dispatched within 3 business days.' },
      { q: 'Do you offer free shipping?', a: 'Yes — free standard shipping on all orders above ₦150,000. Orders below this threshold incur a flat ₦5,000 shipping fee.' },
      { q: 'Can I track my order?', a: "Absolutely. Once dispatched, you'll receive a tracking link via email. You can also check your order status in your account dashboard." },
    ],
  },
  {
    category: 'RETURNS & EXCHANGES',
    items: [
      { q: 'What is your returns policy?', a: 'We accept returns within 14 days of delivery. Items must be unworn, unwashed, and returned with original tags attached. Sale items are final sale.' },
      { q: 'How do I start a return?', a: 'Email returns@44luxury.com with your order number and reason for return. Our team will provide a prepaid return label within 48 hours.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 5–7 business days of receiving your returned item. Funds typically appear in your account within 3 business days.' },
      { q: 'Can I exchange for a different size?', a: 'Yes — for size exchanges, simply request an exchange in your return email and state your preferred size. Subject to stock availability.' },
    ],
  },
  {
    category: 'SIZING',
    items: [
      { q: 'How does 44LUXURY clothing fit?', a: '44LUXURY garments are designed with an intentional oversized, architectural silhouette. Unless stated otherwise, we recommend sizing down one size if you prefer a more fitted look.' },
      { q: 'Where can I find measurements?', a: 'Full size guides including chest, shoulder, and length measurements are available on each product page. Click "Size Guide" to open the measurement table.' },
      { q: 'Are all sizes available at all times?', a: 'Key pieces are restocked regularly. If a size is sold out, you can join the waitlist on the product page to be notified when it\'s back.' },
    ],
  },
  {
    category: 'PRODUCTS & CARE',
    items: [
      { q: 'How should I wash my 44LUXURY pieces?', a: 'Machine wash cold on a gentle cycle. Do not tumble dry — hang or lay flat to dry. Iron on low heat if needed. Do not bleach.' },
      { q: 'Are the fabrics sustainably sourced?', a: '44LUXURY prioritises premium, responsibly sourced materials. Our heavyweight cotton comes from certified suppliers. We are continuously working toward full supply chain transparency.' },
      { q: 'What does "One of 44" mean?', a: '"One of 44" denotes our most limited-edition pieces — exclusively 44 units produced worldwide. These items ship with a certificate of authenticity.' },
    ],
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category);

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Header */}
      <div className="bg-[#1c1c18] py-20 px-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">HELP & INFORMATION</p>
          <h1 className="font-unica text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3]">FAQ</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0">
            <div className="sticky top-24 flex flex-col gap-1">
              {FAQS.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`text-left px-4 py-3 font-grotesk font-bold text-[10px] uppercase tracking-widest transition-colors
                    ${activeCategory === cat.category
                      ? 'bg-[#1c1c18] text-[#fcf9f3]'
                      : 'text-[#5f5e5e] hover:text-[#1c1c18] hover:bg-[#f1eee7]'
                    }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {FAQS.filter(cat => cat.category === activeCategory).map(cat => (
              <div key={cat.category}>
                <h2 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18] mb-8">{cat.category}</h2>
                <div className="flex flex-col divide-y divide-[#1c1c18]/10">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.category}-${idx}`;
                    return (
                      <div key={key} className="py-5">
                        <button
                          onClick={() => setOpenItem(openItem === key ? null : key)}
                          className="w-full flex justify-between items-start gap-4 text-left"
                        >
                          <span className="font-grotesk font-bold text-sm text-[#1c1c18] uppercase tracking-wide leading-snug">
                            {item.q}
                          </span>
                          <span className={`text-[#5f5e5e] shrink-0 text-lg leading-none transition-transform duration-200 ${openItem === key ? 'rotate-45' : ''}`}>
                            +
                          </span>
                        </button>
                        {openItem === key && (
                          <div className="mt-4 animate-fade-in">
                            <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Still have questions */}
      <div className="bg-[#f6f3ed] py-16 px-6 text-center">
        <h3 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18] mb-4">STILL HAVE A QUESTION?</h3>
        <p className="font-plex text-sm text-[#5f5e5e] mb-8">Our team responds within 48 hours.</p>
        <a
          href="/contact"
          className="inline-block bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#4b0e1e] transition-colors"
        >
          CONTACT US
        </a>
      </div>
    </div>
  );
}
