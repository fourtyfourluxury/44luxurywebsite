import { useState } from 'react';
import { toast } from '../components/ui/ToastProvider';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        },
      });

      if (error) throw error;

      setSent(true);
      toast('Message sent — we\'ll respond within 48 hours', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Header */}
      <div className="bg-[#1c1c18] py-20 px-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">GET IN TOUCH</p>
          <h1 className="font-unica text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3]">CONTACT</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <h2 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18] mb-8">REACH OUT</h2>
            <div className="flex flex-col gap-8">
              {[
                { label: 'General Enquiries', value: 'hello@44luxury.com', href: 'mailto:hello@44luxury.com' },
                { label: 'Customer Support', value: 'support@44luxury.com', href: 'mailto:support@44luxury.com' },
                { label: 'Press & Media', value: 'press@44luxury.com', href: 'mailto:press@44luxury.com' },
                { label: 'Stockist Enquiries', value: 'trade@44luxury.com', href: 'mailto:trade@44luxury.com' },
              ].map(item => (
                <div key={item.label}>
                  <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-1">{item.label}</p>
                  <a href={item.href} className="font-plex text-sm text-[#1c1c18] hover:text-[#4b0e1e] transition-colors border-b border-[#1c1c18]/20 hover:border-[#4b0e1e] pb-0.5">
                    {item.value}
                  </a>
                </div>
              ))}

              <div className="border-t border-[#1c1c18]/10 pt-8 mt-2">
                <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-3">FLAGSHIP</p>
                <p className="font-plex text-sm text-[#1c1c18] leading-relaxed">
                  44 Bourdillon Road, Ikoyi<br />Lagos, Nigeria<br />Open Mon–Sat, 10am–7pm
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18] mb-8">SEND A MESSAGE</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] block mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full bg-transparent border border-[#1c1c18]/20 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] block mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full bg-transparent border border-[#1c1c18]/20 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] block mb-2">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                  className="w-full bg-transparent border border-[#1c1c18]/20 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 outline-none transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] block mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                  rows={6}
                  className="w-full bg-transparent border border-[#1c1c18]/20 focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3 outline-none transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs py-4 hover:bg-[#4b0e1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SENDING...' : sent ? '✓ MESSAGE SENT' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
