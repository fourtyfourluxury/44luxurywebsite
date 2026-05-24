export default function Privacy() {
  const sections = [
    {
      title: 'Information We Collect',
      body: "We collect information you provide directly to us — when you create an account, place an order, or contact us for support. This includes your name, email address, shipping address, and payment information (processed securely through Paystack).",
    },
    {
      title: 'How We Use Your Information',
      body: "We use the information we collect to process your orders, communicate with you about your purchases, send promotional communications (with your consent), and improve our services.",
    },
    {
      title: 'Data Security',
      body: "We implement industry-standard security measures to protect your personal information. Payment data is never stored on our servers — all transactions are processed by Paystack's PCI-DSS compliant infrastructure.",
    },
    {
      title: 'Cookies',
      body: "We use cookies to maintain your session, remember your cart, and analyse site traffic. You can control cookie settings through your browser at any time.",
    },
    {
      title: 'Contact',
      body: "For privacy-related enquiries contact us at privacy@44luxury.com. We will respond within 48 hours.",
    },
  ];

  return (
    <div className="max-w-[800px] mx-auto px-6 py-20">
      <h1 className="font-unica text-7xl uppercase tracking-tighter text-[#1c1c18] mb-12">PRIVACY POLICY</h1>
      <div className="flex flex-col gap-10">
        {sections.map(s => (
          <div key={s.title}>
            <h2 className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18] mb-3">{s.title}</h2>
            <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
