import * as React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: 'bg-[#1da1f2] text-white shadow-lg hover:bg-[#1a8cd8] active:scale-95 focus:ring-2 focus:ring-[#1da1f2] rounded-full',
      destructive: 'bg-red-500 text-white shadow-lg hover:bg-red-600 active:scale-95 focus:ring-2 focus:ring-red-500 rounded-full',
      outline: 'border border-[#1da1f2] bg-transparent text-[#1da1f2] shadow-lg hover:bg-[#1da1f2]/10 active:scale-95 focus:ring-2 focus:ring-[#1da1f2] rounded-full',
      secondary: 'bg-gray-200 text-gray-800 shadow-lg hover:bg-gray-300 active:scale-95 focus:ring-2 focus:ring-gray-400 rounded-full',
      ghost: 'hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] active:scale-95 focus:ring-2 focus:ring-[#1da1f2] rounded-full',
      link: 'text-[#1da1f2] underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-6 py-2',
      sm: 'h-8 rounded-full px-4 text-sm',
      lg: 'h-12 rounded-full px-8 text-lg',
      icon: 'h-10 w-10 p-0 rounded-full',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
