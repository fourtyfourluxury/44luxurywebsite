import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full border-t border-matte-black/20">
      {items.map((item, index) => (
        <div key={index} className="border-b border-matte-black/20">
          <button
            className="w-full flex justify-between items-center py-6 text-left group"
            onClick={() => toggle(index)}
          >
            <span className="font-unica text-2xl uppercase tracking-tighter">
              {item.title}
            </span>
            <ChevronDown 
              className={`transform transition-transform duration-300 w-6 h-6 ${openIndex === index ? 'rotate-180' : ''}`}
            />
          </button>
          <div 
            className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'}`}
          >
            <div className="font-plex text-matte-black/80">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
