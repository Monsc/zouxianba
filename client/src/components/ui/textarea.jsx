import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-2xl border border-[#1da1f2] bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#1da1f2] shadow-lg placeholder:text-[#1da1f2]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1da1f2] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
