import React from 'react';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`border-b border-matte-black focus:border-burgundy-900 px-0 py-3 w-full transition-colors text-matte-black placeholder:text-concrete ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
