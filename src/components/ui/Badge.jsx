import React from 'react';

const Badge = ({ children, className = '', ...props }) => {
  return (
    <span 
      className={`px-3 py-1 bg-burgundy-900 text-bone text-xs font-bold uppercase tracking-widest ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
