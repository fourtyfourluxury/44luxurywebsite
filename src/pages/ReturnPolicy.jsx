import { useState, useEffect } from 'react';
import { getPageBySlug } from '../services/pageService';

// Simple parser for standard markdown features used in our policy text
function renderMarkdown(text = '') {
  if (!text) return null;

  // Split content by paragraphs/blocks
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Check if it's a heading
    if (trimmed.startsWith('###')) {
      const headingText = trimmed.replace(/^###\s*/, '');
      return (
        <h2 key={idx} className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18] mt-8 mb-4 border-b border-[#1c1c18]/10 pb-2">
          {headingText}
        </h2>
      );
    }

    // Check if it has bullet points
    if (trimmed.startsWith('•') || trimmed.includes('\n•')) {
      const lines = trimmed.split('\n');
      return (
        <ul key={idx} className="list-none pl-0 my-4 flex flex-col gap-2.5">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^•\s*/, '').trim();
            return (
              <li key={lIdx} className="font-plex text-sm text-[#5f5e5e] flex items-start gap-2.5">
                <span className="text-[#c9a96e] text-xs mt-0.5">•</span>
                <span>{parseBold(cleanLine)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    // Default paragraph
    return (
      <p key={idx} className="font-plex text-sm text-[#5f5e5e] leading-relaxed mb-4">
        {parseBold(trimmed)}
      </p>
    );
  });
}

// Inline helper to parse **bold** text
function parseBold(text = '') {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-[#1c1c18]">{part}</strong> : part));
}

export default function ReturnPolicy() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const { data } = await getPageBySlug('return-policy');
        if (data) {
          setPage(data);
        }
      } catch (err) {
        console.error('Failed to load return policy page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fcf9f3]">
        <div className="w-8 h-8 border-2 border-[#1c1c18] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const title = page?.title || 'Returns & Exchange Policy';
  const content = page?.content || '';

  return (
    <div className="bg-[#fcf9f3] min-h-screen py-20">
      <div className="max-w-[800px] mx-auto px-6">
        <h1 className="font-unica text-5xl md:text-7xl uppercase tracking-tighter text-[#1c1c18] mb-12 border-b-2 border-[#1c1c18] pb-6">
          {title.toUpperCase()}
        </h1>
        <div className="flex flex-col gap-2">
          {renderMarkdown(content)}
        </div>
      </div>
    </div>
  );
}
