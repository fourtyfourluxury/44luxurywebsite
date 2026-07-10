export default function Terms() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-20">
      <h1 className="font-unica text-7xl uppercase tracking-tighter text-[#1c1c18] mb-12">TERMS OF SERVICE</h1>
      <div className="flex flex-col gap-10 font-plex text-sm text-[#5f5e5e] leading-relaxed">
        {[
          { title: 'Acceptance of Terms', body: 'By accessing and using the 44LUXURY website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our site.' },
          { title: 'Products & Pricing', body: 'All prices are displayed in Nigerian Naira (₦). We reserve the right to modify prices at any time. All products are subject to availability. We reserve the right to discontinue any product at any time.' },
          { title: 'Orders & Payment', body: 'Orders are confirmed once payment is successfully processed. We accept Visa, Mastercard, and bank transfers via Paystack. All orders are subject to fraud screening.' },
          { title: 'Shipping & Delivery', body: 'Delivery times are estimates and not guaranteed. 44LUXURY is not responsible for delays caused by courier services, customs, or circumstances beyond our control.' },
          { title: 'Intellectual Property', body: 'All content on this website — including images, designs, and copy — is the exclusive property of 44LUXURY and may not be reproduced without written permission.' },
        ].map(section => (
          <div key={section.title}>
            <h2 className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18] mb-3">{section.title}</h2>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
