import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-full border border-[#1da1f2] bg-white dark:bg-gray-900 px-5 py-2 text-base text-[#1da1f2] shadow-lg transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-[#1da1f2]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1da1f2] focus:border-[#1da1f2] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
